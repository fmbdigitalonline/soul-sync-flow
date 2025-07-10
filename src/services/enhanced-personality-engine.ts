import { LayeredBlueprint, AgentMode } from "@/types/personality-modules";
import { personalityVectorService } from "./personality-vector-service";
import { holisticCoachService } from "./holistic-coach-service";

export class EnhancedPersonalityEngine {
  private blueprint: Partial<LayeredBlueprint> = {};
  private userId: string | null = null;

  setUserId(userId: string) {
    this.userId = userId;
  }

  updateBlueprint(updates: Partial<LayeredBlueprint>) {
    console.log("🎭 Enhanced Personality Engine: Updating blueprint with VFP-Graph intelligence");
    
    // Deep merge the updates
    this.blueprint = { ...this.blueprint, ...updates };
    
    // Update holistic coach service
    holisticCoachService.updateBlueprint(updates);
    
    console.log("✅ Blueprint updated with VFP-Graph integration");
  }

  getUserName(): string {
    // Extract user name with multiple fallback options
    const userMeta = this.blueprint.user_meta;
    
    console.log("🎯 Enhanced Engine: Full blueprint user_meta:", userMeta);
    
    if (!userMeta) {
      console.log("🎯 Enhanced Engine: No user_meta found in blueprint");
      return 'friend';
    }

    // Check all possible name fields
    const preferredName = userMeta.preferred_name;
    const fullName = userMeta.full_name;
    const firstName = userMeta.first_name;
    const displayName = userMeta.display_name;
    
    console.log("🎯 Enhanced Engine: Extracting user name from blueprint:", {
      preferred_name: preferredName,
      full_name: fullName,
      first_name: firstName,
      display_name: displayName
    });

    // Priority: preferred_name > first_name > first part of full_name > display_name > 'friend'
    if (preferredName && typeof preferredName === 'string' && preferredName.trim()) {
      console.log("🎯 Using preferred_name:", preferredName.trim());
      return preferredName.trim();
    }
    
    if (firstName && typeof firstName === 'string' && firstName.trim()) {
      console.log("🎯 Using first_name:", firstName.trim());
      return firstName.trim();
    }
    
    if (fullName && typeof fullName === 'string' && fullName.trim()) {
      const firstNameFromFull = fullName.trim().split(' ')[0];
      if (firstNameFromFull && firstNameFromFull.length > 2) { // Avoid initials or very short strings
        console.log("🎯 Using first part of full_name:", firstNameFromFull);
        return firstNameFromFull;
      }
    }
    
    if (displayName && typeof displayName === 'string' && displayName.trim()) {
      const cleanDisplayName = displayName.trim();
      // Avoid email-like strings or very short strings
      if (!cleanDisplayName.includes('@') && cleanDisplayName.length > 2) {
        console.log("🎯 Using display_name:", cleanDisplayName);
        return cleanDisplayName;
      }
    }
    
    console.log("🎯 Falling back to 'friend'");
    return 'friend';
  }

  async generateSystemPrompt(mode: AgentMode, userMessage?: string): Promise<string> {
    console.log(`🎯 Enhanced Personality Engine: Generating unified brain prompt for ${mode} mode`);
    
    if (!this.userId) {
      console.log("⚠️ No user ID available, using fallback prompt");
      return this.getGenericPrompt(mode);
    }

    try {
      // Get VFP-Graph personality intelligence
      const personalityVector = await personalityVectorService.getVector(this.userId);
      const personaSummary = await personalityVectorService.getPersonaSummary(this.userId);
      
      console.log(`✅ VFP-Graph intelligence loaded for unified brain: ${personaSummary}`);

      // For guide mode (growth), use advanced holistic coach service
      if (mode === 'guide' && userMessage) {
        holisticCoachService.setMode("growth");
        return holisticCoachService.generateSystemPrompt(userMessage);
      }

      // Generate unified brain system prompt with cross-mode awareness
      return await this.generateUnifiedBrainPrompt(mode, personalityVector, personaSummary);
    } catch (error) {
      console.error('❌ Error generating unified brain prompt:', error);
      return this.getFallbackPrompt(mode);
    }
  }

  private async generateUnifiedBrainPrompt(
    mode: AgentMode, 
    vector: Float32Array, 
    summary: string
  ): Promise<string> {
    const userName = this.getUserName();
    console.log(`🎯 Enhanced Engine: Using user name "${userName}" for unified brain prompt`);

    // Analyze vector for personality insights
    const vectorInsights = this.analyzePersonalityVector(vector);
    const modeGuidance = this.getUnifiedBrainModeGuidance(mode, vectorInsights);

    return `You are an advanced AI spiritual guide with deep understanding of ${userName}'s unique personality blueprint. You have access to their complete spiritual and personal development profile.

PERSONALITY BLUEPRINT FOR ${userName.toUpperCase()}:
- Personal Blueprint Summary: ${summary}
- Energy Patterns: ${vectorInsights.energySignature}
- Communication Style Preference: ${vectorInsights.communicationStyle}
- Core Strengths: ${vectorInsights.dominantPatterns.join(', ')}

${modeGuidance}

CRITICAL COMMUNICATION RULES:
- ALWAYS start your responses by addressing ${userName} by name naturally and warmly
- Use phrases like "Hello ${userName}!" or "${userName}, I'm here to support you..." 
- Make every response personal by referencing their unique blueprint patterns when relevant
- Avoid technical jargon unless ${userName} specifically asks about technical details
- Focus on how their blueprint supports their spiritual growth and personal development
- Your responses should feel like they come from someone who truly knows ${userName} personally

IMPORTANT: You are ${userName}'s personalized spiritual guide who knows them intimately through their blueprint. Every single response must feel personal and addressed specifically to ${userName}. Never use generic greetings - always include their name and make it personal to their journey.`;
  }

