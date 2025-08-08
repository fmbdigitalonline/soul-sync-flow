
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  ArrowRight, 
  Brain,
  Zap,
  Calendar,
  Focus,
  Target
} from "lucide-react";

interface JourneyDetailedViewProps {
  currentMilestone: any;
  nextTasks: any[];
  mainGoal: any;
  onTaskClick?: (taskId: string) => void;
  onFocusMilestone: (milestone: any) => void;
}

export const JourneyDetailedView: React.FC<JourneyDetailedViewProps> = ({
  currentMilestone,
  nextTasks,
  mainGoal,
  onTaskClick,
  onFocusMilestone
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      {/* Current Focus */}
      {currentMilestone && (
        <div className="p-4 rounded-3xl border border-primary/30 bg-primary/5">
          <h3 className="font-medium mb-3 flex items-center">
            <Star className="h-4 w-4 mr-2 text-primary" />
            Current Milestone Focus
          </h3>
          <div className="bg-card p-3 rounded-2xl border border-border mb-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-foreground mb-2 text-sm">{currentMilestone.title}</h4>
                <p className="text-xs text-muted-foreground mb-3">{currentMilestone.description}</p>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-primary" />
                    <span>Target: {formatDate(currentMilestone.target_date)}</span>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
                    {currentMilestone.completion_criteria?.length || 0} criteria
                  </Badge>
                </div>
              </div>
              <Button
                size="sm"
                variant="default"
                onClick={() => onFocusMilestone(currentMilestone)}
                className="ml-3"
              >
                <Focus className="h-3 w-3 mr-1" />
                Focus
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Next Soul Steps */}
      <div>
          <h3 className="font-medium mb-3 flex items-center">
          <Zap className="h-4 w-4 mr-2 text-primary" />
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
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary font-medium text-xs">
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
            <Brain className="h-4 w-4 mr-2 text-secondary" />
            Soul Blueprint Alignment
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {mainGoal.blueprint_alignment.map((trait: string, index: number) => (
              <div key={index} className="flex items-center p-2 bg-secondary/10 rounded-lg border border-secondary/30">
                <Star className="h-3 w-3 mr-2 text-secondary" />
                <span className="text-xs text-secondary font-medium">{trait}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            ✨ This journey honors your authentic self and natural strengths
          </p>
        </div>
      )}
    </div>
  );
};
