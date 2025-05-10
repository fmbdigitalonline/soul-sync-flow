
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SoulOrb } from "@/components/ui/soul-orb";
import blueprintService, { BlueprintData } from '@/services/blueprint-service';

interface BlueprintGenerationFlowProps {
  userMeta: {
    full_name: string;
    birth_date: string;
    birth_time_local?: string;
    birth_location?: string;
    preferred_name?: string;
    mbti?: string;
  };
  onComplete?: () => void;
  className?: string;
}

export const BlueprintGenerationFlow: React.FC<BlueprintGenerationFlowProps> = ({ 
  userMeta, 
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
    { id: "search", label: "Performing web searches" },
    { id: "store", label: "Storing complete blueprint" },
  ];
  
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, speed: number}>>([]);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [stage, setStage] = useState('initial');
  const [toolCalls, setToolCalls] = useState<any[]>([]);
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

  // Step progression for the UI
  useEffect(() => {
    if (isGenerating && !isSuccess && !isError) {
      const totalSteps = steps.length;
      let stepIndex = 0;
      
      const progressInterval = setInterval(() => {
        if (stepIndex >= totalSteps) {
          clearInterval(progressInterval);
          return;
        }
        
        setCurrentStep(stepIndex);
        setProgress(Math.min(Math.floor((stepIndex / totalSteps) * 100), 70)); // Cap at 70% until actual completion
        stepIndex++;
      }, 3000); // Show a new step every 3 seconds
      
      return () => clearInterval(progressInterval);
    }
  }, [isGenerating, isSuccess, isError, steps.length]);

  // Generate the blueprint using the actual service
  useEffect(() => {
    let mounted = true;
    
    if (isGenerating) {
      const generateBlueprint = async () => {
        try {
          setStage('preparing');
          setProgress(10);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Update user meta with preferred name if not provided
          const updatedUserMeta = {
            ...userMeta,
            preferred_name: userMeta.preferred_name || userMeta.full_name.split(' ')[0],
          };
          
          // Generate blueprint with web search
          setStage('searching');
          setProgress(30);
          
          // Use the generate function
          const result = await blueprintService.generateBlueprintFromBirthData(updatedUserMeta);
          
          if (!mounted) return;
          
          // Store raw response for debugging
          if (result.rawResponse) {
            setRawResponse(result.rawResponse);
            
            // Extract tool calls if available
            if (result.rawResponse.choices?.[0]?.message?.tool_calls) {
              setToolCalls(result.rawResponse.choices[0].message.tool_calls);
            }
          }
          
          if (result.success && result.blueprint) {
            setProgress(70);
            setStage('saving');
            
            // Save blueprint to database
            await blueprintService.saveBlueprintToDatabase(result.blueprint);
            
            if (!mounted) return;
            
            // Complete the generation process
            setProgress(100);
            setStage('complete');
            setIsSuccess(true);
            
            toast({
              title: "Blueprint Generated Successfully",
              description: "Your soul blueprint has been created with web search enhanced data",
              variant: "default"
            });
            
            // Call onComplete callback if provided
            if (onComplete) {
              setTimeout(() => {
                if (mounted) {
                  onComplete();
                }
              }, 2000);
            }
          } else {
            throw new Error(result.error || 'Unknown error during blueprint generation');
          }
        } catch (error) {
          console.error('Error generating blueprint:', error);
          if (mounted) {
            setIsError(true);
            setErrorMessage(error instanceof Error ? error.message : 'Failed to generate blueprint. Please try again.');
            setStage('error');
            setProgress(100); // Complete the progress bar even on error
            
            toast({
              variant: "destructive",
              title: "Blueprint Generation Failed",
              description: "There was an error generating your blueprint. View technical details for more information."
            });
          }
        }
      };
      
      generateBlueprint();
    }
    
    return () => {
      mounted = false;
    };
  }, [isGenerating, userMeta, onComplete, toast]);

  // Toggle debug mode
  const toggleDebugMode = () => {
    setDebugMode(prev => !prev);
  };

  // Get the stage for the SoulOrb component
  const getSoulOrbStage = () => {
    if (currentStep < 2) return "welcome";
    if (currentStep < 6) return "collecting";
    return "generating";
  };

  // Trigger generation on component mount
  useEffect(() => {
    setIsGenerating(true);
  }, []);

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold font-display mb-2">
          <span className="gradient-text">Generating Your Soul Blueprint</span>
        </h2>
        <p className="text-muted-foreground">
          Using GPT-4o Search Preview to analyze cosmic patterns and web search for accurate data
        </p>
        
        {/* Debug Mode Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={toggleDebugMode}
        >
          {debugMode ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Hide Technical Details
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              View Technical Details
            </>
          )}
        </Button>
      </div>

      {/* Main visualization area with particles, service boxes, and error displays */}
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

          {/* Web Search */}
          <div className="w-24 h-32 flex flex-col items-center justify-center">
            <div className={cn(
              "bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20 shadow-glow mb-2",
              currentStep === 7 && "border-soul-purple animate-pulse"
            )}>
              <div className="w-10 h-10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-soul-purple">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="11" y1="8" x2="11" y2="14"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              </div>
            </div>
            <span className="text-xs text-center text-white/80">Web Search</span>
          </div>

          {/* Database */}
          <div className="w-24 h-32 flex flex-col items-center justify-center">
            <div className={cn(
              "bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20 shadow-glow mb-2",
              currentStep === 8 && "border-soul-purple animate-pulse"
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
        {isError && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-16 bg-red-900/80 text-white px-4 py-2 rounded-md text-sm">
            Error: {errorMessage}
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
              className={cn(
                "font-medium text-lg",
                isSuccess ? "text-soul-purple" : "text-red-500"
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {isSuccess ? "Blueprint Generation Complete!" : "Blueprint Generation Failed"}
            </motion.p>
          )}
          
          {/* Progress bar */}
          <div className="mt-2 mx-auto w-64 h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              className={cn(
                "h-full",
                isSuccess ? "bg-soul-purple" : isError ? "bg-red-500" : "bg-soul-purple"
              )}
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
                ? isSuccess ? "bg-soul-purple" : "bg-red-500"
                : "bg-soul-purple/30"
            )}
          />
        </div>
      </div>

      {/* Key features section */}
      <div className="mt-12 grid grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
          <h3 className="text-lg font-medium mb-2 text-soul-purple">Web Search Integration</h3>
          <p className="text-sm text-white/70">
            Utilizes OpenAI's search capabilities to find accurate astrological and birth data
          </p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
          <h3 className="text-lg font-medium mb-2 text-soul-purple">Enhanced Accuracy</h3>
          <p className="text-sm text-white/70">
            Planetary positions and time zone adjustments calculated using real-time web data
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
            GPT-4o Search Preview processes research results to generate your unique blueprint
          </p>
        </div>
      </div>

      {/* Debug Output Section */}
      {debugMode && (
        <div className="mt-8 space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-2">Web Search Calls</h3>
            <div className="bg-black/60 rounded-md p-4 overflow-auto max-h-[200px] text-sm">
              {toolCalls && toolCalls.length > 0 ? (
                <div className="space-y-2">
                  {toolCalls.map((call, index) => (
                    <div key={index} className="p-2 border border-soul-purple/30 rounded">
                      <p className="text-soul-purple font-medium">Search #{index + 1}</p>
                      <p className="text-green-400 whitespace-pre-wrap mt-1">
                        {call.function?.arguments ? JSON.parse(call.function.arguments).query || "No query found" : "No search data"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No web searches performed yet...</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-2">Raw API Response</h3>
            <div className="bg-black/60 rounded-md p-4 overflow-auto max-h-[400px] text-sm">
              {rawResponse ? (
                <pre className="text-green-400 whitespace-pre-wrap">{JSON.stringify(rawResponse, null, 2)}</pre>
              ) : (
                <p className="text-gray-400">No raw API response data available yet...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
