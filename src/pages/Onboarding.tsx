
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "@/lib/framer-motion";
import { Button } from "@/components/ui/button";
import { SoulOrb } from "@/components/ui/soul-orb";
import { BlueprintGenerator } from "@/components/blueprint/BlueprintGenerationFlow";
import { zodiac } from "@/components/ui/zodiac";
import { MBTISelector } from "@/components/blueprint/MBTISelector";
import { BirthDataForm } from "@/components/blueprint/BirthDataForm";
import { BlueprintData } from "@/services/blueprint-service"; 
import { useToast } from "@/hooks/use-toast";
import { useSoulOrb } from "@/contexts/SoulOrbContext";

// Onboarding step interface
interface OnboardingStep {
  id: string;
  title: string;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { speak } = useSoulOrb();
  
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
  
  // Onboarding steps
  const steps: OnboardingStep[] = [
    { id: "welcome", title: "Welcome" },
    { id: "name", title: "Your Name" },
    { id: "birth", title: "Birth Details" },
    { id: "personality", title: "Personality Type" },
    { id: "purpose", title: "Your Purpose" },
    { id: "generating", title: "Generating Blueprint" }
  ];
  
  // State variables
  const [currentStep, setCurrentStep] = useState(0);
  const [blueprintGenerated, setBlueprintGenerated] = useState(false);
  
  // Refs to prevent navigation loops
  const navigationTriggeredRef = useRef(false);
  
  // Update form data
  const updateFormData = (newData: Partial<typeof formData>) => {
    setFormData(prevData => ({ ...prevData, ...newData }));
  };
  
  // Move to the next step
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  // Go back to the previous step
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  // Handle blueprint generation completion
  const handleBlueprintComplete = () => {
    // Prevent multiple executions
    if (navigationTriggeredRef.current || blueprintGenerated) {
      console.log("Navigation already triggered, ignoring duplicate completion");
      return;
    }
    
    // Set flags to prevent looping
    navigationTriggeredRef.current = true;
    setBlueprintGenerated(true);
    
    toast({
      title: "Blueprint Generated Successfully",
      description: "Your soul blueprint has been created and is ready to explore!",
    });
    
    speak("Your soul blueprint has been generated! Let's explore it together.");
    
    // Navigate to blueprint page after transition
    setTimeout(() => {
      console.log("Navigating to blueprint page after blueprint generation");
      if (!navigationTriggeredRef.current) return; // Double-check flag before navigating
      navigate("/blueprint");
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

  // Prevent re-renders on the generating step
  const renderStepContent = () => {
    // Create a stable instance of BlueprintGenerator on the final step
    const generatingStep = steps.length - 1;
    
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center mb-8">
              <SoulOrb size="lg" stage="welcome" pulse={true} />
            </div>
            
            <h2 className="text-2xl font-display font-bold">Welcome to SoulSync</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Let's create your personalized soul blueprint to help you understand your unique cosmic design and life purpose.
            </p>
            
            <div className="max-w-md mx-auto">
              <Button 
                className="w-full" 
                onClick={goToNextStep}>
                Begin Your Journey
              </Button>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-center">What's Your Name?</h2>
            
            <div className="max-w-md mx-auto space-y-4">
              <div className="space-y-2">
                <label htmlFor="fullName" className="block text-sm font-medium">
                  Full Name (for calculations)
                </label>
                <input
                  id="fullName"
                  type="text"
                  className="w-full px-4 py-2 border border-border rounded-md bg-card"
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  placeholder="Your full name"
                />
                <p className="text-xs text-muted-foreground">
                  Your full legal name is used for numerological calculations
                </p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="preferredName" className="block text-sm font-medium">
                  What should we call you?
                </label>
                <input
                  id="preferredName"
                  type="text"
                  className="w-full px-4 py-2 border border-border rounded-md bg-card"
                  value={formData.preferredName}
                  onChange={(e) => updateFormData({ preferredName: e.target.value })}
                  placeholder="Your preferred name"
                />
              </div>
              
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={goToPreviousStep}>
                  Back
                </Button>
                <Button 
                  onClick={goToNextStep}
                  disabled={!formData.name}>
                  Continue
                </Button>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-center">Birth Details</h2>
            <p className="text-center text-muted-foreground max-w-md mx-auto">
              Your birth time and location determine your cosmic blueprint
            </p>
            
            <div className="max-w-md mx-auto">
              <BirthDataForm
                birthData={{
                  birthDate: formData.birthDate,
                  birthTime: formData.birthTime,
                  birthLocation: formData.birthLocation,
                  timezone: formData.timezone
                }}
                onChange={(data) => updateFormData({
                  birthDate: data.birthDate,
                  birthTime: data.birthTime,
                  birthLocation: data.birthLocation,
                  timezone: data.timezone
                })}
              />
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={goToPreviousStep}>
                  Back
                </Button>
                <Button 
                  onClick={goToNextStep}
                  disabled={!formData.birthDate || !formData.birthTime || !formData.birthLocation}>
                  Continue
                </Button>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-center">Your Personality Type</h2>
            <p className="text-center text-muted-foreground max-w-md mx-auto">
              Select your Myers-Briggs (MBTI) personality type to enhance your blueprint accuracy
            </p>
            
            <div className="max-w-md mx-auto">
              <MBTISelector 
                value={formData.personality}
                onChange={(value) => updateFormData({ personality: value })}
              />
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={goToPreviousStep}>
                  Back
                </Button>
                <Button onClick={goToNextStep}>
                  Continue
                </Button>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 text-center">
            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <SoulOrb size="lg" stage="collecting" pulse={true} />
            </motion.div>
            
            <h2 className="text-2xl font-display font-bold">Discover Your Life Purpose</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your Soul Blueprint integrates multiple wisdom systems to reveal your unique gifts, challenges, and life path.
            </p>
            
            <div className="max-w-md mx-auto">
              <div className="grid grid-cols-4 gap-4 my-8">
                {Object.values(zodiac).slice(0, 4).map((sign, i) => (
                  <motion.div 
                    key={sign.name}
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="text-2xl mb-2">{sign.symbol}</div>
                    <div className="text-xs text-muted-foreground">{sign.name}</div>
                  </motion.div>
                ))}
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={goToPreviousStep}>
                  Back
                </Button>
                <Button onClick={goToNextStep}>
                  Generate My Blueprint
                </Button>
              </div>
            </div>
          </div>
        );
      case 5:
        // The Generating step - only render BlueprintGenerator once
        return (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-display font-bold">Generating Your Soul Blueprint</h2>
            <BlueprintGenerator 
              key={`blueprint-generator-${blueprintGenerated ? 'complete' : 'active'}`}
              userProfile={{
                full_name: formData.name,
                preferred_name: formData.preferredName,
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-soul-black to-soul-purple/20 text-white">
      {/* Progress indicator */}
      <div className="w-full px-4 pt-4 pb-8 max-w-4xl mx-auto">
        <div className="flex justify-between mb-1">
          {steps.map((step, index) => (
            <div key={step.id} className="text-xs text-white/60">
              {index < currentStep ? "✓" : ""}
            </div>
          ))}
        </div>
        <div className="w-full bg-white/10 rounded-full h-1">
          <motion.div
            className="bg-soul-purple h-1 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    
      {/* Main content */}
      <div className="w-full max-w-4xl mx-auto px-4 pb-20 min-h-[60vh] flex items-center justify-center">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {renderStepContent()}
        </motion.div>
      </div>
    </div>
  );
}
