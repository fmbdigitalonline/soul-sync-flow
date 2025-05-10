
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
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
  const [toolCalls, setToolCalls] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const generateBlueprint = async () => {
      try {
        setStatus('loading');
        setProgress(10);

        // Format the user data for the blueprint service
        const userData = {
          full_name: formData.name,
          birth_date: formData.birthDate,
          birth_time_local: formData.birthTime || undefined,
          birth_location: formData.birthLocation || undefined,
          mbti: formData.personality || undefined,
        };

        setProgress(25);

        // Generate the blueprint
        const result = await blueprintService.generateBlueprintFromBirthData(userData);
        
        // Store raw response for debugging
        if (result.rawResponse) {
          setDebugInfo(result.rawResponse);
          
          // Extract tool calls if available
          if (result.rawResponse.choices?.[0]?.message?.tool_calls) {
            setToolCalls(result.rawResponse.choices[0].message.tool_calls);
          }
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
          description: "Your soul blueprint has been created successfully with GPT-4o Search Preview!",
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
        
        toast({
          variant: "destructive",
          title: "Blueprint Generation Failed",
          description: "There was an error generating your blueprint. Please check the error details."
        });
      }
    };

    // Start the generation process automatically
    generateBlueprint();
  }, [formData, onComplete, toast]);

  return (
    <div className={className}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Collecting data</span>
            <span>Processing</span>
            <span>Web search</span>
            <span>Saving</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center pt-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {progress < 25 && "Connecting to OpenAI..."}
                {progress >= 25 && progress < 50 && "Generating blueprint with GPT-4o Search Preview..."}
                {progress >= 50 && progress < 75 && "Processing search results and AI response..."}
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
                <p className="font-medium">Oops! Something went wrong</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {errorMessage || "Failed to generate your blueprint. Please try again."}
                </p>
              </div>
              
              {/* Display web search calls if available */}
              {toolCalls && toolCalls.length > 0 && (
                <div className="w-full mt-4">
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground">
                      Show Web Search Queries ({toolCalls.length})
                    </summary>
                    <div className="mt-2 p-2 bg-black/10 rounded overflow-auto max-h-[200px]">
                      {toolCalls.map((call, index) => (
                        <div key={index} className="mb-2 p-1 border-b border-gray-200">
                          <p className="font-semibold">Search #{index + 1}:</p>
                          <p className="text-xs text-green-700">
                            {call.function?.arguments ? 
                              JSON.parse(call.function.arguments).query || "No query found" 
                              : "No search data"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
              
              {/* Display technical details for debugging */}
              {debugInfo && (
                <div className="w-full mt-4">
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground">
                      Show Technical Details
                    </summary>
                    <pre className="mt-2 p-2 bg-black/10 rounded overflow-auto max-h-[200px] text-red-600">
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
              
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
