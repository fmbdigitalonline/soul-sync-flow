
import React, { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  text: string;
  isStreaming: boolean;
  speed?: number;
  onComplete?: () => void;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({ 
  text, 
  isStreaming, 
  speed = 25, // Much faster default - was 75
  onComplete
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const targetTextRef = useRef(text);
  const completedRef = useRef(false);

  // Update target text when prop changes
  useEffect(() => {
    targetTextRef.current = text;
    completedRef.current = false;
  }, [text]);

  // Fast typewriter animation with minimal pauses
  useEffect(() => {
    const targetText = targetTextRef.current;
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If we need to add more characters
    if (currentIndex < targetText.length) {
      const char = targetText[currentIndex];
      
      // Calculate delay - much faster with minimal punctuation delays
      let delay = speed;
      if (char === '.' || char === '!' || char === '?') {
        delay = speed * 1.5; // Reduced from 4x to 1.5x
      } else if (char === ',' || char === ';' || char === ':') {
        delay = speed * 1.2; // Reduced from 2.5x to 1.2x
      } else if (char === ' ') {
        delay = speed * 0.8; // Keep space speed
      } else if (char === '\n') {
        delay = speed * 1.3; // Reduced from 3x to 1.3x
      }
      
      timeoutRef.current = setTimeout(() => {
        setDisplayText(targetText.slice(0, currentIndex + 1));
        setCurrentIndex(prev => prev + 1);
      }, delay);
    } else if (!completedRef.current && !isStreaming) {
      // Animation complete - immediate callback
      completedRef.current = true;
      if (onComplete) {
        setTimeout(onComplete, 100); // Reduced from 300ms to 100ms
      }
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, speed, isStreaming, onComplete]);

  // Reset animation when text changes significantly (new message)
  useEffect(() => {
    const targetText = targetTextRef.current;
    
    // If text is completely different (new message), restart animation
    if (!displayText || !targetText.startsWith(displayText.slice(0, Math.min(displayText.length, 20)))) {
      setDisplayText('');
      setCurrentIndex(0);
      completedRef.current = false;
    }
    // If text just got longer (streaming), continue from current position
    else if (targetText.length > displayText.length) {
      // Animation will continue from current index
    }
  }, [text]);

  return (
    <div className="text-sm leading-relaxed whitespace-pre-wrap text-left">
      {displayText}
      {(isStreaming || currentIndex < targetTextRef.current.length) && (
        <span className="inline-block w-1 h-4 bg-soul-purple/70 ml-1 animate-pulse" />
      )}
    </div>
  );
};
