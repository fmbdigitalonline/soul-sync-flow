
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Settings, 
  TrendingUp, 
  Users, 
  Activity, 
  Target,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const mockACSData = [
  { date: '2025-06-25', interventions: 23, success: 87, states: 156 },
  { date: '2025-06-26', interventions: 31, success: 91, states: 184 },
  { date: '2025-06-27', interventions: 28, success: 89, states: 167 },
  { date: '2025-06-28', interventions: 35, success: 94, states: 201 },
  { date: '2025-06-29', interventions: 42, success: 88, states: 189 },
  { date: '2025-06-30', interventions: 38, success: 96, states: 223 },
  { date: '2025-07-01', interventions: 45, success: 98, states: 245 }
];

const stateDistribution = [
  { state: 'NORMAL', count: 145, percentage: 65 },
  { state: 'FRUSTRATED', count: 45, percentage: 20 },
  { state: 'CONFUSED', count: 25, percentage: 11 },
  { state: 'CLARIFICATION', count: 9, percentage: 4 }
];

export const AdminACSMonitoring: React.FC = () => {
  const [acsMetrics, setAcsMetrics] = useState({
    totalInterventions: 2847,
    activeUsers: 51,
    successRate: 89.3,
    avgResponseTime: 1.2, // seconds
    dailyInterventions: 45,
    stateTransitions: 245,
    systemAccuracy: 95.7,
    userSatisfaction: 4.6
  });

  const [recentInterventions, setRecentInterventions] = useState([
    { id: 1, user: 'User #1247', from: 'NORMAL', to: 'CLARIFICATION', reason: 'Unclear query', success: true, time: '3 min ago' },
    { id: 2, user: 'User #1089', from: 'FRUSTRATED', to: 'NORMAL', reason: 'Adaptive response', success: true, time: '7 min ago' },
    { id: 3, user: 'User #1356', from: 'CONFUSED', to: 'CLARIFICATION', reason: 'Context missing', success: false, time: '12 min ago' },
    { id: 4, user: 'User #1124', from: 'NORMAL', to: 'FRUSTRATED', reason: 'Task complexity', success: true, time: '18 min ago' }
  ]);

  const handleRefreshMetrics = () => {
    console.log('Refreshing ACS metrics...');
  };

  const getStateColor = (state: string) => {
    const colors = {
      'NORMAL': 'bg-state-success/10 text-state-success',
      'FRUSTRATED': 'bg-state-error/10 text-state-error',
      'CONFUSED': 'bg-state-warning/10 text-state-warning',
      'CLARIFICATION': 'bg-interactive-secondary/10 text-interactive-secondary'
    };
    return colors[state as keyof typeof colors] || 'bg-surface-tertiary text-content-tertiary';
  };

  const getSuccessIcon = (success: boolean) => {
    return success ? 
      <CheckCircle className="w-4 h-4 text-state-success" /> : 
      <AlertTriangle className="w-4 h-4 text-state-error" />;
  };

  return (
    <div className="space-content">
      {/* ACS Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading-lg flex items-center gap-2 text-content-primary">
            <Settings className="w-6 h-6 text-interactive-primary" />
            ACS (Adaptive Context Scheduler) Monitoring
          </h2>
          <p className="text-content-secondary mt-1 text-caption-base">Real-time dialogue state management and adaptive interventions</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-state-success">
            95% Production Ready
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
            <CardTitle className="text-body-sm text-content-secondary">Total Interventions</CardTitle>
            <Activity className="h-4 w-4 text-content-tertiary" />
          </CardHeader>
          <CardContent>
            <div className="text-heading-md text-content-primary">{acsMetrics.totalInterventions.toLocaleString()}</div>
            <p className="text-caption-sm text-content-tertiary">
              +{acsMetrics.dailyInterventions} today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface-secondary border-subtle shadow-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-component-sm">
            <CardTitle className="text-body-sm text-content-secondary">Active Users</CardTitle>
            <Users className="h-4 w-4 text-content-tertiary" />
          </CardHeader>
          <CardContent>
            <div className="text-heading-md text-content-primary">{acsMetrics.activeUsers}</div>
            <p className="text-caption-sm text-content-tertiary">
              Users with ACS active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface-secondary border-subtle shadow-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-component-sm">
            <CardTitle className="text-body-sm text-content-secondary">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-content-tertiary" />
          </CardHeader>
          <CardContent>
            <div className="text-heading-md text-content-primary">{acsMetrics.successRate}%</div>
            <p className="text-caption-sm text-content-tertiary">
              Intervention success rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface-secondary border-subtle shadow-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-component-sm">
            <CardTitle className="text-body-sm text-content-secondary">Response Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-content-tertiary" />
          </CardHeader>
          <CardContent>
            <div className="text-heading-md text-content-primary">{acsMetrics.avgResponseTime}s</div>
            <p className="text-caption-sm text-content-tertiary">
              Average response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-component">
        <Card className="bg-surface-secondary border-subtle shadow-elevated">
          <CardHeader>
            <CardTitle className="text-heading-sm text-content-primary">ACS Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockACSData}>
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
                <Line type="monotone" dataKey="interventions" stroke="hsl(var(--color-interactive-primary))" name="Interventions" strokeWidth={2} />
                <Line type="monotone" dataKey="success" stroke="hsl(var(--color-state-success))" name="Success Rate %" strokeWidth={2} />
                <Line type="monotone" dataKey="states" stroke="hsl(var(--color-state-warning))" name="State Transitions" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-surface-secondary border-subtle shadow-elevated">
          <CardHeader>
            <CardTitle className="text-heading-sm text-content-primary">Dialogue State Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stateDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border-subtle" />
                <XAxis dataKey="state" className="text-content-tertiary" />
                <YAxis className="text-content-tertiary" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--color-surface-secondary))',
                    border: '1px solid hsl(var(--color-border-subtle))',
                    borderRadius: 'var(--radius-md)'
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--color-interactive-primary))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* State Distribution Details */}
      <Card className="bg-surface-secondary border-subtle shadow-elevated">
        <CardHeader>
          <CardTitle className="text-heading-sm text-content-primary">Dialogue State Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-component">
            {stateDistribution.map((state, index) => (
              <div key={index} className="flex items-center justify-between p-component bg-surface-tertiary rounded-shape-md">
                <div className="flex items-center gap-3">
                  <Badge className={getStateColor(state.state)}>
                    {state.state}
                  </Badge>
                  <div>
                    <p className="text-body-base text-content-primary">{state.count} occurrences</p>
                    <p className="text-caption-sm text-content-secondary">{state.percentage}% of total states</p>
                  </div>
                </div>
                <div className="w-32">
                  <Progress value={state.percentage} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-component">
        <Card className="bg-surface-secondary border-subtle shadow-elevated">
          <CardHeader>
            <CardTitle className="text-heading-sm text-content-primary">Detection Accuracy</CardTitle>
          </CardHeader>
          <CardContent className="space-component">
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-content-secondary">System Accuracy</span>
              <span className="text-body-base text-content-primary">{acsMetrics.systemAccuracy}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-content-secondary">False Positives</span>
              <span className="text-body-base text-content-primary">2.1%</span>
            </div>
            <Progress value={acsMetrics.systemAccuracy} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-surface-secondary border-subtle shadow-elevated">
          <CardHeader>
            <CardTitle className="text-heading-sm text-content-primary">User Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-component">
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-content-secondary">User Satisfaction</span>
              <span className="text-body-base text-content-primary">{acsMetrics.userSatisfaction}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-content-secondary">Seamless Transitions</span>
              <span className="text-body-base text-content-primary">94.8%</span>
            </div>
            <Progress value={94.8} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-surface-secondary border-subtle shadow-elevated">
          <CardHeader>
            <CardTitle className="text-heading-sm text-content-primary">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-component">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-state-success rounded-shape-full"></div>
              <span className="text-body-sm text-content-secondary">State Detection: Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-state-success rounded-shape-full"></div>
              <span className="text-body-sm text-content-secondary">Context Analysis: Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-state-success rounded-shape-full"></div>
              <span className="text-body-sm text-content-secondary">Intervention Engine: Active</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Interventions */}
      <Card className="bg-surface-secondary border-subtle shadow-elevated">
        <CardHeader>
          <CardTitle className="text-heading-sm text-content-primary">Recent ACS Interventions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-content-secondary">User</TableHead>
                <TableHead className="text-content-secondary">State Transition</TableHead>
                <TableHead className="text-content-secondary">Trigger Reason</TableHead>
                <TableHead className="text-content-secondary">Success</TableHead>
                <TableHead className="text-content-secondary">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentInterventions.map((intervention) => (
                <TableRow key={intervention.id}>
                  <TableCell className="text-body-base text-content-primary">{intervention.user}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge className={getStateColor(intervention.from)} variant="outline">
                        {intervention.from}
                      </Badge>
                      <span className="text-content-tertiary">→</span>
                      <Badge className={getStateColor(intervention.to)}>
                        {intervention.to}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-body-sm text-content-secondary">{intervention.reason}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    {getSuccessIcon(intervention.success)}
                    <span className="text-body-sm text-content-secondary">{intervention.success ? 'Success' : 'Failed'}</span>
                  </TableCell>
                  <TableCell className="text-caption-sm text-content-tertiary">{intervention.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
