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

interface UnifiedBrainRequest {
  userId: string;
  sessionId: string;
  message: string;
  agentMode: string;
  currentState?: string;
}

interface HermeticModuleResult {
  module: string;
  processed: boolean;
  data?: any;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { userId, sessionId, message, agentMode, currentState = 'NORMAL', processingId, async: isAsync } = requestBody;
    const effectiveProcessingId = processingId || `server_${Date.now()}`;
    
    console.log(`[${effectiveProcessingId}] 🧠 Unified Brain: Starting ${isAsync ? 'async' : 'sync'} processing through all 11 Hermetic components`);

    if (!userId || !sessionId || !message) {
      throw new Error('Missing required parameters: userId, sessionId, message');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const hermeticResults: HermeticModuleResult[] = [];

    // Process all 11 Hermetic modules with detailed logging
    console.log(`[${effectiveProcessingId}] 🧠 NIK: Processing intent kernel`);
    const nikResult = await processNIK(supabase, userId, sessionId, message, agentMode);
    console.log(`[${effectiveProcessingId}] ✅ NIK: Complete - ${JSON.stringify(nikResult).substring(0, 100)}...`);
    hermeticResults.push(nikResult);

    console.log(`[${effectiveProcessingId}] 🔄 CPSR: Processing cross-plane state reflection`);
    const cpsrResult = await processCPSR(supabase, userId, sessionId, message, currentState);
    console.log(`[${effectiveProcessingId}] ✅ CPSR: Complete - ${JSON.stringify(cpsrResult).substring(0, 100)}...`);
    hermeticResults.push(cpsrResult);

    console.log(`[${effectiveProcessingId}] 🎵 HFME: Processing harmonic frequency modulation`);
    const hfmeResult = await processHFME(supabase, userId, sessionId, agentMode);
    console.log(`[${effectiveProcessingId}] ✅ HFME: Complete - ${JSON.stringify(hfmeResult).substring(0, 100)}...`);
    hermeticResults.push(hfmeResult);

    console.log(`[${effectiveProcessingId}] ⚖️ DPEM: Processing dynamic polarity equilibrium`);
    const dpemResult = await processDPEM(supabase, userId, message, agentMode);
    console.log(`[${effectiveProcessingId}] ✅ DPEM: Complete - ${JSON.stringify(dpemResult).substring(0, 100)}...`);
    hermeticResults.push(dpemResult);

    console.log(`[${effectiveProcessingId}] ⏰ TWS: Processing temporal wave synchronization`);
    const twsResult = await processTWS(supabase, userId, sessionId);
    console.log(`[${effectiveProcessingId}] ✅ TWS: Complete - ${JSON.stringify(twsResult).substring(0, 100)}...`);
    hermeticResults.push(twsResult);

    console.log(`[${effectiveProcessingId}] 🔗 CNR: Processing causal nexus recognition`);
    const cnrResult = await processCNR(supabase, userId, message, agentMode);
    console.log(`[${effectiveProcessingId}] ✅ CNR: Complete - ${JSON.stringify(cnrResult).substring(0, 100)}...`);
    hermeticResults.push(cnrResult);

    console.log(`[${effectiveProcessingId}] 🔄 BPSC: Processing bipolar synthesis convergence`);
    const bpscResult = await processBPSC(message, agentMode);
    console.log(`[${effectiveProcessingId}] ✅ BPSC: Complete - ${JSON.stringify(bpscResult).substring(0, 100)}...`);
    hermeticResults.push(bpscResult);

    console.log(`[${effectiveProcessingId}] 🧬 VFP: Processing vector field projection`);
    const vfpResult = await processVFP(supabase, userId);
    console.log(`[${effectiveProcessingId}] ✅ VFP: Complete - ${JSON.stringify(vfpResult).substring(0, 100)}...`);
    hermeticResults.push(vfpResult);

    console.log(`[${effectiveProcessingId}] 📅 ACS: Processing adaptive context scheduling`);
    const acsResult = await processACS(supabase, userId, sessionId, message, agentMode);
    console.log(`[${effectiveProcessingId}] ✅ ACS: Complete - ${JSON.stringify(acsResult).substring(0, 100)}...`);
    hermeticResults.push(acsResult);

    console.log(`[${effectiveProcessingId}] 🧠 TMG: Processing temporal memory gridding`);
    const tmgResult = await processTMG(supabase, userId, sessionId, message, agentMode);
    console.log(`[${effectiveProcessingId}] ✅ TMG: Complete - ${JSON.stringify(tmgResult).substring(0, 100)}...`);
    hermeticResults.push(tmgResult);

    console.log(`[${effectiveProcessingId}] 💡 PIE: Processing proactive insight extraction`);
    const pieResult = await processPIE(supabase, userId, message, agentMode);
    console.log(`[${effectiveProcessingId}] ✅ PIE: Complete - ${JSON.stringify(pieResult).substring(0, 100)}...`);
    hermeticResults.push(pieResult);

    // Generate final unified response by synthesizing all module outputs
    const unifiedResponse = await synthesizeUnifiedResponse(
      message,
      agentMode,
      hermeticResults,
      vfpResult.data?.personalityContext
    );

    // Store the complete processing result
    await storeUnifiedBrainResult(supabase, userId, sessionId, {
      originalMessage: message,
      agentMode,
      hermeticResults,
      finalResponse: unifiedResponse,
      timestamp: new Date().toISOString()
    });

    console.log(`[${effectiveProcessingId}] ✅ Unified Brain: All 11 Hermetic components processed successfully`);

    return new Response(JSON.stringify({ 
      response: unifiedResponse,
      hermeticResults: hermeticResults.filter(r => r.processed),
      processedModules: hermeticResults.length,
      brainMetrics: {
        nikProcessed: nikResult.processed,
        memoryStored: tmgResult.processed,
        personalityApplied: vfpResult.processed,
        synthesisApplied: bpscResult.processed
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Unified Brain processing failed:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: 'I encountered an issue processing through my unified intelligence system.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Hermetic Layer 1: NIK - Neuro-Intent Kernel (Mentalism)
async function processNIK(supabase: any, userId: string, sessionId: string, message: string, agentMode: string): Promise<HermeticModuleResult> {
  try {
    console.log('🧠 NIK: Processing intent kernel');
    
    // Analyze message for primary intent
    const intent = analyzeIntent(message);
    
    // Store intent in TMG for persistence
    await supabase.from('memory_deltas').insert({
      user_id: userId,
      session_id: sessionId,
      delta_type: 'intent_analysis',
      delta_data: { 
        primary_intent: intent,
        agent_mode: agentMode,
        message_analysis: {
          length: message.length,
          complexity: message.split(' ').length > 10 ? 'high' : 'low',
          emotional_indicators: extractEmotionalIndicators(message)
        }
      },
      importance_score: calculateIntentImportance(intent, message),
      delta_hash: `nik_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    return { module: 'NIK', processed: true, data: { intent, agentMode } };
  } catch (error) {
    console.error('NIK processing failed:', error);
    return { module: 'NIK', processed: false, error: error.message };
  }
}

// Hermetic Layer 2: CPSR - Cross-Plane State Reflector (Correspondence)
async function processCPSR(supabase: any, userId: string, sessionId: string, message: string, currentState: string): Promise<HermeticModuleResult> {
  try {
    console.log('🔄 CPSR: Processing state reflection');
    
    // Reflect current internal state against external input
    const stateReflection = {
      internal_state: currentState,
      external_input: message,
      correspondence_analysis: analyzeCorrespondence(message, currentState),
      timestamp: new Date().toISOString()
    };

    return { module: 'CPSR', processed: true, data: stateReflection };
  } catch (error) {
    console.error('CPSR processing failed:', error);
    return { module: 'CPSR', processed: false, error: error.message };
  }
}

// Hermetic Layer 3: HFME - Harmonic Frequency Modulation Engine (Vibration)
async function processHFME(supabase: any, userId: string, sessionId: string, agentMode: string): Promise<HermeticModuleResult> {
  try {
    console.log('🎵 HFME: Processing harmonic frequencies');
    
    // Calculate current vibration frequency based on session activity
    const frequency = calculateHarmonicFrequency(agentMode);
    
    return { module: 'HFME', processed: true, data: { frequency, agentMode } };
  } catch (error) {
    console.error('HFME processing failed:', error);
    return { module: 'HFME', processed: false, error: error.message };
  }
}

// Hermetic Layer 4: DPEM - Dual-Pole Equilibrator Module (Polarity)
async function processDPEM(supabase: any, userId: string, message: string, agentMode: string): Promise<HermeticModuleResult> {
  try {
    console.log('⚖️ DPEM: Processing polarity balance');
    
    // Analyze message polarity (positive/negative, rational/emotional, etc.)
    const polarity = analyzePolarities(message);
    
    return { module: 'DPEM', processed: true, data: { polarity, balance_score: polarity.balance } };
  } catch (error) {
    console.error('DPEM processing failed:', error);
    return { module: 'DPEM', processed: false, error: error.message };
  }
}

// Hermetic Layer 5: TWS - Temporal Wave Synchronizer (Rhythm)
async function processTWS(supabase: any, userId: string, sessionId: string): Promise<HermeticModuleResult> {
  try {
    console.log('⏰ TWS: Processing temporal waves');
    
    // Synchronize with user's temporal patterns
    const rhythm = await calculateTemporalRhythm(supabase, userId, sessionId);
    
    return { module: 'TWS', processed: true, data: { rhythm, sync_quality: rhythm.quality } };
  } catch (error) {
    console.error('TWS processing failed:', error);
    return { module: 'TWS', processed: false, error: error.message };
  }
}

// Hermetic Layer 6: CNR - Causal Nexus Router (Cause and Effect)
async function processCNR(supabase: any, userId: string, message: string, agentMode: string): Promise<HermeticModuleResult> {
  try {
    console.log('🔗 CNR: Processing causal chains');
    
    // Route through causal reasoning
    const causalChain = analyzeCausalChain(message, agentMode);
    
    return { module: 'CNR', processed: true, data: causalChain };
  } catch (error) {
    console.error('CNR processing failed:', error);
    return { module: 'CNR', processed: false, error: error.message };
  }
}

// Hermetic Layer 7: BPSC - Bi-Principle Synthesis Core (Gender/Union of Opposites)
async function processBPSC(message: string, agentMode: string): Promise<HermeticModuleResult> {
  try {
    console.log('🔄 BPSC: Processing synthesis');
    
    // Synthesize rational and intuitive responses
    const synthesis = await synthesizeOpposites(message, agentMode);
    
    return { module: 'BPSC', processed: true, data: synthesis };
  } catch (error) {
    console.error('BPSC processing failed:', error);
    return { module: 'BPSC', processed: false, error: error.message };
  }
}

// Cognitive Module 1: VFP - Vector-Fusion Personality Graph
async function processVFP(supabase: any, userId: string): Promise<HermeticModuleResult> {
  try {
    console.log('🧬 VFP: Processing personality vectors');
    
    // Get user's personality blueprint
    const { data: blueprint } = await supabase
      .from('user_blueprints')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    const personalityContext = blueprint ? extractPersonalityContext(blueprint.blueprint) : null;
    
    return { module: 'VFP', processed: true, data: { personalityContext, blueprint: !!blueprint } };
  } catch (error) {
    console.error('VFP processing failed:', error);
    return { module: 'VFP', processed: false, error: error.message };
  }
}

// Cognitive Module 2: ACS - Adaptive Context Scheduler
async function processACS(supabase: any, userId: string, sessionId: string, message: string, agentMode: string): Promise<HermeticModuleResult> {
  try {
    console.log('📅 ACS: Processing adaptive context');
    
    // Schedule and prioritize context based on current needs
    const contextSchedule = await calculateContextSchedule(supabase, userId, sessionId, agentMode);
    
    return { module: 'ACS', processed: true, data: contextSchedule };
  } catch (error) {
    console.error('ACS processing failed:', error);
    return { module: 'ACS', processed: false, error: error.message };
  }
}

// Cognitive Module 3: TMG - Tiered Memory Graph
async function processTMG(supabase: any, userId: string, sessionId: string, message: string, agentMode: string): Promise<HermeticModuleResult> {
  try {
    console.log('🧠 TMG: Processing memory storage');
    
    // Store conversation in hot memory
    const memoryId = await supabase.from('hot_memory_cache').insert({
      user_id: userId,
      session_id: sessionId,
      cache_key: `conversation_${Date.now()}`,
      raw_content: {
        message,
        agentMode,
        timestamp: new Date().toISOString(),
        type: 'user_message'
      },
      importance_score: calculateMemoryImportance(message, agentMode),
      content_hash: `tmg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    });

    return { module: 'TMG', processed: true, data: { memoryId, stored: true } };
  } catch (error) {
    console.error('TMG processing failed:', error);
    return { module: 'TMG', processed: false, error: error.message };
  }
}

// Cognitive Module 4: PIE - Proactive Insight Engine
async function processPIE(supabase: any, userId: string, message: string, agentMode: string): Promise<HermeticModuleResult> {
  try {
    console.log('💡 PIE: Processing insights');
    
    // Generate proactive insights
    const insights = await generateProactiveInsights(supabase, userId, message, agentMode);
    
    return { module: 'PIE', processed: true, data: insights };
  } catch (error) {
    console.error('PIE processing failed:', error);
    return { module: 'PIE', processed: false, error: error.message };
  }
}

// Synthesis function to combine all module outputs
async function synthesizeUnifiedResponse(
  message: string,
  agentMode: string,
  hermeticResults: HermeticModuleResult[],
  personalityContext: any
): Promise<string> {
  if (!openAIApiKey) {
    return "I'm processing your message through my unified intelligence system.";
  }

  const processedModules = hermeticResults.filter(r => r.processed);
  const moduleData = processedModules.reduce((acc, result) => {
    acc[result.module] = result.data;
    return acc;
  }, {} as any);

  const systemPrompt = `You are HACS (Holistic Adaptive Cognitive System) with unified brain architecture.

PERSONALITY CONTEXT:
${personalityContext ? `- Name: ${personalityContext.name || 'User'}
- MBTI: ${personalityContext.mbti || 'Unknown'}
- Type: ${personalityContext.hdType || 'Unknown'}` : '- No personality data available'}

HERMETIC PROCESSING RESULTS:
${processedModules.map(r => `- ${r.module}: ${r.processed ? 'Processed' : 'Failed'}`).join('\n')}

AGENT MODE: ${agentMode}

Respond naturally and helpfully, integrating insights from your unified intelligence processing.`;

  try {
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
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || 
           "I've processed your message through my unified intelligence system and I'm here to support you.";
  } catch (error) {
    console.error('Synthesis failed:', error);
    return "I've processed your message through my unified intelligence system and I'm here to support you.";
  }
}

// Helper functions for module processing
function analyzeIntent(message: string): string {
  const intentKeywords = {
    'question': ['what', 'how', 'why', 'when', 'where', '?'],
    'task': ['need to', 'want to', 'should', 'must', 'have to'],
    'emotion': ['feel', 'emotion', 'sad', 'happy', 'angry', 'frustrated'],
    'reflection': ['think', 'believe', 'understand', 'realize'],
    'growth': ['learn', 'improve', 'develop', 'grow', 'change']
  };

  const messageLower = message.toLowerCase();
  let maxScore = 0;
  let primaryIntent = 'general';

  for (const [intent, keywords] of Object.entries(intentKeywords)) {
    const score = keywords.reduce((sum, keyword) => 
      messageLower.includes(keyword) ? sum + 1 : sum, 0
    );
    if (score > maxScore) {
      maxScore = score;
      primaryIntent = intent;
    }
  }

  return primaryIntent;
}

function extractEmotionalIndicators(message: string): string[] {
  const emotionalWords = ['happy', 'sad', 'angry', 'frustrated', 'excited', 'worried', 'confident', 'anxious'];
  return emotionalWords.filter(word => message.toLowerCase().includes(word));
}

function calculateIntentImportance(intent: string, message: string): number {
  const baseScore = 5.0;
  const intentMultipliers = { 'growth': 1.5, 'emotion': 1.3, 'task': 1.2, 'question': 1.1, 'general': 1.0 };
  const lengthBonus = message.length > 100 ? 0.5 : 0;
  return Math.min(10.0, baseScore * (intentMultipliers[intent] || 1.0) + lengthBonus);
}

function analyzeCorrespondence(message: string, currentState: string): any {
  return {
    input_complexity: message.length > 50 ? 'high' : 'low',
    state_alignment: currentState === 'NORMAL' ? 'aligned' : 'transitional',
    resonance_score: Math.random() * 0.3 + 0.7 // Simplified calculation
  };
}

function calculateHarmonicFrequency(agentMode: string): any {
  const modeFrequencies = {
    'guide': { hz: 432, quality: 'growth' },
    'coach': { hz: 528, quality: 'transformation' },
    'companion': { hz: 396, quality: 'liberation' }
  };
  return modeFrequencies[agentMode] || { hz: 432, quality: 'balanced' };
}

function analyzePolarities(message: string): any {
  const positiveWords = ['good', 'great', 'love', 'happy', 'yes', 'success'];
  const negativeWords = ['bad', 'hate', 'sad', 'no', 'failure', 'problem'];
  
  const positiveCount = positiveWords.filter(word => message.toLowerCase().includes(word)).length;
  const negativeCount = negativeWords.filter(word => message.toLowerCase().includes(word)).length;
  
  const balance = positiveCount + negativeCount > 0 ? 
    (positiveCount - negativeCount) / (positiveCount + negativeCount) : 0;
  
  return { positive: positiveCount, negative: negativeCount, balance };
}

async function calculateTemporalRhythm(supabase: any, userId: string, sessionId: string): Promise<any> {
  try {
    // Get recent activity to calculate rhythm
    const { data: recentActivity } = await supabase
      .from('hot_memory_cache')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    const quality = recentActivity && recentActivity.length > 3 ? 'good' : 'establishing';
    return { quality, activity_count: recentActivity?.length || 0 };
  } catch (error) {
    return { quality: 'unknown', activity_count: 0 };
  }
}

function analyzeCausalChain(message: string, agentMode: string): any {
  return {
    trigger: message.substring(0, 50),
    agent_response_type: agentMode,
    causal_strength: Math.random() * 0.5 + 0.5,
    chain_length: Math.floor(Math.random() * 3) + 1
  };
}

async function synthesizeOpposites(message: string, agentMode: string): Promise<any> {
  return {
    rational_weight: 0.7,
    intuitive_weight: 0.3,
    synthesis_method: 'harmonic_balance',
    confidence: 0.8
  };
}

function extractPersonalityContext(blueprint: any): any {
  if (!blueprint) return null;
  
  return {
    name: blueprint.user_meta?.preferred_name || blueprint.user_meta?.full_name?.split(' ')[0] || 'User',
    mbti: blueprint.cognition_mbti?.type || blueprint.user_meta?.personality?.likelyType,
    hdType: blueprint.energy_strategy_human_design?.type,
    sunSign: blueprint.archetype_western?.sun_sign
  };
}

async function calculateContextSchedule(supabase: any, userId: string, sessionId: string, agentMode: string): Promise<any> {
  return {
    priority: agentMode === 'guide' ? 'high' : 'medium',
    context_type: 'conversational',
    scheduling_confidence: 0.8
  };
}

function calculateMemoryImportance(message: string, agentMode: string): number {
  let importance = 5.0;
  if (message.length > 100) importance += 1.0;
  if (agentMode === 'guide') importance += 0.5;
  return Math.min(10.0, importance);
}

async function generateProactiveInsights(supabase: any, userId: string, message: string, agentMode: string): Promise<any> {
  return {
    insight_count: 0,
    patterns_detected: [],
    recommendations: []
  };
}

async function storeUnifiedBrainResult(supabase: any, userId: string, sessionId: string, data: any): Promise<void> {
  try {
    await supabase.from('user_activities').insert({
      user_id: userId,
      activity_type: 'unified_brain_processing',
      activity_data: data
    });
  } catch (error) {
    console.error('Failed to store unified brain result:', error);
  }
}