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
    error
  });

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <MainLayout>
        <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-6">
          <Loader2 className="h-8 w-8 animate-spin text-soul-purple" />
          <p className="mt-2 text-sm sm:text-base">Loading...</p>
        </div>
      </MainLayout>
    );
  }

  // Show sign in required if no user
  if (!user) {
    return (
      <MainLayout>
        <div className="w-full min-h-[80vh] flex items-center justify-center p-4 sm:p-6">
          <div className="cosmic-card p-6 sm:p-8 text-center max-w-md w-full">
            <h1 className="text-xl sm:text-2xl font-bold font-display mb-4">
              <span className="gradient-text">Soul Blueprint</span>
            </h1>
            <p className="mb-6 text-sm sm:text-base">Please sign in to view your blueprint</p>
            <Button 
              className="bg-soul-purple hover:bg-soul-purple/90 w-full"
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
        <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-6">
          <Loader2 className="h-8 w-8 animate-spin text-soul-purple" />
          <p className="mt-2 text-sm sm:text-base">Loading blueprint...</p>
        </div>
      </MainLayout>
    );
  }

  // Show error if there's an error
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

  // Redirect to onboarding only if no blueprint exists
  if (!hasBlueprint) {
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
      <div className="w-full p-4 sm:p-6 pb-20">
        {/* Mobile-friendly header */}
        <div className="flex flex-col gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-display">
            <span className="gradient-text">Soul Blueprint</span>
          </h1>
          {/* Action buttons - Mobile Stack */}
          <div className="flex flex-col sm:flex-row gap-2">
            {isAdmin && (
              <Button 
                variant="outline"
                className="flex items-center justify-center text-sm h-9"
                onClick={handleRegenerateBlueprint}
                disabled={isGenerating}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {isGenerating ? "Generating..." : "Regenerate"}
              </Button>
            )}
            <Button 
              className="bg-soul-purple hover:bg-soul-purple/90 flex items-center justify-center text-sm h-9"
              onClick={() => navigate('/coach')}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat with Coach
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          {/* Mobile-responsive tabs */}
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full max-w-4xl mx-auto h-auto p-1">
            <TabsTrigger value="view" className="text-xs sm:text-sm py-2">View</TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="edit" className="text-xs sm:text-sm py-2">Edit</TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="health-check" className="text-xs sm:text-sm py-2 flex items-center gap-1">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Health Check</span>
                <span className="sm:hidden">Health</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="generating" disabled={!isGenerating} className="text-xs sm:text-sm py-2">
              Generating
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="view" className="mt-6">
            {blueprintData && (
              <SimplifiedBlueprintViewer blueprint={convertToSaveFormat(blueprintData)} />
            )}
          </TabsContent>
          
          {isAdmin && (
            <TabsContent value="edit" className="mt-6">
              <BlueprintEditor onSave={handleSaveBlueprint} initialBlueprint={blueprintData ? convertToSaveFormat(blueprintData) : undefined} />
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="health-check" className="mt-6">
              <BlueprintHealthCheck />
            </TabsContent>
          )}

          <TabsContent value="generating" className="mt-6">
            {isGenerating && blueprintData && (
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
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Blueprint;
