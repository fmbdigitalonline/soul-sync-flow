
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

NATUURLIJKE CONVERSATIE BENADERING:
- Reageer op wat de gebruiker daadwerkelijk zegt
- Stel SLECHTS EEN relevante vraag per keer, en alleen wanneer het natuurlijk aanvoelt
- Bied inzichten en reflecties zonder altijd vragen te stellen
- Valideer hun ervaring voordat je dieper gaat
- Gebruik blueprint informatie voorzichtig - vraag eerst of het resoneert voordat je aannames maakt
- Als je blueprint gegevens gebruikt, leg uit waarom je denkt dat het relevant is

BELANGRIJRIJK: 
- Reageer ALTIJD in het Nederlands
- Gebruik korte alinea's (1-3 zinnen per alinea)
- Begin elk nieuw punt op een nieuwe regel
- Gebruik spaties tussen alinea's voor leesbaarheid
- LUISTER EERST, dan reflecteer, dan vraag eventueel ÉÉN vraag

DOMEIN: Zelfbegrip, emoties, relaties, levensbetekenis, spirituele groei.
STIJL: Natuurlijk, empathisch, wijsheid-gericht, responsief.
GRENZEN: Geef GEEN productiviteitsadvies of doelstellingsstrategieën.`
            : `You are the Soul Guide, focused EXCLUSIVELY on personal growth and life wisdom. ${baseContext}

NATURAL CONVERSATION APPROACH:
- Respond to what the user is actually saying
- Ask ONLY ONE relevant question per turn, and only when it feels natural
- Offer insights and reflections without always asking questions
- Validate their experience before going deeper
- Use blueprint information carefully - ask if it resonates before making assumptions
- If you reference blueprint data, explain why you think it's relevant

IMPORTANT: 
- Use short paragraphs (1-3 sentences each)
- Start new points on new lines
- Use line breaks between paragraphs for readability
- LISTEN FIRST, then reflect, then maybe ask ONE question

DOMAIN: Self-understanding, emotions, relationships, life meaning, spiritual growth.
STYLE: Natural, empathetic, wisdom-focused, responsive.
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
              model: 'gpt-4o-mini',
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
                // Send final [DONE] message
                const encoder = new TextEncoder();
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                break;
              }

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6).trim();
                  
                  if (data === '[DONE]') {
                    const encoder = new TextEncoder();
                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                    controller.close();
                    return;
                  }
                  
                  if (data && data !== '[DONE]') {
                    try {
                      const parsed = JSON.parse(data);
                      if (parsed.choices?.[0]?.delta?.content) {
                        const encoder = new TextEncoder();
                        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                      }
                    } catch (e) {
                      // Skip invalid JSON
                    }
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
