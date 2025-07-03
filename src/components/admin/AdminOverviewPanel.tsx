
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Brain, 
  Zap, 
  Database, 
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { adminAnalyticsService, SystemMetrics } from '@/services/admin-analytics-service';
import { useToast } from '@/hooks/use-toast';

const mockDailyData = [
  { date: '2025-06-25', users: 45, pie: 89, vfp: 92, tmg: 88, acs: 95 },
  { date: '2025-06-26', users: 52, pie: 91, vfp: 94, tmg: 90, acs: 97 },
  { date: '2025-06-27', users: 48, pie: 87, vfp: 89, tmg: 92, acs: 94 },
  { date: '2025-06-28', users: 61, pie: 93, vfp: 96, tmg: 95, acs: 98 },
  { date: '2025-06-29', users: 57, pie: 90, vfp: 93, tmg: 89, acs: 96 },
  { date: '2025-06-30', users: 64, pie: 94, vfp: 97, tmg: 96, acs: 99 },
  { date: '2025-07-01', users: 68, pie: 96, vfp: 98, tmg: 98, acs: 100 }
];

export const AdminOverviewPanel: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', message: 'PIE insight generation rate below target', timestamp: '10 minutes ago' },
    { id: 2, type: 'info', message: 'TMG memory optimization completed', timestamp: '2 hours ago' },
    { id: 3, type: 'success', message: 'ACS intervention success rate improved', timestamp: '4 hours ago' }
  ]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await adminAnalyticsService.getSystemMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load system metrics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading system metrics...</span>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium">Failed to load metrics</p>
          <Button onClick={fetchMetrics} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">System Overview</h2>
        <Button onClick={fetchMetrics} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{metrics.dailyGrowth}% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Real-time active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.systemUptime}%</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Innovations Active</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4/4</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockDailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="pie" stroke="#8884d8" name="PIE" />
                <Line type="monotone" dataKey="vfp" stroke="#82ca9d" name="VFP-Graph" />
                <Line type="monotone" dataKey="tmg" stroke="#ffc658" name="TMG" />
                <Line type="monotone" dataKey="acs" stroke="#ff7300" name="ACS" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Users by Innovation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'PIE', value: metrics.innovations.pie.active },
                { name: 'VFP-Graph', value: metrics.innovations.vfp.active },
                { name: 'TMG', value: metrics.innovations.tmg.active },
                { name: 'ACS', value: metrics.innovations.acs.active }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Innovation Status */}
      <div className="grid grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="w-4 h-4" />
              PIE Status
            </CardTitle>
            <Badge variant="outline" className="text-green-600">Active</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Active Users</span>
              <span className="font-medium">{metrics.innovations.pie.active}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Insights Generated</span>
              <span className="font-medium">{metrics.innovations.pie.insights}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Satisfaction</span>
              <span className="font-medium">{metrics.innovations.pie.satisfaction}/5</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              VFP-Graph Status
            </CardTitle>
            <Badge variant="outline" className="text-green-600">Active</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Active Users</span>
              <span className="font-medium">{metrics.innovations.vfp.active}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Vectors Generated</span>
              <span className="font-medium">{metrics.innovations.vfp.vectors}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Accuracy</span>
              <span className="font-medium">{metrics.innovations.vfp.accuracy}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="w-4 h-4" />
              TMG Status
            </CardTitle>
            <Badge variant="outline" className="text-green-600">Active</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Active Users</span>
              <span className="font-medium">{metrics.innovations.tmg.active}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Memories Stored</span>
              <span className="font-medium">{metrics.innovations.tmg.memories}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Retrieval Rate</span>
              <span className="font-medium">{metrics.innovations.tmg.retrieval}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Settings className="w-4 h-4" />
              ACS Status
            </CardTitle>
            <Badge variant="outline" className="text-green-600">Active</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Active Users</span>
              <span className="font-medium">{metrics.innovations.acs.active}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Interventions</span>
              <span className="font-medium">{metrics.innovations.acs.interventions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Success Rate</span>
              <span className="font-medium">{metrics.innovations.acs.success}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-gray-500">{alert.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
