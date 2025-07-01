
import { PIEInsight, PIEPredictiveRule, AstrologicalEvent } from "@/types/pie-types";
import { enhancedPersonalityEngine } from "./enhanced-personality-engine";

class PIEInsightGenerationService {
  private userId: string | null = null;
  private active = false;

  async initialize(userId: string): Promise<void> {
    console.log("💡 Initializing PIE Insight Generation Service");
    this.userId = userId;
    this.active = true;
  }

  async generateInsight(rule: PIEPredictiveRule, event: AstrologicalEvent): Promise<PIEInsight | null> {
    if (!this.active || !this.userId) return null;

    console.log(`💡 Generating insight for rule ${rule.id} and event ${event.eventType}`);

    try {
      // Generate personalized message based on rule and event
      const message = await this.generatePersonalizedMessage(rule, event);
      
      const insight: PIEInsight = {
        id: `insight_${rule.id}_${event.id}_${Date.now()}`,
        userId: this.userId,
        patternId: '', // Would be linked to the source pattern
        predictiveRuleId: rule.id,
        title: this.generateTitle(rule, event),
        message,
        insightType: this.determineInsightType(rule),
        priority: this.determinePriority(rule),
        triggerEvent: event.eventType,
        triggerTime: event.startTime,
        deliveryTime: '', // Set by scheduling service
        expirationTime: event.endTime || new Date(new Date(event.startTime).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        confidence: rule.confidence,
        delivered: false,
        acknowledged: false,
        communicationStyle: 'balanced', // Would be set based on user preferences
        personalizedForBlueprint: false
      };

      return insight;

    } catch (error) {
      console.error("Error generating insight:", error);
      return null;
    }
  }

  private generateTitle(rule: PIEPredictiveRule, event: AstrologicalEvent): string {
    const eventName = event.eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    if (rule.direction === 'positive') {
      return `Opportunity Ahead: ${eventName}`;
    } else if (rule.direction === 'negative') {
      return `Heads Up: ${eventName} Approaching`;
    } else {
      return `Cosmic Awareness: ${eventName}`;
    }
  }

  private async generatePersonalizedMessage(rule: PIEPredictiveRule, event: AstrologicalEvent): Promise<string> {
    const eventName = event.eventType.replace(/_/g, ' ');
    const magnitude = Math.round(rule.magnitude * 100);
    
    let baseMessage = '';
    
    if (rule.direction === 'positive') {
      baseMessage = `Based on your personal patterns, ${eventName} tends to boost your ${rule.conditions.userDataTypes.join(' and ')} by about ${magnitude}%. This is a great time to tackle challenging tasks or make important decisions.`;
    } else if (rule.direction === 'negative') {
      baseMessage = `I've noticed that ${eventName} typically affects your ${rule.conditions.userDataTypes.join(' and ')} by about ${magnitude}%. Consider scheduling lighter activities and being extra gentle with yourself during this time.`;
    } else {
      baseMessage = `${eventName} is approaching. While I haven't detected a strong pattern in how this affects you personally, it might be worth paying attention to your ${rule.conditions.userDataTypes.join(' and ')} during this time.`;
    }

    // Add confidence context
    const confidencePercent = Math.round(rule.confidence * 100);
    baseMessage += ` (Based on ${confidencePercent}% confidence from your personal data patterns)`;

    return baseMessage;
  }

  private determineInsightType(rule: PIEPredictiveRule): 'warning' | 'opportunity' | 'preparation' | 'awareness' {
    if (rule.direction === 'negative' && rule.magnitude > 0.5) {
      return 'warning';
    } else if (rule.direction === 'positive' && rule.magnitude > 0.5) {
      return 'opportunity';
    } else if (rule.magnitude > 0.3) {
      return 'preparation';
    } else {
      return 'awareness';
    }
  }

  private determinePriority(rule: PIEPredictiveRule): 'low' | 'medium' | 'high' | 'critical' {
    if (rule.confidence > 0.8 && rule.magnitude > 0.7) {
      return 'critical';
    } else if (rule.confidence > 0.7 && rule.magnitude > 0.5) {
      return 'high';
    } else if (rule.confidence > 0.6 && rule.magnitude > 0.3) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  isActive(): boolean {
    return this.active;
  }

  async cleanup(): Promise<void> {
    console.log("💡 Cleaning up PIE Insight Generation Service");
    this.active = false;
    this.userId = null;
  }
}

export const pieInsightGenerationService = new PIEInsightGenerationService();
