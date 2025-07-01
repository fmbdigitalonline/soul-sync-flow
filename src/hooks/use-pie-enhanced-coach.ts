
import { useState, useEffect, useCallback } from 'react';
import { useEnhancedAICoach } from './use-enhanced-ai-coach';
import { pieService } from '@/services/pie-service';
import { PIEInsight } from '@/types/pie-types';
import { AgentType } from '@/services/enhanced-ai-coach-service';
import { useAuth } from '@/contexts/AuthContext';

export const usePIEEnhancedCoach = (defaultAgent: AgentType = "guide") => {
  const baseCoach = useEnhancedAICoach(defaultAgent);
  const [pieInsights, setPieInsights] = useState<PIEInsight[]>([]);
  const [pieInitialized, setPieInitialized] = useState(false);
  const { user } = useAuth();

  // Initialize PIE service alongside coach
  useEffect(() => {
    const initializePIE = async () => {
      if (!user?.id || pieInitialized) return;

      try {
        console.log('🔮 Initializing PIE for coach enhancement');
        await pieService.initialize(user.id);
        
        // Load conversation-relevant insights
        const conversationInsights = await pieService.getInsightsForConversation(defaultAgent);
        setPieInsights(conversationInsights);
        setPieInitialized(true);
        
        console.log(`✅ PIE Coach Enhancement: ${conversationInsights.length} insights available`);
      } catch (error) {
        console.error('❌ PIE coach enhancement error:', error);
      }
    };

    initializePIE();
  }, [user, defaultAgent, pieInitialized]);

  // Enhanced send message that includes PIE context
  const sendPIEEnhancedMessage = useCallback(async (
    content: string, 
    useStreaming: boolean = true,
    displayMessage?: string
  ) => {
    // Add PIE insights to message context if available
    let enhancedContent = content;
    
    if (pieInsights.length > 0 && pieInitialized) {
      const relevantInsights = pieInsights.filter(insight => 
        insight.priority === 'high' || insight.priority === 'critical'
      ).slice(0, 2); // Limit to top 2 insights

      if (relevantInsights.length > 0) {
        const insightContext = relevantInsights.map(insight => 
          `[PIE Context: ${insight.title} - ${insight.message}]`
        ).join(' ');
        
        enhancedContent = `${content}\n\n${insightContext}`;
        console.log('🔮 Enhanced message with PIE insights:', relevantInsights.length);
      }
    }

    // Record user interaction for PIE learning
    if (pieInitialized && user?.id) {
      try {
        // Create data point from user interaction
        const dataPoint = {
          id: `pie_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          dataType: 'sentiment' as const,
          timestamp: new Date().toISOString(),
          value: content.length > 50 ? 0.7 : 0.5, // Simple sentiment proxy
          source: 'conversation_analysis' as const,
          confidence: 0.6
        };

        await pieService.processUserData(dataPoint);
      } catch (error) {
        console.error('PIE data collection error:', error);
      }
    }

    return baseCoach.sendMessage(enhancedContent, useStreaming, displayMessage);
  }, [baseCoach, pieInsights, pieInitialized, user]);

  // Refresh PIE insights
  const refreshPIEInsights = useCallback(async () => {
    if (!pieInitialized || !user?.id) return;

    try {
      const conversationInsights = await pieService.getInsightsForConversation(defaultAgent);
      setPieInsights(conversationInsights);
      console.log('🔮 PIE insights refreshed');
    } catch (error) {
      console.error('Error refreshing PIE insights:', error);
    }
  }, [pieInitialized, user, defaultAgent]);

  return {
    ...baseCoach,
    sendMessage: sendPIEEnhancedMessage,
    pieInsights,
    pieInitialized,
    refreshPIEInsights,
    pieEnabled: pieInitialized && pieInsights.length > 0
  };
};
