
import React, { useState, useEffect } from 'react';
import { SoulOrb } from '@/components/ui/soul-orb';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSoulOrb } from '@/contexts/SoulOrbContext';
import { Brain, Target, MapPin, Sparkles, CheckCircle } from 'lucide-react';

interface DreamDecompositionPageProps {
  dreamTitle: string;
  onComplete: () => void;
  blueprintData?: any;
}

interface DecompositionStage {
  id: string;
  title: string;
  message: string;
  icon: React.ReactNode;
  duration: number;
}

export const DreamDecompositionPage: React.FC<DreamDecompositionPageProps> = ({
  dreamTitle,
  onComplete,
  blueprintData
}) => {
  const { speak, speaking } = useSoulOrb();
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completedStages, setCompletedStages] = useState<string[]>([]);

  // Get user type for personalization
  const getUserType = () => {
    if (!blueprintData) return '';
    const mbti = blueprintData?.cognition_mbti?.type;
    const hdType = blueprintData?.energy_strategy_human_design?.type;
    return mbti || hdType || 'unique design';
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
      duration: 4000
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

      // Move to next stage after duration
      const stageTimer = setTimeout(() => {
        setCompletedStages(prev => [...prev, stage.id]);
        
        if (currentStageIndex < stages.length - 1) {
          setCurrentStageIndex(prev => prev + 1);
        } else {
          // All stages complete
          setTimeout(() => {
            speak("Your personalized journey is ready! Let me show you what we've created together...");
            setTimeout(onComplete, 2000);
          }, 1000);
        }
      }, stage.duration);

      return () => {
        clearInterval(progressInterval);
        clearTimeout(stageTimer);
      };
    }
  }, [currentStageIndex, speak, onComplete]);

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
