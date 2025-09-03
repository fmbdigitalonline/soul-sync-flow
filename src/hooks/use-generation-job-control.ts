import { useState, useEffect, useCallback, useRef } from 'react';
import { useCoordinatedLoading } from '@/hooks/use-coordinated-loading';
import { JobControlService, GenerationJob, JOB_TYPES } from '@/services/job-control-service';
import { useAuth } from '@/contexts/AuthContext';

export type GenerationMethod = 'client' | 'background' | null;

interface JobControlState {
  generationMethod: GenerationMethod;
  activeJobId: string | null;
  currentJob: GenerationJob | null;
  jobProgress: any;
  isPolling: boolean;
  canStartGeneration: boolean;
}

/**
 * PHASE 2: Enhanced Client-Side Mutex with Job Control Integration
 * Integrates coordinated loading with database-level job control
 */
export const useGenerationJobControl = () => {
  const { user } = useAuth();
  const coordinatedLoading = useCoordinatedLoading();
  
  const [jobState, setJobState] = useState<JobControlState>({
    generationMethod: null,
    activeJobId: null,
    currentJob: null,
    jobProgress: {},
    isPolling: false,
    canStartGeneration: true,
  });
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  
  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);
  
  /**
   * JOB STATUS POLLING SYSTEM - Polls every 15 seconds
   */
  const startJobPolling = useCallback((jobId: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    console.log(`📡 Starting job polling for: ${jobId}`);
    
    const pollJob = async () => {
      if (!mountedRef.current) return;
      
      try {
        const job = await JobControlService.getJobStatus(jobId);
        
        if (!mountedRef.current || !job) {
          console.warn(`⚠️ Job ${jobId} not found - stopping polling`);
          stopJobPolling();
          return;
        }
        
        setJobState(prev => ({
          ...prev,
          currentJob: job,
          jobProgress: job.progress,
          canStartGeneration: !(job.status === 'pending' || job.status === 'running'),
        }));
        
        console.log(`📊 Job ${jobId} status: ${job.status}`, job.progress);
        
        // Stop polling if job is finished
        if (['completed', 'failed', 'cancelled'].includes(job.status)) {
          console.log(`🏁 Job ${jobId} finished with status: ${job.status}`);
          stopJobPolling();
          
          // Reset generation state
          setJobState(prev => ({
            ...prev,
            generationMethod: null,
            activeJobId: null,
            canStartGeneration: true,
          }));
        }
      } catch (error) {
        console.error('❌ Error polling job status:', error);
      }
    };
    
    // Poll immediately, then every 15 seconds
    pollJob();
    pollingIntervalRef.current = setInterval(pollJob, 15000);
    
    setJobState(prev => ({ ...prev, isPolling: true }));
  }, []);
  
  const stopJobPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setJobState(prev => ({ ...prev, isPolling: false }));
    console.log('⏹️ Job polling stopped');
  }, []);
  
  /**
   * CHECK FOR EXISTING ACTIVE JOBS ON MOUNT
   */
  const checkForExistingJobs = useCallback(async () => {
    if (!user?.id) return false;
    
    try {
      console.log('🔍 Checking for existing active generation jobs...');
      
      const activeJobs = await JobControlService.getActiveJobs();
      
      if (activeJobs.length > 0) {
        const job = activeJobs[0];
        console.log(`🔄 Found active job: ${job.id} (${job.job_type}) - ${job.status}`);
        
        setJobState(prev => ({
          ...prev,
          activeJobId: job.id,
          currentJob: job,
          generationMethod: 'background',
          jobProgress: job.progress,
          canStartGeneration: false,
        }));
        
        // Start polling for existing job
        startJobPolling(job.id);
        return true;
      }
      
      console.log('✅ No active generation jobs found');
      return false;
    } catch (error) {
      console.error('❌ Error checking for existing jobs:', error);
      return false;
    }
  }, [user?.id, startJobPolling]);
  
  /**
   * ATOMIC JOB CREATION - Prevents duplicate generations
   */
  const startGeneration = useCallback(async (
    method: GenerationMethod,
    jobType: string = JOB_TYPES.HERMETIC_REPORT,
    jobData: any = {}
  ): Promise<{ success: boolean; jobId?: string; error?: string }> => {
    
    // CLIENT-SIDE MUTEX: Block if generation already active
    const isBlocked = coordinatedLoading.isLoading || 
                      jobState.currentJob?.status === 'running' || 
                      jobState.currentJob?.status === 'pending';
    
    if (isBlocked) {
      console.log('⚠️ Generation blocked - another generation is already active');
      return { success: false, error: 'GENERATION_ALREADY_ACTIVE' };
    }
    
    // DATABASE MUTEX: Atomic job creation
    const jobResult = await JobControlService.createJob(jobType, jobData);
    
    if (!jobResult.success) {
      if (jobResult.error === 'DUPLICATE_JOB') {
        console.log('🔒 Generation blocked by database mutex');
        await checkForExistingJobs(); // Check if we missed an existing job
      }
      return jobResult;
    }
    
    const jobId = jobResult.jobId!;
    
    // Update state
    setJobState(prev => ({
      ...prev,
      generationMethod: method,
      activeJobId: jobId,
      canStartGeneration: false,
    }));
    
    console.log(`🚀 Started ${method} generation: ${jobId}`);
    
    // Start coordinated loading for client-side
    if (method === 'client') {
      coordinatedLoading.startLoading('core');
    } else if (method === 'background') {
      // Start polling for background jobs
      startJobPolling(jobId);
    }
    
    return { success: true, jobId };
  }, [coordinatedLoading, jobState.currentJob, checkForExistingJobs, startJobPolling]);
  
  /**
   * COMPLETE GENERATION - Update job status and reset state
   */
  const completeGeneration = useCallback(async (
    success: boolean,
    result?: any,
    errorMessage?: string
  ) => {
    if (!jobState.activeJobId) return false;
    
    try {
      const status = success ? 'completed' : 'failed';
      await JobControlService.updateJobStatus(jobState.activeJobId, status, result, errorMessage);
      
      // Complete coordinated loading for client-side
      if (jobState.generationMethod === 'client') {
        coordinatedLoading.completeLoading('core');
      }
      
      // Stop polling and reset state
      stopJobPolling();
      setJobState(prev => ({
        ...prev,
        generationMethod: null,
        activeJobId: null,
        currentJob: null,
        canStartGeneration: true,
      }));
      
      console.log(`✅ Generation completed: ${jobState.activeJobId} - ${status}`);
      return true;
    } catch (error) {
      console.error('❌ Error completing generation:', error);
      return false;
    }
  }, [jobState.activeJobId, jobState.generationMethod, coordinatedLoading, stopJobPolling]);
  
  /**
   * UPDATE JOB PROGRESS
   */
  const updateProgress = useCallback(async (progress: any) => {
    if (!jobState.activeJobId) return false;
    
    try {
      const success = await JobControlService.updateJobStatus(
        jobState.activeJobId,
        'running',
        progress
      );
      
      if (success) {
        setJobState(prev => ({ ...prev, jobProgress: progress }));
      }
      
      return success;
    } catch (error) {
      console.error('❌ Error updating progress:', error);
      return false;
    }
  }, [jobState.activeJobId]);
  
  // Check for existing jobs on component mount
  useEffect(() => {
    if (user?.id) {
      checkForExistingJobs();
    }
  }, [user?.id, checkForExistingJobs]);
  
  // Progress mapping for IntelligentSoulOrb integration
  const getProgressMapping = () => {
    if (!jobState.currentJob || jobState.currentJob.status !== 'running') {
      return { progress: 0, color: 'default', showCelebration: false };
    }
    
    const progress = jobState.jobProgress;
    if (!progress) return { progress: 10, color: 'purple', showCelebration: false };
    
    // Map job progress phases to percentage values (0-100) with milestone celebrations
    switch (progress.phase) {
      case 'initializing':
        return { progress: 5, color: 'purple', showCelebration: false };
      case 'system_integration':
        return { progress: 15, color: 'purple', showCelebration: false };
      case 'system_integration_complete':
        return { progress: 20, color: 'teal', showCelebration: true }; // Milestone celebration
      case 'hermetic_laws':
        return { progress: 40, color: 'purple', showCelebration: false };
      case 'hermetic_laws_complete':
        return { progress: 60, color: 'teal', showCelebration: true }; // Milestone celebration
      case 'gate_analysis':
        return { progress: 70, color: 'purple', showCelebration: false };
      case 'gate_analysis_complete':
        return { progress: 85, color: 'teal', showCelebration: true }; // Milestone celebration
      case 'intelligence_extraction':
        return { progress: 87, color: 'purple', showCelebration: false };
      case 'intelligence_analysis_complete':
        return { progress: 90, color: 'teal', showCelebration: true }; // Milestone celebration
      case 'synthesis':
        return { progress: 95, color: 'purple', showCelebration: false };
      case 'synthesis_complete':
        return { progress: 100, color: 'rainbow', showCelebration: true }; // Final rainbow celebration
      default:
        return { progress: progress.progress || 10, color: 'purple', showCelebration: false };
    }
  };

  return {
    // State
    ...jobState,
    
    // Combined loading state (client-side OR background)
    isGenerating: coordinatedLoading.isLoading || jobState.currentJob?.status === 'running',
    
    // Progress mapping for orb integration
    progressMapping: getProgressMapping(),
    
    // Methods
    startGeneration,
    completeGeneration,
    updateProgress,
    checkForExistingJobs,
    
    // Utility methods
    isGenerationBlocked: () => !jobState.canStartGeneration,
    getBlockingReason: () => {
      if (coordinatedLoading.isLoading) return 'Client-side generation in progress';
      if (jobState.currentJob?.status === 'running') return 'Background generation in progress';
      if (jobState.currentJob?.status === 'pending') return 'Generation job is pending';
      return undefined;
    },
  };
};