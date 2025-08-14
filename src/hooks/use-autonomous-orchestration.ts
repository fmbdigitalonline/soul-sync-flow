// Autonomous Orchestration Hook - Connects All Systems Without Breaking Existing Functionality
// SoulSync Engineering Protocol: Pure integration, no replacement

import { useState, useCallback, useMemo } from 'react';
import { AutonomousOrchestrator, InterventionDecision, AutonomousResponse } from '@/services/autonomous-orchestrator';
import { useHacsIntelligence } from './use-hacs-intelligence';
import { useHACSInsights } from './use-hacs-insights';
import { useHACSMicroLearning } from './use-hacs-micro-learning';
import { usePersonalityEngine } from './use-personality-engine';
import { useAuth } from '@/contexts/AuthContext';
// Phase 1 & 2 Intelligence Enhancements
import { enhancedMemoryIntelligence } from '@/services/enhanced-memory-intelligence';
import { behavioralPatternIntelligence } from '@/services/behavioral-pattern-intelligence';
import { predictiveIntelligenceEngine } from '@/services/predictive-intelligence-engine';

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

  // PHASE 1: Enhanced Memory Pattern Analysis
  const generateMemoryEnhancedInsight = useCallback(async (
    trigger: string,
    context?: any
  ) => {
    if (!user) return null;

    console.log('🧠 Memory-Enhanced: Generating deep memory insight');

    try {
      // Get memory-based insights with personality weighting
      const memoryInsights = await enhancedMemoryIntelligence.generateMemoryInsights(user.id);
      
      if (memoryInsights.length > 0) {
        const topInsight = memoryInsights[0];
        console.log('✅ Memory insight generated:', topInsight.insight);
        return {
          id: `memory_${Date.now()}`,
          text: topInsight.insight,
          module: 'Enhanced Memory',
          type: 'learning',
          confidence: topInsight.confidence,
          evidence: [topInsight.suggestedAction],
          timestamp: new Date(),
          acknowledged: false
        };
      }

      // Fall back to existing insights generation
      return await insights.generateInsight(trigger);

    } catch (error) {
      console.error('❌ Memory-enhanced insight error:', error);
      return await insights.generateInsight(trigger);
    }
  }, [user, insights]);

  // PHASE 1: Enhanced Behavioral Pattern Analysis
  const generateBehavioralEnhancedInsight = useCallback(async (
    trigger: string,
    context?: any
  ) => {
    if (!user) return null;

    console.log('📊 Behavioral-Enhanced: Generating pattern insight');

    try {
      // Get behavioral insights with PIE integration
      const behavioralInsights = await behavioralPatternIntelligence.generateBehavioralInsights(user.id);
      
      if (behavioralInsights.length > 0) {
        const topInsight = behavioralInsights[0];
        console.log('✅ Behavioral insight generated:', topInsight.insight);
        return {
          id: `behavioral_${Date.now()}`,
          text: topInsight.insight,
          module: 'Behavioral Intelligence',
          type: 'behavioral',
          confidence: topInsight.confidence,
          evidence: [topInsight.recommendedAction],
          timestamp: new Date(),
          acknowledged: false
        };
      }

      // Fall back to existing insights generation
      return await insights.generateInsight(trigger);

    } catch (error) {
      console.error('❌ Behavioral-enhanced insight error:', error);
      return await insights.generateInsight(trigger);
    }
  }, [user, insights]);

  // PHASE 2: Predictive Intelligence Generation
  const generatePredictiveInsight = useCallback(async (
    trigger: string,
    context?: any
  ) => {
    if (!user) return null;

    console.log('🔮 Predictive: Generating predictive insight');

    try {
      // Get predictive insights from cross-module synthesis
      const predictiveInsights = await predictiveIntelligenceEngine.generatePredictiveInsights(user.id);
      
      if (predictiveInsights.length > 0) {
        const topInsight = predictiveInsights[0];
        console.log('✅ Predictive insight generated:', topInsight.text);
        return {
          id: topInsight.id,
          text: topInsight.text,
          module: `Predictive (${topInsight.synthesizedModules.join(', ')})`,
          type: topInsight.type,
          confidence: topInsight.confidence,
          evidence: topInsight.evidence.behavioralIndicators,
          timestamp: new Date(),
          acknowledged: false
        };
      }

      // Fall back to existing insights generation
      return await insights.generateInsight(trigger);

    } catch (error) {
      console.error('❌ Predictive insight error:', error);
      return await insights.generateInsight(trigger);
    }
  }, [user, insights]);

  // Enhanced insight generation with personality coordination (upgraded)
  const generatePersonalizedInsight = useCallback(async (
    trigger: string,
    context?: any
  ) => {
    if (!user) return null;

    console.log('🎭 Orchestration: Generating enhanced personalized insight');

    try {
      // Use orchestrator to decide if insight should be generated
      const decision = await orchestrator.decideOptimalIntervention(user.id);
      
      if (decision.shouldIntervene) {
        // Route through enhanced intelligence based on intervention type
        switch (decision.interventionType) {
          case 'insight':
            // Use predictive intelligence for deep insights
            return await generatePredictiveInsight(trigger, context);
          
          case 'micro_learning':
            // Use memory intelligence for learning opportunities
            return await generateMemoryEnhancedInsight(trigger, context);
          
          case 'guidance':
            // Use behavioral intelligence for guidance
            return await generateBehavioralEnhancedInsight(trigger, context);
          
          default:
            // Fall back to existing system
            return await insights.generateInsight(trigger);
        }
      }

      // If no intervention needed, still try enhanced insights at lower priority
      const randomSelector = Math.random();
      if (randomSelector < 0.33) {
        return await generateMemoryEnhancedInsight(trigger, context);
      } else if (randomSelector < 0.66) {
        return await generateBehavioralEnhancedInsight(trigger, context);
      } else {
        return await generatePredictiveInsight(trigger, context);
      }

    } catch (error) {
      console.error('❌ Enhanced personalized insight error:', error);
      // Graceful fallback to existing system
      return await insights.generateInsight(trigger);
    }
  }, [user, orchestrator, insights, generateMemoryEnhancedInsight, generateBehavioralEnhancedInsight, generatePredictiveInsight]);

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
    
    // PHASE 1 & 2: Enhanced Intelligence Methods
    generateMemoryEnhancedInsight,
    generateBehavioralEnhancedInsight,
    generatePredictiveInsight,
    
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