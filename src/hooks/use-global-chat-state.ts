import { useState, useCallback } from 'react';

// Global state for tracking chat loading across components
let globalChatLoading = false;
let listeners: Set<(loading: boolean) => void> = new Set();

const notifyListeners = (loading: boolean) => {
  listeners.forEach(listener => listener(loading));
};

export const useGlobalChatState = () => {
  const [chatLoading, setChatLoading] = useState(globalChatLoading);

  const updateChatLoading = useCallback((loading: boolean) => {
    globalChatLoading = loading;
    notifyListeners(loading);
  }, []);

  // Subscribe to changes
  const subscribe = useCallback((listener: (loading: boolean) => void) => {
    listeners.add(listener);
    listener(globalChatLoading); // Initial value
    
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    chatLoading,
    updateChatLoading,
    subscribe
  };
};