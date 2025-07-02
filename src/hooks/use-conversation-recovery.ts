import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from './use-ai-coach';
import { LifeDomain } from '@/types/growth-program';
import { Json } from '@/integrations/supabase/types';

interface ConversationRecoveryData {
  sessionId: string;
  messages: Message[];
  domain?: LifeDomain;
  lastActivity: string;
  recoveryContext: any;
}

// Helper function to convert Json to Message array
const convertJsonToMessages = (jsonData: Json): Message[] => {
  if (!jsonData || !Array.isArray(jsonData)) return [];
  
  return jsonData.map((item: any) => ({
    id: item.id || `msg_${Date.now()}_${Math.random()}`,
    content: item.content || '',
    sender: item.sender || 'user',
    timestamp: new Date(item.timestamp || Date.now())
  }));
};

// Helper function to convert Message array to Json
const convertMessagesToJson = (messages: Message[]): Json => {
  return messages.map(msg => ({
    id: msg.id,
    content: msg.content,
    sender: msg.sender,
    timestamp: msg.timestamp.toISOString()
  }));
};

export const useConversationRecovery = () => {
  const [availableRecoveries, setAvailableRecoveries] = useState<ConversationRecoveryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const loadAvailableRecoveries = useCallback(async (domain?: LifeDomain) => {
    if (!user) return;

    setIsLoading(true);
    try {
      let query = supabase
        .from('conversation_memory')
        .select('*')
        .eq('user_id', user.id)
        .eq('conversation_stage', 'active')
        .order('last_activity', { ascending: false })
        .limit(5);

      if (domain) {
        query = query.eq('domain', domain);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading conversation recoveries:', error);
        return;
      }

      const recoveries = data?.map(record => ({
        sessionId: record.session_id,
        messages: convertJsonToMessages(record.messages),
        domain: record.domain as LifeDomain,
        lastActivity: record.last_activity || record.updated_at,
        recoveryContext: record.recovery_context || {}
      })) || [];

      setAvailableRecoveries(recoveries);
    } catch (error) {
      console.error('Error in loadAvailableRecoveries:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const saveConversation = useCallback(async (
    sessionId: string,
    messages: Message[],
    domain?: LifeDomain,
    recoveryContext?: any
  ) => {
    if (!user || messages.length === 0) return;

    try {
      // First check if record exists
      const { data: existing } = await supabase
        .from('conversation_memory')
        .select('id')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .single();

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('conversation_memory')
          .update({
            messages: convertMessagesToJson(messages),
            domain,
            recovery_context: recoveryContext || {},
            updated_at: new Date().toISOString(),
            last_activity: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('session_id', sessionId);

        if (error) {
          console.error('Error updating conversation:', error);
        } else {
          console.log('✅ Conversation updated successfully');
        }
      } else {
        // Insert new record
        const { error } = await supabase
          .from('conversation_memory')
          .insert({
            user_id: user.id,
            session_id: sessionId,
            messages: convertMessagesToJson(messages),
            domain,
            conversation_stage: 'active',
            recovery_context: recoveryContext || {},
            mode: 'guide'
          });

        if (error) {
          console.error('Error saving conversation:', error);
        } else {
          console.log('✅ Conversation saved successfully');
        }
      }
    } catch (error) {
      console.error('Error in saveConversation:', error);
    }
  }, [user]);

  const loadConversation = useCallback(async (sessionId: string): Promise<Message[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('conversation_memory')
        .select('messages')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .single();

      if (error) {
        console.error('Error loading conversation:', error);
        return [];
      }

      return convertJsonToMessages(data?.messages);
    } catch (error) {
      console.error('Error in loadConversation:', error);
      return [];
    }
  }, [user]);

  const markConversationComplete = useCallback(async (sessionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('conversation_memory')
        .update({ conversation_stage: 'completed' })
        .eq('user_id', user.id)
        .eq('session_id', sessionId);

      if (error) {
        console.error('Error marking conversation complete:', error);
      }
    } catch (error) {
      console.error('Error in markConversationComplete:', error);
    }
  }, [user]);

  const deleteConversation = useCallback(async (sessionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('conversation_memory')
        .delete()
        .eq('user_id', user.id)
        .eq('session_id', sessionId);

      if (error) {
        console.error('Error deleting conversation:', error);
      } else {
        // Refresh available recoveries
        await loadAvailableRecoveries();
      }
    } catch (error) {
      console.error('Error in deleteConversation:', error);
    }
  }, [user, loadAvailableRecoveries]);

  return {
    availableRecoveries,
    isLoading,
    loadAvailableRecoveries,
    saveConversation,
    loadConversation,
    markConversationComplete,
    deleteConversation
  };
};
