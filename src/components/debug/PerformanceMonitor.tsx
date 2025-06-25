
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Zap, 
  Database, 
  Clock, 
  TrendingUp,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { memoryService } from '@/services/memory-service';

interface PerformanceMetrics {
  memoryQueries: {
    avgResponseTime: number;
    totalQueries: number;
    errorRate: number;
  };
  reminderOperations: {
    avgResponseTime: number;
    totalOperations: number;
    errorRate: number;
  };
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    memoryUsage: number;
  };
  lastUpdated: string;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const collectPerformanceMetrics = async (): Promise<PerformanceMetrics> => {
    const startTime = Date.now();
    
    // Test memory operations
    const memoryStart = Date.now();
    let memoryError = false;
    try {
      await Promise.all([
        memoryService.getRecentMemories(10),
        memoryService.searchMemories('test', 5),
        memoryService.getLifeContext()
      ]);
    } catch (error) {
      memoryError = true;
      console.error('Memory operation error:', error);
    }
    const memoryResponseTime = Date.now() - memoryStart;

    // Test reminder operations
    const reminderStart = Date.now();
    let reminderError = false;
    try {
      await Promise.all([
        memoryService.getActiveReminders(),
        memoryService.getNextBedtimeAction(),
        memoryService.getFeedbackHistory(5)
      ]);
    } catch (error) {
      reminderError = true;
      console.error('Reminder operation error:', error);
    }
    const reminderResponseTime = Date.now() - reminderStart;

    // Calculate system health
    const totalResponseTime = Date.now() - startTime;
    let systemStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if (totalResponseTime > 3000 || memoryError || reminderError) {
      systemStatus = 'critical';
    } else if (totalResponseTime > 1500) {
      systemStatus = 'warning';
    }

    // Simulate memory usage (in a real app, this would come from actual metrics)
    const memoryUsage = Math.min(
      Math.max(30 + Math.random() * 40, 0), 
      100
    );

    return {
      memoryQueries: {
        avgResponseTime: memoryResponseTime,
        totalQueries: 3,
        errorRate: memoryError ? 100 : 0
      },
      reminderOperations: {
        avgResponseTime: reminderResponseTime,
        totalOperations: 3,
        errorRate: reminderError ? 100 : 0
      },
      systemHealth: {
        status: systemStatus,
        uptime: Date.now() - (Date.now() - 3600000), // Simulate 1 hour uptime
        memoryUsage
      },
      lastUpdated: new Date().toISOString()
    };
  };

  const updateMetrics = async () => {
    setIsLoading(true);
    try {
      const newMetrics = await collectPerformanceMetrics();
      setMetrics(newMetrics);
    } catch (error) {
      console.error('Failed to collect performance metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    updateMetrics();
    
    // Update metrics every 30 seconds
    const interval = setInterval(updateMetrics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'healthy': return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'critical': return <Badge variant="destructive">Critical</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatUptime = (uptime: number) => {
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading performance metrics...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6" />
              System Health Monitor
            </div>
            <button
              onClick={updateMetrics}
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthColor(metrics.systemHealth.status)}`}>
                {metrics.systemHealth.status.toUpperCase()}
              </div>
              <div className="text-sm text-gray-600">System Status</div>
              {getHealthBadge(metrics.systemHealth.status)}
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatUptime(metrics.systemHealth.uptime)}
              </div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {metrics.systemHealth.memoryUsage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Memory Usage</div>
              <Progress value={metrics.systemHealth.memoryUsage} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Memory Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Memory Operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Response Time</span>
                <span className="font-medium">
                  {metrics.memoryQueries.avgResponseTime}ms
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Queries</span>
                <span className="font-medium">
                  {metrics.memoryQueries.totalQueries}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Error Rate</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {metrics.memoryQueries.errorRate.toFixed(1)}%
                  </span>
                  {metrics.memoryQueries.errorRate > 0 && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              
              <Progress 
                value={Math.min(100 - metrics.memoryQueries.errorRate, 100)} 
                className="mt-2" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Reminder Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Reminder Operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Response Time</span>
                <span className="font-medium">
                  {metrics.reminderOperations.avgResponseTime}ms
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Operations</span>
                <span className="font-medium">
                  {metrics.reminderOperations.totalOperations}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Error Rate</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {metrics.reminderOperations.errorRate.toFixed(1)}%
                  </span>
                  {metrics.reminderOperations.errorRate > 0 && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              
              <Progress 
                value={Math.min(100 - metrics.reminderOperations.errorRate, 100)} 
                className="mt-2" 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.systemHealth.status === 'critical' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800">
                <strong>Critical Issue Detected:</strong> System performance is degraded. 
                Check network connectivity and database health.
              </div>
            )}
            
            {metrics.systemHealth.status === 'warning' && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                <strong>Performance Warning:</strong> Response times are elevated. 
                Monitor for potential issues.
              </div>
            )}
            
            {metrics.systemHealth.memoryUsage > 80 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded text-orange-800">
                <strong>Memory Usage High:</strong> System memory usage is above 80%. 
                Consider optimization.
              </div>
            )}
            
            {metrics.systemHealth.status === 'healthy' && 
             metrics.systemHealth.memoryUsage < 80 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800">
                <strong>System Healthy:</strong> All performance metrics are within normal ranges.
              </div>
            )}
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            Last updated: {new Date(metrics.lastUpdated).toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;
