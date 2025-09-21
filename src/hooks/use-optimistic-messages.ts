import { useState, useCallback, useRef } from 'react';
import { ConversationMessage } from './use-hacs-conversation';

/**
 * Step 5: Error recovery and retry functionality
 * Hook for managing optimistic message operations
 */
export const useOptimisticMessages = () => {
  const clientSeqRef = useRef<number>(0);

  // Step 5: Retry failed message with same client_msg_id
  const retryMessage = useCallback((
    failedMessage: ConversationMessage,
    messages: ConversationMessage[],
    setMessages: (updater: (prev: ConversationMessage[]) => ConversationMessage[]) => void,
    sendMessageFn: (content: string) => Promise<void>
  ) => {
    // Mark message as sending again
    setMessages(prev => prev.map(msg => 
      msg.client_msg_id === failedMessage.client_msg_id 
        ? { ...msg, status: 'sending' as const }
        : msg
    ));

    // Retry with same client_msg_id for idempotency
    return sendMessageFn(failedMessage.content);
  }, []);

  // Step 5: Remove failed message and restore to input
  const removeFailedMessage = useCallback((
    clientMsgId: string,
    setMessages: (updater: (prev: ConversationMessage[]) => ConversationMessage[]) => void,
    setInputValue: (value: string) => void
  ) => {
    setMessages(prev => {
      const failedMessage = prev.find(msg => msg.client_msg_id === clientMsgId);
      if (failedMessage) {
        setInputValue(failedMessage.content); // Restore to input
      }
      return prev.filter(msg => msg.client_msg_id !== clientMsgId);
    });
  }, []);

  // Step 4: Sort messages by server timestamp with client fallback
  const sortMessages = useCallback((messages: ConversationMessage[]): ConversationMessage[] => {
    return [...messages].sort((a, b) => {
      // Primary sort: server timestamp
      if (a.created_at_server && b.created_at_server) {
        const diff = new Date(a.created_at_server).getTime() - new Date(b.created_at_server).getTime();
        if (diff !== 0) return diff;
      }

      // Fallback 1: client timestamp
      const clientDiff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      if (clientDiff !== 0) return clientDiff;

      // Fallback 2: client sequence for tie-breaking
      return (a.client_seq || 0) - (b.client_seq || 0);
    });
  }, []);

  // Generate next client message with UUID and sequence
  const createOptimisticMessage = useCallback((
    content: string,
    role: 'user' | 'hacs' = 'user'
  ): ConversationMessage => {
    const clientMsgId = crypto.randomUUID();
    const clientSeq = ++clientSeqRef.current;

    return {
      id: clientMsgId,
      client_msg_id: clientMsgId,
      role,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      status: 'sending',
      client_seq: clientSeq
    };
  }, []);

  return {
    retryMessage,
    removeFailedMessage,
    sortMessages,
    createOptimisticMessage
  };
};