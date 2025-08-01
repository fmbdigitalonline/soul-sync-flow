import React from 'react';
import { motion } from 'framer-motion';

interface ThinkingDotsProps {
  className?: string;
  isThinking?: boolean;
}

export const ThinkingDots: React.FC<ThinkingDotsProps> = ({ 
  className = "",
  isThinking = false 
}) => {
  // Steady thinking animation - not synced to character timing
  const dotVariants = {
    thinking: {
      opacity: [0.4, 1, 0.4],
      scale: [1, 1.2, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    idle: {
      opacity: 0.4,
      scale: 1
    }
  };

  if (!isThinking) return null;

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <motion.div 
        className="w-1 h-1 bg-muted-foreground rounded-full"
        variants={dotVariants}
        animate="thinking"
        transition={{ delay: 0 }}
      />
      <motion.div 
        className="w-1 h-1 bg-muted-foreground rounded-full"
        variants={dotVariants}
        animate="thinking"
        transition={{ delay: 0.5 }}
      />
      <motion.div 
        className="w-1 h-1 bg-muted-foreground rounded-full"
        variants={dotVariants}
        animate="thinking"
        transition={{ delay: 1 }}
      />
    </div>
  );
};