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
      // Create new growth program
      const body = await req.json()
      const { domain, blueprintParams, programType, totalWeeks, sessionSchedule } = body

      if (!domain || !blueprintParams) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: domain, blueprintParams' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('🌱 Creating Growth Program for user:', user.id, 'domain:', domain)

      const program = {
        user_id: user.id,
        program_type: programType || 'standard',
        domain,
        current_week: 1,
        total_weeks: totalWeeks || 6,
        status: 'pending',
        started_at: new Date().toISOString(),
        expected_completion: new Date(Date.now() + (totalWeeks || 6) * 7 * 24 * 60 * 60 * 1000).toISOString(),
        blueprint_params: blueprintParams,
        progress_metrics: {
          completed_sessions: 0,
          mood_entries: 0,
          reflection_entries: 0,
          insight_entries: 0,
          micro_actions_completed: 0,
          belief_shifts_tracked: 0,
          excitement_ratings: [],
          domain_progress_score: 0
        },
        session_schedule: sessionSchedule || {
          sessions_per_week: 3,
          session_duration_minutes: 25,
          reminder_frequency: 'weekly'
        }
      }

      const { data, error } = await supabaseClient
        .from('growth_programs')
        .insert(program)
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating growth program:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to create growth program' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('✅ Growth Program created:', data.id)
      return new Response(
        JSON.stringify({ success: true, program: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (method === 'GET') {
      // Get current program or program details
      const url = new URL(req.url)
      const programId = url.searchParams.get('programId')

      if (programId) {
        // Get specific program
        const { data, error } = await supabaseClient
          .from('growth_programs')
          .select('*')
          .eq('id', programId)
          .eq('user_id', user.id)
          .single()

        if (error) {
          console.error('❌ Error fetching program:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch program' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, program: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        // Get current active program
        const { data, error } = await supabaseClient
          .from('growth_programs')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (error) {
          console.error('❌ Error fetching current program:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch current program' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, program: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

    } else if (method === 'PUT') {
      // Update program progress
      const body = await req.json()
      const { programId, updates } = body

      if (!programId || !updates) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: programId, updates' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('📊 Updating program progress:', programId)

      // Create a clean update object
      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      // Only include fields that are present in the updates
      if (updates.current_week !== undefined) {
        updateData.current_week = updates.current_week
      }
      if (updates.status !== undefined) {
        updateData.status = updates.status
      }
      if (updates.actual_completion !== undefined) {
        updateData.actual_completion = updates.actual_completion
      }
      if (updates.blueprint_params !== undefined) {
        updateData.blueprint_params = updates.blueprint_params
      }
      if (updates.progress_metrics !== undefined) {
        updateData.progress_metrics = updates.progress_metrics
      }
      if (updates.session_schedule !== undefined) {
        updateData.session_schedule = updates.session_schedule
      }

      const { data, error } = await supabaseClient
        .from('growth_programs')
        .update(updateData)
        .eq('id', programId)
        .eq('user_id', user.id)
        .select()

      if (error) {
        console.error('❌ Error updating program:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to update program' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('✅ Program updated successfully')
      return new Response(
        JSON.stringify({ success: true, program: data[0] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Growth Program Management Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})