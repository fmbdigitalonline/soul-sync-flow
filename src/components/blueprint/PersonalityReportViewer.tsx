
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Sparkles, ArrowLeft } from "lucide-react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { PersonalityReport, aiPersonalityReportService } from "@/services/ai-personality-report-service";
import { BlueprintData } from "@/services/blueprint-service";
import { useToast } from "@/hooks/use-toast";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { AIPersonalityReport } from "./AIPersonalityReport";

interface PersonalityReportViewerProps {
  blueprint: BlueprintData;
  userId: string;
  onBack: () => void;
}

export const PersonalityReportViewer: React.FC<PersonalityReportViewerProps> = ({ 
  blueprint, 
  userId, 
  onBack 
}) => {
  const [report, setReport] = useState<PersonalityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);
  const { toast } = useToast();
  const { spacing, getTextSize, isMobile } = useResponsiveLayout();

  useEffect(() => {
    checkForExistingReport();
  }, [userId]);

  const checkForExistingReport = async () => {
    try {
      setLoading(true);
      const hasReport = await aiPersonalityReportService.hasExistingReport(userId);
      setHasExisting(hasReport);
      
      if (hasReport) {
        const result = await aiPersonalityReportService.getStoredReport(userId);
        if (result.success && result.report) {
          setReport(result.report);
        }
      }
    } catch (error) {
      console.error('Error checking for existing report:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setGenerating(true);
      
      toast({
        title: "Generating Your Comprehensive Reading",
        description: "This may take 30-60 seconds as we analyze your complete blueprint...",
      });

      const result = await aiPersonalityReportService.generatePersonalityReport(blueprint);
      
      if (result.success && result.report) {
        setReport(result.report);
        setHasExisting(true);
        toast({
          title: "Reading Complete!",
          description: "Your comprehensive personality report has been generated and saved.",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: result.error || "Failed to generate your personality report",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate your personality report",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className={`w-full max-w-full min-h-0 overflow-hidden box-border ${spacing.container}`}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-soul-purple" />
          <span className={`ml-2 ${getTextSize('text-base')}`}>Loading your reading...</span>
        </div>
      </div>
    );
  }

  // Show generation prompt if no existing report
  if (!hasExisting) {
    return (
      <div className={`w-full max-w-full min-h-0 overflow-hidden box-border ${spacing.container}`}>
        <CosmicCard className={`${spacing.card} text-center w-full max-w-full overflow-hidden`}>
          <div className={spacing.gap}>
            <Button
              variant="ghost"
              onClick={onBack}
              className={`${spacing.button} self-start`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blueprint
            </Button>
          </div>
          
          <FileText className={`${isMobile ? 'h-12 w-12' : 'h-16 w-16'} text-soul-purple mx-auto ${spacing.gap}`} />
          <h2 className={`${getTextSize('text-2xl')} font-bold ${spacing.text} gradient-text break-words`}>
            Generate Your Comprehensive Reading
          </h2>
          <p className={`text-muted-foreground ${spacing.gap} max-w-md mx-auto ${getTextSize('text-sm')} break-words`}>
            Create a detailed, Soul-generated personality report that weaves together all aspects of your blueprint into one comprehensive analysis. This will be saved for you to revisit anytime.
          </p>
          
          <Button
            onClick={generateReport}
            disabled={generating}
            className="bg-soul-purple hover:bg-soul-purple/90"
            size={isMobile ? "default" : "lg"}
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Reading...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate My Reading
              </>
            )}
          </Button>
          
          {generating && (
            <p className={`${getTextSize('text-sm')} text-muted-foreground ${spacing.text} break-words`}>
              This process typically takes 30-60 seconds...
            </p>
          )}
        </CosmicCard>
      </div>
    );
  }

  // Show the generated report using AIPersonalityReport component
  return (
    <div className="w-full max-w-full min-h-0 overflow-hidden box-border">
      <AIPersonalityReport 
        blueprint={blueprint}
        userId={userId}
        onBack={onBack}
      />
    </div>
  );
};

export default PersonalityReportViewer;
