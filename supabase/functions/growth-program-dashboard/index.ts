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
      console.log('📊 Fetching Growth Program dashboard data')

      // Get current active program
      const { data: currentProgram, error: programError } = await supabaseClient
        .from('growth_programs')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      // Get all user programs
      const { data: allPrograms, error: allProgramsError } = await supabaseClient
        .from('growth_programs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      let sessions = []
      let sessionStats = {
        totalSessions: 0,
        completedSessions: 0,
        thisWeekSessions: 0,
        averageSessionDuration: 0
      }

      if (currentProgram) {
        // Get sessions for current program
        const { data: sessionData, error: sessionError } = await supabaseClient
          .from('growth_sessions')
          .select('*')
          .eq('program_id', currentProgram.id)
          .order('created_at', { ascending: false })

        if (!sessionError && sessionData) {
          sessions = sessionData
          
          // Calculate session statistics
          sessionStats.totalSessions = sessions.length
          sessionStats.completedSessions = sessions.filter(s => s.completed_at).length
          
          // This week sessions (last 7 days)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          sessionStats.thisWeekSessions = sessions.filter(s => 
            new Date(s.started_at) >= weekAgo
          ).length
          
          // Average session duration for completed sessions
          const completedSessions = sessions.filter(s => s.completed_at)
          if (completedSessions.length > 0) {
            const totalDuration = completedSessions.reduce((sum, session) => {
              const start = new Date(session.started_at)
              const end = new Date(session.completed_at)
              return sum + (end.getTime() - start.getTime())
            }, 0)
            sessionStats.averageSessionDuration = Math.round(totalDuration / completedSessions.length / 1000 / 60) // minutes
          }
        }
      }

      // Calculate overall progress metrics
      const progressMetrics = {
        totalPrograms: allPrograms?.length || 0,
        activePrograms: allPrograms?.filter(p => p.status === 'active').length || 0,
        completedPrograms: allPrograms?.filter(p => p.status === 'completed').length || 0,
        totalWeeksCompleted: allPrograms?.reduce((sum, p) => sum + (p.current_week - 1), 0) || 0
      }

      // Generate weekly program structure if current program exists
      let weeklyProgram = []
      if (currentProgram) {
        for (let weekNum = 1; weekNum <= currentProgram.total_weeks; weekNum++) {
          const week = {
            week_number: weekNum,
            theme: getWeekTheme(weekNum),
            focus_area: getDomainFocusArea(currentProgram.domain, getWeekTheme(weekNum)),
            key_activities: getWeekActivities(getWeekTheme(weekNum), currentProgram.program_type),
            tools_unlocked: getWeekTools(getWeekTheme(weekNum)),
            completion_criteria: getCompletionCriteria(getWeekTheme(weekNum)),
            is_unlocked: weekNum <= currentProgram.current_week,
            is_completed: weekNum < currentProgram.current_week,
            sessions: sessions.filter(s => s.week_number === weekNum)
          }
          weeklyProgram.push(week)
        }
      }

      // Build dashboard response
      const dashboardData = {
        currentProgram: currentProgram || null,
        allPrograms: allPrograms || [],
        weeklyProgram: weeklyProgram,
        sessions: sessions,
        sessionStats: sessionStats,
        progressMetrics: progressMetrics,
        systemHealth: {
          programsActive: !programError && currentProgram !== null,
          sessionsTracking: sessions.length > 0,
          dataCollectionActive: (allPrograms?.length || 0) > 0,
          lastUpdated: new Date().toISOString()
        }
      }

      console.log(`✅ Growth Program dashboard data compiled: ${progressMetrics.totalPrograms} programs, ${sessionStats.totalSessions} sessions`)

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
    console.error('Growth Program Dashboard Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Helper functions for program structure
function getWeekTheme(weekNumber: number): string {
  const themes = ['foundation', 'belief_excavation', 'blueprint_activation', 'domain_deep_dive', 'integration', 'graduation']
  const themeIndex = Math.min(weekNumber - 1, themes.length - 1)
  return themes[themeIndex]
}

function getDomainFocusArea(domain: string, theme: string): string {
  const domainFocus = {
    career: {
      foundation: 'Current work satisfaction and energy',
      belief_excavation: 'Limiting beliefs about success and worth',
      blueprint_activation: 'Natural talents and communication style',
      domain_deep_dive: 'Career alignment and next steps',
      integration: 'Work-life balance and growth path',
      graduation: 'Future career vision and action plan'
    },
    relationships: {
      foundation: 'Current relationship patterns and desires',
      belief_excavation: 'Beliefs about love, connection, and vulnerability',
      blueprint_activation: 'Communication style and relationship needs',
      domain_deep_dive: 'Relationship health and growth areas',
      integration: 'Balancing self and others across all relationships',
      graduation: 'Relationship vision and communication improvements'
    }
  }

  return domainFocus[domain]?.[theme] || `${theme} work in ${domain}`
}

function getWeekActivities(theme: string, programType: string): string[] {
  const baseActivities = {
    foundation: ['Initial domain assessment', 'Baseline mood tracking', 'Goal setting conversation'],
    belief_excavation: ['Fear identification', 'Belief mapping', 'Shadow work introduction'],
    blueprint_activation: ['Personality insight session', 'Energy assessment', 'Excitement compass'],
    domain_deep_dive: ['Focused domain work', 'Micro-action planning', 'Progress review'],
    integration: ['Cross-domain patterns', 'Synthesis conversation', 'Integration planning'],
    graduation: ['Progress celebration', 'Future roadmap', 'Program completion']
  }

  let activities = baseActivities[theme] || []
  
  if (programType === 'deep_dive') {
    activities = [...activities, 'Extended reflection', 'Advanced framework work']
  }
  
  return activities
}

function getWeekTools(theme: string): string[] {
  const toolMap = {
    foundation: ['Soul Guide', 'Mood Tracker', 'Insight Journal'],
    belief_excavation: ['Reflection Prompts', 'Belief Interface', 'Shadow Work'],
    blueprint_activation: ['Blueprint Chat', 'Excitement Compass', 'Energy Check'],
    domain_deep_dive: ['Domain-specific prompts', 'Micro-actions', 'Progress tracking'],
    integration: ['Weekly Insights', 'Cross-domain chat', 'Pattern recognition'],
    graduation: ['Growth Dashboard', 'Celebration ritual', 'Future planning']
  }

  return toolMap[theme] || []
}

function getCompletionCriteria(theme: string): string[] {
  const criteriaMap = {
    foundation: ['Complete baseline assessment', 'Set domain goals', 'First mood entry'],
    belief_excavation: ['Identify 2-3 key beliefs', 'Complete fear exploration', 'Begin belief reframe'],
    blueprint_activation: ['Understand personality insights', 'Rate excitement levels', 'Identify energy patterns'],
    domain_deep_dive: ['Complete domain assessment', 'Define 3 micro-actions', 'Track daily progress'],
    integration: ['Connect domain to other areas', 'Synthesize weekly learnings', 'Plan integration'],
    graduation: ['Review all progress', 'Celebrate achievements', 'Set future intentions']
  }

  return criteriaMap[theme] || []
}