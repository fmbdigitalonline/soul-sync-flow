
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Queue for processing requests sequentially
const requestQueue = [];
let isProcessing = false;

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

    // Add request to queue and process
    const blueprintPromise = new Promise((resolve, reject) => {
      requestQueue.push({
        userMeta,
        resolve,
        reject,
        queuePosition: requestQueue.length + 1,
        addedAt: Date.now()
      });

      // Start processing the queue if not already
      if (!isProcessing) {
        processQueue();
      }
    });

    // Wait for the request to be processed
    const result = await blueprintPromise;
    
    // Return the result
    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
    
  } catch (error) {
    console.error("Error generating blueprint:", error);
    
    // Return detailed error for debugging
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
 * Process queue items sequentially
 */
async function processQueue() {
  if (requestQueue.length === 0) {
    isProcessing = false;
    return;
  }

  isProcessing = true;
  const nextRequest = requestQueue.shift();

  try {
    console.log(`Processing request for ${nextRequest.userMeta.full_name} (waited ${Date.now() - nextRequest.addedAt}ms)`);
    console.log(`Queue length: ${requestQueue.length}`);
    
    // Generate the blueprint with search preview model only
    const result = await generateBlueprintWithSearchPreview(nextRequest.userMeta);
    
    // Resolve the promise with the result
    nextRequest.resolve({
      success: true,
      blueprint: result.blueprint,
      rawResponse: result.rawResponse,
      queueLength: requestQueue.length
    });
    
    // Add a small delay before processing the next request to avoid rate limits
    setTimeout(() => {
      processQueue();
    }, 2000); // 2 seconds between requests
  } catch (error) {
    console.error("Error in queue processing:", error);
    
    // Return the detailed error
    nextRequest.reject(error);
    
    // Continue processing the queue after a delay
    setTimeout(() => {
      processQueue();
    }, 3000); // Slight longer delay after errors
  }
}

/**
 * Generate a blueprint using GPT-4o Search Preview only, no fallbacks
 */
async function generateBlueprintWithSearchPreview(userMeta) {
  const systemPrompt = `You are an expert astrologer, numerologist, Human Design reader, Chinese metaphysics interpreter, and personality psychologist. 
Generate a complete Soul Blueprint based on the following birth details.
Your response should be a well-structured JSON object containing these components:
- Western astrology (sun sign, moon sign, rising sign, aspects, etc.)
- Human Design (type, profile, authority, strategy, centers, gates)
- Numerology (life path number, expression number, etc.)
- Chinese zodiac analysis
- MBTI-style cognitive profile
- Bashar's belief interface principles

Format all calculations accurately and return ONLY valid JSON with detailed sections.`;

  const userPrompt = `Generate a complete Soul Blueprint for this person:
Full name: ${userMeta.full_name}
Birth date: ${userMeta.birth_date}
Birth time: ${userMeta.birth_time_local || "Unknown"}
Birth location: ${userMeta.birth_location || "Unknown"}
MBTI (if known): ${userMeta.mbti || "Unknown"}

Return ONLY a valid JSON object with no additional text.

Include these sections in your response:
1. Western astrology with planetary positions
2. Human Design profile with centers and gates
3. Numerology calculations
4. Chinese zodiac sign and element
5. MBTI cognitive functions
6. Bashar spiritual principles`;

  console.log("Calling OpenAI with GPT-4o Search Preview");
  
  try {
    // Call OpenAI API with GPT-4o search preview - ONLY VERSION
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-search-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,  // Reduced token limit to help with rate limits
        response_format: { type: "json_object" },
        tools: [{
          type: "web_search"
        }]
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
    const generatedContent = data.choices[0].message.content;
    
    console.log("Received blueprint from OpenAI");
    
    try {
      // Parse the generated content into a JSON object
      const parsedBlueprint = JSON.parse(generatedContent);
      
      // Create a complete blueprint object with the required structure
      const completeBlueprint = {
        _meta: {
          generation_method: "gpt-4o-search-preview",
          model_version: "gpt-4o-search-preview",
          generation_date: new Date().toISOString(),
          birth_data: userMeta,
          schema_version: "1.0",
          error: null
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

      return { blueprint: completeBlueprint, rawResponse: data };
    } catch (error) {
      // If there's an error parsing the blueprint, include the error and raw response
      console.error("Error parsing blueprint:", error);
      
      throw new Error(`Failed to parse blueprint: ${error.message}. Raw content: ${generatedContent.substring(0, 200)}...`);
    }
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw error; // Propagate the error for detailed debugging
  }
}
