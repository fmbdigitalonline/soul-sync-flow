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
    <div className={cn("fixed top-6 right-2 sm:right-6 z-50", className)}>
      <div className="flex items-start gap-2 sm:gap-4">
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
                "relative w-48 sm:w-64 max-w-sm px-3 sm:px-4 py-2 sm:py-3 cosmic-card",
                "before:content-[''] before:absolute before:right-[-6px] sm:before:right-[-8px] before:top-1/2 before:-translate-y-1/2",
                "before:w-0 before:h-0 before:border-[6px] sm:before:border-[8px] before:border-transparent before:border-l-card"
              )}>
                <div className="text-xs sm:text-sm leading-relaxed text-foreground">
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
            size="md"
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
            className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center"
          >
            {currentStep}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};