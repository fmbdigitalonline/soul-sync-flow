import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useSoulOrb } from '@/contexts/SoulOrbContext';
import { CelebrationHeader } from './CelebrationHeader';
import { GuidedTourPanel } from './GuidedTourPanel';
import { InteractiveJourneyOverview } from './InteractiveJourneyOverview';
import { MilestonesRoadmap } from './MilestonesRoadmap';
import { RecommendedTask } from './RecommendedTask';
import { ActionButtons } from './ActionButtons';
import { MilestoneDetailView } from '@/components/journey/MilestoneDetailView';
import { TimelineDetailView } from '@/components/journey/TimelineDetailView';
import { TaskViews } from '@/components/journey/TaskViews';
import { JourneyFocusMode } from '@/components/journey/JourneyFocusMode';
import { MobileTabs } from './MobileTabs';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';

interface DreamSuccessPageProps {
  goal: any;
  onStartTask: (task: any) => void;
  onViewJourney: () => void;
  onCreateAnother?: () => void; // NEW: Allow creating another dream (Principle #8: Only Add)
}

export const DreamSuccessPage: React.FC<DreamSuccessPageProps> = ({
  goal,
  onStartTask,
  onViewJourney,
  onCreateAnother
}) => {
  const { speak, speaking } = useSoulOrb();
  const { isMobile } = useResponsiveLayout();
  const [tourStep, setTourStep] = useState(0);
  const [showTour, setShowTour] = useState(true);
  const [celebrationComplete, setCelebrationComplete] = useState(false);
  const [currentView, setCurrentView] = useState<'overview' | 'milestones' | 'tasks' | 'timeline'>('overview');
  const [focusedMilestone, setFocusedMilestone] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

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

  const handleNavigateToSection = (section: 'milestones' | 'tasks' | 'timeline') => {
    setCurrentView(section);
    console.log(`🎯 Navigating to ${section} section`);
  };

  const handleBackToOverview = () => {
    setCurrentView('overview');
  };

  const handleMilestoneSelect = (milestone: any) => {
    console.log('🎯 Entering Focus Mode for milestone:', milestone.title);
    setFocusedMilestone(milestone);
    setCurrentView('milestones');
  };

  const handleExitFocus = () => {
    console.log('🎯 Exiting Focus Mode');
    setFocusedMilestone(null);
    setCurrentView('overview');
  };

  const getRecommendedTask = () => {
    return goal.tasks?.[0] || null;
  };

  const currentStep = tourSteps[tourStep];

  // Render different views based on currentView
  if (currentView === 'milestones') {
    // Check if we're in focus mode
    if (focusedMilestone) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-soul-purple/5 via-white to-soul-teal/5 w-full max-w-full overflow-x-hidden">
          <div className="w-full max-w-full mx-auto p-3 sm:p-4 overflow-x-hidden">
            <JourneyFocusMode
              focusedMilestone={focusedMilestone}
              mainGoal={goal}
              onTaskClick={(taskId) => {
                const task = goal.tasks?.find((t: any) => t.id === taskId);
                if (task) onStartTask(task);
              }}
              onExitFocus={handleExitFocus}
            />
          </div>
        </div>
      );
    }
    
    // Regular milestone list view (no focus)
    return (
      <div className="min-h-screen w-full max-w-full overflow-x-hidden">
        <MilestoneDetailView
          milestones={goal.milestones || []}
          onBack={handleBackToOverview}
          onMilestoneSelect={handleMilestoneSelect}
        />
      </div>
    );
  }

  if (currentView === 'tasks') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-soul-purple/5 via-white to-soul-teal/5 w-full max-w-full overflow-x-hidden">
        <div className="w-full max-w-full mx-auto p-3 sm:p-4 overflow-x-hidden">
          <TaskViews
            focusedMilestone={null}
            onBackToJourney={handleBackToOverview}
            onTaskSelect={onStartTask}
          />
        </div>
      </div>
    );
  }

  if (currentView === 'timeline') {
    return (
      <div className="min-h-screen w-full max-w-full overflow-x-hidden">
        <TimelineDetailView
          goal={goal}
          milestones={goal.milestones || []}
          onBack={handleBackToOverview}
        />
      </div>
    );
  }

  // Default overview view with mobile-optimized interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-soul-purple/5 via-white to-soul-teal/5 w-full max-w-full overflow-x-hidden">
      <div className="w-full max-w-full mx-auto p-3 sm:p-4 space-y-4 sm:space-y-6 overflow-x-hidden">
        
        <CelebrationHeader
          speaking={speaking}
          celebrationComplete={celebrationComplete}
          goalTitle={goal.title}
        />

        <div className="w-full max-w-full overflow-x-hidden">
          <GuidedTourPanel
            showTour={showTour}
            currentStep={currentStep}
            tourStep={tourStep}
            totalSteps={tourSteps.length}
            onNextStep={handleNextTourStep}
            onSkipTour={handleSkipTour}
          />
        </div>

        {/* Use Mobile-Optimized Tabs */}
        <div className="w-full max-w-full overflow-x-hidden">
          <MobileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            milestonesCount={goal.milestones?.length || 0}
          />

          {/* Tab Content */}
          <div className="w-full max-w-full overflow-x-hidden">
            {activeTab === 'overview' && (
              <InteractiveJourneyOverview
                milestonesCount={goal.milestones?.length || 0}
                tasksCount={goal.tasks?.length || 0}
                timeframe={goal.timeframe}
                isHighlighted={currentStep?.highlight === 'overview'}
                onNavigateToSection={handleNavigateToSection}
              />
            )}

            {activeTab === 'roadmap' && (
              <MilestonesRoadmap
                milestones={goal.milestones || []}
                isHighlighted={currentStep?.highlight === 'milestones'}
                onMilestoneClick={handleMilestoneSelect}
              />
            )}

            {activeTab === 'nexttask' && (
              <RecommendedTask
                task={getRecommendedTask()}
                isHighlighted={currentStep?.highlight === 'next-action'}
                onStartTask={onStartTask}
              />
            )}
          </div>
        </div>

        <div className="w-full max-w-full overflow-x-hidden">
          <ActionButtons
            showTour={showTour}
            onViewJourney={onViewJourney}
            onRestartTour={handleRestartTour}
          />
          
          {/* NEW: Option to create another dream (Principle #8: Only Add) */}
          {onCreateAnother && (
            <div className="mt-4 pt-4 border-t border-border">
              <Button
                onClick={onCreateAnother}
                variant="outline"
                className="w-full py-4 rounded-xl font-medium transition-all duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Another Dream
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
