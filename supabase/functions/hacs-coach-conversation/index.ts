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

    console.log(`🎯 COACH MODE: Processing message for user ${userId}`);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's coach intelligence and personality context
    const [intelligenceResult, blueprintResult] = await Promise.all([
      supabase
        .from('hacs_coach_intelligence')
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

    // Coach-specific system prompt focused on productivity
    const systemPrompt = `You are a specialized PRODUCTIVITY COACH within the HACS (Holistic Adaptive Cognition System) framework. Your sole purpose is to help users optimize their productivity, time management, and goal achievement.

COACH MODE FOCUS AREAS:
- Task management and prioritization
- Time blocking and scheduling
- Habit formation and consistency
- Goal setting and achievement
- Productivity systems and workflows
- Focus and concentration techniques
- Energy management and optimization
- Procrastination and resistance handling

PERSONALITY CONTEXT: ${blueprint ? JSON.stringify(blueprint) : 'Standard coaching approach'}

CURRENT INTELLIGENCE LEVEL: ${intelligence?.intelligence_level || 50}/100
COACH INTELLIGENCE METRICS: ${JSON.stringify(intelligence?.module_scores || {})}

CONVERSATION HISTORY: ${JSON.stringify(conversationHistory)}

CRITICAL INSTRUCTIONS:
1. STAY IN COACH MODE - Only provide productivity-focused guidance
2. Use the user's personality context to tailor your coaching style
3. Build on previous conversation context
4. Provide actionable, practical advice
5. Ask specific follow-up questions about productivity challenges
6. Never mix spiritual growth or dream analysis into coach responses

USER MESSAGE: "${message}"

Respond as a specialized productivity coach, maintaining strict focus on productivity and performance optimization.`;

    // Call OpenAI with coach-specific prompt
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

    // Update coach intelligence based on interaction
    const intelligenceBonus = calculateCoachIntelligenceBonus(message, response);
    
    if (intelligence) {
      const newLevel = Math.min(100, (intelligence.intelligence_level || 50) + intelligenceBonus);
      await supabase
        .from('hacs_coach_intelligence')
        .update({
          intelligence_level: newLevel,
          interaction_count: (intelligence.interaction_count || 0) + 1,
          last_update: new Date().toISOString()
        })
        .eq('user_id', userId);
    } else {
      // Create initial coach intelligence record
      await supabase
        .from('hacs_coach_intelligence')
        .insert({
          user_id: userId,
          intelligence_level: 50 + intelligenceBonus,
          interaction_count: 1,
          module_scores: { productivity: intelligenceBonus }
        });
    }

    // Generate coach-specific question occasionally
    let question = null;
    if (Math.random() < 0.3) { // 30% chance
      question = generateCoachQuestion(intelligence?.intelligence_level || 50);
    }

    console.log(`🎯 COACH: Response generated, intelligence bonus: +${intelligenceBonus}`);

    return new Response(
      JSON.stringify({
        response,
        module: 'productivity',
        mode: 'coach',
        intelligenceBonus,
        question
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in hacs-coach-conversation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function calculateCoachIntelligenceBonus(userMessage: string, aiResponse: string): number {
  // Calculate intelligence bonus based on coach-specific criteria
  let bonus = 1; // Base bonus

  // Bonus for productivity keywords
  const productivityKeywords = ['task', 'goal', 'schedule', 'plan', 'focus', 'priority', 'deadline', 'productivity'];
  const keywordMatches = productivityKeywords.filter(keyword => 
    userMessage.toLowerCase().includes(keyword) || aiResponse.toLowerCase().includes(keyword)
  ).length;
  
  bonus += Math.min(keywordMatches * 0.5, 3); // Max 3 bonus for keywords

  // Bonus for question complexity
  if (userMessage.length > 50) bonus += 1;
  if (userMessage.includes('?')) bonus += 0.5;

  // Bonus for detailed response
  if (aiResponse.length > 100) bonus += 1;

  return Math.round(bonus * 10) / 10; // Round to 1 decimal
}

function generateCoachQuestion(intelligenceLevel: number): any {
  const questions = [
    {
      id: crypto.randomUUID(),
      text: "What's your biggest productivity challenge right now?",
      module: 'productivity',
      type: 'foundational'
    },
    {
      id: crypto.randomUUID(),
      text: "How do you currently prioritize your daily tasks?",
      module: 'productivity',
      type: 'validation'
    },
    {
      id: crypto.randomUUID(),
      text: "What time of day do you feel most focused and energetic?",
      module: 'productivity',
      type: 'foundational'
    },
    {
      id: crypto.randomUUID(),
      text: "What tools or systems do you use to track your goals?",
      module: 'productivity',
      type: 'validation'
    }
  ];

  return questions[Math.floor(Math.random() * questions.length)];
}