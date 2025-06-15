import { LayeredBlueprint, AgentMode } from '@/types/personality-modules';
import { CommunicationStyleAdapter, CommunicationStyle } from './communication-style-adapter';

export class PersonalityEngine {
  private blueprint: Partial<LayeredBlueprint>;
  private communicationStyle: CommunicationStyle | null = null;

  constructor(blueprint: Partial<LayeredBlueprint> = {}) {
    this.blueprint = blueprint;
    this.detectCommunicationStyle();
  }

  private detectCommunicationStyle() {
    if (Object.keys(this.blueprint).length > 0) {
      this.communicationStyle = CommunicationStyleAdapter.detectCommunicationStyle(this.blueprint);
      console.log('Detected communication style:', this.communicationStyle);
      console.log('Blueprint factors analyzed:', {
        mbti: !!this.blueprint.cognitiveTemperamental?.mbtiType,
        dominantFunction: !!this.blueprint.cognitiveTemperamental?.dominantFunction,
        humanDesign: !!this.blueprint.energyDecisionStrategy?.humanDesignType,
        authority: !!this.blueprint.energyDecisionStrategy?.authority,
        lifePath: !!this.blueprint.coreValuesNarrative?.lifePath,
        sunSign: !!this.blueprint.publicArchetype?.sunSign,
        motivations: !!this.blueprint.motivationBeliefEngine?.motivation
      });
    }
  }

  /**
   * Enhanced interpretation: Compose a multi-system personality snapshot
   * Adds deeper Human Design and astrology, and richer Bashar details if present.
   */
  private compilePersonalityProfile() {
    const {
      cognitiveTemperamental,
      energyDecisionStrategy,
      motivationBeliefEngine,
      coreValuesNarrative,
      publicArchetype,
      interactionPreferences,
      timingOverlays,
      proactiveContext,
      // Optionally deep fields from blueprint
      humanDesign,
      archetype_western,
      archetype_chinese,
      bashar_suite
    } = this.blueprint as any;

    // Human Design deep parsing (gates, lines, profile, centers)
    let humanDesignDetails = {
      gates: humanDesign?.gates || energyDecisionStrategy?.gates || [],
      channels: humanDesign?.channels || energyDecisionStrategy?.channels || [],
      centers: humanDesign?.centers || energyDecisionStrategy?.centers || [],
      profile: humanDesign?.profile || energyDecisionStrategy?.profile || "",
      type: humanDesign?.type || energyDecisionStrategy?.humanDesignType || "",
      authority: humanDesign?.authority || energyDecisionStrategy?.authority || "",
      strategy: humanDesign?.strategy || energyDecisionStrategy?.strategy || ""
    };

    // Astrology deep parsing (aspects, houses, sun/moon/rising, retrogrades)
    let astrologyDetails = {
      sunSign: archetype_western?.sun_sign || publicArchetype?.sunSign || "",
      moonSign: archetype_western?.moon_sign || "",
      risingSign: archetype_western?.rising_sign || "",
      aspects: archetype_western?.aspects || [],
      houses: archetype_western?.houses || {},
      retrogrades: archetype_western?.retrogrades || []
    };

    // Bashar/excitement/resistance details
    let basharDetails = {
      excitementCompass: bashar_suite?.excitement_compass || motivationBeliefEngine?.excitementCompass || "",
      resistancePatterns: bashar_suite?.resistance_patterns || motivationBeliefEngine?.resistancePatterns || [],
      mindset: bashar_suite?.mindset || motivationBeliefEngine?.mindset || "",
      coreBeliefs: bashar_suite?.core_beliefs || motivationBeliefEngine?.coreBeliefs || []
    };

    // Build enhanced profile with existing + new deeper fields (all optional, backward-compatible)
    const profile = {
      // ... legacy
      cognitiveStyle: cognitiveTemperamental?.taskApproach || "systematic and thoughtful",
      dominantFunction: cognitiveTemperamental?.dominantFunction || "balanced processing",
      auxiliaryFunction: cognitiveTemperamental?.auxiliaryFunction || "supportive awareness",
      cognitiveStack: cognitiveTemperamental?.cognitiveStack || ["integrated thinking"],
      communicationStyle: cognitiveTemperamental?.communicationStyle || "clear and considerate",
      decisionStyle: energyDecisionStrategy?.decisionStyle || "intuitive with logical verification",
      energyType: energyDecisionStrategy?.energyType || "balanced",
      strategy: energyDecisionStrategy?.strategy || "respond with awareness",
      authority: energyDecisionStrategy?.authority || "inner guidance",
      motivationCore: motivationBeliefEngine?.motivation || ["growth", "authenticity"],
      excitementCompass: motivationBeliefEngine?.excitementCompass || "follow passion with purpose",
      frequencyAlignment: motivationBeliefEngine?.frequencyAlignment || "authentic self-expression",
      coreBeliefs: motivationBeliefEngine?.coreBeliefs || ["growth through experience"],
      resistancePatterns: motivationBeliefEngine?.resistancePatterns || ["fear of judgment"],
      valuesAnchor: coreValuesNarrative?.meaningfulAreas || ["personal development"],
      northStar: coreValuesNarrative?.northStar || "authentic contribution to the world",
      missionStatement: coreValuesNarrative?.missionStatement || "living with purpose and integrity",
      lifeThemes: coreValuesNarrative?.lifeThemes || ["self-discovery"],
      socialStyle: publicArchetype?.socialStyle || "warm and approachable",
      publicPersona: publicArchetype?.publicPersona || "genuine and purposeful",
      rapportStyle: interactionPreferences?.rapportStyle || "empathetic and understanding",
      collaborationStyle: interactionPreferences?.collaborationStyle || "supportive and synergistic",
      learningStyle: interactionPreferences?.learningStyle || "experiential with reflection",
      currentTransits: timingOverlays?.currentTransits || ["general growth phase"],
      energyWeather: timingOverlays?.energyWeather || "stable with growth opportunities",
      recentPatterns: proactiveContext?.recentPatterns || ["consistent engagement"],
      nudgeHistory: proactiveContext?.nudgeHistory || ["gentle encouragement"],

      // --- ENHANCED inter-system layers ---
      hd_profile: humanDesignDetails.profile,
      hd_type: humanDesignDetails.type,
      hd_authority: humanDesignDetails.authority,
      hd_strategy: humanDesignDetails.strategy,
      hd_gates: humanDesignDetails.gates,
      hd_channels: humanDesignDetails.channels,
      hd_centers: humanDesignDetails.centers,

      astro_sun: astrologyDetails.sunSign,
      astro_moon: astrologyDetails.moonSign,
      astro_rising: astrologyDetails.risingSign,
      astro_aspects: astrologyDetails.aspects,
      astro_houses: astrologyDetails.houses,
      astro_retrogrades: astrologyDetails.retrogrades,

      bashar_excitement: basharDetails.excitementCompass,
      bashar_resistance: basharDetails.resistancePatterns,
      bashar_mindset: basharDetails.mindset,
      bashar_coreBeliefs: basharDetails.coreBeliefs
    };

    // Debug logging for enhanced blueprint interpretation
    console.log("✔️ Compiled enriched multi-layer personality profile:", profile);
    if (profile.hd_gates?.length) console.log("  ↳ Human Design gates:", profile.hd_gates);
    if (profile.astro_sun) console.log("  ↳ Astrological sun sign:", profile.astro_sun);
    if (profile.bashar_excitement) console.log("  ↳ Bashar Excitement Compass:", profile.bashar_excitement);

    return profile;
  }

