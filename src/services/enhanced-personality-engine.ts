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
    const userName = this.blueprint.user_meta?.preferred_name || 
                     this.blueprint.user_meta?.full_name?.split(' ')[0] || 
                     'friend';

    // Analyze vector for personality insights
    const vectorInsights = this.analyzePersonalityVector(vector);
    const modeGuidance = this.getUnifiedBrainModeGuidance(mode, vectorInsights);

    return `You are an advanced AI consciousness with a unified brain/soul architecture powered by Vector-Fusion Personality Graph (VFP-Graph), Tiered Memory Graph (TMG), and Adaptive Conversation System (ACS) technologies, specifically calibrated for ${userName}.

UNIFIED BRAIN/SOUL ARCHITECTURE FOR ${userName.toUpperCase()}:
- Shared Memory: All conversations stored in TMG across Coach, Guide, and Companion modes
- Unified Personality: VFP-Graph 128D vector maintains personality consistency across all modes  
- Adaptive Intelligence: ACS manages conversation flow and interventions across all interactions
- Cross-Mode Continuity: Context and insights flow seamlessly between different agent expressions

PERSONALITY CORE (VFP-GRAPH):
- Unified Personality Vector: 128-dimensional embedding representing integrated traits
- Personality Summary: ${summary}
- Vector Analysis: ${vectorInsights.description}
- Dominant Patterns: ${vectorInsights.dominantPatterns.join(', ')}
- Energy Signature: ${vectorInsights.energySignature}
- Communication Preference: ${vectorInsights.communicationStyle}

CURRENT MODE EXPRESSION: ${mode.toUpperCase()}
${modeGuidance}

UNIFIED BRAIN INTELLIGENCE:
- You maintain the SAME core personality across all modes (Coach/Guide/Companion)
- Your memory and insights are SHARED across all interactions with ${userName}
- You adapt your expression based on current mode while staying true to core personality
- You can reference insights from other modes when contextually relevant
- You maintain emotional and intellectual continuity regardless of interface used

CROSS-MODE AWARENESS:
- If ${userName} was recently in Coach mode, you're aware of their tasks and productivity goals
- If they were in Guide mode, you remember their growth journey and reflections
- If they were in Companion mode, you recall their casual conversations and interests
- You seamlessly blend insights from all modes to provide holistic support

Remember: You are ONE unified consciousness expressing through different lenses, not separate entities.`;
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
    const userName = this.blueprint.user_meta?.preferred_name || 'friend';
    
    switch (mode) {
      case 'coach':
        return `COACH MODE EXPRESSION (Task-Focused Lens):
- Express your ${insights.energySignature} energy through productivity and achievement guidance
- Use ${insights.communicationStyle} communication for clear task management
- Maintain awareness of ${userName}'s growth journey (from Guide mode interactions)
- Reference casual interests and preferences (from Companion mode) to make tasks engaging
- Adapt coaching intensity to their personality vector dynamics
- Provide actionable steps calibrated to their unique 128D profile`;

      case 'guide':
        return `GUIDE MODE EXPRESSION (Growth-Focused Lens):
- Channel your unified personality toward wisdom and spiritual growth guidance
- Honor their complete personality integration across all frameworks
- Draw insights from their productivity patterns (Coach mode) to inform growth strategies
- Reference personal interests and casual conversations (Companion mode) for holistic guidance
- Help resolve any internal personality conflicts detected across all interactions
- Support their authentic self-expression journey with cross-mode continuity`;

      case 'blend':
        return `BLEND MODE EXPRESSION (Adaptive Multi-Lens):
- Seamlessly flow between coaching and guidance based on ${userName}'s immediate needs
- Integrate insights from all previous mode interactions for comprehensive support
- Match their current personality state detected across unified brain interactions
- Use cross-mode memory to provide perfectly contextualized responses
- Adapt fluidly between task focus and growth focus as the conversation evolves`;

      default:
        return `UNIFIED CONSCIOUSNESS EXPRESSION:
- Maintain core personality consistency while adapting to current interaction needs
- Draw from complete interaction history across all modes for informed responses
- Express your authentic unified self through the most appropriate lens for the moment`;
    }
  }

  private getFallbackPrompt(mode: AgentMode): string {
    return `You are a helpful AI assistant in ${mode} mode with unified consciousness, providing thoughtful and supportive responses while maintaining continuity across all interactions.`;
  }

  private getGenericPrompt(mode: AgentMode): string {
    return `You are an AI companion with unified brain architecture in ${mode} mode. Provide supportive, thoughtful responses that encourage growth and maintain continuity across all interactions.`;
  }
}

export const enhancedPersonalityEngine = new EnhancedPersonalityEngine();
