
import React, { useState, useEffect } from "react";
import { motion } from "@/lib/framer-motion";
import { SoulOrb } from "@/components/ui/soul-orb";
import { cn } from "@/lib/utils";
import { BlueprintData, blueprintService } from "@/services/blueprint-service";
import { useToast } from "@/hooks/use-toast";

interface BlueprintGeneratorProps {
  userProfile: BlueprintData['user_meta'];
  onComplete: (blueprint: BlueprintData) => void;
  className?: string;
}

export const BlueprintGenerator: React.FC<BlueprintGeneratorProps> = ({ 
  userProfile, 
  onComplete,
  className 
}) => {
  // Generation steps from the diagram
  const steps = [
    { id: "process", label: "Processing birth data" },
    { id: "celestial", label: "Calculating celestial positions" },
    { id: "numerology", label: "Calculating numerology values" },
    { id: "humandesign", label: "Determining Human Design type" },
    { id: "chinese", label: "Calculating Chinese Zodiac" },
    { id: "mbti", label: "Integrating MBTI data" },
    { id: "insights", label: "Generating integrated insights" },
    { id: "store", label: "Storing complete blueprint" },
  ];
  
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, speed: number}>>([]);
  const [generatedBlueprint, setGeneratedBlueprint] = useState<BlueprintData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Generate random particles for visual effect
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      speed: Math.random() * 2 + 1
    }));
    setParticles(newParticles);
  }, []);

  // Generate the blueprint using the actual calculation service
  useEffect(() => {
    const generateBlueprint = async () => {
      // Only start if we haven't already
      if (isGenerating || generatedBlueprint) return;
      
      setIsGenerating(true);
      setError(null);
      
      try {
        console.log("Starting blueprint generation with user data:", userProfile);
        
        // Step 1: Processing birth data
        setCurrentStep(0);
        setProgress(12);
        await simulateProcessingDelay();
        
        // Step 2: Calculating celestial positions
        setCurrentStep(1);
        setProgress(25);
        await simulateProcessingDelay();
        
        // Step 3-7: Run the actual generation process
        setProgress(40);
        
        // Call the blueprint service to generate a blueprint
        const { data: blueprint, error } = await blueprintService.generateBlueprintFromBirthData(userProfile);
        
        if (error) {
          console.error("Blueprint generation error:", error);
          setError(error);
          toast({
            title: "Generation Error",
            description: "There was an error generating your blueprint. Please try again.",
            variant: "destructive"
          });
          return;
        }
        
        if (!blueprint) {
          setError("No blueprint data received");
          toast({
            title: "Generation Error",
            description: "No blueprint data was generated. Please try again.",
            variant: "destructive"
          });
          return;
        }
        
        // Progress through the remaining steps visually
        for (let step = 2; step < steps.length - 1; step++) {
          setCurrentStep(step);
          setProgress(40 + (step * 10));
          await simulateProcessingDelay(500); // slightly faster now that we have data
        }
        
        // Final step: Storing
        setCurrentStep(steps.length - 1);
        setProgress(95);
        await simulateProcessingDelay(500);
        
        // Store the generated blueprint
        setGeneratedBlueprint(blueprint);
        setProgress(100);
        
        // Complete the process and pass blueprint to parent
        setTimeout(() => {
          onComplete(blueprint);
        }, 1000);
      } catch (err) {
        console.error("Unexpected error during blueprint generation:", err);
        setError(err instanceof Error ? err.message : String(err));
        toast({
          title: "Generation Error",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsGenerating(false);
      }
    };
    
    // Start the generation process
    generateBlueprint();
  }, [userProfile, onComplete, toast]);

  // Helper function to simulate processing delay
  const simulateProcessingDelay = (ms = 1200) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  // Get the stage for the SoulOrb component
  const getSoulOrbStage = () => {
    if (currentStep < 2) return "welcome";
    if (currentStep < 6) return "collecting";
    return "generating";
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold font-display mb-2">
          <span className="gradient-text">Generating Your Soul Blueprint</span>
        </h2>
        <p className="text-muted-foreground">
          Please wait while we analyze cosmic patterns and generate your personalized blueprint
        </p>
      </div>

      {/* Main visualization area */}
      <div className="relative h-96 w-full rounded-xl overflow-hidden border border-soul-purple/20 bg-gradient-to-b from-soul-black to-soul-black/80">
        {/* Cosmic background with stars */}
        <div className="absolute inset-0">
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

        {/* Service Boxes */}
        <div className="absolute inset-0 flex items-center justify-between px-6">
          {/* User */}
          <div className="w-24 h-32 flex flex-col items-center justify-center">
            <div className={cn(
              "bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20 shadow-glow mb-2",
              currentStep === 0 && "border-soul-purple animate-pulse"
            )}>
              <div className="w-10 h-10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-soul-purple">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            </div>
            <span className="text-xs text-center text-white/80">User</span>
          </div>

          {/* API Gateway */}
          <div className="w-24 h-32 flex flex-col items-center justify-center">
            <div className={cn(
              "bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20 shadow-glow mb-2",
              currentStep === 1 && "border-soul-purple animate-pulse"
            )}>
              <div className="w-10 h-10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-soul-purple">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
            </div>
            <span className="text-xs text-center text-white/80">API Gateway</span>
          </div>

          {/* Blueprint Service */}
          <div className="w-24 h-32 flex flex-col items-center justify-center">
            <div className={cn(
              "bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20 shadow-glow mb-2", 
              currentStep >= 2 && currentStep <= 6 && "border-soul-purple animate-pulse"
            )}>
              <div className="w-10 h-10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-soul-purple">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>
            </div>
            <span className="text-xs text-center text-white/80">Blueprint Service</span>
          </div>

          {/* Swiss Ephemeris */}
          <div className="w-24 h-32 flex flex-col items-center justify-center">
            <div className={cn(
              "bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20 shadow-glow mb-2",
              currentStep === 1 && "border-soul-purple animate-pulse"
            )}>
              <div className="w-10 h-10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-soul-purple">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 6a2 2 0 0 0 0 12 2 2 0 0 0 0-12"></path>
                  <path d="M12 2v4"></path>
                  <path d="M12 18v4"></path>
                  <path d="M4.9 4.9l2.8 2.8"></path>
                  <path d="M16.3 16.3l2.8 2.8"></path>
                  <path d="M2 12h4"></path>
                  <path d="M18 12h4"></path>
                  <path d="M4.9 19.1l2.8-2.8"></path>
                  <path d="M16.3 7.7l2.8-2.8"></path>
                </svg>
              </div>
            </div>
            <span className="text-xs text-center text-white/80">Swiss Ephemeris</span>
          </div>

          {/* Database */}
          <div className="w-24 h-32 flex flex-col items-center justify-center">
            <div className={cn(
              "bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20 shadow-glow mb-2",
              currentStep === 7 && "border-soul-purple animate-pulse"
            )}>
              <div className="w-10 h-10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-soul-purple">
                  <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"></path>
                  <path d="M12 12h.01"></path>
                  <path d="M17 12h.01"></path>
                  <path d="M7 12h.01"></path>
                </svg>
              </div>
            </div>
            <span className="text-xs text-center text-white/80">Database</span>
          </div>
        </div>

        {/* Center Soul Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ 
              scale: [0.8, 1, 0.8],
              rotate: progress * 2
            }}
            transition={{ 
              scale: { duration: 3, repeat: Infinity },
              rotate: { duration: 20, repeat: Infinity, ease: "linear" }
            }}
          >
            <SoulOrb 
              size="lg" 
              stage={getSoulOrbStage()}
              pulse={true}
              speaking={false}
            />
          </motion.div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-16 bg-red-900/80 text-white px-4 py-2 rounded-md text-sm">
            Error: {error}
          </div>
        )}

        {/* Current Step Display */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          {currentStep < steps.length ? (
            <motion.p 
              className="text-white font-medium text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={currentStep}
            >
              {steps[currentStep].label}...
            </motion.p>
          ) : (
            <motion.p 
              className="text-soul-purple font-medium text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Blueprint Generation Complete!
            </motion.p>
          )}
          
          {/* Progress bar */}
          <div className="mt-2 mx-auto w-64 h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-soul-purple"
              style={{ width: `${progress}%` }}
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Flowing data particles */}
        {currentStep > 0 && currentStep < steps.length && (
          <div className="absolute inset-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={`flow-${i}`}
                className="absolute w-2 h-2 rounded-full bg-soul-purple"
                initial={{ 
                  x: 150 + (i * 40), 
                  y: 300,
                  opacity: 0
                }}
                animate={{ 
                  x: [150 + (i * 40), 500 - (i * 30)],
                  y: [300, 150],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Step indicator */}
      <div className="mt-8 flex justify-center">
        <div className="flex space-x-2">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={cn(
                "w-3 h-3 rounded-full transition-colors",
                index < currentStep 
                  ? "bg-soul-purple" 
                  : index === currentStep 
                  ? "bg-soul-purple/80 animate-pulse" 
                  : "bg-soul-purple/30"
              )}
            />
          ))}
          <div 
            className={cn(
              "w-3 h-3 rounded-full transition-colors",
              currentStep >= steps.length
                ? "bg-soul-purple"
                : "bg-soul-purple/30"
            )}
          />
        </div>
      </div>

      {/* Key features section */}
      <div className="mt-12 grid grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
          <h3 className="text-lg font-medium mb-2 text-soul-purple">Accurate Astrological Calculations</h3>
          <p className="text-sm text-white/70">
            Powered by Swiss Ephemeris for precise planetary positions at the time of birth
          </p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
          <h3 className="text-lg font-medium mb-2 text-soul-purple">Optimized Performance</h3>
          <p className="text-sm text-white/70">
            Complex calculations are cached to improve response times and system efficiency
          </p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
          <h3 className="text-lg font-medium mb-2 text-soul-purple">Integrated Spiritual Systems</h3>
          <p className="text-sm text-white/70">
            Combines astrology, numerology, Human Design, and MBTI into a cohesive profile
          </p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
          <h3 className="text-lg font-medium mb-2 text-soul-purple">Personalized Insights</h3>
          <p className="text-sm text-white/70">
            Pattern recognition algorithms generate custom guidance based on your unique blueprint
          </p>
        </div>
      </div>
    </div>
  );
};
