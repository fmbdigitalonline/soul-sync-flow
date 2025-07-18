import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Download, RefreshCw, Sparkles, FileText, Eye, Brain } from "lucide-react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { PersonalityReport, aiPersonalityReportService } from "@/services/ai-personality-report-service";
import { HermeticReport, hermeticReportService } from "@/services/hermetic-report-service";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { PersonalityReportHeader } from "./PersonalityReportHeader";
import { PersonalityReportContent } from "./PersonalityReportContent";
import { HermeticReportContent } from "./HermeticReportContent";
import { useOptimizedBlueprintData } from "@/hooks/use-optimized-blueprint-data";

interface PersonalityReportViewerProps {
  blueprint?: any;
  userId?: string;
  onBack?: () => void;
  className?: string;
}

export const PersonalityReportViewer: React.FC<PersonalityReportViewerProps> = ({ 
  blueprint: propBlueprint,
  userId: propUserId,
  onBack,
  className = ""
}) => {
  const [report, setReport] = useState<PersonalityReport | null>(null);
  const [hermeticReport, setHermeticReport] = useState<HermeticReport | null>(null);
  const [reportType, setReportType] = useState<'personality' | 'hermetic'>('personality');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [hasExistingPersonality, setHasExistingPersonality] = useState(false);
  const [hasExistingHermetic, setHasExistingHermetic] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { spacing, getTextSize, isMobile, isUltraNarrow } = useResponsiveLayout();
  
  // Get blueprint data if not provided as prop
  const { blueprintData } = useOptimizedBlueprintData();
  const blueprint = propBlueprint || blueprintData;
  const userId = propUserId || user?.id;

  useEffect(() => {
    if (userId) {
      checkForExistingReports();
    }
  }, [userId]);

  const checkForExistingReports = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Check for personality report
      const hasPersonality = await aiPersonalityReportService.hasExistingReport(userId);
      setHasExistingPersonality(hasPersonality);
      
      if (hasPersonality) {
        const personalityResult = await aiPersonalityReportService.getStoredReport(userId);
        if (personalityResult.success && personalityResult.report) {
          setReport(personalityResult.report);
        }
      }
      
      // Check for hermetic report
      const hasHermetic = await hermeticReportService.hasExistingReport(userId);
      setHasExistingHermetic(hasHermetic);
      
      if (hasHermetic) {
        const hermeticResult = await hermeticReportService.getStoredReport(userId);
        if (hermeticResult.success && hermeticResult.report) {
          setHermeticReport(hermeticResult.report);
        }
      }
      
      // Set default report type based on availability
      if (hasHermetic && !hasPersonality) {
        setReportType('hermetic');
      } else {
        setReportType('personality');
      }
      
    } catch (error) {
      console.error('Error checking for existing reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePersonalityReport = async () => {
    if (!blueprint || !userId) return;
    
    try {
      setGenerating(true);
      
      toast({
        title: "Generating Your Comprehensive Reading",
        description: "This may take 30-60 seconds as we analyze your complete blueprint...",
      });

      const result = await aiPersonalityReportService.generatePersonalityReport(blueprint);
      
      if (result.success && result.report) {
        setReport(result.report);
        setHasExistingPersonality(true);
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
      console.error('Error generating personality report:', error);
      toast({
        title: "Error",
        description: "Failed to generate your personality report",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const generateHermeticReport = async () => {
    if (!blueprint || !userId) return;
    
    try {
      setGenerating(true);
      
      toast({
        title: "Generating Hermetic Blueprint Report",
        description: "Creating your esoteric blueprint analysis...",
      });

      const result = await hermeticReportService.generateHermeticReport(blueprint);
      
      if (result.success && result.report) {
        setHermeticReport(result.report);
        setHasExistingHermetic(true);
        toast({
          title: "Hermetic Report Complete!",
          description: "Your hermetic blueprint report has been generated and saved.",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: result.error || "Failed to generate your hermetic report",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error generating hermetic report:', error);
      toast({
        title: "Error",
        description: "Failed to generate your hermetic report",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = () => {
    const currentReport = reportType === 'hermetic' ? hermeticReport : report;
    if (!currentReport) return;

    const content = reportType === 'hermetic' 
      ? JSON.stringify(currentReport.report_content, null, 2)
      : Object.values(currentReport.report_content).join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report Downloaded",
      description: `Your ${reportType} report has been downloaded.`,
    });
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${spacing.container} w-full min-w-0 max-w-full overflow-hidden box-border`}>
        <Loader2 className="h-8 w-8 animate-spin text-soul-purple" />
        <span className={`ml-2 ${getTextSize('text-base')}`}>Loading your reports...</span>
      </div>
    );
  }

  return (
    <div className={`${className} w-full min-w-0 max-w-full overflow-hidden box-border`}>
      {/* Report Type Toggle - Optimized for mobile */}
      {(report || hermeticReport) && (
        <div className={`flex flex-col ${isMobile ? 'space-y-3' : 'sm:flex-row'} gap-3 mb-6 w-full`}>
          <div className={`flex ${isMobile ? 'w-full' : 'rounded-lg border p-1 bg-muted/50'} ${isMobile ? 'flex-col space-y-2' : ''}`}>
            <Button
              variant={reportType === 'personality' ? 'default' : 'ghost'}
              size={isMobile ? 'default' : 'sm'}
              onClick={() => setReportType('personality')}
              disabled={!report}
              className={`${isMobile ? 'w-full justify-start' : 'flex-1'} ${isMobile && reportType === 'personality' ? 'bg-soul-purple text-white' : ''}`}
            >
              <Eye className="mr-2 h-4 w-4" />
              Personality Report
            </Button>
            <Button
              variant={reportType === 'hermetic' ? 'default' : 'ghost'}
              size={isMobile ? 'default' : 'sm'}
              onClick={() => setReportType('hermetic')}
              disabled={!hermeticReport}
              className={`${isMobile ? 'w-full justify-start' : 'flex-1'} ${isMobile && reportType === 'hermetic' ? 'bg-soul-purple text-white' : ''}`}
            >
              <Brain className="mr-2 h-4 w-4" />
              Hermetic Report
            </Button>
          </div>
          
          {/* Action buttons - Mobile responsive */}
          <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'gap-2'} ${isMobile ? 'w-full' : 'flex-shrink-0'}`}>
            <Button
              variant="outline"
              size={isMobile ? 'default' : 'sm'}
              onClick={downloadReport}
              disabled={!((reportType === 'personality' && report) || (reportType === 'hermetic' && hermeticReport))}
              className={`${isMobile ? 'w-full justify-start' : ''}`}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button
              variant="outline"
              size={isMobile ? 'default' : 'sm'}
              onClick={reportType === 'hermetic' ? generateHermeticReport : generatePersonalityReport}
              disabled={generating}
              className={`${isMobile ? 'w-full justify-start' : ''}`}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
          </div>
        </div>
      )}

      <div className={`flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 ${spacing.gap} w-full min-w-0 max-w-full overflow-hidden`}>
        <div className="min-w-0 flex-1">
          <h3 className={`font-bold font-display break-words ${getTextSize('text-xl')}`}>
            {reportType === 'hermetic' ? 'Hermetic Blueprint Report' : 'Personality Report'}
          </h3>
          <p className={`text-muted-foreground ${getTextSize('text-sm')} break-words`}>
            {reportType === 'hermetic' 
              ? 'Esoteric analysis of your blueprint'
              : 'Comprehensive AI-generated personality analysis'
            }
          </p>
        </div>
        {onBack && (
          <Button
            variant="ghost" 
            onClick={onBack}
            className={`${spacing.button} ${isMobile ? 'self-start mt-2' : 'flex-shrink-0'}`}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
      </div>

      {/* Report Content */}
      {reportType === 'personality' && report && (
        <div className="w-full min-w-0 max-w-full overflow-hidden box-border">
          <PersonalityReportContent report={report} />
        </div>
      )}

      {reportType === 'hermetic' && hermeticReport && (
        <div className="w-full min-w-0 max-w-full overflow-hidden box-border">
          <HermeticReportContent report={hermeticReport} />
        </div>
      )}

      {/* Generation Prompts */}
      {reportType === 'personality' && !hasExistingPersonality && (
        <CosmicCard className={`${spacing.card} text-center w-full min-w-0 max-w-full overflow-hidden box-border`}>
          <FileText className={`${isMobile ? 'h-12 w-12' : 'h-16 w-16'} text-soul-purple mx-auto ${spacing.gap}`} />
          <h2 className={`${getTextSize('text-2xl')} font-bold ${spacing.text} gradient-text break-words`}>
            Generate Your Comprehensive Reading
          </h2>
          <p className={`text-muted-foreground ${spacing.gap} max-w-md mx-auto ${getTextSize('text-sm')} break-words`}>
            Create a detailed, AI-generated personality report that weaves together all aspects of your blueprint.
          </p>
          
          <Button
            onClick={generatePersonalityReport}
            disabled={generating}
            className={`bg-soul-purple hover:bg-soul-purple/90 ${isMobile ? 'w-full' : ''}`}
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
        </CosmicCard>
      )}

      {reportType === 'hermetic' && !hasExistingHermetic && (
        <CosmicCard className={`${spacing.card} text-center w-full min-w-0 max-w-full overflow-hidden box-border`}>
          <Brain className={`${isMobile ? 'h-12 w-12' : 'h-16 w-16'} text-soul-purple mx-auto ${spacing.gap}`} />
          <h2 className={`${getTextSize('text-2xl')} font-bold ${spacing.text} gradient-text break-words`}>
            Generate Your Hermetic Report
          </h2>
          <p className={`text-muted-foreground ${spacing.gap} max-w-md mx-auto ${getTextSize('text-sm')} break-words`}>
            Create an esoteric analysis of your blueprint through hermetic principles and ancient wisdom.
          </p>
          
          <Button
            onClick={generateHermeticReport}
            disabled={generating}
            className={`bg-soul-purple hover:bg-soul-purple/90 ${isMobile ? 'w-full' : ''}`}
            size={isMobile ? "default" : "lg"}
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Generate Hermetic Report
              </>
            )}
          </Button>
        </CosmicCard>
      )}

      {generating && (
        <div className={`text-center ${spacing.text} w-full`}>
          <p className={`${getTextSize('text-sm')} text-muted-foreground break-words`}>
            This process typically takes 30-60 seconds...
          </p>
        </div>
      )}
    </div>
  );
};

export default PersonalityReportViewer;
