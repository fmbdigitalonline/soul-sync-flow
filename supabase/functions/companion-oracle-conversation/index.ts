// Companion Oracle Conversation Edge Function
// Built with SoulSync Protocol - NEVER BREAK FUNCTIONALITY
// Fixed: Added getPhaseGuidance method to conversation-phase-tracker
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// PHASE 1: Import edge-compatible services from _shared directory
import { ConversationShadowDetector } from '../_shared/conversation-shadow-detector.ts';
import { ConversationPhaseTracker } from '../_shared/conversation-phase-tracker.ts';

// Helper function to detect if user wants technical personality details
function detectTechnicalDetailRequest(message: string): boolean {
  const technicalKeywords = /\b(mbti|human design|personality type|what.*type|technical|specific|sun sign|projector|enfp|intj|generator|manifestor|manifesting generator|reflector)\b/i;
  return technicalKeywords.test(message);
}

function getConversationFlowGuidance(conversationState: any): string {
  const detection = conversationState?.detectionResult;
  
  // Null guard: Return default guidance if detection failed
  if (!detection || !detection.cluster) {
    console.warn('⚠️ getConversationFlowGuidance: detectionResult is null, using default');
    return 'Respond naturally and empathetically to the user\'s message.';
  }
  
  // Priority 1: Closure cluster
  if (detection.cluster === 'closure') {
    return `CLOSURE MODE: User signaled ${detection.subState}. Acknowledge warmly and STOP. No new content or questions.`;
  }
  
  // Priority 2: Meta-dialogue cluster
  if (detection.cluster === 'meta_dialogue') {
    return `META MODE: User is giving instruction about conversation style (${detection.subState}). Acknowledge and adapt immediately in ≤1 line.`;
  }
  
  // Priority 3: Frustration cluster — v3.5 Emotional Evidence gate.
  // Only enter FRUSTRATION MODE when there is evidence from the current
  // exchange (plainly expressed now, or recurred across the last 3
  // messages). Without it, do NOT assert the feeling — mirror the message
  // as it actually reads.
  if (detection.cluster === 'frustration') {
    if (detection.emotionEvidence === false) {
      return 'Mirror the user\'s actual register for this message without assigning an emotion. If it reads as neutral or even, meet it as such; if you sense something under it, check lightly rather than stating it.';
    }
    return `FRUSTRATION MODE: User is ${detection.subState}. Acknowledge in 1 line, then give friction-reducing step + quick win.`;
  }
  
  // Priority 4: Use schema-defined opening rule (with fallback)
  return detection.openingRule || 'Respond thoughtfully based on conversation context.';
}

