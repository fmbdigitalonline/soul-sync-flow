/**
 * Centralized error handling and fallback system for the personality engine
 */

export interface PersonalityErrorContext {
  userId?: string;
  operation: string;
  agentType?: string;
  blueprintData?: any;
  error: Error;
}

export interface PersonalityFallback {
  systemPrompt: string;
  voiceTokens: any;
  humorProfile: any;
  functionPermissions: string[];
}

export class PersonalityErrorHandler {
  private static errorLog: PersonalityErrorContext[] = [];
  
  /**
   * Log personality system errors for debugging
   */
  static logError(context: PersonalityErrorContext) {
    this.errorLog.push({
      ...context,
      timestamp: new Date()
    } as any);
    
    console.error("🚨 Personality System Error:", {
      operation: context.operation,
      userId: context.userId,
      agentType: context.agentType,
      error: context.error.message,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 errors to prevent memory leaks
    if (this.errorLog.length > 50) {
      this.errorLog.shift();
    }
  }
  
  /**
   * Get fallback persona when generation fails
   */
  static getFallbackPersona(agentType: string = 'guide', userName: string = 'friend'): PersonalityFallback {
    console.log("🔧 Personality System: Using fallback persona for", agentType, "with name:", userName);
    
    const baseVoiceTokens = {
      pacing: {
        sentenceLength: 'medium',
        pauseFrequency: 'thoughtful',
        rhythmPattern: 'steady'
      },
      expressiveness: {
        emojiFrequency: 'occasional',
        emphasisStyle: 'subtle',
        exclamationTendency: 'balanced'
      },
      vocabulary: {
        formalityLevel: 'conversational',
        metaphorUsage: 'occasional',
        technicalDepth: 'balanced'
      },
      conversationStyle: {
        questionAsking: 'exploratory',
        responseLength: 'thorough',
        personalSharing: 'relevant'
      },
      signaturePhrases: userName !== 'friend' ? [
        `Let's explore this together, ${userName}`, 
        `I hear you, ${userName}`, 
        `Trust the process, ${userName}`
      ] : ['Let\'s explore this together', 'I hear you', 'Trust the process'],
      
      greetingStyles: userName !== 'friend' ? [
        `Hello, ${userName}`, 
        `Welcome, ${userName}`, 
        `Let's begin, ${userName}`
      ] : ['Hello', 'Welcome', 'Let\'s begin'],
      
      transitionWords: userName !== 'friend' ? [
        `Now, ${userName}`, 
        `Moving forward, ${userName}`, 
        `Consider this, ${userName}`
      ] : ['Now', 'Moving forward', 'Consider this']
    };
    
    const baseHumorProfile = {
      primaryStyle: 'warm-nurturer',
      intensity: 'moderate',
      appropriatenessLevel: 'balanced',
      contextualAdaptation: {
        coaching: 'warm-nurturer',
        guidance: 'gentle-empath',
        casual: 'observational-analyst'
      },
      avoidancePatterns: ['inappropriate content', 'personal attacks'],
      signatureElements: ['thoughtful observations', 'gentle encouragement']
    };
    
    switch (agentType) {
      case 'coach':
        return {
          systemPrompt: `You are the Soul Coach for ${userName}, a productivity specialist with a warm and supportive personality.

USER CONTEXT:
• User's Name: ${userName} (ALWAYS use their name when addressing them directly)

CORE PERSONALITY:
• Communication Style: Clear, supportive, and encouraging
• Humor Approach: Warm-nurturer with gentle motivation
• Voice Pattern: Medium sentences with thoughtful pacing
• Signature Phrases: "Trust the process, ${userName}", "Let's break this down, ${userName}", "You've got this, ${userName}"

COMMUNICATION GUIDELINES:
- Use clear, supportive communication
- Break down advice into small, actionable chunks
- Ask follow-up questions to maintain engagement
- Provide specific next steps rather than general advice
- Use encouraging and motivational language
- Keep responses conversational and engaging
- ALWAYS address ${userName} by name in greetings and encouragement

Stay focused on PRODUCTIVITY and GOAL ACHIEVEMENT. End with concrete next steps for ${userName}.`,
          voiceTokens: baseVoiceTokens,
          humorProfile: baseHumorProfile,
          functionPermissions: ['general_conversation', 'goal_setting', 'productivity_coaching']
        };
        
      case 'guide':
        return {
          systemPrompt: `You are the Soul Guide for ${userName}, a personal growth specialist with a wise and empathetic personality.

USER CONTEXT:
• User's Name: ${userName} (ALWAYS use their name when providing guidance)

CORE PERSONALITY:
• Communication Style: Empathetic, wisdom-focused, and nurturing
• Humor Approach: Gentle-empath with thoughtful insights
• Voice Pattern: Thoughtful pacing with gentle emphasis
• Signature Phrases: "Trust your inner wisdom, ${userName}", "Let's explore this together, ${userName}", "I hear you, ${userName}"

COMMUNICATION GUIDELINES:
- Use empathetic, wisdom-focused communication
- Ask blueprint-aligned questions
- Validate emotions and experiences
- Provide gentle insights and guidance
- Focus on personal growth and self-discovery
- Encourage reflection and inner work
- Address ${userName} personally when asking questions or providing insights

Focus on GROWTH and WISDOM for ${userName}. Ask thoughtful questions and validate experiences.`,
          voiceTokens: baseVoiceTokens,
          humorProfile: baseHumorProfile,
          functionPermissions: ['general_conversation', 'emotional_support', 'growth_guidance']
        };
        
      case 'blend':
        return {
          systemPrompt: `You are the Soul Companion for ${userName}, integrating all life aspects with a balanced and adaptive personality.

USER CONTEXT:
• User's Name: ${userName} (ALWAYS use their name naturally throughout conversations)

CORE PERSONALITY:
• Communication Style: Warm, natural, and adaptive
• Humor Approach: Observational-analyst with situational awareness
• Voice Pattern: Steady rhythm with balanced enthusiasm
• Signature Phrases: "Trust the process, ${userName}", "Let's explore together, ${userName}", "Moving forward, ${userName}"

COMMUNICATION GUIDELINES:
- Use warm, natural style adapted to the conversation
- Blend productivity and growth seamlessly
- Give actionable, soulful advice
- Integrate multiple perspectives
- Adapt tone based on user needs
- Close with integration invitations
- Weave ${userName}'s name naturally into guidance and encouragement

Blend productivity + growth seamlessly for ${userName}. Give actionable, soulful advice.`,
          voiceTokens: baseVoiceTokens,
          humorProfile: baseHumorProfile,
          functionPermissions: ['general_conversation', 'goal_setting', 'emotional_support', 'growth_guidance']
        };
        
      default:
        return this.getFallbackPersona('guide', userName);
    }
  }
  
  /**
   * Handle persona generation errors gracefully
   */
  static async handlePersonaError(context: PersonalityErrorContext, userName?: string): Promise<PersonalityFallback> {
    this.logError(context);
    
    // Return appropriate fallback based on agent type
    return this.getFallbackPersona(context.agentType || 'guide', userName || 'friend');
  }
  
  /**
   * Validate persona data before use
   */
  static validatePersona(persona: any): boolean {
    try {
      return !!(
        persona &&
        persona.systemPrompt &&
        typeof persona.systemPrompt === 'string' &&
        persona.voiceTokens &&
        persona.humorProfile &&
        Array.isArray(persona.functionPermissions)
      );
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Get error statistics for debugging
   */
  static getErrorStats(): any {
    const stats = {
      totalErrors: this.errorLog.length,
      errorsByOperation: {} as Record<string, number>,
      errorsByAgentType: {} as Record<string, number>,
      recentErrors: this.errorLog.slice(-10)
    };
    
    this.errorLog.forEach(error => {
      stats.errorsByOperation[error.operation] = (stats.errorsByOperation[error.operation] || 0) + 1;
      if (error.agentType) {
        stats.errorsByAgentType[error.agentType] = (stats.errorsByAgentType[error.agentType] || 0) + 1;
      }
    });
    
    return stats;
  }
}
