
import { useState, useCallback } from 'react';
import { LifeDomain } from '@/types/growth-program';
import { growthProgramGenerationService } from '@/services/growth-program-generation-service';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type OnboardingStage = 'domain_selection' | 'belief_drilling' | 'program_generation';

interface BeliefData {
  domain: LifeDomain;
  conversations: any[];
  keyInsights: string[];
  coreChallenges: string[];
  rootCauses: string[];
}

export const useGrowthOnboardingLogic = (onComplete: () => void) => {
  const [currentStage, setCurrentStage] = useState<OnboardingStage>('domain_selection');
  const [selectedDomain, setSelectedDomain] = useState<LifeDomain | null>(null);
  const [beliefData, setBeliefData] = useState<BeliefData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleDomainSelect = useCallback((domain: LifeDomain) => {
    console.log('🎯 Domain selected:', domain);
    setSelectedDomain(domain);
    setCurrentStage('belief_drilling');
  }, []);

  const handleBeliefComplete = useCallback((beliefs: BeliefData) => {
    console.log('🧠 Beliefs drilling complete:', beliefs);
    setBeliefData(beliefs);
    setCurrentStage('program_generation');
    
    // Start program generation process
    generateGrowthProgram(beliefs);
  }, []);

  const generateGrowthProgram = useCallback(async (beliefs: BeliefData) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      console.log('🚀 Starting growth program generation...');
      
      // Generate the growth program using the service
      const program = await growthProgramGenerationService.generateProgram(
        user.id,
        beliefs.domain,
        beliefs
      );

      console.log('✅ Growth program created:', program.id);
      
      toast({
        title: "Growth Program Created!",
        description: `Your ${beliefs.domain} program is ready to begin.`,
      });

      // Small delay to show completion state
      setTimeout(() => {
        setIsGenerating(false);
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error generating growth program:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate program');
      setIsGenerating(false);
      
      toast({
        title: "Generation Failed",
        description: "There was an issue creating your growth program. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  const handleGenerationComplete = useCallback(() => {
    console.log('🎉 Growth program generation complete - transitioning to program suite');
    onComplete();
  }, [onComplete]);

  return {
    currentStage,
    selectedDomain,
    beliefData,
    isGenerating,
    error,
    handleDomainSelect,
    handleBeliefComplete,
    handleGenerationComplete
  };
};
