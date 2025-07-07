
import { useState, useCallback, useRef } from 'react';

export function useStreamingMessage() {
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const contentRef = useRef('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startStreaming = useCallback(() => {
    setIsStreaming(true);
    setStreamingContent('');
    contentRef.current = '';
  }, []);

  // Enhanced streaming with slow, rhythmic character-by-character display
  const streamText = useCallback((fullText: string, speed: number = 75) => {
    setIsStreaming(true);
    contentRef.current = '';
    setStreamingContent('');
    
    let currentIndex = 0;
    
    const typeNextCharacter = () => {
      if (currentIndex < fullText.length) {
        const char = fullText[currentIndex];
        contentRef.current += char;
        setStreamingContent(contentRef.current);
        currentIndex++;
        
        // Variable speed based on punctuation for natural rhythm
        let delay = speed;
        if (char === '.' || char === '!' || char === '?') {
          delay = speed * 3; // Longer pause after sentences
        } else if (char === ',' || char === ';') {
          delay = speed * 2; // Medium pause after clauses
        } else if (char === ' ') {
          delay = speed * 0.8; // Slightly faster for spaces
        }
        
        intervalRef.current = setTimeout(typeNextCharacter, delay);
      } else {
        setIsStreaming(false);
        if (intervalRef.current) {
          clearTimeout(intervalRef.current);
        }
      }
    };
    
    typeNextCharacter();
  }, []);

  const addStreamingChunk = useCallback((chunk: string) => {
    // Convert chunk-based streaming to character-by-character
    const newContent = contentRef.current + chunk;
    streamText(newContent, 60); // Slower speed for growth conversations
  }, [streamText]);

  const completeStreaming = useCallback(() => {
    setIsStreaming(false);
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
  }, []);

  const resetStreaming = useCallback(() => {
    setIsStreaming(false);
    setStreamingContent('');
    contentRef.current = '';
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
  }, []);

  return {
    streamingContent,
    isStreaming,
    addStreamingChunk,
    startStreaming,
    completeStreaming,
    resetStreaming,
    streamText, // New method for direct text streaming
  };
}
