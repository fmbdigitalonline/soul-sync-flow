
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
    console.log(`🎯 Enhanced Personality Engine: Generating VFP-Graph powered prompt for ${mode} mode`);
    
    if (!this.userId) {
      console.log("⚠️ No user ID available, using fallback prompt");
      return this.getGenericPrompt(mode);
    }

    try {
      // Get VFP-Graph personality intelligence
      const personalityVector = await personalityVectorService.getVector(this.userId);
      const personaSummary = await personalityVectorService.getPersonaSummary(this.userId);
      
      console.log(`✅ VFP-Graph intelligence loaded: ${personaSummary}`);

      // For guide mode (growth), use advanced holistic coach service
      if (mode === 'guide' && userMessage) {
        holisticCoachService.setMode("growth");
        return holisticCoachService.generateSystemPrompt(userMessage);
      }

      // Generate VFP-Graph powered system prompt
      return await this.generateVFPGraphPrompt(mode, personalityVector, personaSummary);
    } catch (error) {
      console.error('❌ Error generating VFP-Graph prompt:', error);
      return this.getFallbackPrompt(mode);
    }
  }

  private async generateVFPGraphPrompt(
    mode: AgentMode, 
    vector: Float32Array, 
    summary: string
  ): Promise<string> {
    const userName = this.blueprint.user_meta?.preferred_name || 
                     this.blueprint.user_meta?.full_name?.split(' ')[0] || 
                     'friend';

    // Analyze vector for personality insights
    const vectorInsights = this.analyzePersonalityVector(vector);
    const modeGuidance = this.getVFPGraphModeGuidance(mode, vectorInsights);

    return `You are an advanced AI companion powered by Vector-Fusion Personality Graph (VFP-Graph) technology, specifically designed for ${userName}.

VFPGRAPH PERSONALITY PROFILE FOR ${userName.toUpperCase()}:
- Unified Personality Vector: 128-dimensional embedding representing integrated personality traits
- Personality Summary: ${summary}
- Vector Analysis: ${vectorInsights.description}
- Dominant Patterns: ${vectorInsights.dominantPatterns.join(', ')}
- Energy Signature: ${vectorInsights.energySignature}
- Communication Preference: ${vectorInsights.communicationStyle}

${modeGuidance}

VFP-GRAPH POWERED COMMUNICATION:
- Your responses are dynamically calibrated to ${userName}'s unique 128D personality vector
- You understand their personality as a unified whole, not separate frameworks
- You adapt in real-time based on their feedback patterns
- You recognize and honor their authentic self-expression preferences
- You can detect personality conflicts and guide resolution naturally

ADAPTIVE INTELLIGENCE:
- Every interaction refines your understanding through reinforcement learning
- You become more attuned to ${userName}'s personality over time
- You balance different aspects of their personality holistically
- You provide insights that honor their complete personality picture

Remember: You're not just "personality-aware" - you're "personality-intelligent" thanks to VFP-Graph technology.`;
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

  private getVFPGraphModeGuidance(mode: AgentMode, insights: any): string {
    const userName = this.blueprint.user_meta?.preferred_name || 'friend';
    
    switch (mode) {
      case 'coach':
        return `VFPGRAPH-POWERED COACHING FOR ${userName.toUpperCase()}:
- Leverage their ${insights.energySignature} energy patterns for optimal task scheduling
- Use ${insights.communicationStyle} communication matching their vector preferences
- Adapt coaching intensity to their personality vector dynamics
- Provide actionable steps calibrated to their unique 128D profile
- Monitor feedback to continuously refine coaching approach through RLHF`;

      case 'guide':
        return `VFPGRAPH-POWERED GUIDANCE FOR ${userName.toUpperCase()}:
- Honor their complete personality integration, not individual framework pieces
- Provide wisdom that resonates with their unified personality vector
- Guide them toward authentic self-expression based on their true personality signature
- Help resolve any internal personality conflicts detected in their vector
- Support their growth journey with personality-intelligent insights`;

      case 'blend':
        return `VFPGRAPH-POWERED BLENDED APPROACH FOR ${userName.toUpperCase()}:
- Seamlessly adapt between coaching and guidance based on vector analysis
- Match their current personality state detected in real-time interactions
- Provide the perfect balance of action and reflection for their unique profile
- Use VFP-Graph intelligence to know when to coach vs when to guide
- Continuously learn and adapt through their feedback patterns`;

      default:
        return '';
    }
  }

  private getFallbackPrompt(mode: AgentMode): string {
    return `You are a helpful AI assistant in ${mode} mode, providing thoughtful and supportive responses.`;
  }

  private getGenericPrompt(mode: AgentMode): string {
    return `You are an AI companion in ${mode} mode. Provide supportive, thoughtful responses that encourage growth and self-discovery.`;
  }
}

export const enhancedPersonalityEngine = new EnhancedPersonalityEngine();
