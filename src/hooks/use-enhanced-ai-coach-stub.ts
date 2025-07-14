// TEMPORARY STUB: This file provides basic types to prevent build errors
// All enhanced AI coach functionality has been replaced with HACS

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

// Stub export to prevent import errors in remaining files
export const useEnhancedAICoach = () => {
  throw new Error('Enhanced AI Coach has been replaced with HACS. Use useHACSConversation instead.');
};