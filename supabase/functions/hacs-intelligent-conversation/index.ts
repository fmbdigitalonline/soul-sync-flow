import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// HACS module configuration
const HACS_MODULES = [
  'PIE', 'CNR', 'TMG', 'DPEM', 'ACS', 'VFP', 'ECHO', 'FLUX', 'SYNC', 'ADAPT', 'EVOLVE'
];

interface ConversationMessage {
  id: string;
  role: 'user' | 'hacs';
  content: string;
  timestamp: string;
  module?: string;
  messageType?: string;
  questionId?: string;
}

interface HACSIntelligenceData {
  intelligence_level: number;
  module_scores: Record<string, number>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      action, // 'generate_question', 'respond_to_user', 'analyze_gap'
      userId,
      sessionId,
      conversationId,
      userMessage,
      messageHistory = [],
      forceQuestionGeneration = false
    } = await req.json();

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user blueprint and HACS intelligence
    const [{ data: blueprint }, { data: hacsData }] = await Promise.all([
      supabase
        .from('blueprints')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single(),
      supabase
        .from('hacs_intelligence')
        .select('intelligence_level, module_scores')
        .eq('user_id', userId)
        .single()
    ]);

    const intelligenceData: HACSIntelligenceData = hacsData || { 
      intelligence_level: 50, 
      module_scores: HACS_MODULES.reduce((acc, module) => ({ ...acc, [module]: 50 }), {})
    };

    // Get or create conversation record
    let conversation;
    if (conversationId) {
      const { data } = await supabase
        .from('hacs_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
      conversation = data;
    }

    if (!conversation) {
      const { data: newConversation } = await supabase
        .from('hacs_conversations')
        .insert({
          user_id: userId,
          session_id: sessionId,
          conversation_data: messageHistory,
          intelligence_level_start: intelligenceData.intelligence_level
        })
        .select()
        .single();
      conversation = newConversation;
    }

    // Build personality context
    const personalityContext = blueprint ? {
      name: blueprint.user_meta?.preferred_name || 'there',
      mbti: blueprint.cognition_mbti?.type || 'ENFP',
      sunSign: blueprint.archetype_western?.sun_sign || 'Aquarius',
      hdType: blueprint.energy_strategy_human_design?.type || 'Generator'
    } : { name: 'there', mbti: 'ENFP', sunSign: 'Aquarius', hdType: 'Generator' };

    let response = '';
    let generatedQuestion = null;
    let shouldGenerateQuestion = false;

    // Handle different actions
    switch (action) {
      case 'generate_question':
        const result = await generateAutonomousQuestion(
          supabase, 
          userId, 
          intelligenceData, 
          blueprint, 
          personalityContext, 
          messageHistory,
          conversation.id
        );
        generatedQuestion = result.question;
        response = result.response;
        break;

      case 'respond_to_user':
        // Check if we should generate a question after responding
        shouldGenerateQuestion = await shouldAskQuestion(
          supabase,
          userId,
          intelligenceData,
          messageHistory
        );

        // Generate conversational response
        response = await generateConversationalResponse(
          userMessage,
          messageHistory,
          intelligenceData,
          personalityContext,
          blueprint
        );

        // Store user message and response
        const updatedHistory = [
          ...messageHistory,
          {
            id: `user_${Date.now()}`,
            role: 'user',
            content: userMessage,
            timestamp: new Date().toISOString()
          },
          {
            id: `hacs_${Date.now()}`,
            role: 'hacs',
            content: response,
            timestamp: new Date().toISOString()
          }
        ];

        // Update conversation
        await supabase
          .from('hacs_conversations')
          .update({
            conversation_data: updatedHistory,
            last_activity: new Date().toISOString()
          })
          .eq('id', conversation.id);

        // Generate question if needed
        if (shouldGenerateQuestion || forceQuestionGeneration) {
          const questionResult = await generateAutonomousQuestion(
            supabase,
            userId,
            intelligenceData,
            blueprint,
            personalityContext,
            updatedHistory,
            conversation.id
          );
          generatedQuestion = questionResult.question;
        }
        break;

      case 'analyze_gap':
        const gaps = await analyzeIntelligenceGaps(intelligenceData, blueprint);
        response = JSON.stringify(gaps);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Log the interaction
    await supabase.from('dream_activity_logs').insert({
      user_id: userId,
      activity_type: 'hacs_intelligent_conversation',
      activity_data: {
        action,
        response_length: response.length,
        question_generated: !!generatedQuestion,
        intelligence_level: intelligenceData.intelligence_level,
        conversation_id: conversation.id
      },
      session_id: sessionId
    });

    return new Response(JSON.stringify({ 
      response,
      generatedQuestion,
      conversationId: conversation.id,
      intelligenceLevel: intelligenceData.intelligence_level,
      shouldGenerateQuestion,
      action
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in hacs-intelligent-conversation:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: 'I\'m here to support your growth journey.',
      generatedQuestion: null
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateAutonomousQuestion(
  supabase: any,
  userId: string,
  intelligenceData: HACSIntelligenceData,
  blueprint: any,
  personalityContext: any,
  messageHistory: ConversationMessage[],
  conversationId: string
) {
  // Identify the module with the lowest score that needs attention
  const moduleScores = intelligenceData.module_scores || {};
  const lowestModule = Object.entries(moduleScores)
    .sort(([,a], [,b]) => (a as number) - (b as number))[0];
  
  const targetModule = lowestModule[0];
  const moduleScore = lowestModule[1] as number;

  // Determine question type based on intelligence level
  let questionType = 'foundational';
  if (moduleScore >= 70) questionType = 'philosophical';
  else if (moduleScore >= 30) questionType = 'validation';

  // Get recent questions to avoid repetition
  const { data: recentQuestions } = await supabase
    .from('hacs_questions')
    .select('question_text, hacs_module')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  // Build context for question generation
  const questionContext = {
    module: targetModule,
    moduleScore,
    questionType,
    personalityContext,
    blueprint: blueprint ? {
      mbti: blueprint.cognition_mbti?.type,
      hdType: blueprint.energy_strategy_human_design?.type,
      sunSign: blueprint.archetype_western?.sun_sign,
      goals: blueprint.goal_stack || []
    } : null,
    recentConversation: messageHistory.slice(-3),
    recentQuestions: recentQuestions?.map(q => q.question_text) || []
  };

  const systemPrompt = `You are HACS (Holistic Adaptive Cognitive System), an advanced AI learning companion for ${personalityContext.name}.

CONTEXT:
- Target Module: ${targetModule} (current score: ${moduleScore}%)
- Question Type: ${questionType}
- User Personality: ${personalityContext.mbti} ${personalityContext.sunSign} ${personalityContext.hdType}
- Intelligence Level: ${intelligenceData.intelligence_level}%

QUESTION GENERATION RULES:
1. FOUNDATIONAL (0-30%): Ask basic questions to build understanding about the module's domain
2. VALIDATION (30-70%): Ask questions to validate and refine existing knowledge
3. PHILOSOPHICAL (70%+): Ask sophisticated questions that explore deeper connections and push boundaries

MODULE PURPOSES:
- PIE: Predictive Intelligence & Patterns
- CNR: Conflict & Negotiation Resolution  
- TMG: Temporal Memory & Growth
- DPEM: Dynamic Personality Expression
- ACS: Adaptive Communication Systems
- VFP: Values & Future Planning
- ECHO: Emotional Intelligence & Harmony
- FLUX: Change & Adaptation Management
- SYNC: Synchronicity & Life Alignment
- ADAPT: Learning & Self-Modification
- EVOLVE: Transcendence & Higher Purpose

Generate ONE thoughtful, personalized question that:
- Helps HACS learn more about ${personalityContext.name} in the ${targetModule} domain
- Is appropriate for their ${questionType} level
- Considers their personality type and recent conversation
- Avoids repeating recent questions
- Is natural and conversational, not clinical

Respond with ONLY the question, no explanation.`;

  const userPrompt = `Recent conversation context: ${JSON.stringify(questionContext.recentConversation)}

Generate a ${questionType} question for the ${targetModule} module to help me learn more about ${personalityContext.name}.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 150,
      temperature: 0.8,
    }),
  });

  const data = await response.json();
  const questionText = data.choices[0]?.message?.content?.trim() || 
    `I'm curious about your ${targetModule.toLowerCase()} patterns. Could you share more about that?`;

  // Store the generated question
  const { data: questionRecord } = await supabase
    .from('hacs_questions')
    .insert({
      user_id: userId,
      conversation_id: conversationId,
      hacs_module: targetModule,
      question_text: questionText,
      question_type: questionType,
      intelligence_level_when_asked: moduleScore,
      generated_context: questionContext
    })
    .select()
    .single();

  return {
    question: {
      id: questionRecord.id,
      text: questionText,
      module: targetModule,
      type: questionType
    },
    response: questionText
  };
}

async function generateConversationalResponse(
  userMessage: string,
  messageHistory: ConversationMessage[],
  intelligenceData: HACSIntelligenceData,
  personalityContext: any,
  blueprint: any
) {
  const systemPrompt = `You are HACS (Holistic Adaptive Cognitive System), ${personalityContext.name}'s intelligent companion.

PERSONALITY CONTEXT:
- Name: ${personalityContext.name}
- Type: ${personalityContext.mbti} ${personalityContext.sunSign} ${personalityContext.hdType}
- Intelligence Level: ${intelligenceData.intelligence_level}%

RESPONSE GUIDELINES:
- Be warm, insightful, and genuinely supportive
- Reference their personality when relevant
- Build on previous conversation naturally
- Ask follow-up questions when appropriate
- Show you're learning and growing with them
- Be conversational, not clinical or robotic
- Keep responses under 100 words unless a longer response is clearly needed

Respond naturally as their intelligent companion who cares about their growth and wellbeing.`;

  const conversationContext = messageHistory.slice(-5).map(msg => 
    `${msg.role}: ${msg.content}`
  ).join('\n');

  const userPrompt = `Previous conversation:
${conversationContext}

Current message: ${userMessage}

Respond as HACS:`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 200,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || 
    "I appreciate you sharing that with me. Tell me more about what you're experiencing.";
}

async function shouldAskQuestion(
  supabase: any,
  userId: string,
  intelligenceData: HACSIntelligenceData,
  messageHistory: ConversationMessage[]
): Promise<boolean> {
  // Get recent questions
  const { data: recentQuestions } = await supabase
    .from('hacs_questions')
    .select('asked_at')
    .eq('user_id', userId)
    .order('asked_at', { ascending: false })
    .limit(1);

  const lastQuestionTime = recentQuestions?.[0]?.asked_at;
  const timeSinceLastQuestion = lastQuestionTime ? 
    Date.now() - new Date(lastQuestionTime).getTime() : Infinity;

  // Don't ask too frequently (minimum 3 message exchanges)
  if (timeSinceLastQuestion < 3 * 60 * 1000) { // 3 minutes
    return false;
  }

  // Ask questions more frequently when intelligence is low
  const questionProbability = intelligenceData.intelligence_level < 50 ? 0.3 : 0.15;
  
  // Check conversation engagement (more engaged = more likely to ask)
  const recentUserMessages = messageHistory
    .filter(msg => msg.role === 'user')
    .slice(-3);
  
  const avgMessageLength = recentUserMessages.reduce((sum, msg) => 
    sum + msg.content.length, 0) / Math.max(recentUserMessages.length, 1);
  
  // Longer, more engaged messages = higher probability
  const engagementMultiplier = Math.min(avgMessageLength / 50, 2);
  
  return Math.random() < (questionProbability * engagementMultiplier);
}

async function analyzeIntelligenceGaps(
  intelligenceData: HACSIntelligenceData,
  blueprint: any
) {
  const moduleScores = intelligenceData.module_scores || {};
  
  const gaps = HACS_MODULES.map(module => ({
    module,
    score: moduleScores[module] || 50,
    gapSize: 100 - (moduleScores[module] || 50),
    priority: calculatePriority(module, moduleScores[module] || 50, blueprint)
  })).sort((a, b) => b.priority - a.priority);

  return {
    totalIntelligence: intelligenceData.intelligence_level,
    topGaps: gaps.slice(0, 3),
    allModules: gaps
  };
}

function calculatePriority(module: string, score: number, blueprint: any): number {
  let priority = 100 - score; // Base priority on gap size
  
  // Boost priority based on user's blueprint
  if (blueprint) {
    // Example: boost PIE for high-conscientiousness types
    if (module === 'PIE' && blueprint.cognition_mbti?.traits?.includes('J')) {
      priority *= 1.2;
    }
    // Add more module-specific boosts based on personality
  }
  
  return priority;
}