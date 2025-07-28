
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
    const requestBody = await req.json();
    console.log('Request received:', { 
      action: requestBody.action, 
      userId: requestBody.userId?.substring(0, 8) + '...' 
    });

    const { 
      action, // 'generate_question', 'respond_to_user', 'analyze_gap'
      userId,
      sessionId,
      conversationId,
      userMessage,
      messageHistory = [],
      forceQuestionGeneration = false,
      useUnifiedBrain = false, // CRITICAL: Enable unified brain processing
      agentMode = 'guide'
    } = requestBody;

    if (!userId) {
      throw new Error('userId is required');
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client created');

    // Get user blueprint and HACS intelligence with proper error handling
    let blueprintResult, hacsResult;
    
    try {
      // Query the correct user_blueprints table that actually exists
      blueprintResult = await supabase
        .from('user_blueprints')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();
      
      console.log('Blueprint query result:', { 
        hasData: !!blueprintResult.data,
        error: blueprintResult.error?.message 
      });
    } catch (error) {
      console.error('Blueprint query failed:', error);
      blueprintResult = { data: null, error };
    }

    try {
      hacsResult = await supabase
        .from('hacs_intelligence')
        .select('intelligence_level, module_scores')
        .eq('user_id', userId)
        .single();
      
      console.log('HACS intelligence query result:', { 
        hasData: !!hacsResult.data,
        error: hacsResult.error?.message 
      });
    } catch (error) {
      console.error('HACS intelligence query failed:', error);
      hacsResult = { data: null, error };
    }

    const blueprint = blueprintResult?.data;
    const hacsData = hacsResult?.data;

    // Authentic intelligence system - no hardcoded fallbacks
    const intelligenceData: HACSIntelligenceData = hacsData || { 
      intelligence_level: 0, 
      module_scores: HACS_MODULES.reduce((acc, module) => ({ ...acc, [module]: 0 }), {})
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
      const { data: newConversation, error: conversationError } = await supabase
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
      
      if (!conversation || conversationError) {
        console.error('Failed to create conversation:', conversationError);
        throw new Error(`Failed to create conversation: ${conversationError?.message || 'Unknown error'}`);
      }
    }

    // Build personality context from actual blueprint data with safe access
    let personalityContext = null;
    
    if (blueprint?.blueprint) {
      try {
        const blueprintData = blueprint.blueprint;
        console.log('Processing blueprint data for personality context');
        
        personalityContext = {
          name: blueprintData.user_meta?.preferred_name || 
                blueprintData.user_meta?.full_name?.split(' ')[0] || 
                'friend',
          fullName: blueprintData.user_meta?.full_name,
          // Use the correct path for MBTI from personality assessment
          mbti: blueprintData.user_meta?.personality?.likelyType || 
                blueprintData.cognition_mbti?.type,
          sunSign: blueprintData.archetype_western?.sun_sign,
          hdType: blueprintData.energy_strategy_human_design?.type,
          hdStrategy: blueprintData.energy_strategy_human_design?.strategy,
          hdAuthority: blueprintData.energy_strategy_human_design?.authority,
          lifePath: blueprintData.values_life_path?.life_path_number,
          chineseZodiac: `${blueprintData.archetype_chinese?.element} ${blueprintData.archetype_chinese?.animal}`,
          bigFive: blueprintData.user_meta?.personality?.bigFive,
          birthDate: blueprintData.user_meta?.birth_date,
          timezone: blueprintData.user_meta?.timezone
        };
        
        console.log('Personality context built:', {
          name: personalityContext.name,
          mbti: personalityContext.mbti,
          hdType: personalityContext.hdType,
          sunSign: personalityContext.sunSign
        });
      } catch (error) {
        console.error('Error building personality context:', error);
        personalityContext = null;
      }
    }

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
        // CRITICAL: Route through Unified Brain if flag is enabled
        if (useUnifiedBrain) {
          console.log('🧠 Routing through Unified Brain (all 11 Hermetic components)');
          
          try {
            // Call the unified brain processor
            const unifiedBrainResponse = await fetch(`${supabaseUrl}/functions/v1/unified-brain-processor`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId,
                sessionId,
                message: userMessage,
                agentMode,
                currentState: 'NORMAL'
              }),
            });

            if (!unifiedBrainResponse.ok) {
              throw new Error(`Unified Brain failed: ${unifiedBrainResponse.status}`);
            }

            const unifiedData = await unifiedBrainResponse.json();
            response = unifiedData.response;
            
            console.log(`✅ Unified Brain processed through ${unifiedData.processedModules}/11 Hermetic components`);
            
            // Log successful unified brain processing
            await supabase.from('dream_activity_logs').insert({
              user_id: userId,
              activity_type: 'unified_brain_conversation',
              activity_data: {
                processed_modules: unifiedData.processedModules,
                hermetic_results: unifiedData.hermeticResults?.length || 0,
                brain_metrics: unifiedData.brainMetrics
              },
              session_id: sessionId
            });

          } catch (error) {
            console.error('❌ Unified Brain routing failed, falling back to HACS:', error);
            
            // Fallback to original HACS processing
            response = await generateConversationalResponse(
              userMessage,
              messageHistory,
              intelligenceData,
              personalityContext,
              blueprint
            );
          }
        } else {
          // Original HACS processing (legacy mode)
          console.log('📡 Using legacy HACS processing (bypassing unified brain)');
          
          response = await generateConversationalResponse(
            userMessage,
            messageHistory,
            intelligenceData,
            personalityContext,
            blueprint
          );
        }

        // Check if we should generate a question after responding
        shouldGenerateQuestion = await shouldAskQuestion(
          supabase,
          userId,
          intelligenceData,
          messageHistory
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

        // CRITICAL: Update intelligence from conversation interaction
        const messageQuality = determineConversationQuality(userMessage, response);
        const moduleImprovements = {
          ACS: 0.2, // Adaptive Conversation System
          NIK: 0.1, // Neural Integration from processing
          CPSR: 0.1 // Pattern recognition from content
        };

        // Additional improvements based on content complexity
        if (userMessage.length > 100) {
          moduleImprovements.TWS = 0.1; // Temporal wisdom from complex discussions
        }

        const currentModuleScores = intelligenceData.module_scores || {};
        const newModuleScores = { ...currentModuleScores };
        
        Object.entries(moduleImprovements).forEach(([module, improvement]) => {
          const currentScore = newModuleScores[module] || 0;
          newModuleScores[module] = Math.min(100, currentScore + improvement * messageQuality);
        });

        const moduleValues = Object.values(newModuleScores);
        const newIntelligenceLevel = moduleValues.reduce((sum: number, score: any) => sum + Number(score), 0) / moduleValues.length;

        await supabase
          .from('hacs_intelligence')
          .upsert({
            user_id: userId,
            intelligence_level: Math.round(newIntelligenceLevel),
            module_scores: newModuleScores,
            interaction_count: (intelligenceData.intelligence_level > 0 ? 1 : 0) + 1,
            last_update: new Date().toISOString(),
            pie_score: Math.round(newModuleScores.PIE || 0),
            vfp_score: Math.round(newModuleScores.VFP || 0),
            tmg_score: Math.round(newModuleScores.TMG || 0),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        console.log('Intelligence updated from conversation:', { 
          oldLevel: intelligenceData.intelligence_level || 0, 
          newLevel: newIntelligenceLevel,
          messageQuality 
        });

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
        conversation_id: conversation.id,
        intelligence_updated: action === 'respond_to_user'
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

  const systemPrompt = `You are HACS (Holistic Adaptive Cognitive System), an advanced AI learning companion${personalityContext?.name ? ` for ${personalityContext.name}` : ''}.

PERSONALITY CONTEXT:
${personalityContext ? `- Name: ${personalityContext.name || 'User'}
- MBTI Type: ${personalityContext.mbti || 'Unknown'}
- Sun Sign: ${personalityContext.sunSign || 'Unknown'}
- Human Design Type: ${personalityContext.hdType || 'Unknown'}
- HD Strategy: ${personalityContext.hdStrategy || 'Unknown'}
- HD Authority: ${personalityContext.hdAuthority || 'Unknown'}
- Life Path Number: ${personalityContext.lifePath || 'Unknown'}
- Chinese Zodiac: ${personalityContext.chineseZodiac || 'Unknown'}
- Birth Date: ${personalityContext.birthDate || 'Unknown'}` : '- No detailed personality data available yet'}

LEARNING CONTEXT:
- Target Module: ${targetModule} (current score: ${moduleScore}%)
- Question Type: ${questionType}
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
- Helps HACS learn more about ${personalityContext?.name || 'the user'} in the ${targetModule} domain
- Is appropriate for their ${questionType} level
- Considers their personality type and recent conversation
- Avoids repeating recent questions
- Is natural and conversational, not clinical

Respond with ONLY the question, no explanation.`;

  const userPrompt = `Recent conversation context: ${JSON.stringify(questionContext.recentConversation)}

Generate a ${questionType} question for the ${targetModule} module to help me learn more about ${personalityContext?.name || 'the user'}.`;

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

  if (!response.ok) {
    console.error('OpenAI API error:', response.status, response.statusText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

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
  const systemPrompt = `You are HACS (Holistic Adaptive Cognitive System)${personalityContext?.name ? `, ${personalityContext.name}'s intelligent companion` : ', a learning companion'}.

PERSONALITY CONTEXT:
${personalityContext ? `- Name: ${personalityContext.name}
- MBTI Type: ${personalityContext.mbti} (${personalityContext.mbti === 'ENFP' ? 'Enthusiastic, creative, and inspiring' : 'Unique personality type'})
- Sun Sign: ${personalityContext.sunSign} (${personalityContext.sunSign?.includes('Aquarius') ? 'Independent innovator' : 'Astrological influence'})
- Human Design: ${personalityContext.hdType} - ${personalityContext.hdStrategy} | Authority: ${personalityContext.hdAuthority}
- Life Path: ${personalityContext.lifePath} (${personalityContext.lifePath === 3 ? 'Creative expression and communication' : 'Personal growth path'})
- Chinese Zodiac: ${personalityContext.chineseZodiac}
- Age: ${personalityContext.birthDate ? Math.floor((Date.now() - new Date(personalityContext.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 'Unknown'}` : '- Working to understand your unique personality profile'}
- Intelligence Level: ${intelligenceData.intelligence_level}%

RESPONSE GUIDELINES:
- Be warm, insightful, and genuinely supportive
- Reference their specific personality traits and blueprint when relevant
- Build on previous conversation naturally
- Ask follow-up questions when appropriate
- Show you're learning and growing with them through their conversations
- Be conversational, not clinical or robotic
- Keep responses under 100 words unless a longer response is clearly needed
- Remember you are their reflective blueprint - you know them deeply

Respond naturally as their intelligent companion who understands their unique blueprint and cares about their growth journey.`;

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

  if (!response.ok) {
    console.error('OpenAI API error in conversation response:', response.status, response.statusText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

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
    score: moduleScores[module] || 0,
    gapSize: 100 - (moduleScores[module] || 0),
    priority: calculatePriority(module, moduleScores[module] || 0, blueprint)
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

function determineConversationQuality(userMessage: string, hacsResponse: string): number {
  const messageLength = userMessage.length;
  const hasQuestions = userMessage.includes('?');
  const isEngaged = messageLength > 50 && (hasQuestions || userMessage.split(' ').length > 10);
  const isDeepResponse = hacsResponse.length > 100;
  
  if (isEngaged && isDeepResponse) return 1.0; // excellent
  if (isEngaged || isDeepResponse) return 0.8; // good
  if (messageLength > 20) return 0.5; // average
  return 0.2; // poor
}
