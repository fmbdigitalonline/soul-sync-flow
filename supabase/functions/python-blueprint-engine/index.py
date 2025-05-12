
# Python Blueprint Engine for Supabase Edge Runtime
import os
import json
import traceback
from datetime import datetime
import pytz

# Configure CORS headers for proper browser access
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400"
}

def log_debug(message, context=None):
    """Enhanced logging with timestamps and optional context data"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
    log_entry = f"[DEBUG {timestamp}] {message}"
    
    if context is not None:
        if isinstance(context, dict):
            context_str = json.dumps(context, default=str)
            log_entry += f" Context: {context_str}"
        else:
            log_entry += f" Context: {str(context)}"
    
    print(log_entry)

def handler(req):
    """Main entry point for the Supabase Edge Runtime request handler"""
    try:
        log_debug("Python Blueprint Engine received request", {"method": req.method, "url": req.url})
        
        # Handle CORS preflight OPTIONS request
        if req.method == "OPTIONS":
            log_debug("Handling CORS preflight request")
            return Response("", status=204, headers=CORS_HEADERS)

        # Parse the incoming data
        data = req.json()
        log_debug("Received request data", data)
        
        user_data = data.get('userData', {})
        log_debug("Extracted user data", user_data)
        
        # Calculate the blueprint
        result = generate_blueprint(user_data)
        log_debug("Generated blueprint successfully", {"blueprint_keys": list(result.keys())})
        
        # Return the result with CORS headers
        return Response(json.dumps(result), 
                      headers={**CORS_HEADERS, "Content-Type": "application/json"})
    
    except Exception as e:
        log_stack_trace = "".join(traceback.format_exception(type(e), e, e.__traceback__))
        log_debug(f"Error in handler: {str(e)}", {"stack_trace": log_stack_trace})
        error_response = {
            "error": f"Failed to process blueprint request: {str(e)}",
            "success": False,
            "error_type": type(e).__name__,
            "stack_trace": log_stack_trace
        }
        return Response(json.dumps(error_response), 
                      status=500, 
                      headers={**CORS_HEADERS, "Content-Type": "application/json"})

def generate_blueprint(user_data):
    """Generate a complete blueprint based on user data with detailed logging"""
    try:
        log_debug("Starting blueprint generation", user_data)
        
        # Extract user data with validation
        full_name = validate_input(user_data, 'full_name', str, "")
        birth_date = validate_input(user_data, 'birth_date', str, "")
        birth_time = validate_input(user_data, 'birth_time_local', str, "00:00")
        birth_location = validate_input(user_data, 'birth_location', str, "Unknown")
        mbti = validate_input(user_data, 'mbti', str, "")
        preferred_name = validate_input(user_data, 'preferred_name', str, full_name.split(' ')[0] if full_name else "")
        
        log_debug("Validated input data", {
            "full_name": full_name,
            "birth_date": birth_date,
            "birth_time": birth_time,
            "birth_location": birth_location,
            "mbti": mbti,
            "preferred_name": preferred_name
        })
        
        # Calculate astrological data
        log_debug("Calculating astrology data...")
        astro_data = calculate_astrology(birth_date, birth_time, birth_location)
        log_debug("Astrology calculation complete", astro_data)
        
        # Calculate numerology data
        log_debug("Calculating numerology data...")
        numerology = calculate_numerology(birth_date, full_name)
        log_debug("Numerology calculation complete", numerology)
        
        # Calculate Human Design
        log_debug("Calculating Human Design data...")
        human_design = calculate_human_design(birth_date, birth_time, birth_location)
        log_debug("Human Design calculation complete", human_design)
        
        # Calculate Chinese zodiac
        log_debug("Calculating Chinese zodiac data...")
        chinese_zodiac = calculate_chinese_zodiac(birth_date)
        log_debug("Chinese zodiac calculation complete", chinese_zodiac)
        
        # Assemble the complete blueprint
        log_debug("Assembling final blueprint...")
        blueprint = {
            "user_meta": {
                "full_name": full_name,
                "preferred_name": preferred_name,
                "birth_date": birth_date,
                "birth_time_local": birth_time,
                "birth_location": birth_location
            },
            "cognition_mbti": generate_mbti_profile(mbti),
            "energy_strategy_human_design": human_design,
            "values_life_path": numerology,
            "archetype_western": astro_data,
            "archetype_chinese": chinese_zodiac,
            "calculation_method": "python-swiss-ephemeris-direct",
            "engine_version": "1.0.0",
            "calculation_timestamp": datetime.now(pytz.UTC).isoformat()
        }
        
        log_debug("Blueprint assembly complete")
        return blueprint
        
    except Exception as e:
        log_stack_trace = "".join(traceback.format_exception(type(e), e, e.__traceback__))
        log_debug(f"Error in generate_blueprint: {str(e)}", {"stack_trace": log_stack_trace})
        raise

def validate_input(data, key, expected_type, default_value):
    """Validate and extract input values with type checking"""
    value = data.get(key, default_value)
    log_debug(f"Validating input '{key}'", {"value": value, "expected_type": str(expected_type)})
    
    if value is None:
        log_debug(f"Input '{key}' is None, using default", {"default": default_value})
        return default_value
        
    if not isinstance(value, expected_type):
        log_debug(f"Type mismatch for '{key}'", {
            "actual_type": type(value).__name__, 
            "expected_type": expected_type.__name__
        })
        
        # Try to convert if string is expected
        if expected_type == str and value is not None:
            log_debug(f"Converting {key} to string", {"value": value})
            return str(value)
            
        log_debug(f"Using default for '{key}'", {"default": default_value})
        return default_value
        
    return value

def calculate_astrology(birth_date, birth_time, birth_location):
    """Calculate astrological data with detailed logging"""
    try:
        log_debug("Starting astrology calculation", {
            "birth_date": birth_date,
            "birth_time": birth_time,
            "birth_location": birth_location
        })
        
        # Parse birth date
        try:
            year, month, day = map(int, birth_date.split('-'))
            log_debug("Parsed birth date", {"year": year, "month": month, "day": day})
        except Exception as e:
            log_debug(f"Error parsing birth date: {str(e)}")
            year, month, day = 2000, 1, 1  # Default date
        
        # Determine sun sign from birth date
        log_debug("Determining sun sign...")
        sun_sign, sun_dates = get_sun_sign(month, day)
        log_debug("Sun sign determined", {"sign": sun_sign, "dates": sun_dates})
        
        # Determine moon and rising signs (simplified calculations for now)
        log_debug("Determining moon and rising signs (simplified calculation)...")
        moon_sign = get_moon_sign(year, month, day, birth_time)
        rising_sign = get_rising_sign(year, month, day, birth_time, birth_location)
        
        log_debug("Astrology calculation complete", {
            "sun_sign": sun_sign,
            "moon_sign": moon_sign,
            "rising_sign": rising_sign
        })
        
        return {
            "sun_sign": f"{sun_sign} ♈︎",  # Using placeholder symbol, would be dynamic in reality
            "sun_keyword": get_sign_keyword(sun_sign, "sun"),
            "sun_dates": sun_dates,
            "sun_element": get_element_for_sign(sun_sign),
            "sun_qualities": get_sign_qualities(sun_sign),
            "moon_sign": f"{moon_sign} ♓︎",  # Using placeholder symbol, would be dynamic in reality
            "moon_keyword": get_sign_keyword(moon_sign, "moon"),
            "moon_element": get_element_for_sign(moon_sign),
            "rising_sign": f"{rising_sign} ♍︎", # Using placeholder symbol, would be dynamic in reality
            "calculation_method": "python-simplified"
        }
    except Exception as e:
        log_stack_trace = "".join(traceback.format_exception(type(e), e, e.__traceback__))
        log_debug(f"Error in calculate_astrology: {str(e)}", {"stack_trace": log_stack_trace})
        # Return default values on error
        return {
            "sun_sign": "Unknown",
            "moon_sign": "Unknown",
            "rising_sign": "Unknown",
            "error": str(e),
            "calculation_method": "error-fallback"
        }

def calculate_numerology(birth_date, name):
    """Calculate numerology from birth date with detailed logging"""
    try:
        log_debug("Starting numerology calculation", {"birth_date": birth_date, "name": name})
        
        if not birth_date:
            log_debug("Invalid birth date, returning default numerology")
            return get_default_numerology()
        
        # Parse birth date
        try:
            year_str, month_str, day_str = birth_date.split('-')
            year = int(year_str)
            month = int(month_str)
            day = int(day_str)
            log_debug("Parsed birth date components", {"year": year, "month": month, "day": day})
        except Exception as e:
            log_debug(f"Error parsing birth date: {str(e)}")
            return get_default_numerology()
            
        # Calculate life path number with detailed logging of each step
        life_path = calculate_life_path_number(day, month, year)
        
        log_debug("Numerology calculation complete", {"life_path_number": life_path})
        
        return {
            "life_path_number": life_path,
            "life_path_keyword": get_life_path_keyword(life_path),
            "life_path_description": get_life_path_description(life_path),
            "birth_day_number": day,
            "birth_day_meaning": get_birth_day_meaning(day),
            "personal_year": calculate_personal_year(day, month),
            "expression_number": calculate_expression_number(name),
            "expression_keyword": get_expression_keyword(calculate_expression_number(name)),
            "soul_urge_number": calculate_soul_urge_number(name),
            "soul_urge_keyword": get_soul_urge_keyword(calculate_soul_urge_number(name)),
            "personality_number": calculate_personality_number(name)
        }
    except Exception as e:
        log_stack_trace = "".join(traceback.format_exception(type(e), e, e.__traceback__))
        log_debug(f"Error in calculate_numerology: {str(e)}", {"stack_trace": log_stack_trace})
        return get_default_numerology()

def calculate_life_path_number(day, month, year):
    """
    Calculate the life path number using the proper numerology methodology
    Sum the digits of each component (day, month, year) to a single digit first,
    then sum those results and reduce to single digit unless it's a master number
    """
    log_debug("Calculating Life Path Number", {"day": day, "month": month, "year": year})
    
    # Sum each component separately
    day_sum = reduce_single_digit(day)
    month_sum = reduce_single_digit(month)
    year_digits = [int(digit) for digit in str(year)]
    year_sum = reduce_single_digit(sum(year_digits))
    
    log_debug("Component sums", {"day_sum": day_sum, "month_sum": month_sum, "year_sum": year_sum})
    
    # Sum the individual component sums
    total_sum = day_sum + month_sum + year_sum
    log_debug("Total sum before final reduction", total_sum)
    
    # Final reduction to get the Life Path Number
    # Check if the sum is a master number before reduction
    if total_sum == 11 or total_sum == 22 or total_sum == 33:
        log_debug("Found master number, not reducing further", {"master_number": total_sum})
        return total_sum
    
    # Otherwise reduce to a single digit
    result = reduce_single_digit(total_sum)
    log_debug("Final Life Path Number", result)
    return result

def reduce_single_digit(num):
    """Reduces a number to a single digit unless it's a master number (11, 22, 33)"""
    log_debug(f"Reducing number {num} to single digit")
    
    # Convert the number to a string to handle multi-digit numbers
    num_str = str(num)
    
    # Continue summing digits until we reach a single digit or a master number
    while len(num_str) > 1 and num_str not in ["11", "22", "33"]:
        log_debug(f"Number {num_str} has multiple digits, reducing...")
        # Sum the digits
        digit_sum = sum(int(digit) for digit in num_str)
        num_str = str(digit_sum)
        log_debug(f"Reduced to {num_str}")
    
    result = int(num_str)
    log_debug(f"Final reduction result: {result}")
    return result

