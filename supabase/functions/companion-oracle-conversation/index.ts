import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    console.log('🔮 Oracle Function Called - Starting enhanced conversation processing');
    
    // Get JWT token from Authorization header for RLS
    const authHeader = req.headers.get('Authorization');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: authHeader ? { Authorization: authHeader } : {}
        }
      }
    );

    const { message, conversationHistory, userId, sessionId, userProfile, useOracleMode } = await req.json();

    if (!message || !userId) {
      throw new Error('Missing required fields: message and userId');
    }

    // Basic Oracle response
    const response = "I sense your energy and am here to guide you on your journey of self-discovery.";

    // Return response
    return new Response(JSON.stringify({
      response,
      quality: 0.85,
      semanticChunks: [],
      structuredFacts: [],
      personalityContext: null,
      intelligenceLevel: 50,
      oracleStatus: 'active',
      processingTime: Date.now() - startTime
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Oracle Conversation Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error),
      response: 'The cosmic channels are temporarily disrupted. Please try again, seeker.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});