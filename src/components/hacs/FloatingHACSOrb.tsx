
import React, { useState, useEffect } from 'react';
import { IntelligentSoulOrb } from '@/components/ui/intelligent-soul-orb';
import { SpeechBubble } from '@/components/ui/speech-bubble';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingHACSOrbProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  staticMessages?: string[];
  showInterval?: number; // milliseconds between messages
}

export const FloatingHACSOrb: React.FC<FloatingHACSOrbProps> = ({
  className,
  position = 'bottom-right',
  staticMessages = [
    "I notice you're exploring your dreams... Would you like some guidance?",
    "Your blueprint suggests you're naturally intuitive - trust that feeling.",
    "Sometimes the best insights come when we pause to reflect.",
    "I'm here if you need personalized guidance on your journey."
  ],
  showInterval = 15000 // 15 seconds
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  // Position classes mapping
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  // Bubble position relative to orb
  const bubblePositions = {
    'bottom-right': 'left',
    'bottom-left': 'right',
    'top-right': 'left',
    'top-left': 'right',
  };

  // Initialize orb visibility
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000); // Appear after 2 seconds

    return () => clearTimeout(timer);
  }, []);

  // Cycle through messages
  useEffect(() => {
    if (!isVisible || staticMessages.length === 0) return;

    const showMessage = () => {
      setCurrentMessage(staticMessages[messageIndex]);
      setShowBubble(true);
      
      // Hide bubble after 5 seconds
      setTimeout(() => {
        setShowBubble(false);
      }, 5000);
      
      // Move to next message
      setMessageIndex((prev) => (prev + 1) % staticMessages.length);
    };

    // Show first message after orb appears
    const initialTimer = setTimeout(showMessage, 1000);
    
    // Then cycle through messages
    const intervalTimer = setInterval(showMessage, showInterval);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [isVisible, messageIndex, staticMessages, showInterval]);

  const handleOrbClick = () => {
    // For now, just show/hide the current message
    setShowBubble(!showBubble);
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      'fixed z-50 pointer-events-none',
      positionClasses[position],
      className
    )}>
      {/* Speech Bubble */}
      <AnimatePresence>
        {showBubble && currentMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute pointer-events-auto"
            style={{
              [position.includes('right') ? 'right' : 'left']: '80px',
              [position.includes('bottom') ? 'bottom' : 'top']: '0px',
            }}
          >
            <SpeechBubble
              position={bubblePositions[position] as any}
              isVisible={true}
              is3D={true}
              className="max-w-xs"
            >
              {currentMessage}
            </SpeechBubble>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Orb */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="pointer-events-auto cursor-pointer"
        onClick={handleOrbClick}
      >
        <IntelligentSoulOrb
          size="md"
          pulse={true}
          speaking={false}
          stage="complete"
          intelligenceLevel={88}
          showProgressRing={true}
          showIntelligenceTooltip={false}
        />
      </motion.div>

      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 to-soul-purple/20 blur-xl -z-10 animate-pulse" />
    </div>
  );
};
