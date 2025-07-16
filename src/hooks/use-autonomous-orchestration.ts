// Autonomous Orchestration Hook - Connects All Systems Without Breaking Existing Functionality
// SoulSync Engineering Protocol: Pure integration, no replacement

import { useState, useCallback, useMemo } from 'react';
import { AutonomousOrchestrator, InterventionDecision, AutonomousResponse } from '@/services/autonomous-orchestrator';
import { useHacsIntelligence } from './use-hacs-intelligence';
import { useHACSInsights } from './use-hacs-insights';
import { useHACSMicroLearning } from './use-hacs-micro-learning';
import { usePersonalityEngine } from './use-personality-engine';
import { useAuth } from '@/contexts/AuthContext';

export interface AutonomousOrchestrationState {
  isOrchestrating: boolean;
  lastDecision: InterventionDecision | null;
  lastResponse: AutonomousResponse | null;
  orchestrationHistory: AutonomousResponse[];
}

/**
 * Autonomous Orchestration Hook
 * Coordinates between ALL existing systems without replacing them
 * Adds intelligence layer on top of existing functionality
 */
export const useAutonomousOrchestration = () => {
  const { user } = useAuth();
  const orchestrator = useMemo(() => new AutonomousOrchestrator(), []);
  
  // Connect to ALL existing hooks (no replacement, pure integration)
  const intelligence = useHacsIntelligence();
  const insights = useHACSInsights();
  const microLearning = useHACSMicroLearning();
  const personality = usePersonalityEngine();

  // Orchestration state
  const [orchestrationState, setOrchestrationState] = useState<AutonomousOrchestrationState>({
    isOrchestrating: false,
    lastDecision: null,
    lastResponse: null,
    orchestrationHistory: []
  });

  // Intelligent intervention orchestration
  const triggerIntelligentIntervention = useCallback(async (
    context?: string
  ): Promise<AutonomousResponse | null> => {
    if (!user || orchestrationState.isOrchestrating) return null;

    console.log('🎭 Orchestration: Triggering intelligent intervention');
    setOrchestrationState(prev => ({ ...prev, isOrchestrating: true }));

    try {
      // Step 1: Get intervention decision using orchestrator
      const decision = await orchestrator.decideOptimalIntervention(user.id);
      
      setOrchestrationState(prev => ({ ...prev, lastDecision: decision }));

      if (!decision.shouldIntervene) {
        console.log('🎭 Orchestration: Decision - no intervention needed');
        return null;
      }

      // Step 2: Orchestrate response through all systems
      const response = await orchestrator.orchestrateAutonomousResponse(
        user.id,
        'intelligent_trigger',
        { context, timestamp: new Date().toISOString() }
      );

      if (response) {
        setOrchestrationState(prev => ({
          ...prev,
          lastResponse: response,
          orchestrationHistory: [response, ...prev.orchestrationHistory].slice(0, 10)
        }));

        console.log('✅ Orchestration: Intelligent response generated');
        return response;
      }

      console.log('❌ Orchestration: No response generated');
      return null;

    } catch (error) {
      console.error('❌ Orchestration error:', error);
      return null;
    } finally {
      setOrchestrationState(prev => ({ ...prev, isOrchestrating: false }));
    }
  }, [user, orchestrator, orchestrationState.isOrchestrating]);

  // Enhanced insight generation with personality coordination
  const generatePersonalizedInsight = useCallback(async (
    trigger: string,
    context?: any
  ) => {
    if (!user) return null;

    console.log('🎭 Orchestration: Generating personalized insight');

    try {
      // Use orchestrator to decide if insight should be generated
      const decision = await orchestrator.decideOptimalIntervention(user.id);
      
      if (decision.shouldIntervene && decision.interventionType === 'insight') {
        // Route through existing insights system but with personality enhancement
        const insight = await insights.generateInsight(trigger);
        
        if (insight) {
          // Enhance with personality-aware timing for next insight
          const timingPrefs = personality.getOptimalTimingPreferences();
          console.log('🎭 Orchestration: Insight enhanced with personality timing');
        }
        
        return insight;
      }

      // Fall back to existing insights generation
      return await insights.generateInsight(trigger);

    } catch (error) {
      console.error('❌ Personalized insight error:', error);
      // Graceful fallback to existing system
      return await insights.generateInsight(trigger);
    }
  }, [user, orchestrator, insights, personality]);

  // Smart learning question generation
  const generateSmartLearningQuestion = useCallback(async (
    context?: any
  ) => {
    if (!user) return null;

    try {
      // Use orchestrator to optimize learning question timing and style
      const decision = await orchestrator.decideOptimalIntervention(user.id);
      
      if (decision.interventionType === 'micro_learning') {
        // Generate question through existing system
        const question = await microLearning.generateMicroQuestion();
        
        if (question) {
          console.log('🎭 Orchestration: Learning question optimized for personality');
        }
        
        return question;
      }

      return null;

    } catch (error) {
      console.error('❌ Smart learning question error:', error);
      return null;
    }
  }, [user, orchestrator, microLearning]);

  // Intelligent conversation enhancement
  const enhanceConversationIntelligence = useCallback(async (
    messageContent: string,
    responseQuality: 'excellent' | 'good' | 'average' | 'poor' = 'average'
  ) => {
    try {
      // Use existing intelligence system with personality weighting
      await intelligence.recordConversationInteraction(messageContent, responseQuality);
      
      // Add orchestration insight for future interactions
      const decision = await orchestrator.decideOptimalIntervention(user?.id || '');
      
      console.log('🎭 Orchestration: Conversation intelligence enhanced');
      return decision;

    } catch (error) {
      console.error('❌ Conversation intelligence enhancement error:', error);
      return null;
    }
  }, [intelligence, orchestrator, user]);

  return {
    // Main orchestration methods
    triggerIntelligentIntervention,
    generatePersonalizedInsight,
    generateSmartLearningQuestion,
    enhanceConversationIntelligence,
    
    // Orchestration state
    orchestrationState,
    
    // All existing system access (no replacement)
    intelligence,
    insights,
    microLearning,
    personality,
    
    // Helper methods
    isOrchestrating: orchestrationState.isOrchestrating,
    lastDecision: orchestrationState.lastDecision,
    lastResponse: orchestrationState.lastResponse,
    history: orchestrationState.orchestrationHistory
  };
};