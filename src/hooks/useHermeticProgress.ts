import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { hermeticQueueMonitor, HermeticJobProgress } from '@/services/hermetic-queue-monitor-service';

export interface HermeticProcessingJob {
  id: string;
  user_id: string;
  job_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  current_phase: number;
  total_phases: number;
  progress_percentage: number;
  current_step: string;
  completed_steps: string[];
  result_data?: {
    report_id: string;
    total_words: number;
    total_api_calls: number;
    quotes_generated: number;
  };
  error_message?: string;
  memory_usage_mb?: number;
  started_at?: string;
  completed_at?: string;
  last_heartbeat?: string;
  created_at: string;
  updated_at: string;
}

export interface HermeticProgressState {
  job: HermeticProcessingJob | null;
  queueProgress: HermeticJobProgress | null;
  isProcessing: boolean;
  progress: number;
  currentStep: string;
  phase: number;
  completedSteps: string[];
  error: string | null;
  isCompleted: boolean;
  hasReport: boolean;
  reportId: string | null;
  // Queue-specific fields
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  currentPhase: string;
}

export function useHermeticProgress(userId?: string) {
  const [state, setState] = useState<HermeticProgressState>({
    job: null,
    queueProgress: null,
    isProcessing: false,
    progress: 0,
    currentStep: '',
    phase: 1,
    completedSteps: [],
    error: null,
    isCompleted: false,
    hasReport: false,
    reportId: null,
    totalJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    currentPhase: '',
  });

  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!userId) return;

    try {
      // First try to get active generation job
      const { data: generationJob, error: jobError } = await supabase
        .from('generation_jobs')
        .select('*')
        .eq('user_id', userId)
        .eq('job_type', 'hermetic_report')
        .in('status', ['pending', 'running'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (jobError) {
        console.error('❌ Failed to fetch generation job:', jobError);
      }

      // Check for queue-based progress if we have a job ID
      let queueProgress: HermeticJobProgress | null = null;
      if (generationJob?.id) {
        setActiveJobId(generationJob.id);
        queueProgress = await hermeticQueueMonitor.getProgress(generationJob.id);
      } else if (activeJobId) {
        // Continue monitoring existing job
        queueProgress = await hermeticQueueMonitor.getProgress(activeJobId);
      }

      // Check if report is available
      const reportCheck = await hermeticQueueMonitor.checkReportAvailability(userId);

      // Update state based on available data
      if (queueProgress) {
        const isProcessing = queueProgress.overallStatus === 'processing' || queueProgress.overallStatus === 'pending';
        const isCompleted = queueProgress.overallStatus === 'completed';
        const hasError = queueProgress.overallStatus === 'failed';

        setState(prev => ({
          ...prev,
          job: generationJob as any,
          queueProgress,
          isProcessing,
          progress: queueProgress.progress,
          currentStep: queueProgress.currentPhase,
          phase: Math.ceil((queueProgress.completedJobs / queueProgress.totalJobs) * 4) || 1,
          completedSteps: [], // Could be derived from completed phases
          error: hasError && queueProgress.errors ? queueProgress.errors.join('; ') : null,
          isCompleted: isCompleted || reportCheck.hasReport,
          hasReport: reportCheck.hasReport,
          reportId: reportCheck.reportId || null,
          totalJobs: queueProgress.totalJobs,
          completedJobs: queueProgress.completedJobs,
          failedJobs: queueProgress.failedJobs,
          currentPhase: queueProgress.currentPhase,
        }));

        // If processing is complete or failed, stop polling
        if (isCompleted || hasError || reportCheck.hasReport) {
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
            setActiveJobId(null);
          }
        }
      } else if (reportCheck.hasReport) {
        // Report exists but no active processing
        setState(prev => ({
          ...prev,
          job: null,
          queueProgress: null,
          isProcessing: false,
          progress: 100,
          currentStep: 'Report completed',
          phase: 4,
          completedSteps: ['System translation', 'Hermetic laws', 'Gate analysis', 'Synthesis'],
          error: null,
          isCompleted: true,
          hasReport: true,
          reportId: reportCheck.reportId || null,
          totalJobs: 0,
          completedJobs: 0,
          failedJobs: 0,
          currentPhase: 'Completed',
        }));
      } else {
        // No active processing, no report
        setState(prev => ({
          ...prev,
          job: null,
          queueProgress: null,
          isProcessing: false,
          progress: 0,
          currentStep: '',
          phase: 1,
          completedSteps: [],
          error: null,
          isCompleted: false,
          hasReport: false,
          reportId: null,
          totalJobs: 0,
          completedJobs: 0,
          failedJobs: 0,
          currentPhase: '',
        }));
      }
    } catch (error) {
      console.error('❌ Error fetching hermetic progress:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
    }
  }, [userId, pollingInterval, activeJobId]);

  const startProgress = useCallback(() => {
    if (!userId || pollingInterval) return;

    console.log('🔄 Starting hermetic progress polling...');
    
    // Poll immediately
    fetchProgress();
    
    // Set up polling every 5 seconds
    const interval = setInterval(fetchProgress, 5000);
    setPollingInterval(interval);
  }, [userId, fetchProgress, pollingInterval]);

  const stopProgress = useCallback(() => {
    if (pollingInterval) {
      console.log('⏹️ Stopping hermetic progress polling...');
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [pollingInterval]);

  const resetProgress = useCallback(() => {
    setState({
      job: null,
      queueProgress: null,
      isProcessing: false,
      progress: 0,
      currentStep: '',
      phase: 1,
      completedSteps: [],
      error: null,
      isCompleted: false,
      hasReport: false,
      reportId: null,
      totalJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      currentPhase: '',
    });
    setActiveJobId(null);
    stopProgress();
  }, [stopProgress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Auto-start polling when userId changes and there's an active job
  useEffect(() => {
    if (userId && !pollingInterval && !state.isCompleted && !state.error) {
      fetchProgress();
    }
  }, [userId, pollingInterval, state.isCompleted, state.error, fetchProgress]);

  return {
    ...state,
    startProgress,
    stopProgress,
    resetProgress,
    fetchProgress,
    isPolling: !!pollingInterval,
    memoryUsage: state.job?.memory_usage_mb,
    totalPhases: state.job?.total_phases || 4,
    lastHeartbeat: state.job?.last_heartbeat,
  };
}