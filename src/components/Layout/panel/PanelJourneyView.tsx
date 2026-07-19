/**
 * PanelJourneyView — the visual journey map + timeline, embedded (Wave 4,
 * embed-first policy: reuse the built EnhancedJourneyMap and
 * TimelineDetailView wholesale rather than reimplementing).
 *
 * One primary container with a Map/Timeline toggle; milestone taps
 * navigate by state to the milestone drill-in, task taps open the real
 * task collaboration room.
 */

import React, { useState } from 'react';
import { ArrowLeft, Map as MapIcon, CalendarRange } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EnhancedJourneyMap } from '@/components/journey/EnhancedJourneyMap';
import { TimelineDetailView } from '@/components/journey/TimelineDetailView';

interface PanelJourneyViewProps {
  /** RAW journey goal (productivity_journey shape, with tasks+milestones). */
  goal: any;
  onBack: () => void;
  onOpenMilestone?: (milestoneId: string) => void;
  onOpenTask?: (task: any) => void;
}

export const PanelJourneyView: React.FC<PanelJourneyViewProps> = ({
  goal,
  onBack,
  onOpenMilestone,
  onOpenTask,
}) => {
  const [view, setView] = useState<'map' | 'timeline'>('map');
  const milestones = Array.isArray(goal?.milestones) ? goal.milestones : [];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
          Back
        </Button>
        <div className="flex items-center gap-1">
          <ToggleChip active={view === 'map'} onClick={() => setView('map')} icon={MapIcon} label="Map" />
          <ToggleChip
            active={view === 'timeline'}
            onClick={() => setView('timeline')}
            icon={CalendarRange}
            label="Timeline"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border/60 overflow-hidden bg-background [&_.min-h-screen]:min-h-0">
        {view === 'map' ? (
          <EnhancedJourneyMap
            activeGoal={goal}
            onMilestoneClick={(m: any) => m?.id && onOpenMilestone?.(String(m.id))}
            onTaskClick={(t: any) => onOpenTask?.(t)}
          />
        ) : (
          <TimelineDetailView goal={goal} milestones={milestones} onBack={() => setView('map')} />
        )}
      </div>
    </div>
  );
};

const ToggleChip: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}> = ({ active, onClick, icon: Icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex items-center gap-1 text-[11px] rounded-md px-2 py-1 border transition-colors',
      active
        ? 'border-primary/40 bg-primary/10 text-foreground'
        : 'border-border/50 text-muted-foreground hover:text-foreground',
    )}
  >
    <Icon className="h-3 w-3" />
    {label}
  </button>
);

export default PanelJourneyView;
