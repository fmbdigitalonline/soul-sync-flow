import { useState, useCallback, useRef } from 'react';
import { ConversationMessage } from './use-hacs-conversation';

export interface OptimisticMessage extends ConversationMessage {
  isPending?: boolean;
  isError?: boolean;
}

export const useOptimisticMessages = () => {
  const [optimisticMessages, setOptimisticMessages] = useState<OptimisticMessage[]>([]);
  const pendingMessageIdRef = useRef<string | null>(null);

  const addOptimisticUserMessage = useCallback((content: string): string => {
    const messageId = `optimistic_user_${Date.now()}`;
    const optimisticMessage: OptimisticMessage = {
      id: messageId,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      isPending: true
    };

    setOptimisticMessages(prev => [...prev, optimisticMessage]);
    pendingMessageIdRef.current = messageId;
    return messageId;
  }, []);

  const confirmOptimisticMessage = useCallback((messageId: string, actualMessage: ConversationMessage) => {
    setOptimisticMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...actualMessage, isPending: false }
          : msg
      )
    );
    if (pendingMessageIdRef.current === messageId) {
      pendingMessageIdRef.current = null;
    }
  }, []);

  const markOptimisticMessageError = useCallback((messageId: string) => {
    setOptimisticMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isPending: false, isError: true }
          : msg
      )
    );
    if (pendingMessageIdRef.current === messageId) {
      pendingMessageIdRef.current = null;
    }
  }, []);

  const removeOptimisticMessage = useCallback((messageId: string) => {
    setOptimisticMessages(prev => prev.filter(msg => msg.id !== messageId));
    if (pendingMessageIdRef.current === messageId) {
      pendingMessageIdRef.current = null;
    }
  }, []);

  const clearOptimisticMessages = useCallback(() => {
    setOptimisticMessages([]);
    pendingMessageIdRef.current = null;
  }, []);

  const addAIResponseMessage = useCallback((message: ConversationMessage) => {
    setOptimisticMessages(prev => [...prev, message]);
  }, []);

  return {
    optimisticMessages,
    addOptimisticUserMessage,
    confirmOptimisticMessage,
    markOptimisticMessageError,
    removeOptimisticMessage,
    clearOptimisticMessages,
    addAIResponseMessage,
    hasPendingMessage: !!pendingMessageIdRef.current
  };
};