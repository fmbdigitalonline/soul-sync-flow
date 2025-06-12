import React, { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/Layout/MainLayout";
import BlueprintViewer from "@/components/blueprint/BlueprintViewer";
import EnhancedBlueprintViewer from "@/components/blueprint/EnhancedBlueprintViewer";
import BlueprintEditor from "@/components/blueprint/BlueprintEditor";
import { BlueprintHealthCheck } from "@/components/blueprint/BlueprintHealthCheck";
import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle, RefreshCw, ToggleLeft, ToggleRight, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BlueprintData, blueprintService } from "@/services/blueprint-service";
import { useNavigate } from "react-router-dom";
import { BlueprintGenerator } from "@/components/blueprint/BlueprintGenerationFlow";
import { useAuth } from "@/contexts/AuthContext";
import { useSoulOrb } from "@/contexts/SoulOrbContext";
import { BlueprintEnhancementService } from "@/services/blueprint-enhancement-service";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOptimizedBlueprintData } from "@/hooks/use-optimized-blueprint-data";

const Blueprint = () => {
  const [activeTab, setActiveTab] = useState("view");
  const [isGenerating, setIsGenerating] = useState(false);
  const [useEnhanced, setUseEnhanced] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { speak } = useSoulOrb();
  const { t } = useLanguage();
  
  const { 
    blueprintData, 
    loading, 
    error, 
    hasBlueprint, 
    refetch 
  } = useOptimizedBlueprintData();

  // Memoize enhanced blueprint data to prevent unnecessary recalculations
  const enhancedBlueprint = useMemo(() => {
    if (!blueprintData) return null;
    return BlueprintEnhancementService.enhanceBlueprintData(blueprintData);
  }, [blueprintData]);

  // Redirect to onboarding if no blueprint exists
  if (!loading && !hasBlueprint && user) {
    navigate('/onboarding');
    return null;
  }

  const handleSaveBlueprint = async (updatedBlueprint: BlueprintData) => {
    try {
      console.log("Saving blueprint:", updatedBlueprint);
      const result = await blueprintService.saveBlueprintData(updatedBlueprint);
      
      if (result.success) {
        toast({
          title: t('blueprint.saved'),
          description: t('blueprint.savedDescription'),
        });
        await refetch(); // Use the cached refetch
        setActiveTab("view");
      } else {
        toast({
          title: t('blueprint.errorSaving'),
          description: result.error || t('blueprint.errorSaving'),
          variant: "destructive"
        });
      }
      return result;
    } catch (err) {
      console.error("Error in save handler:", err);
      toast({
        title: t('error'),
        description: String(err),
        variant: "destructive"
      });
      return { success: false, error: String(err) };
    }
  };

  const handleRegenerateBlueprint = () => {
    if (blueprintData) {
      setIsGenerating(true);
      setActiveTab("generating");
      
      toast({
        title: t('blueprint.regenerating'),
        description: t('blueprint.regeneratingDescription'),
      });
      
      speak(t('blueprint.regeneratingDescription'));
    } else {
      toast({
        title: t('error'),
        description: t('blueprint.errorLoading'),
        variant: "destructive"
      });
    }
  };

  const handleGenerationComplete = async (newBlueprint?: BlueprintData) => {
    try {
      if (!newBlueprint) {
        toast({
          title: t('error'),
          description: t('blueprint.errorGenerating'),
          variant: "destructive"
        });
        setIsGenerating(false);
        setActiveTab("view");
        return;
      }
      
      console.log("Generation complete, saving new blueprint");
      const result = await blueprintService.saveBlueprintData(newBlueprint);
      
      if (result.success) {
        await refetch(); // Use the cached refetch
        toast({
          title: t('blueprint.generated'),
          description: t('blueprint.generatedDescription'),
        });
        
        speak(t('blueprint.generatedDescription'));
      } else {
        toast({
          title: t('blueprint.errorGenerating'),
          description: result.error || t('blueprint.errorGenerating'),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error handling generation completion:", error);
      toast({
        title: t('error'),
        description: String(error),
        variant: "destructive"
      });
    }
    
    setIsGenerating(false);
    setActiveTab("view");
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="w-full min-h-[80vh] flex items-center justify-center p-4 sm:p-6">
          <div className="cosmic-card p-6 sm:p-8 text-center max-w-md w-full">
            <h1 className="text-xl sm:text-2xl font-bold font-display mb-4">
              <span className="gradient-text">{t('blueprint.title')}</span>
            </h1>
            <p className="mb-6 text-sm sm:text-base">{t('blueprint.signInRequired')}</p>
            <Button 
              className="bg-soul-purple hover:bg-soul-purple/90 w-full"
              onClick={() => navigate('/auth')}
            >
              {t('nav.signIn')}
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-6">
          <Loader2 className="h-8 w-8 animate-spin text-soul-purple" />
          <p className="mt-2 text-sm sm:text-base">{t('blueprint.loading')}</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-6">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="w-full p-4 sm:p-6 pb-20">
        {/* Mobile-friendly header */}
        <div className="flex flex-col gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-display">
            <span className="gradient-text">{t('blueprint.title')}</span>
          </h1>
          
          {/* Enhanced View Toggle - Mobile Stack */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
            <div className="flex items-center justify-center gap-2 order-2 sm:order-1">
              <span className="text-xs sm:text-sm text-muted-foreground">{t('blueprint.basicView')}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUseEnhanced(!useEnhanced)}
                className="p-1"
              >
                {useEnhanced ? 
                  <ToggleRight className="h-6 w-6 text-soul-purple" /> : 
                  <ToggleLeft className="h-6 w-6 text-gray-400" />
                }
              </Button>
              <span className="text-xs sm:text-sm text-muted-foreground">{t('blueprint.enhancedView')}</span>
            </div>
            
            {/* Action buttons - Mobile Stack */}
            <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2">
              <Button 
                variant="outline"
                className="flex items-center justify-center text-sm h-9"
                onClick={handleRegenerateBlueprint}
                disabled={isGenerating}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {isGenerating ? t('blueprint.generating') : t('blueprint.regenerate')}
              </Button>
              <Button 
                className="bg-soul-purple hover:bg-soul-purple/90 flex items-center justify-center text-sm h-9"
                onClick={() => navigate('/coach')}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                {t('blueprint.chatWithCoach')}
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          {/* Mobile-responsive tabs */}
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full max-w-4xl mx-auto h-auto p-1">
            <TabsTrigger value="view" className="text-xs sm:text-sm py-2">{t('blueprint.viewTab')}</TabsTrigger>
            <TabsTrigger value="edit" className="text-xs sm:text-sm py-2">{t('blueprint.editTab')}</TabsTrigger>
            <TabsTrigger value="health-check" className="text-xs sm:text-sm py-2 flex items-center gap-1">
              <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Health Check</span>
              <span className="sm:hidden">Health</span>
            </TabsTrigger>
            <TabsTrigger value="generating" disabled={!isGenerating} className="text-xs sm:text-sm py-2">
              {t('blueprint.generatingTab')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="view" className="mt-6">
            {blueprintData && (
              useEnhanced && enhancedBlueprint ? (
                <EnhancedBlueprintViewer blueprint={enhancedBlueprint} />
              ) : (
                <BlueprintViewer blueprint={blueprintData} />
              )
            )}
          </TabsContent>
          
          <TabsContent value="edit" className="mt-6">
            <BlueprintEditor onSave={handleSaveBlueprint} initialBlueprint={blueprintData || undefined} />
          </TabsContent>

          <TabsContent value="health-check" className="mt-6">
            <BlueprintHealthCheck />
          </TabsContent>

          <TabsContent value="generating" className="mt-6">
            {isGenerating && blueprintData && (
              <BlueprintGenerator 
                userProfile={blueprintData?.user_meta || {
                  full_name: "",
                  preferred_name: "",
                  birth_date: "",
                  birth_time_local: "",
                  birth_location: "",
                  timezone: ""
                }}
                onComplete={handleGenerationComplete}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Blueprint;
