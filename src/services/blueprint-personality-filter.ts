import { LayeredBlueprint } from '@/types/personality-modules';

interface PersonalityFilterOptions {
  emphasizeReflection?: boolean;
  includeActionableAdvice?: boolean;
  tone?: 'warm' | 'direct' | 'supportive' | 'encouraging';
}

interface FilteredResponse {
  content: string;
  personalTouches: string[];
  blueprintReferences: string[];
}

export class BlueprintPersonalityFilter {
  private blueprint: LayeredBlueprint;
  private userName: string;

  constructor(blueprint: LayeredBlueprint) {
    this.blueprint = blueprint;
    this.userName = blueprint.user_meta?.preferred_name || 'friend';
  }

  /**
   * Main filtering method - enhances LLM response with personality-aware touches
   */
  filterResponse(
    originalResponse: string, 
    userMessage: string, 
    options: PersonalityFilterOptions = {}
  ): FilteredResponse {
    console.log("🎭 Blueprint Filter: Processing response for personalization");
    
    // Check if this is a direct blueprint request
    if (this.isDirectBlueprintRequest(userMessage)) {
      console.log("🎯 Blueprint Filter: Detected direct blueprint request");
      return {
        content: this.handleDirectBlueprintRequest(userMessage, originalResponse),
        personalTouches: ['Direct blueprint data provided'],
        blueprintReferences: ['Full blueprint data']
      };
    }
    
    let filteredContent = originalResponse;
    const personalTouches: string[] = [];
    const blueprintReferences: string[] = [];

    // Step 1: Add natural name integration
    filteredContent = this.addNamePersonalization(filteredContent);

    // Step 2: Enhance tone based on personality type
    filteredContent = this.adjustToneForPersonality(filteredContent, options.tone);

    // Step 3: Add relevant blueprint insights where they naturally fit
    const insights = this.generateRelevantInsights(userMessage, originalResponse);
    if (insights.length > 0) {
      filteredContent = this.integrateInsights(filteredContent, insights);
      blueprintReferences.push(...insights);
    }

    // Step 4: Add personality-specific examples or metaphors
    const examples = this.addPersonalityExamples(filteredContent, userMessage);
    if (examples) {
      filteredContent = examples;
      personalTouches.push('Added personality-specific examples');
    }

    // Step 5: Adjust communication style
    filteredContent = this.adjustCommunicationStyle(filteredContent);

    return {
      content: filteredContent,
      personalTouches,
      blueprintReferences
    };
  }

  // NEW: Detect direct blueprint requests
  private isDirectBlueprintRequest(userMessage: string): boolean {
    const lowerMessage = userMessage.toLowerCase();
    return lowerMessage.includes('full blueprint') || 
           lowerMessage.includes('my blueprint') || 
           lowerMessage.includes('tell me my') && (lowerMessage.includes('mbti') || lowerMessage.includes('human design') || lowerMessage.includes('personality'));
  }

  // NEW: Handle direct blueprint requests with actual data
  private handleDirectBlueprintRequest(userMessage: string, originalResponse: string): string {
    console.log("🎯 Blueprint Filter: Providing actual blueprint data");
    
    const mbtiType = this.blueprint.cognitiveTemperamental?.mbtiType || 'Unknown';
    const hdType = this.blueprint.energyDecisionStrategy?.humanDesignType || 'Unknown';
    const hdAuthority = this.blueprint.energyDecisionStrategy?.authority || 'Unknown';
    const sunSign = this.blueprint.publicArchetype?.sunSign || 'Unknown';
    const moonSign = this.blueprint.publicArchetype?.moonSign || 'Unknown';
    const lifePath = this.blueprint.coreValuesNarrative?.lifePath || 'Unknown';

    return `Here's your complete personality blueprint, ${this.userName}:

**Core Personality Architecture:**
• **MBTI Type:** ${mbtiType}
• **Human Design:** ${hdType} with ${hdAuthority} Authority
• **Astrological Profile:** ${sunSign} Sun, ${moonSign} Moon
• **Life Path:** ${lifePath}

**What This Means For You:**
- Your ${mbtiType} nature means you ${this.getMBTIInsight(mbtiType)}
- As a ${hdType}, your strategy is to ${this.getHumanDesignStrategy(hdType)}
- Your ${hdAuthority} Authority guides you to ${this.getAuthorityGuidance(hdAuthority)}
- Your ${sunSign} Sun brings ${this.getSunSignQuality(sunSign)} energy to your public expression

Would you like me to dive deeper into any specific aspect of your blueprint? I can explain how these different parts work together in your daily life.`;
  }

  private getMBTIInsight(type: string): string {
    const insights = {
      'INFP': 'process internally and value authenticity above all',
      'ENFP': 'energize through possibilities and connecting with others',
      'INFJ': 'see patterns and focus on meaningful impact',
      'ENFJ': 'naturally guide others toward their potential',
      'INTJ': 'think strategically and work toward long-term visions',
      'ENTJ': 'lead through organizing people and resources efficiently'
    };
    return insights[type as keyof typeof insights] || 'approach life through your unique cognitive lens';
  }

