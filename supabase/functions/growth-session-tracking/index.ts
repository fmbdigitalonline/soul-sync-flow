import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
        global: {
          headers: {
            Authorization: req.headers.get('Authorization')!,
          },
        },
      }
    )

    // Get the current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { method } = req

    if (method === 'POST') {
      // Create new growth session
      const body = await req.json()
      const { programId, weekNumber, sessionNumber, sessionType, sessionData } = body

      if (!programId || !weekNumber || !sessionNumber || !sessionType) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: programId, weekNumber, sessionNumber, sessionType' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('📝 Creating Growth Session for program:', programId, 'week:', weekNumber, 'session:', sessionNumber)

      // Verify program belongs to user
      const { data: program, error: programError } = await supabaseClient
        .from('growth_programs')
        .select('id')
        .eq('id', programId)
        .eq('user_id', user.id)
        .single()

      if (programError || !program) {
        return new Response(
          JSON.stringify({ error: 'Program not found or unauthorized' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const session = {
        program_id: programId,
        week_number: weekNumber,
        session_number: sessionNumber,
        session_type: sessionType,
        started_at: new Date().toISOString(),
        session_data: sessionData || {},
        outcomes: []
      }

      const { data, error } = await supabaseClient
        .from('growth_sessions')
        .insert(session)
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating growth session:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to create growth session' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('✅ Growth Session created:', data.id)
      return new Response(
        JSON.stringify({ success: true, session: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (method === 'PUT') {
      // Complete growth session
      const body = await req.json()
      const { sessionId, outcomes, completionData } = body

      if (!sessionId) {
        return new Response(
          JSON.stringify({ error: 'Missing required field: sessionId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('✅ Completing Growth Session:', sessionId)

      // Verify session belongs to user's program
      const { data: sessionCheck, error: sessionError } = await supabaseClient
        .from('growth_sessions')
        .select(`
          id,
          program_id,
          growth_programs!inner(user_id)
        `)
        .eq('id', sessionId)
        .single()

      if (sessionError || !sessionCheck || sessionCheck.growth_programs.user_id !== user.id) {
        return new Response(
          JSON.stringify({ error: 'Session not found or unauthorized' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const updateData = {
        completed_at: new Date().toISOString(),
        outcomes: outcomes || [],
        session_data: completionData || {}
      }

      const { data, error } = await supabaseClient
        .from('growth_sessions')
        .update(updateData)
        .eq('id', sessionId)
        .select()

      if (error) {
        console.error('❌ Error completing growth session:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to complete growth session' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('✅ Growth Session completed successfully')
      return new Response(
        JSON.stringify({ success: true, session: data[0] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (method === 'GET') {
      // Get growth sessions
      const url = new URL(req.url)
      const programId = url.searchParams.get('programId')
      const weekNumber = url.searchParams.get('weekNumber')

      if (!programId) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameter: programId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Verify program belongs to user
      const { data: program, error: programError } = await supabaseClient
        .from('growth_programs')
        .select('id')
        .eq('id', programId)
        .eq('user_id', user.id)
        .single()

      if (programError || !program) {
        return new Response(
          JSON.stringify({ error: 'Program not found or unauthorized' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      let query = supabaseClient
        .from('growth_sessions')
        .select('*')
        .eq('program_id', programId)

      if (weekNumber) {
        query = query.eq('week_number', parseInt(weekNumber))
      }

      const { data, error } = await query.order('created_at', { ascending: true })

      if (error) {
        console.error('❌ Error fetching growth sessions:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch growth sessions' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, sessions: data || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Growth Session Tracking Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})