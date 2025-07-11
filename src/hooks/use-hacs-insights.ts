import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface HACSInsight {
  id: string;
  text: string;
  module: string;
  type: 'productivity' | 'behavioral' | 'growth' | 'learning';
  confidence: number;
  evidence: string[];
  timestamp: Date;
  acknowledged: boolean;
}

export const useHACSInsights = () => {
  const { user } = useAuth();
  const [currentInsight, setCurrentInsight] = useState<HACSInsight | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [insightHistory, setInsightHistory] = useState<HACSInsight[]>([]);
  const [lastInsightTime, setLastInsightTime] = useState<number>(0);

  // Track user activity for insight generation
  const trackActivity = useCallback(async (activityType: string, activityData?: any) => {
    if (!user) return;

    try {
      await supabase.from('dream_activity_logs').insert({
        user_id: user.id,
        activity_type: activityType,
        activity_data: activityData || {},
        session_id: `activity_${Date.now()}`
      });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }, [user]);

  // Generate authentic insights based on real user data
  const generateInsight = useCallback(async (currentContext?: string) => {
    if (!user || isGenerating) return null;

    // Prevent too frequent insight generation (minimum 30 seconds between insights)
    const now = Date.now();
    if (now - lastInsightTime < 30 * 1000) {
      console.log('🔍 Too soon for next insight, waiting...');
      return null;
    }

    console.log('🔍 Generating HACS insight...');
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('hacs-authentic-insights', {
        body: {
          userId: user.id,
          sessionId: `insight_${Date.now()}`,
          currentContext: currentContext || 'general_usage'
        }
      });

      console.log('🔍 Insight edge function response:', { data, error });

      if (error) {
        console.error('🔍 Insight edge function error:', error);
        throw error;
      }

      if (data?.insight) {
        const insight: HACSInsight = {
          id: data.insight.id || `insight_${Date.now()}`,
          text: data.insight.text || data.insight.message,
          module: data.insight.module || data.insight.hacs_module || 'NIK',
          type: data.insight.type || data.insight.insight_type || 'learning',
          confidence: data.insight.confidence || 0.7,
          evidence: data.insight.evidence || [],
          timestamp: new Date(),
          acknowledged: false
        };

        setCurrentInsight(insight);
        setInsightHistory(prev => [insight, ...prev].slice(0, 20)); // Keep last 20 insights
        setLastInsightTime(now);

        console.log('✅ Insight generated successfully:', {
          module: insight.module,
          type: insight.type,
          confidence: insight.confidence,
          dataAnalyzed: data.dataAnalyzed
        });

        return insight;
      } else {
        console.log('❌ No insight in response:', data?.reason, data?.message);
        return null;
      }

    } catch (error) {
      console.error('❌ Error generating insight:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [user, isGenerating, lastInsightTime]);

  // Acknowledge an insight
  const acknowledgeInsight = useCallback((insightId: string) => {
    setCurrentInsight(prev => 
      prev?.id === insightId ? { ...prev, acknowledged: true } : prev
    );
    setInsightHistory(prev => 
      prev.map(insight => 
        insight.id === insightId ? { ...insight, acknowledged: true } : insight
      )
    );
  }, []);

  // Dismiss current insight
  const dismissInsight = useCallback(() => {
    if (currentInsight) {
      acknowledgeInsight(currentInsight.id);
      setCurrentInsight(null);
    }
  }, [currentInsight, acknowledgeInsight]);

  // Smart insight triggers based on real activity patterns
  const triggerInsightCheck = useCallback(async (activityType: string, context?: any) => {
    console.log('🔍 triggerInsightCheck called:', { activityType, currentInsight: !!currentInsight, isGenerating });
    
    // Track the activity first
    await trackActivity(activityType, context);

    // Only generate insights for meaningful activities
    const meaningfulActivities = [
      'blueprint_completed',
      'learning_session_completed',
      'conversation_ended',
      'task_completed',
      'pattern_detected',
      'periodic_activity' // Add periodic activity as meaningful
    ];

    if (meaningfulActivities.includes(activityType)) {
      // High probability to generate insight (70% for meaningful activities)
      const shouldGenerate = Math.random() < 0.7;
      
      console.log('🔍 Should generate insight?', shouldGenerate, 'Activity:', activityType);
      
      if (shouldGenerate && !currentInsight) {
        console.log('🔍 Triggering insight generation...');
        const insight = await generateInsight(activityType);
        console.log('🔍 Insight generation result:', insight ? 'SUCCESS' : 'FAILED');
        return insight;
      }
    }

    console.log('🔍 No insight generated for activity:', activityType);
    return null;
  }, [trackActivity, generateInsight, currentInsight]);

  // Auto-dismiss insights after 2 minutes if not acknowledged
  useEffect(() => {
    if (currentInsight && !currentInsight.acknowledged) {
      const timer = setTimeout(() => {
        dismissInsight();
      }, 2 * 60 * 1000); // 2 minutes

      return () => clearTimeout(timer);
    }
  }, [currentInsight, dismissInsight]);

  return {
    currentInsight,
    insightHistory,
    isGenerating,
    generateInsight,
    acknowledgeInsight,
    dismissInsight,
    triggerInsightCheck,
    trackActivity
  };
};