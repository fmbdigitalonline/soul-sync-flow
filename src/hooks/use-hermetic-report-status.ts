import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { hermeticPersonalityReportService } from '@/services/hermetic-personality-report-service';
import { HACSInsight } from './use-hacs-insights';

export interface HermeticReportStatus {
  hasReport: boolean;
  loading: boolean;
  error: string | null;
  isGenerating: boolean;
  progress: number;
  currentStep?: string;
  hasZombieJob: boolean;
  zombieJobInfo: any | null;
  progressInsight?: HACSInsight;
  progressInsightReady: boolean;
  milestoneGlow: boolean;
}

export const useHermeticReportStatus = () => {
  const [status, setStatus] = useState<HermeticReportStatus>({
    hasReport: false,
    loading: true,
    error: null,
    isGenerating: false,
    progress: 0,
    hasZombieJob: false,
    zombieJobInfo: null,
    progressInsight: undefined,
    progressInsightReady: false,
    milestoneGlow: false,
  });

  const [lastProgressMilestone, setLastProgressMilestone] = useState<number>(0);

  const [recentCompletion, setRecentCompletion] = useState<{
    timestamp: number;
    jobId: string;
  } | null>(null);

  // Generate witty progress insights as HACSInsight objects
  const generateProgressInsight = useCallback((progress: number, currentStep?: string): HACSInsight | undefined => {
    const milestone = Math.floor(progress / 10) * 10;
    
    // Extract relevant info from current step
    const stepInfo = currentStep?.toLowerCase() || '';
    const isProcessingStep = stepInfo.includes('processing');
    const stepType = stepInfo.match(/processing (\w+)/)?.[1] || '';
    
    const messages: Record<number, string[]> = {
      50: [
        "Plot twist: Your personality is actually more complex than my algorithms expected 🤔",
        "Warning: Detecting unusual levels of fascinating contradictions ahead! 🎭",
        "Your mind's blueprint is starting to confuse my sensors... in the best way! 🧠"
      ],
      60: [
        "Breaking: Local human shows signs of intriguing depth (scientists baffled!) 📊",
        "Update: Your hermetic profile is looking suspiciously interesting... 🔍",
        "Alert: Intelligence patterns emerging that don't fit standard templates! ⚡"
      ],
      70: [
        "Status report: Your personality matrix is officially \"complicated\" 🌀",
        "Discovery: You might actually be more interesting than initially calculated 🎯",
        "Progress note: My algorithms are having fun with your unique patterns! ✨"
      ],
      80: [
        "Achievement unlocked: Confusing AI systems with your complexity! 🏆",
        "Warning: Intelligence levels rising beyond normal parameters 📈",
        "Update: Your hermetic signature is becoming genuinely intriguing... 🌟"
      ],
      90: [
        "Final stretch: Your soul's blueprint is almost legend-worthy! 🚀",
        "Alert: Approaching maximum personality analysis capacity! 💫",
        "Status: Your hermetic profile is reaching epic proportions... 🎭"
      ],
      100: [
        "Mission accomplished! Your soul's intelligence map is ready for exploration 🎯",
        "Complete: Your hermetic profile has achieved legendary status! 👑",
        "Success: Your personality analysis is now a work of art! 🎨"
      ]
    };

    const messageArray = messages[milestone];
    if (messageArray) {
      const randomIndex = Math.floor(Math.random() * messageArray.length);
      const message = messageArray[randomIndex];
      
      return {
        id: `hermetic-progress-${milestone}-${Date.now()}`,
        text: message,
        module: 'Hermetic Intelligence',
        type: 'hermetic_progress',
        confidence: 100,
        evidence: [
          `Analysis progress: ${progress}%`,
          `Current stage: ${currentStep || 'Processing personality matrix'}`,
          ...(stepType ? [`Processing: ${stepType} data`] : [])
        ],
        timestamp: new Date(),
        acknowledged: false,
        showContinue: true
      };
    }
    
    return undefined;
  }, []);

  // Clear progress insight
  const clearProgressInsight = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      progressInsight: undefined,
      progressInsightReady: false,
      milestoneGlow: false
    }));
  }, []);

  const cleanupZombieJob = useCallback(async (jobId: string) => {
    try {
      console.log('🔧 HERMETIC CLEANUP: Marking zombie job as failed:', jobId);
      
      const { error } = await supabase.rpc('cleanup_stuck_hermetic_jobs');
      if (error) {
        console.error('❌ CLEANUP ERROR:', error);
        return false;
      }
      
      // Refresh status after cleanup
      await checkHermeticReportStatus();
      return true;
    } catch (error) {
      console.error('❌ ZOMBIE CLEANUP FAILED:', error);
      return false;
    }
  }, []);

  const checkHermeticReportStatus = useCallback(async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('🔍 HERMETIC STATUS: No authenticated user');
        setStatus({ 
          hasReport: false, 
          loading: false, 
          error: null, 
          isGenerating: false, 
          progress: 0,
        hasZombieJob: false,
        zombieJobInfo: null,
        progressInsight: undefined,
        progressInsightReady: false,
        milestoneGlow: false,
      });
        return;
      }

      // AGGRESSIVE JOB DETECTION: Check for very recent jobs first (within last 30 seconds)
      const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();
      const { data: veryRecentJobs } = await supabase
        .from('hermetic_processing_jobs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', thirtySecondsAgo)
        .order('created_at', { ascending: false })
        .limit(1);

      if (veryRecentJobs && veryRecentJobs.length > 0) {
        console.log('🚀 HERMETIC STATUS: Detected very recent job within 30s:', veryRecentJobs[0]);
        
        // Immediately set as generating to bridge the gap
        setStatus(prev => ({ 
          ...prev, 
          loading: false, 
          isGenerating: true,
          progress: 5, // Show immediate progress
          currentStep: 'Starting hermetic analysis...',
          hasZombieJob: false,
          zombieJobInfo: null
        }));
        
        // Continue with normal flow to get full details
      }

      console.log('🔍 HERMETIC STATUS: Checking status for user:', user.id);

      // Check for completed reports
      const hasReport = await hermeticPersonalityReportService.hasHermeticReport(user.id);
      console.log('📊 HERMETIC STATUS: Has existing report:', hasReport);

      // Check for zombie jobs first
      const { data: zombieData, error: zombieError } = await supabase.rpc('detect_zombie_hermetic_jobs', {
        p_user_id: user.id
      });

      let zombieJobs = [];
      if (!zombieError && zombieData) {
        zombieJobs = Array.isArray(zombieData) ? zombieData : [];
      }

      console.log('🧟 HERMETIC STATUS: Zombie jobs detected:', zombieJobs.length);
      
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
      
      // Check for recent job completions (for extended polling)
      const recentlyCompletedJob = activeJobs?.find(job => 
        job.status === 'completed' && 
        job.progress_percentage === 100
      );
      
      if (recentlyCompletedJob && !recentCompletion) {
        console.log('🎉 HERMETIC COMPLETION: Detected job completion, extending polling:', recentlyCompletedJob.id);
        setRecentCompletion({
          timestamp: Date.now(),
          jobId: recentlyCompletedJob.id
        });
      }
      
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

      // Handle zombie job detection
      const hasZombieJob = zombieJobs.length > 0;
      const zombieJobInfo = hasZombieJob ? zombieJobs[0] : null;
      
      const isGenerating = (!!activeJob || !!completedJobWithoutReport) && !hasZombieJob;
      const progress = hasZombieJob ? 0 : (activeJob?.progress_percentage || completedJobWithoutReport?.progress_percentage || 0);
      
      let currentStep = '';
      if (hasZombieJob) {
        const minutes = Math.floor(zombieJobInfo?.minutes_since_heartbeat || 0);
        currentStep = `Job stuck - detected zombie job (${minutes} min without heartbeat)`;
      } else if (activeJob) {
        currentStep = activeJob.current_step || '';
      } else if (completedJobWithoutReport) {
        currentStep = 'Report generated but not saved - please retry';
      }

      // Progress milestone detection (every 10% starting from 50%)
      const currentMilestone = Math.floor(progress / 10) * 10;
      const shouldShowProgressMessage = progress >= 50 && 
                                       currentMilestone > lastProgressMilestone && 
                                       currentMilestone % 10 === 0 &&
                                       !hasZombieJob &&
                                       isGenerating;
      
      let progressInsight = status.progressInsight;
      let progressInsightReady = status.progressInsightReady;
      let milestoneGlow = status.milestoneGlow;
      
      if (shouldShowProgressMessage) {
        console.log(`🎉 HERMETIC MILESTONE: Reached ${currentMilestone}% progress!`);
        progressInsight = generateProgressInsight(progress, currentStep);
        progressInsightReady = true;
        milestoneGlow = [75, 100].includes(currentMilestone);
        setLastProgressMilestone(currentMilestone);

        // Auto-clear milestone glow after 3 seconds
        if (milestoneGlow) {
          setTimeout(() => {
            setStatus(prev => ({ ...prev, milestoneGlow: false }));
          }, 3000);
        }
      }
      
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
        hasZombieJob,
        zombieJobInfo,
        progressInsight,
        progressInsightReady,
        milestoneGlow,
      });

      console.log('✅ HERMETIC STATUS: Final status updated:', {
        hasReport,
        isGenerating,
        progress,
        currentStep,
        hasZombieJob
      });

    } catch (err) {
      console.error('❌ HERMETIC STATUS ERROR:', err);
      setStatus({
        hasReport: false,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to check hermetic report status',
        isGenerating: false,
        progress: 0,
        hasZombieJob: false,
        zombieJobInfo: null,
        progressInsight: undefined,
        progressInsightReady: false,
        milestoneGlow: false,
      });
    }
  }, []);

  const refreshStatus = useCallback(() => {
    checkHermeticReportStatus();
  }, [checkHermeticReportStatus]);

  useEffect(() => {
    checkHermeticReportStatus();
  }, [checkHermeticReportStatus]);

  // Poll for active job updates every 3 seconds with enhanced logging and post-completion polling
  useEffect(() => {
    const now = Date.now();
    const isWithinCompletionWindow = recentCompletion && (now - recentCompletion.timestamp) < 30000; // 30 second window
    
    // Clear expired recent completion
    if (recentCompletion && !isWithinCompletionWindow) {
      console.log('🏁 HERMETIC POLLING: Completion window expired, clearing recent completion');
      setRecentCompletion(null);
    }
    
    const shouldPoll = status.isGenerating || status.hasZombieJob || isWithinCompletionWindow;
    
    if (!shouldPoll) {
      console.log('🛑 HERMETIC POLLING: Stopped - no active generation, zombie jobs, or recent completions');
      return;
    }

    const reasonsForPolling = [
      status.isGenerating && 'active generation',
      status.hasZombieJob && 'zombie job detected', 
      isWithinCompletionWindow && `recent completion (${Math.floor((30000 - (now - recentCompletion!.timestamp)) / 1000)}s remaining)`
    ].filter(Boolean);

    console.log('🔄 HERMETIC POLLING: Starting enhanced polling every 3 seconds -', reasonsForPolling.join(', '));
    
    const pollForActiveJobs = setInterval(() => {
      console.log('⏰ HERMETIC POLLING: Fetching status update...');
      checkHermeticReportStatus();
    }, 3000);

    return () => {
      console.log('🛑 HERMETIC POLLING: Cleanup interval');
      clearInterval(pollForActiveJobs);
    };
  }, [status.isGenerating, status.hasZombieJob, recentCompletion, checkHermeticReportStatus]);

  return {
    ...status,
    refreshStatus,
    cleanupZombieJob,
    clearProgressInsight,
  };
};