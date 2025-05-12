
#!/usr/bin/env python3
import json
import sys
import os
import traceback
import time
import re
from datetime import datetime
from http.server import BaseHTTPRequestHandler, HTTPServer

# Import our blueprint modules
from get_facts import build_fact_json, geocode, utc_offset
from compose_story import generate_blueprint_narrative

# Global debug mode
DEBUG_MODE = True

# Setup CORS headers for all responses
CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
}

def log_debug(message, context=None):
    """Log debug information to stdout"""
    if DEBUG_MODE:
        timestamp = datetime.now().isoformat()
        log_entry = {
            "timestamp": timestamp,
            "message": message,
            "context": context or {}
        }
        print(f"DEBUG [{timestamp}]: {json.dumps(log_entry)}", file=sys.stderr, flush=True)

def serve(req):
    """Main entry point for the Edge Function"""
    try:
        # Log request details
        log_debug("Request received", {
            "method": req.get("method", "UNKNOWN"),
            "url": req.get("url", "UNKNOWN"),
            "headers": {k: v for k, v in req.get("headers", {}).items() if k.lower() != "authorization"}
        })
        
        # Handle OPTIONS requests for CORS preflight
        if req.get("method") == "OPTIONS":
            log_debug("Handling CORS preflight request")
            return {
                "status": 204,
                "headers": CORS_HEADERS,
                "body": ""
            }
        
        # Only allow POST requests for blueprint generation
        if req.get("method") != "POST":
            log_debug(f"Method not allowed: {req.get('method')}")
            return {
                "status": 405,
                "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
                "body": json.dumps({"error": "Method not allowed", "message": "Only POST method is supported"})
            }
        
        # Parse request body
        try:
            body = req.get("body", "{}")
            if isinstance(body, str):
                data = json.loads(body)
            else:
                data = body
            log_debug("Request body parsed", {"data_keys": list(data.keys())})
        except json.JSONDecodeError as e:
            log_debug(f"Invalid JSON in request body: {e}")
            return {
                "status": 400,
                "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
                "body": json.dumps({"error": "Invalid JSON", "message": str(e)})
            }
        
        # Process the request
        result = process_blueprint_request(data)
        
        # Return the response
        return {
            "status": 200,
            "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
            "body": json.dumps(result)
        }
    except Exception as e:
        # Capture full stack trace
        stack_trace = "".join(traceback.format_exception(type(e), e, e.__traceback__))
        log_debug(f"Unhandled exception in serve function: {e}", {"stack_trace": stack_trace})
        
        # Return error response
        return {
            "status": 500,
            "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
            "body": json.dumps({
                "error": "Internal Server Error",
                "message": str(e),
                "stack_trace": stack_trace if DEBUG_MODE else "Enable debug mode for stack trace"
            })
        }

def validate_input(data, key, expected_type, default=None):
    """Validate and extract a value from input data with type checking"""
    if key not in data or data[key] is None:
        return default
    
    value = data[key]
    
    # For string type, ensure it's a string and not empty
    if expected_type is str:
        if not isinstance(value, str):
            try:
                value = str(value)
            except:
                return default
        if value.strip() == "":
            return default
        return value
    
    # For other types, try to convert if possible
    if not isinstance(value, expected_type):
        try:
            return expected_type(value)
        except:
            return default
    
    return value

