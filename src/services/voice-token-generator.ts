
import { LayeredBlueprint, VoiceTokens } from '@/types/personality-modules';

export class VoiceTokenGenerator {
  
  /**
   * Generates voice tokens based on personality blueprint
   */
  static generateVoiceTokens(blueprint: Partial<LayeredBlueprint>): VoiceTokens {
    const mbtiType = blueprint.cognitiveTemperamental?.mbtiType || '';
    const hdType = blueprint.energyDecisionStrategy?.humanDesignType || '';
    const lifePath = blueprint.coreValuesNarrative?.lifePath || 1;
    const sunSign = blueprint.publicArchetype?.sunSign || '';
    const communicationStyle = blueprint.cognitiveTemperamental?.communicationStyle || '';
    
    console.log('Generating voice tokens for:', { mbtiType, hdType, lifePath, sunSign });

    return {
      pacing: this.generatePacing(mbtiType, hdType, communicationStyle),
      expressiveness: this.generateExpressiveness(mbtiType, sunSign, lifePath),
      vocabulary: this.generateVocabulary(blueprint),
      conversationStyle: this.generateConversationStyle(blueprint),
      signaturePhrases: this.generateSignaturePhrases(blueprint),
      greetingStyles: this.generateGreetingStyles(mbtiType, sunSign),
      transitionWords: this.generateTransitionWords(mbtiType, communicationStyle)
    };
  }

  private static generatePacing(
    mbtiType: string, 
    hdType: string, 
    communicationStyle: string
  ): VoiceTokens['pacing'] {
    // Sentence length based on cognitive functions
    let sentenceLength: VoiceTokens['pacing']['sentenceLength'] = 'medium';
    
    if (mbtiType.includes('N')) {
      sentenceLength = mbtiType.includes('P') ? 'flowing' : 'elaborate';
    } else if (mbtiType.includes('S')) {
      sentenceLength = mbtiType.includes('J') ? 'short' : 'medium';
    }

    // Pause frequency based on introversion/extraversion and HD type
    let pauseFrequency: VoiceTokens['pacing']['pauseFrequency'] = 'thoughtful';
    
    if (mbtiType.startsWith('E')) {
      pauseFrequency = hdType === 'Manifestor' ? 'dramatic' : 'minimal';
    } else {
      pauseFrequency = hdType === 'Reflector' ? 'dramatic' : 'thoughtful';
    }

    // Rhythm pattern based on communication style and energy type
    let rhythmPattern: VoiceTokens['pacing']['rhythmPattern'] = 'steady';
    
    if (communicationStyle.includes('dynamic')) rhythmPattern = 'varied';
    if (communicationStyle.includes('direct')) rhythmPattern = 'staccato';
    if (communicationStyle.includes('flowing')) rhythmPattern = 'melodic';

    return { sentenceLength, pauseFrequency, rhythmPattern };
  }

  private static generateExpressiveness(
    mbtiType: string, 
    sunSign: string, 
    lifePath: number
  ): VoiceTokens['expressiveness'] {
    // Emoji frequency based on feeling vs thinking and fire signs
    let emojiFrequency: VoiceTokens['expressiveness']['emojiFrequency'] = 'occasional';
    
    const fireSignsSun = ['Aries', 'Leo', 'Sagittarius'].includes(sunSign);
    const feelingType = mbtiType.includes('F');
    
    if (feelingType && fireSignsSun) {
      emojiFrequency = 'frequent';
    } else if (feelingType || fireSignsSun) {
      emojiFrequency = 'occasional';
    } else if (mbtiType.includes('T') && ['Capricorn', 'Virgo'].includes(sunSign)) {
      emojiFrequency = 'rare';
    }

    // Emphasis style based on MBTI and life path
    let emphasisStyle: VoiceTokens['expressiveness']['emphasisStyle'] = 'subtle';
    
    if (lifePath === 1 || lifePath === 8) emphasisStyle = 'bold';
    if (lifePath === 3 || lifePath === 5) emphasisStyle = 'punctuation';
    if (lifePath === 2 || lifePath === 6) emphasisStyle = 'italic';
    if (lifePath === 7 || lifePath === 9) emphasisStyle = 'subtle';

    // Exclamation tendency
    let exclamationTendency: VoiceTokens['expressiveness']['exclamationTendency'] = 'balanced';
    
    if (mbtiType.startsWith('E') && feelingType) {
      exclamationTendency = 'enthusiastic';
    } else if (mbtiType.startsWith('I') && mbtiType.includes('T')) {
      exclamationTendency = 'reserved';
    }

    return { emojiFrequency, emphasisStyle, exclamationTendency };
  }

