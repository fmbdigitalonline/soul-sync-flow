
import React, { useState, useEffect } from "react";
import { motion } from "@/lib/framer-motion";
import { SoulOrb } from "./soul-orb";
import { cn } from "@/lib/utils";
import { blueprintService, defaultBlueprintData } from "@/services/blueprint-service";
import { useToast } from "@/hooks/use-toast";

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
  const [stage, setStage] = useState<'preparing' | 'assembling' | 'finalizing' | 'complete'>('preparing');
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, speed: number}>>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Preparing Soul Blueprint...');
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
      // Create blueprint data from form inputs or use default
      const blueprintData = {
        ...defaultBlueprintData,
        user_meta: {
          ...defaultBlueprintData.user_meta,
          full_name: formData?.name || defaultBlueprintData.user_meta.full_name,
          preferred_name: formData?.name?.split(' ')[0] || defaultBlueprintData.user_meta.preferred_name,
          birth_date: formData?.birthDate || defaultBlueprintData.user_meta.birth_date,
          birth_time_local: formData?.birthTime || defaultBlueprintData.user_meta.birth_time_local,
          birth_location: formData?.birthLocation || defaultBlueprintData.user_meta.birth_location,
        },
        cognition_mbti: {
          ...defaultBlueprintData.cognition_mbti,
          type: formData?.personality || defaultBlueprintData.cognition_mbti.type,
        }
      };
      
      // Save blueprint to database
      const result = await blueprintService.saveBlueprintData(blueprintData);
      
      if (!result.success) {
        console.error("Error saving blueprint:", result.error);
        toast({
          title: "Error",
          description: "Failed to save your blueprint. Please try again.",
          variant: "destructive"
        });
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
    } finally {
      setIsSaving(false);
    }
  };

  // Animation progress with research-based timing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (progress < 100 && !isCompleted && !isSaving) {
      interval = setInterval(() => {
        setProgress(prev => {
          // Slower advancement to account for longer processing time with research-based approach
          const increment = Math.random() * 2 + 0.5;
          const newProgress = Math.min(prev + increment, 100);
          
          // Update stages based on progress
          if (newProgress > 20 && stage === 'preparing') {
            setStage('assembling');
            setStatusMessage('Researching Cosmic Patterns...');
          } else if (newProgress > 60 && stage === 'assembling') {
            setStage('finalizing');
            setStatusMessage('Generating Soul Blueprint Insights...');
          } else if (newProgress === 100 && stage === 'finalizing') {
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
