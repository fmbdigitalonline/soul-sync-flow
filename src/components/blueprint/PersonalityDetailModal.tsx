import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { PersonalityDescription } from './PersonalityDescription';

interface PersonalityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  mainValue: string;
  light: string;
  shadow: string;
  insight: string;
  category: string;
}

const PersonalityDetailModal: React.FC<PersonalityDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  title,
  subtitle,
  mainValue,
  light,
  shadow,
  insight,
  category
}) => {
  const { spacing, getTextSize, isMobile } = useResponsiveLayout();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`
        ${isMobile ? 'w-full h-[90vh] max-w-full m-0 rounded-t-3xl rounded-b-none' : 'max-w-4xl w-full h-[85vh]'}
        p-0 gap-0 border-0 bg-background
      `}>
        {/* Sticky Header */}
        <DialogHeader className={`
          sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border
          ${spacing.card} pb-3
        `}>
          <div className="flex items-center justify-between w-full">
            <DialogTitle className={`${getTextSize('text-lg')} font-semibold text-foreground flex-1 pr-4`}>
              {title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 w-full">
          <div className={`${spacing.container} ${spacing.gap} pb-8`}>
            <CosmicCard className="w-full border-0 shadow-none bg-transparent">
              <div className="space-y-6">
                {/* Main Value Display */}
                <div className="text-center space-y-2 py-6">
                  {subtitle && (
                    <p className={`${getTextSize('text-sm')} font-inter text-muted-foreground uppercase tracking-wide`}>
                      {subtitle}
                    </p>
                  )}
                  <h2 className={`${getTextSize('text-5xl')} font-cormorant font-bold text-soul-purple`}>
                    {mainValue}
                  </h2>
                </div>

                {/* Light & Shadow Description */}
                <div className="bg-accent/10 rounded-3xl p-6">
                  <PersonalityDescription 
                    light={light}
                    shadow={shadow}
                    insight={insight}
                    compact={false}
                  />
                </div>
              </div>
            </CosmicCard>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PersonalityDetailModal;
