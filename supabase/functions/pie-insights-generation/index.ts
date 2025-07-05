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

    if (req.method === 'POST') {
      // Generate insights based on patterns and predictive rules
      console.log('💡 Starting insight generation process')

      // Get user's predictive rules
      const { data: rules, error: rulesError } = await supabaseClient
        .from('pie_predictive_rules')
        .select('*')
        .eq('user_id', user.id)
        .order('confidence', { ascending: false })

      if (rulesError) {
        console.error('Error fetching predictive rules:', rulesError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch predictive rules' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get astrological events for context
      const { data: astroEvents, error: astroError } = await supabaseClient
        .from('pie_astrological_events')
        .select('*')
        .gte('start_time', new Date().toISOString())
        .lte('start_time', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('start_time', { ascending: true })

      if (astroError) {
        console.error('Error fetching astrological events:', astroError)
      }

      const generatedInsights = []

      // Generate insights from rules and events
      if (rules && rules.length > 0 && astroEvents && astroEvents.length > 0) {
        for (const rule of rules.slice(0, 3)) { // Limit to top 3 rules
          for (const event of astroEvents.slice(0, 2)) { // Limit to next 2 events
            const insight = generateInsightFromRuleAndEvent(rule, event, user.id)
            if (insight) {
              generatedInsights.push(insight)
            }
          }
        }
      }

      // Generate general insights from patterns if no rule-based insights
      if (generatedInsights.length === 0) {
        const { data: patterns, error: patternsError } = await supabaseClient
          .from('pie_patterns')
          .select('*')
          .eq('user_id', user.id)
          .order('confidence', { ascending: false })
          .limit(2)

        if (!patternsError && patterns && patterns.length > 0) {
          for (const pattern of patterns) {
            const insight = generateInsightFromPattern(pattern, user.id)
            if (insight) {
              generatedInsights.push(insight)
            }
          }
        }
      }

      // Store generated insights
      const storedInsights = []
      for (const insight of generatedInsights) {
        try {
          const { data: insertedInsight, error: insertError } = await supabaseClient
            .from('pie_insights')
            .insert({
              id: insight.id,
              user_id: insight.userId,
              pattern_id: insight.patternId || '',
              predictive_rule_id: insight.predictiveRuleId || '',
              title: insight.title,
              message: insight.message,
              insight_type: insight.insightType,
              priority: insight.priority,
              trigger_event: insight.triggerEvent,
              trigger_time: insight.triggerTime,
              delivery_time: insight.deliveryTime || new Date().toISOString(),
              expiration_time: insight.expirationTime,
              confidence: insight.confidence,
              delivered: false,
              acknowledged: false,
              communication_style: insight.communicationStyle || 'balanced',
              personalized_for_blueprint: insight.personalizedForBlueprint || false
            })
            .select()

          if (insertError) {
            console.error(`Error storing insight ${insight.id}:`, insertError)
          } else {
            storedInsights.push(insertedInsight[0])
            console.log(`✅ Insight stored: ${insight.id}`)
          }
        } catch (error) {
          console.error(`Error storing insight ${insight.id}:`, error)
        }
      }

      console.log(`✅ Insight generation complete: ${storedInsights.length} insights generated`)

      return new Response(
        JSON.stringify({ 
          success: true, 
          insights: storedInsights,
          rulesCount: rules?.length || 0,
          eventsCount: astroEvents?.length || 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (req.method === 'GET') {
      // Get current insights for user
      const { data: insights, error } = await supabaseClient
        .from('pie_insights')
        .select('*')
        .eq('user_id', user.id)
        .gte('expiration_time', new Date().toISOString())
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching insights:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch insights' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, insights: insights || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('PIE Insights Generation Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateInsightFromRuleAndEvent(rule: any, event: any, userId: string) {
  try {
    const eventName = event.event_type?.replace(/_/g, ' ') || 'astrological event'
    const magnitude = Math.round(rule.magnitude * 100)
    const dataTypes = rule.user_data_types?.join(' and ') || 'well-being'
    
    let message = ''
    let title = ''
    let insightType = 'awareness'
    let priority = 'medium'

    if (rule.direction === 'positive') {
      title = `Opportunity Ahead: ${eventName.replace(/\b\w/g, l => l.toUpperCase())}`
      message = `Based on your personal patterns, ${eventName} tends to boost your ${dataTypes} by about ${magnitude}%. This is a great time to tackle challenging tasks or make important decisions.`
      insightType = 'opportunity'
      priority = rule.confidence > 0.7 ? 'high' : 'medium'
    } else if (rule.direction === 'negative') {
      title = `Heads Up: ${eventName.replace(/\b\w/g, l => l.toUpperCase())} Approaching`
      message = `I've noticed that ${eventName} typically affects your ${dataTypes} by about ${magnitude}%. Consider scheduling lighter activities and being extra gentle with yourself during this time.`
      insightType = 'warning'
      priority = rule.confidence > 0.8 ? 'high' : 'medium'
    } else {
      title = `Cosmic Awareness: ${eventName.replace(/\b\w/g, l => l.toUpperCase())}`
      message = `${eventName.replace(/\b\w/g, l => l.toUpperCase())} is approaching. While I haven't detected a strong pattern in how this affects you personally, it might be worth paying attention to your ${dataTypes} during this time.`
    }

    const confidencePercent = Math.round(rule.confidence * 100)
    message += ` (Based on ${confidencePercent}% confidence from your personal data patterns)`

    return {
      id: crypto.randomUUID(),
      userId: userId,
      patternId: '',
      predictiveRuleId: rule.id,
      title: title,
      message: message,
      insightType: insightType,
      priority: priority,
      triggerEvent: event.event_type,
      triggerTime: event.start_time,
      deliveryTime: new Date().toISOString(),
      expirationTime: event.end_time || new Date(new Date(event.start_time).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      confidence: rule.confidence,
      communicationStyle: 'balanced',
      personalizedForBlueprint: false
    }
  } catch (error) {
    console.error('Error generating insight from rule and event:', error)
    return null
  }
}

function generateInsightFromPattern(pattern: any, userId: string) {
  try {
    const dataType = pattern.data_type?.replace(/_/g, ' ') || 'activity'
    const patternType = pattern.pattern_type
    const strength = Math.round(pattern.correlation_strength * 100)

    let title = ''
    let message = ''

    if (patternType === 'cyclic') {
      if (pattern.cycle_period === 7) {
        title = `Weekly Pattern Detected: ${dataType.replace(/\b\w/g, l => l.toUpperCase())}`
        message = `I've noticed you have a weekly pattern in your ${dataType}. The pattern strength is ${strength}%. You might find it helpful to plan your week around these natural rhythms.`
      } else if (pattern.cycle_period === 24) {
        title = `Daily Rhythm Detected: ${dataType.replace(/\b\w/g, l => l.toUpperCase())}`
        message = `Your ${dataType} follows a daily pattern with ${strength}% consistency. Consider scheduling important activities during your peak times.`
      } else {
        title = `Pattern Discovered: ${dataType.replace(/\b\w/g, l => l.toUpperCase())}`
        message = `I've identified a ${pattern.cycle_period}-day cycle in your ${dataType} with ${strength}% strength. This insight can help you better plan ahead.`
      }
    } else {
      title = `Connection Found: ${dataType.replace(/\b\w/g, l => l.toUpperCase())}`
      message = `I've detected a correlation between your ${dataType} and ${pattern.event_trigger || 'external factors'} with ${strength}% strength. This pattern might help you understand your responses better.`
    }

    return {
      id: crypto.randomUUID(),
      userId: userId,
      patternId: pattern.id,
      predictiveRuleId: '',
      title: title,
      message: message,
      insightType: 'awareness',
      priority: pattern.confidence > 0.7 ? 'medium' : 'low',
      triggerEvent: 'pattern_analysis',
      triggerTime: new Date().toISOString(),
      deliveryTime: new Date().toISOString(),
      expirationTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
      confidence: pattern.confidence,
      communicationStyle: 'balanced',
      personalizedForBlueprint: false
    }
  } catch (error) {
    console.error('Error generating insight from pattern:', error)
    return null
  }
}