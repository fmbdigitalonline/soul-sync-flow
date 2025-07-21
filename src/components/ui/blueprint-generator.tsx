
import React, { useState, useEffect, useRef } from "react";
import { BlueprintData, blueprintService } from "@/services/blueprint-service";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion } from "@/lib/framer-motion";
import { SoulOrb } from "./soul-orb";
import { Loader2 } from "lucide-react";

interface BlueprintGeneratorProps {
  formData: {
    name: string;
    birthDate: string;
    birthTime: string;
    birthLocation: string;
    personality: string;
  };
  onComplete: (blueprint?: BlueprintData) => void;
  className?: string;
}

export const BlueprintGenerator: React.FC<BlueprintGeneratorProps> = ({
  formData,
  onComplete,
  className,
}) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<
    "idle" | "generating" | "complete" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const retryCountRef = useRef(0);
  const maxRetries = 2; // Limit retries to prevent excessive API calls
  const hasStartedGenerationRef = useRef(false);

  useEffect(() => {
    const generateBlueprint = async () => {
      // Prevent multiple generation attempts in a single component lifecycle
      if (hasStartedGenerationRef.current) {
        console.log("Blueprint generation already started, ignoring duplicate effect");
        return;
      }

      if (
        !formData.name ||
        !formData.birthDate ||
        !formData.birthTime ||
        !formData.birthLocation
      ) {
        setErrorMessage("Missing required birth information");
        setStatus("error");
        return;
      }

      try {
        hasStartedGenerationRef.current = true;
        setStatus("generating");
        setProgress(10);

        console.log("Saving blueprint data to database...");

        // Create user data object for blueprint generation
        const userData = {
          full_name: formData.name,
          preferred_name: formData.name.split(" ")[0], // Use first name as preferred name
          birth_date: formData.birthDate,
          birth_time_local: formData.birthTime,
          birth_location: formData.birthLocation,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Use browser timezone
          personality: formData.personality // Add the personality field
        };

        console.log("Generating blueprint with user data:", userData);
        setProgress(30);

        // Generate blueprint from birth data
        const { data: blueprint, error, isPartial } =
          await blueprintService.generateBlueprintFromBirthData(userData);

        setProgress(70);

        if (error) {
          console.error("Error generating blueprint:", error);
          setErrorMessage(error);
          setStatus("error");
          toast({
            title: "Blueprint Generation Error",
            description: error || "Failed to generate blueprint. Please try again.",
            variant: "destructive",
          });
          return;
        } 
        
        if (isPartial) {
          toast({
            title: "Blueprint Generation Partial",
            description: "Some calculations were not fully accurate, but we've created your blueprint with the best available data.",
            variant: "destructive",
          });
        }

        // If we have a blueprint, save it
        if (blueprint) {
          const { success: saveSuccess, error: saveError } =
            await blueprintService.saveBlueprintData(blueprint);

          if (!saveSuccess) {
            console.error("Error saving blueprint:", saveError);
            toast({
              title: "Error Saving Blueprint",
              description:
                "Your blueprint was generated but couldn't be saved. Please try again.",
              variant: "destructive",
            });
            setStatus("error");
            setErrorMessage(saveError || "Failed to save blueprint");
            return;
          }
          
          // Set progress to complete
          setProgress(100);
          setStatus("complete");
          
          // Reset retry count on success
          retryCountRef.current = 0;
          
          // Pass the blueprint to parent component
          onComplete(blueprint);
        } else {
          // This should not happen if errors are properly handled, but just in case
          setErrorMessage("No blueprint data generated");
          setStatus("error");
          toast({
            title: "Blueprint Generation Error",
            description: "No blueprint data was generated. Please try again.",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Unexpected error in blueprint generation:", err);
        setErrorMessage(
          err instanceof Error ? err.message : "Unknown error occurred"
        );
        setStatus("error");
        toast({
          title: "Blueprint Generation Error",
          description: "There was a problem generating your blueprint. Please try again.",
          variant: "destructive",
        });
      }
    };

    generateBlueprint();
  }, [formData, onComplete, toast]);

  // Try again handler with retry limits
  const handleTryAgain = () => {
    // Check if we've exceeded the maximum retry attempts
    if (retryCountRef.current >= maxRetries) {
      setErrorMessage(`Maximum retry attempts (${maxRetries}) reached. Please go back and check your information.`);
      toast({
        title: "Too Many Attempts",
        description: `Failed after ${maxRetries} attempts. Please check your birth information and try again later.`,
        variant: "destructive",
      });
      return;
    }
    
    // Reset the generation flag to allow another attempt
    hasStartedGenerationRef.current = false;
    
    // Increment retry counter
    retryCountRef.current += 1;
    console.log(`Retry attempt ${retryCountRef.current} of ${maxRetries}`);
    
    setStatus("idle");
    setErrorMessage(null);
    setProgress(0);
    
    // Restarting the generation process
    const generateBlueprintAgain = async () => {
      try {
        setStatus("generating");
        setProgress(10);
        
        // Create user data object for blueprint generation
        const userData = {
          full_name: formData.name,
          preferred_name: formData.name.split(" ")[0],
          birth_date: formData.birthDate,
          birth_time_local: formData.birthTime,
          birth_location: formData.birthLocation,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          personality: formData.personality // Add the personality field
        };
        
        console.log("Retrying blueprint generation with user data:", userData);
        setProgress(30);
        
        const { data: blueprint, error, isPartial } =
          await blueprintService.generateBlueprintFromBirthData(userData);
          
        setProgress(70);
        
        if (error) {
          console.error("Error generating blueprint on retry:", error);
          setErrorMessage(error);
          setStatus("error");
          toast({
            title: "Blueprint Generation Error",
            description: error || "Failed to generate blueprint. Please try again.",
            variant: "destructive",
          });
          return;
        }
        
        if (isPartial) {
          toast({
            title: "Blueprint Generation Partial",
            description: "Some calculations were not fully accurate, but we've created your blueprint with the best available data.",
            variant: "destructive",
          });
        }
        
        if (blueprint) {
          const { success: saveSuccess, error: saveError } =
            await blueprintService.saveBlueprintData(blueprint);
            
          if (!saveSuccess) {
            console.error("Error saving blueprint on retry:", saveError);
            toast({
              title: "Error Saving Blueprint",
              description: "Your blueprint was generated but couldn't be saved. Please try again.",
              variant: "destructive",
            });
            setStatus("error");
            setErrorMessage(saveError || "Failed to save blueprint");
            return;
          }
          
          setProgress(100);
          setStatus("complete");
          // Reset retry count on success
          retryCountRef.current = 0;
          onComplete(blueprint);
        } else {
          setErrorMessage("No blueprint data generated on retry");
          setStatus("error");
          toast({
            title: "Blueprint Generation Error",
            description: "No blueprint data was generated. Please try again.",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Unexpected error in blueprint generation retry:", err);
        setErrorMessage(
          err instanceof Error ? err.message : "Unknown error occurred"
        );
        setStatus("error");
        toast({
          title: "Blueprint Generation Error",
          description: "There was a problem generating your blueprint. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    generateBlueprintAgain();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {status === "idle" && (
        <div className="text-center">
          <p>Ready to generate your personal Soul Blueprint...</p>
        </div>
      )}

      {status === "generating" && (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <SoulOrb size="md" pulse={true} stage="generating" />
          </div>
          <p>Generating your Soul Blueprint...</p>
          <div className="w-full bg-muted rounded-full h-2.5 mb-4">
            <div
              className="bg-primary h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm font-inter text-muted-foreground">
            {progress < 30
              ? "Connecting to celestial database..."
              : progress < 60
              ? "Calculating planetary positions..."
              : progress < 80
              ? "Generating your unique profile..."
              : "Finalizing your Soul Blueprint..."}
          </p>
        </div>
      )}

      {status === "complete" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="flex justify-center">
            <SoulOrb size="md" pulse={false} stage="complete" />
          </div>
          <p className="text-lg font-semibold mt-2">Blueprint Generation Complete!</p>
          <p className="text-sm">Your Soul Blueprint has been created successfully.</p>
        </motion.div>
      )}

      {status === "error" && (
        <div className="text-center space-y-4">
          <div className="text-destructive flex items-center justify-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="font-cormorant font-medium">Blueprint Generation Error</p>
          </div>
          <p className="text-sm font-inter">{errorMessage || "An unknown error occurred"}</p>
          <div>
            {retryCountRef.current < maxRetries ? (
              <button
                onClick={handleTryAgain}
                className="bg-primary hover:bg-primary/80 text-primary-foreground font-cormorant px-4 py-2 rounded-md flex items-center mx-auto"
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Try Again ({retryCountRef.current + 1}/{maxRetries + 1})
              </button>
            ) : (
              <div className="text-amber-500 dark:text-amber-400 text-sm font-inter">
                Maximum retry attempts reached. Please check your information and try again later.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
