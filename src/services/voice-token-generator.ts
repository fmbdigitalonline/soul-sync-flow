
import { LayeredBlueprint, VoiceTokens } from '@/types/personality-modules';

export class VoiceTokenGenerator {
  static generateVoiceTokens(blueprint: Partial<LayeredBlueprint>): VoiceTokens {
    try {
      // Extract user's first name for personalized voice tokens
      const userName = this.extractUserName(blueprint);
      
      // Generate base voice characteristics
      const pacing = this.generatePacing(blueprint);
      const expressiveness = this.generateExpressiveness(blueprint);
      const vocabulary = this.generateVocabulary(blueprint);
      const conversationStyle = this.generateConversationStyle(blueprint);
      
      // Generate name-aware signature phrases
      const signaturePhrases = this.generateSignaturePhrases(blueprint, userName);
      const greetingStyles = this.generateGreetingStyles(blueprint, userName);
      const transitionWords = this.generateTransitionWords(blueprint, userName);

      return {
        pacing,
        expressiveness,
        vocabulary,
        conversationStyle,
        signaturePhrases,
        greetingStyles,
        transitionWords
      };
    } catch (error) {
      console.error("❌ Voice Token Generator: Error generating tokens:", error);
      return this.getDefaultVoiceTokens();
    }
  }

  private static extractUserName(blueprint: Partial<LayeredBlueprint>): string {
    try {
      const userMeta = blueprint.user_meta;
      return userMeta?.preferred_name || 
             userMeta?.full_name?.split(' ')[0] || 
             'friend';
    } catch (error) {
      return 'friend';
    }
  }

  private static generatePacing(blueprint: Partial<LayeredBlueprint>): VoiceTokens['pacing'] {
    const mbtiType = blueprint.cognitiveTemperamental?.mbtiType;
    const humanDesignType = blueprint.energyDecisionStrategy?.humanDesignType;

    let sentenceLength: 'short' | 'medium' | 'flowing' | 'elaborate' = 'medium';
    let pauseFrequency: 'minimal' | 'thoughtful' | 'dramatic' = 'thoughtful';
    let rhythmPattern: 'steady' | 'varied' | 'staccato' | 'melodic' = 'steady';

    if (mbtiType && ['ISTJ', 'ESTJ', 'INTJ', 'ENTJ'].includes(mbtiType)) {
      sentenceLength = 'short';
      pauseFrequency = 'minimal';
    } else if (mbtiType && ['ISFP', 'ESFP', 'INFP', 'ENFP'].includes(mbtiType)) {
      sentenceLength = 'flowing';
      pauseFrequency = 'thoughtful';
    }

    if (humanDesignType === 'Projector') {
      pauseFrequency = 'thoughtful';
      rhythmPattern = 'varied';
    } else if (humanDesignType === 'Generator') {
      sentenceLength = 'medium';
      rhythmPattern = 'melodic';
    }

    return {
      sentenceLength,
      pauseFrequency,
      rhythmPattern
    };
  }

  private static generateExpressiveness(blueprint: Partial<LayeredBlueprint>): VoiceTokens['expressiveness'] {
    const sunSign = blueprint.publicArchetype?.sunSign;
    const lifePath = blueprint.coreValuesNarrative?.lifePath;

    let emojiFrequency: 'none' | 'rare' | 'occasional' | 'frequent' = 'occasional';
    let emphasisStyle: 'bold' | 'italic' | 'caps' | 'punctuation' | 'subtle' = 'punctuation';
    let exclamationTendency: 'reserved' | 'balanced' | 'enthusiastic' = 'balanced';

    if (sunSign && ['Leo', 'Sagittarius', 'Gemini'].includes(sunSign)) {
      emojiFrequency = 'frequent';
      exclamationTendency = 'enthusiastic';
    } else if (sunSign && ['Cancer', 'Pisces', 'Libra'].includes(sunSign)) {
      emojiFrequency = 'occasional';
      emphasisStyle = 'subtle';
    }

    // Convert lifePath to number safely
    const lifePathNumber = typeof lifePath === 'string' ? parseInt(lifePath) : lifePath;
    if (typeof lifePathNumber === 'number' && [3, 5, 8].includes(lifePathNumber)) {
      emphasisStyle = 'bold';
      exclamationTendency = 'enthusiastic';
    } else if (typeof lifePathNumber === 'number' && [2, 6, 9].includes(lifePathNumber)) {
      emphasisStyle = 'subtle';
      exclamationTendency = 'reserved';
    }

    return {
      emojiFrequency,
      emphasisStyle,
      exclamationTendency
    };
  }

