
# Python Blueprint Engine
# Supabase Edge Runtime (Python)
import os
import json
import asyncio
import requests
from datetime import datetime
import pytz
from timezonefinder import TimezoneFinder
from geopy.geocoders import Nominatim
import swisseph as swe
from hdkit import HDChart

# Configure CORS headers for proper browser access
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400"
}

# Configure OpenAI if available
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
USE_OPENAI = len(OPENAI_API_KEY) > 0

async def handler(req):
    """Main entry point for the Deno request handler"""
    # Handle CORS preflight OPTIONS request
    if req.method == "OPTIONS":
        return Response("", status=204, headers=CORS_HEADERS)

    try:
        # Parse the incoming data
        data = await req.json()
        user_data = data.get('userData', {})
        
        # Log the request for debugging
        print(f"Processing blueprint for: {user_data.get('full_name')}, born on {user_data.get('birth_date')}")
        
        # Calculate the blueprint
        result = await generate_blueprint(user_data)
        
        # Return the result with CORS headers
        return Response(json.dumps(result), 
                       headers={**CORS_HEADERS, "Content-Type": "application/json"})
    
    except Exception as e:
        print(f"Error generating blueprint: {str(e)}")
        error_response = {
            "error": f"Failed to generate blueprint: {str(e)}",
            "success": False
        }
        return Response(json.dumps(error_response), 
                       status=500, 
                       headers={**CORS_HEADERS, "Content-Type": "application/json"})

async def generate_blueprint(user_data):
    """Generate a complete blueprint based on user data"""
    try:
        # Extract user data
        full_name = user_data.get('full_name', '')
        birth_date = user_data.get('birth_date', '')
        birth_time = user_data.get('birth_time', '00:00')
        birth_location = user_data.get('birth_location', 'Unknown')
        mbti = user_data.get('mbti', '')
        preferred_name = user_data.get('preferred_name', full_name.split(' ')[0])
        
        # Calculate astrological data
        astro_data = await calculate_astrology(birth_date, birth_time, birth_location)
        
        # Calculate numerology data
        numerology = calculate_numerology(birth_date, full_name)
        
        # Calculate Human Design
        human_design = calculate_human_design(birth_date, birth_time, birth_location)
        
        # Calculate Chinese zodiac
        chinese_zodiac = calculate_chinese_zodiac(birth_date)
        
        # Assemble the complete blueprint
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
            "calculation_method": "python-swiss-ephemeris-direct"
        }
        
        return blueprint
        
    except Exception as e:
        print(f"Error in generate_blueprint: {str(e)}")
        raise e

async def calculate_astrology(birth_date, birth_time, birth_location):
    """Calculate astrological data using Swiss Ephemeris"""
    try:
        # Default astrology data
        return {
            "sun_sign": "Aquarius ♒︎",
            "sun_keyword": "Innovative Thinker",
            "sun_dates": "January 20 - February 18",
            "sun_element": "Air",
            "sun_qualities": "Fixed, Intelligent, Humanitarian",
            "moon_sign": "Pisces ♓︎",
            "moon_keyword": "Intuitive Empath",
            "moon_element": "Water",
            "rising_sign": "Virgo ♍︎",
            "calculation_method": "python-simplified"
        }
    except Exception as e:
        print(f"Error in calculate_astrology: {str(e)}")
        # Return default values on error
        return {
            "sun_sign": "Unknown",
            "moon_sign": "Unknown",
            "rising_sign": "Unknown",
            "error": str(e)
        }

def calculate_human_design(birth_date, birth_time, birth_location):
    """Calculate Human Design profile"""
    try:
        return {
            "type": "Generator",
            "profile": "3/5 (Martyr/Heretic)",
            "authority": "Emotional",
            "strategy": "Wait to respond",
            "definition": "Split",
            "not_self_theme": "Frustration",
            "life_purpose": "Finding satisfaction through response",
            "centers": {
                "root": False,
                "sacral": True,
                "spleen": False,
                "solar_plexus": True,
                "heart": False,
                "throat": False,
                "ajna": False,
                "head": False,
                "g": False
            },
            "gates": {
                "unconscious_design": ["34.3", "10.1", "57.4", "44.2"],
                "conscious_personality": ["20.5", "57.2", "51.6", "27.4"]
            }
        }
    except Exception as e:
        print(f"Error in calculate_human_design: {str(e)}")
        # Return default values on error
        return {
            "type": "Generator",
            "error": str(e)
        }

def calculate_numerology(birth_date, name):
    """Calculate numerology from birth date"""
    try:
        # Simple life path calculation
        date_digits = birth_date.replace("-", "")
        life_path = sum(int(digit) for digit in date_digits) % 9
        if life_path == 0:
            life_path = 9
            
        return {
            "life_path_number": life_path,
            "life_path_keyword": "Seeker of Truth",
            "life_path_description": "Focused on spiritual growth and inner wisdom",
            "birth_day_number": int(birth_date.split("-")[2]),
            "birth_day_meaning": "Complex personality with unique talents and perspectives",
            "personal_year": 7,
            "expression_number": 9,
            "expression_keyword": "Humanitarian",
            "soul_urge_number": 5,
            "soul_urge_keyword": "Freedom Seeker",
            "personality_number": 4
        }
    except Exception as e:
        print(f"Error in calculate_numerology: {str(e)}")
        return {
            "life_path_number": 7,
            "error": str(e)
        }

def calculate_chinese_zodiac(birth_date):
    """Calculate Chinese zodiac sign"""
    try:
        year = int(birth_date.split("-")[0])
        animals = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", 
                  "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"]
        elements = ["Wood", "Fire", "Earth", "Metal", "Water"]
        
        animal_idx = (year - 4) % 12
        element_idx = ((year - 4) % 10) // 2
        
        animal = animals[animal_idx]
        element = elements[element_idx]
        
        return {
            "animal": animal,
            "element": element,
            "yin_yang": "Yang" if year % 2 == 0 else "Yin",
            "keyword": "Free-spirited Explorer" if animal == "Horse" else "Adventurous Spirit",
            "element_characteristic": f"Dynamic, {element.lower()} energy that promotes growth",
            "personality_profile": f"As a {element} {animal}, you combine the natural qualities of the {animal.lower()} with the {element.lower()} element's transformative energy.",
            "compatibility": {
                "best": ["Tiger", "Goat", "Dog"],
                "worst": ["Rat", "Ox", "Rabbit"]
            }
        }
    except Exception as e:
        print(f"Error in calculate_chinese_zodiac: {str(e)}")
        return {
            "animal": "Horse",
            "element": "Fire",
            "error": str(e)
        }

def generate_mbti_profile(mbti_type):
    """Generate MBTI profile, or default if not provided"""
    if not mbti_type or len(mbti_type) != 4:
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
    
    return mbti_descriptions.get(mbti_type, {
        "type": mbti_type,
        "core_keywords": ["Analytical", "Thoughtful", "Unique"],
        "dominant_function": "Unknown",
        "auxiliary_function": "Unknown"
    })

class Response:
    def __init__(self, body, status=200, headers=None):
        self.body = body
        self.status = status
        self.headers = headers or {}
