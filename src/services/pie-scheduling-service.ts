import { supabase } from "@/integrations/supabase/client";
import {
  BlueprintHeuristic,
  ConversationContextEvent,
  ReflectiveActionPlan,
} from "@/types/pie-types";

class ReflectiveAnalysisService {
  private userId: string | null = null;
  private active = false;

  async initialize(userId: string): Promise<void> {
    console.log("🧠 Initializing Reflective Analysis Service");
    this.userId = userId;
    this.active = true;
  }

  /**
   * Replaces the legacy scheduleInsights flow.
   * Triggered after a conversation session completes to generate a reflective action plan.
   */
  async processPostConversation(userId: string, sessionId: string, summary: string): Promise<ReflectiveActionPlan | null> {
    if (!this.active) {
      console.log("ℹ️ Reflective Analysis Service not active; skipping processing");
      return null;
    }

    const effectiveUserId = userId || this.userId;
    if (!effectiveUserId) {
      console.error("Reflective analysis requires a userId");
      return null;
    }

    try {
      const [userBlueprint, recentContext] = await Promise.all([
        this.getUserBlueprint(effectiveUserId),
        this.getRecentConversationContext(sessionId, summary)
      ]);

      const activePatterns = await this.detectBehavioralPatterns(effectiveUserId, recentContext?.sentimentScore, recentContext?.detectedIntent);

      const matchingRule = await this.findMatchingHeuristic(
        effectiveUserId,
        userBlueprint?.cognition_mbti?.type || userBlueprint?.metadata?.cognitiveType || 'generalist',
        recentContext?.sentimentScore,
        activePatterns
      );

      if (!matchingRule || !recentContext) return null;

      return await this.generateReflectiveAction(effectiveUserId, matchingRule, recentContext, activePatterns);
    } catch (error) {
      console.error("Error running reflective analysis:", error);
      return null;
    }
  }

  private async getUserBlueprint(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('user_blueprints')
      .select('blueprint')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user blueprint:', error);
      return null;
    }

