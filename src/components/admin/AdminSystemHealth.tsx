
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Server, 
  Database, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Monitor,
  Cpu,
  HardDrive
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const systemMetricsData = [
  { time: '10:00', cpu: 45, memory: 62, disk: 34, network: 78 },
  { time: '10:05', cpu: 52, memory: 65, disk: 36, network: 82 },
  { time: '10:10', cpu: 48, memory: 61, disk: 35, network: 75 },
  { time: '10:15', cpu: 58, memory: 68, disk: 38, network: 89 },
  { time: '10:20', cpu: 44, memory: 59, disk: 33, network: 71 },
  { time: '10:25', cpu: 51, memory: 64, disk: 37, network: 85 },
  { time: '10:30', cpu: 46, memory: 60, disk: 35, network: 79 }
];

export const AdminSystemHealth: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState({
    overall: 'healthy',
    uptime: '99.8%',
    responseTime: 1.2,
    errorRate: 0.3,
    throughput: 1247,
    services: {
      pie: { status: 'healthy', uptime: 99.9, lastCheck: '2 min ago' },
      vfpGraph: { status: 'healthy', uptime: 99.7, lastCheck: '1 min ago' },
      tmg: { status: 'warning', uptime: 98.2, lastCheck: '3 min ago' },
      acs: { status: 'healthy', uptime: 99.9, lastCheck: '1 min ago' },
      database: { status: 'healthy', uptime: 99.8, lastCheck: '30 sec ago' },
      api: { status: 'healthy', uptime: 99.9, lastCheck: '45 sec ago' }
    },
    resources: {
      cpu: 46,
      memory: 60,
      disk: 35,
      network: 79
    }
  });

  const [alerts, setAlerts] = useState([
    { id: 1, level: 'warning', service: 'TMG', message: 'Memory usage above 80% threshold', time: '5 min ago' },
    { id: 2, level: 'info', service: 'ACS', message: 'Scheduled maintenance completed', time: '2 hours ago' },
    { id: 3, level: 'success', service: 'PIE', message: 'Performance optimization successful', time: '4 hours ago' }
  ]);

  const handleRefreshHealth = () => {
    console.log('Refreshing system health metrics...');
    // Simulate health check
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getResourceColor = (usage: number) => {
    if (usage >= 80) return 'text-red-600';
    if (usage >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* System Health Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Monitor className="w-6 h-6 text-green-600" />
            System Health & Infrastructure
          </h2>
          <p className="text-gray-600 mt-1">Real-time monitoring of all platform services and resources</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getStatusColor(systemHealth.overall)}>
            System: {systemHealth.overall}
          </Badge>
          <Button onClick={handleRefreshHealth} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Health Metrics */}
      <div className="grid grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth.uptime}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth.responseTime}s</div>
            <p className="text-xs text-muted-foreground">
              Average API response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth.errorRate}%</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth.throughput}</div>
            <p className="text-xs text-muted-foreground">
              Requests per minute
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle>System Resource Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={systemMetricsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU %" />
              <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="Memory %" />
              <Line type="monotone" dataKey="disk" stroke="#ffc658" name="Disk %" />
              <Line type="monotone" dataKey="network" stroke="#ff7300" name="Network %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Service Status Grid */}
      <div className="grid grid-cols-3 gap-6">
        {Object.entries(systemHealth.services).map(([service, info]) => (
          <Card key={service}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize flex items-center gap-2">
                {getStatusIcon(info.status)}
                {service === 'vfpGraph' ? 'VFP-Graph' : service.toUpperCase()}
              </CardTitle>
              <Badge variant="outline" className={getStatusColor(info.status)}>
                {info.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uptime</span>
                  <span className="font-medium">{info.uptime}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Last Check</span>
                  <span className="text-gray-500">{info.lastCheck}</span>
                </div>
                <Progress value={info.uptime} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resource Usage Details */}
      <div className="grid grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getResourceColor(systemHealth.resources.cpu)}`}>
              {systemHealth.resources.cpu}%
            </div>
            <Progress value={systemHealth.resources.cpu} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getResourceColor(systemHealth.resources.memory)}`}>
              {systemHealth.resources.memory}%
            </div>
            <Progress value={systemHealth.resources.memory} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getResourceColor(systemHealth.resources.disk)}`}>
              {systemHealth.resources.disk}%
            </div>
            <Progress value={systemHealth.resources.disk} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network I/O</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getResourceColor(systemHealth.resources.network)}`}>
              {systemHealth.resources.network}%
            </div>
            <Progress value={systemHealth.resources.network} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>System Alerts & Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className={getAlertColor(alert.level)}>
                    {alert.level.toUpperCase()}
                  </Badge>
                  <div>
                    <p className="font-medium">{alert.service}: {alert.message}</p>
                    <p className="text-sm text-gray-500">{alert.time}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Acknowledge
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
