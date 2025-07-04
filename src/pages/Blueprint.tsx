
import React, { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/Layout/MainLayout";
import SimplifiedBlueprintViewer from "@/components/blueprint/SimplifiedBlueprintViewer";
import BlueprintEditor from "@/components/blueprint/BlueprintEditor";
import { BlueprintHealthCheck } from "@/components/blueprint/BlueprintHealthCheck";
import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle, RefreshCw, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BlueprintData, blueprintService } from "@/services/blueprint-service";
import { useNavigate } from "react-router-dom";
import { BlueprintGenerator } from "@/components/blueprint/BlueprintGenerationFlow";
import { useAuth } from "@/contexts/AuthContext";
import { useSoulOrb } from "@/contexts/SoulOrbContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOptimizedBlueprintData } from "@/hooks/use-optimized-blueprint-data";
import { isAdminUser } from "@/utils/isAdminUser";

const Blueprint = () => {
  const [activeTab, setActiveTab] = useState("view");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { speak } = useSoulOrb();
  const { t } = useLanguage();
  
  const { 
    blueprintData, 
    loading, 
    error, 
    hasBlueprint, 
    refetch 
  } = useOptimizedBlueprintData();

  console.log("Blueprint Page Debug:", {
    user: !!user,
    authLoading,
    loading,
    hasBlueprint,
    blueprintData: !!blueprintData,
    error,
    blueprintPreview: blueprintData ? {
      userName: blueprintData.user_meta?.preferred_name,
      mbtiType: blueprintData.cognitiveTemperamental?.mbtiType,
      sunSign: blueprintData.publicArchetype?.sunSign,
      lifePath: blueprintData.coreValuesNarrative?.lifePath
    } : null
  });

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <MainLayout>
        <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-3 mobile-container">
          <Loader2 className="h-8 w-8 animate-spin text-soul-purple" />
          <p className="mt-2 text-sm">Loading...</p>
        </div>
      </MainLayout>
    );
  }

  // Show sign in required if no user
  if (!user) {
    return (
      <MainLayout>
        <div className="w-full min-h-[80vh] flex items-center justify-center p-3 mobile-container">
          <div className="cosmic-card p-4 sm:p-6 text-center w-full max-w-md">
            <h1 className="text-lg sm:text-xl font-bold font-display mb-4 break-words">
              <span className="gradient-text">Soul Blueprint</span>
            </h1>
            <p className="mb-6 text-sm break-words">Please sign in to view your blueprint</p>
            <Button 
              className="bg-soul-purple hover:bg-soul-purple/90 w-full max-w-full"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show loading while blueprint is loading
  if (loading) {
    return (
      <MainLayout>
        <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-3 mobile-container">
          <Loader2 className="h-8 w-8 animate-spin text-soul-purple" />
          <p className="mt-2 text-sm break-words">Loading blueprint...</p>
        </div>
      </MainLayout>
    );
  }

  // Show error if there's an error
  if (error) {
    return (
      <MainLayout>
        <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-3 mobile-container">
          <div className="cosmic-card p-4 sm:p-6 text-center w-full max-w-md">
            <h2 className="text-base sm:text-lg font-semibold mb-4 text-red-500 break-words">Blueprint Error</h2>
            <p className="text-red-500 mb-4 text-sm break-words">{error}</p>
            <div className="space-y-2">
              <Button onClick={() => refetch()} className="w-full max-w-full">
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/onboarding')} 
                className="w-full max-w-full"
              >
                Create New Blueprint
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // If no blueprint exists, redirect to onboarding
  if (!hasBlueprint || !blueprintData) {
    console.log("No blueprint found, redirecting to onboarding");
    navigate('/onboarding');
    return null;
  }

  const isAdmin = isAdminUser(user);

  // Convert LayeredBlueprint to BlueprintData format for save operations
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
          title: "Blueprint Saved",
          description: "Your blueprint has been updated successfully",
        });
        await refetch();
        setActiveTab("view");
      } else {
        toast({
          title: "Error Saving Blueprint",
          description: result.error || "Failed to save blueprint",
          variant: "destructive"
        });
      }
      return result;
    } catch (err) {
      console.error("Error in save handler:", err);
      toast({
        title: "Error",
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
        title: "Regenerating Blueprint",
        description: "Your blueprint is being recalculated with fresh data",
      });
      
      speak("Your blueprint is being recalculated with fresh data");
    } else {
      toast({
        title: "Error",
        description: "Blueprint data not loaded",
        variant: "destructive"
      });
    }
  };

  const handleGenerationComplete = async (newBlueprint?: any) => {
    try {
      if (!newBlueprint) {
        toast({
          title: "Error",
          description: "Failed to generate new blueprint",
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
          title: "Blueprint Generated",
          description: "Your new blueprint has been generated successfully",
        });
        
        speak("Your new blueprint has been generated successfully");
      } else {
        toast({
          title: "Error Generating Blueprint",
          description: result.error || "Failed to generate blueprint",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error handling generation completion:", error);
      toast({
        title: "Error",
        description: String(error),
        variant: "destructive"
      });
    }
    
    setIsGenerating(false);
    setActiveTab("view");
  };

  return (
    <MainLayout>
      <div className="w-full p-3 sm:p-4 md:p-6 pb-20 mobile-container">
        {/* Mobile-friendly header with proper constraints */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6 w-full max-w-full">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display break-words">
            <span className="gradient-text">Soul Blueprint</span>
          </h1>
          
          {/* Action buttons - Mobile Stack with proper sizing */}
          <div className="flex flex-col gap-2 w-full max-w-full">
            {isAdmin && (
              <Button 
                variant="outline"
                className="flex items-center justify-center text-sm h-9 w-full max-w-full"
                onClick={handleRegenerateBlueprint}
                disabled={isGenerating}
              >
                <RefreshCw className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{isGenerating ? "Generating..." : "Regenerate"}</span>
              </Button>
            )}
            <Button 
              className="bg-soul-purple hover:bg-soul-purple/90 flex items-center justify-center text-sm h-9 w-full max-w-full"
              onClick={() => navigate('/coach')}
            >
              <MessageCircle className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">Chat with Coach</span>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8 w-full max-w-full">
          {/* Mobile-responsive tabs with proper overflow handling */}
          <TabsList className="w-full max-w-full h-auto p-1 grid grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="view" className="text-xs sm:text-sm py-2 px-1 truncate">
              View
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="edit" className="text-xs sm:text-sm py-2 px-1 truncate">
                Edit
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="health-check" className="text-xs sm:text-sm py-2 px-1 flex items-center gap-1 min-w-0">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden sm:inline truncate">Health Check</span>
                <span className="sm:hidden truncate">Health</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="generating" disabled={!isGenerating} className="text-xs sm:text-sm py-2 px-1 truncate">
              Generating
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="view" className="mt-4 sm:mt-6 w-full max-w-full">
            {blueprintData && (
              <div className="w-full max-w-full overflow-hidden">
                <SimplifiedBlueprintViewer blueprint={blueprintData} />
              </div>
            )}
          </TabsContent>
          
          {isAdmin && (
            <TabsContent value="edit" className="mt-4 sm:mt-6 w-full max-w-full">
              <div className="w-full max-w-full overflow-hidden">
                <BlueprintEditor onSave={handleSaveBlueprint} initialBlueprint={blueprintData ? convertToSaveFormat(blueprintData) : undefined} />
              </div>
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="health-check" className="mt-4 sm:mt-6 w-full max-w-full">
              <div className="w-full max-w-full overflow-hidden">
                <BlueprintHealthCheck />
              </div>
            </TabsContent>
          )}

          <TabsContent value="generating" className="mt-4 sm:mt-6 w-full max-w-full">
            {isGenerating && blueprintData && (
              <div className="w-full max-w-full overflow-hidden">
                <BlueprintGenerator 
                  userProfile={{
                    full_name: blueprintData.user_meta?.full_name || "",
                    preferred_name: blueprintData.user_meta?.preferred_name || "",
                    birth_date: blueprintData.user_meta?.birth_date || "",
                    birth_time_local: blueprintData.user_meta?.birth_time_local || "",
                    birth_location: blueprintData.user_meta?.birth_location || "",
                    timezone: blueprintData.user_meta?.timezone || ""
                  }}
                  onComplete={handleGenerationComplete}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Blueprint;
