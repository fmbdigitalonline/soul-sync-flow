import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "@/lib/framer-motion";
import { Button } from "@/components/ui/button";
import { Onboarding3DScene } from "@/components/ui/onboarding-3d-scene";
import { BlueprintGenerator } from "@/components/blueprint/BlueprintGenerationFlow";
import { zodiac } from "@/components/ui/zodiac";
import { MBTISelector } from "@/components/blueprint/MBTISelector";
import { GoalSelectionStep } from "@/components/blueprint/GoalSelectionStep";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BlueprintData, blueprintService } from "@/services/blueprint-service"; 
import { useToast } from "@/hooks/use-toast";
import { useOnboarding3D } from "@/hooks/use-onboarding-3d";
import { useSoulOrb } from "@/contexts/SoulOrbContext";
import { useAuth } from "@/contexts/AuthContext";

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { speak } = useSoulOrb();
  const { user, loading: authLoading } = useAuth();
  
  // Get the onboarding 3D functionality
  const {
    is3DMode,
    currentStep,
    steps,
    showSpeechBubble,
    sceneRef,
    stage,
    speaking,
    interactionStage,
    isTransitioning,
    cardOpacity,
    goToNextStep,
    goToPrevStep,
    handleOrbClick,
    switchToInputStage
  } = useOnboarding3D();

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    preferredName: "",
    birthDate: "",
    birthTime: "",
    birthLocation: "",
    personality: "INFJ" // Default MBTI
  });
  
  // State variables for blueprint generation
  const [blueprintGenerated, setBlueprintGenerated] = useState(false);
  const [blueprintData, setBlueprintData] = useState<BlueprintData | null>(null);
  
  // Refs to prevent navigation loops
  const navigationTriggeredRef = useRef(false);
  
  // Update form data
  const updateFormData = (newData: Partial<typeof formData>) => {
    setFormData(prevData => ({ ...prevData, ...newData }));
  };
  
  // Handle blueprint generation completion
  const handleBlueprintComplete = (newBlueprint?: BlueprintData) => {
    // Prevent multiple executions
    if (navigationTriggeredRef.current || blueprintGenerated) {
      console.log("Navigation already triggered, ignoring duplicate completion");
      return;
    }
    
    console.log("Blueprint generation completed with data:", newBlueprint);
    
    // Set flags to prevent looping
    navigationTriggeredRef.current = true;
    setBlueprintGenerated(true);
    
    if (newBlueprint) {
      setBlueprintData(newBlueprint);
    }
    
    toast({
      title: "Blueprint Generated Successfully",
      description: "Your soul blueprint has been created and is ready to explore!",
    });
    
    speak("Your soul blueprint has been generated! Now let's set up your coaching preferences.");
    
    // Move to goal selection step instead of navigating away
    setTimeout(() => {
      goToNextStep(); // This will move to step 7 (Goal Selection)
      navigationTriggeredRef.current = false; // Reset for goal selection
    }, 1500);
  };

  // Handle goal selection completion - fixed to work with existing database schema
  const handleGoalSelectionComplete = async (preferences: { 
    primary_goal: string; 
    support_style: number; 
    time_horizon: string 
  }) => {
    console.log("Goal selection completed with preferences:", preferences);
    
    try {
      // Get the current blueprint and update it with preferences in the goal_stack
      const { data: currentBlueprint, error: fetchError } = await blueprintService.getActiveBlueprintData();
      
      if (fetchError || !currentBlueprint) {
        console.error("Error fetching current blueprint:", fetchError);
        toast({
          title: "Error",
          description: "Could not find your blueprint. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Update the blueprint's goal_stack with the runtime preferences
      const updatedBlueprint = {
        ...currentBlueprint,
        goal_stack: [
          {
            id: `goal_${Date.now()}`,
            primary_goal: preferences.primary_goal,
            support_style: preferences.support_style,
            time_horizon: preferences.time_horizon,
            created_at: new Date().toISOString(),
            status: 'active'
          }
        ]
      };

      // Update the blueprint with the new goal stack
      const { success, error } = await blueprintService.updateBlueprint(updatedBlueprint);
      
      if (success) {
        console.log("Blueprint updated with coaching preferences");
        toast({
          title: "Preferences Saved",
          description: "Your coaching preferences have been saved to your blueprint.",
        });
        
        speak("Perfect! Your preferences have been saved. Welcome to SoulSync!");
        
        // Navigate to blueprint page
        setTimeout(() => {
          navigate("/blueprint", { replace: true });
        }, 1000);
      } else {
        console.error("Error updating blueprint:", error);
        toast({
          title: "Error",
          description: error || "Failed to save your preferences. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Unexpected error saving preferences:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  // On first render
  useEffect(() => {
    document.title = "SoulSync - Onboarding";
  }, []);
  
  // Effect to handle completion
  useEffect(() => {
    if (blueprintGenerated && !navigationTriggeredRef.current) {
      navigationTriggeredRef.current = true;
      console.log("Blueprint generated, preparing to navigate");
      
      // Delay to allow animation to complete
      setTimeout(() => {
        navigate("/blueprint");
      }, 1500);
    }
  }, [blueprintGenerated, navigate]);

  // Check if user is authenticated when trying to generate blueprint
  useEffect(() => {
    if (currentStep === 6 && !authLoading && !user) {
      console.log("User not authenticated, redirecting to auth page");
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate your Soul Blueprint.",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [currentStep, user, authLoading, navigate, toast]);

  // Check for existing blueprint and redirect if found - improved error handling
  useEffect(() => {
    const checkExistingBlueprint = async () => {
      try {
        if (!user || authLoading) return;
        
        const { data: existingBlueprint, error } = await blueprintService.getActiveBlueprintData();
        
        if (error) {
          console.log("No existing blueprint found or error fetching:", error);
          return;
        }
        
        if (existingBlueprint && currentStep === 0) {
          console.log("Existing blueprint found, redirecting to blueprint page");
          toast({
            title: "Welcome Back!",
            description: "You already have a Soul Blueprint. Redirecting you to view it.",
          });
          
          setTimeout(() => {
            navigate("/blueprint", { replace: true });
          }, 1000);
        }
      } catch (error) {
        console.error("Error checking for existing blueprint:", error);
        // Don't show error to user for this check, just log it
      }
    };
    
    // Only check after a short delay to avoid immediate redirects
    if (user && !authLoading) {
      const timer = setTimeout(checkExistingBlueprint, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, currentStep, navigate, toast]);

  // Render the appropriate content based on the current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="space-y-4 max-w-md mx-auto text-center">
            <h2 className="text-2xl font-display font-bold">Welcome to SoulSync</h2>
            <p className="text-white/80">
              I'm your personal astrology guide. Let me help you discover your cosmic blueprint.
            </p>
            <div className="pt-4">
              <Button 
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors"
                onClick={goToNextStep}
              >
                Begin My Journey
              </Button>
            </div>
          </div>
        );
      case 1: // Full Name
        return (
          <div className="space-y-4 max-w-md mx-auto">
            <h2 className="text-xl font-display font-bold text-center mb-2">What's your name?</h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  placeholder="Enter your full name"
                  className="bg-white/5 border-white/10"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preferredName">Preferred Name (optional)</Label>
                <Input
                  id="preferredName"
                  type="text"
                  value={formData.preferredName}
                  onChange={(e) => updateFormData({ preferredName: e.target.value })}
                  placeholder="How would you like to be addressed?"
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={goToPrevStep}>Back</Button>
              <Button 
                disabled={!formData.name}
                onClick={goToNextStep}
              >
                Continue
              </Button>
            </div>
          </div>
        );
      case 2: // Birth Date
        return (
          <div className="space-y-4 max-w-md mx-auto">
            <h2 className="text-xl font-display font-bold text-center mb-2">When were you born?</h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => updateFormData({ birthDate: e.target.value })}
                  className="bg-white/5 border-white/10"
                  required
                />
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={goToPrevStep}>Back</Button>
              <Button 
                disabled={!formData.birthDate}
                onClick={goToNextStep}
              >
                Continue
              </Button>
            </div>
          </div>
        );
      case 3: // Birth Time
        return (
          <div className="space-y-4 max-w-md mx-auto">
            <h2 className="text-xl font-display font-bold text-center mb-2">What time were you born?</h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="space-y-2">
                <Label htmlFor="birthTime">Birth Time (Local Time)</Label>
                <Input
                  id="birthTime"
                  type="time"
                  value={formData.birthTime}
                  onChange={(e) => updateFormData({ birthTime: e.target.value })}
                  className="bg-white/5 border-white/10"
                  required
                />
                <p className="text-sm text-white/60">
                  Enter the local time where you were born - we'll automatically handle timezone conversion
                </p>
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={goToPrevStep}>Back</Button>
              <Button 
                disabled={!formData.birthTime}
                onClick={goToNextStep}
              >
                Continue
              </Button>
            </div>
          </div>
        );
      case 4: // Birth Location
        return (
          <div className="space-y-4 max-w-md mx-auto">
            <h2 className="text-xl font-display font-bold text-center mb-2">Where were you born?</h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="space-y-2">
                <Label htmlFor="birthLocation">Birth Location</Label>
                <Input
                  id="birthLocation"
                  type="text"
                  value={formData.birthLocation}
                  onChange={(e) => updateFormData({ birthLocation: e.target.value })}
                  placeholder="City, Country (e.g., Paramaribo, Suriname)"
                  className="bg-white/5 border-white/10"
                  required
                />
                <p className="text-sm text-white/60">
                  We'll automatically find the exact coordinates and historical timezone
                </p>
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={goToPrevStep}>Back</Button>
              <Button 
                disabled={!formData.birthLocation}
                onClick={goToNextStep}
              >
                Continue
              </Button>
            </div>
          </div>
        );
      case 5: // Personality
        return (
          <div className="space-y-4 max-w-md mx-auto">
            <h2 className="text-xl font-display font-bold text-center mb-2">What's your personality type?</h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <MBTISelector 
                value={formData.personality}
                onChange={(value) => updateFormData({ personality: value })}
              />
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={goToPrevStep}>Back</Button>
              <Button onClick={() => {
                // Check if user is authenticated before proceeding
                if (!user && !authLoading) {
                  toast({
                    title: "Authentication Required",
                    description: "Please sign in to continue with blueprint generation.",
                  });
                  navigate("/auth");
                  return;
                }
                goToNextStep();
              }}>
                Continue
              </Button>
            </div>
          </div>
        );
      case 6: // Generating Blueprint
        // Only show this step if user is authenticated
        if (!user && !authLoading) {
          return (
            <div className="space-y-6 text-center max-w-md mx-auto">
              <h2 className="text-xl font-display font-bold">Authentication Required</h2>
              <p className="text-white/80">Please sign in to generate your Soul Blueprint.</p>
              <Button onClick={() => navigate("/auth")} className="bg-soul-purple hover:bg-soul-purple/90">
                Sign In
              </Button>
            </div>
          );
        }

        return (
          <div className="space-y-6 text-center max-w-md mx-auto">
            <h2 className="text-xl font-display font-bold">Generating Your Soul Blueprint</h2>
            <BlueprintGenerator 
              key={`blueprint-generator-${blueprintGenerated ? 'complete' : 'active'}`}
              userProfile={{
                full_name: formData.name || "Anonymous User",
                preferred_name: formData.preferredName || formData.name.split(" ")[0],
                birth_date: formData.birthDate,
                birth_time_local: formData.birthTime,
                birth_location: formData.birthLocation,
                timezone: "AUTO_RESOLVED", // This will be automatically resolved by the backend
                personality: formData.personality
              }}
              onComplete={handleBlueprintComplete}
              className="mt-4"
            />
          </div>
        );
      case 7: // Goal Selection
        return (
          <div className="space-y-6 text-center max-w-md mx-auto">
            <h2 className="text-xl font-display font-bold">Choose Your Path</h2>
            <p className="text-white/80">Let's set up your coaching preferences to personalize your experience.</p>
            <GoalSelectionStep onComplete={handleGoalSelectionComplete} />
          </div>
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  // Determine whether to show speech bubble or form input
  const showInput = interactionStage === 'input' && !isTransitioning;
  const orbAnimation = speaking ? "speaking" : isTransitioning ? "transitioning" : "idle";

  return (
    <div className="min-h-screen bg-gradient-to-b from-soul-black to-soul-purple/20 text-white relative overflow-hidden">
      {/* 3D Background */}
      <Onboarding3DScene
        speaking={speaking}
        stage={stage}
        interactionStage={interactionStage}
        isCalculating={currentStep === 6}
      >
        {/* Progress indicator */}
        <div className="absolute top-4 left-0 right-0 px-4">
          <div className="w-full max-w-md mx-auto flex justify-between mb-1">
            {steps.map((_, index) => (
              <div 
                key={index} 
                className={`w-3 h-3 rounded-full ${
                  index < currentStep 
                    ? "bg-white" 
                    : index === currentStep 
                    ? "bg-white/80 animate-pulse" 
                    : "bg-white/30"
                }`}
              ></div>
            ))}
          </div>
          <div className="text-center text-sm text-white/60">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
          </div>
        </div>

        {/* Animated content container */}
        <motion.div
          ref={sceneRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-md mx-auto p-4"
          style={{ 
            pointerEvents: 'auto',
            perspective: '1000px'
          }}
        >
          {/* Card with dynamic opacity for smooth transitions */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: cardOpacity }}
            transition={{ duration: 0.3 }}
            className={`${showInput ? 'block' : 'hidden'}`}
          >
            {renderStepContent()}
          </motion.div>
        </motion.div>
      </Onboarding3DScene>
      
      {/* Floating orb functionality - clicks trigger interactions */}
      <div 
        className="fixed bottom-10 right-10 cursor-pointer"
        onClick={handleOrbClick}
        aria-label="Toggle orb interaction"
      >
        <div className="w-12 h-12 rounded-full bg-soul-purple/30 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-soul-purple animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
