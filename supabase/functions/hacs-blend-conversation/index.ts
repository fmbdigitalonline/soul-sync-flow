import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { message, conversationHistory, userId } = await req.json();

    if (!message || !userId) {
      throw new Error('Missing required parameters: message, userId');
    }

    console.log('Processing blend conversation for user:', userId);

    // Get user's blend intelligence and blueprint
    const [intelligenceResult, blueprintResult] = await Promise.all([
      supabase
        .from('hacs_blend_intelligence')
        .select('*')
        .eq('user_id', userId)
        .single(),
      supabase
        .from('blueprints')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()
    ]);

    const intelligence = intelligenceResult.data;
    const blueprint = blueprintResult.data;

    // Construct system prompt for blend mode (integration of productivity + spirituality)
    const systemPrompt = `You are HACS (Human-AI Conversation System) operating in BLEND mode - integrating productivity coaching with spiritual growth guidance.

CORE MISSION: Help users achieve holistic success by balancing practical achievement with soul fulfillment, productivity with presence, and outer goals with inner wisdom.

USER INTELLIGENCE LEVEL: ${intelligence?.intelligence_level || 50}/100
INTERACTION COUNT: ${intelligence?.interaction_count || 0}

${blueprint ? `
USER BLUEPRINT CONTEXT:
- MBTI Type: ${blueprint.cognition_mbti?.type || 'Unknown'}
- Human Design: ${blueprint.energy_strategy_human_design?.type || 'Unknown'} ${blueprint.energy_strategy_human_design?.authority || ''}
- Astrological Profile: ${blueprint.archetype_western?.sun_sign || ''} Sun, ${blueprint.archetype_western?.moon_sign || ''} Moon
- Life Path: ${blueprint.values_life_path?.lifePathNumber || 'Unknown'}
- Core Values: ${JSON.stringify(blueprint.values_life_path?.coreValues || [])}
` : ''}

CONVERSATION HISTORY:
${conversationHistory ? conversationHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n') : 'No previous conversation'}

BLEND MODE GUIDELINES:
1. INTEGRATION FOCUS: Always seek to harmonize productivity strategies with spiritual principles
2. HOLISTIC PERSPECTIVE: Address both practical efficiency AND soul alignment
3. BALANCED APPROACH: Avoid extremes - neither pure hustle nor pure spirituality
4. SUSTAINABLE PRACTICES: Recommend approaches that honor both achievement and well-being
5. PERSONALIZED GUIDANCE: Use blueprint data to suggest practices aligned with user's natural design

RESPONSE STYLE:
- Practical yet soulful
- Strategic yet intuitive
- Grounded yet expansive
- Action-oriented yet mindful

Your role is to help users create sustainable success that feeds both their ambitions and their soul.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Calculate intelligence bonus
    const intelligenceBonus = calculateBlendIntelligenceBonus(message, aiResponse);

    // Update blend intelligence
    if (intelligence) {
      await supabase
        .from('hacs_blend_intelligence')
        .update({
          intelligence_level: Math.min(100, (intelligence.intelligence_level || 50) + intelligenceBonus),
          interaction_count: (intelligence.interaction_count || 0) + 1,
          last_update: new Date().toISOString()
        })
        .eq('user_id', userId);
    } else {
      await supabase
        .from('hacs_blend_intelligence')
        .insert({
          user_id: userId,
          intelligence_level: 50 + intelligenceBonus,
          interaction_count: 1,
          module_scores: {}
        });
    }

    // Generate follow-up question (30% chance)
    let question = null;
    if (Math.random() < 0.3) {
      const currentIntelligence = (intelligence?.intelligence_level || 50) + intelligenceBonus;
      question = generateBlendQuestion(currentIntelligence);
    }

    return new Response(JSON.stringify({
      response: aiResponse,
      module: 'blend',
      mode: 'blend',
      intelligenceBonus,
      question
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in hacs-blend-conversation:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "I apologize, but I'm having trouble processing your request right now. Please try again."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateBlendIntelligenceBonus(userMessage: string, aiResponse: string): number {
  let bonus = 0;
  
  // Keyword analysis for integration concepts
  const integrationKeywords = ['balance', 'integrate', 'harmony', 'align', 'holistic', 'sustainable', 'flow'];
  const productivityKeywords = ['goal', 'productive', 'efficient', 'focus', 'achievement'];
  const spiritualKeywords = ['spiritual', 'soul', 'mindful', 'purpose', 'wisdom', 'intuition'];
  
  const messageWords = userMessage.toLowerCase();
  const responseWords = aiResponse.toLowerCase();
  
  // Bonus for integration focus
  integrationKeywords.forEach(keyword => {
    if (messageWords.includes(keyword) || responseWords.includes(keyword)) bonus += 1;
  });
  
  // Bonus for addressing both domains
  const hasProductivity = productivityKeywords.some(k => responseWords.includes(k));
  const hasSpiritual = spiritualKeywords.some(k => responseWords.includes(k));
  if (hasProductivity && hasSpiritual) bonus += 3;
  
  // Bonus for message complexity and response quality
  if (userMessage.length > 50) bonus += 1;
  if (aiResponse.length > 150) bonus += 2;
  
  return Math.min(bonus, 8); // Cap at 8 points
}

function generateBlendQuestion(intelligenceLevel: number): any {
  const questions = [
    {
      id: crypto.randomUUID(),
      text: "How do you balance ambitious goals with inner peace?",
      module: "blend",
      type: "foundational"
    },
    {
      id: crypto.randomUUID(),
      text: "What practices help you stay productive while honoring your spiritual needs?",
      module: "blend", 
      type: "validation"
    },
    {
      id: crypto.randomUUID(),
      text: "How do you integrate your intuitive insights with strategic planning?",
      module: "blend",
      type: "philosophical"
    },
    {
      id: crypto.randomUUID(),
      text: "What does sustainable success look like when it feeds both ambition and soul?",
      module: "blend",
      type: "philosophical"
    }
  ];
  
  return questions[Math.floor(Math.random() * questions.length)];
}