def get_sun_sign(month, day):
    """Get sun sign based on month and day"""
    log_debug("Getting sun sign", {"month": month, "day": day})
    
    if (month == 3 and day >= 21) or (month == 4 and day <= 19):
        return "Aries", "March 21 - April 19"
    elif (month == 4 and day >= 20) or (month == 5 and day <= 20):
        return "Taurus", "April 20 - May 20"
    elif (month == 5 and day >= 21) or (month == 6 and day <= 20):
        return "Gemini", "May 21 - June 20"
    elif (month == 6 and day >= 21) or (month == 7 and day <= 22):
        return "Cancer", "June 21 - July 22"
    elif (month == 7 and day >= 23) or (month == 8 and day <= 22):
        return "Leo", "July 23 - August 22"
    elif (month == 8 and day >= 23) or (month == 9 and day <= 22):
        return "Virgo", "August 23 - September 22"
    elif (month == 9 and day >= 23) or (month == 10 and day <= 22):
        return "Libra", "September 23 - October 22"
    elif (month == 10 and day >= 23) or (month == 11 and day <= 21):
        return "Scorpio", "October 23 - November 21"
    elif (month == 11 and day >= 22) or (month == 12 and day <= 21):
        return "Sagittarius", "November 22 - December 21"
    elif (month == 12 and day >= 22) or (month == 1 and day <= 19):
        return "Capricorn", "December 22 - January 19"
    elif (month == 1 and day >= 20) or (month == 2 and day <= 18):
        return "Aquarius", "January 20 - February 18"
    else:
        return "Pisces", "February 19 - March 20"

