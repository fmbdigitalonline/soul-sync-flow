
import React from "react";
import { ArrowRight } from "lucide-react";

interface CoachStepMessageProps {
  stepNum: number | string;
  title: string;
  body: string;
  estimatedDuration?: string;
  totalSteps?: number;
  motivation?: string;
  cta?: string;
}

export const CoachStepMessage: React.FC<CoachStepMessageProps> = ({
  stepNum,
  title,
  body,
  estimatedDuration,
  totalSteps,
  motivation,
  cta,
}) => {
  // Find and render bullet lists (follow-up or checklist), preserving markdown where possible
  // Also ensure follow-up sections don't get cut off

  // Attempt to split body into main instructions and follow-up questions if present
  let [mainSection, ...followUps] = body.split(/####\s*Follow[- ]?up Questions?:?/i);
  let followUpList = [];
  if (followUps.length > 0) {
    // Extract each non-empty line that starts with '-'
    followUpList = followUps.join('\n').split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith("-") || line.startsWith("–"))
      .map(line => line.replace(/^[-–]\s*/, "")) // remove bullet char
      .filter(Boolean);
  }

  return (
    <div className="w-full bg-soul-purple/5 border-l-4 border-soul-purple rounded-lg shadow-sm px-5 py-4 my-3 animate-fade-in">
      {/* Progress Meta Row */}
      <div className="flex items-center gap-2 mb-1">
        <ArrowRight className="h-4 w-4 text-soul-purple" />
        <span className="font-bold text-base text-soul-purple">
          Step {stepNum}
          {typeof totalSteps === "number" && ` of ${totalSteps}`}
          {title ? `: ${title}` : ""}
          {estimatedDuration ? (
            <span className="ml-2 text-xs text-soul-purple/80 font-medium">
              ({estimatedDuration})
            </span>
          ) : null}
        </span>
      </div>
      {/* Main Instruction */}
      <div className="text-sm leading-relaxed text-gray-800 whitespace-pre-line mb-2">
        {mainSection}
      </div>
      {/* Follow-up/Checklist */}
      {followUpList.length > 0 && (
        <ul className="text-sm text-soul-purple font-medium mb-2 pl-4 list-disc">
          {followUpList.map((f, idx) => (
            <li key={idx}>{f}</li>
          ))}
        </ul>
      )}
      {/* Motivation/Encouragement */}
      {motivation && (
        <div className="italic text-xs text-soul-purple mb-2">{motivation}</div>
      )}
      {/* Coach CTA */}
      {cta && (
        <div className="mt-2 text-sm font-medium text-gray-700">
          {cta}
        </div>
      )}
    </div>
  );
};
