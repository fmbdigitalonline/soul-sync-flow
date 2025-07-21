
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Bell, Brain, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { pieService } from '@/services/pie-service';
import { PIEInsight } from '@/types/pie-types';
import { useAuth } from '@/contexts/AuthContext';

export const PIENotificationSystem: React.FC = () => {
  const [pendingInsights, setPendingInsights] = useState<PIEInsight[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const checkForNewInsights = async () => {
      try {
        await pieService.initialize(user.id);
        const insights = await pieService.getCurrentInsights();
        
        // Find undelivered high-priority insights
        const newHighPriorityInsights = insights.filter(
          insight => !insight.delivered && 
          (insight.priority === 'critical' || insight.priority === 'high')
        );

        if (newHighPriorityInsights.length > 0) {
          setPendingInsights(newHighPriorityInsights);
          showInsightNotifications(newHighPriorityInsights);
        }
      } catch (error) {
        console.error('Error checking for PIE insights:', error);
      }
    };

    // Check immediately and then every 5 minutes
    checkForNewInsights();
    const interval = setInterval(checkForNewInsights, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  const showInsightNotifications = (insights: PIEInsight[]) => {
    insights.forEach((insight, index) => {
      setTimeout(() => {
        toast.custom((t) => (
          <Card className="p-4 max-w-md bg-gradient-subtle border-l-4 border-l-primary">
            <div className="flex items-start space-x-3">
              <Brain className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm font-cormorant text-foreground">{insight.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 font-inter">{insight.message}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded font-inter">
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
