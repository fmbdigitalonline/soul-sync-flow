/**
 * Agent Growth Integration - Bridge between existing growth system and new agent-driven system
 * Provides backward compatibility while introducing agent orchestration
 */

import { adaptiveGrowthService } from './adaptive-growth-service';
import { growthProgramService } from './growth-program-service';
import { enhancedPIEAgentService } from './enhanced-pie-agent-service';
import { LayeredBlueprint } from '@/types/personality-modules';
import { GrowthProgram, LifeDomain, ProgramWeek, WeekTheme } from '@/types/growth-program';
import { supabase } from '@/integrations/supabase/client';

interface FeedbackSignal {
  type: 'explicit' | 'behavioral' | 'temporal';
  action: string;
  value: any;
  confidence: number;
  timestamp: string;
  context?: any;
}

export class AgentGrowthIntegration {
  private telemetryQueue: FeedbackSignal[] = [];
  private isAgentModeEnabled = true; // Feature flag for gradual rollout

  // Get current program with fallback to original service
  async getCurrentProgram(userId: string): Promise<GrowthProgram | null> {
    return await growthProgramService.getCurrentProgram(userId);
  }

  // Enhanced program creation with agent orchestration
  async createProgram(userId: string, domain: LifeDomain, blueprint: LayeredBlueprint): Promise<GrowthProgram> {
    console.log('🤖 Creating program with agent orchestration');
    
    try {
      if (this.isAgentModeEnabled) {
        // Use new agent-driven system
        const adaptiveProgram = await adaptiveGrowthService.generateAdaptiveProgram(
          userId,
          domain,
          blueprint
        );
        
        // Convert to compatible format for UI
        return this.convertAdaptiveProgramToGrowthProgram(adaptiveProgram);
      } else {
        // Fallback to original system
        return await growthProgramService.createProgram(userId, domain, blueprint);
      }
    } catch (error) {
      console.error('❌ Agent program creation failed, falling back to original:', error);
      return await growthProgramService.createProgram(userId, domain, blueprint);
    }
  }

  // Enhanced week generation with agent intelligence
  async generateWeeklyProgram(program: GrowthProgram): Promise<ProgramWeek[]> {
    console.log('🧠 Generating weekly program with AI agents');
    
    try {
      if (this.isAgentModeEnabled && program.user_id) {
        // Get user's recent progress and feedback
        const weekProgress = await this.gatherWeekProgress(program);
        
        // Use agent system for evolved week planning
        const evolutionResult = await adaptiveGrowthService.evolveWeeklyProgram(
          program.id,
          program.user_id,
          weekProgress
        );
        
        // Convert agent output to ProgramWeek format
        return this.convertAgentPlanToWeeks(evolutionResult, program);
      } else {
        // Fallback to original system
        return await growthProgramService.generateWeeklyProgram(program);
      }
    } catch (error) {
      console.error('❌ Agent week generation failed, falling back:', error);
      return await growthProgramService.generateWeeklyProgram(program);
    }
  }

  // Enhanced progress tracking with behavioral signals
  async updateProgramProgress(programId: string, updates: any): Promise<void> {
    console.log('📊 Updating program progress with behavioral tracking');
    
    // Always update the original system
    await growthProgramService.updateProgramProgress(programId, updates);
    
    if (this.isAgentModeEnabled) {
      // Extract behavioral signals from updates
      const feedbackSignals = this.extractFeedbackSignals(updates);
      
      if (feedbackSignals.length > 0) {
        // Queue for processing
        this.telemetryQueue.push(...feedbackSignals);
        
        // Process signals if queue is large enough
        if (this.telemetryQueue.length >= 5) {
          await this.processTelemetryQueue(programId);
        }
      }
    }
  }

  // Track user interactions for agent learning
  trackUserInteraction(action: string, context: any): void {
    if (!this.isAgentModeEnabled) return;
    
    const signal: FeedbackSignal = {
      type: 'behavioral',
      action,
      value: context,
      confidence: this.calculateInteractionConfidence(action, context),
      timestamp: new Date().toISOString(),
      context
    };
    
    this.telemetryQueue.push(signal);
    console.log('📡 Tracked interaction:', action, 'confidence:', signal.confidence);
  }

  // Process accumulated telemetry data
  private async processTelemetryQueue(programId: string): Promise<void> {
    if (this.telemetryQueue.length === 0) return;
    
    console.log('🔄 Processing telemetry queue:', this.telemetryQueue.length, 'signals');
    
    try {
      // Get program to find user ID
      const { data: program } = await supabase
        .from('growth_programs')
        .select('user_id')
        .eq('id', programId)
        .single();
      
      if (program?.user_id) {
        // Send signals to adaptive growth service for processing
        await adaptiveGrowthService.processFeedbackAndAdapt(
          programId,
          program.user_id,
          [...this.telemetryQueue]
        );
      }
      
      // Clear processed signals
      this.telemetryQueue = [];
    } catch (error) {
      console.error('❌ Failed to process telemetry queue:', error);
      // Keep signals for retry
    }
  }

