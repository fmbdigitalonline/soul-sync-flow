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
  think?: string;
  act?: string;
  react?: string;
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
  think,
  act,
  react,
  category
}) => {
  const { spacing, getTextSize, isMobile } = useResponsiveLayout();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`ss ${
        isMobile ? 'w-full h-[90vh] max-w-full m-0 rounded-t-3xl rounded-b-none' : 'max-w-2xl w-full h-[85vh]'
      } p-0 gap-0 border-0`} style={{ background: 'var(--ss-surface)' }}>
        {/* Sticky Header */}
        <DialogHeader
          className={`sticky top-0 z-10 backdrop-blur-sm ${spacing.card} pb-3`}
          style={{ background: 'color-mix(in srgb, var(--ss-surface) 92%, transparent)', borderBottom: '1px solid var(--ss-line-2)' }}
        >
          <div className="flex items-center justify-between w-full">
            <DialogTitle className={`${getTextSize('text-lg')} font-semibold flex-1 pr-4`} style={{ color: 'var(--ss-ink)' }}>
              {title}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" style={{ color: 'var(--ss-muted)' }} />
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 w-full">
          <div className={`${spacing.container} ${spacing.gap} pb-8`}>
            <div className="w-full space-y-6">
              {/* Main Value Display */}
              <div className="text-center space-y-2 py-6">
                {subtitle && (
                  <p className={`${getTextSize('text-sm')} uppercase tracking-wide`} style={{ color: 'var(--ss-faint)' }}>
                    {subtitle}
                  </p>
                )}
                <h2 className={`${getTextSize('text-4xl')} font-semibold capitalize`} style={{ color: 'var(--ss-accent-ink)' }}>
                  {mainValue}
                </h2>
              </div>

              {/* Light & Shadow Description */}
              <div className="ss-card" style={{ padding: 20 }}>
                <PersonalityDescription
                  light={light}
                  shadow={shadow}
                  insight={insight}
                  think={think}
                  act={act}
                  react={react}
                  compact={false}
                />
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PersonalityDetailModal;
