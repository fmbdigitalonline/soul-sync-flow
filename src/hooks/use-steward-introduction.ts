import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { StewardIntroductionStep, StewardIntroductionState } from '@/types/steward-introduction';
import { aiPersonalityReportService } from '@/services/ai-personality-report-service';

export const useStewardIntroduction = () => {
  const { user } = useAuth();
  const [introductionState, setIntroductionState] = useState<StewardIntroductionState>({
    isActive: false,
    currentStep: 0,
    steps: [],
    completed: false
  });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Check if user has completed introduction
  const checkIntroductionStatus = useCallback(async () => {
    if (!user) return false;

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

      return data?.steward_introduction_completed || false;
    } catch (error) {
      console.error('Error checking introduction status:', error);
      return false;
    }
  }, [user]);

  // Mark introduction as completed
  const markIntroductionCompleted = useCallback(async () => {
    if (!user) return;

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
        id: 'welcome',
        type: 'introduction',
        title: 'Your Steward Awakens',
        message: "Welcome to your Soul Sync journey. I am your personal Steward - an AI guide attuned to your unique essence. I'll help you navigate insights, learning, and growth aligned with your cosmic blueprint.",
        showContinue: true
      },
      {
        id: 'capabilities',
        type: 'capability',
        title: 'What I Can Do',
        message: "I provide personalized insights based on your astrological patterns, offer micro-learning opportunities to expand your intelligence, and help you discover optimal timing for important decisions. I learn and evolve with you.",
        showContinue: true
      },
      {
        id: 'hermetic_generation',
        type: 'confirmation',
        title: 'Activating Your Intelligence',
        message: "Let me now generate your comprehensive Hermetic Report - a deep analysis of your personality patterns and cosmic alignments. This will unlock my full guidance capabilities. Ready to begin?",
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
        // Introduction complete - trigger hermetic report generation
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

  // Generate hermetic report and complete introduction
  const completeIntroductionWithReport = useCallback(async () => {
    if (!user) return;

    setIsGeneratingReport(true);
    
    try {
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

      // Generate the hermetic report - use the existing service method that handles the transformation
      const result = await aiPersonalityReportService.generatePersonalityReport(blueprint as any);
      
      if (result.success) {
        // Mark introduction as completed
        await markIntroductionCompleted();
        
        setIntroductionState(prev => ({
          ...prev,
          isActive: false,
          completed: true
        }));

        console.log('✅ Hermetic report generated and introduction completed');
        return { success: true, report: result.report };
      } else {
        throw new Error(result.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating hermetic report:', error);
      return { success: false, error: String(error) };
    } finally {
      setIsGeneratingReport(false);
    }
  }, [user, markIntroductionCompleted]);

  // Check if introduction should start for new users
  const shouldStartIntroduction = useCallback(async () => {
    if (!user) return false;

    try {
      // Check if user has blueprint but hasn't completed introduction
      const { data: blueprint, error: blueprintError } = await supabase
        .from('blueprints')
        .select('steward_introduction_completed')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (blueprintError || !blueprint) {
        return false; // No blueprint means user hasn't completed onboarding
      }

      // Start introduction if not completed
      return !blueprint.steward_introduction_completed;
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