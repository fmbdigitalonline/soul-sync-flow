
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/Layout/MainLayout";
import BlueprintViewer from "@/components/blueprint/BlueprintViewer";
import BlueprintEditor from "@/components/blueprint/BlueprintEditor";
import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BlueprintData, blueprintService, defaultBlueprintData } from "@/services/blueprint-service";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BlueprintGenerator } from "@/components/blueprint/BlueprintGenerationFlow";
import { useAuth } from "@/contexts/AuthContext";

const Blueprint = () => {
  const [activeTab, setActiveTab] = useState("view");
  const [blueprint, setBlueprint] = useState<BlueprintData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user has any blueprints
  useEffect(() => {
    const checkUserBlueprints = async () => {
      if (user) {
        setIsLoading(true);
        const { data, error } = await blueprintService.getActiveBlueprintData();
        
        if (error) {
          toast({
            title: "Error loading blueprint",
            description: error,
            variant: "destructive"
          });
        }
        
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
        setIsLoading(false);
      }
    };
    
    if (user) {
      checkUserBlueprints();
    }
  }, [user, navigate, toast]);

  const handleSaveBlueprint = async (updatedBlueprint: BlueprintData) => {
    return await blueprintService.saveBlueprintData(updatedBlueprint);
  };

  const handleRegenerateBlueprint = () => {
    setIsGenerating(true);
    setActiveTab("generating");
  };

  const handleGenerationComplete = (newBlueprint: BlueprintData) => {
    setBlueprint(newBlueprint);
    setIsGenerating(false);
    setActiveTab("view");
    
    toast({
      title: "Blueprint generated",
      description: "Your Soul Blueprint has been successfully updated",
    });
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
              onClick={() => window.location.href = '/auth'}
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
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate Blueprint
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
          <TabsList className="grid grid-cols-3 w-[600px] mx-auto">
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
            <BlueprintGenerator 
              userProfile={blueprint?.user_meta || defaultBlueprintData.user_meta}
              onComplete={handleGenerationComplete}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Blueprint;
