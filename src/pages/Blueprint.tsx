
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/Layout/MainLayout";
import BlueprintViewer from "@/components/blueprint/BlueprintViewer";
import BlueprintEditor from "@/components/blueprint/BlueprintEditor";
import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BlueprintData, blueprintService } from "@/services/blueprint-service";
import { useNavigate } from "react-router-dom";
import { BlueprintGenerator } from "@/components/blueprint/BlueprintGenerationFlow";
import { useAuth } from "@/contexts/AuthContext";
import { useSoulOrb } from "@/contexts/SoulOrbContext";

const Blueprint = () => {
  const [activeTab, setActiveTab] = useState("view");
  const [blueprint, setBlueprint] = useState<BlueprintData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { speak } = useSoulOrb();

  // Check if user has any blueprints
  useEffect(() => {
    const checkUserBlueprints = async () => {
      if (user) {
        setIsLoading(true);
        try {
          console.log("Checking for existing blueprint...");
          const { data, error } = await blueprintService.getActiveBlueprintData();
          
          if (error) {
            console.error("Error loading blueprint:", error);
            toast({
              title: "Error loading blueprint",
              description: error,
              variant: "destructive"
            });
          }
          
          console.log("Blueprint data check result:", data ? "Found" : "Not found");
          
          // If no blueprint exists, mark as new user and redirect to onboarding
          if (!data) {
            setIsNewUser(true);
            toast({
              title: "Welcome to SoulSync!",
              description: "Let's create your Soul Blueprint through our onboarding process.",
            });
            navigate('/onboarding');
            return;
          }
          
          setBlueprint(data);
        } catch (err) {
          console.error("Unexpected error loading blueprint:", err);
          toast({
            title: "Error",
            description: "Failed to load your blueprint. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    if (user) {
      checkUserBlueprints();
    }
  }, [user, navigate, toast]);

  const handleSaveBlueprint = async (updatedBlueprint: BlueprintData) => {
    try {
      console.log("Saving blueprint:", updatedBlueprint);
      const result = await blueprintService.saveBlueprintData(updatedBlueprint);
      
      if (result.success) {
        toast({
          title: "Blueprint saved",
          description: "Your Soul Blueprint has been successfully updated",
        });
        setBlueprint(updatedBlueprint);
        setActiveTab("view");
      } else {
        toast({
          title: "Error saving blueprint",
          description: result.error || "Failed to save blueprint",
          variant: "destructive"
        });
      }
      return result;
    } catch (err) {
      console.error("Error in save handler:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving",
        variant: "destructive"
      });
      return { success: false, error: String(err) };
    }
  };

  const handleRegenerateBlueprint = () => {
    if (blueprint) {
      setIsGenerating(true);
      setActiveTab("generating");
      
      // Give user feedback
      toast({
        title: "Regenerating Blueprint",
        description: "We're calculating your cosmic profile. This may take a moment...",
      });
      
      speak("I'm regenerating your Soul Blueprint with the latest cosmic calculations.");
    } else {
      toast({
        title: "Error",
        description: "No blueprint data available to regenerate",
        variant: "destructive"
      });
    }
  };

  const handleGenerationComplete = async (newBlueprint?: BlueprintData) => {
    try {
      if (!newBlueprint) {
        toast({
          title: "Error",
          description: "No blueprint data was generated",
          variant: "destructive"
        });
        setIsGenerating(false);
        setActiveTab("view");
        return;
      }
      
      console.log("Generation complete, saving new blueprint");
      const result = await blueprintService.saveBlueprintData(newBlueprint);
      
      if (result.success) {
        setBlueprint(newBlueprint);
        toast({
          title: "Blueprint generated",
          description: "Your Soul Blueprint has been successfully regenerated and saved",
        });
        
        speak("Your new Soul Blueprint is ready to explore!");
      } else {
        toast({
          title: "Error saving generated blueprint",
          description: result.error || "Failed to save the generated blueprint",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error handling generation completion:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving the blueprint",
        variant: "destructive"
      });
    }
    
    setIsGenerating(false);
    setActiveTab("view");
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[80vh]">
          <div className="cosmic-card p-8 text-center max-w-md w-full">
            <h1 className="text-2xl font-bold font-display mb-4">
              <span className="gradient-text">Soul Blueprint</span>
            </h1>
            <p className="mb-6">You need to sign in to view and edit your Soul Blueprint</p>
            <Button 
              className="bg-soul-purple hover:bg-soul-purple/90"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-soul-purple" />
          <p className="mt-2">Loading your Soul Blueprint...</p>
        </div>
      </MainLayout>
    );
  }

  // Redirect to onboarding if new user (this is a fallback in case the earlier navigation doesn't work)
  if (isNewUser) {
    navigate('/onboarding');
    return null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6 pb-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-display">
            <span className="gradient-text">Soul Blueprint</span>
          </h1>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="flex items-center"
              onClick={handleRegenerateBlueprint}
              disabled={isGenerating}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Regenerate Blueprint'}
            </Button>
            <Button 
              className="bg-soul-purple hover:bg-soul-purple/90 flex items-center"
              onClick={() => navigate('/coach')}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat with Soul Coach
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-3 w-[600px] max-w-full mx-auto">
            <TabsTrigger value="view">View Blueprint</TabsTrigger>
            <TabsTrigger value="edit">Edit Blueprint</TabsTrigger>
            <TabsTrigger value="generating" disabled={!isGenerating}>
              Generating
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="view" className="mt-6">
            {blueprint && <BlueprintViewer blueprint={blueprint} />}
          </TabsContent>
          
          <TabsContent value="edit" className="mt-6">
            <BlueprintEditor onSave={handleSaveBlueprint} initialBlueprint={blueprint || undefined} />
          </TabsContent>

          <TabsContent value="generating" className="mt-6">
            {isGenerating && blueprint && (
              <BlueprintGenerator 
                userProfile={blueprint?.user_meta || {
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