def process_blueprint_request(request_data):
    """Process a blueprint generation request"""
    start_time = time.time()
    log_debug("Processing blueprint request", {"request_data": request_data})
    
    try:
        # Validate request structure
        if not isinstance(request_data, dict):
            raise ValueError("Request body must be a JSON object")
        
        user_data = request_data.get('userData', {})
        log_debug("Extracted user data", {"user_data": user_data})
        
        # Extract user data with validation
        full_name = validate_input(user_data, 'full_name', str, "")
        birth_date = validate_input(user_data, 'birth_date', str, "")
        
        # Support both birth_time and birth_time_local for backwards compatibility
        birth_time = validate_input(user_data, 'birth_time_local', str, "00:00") 
        if birth_time == "00:00":  # If not found, try the alternate field name
            birth_time = validate_input(user_data, 'birth_time', str, "00:00")
        
        birth_location = validate_input(user_data, 'birth_location', str, "Unknown")
        mbti = validate_input(user_data, 'mbti', str, "")
        preferred_name = validate_input(user_data, 'preferred_name', str, full_name.split(' ')[0] if full_name else "")
        
        # Validate required fields
        if not full_name:
            raise ValueError("Missing required field: full_name")
        if not birth_date:
            raise ValueError("Missing required field: birth_date")
        
        # Validate date format
        try:
            datetime.strptime(birth_date, "%Y-%m-%d")
        except ValueError:
            raise ValueError("Invalid birth_date format. Required format: YYYY-MM-DD")
        
        # Validate time format if provided
        if birth_time and birth_time != "00:00":
            try:
                datetime.strptime(birth_time, "%H:%M")
            except ValueError:
                raise ValueError("Invalid birth_time format. Required format: HH:MM (24-hour)")
        
        # Extract location components
        location_parts = (birth_location or "Unknown").split('/')
        
        city = location_parts[0].strip() if len(location_parts) > 0 else "Unknown"
        country = location_parts[1].strip() if len(location_parts) > 1 else "Unknown"
        
        log_debug("Parsed user inputs", {
            "full_name": full_name,
            "birth_date": birth_date,
            "birth_time": birth_time,
            "city": city,
            "country": country,
            "mbti": mbti
        })
        
        # Step 1: Generate core facts
        try:
            facts = build_fact_json(full_name, birth_date, birth_time, city, country, mbti)
            log_debug("Generated core facts successfully")
        except Exception as e:
            stack_trace = "".join(traceback.format_exception(type(e), e, e.__traceback__))
            log_debug(f"Error generating facts: {e}", {"stack_trace": stack_trace})
            raise ValueError(f"Failed to calculate blueprint facts: {str(e)}")
        
        # Step 2: Calculate blueprint components
        blueprint = {
            "_meta": {
                "generation_date": datetime.now().isoformat(),
                "generation_method": "python-blueprint-engine",
                "calculation_time_ms": 0
            },
            "user_meta": {
                "full_name": full_name,
                "preferred_name": preferred_name,
                "birth_date": birth_date,
                "birth_time": birth_time,
                "birth_location": birth_location,
                "mbti": mbti
            },
            "cognition_mbti": calculate_mbti(facts),
            "archetype_western": calculate_western_astrology(facts),
            "archetype_chinese": calculate_chinese_zodiac(facts),
            "values_life_path": calculate_numerology(facts),
            "energy_strategy_human_design": calculate_human_design(facts)
        }
        
        # Calculate processing time
        end_time = time.time()
        processing_time = (end_time - start_time) * 1000  # Convert to milliseconds
        blueprint["_meta"]["calculation_time_ms"] = round(processing_time, 2)
        
        log_debug("Blueprint generation complete", {
            "processing_time_ms": blueprint["_meta"]["calculation_time_ms"],
            "key_results": {
                "life_path": blueprint["values_life_path"]["life_path_number"],
                "human_design_type": blueprint["energy_strategy_human_design"]["type"],
                "sun_sign": blueprint["archetype_western"]["sun_sign"]
            }
        })
        
        return blueprint
        
    except ValueError as e:
        # Handle validation errors
        log_debug(f"Validation error: {e}")
        return {
            "error": "Validation Error",
            "message": str(e)
        }
    except Exception as e:
        # Handle unexpected errors
        stack_trace = "".join(traceback.format_exception(type(e), e, e.__traceback__))
        log_debug(f"Unexpected error: {e}", {"stack_trace": stack_trace})
        return {
            "error": "Server Error",
            "message": f"An unexpected error occurred: {str(e)}",
            "stack_trace": stack_trace if DEBUG_MODE else "Enable debug mode for stack trace"
        }