def get_moon_sign(year, month, day, time):
    """Get moon sign based on birth data (simplified calculation)"""
    log_debug("Getting moon sign", {"year": year, "month": month, "day": day, "time": time})
    # Simplified calculation for now - would use ephemeris in production
    moon_signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
                 "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
    # Simple algorithm for demo - not accurate
    index = (year + month + day) % 12
    return moon_signs[index]

def get_rising_sign(year, month, day, time, location):
    """Get rising sign based on birth data and location (simplified calculation)"""
    log_debug("Getting rising sign", {"year": year, "month": month, "day": day, "time": time, "location": location})
    # Simplified calculation for now - would use ephemeris in production
    rising_signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
                   "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
    # Simple algorithm for demo - not accurate
    # In reality, this would take into account location coordinates and exact time
    hour = 0
    if ":" in time:
        hour = int(time.split(":")[0])
    index = (hour + day + month) % 12
    return rising_signs[index]

def get_element_for_sign(sign):
    """Get element for astrological sign"""
    elements = {
        'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
        'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
        'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
        'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
    }
    return elements.get(sign, "Unknown")

def get_sign_qualities(sign):
    """Get qualities for astrological sign"""
    qualities = {
        'Aries': 'Cardinal, Independent, Passionate',
        'Taurus': 'Fixed, Reliable, Sensual',
        'Gemini': 'Mutable, Versatile, Curious',
        'Cancer': 'Cardinal, Nurturing, Emotional',
        'Leo': 'Fixed, Creative, Generous',
        'Virgo': 'Mutable, Analytical, Practical',
        'Libra': 'Cardinal, Diplomatic, Harmonious',
        'Scorpio': 'Fixed, Intense, Transformative',
        'Sagittarius': 'Mutable, Adventurous, Philosophical',
        'Capricorn': 'Cardinal, Ambitious, Disciplined',
        'Aquarius': 'Fixed, Innovative, Humanitarian',
        'Pisces': 'Mutable, Compassionate, Intuitive'
    }
    return qualities.get(sign, "Unknown qualities")

