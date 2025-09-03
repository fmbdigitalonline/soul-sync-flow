import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, RefreshCw, Sparkles, User, Heart, Brain, Compass, Zap, Plus, Trash2, Star, ChevronDown, ChevronRight, Target, Moon, Shield, Lightbulb, Settings, MessageSquare, Users, Layers, TrendingUp, Activity, UserCheck, Palette, Gauge, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { aiPersonalityReportService, PersonalityReport } from '@/services/ai-personality-report-service';
import { hermeticPersonalityReportService, HermeticPersonalityReport } from '@/services/hermetic-personality-report-service';
import { blueprintService } from '@/services/blueprint-service';
import { useToast } from '@/hooks/use-toast';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useGenerationJobControl } from '@/hooks/use-generation-job-control';
import { JOB_TYPES } from '@/services/job-control-service';
import { IntelligentSoulOrb } from '@/components/ui/intelligent-soul-orb';

type GenerationMethod = 'client' | 'background';

interface PersonalityReportViewerProps {
  className?: string;
}

export const PersonalityReportViewer: React.FC<PersonalityReportViewerProps> = ({ className }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { spacing, getTextSize, isMobile, isUltraNarrow, isFoldDevice } = useResponsiveLayout();
  
  // Initialize generation job control
  const generationControl = useGenerationJobControl();
  
  const [report, setReport] = useState<PersonalityReport | null>(null);
  const [hermeticReport, setHermeticReport] = useState<HermeticPersonalityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportType, setReportType] = useState<'standard' | 'hermetic'>('standard');
  const [showMethodDialog, setShowMethodDialog] = useState(false);
  const [pendingGeneration, setPendingGeneration] = useState<{ type: 'standard' | 'hermetic', forceRegenerate: boolean } | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    hermetic_laws: false,
    gate_analyses: false,
    shadow_work: false,
    system_translations: false,
    practical_framework: false,
    intelligence_analysis: false
  });

  // Use job control progress mapping for orb visualization
  const progressMapping = generationControl.progressMapping || { progress: 0, color: 'default', showCelebration: false };
  
  // Determine orb visual state based on job progress
  const getOrbVisualState = () => {
    if (!generationControl.isGenerating) return { showProgress: false, progress: 0, showCelebration: false };
    
    return {
      showProgress: true,
      progress: progressMapping.progress,
      showCelebration: progressMapping.showCelebration
    };
  };

  // Progress mapping for legacy compatibility
  const getHermeticProgress = () => {
    return progressMapping.progress;
  };

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

  /**
   * ENHANCED CLIENT-SIDE GENERATION WITH JOB CONTROL
   * PHASE 2: Integrates with job control system and coordinated loading
   */
  const generateReport = async (method: GenerationMethod = 'client', forceRegenerate = false) => {
    if (!user) return;
    
    // Check if generation is allowed (client-side mutex)
    if (generationControl.isGenerationBlocked()) {
      toast({
        title: "Generation Already Active",
        description: generationControl.getBlockingReason(),
        variant: "destructive"
      });
      return;
    }
    
    setError(null);
    
    try {
      console.log(`🎭 Starting ${method} standard personality report generation...`, { forceRegenerate });
      
      // Atomic job creation with database mutex
      const jobResult = await generationControl.startGeneration(
        method,
        JOB_TYPES.HERMETIC_REPORT,
        { 
          reportType: 'standard', 
          forceRegenerate, 
          language,
          userId: user.id 
        }
      );
      
      if (!jobResult.success) {
        if (jobResult.error === 'DUPLICATE_JOB') {
          toast({
            title: "Generation Already Running",
            description: "A report generation is already in progress. Please wait for it to complete.",
            variant: "destructive"
          });
        } else {
          throw new Error(jobResult.error || 'Failed to start generation');
        }
        return;
      }
      
      // CLIENT-SIDE GENERATION: Execute immediately
      if (method === 'client') {
        console.log('📋 Client-side generation: Getting blueprint...');
        
        // Get the user's blueprint
        const blueprintResult = await blueprintService.getActiveBlueprintData();
        
        if (blueprintResult.error || !blueprintResult.data) {
          throw new Error('No active blueprint found. Please create your blueprint first.');
        }
        
        // Update progress
        await generationControl.updateProgress({ phase: 'generating', progress: 25 });
        
        console.log('📋 Blueprint found, generating standard report...');
        
        // Generate the personality report
        const result = await aiPersonalityReportService.generatePersonalityReport(blueprintResult.data, language);
        
        if (result.success && result.report) {
          setReport(result.report);
          
          // Complete the job successfully
          await generationControl.completeGeneration(true, result.report);
          
          toast({
            title: t('report.standardGenerated'),
            description: t('report.standardGeneratedDescription'),
          });
          console.log('✅ Standard report generated successfully');
        } else {
          throw new Error(result.error || 'Failed to generate standard personality report');
        }
      }
      
      // BACKGROUND GENERATION: Show polling status
      if (method === 'background') {
        toast({
          title: "Background Generation Started",
          description: "Your report is being generated in the background. You can leave this page and return later.",
        });
        console.log(`🔄 Background generation started: ${jobResult.jobId}`);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate standard personality report';
      setError(errorMessage);
      
      // Complete job with error
      if (generationControl.activeJobId) {
        await generationControl.completeGeneration(false, null, errorMessage);
      }
      
      toast({
        title: t('report.generationFailed'),
        description: errorMessage,
        variant: "destructive"
      });
      console.error('💥 Error generating standard personality report:', err);
    }
  };

  const generateHermeticReport = async (method: GenerationMethod = 'client', forceRegenerate = false) => {
    if (!user) return;
    
    // Check if generation is allowed (client-side mutex)
    if (generationControl.isGenerationBlocked()) {
      toast({
        title: "Generation Already Active",
        description: generationControl.getBlockingReason(),
        variant: "destructive"
      });
      return;
    }
    
    setError(null);
    
    try {
      console.log(`🌟 Starting ${method} Hermetic Blueprint Report generation...`, { forceRegenerate });
      
      // Atomic job creation with database mutex
      const jobResult = await generationControl.startGeneration(
        method,
        JOB_TYPES.HERMETIC_REPORT,
        { 
          reportType: 'hermetic', 
          forceRegenerate, 
          language,
          userId: user.id 
        }
      );
      
      if (!jobResult.success) {
        if (jobResult.error === 'DUPLICATE_JOB') {
          toast({
            title: "Generation Already Running",
            description: "A report generation is already in progress. Please wait for it to complete.",
            variant: "destructive"
          });
        } else {
          throw new Error(jobResult.error || 'Failed to start generation');
        }
        return;
      }
      
      // CLIENT-SIDE GENERATION: Execute immediately
      if (method === 'client') {
        console.log('📋 Client-side generation: Getting blueprint...');
        
        // Get the user's blueprint
        const blueprintResult = await blueprintService.getActiveBlueprintData();
        
        if (blueprintResult.error || !blueprintResult.data) {
          throw new Error('No active blueprint found. Please create your blueprint first.');
        }
        
        // Update progress
        await generationControl.updateProgress({ phase: 'generating', progress: 10 });
        
        console.log('📋 Blueprint found, generating Hermetic report...');
        
        // Generate the Hermetic personality report
        const result = await hermeticPersonalityReportService.generateHermeticReport(blueprintResult.data, language);
        
        if (result.success && result.report) {
          // Clear current report state to show loading
          console.log('🔄 Clearing current hermetic report state for refresh...');
          setHermeticReport(null);
          
          // Set initial report from generation
          setHermeticReport(result.report);
          setReportType('hermetic'); // Switch to view the new report
          
          // Update progress
          await generationControl.updateProgress({ phase: 'finalizing', progress: 95 });
          
          // Force fresh data load from database to ensure UI consistency
          console.log('🔄 Force-refreshing hermetic report from database...');
          await loadReport();
          
          // Complete the job successfully
          await generationControl.completeGeneration(true, result.report);
          
          toast({
            title: t('report.hermeticGenerated'),
            description: `Your comprehensive ${result.report.report_content.word_count}+ word Hermetic Blueprint report has been created!`,
          });
          console.log('🌟 Hermetic report generated successfully');
          console.log('📊 Hermetic report word count:', result.report.report_content.word_count);
          console.log('✅ UI refreshed with latest database state');
        } else {
          throw new Error(result.error || 'Failed to generate Hermetic personality report');
        }
      }
      
      // BACKGROUND GENERATION: Show polling status  
      if (method === 'background') {
        toast({
          title: "Background Generation Started",
          description: "Your Hermetic report is being generated in the background. This will take about 1 hour - you can leave and return later.",
        });
        console.log(`🔄 Background Hermetic generation started: ${jobResult.jobId}`);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate Hermetic personality report';
      setError(errorMessage);
      
      // Complete job with error
      if (generationControl.activeJobId) {
        await generationControl.completeGeneration(false, null, errorMessage);
      }
      
      toast({
        title: t('report.hermeticGenerationFailed'),
        description: errorMessage,
        variant: "destructive"
      });
      console.error('💥 Error generating Hermetic personality report:', err);
    }
  };

  const handleRefresh = () => {
    loadReport();
  };

  const handleRegenerate = () => {
    if (reportType === 'hermetic') {
      setPendingGeneration({ type: 'hermetic', forceRegenerate: true });
      setShowMethodDialog(true);
    } else {
      setPendingGeneration({ type: 'standard', forceRegenerate: true });
      setShowMethodDialog(true);
    }
  };

  const handleGenerateClick = (type: 'standard' | 'hermetic', forceRegenerate = false) => {
    setPendingGeneration({ type, forceRegenerate });
    setShowMethodDialog(true);
  };

  const handleMethodSelection = async (method: GenerationMethod) => {
    setShowMethodDialog(false);
    
    if (pendingGeneration) {
      if (pendingGeneration.type === 'hermetic') {
        await generateHermeticReport(method, pendingGeneration.forceRegenerate);
      } else {
        await generateReport(method, pendingGeneration.forceRegenerate);
      }
      setPendingGeneration(null);
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
          <p className={`text-muted-foreground ${getTextSize('text-sm')}`}>{t('report.loading')}</p>
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
              <h3 className={`font-semibold mb-2 ${getTextSize('text-lg')}`}>{t('report.title')}</h3>
              <p className={`text-muted-foreground mb-4 ${getTextSize('text-sm')} break-words`}>
                {error || t('report.noReports')}
              </p>
            </div>
            <div className="flex flex-col gap-4 justify-center w-full">
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button 
                  onClick={() => handleGenerateClick('standard', false)} 
                  disabled={generationControl.isGenerating}
                  className="bg-soul-purple hover:bg-soul-purple/90 w-full sm:w-auto"
                  size={isMobile ? "default" : "default"}
                >
                  {generationControl.isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('report.generating')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {t('report.standardReport')}
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => handleGenerateClick('hermetic', false)} 
                  disabled={generationControl.isGenerating}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white w-full sm:w-auto"
                  size={isMobile ? "default" : "default"}
                >
                  {generationControl.isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('report.generating')}
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 mr-2" />
                      {t('report.hermeticReportLong')}
                    </>
                  )}
                </Button>
              </div>
              <Button onClick={handleRefresh} variant="outline" className="w-full sm:w-auto mx-auto">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('report.refresh')}
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
  
  // Intelligence Analysis section mappings for 12 dimensions
  const intelligenceIcons = {
    identity_constructs: Shield,
    behavioral_triggers: Lightbulb,
    execution_bias: Settings,
    linguistic_fingerprint: MessageSquare,
    relationship_dynamics: Users,
    decision_architecture: Layers,
    value_hierarchy_mapping: TrendingUp,
    life_energy_flow: Activity,
    psychographic_profiling: UserCheck,
    shadow_integration_analysis: Moon,
    cognitive_bias_mapping: Palette,
    transformation_readiness_index: Gauge
  };

  const intelligenceTitles = {
    identity_constructs: 'Identity Constructs',
    behavioral_triggers: 'Behavioral Triggers',
    execution_bias: 'Execution Bias',
    linguistic_fingerprint: 'Linguistic Fingerprint',
    relationship_dynamics: 'Relationship Dynamics',
    decision_architecture: 'Decision Architecture', 
    value_hierarchy_mapping: 'Value Hierarchy Mapping',
    life_energy_flow: 'Life Energy Flow',
    psychographic_profiling: 'Psychographic Profiling',
    shadow_integration_analysis: 'Shadow Integration Analysis',
    cognitive_bias_mapping: 'Cognitive Bias Mapping',
    transformation_readiness_index: 'Transformation Readiness Index'
  };
  
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

  const SectionHeader = ({ title, isExpanded, onClick, icon: Icon, badge }: { 
    title: string; 
    isExpanded: boolean; 
    onClick: () => void;
    icon?: any;
    badge?: string;
  }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between ${spacing.button} ${getTextSize('text-lg')} font-semibold text-left hover:bg-muted/50 rounded-lg transition-colors`}
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-5 w-5 text-soul-purple flex-shrink-0" />}
        <span>{title}</span>
        {badge && (
          <Badge variant="outline" className="bg-soul-purple/10 text-soul-purple border-soul-purple/30">
            {badge}
          </Badge>
        )}
      </div>
      {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
    </button>
  );

  return (
    <div className={`${className} w-full max-w-full overflow-hidden`}>

      {/* Generation Method Selection Dialog */}
      <Dialog open={showMethodDialog} onOpenChange={setShowMethodDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Generation Method</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Button
                onClick={() => handleMethodSelection('client')}
                className="w-full justify-start"
                variant="outline"
              >
                <Zap className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Quick Generation</div>
                  <div className="text-xs text-muted-foreground">Generate immediately (2-3 minutes)</div>
                </div>
              </Button>
              <Button
                onClick={() => handleMethodSelection('background')}
                className="w-full justify-start"
                variant="outline"
              >
                <Settings className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Background Generation</div>
                  <div className="text-xs text-muted-foreground">Generate in background (up to 1 hour)</div>
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
              {t('report.standardReport')}
            </Button>
            <Button
              variant={reportType === 'hermetic' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setReportType('hermetic')}
              disabled={!hermeticReport}
              className="rounded-md px-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600"
            >
              <Star className="h-4 w-4 mr-2" />
              {t('report.hermeticReport')}
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
                onClick={() => handleGenerateClick('standard', false)} 
                disabled={generationControl.isGenerating}
                variant="outline"
                size="sm"
              >
                {generationControl.isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Generate Standard
              </Button>
            )}
            {!hermeticReport && (
              <Button 
                onClick={() => handleGenerateClick('hermetic', false)} 
                disabled={generationControl.isGenerating}
                variant="outline"
                size="sm"
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                {generationControl.isGenerating ? (
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
          <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
            <Badge variant="outline" className="bg-soul-purple/10 text-soul-purple border-soul-purple/20">
              <Sparkles className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">Soul Generated</span>
            </Badge>
            {currentReport && (
              <Badge 
                variant="outline" 
                className={
                  reportType === 'hermetic' 
                    ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border-purple-300" 
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }
              >
                <span className="truncate">
                  Version {(currentReport as any).blueprint_version || '1.0'}
                </span>
              </Badge>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              onClick={handleRegenerate} 
              variant="outline" 
              size="sm"
              disabled={generationControl.isGenerating}
              className="flex-1 sm:flex-none"
            >
              {generationControl.isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span className="ml-1 sm:ml-2">{generationControl.isGenerating ? 'Regenerating...' : 'Regenerate'}</span>
            </Button>
            {generationControl.isGenerating && generationControl.activeJobId && (
              <Button 
                onClick={async () => {
                  await generationControl.completeGeneration(false, null, 'Cancelled by user');
                  window.location.reload(); // Force refresh to clear state
                }}
                variant="destructive" 
                size="sm"
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
                <span className="ml-1 sm:ml-2">Cancel</span>
              </Button>
            )}
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
                  <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                    <div className={spacing.card}>
                      <SectionHeader
                        title="Overview"
                        isExpanded={expandedSections.overview}
                        onClick={() => toggleSection('overview')}
                        icon={Sparkles}
                        badge={`${hermeticContent.word_count || 0}+ words`}
                      />
                      
                      {expandedSections.overview && (
                        <div className="mt-4 space-y-4">
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
                      )}
                    </div>
                  </Card>

                  {/* Seven Hermetic Laws Section */}
                  <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
                    <div className={spacing.card}>
                      <SectionHeader
                        title="Seven Hermetic Laws Analysis"
                        isExpanded={expandedSections.hermetic_laws}
                        onClick={() => toggleSection('hermetic_laws')}
                        icon={Star}
                        badge={`${Object.keys(hermeticContent.seven_laws_integration || {}).length} laws`}
                      />
                      
                      {expandedSections.hermetic_laws && (
                        <div className="mt-4 space-y-4">
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
                      )}
                    </div>
                  </Card>

                  {/* Gate Analyses Section */}
                  <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
                    <div className={spacing.card}>
                      <SectionHeader
                        title="Gate Analyses"
                        isExpanded={expandedSections.gate_analyses}
                        onClick={() => toggleSection('gate_analyses')}
                        icon={Target}
                        badge={`${Object.keys(hermeticContent.gate_analyses || {}).length} gates`}
                      />
                      
                      {expandedSections.gate_analyses && (
                        <div className="mt-4 space-y-4">
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
                      )}
                    </div>
                  </Card>

                  {/* Shadow Work Integration Section */}
                  <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
                    <div className={spacing.card}>
                      <SectionHeader
                        title="Shadow Work Integration"
                        isExpanded={expandedSections.shadow_work}
                        onClick={() => toggleSection('shadow_work')}
                        icon={Moon}
                        badge="Deep Integration"
                      />
                      
                      {expandedSections.shadow_work && (
                        <div className="mt-4 space-y-4">
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
                      )}
                    </div>
                  </Card>

                  {/* System Translations Section */}
                  <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                    <div className={spacing.card}>
                      <SectionHeader
                        title="System Translations"
                        isExpanded={expandedSections.system_translations}
                        onClick={() => toggleSection('system_translations')}
                        icon={Compass}
                        badge={`${Object.keys(hermeticContent.system_translations || {}).length} systems`}
                      />
                      
                      {expandedSections.system_translations && (
                        <div className="mt-4 space-y-4">
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
                      )}
                    </div>
                  </Card>

                  {/* Practical Framework Section */}
                  <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
                    <div className={spacing.card}>
                      <SectionHeader
                        title="Practical Framework"
                        isExpanded={expandedSections.practical_framework}
                        onClick={() => toggleSection('practical_framework')}
                        icon={Zap}
                        badge="Applications"
                      />
                      
                      {expandedSections.practical_framework && (
                        <div className="mt-4 space-y-4">
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
                      )}
                    </div>
                  </Card>

                  {/* Intelligence Analysis Section - 12 Dimensions */}
                  {hermeticContent.structured_intelligence && (
                    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                      <div className={spacing.card}>
                        <SectionHeader
                          title="Enhanced Intelligence Analysis"
                          isExpanded={expandedSections.intelligence_analysis}
                          onClick={() => toggleSection('intelligence_analysis')}
                          icon={Brain}
                          badge={`${Object.keys(hermeticContent.structured_intelligence).length} Dimensions`}
                        />
                        
                        {expandedSections.intelligence_analysis && (
                          <div className="mt-4 space-y-4">
                            {Object.entries(hermeticContent.structured_intelligence)
                              .filter(([key]) => key !== 'id' && key !== 'user_id' && key !== 'personality_report_id' && key !== 'extraction_confidence' && key !== 'extraction_version' && key !== 'processing_notes' && key !== 'created_at' && key !== 'updated_at')
                              .map(([dimensionKey, dimensionContent]) => {
                                const IconComponent = intelligenceIcons[dimensionKey as keyof typeof intelligenceIcons] || Brain;
                                const title = intelligenceTitles[dimensionKey as keyof typeof intelligenceTitles] || dimensionKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                
                                return (
                                  <CosmicCard key={dimensionKey} className="border-primary/10 hover:border-primary/20 transition-colors">
                                    <CardHeader>
                                      <CardTitle className="flex items-center gap-2">
                                        <IconComponent className="h-5 w-5 text-primary" />
                                        <h3>{title}</h3>
                                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                                          {Array.isArray(dimensionContent) ? `${dimensionContent.length} items` : 
                                           typeof dimensionContent === 'string' ? `${dimensionContent.length} chars` : 
                                           typeof dimensionContent === 'object' && dimensionContent ? `${Object.keys(dimensionContent).length} fields` : 'Data'}
                                        </Badge>
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="prose prose-sm max-w-none">
                                        {Array.isArray(dimensionContent) ? (
                                          <div className="space-y-2">
                                            {dimensionContent.map((item, index) => (
                                              <div key={index} className="p-3 bg-muted/30 rounded-lg border">
                                                <p className="text-card-foreground leading-relaxed whitespace-pre-wrap break-words">
                                                  {typeof item === 'string' ? item : JSON.stringify(item, null, 2)}
                                                </p>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          renderSafeContent(dimensionContent, title)
                                        )}
                                      </div>
                                    </CardContent>
                                  </CosmicCard>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
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
