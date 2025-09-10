import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const checkZombieJobs = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const [processingJobId, setProcessingJobId] = useState<string | null>(null);

  const startNewHermeticGeneration = async () => {
    setIsLoading(true);
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

      // Start new hermetic generation
      const { data, error } = await supabase.functions.invoke('hermetic-job-creator', {
        body: {
          user_id: user.user.id,
          blueprint_data: blueprint.blueprint
        }
      });

      if (error) throw error;

      // Track the processing job to keep UI in loading state
      setProcessingJobId(data.job_id);

      toast({
        title: "Hermetic Generation Started",
        description: `Processing initiated with ID: ${data.job_id}. This will take 30-45 minutes.`
      });

      // Start polling for job completion
      const pollInterval = setInterval(async () => {
        const { data: job } = await supabase
          .from('hermetic_processing_jobs')
          .select('status, progress_percentage, current_step')
          .eq('id', data.job_id)
          .single();

        if (job && ['completed', 'failed'].includes(job.status)) {
          clearInterval(pollInterval);
          setProcessingJobId(null);
          setIsLoading(false);
          
          if (job.status === 'completed') {
            toast({
              title: "Hermetic Report Complete!",
              description: "Your comprehensive personality report is ready.",
            });
          } else {
            toast({
              title: "Generation Failed",
              description: "Report generation encountered an error. Please try again.",
              variant: "destructive"
            });
          }
          
          await checkZombieJobs();
        }
      }, 5000);

      // Auto-cleanup polling after 1 hour
      setTimeout(() => {
        clearInterval(pollInterval);
        if (processingJobId === data.job_id) {
          setProcessingJobId(null);
          setIsLoading(false);
        }
      }, 3600000);

    } catch (error) {
      console.error('Error starting hermetic generation:', error);
      setProcessingJobId(null);
      toast({
        title: "Generation Failed",
        description: "Failed to start hermetic generation",
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
              onClick={cleanupZombieJobs}
              disabled={cleaningUp || isLoading}
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
                  Clean Up Zombies ({jobStatuses.filter(job => job.is_zombie).length})
                </>
              )}
            </Button>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={startNewHermeticGeneration} 
              disabled={isLoading || processingJobId !== null}
              variant="default" 
              className="flex-1"
            >
              {isLoading || processingJobId ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {processingJobId ? 'Processing...' : 'Starting...'}
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