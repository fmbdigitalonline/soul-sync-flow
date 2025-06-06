import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "@/lib/framer-motion";
import { Button } from "@/components/ui/button";
import { Onboarding3DScene } from "@/components/ui/onboarding-3d-scene";
import { BlueprintGenerator } from "@/components/blueprint/BlueprintGenerationFlow";
import { zodiac } from "@/components/ui/zodiac";
import { MBTISelector } from "@/components/blueprint/MBTISelector";
import { BirthDataForm } from "@/components/blueprint/BirthDataForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BlueprintData, blueprintService } from "@/services/blueprint-service"; 
import { useToast } from "@/hooks/use-toast";
import { useOnboarding3D } from "@/hooks/use-onboarding-3d";
import { useSoulOrb } from "@/contexts/SoulOrbContext";

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { speak } = useSoulOrb();
  
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
    timezone: "UTC",
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
    
    speak("Your soul blueprint has been generated! Let's explore it together.");
    
    // Navigate to blueprint page after transition
    setTimeout(() => {
      console.log("Navigating to blueprint page after blueprint generation");
      
      if (navigationTriggeredRef.current) {
        navigate("/blueprint");
      }
    }, 2000);
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
              <BirthDataForm
                birthData={{
                  birthDate: formData.birthDate,
                  birthTime: formData.birthTime,
                  birthLocation: formData.birthLocation,
                  timezone: formData.timezone
                }}
                showDateOnly={true}
                onChange={(data) => updateFormData({
                  birthDate: data.birthDate,
                  timezone: data.timezone
                })}
              />
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
              <BirthDataForm
                birthData={{
                  birthDate: formData.birthDate,
                  birthTime: formData.birthTime,
                  birthLocation: formData.birthLocation,
                  timezone: formData.timezone
                }}
                showTimeOnly={true}
                onChange={(data) => updateFormData({
                  birthTime: data.birthTime,
                })}
              />
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
              <BirthDataForm
                birthData={{
                  birthDate: formData.birthDate,
                  birthTime: formData.birthTime,
                  birthLocation: formData.birthLocation,
                  timezone: formData.timezone
                }}
                showLocationOnly={true}
                onChange={(data) => updateFormData({
                  birthLocation: data.birthLocation,
                })}
              />
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
              <Button onClick={goToNextStep}>Continue</Button>
            </div>
          </div>
        );
      case 6: // Generating Blueprint
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
                timezone: formData.timezone,
                personality: formData.personality
              }}
              onComplete={handleBlueprintComplete}
              className="mt-4"
            />
          </div>
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  // Determine whether to show speech bubble or form input
  const showInput = interactionStage === 'input' && !isTransitioning;
  const orbAnimation = speaking ? "speaking" : isTransitioning ? "transitioning" : "idle";

  // If the user has already completed the onboarding and is somehow back here with a blueprint,
  // redirect them to the blueprint page
  useEffect(() => {
    // Add a delayed navigation check to handle cases where blueprint exists
    const checkBlueprintAndNavigate = async () => {
      try {
        const { data: blueprint } = await blueprintService.getActiveBlueprintData();
        
        if (blueprint && currentStep === 0) {
          console.log("Blueprint already exists, redirecting to blueprint page");
          toast({
            title: "Welcome Back!",
            description: "You've already created your Soul Blueprint. Redirecting you to view it.",
          });
          
          // Short delay before navigation
          setTimeout(() => {
            navigate("/blueprint");
          }, 1000);
        }
      } catch (error) {
        console.error("Error checking for existing blueprint:", error);
      }
    };
    
    // Run the check after a short delay to allow the component to mount properly
    const timer = setTimeout(checkBlueprintAndNavigate, 1500);
    
    return () => clearTimeout(timer);
  }, [navigate, toast, currentStep]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-soul-black to-soul-purple/20 text-white relative overflow-hidden">
      {/* 3D Background */}
      <Onboarding3DScene
        speaking={speaking}
        stage={stage}
        interactionStage={interactionStage}
        isCalculating={currentStep === 6}
      >
        {/* Progress indicator (simplified) */}
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