    return data?.blueprint || null;
  }

  private async getRecentConversationContext(sessionId: string, summary: string): Promise<ConversationContextEvent | null> {
    try {
      const { data, error } = await supabase
        .from('conversational_context_events')
        .select('*')
        .eq('session_id', sessionId)
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        return {
          id: data.id,
          sessionId: data.session_id,
          sentimentScore: data.sentiment_score ?? undefined,
          detectedIntent: data.detected_intent ?? undefined,
          relatedGoalId: data.related_goal_id ?? undefined,
          summary: summary || data.description,
          topic: data.event_type,
          startTime: data.start_time,
          eventType: data.event_type
        };
      }

      // If no context exists yet, seed one using the summary for traceability
      const seededContext = {
        session_id: sessionId,
        sentiment_score: null,
        detected_intent: 'reflection',
        related_goal_id: null,
        description: summary,
        start_time: new Date().toISOString(),
        event_type: 'conversation'
      };

      const { data: inserted, error: insertError } = await supabase
        .from('conversational_context_events')
        .insert(seededContext)
        .select('*')
        .maybeSingle();

      if (insertError) throw insertError;

      return inserted ? {
        id: inserted.id,
        sessionId: inserted.session_id,
        sentimentScore: inserted.sentiment_score ?? undefined,
        detectedIntent: inserted.detected_intent ?? undefined,
        relatedGoalId: inserted.related_goal_id ?? undefined,
        summary,
        topic: inserted.event_type,
        startTime: inserted.start_time,
        eventType: inserted.event_type
      } : null;
    } catch (error) {
      console.error('Error fetching conversation context:', error);
      return null;
    }
  }

  private async detectBehavioralPatterns(userId: string, sentimentScore?: number, detectedIntent?: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('behavioral_velocity')
        .select('pattern_label')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const patterns = (data || []).map(record => record.pattern_label as string).filter(Boolean);

      if (sentimentScore !== undefined) {
        patterns.push(sentimentScore < -0.3 ? 'frustration' : sentimentScore > 0.3 ? 'momentum' : 'neutral_sentiment');
      }

      if (detectedIntent) {
        patterns.push(`intent_${detectedIntent}`);
      }

      return patterns;
    } catch (error) {
      console.warn('Behavioral velocity table unavailable, continuing without velocity patterns');
      return detectedIntent ? [`intent_${detectedIntent}`] : [];
    }
  }

  private async findMatchingHeuristic(userId: string, cognitiveProfile: string, sentimentScore?: number, patterns: string[] = []): Promise<BlueprintHeuristic | null> {
    try {
      const { data, error } = await supabase
        .from('blueprint_logic_matrix')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const heuristics: BlueprintHeuristic[] = (data || []).map(record => ({
        id: record.id,
        userId: record.user_id,
        eventType: record.event_type,
        direction: record.direction,
        magnitude: record.magnitude,
        confidence: record.confidence,
        conditions: {
          windowHours: record.window_hours,
          minimumOccurrences: record.minimum_occurrences,
          userDataTypes: Array.isArray(record.user_data_types) ? record.user_data_types : []
        },
        creationDate: record.creation_date,
        lastValidated: record.last_validated,
        statisticalSignificance: record.statistical_significance,
        cognitiveProfileTag: record.cognitive_profile_tag ?? undefined,
        triggerCondition: record.trigger_condition ?? undefined
      }));

      const sentimentBand = sentimentScore === undefined ? 'unknown' : sentimentScore < -0.25 ? 'low' : sentimentScore > 0.25 ? 'high' : 'neutral';

      return heuristics.find(rule => {
        if (rule.cognitiveProfileTag && rule.cognitiveProfileTag !== cognitiveProfile) return false;

        const conditions = rule.triggerCondition || {};
        if (conditions.sentiment && conditions.sentiment !== sentimentBand) return false;
        if (conditions.intent && !patterns.includes(`intent_${conditions.intent}`)) return false;

        return true;
      }) || null;
    } catch (error) {
      console.error('Error finding matching heuristic:', error);
      return null;
    }
  }

  private async generateReflectiveAction(userId: string, rule: BlueprintHeuristic, context: ConversationContextEvent, patterns: string[] = []): Promise<ReflectiveActionPlan> {
    const actionPlan: ReflectiveActionPlan = {
      id: crypto.randomUUID(),
      userId,
      patternId: rule.conditions.userDataTypes.join('-') || 'context',
      predictiveRuleId: rule.id,
      title: `Reflective plan for ${context.detectedIntent || context.eventType || 'conversation'}`,
      message: context.summary || 'Conversation summary unavailable.',
      insightType: 'preparation',
      priority: 'high',
      triggerEvent: context.eventType || 'conversation',
      triggerTime: context.startTime || new Date().toISOString(),
      deliveryTime: new Date().toISOString(),
      expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      confidence: rule.confidence,
      delivered: true,
      acknowledged: false,
      communicationStyle: 'reflective',
      personalizedForBlueprint: true,
      proposedActions: {
        playbook: rule.triggerCondition?.playbook || 'break_down_tasks',
        momentum_signals: context.sentimentScore,
        patterns,
      },
      userFeedbackStatus: 'pending'
    };

    await this.storeReflectiveAction(actionPlan);
    return actionPlan;
  }

  private async storeReflectiveAction(plan: ReflectiveActionPlan): Promise<void> {
    try {
      const dbRecord = {
        id: plan.id,
        user_id: plan.userId,
        pattern_id: plan.patternId,
        predictive_rule_id: plan.predictiveRuleId,
        title: plan.title,
        message: plan.message,
        insight_type: plan.insightType,
        priority: plan.priority,
        trigger_event: plan.triggerEvent,
        trigger_time: plan.triggerTime,
        delivery_time: plan.deliveryTime,
        expiration_time: plan.expirationTime,
        confidence: plan.confidence,
        delivered: plan.delivered,
        acknowledged: plan.acknowledged,
        user_feedback: plan.userFeedback,
        communication_style: plan.communicationStyle,
        personalized_for_blueprint: plan.personalizedForBlueprint,
        proposed_actions: plan.proposedActions,
        user_feedback_status: plan.userFeedbackStatus
      };

      const { error } = await supabase
        .from('reflective_action_plans')
        .upsert(dbRecord);

      if (error) {
        console.error('Failed to store reflective action plan:', error);
      }
    } catch (error) {
      console.error('Error storing reflective action plan:', error);
    }
  }

  isActive(): boolean {
    return this.active;
  }

  async cleanup(): Promise<void> {
    console.log("🧠 Cleaning up Reflective Analysis Service");
    this.active = false;
    this.userId = null;
  }
}

export const reflectiveAnalysisService = new ReflectiveAnalysisService();
