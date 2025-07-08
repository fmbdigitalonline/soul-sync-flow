// ACS Performance Optimizer - Phase 2: Performance Optimization
// Fine-tuning P95 latency, memory usage, and reinforcement learning feedback loops

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Gauge, 
  MemoryStick, 
  TrendingUp, 
  Settings, 
  Target,
  Activity,
  BarChart3,
  Cpu,
  Database
} from 'lucide-react';

import { adaptiveContextScheduler } from '@/services/adaptive-context-scheduler';
import { productionACSService } from '@/services/production-acs-service';
import { ACSConfig } from '@/types/acs-types';

interface PerformanceMetrics {
  p95Latency: number;
  p99Latency: number;
  averageLatency: number;
  memoryUsage: number;
  stateTransitionRate: number;
  rlConvergenceRate: number;
  throughput: number;
  errorRate: number;
}

interface OptimizationTarget {
  name: string;
  current: number;
  target: number;
  unit: string;
  status: 'optimal' | 'warning' | 'critical';
}

interface OptimizationSession {
  id: string;
  startTime: number;
  iterations: number;
  bestMetrics: PerformanceMetrics;
  currentConfig: ACSConfig;
  optimizationHistory: Array<{
    iteration: number;
    metrics: PerformanceMetrics;
    config: ACSConfig;
    improvement: number;
  }>;
}

