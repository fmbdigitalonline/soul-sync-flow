
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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
      contextDepth = 'normal', // New parameter for model selection
      userDisplayName = 'friend'
    } = await req.json();

    console.log('AI Coach request:', {
      agentType,
      messageLength: message?.length,
      userId: userId?.substring(0, 8) + '...',
      sessionId,
      includeBlueprint,
      hasCustomPrompt: !!systemPrompt,
      language,
      contextDepth,
      acsTemperature: temperature,
      acsMaxTokens: maxTokens
    });

    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      const errorMessage = language === 'nl' ? 'OpenAI API sleutel niet geconfigureerd' : 'OpenAI API key not configured';
      throw new Error(errorMessage);
    }

    // Layered model selection based on context
    const selectModel = (agentType: string, contextDepth: string, includeBlueprint: boolean) => {
      // Core Brain Layer - deep personality integration
      if (includeBlueprint && (contextDepth === 'deep' || agentType === 'guide')) {
        console.log('🧠 Using Core Brain Layer: gpt-4o for personality integration');
        return 'gpt-4o';
      }
      
      // Exploration Coach Layer - emotional themes and onboarding
      if (agentType === 'coach' && contextDepth === 'emotional') {
        console.log('🧭 Using Exploration Coach Layer: gpt-4o for emotional themes');
        return 'gpt-4o';
      }
      
      // Default to cost-effective model for routine interactions
      console.log('⚡ Using optimized model: gpt-4o-mini for routine interactions');
      return 'gpt-4o-mini';
    };

    const selectedModel = selectModel(agentType, contextDepth, includeBlueprint);

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

    // Dynamic parameter selection based on model
    const finalTemperature = temperature !== undefined ? temperature : (selectedModel === 'gpt-4o' ? 0.7 : 0.5);
    const finalMaxTokens = maxTokens !== undefined ? maxTokens : (selectedModel === 'gpt-4o' ? 1500 : 1000);

    console.log('🎯 Using layered model strategy:', {
      model: selectedModel,
      temperature: finalTemperature,
      maxTokens: finalMaxTokens,
      reasoning: `${agentType} + ${contextDepth} + blueprint:${includeBlueprint}`
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
        temperature: finalTemperature,
        max_tokens: finalMaxTokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      const errorMessage = language === 'nl' ? `OpenAI API fout: ${response.status}` : `OpenAI API error: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      const errorMessage = language === 'nl' ? 'Geen reactie van OpenAI' : 'No response from OpenAI';
      throw new Error(errorMessage);
    }

    console.log('✅ AI Coach response generated successfully with layered model strategy');

    return new Response(
      JSON.stringify({
        response: aiResponse,
        conversationId: sessionId,
        modelUsed: selectedModel,
        tokensUsed: finalMaxTokens
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in AI Coach function:', error);
    
    return new Response(
      JSON.stringify({
        error: (error instanceof Error ? error.message : String(error)) || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
