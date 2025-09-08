import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { ArrowLeft } from 'lucide-react';

const ReportViewer: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { spacing, getTextSize, isMobile, isUltraNarrow, isFoldDevice } = useResponsiveLayout();

  return (
    <div className={`w-full max-w-full overflow-hidden`}>
      <div className={`${spacing.container} min-h-screen bg-background`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 ${spacing.gap} w-full`}>
          <Button
            variant="ghost"
            onClick={() => navigate('/blueprint')}
            className={`${spacing.button} mb-4 sm:mb-0 w-full sm:w-auto`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className={getTextSize('text-sm')}>Back to Blueprint</span>
          </Button>
        </div>

        <ScrollArea className="h-[600px] w-full">
          <div className={`space-y-4 sm:space-y-6 pr-2 sm:pr-4 w-full max-w-full`}>
            <CosmicCard className="w-full max-w-full">
              <CardHeader className="pb-3">
                <CardTitle className={`${getTextSize('text-lg')} break-words`}>
                  Hermetic Report
                </CardTitle>
              </CardHeader>
              <CardContent className={spacing.card}>
                <p className={`text-muted-foreground break-words ${getTextSize('text-sm')} mb-4`}>
                  Report viewer for job: {jobId}
                </p>
                <p className={`break-words ${getTextSize('text-sm')}`}>
                  This is a placeholder for the completed hermetic report viewer.
                </p>
              </CardContent>
            </CosmicCard>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ReportViewer;