
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import blueprintService from '@/services/blueprint-service';
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
  const { toast } = useToast();

  useEffect(() => {
    const generateBlueprint = async () => {
      try {
        setStatus('loading');
        setProgress(10);

        // Artificial delay for UX
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress(25);

        // Format the user data for the blueprint service
        const userData = {
          full_name: formData.name,
          birth_date: formData.birthDate,
          birth_time_local: formData.birthTime || undefined,
          birth_location: formData.birthLocation || undefined,
          mbti: formData.personality || undefined,
        };

        await new Promise(resolve => setTimeout(resolve, 1000));
        setProgress(50);

        // Generate the blueprint
        const blueprint = await blueprintService.generateBlueprintFromBirthData(userData);

        setProgress(75);
        await new Promise(resolve => setTimeout(resolve, 700));

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
        
        toast({
          variant: "destructive",
          title: "Blueprint Generation Failed",
          description: "There was an error generating your blueprint. Please try again."
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
            <span>Generating</span>
            <span>Saving</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center pt-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {progress < 25 && "Connecting to cosmic databases..."}
                {progress >= 25 && progress < 50 && "Calculating celestial positions..."}
                {progress >= 50 && progress < 75 && "Generating insights..."}
                {progress >= 75 && "Finalizing your blueprint..."}
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
