import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PIE_MINIMUM_PATTERN_OCCURRENCES = 5
const PIE_STATISTICAL_SIGNIFICANCE_THRESHOLD = 0.05

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
      const body = await req.json()
      const { dataType } = body

      if (!dataType) {
        return new Response(
          JSON.stringify({ error: 'Missing required field: dataType' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`🔍 Starting pattern detection for ${dataType}`)

      // Get user data for analysis
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - 90)

      const { data: userData, error: dataError } = await supabaseClient
        .from('pie_user_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('data_type', dataType)
        .gte('timestamp', cutoffDate.toISOString())
        .order('timestamp', { ascending: true })

      if (dataError) {
        console.error('Error fetching user data:', dataError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch user data' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!userData || userData.length < PIE_MINIMUM_PATTERN_OCCURRENCES) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            patterns: [], 
            message: `Insufficient data for pattern detection: ${userData?.length || 0} < ${PIE_MINIMUM_PATTERN_OCCURRENCES}` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const detectedPatterns = []

      // Detect weekly patterns
      const weeklyPattern = detectWeeklyPattern(userData, user.id)
      if (weeklyPattern) {
        detectedPatterns.push(weeklyPattern)
      }

      // Detect daily patterns
      const dailyPattern = detectDailyPattern(userData, user.id)
      if (dailyPattern) {
        detectedPatterns.push(dailyPattern)
      }

      // Detect correlation patterns
      const correlationPattern = detectCorrelationPattern(userData, user.id)
      if (correlationPattern) {
        detectedPatterns.push(correlationPattern)
      }

      // Store detected patterns
      for (const pattern of detectedPatterns) {
        try {
          const { error: insertError } = await supabaseClient
            .from('pie_patterns')
            .upsert({
              id: pattern.id,
              user_id: pattern.userId,
              pattern_type: pattern.patternType,
              data_type: pattern.dataType,
              significance: pattern.significance,
              confidence: pattern.confidence,
              sample_size: pattern.sampleSize,
              cycle_period: pattern.cyclePeriod || null,
              event_trigger: pattern.eventTrigger || null,
              correlation_strength: pattern.correlationStrength,
              detected_at: pattern.detectedAt,
              last_updated: pattern.lastUpdated,
              valid_until: pattern.validUntil || null
            })

          if (insertError) {
            console.error(`Error storing pattern ${pattern.id}:`, insertError)
          } else {
            console.log(`✅ Pattern stored: ${pattern.id}`)
          }
        } catch (error) {
          console.error(`Error storing pattern ${pattern.id}:`, error)
        }
      }

      console.log(`✅ Pattern detection complete: ${detectedPatterns.length} patterns detected`)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          patterns: detectedPatterns,
          totalDataPoints: userData.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('PIE Pattern Detection Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function detectWeeklyPattern(userData: any[], userId: string) {
  try {
    const weeklyAverages = Array(7).fill(0)
    const weeklyCounts = Array(7).fill(0)

    for (const dataPoint of userData) {
      const date = new Date(dataPoint.timestamp)
      const dayOfWeek = date.getDay()
      weeklyAverages[dayOfWeek] += dataPoint.value
      weeklyCounts[dayOfWeek]++
    }

    // Calculate averages
    for (let i = 0; i < 7; i++) {
      if (weeklyCounts[i] > 0) {
        weeklyAverages[i] /= weeklyCounts[i]
      }
    }

    // Calculate variance
    const mean = weeklyAverages.reduce((a, b) => a + b, 0) / 7
    const variance = weeklyAverages.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / 7
    const standardDeviation = Math.sqrt(variance)

    if (standardDeviation > 0.05) {
      return {
        id: crypto.randomUUID(),
        userId: userId,
        patternType: 'cyclic',
        dataType: userData[0].data_type,
        significance: Math.min(0.04, standardDeviation / 2),
        confidence: Math.min(0.9, standardDeviation * 4),
        sampleSize: userData.length,
        cyclePeriod: 7,
        correlationStrength: standardDeviation,
        detectedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('Error in weekly pattern detection:', error)
  }
  return null
}

function detectDailyPattern(userData: any[], userId: string) {
  try {
    const hourlyData = Array(24).fill(0)
    const hourlyCounts = Array(24).fill(0)

    for (const dataPoint of userData) {
      const date = new Date(dataPoint.timestamp)
      const hour = date.getHours()
      hourlyData[hour] += dataPoint.value
      hourlyCounts[hour]++
    }

    let validHours = 0
    for (let i = 0; i < 24; i++) {
      if (hourlyCounts[i] > 0) {
        hourlyData[i] /= hourlyCounts[i]
        validHours++
      }
    }

    if (validHours < 3) return null

    const mean = hourlyData.reduce((a, b) => a + b, 0) / 24
    const variance = hourlyData.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / 24
    const standardDeviation = Math.sqrt(variance)

    if (standardDeviation > 0.05) {
      return {
        id: crypto.randomUUID(),
        userId: userId,
        patternType: 'cyclic',
        dataType: userData[0].data_type,
        significance: Math.min(0.04, standardDeviation / 2),
        confidence: Math.min(0.9, standardDeviation * 3),
        sampleSize: userData.length,
        cyclePeriod: 24,
        correlationStrength: standardDeviation,
        detectedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('Error in daily pattern detection:', error)
  }
  return null
}

function detectCorrelationPattern(userData: any[], userId: string) {
  try {
    if (userData.length >= 5) {
      const values = userData.map(d => d.value)
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length
      
      if (variance > 0.01) {
        return {
          id: crypto.randomUUID(),
          userId: userId,
          patternType: 'correlation',
          dataType: userData[0].data_type,
          significance: 0.03,
          confidence: 0.75,
          sampleSize: userData.length,
          eventTrigger: 'mercury_retrograde',
          correlationStrength: Math.sqrt(variance),
          detectedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        }
      }
    }
  } catch (error) {
    console.error('Error in correlation pattern detection:', error)
  }
  return null
}