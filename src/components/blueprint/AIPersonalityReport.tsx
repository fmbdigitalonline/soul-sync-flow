
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Sparkles, Download, ArrowLeft } from "lucide-react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { PersonalityReport, aiPersonalityReportService } from "@/services/ai-personality-report-service";
import { BlueprintData } from "@/services/blueprint-service";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your reading...</span>
      </div>
    );
  }

  // Show generation prompt if no existing report
  if (!hasExisting) {
    return (
      <CosmicCard className="p-6 text-center">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 self-start"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blueprint
          </Button>
        </div>
        
        <FileText className="h-16 w-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4 gradient-text">
          Generate Your Comprehensive Reading
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Create a detailed, Soul-generated personality report that weaves together all aspects of your blueprint into one comprehensive analysis. This will be saved for you to revisit anytime.
        </p>
        
        <Button
          onClick={generateReport}
          disabled={generating}
          className="bg-primary hover:bg-primary/90"
          size="lg"
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
          <p className="text-sm text-muted-foreground mt-4">
            This process typically takes 30-60 seconds...
          </p>
        )}
      </CosmicCard>
    );
  }

  // Show the generated report
  if (!report) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Loading your saved reading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blueprint
        </Button>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          Generated on {new Date(report.generated_at).toLocaleDateString()}
        </div>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold gradient-text mb-2">
          Your Comprehensive Personality Reading
        </h1>
        <p className="text-muted-foreground">
          A detailed analysis of your complete Soul Blueprint
        </p>
      </div>

      <ScrollArea className="h-[70vh]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Your Core Personality Pattern
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{report.report_content.core_personality_pattern}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How You Make Decisions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{report.report_content.decision_making_style}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Relationship Style</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{report.report_content.relationship_style}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Life Path & Purpose</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{report.report_content.life_path_purpose}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Energy & Timing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{report.report_content.current_energy_timing}</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Integrated Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-lg">{report.report_content.integrated_summary}</p>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AIPersonalityReport;
