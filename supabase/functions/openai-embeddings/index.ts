import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callEmbeddings } from "../_shared/azure-openai.ts";

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
    const { query } = await req.json();

    if (!query) {
      throw new Error('Query is required');
    }

    console.log('🔧 Generating embedding for query:', query.substring(0, 100) + '...');

    const response = await callEmbeddings({ input: query });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Embeddings API error:', response.status, errorText);
      throw new Error(`Embeddings API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const embedding = data.data[0].embedding;

    console.log('✅ Successfully generated embedding, length:', embedding.length);

    return new Response(JSON.stringify({ embedding }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in openai-embeddings function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate embedding' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});