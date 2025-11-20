import React from 'react';
import { Brain, Sparkles, Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useXPProgression } from '@/hooks/use-xp-progression';
import { getDimensionName } from '@/services/xp-progression-service';

export const XPProgressSummary: React.FC = () => {
  const { progress, loading, error } = useXPProgression();

  if (loading) {
    return (
      <div className="cosmic-card">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-5 w-5 text-soul-purple" />
          <h2 className="text-lg font-semibold">XP Progression</h2>
        </div>
        <p className="text-sm text-muted-foreground">Loading XP progression...</p>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="cosmic-card">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-5 w-5 text-soul-purple" />
          <h2 className="text-lg font-semibold">XP Progression</h2>
        </div>
        <p className="text-sm text-muted-foreground">XP data is unavailable right now.</p>
      </div>
    );
  }

  const topDimensions = Object.entries(progress.dimScores)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 3);

  return (
    <div className="cosmic-card h-full">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="h-5 w-5 text-soul-purple" />
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Phase 3: Live</p>
          <h2 className="text-lg font-semibold">XP Progression</h2>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <Brain className="h-4 w-4" />
          <span>{Math.round(progress.percent)}% complete</span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Total XP</span>
            <span>{progress.xpTotal.toLocaleString()} pts</span>
          </div>
          <Progress value={progress.percent} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-xl bg-gradient-to-br from-soul-purple/10 to-transparent border border-soul-purple/20">
            <p className="text-xs text-muted-foreground">Session</p>
            <p className="text-lg font-semibold">{progress.sessionXP.toFixed(1)} xp</p>
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-200/40">
            <p className="text-xs text-muted-foreground">Today</p>
            <p className="text-lg font-semibold">{progress.dailyXP.toFixed(1)} xp</p>
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500/10 to-transparent border border-sky-200/40 col-span-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-soul-purple" />
              <div>
                <p className="text-xs text-muted-foreground">Next Milestone</p>
                {progress.nextMilestone ? (
                  <p className="text-sm font-semibold">
                    {progress.nextMilestone.milestone}% · {progress.nextMilestone.xpNeeded} xp needed
                  </p>
                ) : (
                  <p className="text-sm font-semibold">Max milestone reached</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Top Dimensions</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {topDimensions.map(([dim, score]) => (
              <div key={dim} className="p-3 rounded-lg border border-border bg-muted/30">
                <p className="text-xs text-muted-foreground">{getDimensionName(dim as any)}</p>
                <p className="text-lg font-semibold">{Math.round(score as number)}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
