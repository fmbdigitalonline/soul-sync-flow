

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

  filterResponse(
    originalResponse: string, 
    userMessage: string, 
    options: PersonalityFilterOptions = {}
  ): FilteredResponse {
    console.log("🎭 Blueprint Filter: Processing response for comprehensive personalization");
    
    if (this.isDirectBlueprintRequest(userMessage)) {
      console.log("🎯 Blueprint Filter: Detected direct blueprint request");
      return {
        content: this.handleDirectBlueprintRequest(userMessage, originalResponse),
        personalTouches: ['Complete blueprint data provided'],
        blueprintReferences: ['Comprehensive blueprint data']
      };
    }
    
    let filteredContent = originalResponse;
    const personalTouches: string[] = [];
    const blueprintReferences: string[] = [];

    filteredContent = this.addNamePersonalization(filteredContent);
    filteredContent = this.adjustToneForPersonality(filteredContent, options.tone);

    const insights = this.generateRelevantInsights(userMessage, originalResponse);
    if (insights.length > 0) {
      filteredContent = this.integrateInsights(filteredContent, insights);
      blueprintReferences.push(...insights);
    }

    const examples = this.addPersonalityExamples(filteredContent, userMessage);
    if (examples) {
      filteredContent = examples;
      personalTouches.push('Added personality-specific examples');
    }

    filteredContent = this.adjustCommunicationStyle(filteredContent);

    return {
      content: filteredContent,
      personalTouches,
      blueprintReferences
    };
  }

  private isDirectBlueprintRequest(userMessage: string): boolean {
    const lowerMessage = userMessage.toLowerCase();
    return lowerMessage.includes('full blueprint') || 
           lowerMessage.includes('my blueprint') || 
           lowerMessage.includes('more numerology') ||
           lowerMessage.includes('is there more') ||
           (lowerMessage.includes('tell me my') && (lowerMessage.includes('mbti') || lowerMessage.includes('human design') || lowerMessage.includes('personality')));
  }

  private handleDirectBlueprintRequest(userMessage: string, originalResponse: string): string {
    console.log("🎯 Blueprint Filter: Providing comprehensive blueprint data");
    
    // Handle specific "is there more" or "more numerology" requests
    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes('more numerology') || lowerMessage.includes('numerology numbers')) {
      return this.handleNumerologyRequest();
    }
    
    if (lowerMessage.includes('is there more')) {
      return this.handleIsThereMoreRequest();
    }

    // Handle full blueprint requests
    return this.handleFullBlueprintRequest();
  }

  private handleNumerologyRequest(): string {
    console.log("🔢 Blueprint Filter: Handling numerology request");
    
    const numerologyData = [];
    const missingData = [];

    // Access life path number properly with type conversion
    const lifePath = this.blueprint.coreValuesNarrative?.lifePath;
    const lifePathNum = typeof lifePath === 'string' ? parseInt(lifePath, 10) : lifePath;
    if (lifePathNum && lifePathNum > 0) {
      const keyword = this.getLifePathKeyword(lifePathNum);
      numerologyData.push(`**Life Path ${lifePathNum}** ("${keyword}") - Your life's main purpose and journey`);
    } else {
      missingData.push('Life Path Number');
    }

    // Check for additional numerology numbers from the raw blueprint data
    const valuesLifePath = this.blueprint.user_meta?.values_life_path || {};
    
    if (valuesLifePath.expression_number) {
      const expressionNum = Number(valuesLifePath.expression_number);
      const keyword = this.getExpressionKeyword(expressionNum);
      numerologyData.push(`**Expression ${expressionNum}** ("${keyword}") - Your natural talents and abilities`);
    } else {
      missingData.push('Expression Number');
    }

    if (valuesLifePath.soul_urge_number) {
      const soulUrgeNum = Number(valuesLifePath.soul_urge_number);
      const keyword = this.getSoulUrgeKeyword(soulUrgeNum);
      numerologyData.push(`**Soul Urge ${soulUrgeNum}** ("${keyword}") - What your heart truly desires`);
    } else {
      missingData.push('Soul Urge Number');
    }

    if (valuesLifePath.personality_number) {
      const personalityNum = Number(valuesLifePath.personality_number);
      const keyword = this.getPersonalityKeyword(personalityNum);
      numerologyData.push(`**Personality ${personalityNum}** ("${keyword}") - How others see you`);
    } else {
      missingData.push('Personality Number');
    }

    if (valuesLifePath.birthday_number) {
      const birthdayNum = Number(valuesLifePath.birthday_number);
      const keyword = this.getBirthdayKeyword(birthdayNum);
      numerologyData.push(`**Birthday ${birthdayNum}** ("${keyword}") - Your special gift to the world`);
    } else {
      missingData.push('Birthday Number');
    }

    let response = `You're absolutely right, ${this.userName}! There should be more numerology detail. Here's what I have for you:\n\n`;

    if (numerologyData.length > 0) {
      response += numerologyData.join('\n\n');
    }

    if (missingData.length > 0) {
      response += `\n\n**Missing from your profile:** ${missingData.join(', ')}`;
      response += `\n\nWould you like help calculating these missing numbers? I can guide you through the process, or you can update your profile to get the complete picture.`;
    } else if (numerologyData.length > 0) {
      response += `\n\nYour numerology profile is complete! Each number reveals a different aspect of your soul's journey. Would you like me to explain how any of these show up in your daily life?`;
    }

    return response;
  }

  private handleIsThereMoreRequest(): string {
    console.log("🔍 Blueprint Filter: Handling 'is there more' request");
    
    let response = `You're right to ask, ${this.userName}! Let me check what additional blueprint information I have for you:\n\n`;

    const additionalSections = [];

    // Check for detailed Human Design info
    const energyStrategy = this.blueprint.energyDecisionStrategy;
    if (energyStrategy?.profile && energyStrategy.profile !== 'Unknown') {
      additionalSections.push(`**Human Design Profile:** ${energyStrategy.profile}`);
    }

    // Check for definition from raw data
    const hdData = this.blueprint.user_meta?.energy_strategy_human_design;
    if (hdData?.definition && hdData.definition !== 'Unknown') {
      additionalSections.push(`**Human Design Definition:** ${hdData.definition}`);
    }

    if (energyStrategy?.gates && energyStrategy.gates.length > 0) {
      additionalSections.push(`**Active Gates:** ${energyStrategy.gates.slice(0, 10).join(', ')}${energyStrategy.gates.length > 10 ? '...' : ''}`);
    }

    // Check for Big Five data from raw user_meta
    const cognitiveData = this.blueprint.user_meta?.personality;
    if (cognitiveData?.bigFive && Object.keys(cognitiveData.bigFive).length > 0) {
      const bigFive = cognitiveData.bigFive;
      additionalSections.push(`**Big Five Personality:** Openness ${Math.round((bigFive.openness || 0) * 100)}%, Conscientiousness ${Math.round((bigFive.conscientiousness || 0) * 100)}%, Extraversion ${Math.round((bigFive.extraversion || 0) * 100)}%, Agreeableness ${Math.round((bigFive.agreeableness || 0) * 100)}%, Neuroticism ${Math.round((bigFive.neuroticism || 0) * 100)}%`);
    }

    // Check for complete astrology
    if (this.blueprint.publicArchetype?.risingSign && this.blueprint.publicArchetype.risingSign !== 'Unknown') {
      additionalSections.push(`**Rising Sign:** ${this.blueprint.publicArchetype.risingSign} (your outer personality)`);
    }

    // Check for Chinese astrology
    if (this.blueprint.generationalCode?.chineseZodiac && this.blueprint.generationalCode.chineseZodiac !== 'Unknown') {
      let chineseInfo = `**Chinese Astrology:** ${this.blueprint.generationalCode.chineseZodiac}`;
      if (this.blueprint.generationalCode.element && this.blueprint.generationalCode.element !== 'Unknown') {
        chineseInfo += ` ${this.blueprint.generationalCode.element}`;
      }
      if (this.blueprint.generationalCode.keyword) {
        chineseInfo += ` ("${this.blueprint.generationalCode.keyword}")`;
      }
      additionalSections.push(chineseInfo);
    }

    // Check for goal stack
    if (this.blueprint.goalStack?.primaryGoal) {
      additionalSections.push(`**Current Goal Focus:** ${this.blueprint.goalStack.primaryGoal}`);
    }

    // Check for Bashar Suite
    if (this.blueprint.basharSuite?.beliefInterface?.principle) {
      additionalSections.push(`**Belief Principle:** "${this.blueprint.basharSuite.beliefInterface.principle}"`);
    }

    if (additionalSections.length > 0) {
      response += additionalSections.join('\n\n');
      response += `\n\nThere's definitely more depth here! Would you like me to explain any of these in detail, or help you explore how they work together?`;
    } else {
      response += `I've shown you the main elements I have access to. If you're expecting specific information that's missing, it might need to be calculated or added to your profile. What specific aspect were you looking for?`;
    }

    return response;
  }

  private handleFullBlueprintRequest(): string {
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
    if (!content.includes(this.userName) && Math.random() < 0.3) {
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

    if (mbtiType.includes('F')) {
      content = this.softenLanguage(content);
    }
    
    if (mbtiType.includes('I')) {
      content = this.addReflectiveSpace(content);
    }

    if (mbtiType.includes('N')) {
      content = this.addBigPictureContext(content);
    }

    return content;
  }

  private generateRelevantInsights(userMessage: string, response: string): string[] {
    const insights: string[] = [];
    const mbtiType = this.blueprint.cognitiveTemperamental?.mbtiType;
    const hdType = this.blueprint.energyDecisionStrategy?.humanDesignType;

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

    return insights.slice(0, 1);
  }

  private integrateInsights(content: string, insights: string[]): string {
    if (insights.length === 0) return content;
    
    const insight = insights[0];
    
    const sentences = content.split('. ');
    if (sentences.length > 1) {
      const insertPoint = Math.min(1, sentences.length - 1);
      sentences.splice(insertPoint + 1, 0, insight);
      return sentences.join('. ');
    }
    
    return `${content}\n\n${insight}`;
  }

  private addPersonalityExamples(content: string, userMessage: string): string | null {
    const mbtiType = this.blueprint.cognitiveTemperamental?.mbtiType;
    
    if (!mbtiType) return null;

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

    if (mbtiType.includes('P')) {
      content = content.replace(/must do|should do/gi, 'might consider');
      content = content.replace(/the answer is/gi, 'one possibility is');
    }

    if (mbtiType.includes('J')) {
      content = this.addStructureElements(content);
    }

    return content;
  }

  // Helper methods
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
    if (content.includes('\n\n')) {
      return content;
    }
    
    const sentences = content.split('. ');
    if (sentences.length > 2) {
      return sentences.join('.\n\n');
    }
    
    return content;
  }

  // Comprehensive keyword methods
  private getLifePathKeyword(path: number): string {
    const keywords = {
      1: 'Leader', 2: 'Collaborator', 3: 'Expresser', 4: 'Builder', 5: 'Explorer',
      6: 'Nurturer', 7: 'Seeker', 8: 'Achiever', 9: 'Humanitarian'
    };
    return keywords[path as keyof typeof keywords] || 'Unique Path';
  }

  private getExpressionKeyword(num: number): string {
    const keywords = {
      1: 'Pioneer', 2: 'Diplomat', 3: 'Communicator', 4: 'Organizer', 5: 'Adventurer',
      6: 'Caregiver', 7: 'Analyst', 8: 'Executive', 9: 'Humanitarian'
    };
    return keywords[num as keyof typeof keywords] || 'Unique Expression';
  }

  private getSoulUrgeKeyword(num: number): string {
    const keywords = {
      1: 'Independence', 2: 'Harmony', 3: 'Creativity', 4: 'Stability', 5: 'Freedom',
      6: 'Service', 7: 'Knowledge', 8: 'Achievement', 9: 'Compassion'
    };
    return keywords[num as keyof typeof keywords] || 'Unique Desire';
  }

  private getPersonalityKeyword(num: number): string {
    const keywords = {
      1: 'Strong-willed', 2: 'Gentle', 3: 'Charming', 4: 'Practical', 5: 'Dynamic',
      6: 'Responsible', 7: 'Mysterious', 8: 'Powerful', 9: 'Generous'
    };
    return keywords[num as keyof typeof keywords] || 'Unique Personality';
  }

  private getBirthdayKeyword(num: number): string {
    const keywords = {
      1: 'Independent', 2: 'Cooperative', 3: 'Creative', 4: 'Methodical', 5: 'Versatile',
      6: 'Nurturing', 7: 'Introspective', 8: 'Ambitious', 9: 'Compassionate'
    };
    return keywords[num as keyof typeof keywords] || 'Unique Gift';
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

  private getSunSignQuality(sign: string): string {
    const qualities = {
      'Cancer': 'nurturing and emotionally intuitive',
      'Leo': 'creative and heart-centered',
      'Virgo': 'practical and service-oriented',
      'Libra': 'harmonious and relationship-focused'
    };
    return qualities[sign as keyof typeof qualities] || 'your unique solar';
  }

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
    
    return `${response}\n\nIn your daily life, ${this.userName}, this ${hdType} energy might show up as feeling most alive when you're doing work that excites you, and feeling drained when you're pushing through things that don't spark joy.`;
  }

  private enhanceLifePathExplanation(response: string): string {
    const lifePath = this.blueprint.coreValuesNarrative?.lifePath;
    if (!lifePath) return response;
    
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
}

export const createBlueprintFilter = (blueprint: LayeredBlueprint) => {
  return new BlueprintPersonalityFilter(blueprint);
};

