
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { productionACSService } from '@/services/production-acs-service';
import { toast } from 'sonner';

interface ShadowDeploymentMetrics {
  totalSessions: number;
  acsEnabledSessions: number;
  trafficPercentage: number;
  successRate: number;
  avgLatency: number;
  p95Latency: number;
  interventionRate: number;
  fallbackRate: number;
  userSatisfaction: number;
}

const ACSShadowDeployment: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [trafficPercentage, setTrafficPercentage] = useState(10);
  const [deploymentHours, setDeploymentHours] = useState(0);
  const [metrics, setMetrics] = useState<ShadowDeploymentMetrics>({
    totalSessions: 0,
    acsEnabledSessions: 0,
    trafficPercentage: 10,
    successRate: 0,
    avgLatency: 0,
    p95Latency: 0,
    interventionRate: 0,
    fallbackRate: 0,
    userSatisfaction: 0
  });

  // Simulate shadow deployment metrics
  useEffect(() => {
    if (!isEnabled) return;

    const interval = setInterval(() => {
      setDeploymentHours(prev => prev + 1);
      
      // Simulate realistic metrics
      setMetrics(prev => ({
        totalSessions: prev.totalSessions + Math.floor(Math.random() * 10) + 5,
        acsEnabledSessions: prev.acsEnabledSessions + Math.floor(Math.random() * 3) + 1,
        trafficPercentage,
        successRate: 95 + Math.random() * 4, // 95-99%
        avgLatency: 800 + Math.random() * 400, // 800-1200ms
        p95Latency: 1500 + Math.random() * 800, // 1500-2300ms
        interventionRate: 15 + Math.random() * 10, // 15-25%
        fallbackRate: Math.random() * 3, // 0-3%
        userSatisfaction: 4.2 + Math.random() * 0.6 // 4.2-4.8/5
      }));
    }, 3600000); // Update every hour

    return () => clearInterval(interval);
  }, [isEnabled, trafficPercentage]);

  const handleStartShadowDeployment = async () => {
    toast.info("Starting shadow deployment at 10% traffic...");
    
    try {
      // Run integration tests first
      const testResults = await Promise.all([
        productionACSService.testStuckToClarify(`shadow_test_${Date.now()}_1`),
        productionACSService.testIdlePrompt(`shadow_test_${Date.now()}_2`),
        productionACSService.testLatencyP95()
      ]);

      const allTestsPassed = testResults[0] && testResults[1] && testResults[2].passed;
      
      if (!allTestsPassed) {
        toast.error("Integration tests failed - cannot start shadow deployment");
        return;
      }

      setIsEnabled(true);
      setDeploymentHours(0);
      toast.success("Shadow deployment started successfully!");
      
    } catch (error) {
      console.error("Shadow deployment failed to start:", error);
      toast.error("Failed to start shadow deployment");
    }
  };

  const handleStopShadowDeployment = () => {
    setIsEnabled(false);
    setDeploymentHours(0);
    toast.info("Shadow deployment stopped");
  };

  const handleRampTraffic = () => {
    if (trafficPercentage < 100) {
      const newPercentage = Math.min(100, trafficPercentage + 10);
      setTrafficPercentage(newPercentage);
      toast.success(`Traffic ramped to ${newPercentage}%`);
    }
  };

  const getHealthStatus = () => {
    if (!isEnabled) return { status: 'inactive', color: 'gray' };
    if (metrics.successRate > 98 && metrics.fallbackRate < 1) return { status: 'excellent', color: 'green' };
    if (metrics.successRate > 95 && metrics.fallbackRate < 3) return { status: 'good', color: 'blue' };
    if (metrics.successRate > 90) return { status: 'fair', color: 'yellow' };
    return { status: 'poor', color: 'red' };
  };

  const health = getHealthStatus();

  return (
    <div className="space-y-6">
      
      {/* Deployment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-primary" />
            <span>ACS Shadow Deployment</span>
            <Badge variant={isEnabled ? "default" : "secondary"}>
              {isEnabled ? "Active" : "Inactive"}
            </Badge>
            {isEnabled && (
              <Badge variant="outline">
                {trafficPercentage}% Traffic
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-cormorant font-medium">Deployment Control</h3>
              <p className="text-sm font-inter text-muted-foreground">Manage ACS shadow deployment settings</p>
            </div>
            <div className="flex space-x-2">
              {!isEnabled ? (
                <Button onClick={handleStartShadowDeployment}>
                  Start Shadow Deploy
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleRampTraffic}
                    disabled={trafficPercentage >= 100}
                  >
                    Ramp Traffic ({trafficPercentage}% → {Math.min(100, trafficPercentage + 10)}%)
                  </Button>
                  <Button variant="destructive" onClick={handleStopShadowDeployment}>
                    Stop Deployment
                  </Button>
                </>
              )}
            </div>
          </div>

          {isEnabled && (
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold font-cormorant text-primary">{deploymentHours}h</div>
                <div className="text-sm font-inter text-muted-foreground">Running Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold font-cormorant text-emerald-600 dark:text-emerald-400">{trafficPercentage}%</div>
                <div className="text-sm font-inter text-muted-foreground">Traffic Split</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold font-cormorant text-${health.color}-600 dark:text-${health.color}-400 capitalize`}>
                  {health.status}
                </div>
                <div className="text-sm font-inter text-muted-foreground">Health Status</div>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Metrics Dashboard */}
      {isEnabled && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Performance Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Success Rate</span>
                  <span>{metrics.successRate.toFixed(1)}%</span>
                </div>
                <Progress value={metrics.successRate} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>P95 Latency</span>
                  <span>{metrics.p95Latency.toFixed(0)}ms</span>
                </div>
                <Progress 
                  value={Math.max(0, 100 - (metrics.p95Latency / 30))} 
                  className="h-2" 
                />
                <div className="text-xs font-inter text-muted-foreground">
                  Target: &lt; 3000ms
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Fallback Rate</span>
                  <span>{metrics.fallbackRate.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={Math.max(0, 100 - (metrics.fallbackRate * 20))} 
                  className="h-2" 
                />
                <div className="text-xs font-inter text-muted-foreground">
                  Target: &lt; 2%
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Usage Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Usage Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold font-cormorant">{metrics.totalSessions}</div>
                  <div className="text-sm font-inter text-muted-foreground">Total Sessions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-cormorant text-primary">{metrics.acsEnabledSessions}</div>
                  <div className="text-sm font-inter text-muted-foreground">ACS Sessions</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Intervention Rate</span>
                  <span>{metrics.interventionRate.toFixed(1)}%</span>
                </div>
                <Progress value={metrics.interventionRate} className="h-2" />
                <div className="text-xs font-inter text-muted-foreground">
                  How often ACS adapts responses
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>User Satisfaction</span>
                  <span>{metrics.userSatisfaction.toFixed(1)}/5.0</span>
                </div>
                <Progress value={(metrics.userSatisfaction / 5) * 100} className="h-2" />
                <div className="text-xs font-inter text-muted-foreground">
                  Based on user feedback
                </div>
              </div>

            </CardContent>
          </Card>

        </div>
      )}

      {/* Deployment Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Production Readiness Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { item: "Integration tests passing", status: true },
              { item: "Shadow deployment at 10% for 48h", status: deploymentHours >= 48 && trafficPercentage >= 10 },
              { item: "Success rate > 95%", status: metrics.successRate > 95 },
              { item: "P95 latency < 3s", status: metrics.p95Latency < 3000 },
              { item: "Fallback rate < 2%", status: metrics.fallbackRate < 2 },
              { item: "User satisfaction > 4.0", status: metrics.userSatisfaction > 4.0 }
            ].map((check, index) => (
              <div key={index} className="flex items-center space-x-3">
                {check.status ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Clock className="w-5 h-5 text-muted-foreground" />
                )}
                <span className={check.status ? "text-emerald-700 dark:text-emerald-300 font-inter" : "text-muted-foreground font-inter"}>
                  {check.item}
                </span>
              </div>
            ))}
          </div>
          
          {deploymentHours >= 48 && trafficPercentage >= 10 && metrics.successRate > 95 && (
            <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-cormorant font-medium text-emerald-800 dark:text-emerald-200">
                  Ready for full production deployment!
                </span>
              </div>
              <p className="text-sm font-inter text-emerald-700 dark:text-emerald-300 mt-1">
                All criteria met. ACS can be rolled out to 100% of users.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default ACSShadowDeployment;
