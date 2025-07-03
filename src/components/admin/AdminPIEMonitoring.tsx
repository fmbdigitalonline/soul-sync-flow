
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Star,
  AlertTriangle,
  Settings,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { adminAnalyticsService, PIEMetrics } from '@/services/admin-analytics-service';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const mockPIEData = [
  { date: '2025-06-25', insights: 23, accuracy: 87, user_satisfaction: 4.1 },
  { date: '2025-06-26', insights: 31, accuracy: 89, user_satisfaction: 4.3 },
  { date: '2025-06-27', insights: 28, accuracy: 91, user_satisfaction: 4.0 },
  { date: '2025-06-28', insights: 35, accuracy: 93, user_satisfaction: 4.5 },
  { date: '2025-06-29', insights: 42, accuracy: 88, user_satisfaction: 4.2 },
  { date: '2025-06-30', insights: 38, accuracy: 94, user_satisfaction: 4.6 },
  { date: '2025-07-01', insights: 45, accuracy: 96, user_satisfaction: 4.7 }
];

const insightTypes = [
  { name: 'Mood Patterns', value: 35, color: '#8884d8' },
  { name: 'Productivity', value: 28, color: '#82ca9d' },
  { name: 'Behavioral', value: 22, color: '#ffc658' },
  { name: 'Predictive', value: 15, color: '#ff7300' }
];

interface RecentInsight {
  id: number;
  user: string;
  type: string;
  insight: string;
  confidence: number;
  delivered: boolean;
}

export const AdminPIEMonitoring: React.FC = () => {
  const [pieMetrics, setPieMetrics] = useState<PIEMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentInsights, setRecentInsights] = useState<RecentInsight[]>([]);
  const { toast } = useToast();

  const fetchPIEData = async () => {
    try {
      setLoading(true);
      const metrics = await adminAnalyticsService.getPIEMetrics();
      setPieMetrics(metrics);

      // Fetch recent insights
      const { data: insights } = await supabase
        .from('pie_insights')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);

      if (insights) {
        const formattedInsights: RecentInsight[] = insights.map((insight, index) => ({
          id: index + 1,
          user: `User #${insight.user_id.slice(-4)}`,
          type: insight.insight_type || 'general',
          insight: insight.message,
          confidence: Math.round(insight.confidence * 100),
          delivered: insight.delivered
        }));
        setRecentInsights(formattedInsights);
      }
    } catch (error) {
      console.error('Failed to fetch PIE data:', error);
      toast({
        title: "Error",
        description: "Failed to load PIE metrics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPIEData();
  }, []);

  const handleRefreshMetrics = () => {
    fetchPIEData();
  };

  const getInsightTypeColor = (type: string) => {
    const colors = {
      mood: 'bg-blue-100 text-blue-800',
      behavioral: 'bg-green-100 text-green-800',
      predictive: 'bg-purple-100 text-purple-800',
      productivity: 'bg-yellow-100 text-yellow-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading PIE metrics...</span>
      </div>
    );
  }

  if (!pieMetrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium">Failed to load PIE metrics</p>
          <Button onClick={fetchPIEData} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PIE Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            PIE (Proactive Insight Engine) Monitoring
          </h2>
          <p className="text-gray-600 mt-1">Real-time analytics for intelligent insight generation</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600">
            85% Beta Ready
          </Badge>
          <Button onClick={handleRefreshMetrics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pieMetrics.totalInsights.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{pieMetrics.insightGeneration} generated today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pieMetrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Users with PIE enabled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pieMetrics.avgAccuracy}%</div>
            <p className="text-xs text-muted-foreground">
              Insight accuracy rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pieMetrics.userSatisfaction}/5</div>
            <p className="text-xs text-muted-foreground">
              Average user rating
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>PIE Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockPIEData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="insights" stroke="#8884d8" name="Daily Insights" />
                <Line type="monotone" dataKey="accuracy" stroke="#82ca9d" name="Accuracy %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Insight Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={insightTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {insightTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Collection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Data Points</span>
              <span className="font-bold">{pieMetrics.dataPoints.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Pattern Detection</span>
              <span className="font-bold">{pieMetrics.patternDetection}%</span>
            </div>
            <Progress value={pieMetrics.patternDetection} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Delivery Rate</span>
              <span className="font-bold">{pieMetrics.deliveryRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Response Time</span>
              <span className="font-bold">1.2s</span>
            </div>
            <Progress value={pieMetrics.deliveryRate} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Pattern Engine: Healthy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Data Pipeline: Healthy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Scheduler: Minor Issues</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Insights Generated</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentInsights.length > 0 ? (
              recentInsights.map((insight) => (
                <div key={insight.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getInsightTypeColor(insight.type)}>
                        {insight.type}
                      </Badge>
                      <span className="text-sm text-gray-600">{insight.user}</span>
                      <Badge variant="outline" className="text-xs">
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm">{insight.insight}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {insight.delivered ? (
                      <Badge variant="outline" className="text-green-600">Delivered</Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-600">Pending</Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No recent insights found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
