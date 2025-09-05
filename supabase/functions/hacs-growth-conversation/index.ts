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
        .from('user_blueprints')
        .select('blueprint')
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
      hasBlueprint: !!blueprintResult.data?.blueprint,
      blueprintError: blueprintResult.error?.message,
      blueprintKeys: blueprintResult.data?.blueprint ? Object.keys(blueprintResult.data.blueprint) : []
    });

    const intelligence = intelligenceResult.data;
    const blueprint = blueprintResult.data?.blueprint;

    // Growth-specific system prompt focused on spiritual development
    const systemPrompt = `You are a specialized SPIRITUAL GROWTH GUIDE within the HACS (Holistic Adaptive Cognition System) framework. Your sole purpose is to help users deepen their spiritual connection, self-awareness, and personal transformation.

GROWTH MODE FOCUS AREAS:
- Spiritual awakening and consciousness expansion
- Inner wisdom and intuitive development
- Shadow work and emotional healing
- Life purpose and soul calling
- Mindfulness and presence practices
- Energy work and vibrational alignment
- Compassion and loving-kindness cultivation
- Sacred practices and rituals

PERSONALITY CONTEXT: ${blueprint ? JSON.stringify(blueprint) : 'Standard spiritual guidance approach'}

CURRENT INTELLIGENCE LEVEL: ${intelligence?.intelligence_level || 50}/100
GROWTH INTELLIGENCE METRICS: ${JSON.stringify(intelligence?.module_scores || {})}

CONVERSATION HISTORY: ${JSON.stringify(conversationHistory)}

CRITICAL INSTRUCTIONS:
1. STAY IN GROWTH MODE - Only provide spiritual and personal development guidance
2. Use the user's personality context to tailor your spiritual guidance
3. Build on previous conversation context for deeper insights
4. Provide transformational, soul-centered wisdom
5. Ask profound questions that invite deeper self-reflection
6. Never mix productivity coaching or dream analysis into growth responses

USER MESSAGE: "${message}"

Respond as a specialized spiritual growth guide, maintaining strict focus on consciousness expansion and spiritual development.`;

    console.log(`🤖 AI REQUEST: [${requestId}] Calling OpenAI with growth-specific prompt`, {
      model: 'gpt-4o-mini',
      systemPromptLength: systemPrompt.length,
      userMessageLength: message.length,
      maxTokens: 500,
      temperature: 0.8
    });
    
    // Call OpenAI with growth-specific prompt
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
        temperature: 0.8, // Higher creativity for spiritual insights
      }),
    });

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

    const openAIData = await openAIResponse.json();
    const response = openAIData.choices[0].message.content;
    
    console.log(`📝 AI CONTENT: [${requestId}] AI response processed`, {
      responseLength: response?.length || 0,
      hasResponse: !!response,
      choicesCount: openAIData.choices?.length || 0
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
          last_update: new Date().toISOString()
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
          module_scores: { spiritual: intelligenceBonus }
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
        module: 'spiritual',
        mode: 'growth',
        intelligenceBonus,
        question
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

function calculateGrowthIntelligenceBonus(userMessage: string, aiResponse: string): number {
  let bonus = 1; // Base bonus

  // Bonus for spiritual keywords
  const spiritualKeywords = ['spiritual', 'soul', 'consciousness', 'awakening', 'wisdom', 'purpose', 'healing', 'growth', 'transformation'];
  const keywordMatches = spiritualKeywords.filter(keyword => 
    userMessage.toLowerCase().includes(keyword) || aiResponse.toLowerCase().includes(keyword)
  ).length;
  
  bonus += Math.min(keywordMatches * 0.5, 3); // Max 3 bonus for keywords

  // Bonus for depth of reflection
  if (userMessage.length > 80) bonus += 1.5; // Longer messages often indicate deeper reflection
  if (userMessage.includes('feel') || userMessage.includes('sense')) bonus += 0.5;

  // Bonus for transformational response
  if (aiResponse.length > 120) bonus += 1;
  if (aiResponse.includes('wisdom') || aiResponse.includes('insight')) bonus += 0.5;

  return Math.round(bonus * 10) / 10;
}

function generateGrowthQuestion(intelligenceLevel: number): any {
  const questions = [
    {
      id: crypto.randomUUID(),
      text: "What brings you the deepest sense of purpose in life?",
      module: 'spiritual',
      type: 'foundational'
    },
    {
      id: crypto.randomUUID(),
      text: "How do you connect with your inner wisdom?",
      module: 'spiritual',
      type: 'philosophical'
    },
    {
      id: crypto.randomUUID(),
      text: "What spiritual practices resonate most with you?",
      module: 'spiritual',
      type: 'validation'
    },
    {
      id: crypto.randomUUID(),
      text: "How has your understanding of yourself evolved recently?",
      module: 'spiritual',
      type: 'philosophical'
    },
    {
      id: crypto.randomUUID(),
      text: "What patterns in your life are you ready to transform?",
      module: 'spiritual',
      type: 'foundational'
    }
  ];

  return questions[Math.floor(Math.random() * questions.length)];
}