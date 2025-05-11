import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, XCircle, Info } from "lucide-react";
import blueprintService from '@/services/blueprint-service';
import { pythonBlueprintService } from '@/services/python-blueprint-service';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { BlueprintRawDataViewer } from "@/components/ui/blueprint-raw-data-viewer";
import { supabase } from "@/integrations/supabase/client";

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

  // Generate blueprint function - STRICTLY ONE ATTEMPT
  const generateBlueprint = useCallback(async () => {
    // Add protective guard to ENSURE a single API call
    // Check both state and ref for added security
    console.log('[GENERATOR] Checking if API call was already made:', apiCallMadeRef.current);
    if (apiCallMadeRef.current === true) {
      console.log('[GENERATOR] API call was ALREADY MADE. STRICTLY preventing another request.');
      return;
    }

    try {
      console.log('[GENERATOR] Starting blueprint generation - FIRST AND ONLY ATTEMPT');
      
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
      console.log('[GENERATOR] Making SINGLE API call with data:', userData);

      // Try to use the Python blueprint service first
      try {
        setProgress(35);
        const result = await pythonBlueprintService.generateBlueprint(userData);
        console.log('[GENERATOR] Python Blueprint generation result:', result);
        
        // Store raw response for debugging
        if (result.rawResponse) {
          setDebugInfo(result.rawResponse);
        }
        
        // If there's an error in the result, we'll try the research blueprint generator
        if (!result.success) {
          setProgress(40);
          throw new Error(result.error || "Python engine failed, trying standard engine");
        }

        const blueprint = result.blueprint;
        if (!blueprint) {
          throw new Error("No blueprint data returned from Python service");
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
        
        return; // Early return if Python engine succeeded
      } catch (pythonError) {
        console.warn('[GENERATOR] Python engine failed, falling back to standard engine:', pythonError);
        // Continue to fallback method below
      }
      
      // Try the direct fallback to the research blueprint generator
      try {
        console.log('[GENERATOR] Trying research blueprint generator directly');
        setProgress(50);
        
        // Format the data for the research blueprint generator
        const directResult = await supabase.functions.invoke("research-blueprint-generator", {
          body: {
            birthData: {
              name: formData.name,
              date: formData.birthDate,
              time: formData.birthTime || "00:00",
              location: formData.birthLocation || "",
              timezone: "local", // Default to local timezone
            },
            debugMode: true
          }
        });
        
        if (directResult.error) {
          throw new Error(`Research blueprint generator error: ${directResult.error.message}`);
        }
        
        if (!directResult.data) {
          throw new Error("No data returned from research blueprint generator");
        }
        
        // Store raw response for debugging
        setDebugInfo(directResult.data);
        
        // Transform the research data to our blueprint format
        const blueprint = {
          user_meta: {
            full_name: formData.name,
            preferred_name: formData.name.split(' ')[0],
            birth_date: formData.birthDate,
            birth_time_local: formData.birthTime,
            birth_location: formData.birthLocation
          },
          // Copy the rest from the research generator response
          ...directResult.data.data,
          raw_content: directResult.data.data._meta?.raw_response || "",
          needs_parsing: true,
          _meta: {
            generation_method: "research-direct",
            generation_date: new Date().toISOString(),
            model_version: "2.0",
            birth_data: {},
            schema_version: "2.0",
            raw_response: directResult.data,
            error: null
          }
        };
        
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
          description: "Your soul blueprint has been created successfully using our research engine!",
        });
        
        // Call the onComplete callback after a delay
        if (onComplete) {
          setTimeout(onComplete, 2000);
        }
        
        return; // Early return if direct research engine succeeded
      } catch (directError) {
        console.warn('[GENERATOR] Direct research engine failed, falling back to standard engine:', directError);
        // Continue to standard blueprint service as final fallback
      }
      
      // Fallback to standard blueprint service as last resort
      console.log('[GENERATOR] Trying standard blueprint service as final fallback');
      setProgress(60);
      const fallbackResult = await blueprintService.generateBlueprintFromBirthData(userData);
      
      if (fallbackResult.rawResponse) {
        setDebugInfo(fallbackResult.rawResponse);
      }
      
      if (!fallbackResult.success) {
        throw new Error(fallbackResult.error || "All engines failed to generate blueprint");
      }

      const blueprint = fallbackResult.blueprint;
      if (!blueprint) {
        throw new Error("No blueprint data returned from any service");
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
        return "Connection issue. Please try again or check with support.";
      case 'api':
        return "API configuration issue. Our team has been notified.";
      case 'quota':
        return "Service temporarily unavailable due to high demand.";
      case 'parse':
        return "Error processing the data. Our team has been notified.";
      case 'unknown':
      default:
        return "An unexpected error occurred. Please try again later.";
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
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              We're having trouble connecting to our AI service.
              Please check your internet connection.
            </AlertDescription>
          </Alert>
        );
      
      case 'quota':
        return (
          <Alert className="mt-4 border-amber-200 bg-amber-50">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Service Busy</AlertTitle>
            <AlertDescription className="text-amber-700">
              Our AI service is experiencing high demand right now. 
              Please try again later or contact support.
            </AlertDescription>
          </Alert>
        );
      
      case 'api':
        return (
          <Alert className="mt-4 border-amber-200 bg-amber-50">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">API Configuration Issue</AlertTitle>
            <AlertDescription className="text-amber-700">
              There's a temporary issue with our AI service configuration.
              Please try again later.
            </AlertDescription>
          </Alert>
        );
      
      case 'parse':
        return (
          <Alert className="mt-4 border-amber-200 bg-amber-50">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Processing Error</AlertTitle>
            <AlertDescription className="text-amber-700">
              There was an error processing the AI's response.
              Please try again later.
            </AlertDescription>
          </Alert>
        );
      
      case 'unknown':
      default:
        return (
          <Alert variant="destructive" className="mt-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Unexpected Error</AlertTitle>
            <AlertDescription>
              {errorMessage || "An unknown error occurred. Please try again later."}
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
                {progress >= 25 && progress < 40 && "Trying Python blueprint engine..."}
                {progress >= 40 && progress < 60 && "Trying research blueprint generator..."}
                {progress >= 60 && progress < 75 && "Falling back to standard engine..."}
                {progress >= 75 && "Saving your blueprint..."}
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
                <p className="font-medium">Problem Generating Blueprint</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {getErrorToastMessage(errorType)}
                </p>
              </div>
              
              {/* Display error content based on error type */}
              {getErrorDisplay()}
              
              {/* Display technical details for debugging */}
              {debugInfo && (
                <BlueprintRawDataViewer 
                  rawData={debugInfo} 
                  className="w-full mt-4"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
