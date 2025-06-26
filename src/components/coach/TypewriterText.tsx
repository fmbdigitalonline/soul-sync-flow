
import React, { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  text: string;
  isStreaming: boolean;
  speed?: number;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({ 
  text, 
  isStreaming, 
  speed = 50 // Slower default speed (50ms per character)
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const targetTextRef = useRef(text);

  // Update target text when prop changes
  useEffect(() => {
    targetTextRef.current = text;
  }, [text]);

  // Typewriter animation effect
  useEffect(() => {
    const targetText = targetTextRef.current;
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If we need to add more characters
    if (currentIndex < targetText.length) {
      timeoutRef.current = setTimeout(() => {
        setDisplayText(targetText.slice(0, currentIndex + 1));
        setCurrentIndex(prev => prev + 1);
      }, speed);
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, speed]);

  // Reset animation when text changes significantly (new message)
  useEffect(() => {
    const targetText = targetTextRef.current;
    
    // If text is completely different (new message), restart animation
    if (!displayText || !targetText.startsWith(displayText.slice(0, displayText.length - 10))) {
      setDisplayText('');
      setCurrentIndex(0);
    }
    // If text just got longer (streaming), continue from current position
    else if (targetText.length > displayText.length) {
      // Animation will continue from current index
    }
  }, [text]);

  // Speed up completion when streaming stops
  useEffect(() => {
    if (!isStreaming && currentIndex < targetTextRef.current.length) {
      // Faster completion when streaming stops
      const remainingText = targetTextRef.current;
      const fastSpeed = Math.min(speed / 3, 20); // Much faster completion
      
      const completeAnimation = () => {
        if (currentIndex < remainingText.length) {
          setDisplayText(remainingText.slice(0, currentIndex + 1));
          setCurrentIndex(prev => prev + 1);
          
          timeoutRef.current = setTimeout(completeAnimation, fastSpeed);
        }
      };
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(completeAnimation, fastSpeed);
    }
  }, [isStreaming, currentIndex, speed]);

  return (
    <div className="text-sm leading-relaxed whitespace-pre-wrap text-left">
      {displayText}
      {isStreaming && (
        <span className="inline-block w-1 h-4 bg-soul-purple/60 ml-1 animate-pulse" />
      )}
    </div>
  );
};
