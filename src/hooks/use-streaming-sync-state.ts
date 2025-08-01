import { useState, useCallback, useRef } from 'react';

// Global state for tracking streaming timing across components
let globalStreamingTiming = 75; // Default speed
let streamingListeners: Set<(timing: number) => void> = new Set();

const notifyStreamingListeners = (timing: number) => {
  streamingListeners.forEach(listener => listener(timing));
};

export const useStreamingSyncState = () => {
  const [currentTiming, setCurrentTiming] = useState(globalStreamingTiming);
  const lastCharRef = useRef<string>('');

  const updateStreamingTiming = useCallback((character: string, baseSpeed: number = 75) => {
    let timing = baseSpeed;
    
    // Apply the same timing logic as useStreamingMessage
    if (character === '.' || character === '!' || character === '?') {
      timing = baseSpeed * 3; // Longer pause after sentences
    } else if (character === ',' || character === ';') {
      timing = baseSpeed * 2; // Medium pause after clauses
    } else if (character === ' ') {
      timing = baseSpeed * 0.8; // Slightly faster for spaces
    }
    
    globalStreamingTiming = timing;
    lastCharRef.current = character;
    notifyStreamingListeners(timing);
  }, []);

  const resetStreamingTiming = useCallback(() => {
    globalStreamingTiming = 75;
    lastCharRef.current = '';
    notifyStreamingListeners(75);
  }, []);

  // Subscribe to timing changes
  const subscribe = useCallback((listener: (timing: number) => void) => {
    streamingListeners.add(listener);
    listener(globalStreamingTiming); // Initial value
    
    return () => {
      streamingListeners.delete(listener);
    };
  }, []);

  return {
    currentTiming,
    updateStreamingTiming,
    resetStreamingTiming,
    subscribe,
    lastCharacter: lastCharRef.current
  };
};