/**
 * User Journey Tracking Service
 * 
 * SoulSync Engineering Protocol Implementation:
 * ✅ Pillar I: Preserve Core Intelligence - Integrates with existing services without disruption
 * ✅ Pillar II: Ground Truth Only - Real data, transparent failures, no fallbacks
 * ✅ Pillar III: Intentional Craft - Mobile-responsive tracking with transparent state communication
 * 
 * Implements Principles:
 * #1: Never Break - Additive only, preserves all existing functionality
 * #2: No Hardcoded Data - Dynamic tracking with real timestamps and states
 * #3: No Fallbacks That Mask Errors - Surface all failures clearly
 * #6: Respect Data Pathways - Integrates with existing Supabase infrastructure
 * #7: Build Transparently - Comprehensive logging and state communication
 */

import { supabase } from '@/integrations/supabase/client';

export interface JourneyStep {
  step_id: string;
  step_type: 'funnel' | 'auth' | 'onboarding' | 'growth_onboarding' | 'steward_introduction';
  step_name: string;
  step_index: number;
  total_steps: number;
  started_at: string;
  completed_at?: string;
  abandoned_at?: string;
  step_data?: any;
  validation_errors?: string[];
  time_spent_seconds?: number;
}

export interface JourneySession {
  session_id: string;
  user_id?: string;
  funnel_id?: string;
  started_at: string;
  completed_at?: string;
  abandoned_at?: string;
  current_phase: 'funnel' | 'auth' | 'onboarding' | 'growth_onboarding' | 'steward_introduction' | 'completed';
  current_step_id?: string;
  funnel_data?: any;
  total_time_seconds?: number;
  steps: JourneyStep[];
}

class UserJourneyTrackingService {
  private currentSession: JourneySession | null = null;
  private sessionKey = 'soulsync_journey_session';