  private getHumanDesignStrategy(type: string): string {
    const strategies = {
      'Generator': 'respond to what lights you up and follow your gut',
      'Projector': 'wait for invitation and recognition before sharing your gifts',
      'Manifestor': 'initiate when you feel the urge, but inform others of your actions',
      'Reflector': 'wait a full lunar cycle before making major decisions'
    };
    return strategies[type as keyof typeof strategies] || 'follow your natural energy flow';
  }

  private getAuthorityGuidance(authority: string): string {
    const guidance = {
      'Sacral': 'trust your gut response - yes/no feelings in your body',
      'Emotional': 'ride your emotional wave before making decisions',
      'Splenic': 'trust your immediate intuitive hits',
      'Self-Projected': 'talk it out and listen to what you hear yourself say'
    };
    return guidance[authority as keyof typeof guidance] || 'make decisions from your center';
  }

  private addNamePersonalization(content: string): string {
    // Natural name integration without being excessive
    if (!content.includes(this.userName) && Math.random() < 0.3) {
      // Add name to beginning occasionally
      if (content.match(/^(I understand|That makes sense|I can see)/)) {
        content = content.replace(/^(I understand|That makes sense|I can see)/, 
          `$1, ${this.userName},`);
      }
    }
    return content;
  }

  private adjustToneForPersonality(content: string, preferredTone?: string): string {
    const mbtiType = this.blueprint.cognitiveTemperamental?.mbtiType;
    
    if (!mbtiType) return content;

    // Adjust tone based on MBTI preferences
    if (mbtiType.includes('F')) { // Feeling types
      content = this.softenLanguage(content);
    }
    
    if (mbtiType.includes('I')) { // Introverted types
      content = this.addReflectiveSpace(content);
    }

    if (mbtiType.includes('N')) { // Intuitive types
      content = this.addBigPictureContext(content);
    }

    return content;
  }

  private generateRelevantInsights(userMessage: string, response: string): string[] {
    const insights: string[] = [];
    const mbtiType = this.blueprint.cognitiveTemperamental?.mbtiType;
    const hdType = this.blueprint.energyDecisionStrategy?.humanDesignType;
    const sunSign = this.blueprint.publicArchetype?.sunSign;

    // Only add insights if they're contextually relevant
    if (this.isDecisionRelated(userMessage)) {
      if (hdType && hdType !== 'Unknown') {
        insights.push(this.getHumanDesignDecisionInsight(hdType));
      }
    }

    if (this.isEmotionalContent(userMessage)) {
      if (mbtiType?.includes('F')) {
        insights.push(`Your feeling-oriented nature means emotions are valuable data for you`);
      }
    }

    if (this.isEnergyRelated(userMessage)) {
      if (hdType === 'Generator') {
        insights.push(`As a Generator, you might notice your energy responds to what excites you`);
      }
    }

    return insights.slice(0, 1); // Maximum 1 insight per response to avoid overwhelm
  }

  private integrateInsights(content: string, insights: string[]): string {
    if (insights.length === 0) return content;
    
    const insight = insights[0];
    
    // Find natural integration points
    const sentences = content.split('. ');
    if (sentences.length > 1) {
      // Insert insight after first or second sentence
      const insertPoint = Math.min(1, sentences.length - 1);
      sentences.splice(insertPoint + 1, 0, insight);
      return sentences.join('. ');
    }
    
    // Add as a new paragraph if content is short
    return `${content}\n\n${insight}`;
  }

  private addPersonalityExamples(content: string, userMessage: string): string | null {
    const mbtiType = this.blueprint.cognitiveTemperamental?.mbtiType;
    
    if (!mbtiType) return null;

    // Add examples based on cognitive functions
    if (mbtiType.startsWith('IN') && this.isAboutPlanning(userMessage)) {
      return content.replace(
        /planning/gi,
        'thoughtful planning (which aligns with your intuitive nature)'
      );
    }

    return null;
  }

  private adjustCommunicationStyle(content: string): string {
    const mbtiType = this.blueprint.cognitiveTemperamental?.mbtiType;
    
    if (!mbtiType) return content;

    // Adjust based on communication preferences
    if (mbtiType.includes('P')) { // Perceiving types prefer flexibility
      content = content.replace(/must do|should do/gi, 'might consider');
      content = content.replace(/the answer is/gi, 'one possibility is');
    }

    if (mbtiType.includes('J')) { // Judging types like structure
      content = this.addStructureElements(content);
    }

    return content;
  }

  // Helper methods for content analysis
  private isDecisionRelated(message: string): boolean {
    return /decide|choice|choose|should I|what do you think/i.test(message);
  }

  private isEmotionalContent(message: string): boolean {
    return /feel|emotion|upset|happy|sad|anxious|excited/i.test(message);
  }

  private isEnergyRelated(message: string): boolean {
    return /energy|tired|motivated|burnout|enthusiasm/i.test(message);
  }

  private isAboutPlanning(message: string): boolean {
    return /plan|organize|schedule|goal|future/i.test(message);
  }

