import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Calendar, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StarField from "@/components/ui/star-field";
import MainLayout from "@/components/Layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { SoulOrb } from "@/components/ui/soul-orb";
import { SpeechBubble } from "@/components/ui/speech-bubble";
import { BlueprintGenerator } from "@/components/ui/blueprint-generator";
import { useSoulOrb } from "@/contexts/SoulOrbContext";
import { motion } from "@/lib/framer-motion";

const steps = [
  "Welcome",
  "Birth Date",
  "Birth Time",
  "Birth Location",
  "Personality",
  "Generating",
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    birthTime: "",
    birthLocation: "",
    personality: "",
  });
  
  // Soul orb state
  const { 
    startSpeaking, 
    stopSpeaking, 
    speaking, 
    messages, 
    currentMessage,
    stage, 
    setStage 
  } = useSoulOrb();
  
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const goToNextStep = () => {
    stopSpeaking();
    
    if (currentStep === steps.length - 1) {
      // Complete the generation and navigate
      setIsGenerating(true);
    } else if (currentStep === steps.length - 2) {
      // Start the generation process
      setStage('generating');
      setCurrentStep((prev) => prev + 1);
      setCurrentMessageIndex(0);
    } else {
      setCurrentStep((prev) => prev + 1);
      setCurrentMessageIndex(0);
    }
  };

  const goToPrevStep = () => {
    stopSpeaking();
    setCurrentStep((prev) => Math.max(0, prev - 1));
    setCurrentMessageIndex(0);
  };
  
  // Handle orb interaction
  const handleOrbClick = async () => {
    if (speaking) {
      stopSpeaking();
      return;
    }
    
    // Get the correct message key for the current step
    let stepKey = steps[currentStep].toLowerCase().replace(/\s+/g, '');
    const messageKeyMap: Record<string, string> = {
      'welcome': 'welcome',
      'birthdate': 'birthDate',
      'birthtime': 'birthTime',
      'birthlocation': 'birthLocation',
      'personality': 'personality',
      'generating': 'generating'
    };
    const messageKey = messageKeyMap[stepKey] || 'welcome';
    
    // Get messages for this step
    const stepMessages = messages[messageKey] || messages['welcome'];
    
    if (stepMessages && stepMessages[currentMessageIndex]) {
      await startSpeaking(stepMessages[currentMessageIndex]);
      
      // Move to next message if available
      if (currentMessageIndex < stepMessages.length - 1) {
        setCurrentMessageIndex(prev => prev + 1);
      } else {
        // Reset to first message when we've gone through all messages
        setCurrentMessageIndex(0);
      }
    }
  };
  
  // Update stage based on current step
  useEffect(() => {
    let stepKey = steps[currentStep].toLowerCase().replace(/\s+/g, '');
    
    // Map the step keys to message keys
    const messageKeyMap: Record<string, string> = {
      'welcome': 'welcome',
      'birthdate': 'birthDate',
      'birthtime': 'birthTime',
      'birthlocation': 'birthLocation',
      'personality': 'personality',
      'generating': 'generating'
    };
    
    // Get the correct message key from our map
    const messageKey = messageKeyMap[stepKey] || 'welcome';
    
    if (messageKey === 'generating') {
      setStage('generating');
    } else if (messageKey === 'welcome') {
      setStage('welcome');
    } else {
      setStage('collecting');
    }
    
    // Auto-start speaking when changing steps
    const stepMessages = messages[messageKey] || messages['welcome'];
    if (stepMessages && stepMessages[0]) {
      startSpeaking(stepMessages[0]);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);
  
  // Handle blueprint generation completion
  const handleBlueprintComplete = () => {
    setStage('complete');
    startSpeaking(messages.complete[0]).then(() => {
      toast({
        title: "Blueprint generated!",
        description: "Your Soul Blueprint has been created successfully.",
      });
      navigate("/blueprint");
    });
  };

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

  return (
    <MainLayout hideNav>
      <StarField />
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

        {/* Soul Orb (floating above content) */}
        <div className="relative z-10 mb-4">
          <div className="flex justify-center">
            <div className="relative">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
              >
                <SoulOrb 
                  size="md" 
                  speaking={speaking}
                  stage={stage}
                  onClick={handleOrbClick}
                />
              </motion.div>
              
              {currentMessage && showSpeechBubble && (
                <SpeechBubble position="bottom" className="w-80">
                  {currentMessage}
                </SpeechBubble>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center">
          <CosmicCard className="w-full max-w-md" floating>
            <div className="space-y-6">{renderStepContent()}</div>

            {currentStep !== steps.length - 1 && (
              <div className="mt-8 flex justify-between">
                <Button
                  variant="ghost"
                  onClick={goToPrevStep}
                  disabled={currentStep === 0}
                  className="flex items-center"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <GradientButton onClick={goToNextStep} className="flex items-center">
                  {currentStep === steps.length - 2 ? "Generate Blueprint" : "Continue"}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </GradientButton>
              </div>
            )}
          </CosmicCard>
        </div>
      </div>
    </MainLayout>
  );
};

export default Onboarding;
