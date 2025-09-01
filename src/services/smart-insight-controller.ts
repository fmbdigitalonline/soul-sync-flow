import { supabase } from '@/integrations/supabase/client';
import { ConversationShadowDetector, ConversationInsight } from './conversation-shadow-detector';
import { NullificationAdviceGenerator } from './nullification-advice-generator';

export interface InsightDeliveryLog {
  userId: string;
  insightType: 'analytical' | 'conversation';
  lastDelivery: Date;
  count: number;
}

export interface AppActivity {
  userId: string;
  lastSeen: Date;
  lastConversation: Date;
  isIdle: boolean;
  sessionDuration: number;
}

export class SmartInsightController {
  private static insightLogs = new Map<string, InsightDeliveryLog>();
  private static activityTracker = new Map<string, AppActivity>();

  // Track user activity and app revisits
  static trackUserActivity(userId: string, activityType: 'conversation' | 'app_open' | 'app_close' | 'idle_start' | 'idle_end') {
    const now = new Date();
    let activity = this.activityTracker.get(userId) || {
      userId,
      lastSeen: now,
      lastConversation: new Date(0),
      isIdle: false,
      sessionDuration: 0
    };

    switch (activityType) {
      case 'conversation':
        activity.lastConversation = now;
        activity.lastSeen = now;
        activity.isIdle = false;
        break;
      case 'app_open':
      case 'idle_end':
        activity.lastSeen = now;
        activity.isIdle = false;
        break;
      case 'app_close':
      case 'idle_start':
        activity.isIdle = true;
        break;
    }

    this.activityTracker.set(userId, activity);
    
    // Log activity to database for analytics
    this.logActivityToDatabase(userId, activityType);
  }

  private static async logActivityToDatabase(userId: string, activityType: string) {
    try {
      await supabase.from('dream_activity_logs').insert({
        user_id: userId,
        activity_type: `smart_insight_${activityType}`,
        activity_data: { timestamp: new Date().toISOString() },
        session_id: `activity_${Date.now()}`
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  // Check if user should receive analytical insights (max 1 per day)
  static canDeliverAnalyticalInsight(userId: string): boolean {
    const log = this.insightLogs.get(`${userId}_analytical`);
    if (!log) return true;

    const now = new Date();
    const lastDelivery = new Date(log.lastDelivery);
    const hoursSinceLastDelivery = (now.getTime() - lastDelivery.getTime()) / (1000 * 60 * 60);

    // Allow 1 analytical insight per 24 hours
    return hoursSinceLastDelivery >= 24;
  }

  // Check if user should receive conversation insights (no limit, but respect timing)
  static canDeliverConversationInsight(userId: string): boolean {
    const activity = this.activityTracker.get(userId);
    if (!activity) return false;

    const now = new Date();
    const hoursSinceLastConversation = (now.getTime() - activity.lastConversation.getTime()) / (1000 * 60 * 60);
    const hoursSinceLastSeen = (now.getTime() - activity.lastSeen.getTime()) / (1000 * 60 * 60);

    // Deliver conversation insights when:
    // 1. User had a conversation and then left/returned to app, OR
    // 2. User has been idle for 1+ hours and returns
    return (
      (hoursSinceLastConversation < 24 && hoursSinceLastSeen > 0.1) || // Had conversation, then left/returned
      (activity.isIdle === false && hoursSinceLastSeen > 1) // Returned after 1+ hour idle
    );
  }

  // Generate conversation-derived insights
  static async generateConversationInsights(userId: string): Promise<ConversationInsight[]> {
    try {
      console.log('🎯 Generating conversation-derived insights...');
      
      // Detect shadow patterns from recent conversations
      const shadowPatterns = await ConversationShadowDetector.detectShadowPatterns(userId);
      
      if (shadowPatterns.length === 0) {
        console.log('🎯 No shadow patterns detected');
        return [];
      }

      // Generate nullification advice based on patterns
      const insights = await NullificationAdviceGenerator.generateNullificationAdvice(
        userId, 
        shadowPatterns.map(insight => insight.shadowPattern)
      );

      // Add direct shadow work insights
      const shadowInsights = shadowPatterns.filter(insight => insight.confidence > 0.8);
      
      const allInsights = [...insights, ...shadowInsights];
      
      // Sort by priority and confidence
      allInsights.sort((a, b) => {
        const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
        const aWeight = priorityWeight[a.priority] + a.confidence;
        const bWeight = priorityWeight[b.priority] + b.confidence;
        return bWeight - aWeight;
      });

      console.log(`🎯 Generated ${allInsights.length} conversation insights`);
      return allInsights.slice(0, 3); // Limit to top 3

    } catch (error) {
      console.error('🚨 Error generating conversation insights:', error);
      return [];
    }
  }

  // Check if there's sufficient data for analytical insights
  static async hasSufficientDataForAnalytics(userId: string): Promise<boolean> {
    try {
      // Check recent activity in multiple tables
      const [activities, conversations, intelligence] = await Promise.all([
        supabase
          .from('dream_activity_logs')
          .select('id')
          .eq('user_id', userId)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .limit(1),
        
        supabase
          .from('conversation_messages')
          .select('id')
          .eq('user_id', userId)
          .gte('created_at', new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString())
          .limit(1),
          
        supabase
          .from('hacs_coach_intelligence')
          .select('interaction_count')
          .eq('user_id', userId)
          .single()
      ]);

      const hasRecentActivity = activities.data && activities.data.length > 0;
      const hasRecentConversations = conversations.data && conversations.data.length > 0;
      const hasIntelligenceData = intelligence.data && intelligence.data.interaction_count > 3;

      // Need at least 2 out of 3 data sources
      const dataCount = [hasRecentActivity, hasRecentConversations, hasIntelligenceData].filter(Boolean).length;
      
      console.log(`📊 Data sufficiency check: ${dataCount}/3 sources available`);
      return dataCount >= 2;

    } catch (error) {
      console.error('🚨 Error checking data sufficiency:', error);
      return false;
    }
  }

  // Record insight delivery
  static recordInsightDelivery(userId: string, insightType: 'analytical' | 'conversation') {
    const key = `${userId}_${insightType}`;
    const existing = this.insightLogs.get(key);
    
    this.insightLogs.set(key, {
      userId,
      insightType,
      lastDelivery: new Date(),
      count: existing ? existing.count + 1 : 1
    });

    console.log(`📝 Recorded ${insightType} insight delivery for user ${userId}`);
  }

  // Get insight delivery statistics
  static getInsightStats(userId: string): { analytical: number, conversation: number, lastAnalytical?: Date, lastConversation?: Date } {
    const analyticalLog = this.insightLogs.get(`${userId}_analytical`);
    const conversationLog = this.insightLogs.get(`${userId}_conversation`);
    
    return {
      analytical: analyticalLog?.count || 0,
      conversation: conversationLog?.count || 0,
      lastAnalytical: analyticalLog?.lastDelivery,
      lastConversation: conversationLog?.lastDelivery
    };
  }

  // Check if user returned after leaving
  static userReturnedAfterLeaving(userId: string): boolean {
    const activity = this.activityTracker.get(userId);
    if (!activity) return false;

    const now = new Date();
    const minutesSinceLastSeen = (now.getTime() - activity.lastSeen.getTime()) / (1000 * 60);
    
    // Consider "returning" if they were away for at least 10 minutes
    return !activity.isIdle && minutesSinceLastSeen > 10;
  }
}