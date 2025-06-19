
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      message, 
      sessionId, 
      includeBlueprint = false, 
      agentType = "guide", 
      language = "en",
      systemPrompt,
      enableBlueprintFiltering = false,
      maxTokens = 4000,
      temperature = 0.7
    } = await req.json();

    console.log(`🚀 Starting streaming chat completion (${agentType}, Blueprint: ${includeBlueprint}, MaxTokens: ${maxTokens})`);

    // Build messages array
    const messages = [];
    
    if (systemPrompt) {
      console.log(`📝 Using custom system prompt (length: ${systemPrompt.length})`);
      messages.push({ role: 'system', content: systemPrompt });
    } else {
      // Fallback system prompt
      messages.push({ 
        role: 'system', 
        content: `You are a helpful AI assistant focused on ${agentType === 'coach' ? 'productivity and goal achievement' : 'personal growth and guidance'}. Provide thoughtful, complete responses.` 
      });
    }

    messages.push({ role: 'user', content: message });

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        temperature: temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    // Create a ReadableStream for the response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = openAIResponse.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.trim() === '') continue;
              
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                
                if (data.trim() === '[DONE]') {
                  console.log('📤 Streaming complete - sending [DONE]');
                  controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
                  controller.close();
                  return;
                }
                
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  
                  if (content) {
                    console.log(`📡 Streaming content chunk: ${content.slice(0, 50)}...`);
                    controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
                  }
                } catch (e) {
                  // Skip invalid JSON
                  continue;
                }
              }
            }
          }
        } catch (error) {
          console.error('❌ Streaming error:', error);
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      },
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
    console.error('❌ Error in ai-coach-stream function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
