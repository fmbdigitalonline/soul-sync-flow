/**
 * DreamsOverview Component
 * Displays all active user goals in a grid layout
 * Following SoulSync Principles:
 * - Principle #1: Never Break Functionality - additive only
 * - Principle #2: No Hardcoded Data - uses useGoals() hook
 * - Principle #3: No Fallbacks That Mask Errors - shows real loading/error states
 * - Principle #5: Mobile-Responsive by Default
 * - Principle #7: Build Transparently - clear loading indicators
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Target, Loader2, AlertCircle, Sparkles, Heart } from 'lucide-react';
import { useGoals } from '@/hooks/use-goals';
import { GoalCard } from './GoalCard';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface DreamsOverviewProps {
  onSelectGoal: (goalId: string) => void;
  onCreateNew: () => void;
  onViewDetails: (goalId: string) => void;
}

export const DreamsOverview: React.FC<DreamsOverviewProps> = ({
  onSelectGoal,
  onCreateNew,
  onViewDetails
}) => {
  const { goals, isLoading, error, deleteGoal } = useGoals();
  const { isMobile, spacing, getTextSize, touchTargetSize } = useResponsiveLayout();
  const { t } = useLanguage();
  const { toast } = useToast();

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
          <Heart className="h-16 w-16 text-soul-purple" />
        </div>
        <h3 className={`font-heading font-bold text-foreground mb-2 ${getTextSize('text-lg')}`}>
          No Dreams Yet
        </h3>
        <p className={`text-muted-foreground text-center mb-6 max-w-md ${getTextSize('text-sm')}`}>
          Your journey begins with a single dream. Let's discover what truly lights up your soul and create a path to make it real.
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

  // Display goals in a responsive grid
  return (
    <div className={`w-full ${spacing.container}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`font-heading font-bold text-foreground flex items-center gap-2 mb-1 ${getTextSize('text-xl')}`}>
            <Target className="h-6 w-6 text-soul-purple" />
            My Dreams
          </h2>
          <p className={`text-muted-foreground ${getTextSize('text-sm')}`}>
            {goals.length} {goals.length === 1 ? 'active dream' : 'active dreams'}
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

      {/* Goals Grid */}
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
          />
        ))}
      </div>

      {/* Blueprint Insight */}
      <Card className={`mt-6 bg-gradient-to-r from-soul-purple/5 to-soul-teal/5 border-soul-purple/20 ${spacing.container}`}>
        <div className="flex items-start gap-3">
          <div className="bg-soul-purple/10 rounded-full p-2">
            <Sparkles className="h-5 w-5 text-soul-purple" />
          </div>
          <div className="flex-1">
            <h4 className={`font-semibold text-foreground mb-1 ${getTextSize('text-sm')}`}>
              Blueprint-Aligned Progress
            </h4>
            <p className={`text-muted-foreground ${getTextSize('text-xs')}`}>
              Each dream is personalized to your unique cognitive patterns, energy strategy, and life path. 
              Your progress is optimized for how you naturally work best.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
