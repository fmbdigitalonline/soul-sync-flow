
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';

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
  const { spacing, getTextSize, touchTargetSize, isFoldDevice } = useResponsiveLayout();

  if (!showTour) return null;

  return (
    <div className={`transition-all duration-500 w-full max-w-full overflow-hidden ${
      currentStep?.highlight === 'celebration' 
        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
        : 'bg-soul-purple/10 border-soul-purple/20'
    } backdrop-blur-sm rounded-2xl border ${spacing.card}`}>
      <div className="w-full max-w-full">
        <div className={`flex items-start gap-3 w-full ${isFoldDevice ? 'flex-col' : ''}`}>
          <div className={`bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${getTextSize('text-sm')} ${isFoldDevice ? 'w-6 h-6 self-center' : 'w-10 h-10'}`}>
            {tourStep + 1}
          </div>
          <div className="flex-1 min-w-0 w-full overflow-hidden">
            <div className={`flex items-center gap-2 mb-2 flex-wrap ${isFoldDevice ? 'justify-center' : ''}`}>
              <h3 className={`font-semibold text-gray-800 ${getTextSize('text-sm')}`}>Soul Coach Guidance</h3>
              <Badge variant="outline" className={getTextSize('text-xs')}>
                Step {tourStep + 1} of {totalSteps}
              </Badge>
            </div>
            <p className={`text-gray-700 leading-relaxed mb-3 ${getTextSize('text-xs')} ${isFoldDevice ? 'text-center' : ''}`}>
              Getting you oriented with your personalized journey...
            </p>
            <div className={`flex gap-2 w-full ${isFoldDevice ? 'flex-col' : 'justify-end'}`}>
              <Button 
                variant="ghost"
                onClick={onSkipTour}
                size="sm"
                className={`text-gray-500 hover:text-gray-700 rounded-xl ${getTextSize('text-xs')} ${touchTargetSize} ${isFoldDevice ? 'w-full' : ''}`}
              >
                Skip Tour
              </Button>
              <Button 
                onClick={onNextStep}
                size="sm"
                className={`bg-soul-purple hover:bg-soul-purple/90 text-white rounded-xl ${getTextSize('text-xs')} ${touchTargetSize} ${isFoldDevice ? 'w-full' : ''}`}
              >
                <span>{tourStep < totalSteps - 1 ? 'Next' : 'Got it!'}</span>
                <ArrowRight className={`ml-1 ${isFoldDevice ? 'h-2 w-2' : 'h-3 w-3'}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
