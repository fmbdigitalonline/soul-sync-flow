
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { UserMetaData, calculateBlueprint, saveBlueprintToDatabase, BlueprintData } from '@/services/blueprint-service';
import { useToast } from '@/hooks/use-toast';

export interface BlueprintGeneratorProps {
  formData?: {
    name?: string;
    birthDate?: string;
    birthTime?: string;
    birthLocation?: string;
    personality?: string;
  };
  onComplete?: (blueprint: BlueprintData, rawResponse?: any) => void;
  className?: string;
}

export const BlueprintGenerator: React.FC<BlueprintGeneratorProps> = ({ 
  formData, 
  onComplete,
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Preparing your data...');
  const { toast } = useToast();
  
  useEffect(() => {
    // Auto-start generation if form data is provided
    if (formData && Object.keys(formData).length > 0) {
      generateBlueprint();
    }
  }, [formData]);
  
  // Create a fake progress indicator since we can't track actual API progress
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isGenerating && progress < 95) {
      interval = setInterval(() => {
        setProgress(prevProgress => {
          const increment = Math.random() * 2 + 0.5; // Random increment between 0.5 and 2.5
          const newProgress = prevProgress + increment;
          
          // Update status messages based on progress
          if (newProgress > 15 && newProgress < 30) {
            setStatus('Calculating celestial positions...');
          } else if (newProgress > 30 && newProgress < 50) {
            setStatus('Analyzing Human Design gates...');
          } else if (newProgress > 50 && newProgress < 70) {
            setStatus('Determining numerology alignments...');
          } else if (newProgress > 70 && newProgress < 90) {
            setStatus('Compiling your complete blueprint...');
          }
          
          return Math.min(newProgress, 95);
        });
      }, 800);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating, progress]);
  
  const generateBlueprint = async () => {
    if (!formData || !formData.name || !formData.birthDate) {
      toast({
        title: "Missing information",
        description: "Please provide at least your name and birth date",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsGenerating(true);
      setProgress(0);
      setStatus('Preparing your data...');
      
      // Format user metadata from form data
      const userMetaData: UserMetaData = {
        preferred_name: formData.name,
        full_name: formData.name,
        birth_date: formData.birthDate,
        birth_time_local: formData.birthTime || '',
        birth_location: formData.birthLocation || '',
      };
      
      // First progress update
      setProgress(10);
      setStatus('Contacting astrological databases...');
      
      // Calculate the blueprint
      const blueprint = await calculateBlueprint(userMetaData);
      
      // Almost done progress update
      setProgress(95);
      setStatus('Finalizing your Soul Blueprint...');
      
      // Extract raw response if available
      let rawResponse = null;
      if (blueprint._meta && blueprint._meta.raw_response) {
        try {
          rawResponse = typeof blueprint._meta.raw_response === 'string' ?
            JSON.parse(blueprint._meta.raw_response) : blueprint._meta.raw_response;
        } catch (e) {
          console.error("Error parsing raw response:", e);
          rawResponse = blueprint._meta.raw_response;
        }
      }
      
      // Save the blueprint to database
      await saveBlueprintToDatabase(blueprint);
      
      // Complete progress
      setProgress(100);
      setStatus('Blueprint generated successfully!');
      
      // Notify completion
      toast({
        title: "Blueprint Generated",
        description: "Your Soul Blueprint has been successfully created!",
      });
      
      // Call the completion callback if provided
      if (onComplete) {
        onComplete(blueprint, rawResponse);
      }
    } catch (error) {
      console.error("Error generating blueprint:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="w-full mb-6">
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-soul-purple transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-center mt-2">{status}</p>
      </div>
      
      {!formData && (
        <Button 
          className="bg-soul-purple hover:bg-soul-purple/90 min-w-[200px]"
          disabled={isGenerating}
          onClick={generateBlueprint}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate My Soul Blueprint'
          )}
        </Button>
      )}
    </div>
  );
};
