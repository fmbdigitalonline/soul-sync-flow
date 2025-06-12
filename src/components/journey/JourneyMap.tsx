
import React, { useState } from "react";
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
  Zap,
  Eye,
  Calendar,
  Focus
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
      <div className="p-8 text-center">
        <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Active Dream Journey</h3>
        <p className="text-muted-foreground mb-6">
          Create your first dream to see your personalized journey map
        </p>
      </div>
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
    
    return `Optimized for your ${traits.slice(0, 2).join(' & ')} blueprint`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Journey Header */}
      <div className="p-4 bg-gradient-to-r from-soul-purple/10 to-blue-500/10 rounded-lg border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2 flex items-center">
              <Heart className="h-5 w-5 mr-2 text-soul-purple" />
              {mainGoal.title}
            </h2>
            <p className="text-muted-foreground text-sm mb-2">{mainGoal.description}</p>
            <p className="text-xs text-soul-purple font-medium">{getBlueprintInsight()}</p>
          </div>
          
          <div className="text-right ml-4">
            <div className="text-2xl font-bold text-soul-purple mb-1">{progress}%</div>
            <div className="text-xs text-muted-foreground">Complete</div>
          </div>
        </div>
        
        <Progress value={progress} className="h-2 mb-3" />
        
        <div className="flex gap-2">
          <Button
            variant={selectedView === 'overview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('overview')}
            className="flex items-center gap-2"
          >
            <Eye className="h-3 w-3" />
            Overview
          </Button>
          <Button
            variant={selectedView === 'detailed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('detailed')}
            className="flex items-center gap-2"
          >
            <MapPin className="h-3 w-3" />
            Details
          </Button>
        </div>
      </div>

      {selectedView === 'overview' ? (
        /* Journey Overview Map */
        <div>
          <h3 className="font-medium mb-4 flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            Your Journey Path
          </h3>
          
          <div className="relative">
            {/* Journey Path - Vertical Timeline */}
            <div className="relative">
              {/* Connecting Line */}
              <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-gradient-to-b from-soul-purple via-blue-400 to-green-500"></div>
              
              <div className="space-y-6">
                {/* Dream Destination */}
                <div className="flex items-center space-x-3 relative z-10">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 text-sm">🎯 Dream Achieved!</h4>
                    <p className="text-xs text-green-600">{mainGoal.title}</p>
                    <p className="text-xs text-green-500 mt-1">
                      Target: {formatDate(mainGoal.target_completion)}
                    </p>
                  </div>
                </div>
                
                {/* Milestones */}
                {mainGoal.milestones?.map((milestone: any, index: number) => {
                  const isCompleted = milestone.completed;
                  const isCurrent = !isCompleted && index === completedMilestones.length;
                  
                  return (
                    <div key={milestone.id} className="flex items-center space-x-3 relative z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                        isCompleted ? 'bg-soul-purple text-white scale-105' : 
                        isCurrent ? 'bg-blue-500 text-white animate-pulse shadow-lg' : 
                        'bg-gray-200 text-gray-400'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : isCurrent ? (
                          <Star className="h-4 w-4" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-current" />
                        )}
                      </div>
                      <div className="flex-1 p-3 rounded-lg border transition-all duration-300 hover:shadow-md cursor-pointer" 
                           onClick={() => onMilestoneClick?.(milestone.id)}
                           style={{
                             backgroundColor: isCompleted ? '#f8fafc' : isCurrent ? '#dbeafe' : '#f9fafb',
                             borderColor: isCompleted ? '#e2e8f0' : isCurrent ? '#3b82f6' : '#e5e7eb'
                           }}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h5 className={`font-medium text-sm ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                              {milestone.title}
                            </h5>
                            <p className="text-xs text-muted-foreground mt-1">{milestone.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {formatDate(milestone.target_date)}
                              </span>
                              {isCurrent && (
                                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-600 border-blue-200">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  Current
                                </Badge>
                              )}
                            </div>
                          </div>
                          {isCurrent && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMilestoneClick?.(milestone.id);
                              }}
                              className="bg-blue-500 hover:bg-blue-600 ml-3"
                            >
                              <Focus className="h-3 w-3 mr-1" />
                              Focus
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Starting Point */}
                <div className="flex items-center space-x-3 relative z-10">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center shadow-md">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <h5 className="font-medium text-gray-600 text-sm">🚀 Journey Started</h5>
                    <p className="text-xs text-gray-500">Your dream begins here</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(mainGoal.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Detailed View */
        <div className="space-y-4">
          {/* Current Focus */}
          {currentMilestone && (
            <div className="p-4 border-blue-200 bg-blue-50/50 rounded-lg border">
              <h3 className="font-medium mb-3 flex items-center">
                <Star className="h-4 w-4 mr-2 text-blue-500" />
                Current Milestone Focus
              </h3>
              <div className="bg-white p-3 rounded-lg border border-blue-200 mb-3">
                <h4 className="font-medium text-blue-800 mb-2 text-sm">{currentMilestone.title}</h4>
                <p className="text-xs text-blue-600 mb-3">{currentMilestone.description}</p>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-blue-500" />
                    <span>Target: {formatDate(currentMilestone.target_date)}</span>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 text-xs">
                    {currentMilestone.completion_criteria?.length || 0} criteria
                  </Badge>
                </div>
              </div>
            </div>
          )}
          
          {/* Next Soul Steps */}
          <div>
            <h3 className="font-medium mb-3 flex items-center">
              <Zap className="h-4 w-4 mr-2 text-soul-purple" />
              Your Next Steps
            </h3>
            {nextTasks.length > 0 ? (
              <div className="space-y-2">
                {nextTasks.map((task: any, index: number) => (
                  <div
                    key={task.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-secondary/20 cursor-pointer transition-all duration-200 hover:shadow-md"
                    onClick={() => onTaskClick?.(task.id)}
                  >
                    <div className="w-6 h-6 bg-soul-purple/20 rounded-full flex items-center justify-center text-soul-purple font-medium text-xs">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{task.title}</h5>
                      <p className="text-xs text-muted-foreground mb-1">{task.description}</p>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {task.estimated_duration}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {task.energy_level_required}
                        </Badge>
                      </div>
                    </div>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-4 opacity-50" />
                <p className="text-sm">All tasks completed! Time to celebrate this milestone.</p>
              </div>
            )}
          </div>
          
          {/* Blueprint Alignment */}
          {mainGoal.blueprint_alignment?.length > 0 && (
            <div>
              <h3 className="font-medium mb-3 flex items-center">
                <Brain className="h-4 w-4 mr-2 text-green-500" />
                Soul Blueprint Alignment
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {mainGoal.blueprint_alignment.map((trait: string, index: number) => (
                  <div key={index} className="flex items-center p-2 bg-green-50 rounded-lg border border-green-200">
                    <Star className="h-3 w-3 mr-2 text-green-600" />
                    <span className="text-xs text-green-800 font-medium">{trait}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                ✨ This journey honors your authentic self and natural strengths
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
