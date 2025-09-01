
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Bell, Brain, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { pieService } from '@/services/pie-service';
import { PIEInsight } from '@/types/pie-types';
import { useAuth } from '@/contexts/AuthContext';
import { SmartInsightController } from '@/services/smart-insight-controller';

export const PIENotificationSystem: React.FC = () => {
  const [pendingInsights, setPendingInsights] = useState<PIEInsight[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    // Track user activity
    SmartInsightController.trackUserActivity(user.id, 'app_open');

    const checkForSmartInsights = async () => {
      try {
        // Check for conversation-derived insights first (no daily limit)
        if (SmartInsightController.canDeliverConversationInsight(user.id)) {
          const conversationInsights = await SmartInsightController.generateConversationInsights(user.id);
          if (conversationInsights.length > 0) {
            // Convert to PIE format for display
            const pieInsights: PIEInsight[] = conversationInsights.map(insight => ({
              id: insight.id,
              title: insight.title,
              message: insight.message,
              type: insight.type as any,
              priority: insight.priority,
              confidence: insight.confidence,
              delivered: false,
              acknowledged: false,
              scheduledFor: new Date(),
              createdAt: new Date(),
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
              trigger: 'conversation_pattern',
              userId: user.id,
              patternId: '',
              predictiveRuleId: '',
              insightType: 'awareness',
              triggerEvent: 'conversation_analysis',
              triggerTime: new Date().toISOString(),
              deliveryTime: new Date().toISOString(),
              expirationTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              communicationStyle: 'mystical',
              personalizedForBlueprint: true,
              data: {
                conversationContext: insight.conversationContext,
                actionableSteps: insight.actionableSteps
              }
            }));

            setPendingInsights(pieInsights);
            showInsightNotifications(pieInsights);
            SmartInsightController.recordInsightDelivery(user.id, 'conversation');
            return;
          }
        }

        // Check for analytical insights (max 1 per day, only if sufficient data)
        if (SmartInsightController.canDeliverAnalyticalInsight(user.id)) {
          const hasSufficientData = await SmartInsightController.hasSufficientDataForAnalytics(user.id);
          
          if (hasSufficientData) {
            await pieService.initialize(user.id);
            const insights = await pieService.getCurrentInsights();
            
            // Find undelivered high-priority insights
            const newHighPriorityInsights = insights.filter(
              insight => !insight.delivered && 
              (insight.priority === 'critical' || insight.priority === 'high')
            );

            if (newHighPriorityInsights.length > 0) {
              setPendingInsights(newHighPriorityInsights.slice(0, 1)); // Limit to 1 analytical insight
              showInsightNotifications(newHighPriorityInsights.slice(0, 1));
              SmartInsightController.recordInsightDelivery(user.id, 'analytical');
            }
          }
        }
      } catch (error) {
        console.error('Error checking for smart insights:', error);
      }
    };

    // Check immediately
    checkForSmartInsights();

    // Set up activity tracking for idle detection
    let idleTimer: NodeJS.Timeout;
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      SmartInsightController.trackUserActivity(user.id, 'idle_end');
      idleTimer = setTimeout(() => {
        SmartInsightController.trackUserActivity(user.id, 'idle_start');
      }, 60 * 60 * 1000); // 1 hour idle threshold
    };

    // Track user interactions
    const trackActivity = () => resetIdleTimer();
    document.addEventListener('mousedown', trackActivity);
    document.addEventListener('keydown', trackActivity);
    document.addEventListener('scroll', trackActivity);
    resetIdleTimer();

    // Check for insights when user returns from idle
    const handleVisibilityChange = () => {
      if (!document.hidden && SmartInsightController.userReturnedAfterLeaving(user.id)) {
        checkForSmartInsights();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(idleTimer);
      document.removeEventListener('mousedown', trackActivity);
      document.removeEventListener('keydown', trackActivity);
      document.removeEventListener('scroll', trackActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      SmartInsightController.trackUserActivity(user.id, 'app_close');
    };
  }, [user]);

  const showInsightNotifications = (insights: PIEInsight[]) => {
    insights.forEach((insight, index) => {
      setTimeout(() => {
        toast.custom((t) => (
          <Card className="p-4 max-w-md bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-l-purple-500">
            <div className="flex items-start space-x-3">
              <Brain className="w-5 h-5 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{insight.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{insight.message}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                    PIE Insight • {Math.round(insight.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  toast.dismiss(t);
                  handleInsightDismiss(insight.id);
                }}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ), {
          duration: 8000,
          position: 'top-right',
        });
      }, index * 2000); // Stagger notifications
    });
  };

  const handleInsightDismiss = (insightId: string) => {
    setPendingInsights(prev => prev.filter(insight => insight.id !== insightId));
  };

  return null; // This component only handles notifications, no UI
};
