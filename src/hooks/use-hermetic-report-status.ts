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
  currentStage?: string;
  stepIndex?: number;
  totalSteps?: number;
  wordCount?: number;
  estimatedTimeRemaining?: string;
  detailedStatus?: {
    stage: string;
    stepName: string;
    description: string;
    completedSections: number;
    totalSections: number;
  };
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
      
      // Check for active jobs with detailed progress data
      const { data: activeJobs } = await supabase
        .from('hermetic_processing_jobs')
        .select('status, progress_percentage, current_step, created_at')
        .eq('user_id', user.id)
        .in('status', ['pending', 'processing'])
        .order('created_at', { ascending: false })
        .limit(1);

      const activeJob = activeJobs?.[0];
      const isGenerating = !!activeJob;
      const progress = activeJob?.progress_percentage || 0;
      const currentStep = activeJob?.current_step || undefined;
      
      // Calculate detailed status information from current_step
      const detailedStatus = activeJob ? parseCurrentStepForDetails(activeJob.current_step, progress) : undefined;
      const wordCount = 0; // Will be populated from actual progress tracking
      const estimatedTimeRemaining = calculateETA(activeJob);
      
      setStatus({
        hasReport,
        loading: false,
        error: null,
        isGenerating,
        progress,
        currentStep,
        wordCount,
        estimatedTimeRemaining,
        detailedStatus,
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

// Helper functions for calculating detailed status
function parseCurrentStepForDetails(currentStep: string, progress: number) {
  if (!currentStep) return null;
  
  // Parse different step formats from the orchestrator
  let stageName = 'Processing';
  let stepName = currentStep;
  let description = 'Generating your comprehensive hermetic report';
  
  if (currentStep.includes('Processing ')) {
    stepName = currentStep.replace('Processing ', '').replace('...', '');
    
    // Map agent names to readable descriptions
    const agentMappings = {
      // System translators
      'mbti_hermetic_translator': 'MBTI Analysis',
      'astrology_hermetic_translator': 'Astrological Patterns',
      'numerology_hermetic_translator': 'Numerological Insights',
      'human_design_hermetic_translator': 'Human Design Integration',
      'chinese_astrology_hermetic_translator': 'Chinese Astrology Wisdom',
      
      // Hermetic laws
      'mentalism_analyst': 'Law of Mentalism',
      'correspondence_analyst': 'Law of Correspondence',
      'vibration_analyst': 'Law of Vibration',
      'polarity_analyst': 'Law of Polarity',
      'rhythm_analyst': 'Law of Rhythm',
      'causation_analyst': 'Law of Causation',
      'gender_analyst': 'Law of Gender',
      
      // Intelligence extraction
      'identity_constructs_analyst': 'Identity Constructs',
      'behavioral_triggers_analyst': 'Behavioral Triggers',
      'execution_bias_analyst': 'Execution Patterns',
      'internal_conflicts_analyst': 'Internal Conflicts',
      'spiritual_dimension_analyst': 'Spiritual Dimensions',
      'adaptive_feedback_analyst': 'Adaptive Feedback',
      'temporal_biology_analyst': 'Temporal Biology',
      'metacognitive_biases_analyst': 'Metacognitive Patterns',
      'attachment_style_analyst': 'Attachment Style',
      'goal_archetypes_analyst': 'Goal Archetypes',
      'crisis_handling_analyst': 'Crisis Handling',
      'identity_flexibility_analyst': 'Identity Flexibility',
      'linguistic_fingerprint_analyst': 'Linguistic Fingerprint'
    };
    
    stepName = agentMappings[stepName] || stepName;
    
    // Determine stage based on progress
    if (progress < 20) {
      stageName = 'System Translation';
      description = 'Translating personality systems through Hermetic Laws';
    } else if (progress < 50) {
      stageName = 'Hermetic Analysis';
      description = 'Deep analysis through the Seven Hermetic Laws';
    } else if (progress < 80) {
      stageName = 'Gate Analysis';
      description = 'Analyzing Human Design gates through Hermetic principles';
    } else if (progress < 95) {
      stageName = 'Intelligence Extraction';
      description = 'Extracting multi-dimensional intelligence patterns';
    } else {
      stageName = 'Final Assembly';
      description = 'Assembling comprehensive hermetic report';
    }
  } else if (currentStep.includes('Assembling')) {
    stageName = 'Final Assembly';
    stepName = 'Report Synthesis';
    description = 'Combining all analyses into your complete report';
  }
  
  // Calculate section progress
  const totalSections = 100; // Approximate total sections across all stages
  const completedSections = Math.floor((progress / 100) * totalSections);
  
  return {
    stage: stageName,
    stepName,
    description,
    completedSections,
    totalSections
  };
}

function calculateWordCount(progressData: any): number {
  // For now, estimate word count based on progress
  // This will be updated when we have actual progress tracking
  return 0;
}

function calculateETA(job: any): string {
  if (!job) return '';
  
  const startTime = new Date(job.created_at).getTime();
  const now = new Date().getTime();
  const elapsed = now - startTime;
  const progress = job.progress_percentage || 0;
  
  if (progress <= 0) return 'Calculating...';
  
  const totalEstimatedTime = (elapsed / progress) * 100;
  const remainingTime = totalEstimatedTime - elapsed;
  
  if (remainingTime <= 0) return 'Nearly complete...';
  
  const minutes = Math.ceil(remainingTime / (1000 * 60));
  
  if (minutes < 1) return 'Less than a minute';
  if (minutes === 1) return '1 minute';
  if (minutes < 60) return `${minutes} minutes`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 1) {
    return remainingMinutes > 0 ? `1 hour ${remainingMinutes} minutes` : '1 hour';
  }
  
  return remainingMinutes > 0 ? `${hours} hours ${remainingMinutes} minutes` : `${hours} hours`;
}