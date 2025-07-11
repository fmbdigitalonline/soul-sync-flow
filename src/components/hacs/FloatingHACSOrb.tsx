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
  const [activeModule, setActiveModule] = useState<string | undefined>();
  const [moduleActivity, setModuleActivity] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  
  const { intelligence, loading } = useHacsIntelligence();
  const { 
    currentMessage, 
    isGenerating, 
    acknowledgeMessage, 
    dismissMessage,
    triggerPIEInsight 
  } = useHACSAutonomy();

  console.log('FloatingHACSOrb render:', { loading, intelligence });

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

  // Enhanced autonomous triggers with module activities
  useEffect(() => {
    const demoTimer = setTimeout(() => {
      if (!currentMessage && !loading) {
        // Simulate thinking state before generating insight
        setIsThinking(true);
        setActiveModule('PIE');
        setModuleActivity(true);
        
        setTimeout(() => {
          triggerPIEInsight("Your usage patterns suggest optimal productivity windows");
          setIsThinking(false);
          setModuleActivity(false);
        }, 1500); // Show thinking animation for 1.5s
      }
    }, 3000); // Reduced from 5 seconds to 3 seconds for more frequent activity
    return () => clearTimeout(demoTimer);
  }, [triggerPIEInsight, currentMessage, loading]);

  // Module activity simulation based on HACS state
  useEffect(() => {
    if (currentMessage && !currentMessage.acknowledged) {
      const moduleMap: Record<string, string> = {
        PIE: 'PIE',
        CNR: 'CNR', 
        TMG: 'TMG',
        DPEM: 'DPEM',
        ACS: 'ACS',
        NIK: 'NIK',
        CPSR: 'CPSR',
        TWS: 'TWS',
        HFME: 'HFME',
        BPSC: 'BPSC',
        VFP: 'VFP'
      };
      
      const module = moduleMap[currentMessage.hacsModule] || 'ACS';
      setActiveModule(module);
      setModuleActivity(true);
      
      // Clear module activity after message is processed
      const clearTimer = setTimeout(() => {
        setModuleActivity(false);
        setActiveModule(undefined);
      }, 3000);
      
      return () => clearTimeout(clearTimer);
    }
  }, [currentMessage]);

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

  console.log('FloatingHACSOrb state:', { loading, intelligence, currentMessage, showBubble, showChat });
  
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
              isThinking={isThinking}
              activeModule={activeModule}
              moduleActivity={moduleActivity}
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