
import React, { useState, useEffect } from "react";
import { motion } from "@/lib/framer-motion";
import { SoulOrb } from "./soul-orb";
import { cn } from "@/lib/utils";
import { blueprintService } from "@/services/blueprint-service";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

interface BlueprintGeneratorProps {
  onComplete: () => void;
  formData?: any;
  className?: string;
}

const BlueprintGenerator: React.FC<BlueprintGeneratorProps> = ({ 
  onComplete, 
  formData,
  className 
}) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'preparing' | 'assembling' | 'finalizing' | 'complete' | 'error'>('preparing');
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, speed: number}>>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
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

  // Handle the completion and blueprint saving
  const handleCompletion = async () => {
    if (isSaving || isCompleted) return; // Prevent multiple executions
    
    setIsSaving(true);
    console.log("Saving blueprint data to database...");
    
    try {
      if (!formData) {
        toast({
          title: "Error",
          description: "No form data provided for blueprint generation",
          variant: "destructive"
        });
        setStage('error');
        setErrorDetails("Missing user data");
        return;
      }
      
      // Prepare user meta data from form inputs
      const userMetaData = {
        full_name: formData?.name || "User",
        preferred_name: formData?.name?.split(' ')[0] || "User",
        birth_date: formData?.birthDate || "",
        birth_time_local: formData?.birthTime || "",
        birth_location: formData?.birthLocation || "",
        timezone: formData?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      
      console.log("Generating blueprint with user data:", userMetaData);
      
      // Generate blueprint using the blueprint service
      const { data: generatedBlueprint, error } = await blueprintService.generateBlueprintFromBirthData(userMetaData);
      
      if (error) {
        console.error("Error generating blueprint:", error);
        toast({
          title: "Generation Error",
          description: error,
          variant: "destructive"
        });
        setStage('error');
        setErrorDetails(error);
        return;
      }
      
      if (!generatedBlueprint) {
        console.error("No blueprint generated");
        toast({
          title: "Error",
          description: "Blueprint generation failed to produce data",
          variant: "destructive"
        });
        setStage('error');
        setErrorDetails("No blueprint data generated");
        return;
      }
      
      console.log("Blueprint generated successfully, saving to database");
      
      // Add personality type from form data 
      const finalBlueprint = {
        ...generatedBlueprint,
        cognition_mbti: {
          ...generatedBlueprint.cognition_mbti,
          type: formData?.personality || generatedBlueprint.cognition_mbti.type
        }
      };
      
      // Save blueprint to database
      const result = await blueprintService.saveBlueprintData(finalBlueprint);
      
      if (!result.success) {
        console.error("Error saving blueprint:", result.error);
        toast({
          title: "Error",
          description: "Generated blueprint successfully but failed to save it.",
          variant: "destructive"
        });
        setStage('error');
        setErrorDetails(result.error || "Failed to save blueprint");
        return;
      }
      
      console.log("Blueprint saved successfully, proceeding with completion");
      setIsCompleted(true);
      
      // Use a short timeout to ensure UI is updated before redirecting
      setTimeout(() => {
        onComplete();
      }, 1000);
      
    } catch (error) {
      console.error("Error during blueprint generation:", error);
      toast({
        title: "Error",
        description: "Something went wrong during blueprint generation",
        variant: "destructive"
      });
      setStage('error');
      setErrorDetails(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsSaving(false);
    }
  };

  // Animation progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (progress < 100 && !isCompleted && !isSaving && stage !== 'error') {
      interval = setInterval(() => {
        setProgress(prev => {
          const increment = Math.random() * 3 + 1;
          const newProgress = Math.min(prev + increment, 100);
          
          // Update stages based on progress
          if (newProgress > 30 && stage === 'preparing') {
            setStage('assembling');
          } else if (newProgress > 70 && stage === 'assembling') {
            setStage('finalizing');
          } else if (newProgress === 100 && stage === 'finalizing') {
            setStage('complete');
            // Call the completion handler when reaching 100%
            handleCompletion();
          }
          
          return newProgress;
        });
      }, 300);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [progress, stage, isCompleted, isSaving]);

  // Error retry handler
  const handleRetry = () => {
    setProgress(0);
    setStage('preparing');
    setErrorDetails(null);
  };

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
            scale: stage === 'complete' ? [1, 1.5, 1] : 
                   stage === 'error' ? [1, 0.8, 1] : 1,
            rotate: progress * 5
          }}
          transition={{ duration: 2 }}
        >
          <SoulOrb 
            size="lg" 
            stage={stage === 'preparing' ? 'welcome' : 
                  stage === 'assembling' ? 'collecting' :
                  stage === 'finalizing' ? 'generating' : 
                  stage === 'complete' ? 'complete' : 'generating'}
            pulse={stage !== 'error'}
            speaking={false}
          />
        </motion.div>
      </div>
      
      {/* Energy streams flowing toward the orb */}
      {stage !== 'error' && progress < 100 && (
        <div className="absolute inset-0">
          {Array.from({ length: 8 }).map((_, i) => (
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
      )}
      
      {/* Status text */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-white">
        {stage === 'error' ? (
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-2">
              <AlertCircle className="text-red-500 mr-2 h-5 w-5" />
              <p className="font-medium text-lg text-red-500">
                Blueprint Generation Error
              </p>
            </div>
            <p className="text-sm mb-2 max-w-xs mx-auto">
              {errorDetails || "An unexpected error occurred during blueprint generation"}
            </p>
            <button 
              className="bg-soul-purple text-white px-3 py-1 text-sm rounded-full hover:bg-soul-purple/80 transition-colors"
              onClick={handleRetry}
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <p className="font-medium text-lg flex items-center justify-center">
              {stage === 'preparing' && 'Preparing Soul Blueprint...'}
              {stage === 'assembling' && 'Assembling Cosmic Patterns...'}
              {stage === 'finalizing' && 'Connecting Energy Pathways...'}
              {stage === 'complete' && (
                <>
                  <AlertCircle className="text-green-500 mr-2 h-5 w-5" />
                  Soul Blueprint Complete!
                </>
              )}
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
          </>
        )}
      </div>
    </div>
  );
}

export { BlueprintGenerator };
