import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface IdempotentMessageRequest {
  conversation_id: string;
  client_msg_id: string;
  content: string;
  user_id: string;
  session_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Step 2: Idempotent message handling endpoint
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { conversation_id, client_msg_id, content, user_id, session_id } = await req.json() as IdempotentMessageRequest;

    console.log('🔄 IDEMPOTENT MESSAGE: Processing', { 
      client_msg_id, 
      conversation_id,
      session_id 
    });

    // Step 7: Check if message already exists by client_msg_id
    const { data: existingMessage, error: checkError } = await supabaseClient
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', conversation_id)
      .eq('client_msg_id', client_msg_id)
      .eq('role', 'user')
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
      throw checkError;
    }

    let userMessage;
    
    if (existingMessage) {
      // Message already exists - return existing data
      console.log('✅ IDEMPOTENT: Message already exists', { 
        server_msg_id: existingMessage.id,
        client_msg_id 
      });
      
      userMessage = existingMessage;
    } else {
      // Step 7: Upsert new message with unique constraint on (conversation_id, client_msg_id)
      const messageData = {
        conversation_id,
        client_msg_id,
        user_id,
        session_id,
        role: 'user',
        content,
        created_at: new Date().toISOString(),
        status: 'sent'
      };

      const { data: newMessage, error: insertError } = await supabaseClient
        .from('conversation_messages')
        .insert(messageData)
        .select('*')
        .single();

      if (insertError) {
        // Handle race condition - another request may have inserted the same message
        if (insertError.code === '23505') { // Unique constraint violation
          const { data: raceMessage } = await supabaseClient
            .from('conversation_messages')
            .select('*')
            .eq('conversation_id', conversation_id)
            .eq('client_msg_id', client_msg_id)
            .single();
          
          userMessage = raceMessage;
          console.log('⚠️ RACE CONDITION: Message inserted by concurrent request', { client_msg_id });
        } else {
          throw insertError;
        }
      } else {
        userMessage = newMessage;
        console.log('✅ NEW MESSAGE: Created successfully', { 
          server_msg_id: newMessage.id,
          client_msg_id 
        });
      }
    }

    // Step 2: Return reconciliation data
    const response = {
      client_msg_id,
      server_msg_id: userMessage.id,
      created_at_server: userMessage.created_at,
      status: 'sent'
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('❌ MESSAGE HANDLER ERROR:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process message',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})