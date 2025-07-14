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

    console.log(`🌙 DREAM MODE: Processing message for user ${userId}`);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's dream intelligence and personality context
    const [intelligenceResult, blueprintResult] = await Promise.all([
      supabase
        .from('hacs_dream_intelligence')
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

    // Dream-specific system prompt focused on subconscious wisdom
    const systemPrompt = `You are a specialized DREAM GUIDE within the HACS (Holistic Adaptive Cognition System) framework. Your purpose is to help users explore subconscious wisdom, dream interpretation, and intuitive insights.

DREAM MODE FOCUS AREAS:
- Dream analysis and interpretation
- Subconscious pattern recognition
- Symbolic thinking and metaphorical understanding
- Intuitive wisdom and inner knowing
- Shadow work and unconscious integration
- Creative inspiration and artistic expression
- Mystical experiences and spiritual insights
- Archetypal patterns and universal themes

PERSONALITY CONTEXT: ${blueprint ? JSON.stringify(blueprint) : 'Standard dream analysis approach'}

CURRENT INTELLIGENCE LEVEL: ${intelligence?.intelligence_level || 50}/100
DREAM INTELLIGENCE METRICS: ${JSON.stringify(intelligence?.module_scores || {})}

CONVERSATION HISTORY: ${JSON.stringify(conversationHistory)}

CRITICAL INSTRUCTIONS:
1. STAY IN DREAM MODE - Focus on subconscious and intuitive exploration
2. Help users interpret dreams and symbolic experiences
3. Explore archetypal patterns and deeper meanings
4. Facilitate connection with inner wisdom and intuition
5. Ask questions that reveal subconscious insights
6. Never mix productivity coaching or practical planning into dream responses

USER MESSAGE: "${message}"

Respond as a specialized dream interpreter and guide to the subconscious, maintaining focus on symbolic wisdom and intuitive understanding.`;

    // Call OpenAI with dream-specific prompt
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
        temperature: 0.8, // Higher temperature for more creative responses
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    const response = openAIData.choices[0].message.content;

    // Update dream intelligence based on interaction
    const intelligenceBonus = calculateDreamIntelligenceBonus(message, response);
    
    if (intelligence) {
      const newLevel = Math.min(100, (intelligence.intelligence_level || 50) + intelligenceBonus);
      await supabase
        .from('hacs_dream_intelligence')
        .update({
          intelligence_level: newLevel,
          interaction_count: (intelligence.interaction_count || 0) + 1,
          last_update: new Date().toISOString()
        })
        .eq('user_id', userId);
    } else {
      // Create initial dream intelligence record
      await supabase
        .from('hacs_dream_intelligence')
        .insert({
          user_id: userId,
          intelligence_level: 50 + intelligenceBonus,
          interaction_count: 1,
          module_scores: { subconscious: intelligenceBonus }
        });
    }

    // Generate dream-specific question occasionally
    let question = null;
    if (Math.random() < 0.3) { // 30% chance
      question = generateDreamQuestion(intelligence?.intelligence_level || 50);
    }

    console.log(`🌙 DREAM: Response generated, intelligence bonus: +${intelligenceBonus}`);

    return new Response(
      JSON.stringify({
        response,
        module: 'subconscious',
        mode: 'dream',
        intelligenceBonus,
        question
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in hacs-dream-conversation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function calculateDreamIntelligenceBonus(userMessage: string, aiResponse: string): number {
  // Calculate intelligence bonus based on dream-specific criteria
  let bonus = 1; // Base bonus

  // Bonus for dream and symbolic keywords
  const dreamKeywords = ['dream', 'symbol', 'intuition', 'subconscious', 'meaning', 'archetype', 'vision', 'feeling'];
  const keywordMatches = dreamKeywords.filter(keyword => 
    userMessage.toLowerCase().includes(keyword) || aiResponse.toLowerCase().includes(keyword)
  ).length;
  
  bonus += Math.min(keywordMatches * 0.5, 3); // Max 3 bonus for keywords

  // Bonus for emotional depth and imagery
  if (userMessage.length > 60) bonus += 1;
  if (userMessage.includes('?')) bonus += 0.5;

  // Bonus for rich symbolic response
  if (aiResponse.length > 100) bonus += 1;

  return Math.round(bonus * 10) / 10; // Round to 1 decimal
}

function generateDreamQuestion(intelligenceLevel: number): any {
  const questions = [
    {
      id: crypto.randomUUID(),
      text: "What symbols or images have been appearing in your dreams recently?",
      module: 'subconscious',
      type: 'foundational'
    },
    {
      id: crypto.randomUUID(),
      text: "How do you typically feel when you wake up from vivid dreams?",
      module: 'subconscious',
      type: 'validation'
    },
    {
      id: crypto.randomUUID(),
      text: "What recurring themes do you notice in your inner experiences?",
      module: 'subconscious',
      type: 'foundational'
    },
    {
      id: crypto.randomUUID(),
      text: "When do you feel most connected to your intuitive wisdom?",
      module: 'subconscious',
      type: 'validation'
    }
  ];

  return questions[Math.floor(Math.random() * questions.length)];
}