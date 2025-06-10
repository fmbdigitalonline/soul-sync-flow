
import React, { useState, useEffect, useRef } from "react";
import { BlueprintData, blueprintService } from "@/services/blueprint-service";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion } from "@/lib/framer-motion";
import { SoulOrb } from "./soul-orb";
import { AlertTriangle } from "lucide-react";

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
  const [healthCheckResults, setHealthCheckResults] = useState<string[]>([]);
  const { toast } = useToast();
  const retryCountRef = useRef(0);
  const maxRetries = 0; // HEALTH CHECK: No retries - fail fast
  const hasStartedGenerationRef = useRef(false);

  useEffect(() => {
    const generateBlueprint = async () => {
      // Prevent multiple generation attempts in a single component lifecycle
      if (hasStartedGenerationRef.current) {
        console.log("HEALTH CHECK: Blueprint generation already started, ignoring duplicate effect");
        return;
      }

      // HEALTH CHECK: Strict validation
      if (
        !formData.name ||
        !formData.birthDate ||
        !formData.birthTime ||
        !formData.birthLocation
      ) {
        setErrorMessage("HEALTH CHECK FAIL: Missing required birth information");
        setStatus("error");
        return;
      }

      try {
        hasStartedGenerationRef.current = true;
        setStatus("generating");
        setProgress(10);
        setHealthCheckResults(["🔍 Starting health check mode - no fallbacks enabled"]);

        console.log("HEALTH CHECK: Saving blueprint data to database...");

        // Create user data object for blueprint generation
        const userData = {
          full_name: formData.name,
          preferred_name: formData.name.split(" ")[0],
          birth_date: formData.birthDate,
          birth_time_local: formData.birthTime,
          birth_location: formData.birthLocation,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          personality: formData.personality
        };

        // HEALTH CHECK: Validate timezone
        if (!userData.timezone) {
          throw new Error("HEALTH CHECK FAIL: Could not determine browser timezone");
        }

        console.log("HEALTH CHECK: Generating blueprint with user data:", userData);
        setProgress(30);
        setHealthCheckResults(prev => [...prev, "📍 Validating birth data and location"]);

        // Generate blueprint from birth data - HEALTH CHECK MODE
        const { data: blueprint, error, isPartial } =
          await blueprintService.generateBlueprintFromBirthData(userData);

        setProgress(70);

        if (error) {
          throw new Error(`HEALTH CHECK FAIL: ${error}`);
        } 
        
        if (isPartial) {
          throw new Error("HEALTH CHECK FAIL: Partial calculation detected - should not happen in health check mode");
        }

        // If we have a blueprint, save it
        if (blueprint) {
          setHealthCheckResults(prev => [...prev, "✅ All calculations successful - saving blueprint"]);
          
          const { success: saveSuccess, error: saveError } =
            await blueprintService.saveBlueprintData(blueprint);

          if (!saveSuccess) {
            throw new Error(`HEALTH CHECK FAIL: Blueprint save failed - ${saveError}`);
          }
          
          setProgress(100);
          setStatus("complete");
          setHealthCheckResults(prev => [...prev, "🎉 Health check PASSED - all systems operational"]);
          
          // Reset retry count on success
          retryCountRef.current = 0;
          
          // Pass the blueprint to parent component
          onComplete(blueprint);
        } else {
          throw new Error("HEALTH CHECK FAIL: No blueprint data generated");
        }
      } catch (err) {
        console.error("HEALTH CHECK FAIL: Unexpected error in blueprint generation:", err);
        const errorMsg = err instanceof Error ? err.message : "Unknown error occurred";
        setErrorMessage(errorMsg);
        setStatus("error");
        setHealthCheckResults(prev => [...prev, `💥 CRITICAL FAILURE: ${errorMsg}`]);
        toast({
          title: "Health Check Critical Failure",
          description: "System health check failed. Check console for details.",
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
          <AlertTriangle className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
          <p className="font-semibold">Health Check Mode Enabled</p>
          <p className="text-sm text-muted-foreground">All fallbacks disabled - system will fail hard to reveal issues</p>
        </div>
      )}

      {status === "generating" && (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <SoulOrb size="md" pulse={true} stage="generating" />
          </div>
          <p className="font-semibold">Running Health Check...</p>
          <div className="w-full bg-gray-800 rounded-full h-2.5 mb-4">
            <div
              className="bg-soul-purple h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Health Check Results */}
          <div className="text-left max-w-md mx-auto">
            <h4 className="font-semibold mb-2">Health Check Progress:</h4>
            <div className="space-y-1 text-sm font-mono">
              {healthCheckResults.map((result, index) => (
                <div key={index} className="text-left">
                  {result}
                </div>
              ))}
            </div>
          </div>
          
          <p className="text-sm text-gray-400">
            {progress < 30
              ? "Validating astronomical calculation engines..."
              : progress < 60
              ? "Testing planetary position calculations..."
              : progress < 80
              ? "Verifying Human Design gate calculations..."
              : "Finalizing health check..."}
          </p>
        </div>
      )}

      {status === "complete" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center">
            <SoulOrb size="md" pulse={false} stage="complete" />
          </div>
          <p className="text-lg font-semibold text-green-500">🎉 Health Check PASSED!</p>
          <p className="text-sm">All calculation engines are working correctly.</p>
          
          {/* Final Health Check Summary */}
          <div className="text-left max-w-md mx-auto mt-4">
            <h4 className="font-semibold mb-2">Health Check Summary:</h4>
            <div className="space-y-1 text-sm font-mono bg-green-900/20 p-3 rounded">
              {healthCheckResults.map((result, index) => (
                <div key={index} className="text-left">
                  {result}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {status === "error" && (
        <div className="text-center space-y-4">
          <div className="text-red-500 flex items-center justify-center space-x-2">
            <AlertTriangle className="h-6 w-6" />
            <p className="font-medium">Health Check FAILED</p>
          </div>
          <p className="text-sm font-mono bg-red-900/20 p-3 rounded text-left max-w-md mx-auto">
            {errorMessage || "Unknown health check failure"}
          </p>
          
          {/* Health Check Failure Results */}
          {healthCheckResults.length > 0 && (
            <div className="text-left max-w-md mx-auto">
              <h4 className="font-semibold mb-2">Health Check Log:</h4>
              <div className="space-y-1 text-sm font-mono bg-red-900/20 p-3 rounded">
                {healthCheckResults.map((result, index) => (
                  <div key={index} className="text-left">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-amber-500 text-sm">
            <p className="font-semibold">Health Check Mode - No Retries</p>
            <p>System configured to fail fast to reveal calculation issues.</p>
            <p>Check the error details above to identify what needs fixing.</p>
          </div>
        </div>
      )}
    </div>
  );
};
