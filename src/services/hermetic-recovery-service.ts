import { supabase } from "@/integrations/supabase/client";

interface HermeticRecoveryResponse {
  success: boolean;
  report_id?: string;
  message?: string;
  error?: string;
}

export class HermeticRecoveryService {
  async recoverHermeticReport(jobId: string): Promise<HermeticRecoveryResponse> {
    try {
      console.log(`[HermeticRecoveryService] Starting recovery for job: ${jobId}`);
      
      const { data, error } = await supabase.functions.invoke('hermetic-recovery', {
        body: { job_id: jobId }
      });

      if (error) {
        console.error(`[HermeticRecoveryService] Error invoking recovery function:`, error);
        return {
          success: false,
          error: error.message || 'Failed to invoke recovery function'
        };
      }

      console.log(`[HermeticRecoveryService] Recovery response:`, data);

      return {
        success: data?.success || false,
        report_id: data?.report_id,
        message: data?.message || 'Recovery completed',
        error: data?.error
      };

    } catch (error) {
      console.error(`[HermeticRecoveryService] Unexpected error during recovery:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during recovery'
      };
    }
  }

  async triggerRecoveryForUser(userId: string): Promise<HermeticRecoveryResponse> {
    try {
      console.log(`[HermeticRecoveryService] Finding completed jobs for user: ${userId}`);

      // Find completed hermetic jobs for this user
      const { data: jobs, error } = await supabase
        .from('hermetic_processing_jobs')
        .select('id, status, completed_at')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error(`[HermeticRecoveryService] Error finding jobs:`, error);
        return {
          success: false,
          error: 'Failed to find completed jobs'
        };
      }

      if (!jobs || jobs.length === 0) {
        console.log(`[HermeticRecoveryService] No completed jobs found for user: ${userId}`);
        return {
          success: false,
          error: 'No completed hermetic jobs found for user'
        };
      }

      const latestJob = jobs[0];
      console.log(`[HermeticRecoveryService] Triggering recovery for job: ${latestJob.id}`);

      return await this.recoverHermeticReport(latestJob.id);

    } catch (error) {
      console.error(`[HermeticRecoveryService] Unexpected error in user recovery:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during user recovery'
      };
    }
  }
}

export const hermeticRecoveryService = new HermeticRecoveryService();