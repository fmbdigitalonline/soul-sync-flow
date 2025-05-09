
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Edge function to generate comprehensive soul blueprints using GPT-4o-search-preview
 * This leverages the model's ability to search the web for accurate birth chart data
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { birthData } = await req.json();
    const { date, time, location, name } = birthData;
    
    console.log(`Processing blueprint for: ${name}, born on ${date} at ${time} in ${location}`);

    if (!OPENAI_API_KEY) {
      throw new Error("Missing OpenAI API key");
    }

    // Generate the blueprint using OpenAI with search capabilities
    const { blueprint, rawResponse } = await generateSearchBasedBlueprint(birthData);
    
    // Return the generated blueprint
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: blueprint,
        rawResponse: rawResponse
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
    
  } catch (error) {
    console.error("Error generating blueprint:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to generate blueprint" 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

/**
 * Generate a search-based blueprint using OpenAI's GPT-4o-search-preview
 * @param birthData The user's birth information
 * @returns A complete blueprint object with detailed insights from web-verified data
 */
async function generateSearchBasedBlueprint(birthData) {
  const { date, time, location, name } = birthData;
  
  try {
    console.log("Calling OpenAI with GPT-4o-search-preview model...");
    
    // Format the date in a more readable format for the AI
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Construct the system message
    const systemMessage = `You are an expert astrologer, numerologist, Human Design reader, 
    Chinese metaphysics interpreter, and personality psychologist. 
    Based on user input, generate a complete and structured life profile. 
    Use web search if any data is needed (e.g., planetary positions, time zone adjustments, current ephemeris).
    Return your response as a well-structured JSON object following the schema specified later.`;
    
    // Construct the user message with all birth details
    const userMessage = `Name: ${name}
    Birthdate: ${formattedDate}
    Birth Time: ${time}
    Location: ${location}
    
    Generate a full profile including:
    - Western astrology (sun, moon, rising, aspects)
    - Numerology (life path, expression number)
    - Chinese zodiac (animal, element)
    - Human Design (type, profile, authority, definition, gates)
    - MBTI and personality analysis
    
    Structure your output in this exact JSON format:
    {
      "user_meta": {
        "full_name": "${name}",
        "preferred_name": "${name.split(' ')[0]}",
        "birth_date": "${date}",
        "birth_time_local": "${time}",
        "birth_location": "${location}"
      },
      "cognition_mbti": {
        "type": "XXXX",
        "core_keywords": ["Keyword1", "Keyword2", "Keyword3"],
        "dominant_function": "Function description",
        "auxiliary_function": "Function description"
      },
      "energy_strategy_human_design": {
        "type": "Type name",
        "profile": "X/X (Name/Name)",
        "authority": "Authority name",
        "strategy": "Strategy description",
        "definition": "Definition type",
        "not_self_theme": "Theme description",
        "life_purpose": "Purpose description",
        "centers": {
          "root": true/false,
          "sacral": true/false,
          "spleen": true/false,
          "solar_plexus": true/false,
          "heart": true/false,
          "throat": true/false,
          "ajna": true/false,
          "head": true/false,
          "g": true/false
        },
        "gates": {
          "unconscious_design": ["XX.X", "XX.X", "XX.X"],
          "conscious_personality": ["XX.X", "XX.X", "XX.X"]
        }
      },
      "archetype_western": {
        "sun_sign": "Sign ♈︎",
        "sun_keyword": "Keyword",
        "sun_dates": "Month Day - Month Day",
        "sun_element": "Element",
        "sun_qualities": "Quality1, Quality2",
        "moon_sign": "Sign ♈︎",
        "moon_keyword": "Keyword",
        "moon_element": "Element",
        "rising_sign": "Sign ♈︎",
        "aspects": [
          {
            "planet": "Planet1",
            "aspect": "Aspect type",
            "planet2": "Planet2",
            "orb": "X°"
          }
        ],
        "houses": {
          "1": {"sign": "Sign", "house": "1st House"},
          "2": {"sign": "Sign", "house": "2nd House"}
        }
      },
      "archetype_chinese": {
        "animal": "Animal",
        "element": "Element",
        "yin_yang": "Yin/Yang",
        "keyword": "Keyword",
        "element_characteristic": "Characteristic description",
        "personality_profile": "Detailed personality profile",
        "compatibility": {
          "best": ["Animal1", "Animal2", "Animal3"],
          "worst": ["Animal1", "Animal2", "Animal3"]
        }
      },
      "values_life_path": {
        "life_path_number": X,
        "life_path_keyword": "Keyword",
        "life_path_description": "Detailed description of life path purpose",
        "birth_day_number": XX,
        "birth_day_meaning": "Meaning for the birth day number",
        "personal_year": XXXX,
        "expression_number": X,
        "expression_keyword": "Keyword",
        "soul_urge_number": X,
        "soul_urge_keyword": "Keyword",
        "personality_number": X
      }
    }`;

    // Call OpenAI with search capabilities enabled
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-search-preview',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        tools: "auto",
        tool_choice: "auto",
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" }, // Enforce JSON response
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    console.log("Received structured JSON from OpenAI with web search results");
    
    // Parse and validate the generated content
    const parsedBlueprint = JSON.parse(generatedContent);
    
    // Add metadata for internal use
    parsedBlueprint._meta = {
      generation_method: "gpt-4o-search",
      model_version: "gpt-4o-search-preview",
      generation_date: new Date().toISOString(),
      birth_data: birthData,
      schema_version: "2.0",
      raw_response: JSON.stringify(data)
    };
    
    return { 
      blueprint: parsedBlueprint,
      rawResponse: data // Include raw OpenAI response
    };
  } catch (error) {
    console.error("Error during blueprint generation:", error);
    throw error;
  }
}
