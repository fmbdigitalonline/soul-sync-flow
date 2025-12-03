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
    
    // Check global cooldown - no insights of any type in last 30 minutes
    if (!this.checkGlobalCooldown(userId)) {
      return false;
    }
    
    if (!log) return true;

    const now = new Date();
    const lastDelivery = new Date(log.lastDelivery);
    const hoursSinceLastDelivery = (now.getTime() - lastDelivery.getTime()) / (1000 * 60 * 60);

    // Allow 1 analytical insight per 24 hours
    return hoursSinceLastDelivery >= 24;
  }

  // PHASE 1 FIX: Relaxed conversation insight delivery for active users
  static canDeliverConversationInsight(userId: string): boolean {
    const activity = this.activityTracker.get(userId);
    
    // PHASE 1: Allow insights even without prior activity tracking (new users)
    if (!activity) {
      console.log('✅ canDeliverConversationInsight: No prior activity - allowing for new user');
      return true;
    }

    // Check global cooldown - reduced from 30 min to 5 min
    if (!this.checkGlobalCooldown(userId)) {
      return false;
    }

    // PHASE 1 FIX: Reduced conversation insight cooldown from 2 hours to 30 minutes
    const conversationLog = this.insightLogs.get(`${userId}_conversation`);
    if (conversationLog) {
      const now = new Date();
      const lastDelivery = new Date(conversationLog.lastDelivery);
      const hoursSinceLastConversationInsight = (now.getTime() - lastDelivery.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastConversationInsight < 0.5) { // 30 min instead of 2 hours
        console.log(`⏰ Conversation cooldown: ${Math.round((0.5 - hoursSinceLastConversationInsight) * 60)} minutes remaining`);
        return false;
      }
    }

    const now = new Date();
    const hoursSinceLastConversation = (now.getTime() - activity.lastConversation.getTime()) / (1000 * 60 * 60);
    const hoursSinceLastSeen = (now.getTime() - activity.lastSeen.getTime()) / (1000 * 60 * 60);

    // PHASE 1 FIX: More permissive conditions for active users
    // Deliver conversation insights when:
    // 1. User is ACTIVE (not idle) - they deserve wisdom while engaged
    // 2. User had a recent conversation (within 24h)
    // 3. User returned after brief absence (> 5 minutes)
    const isActiveUser = activity.isIdle === false;
    const hadRecentConversation = hoursSinceLastConversation < 24;
    const justReturned = hoursSinceLastSeen > 0.08; // ~5 minutes
    
    console.log('🎯 canDeliverConversationInsight check:', {
      isActiveUser,
      hadRecentConversation,
      justReturned,
      hoursSinceLastConversation: hoursSinceLastConversation.toFixed(2),
      hoursSinceLastSeen: hoursSinceLastSeen.toFixed(2)
    });
    
    return (
      (hadRecentConversation && justReturned) || // Had conversation, then brief pause
      (isActiveUser && hadRecentConversation) || // ACTIVE user with recent conversation - speak while present!
      (isActiveUser && hoursSinceLastSeen < 0.5) // Active user, seen recently - engage them
    );
  }

  // PHASE 1 FIX: Reduced global cooldown from 30 min to 5 min
  // The system was too "polite" - waiting for users to leave before speaking
  static checkGlobalCooldown(userId: string): boolean {
    const analyticalLog = this.insightLogs.get(`${userId}_analytical`);
    const conversationLog = this.insightLogs.get(`${userId}_conversation`);
    
    const now = new Date();
    const cooldownMinutes = 5; // Reduced from 30 - be present, not absent
    
    // Check if analytical insight was delivered recently
    if (analyticalLog) {
      const minutesSinceAnalytical = (now.getTime() - analyticalLog.lastDelivery.getTime()) / (1000 * 60);
      if (minutesSinceAnalytical < cooldownMinutes) {
        console.log(`⏰ Global cooldown active: ${Math.round(cooldownMinutes - minutesSinceAnalytical)} minutes remaining`);
        return false;
      }
    }
    
    // Check if conversation insight was delivered recently
    if (conversationLog) {
      const minutesSinceConversation = (now.getTime() - conversationLog.lastDelivery.getTime()) / (1000 * 60);
      if (minutesSinceConversation < cooldownMinutes) {
        console.log(`⏰ Global cooldown active: ${Math.round(cooldownMinutes - minutesSinceConversation)} minutes remaining`);
        return false;
      }
    }
    
    return true;
  }

  // Generate conversation-derived insights
  static async generateConversationInsights(userId: string): Promise<ConversationInsight[]> {
    try {
      console.log('🎯 SmartInsightController: Starting conversation insights generation for user:', userId);
      
      // Detect shadow patterns from recent conversations
      console.log('🎯 SmartInsightController: Detecting shadow patterns...');
      const shadowPatterns = await ConversationShadowDetector.detectShadowPatterns(userId);
      
      console.log('🎯 SmartInsightController: Shadow patterns detected:', {
        count: shadowPatterns.length,
        patterns: shadowPatterns.map(p => ({ type: p.shadowPattern.type, confidence: p.confidence }))
      });
      
      if (shadowPatterns.length === 0) {
        console.log('🎯 SmartInsightController: No shadow patterns detected - returning empty array');
        return [];
      }

      // Generate nullification advice based on patterns
      console.log('🎯 SmartInsightController: Generating nullification advice...');
      const insights = await NullificationAdviceGenerator.generateNullificationAdvice(
        userId, 
        shadowPatterns.map(insight => insight.shadowPattern)
      );
      
      console.log('🎯 SmartInsightController: Nullification insights generated:', insights.length);

      // Add direct shadow work insights
      const shadowInsights = shadowPatterns.filter(insight => insight.confidence > 0.8);
      console.log('🎯 SmartInsightController: High-confidence shadow insights:', shadowInsights.length);
      
      const allInsights = [...insights, ...shadowInsights];
      
      // Sort by priority and confidence
      allInsights.sort((a, b) => {
        const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
        const aWeight = priorityWeight[a.priority] + a.confidence;
        const bWeight = priorityWeight[b.priority] + b.confidence;
        return bWeight - aWeight;
      });

      console.log(`✅ SmartInsightController: Generated ${allInsights.length} total conversation insights (returning top 3)`);
      return allInsights.slice(0, 3); // Limit to top 3

    } catch (error) {
      console.error('🚨 SmartInsightController: Error generating conversation insights:', error);
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