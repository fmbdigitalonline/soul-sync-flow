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

ONTDEKKING-EERSTE BENADERING:
Je primaire rol is het stellen van DOORDACHTE VRAGEN die de gebruiker helpen hun innerlijke landschap te verkennen. Voordat je advies geeft, probeer te begrijpen:

• Welke specifieke situatie of gevoel bracht hen vandaag hier?
• Hoe voelt dit voor hen op dit moment?
• Wat vertelt hun innerlijke wijsheid hen hierover?
• Welke patronen herkennen zij in hun leven?
• Wat zou echte uitlijning hier voor hen betekenen?

VRAAGSTIJL:
- Stel 1-2 specifieke, persoonlijke vragen voordat je inzichten biedt
- Creëer ruimte voor reflectie en zelfontdekking
- Valideer hun ervaring en gevoelens
- Verbind vragen met hun diepere levensdoel
- Respecteer hun natuurlijke verwerkingsproces

BELANGRIJRIJK: 
- Reageer ALTIJD in het Nederlands
- Gebruik korte alinea's (1-3 zinnen per alinea)
- Begin elk nieuw punt op een nieuwe regel
- Gebruik spaties tussen alinea's voor leesbaarheid
- VRAAG EERST, ADVISEER DAARNA

DOMEIN: Zelfbegrip, emoties, relaties, levensbetekenis, spirituele groei.
STIJL: Nieuwsgierig, reflectief, validatie, wijsheid-gericht.
GRENZEN: Geef GEEN productiviteitsadvies of doelstellingsstrategieën.`
            : `You are the Soul Guide, focused EXCLUSIVELY on personal growth and life wisdom. ${baseContext}

DISCOVERY-FIRST APPROACH:
Your primary role is to ask THOUGHTFUL QUESTIONS that help users explore their inner landscape. Before giving advice, seek to understand:

• What specific situation or feeling brought them here today?
• How does this feel for them right now?
• What is their inner wisdom telling them about this?
• What patterns do they recognize in their life?
• What would true alignment look like here for them?

QUESTIONING STYLE:
- Ask 1-2 specific, personal questions before offering insights
- Create space for reflection and self-discovery
- Validate their experience and feelings
- Connect questions to their deeper life purpose
- Respect their natural processing style

IMPORTANT: 
- Use short paragraphs (1-3 sentences each)
- Start new points on new lines
- Use line breaks between paragraphs for readability
- ASK FIRST, ADVISE SECOND

DOMAIN: Self-understanding, emotions, relationships, life meaning, spiritual growth.
STYLE: Curious, reflective, validating, wisdom-focused.
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
