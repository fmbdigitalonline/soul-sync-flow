
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

  // Optimized streaming with faster character-by-character display
  const streamText = useCallback((fullText: string, speed: number = 35) => { // Reduced from 75 to 35
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
        
        // Minimal variable speed for natural rhythm
        let delay = speed;
        if (char === '.' || char === '!' || char === '?') {
          delay = speed * 1.5; // Reduced from 3x to 1.5x
        } else if (char === ',' || char === ';') {
          delay = speed * 1.2; // Reduced from 2x to 1.2x
        } else if (char === ' ') {
          delay = speed * 0.9; // Slightly faster for spaces
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
    // Convert chunk-based streaming to character-by-character with faster speed
    const newContent = contentRef.current + chunk;
    streamText(newContent, 25); // Much faster speed - was 60
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
    streamText,
  };
}
