
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { BlueprintViewer } from "@/components/blueprint/BlueprintViewer";
import { BlueprintEditor } from "@/components/blueprint/BlueprintEditor";
import { BlueprintRawDataViewer } from "@/components/ui/blueprint-raw-data-viewer";
import { useToast } from "@/hooks/use-toast";
import { BlueprintGenerationFlow } from '@/components/blueprint/BlueprintGenerationFlow';
import { Eye, EyeOff, Download } from "lucide-react";
import blueprintService from '@/services/blueprint-service';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Blueprint = () => {
  const [blueprint, setBlueprint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRawData, setShowRawData] = useState(false);
  const [activeTab, setActiveTab] = useState("viewer");
  const [showGenerationFlow, setShowGenerationFlow] = useState(false);
  const { toast } = useToast();

  // Load the user's blueprint
  useEffect(() => {
    const loadBlueprint = async () => {
      try {
        setLoading(true);
        
        // Check if there's a pending generation in progress
        const generationStatus = sessionStorage.getItem('blueprintGenerationStatus');
        
        if (generationStatus === 'in-progress') {
          setShowGenerationFlow(true);
          setLoading(false);
          return;
        }
        
        // Get the user's blueprint
        const data = await blueprintService.getDefaultBlueprint();
        
        if (!data) {
          // No blueprint found, show generation flow
          setShowGenerationFlow(true);
          setLoading(false);
          return;
        }
        
        setBlueprint(data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading blueprint:", err);
        setError("Failed to load your blueprint. Please try again.");
        setLoading(false);
      }
    };
    
    loadBlueprint();
  }, []);
  
  // Function to handle blueprint generation completion
  const handleGenerationComplete = async () => {
    try {
      // Clear the generation status
      sessionStorage.removeItem('blueprintGenerationStatus');
      
      // Get the updated blueprint
      const data = await blueprintService.getDefaultBlueprint();
      
      if (data) {
        setBlueprint(data);
        setShowGenerationFlow(false);
        
        toast({
          title: "Blueprint Ready!",
          description: "Your soul blueprint is now ready to explore.",
        });
      } else {
        throw new Error("Failed to load generated blueprint");
      }
    } catch (err) {
      console.error("Error after generation:", err);
      setError("Failed to load your generated blueprint. Please try again.");
      
      toast({
        variant: "destructive",
        title: "Error Loading Blueprint",
        description: "There was an issue loading your blueprint. Please refresh the page.",
      });
    }
  };
  
  // Toggle raw data view
  const toggleRawData = () => {
    setShowRawData(!showRawData);
  };
  
  // Download blueprint as JSON
  const downloadBlueprint = () => {
    if (!blueprint) return;
    
    const dataStr = JSON.stringify(blueprint, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `soul-blueprint-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Blueprint Downloaded",
      description: "Your soul blueprint has been downloaded as a JSON file.",
    });
  };

  // If still loading, show a loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <div className="flex justify-center items-center h-[60vh]">
            <div className="text-center space-y-4">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-soul-purple"></div>
              <p className="text-lg text-muted-foreground">Loading your Soul Blueprint...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  // If showing generation flow, render it
  if (showGenerationFlow) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold font-display text-center mb-6">
            <span className="gradient-text">Your Soul Blueprint</span>
          </h1>
          
          <BlueprintGenerationFlow 
            userMeta={{
              full_name: "New User",
              birth_date: "2000-01-01"
            }}
            onComplete={handleGenerationComplete}
          />
        </div>
      </MainLayout>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <CosmicCard className="p-6 max-w-2xl mx-auto">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold text-red-500">Error</h2>
              <p>{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </CosmicCard>
        </div>
      </MainLayout>
    );
  }

  // Render the main blueprint page
  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-display">
            <span className="gradient-text">Your Soul Blueprint</span>
          </h1>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleRawData}
              className="flex items-center"
            >
              {showRawData ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Hide Raw Data
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  View Raw Data
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadBlueprint}
              className="flex items-center"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        {blueprint && (
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            {/* Main content - takes up 5 columns on large screens */}
            <div className={cn(
              "lg:col-span-5 space-y-6",
              showRawData ? "lg:col-span-4" : "lg:col-span-5"
            )}>
              {/* Tabs for viewing vs editing */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 w-[400px] mb-6">
                  <TabsTrigger value="viewer">View Blueprint</TabsTrigger>
                  <TabsTrigger value="editor">Edit Blueprint</TabsTrigger>
                </TabsList>
                
                <TabsContent value="viewer">
                  <BlueprintViewer data={blueprint} />
                </TabsContent>
                
                <TabsContent value="editor">
                  <BlueprintEditor 
                    data={blueprint} 
                    onSave={(updatedData) => {
                      setBlueprint(updatedData);
                      toast({
                        title: "Blueprint Updated",
                        description: "Your changes have been saved."
                      });
                    }}
                  />
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Raw data panel - takes up 3 columns when visible */}
            {showRawData && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="lg:col-span-3"
              >
                <CosmicCard className="h-full overflow-hidden">
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2">Raw Blueprint Data</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      This is the raw JSON data of your blueprint.
                    </p>
                    
                    <BlueprintRawDataViewer 
                      data={blueprint} 
                      rawResponse={blueprint?._meta?.raw_response}
                    />
                  </div>
                </CosmicCard>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Blueprint;
