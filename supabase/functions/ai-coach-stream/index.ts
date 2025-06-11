
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
    const { message, userId, sessionId, includeBlueprint, agentType, systemPrompt, language = 'en' } = await req.json();

    console.log('AI Coach streaming request:', {
      agentType,
      messageLength: message?.length,
      userId: userId?.substring(0, 8) + '...',
      sessionId,
      includeBlueprint,
      hasCustomPrompt: !!systemPrompt,
      language
    });

    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      const errorMessage = language === 'nl' ? 'OpenAI API sleutel niet geconfigureerd' : 'OpenAI API key not configured';
      throw new Error(errorMessage);
    }

    const getSystemPrompt = (agentType: string, language: string) => {
      if (systemPrompt) {
        return systemPrompt;
      }

      const isNL = language === 'nl';
      
      const baseContext = includeBlueprint 
        ? (isNL ? "Je hebt toegang tot de Ziel Blauwdruk van de gebruiker die hun astrologische kaart, persoonlijkheidsinzichten en levenspatronen bevat. Gebruik deze informatie om gepersonaliseerde begeleiding te bieden." 
                : "You have access to the user's Soul Blueprint which includes their astrological chart, personality insights, and life patterns. Use this information to provide personalized guidance.")
        : (isNL ? "Bied doordachte begeleiding gebaseerd op het gesprek." 
                : "Provide thoughtful guidance based on the conversation.");

      switch (agentType) {
        case 'guide':
          return isNL 
            ? `Je bent de Ziel Gids, EXCLUSIEF gericht op persoonlijke groei en levenswijsheid. ${baseContext}

DOMEIN: Zelfbegrip, emoties, relaties, levensbetekenis, spirituele groei.
STIJL: Reflectief, validatie, wijsheid-gericht. Creëer ruimte voor diepere verkenning.
GRENZEN: Geef GEEN productiviteitsadvies of doelstellingsstrategieën.

BELANGRIJK: Reageer ALTIJD in het Nederlands. Gebruik Nederlandse woorden en zinsbouw.`
            : `You are the Soul Guide, focused EXCLUSIVELY on personal growth and life wisdom. ${baseContext}

DOMAIN: Self-understanding, emotions, relationships, life meaning, spiritual growth.
STYLE: Reflective, validating, wisdom-focused. Create space for deeper exploration.
BOUNDARIES: Do NOT give productivity advice or goal-setting strategies.`;

        default:
          return baseContext;
      }
    };

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4-1106-preview',
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
              temperature: 0.7,
              max_tokens: 1000,
              stream: true,
            }),
          });

          if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('No response body');
          }

          const decoder = new TextDecoder();

          try {
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) {
                controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
                break;
              }

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data.trim() === '[DONE]') {
                    controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
                    controller.close();
                    return;
                  }
                  
                  try {
                    const parsed = JSON.parse(data);
                    if (parsed.choices?.[0]?.delta?.content) {
                      controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
                    }
                  } catch (e) {
                    // Skip invalid JSON
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in AI Coach streaming function:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
