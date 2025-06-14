
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

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
  if (!showTour) return null;

  return (
    <div className={`transition-all duration-500 ${
      currentStep?.highlight === 'celebration' 
        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
        : 'bg-soul-purple/10 border-soul-purple/20'
    } backdrop-blur-sm rounded-2xl p-6 border`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-10 h-10 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {tourStep + 1}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-800">Soul Coach Guidance</h3>
              <Badge variant="outline" className="text-xs">
                Step {tourStep + 1} of {totalSteps}
              </Badge>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              Getting you oriented with your personalized journey...
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button 
            variant="ghost"
            onClick={onSkipTour}
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            Skip Tour
          </Button>
          <Button 
            onClick={onNextStep}
            size="sm"
            className="bg-soul-purple hover:bg-soul-purple/90 text-white"
          >
            {tourStep < totalSteps - 1 ? 'Next' : 'Got it!'}
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
