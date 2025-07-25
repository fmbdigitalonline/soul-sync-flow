
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { TutorialState } from '@/types/tutorial';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutorialState: TutorialState;
  onContinue: () => void;
  onComplete: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  tutorialState,
  onContinue,
  onComplete
}) => {
  console.log('🎭 TutorialModal render - isOpen:', isOpen);
  console.log('🎭 TutorialModal - tutorialState:', tutorialState);

  const currentStep = tutorialState.steps[tutorialState.currentStep];
  const isLastStep = tutorialState.currentStep === tutorialState.steps.length - 1;

  const handleContinue = () => {
    if (isLastStep) {
      onComplete();
      onClose();
    } else {
      onContinue();
    }
  };

  if (!currentStep) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden p-0 flex flex-col bg-gradient-to-br from-background via-background to-muted/20 border-border">
        {/* Close button */}
        <div className="absolute top-4 right-4 z-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-background/80 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress indicator */}
        <div className="w-full bg-muted/30 h-1 absolute top-0">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
            style={{ 
              width: `${((tutorialState.currentStep + 1) / tutorialState.steps.length) * 100}%` 
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-8 pt-12 flex flex-col min-h-[500px]">
          {/* Header with icon */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Step {tutorialState.currentStep + 1} of {tutorialState.steps.length}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-heading font-bold mb-6 leading-tight gradient-text">
            {currentStep.title}
          </h2>

          {/* Content */}
          <div className="flex-1 mb-8">
            <div className="prose prose-sm max-w-none text-foreground">
              {currentStep.content.split('\n').map((paragraph, index) => {
                if (paragraph.trim() === '') {
                  return <br key={index} />;
                }
                
                // Handle bold text (**text**)
                if (paragraph.includes('**')) {
                  const parts = paragraph.split(/(\*\*[^*]+\*\*)/);
                  return (
                    <p key={index} className="mb-4 leading-relaxed text-foreground">
                      {parts.map((part, partIndex) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return (
                            <strong key={partIndex} className="font-semibold text-primary">
                              {part.slice(2, -2)}
                            </strong>
                          );
                        }
                        return part;
                      })}
                    </p>
                  );
                }
                
                // Handle bullet points
                if (paragraph.trim().startsWith('•')) {
                  return (
                    <div key={index} className="flex items-start gap-3 mb-3">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-secondary mt-2 flex-shrink-0" />
                      <p className="leading-relaxed text-muted-foreground">
                        {paragraph.trim().substring(1).trim()}
                      </p>
                    </div>
                  );
                }
                
                return (
                  <p key={index} className="mb-4 leading-relaxed text-muted-foreground">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-border/50">
            <div className="text-xs text-muted-foreground font-medium">
              {isLastStep ? 'Ready to begin your journey' : 'Continue when you\'re ready'}
            </div>
            
            <Button 
              onClick={handleContinue}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground px-8 py-3 rounded-2xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isLastStep ? (
                <>
                  Let's Begin
                  <Sparkles className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
