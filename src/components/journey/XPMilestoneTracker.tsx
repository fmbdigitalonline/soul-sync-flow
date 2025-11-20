import React from 'react';
import { Award, Flame, Shield } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useXPProgression } from '@/hooks/use-xp-progression';
import { getDimensionName } from '@/services/xp-progression-service';

export const XPMilestoneTracker: React.FC = () => {
  const { progress, loading, error } = useXPProgression();

  if (loading || error || !progress) {
    return (
      <div className="p-4 rounded-2xl border border-border bg-muted/30">
        <div className="flex items-center gap-2 text-sm font-semibold mb-1">
          <Award className="h-4 w-4 text-soul-purple" />
          XP Milestones
        </div>
        <p className="text-xs text-muted-foreground">Tracking XP milestones...</p>
      </div>
    );
  }

  const milestoneLabel = progress.nextMilestone
    ? `${progress.nextMilestone.milestone}% milestone`
    : 'All milestones unlocked';

  const leadingDims = Object.entries(progress.dimScores)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 2);

  return (
    <div className="p-4 rounded-2xl border border-border bg-gradient-to-br from-soul-purple/10 via-background to-emerald-500/5">
      <div className="flex items-center gap-2 text-sm font-semibold mb-1">
        <Award className="h-4 w-4 text-soul-purple" />
        XP Milestones
      </div>
      <p className="text-xs text-muted-foreground mb-3">Live XP progression linked to your journey.</p>

      <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
        <span>Progress</span>
        <span>{Math.round(progress.percent)}%</span>
      </div>
      <Progress value={progress.percent} className="h-2 mb-3" />

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded-lg bg-background border border-border">
          <p className="text-muted-foreground">Session</p>
          <p className="text-sm font-semibold">{progress.sessionXP.toFixed(1)} xp</p>
        </div>
        <div className="p-2 rounded-lg bg-background border border-border">
          <p className="text-muted-foreground">Weekly</p>
          <p className="text-sm font-semibold">{progress.weeklyXP.toFixed(1)} xp</p>
        </div>
      </div>

      <div className="mt-3 p-3 rounded-xl bg-background border border-border">
        <div className="flex items-center gap-2 text-xs font-semibold mb-1">
          <Shield className="h-4 w-4 text-emerald-500" />
          {milestoneLabel}
        </div>
        {progress.nextMilestone ? (
          <p className="text-xs text-muted-foreground">{progress.nextMilestone.xpNeeded} xp needed to unlock</p>
        ) : (
          <p className="text-xs text-muted-foreground">Milestones gated by ADP events only.</p>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Flame className="h-4 w-4 text-amber-500" />
        <span>
          Leading dimensions: {leadingDims.map(([dim]) => getDimensionName(dim as any)).join(' • ')}
        </span>
      </div>
    </div>
  );
};
