
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Edge function to handle blueprint generation requests
 * STRICTLY ONE REQUEST - absolutely no retries under any circumstances
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const requestData = await req.json();
    console.log("Received data:", JSON.stringify(requestData));

    // Check if we have the userMeta field, which is what our frontend is sending
    const userMeta = requestData.userMeta;
    
    if (!userMeta) {
      throw new Error("Missing user metadata in request");
    }

    // For development/debugging, log the data we received
    console.log(`Processing blueprint for: ${userMeta.full_name}, born on ${userMeta.birth_date}`);
    
    if (!OPENAI_API_KEY) {
      throw new Error("Missing OpenAI API key. Please add OPENAI_API_KEY to your Supabase secrets.");
    }

    // Call OpenAI API with a SINGLE attempt, no retry logic
    console.log("Calling OpenAI with GPT-4o Search Preview - ONE TIME ONLY");
    
    // Determine the birth location for better location-specific search
    const locationInfo = parseLocationForSearch(userMeta.birth_location);
    
    // Make exactly one call to OpenAI - no retry mechanism whatsoever
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-search-preview",
        messages: [
          { 
            role: "system", 
            content: `You are an expert astrologer, numerologist, Human Design reader, Chinese metaphysics interpreter, and personality psychologist. 
Generate a complete Soul Blueprint based on the following birth details.
Your response should be a well-structured JSON object containing these components:
- Western astrology (sun sign, moon sign, rising sign, aspects, etc.)
- Human Design (type, profile, authority, strategy, centers, gates)
- Numerology (life path number, expression number, etc.)
- Chinese zodiac analysis
- MBTI-style cognitive profile
- Bashar's belief interface principles

Format all calculations accurately and return a detailed structured response with all sections.`
          },
          { 
            role: "user", 
            content: `Generate a complete Soul Blueprint for this person:
Full name: ${userMeta.full_name}
Birth date: ${userMeta.birth_date}
Birth time: ${userMeta.birth_time_local || "Unknown"}
Birth location: ${userMeta.birth_location || "Unknown"}
MBTI (if known): ${userMeta.mbti || "Unknown"}

Include these sections in your response:
1. Western astrology with planetary positions
2. Human Design profile with centers and gates
3. Numerology calculations
4. Chinese zodiac sign and element
5. MBTI cognitive functions
6. Bashar spiritual principles`
          }
        ],
        max_tokens: 1500,
        web_search_options: {
          search_context_size: "medium",
          user_location: locationInfo
        }
      })
    });

    // Check for API errors
    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", JSON.stringify(errorData));
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    // Parse the API response
    const data = await response.json();
    console.log("OpenAI API response received - ONE TIME ONLY"); // Add clear logging
    
    const generatedContent = data.choices[0].message.content;
    
    console.log("Received blueprint from OpenAI");
    
    try {
      // Parse the generated content - note that it might not be valid JSON directly
      let parsedBlueprint = {};
      
      // Try to extract JSON data from the content
      try {
        // First attempt: Try to parse the entire response as JSON
        parsedBlueprint = JSON.parse(generatedContent);
      } catch (parseError) {
        console.log("Response is not directly parseable as JSON, attempting to extract JSON portion");
        
        // Second attempt: Try to find JSON-like content within the text
        const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsedBlueprint = JSON.parse(jsonMatch[0]);
          } catch (nestedParseError) {
            console.error("Failed to extract JSON from response:", nestedParseError);
            
            // If we can't parse JSON, create a basic structure using the text content
            parsedBlueprint = {
              rawContent: generatedContent,
              parsed: false
            };
          }
        } else {
          // If no JSON-like content found, create sections manually
          parsedBlueprint = {
            rawContent: generatedContent,
            parsed: false
          };
        }
      }
      
      // Save any citation information but don't display them to the user
      const citations = data.choices[0].message.annotations || [];
      
      // Create a complete blueprint object with the required structure
      const completeBlueprint = {
        _meta: {
          generation_method: "gpt-4o-search-preview",
          model_version: "gpt-4o-search-preview",
          generation_date: new Date().toISOString(),
          birth_data: userMeta,
          schema_version: "1.0",
          error: null,
          // Store citations internally but don't expose them in the UI
          _citations: citations.length > 0 ? citations : null
        },
        user_meta: {
          ...userMeta
        }
      };
      
      // If we have successfully parsed JSON, use the structure directly
      if (parsedBlueprint.parsed !== false) {
        // Use the AI-generated data directly if it exists in expected format
        completeBlueprint.cognition_mbti = parsedBlueprint.cognition_mbti || {};
        completeBlueprint.energy_strategy_human_design = parsedBlueprint.energy_strategy_human_design || {};
        completeBlueprint.values_life_path = parsedBlueprint.values_life_path || {};
        completeBlueprint.archetype_western = parsedBlueprint.archetype_western || {};
        completeBlueprint.archetype_chinese = parsedBlueprint.archetype_chinese || {};
        completeBlueprint.bashar_suite = parsedBlueprint.bashar_suite || {};
      } else {
        // For non-JSON responses, store the raw content
        completeBlueprint.raw_content = parsedBlueprint.rawContent;
        completeBlueprint.needs_parsing = true;
      }

      // Return the result - ONE CALL ONLY
      return new Response(
        JSON.stringify({
          success: true,
          blueprint: completeBlueprint,
          rawResponse: data
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    } catch (error) {
      console.error("Error processing blueprint:", error);
      throw new Error(`Failed to process blueprint: ${error.message}`);
    }
  } catch (error) {
    console.error("Error generating blueprint:", error);
    
    // Return detailed error - no retry attempts
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to generate blueprint",
        errorDetails: error.toString(),
        timestamp: new Date().toISOString()
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
 * Parse location string to extract potential country/city information for search context
 */
function parseLocationForSearch(locationString) {
  if (!locationString || locationString === "Unknown") {
    return { type: "approximate", approximate: {} };
  }
  
  try {
    // Basic parsing of common location formats like "City, Country" or "City, State, Country"
    const parts = locationString.split(',').map(part => part.trim());
    
    const locationData = {
      type: "approximate",
      approximate: {}
    };
    
    // Very simplified location parsing
    if (parts.length >= 1) {
      locationData.approximate.city = parts[0];
    }
    
    if (parts.length >= 2) {
      // If we have two parts, assume the second part is either state/region or country
      locationData.approximate.region = parts[1];
      
      // Try to detect if the last part is a country
      const possibleCountry = parts[parts.length - 1];
      
      // Simple mapping of some common country names to ISO codes
      const countryCodes = {
        "USA": "US", "United States": "US", "US": "US",
        "UK": "GB", "United Kingdom": "GB",
        "Canada": "CA", "Australia": "AU",
        "India": "IN", "Japan": "JP",
        "Germany": "DE", "France": "FR",
        "Italy": "IT", "Spain": "ES"
      };
      
      // Set the country code if we can map it
      if (countryCodes[possibleCountry]) {
        locationData.approximate.country = countryCodes[possibleCountry];
      }
    }
    
    return locationData;
  } catch (e) {
    // Return empty object if parsing fails
    return { type: "approximate", approximate: {} };
  }
}
