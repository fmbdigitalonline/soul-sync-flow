
import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  isStreaming: boolean;
  speed?: number;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({ 
  text, 
  isStreaming, 
  speed = 15 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isStreaming && currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(text.slice(0, currentIndex + 1));
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (!isStreaming) {
      setDisplayText(text);
      setCurrentIndex(text.length);
    }
  }, [text, isStreaming, currentIndex, speed]);

  useEffect(() => {
    // Reset when starting new message
    if (text.length < displayText.length || (text.length === 0 && displayText.length > 0)) {
      setDisplayText('');
      setCurrentIndex(0);
    }
  }, [text, displayText.length]);

  return (
    <div className="text-sm leading-relaxed whitespace-pre-wrap">
      {displayText}
      {isStreaming && currentIndex >= text.length && text.length > 0 && (
        <span className="inline-block w-2 h-4 bg-soul-purple/60 ml-1 animate-pulse" />
      )}
    </div>
  );
};
