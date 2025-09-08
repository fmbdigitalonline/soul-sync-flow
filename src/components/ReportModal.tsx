import React from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  reportContent?: React.ReactNode;
}

const ReportModal: React.FC<ReportModalProps> = ({ 
  isOpen, 
  onClose, 
  jobId, 
  reportContent 
}) => {
  const { spacing, getTextSize, isMobile, isUltraNarrow } = useResponsiveLayout();

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
              Full Report - Job {jobId}
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
                    Hermetic Report
                  </h2>
                  <p className={`${getTextSize('text-base')} text-muted-foreground`}>
                    Job ID: {jobId}
                  </p>
                </div>

                {/* Report Content */}
                <div className={`space-y-4 ${getTextSize('text-base')} leading-relaxed`}>
                  {reportContent || (
                    <div className="space-y-4">
                      <div className="bg-accent/10 rounded-2xl p-6">
                        <h3 className={`${getTextSize('text-lg')} font-semibold mb-3 text-foreground`}>
                          Report Summary
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          This is the detailed view of your hermetic report. The enhanced mobile experience 
                          provides improved readability with larger fonts, better spacing, and a distraction-free 
                          full-screen interface.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <h3 className={`${getTextSize('text-lg')} font-semibold text-foreground`}>
                          Detailed Analysis
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Your report content will be displayed here with optimal formatting for mobile reading. 
                          The larger text size, generous spacing, and full-screen view ensure comfortable 
                          reading on all mobile devices.
                        </p>
                      </div>

                      <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
                        <h3 className={`${getTextSize('text-lg')} font-semibold mb-3 text-primary`}>
                          Key Findings
                        </h3>
                        <p className="text-foreground leading-relaxed">
                          Important insights and findings from your hermetic analysis will be highlighted 
                          in sections like this, making them easy to identify and review.
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