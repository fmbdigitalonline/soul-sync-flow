import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IntelligentSoulOrb } from '@/components/ui/intelligent-soul-orb';
import { SpeechBubble } from '@/components/ui/speech-bubble';
import { useStreamingMessage } from '@/hooks/use-streaming-message';
import { cn } from '@/lib/utils';

interface LifeClarityGuideProps {
  currentStep: number;
  totalSteps: number;
  funnelData: any;
  isStepValid: boolean;
  className?: string;
}

interface GuideMessage {
  welcome: string;
  guidance: string;
  encouragement?: string;
  completion?: string;
}

export const LifeClarityGuide: React.FC<LifeClarityGuideProps> = ({
  currentStep,
  totalSteps,
  funnelData,
  isStepValid,
  className
}) => {
  const [showBubble, setShowBubble] = useState(false);
  const [orbStage, setOrbStage] = useState<"welcome" | "collecting" | "generating" | "complete">("welcome");
  const [isThinking, setIsThinking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageType, setMessageType] = useState<'welcome' | 'guidance' | 'encouragement' | 'completion'>('welcome');
  
  const { streamingContent, isStreaming, streamText, resetStreaming } = useStreamingMessage();
  
  // Progress calculation
  const progress = Math.min((currentStep / totalSteps) * 100, 100);
  
  // Step-specific messages
  const stepMessages: Record<number, GuideMessage> = {
    1: {
      welcome: "Welcome! I'm here to guide you through your life clarity journey. Let's start by understanding what's challenging you most right now.",
      guidance: "Take your time to reflect on what's really frustrating you. There's no wrong answer - this is about your authentic experience.",
      encouragement: "Great choice! Understanding your main challenge is the first step toward transformation."
    },
    2: {
      welcome: "Now let's explore how satisfied you feel across different areas of your life. This helps us see the bigger picture.",
      guidance: "Rate honestly - low scores aren't bad, they just show where growth opportunities exist. You need at least 3 areas rated to continue.",
      encouragement: "Excellent self-awareness! These ratings help us understand your unique situation."
    },
    3: {
      welcome: "Everyone approaches change differently. Let's discover your natural transformation style.",
      guidance: "Think about how you've successfully made changes before. What approach feels most natural to you?",
      encouragement: "Perfect! Knowing your change style helps us tailor the right approach for you."
    },
    4: {
      welcome: "Understanding what you've tried before helps us build on your experience and avoid repeating what didn't work.",
      guidance: "Be honest about your journey - every attempt teaches us something valuable about what works for you.",
      encouragement: "Thank you for sharing your journey. Every experience brings valuable insights."
    },
    5: {
      welcome: "Finally, let's explore your vision of transformation. What would your ideal life look like?",
      guidance: "Paint a vivid picture of your transformed life. The more specific and emotional, the more powerful your blueprint becomes.",
      completion: "Wonderful! Your vision is the compass that will guide your transformation. Your personalized Life Clarity Report is ready!"
    }
  };

  // Auto-show welcome message when step changes
  useEffect(() => {
    if (stepMessages[currentStep]) {
      setOrbStage("welcome");
      setIsThinking(false);
      
      // Small delay for smooth transition
      setTimeout(() => {
        showMessage('welcome');
      }, 500);
    }
  }, [currentStep]);

  // React to step completion
  useEffect(() => {
    if (isStepValid && messageType === 'guidance') {
      setOrbStage("collecting");
      setIsThinking(true);
      
      setTimeout(() => {
        setIsThinking(false);
        if (currentStep === totalSteps) {
          showMessage('completion');
          setOrbStage("complete");
        } else {
          showMessage('encouragement');
        }
      }, 1500);
    }
  }, [isStepValid, messageType, currentStep, totalSteps]);

  const showMessage = useCallback((type: 'welcome' | 'guidance' | 'encouragement' | 'completion') => {
    const message = stepMessages[currentStep];
    if (!message) return;

    setMessageType(type);
    resetStreaming();
    
    let text = '';
    switch (type) {
      case 'welcome':
        text = message.welcome;
        break;
      case 'guidance':
        text = message.guidance;
        break;
      case 'encouragement':
        text = message.encouragement || '';
        break;
      case 'completion':
        text = message.completion || '';
        break;
    }

    if (text) {
      setCurrentMessage(text);
      setShowBubble(true);
      streamText(text, 60); // Slower, more thoughtful speed
    }
  }, [currentStep, stepMessages, resetStreaming, streamText]);

  const handleOrbClick = useCallback(() => {
    if (isStreaming) return;

    // If no bubble showing, show guidance
    if (!showBubble) {
      showMessage('guidance');
      return;
    }

    // If showing welcome, advance to guidance
    if (messageType === 'welcome') {
      showMessage('guidance');
      return;
    }

    // If showing guidance and step is complete, show encouragement
    if (messageType === 'guidance' && isStepValid) {
      showMessage('encouragement');
      return;
    }

    // Close bubble
    setShowBubble(false);
  }, [isStreaming, showBubble, messageType, isStepValid, showMessage]);

  const handleBubbleClick = useCallback(() => {
    if (!isStreaming) {
      setShowBubble(false);
    }
  }, [isStreaming]);

  // Auto-hide encouragement messages after delay
  useEffect(() => {
    if (messageType === 'encouragement' && !isStreaming) {
      const timer = setTimeout(() => {
        setShowBubble(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [messageType, isStreaming]);

  return (
    <div className={cn("fixed top-6 right-6 z-50", className)}>
      <div className="flex items-start gap-4">
        {/* Speech bubble on the left side */}
        <AnimatePresence>
          {showBubble && currentMessage && (
            <motion.div 
              onClick={handleBubbleClick}
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              transition={{ duration: 0.3 }}
              className="cursor-pointer"
            >
              <div className={cn(
                "relative w-64 max-w-sm px-4 py-3 cosmic-card",
                "before:content-[''] before:absolute before:right-[-8px] before:top-1/2 before:-translate-y-1/2",
                "before:w-0 before:h-0 before:border-[8px] before:border-transparent before:border-l-card"
              )}>
                <div className="text-sm leading-relaxed text-foreground">
                  {isStreaming ? streamingContent : currentMessage}
                  {isStreaming && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="ml-1"
                    >
                      ▊
                    </motion.span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orb on the right side */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex-shrink-0"
        >
          <IntelligentSoulOrb
            speaking={isStreaming}
            pulse={!isStreaming}
            size="lg"
            stage={orbStage}
            onClick={handleOrbClick}
            intelligenceLevel={progress}
            showProgressRing={true}
            isThinking={isThinking}
            className="cursor-pointer shadow-lg hover:shadow-xl transition-shadow duration-300"
          />
          
          {/* Step indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
          >
            {currentStep}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};