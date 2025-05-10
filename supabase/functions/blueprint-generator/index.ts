
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

// Rate limit tracking
const rateLimitInfo = {
  isRateLimited: false,
  resetTime: null,
  consecutiveErrors: 0,
  cooldownMs: 5000, // Initial cooldown of 5 seconds
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
    
    // Check if we're currently rate limited
    if (rateLimitInfo.isRateLimited) {
      const now = Date.now();
      if (now < rateLimitInfo.resetTime) {
        const waitTime = Math.ceil((rateLimitInfo.resetTime - now) / 1000);
        console.log(`Rate limited, waiting ${waitTime} seconds before retry`);
        
        // Re-add the request to the front of the queue with a delay
        setTimeout(() => {
          requestQueue.unshift(nextRequest);
          processQueue();
        }, Math.min(30000, rateLimitInfo.cooldownMs)); // Cap maximum delay at 30 seconds
        
        return;
      } else {
        // Reset rate limit if the cooldown period has passed
        console.log("Rate limit cooldown period has passed, attempting to process");
        rateLimitInfo.isRateLimited = false;
      }
    }
    
    // Generate the blueprint with search preview model
    const result = await generateBlueprintWithSearchPreview(nextRequest.userMeta);
    
    // Reset consecutive error count on success
    rateLimitInfo.consecutiveErrors = 0;
    
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
    
    // Check if this is a rate limit error
    if (error.message && (
      error.message.includes("rate limit") || 
      error.message.includes("too many requests") || 
      error.message.includes("429") || 
      error.message.includes("quota exceeded")
    )) {
      // Increase the rate limit tracking
      rateLimitInfo.isRateLimited = true;
      rateLimitInfo.consecutiveErrors++;
      
      // Exponential backoff based on consecutive errors
      rateLimitInfo.cooldownMs = Math.min(120000, rateLimitInfo.cooldownMs * (1.5 + (rateLimitInfo.consecutiveErrors * 0.5)));
      rateLimitInfo.resetTime = Date.now() + rateLimitInfo.cooldownMs;
      
      console.log(`Rate limit detected. Backing off for ${rateLimitInfo.cooldownMs/1000} seconds`);
      
      // Re-add the request to the queue for retry later
      requestQueue.unshift(nextRequest);
    } else {
      // Return the detailed error for non-rate limit errors
      nextRequest.reject(error);
    }
    
    // Continue processing the queue after a delay
    setTimeout(() => {
      processQueue();
    }, 3000); // Slight longer delay after errors
  }
}

/**
 * Generate a blueprint using GPT-4o Search Preview with web search capabilities
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
    // Determine the birth location for better location-specific search
    const locationInfo = parseLocationForSearch(userMeta.birth_location);
    
    // Call OpenAI API with GPT-4o search preview using the proper web_search_options
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
        max_tokens: 1500,
        response_format: { type: "json_object" },
        web_search_options: {
          search_context_size: "medium", // Balanced approach for depth vs speed
          user_location: locationInfo
        }
      })
    });

    // Check for API errors
    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", JSON.stringify(errorData));
      
      // Enhanced error handling for rate limits
      if (errorData.error && errorData.error.type === "rate_limit_exceeded") {
        throw new Error(`OpenAI rate limit exceeded. Please try again in ${errorData.error.retry_after || 'a few'} seconds.`);
      }
      
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    // Parse the API response
    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    console.log("Received blueprint from OpenAI");
    
    try {
      // Parse the generated content into a JSON object
      const parsedBlueprint = JSON.parse(generatedContent);
      
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
