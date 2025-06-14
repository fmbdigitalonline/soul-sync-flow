
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

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
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button 
        onClick={onViewJourney}
        variant="outline"
        className="flex items-center gap-2 border-soul-purple/30 hover:bg-soul-purple/5 px-6 py-3 rounded-xl"
      >
        <MapPin className="h-4 w-4" />
        View Complete Journey Map
      </Button>
      
      {!showTour && (
        <Button 
          onClick={onRestartTour}
          variant="ghost"
          className="text-soul-purple hover:bg-soul-purple/10 px-6 py-3 rounded-xl"
        >
          Take Guided Tour Again
        </Button>
      )}
    </div>
  );
};
