import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin, ChevronRight, Calendar, CheckCircle2 } from 'lucide-react';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useLanguage } from '@/contexts/LanguageContext';

interface MilestonesRoadmapProps {
  milestones: any[];
  isHighlighted: boolean;
  onMilestoneClick?: (milestone: any) => void;
}

/**
 * Redesigned to the UX-deck laws (Jul 19):
 * - Readability first: milestone titles never truncate (was "Recogniz…").
 * - Recognition over recall: numbered steps + phase emoji anchors; the
 *   current step is visually marked "you are here".
 * - Eliminate mercilessly: the repeated "milestone" badge, the per-card
 *   recommendation pill, the "Tap to view" label, and the footer note are
 *   gone — the whole row is the tap target, a chevron says so.
 * - Three pieces per row: step + title (primary), one-line description,
 *   date + criteria meta.
 */
export const MilestonesRoadmap: React.FC<MilestonesRoadmapProps> = ({
  milestones,
  isHighlighted,
  onMilestoneClick
}) => {
  const { spacing, getTextSize, touchTargetSize, isFoldDevice } = useResponsiveLayout();
  const { t } = useLanguage();

  const displayMilestones = Array.isArray(milestones) ? milestones : [];
  // "You are here": the first incomplete step.
  const currentIndex = displayMilestones.findIndex((m: any) => !m?.completed);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return t('milestonesRoadmap.dateTbd');
    }
  };

  const getPhaseIcon = (phase: string) => {
    const icons = {
      foundation: '🏗️',
      development: '⚡',
      refinement: '✨',
      completion: '🎯'
    };
    return icons[phase as keyof typeof icons] || '📌';
  };

  return (
    <div className={`bg-card/80 backdrop-blur-lg rounded-2xl shadow-lg transition-all duration-500 w-full overflow-hidden ${spacing.card} ${
      isHighlighted ? 'ring-2 ring-soul-purple shadow-soul-purple/20 transform scale-[1.01]' : ''
    }`}>
      <h3 className={`font-semibold mb-4 flex items-center gap-2 flex-wrap ${getTextSize('text-base')}`}>
        <MapPin className={`text-soul-purple flex-shrink-0 ${isFoldDevice ? 'h-4 w-4' : 'h-5 w-5'}`} />
        <span className="flex-1 min-w-0 truncate">{t('milestonesRoadmap.title')}</span>
        <Badge className={`bg-soul-purple/10 text-soul-purple border-0 flex-shrink-0 ${getTextSize('text-xs')}`}>
          {currentIndex >= 0 ? `${currentIndex + 1}/${displayMilestones.length}` : displayMilestones.length}
        </Badge>
      </h3>

      <div className="space-y-2.5 w-full">
        {displayMilestones.map((milestone: any, index: number) => {
          const isCurrent = index === currentIndex;
          const isDone = !!milestone?.completed;
          return (
            <button
              key={milestone.id || index}
              onClick={() => onMilestoneClick?.(milestone)}
              className={`flex items-start gap-3 rounded-xl border transition-all duration-300 active:scale-[0.98] w-full text-left overflow-hidden ${spacing.card} ${touchTargetSize} ${
                isCurrent
                  ? 'border-soul-purple/50 bg-soul-purple/10 ring-1 ring-soul-purple/30'
                  : 'border-soul-purple/10 bg-gradient-to-r from-soul-purple/5 to-transparent hover:border-soul-purple/30 hover:bg-soul-purple/10'
              }`}
            >
              {/* Step anchor: number, or a check when done */}
              <div className={`rounded-full flex items-center justify-center font-bold flex-shrink-0 ${getTextSize('text-sm')} ${isFoldDevice ? 'w-6 h-6' : 'w-8 h-8'} ${
                isDone
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gradient-to-br from-soul-purple to-soul-teal text-white'
              }`}>
                {isDone ? <CheckCircle2 className={isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'} /> : index + 1}
              </div>

              <div className="flex-1 min-w-0 overflow-hidden">
                {/* Primary: full title, never truncated */}
                <div className="flex items-start gap-1.5">
                  <span className="flex-shrink-0 leading-tight">
                    {getPhaseIcon(milestone.blueprint_alignment?.phase || 'foundation')}
                  </span>
                  <h4 className={`font-semibold leading-tight flex-1 min-w-0 ${getTextSize('text-sm')} ${
                    isDone ? 'text-muted-foreground line-through' : 'text-gray-800'
                  }`}>
                    {milestone.title}
                  </h4>
                  {isCurrent && (
                    <Badge className={`bg-soul-purple text-white border-0 flex-shrink-0 ${getTextSize('text-xs')}`}>
                      Current
                    </Badge>
                  )}
                </div>

                {milestone.description && (
                  <p className={`text-gray-600 mt-1 leading-relaxed line-clamp-1 ${getTextSize('text-xs')}`} title={milestone.description}>
                    {milestone.description}
                  </p>
                )}

                {/* Supporting meta: date · criteria count */}
                <div className="flex items-center justify-between gap-2 mt-1.5">
                  <div className={`flex items-center gap-2 text-muted-foreground ${getTextSize('text-xs')}`}>
                    <span className="flex items-center gap-1">
                      <Calendar className={isFoldDevice ? 'h-2 w-2' : 'h-3 w-3'} />
                      {formatDate(milestone.target_date)}
                    </span>
                    {milestone.completion_criteria?.length > 0 && (
                      <span>· {milestone.completion_criteria.length} criteria</span>
                    )}
                  </div>
                  <ChevronRight className={`text-soul-purple flex-shrink-0 ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
                </div>
              </div>
            </button>
          );
        })}

        {displayMilestones.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <MapPin className={`mx-auto mb-2 opacity-50 ${isFoldDevice ? 'h-6 w-6' : 'h-8 w-8'}`} />
            <p className={getTextSize('text-sm')}>{t('milestonesRoadmap.noMilestones')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
