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

  try {
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
    )

    const { 
      conversationId, 
      clientMsgId, 
      content, 
      role, 
      sessionId,
      agentMode 
    } = await req.json()

    console.log('💾 STORE MESSAGE: Request received', {
      conversationId,
      clientMsgId,
      role,
      contentLength: content?.length || 0,
      sessionId,
      agentMode
    })

    // Get current user for RLS
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('❌ STORE MESSAGE: Authentication failed:', userError)
      return new Response(
        JSON.stringify({ error: 'Authentication required' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Store message with idempotency using unique constraint
    const messageData = {
      conversation_id: conversationId,
      client_msg_id: clientMsgId,
      user_id: user.id,
      content: content,
      role: role,
      session_id: sessionId,
      agent_mode: agentMode,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Use upsert with onConflict to handle idempotency
    const { data: storedMessage, error: storeError } = await supabase
      .from('conversation_messages')
      .upsert(messageData, {
        onConflict: 'conversation_id,client_msg_id',
        ignoreDuplicates: false
      })
      .select('id, created_at')
      .single()

    if (storeError) {
      console.error('❌ STORE MESSAGE: Database error:', storeError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to store message',
          details: storeError.message 
        }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ STORE MESSAGE: Message stored successfully', {
      serverId: storedMessage.id,
      clientId: clientMsgId,
      serverTimestamp: storedMessage.created_at
    })

    // Return reconciliation data for client
    return new Response(JSON.stringify({
      success: true,
      message: {
        serverId: storedMessage.id,
        clientId: clientMsgId,
        serverTimestamp: storedMessage.created_at,
        conversationId: conversationId
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ STORE MESSAGE: Unexpected error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})