
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
      journeyContext,
      enableBlueprintFiltering = false
    } = await req.json();

    console.log('AI Coach streaming request:', {
      agentType,
      messageLength: message?.length,
      userId: userId?.substring(0, 8) + '...',
      sessionId,
      includeBlueprint,
      hasCustomPrompt: !!systemPrompt,
      hasJourneyContext: !!journeyContext,
      enableBlueprintFiltering,
      language
    });

    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      console.error('OpenAI API key not found');
      const errorMessage = language === 'nl' ? 'OpenAI API sleutel niet geconfigureerd' : 'OpenAI API key not configured';
      throw new Error(errorMessage);
    }

    const getSystemPrompt = (agentType: string, language: string) => {
      if (systemPrompt) {
        return systemPrompt;
      }

      const isNL = language === 'nl';
      
      const baseContext = includeBlueprint 
        ? (isNL ? "Je hebt toegang tot de persoonlijkheidscontext van de gebruiker. Gebruik deze informatie om natuurlijk en gepersonaliseerd te reageren." 
                : "You have access to the user's personality context. Use this information to respond naturally and personally.")
        : (isNL ? "Reageer natuurlijk en ondersteunend op basis van het gesprek." 
                : "Respond naturally and supportively based on the conversation.");

      // Add journey context if available
      const contextWithJourney = journeyContext ? `${baseContext}\n\nCurrent Journey Context:${journeyContext}` : baseContext;

      switch (agentType) {
        case 'coach':
          return isNL 
            ? `Je bent een persoonlijke productiviteitscoach. ${contextWithJourney}

AANPAK:
- Luister eerst naar wat de gebruiker deelt
- Reageer natuurlijk en ondersteunend
- Bied praktische hulp gericht op hun doelen
- Houd het gesprek gefocust op actie en vooruitgang
- Stel verduidelijkende vragen als je meer context nodig hebt

STIJL: Natuurlijk, bemoedigend, gericht op resultaten
TAAL: Reageer ALTIJD in het Nederlands`
            : `You are a personal productivity coach. ${contextWithJourney}

APPROACH:
- Listen first to what the user is sharing
- Respond naturally and supportively  
- Offer practical help focused on their goals
- Keep conversation focused on action and progress
- Ask clarifying questions when you need more context

STYLE: Natural, encouraging, results-focused`;

        case 'guide':
          return isNL 
            ? `Je bent een persoonlijke groei-gids. ${contextWithJourney}

AANPAK:
- Luister diep naar wat de gebruiker deelt
- Reageer natuurlijk en met empathie
- Help hen inzichten te krijgen over zichzelf
- Ondersteun hen bij levensvragen en persoonlijke groei
- Gebruik hun persoonlijkheidscontext om relevante inzichten te bieden

STIJL: Natuurlijk, empathisch, reflectief
TAAL: Reageer ALTIJD in het Nederlands`
            : `You are a personal growth guide. ${contextWithJourney}

APPROACH:
- Listen deeply to what the user is sharing
- Respond naturally and with empathy
- Help them gain insights about themselves
- Support them with life questions and personal growth
- Use their personality context to offer relevant insights

STYLE: Natural, empathetic, reflective`;

        case 'blend':
        default:
          return isNL 
            ? `Je bent een persoonlijke levenscompagnon. ${contextWithJourney}

AANPAK:
- Luister eerst naar wat ze delen en waar ze mee zitten
- Reageer natuurlijk alsof je een goede vriend bent die hen goed kent
- Pas je hulp aan wat ze nodig hebben - praktisch of emotioneel
- Gebruik hun persoonlijkheid om hen beter te begrijpen en te ondersteunen

GESPREKSSTIJL:
- Natuurlijk en warm
- Stel slechts één vraag per keer als je verduidelijking nodig hebt
- Bied inzichten waar die waardevol zijn, niet standaard
- Reageer op waar ze nu mee bezig zijn

TAAL: Reageer ALTIJD in het Nederlands`
            : `You are a personal life companion. ${contextWithJourney}

APPROACH:
- Listen first to what they're sharing and what they're dealing with
- Respond naturally like a good friend who knows them well
- Adapt your help to what they need - practical or emotional
- Use their personality to better understand and support them

CONVERSATION STYLE:
- Natural and warm
- Ask only one question at a time if you need clarification
- Offer insights where they're valuable, not by default
- Respond to what they're dealing with right now`;
      }
    };

    console.log('Starting OpenAI streaming request with natural conversation approach...');

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
                  content: getSystemPrompt(agentType || 'blend', language)
                },
                {
                  role: 'user',
                  content: message
                }
              ],
              temperature: 0.8, // Slightly higher for more natural conversation
              max_tokens: 200, // Increased for more complete responses
              stream: true,
            }),
          });

          console.log('OpenAI response status:', response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API error:', response.status, errorText);
            throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('No response body from OpenAI');
          }

          const decoder = new TextDecoder();
          let buffer = '';

          console.log('Starting to read OpenAI stream for natural conversation...');

          try {
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) {
                console.log('OpenAI stream completed');
                const encoder = new TextEncoder();
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                break;
              }

              const chunk = decoder.decode(value, { stream: true });
              buffer += chunk;
              
              // Process complete lines
              const lines = buffer.split('\n');
              buffer = lines.pop() || ''; // Keep incomplete line in buffer
              
              for (const line of lines) {
                if (line.trim() === '') continue;
                
                if (line.startsWith('data: ')) {
                  const data = line.slice(6).trim();
                  
                  if (data === '[DONE]') {
                    console.log('Received [DONE] from OpenAI');
                    const encoder = new TextEncoder();
                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                    controller.close();
                    return;
                  }
                  
                  if (data && data !== '[DONE]') {
                    try {
                      const parsed = JSON.parse(data);
                      const content = parsed.choices?.[0]?.delta?.content;
                      
                      if (content) {
                        console.log('Streaming natural content chunk:', content.substring(0, 50) + '...');
                        const encoder = new TextEncoder();
                        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                      }
                    } catch (parseError) {
                      console.log('Skipping invalid JSON:', data.substring(0, 100));
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
          const encoder = new TextEncoder();
          const errorData = JSON.stringify({
            error: true,
            message: error.message || 'Streaming failed'
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.error(error);
        } finally {
          controller.close();
        }
      }
    });

    console.log('Returning natural conversation streaming response...');

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
