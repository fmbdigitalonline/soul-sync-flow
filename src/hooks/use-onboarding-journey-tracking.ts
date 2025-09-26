/**
 * Journey Tracking Hook
 * 
 * SoulSync Engineering Protocol Implementation:
 * ✅ Pillar I: Preserve Core Intelligence - Integrates seamlessly with existing React patterns
 * ✅ Pillar II: Ground Truth Only - Real state management with transparent loading indicators
 * ✅ Pillar III: Intentional Craft - Mobile-responsive state communication
 * 
 * Implements Principles:
 * #1: Never Break - Additive hook that doesn't disrupt existing components
 * #2: No Hardcoded Data - Dynamic state based on real user interactions
 * #7: Build Transparently - Clear loading states and error communication
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userJourneyTrackingService, JourneySession, JourneyStep } from '@/services/user-journey-tracking-service';

interface UseJourneyTrackingReturn {
  // State
  currentSession: JourneySession | null;
  isTracking: boolean;
  currentStepId: string | null;
  
  // Actions
  startJourney: (funnelData?: any) => Promise<{ success: boolean; session_id?: string; error?: string }>;
  trackStepStart: (
    stepType: JourneyStep['step_type'],
    stepName: string,
    stepIndex: number,
    totalSteps: number,
    stepData?: any
  ) => Promise<{ success: boolean; step_id?: string; error?: string }>;
  trackStepComplete: (stepId?: string, completionData?: any) => Promise<{ success: boolean; error?: string }>;
  trackStepAbandonment: (stepId?: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  trackValidationError: (stepId: string, errors: string[]) => Promise<{ success: boolean; error?: string }>;
  completeJourney: () => Promise<{ success: boolean; session_data?: JourneySession; error?: string }>;
  
  // Diagnostic
  getSessionSummary: () => {
    totalSteps: number;
    completedSteps: number;
    abandonedSteps: number;
    currentPhase: string;
    totalTimeSeconds: number;
  } | null;
}

export const useJourneyTracking = (): UseJourneyTrackingReturn => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<JourneySession | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  
  // Ref to prevent multiple session restoration
  const sessionRestoredRef = useRef(false);

  /**
   * Principle #7: Build Transparently - Restore session state on mount
   */
  useEffect(() => {
    if (sessionRestoredRef.current) return;
    
    const restored = userJourneyTrackingService.restoreSession();
    if (restored) {
      setCurrentSession(restored);
      setIsTracking(true);
      setCurrentStepId(restored.current_step_id || null);
      console.log('🔄 JOURNEY HOOK: Session state restored');
    }
    
    sessionRestoredRef.current = true;
  }, []);

  /**
   * Principle #6: Respect Data Pathways - Link session with authenticated user
   */
  useEffect(() => {
    if (user && currentSession && !currentSession.user_id) {
      userJourneyTrackingService.linkWithUser(user.id);
      // Update local state
      setCurrentSession(prev => prev ? { ...prev, user_id: user.id } : null);
      console.log('🔗 JOURNEY HOOK: Session linked to authenticated user');
    }
  }, [user, currentSession]);

  /**
   * Principle #1: Never Break - Start journey without disrupting existing flow
   */
  const startJourney = useCallback(async (funnelData?: any) => {
    setIsTracking(true);
    
    const result = await userJourneyTrackingService.startJourney(funnelData);
    
    if (result.success) {
      const session = userJourneyTrackingService.getCurrentSession();
      setCurrentSession(session);
      console.log('🚀 JOURNEY HOOK: Journey started successfully');
    } else {
      setIsTracking(false);
      console.error('❌ JOURNEY HOOK: Failed to start journey', result.error);
    }
    
    return result;
  }, []);

  /**
   * Principle #2: Real Data Only - Track actual step transitions
   */
  const trackStepStart = useCallback(async (
    stepType: JourneyStep['step_type'],
    stepName: string,
    stepIndex: number,
    totalSteps: number,
    stepData?: any
  ) => {
    const result = await userJourneyTrackingService.trackStepStart(
      stepType,
      stepName,
      stepIndex,
      totalSteps,
      stepData
    );
    
    if (result.success && result.step_id) {
      setCurrentStepId(result.step_id);
      // Update session state
      const session = userJourneyTrackingService.getCurrentSession();
      setCurrentSession(session);
      console.log('📍 JOURNEY HOOK: Step tracking started', { stepName, stepIndex });
    }
    
    return result;
  }, []);

  /**
   * Principle #2: Real Data Only - Track actual completions with timing
   */
  const trackStepComplete = useCallback(async (stepId?: string, completionData?: any) => {
    const targetStepId = stepId || currentStepId;
    if (!targetStepId) {
      const error = 'No step ID provided and no current step active';
      console.error('❌ JOURNEY HOOK: ' + error);
      return { success: false, error };
    }
    
    const result = await userJourneyTrackingService.trackStepComplete(targetStepId, completionData);
    
    if (result.success) {
      // Update session state
      const session = userJourneyTrackingService.getCurrentSession();
      setCurrentSession(session);
      console.log('✅ JOURNEY HOOK: Step completion tracked');
    }
    
    return result;
  }, [currentStepId]);

  /**
   * Principle #3: No Fallbacks That Mask Errors - Surface abandonment clearly
   */
  const trackStepAbandonment = useCallback(async (stepId?: string, reason?: string) => {
    const targetStepId = stepId || currentStepId;
    if (!targetStepId) {
      const error = 'No step ID provided and no current step active';
      console.error('❌ JOURNEY HOOK: ' + error);
      return { success: false, error };
    }
    
    const result = await userJourneyTrackingService.trackStepAbandonment(targetStepId, reason);
    
    if (result.success) {
      // Update session state
      const session = userJourneyTrackingService.getCurrentSession();
      setCurrentSession(session);
      console.log('⚠️ JOURNEY HOOK: Step abandonment tracked');
    }
    
    return result;
  }, [currentStepId]);

  /**
   * Principle #3: Surface validation failures transparently
   */
  const trackValidationError = useCallback(async (stepId: string, errors: string[]) => {
    const result = await userJourneyTrackingService.trackValidationError(stepId, errors);
    
    if (result.success) {
      // Update session state
      const session = userJourneyTrackingService.getCurrentSession();
      setCurrentSession(session);
      console.log('🚨 JOURNEY HOOK: Validation errors tracked');
    }
    
    return result;
  }, []);

  /**
   * Principle #7: Build Transparently - Complete journey with full session data
   */
  const completeJourney = useCallback(async () => {
    const result = await userJourneyTrackingService.completeJourney();
    
    if (result.success) {
      setCurrentSession(null);
      setIsTracking(false);
      setCurrentStepId(null);
      console.log('🎉 JOURNEY HOOK: Journey completed successfully');
    }
    
    return result;
  }, []);

  /**
   * Diagnostic utility for transparent state inspection
   */
  const getSessionSummary = useCallback(() => {
    if (!currentSession) return null;
    
    const completedSteps = currentSession.steps.filter(s => s.completed_at).length;
    const abandonedSteps = currentSession.steps.filter(s => s.abandoned_at).length;
    const totalTimeSeconds = currentSession.total_time_seconds || 
      Math.round((Date.now() - new Date(currentSession.started_at).getTime()) / 1000);
    
    return {
      totalSteps: currentSession.steps.length,
      completedSteps,
      abandonedSteps,
      currentPhase: currentSession.current_phase,
      totalTimeSeconds
    };
  }, [currentSession]);

  return {
    // State
    currentSession,
    isTracking,
    currentStepId,
    
    // Actions
    startJourney,
    trackStepStart,
    trackStepComplete,
    trackStepAbandonment,
    trackValidationError,
    completeJourney,
    
    // Diagnostic
    getSessionSummary
  };
};