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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the JWT token and get user
    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !userData?.user) {
      throw new Error(`Authentication failed: ${userError?.message}`)
    }

    const userId = userData.user.id
    const { mode = 'companion' } = await req.json()

    console.log('🧵 THREAD: Getting/creating conversation thread', { userId, mode })

    // Call the database function to get or create thread
    const { data: threadData, error: threadError } = await supabase.rpc(
      'get_or_create_conversation_thread',
      {
        p_user_id: userId,
        p_mode: mode
      }
    )

    if (threadError) {
      console.error('🚨 THREAD: Database error:', threadError)
      throw new Error(`Thread operation failed: ${threadError.message}`)
    }

    console.log('✅ THREAD: Thread ready', { 
      threadId: threadData.id, 
      mode: threadData.mode,
      lastActivity: threadData.last_activity 
    })

    return new Response(JSON.stringify({ 
      success: true, 
      thread: threadData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('🚨 THREAD: Conversation thread error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})