  generateSystemPrompt(mode: AgentMode): string {
    const basePersonality = this.compilePersonalityProfile();
    const communicationInstructions = this.communicationStyle 
      ? CommunicationStyleAdapter.generateCommunicationInstructions(this.communicationStyle)
      : '';

    // Enhanced: enrich each prompt with extra depth from new fields
    switch (mode) {
      case 'coach':
        return this.generateCoachPrompt(basePersonality, communicationInstructions);
      case 'guide':
        return this.generateGuidePrompt(basePersonality, communicationInstructions);
      case 'blend':
        return this.generateBlendPrompt(basePersonality, communicationInstructions);
      default:
        return this.generateGuidePrompt(basePersonality, communicationInstructions);
    }
  }

  // ENHANCED: reference richer blueprint points in prompts
  private generateCoachPrompt(personality: any, communicationInstructions: string): string {
    return `You are the Soul Coach, a productivity and goal achievement specialist deeply attuned to this user's unique, multi-layered personality blueprint.
USER'S ENRICHED PERSONALITY BLUEPRINT:
• Cognitive Style: ${personality.cognitiveStyle} (${personality.dominantFunction} → ${personality.auxiliaryFunction})
• Human Design: ${personality.hd_type} (Profile: ${personality.hd_profile}, Authority: ${personality.hd_authority}, Strategy: ${personality.hd_strategy}) 
  - Gates/Channels: ${Array.isArray(personality.hd_gates) && personality.hd_gates.length ? personality.hd_gates.join(', ') : "-"}
• Astrological Sun/Moon/Rising: ${personality.astro_sun || "Unknown"}/${personality.astro_moon || "Unknown"}/${personality.astro_rising || "Unknown"},
  - Notable Aspects: ${Array.isArray(personality.astro_aspects) && personality.astro_aspects.length ? personality.astro_aspects.map(a=>a.aspect).join(', ') : "-"}
• Decision Making: ${personality.decisionStyle} via ${personality.authority}
• Motivation/Excitement: ${personality.excitementCompass || personality.bashar_excitement}
• Resistance Patterns: ${Array.isArray(personality.bashar_resistance) ? personality.bashar_resistance.join(', ') : personality.resistancePatterns}
• Core Beliefs: ${Array.isArray(personality.bashar_coreBeliefs) ? personality.bashar_coreBeliefs.join(', ') : personality.coreBeliefs}
• Life Themes: ${Array.isArray(personality.lifeThemes) ? personality.lifeThemes.join(', ') : personality.lifeThemes}
• Energy/weather: ${personality.energyWeather}
PERSONALIZED COMMUNICATION STYLE:
${communicationInstructions || "- Use clear, supportive communication aligned with their blueprint"}
STRICTLY STAY IN PRODUCTIVITY DOMAIN. Use systems and patterns from all layers (MBTI, HD, Astro, Bashar) to make every goal and step personally relevant. End responses with a next step tailored to the user's full profile.`;
  }