  private static generateVocabulary(blueprint: Partial<LayeredBlueprint>): VoiceTokens['vocabulary'] {
    const mbtiType = blueprint.cognitiveTemperamental?.mbtiType;
    const archetype = blueprint.publicArchetype?.sunSign;

    let formalityLevel: 'casual' | 'conversational' | 'professional' | 'academic' = 'conversational';
    let metaphorUsage: 'literal' | 'occasional' | 'frequent' | 'poetic' = 'occasional';
    let technicalDepth: 'simplified' | 'balanced' | 'detailed' | 'expert' = 'balanced';

    if (mbtiType && ['INTJ', 'ENTJ', 'INTP', 'ENTP'].includes(mbtiType)) {
      formalityLevel = 'professional';
      technicalDepth = 'detailed';
    } else if (mbtiType && ['ISFP', 'ESFP', 'INFP', 'ENFP'].includes(mbtiType)) {
      formalityLevel = 'casual';
      metaphorUsage = 'frequent';
    }

    if (archetype && ['Aquarius', 'Scorpio', 'Capricorn'].includes(archetype)) {
      technicalDepth = 'detailed';
    } else if (archetype && ['Taurus', 'Virgo', 'Cancer'].includes(archetype)) {
      technicalDepth = 'simplified';
    }

    return {
      formalityLevel,
      metaphorUsage,
      technicalDepth
    };
  }

  private static generateConversationStyle(blueprint: Partial<LayeredBlueprint>): VoiceTokens['conversationStyle'] {
    const humanDesignType = blueprint.energyDecisionStrategy?.humanDesignType;
    const lifePath = blueprint.coreValuesNarrative?.lifePath;

    let questionAsking: 'direct' | 'exploratory' | 'socratic' | 'supportive' = 'exploratory';
    let responseLength: 'concise' | 'thorough' | 'comprehensive' | 'storytelling' = 'thorough';
    let personalSharing: 'minimal' | 'relevant' | 'warm' | 'intimate' = 'relevant';

    if (humanDesignType === 'Manifestor') {
      questionAsking = 'direct';
      responseLength = 'concise';
    } else if (humanDesignType === 'Reflector') {
      questionAsking = 'supportive';
      responseLength = 'comprehensive';
    }

    // Convert lifePath to number safely
    const lifePathNumber = typeof lifePath === 'string' ? parseInt(lifePath) : lifePath;
    if (typeof lifePathNumber === 'number' && [1, 5, 7].includes(lifePathNumber)) {
      personalSharing = 'minimal';
      responseLength = 'concise';
    } else if (typeof lifePathNumber === 'number' && [4, 6, 9].includes(lifePathNumber)) {
      personalSharing = 'warm';
      questionAsking = 'supportive';
    }

    return {
      questionAsking,
      responseLength,
      personalSharing
    };
  }

