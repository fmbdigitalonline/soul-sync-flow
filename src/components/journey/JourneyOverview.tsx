
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Target, 
  Star, 
  CheckCircle2, 
  Calendar,
  Focus
} from "lucide-react";

interface JourneyOverviewProps {
  mainGoal: any;
  completedMilestones: any[];
  onMilestoneClick?: (milestoneId: string) => void;
  onFocusMilestone: (milestone: any) => void;
}

export const JourneyOverview: React.FC<JourneyOverviewProps> = ({
  mainGoal,
  completedMilestones,
  onMilestoneClick,
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
                            onFocusMilestone(milestone);
                          }}
                          className="bg-blue-500 hover:bg-blue-600 ml-3 transition-all duration-200 hover:scale-105"
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
  );
};
