
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, XCircle, Info } from "lucide-react";
import { pythonBlueprintService } from '@/services/python-blueprint-service';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { BlueprintRawDataViewer } from "@/components/ui/blueprint-raw-data-viewer";

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
  const [errorType, setErrorType] = useState<'connection' | 'api' | 'quota' | 'parse' | 'unknown'>('unknown');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const apiCallMadeRef = useRef(false); // Use ref to track API call across renders
  const { toast } = useToast();

  // Function to determine error type from the error message
  const determineErrorType = useCallback((error: Error | string): 'connection' | 'api' | 'quota' | 'parse' | 'unknown' => {
    const errorStr = typeof error === 'string' ? error : error.message || '';
    
    if (errorStr.toLowerCase().includes('failed to send a request') || 
        errorStr.toLowerCase().includes('network') ||
        errorStr.toLowerCase().includes('fetch') ||
        errorStr.toLowerCase().includes('cors')) {
      return 'connection';
    }
    
    if (errorStr.toLowerCase().includes('quota') || 
        errorStr.toLowerCase().includes('exceeded') || 
        errorStr.toLowerCase().includes('billing') ||
        errorStr.toLowerCase().includes('insufficient_quota')) {
      return 'quota';
    }
    
    if (errorStr.toLowerCase().includes('json') || 
        errorStr.toLowerCase().includes('parse')) {
      return 'parse';
    }
    
    if (errorStr.toLowerCase().includes('api') || 
        errorStr.toLowerCase().includes('openai')) {
      return 'api';
    }
    
    return 'unknown';
  }, []);

  // Generate blueprint function - STRICTLY ONE ATTEMPT with Python engine only
  const generateBlueprint = useCallback(async () => {
    // Add protective guard to ENSURE a single API call
    // Check both state and ref for added security
    console.log('[GENERATOR] Checking if API call was already made:', apiCallMadeRef.current);
    if (apiCallMadeRef.current === true) {
      console.log('[GENERATOR] API call was ALREADY MADE. STRICTLY preventing another request.');
      return;
    }

    try {
      console.log('[GENERATOR] Starting blueprint generation with Python Engine ONLY');
      
      // Immediately mark that we've attempted the API call to prevent additional calls
      apiCallMadeRef.current = true;
      
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

      // Simple progress animation
      setProgress(25);
      console.log('[GENERATOR] Making SINGLE API call to Python Engine with data:', userData);
      console.log('[GENERATOR] Birth date components:', formData.birthDate.split('-').join(', '));

      // Use the Python blueprint service
      setProgress(35);
      const result = await pythonBlueprintService.generateBlueprint(userData);
      
      console.log('[GENERATOR] Python Blueprint generation result status:', result.success);
      
      // Store raw response for debugging
      if (result.rawResponse) {
        setDebugInfo(result.rawResponse);
        console.log('[GENERATOR] Raw Response:', JSON.stringify(result.rawResponse, null, 2));
      }
      
      // If there's an error in the result
      if (!result.success) {
        throw new Error(result.error || "Python engine failed to generate blueprint");
      }

      const blueprint = result.blueprint;
      if (!blueprint) {
        throw new Error("No blueprint data returned from Python service");
      }
      
      // Log calculation results for validation
      console.log('[GENERATOR] Blueprint received from Python engine with key calculations:');
      
      if (blueprint.values_life_path && blueprint.values_life_path.life_path_number) {
        console.log('[GENERATOR] Life Path Number:', blueprint.values_life_path.life_path_number);
      } else {
        console.log('[GENERATOR] WARNING: No life path number in blueprint!');
      }
      
      if (blueprint.energy_strategy_human_design && blueprint.energy_strategy_human_design.type) {
        console.log('[GENERATOR] Human Design Type:', blueprint.energy_strategy_human_design.type);
      } else {
        console.log('[GENERATOR] WARNING: No Human Design type in blueprint!');
      }
      
      setProgress(75);

      // Save the blueprint to the database (We'll implement this part later)
      console.log('[GENERATOR] Blueprint successfully generated! Would save to database here.');
      setProgress(90);

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
      console.error('[GENERATOR] Error generating blueprint:', error);
      setStatus('error');
      
      const errorMsg = error instanceof Error ? error.message : 'An unknown error occurred';
      setErrorMessage(errorMsg);
      
      // Determine error type for better UI messaging
      const type = determineErrorType(error);
      setErrorType(type);
      
      setDebugInfo(error);
      
      toast({
        variant: "destructive",
        title: "Blueprint Generation Failed",
        description: getErrorToastMessage(type),
      });

      // Call the onComplete callback after a delay even on error
      if (onComplete) {
        setTimeout(onComplete, 5000);
      }
    }
  }, [formData, onComplete, toast, determineErrorType]);

  // Get error message based on error type
  const getErrorToastMessage = (type: 'connection' | 'api' | 'quota' | 'parse' | 'unknown'): string => {
    switch (type) {
      case 'connection':
        return "Connection issue with Python engine. Please check Edge Function logs.";
      case 'api':
        return "Python API configuration issue. Check Edge Function settings.";
      case 'quota':
        return "Service temporarily unavailable due to high demand.";
      case 'parse':
        return "Error processing the Python engine response. Check logs for details.";
      case 'unknown':
      default:
        return "An unexpected error occurred in the Python blueprint engine.";
    }
  };

  // Run generate blueprint on mount - SINGLE ATTEMPT ONLY
  useEffect(() => {
    console.log('[GENERATOR] Initial mount, checking if API call was made:', apiCallMadeRef.current);
    if (apiCallMadeRef.current === false) {
      console.log('[GENERATOR] No API call made yet, proceeding with SINGLE attempt');
      generateBlueprint();
    } else {
      console.log('[GENERATOR] API call was already attempted, not calling again');
    }
    
    // Clean up function
    return () => {
      console.log('[GENERATOR] Component unmounting');
    };
  }, [generateBlueprint]);

  // Function to get error display content based on error type
  const getErrorDisplay = () => {
    switch (errorType) {
      case 'connection':
        return (
          <Alert variant="destructive" className="mt-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Python Engine Connection Error</AlertTitle>
            <AlertDescription>
              We're having trouble connecting to our Python blueprint engine.
              Please check the Edge Function logs and status.
            </AlertDescription>
          </Alert>
        );
      
      case 'parse':
        return (
          <Alert className="mt-4 border-amber-200 bg-amber-50">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Python Response Error</AlertTitle>
            <AlertDescription className="text-amber-700">
              There was an error processing the Python engine's response.
              Check the detailed logs below for more information.
            </AlertDescription>
          </Alert>
        );
      
      case 'unknown':
      default:
        return (
          <Alert variant="destructive" className="mt-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Python Engine Error</AlertTitle>
            <AlertDescription>
              {errorMessage || "An unknown error occurred in the Python blueprint engine."}
            </AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Initializing</span>
            <span>Python Engine</span>
            <span>Calculating</span>
            <span>Complete</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center pt-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {progress < 25 && "Connecting to Python blueprint engine..."}
                {progress >= 25 && progress < 50 && "Python engine processing birth data..."}
                {progress >= 50 && progress < 75 && "Calculating numerology and Human Design..."}
                {progress >= 75 && "Finalizing blueprint data..."}
              </p>
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
                  Your soul blueprint has been created successfully with our Python engine.
                </p>
              </div>
              
              {/* Always show the raw data in success state for validation */}
              {debugInfo && (
                <div className="w-full mt-4">
                  <h3 className="text-sm font-medium mb-2">Blueprint Data for Validation</h3>
                  <BlueprintRawDataViewer 
                    rawData={debugInfo} 
                    className="w-full"
                  />
                </div>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-full bg-red-100 p-3">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="text-center">
                <p className="font-medium">Python Engine Error</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {getErrorToastMessage(errorType)}
                </p>
              </div>
              
              {/* Display error content based on error type */}
              {getErrorDisplay()}
              
              {/* Display technical details for debugging */}
              {debugInfo && (
                <div className="w-full mt-4">
                  <h3 className="text-sm font-medium mb-2">Detailed Error Information</h3>
                  <BlueprintRawDataViewer 
                    rawData={debugInfo} 
                    className="w-full"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
