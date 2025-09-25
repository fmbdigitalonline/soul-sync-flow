import { useState, useEffect, useCallback } from 'react';
import { SubconsciousOrbController, SubconsciousOrbState } from '@/services/subconscious-orb-controller';
import { useCoordinatedLoading } from '@/hooks/use-coordinated-loading';

/**
 * Hook for managing subconscious orb integration with conversations
 * Provides real-time shadow pattern detection and visual state management
 */
export const useSubconsciousOrb = () => {
  const [orbState, setOrbState] = useState<SubconsciousOrbState>({
    mode: 'dormant',
    pattern: null,
    hermeticAdvice: null,
    confidence: 0,
    timestamp: Date.now(),
    processingTime: 0
  });
  
  const [isEnabled, setIsEnabled] = useState(true);
  const { startLoading, completeLoading } = useCoordinatedLoading();
  
  // Initialize subconscious orb system
  useEffect(() => {
    const initializeOrb = async () => {
      try {
        await SubconsciousOrbController.initialize();
        console.log('✅ Subconscious orb system initialized');
      } catch (error) {
        console.error('🚨 Subconscious orb initialization error:', error);
        setIsEnabled(false);
      }
    };
    
    initializeOrb();
  }, []);
  
  // Subscribe to orb state changes
  useEffect(() => {
    if (!isEnabled) return;
    
    const unsubscribe = SubconsciousOrbController.addStateListener((newState) => {
      setOrbState(newState);
    });
    
    return unsubscribe;
  }, [isEnabled]);
  
  // Process message for shadow pattern detection
  const processMessage = useCallback(async (messageContent: string, messageId: string): Promise<void> => {
    if (!isEnabled || !messageContent.trim()) return;
    
    try {
      // Use coordinated loading for shadow detection
      const abortController = startLoading('shadow_detection');
      
      try {
        await SubconsciousOrbController.processMessage(messageContent, messageId);
        completeLoading('shadow_detection');
      } catch (error) {
        console.error('🚨 Shadow detection error:', error);
        completeLoading('shadow_detection');
        abortController.abort();
      }
      
    } catch (error) {
      console.error('🚨 Message processing error:', error);
    }
  }, [isEnabled, startLoading, completeLoading]);
  
  // Handle orb click interaction
  const handleOrbClick = useCallback((): string | null => {
    if (!isEnabled) return null;
    
    const advice = SubconsciousOrbController.handleOrbClick();
    return advice;
  }, [isEnabled]);
  
  // Get session insights - Enhanced with database intelligence
  const getSessionInsights = useCallback(async (userId?: string, sessionId?: string) => {
    if (!isEnabled) return null;
    
    return await SubconsciousOrbController.getSessionInsights(userId, sessionId);
  }, [isEnabled]);
  
  // Get performance metrics
  const getPerformanceMetrics = useCallback(() => {
    if (!isEnabled) return null;
    
    return SubconsciousOrbController.getPerformanceMetrics();
  }, [isEnabled]);
  
  // Toggle orb functionality
  const toggleOrb = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);
  
  return {
    // State
    orbState,
    isEnabled,
    
    // Actions
    processMessage,
    handleOrbClick,
    toggleOrb,
    
    // Insights
    getSessionInsights,
    getPerformanceMetrics,
    
    // Computed properties for orb display
    subconsciousMode: orbState.mode,
    patternDetected: orbState.pattern !== null,
    adviceReady: orbState.hermeticAdvice !== null,
    confidence: orbState.confidence,
    processingTime: orbState.processingTime,
  };
};