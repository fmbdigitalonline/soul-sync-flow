import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export interface ShadowPattern {
  id: string;
  type: 'projection' | 'resistance' | 'blind_spot' | 'emotional_trigger';
  pattern: string;
  userQuote: string;
  frequency: number;
  confidence: number;
  lastSeen: Date;
  emotionalIntensity: number;
}

export interface ConversationInsight {
  id: string;
  title: string;
  message: string;
  shadowPattern: ShadowPattern;
  actionableSteps: string[];
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  conversationContext: string;
  type: 'shadow_work' | 'nullification' | 'pattern_alert';
}

export class ConversationShadowDetector {
  protected static readonly EMOTIONAL_TRIGGERS = [
    'overwhelmed', 'frustrated', 'angry', 'annoyed', 'triggered', 'upset', 
    'irritated', 'bothered', 'stressed', 'anxious', 'worried', 'concerned'
  ];

  protected static readonly PROJECTION_PATTERNS = [
    'they always', 'people never', 'everyone does', 'nobody understands',
    'others should', 'why do they', 'those people', 'that person'
  ];

  protected static readonly RESISTANCE_PATTERNS = [
    'i should', 'i have to', 'i need to', 'i must', 'supposed to',
    'but i cant', 'its too hard', 'impossible', 'never works'
  ];

  protected static readonly LIMITING_BELIEFS = [
    'im not good', 'i cant do', 'im bad at', 'im terrible', 'i never',
    'i always fail', 'not smart enough', 'not worthy', 'dont deserve'
  ];

