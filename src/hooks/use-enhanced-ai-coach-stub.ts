// TEMPORARY STUB: This file provides basic types to prevent build errors
// All enhanced AI coach functionality has been replaced with HACS

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  agent_mode?: string;
}

export type AgentType = "coach" | "guide" | "blend" | "dream";

// Comprehensive stub to prevent build errors in remaining files
export const useEnhancedAICoach = (agentType?: AgentType, sessionId?: string) => {
  console.warn('Enhanced AI Coach has been replaced with HACS. Use useHACSConversation instead.');
  
  return {
    messages: [] as Message[],
    isLoading: false,
    sendMessage: async (message: string, usePersonalization?: boolean, originalMessage?: string) => {
      throw new Error('Enhanced AI Coach disabled. Use HACS instead.');
    },
    resetConversation: () => {},
    clearMessages: () => {},
    currentAgent: agentType || 'guide' as AgentType,
    switchAgent: (agent: AgentType) => {},
    personaReady: false,
    authInitialized: true,
    blueprintStatus: {
      isAvailable: false,
      completionPercentage: 0,
      summary: 'Enhanced AI Coach disabled'
    },
    vfpGraphStatus: { 
      isAvailable: false, 
      vectorDimensions: 0, 
      personalitySummary: '',
      vectorMagnitude: 0
    },
    recordVFPGraphFeedback: (messageId: string, isPositive: boolean) => {},
    acsEnabled: false,
    acsState: 'disabled',
    userName: 'friend',
    streamingContent: '',
    isStreaming: false,
    isInitialized: true
  };
};