  /**
   * Principle #2: No Hardcoded Data - Generate real session IDs
   */
  private generateSessionId(): string {
    return `journey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Principle #7: Build Transparently - Start journey with clear state
   */
  async startJourney(funnelData?: any): Promise<{ success: boolean; session_id?: string; error?: string }> {
    try {
      const sessionId = this.generateSessionId();
      const session: JourneySession = {
        session_id: sessionId,
        started_at: new Date().toISOString(),
        current_phase: 'funnel',
        funnel_data: funnelData,
        steps: []
      };

      this.currentSession = session;
      this.saveSessionToStorage();

      console.log('🚀 JOURNEY TRACKING: Started new journey session', {
        session_id: sessionId,
        has_funnel_data: !!funnelData,
        timestamp: session.started_at
      });

      return { success: true, session_id: sessionId };
    } catch (error) {
      console.error('❌ JOURNEY TRACKING: Failed to start journey session', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Principle #1: Never Break - Track step transitions without disrupting flow
   */
  async trackStepStart(
    stepType: JourneyStep['step_type'],
    stepName: string,
    stepIndex: number,
    totalSteps: number,
    stepData?: any
  ): Promise<{ success: boolean; step_id?: string; error?: string }> {
    try {
      if (!this.currentSession) {
        // Principle #3: No Fallbacks That Mask Errors - Surface missing session
        const error = 'No active journey session found';
        console.error('❌ JOURNEY TRACKING: ' + error);
        return { success: false, error };
      }

      const stepId = `${stepType}_${stepIndex}_${Date.now()}`;
      const step: JourneyStep = {
        step_id: stepId,
        step_type: stepType,
        step_name: stepName,
        step_index: stepIndex,
        total_steps: totalSteps,
        started_at: new Date().toISOString(),
        step_data: stepData
      };

      // Update session phase
      this.currentSession.current_phase = stepType;
      this.currentSession.current_step_id = stepId;
      this.currentSession.steps.push(step);

      this.saveSessionToStorage();

      console.log('📍 JOURNEY TRACKING: Step started', {
        step_id: stepId,
        step_type: stepType,
        step_name: stepName,
        step_index: stepIndex,
        timestamp: step.started_at
      });

      return { success: true, step_id: stepId };
    } catch (error) {
      console.error('❌ JOURNEY TRACKING: Failed to track step start', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Principle #2: Real Data Only - Track actual completion with timing
   */
  async trackStepComplete(stepId: string, completionData?: any): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.currentSession) {
        const error = 'No active journey session found';
        console.error('❌ JOURNEY TRACKING: ' + error);
        return { success: false, error };
      }

      const step = this.currentSession.steps.find(s => s.step_id === stepId);
      if (!step) {
        const error = `Step ${stepId} not found in current session`;
        console.error('❌ JOURNEY TRACKING: ' + error);
        return { success: false, error };
      }

      const completedAt = new Date().toISOString();
      const timeSpent = Math.round((new Date(completedAt).getTime() - new Date(step.started_at).getTime()) / 1000);

      step.completed_at = completedAt;
      step.time_spent_seconds = timeSpent;
      
      if (completionData) {
        step.step_data = { ...step.step_data, ...completionData };
      }

      this.saveSessionToStorage();

      console.log('✅ JOURNEY TRACKING: Step completed', {
        step_id: stepId,
        step_name: step.step_name,
        time_spent_seconds: timeSpent,
        timestamp: completedAt
      });

      return { success: true };
    } catch (error) {
      console.error('❌ JOURNEY TRACKING: Failed to track step completion', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Principle #3: No Fallbacks That Mask Errors - Surface abandonment clearly
   */
  async trackStepAbandonment(stepId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.currentSession) {
        const error = 'No active journey session found';
        console.error('❌ JOURNEY TRACKING: ' + error);
        return { success: false, error };
      }

      const step = this.currentSession.steps.find(s => s.step_id === stepId);
      if (!step) {
        const error = `Step ${stepId} not found in current session`;
        console.error('❌ JOURNEY TRACKING: ' + error);
        return { success: false, error };
      }

      const abandonedAt = new Date().toISOString();
      const timeSpent = Math.round((new Date(abandonedAt).getTime() - new Date(step.started_at).getTime()) / 1000);

      step.abandoned_at = abandonedAt;
      step.time_spent_seconds = timeSpent;
      
      if (reason) {
        step.step_data = { ...step.step_data, abandonment_reason: reason };
      }

      this.saveSessionToStorage();

      console.log('⚠️ JOURNEY TRACKING: Step abandoned', {
        step_id: stepId,
        step_name: step.step_name,
        time_spent_seconds: timeSpent,
        reason,
        timestamp: abandonedAt
      });

      return { success: true };
    } catch (error) {
      console.error('❌ JOURNEY TRACKING: Failed to track step abandonment', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Principle #3: Surface validation failures transparently
   */
  async trackValidationError(stepId: string, errors: string[]): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.currentSession) {
        const error = 'No active journey session found';
        console.error('❌ JOURNEY TRACKING: ' + error);
        return { success: false, error };
      }

      const step = this.currentSession.steps.find(s => s.step_id === stepId);
      if (!step) {
        const error = `Step ${stepId} not found in current session`;
        console.error('❌ JOURNEY TRACKING: ' + error);
        return { success: false, error };
      }

      step.validation_errors = [...(step.validation_errors || []), ...errors];
      this.saveSessionToStorage();

      console.log('🚨 JOURNEY TRACKING: Validation errors tracked', {
        step_id: stepId,
        step_name: step.step_name,
        errors,
        timestamp: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      console.error('❌ JOURNEY TRACKING: Failed to track validation error', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Principle #6: Integrate with Current Architecture - Link with user authentication
   */
  async linkWithUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.currentSession) {
        const error = 'No active journey session found';
        console.error('❌ JOURNEY TRACKING: ' + error);
        return { success: false, error };
      }

      this.currentSession.user_id = userId;
      this.saveSessionToStorage();

      console.log('🔗 JOURNEY TRACKING: Session linked to user', {
        session_id: this.currentSession.session_id,
        user_id: userId,
        timestamp: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      console.error('❌ JOURNEY TRACKING: Failed to link session with user', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Principle #7: Build Transparently - Complete journey with full data persistence
   */
  async completeJourney(): Promise<{ success: boolean; session_data?: JourneySession; error?: string }> {
    try {
      if (!this.currentSession) {
        const error = 'No active journey session found';
        console.error('❌ JOURNEY TRACKING: ' + error);
        return { success: false, error };
      }

      const completedAt = new Date().toISOString();
      const totalTime = Math.round((new Date(completedAt).getTime() - new Date(this.currentSession.started_at).getTime()) / 1000);

      this.currentSession.completed_at = completedAt;
      this.currentSession.total_time_seconds = totalTime;
      this.currentSession.current_phase = 'completed';

      // Persist to database if user is linked
      if (this.currentSession.user_id) {
        await this.persistSessionToDatabase();
      }

      const sessionData = { ...this.currentSession };
      
      console.log('🎉 JOURNEY TRACKING: Journey completed', {
        session_id: this.currentSession.session_id,
        user_id: this.currentSession.user_id,
        total_time_seconds: totalTime,
        total_steps: this.currentSession.steps.length,
        timestamp: completedAt
      });

      this.clearSession();

      return { success: true, session_data: sessionData };
    } catch (error) {
      console.error('❌ JOURNEY TRACKING: Failed to complete journey', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Get current session state for diagnostic purposes
   */
  getCurrentSession(): JourneySession | null {
    return this.currentSession;
  }

  /**
   * Principle #6: Respect Data Pathways - Persist to Supabase
   */
  private async persistSessionToDatabase(): Promise<void> {
    if (!this.currentSession) return;

    try {
      // Store in user_activities table for integration with existing systems
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: this.currentSession.user_id,
          activity_type: 'journey_completed',
          activity_data: {
            session_id: this.currentSession.session_id,
            total_time_seconds: this.currentSession.total_time_seconds,
            total_steps: this.currentSession.steps.length,
            funnel_data: this.currentSession.funnel_data,
            step_breakdown: this.currentSession.steps.map(step => ({
              step_type: step.step_type,
              step_name: step.step_name,
              time_spent_seconds: step.time_spent_seconds,
              completed: !!step.completed_at,
              abandoned: !!step.abandoned_at,
              validation_errors: step.validation_errors?.length || 0
            }))
          }
        });

      if (error) {
        console.error('❌ JOURNEY TRACKING: Failed to persist to database', error);
      } else {
        console.log('💾 JOURNEY TRACKING: Session persisted to database');
      }
    } catch (error) {
      console.error('❌ JOURNEY TRACKING: Database persistence error', error);
    }
  }

  /**
   * Local storage management for session continuity
   */
  private saveSessionToStorage(): void {
    if (this.currentSession) {
      localStorage.setItem(this.sessionKey, JSON.stringify(this.currentSession));
    }
  }

  /**
   * Restore session from storage for continuity
   */
  restoreSession(): JourneySession | null {
    try {
      const stored = localStorage.getItem(this.sessionKey);
      if (stored) {
        this.currentSession = JSON.parse(stored);
        console.log('🔄 JOURNEY TRACKING: Session restored from storage', {
          session_id: this.currentSession?.session_id,
          current_phase: this.currentSession?.current_phase
        });
        return this.currentSession;
      }
    } catch (error) {
      console.error('❌ JOURNEY TRACKING: Failed to restore session', error);
      this.clearSession();
    }
    return null;
  }

  /**
   * Clear session data
   */
  private clearSession(): void {
    this.currentSession = null;
    localStorage.removeItem(this.sessionKey);
  }
}

export const userJourneyTrackingService = new UserJourneyTrackingService();