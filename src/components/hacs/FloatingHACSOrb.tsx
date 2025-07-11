import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IntelligentSoulOrb } from '@/components/ui/intelligent-soul-orb';
import { SpeechBubble } from '@/components/ui/speech-bubble';
import { useHacsIntelligence } from '@/hooks/use-hacs-intelligence';
import { useHACSMicroLearning } from '@/hooks/use-hacs-micro-learning';
import { HACSMicroLearning } from './HACSMicroLearning';
import { HACSChatOverlay } from './HACSChatOverlay';
import { cn } from '@/lib/utils';

interface FloatingHACSProps {
  className?: string;
}

export const FloatingHACSOrb: React.FC<FloatingHACSProps> = ({ className }) => {
  const [showBubble, setShowBubble] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showMicroLearning, setShowMicroLearning] = useState(false);
  const [orbStage, setOrbStage] = useState<"welcome" | "collecting" | "generating" | "complete">("welcome");
  const [activeModule, setActiveModule] = useState<string | undefined>();
  const [moduleActivity, setModuleActivity] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  
  const { intelligence, loading, refreshIntelligence } = useHacsIntelligence();
  const { 
    currentQuestion,
    isGenerating,
    generateMicroQuestion,
    clearCurrentQuestion,
    triggerMicroLearning
  } = useHACSMicroLearning();

  console.log('FloatingHACSOrb render:', { loading, intelligence });

  const intelligenceLevel = intelligence?.intelligence_level || 0;

  // Update orb stage based on authentic HACS state
  useEffect(() => {
    if (isGenerating) {
      setOrbStage("generating");
    } else if (currentQuestion) {
      setOrbStage("collecting");
    } else if (intelligenceLevel > 70) {
      setOrbStage("complete");
    } else if (intelligenceLevel > 0) {
      setOrbStage("welcome");
    } else {
      setOrbStage("welcome");
    }
  }, [isGenerating, currentQuestion, intelligenceLevel]);

  // Show speech bubble when there's a current question
  useEffect(() => {
    if (currentQuestion) {
      setShowBubble(true);
      // Auto-dismiss bubble after 15 seconds
      const timer = setTimeout(() => {
        setShowBubble(false);
        clearCurrentQuestion();
      }, 15000);
      return () => clearTimeout(timer);
    } else {
      setShowBubble(false);
    }
  }, [currentQuestion, clearCurrentQuestion]);

  // Authentic micro-learning triggers
  useEffect(() => {
    const learningTimer = setTimeout(() => {
      if (!currentQuestion && !loading && !isGenerating) {
        // Trigger thinking state before generating authentic question
        setIsThinking(true);
        setActiveModule('NIK');
        setModuleActivity(true);
        
        setTimeout(async () => {
          const triggered = await triggerMicroLearning();
          setIsThinking(false);
          setModuleActivity(false);
          
          if (triggered && currentQuestion) {
            setShowBubble(true);
          }
        }, 1500);
      }
    }, 8000); // Less frequent, more thoughtful triggers
    return () => clearTimeout(learningTimer);
  }, [currentQuestion, loading, isGenerating, triggerMicroLearning]);

  // Module activity based on current question
  useEffect(() => {
    if (currentQuestion) {
      setActiveModule(currentQuestion.module);
      setModuleActivity(true);
      
      // Clear module activity after question is processed
      const clearTimer = setTimeout(() => {
        setModuleActivity(false);
        setActiveModule(undefined);
      }, 3000);
      
      return () => clearTimeout(clearTimer);
    }
  }, [currentQuestion]);

  const handleOrbClick = () => {
    if (currentQuestion) {
      setShowMicroLearning(true);
      setShowBubble(false);
    } else {
      setShowChat(true);
    }
  };

  const handleBubbleClick = () => {
    if (currentQuestion) {
      setShowMicroLearning(true);
      setShowBubble(false);
    }
  };

  const handleCloseChat = () => {
    setShowChat(false);
  };

  const handleCloseMicroLearning = () => {
    setShowMicroLearning(false);
    setShowBubble(false);
    clearCurrentQuestion();
  };

  const handleLearningComplete = (growth: number) => {
    // Refresh intelligence data to show updated levels
    refreshIntelligence();
    
    // Show module activity based on growth
    if (growth > 0) {
      setModuleActivity(true);
      setTimeout(() => setModuleActivity(false), 2000);
    }
  };

  console.log('FloatingHACSOrb state:', { loading, intelligence, currentQuestion, showBubble, showChat, showMicroLearning });
  
  // Show a visible debug version when loading
  if (loading) {
    return (
      <div className="fixed bottom-6 right-6 z-50 p-4 bg-red-500 text-white rounded">
        HACS Loading...
      </div>
    );
  }

  return (
    <>
      {/* Fixed positioning container */}
      <div className={cn(
        "fixed bottom-6 right-6 z-50 pointer-events-none",
        className
      )}>
        <div className="relative pointer-events-auto">
          {/* Speech Bubble */}
          <AnimatePresence>
            {showBubble && currentQuestion && (
              <div 
                className="mb-3 cursor-pointer hover:scale-105 transition-transform"
                onClick={handleBubbleClick}
              >
                <SpeechBubble
                  position="top"
                  isVisible={true}
                >
                <div className="text-sm">
                  <div className="font-medium text-primary mb-1">
                    {currentQuestion.module} Learning
                  </div>
                  <div>{currentQuestion.text}</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Click to answer • Quick learning session
                  </div>
                </div>
                </SpeechBubble>
              </div>
            )}
          </AnimatePresence>

          {/* Floating Orb */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer"
          >
            <IntelligentSoulOrb
              size="md"
              stage={orbStage}
              speaking={isGenerating}
              intelligenceLevel={intelligenceLevel}
              showProgressRing={intelligenceLevel > 0}
              showIntelligenceTooltip={false}
              isThinking={isThinking}
              activeModule={activeModule}
              moduleActivity={moduleActivity}
              onClick={handleOrbClick}
              className="shadow-lg hover:shadow-xl transition-shadow"
            />
          </motion.div>

          {/* Pulse indicator for new questions */}
          {currentQuestion && (
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>
      </div>

      {/* Micro Learning Modal */}
      <HACSMicroLearning
        isOpen={showMicroLearning}
        onClose={handleCloseMicroLearning}
        question={currentQuestion || undefined}
        intelligenceLevel={intelligenceLevel}
        onLearningComplete={handleLearningComplete}
      />

      {/* Chat Overlay */}
      <HACSChatOverlay
        isOpen={showChat}
        onClose={handleCloseChat}
        currentMessage={null}
        intelligenceLevel={intelligenceLevel}
      />
    </>
  );
};