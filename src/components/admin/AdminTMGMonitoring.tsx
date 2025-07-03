
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  TrendingUp, 
  Users, 
  Activity, 
  Search,
  RefreshCw,
  Network,
  AlertTriangle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminAnalyticsService, TMGMetrics } from '@/services/admin-analytics-service';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const mockTMGData = [
  { date: '2025-06-25', memories: 289, retrievals: 156, latency: 95 },
  { date: '2025-06-26', memories: 312, retrievals: 184, latency: 87 },
  { date: '2025-06-27', memories: 298, retrievals: 167, latency: 92 },
  { date: '2025-06-28', memories: 334, retrievals: 201, latency: 83 },
  { date: '2025-06-29', memories: 321, retrievals: 189, latency: 88 },
  { date: '2025-06-30', memories: 356, retrievals: 223, latency: 79 },
  { date: '2025-07-01', memories: 378, retrievals: 245, latency: 76 }
];

const memoryDistribution = [
  { tier: 'Hot (Active)', count: 1247, percentage: 15, avgLatency: 45 },
  { tier: 'Warm (Recent)', count: 3421, percentage: 42, avgLatency: 120 },
  { tier: 'Cold (Archive)', count: 3567, percentage: 43, avgLatency: 340 }
];

interface RecentActivity {
  id: number;
  user: string;
  action: string;
  type: string;
  importance: number;
  time: string;
}

export const AdminTMGMonitoring: React.FC = () => {
  const [tmgMetrics, setTmgMetrics] = useState<TMGMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const { toast } = useToast();

  const fetchTMGData = async () => {
    try {
      setLoading(true);
      const metrics = await adminAnalyticsService.getTMGMetrics();
      setTmgMetrics(metrics);

      // Fetch recent memory activity
      const { data: memories } = await supabase
        .from('user_session_memory')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);

      if (memories) {
        const formattedActivity: RecentActivity[] = memories.map((memory, index) => ({
          id: index + 1,
          user: `User #${memory.user_id.slice(-4)}`,
          action: 'Memory Stored',
          type: memory.memory_type || 'session',
          importance: memory.importance_score || 5,
          time: new Date(memory.created_at).toLocaleString()
        }));
        setRecentActivity(formattedActivity);
      }
    } catch (error) {
      console.error('Failed to fetch TMG data:', error);
      toast({
        title: "Error",
        description: "Failed to load TMG metrics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTMGData();
  }, []);

  const handleRefreshMetrics = () => {
    fetchTMGData();
  };

  const getImportanceColor = (importance: number) => {
    if (importance >= 8) return 'text-red-600';
    if (importance >= 6) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getActionColor = (action: string) => {
    const colors = {
      'Memory Stored': 'bg-blue-100 text-blue-800',
      'Memory Retrieved': 'bg-green-100 text-green-800',
      'Graph Traversal': 'bg-purple-100 text-purple-800',
      'Memory Indexed': 'bg-yellow-100 text-yellow-800'
    };
    return colors[action as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading TMG metrics...</span>
      </div>
    );
  }

  if (!tmgMetrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium">Failed to load TMG metrics</p>
          <Button onClick={fetchTMGData} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* TMG Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6 text-green-600" />
            TMG (Tiered Memory Graph) Monitoring
          </h2>
          <p className="text-gray-600 mt-1">Multi-tier memory architecture with graph-based knowledge storage</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600">
            92% Beta Ready
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
            <CardTitle className="text-sm font-medium">Total Memories</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tmgMetrics.totalMemories.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{tmgMetrics.dailyStorage} stored today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tmgMetrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Users with active memories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retrieval Rate</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tmgMetrics.retrievalRate}%</div>
            <p className="text-xs text-muted-foreground">
              Successful memory retrieval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tmgMetrics.avgLatency}ms</div>
            <p className="text-xs text-muted-foreground">
              Memory access time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>TMG Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockTMGData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="memories" stroke="#8884d8" name="Memories Stored" />
                <Line type="monotone" dataKey="retrievals" stroke="#82ca9d" name="Retrievals" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Memory Access Latency</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockTMGData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="latency" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Memory Tier Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Memory Tier Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {memoryDistribution.map((tier, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Network className="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium">{tier.tier}</h4>
                      <p className="text-sm text-gray-600">{tier.count.toLocaleString()} memories</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-medium">{tier.percentage}% of total</p>
                    <p className="text-xs text-gray-600">Avg: {tier.avgLatency}ms</p>
                  </div>
                  <div className="w-24">
                    <Progress value={tier.percentage} className="h-2" />
                  </div>
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
            <CardTitle>Graph Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Graph Traversals</span>
              <span className="font-bold">{tmgMetrics.graphTraversals}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Memory Utilization</span>
              <span className="font-bold">{tmgMetrics.memoryUtilization}%</span>
            </div>
            <Progress value={tmgMetrics.memoryUtilization} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Storage Efficiency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Compression Ratio</span>
              <span className="font-bold">{tmgMetrics.compressionRatio}:1</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Storage Saved</span>
              <span className="font-bold">2.3GB</span>
            </div>
            <Progress value={75} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Hot Tier: Healthy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Warm Tier: Healthy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Cold Tier: Healthy</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Memory Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Importance</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.user}</TableCell>
                    <TableCell>
                      <Badge className={getActionColor(activity.action)}>
                        {activity.action}
                      </Badge>
                    </TableCell>
                    <TableCell>{activity.type}</TableCell>
                    <TableCell>
                      <span className={getImportanceColor(activity.importance)}>
                        {activity.importance}/10
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-500">{activity.time}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                    No recent activity found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
