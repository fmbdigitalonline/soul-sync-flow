import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, RefreshCw, Sparkles, User, Heart, Brain, Compass, Zap, Plus, Trash2, Star, ChevronDown, ChevronRight, Target, Moon, Shield, Lightbulb, Settings, MessageSquare, Users, Layers, TrendingUp, Activity, UserCheck, Palette, Gauge, Maximize2, AlertTriangle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { aiPersonalityReportService, PersonalityReport } from '@/services/ai-personality-report-service';
import { canAccessHermeticReport } from '@/utils/hermeticAccess';
import { hermeticPersonalityReportService, HermeticPersonalityReport } from '@/services/hermetic-personality-report-service';
import { blueprintService } from '@/services/blueprint-service';
import { useToast } from '@/hooks/use-toast';
import { useHermeticReportStatus } from '@/hooks/use-hermetic-report-status';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { supabase } from '@/integrations/supabase/client';
import ReportModal from '@/components/ReportModal';
import { ReportSummaryCalm } from './ReportSummaryCalm';

interface PersonalityReportViewerProps {
  className?: string;
}

export const PersonalityReportViewer: React.FC<PersonalityReportViewerProps> = ({ className }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
  // Check if user has access to hermetic reports (UI-only check)
  const hasHermeticAccess = canAccessHermeticReport(user);
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
    practical_framework: false,
    intelligence_analysis: false
  });
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  // Tapping a Key Theme opens THAT section, not the whole report.
  const [openSectionKey, setOpenSectionKey] = useState<string | null>(null);

  // Add hermetic status hook
  const hermeticStatus = useHermeticReportStatus();
  const [purgeLoading, setPurgeLoading] = useState(false);
  
  // Add ref to prevent multiple simultaneous loads
  const loadingRef = useRef(false);

  useEffect(() => {
    loadReport();
  }, [user]);

  // FIXED: Simplified synchronization effect with loading guards
  useEffect(() => {
    // Only sync when status changes from no report to has report
    // and we don't already have the report loaded
    if (hermeticStatus.hasReport && !hermeticReport && !loadingRef.current) {
      console.log('🔄 Status sync: Hermetic report detected but not loaded - refreshing...');
      loadReport();
    }
  }, [hermeticStatus.hasReport, hermeticReport]); // Removed loading and progress from deps

  const loadReport = async () => {
    if (!user || loadingRef.current) return;
    
    loadingRef.current = true;
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
      } else {
        // If no hermetic report found, try recovery process for completed jobs
        console.log('[PersonalityReportViewer] No hermetic report found, attempting recovery...');
        try {
          const { hermeticRecoveryService } = await import('@/services/hermetic-recovery-service');
          const recoveryResult = await hermeticRecoveryService.triggerRecoveryForUser(user.id);
          
          if (recoveryResult.success) {
            console.log('[PersonalityReportViewer] Recovery successful, retrying report fetch...');
            // Retry loading the report after recovery
            const retryResult = await hermeticPersonalityReportService.getHermeticReport(user.id);
            if (retryResult.success && retryResult.report) {
              setHermeticReport(retryResult.report);
              console.log('🌟 Hermetic report loaded successfully after recovery');
              console.log('📊 Hermetic word count:', retryResult.report.report_content.word_count);
            } else {
              console.log('[PersonalityReportViewer] Recovery completed but report still not available');
            }
          } else {
            console.log('[PersonalityReportViewer] Recovery failed:', recoveryResult.error);
          }
        } catch (recoveryError) {
          console.error('[PersonalityReportViewer] Recovery process error:', recoveryError);
        }
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
      loadingRef.current = false;
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
      const result = await aiPersonalityReportService.generatePersonalityReport(blueprintResult.data, language);
      
      if (result.success && result.report) {
        setReport(result.report);
        toast({
          title: t('report.standardGenerated'),
          description: t('report.standardGeneratedDescription'),
        });
        console.log('✅ Standard report generated successfully');
      } else {
        throw new Error(result.error || 'Failed to generate standard personality report');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate standard personality report';
      setError(errorMessage);
      toast({
        title: t('report.generationFailed'),
        description: errorMessage,
        variant: "destructive"
      });
      console.error('💥 Error generating standard personality report:', err);
    } finally {
      setGenerating(false);
    }
  };

  // Hermetic report generation is now auto-triggered at onboarding and is
  // never a user action. Do not add a hermetic trigger button here.

  const handleRecoveryAttempt = async () => {
    try {
      setGenerating(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Find completed jobs without reports
      const { data: completedJobs, error } = await supabase
        .from('hermetic_processing_jobs')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .eq('progress_percentage', 100)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!completedJobs || completedJobs.length === 0) {
        toast({
          title: "No recovery needed",
          description: "No completed jobs found that need recovery",
        });
        return;
      }

      const jobToRecover = completedJobs[0];
      console.log('🔧 Attempting to recover job:', jobToRecover.id);

      const { data: recoveryResult, error: recoveryError } = await supabase.functions.invoke('hermetic-recovery', {
        body: { job_id: jobToRecover.id }
      });

      if (recoveryError) throw recoveryError;

      if (recoveryResult?.success) {
        toast({
          title: "Recovery successful!",
          description: `Report recovered with ${recoveryResult.wordCount?.toLocaleString()} words`,
        });
        
        // Refresh the report status
        await handleRefresh();
      } else {
        throw new Error(recoveryResult?.error || 'Recovery failed');
      }

    } catch (error) {
      console.error('❌ Recovery failed:', error);
      toast({
        title: "Recovery failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleRefresh = () => {
    loadReport();
  };
  
  const handlePurgeStuckJobs = async () => {
    if (!user) return;
    
    // Show confirmation dialog
    const confirmed = window.confirm(
      "Are you sure you want to purge all stuck hermetic jobs? This action cannot be undone."
    );
    
    if (!confirmed) return;
    
    setPurgeLoading(true);
    
    try {
      console.log('🧹 Purging stuck hermetic jobs...');
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      // Call the RPC function to cleanup stuck jobs for the current user
      const { data, error } = await supabase.rpc('cleanup_stuck_hermetic_jobs' as any, {
        p_user_id: user.id
      });
      
      if (error) throw error;
      
      const cleanupCount = data || 0;
      
      toast({
        title: "Cleanup Complete",
        description: `${cleanupCount} stuck job(s) were cleaned up successfully.`,
      });
      
      // Refresh status after cleanup
      hermeticStatus.refreshStatus();
      
    } catch (error) {
      console.error('❌ Failed to purge stuck jobs:', error);
      toast({
        title: "Cleanup Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setPurgeLoading(false);
    }
  };
  
  // Standalone Purge Button Component
  const PurgeStuckJobsButton = () => (
    <Button 
      onClick={handlePurgeStuckJobs}
      disabled={purgeLoading}
      variant="destructive"
      size="sm"
      className="border-red-200 text-red-600 hover:bg-red-50 bg-red-50/50"
    >
      {purgeLoading ? (
        <Loader2 className="h-3 w-3 animate-spin mr-1" />
      ) : (
        <AlertCircle className="h-3 w-3 mr-1" />
      )}
      {purgeLoading ? t('common.purging') : t('common.purgeStuckJobs')}
    </Button>
  );

  const handleRegenerate = () => {
    // Hermetic is never a user action; only standard is regeneratable here.
    generateReport(true);
  };

  // Helper function to safely render content with smart extraction
  const contentCardPadding = isMobile ? 'px-4 py-3' : 'p-3';
  const contentCardClass = `ss w-full max-w-full ${contentCardPadding} bg-[var(--ss-accent-wash)] text-[color:var(--ss-ink)] border border-[color:var(--ss-line)] rounded-2xl`;
  const contentTextClass = getTextSize(isMobile ? 'text-base' : 'text-sm');

  const renderSafeContent = (content: any, contentType: string = 'Unknown') => {
    if (typeof content === 'string') {
      return (
        <div className={contentCardClass}>
          <p className={`leading-relaxed whitespace-pre-wrap break-words ${contentTextClass}`}>
            {content}
          </p>
        </div>
      );
    } else if (typeof content === 'object' && content !== null) {
      // Log for developers only
      console.log(`📄 Processing ${contentType} content:`, content);
      
      // Smart content extraction from nested objects
      let extractedText: any = null;
      
      // Try common text properties
      if (content.content) extractedText = content.content;
      else if (content.text) extractedText = content.text;
      else if (content.description) extractedText = content.description;
      else if (content.summary) extractedText = content.summary;
      else if (content.analysis) extractedText = content.analysis;
      else if (content.insight) extractedText = content.insight;
      
      // If extracted text is still an object, try to flatten it
      if (extractedText && typeof extractedText === 'object') {
        if (Array.isArray(extractedText)) {
          extractedText = (extractedText as string[]).join(' ');
        } else {
          // Get all string values from the object
          const textValues = Object.values(extractedText)
            .filter(val => typeof val === 'string')
            .join(' ');
          extractedText = textValues;
        }
      }
      
      // If we have meaningful text, display it
      if (extractedText && typeof extractedText === 'string' && extractedText.trim().length > 0) {
        return (
          <div className={contentCardClass}>
            <p className={`leading-relaxed whitespace-pre-wrap break-words ${contentTextClass}`}>
              {extractedText.trim()}
            </p>
          </div>
        );
      }
      
      // If no extractable content, show user-friendly message
      return (
        <div className={`flex items-center gap-2 ${spacing.card} bg-[var(--ss-line-2)] rounded-lg`}>
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <p className={`text-muted-foreground ${getTextSize('text-sm')}`}>
            {language === 'nl' ? 'Inhoud wordt verwerkt...' : 'Content is being processed...'}
          </p>
        </div>
      );
    } else {
      return (
        <div className={`w-full ${contentCardPadding} bg-[var(--ss-line-2)] rounded-lg`}>
          <p className={`text-muted-foreground italic ${contentTextClass}`}>
            {language === 'nl' ? 'Inhoud wordt binnenkort beschikbaar' : 'Content will be available soon'}
          </p>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${spacing.container} ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" style={{ color: 'var(--ss-accent)' }} />
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
              <Sparkles className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--ss-accent)' }} />
              <h3 className={`font-semibold mb-2 ${getTextSize('text-lg')}`}>{t('report.title')}</h3>
              <p className={`text-muted-foreground mb-4 ${getTextSize('text-sm')} break-words`}>
                {error || t('report.noReports')}
              </p>
            </div>
            <div className="flex flex-col gap-4 justify-center w-full">
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button 
                  onClick={() => generateReport(false)} 
                  disabled={generating}
                  className="w-full sm:w-auto rounded-full font-semibold" style={{ background: 'var(--ss-accent)', color: '#fff' }}
                  size={isMobile ? "default" : "default"}
                >
                  {generating ? (
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
              </div>
              {hermeticStatus?.isGenerating && (
                <p className="text-xs text-muted-foreground text-center italic">
                  Deep synthesis in progress…
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={handleRefresh} variant="outline" className="w-full sm:w-auto">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t('report.refresh')}
                </Button>
                {generating && (
                  <Button 
                    onClick={() => setGenerating(false)} 
                    variant="destructive" 
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Loading State
                  </Button>
                )}
                {(hermeticStatus.currentStep?.includes('Report generated but not saved') || 
                  hermeticStatus.currentStep?.includes('please retry')) && (
                  <Button 
                    onClick={handleRecoveryAttempt} 
                    variant="secondary" 
                    className="w-full sm:w-auto"
                    disabled={generating}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Recover Report
                  </Button>
                )}
              </div>
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
    core_personality_pattern: t('reportSections.corePersonalityPattern'),
    decision_making_style: t('reportSections.decisionMakingStyle'),
    relationship_style: t('reportSections.relationshipStyle'),
    life_path_purpose: t('reportSections.lifePathPurpose'),
    current_energy_timing: t('reportSections.currentEnergyTiming'),
    integrated_summary: t('reportSections.integratedSummary')
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
      className={`w-full flex items-center justify-between ${spacing.button} ${getTextSize('text-lg')} font-semibold text-left hover:bg-[var(--ss-accent-wash)] rounded-lg transition-colors`}
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--ss-accent)' }} />}
        <span>{title}</span>
        {badge && (
          <Badge variant="outline" className="border-transparent" style={{ background: 'var(--ss-accent-wash-2)', color: 'var(--ss-accent-ink)' }}>
            {badge}
          </Badge>
        )}
      </div>
      {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
    </button>
  );

  return (
    <div className={`${className} w-full max-w-full overflow-hidden`}>
      {/* Report Type Toggle */}
      {(report || hermeticReport) && (
        <div className="flex flex-col gap-3 mb-5">
          {/* One design-system toggle — same treatment as every other
              segmented control in the app. No gradients, no inline badges. */}
          <div className="ss-seg">
            <button
              type="button"
              data-on={reportType === 'standard'}
              onClick={() => setReportType('standard')}
              disabled={!report}
            >
              {t('report.standardReport')}
            </button>
            <button
              type="button"
              data-on={reportType === 'hermetic'}
              onClick={() => {
                if (!hasHermeticAccess) {
                  toast({
                    title: language === 'nl' ? 'Nog niet beschikbaar' : 'Not available yet',
                    description: language === 'nl'
                      ? 'Dit rapport is nog niet voor je account beschikbaar.'
                      : 'This report is not available for your account yet.',
                  });
                } else if (!hermeticReport) {
                  toast({
                    title: language === 'nl' ? 'Nog in wording' : 'Still forming',
                    description: language === 'nl'
                      ? 'Je diepe rapport is er nog niet.'
                      : 'Your deep report is not ready yet.',
                  });
                } else {
                  setReportType('hermetic');
                }
              }}
              disabled={!hasHermeticAccess || !hermeticReport}
              style={!hasHermeticAccess || !hermeticReport ? { opacity: 0.45 } : undefined}
            >
              {t('report.hermeticReport')}
            </button>
          </div>

          {(generating || (!hermeticReport && hasHermeticAccess && hermeticStatus?.isGenerating) || import.meta.env.DEV) && (
            <div className="flex gap-2 items-center flex-wrap">
              {!report && (
                <Button
                  onClick={() => generateReport(false)}
                  disabled={generating}
                  variant="outline"
                  size="sm"
                  className="rounded-full font-medium"
                >
                  {generating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {language === 'nl' ? 'Rapport aanmaken' : 'Create report'}
                </Button>
              )}
              {!hermeticReport && hasHermeticAccess && hermeticStatus?.isGenerating && (
                <span className="text-[12.5px] italic" style={{ color: 'var(--ss-muted)' }}>
                  {language === 'nl' ? 'Je diepe rapport wordt samengesteld…' : 'Your deep report is being composed…'}
                </span>
              )}

              {/* Dev-only maintenance */}
              {import.meta.env.DEV && <PurgeStuckJobsButton />}
            </div>
          )}
        </div>
      )}

      <div className={`flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 ${spacing.gap} w-full`}>
        <div className="min-w-0 flex-1">
          <h3 className="text-[20px] font-semibold tracking-tight break-words" style={{ color: 'var(--ss-ink)' }}>
            {t(`reportModal.${reportType}Title`)}
          </h3>
          <p className="text-[12.5px] break-words mt-0.5" style={{ color: 'var(--ss-muted)' }}>
            {currentReport && `${t('common.generatedOn')} ${new Date(currentReport.generated_at).toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US')}`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0">
          <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
            <Badge variant="outline" className="border-transparent" style={{ background: 'var(--ss-accent-wash-2)', color: 'var(--ss-accent-ink)' }}>
              <Sparkles className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{t('common.soulGenerated')}</span>
            </Badge>
            {/* Build metadata is for us, not the reader. */}
            {currentReport && import.meta.env.DEV && (
              <Badge variant="outline" className="border-transparent"
                style={{ background: 'var(--ss-line-2)', color: 'var(--ss-muted)' }}>
                <span className="truncate">
                  Version {(currentReport as any).blueprint_version || '1.0'}
                </span>
              </Badge>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              onClick={() => setIsReportModalOpen(true)} 
              variant="default" 
              size="sm"
              className="flex-1 sm:flex-none rounded-full font-semibold"
              style={{ background: 'var(--ss-accent)', color: '#fff' }}
            >
              <Maximize2 className="h-4 w-4" />
              <span className="ml-1 sm:ml-2">{t('reportModal.viewFullReport')}</span>
            </Button>
            {import.meta.env.DEV && (
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
                <span className="ml-1 sm:ml-2">{generating ? t('settings.regenerating') : t('common.regenerate')}</span>
              </Button>
            )}
            <Button onClick={handleRefresh} variant="ghost" size="sm" className="flex-shrink-0">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Standard report — the calm redesign: Integrated Summary + Key
          Themes. The full text is one tap away via "View full report". */}
      {currentReport && reportType === 'standard' && (
        <ReportSummaryCalm
          content={currentReport.report_content as any}
          sectionTitles={sectionTitles}
          onViewFull={() => setIsReportModalOpen(true)}
          onOpenSection={(k) => setOpenSectionKey(k)}
        />
      )}

      {/* Hermetic report — the same calm redesign as the standard report:
          Integrated Summary snippet + Key Themes. Its sections differ, so the
          themes are built from the Hermetic content itself. The full text
          stays one tap away via "View full report". */}
      {currentReport && reportType === 'hermetic' && (() => {
        const hc = (currentReport.report_content || {}) as any;
        const themes = Object.keys(hc)
          .filter((k) => k !== 'integrated_summary' && k !== 'word_count')
          .map((k) => {
            const v = hc[k];
            const title = (hermeticSectionTitles as any)[k]
              || k.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
            if (typeof v === 'string') return { key: k, title, body: v };
            if (v && typeof v === 'object') {
              const n = Object.keys(v).length;
              if (!n) return null;
              return { key: k, title, note: `${n} ${language === 'nl' ? 'onderdelen' : 'sections'}` };
            }
            return null;
          })
          .filter(Boolean) as Array<{ key: string; title: string; body?: string; note?: string }>;

        return (
          <ReportSummaryCalm
            content={hc}
            sectionTitles={hermeticSectionTitles as any}
            themes={themes}
            onViewFull={() => setIsReportModalOpen(true)}
            onOpenSection={(k) => setOpenSectionKey(k)}
          />
        );
      })()}


      {/* Single-section view — what a Key Theme tap opens. Calm chrome, the
          section's full text, and a way through to the whole report. */}
      <Dialog open={!!openSectionKey} onOpenChange={(o) => { if (!o) setOpenSectionKey(null); }}>
        <DialogContent
          className={`ss ${isMobile ? 'w-full h-[90vh] max-w-full m-0 rounded-t-3xl rounded-b-none' : 'max-w-2xl w-full h-[80vh]'} p-0 gap-0 border-0 flex flex-col`}
          style={{ background: 'var(--ss-surface)' }}
        >
          <DialogHeader
            className="sticky top-0 z-10 px-5 py-4"
            style={{ background: 'color-mix(in srgb, var(--ss-surface) 92%, transparent)', borderBottom: '1px solid var(--ss-line-2)' }}
          >
            <DialogTitle className="text-[17px] font-semibold tracking-tight text-left pr-8" style={{ color: 'var(--ss-ink)' }}>
              {openSectionKey
                ? ((reportType === 'hermetic' ? (hermeticSectionTitles as any) : (sectionTitles as any))[openSectionKey]
                    || openSectionKey.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()))
                : ''}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 w-full">
            <div className="px-5 py-4 pb-8">
              {openSectionKey && currentReport &&
                renderSafeContent((currentReport.report_content as any)?.[openSectionKey], openSectionKey)}

              <button
                onClick={() => { setOpenSectionKey(null); setIsReportModalOpen(true); }}
                className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold"
                style={{ color: 'var(--ss-accent-ink)' }}
              >
                {language === 'nl' ? 'Bekijk het volledige rapport' : 'View the full report'}
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Mobile-Optimized Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportType={reportType}
        reportContent={
          currentReport ? (
            <div className="space-y-6">
              {/* Report Title */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  {reportType === 'hermetic' ? 'Hermetic Blueprint Report' : 'Personality Report'}
                </h2>
                <p className="text-muted-foreground">
                  {t('common.generatedOn')} {new Date(currentReport.generated_at).toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US')}
                </p>
              </div>

              {/* Report Content */}
              <div className="space-y-8">
                {(() => {
                  if (!currentReport) return null;
                  
                  const isHermetic = reportType === 'hermetic';
                  const reportContent = currentReport.report_content;
                  
                  if (isHermetic) {
                    const hermeticContent = reportContent as any;
                    
                    // Define known sections with their configurations (same as main view)
                    const knownSections = {
                      integrated_summary: {
                        title: 'Overview',
                        icon: Sparkles,
                        badge: `${hermeticContent.word_count || 0}+ words`,
                        color: 'green',
                        key: 'overview'
                      },
                      seven_laws_integration: {
                        title: 'Seven Hermetic Laws Analysis',
                        icon: Star,
                        badge: `${Object.keys(hermeticContent.seven_laws_integration || {}).length} laws`,
                        color: 'purple',
                        key: 'hermetic_laws',
                        isNested: true
                      },
                      gate_analyses: {
                        title: 'Gate Analyses',
                        icon: Target,
                        badge: `${Object.keys(hermeticContent.gate_analyses || {}).length} gates`,
                        color: 'orange',
                        key: 'gate_analyses',
                        isNested: true
                      },
                      shadow_work_integration: {
                        title: 'Shadow Work Integration',
                        icon: Moon,
                        badge: 'Deep Integration',
                        color: 'indigo',
                        key: 'shadow_work',
                        isNested: true
                      },
                      system_translations: {
                        title: 'System Translations',
                        icon: Compass,
                        badge: `${Object.keys(hermeticContent.system_translations || {}).length} systems`,
                        color: 'blue',
                        key: 'system_translations',
                        isNested: true
                      },
                      practical_activation_framework: {
                        title: 'Practical Framework',
                        icon: Zap,
                        badge: 'Applications',
                        color: 'emerald',
                        key: 'practical_framework'
                      },
                      consciousness_integration_map: {
                        title: 'Consciousness Integration Map',
                        icon: Brain,
                        badge: 'Integration Map',
                        color: 'emerald',
                        key: 'practical_framework',
                        isSubsection: true
                      },
                      structured_intelligence: {
                        title: 'Enhanced Intelligence Analysis',
                        icon: Brain,
                        badge: `${Object.keys(hermeticContent.structured_intelligence || {}).length} Dimensions`,
                        color: 'primary',
                        key: 'intelligence_analysis',
                        isIntelligence: true
                      }
                    };

                    // Define section order - Overview (integrated_summary) should always be first
                    const sectionOrder = [
                      'integrated_summary',  // Overview - always first
                      'seven_laws_integration',
                      'gate_analyses', 
                      'shadow_work_integration',
                      'system_translations',
                      'practical_activation_framework',
                      'structured_intelligence'
                    ];

                    // Get all available sections (both known and unknown)
                    const availableSections = Object.keys(hermeticContent).filter(key => 
                      key !== 'word_count' && 
                      key !== 'generation_timestamp' && 
                      key !== 'report_version' &&
                      hermeticContent[key] && 
                      (typeof hermeticContent[key] === 'string' || typeof hermeticContent[key] === 'object')
                    );

                    // Sort sections: ordered sections first, then remaining sections
                    const orderedSections = sectionOrder.filter(section => availableSections.includes(section));
                    const remainingSections = availableSections.filter(section => !sectionOrder.includes(section));
                    const allSections = [...orderedSections, ...remainingSections];

                    // Helper function to render nested content (same as main view)
                    const renderNestedContent = (content: any, sectionKey: string, config: any) => {
                      if (!content || typeof content !== 'object') return null;

                      return Object.entries(content).map(([itemKey, itemContent]) => {
                        let displayTitle = itemKey;
                        let IconComponent = config.icon;

                        // Special formatting for different section types
                        if (sectionKey === 'gate_analyses' && itemKey.startsWith('gate_')) {
                          displayTitle = `Gate ${itemKey.replace('gate_', '')}`;
                          IconComponent = Target;
                        } else if (sectionKey === 'seven_laws_integration') {
                          displayTitle = `Law of ${itemKey.charAt(0).toUpperCase() + itemKey.slice(1)}`;
                          IconComponent = Star;
                        } else {
                          displayTitle = itemKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        }

                        return (
                          <div key={itemKey} className="bg-accent/10 rounded-2xl p-6 border border-accent/20 mb-4">
                            <div className="flex items-center gap-3 mb-4">
                              <IconComponent className="h-6 w-6 text-primary" />
                              <h4 className="text-lg font-semibold text-foreground">{displayTitle}</h4>
                            </div>
                            <div className="prose prose-lg max-w-none">
                              {renderSafeContent(itemContent, displayTitle)}
                            </div>
                          </div>
                        );
                      });
                    };

                    return (
                      <div className="space-y-8">
                        {allSections.map(sectionKey => {
                          const content = hermeticContent[sectionKey];
                          const config = knownSections[sectionKey];
                          
                          // Skip subsections that are handled within their parent sections
                          if (config?.isSubsection) return null;
                          
                          // Use known configuration or create default
                          const sectionConfig = config || {
                            title: sectionKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                            icon: Lightbulb,
                            badge: typeof content === 'string' ? `${content.length} chars` : 
                                   typeof content === 'object' && content ? `${Object.keys(content).length} items` : 'Content',
                            color: 'default',
                            key: sectionKey.replace(/[^a-zA-Z0-9]/g, '_')
                          };

                          return (
                            <div key={sectionKey} className="space-y-4">
                              <div className="flex items-center gap-3 mb-6">
                                <sectionConfig.icon className="h-8 w-8 text-primary" />
                                <h3 className="text-2xl font-bold text-foreground">{sectionConfig.title}</h3>
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                                  {sectionConfig.badge}
                                </Badge>
                              </div>
                              
                              {/* Handle Intelligence Analysis specially */}
                              {sectionConfig.isIntelligence && content ? (
                                Object.entries(content)
                                  .filter(([key]) => key !== 'id' && key !== 'user_id' && key !== 'personality_report_id' && key !== 'extraction_confidence' && key !== 'extraction_version' && key !== 'processing_notes' && key !== 'created_at' && key !== 'updated_at')
                                  .map(([dimensionKey, dimensionContent]) => {
                                    const IconComponent = intelligenceIcons[dimensionKey as keyof typeof intelligenceIcons] || Brain;
                                    const title = intelligenceTitles[dimensionKey as keyof typeof intelligenceTitles] || dimensionKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                    
                                    return (
                                      <div key={dimensionKey} className="bg-primary/5 rounded-2xl p-6 border border-primary/20 mb-4">
                                        <div className="flex items-center gap-3 mb-4">
                                          <IconComponent className="h-6 w-6 text-primary" />
                                          <h4 className="text-lg font-semibold text-foreground">{title}</h4>
                                        </div>
                                        <div className="prose prose-lg max-w-none">
                                          {Array.isArray(dimensionContent) ? (
                                            <div className="space-y-4">
                                              {dimensionContent.map((item, index) => (
                                                <div key={index} className="p-4 bg-accent/10 rounded-lg">
                                                  <p className="leading-relaxed whitespace-pre-wrap break-words">
                                                    {typeof item === 'string' ? item : JSON.stringify(item, null, 2)}
                                                  </p>
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            renderSafeContent(dimensionContent, title)
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })
                              ) : sectionConfig.isNested && content && typeof content === 'object' ? (
                                /* Handle nested content (like gate_analyses, system_translations, etc.) */
                                renderNestedContent(content, sectionKey, sectionConfig)
                              ) : sectionKey === 'practical_activation_framework' ? (
                                /* Handle practical framework section with both main content and consciousness map */
                                <>
                                  <div className="bg-accent/10 rounded-2xl p-6 mb-4">
                                    <div className="flex items-center gap-3 mb-4">
                                      <Zap className="h-6 w-6 text-primary" />
                                      <h4 className="text-lg font-semibold text-foreground">Practical Activation Framework</h4>
                                    </div>
                                    <div className="prose prose-lg max-w-none">
                                      {renderSafeContent(content, 'Practical Framework')}
                                    </div>
                                  </div>
                                  
                                  {hermeticContent.consciousness_integration_map && (
                                    <div className="bg-accent/10 rounded-2xl p-6">
                                      <div className="flex items-center gap-3 mb-4">
                                        <Brain className="h-6 w-6 text-primary" />
                                        <h4 className="text-lg font-semibold text-foreground">Consciousness Integration Map</h4>
                                      </div>
                                      <div className="prose prose-lg max-w-none">
                                        {renderSafeContent(hermeticContent.consciousness_integration_map, 'Consciousness Map')}
                                      </div>
                                    </div>
                                  )}
                                </>
                              ) : (
                                /* Handle simple single-content sections */
                                <div className="bg-accent/10 rounded-2xl p-6">
                                  <div className="prose prose-lg max-w-none">
                                    {renderSafeContent(content, sectionConfig.title)}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  } else {
                    // Standard report rendering
                    return (
                      <div className="space-y-6">
                        {sectionOrder.map(key => {
                          const sectionContent = reportContent[key as keyof typeof reportContent];
                          const SectionIcon = sectionIcons[key as keyof typeof sectionIcons] || Sparkles;
                          const title = sectionTitles[key as keyof typeof sectionTitles] || key;
                          
                          if (!sectionContent) return null;
                          
                          return (
                            <div key={key} className="bg-accent/10 rounded-2xl p-6">
                              <div className="flex items-center gap-3 mb-4">
                                <SectionIcon className="h-6 w-6 text-primary" />
                                <h3 className="text-xl font-semibold text-foreground">{title}</h3>
                              </div>
                              <div className="prose prose-lg max-w-none">
                                {renderSafeContent(sectionContent, title)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No report content available</p>
            </div>
          )
        }
      />
    </div>
  );
};

export default PersonalityReportViewer;
