
import React, { useState } from "react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Target, 
  Star, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Brain,
  Heart,
  Zap
} from "lucide-react";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
import { useBlueprintData } from "@/hooks/use-blueprint-data";

interface JourneyMapProps {
  onTaskClick?: (taskId: string) => void;
  onMilestoneClick?: (milestoneId: string) => void;
}

export const JourneyMap: React.FC<JourneyMapProps> = ({ onTaskClick, onMilestoneClick }) => {
  const { productivityJourney } = useJourneyTracking();
  const { blueprintData } = useBlueprintData();
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed'>('overview');
  
  const currentGoals = (productivityJourney?.current_goals || []) as any[];
  const mainGoal = currentGoals[0]; // Focus on primary goal for journey map
  
  if (!mainGoal) {
    return (
      <CosmicCard className="p-8 text-center">
        <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Start Your Dream Journey</h3>
        <p className="text-muted-foreground mb-6">
          Define your first dream or goal to see your personalized journey map
        </p>
        <Button className="bg-soul-purple hover:bg-soul-purple/90">
          <Sparkles className="h-4 w-4 mr-2" />
          Create Your First Dream
        </Button>
      </CosmicCard>
    );
  }

  const completedMilestones = mainGoal.milestones?.filter((m: any) => m.completed) || [];
  const totalMilestones = mainGoal.milestones?.length || 0;
  const progress = totalMilestones > 0 ? Math.round((completedMilestones.length / totalMilestones) * 100) : 0;
  
  const currentMilestone = mainGoal.milestones?.find((m: any) => !m.completed);
  const nextTasks = mainGoal.tasks?.filter((t: any) => !t.completed).slice(0, 3) || [];

  const getBlueprintInsight = () => {
    if (!blueprintData) return "Your journey is uniquely yours";
    
    const traits = [];
    if (blueprintData.cognition_mbti?.type) traits.push(blueprintData.cognition_mbti.type);
    if (blueprintData.energy_strategy_human_design?.type) traits.push(blueprintData.energy_strategy_human_design.type);
    if (blueprintData.values_life_path?.lifePathNumber) traits.push(`Life Path ${blueprintData.values_life_path.lifePathNumber}`);
    
    return `This journey aligns with your ${traits.slice(0, 2).join(' & ')} nature`;
  };

  return (
    <div className="space-y-6">
      {/* Journey Header */}
      <CosmicCard className="p-6 bg-gradient-to-r from-soul-purple/10 to-blue-500/10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2 flex items-center">
              <Heart className="h-6 w-6 mr-2 text-soul-purple" />
              {mainGoal.title}
            </h2>
            <p className="text-muted-foreground mb-3">{mainGoal.description}</p>
            <p className="text-sm text-soul-purple font-medium">{getBlueprintInsight()}</p>
          </div>
          
          <div className="text-right ml-4">
            <div className="text-3xl font-bold text-soul-purple mb-1">{progress}%</div>
            <div className="text-sm text-muted-foreground">Complete</div>
          </div>
        </div>
        
        <Progress value={progress} className="h-3 mb-4" />
        
        <div className="flex gap-2">
          <Button
            variant={selectedView === 'overview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('overview')}
          >
            Helicopter View
          </Button>
          <Button
            variant={selectedView === 'detailed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('detailed')}
          >
            Detailed Path
          </Button>
        </div>
      </CosmicCard>

      {selectedView === 'overview' ? (
        /* Journey Overview Map */
        <CosmicCard className="p-6">
          <h3 className="font-semibold mb-6 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Your Journey at a Glance
          </h3>
          
          <div className="relative">
            {/* Journey Path */}
            <div className="flex flex-col space-y-8">
              {/* Dream Destination */}
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-green-800">Dream Achieved!</h4>
                  <p className="text-sm text-green-600">{mainGoal.title}</p>
                </div>
              </div>
              
              {/* Milestones */}
              {mainGoal.milestones?.map((milestone: any, index: number) => {
                const isCompleted = milestone.completed;
                const isCurrent = !isCompleted && index === completedMilestones.length;
                
                return (
                  <div key={milestone.id} className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-soul-purple text-white' : 
                      isCurrent ? 'bg-blue-500 text-white animate-pulse' : 
                      'bg-gray-200 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : isCurrent ? (
                        <Star className="h-5 w-5" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-current" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h5 className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                        {milestone.title}
                      </h5>
                      {isCurrent && (
                        <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-600">
                          <MapPin className="h-3 w-3 mr-1" />
                          You are here
                        </Badge>
                      )}
                    </div>
                    {isCurrent && (
                      <Button
                        size="sm"
                        onClick={() => onMilestoneClick?.(milestone.id)}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        Focus Here
                      </Button>
                    )}
                  </div>
                );
              })}
              
              {/* Starting Point */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-600">Journey Started</h5>
                  <p className="text-sm text-gray-500">Your dream begins here</p>
                </div>
              </div>
            </div>
          </div>
        </CosmicCard>
      ) : (
        /* Detailed View */
        <div className="space-y-6">
          {/* Current Focus */}
          {currentMilestone && (
            <CosmicCard className="p-6 border-blue-200">
              <h3 className="font-semibold mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-blue-500" />
                Current Milestone
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-blue-800 mb-2">{currentMilestone.title}</h4>
                <p className="text-sm text-blue-600">{currentMilestone.description}</p>
              </div>
            </CosmicCard>
          )}
          
          {/* Next Soul Steps */}
          <CosmicCard className="p-6">
            <h3 className="font-semibold mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-soul-purple" />
              Your Next Soul Steps
            </h3>
            <div className="space-y-3">
              {nextTasks.map((task: any, index: number) => (
                <div
                  key={task.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-secondary/20 cursor-pointer transition-colors"
                  onClick={() => onTaskClick?.(task.id)}
                >
                  <div className="w-8 h-8 bg-soul-purple/20 rounded-full flex items-center justify-center text-soul-purple font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium">{task.title}</h5>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {task.estimated_duration}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {task.energy_level_required} energy
                      </Badge>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CosmicCard>
          
          {/* Blueprint Alignment */}
          {mainGoal.blueprint_alignment?.length > 0 && (
            <CosmicCard className="p-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <Brain className="h-5 w-5 mr-2 text-green-500" />
                Soul Alignment
              </h3>
              <div className="flex flex-wrap gap-2">
                {mainGoal.blueprint_alignment.map((trait: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Star className="h-3 w-3 mr-1" />
                    {trait}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                This journey honors your authentic self and natural strengths
              </p>
            </CosmicCard>
          )}
        </div>
      )}
    </div>
  );
};
