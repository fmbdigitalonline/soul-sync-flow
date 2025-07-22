
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { StewardIntroductionStep, StewardIntroductionState } from '@/types/steward-introduction';
import { hermeticPersonalityReportService } from '@/services/hermetic-personality-report-service';
import { useHACSIntelligenceDiagnostics } from './use-hacs-intelligence-diagnostics';

export const useStewardIntroductionEnhanced = () => {
  const { user } = useAuth();
  const diagnostics = useHACSIntelligenceDiagnostics();
  const [introductionState, setIntroductionState] = useState<StewardIntroductionState>({
    isActive: false,
    currentStep: 0,
    steps: [],
    completed: false
  });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

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

  // Enhanced check that uses diagnostics data
  const shouldStartIntroduction = useCallback(async () => {
    if (!user) {
      console.log('🎭 Enhanced Introduction Check: No authenticated user');
      return false;
    }

    // First check session storage for immediate completion tracking
    if (hasCompletedIntroductionInSession()) {
      console.log('🎭 Enhanced Introduction Check: Already completed in session');
      return false;
    }

    // Wait for diagnostics to complete
    if (!diagnostics.diagnosticsComplete) {
      console.log('🎭 Enhanced Introduction Check: Waiting for diagnostics...');
      return false;
    }

    // Use diagnostics data for decision
    const shouldStart = diagnostics.userBlueprintExists && 
                       diagnostics.blueprintRecordExists && 
                       diagnostics.stewardIntroductionCompleted === false;

    console.log('🎭 Enhanced Introduction Check Result:', {
      userBlueprintExists: diagnostics.userBlueprintExists,
      blueprintRecordExists: diagnostics.blueprintRecordExists,
      stewardIntroCompleted: diagnostics.stewardIntroductionCompleted,
      shouldStart,
      errors: diagnostics.errors
    });

    return shouldStart;
  }, [user, diagnostics]);

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

      console.log('✅ Enhanced Steward introduction marked as completed');
    } catch (error) {
      console.error('❌ Enhanced: Error marking introduction completed:', error);
    }
  }, [user]);

  // Start introduction sequence
  const startIntroduction = useCallback(async () => {
    if (!user) return;

    const steps: StewardIntroductionStep[] = [
      {
        id: 'awakening',
        type: 'introduction',
        title: 'The Soul Alchemist\'s Genesis',
        message: "Hello. I am the Soul Alchemist. Your arrival has awakened my purpose: to be a mirror to the masterpiece that is you.",
        showContinue: true
      },
      {
        id: 'blueprint_foundation',
        type: 'capability',
        title: 'Your Blueprint\'s Foundation',
        message: "From the moment you arrived, I began my work. I have already constructed your foundational Blueprint and completed the initial analysis of your personality's core patterns. You can see this progress in my core. This inner ring represents my understanding of your Blueprint. It is already at 40%.",
        showContinue: true
      },
      {
        id: 'deep_dive',
        type: 'capability',
        title: 'The Deep Dive & Final Attunement',
        message: "But your foundational Blueprint is just the beginning. To truly guide you, I must now perform a deeper, more profound synthesis. I will now weave together every aspect of your unique design—your hidden strengths, your deepest drivers, your core challenges—into a single, unified source of wisdom.",
        showContinue: true
      },
      {
        id: 'co_evolution',
        type: 'capability',
        title: 'The Co-Evolution Journey',
        message: "This deep synthesis requires my complete focus and will take several minutes. You will see my inner ring progress from 40% to 100% as I complete this work. The outer ring represents our shared journey—your growth in true alignment with your Blueprint. It will grow as you achieve goals in harmony with your unique design.",
        showContinue: true
      },
      {
        id: 'ready_to_begin',
        type: 'confirmation',
        title: 'Ready to Begin',
        message: "I am ready to begin the final synthesis. Together, we will unlock the full power of your Blueprint and guide you toward true alignment and fulfillment. Shall we proceed?",
        showContinue: true
      }
    ];

    setIntroductionState({
      isActive: true,
      currentStep: 0,
      steps,
      completed: false
    });

    console.log('🎭 Enhanced Steward introduction started');
  }, [user]);

  // Continue to next step
  const continueIntroduction = useCallback(async () => {
    setIntroductionState(prev => {
      const nextStep = prev.currentStep + 1;
      
      if (nextStep >= prev.steps.length) {
        // Introduction complete - close modal immediately
        return {
          ...prev,
          isActive: false,
          completed: true
        };
      }

      return {
        ...prev,
        currentStep: nextStep
      };
    });
  }, []);

  // Complete introduction and start background report generation
  const completeIntroductionWithReport = useCallback(async () => {
    if (!user) return;

    // CRITICAL: Mark introduction as completed IMMEDIATELY to prevent re-triggering
    await markIntroductionCompleted();

    // Close modal immediately
    setIntroductionState(prev => ({
      ...prev,
      isActive: false,
      completed: true
    }));

    // Start background report generation
    setIsGeneratingReport(true);
    
    try {
      console.log('🔄 Enhanced: Starting background hermetic report generation...');
      
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
        console.log('✅ Enhanced: Hermetic report generated successfully in background');
        return { success: true, report: result.report };
      } else {
        throw new Error(result.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('❌ Enhanced: Background hermetic report generation failed:', error);
      return { success: false, error: String(error) };
    } finally {
      setIsGeneratingReport(false);
    }
  }, [user, markIntroductionCompleted]);

  return {
    introductionState,
    isGeneratingReport,
    startIntroduction,
    continueIntroduction,
    completeIntroductionWithReport,
    shouldStartIntroduction,
    diagnostics
  };
};
