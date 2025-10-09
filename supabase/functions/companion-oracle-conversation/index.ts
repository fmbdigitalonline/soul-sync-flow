import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// PHASE 1: Import ConversationShadowDetector for insight generation
// Import path is relative to edge function, resolving to project src
import { ConversationShadowDetector } from '../../../src/services/conversation-shadow-detector.ts'

// Helper function to detect if user wants technical personality details
function detectTechnicalDetailRequest(message: string): boolean {
  const technicalKeywords = /\b(mbti|human design|personality type|what.*type|technical|specific|sun sign|projector|enfp|intj|generator|manifestor|manifesting generator|reflector)\b/i;
  return technicalKeywords.test(message);
}

function getConversationFlowGuidance(conversationState: any): string {
  if (conversationState.shouldAskQuestion) {
    return 'The user has explicitly requested suggestions or asked for more information. You may provide thoughtful guidance and ask follow-up questions.';
  }
  if (conversationState.userSatisfied || conversationState.closureSignalDetected) {
    return 'The user appears satisfied or has indicated closure. Respond warmly with a gentle satisfaction check like "Does this help clarify things for you?" or "I hope this gives you the clarity you were looking for." Do NOT add suggestions or additional questions.';
  }
  return 'Provide a direct, helpful response and end with a simple satisfaction check like "Does this help clarify what you were looking for?" or "Is there anything about this you\'d like me to explore further?" Do NOT automatically provide suggestions unless explicitly requested.';
}

// Helper function to convert MBTI types to natural descriptions
function getThinkingStyleDescription(mbtiType: string): string {
  const descriptions: Record<string, string> = {
    'ENFP': 'creative and inspiring explorer',
    'INTJ': 'strategic and analytical architect', 
    'INFP': 'values-driven and empathetic idealist',
    'ENTP': 'innovative and enthusiastic debater',
    'INFJ': 'insightful and visionary advocate',
    'ENTJ': 'confident and natural-born leader',
    'ISFP': 'gentle and harmonious artist',
    'ESFP': 'spontaneous and enthusiastic entertainer',
    'ISFJ': 'warm and dedicated protector',
    'ESFJ': 'caring and social connector',
    'ISTP': 'practical and adaptable craftsperson',
    'ESTP': 'bold and perceptive entrepreneur',
    'INTP': 'logical and innovative thinker',
    'ENTP': 'quick-witted and clever innovator',
    'ISTJ': 'practical and fact-minded logistician',
    'ESTJ': 'efficient and hardworking executive'
  };
  return descriptions[mbtiType] || 'unique and individual thinker';
}

// Helper function to convert Human Design types to natural descriptions
function getEnergyDescription(hdType: string): string {
  const descriptions: Record<string, string> = {
    'Projector': 'invitation-based wisdom sharing',
    'Generator': 'sustained creative energy flow',
    'Manifestor': 'independent action and initiation',
    'Manifesting Generator': 'dynamic multi-passionate energy',
    'Reflector': 'environment-sensitive reflection and wisdom'
  };
  return descriptions[hdType] || 'unique energy expression';
}

// Helper function to convert sun signs to natural descriptions  
function getArchetypalDescription(sunSign: string): string {
  const descriptions: Record<string, string> = {
    'Aries': 'pioneering and courageous spirit',
    'Taurus': 'stable and nurturing presence',
    'Gemini': 'curious and communicative nature',
    'Cancer': 'intuitive and protective instinct',
    'Leo': 'creative and confident expression',
    'Virgo': 'analytical and helpful approach',
    'Libra': 'harmonious and balanced perspective',
    'Scorpio': 'intense and transformative depth',
    'Sagittarius': 'adventurous and philosophical outlook',
    'Capricorn': 'ambitious and structured methodology',
    'Aquarius': 'innovative and humanitarian vision',
    'Pisces': 'empathetic and imaginative flow'
  };
  return descriptions[sunSign] || 'individual archetypal influence';
}

