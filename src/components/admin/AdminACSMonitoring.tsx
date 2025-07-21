
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
      'NORMAL': 'bg-success/10 text-success',
      'FRUSTRATED': 'bg-destructive/10 text-destructive',
      'CONFUSED': 'bg-warning/10 text-warning',
      'CLARIFICATION': 'bg-secondary/10 text-secondary'
    };
    return colors[state as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  const getSuccessIcon = (success: boolean) => {
    return success ? 
      <CheckCircle className="w-4 h-4 text-success" /> : 
      <AlertTriangle className="w-4 h-4 text-destructive" />;
  };

  return (
    <div className="space-y-6">
      {/* ACS Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 font-cormorant text-foreground">
            <Settings className="w-6 h-6 text-primary" />
            ACS (Adaptive Context Scheduler) Monitoring
          </h2>
          <p className="text-muted-foreground mt-1 font-inter">Real-time dialogue state management and adaptive interventions</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-success font-inter">
            95% Production Ready
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
            <CardTitle className="text-sm font-medium">Total Interventions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acsMetrics.totalInterventions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{acsMetrics.dailyInterventions} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acsMetrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Users with ACS active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acsMetrics.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              Intervention success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acsMetrics.avgResponseTime}s</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ACS Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockACSData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="interventions" stroke="#8884d8" name="Interventions" />
                <Line type="monotone" dataKey="success" stroke="#82ca9d" name="Success Rate %" />
                <Line type="monotone" dataKey="states" stroke="#ffc658" name="State Transitions" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dialogue State Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stateDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="state" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* State Distribution Details */}
      <Card>
        <CardHeader>
          <CardTitle>Dialogue State Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stateDistribution.map((state, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className={getStateColor(state.state)}>
                    {state.state}
                  </Badge>
                  <div>
                    <p className="font-medium font-cormorant">{state.count} occurrences</p>
                    <p className="text-sm text-muted-foreground font-inter">{state.percentage}% of total states</p>
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
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detection Accuracy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">System Accuracy</span>
              <span className="font-bold">{acsMetrics.systemAccuracy}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">False Positives</span>
              <span className="font-bold">2.1%</span>
            </div>
            <Progress value={acsMetrics.systemAccuracy} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">User Satisfaction</span>
              <span className="font-bold">{acsMetrics.userSatisfaction}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Seamless Transitions</span>
              <span className="font-bold">94.8%</span>
            </div>
            <Progress value={94.8} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-sm font-inter">State Detection: Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-sm font-inter">Context Analysis: Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-sm font-inter">Intervention Engine: Active</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Interventions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent ACS Interventions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>State Transition</TableHead>
                <TableHead>Trigger Reason</TableHead>
                <TableHead>Success</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentInterventions.map((intervention) => (
                <TableRow key={intervention.id}>
                  <TableCell className="font-medium">{intervention.user}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge className={getStateColor(intervention.from)} variant="outline">
                        {intervention.from}
                      </Badge>
                      <span>→</span>
                      <Badge className={getStateColor(intervention.to)}>
                        {intervention.to}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{intervention.reason}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    {getSuccessIcon(intervention.success)}
                    {intervention.success ? 'Success' : 'Failed'}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-inter">{intervention.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
