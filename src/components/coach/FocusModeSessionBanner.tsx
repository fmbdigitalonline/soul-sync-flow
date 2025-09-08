
import React from "react";
import { Target, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { safeInterpolateTranslation } from "@/utils/translation-utils";

interface FocusModeSessionBannerProps {
  taskTitle: string;
  estimatedDuration: string;
}

export const FocusModeSessionBanner: React.FC<FocusModeSessionBannerProps> = ({
  taskTitle,
  estimatedDuration,
}) => {
  const { t } = useLanguage();
  
  return (
  <div className="w-full flex items-center gap-3 px-4 py-2 bg-soul-purple/90 shadow border-b border-soul-purple z-40 sticky top-0 animate-fade-in">
    <Target className="h-5 w-5 text-white mr-2" />
    <span className="text-base font-semibold text-white flex-1 truncate">
      {safeInterpolateTranslation(t('focusMode.title'), { taskTitle })}
    </span>
    <Clock className="h-4 w-4 text-white mr-1" />
    <span className="text-xs text-white/80">{estimatedDuration}</span>
  </div>
  );
};
