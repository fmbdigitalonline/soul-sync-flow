
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { GrowthDomainSelection } from './GrowthDomainSelection';
import { GrowthBeliefDrilling } from './GrowthBeliefDrilling';
import { GrowthProgramGeneration } from './GrowthProgramGeneration';
import { useGrowthOnboardingLogic } from './useGrowthOnboardingLogic';

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
  const {
    currentStage,
    selectedDomain,
    beliefData,
    isGenerating,
    error,
    handleDomainSelect,
    handleBeliefComplete,
    handleGenerationComplete
  } = useGrowthOnboardingLogic(onComplete);

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

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="w-full h-full">
          {renderCurrentStage()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