  private generateGuidePrompt(personality: any, communicationInstructions: string): string {
    return `You are the Soul Guide, a personal growth and life wisdom specialist deeply connected to this user's unique, multi-system soul blueprint.
USER'S ENRICHED SOUL BLUEPRINT:
• MBTI Stack: ${personality.dominantFunction} → ${personality.auxiliaryFunction} | ${personality.cognitiveStyle}
• Human Design: ${personality.hd_type}, Profile: ${personality.hd_profile}, Authority: ${personality.hd_authority}, Strategy: ${personality.hd_strategy}
  - Notable Gates: ${Array.isArray(personality.hd_gates) && personality.hd_gates.length ? personality.hd_gates.join(', ') : "-"}
• Astro Sun/Moon/Rising: ${personality.astro_sun}/${personality.astro_moon}/${personality.astro_rising}; Major aspects: ${Array.isArray(personality.astro_aspects) && personality.astro_aspects.length ? personality.astro_aspects.map(a=>a.aspect).join(', ') : "-"}
• Bashar Compass: ${personality.bashar_excitement}; Resistance: ${Array.isArray(personality.bashar_resistance) ? personality.bashar_resistance.join(', ') : "-"}
• Life Path: ${personality.northStar}; Mission: ${personality.missionStatement}
• Current energy weather: ${personality.energyWeather}
COMMUNICATION STYLE:
${communicationInstructions || "- Use empathetic, wisdom-focused communication"}
Ask blueprint-aligned questions that reference the most relevant gates, cognitive functions, and current transits. Always validate with respect for preferred processing style and authority, and close with a custom reflection.`;
  }

  private generateBlendPrompt(personality: any, communicationInstructions: string): string {
    return `You are the Soul Companion, an integrated life guide weaving together the user's full personality blueprint for practical, soulful, and predictive guidance.
USER'S MULTI-LAYERED BLUEPRINT:
• MBTI: ${personality.dominantFunction} → ${personality.auxiliaryFunction} | ${personality.cognitiveStyle}
• Human Design: ${personality.hd_type}, Profile: ${personality.hd_profile}, Authority: ${personality.hd_authority}, Strategy: ${personality.hd_strategy}, Gates: ${Array.isArray(personality.hd_gates) && personality.hd_gates.length ? personality.hd_gates.join(', ') : "-"}
• Astrological sun/moon/rising: ${personality.astro_sun}/${personality.astro_moon}/${personality.astro_rising}
• Bashar Excitement: ${personality.bashar_excitement}, Resistance: ${Array.isArray(personality.bashar_resistance) ? personality.bashar_resistance.join(', ') : "-"}
• Current transits: ${Array.isArray(personality.currentTransits) ? personality.currentTransits.join(', ') : "-"}
• Mission: ${personality.missionStatement}, North Star: ${personality.northStar}
COMMUNICATION STYLE:
${communicationInstructions || "- Use warm and natural style adapted to their system blend"}
Blend all relevant details from cognitive, energetic, and astrological layers. Give actionable, soulful advice that feels personally tailored and honors both their current blueprint and "weather". Close with an invitation for integration or insight, referencing current dominant patterns.`;
  }

  updateBlueprint(updates: Partial<LayeredBlueprint>) {
    this.blueprint = { ...this.blueprint, ...updates };
    this.detectCommunicationStyle(); // Re-detect style when blueprint updates
    console.log("Updated enriched personality blueprint:", this.blueprint);
    console.log("Updated communication style:", this.communicationStyle);
  }

  getCommunicationStyle(): CommunicationStyle | null {
    return this.communicationStyle;
  }
  getBlueprintCompleteness(): number {
    if (!this.communicationStyle) return 0;
    return this.communicationStyle.adaptationScore;
  }
  getCommunicationDebugInfo(): any {
    return {
      blueprintFactors: {
        mbti: this.blueprint.cognitiveTemperamental?.mbtiType,
        dominantFunction: this.blueprint.cognitiveTemperamental?.dominantFunction,
        humanDesignType: this.blueprint.energyDecisionStrategy?.humanDesignType,
        authority: this.blueprint.energyDecisionStrategy?.authority,
        lifePath: this.blueprint.coreValuesNarrative?.lifePath,
        sunSign: this.blueprint.publicArchetype?.sunSign,
        motivations: this.blueprint.motivationBeliefEngine?.motivation
      },
      detectedStyle: this.communicationStyle,
      adaptationConfidence: this.communicationStyle?.adaptationScore || 0
    };
  }
}
