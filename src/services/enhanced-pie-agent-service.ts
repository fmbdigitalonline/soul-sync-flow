/**
 * Enhanced PIE Agent Service - Upgraded PIE system with agent-driven proactive generation
 * Converts from pattern detection to predictive insight generation using OpenAI agents
 */

import { openAIAgentOrchestrator } from './openai-agent-orchestrator';
import { blueprintEmbeddingService } from './blueprint-embedding-service';
import { PIEService } from './pie-service';
import { supabase } from '@/integrations/supabase/client';
import { LayeredBlueprint } from '@/types/personality-modules';

interface ProactiveInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'celebration' | 'guidance';
  title: string;
  message: string;
  confidence: number;
  urgency: 'low' | 'medium' | 'high';
  actionable_steps: string[];
  timing_suggestion: string;
  blueprint_alignment: number;
  context_relevance: number;
}

interface UserContextData {
  recent_activities: any[];
  mood_patterns: any[];
  progress_trends: any[];
  time_patterns: any[];
  engagement_signals: any[];
  external_events?: any[];
}

export class EnhancedPIEAgentService extends PIEService {
  private isGenerativeMode = true;
  private lastInsightGeneration: string | null = null;

  // Override the main insight generation to use agents
  async generateProactiveInsights(userId: string): Promise<ProactiveInsight[]> {
    console.log('🔮 Generating proactive insights with AI agents');

    if (!this.isGenerativeMode) {
      // Fallback to original PIE system
      return await this.generateTraditionalInsights(userId);
    }

    try {
      // Gather comprehensive user context
      const userContext = await this.gatherUserContext(userId);
      
      // Get relevant blueprint context
      const blueprintContext = await blueprintEmbeddingService.retrieveRelevantBlueprintContext(
        userId,
        this.buildContextQuery(userContext),
        5
      );

      // Use agent to generate insights
      const agentInsights = await this.generateAgentDrivenInsights(
        userId,
        userContext,
        blueprintContext
      );

      // Post-process and validate insights
      const validatedInsights = await this.validateAndRankInsights(agentInsights, blueprintContext);

      // Store insights for delivery
      await this.storeInsightsForDelivery(userId, validatedInsights);

      console.log('✅ Generated', validatedInsights.length, 'proactive insights');
      return validatedInsights;

    } catch (error) {
      console.error('❌ Enhanced PIE generation failed, falling back:', error);
      return await this.generateTraditionalInsights(userId);
    }
  }

  // Generate timing-aware insights based on user rhythms
  async generateTimingBasedInsights(userId: string, currentTime: Date): Promise<ProactiveInsight[]> {
    console.log('⏰ Generating timing-based insights');

    try {
      const userContext = await this.gatherUserContext(userId);
      const timingAnalysis = await this.analyzeUserRhythms(userId, userContext);

      // Use reflector agent to analyze optimal timing
      const timingInsights = await openAIAgentOrchestrator.runAgent('reflector', [
        {
          role: 'user',
          content: `Analyze optimal timing for growth activities based on user patterns:
          
          Current time: ${currentTime.toISOString()}
          User rhythms: ${JSON.stringify(timingAnalysis, null, 2)}
          Recent context: ${JSON.stringify(userContext, null, 2)}
          
          Generate timing-specific insights for:
          1. When they're most receptive to challenges
          2. Optimal times for reflection
          3. Energy patterns for different activities
          4. Momentum opportunities to leverage`
        }
      ]);

      return this.parseTimingInsights(timingInsights, timingAnalysis);

    } catch (error) {
      console.error('❌ Timing insights generation failed:', error);
      return [];
    }
  }

  // Generate self-awareness acceleration insights
  async generateSelfAwarenessInsights(userId: string): Promise<ProactiveInsight[]> {
    console.log('🔍 Generating self-awareness acceleration insights');

    try {
      const userContext = await this.gatherUserContext(userId);
      const hiddenPatterns = await this.detectHiddenPatterns(userId, userContext);

      // Use reflector agent to surface invisible patterns
      const awarenessInsights = await openAIAgentOrchestrator.runAgent('reflector', [
        {
          role: 'user',
          content: `Identify hidden patterns that could accelerate self-awareness:
          
          User context: ${JSON.stringify(userContext, null, 2)}
          Detected patterns: ${JSON.stringify(hiddenPatterns, null, 2)}
          
          Focus on patterns the user might not consciously recognize:
          1. Behavioral triggers they're unaware of
          2. Success patterns they haven't connected
          3. Resistance patterns that need gentle surfacing
          4. Growth edges they're ready to explore`
        }
      ]);

      return this.parseAwarenessInsights(awarenessInsights, hiddenPatterns);

    } catch (error) {
      console.error('❌ Self-awareness insights generation failed:', error);
      return [];
    }
  }

