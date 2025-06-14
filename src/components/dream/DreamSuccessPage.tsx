
import React, { useState, useEffect } from 'react';
import { useSoulOrb } from '@/contexts/SoulOrbContext';
import { CelebrationHeader } from './success/CelebrationHeader';
import { GuidedTourPanel } from './success/GuidedTourPanel';
import { JourneyOverview } from './success/JourneyOverview';
import { MilestonesRoadmap } from './success/MilestonesRoadmap';
import { RecommendedTask } from './success/RecommendedTask';
import { ActionButtons } from './success/ActionButtons';

interface DreamSuccessPageProps {
  goal: any;
  onStartTask: (task: any) => void;
  onViewJourney: () => void;
}

export const DreamSuccessPage: React.FC<DreamSuccessPageProps> = ({
  goal,
  onStartTask,
  onViewJourney
}) => {
  const { speak, speaking } = useSoulOrb();
  const [tourStep, setTourStep] = useState(0);
  const [showTour, setShowTour] = useState(true);
  const [celebrationComplete, setCelebrationComplete] = useState(false);

  const tourSteps = [
    {
      message: `🎉 Congratulations! Your "${goal.title}" journey is beautifully designed and ready to unfold. I've created ${goal.milestones?.length || 0} personalized milestones that align perfectly with your soul blueprint.`,
      highlight: 'celebration',
      duration: 4000
    },
    {
      message: `Let me show you your complete roadmap! Each milestone is carefully timed and designed to work with your natural energy patterns and decision-making style.`,
      highlight: 'overview',
      duration: 3500
    },
    {
      message: `Here are your upcoming milestones. Notice how they're sequenced to build momentum and honor your ${getPersonalityInsight()} nature.`,
      highlight: 'milestones',
      duration: 4000
    },
    {
      message: `I've also created specific tasks for each milestone. These are optimized for your cognitive style and include blueprint-based reasoning to help you understand why each step matters.`,
      highlight: 'tasks',
      duration: 4500
    },
    {
      message: `Ready to begin? I recommend starting with this first task - it's perfectly aligned with your blueprint and designed to create early momentum. Shall we dive in?`,
      highlight: 'next-action',
      duration: 4000
    }
  ];

  function getPersonalityInsight() {
    return goal.blueprint_insights?.[0] || 'unique';
  }

  useEffect(() => {
    if (showTour && tourStep < tourSteps.length) {
      const currentStep = tourSteps[tourStep];
      
      const timer = setTimeout(() => {
        speak(currentStep.message);
        setCelebrationComplete(true);
      }, tourStep === 0 ? 1000 : 500);

      return () => clearTimeout(timer);
    }
  }, [tourStep, showTour, speak]);

  const handleNextTourStep = () => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep(prev => prev + 1);
    } else {
      setShowTour(false);
    }
  };

  const handleSkipTour = () => {
    setShowTour(false);
    setTourStep(0);
  };

  const handleRestartTour = () => {
    setShowTour(true);
    setTourStep(0);
  };

  const getRecommendedTask = () => {
    return goal.tasks?.[0] || null;
  };

  const currentStep = tourSteps[tourStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-soul-purple/5 via-white to-soul-teal/5 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <CelebrationHeader
          speaking={speaking}
          celebrationComplete={celebrationComplete}
          goalTitle={goal.title}
        />

        <GuidedTourPanel
          showTour={showTour}
          currentStep={currentStep}
          tourStep={tourStep}
          totalSteps={tourSteps.length}
          onNextStep={handleNextTourStep}
          onSkipTour={handleSkipTour}
        />

        <JourneyOverview
          milestonesCount={goal.milestones?.length || 0}
          tasksCount={goal.tasks?.length || 0}
          timeframe={goal.timeframe}
          isHighlighted={currentStep?.highlight === 'overview'}
        />

        <MilestonesRoadmap
          milestones={goal.milestones || []}
          isHighlighted={currentStep?.highlight === 'milestones'}
        />

        <RecommendedTask
          task={getRecommendedTask()}
          isHighlighted={currentStep?.highlight === 'next-action'}
          onStartTask={onStartTask}
        />

        <ActionButtons
          showTour={showTour}
          onViewJourney={onViewJourney}
          onRestartTour={handleRestartTour}
        />
      </div>
    </div>
  );
};
