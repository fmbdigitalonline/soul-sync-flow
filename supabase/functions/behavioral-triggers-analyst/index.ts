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

    console.log('🎯 Behavioral Triggers Analyst: Processing analysis...');

    const prompt = `
As the Behavioral Triggers Analyst, analyze the automatic behavioral patterns and response mechanisms from this hermetic analysis:

HERMETIC ANALYSIS INPUT:
${hermeticChunk}

PREVIOUS INTELLIGENCE INSIGHTS:
${previousInsights}

BLUEPRINT CONTEXT:
- MBTI Type: ${blueprintContext?.cognition_mbti?.type || 'Unknown'}
- Human Design Authority: ${blueprintContext?.energy_strategy_human_design?.authority || 'Unknown'}

ANALYSIS REQUIREMENTS:
Generate a comprehensive 3,000-4,000 word analysis covering:

1. TRIGGER IDENTIFICATION & MAPPING (800-1000 words)
   - Primary emotional and behavioral triggers
   - Environmental, relational, and internal triggers
   - Trigger intensity levels and response patterns
   - How triggers connect to core wounds and fears

2. AUTOMATIC RESPONSE SYSTEMS (700-900 words)
   - Default behavioral patterns when triggered
   - Fight/flight/freeze/fawn responses
   - Coping mechanisms and survival strategies
   - How responses serve vs sabotage growth

3. TRIGGER TRANSFORMATION PATHWAYS (700-900 words)
   - How triggers can become gateways to growth
   - Healing opportunities within trigger patterns
   - Conscious response development strategies
   - Integration of triggered aspects

4. BEHAVIORAL RECALIBRATION METHODS (800-1000 words)
   - Specific techniques for trigger awareness
   - Pause-and-choose response practices
   - How to develop new behavioral pathways
   - Somatic and energetic approaches to trigger healing

5. MASTERY PRACTICES & IMPLEMENTATIONS (200-400 words)
   - Daily trigger awareness exercises
   - Emergency protocols for intense triggers
   - Long-term behavioral transformation goals

Connect all insights to the hermetic analysis and identity constructs findings. Write with depth and practical wisdom.
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
          { role: 'system', content: 'You are an expert behavioral analyst specializing in trigger identification and response pattern analysis.' },
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

    console.log('✅ Behavioral Triggers Analysis completed, length:', content.length);

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Behavioral Triggers Analyst error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});