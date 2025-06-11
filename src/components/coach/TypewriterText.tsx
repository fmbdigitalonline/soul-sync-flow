
import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  isStreaming: boolean;
  speed?: number;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({ 
  text, 
  isStreaming, 
  speed = 30 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // If streaming and we have new content, show it immediately
    if (isStreaming) {
      setDisplayText(text);
      setCurrentIndex(text.length);
    } else if (!isStreaming && text !== displayText) {
      // Only do typewriter effect when streaming is complete and text is different
      if (currentIndex < text.length) {
        const timer = setTimeout(() => {
          setDisplayText(text.slice(0, currentIndex + 1));
          setCurrentIndex(prev => prev + 1);
        }, speed);

        return () => clearTimeout(timer);
      }
    }
  }, [text, isStreaming, currentIndex, speed, displayText]);

  useEffect(() => {
    // Reset when starting new message
    if (text.length === 0) {
      setDisplayText('');
      setCurrentIndex(0);
    }
  }, [text]);

  return (
    <div className="text-sm leading-relaxed whitespace-pre-wrap">
      {displayText}
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-soul-purple/60 ml-1 animate-pulse" />
      )}
    </div>
  );
};
