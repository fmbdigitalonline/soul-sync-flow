
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SoulOrb } from '@/components/ui/soul-orb';
import { Badge } from '@/components/ui/badge';
import { useSoulOrb } from '@/contexts/SoulOrbContext';
import { Target, Calendar, MapPin, ArrowRight, Play, Clock, CheckCircle } from 'lucide-react';

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

  const tourSteps = [
    {
      message: `🎉 Amazing! Your "${goal.title}" journey is ready! I've created ${goal.milestones?.length || 0} personalized milestones just for you.`,
      highlight: 'overview'
    },
    {
      message: `Each milestone is designed to match your natural energy and decision-making style. Let me show you what's coming up first...`,
      highlight: 'milestones'
    },
    {
      message: `I've also created specific tasks for each milestone. These are optimized for your cognitive functions and working style.`,
      highlight: 'tasks'
    },
    {
      message: `Ready to begin? I recommend starting with this first task - it's perfectly aligned with your blueprint!`,
      highlight: 'next-action'
    }
  ];

  useEffect(() => {
    if (showTour && tourStep < tourSteps.length) {
      const timer = setTimeout(() => {
        speak(tourSteps[tourStep].message);
      }, 1000);

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

  const getRecommendedTask = () => {
    return goal.tasks?.[0] || null;
  };

  const formatDuration = (duration: string) => {
    return duration || '30 min';
  };

  const getEnergyColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-soul-purple/5 via-white to-soul-teal/5 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header with Soul Orb */}
        <div className="text-center space-y-4">
          <SoulOrb 
            speaking={speaking}
            stage="complete"
            size="md"
            pulse={true}
          />
          
          <div>
            <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-soul-purple to-soul-teal bg-clip-text text-transparent">
              🎯 Your Dream Journey is Ready!
            </h1>
            <p className="text-gray-600">
              I've created a personalized roadmap for "{goal.title}"
            </p>
          </div>
        </div>

        {/* Tour Navigation */}
        {showTour && (
          <div className="bg-soul-purple/10 backdrop-blur-sm rounded-xl p-4 border border-soul-purple/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-soul-purple rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {tourStep + 1}
                </div>
                <p className="text-sm text-gray-700">
                  Step {tourStep + 1} of {tourSteps.length} - Getting oriented
                </p>
              </div>
              <Button 
                onClick={handleNextTourStep}
                size="sm"
                className="bg-soul-purple hover:bg-soul-purple/90"
              >
                {tourStep < tourSteps.length - 1 ? 'Next' : 'Got it!'}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Journey Overview */}
        <div className={`bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 transition-all duration-300 ${
          tourSteps[tourStep]?.highlight === 'overview' ? 'ring-2 ring-soul-purple shadow-soul-purple/20' : ''
        }`}>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-soul-purple to-soul-teal rounded-xl flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Milestones</h3>
              <p className="text-2xl font-bold text-soul-purple">{goal.milestones?.length || 0}</p>
              <p className="text-xs text-gray-500">Key phases</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-soul-teal to-soul-blue rounded-xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Tasks</h3>
              <p className="text-2xl font-bold text-soul-teal">{goal.tasks?.length || 0}</p>
              <p className="text-xs text-gray-500">Action steps</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-soul-blue to-soul-purple rounded-xl flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Timeline</h3>
              <p className="text-2xl font-bold text-soul-blue">{goal.timeframe}</p>
              <p className="text-xs text-gray-500">To completion</p>
            </div>
          </div>
        </div>

        {/* Milestones Preview */}
        <div className={`bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 transition-all duration-300 ${
          tourSteps[tourStep]?.highlight === 'milestones' ? 'ring-2 ring-soul-purple shadow-soul-purple/20' : ''
        }`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-soul-purple" />
            Your Milestone Roadmap
          </h3>
          
          <div className="space-y-3">
            {goal.milestones?.slice(0, 3).map((milestone: any, index: number) => (
              <div key={milestone.id} className="flex items-center gap-4 p-3 bg-gradient-to-r from-soul-purple/5 to-transparent rounded-lg">
                <div className="w-8 h-8 bg-soul-purple/20 rounded-full flex items-center justify-center text-soul-purple text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{milestone.title}</h4>
                  <p className="text-sm text-gray-600 truncate">{milestone.description}</p>
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

        {/* Recommended Next Action */}
        {getRecommendedTask() && (
          <div className={`bg-gradient-to-br from-soul-purple/10 to-soul-teal/5 rounded-2xl p-6 border border-soul-purple/20 transition-all duration-300 ${
            tourSteps[tourStep]?.highlight === 'next-action' ? 'ring-2 ring-soul-purple shadow-soul-purple/20' : ''
          }`}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-soul-purple to-soul-teal rounded-xl flex items-center justify-center flex-shrink-0">
                <Play className="h-6 w-6 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">
                  🎯 Perfect First Task for You
                </h3>
                <h4 className="font-medium text-gray-800 mb-2">
                  {getRecommendedTask().title}
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  {getRecommendedTask().description}
                </p>
                
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(getRecommendedTask().estimated_duration)}
                  </Badge>
                  <Badge className={getEnergyColor(getRecommendedTask().energy_level_required)}>
                    {getRecommendedTask().energy_level_required} energy
                  </Badge>
                </div>
                
                <p className="text-xs text-soul-purple bg-soul-purple/10 rounded-lg p-2 mb-4">
                  💡 {getRecommendedTask().blueprint_reasoning}
                </p>
                
                <Button 
                  onClick={() => onStartTask(getRecommendedTask())}
                  className="bg-gradient-to-r from-soul-purple to-soul-teal hover:shadow-lg text-white"
                >
                  Start This Task
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={onViewJourney}
            variant="outline"
            className="flex items-center gap-2 border-soul-purple/30 hover:bg-soul-purple/5"
          >
            <MapPin className="h-4 w-4" />
            View Complete Journey
          </Button>
          
          {!showTour && (
            <Button 
              onClick={() => { setShowTour(true); setTourStep(0); }}
              variant="ghost"
              size="sm"
              className="text-soul-purple hover:bg-soul-purple/10"
            >
              Take Tour Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
