
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
  { name: 'Mood Patterns', value: 35, color: 'hsl(var(--color-interactive-secondary))' },
  { name: 'Productivity', value: 28, color: 'hsl(var(--color-state-success))' },
  { name: 'Behavioral', value: 22, color: 'hsl(var(--color-state-warning))' },
  { name: 'Predictive', value: 15, color: 'hsl(var(--color-interactive-primary))' }
];

export const AdminPIEMonitoring: React.FC = () => {
  const [pieMetrics, setPieMetrics] = useState({
    totalInsights: 2847,
    activeUsers: 45,
    avgAccuracy: 94.2,
    userSatisfaction: 4.4,
    insightGeneration: 87, // insights per day
    dataPoints: 15634,
    patternDetection: 92.1,
    deliveryRate: 89.3
  });

  const [recentInsights, setRecentInsights] = useState([
    { id: 1, user: 'User #1247', type: 'mood', insight: 'Productivity peaks detected during morning hours', confidence: 94, delivered: true },
    { id: 2, user: 'User #1089', type: 'behavioral', insight: 'Stress patterns correlate with workload spikes', confidence: 87, delivered: true },
    { id: 3, user: 'User #1356', type: 'predictive', insight: 'Optimal rest period recommended for next week', confidence: 91, delivered: false },
    { id: 4, user: 'User #1124', type: 'productivity', insight: 'Focus session timing could be optimized', confidence: 88, delivered: true }
  ]);

  const handleRefreshMetrics = () => {
    // Simulate data refresh
    console.log('Refreshing PIE metrics...');
  };

  const getInsightTypeColor = (type: string) => {
    const colors = {
      mood: 'bg-interactive-secondary/10 text-interactive-secondary',
      behavioral: 'bg-state-success/10 text-state-success',
      predictive: 'bg-interactive-primary/10 text-interactive-primary',
      productivity: 'bg-state-warning/10 text-state-warning'
    };
    return colors[type as keyof typeof colors] || 'bg-surface-tertiary text-content-tertiary';
  };

  return (
    <div className="space-content">
      {/* PIE Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading-lg flex items-center gap-2 text-content-primary">
            <Brain className="w-6 h-6 text-interactive-primary" />
            PIE (Proactive Insight Engine) Monitoring
          </h2>
          <p className="text-content-secondary mt-1 text-caption-base">Real-time analytics for intelligent insight generation</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-interactive-secondary">
            85% Beta Ready
          </Badge>
          <Button onClick={handleRefreshMetrics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-component">
        <Card className="bg-surface-secondary border-subtle shadow-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-component-sm">
            <CardTitle className="text-body-sm text-content-secondary">Total Insights</CardTitle>
            <MessageSquare className="h-4 w-4 text-content-tertiary" />
          </CardHeader>
          <CardContent>
            <div className="text-heading-md text-content-primary">{pieMetrics.totalInsights.toLocaleString()}</div>
            <p className="text-caption-sm text-content-tertiary">
              +{pieMetrics.insightGeneration} generated today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface-secondary border-subtle shadow-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-component-sm">
            <CardTitle className="text-body-sm text-content-secondary">Active Users</CardTitle>
            <Users className="h-4 w-4 text-content-tertiary" />
          </CardHeader>
          <CardContent>
            <div className="text-heading-md text-content-primary">{pieMetrics.activeUsers}</div>
            <p className="text-caption-sm text-content-tertiary">
              Users with PIE enabled
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface-secondary border-subtle shadow-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-component-sm">
            <CardTitle className="text-body-sm text-content-secondary">Avg Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-content-tertiary" />
          </CardHeader>
          <CardContent>
            <div className="text-heading-md text-content-primary">{pieMetrics.avgAccuracy}%</div>
            <p className="text-caption-sm text-content-tertiary">
              Insight accuracy rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface-secondary border-subtle shadow-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-component-sm">
            <CardTitle className="text-body-sm text-content-secondary">User Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-content-tertiary" />
          </CardHeader>
          <CardContent>
            <div className="text-heading-md text-content-primary">{pieMetrics.userSatisfaction}/5</div>
            <p className="text-caption-sm text-content-tertiary">
              Average user rating
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-component">
        <Card className="bg-surface-secondary border-subtle shadow-elevated">
          <CardHeader>
            <CardTitle className="text-heading-sm text-content-primary">PIE Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockPIEData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border-subtle" />
                <XAxis dataKey="date" className="text-content-tertiary" />
                <YAxis className="text-content-tertiary" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--color-surface-secondary))',
                    border: '1px solid hsl(var(--color-border-subtle))',
                    borderRadius: 'var(--radius-md)'
                  }}
                />
                <Line type="monotone" dataKey="insights" stroke="hsl(var(--color-interactive-primary))" name="Daily Insights" strokeWidth={2} />
                <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--color-state-success))" name="Accuracy %" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-surface-secondary border-subtle shadow-elevated">
          <CardHeader>
            <CardTitle className="text-heading-sm text-content-primary">Insight Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={insightTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="hsl(var(--color-interactive-primary))"
                  dataKey="value"
                  label
                >
                  {insightTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--color-surface-secondary))',
                    border: '1px solid hsl(var(--color-border-subtle))',
                    borderRadius: 'var(--radius-md)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-component">
        <Card className="bg-surface-secondary border-subtle shadow-elevated">
          <CardHeader>
            <CardTitle className="text-heading-sm text-content-primary">Data Collection</CardTitle>
          </CardHeader>
          <CardContent className="space-component">
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-content-secondary">Data Points</span>
              <span className="text-body-base text-content-primary">{pieMetrics.dataPoints.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-content-secondary">Pattern Detection</span>
              <span className="text-body-base text-content-primary">{pieMetrics.patternDetection}%</span>
            </div>
            <Progress value={pieMetrics.patternDetection} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-surface-secondary border-subtle shadow-elevated">
          <CardHeader>
            <CardTitle className="text-heading-sm text-content-primary">Delivery Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-component">
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-content-secondary">Delivery Rate</span>
              <span className="text-body-base text-content-primary">{pieMetrics.deliveryRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-content-secondary">Response Time</span>
              <span className="text-body-base text-content-primary">1.2s</span>
            </div>
            <Progress value={pieMetrics.deliveryRate} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-surface-secondary border-subtle shadow-elevated">
          <CardHeader>
            <CardTitle className="text-heading-sm text-content-primary">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-component">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-state-success rounded-shape-full"></div>
              <span className="text-body-sm text-content-secondary">Pattern Engine: Healthy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-state-success rounded-shape-full"></div>
              <span className="text-body-sm text-content-secondary">Data Pipeline: Healthy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-state-warning rounded-shape-full"></div>
              <span className="text-body-sm text-content-secondary">Scheduler: Minor Issues</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Insights */}
      <Card className="bg-surface-secondary border-subtle shadow-elevated">
        <CardHeader>
          <CardTitle className="text-heading-sm text-content-primary">Recent Insights Generated</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-component">
            {recentInsights.map((insight) => (
              <div key={insight.id} className="flex items-center justify-between p-component bg-surface-tertiary rounded-shape-md">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getInsightTypeColor(insight.type)}>
                      {insight.type}
                    </Badge>
                    <span className="text-body-sm text-content-secondary">{insight.user}</span>
                    <Badge variant="outline" className="text-caption-xs text-content-tertiary">
                      {insight.confidence}% confidence
                    </Badge>
                  </div>
                  <p className="text-body-sm text-content-primary">{insight.insight}</p>
                </div>
                <div className="flex items-center gap-2">
                  {insight.delivered ? (
                    <Badge variant="outline" className="text-state-success">Delivered</Badge>
                  ) : (
                    <Badge variant="outline" className="text-state-warning">Pending</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
