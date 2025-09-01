import { supabase } from '@/integrations/supabase/client';
import { ConversationInsight, ShadowPattern } from './conversation-shadow-detector';

export interface NullificationAdvice {
  id: string;
  title: string;
  message: string;
  specificSteps: string[];
  timingRecommendation: string;
  confidence: number;
  userChallenge: string;
  personalityAlignment: number;
}

export class NullificationAdviceGenerator {
  static async generateNullificationAdvice(userId: string, shadowPatterns: ShadowPattern[]): Promise<ConversationInsight[]> {
    try {
      // Get user blueprint for personalized advice
      const { data: blueprint } = await supabase
        .from('user_blueprints')
        .select('blueprint')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      const advice: ConversationInsight[] = [];

      for (const pattern of shadowPatterns) {
        if (pattern.confidence > 0.7) {
          const nullificationAdvice = await this.createPersonalizedAdvice(pattern, blueprint?.blueprint);
          if (nullificationAdvice) {
            advice.push(nullificationAdvice);
          }
        }
      }

      console.log(`🎯 Generated ${advice.length} nullification advice insights`);
      return advice;

    } catch (error) {
      console.error('🚨 Error generating nullification advice:', error);
      return [];
    }
  }

  private static async createPersonalizedAdvice(pattern: ShadowPattern, blueprint: any): Promise<ConversationInsight | null> {
    const personalityType = blueprint?.cognition_mbti?.type || 'Unknown';
    const energyType = blueprint?.energy_strategy_human_design?.type || 'Unknown';
    
    // Get recent challenge context
    const challengeContext = await this.getRecentChallengeContext(pattern.userQuote);
    
    const advice = this.generateSpecificAdvice(pattern, personalityType, energyType, challengeContext);
    if (!advice) return null;

    const timingAdvice = this.generateTimingRecommendation(pattern, energyType);
    
    return {
      id: `nullification_${pattern.id}`,
      title: advice.title,
      message: advice.message,
      shadowPattern: pattern,
      actionableSteps: advice.specificSteps,
      confidence: advice.confidence,
      priority: this.determinePriority(pattern, advice.confidence),
      conversationContext: pattern.userQuote,
      type: 'nullification'
    };
  }

  private static async getRecentChallengeContext(userQuote: string): Promise<string> {
    // Extract the core challenge from the user's own words
    const challengeKeywords = ['struggling', 'difficult', 'hard', 'challenging', 'frustrated', 'stuck', 'overwhelmed'];
    const quote = userQuote.toLowerCase();
    
    const challenges = challengeKeywords.filter(keyword => quote.includes(keyword));
    return challenges.length > 0 ? `User is ${challenges.join(', ')} with this area` : 'General growth opportunity';
  }

