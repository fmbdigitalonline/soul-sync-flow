import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CompanionOracleMessage {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  oracleMode?: string;
  semanticChunksUsed?: number;
}

interface CompanionOracleInterface {
  messages: CompanionOracleMessage[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  resetConversation: () => void;
  oracleStatus: {
    mode: 'full_oracle' | 'fallback_oracle' | 'initializing';
    chunksAvailable: boolean;
    personalityReportsFound: boolean;
  };
}

export const useCompanionOracle = (): CompanionOracleInterface => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<CompanionOracleMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [oracleStatus, setOracleStatus] = useState<{
    mode: 'full_oracle' | 'fallback_oracle' | 'initializing';
    chunksAvailable: boolean;
    personalityReportsFound: boolean;
  }>({
    mode: 'initializing',
    chunksAvailable: false,
    personalityReportsFound: false
  });
  
  const sessionIdRef = useRef(`companion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const sendMessage = useCallback(async (content: string) => {
    if (!user?.id || !content.trim()) return;

    setIsLoading(true);
    
    // Add user message immediately
    const userMessage: CompanionOracleMessage = {
      id: `user_${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      // Call companion oracle edge function
      const { data, error } = await supabase.functions.invoke('companion-oracle-conversation', {
        body: {
          userId: user.id,
          message: content,
          messageHistory: messages.map(msg => ({
            sender: msg.sender,
            content: msg.content,
            timestamp: msg.timestamp.toISOString()
          })),
          sessionId: sessionIdRef.current
        }
      });

      if (error) throw error;

      // Add oracle response
      const oracleMessage: CompanionOracleMessage = {
        id: `oracle_${Date.now()}`,
        content: data.response,
        sender: 'assistant',
        timestamp: new Date(),
        oracleMode: data.oracleMode,
        semanticChunksUsed: data.semanticChunksUsed
      };

      setMessages(prev => [...prev, oracleMessage]);

      // Update oracle status
      setOracleStatus({
        mode: data.oracleMode === 'full_oracle' ? 'full_oracle' : 'fallback_oracle',
        chunksAvailable: data.semanticChunksUsed > 0,
        personalityReportsFound: data.oracleMode === 'full_oracle'
      });

      console.log(`🔮 Oracle Response: ${data.oracleMode} mode, ${data.semanticChunksUsed} chunks, ${data.tokenCount} tokens`);

    } catch (error) {
      console.error('Companion Oracle Error:', error);
      
      // Add error fallback message
      const errorMessage: CompanionOracleMessage = {
        id: `error_${Date.now()}`,
        content: "I sense a disturbance in our connection, friend. Let me recalibrate and we can continue our conversation.",
        sender: 'assistant',
        timestamp: new Date(),
        oracleMode: 'error_fallback'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, messages]);

  const resetConversation = useCallback(() => {
    setMessages([]);
    sessionIdRef.current = `companion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setOracleStatus({
      mode: 'initializing',
      chunksAvailable: false,
      personalityReportsFound: false
    });
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    resetConversation,
    oracleStatus
  };
};