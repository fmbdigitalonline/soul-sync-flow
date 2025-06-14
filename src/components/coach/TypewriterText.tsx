
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

  useEffect(() => {
    // Always show the current streaming text immediately
    setDisplayText(text);
  }, [text]);

  return (
    <div className="text-sm leading-relaxed whitespace-pre-wrap">
      {displayText}
      {isStreaming && (
        <span className="inline-block w-1 h-4 bg-soul-purple/60 ml-1 animate-pulse" />
      )}
    </div>
  );
};
