import { supabase } from '@/integrations/supabase/client';

export interface GenerationJob {
  id: string;
  user_id: string;
  job_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  job_data: any;
  progress: any;
  result?: any;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export class JobControlService {
  /**
   * ATOMIC JOB CREATION - Prevents duplicate generations
   * Uses database-level unique constraint for distributed locking
   */
  static async createJob(
    jobType: string,
    jobData: any = {},
    timeoutHours: number = 2
  ): Promise<{ success: boolean; jobId?: string; error?: string }> {
    try {
      console.log(`🔒 Attempting to create ${jobType} job with atomic locking...`);
      
      const { data, error } = await supabase.rpc('create_generation_job', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_job_type: jobType,
        p_job_data: jobData,
        p_timeout_hours: timeoutHours
      });

      if (error) {
        if (error.message.includes('already in progress')) {
          console.log(`⚠️ ${jobType} job already running - blocked by database mutex`);
          return { success: false, error: 'DUPLICATE_JOB' };
        }
        throw error;
      }

      console.log(`✅ Created ${jobType} job: ${data}`);
      return { success: true, jobId: data };

    } catch (error: any) {
      console.error('❌ Failed to create job:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * CHECK FOR EXISTING ACTIVE JOBS
   * Returns any pending or running jobs for the user
   */
  static async getActiveJobs(jobType?: string): Promise<GenerationJob[]> {
    try {
      let query = supabase
        .from('generation_jobs')
        .select('*')
        .in('status', ['pending', 'running'])
        .order('created_at', { ascending: false });

      if (jobType) {
        query = query.eq('job_type', jobType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as GenerationJob[];

    } catch (error) {
      console.error('❌ Failed to get active jobs:', error);
      return [];
    }
  }

  /**
   * UPDATE JOB STATUS WITH PROGRESS
   * Safely updates job status and progress information
   */
  static async updateJobStatus(
    jobId: string,
    status: GenerationJob['status'],
    progress?: any,
    errorMessage?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('update_job_status', {
        p_job_id: jobId,
        p_status: status,
        p_progress: progress,
        p_error_message: errorMessage
      });

      if (error) throw error;
      
      console.log(`📊 Updated job ${jobId} status to: ${status}`);
      return data === true;

    } catch (error) {
      console.error('❌ Failed to update job status:', error);
      return false;
    }
  }

  /**
   * GET JOB STATUS AND PROGRESS
   * Polls current job state for UI updates
   */
  static async getJobStatus(jobId: string): Promise<GenerationJob | null> {
    try {
      const { data, error } = await supabase
        .from('generation_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;
      return data as GenerationJob;

    } catch (error) {
      console.error('❌ Failed to get job status:', error);
      return null;
    }
  }

  /**
   * CANCEL ACTIVE JOB
   * Safely cancels a running job
   */
  static async cancelJob(jobId: string): Promise<boolean> {
    try {
      return await this.updateJobStatus(jobId, 'cancelled');
    } catch (error) {
      console.error('❌ Failed to cancel job:', error);
      return false;
    }
  }

  /**
   * CLEANUP EXPIRED JOBS
   * Removes stale job locks (can be called periodically)
   */
  static async cleanupExpiredJobs(): Promise<void> {
    try {
      const { error } = await supabase.rpc('cleanup_expired_generation_jobs');
      if (error) throw error;
      console.log('🧹 Cleaned up expired generation jobs');
    } catch (error) {
      console.error('❌ Failed to cleanup expired jobs:', error);
    }
  }

  /**
   * FORCE CLEANUP SPECIFIC JOB
   * Manually cleanup a specific stuck job (immediate recovery)
   */
  static async forceCleanupJob(jobId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`🔧 Force cleaning up job: ${jobId}`);
      
      // First check if job exists and get its current state
      const { data: job, error: fetchError } = await supabase
        .from('generation_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (fetchError || !job) {
        return { success: false, error: `Job ${jobId} not found: ${fetchError?.message}` };
      }

      // Force update to failed status with cleanup reason
      const { error: updateError } = await supabase
        .from('generation_jobs')
        .update({
          status: 'failed',
          error_message: 'Job force-cleaned due to stuck state',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (updateError) {
        return { success: false, error: `Failed to cleanup job: ${updateError.message}` };
      }

      console.log(`✅ Force cleaned job ${jobId} - was ${job.status}`);
      return { success: true };

    } catch (error: any) {
      console.error('❌ Force cleanup failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * COMPREHENSIVE JOB RECOVERY
   * Detects and recovers stuck jobs automatically
   */
  static async recoverStuckJobs(): Promise<{ recovered: number; errors: string[] }> {
    try {
      console.log('🔍 Scanning for stuck generation jobs...');
      
      const { data: stuckJobs, error } = await supabase
        .from('generation_jobs')
        .select('*')
        .in('status', ['pending', 'running'])
        .lt('expires_at', new Date().toISOString());

      if (error) throw error;

      const errors: string[] = [];
      let recovered = 0;

      for (const job of stuckJobs || []) {
        console.log(`🚨 Found stuck job: ${job.id} (${job.status}) - expired ${job.expires_at}`);
        
        const result = await this.forceCleanupJob(job.id);
        if (result.success) {
          recovered++;
        } else {
          errors.push(`Failed to recover ${job.id}: ${result.error}`);
        }
      }

      console.log(`🔧 Recovery complete: ${recovered} jobs recovered, ${errors.length} errors`);
      return { recovered, errors };

    } catch (error: any) {
      console.error('❌ Job recovery failed:', error);
      return { recovered: 0, errors: [error.message] };
    }
  }

  /**
   * GET JOB HEALTH STATUS
   * Comprehensive job system health check
   */
  static async getJobSystemHealth(): Promise<{
    healthy: boolean;
    activeJobs: number;
    stuckJobs: number;
    errors: string[];
    recommendations: string[];
  }> {
    try {
      const errors: string[] = [];
      const recommendations: string[] = [];

      // Count active jobs
      const activeJobs = await this.getActiveJobs();
      const activeCount = activeJobs.length;

      // Check for stuck jobs (expired but still pending/running)
      const { data: stuckJobs, error: stuckError } = await supabase
        .from('generation_jobs')
        .select('id, status, created_at, expires_at')
        .in('status', ['pending', 'running'])
        .lt('expires_at', new Date().toISOString());

      if (stuckError) {
        errors.push(`Failed to check stuck jobs: ${stuckError.message}`);
      }

      const stuckCount = stuckJobs?.length || 0;

      // Generate recommendations
      if (stuckCount > 0) {
        recommendations.push(`Run job recovery to clean up ${stuckCount} stuck jobs`);
      }
      
      if (activeCount > 3) {
        recommendations.push('High number of active jobs detected - consider rate limiting');
      }

      const healthy = errors.length === 0 && stuckCount === 0;

      return {
        healthy,
        activeJobs: activeCount,
        stuckJobs: stuckCount,
        errors,
        recommendations
      };

    } catch (error: any) {
      return {
        healthy: false,
        activeJobs: 0,
        stuckJobs: 0,
        errors: [error.message],
        recommendations: ['System health check failed - investigate database connectivity']
      };
    }
  }

  /**
   * CHECK IF GENERATION IS ALLOWED
   * Returns false if any generation is already running
   */
  static async isGenerationAllowed(jobType: string = 'hermetic_report'): Promise<{
    allowed: boolean;
    activeJob?: GenerationJob;
    reason?: string;
  }> {
    try {
      const activeJobs = await this.getActiveJobs(jobType);
      
      if (activeJobs.length > 0) {
        return {
          allowed: false,
          activeJob: activeJobs[0],
          reason: `${jobType} generation already in progress`
        };
      }

      return { allowed: true };

    } catch (error) {
      console.error('❌ Failed to check generation status:', error);
      return { allowed: false, reason: 'Failed to check job status' };
    }
  }
}

// Job type constants
export const JOB_TYPES = {
  HERMETIC_REPORT: 'hermetic_report',
  INTELLIGENCE_ANALYSIS: 'intelligence_analysis',
  BLUEPRINT_PROCESSING: 'blueprint_processing',
} as const;