  private static generateVocabulary(blueprint: Partial<LayeredBlueprint>): VoiceTokens['vocabulary'] {
    const mbtiType = blueprint.cognitiveTemperamental?.mbtiType || '';
    const education = blueprint.coreValuesNarrative?.meaningfulAreas || [];
    const communicationStyle = blueprint.cognitiveTemperamental?.communicationStyle || '';
    
    // Formality level
    let formalityLevel: VoiceTokens['vocabulary']['formalityLevel'] = 'conversational';
    
    if (mbtiType.includes('J') && education.includes('academics')) {
      formalityLevel = 'professional';
    } else if (mbtiType.includes('P') && communicationStyle.includes('casual')) {
      formalityLevel = 'casual';
    }

    // Metaphor usage based on intuition vs sensing
    let metaphorUsage: VoiceTokens['vocabulary']['metaphorUsage'] = 'occasional';
    
    if (mbtiType.includes('N')) {
      metaphorUsage = mbtiType.includes('F') ? 'poetic' : 'frequent';
    } else if (mbtiType.includes('S')) {
      metaphorUsage = 'literal';
    }

    // Technical depth based on thinking preference and meaningful areas
    let technicalDepth: VoiceTokens['vocabulary']['technicalDepth'] = 'balanced';
    
    if (mbtiType.includes('T') && education.includes('technology')) {
      technicalDepth = 'expert';
    } else if (mbtiType.includes('F') && education.includes('relationships')) {
      technicalDepth = 'simplified';
    }

    return { formalityLevel, metaphorUsage, technicalDepth };
  }

  private static generateConversationStyle(blueprint: Partial<LayeredBlueprint>): VoiceTokens['conversationStyle'] {
    const mbtiType = blueprint.cognitiveTemperamental?.mbtiType || '';
    const empathyLevel = blueprint.interactionPreferences?.empathyLevel || '';
    const rapportStyle = blueprint.interactionPreferences?.rapportStyle || '';
    
    // Question asking style
    let questionAsking: VoiceTokens['conversationStyle']['questionAsking'] = 'exploratory';
    
    if (mbtiType.includes('T') && mbtiType.includes('J')) {
      questionAsking = 'direct';
    } else if (mbtiType.includes('N') && mbtiType.includes('T')) {
      questionAsking = 'socratic';
    } else if (mbtiType.includes('F')) {
      questionAsking = 'supportive';
    }

    // Response length based on extraversion and intuition
    let responseLength: VoiceTokens['conversationStyle']['responseLength'] = 'thorough';
    
    if (mbtiType.startsWith('E') && mbtiType.includes('N')) {
      responseLength = 'storytelling';
    } else if (mbtiType.startsWith('I') && mbtiType.includes('S')) {
      responseLength = 'concise';
    } else if (mbtiType.includes('J')) {
      responseLength = 'comprehensive';
    }

    // Personal sharing based on feeling preference and rapport style
    let personalSharing: VoiceTokens['conversationStyle']['personalSharing'] = 'relevant';
    
    if (empathyLevel === 'high' && rapportStyle.includes('warm')) {
      personalSharing = 'warm';
    } else if (mbtiType.includes('T') && rapportStyle.includes('professional')) {
      personalSharing = 'minimal';
    }

    return { questionAsking, responseLength, personalSharing };
  }

