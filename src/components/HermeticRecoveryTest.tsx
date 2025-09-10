import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Sparkles, Trash2, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useHermeticReportStatus } from '@/hooks/use-hermetic-report-status';

interface JobStatus {
  job_id: string;
  status: string;
  last_heartbeat: string | null;
  sub_job_count: number;
  total_content_length: number;
  is_zombie: boolean;
}

export const HermeticRecoveryTest: React.FC = () => {
  const [jobStatuses, setJobStatuses] = useState<JobStatus[]>([]);
  const [cleaningUp, setCleaningUp] = useState(false);
  const { toast } = useToast();
  
  // CRITICAL: Use the hermetic status hook for real-time status
  const { 
    isGenerating, 
    hasZombieJob, 
    progress, 
    currentStep, 
    error, 
    loading,
    cleanupZombieJob: hookCleanupZombieJob,
    refreshStatus 
  } = useHermeticReportStatus();

  const checkZombieJobs = async () => {
    try {
      const { data, error } = await supabase.rpc('validate_job_heartbeat_with_content');
      
      if (error) throw error;
      
      setJobStatuses(data || []);
      
      const zombieCount = data?.filter(job => job.is_zombie).length || 0;
      toast({
        title: "Zombie Job Detection Complete",
        description: `Found ${zombieCount} zombie jobs out of ${data?.length || 0} total jobs`
      });
    } catch (error) {
      console.error('Error checking zombie jobs:', error);
      toast({
        title: "Error",
        description: "Failed to check zombie jobs",
        variant: "destructive"
      });
    }
  };

  const cleanupZombieJobs = async () => {
    // Add confirmation dialog for safety
    const zombieJobs = jobStatuses.filter(job => job.is_zombie);
    if (zombieJobs.length === 0) {
      toast({
        title: "No zombie jobs found",
        description: "Check for zombie jobs first to see what needs cleanup",
        variant: "default"
      });
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to clean up ${zombieJobs.length} zombie job(s)? This will mark them as failed and cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      setCleaningUp(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to clean up zombie jobs",
          variant: "destructive"
        });
        return;
      }

      console.log('🔧 Starting cleanup for user:', user.id);

      // Use the updated cleanup function with user-specific filtering
      const { data: cleanedJobsCount, error } = await supabase.rpc('cleanup_stuck_hermetic_jobs', {
        p_user_id: user.id
      });
      
      if (error) {
        console.error('❌ Cleanup RPC error:', error);
        throw error;
      }
      
      const count = cleanedJobsCount || 0;
      console.log('✅ Cleanup completed, jobs affected:', count);
      
      toast({
        title: "Cleanup completed successfully",
        description: count > 0 
          ? `${count} zombie job${count === 1 ? '' : 's'} ${count === 1 ? 'was' : 'were'} marked as failed`
          : "No stuck jobs found to clean up",
      });
      
      // Refresh job statuses to show the changes
      await checkZombieJobs();
      
    } catch (error) {
      console.error('❌ Zombie cleanup failed:', error);
      toast({
        title: "Cleanup failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setCleaningUp(false);
    }
  };

  const recoverCompletedJob = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to recover reports",
          variant: "destructive"
        });
        return;
      }

      // Find completed jobs without reports
      const { data: completedJobs, error } = await supabase
        .from('hermetic_processing_jobs')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .eq('progress_percentage', 100)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!completedJobs || completedJobs.length === 0) {
        toast({
          title: "No recovery needed",
          description: "No completed jobs found that need recovery",
        });
        return;
      }

      const jobToRecover = completedJobs[0];
      console.log('🔧 Attempting to recover job:', jobToRecover.id);

      const { data: recoveryResult, error: recoveryError } = await supabase.functions.invoke('hermetic-recovery', {
        body: { job_id: jobToRecover.id }
      });

      if (recoveryError) throw recoveryError;

      if (recoveryResult?.success) {
        toast({
          title: "Recovery successful!",
          description: `Report recovered with ${recoveryResult.wordCount?.toLocaleString()} words`,
        });
        
        // Refresh job statuses
        await checkZombieJobs();
      } else {
        throw new Error(recoveryResult?.error || 'Recovery failed');
      }

    } catch (error) {
      console.error('❌ Recovery failed:', error);
      toast({
        title: "Recovery failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    }
  };

  // Enhanced cleanup using the hook's function
  const handleZombieCleanup = async () => {
    if (!hasZombieJob) {
      toast({
        title: "No zombie jobs found",
        description: "No stuck jobs need cleanup at this time",
        variant: "default"
      });
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to clean up zombie jobs? This will mark them as failed and cannot be undone."
    );
    
    if (!confirmed) return;

    try {
      const result = await hookCleanupZombieJob();
      if (result.success) {
        toast({
          title: "Cleanup completed successfully",
          description: `${result.cleanedCount} zombie job(s) cleaned up`,
        });
        await checkZombieJobs(); // Refresh the diagnostic view
      } else {
        throw new Error(result.error || 'Unknown cleanup error');
      }
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      toast({
        title: "Cleanup failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    }
  };

  // EMERGENCY FALLBACK: Force cleanup when normal zombie detection fails
  const handleEmergencyCleanup = async () => {
    const confirmed = window.confirm(
      "🚨 EMERGENCY CLEANUP: This will forcefully mark ALL potentially stuck jobs as failed. This should only be used when normal cleanup doesn't work. Continue?"
    );
    
    if (!confirmed) return;

    try {
      setCleaningUp(true);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        throw new Error('Not authenticated');
      }

      console.log('🚨 EMERGENCY CLEANUP: Calling emergency_cleanup_stuck_jobs function');
      
      const { data, error } = await supabase.rpc('emergency_cleanup_stuck_jobs', {
        p_user_id: user.user.id
      });

      if (error) {
        console.error('Emergency cleanup error:', error);
        throw error;
      }

      console.log('✅ Emergency cleanup completed, jobs cleaned:', data);
      
      toast({
        title: "🚨 Emergency Cleanup Completed",
        description: `Forcefully cleaned ${data || 0} stuck jobs. You can now test the Generate button.`
      });
      
      await refreshStatus();
      await checkZombieJobs(); // Refresh diagnostic view
    } catch (error: any) {
      console.error('Emergency cleanup failed:', error);
      toast({
        title: "Emergency Cleanup Failed",
        description: error.message || "Failed to perform emergency cleanup",
        variant: "destructive"
      });
    } finally {
      setCleaningUp(false);
    }
  };

  const startNewHermeticGeneration = async () => {
    // CRITICAL: Check if generation is already in progress
    if (isGenerating || hasZombieJob) {
      toast({
        title: "Generation Already Active",
        description: hasZombieJob 
          ? "A zombie job was detected. Please clean it up first." 
          : "Hermetic generation is already in progress.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to start hermetic generation",
          variant: "destructive"
        });
        return;
      }

      // Get user's blueprint
      const { data: blueprint, error: blueprintError } = await supabase
        .from('user_blueprints')
        .select('blueprint')
        .eq('user_id', user.user.id)
        .eq('is_active', true)
        .single();

      if (blueprintError || !blueprint) {
        toast({
          title: "Blueprint Required",
          description: "Please complete your blueprint first",
          variant: "destructive"
        });
        return;
      }

      console.log('🚀 Starting new hermetic generation for user:', user.user.id);

      // Start new hermetic generation
      const { data, error } = await supabase.functions.invoke('hermetic-job-creator', {
        body: {
          user_id: user.user.id,
          blueprint_data: blueprint.blueprint
        }
      });

      if (error) {
        console.error('❌ Job creation failed:', error);
        throw error;
      }

      console.log('✅ Job created successfully:', data.job_id);

      toast({
        title: "Hermetic Generation Started",
        description: `Processing initiated. This will take 30-45 minutes. Real-time progress will be shown below.`
      });

      // The hook will handle real-time status updates automatically
      refreshStatus();

    } catch (error) {
      console.error('❌ Error starting hermetic generation:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to start hermetic generation",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔄 Hermetic Recovery & Testing Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button onClick={checkZombieJobs} variant="outline" className="flex-1">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Check Zombie Jobs
            </Button>
            <Button 
              onClick={handleZombieCleanup}
              disabled={cleaningUp || !hasZombieJob}
              variant="destructive"
              className="flex-1"
            >
              {cleaningUp ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Cleaning up...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clean Up Zombies {hasZombieJob ? '(1)' : '(0)'}
                </>
              )}
            </Button>
            <Button 
              onClick={handleEmergencyCleanup}
              disabled={cleaningUp}
              variant="outline"
              className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              title="Emergency fallback: Force-clean ALL stuck jobs when normal detection fails"
            >
              {cleaningUp ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Emergency...
                </>
              ) : (
                <>
                  🚨 Emergency Cleanup
                </>
              )}
            </Button>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={startNewHermeticGeneration} 
              disabled={isGenerating || hasZombieJob || loading}
              variant="default" 
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing... ({progress.toFixed(1)}%)
                </>
              ) : hasZombieJob ? (
                <>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Zombie Job Detected
                </>
              ) : loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Hermetic Report
                </>
              )}
            </Button>
            <Button onClick={recoverCompletedJob} variant="secondary" className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Recover Completed Jobs
            </Button>
          </div>

          {/* ENHANCED: Real-time status display */}
          {(isGenerating || hasZombieJob || error) && (
            <Card className="border-l-4 border-l-primary">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    {isGenerating && <Clock className="h-4 w-4 animate-pulse" />}
                    {hasZombieJob && <AlertTriangle className="h-4 w-4 text-destructive" />}
                    {error && <AlertCircle className="h-4 w-4 text-destructive" />}
                    Real-time Status
                  </h4>
                  <Badge variant={
                    error ? 'destructive' : 
                    hasZombieJob ? 'destructive' : 
                    isGenerating ? 'default' : 'secondary'
                  }>
                    {error ? 'ERROR' : hasZombieJob ? 'ZOMBIE' : isGenerating ? 'PROCESSING' : 'IDLE'}
                  </Badge>
                </div>
                
                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {currentStep && (
                      <p className="text-sm text-muted-foreground">{currentStep}</p>
                    )}
                  </div>
                )}
                
                {hasZombieJob && (
                  <div className="text-sm text-destructive">
                    Zombie job detected. Generation appears stuck. Please clean up and retry.
                  </div>
                )}
                
                {error && (
                  <div className="text-sm text-destructive">
                    Error: {error}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {jobStatuses.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Job Status Overview</h3>
              <div className="grid gap-4">
                {jobStatuses.map((job) => (
                  <Card key={job.job_id} className="border-l-4 border-l-primary/20">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-mono text-sm text-muted-foreground">
                          {job.job_id.slice(0, 8)}...
                        </div>
                        <div className="flex gap-2">
                          <Badge 
                            variant={job.status === 'completed' ? 'default' : 
                                   job.status === 'failed' ? 'destructive' : 'secondary'}
                          >
                            {job.status}
                          </Badge>
                          {job.is_zombie && (
                            <Badge variant="destructive">ZOMBIE</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Sub-jobs</div>
                          <div className="font-medium">{job.sub_job_count}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Content Length</div>
                          <div className="font-medium">{job.total_content_length.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Last Heartbeat</div>
                          <div className="font-medium">
                            {job.last_heartbeat 
                              ? new Date(job.last_heartbeat).toLocaleTimeString()
                              : 'Never'
                            }
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};