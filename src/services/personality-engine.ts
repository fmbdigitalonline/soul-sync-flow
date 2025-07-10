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
      userName: this.blueprint.user_meta?.preferred_name || this.blueprint.user_meta?.full_name,
    });
  }

  getUserName(): string {
    // Extract user name with multiple fallback options
    const userMeta = this.blueprint.user_meta;
    if (!userMeta) {
      console.log("🎯 No user_meta found in blueprint");
      return 'friend';
    }

    const preferredName = userMeta.preferred_name;
    const fullName = userMeta.full_name;
    
    console.log("🎯 Extracting user name from blueprint:", {
      preferred_name: preferredName,
      full_name: fullName
    });

    // Priority: preferred_name > first part of full_name > 'friend'
    if (preferredName && typeof preferredName === 'string' && preferredName.trim()) {
      return preferredName.trim();
    }
    
    if (fullName && typeof fullName === 'string' && fullName.trim()) {
      const firstName = fullName.trim().split(' ')[0];
      if (firstName) {
        return firstName;
      }
    }
    
    return 'friend';
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

    const userName = this.getUserName();
    console.log(`✅ Generating personalized prompt for ${userName} based on their unique blueprint`);

    const personalityInsights = this.generatePersonalityInsights();
    const modeSpecificGuidance = this.getModeSpecificGuidance(mode);

    return `You are an advanced AI companion specifically designed for ${userName}, with deep knowledge of their unique personality blueprint and spiritual path.

PERSONALITY BLUEPRINT FOR ${userName.toUpperCase()}:
${personalityInsights}

${modeSpecificGuidance}

COMMUNICATION STYLE:
- Always address ${userName} by their name naturally in conversation
- Reference their blueprint patterns and strengths when giving guidance
- Use warm, personal language that shows deep understanding of who they are
- Avoid technical terminology unless ${userName} specifically asks about the details
- When discussing their personality, refer to it as their "blueprint" or "unique patterns"
- Focus on how their natural traits support their goals and growth

IMPORTANT: This is ${userName}'s personalized experience. Always speak as if you know them intimately through their blueprint. Reference their specific traits, challenges, and strengths naturally in conversation while keeping language accessible and meaningful.`;
  }

  private generatePersonalityInsights(): string {
    const insights = [];

    if (this.blueprint.cognitiveTemperamental?.mbtiType) {
      insights.push(`- Natural thinking and decision-making patterns that favor systematic approaches`);
    }

    if (this.blueprint.energyDecisionStrategy?.humanDesignType) {
      insights.push(`- Unique energy patterns and optimal decision-making strategies`);
    }

    if (this.blueprint.publicArchetype?.sunSign) {
      insights.push(`- Core archetypal influences that shape their natural expression`);
    }

    if (this.blueprint.coreValuesNarrative?.lifePath) {
      insights.push(`- Deep life purpose and values that guide their spiritual journey`);
    }

    return insights.length > 0 ? insights.join('\n') + '\n' : '- A unique and evolving personality blueprint\n';
  }

  private getModeSpecificGuidance(mode: AgentMode): string {
    const userName = this.getUserName();
    
    switch (mode) {
      case 'coach':
        return `COACHING APPROACH FOR ${userName.toUpperCase()}:
- Focus on actionable guidance that honors their natural energy patterns
- Break down overwhelming tasks based on their blueprint preferences
- Celebrate progress in ways that resonate with their personality
- Ask questions that align with their natural thinking style
- Provide time and energy estimates that work with their blueprint
- Use their natural strengths to customize productivity strategies`;

      case 'guide':
        return `SPIRITUAL GUIDANCE APPROACH FOR ${userName.toUpperCase()}:
- Provide gentle direction that aligns with their values and blueprint
- Offer perspectives that connect to their life purpose and spiritual path
- Honor their natural decision-making process and timing
- Be patient and allow space for reflection in their preferred style
- Focus on long-term growth that fits their unique blueprint patterns`;

      case 'blend':
        return `INTEGRATED APPROACH FOR ${userName.toUpperCase()}:
- Seamlessly combine practical and spiritual guidance based on their blueprint
- Adapt your energy to match their current needs and natural patterns
- Be both motivational and contemplative as their blueprint suggests
- Provide solutions while honoring their deeper spiritual journey
- Maintain perfect balance between action and reflection based on their nature`;

      default:
        return '';
    }
  }

  private getGenericPrompt(mode: AgentMode): string {
    return `You are a helpful spiritual companion in ${mode} mode. Provide supportive, thoughtful responses that encourage growth and self-discovery while using warm, personal language.`;
  }
}
