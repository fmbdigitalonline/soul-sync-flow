/**
 * Hermetic Queue Monitor Service
 * Monitors progress of queue-based hermetic report generation
 * Works with the new hermetic_sub_jobs table for reliable processing
 */

import { supabase } from '@/integrations/supabase/client';

export interface HermeticSubJob {
  id: string;
  parent_job_id: string;
  phase: 'system_translation' | 'hermetic_laws' | 'gate_analysis' | 'synthesis';
  agent_type: string;
  blueprint: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result: any;
  retry_count: number;
  error_message?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  updated_at: string;
}

export interface HermeticJobProgress {
  parentJobId: string;
  overallStatus: 'pending' | 'processing' | 'completed' | 'failed';
  currentPhase: string;
  progress: number; // 0-100
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  phases: {
    system_translation: { completed: number; total: number; status: string };
    hermetic_laws: { completed: number; total: number; status: string };
    gate_analysis: { completed: number; total: number; status: string };
    synthesis: { completed: number; total: number; status: string };
  };
  estimatedCompletion?: Date;
  results?: any[];
  errors?: string[];
}

class HermeticQueueMonitorService {
  
  /**
   * Start hermetic report generation using queue-based architecture
   */
  async startHermeticGeneration(userId: string, blueprint: any, language: string = 'nl'): Promise<{
    success: boolean;
    jobId?: string;
    error?: string;
  }> {
    try {
      console.log('🚀 Starting queue-based hermetic generation...');
      
      const { data, error } = await supabase.functions.invoke('hermetic-background-processor', {
        body: {
          userId,
          blueprint,
          language,
          blueprintUserMeta: true,
          blueprintSystems: {
            mbti: true,
            astrology: true,
            numerology: true,
            humanDesign: true,
            chinese: true
          }
        }
      });
      
      if (error) {
        console.error('❌ Failed to start hermetic generation:', error);
        return { success: false, error: error.message };
      }
      
      console.log('✅ Hermetic generation started with job ID:', data?.jobId);
      return { success: true, jobId: data?.jobId };
      
    } catch (error) {
      console.error('❌ Error starting hermetic generation:', error);
      return { success: false, error: String(error) };
    }
  }
  
  /**
   * Monitor progress of hermetic generation
   */
  async getProgress(parentJobId: string): Promise<HermeticJobProgress | null> {
    try {
      // For now, use the generation_jobs table to track overall progress
      // The actual sub-jobs are managed by the background processor
      const { data: generationJob, error } = await supabase
        .from('generation_jobs')
        .select('*')
        .eq('id', parentJobId)
        .maybeSingle();
      
      if (error) {
        console.error('❌ Failed to fetch generation job:', error);
        return null;
      }
      
      if (!generationJob) {
        console.log('📋 No generation job found:', parentJobId);
        return null;
      }
      
      // Extract progress from job data
      const jobProgress = generationJob.progress as any || {};
      const progress = jobProgress.progress_percentage || 0;
      const currentPhase = jobProgress.current_step || 'Initializing';
      
      // Simulate phase breakdown based on progress
      const totalJobs = 4; // Estimated: system_translation, hermetic_laws, gate_analysis, synthesis
      const completedJobs = Math.floor((progress / 100) * totalJobs);
      const failedJobs = generationJob.status === 'failed' ? 1 : 0;
      
      // Create phase status based on progress
      const phases = {
        system_translation: { completed: completedJobs > 0 ? 1 : 0, total: 1, status: completedJobs > 0 ? 'completed' : 'pending' },
        hermetic_laws: { completed: completedJobs > 1 ? 1 : 0, total: 1, status: completedJobs > 1 ? 'completed' : completedJobs === 1 ? 'processing' : 'pending' },
        gate_analysis: { completed: completedJobs > 2 ? 1 : 0, total: 1, status: completedJobs > 2 ? 'completed' : completedJobs === 2 ? 'processing' : 'pending' },
        synthesis: { completed: completedJobs > 3 ? 1 : 0, total: 1, status: completedJobs > 3 ? 'completed' : completedJobs === 3 ? 'processing' : 'pending' }
      };
      
      // Determine overall status
      let overallStatus: 'pending' | 'processing' | 'completed' | 'failed';
      if (generationJob.status === 'failed') {
        overallStatus = 'failed';
      } else if (generationJob.status === 'completed') {
        overallStatus = 'completed';
      } else if (generationJob.status === 'running') {
        overallStatus = 'processing';
      } else {
        overallStatus = 'pending';
      }
      
      console.log(`📊 Queue progress: ${progress}% - ${currentPhase}`);
      
      return {
        parentJobId,
        overallStatus,
        currentPhase,
        progress,
        totalJobs,
        completedJobs,
        failedJobs,
        phases,
        results: generationJob.result ? [generationJob.result] : [],
        errors: generationJob.error_message ? [generationJob.error_message] : undefined
      };
      
    } catch (error) {
      console.error('❌ Error fetching queue progress:', error);
      return null;
    }
  }
  
  /**
   * Check if hermetic report is available
   */
  async checkReportAvailability(userId: string): Promise<{
    hasReport: boolean;
    reportId?: string;
    error?: string;
  }> {
    try {
      // Use personality_reports table (existing table)
      const { data, error } = await supabase
        .from('personality_reports')
        .select('id')
        .eq('user_id', userId)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        return { hasReport: false, error: error.message };
      }
      
      return {
        hasReport: !!data,
        reportId: data?.id
      };
      
    } catch (error) {
      return { hasReport: false, error: String(error) };
    }
  }
  
  private getPhaseStats(subJobs: any[], phase: string) {
    const phaseJobs = subJobs.filter(j => j.phase === phase);
    const completed = phaseJobs.filter(j => j.status === 'completed').length;
    const total = phaseJobs.length;
    const processing = phaseJobs.filter(j => j.status === 'processing').length;
    const failed = phaseJobs.filter(j => j.status === 'failed').length;
    
    let status = 'pending';
    if (failed > 0 && completed === 0) {
      status = 'failed';
    } else if (completed === total && total > 0) {
      status = 'completed';
    } else if (processing > 0 || completed > 0) {
      status = 'processing';
    }
    
    return { completed, total, status };
  }
  
  private determineCurrentPhase(subJobs: any[]): string {
    // Find the most advanced phase that's still in progress
    const phases = ['system_translation', 'hermetic_laws', 'gate_analysis', 'synthesis'];
    
    for (const phase of phases.reverse()) {
      const phaseJobs = subJobs.filter(j => j.phase === phase);
      const hasProcessing = phaseJobs.some(j => j.status === 'processing');
      const hasCompleted = phaseJobs.some(j => j.status === 'completed');
      
      if (hasProcessing) {
        return `Processing ${phase.replace('_', ' ')}`;
      } else if (hasCompleted) {
        return `Completed ${phase.replace('_', ' ')}`;
      }
    }
    
    return 'Initializing queue';
  }
}

export const hermeticQueueMonitor = new HermeticQueueMonitorService();