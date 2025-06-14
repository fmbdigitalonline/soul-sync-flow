import React, { useState, useEffect } from 'react';
import { SoulOrb } from '@/components/ui/soul-orb';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSoulOrb } from '@/contexts/SoulOrbContext';
import { Brain, Target, MapPin, Sparkles, CheckCircle } from 'lucide-react';
import { aiGoalDecompositionService } from '@/services/ai-goal-decomposition-service';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DreamDecompositionPageProps {
  dreamTitle: string;
  dreamDescription?: string;
  dreamCategory?: string;
  dreamTimeframe?: string;
  onComplete: (decomposedGoal: any) => void;
  blueprintData?: any;
}

interface DecompositionStage {
  id: string;
  title: string;
  message: string;
  icon: React.ReactNode;
  duration: number;
  action?: () => Promise<void>;
}

export const DreamDecompositionPage: React.FC<DreamDecompositionPageProps> = ({
  dreamTitle,
  dreamDescription = '',
  dreamCategory = 'personal_growth',
  dreamTimeframe = '3 months',
  onComplete,
  blueprintData
}) => {
  const { speak, speaking } = useSoulOrb();
  const { toast } = useToast();
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [decomposedGoal, setDecomposedGoal] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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

  // AI Goal Decomposition Action
  const decomposeWithAI = async () => {
    try {
      console.log('🤖 Starting AI goal decomposition...');
      
      const aiGoal = await aiGoalDecompositionService.decomposeGoalWithAI(
        dreamTitle,
        dreamDescription,
        dreamTimeframe,
        dreamCategory,
        blueprintData || {}
      );

      console.log('✅ AI goal decomposed successfully:', aiGoal);
      setDecomposedGoal(aiGoal);
      
      // Save to database
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
      
      const { error } = await supabase
        .from('productivity_journey')
        .upsert({
          user_id: user.id,
          current_goals: [goalAsJson],
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Supabase error saving AI goal:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('💾 Goal saved to database successfully');
      
    } catch (error) {
      console.error('❌ Error in AI decomposition:', error);
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

  const currentStage = stages[currentStageIndex];

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
            console.log(`🚀 Executing action for stage: ${stage.title}`);
            await stage.action();
          }
          
          setCompletedStages(prev => [...prev, stage.id]);
          
          if (currentStageIndex < stages.length - 1) {
            setCurrentStageIndex(prev => prev + 1);
          } else {
            // All stages complete - proceed to success page
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
          console.error(`❌ Error in stage ${stage.title}:`, error);
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

  // Show error state if something went wrong
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-soul-purple/10 via-white to-soul-teal/5 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Brain className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Creation Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-soul-purple to-soul-teal text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-soul-purple/10 via-white to-soul-teal/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        
        {/* Soul Orb */}
        <div className="flex justify-center">
          <SoulOrb 
            speaking={speaking}
            stage="generating"
            size="lg"
            pulse={true}
          />
        </div>

        {/* Current Stage Info */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center text-white">
              {currentStage.icon}
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {currentStage.title}
            </h2>
          </div>
          
          <p className="text-gray-600 leading-relaxed px-4">
            {currentStage.message}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <Progress value={progress} className="w-full h-2" />
          <p className="text-sm text-gray-500">
            Step {currentStageIndex + 1} of {stages.length}
          </p>
        </div>

        {/* Stage Progress Indicators */}
        <div className="flex justify-center gap-3">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                completedStages.includes(stage.id)
                  ? 'bg-green-500 text-white'
                  : index === currentStageIndex
                  ? 'bg-soul-purple text-white animate-pulse'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {completedStages.includes(stage.id) ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <span className="text-xs font-medium">{index + 1}</span>
              )}
            </div>
          ))}
        </div>

        {/* Blueprint Insight */}
        {blueprintData && (
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-xs text-soul-purple font-medium">
              🧬 Personalizing for your {getUserType()} nature
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
