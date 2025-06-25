
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PerformanceMetric {
  name: string;
  description: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  threshold: number;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    {
      name: 'Memory Usage',
      description: 'Current memory usage',
      value: 0,
      unit: 'MB',
      status: 'good',
      threshold: 100
    },
    {
      name: 'Component Render Time',
      description: 'Average component render time',
      value: 0,
      unit: 'ms',
      status: 'good',
      threshold: 16
    },
    {
      name: 'API Response Time',
      description: 'Average API response time',
      value: 0,
      unit: 'ms',
      status: 'good',
      threshold: 1000
    },
    {
      name: 'Database Query Time',
      description: 'Average database query time',
      value: 0,
      unit: 'ms',
      status: 'good',
      threshold: 500
    }
  ]);

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [overallHealth, setOverallHealth] = useState(100);
  const { user } = useAuth();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isMonitoring) {
      interval = setInterval(() => {
        updatePerformanceMetrics();
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring]);

  const updatePerformanceMetrics = async () => {
    try {
      const updatedMetrics = [...metrics];
      
      // Simulate performance monitoring
      const memoryUsage = await getMemoryUsage();
      const renderTime = await getRenderTime();
      const apiResponseTime = await getAPIResponseTime();
      const dbQueryTime = await getDatabaseQueryTime();

      updatedMetrics[0].value = memoryUsage;
      updatedMetrics[0].status = memoryUsage > updatedMetrics[0].threshold ? 'critical' : 'good';

      updatedMetrics[1].value = renderTime;
      updatedMetrics[1].status = renderTime > updatedMetrics[1].threshold ? 'warning' : 'good';

      updatedMetrics[2].value = apiResponseTime;
      updatedMetrics[2].status = apiResponseTime > updatedMetrics[2].threshold ? 'critical' : 'good';

      updatedMetrics[3].value = dbQueryTime;
      updatedMetrics[3].status = dbQueryTime > updatedMetrics[3].threshold ? 'warning' : 'good';

      setMetrics(updatedMetrics);
      
      // Calculate overall health
      const goodMetrics = updatedMetrics.filter(m => m.status === 'good').length;
      const warningMetrics = updatedMetrics.filter(m => m.status === 'warning').length;
      const criticalMetrics = updatedMetrics.filter(m => m.status === 'critical').length;
      
      const health = Math.round(
        (goodMetrics * 100 + warningMetrics * 60 + criticalMetrics * 20) / updatedMetrics.length
      );
      
      setOverallHealth(health);
    } catch (error) {
      console.error('Performance monitoring error:', error);
    }
  };

  const getMemoryUsage = async (): Promise<number> => {
    // Simulate memory usage monitoring
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in window.performance) {
      const memory = (window.performance as any).memory;
      return Math.round(memory.usedJSHeapSize / 1024 / 1024);
    }
    return Math.round(Math.random() * 80 + 20);
  };

  const getRenderTime = async (): Promise<number> => {
    // Simulate render time measurement
    const startTime = performance.now();
    await new Promise(resolve => setTimeout(resolve, 1));
    const endTime = performance.now();
    return Math.round((endTime - startTime) + Math.random() * 10);
  };

  const getAPIResponseTime = async (): Promise<number> => {
    try {
      const startTime = Date.now();
      await fetch('/api/health', { method: 'HEAD' }).catch(() => {});
      const endTime = Date.now();
      return endTime - startTime;
    } catch {
      return Math.round(Math.random() * 800 + 200);
    }
  };

  const getDatabaseQueryTime = async (): Promise<number> => {
    // Simulate database query time
    return Math.round(Math.random() * 400 + 100);
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    console.log('📊 Performance monitoring started');
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    console.log('📊 Performance monitoring stopped');
  };

  const resetMetrics = () => {
    setMetrics(metrics.map(metric => ({ 
      ...metric, 
      value: 0, 
      status: 'good' as const 
    })));
    setOverallHealth(100);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <RefreshCw className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-600';
    if (health >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Performance Monitor
        </CardTitle>
        <div className="flex gap-4 text-sm">
          <span>Status: <Badge className={isMonitoring ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
            {isMonitoring ? 'Monitoring' : 'Stopped'}
          </Badge></span>
          <span>Health: <Badge className={`${getHealthColor(overallHealth)}`}>{overallHealth}%</Badge></span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            disabled={!user}
            className="flex items-center gap-2"
          >
            {isMonitoring ? <XCircle className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
          <Button variant="outline" onClick={resetMetrics} disabled={isMonitoring}>
            Reset Metrics
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(metric.status)}
                  <span className="font-medium">{metric.name}</span>
                </div>
                <Badge className={getStatusColor(metric.status)}>
                  {metric.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{metric.description}</p>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {metric.value} {metric.unit}
                </div>
                <div className="text-xs text-gray-500">
                  Threshold: {metric.threshold} {metric.unit}
                </div>
              </div>
            </div>
          ))}
        </div>

        {isMonitoring && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Performance monitoring is active. Metrics are updated every 2 seconds.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;
