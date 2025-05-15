
import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    const generateBlueprint = async () => {
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
        setStatus("generating");
        setProgress(10);

        console.log("Saving blueprint data to database...");

        // Create user data object for blueprint generation
        const userData: BlueprintData["user_meta"] = {
          full_name: formData.name,
          preferred_name: formData.name.split(" ")[0], // Use first name as preferred name
          birth_date: formData.birthDate,
          birth_time_local: formData.birthTime,
          birth_location: formData.birthLocation,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Use browser timezone
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
          
          // Show error but continue with fallback data if available
          toast({
            title: "Blueprint Generation Warning",
            description: "Some data couldn't be calculated accurately. Using fallback data.",
            variant: "destructive",
          });
          
          if (!blueprint) {
            setStatus("error");
            return;
          }
        } else if (isPartial) {
          toast({
            title: "Blueprint Generation Partial",
            description: "Some calculations were not fully accurate, but we've created your blueprint with the best available data.",
            variant: "warning",
          });
        }

        // Save blueprint to database
        if (blueprint) {
          const { success: saveSuccess, error: saveError } =
            await blueprintService.saveBlueprintData(blueprint);

          if (!saveSuccess) {
            console.error("Error saving blueprint:", saveError);
            toast({
              title: "Error Saving Blueprint",
              description:
                "Your blueprint was generated but couldn't be saved. You can still view it.",
              variant: "destructive",
            });
          }
        }

        setProgress(100);
        setStatus("complete");
        
        // Pass the blueprint to parent component
        onComplete(blueprint || undefined);
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
            <button
              onClick={() => {
                setStatus("idle");
                setErrorMessage(null);
                setProgress(0);
                generateBlueprint();
              }}
              className="bg-soul-purple hover:bg-soul-purple/80 text-white px-4 py-2 rounded-md flex items-center mx-auto"
            >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
