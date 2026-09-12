// ==============================================
// AI COACH EDGE FUNCTION - VERSION 2.2.0
// DEPLOYMENT: 2025-10-06T15:45:00Z
// MODEL: the shared CHAT_MODEL (QUOTA-SAFE)
// CHANGES: Forced redeployment to activate GET handler
// ==============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { callChatCompletion } from "../_shared/azure-openai.ts";
import { CHAT_MODEL } from '../_shared/model.ts';

const DEPLOYMENT_VERSION = "2.2.0";
const DEPLOYMENT_TIMESTAMP = "2025-10-06T15:45:00Z"; // Updated to force redeployment
const DEPLOYMENT_MODEL = CHAT_MODEL;

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

    // Azure/OpenAI routing handled by shared helper

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
  
  // Default: Always use the shared CHAT_MODEL (quota-safe)
  console.log('🧠 USING DEFAULT MODEL:', DEPLOYMENT_MODEL);
  return DEPLOYMENT_MODEL;
};

    const selectedModel = selectModel(agentType, contextDepth, includeBlueprint, modelOverride);

    // Machine contexts. These are not conversations: they must emit raw JSON,
    // and the persona prompts actively fight that (the 'guide' persona refuses
    // planning work outright; the 'coach' persona demands numbered prose).
    const DECOMPOSITION_CONTEXT = 'razor_aligned_goal_decomposition';
    const JSON_REPAIR_CONTEXT = 'json_repair_utility';
    const isDecomposition = context === DECOMPOSITION_CONTEXT;
    const isJsonRepair = context === JSON_REPAIR_CONTEXT;
    const isMachineContext = isDecomposition || isJsonRepair;

    const MACHINE_PROMPT = isDecomposition
      ? `You are a goal-decomposition engine. You convert a dream plus its owner's personality context into a plan as JSON.
Rules:
- Output JSON only. No prose, no markdown fences, no commentary.
- Follow the field names, counts and constraints stated in the user message exactly.
- Every domain is in scope — work, relationships, health, money, spirituality. Never refuse or redirect.
- Write the human-readable values (titles, descriptions) in the language of the user message.`
      : `You repair malformed JSON. Return the corrected JSON object only: no prose, no markdown fences, no commentary. Preserve every value; change syntax only.`;

    // Use custom system prompt if provided, otherwise fall back to default
    const getSystemPrompt = (agentType: string, language: string) => {
      if (isMachineContext) {
        console.log(`🔧 Machine context "${context}" — using dedicated JSON prompt`);
        return MACHINE_PROMPT;
      }

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

      const formattingRules = `\n\nCRITICAL FORMATTING RULES:
When providing task breakdowns or work instructions, you MUST use this exact format:

1. **[Clear Action Title]**:
   Detailed description of what the user needs to do. Be specific and actionable.
   Include time estimates if relevant (e.g., "~15 minutes").
   
2. **[Next Action Title]**:
   Description...

NEVER:
- Ask "Would you like me to..." questions
- Use conversational phrases like "Here are some suggestions"
- Provide unstructured bullet points

ALWAYS:
- Use numbered lists (1., 2., 3.)
- Bold titles with **Title**
- Add colon after title
- Provide substantial details for each step
- Give 4-6 concrete steps`;

      switch (agentType) {
        case 'coach':
          return isNL 
            ? `Je bent de Ziel Coach voor ${userDisplayName}, EXCLUSIEF gericht op productiviteit en het bereiken van doelen. ${baseContext}

DOMEIN: Productiviteit, doelen, verantwoording, actie planning, tijdbeheer.
STIJL: Direct, gestructureerd, actiegericht. Eindig altijd met concrete volgende stappen. Gebruik ${userDisplayName}'s naam natuurlijk in het gesprek.
GRENZEN: GA NIET in op relaties, emoties, of spirituele onderwerpen.${formattingRules}

BELANGRIJK: Reageer ALTIJD in het Nederlands. Gebruik Nederlandse woorden en zinsbouw. Spreek ${userDisplayName} direct aan met hun naam.`
            : `You are the Soul Coach for ${userDisplayName}, focused EXCLUSIVELY on productivity and goal achievement. ${baseContext}

DOMAIN: Productivity, goals, accountability, action planning, time management.
STYLE: Direct, structured, action-oriented. Always end with concrete next steps. Use ${userDisplayName}'s name naturally in conversation.
BOUNDARIES: Do NOT venture into relationships, emotions, or spiritual topics.${formattingRules}`;

        case 'guide':
          return isNL 
            ? `Je bent de Ziel Gids voor ${userDisplayName}, EXCLUSIEF gericht op persoonlijke groei en levenswijsheid. ${baseContext}

DOMEIN: Zelfbegrip, emoties, relaties, levensbetekenis, spirituele groei.
STIJL: Reflectief, validatie, wijsheid-gericht. Creëer ruimte voor diepere verkenning. Gebruik ${userDisplayName}'s naam natuurlijk in het gesprek.
GRENZEN: Geef GEEN productiviteitsadvies of doelstellingsstrategieën.${formattingRules}

BELANGRIJK: Reageer ALTIJD in het Nederlands. Gebruik Nederlandse woorden en zinsbouw. Spreek ${userDisplayName} direct aan met hun naam.`
            : `You are the Soul Guide for ${userDisplayName}, focused EXCLUSIVELY on personal growth and life wisdom. ${baseContext}

DOMAIN: Self-understanding, emotions, relationships, life meaning, spiritual growth.
STYLE: Reflective, validating, wisdom-focused. Create space for deeper exploration. Use ${userDisplayName}'s name naturally in conversation.
BOUNDARIES: Do NOT give productivity advice or goal-setting strategies.${formattingRules}`;

        case 'blend':
        default:
          return isNL 
            ? `Je bent de Ziel Metgezel voor ${userDisplayName}, die naadloos ALLE aspecten van het leven integreert. ${baseContext}

AANPAK: Geen domeinscheiding. Behandel productiviteit als spirituele praktijk. Verbind doelen met betekenis.
STIJL: Vloeiend mengsel van actiegericht coachen met reflectieve begeleiding. Gebruik ${userDisplayName}'s naam natuurlijk in het gesprek.
INTEGRATIE: Help ${userDisplayName} doelen te bereiken terwijl ze authentiek blijven voor hun innerlijke wijsheid.${formattingRules}

BELANGRIJK: Reageer ALTIJD in het Nederlands. Gebruik Nederlandse woorden en zinsbouw. Spreek ${userDisplayName} direct aan met hun naam.`
            : `You are the Soul Companion for ${userDisplayName}, seamlessly integrating ALL aspects of life. ${baseContext}

APPROACH: No domain separation. Treat productivity as spiritual practice. Connect goals with meaning.
STYLE: Fluidly blend action-oriented coaching with reflective guidance. Use ${userDisplayName}'s name naturally in conversation.
INTEGRATION: Help ${userDisplayName} achieve goals while staying authentic to their inner wisdom.${formattingRules}`;
      }
    };

    // Reasoning models reject temperature outright — always undefined.
    const finalTemperature = undefined;

    // Machine contexts own their budget server-side. The client used to send
    // maxTokens: 5000 for decomposition; the model's own reasoning consumed the
    // whole of it and returned empty content, which surfaced as a generic 500.
    // This endpoint has verify_jwt off, so a client-supplied ceiling is also a
    // cost lever we should not hand out.
    const DECOMPOSITION_BUDGET = 16000;
    const JSON_REPAIR_BUDGET = 8000;
    const finalMaxTokens = isDecomposition
      ? DECOMPOSITION_BUDGET
      : isJsonRepair
        ? JSON_REPAIR_BUDGET
        : (maxTokens !== undefined ? maxTokens : 2000);

    // Fixed-shape JSON out: no deliberation wanted, and deliberation is what
    // ate the budget. `structured` maps to reasoning_effort 'none', which the
    // shared helper now sends explicitly.
    const task = isMachineContext ? 'structured' : 'chat';

    // Structured Outputs. Prompt-only "return JSON" is advisory; a strict
    // schema is enforced by the provider.
    const strArray = { type: 'array', items: { type: 'string' } };
    const decompositionSchema = {
      type: 'json_schema',
      json_schema: {
        name: 'goal_decomposition',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['milestones', 'tasks', 'blueprint_insights'],
          properties: {
            milestones: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['id', 'title', 'description', 'target_date', 'completed', 'completion_criteria', 'blueprint_alignment'],
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  target_date: { type: 'string' },
                  completed: { type: 'boolean' },
                  completion_criteria: strArray,
                  blueprint_alignment: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['addresses_patterns', 'leverages_strengths', 'optimal_timing'],
                    properties: {
                      addresses_patterns: strArray,
                      leverages_strengths: strArray,
                      optimal_timing: { type: 'string' },
                    },
                  },
                },
              },
            },
            tasks: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['id', 'title', 'description', 'milestone_id', 'completed', 'estimated_duration', 'energy_level_required', 'category', 'optimal_timing', 'blueprint_reasoning', 'prerequisites'],
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  milestone_id: { type: 'string' },
                  completed: { type: 'boolean' },
                  estimated_duration: { type: 'string' },
                  energy_level_required: { type: 'string', enum: ['low', 'medium', 'high'] },
                  category: { type: 'string' },
                  optimal_timing: { type: 'string' },
                  blueprint_reasoning: { type: 'string' },
                  prerequisites: strArray,
                },
              },
            },
            blueprint_insights: strArray,
          },
        },
      },
    };
    const responseFormat = isDecomposition
      ? decompositionSchema
      : isJsonRepair
        ? { type: 'json_object' }
        : undefined;


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
      systemPromptLength: requestPayload.messages[0].content.length,
      userMessageLength: requestPayload.messages[1].content.length,
      timestamp: new Date().toISOString()
    });

    const response = await callChatCompletion({
      messages: requestPayload.messages,
      model: requestPayload.model,
      max_tokens: requestPayload.max_completion_tokens,
      task,
      ...(responseFormat ? { response_format: responseFormat } : {}),
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
    const choice = data.choices?.[0];
    const aiResponse = choice?.message?.content;
    const finishReason = choice?.finish_reason;
    const usage = data.usage;

    // The provider tells us exactly why an answer is short or absent. Logging
    // it is the difference between "empty response" and a diagnosis.
    console.log('🧾 COMPLETION ACCOUNTING:', {
      finishReason,
      contentLength: aiResponse?.length ?? 0,
      maxCompletionTokens: finalMaxTokens,
      promptTokens: usage?.prompt_tokens,
      completionTokens: usage?.completion_tokens,
      reasoningTokens: usage?.completion_tokens_details?.reasoning_tokens,
      task,
      context,
    });

    // Budget exhaustion covers BOTH shapes: nothing written at all, and a
    // half-written JSON object. Truncated JSON must never reach the healer —
    // it cannot invent the missing milestones.
    if (finishReason === 'length' || !aiResponse || aiResponse.trim().length === 0) {
      const detail = `finish_reason=${finishReason ?? 'none'} content=${aiResponse?.length ?? 0} chars, budget=${finalMaxTokens}, completion_tokens=${usage?.completion_tokens ?? 'unknown'}, reasoning_tokens=${usage?.completion_tokens_details?.reasoning_tokens ?? 'unknown'}`;
      console.error('❌ OUTPUT BUDGET EXHAUSTED:', detail);
      const error = new Error(
        language === 'nl'
          ? `Het antwoord paste niet binnen de ruimte (${detail}).`
          : `The answer did not fit within the output budget (${detail}).`
      );
      error.name = 'OUTPUT_BUDGET_EXHAUSTED';
      throw error;
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
    const err = error as Error;
    console.error('❌ AI Coach Edge Function Error:', {
      errorType: err.constructor?.name || 'Unknown',
      errorName: err.name,
      message: err.message,
      timestamp: new Date().toISOString()
    });

    // Determine appropriate status code based on error type
    let statusCode = 500;
    let userMessage = err.message || 'An unexpected error occurred while processing your request.';
    let errorCode = err.name || 'UNKNOWN_ERROR';

    // Map error types to status codes
    if (err.name === 'QUOTA_EXCEEDED' || err.message?.includes('quota')) {
      statusCode = 429;
      errorCode = 'QUOTA_EXCEEDED';
    } else if (err.name === 'RATE_LIMIT' || err.message?.includes('429')) {
      statusCode = 429;
      errorCode = 'RATE_LIMIT';
    } else if (err.name === 'AUTH_ERROR' || err.message?.includes('API key') || err.message?.includes('401')) {
      statusCode = 401;
      errorCode = 'AUTH_ERROR';
    } else if (err.message?.includes('timeout')) {
      statusCode = 504;
      errorCode = 'TIMEOUT';
    }

    return new Response(
      JSON.stringify({ 
        error: userMessage,
        errorCode,
        details: err.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
