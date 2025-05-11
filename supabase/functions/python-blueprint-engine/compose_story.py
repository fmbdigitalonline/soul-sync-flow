
#!/usr/bin/env python3
import os, json, textwrap
import openai

# Get the OpenAI API key from environment variables
openai.api_key = os.environ.get("OPENAI_API_KEY")

SYSTEM_PROMPT = textwrap.dedent("""
    You are a reflective soul guide. The user JSON you receive is VERIFIED
    — do NOT recalculate any numerology or Human-Design numbers. Instead:
    1. Summarise each system succinctly
    2. Synthesize them into a cohesive life-blueprint
    3. Highlight strengths, shadows, and growth practices
    Use a warm, empowering tone.
""")

def generate_blueprint_narrative(facts_json):
    """Generate a narrative soul blueprint from verified facts."""
    try:
        # Call GPT-4o mini by default (more cost-effective)
        # Can be upgraded to GPT-4o or GPT-4.1 for premium users
        chat = openai.chat.completions.create(
            model="gpt-4o-mini",  # Default to cost-effective model
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": json.dumps(facts_json, indent=2)}
            ],
            temperature=0.65,
            max_tokens=3500
        )
        
        # Extract the narrative from the response
        narrative = chat.choices[0].message.content
        
        # Return both the original facts and the narrative
        return {
            "success": True,
            "facts": facts_json,
            "narrative": narrative,
            "meta": {
                "model_used": chat.model,
                "tokens_used": chat.usage.total_tokens
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "facts": facts_json
        }

if __name__ == "__main__":
    # Check if we're reading from a file or stdin
    import sys
    
    if len(sys.argv) > 1:
        with open(sys.argv[1]) as f:
            facts = json.load(f)
    else:
        facts = json.load(sys.stdin)
    
    result = generate_blueprint_narrative(facts)
    print(json.dumps(result, indent=2))