// Helper function to convert MBTI types to natural descriptions
function getThinkingStyleDescription(mbtiType: string): string {
  const descriptions: Record<string, string> = {
    'ENFP': 'creative and inspiring explorer',
    'INTJ': 'strategic and analytical architect', 
    'INFP': 'values-driven and empathetic idealist',
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

// PHASE 4: Enhanced conversation state detection with comprehensive cluster taxonomy
function detectConversationState(message: string, conversationHistory: any[] = []) {
  // ✅ Layer 1: Defensive guard clause - prevent undefined.trim() crash
  if (!message || typeof message !== 'string') {
    console.error('❌ EDGE FUNCTION: detectConversationState called with invalid message', { 
      messageType: typeof message, 
      messageValue: message 
    });
    
    // Return neutral state instead of crashing
    return {
      isActive: false,
      userSatisfied: false,
      closureSignalDetected: false,
      lastInteractionType: 'neutral',
      shouldAskQuestion: false,
      intent: 'neutral',
      detectionResult: null
    };
  }
  
  console.log('🎯 EDGE FUNCTION: Valid message received, calling ConversationPhaseTracker...');
  const detection = ConversationPhaseTracker.detectState(message, conversationHistory);
  
  console.log('🎯 CONVERSATION STATE DETECTION:', {
    cluster: detection.cluster,
    subState: detection.subState,
    confidence: detection.confidence,
    signalCount: detection.signals.length,
    topSignals: detection.signals.slice(0, 3).map(s => `${s.type}:${s.id}`)
  });
  
  // Log when returning null detectionResult for debugging
  if (!detection) {
    console.warn('⚠️ CONVERSATION STATE: Returning null detectionResult', {
      messageValid: !!message,
      messageType: typeof message,
      messageLength: message?.length || 0,
      timestamp: new Date().toISOString()
    });
  }

  // Map to backward-compatible format for existing code
  return {
    isActive: detection?.cluster !== 'closure',
    userSatisfied: detection?.cluster === 'closure' && detection?.subState === 'gratitude',
    closureSignalDetected: detection?.cluster === 'closure',
    lastInteractionType: detection?.cluster || 'unknown',
    shouldAskQuestion: ['exploration', 'clarification', 'validation'].includes(detection?.cluster || ''),
    detectionResult: detection || null
  };
}

// PERSISTENCE HELPER: Store conversation state in database (SoulSync addon - never breaks existing flow)
async function persistConversationState(
  supabaseClient: any,
  userId: string,
  sessionId: string,
  detection: any
) {
  try {
    console.log('📊 PERSISTENCE: Storing conversation state to conversation_state_tracking...');
    
    const { data, error } = await supabaseClient
      .from('conversation_state_tracking')
      .insert({
        user_id: userId,
        session_id: sessionId,
        cluster: detection.cluster,
        sub_state: detection.subState,
        confidence: detection.confidence,
        signals: detection.signals,
        paralinguistic_count: detection.signals.filter(s => s.type === 'paralinguistic').length,
        sentence_form_count: detection.signals.filter(s => s.type === 'sentence_form').length,
        discourse_marker_count: detection.signals.filter(s => s.type === 'discourse_marker').length,
        cluster_pattern_count: detection.signals.filter(s => s.type === 'cluster_pattern').length,
        opening_rule: detection.openingRule || null,
        allowed_next_clusters: detection.allowedNextClusters || []
      });

    if (error) {
      console.error('⚠️ PERSISTENCE: State storage failed (non-blocking):', error.message);
    } else {
      console.log('✅ PERSISTENCE: Conversation state stored successfully');
    }
  } catch (error) {
    console.error('⚠️ PERSISTENCE: State storage error (non-blocking):', error);
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
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

/**
 * Calculate token budget based on intent complexity
 * Principle #2: Real data budgeting, no arbitrary limits
 */
function calculateContextBudget(intent: string): {
  hermeticSections: number;
  vectorChunks: number;
  behavioralMemories: number;
  totalWordsEstimate: number;
} {
  switch(intent) {
    case 'BLUEPRINT_GUIDANCE':
    case 'SHADOW_EXPLORATION':
      return {
        hermeticSections: 5,
        vectorChunks: 5,
        behavioralMemories: 5,
        totalWordsEstimate: 1800
      };
    
    case 'EDUCATIONAL':
    case 'ALIGNED_ACTION':
      return {
        hermeticSections: 3,
        vectorChunks: 5,
        behavioralMemories: 3,
        totalWordsEstimate: 1300
      };
    
    default: // MIXED, FACTUAL, INTERPRETIVE
      return {
        hermeticSections: 2,
        vectorChunks: 3,
        behavioralMemories: 2,
        totalWordsEstimate: 800
      };
  }
}

// NEW: Fetch relevant Hermetic 2.0 report sections with intent-based prioritization
async function getHermeticEducationalContext(
  userId: string,
  message: string,
  supabase: any,
  intent: string = 'MIXED'
): Promise<{ sections: Record<string, any>; topicMap: string[] }> {
  try {
    console.log('📖 HERMETIC CONTEXT: Fetching report sections for intent:', intent);
    
    // Intent-based section prioritization (Principle #6: Respect Critical Data Pathways)
    let prioritySections: string[] = [];
    
    switch(intent) {
      case 'BLUEPRINT_GUIDANCE':
        prioritySections = [
          'integrated_summary',
          'core_personality_pattern', 
          'decision_making_style',
          'authentic_expression_guide',
          'transformation_roadmap'
        ];
        break;
      
      case 'EDUCATIONAL':
        prioritySections = [
          'core_personality_pattern',
          'shadow_work',
          'behavioral_patterns',
          'cognitive_style'
        ];
        break;
      
      case 'SHADOW_EXPLORATION':
        prioritySections = [
          'shadow_work',
          'transformation_roadmap',
          'inner_conflicts',
          'growth_edges'
        ];
        break;
      
      case 'ALIGNED_ACTION':
        prioritySections = [
          'decision_making_style',
          'authentic_expression_guide',
          'transformation_roadmap'
        ];
        break;
        
      default:
        prioritySections = [
          'integrated_summary',
          'core_personality_pattern',
          'decision_making_style'
        ];
    }
    
    // Topic-based expansion (existing logic preserved)
    const messageLower = message.toLowerCase();
    if (/\b(relationship|connect|people|social)\b/i.test(messageLower)) {
      prioritySections.push('relationship_dynamics', 'communication_style');
    }
    if (/\b(decision|choice|stuck|should i)\b/i.test(messageLower)) {
      prioritySections.push('decision_making_style', 'core_personality_pattern');
    }
    if (/\b(energy|alone|tired|recharge)\b/i.test(messageLower)) {
      prioritySections.push('current_energy_timing', 'energy_patterns');
    }
    if (/\b(purpose|calling|meaning)\b/i.test(messageLower)) {
      prioritySections.push('life_path_purpose', 'integrated_summary');
    }
    
    // Fetch from CORRECT table (Principle #1: Fix bugs, don't mask them)
    const { data: reportData, error } = await supabase
      .from('personality_reports')
      .select('report_content, structured_intelligence')
      .eq('user_id', userId)
      .eq('blueprint_version', '2.0')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error('❌ Error fetching Hermetic report:', error);
      throw error; // Principle #3: Surface errors, don't mask
    }
    
    if (!reportData) {
      console.log('⚠️ No Hermetic report found for user');
      return { sections: {}, topicMap: [] }; // Principle #2: Real empty state, not simulated data
    }
    
    const reportContent = typeof reportData.report_content === 'string'
      ? JSON.parse(reportData.report_content)
      : reportData.report_content;

    const structuredIntelligence = typeof reportData.structured_intelligence === 'string'
      ? JSON.parse(reportData.structured_intelligence)
      : reportData.structured_intelligence;

    let contentSource: 'report_content' | 'structured_intelligence' = 'report_content';
    let selectedContent = reportContent;

    if (!selectedContent || Object.keys(selectedContent).length === 0) {
      selectedContent = structuredIntelligence;
      contentSource = 'structured_intelligence';
    }

    // Extract priority sections
    const extractedSections: Record<string, any> = {};
    prioritySections.forEach(section => {
      if (selectedContent?.[section]) {
        extractedSections[section] = selectedContent[section];
      }
    });

    console.log(`✅ Retrieved ${Object.keys(extractedSections).length} Hermetic sections for educational mode`, {
      source: contentSource,
      hasReportContent: !!reportContent,
      hasStructuredIntelligence: !!structuredIntelligence
    });
    
    return { 
      sections: extractedSections, 
      topicMap: prioritySections 
    };
    
  } catch (error) {
    console.error('❌ Error fetching Hermetic educational context:', error);
    throw error; // Principle #3: Don't mask errors with fallbacks
  }
}

/**
 * Retrieve relevant behavioral patterns from user_session_memory
 * Principle #6: Integrate with existing memory systems without breaking them
 */
async function getBehavioralMemoryContext(
  userId: string,
  message: string,
  supabase: any,
  maxMemories: number = 5
): Promise<{ memories: any[]; patterns: string[] }> {
  
  try {
    // Principle #2: Operate on ground truth - validate input
    if (!message || typeof message !== 'string') {
      console.log('⚠️ No valid message provided for behavioral memory context');
      return { memories: [], patterns: [] };
    }
    
    console.log('🧠 Fetching behavioral memories from user_session_memory');
    
    // Detect what type of behavioral insight user needs
    const needsDecisionPattern = message 
      ? /\b(decide|choice|should i|what to do|stuck)\b/i.test(message)
      : false;
    const needsEmotionalPattern = /\b(feel|feeling|mood|emotion|anxiety|fear)\b/i.test(message);
    const needsActionPattern = /\b(do|doing|action|approach|handle|navigate)\b/i.test(message);
    
    // Build memory type filter. 'insight' rows are what the user
    // explicitly asked the twin to remember ("Help me remember this",
    // v2.6) — always included.
    let memoryTypes = ['interaction', 'insight'];
    if (needsEmotionalPattern) memoryTypes.push('mood');
    if (needsActionPattern) memoryTypes.push('micro_action');
    
    // Fetch recent relevant memories (Principle #2: Real data only)
    const { data: memories, error } = await supabase
      .from('user_session_memory')
      .select('*')
      .eq('user_id', userId)
      .in('memory_type', memoryTypes)
      .order('created_at', { ascending: false })
      .limit(maxMemories * 2);
    
    if (error) {
      console.error('❌ Error fetching behavioral memories:', error);
      throw error; // Principle #3: Surface errors
    }
    
    if (!memories || memories.length === 0) {
      console.log('⚠️ No behavioral memories found');
      return { memories: [], patterns: [] }; // Principle #2: Real empty state
    }
    
    // Relevance scoring over memory_data. (Fixed Jul 19: this read the
    // nonexistent column `memory_content` since inception — relevance was
    // always 0 and pattern extraction crashed on importance>5 rows, so the
    // twin never actually used behavioral memory.)
    const messageKeywords = (message && typeof message === 'string')
      ? message.toLowerCase().split(' ').filter(w => w.length > 4)
      : []; // Principle #3: Real empty state, not crash

    const scoredMemories = memories.map(mem => {
      const rawContent = mem?.memory_data != null ? JSON.stringify(mem.memory_data) : '';
      const content = rawContent.toLowerCase();
      // Explicitly remembered insights get a small prior so a fresh
      // "remember this" isn't dropped for lacking keyword overlap.
      const relevanceScore = messageKeywords.filter(kw => content.includes(kw)).length
        + (mem?.memory_type === 'insight' ? 1 : 0);
      return { ...mem, relevanceScore };
    });

    // Take top N by relevance
    const topMemories = scoredMemories
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxMemories);

    // Guaranteed slot (v2.6): "Help me remember this" promises don't-let-
    // this-be-lost — the newest explicitly remembered insight always
    // surfaces, even when keyword overlap favors older rows.
    const newestInsight = scoredMemories
      .filter((m) => m.memory_type === 'insight')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    if (newestInsight && topMemories.length > 0 && !topMemories.some((m) => m.id === newestInsight.id)) {
      topMemories[topMemories.length - 1] = newestInsight;
    }

    // Extract behavioral patterns from memory content
    const patterns = topMemories
      .filter(m => (m.importance_score ?? 0) > 5)
      .map(m => {
        const content = m.memory_data as any;
        if (!content || typeof content !== 'object') return null;
        if (content.insights) return content.insights;
        if (content.summary) return content.summary;
        return null;
      })
      .filter(Boolean);
    
    console.log('✅ Retrieved behavioral memories:', {
      totalAvailable: memories.length,
      topSelected: topMemories.length,
      patternsExtracted: patterns.length,
      memoryTypes: [...new Set(topMemories.map(m => m.memory_type))]
    });
    
    return { memories: topMemories, patterns };
    
  } catch (error) {
    console.error('❌ Error fetching behavioral memories:', error);
    throw error; // Principle #3: Don't mask errors
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
// Principle #2: Ground truth only, no simulated data
function buildHermeticIdentityPrimer(
  hermeticSections: Record<string, any>, 
  userName: string,
  behavioralPatterns: string[] = []
): string {
  if (!hermeticSections || Object.keys(hermeticSections).length === 0) {
    return ''; // Principle #2: Real empty state when no data
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
  
  // Add behavioral patterns section (Principle #1: Additive enhancement)
  if (behavioralPatterns.length > 0) {
    primer += `✦ BEHAVIORAL PATTERNS (How ${userName} actually acts in real situations):\n`;
    behavioralPatterns.forEach((pattern, i) => {
      primer += `${i + 1}. ${pattern}\n`;
    });
    primer += `\n`;
  }
  
  primer += `═══════════════════════════════════════════════════════════\n`;
  primer += `When you respond, you speak from DEEP KNOWING of ${userName}.\n`;
  primer += `This is not guesswork or generic coaching. You are their mirror.\n`;
  primer += `═══════════════════════════════════════════════════════════\n\n`;
  
primer += `ORACLE RESPONSE MODE - HERMETIC PRIORITY:\n`;
primer += `When ${userName} shares a situation, PULL FROM THE 80,000+ WORD HERMETIC REPORT SECTIONS.\n`;
primer += `\n`;
primer += `PRIORITY ORDER:\n`;
primer += `1. HERMETIC REPORT SECTIONS (structured_intelligence, seven_laws, gate_analyses, shadow_work)\n`;
primer += `2. Behavioral memory patterns (past conversations)\n`;
primer += `3. Only mention personality labels (ENFP, Projector) if directly relevant\n`;
primer += `\n`;
primer += `NOT: "Your ENFP pattern..." (too surface-level)\n`;
primer += `YES: "Your Hermetic profile shows [specific pattern from report] which manifests as [concrete behavior from memory]. [Actionable insight from report]."\n`;
primer += `\n`;
primer += `EXAMPLE APPLICATION:\n`;
primer += `User: "People steal my ideas and I don't get credit"\n`;
primer += `Oracle response: "[From Hermetic shadow_work]: Your identity construct around 'innovation without recognition' stems from [specific trigger pattern]. [From behavioral memory: sister-in-law AI mockup situation]. [From integration_practices]: Establish co-creation agreements that credit your contribution before sharing insights. I'm here if this brings up more."\n`;
primer += `═══════════════════════════════════════════════════════════\n\n`;
  
  console.log('✅ HERMETIC PRIMER DATA CHECK:', {
    sectionsAvailable: Object.keys(hermeticSections),
    hasIntegratedSummary: !!hermeticSections.integrated_summary,
    hasCorePattern: !!hermeticSections.core_personality_pattern,
    hasDecisionStyle: !!hermeticSections.decision_making_style,
    hasRelationshipStyle: !!hermeticSections.relationship_style,
    behavioralPatternsCount: behavioralPatterns.length,
    totalSectionCount: Object.keys(hermeticSections).length,
    primerLength: primer.length
  });
  
  return primer;
}

// ────────────────────────────────────────────────────────────────────
// PHASE 1 (item 4): STRUCTURED INTELLIGENCE STATE SPINE.
// Fixed subset of the 13 typed dimensions, serialised to one compact
// system block (hard-capped ≤ ~350 tokens), injected in the SAME slot
// every turn (right after the main system prompt, before history) so
// prompt caching stays stable. Fail-soft: row missing → no block.
// ────────────────────────────────────────────────────────────────────
async function buildStructuredIntelligenceSpine(userId: string, supabase: any): Promise<string | null> {
  try {
    // Source-of-truth: personality_reports blob. The typed table
    // hermetic_structured_intelligence is a lossy derived cache and, for
    // ~half of existing rows, holds scalar strings instead of objects,
    // which caused a silent-spine for those users. We now read the blob
    // (column first, nested fallback) and only fall back to the typed
    // table if the blob is missing.
    const clip = (v: unknown, max: number): string => {
      const s = typeof v === 'string' ? v : (v == null ? '' : String(v));
      return s.length > max ? s.slice(0, max) + '…' : s;
    };

    let hsi: any = null;
    let source: 'blob_column' | 'blob_nested' | 'typed_table' | null = null;

    const { data: report, error: reportErr } = await supabase
      .from('personality_reports')
      .select('structured_intelligence, report_content')
      .eq('user_id', userId)
      .not('report_content', 'is', null)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (reportErr) {
      console.warn('⚠️ SPINE: personality_reports fetch failed:', reportErr.message);
    }

    if (report) {
      const parseMaybe = (v: any) => (typeof v === 'string' ? (() => { try { return JSON.parse(v); } catch { return null; } })() : v);
      const siCol = parseMaybe((report as any).structured_intelligence);
      const siNested = parseMaybe((report as any).report_content?.structured_intelligence);
      if (siCol && typeof siCol === 'object') { hsi = siCol; source = 'blob_column'; }
      else if (siNested && typeof siNested === 'object') { hsi = siNested; source = 'blob_nested'; }
    }

    if (!hsi) {
      const { data: tbl, error: tblErr } = await supabase
        .from('hermetic_structured_intelligence')
        .select('execution_bias, behavioral_triggers, temporal_biology, identity_constructs, crisis_handling')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (tblErr) console.warn('⚠️ SPINE: typed-table fallback failed:', tblErr.message);
      if (tbl) { hsi = tbl; source = 'typed_table'; }
    }

    if (!hsi) return null;

    // Shape-agnostic dimension reader. Blob rows are `{analysis: "prose"}`
    // per dimension; typed-table rows are `{preferred_style, ...}` or a
    // scalar string on broken rows. Returns the best available prose.
    const dimProse = (dim: any): string => {
      if (!dim) return '';
      if (typeof dim === 'string') return dim;              // broken-row scalar
      if (typeof dim !== 'object') return '';
      if (typeof dim.analysis === 'string') return dim.analysis; // blob shape
      return '';
    };
    const dimField = (dim: any, key: string): any => {
      return dim && typeof dim === 'object' && !Array.isArray(dim) ? dim[key] : undefined;
    };

    const lines: string[] = [];

    // Execution bias — prefer typed sub-keys, else prose analysis.
    const eb = hsi.execution_bias;
    const ebStyle = dimField(eb, 'preferred_style');
    const ebCompletion = dimField(eb, 'completion_patterns');
    if (ebStyle) lines.push(`- Execution style: ${clip(ebStyle, 180)}`);
    if (ebCompletion) lines.push(`- Completion pattern: ${clip(ebCompletion, 180)}`);
    if (!ebStyle && !ebCompletion) {
      const prose = dimProse(eb);
      if (prose) lines.push(`- Execution bias: ${clip(prose, 260)}`);
    }

    // Behavioral triggers — avoidance list, else prose.
    const bt = hsi.behavioral_triggers;
    const avoidance = dimField(bt, 'avoidance_patterns');
    if (Array.isArray(avoidance) && avoidance.length > 0) {
      lines.push(`- Avoidance patterns: ${avoidance.slice(0, 3).map((a: any) => clip(a, 90)).join(' | ')}`);
    } else {
      const prose = dimProse(bt);
      if (prose) lines.push(`- Behavioral triggers: ${clip(prose, 220)}`);
    }

    // Temporal biology — peaks list, else prose.
    const tb = hsi.temporal_biology;
    const peaks = dimField(tb, 'cognitive_peaks');
    if (Array.isArray(peaks) && peaks.length > 0) {
      lines.push(`- Cognitive peaks: ${peaks.slice(0, 3).map((p: any) => clip(p, 70)).join(' | ')}`);
    } else {
      const prose = dimProse(tb);
      if (prose) lines.push(`- Temporal biology: ${clip(prose, 200)}`);
    }

    // Identity constructs — first core narrative, else prose.
    const ic = hsi.identity_constructs;
    const narratives = dimField(ic, 'core_narratives');
    if (Array.isArray(narratives) && narratives.length > 0) {
      lines.push(`- Core narrative: ${clip(narratives[0], 200)}`);
    } else {
      const prose = dimProse(ic);
      if (prose) lines.push(`- Identity constructs: ${clip(prose, 220)}`);
    }

    // Crisis handling — first bounce-back ritual, else prose.
    const ch = hsi.crisis_handling;
    const rituals = dimField(ch, 'bounce_back_rituals');
    if (Array.isArray(rituals) && rituals.length > 0) {
      lines.push(`- Bounce-back ritual: ${clip(rituals[0], 140)}`);
    } else {
      const prose = dimProse(ch);
      if (prose) lines.push(`- Crisis handling: ${clip(prose, 200)}`);
    }

    if (lines.length === 0) return null;

    let block = 'USER STATE SPINE (structured): ground your read and any plan in these verified patterns. Do not recite them; let them shape word choice, pacing, and what you push on.\n' + lines.join('\n');

    // Hard cap ≈ 350 tokens (~1400 chars): trim trailing lines until under cap.
    const CHAR_CAP = 1400;
    while (block.length > CHAR_CAP && lines.length > 1) {
      lines.pop();
      block = 'USER STATE SPINE (structured): ground your read and any plan in these verified patterns. Do not recite them; let them shape word choice, pacing, and what you push on.\n' + lines.join('\n');
    }
    if (block.length > CHAR_CAP) block = block.slice(0, CHAR_CAP);

    console.log(`📐 SPINE: ~${Math.ceil(block.length / 4)} tokens injected`, { lines: lines.length, source });
    return block;
  } catch (e) {
    console.warn('⚠️ SPINE: build failed (non-blocking):', e instanceof Error ? e.message : e);
    return null;
  }
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
    style += "- Connect to patterns and possibilities they naturally see\n";
    style += "- CRITICAL: Understand their ACTUAL message first, including any irony, contradiction, or paradox\n";
    style += "- Use metaphors ONLY when they clarify meaning, never as a substitute for comprehension\n";
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

Keep total response under 100 words. No jargon. Speak like a friend who deeply knows them.

CRITICAL: End naturally—no exploration questions, no "Would you like", no "Wil je".`;

    case 'BLUEPRINT_GUIDANCE':
      return `You are ${userName}'s blueprint interpreter with access to their complete 80,000+ word Hermetic 2.0 report AND behavioral memory patterns.

CRITICAL: "Blueprint" means BOTH their basic traits (MBTI, Human Design, Life Path) AND their deep Hermetic report containing how they think, act, their shadow sides, and behavioral patterns.

RESPONSE STRUCTURE (HERMETIC + BEHAVIORAL FUSION):
1. ACKNOWLEDGE SITUATION: Reflect what they're navigating (1 sentence, concrete—no metaphors yet)
2. BLUEPRINT INSIGHT: Pull from Hermetic report sections to explain WHY they think/act this way (2-3 sentences, specific patterns)
3. BEHAVIORAL EVIDENCE: Reference actual behavioral patterns from their memory to show HOW this plays out in real situations (1-2 sentences)
4. ALIGNED ACTION: One immediately actionable step that honors their blueprint (1 sentence)

FOCUS AREAS FOR BLUEPRINT GUIDANCE:
- Pull from: integrated_summary, core_personality_pattern, decision_making_style, authentic_expression_guide, transformation_roadmap
- Emphasize: Concrete personality mechanics, decision frameworks, shadow awareness, aligned strategies

MANDATORY RULES:
- NO generic advice - everything must be grounded in THEIR specific Hermetic patterns
- If you use a metaphor, immediately follow with: "In practical terms, this means [concrete action]"
- Users seek alignment to reach goals, be happy, and approach challenges—speak to this directly

CRITICAL ENDING RULES:
❌ NEVER: "Would you like to know...", "Wil je ontdekken...", "Shall we explore..."
✅ ALWAYS: "I'm here when you're ready to dive deeper." OR "Let me know if this resonates."`;
    
    case 'SHADOW_EXPLORATION':
      return `You are ${userName}'s shadow work guide with access to their Hermetic 2.0 report and behavioral memory patterns.

RESPONSE STRUCTURE (SHADOW-FOCUSED):
1. ACKNOWLEDGE PATTERN: Reflect the pattern they're noticing (1 sentence)
2. SHADOW INSIGHT: Connect to specific shadow patterns from Hermetic report (2 sentences)
3. BEHAVIORAL EVIDENCE: Reference how this shadow pattern manifests in their actual behavior (1-2 sentences)
4. COMPASSIONATE ACKNOWLEDGMENT: Hold space for this awareness (1 sentence)

CRITICAL: End with compassionate acknowledgment, NOT exploration questions.
Example: "This pattern takes courage to see. I'm here." NOT "Would you like to explore this?"`;
    
    case 'ALIGNED_ACTION':
      return `You are ${userName}'s action strategist with access to their Hermetic 2.0 report and behavioral memory patterns.

RESPONSE STRUCTURE (ACTION-FOCUSED):
1. ACKNOWLEDGE SITUATION: Reflect where they are (1 sentence)
2. BLUEPRINT-ALIGNED ACTION: One specific, immediately actionable step grounded in their Hermetic patterns (2-3 sentences)
3. BEHAVIORAL VALIDATION: Show why this action works for their demonstrated patterns (1 sentence)

END with the concrete action step. No follow-up questions.`;

    default: // ORACLE MODE (formerly MIXED)
      return `You are ${userName}'s oracle companion with their complete 80,000+ word Hermetic 2.0 report AND behavioral memory patterns.

CRITICAL ROLE DEFINITION:
❌ You are NOT a coach who asks questions
✅ You ARE an oracle who provides insights from their data

YOUR JOB: TELL them what their blueprint reveals about this situation.

RESPONSE STRUCTURE (ORACLE-MODE):
1. ACKNOWLEDGE: Mirror their situation with compassion (1 sentence, specific)
2. BLUEPRINT MECHANISM: Explain WHY this pattern exists using their Hermetic data (2-3 sentences—cite specific personality mechanics)
3. BEHAVIORAL EVIDENCE: Show HOW this manifests using their memory patterns (1-2 sentences)
4. ALIGNED INSIGHT: Provide ONE concrete reframe or action from their blueprint (1 sentence)

EXAMPLES:
❌ BAD (coaching): "Wat als je jouw AI-schetsen gebruikt als inspiratie? Hoe zou dat voelen?"
✅ GOOD (oracle): "Your ENFP pattern creates through rapid exploration, not linear refinement—position your AI sketches as 'creative direction' for specialists, not pixel-perfect UI."

❌ BAD (coaching): "What do you think is causing this doubt?"
✅ GOOD (oracle): "This recurring doubt pattern appears when your divergent creative process (exploration-first) clashes with specialist expectations (credentials-first)—it's architectural, not a skill gap."

ENDING:
❌ NEVER: deflecting coaching questions that outsource the insight ("What do you think is causing this?", "Would you like to explore...", "Hoe zou dat voelen?")
✅ ALLOWED sparingly: after DELIVERING your insight, ONE short hypothesis-check inviting confirmation or pushback ("Am I close?", "Klopt dit?") — you are checking your read, not fishing for direction. This is the EXCEPTION, not the rule.
❌ NEVER end with a ritual sign-off. "I'm here if this brings up more." and "Let me know how this lands." are BANNED phrases — they are template tells.`;
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
    );

    const { message, userId, sessionId, useOracleMode = false, enableBackgroundIntelligence = true, conversationHistory = [], userProfile = {}, threadId, firstContact = false, confirmedAction = null } = await req.json()

    // DETERMINISTIC CONFIRMATION RAIL (Constitution Phase 2 §1): an OfferCard
    // tap sends confirmedAction:{type:'decompose_goal', title}. When present,
    // the user has already confirmed via the rail — the oracle skips ALL
    // detection and pins decompose_goal with the FROZEN title (frozen from
    // the user's words at offer time, so the goal can't drift). Computed here
    // so it is in scope for the tool loop and the trigger stack below.
    const confirmedDecompose =
      confirmedAction && confirmedAction.type === 'decompose_goal' &&
      typeof confirmedAction.title === 'string' && confirmedAction.title.trim()
        ? {
            title: confirmedAction.title.trim().slice(0, 80),
            category: typeof confirmedAction.category === 'string' ? confirmedAction.category : undefined,
            // IntakeCard fields (compressed intake form): frozen at confirm
            // time like the title, so the created dream matches the card.
            timeframe: typeof confirmedAction.timeframe === 'string' ? confirmedAction.timeframe.slice(0, 40) : undefined,
            description: typeof confirmedAction.description === 'string' ? confirmedAction.description.slice(0, 2000) : undefined,
          }
        : null;

    // ✅ Layer 3: Request validation - fail fast with clear error messages
    if (!message || typeof message !== 'string') {
      console.error('❌ INVALID REQUEST: Missing or invalid message field', { 
        messageType: typeof message,
        messageValue: message 
      });
      return new Response(
        JSON.stringify({ 
          error: 'Bad Request: message field is required and must be a string',
          received: { message: typeof message }
        }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!userId || typeof userId !== 'string') {
      console.error('❌ INVALID REQUEST: Missing or invalid userId field', { 
        userIdType: typeof userId,
        userIdValue: userId 
      });
      return new Response(
        JSON.stringify({ 
          error: 'Bad Request: userId field is required and must be a string',
          received: { userId: typeof userId }
        }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('✅ REQUEST VALIDATED:', { 
      messageLength: message.length, 
      userId: userId.substring(0, 8),
      threadId 
    });
    
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
    // On first contact there is no real user message — the "message" is a
    // synthetic handoff from onboarding. Running detectConversationState on
    // that misclassifies as "finished"/frustration/venting and poisons the
    // opening. Skip classification entirely on first contact.
    const conversationState = firstContact
      ? { detectionResult: null, note: 'first contact — classification skipped' }
      : detectConversationState(message, finalHistory);
    console.log('🎯 CONVERSATION STATE:', conversationState);

    // PERSISTENCE ADDON: Store state in database (SoulSync - non-blocking)
    if (conversationState.detectionResult) {
      persistConversationState(
        supabase,
        userId,
        sessionId,
        conversationState.detectionResult
      ).catch(err => console.error('⚠️ State persistence failed (non-blocking):', err));
    }

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
        attachments: [],
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

    // ────────────────────────────────────────────────────────────────
    // PHASE 1 (item 4): fetch the state spine once per turn (after the
    // closure gate so closure turns pay no DB cost). Injected into the
    // messages array below — same slot every turn.
    // ────────────────────────────────────────────────────────────────
    console.log('🧭 SPINE ENTRY: calling buildStructuredIntelligenceSpine', { userId: userId?.slice(0, 8) });
    const structuredSpine = await buildStructuredIntelligenceSpine(userId, supabase);
    console.log('🧭 SPINE EXIT:', { hasSpine: !!structuredSpine, len: structuredSpine?.length ?? 0 });

    // ────────────────────────────────────────────────────────────────
    // PHASE 1 (item 5): shadow-detector cue — synchronous, current turn
    // only, no DB reads. Arms Voice Charter rule 5; appended to the
    // system prompt below. Never surfaced in output.
    // ────────────────────────────────────────────────────────────────
    let shadowCue: { type: string; cue: string } | null = null;
    try {
      shadowCue = ConversationShadowDetector.detectFromMessage(message);
      if (shadowCue) console.log('🩶 SHADOW CUE:', shadowCue.type);
    } catch (e) {
      console.warn('⚠️ SHADOW CUE: detection failed (non-blocking):', e instanceof Error ? e.message : e);
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

        // SURGICAL FIX: Normalize chunk shape immediately after all retrieval paths
        if (semanticChunks.length > 0) {
          semanticChunks = semanticChunks.map(c => ({
            ...c,
            content: c.content ?? c.chunk_content ?? '',
            chunk_content: undefined
          }));
          console.log('🔧 NORMALIZED CHUNKS: All chunks now use .content key');
        }

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

            // STEP 4: Analyze message for facet-aware retrieval
            console.log('🔮 STEP 4A: Analyzing message for semantic facets and tags');

            const messageLower = message.toLowerCase();
            const facetFilters: string[] = [];
            const tagFilters: string[] = [];
          
          // Personality & identity queries
          if (/who am i|personality|character|nature|essence|identity/.test(messageLower)) {
            facetFilters.push('core_personality');
          }
          
          // Decision making & cognition
          if (/decide|choice|think|cognition|decision/.test(messageLower)) {
            facetFilters.push('decision_making');
          }
          
          // Relationships & social
          if (/relationship|connect|social|interact|love|partner/.test(messageLower)) {
            facetFilters.push('relationships');
          }
          
          // Shadow work & challenges
          if (/shadow|challenge|struggle|fear|overcome|growth|heal/.test(messageLower)) {
            facetFilters.push('shadow_work', 'gate_analysis');
            tagFilters.push('shadow', 'transformation');
          }
          
          // Hermetic & spiritual
          if (/hermetic|law|consciousness|spiritual|metaphys|principle/.test(messageLower)) {
            facetFilters.push('seven_laws', 'hermetic_fractal', 'consciousness_map');
            tagFilters.push('hermetic', 'consciousness');
          }
          
          // Life path & purpose
          if (/purpose|path|calling|mission|destiny|meaning/.test(messageLower)) {
            facetFilters.push('life_path');
            tagFilters.push('purpose');
          }
          
          // Human Design gates
          if (/gate|activation|channel|center/.test(messageLower)) {
            facetFilters.push('gate_analysis');
            tagFilters.push('human_design', 'gate');
          }
          
          // Practical implementation
          if (/how to|practice|implement|apply|action|step/.test(messageLower)) {
            facetFilters.push('activation_framework');
            tagFilters.push('practical', 'implementation');
          }
          
          // Timing & cycles
          if (/timing|when|cycle|transit|season/.test(messageLower)) {
            facetFilters.push('energy_timing');
            tagFilters.push('timing', 'cycles');
          }
          
          console.log('🎯 FACET ANALYSIS COMPLETE:', {
            facets: facetFilters.length > 0 ? facetFilters : ['none - using global search'],
            tags: tagFilters.length > 0 ? tagFilters : ['none'],
            messagePreview: message.substring(0, 50) + '...'
          });
          
          // STEP 4B: Perform facet-aware vector similarity search
          const matchCount = facetFilters.length > 0 ? 10 : 5; // More results when filtering
          console.log('🔮 STEP 4B: Starting facet-aware vector similarity search:', {
            queryEmbedding: {
              dimensions: messageEmbedding.length,
              firstValues: messageEmbedding.slice(0, 3),
              magnitude: Math.sqrt(messageEmbedding.reduce((sum, val) => sum + val * val, 0))
            },
            searchParams: {
              userId: userId.substring(0, 8) + '...',
              matchThreshold: 0.3,
              matchCount,
              facetFilter: facetFilters.length > 0 ? facetFilters : null,
              tagFilter: tagFilters.length > 0 ? tagFilters : null
            },
            functionName: 'match_blueprint_chunks_with_facets'
          });

          const searchStartTime = Date.now();
          const { data: matchingChunks, error: searchError } = await supabase.rpc(
            'match_blueprint_chunks_with_facets',
            {
              query_embedding: messageEmbedding,
              query_user_id: userId,
              facet_filter: facetFilters.length > 0 ? facetFilters : null,
              tag_filter: tagFilters.length > 0 ? tagFilters : null,
              match_threshold: 0.3,
              match_count: matchCount
            }
          );
          const searchDuration = Date.now() - searchStartTime;
          
          console.log('🔮 STEP 4B RESULT: Facet-aware vector search completed:', {
            processingTime: searchDuration + 'ms',
            chunksFound: matchingChunks?.length || 0,
            searchError: searchError?.message || null,
            rawResult: matchingChunks ? 'array' : 'null/undefined',
            facetsInResults: matchingChunks ? [...new Set(matchingChunks.map((c: any) => c.facet))] : [],
            avgSimilarity: matchingChunks?.length > 0 
              ? (matchingChunks.reduce((sum: number, c: any) => sum + (c.similarity || 0), 0) / matchingChunks.length).toFixed(3)
              : 'N/A',
            resultSample: matchingChunks?.slice(0, 2).map((c: any) => ({
              id: c.id,
              facet: c.facet,
              heading: c.heading,
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
              totalContentLength: semanticChunks.reduce((sum, c) => sum + (c.content?.length || 0), 0),
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
    let systemPrompt = '';
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
            const value = fact.value_json?.value ?? fact.value_json;
            const label = fact.value_json?.label ?? fact.key.replace(/_/g, ' ');
            return '  • **' + label + '**: ' + (typeof value === 'object' ? JSON.stringify(value) : String(value));
          }).join('\n');
          return '**' + facetTitle + '** (' + facetFacts.length + ' facts):\n' + factsList;
        }).join('\n\n');
      };

      const factsSection =
        structuredFacts.length > 0
          ? '\n\nCOMPREHENSIVE BLUEPRINT FOR ' +
            String(personalityContext.name || '').toUpperCase() +
            ' (' + structuredFacts.length + ' Facts Available):\n' +
            formatFactsByFacet(structuredFacts)
          : '';

      // Filter semantic chunks based on conversation relevance
      const isDiscussingEmotions = /\b(feel|feeling|emotion|fear|doubt|worry|anxiety|struggle|shadow|insecur|worth|reject)\b/i.test(message);
      const relevantChunks = (semanticChunks && semanticChunks.length > 0)
        ? semanticChunks.filter(ch => {
            const content = ch.content || '';
            const isShadowPattern = /\b(self-doubt|fear of rejection|need for validation|feeling unworthy|oscillat|pattern of)\b/i.test(content);
            // Include shadow patterns ONLY if user is discussing emotions
            return !isShadowPattern || isDiscussingEmotions;
          })
        : [];

      const narrativeSection = relevantChunks.length > 0
        ? '\n\nPERSONALITY INSIGHTS (Use ONLY if directly relevant to understanding their current message):\n' +
          relevantChunks.map(ch => ch.content || '').join('\n\n')
        : '';

      // FUSION: Generate intent-aware prompt based on sidecar results
      const generateHybridPrompt = async () => {
        const userName = personalityContext.name || 'friend';
        const mbtiType = personalityContext.mbti || 'Unknown';
        const hdType = personalityContext.hdType || 'Unknown';
        const sunSign = personalityContext.sunSign || 'Unknown';

        // Get intent from sidecar or default to MIXED
        let intent = sidecarResult?.intent || 'MIXED';

        // EXPANDED INTENT DETECTION (Principle #1: Additive enhancement)
        
        // Shadow exploration intent
        if (/\b(shadow|fear|doubt|insecur|pattern of|self-sabotag|why do i keep|stuck|repeat)\b/i.test(message.toLowerCase())) {
          console.log('🌑 SHADOW_EXPLORATION: User exploring shadow patterns');
          intent = 'SHADOW_EXPLORATION';
        }
        
        // Aligned action intent
        if (/\b(how (should|can|do) i (navigate|approach|handle|solve)|what.*aligned|blueprint.*achieve|blueprint.*overcome)\b/i.test(message.toLowerCase())) {
          console.log('🎯 ALIGNED_ACTION: User seeking aligned action strategy');
          intent = 'ALIGNED_ACTION';
        }

        // Blueprint Navigation Detection (PRIORITY)
        if (/\b(how (should|do|does|can) (i|my blueprint).*navigate|what (is|does) my blueprint (say|tell|guide)|blueprint.*how to|aligned.*path|what.*blueprint.*about|blueprint.*reach|blueprint.*happy|blueprint.*challenge)\b/i.test(message.toLowerCase())) {
          console.log('🧭 BLUEPRINT NAVIGATION: User asking for blueprint-specific guidance from Hermetic report');
          intent = 'BLUEPRINT_GUIDANCE';
        }

        // Fallback educational detection
        if (intent === 'MIXED' || intent === 'unknown') {
          const educationalKeywords = /\b(why (do i|am i|can't i|does|is it)|how come|what makes me|i keep|i don't understand)\b/i;
          if (educationalKeywords.test(message.toLowerCase())) {
            console.log('📖 EDUCATIONAL FALLBACK: Detected educational intent locally');
            intent = 'EDUCATIONAL';
          }
        }
        console.log('🎯 FINAL INTENT:', intent);
        
        // Calculate context budget based on intent (Principle #5: Intentional craft)
        const contextBudget = calculateContextBudget(intent);
        console.log('📊 Context budget for intent:', intent, contextBudget);

        // ALWAYS-ON HERMETIC + BEHAVIORAL LOADING (Principle #6: Unified intelligence)
        const hermeticContext = await getHermeticEducationalContext(userId, message, supabase, intent);
        const hermeticEducationalSections = hermeticContext.sections;
        console.log('🔮 Always-on Hermetic mode:', {
          intent,
          sectionsLoaded: Object.keys(hermeticEducationalSections).length,
          strategy: 'intent-as-lens'
        });
        
        // Fetch behavioral memory patterns (Principle #1: Additive enhancement)
        let behavioralContext = { memories: [], patterns: [] };
        try {
          behavioralContext = await getBehavioralMemoryContext(userId, message, supabase, contextBudget.behavioralMemories);
          console.log('✅ Behavioral memory context loaded:', {
            memoriesCount: behavioralContext.memories.length,
            patternsCount: behavioralContext.patterns.length
          });
        } catch (error) {
          console.error('⚠️ Behavioral memory fetch failed, continuing without:', error);
          // Principle #1: Additive only - failure doesn't break Hermetic context
        }

        // Voice & depth
        const voiceStyle = generateVoiceStyle(mbtiType, hdType, sunSign);
        const humorStyle = generateHumorStyle(mbtiType, sunSign);
        const communicationDepth = generateCommunicationDepth(intelligenceLevel, mbtiType);

        // Technical details preference
        const wantsTechnicalDetails = detectTechnicalDetailRequest(message);

        // Hermetic identity primer with behavioral patterns (Principle #1: Additive enhancement)
        const hermeticPrimer = buildHermeticIdentityPrimer(
          hermeticEducationalSections, 
          userName,
          behavioralContext.patterns
        );

        // Phase guidance & opening rule (defensive)
        const phaseGuidance =
          ConversationPhaseTracker.getPhaseGuidance(conversationState?.detectionResult?.cluster || 'exploration');
        const openingRule =
          conversationState?.detectionResult?.openingRule || 'Respond thoughtfully based on context.';

        const roleBlock = getRoleForIntent(intent, userName, hermeticEducationalSections);

        // Truth guard: if no behavioral memory exists, strip BEHAVIORAL EVIDENCE/VALIDATION
        // steps from the role template so the model can't fabricate memory references.
        const hasNoMemory =
          (behavioralContext.patterns?.length ?? 0) === 0 &&
          (behavioralContext.memories?.length ?? 0) === 0;
        let effectiveRoleBlock = roleBlock;
        if (hasNoMemory) {
          const lines = roleBlock.split('\n').filter(l =>
            !/^\s*\d+\.\s*BEHAVIORAL (EVIDENCE|VALIDATION)/i.test(l)
          );
          // Renumber ordered steps sequentially
          let n = 0;
          let inStructure = false;
          const renumbered = lines.map(l => {
            const m = l.match(/^(\s*)(\d+)\.\s+(.*)$/);
            if (m) {
              n += 1;
              inStructure = true;
              return `${m[1]}${n}. ${m[3]}`;
            }
            if (inStructure && l.trim() === '') {
              // Reset numbering when leaving the structure block
              n = 0;
              inStructure = false;
            }
            return l;
          });
          effectiveRoleBlock = renumbered.join('\n');
        }

        // Profile block
        const profileLines = [
          userName + "'S CURRENT PROFILE (Technical Details):",
          '- Name: ' + userName,
          '- Natural thinking style: ' + getThinkingStyleDescription(mbtiType) + (wantsTechnicalDetails ? ' (MBTI: ' + mbtiType + ')' : ''),
          '- Energy approach: ' + getEnergyDescription(hdType) + (wantsTechnicalDetails ? ' (Human Design: ' + hdType + ')' : ''),
          '- Archetypal influence: ' + getArchetypalDescription(sunSign) + (wantsTechnicalDetails ? ' (Sun Sign: ' + sunSign + ')' : ''),
          '- Intelligence Level: ' + intelligenceLevel + '/100'
        ];

        // Universal rules
        const universalRules = [
          "🎯 CRITICAL COMPREHENSION RULES:",
          "- Before responding, verify you understood what they ACTUALLY said",
          "- If their message contains irony, contradiction, or paradox, address it explicitly",
          "- DO NOT use flowery metaphors or abstract language to hide that you don't understand",
          "- Address what they mean, not what personality patterns predict they might mean",
          "",
          "🎨 METAPHOR GROUNDING RULE:",
          "- If you use a metaphor, image, or poetic language, immediately follow it with the concrete practical meaning",
          "- Format: '[Metaphor]' → 'In practical terms, this means [concrete action/reality]'",
          "- Example: 'You're a rare constellation' → 'In practical terms, your unique combination of traits makes you valuable but also harder to fit into conventional roles'",
          "- NEVER leave metaphors unexplained—not everyone processes abstract language the same way",
          "",
          "CONVERSATION FLOW:",
          "- DO NOT repeat or paraphrase the user's question back to them - jump directly into your response",
          '- If this is a continuing conversation, NO greetings, NO welcomes, NO reintroductions',
          "- Respond directly and naturally to what they asked - don't echo their words",
          "- Use " + userName + "'s name naturally when it feels warm and personal—avoid overusing it, but don't be afraid to use it to make responses feel more connected",
          '- Keep language warm, accessible, and conversational',
          '- When you have specific facts, state them confidently and precisely',
          '- Provide insights that feel personally relevant',
          '- If they seem resistant, provide deeper insights from their blueprint that address the underlying pattern',
          "- Never explain how you know things about them - you simply understand them well"
        ].join('\n');

        const responseGuidelines = [
          '1. Lead with recognition of their unique situation/question',
          '2. For factual queries: Provide precise data first, then brief context',
          '3. For interpretive queries: Focus on insights and guidance',
          '4. For mixed queries: Balance facts with meaningful interpretation',
          '5. CONVERSATION FLOW INTELLIGENCE: ' + getConversationFlowGuidance(conversationState),
          '6. ENDING: State your final insight clearly. You may close with ONE short hypothesis-check inviting confirmation or pushback ("Am I close?") - never a deflecting exploration question, and never a ritual sign-off (the two legacy closers are banned; see VOICE CHARTER). Vary how you end; sometimes just stop after the insight.'
        ].join('\n');

        // Final prompt pieces
        const blocks = [
          hermeticPrimer,
          phaseGuidance,
          'CRITICAL OPENING INSTRUCTION:\n' + openingRule,
          'YOUR ROLE IN THIS CONVERSATION:\n' + effectiveRoleBlock,
          profileLines.join('\n') + factsSection + narrativeSection,
          'COMMUNICATION GUIDELINES:\n' + [voiceStyle, humorStyle, communicationDepth].filter(Boolean).join('\n'),
          'UNIVERSAL RULES:\n' + universalRules,
          'RESPONSE GUIDELINES:\n' + responseGuidelines,
          // Founder testing (Jul 2026): responses ran long (fatigue, skimming)
          // and neutral messages were relabelled as "frustration". This block
          // overrides the multi-part structures above on both counts.
          'RESPONSE DISCIPLINE (overrides any longer structure above):\n' + [
            '- BREVITY: lean short — a few sentences usually lands better than a long structured answer, unless they ask you to go deeper. A wall of text tends to get skimmed; one clear insight often lands harder than four stacked ones.',
            '- Prefer ONE idea per turn over running the full acknowledge→mechanism→evidence→action structure every time. Let the conversation breathe.',
            "- MIRROR THEIR REGISTER: lean toward reflecting the state they actually expressed. When a message reads as neutral or even (e.g. \"het gaat zijn gangetje\" / \"it's just ticking along\"), it's usually better to meet it as neutral than to read frustration, stuckness, or struggle into it — unless something specific in their words points there.",
            '- When you are unsure of their state, a light check tends to serve better than asserting a feeling ("sounds fairly even today — or am I missing something?").',
          ].join('\n'),
          "Remember: You're " + userName + "'s perceptive AI companion who has access to their detailed blueprint and can provide both specific facts and meaningful guidance through conversation."
        ];

        let assembled = blocks.filter(Boolean).join('\n\n');
        if (hasNoMemory) {
          assembled += '\n\nMEMORY TRUTH GUARD: This user has NO conversation memory yet. NEVER claim to see patterns "in your memory" or reference past behavior — you have only their chart. Speaking from the chart is enough.';
        }
        return assembled;
      };

      systemPrompt = await generateHybridPrompt();
    } else {
      // Standard HACS prompt for non-oracle mode
      systemPrompt =
        'You are HACS (Holistic Autonomous Consciousness System), an AI companion designed to provide thoughtful, personalized guidance.\n\n' +
        "You have access to the user's personality blueprint and should provide responses that feel natural and supportive, adapting to their communication style and needs.\n\n" +
        (personalityContext
          ? ('User Context: ' + personalityContext.name + ' (' + personalityContext.mbti + ', ' + personalityContext.hdType + ', ' + personalityContext.sunSign + ')')
          : 'Building understanding of user through conversation...') +
        '\n\nRespond helpfully while building rapport and understanding.';
    }

    // ------------------------------------------------------------------
    // QUESTION RATION: if the last 3 assistant messages ended with "?",
    // force this reply to end with a statement.
    // ------------------------------------------------------------------
    {
      const last3Assistant = (finalHistory || [])
        .filter((m: any) => m.role === 'assistant')
        .slice(-3);
      const endsInQ = last3Assistant.filter((m: any) =>
        typeof m.content === 'string' && m.content.trim().endsWith('?')
      ).length;
      if (endsInQ >= 2) {
        systemPrompt += '\n\nQUESTION RATION: Your recent replies all ended in questions. End this one with a statement.';
      }
    }

    // ------------------------------------------------------------------
    // FIRST CONTACT: the companion speaks first — seconds after the
    // blueprint reveal. One real chart fact, slightly confronting,
    // ending on a check-in question. (Set by the onboarding handoff.)
    // ------------------------------------------------------------------
    if (firstContact) {
      systemPrompt += '\n\nFIRST CONTACT DIRECTIVE (governs this one reply):\n' +
        'This is the very first thing this person will ever hear from you, moments after seeing their blueprint reveal. There is no real user message to answer.\n' +
        '- Open the conversation yourself. Never say "welcome", never explain features or what you can do, never ask "how can I help".\n' +
        '- From the blueprint context above, pick the ONE fact that carries the most tension (authority, profile, or a shadow-adjacent pattern) and make a single specific, slightly confronting observation about how it probably shows up in their daily life.\n' +
        '- Confronting means precise and caring — the feeling of being seen, never judged. No flattery.\n' +
        '- End with one short question inviting them to confirm or push back (for example: "Am I close?"). You are checking a hypothesis, not declaring a truth.\n' +
        '- HARD LIMIT: 2 to 4 sentences total. No lists, no headers, no emojis, no name-dropping of frameworks or system terms.';
    }

    // ------------------------------------------------------------------
    // VOICE CHARTER — governs every reply, all modes. This block wins over
    // any conflicting instruction above it. Tune the voice HERE, once.
    // ------------------------------------------------------------------
    systemPrompt += '\n\nVOICE CHARTER (final authority on how you speak — overrides any conflicting rule above):\n' +
      '1. LANGUAGE: reply in the language of the user\'s MOST RECENT message. If they switch to Dutch, you switch fully to Dutch and stay there until they switch back. Never drift mid-topic.\n' +
      '2. LENGTH: default to SHORT. One idea, landed well, beats four ideas explained. Most replies: 2-5 sentences. Go long only when the user asks for depth or the moment truly demands it. You are a conversation, not an essay service.\n' +
      '3. VARY YOUR SHAPE: never open consecutive replies the same way. Do not start replies with the user\'s name more than occasionally. No fixed closing lines, ever — ritual sign-offs are template tells that kill intimacy.\n' +
      '4. ONE QUESTION MAX: at most one question per reply, and only when it earns its place. A hypothesis-check after an insight ("Am I close?") is the EXCEPTION, not the rule — rationed to one reply in three. A deflecting question instead of an insight is not.\n' +
      '5. CONFRONT WHEN THE DOOR OPENS: when the user discloses something loaded (status, shame, fear, money, a relationship, "out of necessity"), do NOT smooth past it into advice. Stop. Name it. Ask about it. The disclosure IS the conversation.\n' +
      '6. THE CHART INFORMS, IT DOES NOT NARRATE: never explain every feeling by the blueprint ("you feel X because Taurus Moon"). Use chart mechanics for the occasional precise strike — rationed to at most ONCE per session — not as a running commentary. The user is the author of their life; you hold a map, not a script.\n' +
      '7. NO IDENTITY FLATTERY: do not cast the user as a blocked visionary whose environment is unworthy of them. Being seen precisely lands deeper than being praised. When their pattern is costing them something, say so plainly and kindly.\n' +
      '8. HONESTY OVER COMFORT: you would rather be corrected than be agreeable. State your read confidently, hold it loosely, and make pushing back feel easy and welcome.';

    // ------------------------------------------------------------------
    // ACTION CHARTER — governs when you USE YOUR HANDS (tools). Sibling of
    // the Voice Charter: Voice rules how you speak, this rules when you act.
    // Tune the tool reflex HERE, once.
    // ------------------------------------------------------------------
    systemPrompt += '\n\nACTION CHARTER (final authority on when you act — you have hands, use them):\n' +
      '1. YOU HAVE HANDS: get_active_dream is yours to call within this very turn (decompose_goal fires only on a confirmed tap — never on your own initiative). NEVER describe, promise, or narrate what a tool would produce instead of calling it.\n' +
      '2. CONFIRMED = CALL NOW: once the user has confirmed they want a goal broken down and you know the what plus a rough timeframe, you MUST call decompose_goal in THIS turn. Deferring a confirmed decomposition to a future turn is a violation. Do not reframe, translate, or abstract the user\'s stated goal — copy their words.\n' +
      '3. CONSULT BEFORE COUNSEL: before advising on goals, progress, or "what\'s next", call get_active_dream so your counsel is grounded in what actually exists — never advise on a dream from memory alone.\n' +
      '4. THE WORKSPACE BUILDS PROGRAMS, NOT YOU (v2.5): you never deal offer cards and never offer decomposition in prose. When the user states a concrete goal, respond to its substance; at most, mention ONCE and in passing that they can select that sentence to open their program builder in the workspace. If they let it pass, drop it — no nagging, no re-offers.\n' +
      '5. TOOLS ACCOMPANY INSIGHT, NEVER REPLACE IT: your text must still carry the observation, the confrontation, or the read. The card only holds structure. A tool call wrapped in a hollow message is a violation.';
    // ending (goodbye, thanks, heading to sleep, wrapping up), do not just
    // say goodbye. Close warmly AND plant exactly one open loop: name one
    // specific, real area of their chart or an unfinished thread from this
    // conversation that has NOT yet been explored, and invite them to ask
    // about it next time. The loop must be genuinely grounded in their
    // actual blueprint context or conversation — never invented, never a
    // generic teaser.
    systemPrompt += '\n\nSESSION CLOSE RULE: if the user signals they are wrapping up (goodbye, thanks, gtg, going to bed), close warmly and leave exactly ONE open loop — a specific, real, unexplored area of their chart or an unfinished thread from this conversation — phrased as something to ask you about next time (for example: "Before you go — there is something in your chart about how you handle endings. Ask me about it tomorrow."). Ground it in real context; never fabricate a teaser. At most one loop per session close.';

    // PHASE 1 (item 5): one-line shadow cue arms Voice Charter rule 5.
    if (shadowCue) {
      systemPrompt += '\n\nSHADOW CUE (do not name it, respond to it): ' + shadowCue.cue;
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

    // PHASE 1 (item 4): state spine — same slot every turn (right after the
    // main system prompt, before conversation history) for cache stability.
    if (structuredSpine) {
      messages.push({ role: 'system', content: structuredSpine });
    }

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
      max_completion_tokens: maxTokens
    };

    console.log('🔮 PREPARED MESSAGES:', {
      messageCount: messagesToSend.length,
      systemPromptLength: messagesToSend[0].content.length,
      lastUserMessage: message.substring(0, 100) + '...',
      closureMode: isClosure
    });

    // ENHANCED DIAGNOSTICS: Full conversation state analysis
    console.log('📊 ENHANCED CONVERSATION DIAGNOSTICS:', {
      cluster: conversationState?.detectionResult?.cluster || 'unknown',
      subState: conversationState?.detectionResult?.subState || 'unknown',
      confidence: conversationState?.detectionResult?.confidence || 0,
      signalBreakdown: {
        paralinguistic: conversationState?.detectionResult?.signals?.filter(s => s.type === 'paralinguistic').length || 0,
        sentenceForm: conversationState?.detectionResult?.signals?.filter(s => s.type === 'sentence_form').length || 0,
        discourseMarker: conversationState?.detectionResult?.signals?.filter(s => s.type === 'discourse_marker').length || 0,
        clusterPattern: conversationState?.detectionResult?.signals?.filter(s => s.type === 'cluster_pattern').length || 0
      },
      topSignals: conversationState?.detectionResult?.signals
        ?.sort((a, b) => b.weight - a.weight)
        .slice(0, 3)
        .map(s => ({ type: s.type, id: s.id, weight: s.weight })) || [],
      openingRule: conversationState?.detectionResult?.openingRule || 'default',
      allowedNext: conversationState?.detectionResult?.allowedNextClusters || [],
      turnCount: Math.floor((finalHistory?.length || 0 + 1) / 2)
    });

    // ANTI-REPETITION SENTINEL: Cluster-specific repetition detection
    if (finalHistory && finalHistory.length >= 2 && conversationState?.detectionResult?.cluster !== 'engagement') {
      const lastAssistantMessage = finalHistory
        .slice()
        .reverse()
        .find(msg => msg.role === 'assistant')?.content || '';
      
      const lastOpening = lastAssistantMessage.substring(0, 150).toLowerCase();
      
      // Cluster-specific repetitive patterns
      const repetitivePatterns: Record<string, string[]> = {
        validation: ['that feeling', 'i hear that', 'it sounds like', 'the weight of'],
        clarification: ['to understand', 'let me break', 'essentially', 'in other words'],
        decision: ['so the path', 'here\'s what', 'the next step'],
        reflection: ['what you\'ve discovered', 'the key insight', 'looking back']
      };
      
      const currentCluster = conversationState?.detectionResult?.cluster;
      const patternsToCheck = currentCluster ? (repetitivePatterns[currentCluster] || []) : [];
      
      const hasRepetitiveOpening = patternsToCheck.some(pattern => 
        lastOpening.includes(pattern)
      );
      
      if (hasRepetitiveOpening) {
        console.log('🚨 REPETITION SENTINEL: Detected cluster-specific repetition', {
          cluster: currentCluster,
          pattern: patternsToCheck.find(p => lastOpening.includes(p))
        });
        
        const openingRule = conversationState?.detectionResult?.openingRule || 'Vary your opening language.';
        const warningPrefix = '⚠️ CRITICAL: You just used similar opening language. ' + openingRule + '\n\n';
        messagesToSend[0].content = warningPrefix + messagesToSend[0].content;
      }
    }

    // OPENAI API CALL: Send messages to GPT model via Azure helper
    const { callChatCompletion: callChat } = await import('../_shared/azure-openai.ts');

    // ────────────────────────────────────────────────────────────────
    // PHASE 2 (item 2): SEMANTIC INTENT LAYER — classifyIntent() on
    // gpt-4.1-nano is the PRIMARY trigger input; the regex stack below
    // is demoted to FALLBACK (used only when the classifier fails or
    // times out). Strict JSON {intent, goal_verbatim, timeframe}; 1s
    // timeout; fail-soft. Structural fix for ACS misfires ("yes, close,
    // how do i fix it" read as frustration — seen in production Jul 15).
    // ────────────────────────────────────────────────────────────────
    async function classifyIntent(
      userMessage: string,
      history: any[]
    ): Promise<{ intent: string; goal_verbatim: string | null; timeframe: string | null } | null> {
      const t0 = Date.now();
      try {
        const context = (history || [])
          .filter((m: any) => typeof m?.content === 'string')
          .slice(-4)
          .map((m: any) => `${m.role === 'user' ? 'USER' : 'TWIN'}: ${String(m.content).slice(0, 200)}`)
          .join('\n');
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 1000);
        const resp = await callChat({
          model: 'gpt-4.1-nano',
          temperature: 0,
          max_tokens: 120,
          stream: false,
          signal: controller.signal,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'You classify ONE user message from a coaching conversation. Output STRICT JSON: {"intent":"stated_goal"|"plan_request"|"confirm"|"decline"|"other","goal_verbatim":string|null,"timeframe":string|null}.\n' +
                'intent definitions:\n' +
                '- stated_goal: THIS message states a concrete personal goal or dream (money, health, career, habit, project).\n' +
                '- plan_request: asks for a plan, steps, breakdown, roadmap, or how to start/approach something.\n' +
                '- confirm: agrees to a breakdown/plan OFFER visible in the context (yes/ok/do it/graag — extra words allowed, but the agreement must be about the offer; agreeing with an observation is "other").\n' +
                '- decline: turns such an offer down or deflects it (not now, later, no).\n' +
                '- other: everything else (greetings, reflections, questions, venting).\n' +
                'goal_verbatim: the goal EXACTLY as the user worded it, copied verbatim from user text in this message or the context; null if none. NEVER paraphrase or translate.\n' +
                'timeframe: verbatim timeframe if stated ("3 years", "6 maanden"); else null.\n' +
                'Messages may be Dutch or English.'
            },
            {
              role: 'user',
              content: `CONTEXT (recent turns):\n${context || '(none)'}\n\nMESSAGE TO CLASSIFY:\n${String(userMessage).slice(0, 400)}`
            }
          ],
        });
        clearTimeout(timer);
        if (!resp.ok) {
          console.warn('🧭 INTENT: classifier HTTP error → regex fallback', { status: resp.status, ms: Date.now() - t0 });
          return null;
        }
        const data = await resp.json();
        const raw = data?.choices?.[0]?.message?.content;
        const parsed = JSON.parse(typeof raw === 'string' ? raw : '{}');
        const VALID = ['stated_goal', 'plan_request', 'confirm', 'decline', 'other'];
        if (!VALID.includes(parsed?.intent)) {
          console.warn('🧭 INTENT: invalid intent → regex fallback', { got: parsed?.intent, ms: Date.now() - t0 });
          return null;
        }
        const out = {
          intent: parsed.intent as string,
          goal_verbatim: typeof parsed.goal_verbatim === 'string' && parsed.goal_verbatim.trim()
            ? parsed.goal_verbatim.trim().slice(0, 120) : null,
          timeframe: typeof parsed.timeframe === 'string' && parsed.timeframe.trim()
            ? parsed.timeframe.trim().slice(0, 40) : null,
        };
        console.log('🧭 INTENT:', { ...out, ms: Date.now() - t0 });
        return out;
      } catch (e) {
        console.warn('🧭 INTENT: classifier failed/timeout → regex fallback', {
          ms: Date.now() - t0,
          err: e instanceof Error ? e.message : String(e)
        });
        return null;
      }
    }

    console.log('🔮 CALLING AI API:', {
      model: completionParams.model,
      messageCount: messagesToSend.length,
      maxTokens: completionParams.max_completion_tokens,
      oracleStatus,
      hasOracleContext: structuredFacts.length > 0 || semanticChunks.length > 0
    });

    // Call AI for response generation using current model
    // ------------------------------------------------------------------
    // ONE-SURFACE TOOLS: bounded tool loop (max 2 rounds). The twin can
    // fetch the active dream or decompose a goal; results return as card
    // attachments alongside its text. Fails soft to plain conversation.
    // ------------------------------------------------------------------
    const companionTools = [
      {
        type: 'function',
        function: {
          name: 'get_active_dream',
          description: 'Fetch the user\'s current active dream/goal with its milestones and progress. Use when the conversation turns to their goals, progress, or "what\'s next".',
          parameters: { type: 'object', properties: {}, required: [] }
        }
      },
      {
        type: 'function',
        function: {
          name: 'decompose_goal',
          description: 'Decompose a stated goal/dream into 4-6 milestones. Use ONLY after the user confirmed they want it broken down and you know the what and rough timeframe. Your text must still carry the insight; the card only holds structure.',
          parameters: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Short goal title using the USER\'S OWN stated goal verbatim (e.g. "Earn €1,000,000") — never your reframe or interpretation of what the goal is really about.' },
              description: { type: 'string', description: 'One-line description — MUST include the timeframe in-line (e.g. "Build wealth to 1M in 5 years") since the timeframe field is only used to compute a target date.' },
              timeframe: { type: 'string', description: 'e.g. "3 years", "6 months", "3 jaar". Used to derive target_date only.' },
              category: { type: 'string', description: 'e.g. financial, creative, health' }
            },
            required: ['title', 'description']
          }
        }
      }
    ];

    const cardAttachments: any[] = [];

    // GOAL-TITLE FIDELITY (Phase 1 item 2, Phase 2 §1 eligibility rules):
    // scan recent USER-AUTHORED turns for the stated goal phrase; if a
    // model-produced title drifted (<60% token overlap), repair it to the
    // user's words. Eligibility rules (ground truth #6: guards without
    // eligibility rules copy the wrong thing):
    //  - machine-spoken rail messages ("Yes — break down …", "Let's work
    //    on:") are EXCLUDED from the candidate pool — button copy must
    //    never become a title;
    //  - rail-confirmed titles never pass through here at all (frozen at
    //    offer time; see decompose_goal handler).
    const RAIL_MESSAGE_PREFIXES = ["Yes — break down", "Let's work on:"];
    // Set by the semantic intent layer (below) before the tool loop runs;
    // the classifier's contract is a VERBATIM copy of the user's words, so
    // it is a legitimate fidelity candidate.
    let semanticGoalVerbatim: string | null = null;
    function repairTitleToUserWords(titleIn: string, label: string): string {
      try {
        const recentUserTexts = (finalHistory || [])
          .filter((m: any) => m.role === 'user' && typeof m.content === 'string')
          .slice(-6)
          .map((m: any) => m.content as string)
          .concat([typeof message === 'string' ? message : ''])
          .filter((t: string) => !RAIL_MESSAGE_PREFIXES.some(p => t.trimStart().startsWith(p)));
        const goalPhraseRegex = /(?:"([^"]{4,80})")|((?:[^.!?\n]{0,40})(?:(?:€|\$|£)\s?[\d.,]+\s?\w*|\b\d[\d.,]*\s?(?:k|m|mln|mil{1,2}[ij]?oe?n)\b|\b(?:earn|make|reach|save|quit|launch|build|start|become|lose|run|verdien(?:en)?|bereik(?:en)?|sparen|stoppen|beginnen|worden)\b[^.!?\n]{0,50}))/gi;
        const candidates: string[] = [];
        for (const text of recentUserTexts) {
          let match: RegExpExecArray | null;
          goalPhraseRegex.lastIndex = 0;
          while ((match = goalPhraseRegex.exec(text)) !== null) {
            const phrase = (match[1] || match[2] || '').trim();
            if (phrase.length >= 4) candidates.push(phrase);
          }
        }
        if (semanticGoalVerbatim && semanticGoalVerbatim.length >= 4) candidates.push(semanticGoalVerbatim);
        if (candidates.length === 0 || !titleIn) return titleIn;
        const tokenize = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}€$£]+/gu, ' ').split(/\s+/).filter(w => w.length > 1);
        const titleTokens = tokenize(titleIn);
        const overlapWith = (phrase: string) => {
          const phraseTokens = new Set(tokenize(phrase));
          if (titleTokens.length === 0) return 0;
          return titleTokens.filter(t => phraseTokens.has(t)).length / titleTokens.length;
        };
        const bestCandidate = candidates.sort((a, b) => b.length - a.length)[0];
        const bestOverlap = Math.max(...candidates.map(overlapWith));
        if (bestOverlap < 0.6) {
          const repaired = bestCandidate.replace(/\s+/g, ' ').trim().slice(0, 80);
          console.log(`⚠️ goal-title repaired (${label}): "${titleIn}" → "${repaired}"`, { overlap: bestOverlap.toFixed(2) });
          return repaired.charAt(0).toUpperCase() + repaired.slice(1);
        }
        return titleIn;
      } catch (guardErr) {
        console.warn('⚠️ goal-title guard failed (non-blocking):', guardErr instanceof Error ? guardErr.message : guardErr);
        return titleIn;
      }
    }

    async function runCompanionTool(name: string, args: any): Promise<string> {
      console.log(`🛠️ TOOL LOOP: calling ${name}`, { args: JSON.stringify(args).slice(0, 300) });
      const result = await _runCompanionToolInner(name, args);
      console.log(`🛠️ TOOL LOOP: ${name} returned`, { preview: String(result).slice(0, 300) });
      return result;
    }

    async function _runCompanionToolInner(name: string, args: any): Promise<string> {
      try {
        if (name === 'get_active_dream') {
          // status filter matches every Dreams-page query (use-goals.ts):
          // delete is a soft delete (status='inactive') — a deleted dream
          // must never be served as "the active dream".
          const { data: goals } = await supabase
            .from('user_goals')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1);
          const g = goals?.[0];
          if (!g) {
            return JSON.stringify({
              found: false,
              note: 'No active dream yet.',
              instruction: 'The user has no active program. Do NOT offer decomposition (in prose or otherwise) and do NOT call decompose_goal. If they have stated a concrete goal, respond to its substance and mention once, in passing, that selecting that sentence opens their program builder in the workspace. If no concrete goal is stated, ask ONE short question to surface it. Never narrate what decomposition would look like.',
              user_stated_goal_hint: (semanticGoalVerbatim || (typeof message === 'string' ? message : '')).slice(0, 200),
            });
          }
          cardAttachments.push({ type: 'dream_card', goal_id: g.id });
          return JSON.stringify({ found: true, title: g.title, description: g.description, progress: g.progress, milestones: (g.milestones || []).slice(0, 6) });
        }
        if (name === 'decompose_goal') {
          const _titleIn = typeof args.title === 'string' ? args.title : '';
          if (confirmedDecompose) {
            // DETERMINISTIC FREEZE (Phase 2 §1): the user reached here by
            // tapping an OfferCard — the confirmed title is authoritative,
            // frozen from their own words at offer time. The fidelity guard
            // MUST NOT run on this turn: the tap message in history is
            // machine-spoken button copy, and the guard would "repair" the
            // frozen title into the button string (seen in production,
            // Jul 15). Eligibility rule, not similarity threshold.
            args.title = confirmedDecompose.title;
            if (confirmedDecompose.category && !args.category) args.category = confirmedDecompose.category;
            // IntakeCard fields ride the same freeze: what the card showed
            // is what the dream gets.
            if (confirmedDecompose.timeframe && !args.timeframe) args.timeframe = confirmedDecompose.timeframe;
            if (confirmedDecompose.description && !args.description) args.description = confirmedDecompose.description;
            console.log('🃏 FROZEN TITLE: fidelity guard skipped (confirmedAction)', { title: args.title });
          } else if (typeof args.title === 'string') {
            // PHASE 1 (item 2): GOAL-TITLE FIDELITY GUARD — detection-path
            // turns only. The card must carry the user's words, never the
            // model's reframe; drifted titles (<60% overlap) get repaired.
            args.title = repairTitleToUserWords(args.title, 'decompose');
          }
          console.log('🎯 PINNED DECOMPOSE: title journey', {
            in: _titleIn,
            out: typeof args.title === 'string' ? args.title : '',
            repaired: _titleIn !== args.title,
          });

          const { data: dec, error: decErr } = await supabase.functions.invoke('openai-agent', {
            body: { action: 'decompose_goal', ...args, userId }
          }).catch(() => ({ data: null, error: 'invoke failed' } as any));

          // PHASE 1 (item 1): HARD FAIL-PATH — a DreamCard with hollow
          // milestones is worse than no card. If decomposition came back
          // thin, do NOT insert a goal row; let the model narrate a retry.
          const milestones = dec?.milestones || [];
          if (milestones.length < 3) {
            console.warn('⚠️ DECOMPOSE: decomposition failed or too thin — no card created', {
              milestoneCount: milestones.length,
              invokeError: decErr || dec?.error || null
            });
            return JSON.stringify({
              ok: false,
              reason: 'decomposition_failed',
              note: 'The breakdown did not come through. Tell the user plainly it hiccuped and offer to retry — do not present or promise a card.'
            });
          }

          // Map args.timeframe → target_date (real column). Tolerant of English + Dutch units.
          const targetDate = (() => {
            const raw = String(args.timeframe || '').trim();
            if (!raw) return null;
            const m = /(?:in|within|binnen)?\s*(\d+(?:[.,]\d+)?)\s*(day|dag|dagen|week|weken|month|months|maand|maanden|year|years|jaar|jaren)/i.exec(raw);
            if (!m) return null;
            const n = parseFloat(m[1].replace(',', '.'));
            if (!isFinite(n) || n <= 0) return null;
            const unit = m[2].toLowerCase();
            const d = new Date();
            if (unit.startsWith('day') || unit.startsWith('dag')) d.setDate(d.getDate() + Math.round(n));
            else if (unit.startsWith('week') || unit.startsWith('weke')) d.setDate(d.getDate() + Math.round(n * 7));
            else if (unit.startsWith('month') || unit.startsWith('maand')) d.setMonth(d.getMonth() + Math.round(n));
            else if (unit.startsWith('year') || unit.startsWith('jaar') || unit.startsWith('jare')) d.setFullYear(d.getFullYear() + Math.round(n));
            else return null;
            return d.toISOString().slice(0, 10);
          })();
          const { data: inserted, error: insErr } = await supabase
            .from('user_goals')
            .insert({
              user_id: userId,
              title: args.title,
              description: args.description,
              category: args.category || 'personal',
              target_date: targetDate,
              milestones,
              progress: 0,
            })
            .select('id')
            .single();
          if (insErr) return JSON.stringify({ ok: false, error: insErr.message });
          cardAttachments.push({ type: 'dream_card', goal_id: inserted.id });
          return JSON.stringify({ ok: true, goal_id: inserted.id, milestoneCount: milestones.length, milestones: milestones.slice(0, 6) });
        }
        return JSON.stringify({ error: 'unknown tool' });
      } catch (e) {
        return JSON.stringify({ error: String(e) });
      }
    }

    // ────────────────────────────────────────────────────────────────
    // PHASE 1 (item 3): ACS CONFIRMATION → FORCE THE HANDS.
    // Ground-truth note: the ACS taxonomy has no 'confirmation' cluster —
    // confirmation lives in decision/commitment_signal, and a bare "yes"
    // matches no ACS signal at all. So: ACS commitment signal OR a short
    // affirmative message, gated by a decompose-eligible goal in the last
    // 4 user turns (a "yes" to a non-goal question must not misfire).
    // First call only; the loop's own tool_choice logic is untouched.
    // ────────────────────────────────────────────────────────────────
    const acsDetection = conversationState?.detectionResult;
    const acsConfirmation = acsDetection?.cluster === 'decision' && acsDetection?.subState === 'commitment_signal';
    // ────────────────────────────────────────────────────────────────
    // MILESTONE TAP DETECTION: DreamCard emits `Let's work on: <title>`
    // when the user taps a milestone. That is a coaching request against
    // an existing dream, NOT a new goal — never let it trigger
    // decompose_goal (which spawns a duplicate user_goals row titled
    // after the milestone). Suppress all force-triggers and pin the
    // consult to get_active_dream so the model reads the existing dream
    // and coaches into the milestone.
    // ────────────────────────────────────────────────────────────────
    const MILESTONE_TAP_PREFIX = "Let's work on:";
    // confirmedAction wins over every detected signal — skip all detection.
    const isMilestoneTap = !confirmedDecompose && typeof message === 'string'
      && message.trimStart().startsWith(MILESTONE_TAP_PREFIX);
    // ────────────────────────────────────────────────────────────────
    // PHASE 2 (item 2): SEMANTIC INTENT — primary trigger input. Rails
    // before intelligence: rail turns (confirmedAction, milestone tap)
    // and synthetic first contact skip classification entirely. On
    // classifier failure/timeout the regex stack below takes over.
    // ────────────────────────────────────────────────────────────────
    let semanticIntent: { intent: string; goal_verbatim: string | null; timeframe: string | null } | null = null;
    if (!confirmedDecompose && !isMilestoneTap && !firstContact) {
      semanticIntent = await classifyIntent(message, finalHistory || []);
      if (semanticIntent?.goal_verbatim) semanticGoalVerbatim = semanticIntent.goal_verbatim;
    }
    // REGEX FALLBACK STACK (Phase 1) — consulted only when the semantic
    // classifier failed; still computed every turn for drift telemetry.
    // Repeated-token form so multi-word affirmatives ("yes go for it", "ja doe maar") match.
    const shortAffirmative = /^\s*((yes|yeah|yep|yup|sure|ok(ay)?|do it|go for it|please do|break it down|absolutely|definitely|ja|graag|zeker|prima|doe (het|maar)|let'?s (go|do it))[\s,!.]*)+$/i.test(message);
    const planRequest = /\b(plan|planning|actie(plan)?|stappen|steps?|roadmap|breakdown|break\s+(it|this|that)\s+down|decompose|help\s+me\s+(improve|do|plan|start|begin|verbeteren)|need\s+(a\s+)?plan|geef.*plan|maak.*plan|hoe\s+(begin|start)\s+ik)\b/i.test(message);
    const goalNounRegex = /(€|\$|£)\s?[\d.,]+|\b\d[\d.,]*\s?(k|m|mln|mil{1,2}[ij]?oe?n)\b|\b(goal|dream|doel|droom|earn|verdien(en)?|save|sparen|quit|launch|build|become|per\s+(month|maand|year|jaar))\b/i;
    // Also match fuzzy million spellings anywhere in text (e.g., "1 milion", "één miljoen").
    const goalSignal = /\b(mil{1,2}[ij]?oe?n|million|miljoen|mln)\b/i;
    const abstractGoalRegex = /\b(improve|change|fix|solve|close\s+(this|that|the)\s+chapter|move\s+(on|forward|past)|let\s+go(\s+of)?|stop|start\s+(doing|being)|shift|transform|heal|grow|verbeter(en)?|veranderen|oplossen|loslaten|afronden|verder|beginnen\s+met)\b/i;
    const recentUserTurns = (finalHistory || [])
      .filter((m: any) => m.role === 'user' && typeof m.content === 'string')
      .slice(-4)
      .map((m: any) => m.content as string);
    // Also consider the current message itself for goal context (a
    // plan-request often carries the goal noun in the same turn).
    const goalContextTexts = [...recentUserTurns, message];
    const concreteGoalHit = goalContextTexts.some(t => goalNounRegex.test(t));
    const abstractGoalHit = goalContextTexts.some(t => abstractGoalRegex.test(t));
    const goalInRecentContext = concreteGoalHit || abstractGoalHit;
    // statedGoal: user named a concrete goal in the CURRENT message — force
    // the consult even without a plan-request or timeframe (the empty-consult
    // instruction will then steer the offer).
    const statedGoalRaw = goalNounRegex.test(message) || goalSignal.test(message);
    // Milestone tap: force ALL triggers off for this turn.
    const statedGoal = isMilestoneTap ? false : statedGoalRaw;
    // PHASE 2 (item 2): semantic verdict is PRIMARY; the regex verdicts
    // above apply only when the classifier failed (semanticIntent null).
    // A semantic 'decline' suppresses force-triggers for the turn
    // (ACTION CHARTER: offer once, no nagging).
    const semanticOk = !!semanticIntent;
    const semDecline = semanticIntent?.intent === 'decline';
    const confirmSignal = semanticOk ? semanticIntent!.intent === 'confirm' : (acsConfirmation || shortAffirmative);
    const planSignal = semanticOk ? semanticIntent!.intent === 'plan_request' : planRequest;
    const goalSignalNow = semanticOk ? semanticIntent!.intent === 'stated_goal' : statedGoal;
    // confirmedDecompose short-circuits detection: always force the hands.
    const shouldForceTool = !!confirmedDecompose || (!isMilestoneTap && !semDecline
      && (confirmSignal || planSignal || goalSignalNow)
      && (goalInRecentContext || goalSignalNow));
    const trigger = confirmedDecompose ? 'confirmedAction'
                   : isMilestoneTap ? 'milestoneTap'
                   : semDecline ? 'semanticDecline'
                   : confirmSignal ? (semanticOk ? 'semanticConfirm' : acsConfirmation ? 'acsConfirmation' : 'shortAffirmative')
                   : planSignal ? (semanticOk ? 'semanticPlan' : 'planRequest')
                   : goalSignalNow ? (semanticOk ? 'semanticGoal' : 'statedGoal')
                   : 'none';
    const goalMatch = concreteGoalHit ? 'concrete' : abstractGoalHit ? 'abstract' : 'none';

    console.log(shouldForceTool
      ? '🎯 TOOL CHOICE: required'
      : '🎯 TOOL CHOICE: auto', {
      trigger,
      intentSource: confirmedDecompose || isMilestoneTap ? 'rail' : semanticOk ? 'semantic' : 'regex-fallback',
      semanticIntent: semanticIntent?.intent || null,
      semanticGoalVerbatim: semanticIntent?.goal_verbatim || null,
      semanticTimeframe: semanticIntent?.timeframe || null,
      // Regex verdicts stay logged every turn for semantic-vs-regex drift telemetry.
      acsCluster: acsDetection?.cluster || 'none',
      acsSubState: acsDetection?.subState || 'none',
      shortAffirmative,
      planRequest,
      statedGoal,
      goalMatch,
      goalInRecentContext
    });

    // ────────────────────────────────────────────────────────────────
    // AUTO-DEAL RETIRED (v2.5, founder ruling Jul 18): the conversation
    // no longer deals offer cards — not by rail, not by model choice.
    // Program creation has ONE door: sentence selection in the chat →
    // prefilled offer card → tap opens the workspace panel, where the
    // existing decomposition flow runs (panel executes; twin triggers).
    // The confirmedAction freeze below stays: it serves the legacy
    // client fallback (USE_PANEL_INTAKE=false) and remains the only
    // conversational path that may create a program.
    // ────────────────────────────────────────────────────────────────

    if (isMilestoneTap) {
      console.log('🪧 MILESTONE TAP: coaching mode, decompose suppressed', { message: message.slice(0, 120) });
      // Append coaching directive to the system prompt so the model
      // reads the existing dream and coaches into the tapped milestone.
      const coachingDirective = "\n\nMILESTONE TAP DIRECTIVE (governs this reply): The user tapped a milestone on their existing dream card — coach them into starting this specific milestone; do NOT create or decompose a new goal.";
      const sys = completionParams.messages[0];
      if (sys && sys.role === 'system' && typeof sys.content === 'string') {
        sys.content = sys.content + coachingDirective;
      } else {
        completionParams.messages.unshift({ role: 'system', content: coachingDirective });
      }
    }
    let toolRounds = 0;
    // Pin the forced tool by name on confirmation turns. 'required' alone
    // lets the model pick the safer consult (get_active_dream), which hits
    // the empty branch and offers again — the exact loop that keeps
    // user_goals empty after "yes". planRequest / statedGoal keep plain
    // 'required' because those turns should still be free to consult first.
    // v2.5: typed confirmations no longer create programs — decompose is
    // pinned ONLY by the confirmedAction rail (legacy client fallback).
    // Goal/plan turns may still force a consult (get_active_dream) so the
    // twin speaks from real state, but never a creation.
    const forceDecompose = !!confirmedDecompose;
    const firstToolChoice: any = confirmedDecompose
      ? { type: 'function', function: { name: 'decompose_goal' } }
      : isMilestoneTap
        ? { type: 'function', function: { name: 'get_active_dream' } }
        : shouldForceTool
          ? { type: 'function', function: { name: 'get_active_dream' } }
          : 'auto';
    if (confirmedDecompose) {
      console.log('🃏 OFFER CONFIRMED → 🎯 PINNED DECOMPOSE (detection skipped)', { title: confirmedDecompose.title });
    }
    let openAIResponse = await callChat({
      messages: completionParams.messages,
      model: completionParams.model,
      max_tokens: completionParams.max_completion_tokens,
      stream: completionParams.stream,
      tools: companionTools,
      tool_choice: firstToolChoice,
    });

    while (toolRounds < 2) {
      const probeText = await openAIResponse.clone().text();
      let probe: any;
      try { probe = JSON.parse(probeText); } catch { break; }
      const toolCalls = probe?.choices?.[0]?.message?.tool_calls;
      if (!probe?.choices || !toolCalls || toolCalls.length === 0) break;

      toolRounds++;
      completionParams.messages.push(probe.choices[0].message);
      for (const tc of toolCalls.slice(0, 2)) {
        let args = {};
        try { args = JSON.parse(tc.function?.arguments || '{}'); } catch {}
        const result = await runCompanionTool(tc.function?.name, args);
        completionParams.messages.push({ role: 'tool', tool_call_id: tc.id, content: result });
      }
      openAIResponse = await callChat({
        messages: completionParams.messages,
        model: completionParams.model,
        max_tokens: completionParams.max_completion_tokens,
        stream: completionParams.stream,
        tools: companionTools,
        tool_choice: toolRounds >= 2 ? 'none' : 'auto',
      });
    }

    if (shouldForceTool && toolRounds === 0) {
      console.warn('⚠️ REQUIRED IGNORED: tool_choice=required but the model returned zero tool calls', {
        trigger,
        message: (typeof message === 'string' ? message : '').slice(0, 200),
      });
    }

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
    const finishReason = aiResponse.choices?.[0]?.finish_reason || 'unknown';
    if (finishReason === 'length') {
      console.warn('✂️ TRUNCATION: response cut off (finish_reason=length) — model ran out of tokens mid-reply', {
        model: selectedModel,
        max_tokens: completionParams.max_completion_tokens,
      });
    }
    let response = aiResponse.choices[0]?.message?.content || 'I sense a disturbance in our connection. Please try reaching out again.'

    // Build lightweight reference array for recent conversational context (exclude system prompts)
    const conversationMessages = messagesToSend.filter(msg => msg.role !== 'system' && typeof msg.content === 'string');

    // 🔍 QUALITY CONTROL: Validate response alignment with conversation
    const validateResponseQuality = () => {
      const userMessage = message.toLowerCase();
      const responseLower = response.toLowerCase();
      
      // Check for contradiction/irony in user message
      const hasContradiction = /\b(but|while|though|however|although)\b/i.test(message);
      const hasIrony = /\b(natural.*lack|comes.*to me.*lack|good at.*problem|easy.*difficult)\b/i.test(message);
      
      // Count metaphors (river, stream, flow, spark, glow, dance, journey, etc.)
      const metaphorCount = (response.match(/\b(river|stream|flow|spark|glow|dance|journey|bridge|path|seed|bloom|treasure|mirror|wave)\b/gi) || []).length;
      
      // Check if response addresses recent conversation context
      const recentContext = conversationMessages.slice(-3).map(m => m.content.toLowerCase()).join(' ');
      const hasContextAlignment = conversationMessages.length < 2 ||
        recentContext.split(' ').some(word => word.length > 4 && responseLower.includes(word));
      
      // Validation results
      const validation = {
        hasContradiction,
        hasIrony,
        addressedContradiction: hasContradiction && (responseLower.includes('contradict') || responseLower.includes('irony') || responseLower.includes('paradox')),
        metaphorCount,
        excessiveMetaphors: metaphorCount > 2,
        hasContextAlignment,
        userMessageLength: message.length,
        responseLength: response.length
      };
      
      console.log('🔍 QUALITY CONTROL:', {
        validation,
        passed: (!hasContradiction || validation.addressedContradiction) && 
                !validation.excessiveMetaphors && 
                validation.hasContextAlignment,
        userMessage: message.substring(0, 100),
        responsePreview: response.substring(0, 150)
      });
      
      return validation;
    };
    
    const qualityCheck = validateResponseQuality();

    // FUSION STEP 2: Prepare oracle response data for HACS intelligence integration
    const oracleResponseData = {
      response,
      oracleStatus,
      semanticChunks: semanticChunks.length,
      quality: intelligenceLevel > 70 ? 0.9 : 0.8, // Higher quality for advanced users
      personalityContext,
      qualityCheck // Include validation results
    };

    // Log metrics for cost tracking
    const tokenUsage = aiResponse.usage || {};
    console.log('📊 FUSION: Oracle Response Metrics:', {
      mode: useOracleMode ? 'oracle' : 'standard',
      status: oracleStatus,
      semanticChunks: semanticChunks.length,
      intelligenceLevel,
      backgroundFusion: enableBackgroundIntelligence,
      tokens: tokenUsage,
      responseLength: response.length,
      finishReason,
      qualityValidation: {
        passed: (!qualityCheck.hasContradiction || qualityCheck.addressedContradiction) && 
                !qualityCheck.excessiveMetaphors && 
                qualityCheck.hasContextAlignment,
        metaphorCount: qualityCheck.metaphorCount,
        contextAligned: qualityCheck.hasContextAlignment,
        contradictionHandled: !qualityCheck.hasContradiction || qualityCheck.addressedContradiction
      }
    });

    // Fix 5: Dual-write individual messages to conversation_messages
    try {
      const conversationId = threadId || `oracle_${sessionId}`;
      // On first contact the "user message" is a synthetic handoff from
      // onboarding — the stored thread should begin with the companion.
      const messageRows = [
        {
          conversation_id: conversationId,
          client_msg_id: crypto.randomUUID(),
          user_id: userId,
          session_id: sessionId,
          role: 'assistant',
          content: response,
          status: 'delivered'
        }
      ];
      if (!firstContact) {
        messageRows.unshift({
          conversation_id: conversationId,
          client_msg_id: crypto.randomUUID(),
          user_id: userId,
          session_id: sessionId,
          role: 'user',
          content: message,
          status: 'delivered'
        });
      }
      await supabase.from('conversation_messages').insert(messageRows);
      console.log('✅ Dual-write: Oracle messages stored in conversation_messages');
    } catch (dualWriteError) {
      console.error('⚠️ Dual-write to conversation_messages failed (non-blocking):', dualWriteError);
    }

    // FUSION STEP 3: Prepare immediate response (background tasks will run AFTER this is sent)
    const immediateResponse = new Response(JSON.stringify({
      response,
      attachments: cardAttachments,
      quality: 0.85,
      semanticChunks,
      structuredFacts,
      personalityContext,
      intelligenceLevel,
      oracleStatus,
      processingTime: Date.now() - startTime
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // FUSION STEP 4: Queue background tasks to run AFTER response is sent
    console.log('🔍 FUSION CHECK: Background intelligence flag', {
      enableBackgroundIntelligence,
      hasEdgeRuntime: typeof EdgeRuntime !== 'undefined',
      hasWaitUntil: typeof EdgeRuntime !== 'undefined' && !!EdgeRuntime.waitUntil,
      timestamp: new Date().toISOString()
    });

    if (enableBackgroundIntelligence && typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
      console.log('🚀 FUSION TRIGGERED: Queuing background tasks with EdgeRuntime.waitUntil', {
        userId,
        sessionId,
        oracleResponseDataKeys: Object.keys(oracleResponseData)
      });

      // Create timeout promise (30 seconds)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Background task timeout after 30s')), 30000)
      );

      // Wrap each task with timeout
      const bgTasks = Promise.allSettled([
        Promise.race([
          fuseWithHACSIntelligence(message, userId, sessionId, oracleResponseData, supabase),
          timeoutPromise
        ]),
        Promise.race([
          generateConversationInsights(userId, sessionId, supabase),
          timeoutPromise
        ])
      ]);

      EdgeRuntime.waitUntil(
        bgTasks
          .then((results) => {
            const r0: any = results[0];
            const r1: any = results[1];

            console.log('✅ BACKGROUND TASKS: Both tasks completed', {
              fusionStatus: r0?.status,
              fusionReason: r0?.status === 'rejected' ? r0?.reason?.message || r0?.reason : 'success',
              insightsStatus: r1?.status,
              insightsReason: r1?.status === 'rejected' ? r1?.reason?.message || r1?.reason : 'success',
              timestamp: new Date().toISOString()
            });
          })
          .catch((error) => {
            console.error('❌ BACKGROUND TASKS: Unexpected error in waitUntil', {
              error: error instanceof Error ? error.message : error,
              timestamp: new Date().toISOString()
            });
          })
      );
    } else if (enableBackgroundIntelligence) {
      console.log('⚠️ EdgeRuntime.waitUntil not available, background tasks will not run');
    }

    // FUSION STEP 5: Return immediate response (customer served, background tasks queued)
    return immediateResponse;
  } catch (error) {
    console.error("❌ Oracle Conversation Error:", error);
    return new Response(JSON.stringify({
      error: (error as Error).message,
      response: "The cosmic channels are temporarily disrupted. Please try again, seeker."
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

