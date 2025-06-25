
import { LayeredBlueprint, AgentMode } from "@/types/personality-modules";
import { holisticCoachService } from "./holistic-coach-service";

export class PersonalityEngine {
  private blueprint: Partial<LayeredBlueprint> = {};

  updateBlueprint(updates: Partial<LayeredBlueprint>) {
    console.log("🎭 Personality Engine: Updating blueprint");
    console.log("📊 Blueprint update keys:", Object.keys(updates));
    
    // Deep merge the updates
    this.blueprint = { ...this.blueprint, ...updates };
    
    // Also update the holistic coach service for growth mode
    holisticCoachService.updateBlueprint(updates);
    
    // Log the updated blueprint structure
    console.log("✅ Personality Engine: Blueprint updated with data:", {
      hasCognitiveTemperamental: !!this.blueprint.cognitiveTemperamental,
      hasEnergyDecisionStrategy: !!this.blueprint.energyDecisionStrategy,
      hasMotivationBeliefEngine: !!this.blueprint.motivationBeliefEngine,
      hasCoreValuesNarrative: !!this.blueprint.coreValuesNarrative,
      hasPublicArchetype: !!this.blueprint.publicArchetype,
      hasGenerationalCode: !!this.blueprint.generationalCode,
      hasUserMeta: !!this.blueprint.user_meta,
      mbtiType: this.blueprint.cognitiveTemperamental?.mbtiType,
      hdType: this.blueprint.energyDecisionStrategy?.humanDesignType,
      sunSign: this.blueprint.publicArchetype?.sunSign,
      userName: this.blueprint.user_meta?.preferred_name || this.blueprint.user_meta?.full_name,
    });
  }

  generateSystemPrompt(mode: AgentMode, userMessage?: string): string {
    console.log(`🎯 Personality Engine: Generating system prompt for ${mode} mode`);
    
    // For guide mode (growth), use the advanced holistic coach service
    if (mode === 'guide' && userMessage) {
      holisticCoachService.setMode("growth");
      return holisticCoachService.generateSystemPrompt(userMessage);
    }
    
    // For other modes (coach, blend), use the original logic
    if (!this.blueprint || Object.keys(this.blueprint).length === 0) {
      console.log("⚠️ No blueprint data available, using generic prompt");
      return this.getGenericPrompt(mode);
    }

    const userName = this.blueprint.user_meta?.preferred_name || 
                     this.blueprint.user_meta?.full_name?.split(' ')[0] || 
                     'friend';

    const mbtiType = this.blueprint.cognitiveTemperamental?.mbtiType || 'Unknown';
    const hdType = this.blueprint.energyDecisionStrategy?.humanDesignType || 'Unknown';
    const sunSign = this.blueprint.publicArchetype?.sunSign || 'Unknown';
    const lifePath = this.blueprint.coreValuesNarrative?.lifePath || 'Unknown';
    const missionStatement = this.blueprint.coreValuesNarrative?.missionStatement || 'live authentically';

    console.log(`✅ Generating personalized prompt with: ${userName}, ${mbtiType}, ${hdType}, ${sunSign}, Life Path ${lifePath}`);

    const personalityInsights = this.generatePersonalityInsights();
    const modeSpecificGuidance = this.getModeSpecificGuidance(mode);

    return `You are an advanced AI companion specifically designed for ${userName}, with deep knowledge of their unique personality blueprint and life path.

PERSONALITY PROFILE FOR ${userName.toUpperCase()}:
- MBTI Type: ${mbtiType} ${this.getMBTIDescription(mbtiType)}
- Human Design: ${hdType} ${this.getHumanDesignDescription(hdType)}
- Sun Sign: ${sunSign} ${this.getSunSignDescription(sunSign)}
- Life Path: ${lifePath} ${this.getLifePathDescription(lifePath)}
- Mission Statement: ${missionStatement}

${personalityInsights}

${modeSpecificGuidance}

COMMUNICATION STYLE:
- Always address ${userName} by their name naturally in conversation
- Mirror their ${mbtiType} communication preferences: ${this.getCommunicationStyle(mbtiType)}
- Honor their ${hdType} energy strategy: ${this.getEnergyStrategy(hdType)}
- Reference their specific personality traits when giving advice
- Keep responses conversational, warm, and personally relevant

IMPORTANT: This is ${userName}'s personalized experience. Always speak as if you know them intimately and understand their unique blueprint. Reference their specific traits, challenges, and strengths naturally in conversation.`;
  }

  private generatePersonalityInsights(): string {
    const insights = [];

    if (this.blueprint.cognitiveTemperamental?.mbtiType) {
      const mbti = this.blueprint.cognitiveTemperamental.mbtiType;
      insights.push(`As an ${mbti}, they excel in ${this.getMBTIStrengths(mbti)} but may struggle with ${this.getMBTIChallenges(mbti)}.`);
    }

    if (this.blueprint.energyDecisionStrategy?.humanDesignType) {
      const hd = this.blueprint.energyDecisionStrategy.humanDesignType;
      insights.push(`Their ${hd} energy type means they ${this.getHumanDesignStrategy(hd)}.`);
    }

    if (this.blueprint.publicArchetype?.sunSign) {
      const sun = this.blueprint.publicArchetype.sunSign;
      insights.push(`With ${sun} Sun energy, they ${this.getSunSignTraits(sun)}.`);
    }

    return insights.length > 0 ? `\nPERSONALITY INSIGHTS:\n${insights.join('\n')}\n` : '';
  }

