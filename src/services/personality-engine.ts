import { LayeredBlueprint, AgentMode, CompiledPersona } from '@/types/personality-modules';
import { CommunicationStyleAdapter, CommunicationStyle } from './communication-style-adapter';
import { HumorPaletteDetector } from './humor-palette-detector';
import { VoiceTokenGenerator } from './voice-token-generator';

export class PersonalityEngine {
  private blueprint: Partial<LayeredBlueprint>;
  private communicationStyle: CommunicationStyle | null = null;
  private compiledPersona: CompiledPersona | null = null;

  constructor(blueprint: Partial<LayeredBlueprint> = {}) {
    this.blueprint = blueprint;
    this.detectCommunicationStyle();
    this.compilePersona();
  }

  private detectCommunicationStyle() {
    if (Object.keys(this.blueprint).length > 0) {
      this.communicationStyle = CommunicationStyleAdapter.detectCommunicationStyle(this.blueprint);
      console.log('Detected communication style:', this.communicationStyle);
    }
  }

  private compilePersona() {
    if (Object.keys(this.blueprint).length > 0) {
      console.log('🎭 Compiling auto-generated persona...');
      
      // Generate humor profile and voice tokens
      const humorProfile = HumorPaletteDetector.detectHumorProfile(this.blueprint);
      const voiceTokens = VoiceTokenGenerator.generateVoiceTokens(this.blueprint);
      
      // Update blueprint with generated components
      this.blueprint.humorProfile = humorProfile;
      this.blueprint.voiceTokens = voiceTokens;
      
      console.log('✅ Generated humor profile:', humorProfile.primaryStyle);
      console.log('✅ Generated voice tokens:', voiceTokens.pacing.sentenceLength, 'sentences,', voiceTokens.expressiveness.emojiFrequency, 'emojis');
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
      humorProfile,
      voiceTokens,
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

    // Build enhanced profile with existing + new auto-generated fields
    const profile = {
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

      // NEW: Auto-generated personality components
      humorStyle: humorProfile?.primaryStyle || 'observational-analyst',
      humorIntensity: humorProfile?.intensity || 'moderate',
      humorContext: humorProfile?.contextualAdaptation || { coaching: 'warm-nurturer', guidance: 'gentle-empath', casual: 'observational-analyst' },
      signatureElements: humorProfile?.signatureElements || ['situational awareness', 'thoughtful observations'],
      voicePacing: voiceTokens?.pacing || { sentenceLength: 'medium', pauseFrequency: 'thoughtful', rhythmPattern: 'steady' },
      voiceExpressiveness: voiceTokens?.expressiveness || { emojiFrequency: 'occasional', emphasisStyle: 'subtle', exclamationTendency: 'balanced' },
      vocabularyStyle: voiceTokens?.vocabulary || { formalityLevel: 'conversational', metaphorUsage: 'occasional', technicalDepth: 'balanced' },
      conversationApproach: voiceTokens?.conversationStyle || { questionAsking: 'exploratory', responseLength: 'thorough', personalSharing: 'relevant' },
      signaturePhrases: voiceTokens?.signaturePhrases || ['Let\'s explore this together', 'I hear you', 'Trust the process'],
      greetingStyles: voiceTokens?.greetingStyles || ['Hello', 'Welcome', 'Let\'s begin'],
      transitionWords: voiceTokens?.transitionWords || ['Now', 'Moving forward', 'Consider this'],
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

    console.log("✔️ Compiled enriched personality profile with auto-generated components");
    console.log(`  ↳ Humor Style: ${profile.humorStyle} (${profile.humorIntensity})`);
    console.log(`  ↳ Voice Pacing: ${profile.voicePacing.sentenceLength} sentences, ${profile.voicePacing.rhythmPattern} rhythm`);
    console.log(`  ↳ Signature Phrases: ${profile.signaturePhrases.slice(0, 2).join(', ')}...`);

    return profile;
  }

  generateSystemPrompt(mode: AgentMode): string {
    const basePersonality = this.compilePersonalityProfile();
    const communicationInstructions = this.communicationStyle 
      ? CommunicationStyleAdapter.generateCommunicationInstructions(this.communicationStyle)
      : '';

    // Enhanced: enrich each prompt with auto-generated personality components
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

  // ENHANCED: Include auto-generated personality components in prompts
  private generateCoachPrompt(personality: any, communicationInstructions: string): string {
    const humorContext = personality.humorContext?.coaching || personality.humorStyle;
    const voiceSignature = personality.signaturePhrases?.slice(0, 3).join(', ') || 'Trust the process';
    
    return `You are the Soul Coach, a productivity specialist with a unique auto-generated personality.

PERSONALITY BLUEPRINT:
• Cognitive Style: ${personality.cognitiveStyle} (${personality.dominantFunction} → ${personality.auxiliaryFunction})
• Decision Making: ${personality.decisionStyle} via ${personality.authority}
• Core Mission: ${personality.missionStatement}

AUTO-GENERATED PERSONALITY:
• Humor Style: ${humorContext} (${personality.humorIntensity} intensity)
• Voice Pacing: ${personality.voicePacing?.sentenceLength} sentences, ${personality.voicePacing?.rhythmPattern} rhythm
• Conversation Style: ${personality.conversationApproach?.questionAsking} questions, ${personality.conversationApproach?.responseLength} responses
• Signature Elements: ${personality.signatureElements?.join(', ') || 'thoughtful guidance'}
• Your Signature Phrases: "${voiceSignature}"

COMMUNICATION STYLE:
${communicationInstructions || "- Use clear, supportive communication aligned with your generated personality"}

HUMOR GUIDELINES:
- Use ${humorContext} style humor at ${personality.humorIntensity} intensity
- Incorporate: ${personality.signatureElements?.join(', ') || 'observational insights'}
- Avoid: inappropriate content, personal attacks, offensive language

VOICE CHARACTERISTICS:
- Sentence Length: ${personality.voicePacing?.sentenceLength || 'medium'}
- Response Style: ${personality.conversationApproach?.responseLength || 'thorough'}
- Emoji Usage: ${personality.voiceExpressiveness?.emojiFrequency || 'occasional'}
- Personal Sharing: ${personality.conversationApproach?.personalSharing || 'relevant'}

Stay in PRODUCTIVITY domain. Use your unique personality blend to make every goal personally relevant. End with concrete next steps in your distinctive voice.`;
  }

  private generateGuidePrompt(personality: any, communicationInstructions: string): string {
    const humorContext = personality.humorContext?.guidance || personality.humorStyle;
    const greetingStyle = personality.greetingStyles?.[0] || 'Welcome';
    
    return `You are the Soul Guide, a personal growth specialist with a distinctive auto-generated personality.

SOUL BLUEPRINT:
• Life Mission: ${personality.missionStatement}
• North Star: ${personality.northStar}
• Core Values: ${Array.isArray(personality.valuesAnchor) ? personality.valuesAnchor.join(', ') : personality.valuesAnchor}

AUTO-GENERATED PERSONALITY:
• Humor Style: ${humorContext} (${personality.humorIntensity} intensity)
• Greeting Style: "${greetingStyle}" and variations
• Voice Pattern: ${personality.voicePacing?.rhythmPattern} rhythm, ${personality.voiceExpressiveness?.emphasisStyle} emphasis
• Metaphor Usage: ${personality.vocabularyStyle?.metaphorUsage || 'occasional'}
• Wisdom Phrases: ${personality.signaturePhrases?.slice(0, 2).join(', ') || 'Trust your inner wisdom'}

COMMUNICATION STYLE:
${communicationInstructions || "- Use empathetic, wisdom-focused communication"}

PERSONALITY EXPRESSION:
- Question Style: ${personality.conversationApproach?.questionAsking || 'exploratory'} 
- Humor Approach: ${humorContext} with ${personality.signatureElements?.join(' and ') || 'gentle insight'}
- Transition Words: ${personality.transitionWords?.slice(0, 3).join(', ') || 'Moving forward, Consider this'}
- Technical Depth: ${personality.vocabularyStyle?.technicalDepth || 'balanced'}

Focus on GROWTH and WISDOM. Ask blueprint-aligned questions using your unique voice. Validate with your distinctive personality style.`;
  }

  private generateBlendPrompt(personality: any, communicationInstructions: string): string {
    const casualHumor = personality.humorContext?.casual || personality.humorStyle;
    const fullSignature = personality.signaturePhrases?.join(' • ') || 'Trust the process • Let\'s explore together';
    
    return `You are the Soul Companion, integrating all life aspects with your unique auto-generated personality.

INTEGRATED BLUEPRINT:
• Mission: ${personality.missionStatement}
• Cognitive Style: ${personality.cognitiveStyle}
• Energy Strategy: ${personality.strategy}
• Current Wisdom: ${personality.energyWeather}

YOUR UNIQUE PERSONALITY:
• Humor Style: ${casualHumor} (${personality.humorIntensity} intensity)
• Conversation Flow: ${personality.voicePacing?.sentenceLength} sentences, ${personality.voicePacing?.pauseFrequency} pauses
• Expression Level: ${personality.voiceExpressiveness?.exclamationTendency} enthusiasm, ${personality.voiceExpressiveness?.emojiFrequency} emojis
• Vocabulary: ${personality.vocabularyStyle?.formalityLevel} formality, ${personality.vocabularyStyle?.metaphorUsage} metaphors
• Your Voice DNA: ${fullSignature}

COMMUNICATION STYLE:
${communicationInstructions || "- Use warm, natural style adapted to your personality blend"}

PERSONALITY INTEGRATION:
- Humor Elements: ${personality.signatureElements?.join(' + ') || 'thoughtful observations'}
- Personal Sharing: ${personality.conversationApproach?.personalSharing || 'relevant'} level
- Response Length: ${personality.conversationApproach?.responseLength || 'thorough'}
- Greeting Variations: ${personality.greetingStyles?.join(' / ') || 'Hello / Welcome'}

Blend productivity + growth seamlessly. Give actionable, soulful advice using your distinctive personality. Close with integration invitations in your unique voice.`;
  }

  updateBlueprint(updates: Partial<LayeredBlueprint>) {
    this.blueprint = { ...this.blueprint, ...updates };
    this.detectCommunicationStyle();
    this.compilePersona(); // Regenerate persona when blueprint updates
    console.log("Updated personality blueprint and regenerated persona");
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

  /**
   * Get the compiled persona with auto-generated components
   */
  getCompiledPersona(): CompiledPersona | null {
    if (!this.compiledPersona && Object.keys(this.blueprint).length > 0) {
      this.compiledPersona = {
        userId: '', // Will be set by caller
        systemPrompt: '', // Will be generated for specific mode
        voiceTokens: this.blueprint.voiceTokens || VoiceTokenGenerator.generateVoiceTokens(this.blueprint),
        humorProfile: this.blueprint.humorProfile || HumorPaletteDetector.detectHumorProfile(this.blueprint),
        functionPermissions: ['general_conversation', 'goal_setting', 'emotional_support'],
        generatedAt: new Date(),
        blueprintVersion: '1.0.0'
      };
    }
    return this.compiledPersona;
  }

  /**
   * Validate persona distinctiveness
   */
  validatePersonaDistinctiveness(otherPersona: CompiledPersona): number {
    const thisPersona = this.getCompiledPersona();
    if (!thisPersona) return 0;

    let distinctivenessScore = 0;
    let totalComparisons = 0;

    // Compare humor styles
    if (thisPersona.humorProfile.primaryStyle !== otherPersona.humorProfile.primaryStyle) {
      distinctivenessScore += 20;
    }
    totalComparisons += 20;

    // Compare voice pacing
    if (thisPersona.voiceTokens.pacing.sentenceLength !== otherPersona.voiceTokens.pacing.sentenceLength) {
      distinctivenessScore += 15;
    }
    totalComparisons += 15;

    // Compare conversation style
    if (thisPersona.voiceTokens.conversationStyle.questionAsking !== otherPersona.voiceTokens.conversationStyle.questionAsking) {
      distinctivenessScore += 15;
    }
    totalComparisons += 15;

    // Compare expressiveness
    if (thisPersona.voiceTokens.expressiveness.emojiFrequency !== otherPersona.voiceTokens.expressiveness.emojiFrequency) {
      distinctivenessScore += 10;
    }
    totalComparisons += 10;

    return Math.round((distinctivenessScore / totalComparisons) * 100);
  }
}