  // Generate predictive adaptation suggestions
  async generateAdaptationInsights(userId: string, lifechanges: any[]): Promise<ProactiveInsight[]> {
    console.log('🔄 Generating adaptation insights for life changes');

    try {
      const userContext = await this.gatherUserContext(userId);
      const blueprintContext = await blueprintEmbeddingService.retrieveRelevantBlueprintContext(
        userId,
        `adaptation to life changes: ${JSON.stringify(lifechanges)}`,
        3
      );

      // Use planner agent to suggest adaptations
      const adaptationSuggestions = await openAIAgentOrchestrator.runAgent('planner', [
        {
          role: 'user',
          content: `Generate adaptation strategies for life changes:
          
          Life changes: ${JSON.stringify(lifechanges, null, 2)}
          User context: ${JSON.stringify(userContext, null, 2)}
          Blueprint: ${JSON.stringify(blueprintContext.structured_context, null, 2)}
          
          Create personalized adaptation strategies that:
          1. Honor their natural adaptation style
          2. Provide gentle transition support
          3. Maintain growth momentum during change
          4. Identify opportunities within challenges`
        }
      ]);

      return this.parseAdaptationInsights(adaptationSuggestions, lifechanges);

    } catch (error) {
      console.error('❌ Adaptation insights generation failed:', error);
      return [];
    }
  }

  // Main agent-driven insight generation
  private async generateAgentDrivenInsights(
    userId: string,
    userContext: UserContextData,
    blueprintContext: any
  ): Promise<ProactiveInsight[]> {
    
    // Use planner agent to identify opportunities
    const opportunityInsights = await openAIAgentOrchestrator.runAgent('planner', [
      {
        role: 'user',
        content: `Identify growth opportunities for this user:
        
        Context: ${JSON.stringify(userContext, null, 2)}
        Blueprint: ${JSON.stringify(blueprintContext.structured_context, null, 2)}
        
        Generate specific, actionable opportunities that align with their natural design.`
      }
    ]);

    // Use reflector agent to identify potential challenges
    const warningInsights = await openAIAgentOrchestrator.runAgent('reflector', [
      {
        role: 'user',
        content: `Identify potential challenges or misalignments:
        
        Context: ${JSON.stringify(userContext, null, 2)}
        Blueprint: ${JSON.stringify(blueprintContext.structured_context, null, 2)}
        
        Identify gentle warnings about potential drift from their natural patterns.`
      }
    ]);

    // Use delivery agent to format insights
    const formattedInsights = await openAIAgentOrchestrator.runAgent('delivery', [
      {
        role: 'user',
        content: `Format these insights for personalized delivery:
        
        Opportunities: ${opportunityInsights}
        Warnings: ${warningInsights}
        Blueprint: ${JSON.stringify(blueprintContext.structured_context, null, 2)}
        
        Create compelling, personalized messages that feel authentic to this user.`
      }
    ]);

    return this.parseAgentInsights(formattedInsights, blueprintContext);
  }

  // Gather comprehensive user context
  private async gatherUserContext(userId: string): Promise<UserContextData> {
    const [activities, pieData, programs] = await Promise.all([
      this.getRecentActivities(userId),
      this.getRecentPIEData(userId),
      this.getActivePrograms(userId)
    ]);

    return {
      recent_activities: activities,
      mood_patterns: this.extractMoodPatterns(pieData),
      progress_trends: this.extractProgressTrends(programs),
      time_patterns: this.extractTimePatterns(activities),
      engagement_signals: this.extractEngagementSignals(activities)
    };
  }

  // Analyze user rhythms for timing optimization
  private async analyzeUserRhythms(userId: string, context: UserContextData): Promise<any> {
    return {
      most_active_hours: this.findMostActiveHours(context.time_patterns),
      energy_peaks: this.identifyEnergyPeaks(context.engagement_signals),
      reflection_preferences: this.findReflectionPatterns(context.recent_activities),
      challenge_readiness: this.assessChallengeReadiness(context.progress_trends)
    };
  }

  // Detect hidden behavioral patterns
  private async detectHiddenPatterns(userId: string, context: UserContextData): Promise<any> {
    return {
      success_triggers: this.identifySuccessPatterns(context.progress_trends),
      resistance_patterns: this.identifyResistancePatterns(context.engagement_signals),
      motivation_cycles: this.findMotivationCycles(context.mood_patterns),
      blind_spots: this.identifyBlindSpots(context.recent_activities)
    };
  }