def calculate_mbti(facts):
    """Calculate MBTI profile from facts"""
    log_debug("Calculating MBTI profile")
    
    mbti = facts.get("mbti", "").upper()
    
    # Validate MBTI format
    if not re.match(r'^[EI][NS][FT][JP]$', mbti):
        log_debug(f"Invalid MBTI format: {mbti}, using INFP as default")
        mbti = "INFP"  # Default to INFP if invalid
    
    # Extract the four dichotomies
    energy = "Extraverted" if mbti[0] == "E" else "Introverted"
    information = "Intuitive" if mbti[1] == "N" else "Sensing"
    decisions = "Thinking" if mbti[2] == "T" else "Feeling"
    lifestyle = "Judging" if mbti[3] == "J" else "Perceiving"
    
    # Determine cognitive functions (simplified)
    dom_func = ""
    aux_func = ""
    tert_func = ""
    inf_func = ""
    
    # Simple function mapping based on type
    functions_map = {
        "INFP": ["Fi", "Ne", "Si", "Te"],
        "ENFP": ["Ne", "Fi", "Te", "Si"],
        "INFJ": ["Ni", "Fe", "Ti", "Se"],
        "ENFJ": ["Fe", "Ni", "Se", "Ti"],
        "INTJ": ["Ni", "Te", "Fi", "Se"],
        "ENTJ": ["Te", "Ni", "Se", "Fi"],
        "INTP": ["Ti", "Ne", "Si", "Fe"],
        "ENTP": ["Ne", "Ti", "Fe", "Si"],
        "ISFP": ["Fi", "Se", "Ni", "Te"],
        "ESFP": ["Se", "Fi", "Te", "Ni"],
        "ISFJ": ["Si", "Fe", "Ti", "Ne"],
        "ESFJ": ["Fe", "Si", "Ne", "Ti"],
        "ISTJ": ["Si", "Te", "Fi", "Ne"],
        "ESTJ": ["Te", "Si", "Ne", "Fi"],
        "ISTP": ["Ti", "Se", "Ni", "Fe"],
        "ESTP": ["Se", "Ti", "Fe", "Ni"]
    }
    
    if mbti in functions_map:
        dom_func, aux_func, tert_func, inf_func = functions_map[mbti]
    
    # Get summary (simplified)
    summary_map = {
        "INFP": "Idealistic, creative dreamer",
        "ENFP": "Enthusiastic, creative explorer",
        "INFJ": "Insightful, principled visionary",
        "ENFJ": "Charismatic, inspirational leader",
        "INTJ": "Strategic, independent visionary",
        "ENTJ": "Decisive, strategic leader",
        "INTP": "Logical, innovative thinker",
        "ENTP": "Innovative, versatile entrepreneur",
        "ISFP": "Sensitive, artistic explorer",
        "ESFP": "Enthusiastic, spontaneous performer",
        "ISFJ": "Detailed, nurturing protector",
        "ESFJ": "Caring, social harmonizer",
        "ISTJ": "Responsible, practical organizer",
        "ESTJ": "Efficient, structured manager",
        "ISTP": "Practical, analytical problem-solver",
        "ESTP": "Energetic, adaptable doer"
    }
    
    summary = summary_map.get(mbti, "Thoughtful personality")
    
    # Strengths and challenges (simplified)
    strengths_map = {
        "INFP": ["Empathetic", "Creative", "Idealistic", "Adaptable", "Loyal"],
        "ENFP": ["Enthusiastic", "Innovative", "Supportive", "Flexible", "Charismatic"],
        # ... other types would be defined here
    }
    
    challenges_map = {
        "INFP": ["Overly idealistic", "Takes things personally", "Difficulty with criticism", "Impractical"],
        "ENFP": ["Unfocused", "Disorganized", "Overthinking", "Trouble with follow-through"],
        # ... other types would be defined here
    }
    
    strengths = strengths_map.get(mbti, ["Adaptable", "Thoughtful"])
    challenges = challenges_map.get(mbti, ["Can be stressed by uncertainty", "May need to develop more balance"])
    
    result = {
        "type": mbti,
        "summary": summary,
        "energy_style": energy,
        "information_gathering": information,
        "decision_making": decisions,
        "lifestyle_preference": lifestyle,
        "dominant_function": dom_func,
        "auxiliary_function": aux_func,
        "tertiary_function": tert_func,
        "inferior_function": inf_func,
        "strengths": strengths,
        "challenges": challenges
    }
    
    log_debug("MBTI calculation complete", {"result": result})
    return result

