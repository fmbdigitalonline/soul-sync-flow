
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Sparkles, Download, ArrowLeft } from "lucide-react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { PersonalityReport, aiPersonalityReportService } from "@/services/ai-personality-report-service";
import { BlueprintData } from "@/services/blueprint-service";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";

interface AIPersonalityReportProps {
  blueprint: BlueprintData;
  userId: string;
  onBack: () => void;
}

export const AIPersonalityReport: React.FC<AIPersonalityReportProps> = ({ 
  blueprint, 
  userId, 
  onBack 
}) => {
  const [report, setReport] = useState<PersonalityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();
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

      const result = await aiPersonalityReportService.generatePersonalityReport(blueprint, language);
      
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
      <div className={`flex items-center justify-center ${spacing.container}`}>
        <Loader2 className="h-8 w-8 animate-spin text-soul-purple" />
        <span className="ml-2">Loading your reading...</span>
      </div>
    );
  }

  // Show generation prompt if no existing report
  if (!hasExisting) {
    return (
      <CosmicCard className={`${spacing.card} text-center`}>
        <div className={`${spacing.gap}`}>
          <Button
            variant="ghost"
            onClick={onBack}
            className={`${spacing.button} mb-4 self-start`}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blueprint
          </Button>
        </div>
        
        <FileText className="h-16 w-16 text-soul-purple mx-auto mb-4" />
        <h2 className={`${getTextSize('text-2xl')} font-bold mb-4 gradient-text`}>
          Generate Your Comprehensive Reading
        </h2>
        <p className={`text-muted-foreground mb-6 max-w-md mx-auto ${getTextSize('text-sm')}`}>
          Create a detailed, Soul-generated personality report that weaves together all aspects of your blueprint into one comprehensive analysis. This will be saved for you to revisit anytime.
        </p>
        
        <Button
          onClick={generateReport}
          disabled={generating}
          className={`bg-soul-purple hover:bg-soul-purple/90 ${spacing.button}`}
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
          <p className={`${getTextSize('text-sm')} text-muted-foreground mt-4`}>
            This process typically takes 30-60 seconds...
          </p>
        )}
      </CosmicCard>
    );
  }

  // Show the generated report
  if (!report) {
    return (
      <div className={`flex items-center justify-center ${spacing.container}`}>
        <p>Loading your saved reading...</p>
      </div>
    );
  }

  return (
    <div className={`${spacing.gap}`}>
      <div className={`flex items-center justify-between ${isMobile ? 'flex-col gap-4' : ''}`}>
        <Button
          variant="ghost"
          onClick={onBack}
          className={`${spacing.button} ${isMobile ? 'self-start' : 'mb-4'}`}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blueprint
        </Button>
        
        <div className={`flex items-center gap-2 ${getTextSize('text-sm')} text-muted-foreground`}>
          <FileText className="h-4 w-4" />
          Generated on {new Date(report.generated_at).toLocaleDateString()}
        </div>
      </div>

      <div className="text-center mb-6">
        <h1 className={`${getTextSize('text-3xl')} font-bold gradient-text mb-2`}>
          Your Comprehensive Personality Reading
        </h1>
        <p className={`text-muted-foreground ${getTextSize('text-sm')}`}>
          A detailed analysis of your complete Soul Blueprint
        </p>
      </div>

      <ScrollArea className={`${isMobile ? 'h-[60vh]' : 'h-[70vh]'}`}>
        <div className={`${spacing.gap}`}>
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${getTextSize('text-lg')}`}>
                <Sparkles className="h-5 w-5 text-soul-purple" />
                Your Core Personality Pattern
              </CardTitle>
            </CardHeader>
            <CardContent className={spacing.card}>
              <p className={`whitespace-pre-wrap ${getTextSize('text-sm')}`}>{report.report_content.core_personality_pattern}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className={getTextSize('text-lg')}>How You Make Decisions</CardTitle>
            </CardHeader>
            <CardContent className={spacing.card}>
              <p className={`whitespace-pre-wrap ${getTextSize('text-sm')}`}>{report.report_content.decision_making_style}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className={getTextSize('text-lg')}>Your Relationship Style</CardTitle>
            </CardHeader>
            <CardContent className={spacing.card}>
              <p className={`whitespace-pre-wrap ${getTextSize('text-sm')}`}>{report.report_content.relationship_style}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className={getTextSize('text-lg')}>Your Life Path & Purpose</CardTitle>
            </CardHeader>
            <CardContent className={spacing.card}>
              <p className={`whitespace-pre-wrap ${getTextSize('text-sm')}`}>{report.report_content.life_path_purpose}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className={getTextSize('text-lg')}>Current Energy & Timing</CardTitle>
            </CardHeader>
            <CardContent className={spacing.card}>
              <p className={`whitespace-pre-wrap ${getTextSize('text-sm')}`}>{report.report_content.current_energy_timing}</p>
            </CardContent>
          </Card>

          <Card className="border-soul-purple/20">
            <CardHeader>
              <CardTitle className={`text-soul-purple ${getTextSize('text-lg')}`}>Integrated Summary</CardTitle>
            </CardHeader>
            <CardContent className={spacing.card}>
              <p className={`whitespace-pre-wrap ${getTextSize('text-base')}`}>{report.report_content.integrated_summary}</p>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AIPersonalityReport;
