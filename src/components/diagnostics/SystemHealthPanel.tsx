import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GenerationDiagnostics, type SystemHealthDiagnostic } from '@/services/generation-diagnostics';
import { GhostProcessMonitor } from '@/services/ghost-process-monitor';
import { JobControlService } from '@/services/job-control-service';
import { AlertCircle, CheckCircle, Clock, Zap, Skull } from 'lucide-react';

interface SystemHealthPanelProps {
  jobId?: string;
  onEmergencyRecovery?: () => void;
  className?: string;
}

export const SystemHealthPanel: React.FC<SystemHealthPanelProps> = ({
  jobId,
  onEmergencyRecovery,
  className = ''
}) => {
  const [health, setHealth] = useState<SystemHealthDiagnostic | null>(null);
  const [loading, setLoading] = useState(false);
  const [eliminating, setEliminating] = useState(false);
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  const checkSystemHealth = async () => {
    setLoading(true);
    try {
      console.log('🩺 PANEL: Running system health check...');
      const healthResult = await GenerationDiagnostics.getSystemHealth();
      setHealth(healthResult);
      setLastCheck(new Date().toLocaleTimeString());
      console.log('🩺 PANEL: Health check complete:', healthResult);
    } catch (error) {
      console.error('❌ PANEL: Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const eliminateGhostProcesses = async () => {
    setEliminating(true);
    try {
      console.log('💀 PANEL: Eliminating ghost processes...');
      const result = await GhostProcessMonitor.autoEliminateGhosts();
      console.log('💀 PANEL: Ghost elimination complete:', result);
      
      // Refresh health after elimination
      setTimeout(checkSystemHealth, 1000);
    } catch (error) {
      console.error('❌ PANEL: Ghost elimination failed:', error);
    } finally {
      setEliminating(false);
    }
  };

  const recoverStuckJobs = async () => {
    try {
      console.log('🔧 PANEL: Running job recovery...');
      const result = await JobControlService.recoverStuckJobs();
      console.log('🔧 PANEL: Job recovery complete:', result);
      
      // Refresh health after recovery
      setTimeout(checkSystemHealth, 1000);
    } catch (error) {
      console.error('❌ PANEL: Job recovery failed:', error);
    }
  };

  useEffect(() => {
    checkSystemHealth();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (status: 'healthy' | 'degraded' | 'critical') => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getHealthIcon = (status: 'healthy' | 'degraded' | 'critical') => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'degraded': return <Clock className="w-4 h-4" />;
      case 'critical': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (!health) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-3">Checking system health...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            System Health
          </div>
          <Badge 
            variant="outline" 
            className={`${getHealthColor(health.overall)} border-current`}
          >
            <div className="flex items-center gap-1">
              {getHealthIcon(health.overall)}
              {health.overall.toUpperCase()}
            </div>
          </Badge>
        </CardTitle>
        {lastCheck && (
          <p className="text-sm text-muted-foreground">
            Last checked: {lastCheck}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Edge Function Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
          <div>
            <h4 className="font-medium">Edge Function</h4>
            <p className="text-sm text-muted-foreground">
              {health.edgeFunction.accessible ? 'Accessible' : 'Not Accessible'}
              {health.edgeFunction.responseTime && ` (${health.edgeFunction.responseTime}ms)`}
              {health.edgeFunction.version && ` - v${health.edgeFunction.version}`}
            </p>
          </div>
          <Badge 
            variant={health.edgeFunction.accessible ? "default" : "destructive"}
          >
            {health.edgeFunction.accessible ? 'Online' : 'Offline'}
          </Badge>
        </div>

        {/* Database Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
          <div>
            <h4 className="font-medium">Database</h4>
            <p className="text-sm text-muted-foreground">
              {health.database.activeJobs} active, {health.database.stuckJobs} stuck jobs
            </p>
          </div>
          <Badge 
            variant={health.database.accessible ? "default" : "destructive"}
          >
            {health.database.accessible ? 'Connected' : 'Error'}
          </Badge>
        </div>

        {/* Processing Capacity */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
          <div>
            <h4 className="font-medium">Processing</h4>
            <p className="text-sm text-muted-foreground">
              {health.processingCapacity.available ? 'Available' : health.processingCapacity.reason}
            </p>
          </div>
          <Badge 
            variant={health.processingCapacity.available ? "default" : "secondary"}
          >
            {health.processingCapacity.available ? 'Ready' : 'Blocked'}
          </Badge>
        </div>

        {/* Ghost Processes Status - CRITICAL MONITORING */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
          <div>
            <h4 className="font-medium flex items-center gap-2">
              <Skull className="w-4 h-4" />
              Background Tasks
            </h4>
            <p className="text-sm text-muted-foreground">
              {health.ghostProcesses.totalRunning} running, {health.ghostProcesses.ghostsDetected} ghost processes
            </p>
          </div>
          <Badge 
            variant={health.ghostProcesses.ghostsDetected === 0 ? "default" : "destructive"}
          >
            {health.ghostProcesses.ghostsDetected === 0 ? 'Healthy' : `${health.ghostProcesses.ghostsDetected} Ghosts`}
          </Badge>
        </div>

        {/* Recommendations */}
        {health.recommendations.length > 0 && (
          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">Recommendations</h4>
            <ul className="space-y-1">
              {health.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-yellow-700">
                  • {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions - TRANSPARENT ERROR RECOVERY */}
        <div className="flex gap-2 pt-2 flex-wrap">
          <Button 
            onClick={checkSystemHealth} 
            disabled={loading}
            size="sm"
            variant="outline"
          >
            {loading ? 'Checking...' : 'Refresh'}
          </Button>
          
          {health.ghostProcesses.ghostsDetected > 0 && (
            <Button 
              onClick={eliminateGhostProcesses}
              disabled={eliminating}
              size="sm"
              variant="destructive"
            >
              {eliminating ? 'Eliminating...' : `Eliminate ${health.ghostProcesses.ghostsDetected} Ghosts`}
            </Button>
          )}
          
          {health.database.stuckJobs > 0 && (
            <Button 
              onClick={recoverStuckJobs}
              size="sm"
              variant="secondary"
            >
              Recover {health.database.stuckJobs} Stuck Jobs
            </Button>
          )}
          
          {onEmergencyRecovery && health.overall !== 'healthy' && (
            <Button 
              onClick={onEmergencyRecovery}
              size="sm"
              variant="destructive"
            >
              Emergency Recovery
            </Button>
          )}
        </div>

        {/* Debug Info for Development */}
        {process.env.NODE_ENV === 'development' && jobId && (
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground">
              Debug Information
            </summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
              {JSON.stringify(health, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
};