def calculate_numerology(facts):
    """Calculate numerology from birth facts"""
    try:
        log_debug("Calculating numerology")
        
        # Extract birth components from facts
        birth_date = facts.get("birth", {}).get("local", "")
        if not birth_date:
            raise ValueError("Missing birth date information")
        
        # Parse the date
        match = re.search(r'(\d{4})-(\d{2})-(\d{2})', birth_date)
        if not match:
            raise ValueError(f"Cannot parse birth date from {birth_date}")
            
        year = int(match.group(1))
        month = int(match.group(2))
        day = int(match.group(3))
        
        log_debug(f"Calculating life path for date: {year}-{month}-{day}")
        
        # Calculate life path number
        life_path = calculate_life_path_number(day, month, year)
        
        log_debug(f"Life path calculation result: {life_path}")
        
        # Get description based on life path
        descriptions = {
            1: "The Pioneer: Independent, innovative, leader, self-confident",
            2: "The Mediator: Cooperative, diplomatic, sensitive, peacemaker",
            3: "The Communicator: Creative, expressive, optimistic, inspiring",
            4: "The Builder: Practical, reliable, disciplined, hardworking",
            5: "The Freedom Seeker: Adaptable, versatile, adventurous, freedom-loving",
            6: "The Nurturer: Responsible, caring, compassionate, harmonious",
            7: "The Seeker: Analytical, introspective, spiritual, studious",
            8: "The Achiever: Ambitious, goal-oriented, materialistic, powerful",
            9: "The Humanitarian: Compassionate, selfless, generous, idealistic",
            11: "The Illuminator: Intuitive, inspirational, idealistic, visionary",
            22: "The Master Builder: Practical visionary, powerful, capable",
            33: "The Master Teacher: Compassionate, selfless, influential"
        }
        
        # Get strengths for each life path
        strengths_map = {
            1: ["Leadership", "Independence", "Innovation"],
            2: ["Diplomacy", "Sensitivity", "Cooperation"],
            3: ["Expression", "Creativity", "Optimism"],
            4: ["Reliability", "Hard work", "Organization"],
            5: ["Adaptability", "Resourcefulness", "Freedom"],
            6: ["Responsibility", "Nurturing", "Harmony"],
            7: ["Analysis", "Intuition", "Wisdom"],
            8: ["Ambition", "Authority", "Achievement"],
            9: ["Compassion", "Wisdom", "Selflessness"],
            11: ["Inspiration", "Vision", "Enlightenment"],
            22: ["Large-scale manifestation", "Practical vision", "Power"],
            33: ["Altruistic service", "Teaching", "Compassion"]
        }
        
        # Get challenges for each life path
        challenges_map = {
            1: ["Arrogance", "Stubbornness", "Dominance"],
            2: ["Oversensitivity", "Indecision", "Dependency"],
            3: ["Superficiality", "Scattered energy", "Criticism"],
            4: ["Rigidity", "Narrow-mindedness", "Overwork"],
            5: ["Restlessness", "Overindulgence", "Irresponsibility"],
            6: ["Self-sacrifice", "Interference", "Perfectionism"],
            7: ["Isolation", "Skepticism", "Over-analysis"],
            8: ["Workaholic", "Materialism", "Control issues"],
            9: ["Martyrdom", "Aloofness", "Emotional detachment"],
            11: ["Impracticality", "Nervous tension", "High standards"],
            22: ["Overwhelming pressure", "Overexertion", "Control"],
            33: ["Self-sacrifice", "Burnout", "Exploitation"]
        }
        
        return {
            "life_path_number": life_path,
            "description": descriptions.get(life_path, "A unique spiritual path"),
            "strengths": strengths_map.get(life_path, ["Resilience", "Uniqueness"]),
            "challenges": challenges_map.get(life_path, ["Finding balance", "Self-acceptance"])
        }
    except Exception as e:
        log_stack_trace = "".join(traceback.format_exception(type(e), e, e.__traceback__))
        log_debug(f"Error in calculate_numerology: {str(e)}", {"stack_trace": log_stack_trace})
        raise

def calculate_life_path_number(day, month, year):
    """
    Calculate life path number from birth date components
    """
    log_debug(f"Life Path Calculation - Input: day={day}, month={month}, year={year}")
    
    # Calculate sum of digits for day
    day_sum = sum(int(digit) for digit in str(day))
    log_debug(f"Day {day} sum: {day_sum}")
    
    # Calculate sum of digits for month
    month_sum = sum(int(digit) for digit in str(month))
    log_debug(f"Month {month} sum: {month_sum}")
    
    # Calculate sum of digits for year
    year_sum = sum(int(digit) for digit in str(year))
    log_debug(f"Year {year} sum: {year_sum}")
    
    # Sum the three components
    total = day_sum + month_sum + year_sum
    log_debug(f"Initial sum: {total}")
    
    # Keep reducing unless it's a single digit or a master number (11, 22, 33)
    while total > 9 and total not in (11, 22, 33):
        total = sum(int(digit) for digit in str(total))
        log_debug(f"Reduced to: {total}")
    
    return total

