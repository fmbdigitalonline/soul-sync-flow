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

    if (req.method === 'GET') {
      // Get user's PIE configuration
      const { data: config, error } = await supabaseClient
        .from('pie_configurations')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching PIE configuration:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch configuration' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Return configuration or default values
      const configuration = config || {
        user_id: user.id,
        enabled: true,
        minimum_confidence: 0.7,
        pattern_sensitivity: 'moderate',
        delivery_methods: ['conversation'],
        delivery_timing: 'immediate',
        quiet_hours: { start: '22:00', end: '08:00' },
        include_astrology: true,
        include_statistics: false,
        communication_style: 'balanced',
        data_types: ['mood', 'productivity', 'sentiment'],
        retention_period: 90
      }

      return new Response(
        JSON.stringify({ success: true, configuration }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (req.method === 'POST' || req.method === 'PUT') {
      // Update user's PIE configuration
      const body = await req.json()
      
      const allowedFields = [
        'enabled', 'minimum_confidence', 'pattern_sensitivity', 'delivery_methods',
        'delivery_timing', 'quiet_hours', 'include_astrology', 'include_statistics',
        'communication_style', 'data_types', 'retention_period'
      ]

      // Filter and validate the update data
      const updateData = {}
      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updateData[field] = body[field]
        }
      }

      // Add user_id and timestamp
      updateData['user_id'] = user.id
      updateData['updated_at'] = new Date().toISOString()

      // Validate data types array
      if (updateData['data_types'] && !Array.isArray(updateData['data_types'])) {
        return new Response(
          JSON.stringify({ error: 'data_types must be an array' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Validate delivery methods array
      if (updateData['delivery_methods'] && !Array.isArray(updateData['delivery_methods'])) {
        return new Response(
          JSON.stringify({ error: 'delivery_methods must be an array' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Validate quiet hours object
      if (updateData['quiet_hours']) {
        const quietHours = updateData['quiet_hours']
        if (typeof quietHours !== 'object' || !quietHours.start || !quietHours.end) {
          return new Response(
            JSON.stringify({ error: 'quiet_hours must be an object with start and end properties' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      // Upsert the configuration
      const { data, error } = await supabaseClient
        .from('pie_configurations')
        .upsert(updateData)
        .select()

      if (error) {
        console.error('Error updating PIE configuration:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to update configuration' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('✅ PIE configuration updated successfully')

      return new Response(
        JSON.stringify({ success: true, configuration: data[0] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (req.method === 'DELETE') {
      // Reset configuration to defaults
      const defaultConfig = {
        user_id: user.id,
        enabled: true,
        minimum_confidence: 0.7,
        pattern_sensitivity: 'moderate',
        delivery_methods: ['conversation'],
        delivery_timing: 'immediate',
        quiet_hours: { start: '22:00', end: '08:00' },
        include_astrology: true,
        include_statistics: false,
        communication_style: 'balanced',
        data_types: ['mood', 'productivity', 'sentiment'],
        retention_period: 90,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabaseClient
        .from('pie_configurations')
        .upsert(defaultConfig)
        .select()

      if (error) {
        console.error('Error resetting PIE configuration:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to reset configuration' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('✅ PIE configuration reset to defaults')

      return new Response(
        JSON.stringify({ success: true, configuration: data[0] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('PIE Configuration Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})