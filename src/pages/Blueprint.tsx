import React, { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/Layout/MainLayout";
import SimplifiedBlueprintViewer from "@/components/blueprint/SimplifiedBlueprintViewer";
import BlueprintOverview from "@/components/blueprint/BlueprintOverview";
import BlueprintEditor from "@/components/blueprint/BlueprintEditor";
import { BlueprintHealthCheck } from "@/components/blueprint/BlueprintHealthCheck";
import PersonalityReportViewer from "@/components/blueprint/PersonalityReportViewer";
import TriggerRecovery from "@/components/blueprint/TriggerRecovery";
import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle, RefreshCw, Activity, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BlueprintData, blueprintService } from "@/services/blueprint-service";
import { useNavigate } from "react-router-dom";
import { BlueprintGenerator } from "@/components/blueprint/BlueprintGenerationFlow";
import { useAuth } from "@/contexts/AuthContext";
import { useSoulOrb } from "@/contexts/SoulOrbContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOptimizedBlueprintData } from "@/hooks/use-optimized-blueprint-data";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { isAdminUser } from "@/utils/isAdminUser";
import { supabase } from "@/integrations/supabase/client";
import { hermeticPersonalityReportService } from "@/services/hermetic-personality-report-service";
import { useStandardReportBackfill } from "@/hooks/use-standard-report-backfill";
const Blueprint = () => {
  const [activeTab, setActiveTab] = useState("view");
  const [isGenerating, setIsGenerating] = useState(false);
  // Auto-backfill the v1.0 standard report if it went missing (silent onboarding failure).
  useStandardReportBackfill();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const {
    user,
    loading: authLoading
  } = useAuth();
  const {
    speak
  } = useSoulOrb();
  const {
    t,
    language
  } = useLanguage();
  const {
    spacing,
    layout,
    getTextSize,
    isMobile,
    isUltraNarrow,
    isFoldDevice
  } = useResponsiveLayout();
  const {
    blueprintData,
    loading,
    error,
    hasBlueprint,
    refetch,
    getBlueprintCompletionPercentage,
    blueprintValidation
  } = useOptimizedBlueprintData();
  console.log("🎯 BLUEPRINT PAGE: Current state", {
    user: !!user,
    authLoading,
    loading,
    hasBlueprint,
    blueprintData: !!blueprintData,
    error,
    completionPercentage: getBlueprintCompletionPercentage,
    validationResult: blueprintValidation,
    blueprintPreview: blueprintData ? {
      userName: blueprintData.user_meta?.preferred_name,
      mbtiType: blueprintData.cognitiveTemperamental?.mbtiType,
      sunSign: blueprintData.publicArchetype?.sunSign,
      lifePath: blueprintData.coreValuesNarrative?.lifePath
    } : null
  });

  // Show loading while auth is loading
  if (authLoading) {
    return <MainLayout>
        <div className="ss ss-page min-h-screen flex flex-col items-center justify-center px-5">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--ss-accent)' }} />
          <p className="mt-3 ss-sub" style={{ color: 'var(--ss-muted)' }}>{t('blueprint.loading')}</p>
        </div>
      </MainLayout>;
  }

  // Show sign in required if no user
  if (!user) {
    return <MainLayout>
        <div className="ss ss-page min-h-screen flex items-center justify-center px-5">
          <div className="ss-card text-center w-full max-w-md">
            <h1 className="ss-title tracking-tight mb-3 break-words" style={{ color: 'var(--ss-ink)' }}>
              Soul Blueprint
            </h1>
            <p className="mb-5 ss-sub leading-relaxed break-words" style={{ color: 'var(--ss-muted)' }}>{t('blueprint.signInRequired')}</p>
            <Button className="w-full max-w-full rounded-full font-semibold" style={{ background: 'var(--ss-accent)', color: '#fff' }} onClick={() => navigate('/auth')}>
              {t('blueprint.signIn')}
            </Button>
          </div>
        </div>
      </MainLayout>;
  }

  // Show loading while blueprint is loading
  if (loading) {
    return <MainLayout>
        <div className="ss ss-page min-h-screen flex flex-col items-center justify-center px-5">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--ss-accent)' }} />
          <p className="mt-3 ss-sub break-words" style={{ color: 'var(--ss-muted)' }}>{t('blueprint.loadingBlueprint')}</p>
        </div>
      </MainLayout>;
  }

  // Enhanced error handling - distinguish between different types of errors
  if (error) {
    const isNoBlueprint = error.includes("No active blueprint found");
    if (isNoBlueprint) {
      console.log("📝 BLUEPRINT PAGE: No blueprint found, should redirect to onboarding");
      return <MainLayout>
          <div className="ss ss-page min-h-screen flex flex-col items-center justify-center px-5">
            <div className="ss-card text-center w-full max-w-md">
              <AlertCircle className="h-11 w-11 mx-auto mb-3" style={{ color: 'var(--ss-accent)' }} />
              <h2 className="ss-title tracking-tight mb-3 break-words" style={{ color: 'var(--ss-ink)' }}>
                {t('blueprint.createTitle')}
              </h2>
              <p className="ss-sub leading-relaxed mb-5 break-words" style={{ color: 'var(--ss-muted)' }}>
                {t('blueprint.createDescription')}
              </p>
              <div className="space-y-2">
                <Button className="w-full rounded-full font-semibold" style={{ background: 'var(--ss-accent)', color: '#fff' }} onClick={() => navigate('/onboarding')}>
                  {t('blueprint.createButton')}
                </Button>
                <Button variant="outline" onClick={() => refetch()} className="w-full rounded-full font-medium">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t('blueprint.checkAgain')}
                </Button>
              </div>
            </div>
          </div>
        </MainLayout>;
    }

    // Other errors (loading/database issues)
    return <MainLayout>
        <div className="ss ss-page min-h-screen flex flex-col items-center justify-center px-5">
          <div className="ss-card text-center w-full max-w-md">
            <AlertCircle className="h-11 w-11 mx-auto mb-3" style={{ color: 'var(--ss-danger)' }} />
            <h2 className="ss-title tracking-tight mb-2 break-words" style={{ color: 'var(--ss-danger)' }}>{t('blueprint.blueprintError')}</h2>
            <p className="mb-4 ss-sub leading-relaxed break-words" style={{ color: 'var(--ss-muted)' }}>{error}</p>
            <div className="space-y-2">
              <Button onClick={() => refetch()} className="w-full rounded-full font-semibold" style={{ background: 'var(--ss-accent)', color: '#fff' }}>
                <RefreshCw className="mr-2 h-4 w-4" />
                {t('blueprint.tryAgain')}
              </Button>
              <Button variant="outline" onClick={() => navigate('/onboarding')} className="w-full rounded-full font-medium">
                {t('blueprint.createNew')}
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>;
  }

  // Check if we have sufficient blueprint data to display
  if (!hasBlueprint || !blueprintData) {
    console.log("📝 BLUEPRINT PAGE: Insufficient blueprint data, redirecting to onboarding");
    return <MainLayout>
        <div className="ss ss-page min-h-screen flex flex-col items-center justify-center px-5">
          <div className="ss-card text-center w-full max-w-md">
            <AlertCircle className="h-11 w-11 mx-auto mb-3" style={{ color: 'var(--ss-accent)' }} />
            <h2 className="ss-title tracking-tight mb-3 break-words" style={{ color: 'var(--ss-ink)' }}>
              {t('blueprint.completeTitle')}
            </h2>
            <p className="ss-sub leading-relaxed mb-4 break-words" style={{ color: 'var(--ss-muted)' }}>
              {t('blueprint.completeDescription')}
              {blueprintValidation.missingFields.length > 0 && <span className="block mt-2 ss-caption" style={{ color: 'var(--ss-faint)' }}>
                  {t('blueprint.missing')}: {blueprintValidation.missingFields.join(', ')}
                </span>}
            </p>
            <div className="mb-4">
              <div className="ss-caption mb-1.5" style={{ color: 'var(--ss-muted)' }}>
                {t('blueprint.completion')}: {getBlueprintCompletionPercentage}%
              </div>
              <div className="w-full rounded-full h-2" style={{ background: 'var(--ss-line-2)' }}>
                <div className="h-2 rounded-full transition-all duration-300" style={{
                background: 'var(--ss-accent)',
                width: `${getBlueprintCompletionPercentage}%`
              }} />
              </div>
            </div>
            <div className="space-y-2">
              <Button className="w-full rounded-full font-semibold" style={{ background: 'var(--ss-accent)', color: '#fff' }} onClick={() => navigate('/onboarding')}>
                {t('blueprint.completeButton')}
              </Button>
              <Button variant="outline" onClick={() => refetch()} className="w-full rounded-full font-medium">
                <RefreshCw className="mr-2 h-4 w-4" />
                {t('blueprint.refresh')}
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>;
  }
  const isAdmin = isAdminUser(user);
  const convertToSaveFormat = (layeredBlueprint: any) => {
    return {
      user_meta: layeredBlueprint.user_meta || {},
      astrology: {
        sun_sign: layeredBlueprint.publicArchetype?.sunSign || 'Unknown',
        moon_sign: layeredBlueprint.publicArchetype?.moonSign || 'Unknown',
        rising_sign: layeredBlueprint.publicArchetype?.risingSign || 'Unknown'
      },
      human_design: {
        type: layeredBlueprint.energyDecisionStrategy?.humanDesignType || 'Unknown',
        authority: layeredBlueprint.energyDecisionStrategy?.authority || 'Unknown'
      },
      numerology: {
        lifePathNumber: layeredBlueprint.coreValuesNarrative?.lifePath || 1,
        expressionNumber: layeredBlueprint.coreValuesNarrative?.expressionNumber || 1
      },
      mbti: {
        type: layeredBlueprint.cognitiveTemperamental?.mbtiType || 'Unknown'
      },
      chinese_zodiac: {
        animal: layeredBlueprint.generationalCode?.chineseZodiac || 'Unknown',
        element: layeredBlueprint.generationalCode?.element || 'Unknown'
      },
      goal_stack: layeredBlueprint.goal_stack || {},
      metadata: layeredBlueprint.metadata || {
        calculation_success: true,
        calculation_date: new Date().toISOString(),
        engine: "layered_blueprint_conversion"
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  };
  const handleSaveBlueprint = async (updatedBlueprint: any) => {
    try {
      console.log("Saving blueprint:", updatedBlueprint);
      const saveFormat = convertToSaveFormat(updatedBlueprint);
      const result = await blueprintService.saveBlueprintData(saveFormat);
      if (result.success) {
        toast({
          title: t('blueprint.saved'),
          description: t('blueprint.savedDescription')
        });
        await refetch();
        setActiveTab("view");
      } else {
        toast({
          title: t('blueprint.saveError'),
          description: result.error || t('blueprint.saveErrorDescription'),
          variant: "destructive"
        });
      }
      return result;
    } catch (err) {
      console.error("Error in save handler:", err);
      toast({
        title: t('system.error'),
        description: String(err),
        variant: "destructive"
      });
      return {
        success: false,
        error: String(err)
      };
    }
  };
  const handleRegenerateBlueprint = async () => {
    if (!blueprintData) {
      toast({
        title: t('system.error'),
        description: t('blueprint.dataNotLoaded'),
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGenerating(true);
      setActiveTab("generating");

      // Step 1: Clean up stuck jobs
      toast({
        title: "Cleaning up stuck jobs...",
        description: "Preparing for fresh report generation"
      });

      const { data: cleanupResult, error: cleanupError } = await supabase.rpc('cleanup_stuck_hermetic_jobs');
      
      if (cleanupError) {
        console.error("Cleanup error:", cleanupError);
        toast({
          title: "Cleanup Warning",
          description: "Some stuck jobs couldn't be cleaned, but proceeding anyway",
          variant: "destructive"
        });
      } else {
        const cleanedCount = cleanupResult || 0;
        if (cleanedCount > 0) {
          toast({
            title: "Cleanup Complete",
            description: `Cleaned up ${cleanedCount} stuck job${cleanedCount > 1 ? 's' : ''}`
          });
        }
      }

      // Step 2: Generate new hermetic report
      toast({
        title: t('blueprint.regeneratingTitle'),
        description: "Starting hermetic personality report generation..."
      });

      const reportResult = await hermeticPersonalityReportService.generateHermeticReport(convertToSaveFormat(blueprintData), language);
      
      if (reportResult.success) {
        toast({
          title: "Report Generation Started",
          description: "Your hermetic personality report is now being generated in the background"
        });
        speak("Your blueprint is being recalculated with fresh data");
      } else {
        throw new Error(reportResult.error || "Failed to start report generation");
      }

    } catch (error) {
      console.error("Error in regenerate handler:", error);
      toast({
        title: t('system.error'),
        description: String(error),
        variant: "destructive"
      });
      setIsGenerating(false);
      setActiveTab("view");
    }
  };
  const handleGenerationComplete = async (newBlueprint?: any) => {
    try {
      if (!newBlueprint) {
        toast({
          title: t('system.error'),
          description: t('blueprint.generationFailed'),
          variant: "destructive"
        });
        setIsGenerating(false);
        setActiveTab("view");
        return;
      }
      console.log("Generation complete, saving new blueprint");
      const saveFormat = convertToSaveFormat(newBlueprint);
      const result = await blueprintService.saveBlueprintData(saveFormat);
      if (result.success) {
        await refetch();
        toast({
          title: t('blueprint.generated'),
          description: t('blueprint.generatedDescription')
        });
        speak("Your new blueprint has been generated successfully");
      } else {
        toast({
          title: t('blueprint.generationError'),
          description: result.error || t('blueprint.generationErrorDescription'),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error handling generation completion:", error);
      toast({
        title: t('system.error'),
        description: String(error),
        variant: "destructive"
      });
    }
    setIsGenerating(false);
    setActiveTab("view");
  };
  return <MainLayout>
      <TriggerRecovery />
      <div className="ss ss-page min-h-screen">
        <div className="max-w-md mx-auto px-5 pt-8 pb-16 flex flex-col gap-5">
        {/* Header — calm type scale, design-system tokens */}
        <div className="flex flex-col gap-3 w-full max-w-full">
          <div className="flex items-center justify-end">
            {getBlueprintCompletionPercentage < 100 && <div className="ss-caption font-medium" style={{ color: 'var(--ss-muted)' }}>
                {getBlueprintCompletionPercentage}% Complete
              </div>}
          </div>

          {isAdmin && <Button variant="outline" className="flex items-center justify-center ss-sub h-12 w-full max-w-full rounded-2xl font-medium" onClick={handleRegenerateBlueprint} disabled={isGenerating}>
              <RefreshCw className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">{isGenerating ? t('blueprint.regenerating') : t('blueprint.regenerate')}</span>
            </Button>}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8 w-full max-w-full">
          {/* Segmented control — the one design-system toggle (.ss-seg), so the
              active state matches echo and Profiel. */}
          <div className="ss-seg">
            <button type="button" data-on={activeTab === 'view'} onClick={() => setActiveTab('view')}>
              {t('blueprint.tab')}
            </button>
            <button type="button" data-on={activeTab === 'report'} onClick={() => setActiveTab('report')}>
              {t('blueprint.reportTab')}
            </button>
            {isAdmin && <>
              <button type="button" data-on={activeTab === 'edit'} onClick={() => setActiveTab('edit')}>
                {t('blueprint.editTab')}
              </button>
              <button type="button" data-on={activeTab === 'health-check'} onClick={() => setActiveTab('health-check')}
                className="flex items-center justify-center gap-1 min-w-0">
                <Activity className="h-3.5 w-3.5 flex-shrink-0" />
                <span className={`${isMobile ? 'hidden sm:inline' : 'inline'} truncate`}>{t('blueprint.healthTab')}</span>
              </button>
              {isGenerating && (
                <button type="button" data-on={activeTab === 'generating'} onClick={() => setActiveTab('generating')}>
                  {t('blueprint.generatingTab')}
                </button>
              )}
            </>}
          </div>
          
          <TabsContent value="view" className={`mt-6 w-full max-w-full`}>
            {blueprintData && <div className="w-full max-w-full overflow-hidden space-y-6">
                {/* Calm row-list overview (design system) — everyone. */}
                <BlueprintOverview blueprint={blueprintData} />
                {/* Admins keep the full grid detail below, nothing lost. */}
                {isAdmin && (
                  <div className="pt-2 border-t border-border/40">
                    <SimplifiedBlueprintViewer blueprint={blueprintData} />
                  </div>
                )}
              </div>}
          </TabsContent>

          <TabsContent value="report" className={`mt-6 w-full max-w-full`}>
            <div className="w-full max-w-full overflow-hidden">
              <PersonalityReportViewer />
            </div>
          </TabsContent>
          
          {isAdmin && <TabsContent value="edit" className={`mt-6 w-full max-w-full`}>
              <div className="w-full max-w-full overflow-hidden">
                <BlueprintEditor onSave={handleSaveBlueprint} initialBlueprint={blueprintData ? convertToSaveFormat(blueprintData) : undefined} />
              </div>
            </TabsContent>}

          {isAdmin && <TabsContent value="health-check" className={`mt-6 w-full max-www-full`}>
              <div className="w-full max-w-full overflow-hidden">
                <BlueprintHealthCheck />
              </div>
            </TabsContent>}

          <TabsContent value="generating" className={`mt-6 w-full max-w-full`}>
            {isGenerating && blueprintData && <div className="w-full max-w-full overflow-hidden">
                <BlueprintGenerator userProfile={{
              full_name: blueprintData.user_meta?.full_name || "",
              preferred_name: blueprintData.user_meta?.preferred_name || "",
              birth_date: blueprintData.user_meta?.birth_date || "",
              birth_time_local: blueprintData.user_meta?.birth_time_local || "",
              birth_location: blueprintData.user_meta?.birth_location || "",
              timezone: blueprintData.user_meta?.timezone || ""
            }} onComplete={handleGenerationComplete} />
              </div>}
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </MainLayout>;
};
export default Blueprint;