def calculate_western_astrology(facts):
    """Calculate Western astrology from facts"""
    try:
        log_debug("Calculating Western astrology")
        
        # Extract western astrology data from facts
        western = facts.get("western", {})
        sun_sign = western.get("sun_sign", "Aries")
        sun_deg = western.get("sun_deg", 0)
        moon_sign = western.get("moon_sign", "Taurus")
        moon_deg = western.get("moon_deg", 0)
        ascendant_sign = western.get("ascendant_sign", "Gemini")
        asc_deg = western.get("asc_deg", 0)
        
        log_debug(f"Sun: {sun_sign} {sun_deg}°, Moon: {moon_sign} {moon_deg}°, Asc: {ascendant_sign} {asc_deg}°")
        
        # Get sign descriptions
        sign_descriptions = {
            'Aries': {
                'sun': 'Independent Pioneer',
                'moon': 'Emotionally Brave',
                'rising': 'Dynamic Presence'
            },
            'Taurus': {
                'sun': 'Steady Builder',
                'moon': 'Security-Seeking',
                'rising': 'Steady Appearance'
            },
            'Gemini': {
                'sun': 'Versatile Communicator',
                'moon': 'Emotionally Adaptable',
                'rising': 'Quick-Minded Presence'
            },
            'Cancer': {
                'sun': 'Nurturing Protector',
                'moon': 'Emotionally Sensitive',
                'rising': 'Caring Demeanor'
            },
            'Leo': {
                'sun': 'Creative Leader',
                'moon': 'Emotionally Expressive',
                'rising': 'Charismatic Presence'
            },
            'Virgo': {
                'sun': 'Practical Analyst',
                'moon': 'Emotionally Precise',
                'rising': 'Detail-Oriented Appearance'
            },
            'Libra': {
                'sun': 'Harmonious Mediator',
                'moon': 'Emotionally Balanced',
                'rising': 'Graceful Demeanor'
            },
            'Scorpio': {
                'sun': 'Intense Transformer',
                'moon': 'Emotionally Profound',
                'rising': 'Magnetic Presence'
            },
            'Sagittarius': {
                'sun': 'Adventurous Explorer',
                'moon': 'Emotionally Optimistic',
                'rising': 'Free-Spirited Appearance'
            },
            'Capricorn': {
                'sun': 'Ambitious Achiever',
                'moon': 'Emotionally Disciplined',
                'rising': 'Authoritative Presence'
            },
            'Aquarius': {
                'sun': 'Innovative Humanitarian',
                'moon': 'Emotionally Detached',
                'rising': 'Unique Appearance'
            },
            'Pisces': {
                'sun': 'Compassionate Dreamer',
                'moon': 'Emotionally Intuitive',
                'rising': 'Ethereal Presence'
            }
        }
        
        # Default values if the sign or position is not found
        sun_description = sign_descriptions.get(sun_sign, {}).get('sun', 'Unique Individual')
        moon_description = sign_descriptions.get(moon_sign, {}).get('moon', 'Emotional Nature')
        rising_description = sign_descriptions.get(ascendant_sign, {}).get('rising', 'Personal Presentation')
        
        # Get the element for each sign
        element_map = {
            'Aries': 'Fire',
            'Leo': 'Fire',
            'Sagittarius': 'Fire',
            'Taurus': 'Earth',
            'Virgo': 'Earth',
            'Capricorn': 'Earth',
            'Gemini': 'Air',
            'Libra': 'Air',
            'Aquarius': 'Air',
            'Cancer': 'Water',
            'Scorpio': 'Water',
            'Pisces': 'Water'
        }
        
        sun_element = element_map.get(sun_sign, 'Unknown')
        moon_element = element_map.get(moon_sign, 'Unknown')
        rising_element = element_map.get(ascendant_sign, 'Unknown')
        
        # Get modality for each sign
        modality_map = {
            'Aries': 'Cardinal',
            'Cancer': 'Cardinal',
            'Libra': 'Cardinal',
            'Capricorn': 'Cardinal',
            'Taurus': 'Fixed',
            'Leo': 'Fixed',
            'Scorpio': 'Fixed',
            'Aquarius': 'Fixed',
            'Gemini': 'Mutable',
            'Virgo': 'Mutable',
            'Sagittarius': 'Mutable',
            'Pisces': 'Mutable'
        }
        
        sun_modality = modality_map.get(sun_sign, 'Unknown')
        
        # Build the result
        result = {
            "sun_sign": f"{sun_sign} ({sun_element})",
            "sun_description": sun_description,
            "sun_element": sun_element,
            "sun_modality": sun_modality,
            "sun_degree": sun_deg,
            
            "moon_sign": f"{moon_sign} ({moon_element})",
            "moon_description": moon_description,
            "moon_element": moon_element,
            "moon_degree": moon_deg,
            
            "ascendant_sign": f"{ascendant_sign} ({rising_element})",
            "ascendant_description": rising_description,
            "ascendant_element": rising_element,
            "ascendant_degree": asc_deg,
            
            "dominant_elements": get_dominant_elements(sun_element, moon_element, rising_element),
            "dominant_modalities": get_dominant_modalities(sun_sign, moon_sign, ascendant_sign)
        }
        
        log_debug("Western astrology calculation complete")
        return result
    except Exception as e:
        log_stack_trace = "".join(traceback.format_exception(type(e), e, e.__traceback__))
        log_debug(f"Error in calculate_western_astrology: {str(e)}", {"stack_trace": log_stack_trace})
        raise

