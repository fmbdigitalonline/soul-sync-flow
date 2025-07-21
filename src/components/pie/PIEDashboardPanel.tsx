
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, TrendingUp, Star, Settings, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import { pieService } from '@/services/pie-service';
import { PIEInsight } from '@/types/pie-types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const PIEDashboardPanel: React.FC = () => {
  const [insights, setInsights] = useState<PIEInsight[]>([]);
  const [pieHealth, setPieHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    initializePIE();
  }, [user]);

  const initializePIE = async () => {
    if (!user?.id) return;

    try {
      console.log('🔮 Initializing PIE for dashboard');
      await pieService.initialize(user.id);
      
      const currentInsights = await pieService.getCurrentInsights();
      const healthStatus = pieService.getPIEHealth();
      
      setInsights(currentInsights);
      setPieHealth(healthStatus);
      
      console.log(`✅ PIE Dashboard: ${currentInsights.length} insights loaded`);
    } catch (error) {
      console.error('❌ PIE Dashboard initialization error:', error);
      toast.error('Failed to load PIE insights');
    } finally {
      setLoading(false);
    }
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <Star className="w-4 h-4 text-destructive" />;
      case 'high': return <TrendingUp className="w-4 h-4 text-warning" />;
      case 'medium': return <Brain className="w-4 h-4 text-secondary" />;
      default: return <Sparkles className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-destructive/10 text-destructive';
      case 'high': return 'bg-warning/10 text-warning';
      case 'medium': return 'bg-secondary/10 text-secondary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 animate-pulse text-primary" />
          <span className="font-inter text-muted-foreground">Loading PIE insights...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-semibold font-cormorant text-foreground">AI Insights (PIE)</h3>
          <Badge variant={pieHealth?.enabled ? "default" : "secondary"}>
            {pieHealth?.enabled ? "Active" : "Inactive"}
          </Badge>
        </div>
        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <Brain className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm font-inter">Building your personalized insights...</p>
          <p className="text-xs mt-1 font-inter">Keep using the app to unlock AI-powered patterns!</p>
        </div>
      ) : (
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {insights.map((insight) => (
              <div key={insight.id} className="border rounded-lg p-3 bg-gradient-subtle">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getPriorityIcon(insight.priority)}
                    <Badge variant="outline" className={getPriorityColor(insight.priority)}>
                      {insight.priority}
                    </Badge>
                  </div>
                  <Badge variant="outline">
                    {Math.round(insight.confidence * 100)}% confidence
                  </Badge>
                </div>
                
                <h4 className="font-medium text-sm mb-1 font-cormorant text-foreground">{insight.title}</h4>
                <p className="text-xs text-muted-foreground mb-3 font-inter">{insight.message}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-inter">
                    {insight.insightType} • {new Date(insight.triggerTime).toLocaleDateString()}
                  </span>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleInsightFeedback(insight.id, true)}
                      className="h-6 w-6 p-0"
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleInsightFeedback(insight.id, false)}
                      className="h-6 w-6 p-0"
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {pieHealth && (
        <div className="mt-4 pt-3 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-inter">
            <span>Patterns: {pieHealth.patternDetectionActive ? '✅' : '❌'}</span>
            <span>Data: {pieHealth.dataCollectionActive ? '✅' : '❌'}</span>
            <span>Scheduling: {pieHealth.schedulingActive ? '✅' : '❌'}</span>
          </div>
        </div>
      )}
    </Card>
  );
};
