
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BlueprintData } from "@/services/blueprint-service";
import { useToast } from "@/hooks/use-toast";
import { importBlueprintFromJson, exampleFeurionBlueprint } from "@/services/blueprint-examples";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Loader2 } from "lucide-react";

export interface BlueprintEditorProps {
  data?: BlueprintData;
  initialBlueprint?: BlueprintData;
  onSave: (blueprint: BlueprintData) => Promise<{ success: boolean; error?: string }>;
}

const BlueprintEditor: React.FC<BlueprintEditorProps> = ({ onSave, initialBlueprint, data }) => {
  const [jsonText, setJsonText] = useState(
    data || initialBlueprint 
      ? JSON.stringify(data || initialBlueprint, null, 2) 
      : JSON.stringify(exampleFeurionBlueprint, null, 2)
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    const { data: parsedData, error } = importBlueprintFromJson(jsonText);
    
    if (error || !parsedData) {
      toast({
        title: "Invalid JSON",
        description: error || "Could not parse blueprint data",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    const result = await onSave(parsedData);
    setIsLoading(false);
    
    if (result.success) {
      toast({
        title: "Blueprint saved successfully",
        description: "Your soul blueprint has been updated."
      });
    } else {
      toast({
        title: "Error saving blueprint",
        description: result.error || "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <CosmicCard className="p-6">
      <h2 className="text-2xl font-bold font-display mb-4 text-center">
        <span className="gradient-text">Edit Blueprint</span>
      </h2>
      
      <p className="text-muted-foreground mb-4 text-sm">
        Edit the JSON directly or paste in a new blueprint. Changes will be applied when you save.
      </p>
      
      <Textarea 
        className="font-mono text-sm h-[400px] mb-4"
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
      />
      
      <div className="flex justify-end">
        <Button
          className="bg-soul-purple hover:bg-soul-purple/90"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Blueprint"
          )}
        </Button>
      </div>
    </CosmicCard>
  );
};

export default BlueprintEditor;
