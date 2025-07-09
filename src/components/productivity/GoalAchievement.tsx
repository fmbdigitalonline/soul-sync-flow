
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, Target, Trophy, ArrowRight, Filter } from "lucide-react";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
import { GoalCard } from "./GoalCard";
import { GoalDetailPopup } from "./GoalDetailPopup";

interface GoalAchievementProps {
  onCreateGoal?: () => void;
  onTaskClick?: (taskId: string) => void;
}

export const GoalAchievement: React.FC<GoalAchievementProps> = ({ 
  onCreateGoal, 
  onTaskClick 
}) => {
  const { productivityJourney } = useJourneyTracking();
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const currentGoals = (productivityJourney?.current_goals || []) as any[];
  
  // Filter goals based on completion status
  const filteredGoals = currentGoals.filter(goal => {
    if (filter === 'all') return true;
    if (filter === 'completed') return goal.completed;
    if (filter === 'active') return !goal.completed;
    return true;
  });

  const handleGoalDoubleTap = (goal: any) => {
    setSelectedGoal(goal);
    setIsPopupOpen(true);
  };

  const handleGoalSingleTap = (goal: any) => {
    // Optional: Add visual feedback for single tap
    console.log('Single tap on goal:', goal.title);
  };

  const handleGoalFocus = (goalId: string) => {
    // Handle goal focus action
    console.log('Focus on goal:', goalId);
    setIsPopupOpen(false);
  };

  if (currentGoals.length === 0) {
    return (
      <div className="p-6 text-center">
        <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Goals Yet</h3>
        <p className="text-muted-foreground mb-6">
          Start by creating your first dream goal to begin your journey
        </p>
        <Button onClick={onCreateGoal} className="bg-gradient-to-r from-soul-purple to-soul-teal">
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Goal
        </Button>
      </div>
    );
  }

  const completedGoals = currentGoals.filter(g => g.completed).length;
  const overallProgress = currentGoals.length > 0 ? Math.round((completedGoals / currentGoals.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-soul-purple/10 to-soul-teal/10 p-4 rounded-xl border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-soul-purple" />
            <h2 className="text-lg font-bold">Goal Achievement</h2>
          </div>
          <Badge variant="outline" className="bg-white">
            {completedGoals}/{currentGoals.length} completed
          </Badge>
        </div>
        
        <Progress value={overallProgress} className="h-2 mb-2" />
        <p className="text-sm text-gray-600">
          {overallProgress}% of your goals completed
        </p>
      </div>

      {/* Filter Controls */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
          className="whitespace-nowrap"
        >
          All Goals ({currentGoals.length})
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('active')}
          className="whitespace-nowrap"
        >
          Active ({currentGoals.filter(g => !g.completed).length})
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('completed')}
          className="whitespace-nowrap"
        >
          Completed ({completedGoals})
        </Button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 gap-3">
        {filteredGoals.map((goal: any) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onDoubleTap={handleGoalDoubleTap}
            onSingleTap={handleGoalSingleTap}
          />
        ))}
      </div>

      {/* Add Goal Button */}
      <Button
        onClick={onCreateGoal}
        variant="outline"
        className="w-full border-dashed border-2 h-16 hover:border-soul-purple hover:bg-soul-purple/5 transition-colors"
      >
        <Plus className="h-5 w-5 mr-2" />
        Add New Goal
      </Button>

      {/* Goal Detail Popup */}
      <GoalDetailPopup
        goal={selectedGoal}
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false);
          setSelectedGoal(null);
        }}
        onTaskClick={onTaskClick}
        onGoalFocus={handleGoalFocus}
      />
    </div>
  );
};
