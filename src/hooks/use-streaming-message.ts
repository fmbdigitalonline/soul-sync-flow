
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

  // Enhanced streaming with faster, more responsive character-by-character display
  const streamText = useCallback((fullText: string, speed: number = 25) => {
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
          delay = speed * 1.5; // Shorter pause after sentences
        } else if (char === ',' || char === ';') {
          delay = speed * 1.2; // Shorter pause after clauses
        } else if (char === ' ') {
          delay = speed * 0.5; // Faster for spaces
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
    streamText(newContent, 20); // Faster speed for better responsiveness
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
