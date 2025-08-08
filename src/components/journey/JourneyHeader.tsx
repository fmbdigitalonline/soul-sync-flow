
import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, Eye, MapPin } from "lucide-react";

interface JourneyHeaderProps {
  mainGoal: any;
  progress: number;
  getBlueprintInsight: () => string;
  selectedView: 'overview' | 'detailed';
  setSelectedView: (view: 'overview' | 'detailed') => void;
}

export const JourneyHeader: React.FC<JourneyHeaderProps> = ({
  mainGoal,
  progress,
  getBlueprintInsight,
  selectedView,
  setSelectedView
}) => {
  return (
    <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl border border-border">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-2 flex items-center">
            <Heart className="h-5 w-5 mr-2 text-primary" />
            {mainGoal.title}
          </h2>
          <p className="text-muted-foreground text-sm mb-2">{mainGoal.description}</p>
          <p className="text-xs text-primary font-medium">{getBlueprintInsight()}</p>
        </div>
        
        <div className="text-right ml-4">
          <div className="text-2xl font-bold text-primary mb-1">{progress}%</div>
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
  );
};
