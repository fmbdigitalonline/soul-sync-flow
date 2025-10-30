/**
 * AllDreamsList Component
 * Displays all user goals in a scrollable list
 * Following SoulSync Principles:
 * - Principle #1: Never Break Functionality - additive only
 * - Principle #2: No Hardcoded Data - uses useGoals() hook
 * - Principle #3: No Fallbacks That Mask Errors - shows real loading/error states
 * - Principle #5: Mobile-Responsive by Default
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { useGoals } from '@/hooks/use-goals';
import { GoalCard } from './GoalCard';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useResumableTasks, type ResumableTask } from '@/hooks/use-resumable-tasks';

interface AllDreamsListProps {
  onSelectGoal: (goalId: string) => void;
  onViewDetails: (goalId: string) => void;
  onCreateNew: () => void;
  onResumeTaskPlan?: (task: ResumableTask) => void;
  sessionRefreshKey?: number;
}

export const AllDreamsList: React.FC<AllDreamsListProps> = ({
  onSelectGoal,
  onViewDetails,
  onCreateNew,
  onResumeTaskPlan,
  sessionRefreshKey = 0
}) => {
  const { goals, isLoading, error, deleteGoal } = useGoals();
  const { isMobile, spacing, getTextSize, touchTargetSize } = useResponsiveLayout();
  const { t } = useLanguage();
  const { toast } = useToast();
  const {
    resumableTasksByGoal,
    isLoading: isLoadingResumable,
    error: resumableError
  } = useResumableTasks(sessionRefreshKey);

  React.useEffect(() => {
    if (!resumableError) return;

    console.error('Failed to load resumable tasks for dreams list', resumableError);
    toast({
      title: 'Unable to check resumable plans',
      description: resumableError,
      variant: 'destructive'
    });
  }, [resumableError, toast]);

  const handleDeleteGoal = async (goalId: string) => {
    if (confirm('Are you sure you want to delete this dream? This action cannot be undone.')) {
      await deleteGoal(goalId);
      toast({
        title: 'Dream Deleted',
        description: 'Your dream has been removed from your journey.',
      });
    }
  };

  // Principle #7: Build Transparently - Show loading state
  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
        <Loader2 className="h-12 w-12 text-soul-purple animate-spin mb-4" />
        <p className={`text-muted-foreground ${getTextSize('text-sm')}`}>
          Loading your dreams...
        </p>
      </div>
    );
  }

  // Principle #3: No Fallbacks That Mask Errors - Show real error state
  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className={`font-semibold text-foreground mb-2 ${getTextSize('text-base')}`}>
          Failed to Load Dreams
        </h3>
        <p className={`text-muted-foreground text-center mb-4 ${getTextSize('text-sm')}`}>
          {error}
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  // Principle #2: No Hardcoded Data - Show real empty state
  if (goals.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
        <div className="bg-gradient-to-br from-soul-purple/10 to-soul-teal/10 rounded-full p-6 mb-6">
          <Plus className="h-16 w-16 text-soul-purple" />
        </div>
        <h3 className={`font-heading font-bold text-foreground mb-2 ${getTextSize('text-lg')}`}>
          No Dreams Yet
        </h3>
        <p className={`text-muted-foreground text-center mb-6 max-w-md ${getTextSize('text-sm')}`}>
          Your journey begins with a single dream. Let's discover what truly lights up your soul.
        </p>
        <Button 
          onClick={onCreateNew}
          className={`bg-gradient-to-r from-soul-purple to-soul-teal text-white hover:opacity-90 ${touchTargetSize}`}
          size={isMobile ? 'default' : 'lg'}
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Your First Dream
        </Button>
      </div>
    );
  }

  // Display all goals in a responsive grid
  return (
    <div className={`w-full max-w-5xl mx-auto ${spacing.container}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`font-heading font-bold text-foreground ${getTextSize('text-xl')}`}>
            All Dreams ({goals.length})
          </h2>
          <p className={`text-muted-foreground ${getTextSize('text-sm')}`}>
            Your complete journey overview
          </p>
        </div>

        <Button
          onClick={onCreateNew}
          className={`bg-primary hover:bg-primary/90 ${touchTargetSize}`}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          {!isMobile && 'New Dream'}
        </Button>
      </div>

      {isLoadingResumable && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Checking resumable plans...</span>
        </div>
      )}

      {/* All Goals Grid - Mobile Responsive */}
      <div className={`grid gap-4 ${
        isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onSelect={onSelectGoal}
            onViewDetails={onViewDetails}
            onDelete={handleDeleteGoal}
            resumableTasks={resumableTasksByGoal.get(goal.id) ?? []}
            onResumeTaskPlan={onResumeTaskPlan}
          />
        ))}
      </div>
    </div>
  );
};
