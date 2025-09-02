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

    console.log('🧠 Identity Constructs Analyst: Processing analysis...');

    const prompt = `
As the Identity Constructs Analyst, analyze the identity formation patterns and self-concept structures from this hermetic analysis:

HERMETIC ANALYSIS INPUT:
${hermeticChunk}

PREVIOUS INTELLIGENCE INSIGHTS:
${previousInsights}

BLUEPRINT CONTEXT:
- MBTI Type: ${blueprintContext?.cognition_mbti?.type || 'Unknown'}
- Human Design Type: ${blueprintContext?.energy_strategy_human_design?.type || 'Unknown'}
- Life Path: ${blueprintContext?.values_life_path?.lifePathNumber || 'Unknown'}

ANALYSIS REQUIREMENTS:
Generate a comprehensive 3,000-4,000 word analysis covering:

1. CORE IDENTITY ARCHITECTURE (800-1000 words)
   - Fundamental self-concept structures
   - Identity anchors and core beliefs about self
   - How identity was formed and what maintains it
   - Conscious vs unconscious identity elements

2. IDENTITY DEFENSE MECHANISMS (700-900 words)
   - Protective strategies around identity threats
   - How the person maintains consistent self-image
   - Ego defense patterns and identity preservation tactics
   - Areas where identity feels most/least secure

3. IDENTITY EVOLUTION PATTERNS (700-900 words)
   - How identity has shifted over time
   - Growth edges in identity development
   - Resistance patterns to identity expansion
   - Future identity potential and transformation pathways

4. IDENTITY INTEGRATION OPPORTUNITIES (800-1000 words)
   - Shadow aspects of identity waiting for integration
   - Rejected or denied parts of self
   - How to expand identity in healthy ways
   - Specific practices for identity wholeness

5. PRACTICAL IDENTITY RECOMMENDATIONS (200-400 words)
   - Concrete steps for healthy identity development
   - Warning signs of identity rigidity or fragmentation
   - Daily practices for authentic self-expression

Write in a profound, insightful tone that reveals deep psychological patterns. Use "you" throughout. Connect insights to the hermetic analysis and previous intelligence findings.
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
          { role: 'system', content: 'You are an expert identity analyst specializing in deep psychological pattern recognition and identity formation dynamics.' },
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

    console.log('✅ Identity Constructs Analysis completed, length:', content.length);

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Identity Constructs Analyst error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});