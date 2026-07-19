import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowRight, Zap } from 'lucide-react';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useLanguage } from '@/contexts/LanguageContext';

interface RecommendedTaskProps {
  task: any;
  isHighlighted: boolean;
  onStartTask: (task: any) => void;
}

/**
 * Redesigned to the UX-deck laws (Jul 19):
 * - Hierarchy on the DATA: the task title is the headline; "first task /
 *   blueprint-matched" is a small kicker (was a competing h3 + badge).
 * - One primary action: Start sits directly under the content, full width.
 * - Recognition anchors: icon chips for duration and energy.
 * - Eliminate mercilessly: decorative play tile and duplicate encodings
 *   removed; description and why-line clamped to two lines each.
 */
export const RecommendedTask: React.FC<RecommendedTaskProps> = ({
  task,
  isHighlighted,
  onStartTask
}) => {
  const { spacing, getTextSize, touchTargetSize, isFoldDevice } = useResponsiveLayout();
  const { t } = useLanguage();

  if (!task) return null;

  const formatDuration = (duration: string) => duration || '30 min';

  const getEnergyColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`bg-gradient-to-br from-soul-purple/10 to-soul-teal/5 rounded-2xl border border-soul-purple/20 transition-all duration-500 w-full overflow-hidden ${spacing.card} ${
      isHighlighted ? 'ring-2 ring-soul-purple shadow-soul-purple/20 transform scale-[1.01]' : ''
    }`}>
      <div className="flex flex-col gap-3 w-full">
        {/* Kicker: one small line carries what a heading + badge used to */}
        <p className={`font-semibold uppercase tracking-wider text-soul-purple ${getTextSize('text-xs')}`}>
          🎯 {t('recommendedTask.perfectFirst')} · {t('recommendedTask.blueprintOptimized')}
        </p>

        {/* The task itself is the headline */}
        <h3 className={`font-bold text-gray-800 leading-tight ${getTextSize('text-lg')}`}>
          {task.title}
        </h3>

        {/* Supporting meta — recognition chips */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={`flex items-center gap-1 border-gray-300 ${getTextSize('text-xs')}`}>
            <Clock className={isFoldDevice ? 'h-2 w-2' : 'h-3 w-3'} />
            {formatDuration(task.estimated_duration)}
          </Badge>
          <Badge className={`flex items-center gap-1 border ${getEnergyColor(task.energy_level_required)} ${getTextSize('text-xs')}`}>
            <Zap className={isFoldDevice ? 'h-2 w-2' : 'h-3 w-3'} />
            {task.energy_level_required} {t('recommendedTask.energy')}
          </Badge>
        </div>

        {task.description && (
          <p className={`text-gray-600 leading-relaxed line-clamp-2 ${getTextSize('text-sm')}`} title={task.description}>
            {task.description}
          </p>
        )}

        {/* The why-line — the moat, one compact breath */}
        {task.blueprint_reasoning && (
          <p className={`text-soul-purple bg-soul-purple/10 rounded-lg px-2.5 py-1.5 leading-snug line-clamp-2 ${getTextSize('text-xs')}`} title={task.blueprint_reasoning}>
            💡 {task.blueprint_reasoning}
          </p>
        )}

        {/* One primary action, directly reachable */}
        <Button
          onClick={() => onStartTask(task)}
          className={`bg-gradient-to-r from-soul-purple to-soul-teal hover:shadow-lg text-white rounded-xl font-semibold transition-all duration-300 active:scale-95 w-full ${spacing.button} ${touchTargetSize}`}
        >
          <span className={getTextSize('text-sm')}>{t('recommendedTask.startTask')}</span>
          <ArrowRight className={`ml-2 ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
        </Button>
      </div>
    </div>
  );
};
