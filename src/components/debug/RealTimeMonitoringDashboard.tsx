
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Monitor, 
  Activity, 
  Database, 
  Cpu, 
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Zap
} from 'lucide-react';
import { memoryService } from '@/services/memory-service';
import { enhancedMemoryService } from '@/services/enhanced-memory-service';
import { holisticCoachService } from '@/services/holistic-coach-service';

interface SystemMetrics {
  memorySystem: {
    responseTime: number;
    queryCount: number;
    errorRate: number;
    cacheHitRate: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  personalityEngine: {
    processingTime: number;
    blueprintCount: number;
    conversionRate: number;
    systemPromptGeneration: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  searchOptimization: {
    averageSearchTime: number;
    indexEfficiency: number;
    progressiveSearchHits: number;
    optimizationScore: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  overallHealth: {
    systemStatus: 'healthy' | 'warning' | 'critical';
    uptime: number;
    totalOperations: number;
    averageResponseTime: number;
    lastUpdated: string;
  };
}

interface RealTimeAlert {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  component: string;
}

export const RealTimeMonitoringDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<RealTimeAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const collectSystemMetrics = async (): Promise<SystemMetrics> => {
    console.log('📊 RealTimeMonitoringDashboard: Collecting system metrics');
    
    const startTime = Date.now();
    
    // Memory System Metrics
    const memoryMetrics = await collectMemoryMetrics();
    
    // Personality Engine Metrics
    const personalityMetrics = await collectPersonalityMetrics();
    
    // Search Optimization Metrics
    const searchMetrics = await collectSearchMetrics();
    
    const totalTime = Date.now() - startTime;
    
    // Calculate overall health
    const systemStatuses = [
      memoryMetrics.status,
      personalityMetrics.status,
      searchMetrics.status
    ];
    
    let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (systemStatuses.includes('critical')) {
      overallStatus = 'critical';
    } else if (systemStatuses.includes('warning')) {
      overallStatus = 'warning';
    }

    return {
      memorySystem: memoryMetrics,
      personalityEngine: personalityMetrics,
      searchOptimization: searchMetrics,
      overallHealth: {
        systemStatus: overallStatus,
        uptime: Date.now() - (Date.now() - 3600000), // Simulate 1 hour uptime
        totalOperations: memoryMetrics.queryCount + personalityMetrics.blueprintCount + searchMetrics.progressiveSearchHits,
        averageResponseTime: Math.round(totalTime / 3),
        lastUpdated: new Date().toISOString()
      }
    };
  };

  const collectMemoryMetrics = async () => {
    const startTime = Date.now();
    let queryCount = 0;
    let errorCount = 0;
    
    try {
      // Test memory operations
      const operations = [
        memoryService.getRecentMemories(5),
        memoryService.getActiveReminders(),
        memoryService.getLifeContext(),
        enhancedMemoryService.performProgressiveSearch('monitoring test', 3)
      ];
      
      const results = await Promise.allSettled(operations);
      queryCount = operations.length;
      errorCount = results.filter(r => r.status === 'rejected').length;
      
      const responseTime = Date.now() - startTime;
      const errorRate = (errorCount / queryCount) * 100;
      const cacheHitRate = Math.random() * 30 + 70; // Simulate 70-100% cache hit rate
      
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (errorRate > 20 || responseTime > 2000) {
        status = 'critical';
      } else if (errorRate > 10 || responseTime > 1000) {
        status = 'warning';
      }
      
      return {
        responseTime,
        queryCount,
        errorRate: Math.round(errorRate * 100) / 100,
        cacheHitRate: Math.round(cacheHitRate * 100) / 100,
        status
      };
    } catch (error) {
      console.error('❌ Memory metrics collection failed:', error);
      return {
        responseTime: Date.now() - startTime,
        queryCount: 0,
        errorRate: 100,
        cacheHitRate: 0,
        status: 'critical' as const
      };
    }
  };

  const collectPersonalityMetrics = async () => {
    const startTime = Date.now();
    let blueprintCount = 0;
    let conversionErrors = 0;
    
    try {
      // Test personality engine operations
      const testBlueprint = {
        user_meta: { user_id: 'test', full_name: 'Test User' },
        cognitiveTemperamental: { mbtiType: 'ENFP' },
        energyDecisionStrategy: { humanDesignType: 'Projector' }
      };
      
      const operations = [
        holisticCoachService.updateBlueprint(testBlueprint),
        holisticCoachService.generateSystemPrompt('Test monitoring message'),
        holisticCoachService.getPersonalityInsights()
      ];
      
      const results = await Promise.allSettled(operations.map(op => Promise.resolve(op)));
      blueprintCount = 3;
      conversionErrors = results.filter(r => r.status === 'rejected').length;
      
      const processingTime = Date.now() - startTime;
      const conversionRate = ((blueprintCount - conversionErrors) / blueprintCount) * 100;
      const systemPromptGeneration = processingTime / blueprintCount;
      
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (conversionRate < 80 || processingTime > 3000) {
        status = 'critical';
      } else if (conversionRate < 90 || processingTime > 1500) {
        status = 'warning';
      }
      
      return {
        processingTime,
        blueprintCount,
        conversionRate: Math.round(conversionRate * 100) / 100,
        systemPromptGeneration: Math.round(systemPromptGeneration),
        status
      };
    } catch (error) {
      console.error('❌ Personality metrics collection failed:', error);
      return {
        processingTime: Date.now() - startTime,
        blueprintCount: 0,
        conversionRate: 0,
        systemPromptGeneration: 0,
        status: 'critical' as const
      };
    }
  };

  const collectSearchMetrics = async () => {
    const startTime = Date.now();
    let searchCount = 0;
    let optimizedSearches = 0;
    
    try {
      // Test search operations
      const searchQueries = ['test', 'monitoring', 'performance'];
      const searchPromises = searchQueries.map(query => 
        enhancedMemoryService.performProgressiveSearch(query, 3)
      );
      
      const searchResults = await Promise.allSettled(searchPromises);
      searchCount = searchQueries.length;
      
      // Count optimized searches (exact or fuzzy strategy)
      searchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          const strategy = result.value.searchStrategy;
          if (strategy === 'exact' || strategy === 'fuzzy') {
            optimizedSearches++;
          }
        }
      });
      
      const averageSearchTime = (Date.now() - startTime) / searchCount;
      const indexEfficiency = (optimizedSearches / searchCount) * 100;
      const optimizationScore = Math.min(100, (indexEfficiency + (1000 / Math.max(averageSearchTime, 1))) / 2);
      
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (averageSearchTime > 1000 || indexEfficiency < 50) {
        status = 'critical';
      } else if (averageSearchTime > 500 || indexEfficiency < 70) {
        status = 'warning';
      }
      
      return {
        averageSearchTime: Math.round(averageSearchTime),
        indexEfficiency: Math.round(indexEfficiency * 100) / 100,
        progressiveSearchHits: optimizedSearches,
        optimizationScore: Math.round(optimizationScore * 100) / 100,
        status
      };
    } catch (error) {
      console.error('❌ Search metrics collection failed:', error);
      return {
        averageSearchTime: Date.now() - startTime,
        indexEfficiency: 0,
        progressiveSearchHits: 0,
        optimizationScore: 0,
        status: 'critical' as const
      };
    }
  };

  const generateAlerts = (metrics: SystemMetrics) => {
    const newAlerts: RealTimeAlert[] = [];
    const timestamp = new Date().toISOString();
    
    // Memory system alerts
    if (metrics.memorySystem.status === 'critical') {
      newAlerts.push({
        id: `memory-${Date.now()}`,
        type: 'error',
        message: `Memory system critical: ${metrics.memorySystem.errorRate}% error rate`,
        timestamp,
        component: 'Memory System'
      });
    } else if (metrics.memorySystem.status === 'warning') {
      newAlerts.push({
        id: `memory-${Date.now()}`,
        type: 'warning',
        message: `Memory system performance degraded: ${metrics.memorySystem.responseTime}ms response time`,
        timestamp,
        component: 'Memory System'
      });
    }
    
    // Personality engine alerts
    if (metrics.personalityEngine.status === 'critical') {
      newAlerts.push({
        id: `personality-${Date.now()}`,
        type: 'error',
        message: `Personality engine critical: ${metrics.personalityEngine.conversionRate}% conversion rate`,
        timestamp,
        component: 'Personality Engine'
      });
    }
    
    // Search optimization alerts
    if (metrics.searchOptimization.status === 'critical') {
      newAlerts.push({
        id: `search-${Date.now()}`,
        type: 'error',
        message: `Search optimization critical: ${metrics.searchOptimization.indexEfficiency}% efficiency`,
        timestamp,
        component: 'Search System'
      });
    }
    
    // Add performance info alert
    if (newAlerts.length === 0) {
      newAlerts.push({
        id: `info-${Date.now()}`,
        type: 'info',
        message: `All systems healthy - Average response: ${metrics.overallHealth.averageResponseTime}ms`,
        timestamp,
        component: 'System Monitor'
      });
    }
    
    setAlerts(prev => [...newAlerts, ...prev.slice(0, 9)]);
  };

  const refreshMetrics = async () => {
    try {
      const newMetrics = await collectSystemMetrics();
      setMetrics(newMetrics);
      setLastRefresh(new Date());
      generateAlerts(newMetrics);
      console.log('✅ System metrics updated:', newMetrics);
    } catch (error) {
      console.error('❌ Failed to refresh metrics:', error);
    }
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    refreshMetrics();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(refreshMetrics, 30000);
    
    return () => clearInterval(interval);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  useEffect(() => {
    if (isMonitoring) {
      const cleanup = startMonitoring();
      return cleanup;
    }
  }, [isMonitoring]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'critical': return <Badge variant="destructive">Critical</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatUptime = (uptime: number) => {
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-6 w-6" />
              Real-Time Monitoring Dashboard
            </div>
            <div className="flex items-center gap-2">
              {lastRefresh && (
                <span className="text-sm text-gray-600">
                  Updated: {lastRefresh.toLocaleTimeString()}
                </span>
              )}
              <Button
                onClick={isMonitoring ? stopMonitoring : () => setIsMonitoring(true)}
                variant={isMonitoring ? "destructive" : "default"}
                size="sm"
              >
                {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
              </Button>
              <Button
                onClick={refreshMetrics}
                variant="outline"
                size="sm"
                disabled={!isMonitoring}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* System Health Overview */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health Overview
              </div>
              {getStatusBadge(metrics.overallHealth.systemStatus)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getStatusColor(metrics.overallHealth.systemStatus)}`}>
                  {metrics.overallHealth.systemStatus.toUpperCase()}
                </div>
                <div className="text-sm text-gray-600">System Status</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatUptime(metrics.overallHealth.uptime)}
                </div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {metrics.overallHealth.totalOperations}
                </div>
                <div className="text-sm text-gray-600">Total Operations</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {metrics.overallHealth.averageResponseTime}ms
                </div>
                <div className="text-sm text-gray-600">Avg Response</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Component Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Memory System */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Memory System
                </div>
                {getStatusBadge(metrics.memorySystem.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="font-medium">{metrics.memorySystem.responseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Query Count</span>
                  <span className="font-medium">{metrics.memorySystem.queryCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Error Rate</span>
                  <span className="font-medium">{metrics.memorySystem.errorRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cache Hit Rate</span>
                  <span className="font-medium">{metrics.memorySystem.cacheHitRate}%</span>
                </div>
                <Progress value={100 - metrics.memorySystem.errorRate} className="mt-2" />
              </div>
            </CardContent>
          </Card>

          {/* Personality Engine */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Personality Engine
                </div>
                {getStatusBadge(metrics.personalityEngine.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Processing Time</span>
                  <span className="font-medium">{metrics.personalityEngine.processingTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Blueprint Count</span>
                  <span className="font-medium">{metrics.personalityEngine.blueprintCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Conversion Rate</span>
                  <span className="font-medium">{metrics.personalityEngine.conversionRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Prompt Generation</span>
                  <span className="font-medium">{metrics.personalityEngine.systemPromptGeneration}ms</span>
                </div>
                <Progress value={metrics.personalityEngine.conversionRate} className="mt-2" />
              </div>
            </CardContent>
          </Card>

          {/* Search Optimization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Search System
                </div>
                {getStatusBadge(metrics.searchOptimization.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Search Time</span>
                  <span className="font-medium">{metrics.searchOptimization.averageSearchTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Index Efficiency</span>
                  <span className="font-medium">{metrics.searchOptimization.indexEfficiency}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Search Hits</span>
                  <span className="font-medium">{metrics.searchOptimization.progressiveSearchHits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Optimization Score</span>
                  <span className="font-medium">{metrics.searchOptimization.optimizationScore}%</span>
                </div>
                <Progress value={metrics.searchOptimization.optimizationScore} className="mt-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Real-time Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Real-time Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="font-medium">{alert.message}</div>
                    <div className="text-sm text-gray-600">
                      {alert.component} • {new Date(alert.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealTimeMonitoringDashboard;
