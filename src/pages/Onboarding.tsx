import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Calendar, Clock, MapPin, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MainLayout from "@/components/Layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { SoulOrb } from "@/components/ui/soul-orb";
import { SpeechBubble } from "@/components/ui/speech-bubble";
import { BlueprintGenerator } from "@/components/ui/blueprint-generator";
import { useSoulOrb } from "@/contexts/SoulOrbContext";
import { motion } from "@/lib/framer-motion";
import { Onboarding3DScene } from "@/components/ui/onboarding-3d-scene";
import { useOnboarding3D } from "@/hooks/use-onboarding-3d";

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentMessage } = useSoulOrb();
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    birthTime: "",
    birthLocation: "",
    personality: "",
  });
  
  // Add a state to track if blueprint has been generated
  const [blueprintGenerated, setBlueprintGenerated] = useState(false);
  // Use a ref to track if navigation has been triggered
  const navigationTriggeredRef = useRef(false);
  
  // Use our custom hook for 3D onboarding
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
    transitionTo2D,
    listenAgain
  } = useOnboarding3D();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handle blueprint generation completion
  const handleBlueprintComplete = () => {
    // Prevent multiple executions
    if (navigationTriggeredRef.current) return;
    navigationTriggeredRef.current = true;
    
    // Set flag to prevent looping
    setBlueprintGenerated(true);
    
    toast({
      title: "Blueprint generated!",
      description: "Your Soul Blueprint has been created successfully. Transitioning to 2D view...",
    });
    
    // Transition to 2D view
    transitionTo2D();
    
    // Navigate to blueprint page after transition
    setTimeout(() => {
      console.log("Navigating to blueprint page after blueprint generation");
      navigate("/blueprint");
    }, 2000);
  };

  // Clean up effect - when component unmounts, make sure we're not caught in a loop
  useEffect(() => {
    return () => {
      // If we're unmounting and blueprint was generated, set the ref to true to avoid loops
      if (blueprintGenerated) {
        navigationTriggeredRef.current = true;
      }
    };
  }, [blueprintGenerated]);

  // Add an effect to prevent looping if blueprint was generated
  useEffect(() => {
    if (blueprintGenerated && !navigationTriggeredRef.current) {
      console.log("Blueprint was generated, should redirect soon");
      navigationTriggeredRef.current = true;
      
      // Safety fallback - if we haven't navigated after 5 seconds, force navigation
      const safetyTimeout = setTimeout(() => {
        if (window.location.pathname === "/onboarding") {
          console.log("Safety fallback: forcing navigation to blueprint page");
          navigate("/blueprint");
        }
      }, 5000);
      
      return () => clearTimeout(safetyTimeout);
    }
  }, [blueprintGenerated, navigate]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-display font-bold">Welcome to SoulSync</h2>
            <p>
              Let's create your unique Soul Blueprint by collecting some key information.
              This will help us provide personalized guidance aligned with your cosmic design.
            </p>
            <div>
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1"
                disabled={interactionStage === 'listening'}
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-center">Your Birth Date</h2>
            <p className="text-center">
              Your birth date helps us calculate your astrological signs and numerology.
            </p>
            <div className="flex items-center space-x-4">
              <Calendar className="text-soul-purple h-8 w-8 flex-shrink-0" />
              <div className="space-y-1 w-full">
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className="mt-1"
                  disabled={interactionStage === 'listening'}
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-center">Your Birth Time</h2>
            <p className="text-center">
              Your birth time helps us calculate your Rising sign and moon position.
            </p>
            <div className="flex items-center space-x-4">
              <Clock className="text-soul-purple h-8 w-8 flex-shrink-0" />
              <div className="space-y-1 w-full">
                <Label htmlFor="birthTime">Birth Time (if known)</Label>
                <Input
                  id="birthTime"
                  name="birthTime"
                  type="time"
                  value={formData.birthTime}
                  onChange={handleInputChange}
                  className="mt-1"
                  disabled={interactionStage === 'listening'}
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-center">Your Birth Location</h2>
            <p className="text-center">
              Your birth location helps us calculate your exact astrological chart.
            </p>
            <div className="flex items-center space-x-4">
              <MapPin className="text-soul-purple h-8 w-8 flex-shrink-0" />
              <div className="space-y-1 w-full">
                <Label htmlFor="birthLocation">Birth City/Country</Label>
                <Input
                  id="birthLocation"
                  name="birthLocation"
                  placeholder="e.g., New York, USA"
                  value={formData.birthLocation}
                  onChange={handleInputChange}
                  className="mt-1"
                  disabled={interactionStage === 'listening'}
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-center">Your Personality Type</h2>
            <p className="text-center">
              If you know your MBTI personality type, please select it below.
            </p>
            <div className="space-y-1">
              <Label htmlFor="personality">MBTI Personality Type (optional)</Label>
              <select
                id="personality"
                name="personality"
                value={formData.personality}
                onChange={handleInputChange}
                disabled={interactionStage === 'listening'}
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select personality type</option>
                <option value="INTJ">INTJ</option>
                <option value="INTP">INTP</option>
                <option value="ENTJ">ENTJ</option>
                <option value="ENTP">ENTP</option>
                <option value="INFJ">INFJ</option>
                <option value="INFP">INFP</option>
                <option value="ENFJ">ENFJ</option>
                <option value="ENFP">ENFP</option>
                <option value="ISTJ">ISTJ</option>
                <option value="ISFJ">ISFJ</option>
                <option value="ESTJ">ESTJ</option>
                <option value="ESFJ">ESFJ</option>
                <option value="ISTP">ISTP</option>
                <option value="ISFP">ISFP</option>
                <option value="ESTP">ESTP</option>
                <option value="ESFP">ESFP</option>
              </select>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-display font-bold">Generating Your Soul Blueprint</h2>
            <BlueprintGenerator 
              formData={formData}
              onComplete={handleBlueprintComplete}
              className="mt-4"
            />
          </div>
        );
      default:
        return null;
    }
  };

  // Render 3D experience
  if (is3DMode) {
    return (
      <MainLayout hideNav>
        {/* 3D Scene */}
        <motion.div 
          className="fixed inset-0 z-0"
          ref={sceneRef}
        >
          <Onboarding3DScene 
            speaking={speaking}
            stage={stage}
            interactionStage={interactionStage}
          >
            {/* Center aligned content */}
            <div className="relative w-20 h-20">
              {currentMessage && showSpeechBubble && interactionStage === 'listening' && (
                <SpeechBubble position="bottom" className="w-80" is3D={true}>
                  {currentMessage}
                </SpeechBubble>
              )}
            </div>
          </Onboarding3DScene>
        </motion.div>
        
        {/* Interaction area - floating cosmic card with visual differentiation based on interaction stage */}
        <div className="h-screen p-6 flex flex-col justify-center items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ 
              opacity: cardOpacity, 
              y: interactionStage === 'input' ? 0 : 20,
              scale: interactionStage === 'input' ? 1.05 : 0.95
            }}
            transition={{ duration: 0.5 }}
            className={`w-full max-w-md ${
              interactionStage === 'listening' || isTransitioning ? 'pointer-events-none' : 'pointer-events-auto'
            }`}
          >
            <CosmicCard 
              className={`backdrop-blur-lg transition-all duration-500 ${
                interactionStage === 'listening' ? 'bg-opacity-20' : 'bg-opacity-40'
              }`} 
              floating={interactionStage === 'input' && !isTransitioning}
            >
              <div className="space-y-6">{renderStepContent()}</div>
              
              {/* "Listen Again" button when in input mode except for the generating step */}
              {interactionStage === 'input' && currentStep !== steps.length - 1 && !isTransitioning && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={listenAgain}
                  className="flex items-center mt-2 mx-auto"
                  disabled={isTransitioning}
                >
                  <Volume2 className="mr-1 h-4 w-4" />
                  Listen Again
                </Button>
              )}
              
              {currentStep !== steps.length - 1 && (
                <div className={`mt-8 flex justify-between transition-opacity duration-300 ${
                  interactionStage === 'listening' || isTransitioning ? 'opacity-0' : 'opacity-100'
                }`}>
                  <Button
                    variant="ghost"
                    onClick={goToPrevStep}
                    disabled={currentStep === 0 || interactionStage === 'listening' || isTransitioning}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <GradientButton 
                    onClick={goToNextStep} 
                    disabled={interactionStage === 'listening' || isTransitioning}
                  >
                    {currentStep === steps.length - 2 ? "Generate Blueprint" : "Continue"}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </GradientButton>
                </div>
              )}
            </CosmicCard>
            
            {/* Tap to continue hint with different messages based on stage */}
            <div className="text-center mt-4 text-white text-sm opacity-80">
              {isTransitioning ? (
                <p>Transitioning...</p>
              ) : interactionStage === 'listening' ? (
                <p>Soul Orb is speaking. Click anywhere to continue...</p>
              ) : (
                <p>Please enter your information</p>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* Interactive area for clicking - covers the entire screen during listening phase */}
        {interactionStage === 'listening' && !isTransitioning && (
          <div 
            className="fixed inset-0 cursor-pointer z-20"
            onClick={handleOrbClick}
          />
        )}
        {/* Smaller interactive area for the orb during input phase */}
        {interactionStage === 'input' && !isTransitioning && (
          <div 
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 cursor-pointer z-20"
            onClick={handleOrbClick}
          />
        )}
      </MainLayout>
    );
  }
  
  // Regular 2D experience (this will be shown after onboarding)
  return (
    <MainLayout hideNav>
      <div className="min-h-screen p-6 flex flex-col">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-display font-bold">
            <span className="gradient-text">SoulSync</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 mt-4">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`h-2 w-2 rounded-full ${
                  index === currentStep
                    ? "bg-soul-purple"
                    : index < currentStep
                    ? "bg-soul-lavender"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Transitioning content */}
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <CosmicCard className="w-full max-w-md" floating>
              <div className="text-center p-8">
                <h2 className="text-2xl font-display font-bold mb-4">Welcome to SoulSync</h2>
                <p className="mb-6">Your Soul Blueprint has been created successfully!</p>
                <GradientButton onClick={() => navigate("/blueprint")} className="w-full">
                  View My Soul Blueprint
                </GradientButton>
              </div>
            </CosmicCard>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Onboarding;