// PHASE 4: Conversation state detection function
function detectConversationState(message: string, conversationHistory: any[]) {
  const cleanMessage = message.trim().toLowerCase();
  
  // Gratitude patterns - strong signal for satisfaction
  const gratitudePatterns = [
    /\b(thank\s*you|thanks|thx|appreciate)\b/i,
    /\b(grateful|perfect|great|excellent)\b/i,
    /\b(exactly what i needed|that helps)\b/i
  ];

  // Closure patterns - direct signals for ending
  const closurePatterns = [
    /\b(that'?s\s*(it|all)|that is it)\b/i,
    /\b(for now|good for now)\b/i,
    /\b(no more|nothing else|i'?m done)\b/i,
    /\b(bye|goodbye|talk later|see you)\b/i,
    /\b(end|stop|enough)\b/i
  ];

  // Explicit suggestion request patterns - signals user wants guidance/suggestions
  const suggestionRequestPatterns = [
    /\b(what should i|what do you think i should|any suggestions|any advice)\b/i,
    /\b(recommend|suggest|what would you|what next|where do i go)\b/i,
    /\b(help me understand|guide me|show me the way)\b/i,
    /\b(please advise|your thoughts|what's your take)\b/i,
    /\b(any ideas|thoughts on|what do you suggest)\b/i
  ];

  // Explicit continuation patterns - only for clear requests for more info
  const explicitContinuationPatterns = [
    /\b(tell me more|explain further|elaborate|go deeper)\b/i,
    /\b(what else|anything else|more about)\b/i,
    /\b(i want to know more|can you expand|give me more details)\b/i
  ];

  const hasGratitude = gratitudePatterns.some(pattern => pattern.test(cleanMessage));
  const hasClosure = closurePatterns.some(pattern => pattern.test(cleanMessage));
  const hasSuggestionRequest = suggestionRequestPatterns.some(pattern => pattern.test(cleanMessage));
  const hasExplicitContinuation = explicitContinuationPatterns.some(pattern => pattern.test(cleanMessage));

  // Determine interaction type based on strongest signal - default to neutral
  let lastInteractionType = 'neutral';
  
  if (hasGratitude && hasClosure) {
    lastInteractionType = 'closure';
  } else if (hasGratitude) {
    lastInteractionType = 'gratitude';
  } else if (hasClosure) {
    lastInteractionType = 'closure';
  } else if (hasSuggestionRequest || hasExplicitContinuation) {
    lastInteractionType = 'continuation';
  }

  // Calculate state flags - default to conservative approach
  const closureSignalDetected = hasGratitude || hasClosure;
  const userSatisfied = hasGratitude || (hasClosure && !hasSuggestionRequest);
  const isActive = hasSuggestionRequest || hasExplicitContinuation;
  // CRITICAL: Default to FALSE - only ask questions when explicitly requested
  const shouldAskQuestion = hasSuggestionRequest || hasExplicitContinuation;

  return {
    isActive,
    userSatisfied,
    closureSignalDetected,
    lastInteractionType,
    shouldAskQuestion
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Utility function for calculating cosine similarity between embeddings
function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length for cosine similarity')
  }
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }
  
  // Avoid division by zero
  if (normA === 0 || normB === 0) {
    return 0
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// PHASE 2: Insight generation function - detects shadow patterns and stores insights
async function generateConversationInsights(
  userId: string,
  sessionId: string,
  supabase: any
) {
  const startTime = Date.now();
  console.log('🔍 INSIGHT GENERATION: Starting shadow pattern detection', {
    userId,
    sessionId,
    timestamp: new Date().toISOString()
  });

  try {
    // Call the ConversationShadowDetector we fixed
    const insights = await ConversationShadowDetector.detectShadowPatterns(userId);
    
    console.log('✅ INSIGHT GENERATION: Patterns detected', {
      insightCount: insights.length,
      patterns: insights.map(i => i.pattern.type),
      duration: Date.now() - startTime + 'ms'
    });

    // Store insights in database for UI to display
    if (insights.length > 0) {
      const insightRecords = insights.map(insight => ({
        user_id: userId,
        session_id: sessionId,
        insight_type: insight.type,
        insight_data: {
          pattern: insight.pattern,
          title: insight.title,
          message: insight.message,
          actionableSteps: insight.actionableSteps,
          priority: insight.priority
        },
        created_at: new Date().toISOString()
      }));

      const { error: insertError } = await supabase
        .from('conversation_insights')
        .insert(insightRecords);

      if (insertError) {
        console.error('❌ INSIGHT GENERATION: Failed to store insights', insertError);
        throw insertError;
      } else {
        console.log('✅ INSIGHT GENERATION: Insights stored in database', {
          recordCount: insightRecords.length
        });
      }
    } else {
      console.log('ℹ️ INSIGHT GENERATION: No patterns detected in conversation');
    }

    return insights;

  } catch (error) {
    console.error('❌ INSIGHT GENERATION FAILED:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      duration: Date.now() - startTime + 'ms'
    });
    // Throw to surface error (Principle #3: No error masking)
    throw error;
  }
}

// FUSION: Background task for HACS intelligence integration
async function fuseWithHACSIntelligence(
  userMessage: string, 
  userId: string, 
  sessionId: string, 
  oracleResponse: any,
  supabase: any
) {
  const fusionStartTime = Date.now();
  console.log('🚀🧠 FUSION ENTRY: Background intelligence processing started', {
    timestamp: new Date().toISOString(),
    userId,
    sessionId,
    messageLength: userMessage?.length || 0,
    hasOracleResponse: !!oracleResponse,
    oracleResponseKeys: Object.keys(oracleResponse || {}),
    stackTrace: new Error().stack?.split('\n').slice(0, 3)
  });

  try {
    // Validate inputs
    if (!userId || !sessionId || !userMessage) {
      console.error('❌ FUSION VALIDATION FAILED: Missing required parameters', {
        hasUserId: !!userId,
        hasSessionId: !!sessionId,
        hasMessage: !!userMessage
      });
      throw new Error('Missing required parameters for fusion');
    }

    console.log('✅ FUSION VALIDATION PASSED: Preparing brain processor invocation');

    // Prepare request body
    const brainRequestBody = {
      userId,
      message: userMessage,
      sessionId,
      agentMode: 'companion',
      agentResponse: oracleResponse.response,
      oracleMetadata: {
        personalityInsights: oracleResponse.semanticChunks,
        oracleMode: true,
        responseQuality: oracleResponse.quality || 0.8,
        oracleStatus: oracleResponse.oracleStatus
      }
    };

    console.log('🎯 FUSION: Invoking unified-brain-processor', {
      requestBodyKeys: Object.keys(brainRequestBody),
      agentMode: brainRequestBody.agentMode,
      hasAgentResponse: !!brainRequestBody.agentResponse,
      oracleMetadataKeys: Object.keys(brainRequestBody.oracleMetadata)
    });

    const brainInvokeStart = Date.now();
    
    // Invoke unified brain processor with oracle response for learning
    const { data: brainResult, error: brainError } = await supabase.functions.invoke('unified-brain-processor', {
      body: brainRequestBody
    });

    const brainInvokeDuration = Date.now() - brainInvokeStart;

    console.log('📥 FUSION: Brain processor response received', {
      duration: brainInvokeDuration + 'ms',
      hasError: !!brainError,
      hasData: !!brainResult,
      errorDetails: brainError ? {
        message: brainError.message,
        code: brainError.code,
        details: brainError.details
      } : null,
      dataKeys: brainResult ? Object.keys(brainResult) : []
    });

    if (brainError) {
      console.error('❌ FUSION ERROR: Unified brain processing failed', {
        error: brainError,
        errorMessage: brainError.message,
        errorCode: brainError.code,
        errorDetails: brainError.details,
        requestBody: brainRequestBody,
        duration: brainInvokeDuration
      });
    } else {
      console.log('✅ FUSION SUCCESS: HACS intelligence updated from oracle interaction', {
        processingId: brainResult?.processingId,
        intelligenceLevel: brainResult?.newIntelligenceLevel,
        modulesProcessed: brainResult?.modulesProcessed,
        xpGained: brainResult?.xpGained,
        totalDuration: Date.now() - fusionStartTime + 'ms'
      });
    }

    console.log('🏁 FUSION COMPLETE: Background task finished', {
      success: !brainError,
      totalDuration: Date.now() - fusionStartTime + 'ms',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorDuration = Date.now() - fusionStartTime;
    console.error('❌ FUSION FATAL ERROR: Background intelligence task crashed', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      duration: errorDuration + 'ms',
      timestamp: new Date().toISOString(),
      userId,
      sessionId
    });
    
    // Re-throw to surface the error (Principle #3: No error masking)
    throw error;
  }
}

// NEW: Fetch relevant Hermetic 2.0 report sections for educational responses
async function getHermeticEducationalContext(
  userId: string,
  message: string,
  supabase: any
): Promise<{ sections: Record<string, any>; topicMap: string[] }> {
  try {
    console.log('📖 EDUCATIONAL MODE: Fetching Hermetic report sections');
    
    // Detect conversation topic from message
    const messageLower = message.toLowerCase();
    let prioritySections: string[] = [];
    
    // Topic detection (matches hermetic-report-access-service.ts logic)
    if (messageLower.includes('relationship') || messageLower.includes('connect')) {
      prioritySections.push('relationship_style', 'attachment_style');
    }
    if (messageLower.includes('decision') || messageLower.includes('choice')) {
      prioritySections.push('decision_making_style', 'core_personality_pattern');
    }
    if (messageLower.includes('energy') || messageLower.includes('alone') || messageLower.includes('tired')) {
      prioritySections.push('current_energy_timing', 'energy_patterns');
    }
    if (messageLower.includes('purpose') || messageLower.includes('calling')) {
      prioritySections.push('life_path_purpose', 'integrated_summary');
    }
    
    // Default: Core sections if no specific topic
    if (prioritySections.length === 0) {
      prioritySections = ['integrated_summary', 'core_personality_pattern', 'decision_making_style'];
    }
    
    // Fetch full Hermetic report
    const { data: reportData, error } = await supabase
      .from('hermetic_structured_intelligence')
      .select('report_content')
      .eq('user_id', userId)
      .single();
    
    if (error || !reportData) {
      console.log('⚠️ No Hermetic report found, falling back to standard mode');
      return { sections: {}, topicMap: [] };
    }
    
    const reportContent = typeof reportData.report_content === 'string' 
      ? JSON.parse(reportData.report_content) 
      : reportData.report_content;
    
    // Extract priority sections
    const extractedSections: Record<string, any> = {};
    prioritySections.forEach(section => {
      if (reportContent[section]) {
        extractedSections[section] = reportContent[section];
      }
    });
    
    console.log(`✅ Retrieved ${Object.keys(extractedSections).length} Hermetic sections for educational mode`);
    
    return { 
      sections: extractedSections, 
      topicMap: prioritySections 
    };
    
  } catch (error) {
    console.error('❌ Error fetching Hermetic educational context:', error);
    return { sections: {}, topicMap: [] };
  }
}

// Helper function to extract first N sentences from Hermetic content
function extractFirstSentences(content: any, numSentences: number): string {
  let text = '';
  if (typeof content === 'string') {
    text = content;
  } else if (content?.content) {
    text = content.content;
  } else if (content?.summary) {
    text = content.summary;
  }
  
  const sentences = text.split(/[.!?]+\s+/).filter(s => s.trim().length > 0);
  return sentences.slice(0, numSentences).join('. ') + '.';
}

// Build Hermetic Identity Primer - this becomes the AI's CORE KNOWING
function buildHermeticIdentityPrimer(hermeticSections: Record<string, any>, userName: string): string {
  if (!hermeticSections || Object.keys(hermeticSections).length === 0) {
    return '';
  }
  
  let primer = `═══════════════════════════════════════════════════════════\n`;
  primer += `CORE IDENTITY KNOWLEDGE: WHO ${userName.toUpperCase()} TRULY IS\n`;
  primer += `This is not inference. This is ground truth from the Hermetic 2.0 blueprint.\n`;
  primer += `═══════════════════════════════════════════════════════════\n\n`;
  
  // Extract MORE context - aim for 150-200 words total
  if (hermeticSections.integrated_summary) {
    primer += `✦ ESSENCE (Who they are at their core):\n`;
    primer += `${extractFirstSentences(hermeticSections.integrated_summary, 5)}\n\n`;
  }
  
  if (hermeticSections.core_personality_pattern) {
    primer += `✦ CORE BEHAVIORAL PATTERN:\n`;
    primer += `${extractFirstSentences(hermeticSections.core_personality_pattern, 4)}\n\n`;
  }
  
  if (hermeticSections.decision_making_style) {
    primer += `✦ HOW THEY MAKE DECISIONS:\n`;
    primer += `${extractFirstSentences(hermeticSections.decision_making_style, 3)}\n\n`;
  }
  
  if (hermeticSections.relationship_style) {
    primer += `✦ HOW THEY RELATE TO OTHERS:\n`;
    primer += `${extractFirstSentences(hermeticSections.relationship_style, 2)}\n\n`;
  }
  
  primer += `═══════════════════════════════════════════════════════════\n`;
  primer += `When you respond, you speak from DEEP KNOWING of ${userName}.\n`;
  primer += `This is not guesswork or generic coaching. You are their mirror.\n`;
  primer += `═══════════════════════════════════════════════════════════\n\n`;
  
  console.log('✅ HERMETIC PRIMER DATA CHECK:', {
    sectionsAvailable: Object.keys(hermeticSections),
    hasIntegratedSummary: !!hermeticSections.integrated_summary,
    hasCorePattern: !!hermeticSections.core_personality_pattern,
    hasDecisionStyle: !!hermeticSections.decision_making_style,
    hasRelationshipStyle: !!hermeticSections.relationship_style,
    totalSectionCount: Object.keys(hermeticSections).length,
    primerLength: primer.length
  });
  
  return primer;
}

// Helper function to generate voice style based on personality
function generateVoiceStyle(mbti: string, hd: string, sun: string): string {
  let style = "- Speak conversationally and warmly\n";
  
  if (mbti.includes('E')) {
    style += "- Match their extroverted energy with enthusiasm and engagement\n";
  } else {
    style += "- Respect their introverted nature with thoughtful, reflective responses\n";
  }
  
  if (mbti.includes('N')) {
    style += "- Explore possibilities, patterns, and big-picture connections\n";
    style += "- Use metaphors and abstract concepts they'll appreciate\n";
  } else {
    style += "- Focus on practical, concrete guidance and real-world applications\n";
  }
  
  if (mbti.includes('F')) {
    style += "- Prioritize emotional resonance and personal values\n";
  } else {
    style += "- Emphasize logic, analysis, and objective problem-solving\n";
  }
  
  if (hd === 'Projector') {
    style += "- Recognize their need for recognition and invitation\n";
    style += "- Honor their role as a guide and wise advisor\n";
  }
  
  return style;
}

// Helper function to generate humor style
function generateHumorStyle(mbti: string, sun: string): string {
  let humor = "- Use appropriate humor to build rapport\n";
  
  if (mbti.includes('T')) {
    humor += "- Dry wit and clever observations are appreciated\n";
  } else {
    humor += "- Warm, inclusive humor that builds connection\n";
  }
  
  if (sun.includes('Aquarius')) {
    humor += "- Appreciate quirky, unconventional perspectives\n";
  }
  
  return humor;
}

// Helper function to generate communication depth
function generateCommunicationDepth(intelligence: number, mbti: string): string {
  let depth = "";
  
  if (intelligence > 80) {
    depth += "- Engage with sophisticated concepts and nuanced thinking\n";
  } else if (intelligence > 60) {
    depth += "- Balance accessibility with meaningful depth\n";
  } else {
    depth += "- Keep concepts clear and actionable\n";
  }
  
  if (mbti.includes('N')) {
    depth += "- Explore underlying patterns and connections\n";
  }
  
  return depth;
}

// Helper function to get role based on intent
function getRoleForIntent(intent: string, userName: string, hermeticSections?: Record<string, any>): string {
  switch (intent) {
    case 'FACTUAL':
      return `You are ${userName}'s trusted companion with access to their complete personal blueprint. When they ask for specific information, provide precise, factual answers from their data while maintaining your warm, conversational tone.

RESPONSE MODE: FACT-FIRST
When ${userName} asks for specific data (like "what are my numerology numbers" or "my full blueprint"), lead with the exact facts from their blueprint, then add brief context if helpful.`;

    case 'INTERPRETIVE':
      return `You are ${userName}'s trusted companion and guide, deeply attuned to their unique personality blueprint. Focus on interpretation, guidance, and deeper meaning rather than just facts.

RESPONSE MODE: GUIDANCE-FOCUSED  
Offer wisdom, interpretation, and guidance that honors ${userName}'s depth. Draw connections between their blueprint elements and practical life application.`;

    case 'EDUCATIONAL':
      // Hermetic primer already injected above - no need to repeat
      return `You are ${userName}'s mirror. They're asking "why" because they want to understand the MECHANISM behind their patterns.

RESPONSE STRUCTURE (WHY-FIRST):
1. MECHANISM: Explain the underlying pattern/design (30-40 words)
2. MANIFESTATION: Show how it shows up in their life (20-30 words)
3. ALIGNMENT PATH: One actionable insight to work WITH this pattern (20 words max)

Keep total response under 100 words. No jargon. Speak like a friend who deeply knows them.`;

    default: // MIXED
      return `You are ${userName}'s trusted companion and guide, deeply attuned to their unique personality blueprint and current life context.

RESPONSE MODE: HYBRID
Blend precise factual information with insightful interpretation. When ${userName} asks questions, determine if they need facts, guidance, or both, and respond accordingly.`;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now(); // EMERGENCY FIX: Add missing startTime declaration

  try {
    console.log('🔮 Oracle Function Called - Starting enhanced conversation processing');
    
    // Get JWT token from Authorization header for RLS
    const authHeader = req.headers.get('Authorization');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '', // Use anon key with JWT auth for RLS
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: authHeader ? { Authorization: authHeader } : {}
        }
      }
    )

    const { message, userId, sessionId, useOracleMode = false, enableBackgroundIntelligence = false, conversationHistory = [], userProfile = {}, threadId } = await req.json()
    console.log('🔮 FUSION: Oracle Mode Request:', { 
      useOracleMode, 
      enableBackgroundIntelligence,
      messageLength: message.length,
      conversationHistoryLength: conversationHistory.length,
      userProfileReceived: Object.keys(userProfile).length > 0,
      userId: userId.substring(0, 8),
      threadId 
    })

    // PHASE 2 FIX: Oracle Context Reconciliation - Load authoritative conversation history first
    console.log('🧠 ORACLE: Loading authoritative conversation history from database')
    let authoritativeHistory = []
    let contextSource = 'none'
    
    if (threadId) {
      // STEP 1: Try to fetch by stable thread ID
      const { data: memoryData, error: memoryError } = await supabase
        .from('conversation_memory')
        .select('messages, updated_at, session_id')
        .eq('user_id', userId)
        .eq('session_id', threadId)
        .eq('mode', 'companion')
        .maybeSingle()
      
      if (memoryError) {
        console.warn('⚠️ ORACLE: Failed to fetch conversation memory by thread ID:', memoryError)
      } else if (memoryData && memoryData.messages) {
        authoritativeHistory = Array.isArray(memoryData.messages) ? memoryData.messages : []
        contextSource = 'thread_id'
        console.log('✅ ORACLE: Loaded authoritative history via thread ID', { 
          count: authoritativeHistory.length,
          lastUpdate: memoryData.updated_at,
          sessionId: memoryData.session_id 
        })
      } else {
        // STEP 2: Fallback - Search by user ID + mode for recent conversations
        console.log('🔄 ORACLE: No memory found for thread ID, trying fallback by user+mode')
        const { data: fallbackMemory, error: fallbackError } = await supabase
          .from('conversation_memory')
          .select('messages, updated_at, session_id, last_activity')
          .eq('user_id', userId)
          .eq('mode', 'companion')
          .order('last_activity', { ascending: false })
          .limit(1)
          .maybeSingle()
        
        if (fallbackError) {
          console.warn('⚠️ ORACLE: Fallback memory query failed:', fallbackError)
        } else if (fallbackMemory && fallbackMemory.messages) {
          authoritativeHistory = Array.isArray(fallbackMemory.messages) ? fallbackMemory.messages : []
          contextSource = 'user_mode_fallback'
          console.log('✅ ORACLE: Loaded authoritative history via fallback', { 
            count: authoritativeHistory.length,
            lastUpdate: fallbackMemory.updated_at,
            sessionId: fallbackMemory.session_id,
            lastActivity: fallbackMemory.last_activity
          })
        }
      }
    } else {
      console.warn('⚠️ ORACLE: No thread ID provided - cannot load persistent context')
    }

    // Merge histories: server authoritative + new client messages
    const finalHistory = [...authoritativeHistory]
    if (conversationHistory && conversationHistory.length > authoritativeHistory.length) {
      const newClientMessages = conversationHistory.slice(authoritativeHistory.length)
      finalHistory.push(...newClientMessages)
      console.log('🔄 ORACLE: Merged new client messages', { count: newClientMessages.length })
    }

    // PHASE 1: Graceful degradation instead of fatal rejection
    if (finalHistory.length === 0) {
      console.warn('🚨 ORACLE VALIDATION: No persistent context found - proceeding with cold start')
      // Create minimal cold-start context using current message and user profile
      const coldStartContext = [
        {
          role: 'user',
          content: message,
          timestamp: new Date().toISOString(),
          isColdStart: true
        }
      ]
      
      finalHistory.push(...coldStartContext)
      contextSource = 'cold_start'
      
      console.log('⚠️ ORACLE: Created cold-start context', {
        contextSource,
        contextLength: finalHistory.length,
        degradedMode: true
      })
    } else {
      console.log('✅ ORACLE VALIDATION: Final conversation context ready:', {
        authoritativeCount: authoritativeHistory.length,
        clientCount: conversationHistory.length,
        finalCount: finalHistory.length,
        contextSource,
        recentContext: finalHistory.slice(-3).map(m => `${m.role}: ${m.content?.substring(0, 50) || ''}...`)
      })
    }

    // FUSION STEP 1: Get current HACS intelligence level for response calibration
    const { data: hacsIntelligence } = await supabase
      .from('hacs_intelligence')
      .select('intelligence_level, module_scores')
      .eq('user_id', userId)
      .single()

    const intelligenceLevel = hacsIntelligence?.intelligence_level || 50
    const moduleScores = hacsIntelligence?.module_scores || {}
    
    console.log('🧠 FUSION: Current HACS intelligence level:', intelligenceLevel)

    // PILLAR II: Use provided userProfile if available, otherwise fetch from database
    let personalityContext = null
    
    if (userProfile && Object.keys(userProfile).length > 0) {
      // Use real userProfile data passed from client (PILLAR II: Ground Truth)
      personalityContext = userProfile;
      console.log('✅ ORACLE CONTEXT: Using provided user profile:', personalityContext);
    } else {
      // Fallback: Get user blueprint for personality context
      console.log('🔄 ORACLE CONTEXT: No user profile provided, fetching from database');
      const { data: blueprint } = await supabase
        .from('user_blueprints')
        .select('blueprint')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (blueprint?.blueprint) {
        personalityContext = {
          name: blueprint.blueprint.user_meta?.preferred_name || 'Seeker',
          mbti: blueprint.blueprint.user_meta?.personality?.likelyType || blueprint.blueprint.cognition_mbti?.type || 'Unknown',
          hdType: blueprint.blueprint.energy_strategy_human_design?.type || 'Unknown',
          sunSign: blueprint.blueprint.archetype_western?.sun_sign || 'Unknown'
        }
        console.log('✅ ORACLE CONTEXT: Fetched blueprint data:', personalityContext);
      }
    }

    // PHASE 4: CONVERSATION STATE DETECTION
    const conversationState = detectConversationState(message, finalHistory);
    console.log('🎯 CONVERSATION STATE:', conversationState);

    // ═══════════════════════════════════════════════════════════
    // EARLY CLOSURE GATE - Bypass AI for satisfaction/closure signals
    // ═══════════════════════════════════════════════════════════
    if (conversationState.userSatisfied || conversationState.closureSignalDetected) {
      console.log('🚪 CLOSURE GATE ACTIVE: Detected satisfaction/closure - bypassing Oracle + AI');
      
      // Translation-proof closure responses (simple, universal acknowledgments)
      const closureResponses = [
        "✨",
        "🙏",
        "💫",
        "🌟"
      ];
      
      const response = closureResponses[Math.floor(Math.random() * closureResponses.length)];
      
      return new Response(JSON.stringify({
        response,
        quality: 0.9,
        semanticChunks: [],
        structuredFacts: [],
        personalityContext,
        intelligenceLevel,
        oracleStatus: 'bypassed_closure',
        processingTime: Date.now() - startTime,
        closureDetected: true
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ENHANCED ORACLE PIPELINE: Hybrid retrieval with facts + narrative
    let semanticChunks = []
    let structuredFacts = []
    let oracleStatus = 'initializing'
    let sidecarResult = { intent: 'MIXED' } // Initialize with default intent
    
    if (useOracleMode && personalityContext) {
      console.log('🔮 ENHANCED ORACLE: Starting hybrid retrieval with personality context:', {
        userName: personalityContext.name,
        mbtiType: personalityContext.mbti,
        hdType: personalityContext.hdType,
        sunSign: personalityContext.sunSign
      });

      // STEP 1: Try retrieval sidecar first (feature flagged)
      console.log('🔮 STEP 1: Attempting retrieval sidecar...');
      try {
        const sidecarResponse = await supabase.functions.invoke('retrieval-sidecar', {
          body: {
            userId,
            query: message,
            mode: 'companion'
          },
          headers: {
            Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          }
        });

          sidecarResult = {
            success: !!sidecarResponse.data,
            error: sidecarResponse.error?.message || null,
            factsFound: sidecarResponse.data?.facts?.length || 0,
            passagesFound: sidecarResponse.data?.passages?.length || 0,
            intent: sidecarResponse.data?.intent || 'unknown',
            facts: sidecarResponse.data?.facts || [],
            passages: sidecarResponse.data?.passages || []
          };

          console.log('🔮 SIDECAR RESULT:', sidecarResult);

          if (sidecarResponse.data && !sidecarResponse.error) {
            // Use sidecar results
            structuredFacts = sidecarResult.facts;
            const sidecarPassages = sidecarResult.passages;
            
            // Convert sidecar passages to semantic chunks format
            semanticChunks = sidecarPassages.map((passage: any, index: number) => ({
              chunk_content: passage.content || passage.chunk_content,
              relevance: passage.relevance,
              reportType: 'personality',
              metadata: {
                ...passage.metadata,
                sidecarRetrieved: true,
                retrievalMethod: 'sidecar_hybrid'
              }
            }));

            if (structuredFacts.length > 0 || semanticChunks.length > 0) {
              oracleStatus = 'enhanced_oracle';
              console.log('✅ SIDECAR SUCCESS: Enhanced retrieval complete:', {
                facts: structuredFacts.length,
                passages: semanticChunks.length,
                oracleStatus
              });
            } else {
              console.log('⚠️ SIDECAR: No results, falling back to legacy pipeline');
            }
          } else {
            console.log('⚠️ SIDECAR: Failed or disabled, using legacy pipeline');
          }
      } catch (sidecarError) {
        console.error('❌ SIDECAR ERROR: Falling back to legacy pipeline:', sidecarError);
      }

      // STEP 2: Legacy pipeline fallback if sidecar didn't provide results
      if (semanticChunks.length === 0 && structuredFacts.length === 0) {
        console.log('🔮 STEP 2: Using legacy vector search pipeline');
        
        // STEP 1: Check for pre-computed embeddings first
      console.log('🔮 STEP 1: Checking for pre-computed embeddings...');
      const { data: embeddingCheck, error: embeddingError } = await supabase
        .from('blueprint_text_embeddings')
        .select('id, chunk_content, created_at')
        .eq('user_id', userId)
        .limit(10);
      
      console.log('🔮 STEP 1 RESULT: Embedding availability check:', {
        embeddingsFound: embeddingCheck?.length || 0,
        embeddingError: embeddingError?.message || null,
        sampleIds: embeddingCheck?.slice(0, 3).map(e => e.id) || [],
        oldestEmbedding: embeddingCheck?.[embeddingCheck.length - 1]?.created_at || null
      });

      if (embeddingCheck && embeddingCheck.length > 0) {
        console.log('🔮 STEP 2: Pre-computed embeddings found, proceeding with vector search');
        
        try {
          // Create contextual search text by combining current message with conversation context
          const contextualSearchText = conversationHistory.length > 0 
            ? `${conversationHistory.slice(-5).map(msg => `${msg.role}: ${msg.content}`).join(' ')} current: ${message}`
            : message;

          console.log('🔮 STEP 3: Generating embedding for contextual search:', {
            originalMessage: message,
            contextualSearchLength: contextualSearchText.length,
            conversationContextUsed: conversationHistory.length > 0,
            timestamp: new Date().toISOString()
          });

          const embeddingStartTime = Date.now();
          const embeddingResponse = await supabase.functions.invoke('openai-embeddings', {
            body: { query: contextualSearchText },
            headers: {
              Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
            }
          });
          const embeddingDuration = Date.now() - embeddingStartTime;

          console.log('🔮 STEP 3 RESULT: Embedding generation completed:', {
            success: !!embeddingResponse.data?.embedding,
            embeddingLength: embeddingResponse.data?.embedding?.length || 0,
            processingTime: embeddingDuration + 'ms',
            error: embeddingResponse.error?.message || null,
            statusCode: embeddingResponse.status,
            responseDataKeys: Object.keys(embeddingResponse.data || {}),
            responseErrorKeys: Object.keys(embeddingResponse.error || {})
          });
          
          if (embeddingResponse.error) {
            console.error('❌ ORACLE FATAL: Embedding generation failed with error:', {
              error: embeddingResponse.error,
              status: embeddingResponse.status,
              data: embeddingResponse.data
            });
            throw new Error('Failed to generate message embedding: ' + embeddingResponse.error.message);
          }
          
          const messageEmbedding = embeddingResponse.data?.embedding;
          if (!messageEmbedding || !Array.isArray(messageEmbedding)) {
            console.error('❌ ORACLE FATAL: Invalid embedding format received:', {
              embeddingType: typeof messageEmbedding,
              isArray: Array.isArray(messageEmbedding),
              length: messageEmbedding?.length,
              sample: messageEmbedding?.slice(0, 5)
            });
            throw new Error('Invalid embedding format received from OpenAI');
          }
          
          console.log('✅ ORACLE SUCCESS: Generated valid query embedding:', {
            dimensions: messageEmbedding.length,
            firstFewValues: messageEmbedding.slice(0, 5),
            lastFewValues: messageEmbedding.slice(-5),
            allValuesNumeric: messageEmbedding.every(v => typeof v === 'number'),
            hasNaN: messageEmbedding.some(v => isNaN(v)),
            magnitude: Math.sqrt(messageEmbedding.reduce((sum, val) => sum + val * val, 0))
          });
          
          // STEP 4: Perform vector similarity search
          console.log('🔮 STEP 4: Starting vector similarity search with parameters:', {
            queryEmbedding: {
              dimensions: messageEmbedding.length,
              firstValues: messageEmbedding.slice(0, 3),
              magnitude: Math.sqrt(messageEmbedding.reduce((sum, val) => sum + val * val, 0))
            },
            searchParams: {
              userId: userId.substring(0, 8) + '...',
              matchThreshold: 0.3,
              matchCount: 5
            },
            functionName: 'match_blueprint_chunks'
          });

          const searchStartTime = Date.now();
          const { data: matchingChunks, error: searchError } = await supabase.rpc(
            'match_blueprint_chunks',
            {
              query_embedding: messageEmbedding,
              query_user_id: userId,
              match_threshold: 0.3,
              match_count: 5
            }
          );
          const searchDuration = Date.now() - searchStartTime;
          
          console.log('🔮 STEP 4 RESULT: Vector similarity search completed:', {
            processingTime: searchDuration + 'ms',
            chunksFound: matchingChunks?.length || 0,
            searchError: searchError?.message || null,
            searchErrorCode: searchError?.code || null,
            searchErrorDetails: searchError?.details || null,
            searchErrorHint: searchError?.hint || null,
            rawResult: matchingChunks ? 'array' : 'null/undefined',
            resultSample: matchingChunks?.slice(0, 2).map(c => ({
              id: c.id,
              similarity: c.similarity,
              contentLength: c.chunk_content?.length || 0,
              contentPreview: c.chunk_content?.substring(0, 50) + '...'
            })) || []
          });
          
          if (searchError) {
            console.error('❌ ORACLE FATAL: Vector similarity search failed:', {
              error: searchError,
              functionName: 'match_blueprint_chunks',
              parameters: {
                query_embedding: 'vector(' + messageEmbedding.length + ')',
                query_user_id: userId,
                match_threshold: 0.3,
                match_count: 5
              }
            });
            throw new Error('Vector similarity search failed: ' + searchError.message);
          }
          
          // STEP 5: Process and validate search results
          if (matchingChunks && matchingChunks.length > 0) {
            console.log('🔮 STEP 5: Processing search results into semantic chunks');
            
            semanticChunks = matchingChunks.map((chunk: any, index: number) => {
              console.log(`🔮 CHUNK ${index + 1}:`, {
                id: chunk.id,
                similarity: chunk.similarity,
                contentLength: chunk.chunk_content?.length || 0,
                contentStart: chunk.chunk_content?.substring(0, 100) + '...'
              });
              
              return {
                content: chunk.chunk_content,
                relevance: chunk.similarity,
                reportType: 'personality',
                metadata: {
                  semanticSimilarity: chunk.similarity,
                  textEmbedding: true,
                  chunkId: chunk.id,
                  optimizedSearch: true,
                  searchTimestamp: new Date().toISOString()
                }
              };
            });
            
            oracleStatus = 'full_oracle';
            console.log('🎯 ORACLE SUCCESS: Retrieved semantic chunks:', {
              totalChunks: semanticChunks.length,
              similarities: semanticChunks.map(c => c.relevance.toFixed(3)),
              avgSimilarity: (semanticChunks.reduce((sum, c) => sum + c.relevance, 0) / semanticChunks.length).toFixed(3),
              totalContentLength: semanticChunks.reduce((sum, c) => sum + c.content.length, 0),
              oracleStatus: oracleStatus
            });
          } else {
            console.log('🔮 STEP 5: No semantic matches found above threshold');
            console.log('🔮 DIAGNOSIS: Zero results analysis:', {
              searchPerformed: true,
              errorOccurred: false,
              embeddingsExist: embeddingCheck.length,
              threshold: 0.3,
              possibleCauses: [
                'User message too different from blueprint content',
                'Embeddings may be from different model/version',
                'Threshold too high for current content',
                'User blueprint content not sufficiently diverse'
              ]
            });
            oracleStatus = 'developing_oracle';
          }
          
        } catch (vectorError) {
          console.error('❌ ORACLE PIPELINE EXCEPTION: Vector search process failed:', {
            error: vectorError.message,
            stack: vectorError.stack,
            phase: 'vector_search',
            cause: vectorError.cause
          });
          
          // EMERGENCY FALLBACK: Use personality reports directly
          console.log('🔮 EMERGENCY FALLBACK: Attempting direct personality report search');
          const { data: reports } = await supabase
            .from('personality_reports')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(3);
            
          console.log('🔮 FALLBACK RESULT: Direct personality reports:', {
            reportsFound: reports?.length || 0,
            reportTypes: reports?.map(r => r.report_type) || [],
            reportDates: reports?.map(r => r.created_at) || []
          });
          
          if (reports && reports.length > 0) {
            // Simple keyword matching as last resort
            const messageKeywords = message.toLowerCase().split(' ').filter(w => w.length > 3);
            console.log('🔮 FALLBACK: Using keyword matching with keywords:', messageKeywords);
            
            for (const report of reports) {
              if (report.report_content) {
                const content = typeof report.report_content === 'string' 
                  ? report.report_content 
                  : JSON.stringify(report.report_content);
                const sections = content.split('\n\n');
                
                for (const section of sections) {
                  const sectionLower = section.toLowerCase();
                  const relevanceScore = messageKeywords.filter(keyword => 
                    sectionLower.includes(keyword)
                  ).length;
                  
                  if (relevanceScore > 0 && section.length > 100) {
                    semanticChunks.push({
                      content: section,
                      relevance: relevanceScore,
                      reportType: report.report_type,
                      metadata: { created: report.created_at, fallback: true, keywords: relevanceScore }
                    });
                  }
                }
              }
            }
            
            semanticChunks.sort((a, b) => b.relevance - a.relevance);
            semanticChunks = semanticChunks.slice(0, 5);
            oracleStatus = semanticChunks.length > 0 ? 'developing_oracle' : 'initializing';
            
            console.log('🔮 FALLBACK COMPLETE: Keyword matching results:', {
              chunksFound: semanticChunks.length,
              avgRelevance: semanticChunks.length > 0 ? (semanticChunks.reduce((sum, c) => sum + c.relevance, 0) / semanticChunks.length).toFixed(2) : 0,
              oracleStatus: oracleStatus
            });
          }
        }
      } else {
        console.log('❌ ORACLE ERROR: No pre-computed embeddings found for user');
        console.log('🔮 DIAGNOSIS: Missing embeddings analysis:', {
          userId: userId.substring(0, 8) + '...',
          embeddingCheckError: embeddingError?.message,
          recommendedAction: 'User needs to complete blueprint processing first',
          tableName: 'blueprint_text_embeddings',
          requiredProcessing: 'process-blueprint-embeddings function'
        });
        oracleStatus = 'initializing';
      }
    } else {
    console.log('🔮 ENHANCED ORACLE: Skipped - Oracle mode disabled or no personality context');
    console.log('🔮 PIPELINE STATUS:', {
      useOracleMode,
      hasPersonalityContext: !!personalityContext,
      reason: !useOracleMode ? 'Oracle mode disabled' : 'No personality context'
    });
    }
    
  console.log('🔮 ENHANCED ORACLE COMPLETE: Final status summary:', {
      oracleStatus,
      structuredFactsFound: structuredFacts.length,
      semanticChunksFound: semanticChunks.length,
      totalResultsFound: structuredFacts.length + semanticChunks.length,
      pipelineSuccess: structuredFacts.length > 0 || semanticChunks.length > 0,
      personalityContextAvailable: !!personalityContext,
      processingMethod: structuredFacts.length > 0 ? 'hybrid_facts_first' : 
                       semanticChunks.length > 0 ? (semanticChunks[0]?.metadata?.sidecarRetrieved ? 'sidecar_hybrid' : 'legacy_vector') : 'none'
    });

    // Build oracle-enhanced system prompt when in companion mode with hybrid retrieval
    let systemPrompt = ''
    if (useOracleMode && personalityContext) {
      
      // Helper function to format facts by facet
      const formatFactsByFacet = (facts: any[]) => {
        const factsByFacet = facts.reduce((groups, fact) => {
          const facet = fact.facet || 'general';
          if (!groups[facet]) groups[facet] = [];
          groups[facet].push(fact);
          return groups;
        }, {} as Record<string, any[]>);
        
        const facetOrder = ['numerology', 'astrology', 'mbti', 'human_design', 'big_five'];
        const orderedFacets = facetOrder.filter(f => factsByFacet[f]).concat(
          Object.keys(factsByFacet).filter(f => !facetOrder.includes(f))
        );
        
        return orderedFacets.map(facet => {
          const facetTitle = facet.replace(/_/g, ' ').toUpperCase();
          const facetFacts = factsByFacet[facet];
          const factsList = facetFacts.map(fact => {
            const value = fact.value_json?.value || fact.value_json;
            const label = fact.value_json?.label || fact.key.replace(/_/g, ' ');
            return `  • **${label}**: ${typeof value === 'object' ? JSON.stringify(value) : value}`;
          }).join('\n');
          
          return `**${facetTitle}** (${facetFacts.length} facts):\n${factsList}`;
        }).join('\n\n');
      };

      // Generate sections based on available data
      const factsSection = structuredFacts.length > 0 
        ? `\n\nCOMPREHENSIVE BLUEPRINT FOR ${personalityContext.name.toUpperCase()} (${structuredFacts.length} Facts Available):\n${formatFactsByFacet(structuredFacts)}` 
        : '';

      const narrativeSection = semanticChunks.length > 0 ? `

PERSONALITY INSIGHTS:
${semanticChunks.map(chunk => chunk.chunk_content || chunk.content).join('\n\n')}
` : '';

      // FUSION: Generate intent-aware prompt based on sidecar results
      const generateHybridPrompt = async () => {
        const userName = personalityContext.name || 'friend';
        const mbtiType = personalityContext.mbti || 'Unknown';
        const hdType = personalityContext.hdType || 'Unknown';
        const sunSign = personalityContext.sunSign || 'Unknown';
        
        // Get intent from sidecar or default to MIXED
        let intent = sidecarResult?.intent || 'MIXED';
        
        // NEW: Fallback educational detection if sidecar didn't classify properly
        if (intent === 'MIXED' || intent === 'unknown') {
          const educationalKeywords = /\b(why (do i|am i|can't i|does|is it)|how come|what makes me|i keep|i don't understand)\b/i;
          if (educationalKeywords.test(message.toLowerCase())) {
            console.log('📖 EDUCATIONAL FALLBACK: Detected educational intent locally');
            intent = 'EDUCATIONAL';
          }
        }
        
        console.log('🎯 FINAL INTENT:', intent);
        
        // NEW: Conditional Hermetic section fetching for educational intent
        let hermeticEducationalSections = {};
        if (intent === 'EDUCATIONAL') {
          const hermeticContext = await getHermeticEducationalContext(userId, message, supabase);
          hermeticEducationalSections = hermeticContext.sections;
          console.log(`📖 Educational mode activated with ${Object.keys(hermeticEducationalSections).length} Hermetic sections`);
        }
        
        // Generate voice characteristics based on personality
        const voiceStyle = generateVoiceStyle(mbtiType, hdType, sunSign);
        const humorStyle = generateHumorStyle(mbtiType, sunSign);
        const communicationDepth = generateCommunicationDepth(intelligenceLevel, mbtiType);

        // Conversation history is provided via messages array - no need for duplicate context

        // Check if user explicitly wants technical details
        const wantsTechnicalDetails = detectTechnicalDetailRequest(message);
        
        // Build Hermetic identity primer FIRST
        const hermeticPrimer = buildHermeticIdentityPrimer(hermeticEducationalSections, userName);
        
        return `${hermeticPrimer}

YOUR ROLE IN THIS CONVERSATION:
${getRoleForIntent(intent, userName, hermeticEducationalSections)}

${userName}'S CURRENT PROFILE (Technical Details):
- Name: ${userName}
- Natural thinking style: ${getThinkingStyleDescription(mbtiType)}${wantsTechnicalDetails ? ' (MBTI: ' + mbtiType + ')' : ''}
- Energy approach: ${getEnergyDescription(hdType)}${wantsTechnicalDetails ? ' (Human Design: ' + hdType + ')' : ''}
- Archetypal influence: ${getArchetypalDescription(sunSign)}${wantsTechnicalDetails ? ' (Sun Sign: ' + sunSign + ')' : ''}
- Intelligence Level: ${intelligenceLevel}/100${factsSection}${narrativeSection}

COMMUNICATION GUIDELINES:
${voiceStyle}
${humorStyle}
${communicationDepth}

UNIVERSAL RULES:
- DO NOT repeat or paraphrase the user's question back to them - jump directly into your response
- If this is a continuing conversation, NO greetings, NO welcomes, NO reintroductions
- Respond directly and naturally to what they asked - don't echo their words
- Use ${userName}'s name naturally when it feels warm and personal—avoid overusing it, but don't be afraid to use it to make responses feel more connected
- Keep language warm, accessible, and conversational
- When you have specific facts, state them confidently and precisely
- Provide insights that feel personally relevant
- If they seem resistant, ask deeper questions to understand the root issue
- Never explain how you know things about them - you simply understand them well

RESPONSE GUIDELINES:
1. Lead with recognition of their unique situation/question
2. For factual queries: Provide precise data first, then brief context
3. For interpretive queries: Focus on insights and guidance
4. For mixed queries: Balance facts with meaningful interpretation
5. CONVERSATION FLOW INTELLIGENCE: ${getConversationFlowGuidance(conversationState)}

Remember: You're ${userName}'s perceptive AI companion who has access to their detailed blueprint and can provide both specific facts and meaningful guidance through conversation.`;
      }

      systemPrompt = await generateHybridPrompt();
    } else {
      // Standard HACS prompt for non-oracle mode
      systemPrompt = `You are HACS (Holistic Autonomous Consciousness System), an AI companion designed to provide thoughtful, personalized guidance. 

You have access to the user's personality blueprint and should provide responses that feel natural and supportive, adapting to their communication style and needs.

${personalityContext ? `User Context: ${personalityContext.name} (${personalityContext.mbti}, ${personalityContext.hdType}, ${personalityContext.sunSign})` : 'Building understanding of user through conversation...'}

Respond helpfully while building rapport and understanding.`
    }

    // FULL BLUEPRINT DETECTION: Check if user is requesting comprehensive blueprint
    const isFullBlueprintRequest = /\b(full|complete|entire|comprehensive|whole|detailed)\s*(blueprint|analysis|reading|profile|assessment)\b/i.test(message) ||
                                   /\b(give me everything|show me all|tell me everything|full picture|complete picture)\b/i.test(message) ||
                                   /\b(my full\s*(self|personality|profile|analysis|blueprint))\b/i.test(message);

    // CLOSURE DETECTION: Apply hard limits if gate is disabled but closure detected
    const isClosure = conversationState.userSatisfied || conversationState.closureSignalDetected;
    
    // DYNAMIC TOKEN ALLOCATION: Increase max_tokens for full blueprint requests
    const maxTokens = isFullBlueprintRequest ? 4000 : (useOracleMode ? 1500 : 500);
    
    console.log('🔮 TOKEN ALLOCATION:', {
      isFullBlueprintRequest,
      maxTokens,
      messagePattern: message.toLowerCase().substring(0, 50) + '...',
      oracleMode: useOracleMode,
      closureDetected: isClosure
    });

    // MODEL SELECTION: Use GPT-4.1 mini for streaming capability and enhanced reasoning  
    const selectedModel = 'gpt-4.1-mini-2025-04-14';

    // CONVERSATION MEMORY: Build messages array with conversation history
    let messagesToSend: any[];
    let completionParams: any;
    
    // Build standard conversation memory (closure gate already handled early exit above)
    const messages = [
      { 
        role: 'system', 
        content: systemPrompt + '\n\nIMPORTANT: Use double line breaks (\\n\\n) between paragraphs to create natural reading pauses. Keep paragraphs to 2-3 sentences maximum for digestible, conversational flow.\n\nRespond directly and naturally without repeating the user\'s question - they already know what they asked.'
      }
    ];

    // Add conversation history if available (last 5 exchanges to stay within token limits)
    if (finalHistory && Array.isArray(finalHistory) && finalHistory.length > 0) {
      const recentHistory = finalHistory.slice(-10); // Last 10 messages (5 exchanges)
      
      // Validate each message before adding to context
      const validatedHistory = recentHistory.filter(msg => {
        if (!msg || typeof msg !== 'object') {
          console.warn('⚠️ Invalid message object found in history:', msg);
          return false;
        }
        if (!msg.role || !['system', 'user', 'assistant'].includes(msg.role)) {
          console.warn('⚠️ Invalid message role found:', msg.role);
          return false;
        }
        if (!msg.content || typeof msg.content !== 'string' || msg.content.trim() === '') {
          console.warn('⚠️ Invalid message content found:', msg.content);
          return false;
        }
        return true;
      });
      
      messages.push(...validatedHistory);
      console.log(`🧠 CONVERSATION CONTEXT: Including ${validatedHistory.length} validated messages (${recentHistory.length - validatedHistory.length} filtered out)`);
    }

    // Add current user message with validation
    if (!message || typeof message !== 'string' || message.trim() === '') {
      throw new Error('Invalid user message: message must be a non-empty string');
    }
    messages.push({ role: 'user', content: message });

    console.log(`🔗 MESSAGE ARRAY: Total messages: ${messages.length}, History included: ${conversationHistory?.length || 0} original messages`);

    messagesToSend = messages;
    completionParams = {
      model: selectedModel,
      messages: messagesToSend,
      temperature: useOracleMode ? 0.8 : 0.7,
      max_completion_tokens: maxTokens
    };

    console.log('🔮 PREPARED MESSAGES:', {
      messageCount: messagesToSend.length,
      systemPromptLength: messagesToSend[0].content.length,
      lastUserMessage: message.substring(0, 100) + '...',
      closureMode: isClosure
    });

    // OPENAI API CALL: Send messages to GPT model
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    console.log('🔮 CALLING OPENAI API:', {
      model: completionParams.model,
      messageCount: messagesToSend.length,
      maxTokens: completionParams.max_completion_tokens,
      temperature: completionParams.temperature,
      oracleStatus,
      hasOracleContext: structuredFacts.length > 0 || semanticChunks.length > 0
    });

    // Call OpenAI for response generation using current model
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(completionParams),
    });

    // Enhanced error handling with full response details
    const responseText = await openAIResponse.text();
    if (!openAIResponse.ok) {
      let parsedError;
      try {
        parsedError = JSON.parse(responseText);
      } catch (parseErr) {
        console.error('❌ Failed to parse OpenAI error response:', parseErr);
      }
      
      console.error('❌ OpenAI API error details:', {
        status: openAIResponse.status,
        statusText: openAIResponse.statusText,
        headers: Object.fromEntries(openAIResponse.headers.entries()),
        body: parsedError || responseText,
        requestContext: {
          model: selectedModel,
          messageCount: messages.length,
          estimatedTokens: messages.reduce((acc, msg) => acc + (msg.content?.length || 0), 0) / 4, // Rough estimation
          oracleMode: useOracleMode
        }
      });
      
      const errorMessage = parsedError?.error?.message || responseText || `HTTP ${openAIResponse.status}`;
      throw new Error(`OpenAI API error: ${errorMessage}`);
    }
    
    const aiResponse = JSON.parse(responseText);
    let response = aiResponse.choices[0]?.message?.content || 'I sense a disturbance in our connection. Please try reaching out again.'

    // FUSION STEP 2: Prepare oracle response data for HACS intelligence integration
    const oracleResponseData = {
      response,
      oracleStatus,
      semanticChunks: semanticChunks.length,
      quality: intelligenceLevel > 70 ? 0.9 : 0.8, // Higher quality for advanced users
      personalityContext
    };

    // FUSION STEP 3: Start background HACS intelligence processing (non-blocking)
    console.log('🔍 FUSION CHECK: Background intelligence flag', {
      enableBackgroundIntelligence,
      hasEdgeRuntime: typeof EdgeRuntime !== 'undefined',
      hasWaitUntil: typeof EdgeRuntime !== 'undefined' && !!EdgeRuntime.waitUntil,
      timestamp: new Date().toISOString()
    });

    if (enableBackgroundIntelligence) {
      console.log('🚀 FUSION TRIGGERED: Starting background HACS intelligence processing', {
        userId,
        sessionId,
        oracleResponseDataKeys: Object.keys(oracleResponseData)
      });

      // PHASE 3: Run fusion and insight generation in parallel background tasks
      try {
        console.log('🚀 BACKGROUND TASKS: Starting fusion and insight generation');
        
        // Run both tasks in parallel using Promise.all
        await Promise.all([
          fuseWithHACSIntelligence(message, userId, sessionId, oracleResponseData, supabase)
            .catch(error => {
              console.error('❌ Fusion task failed:', error);
              // Don't throw - let insight generation continue
            }),
          generateConversationInsights(userId, sessionId, supabase)
            .catch(error => {
              console.error('❌ Insight generation task failed:', error);
              // Don't throw - let fusion continue
            })
        ]);
        
        console.log('✅ BACKGROUND TASKS: Both tasks completed');
      } catch (error) {
        console.error('❌ BACKGROUND TASKS: Unexpected error', {
          error: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
          } : error
        });
      }

      /* ORIGINAL BACKGROUND EXECUTION (temporarily disabled for diagnostics)
      // Use EdgeRuntime.waitUntil to run background task without blocking response
      if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
        console.log('📤 Using EdgeRuntime.waitUntil for background fusion');
        EdgeRuntime.waitUntil(fuseWithHACSIntelligence(message, userId, sessionId, oracleResponseData, supabase));
      } else {
        console.log('📤 Using fallback fire-and-forget for background fusion');
        // Fallback: Fire and forget background task
        fuseWithHACSIntelligence(message, userId, sessionId, oracleResponseData, supabase).catch(error => {
          console.error('❌ Background fusion task failed:', error);
        });
      }
      */
    } else {
      console.log('⏭️ FUSION SKIPPED: Background intelligence disabled', {
        flag: enableBackgroundIntelligence,
        reason: 'enableBackgroundIntelligence is false'
      });
    }

    // Log metrics for cost tracking
    const tokenUsage = aiResponse.usage || {};
    console.log('📊 FUSION: Oracle Response Metrics:', {
      mode: useOracleMode ? 'oracle' : 'standard',
      status: oracleStatus,
      semanticChunks: semanticChunks.length,
      intelligenceLevel,
      backgroundFusion: enableBackgroundIntelligence,
      tokens: tokenUsage,
      responseLength: response.length
    });

    // FUSION STEP 4: Return immediate response (fusion happens in background)
    return new Response(JSON.stringify({
      response,
      quality: 0.85,
      semanticChunks,
      structuredFacts,
      personalityContext,
      intelligenceLevel,
      oracleStatus,
      processingTime: Date.now() - startTime
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("❌ Oracle Conversation Error:", error);
    return new Response(JSON.stringify({
      error: (error as Error).message,
      response: "The cosmic channels are temporarily disrupted. Please try again, seeker."
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  });
