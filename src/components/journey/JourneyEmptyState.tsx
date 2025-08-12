import React from "react";
import { Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const JourneyEmptyState: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="p-8 text-center">
      <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">{t('journey.empty.title')}</h3>
      <p className="text-muted-foreground mb-6">
        {t('journey.empty.description')}
      </p>
    </div>
  );
};
