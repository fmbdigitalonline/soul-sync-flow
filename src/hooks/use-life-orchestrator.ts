import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { lifeOrchestratorService } from '@/services/life-orchestrator-service';
import { adaptiveGrowthService } from '@/services/adaptive-growth-service';
import { LifeDomain, LifeWheelAssessment, DomainGap } from '@/types/growth-program';
import { LayeredBlueprint } from '@/types/personality-modules';
import { toast } from '@/hooks/use-toast';

interface LifeOrchestratorState {
  needsAssessment: boolean;
  assessments: LifeWheelAssessment[];
  gaps: DomainGap[];
  orchestratorPlan: any;
  loading: boolean;
}

export function useLifeOrchestrator() {
  const { user } = useAuth();
  const [state, setState] = useState<LifeOrchestratorState>({
    needsAssessment: false,
    assessments: [],
    gaps: [],
    orchestratorPlan: null,
    loading: false
  });

  // Check if user needs life wheel assessment
  const checkAssessmentNeeds = useCallback(async () => {
    if (!user) return false;

    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const needsAssessment = await lifeOrchestratorService.needsLifeWheelAssessment(user.id);
      
      if (!needsAssessment) {
        // Load existing assessments and gaps
        const [assessments, gaps] = await Promise.all([
          lifeOrchestratorService.getUserLifeWheel(user.id),
          lifeOrchestratorService.calculateDomainGaps(user.id)
        ]);
        
        setState(prev => ({
          ...prev,
          needsAssessment: false,
          assessments,
          gaps,
          loading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          needsAssessment: true,
          loading: false
        }));
      }

      return needsAssessment;
    } catch (error) {
      console.error('Error checking assessment needs:', error);
      setState(prev => ({ ...prev, loading: false }));
      return false;
    }
  }, [user]);

  // Complete assessment and generate orchestrator plan
  const completeAssessment = useCallback(async (assessmentData: any[]) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to complete your assessment.",
        variant: "destructive"
      });
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));

      // Assessments are already saved by the LifeWheelAssessment component
      // Now calculate gaps and generate orchestrator plan
      const [gaps, orchestratorPlan] = await Promise.all([
        lifeOrchestratorService.calculateDomainGaps(user.id),
        lifeOrchestratorService.generateLifeOrchestratorPlan(user.id, 3)
      ]);

      setState(prev => ({
        ...prev,
        needsAssessment: false,
        gaps,
        orchestratorPlan,
        loading: false
      }));

      toast({
        title: "Life Orchestrator Plan Ready! 🎭",
        description: `Prioritized ${gaps.length} life domains. Ready to create your personalized growth program.`
      });

      return { gaps, orchestratorPlan };
    } catch (error) {
      console.error('Error completing assessment:', error);
      setState(prev => ({ ...prev, loading: false }));
      
      toast({
        title: "Assessment Error",
        description: "There was an error processing your assessment. Please try again.",
        variant: "destructive"
      });
    }
  }, [user]);

  // Generate growth program with life orchestrator integration
  const generateProgram = useCallback(async (domain?: LifeDomain, blueprint?: LayeredBlueprint) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate a growth program.",
        variant: "destructive"
      });
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));

      // Use the primary domain from orchestrator plan if not specified
      const targetDomain = domain || state.orchestratorPlan?.multi_domain_strategy?.primary_domain || 'wellbeing';

      const program = await adaptiveGrowthService.generateAdaptiveProgram(
        user.id,
        targetDomain,
        blueprint!,
        {
          life_wheel_gaps: state.gaps,
          orchestrator_plan: state.orchestratorPlan
        }
      );

      setState(prev => ({ ...prev, loading: false }));

      toast({
        title: "Growth Program Created! 🚀",
        description: `Your ${targetDomain} program is ready with multi-domain coordination.`
      });

      return program;
    } catch (error) {
      console.error('Error generating program:', error);
      setState(prev => ({ ...prev, loading: false }));

      if (error instanceof Error && error.message === 'NEEDS_LIFE_WHEEL_ASSESSMENT') {
        setState(prev => ({ ...prev, needsAssessment: true }));
        
        toast({
          title: "Assessment Required",
          description: "Please complete your Life Wheel assessment first to create a personalized program.",
          variant: "default"
        });
        
        return null;
      }

      toast({
        title: "Program Generation Error",
        description: "There was an error creating your growth program. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, state.gaps, state.orchestratorPlan]);

  // Update domain assessment
  const updateDomainAssessment = useCallback(async (
    domain: LifeDomain,
    current_score: number,
    desired_score: number,
    importance_rating: number,
    notes?: string
  ) => {
    if (!user) return;

    try {
      const assessment = await lifeOrchestratorService.updateDomainAssessment(
        user.id,
        domain,
        current_score,
        desired_score,
        importance_rating,
        notes
      );

      // Refresh gaps after update
      const gaps = await lifeOrchestratorService.calculateDomainGaps(user.id);
      
      setState(prev => ({
        ...prev,
        gaps,
        assessments: prev.assessments.map(a => 
          a.domain === domain ? assessment : a
        )
      }));

      return assessment;
    } catch (error) {
      console.error('Error updating domain assessment:', error);
      throw error;
    }
  }, [user]);

  // Get top gaps for display
  const getTopGaps = useCallback((limit: number = 3) => {
    return state.gaps.slice(0, limit);
  }, [state.gaps]);

  // Get recommended focus domains
  const getRecommendedFocus = useCallback(() => {
    return state.orchestratorPlan?.recommended_focus || [];
  }, [state.orchestratorPlan]);

  return {
    // State
    needsAssessment: state.needsAssessment,
    assessments: state.assessments,
    gaps: state.gaps,
    orchestratorPlan: state.orchestratorPlan,
    loading: state.loading,

    // Actions
    checkAssessmentNeeds,
    completeAssessment,
    generateProgram,
    updateDomainAssessment,

    // Computed
    getTopGaps,
    getRecommendedFocus,
    hasAssessments: state.assessments.length > 0,
    hasPlan: !!state.orchestratorPlan
  };
}