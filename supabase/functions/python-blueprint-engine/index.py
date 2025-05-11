
#!/usr/bin/env python3
import os
import json
import sys
from http.server import BaseHTTPRequestHandler
from .get_facts import build_fact_json
from .compose_story import generate_blueprint_narrative

# Define CORS headers with proper configuration for preview and production
cors_headers = {
    'Access-Control-Allow-Origin': '*',  # For production, use specific origins
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400'  # Cache preflight response for 24 hours
}

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        # Handle OPTIONS preflight request properly with 200 status
        self.send_response(200)
        for key, value in cors_headers.items():
            self.send_header(key, value)
        self.end_headers()
        
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            request_body = self.rfile.read(content_length).decode('utf-8')
            request_data = json.loads(request_body)
            
            # Extract parameters
            name = request_data.get("full_name", "")
            birth_date = request_data.get("birth_date", "")
            birth_time = request_data.get("birth_time_local", "00:00")
            birth_location = request_data.get("birth_location", "")
            mbti = request_data.get("mbti", "")
            
            # Allow model selection with GPT-4.1 as an option
            model = request_data.get("model", "gpt-4.1-2025-04-14")
            
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
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            # Add CORS headers to POST response
            for key, value in cors_headers.items():
                self.send_header(key, value)
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            error_message = {
                "success": False,
                "error": str(e),
                "traceback": str(sys.exc_info())
            }
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            # Add CORS headers even to error responses
            for key, value in cors_headers.items():
                self.send_header(key, value)
            self.end_headers()
            self.wfile.write(json.dumps(error_message).encode())

# Function for use with Supabase Edge Functions runtime
async def handler(request):
    # Handle OPTIONS preflight request with 204 No Content status
    if request.method == "OPTIONS":
        return Response("", status=204, headers=cors_headers)
    
    try:
        # Parse request data
        data = await request.json()
        
        # Extract parameters
        name = data.get("full_name", "")
        birth_date = data.get("birth_date", "")
        birth_time = data.get("birth_time_local", "00:00")
        birth_location = data.get("birth_location", "")
        mbti = data.get("mbti", "")
        
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
        
        # Return success response with CORS headers
        headers = {**cors_headers, "Content-Type": "application/json"}
        return Response(json.dumps(result), headers=headers)
    
    except Exception as e:
        # Return error response with CORS headers
        error_message = {
            "success": False,
            "error": str(e),
            "traceback": str(sys.exc_info())
        }
        headers = {**cors_headers, "Content-Type": "application/json"}
        return Response(json.dumps(error_message), status=500, headers=headers)

def handle_request(event):
    try:
        # Check if this is a preflight OPTIONS request
        if event.get('method', '').upper() == 'OPTIONS':
            return {
                "statusCode": 204,
                "headers": cors_headers,
                "body": ""
            }
            
        # Parse the request body
        request_data = json.loads(event.get("body", "{}"))
        
        # Extract parameters
        name = request_data.get("full_name", "")
        birth_date = request_data.get("birth_date", "")
        birth_time = request_data.get("birth_time_local", "00:00")
        birth_location = request_data.get("birth_location", "")
        mbti = request_data.get("mbti", "")
        
        # Allow model selection with GPT-4.1 as an option
        model = request_data.get("model", "gpt-4.1-2025-04-14")
        
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
            "headers": {
                "Content-Type": "application/json",
                **cors_headers
            },
            "body": json.dumps(result)
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                **cors_headers
            },
            "body": json.dumps({
                "success": False,
                "error": str(e),
                "traceback": str(sys.exc_info())
            })
        }

# For the Supabase Edge Runtime format
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs

class Response:
    def __init__(self, body, status=200, headers=None):
        self.body = body
        self.status = status
        self.headers = headers or {}

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
