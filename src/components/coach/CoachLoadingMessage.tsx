
import React from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoachLoadingMessageProps {
  message?: string;
  showSpinner?: boolean;
}

export const CoachLoadingMessage: React.FC<CoachLoadingMessageProps> = ({
  message = "Coach is preparing your plan...",
  showSpinner = true,
}) => (
  <div className="flex flex-col items-center justify-center min-h-40 py-10 animate-fade-in">
    <div className="w-16 h-16 flex items-center justify-center bg-soul-purple/10 rounded-full mb-4">
      {showSpinner ? <Loader2 className="h-8 w-8 text-soul-purple animate-spin" /> : <ArrowRight className="h-8 w-8 text-soul-purple" />}
    </div>
    <span className="text-base text-soul-purple mb-2 font-medium">{message}</span>
  </div>
);

