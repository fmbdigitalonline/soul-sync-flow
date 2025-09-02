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

    console.log('⚡ Execution Bias Analyst: Processing analysis...');

    const prompt = `
As the Execution Bias Analyst, analyze the decision-making patterns and action-taking biases from this hermetic analysis:

HERMETIC ANALYSIS INPUT:
${hermeticChunk}

PREVIOUS INTELLIGENCE INSIGHTS:
${previousInsights}

BLUEPRINT CONTEXT:
- Human Design Type: ${blueprintContext?.energy_strategy_human_design?.type || 'Unknown'}
- Decision-Making Authority: ${blueprintContext?.energy_strategy_human_design?.authority || 'Unknown'}

ANALYSIS REQUIREMENTS:
Generate a comprehensive 3,000-4,000 word analysis covering:

1. DECISION-MAKING ARCHITECTURE (800-1000 words)
   - Core decision-making patterns and biases
   - How decisions are filtered through personality structure
   - Conscious vs unconscious decision factors
   - Decision-making strengths and blind spots

2. ACTION-TAKING PATTERNS (700-900 words)
   - Execution styles and implementation approaches
   - Procrastination vs action triggers
   - How energy moves through decision to action
   - Completion patterns and follow-through tendencies

3. COGNITIVE & EMOTIONAL BIASES (700-900 words)
   - Specific biases that influence choices
   - How past experiences shape current decisions
   - Emotional decision-making vs rational analysis
   - Bias awareness and correction strategies

4. EXECUTION OPTIMIZATION STRATEGIES (800-1000 words)
   - How to align decisions with authentic design
   - Improving decision quality and speed
   - Creating supportive execution environments
   - Leveraging natural decision-making gifts

5. IMPLEMENTATION PROTOCOLS (200-400 words)
   - Daily decision-making practices
   - How to catch and correct biased thinking
   - Execution accountability systems

Integrate insights from identity constructs and behavioral triggers analysis. Write with analytical depth and practical application focus.
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
          { role: 'system', content: 'You are an expert execution analyst specializing in decision-making patterns and action-taking biases.' },
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

    console.log('✅ Execution Bias Analysis completed, length:', content.length);

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Execution Bias Analyst error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});