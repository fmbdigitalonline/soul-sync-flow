
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, XCircle, Info } from "lucide-react";
import blueprintService, { BlueprintData } from '@/services/blueprint-service';
import { useToast } from "@/hooks/use-toast";

interface BlueprintGeneratorProps {
  formData: {
    name: string;
    birthDate: string;
    birthTime: string;
    birthLocation: string;
    personality: string;
  };
  onComplete?: () => void;
  className?: string;
}

export const BlueprintGenerator: React.FC<BlueprintGeneratorProps> = ({
  formData,
  onComplete,
  className
}) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'initial' | 'loading' | 'success' | 'error'>('initial');
  const [errorMessage, setErrorMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [queueInfo, setQueueInfo] = useState({ position: 0, length: 0, estimatedTimeSeconds: 0 });
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const generateBlueprint = async () => {
      try {
        setStatus('loading');
        setProgress(10);
        setErrorMessage('');
        setDebugInfo(null);

        // Format the user data for the blueprint service
        const userData = {
          full_name: formData.name,
          birth_date: formData.birthDate,
          birth_time_local: formData.birthTime || undefined,
          birth_location: formData.birthLocation || undefined,
          mbti: formData.personality || undefined,
        };

        // Set up a progress animation that slowly increases while we wait
        let currentProgress = 10;
        const interval = setInterval(() => {
          // Gradually increase progress to simulate ongoing work
          // Max out at 75% until we get a real response
          currentProgress = Math.min(75, currentProgress + 0.5);
          setProgress(currentProgress);
        }, 1000);
        
        setProgressInterval(interval);
        setProgress(25);

        // Generate the blueprint
        const result = await blueprintService.generateBlueprintFromBirthData(userData);
        
        // Store raw response for debugging
        if (result.rawResponse) {
          setDebugInfo(result.rawResponse);
        }
        
        // Update queue information if available
        if (result.queueLength !== undefined) {
          const estimatedTimeSeconds = result.queueLength * 20; // Updated estimate: 20 seconds per request
          setQueueInfo({ 
            position: result.queuePosition || 0, 
            length: result.queueLength,
            estimatedTimeSeconds
          });
        }
        
        // Clear the progress interval
        if (interval) {
          clearInterval(interval);
          setProgressInterval(null);
        }
        
        // If there's an error in the result, handle it
        if (!result.success) {
          throw new Error(result.error || "Unknown error");
        }

        const blueprint = result.blueprint;
        if (!blueprint) {
          throw new Error("No blueprint data returned from service");
        }
        
        // Handle case where we received raw content that needs parsing
        if (blueprint.needs_parsing && blueprint.raw_content) {
          console.log("Received content that needs manual parsing");
          // We still continue with this content and handle it during the save process
        }
        
        setProgress(75);

        // Save the blueprint to the database
        const saveResult = await blueprintService.saveBlueprintToDatabase(blueprint);
        
        if (!saveResult.success) {
          throw new Error(saveResult.error || 'Failed to save blueprint');
        }

        setProgress(100);
        setStatus('success');

        toast({
          title: "Blueprint Generated",
          description: "Your soul blueprint has been created successfully!",
        });

        // Call the onComplete callback after a delay
        if (onComplete) {
          setTimeout(onComplete, 2000);
        }

      } catch (error) {
        console.error('Error generating blueprint:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
        setDebugInfo(error);
        
        // Clear the progress interval if it exists
        if (progressInterval) {
          clearInterval(progressInterval);
          setProgressInterval(null);
        }
        
        toast({
          variant: "destructive",
          title: "Blueprint Generation Failed",
          description: "There was an error generating your blueprint. Please check the error details."
        });
      }
    };

    // Start the generation process automatically
    generateBlueprint();
    
    // Clean up interval on unmount
    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [formData, onComplete, toast, retryCount, progressInterval]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Function to render queue position message
  const getQueueMessage = () => {
    if (queueInfo.position === 0 && queueInfo.length === 0) return "";
    if (queueInfo.length > 0) {
      const waitTime = Math.ceil(queueInfo.estimatedTimeSeconds / 60);
      return `${queueInfo.length} ${queueInfo.length === 1 ? 'person' : 'people'} ahead of you (est. wait: ~${waitTime} ${waitTime === 1 ? 'minute' : 'minutes'})`;
    }
    return "Waiting in queue...";
  };

  // Function to handle API-specific errors
  const renderApiErrorMessage = () => {
    if (!errorMessage) return null;
    
    if (errorMessage.toLowerCase().includes("model incompatible request argument")) {
      return (
        <div className="w-full mt-2 p-4 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex gap-2 items-start">
            <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-sm text-amber-800">API Configuration Error</h4>
              <p className="text-xs text-amber-700 mt-1">
                There was an issue with our AI service configuration. 
                This is a temporary technical error. Please try again or contact support if the issue persists.
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    if (errorMessage.toLowerCase().includes("rate limit")) {
      return (
        <div className="w-full mt-2 p-4 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex gap-2 items-start">
            <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-sm text-amber-800">High Demand</h4>
              <p className="text-xs text-amber-700 mt-1">
                We're experiencing unusually high demand right now. 
                Please wait a moment and try again in a few minutes.
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    if (errorMessage.toLowerCase().includes("response format") && errorMessage.toLowerCase().includes("not supported")) {
      return (
        <div className="w-full mt-2 p-4 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex gap-2 items-start">
            <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-sm text-amber-800">API Configuration Error</h4>
              <p className="text-xs text-amber-700 mt-1">
                There was an issue with our AI service configuration.
                We're working on fixing this issue. Please try again shortly.
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Collecting data</span>
            <span>Processing</span>
            <span>Research</span>
            <span>Saving</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center pt-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {progress < 25 && "Connecting to AI..."}
                {progress >= 25 && progress < 50 && "Generating comprehensive blueprint..."}
                {progress >= 50 && progress < 75 && "Analyzing astrological and numerological data..."}
                {progress >= 75 && "Saving your blueprint..."}
              </p>
              {getQueueMessage() && (
                <p className="text-xs text-amber-600">{getQueueMessage()}</p>
              )}
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-center">
                <p className="font-medium">Blueprint Generated!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your soul blueprint is ready to explore.
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-full bg-red-100 p-3">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="text-center">
                <p className="font-medium">Oops! Something went wrong</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {errorMessage || "Failed to generate your blueprint. Please try again."}
                </p>
              </div>
              
              {/* Display API-specific error information */}
              {renderApiErrorMessage()}
              
              {/* Display technical details for debugging */}
              {debugInfo && (
                <div className="w-full mt-4">
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground">
                      Technical Error Details
                    </summary>
                    <pre className="mt-2 p-2 bg-black/10 rounded overflow-auto max-h-[200px] text-red-600">
                      {typeof debugInfo === 'object' ? JSON.stringify(debugInfo, null, 2) : debugInfo}
                    </pre>
                  </details>
                </div>
              )}
              
              <Button onClick={handleRetry}>
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
