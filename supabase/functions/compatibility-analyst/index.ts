import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { hermeticChunk, previousInsights, blueprintContext } = await req.json();
    
    if (!hermeticChunk) {
      return new Response(JSON.stringify({ error: 'Hermetic chunk is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('💕 Compatibility Analyst: Processing analysis...');

    const prompt = `
As the Compatibility Analyst, analyze relationship dynamics, interpersonal patterns, and compatibility indicators:

HERMETIC ANALYSIS INPUT: ${hermeticChunk}
PREVIOUS INSIGHTS: ${previousInsights}
BLUEPRINT CONTEXT: ${JSON.stringify(blueprintContext, null, 2)}

Generate a comprehensive 3,000-4,000 word analysis covering:
- Romantic relationship compatibility patterns
- Friendship and social dynamics preferences
- Professional collaboration styles
- Conflict resolution and communication patterns
- Social energy dynamics and boundaries
- Attraction and repulsion patterns with different types
`;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini-2025-04-14',
        messages: [
          { role: 'system', content: 'You are an expert relationship analyst specializing in interpersonal compatibility and relationship dynamics patterns.' },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 4000,
      }),
    });

    if (!openAIResponse.ok) {
      console.error('❌ OpenAI API error:', openAIResponse.status, openAIResponse.statusText);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const content = openAIData.choices[0].message.content;

    console.log('✅ Compatibility Analysis completed, length:', content.length);

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Compatibility Analyst error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});