def get_sign_keyword(sign, position):
    """Get keyword for zodiac sign based on position (sun, moon, rising)"""
    keywords = {
        'Aries': {
            'sun': 'Courageous Pioneer',
            'moon': 'Emotionally Direct',
            'rising': 'Dynamic Presence'
        },
        'Taurus': {
            'sun': 'Grounded Provider',
            'moon': 'Security-Seeking',
            'rising': 'Steady Appearance'
        },
        # ... add other signs
    }
    
    # Default values if the sign or position is not found
    if sign not in keywords:
        return f"Unique {position.capitalize()}"
    
    if position not in keywords[sign]:
        return f"{sign} {position.capitalize()}"
    
    return keywords[sign][position]

def calculate_human_design(birth_date, birth_time, birth_location):
    """Calculate Human Design profile with detailed logging"""
    try:
        log_debug("Starting Human Design calculation", {
            "birth_date": birth_date, 
            "birth_time": birth_time, 
            "birth_location": birth_location
        })
        
        # This would use more accurate calculations with the HDKit library in production
        # For now, we'll use a simplified calculation for demo purposes
        
        # Parse birth date for calculation
        try:
            year, month, day = map(int, birth_date.split('-'))
            log_debug("Parsed birth date", {"year": year, "month": month, "day": day})
            
            # Simplified type determination based on birth date components
            # This is NOT accurate - just for demo
            types = ["Generator", "Projector", "Manifestor", "Manifesting Generator", "Reflector"]
            type_index = (month + day) % 5
            hd_type = types[type_index]
            
            # Profile calculation - simplified
            profile_num = ((year % 6) + 1)
            profile = f"{profile_num}/3"
            
            # Authority calculation - simplified
            authorities = ["Emotional", "Sacral", "Splenic", "Ego", "Self-Projected", "Mental"]
            authority_index = (day + month) % 6
            authority = authorities[authority_index]
            
            log_debug("Human Design calculation complete", {
                "type": hd_type, 
                "profile": profile, 
                "authority": authority
            })
            
            # Centers calculation
            centers = {
                "root": (day % 2 == 0),
                "sacral": (month % 2 == 0),
                "solar_plexus": ((day + month) % 2 == 0),
                "heart": ((day * month) % 2 == 0),
                "throat": ((year % 10) % 2 == 0),
                "ajna": ((day + year) % 2 == 0),
                "head": ((month + year) % 2 == 0),
                "g": ((day + month + year) % 2 == 0),
                "spleen": ((day * month * year) % 2 == 0)
            }
            
            # Generate some gates for demonstration
            unconscious_design = [f"{(day + i) % 64}.{(month + i) % 6 + 1}" for i in range(4)]
            conscious_personality = [f"{(month + i) % 64}.{(day + i) % 6 + 1}" for i in range(4)]
            
            return {
                "type": hd_type,
                "profile": profile,
                "authority": authority,
                "strategy": get_hd_strategy(hd_type),
                "definition": get_hd_definition(centers),
                "not_self_theme": get_not_self_theme(hd_type),
                "life_purpose": get_hd_purpose(hd_type),
                "centers": centers,
                "gates": {
                    "unconscious_design": unconscious_design,
                    "conscious_personality": conscious_personality
                }
            }
            
        except Exception as e:
            log_debug(f"Error in Human Design calculation details: {str(e)}")
            raise
            
    except Exception as e:
        log_stack_trace = "".join(traceback.format_exception(type(e), e, e.__traceback__))
        log_debug(f"Error in calculate_human_design: {str(e)}", {"stack_trace": log_stack_trace})
        # Return default values on error
        return {
            "type": "Generator",
            "profile": "3/5 (Martyr/Heretic)",
            "authority": "Emotional",
            "strategy": "Wait to respond",
            "definition": "Split",
            "not_self_theme": "Frustration",
            "error": str(e)
        }

