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

  // Convert agent plan to week format - ENHANCED to parse actual AI-generated content
  private convertAgentPlanToWeeks(evolutionResult: any, program: GrowthProgram): ProgramWeek[] {
    console.log('🎯 Converting agent plan to weeks:', evolutionResult);
    
    const weeks: ProgramWeek[] = [];
    const weekPlan = evolutionResult?.week_plan || '';
    
    // Parse the Plan Branches from the AI-generated content
    const planBranches = this.extractPlanBranches(weekPlan);
    
    if (planBranches.length > 0) {
      // Create weeks based on the actual Plan Branches
      planBranches.forEach((branch, index) => {
        const weekNumber = index + 1;
        weeks.push({
          week_number: weekNumber,
          theme: this.extractThemeFromBranch(branch.title),
          focus_area: branch.strategy,
          key_activities: branch.actionSteps,
          tools_unlocked: this.generateToolsFromBranch(branch),
          completion_criteria: this.generateCompletionCriteria(branch),
          is_unlocked: weekNumber <= program.current_week,
          is_completed: weekNumber < program.current_week,
          completion_date: weekNumber < program.current_week ? new Date().toISOString() : undefined
        });
      });
      
      // If we have fewer plan branches than total weeks, fill remaining with integration weeks
      for (let i = planBranches.length + 1; i <= program.total_weeks; i++) {
        weeks.push({
          week_number: i,
          theme: 'integration',
          focus_area: 'Integration and refinement of chosen approach',
          key_activities: ['Review progress', 'Refine approach', 'Plan next steps'],
          tools_unlocked: ['Progress analytics', 'Integration tools'],
          completion_criteria: ['Complete integration review', 'Set future goals'],
          is_unlocked: i <= program.current_week,
          is_completed: i < program.current_week,
          completion_date: i < program.current_week ? new Date().toISOString() : undefined
        });
      }
    } else {
      // Fallback to basic weeks if parsing fails
      for (let i = 1; i <= program.total_weeks; i++) {
        weeks.push({
          week_number: i,
          theme: 'foundation',
          focus_area: evolutionResult?.week_plan?.slice(0, 100) || 'AI-generated focus area',
          key_activities: ['Explore growth opportunities'],
          tools_unlocked: ['Reflection tools', 'Progress tracker'],
          completion_criteria: ['Complete core activities', 'Submit reflection'],
          is_unlocked: i <= program.current_week,
          is_completed: i < program.current_week,
          completion_date: i < program.current_week ? new Date().toISOString() : undefined
        });
      }
    }
    
    console.log('✅ Converted to', weeks.length, 'weeks with themes:', weeks.map(w => w.theme));
    return weeks;
  }

  // Parse Plan Branches from AI-generated content
  private extractPlanBranches(weekPlan: string): Array<{
    title: string;
    strategy: string;
    actionSteps: string[];
    advantages: string[];
    challenges: string[];
  }> {
    const branches: Array<{
      title: string;
      strategy: string;
      actionSteps: string[];
      advantages: string[];
      challenges: string[];
    }> = [];
    
    // Match Plan Branch patterns in the AI content
    const branchRegex = /(?:Plan Branch \d+|#### \*\*Plan Branch \d+)[:\s]*([^*\n]+)[\s\S]*?Strategy[:\s]*([^*\n]+)[\s\S]*?Action Steps[:\s]*([\s\S]*?)(?=\*\*Advantages|Advantages|$)/gi;
    
    let match;
    while ((match = branchRegex.exec(weekPlan)) !== null) {
      const [, title, strategy, actionStepsText] = match;
      
      // Extract action steps
      const actionSteps = this.extractListItems(actionStepsText);
      
      branches.push({
        title: title?.trim() || 'Growth Plan Branch',
        strategy: strategy?.trim() || 'Strategic approach to growth',
        actionSteps: actionSteps.length > 0 ? actionSteps : ['Engage in growth activities'],
        advantages: ['Personalized approach', 'Blueprint-aligned'],
        challenges: ['Requires commitment', 'Needs consistent effort']
      });
    }
    
    // If no Plan Branches found, try to extract any structured content
    if (branches.length === 0) {
      const sections = weekPlan.split(/###|\*\*/).filter(s => s.trim().length > 20);
      sections.slice(0, 3).forEach((section, index) => {
        branches.push({
          title: `Growth Approach ${index + 1}`,
          strategy: section.slice(0, 100).trim(),
          actionSteps: this.extractListItems(section),
          advantages: ['AI-optimized', 'Personalized'],
          challenges: ['Requires dedication']
        });
      });
    }
    
    return branches;
  }

  // Extract list items from text
  private extractListItems(text: string): string[] {
    const items: string[] = [];
    
    // Try bullet points first
    const bulletMatches = text.match(/[-*]\s*\*\*([^*]+)\*\*[:\s]*([^*\n]+)/g);
    if (bulletMatches) {
      bulletMatches.forEach(match => {
        const cleaned = match.replace(/[-*]\s*\*\*([^*]+)\*\*[:\s]*/, '').trim();
        if (cleaned) items.push(cleaned);
      });
    }
    
    // Try numbered lists
    if (items.length === 0) {
      const numberedMatches = text.match(/\d+\.\s*([^\n]+)/g);
      if (numberedMatches) {
        numberedMatches.forEach(match => {
          const cleaned = match.replace(/\d+\.\s*/, '').trim();
          if (cleaned) items.push(cleaned);
        });
      }
    }
    
    // Fallback to sentence extraction
    if (items.length === 0) {
      const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 10);
      items.push(...sentences.slice(0, 3).map(s => s.trim()));
    }
    
    return items.filter(item => item.length > 5).slice(0, 4);
  }

  // Convert branch title to theme
  private extractThemeFromBranch(title: string): WeekTheme {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('gradual') || lowerTitle.includes('foundation')) {
      return 'foundation';
    } else if (lowerTitle.includes('intensive') || lowerTitle.includes('transformation')) {
      return 'domain_deep_dive';
    } else if (lowerTitle.includes('balanced') || lowerTitle.includes('integration')) {
      return 'integration';
    } else if (lowerTitle.includes('belief') || lowerTitle.includes('excavation')) {
      return 'belief_excavation';
    } else if (lowerTitle.includes('blueprint') || lowerTitle.includes('activation')) {
      return 'blueprint_activation';
    }
    
    return 'foundation';
  }

  // Generate tools based on branch content
  private generateToolsFromBranch(branch: any): string[] {
    const tools = ['Progress Tracker'];
    
    if (branch.title.toLowerCase().includes('gradual')) {
      tools.push('Daily Reflection Journal', 'Habit Builder');
    } else if (branch.title.toLowerCase().includes('intensive')) {
      tools.push('Goal Accelerator', 'Focus Timer');
    } else if (branch.title.toLowerCase().includes('balanced')) {
      tools.push('Energy Tracker', 'Mindfulness Timer');
    }
    
    return tools;
  }

  // Generate completion criteria based on branch
  private generateCompletionCriteria(branch: any): string[] {
    return [
      'Complete core activities from action steps',
      'Submit weekly reflection',
      'Track progress on key metrics'
    ];
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
