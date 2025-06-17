
import { useState, useCallback, useRef } from 'react';

interface StreamingMessageState {
  streamingContent: string;
  isStreaming: boolean;
  error: string | null;
  isTimeout: boolean;
}

interface UseStreamingMessageWithTimeoutReturn extends StreamingMessageState {
  addStreamingChunk: (chunk: string) => void;
  startStreaming: () => void;
  completeStreaming: () => void;
  resetStreaming: () => void;
  setError: (error: string) => void;
  setTimeout: () => void;
}

export const useStreamingMessageWithTimeout = (timeoutMs: number = 30000): UseStreamingMessageWithTimeoutReturn => {
  const [state, setState] = useState<StreamingMessageState>({
    streamingContent: '',
    isStreaming: false,
    error: null,
    isTimeout: false,
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addStreamingChunk = useCallback((chunk: string) => {
    setState(prev => ({
      ...prev,
      streamingContent: prev.streamingContent + chunk,
      error: null,
      isTimeout: false,
    }));
    
    // Reset timeout when we receive data
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setState(prev => ({
        ...prev,
        isTimeout: true,
        error: 'Response timeout - please try again',
        isStreaming: false,
      }));
    }, timeoutMs);
  }, [timeoutMs]);

  const startStreaming = useCallback(() => {
    setState(prev => ({
      ...prev,
      streamingContent: '',
      isStreaming: true,
      error: null,
      isTimeout: false,
    }));
    
    // Start timeout
    timeoutRef.current = setTimeout(() => {
      setState(prev => ({
        ...prev,
        isTimeout: true,
        error: 'Response timeout - please try again',
        isStreaming: false,
      }));
    }, timeoutMs);
  }, [timeoutMs]);

  const completeStreaming = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setState(prev => ({
      ...prev,
      isStreaming: false,
      error: null,
      isTimeout: false,
    }));
  }, []);

  const resetStreaming = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setState({
      streamingContent: '',
      isStreaming: false,
      error: null,
      isTimeout: false,
    });
  }, []);

  const setError = useCallback((error: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setState(prev => ({
      ...prev,
      error,
      isStreaming: false,
      isTimeout: false,
    }));
  }, []);

  const setTimeout = useCallback(() => {
    setState(prev => ({
      ...prev,
      isTimeout: true,
      error: 'Response timeout - please try again',
      isStreaming: false,
    }));
  }, []);

  return {
    ...state,
    addStreamingChunk,
    startStreaming,
    completeStreaming,
    resetStreaming,
    setError,
    setTimeout,
  };
};
