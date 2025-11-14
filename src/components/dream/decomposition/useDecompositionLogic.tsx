
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSoulOrb } from '@/contexts/SoulOrbContext';
import { soulGoalDecompositionService, SoulGeneratedGoal } from '@/services/soul-goal-decomposition-service';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Brain, Target, MapPin, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [decomposedGoal, setDecomposedGoal] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionExecuted, setActionExecuted] = useState(false);
  const [allStagesCompleted, setAllStagesCompleted] = useState(false);
  const [stageProcessing, setStageProcessing] = useState(false);

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
      
      // Save to user_goals and goal_milestones tables (unified storage)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.warn('⚠️ No user authenticated for database save');
          return; // Continue without database save
        }

        // Save goal to user_goals table
        const { data: newGoalRecord, error: goalError } = await supabase
          .from('user_goals')
          .insert({
            user_id: user.id,
            title: soulGoal.title,
            description: soulGoal.description,
            category: soulGoal.category,
            target_date: soulGoal.target_completion,
            progress: 0,
            aligned_traits: soulGoal.blueprint_insights || [],
            status: 'active'
          })
          .select()
          .single();

        if (goalError) {
          console.error('Goal save error:', goalError);
          console.warn('Goal created but database save failed - continuing with success flow');
          return;
        }

        console.log('💾 Goal saved to user_goals successfully:', newGoalRecord.id);

        // Save milestones to goal_milestones table
        if (soulGoal.milestones && soulGoal.milestones.length > 0) {
          const milestonesData = soulGoal.milestones.map((m: any, index: number) => ({
            goal_id: newGoalRecord.id,
            user_id: user.id,
            title: m.title,
            description: m.description || '',
            order_index: index,
            is_completed: m.completed || false,
            target_date: m.target_date || null
          }));

          const { error: milestonesError } = await supabase
            .from('goal_milestones')
            .insert(milestonesData);

          if (milestonesError) {
            console.error('Milestones save error:', milestonesError);
          } else {
            console.log('💾 Milestones saved successfully:', milestonesData.length);
          }
        }

        // Update the soulGoal object with the real database ID
        soulGoal.id = newGoalRecord.id;

        // SYNC TO PRODUCTIVITY_JOURNEY.CURRENT_GOALS (unified source of truth)
        try {
          const { data: journeyData } = await supabase
            .from('productivity_journey')
            .select('current_goals')
            .eq('user_id', user.id)
            .maybeSingle();

          const currentGoals = Array.isArray(journeyData?.current_goals)
            ? journeyData.current_goals
            : [];

          const newGoalId = String(newGoalRecord.id);
          const sanitizedGoal = {
            ...soulGoal,
            id: newGoalId
          };

          // Remove any existing goal with the same ID before adding the new one
          const dedupedGoals = currentGoals.filter((goal: any) => {
            const existingId = goal?.id || goal?.goal_id;
            return existingId ? String(existingId) !== newGoalId : true;
          });

          // Add newest goal to the front so the latest dream appears first
          const updatedGoals = [sanitizedGoal, ...dedupedGoals] as any;

          if (journeyData) {
            // Update existing journey
            const { error: journeyUpdateError } = await supabase
              .from('productivity_journey')
              .update({ current_goals: updatedGoals })
              .eq('user_id', user.id);

            if (journeyUpdateError) {
              console.error('Journey update error:', journeyUpdateError);
            } else {
              console.log('💾 Goal synced to productivity_journey successfully');
            }
          } else {
            // Create new journey record
            const { error: journeyInsertError } = await supabase
              .from('productivity_journey')
              .insert({
                user_id: user.id,
                current_goals: updatedGoals
              } as any);

            if (journeyInsertError) {
              console.error('Journey insert error:', journeyInsertError);
            } else {
              console.log('💾 New productivity_journey created with goal');
            }
          }
        } catch (journeyError) {
          console.error('❌ Journey sync error (non-fatal):', journeyError);
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
      title: t('decomposition.stages.analyzing'),
      message: `Congratulations on creating "${dreamTitle}"! Let me analyze this through your unique soul blueprint...`,
      icon: <Brain className="h-5 w-5" />,
      duration: 3000
    },
    {
      id: 'milestones',
      title: t('decomposition.stages.creating'),
      message: `I'm identifying the perfect milestones for your ${userType} energy. Each one will honor your natural rhythm...`,
      icon: <Target className="h-5 w-5" />,
      duration: 4000,
      action: decomposeWithSoul
    },
    {
      id: 'tasks',
      title: t('decomposition.stages.designing'),
      message: `Now creating tasks that align with your cognitive functions and decision-making style. This will feel natural to you...`,
      icon: <MapPin className="h-5 w-5" />,
      duration: 3500
    },
    {
      id: 'finalizing',
      title: t('decomposition.stages.preparing'),
      message: `Almost ready! I'm preparing your complete roadmap with blueprint insights and optimal timing suggestions...`,
      icon: <Sparkles className="h-5 w-5" />,
      duration: 2500
    }
  ], [dreamTitle, userType, decomposeWithSoul, t]);

  // Safe currentStage access with fallback
  const currentStage = stages[currentStageIndex] || stages[0];

  // DEDICATED COMPLETION EFFECT - This watches for decomposedGoal updates
  useEffect(() => {
    console.log('🔍 COMPLETION WATCH - State check:', {
      allStagesCompleted,
      hasDecomposedGoal: !!decomposedGoal,
      decomposedGoalId: decomposedGoal?.id,
      error,
      timestamp: Date.now()
    });

    // Only proceed if all stages are completed, we have a goal, and no error
    if (allStagesCompleted && decomposedGoal && !error) {
      console.log('🎉 COMPLETION TRIGGERED - All conditions met, proceeding with final steps');
      
      // Small delay to ensure state is stable, then complete
      const completionTimer = setTimeout(() => {
        console.log('🗣️ Speaking completion message...');
        speak("Your personalized journey is ready! Let me show you what we've created together...");
        
        // Final completion with the goal data
        const finalTimer = setTimeout(() => {
          console.log('🚀 FINAL COMPLETION - Calling onComplete with goal:', decomposedGoal);
          onComplete(decomposedGoal);
        }, 2000);

        return () => clearTimeout(finalTimer);
      }, 1000);

      return () => clearTimeout(completionTimer);
    } else if (allStagesCompleted && !decomposedGoal && !error) {
      // This shouldn't happen but let's handle it gracefully
      console.error('❌ COMPLETION ERROR - All stages completed but no decomposed goal available');
      setError('Failed to create goal - no result from Soul decomposition');
    }
  }, [allStagesCompleted, decomposedGoal, error, speak, onComplete]);

  // MAIN STAGE PROCESSING EFFECT - Fixed dependencies and logic
  useEffect(() => {
    // Prevent infinite loops by checking if we're already processing
    if (stageProcessing || currentStageIndex >= stages.length || error) {
      console.log('🛑 Stage processing stopped:', { 
        currentStageIndex, 
        stagesLength: stages.length, 
        hasError: !!error,
        stageProcessing
      });
      return;
    }

    const stage = stages[currentStageIndex];
    
    console.log(`🚀 STAGE PROCESSING - Stage ${currentStageIndex}: ${stage.title}`, {
      hasAction: !!stage.action,
      actionExecuted,
      timestamp: Date.now()
    });
    
    // Set processing flag to prevent re-entry
    setStageProcessing(true);
    
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
          console.log(`🎯 EXECUTING ACTION - Stage: ${stage.title}`);
          setActionExecuted(true);
          
          const actionStartTime = Date.now();
          await stage.action();
          const actionEndTime = Date.now();
          
          console.log(`✅ ACTION COMPLETED - Stage: ${stage.title}`, {
            duration: actionEndTime - actionStartTime,
            timestamp: actionEndTime
          });
        }
        
        // Mark stage as completed
        setCompletedStages(prev => {
          if (!prev.includes(stage.id)) {
            const newCompleted = [...prev, stage.id];
            console.log(`✅ STAGE COMPLETED - ${stage.id}`, { completedStages: newCompleted });
            return newCompleted;
          }
          return prev;
        });
        
        // Move to next stage or mark all stages complete
        if (currentStageIndex < stages.length - 1) {
          console.log(`⏭️ NEXT STAGE - Moving from ${currentStageIndex} to ${currentStageIndex + 1}`);
          setCurrentStageIndex(prev => prev + 1);
          setActionExecuted(false); // Reset for next stage
          setStageProcessing(false); // Allow next stage to process
        } else {
          // All stages complete - set flag for completion watch
          console.log('🏁 ALL STAGES COMPLETED - Setting completion flag');
          setAllStagesCompleted(true);
          setStageProcessing(false);
        }
      } catch (stageError) {
        console.error(`❌ STAGE EXECUTION ERROR - ${stage.title}:`, {
          errorType: stageError instanceof Error ? stageError.constructor.name : 'Unknown',
          errorMessage: stageError instanceof Error ? stageError.message : String(stageError),
          errorStack: stageError instanceof Error ? stageError.stack : undefined,
          stageIndex: currentStageIndex,
          stageDuration: stage.duration,
          timestamp: new Date().toISOString(),
          context: {
            dreamTitle,
            dreamCategory,
            dreamTimeframe,
            hasBlueprintData: !!blueprintData
          }
        });
        
        const errorMessage = stageError instanceof Error ? stageError.message : 'Stage execution failed';
        setError(errorMessage);
        setStageProcessing(false);
        
        toast({
          title: "Dream Creation Error",
          description: errorMessage,
          variant: "destructive",
          duration: 8000
        });
      }
    }, stage.duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stageTimer);
      setStageProcessing(false);
    };
  }, [currentStageIndex, error]); // Simplified dependencies - only what actually changes

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