  private static generateSpecificAdvice(
    pattern: ShadowPattern, 
    mbtiType: string, 
    energyType: string, 
    challengeContext: string
  ): NullificationAdvice | null {
    
    const adviceTemplates = {
      emotional_trigger: {
        title: 'Emotional Trigger Nullification',
        baseMessage: (trigger: string, context: string) => 
          `You've been triggered by ${trigger} repeatedly. ${context}. Here's how to neutralize this pattern:`,
        steps: {
          'Projector': [
            'Wait for the emotional charge to pass before responding',
            'Ask others for their perspective on the situation',
            'Use your natural gift of seeing others clearly to understand the trigger\'s source'
          ],
          'Generator': [
            'Channel this emotional energy into physical movement or activity',
            'Listen to your gut response - is this truly your emotion or absorbed from others?',
            'Use your sustainable energy to process this trigger completely'
          ],
          'Manifestor': [
            'Take immediate space to process this trigger alone',
            'Inform others about your emotional state to prevent misunderstandings',
            'Use your initiating energy to break this trigger pattern decisively'
          ],
          'Reflector': [
            'Give yourself a full lunar cycle to understand this trigger',
            'Notice how different environments affect the intensity of this trigger',
            'Use your gift of discernment to see the trigger\'s true nature'
          ],
          'default': [
            'Create space between the trigger and your response',
            'Examine what this trigger is trying to protect or teach you',
            'Practice self-compassion when this trigger arises'
          ]
        }
      },
      projection: {
        title: 'Projection Pattern Nullification',
        baseMessage: (projectionText: string, context: string) => 
          `You've been projecting through phrases like "${projectionText}". ${context}. Here's how to reclaim these projections:`,
        steps: {
          'INTJ': [
            'Analyze how this projection serves your internal framework',
            'Create a systematic approach to owning these projected qualities',
            'Use your strategic thinking to transform projection into integration'
          ],
          'ENFP': [
            'Explore the creative potential within this projection',
            'Connect with others who can mirror back your projected qualities',
            'Use your enthusiasm to embrace all aspects of yourself'
          ],
          'default': [
            'Ask: "How am I like the person/thing I\'m describing?"',
            'Practice seeing projected qualities as gifts to reclaim',
            'Use projection as a mirror for self-discovery'
          ]
        }
      },
      resistance: {
        title: 'Resistance Pattern Nullification',
        baseMessage: (resistanceText: string, context: string) => 
          `You've been resisting through patterns like "${resistanceText}". ${context}. Here's how to transform resistance into flow:`,
        steps: {
          'Projector': [
            'Recognize that resistance often comes from trying to force instead of being invited',
            'Wait for clear invitations before taking action',
            'Use your penetrating awareness to see what you\'re really resisting'
          ],
          'Generator': ['Focus on what genuinely excites you instead of what you "should" do',
            'Trust your gut response - resistance often means "not this"',
            'Find the aspect of the situation that generates authentic enthusiasm'
          ],
          'default': [
            'Explore what fear underlies the resistance',
            'Practice accepting what is before trying to change it',
            'Transform "I have to" into "I choose to" when possible'
          ]
        }
      },
      blind_spot: {
        title: 'Limiting Belief Nullification',
        baseMessage: (beliefText: string, context: string) => 
          `You've been expressing limiting beliefs like "${beliefText}". ${context}. Here's how to transform these beliefs:`,
        steps: {
          'default': [
            'Question the evidence for this belief - is it really true?',
            'Look for examples that contradict this limiting belief',
            'Practice speaking a new, empowering truth about yourself'
          ]
        }
      }
    };

    const template = adviceTemplates[pattern.type];
    if (!template) return null;

    const patternText = pattern.pattern.split('"')[1] || pattern.pattern;
    const message = template.baseMessage(patternText, challengeContext);
    
    // Choose steps based on energy type first, then MBTI, then default
    const steps = template.steps[energyType] || template.steps[mbtiType] || template.steps['default'];
    
    return {
      id: `advice_${pattern.id}`,
      title: template.title,
      message,
      specificSteps: steps,
      timingRecommendation: this.generateTimingRecommendation(pattern, energyType),
      confidence: Math.min(0.95, pattern.confidence + 0.1),
      userChallenge: challengeContext,
      personalityAlignment: this.calculatePersonalityAlignment(energyType, mbtiType)
    };
  }

  private static generateTimingRecommendation(pattern: ShadowPattern, energyType: string): string {
    const timingMap = {
      'Projector': 'Practice this when you feel recognized and invited into the situation',
      'Generator': 'Apply this when you feel energetic and enthusiastic about growth',
      'Manifestor': 'Implement this immediately when you feel the urge to initiate change',
      'Reflector': 'Work with this pattern gradually over a full month cycle',
      'default': 'Start with small steps when you feel emotionally centered'
    };

    const baseRecommendation = timingMap[energyType] || timingMap['default'];
    
    // Add intensity-based timing
    if (pattern.emotionalIntensity > 0.8) {
      return `${baseRecommendation}. Given the high emotional charge, start with 5-minute practices.`;
    } else if (pattern.frequency > 3) {
      return `${baseRecommendation}. Since this pattern is frequent, practice daily awareness.`;
    }
    
    return baseRecommendation;
  }

  private static calculatePersonalityAlignment(energyType: string, mbtiType: string): number {
    // Higher alignment when we have specific personality data
    if (energyType !== 'Unknown' && mbtiType !== 'Unknown') return 0.9;
    if (energyType !== 'Unknown' || mbtiType !== 'Unknown') return 0.7;
    return 0.5; // Generic advice
  }

  private static determinePriority(pattern: ShadowPattern, confidence: number): 'low' | 'medium' | 'high' | 'critical' {
    if (pattern.emotionalIntensity > 0.8 && confidence > 0.8) return 'critical';
    if (pattern.emotionalIntensity > 0.7 && confidence > 0.7) return 'high';
    if (pattern.frequency > 2 && confidence > 0.6) return 'medium';
    return 'low';
  }
}