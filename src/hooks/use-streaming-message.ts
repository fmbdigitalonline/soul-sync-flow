
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

  // Enhanced streaming with companion-like character display
  const streamText = useCallback((fullText: string, speed: number = 65) => {
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
        
        // Natural companion rhythm with soul orb personality
        let delay = speed;
        if (char === '.' || char === '!' || char === '?') {
          delay = speed * 3.5; // Thoughtful pause after thoughts
        } else if (char === ',' || char === ';') {
          delay = speed * 2.2; // Gentle pause for breath
        } else if (char === ' ') {
          delay = speed * 0.7; // Quick space flow
        } else if (char === '\n') {
          delay = speed * 4; // Pause between lines
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
    // Convert chunk-based streaming to character-by-character with soul orb feel
    const newContent = contentRef.current + chunk;
    streamText(newContent, 55); // Gentle speed for soul conversations
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

  const instantComplete = useCallback((fullText: string) => {
    resetStreaming();
    setStreamingContent(fullText);
    contentRef.current = fullText;
  }, [resetStreaming]);

  return {
    streamingContent,
    isStreaming,
    addStreamingChunk,
    startStreaming,
    completeStreaming,
    resetStreaming,
    streamText,
    instantComplete
  };
}