def get_dominant_elements(sun_element, moon_element, rising_element):
    """Get dominant elements based on sun, moon, and rising signs"""
    elements = [sun_element, moon_element, rising_element]
    element_counts = {
        'Fire': elements.count('Fire'),
        'Earth': elements.count('Earth'),
        'Air': elements.count('Air'),
        'Water': elements.count('Water')
    }
    
    # Get elements with count > 0, sorted by count (descending)
    dominant_elements = [e for e, count in sorted(element_counts.items(), 
                                                 key=lambda x: x[1], 
                                                 reverse=True) 
                        if count > 0]
    
    return dominant_elements

def get_dominant_modalities(sun_sign, moon_sign, rising_sign):
    """Get dominant modalities based on sun, moon, and rising signs"""
    modality_map = {
        'Aries': 'Cardinal',
        'Cancer': 'Cardinal',
        'Libra': 'Cardinal',
        'Capricorn': 'Cardinal',
        'Taurus': 'Fixed',
        'Leo': 'Fixed',
        'Scorpio': 'Fixed',
        'Aquarius': 'Fixed',
        'Gemini': 'Mutable',
        'Virgo': 'Mutable',
        'Sagittarius': 'Mutable',
        'Pisces': 'Mutable'
    }
    
    signs = [sun_sign, moon_sign, rising_sign]
    modalities = [modality_map.get(sign, 'Unknown') for sign in signs]
    
    modality_counts = {
        'Cardinal': modalities.count('Cardinal'),
        'Fixed': modalities.count('Fixed'),
        'Mutable': modalities.count('Mutable')
    }
    
    # Get modalities with count > 0, sorted by count (descending)
    dominant_modalities = [m for m, count in sorted(modality_counts.items(), 
                                                   key=lambda x: x[1], 
                                                   reverse=True) 
                          if count > 0]
    
    return dominant_modalities

