
import { useState, useCallback, useRef } from 'react';

export function useStreamingMessage() {
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const contentRef = useRef('');

  const startStreaming = useCallback(() => {
    setIsStreaming(true);
    setStreamingContent('');
    contentRef.current = '';
  }, []);

  const addStreamingChunk = useCallback((chunk: string) => {
    contentRef.current += chunk;
    setStreamingContent(contentRef.current);
  }, []);

  const completeStreaming = useCallback(() => {
    setIsStreaming(false);
  }, []);

  const resetStreaming = useCallback(() => {
    setIsStreaming(false);
    setStreamingContent('');
    contentRef.current = '';
  }, []);

  return {
    streamingContent,
    isStreaming,
    addStreamingChunk,
    startStreaming,
    completeStreaming,
    resetStreaming,
  };
}
