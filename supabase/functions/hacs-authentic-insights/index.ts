import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserActivityPattern {
  timeOfDay: string;
  dayOfWeek: string;
  activityType: string;
  duration: number;
  frequency: number;
}

interface InsightData {
  type: 'productivity' | 'behavioral' | 'growth' | 'learning';
  module: string;
  insight: string;
  confidence: number;
  dataPoints: number;
  evidence: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, sessionId, currentContext } = await req.json();

    console.log('Generating authentic insights for user:', userId);

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get real user activity data (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: activityLogs } = await supabase
      .from('dream_activity_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', thirtyDaysAgo)
      .order('timestamp', { ascending: false })
      .limit(200);

    // Get user's HACS intelligence for context
    const { data: hacsData } = await supabase
      .from('hacs_intelligence')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get user's blueprint for personalization
    const { data: blueprint } = await supabase
      .from('blueprints')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    // Get recent conversation data for context
    const { data: recentConversations } = await supabase
      .from('hacs_conversations')
      .select('conversation_data, last_activity')
      .eq('user_id', userId)
      .order('last_activity', { ascending: false })
      .limit(5);

    if (!activityLogs || activityLogs.length < 2) {
      console.log('Insufficient data for authentic insights');
      return new Response(JSON.stringify({ 
        insight: null,
        reason: 'insufficient_data',
        message: 'HACS needs more interaction data to generate authentic insights.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Analyze real patterns from user data
    const patterns = analyzeUserPatterns(activityLogs);
    const behavioralInsights = extractBehavioralInsights(activityLogs, patterns);
    const learningProgress = analyzeLearningProgress(hacsData, activityLogs);

    // Generate authentic insight using OpenAI
    const insight = await generateAuthenticInsight(
      patterns,
      behavioralInsights,
      learningProgress,
      blueprint,
      recentConversations,
      currentContext
    );

    if (!insight) {
      return new Response(JSON.stringify({ 
        insight: null,
        reason: 'no_patterns_detected',
        message: 'Continue using HACS to unlock personalized insights.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // CRITICAL: Update intelligence from insights generation
    if (insight.confidence > 0.7) {
      // High-confidence insights contribute to learning
      const moduleImprovements = {
        [insight.module]: 0.3, // Small but real improvement
        PIE: 0.2, // Predictive insights always improve PIE
        ACS: 0.1  // Adaptive conversation system learns from context
      };

      // Update HACS intelligence
      const currentModuleScores = hacsData?.module_scores || {};
      const newModuleScores = { ...currentModuleScores };
      
      Object.entries(moduleImprovements).forEach(([module, improvement]) => {
        const currentScore = newModuleScores[module] || 0;
        newModuleScores[module] = Math.min(100, currentScore + improvement);
      });

      const moduleValues = Object.values(newModuleScores);
      const newIntelligenceLevel = moduleValues.reduce((sum: number, score: any) => sum + Number(score), 0) / moduleValues.length;

      await supabase
        .from('hacs_intelligence')
        .update({
          intelligence_level: newIntelligenceLevel,
          module_scores: newModuleScores,
          interaction_count: (hacsData?.interaction_count || 0) + 1,
          last_update: new Date().toISOString(),
          pie_score: newModuleScores.PIE || 0,
          vfp_score: newModuleScores.VFP || 0,
          tmg_score: newModuleScores.TMG || 0,
        })
        .eq('user_id', userId);

      console.log('Intelligence updated from insight generation:', { 
        oldLevel: hacsData?.intelligence_level || 0, 
        newLevel: newIntelligenceLevel 
      });
    }

    // Store the authentic insight for learning
    await supabase.from('hacs_module_insights').insert({
      user_id: userId,
      hacs_module: insight.module,
      insight_type: insight.type,
      insight_data: {
        insight_text: insight.insight,
        confidence_score: insight.confidence,
        data_points: insight.dataPoints,
        evidence: insight.evidence,
        patterns_analyzed: patterns.length
      },
      confidence_score: insight.confidence
    });

    // Log the insight generation
    await supabase.from('dream_activity_logs').insert({
      user_id: userId,
      activity_type: 'hacs_insight_generated',
      activity_data: {
        insight_type: insight.type,
        module: insight.module,
        confidence: insight.confidence,
        data_points_analyzed: activityLogs.length,
        patterns_found: patterns.length,
        intelligence_updated: insight.confidence > 0.7
      },
      session_id: sessionId
    });

    return new Response(JSON.stringify({ 
      insight: {
        id: `insight_${Date.now()}`,
        text: insight.insight,
        module: insight.module,
        type: insight.type,
        confidence: insight.confidence,
        evidence: insight.evidence
      },
      dataAnalyzed: {
        activityLogs: activityLogs.length,
        patterns: patterns.length,
        timeRange: '30 days'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in hacs-authentic-insights function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      insight: null
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function analyzeUserPatterns(activityLogs: any[]): UserActivityPattern[] {
  const patterns: UserActivityPattern[] = [];
  
  // Group activities by hour of day
  const hourlyActivity = activityLogs.reduce((acc, log) => {
    const hour = new Date(log.timestamp).getHours();
    const activityType = log.activity_type;
    
    if (!acc[hour]) acc[hour] = {};
    if (!acc[hour][activityType]) acc[hour][activityType] = 0;
    acc[hour][activityType]++;
    
    return acc;
  }, {});

  // Find peak activity hours
  Object.entries(hourlyActivity).forEach(([hour, activities]) => {
    Object.entries(activities as Record<string, number>).forEach(([type, count]) => {
      if (count >= 3) { // Significant pattern (at least 3 occurrences)
        patterns.push({
          timeOfDay: hour,
          dayOfWeek: 'varies',
          activityType: type,
          duration: 0,
          frequency: count
        });
      }
    });
  });

  return patterns;
}

function extractBehavioralInsights(activityLogs: any[], patterns: UserActivityPattern[]): any[] {
  const insights = [];
  
  // Analyze learning response times
  const learningActivities = activityLogs.filter(log => 
    log.activity_type === 'hacs_response_analysis' || 
    log.activity_type === 'hacs_intelligent_conversation'
  );

  if (learningActivities.length > 0) {
    const avgResponseQuality = learningActivities
      .filter(log => log.activity_data?.comprehension_score)
      .reduce((sum, log) => sum + (log.activity_data.comprehension_score || 0), 0) / learningActivities.length;

    insights.push({
      type: 'learning_quality',
      value: avgResponseQuality,
      count: learningActivities.length
    });
  }

  // Analyze session patterns
  const sessionLengths = patterns
    .filter(p => p.frequency > 2)
    .map(p => p.frequency);

  if (sessionLengths.length > 0) {
    const avgSessionLength = sessionLengths.reduce((a, b) => a + b, 0) / sessionLengths.length;
    insights.push({
      type: 'engagement_pattern',
      value: avgSessionLength,
      peakHours: patterns.filter(p => p.frequency >= Math.max(...sessionLengths) * 0.8)
    });
  }

  return insights;
}

function analyzeLearningProgress(hacsData: any, activityLogs: any[]): any {
  if (!hacsData) return null;

  const learningActivities = activityLogs.filter(log => 
    log.activity_type === 'hacs_response_analysis'
  );

  const recentLearning = learningActivities.slice(0, 10);
  const validatedLearning = recentLearning.filter(log => 
    log.activity_data?.validated_learning === true
  );

  return {
    totalInteractions: hacsData.interaction_count || 0,
    intelligenceLevel: hacsData.intelligence_level || 0,
    recentValidatedLearning: validatedLearning.length,
    learningEfficiency: recentLearning.length > 0 ? validatedLearning.length / recentLearning.length : 0,
    strongestModules: Object.entries(hacsData.module_scores || {})
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([module, score]) => ({ module, score }))
  };
}

async function generateAuthenticInsight(
  patterns: UserActivityPattern[],
  behavioralInsights: any[],
  learningProgress: any,
  blueprint: any,
  recentConversations: any[],
  currentContext: any
): Promise<InsightData | null> {
  
  // Only generate insights if we have sufficient real data
  if (patterns.length === 0 && behavioralInsights.length === 0) {
    return null;
  }

  const personalityContext = blueprint ? {
    mbti: blueprint.cognition_mbti?.type || 'Unknown',
    hdType: blueprint.energy_strategy_human_design?.type || 'Unknown',
    sunSign: blueprint.archetype_western?.sun_sign || 'Unknown'
  } : null;

  const systemPrompt = `You are HACS (Holistic Adaptive Cognitive System), analyzing real user behavior patterns to generate authentic insights.

REAL DATA ANALYSIS:
- Patterns Detected: ${patterns.length}
- Behavioral Insights: ${behavioralInsights.length}
- Learning Progress: ${learningProgress ? 'Available' : 'Limited'}
- Intelligence Level: ${learningProgress?.intelligenceLevel || 0}%

USER PATTERNS:
${patterns.map(p => `- ${p.activityType} at hour ${p.timeOfDay} (${p.frequency}x)`).join('\n')}

BEHAVIORAL INSIGHTS:
${behavioralInsights.map(i => `- ${i.type}: ${i.value}`).join('\n')}

LEARNING PROGRESS:
${learningProgress ? `
- Total Interactions: ${learningProgress.totalInteractions}
- Learning Efficiency: ${(learningProgress.learningEfficiency * 100).toFixed(1)}%
- Strongest Modules: ${learningProgress.strongestModules.map((m: any) => `${m.module}(${m.score}%)`).join(', ')}
` : 'Limited learning data available'}

PERSONALITY CONTEXT:
${personalityContext ? `${personalityContext.mbti} ${personalityContext.hdType} ${personalityContext.sunSign}` : 'No blueprint data'}

GENERATE ONE AUTHENTIC INSIGHT:
1. Base insight ONLY on the real data provided above
2. Be specific about patterns you actually observe
3. Provide actionable guidance based on their actual behavior
4. Choose the most relevant HACS module based on the insight type
5. Be personal but not intrusive

RESPONSE FORMAT:
{
  "type": "productivity|behavioral|growth|learning",
  "module": "PIE|CNR|TMG|DPEM|ACS|VFP|NIK|CPSR|TWS|HFME|BPSC",
  "insight": "specific insight based on real data",
  "confidence": 0.0-1.0,
  "dataPoints": number_of_data_points_used,
  "evidence": ["specific evidence 1", "specific evidence 2"]
}`;

  const userPrompt = `Current context: ${JSON.stringify(currentContext)}

Generate an authentic insight based ONLY on the real user data patterns provided in the system prompt.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 300,
        temperature: 0.3, // Low temperature for consistent, data-driven insights
      }),
    });

    const data = await response.json();
    const insightText = data.choices[0]?.message?.content?.trim();
    
    console.log('Generated authentic insight:', insightText);

    // Parse and validate the insight
    const insight = JSON.parse(insightText);
    
    return {
      type: insight.type,
      module: insight.module,
      insight: insight.insight,
      confidence: Math.max(0, Math.min(1, insight.confidence)),
      dataPoints: insight.dataPoints || patterns.length + behavioralInsights.length,
      evidence: Array.isArray(insight.evidence) ? insight.evidence : []
    };

  } catch (error) {
    console.error('Error generating authentic insight:', error);
    return null;
  }
}