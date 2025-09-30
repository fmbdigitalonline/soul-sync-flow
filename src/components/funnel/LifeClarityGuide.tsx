import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IntelligentSoulOrb } from '@/components/ui/intelligent-soul-orb';
import { SpeechBubble } from '@/components/ui/speech-bubble';
import { useStreamingMessage } from '@/hooks/use-streaming-message';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface LifeClarityGuideProps {
  currentStep: number;
  totalSteps: number;
  funnelData: any;
  isStepValid: boolean;
  className?: string;
  onIntroComplete: () => void;
  guideIntroComplete: boolean;
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
  className,
  onIntroComplete,
  guideIntroComplete
}) => {
  const [showBubble, setShowBubble] = useState(false);
  const [orbStage, setOrbStage] = useState<"welcome" | "collecting" | "generating" | "complete">("welcome");
  const [isThinking, setIsThinking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageType, setMessageType] = useState<'welcome' | 'guidance' | 'encouragement' | 'completion'>('welcome');
  
  const { streamingContent, isStreaming, streamText, resetStreaming } = useStreamingMessage();
  const { t } = useLanguage();
  
  // Progress calculation
  const progress = Math.min((currentStep / totalSteps) * 100, 100);
  
  // Step-specific messages using translations
  const stepMessages: Record<number, GuideMessage> = {
    1: {
      welcome: t('funnelGuide.step1.welcome'),
      guidance: t('funnelGuide.step1.guidance'),
      encouragement: t('funnelGuide.step1.encouragement')
    },
    2: {
      welcome: t('funnelGuide.step2.welcome'),
      guidance: t('funnelGuide.step2.guidance'),
      encouragement: t('funnelGuide.step2.encouragement')
    },
    3: {
      welcome: t('funnelGuide.step3.welcome'),
      guidance: t('funnelGuide.step3.guidance'),
      encouragement: t('funnelGuide.step3.encouragement')
    },
    4: {
      welcome: t('funnelGuide.step4.welcome'),
      guidance: t('funnelGuide.step4.guidance'),
      encouragement: t('funnelGuide.step4.encouragement')
    },
    5: {
      welcome: t('funnelGuide.step5.welcome'),
      guidance: t('funnelGuide.step5.guidance'),
      completion: t('funnelGuide.step5.completion')
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

  // Auto-progress through messages: welcome → guidance → intro complete
  useEffect(() => {
    if (messageType === 'welcome' && !isStreaming && showBubble) {
      const timer = setTimeout(() => {
        showMessage('guidance');
      }, 1500); // Show guidance after welcome
      return () => clearTimeout(timer);
    }
  }, [messageType, isStreaming, showBubble, showMessage]);

  // Complete intro after guidance message is shown
  useEffect(() => {
    if (messageType === 'guidance' && !isStreaming && showBubble) {
      const timer = setTimeout(() => {
        onIntroComplete();
      }, 1000); // Complete intro after guidance is shown
      return () => clearTimeout(timer);
    }
  }, [messageType, isStreaming, showBubble, onIntroComplete]);

  const handleOrbClick = useCallback(() => {
    if (isStreaming) return;

    // If showing welcome and guide intro not complete, complete it immediately
    if (messageType === 'welcome' && !guideIntroComplete) {
      onIntroComplete();
      return;
    }

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
  }, [isStreaming, showBubble, messageType, isStepValid, showMessage, guideIntroComplete, onIntroComplete]);

  const handleBubbleClick = useCallback(() => {
    if (!isStreaming) {
      if (messageType === 'welcome' && !guideIntroComplete) {
        onIntroComplete();
      } else {
        setShowBubble(false);
      }
    }
  }, [isStreaming, messageType, guideIntroComplete, onIntroComplete]);

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
    <div className={cn("fixed top-6 right-2 sm:right-6 z-50", className)}>
      <div className="flex items-start gap-2 sm:gap-4">
        {/* Speech bubble on the left side */}
        <AnimatePresence>
          {showBubble && currentMessage && (
            <motion.div 
              onClick={handleBubbleClick}
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                x: 0,
              }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              transition={{ duration: 0.3 }}
              className="cursor-pointer"
            >
              <motion.div 
                animate={messageType === 'welcome' || messageType === 'encouragement' ? {
                  scale: [1, 1.02, 1],
                  boxShadow: [
                    "0 4px 20px rgba(var(--primary), 0.1)",
                    "0 6px 30px rgba(var(--primary), 0.2)",
                    "0 4px 20px rgba(var(--primary), 0.1)"
                  ]
                } : {}}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                className={cn(
                  "relative w-56 sm:w-72 md:w-80 px-4 sm:px-5 py-3 sm:py-4",
                  "cosmic-card shadow-soul-glow border-2",
                  messageType === 'welcome' && "border-primary/30 bg-gradient-to-br from-card via-card to-primary/5",
                  messageType === 'guidance' && "border-accent/30 bg-gradient-to-br from-card via-card to-accent/5",
                  messageType === 'encouragement' && "border-success/30 bg-gradient-to-br from-card via-card to-success/5",
                  messageType === 'completion' && "border-soul-glow/30 bg-gradient-to-br from-card via-card to-soul-glow/5",
                  "before:content-[''] before:absolute before:right-[-8px] sm:before:right-[-10px] before:top-1/2 before:-translate-y-1/2",
                  "before:w-0 before:h-0 before:border-[8px] sm:before:border-[10px] before:border-transparent before:border-l-card"
                )}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  {/* Contextual icon */}
                  <motion.span 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="text-lg sm:text-xl flex-shrink-0 mt-0.5"
                  >
                    {messageType === 'welcome' && '✨'}
                    {messageType === 'guidance' && '💫'}
                    {messageType === 'encouragement' && '🎯'}
                    {messageType === 'completion' && '🌟'}
                  </motion.span>
                  
                  <div className="text-sm sm:text-base md:text-lg leading-6 sm:leading-7 font-medium text-foreground flex-1">
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
            size="md"
            stage={orbStage}
            onClick={handleOrbClick}
            intelligenceLevel={progress}
            showProgressRing={false}
            isThinking={isThinking}
            className="cursor-pointer shadow-lg hover:shadow-xl transition-shadow duration-300"
          />
          
          {/* Step indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center"
          >
            {currentStep}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};