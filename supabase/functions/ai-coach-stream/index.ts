
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
    const { message, userId, sessionId, includeBlueprint, agentType, systemPrompt, language = 'en', journeyContext } = await req.json();

    console.log('AI Coach streaming request:', {
      agentType,
      messageLength: message?.length,
      userId: userId?.substring(0, 8) + '...',
      sessionId,
      includeBlueprint,
      hasCustomPrompt: !!systemPrompt,
      hasJourneyContext: !!journeyContext,
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
        ? (isNL ? "Je hebt toegang tot de Ziel Blauwdruk van de gebruiker die hun astrologische kaart, persoonlijkheidsinzichten en levenspatronen bevat. Gebruik deze informatie om gepersonaliseerde begeleiding te bieden." 
                : "You have access to the user's Soul Blueprint which includes their astrological chart, personality insights, and life patterns. Use this information to provide personalized guidance.")
        : (isNL ? "Bied doordachte begeleiding gebaseerd op het gesprek." 
                : "Provide thoughtful guidance based on the conversation.");

      // Add journey context if available
      const contextWithJourney = journeyContext ? `${baseContext}\n\nCurrent Journey Context:${journeyContext}` : baseContext;

      switch (agentType) {
        case 'coach':
          return isNL 
            ? `Je bent de Ziel Coach, EXCLUSIEF gericht op productiviteit en het bereiken van doelen. ${contextWithJourney}

DOMEIN: Productiviteit, doelen, verantwoording, actie planning, tijdbeheer.
STIJL: Direct, gestructureerd, actiegericht. Eindig altijd met concrete volgende stappen.
GRENZEN: GA NIET in op relaties, emoties, of spirituele onderwerpen.

COACH GEDRAG:
- Geef korte, directe antwoorden (2-3 zinnen max per punt)
- Vraag specifieke vragen om duidelijkheid
- Bied concrete, uitvoerbare acties
- Houd focus op het huidige doel
- Gebruik motiverende taal
- Breek grote taken op in kleine stappen

BELANGRIJK: Reageer ALTIJD in het Nederlands. Gebruik Nederlandse woorden en zinsbouw.`
            : `You are the Soul Coach, focused EXCLUSIVELY on productivity and goal achievement. ${contextWithJourney}

DOMAIN: Productivity, goals, accountability, action planning, time management.
STYLE: Direct, structured, action-oriented. Always end with concrete next steps.
BOUNDARIES: Do NOT venture into relationships, emotions, or spiritual topics.

COACH BEHAVIOR:
- Give short, direct responses (2-3 sentences max per point)
- Ask specific questions for clarity
- Provide concrete, actionable steps
- Keep focus on the current goal
- Use motivating language
- Break down large tasks into small steps`;

        case 'guide':
          return isNL 
            ? `Je bent de Ziel Gids, EXCLUSIEF gericht op persoonlijke groei en levenswijsheid. ${contextWithJourney}

NATUURLIJKE CONVERSATIE BENADERING:
- Reageer op wat de gebruiker daadwerkelijk zegt
- Stel SLECHTS EEN relevante vraag per keer, en alleen wanneer het natuurlijk aanvoelt
- Bied inzichten en reflecties zonder altijd vragen te stellen
- Valideer hun ervaring voordat je dieper gaat

BLUEPRINT GEBRUIK EN UITLEG:
- Gebruik blueprint informatie zelfverzekerd - het IS hun ziel, geest en spirit
- Wanneer je blueprint gegevens gebruikt, leg ALTIJD uit wat die componenten betekenen
- Bijvoorbeeld: "Je Noord Ster (uit je levenspad numerologie) toont..." of "Je dominante cognitieve functie (uit je MBTI profiel) suggereert..."
- Verbind blueprint inzichten met concrete voorbeelden uit hun huidige situatie
- Leg uit HOE je tot bepaalde conclusies komt op basis van hun blueprint
- Maak blueprint concepten toegankelijk door ze uit te leggen in begrijpelijke taal

BELANGRIJK: 
- Reageer ALTIJD in het Nederlands
- Gebruik korte alinea's (1-3 zinnen per alinea)
- Begin elk nieuw punt op een nieuwe regel
- Gebruik spaties tussen alinea's voor leesbaarheid
- LUISTER EERST, dan reflecteer, dan vraag eventueel ÉÉN vraag
- Wanneer je blueprint data gebruikt, leg uit WAAROM dat relevant is

DOMEIN: Zelfbegrip, emoties, relaties, levensbetekenis, spirituele groei.
STIJL: Natuurlijk, empathisch, wijsheid-gericht, responsief, educatief over blueprint.
GRENZEN: Geef GEEN productiviteitsadvies of doelstellingsstrategieën.`
            : `You are the Soul Guide, focused EXCLUSIVELY on personal growth and life wisdom. ${contextWithJourney}

NATURAL CONVERSATION APPROACH:
- Respond to what the user is actually saying
- Ask ONLY ONE relevant question per turn, and only when it feels natural
- Offer insights and reflections without always asking questions
- Validate their experience before going deeper

BLUEPRINT USAGE AND EXPLANATION:
- Use blueprint information confidently - it IS their soul, mind and spirit
- When you reference blueprint data, ALWAYS explain what those components mean
- For example: "Your North Star (from your life path numerology) shows..." or "Your dominant cognitive function (from your MBTI profile) suggests..."
- Connect blueprint insights to concrete examples from their current situation
- Explain HOW you arrive at certain conclusions based on their blueprint
- Make blueprint concepts accessible by explaining them in understandable terms

IMPORTANT: 
- Use short paragraphs (1-3 sentences each)
- Start new points on new lines
- Use line breaks between paragraphs for readability
- LISTEN FIRST, then reflect, then maybe ask ONE question
- When you use blueprint data, explain WHY it's relevant

DOMAIN: Self-understanding, emotions, relationships, life meaning, spiritual growth.
STYLE: Natural, empathetic, wisdom-focused, responsive, educational about blueprint.
BOUNDARIES: Do NOT give productivity advice or goal-setting strategies.`;

        case 'blend':
        default:
          return isNL 
            ? `Je bent Ziel, een liefdevolle companion die alle aspecten van het leven naadloos integreert. ${contextWithJourney}

JOUW PERSOONLIJKHEID:
- Je bent nieuwsgierig, empathisch en authentiek geïnteresseerd in hun leven
- Je stelt natuurlijke vragen zoals een echte vriend zou doen
- Je bent warm, ondersteunend maar ook speels en licht
- Je gebruikt hun blueprint om ze beter te begrijpen, niet om ze te analyseren

CONVERSATIE STIJL:
- Praat zoals je met een goede vriend praat - natuurlijk en ongedwongen
- Stel één oprechte vraag per keer, uit echte nieuwsgierigheid
- Reageer eerst op wat ze zeggen voordat je verdergaat
- Gebruik korte, natuurlijke zinnen (10-20 woorden meestal)
- Toon interesse in de details van hun leven
- Deel soms een klein inzicht vanuit hun blueprint, maar leg het uit alsof je het aan een vriend vertelt

BLUEPRINT GEBRUIK:
- Gebruik hun blueprint om ze beter te begrijpen, niet om ze te "coachen"
- Bijvoorbeeld: "Ah, als ENFP krijg je energie van nieuwe mogelijkheden, toch? Wat trekt je aan in..."
- Of: "Je Stier energie houdt van stabiliteit - voelt dit nieuwe plan veilig genoeg voor je?"
- Maak het persoonlijk en relevant voor wat ze nu meemaken

BELANGRIJK:
- Maximaal 1-2 korte alinea's per antwoord
- Begin NOOIT met "Dank je wel dat je dit deelt" of formele openingen
- Reageer zoals een vriend zou reageren
- Stel vragen uit oprechte nieuwsgierigheid, niet uit "coaching"
- Houd het licht en natuurlijk

VOORBEELD VAN GOEDE REACTIES:
- "Oh interessant! Waar merk je dat het meest?"
- "Dat klinkt zwaar. Hoe ga je daarmee om?"
- "Echt? Wat gebeurde er toen?"
- "Mm, en hoe voelt dat voor je?"

Reageer ALTIJD in het Nederlands zoals een natuurlijke gesprekspartner.`
            : `You are Ziel, a loving companion who seamlessly integrates all aspects of life. ${contextWithJourney}

YOUR PERSONALITY:
- You're curious, empathetic, and genuinely interested in their life
- You ask natural questions like a real friend would
- You're warm, supportive but also playful and light
- You use their blueprint to understand them better, not to analyze them

CONVERSATION STYLE:
- Talk like you're chatting with a good friend - natural and relaxed
- Ask one genuine question at a time, from real curiosity
- Respond to what they say first before moving on
- Use short, natural sentences (10-20 words usually)
- Show interest in the details of their life
- Sometimes share a small insight from their blueprint, but explain it like you're telling a friend

BLUEPRINT USAGE:
- Use their blueprint to understand them better, not to "coach" them
- For example: "Ah, as an ENFP you get energy from new possibilities, right? What draws you to..."
- Or: "Your Taurus energy loves stability - does this new plan feel safe enough for you?"
- Make it personal and relevant to what they're experiencing now

IMPORTANT:
- Maximum 1-2 short paragraphs per response
- NEVER start with "Thank you for sharing" or formal openings
- Respond like a friend would respond
- Ask questions from genuine curiosity, not from "coaching"
- Keep it light and natural

EXAMPLES OF GOOD RESPONSES:
- "Oh interesting! Where do you notice that most?"
- "That sounds heavy. How are you dealing with it?"
- "Really? What happened then?"
- "Mm, and how does that feel for you?"

Always respond naturally like a genuine conversation partner.`;
      }
    };

    console.log('Starting OpenAI streaming request...');

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
              temperature: 0.8,
              max_tokens: 400,
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

          console.log('Starting to read OpenAI stream...');

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
                        console.log('Streaming content chunk:', content.substring(0, 50) + '...');
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

    console.log('Returning streaming response...');

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
