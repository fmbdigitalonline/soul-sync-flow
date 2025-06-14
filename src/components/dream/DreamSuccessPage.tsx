
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SoulOrb } from '@/components/ui/soul-orb';
import { Badge } from '@/components/ui/badge';
import { useSoulOrb } from '@/contexts/SoulOrbContext';
import { Target, Calendar, MapPin, ArrowRight, Play, Clock, CheckCircle, Sparkles } from 'lucide-react';

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
    // This would use blueprint data to personalize the message
    return goal.blueprint_insights?.[0] || 'unique';
  }

  useEffect(() => {
    if (showTour && tourStep < tourSteps.length) {
      const currentStep = tourSteps[tourStep];
      
      const timer = setTimeout(() => {
        speak(currentStep.message);
        setCelebrationComplete(true);
      }, tourStep === 0 ? 1000 : 500); // Longer delay for celebration

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

  const getRecommendedTask = () => {
    return goal.tasks?.[0] || null;
  };

  const formatDuration = (duration: string) => {
    return duration || '30 min';
  };

  const getEnergyColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const currentStep = tourSteps[tourStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-soul-purple/5 via-white to-soul-teal/5 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Celebration Header with Enhanced Soul Orb */}
        <div className="text-center space-y-4">
          <div className="relative">
            <SoulOrb 
              speaking={speaking}
              stage="complete"
              size="lg"
              pulse={true}
            />
            {celebrationComplete && (
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
          
          <div>
            <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-soul-purple to-soul-teal bg-clip-text text-transparent">
              🎯 Your Dream Journey is Ready!
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              I've transformed "{goal.title}" into a personalized, step-by-step roadmap that honors your unique soul blueprint
            </p>
          </div>
        </div>

        {/* Guided Tour Navigation */}
        {showTour && (
          <div className={`transition-all duration-500 ${
            currentStep?.highlight === 'celebration' 
              ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
              : 'bg-soul-purple/10 border-soul-purple/20'
          } backdrop-blur-sm rounded-2xl p-6 border`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-10 h-10 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {tourStep + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800">Soul Coach Guidance</h3>
                    <Badge variant="outline" className="text-xs">
                      Step {tourStep + 1} of {tourSteps.length}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Getting you oriented with your personalized journey...
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button 
                  variant="ghost"
                  onClick={handleSkipTour}
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  Skip Tour
                </Button>
                <Button 
                  onClick={handleNextTourStep}
                  size="sm"
                  className="bg-soul-purple hover:bg-soul-purple/90 text-white"
                >
                  {tourStep < tourSteps.length - 1 ? 'Next' : 'Got it!'}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Journey Overview - Highlighted during tour */}
        <div className={`bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 transition-all duration-500 ${
          currentStep?.highlight === 'overview' ? 'ring-2 ring-soul-purple shadow-soul-purple/20 transform scale-[1.02]' : ''
        }`}>
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Your Complete Journey Overview</h2>
            <p className="text-gray-600">Designed specifically for your blueprint</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-soul-purple to-soul-teal rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-800">Milestones</h3>
              <p className="text-3xl font-bold text-soul-purple mb-1">{goal.milestones?.length || 0}</p>
              <p className="text-xs text-gray-500">Key achievement phases</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-soul-teal to-soul-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-800">Action Tasks</h3>
              <p className="text-3xl font-bold text-soul-teal mb-1">{goal.tasks?.length || 0}</p>
              <p className="text-xs text-gray-500">Blueprint-optimized steps</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-soul-blue to-soul-purple rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-800">Timeline</h3>
              <p className="text-3xl font-bold text-soul-blue mb-1">{goal.timeframe}</p>
              <p className="text-xs text-gray-500">To completion</p>
            </div>
          </div>
        </div>

        {/* Milestones Roadmap - Highlighted during tour */}
        <div className={`bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 transition-all duration-500 ${
          currentStep?.highlight === 'milestones' ? 'ring-2 ring-soul-purple shadow-soul-purple/20 transform scale-[1.02]' : ''
        }`}>
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-3">
            <MapPin className="h-6 w-6 text-soul-purple" />
            Your Milestone Roadmap
            <Badge className="bg-soul-purple/10 text-soul-purple">
              Blueprint Aligned
            </Badge>
          </h3>
          
          <div className="space-y-4">
            {goal.milestones?.slice(0, 3).map((milestone: any, index: number) => (
              <div key={milestone.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-soul-purple/5 to-transparent rounded-xl border border-soul-purple/10">
                <div className="w-10 h-10 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-1">{milestone.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                  {milestone.blueprint_alignment && (
                    <p className="text-xs text-soul-purple bg-soul-purple/10 rounded-lg px-2 py-1 inline-block">
                      💡 {milestone.blueprint_alignment}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  {new Date(milestone.target_date).toLocaleDateString()}
                </Badge>
              </div>
            ))}
            
            {goal.milestones?.length > 3 && (
              <p className="text-sm text-gray-500 text-center">
                +{goal.milestones.length - 3} more milestones in your complete journey
              </p>
            )}
          </div>
        </div>

        {/* Recommended First Task - Highlighted during tour */}
        {getRecommendedTask() && (
          <div className={`bg-gradient-to-br from-soul-purple/10 to-soul-teal/5 rounded-2xl p-6 border border-soul-purple/20 transition-all duration-500 ${
            currentStep?.highlight === 'next-action' ? 'ring-2 ring-soul-purple shadow-soul-purple/20 transform scale-[1.02]' : ''
          }`}>
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-soul-purple to-soul-teal rounded-2xl flex items-center justify-center flex-shrink-0">
                <Play className="h-8 w-8 text-white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-bold text-gray-800">
                    🎯 Perfect First Task for You
                  </h3>
                  <Badge className="bg-gradient-to-r from-soul-purple to-soul-teal text-white">
                    Blueprint Optimized
                  </Badge>
                </div>
                
                <h4 className="font-semibold text-gray-800 mb-2 text-lg">
                  {getRecommendedTask().title}
                </h4>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {getRecommendedTask().description}
                </p>
                
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(getRecommendedTask().estimated_duration)}
                  </Badge>
                  <Badge className={`border ${getEnergyColor(getRecommendedTask().energy_level_required)}`}>
                    {getRecommendedTask().energy_level_required} energy
                  </Badge>
                </div>
                
                {getRecommendedTask().blueprint_reasoning && (
                  <div className="bg-soul-purple/10 rounded-xl p-4 mb-6">
                    <p className="text-sm text-soul-purple font-medium mb-1">
                      💡 Why this task is perfect for you:
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {getRecommendedTask().blueprint_reasoning}
                    </p>
                  </div>
                )}
                
                <Button 
                  onClick={() => onStartTask(getRecommendedTask())}
                  className="bg-gradient-to-r from-soul-purple to-soul-teal hover:shadow-lg text-white text-lg px-8 py-3 rounded-xl font-semibold"
                >
                  Start This Task
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={onViewJourney}
            variant="outline"
            className="flex items-center gap-2 border-soul-purple/30 hover:bg-soul-purple/5 px-6 py-3 rounded-xl"
          >
            <MapPin className="h-4 w-4" />
            View Complete Journey Map
          </Button>
          
          {!showTour && (
            <Button 
              onClick={() => { setShowTour(true); setTourStep(0); }}
              variant="ghost"
              className="text-soul-purple hover:bg-soul-purple/10 px-6 py-3 rounded-xl"
            >
              Take Guided Tour Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