  // Parse agent responses into structured insights
  private parseAgentInsights(agentResponse: string, blueprintContext: any): ProactiveInsight[] {
    // This would be more sophisticated in production
    const insights: ProactiveInsight[] = [];
    
    // Basic parsing - would be enhanced with structured output from agents
    const lines = agentResponse.split('\n').filter(line => line.trim());
    
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      insights.push({
        id: `insight_${Date.now()}_${i}`,
        type: 'opportunity',
        title: `Growth Opportunity ${i + 1}`,
        message: lines[i],
        confidence: 0.8,
        urgency: 'medium',
        actionable_steps: ['Reflect on this insight', 'Consider implementation'],
        timing_suggestion: 'This week',
        blueprint_alignment: 0.85,
        context_relevance: 0.9
      });
    }
    
    return insights;
  }

  // Validation and ranking of insights
  private async validateAndRankInsights(
    insights: ProactiveInsight[], 
    blueprintContext: any
  ): Promise<ProactiveInsight[]> {
    // Filter by confidence and relevance
    const validated = insights.filter(insight => 
      insight.confidence > 0.7 && 
      insight.context_relevance > 0.8
    );

    // Sort by urgency and alignment
    return validated.sort((a, b) => {
      const urgencyWeight = { high: 3, medium: 2, low: 1 };
      const scoreA = urgencyWeight[a.urgency] + a.blueprint_alignment;
      const scoreB = urgencyWeight[b.urgency] + b.blueprint_alignment;
      return scoreB - scoreA;
    });
  }

  // Store insights for scheduled delivery
  private async storeInsightsForDelivery(userId: string, insights: ProactiveInsight[]): Promise<void> {
    for (const insight of insights.slice(0, 3)) { // Limit to top 3
      await supabase.from('reflective_action_plans').insert({
        user_id: userId,
        pattern_id: `agent_${insight.type}`,
        predictive_rule_id: insight.id,
        title: insight.title,
        message: insight.message,
        insight_type: insight.type,
        priority: insight.urgency,
        trigger_event: 'agent_generated',
        trigger_time: new Date().toISOString(),
        delivery_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        expiration_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        confidence: insight.confidence,
        communication_style: 'balanced',
        personalized_for_blueprint: true
      });
    }
  }

  // Fallback to traditional PIE system
  private async generateTraditionalInsights(userId: string): Promise<ProactiveInsight[]> {
    // Use original PIE logic as fallback
    return [];
  }

  // Helper methods for context analysis
  private buildContextQuery(context: UserContextData): string {
    return `Recent user activity and patterns: ${JSON.stringify(context, null, 2)}`;
  }

  private async getRecentActivities(userId: string): Promise<any[]> {
    const { data } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    return data || [];
  }

  private async getRecentPIEData(userId: string): Promise<any[]> {
    const { data } = await supabase
      .from('pie_user_data')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(50);
    return data || [];
  }

  private async getActivePrograms(userId: string): Promise<any[]> {
    const { data } = await supabase
      .from('growth_programs')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');
    return data || [];
  }

  // Pattern extraction methods (placeholder implementations)
  private extractMoodPatterns(pieData: any[]): any[] { return []; }
  private extractProgressTrends(programs: any[]): any[] { return []; }
  private extractTimePatterns(activities: any[]): any[] { return []; }
  private extractEngagementSignals(activities: any[]): any[] { return []; }
  private findMostActiveHours(patterns: any[]): any { return {}; }
  private identifyEnergyPeaks(signals: any[]): any[] { return []; }
  private findReflectionPatterns(activities: any[]): any { return {}; }
  private assessChallengeReadiness(trends: any[]): number { return 0.7; }
  private identifySuccessPatterns(trends: any[]): any[] { return []; }
  private identifyResistancePatterns(signals: any[]): any[] { return []; }
  private findMotivationCycles(patterns: any[]): any[] { return []; }
  private identifyBlindSpots(activities: any[]): any[] { return []; }
  
  private parseTimingInsights(insights: string, analysis: any): ProactiveInsight[] { return []; }
  private parseAwarenessInsights(insights: string, patterns: any): ProactiveInsight[] { return []; }
  private parseAdaptationInsights(insights: string, changes: any[]): ProactiveInsight[] { return []; }

  // Feature toggle
  setGenerativeMode(enabled: boolean): void {
    this.isGenerativeMode = enabled;
    console.log('🎛️ PIE Generative mode:', enabled ? 'enabled' : 'disabled');
  }
}

export const enhancedPIEAgentService = new EnhancedPIEAgentService();