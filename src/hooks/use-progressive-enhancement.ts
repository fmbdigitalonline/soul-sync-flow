
import { useState, useEffect, useCallback } from 'react';
import { EnhancedContext, BasicContext } from '@/services/growth-program-orchestrator';

export type EnhancementLevel = 'basic' | 'partial' | 'full';

export interface ProgressiveEnhancementState {
  currentLevel: EnhancementLevel;
  availableFeatures: string[];
  loadingFeatures: string[];
  failedFeatures: string[];
  isFullyEnhanced: boolean;
}

export const useProgressiveEnhancement = (
  basicContext: BasicContext,
  enhancedContextPromise: Promise<EnhancedContext>
) => {
  const [enhancementState, setEnhancementState] = useState<ProgressiveEnhancementState>({
    currentLevel: 'basic',
    availableFeatures: ['basic_chat', 'personality_traits'],
    loadingFeatures: ['enhanced_personality', 'memory_context', 'career_insights'],
    failedFeatures: [],
    isFullyEnhanced: false
  });

  const [enhancedContext, setEnhancedContext] = useState<EnhancedContext | null>(null);

  useEffect(() => {
    enhancedContextPromise
      .then(context => {
        setEnhancedContext(context);
        updateEnhancementState(context);
      })
      .catch(error => {
        console.warn('Enhanced context loading failed:', error);
        setEnhancementState(prev => ({
          ...prev,
          currentLevel: 'basic',
          loadingFeatures: [],
          failedFeatures: [...prev.loadingFeatures],
          isFullyEnhanced: false
        }));
      });
  }, [enhancedContextPromise]);

  const updateEnhancementState = useCallback((context: EnhancedContext) => {
    const availableFeatures = ['basic_chat', 'personality_traits'];
    const failedFeatures: string[] = [];

    // Check which features loaded successfully
    if (context.fullBlueprint) {
      availableFeatures.push('full_personality', 'trait_analysis');
    } else {
      failedFeatures.push('full_personality');
    }

    if (context.memoryGraph) {
      availableFeatures.push('memory_context', 'conversation_continuity');
    } else {
      failedFeatures.push('memory_context');
    }

    if (context.careerContext) {
      availableFeatures.push('career_insights', 'professional_guidance');
    } else {
      failedFeatures.push('career_insights');
    }

    if (context.personalityVectors) {
      availableFeatures.push('advanced_matching', 'personalized_recommendations');
    } else {
      failedFeatures.push('advanced_matching');
    }

    setEnhancementState({
      currentLevel: context.enhancementLevel,
      availableFeatures,
      loadingFeatures: [],
      failedFeatures,
      isFullyEnhanced: context.enhancementLevel === 'full'
    });
  }, []);

  const getFeatureStatus = useCallback((feature: string): 'available' | 'loading' | 'failed' | 'unavailable' => {
    if (enhancementState.availableFeatures.includes(feature)) return 'available';
    if (enhancementState.loadingFeatures.includes(feature)) return 'loading';
    if (enhancementState.failedFeatures.includes(feature)) return 'failed';
    return 'unavailable';
  }, [enhancementState]);

  const getContextualPrompt = useCallback((userInput: string): string => {
    if (!enhancedContext) {
      return `${basicContext.displayName || 'Friend'}, I'm here to support your spiritual journey. ${userInput}`;
    }

    const traits = basicContext.coreTraits.slice(0, 2);
    const traitContext = traits.length > 0 ? ` Your ${traits.join(' & ')} nature` : '';
    
    switch (enhancedContext.enhancementLevel) {
      case 'full':
        return `As your personalized guide who understands your complete blueprint,${traitContext} brings unique gifts to this exploration. ${userInput}`;
      case 'partial':
        return `Drawing on what I know about your personality${traitContext ? ` as a ${traits.join(' & ')}` : ''}, let's explore this together. ${userInput}`;
      default:
        return `${basicContext.displayName || 'Friend'}, I'm getting to know your unique journey.${traitContext} is part of what makes you special. ${userInput}`;
    }
  }, [basicContext, enhancedContext]);

  return {
    enhancementState,
    enhancedContext,
    getFeatureStatus,
    getContextualPrompt,
    isReady: true, // Always ready for basic conversation
    canStartChat: true // Always can start chatting
  };
};