  private static generateSignaturePhrases(blueprint: Partial<LayeredBlueprint>): string[] {
    const mbtiType = blueprint.cognitiveTemperamental?.mbtiType || '';
    const lifePath = blueprint.coreValuesNarrative?.lifePath || 1;
    const northStar = blueprint.coreValuesNarrative?.northStar || '';
    
    const phrases: string[] = [];

    // MBTI-based phrases
    const mbtiPhrases: Record<string, string[]> = {
      'ENFP': ['That sparks an idea!', 'Let\'s explore this together', 'I sense possibility here'],
      'INFJ': ['There\'s deeper wisdom here', 'I feel this connects to...', 'Trust your inner knowing'],
      'ENTP': ['Here\'s another angle', 'What if we tried...', 'That\'s fascinating because...'],
      'INTJ': ['The pattern I see is...', 'Strategically speaking...', 'Long-term, this means...']
    };

    phrases.push(...(mbtiPhrases[mbtiType] || ['Let\'s dive deeper', 'I hear you', 'That makes sense']));

    // Life path based phrases
    const lifePathPhrases: Record<number, string[]> = {
      1: ['You have the power to lead', 'Trust your initiative', 'Pioneer this path'],
      2: ['Balance is key here', 'Consider the harmony', 'Your sensitivity is strength'],
      3: ['Express your creativity', 'Share your vision', 'Your voice matters'],
      4: ['Build it step by step', 'Foundation first', 'Steady progress wins'],
      5: ['Embrace the adventure', 'Freedom through exploration', 'Change brings growth'],
      6: ['Service is your strength', 'Nurture this growth', 'Community matters'],
      7: ['Trust your intuition', 'Seek the deeper truth', 'Wisdom emerges'],
      8: ['Channel your power wisely', 'Achievement through integrity', 'Success serves all'],
      9: ['See the bigger picture', 'Universal wisdom guides', 'Completion brings renewal']
    };

    phrases.push(...(lifePathPhrases[lifePath] || ['Trust the process', 'You\'re exactly where you need to be']));

    return phrases.slice(0, 8); // Limit to 8 signature phrases
  }

  private static generateGreetingStyles(mbtiType: string, sunSign: string): string[] {
    const greetings: string[] = [];
    
    // Extraversion vs Introversion
    if (mbtiType.startsWith('E')) {
      greetings.push('Hey there!', 'Great to connect with you!', 'Ready to dive in?');
    } else {
      greetings.push('Hello', 'Welcome', 'Let\'s begin thoughtfully');
    }

    // Sun sign modifications
    const fireSignsGreetings = ['Let\'s ignite this conversation!', 'Energy is high today!'];
    const waterSignsGreetings = ['I sense you\'re ready to explore', 'Flowing into our time together'];
    const earthSignsGreetings = ['Let\'s ground ourselves first', 'Practical wisdom awaits'];
    const airSignsGreetings = ['Ideas are flowing', 'Mental clarity emerging'];

    if (['Aries', 'Leo', 'Sagittarius'].includes(sunSign)) {
      greetings.push(...fireSignsGreetings);
    } else if (['Cancer', 'Scorpio', 'Pisces'].includes(sunSign)) {
      greetings.push(...waterSignsGreetings);
    } else if (['Taurus', 'Virgo', 'Capricorn'].includes(sunSign)) {
      greetings.push(...earthSignsGreetings);
    } else if (['Gemini', 'Libra', 'Aquarius'].includes(sunSign)) {
      greetings.push(...airSignsGreetings);
    }

    return greetings.slice(0, 6);
  }

  private static generateTransitionWords(mbtiType: string, communicationStyle: string): string[] {
    const transitions: string[] = ['Now', 'Moving forward', 'Let\'s explore', 'Consider this'];
    
    // Thinking types prefer logical transitions
    if (mbtiType.includes('T')) {
      transitions.push('Logically', 'Therefore', 'Given that', 'The data suggests');
    }
    
    // Feeling types prefer emotional/value-based transitions
    if (mbtiType.includes('F')) {
      transitions.push('What feels right', 'Your heart knows', 'Honoring your values', 'With compassion');
    }
    
    // Intuitive types use conceptual transitions
    if (mbtiType.includes('N')) {
      transitions.push('Imagine if', 'The bigger picture', 'Connecting the dots', 'What emerges');
    }
    
    // Sensing types use practical transitions
    if (mbtiType.includes('S')) {
      transitions.push('In practice', 'Step by step', 'Realistically', 'Here and now');
    }

    return transitions.slice(0, 8);
  }
}
