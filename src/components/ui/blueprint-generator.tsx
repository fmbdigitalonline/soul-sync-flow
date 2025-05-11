
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, XCircle, Info } from "lucide-react";
import blueprintService, { BlueprintData } from '@/services/blueprint-service';
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
  const [apiCallMade, setApiCallMade] = useState(false); // Track if API call has been made
  const { toast } = useToast();

  // Function to determine error type from the error message
  const determineErrorType = useCallback((error: Error | string): 'connection' | 'api' | 'quota' | 'parse' | 'unknown' => {
    const errorStr = typeof error === 'string' ? error : error.message || '';
    
    if (errorStr.toLowerCase().includes('failed to send a request') || 
        errorStr.toLowerCase().includes('network') ||
        errorStr.toLowerCase().includes('fetch')) {
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
    // If an API call has already been made, do not proceed
    if (apiCallMade) {
      console.log("API call was already made. Not making another request.");
      return;
    }

    try {
      setStatus('loading');
      setProgress(10);
      setErrorMessage('');
      setDebugInfo(null);
      setApiCallMade(true); // Mark that we've made the API call

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
      console.log('Generating blueprint with data:', userData);

      // Generate the blueprint - SINGLE ATTEMPT, NO RETRY
      const result = await blueprintService.generateBlueprintFromBirthData(userData);
      
      console.log('Blueprint generation result:', result);
      
      // Store raw response for debugging
      if (result.rawResponse) {
        setDebugInfo(result.rawResponse);
      }
      
      // If there's an error in the result, handle it
      if (!result.success) {
        throw new Error(result.error || "Unknown error");
      }

      const blueprint = result.blueprint;
      if (!blueprint) {
        throw new Error("No blueprint data returned from service");
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
  }, [formData, onComplete, toast, determineErrorType, apiCallMade]);

  // Get error message based on error type
  const getErrorToastMessage = (type: 'connection' | 'api' | 'quota' | 'parse' | 'unknown'): string => {
    switch (type) {
      case 'connection':
        return "Connection issue. Please check your internet connection and try again.";
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
    if (!apiCallMade) {
      generateBlueprint();
    }
    
    // Clean up function
    return () => {
      // Anything that needs cleanup
    };
  }, [generateBlueprint, apiCallMade]);

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
                {progress >= 25 && progress < 50 && "Generating comprehensive blueprint..."}
                {progress >= 50 && progress < 75 && "Analyzing astrological and numerological data..."}
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
