
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";

interface PersonalityReportHeaderProps {
  onBack: () => void;
  generatedAt: string;
}

export const PersonalityReportHeader: React.FC<PersonalityReportHeaderProps> = ({
  onBack,
  generatedAt
}) => {
  const { spacing, getTextSize, isMobile } = useResponsiveLayout();

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className={`flex items-center ${isMobile ? 'flex-col space-y-2' : 'justify-between'} w-full`}>
        <Button
          variant="ghost"
          onClick={onBack}
          className={`${spacing.button} ${isMobile ? 'self-start' : ''} flex-shrink-0`}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blueprint
        </Button>
        
        <div className={`flex items-center gap-2 ${getTextSize('text-sm')} text-muted-foreground flex-shrink-0`}>
          <FileText className="h-4 w-4" />
          Generated on {new Date(generatedAt).toLocaleDateString()}
        </div>
      </div>

      <div className={`text-center ${spacing.gap} w-full max-w-full overflow-hidden mt-6`}>
        <h1 className={`${getTextSize('text-3xl')} font-bold gradient-text ${spacing.text} break-words`}>
          Your Comprehensive Personality Reading
        </h1>
        <p className={`text-muted-foreground ${getTextSize('text-base')} break-words`}>
          A detailed analysis of your complete Soul Blueprint
        </p>
      </div>
    </div>
  );
};
