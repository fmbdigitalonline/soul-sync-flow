
import { useState, useEffect } from 'react';
import { useSoulOrb } from '@/contexts/SoulOrbContext';
import { motion, useAnimation } from '@/lib/framer-motion';

export const useOnboarding3D = () => {
  const { stage, setStage, startSpeaking, stopSpeaking, speaking, messages } = useSoulOrb();
  const [is3DMode, setIs3DMode] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);
  
  // Animation controls
  const sceneControls = useAnimation();
  
  // Steps mapping
  const steps = [
    "Welcome",
    "Birth Date",
    "Birth Time",
    "Birth Location",
    "Personality",
    "Generating",
  ];
  
  // Transition to next step
  const goToNextStep = () => {
    // Stop any current speech
    stopSpeaking();
    
    // Animate transition
    sceneControls.start({
      opacity: [1, 0.5, 1],
      scale: [1, 1.05, 1],
      transition: { duration: 0.8 }
    });
    
    // Update step after animation
    setTimeout(() => {
      if (currentStep === steps.length - 1) {
        // Complete onboarding
        setStage('complete');
      } else if (currentStep === steps.length - 2) {
        // Start generation process
        setStage('generating');
        setCurrentStep((prev) => prev + 1);
        setCurrentMessageIndex(0);
      } else {
        // Go to next step
        setCurrentStep((prev) => prev + 1);
        setCurrentMessageIndex(0);
      }
    }, 400);
  };
  
  // Go to previous step
  const goToPrevStep = () => {
    stopSpeaking();
    
    // Animate transition
    sceneControls.start({
      opacity: [1, 0.5, 1],
      scale: [1, 0.95, 1],
      transition: { duration: 0.8 }
    });
    
    // Update step after animation
    setTimeout(() => {
      setCurrentStep((prev) => Math.max(0, prev - 1));
      setCurrentMessageIndex(0);
    }, 400);
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
  
  // Transition to 2D view after onboarding completion
  const transitionTo2D = () => {
    sceneControls.start({
      opacity: 0,
      scale: 1.5,
      transition: { duration: 1.5 }
    });
    
    setTimeout(() => {
      setIs3DMode(false);
    }, 1500);
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
  
  return {
    is3DMode,
    currentStep,
    steps,
    showSpeechBubble,
    sceneControls,
    stage,
    speaking,
    goToNextStep,
    goToPrevStep,
    handleOrbClick,
    transitionTo2D,
    setShowSpeechBubble
  };
};
