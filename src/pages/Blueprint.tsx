import React, { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/Layout/MainLayout";
import SimplifiedBlueprintViewer from "@/components/blueprint/SimplifiedBlueprintViewer";
import BlueprintEditor from "@/components/blueprint/BlueprintEditor";
import { BlueprintHealthCheck } from "@/components/blueprint/BlueprintHealthCheck";
import PersonalityReportViewer from "@/components/blueprint/PersonalityReportViewer";
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
const Blueprint = () => {
  const [activeTab, setActiveTab] = useState("view");
  const [isGenerating, setIsGenerating] = useState(false);
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
    t
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
        <div className={`w-full min-h-[80vh] flex flex-col items-center justify-center ${spacing.container} mobile-container`}>
          <Loader2 className="h-8 w-8 animate-spin text-soul-purple" />
          <p className={`mt-2 ${getTextSize('text-sm')} font-inter`}>{t('blueprint.loading')}</p>
        </div>
      </MainLayout>;
  }

  // Show sign in required if no user
  if (!user) {
    return <MainLayout>
        <div className={`w-full min-h-[80vh] flex items-center justify-center ${spacing.container} mobile-container`}>
          <div className={`cosmic-card ${spacing.card} text-center w-full ${layout.maxWidth}`}>
            <h1 className={`${getTextSize('text-xl')} font-bold font-cormorant mb-4 break-words`}>
              <span className="gradient-text">Soul Blueprint</span>
            </h1>
            <p className={`mb-6 ${getTextSize('text-sm')} break-words font-inter`}>{t('blueprint.signInRequired')}</p>
            <Button className="bg-soul-purple hover:bg-soul-purple/90 w-full max-w-full rounded-2xl font-inter font-medium" onClick={() => navigate('/auth')}>
              {t('blueprint.signIn')}
            </Button>
          </div>
        </div>
      </MainLayout>;
  }

  // Show loading while blueprint is loading
  if (loading) {
    return <MainLayout>
        <div className={`w-full min-h-[80vh] flex flex-col items-center justify-center ${spacing.container} mobile-container`}>
          <Loader2 className="h-8 w-8 animate-spin text-soul-purple" />
          <p className={`mt-2 ${getTextSize('text-sm')} break-words font-inter`}>{t('blueprint.loadingBlueprint')}</p>
        </div>
      </MainLayout>;
  }

  // Enhanced error handling - distinguish between different types of errors
  if (error) {
    const isNoBlueprint = error.includes("No active blueprint found");
    if (isNoBlueprint) {
      console.log("📝 BLUEPRINT PAGE: No blueprint found, should redirect to onboarding");
      return <MainLayout>
          <div className={`w-full min-h-[80vh] flex flex-col items-center justify-center ${spacing.container} mobile-container`}>
            <div className={`cosmic-card ${spacing.card} text-center w-full ${layout.maxWidth}`}>
              <AlertCircle className="h-12 w-12 text-soul-purple mx-auto mb-4" />
              <h2 className={`${getTextSize('text-lg')} font-semibold mb-4 break-words font-cormorant`}>
                <span className="gradient-text">{t('blueprint.createTitle')}</span>
              </h2>
              <p className={`${getTextSize('text-sm')} mb-6 break-words text-muted-foreground font-inter`}>
                {t('blueprint.createDescription')}
              </p>
              <div className={`space-y-2 ${spacing.gap}`}>
                <Button className="bg-soul-purple hover:bg-soul-purple/90 w-full rounded-2xl font-inter font-medium" onClick={() => navigate('/onboarding')}>
                  {t('blueprint.createButton')}
                </Button>
                <Button variant="outline" onClick={() => refetch()} className="w-full rounded-2xl font-inter">
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
        <div className={`w-full min-h-[80vh] flex flex-col items-center justify-center ${spacing.container} mobile-container`}>
          <div className={`cosmic-card ${spacing.card} text-center w-full ${layout.maxWidth}`}>
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className={`${getTextSize('text-lg')} font-semibold mb-4 text-red-500 break-words font-cormorant`}>{t('blueprint.blueprintError')}</h2>
            <p className={`text-red-500 mb-4 ${getTextSize('text-sm')} break-words font-inter`}>{error}</p>
            <div className={`space-y-2 ${spacing.gap}`}>
              <Button onClick={() => refetch()} className="w-full rounded-2xl font-inter font-medium">
                <RefreshCw className="mr-2 h-4 w-4" />
                {t('blueprint.tryAgain')}
              </Button>
              <Button variant="outline" onClick={() => navigate('/onboarding')} className="w-full rounded-2xl font-inter">
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
        <div className={`w-full min-h-[80vh] flex flex-col items-center justify-center ${spacing.container} mobile-container`}>
          <div className={`cosmic-card ${spacing.card} text-center w-full ${layout.maxWidth}`}>
            <AlertCircle className="h-12 w-12 text-soul-purple mx-auto mb-4" />
            <h2 className={`${getTextSize('text-lg')} font-semibold mb-4 break-words font-cormorant`}>
              <span className="gradient-text">{t('blueprint.completeTitle')}</span>
            </h2>
            <p className={`${getTextSize('text-sm')} mb-4 break-words text-muted-foreground font-inter`}>
              {t('blueprint.completeDescription')}
              {blueprintValidation.missingFields.length > 0 && <span className={`block mt-2 ${getTextSize('text-xs')} font-inter`}>
                  {t('blueprint.missing')}: {blueprintValidation.missingFields.join(', ')}
                </span>}
            </p>
            <div className="mb-4">
              <div className={`${getTextSize('text-xs')} text-muted-foreground mb-1 font-inter`}>
                {t('blueprint.completion')}: {getBlueprintCompletionPercentage}%
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-soul-purple h-2 rounded-full transition-all duration-300" style={{
                width: `${getBlueprintCompletionPercentage}%`
              }} />
              </div>
            </div>
            <div className={`space-y-2 ${spacing.gap}`}>
              <Button className="bg-soul-purple hover:bg-soul-purple/90 w-full rounded-2xl font-inter font-medium" onClick={() => navigate('/onboarding')}>
                {t('blueprint.completeButton')}
              </Button>
              <Button variant="outline" onClick={() => refetch()} className="w-full rounded-2xl font-inter">
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

      const reportResult = await hermeticPersonalityReportService.generateHermeticReport(convertToSaveFormat(blueprintData));
      
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
      <div className={`w-full ${spacing.container} pb-20 mobile-container`}>
        {/* Header with proper typography hierarchy */}
        <div className={`flex flex-col ${spacing.gap} mb-6 w-full max-w-full`}>
          <div className="flex items-center justify-between">
            <h1 className={`${getTextSize('text-3xl')} font-bold font-cormorant break-words`}>
              
            </h1>
            {getBlueprintCompletionPercentage < 100 && <div className={`${getTextSize('text-xs')} text-muted-foreground font-inter`}>
                {getBlueprintCompletionPercentage}% Complete
              </div>}
          </div>
          
          {/* Action buttons with proper font styling */}
          <div className={`flex flex-col ${spacing.gap} w-full max-w-full`}>
            {isAdmin && <Button variant="outline" className={`flex items-center justify-center ${getTextSize('text-sm')} h-12 w-full max-w-full rounded-2xl font-inter font-medium`} onClick={handleRegenerateBlueprint} disabled={isGenerating}>
                <RefreshCw className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{isGenerating ? t('blueprint.regenerating') : t('blueprint.regenerate')}</span>
              </Button>}
            
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8 w-full max-w-full">
          {/* Tabs with Inter font */}
          <TabsList className={`w-full max-w-full h-auto ${spacing.button} grid ${isAdmin ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'} !rounded-2xl font-inter`}>
            <TabsTrigger value="view" className={`${getTextSize('text-sm')} py-2 px-1 truncate !rounded-2xl font-medium`}>
              {t('blueprint.tab')}
            </TabsTrigger>
            <TabsTrigger value="report" className={`${getTextSize('text-sm')} py-2 px-1 truncate !rounded-2xl font-medium`}>
              {t('blueprint.reportTab')}
            </TabsTrigger>
            {isAdmin && <>
                <TabsTrigger value="edit" className={`${getTextSize('text-sm')} py-2 px-1 truncate !rounded-2xl font-medium`}>
                  {t('blueprint.editTab')}
                </TabsTrigger>
                <TabsTrigger value="health-check" className={`${getTextSize('text-sm')} py-2 px-1 flex items-center gap-1 min-w-0 !rounded-2xl font-medium`}>
                  <Activity className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className={`${isMobile ? 'hidden sm:inline' : 'inline'} truncate`}>{t('blueprint.healthTab')}</span>
                </TabsTrigger>
              </>}
            <TabsTrigger value="generating" disabled={!isGenerating} className={`${getTextSize('text-sm')} py-2 px-1 truncate !rounded-2xl font-medium ${!isAdmin ? 'hidden' : ''}`}>
              {t('blueprint.generatingTab')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="view" className={`mt-6 w-full max-w-full`}>
            {blueprintData && <div className="w-full max-w-full overflow-hidden">
                <SimplifiedBlueprintViewer blueprint={blueprintData} />
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
    </MainLayout>;
};
export default Blueprint;