  // Generate proactive insights using enhanced PIE
  async generateProactiveInsights(userId: string, currentContext: any): Promise<any[]> {
    if (!this.isAgentModeEnabled) return [];
    
    try {
      return await adaptiveGrowthService.generateProactiveInsights(userId, currentContext);
    } catch (error) {
      console.error('❌ Failed to generate proactive insights:', error);
      return [];
    }
  }

  // Detect and handle blueprint drift
  async checkBlueprintAlignment(userId: string, recentBehavior: any[]): Promise<any> {
    if (!this.isAgentModeEnabled) return null;
    
    try {
      return await adaptiveGrowthService.detectBlueprintDrift(userId, recentBehavior);
    } catch (error) {
      console.error('❌ Failed to check blueprint alignment:', error);
      return null;
    }
  }

  // Convert adaptive program to legacy format
  private convertAdaptiveProgramToGrowthProgram(adaptiveProgram: any): GrowthProgram {
    return {
      id: adaptiveProgram.id,
      user_id: adaptiveProgram.user_id,
      program_type: adaptiveProgram.program_type,
      domain: adaptiveProgram.domain,
      current_week: adaptiveProgram.current_week,
      total_weeks: adaptiveProgram.total_weeks,
      status: adaptiveProgram.status,
      started_at: adaptiveProgram.started_at,
      expected_completion: adaptiveProgram.expected_completion,
      actual_completion: adaptiveProgram.actual_completion,
      blueprint_params: adaptiveProgram.blueprint_params,
      progress_metrics: adaptiveProgram.progress_metrics,
      session_schedule: adaptiveProgram.session_schedule,
      adaptation_history: adaptiveProgram.adaptation_history || [],
      created_at: adaptiveProgram.created_at,
      updated_at: adaptiveProgram.updated_at
    };
  }

  // Convert agent plan to week format
  private convertAgentPlanToWeeks(evolutionResult: any, program: GrowthProgram): ProgramWeek[] {
    // For now, generate basic weeks based on agent output
    // This would be enhanced with proper agent plan parsing
    const weeks: ProgramWeek[] = [];
    
    for (let i = 1; i <= program.total_weeks; i++) {
      weeks.push({
        week_number: i,
        theme: 'foundation',
        focus_area: evolutionResult?.week_plan?.slice(0, 100) || 'Agent-generated focus area',
        key_activities: ['Agent-suggested activity'],
        tools_unlocked: ['Reflection tools', 'Progress tracker'],
        completion_criteria: ['Complete core activities', 'Submit reflection'],
        is_unlocked: i <= program.current_week,
        is_completed: i < program.current_week,
        completion_date: i < program.current_week ? new Date().toISOString() : undefined
      });
    }
    
    return weeks;
  }

  // Gather progress data for agent processing
  private async gatherWeekProgress(program: GrowthProgram): Promise<any> {
    return {
      current_week: program.current_week,
      progress_metrics: program.progress_metrics,
      recent_activities: [], // Would be populated from activity logs
      completion_rate: (program.current_week / program.total_weeks) * 100
    };
  }

  // Extract behavioral signals from updates
  private extractFeedbackSignals(updates: any): FeedbackSignal[] {
    const signals: FeedbackSignal[] = [];
    
    if (updates.status) {
      signals.push({
        type: 'explicit',
        action: 'status_change',
        value: updates.status,
        confidence: 0.9,
        timestamp: new Date().toISOString(),
        context: updates
      });
    }
    
    if (updates.current_week) {
      signals.push({
        type: 'behavioral',
        action: 'week_progression',
        value: updates.current_week,
        confidence: 0.8,
        timestamp: new Date().toISOString(),
        context: updates
      });
    }
    
    return signals;
  }

  // Calculate confidence score for interactions
  private calculateInteractionConfidence(action: string, context: any): number {
    // High confidence actions
    const highConfidenceActions = ['complete_session', 'mark_complete', 'submit_reflection'];
    if (highConfidenceActions.includes(action)) return 0.9;
    
    // Medium confidence actions
    const mediumConfidenceActions = ['skip_activity', 'modify_goal', 'request_help'];
    if (mediumConfidenceActions.includes(action)) return 0.7;
    
    // Low confidence actions
    return 0.5;
  }

  // Force process any remaining telemetry (useful for session end)
  async flushTelemetry(programId: string): Promise<void> {
    if (this.telemetryQueue.length > 0) {
      await this.processTelemetryQueue(programId);
    }
  }

  // Enable/disable agent mode (for gradual rollout)
  setAgentMode(enabled: boolean): void {
    this.isAgentModeEnabled = enabled;
    console.log('🎛️ Agent mode:', enabled ? 'enabled' : 'disabled');
  }
}

export const agentGrowthIntegration = new AgentGrowthIntegration();
