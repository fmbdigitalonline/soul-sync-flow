import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      query_embedding, 
      user_id_param, 
      max_results = 10, 
      similarity_threshold = 0.7 
    } = await req.json();

    console.log('🔮 SEARCH: Starting semantic similarity search', {
      userId: user_id_param,
      maxResults: max_results,
      threshold: similarity_threshold,
      embeddingDimensions: query_embedding?.length || 0
    });

    if (!query_embedding || !Array.isArray(query_embedding)) {
      throw new Error('Invalid query embedding provided');
    }

    // Use pgvector cosine similarity search
    const { data, error } = await supabase
      .from('message_embeddings')
      .select(`
        content,
        message_role,
        created_at,
        session_id,
        agent_mode,
        embedding <=> '[${query_embedding.join(',')}]' AS similarity
      `)
      .eq('user_id', user_id_param)
      .lt('embedding <=> ', `[${query_embedding.join(',')}]`, 1 - similarity_threshold)
      .order('similarity', { ascending: true })
      .limit(max_results);

    if (error) {
      console.error('❌ SEARCH: Database query failed:', error);
      throw error;
    }

    const results = data?.map(row => ({
      content: row.content,
      message_role: row.message_role,
      created_at: row.created_at,
      session_id: row.session_id,
      agent_mode: row.agent_mode,
      similarity: 1 - row.similarity // Convert distance to similarity
    })) || [];

    console.log('✅ SEARCH: Similarity search complete', {
      resultsFound: results.length,
      avgSimilarity: results.length > 0 
        ? results.reduce((sum, r) => sum + r.similarity, 0) / results.length 
        : 0
    });

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ SEARCH: Semantic search error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Semantic search failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});