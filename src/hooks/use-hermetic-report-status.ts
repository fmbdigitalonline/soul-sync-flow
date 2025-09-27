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
  const [displayedMilestones, setDisplayedMilestones] = useState<Set<number>>(new Set());

  const [recentCompletion, setRecentCompletion] = useState<{
    timestamp: number;
    jobId: string;
  } | null>(null);

  // Generate educational progress insights based on actual processing stages
  const generateProgressInsight = useCallback((progress: number, currentStep?: string): HACSInsight | undefined => {
    
    // Extract relevant info from current step
    const stepInfo = currentStep?.toLowerCase() || '';
    const stepType = stepInfo.match(/processing (\w+)/)?.[1] || '';
    
    // Map processing stages to educational messages
    const stageMessages: Record<string, { message: string; description: string }> = {
      'rhythm_analyst': {
        message: "Learning your natural rhythms and energy patterns...",
        description: "Your rhythm profile reveals how you sync with life's natural cycles, peak performance times, and energy management patterns."
      },
      'mentalism_analyst': {
        message: "Learning your mental processing patterns and cognitive style...",
        description: "Understanding how your mind processes information, makes decisions, and approaches problem-solving challenges."
      },
      'hermetic_core': {
        message: "Learning your core hermetic intelligence signatures...",
        description: "Discovering the fundamental patterns that shape your personality, consciousness, and life approach."
      },
      'personality_matrix': {
        message: "Learning your unique personality architecture...",
        description: "Mapping the complex interplay of traits, behaviors, and psychological patterns that make you unique."
      },
      'consciousness_analyst': {
        message: "Learning your consciousness patterns and awareness levels...",
        description: "Understanding how you perceive reality, process experiences, and maintain self-awareness."
      },
      'wisdom_integration': {
        message: "Learning how wisdom integrates within your personality...",
        description: "Discovering how life experiences have shaped your insights, judgment, and decision-making wisdom."
      }
    };
    
    // Progress-based fallback messages for when no specific stage is detected
    const progressMessages: Record<number, { message: string; description: string }> = {
      0: {
        message: "Beginning to learn your soul's intelligence patterns...",
        description: "Initiating comprehensive hermetic intelligence mapping to understand your unique consciousness signature."
      },
      10: {
        message: "Learning your foundational personality structures...",
        description: "Discovering the core building blocks that form your psychological foundation and behavioral patterns."
      },
      20: {
        message: "Learning your cognitive processing preferences...",
        description: "Understanding how your mind naturally processes information, makes connections, and forms insights."
      },
      30: {
        message: "Learning your emotional intelligence patterns...",
        description: "Discovering how you experience, process, and integrate emotional information into your decision-making."
      },
      40: {
        message: "Learning your unique interaction styles...",
        description: "Understanding how you naturally connect with others, communicate, and navigate social dynamics."
      },
      50: {
        message: "Learning your deeper psychological layers...",
        description: "Exploring the complex psychological patterns that drive your motivations, fears, and aspirations."
      },
      60: {
        message: "Learning your consciousness expansion patterns...",
        description: "Understanding how you grow, evolve, and expand your awareness throughout your life journey."
      },
      70: {
        message: "Learning your wisdom integration methods...",
        description: "Discovering how you process life experiences into practical wisdom and meaningful insights."
      },
      80: {
        message: "Learning your authentic self-expression patterns...",
        description: "Understanding how your true self manifests in the world through your unique talents and perspectives."
      },
      90: {
        message: "Learning your soul's highest potential pathways...",
        description: "Mapping the routes through which you can actualize your deepest purpose and fullest expression."
      },
      100: {
        message: "Your hermetic intelligence profile is complete and ready!",
        description: "Your comprehensive soul intelligence map is now available, revealing the full spectrum of your consciousness patterns."
      }
    };
    
    // Determine which message to use
    let selectedMessage: { message: string; description: string };
    
    if (stepType && stageMessages[stepType]) {
      selectedMessage = stageMessages[stepType];
    } else {
      const milestone = Math.floor(progress / 10) * 10;
      selectedMessage = progressMessages[milestone] || progressMessages[0];
    }
    
    return {
      id: `hermetic-progress-${progress}-${Date.now()}`,
      text: selectedMessage.message,
      module: 'Hermetic Intelligence',
      type: 'hermetic_progress',
      confidence: 100,
      evidence: [
        `Learning progress: ${progress}%`,
        `Current stage: ${currentStep || 'Processing personality matrix'}`,
        selectedMessage.description,
        ...(stepType ? [`Learning from: ${stepType} data`] : [])
      ],
      timestamp: new Date(),
      acknowledged: false,
      showContinue: true
    };
  }, []);

  // Clear progress insight and mark milestone as displayed
  const clearProgressInsight = useCallback((milestone?: number) => {
    // Get milestone from parameter or calculate from current progress
    const currentMilestone = milestone || Math.floor(status.progress / 10) * 10;
    
    console.log(`🧹 CLEAR INSIGHT: Clearing progress insight for milestone ${currentMilestone}%`);
    
    // Mark this milestone as already displayed to prevent regeneration
    if (currentMilestone >= 0) {
      setDisplayedMilestones(prev => {
        const updated = new Set(prev);
        updated.add(currentMilestone);
        console.log(`🎯 MILESTONE TRACKING: Added ${currentMilestone}% to displayed milestones:`, [...updated]);
        return updated;
      });
      setLastProgressMilestone(currentMilestone);
    }
    
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
        // Reset milestone tracking when no user
        setDisplayedMilestones(new Set());
        setLastProgressMilestone(0);
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
        
        // Reset milestone tracking for new generation
        setDisplayedMilestones(new Set());
        setLastProgressMilestone(0);
        console.log('🔄 MILESTONE RESET: Cleared displayed milestones for new generation');
        
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

      // Progress milestone detection (every 10% starting from 0%) - prevent duplicates
      const currentMilestone = Math.floor(progress / 10) * 10;
      const shouldShowProgressMessage = progress >= 0 && 
                                       currentMilestone >= 0 &&
                                       currentMilestone % 10 === 0 &&
                                       !displayedMilestones.has(currentMilestone) &&
                                       !hasZombieJob &&
                                       isGenerating;
      
      let progressInsight = status.progressInsight;
      let progressInsightReady = status.progressInsightReady;
      let milestoneGlow = status.milestoneGlow;
      
      if (shouldShowProgressMessage) {
        console.log(`🎉 HERMETIC MILESTONE: Reached ${currentMilestone}% progress! (First time)`);
        console.log(`🎯 MILESTONE TRACKING: Current displayed milestones:`, [...displayedMilestones]);
        
        progressInsight = generateProgressInsight(progress, currentStep);
        progressInsightReady = true;
        milestoneGlow = [75, 100].includes(currentMilestone);
        
        // Note: We don't mark as displayed here - only when user dismisses
        // This prevents the insight from reappearing due to polling
        
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