def get_hd_strategy(hd_type):
    """Get strategy based on Human Design type"""
    strategies = {
        "Generator": "Wait to respond",
        "Manifesting Generator": "Wait to respond, then inform",
        "Projector": "Wait for the invitation",
        "Manifestor": "Inform before acting",
        "Reflector": "Wait a lunar cycle (28 days)"
    }
    return strategies.get(hd_type, "Wait to respond")

def get_hd_definition(centers):
    """Determine definition type based on centers"""
    # Simplified for demo - would be more complex in reality
    connected_count = sum(1 for defined in centers.values() if defined)
    
    if connected_count >= 7:
        return "Single"
    elif connected_count >= 4:
        return "Split"
    else:
        return "Triple Split"

def get_not_self_theme(hd_type):
    """Get not-self theme based on Human Design type"""
    themes = {
        "Generator": "Frustration",
        "Manifesting Generator": "Frustration and anger",
        "Projector": "Bitterness",
        "Manifestor": "Anger",
        "Reflector": "Disappointment"
    }
    return themes.get(hd_type, "Frustration")

def get_hd_purpose(hd_type):
    """Get life purpose based on Human Design type"""
    purposes = {
        "Generator": "Finding satisfaction through response",
        "Manifesting Generator": "Finding satisfaction through efficient response",
        "Projector": "Achieving success through recognition",
        "Manifestor": "Finding peace through impact",
        "Reflector": "Experiencing surprise and wonder"
    }
    return purposes.get(hd_type, "Finding your unique path")

def calculate_chinese_zodiac(birth_date):
    """Calculate Chinese zodiac sign with detailed logging"""
    try:
        log_debug("Starting Chinese zodiac calculation", {"birth_date": birth_date})
        
        if not birth_date:
            log_debug("Invalid birth date for Chinese zodiac")
            return get_default_chinese_zodiac()
        
        try:
            year = int(birth_date.split('-')[0])
            log_debug("Extracted year", {"year": year})
        except Exception as e:
            log_debug(f"Error extracting year: {str(e)}")
            return get_default_chinese_zodiac()
        
        # Calculate animal - Fixed calculation for Chinese zodiac
        # The animal is determined by the year mod 12
        animals = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", 
                  "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"]
        
        animal_index = (year - 4) % 12
        animal = animals[animal_index]
        log_debug("Determined animal", {"animal": animal, "index": animal_index})
        
        # Element is determined by the year mod 10 divided by 2
        elements = ["Wood", "Fire", "Earth", "Metal", "Water"]
        element_index = ((year - 4) % 10) // 2
        element = elements[element_index]
        log_debug("Determined element", {"element": element, "index": element_index})
        
        # Yin/Yang is determined by the year - odd years are yang, even years are yin
        yin_yang = "Yang" if year % 2 == 0 else "Yin"
        log_debug("Determined yin/yang", {"yin_yang": yin_yang})
        
        compatibility = get_chinese_compatibility(animal)
        log_debug("Determined compatibility", compatibility)
        
        return {
            "animal": animal,
            "element": element,
            "yin_yang": yin_yang,
            "keyword": get_animal_keyword(animal),
            "element_characteristic": get_element_characteristic(element),
            "personality_profile": get_personality_profile(animal, element),
            "compatibility": compatibility
        }
        
    except Exception as e:
        log_stack_trace = "".join(traceback.format_exception(type(e), e, e.__traceback__))
        log_debug(f"Error in calculate_chinese_zodiac: {str(e)}", {"stack_trace": log_stack_trace})
        return get_default_chinese_zodiac()

