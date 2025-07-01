
import { supabase } from "@/integrations/supabase/client";
import { 
  PIEInsight, 
  PIEPredictiveRule, 
  AstrologicalEvent,
  PIE_CONFIDENCE_THRESHOLD 
} from "@/types/pie-types";
import { pieInsightGenerationService } from "./pie-insight-generation-service";

class PIESchedulingService {
  private userId: string | null = null;
  private active = false;
  private suppressedEvents: string[] = []; // Audit trail for suppressed events

  async initialize(userId: string): Promise<void> {
    console.log("⏰ Initializing PIE Scheduling Service");
    this.userId = userId;
    this.active = true;
  }

  async scheduleInsights(): Promise<void> {
    if (!this.active || !this.userId) return;

    console.log("⏰ Scheduling proactive insights");

    try {
      // Get user's predictive rules
      const rules = await this.getUserPredictiveRules();
      
      // Get upcoming astrological events
      const upcomingEvents = await this.getUpcomingAstrologicalEvents();
      
      // Match rules with upcoming events
      for (const event of upcomingEvents) {
        const matchingRules = rules.filter(rule => 
          rule.eventType === event.eventType || 
          this.isEventTypeMatch(rule.eventType, event.eventType)
        );

        for (const rule of matchingRules) {
          await this.scheduleInsightForRule(rule, event);
        }
      }

    } catch (error) {
      console.error("Error scheduling insights:", error);
    }
  }

  // Patent Claim 4: Hard suppression gate - critical for claims compliance
  private async scheduleInsightForRule(rule: PIEPredictiveRule, event: AstrologicalEvent): Promise<void> {
    console.log(`⏰ Evaluating rule ${rule.id} for event ${event.eventType}`);
    
    // PATENT CRITICAL: Hard suppression gate with confidence threshold
    if (rule.confidence < PIE_CONFIDENCE_THRESHOLD) {
      console.log(`❌ Rule confidence ${rule.confidence} below threshold ${PIE_CONFIDENCE_THRESHOLD}, suppressing notification`);
      
      // Audit trail for suppressed events - important for patent claims
      this.suppressedEvents.push(`${rule.id}_${event.id}_${new Date().toISOString()}`);
      
      // Log suppressed event for audit
      await this.logSuppressedEvent(rule, event, 'confidence_too_low');
      return;
    }

    console.log(`✅ Rule confidence ${rule.confidence} meets threshold, proceeding with insight generation`);

    try {
      // Generate the insight
      const insight = await pieInsightGenerationService.generateInsight(rule, event);
      
      if (insight) {
        // Calculate delivery time (24-48 hours before event)
        const eventTime = new Date(event.startTime);
        const deliveryTime = new Date(eventTime.getTime() - (24 * 60 * 60 * 1000)); // 24 hours before
        
        // Schedule the insight
        await this.storeScheduledInsight({
          ...insight,
          deliveryTime: deliveryTime.toISOString(),
          delivered: false
        });

        console.log(`✅ Scheduled insight for ${event.eventType} at ${deliveryTime.toISOString()}`);
      }
    } catch (error) {
      console.error("Error generating insight for rule:", error);
    }
  }

  private async logSuppressedEvent(rule: PIEPredictiveRule, event: AstrologicalEvent, reason: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('pie_suppressed_events')
        .insert({
          user_id: this.userId,
          rule_id: rule.id,
          event_id: event.id,
          event_type: event.eventType,
          suppression_reason: reason,
          rule_confidence: rule.confidence,
          threshold_used: PIE_CONFIDENCE_THRESHOLD,
          suppressed_at: new Date().toISOString()
        });

      if (error) {
        console.error("Failed to log suppressed event:", error);
      }
    } catch (error) {
      console.error("Error logging suppressed event:", error);
    }
  }

  private async getUserPredictiveRules(): Promise<PIEPredictiveRule[]> {
    if (!this.userId) return [];

    try {
      const { data, error } = await supabase
        .from('pie_predictive_rules')
        .select('*')
        .eq('user_id', this.userId)
        .gte('confidence', PIE_CONFIDENCE_THRESHOLD); // Only get rules above threshold

      if (error) throw error;

      return data as PIEPredictiveRule[];
    } catch (error) {
      console.error("Error getting predictive rules:", error);
      return [];
    }
  }

  private async getUpcomingAstrologicalEvents(): Promise<AstrologicalEvent[]> {
    try {
      const now = new Date();
      const futureDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days ahead

      const { data, error } = await supabase
        .from('pie_astrological_events')
        .select('*')
        .gte('start_time', now.toISOString())
        .lte('start_time', futureDate.toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;

      return data as AstrologicalEvent[];
    } catch (error) {
      console.error("Error getting astrological events:", error);
      return [];
    }
  }

  private isEventTypeMatch(ruleEventType: string, actualEventType: string): boolean {
    // Implement fuzzy matching for event types
    const ruleType = ruleEventType.toLowerCase();
    const actualType = actualEventType.toLowerCase();
    
    // Direct match
    if (ruleType === actualType) return true;
    
    // Category matches
    if (ruleType.includes('mercury') && actualType.includes('mercury')) return true;
    if (ruleType.includes('moon') && actualType.includes('moon')) return true;
    if (ruleType.includes('retrograde') && actualType.includes('retrograde')) return true;
    
    return false;
  }

  private async storeScheduledInsight(insight: PIEInsight): Promise<void> {
    try {
      const { error } = await supabase
        .from('pie_insights')
        .insert(insight);

      if (error) {
        console.error("Failed to store scheduled insight:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error storing scheduled insight:", error);
      throw error;
    }
  }

  // Check for insights ready to be delivered
  async checkPendingInsights(): Promise<PIEInsight[]> {
    if (!this.userId) return [];

    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('pie_insights')
        .select('*')
        .eq('user_id', this.userId)
        .eq('delivered', false)
        .lte('delivery_time', now)
        .order('priority', { ascending: false });

      if (error) throw error;

      return data as PIEInsight[];
    } catch (error) {
      console.error("Error checking pending insights:", error);
      return [];
    }
  }

  // Mark insight as delivered
  async markInsightDelivered(insightId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('pie_insights')
        .update({ 
          delivered: true,
          delivered_at: new Date().toISOString()
        })
        .eq('id', insightId);

      if (error) {
        console.error("Failed to mark insight as delivered:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error marking insight as delivered:", error);
      throw error;
    }
  }

  // Get suppression audit trail
  getSuppressedEventsAudit(): string[] {
    return [...this.suppressedEvents];
  }

  isActive(): boolean {
    return this.active;
  }

  async cleanup(): Promise<void> {
    console.log("⏰ Cleaning up PIE Scheduling Service");
    this.active = false;
    this.userId = null;
    this.suppressedEvents = [];
  }
}

export const pieSchedulingService = new PIESchedulingService();
