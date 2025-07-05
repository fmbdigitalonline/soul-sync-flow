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
      console.log('📊 Fetching PIE dashboard data')

      // Get user configuration
      const { data: config, error: configError } = await supabaseClient
        .from('pie_configurations')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      // Get recent insights
      const { data: insights, error: insightsError } = await supabaseClient
        .from('pie_insights')
        .select('*')
        .eq('user_id', user.id)
        .gte('expiration_time', new Date().toISOString())
        .order('priority')
        .order('created_at', { ascending: false })
        .limit(10)

      // Get detected patterns
      const { data: patterns, error: patternsError } = await supabaseClient
        .from('pie_patterns')
        .select('*')
        .eq('user_id', user.id)
        .order('confidence', { ascending: false })
        .limit(5)

      // Get predictive rules
      const { data: rules, error: rulesError } = await supabaseClient
        .from('pie_predictive_rules')
        .select('*')
        .eq('user_id', user.id)
        .order('confidence', { ascending: false })
        .limit(5)

      // Get data collection stats
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: dataStats, error: statsError } = await supabaseClient
        .from('pie_user_data')
        .select('data_type')
        .eq('user_id', user.id)
        .gte('timestamp', thirtyDaysAgo.toISOString())

      // Calculate data collection statistics
      const dataTypeStats = {}
      if (dataStats) {
        for (const item of dataStats) {
          dataTypeStats[item.data_type] = (dataTypeStats[item.data_type] || 0) + 1
        }
      }

      // Get upcoming astrological events
      const { data: upcomingEvents, error: eventsError } = await supabaseClient
        .from('pie_astrological_events')
        .select('*')
        .gte('start_time', new Date().toISOString())
        .lte('start_time', new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString())
        .order('start_time', { ascending: true })
        .limit(5)

      // Build dashboard response
      const dashboardData = {
        configuration: config || {
          enabled: true,
          minimum_confidence: 0.7,
          pattern_sensitivity: 'moderate',
          delivery_methods: ['conversation'],
          delivery_timing: 'immediate',
          include_astrology: true,
          include_statistics: false,
          communication_style: 'balanced',
          data_types: ['mood', 'productivity', 'sentiment'],
          retention_period: 90
        },
        insights: {
          active: insights?.filter(i => !i.acknowledged) || [],
          acknowledged: insights?.filter(i => i.acknowledged) || [],
          total: insights?.length || 0
        },
        patterns: {
          detected: patterns || [],
          total: patterns?.length || 0,
          byType: patterns?.reduce((acc, p) => {
            acc[p.pattern_type] = (acc[p.pattern_type] || 0) + 1
            return acc
          }, {}) || {}
        },
        predictiveRules: {
          active: rules || [],
          total: rules?.length || 0,
          averageConfidence: rules?.length > 0 
            ? rules.reduce((sum, r) => sum + r.confidence, 0) / rules.length 
            : 0
        },
        dataCollection: {
          last30Days: dataStats?.length || 0,
          byType: dataTypeStats,
          dataTypes: Object.keys(dataTypeStats)
        },
        upcomingEvents: upcomingEvents || [],
        systemHealth: {
          configurationLoaded: !configError,
          insightsActive: !insightsError && (insights?.length || 0) > 0,
          patternsDetected: !patternsError && (patterns?.length || 0) > 0,
          dataCollectionActive: !statsError && (dataStats?.length || 0) > 0,
          lastUpdated: new Date().toISOString()
        }
      }

      console.log(`✅ PIE dashboard data compiled: ${insights?.length || 0} insights, ${patterns?.length || 0} patterns`)

      return new Response(
        JSON.stringify({ success: true, dashboard: dashboardData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('PIE Dashboard Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})