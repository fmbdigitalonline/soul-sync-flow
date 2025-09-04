import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { hermeticPersonalityReportService } from '@/services/hermetic-personality-report-service';

export interface HermeticReportStatus {
  hasReport: boolean;
  loading: boolean;
  error: string | null;
  isGenerating: boolean;
  progress: number;
  currentStep?: string;
}

export const useHermeticReportStatus = () => {
  const [status, setStatus] = useState<HermeticReportStatus>({
    hasReport: false,
    loading: true,
    error: null,
    isGenerating: false,
    progress: 0,
  });

  const checkHermeticReportStatus = useCallback(async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus({ hasReport: false, loading: false, error: null, isGenerating: false, progress: 0 });
        return;
      }

      // Check for completed reports
      const hasReport = await hermeticPersonalityReportService.hasHermeticReport(user.id);
      
      // Check for active jobs
      const { data: activeJobs } = await supabase
        .from('hermetic_processing_jobs')
        .select('status, progress_percentage, current_step')
        .eq('user_id', user.id)
        .in('status', ['pending', 'processing'])
        .order('created_at', { ascending: false })
        .limit(1);

      const activeJob = activeJobs?.[0];
      const isGenerating = !!activeJob;
      const progress = activeJob?.progress_percentage || 0;
      const currentStep = activeJob?.current_step || undefined;
      
      setStatus({
        hasReport,
        loading: false,
        error: null,
        isGenerating,
        progress,
        currentStep,
      });
    } catch (err) {
      console.error('Failed to check hermetic report status:', err);
      setStatus({
        hasReport: false,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to check hermetic report status',
        isGenerating: false,
        progress: 0,
      });
    }
  }, []);

  const refreshStatus = useCallback(() => {
    checkHermeticReportStatus();
  }, [checkHermeticReportStatus]);

  useEffect(() => {
    checkHermeticReportStatus();
  }, [checkHermeticReportStatus]);

  // Poll for active job updates every 5 seconds
  useEffect(() => {
    const pollForActiveJobs = setInterval(() => {
      checkHermeticReportStatus();
    }, 5000);

    return () => clearInterval(pollForActiveJobs);
  }, [checkHermeticReportStatus]);

  return {
    ...status,
    refreshStatus,
  };
};