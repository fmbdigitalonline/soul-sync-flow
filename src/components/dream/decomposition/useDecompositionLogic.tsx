
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSoulOrb } from '@/contexts/SoulOrbContext';
import { soulGoalDecompositionService, SoulGeneratedGoal } from '@/services/soul-goal-decomposition-service';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Brain, Target, MapPin, Sparkles } from 'lucide-react';

interface DecompositionStage {
  id: string;
  title: string;
  message: string;
  icon: React.ReactNode;
  duration: number;
  action?: () => Promise<void>;
}

interface UseDecompositionLogicProps {
  dreamTitle: string;
  dreamDescription: string;
  dreamTimeframe: string;
  dreamCategory: string;
  blueprintData?: any;
  onComplete: (decomposedGoal: any) => void;
}

export const useDecompositionLogic = ({
  dreamTitle,
  dreamDescription,
  dreamTimeframe,
  dreamCategory,
  blueprintData,
  onComplete
}: UseDecompositionLogicProps) => {
  const { speak, speaking } = useSoulOrb();
  const { toast } = useToast();
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [decomposedGoal, setDecomposedGoal] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionExecuted, setActionExecuted] = useState(false);
  const [allStagesCompleted, setAllStagesCompleted] = useState(false);

  // Memoized user type to prevent infinite re-rendering
  const userType = useMemo(() => {
    if (!blueprintData) {
      return 'powerful soul';
    }
    
    const mbti = blueprintData?.cognition_mbti?.type;
    const hdType = blueprintData?.energy_strategy_human_design?.type;
    
    if (mbti && mbti !== 'Unknown') return mbti;
    if (hdType && hdType !== 'Unknown' && hdType !== 'Generator') return hdType;
    
    const sunSign = blueprintData?.archetype_western?.sun_sign;
    if (sunSign && sunSign !== 'Unknown') {
      return `${sunSign} soul`;
    }
    
    return 'unique soul';
  }, [blueprintData]);

  // Enhanced Soul Goal Decomposition with better error handling
  const decomposeWithSoul = useCallback(async () => {
    const startTime = Date.now();
    console.log('🎯 Starting Soul goal decomposition...', {
      dreamTitle,
      dreamDescription,
      dreamCategory,
      dreamTimeframe,
      timestamp: startTime
    });
    
    try {
      const soulGoal = await soulGoalDecompositionService.decomposeGoalWithSoul(
        dreamTitle,
        dreamDescription,
        dreamTimeframe,
        dreamCategory,
        blueprintData || {}
      );

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log('✅ Soul goal decomposed successfully:', {
        goal: soulGoal,
        processingTime: duration,
        timestamp: endTime
      });
      
      console.log('🔄 Setting decomposedGoal state with data:', soulGoal);
      setDecomposedGoal(soulGoal);
      
      // Save to database with error handling
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.warn('⚠️ No user authenticated for database save');
          return; // Continue without database save
        }

        const goalAsJson = {
          id: soulGoal.id,
          title: soulGoal.title,
          description: soulGoal.description,
          category: soulGoal.category,
          timeframe: soulGoal.timeframe,
          target_completion: soulGoal.target_completion,
          created_at: soulGoal.created_at,
          milestones: (soulGoal.milestones || []).map(milestone => ({
            id: milestone.id,
            title: milestone.title,
            description: milestone.description,
            target_date: milestone.target_date,
            completed: milestone.completed || false,
            completion_criteria: milestone.completion_criteria || [],
            blueprint_alignment: milestone.blueprint_alignment
          })),
          tasks: (soulGoal.tasks || []).map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            completed: task.completed || false,
            estimated_duration: task.estimated_duration,
            energy_level_required: task.energy_level_required,
            category: task.category,
            optimal_timing: task.optimal_timing,
            blueprint_reasoning: task.blueprint_reasoning
          })),
          blueprint_insights: soulGoal.blueprint_insights || [],
          personalization_notes: soulGoal.personalization_notes
        };
        
        const { error: dbError } = await supabase
          .from('productivity_journey')
          .upsert({
            user_id: user.id,
            current_goals: [goalAsJson],
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (dbError) {
          console.error('Database save error:', dbError);
          console.warn('Goal created but database save failed - continuing with success flow');
        } else {
          console.log('💾 Goal saved to database successfully');
        }
        
      } catch (dbError) {
        console.error('❌ Database save error (continuing anyway):', dbError);
      }
      
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.error('❌ Error in Soul decomposition:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: duration,
        timestamp: endTime
      });
      
      throw error; // Re-throw to be caught by stage handler
    }
  }, [dreamTitle, dreamDescription, dreamTimeframe, dreamCategory, blueprintData]);

  const stages: DecompositionStage[] = useMemo(() => [
    {
      id: 'analyzing',
      title: 'Analyzing Your Dream',
      message: `Congratulations on creating "${dreamTitle}"! Let me analyze this through your unique soul blueprint...`,
      icon: <Brain className="h-5 w-5" />,
      duration: 3000
    },
    {
      id: 'milestones',
      title: 'Creating Milestones',
      message: `I'm identifying the perfect milestones for your ${userType} energy. Each one will honor your natural rhythm...`,
      icon: <Target className="h-5 w-5" />,
      duration: 4000,
      action: decomposeWithSoul
    },
    {
      id: 'tasks',
      title: 'Designing Personalized Tasks',
      message: `Now creating tasks that align with your cognitive functions and decision-making style. This will feel natural to you...`,
      icon: <MapPin className="h-5 w-5" />,
      duration: 3500
    },
    {
      id: 'finalizing',
      title: 'Preparing Your Journey',
      message: `Almost ready! I'm preparing your complete roadmap with blueprint insights and optimal timing suggestions...`,
      icon: <Sparkles className="h-5 w-5" />,
      duration: 2500
    }
  ], [dreamTitle, userType, decomposeWithSoul]);

  // Safe currentStage access with fallback
  const currentStage = stages[currentStageIndex] || stages[0];

  // Dedicated completion effect that watches for decomposedGoal updates
  useEffect(() => {
    console.log('🔍 Completion watch effect triggered:', {
      allStagesCompleted,
      hasDecomposedGoal: !!decomposedGoal,
      decomposedGoalId: decomposedGoal?.id,
      error
    });

    // Only proceed if all stages are completed, we have a goal, and no error
    if (allStagesCompleted && decomposedGoal && !error) {
      console.log('🎉 All conditions met for completion - proceeding with final steps');
      
      setTimeout(() => {
        speak("Your personalized journey is ready! Let me show you what we've created together...");
        setTimeout(() => {
          console.log('🚀 Completing with decomposed goal:', decomposedGoal);
          onComplete(decomposedGoal);
        }, 2000);
      }, 1000);
    } else if (allStagesCompleted && !decomposedGoal && !error) {
      // This shouldn't happen but let's handle it gracefully
      console.error('❌ All stages completed but no decomposed goal available');
      setError('Failed to create goal - no result from Soul decomposition');
    }
  }, [allStagesCompleted, decomposedGoal, error, speak, onComplete]);

  // Main stage processing effect (without completion logic)
  useEffect(() => {
    if (currentStageIndex >= stages.length || error) {
      return; // Don't process if we're done or have an error
    }

    const stage = stages[currentStageIndex];
    
    console.log(`🚀 Processing stage ${currentStageIndex}: ${stage.title}`, {
      hasAction: !!stage.action,
      actionExecuted,
      timestamp: Date.now()
    });
    
    // Speak the current stage message
    speak(stage.message);
    
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const stageProgress = ((currentStageIndex * 100) + (prev % 100)) / stages.length;
        return Math.min(stageProgress + 2, ((currentStageIndex + 1) * 100) / stages.length);
      });
    }, 100);

    // Execute stage action and move to next stage
    const stageTimer = setTimeout(async () => {
      try {
        // Execute stage action if it exists and hasn't been executed yet
        if (stage.action && !actionExecuted) {
          console.log(`🎯 Executing action for stage: ${stage.title}`);
          setActionExecuted(true);
          
          const actionStartTime = Date.now();
          await stage.action();
          const actionEndTime = Date.now();
          
          console.log(`✅ Stage action completed: ${stage.title}`, {
            duration: actionEndTime - actionStartTime,
            timestamp: actionEndTime
          });
        }
        
        // Mark stage as completed
        setCompletedStages(prev => {
          if (!prev.includes(stage.id)) {
            return [...prev, stage.id];
          }
          return prev;
        });
        
        // Move to next stage or mark all stages complete
        if (currentStageIndex < stages.length - 1) {
          console.log(`⏭️ Moving to next stage: ${currentStageIndex + 1}`);
          setCurrentStageIndex(prev => prev + 1);
          setActionExecuted(false); // Reset for next stage
        } else {
          // All stages complete - set flag for completion watch
          console.log('🏁 All stages completed - setting completion flag');
          setAllStagesCompleted(true);
        }
      } catch (stageError) {
        console.error(`❌ Error in stage ${stage.title}:`, {
          error: stageError instanceof Error ? stageError.message : 'Unknown error',
          stageIndex: currentStageIndex
        });
        
        const errorMessage = stageError instanceof Error ? stageError.message : 'Stage execution failed';
        setError(errorMessage);
        
        toast({
          title: "Dream Creation Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    }, stage.duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stageTimer);
    };
  }, [currentStageIndex, speak, stages, toast, error, actionExecuted]);

  return {
    speaking,
    currentStage,
    currentStageIndex,
    progress,
    completedStages,
    error,
    stages,
    getUserType: () => userType
  };
};
