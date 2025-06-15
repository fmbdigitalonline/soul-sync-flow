
import React from "react";
import { CheckCircle2, Circle } from "lucide-react";

/** 
 * Renders step checklist/progress bar
 * steps: array of strings (step titles)
 * currentStepIdx: zero-based index of current (incomplete) step
 */
export const StepChecklistProgress: React.FC<{
  steps: string[];
  currentStepIdx: number;
}> = ({ steps, currentStepIdx }) => (
  <div className="flex flex-wrap gap-2 py-2 md:py-3 mb-2 md:mb-4 px-1 animate-fade-in">
    {steps.map((step, i) => (
      <div
        key={i}
        className={
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs font-semibold " +
          (i < currentStepIdx
            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
            : i === currentStepIdx
            ? "bg-soul-purple/10 text-soul-purple border border-soul-purple/30"
            : "bg-gray-100 text-gray-400 border border-gray-200")
        }
      >
        {i < currentStepIdx ? (
          <CheckCircle2 className="h-3 w-3 flex-shrink-0 text-emerald-500" />
        ) : (
          <Circle className="h-3 w-3 flex-shrink-0" />
        )}
        <span className="truncate max-w-[10ch] md:max-w-xs">{step}</span>
      </div>
    ))}
  </div>
);
