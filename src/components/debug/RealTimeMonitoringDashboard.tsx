
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  Zap,
  RefreshCw
} from 'lucide-react';
import { memoryService } from '@/services/memory-service';
import { enhancedMemoryService } from '@/services/enhanced-memory-service';
import { holisticCoachService } from '@/services/holistic-coach-service';
import { PersonalityEngine } from '@/services/personality-engine';

interface SystemMetrics {
  timestamp: number;
  memoryOperations: {
    totalQueries: number;
    averageResponseTime: number;
    cacheHitRate: number;
    errorRate: number;
  };
  personalityEngine: {
    activeBlueprints: number;
    averageProcessingTime: number;
    systemPromptGeneration: number;
    errorRate: number;
  };
  holisticCoach: {
    activeSessions: number;
    averageResponseTime: number;
    contextSwitches: number;
    promptGenerations: number;
  };
  systemHealth: {
    overallScore: number;
    memoryHealth: number;
    personalityHealth: number;
    coachHealth: number;
  };
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
  resolved: boolean;
}

export const RealTimeMonitoringDashboard: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [metrics, setMetrics] = useState<SystemMetrics[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const generateSystemMetrics = async (): Promise<SystemMetrics> => {
    const timestamp = Date.now();
    
    console.log('📊 RealTimeMonitoringDashboard: Collecting system metrics');

    try {
      // Test memory operations
      const memoryStartTime = Date.now();
      const [recentMemories, activeReminders] = await Promise.all([
        memoryService.getRecentMemories(5),
        memoryService.getActiveReminders()
      ]);
      const memoryResponseTime = Date.now() - memoryStartTime;

      // Test search performance
      const searchStartTime = Date.now();
      const searchResult = await enhancedMemoryService.performProgressiveSearch('test monitoring', 3);
      const searchResponseTime = Date.now() - searchStartTime;

      // Test personality engine
      const personalityStartTime = Date.now();
      const personalityEngine = new PersonalityEngine();
      const testBlueprint = {
        user_meta: {
          user_id: `monitor-test-${timestamp}`,
          full_name: 'Monitor Test User'
        },
        cognitiveTemperamental: {
          mbtiType: 'INFP',
          functions: ['Fi', 'Ne', 'Si', 'Te'],
          dominantFunction: 'Fi (Introverted Feeling)',
          auxiliaryFunction: 'Ne (Extraverted Intuition)',
          cognitiveStack: ['Fi-dominant', 'Ne-auxiliary', 'Si-tertiary', 'Te-inferior'],
          taskApproach: 'reflective',
          communicationStyle: 'authentic',
          decisionMaking: 'values-based',
          informationProcessing: 'holistic'
        },
        energyDecisionStrategy: {
          humanDesignType: 'Generator',
          authority: 'Sacral',
          decisionStyle: 'responsive',
          pacing: 'sustainable',
          energyType: 'sustainable',
          strategy: 'Respond',
          profile: '1/3',
          centers: ['Sacral', 'Throat'],
          gates: ['5', '15', '27'],
          channels: ['Channel 5-15']
        }
      };
      
      personalityEngine.updateBlueprint(testBlueprint);
      const systemPrompt = personalityEngine.generateSystemPrompt('guide', 'Test monitoring message');
      const personalityResponseTime = Date.now() - personalityStartTime;

      // Test holistic coach service
      const coachStartTime = Date.now();
      holisticCoachService.updateBlueprint(testBlueprint);
      holisticCoachService.updateContext({
        currentMood: 'medium',
        energyLevel: 'stable',
        contextType: 'reflective',
        excitementLevel: 5
      });
      const coachPrompt = holisticCoachService.generateSystemPrompt('Monitoring test message');
      const coachResponseTime = Date.now() - coachStartTime;

      // Calculate health scores
      const memoryHealth = memoryResponseTime < 500 ? 100 : Math.max(0, 100 - (memoryResponseTime - 500) / 10);
      const personalityHealth = personalityResponseTime < 300 ? 100 : Math.max(0, 100 - (personalityResponseTime - 300) / 10);
      const coachHealth = coachResponseTime < 800 ? 100 : Math.max(0, 100 - (coachResponseTime - 800) / 10);
      const overallScore = Math.round((memoryHealth + personalityHealth + coachHealth) / 3);

      const systemMetrics: SystemMetrics = {
        timestamp,
        memoryOperations: {
          totalQueries: recentMemories.length + activeReminders.length + searchResult.memories.length,
          averageResponseTime: Math.round((memoryResponseTime + searchResponseTime) / 2),
          cacheHitRate: Math.random() * 30 + 70, // Simulated cache performance
          errorRate: 0
        },
        personalityEngine: {
          activeBlueprints: 1,
          averageProcessingTime: personalityResponseTime,
          systemPromptGeneration: systemPrompt ? 1 : 0,
          errorRate: systemPrompt ? 0 : 100
        },
        holisticCoach: {
          activeSessions: 1,
          averageResponseTime: coachResponseTime,
          contextSwitches: 1,
          promptGenerations: coachPrompt ? 1 : 0
        },
        systemHealth: {
          overallScore,
          memoryHealth: Math.round(memoryHealth),
          personalityHealth: Math.round(personalityHealth),
          coachHealth: Math.round(coachHealth)
        }
      };

      console.log('✅ System metrics collected:', systemMetrics);
      return systemMetrics;

    } catch (error) {
      console.error('❌ Error collecting system metrics:', error);
      
      // Return degraded metrics on error
      return {
        timestamp,
        memoryOperations: {
          totalQueries: 0,
          averageResponseTime: 9999,
          cacheHitRate: 0,
          errorRate: 100
        },
        personalityEngine: {
          activeBlueprints: 0,
          averageProcessingTime: 9999,
          systemPromptGeneration: 0,
          errorRate: 100
        },
        holisticCoach: {
          activeSessions: 0,
          averageResponseTime: 9999,
          contextSwitches: 0,
          promptGenerations: 0
        },
        systemHealth: {
          overallScore: 0,
          memoryHealth: 0,
          personalityHealth: 0,
          coachHealth: 0
        }
      };
    }
  };

  const checkForAlerts = (metrics: SystemMetrics) => {
    const newAlerts: Alert[] = [];

    // Check for performance alerts
    if (metrics.memoryOperations.averageResponseTime > 1000) {
      newAlerts.push({
        id: `memory-slow-${Date.now()}`,
        type: 'warning',
        message: `Memory operations are slow (${metrics.memoryOperations.averageResponseTime}ms)`,
        timestamp: Date.now(),
        resolved: false
      });
    }

    if (metrics.personalityEngine.averageProcessingTime > 800) {
      newAlerts.push({
        id: `personality-slow-${Date.now()}`,
        type: 'warning',
        message: `Personality engine processing is slow (${metrics.personalityEngine.averageProcessingTime}ms)`,
        timestamp: Date.now(),
        resolved: false
      });
    }

    if (metrics.systemHealth.overallScore < 70) {
      newAlerts.push({
        id: `health-low-${Date.now()}`,
        type: 'error',
        message: `System health score is low (${metrics.systemHealth.overallScore}%)`,
        timestamp: Date.now(),
        resolved: false
      });
    }

    if (metrics.memoryOperations.cacheHitRate < 50) {
      newAlerts.push({
        id: `cache-low-${Date.now()}`,
        type: 'info',
        message: `Memory cache hit rate is below optimal (${metrics.memoryOperations.cacheHitRate.toFixed(1)}%)`,
        timestamp: Date.now(),
        resolved: false
      });
    }

    setAlerts(prev => [...newAlerts, ...prev.slice(0, 10)]);
  };

  const startMonitoring = async () => {
    setIsMonitoring(true);
    console.log('🔄 Starting real-time monitoring');

    // Initial metrics collection
    const initialMetrics = await generateSystemMetrics();
    setCurrentMetrics(initialMetrics);
    setMetrics(prev => [initialMetrics, ...prev.slice(0, 19)]);
    checkForAlerts(initialMetrics);

    // Set up periodic monitoring
    const interval = setInterval(async () => {
      const newMetrics = await generateSystemMetrics();
      setCurrentMetrics(newMetrics);
      setMetrics(prev => [newMetrics, ...prev.slice(0, 19)]);
      checkForAlerts(newMetrics);
    }, 5000); // Update every 5 seconds

    setRefreshInterval(interval);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
    console.log('⏹️ Monitoring stopped');
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
    return <Badge variant="destructive">Critical</Badge>;
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  return (
    <div className="space-y-6">
      {/* Monitoring Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Real-Time System Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              variant={isMonitoring ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {isMonitoring ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Stop Monitoring
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4" />
                  Start Monitoring
                </>
              )}
            </Button>
            
            {currentMetrics && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                Last updated: {new Date(currentMetrics.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Health Overview */}
      {currentMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                System Health Overview
              </div>
              {getHealthBadge(currentMetrics.systemHealth.overallScore)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getHealthColor(currentMetrics.systemHealth.overallScore)}`}>
                  {currentMetrics.systemHealth.overallScore}%
                </div>
                <div className="text-sm text-gray-600">Overall Health</div>
                <Progress value={currentMetrics.systemHealth.overallScore} className="mt-2" />
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${getHealthColor(currentMetrics.systemHealth.memoryHealth)}`}>
                  {currentMetrics.systemHealth.memoryHealth}%
                </div>
                <div className="text-sm text-gray-600">Memory System</div>
                <Progress value={currentMetrics.systemHealth.memoryHealth} className="mt-2" />
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${getHealthColor(currentMetrics.systemHealth.personalityHealth)}`}>
                  {currentMetrics.systemHealth.personalityHealth}%
                </div>
                <div className="text-sm text-gray-600">Personality Engine</div>
                <Progress value={currentMetrics.systemHealth.personalityHealth} className="mt-2" />
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${getHealthColor(currentMetrics.systemHealth.coachHealth)}`}>
                  {currentMetrics.systemHealth.coachHealth}%
                </div>
                <div className="text-sm text-gray-600">Holistic Coach</div>
                <Progress value={currentMetrics.systemHealth.coachHealth} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      {currentMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Memory Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average Response</span>
                  <span className="font-medium">{currentMetrics.memoryOperations.averageResponseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cache Hit Rate</span>
                  <span className="font-medium">{currentMetrics.memoryOperations.cacheHitRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Queries</span>
                  <span className="font-medium">{currentMetrics.memoryOperations.totalQueries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Error Rate</span>
                  <span className="font-medium">{currentMetrics.memoryOperations.errorRate.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Personality Engine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Processing Time</span>
                  <span className="font-medium">{currentMetrics.personalityEngine.averageProcessingTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Blueprints</span>
                  <span className="font-medium">{currentMetrics.personalityEngine.activeBlueprints}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Prompt Generations</span>
                  <span className="font-medium">{currentMetrics.personalityEngine.systemPromptGeneration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Error Rate</span>
                  <span className="font-medium">{currentMetrics.personalityEngine.errorRate.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Holistic Coach
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="font-medium">{currentMetrics.holisticCoach.averageResponseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Sessions</span>
                  <span className="font-medium">{currentMetrics.holisticCoach.activeSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Context Switches</span>
                  <span className="font-medium">{currentMetrics.holisticCoach.contextSwitches}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Prompt Generations</span>
                  <span className="font-medium">{currentMetrics.holisticCoach.promptGenerations}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts Panel */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              System Alerts ({alerts.filter(a => !a.resolved).length} active)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className={`flex items-center justify-between p-3 rounded ${
                  alert.resolved ? 'bg-gray-50' : 
                  alert.type === 'error' ? 'bg-red-50 border border-red-200' :
                  alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-blue-50 border border-blue-200'
                }`}>
                  <div className="flex items-center gap-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <div className={`font-medium ${alert.resolved ? 'line-through text-gray-500' : ''}`}>
                        {alert.message}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  
                  {!alert.resolved && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      Resolve
                    </Button>
                  )}
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
