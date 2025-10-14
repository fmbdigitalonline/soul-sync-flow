
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { safeInterpolateTranslation } from '@/utils/translation-utils';

interface GuidedTourPanelProps {
  showTour: boolean;
  currentStep: any;
  tourStep: number;
  totalSteps: number;
  onNextStep: () => void;
  onSkipTour: () => void;
}

export const GuidedTourPanel: React.FC<GuidedTourPanelProps> = ({
  showTour,
  currentStep,
  tourStep,
  totalSteps,
  onNextStep,
  onSkipTour
}) => {
  const { spacing, getTextSize, touchTargetSize, isFoldDevice, isUltraNarrow } = useResponsiveLayout();
  const { t } = useLanguage();

  if (!showTour) return null;

  return (
    <div className={`w-full max-w-full transition-all duration-500 ${
      currentStep?.highlight === 'celebration' 
        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
        : 'bg-soul-purple/10 border-soul-purple/20'
    } backdrop-blur-sm rounded-2xl border overflow-hidden ${spacing.card}`}>
      <div className="w-full max-w-full">
        <div className={`flex w-full max-w-full ${isFoldDevice ? 'flex-col items-center text-center space-y-3' : 'items-start gap-3'}`}>
          <div className={`bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${getTextSize('text-sm')} ${isFoldDevice ? 'w-6 h-6' : 'w-10 h-10'}`}>
            {tourStep + 1}
          </div>
          <div className="flex-1 min-w-0 w-full max-w-full">
            <div className={`flex items-center gap-2 mb-2 w-full max-w-full ${isFoldDevice ? 'flex-col' : 'flex-wrap'}`}>
              <h3 className={`font-semibold text-gray-800 flex-shrink-0 ${getTextSize('text-sm')}`}>
                {t('guidedTour.soulCoach')}
              </h3>
              <Badge variant="outline" className={`flex-shrink-0 ${getTextSize('text-xs')}`}>
                {safeInterpolateTranslation(t('guidedTour.stepOf'), { tourStep: (tourStep + 1).toString(), totalSteps: totalSteps.toString() })}
              </Badge>
            </div>
            <p className={`text-gray-700 leading-relaxed mb-3 w-full max-w-full break-words ${getTextSize('text-xs')}`}>
              {currentStep?.message || t('guidedTour.orientation')}
            </p>
            <div className={`flex w-full max-w-full gap-2 ${isFoldDevice || isUltraNarrow ? 'flex-col' : 'justify-end'}`}>
              <Button 
                variant="ghost"
                onClick={onSkipTour}
                size="sm"
                className={`text-gray-500 hover:text-gray-700 rounded-xl flex-shrink-0 ${getTextSize('text-xs')} ${touchTargetSize} ${isFoldDevice || isUltraNarrow ? 'w-full' : ''}`}
              >
                {t('guidedTour.skipTour')}
              </Button>
              <Button 
                onClick={onNextStep}
                size="sm"
                className={`bg-soul-purple hover:bg-soul-purple/90 text-white rounded-xl flex-shrink-0 ${getTextSize('text-xs')} ${touchTargetSize} ${isFoldDevice || isUltraNarrow ? 'w-full' : ''}`}
              >
                <span>{tourStep < totalSteps - 1 ? t('guidedTour.next') : t('guidedTour.gotIt')}</span>
                <ArrowRight className={`ml-1 ${isFoldDevice ? 'h-2 w-2' : 'h-3 w-3'}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
