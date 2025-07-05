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
      // Store new data point
      const body = await req.json()
      const { dataType, value, source, confidence, metadata, rawValue } = body

      if (!dataType || value === undefined || !source) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: dataType, value, source' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const dataPoint = {
        id: crypto.randomUUID(),
        user_id: user.id,
        timestamp: new Date().toISOString(),
        data_type: dataType,
        value: value,
        raw_value: rawValue || null,
        source: source,
        confidence: confidence || 0.8,
        metadata: metadata || {}
      }

      const { data, error } = await supabaseClient
        .from('pie_user_data')
        .insert(dataPoint)
        .select()

      if (error) {
        console.error('Error storing PIE data point:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to store data point' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`✅ PIE data point stored: ${dataType} = ${value}`)
      return new Response(
        JSON.stringify({ success: true, data: data[0] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (method === 'GET') {
      // Get user data for analysis
      const url = new URL(req.url)
      const dataType = url.searchParams.get('dataType')
      const days = parseInt(url.searchParams.get('days') || '90')

      let query = supabaseClient
        .from('pie_user_data')
        .select('*')
        .eq('user_id', user.id)

      if (dataType) {
        query = query.eq('data_type', dataType)
      }

      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      
      query = query
        .gte('timestamp', cutoffDate.toISOString())
        .order('timestamp', { ascending: true })

      const { data, error } = await query

      if (error) {
        console.error('Error fetching PIE data:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch data' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, data: data || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('PIE Data Collection Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})