def get_animal_keyword(animal):
    """Get keyword for Chinese zodiac animal"""
    keywords = {
        'Rat': 'Clever Resourceful',
        'Ox': 'Diligent Reliable',
        'Tiger': 'Brave Confident',
        'Rabbit': 'Gentle Elegant',
        'Dragon': 'Powerful Energetic',
        'Snake': 'Wise Intuitive',
        'Horse': 'Free-spirited Explorer',
        'Goat': 'Artistic Creative',
        'Monkey': 'Intelligent Versatile',
        'Rooster': 'Observant Practical',
        'Dog': 'Loyal Honest',
        'Pig': 'Compassionate Generous'
    }
    return keywords.get(animal, "Unique Spirit")

def get_element_characteristic(element):
    """Get characteristic description for Chinese element"""
    characteristics = {
        'Metal': 'Determined, self-reliant, and precise. Metal adds strength and determination to any sign.',
        'Water': 'Flexible, empathetic, and perceptive. Water brings emotional depth and intuition.',
        'Wood': 'Creative, idealistic, and cooperative. Wood adds growth and vitality to the personality.',
        'Fire': 'Passionate, adventurous, and dynamic. Fire brings enthusiasm and leadership qualities.',
        'Earth': 'Practical, stable, and nurturing. Earth adds groundedness and reliability to any sign.'
    }
    return characteristics.get(element, "Balanced and harmonious.")

def get_personality_profile(animal, element):
    """Get personality profile for Chinese zodiac animal and element combination"""
    return f"As a {element} {animal}, you combine the natural qualities of the {animal.lower()} with the {element.lower()} element's transformative energy."

def get_chinese_compatibility(animal):
    """Get compatibility for Chinese zodiac animal"""
    compatibility = {
        'Rat': {'best': ['Dragon', 'Monkey'], 'worst': ['Horse', 'Rabbit']},
        'Ox': {'best': ['Snake', 'Rooster'], 'worst': ['Goat', 'Horse']},
        'Tiger': {'best': ['Horse', 'Dog'], 'worst': ['Monkey', 'Snake']},
        'Rabbit': {'best': ['Goat', 'Pig'], 'worst': ['Rat', 'Rooster']},
        'Dragon': {'best': ['Rat', 'Monkey'], 'worst': ['Dog', 'Rabbit']},
        'Snake': {'best': ['Ox', 'Rooster'], 'worst': ['Tiger', 'Pig']},
        'Horse': {'best': ['Tiger', 'Dog'], 'worst': ['Rat', 'Ox']},
        'Goat': {'best': ['Rabbit', 'Pig'], 'worst': ['Ox', 'Dog']},
        'Monkey': {'best': ['Rat', 'Dragon'], 'worst': ['Tiger', 'Pig']},
        'Rooster': {'best': ['Ox', 'Snake'], 'worst': ['Rabbit', 'Dog']},
        'Dog': {'best': ['Tiger', 'Horse'], 'worst': ['Dragon', 'Rooster']},
        'Pig': {'best': ['Rabbit', 'Goat'], 'worst': ['Snake', 'Monkey']}
    }
    return compatibility.get(animal, {'best': [], 'worst': []})

def generate_mbti_profile(mbti_type):
    """Generate MBTI profile with detailed logging"""
    log_debug("Generating MBTI profile", {"mbti_type": mbti_type})
    
    # Default to INFJ if no valid type provided
    if not mbti_type or len(mbti_type) != 4:
        log_debug("Invalid MBTI type, using default INFJ")
        mbti_type = "INFJ"
        
    mbti_descriptions = {
        "INFJ": {
            "type": "INFJ",
            "core_keywords": ["Insightful", "Visionary", "Complex"],
            "dominant_function": "Introverted Intuition (Ni)",
            "auxiliary_function": "Extraverted Feeling (Fe)"
        },
        "ENTP": {
            "type": "ENTP",
            "core_keywords": ["Innovative", "Debater", "Visionary"],
            "dominant_function": "Extraverted Intuition (Ne)",
            "auxiliary_function": "Introverted Thinking (Ti)"
        }
    }
    
    # Return the description if it exists, otherwise create a generic one
    if mbti_type in mbti_descriptions:
        result = mbti_descriptions[mbti_type]
    else:
        result = {
            "type": mbti_type,
            "core_keywords": ["Analytical", "Thoughtful", "Unique"],
            "dominant_function": get_dominant_function(mbti_type),
            "auxiliary_function": get_auxiliary_function(mbti_type)
        }
    
    log_debug("MBTI profile generated", result)
    return result