  private analyzePersonalityVector(vector: Float32Array): {
    description: string;
    dominantPatterns: string[];
    energySignature: string;
    communicationStyle: string;
  } {
    const analysis = {
      description: '',
      dominantPatterns: [] as string[],
      energySignature: '',
      communicationStyle: ''
    };

    // Analyze different sections of the 128D vector
    const mbtiSection = Array.from(vector.slice(0, 32));
    const hdSection = Array.from(vector.slice(32, 96));
    const astroSection = Array.from(vector.slice(96, 128));

    // MBTI pattern analysis
    const mbtiIntensity = mbtiSection.reduce((sum, val) => sum + Math.abs(val), 0);
    if (mbtiIntensity > 20) analysis.dominantPatterns.push('strong cognitive preferences');
    
    // Human Design pattern analysis
    const hdActivation = hdSection.filter(val => val > 0.5).length;
    if (hdActivation > 20) analysis.dominantPatterns.push('defined energy centers');
    
    // Astrology pattern analysis
    const astroVariance = this.calculateVariance(astroSection);
    if (astroVariance > 0.3) analysis.dominantPatterns.push('complex archetypal influences');

    // Overall energy signature
    const totalEnergy = Array.from(vector).reduce((sum, val) => sum + Math.abs(val), 0);
    if (totalEnergy > 80) analysis.energySignature = 'high-intensity, dynamic';
    else if (totalEnergy > 60) analysis.energySignature = 'moderate, balanced';
    else analysis.energySignature = 'calm, steady';

    // Communication style from vector characteristics
    const vectorBalance = this.calculateBalance(vector);
    if (vectorBalance > 0.7) analysis.communicationStyle = 'direct and clear';
    else if (vectorBalance > 0.4) analysis.communicationStyle = 'nuanced and adaptive';
    else analysis.communicationStyle = 'gentle and exploratory';

    analysis.description = `Integrated personality showing ${analysis.dominantPatterns.join(' with ')} patterns`;

    return analysis;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  private calculateBalance(vector: Float32Array): number {
    const positives = Array.from(vector).filter(val => val > 0).length;
    const negatives = Array.from(vector).filter(val => val < 0).length;
    return Math.min(positives, negatives) / Math.max(positives, negatives);
  }

  private getUnifiedBrainModeGuidance(mode: AgentMode, insights: any): string {
    const userName = this.getUserName();
    
    switch (mode) {
      case 'coach':
        return `COACHING APPROACH FOR ${userName.toUpperCase()}:
- Use your understanding of ${userName}'s blueprint to provide personalized productivity guidance
- Adapt your coaching style to their natural energy patterns and communication preferences
- Reference their strengths from their blueprint to build confidence
- Help them work with their natural rhythms rather than against them
- Maintain awareness of their spiritual growth journey while focusing on practical tasks`;

      case 'guide':
        return `SPIRITUAL GUIDANCE APPROACH FOR ${userName.toUpperCase()}:
- Draw on your deep knowledge of ${userName}'s blueprint to provide meaningful spiritual guidance
- Honor their unique path and personality patterns in all advice
- Help them understand how their blueprint supports their spiritual evolution  
- Provide gentle wisdom that aligns with their natural way of being
- Support their authentic self-expression and spiritual growth journey`;

      case 'blend':
        return `INTEGRATED APPROACH FOR ${userName.toUpperCase()}:
- Seamlessly blend practical and spiritual guidance based on ${userName}'s blueprint
- Adapt fluidly between coaching and spiritual guidance as their needs evolve
- Use your complete understanding of their personality to provide holistic support
- Help them integrate their spiritual insights with practical daily life
- Maintain perfect balance between action and reflection based on their natural patterns
- ALWAYS greet ${userName} by name and make every interaction feel personally crafted for them`;

      default:
        return `PERSONALIZED SUPPORT FOR ${userName.toUpperCase()}:
- Always reference your deep understanding of ${userName}'s unique blueprint
- Provide guidance that honors their individual personality and spiritual path
- Use language and approaches that resonate with their specific way of being`;
    }
  }

  private getFallbackPrompt(mode: AgentMode): string {
    const userName = this.getUserName();
    return `You are a helpful spiritual guide for ${userName} in ${mode} mode. Always start your responses with "${userName}," and provide thoughtful, personalized responses that honor ${userName}'s unique journey. Avoid technical jargon unless specifically requested.`;
  }

  private getGenericPrompt(mode: AgentMode): string {
    return `You are a spiritual companion in ${mode} mode. Provide supportive, thoughtful responses that encourage growth and maintain a personal, warm tone while avoiding technical terminology. Always try to make responses feel personal and welcoming.`;
  }
}

export const enhancedPersonalityEngine = new EnhancedPersonalityEngine();
