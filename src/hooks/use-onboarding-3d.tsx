import { useState, useEffect } from 'react';
import { useSoulOrb } from '@/contexts/SoulOrbContext';
import { useAnimate } from 'framer-motion';

export const useOnboarding3D = () => {
  const { stage, setStage, startSpeaking, stopSpeaking, speaking, messages } = useSoulOrb();
  const [is3DMode, setIs3DMode] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);
  const [interactionStage, setInteractionStage] = useState<'listening' | 'input'>('listening');
  
  // Add transition states to prevent overlapping
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [cardOpacity, setCardOpacity] = useState(0);
  
  // Animation controls - replacing useAnimation with useAnimate
  const [sceneRef, animate] = useAnimate();
  
  // Steps mapping - corrected step order
  const steps = [
    "Welcome",        // 0
    "Full Name",      // 1
    "Birth Date",     // 2
    "Birth Time",     // 3
    "Birth Location", // 4
    "Personality",    // 5
    "Generating",     // 6
    "Goal Selection", // 7
  ];
  
  // Transition to next step with proper timing
  const goToNextStep = () => {
    // Prevent multiple clicks during transition
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Stop any current speech
    stopSpeaking();
    
    // Fade out the card first
    setCardOpacity(0);
    
    // Animate transition
    animate(sceneRef.current, {
      opacity: [1, 0.5, 1],
      scale: [1, 1.05, 1]
    }, { duration: 0.8 });
    
    // Update step after animation
    setTimeout(() => {
      if (currentStep === steps.length - 1) {
        // Complete onboarding only when we're at the last step (Goal Selection)
        setStage('complete');
      } else {
        // Go to next step
        setCurrentStep((prev) => prev + 1);
        setCurrentMessageIndex(0);
        setInteractionStage('listening'); // Reset to listening stage for the new step
        
        // Set the correct stage based on the new step
        const newStep = currentStep + 1;
        if (newStep === 6) { // Generating step
          setStage('generating');
        } else if (newStep === 7) { // Goal Selection step
          setStage('welcome'); // Use welcome stage for goal selection
        } else {
          setStage('collecting');
        }
      }
      
      // Prevent flickering by waiting until content changes before showing bubble
      setTimeout(() => {
        setShowSpeechBubble(true);
      }, 200);
      
      setIsTransitioning(false);
    }, 600);
  };
  
  // Go to previous step with proper timing
  const goToPrevStep = () => {
    // Prevent multiple clicks during transition
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    stopSpeaking();
    
    // Fade out the card first
    setCardOpacity(0);
    
    // Animate transition
    animate(sceneRef.current, {
      opacity: [1, 0.5, 1],
      scale: [1, 0.95, 1]
    }, { duration: 0.8 });
    
    // Update step after animation
    setTimeout(() => {
      setCurrentStep((prev) => Math.max(0, prev - 1));
      setCurrentMessageIndex(0);
      setInteractionStage('listening'); // Reset to listening stage for the new step
      
      // Prevent flickering by waiting until content changes before showing bubble
      setTimeout(() => {
        setShowSpeechBubble(true);
      }, 200);
      
      setIsTransitioning(false);
    }, 600);
  };
  
  // Switch to input stage after orb finishes speaking or user clicks
  const switchToInputStage = () => {
    if (interactionStage === 'listening' && !isTransitioning) {
      setIsTransitioning(true);
      
      // Hide speech bubble first
      setShowSpeechBubble(false);
      
      // Animate transition to input stage
      animate(sceneRef.current, {
        opacity: [1, 0.9, 1],
      }, { duration: 0.5 });
      
      // Wait for animation to complete before showing the input card
      setTimeout(() => {
        setInteractionStage('input');
        setCardOpacity(1);
        setIsTransitioning(false);
      }, 500);
    }
  };
  
  // Listen again - return to listening stage with proper timing
  const listenAgain = async () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCardOpacity(0);
    
    setTimeout(() => {
      setInteractionStage('listening');
      setShowSpeechBubble(true);
      
      // Get the correct message key for the current step
      let stepKey = steps[currentStep].toLowerCase().replace(/\s+/g, '');
      const messageKeyMap: Record<string, string> = {
        'welcome': 'welcome',
        'fullname': 'welcome', // Map full name to welcome messages
        'birthdate': 'birthDate',
        'birthtime': 'birthTime',
        'birthlocation': 'birthLocation',
        'personality': 'personality',
        'generating': 'generating',
        'goalselection': 'welcome' // Map goal selection to welcome messages
      };
      const messageKey = messageKeyMap[stepKey] || 'welcome';
      
      // Get messages for this step
      const stepMessages = messages[messageKey] || messages['welcome'];
      
      if (stepMessages && stepMessages[0]) {
        startSpeaking(stepMessages[0]);
      }
      
      setIsTransitioning(false);
    }, 400);
  };
  
  // Handle orb interaction with proper timing
  const handleOrbClick = async () => {
    if (isTransitioning) return;
    
    // If speaking, stop speech and move to input stage
    if (speaking) {
      stopSpeaking();
      switchToInputStage();
      return;
    }
    
    // If already in input stage, cycle back to listening
    if (interactionStage === 'input') {
      setIsTransitioning(true);
      setCardOpacity(0);
      
      setTimeout(() => {
        setInteractionStage('listening');
        setShowSpeechBubble(true);
        setIsTransitioning(false);
      }, 400);
    }
    
    // If in listening stage and not currently speaking, advance to input stage
    if (interactionStage === 'listening' && !speaking) {
      switchToInputStage();
      return;
    }
    
    // Get the correct message key for the current step
    let stepKey = steps[currentStep].toLowerCase().replace(/\s+/g, '');
    const messageKeyMap: Record<string, string> = {
      'welcome': 'welcome',
      'fullname': 'welcome', // Map full name to welcome messages
      'birthdate': 'birthDate',
      'birthtime': 'birthTime',
      'birthlocation': 'birthLocation',
      'personality': 'personality',
      'generating': 'generating',
      'goalselection': 'welcome' // Map goal selection to welcome messages
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
    animate(sceneRef.current, {
      opacity: 0,
      scale: 1.5
    }, { duration: 1.5 });
    
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
      'fullname': 'welcome', // Map full name to welcome messages
      'birthdate': 'birthDate',
      'birthtime': 'birthTime',
      'birthlocation': 'birthLocation',
      'personality': 'personality',
      'generating': 'generating',
      'goalselection': 'welcome' // Map goal selection to welcome messages
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
    setCardOpacity(0);
    setShowSpeechBubble(true);
    const stepMessages = messages[messageKey] || messages['welcome'];
    if (stepMessages && stepMessages[0]) {
      startSpeaking(stepMessages[0]);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);
  
  // Auto-switch to input stage when orb stops speaking with delay
  useEffect(() => {
    if (!speaking && interactionStage === 'listening' && !isTransitioning) {
      // Add a delay to make the transition feel more natural
      const timer = setTimeout(() => {
        switchToInputStage();
      }, 800); // Longer delay for better user experience
      
      return () => clearTimeout(timer);
    }
  }, [speaking, interactionStage, isTransitioning]);
  
  return {
    is3DMode,
    currentStep,
    steps,
    showSpeechBubble,
    sceneRef,
    animate,
    stage,
    speaking,
    interactionStage,
    isTransitioning,
    cardOpacity,
    goToNextStep,
    goToPrevStep,
    handleOrbClick,
    transitionTo2D,
    setShowSpeechBubble,
    switchToInputStage,
    listenAgain
  };
};
