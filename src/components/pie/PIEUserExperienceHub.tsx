
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Settings, History, TrendingUp, Sparkles } from 'lucide-react';
import { PIEInsight } from '@/types/pie-types';
import { PIEInsightPreview } from './PIEInsightPreview';
import { PIEPreferencesPanel } from './PIEPreferencesPanel';
import { PIEFeedbackSystem } from './PIEFeedbackSystem';
import { pieService } from '@/services/pie-service';
import { useAuth } from '@/contexts/AuthContext';

export const PIEUserExperienceHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('insights');
  const [insights, setInsights] = useState<PIEInsight[]>([]);
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadInsights();
  }, [user]);

  const loadInsights = async () => {
    if (!user?.id) return;

    try {
      await pieService.initialize(user.id);
      const currentInsights = await pieService.getCurrentInsights();
      setInsights(currentInsights);
    } catch (error) {
      console.error('Error loading PIE insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInsight = (insightId: string) => {
    console.log('📖 Viewing insight:', insightId);
    // Mark insight as viewed
    pieService.markInsightAsViewed(insightId);
  };

  const handleDismissInsight = (insightId: string) => {
    setInsights(prev => prev.filter(insight => insight.id !== insightId));
    pieService.dismissInsight(insightId);
  };

  const toggleInsightExpanded = (insightId: string) => {
    setExpandedInsights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(insightId)) {
        newSet.delete(insightId);
      } else {
        newSet.add(insightId);
      }
      return newSet;
    });
  };

  const getInsightsByPriority = (priority: string) => {
    return insights.filter(insight => insight.priority === priority);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center space-x-2">
          <Brain className="w-6 h-6 animate-pulse text-purple-600" />
          <span>Loading PIE Experience Hub...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Sparkles className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-bold">PIE Experience Hub</h2>
        <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-pink-100">
          {insights.length} Active Insights
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights" className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>Insights</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="w-4 h-4" />
            <span>History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="mt-6">
          {insights.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Active Insights</h3>
              <p className="text-sm text-gray-500">
                Keep using the app to generate personalized insights!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Critical Insights */}
              {getInsightsByPriority('critical').length > 0 && (
                <div>
                  <h3 className="font-semibold text-red-700 mb-3 flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Critical Insights</span>
                  </h3>
                  <div className="space-y-2">
                    {getInsightsByPriority('critical').map(insight => (
                      <PIEInsightPreview
                        key={insight.id}
                        insight={insight}
                        onView={handleViewInsight}
                        onDismiss={handleDismissInsight}
                        isExpanded={expandedInsights.has(insight.id)}
                        onToggleExpanded={toggleInsightExpanded}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* High Priority Insights */}
              {getInsightsByPriority('high').length > 0 && (
                <div>
                  <h3 className="font-semibold text-orange-700 mb-3">High Priority</h3>
                  <div className="space-y-2">
                    {getInsightsByPriority('high').map(insight => (
                      <PIEInsightPreview
                        key={insight.id}
                        insight={insight}
                        onView={handleViewInsight}
                        onDismiss={handleDismissInsight}
                        isExpanded={expandedInsights.has(insight.id)}
                        onToggleExpanded={toggleInsightExpanded}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Medium Priority Insights */}
              {getInsightsByPriority('medium').length > 0 && (
                <div>
                  <h3 className="font-semibold text-blue-700 mb-3">Medium Priority</h3>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {getInsightsByPriority('medium').map(insight => (
                        <PIEInsightPreview
                          key={insight.id}
                          insight={insight}
                          onView={handleViewInsight}
                          onDismiss={handleDismissInsight}
                          isExpanded={expandedInsights.has(insight.id)}
                          onToggleExpanded={toggleInsightExpanded}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <PIEPreferencesPanel />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="text-center py-12">
            <History className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Insight History</h3>
            <p className="text-sm text-gray-500">
              View your past insights and their impact on your journey.
            </p>
            <Button variant="outline" className="mt-4" disabled>
              Coming Soon
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
