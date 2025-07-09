
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Sparkles, User, Heart, Brain, Compass, Zap, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { aiPersonalityReportService, PersonalityReport } from '@/services/ai-personality-report-service';
import { blueprintService } from '@/services/blueprint-service';
import { useToast } from '@/hooks/use-toast';
import { CosmicCard } from '@/components/ui/cosmic-card';

interface PersonalityReportViewerProps {
  className?: string;
}

export const PersonalityReportViewer: React.FC<PersonalityReportViewerProps> = ({ className }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [report, setReport] = useState<PersonalityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReport();
  }, [user]);

  const loadReport = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Loading personality report for user:', user.id);
      const result = await aiPersonalityReportService.getStoredReport(user.id);
      
      console.log('📊 Report loading result:', result);
      
      if (result.success && result.report) {
        setReport(result.report);
        console.log('✅ Report loaded successfully');
        console.log('📋 Report content sections:', Object.keys(result.report.report_content));
        console.log('📊 Section lengths:', 
          Object.entries(result.report.report_content).map(([key, content]) => 
            `${key}: ${typeof content === 'string' ? content.length : 0} chars`
          )
        );
      } else if (result.error) {
        setError(result.error);
        console.log('❌ Error loading report:', result.error);
      } else {
        setError('No personality report found. Click "Generate Report" to create one.');
        console.log('📝 No report found - needs generation');
      }
    } catch (err) {
      const errorMessage = 'Failed to load personality report';
      setError(errorMessage);
      console.error('💥 Error loading personality report:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (forceRegenerate = false) => {
    if (!user) return;
    
    setGenerating(true);
    setError(null);
    
    try {
      console.log('🎭 Starting personality report generation...', { forceRegenerate });
      
      // First, get the user's blueprint
      const blueprintResult = await blueprintService.getActiveBlueprintData();
      
      if (blueprintResult.error || !blueprintResult.data) {
        throw new Error('No active blueprint found. Please create your blueprint first.');
      }
      
      console.log('📋 Blueprint found, generating report...');
      
      // Generate the personality report
      const result = await aiPersonalityReportService.generatePersonalityReport(blueprintResult.data);
      
      if (result.success && result.report) {
        setReport(result.report);
        toast({
          title: "Report Generated",
          description: "Your personality report has been created successfully!",
        });
        console.log('✅ Report generated successfully');
        console.log('📊 New report section lengths:', 
          Object.entries(result.report.report_content).map(([key, content]) => 
            `${key}: ${typeof content === 'string' ? content.length : 0} chars`
          )
        );
      } else {
        throw new Error(result.error || 'Failed to generate personality report');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate personality report';
      setError(errorMessage);
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
      console.error('💥 Error generating personality report:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleRefresh = () => {
    loadReport();
  };

  const handleRegenerate = () => {
    generateReport(true);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-soul-purple mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading your personality report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className={`p-4 ${className}`}>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <Sparkles className="h-12 w-12 text-soul-purple mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Personality Report</h3>
              <p className="text-muted-foreground mb-4">
                {error || 'No personality report available'}
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={() => generateReport(false)} 
                disabled={generating}
                className="bg-soul-purple hover:bg-soul-purple/90"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sectionIcons = {
    core_personality_pattern: User,
    decision_making_style: Brain,
    relationship_style: Heart,
    life_path_purpose: Compass,
    current_energy_timing: Zap,
    integrated_summary: Sparkles
  };

  const sectionTitles = {
    core_personality_pattern: 'Core Personality Pattern',
    decision_making_style: 'Decision Making Style',
    relationship_style: 'Relationship Style',
    life_path_purpose: 'Life Path & Purpose',
    current_energy_timing: 'Current Energy & Timing',
    integrated_summary: 'Integrated Summary'
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold font-display">Your Personality Report</h3>
          <p className="text-sm text-muted-foreground">
            Generated on {new Date(report.generated_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-soul-purple/10 text-soul-purple border-soul-purple/20">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Generated
          </Badge>
          <Button 
            onClick={handleRegenerate} 
            variant="outline" 
            size="sm"
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {generating ? 'Regenerating...' : 'Regenerate'}
          </Button>
          <Button onClick={handleRefresh} variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[600px] w-full">
        <div className="space-y-6 pr-4">
          {Object.entries(report.report_content).map(([key, content]) => {
            const IconComponent = sectionIcons[key as keyof typeof sectionIcons];
            const title = sectionTitles[key as keyof typeof sectionTitles];
            
            if (!content || content === 'Content unavailable') {
              return (
                <CosmicCard key={key} className="border-orange-200 bg-orange-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg text-orange-800">
                      {IconComponent && <IconComponent className="h-5 w-5" />}
                      {title}
                      <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                        Missing Content
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-orange-600 text-sm">
                      This section content is unavailable. Try regenerating the report.
                    </p>
                  </CardContent>
                </CosmicCard>
              );
            }
            
            return (
              <CosmicCard key={key}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {IconComponent && <IconComponent className="h-5 w-5 text-soul-purple" />}
                    {title}
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {content.length} chars
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {content}
                    </p>
                  </div>
                </CardContent>
              </CosmicCard>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PersonalityReportViewer;