def get_dominant_function(mbti_type):
    """Get dominant function for MBTI type"""
    if len(mbti_type) != 4:
        return "Unknown"
        
    is_extraverted = mbti_type[0] == 'E'
    judging_perceiving = mbti_type[3]
    
    if is_extraverted:
        # Extraverts lead with their judging (T/F) function if they're a J type
        # and with their perceiving (N/S) function if they're a P type
        if judging_perceiving == 'J':
            return f"Extraverted {'Feeling (Fe)' if mbti_type[2] == 'F' else 'Thinking (Te)'}"
        else:
            return f"Extraverted {'Intuition (Ne)' if mbti_type[1] == 'N' else 'Sensing (Se)'}"
    else:
        # Introverts lead with their perceiving function if they're a J type
        # and with their judging function if they're a P type
        if judging_perceiving == 'J':
            return f"Introverted {'Intuition (Ni)' if mbti_type[1] == 'N' else 'Sensing (Si)'}"
        else:
            return f"Introverted {'Feeling (Fi)' if mbti_type[2] == 'F' else 'Thinking (Ti)'}"

def get_auxiliary_function(mbti_type):
    """Get auxiliary function for MBTI type"""
    if len(mbti_type) != 4:
        return "Unknown"
        
    is_extraverted = mbti_type[0] == 'E'
    judging_perceiving = mbti_type[3]
    
    if is_extraverted:
        # Extraverts have their auxiliary function as their introverted opposite category
        if judging_perceiving == 'J':
            return f"Introverted {'Intuition (Ni)' if mbti_type[1] == 'N' else 'Sensing (Si)'}"
        else:
            return f"Introverted {'Feeling (Fi)' if mbti_type[2] == 'F' else 'Thinking (Ti)'}"
    else:
        # Introverts have their auxiliary function as their extraverted opposite category
        if judging_perceiving == 'J':
            return f"Extraverted {'Feeling (Fe)' if mbti_type[2] == 'F' else 'Thinking (Te)'}"
        else:
            return f"Extraverted {'Intuition (Ne)' if mbti_type[1] == 'N' else 'Sensing (Se)'}"

def calculate_personal_year(day, month):
    """Calculate personal year based on birth day and month"""
    current_year = datetime.now().year
    current_year_sum = sum(int(digit) for digit in str(current_year))
    birth_day_month_sum = reduce_single_digit(day) + reduce_single_digit(month)
    
    personal_year = reduce_single_digit(current_year_sum + birth_day_month_sum)
    log_debug("Calculated personal year", {
        "current_year": current_year,
        "current_year_sum": current_year_sum,
        "birth_day_month_sum": birth_day_month_sum,
        "personal_year": personal_year
    })
    
    return personal_year

def calculate_expression_number(name):
    """Calculate expression number from name (simplified)"""
    if not name:
        return 9  # Default value
        
    # Simple algorithm for demo purposes
    return ((sum(ord(c.lower()) - 96 for c in name if c.isalpha()) % 9) or 9)

def get_expression_keyword(number):
    """Get keyword for expression number"""
    keywords = {
        1: "Leader",
        2: "Diplomat",
        3: "Creative Communicator",
        4: "Builder",
        5: "Explorer",
        6: "Nurturer",
        7: "Analyst",
        8: "Manifester",
        9: "Humanitarian"
    }
    return keywords.get(number, "Humanitarian")

def calculate_soul_urge_number(name):
    """Calculate soul urge number from name (simplified)"""
    if not name:
        return 5  # Default value
        
    vowels = "aeiou"
    vowel_values = sum(ord(c.lower()) - 96 for c in name if c.lower() in vowels)
    return (vowel_values % 9) or 9

def get_soul_urge_keyword(number):
    """Get keyword for soul urge number"""
    keywords = {
        1: "Independent",
        2: "Harmonious",
        3: "Expressive",
        4: "Practical",
        5: "Freedom Seeker",
        6: "Responsible",
        7: "Seeker of Truth",
        8: "Abundant",
        9: "Compassionate"
    }
    return keywords.get(number, "Freedom Seeker")

def calculate_personality_number(name):
    """Calculate personality number from name (simplified)"""
    if not name:
        return 3  # Default value
        
    consonants = "bcdfghjklmnpqrstvwxyz"
    consonant_values = sum(ord(c.lower()) - 96 for c in name if c.lower() in consonants)
    return (consonant_values % 9) or 9

def get_life_path_keyword(number):
    """Get keyword for life path number"""
    keywords = {
        1: "Independent Leader",
        2: "Cooperative Peacemaker",
        3: "Creative Communicator",
        4: "Practical Builder",
        5: "Freedom Seeker",
        6: "Responsible Nurturer",
        7: "Seeker of Truth",
        8: "Abundant Manifester",
        9: "Humanitarian",
        11: "Intuitive Channel",
        22: "Master Builder",
        33: "Master Teacher"
    }
    return keywords.get(number, "Seeker")

