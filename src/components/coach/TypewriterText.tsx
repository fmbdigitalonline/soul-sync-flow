
import React, { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  text: string;
  isStreaming: boolean;
  speed?: number;
  onComplete?: () => void;
  messageId?: string;
  onStreamingComplete?: (messageId: string) => void;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({ 
  text, 
  isStreaming, 
  speed = 75, // Slower default for more feeling
  onComplete,
  messageId,
  onStreamingComplete
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

  // Slow, rhythmic typewriter animation with natural pauses
  useEffect(() => {
    const targetText = targetTextRef.current;
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If we need to add more characters
    if (currentIndex < targetText.length) {
      const char = targetText[currentIndex];
      
      // Calculate delay based on character for natural rhythm
      let delay = speed;
      if (char === '.' || char === '!' || char === '?') {
        delay = speed * 4; // Long pause after sentences - creates anticipation
      } else if (char === ',' || char === ';' || char === ':') {
        delay = speed * 2.5; // Medium pause after clauses
      } else if (char === ' ') {
        delay = speed * 0.7; // Slightly faster for spaces
      } else if (char === '\n') {
        delay = speed * 3; // Pause for line breaks
      }
      
      timeoutRef.current = setTimeout(() => {
        setDisplayText(targetText.slice(0, currentIndex + 1));
        setCurrentIndex(prev => prev + 1);
      }, delay);
    } else if (!completedRef.current && !isStreaming) {
      // Animation complete
      completedRef.current = true;
      if (onComplete) {
        setTimeout(onComplete, 300); // Small delay before calling complete
      }
      // Call streaming complete callback for message tracking
      if (messageId && onStreamingComplete) {
        setTimeout(() => onStreamingComplete(messageId), 300);
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