def calculate_human_design(facts):
    """Calculate Human Design from facts"""
    try:
        log_debug("Calculating Human Design")
        
        # Extract Human Design data from facts
        hd_data = facts.get("human_design", {})
        hd_type = hd_data.get("type", "Generator")
        authority = hd_data.get("authority", "Emotional")
        profile = hd_data.get("profile", "3/5")
        strategy = hd_data.get("strategy", "Wait to respond")
        definition = hd_data.get("definition", "Split")
        channels = hd_data.get("channels", [])
        gates = hd_data.get("gates", [])
        
        log_debug(f"HD core data: Type={hd_type}, Authority={authority}, Profile={profile}")
        
        # Get human design type description
        type_descriptions = {
            "Manifestor": "Initiators who act independently",
            "Generator": "Life force builders who respond to life",
            "Manifesting Generator": "Multi-faceted fast builders",
            "Projector": "Guides who see others clearly",
            "Reflector": "Mirrors of community health"
        }
        
        # Get strategy description based on type
        strategy_descriptions = {
            "Manifestor": "Inform before acting to reduce resistance",
            "Generator": "Wait to respond to what lights you up",
            "Manifesting Generator": "Wait to respond, then act quickly",
            "Projector": "Wait for recognition and invitation",
            "Reflector": "Wait a full moon cycle (28 days) before decisions"
        }
        
        # Get not-self theme based on type
        not_self_themes = {
            "Manifestor": "Anger when not initiating or being controlled",
            "Generator": "Frustration when not doing what brings satisfaction",
            "Manifesting Generator": "Frustration and anger when not following passion",
            "Projector": "Bitterness when not recognized for gifts",
            "Reflector": "Disappointment when not aligned with community"
        }
        
        # Get authority descriptions
        authority_descriptions = {
            "Emotional": "Wait for emotional clarity over time",
            "Sacral": "Listen to your gut response",
            "Splenic": "Trust immediate intuition",
            "Ego": "Listen to heart and will",
            "Self": "Wait for lunar cycle",
            "Environmental": "Need correct environment",
            "Mental": "Rationalize decisions"
        }
        
        # Build detailed result
        result = {
            "type": hd_type,
            "type_description": type_descriptions.get(hd_type, "Unique energy type"),
            "profile": profile,
            "authority": authority,
            "authority_description": authority_descriptions.get(authority, "Your inner guidance system"),
            "strategy": get_hd_strategy(hd_type),
            "strategy_description": strategy_descriptions.get(hd_type, "Follow your unique strategy"),
            "definition": definition,
            "not_self_theme": not_self_themes.get(hd_type, "Resistance to natural flow"),
            "channels": channels[:5] if channels else [],  # Limit to first 5
            "gates": gates[:8] if gates else []  # Limit to first 8
        }
        
        log_debug("Human Design calculation complete")
        return result
    except Exception as e:
        log_stack_trace = "".join(traceback.format_exception(type(e), e, e.__traceback__))
        log_debug(f"Error in calculate_human_design: {str(e)}", {"stack_trace": log_stack_trace})
        raise

def get_hd_strategy(hd_type):
    """Get strategy based on Human Design type"""
    strategies = {
        "Manifestor": "Inform before acting",
        "Generator": "Wait to respond",
        "Manifesting Generator": "Wait to respond, then act quickly",
        "Projector": "Wait for invitation",
        "Reflector": "Wait a full lunar cycle (28 days)"
    }
    return strategies.get(hd_type, "Follow your unique strategy")

def calculate_chinese_zodiac(facts):
    """Calculate Chinese Zodiac from facts"""
    try:
        log_debug("Calculating Chinese Zodiac")
        
        # Extract birth year from facts
        birth_date = facts.get("birth", {}).get("local", "")
        if not birth_date:
            raise ValueError("Missing birth date information")
        
        # Parse the year
        match = re.search(r'(\d{4})', birth_date)
        if not match:
            raise ValueError(f"Cannot parse birth year from {birth_date}")
            
        year = int(match.group(1))
        log_debug(f"Calculating Chinese zodiac for year: {year}")
        
        # Determine animal sign
        animals = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake",
                   "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"]
        animal = animals[(year - 4) % 12]
        
        # Determine element
        elements = ["Wood", "Wood", "Fire", "Fire", "Earth", "Earth",
                    "Metal", "Metal", "Water", "Water"]
        element = elements[(year - 4) % 10]
        
        # Determine yin/yang
        yin_yang = "Yang" if year % 2 == 0 else "Yin"
        
        # Get animal traits
        animal_traits = {
            "Rat": ["Adaptable", "Intelligent", "Alert", "Quick-witted"],
            "Ox": ["Diligent", "Reliable", "Strong", "Determined"],
            "Tiger": ["Brave", "Confident", "Competitive", "Unpredictable"],
            "Rabbit": ["Gentle", "Sensitive", "Compassionate", "Amiable"],
            "Dragon": ["Energetic", "Charismatic", "Confident", "Inspirational"],
            "Snake": ["Wise", "Intuitive", "Private", "Enigmatic"],
            "Horse": ["Energetic", "Independent", "Sociable", "Impatient"],
            "Goat": ["Gentle", "Compassionate", "Creative", "Thoughtful"],
            "Monkey": ["Smart", "Curious", "Playful", "Versatile"],
            "Rooster": ["Observant", "Practical", "Organized", "Confident"],
            "Dog": ["Loyal", "Honest", "Responsible", "Vigilant"],
            "Pig": ["Compassionate", "Generous", "Diligent", "Focused"]
        }
        
        # Get element traits
        element_traits = {
            "Wood": ["Growth", "Vitality", "Flexibility", "Idealistic"],
            "Fire": ["Passion", "Leadership", "Adventure", "Dynamic"],
            "Earth": ["Stability", "Reliability", "Nurturing", "Practical"],
            "Metal": ["Determination", "Self-reliance", "Structure", "Precise"],
            "Water": ["Adaptability", "Intuition", "Depth", "Persuasive"]
        }
        
        # Build the result
        result = {
            "animal": animal,
            "element": element,
            "yin_yang": yin_yang,
            "full_sign": f"{element} {animal}",
            "personality_traits": animal_traits.get(animal, ["Adaptable"]),
            "element_traits": element_traits.get(element, ["Balanced"]),
            "polarity": "Active, expressive" if yin_yang == "Yang" else "Receptive, introspective",
            "lucky_colors": get_lucky_colors(animal),
            "compatible_with": get_compatible_signs(animal),
            "least_compatible": get_incompatible_signs(animal)
        }
        
        log_debug("Chinese Zodiac calculation complete")
        return result
    except Exception as e:
        log_stack_trace = "".join(traceback.format_exception(type(e), e, e.__traceback__))
        log_debug(f"Error in calculate_chinese_zodiac: {str(e)}", {"stack_trace": log_stack_trace})
        raise

