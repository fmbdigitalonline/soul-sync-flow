
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { GrowthDomainSelection } from './GrowthDomainSelection';
import { GrowthBeliefDrilling } from './GrowthBeliefDrilling';
import { GrowthProgramGeneration } from './GrowthProgramGeneration';
import { useGrowthOnboardingLogic } from './useGrowthOnboardingLogic';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';

interface GrowthProgramOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const GrowthProgramOnboardingModal: React.FC<GrowthProgramOnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const { spacing, layout, touchTargetSize, isMobile, isFoldDevice } = useResponsiveLayout();
  const {
    currentStage,
    selectedDomain,
    beliefData,
    isGenerating,
    error,
    handleDomainSelect,
    handleBeliefComplete,
    handleGenerationComplete,
    handleBackToDomainSelection
  } = useGrowthOnboardingLogic(onComplete);

  const handleClose = () => {
    if (!isGenerating) {
      onClose();
    }
  };

  const renderCurrentStage = () => {
    switch (currentStage) {
      case 'domain_selection':
        return (
          <GrowthDomainSelection
            onDomainSelect={handleDomainSelect}
            selectedDomain={selectedDomain}
          />
        );
      case 'belief_drilling':
        return (
          <GrowthBeliefDrilling
            domain={selectedDomain!}
            onComplete={handleBeliefComplete}
            onBack={handleBackToDomainSelection}
            beliefData={beliefData}
          />
        );
      case 'program_generation':
        return (
          <GrowthProgramGeneration
            domain={selectedDomain!}
            beliefData={beliefData}
            onComplete={handleGenerationComplete}
            error={error}
          />
        );
      default:
        return null;
    }
  };

  // Responsive modal sizing
  const getModalSize = () => {
    if (isFoldDevice) {
      return "w-full max-w-[calc(100vw-16px)] h-[calc(100vh-32px)]";
    }
    if (isMobile) {
      return "w-full max-w-[calc(100vw-32px)] h-[calc(100vh-64px)]";
    }
    return "max-w-4xl h-[90vh]";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`${getModalSize()} overflow-hidden p-0 flex flex-col`}>
        {/* Close button */}
        <div className="absolute top-4 right-4 z-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isGenerating}
            className={`h-8 w-8 p-0 ${touchTargetSize}`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className={`w-full h-full flex flex-col overflow-hidden ${spacing.container}`}>
          {renderCurrentStage()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
