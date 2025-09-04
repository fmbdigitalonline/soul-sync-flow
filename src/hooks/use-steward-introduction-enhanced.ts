
/**
 * Phase 3: Enhanced Steward Introduction with Database Integration
 * 
 * SoulSync Principles Implemented:
 * ✅ #1: Never Break - Maintains all existing interfaces and functionality
 * ✅ #2: No Hardcoded Data - Uses real database validation results
 * ✅ #6: Integrate with Current Architecture - Works with Phase 2 database logic
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { StewardIntroductionStep, StewardIntroductionState } from '@/types/steward-introduction';
import { hermeticPersonalityReportService } from '@/services/hermetic-personality-report-service';
import { useStewardIntroductionDatabase } from './use-steward-introduction-database';
import { useLanguage } from '@/contexts/LanguageContext';

export const useStewardIntroductionEnhanced = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  // Phase 3: Use database-driven validation instead of diagnostics
  const databaseValidation = useStewardIntroductionDatabase();
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

  // Phase 3: Simplified introduction check using database validation
  const shouldStartIntroduction = useCallback(() => {
    if (!user) {
      console.log('🎯 PHASE 3: No authenticated user');
      return false;
    }

    // First check session storage for immediate completion tracking (Principle #1: Never Break)
    if (hasCompletedIntroductionInSession()) {
      console.log('🎯 PHASE 3: Already completed in session');
      return false;
    }

    // Wait for database validation to complete
    if (databaseValidation.loading) {
      console.log('🎯 PHASE 3: Waiting for database validation...');
      return false;
    }

    // Use real database validation results (Principle #2: No Hardcoded Data)
    const shouldStart = databaseValidation.shouldShow;

    console.log('🎯 PHASE 3: Database validation result:', {
      shouldShow: databaseValidation.shouldShow,
      diagnostic: databaseValidation.diagnostic,
      error: databaseValidation.error,
      loading: databaseValidation.loading
    });

    return shouldStart;
  }, [user, databaseValidation]);

  // Phase 3: Enhanced completion logic with database integration
  const markIntroductionCompleted = useCallback(async () => {
    if (!user) return false;

    // Immediately mark in session to prevent re-triggering (Principle #1: Never Break)
    markIntroductionCompletedInSession();

    try {
      console.log('🎯 PHASE 3: Marking introduction as completed in database');
      
      // Use the database hook's completion method (Principle #6: Integrate)
      const success = await databaseValidation.markIntroductionCompleted();
      
      if (success) {
        console.log('✅ PHASE 3: Introduction successfully marked as completed');
        return true;
      } else {
        console.error('❌ PHASE 3: Failed to mark introduction completed');
        return false;
      }
    } catch (error) {
      console.error('💥 PHASE 3: Error marking introduction completed:', error);
      return false;
    }
  }, [user, databaseValidation]);

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

    console.log('🎯 PHASE 3: Steward introduction started with database validation');
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

  // Phase 3: Complete introduction with enhanced error handling
  const completeIntroductionWithReport = useCallback(async () => {
    if (!user) return { success: false, error: 'No authenticated user' };

    // CRITICAL: Mark introduction as completed IMMEDIATELY to prevent re-triggering (Principle #3: No Fallbacks That Mask Errors)
    const completionSuccess = await markIntroductionCompleted();

    // Close modal immediately regardless of completion status (Principle #1: Never Break)
    setIntroductionState(prev => ({
      ...prev,
      isActive: false,
      completed: true
    }));

    // Only proceed with report generation if completion was successful
    if (!completionSuccess) {
      console.error('❌ PHASE 3: Could not mark completion, skipping report generation');
      return { success: false, error: 'Failed to mark completion in database' };
    }

    // Start background report generation (Principle #2: Real Data Only)
    setIsGeneratingReport(true);
    
    try {
      console.log('🔄 PHASE 3: Starting background hermetic report generation...');
      
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
      
      if (result.success && result.job_id) {
        console.log(`✅ PHASE 3: Hermetic report job created successfully: ${result.job_id}`);
        return { success: true, job_id: result.job_id };
      } else {
        throw new Error(result.error || 'Failed to create hermetic report job');
      }
    } catch (error) {
      console.error('❌ PHASE 3: Background hermetic report generation failed:', error);
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
    // Phase 3: Expose database validation for transparency (Principle #7)
    databaseValidation
  };
};
