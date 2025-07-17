
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface StewardIntroductionState {
  isIntroductionNeeded: boolean;
  currentStep: 'welcome' | 'evolution' | 'commitment' | 'generating' | 'complete';
  showIntroduction: boolean;
  generationJobId?: string;
  generationProgress: number;
  isGenerating: boolean;
}

interface StewardIntroductionContextType extends StewardIntroductionState {
  startIntroduction: () => void;
  nextStep: () => void;
  startGeneration: () => Promise<void>;
  dismissIntroduction: () => void;
  checkIntroductionStatus: () => Promise<void>;
}

const StewardIntroductionContext = createContext<StewardIntroductionContextType | undefined>(undefined);

export const StewardIntroductionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, setState] = useState<StewardIntroductionState>({
    isIntroductionNeeded: false,
    currentStep: 'welcome',
    showIntroduction: false,
    generationProgress: 0,
    isGenerating: false,
  });

  // Check if user needs introduction on mount
  useEffect(() => {
    if (user) {
      checkIntroductionStatus();
    }
  }, [user]);

  const checkIntroductionStatus = async () => {
    if (!user) return;

    try {
      // Check if user has completed steward introduction
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking introduction status:', error);
        return;
      }

      // Check if user has hermetic report
      const { data: report, error: reportError } = await supabase
        .from('personality_reports')
        .select('id')
        .eq('user_id', user.id)
        .eq('blueprint_version', '2.0')
        .limit(1);

      if (reportError) {
        console.error('Error checking hermetic report:', reportError);
        return;
      }

      // For now, we'll assume the introduction is needed if the user doesn't have a hermetic report
      const needsIntroduction = (!report || report.length === 0);
      
      setState(prev => ({
        ...prev,
        isIntroductionNeeded: needsIntroduction,
      }));

    } catch (error) {
      console.error('Error in checkIntroductionStatus:', error);
    }
  };

  const startIntroduction = () => {
    setState(prev => ({
      ...prev,
      showIntroduction: true,
      currentStep: 'welcome',
    }));
  };

  const nextStep = () => {
    setState(prev => {
      const steps: Array<typeof prev.currentStep> = ['welcome', 'evolution', 'commitment'];
      const currentIndex = steps.indexOf(prev.currentStep);
      const nextStep = currentIndex < steps.length - 1 ? steps[currentIndex + 1] : prev.currentStep;
      
      return {
        ...prev,
        currentStep: nextStep,
      };
    });
  };

  const startGeneration = async () => {
    if (!user) return;

    setState(prev => ({
      ...prev,
      currentStep: 'generating',
      isGenerating: true,
      generationProgress: 0,
    }));

    try {
      // Import and use the hermetic report service
      const { hermeticPersonalityReportService } = await import('@/services/hermetic-personality-report-service');
      
      // Get user's blueprint for generation
      const { data: blueprint, error: blueprintError } = await supabase
        .from('user_blueprints')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (blueprintError || !blueprint) {
        console.error('Error fetching blueprint for hermetic generation:', blueprintError);
        return;
      }

      // Start progress simulation (since we can't track real progress from the service)
      const progressInterval = setInterval(() => {
        setState(prev => {
          if (prev.generationProgress >= 95) {
            return prev;
          }
          return {
            ...prev,
            generationProgress: Math.min(prev.generationProgress + Math.random() * 5 + 2, 95),
          };
        });
      }, 8000); // Update every 8 seconds

      // Generate the actual hermetic report
      const result = await hermeticPersonalityReportService.generateHermeticReport(blueprint.blueprint);

      // Clear progress interval
      clearInterval(progressInterval);

      if (result.success) {
        // Mark introduction as completed in user_profiles when it exists
        // For now we'll skip this until the column is added
        
        setState(prev => ({
          ...prev,
          currentStep: 'complete',
          generationProgress: 100,
          isGenerating: false,
        }));

        console.log('🎉 Hermetic report generation completed successfully');
      } else {
        console.error('❌ Hermetic report generation failed:', result.error);
        setState(prev => ({
          ...prev,
          isGenerating: false,
        }));
      }

    } catch (error) {
      console.error('Error in startGeneration:', error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
      }));
    }
  };

  const dismissIntroduction = () => {
    setState(prev => ({
      ...prev,
      showIntroduction: false,
      isIntroductionNeeded: false,
    }));
  };

  return (
    <StewardIntroductionContext.Provider value={{
      ...state,
      startIntroduction,
      nextStep,
      startGeneration,
      dismissIntroduction,
      checkIntroductionStatus,
    }}>
      {children}
    </StewardIntroductionContext.Provider>
  );
};

export const useStewardIntroduction = () => {
  const context = useContext(StewardIntroductionContext);
  if (context === undefined) {
    throw new Error('useStewardIntroduction must be used within a StewardIntroductionProvider');
  }
  return context;
};
