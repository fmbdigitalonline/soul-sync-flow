
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory, userId } = await req.json();

    if (!message || !userId) {
      throw new Error('Missing required parameters: message and userId');
    }

    console.log(`🌟 BLEND MODE: Processing message for user ${userId}`);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's blend intelligence and personality context
    const [intelligenceResult, blueprintResult] = await Promise.all([
      supabase
        .from('hacs_blend_intelligence')
        .select('*')
        .eq('user_id', userId)
        .single(),
      supabase
        .from('user_blueprints')
        .select('blueprint')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()
    ]);

    const intelligence = intelligenceResult.data;
    const blueprint = blueprintResult.data?.blueprint;

    // Blend-specific system prompt integrating all aspects
    const systemPrompt = `You are a specialized INTEGRATION GUIDE within the HACS (Holistic Adaptive Cognition System) framework. Your purpose is to help users blend and integrate insights from all life domains into coherent wisdom and action.

BLEND MODE FOCUS AREAS:
- Integration of spiritual insights with practical action
- Synthesis of productivity goals with personal growth
- Harmonizing analytical understanding with intuitive wisdom
- Creating coherent life philosophies from diverse experiences
- Bridging the gap between dream insights and daily reality
- Facilitating holistic decision-making across all life domains

PERSONALITY CONTEXT: ${blueprint ? JSON.stringify(blueprint) : 'Standard integration approach'}

CURRENT INTELLIGENCE LEVEL: ${intelligence?.intelligence_level || 50}/100
BLEND INTELLIGENCE METRICS: ${JSON.stringify(intelligence?.module_scores || {})}

CONVERSATION HISTORY: ${JSON.stringify(conversationHistory)}

CRITICAL INSTRUCTIONS:
1. STAY IN BLEND MODE - Focus on integration and synthesis
2. Help users see connections between different aspects of their life
3. Bridge spiritual insights with practical applications
4. Synthesize learnings from all HACS modules
5. Ask questions that reveal underlying patterns and connections
6. Provide holistic perspectives that encompass multiple life domains

USER MESSAGE: "${message}"

Respond as an integration specialist, helping the user weave together insights from all aspects of their experience into coherent wisdom.`;

    // Call OpenAI with blend-specific prompt
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    const response = openAIData.choices[0].message.content;

    // Update blend intelligence based on interaction
    const intelligenceBonus = calculateBlendIntelligenceBonus(message, response);
    
    if (intelligence) {
      const newLevel = Math.min(100, (intelligence.intelligence_level || 50) + intelligenceBonus);
      await supabase
        .from('hacs_blend_intelligence')
        .update({
          intelligence_level: newLevel,
          interaction_count: (intelligence.interaction_count || 0) + 1,
          last_update: new Date().toISOString()
        })
        .eq('user_id', userId);
    } else {
      // Create initial blend intelligence record
      await supabase
        .from('hacs_blend_intelligence')
        .insert({
          user_id: userId,
          intelligence_level: 50 + intelligenceBonus,
          interaction_count: 1,
          module_scores: { integration: intelligenceBonus }
        });
    }

    // Generate blend-specific question occasionally
    let question = null;
    if (Math.random() < 0.3) { // 30% chance
      question = generateBlendQuestion(intelligence?.intelligence_level || 50);
    }

    console.log(`🌟 BLEND: Response generated, intelligence bonus: +${intelligenceBonus}`);

    return new Response(
      JSON.stringify({
        response,
        module: 'integration',
        mode: 'blend',
        intelligenceBonus,
        question
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in hacs-blend-conversation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function calculateBlendIntelligenceBonus(userMessage: string, aiResponse: string): number {
  // Calculate intelligence bonus based on blend-specific criteria
  let bonus = 1; // Base bonus

  // Bonus for integration keywords
  const integrationKeywords = ['connect', 'integrate', 'synthesize', 'pattern', 'relationship', 'harmony', 'balance', 'wisdom'];
  const keywordMatches = integrationKeywords.filter(keyword => 
    userMessage.toLowerCase().includes(keyword) || aiResponse.toLowerCase().includes(keyword)
  ).length;
  
  bonus += Math.min(keywordMatches * 0.5, 3); // Max 3 bonus for keywords

  // Bonus for complexity and depth
  if (userMessage.length > 80) bonus += 1;
  if (userMessage.includes('?')) bonus += 0.5;

  // Bonus for comprehensive response
  if (aiResponse.length > 120) bonus += 1;

  return Math.round(bonus * 10) / 10; // Round to 1 decimal
}

function generateBlendQuestion(intelligenceLevel: number): any {
  const questions = [
    {
      id: crypto.randomUUID(),
      text: "How do your spiritual insights connect with your daily goals?",
      module: 'integration',
      type: 'foundational'
    },
    {
      id: crypto.randomUUID(),
      text: "What patterns do you notice across different areas of your life?",
      module: 'integration',
      type: 'validation'
    },
    {
      id: crypto.randomUUID(),
      text: "How can you apply recent insights to create more harmony in your life?",
      module: 'integration',
      type: 'foundational'
    },
    {
      id: crypto.randomUUID(),
      text: "What would it look like to integrate your dreams with your practical plans?",
      module: 'integration',
      type: 'validation'
    }
  ];

  return questions[Math.floor(Math.random() * questions.length)];
}
