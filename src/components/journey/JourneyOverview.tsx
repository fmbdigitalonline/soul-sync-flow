
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Star, Focus } from "lucide-react";

interface JourneyOverviewProps {
  mainGoal: any;
  completedMilestones: any[];
  onMilestoneClick?: (milestone: any) => void;
  onFocusMilestone?: (milestone: any) => void;
}

export const JourneyOverview: React.FC<JourneyOverviewProps> = ({
  mainGoal,
  completedMilestones,
  onMilestoneClick,
  onFocusMilestone,
}) => {
  const currentMilestone =
    mainGoal.milestones?.find((m: any) => !m.completed) || null;

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20">
      <h2 className="text-lg font-semibold mb-4">Milestones</h2>
      <div className="space-y-6">
        {mainGoal.milestones?.map((milestone: any, idx: number) => {
          const isCompleted = milestone.completed;
          const isCurrent =
            !isCompleted && idx === completedMilestones.length;
          return (
            <div
              key={milestone.id}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${isCompleted
                  ? "bg-slate-50 border-slate-200 text-muted-foreground opacity-60"
                  : isCurrent
                    ? "bg-soul-purple/10 border-soul-purple"
                    : "bg-white border-gray-200"
                }`}
            >
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => onMilestoneClick?.(milestone)}
              >
                <span className="w-8 h-8 rounded-full flex items-center justify-center bg-soul-purple/20 text-soul-purple text-lg font-bold">
                  {idx + 1}
                </span>
                <div>
                  <div className="font-semibold">
                    {milestone.title}
                    {isCurrent && (
                      <span className="ml-2 inline-block align-middle">
                        <Star className="inline h-4 w-4 text-soul-purple" />
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {milestone.description}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {onFocusMilestone && !isCompleted && (
                  <Button
                    size="sm"
                    className="flex items-center gap-1"
                    variant="secondary"
                    // Add focus handling logic here
                    onClick={() => {
                      if (onFocusMilestone) {
                        onFocusMilestone(milestone);
                        console.log("[Focus] Activated for milestone:", milestone.title);
                      }
                    }}
                  >
                    <Focus className="h-4 w-4 text-soul-purple" />
                    Focus
                  </Button>
                )}
                {isCompleted && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
