
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Heart, Sparkles, Target, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { LifeDomain } from '@/types/growth-program';
import { useLanguage } from '@/contexts/LanguageContext';

interface GenerationStage {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  duration: number;
}

const generationStages: GenerationStage[] = [
  {
    id: 'analyzing',
    title: 'Analyzing Your Insights',
    description: 'Processing your beliefs and growth area preferences...',
    icon: Sparkles,
    duration: 3000
  },
  {
    id: 'blueprint',
    title: 'Creating Your Blueprint',
    description: 'Designing a personalized growth framework just for you...',
    icon: Target,
    duration: 4000
  },
  {
    id: 'program',
    title: 'Building Your Program',
    description: 'Crafting weekly themes, activities, and milestones...',
    icon: Calendar,
    duration: 3500
  },
  {
    id: 'finalizing',
    title: 'Finalizing Details',
    description: 'Adding the finishing touches to your growth journey...',
    icon: Heart,
    duration: 2000
  }
];

interface GrowthProgramGenerationProps {
  domain: LifeDomain;
  beliefData: any;
  onComplete: () => void;
  error?: string;
}

export const GrowthProgramGeneration: React.FC<GrowthProgramGenerationProps> = ({
  domain,
  beliefData,
  onComplete,
  error
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const domainEmoji = {
    career: '🏢',
    relationships: '💕',
    wellbeing: '🌱',
    finances: '💰',
    creativity: '🎨',
    spirituality: '✨',
    home_family: '🏠'
  };

  const { t } = useLanguage();
  
  const domainTitle = {
    career: t('growth.domains.career.title'),
    relationships: t('growth.domains.relationships.title'),
    wellbeing: t('growth.domains.wellbeing.title'),
    finances: t('growth.domains.finances.title'),
    creativity: t('growth.domains.creativity.title'),
    spirituality: t('growth.domains.spirituality.title'),
    home_family: t('growth.domains.home_family.title')
  };

  useEffect(() => {
    if (error || isComplete) return;

    const currentStage = generationStages[currentStageIndex];
    if (!currentStage) {
      setIsComplete(true);
      return;
    }

    const timer = setTimeout(() => {
      if (currentStageIndex < generationStages.length - 1) {
        setCurrentStageIndex(prev => prev + 1);
        setProgress(prev => prev + (100 / generationStages.length));
      } else {
        setIsComplete(true);
        setProgress(100);
      }
    }, currentStage.duration);

    return () => clearTimeout(timer);
  }, [currentStageIndex, error, isComplete]);

  const handleComplete = () => {
    onComplete();
  };

  if (error) {
    return (
      <div className="p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Generation Failed</h2>
          <p className="text-muted-foreground">
            There was an issue creating your growth program. Please try again.
          </p>
        </div>
        
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold gradient-text mb-2">
            Your Growth Program is Ready!
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your personalized {domainTitle[domain]} program has been created. 
            You're ready to begin your transformation journey.
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-soul-purple/10 to-soul-teal/10 rounded-lg p-6 max-w-md mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="text-3xl">{domainEmoji[domain]}</div>
            <div className="text-left">
              <h3 className="font-semibold">{domainTitle[domain]} Program</h3>
              <p className="text-sm text-muted-foreground">
                Tailored to your unique insights and goals
              </p>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleComplete}
          className="bg-soul-purple hover:bg-soul-purple/90 text-white px-8 py-3"
          size="lg"
        >
          Enter Growth Mode
        </Button>
      </div>
    );
  }

  const currentStage = generationStages[currentStageIndex];
  const CurrentIcon = currentStage?.icon || Sparkles;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center mx-auto">
          <Heart className="h-8 w-8 text-white" />
        </div>
        
        <div>
          <h1 className="text-2xl font-bold gradient-text mb-2">
            Creating Your Growth Program
          </h1>
          <p className="text-muted-foreground">
            Designing a personalized {domainTitle[domain]} journey just for you
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-md mx-auto space-y-4">
        <Progress value={progress} className="h-2" />
        <p className="text-center text-sm text-muted-foreground">
          {Math.round(progress)}% complete
        </p>
      </div>

      {/* Current Stage */}
      <Card className="max-w-lg mx-auto">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-12 h-12 bg-soul-purple/10 rounded-full flex items-center justify-center mx-auto">
            <CurrentIcon className="h-6 w-6 text-soul-purple animate-pulse" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">{currentStage?.title}</h3>
            <p className="text-muted-foreground">{currentStage?.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Stage List */}
      <div className="max-w-lg mx-auto space-y-2">
        {generationStages.map((stage, index) => {
          const StageIcon = stage.icon;
          const isActive = index === currentStageIndex;
          const isCompleted = index < currentStageIndex;
          
          return (
            <div 
              key={stage.id}
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                isActive ? 'bg-soul-purple/10' : isCompleted ? 'bg-green-50' : 'bg-gray-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted ? 'bg-green-100' : isActive ? 'bg-soul-purple/20' : 'bg-gray-200'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <StageIcon className={`h-4 w-4 ${
                    isActive ? 'text-soul-purple' : 'text-gray-500'
                  }`} />
                )}
              </div>
              
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  isActive ? 'text-soul-purple' : isCompleted ? 'text-green-700' : 'text-gray-600'
                }`}>
                  {stage.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
