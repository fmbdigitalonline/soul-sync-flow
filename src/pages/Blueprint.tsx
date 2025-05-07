
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/Layout/MainLayout";
import BlueprintViewer from "@/components/blueprint/BlueprintViewer";
import BlueprintEditor from "@/components/blueprint/BlueprintEditor";
import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BlueprintData, blueprintService, defaultBlueprintData } from "@/services/blueprint-service";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Blueprint = () => {
  const [activeTab, setActiveTab] = useState("view");
  const [blueprint, setBlueprint] = useState<BlueprintData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load blueprint data
  useEffect(() => {
    const loadBlueprintData = async () => {
      if (isAuthenticated) {
        setIsLoading(true);
        const { data, error } = await blueprintService.getActiveBlueprintData();
        
        if (error) {
          toast({
            title: "Error loading blueprint",
            description: error,
            variant: "destructive"
          });
        }
        
        setBlueprint(data || defaultBlueprintData);
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      loadBlueprintData();
    }
  }, [isAuthenticated, toast]);

  const handleSaveBlueprint = async (updatedBlueprint: BlueprintData) => {
    return await blueprintService.saveBlueprintData(updatedBlueprint);
  };

  if (!isAuthenticated) {
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

  return (
    <MainLayout>
      <div className="container mx-auto p-6 pb-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-display">
            <span className="gradient-text">Soul Blueprint</span>
          </h1>
          <Button 
            className="bg-soul-purple hover:bg-soul-purple/90 flex items-center"
            onClick={() => navigate('/coach')}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Chat with Soul Coach
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-2 w-[400px] mx-auto">
            <TabsTrigger value="view">View Blueprint</TabsTrigger>
            <TabsTrigger value="edit">Edit Blueprint</TabsTrigger>
          </TabsList>
          
          <TabsContent value="view" className="mt-6">
            {blueprint && <BlueprintViewer blueprint={blueprint} />}
          </TabsContent>
          
          <TabsContent value="edit" className="mt-6">
            <BlueprintEditor onSave={handleSaveBlueprint} initialBlueprint={blueprint || undefined} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Blueprint;
