import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { userId, query, maxResults = 5, similarityThreshold = 0.6 } = await req.json();

    console.log('🔍 SEMANTIC BLUEPRINT SEARCH: Starting search', {
      userId,
      queryLength: query?.length,
      maxResults,
      similarityThreshold
    });

    if (!userId || !query) {
      throw new Error('Missing required parameters: userId and query');
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate embedding for the query
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('🔮 Generating embedding for query...');
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query,
        encoding_format: 'float'
      }),
    });

    if (!embeddingResponse.ok) {
      throw new Error(`OpenAI API error: ${embeddingResponse.status}`);
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    console.log('✅ Query embedding generated, dimensions:', queryEmbedding.length);

    // Search blueprint embeddings using vector similarity
    const { data: similarChunks, error: searchError } = await supabase.rpc('match_blueprint_chunks', {
      query_embedding: queryEmbedding,
      query_user_id: userId,
      match_threshold: similarityThreshold,
      match_count: maxResults
    });

    if (searchError) {
      console.error('❌ Blueprint search error:', searchError);
      throw searchError;
    }

    console.log('✅ SEMANTIC BLUEPRINT SEARCH: Found', similarChunks?.length || 0, 'matching chunks');

    return new Response(JSON.stringify({
      chunks: similarChunks || [],
      searchMetadata: {
        queryProcessed: true,
        embeddingDimensions: queryEmbedding.length,
        resultsCount: similarChunks?.length || 0,
        searchTimestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ SEMANTIC BLUEPRINT SEARCH ERROR:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      chunks: [],
      searchMetadata: {
        queryProcessed: false,
        error: true,
        errorMessage: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});