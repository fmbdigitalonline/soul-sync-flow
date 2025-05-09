import React, { useState, useEffect } from "react";
import { motion } from "@/lib/framer-motion";
import { SoulOrb } from "./soul-orb";
import { cn } from "@/lib/utils";
import { blueprintService, defaultBlueprintData } from "@/services/blueprint-service";
import { useToast } from "@/hooks/use-toast";

interface BlueprintGeneratorProps {
  onComplete: (blueprint: any, rawResponse?: any) => void;
  formData?: any;
  className?: string;
}

const BlueprintGenerator: React.FC<BlueprintGeneratorProps> = ({ 
  onComplete, 
  formData,
  className 
}) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'preparing' | 'assembling' | 'finalizing' | 'complete'>('preparing');
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, speed: number}>>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Preparing Soul Blueprint...');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Generate random particles
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 5 + 2,
      speed: Math.random() * 2 + 1
    }));
    setParticles(newParticles);
  }, []);

  // Handle the completion and blueprint generation using the research-based service
  const handleCompletion = async () => {
    if (isSaving || isCompleted) return; // Prevent multiple executions
    
    setIsSaving(true);
    console.log("Starting the research-based blueprint generation process...");
    
    try {
      // Create user profile from form data
      const userProfile = {
        full_name: formData?.name || "Anonymous User",
        preferred_name: formData?.name?.split(' ')[0] || "User",
        birth_date: formData?.birthDate || "",
        birth_time_local: formData?.birthTime || "",
        birth_location: formData?.birthLocation || "",
        timezone: "auto" // Auto-detect timezone if not provided
      };
      
      // Log the data being sent to the research-based generator
      console.log("Sending data to research-based generator:", userProfile);
      
      // Always enable debug mode to get raw responses
      const { data: generatedBlueprint, error: generationError, rawResponse } = 
        await blueprintService.generateBlueprintFromBirthData(userProfile, true);
      
      if (generationError) {
        console.error("Blueprint generation error:", generationError);
        setError(generationError);
        toast({
          title: "Generation Error",
          description: "There was an error generating your blueprint. Using default data instead.",
          variant: "destructive"
        });
        
        // Fall back to default blueprint data if generation fails
        await saveFallbackBlueprint(userProfile);
        return;
      }
      
      if (!generatedBlueprint) {
        console.error("No blueprint data received");
        setError("No blueprint data was generated");
        toast({
          title: "Generation Warning",
          description: "Could not generate a complete blueprint. Using default data instead.",
          variant: "destructive"
        });
        
        // Fall back to default blueprint data
        await saveFallbackBlueprint(userProfile);
        return;
      }
      
      console.log("Research-based blueprint generated successfully");
      
      // Add MBTI type from form data if provided and blueprint doesn't have it
      if (formData?.personality && (!generatedBlueprint.cognition_mbti.type || generatedBlueprint.cognition_mbti.type === "")) {
        generatedBlueprint.cognition_mbti.type = formData.personality;
      }
      
      // Store raw response in blueprint metadata
      if (rawResponse && !generatedBlueprint._meta.raw_response) {
        generatedBlueprint._meta.raw_response = 
          typeof rawResponse === 'string' ? rawResponse : JSON.stringify(rawResponse);
      }
      
      console.log("Blueprint saved successfully, proceeding with completion");
      setIsCompleted(true);
      
      // Use a short timeout to ensure UI is updated before redirecting
      setTimeout(() => {
        onComplete(generatedBlueprint, rawResponse);
      }, 1000);
      
    } catch (error: any) {
      console.error("Unexpected error during blueprint generation:", error);
      toast({
        title: "Error",
        description: "Something went wrong during blueprint generation",
        variant: "destructive"
      });
      
      // Try to fall back to default data
      await saveFallbackBlueprint();
    } finally {
      setIsSaving(false);
    }
  };
  
  // Helper function to save a fallback blueprint when research generation fails
  const saveFallbackBlueprint = async (userProfile?: any) => {
    try {
      console.log("Falling back to default blueprint data");
      
      // Create blueprint data from form inputs or use default
      const blueprintData = {
        ...defaultBlueprintData,
        user_meta: {
          ...defaultBlueprintData.user_meta,
          full_name: userProfile?.full_name || formData?.name || defaultBlueprintData.user_meta.full_name,
          preferred_name: userProfile?.preferred_name || formData?.name?.split(' ')[0] || defaultBlueprintData.user_meta.preferred_name,
          birth_date: userProfile?.birth_date || formData?.birthDate || defaultBlueprintData.user_meta.birth_date,
          birth_time_local: userProfile?.birth_time_local || formData?.birthTime || defaultBlueprintData.user_meta.birth_time_local,
          birth_location: userProfile?.birth_location || formData?.birthLocation || defaultBlueprintData.user_meta.birth_location,
        },
        cognition_mbti: {
          ...defaultBlueprintData.cognition_mbti,
          type: formData?.personality || defaultBlueprintData.cognition_mbti.type,
        }
      };
      
      setIsCompleted(true);
      
      // Use a short timeout to ensure UI is updated before redirecting
      setTimeout(() => {
        onComplete(blueprintData);
      }, 1000);
    } catch (fallbackError) {
      console.error("Error saving fallback blueprint:", fallbackError);
    }
  };

  // Animation progress with research-based timing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (progress < 100 && !isCompleted && !isSaving) {
      interval = setInterval(() => {
        setProgress(prev => {
          // Adjust speed based on stage to account for API call time
          let increment = 0.5; // Default slow progression
          
          if (stage === 'preparing') {
            increment = 0.8; // Faster at the beginning
          } else if (stage === 'assembling') {
            increment = 0.3; // Slower during "research" phase (when API is likely being called)
          } else if (stage === 'finalizing') {
            increment = 1.0; // Faster at the end
          }
          
          const newProgress = Math.min(prev + increment, 100);
          
          // Update stages based on progress
          if (newProgress > 15 && stage === 'preparing') {
            setStage('assembling');
            setStatusMessage('Researching Cosmic Patterns...');
          } else if (newProgress > 60 && stage === 'assembling') {
            setStage('finalizing');
            setStatusMessage('Generating Soul Blueprint Insights...');
          } else if (newProgress >= 98 && stage === 'finalizing') {
            setStage('complete');
            setStatusMessage('Soul Blueprint Complete!');
            // Call the completion handler when reaching 100%
            handleCompletion();
          }
          
          return newProgress;
        });
      }, 400); // Slightly slower intervals for research-based approach
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [progress, stage, isCompleted, isSaving]);

  return (
    <div className={cn("relative w-full h-64 overflow-hidden rounded-xl", className)}>
      {/* Cosmic background with stars */}
      <div className="absolute inset-0 bg-soul-black">
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute bg-white rounded-full opacity-70"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: particle.speed,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      {/* Center orb */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ scale: 1 }}
          animate={{ 
            scale: stage === 'complete' ? [1, 1.5, 1] : 1,
            rotate: progress * 5
          }}
          transition={{ duration: 2 }}
        >
          <SoulOrb 
            size="lg" 
            stage={stage === 'preparing' ? 'welcome' : 
                  stage === 'assembling' ? 'collecting' :
                  stage === 'finalizing' ? 'generating' : 'complete'}
            pulse={true}
            speaking={false}
          />
        </motion.div>
      </div>
      
      {/* Energy streams flowing toward the orb */}
      <div className="absolute inset-0">
        {progress < 100 && Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-16 bg-gradient-to-c from-soul-purple to-transparent"
            style={{
              left: '50%',
              top: '50%',
              transformOrigin: 'center',
              rotate: `${i * 45}deg`,
              translateX: '-50%',
              translateY: '-50%'
            }}
            animate={{
              height: [30, 100, 30],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2
            }}
          />
        ))}
      </div>
      
      {/* Research glow pulses - specific to research-based approach */}
      <div className="absolute inset-0">
        {progress < 100 && progress > 20 && stage !== 'complete' && Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={`research-${i}`}
            className="absolute rounded-full bg-soul-purple/20"
            style={{
              width: 100,
              height: 100,
              left: '50%',
              top: '50%',
              translateX: '-50%',
              translateY: '-50%',
            }}
            animate={{
              scale: [1, 3, 1],
              opacity: [0.2, 0, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1
            }}
          />
        ))}
      </div>
      
      {/* Error message if there is one */}
      {error && (
        <div className="absolute top-4 left-0 right-0 mx-auto text-center">
          <div className="inline-block bg-red-500/80 text-white text-xs px-2 py-1 rounded">
            {error.length > 50 ? error.substring(0, 50) + '...' : error}
          </div>
        </div>
      )}
      
      {/* Status text */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-white">
        <p className="font-medium text-lg">
          {statusMessage}
        </p>
        
        {/* Progress bar */}
        <div className="mt-2 mx-auto w-64 h-1 bg-white bg-opacity-20 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-soul-purple"
            style={{ width: `${progress}%` }}
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
};

export { BlueprintGenerator };
