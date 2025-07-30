import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { userId, forceReprocess = true } = await req.json();
    
    console.log(`🔥 MANUAL TRIGGER: Processing blueprint embeddings for user ${userId}`);
    
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call the process-blueprint-embeddings function
    const { data, error } = await supabase.functions.invoke('process-blueprint-embeddings', {
      body: { userId, forceReprocess }
    });

    if (error) {
      console.error('❌ MANUAL TRIGGER: Failed to process embeddings', error);
      throw error;
    }

    console.log('✅ MANUAL TRIGGER: Blueprint embeddings processed successfully', data);

    // Verify embeddings were created
    const { data: embeddings, error: countError } = await supabase
      .from('blueprint_text_embeddings')
      .select('id, chunk_content')
      .eq('user_id', userId);

    if (countError) {
      console.error('❌ MANUAL TRIGGER: Failed to verify embeddings', countError);
      throw countError;
    }

    const embeddingCount = embeddings?.length || 0;
    console.log(`📊 MANUAL TRIGGER: Verification complete - ${embeddingCount} embeddings created`);

    return new Response(JSON.stringify({ 
      success: true,
      message: `Blueprint embeddings processed successfully for user ${userId}`,
      embeddingCount,
      embeddings: embeddings?.slice(0, 3).map(e => ({ 
        id: e.id, 
        preview: e.chunk_content.substring(0, 100) + '...' 
      }))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ MANUAL TRIGGER: Error processing blueprint embeddings:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to process blueprint embeddings' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});