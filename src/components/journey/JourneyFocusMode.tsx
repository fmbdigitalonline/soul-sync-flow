
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  CheckCircle2,
  ArrowRight,
  Brain,
  Zap,
  Calendar,
  Focus,
  ArrowLeft,
  Target,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { safeInterpolateTranslation } from "@/utils/translation-utils";

interface JourneyFocusModeProps {
  focusedMilestone: any;
  mainGoal: any;
  onTaskClick?: (task: any) => void;
  onExitFocus: () => void;
  onViewMilestoneTasks?: (milestone: any) => void;
}

export const JourneyFocusMode: React.FC<JourneyFocusModeProps> = ({
  focusedMilestone,
  mainGoal,
  onTaskClick,
  onExitFocus,
  onViewMilestoneTasks,
}) => {
  const { t, language } = useLanguage();
  const handleTaskClick = (task?: any) => {
    if (!task) return;
    onTaskClick?.(task);
  };
  const handleOpenTaskBoard = () => {
    if (!onViewMilestoneTasks) return;
    onViewMilestoneTasks(focusedMilestone);
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US', {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatBlueprintAlignment = (alignment: any) => {
    if (!alignment) return '';
    if (typeof alignment === 'string') return alignment;
    if (Array.isArray(alignment)) return alignment.filter(Boolean).join(' • ');

    if (typeof alignment === 'object') {
      const { addresses_patterns, leverages_strengths, optimal_timing } = alignment as Record<string, any>;

      const formatValue = (value: any) => {
        if (Array.isArray(value)) return value.filter(Boolean).join(', ');
        if (value && typeof value === 'object') return Object.values(value).join(', ');
        return value ? String(value) : '';
      };

      const parts = [
        addresses_patterns ? `Addresses patterns: ${formatValue(addresses_patterns)}` : '',
        leverages_strengths ? `Leverages strengths: ${formatValue(leverages_strengths)}` : '',
        optimal_timing ? `Optimal timing: ${formatValue(optimal_timing)}` : ''
      ].filter(Boolean);

      return parts.join(' • ');
    }

    return String(alignment);
  };

  const normalizedMilestoneKeyword =
    typeof focusedMilestone?.title === 'string'
      ? focusedMilestone.title.toLowerCase().split(' ')[0]
      : '';

  const milestoneTasks =
    mainGoal.tasks?.filter((task: any) => {
      if (!task) return false;

      if (task.milestone_id && focusedMilestone?.id) {
        return task.milestone_id === focusedMilestone.id;
      }

      if (!normalizedMilestoneKeyword) return false;

      const taskTitle = typeof task.title === 'string' ? task.title.toLowerCase() : '';
      return taskTitle.includes(normalizedMilestoneKeyword);
    }) || [];

  React.useEffect(() => {
    console.log(`[FocusMode] Entered for milestone:`, focusedMilestone.title);
    return () => {
      console.log(`[FocusMode] Exited`);
    };
  }, [focusedMilestone]);

  const blueprintAlignmentText = formatBlueprintAlignment(focusedMilestone?.blueprint_alignment);

  return (
    <div className="space-y-6 animate-fade-in transition-all duration-300">
      {/* Focus Mode Header */}
      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-200 flex flex-wrap items-center justify-between relative overflow-hidden">
        <div className="flex items-center mb-4 md:mb-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExitFocus}
            className="flex items-center gap-2 hover:bg-blue-100"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('journey.focusModeView.backToJourney')}
          </Button>
        </div>
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-2 px-3 py-1 font-bold text-base animate-pulse ring-2 ring-soul-purple shadow-soul-purple/30">
          <Focus className="h-4 w-4 mr-1" />
          {t('journey.focusModeView.banner')}
        </Badge>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
          <Star className="h-5 w-5 text-blue-500" />
          {focusedMilestone.title}
        </h2>
        <p className="text-muted-foreground text-sm mb-3">{focusedMilestone.description}</p>
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-blue-500" />
            <span>
              {safeInterpolateTranslation(t('journey.focusModeView.targetDate'), {
                date: formatDate(focusedMilestone.target_date)
              })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3 text-green-500" />
            <span>
              {safeInterpolateTranslation(t('journey.focusModeView.focusedTasksCount'), {
                count: milestoneTasks.length.toString()
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Blueprint Alignment for this Milestone */}
      {blueprintAlignmentText && (
        <div className="p-3 bg-soul-purple/10 rounded-lg border border-soul-purple/20">
          <h4 className="font-medium text-soul-purple mb-2 flex items-center gap-2">
            <Brain className="h-4 w-4" />
            {t('journey.focusModeView.blueprintAlignment')}
          </h4>
          <p className="text-sm text-soul-purple/80">
            {blueprintAlignmentText}
          </p>
        </div>
      )}

      {/* Focused Tasks */}
      <div>
        <div className="flex items-center justify-between mb-3 gap-2">
          <h3 className="font-medium flex items-center">
            <Zap className="h-4 w-4 mr-2 text-soul-purple" />
            {t('journey.focusModeView.tasksForMilestone')}
          </h3>
          {onViewMilestoneTasks && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenTaskBoard}
              className="flex items-center gap-1 text-xs"
            >
              <Target className="h-3 w-3" />
              {t('journey.focusModeView.openTaskBoard')}
            </Button>
          )}
        </div>
        {milestoneTasks.length > 0 ? (
          <div className="space-y-2">
            {milestoneTasks.map((task: any, index: number) => (
              <div
                key={task.id ?? index}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-secondary/20 cursor-pointer transition-all duration-200 hover:shadow-md"
                onClick={() => handleTaskClick(task)}
              >
                <div className="w-6 h-6 bg-soul-purple/20 rounded-full flex items-center justify-center text-soul-purple font-medium text-xs">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-sm">{task.title || t('journey.taskViews.noTasksFound')}</h5>
                  <p className="text-xs text-muted-foreground mb-1">{task.description || t('journey.journeyStarted')}</p>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs">
                      {task.estimated_duration || '—'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {task.energy_level_required || '—'}
                    </Badge>
                  </div>
                </div>
                {onViewMilestoneTasks ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleOpenTaskBoard();
                    }}
                    className="p-1 rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soul-purple"
                    aria-label={t('journey.focusModeView.openTaskBoard')}
                  >
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </button>
                ) : (
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-8 w-8 mx-auto mb-4 opacity-50" />
            <p className="text-sm">{t('journey.focusModeView.noTasks')}</p>
            <p className="text-xs mt-1">
              {t('journey.focusModeView.tasksDistributed')}
            </p>
          </div>
        )}
      </div>

      {/* Completion Criteria */}
      {focusedMilestone.completion_criteria?.length > 0 && (
        <div>
          <h3 className="font-medium mb-3 flex items-center">
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
            {t('journey.focusModeView.completionCriteria')}
          </h3>
          <div className="space-y-2">
            {focusedMilestone.completion_criteria.map(
              (criteria: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center p-2 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="w-4 h-4 bg-green-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-sm text-green-800">{criteria}</span>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
