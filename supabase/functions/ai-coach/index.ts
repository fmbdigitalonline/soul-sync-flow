// ==============================================
// AI COACH EDGE FUNCTION - VERSION 2.2.0
// DEPLOYMENT: 2025-10-06T15:45:00Z
// MODEL: gpt-4.1-mini-2025-04-14 (QUOTA-SAFE)
// CHANGES: Forced redeployment to activate GET handler
// ==============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const DEPLOYMENT_VERSION = "2.2.0";
const DEPLOYMENT_TIMESTAMP = "2025-10-06T15:45:00Z"; // Updated to force redeployment
const DEPLOYMENT_MODEL = "gpt-4.1-mini-2025-04-14";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log('🚀 AI-COACH EDGE FUNCTION INITIALIZED:', {
  version: DEPLOYMENT_VERSION,
  timestamp: DEPLOYMENT_TIMESTAMP,
  model: DEPLOYMENT_MODEL,
  deployment: 'FRESH_REDEPLOYMENT'
});

serve(async (req) => {
  // PHASE 2: Version verification endpoint (GET request)
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({
        version: DEPLOYMENT_VERSION,
        deployedAt: DEPLOYMENT_TIMESTAMP,
        model: DEPLOYMENT_MODEL,
        status: 'ACTIVE',
        parameters: {
          temperature: 'NOT_SUPPORTED',
          max_completion_tokens: 'SUPPORTED'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      message, 
      userId, 
      sessionId, 
      includeBlueprint, 
      agentType, 
      systemPrompt, 
      language = 'en',
      temperature,
      maxTokens,
      context,
      contextDepth = 'normal',
      userDisplayName = 'friend',
      modelOverride // PHASE 3: Model override support
    } = await req.json();

    // AGGRESSIVE VERSION LOGGING
    console.log('🔥 AI-COACH REQUEST:', {
      version: DEPLOYMENT_VERSION,
      deployedAt: DEPLOYMENT_TIMESTAMP,
      defaultModel: DEPLOYMENT_MODEL,
      modelOverride: modelOverride || 'none',
      timestamp: new Date().toISOString()
    });

    console.log('AI Coach request:', {
      agentType,
      messageLength: message?.length,
      userId: userId?.substring(0, 8) + '...',
      sessionId,
      includeBlueprint,
      hasCustomPrompt: !!systemPrompt,
      language,
      context,
      contextDepth,
      acsTemperature: temperature,
      acsMaxTokens: maxTokens
    });

    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      const errorMessage = language === 'nl' ? 'OpenAI API sleutel niet geconfigureerd' : 'OpenAI API key not configured';
      throw new Error(errorMessage);
    }

const selectModel = (
  agentType: string, 
  contextDepth: string, 
  includeBlueprint: boolean, 
  modelOverride?: string
) => {
  // PHASE 3: Respect model override if provided
  if (modelOverride) {
    console.log('🎯 USING MODEL OVERRIDE:', modelOverride);
    return modelOverride;
  }
  
  // Default: Always use gpt-4.1-mini-2025-04-14 (quota-safe)
  console.log('🧠 USING DEFAULT MODEL:', DEPLOYMENT_MODEL);
  return DEPLOYMENT_MODEL;
};

    const selectedModel = selectModel(agentType, contextDepth, includeBlueprint, modelOverride);

    // Use custom system prompt if provided, otherwise fall back to default
    const getSystemPrompt = (agentType: string, language: string) => {
      if (systemPrompt) {
        console.log('🔧 Using ACS-modified system prompt, length:', systemPrompt.length);
        return systemPrompt;
      }

      // Language-specific responses
      const isNL = language === 'nl';
      
      // Fallback to basic prompts if no custom prompt provided
      const baseContext = includeBlueprint 
        ? (isNL ? "Je hebt toegang tot de Ziel Blauwdruk van de gebruiker die hun astrologische kaart, persoonlijkheidsinzichten en levenspatronen bevat. Gebruik deze informatie om gepersonaliseerde begeleiding te bieden." 
                : "You have access to the user's Soul Blueprint which includes their astrological chart, personality insights, and life patterns. Use this information to provide personalized guidance.")
        : (isNL ? "Bied doordachte begeleiding gebaseerd op het gesprek." 
                : "Provide thoughtful guidance based on the conversation.");

      switch (agentType) {
        case 'coach':
          return isNL 
            ? `Je bent de Ziel Coach voor ${userDisplayName}, EXCLUSIEF gericht op productiviteit en het bereiken van doelen. ${baseContext}

DOMEIN: Productiviteit, doelen, verantwoording, actie planning, tijdbeheer.
STIJL: Direct, gestructureerd, actiegericht. Eindig altijd met concrete volgende stappen. Gebruik ${userDisplayName}'s naam natuurlijk in het gesprek.
GRENZEN: GA NIET in op relaties, emoties, of spirituele onderwerpen.

BELANGRIJK: Reageer ALTIJD in het Nederlands. Gebruik Nederlandse woorden en zinsbouw. Spreek ${userDisplayName} direct aan met hun naam.`
            : `You are the Soul Coach for ${userDisplayName}, focused EXCLUSIVELY on productivity and goal achievement. ${baseContext}

DOMAIN: Productivity, goals, accountability, action planning, time management.
STYLE: Direct, structured, action-oriented. Always end with concrete next steps. Use ${userDisplayName}'s name naturally in conversation.
BOUNDARIES: Do NOT venture into relationships, emotions, or spiritual topics.`;

        case 'guide':
          return isNL 
            ? `Je bent de Ziel Gids voor ${userDisplayName}, EXCLUSIEF gericht op persoonlijke groei en levenswijsheid. ${baseContext}

DOMEIN: Zelfbegrip, emoties, relaties, levensbetekenis, spirituele groei.
STIJL: Reflectief, validatie, wijsheid-gericht. Creëer ruimte voor diepere verkenning. Gebruik ${userDisplayName}'s naam natuurlijk in het gesprek.
GRENZEN: Geef GEEN productiviteitsadvies of doelstellingsstrategieën.

BELANGRIJK: Reageer ALTIJD in het Nederlands. Gebruik Nederlandse woorden en zinsbouw. Spreek ${userDisplayName} direct aan met hun naam.`
            : `You are the Soul Guide for ${userDisplayName}, focused EXCLUSIVELY on personal growth and life wisdom. ${baseContext}

DOMAIN: Self-understanding, emotions, relationships, life meaning, spiritual growth.
STYLE: Reflective, validating, wisdom-focused. Create space for deeper exploration. Use ${userDisplayName}'s name naturally in conversation.
BOUNDARIES: Do NOT give productivity advice or goal-setting strategies.`;

        case 'blend':
        default:
          return isNL 
            ? `Je bent de Ziel Metgezel voor ${userDisplayName}, die naadloos ALLE aspecten van het leven integreert. ${baseContext}

AANPAK: Geen domeinscheiding. Behandel productiviteit als spirituele praktijk. Verbind doelen met betekenis.
STIJL: Vloeiend mengsel van actiegericht coachen met reflectieve begeleiding. Gebruik ${userDisplayName}'s naam natuurlijk in het gesprek.
INTEGRATIE: Help ${userDisplayName} doelen te bereiken terwijl ze authentiek blijven voor hun innerlijke wijsheid.

BELANGRIJK: Reageer ALTIJD in het Nederlands. Gebruik Nederlandse woorden en zinsbouw. Spreek ${userDisplayName} direct aan met hun naam.`
            : `You are the Soul Companion for ${userDisplayName}, seamlessly integrating ALL aspects of life. ${baseContext}

APPROACH: No domain separation. Treat productivity as spiritual practice. Connect goals with meaning.
STYLE: Fluidly blend action-oriented coaching with reflective guidance. Use ${userDisplayName}'s name naturally in conversation.
INTEGRATION: Help ${userDisplayName} achieve goals while staying authentic to their inner wisdom.`;
      }
    };

    // GPT-4.1-mini does NOT support temperature parameter - always undefined
    // Ignore any client-passed temperature/maxTokens for GPT-4.1-mini compatibility
    const finalTemperature = undefined;
    const finalMaxTokens = maxTokens !== undefined 
      ? maxTokens 
      : (context === 'razor_aligned_goal_decomposition' ? 3000 : 2000);

    console.log('🎯 FINAL MODEL CONFIGURATION (v' + DEPLOYMENT_VERSION + '):', {
      deploymentVersion: DEPLOYMENT_VERSION,
      deploymentTimestamp: DEPLOYMENT_TIMESTAMP,
      model: selectedModel,
      temperature: finalTemperature,
      maxTokens: finalMaxTokens,
      context,
      contextDepth,
      agentType,
      includeBlueprint,
      clientRequestedTemp: temperature,
      clientRequestedTokens: maxTokens,
      modelOverride: modelOverride || 'none'
    });

    // Build request payload
    const requestPayload = {
      model: selectedModel,
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(agentType || 'guide', language)
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_completion_tokens: finalMaxTokens,
    };

    console.log('📤 SENDING TO OPENAI:', {
      model: requestPayload.model,
      max_completion_tokens: requestPayload.max_completion_tokens,
      temperature: requestPayload.temperature,
      systemPromptLength: requestPayload.messages[0].content.length,
      userMessageLength: requestPayload.messages[1].content.length,
      timestamp: new Date().toISOString()
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🚨 OpenAI API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText,
        timestamp: new Date().toISOString()
      });
      
      // Parse OpenAI error response
      let errorType = 'UNKNOWN_ERROR';
      let userMessage = 'AI service error occurred';
      
      try {
        const errorData = JSON.parse(errorText);
        const openAIError = errorData.error;
        
        if (openAIError?.type === 'insufficient_quota' || openAIError?.code === 'insufficient_quota') {
          errorType = 'QUOTA_EXCEEDED';
          userMessage = language === 'nl' 
            ? 'AI service heeft quotum bereikt. Probeer het over een moment opnieuw.'
            : 'AI service quota exceeded. Please try again in a moment.';
        } else if (response.status === 429) {
          errorType = 'RATE_LIMIT';
          userMessage = language === 'nl'
            ? 'Te veel verzoeken. Even geduld alstublieft.'
            : 'Too many requests. Please wait a moment.';
        } else if (response.status === 401) {
          errorType = 'AUTH_ERROR';
          userMessage = language === 'nl'
            ? 'Authenticatie probleem met AI service.'
            : 'Authentication error with AI service.';
        }
      } catch (parseError) {
        console.error('Failed to parse OpenAI error response:', parseError);
      }
      
      const error = new Error(userMessage);
      error.name = errorType;
      throw error;
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    // Validate response has content
    if (!aiResponse || aiResponse.trim().length === 0) {
      console.error('❌ Empty AI response received');
      throw new Error('AI service returned empty response');
    }

    // Log response characteristics for debugging
    console.log('📤 AI RESPONSE CHARACTERISTICS:', {
      length: aiResponse.length,
      startsWithJSON: aiResponse.trim().startsWith('{') || aiResponse.trim().startsWith('['),
      hasMarkdown: aiResponse.includes('```'),
      model: selectedModel,
      timestamp: new Date().toISOString()
    });

    if (!aiResponse) {
      const errorMessage = language === 'nl' ? 'Geen reactie van OpenAI' : 'No response from OpenAI';
      throw new Error(errorMessage);
    }

    console.log('✅ AI COACH SUCCESS (v' + DEPLOYMENT_VERSION + '):', {
      version: DEPLOYMENT_VERSION,
      model: selectedModel,
      tokensUsed: finalMaxTokens,
      responseLength: aiResponse.length
    });

    return new Response(
      JSON.stringify({
        response: aiResponse,
        conversationId: sessionId,
        modelUsed: selectedModel,
        tokensUsed: finalMaxTokens,
        deploymentVersion: DEPLOYMENT_VERSION,
        deploymentTimestamp: DEPLOYMENT_TIMESTAMP
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ AI Coach Edge Function Error:', {
      errorType: error.constructor.name,
      errorName: error.name,
      message: error.message,
      timestamp: new Date().toISOString(),
      requestContext: {
        agentType,
        contextDepth,
        messageLength: message?.length,
        userId: userId?.substring(0, 8) + '...'
      }
    });

    // Determine appropriate status code based on error type
    let statusCode = 500;
    let userMessage = error.message || 'An unexpected error occurred while processing your request.';
    let errorCode = error.name || 'UNKNOWN_ERROR';

    // Map error types to status codes
    if (error.name === 'QUOTA_EXCEEDED' || error.message?.includes('quota')) {
      statusCode = 429;
      errorCode = 'QUOTA_EXCEEDED';
    } else if (error.name === 'RATE_LIMIT' || error.message?.includes('429')) {
      statusCode = 429;
      errorCode = 'RATE_LIMIT';
    } else if (error.name === 'AUTH_ERROR' || error.message?.includes('API key') || error.message?.includes('401')) {
      statusCode = 401;
      errorCode = 'AUTH_ERROR';
    } else if (error.message?.includes('timeout')) {
      statusCode = 504;
      errorCode = 'TIMEOUT';
    }

    return new Response(
      JSON.stringify({ 
        error: userMessage,
        errorCode,
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