def get_lucky_colors(animal):
    """Get lucky colors for a Chinese zodiac animal"""
    colors = {
        "Rat": ["Blue", "Gold", "Green"],
        "Ox": ["Yellow", "Green", "White"],
        "Tiger": ["Blue", "Gray", "Orange"],
        "Rabbit": ["Pink", "Red", "Purple", "Blue"],
        "Dragon": ["Gold", "Silver", "Gray"],
        "Snake": ["Black", "Red", "Yellow"],
        "Horse": ["Green", "Yellow", "Brown"],
        "Goat": ["Brown", "Red", "Purple"],
        "Monkey": ["White", "Blue", "Gold"],
        "Rooster": ["Gold", "Brown", "Yellow"],
        "Dog": ["Green", "Red", "Purple"],
        "Pig": ["Yellow", "Gray", "Brown", "Gold"]
    }
    return colors.get(animal, ["Green", "Blue"])

def get_compatible_signs(animal):
    """Get compatible signs for a Chinese zodiac animal"""
    compatible = {
        "Rat": ["Dragon", "Monkey", "Ox"],
        "Ox": ["Rat", "Snake", "Rooster"],
        "Tiger": ["Horse", "Dog", "Pig"],
        "Rabbit": ["Goat", "Pig", "Dog"],
        "Dragon": ["Rat", "Monkey", "Rooster"],
        "Snake": ["Ox", "Rooster"],
        "Horse": ["Tiger", "Dog", "Goat"],
        "Goat": ["Rabbit", "Horse", "Pig"],
        "Monkey": ["Rat", "Dragon"],
        "Rooster": ["Ox", "Snake", "Dragon"],
        "Dog": ["Tiger", "Rabbit", "Horse"],
        "Pig": ["Tiger", "Rabbit", "Goat"]
    }
    return compatible.get(animal, ["Balanced with many signs"])

def get_incompatible_signs(animal):
    """Get incompatible signs for a Chinese zodiac animal"""
    incompatible = {
        "Rat": ["Horse", "Rabbit"],
        "Ox": ["Goat", "Horse", "Dog"],
        "Tiger": ["Monkey", "Snake"],
        "Rabbit": ["Rat", "Rooster"],
        "Dragon": ["Dog", "Rabbit", "Rat"],
        "Snake": ["Tiger", "Pig"],
        "Horse": ["Rat", "Ox"],
        "Goat": ["Ox", "Dog"],
        "Monkey": ["Tiger", "Pig"],
        "Rooster": ["Rabbit", "Dog"],
        "Dog": ["Ox", "Dragon", "Rooster"],
        "Pig": ["Snake", "Monkey"]
    }
    return incompatible.get(animal, ["Few true incompatibilities"])
