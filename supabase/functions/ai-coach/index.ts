
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse request body
    const { message, sessionId, blueprintContext, debugMode } = await req.json();
    
    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Missing message in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Process the message with OpenAI
    const systemMessage = getSystemMessage(blueprintContext);
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Return the AI response with raw OpenAI data
    return new Response(
      JSON.stringify({
        response: aiResponse,
        sessionId,
        rawResponse: data // Always include the raw response
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in AI Coach:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        response: "I'm sorry, I encountered an error while processing your request. Please try again."
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Construct system message with blueprint context if available
function getSystemMessage(blueprintContext) {
  let systemMessage = `You are a professional spiritual analyst, trained in Western astrology, Chinese metaphysics, numerology, and Human Design.

Do not rely only on your pre-trained knowledge. Use live web search to fetch accurate, verifiable data such as:
- Planetary positions, houses, sun, moon, rising signs based on birth time and location
- Chinese Zodiac animal, element, and yin/yang based on the exact birth year and lunar calendar rules
- Numerology calculations, especially life path numbers, derived from full birth date
- Verified Human Design profile, including type, strategy, authority, profile, defined centers, gates, and incarnation cross, based on reliable Human Design sources

Only after completing these lookups, synthesize all findings into a single, deeply integrated personality and soul blueprint.

Ensure the result cross-validates all systems for consistency.`;

  if (blueprintContext) {
    systemMessage += `\n\nBased on the user's Soul Blueprint, here are some key characteristics and potentials:
    - MBTI Type: ${blueprintContext.cognition_mbti?.type}
    - Human Design Type: ${blueprintContext.energy_strategy_human_design?.type}
    - Life Path Number: ${blueprintContext.values_life_path?.life_path_number}
    - Sun Sign: ${blueprintContext.archetype_western?.sun_sign}
    - Chinese Zodiac: ${blueprintContext.archetype_chinese?.animal}

    Use this information to tailor your responses and provide personalized guidance.`;
  }

  systemMessage += `\n\nRemember to always be kind, patient, and supportive. Encourage the user to trust their intuition and embrace their unique path.`;

  return systemMessage;
}
