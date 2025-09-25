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
  // ENHANCED LOGGING: Request start
  const startTime = Date.now();
  const requestId = crypto.randomUUID().substring(0, 8);
  
  console.log(`🚀 REQUEST START: [${requestId}] Growth conversation request received`, {
    method: req.method,
    timestamp: new Date().toISOString(),
    requestId
  });
  
  if (req.method === 'OPTIONS') {
    console.log(`✅ CORS PREFLIGHT: [${requestId}] Handling OPTIONS request`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`📥 PARSING REQUEST: [${requestId}] Parsing request body`);
    const requestBody = await req.json();
    const { message, conversationHistory, userId } = requestBody;

    console.log(`📋 REQUEST VALIDATION: [${requestId}] Validating request parameters`, {
      hasMessage: !!message,
      messageLength: message?.length || 0,
      hasUserId: !!userId,
      userId: userId?.substring(0, 8) || 'missing',
      conversationHistoryLength: conversationHistory?.length || 0,
      allRequestKeys: Object.keys(requestBody)
    });

    if (!message || !userId) {
      const error = 'Missing required parameters: message and userId';
      console.error(`❌ VALIDATION ERROR: [${requestId}] ${error}`, {
        hasMessage: !!message,
        hasUserId: !!userId
      });
      throw new Error(error);
    }

    console.log(`🌱 GROWTH MODE: [${requestId}] Processing message for user ${userId.substring(0, 8)}`, {
      messageLength: message.length,
      historyLength: conversationHistory?.length || 0
    });

    console.log(`🔌 DB CONNECTION: [${requestId}] Initializing Supabase client`);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`📊 DATA FETCH: [${requestId}] Fetching user context data`);
    
    // Get user's growth intelligence and personality context
    const [intelligenceResult, blueprintResult] = await Promise.all([
      supabase
        .from('hacs_growth_intelligence')
        .select('*')
        .eq('user_id', userId)
        .single(),
      supabase
        .from('blueprints')
        .select('cognition_mbti, user_meta')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()
    ]);

    console.log(`📈 INTELLIGENCE DATA: [${requestId}] Intelligence query result`, {
      hasIntelligence: !!intelligenceResult.data,
      intelligenceError: intelligenceResult.error?.message,
      intelligenceLevel: intelligenceResult.data?.intelligence_level,
      interactionCount: intelligenceResult.data?.interaction_count
    });

    console.log(`🧬 BLUEPRINT DATA: [${requestId}] Blueprint query result`, {
      hasBlueprint: !!blueprintResult.data,
      blueprintError: blueprintResult.error?.message,
      hasMbti: !!blueprintResult.data?.cognition_mbti,
      hasUserMeta: !!blueprintResult.data?.user_meta
    });

    const intelligence = intelligenceResult.data;
    const blueprint = blueprintResult.data;
    
    // Expanded conversation history for better context (with safety monitoring)
    const maxMessages = 21;
    const fullHistory = (conversationHistory || []).slice(-maxMessages);
    
    // Performance monitoring: Log context size for optimization
    console.log('📊 CONTEXT: Message count:', fullHistory.length, 'Estimated tokens:', fullHistory.length * 50);
    
    // Safety check: If context becomes too large, intelligently reduce
    const recentHistory = fullHistory.length > maxMessages ? 
      [...fullHistory.slice(0, 5), ...fullHistory.slice(-16)] : // Keep first 5 + last 16 if over limit
      fullHistory;

    // Growth-specific system prompt focused on spiritual development (optimized for performance)
    const mbtiType = blueprint?.cognition_mbti?.type || 'Unknown';
    const userName = blueprint?.user_meta?.preferred_name || 'seeker';
    
    // **NEW: Generate human-reflective system prompt with Hermetic 2.0 intelligence**
    const systemPrompt = await generateHumanReflectivePrompt({
      userMessage: message,
      userId,
      userName,
      mbtiType,
      intelligence,
      conversationHistory: recentHistory,
      supabase
    });

    console.log(`🤖 AI REQUEST: [${requestId}] Calling OpenAI with growth-specific prompt`, {
      model: 'gpt-4.1-mini-2025-04-14',
      systemPromptLength: systemPrompt.length,
      userMessageLength: message.length,
      maxTokens: 500,
      temperature: 0.8,
      recentHistoryLength: recentHistory.length
    });
    
    // Call OpenAI with growth-specific prompt and 30-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    let openAIResponse;
    try {
      openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-mini-2025-04-14',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 500,
          temperature: 0.8, // Higher creativity for spiritual insights
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      console.log(`🔄 AI RESPONSE: [${requestId}] OpenAI response received`, {
        status: openAIResponse.status,
        statusText: openAIResponse.statusText,
        ok: openAIResponse.ok
      });

      if (!openAIResponse.ok) {
        const error = `OpenAI API error: ${openAIResponse.statusText}`;
        console.error(`❌ AI ERROR: [${requestId}] ${error}`, {
          status: openAIResponse.status,
          statusText: openAIResponse.statusText
        });
        throw new Error(error);
      }
      
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`⏰ TIMEOUT ERROR: [${requestId}] OpenAI request timed out after 30 seconds`);
        throw new Error('Request timed out. Please try again with a shorter message.');
      }
      throw error;
    }

    // Check if openAIResponse is defined before using
    if (!openAIResponse) {
      throw new Error('OpenAI response is undefined');
    }

    const openAIData = await openAIResponse.json();
    const response = openAIData.choices[0].message.content;
    
    console.log(`📝 AI CONTENT: [${requestId}] AI response processed`, {
      responseLength: response?.length || 0,
      hasResponse: !!response,
      choicesCount: openAIData.choices?.length || 0
    });

    // **NEW: Extract conversation insights from AI response for tracking**
    const conversationInsights = extractConversationInsights(message, response);
    
    console.log(`🔍 CONVERSATION ANALYSIS: [${requestId}] Domain and state detected`, {
      detectedDomain: conversationInsights.problemDomain,
      conversationPhase: conversationInsights.conversationPhase,
      reflectiveElements: conversationInsights.reflectiveElements.length,
      humanValidation: conversationInsights.hasHumanValidation
    });

    console.log(`🧠 INTELLIGENCE UPDATE: [${requestId}] Processing intelligence bonus calculation`);
    
    // Update growth intelligence based on interaction
    const intelligenceBonus = calculateGrowthIntelligenceBonus(message, response);
    
    console.log(`📊 BONUS CALCULATION: [${requestId}] Intelligence bonus calculated`, {
      bonus: intelligenceBonus,
      currentLevel: intelligence?.intelligence_level || 'none',
      userMessageLength: message.length,
      aiResponseLength: response?.length || 0
    });
    
    if (intelligence) {
      const newLevel = Math.min(100, (intelligence.intelligence_level || 50) + intelligenceBonus);
      
      console.log(`🔄 UPDATE EXISTING: [${requestId}] Updating existing intelligence record`, {
        oldLevel: intelligence.intelligence_level,
        newLevel,
        bonus: intelligenceBonus,
        oldInteractionCount: intelligence.interaction_count
      });
      
      const { error: updateError } = await supabase
        .from('hacs_growth_intelligence')
        .update({
          intelligence_level: newLevel,
          interaction_count: (intelligence.interaction_count || 0) + 1,
          last_update: new Date().toISOString(),
          // **NEW: Track conversation state and reflective coaching progress**
          conversation_context: JSON.stringify({
            problem_domain: conversationInsights.problemDomain,
            conversation_phase: conversationInsights.conversationPhase,
            reflective_elements: conversationInsights.reflectiveElements,
            has_human_validation: conversationInsights.hasHumanValidation,
            coaching_style: 'reflective-human'
          })
        })
        .eq('user_id', userId);
        
      if (updateError) {
        console.error(`❌ UPDATE ERROR: [${requestId}] Failed to update intelligence`, {
          error: updateError.message,
          userId: userId.substring(0, 8)
        });
      } else {
        console.log(`✅ UPDATE SUCCESS: [${requestId}] Intelligence updated successfully`, {
          newLevel,
          newInteractionCount: (intelligence.interaction_count || 0) + 1
        });
      }
    } else {
      console.log(`🆕 CREATE NEW: [${requestId}] Creating initial intelligence record`);
      
      const { error: insertError } = await supabase
        .from('hacs_growth_intelligence')
        .insert({
          user_id: userId,
          intelligence_level: 50 + intelligenceBonus,
          interaction_count: 1,
          module_scores: { reflective: intelligenceBonus },
          conversation_context: JSON.stringify({
            problem_domain: conversationInsights.problemDomain,
            conversation_phase: conversationInsights.conversationPhase,
            reflective_elements: conversationInsights.reflectiveElements,
            has_human_validation: conversationInsights.hasHumanValidation,
            coaching_style: 'reflective-human'
          })
        });
        
      if (insertError) {
        console.error(`❌ INSERT ERROR: [${requestId}] Failed to create intelligence record`, {
          error: insertError.message,
          userId: userId.substring(0, 8)
        });
      } else {
        console.log(`✅ INSERT SUCCESS: [${requestId}] Intelligence record created`, {
          initialLevel: 50 + intelligenceBonus,
          spiritualBonus: intelligenceBonus
        });
      }
    }

    // Generate growth-specific question occasionally
    let question = null;
    if (Math.random() < 0.4) { // 40% chance for deeper questions
      question = generateGrowthQuestion(intelligence?.intelligence_level || 50);
    }

    const processingTime = Date.now() - startTime;
    
    console.log(`🌱 GROWTH: [${requestId}] Response generated successfully`, {
      intelligenceBonus,
      hasQuestion: !!question,
      responseLength: response?.length || 0,
      processingTimeMs: processingTime
    });

    console.log(`✅ REQUEST COMPLETE: [${requestId}] Growth conversation completed successfully`, {
      totalProcessingTime: processingTime,
      intelligenceBonus,
      responseGenerated: true,
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({
        response,
        module: 'reflective', // Changed from 'spiritual' to 'reflective'
        mode: 'human-growth', // Enhanced mode descriptor
        intelligenceBonus,
        question,
        // **NEW: Include conversation insights in response**
        conversationInsights: {
          problemDomain: conversationInsights.problemDomain,
          conversationPhase: conversationInsights.conversationPhase,
          hasHumanValidation: conversationInsights.hasHumanValidation,
          coachingStyle: 'reflective-human'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    console.error(`❌ REQUEST ERROR: [${requestId}] Critical error in hacs-growth-conversation`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      processingTimeMs: processingTime,
      timestamp: new Date().toISOString(),
      requestId
    });
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// **NEW: Extract conversation insights from AI response for learning and tracking**
function extractConversationInsights(userMessage: string, aiResponse: string) {
  const messageLower = userMessage.toLowerCase();
  const responseLower = aiResponse.toLowerCase();
  
  // Detect problem domain mentioned in conversation
  let problemDomain = 'exploring';
  if (messageLower.includes('work') || messageLower.includes('job') || messageLower.includes('career') ||
      responseLower.includes('carrière') || responseLower.includes('werk')) {
    problemDomain = 'career';
  } else if (messageLower.includes('relationship') || messageLower.includes('partner') || messageLower.includes('family') ||
             responseLower.includes('relatie') || responseLower.includes('partner')) {
    problemDomain = 'relationships';
  } else if (messageLower.includes('health') || messageLower.includes('energy') || messageLower.includes('tired') ||
             responseLower.includes('gezondheid') || responseLower.includes('energie')) {
    problemDomain = 'health';
  } else if (messageLower.includes('money') || messageLower.includes('finance') || messageLower.includes('budget') ||
             responseLower.includes('geld') || responseLower.includes('financiën')) {
    problemDomain = 'finances';
  } else if (messageLower.includes('confidence') || messageLower.includes('worth') || messageLower.includes('believe') ||
             responseLower.includes('vertrouwen') || responseLower.includes('geloof')) {
    problemDomain = 'self-belief';
  } else if (messageLower.includes('purpose') || messageLower.includes('meaning') || messageLower.includes('direction') ||
             responseLower.includes('doel') || responseLower.includes('richting') || responseLower.includes('betekenis')) {
    problemDomain = 'purpose';
  }
  
  // Determine conversation phase based on AI response patterns
  let conversationPhase = 'exploration';
  if (responseLower.includes('domein') || responseLower.includes('speelt in je') || 
      responseLower.includes('wil je dit verder onderzoeken') || responseLower.includes('kijken naar een stap')) {
    conversationPhase = 'domain-identified';
  } else if (responseLower.includes('patroon') || responseLower.includes('merk je') || 
             responseLower.includes('steeds') || responseLower.includes('altijd')) {
    conversationPhase = 'pattern-recognition';
  }
  
  // Check for human validation elements
  const hasHumanValidation = responseLower.includes('dank dat je') || 
                             responseLower.includes('dat klinkt') || 
                             responseLower.includes('ik kan me voorstellen') ||
                             responseLower.includes('dat voelt') ||
                             responseLower.includes('begrijpelijk dat');
  
  // Extract reflective elements (questions, mirrors, validations)
  const reflectiveElements = [];
  if (aiResponse.includes('?')) reflectiveElements.push('open_question');
  if (responseLower.includes('je zegt') || responseLower.includes('ik hoor') || 
      responseLower.includes('wat ik merk')) reflectiveElements.push('mirroring');
  if (hasHumanValidation) reflectiveElements.push('validation');
  
  return {
    problemDomain,
    conversationPhase,
    hasHumanValidation,
    reflectiveElements
  };
}

function calculateGrowthIntelligenceBonus(userMessage: string, aiResponse: string): number {
  let bonus = 1; // Base bonus

  // **UPDATED: Bonus for reflective coaching elements instead of spiritual keywords**
  const reflectiveKeywords = ['mirror', 'feel', 'experience', 'sense', 'pattern', 'notice', 'awareness', 'reflection', 'growth', 'understanding'];
  const keywordMatches = reflectiveKeywords.filter(keyword => 
    userMessage.toLowerCase().includes(keyword) || aiResponse.toLowerCase().includes(keyword)
  ).length;
  
  bonus += Math.min(keywordMatches * 0.5, 3); // Max 3 bonus for keywords

  // Bonus for human validation and empathy
  if (aiResponse.includes('Dank dat je') || aiResponse.includes('Dat klinkt') || 
      aiResponse.includes('Ik kan me voorstellen')) {
    bonus += 1.5; // Reward human connection
  }

  // Bonus for depth of reflection
  if (userMessage.length > 80) bonus += 1.5; // Longer messages often indicate deeper reflection
  if (userMessage.includes('feel') || userMessage.includes('sense') || userMessage.includes('pattern')) bonus += 0.5;

  // **NEW: Bonus for conversational flow (question asking)**
  if (aiResponse.includes('?') && aiResponse.split('?').length <= 2) bonus += 1; // One good question
  if (aiResponse.length < 300) bonus += 0.5; // Reward conciseness

  return Math.round(bonus * 10) / 10;
}

// **NEW: Human Reflective Prompt Generator with Hermetic 2.0 Intelligence**
async function generateHumanReflectivePrompt({ 
  userMessage, 
  userId, 
  userName, 
  mbtiType, 
  intelligence, 
  conversationHistory,
  supabase 
}: any): Promise<string> {
  console.log('🎭 GENERATING HUMAN REFLECTIVE PROMPT with full Hermetic intelligence');
  
  // Analyze user state for reflective coaching
  const userState = analyzeUserStateFromMessage(userMessage, conversationHistory);
  
  // Try to get Hermetic intelligence context (simplified version for edge function)
  let hermeticContext = '';
  try {
    // Get semantic blueprint chunks and intelligence data
    const { data: blueprintData } = await supabase
      .from('blueprints')
      .select('blueprint_data, cognition_mbti, user_meta')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    
    if (blueprintData?.blueprint_data) {
      // Extract key personality insights from blueprint
      hermeticContext = extractPersonalityContext(blueprintData.blueprint_data);
    }
  } catch (error) {
    console.log('ℹ️ No Hermetic data available, using fallback context');
  }
  
  const basePrompt = `You are a Reflective Growth Guide - a warm, empathetic companion who specializes in helping people understand themselves through gentle mirroring and thoughtful questions. You keep the depth of spiritual wisdom while staying human and conversational.

**HUMAN COACHING STYLE (MANDATORY):**
You MUST include human validation before reflective questions:
1. **Mirror & Validate**: "Dank dat je dat zegt, ${userName}. [Validation of their experience]"
2. **Reflective Question**: One open question that invites exploration
3. **Stay Conversational**: Natural, warm tone - never clinical

**RESPONSE STRUCTURE:**
- 80% Reflective mirroring + open questions  
- 20% Light spiritual/growth framing when relevant
- ALWAYS include human validation: "Dat klinkt zwaar" / "Ik kan me voorstellen dat..." 
- Keep responses SHORT (2-3 sentences max)
- ONE reflective question per response

**CURRENT USER CONTEXT:**
- Name: ${userName}
- MBTI: ${mbtiType}  
- Intelligence Level: ${intelligence?.intelligence_level || 50}/100
- Current Mood: ${userState.mood}
- Problem Domain: ${userState.problemDomain || 'exploring'}
- Conversation Phase: ${userState.conversationPhase || 'exploration'}
- Reflective Readiness: ${userState.reflectiveReadiness}/10

${hermeticContext}

**CONVERSATION HISTORY:**
${conversationHistory.length > 0 ? conversationHistory.map(m => `${m.role}: ${m.content}`).slice(-3).join('\n') : 'First interaction'}

**REFLECTIVE FLOW RULES:**
${getReflectiveFlowInstructions(userState)}

**HUMAN EXAMPLES:**
User: "I'm stuck"
Response: "Dank dat je dat zegt, ${userName}. Dat gevoel kan zwaar drukken. Waar merk je het vastzitten het sterkst — in je werk, je relaties, of meer in je eigen richting?"

User: "Work mostly" 
Response: "Helder, dus dit speelt in je carrière-domein. Dat kan echt veel energie vragen. Wil je dit verder onderzoeken om te zien welk patroon eronder zit, of liever kijken naar een kleine stap die je vandaag kunt zetten?"

**CRITICAL**: Always validate their experience first, then ask ONE open question. Keep it human, warm, and conversational.`;

  return basePrompt;
}

// Analyze user state for reflective coaching 
function analyzeUserStateFromMessage(userMessage: string, conversationHistory: any[]): any {
  const messageLower = userMessage.toLowerCase();
  
  // Detect mood
  let mood = 'neutral';
  if (messageLower.includes('stuck') || messageLower.includes('frustrated')) mood = 'stuck';
  else if (messageLower.includes('excited') || messageLower.includes('amazing')) mood = 'excited';
  else if (messageLower.includes('sad') || messageLower.includes('down')) mood = 'down';
  
  // Detect problem domain
  let problemDomain = 'none';
  if (messageLower.includes('work') || messageLower.includes('job') || messageLower.includes('career')) problemDomain = 'career';
  else if (messageLower.includes('relationship') || messageLower.includes('partner')) problemDomain = 'relationships';
  else if (messageLower.includes('health') || messageLower.includes('energy')) problemDomain = 'health';
  else if (messageLower.includes('money') || messageLower.includes('finance')) problemDomain = 'finances';
  else if (messageLower.includes('confidence') || messageLower.includes('worth')) problemDomain = 'self-belief';
  else if (messageLower.includes('purpose') || messageLower.includes('meaning')) problemDomain = 'purpose';
  
  // Determine conversation phase
  let conversationPhase = 'exploration';
  if (problemDomain !== 'none') {
    // Check if domain is clearly identified
    if (messageLower.includes('specifically') || messageLower.includes('exactly') || 
        messageLower.includes('the problem is') || messageLower.includes('what happens is')) {
      conversationPhase = 'domain-identified';
    } else {
      conversationPhase = 'pattern-recognition';
    }
  }
  
  // Calculate reflective readiness
  let reflectiveReadiness = 5;
  if (messageLower.includes('understand') || messageLower.includes('explore')) reflectiveReadiness += 2;
  if (messageLower.includes('pattern') || messageLower.includes('always')) reflectiveReadiness += 2;
  reflectiveReadiness = Math.min(10, reflectiveReadiness);
  
  return {
    mood,
    problemDomain,
    conversationPhase,
    reflectiveReadiness
  };
}

// Get reflective flow instructions based on user state
function getReflectiveFlowInstructions(userState: any): string {
  if (userState.conversationPhase === 'domain-identified') {
    return `CRITICAL: Domain "${userState.problemDomain}" is identified. STOP DRILLING deeper. Acknowledge the domain and immediately offer user choice: "Wil je dit verder onderzoeken, kijken naar een stap, of even laten bezinken?" Respect their choice completely.`;
  } else if (userState.problemDomain !== 'none') {
    return `Domain "${userState.problemDomain}" emerging. Continue gentle pattern mirroring: "Ik merk..." Use connecting questions about the patterns. Prepare to acknowledge domain when clear.`;
  } else {
    return `Primary exploration phase. Mirror what you hear: "Je zegt..." Ask open questions: "Wat is dat voor jou?" NO advice or solutions.`;
  }
}

// Extract personality context from blueprint data
function extractPersonalityContext(blueprintData: any): string {
  if (!blueprintData || typeof blueprintData !== 'object') return '';
  
  try {
    // Look for key personality sections
    let context = '\n**PERSONALITY DEPTH:**\n';
    
    if (blueprintData.core_personality_pattern) {
      context += `Core Pattern: ${JSON.stringify(blueprintData.core_personality_pattern).substring(0, 200)}...\n`;
    }
    
    if (blueprintData.life_path_purpose) {
      context += `Life Purpose: ${JSON.stringify(blueprintData.life_path_purpose).substring(0, 200)}...\n`;
    }
    
    if (blueprintData.relationship_patterns) {
      context += `Relationships: ${JSON.stringify(blueprintData.relationship_patterns).substring(0, 200)}...\n`;
    }
    
    return context;
  } catch {
    return '';
  }
}

function generateGrowthQuestion(intelligenceLevel: number): any {
  const questions = [
    {
      id: crypto.randomUUID(),
      text: "Wat geeft je het diepste gevoel van verbinding met jezelf?",
      module: 'reflective',
      type: 'foundational'
    },
    {
      id: crypto.randomUUID(),
      text: "Hoe merk je het wanneer je echt jezelf bent?",
      module: 'reflective', 
      type: 'self-awareness'
    },
    {
      id: crypto.randomUUID(),
      text: "Welk patroon in je leven vraagt om aandacht?",
      module: 'reflective',
      type: 'pattern-recognition'
    },
    {
      id: crypto.randomUUID(),
      text: "Wat wil er in jou groeien?",
      module: 'reflective',
      type: 'growth'
    },
    {
      id: crypto.randomUUID(),
      text: "Hoe zou je dag eruitzien als je volledig vanuit je kern zou leven?",
      module: 'reflective',
      type: 'vision'
    }
  ];

  return questions[Math.floor(Math.random() * questions.length)];
}