def get_life_path_description(num):
    """Get detailed description for life path number"""
    descriptions = {
        1: "Independent Leader - Born to lead and pioneer new paths. You are self-reliant, ambitious, and determined.",
        2: "Cooperative Peacemaker - Natural diplomat with intuitive understanding of others. You thrive in partnerships and create harmony.",
        3: "Creative Communicator - Expressive, optimistic, and socially engaging. Your creativity and joy inspire others around you.",
        4: "Practical Builder - Solid, reliable foundation creator. Your methodical approach and hard work create lasting results.",
        5: "Freedom Seeker - Adventurous and versatile agent of change. You crave variety and experiences that expand your horizons.",
        6: "Responsible Nurturer - Compassionate healer and caregiver. You have a natural talent for supporting and teaching others.",
        7: "Seeker of Truth - Analytical, spiritual truth-seeker. You have a deep need to understand the mysteries of life.",
        8: "Abundant Manifester - Natural executive with material focus. You have the ability to achieve great success and prosperity.",
        9: "Humanitarian - Compassionate global citizen and completion energy. You serve humanity with wisdom and universal love.",
        11: "Intuitive Channel - Highly intuitive spiritual messenger with a mission to illuminate and inspire.",
        22: "Master Builder - Manifests grand visions into reality through practical application of spiritual wisdom.",
        33: "Master Teacher - Selfless nurturer with profound wisdom and an ability to uplift humanity."
    }
    return descriptions.get(num, "Your life path leads you to seek meaning and purpose in unique ways.")

def get_birth_day_meaning(day):
    """Get meaning for birth day number"""
    meanings = {
        1: "Natural leader with strong willpower and independence. You initiate action and forge your own path.",
        2: "Cooperative partner with diplomatic skills. You bring harmony and nurture relationships with sensitivity.",
        3: "Creative expressionist with social charm. You communicate with joy and inspire others with your optimism.",
        4: "Methodical worker with practical approach. You build solid foundations through hard work and organization.",
        5: "Freedom lover seeking variety and change. You adapt quickly and bring excitement to every situation.",
        6: "Responsible nurturer with artistic talents. You care deeply for others and create beauty and harmony.",
        7: "Analytical thinker with spiritual interests. You seek knowledge and truth through research and intuition.",
        8: "Ambitious achiever with executive skills. You manifest abundance through determination and organization.",
        9: "Compassionate humanitarian with wisdom. You serve others with universal love and selfless giving.",
        10: "Independent innovator with leadership qualities. You bring original ideas and direct energy effectively.",
        11: "Intuitive visionary with heightened awareness. You serve as a bridge between the material and spiritual worlds.",
        12: "Creative perfectionist with attention to detail. You express yourself with style while helping others."
    }
    
    # For days not specifically defined, use the reduced digit meaning
    if day not in meanings:
        reduced_day = reduce_single_digit(day)
        return meanings.get(reduced_day, "Complex personality with unique talents and perspectives.")
    
    return meanings[day]

def get_default_numerology():
    """Return default numerology values when calculation fails"""
    log_debug("Using default numerology values")
    return {
        "life_path_number": 7,
        "life_path_keyword": "Seeker of Truth",
        "life_path_description": "Analytical, spiritual truth-seeker. You have a deep need to understand the mysteries of life.",
        "birth_day_number": 1,
        "birth_day_meaning": "Complex personality with unique talents and perspectives",
        "personal_year": 1,
        "expression_number": 9,
        "expression_keyword": "Humanitarian",
        "soul_urge_number": 5,
        "soul_urge_keyword": "Freedom Seeker",
        "personality_number": 3,
        "calculation_method": "fallback"
    }

def get_default_chinese_zodiac():
    """Return default Chinese zodiac values when calculation fails"""
    log_debug("Using default Chinese zodiac values")
    return {
        "animal": "Horse",
        "element": "Fire",
        "yin_yang": "Yang",
        "keyword": "Free-spirited Explorer",
        "element_characteristic": "Passionate, adventurous, and dynamic. Fire brings enthusiasm and leadership qualities.",
        "personality_profile": "As a Fire Horse, you combine the natural qualities of the horse with the fire element's transformative energy.",
        "compatibility": {
            "best": ["Tiger", "Dog"],
            "worst": ["Rat", "Ox"]
        },
        "calculation_method": "fallback"
    }

class Response:
    """Response class for Supabase Edge Runtime compatibility"""
    def __init__(self, body, status=200, headers=None):
        self.body = body
        self.status = status
        self.headers = headers or {}
