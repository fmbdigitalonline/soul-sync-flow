
import React from 'react';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { safeInterpolateTranslation } from '@/utils/translation-utils';

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
        <h1 className={`font-bold mb-3 bg-gradient-to-r from-soul-purple to-soul-teal bg-clip-text text-transparent leading-tight ${getTextSize('text-xl')} ${isFoldDevice ? 'text-lg' : ''}`}>
          {t('celebration.dreamReadyTitle')}
        </h1>
        <p className={`text-gray-600 max-w-2xl mx-auto leading-relaxed break-words ${getTextSize('text-base')} ${isFoldDevice ? getTextSize('text-sm') : ''}`}>
          {safeInterpolateTranslation(t('celebration.dreamReadyDescription'), { goalTitle })}
        </p>
      </div>
    </div>
  );
};
