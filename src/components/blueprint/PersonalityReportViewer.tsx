import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, RefreshCw, Sparkles, User, Heart, Brain, Compass, Zap, Plus, Trash2, Star, ChevronDown, ChevronRight, Target, Moon } from 'lucide-react';
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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    hermetic_laws: false,
    gate_analyses: false,
    shadow_work: false,
    system_translations: false,
    practical_framework: false
  });

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
        console.log('📅 Hermetic report generated:', hermeticResult.report.generated_at);
        console.log('🆔 Hermetic report ID:', hermeticResult.report.id);
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
        // Clear current report state to show loading
        console.log('🔄 Clearing current hermetic report state for refresh...');
        setHermeticReport(null);
        
        // Set initial report from generation
        setHermeticReport(result.report);
        setReportType('hermetic'); // Switch to view the new report
        
        // Force fresh data load from database to ensure UI consistency
        console.log('🔄 Force-refreshing hermetic report from database...');
        await loadReport();
        
        toast({
          title: "Hermetic Report Generated",
          description: `Your comprehensive ${result.report.report_content.word_count}+ word Hermetic Blueprint report has been created!`,
        });
        console.log('🌟 Hermetic report generated successfully');
        console.log('📊 Hermetic report word count:', result.report.report_content.word_count);
        console.log('✅ UI refreshed with latest database state');
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

  // Helper function to safely render content
  const renderSafeContent = (content: any, contentType: string = 'Unknown') => {
    if (typeof content === 'string') {
      return (
        <p className={`text-gray-700 leading-relaxed whitespace-pre-wrap break-words w-full ${getTextSize('text-sm')}`}>
          {content}
        </p>
      );
    } else if (typeof content === 'object' && content !== null) {
      console.warn(`⚠️ Object content detected for ${contentType}:`, content);
      return (
        <div className="space-y-2">
          <p className={`text-amber-600 font-medium ${getTextSize('text-xs')}`}>
            Debug: Object content detected - displaying as JSON
          </p>
          <pre className={`bg-gray-50 p-3 rounded text-xs overflow-x-auto border ${getTextSize('text-xs')}`}>
            {JSON.stringify(content, null, 2)}
          </pre>
        </div>
      );
    } else {
      return (
        <p className={`text-gray-500 italic ${getTextSize('text-sm')}`}>
          No valid content available
        </p>
      );
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

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const CollapsibleSection = ({ 
    title, 
    sectionKey, 
    icon: Icon, 
    children, 
    badge,
    className = "border border-gray-200 bg-white"
  }: {
    title: string;
    sectionKey: string;
    icon: any;
    children: React.ReactNode;
    badge?: string;
    className?: string;
  }) => {
    const isExpanded = expandedSections[sectionKey];
    
    return (
      <Collapsible 
        open={isExpanded} 
        onOpenChange={() => toggleSection(sectionKey)}
        className={`rounded-lg ${className}`}
      >
        <CollapsibleTrigger asChild>
          <div className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors rounded-lg">
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-purple-600 flex-shrink-0" />
              <h2 className={`font-bold ${getTextSize('text-lg')} break-words`}>{title}</h2>
              {badge && (
                <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                  {badge}
                </Badge>
              )}
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-4">
          {children}
        </CollapsibleContent>
      </Collapsible>
    );
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
            
            // Handle Hermetic report structure with collapsible sections
            if (isHermetic) {
              const hermeticContent = reportContent as any;
              
              return (
                <div className="space-y-4">
                  {/* Overview Section */}
                  <CollapsibleSection
                    title="Overview"
                    sectionKey="overview"
                    icon={Sparkles}
                    badge={`${hermeticContent.word_count || 0}+ words`}
                    className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
                  >
                    <div className="space-y-4">
                      <CosmicCard className="border-green-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5 text-green-600" />
                            Integrated Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="prose prose-sm max-w-none">
                            {renderSafeContent(hermeticContent.integrated_summary, 'Integrated Summary')}
                          </div>
                        </CardContent>
                      </CosmicCard>
                    </div>
                  </CollapsibleSection>

                  {/* Seven Hermetic Laws Section */}
                  <CollapsibleSection
                    title="Seven Hermetic Laws Analysis"
                    sectionKey="hermetic_laws"
                    icon={Star}
                    badge={`${Object.keys(hermeticContent.seven_laws_integration || {}).length} laws`}
                    className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50"
                  >
                    <div className="space-y-4">
                      {hermeticContent.seven_laws_integration && Object.entries(hermeticContent.seven_laws_integration).map(([lawKey, lawContent]) => (
                        <CosmicCard key={lawKey} className="border-purple-200">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Star className="h-5 w-5 text-purple-600" />
                              <h3>Law of {lawKey.charAt(0).toUpperCase() + lawKey.slice(1)}</h3>
                              <Badge variant="outline" className="bg-purple-100 text-purple-700">
                                {typeof lawContent === 'string' ? `${lawContent.length} chars` : 'Object'}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="prose prose-sm max-w-none">
                              {renderSafeContent(lawContent, `Law of ${lawKey}`)}
                            </div>
                          </CardContent>
                        </CosmicCard>
                      ))}
                    </div>
                  </CollapsibleSection>

                  {/* Gate Analyses Section */}
                  <CollapsibleSection
                    title="Gate Analyses"
                    sectionKey="gate_analyses"
                    icon={Target}
                    badge={`${Object.keys(hermeticContent.gate_analyses || {}).length} gates`}
                    className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50"
                  >
                    <div className="space-y-4">
                      {hermeticContent.gate_analyses && Object.entries(hermeticContent.gate_analyses).map(([gateKey, gateContent]) => {
                        const gateNumber = gateKey.replace('gate_', '');
                        return (
                          <CosmicCard key={gateKey} className="border-orange-200">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-orange-600" />
                                <h3>Gate {gateNumber}</h3>
                                <Badge variant="outline" className="bg-orange-100 text-orange-700">
                                  {typeof gateContent === 'string' ? `${gateContent.length} chars` : 'Object'}
                                </Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="prose prose-sm max-w-none">
                                {renderSafeContent(gateContent, `Gate ${gateNumber}`)}
                              </div>
                            </CardContent>
                          </CosmicCard>
                        );
                      })}
                    </div>
                  </CollapsibleSection>

                  {/* Shadow Work Integration Section */}
                  <CollapsibleSection
                    title="Shadow Work Integration"
                    sectionKey="shadow_work"
                    icon={Moon}
                    badge="Deep Integration"
                    className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50"
                  >
                    <div className="space-y-4">
                      {hermeticContent.shadow_work_integration && Object.entries(hermeticContent.shadow_work_integration).map(([shadowKey, shadowContent]) => (
                        <CosmicCard key={shadowKey} className="border-indigo-200">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Moon className="h-5 w-5 text-indigo-600" />
                              <h3>{shadowKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="prose prose-sm max-w-none">
                              {renderSafeContent(shadowContent, shadowKey)}
                            </div>
                          </CardContent>
                        </CosmicCard>
                      ))}
                    </div>
                  </CollapsibleSection>

                  {/* System Translations Section */}
                  <CollapsibleSection
                    title="System Translations"
                    sectionKey="system_translations"
                    icon={Compass}
                    badge={`${Object.keys(hermeticContent.system_translations || {}).length} systems`}
                    className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50"
                  >
                    <div className="space-y-4">
                      {hermeticContent.system_translations && Object.entries(hermeticContent.system_translations).map(([systemKey, systemContent]) => (
                        <CosmicCard key={systemKey} className="border-blue-200">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Compass className="h-5 w-5 text-blue-600" />
                              <h3>{systemKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
                              <Badge variant="outline" className="bg-blue-100 text-blue-700">
                                {typeof systemContent === 'string' ? `${systemContent.length} chars` : 'Object'}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="prose prose-sm max-w-none">
                              {renderSafeContent(systemContent, systemKey)}
                            </div>
                          </CardContent>
                        </CosmicCard>
                      ))}
                    </div>
                  </CollapsibleSection>

                  {/* Practical Framework Section */}
                  <CollapsibleSection
                    title="Practical Framework"
                    sectionKey="practical_framework"
                    icon={Zap}
                    badge="Applications"
                    className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50"
                  >
                    <div className="space-y-4">
                      <CosmicCard className="border-emerald-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-emerald-600" />
                            Practical Activation Framework
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="prose prose-sm max-w-none">
                            {renderSafeContent(hermeticContent.practical_activation_framework, 'Practical Framework')}
                          </div>
                        </CardContent>
                      </CosmicCard>
                      
                      <CosmicCard className="border-emerald-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5 text-emerald-600" />
                            Consciousness Integration Map
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="prose prose-sm max-w-none">
                            {renderSafeContent(hermeticContent.consciousness_integration_map, 'Consciousness Map')}
                          </div>
                        </CardContent>
                      </CosmicCard>
                    </div>
                  </CollapsibleSection>
                </div>
              );
            }
            
            // Standard report rendering with safe content handling
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
                        {typeof content === 'string' ? `${content.length} chars` : 'Object'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none w-full">
                      {renderSafeContent(content, title || key)}
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
