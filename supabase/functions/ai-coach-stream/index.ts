
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔐 AI Coach Stream: Validating authentication...');
    
    // Initialize Supabase client for auth validation
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract and validate auth token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('❌ AI Coach Stream: No authorization header provided');
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('❌ AI Coach Stream: Authentication failed:', authError?.message);
      return new Response(JSON.stringify({ error: 'Invalid authentication token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ AI Coach Stream: User authenticated:', user.id);

    const { 
      message, 
      sessionId, 
      includeBlueprint = false, 
      agentType = "guide", 
      language = "en",
      systemPrompt,
      enableBlueprintFiltering = false,
      maxTokens = 1000,
      temperature = 0.7,
      contextDepth = 'normal', // New parameter for layered model selection
      userDisplayName = 'friend'
    } = await req.json();

    console.log(`🚀 Starting streaming chat completion (${agentType}, Blueprint: ${includeBlueprint}, Context: ${contextDepth}, User: ${user.id})`);

    // Layered model selection for streaming
    const selectStreamingModel = (agentType: string, contextDepth: string, includeBlueprint: boolean) => {
      // Core Brain Layer - deep personality integration
      if (includeBlueprint && (contextDepth === 'deep' || agentType === 'guide')) {
        console.log('🧠 Streaming with Core Brain Layer: gpt-4o');
        return 'gpt-4o';
      }
      
      // Exploration Coach Layer - emotional themes
      if (agentType === 'coach' && contextDepth === 'emotional') {
        console.log('🧭 Streaming with Exploration Coach Layer: gpt-4o');
        return 'gpt-4o';
      }
      
      // ACS Layer - fast state switching and routine interactions
      console.log('⚡ Streaming with ACS Layer: gpt-4o-mini');
      return 'gpt-4o-mini';
    };

    const selectedModel = selectStreamingModel(agentType, contextDepth, includeBlueprint);

    // Build messages array
    const messages = [];
    
    if (systemPrompt) {
      console.log(`📝 Using custom system prompt (length: ${systemPrompt.length})`);
      messages.push({ role: 'system', content: systemPrompt });
    } else {
      // Fallback system prompt based on agent type with user name
      const fallbackPrompt = agentType === 'coach' 
        ? `You are a helpful AI coach for ${userDisplayName} focused on productivity and goal achievement. Use ${userDisplayName}'s name naturally in conversation and provide thoughtful, actionable responses.`
        : `You are a helpful AI guide for ${userDisplayName} focused on personal growth and guidance. Use ${userDisplayName}'s name naturally in conversation and provide thoughtful, complete responses.`;
      messages.push({ role: 'system', content: fallbackPrompt });
    }

    messages.push({ role: 'user', content: message });

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('❌ AI Coach Stream: OpenAI API key not configured');
      return new Response(JSON.stringify({ error: 'Service configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Dynamic parameters based on selected model
    const finalTemperature = selectedModel === 'gpt-4o' ? temperature : Math.min(temperature, 0.5);
    const finalMaxTokens = selectedModel === 'gpt-4o' ? maxTokens : Math.min(maxTokens, 1000);

    console.log('🎯 Streaming with layered model:', {
      model: selectedModel,
      temperature: finalTemperature,
      maxTokens: finalMaxTokens
    });

    console.log('🤖 Making OpenAI streaming API request...');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: messages,
        temperature: finalTemperature,
        max_tokens: finalMaxTokens,
        stream: true,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('❌ OpenAI API error:', openAIResponse.status, errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    console.log('✅ OpenAI API request successful, starting stream...');

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
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Authentication or service error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
