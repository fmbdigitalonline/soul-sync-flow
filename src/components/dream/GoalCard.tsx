/**
 * GoalCard Component
 * Displays individual goal cards in the Dreams Overview
 * Following SoulSync Principles:
 * - Principle #2: No Hardcoded Data - displays real goal data from database
 * - Principle #5: Mobile-Responsive by Default
 * - Principle #7: Build Transparently - shows loading and error states
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Calendar, 
  CheckCircle2, 
  Clock,
  Trash2,
  Eye,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { Goal } from '@/hooks/use-goals';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';

interface GoalCardProps {
  goal: Goal;
  onSelect: (goalId: string) => void;
  onViewDetails: (goalId: string) => void;
  onDelete?: (goalId: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onSelect,
  onViewDetails,
  onDelete
}) => {
  const { isMobile, spacing, getTextSize, touchTargetSize } = useResponsiveLayout();
  
  const completedMilestones = goal.milestones.filter(m => m.completed).length;
  const totalMilestones = goal.milestones.length;
  
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      personal_growth: 'from-purple-400 to-purple-600',
      health_fitness: 'from-green-400 to-green-600',
      career_professional: 'from-blue-400 to-blue-600',
      relationships: 'from-pink-400 to-pink-600',
      creative_artistic: 'from-orange-400 to-orange-600',
      financial: 'from-yellow-400 to-yellow-600',
      spiritual: 'from-indigo-400 to-indigo-600',
      learning_education: 'from-cyan-400 to-cyan-600'
    };
    return colors[category] || 'from-gray-400 to-gray-600';
  };

  const getCategoryIcon = (category: string) => {
    return '🎯'; // Default icon, can be expanded
  };

  return (
    <Card className={`w-full overflow-hidden hover:shadow-lg transition-all duration-300 border border-border bg-card ${spacing.container}`}>
      {/* Category Banner */}
      <div className={`bg-gradient-to-r ${getCategoryColor(goal.category)} py-2 px-4 flex items-center gap-2`}>
        <span className="text-lg">{getCategoryIcon(goal.category)}</span>
        <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
          {goal.category.replace('_', ' ')}
        </Badge>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Title and Progress */}
        <div>
          <h3 className={`font-heading font-bold text-foreground mb-2 line-clamp-2 ${getTextSize('text-base')}`}>
            {goal.title}
          </h3>
          <p className={`text-muted-foreground line-clamp-2 mb-3 ${getTextSize('text-sm')}`}>
            {goal.description}
          </p>
          
          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className={`text-muted-foreground ${getTextSize('text-xs')}`}>
                Progress
              </span>
              <span className={`font-semibold text-primary ${getTextSize('text-sm')}`}>
                {goal.progress}%
              </span>
            </div>
            <Progress value={goal.progress} className="h-2" />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className={`text-muted-foreground ${getTextSize('text-xs')}`}>
              {completedMilestones}/{totalMilestones} milestones
            </span>
          </div>
          
          {goal.deadline && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className={`text-muted-foreground ${getTextSize('text-xs')}`}>
                {format(new Date(goal.deadline), 'MMM dd, yyyy')}
              </span>
            </div>
          )}
        </div>

        {/* Blueprint Alignment */}
        {goal.alignedWith.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Sparkles className="h-3 w-3 text-soul-purple" />
            <div className="flex gap-1 flex-wrap">
              {goal.alignedWith.slice(0, 3).map((trait, idx) => (
                <Badge key={idx} variant="outline" className="text-xs bg-soul-purple/5 border-soul-purple/20">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onSelect(goal.id)}
            className={`flex-1 bg-primary hover:bg-primary/90 text-primary-foreground ${touchTargetSize}`}
            size="sm"
          >
            <Target className="h-4 w-4 mr-2" />
            Work on This
          </Button>
          
          <Button
            onClick={() => onViewDetails(goal.id)}
            variant="outline"
            size="sm"
            className={touchTargetSize}
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          {onDelete && (
            <Button
              onClick={() => onDelete(goal.id)}
              variant="ghost"
              size="sm"
              className={`text-destructive hover:text-destructive hover:bg-destructive/10 ${touchTargetSize}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
