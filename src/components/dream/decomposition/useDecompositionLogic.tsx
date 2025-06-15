
import { useState, useEffect } from 'react';
import { useSoulOrb } from '@/contexts/SoulOrbContext';
import { aiGoalDecompositionService } from '@/services/ai-goal-decomposition-service';
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
  const [processingStartTime] = useState(Date.now());
  const [aiProcessingTime, setAiProcessingTime] = useState<number | null>(null);

  // Get user type for personalization
  const getUserType = () => {
    console.log('🎯 Getting user type from blueprint data:', blueprintData);
    
    if (!blueprintData) {
      console.log('❌ No blueprint data available');
      return 'powerful soul';
    }
    
    const mbti = blueprintData?.cognition_mbti?.type;
    const hdType = blueprintData?.energy_strategy_human_design?.type;
    
    console.log('🔍 MBTI type found:', mbti);
    console.log('🔍 Human Design type found:', hdType);
    
    // Return the first available type with better fallbacks
    if (mbti && mbti !== 'Unknown') return mbti;
    if (hdType && hdType !== 'Unknown' && hdType !== 'Generator') return hdType;
    
    // Improved fallback based on available data
    if (blueprintData?.archetype_western?.sun_sign && blueprintData.archetype_western.sun_sign !== 'Unknown') {
      return `${blueprintData.archetype_western.sun_sign} soul`;
    }
    
    return 'unique soul';
  };

  // Enhanced AI Goal Decomposition with timeout and better error handling
  const decomposeWithAI = async () => {
    const aiStartTime = Date.now();
    console.log('🤖 Starting AI goal decomposition...', {
      dreamTitle,
      dreamDescription,
      dreamCategory,
      dreamTimeframe,
      timestamp: aiStartTime
    });
    
    try {
      // Set a timeout for the AI decomposition (2 minutes max)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('AI decomposition timeout after 2 minutes')), 120000);
      });

      const decompositionPromise = aiGoalDecompositionService.decomposeGoalWithAI(
        dreamTitle,
        dreamDescription,
        dreamTimeframe,
        dreamCategory,
        blueprintData || {}
      );

      // Race between the actual call and timeout
      const aiGoal = await Promise.race([decompositionPromise, timeoutPromise]);

      const aiEndTime = Date.now();
      const aiDuration = aiEndTime - aiStartTime;
      setAiProcessingTime(aiDuration);
      
      console.log('✅ AI goal decomposed successfully:', {
        goal: aiGoal,
        processingTime: aiDuration,
        timestamp: aiEndTime
      });
      
      setDecomposedGoal(aiGoal);
      
      // Save to database with error handling
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        const goalAsJson = {
          id: aiGoal.id,
          title: aiGoal.title,
          description: aiGoal.description,
          category: aiGoal.category,
          timeframe: aiGoal.timeframe,
          target_completion: aiGoal.target_completion,
          created_at: aiGoal.created_at,
          milestones: (aiGoal.milestones || []).map(milestone => ({
            id: milestone.id,
            title: milestone.title,
            description: milestone.description,
            target_date: milestone.target_date,
            completed: milestone.completed || false,
            completion_criteria: milestone.completion_criteria || [],
            blueprint_alignment: milestone.blueprint_alignment
          })),
          tasks: (aiGoal.tasks || []).map(task => ({
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
          blueprint_insights: aiGoal.blueprint_insights || [],
          personalization_notes: aiGoal.personalization_notes
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
          console.error('Supabase error saving AI goal:', dbError);
          // Don't throw here - goal was created successfully, just db save failed
          console.warn('Goal created but database save failed - continuing with success flow');
        } else {
          console.log('💾 Goal saved to database successfully');
        }
        
      } catch (dbError) {
        console.error('❌ Database save error (continuing anyway):', dbError);
        // Don't fail the entire flow for database issues
      }
      
    } catch (error) {
      const aiEndTime = Date.now();
      const aiDuration = aiEndTime - aiStartTime;
      setAiProcessingTime(aiDuration);
      
      console.error('❌ Error in AI decomposition:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: aiDuration,
        timestamp: aiEndTime
      });
      
      setError(error instanceof Error ? error.message : 'AI decomposition failed');
      throw error;
    }
  };

  const stages: DecompositionStage[] = [
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
      message: `I'm identifying the perfect milestones for your ${getUserType()} energy. Each one will honor your natural rhythm...`,
      icon: <Target className="h-5 w-5" />,
      duration: 4000,
      action: decomposeWithAI // This is where the AI magic happens
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
  ];

  // Safe currentStage access with fallback
  const currentStage = stages[currentStageIndex] || stages[0];

  useEffect(() => {
    if (currentStageIndex < stages.length) {
      const stage = stages[currentStageIndex];
      
      // Speak the current stage message
      speak(stage.message);
      
      // Progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const stageProgress = ((currentStageIndex * 100) + (prev % 100)) / stages.length;
          return Math.min(stageProgress + 2, ((currentStageIndex + 1) * 100) / stages.length);
        });
      }, 100);

      // Execute stage action (like AI decomposition) and move to next stage
      const stageTimer = setTimeout(async () => {
        try {
          // Execute stage action if it exists (like AI decomposition)
          if (stage.action) {
            const actionStartTime = Date.now();
            console.log(`🚀 Executing action for stage: ${stage.title}`, {
              stageIndex: currentStageIndex,
              timestamp: actionStartTime
            });
            
            await stage.action();
            
            const actionEndTime = Date.now();
            console.log(`✅ Stage action completed: ${stage.title}`, {
              duration: actionEndTime - actionStartTime,
              timestamp: actionEndTime
            });
          }
          
          setCompletedStages(prev => [...prev, stage.id]);
          
          if (currentStageIndex < stages.length - 1) {
            setCurrentStageIndex(prev => prev + 1);
          } else {
            // All stages complete - proceed to success page
            const totalTime = Date.now() - processingStartTime;
            console.log('🎉 All stages completed', {
              totalProcessingTime: totalTime,
              aiProcessingTime,
              timestamp: Date.now()
            });
            
            setTimeout(() => {
              speak("Your personalized journey is ready! Let me show you what we've created together...");
              setTimeout(() => {
                if (decomposedGoal) {
                  onComplete(decomposedGoal);
                } else {
                  console.error('❌ No decomposed goal available');
                  setError('Failed to create goal');
                }
              }, 2000);
            }, 1000);
          }
        } catch (error) {
          const totalTime = Date.now() - processingStartTime;
          console.error(`❌ Error in stage ${stage.title}:`, {
            error: error instanceof Error ? error.message : 'Unknown error',
            stageIndex: currentStageIndex,
            totalTime,
            aiProcessingTime,
            timestamp: Date.now()
          });
          
          setError(error instanceof Error ? error.message : 'Stage execution failed');
          
          toast({
            title: "Dream Creation Error",
            description: error instanceof Error ? error.message : "Failed to create your dream journey. Please try again.",
            variant: "destructive"
          });
        }
      }, stage.duration);

      return () => {
        clearInterval(progressInterval);
        clearTimeout(stageTimer);
      };
    }
  }, [currentStageIndex, speak, onComplete, decomposedGoal]);

  return {
    speaking,
    currentStage,
    currentStageIndex,
    progress,
    completedStages,
    error,
    stages,
    getUserType,
    processingStartTime,
    aiProcessingTime
  };
};
