
import React from 'react';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useLanguage } from '@/contexts/LanguageContext';

interface CelebrationHeaderProps {
  speaking: boolean;
  celebrationComplete: boolean;
  goalTitle: string;
}

export const CelebrationHeader: React.FC<CelebrationHeaderProps> = ({
  speaking,
  celebrationComplete,
  goalTitle
}) => {
  const { getTextSize, isFoldDevice } = useResponsiveLayout();
  const { t } = useLanguage();

  return (
    <div className="text-center space-y-4 w-full max-w-full overflow-hidden px-2">
      <div className="w-full">
        <h1 className={`font-bold mb-3 gradient-text leading-tight ${getTextSize('text-xl')} ${isFoldDevice ? 'text-lg' : ''}`}>
          {t('dreams.journeyReady')}
        </h1>
        <p className={`text-muted max-w-2xl mx-auto leading-relaxed break-words ${getTextSize('text-base')} ${isFoldDevice ? getTextSize('text-sm') : ''}`}>
          {t('dreams.journeyDesc').replace('{goalTitle}', goalTitle)}
        </p>
      </div>
    </div>
  );
};
