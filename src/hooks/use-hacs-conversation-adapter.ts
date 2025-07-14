import { useState, useCallback, useRef, useEffect } from 'react';
import { useHACSConversation } from './use-hacs-conversation';
import { useEnhancedAICoach } from './use-enhanced-ai-coach';

// Adapter interface that matches useEnhancedAICoach exactly
export interface HACSConversationAdapter {
  messages: Array<{
    id: string;
    content: string;
    sender: "user" | "assistant";
    timestamp: Date;
    agent_mode?: string;
  }>;
  isLoading: boolean;
  sendMessage: (
    content: string,
    usePersonalization?: boolean,
    context?: any,
    agentOverride?: string
  ) => Promise<void>;
  resetConversation: () => void;
  currentAgent: string;
  switchAgent: (newAgent: string) => void;
  streamingContent: string;
  isStreaming: boolean;
  personaReady: boolean;
  authInitialized: boolean;
  blueprintStatus: any;
  vfpGraphStatus: any;
  recordVFPGraphFeedback: (messageId: string, isPositive: boolean) => void;
  acsEnabled: boolean;
  acsState: string;
  userName: string;
}

export const useHACSConversationAdapter = (
  initialAgent: string = "guide",
  pageContext: string = "general"
): HACSConversationAdapter => {
  // Use HACS conversation for intelligence learning
  const hacsConversation = useHACSConversation();
  
  // Keep enhanced AI coach for backwards compatibility but don't use its sendMessage
  const enhancedCoach = useEnhancedAICoach(initialAgent as any, pageContext);
  
  // Convert HACS messages to enhanced coach format
  const convertedMessages = hacsConversation.messages.map(msg => ({
    id: msg.id,
    content: msg.content,
    sender: msg.role === 'user' ? 'user' as const : 'assistant' as const,
    timestamp: new Date(msg.timestamp),
    agent_mode: msg.module || initialAgent
  }));

  // CRITICAL: Route all sendMessage calls through HACS for intelligence learning
  const sendMessage = useCallback(async (
    content: string,
    usePersonalization: boolean = true,
    context?: any,
    agentOverride?: string
  ) => {
    // Always use HACS conversation to ensure intelligence updates
    await hacsConversation.sendMessage(content);
  }, [hacsConversation.sendMessage]);

  const resetConversation = useCallback(() => {
    hacsConversation.clearConversation();
  }, [hacsConversation.clearConversation]);

  const switchAgent = useCallback((newAgent: string) => {
    // Keep agent switching functionality but route through HACS
    enhancedCoach.switchAgent(newAgent as any);
  }, [enhancedCoach.switchAgent]);

  return {
    messages: convertedMessages,
    isLoading: hacsConversation.isLoading || enhancedCoach.isLoading,
    sendMessage,
    resetConversation,
    currentAgent: enhancedCoach.currentAgent,
    switchAgent,
    streamingContent: enhancedCoach.streamingContent,
    isStreaming: enhancedCoach.isStreaming,
    personaReady: enhancedCoach.personaReady,
    authInitialized: enhancedCoach.authInitialized,
    blueprintStatus: enhancedCoach.blueprintStatus,
    vfpGraphStatus: enhancedCoach.vfpGraphStatus,
    recordVFPGraphFeedback: enhancedCoach.recordVFPGraphFeedback,
    acsEnabled: enhancedCoach.acsEnabled,
    acsState: enhancedCoach.acsState,
    userName: enhancedCoach.userName
  };
};
