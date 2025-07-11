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

    // Prevent too frequent insight generation (minimum 5 minutes between insights)
    const now = Date.now();
    if (now - lastInsightTime < 5 * 60 * 1000) {
      console.log('Too soon for next insight, waiting...');
      return null;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('hacs-authentic-insights', {
        body: {
          userId: user.id,
          sessionId: `insight_${Date.now()}`,
          currentContext: currentContext || 'general_usage'
        }
      });

      if (error) throw error;

      if (data.insight) {
        const insight: HACSInsight = {
          id: data.insight.id,
          text: data.insight.text,
          module: data.insight.module,
          type: data.insight.type,
          confidence: data.insight.confidence,
          evidence: data.insight.evidence || [],
          timestamp: new Date(),
          acknowledged: false
        };

        setCurrentInsight(insight);
        setInsightHistory(prev => [insight, ...prev].slice(0, 20)); // Keep last 20 insights
        setLastInsightTime(now);

        console.log('Generated authentic insight:', {
          module: insight.module,
          type: insight.type,
          confidence: insight.confidence,
          dataAnalyzed: data.dataAnalyzed
        });

        return insight;
      } else {
        console.log('No insight generated:', data.reason, data.message);
        return null;
      }

    } catch (error) {
      console.error('Error generating insight:', error);
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
    // Track the activity first
    await trackActivity(activityType, context);

    // Only generate insights for meaningful activities
    const meaningfulActivities = [
      'blueprint_completed',
      'learning_session_completed',
      'conversation_ended',
      'task_completed',
      'pattern_detected'
    ];

    if (meaningfulActivities.includes(activityType)) {
      // Random chance to generate insight (30% for high-value activities)
      const shouldGenerate = Math.random() < 0.3;
      
      if (shouldGenerate && !currentInsight) {
        const insight = await generateInsight(activityType);
        return insight;
      }
    }

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