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
        console.log('🔍 HERMETIC STATUS: No authenticated user');
        setStatus({ hasReport: false, loading: false, error: null, isGenerating: false, progress: 0 });
        return;
      }

      console.log('🔍 HERMETIC STATUS: Checking status for user:', user.id);

      // Check for completed reports
      const hasReport = await hermeticPersonalityReportService.hasHermeticReport(user.id);
      console.log('📊 HERMETIC STATUS: Has existing report:', hasReport);
      
      // Check for active jobs AND completed jobs without reports (CRITICAL FIX)
      const { data: activeJobs, error: jobError } = await supabase
        .from('hermetic_processing_jobs')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'processing', 'completed'])
        .order('created_at', { ascending: false })
        .limit(5);

      console.log('🔄 HERMETIC STATUS: Active jobs query:', {
        activeJobs: activeJobs?.length || 0,
        error: jobError,
        jobs: activeJobs
      });

      // CRITICAL FIX: Handle completed jobs without reports
      let activeJob = activeJobs?.find(job => ['pending', 'processing'].includes(job.status));
      let completedJobWithoutReport = null;
      
      if (!activeJob && !hasReport) {
        // Check for completed jobs that may have failed to save report
        completedJobWithoutReport = activeJobs?.find(job => 
          job.status === 'completed' && 
          job.progress_percentage === 100 &&
          !job.current_step?.includes('Storage Error')
        );
        
        if (completedJobWithoutReport) {
          console.log('🔧 HERMETIC STATUS: Detected completed job without saved report:', completedJobWithoutReport.id);
        }
      }
      
      const isGenerating = !!activeJob || !!completedJobWithoutReport;
      const progress = activeJob?.progress_percentage || completedJobWithoutReport?.progress_percentage || 0;
      const currentStep = activeJob?.current_step || 
        (completedJobWithoutReport ? 'Report generated but not saved - please retry' : undefined);
      
      if (activeJob || completedJobWithoutReport) {
        const jobData = (activeJob || completedJobWithoutReport) as any;
        console.log('🚀 HERMETIC STATUS: Job details:', {
          jobId: jobData.id,
          status: jobData.status,
          progress: progress,
          currentStep: currentStep,
          currentStage: jobData.current_stage,
          stepIndex: jobData.current_step_index,
          lastHeartbeat: jobData.last_heartbeat,
          progressData: jobData.progress_data,
          isCompletedWithoutReport: !!completedJobWithoutReport
        });

        // Log detailed progress breakdown
        if (jobData.progress_data) {
          const pd = jobData.progress_data as any;
          console.log('📈 HERMETIC PROGRESS BREAKDOWN:', {
            systemSections: pd.system_sections?.length || 0,
            hermeticSections: pd.hermetic_sections?.length || 0,
            gateSections: pd.gate_sections?.length || 0,
            intelligenceSections: pd.intelligence_sections?.length || 0,
            totalWordCount: [
              ...(pd.system_sections || []),
              ...(pd.hermetic_sections || []),
              ...(pd.gate_sections || []),
              ...(pd.intelligence_sections || [])
            ].reduce((total, section) => {
              return total + (section.content || '').split(/\s+/).filter(word => word.length > 0).length;
            }, 0)
          });
        }
      } else {
        console.log('📊 HERMETIC STATUS: No active or problematic jobs found');
      }
      
      setStatus({
        hasReport,
        loading: false,
        error: null,
        isGenerating,
        progress,
        currentStep,
      });

      console.log('✅ HERMETIC STATUS: Final status updated:', {
        hasReport,
        isGenerating,
        progress,
        currentStep
      });

    } catch (err) {
      console.error('❌ HERMETIC STATUS ERROR:', err);
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

  // Poll for active job updates every 3 seconds with enhanced logging
  useEffect(() => {
    if (!status.isGenerating) {
      console.log('🛑 HERMETIC POLLING: Stopped - no active generation');
      return;
    }

    console.log('🔄 HERMETIC POLLING: Starting enhanced polling every 3 seconds');
    
    const pollForActiveJobs = setInterval(() => {
      console.log('⏰ HERMETIC POLLING: Fetching status update...');
      checkHermeticReportStatus();
    }, 3000);

    return () => {
      console.log('🛑 HERMETIC POLLING: Cleanup interval');
      clearInterval(pollForActiveJobs);
    };
  }, [status.isGenerating, checkHermeticReportStatus]);

  return {
    ...status,
    refreshStatus,
  };
};