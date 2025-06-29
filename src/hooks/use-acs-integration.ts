
import { useState, useEffect, useCallback } from 'react';
import { adaptiveContextScheduler } from '@/services/adaptive-context-scheduler';
import { DialogueState, PromptStrategyConfig, ACSConfig } from '@/types/acs-types';
import { personalityVectorService } from '@/services/personality-vector-service';

export const useACSIntegration = (userId: string | null, useAcs: boolean = true) => {
  const [currentState, setCurrentState] = useState<DialogueState>('NORMAL');
  const [promptStrategy, setPromptStrategy] = useState<PromptStrategyConfig>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [metrics, setMetrics] = useState({
    stateTransitions: 0,
    averageLatency: 0,
    userRepairRate: 0,
    conversationVelocity: 0
  });

  // Initialize ACS
  useEffect(() => {
    const initializeACS = async () => {
      if (!userId || !useAcs) {
        setIsInitialized(false);
        return;
      }

      try {
        console.log('🎯 Initializing ACS integration for user:', userId);
        
        // Load personality vector for personalized thresholds
        let personalityVector: Float32Array | null = null;
        try {
          personalityVector = await personalityVectorService.getVector(userId);
          console.log('✅ Loaded personality vector for ACS');
        } catch (error) {
          console.warn('⚠️ Could not load personality vector for ACS:', error);
        }
        
        await adaptiveContextScheduler.initialize(userId, personalityVector || undefined);
        
        if (useAcs) {
          adaptiveContextScheduler.enable();
        } else {
          adaptiveContextScheduler.disable();
        }
        
        setIsInitialized(true);
        console.log('✅ ACS integration initialized');
      } catch (error) {
        console.error('❌ Failed to initialize ACS:', error);
        setIsInitialized(false);
      }
    };

    initializeACS();
  }, [userId, useAcs]);

  // Update state and strategy when ACS state changes
  const updateACSState = useCallback(() => {
    if (!isInitialized) return;
    
    const newState = adaptiveContextScheduler.getCurrentState();
    const newStrategy = adaptiveContextScheduler.getPromptStrategyConfig();
    const newMetrics = adaptiveContextScheduler.getMetrics();
    
    setCurrentState(newState);
    setPromptStrategy(newStrategy);
    setMetrics(newMetrics);
  }, [isInitialized]);

  // Process user message
  const processUserMessage = useCallback((message: string, sentiment?: number) => {
    if (!isInitialized || !useAcs) return;
    
    try {
      adaptiveContextScheduler.addMessage(message, 'user', sentiment);
      updateACSState();
    } catch (error) {
      console.error('❌ Error processing user message in ACS:', error);
    }
  }, [isInitialized, useAcs, updateACSState]);

  // Process assistant message
  const processAssistantMessage = useCallback((message: string, sentiment?: number) => {
    if (!isInitialized || !useAcs) return;
    
    try {
      adaptiveContextScheduler.addMessage(message, 'assistant', sentiment);
      updateACSState();
    } catch (error) {
      console.error('❌ Error processing assistant message in ACS:', error);
    }
  }, [isInitialized, useAcs, updateACSState]);

  // Record user feedback for RL optimization
  const recordFeedback = useCallback((feedback: 'positive' | 'negative' | 'neutral', message?: string) => {
    if (!isInitialized || !useAcs) return;
    
    try {
      adaptiveContextScheduler.recordUserFeedback(feedback, message);
      updateACSState();
    } catch (error) {
      console.error('❌ Error recording ACS feedback:', error);
    }
  }, [isInitialized, useAcs, updateACSState]);

  // Update configuration (hot-reloadable)
  const updateConfig = useCallback(async (newConfig: Partial<ACSConfig>) => {
    if (!isInitialized) return;
    
    try {
      await adaptiveContextScheduler.updateConfig(newConfig);
      console.log('✅ ACS configuration updated');
    } catch (error) {
      console.error('❌ Error updating ACS config:', error);
    }
  }, [isInitialized]);

  // Get enhanced system prompt with ACS modifications
  const getEnhancedSystemPrompt = useCallback((basePrompt: string): string => {
    if (!isInitialized || !useAcs || !promptStrategy.systemPromptModifier) {
      return basePrompt;
    }
    
    let enhancedPrompt = basePrompt;
    
    // Add apology prefix if needed
    if (promptStrategy.apologyPrefix) {
      enhancedPrompt = `I apologize if my previous response was confusing. Let me help clarify. ${enhancedPrompt}`;
    }
    
    // Add system prompt modifier
    enhancedPrompt += `\n\nAdditional guidance: ${promptStrategy.systemPromptModifier}`;
    
    // Add check-in if idle
    if (promptStrategy.checkInEnabled && currentState === 'IDLE') {
      enhancedPrompt += `\n\nNote: The user has been quiet. Gently check in and offer assistance.`;
    }
    
    return enhancedPrompt;
  }, [isInitialized, useAcs, promptStrategy, currentState]);

  // Get generation parameters adjusted by ACS
  const getGenerationParams = useCallback(() => {
    const baseParams = {
      temperature: 0.8,
      maxTokens: 4000
    };
    
    if (!isInitialized || !useAcs) {
      return baseParams;
    }
    
    return {
      temperature: Math.max(0.1, Math.min(1.0, baseParams.temperature + (promptStrategy.temperatureAdjustment || 0))),
      maxTokens: promptStrategy.maxTokens || baseParams.maxTokens
    };
  }, [isInitialized, useAcs, promptStrategy]);

  return {
    // State
    isInitialized,
    currentState,
    promptStrategy,
    metrics,
    
    // Actions
    processUserMessage,
    processAssistantMessage,
    recordFeedback,
    updateConfig,
    
    // Utilities
    getEnhancedSystemPrompt,
    getGenerationParams,
    
    // Feature flag
    isEnabled: useAcs && isInitialized
  };
};
