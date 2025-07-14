
import { useState, useCallback, useRef, useEffect } from 'react';
import { useHACSConversation } from './use-hacs-conversation';
import { useHacsIntelligence } from './use-hacs-intelligence';
import { useAuth } from '@/contexts/AuthContext';

// Pure HACS interface that eliminates all hybrid functionality
export interface PureHACSInterface {
  messages: Array<{
    id: string;
    content: string;
    sender: "user" | "assistant";
    timestamp: Date;
    agent_mode?: string;
  }>;
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  resetConversation: () => void;
  currentAgent: string;
  streamingContent: string;
  isStreaming: boolean;
  personaReady: boolean;
  authInitialized: boolean;
  blueprintStatus: {
    isAvailable: boolean;
    completionPercentage: number;
    summary: string;
  };
  vfpGraphStatus: {
    isAvailable: boolean;
    vectorDimensions: number;
    personalitySummary: string;
    vectorMagnitude: number;
  };
  recordVFPGraphFeedback: (messageId: string, isPositive: boolean) => void;
  acsEnabled: boolean;
  acsState: string;
  userName: string;
  intelligenceLevel: number;
  interactionCount: number;
}

export const useHACSPure = (
  initialAgent: string = "guide",
  pageContext: string = "general"
): PureHACSInterface => {
  const { user } = useAuth();
  
  // Pure HACS conversation for intelligence learning
  const {
    messages: hacsMessages,
    isLoading,
    sendMessage: hacsSendMessage,
    clearConversation,
    provideFeedback,
    currentQuestion
  } = useHACSConversation();
  
  // Intelligence tracking
  const { intelligence, refreshIntelligence } = useHacsIntelligence();
  
  // Convert HACS messages to expected format
  const convertedMessages = hacsMessages.map(msg => ({
    id: msg.id,
    content: msg.content,
    sender: msg.role === 'user' ? 'user' as const : 'assistant' as const,
    timestamp: new Date(msg.timestamp),
    agent_mode: msg.module || initialAgent
  }));

  // Pure HACS sendMessage implementation
  const sendMessage = useCallback(async (content: string) => {
    // Route through pure HACS for intelligence learning
    await hacsSendMessage(content);
    
    // Refresh intelligence after conversation
    await refreshIntelligence();
  }, [hacsSendMessage, refreshIntelligence]);

  const resetConversation = useCallback(() => {
    clearConversation();
  }, [clearConversation]);

  const recordVFPGraphFeedback = useCallback(async (messageId: string, isPositive: boolean) => {
    try {
      await provideFeedback(
        'helpful',
        isPositive ? 'positive' : 'negative',
        messageId
      );
      await refreshIntelligence();
    } catch (error) {
      console.error("VFP feedback failed:", error);
    }
  }, [provideFeedback, refreshIntelligence]);

  return {
    messages: convertedMessages,
    isLoading,
    sendMessage,
    resetConversation,
    currentAgent: initialAgent,
    streamingContent: '',
    isStreaming: false,
    personaReady: true,
    authInitialized: !!user,
    blueprintStatus: {
      isAvailable: true,
      completionPercentage: 100,
      summary: 'Pure HACS Intelligence Active'
    },
    vfpGraphStatus: {
      isAvailable: true,
      vectorDimensions: intelligence?.intelligence_level || 0,
      personalitySummary: `Intelligence Level: ${intelligence?.intelligence_level || 0}%`,
      vectorMagnitude: (intelligence?.intelligence_level || 0) / 100
    },
    recordVFPGraphFeedback,
    acsEnabled: false, // Pure HACS doesn't use ACS
    acsState: 'pure_hacs',
    userName: user?.email?.split('@')[0] || 'friend',
    intelligenceLevel: intelligence?.intelligence_level || 0,
    interactionCount: intelligence?.interaction_count || 0
  };
};
