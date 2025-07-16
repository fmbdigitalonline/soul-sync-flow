
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Sparkles, User, Heart, Brain, Compass, Zap, Plus, Trash2, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { aiPersonalityReportService, PersonalityReport } from '@/services/ai-personality-report-service';
import { hermeticPersonalityReportService, HermeticPersonalityReport } from '@/services/hermetic-personality-report-service';
import { blueprintService } from '@/services/blueprint-service';
import { useToast } from '@/hooks/use-toast';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';

interface PersonalityReportViewerProps {
  className?: string;
}

export const PersonalityReportViewer: React.FC<PersonalityReportViewerProps> = ({ className }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { spacing, getTextSize, isMobile, isUltraNarrow, isFoldDevice } = useResponsiveLayout();
  const [report, setReport] = useState<PersonalityReport | null>(null);
  const [hermeticReport, setHermeticReport] = useState<HermeticPersonalityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportType, setReportType] = useState<'standard' | 'hermetic'>('standard');

  useEffect(() => {
    loadReport();
  }, [user]);

  const loadReport = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Loading personality reports for user:', user.id);
      
      // Load both standard and Hermetic reports
      const [standardResult, hermeticResult] = await Promise.all([
        aiPersonalityReportService.getStoredReport(user.id),
        hermeticPersonalityReportService.getHermeticReport(user.id)
      ]);
      
      console.log('📊 Standard report result:', standardResult);
      console.log('🌟 Hermetic report result:', hermeticResult);
      
      // Set standard report
      if (standardResult.success && standardResult.report) {
        setReport(standardResult.report);
        console.log('✅ Standard report loaded successfully');
      }
      
      // Set Hermetic report
      if (hermeticResult.success && hermeticResult.report) {
        setHermeticReport(hermeticResult.report);
        console.log('🌟 Hermetic report loaded successfully');
        console.log('📊 Hermetic word count:', hermeticResult.report.report_content.word_count);
      }
      
      // Determine error state
      if (!standardResult.report && !hermeticResult.report) {
        setError('No personality reports found. Generate your first report below.');
      }
      
    } catch (err) {
      const errorMessage = 'Failed to load personality reports';
      setError(errorMessage);
      console.error('💥 Error loading personality reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (forceRegenerate = false) => {
    if (!user) return;
    
    setGenerating(true);
    setError(null);
    
    try {
      console.log('🎭 Starting standard personality report generation...', { forceRegenerate });
      
      // First, get the user's blueprint
      const blueprintResult = await blueprintService.getActiveBlueprintData();
      
      if (blueprintResult.error || !blueprintResult.data) {
        throw new Error('No active blueprint found. Please create your blueprint first.');
      }
      
      console.log('📋 Blueprint found, generating standard report...');
      
      // Generate the personality report
      const result = await aiPersonalityReportService.generatePersonalityReport(blueprintResult.data);
      
      if (result.success && result.report) {
        setReport(result.report);
        toast({
          title: "Standard Report Generated",
          description: "Your standard personality report has been created successfully!",
        });
        console.log('✅ Standard report generated successfully');
      } else {
        throw new Error(result.error || 'Failed to generate standard personality report');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate standard personality report';
      setError(errorMessage);
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
      console.error('💥 Error generating standard personality report:', err);
    } finally {
      setGenerating(false);
    }
  };

  const generateHermeticReport = async (forceRegenerate = false) => {
    if (!user) return;
    
    setGenerating(true);
    setError(null);
    
    try {
      console.log('🌟 Starting Hermetic Blueprint Report generation...', { forceRegenerate });
      
      // First, get the user's blueprint
      const blueprintResult = await blueprintService.getActiveBlueprintData();
      
      if (blueprintResult.error || !blueprintResult.data) {
        throw new Error('No active blueprint found. Please create your blueprint first.');
      }
      
      console.log('📋 Blueprint found, generating Hermetic report...');
      
      // Generate the Hermetic personality report
      const result = await hermeticPersonalityReportService.generateHermeticReport(blueprintResult.data);
      
      if (result.success && result.report) {
        setHermeticReport(result.report);
        setReportType('hermetic'); // Switch to view the new report
        toast({
          title: "Hermetic Report Generated",
          description: `Your comprehensive ${result.report.report_content.word_count}+ word Hermetic Blueprint report has been created!`,
        });
        console.log('🌟 Hermetic report generated successfully');
        console.log('📊 Hermetic report word count:', result.report.report_content.word_count);
      } else {
        throw new Error(result.error || 'Failed to generate Hermetic personality report');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate Hermetic personality report';
      setError(errorMessage);
      toast({
        title: "Hermetic Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
      console.error('💥 Error generating Hermetic personality report:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleRefresh = () => {
    loadReport();
  };

  const handleRegenerate = () => {
    if (reportType === 'hermetic') {
      generateHermeticReport(true);
    } else {
      generateReport(true);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${spacing.container} ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-soul-purple mx-auto mb-2" />
          <p className={`text-muted-foreground ${getTextSize('text-sm')}`}>Loading your personality report...</p>
        </div>
      </div>
    );
  }

  if (error || (!report && !hermeticReport)) {
    return (
      <div className={`${spacing.container} ${className}`}>
        <Card>
          <CardContent className={`${spacing.card} text-center`}>
            <div className="mb-4">
              <Sparkles className="h-12 w-12 text-soul-purple mx-auto mb-4" />
              <h3 className={`font-semibold mb-2 ${getTextSize('text-lg')}`}>Personality Report</h3>
              <p className={`text-muted-foreground mb-4 ${getTextSize('text-sm')} break-words`}>
                {error || 'No personality reports available'}
              </p>
            </div>
            <div className="flex flex-col gap-4 justify-center w-full">
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button 
                  onClick={() => generateReport(false)} 
                  disabled={generating}
                  className="bg-soul-purple hover:bg-soul-purple/90 w-full sm:w-auto"
                  size={isMobile ? "default" : "default"}
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Standard Report
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => generateHermeticReport(false)} 
                  disabled={generating}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white w-full sm:w-auto"
                  size={isMobile ? "default" : "default"}
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 mr-2" />
                      Hermetic Report (10,000+ words)
                    </>
                  )}
                </Button>
              </div>
              <Button onClick={handleRefresh} variant="outline" className="w-full sm:w-auto mx-auto">
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

  // Define the preferred order for sections
  const sectionOrder = [
    'integrated_summary',
    'core_personality_pattern',
    'decision_making_style',
    'relationship_style',
    'life_path_purpose',
    'current_energy_timing'
  ];

  // Get the current report based on type
  const currentReport = reportType === 'hermetic' ? hermeticReport : report;
  
  // Hermetic section mappings
  const hermeticSectionIcons = {
    hermetic_fractal_analysis: Star,
    consciousness_integration_map: Brain,
    practical_activation_framework: Zap,
    seven_laws_integration: Sparkles,
    system_translations: Compass,
    blueprint_signature: User
  };

  const hermeticSectionTitles = {
    hermetic_fractal_analysis: 'Hermetic Fractal Analysis',
    consciousness_integration_map: 'Consciousness Integration Map', 
    practical_activation_framework: 'Practical Activation Framework',
    seven_laws_integration: 'Seven Hermetic Laws Integration',
    system_translations: 'System Translations',
    blueprint_signature: 'Blueprint Signature'
  };

  return (
    <div className={`${className} w-full max-w-full overflow-hidden`}>
      {/* Report Type Toggle */}
      {(report || hermeticReport) && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex rounded-lg border p-1 bg-muted/50">
            <Button
              variant={reportType === 'standard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setReportType('standard')}
              disabled={!report}
              className="rounded-md px-3"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Standard Report
            </Button>
            <Button
              variant={reportType === 'hermetic' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setReportType('hermetic')}
              disabled={!hermeticReport}
              className="rounded-md px-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600"
            >
              <Star className="h-4 w-4 mr-2" />
              Hermetic Report
              {hermeticReport && (
                <Badge variant="outline" className="ml-2 bg-white/20 text-white border-white/30">
                  {hermeticReport.report_content.word_count}+ words
                </Badge>
              )}
            </Button>
          </div>
          
          {/* Generate missing report buttons */}
          <div className="flex gap-2">
            {!report && (
              <Button 
                onClick={() => generateReport(false)} 
                disabled={generating}
                variant="outline"
                size="sm"
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Generate Standard
              </Button>
            )}
            {!hermeticReport && (
              <Button 
                onClick={() => generateHermeticReport(false)} 
                disabled={generating}
                variant="outline"
                size="sm"
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Star className="h-4 w-4 mr-2" />
                )}
                Generate Hermetic
              </Button>
            )}
          </div>
        </div>
      )}

      <div className={`flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 ${spacing.gap} w-full`}>
        <div className="min-w-0 flex-1">
          <h3 className={`font-bold font-display break-words ${getTextSize('text-xl')}`}>
            {reportType === 'hermetic' ? 'Hermetic Blueprint Report' : 'Personality Report'}
          </h3>
          <p className={`text-muted-foreground break-words ${getTextSize('text-sm')}`}>
            {currentReport && `Generated on ${new Date(currentReport.generated_at).toLocaleDateString()}`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0">
          <Badge variant="outline" className="bg-soul-purple/10 text-soul-purple border-soul-purple/20 justify-center sm:justify-start">
            <Sparkles className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">Soul Generated</span>
          </Badge>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              onClick={handleRegenerate} 
              variant="outline" 
              size="sm"
              disabled={generating}
              className="flex-1 sm:flex-none"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span className="ml-1 sm:ml-2">{generating ? 'Regenerating...' : 'Regenerate'}</span>
            </Button>
            <Button onClick={handleRefresh} variant="ghost" size="sm" className="flex-shrink-0">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[600px] w-full">
        <div className={`space-y-4 sm:space-y-6 pr-2 sm:pr-4 w-full max-w-full`}>
          {(() => {
            if (!currentReport) return null;
            
            const isHermetic = reportType === 'hermetic';
            const reportContent = currentReport.report_content;
            
            // Get appropriate section mappings
            const icons = isHermetic ? hermeticSectionIcons : sectionIcons;
            const titles = isHermetic ? hermeticSectionTitles : sectionTitles;
            
            // Handle Hermetic report structure
            if (isHermetic) {
              const hermeticContent = reportContent as any; // Type assertion for Hermetic content
              
              // Helper function to extract displayable content from any nested structure
              const extractDisplayContent = (content: any): string => {
                console.log("🕵️‍♀️ rendering content:", content, typeof content);
                
                if (typeof content === 'string') {
                  return content;
                }
                if (content && typeof content === 'object') {
                  // Recursively extract string values from nested objects
                  const extractStrings = (obj: any, depth = 0): string[] => {
                    if (depth > 5) return []; // Prevent infinite recursion
                    const strings: string[] = [];
                    for (const [key, value] of Object.entries(obj)) {
                      if (typeof value === 'string' && value.length > 10) { // Only meaningful strings
                        strings.push(`**${key.replace(/_/g, ' ').toUpperCase()}:**\n${value}`);
                      } else if (value && typeof value === 'object') {
                        strings.push(...extractStrings(value, depth + 1));
                      }
                    }
                    return strings;
                  };
                  const extractedStrings = extractStrings(content);
                  return extractedStrings.length > 0 ? extractedStrings.join('\n\n') : JSON.stringify(content, null, 2);
                }
                return String(content);
              };
              
              const hermeticEntries = [
                ['hermetic_fractal_analysis', hermeticContent.hermetic_fractal_analysis],
                ['consciousness_integration_map', hermeticContent.consciousness_integration_map],
                ['practical_activation_framework', hermeticContent.practical_activation_framework],
                ['seven_laws_integration', hermeticContent.seven_laws_integration],
                ['system_translations', hermeticContent.system_translations],
                ['blueprint_signature', hermeticContent.blueprint_signature]
              ];
              
              return hermeticEntries.map(([key, content]) => {
                const IconComponent = icons[key as keyof typeof icons];
                const title = titles[key as keyof typeof titles];
                
                // Handle seven laws structure
                if (key === 'seven_laws_integration' && content && typeof content === 'object') {
                  return (
                    <div key={key} className="space-y-4">
                      {Object.entries(content).map(([lawKey, lawContent]) => {
                        // Use the extractDisplayContent function for consistent handling
                        const displayContent = extractDisplayContent(lawContent);
                        
                        if (!displayContent || displayContent === 'Content unavailable') return null;
                        
                        return (
                          <CosmicCard key={`${key}-${lawKey}`} className="w-full max-w-full border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
                            <CardHeader className="pb-3">
                              <CardTitle className={`flex flex-col sm:flex-row sm:items-center gap-2 ${getTextSize('text-lg')} break-words`}>
                                <div className="flex items-center gap-2 min-w-0">
                                  <Star className="h-5 w-5 text-purple-600 flex-shrink-0" />
                                  <span className="break-words">Law of {lawKey.charAt(0).toUpperCase() + lawKey.slice(1)}</span>
                                </div>
                                <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 w-fit">
                                  {displayContent.length} chars
                                </Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="prose prose-sm max-w-none w-full">
                                <p className={`text-gray-700 leading-relaxed whitespace-pre-wrap break-words w-full ${getTextSize('text-sm')}`}>
                                  {typeof displayContent === "string"
                                    ? displayContent
                                    : JSON.stringify(displayContent, null, 2)}
                                </p>
                              </div>
                            </CardContent>
                          </CosmicCard>
                        );
                      })}
                    </div>
                  );
                }
                
                // Handle system translations structure
                if (key === 'system_translations' && content && typeof content === 'object') {
                  return (
                    <div key={key} className="space-y-4">
                      {Object.entries(content).map(([systemKey, systemContent]) => {
                        // Use the extractDisplayContent function for consistent handling
                        const displayContent = extractDisplayContent(systemContent);
                        
                        if (!displayContent || displayContent === 'Content unavailable') return null;
                        
                        return (
                          <CosmicCard key={`${key}-${systemKey}`} className="w-full max-w-full border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                            <CardHeader className="pb-3">
                              <CardTitle className={`flex flex-col sm:flex-row sm:items-center gap-2 ${getTextSize('text-lg')} break-words`}>
                                <div className="flex items-center gap-2 min-w-0">
                                  <Compass className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                  <span className="break-words">{systemKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                </div>
                                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 w-fit">
                                  {displayContent.length} chars
                                </Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="prose prose-sm max-w-none w-full">
                                <p className={`text-gray-700 leading-relaxed whitespace-pre-wrap break-words w-full ${getTextSize('text-sm')}`}>
                                  {typeof displayContent === "string"
                                    ? displayContent
                                    : JSON.stringify(displayContent, null, 2)}
                                </p>
                              </div>
                            </CardContent>
                          </CosmicCard>
                        );
                      })}
                    </div>
                  );
                }
                
                // Regular Hermetic sections - use comprehensive content extraction
                const displayContent = extractDisplayContent(content);
                
                if (!displayContent || displayContent === 'Content unavailable') {
                  return (
                    <CosmicCard key={key} className="border-orange-200 bg-orange-50 w-full max-w-full">
                      <CardHeader className="pb-3">
                        <CardTitle className={`flex flex-col sm:flex-row sm:items-center gap-2 text-orange-800 ${getTextSize('text-lg')} break-words`}>
                           <div className="flex items-center gap-2 min-w-0">
                            {IconComponent && React.createElement(IconComponent, { className: "h-5 w-5 flex-shrink-0" })}
                            <span className="break-words">{title}</span>
                          </div>
                          <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 w-fit">
                            Missing Content
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className={`text-orange-600 ${getTextSize('text-sm')} break-words`}>
                          This section content is unavailable. Try regenerating the report.
                        </p>
                      </CardContent>
                    </CosmicCard>
                  );
                }
                
                return (
                  <CosmicCard key={key} className="w-full max-w-full border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
                    <CardHeader className="pb-3">
                      <CardTitle className={`flex flex-col sm:flex-row sm:items-center gap-2 ${getTextSize('text-lg')} break-words`}>
                         <div className="flex items-center gap-2 min-w-0">
                          {IconComponent && React.createElement(IconComponent, { className: "h-5 w-5 text-purple-600 flex-shrink-0" })}
                          <span className="break-words">{title}</span>
                        </div>
                        <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 w-fit">
                          {displayContent.length} chars
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none w-full">
                        <p className={`text-gray-700 leading-relaxed whitespace-pre-wrap break-words w-full ${getTextSize('text-sm')}`}>
                          {typeof displayContent === "string"
                            ? displayContent
                            : JSON.stringify(displayContent, null, 2)}
                        </p>
                      </div>
                    </CardContent>
                  </CosmicCard>
                );
              });
            }
            
            // Standard report rendering
            const sortedEntries = Object.entries(reportContent).sort(([keyA], [keyB]) => {
              const indexA = sectionOrder.indexOf(keyA);
              const indexB = sectionOrder.indexOf(keyB);
              
              if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
              }
              
              if (indexA !== -1) return -1;
              if (indexB !== -1) return 1;
              
              return 0;
            });
            
            return sortedEntries.map(([key, content]) => {
              const IconComponent = icons[key as keyof typeof icons];
              const title = titles[key as keyof typeof titles];
              
              if (!content || content === 'Content unavailable') {
                return (
                  <CosmicCard key={key} className="border-orange-200 bg-orange-50 w-full max-w-full">
                    <CardHeader className="pb-3">
                      <CardTitle className={`flex flex-col sm:flex-row sm:items-center gap-2 text-orange-800 ${getTextSize('text-lg')} break-words`}>
                         <div className="flex items-center gap-2 min-w-0">
                          {IconComponent && React.createElement(IconComponent, { className: "h-5 w-5 flex-shrink-0" })}
                          <span className="break-words">{title}</span>
                        </div>
                        <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 w-fit">
                          Missing Content
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-orange-600 ${getTextSize('text-sm')} break-words`}>
                        This section content is unavailable. Try regenerating the report.
                      </p>
                    </CardContent>
                  </CosmicCard>
                );
              }
              
              return (
                <CosmicCard key={key} className="w-full max-w-full">
                  <CardHeader className="pb-3">
                    <CardTitle className={`flex flex-col sm:flex-row sm:items-center gap-2 ${getTextSize('text-lg')} break-words`}>
                       <div className="flex items-center gap-2 min-w-0">
                        {IconComponent && React.createElement(IconComponent, { className: "h-5 w-5 text-soul-purple flex-shrink-0" })}
                        <span className="break-words">{title}</span>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-fit">
                        {content.length} chars
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none w-full">
                      <p className={`text-gray-700 leading-relaxed whitespace-pre-wrap break-words w-full ${getTextSize('text-sm')}`}>
                        {content}
                      </p>
                    </div>
                  </CardContent>
                </CosmicCard>
              );
            });
          })()}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PersonalityReportViewer;
