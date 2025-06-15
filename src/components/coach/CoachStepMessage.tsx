
import React from "react";
import { ArrowRight } from "lucide-react";

interface CoachStepMessageProps {
  stepNum: number;
  title: string;
  body: string;
}

export const CoachStepMessage: React.FC<CoachStepMessageProps> = ({
  stepNum,
  title,
  body,
}) => (
  <div className="w-full bg-white border-l-4 border-soul-purple rounded-lg shadow-sm px-5 py-3 my-2 animate-fade-in">
    <div className="flex items-center gap-2 mb-1">
      <ArrowRight className="h-4 w-4 text-soul-purple" />
      <span className="font-bold text-base text-soul-purple">
        Step {stepNum}: {title}
      </span>
    </div>
    <div className="text-sm leading-relaxed text-gray-800 whitespace-pre-line">
      {body}
    </div>
  </div>
);
