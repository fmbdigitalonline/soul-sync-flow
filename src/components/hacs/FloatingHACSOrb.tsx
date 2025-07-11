import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IntelligentSoulOrb } from "@/components/ui/intelligent-soul-orb";
import { SpeechBubble } from "@/components/ui/speech-bubble";
import { HACSChatInterface } from "./HACSChatInterface";
import { useHacsIntelligence } from "@/hooks/use-hacs-intelligence.tsx";
import { X, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingHACSOrbProps {
  className?: string;
}

export const FloatingHACSOrb: React.FC<FloatingHACSOrbProps> = ({
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleMessage, setBubbleMessage] = useState("");
  
  const {
    intelligenceLevel,
    activeComponents,
    generateProactiveMessage,
    isProcessing,
    currentInsight
  } = useHacsIntelligence();

  // Handle proactive messages from HACS
  useEffect(() => {
    if (currentInsight && !isExpanded) {
      setBubbleMessage(currentInsight.message);
      setShowBubble(true);
      
      // Auto-hide bubble after 8 seconds
      const timer = setTimeout(() => {
        setShowBubble(false);
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [currentInsight, isExpanded]);

  const handleOrbClick = useCallback(() => {
    if (showBubble) {
      setShowBubble(false);
    }
    setIsExpanded(true);
  }, [showBubble]);

  const handleClose = useCallback(() => {
    setIsExpanded(false);
    setShowBubble(false);
  }, []);

  const handleBubbleClick = useCallback(() => {
    setShowBubble(false);
    setIsExpanded(true);
  }, []);

  // Determine orb stage based on HACS activity
  const getOrbStage = () => {
    if (isProcessing) return "generating";
    if (activeComponents.length > 5) return "complete";
    if (activeComponents.length > 2) return "collecting";
    return "welcome";
  };

  // Determine if orb should pulse based on activity
  const shouldPulse = activeComponents.length > 0 || isProcessing;

  return (
    <>
      {/* Floating Orb Container */}
      <motion.div
        className={cn(
          "fixed bottom-6 right-6 z-50 flex flex-col items-end",
          className
        )}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Speech Bubble */}
        <AnimatePresence>
          {showBubble && bubbleMessage && !isExpanded && (
            <motion.div
              className="mb-3 max-w-xs cursor-pointer"
              onClick={handleBubbleClick}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <SpeechBubble position="top" className="relative">
                <div className="text-sm font-medium text-foreground">
                  {bubbleMessage}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Click to expand • {activeComponents.join(", ")}
                </div>
              </SpeechBubble>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Orb */}
        <motion.div
          className="relative cursor-pointer group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOrbClick}
        >
          <IntelligentSoulOrb
            size="md"
            stage={getOrbStage()}
            pulse={shouldPulse}
            speaking={isProcessing}
            intelligenceLevel={intelligenceLevel}
            showProgressRing={intelligenceLevel > 0}
            showIntelligenceTooltip={false}
            className="transition-all duration-300"
          />
          
          {/* Hover indicator */}
          <motion.div
            className="absolute -inset-2 bg-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            initial={false}
          />
          
          {/* Activity indicator */}
          {activeComponents.length > 0 && (
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Expanded Chat Interface */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />
            
            {/* Chat Interface */}
            <motion.div
              className="fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-background rounded-2xl border border-border shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
                <div className="flex items-center gap-3">
                  <IntelligentSoulOrb
                    size="sm"
                    stage={getOrbStage()}
                    pulse={shouldPulse}
                    speaking={isProcessing}
                    intelligenceLevel={intelligenceLevel}
                    showProgressRing={false}
                  />
                  <div>
                    <h2 className="font-heading font-semibold text-foreground">
                      HACS Intelligence
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {activeComponents.length} components active • Level {Math.round(intelligenceLevel)}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              {/* Chat Content */}
              <div className="flex-1 overflow-hidden">
                <HACSChatInterface
                  onClose={handleClose}
                  initialMessage={currentInsight?.message}
                  activeComponents={activeComponents}
                  intelligenceLevel={intelligenceLevel}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