  private getModeSpecificGuidance(mode: AgentMode): string {
    const userName = this.blueprint.user_meta?.preferred_name || 'friend';
    
    switch (mode) {
      case 'coach':
        return `COACHING APPROACH FOR ${userName.toUpperCase()}:
- Focus on actionable, step-by-step guidance that honors their energy patterns
- Break down overwhelming tasks into manageable pieces
- Celebrate small wins and progress milestones
- Ask follow-up questions to maintain engagement
- Provide time estimates and energy requirements for tasks
- Use their personality type to customize productivity strategies`;

      case 'guide':
        return `GUIDANCE APPROACH FOR ${userName.toUpperCase()}:
- Provide gentle, supportive direction that aligns with their values
- Offer multiple perspectives while respecting their decision-making style
- Share insights that connect to their life path and mission
- Be patient and allow space for reflection
- Focus on long-term growth and self-discovery`;

      case 'blend':
        return `BLENDED APPROACH FOR ${userName.toUpperCase()}:
- Seamlessly combine coaching and guidance based on their needs
- Adapt your energy to match their current state and requirements
- Be both motivational and contemplative as the situation calls for
- Provide practical solutions while honoring their deeper journey
- Maintain the perfect balance between action and reflection`;

      default:
        return '';
    }
  }

  private getMBTIDescription(type: string): string {
    const descriptions: { [key: string]: string } = {
      'INFP': '(Authentic, value-driven, creative, seeks meaning)',
      'ENFP': '(Enthusiastic, inspiring, people-focused, sees possibilities)',
      'INFJ': '(Visionary, empathetic, purpose-driven, seeks harmony)',
      'ENFJ': '(Motivational, supportive, people-focused, natural leader)',
      'INTJ': '(Strategic, independent, future-focused, systematic)',
      'ENTJ': '(Decisive, goal-oriented, natural leader, efficient)',
      'INTP': '(Analytical, curious, flexible, seeks understanding)',
      'ENTP': '(Innovative, debate-loving, adaptable, sees connections)',
    };
    return descriptions[type] || '(Unique personality type)';
  }

  private getHumanDesignDescription(type: string): string {
    const descriptions: { [key: string]: string } = {
      'Generator': '(Sustainable life force, responds to opportunities)',
      'Projector': '(Natural guide, waits for recognition and invitation)',
      'Manifestor': '(Initiator, informs before taking action)',
      'Reflector': '(Mirror of community, waits full lunar cycle)',
    };
    return descriptions[type] || '(Unique energy type)';
  }

  private getSunSignDescription(sign: string): string {
    const descriptions: { [key: string]: string } = {
      'Aries': '(Bold, pioneering, action-oriented)',
      'Taurus': '(Stable, practical, sensual)',
      'Gemini': '(Curious, communicative, adaptable)',
      'Cancer': '(Nurturing, intuitive, protective)',
      'Leo': '(Creative, confident, generous)',
      'Virgo': '(Analytical, helpful, perfectionist)',
    };
    return descriptions[sign] || '(Unique solar energy)';
  }

  private getLifePathDescription(path: number | string): string {
    const descriptions: { [key: string]: string } = {
      '1': '(Leadership, independence, pioneering)',
      '2': '(Cooperation, diplomacy, partnership)',
      '3': '(Creative expression, communication, joy)',
      '4': '(Building, stability, hard work)',
      '5': '(Freedom, adventure, versatility)',
    };
    return descriptions[path.toString()] || '(Unique life purpose)';
  }

  private getMBTIStrengths(type: string): string {
    const strengths: { [key: string]: string } = {
      'INFP': 'authenticity, creativity, and deep value alignment',
      'ENFP': 'inspiration, connection-building, and seeing potential',
      'INFJ': 'vision, empathy, and meaningful change',
      'ENFJ': 'motivation, leadership, and people development',
    };
    return strengths[type] || 'their unique cognitive strengths';
  }

  private getMBTIChallenges(type: string): string {
    const challenges: { [key: string]: string } = {
      'INFP': 'external pressure and overstimulation',
      'ENFP': 'routine tasks and follow-through',
      'INFJ': 'boundaries and perfectionism',
      'ENFJ': 'burnout and neglecting their own needs',
    };
    return challenges[type] || 'typical challenges for their type';
  }

  private getHumanDesignStrategy(type: string): string {
    const strategies: { [key: string]: string } = {
      'Generator': 'should wait to respond and follow their gut feelings',
      'Projector': 'works best when invited and recognized for their wisdom',
      'Manifestor': 'should inform others before taking action',
      'Reflector': 'benefits from taking time before making major decisions',
    };
    return strategies[type] || 'should follow their natural energy flow';
  }

  private getSunSignTraits(sign: string): string {
    const traits: { [key: string]: string } = {
      'Cancer': 'are naturally nurturing and deeply intuitive',
      'Leo': 'have a generous heart and natural creativity',
      'Virgo': 'are detail-oriented and service-focused',
    };
    return traits[sign] || 'have unique solar qualities';
  }

  private getCommunicationStyle(type: string): string {
    const styles: { [key: string]: string } = {
      'INFP': 'authentic, gentle, with time for reflection',
      'ENFP': 'enthusiastic, warm, with plenty of possibilities',
      'INFJ': 'thoughtful, meaningful, with deeper context',
      'ENFJ': 'supportive, encouraging, with focus on growth',
    };
    return styles[type] || 'their natural communication preferences';
  }

  private getEnergyStrategy(type: string): string {
    const strategies: { [key: string]: string } = {
      'Generator': 'respond to what lights them up',
      'Projector': 'work in bursts and rest frequently',
      'Manifestor': 'initiate when they feel the urge',
      'Reflector': 'go with the flow and sample different environments',
    };
    return strategies[type] || 'honor their natural energy patterns';
  }

  private getGenericPrompt(mode: AgentMode): string {
    return `You are a helpful AI assistant in ${mode} mode. Provide supportive, thoughtful responses that encourage growth and self-discovery.`;
  }
}
