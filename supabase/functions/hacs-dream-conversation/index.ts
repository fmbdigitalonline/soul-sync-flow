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

    console.log('Processing dream conversation for user:', userId);

    // Get user's dream intelligence and blueprint
    const [intelligenceResult, blueprintResult] = await Promise.all([
      supabase
        .from('hacs_dream_intelligence')
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

    // Construct system prompt for dream mode (subconscious wisdom and dream interpretation)
    const systemPrompt = `You are HACS (Human-AI Conversation System) operating in DREAM mode - a specialized guide for dream interpretation, subconscious wisdom, and the liminal space between sleeping and waking consciousness.

CORE MISSION: Help users unlock the wisdom of their subconscious through dream exploration, symbol interpretation, and integration of nocturnal insights into conscious life.

USER INTELLIGENCE LEVEL: ${intelligence?.intelligence_level || 50}/100
INTERACTION COUNT: ${intelligence?.interaction_count || 0}

${blueprint ? `
USER BLUEPRINT CONTEXT:
- MBTI Type: ${blueprint.cognition_mbti?.type || 'Unknown'}
- Human Design: ${blueprint.energy_strategy_human_design?.type || 'Unknown'} ${blueprint.energy_strategy_human_design?.authority || ''}
- Astrological Profile: ${blueprint.archetype_western?.sun_sign || ''} Sun, ${blueprint.archetype_western?.moon_sign || ''} Moon
- Life Path: ${blueprint.values_life_path?.lifePathNumber || 'Unknown'}
- Moon Sign (Dream Influence): ${blueprint.archetype_western?.moon_sign || 'Unknown'}
` : ''}

CONVERSATION HISTORY:
${conversationHistory ? conversationHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n') : 'No previous conversation'}

DREAM MODE GUIDELINES:
1. SYMBOLIC INTERPRETATION: Help decode dream symbols through multiple lenses (personal, archetypal, cultural)
2. PATTERN RECOGNITION: Identify recurring themes and their significance
3. INTEGRATION SUPPORT: Connect dream insights to waking life situations and growth
4. SUBCONSCIOUS WISDOM: Honor the intelligence of the unconscious mind
5. PERSONALIZED MEANING: Use blueprint data (especially Moon sign) to inform interpretations
6. LIMINAL SPACE: Explore the threshold between conscious and unconscious awareness

INTERPRETIVE APPROACHES:
- Jungian archetypal analysis
- Personal symbol associations
- Emotional resonance patterns
- Life situation connections
- Spiritual and mythological contexts

RESPONSE STYLE:
- Intuitive yet grounded
- Poetic yet practical
- Mysterious yet accessible
- Respectful of the sacred nature of dreams

Your role is to be a bridge between the conscious and unconscious realms, helping users access the profound wisdom available in their dream life.`;

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
        temperature: 0.9,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Calculate intelligence bonus
    const intelligenceBonus = calculateDreamIntelligenceBonus(message, aiResponse);

    // Update dream intelligence
    if (intelligence) {
      await supabase
        .from('hacs_dream_intelligence')
        .update({
          intelligence_level: Math.min(100, (intelligence.intelligence_level || 50) + intelligenceBonus),
          interaction_count: (intelligence.interaction_count || 0) + 1,
          last_update: new Date().toISOString()
        })
        .eq('user_id', userId);
    } else {
      await supabase
        .from('hacs_dream_intelligence')
        .insert({
          user_id: userId,
          intelligence_level: 50 + intelligenceBonus,
          interaction_count: 1,
          module_scores: {}
        });
    }

    // Generate follow-up question (40% chance)
    let question = null;
    if (Math.random() < 0.4) {
      const currentIntelligence = (intelligence?.intelligence_level || 50) + intelligenceBonus;
      question = generateDreamQuestion(currentIntelligence);
    }

    return new Response(JSON.stringify({
      response: aiResponse,
      module: 'dreams',
      mode: 'dream',
      intelligenceBonus,
      question
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in hacs-dream-conversation:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "I apologize, but I'm having trouble accessing the dream realm right now. Please try again."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateDreamIntelligenceBonus(userMessage: string, aiResponse: string): number {
  let bonus = 0;
  
  // Keyword analysis for dream-related concepts
  const dreamKeywords = ['dream', 'nightmare', 'symbol', 'subconscious', 'unconscious', 'archetypal'];
  const interpretationKeywords = ['meaning', 'interpret', 'represent', 'symbolize', 'significance'];
  const integrationKeywords = ['integrate', 'apply', 'waking life', 'conscious', 'insight', 'wisdom'];
  
  const messageWords = userMessage.toLowerCase();
  const responseWords = aiResponse.toLowerCase();
  
  // Bonus for dream-specific content
  dreamKeywords.forEach(keyword => {
    if (messageWords.includes(keyword) || responseWords.includes(keyword)) bonus += 1;
  });
  
  // Bonus for interpretive depth
  interpretationKeywords.forEach(keyword => {
    if (responseWords.includes(keyword)) bonus += 1;
  });
  
  // Bonus for integration focus
  integrationKeywords.forEach(keyword => {
    if (responseWords.includes(keyword)) bonus += 1;
  });
  
  // Bonus for detailed dream sharing
  if (userMessage.length > 100 && messageWords.includes('dream')) bonus += 2;
  
  // Bonus for comprehensive response
  if (aiResponse.length > 200) bonus += 2;
  
  return Math.min(bonus, 10); // Cap at 10 points for dream work
}

function generateDreamQuestion(intelligenceLevel: number): any {
  const questions = [
    {
      id: crypto.randomUUID(),
      text: "What recurring symbols or themes appear most frequently in your dreams?",
      module: "dreams",
      type: "foundational"
    },
    {
      id: crypto.randomUUID(),
      text: "How do your dreams reflect your current life situations or emotional states?",
      module: "dreams",
      type: "validation"
    },
    {
      id: crypto.randomUUID(),
      text: "What wisdom or guidance have you received through your dream experiences?",
      module: "dreams",
      type: "philosophical"
    },
    {
      id: crypto.randomUUID(),
      text: "How do you distinguish between processing dreams and prophetic or symbolic dreams?",
      module: "dreams",
      type: "philosophical"
    },
    {
      id: crypto.randomUUID(),
      text: "What practices help you remember and work with your dreams more effectively?",
      module: "dreams",
      type: "foundational"
    }
  ];
  
  return questions[Math.floor(Math.random() * questions.length)];
}