  private softenLanguage(content: string): string {
    return content
      .replace(/You need to/gi, 'You might want to')
      .replace(/You should/gi, 'You could consider');
  }

  private addReflectiveSpace(content: string): string {
    if (!content.includes('?') && content.length > 100) {
      return content + '\n\nWhat resonates with you about this?';
    }
    return content;
  }

  private addBigPictureContext(content: string): string {
    // Intuitive types appreciate broader context
    return content;
  }

  private getHumanDesignDecisionInsight(hdType: string): string {
    const insights = {
      'Generator': 'Trust your gut response - your Generator energy knows what lights you up',
      'Projector': 'Wait for recognition and invitation before sharing your insights',
      'Manifestor': 'Follow your urges to initiate, but remember to inform others',
      'Reflector': 'Take time to sense into this decision - there\'s no rush'
    };
    
    return insights[hdType as keyof typeof insights] || '';
  }

  private addStructureElements(content: string): string {
    // Add slight structure cues for Judging types
    if (content.includes('\n\n')) {
      return content; // Already has structure
    }
    
    const sentences = content.split('. ');
    if (sentences.length > 2) {
      return sentences.join('.\n\n');
    }
    
    return content;
  }

  /**
   * Handles direct blueprint questions with detailed explanations
   */
  handleDirectBlueprintQuestion(question: string, originalResponse: string): string {
    console.log("🎯 Blueprint Filter: Handling direct blueprint question");
    
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('mbti') || lowerQuestion.includes('personality type')) {
      return this.enhanceMBTIExplanation(originalResponse);
    }
    
    if (lowerQuestion.includes('generator') || lowerQuestion.includes('human design')) {
      return this.enhanceHumanDesignExplanation(originalResponse);
    }
    
    if (lowerQuestion.includes('life path') || lowerQuestion.includes('numerology')) {
      return this.enhanceLifePathExplanation(originalResponse);
    }
    
    if (lowerQuestion.includes('sun sign') || lowerQuestion.includes('astrology')) {
      return this.enhanceAstrologyExplanation(originalResponse);
    }
    
    return originalResponse;
  }

  private enhanceMBTIExplanation(response: string): string {
    const mbtiType = this.blueprint.cognitiveTemperamental?.mbtiType;
    if (!mbtiType || mbtiType === 'Unknown') return response;
    
    return `${response}\n\nFor you specifically, ${this.userName}, being ${mbtiType} means you process the world through ${this.getMBTIProcessingStyle(mbtiType)}. This shows up in how you make decisions, recharge your energy, and connect with others.`;
  }

  private enhanceHumanDesignExplanation(response: string): string {
    const hdType = this.blueprint.energyDecisionStrategy?.humanDesignType;
    if (!hdType || hdType === 'Unknown') return response;
    
    return `${response}\n\nIn your daily life, ${this.userName}, this Generator energy might show up as feeling most alive when you're doing work that excites you, and feeling drained when you're pushing through things that don't spark joy.`;
  }

  private enhanceLifePathExplanation(response: string): string {
    const lifePath = this.blueprint.coreValuesNarrative?.lifePath;
    if (!lifePath) return response;
    
    // Fixed: Ensure lifePath is converted to number
    const lifePathNumber = typeof lifePath === 'string' ? parseInt(lifePath, 10) : lifePath;
    return `${response}\n\nYour Life Path ${lifePathNumber} journey is about ${this.getLifePathTheme(lifePathNumber)}, ${this.userName}. Notice how this plays out in the choices that feel most meaningful to you.`;
  }

  private enhanceAstrologyExplanation(response: string): string {
    const sunSign = this.blueprint.publicArchetype?.sunSign;
    if (!sunSign || sunSign === 'Unknown') return response;
    
    return `${response}\n\nYour ${sunSign} sun brings ${this.getSunSignQuality(sunSign)} energy to how you express yourself in the world, ${this.userName}.`;
  }

  private getMBTIProcessingStyle(type: string): string {
    if (type.includes('N')) return 'intuition and big-picture thinking';
    if (type.includes('S')) return 'practical, step-by-step observation';
    return 'your unique cognitive approach';
  }

  private getLifePathTheme(path: number): string {
    const themes = {
      1: 'leadership and pioneering new paths',
      2: 'cooperation and bringing people together',
      3: 'creative expression and communication',
      4: 'building solid foundations and systems',
      5: 'freedom and exploring possibilities'
    };
    return themes[path as keyof typeof themes] || 'discovering your unique purpose';
  }

  private getSunSignQuality(sign: string): string {
    const qualities = {
      'Cancer': 'nurturing and emotionally intuitive',
      'Leo': 'creative and heart-centered',
      'Virgo': 'practical and service-oriented',
      'Libra': 'harmonious and relationship-focused'
    };
    return qualities[sign as keyof typeof qualities] || 'your unique solar';
  }
}

export const createBlueprintFilter = (blueprint: LayeredBlueprint) => {
  return new BlueprintPersonalityFilter(blueprint);
};