  private static generateSignaturePhrases(blueprint: Partial<LayeredBlueprint>, userName: string): string[] {
    const mbtiType = blueprint.cognitiveTemperamental?.mbtiType;
    const sunSign = blueprint.publicArchetype?.sunSign;

    let basePhrases = ['Let\'s explore this together', 'I hear you', 'Trust the process'];

    if (mbtiType && ['INFJ', 'ENFJ', 'INFP', 'ENFP'].includes(mbtiType)) {
      basePhrases = ['What feels right to you?', 'How can I support you?', 'You have the answers'];
    } else if (mbtiType && ['ISTP', 'ESTP', 'ISTJ', 'ESTJ'].includes(mbtiType)) {
      basePhrases = ['Let\'s get to the point', 'What are the facts?', 'What\'s the plan?'];
    }

    if (sunSign && ['Libra', 'Gemini', 'Aquarius'].includes(sunSign)) {
      basePhrases = ['Let\'s consider all options', 'What do you think?', 'How can we collaborate?'];
    } else if (sunSign && ['Aries', 'Leo', 'Sagittarius'].includes(sunSign)) {
      basePhrases = ['Let\'s take action', 'What\'s your vision?', 'How can we make this happen?'];
    }

    // Add personalized signature phrases with user's name
    const personalizedPhrases = basePhrases.map(phrase => {
      if (userName !== 'friend' && Math.random() > 0.5) {
        // 50% chance to personalize each phrase
        if (phrase.includes('you') || phrase.includes('together')) {
          return phrase.replace(/\byou\b/g, userName).replace('together', `together, ${userName}`);
        } else {
          return `${phrase}, ${userName}`;
        }
      }
      return phrase;
    });

    // Add some purely name-based phrases
    if (userName !== 'friend') {
      personalizedPhrases.push(
        `Trust yourself, ${userName}`,
        `You've got this, ${userName}`,
        `Let's explore this together, ${userName}`
      );
    }

    return personalizedPhrases;
  }

  private static generateGreetingStyles(blueprint: Partial<LayeredBlueprint>, userName: string): string[] {
    const sunSign = blueprint.publicArchetype?.sunSign;
    const humanDesignType = blueprint.energyDecisionStrategy?.humanDesignType;

    let baseGreetings = ['Hello', 'Welcome', 'Let\'s begin'];

    if (sunSign && ['Cancer', 'Libra', 'Pisces'].includes(sunSign)) {
      baseGreetings = ['Nice to see you', 'How are you today?', 'Welcome back'];
    } else if (sunSign && ['Capricorn', 'Virgo', 'Taurus'].includes(sunSign)) {
      baseGreetings = ['Good day', 'Let\'s get started', 'Welcome'];
    }

    if (humanDesignType === 'Generator') {
      baseGreetings = ['Ready to create?', 'What excites you today?', 'Let\'s dive in'];
    } else if (humanDesignType === 'Projector') {
      baseGreetings = ['How can I guide you?', 'What\'s your focus?', 'Welcome'];
    }

    // Add personalized greetings
    if (userName !== 'friend') {
      const personalizedGreetings = baseGreetings.map(greeting => `${greeting}, ${userName}`);
      return [...baseGreetings, ...personalizedGreetings];
    }

    return baseGreetings;
  }

  private static generateTransitionWords(blueprint: Partial<LayeredBlueprint>, userName: string): string[] {
    const mbtiType = blueprint.cognitiveTemperamental?.mbtiType;
    const lifePath = blueprint.coreValuesNarrative?.lifePath;

    let baseTransitions = ['Now', 'Moving forward', 'Consider this'];

    if (mbtiType && ['INTJ', 'ENTJ', 'ISTP', 'ESTP'].includes(mbtiType)) {
      baseTransitions = ['Next', 'Therefore', 'In conclusion'];
    } else if (mbtiType && ['INFP', 'ENFP', 'ISFJ', 'ESFJ'].includes(mbtiType)) {
      baseTransitions = ['Also', 'Additionally', 'On the other hand'];
    }

    // Convert lifePath to number safely
    const lifePathNumber = typeof lifePath === 'string' ? parseInt(lifePath) : lifePath;
    if (typeof lifePathNumber === 'number' && [3, 5, 8].includes(lifePathNumber)) {
      baseTransitions = ['Let\'s jump in', 'Excitingly', 'Onward'];
    } else if (typeof lifePathNumber === 'number' && [2, 6, 9].includes(lifePathNumber)) {
      baseTransitions = ['Gently', 'Reflectively', 'Patiently'];
    }

    // Add personalized transitions
    if (userName !== 'friend') {
      const personalizedTransitions = [
        `Now ${userName}`,
        `Consider this, ${userName}`,
        `Moving forward, ${userName}`,
        `Let's think about this, ${userName}`
      ];
      return [...baseTransitions, ...personalizedTransitions];
    }

    return baseTransitions;
  }

  private static getDefaultVoiceTokens(): VoiceTokens {
    return {
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
      signaturePhrases: [],
      greetingStyles: [],
      transitionWords: []
    };
  }
}
