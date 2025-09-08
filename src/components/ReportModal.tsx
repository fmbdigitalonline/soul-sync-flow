import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useLanguage } from '@/contexts/LanguageContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: 'standard' | 'hermetic';
  reportContent?: React.ReactNode;
}

const ReportModal: React.FC<ReportModalProps> = ({ 
  isOpen, 
  onClose, 
  reportType, 
  reportContent 
}) => {
  const { spacing, getTextSize, isMobile, isUltraNarrow } = useResponsiveLayout();
  const { t } = useLanguage();

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
              {t(`reportModal.${reportType}Title`)}
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
                {/* Report Header */}
                <div className="text-center space-y-2">
                  <h2 className={`${getTextSize('text-xl')} font-bold text-foreground`}>
                    {t(`reportModal.${reportType}Title`)}
                  </h2>
                </div>

                {/* Report Content */}
                <div className={`space-y-4 ${getTextSize('text-base')} leading-relaxed`}>
                  {reportContent || (
                    <div className="space-y-4">
                      <div className="bg-accent/10 rounded-2xl p-6">
                        <h3 className={`${getTextSize('text-lg')} font-semibold mb-3 text-foreground`}>
                          {t('reportModal.reportSummary')}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t('reportModal.noContentAvailable')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CosmicCard>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;