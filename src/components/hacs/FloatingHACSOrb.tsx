import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IntelligentSoulOrb } from '@/components/ui/intelligent-soul-orb';
import { SpeechBubble } from '@/components/ui/speech-bubble';
import { useHacsIntelligence } from '@/hooks/use-hacs-intelligence';
import { useHACSAutonomy, type HACSMessage } from '@/hooks/use-hacs-autonomy';
import { HACSChatOverlay } from './HACSChatOverlay';
import { cn } from '@/lib/utils';

interface FloatingHACSProps {
  className?: string;
}

export const FloatingHACSOrb: React.FC<FloatingHACSProps> = ({ className }) => {
  const [showBubble, setShowBubble] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [orbStage, setOrbStage] = useState<"welcome" | "collecting" | "generating" | "complete">("welcome");
  
  const { intelligence, loading } = useHacsIntelligence();
  const { 
    currentMessage, 
    isGenerating, 
    acknowledgeMessage, 
    dismissMessage,
    triggerPIEInsight 
  } = useHACSAutonomy();

  const intelligenceLevel = intelligence?.intelligence_level || 0;

  // Update orb stage based on HACS state
  useEffect(() => {
    if (isGenerating) {
      setOrbStage("generating");
    } else if (currentMessage && !currentMessage.acknowledged) {
      setOrbStage("complete");
    } else if (intelligenceLevel > 70) {
      setOrbStage("complete");
    } else {
      setOrbStage("welcome");
    }
  }, [isGenerating, currentMessage, intelligenceLevel]);

  // Show speech bubble when there's a current message
  useEffect(() => {
    if (currentMessage && !currentMessage.acknowledged) {
      setShowBubble(true);
      // Auto-dismiss bubble after 10 seconds for quick bubbles
      if (currentMessage.messageType === 'quick_bubble') {
        const timer = setTimeout(() => {
          setShowBubble(false);
          acknowledgeMessage(currentMessage.id);
        }, 10000);
        return () => clearTimeout(timer);
      }
    } else {
      setShowBubble(false);
    }
  }, [currentMessage, acknowledgeMessage]);

  // Demo trigger - can be removed in production
  useEffect(() => {
    const demoTimer = setTimeout(() => {
      if (!currentMessage && !loading) {
        triggerPIEInsight("Regular usage detected");
      }
    }, 5000);
    return () => clearTimeout(demoTimer);
  }, [triggerPIEInsight, currentMessage, loading]);

  const handleOrbClick = () => {
    if (currentMessage && !currentMessage.acknowledged) {
      if (currentMessage.messageType === 'quick_bubble') {
        acknowledgeMessage(currentMessage.id);
        setShowBubble(false);
      } else {
        setShowChat(true);
      }
    } else {
      setShowChat(true);
    }
  };

  const handleBubbleClick = () => {
    if (currentMessage) {
      if (currentMessage.messageType === 'quick_bubble') {
        acknowledgeMessage(currentMessage.id);
        setShowBubble(false);
      } else {
        setShowChat(true);
      }
    }
  };

  const handleCloseChat = () => {
    setShowChat(false);
    if (currentMessage && !currentMessage.acknowledged) {
      acknowledgeMessage(currentMessage.id);
    }
  };

  if (loading) return null;

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
            {showBubble && currentMessage && (
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
                    {currentMessage.hacsModule}
                  </div>
                  <div>{currentMessage.text}</div>
                  {currentMessage.messageType !== 'quick_bubble' && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Click to expand
                    </div>
                  )}
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
              onClick={handleOrbClick}
              className="shadow-lg hover:shadow-xl transition-shadow"
            />
          </motion.div>

          {/* Pulse indicator for new messages */}
          {currentMessage && !currentMessage.acknowledged && (
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>
      </div>

      {/* Chat Overlay */}
      <HACSChatOverlay
        isOpen={showChat}
        onClose={handleCloseChat}
        currentMessage={currentMessage}
        intelligenceLevel={intelligenceLevel}
      />
    </>
  );
};