import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  Pause, 
  Play, 
  RotateCcw, 
  Terminal,
  Zap,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { JobControlService, GenerationJob } from '@/services/job-control-service';
import { GhostProcessMonitor } from '@/services/ghost-process-monitor';

interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  jobId?: string;
  metadata?: any;
}

interface RealTimeProcessMonitorProps {
  jobId?: string;
  className?: string;
}

export const RealTimeProcessMonitor: React.FC<RealTimeProcessMonitorProps> = ({ 
  jobId, 
  className 
}) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentJob, setCurrentJob] = useState<GenerationJob | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [ghostStatus, setGhostStatus] = useState<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Add log entry
  const addLog = (level: LogEntry['level'], message: string, metadata?: any) => {
    const newLog: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      jobId,
      metadata
    };
    
    setLogs(prev => [...prev.slice(-99), newLog]); // Keep last 100 logs
  };

  // Monitor job status
  const monitorJobStatus = async () => {
    if (!jobId) return;
    
    try {
      // Get job status
      const job = await JobControlService.getJobStatus(jobId);
      
      if (job) {
        const prevStatus = currentJob?.status;
        const prevProgress = currentJob?.progress;
        
        setCurrentJob(job);
        
        // Log status changes
        if (prevStatus && prevStatus !== job.status) {
          addLog('info', `Job status changed: ${prevStatus} → ${job.status}`, { 
            oldStatus: prevStatus, 
            newStatus: job.status 
          });
        }
        
        // Log progress changes
        if (prevProgress && job.progress && 
            JSON.stringify(prevProgress) !== JSON.stringify(job.progress)) {
          const progressValue = typeof job.progress === 'object' && job.progress.progress 
            ? job.progress.progress 
            : 0;
          addLog('info', `Progress update: ${progressValue}%`, job.progress);
        }
        
        // Check for ghost process status
        const ghostDiagnostics = await GhostProcessMonitor.detectGhostProcesses();
        const jobGhost = ghostDiagnostics.find(g => g.jobId === jobId);
        
        if (jobGhost) {
          const prevGhostStatus = ghostStatus?.status;
          setGhostStatus(jobGhost);
          
          if (jobGhost.status === 'ghost' && prevGhostStatus !== 'ghost') {
            addLog('error', 'Ghost process detected! Job appears to be stuck.', {
              runtimeMinutes: jobGhost.runtimeMinutes,
              recommendation: jobGhost.recommendation
            });
          }
        } else {
          setGhostStatus(null);
        }
        
        // Auto-complete monitoring if job finished
        if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
          addLog('success', `Job monitoring complete: ${job.status}`);
          setIsMonitoring(false);
        }
        
      } else {
        addLog('warn', `Job ${jobId} not found`);
        setIsMonitoring(false);
      }
      
    } catch (error: any) {
      addLog('error', `Monitoring error: ${error.message}`, { error: error.stack });
    }
  };

  // Start/stop monitoring
  const toggleMonitoring = () => {
    if (isMonitoring) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      addLog('info', 'Monitoring stopped');
      setIsMonitoring(false);
    } else {
      if (!jobId) {
        addLog('error', 'No job ID provided for monitoring');
        return;
      }
      
      addLog('info', `Starting real-time monitoring for job: ${jobId}`);
      setIsMonitoring(true);
      
      // Initial check
      monitorJobStatus();
      
      // Set up interval
      intervalRef.current = setInterval(monitorJobStatus, 2000); // Check every 2 seconds
    }
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
    addLog('info', 'Logs cleared');
  };

  // Auto-scroll to latest log
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Auto-start monitoring if jobId is provided
  useEffect(() => {
    if (jobId && !isMonitoring) {
      addLog('info', `Job ID detected: ${jobId}. Ready to monitor.`);
    }
  }, [jobId]);

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'info': return <Activity className="h-4 w-4 text-blue-500" />;
      case 'warn': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Terminal className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLogColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'info': return 'text-blue-700';
      case 'warn': return 'text-yellow-700';
      case 'error': return 'text-red-700';
      case 'success': return 'text-green-700';
      default: return 'text-gray-700';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Real-Time Process Monitor
              {isMonitoring && (
                <Badge variant="default" className="animate-pulse">
                  LIVE
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={clearLogs}
                variant="outline"
                size="sm"
                disabled={logs.length === 0}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear
              </Button>
              
              <Button
                onClick={toggleMonitoring}
                variant={isMonitoring ? "destructive" : "default"}
                size="sm"
                disabled={!jobId}
              >
                {isMonitoring ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
          
          {jobId && (
            <div className="text-sm text-muted-foreground">
              Monitoring Job: {jobId}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Current Job Status */}
      {currentJob && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Job Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{currentJob.job_type}</div>
                <div className="text-sm text-muted-foreground">
                  Created: {new Date(currentJob.created_at).toLocaleString()}
                </div>
              </div>
              
              <Badge variant={
                currentJob.status === 'completed' ? 'default' :
                currentJob.status === 'failed' ? 'destructive' :
                currentJob.status === 'running' ? 'secondary' : 'outline'
              }>
                {currentJob.status}
              </Badge>
            </div>
            
            {currentJob.progress && typeof currentJob.progress === 'object' && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>{currentJob.progress.phase || 'Processing'}</span>
                  <span>{currentJob.progress.progress || 0}%</span>
                </div>
                <Progress value={currentJob.progress.progress || 0} />
              </div>
            )}
            
            {ghostStatus && ghostStatus.status === 'ghost' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-700 font-medium mb-1">
                  <AlertCircle className="h-4 w-4" />
                  Ghost Process Detected
                </div>
                <div className="text-sm text-red-600">
                  Runtime: {Math.round(ghostStatus.runtimeMinutes)} min • 
                  Recommendation: {ghostStatus.recommendation}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Live Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Live Logs ({logs.length})</span>
            {isMonitoring && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Monitoring...
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 w-full">
            <div className="space-y-2">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No logs yet. {jobId ? 'Click Start to begin monitoring.' : 'Provide a job ID to monitor.'}
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    {getLogIcon(log.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                        <span className={`${getLogColor(log.level)} font-medium`}>
                          {log.message}
                        </span>
                      </div>
                      {log.metadata && (
                        <pre className="text-xs text-muted-foreground mt-1 bg-gray-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};