
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { StewardIntroductionStep, StewardIntroductionState } from '@/types/steward-introduction';
import { hermeticPersonalityReportService } from '@/services/hermetic-personality-report-service';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * @deprecated Use useStewardIntroductionEnhanced instead
 * This hook is kept for backward compatibility but will be removed in future versions.
 * Migration: Replace useStewardIntroduction with useStewardIntroductionEnhanced
 */
export const useStewardIntroduction = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
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

  // Start introduction sequence
  const startIntroduction = useCallback(async () => {
    if (!user) return;

    const steps: StewardIntroductionStep[] = [
      {
        id: 'awakening',
        type: 'introduction',
        title: t('stewardIntro.awakening.title'),
        message: t('stewardIntro.awakening.message'),
        showContinue: true
      },
      {
        id: 'blueprint_foundation',
        type: 'capability',
        title: t('stewardIntro.blueprintFoundation.title'),
        message: t('stewardIntro.blueprintFoundation.message'),
        showContinue: true
      },
      {
        id: 'deep_dive',
        type: 'capability',
        title: t('stewardIntro.deepDive.title'),
        message: t('stewardIntro.deepDive.message'),
        showContinue: true
      },
      {
        id: 'co_evolution',
        type: 'capability',
        title: t('stewardIntro.coEvolution.title'),
        message: t('stewardIntro.coEvolution.message'),
        showContinue: true
      },
      {
        id: 'ready_to_begin',
        type: 'confirmation',
        title: t('stewardIntro.readyToBegin.title'),
        message: t('stewardIntro.readyToBegin.message'),
        showContinue: true
      }
    ];

    setIntroductionState({
      isActive: true,
      currentStep: 0,
      steps,
      completed: false
    });

    console.log('🎭 Steward introduction started');
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
  }, [user, markIntroductionCompleted]);

  // Check if introduction should start for new users
  const shouldStartIntroduction = useCallback(async () => {
    if (!user) return false;

    // First check session storage - if completed in this session, don't start
    if (hasCompletedIntroductionInSession()) {
      return false;
    }

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

      // User needs introduction if:
      // 1. Has a valid user blueprint
      // 2. Blueprint exists
      // 3. Introduction is not marked completed
      // 4. Not completed in current session
      return !!userBlueprint && !!blueprint && !blueprint.steward_introduction_completed;
    } catch (error) {
      console.error('Error checking if introduction should start:', error);
      return false;
    }
  }, [user]);

  return {
    introductionState,
    isGeneratingReport,
    startIntroduction,
    continueIntroduction,
    completeIntroductionWithReport,
    shouldStartIntroduction,
    checkIntroductionStatus
  };
};
