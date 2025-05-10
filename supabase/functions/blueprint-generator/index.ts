
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Edge function to handle blueprint generation requests
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

    // Generate the blueprint using GPT-4o
    const blueprint = await generateBlueprintWithAI(userMeta);

    // Return success response with the blueprint
    return new Response(
      JSON.stringify({ 
        success: true, 
        blueprint
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
        error: error.message || "Failed to generate blueprint",
        errorDetails: error.toString() 
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
 * Generate a complete blueprint using OpenAI's GPT-4o model
 * @param {Object} userMeta - User metadata including birth information
 * @returns {Object} Complete blueprint object
 */
async function generateBlueprintWithAI(userMeta) {
  // Create a detailed system prompt that explains what we need
  const systemPrompt = `You are an expert astrologer, numerologist, and spiritual advisor. 
Generate a complete Soul Blueprint based on the following birth details.
Your response should be a well-structured JSON object containing these components:
- Western astrology (sun sign, moon sign, rising sign, aspects, etc.)
- Human Design (type, profile, authority, strategy, centers, gates)
- Numerology (life path number, expression number, etc.)
- Chinese zodiac analysis
- MBTI-style cognitive profile
- Bashar's belief interface principles

Format all calculations accurately and return ONLY valid JSON with detailed sections.`;

  // Create a detailed user prompt with the birth information
  const userPrompt = `Generate a complete Soul Blueprint for this person:
Full name: ${userMeta.full_name}
Birth date: ${userMeta.birth_date}
Birth time: ${userMeta.birth_time_local || "Unknown"}
Birth location: ${userMeta.birth_location || "Unknown"}
MBTI (if known): ${userMeta.mbti || "Unknown"}

Search for astrological and spiritual information to create an accurate blueprint. 
For missing data, make reasonable assumptions based on available information.
Return ONLY a valid JSON object with no additional text.`;

  console.log("Calling OpenAI with system prompt:", systemPrompt);
  console.log("User prompt:", userPrompt);

  // Call OpenAI API to generate the blueprint
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("OpenAI API error:", errorData);
    throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  const generatedContent = data.choices[0].message.content;
  
  console.log("Received blueprint from OpenAI");
  
  try {
    // Parse the generated content into a JSON object
    const parsedBlueprint = JSON.parse(generatedContent);
    
    // Create a complete blueprint object with the required structure
    const completeBlueprint = {
      _meta: {
        generation_method: "gpt-4o",
        model_version: "gpt-4o",
        generation_date: new Date().toISOString(),
        birth_data: userMeta,
        schema_version: "1.0",
        raw_response: generatedContent // Include the raw response for debugging
      },
      user_meta: {
        ...userMeta
      },
      // Use the AI-generated data directly
      cognition_mbti: parsedBlueprint.cognition_mbti || {},
      energy_strategy_human_design: parsedBlueprint.energy_strategy_human_design || {},
      values_life_path: parsedBlueprint.values_life_path || {},
      archetype_western: parsedBlueprint.archetype_western || {},
      archetype_chinese: parsedBlueprint.archetype_chinese || {},
      bashar_suite: parsedBlueprint.bashar_suite || {}
    };

    return completeBlueprint;
  } catch (error) {
    // If there's an error parsing the blueprint, include the error in the response
    console.error("Error parsing blueprint:", error);
    
    // Return a structured blueprint with error information
    return {
      _meta: {
        generation_method: "gpt-4o",
        model_version: "gpt-4o",
        generation_date: new Date().toISOString(),
        birth_data: userMeta,
        schema_version: "1.0",
        raw_response: generatedContent, // Include the raw response for debugging
        error: `Failed to parse blueprint: ${error.message}`
      },
      user_meta: {
        ...userMeta
      },
      // Include empty objects for required fields to maintain structure
      cognition_mbti: {},
      energy_strategy_human_design: {},
      values_life_path: {},
      archetype_western: {},
      archetype_chinese: {},
      bashar_suite: {}
    };
  }
}
