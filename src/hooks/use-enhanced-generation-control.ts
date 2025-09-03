import { useState, useEffect, useCallback, useRef } from 'react';
import { useCoordinatedLoading } from '@/hooks/use-coordinated-loading';
import { JobControlService, GenerationJob, JOB_TYPES } from '@/services/job-control-service';
import { useAuth } from '@/contexts/AuthContext';

export type GenerationMethod = 'client' | 'background' | null;
export type GenerationJobType = keyof typeof JOB_TYPES;

interface GenerationControlState {
  // Enhanced state management
  generationMethod: GenerationMethod;
  activeJobId: string | null;
  currentJob: GenerationJob | null;
  
  // Job status and progress
  jobProgress: any;
  jobStatus: GenerationJob['status'] | null;
  
  // UI blocking state
  isAnyGenerationActive: boolean;
  canStartGeneration: boolean;
  blockingReason?: string;
  
  // Polling state
  isPolling: boolean;
  lastPolledAt?: Date;
}

/**
 * Enhanced generation control hook that integrates coordinated loading with job control
 * PHASE 2: Client-Side Mutex with Job Polling System
 */
export const useEnhancedGenerationControl = () => {
  const { user } = useAuth();
  const coordinatedLoading = useCoordinatedLoading();
  
  // Enhanced state management
  const [state, setState] = useState<GenerationControlState>({
    generationMethod: null,
    activeJobId: null,
    currentJob: null,
    jobProgress: {},
    jobStatus: null,
    isAnyGenerationActive: false,
    canStartGeneration: true,
    isPolling: false,
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
   * JOB STATUS POLLING SYSTEM
   * Polls every 15 seconds when active job exists
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
        
        if (!mountedRef.current) return;
        
        if (job) {
          setState(prev => ({
            ...prev,
            currentJob: job,
            jobStatus: job.status,
            jobProgress: job.progress,
            lastPolledAt: new Date(),
            isAnyGenerationActive: job.status === 'pending' || job.status === 'running',
            canStartGeneration: !(job.status === 'pending' || job.status === 'running'),
          }));
          
          console.log(`📊 Job ${jobId} status: ${job.status}`, job.progress);
          
          // Stop polling if job is completed/failed/cancelled
          if (['completed', 'failed', 'cancelled'].includes(job.status)) {
            console.log(`🏁 Job ${jobId} finished with status: ${job.status}`);
            stopJobPolling();
            
            // Trigger final state update
            setState(prev => ({
              ...prev,
              generationMethod: null,
              activeJobId: null,
              isAnyGenerationActive: false,
              canStartGeneration: true,
              blockingReason: undefined,
            }));
          }
        } else {
          console.warn(`⚠️ Job ${jobId} not found - stopping polling`);
          stopJobPolling();
        }
      } catch (error) {
        console.error('❌ Error polling job status:', error);
        // Continue polling despite errors (network issues, etc.)
      }
    };
    
    // Poll immediately, then every 15 seconds
    pollJob();
    pollingIntervalRef.current = setInterval(pollJob, 15000);
    
    setState(prev => ({ ...prev, isPolling: true }));
  }, []);
  
  const stopJobPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setState(prev => ({ ...prev, isPolling: false }));
    console.log('⏹️ Job polling stopped');
  }, []);
  
  /**
   * CHECK FOR EXISTING ACTIVE JOBS
   * Automatically detects and resumes tracking of active background jobs
   */
  const checkForExistingJobs = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      console.log('🔍 Checking for existing active generation jobs...');
      
      const activeJobs = await JobControlService.getActiveJobs();
      
      if (activeJobs.length > 0) {
        const job = activeJobs[0]; // Take the first active job
        console.log(`🔄 Found active job: ${job.id} (${job.job_type}) - ${job.status}`);
        
        setState(prev => ({
          ...prev,
          activeJobId: job.id,
          currentJob: job,
          generationMethod: 'background',
          jobStatus: job.status,
          jobProgress: job.progress,
          isAnyGenerationActive: true,
          canStartGeneration: false,
          blockingReason: `${job.job_type} generation already in progress`,
        }));
        
        // Start polling for this existing job
        startJobPolling(job.id);
        
        return true; // Found active job
      } else {
        console.log('✅ No active generation jobs found');
        return false; // No active jobs
      }
    } catch (error) {
      console.error('❌ Error checking for existing jobs:', error);
      return false;
    }
  }, [user?.id, startJobPolling]);
  
  /**
   * ATOMIC JOB CREATION WITH CLIENT-SIDE MUTEX
   * Prevents duplicate generations at both client and database level
   */
  const startGeneration = useCallback(async (
    method: 'client' | 'background',
    jobType: string = JOB_TYPES.HERMETIC_REPORT,
    jobData: any = {}
  ): Promise<{ success: boolean; jobId?: string; error?: string }> => {
    
    // CLIENT-SIDE MUTEX: Block if any generation already active
    if (state.isAnyGenerationActive) {
      console.log('⚠️ Generation blocked - another generation is already active');
      return {
        success: false,
        error: 'GENERATION_ALREADY_ACTIVE'
      };
    }
    
    // CLEANUP: Check for expired jobs first
    await JobControlService.cleanupExpiredJobs();
    
    // DATABASE MUTEX: Atomic job creation
    const jobResult = await JobControlService.createJob(jobType, jobData);
    
    if (!jobResult.success) {
      if (jobResult.error === 'DUPLICATE_JOB') {
        console.log('🔒 Generation blocked by database mutex - duplicate job detected');
        // Check if we missed an existing job and start tracking it
        await checkForExistingJobs();
      }
      return jobResult;
    }
    
    const jobId = jobResult.jobId!;
    
    // Update state to reflect active generation
    setState(prev => ({
      ...prev,
      generationMethod: method,
      activeJobId: jobId,
      isAnyGenerationActive: true,
      canStartGeneration: false,
      blockingReason: `${jobType} generation in progress`,
      jobStatus: 'pending',
    }));
    
    console.log(`🚀 Started ${method} generation: ${jobId}`);
    
    // Start coordinated loading if client-side
    if (method === 'client') {
      coordinatedLoading.startLoading('core');
    }
    
    // Start job polling for background jobs
    if (method === 'background') {
      startJobPolling(jobId);
    }
    
    return { success: true, jobId };
    
  }, [state.isAnyGenerationActive, coordinatedLoading, startJobPolling, checkForExistingJobs]);
  
  /**
   * COMPLETE GENERATION
   * Safely completes generation and updates state
   */
  const completeGeneration = useCallback(async (
    jobId: string,
    success: boolean,
    result?: any,
    errorMessage?: string
  ) => {
    try {
      // Update job status in database
      const status = success ? 'completed' : 'failed';
      await JobControlService.updateJobStatus(jobId, status, result, errorMessage);
      
      // Complete coordinated loading if client-side
      if (state.generationMethod === 'client') {
        coordinatedLoading.completeLoading('core');
      }
      
      // Stop polling and reset state
      stopJobPolling();
      setState(prev => ({
        ...prev,
        generationMethod: null,
        activeJobId: null,
        currentJob: null,
        isAnyGenerationActive: false,
        canStartGeneration: true,
        blockingReason: undefined,
        jobStatus: status,
      }));
      
      console.log(`✅ Generation completed: ${jobId} - ${status}`);
      
    } catch (error) {
      console.error('❌ Error completing generation:', error);
    }
  }, [state.generationMethod, coordinatedLoading, stopJobPolling]);
  
  /**
   * CANCEL ACTIVE GENERATION
   * Safely cancels active generation
   */
  const cancelGeneration = useCallback(async () => {
    if (!state.activeJobId) return false;
    
    try {
      const success = await JobControlService.cancelJob(state.activeJobId);
      
      if (success) {
        // Complete coordinated loading if client-side
        if (state.generationMethod === 'client') {
          coordinatedLoading.completeLoading('core');
        }
        
        // Stop polling and reset state
        stopJobPolling();
        setState(prev => ({
          ...prev,
          generationMethod: null,
          activeJobId: null,
          currentJob: null,
          isAnyGenerationActive: false,
          canStartGeneration: true,
          blockingReason: undefined,
          jobStatus: 'cancelled',
        }));
        
        console.log(`🚫 Generation cancelled: ${state.activeJobId}`);
      }
      
      return success;
    } catch (error) {
      console.error('❌ Error cancelling generation:', error);
      return false;
    }
  }, [state.activeJobId, state.generationMethod, coordinatedLoading, stopJobPolling]);
  
  /**
   * UPDATE JOB PROGRESS
   * Updates progress for active jobs
   */
  const updateProgress = useCallback(async (progress: any) => {
    if (!state.activeJobId) return false;
    
    try {
      const success = await JobControlService.updateJobStatus(
        state.activeJobId,
        'running',
        progress
      );
      
      if (success) {
        setState(prev => ({ ...prev, jobProgress: progress }));
      }
      
      return success;
    } catch (error) {
      console.error('❌ Error updating progress:', error);
      return false;
    }
  }, [state.activeJobId]);
  
  // Check for existing jobs on component mount
  useEffect(() => {
    if (user?.id) {
      checkForExistingJobs();
    }
  }, [user?.id, checkForExistingJobs]);
  
  return {
    // Enhanced state
    ...state,
    
    // Coordinated loading integration
    coordinatedLoading: coordinatedLoading.isLoading,
    loadingState: coordinatedLoading.loadingState,
    
    // Job control methods
    startGeneration,
    completeGeneration,
    cancelGeneration,
    updateProgress,
    
    // Polling control
    startJobPolling,
    stopJobPolling,
    checkForExistingJobs,
    
    // Utility methods
    isGenerationBlocked: () => state.isAnyGenerationActive,
    getBlockingReason: () => state.blockingReason,
    hasActiveJob: () => !!state.activeJobId,
  };
};