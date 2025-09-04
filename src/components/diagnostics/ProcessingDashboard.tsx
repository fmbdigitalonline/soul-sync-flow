import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Square, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Zap,
  Activity,
  Clock,
  Trash2
} from 'lucide-react';
import { JobControlService, GenerationJob } from '@/services/job-control-service';
import { GhostProcessMonitor } from '@/services/ghost-process-monitor';
import { GenerationDiagnostics } from '@/services/generation-diagnostics';
import { useToast } from '@/hooks/use-toast';

interface ProcessingDashboardProps {
  className?: string;
}

export const ProcessingDashboard: React.FC<ProcessingDashboardProps> = ({ className }) => {
  const { toast } = useToast();
  const [activeJobs, setActiveJobs] = useState<GenerationJob[]>([]);
  const [ghostJobs, setGhostJobs] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [operationInProgress, setOperationInProgress] = useState<string | null>(null);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load active jobs
      const jobs = await JobControlService.getActiveJobs();
      setActiveJobs(jobs);
      
      // Detect ghost processes
      const ghosts = await GhostProcessMonitor.detectGhostProcesses();
      setGhostJobs(ghosts.filter(g => g.status === 'ghost'));
      
      // Get system health
      const health = await GenerationDiagnostics.getSystemHealth();
      setSystemHealth(health);
      
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: "Dashboard Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Force cleanup a specific job
  const forceCleanupJob = async (jobId: string) => {
    try {
      setOperationInProgress(`cleanup-${jobId}`);
      
      const result = await JobControlService.forceCleanupJob(jobId);
      
      if (result.success) {
        toast({
          title: "Job Cleaned Up",
          description: `Job ${jobId} has been forcibly cleaned up`,
        });
        await loadDashboardData();
      } else {
        throw new Error(result.error || 'Cleanup failed');
      }
    } catch (error: any) {
      toast({
        title: "Cleanup Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setOperationInProgress(null);
    }
  };

  // Eliminate all ghost processes
  const eliminateAllGhosts = async () => {
    try {
      setOperationInProgress('eliminate-ghosts');
      
      const result = await GhostProcessMonitor.autoEliminateGhosts();
      
      toast({
        title: "Ghost Process Cleanup",
        description: `Eliminated ${result.eliminated} ghost processes`,
      });
      
      if (result.errors.length > 0) {
        console.warn('Ghost elimination errors:', result.errors);
      }
      
      await loadDashboardData();
      
    } catch (error: any) {
      toast({
        title: "Ghost Elimination Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setOperationInProgress(null);
    }
  };

  // Recover stuck jobs
  const recoverStuckJobs = async () => {
    try {
      setOperationInProgress('recover-stuck');
      
      const result = await JobControlService.recoverStuckJobs();
      
      toast({
        title: "Job Recovery",
        description: `Recovered ${result.recovered} stuck jobs`,
      });
      
      if (result.errors.length > 0) {
        console.warn('Recovery errors:', result.errors);
      }
      
      await loadDashboardData();
      
    } catch (error: any) {
      toast({
        title: "Recovery Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setOperationInProgress(null);
    }
  };

  // Auto-refresh every 10 seconds
  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getJobStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getJobStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'running': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'cancelled': return <Square className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getGhostRecommendationColor = (recommendation: string): string => {
    switch (recommendation) {
      case 'continue': return 'text-green-600';
      case 'investigate': return 'text-yellow-600';
      case 'eliminate': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Processing Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time monitoring and management of background processes
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={loadDashboardData}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RotateCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {ghostJobs.length > 0 && (
            <Button
              onClick={eliminateAllGhosts}
              disabled={operationInProgress === 'eliminate-ghosts'}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminate Ghosts ({ghostJobs.length})
            </Button>
          )}
          
          <Button
            onClick={recoverStuckJobs}
            disabled={operationInProgress === 'recover-stuck'}
            variant="outline"
            size="sm"
          >
            <Zap className="h-4 w-4 mr-2" />
            Recover Stuck
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
              <Badge variant={systemHealth.edgeFunction.status === 'healthy' ? 'default' : 'destructive'}>
                {systemHealth.edgeFunction.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{activeJobs.length}</div>
                <div className="text-sm text-muted-foreground">Active Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{ghostJobs.length}</div>
                <div className="text-sm text-muted-foreground">Ghost Processes</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${systemHealth.database.healthy ? 'text-green-500' : 'text-red-500'}`}>
                  {systemHealth.database.healthy ? 'OK' : 'FAIL'}
                </div>
                <div className="text-sm text-muted-foreground">Database</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${systemHealth.processingCapacity.available ? 'text-green-500' : 'text-yellow-500'}`}>
                  {systemHealth.processingCapacity.activeJobs}/{systemHealth.processingCapacity.maxCapacity}
                </div>
                <div className="text-sm text-muted-foreground">Capacity</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Active Jobs ({activeJobs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active jobs
            </div>
          ) : (
            <div className="space-y-4">
              {activeJobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getJobStatusIcon(job.status)}
                      <div>
                        <div className="font-medium">{job.job_type}</div>
                        <div className="text-sm text-muted-foreground">{job.id}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getJobStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                      
                      <Button
                        onClick={() => forceCleanupJob(job.id)}
                        disabled={operationInProgress === `cleanup-${job.id}`}
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {job.progress && typeof job.progress === 'object' && (
                    <div className="space-y-2">
                      {job.progress.progress && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{job.progress.phase || 'Processing'}</span>
                            <span>{job.progress.progress}%</span>
                          </div>
                          <Progress value={job.progress.progress} className="h-2" />
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground mt-2">
                    Started: {new Date(job.started_at || job.created_at).toLocaleString()} • 
                    Updated: {new Date(job.updated_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ghost Processes */}
      {ghostJobs.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Ghost Processes Detected ({ghostJobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ghostJobs.map((ghost) => (
                <div key={ghost.jobId} className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium text-red-800">{ghost.jobId}</div>
                      <div className="text-sm text-red-600">
                        Runtime: {Math.round(ghost.runtimeMinutes)} minutes • 
                        Last Update: {Math.round(ghost.minutesSinceUpdate)} minutes ago
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Ghost</Badge>
                      
                      <Button
                        onClick={() => forceCleanupJob(ghost.jobId)}
                        disabled={operationInProgress === `cleanup-${ghost.jobId}`}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminate
                      </Button>
                    </div>
                  </div>
                  
                  <div className={`text-sm font-medium ${getGhostRecommendationColor(ghost.recommendation)}`}>
                    Recommendation: {ghost.recommendation}
                  </div>
                  
                  {ghost.progress && (
                    <div className="mt-2">
                      <div className="text-xs text-muted-foreground">Stuck at: {ghost.progress.phase} ({ghost.progress.progress}%)</div>
                      <Progress value={ghost.progress.progress} className="h-2 mt-1" />
                    </div>
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