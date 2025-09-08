
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, RefreshCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/contexts/LanguageContext';

interface ActionButtonsProps {
  showTour: boolean;
  onViewJourney: () => void;
  onRestartTour: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  showTour,
  onViewJourney,
  onRestartTour
}) => {
  const { isMobile } = useIsMobile();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
      <Button
        onClick={onViewJourney}
        className="bg-gradient-to-r from-soul-purple to-soul-teal hover:shadow-lg text-white rounded-xl font-semibold transition-all duration-300 active:scale-95 flex-1 min-h-[48px] px-4 sm:px-6"
      >
        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
        <span className="text-sm sm:text-base">{t('tour.viewFullJourney')}</span>
      </Button>
      
      {!showTour && (
        <Button
          variant="outline"
          onClick={onRestartTour}
          className="border-soul-purple/30 text-soul-purple hover:bg-soul-purple/5 rounded-xl font-semibold transition-all duration-300 active:scale-95 flex-1 sm:flex-initial min-h-[48px] px-4 sm:px-6"
        >
          <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          <span className="text-sm sm:text-base">{t('tour.restartTour')}</span>
        </Button>
      )}
    </div>
  );
};
