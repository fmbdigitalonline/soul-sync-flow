import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  isProcessing: boolean;
  progress: number;
  currentStep: string;
  phase: number;
  completedSteps: string[];
  error: string | null;
  isCompleted: boolean;
  hasReport: boolean;
  reportId: string | null;
}

export function useHermeticProgress(userId?: string) {
  const [state, setState] = useState<HermeticProgressState>({
    job: null,
    isProcessing: false,
    progress: 0,
    currentStep: '',
    phase: 1,
    completedSteps: [],
    error: null,
    isCompleted: false,
    hasReport: false,
    reportId: null,
  });

  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('hermetic_processing_jobs')
        .select('*')
        .eq('user_id', userId)
        .eq('job_type', 'hermetic_report')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Failed to fetch hermetic progress:', error);
        setState(prev => ({ ...prev, error: error.message }));
        return;
      }

      if (data) {
        const job = data as HermeticProcessingJob;
        const isProcessing = job.status === 'processing' || job.status === 'pending';
        const isCompleted = job.status === 'completed';
        const hasError = job.status === 'failed';

        setState(prev => ({
          ...prev,
          job,
          isProcessing,
          progress: job.progress_percentage || 0,
          currentStep: job.current_step || '',
          phase: job.current_phase || 1,
          completedSteps: job.completed_steps || [],
          error: hasError ? job.error_message || 'Processing failed' : null,
          isCompleted,
          hasReport: isCompleted && !!job.result_data?.report_id,
          reportId: job.result_data?.report_id || null,
        }));

        // If processing is complete or failed, stop polling
        if (isCompleted || hasError) {
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        }
      } else {
        // No job found, reset state
        setState(prev => ({
          ...prev,
          job: null,
          isProcessing: false,
          progress: 0,
          currentStep: '',
          phase: 1,
          completedSteps: [],
          error: null,
          isCompleted: false,
          hasReport: false,
          reportId: null,
        }));
      }
    } catch (error) {
      console.error('❌ Error fetching hermetic progress:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
    }
  }, [userId, pollingInterval]);

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
      isProcessing: false,
      progress: 0,
      currentStep: '',
      phase: 1,
      completedSteps: [],
      error: null,
      isCompleted: false,
      hasReport: false,
      reportId: null,
    });
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