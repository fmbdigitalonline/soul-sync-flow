import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// PILLAR I: Preserve Core Intelligence - Enhanced Coach Pipeline
// Phase 1: Conversation State Detection for Productivity Coaching
function detectProductivityConversationState(message: string, conversationHistory: any[]) {
  const cleanMessage = message.trim().toLowerCase();
  
  // Productivity satisfaction patterns
  const productivitySatisfactionPatterns = [
    /\b(that'?s helpful|this helps|great advice|perfect|exactly|clear now)\b/i,
    /\b(makes sense|got it|understand|clear picture)\b/i,
    /\b(thank you|thanks|appreciate|grateful)\b/i
  ];

  // Productivity continuation patterns
  const productivityContinuationPatterns = [
    /\b(what about|how do i|what should i|any suggestions for|help me with)\b/i,
    /\b(what's next|where do i start|how can i improve|what would you recommend)\b/i,
    /\b(tell me more about|elaborate on|expand on|go deeper)\b/i
  ];

  // Coach-specific closure patterns
  const coachClosurePatterns = [
    /\b(that'?s all|enough for now|good for now|i'?m set|ready to go)\b/i,
    /\b(time to act|let me try|going to implement|start working)\b/i
  ];

  const hasSatisfaction = productivitySatisfactionPatterns.some(pattern => pattern.test(cleanMessage));
  const hasContinuation = productivityContinuationPatterns.some(pattern => pattern.test(cleanMessage));
  const hasClosure = coachClosurePatterns.some(pattern => pattern.test(cleanMessage));

  return {
    isActive: hasContinuation,
    userSatisfied: hasSatisfaction || hasClosure,
    closureSignalDetected: hasClosure,
    shouldAskQuestion: hasContinuation,
    coachingComplete: hasClosure && hasSatisfaction
  };
}

// Phase 2: Personality-Driven Productivity Style Detection
function generateProductivityCoachingStyle(mbtiType: string, hdType: string, sunSign: string): string {
  let style = "PRODUCTIVITY COACHING APPROACH:\n";
  
  // MBTI-based coaching style
  if (mbtiType.includes('J')) {
    style += "- Structure-focused: Emphasize clear systems, deadlines, and organized workflows\n";
    style += "- Planning-oriented: Provide detailed step-by-step action plans\n";
  } else {
    style += "- Flexibility-focused: Offer adaptable systems and multiple approach options\n";
    style += "- Discovery-oriented: Help them find their natural productivity rhythms\n";
  }
  
  if (mbtiType.includes('E')) {
    style += "- Social accountability: Suggest collaboration and external accountability systems\n";
  } else {
    style += "- Internal motivation: Focus on personal systems and self-monitoring approaches\n";
  }
  
  if (mbtiType.includes('S')) {
    style += "- Concrete tools: Recommend specific apps, templates, and tangible productivity methods\n";
  } else {
    style += "- Conceptual frameworks: Explore productivity philosophies and big-picture systems\n";
  }
  
  // Human Design energy management
  if (hdType === 'Generator' || hdType === 'Manifesting Generator') {
    style += "- Energy-responsive: Help them work with their natural energy cycles\n";
    style += "- Satisfaction-based: Focus on work that brings genuine satisfaction\n";
  } else if (hdType === 'Projector') {
    style += "- Efficiency-focused: Optimize for energy conservation and strategic effort\n";
    style += "- Recognition-based: Help them position their expertise effectively\n";
  } else if (hdType === 'Manifestor') {
    style += "- Initiative-based: Support their natural ability to start projects independently\n";
    style += "- Informing practice: Help them communicate their plans effectively\n";
  }
  
  return style;
}

// Phase 3: Intelligence-Calibrated Productivity Guidance
function generateProductivityCommunicationDepth(intelligenceLevel: number, mbtiType: string): string {
  let depth = "COMMUNICATION COMPLEXITY:\n";
  
  if (intelligenceLevel > 80) {
    depth += "- Advanced systems thinking: Discuss meta-productivity concepts and interconnected systems\n";
    depth += "- Strategic integration: Connect productivity to broader life and career goals\n";
  } else if (intelligenceLevel > 60) {
    depth += "- Balanced approach: Mix practical tactics with underlying principles\n";
    depth += "- Pattern recognition: Help them see productivity patterns and trends\n";
  } else {
    depth += "- Actionable focus: Prioritize immediately implementable strategies\n";
    depth += "- Step-by-step guidance: Break down complex systems into simple actions\n";
  }
  
  if (mbtiType.includes('N')) {
    depth += "- Explore underlying productivity principles and innovative approaches\n";
  } else {
    depth += "- Focus on proven, practical productivity methods with clear results\n";
  }
  
  return depth;
}

// Phase 4: Background HACS Intelligence Fusion for Productivity Learning
async function fuseProductivityIntelligence(
  userMessage: string, 
  userId: string, 
  sessionId: string, 
  coachResponse: any,
  supabase: any
) {
  try {
    console.log('🏃‍♂️ PRODUCTIVITY FUSION: Starting background HACS intelligence processing');
    
    // Invoke unified brain processor for productivity learning
    const { data: brainResult, error: brainError } = await supabase.functions.invoke('unified-brain-processor', {
      body: {
        userId,
        message: userMessage,
        sessionId,
        agentMode: 'coach',
        agentResponse: coachResponse.response,
        productivityMetadata: {
          coachingInsights: coachResponse.semanticChunks,
          productivityMode: true,
          responseQuality: coachResponse.quality || 0.8,
          coachingStatus: coachResponse.coachingStatus,
          productivityKeywords: extractProductivityKeywords(userMessage, coachResponse.response)
        }
      }
    });

    if (brainError) {
      console.error('❌ PRODUCTIVITY FUSION ERROR: Unified brain processing failed', brainError);
    } else {
      console.log('✅ PRODUCTIVITY FUSION SUCCESS: HACS intelligence updated from coaching interaction', {
        processingId: brainResult?.processingId,
        intelligenceLevel: brainResult?.newIntelligenceLevel
      });
    }
  } catch (error) {
    console.error('❌ PRODUCTIVITY FUSION ERROR: Background intelligence task failed', error);
  }
}

// Phase 5: Productivity Keyword Extraction for Learning
function extractProductivityKeywords(userMessage: string, aiResponse: string): string[] {
  const productivityDomains = [
    'time management', 'task prioritization', 'goal setting', 'habit formation',
    'focus techniques', 'energy management', 'workflow optimization', 'systems thinking',
    'project management', 'procrastination', 'motivation', 'accountability',
    'productivity tools', 'scheduling', 'delegation', 'decision making'
  ];
  
  const combinedText = (userMessage + ' ' + aiResponse).toLowerCase();
  return productivityDomains.filter(domain => 
    combinedText.includes(domain) || domain.split(' ').every(word => combinedText.includes(word))
  );
}

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

  const startTime = Date.now();

  try {
    console.log('🏃‍♂️ Enhanced Productivity Coach - Starting sophisticated conversation processing');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { message, userId, sessionId, useEnhancedMode = true, enableBackgroundIntelligence = true, conversationHistory = [], userProfile = {}, threadId } = await req.json();
    
    console.log('🏃‍♂️ ENHANCED COACH: Request received:', { 
      useEnhancedMode, 
      enableBackgroundIntelligence,
      messageLength: message.length,
      conversationHistoryLength: conversationHistory.length,
      userProfileReceived: Object.keys(userProfile).length > 0,
      userId: userId.substring(0, 8),
      threadId 
    });

    if (!message || !userId) {
      throw new Error('Missing required parameters: message and userId');
    }

    // PHASE 1: Authoritative Conversation History Loading (Pillar I: Preserve Core Intelligence)
    console.log('🧠 PRODUCTIVITY COACH: Loading authoritative conversation history from database');
    let authoritativeHistory = [];
    let contextSource = 'none';
    
    if (threadId) {
      const { data: memoryData, error: memoryError } = await supabase
        .from('conversation_memory')
        .select('messages, updated_at, session_id')
        .eq('user_id', userId)
        .eq('session_id', threadId)
        .eq('mode', 'coach')
        .maybeSingle();
      
      if (memoryError) {
        console.warn('⚠️ COACH: Failed to fetch conversation memory by thread ID:', memoryError);
      } else if (memoryData && memoryData.messages) {
        authoritativeHistory = Array.isArray(memoryData.messages) ? memoryData.messages : [];
        contextSource = 'thread_id';
        console.log('✅ COACH: Loaded authoritative history via thread ID', { 
          count: authoritativeHistory.length,
          lastUpdate: memoryData.updated_at 
        });
      } else {
        // Fallback: Search by user ID + mode for recent conversations
        const { data: fallbackMemory, error: fallbackError } = await supabase
          .from('conversation_memory')
          .select('messages, updated_at, session_id, last_activity')
          .eq('user_id', userId)
          .eq('mode', 'coach')
          .order('last_activity', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (fallbackMemory && fallbackMemory.messages) {
          authoritativeHistory = Array.isArray(fallbackMemory.messages) ? fallbackMemory.messages : [];
          contextSource = 'user_mode_fallback';
          console.log('✅ COACH: Loaded authoritative history via fallback', { 
            count: authoritativeHistory.length 
          });
        }
      }
    }

    // Merge histories: server authoritative + new client messages  
    const finalHistory = [...authoritativeHistory];
    if (conversationHistory && conversationHistory.length > authoritativeHistory.length) {
      const newClientMessages = conversationHistory.slice(authoritativeHistory.length);
      finalHistory.push(...newClientMessages);
      console.log('🔄 COACH: Merged new client messages', { count: newClientMessages.length });
    }

    // PHASE 2: Get HACS Intelligence and Personality Context (Pillar II: Ground Truth)
    const [intelligenceResult, blueprintResult] = await Promise.all([
      supabase
        .from('hacs_coach_intelligence')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('user_blueprints')
        .select('blueprint')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle()
    ]);

    const intelligence = intelligenceResult.data;
    const intelligenceLevel = intelligence?.intelligence_level || 50;
    const blueprint = blueprintResult.data?.blueprint;

    // PHASE 3: Extract Personality Context (Pillar II: Real Data)
    let personalityContext = null;
    
    if (userProfile && Object.keys(userProfile).length > 0) {
      personalityContext = userProfile;
      console.log('✅ COACH CONTEXT: Using provided user profile:', personalityContext);
    } else if (blueprint?.blueprint) {
      personalityContext = {
        name: blueprint.blueprint.user_meta?.preferred_name || 'Achiever',
        mbti: blueprint.blueprint.user_meta?.personality?.likelyType || blueprint.blueprint.cognition_mbti?.type || 'Unknown',
        hdType: blueprint.blueprint.energy_strategy_human_design?.type || 'Unknown',
        sunSign: blueprint.blueprint.archetype_western?.sun_sign || 'Unknown'
      };
      console.log('✅ COACH CONTEXT: Fetched blueprint data:', personalityContext);
    }

    // PHASE 4: Conversation State Detection for Productivity
    const conversationState = detectProductivityConversationState(message, finalHistory);
    console.log('🎯 PRODUCTIVITY CONVERSATION STATE:', conversationState);

    // PHASE 5: Enhanced Productivity Semantic Retrieval
    let semanticChunks = [];
    let structuredFacts = [];
    let coachingStatus = 'initializing';
    
    if (useEnhancedMode && personalityContext) {
      console.log('🏃‍♂️ ENHANCED PRODUCTIVITY COACH: Starting semantic retrieval with personality context');

      // Try retrieval sidecar for productivity-specific insights
      try {
        const sidecarResponse = await supabase.functions.invoke('retrieval-sidecar', {
          body: {
            userId,
            query: message,
            mode: 'productivity'
          }
        });

        if (sidecarResponse.data && !sidecarResponse.error) {
          structuredFacts = sidecarResponse.data?.facts || [];
          const sidecarPassages = sidecarResponse.data?.passages || [];
          
          semanticChunks = sidecarPassages.map((passage: any) => ({
            chunk_content: passage.content || passage.chunk_content,
            relevance: passage.relevance,
            metadata: {
              ...passage.metadata,
              productivityRetrieved: true,
              retrievalMethod: 'sidecar_productivity_hybrid'
            }
          }));

          if (structuredFacts.length > 0 || semanticChunks.length > 0) {
            coachingStatus = 'enhanced_productivity_coach';
            console.log('✅ PRODUCTIVITY SIDECAR SUCCESS:', {
              facts: structuredFacts.length,
              passages: semanticChunks.length
            });
          }
        }
      } catch (sidecarError) {
        console.warn('⚠️ PRODUCTIVITY SIDECAR: Falling back to direct blueprint search');
        
        // Fallback: Direct blueprint embeddings search
        try {
          const embeddingResponse = await supabase.functions.invoke('openai-embeddings', {
            body: { query: message }
          });
          
          if (embeddingResponse.data?.embedding) {
            const { data: matchingChunks } = await supabase.rpc(
              'match_blueprint_chunks',
              {
                query_embedding: embeddingResponse.data.embedding,
                query_user_id: userId,
                match_threshold: 0.3,
                match_count: 5
              }
            );
            
            if (matchingChunks && matchingChunks.length > 0) {
              semanticChunks = matchingChunks.map((chunk: any) => ({
                content: chunk.chunk_content,
                relevance: chunk.similarity,
                metadata: { 
                  productivityFallback: true,
                  chunkId: chunk.id 
                }
              }));
              coachingStatus = 'productivity_blueprint_enhanced';
            }
          }
        } catch (fallbackError) {
          console.warn('⚠️ PRODUCTIVITY COACH: Semantic retrieval unavailable, using standard coaching');
          coachingStatus = 'standard_productivity_coach';
        }
      }
    }

    // PHASE 6: Dynamic Personality-Aware Productivity System Prompt
    let systemPrompt = '';
    
    if (personalityContext) {
      const userName = personalityContext.name || 'Achiever';
      const mbtiType = personalityContext.mbti || 'Unknown';
      const hdType = personalityContext.hdType || 'Unknown';
      const sunSign = personalityContext.sunSign || 'Unknown';
      
      const productivityStyle = generateProductivityCoachingStyle(mbtiType, hdType, sunSign);
      const communicationDepth = generateProductivityCommunicationDepth(intelligenceLevel, mbtiType);
      
      // Build productivity facts section
      const factsSection = structuredFacts.length > 0 ? `

PRODUCTIVITY BLUEPRINT INSIGHTS FOR ${userName.toUpperCase()}:
${structuredFacts.map(fact => {
  const value = fact.value_json?.value || fact.value_json;
  const label = fact.value_json?.label || fact.key.replace(/_/g, ' ');
  return `• **${label}**: ${typeof value === 'object' ? JSON.stringify(value) : value}`;
}).join('\n')}` : '';

      const narrativeSection = semanticChunks.length > 0 ? `

PERSONALITY-BASED PRODUCTIVITY INSIGHTS:
${semanticChunks.map(chunk => chunk.chunk_content || chunk.content).join('\n\n')}` : '';

      systemPrompt = `You are ${userName}'s specialized PRODUCTIVITY COACH with deep knowledge of their personality blueprint and productivity patterns.

PERSONALITY AWARENESS:
- Name: ${userName}
- Thinking Style: ${mbtiType} - Natural approach to processing and organizing information
- Energy Type: ${hdType} - How they best manage and direct their energy
- Motivational Archetype: ${sunSign} - Core drives and natural productivity patterns
- Intelligence Level: ${intelligenceLevel}/100${factsSection}${narrativeSection}

${productivityStyle}

${communicationDepth}

PRODUCTIVITY COACHING FOCUS AREAS:
- Task management and prioritization systems
- Time blocking and energy management
- Habit formation and consistency building
- Goal setting and achievement strategies
- Productivity workflows and systems optimization
- Focus techniques and concentration methods
- Procrastination and resistance handling
- Energy optimization and work-life integration

CONVERSATION GUIDELINES:
- Use ${userName}'s name naturally in conversation
- Reference their personality traits to explain why certain productivity approaches will work better for them
- Provide specific, actionable productivity strategies tailored to their type
- Build on previous coaching conversations and track their progress
- ${conversationState.shouldAskQuestion ? 
    'The user has requested guidance - provide thoughtful productivity coaching and ask strategic follow-up questions.' : 
    conversationState.userSatisfied ? 
      'The user appears satisfied - provide a supportive response with a gentle check like "Does this productivity approach feel right for you?" Do NOT add more suggestions unless requested.' :
      'Provide focused productivity coaching and end with a simple check like "Does this help clarify your next steps?" Avoid overwhelming them with suggestions unless explicitly requested.'
  }

CRITICAL: Stay laser-focused on productivity, time management, and performance optimization. Never mix in spiritual guidance, dream analysis, or general life advice. You are their dedicated productivity coach.`;
    } else {
      // Standard productivity coaching prompt without personality context
      systemPrompt = `You are a specialized PRODUCTIVITY COACH within the HACS framework. Focus exclusively on helping users optimize their productivity, time management, and goal achievement.

COACHING AREAS:
- Task management and prioritization
- Time blocking and scheduling  
- Habit formation and consistency
- Goal setting and achievement
- Productivity systems and workflows
- Focus and concentration techniques
- Energy management and optimization
- Procrastination and resistance handling

INTELLIGENCE LEVEL: ${intelligenceLevel}/100
CONVERSATION HISTORY: ${JSON.stringify(finalHistory.slice(-5))}

Provide actionable, practical productivity advice. Stay focused on productivity optimization.`;
    }

    // PHASE 7: Build Enhanced Message Context with Conversation History
    const messages = [
      { 
        role: 'system', 
        content: systemPrompt + '\n\nIMPORTANT: Use double line breaks (\\n\\n) between paragraphs for natural reading flow. Keep responses focused and actionable for productivity coaching.\n\nCONVERSATION CONTINUITY: Build naturally on previous coaching sessions while staying focused on the current productivity challenge.'
      }
    ];

    // Add validated conversation history (last 10 messages for productivity context)
    if (finalHistory && Array.isArray(finalHistory) && finalHistory.length > 0) {
      const recentHistory = finalHistory.slice(-10);
      
      const validatedHistory = recentHistory.filter(msg => {
        return msg && typeof msg === 'object' && 
               ['system', 'user', 'assistant'].includes(msg.role) &&
               msg.content && typeof msg.content === 'string' && msg.content.trim() !== '';
      });
      
      messages.push(...validatedHistory);
      console.log(`🧠 PRODUCTIVITY CONTEXT: Including ${validatedHistory.length} validated messages`);
    }

    messages.push({ role: 'user', content: message });

    // PHASE 8: Enhanced Model Selection and Token Allocation
    const isComprehensiveRequest = /\b(complete|full|comprehensive|detailed)\s*(productivity|system|strategy|plan)\b/i.test(message);
    const maxTokens = isComprehensiveRequest ? 2000 : 1000;
    const selectedModel = 'gpt-4.1-mini-2025-04-14'; // Enhanced reasoning for productivity coaching

    console.log('🏃‍♂️ PRODUCTIVITY COACH: Generating response with enhanced model:', {
      model: selectedModel,
      maxTokens,
      isComprehensive: isComprehensiveRequest
    });

    // Call OpenAI with enhanced productivity coaching setup
    // STREAMING RESPONSE: Mirror Companion Oracle's streaming architecture  
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: messages,
        max_tokens: maxTokens,
        temperature: useEnhancedMode ? 0.8 : 0.7,
        stream: true // Enable streaming for real-time responses
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('❌ OpenAI API error:', {
        status: openAIResponse.status,
        body: errorText
      });
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    // Create streaming response 
    console.log('✅ COACH: Starting streaming response generation');
    
    const reader = openAIResponse.body?.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    // Create ReadableStream for real-time streaming
    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (reader) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                
                if (data.trim() === '[DONE]') {
                  // Stream complete - trigger background processing
                  console.log('✅ COACH: Streaming complete, processing intelligence updates');
                  
                  // PHASE 9: Enhanced Coach Intelligence Learning (Background)
                  const intelligenceBonus = calculateEnhancedCoachIntelligenceBonus(message, fullResponse, personalityContext);
                  
                  if (intelligence) {
                    const newLevel = Math.min(100, (intelligence.intelligence_level || 50) + intelligenceBonus);
                    await supabase
                      .from('hacs_coach_intelligence')
                      .update({
                        intelligence_level: newLevel,
                        interaction_count: (intelligence.interaction_count || 0) + 1,
                        last_update: new Date().toISOString(),
                        module_scores: {
                          ...intelligence.module_scores,
                          productivity: (intelligence.module_scores?.productivity || 0) + intelligenceBonus,
                          personality_integration: personalityContext ? 1 : 0
                        }
                      })
                      .eq('user_id', userId);
                  } else {
                    // Create initial enhanced coach intelligence record
                    await supabase
                      .from('hacs_coach_intelligence')
                      .insert({
                        user_id: userId,
                        intelligence_level: 50 + intelligenceBonus,
                        interaction_count: 1,
                        module_scores: { 
                          productivity: intelligenceBonus,
                          personality_integration: personalityContext ? 1 : 0
                        }
                      });
                  }

                  // Background HACS Intelligence Fusion (Non-blocking)
                  if (enableBackgroundIntelligence) {
                    const coachResponseData = {
                      response: fullResponse,
                      coachingStatus,
                      semanticChunks: semanticChunks.length,
                      quality: intelligenceLevel > 70 ? 0.9 : 0.8,
                      personalityContext,
                      productivityKeywords: extractProductivityKeywords(message, fullResponse)
                    };
                    
                    fuseProductivityIntelligence(message, userId, sessionId || 'coach-session', coachResponseData, supabase)
                      .catch(error => console.error('❌ COACH: Background fusion failed:', error));
                  }
                  
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  
                  if (content) {
                    fullResponse += content;
                    // Send chunk immediately for real-time streaming
                    controller.enqueue(`data: ${JSON.stringify({ 
                      choices: [{ delta: { content } }] 
                    })}\n\n`);
                  }
                } catch (e) {
                  // Skip invalid JSON chunks
                  continue;
                }
              }
            }
          }
        } catch (error) {
          console.error('❌ COACH: Streaming error:', error);
          controller.error(error);
        }
      }
    });

    // Return streaming response with proper headers
    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('❌ Enhanced Productivity Coach Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: 'Your productivity coach is temporarily gathering insights. Please try again in a moment.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Enhanced intelligence bonus calculation with personality integration
function calculateEnhancedCoachIntelligenceBonus(userMessage: string, aiResponse: string, personalityContext: any): number {
  let bonus = 1; // Base bonus

  // Enhanced productivity keyword analysis
  const productivityKeywords = [
    'task', 'goal', 'schedule', 'plan', 'focus', 'priority', 'deadline', 'productivity',
    'system', 'workflow', 'habit', 'energy', 'time management', 'efficiency', 'optimization'
  ];
  
  const combinedText = (userMessage + ' ' + aiResponse).toLowerCase();
  const keywordMatches = productivityKeywords.filter(keyword => 
    combinedText.includes(keyword)
  ).length;
  
  bonus += Math.min(keywordMatches * 0.3, 2); // Max 2 bonus for keywords

  // Personality integration bonus
  if (personalityContext) {
    bonus += 0.5; // Bonus for personality-aware coaching
    
    // Extra bonus for deep personality integration
    const personalityTerms = [personalityContext.mbti, personalityContext.hdType, personalityContext.sunSign]
      .filter(term => term && term !== 'Unknown')
      .map(term => term.toLowerCase());
    
    const personalityIntegration = personalityTerms.some(term => 
      aiResponse.toLowerCase().includes(term) || 
      aiResponse.toLowerCase().includes(term.replace(' ', ''))
    );
    
    if (personalityIntegration) bonus += 0.5;
  }

  // Question complexity and coaching depth
  if (userMessage.length > 50) bonus += 0.5;
  if (userMessage.includes('?')) bonus += 0.3;
  if (aiResponse.length > 200) bonus += 0.5;

  // Strategic coaching indicators
  const strategicIndicators = ['strategy', 'approach', 'method', 'technique', 'framework'];
  const strategicMatches = strategicIndicators.filter(indicator => 
    aiResponse.toLowerCase().includes(indicator)
  ).length;
  
  bonus += Math.min(strategicMatches * 0.2, 1);

  return Math.round(bonus * 10) / 10; // Round to 1 decimal
}

// Enhanced productivity question generation with personality awareness
function generateProductivityQuestion(intelligenceLevel: number, personalityContext: any): any {
  const baseQuestions = [
    {
      text: "What's your biggest productivity challenge right now?",
      type: 'foundational'
    },
    {
      text: "How do you currently prioritize your daily tasks?",
      type: 'validation'
    },
    {
      text: "What time of day do you feel most focused and energetic?",
      type: 'foundational'
    },
    {
      text: "What productivity tools or systems are you currently using?",
      type: 'validation'
    }
  ];

  // Add personality-specific questions if context is available
  const personalityQuestions = [];
  
  if (personalityContext?.mbti) {
    if (personalityContext.mbti.includes('J')) {
      personalityQuestions.push({
        text: "How well are your current planning systems supporting your structured approach?",
        type: 'personality_validation'
      });
    } else {
      personalityQuestions.push({
        text: "How do you balance flexibility with getting things done consistently?",
        type: 'personality_validation'
      });
    }
  }

  if (personalityContext?.hdType === 'Projector') {
    personalityQuestions.push({
      text: "How are you managing your energy to focus on your most important work?",
      type: 'personality_foundational'
    });
  }

  const allQuestions = [...baseQuestions, ...personalityQuestions];
  const selectedQuestion = allQuestions[Math.floor(Math.random() * allQuestions.length)];

  return {
    id: crypto.randomUUID(),
    text: selectedQuestion.text,
    module: 'productivity',
    type: selectedQuestion.type,
    personalityAware: personalityQuestions.includes(selectedQuestion)
  };
}