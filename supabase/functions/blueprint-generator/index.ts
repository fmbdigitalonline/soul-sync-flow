
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limit management
const rateLimitState = {
  isRateLimited: false,
  lastRateLimitHit: 0,
  cooldownPeriod: 60000, // 60 seconds cooldown
  retryCount: 0,
  maxRetries: 3,
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
        reject
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
    // Check if we're currently rate limited
    const currentTime = Date.now();
    const isInCooldown = rateLimitState.isRateLimited && 
                        (currentTime - rateLimitState.lastRateLimitHit < rateLimitState.cooldownPeriod);

    let result;
    
    if (isInCooldown) {
      console.log(`Rate limit cooldown active. Using regular GPT-4o without search. Cooldown ends in ${Math.floor((rateLimitState.lastRateLimitHit + rateLimitState.cooldownPeriod - currentTime) / 1000)} seconds`);
      
      // Skip search and use regular GPT-4o during cooldown
      result = await generateBlueprintWithAI(nextRequest.userMeta);
      
      // Add notice about fallback
      result.notice = "Generated with GPT-4o (fallback due to rate limits)";
    } else {
      // Reset retry count if we're not in cooldown
      if (!isInCooldown) {
        rateLimitState.retryCount = 0;
      }
      
      try {
        // First attempt with search preview
        console.log("Attempting to generate blueprint with GPT-4o...");
        result = await generateBlueprintWithAI(nextRequest.userMeta);
      } catch (searchError) {
        console.error("Failed to generate with model, error:", searchError.message);
        
        // Check if it's a rate limit error
        if (searchError.message.includes("rate limit")) {
          console.log("Rate limit hit, activating cooldown and falling back to GPT-4o without search");
          
          // Update rate limit state
          rateLimitState.isRateLimited = true;
          rateLimitState.lastRateLimitHit = Date.now();
          rateLimitState.retryCount++;
          
          // Calculate exponential backoff
          const backoffTime = Math.min(2000 * Math.pow(2, rateLimitState.retryCount), 30000); // Max 30s
          rateLimitState.cooldownPeriod = backoffTime;
          
          console.log(`Set cooldown period to ${backoffTime}ms. Retry count: ${rateLimitState.retryCount}`);
          
          // Fallback to regular GPT-4o
          result = await generateBlueprintWithAI(nextRequest.userMeta);
          result.notice = "Generated with GPT-4o (fallback from GPT-4o due to rate limits)";
        } else {
          // If it's not a rate limit error, rethrow it
          throw searchError;
        }
      }
    }
    
    // Resolve the promise with the result
    nextRequest.resolve({
      success: true,
      blueprint: result.blueprint,
      rawResponse: result.rawResponse,
      notice: result.notice || undefined
    });
    
    // Add a small delay before processing the next request to avoid rate limits
    setTimeout(() => {
      processQueue();
    }, 2000); // 2 seconds between requests
  } catch (error) {
    // Reject the promise with the error
    nextRequest.reject(error);
    
    // Continue processing the queue
    setTimeout(() => {
      processQueue();
    }, 1000);
  }
}

/**
 * Generate a blueprint using regular GPT-4o
 * @param {Object} userMeta - User metadata including birth information
 * @returns {Object} Complete blueprint object and raw API response
 */
async function generateBlueprintWithAI(userMeta) {
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

  console.log("Calling OpenAI with GPT-4o");
  
  // Call OpenAI API with regular GPT-4o
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
      max_tokens: 2000,  // Reduced token limit to help avoid rate limits
      response_format: { type: "json_object" }
    })
  });

  // Check for API errors
  if (!response.ok) {
    const errorData = await response.json();
    console.error("OpenAI API error:", errorData);
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
        generation_method: "gpt-4o",
        model_version: "gpt-4o",
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
    
    // Create an error blueprint with proper structure for error handling
    const errorBlueprint = {
      _meta: {
        generation_method: "gpt-4o",
        model_version: "gpt-4o",
        generation_date: new Date().toISOString(),
        birth_data: userMeta,
        schema_version: "1.0",
        error: `Failed to parse blueprint: ${error.message}`,
        raw_content: generatedContent.substring(0, 1000) + "..." // Truncated for readability
      },
      user_meta: {
        ...userMeta
      },
      // Empty objects for the required structure
      cognition_mbti: {},
      energy_strategy_human_design: {},
      values_life_path: {},
      archetype_western: {},
      archetype_chinese: {},
      bashar_suite: {}
    };
    
    return { blueprint: errorBlueprint, rawResponse: data };
  }
}
