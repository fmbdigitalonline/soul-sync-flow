
#!/usr/bin/env python3
import os
import json
import sys
from get_facts import build_fact_json
from compose_story import generate_blueprint_narrative

def handle_request(event):
    try:
        # Parse the request body
        request_data = json.loads(event.get("body", "{}"))
        
        # Extract parameters
        name = request_data.get("full_name", "")
        birth_date = request_data.get("birth_date", "")
        birth_time = request_data.get("birth_time_local", "00:00")
        birth_location = request_data.get("birth_location", "")
        mbti = request_data.get("mbti", "")
        
        # Default model is gpt-4o-mini, but can be overridden
        model = request_data.get("model", "gpt-4o-mini")
        
        # Split location into city and country
        if "," in birth_location:
            city, country = birth_location.rsplit(",", 1)
            city = city.strip()
            country = country.strip()
        else:
            city = birth_location
            country = ""
        
        # Generate the facts
        facts = build_fact_json(name, birth_date, birth_time, city, country, mbti)
        
        # Generate the narrative
        result = generate_blueprint_narrative(facts)
        
        # Return the complete blueprint
        return {
            "statusCode": 200,
            "body": json.dumps(result)
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({
                "success": False,
                "error": str(e)
            })
        }

# Example of running this as a serverless function entry point
if __name__ == "__main__":
    # Mock event for testing
    event = {
        "body": json.dumps({
            "full_name": "Test User",
            "birth_date": "1990-01-01",
            "birth_time_local": "12:00",
            "birth_location": "New York, United States",
            "mbti": "INFJ"
        })
    }
    response = handle_request(event)
    print(json.dumps(response, indent=2))
