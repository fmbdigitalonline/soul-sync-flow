import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callChatCompletion } from "../_shared/azure-openai.ts";

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

    console.log('🧠 Cognitive Functions Analyst: Processing analysis...');

    const prompt = `
As the Cognitive Functions Analyst, analyze the Jungian cognitive function stack and psychological type dynamics:

HERMETIC ANALYSIS INPUT: ${hermeticChunk}
PREVIOUS INSIGHTS: ${previousInsights}
BLUEPRINT CONTEXT: ${JSON.stringify(blueprintContext, null, 2)}

Generate a comprehensive 3,000-4,000 word analysis covering:
- Dominant, auxiliary, tertiary, and inferior cognitive functions
- Function dynamics and development patterns
- Cognitive loops and grips
- Information processing preferences
- Decision-making patterns
- Learning and problem-solving approaches
`;

    const openAIResponse = await callChatCompletion({
      messages: [
        { role: 'system', content: 'You are an expert cognitive psychology analyst specializing in Jungian cognitive functions and psychological type dynamics.' },
        { role: 'user', content: prompt }
      ],
      model: 'gpt-4.1-mini-2025-04-14',
      max_tokens: 4000,
    });

    if (!openAIResponse.ok) {
      console.error('❌ OpenAI API error:', openAIResponse.status, openAIResponse.statusText);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const content = openAIData.choices[0].message.content;

    console.log('✅ Cognitive Functions Analysis completed, length:', content.length);

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Cognitive Functions Analyst error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});