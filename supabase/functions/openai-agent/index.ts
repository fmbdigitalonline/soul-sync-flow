import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const requestData = await req.json();
    console.log('📨 Received request data:', JSON.stringify(requestData, null, 2));
    
    const { messages, model = 'gpt-4o', temperature = 0.7, tools } = requestData;

    if (!messages || !Array.isArray(messages)) {
      console.error('❌ Invalid messages array:', messages);
      throw new Error('Messages array is required');
    }

    console.log('🤖 Running OpenAI agent with model:', model);
    console.log('📝 Messages count:', messages.length);
    console.log('🔧 Tools provided:', tools ? tools.length : 0);

    const requestBody: any = {
      model,
      messages,
      temperature,
      max_tokens: 4000
    };

    if (tools && Array.isArray(tools)) {
      requestBody.tools = tools;
    }

    console.log('📤 Sending request to OpenAI:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📥 OpenAI response structure:', JSON.stringify(data, null, 2));
    
    // Validate response structure
    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error('❌ Invalid OpenAI response structure - no choices:', data);
      throw new Error('Invalid response structure from OpenAI');
    }
    
    if (!data.choices[0]?.message) {
      console.error('❌ Invalid OpenAI response structure - no message:', data.choices[0]);
      throw new Error('Invalid message structure from OpenAI');
    }
    
    const content = data.choices[0].message.content || '';
    console.log('✅ Agent response generated successfully');
    console.log('📝 Content length:', content.length);
    console.log('📝 Content preview:', content.substring(0, 200) + (content.length > 200 ? '...' : ''));

    const responseData = { 
      content,
      usage: data.usage,
      model: data.model 
    };
    
    console.log('📤 Returning response:', JSON.stringify(responseData, null, 2));
    
    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in openai-agent function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to run agent' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});