  static async detectShadowPatterns(userId: string): Promise<ConversationInsight[]> {
    // Create edge-compatible Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    try {
      console.log('🔍 SHADOW DETECTOR: Starting pattern detection for user:', userId);
      
      // CRITICAL FIX: Query hacs_conversations table (where companion messages are stored)
      const { data: hacsConversations, error: hacsError } = await supabase
        .from('hacs_conversations')
        .select('conversation_data, created_at, session_id')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      console.log('🔍 SHADOW DETECTOR: Query results from hacs_conversations:', {
        found: hacsConversations?.length || 0,
        error: hacsError?.message
      });

      // Parse JSONB conversation_data to extract user messages
      let userMessages: Array<{content: string, created_at: string, role: string}> = [];
      
      if (hacsConversations && hacsConversations.length > 0) {
        hacsConversations.forEach(conv => {
          const conversationData = conv.conversation_data as any[];
          if (Array.isArray(conversationData)) {
            const userMsgs = conversationData
              .filter((msg: any) => msg.role === 'user')
              .map((msg: any) => ({
                content: msg.content,
                created_at: conv.created_at,
                role: 'user'
              }));
            userMessages.push(...userMsgs);
          }
        });
      }

      console.log('🔍 SHADOW DETECTOR: Extracted user messages:', {
        totalMessages: userMessages.length,
        sampleContent: userMessages[0]?.content?.substring(0, 50)
      });

      // Fallback: Also check conversation_messages table for backward compatibility
      const { data: legacyMessages } = await supabase
        .from('conversation_messages')
        .select('content, created_at, role')
        .eq('user_id', userId)
        .eq('role', 'user')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (legacyMessages && legacyMessages.length > 0) {
        console.log('🔍 SHADOW DETECTOR: Found legacy messages:', legacyMessages.length);
        userMessages.push(...legacyMessages);
      }

      if (!userMessages.length) {
        console.log('🔍 SHADOW DETECTOR: No messages found in either table');
        return [];
      }

      const allText = userMessages.map(c => c.content).join(' ').toLowerCase();
      console.log('🔍 SHADOW DETECTOR: Analyzing text length:', allText.length);
      const insights: ConversationInsight[] = [];

      // Detect emotional triggers
      const triggerPatterns = this.detectEmotionalTriggers(userMessages, allText);
      console.log('🔍 SHADOW DETECTOR: Emotional triggers found:', triggerPatterns.length);
      triggerPatterns.forEach(pattern => {
        if (pattern.confidence > 0.7) {
          insights.push(this.createInsightFromPattern(pattern, 'shadow_work'));
        }
      });

      // Detect projection patterns
      const projectionPatterns = this.detectProjections(userMessages, allText);
      console.log('🔍 SHADOW DETECTOR: Projection patterns found:', projectionPatterns.length);
      projectionPatterns.forEach(pattern => {
        if (pattern.confidence > 0.6) {
          insights.push(this.createInsightFromPattern(pattern, 'nullification'));
        }
      });

      // Detect resistance patterns
      const resistancePatterns = this.detectResistance(userMessages, allText);
      console.log('🔍 SHADOW DETECTOR: Resistance patterns found:', resistancePatterns.length);
      resistancePatterns.forEach(pattern => {
        if (pattern.confidence > 0.7) {
          insights.push(this.createInsightFromPattern(pattern, 'pattern_alert'));
        }
      });

      // Detect limiting beliefs
      const beliefPatterns = this.detectLimitingBeliefs(userMessages, allText);
      console.log('🔍 SHADOW DETECTOR: Limiting beliefs found:', beliefPatterns.length);
      beliefPatterns.forEach(pattern => {
        if (pattern.confidence > 0.8) {
          insights.push(this.createInsightFromPattern(pattern, 'shadow_work'));
        }
      });

      console.log(`🔍 SHADOW DETECTOR: Generated ${insights.length} total insights from ${userMessages.length} messages`);
      return insights.slice(0, 5); // Limit to top 5 insights

    } catch (error) {
      console.error('🚨 Error detecting shadow patterns:', error);
      return [];
    }
  }

  private static detectEmotionalTriggers(conversations: any[], allText: string): ShadowPattern[] {
    const patterns: ShadowPattern[] = [];
    const triggerCounts = new Map<string, { count: number, quotes: string[] }>();

    this.EMOTIONAL_TRIGGERS.forEach(trigger => {
      const regex = new RegExp(`\\b${trigger}\\b`, 'gi');
      const matches = allText.match(regex);
      if (matches && matches.length >= 2) {
        const quotes = conversations
          .filter(c => c.content.toLowerCase().includes(trigger))
          .map(c => c.content)
          .slice(0, 3);
        
        triggerCounts.set(trigger, { count: matches.length, quotes });
      }
    });

    triggerCounts.forEach((data, trigger) => {
      if (data.count >= 2) {
        patterns.push({
          id: `trigger_${trigger}_${Date.now()}`,
          type: 'emotional_trigger',
          pattern: `Recurring emotional trigger: "${trigger}"`,
          userQuote: data.quotes[0] || '',
          frequency: data.count,
          confidence: Math.min(0.9, 0.5 + (data.count * 0.1)),
          lastSeen: new Date(),
          emotionalIntensity: data.count >= 4 ? 0.9 : 0.7
        });
      }
    });

    return patterns;
  }

  private static detectProjections(conversations: any[], allText: string): ShadowPattern[] {
    const patterns: ShadowPattern[] = [];

    this.PROJECTION_PATTERNS.forEach(pattern => {
      const regex = new RegExp(pattern.replace(' ', '\\s+'), 'gi');
      const matches = allText.match(regex);
      if (matches && matches.length >= 1) {
        const quote = conversations.find(c => 
          c.content.toLowerCase().includes(pattern.toLowerCase())
        )?.content || '';

        patterns.push({
          id: `projection_${pattern.replace(/\s+/g, '_')}_${Date.now()}`,
          type: 'projection',
          pattern: `Projection pattern: "${pattern}"`,
          userQuote: quote,
          frequency: matches.length,
          confidence: Math.min(0.8, 0.6 + (matches.length * 0.1)),
          lastSeen: new Date(),
          emotionalIntensity: 0.6
        });
      }
    });

    return patterns;
  }

  private static detectResistance(conversations: any[], allText: string): ShadowPattern[] {
    const patterns: ShadowPattern[] = [];

    this.RESISTANCE_PATTERNS.forEach(pattern => {
      const regex = new RegExp(pattern.replace(' ', '\\s+'), 'gi');
      const matches = allText.match(regex);
      if (matches && matches.length >= 2) {
        const quote = conversations.find(c => 
          c.content.toLowerCase().includes(pattern.toLowerCase())
        )?.content || '';

        patterns.push({
          id: `resistance_${pattern.replace(/\s+/g, '_')}_${Date.now()}`,
          type: 'resistance',
          pattern: `Resistance pattern: "${pattern}"`,
          userQuote: quote,
          frequency: matches.length,
          confidence: Math.min(0.9, 0.7 + (matches.length * 0.1)),
          lastSeen: new Date(),
          emotionalIntensity: 0.8
        });
      }
    });

    return patterns;
  }

  private static detectLimitingBeliefs(conversations: any[], allText: string): ShadowPattern[] {
    const patterns: ShadowPattern[] = [];

    this.LIMITING_BELIEFS.forEach(belief => {
      const regex = new RegExp(belief.replace(' ', '\\s+'), 'gi');
      const matches = allText.match(regex);
      if (matches && matches.length >= 1) {
        const quote = conversations.find(c => 
          c.content.toLowerCase().includes(belief.toLowerCase())
        )?.content || '';

        patterns.push({
          id: `belief_${belief.replace(/\s+/g, '_')}_${Date.now()}`,
          type: 'blind_spot',
          pattern: `Limiting belief: "${belief}"`,
          userQuote: quote,
          frequency: matches.length,
          confidence: Math.min(0.95, 0.8 + (matches.length * 0.05)),
          lastSeen: new Date(),
          emotionalIntensity: 0.9
        });
      }
    });

    return patterns;
  }

  private static createInsightFromPattern(pattern: ShadowPattern, insightType: ConversationInsight['type']): ConversationInsight {
    const titles = {
      shadow_work: [
        'Shadow Pattern Detected',
        'Inner Work Opportunity',
        'Pattern Recognition Alert'
      ],
      nullification: [
        'Projection Pattern Found',
        'Neutralization Needed',
        'Unconscious Projection'
      ],
      pattern_alert: [
        'Behavioral Pattern Alert',
        'Resistance Pattern Detected',
        'Growth Edge Identified'
      ]
    };

    const messages = {
      emotional_trigger: `You've mentioned feeling "${pattern.pattern.split('"')[1]}" ${pattern.frequency} times recently. This emotional trigger suggests an opportunity for deeper self-awareness.`,
      projection: `I noticed you frequently use phrases like "${pattern.pattern.split('"')[1]}" when discussing others. This may indicate projected aspects of yourself.`,
      resistance: `The phrase "${pattern.pattern.split('"')[1]}" appeared ${pattern.frequency} times in your conversations, suggesting internal resistance to growth.`,
      blind_spot: `You've expressed "${pattern.pattern.split('"')[1]}" beliefs about yourself. Consider examining if this reflects your true nature.`
    };

    return {
      id: pattern.id,
      title: titles[insightType][Math.floor(Math.random() * titles[insightType].length)],
      message: messages[pattern.type],
      shadowPattern: pattern,
      actionableSteps: this.generateActionableSteps(pattern),
      confidence: pattern.confidence,
      priority: pattern.emotionalIntensity > 0.8 ? 'high' : pattern.emotionalIntensity > 0.6 ? 'medium' : 'low',
      conversationContext: pattern.userQuote.substring(0, 100) + '...',
      type: insightType
    };
  }

  private static generateActionableSteps(pattern: ShadowPattern): string[] {
    const steps: Record<ShadowPattern['type'], string[]> = {
      emotional_trigger: [
        'Notice when this emotion arises without judgment',
        'Breathe deeply and pause before reacting',
        'Ask: "What is this feeling trying to teach me?"'
      ],
      projection: [
        'Consider how this quality might exist within you',
        'Practice owning your projections when they arise',
        'Ask: "How am I like the person I\'m describing?"'
      ],
      resistance: [
        'Explore what you\'re resisting and why',
        'Practice accepting what is before trying to change it',
        'Ask: "What would happen if I stopped resisting this?"'
      ],
      blind_spot: [
        'Question the truth of this belief about yourself',
        'Look for evidence that contradicts this belief',
        'Practice self-compassion when this belief arises'
      ]
    };

    return steps[pattern.type] || [];
  }
}