export const ACSPerformanceOptimizer: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [optimizationTargets, setOptimizationTargets] = useState<OptimizationTarget[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [currentSession, setCurrentSession] = useState<OptimizationSession | null>(null);
  const [config, setConfig] = useState<ACSConfig>({
    velocityFloor: 0.15,
    sentimentSlopeNeg: -0.05,
    maxSilentMs: 45000,
    frustrationThreshold: 0.7,
    clarificationThreshold: 0.6,
    enableRL: true,
    personalityScaling: true
  });

  // Initialize performance monitoring
  useEffect(() => {
    initializePerformanceTargets();
    startPerformanceMonitoring();
  }, []);

  const initializePerformanceTargets = () => {
    setOptimizationTargets([
      { name: 'P95 Latency', current: 0, target: 3, unit: 'ms', status: 'optimal' },
      { name: 'Memory Usage', current: 0, target: 50, unit: 'MB', status: 'optimal' },
      { name: 'State Transition Rate', current: 0, target: 5, unit: '/min', status: 'optimal' },
      { name: 'RL Convergence', current: 0, target: 0.95, unit: 'score', status: 'optimal' },
      { name: 'Throughput', current: 0, target: 100, unit: 'req/s', status: 'optimal' },
      { name: 'Error Rate', current: 0, target: 0.01, unit: '%', status: 'optimal' }
    ]);
  };

  const startPerformanceMonitoring = () => {
    const interval = setInterval(async () => {
      await collectPerformanceMetrics();
    }, 5000);

    return () => clearInterval(interval);
  };

  const collectPerformanceMetrics = async () => {
    try {
      // Collect P95 latency metrics
      const latencyTest = await productionACSService.testLatencyP95();
      
      // Collect memory metrics
      const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Collect ACS metrics
      const acsMetrics = adaptiveContextScheduler.getMetrics();
      
      // Run throughput test
      const throughputMetrics = await measureThroughput();
      
      const newMetrics: PerformanceMetrics = {
        p95Latency: latencyTest.latency,
        p99Latency: latencyTest.latency * 1.3, // Estimated
        averageLatency: acsMetrics.averageLatency,
        memoryUsage: memoryUsage / (1024 * 1024), // Convert to MB
        stateTransitionRate: acsMetrics.stateTransitions,
        rlConvergenceRate: 0.85, // Placeholder - would measure actual RL performance
        throughput: throughputMetrics.requestsPerSecond,
        errorRate: throughputMetrics.errorRate
      };
      
      setMetrics(newMetrics);
      updateOptimizationTargets(newMetrics);
      
    } catch (error) {
      console.error('Failed to collect performance metrics:', error);
    }
  };

  const measureThroughput = async (): Promise<{ requestsPerSecond: number; errorRate: number }> => {
    const startTime = Date.now();
    const testDuration = 10000; // 10 seconds
    let requestCount = 0;
    let errorCount = 0;
    
    const testPromises: Promise<void>[] = [];
    
    while (Date.now() - startTime < testDuration) {
      const promise = simulateRequest().then(() => {
        requestCount++;
      }).catch(() => {
        errorCount++;
      });
      
      testPromises.push(promise);
      
      // Control request rate
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    await Promise.all(testPromises);
    
    const actualDuration = (Date.now() - startTime) / 1000;
    return {
      requestsPerSecond: requestCount / actualDuration,
      errorRate: errorCount / (requestCount + errorCount)
    };
  };

  const simulateRequest = async (): Promise<void> => {
    const testMessages = [
      "Can you help me with this task?",
      "I'm confused about the process",
      "This is working great!",
      "I need clarification on this step"
    ];
    
    const message = testMessages[Math.floor(Math.random() * testMessages.length)];
    adaptiveContextScheduler.addMessage(message, 'user');
  };

  const updateOptimizationTargets = (newMetrics: PerformanceMetrics) => {
    setOptimizationTargets(prev => prev.map(target => {
      let current = 0;
      let status: 'optimal' | 'warning' | 'critical' = 'optimal';
      
      switch (target.name) {
        case 'P95 Latency':
          current = newMetrics.p95Latency;
          status = current <= target.target ? 'optimal' : current <= target.target * 2 ? 'warning' : 'critical';
          break;
        case 'Memory Usage':
          current = newMetrics.memoryUsage;
          status = current <= target.target ? 'optimal' : current <= target.target * 1.5 ? 'warning' : 'critical';
          break;
        case 'State Transition Rate':
          current = newMetrics.stateTransitionRate;
          status = current <= target.target ? 'optimal' : current <= target.target * 2 ? 'warning' : 'critical';
          break;
        case 'RL Convergence':
          current = newMetrics.rlConvergenceRate;
          status = current >= target.target ? 'optimal' : current >= target.target * 0.8 ? 'warning' : 'critical';
          break;
        case 'Throughput':
          current = newMetrics.throughput;
          status = current >= target.target ? 'optimal' : current >= target.target * 0.8 ? 'warning' : 'critical';
          break;
        case 'Error Rate':
          current = newMetrics.errorRate * 100;
          status = current <= target.target ? 'optimal' : current <= target.target * 2 ? 'warning' : 'critical';
          break;
      }
      
      return { ...target, current, status };
    }));
  };

  const startOptimizationSession = async () => {
    setIsOptimizing(true);
    
    const session: OptimizationSession = {
      id: `opt_${Date.now()}`,
      startTime: Date.now(),
      iterations: 0,
      bestMetrics: metrics!,
      currentConfig: { ...config },
      optimizationHistory: []
    };
    
    setCurrentSession(session);
    
    // Run optimization iterations
    for (let i = 0; i < 10; i++) {
      await runOptimizationIteration(session, i);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Delay between iterations
    }
    
    setIsOptimizing(false);
  };

  const runOptimizationIteration = async (session: OptimizationSession, iteration: number) => {
    try {
      // Generate candidate configuration
      const candidateConfig = generateCandidateConfig(session.currentConfig);
      
      // Apply configuration
      await adaptiveContextScheduler.updateConfig(candidateConfig);
      
      // Measure performance
      await new Promise(resolve => setTimeout(resolve, 1000)); // Let system settle
      await collectPerformanceMetrics();
      
      if (!metrics) return;
      
      // Calculate improvement score
      const improvement = calculateImprovementScore(session.bestMetrics, metrics);
      
      // Update session history
      session.optimizationHistory.push({
        iteration,
        metrics: { ...metrics },
        config: { ...candidateConfig },
        improvement
      });
      
      // Update best metrics if improved
      if (improvement > 0) {
        session.bestMetrics = { ...metrics };
        session.currentConfig = { ...candidateConfig };
        setConfig(candidateConfig);
      }
      
      session.iterations = iteration + 1;
      setCurrentSession({ ...session });
      
    } catch (error) {
      console.error(`Optimization iteration ${iteration} failed:`, error);
    }
  };

  const generateCandidateConfig = (baseConfig: ACSConfig): ACSConfig => {
    // Simple random search with bounded variations
    const variations = {
      velocityFloor: baseConfig.velocityFloor * (0.8 + Math.random() * 0.4),
      sentimentSlopeNeg: baseConfig.sentimentSlopeNeg * (0.8 + Math.random() * 0.4),
      maxSilentMs: baseConfig.maxSilentMs * (0.8 + Math.random() * 0.4),
      frustrationThreshold: Math.max(0.1, Math.min(0.9, baseConfig.frustrationThreshold * (0.8 + Math.random() * 0.4))),
      clarificationThreshold: Math.max(0.1, Math.min(0.9, baseConfig.clarificationThreshold * (0.8 + Math.random() * 0.4))),
      enableRL: baseConfig.enableRL,
      personalityScaling: baseConfig.personalityScaling
    };
    
    return variations;
  };

  const calculateImprovementScore = (baseline: PerformanceMetrics, current: PerformanceMetrics): number => {
    // Weighted improvement calculation
    const weights = {
      latency: 0.4,
      memory: 0.2,
      throughput: 0.2,
      convergence: 0.1,
      errorRate: 0.1
    };
    
    const latencyImprovement = (baseline.p95Latency - current.p95Latency) / baseline.p95Latency;
    const memoryImprovement = (baseline.memoryUsage - current.memoryUsage) / baseline.memoryUsage;
    const throughputImprovement = (current.throughput - baseline.throughput) / baseline.throughput;
    const convergenceImprovement = (current.rlConvergenceRate - baseline.rlConvergenceRate) / baseline.rlConvergenceRate;
    const errorImprovement = (baseline.errorRate - current.errorRate) / baseline.errorRate;
    
    return (
      latencyImprovement * weights.latency +
      memoryImprovement * weights.memory +
      throughputImprovement * weights.throughput +
      convergenceImprovement * weights.convergence +
      errorImprovement * weights.errorRate
    );
  };

  const getStatusColor = (status: 'optimal' | 'warning' | 'critical') => {
    switch (status) {
      case 'optimal': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getStatusBadge = (status: 'optimal' | 'warning' | 'critical') => {
    switch (status) {
      case 'optimal': return <Badge className="bg-green-100 text-green-800">Optimal</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'critical': return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            ACS Performance Optimizer - Phase 2
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Real-time performance monitoring and optimization for sub-3ms P95 latency targets
            </p>
            <Button 
              onClick={startOptimizationSession} 
              disabled={isOptimizing || !metrics}
              className="flex items-center gap-2"
            >
              {isOptimizing ? (
                <>
                  <Activity className="w-4 h-4 animate-pulse" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  Start Optimization
                </>
              )}
            </Button>
          </div>

          {/* Current Metrics */}
          {metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{metrics.p95Latency.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">P95 Latency (ms)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{metrics.memoryUsage.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Memory (MB)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{metrics.throughput.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Throughput (req/s)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{(metrics.errorRate * 100).toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Error Rate</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optimization Targets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-green-500" />
            Performance Targets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {optimizationTargets.map((target, index) => (
              <div key={index} className={`p-3 border rounded-lg ${getStatusColor(target.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-medium">{target.name}</p>
                      <p className="text-sm opacity-75">
                        Current: {target.current.toFixed(2)} {target.unit} | Target: {target.target} {target.unit}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(target.status)}
                </div>
                <Progress 
                  value={target.name.includes('Convergence') || target.name.includes('Throughput') 
                    ? (target.current / target.target) * 100 
                    : Math.max(0, 100 - (target.current / target.target) * 100)
                  } 
                  className="mt-2" 
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Tuning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-500" />
            Configuration Tuning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="thresholds">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
              <TabsTrigger value="timing">Timing</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="thresholds" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Frustration Threshold</label>
                  <div className="flex items-center space-x-4 mt-2">
                    <Slider
                      value={[config.frustrationThreshold]}
                      onValueChange={([value]) => setConfig(prev => ({ ...prev, frustrationThreshold: value }))}
                      min={0.1}
                      max={0.9}
                      step={0.05}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={config.frustrationThreshold}
                      onChange={(e) => setConfig(prev => ({ ...prev, frustrationThreshold: parseFloat(e.target.value) }))}
                      className="w-20"
                      min={0.1}
                      max={0.9}
                      step={0.05}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Clarification Threshold</label>
                  <div className="flex items-center space-x-4 mt-2">
                    <Slider
                      value={[config.clarificationThreshold]}
                      onValueChange={([value]) => setConfig(prev => ({ ...prev, clarificationThreshold: value }))}
                      min={0.1}
                      max={0.9}
                      step={0.05}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={config.clarificationThreshold}
                      onChange={(e) => setConfig(prev => ({ ...prev, clarificationThreshold: parseFloat(e.target.value) }))}
                      className="w-20"
                      min={0.1}
                      max={0.9}
                      step={0.05}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Velocity Floor</label>
                  <div className="flex items-center space-x-4 mt-2">
                    <Slider
                      value={[config.velocityFloor]}
                      onValueChange={([value]) => setConfig(prev => ({ ...prev, velocityFloor: value }))}
                      min={0.05}
                      max={0.5}
                      step={0.01}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={config.velocityFloor}
                      onChange={(e) => setConfig(prev => ({ ...prev, velocityFloor: parseFloat(e.target.value) }))}
                      className="w-20"
                      min={0.05}
                      max={0.5}
                      step={0.01}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timing" className="space-y-4">
              <div>
                <label className="text-sm font-medium">Max Silent Duration (ms)</label>
                <div className="flex items-center space-x-4 mt-2">
                  <Slider
                    value={[config.maxSilentMs]}
                    onValueChange={([value]) => setConfig(prev => ({ ...prev, maxSilentMs: value }))}
                    min={10000}
                    max={300000}
                    step={5000}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={config.maxSilentMs}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxSilentMs: parseInt(e.target.value) }))}
                    className="w-24"
                    min={10000}
                    max={300000}
                    step={5000}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Sentiment Slope Negative</label>
                <div className="flex items-center space-x-4 mt-2">
                  <Slider
                    value={[Math.abs(config.sentimentSlopeNeg)]}
                    onValueChange={([value]) => setConfig(prev => ({ ...prev, sentimentSlopeNeg: -value }))}
                    min={0.01}
                    max={0.2}
                    step={0.01}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={config.sentimentSlopeNeg}
                    onChange={(e) => setConfig(prev => ({ ...prev, sentimentSlopeNeg: parseFloat(e.target.value) }))}
                    className="w-20"
                    min={-0.2}
                    max={-0.01}
                    step={0.01}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Enable Reinforcement Learning</label>
                <Button
                  variant={config.enableRL ? "default" : "outline"}
                  size="sm"
                  onClick={() => setConfig(prev => ({ ...prev, enableRL: !prev.enableRL }))}
                >
                  {config.enableRL ? "Enabled" : "Disabled"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Personality Scaling</label>
                <Button
                  variant={config.personalityScaling ? "default" : "outline"}
                  size="sm"
                  onClick={() => setConfig(prev => ({ ...prev, personalityScaling: !prev.personalityScaling }))}
                >
                  {config.personalityScaling ? "Enabled" : "Disabled"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4 flex gap-2">
            <Button 
              onClick={() => adaptiveContextScheduler.updateConfig(config)}
              variant="default"
            >
              Apply Configuration
            </Button>
            <Button 
              onClick={() => setConfig({
                velocityFloor: 0.15,
                sentimentSlopeNeg: -0.05,
                maxSilentMs: 45000,
                frustrationThreshold: 0.7,
                clarificationThreshold: 0.6,
                enableRL: true,
                personalityScaling: true
              })}
              variant="outline"
            >
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Session Results */}
      {currentSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              Optimization Session: {currentSession.id}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 border rounded">
                  <p className="text-lg font-bold">{currentSession.iterations}</p>
                  <p className="text-xs text-muted-foreground">Iterations</p>
                </div>
                <div className="text-center p-3 border rounded">
                  <p className="text-lg font-bold">{currentSession.bestMetrics.p95Latency.toFixed(2)}ms</p>
                  <p className="text-xs text-muted-foreground">Best P95 Latency</p>
                </div>
                <div className="text-center p-3 border rounded">
                  <p className="text-lg font-bold">{currentSession.bestMetrics.memoryUsage.toFixed(1)}MB</p>
                  <p className="text-xs text-muted-foreground">Best Memory Usage</p>
                </div>
                <div className="text-center p-3 border rounded">
                  <p className="text-lg font-bold">
                    {currentSession.optimizationHistory.length > 0 
                      ? (currentSession.optimizationHistory[currentSession.optimizationHistory.length - 1].improvement * 100).toFixed(1)
                      : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">Latest Improvement</p>
                </div>
              </div>

              {isOptimizing && (
                <div className="space-y-2">
                  <Progress value={(currentSession.iterations / 10) * 100} />
                  <p className="text-xs text-muted-foreground text-center">
                    Optimization in progress: {currentSession.iterations}/10 iterations
                  </p>
                </div>
              )}

              {currentSession.optimizationHistory.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Optimization History</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {currentSession.optimizationHistory.map((entry, index) => (
                      <div key={index} className="flex justify-between items-center p-2 text-sm border rounded">
                        <span>Iteration {entry.iteration + 1}</span>
                        <span>P95: {entry.metrics.p95Latency.toFixed(2)}ms</span>
                        <Badge variant={entry.improvement > 0 ? "default" : "outline"}>
                          {entry.improvement > 0 ? '+' : ''}{(entry.improvement * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};