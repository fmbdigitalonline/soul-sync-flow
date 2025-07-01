
import React, { useState, useEffect } from 'react';
import { PIEInsightCard } from './PIEInsightCard';
import { PIEPatternVisualization } from './PIEPatternVisualization';
import { pieService } from '@/services/pie-service';
import { PIEInsight } from '@/types/pie-types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PIEContextualInsightsProps {
  context: 'dashboard' | 'coach' | 'productivity' | 'growth';
  compact?: boolean;
  maxInsights?: number;
}

export const PIEContextualInsights: React.FC<PIEContextualInsightsProps> = ({
  context,
  compact = false,
  maxInsights = 3
}) => {
  const [insights, setInsights] = useState<PIEInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadContextualInsights();
  }, [context, user]);

  const loadContextualInsights = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      await pieService.initialize(user.id);
      
      // Get insights relevant to current context
      const allInsights = await pieService.getCurrentInsights();
      const contextualInsights = filterInsightsByContext(allInsights, context);
      
      setInsights(contextualInsights.slice(0, maxInsights));
    } catch (error) {
      console.error('Error loading contextual insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInsightsByContext = (insights: PIEInsight[], context: string): PIEInsight[] => {
    // Filter insights based on context relevance
    const contextKeywords = {
      dashboard: ['overview', 'summary', 'general', 'daily'],
      coach: ['conversation', 'mood', 'support', 'guidance'],
      productivity: ['task', 'focus', 'work', 'efficiency', 'goal'],
      growth: ['development', 'learning', 'progress', 'growth']
    };

    const keywords = contextKeywords[context as keyof typeof contextKeywords] || [];
    
    return insights.filter(insight => {
      const content = `${insight.title} ${insight.message}`.toLowerCase();
      return keywords.some(keyword => content.includes(keyword)) ||
             insight.priority === 'critical' || insight.priority === 'high';
    });
  };

  const handleInsightFeedback = async (insightId: string, isPositive: boolean) => {
    try {
      // Record feedback for PIE learning
      console.log(`📝 Recording PIE insight feedback: ${insightId} -> ${isPositive ? '👍' : '👎'}`);
      toast.success(isPositive ? 'Thanks for the positive feedback!' : 'Thanks for the feedback - we\'ll improve!');
    } catch (error) {
      console.error('Error recording feedback:', error);
    }
  };

  const handleInsightDismiss = (insightId: string) => {
    setInsights(prev => prev.filter(insight => insight.id !== insightId));
    toast.success('Insight dismissed');
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (insights.length === 0) {
    return null; // Don't show anything if no contextual insights
  }

  return (
    <div className="space-y-3">
      {insights.map((insight) => (
        <PIEInsightCard
          key={insight.id}
          insight={insight}
          onFeedback={handleInsightFeedback}
          onDismiss={handleInsightDismiss}
          compact={compact}
        />
      ))}
    </div>
  );
};
