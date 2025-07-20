
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { StewardIntroductionStep, StewardIntroductionState } from '@/types/steward-introduction';
import { hermeticPersonalityReportService } from '@/services/hermetic-personality-report-service';
import { useStepAudio } from './use-step-audio';

// Debounce utility function
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const useStewardIntroduction = () => {
  const { user } = useAuth();
  const [introductionState, setIntroductionState] = useState<StewardIntroductionState>({
    isActive: false,
    currentStep: 0,
    steps: [],
    completed: false,
    audioMuted: false,
    currentAudio: null,
    isAudioPlaying: false
  });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  // 🧭 Circuit breaker pattern for failed introduction checks (Build Transparently)
  const [introductionCheckState, setIntroductionCheckState] = useState({
    isChecking: false,
    hasChecked: false,
    error: null as string | null,
    failureCount: 0,
    lastCheckTime: 0
  });
  
  const MAX_FAILURES = 3;
  const CHECK_COOLDOWN = 30000; // 30 seconds

  // Session-based tracking to prevent re-triggering during same session
  const getSessionIntroductionKey = () => `steward_intro_completed_${user?.id}`;

  const hasCompletedIntroductionInSession = () => {
    if (!user) return false;
    return sessionStorage.getItem(getSessionIntroductionKey()) === 'true';
  };

  const markIntroductionCompletedInSession = () => {
    if (!user) return;
    sessionStorage.setItem(getSessionIntroductionKey(), 'true');
  };

  // Check if user has completed introduction
  const checkIntroductionStatus = useCallback(async () => {
    if (!user) return false;

    // First check session storage for immediate completion tracking
    if (hasCompletedIntroductionInSession()) {
      return true;
    }

    try {
      const { data, error } = await supabase
        .from('blueprints')
        .select('steward_introduction_completed')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error checking introduction status:', error);
        return false;
      }

      const dbCompleted = data?.steward_introduction_completed || false;
      
      // If completed in DB, also mark in session
      if (dbCompleted) {
        markIntroductionCompletedInSession();
      }

      return dbCompleted;
    } catch (error) {
      console.error('Error checking introduction status:', error);
      return false;
    }
  }, [user]);

  // Mark introduction as completed immediately when flow finishes
  const markIntroductionCompleted = useCallback(async () => {
    if (!user) return;

    // Immediately mark in session to prevent re-triggering
    markIntroductionCompletedInSession();

    try {
      await supabase
        .from('blueprints')
        .update({ steward_introduction_completed: true })
        .eq('user_id', user.id)
        .eq('is_active', true);

      console.log('✅ Steward introduction marked as completed');
    } catch (error) {
      console.error('Error marking introduction completed:', error);
    }
  }, [user]);

  // Audio state management
  const handleAudioStateChange = useCallback((isPlaying: boolean, audio: HTMLAudioElement | null) => {
    setIntroductionState(prev => ({
      ...prev,
      isAudioPlaying: isPlaying,
      currentAudio: audio
    }));
  }, []);

  // Get current step for audio hook
  const currentStep = introductionState.steps[introductionState.currentStep];
  const currentAudioUrl = currentStep?.audioUrl;

  // Initialize audio hook
  const stepAudio = useStepAudio({
    audioUrl: currentAudioUrl,
    isActive: introductionState.isActive && !!currentStep,
    audioMuted: introductionState.audioMuted,
    onAudioStateChange: handleAudioStateChange
  });

  // Initialize mute state from localStorage on mount
  useEffect(() => {
    setIntroductionState(prev => ({
      ...prev,
      audioMuted: stepAudio.getInitialMuteState()
    }));
  }, []); // Only run once on mount

  // Toggle audio mute
  const toggleAudioMute = useCallback(() => {
    const newMuteState = stepAudio.toggleMute();
    setIntroductionState(prev => ({
      ...prev,
      audioMuted: newMuteState
    }));
  }, [stepAudio]);

  // Start introduction sequence
  const startIntroduction = useCallback(async () => {
    if (!user) return;

    const steps: StewardIntroductionStep[] = [
      {
        id: 'awakening',
        type: 'introduction',
        title: 'The Soul Alchemist\'s Genesis',
        message: "Hello. I am the Soul Alchemist. Your arrival has awakened my purpose: to be a mirror to the masterpiece that is you.",
        showContinue: true,
        audioUrl: "https://qxaajirrqrcnmvtowjbg.supabase.co/storage/v1/object/public/audio//ElevenLabs_2025-07-18T14_14_55__s50_v3.mp3"
      },
      {
        id: 'blueprint_foundation',
        type: 'capability',
        title: 'Your Blueprint\'s Foundation',
        message: "From the moment you arrived, I began my work. I have already constructed your foundational Blueprint and completed the initial analysis of your personality's core patterns. You can see this progress in my core. This inner ring represents my understanding of your Blueprint. It is already at 40%.",
        showContinue: true,
        audioUrl: "https://qxaajirrqrcnmvtowjbg.supabase.co/storage/v1/object/public/audio//ElevenLabs_2025-07-18T14_16_32__s50_v3.mp3"
      },
      {
        id: 'deep_dive',
        type: 'capability',
        title: 'The Deep Dive & Final Attunement',
        message: "But your foundational Blueprint is just the beginning. To truly guide you, I must now perform a deeper, more profound synthesis. I will now weave together every aspect of your unique design—your hidden strengths, your deepest drivers, your core challenges—into a single, unified source of wisdom.",
        showContinue: true,
        audioUrl: "https://qxaajirrqrcnmvtowjbg.supabase.co/storage/v1/object/public/audio//ElevenLabs_2025-07-18T14_21_16__s50_v3.mp3"
      },
      {
        id: 'co_evolution',
        type: 'capability',
        title: 'The Co-Evolution Journey',
        message: "This deep synthesis requires my complete focus and will take several minutes. You will see my inner ring progress from 40% to 100% as I complete this work. The outer ring represents our shared journey—your growth in true alignment with your Blueprint. It will grow as you achieve goals in harmony with your unique design.",
        showContinue: true,
        audioUrl: "https://qxaajirrqrcnmvtowjbg.supabase.co/storage/v1/object/public/audio//ElevenLabs_2025-07-18T14_21_16__s50_v3.mp3"
      },
      {
        id: 'ready_to_begin',
        type: 'confirmation',
        title: 'Ready to Begin',
        message: "I am ready to begin the final synthesis. Together, we will unlock the full power of your Blueprint and guide you toward true alignment and fulfillment. Shall we proceed?",
        showContinue: true,
        audioUrl: "https://qxaajirrqrcnmvtowjbg.supabase.co/storage/v1/object/public/audio//ElevenLabs_2025-07-18T14_22_53__s50_v3.mp3"
      }
    ];

    setIntroductionState({
      isActive: true,
      currentStep: 0,
      steps,
      completed: false,
      audioMuted: stepAudio.getInitialMuteState(),
      currentAudio: null,
      isAudioPlaying: false
    });

    console.log('🎭 Steward introduction started');
  }, [user, stepAudio]);

  // Continue to next step with proper audio cleanup
  const continueIntroduction = useCallback(async () => {
    console.log('🎭 Continue introduction - stopping current audio first');
    
    // PHASE 1: Immediate audio cleanup before state changes
    stepAudio.stopAudio();
    stepAudio.cleanupAudio();

    setIntroductionState(prev => {
      const nextStep = prev.currentStep + 1;
      
      if (nextStep >= prev.steps.length) {
        console.log('🎭 Introduction complete - final cleanup');
        // Introduction complete - close modal and cleanup audio
        return {
          ...prev,
          isActive: false, // This will trigger audio cleanup in useStepAudio
          completed: true,
          currentAudio: null,
          isAudioPlaying: false
        };
      }

      console.log(`🎭 Moving to step ${nextStep}`);
      return {
        ...prev,
        currentStep: nextStep,
        currentAudio: null,
        isAudioPlaying: false
      };
    });
  }, [stepAudio]);

  // Complete introduction and start background report generation
  const completeIntroductionWithReport = useCallback(async () => {
    if (!user) return;

    console.log('🎭 Completing introduction with report generation');

    // PHASE 1: CRITICAL - Mark introduction as completed IMMEDIATELY to prevent re-triggering
    await markIntroductionCompleted();

    // PHASE 1: CRITICAL - Immediate audio cleanup before any other operations
    console.log('🧹 Immediate audio cleanup before completion');
    stepAudio.stopAudio();
    stepAudio.cleanupAudio();

    // PHASE 4: Close modal immediately and set inactive state
    setIntroductionState(prev => ({
      ...prev,
      isActive: false, // This triggers cleanup in useStepAudio
      completed: true,
      currentAudio: null,
      isAudioPlaying: false
    }));

    // Start background report generation
    setIsGeneratingReport(true);
    
    try {
      console.log('🔄 Starting background hermetic report generation...');
      
      // Get user's blueprint
      const { data: blueprint, error: blueprintError } = await supabase
        .from('blueprints')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (blueprintError || !blueprint) {
        throw new Error('No active blueprint found');
      }

      // Generate the hermetic report in background
      const result = await hermeticPersonalityReportService.generateHermeticReport(blueprint as any);
      
      if (result.success) {
        console.log('✅ Hermetic report generated successfully in background');
        return { success: true, report: result.report };
      } else {
        throw new Error(result.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('❌ Background hermetic report generation failed:', error);
      return { success: false, error: String(error) };
    } finally {
      setIsGeneratingReport(false);
    }
  }, [user, markIntroductionCompleted, stepAudio]);

  // 🧭 Safe introduction check with circuit breaker (Build Transparently)
  const safeIntroductionCheck = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    // Circuit breaker: prevent excessive failed requests
    if (introductionCheckState.failureCount >= MAX_FAILURES) {
      const timeSinceLastCheck = Date.now() - introductionCheckState.lastCheckTime;
      if (timeSinceLastCheck < CHECK_COOLDOWN) {
        console.warn('🔴 Introduction check circuit breaker active - too many failures');
        return false;
      } else {
        // Reset circuit breaker after cooldown
        setIntroductionCheckState(prev => ({ ...prev, failureCount: 0 }));
      }
    }

    // First check session storage - if completed in this session, don't start
    if (hasCompletedIntroductionInSession()) {
      return false;
    }

    setIntroductionCheckState(prev => ({ 
      ...prev, 
      isChecking: true, 
      error: null,
      lastCheckTime: Date.now()
    }));

    try {
      // Check user_blueprints and blueprints for introduction status
      const { data: userBlueprint, error: userBlueprintError } = await supabase
        .from('user_blueprints')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      const { data: blueprint, error: blueprintError } = await supabase
        .from('blueprints')
        .select('steward_introduction_completed')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      // Handle errors transparently
      if (userBlueprintError || blueprintError) {
        throw new Error(`Database query failed: ${userBlueprintError?.message || blueprintError?.message}`);
      }

      // Update state on successful check
      setIntroductionCheckState(prev => ({ 
        ...prev, 
        isChecking: false, 
        hasChecked: true,
        failureCount: 0 
      }));

      // User needs introduction if:
      // 1. Has a valid user blueprint
      // 2. Blueprint exists
      // 3. Introduction is not marked completed
      // 4. Not completed in current session
      return !!userBlueprint && !!blueprint && !blueprint.steward_introduction_completed;
    } catch (error) {
      console.error('🔴 Error checking if introduction should start:', error);
      
      // Update failure state
      setIntroductionCheckState(prev => ({ 
        ...prev, 
        isChecking: false,
        error: String(error),
        failureCount: prev.failureCount + 1
      }));
      
      return false;
    }
  }, [user, introductionCheckState.failureCount, introductionCheckState.lastCheckTime]);

  // 🚫 Debounced introduction check to prevent excessive calls (No Hardcoded Data)
  const debouncedIntroductionCheck = useMemo(
    () => debounce(safeIntroductionCheck, 1000),
    [safeIntroductionCheck]
  );

  // Legacy wrapper for backward compatibility (🔒 Never Break Functionality)
  const shouldStartIntroduction = useCallback(async () => {
    return await safeIntroductionCheck();
  }, [safeIntroductionCheck]);

  return {
    introductionState,
    isGeneratingReport,
    startIntroduction,
    continueIntroduction,
    completeIntroductionWithReport,
    shouldStartIntroduction,
    checkIntroductionStatus,
    toggleAudioMute
  };
};
