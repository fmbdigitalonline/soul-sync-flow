
import React, { useState, useEffect } from "react";
import { BlueprintData, blueprintService } from "@/services/blueprint-service";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion } from "@/lib/framer-motion";
import { SoulOrb } from "../ui/soul-orb";
import { Loader2 } from "lucide-react";

interface BlueprintGeneratorProps {
  userProfile: {
    full_name: string;
    preferred_name?: string; // Make preferred_name optional here
    birth_date: string;
    birth_time_local: string;
    birth_location: string;
    timezone: string;
    personality?: string;
  };
  onComplete: (blueprint?: BlueprintData) => void;
  className?: string;
}

export const BlueprintGenerator: React.FC<BlueprintGeneratorProps> = ({
  userProfile,
  onComplete,
  className,
}) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<
    "idle" | "generating" | "complete" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2; // Limit retries to prevent excessive API calls
  const [hasStartedGeneration, setHasStartedGeneration] = useState(false);

  useEffect(() => {
    const generateBlueprint = async () => {
      // Prevent multiple generation attempts
      if (hasStartedGeneration) {
        console.log("Blueprint generation already started, ignoring duplicate effect");
        return;
      }

      if (
        !userProfile.full_name ||
        !userProfile.birth_date ||
        !userProfile.birth_time_local ||
        !userProfile.birth_location
      ) {
        setErrorMessage("Missing required birth information");
        setStatus("error");
        return;
      }

      try {
        setHasStartedGeneration(true);
        setStatus("generating");
        setProgress(10);

        console.log("Generating blueprint with user data:", userProfile);
        setProgress(30);

        // Generate blueprint from birth data
        const { data: blueprint, error, isPartial } =
          await blueprintService.generateBlueprintFromBirthData(userProfile);

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
            variant: "default",
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
  }, [userProfile, onComplete, toast, hasStartedGeneration]);

  // Try again handler with retry limits
  const handleTryAgain = () => {
    // Check if we've exceeded the maximum retry attempts
    if (retryCount >= maxRetries) {
      setErrorMessage(`Maximum retry attempts (${maxRetries}) reached. Please go back and check your information.`);
      toast({
        title: "Too Many Attempts",
        description: `Failed after ${maxRetries} attempts. Please check your birth information and try again later.`,
        variant: "destructive",
      });
      return;
    }
    
    // Reset the generation flag to allow another attempt
    setHasStartedGeneration(false);
    
    // Increment retry counter
    setRetryCount(prev => prev + 1);
    
    setStatus("idle");
    setErrorMessage(null);
    setProgress(0);
    
    // The effect will trigger the generation again
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
          <div className="w-full bg-gray-800 rounded-full h-2.5 mb-4">
            <div
              className="bg-soul-purple h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400">
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
          <div className="text-red-500 flex items-center justify-center space-x-2">
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
            <p className="font-medium">Blueprint Generation Error</p>
          </div>
          <p className="text-sm">{errorMessage || "An unknown error occurred"}</p>
          <div>
            {retryCount < maxRetries ? (
              <button
                onClick={handleTryAgain}
                className="bg-soul-purple hover:bg-soul-purple/80 text-white px-4 py-2 rounded-md flex items-center mx-auto"
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Try Again ({retryCount + 1}/{maxRetries + 1})
              </button>
            ) : (
              <div className="text-amber-500 text-sm">
                Maximum retry attempts reached. Please check your information and try again later.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
