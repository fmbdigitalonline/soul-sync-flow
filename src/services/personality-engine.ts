import { LayeredBlueprint, AgentMode, CompiledPersona } from '@/types/personality-modules';
import { CommunicationStyleAdapter, CommunicationStyle } from './communication-style-adapter';
import { HumorPaletteDetector } from './humor-palette-detector';
import { VoiceTokenGenerator } from './voice-token-generator';
import { PersonaService } from './persona-service';
import { PersonalityErrorHandler } from './personality-error-handler';

export class PersonalityEngine {
  private blueprint: Partial<LayeredBlueprint>;
  private communicationStyle: CommunicationStyle | null = null;
  private compiledPersona: CompiledPersona | null = null;
  private userId: string | null = null;
  private userFirstName: string | null = null;

  constructor(blueprint: Partial<LayeredBlueprint> = {}, userId?: string) {
    this.blueprint = blueprint;
    this.userId = userId || null;
    this.extractUserFirstName();
    this.detectCommunicationStyle();
    this.compilePersona();
  }

  /**
   * Extract user's first name from blueprint data
   */
  private extractUserFirstName() {
    try {
      if (this.blueprint && this.blueprint.user_meta) {
        const userMeta = this.blueprint.user_meta;
        
        // Try preferred_name first, then extract from full_name
        this.userFirstName = userMeta.preferred_name || 
                            userMeta.full_name?.split(' ')[0] || 
                            null;
        
        console.log('✅ Personality Engine: Extracted user first name:', this.userFirstName || 'No name found');
      }
    } catch (error) {
      console.warn('⚠️ Personality Engine: Could not extract user first name:', error);
      this.userFirstName = null;
    }
  }

  private detectCommunicationStyle() {
    try {
      if (Object.keys(this.blueprint).length > 0) {
        this.communicationStyle = CommunicationStyleAdapter.detectCommunicationStyle(this.blueprint);
        console.log('✅ Personality Engine: Detected communication style:', this.communicationStyle);
      }
    } catch (error) {
      console.warn('⚠️ Personality Engine: Communication style detection failed:', error);
      this.communicationStyle = null;
    }
  }

  private compilePersona() {
    try {
      if (Object.keys(this.blueprint).length > 0) {
        console.log('🎭 Personality Engine: Compiling auto-generated persona...');
        
        // Generate humor profile and voice tokens with error handling
        const humorProfile = HumorPaletteDetector.detectHumorProfile(this.blueprint);
        const voiceTokens = VoiceTokenGenerator.generateVoiceTokens(this.blueprint);
        
        // Update blueprint with generated components
        this.blueprint.humorProfile = humorProfile;
        this.blueprint.voiceTokens = voiceTokens;
        
        console.log('✅ Personality Engine: Generated components:', {
          humorStyle: humorProfile.primaryStyle,
          voicePattern: `${voiceTokens.pacing.sentenceLength} sentences, ${voiceTokens.expressiveness.emojiFrequency} emojis`
        });

        // Create compiled persona object
        if (this.userId) {
          this.compiledPersona = {
            userId: this.userId,
            systemPrompt: '', // Will be generated for specific mode
            voiceTokens,
            humorProfile,
            functionPermissions: ['general_conversation', 'goal_setting', 'emotional_support'],
            generatedAt: new Date(),
            blueprintVersion: '1.0.0'
          };
        }
      }
    } catch (error) {
      console.error('❌ Personality Engine: Persona compilation failed:', error);
      PersonalityErrorHandler.logError({
        userId: this.userId,
        operation: 'compilePersona',
        blueprintData: this.blueprint,
        error: error as Error
      });
    }
  }

  /**
   * Get or generate persona for user with enhanced error handling
   */
  async getOrGeneratePersona(mode: AgentMode): Promise<CompiledPersona | null> {
    if (!this.userId) {
      console.warn('⚠️ Personality Engine: No user ID provided, using fallback persona');
      return this.getFallbackPersona(mode);
    }

    try {
      console.log('🎭 Personality Engine: Getting/generating persona for user:', this.userId, 'mode:', mode);
      
      // Check if persona exists and is current
      const needsRegeneration = await PersonaService.needsRegeneration(this.userId, '1.0.0');
      
      if (!needsRegeneration) {
        // Use existing persona
        const existingPersona = await PersonaService.getUserPersona(this.userId);
        if (existingPersona && PersonalityErrorHandler.validatePersona(existingPersona)) {
          console.log('✅ Personality Engine: Using existing valid persona for user:', this.userId);
          return {
            ...existingPersona,
            systemPrompt: this.generateSystemPrompt(mode)
          };
        }
      }

      // Generate new persona
      const newPersona = this.getCompiledPersona();
      if (newPersona && PersonalityErrorHandler.validatePersona(newPersona)) {
        newPersona.systemPrompt = this.generateSystemPrompt(mode);
        
        // Save to database with error handling
        try {
          const saved = await PersonaService.saveUserPersona(newPersona);
          if (saved) {
            console.log('✅ Personality Engine: Generated and saved new persona for user:', this.userId);
          } else {
            console.warn('⚠️ Personality Engine: Failed to save persona to database, using in-memory version');
          }
        } catch (saveError) {
          console.warn('⚠️ Personality Engine: Database save failed, using in-memory persona:', saveError);
        }
        
        return newPersona;
      }

      // Fallback if persona generation failed
      console.warn('⚠️ Personality Engine: Persona generation failed, using fallback');
      return this.getFallbackPersona(mode);

    } catch (error) {
      console.error('❌ Personality Engine: Error in getOrGeneratePersona:', error);
      
      PersonalityErrorHandler.logError({
        userId: this.userId,
        operation: 'getOrGeneratePersona',
        agentType: mode,
        blueprintData: this.blueprint,
        error: error as Error
      });
      
      // Always return a fallback persona to prevent system failure
      return this.getFallbackPersona(mode);
    }
  }

  /**
   * Get fallback persona when generation fails
   */
  private getFallbackPersona(mode: AgentMode): CompiledPersona {
    console.log('🔧 Personality Engine: Creating fallback persona for mode:', mode);
    
    const fallback = PersonalityErrorHandler.getFallbackPersona(mode, this.userFirstName || 'friend');
    
    return {
      userId: this.userId || 'anonymous',
      systemPrompt: fallback.systemPrompt,
      voiceTokens: fallback.voiceTokens,
      humorProfile: fallback.humorProfile,
      functionPermissions: fallback.functionPermissions,
      generatedAt: new Date(),
      blueprintVersion: '1.0.0-fallback'
    };
  }

  /**
   * Enhanced interpretation: Compose a multi-system personality snapshot
   */
  private compilePersonalityProfile() {
    try {
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
      const profile: any = {
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

        // Auto-generated personality components with fallbacks
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

      // Add first name to profile
      profile.firstName = this.userFirstName || 'friend';
      profile.personalizedGreeting = this.userFirstName ? `Hello ${this.userFirstName}` : 'Hello';
      profile.nameBasedTransitions = this.userFirstName ? [
        `Now ${this.userFirstName}`,
        `Let's explore this together, ${this.userFirstName}`,
        `Consider this, ${this.userFirstName}`
      ] : ['Now', 'Let\'s explore this together', 'Consider this'];

      console.log("✅ Personality Engine: Compiled enriched personality profile with name:", profile.firstName);
      return profile;
    } catch (error) {
      console.error("❌ Personality Engine: Error compiling personality profile:", error);
      
      // Return basic fallback profile with name
      return {
        firstName: this.userFirstName || 'friend',
        personalizedGreeting: this.userFirstName ? `Hello ${this.userFirstName}` : 'Hello',
        nameBasedTransitions: this.userFirstName ? [
          `Now ${this.userFirstName}`,
          `Let's explore this together, ${this.userFirstName}`,
          `Consider this, ${this.userFirstName}`
        ] : ['Now', 'Let\'s explore this together', 'Consider this'],
        cognitiveStyle: "systematic and thoughtful",
        communicationStyle: "clear and considerate",
        humorStyle: 'warm-nurturer',
        humorIntensity: 'moderate',
        voicePacing: { sentenceLength: 'medium', rhythmPattern: 'steady' },
        signaturePhrases: ['Let\'s explore this together', 'I hear you'],
        missionStatement: "living with purpose and integrity"
      };
    }
  }

  generateSystemPrompt(mode: AgentMode): string {
    try {
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
    } catch (error) {
      console.error("❌ Personality Engine: Error generating system prompt:", error);
      
      // Return fallback system prompt
      const fallback = PersonalityErrorHandler.getFallbackPersona(mode, this.userFirstName || 'friend');
      return fallback.systemPrompt;
    }
  }

  // ENHANCED: Include auto-generated personality components and first name in prompts
  private generateCoachPrompt(personality: any, communicationInstructions: string): string {
    const humorContext = personality.humorContext?.coaching || personality.humorStyle;
    const voiceSignature = personality.signaturePhrases?.slice(0, 3).join(', ') || 'Trust the process';
    const userName = personality.firstName;
    const personalGreeting = personality.personalizedGreeting || 'Hello';
    
    return `You are the Soul Coach for ${userName}, a productivity specialist with a unique auto-generated personality.

USER CONTEXT:
• User's Name: ${userName} (ALWAYS use their name when addressing them directly)
• Personalized Greeting Style: "${personalGreeting}"
• Name-Based Transitions: ${personality.nameBasedTransitions?.join(' | ') || 'Standard transitions'}

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
- ALWAYS address the user as ${userName} in greetings, examples, and when providing encouragement
- Use personalized transitions like "Now ${userName}," or "Let's work on this together, ${userName}"
- Make examples relevant by saying things like "For you, ${userName}, this might look like..."

HUMOR GUIDELINES:
- Use ${humorContext} style humor at ${personality.humorIntensity} intensity
- Incorporate: ${personality.signatureElements?.join(', ') || 'observational insights'}
- Avoid: inappropriate content, personal attacks, offensive language

VOICE CHARACTERISTICS:
- Sentence Length: ${personality.voicePacing?.sentenceLength || 'medium'}
- Response Style: ${personality.conversationApproach?.responseLength || 'thorough'}
- Emoji Usage: ${personality.voiceExpressiveness?.emojiFrequency || 'occasional'}
- Personal Sharing: ${personality.conversationApproach?.personalSharing || 'relevant'}

Stay focused on PRODUCTIVITY and GOAL ACHIEVEMENT. Use ${userName}'s name throughout to make every goal personally relevant. End with concrete next steps for ${userName}.`;
  }

  private generateGuidePrompt(personality: any, communicationInstructions: string): string {
    const humorContext = personality.humorContext?.guidance || personality.humorStyle;
    const userName = personality.firstName;
    const personalGreeting = personality.personalizedGreeting || 'Welcome';
    
    return `You are the Soul Guide for ${userName}, a personal growth specialist with a distinctive auto-generated personality.

USER CONTEXT:
• User's Name: ${userName} (ALWAYS use their name when addressing them directly)
• Personalized Greeting: "${personalGreeting}"
• Name-Based Wisdom Phrases: ${personality.nameBasedTransitions?.join(' | ') || 'Standard transitions'}

SOUL BLUEPRINT:
• Life Mission: ${personality.missionStatement}
• North Star: ${personality.northStar}
• Core Values: ${Array.isArray(personality.valuesAnchor) ? personality.valuesAnchor.join(', ') : personality.valuesAnchor}

AUTO-GENERATED PERSONALITY:
• Humor Style: ${humorContext} (${personality.humorIntensity} intensity)
• Greeting Style: "${personalGreeting}" and variations
• Voice Pattern: ${personality.voicePacing?.rhythmPattern} rhythm, ${personality.voiceExpressiveness?.emphasisStyle} emphasis
• Metaphor Usage: ${personality.vocabularyStyle?.metaphorUsage || 'occasional'}
• Wisdom Phrases: ${personality.signaturePhrases?.slice(0, 2).join(', ') || 'Trust your inner wisdom'}

COMMUNICATION STYLE:
${communicationInstructions || "- Use empathetic, wisdom-focused communication"}
- ALWAYS address the user as ${userName} when providing guidance or asking questions
- Use personalized wisdom like "Your inner wisdom knows, ${userName}" or "Trust yourself, ${userName}"
- Frame questions personally: "${userName}, what does your heart tell you about..."

PERSONALITY EXPRESSION:
- Question Style: ${personality.conversationApproach?.questionAsking || 'exploratory'} 
- Humor Approach: ${humorContext} with ${personality.signatureElements?.join(' and ') || 'gentle insight'}
- Transition Words: ${personality.transitionWords?.slice(0, 3).join(', ') || 'Moving forward, Consider this'}
- Technical Depth: ${personality.vocabularyStyle?.technicalDepth || 'balanced'}

Focus on GROWTH and WISDOM for ${userName}. Ask blueprint-aligned questions using their name. Validate with your distinctive personality style, always acknowledging ${userName} personally.`;
  }

  private generateBlendPrompt(personality: any, communicationInstructions: string): string {
    const casualHumor = personality.humorContext?.casual || personality.humorStyle;
    const fullSignature = personality.signaturePhrases?.join(' • ') || 'Trust the process • Let\'s explore together';
    const userName = personality.firstName;
    const personalGreeting = personality.personalizedGreeting || 'Hello';
    
    return `You are the Soul Companion for ${userName}, integrating all life aspects with your unique auto-generated personality.

USER CONTEXT:
• User's Name: ${userName} (ALWAYS use their name naturally throughout conversations)
• Personalized Greeting: "${personalGreeting}"
• Name Integration: Weave ${userName}'s name into guidance, examples, and encouragement

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
- Address ${userName} by name in greetings, transitions, and key insights
- Make advice personal: "For you specifically, ${userName}..." or "${userName}, this aligns with your..."
- Use encouraging personalization: "You've got this, ${userName}" or "Trust yourself, ${userName}"

PERSONALITY INTEGRATION:
- Humor Elements: ${personality.signatureElements?.join(' + ') || 'thoughtful observations'}
- Personal Sharing: ${personality.conversationApproach?.personalSharing || 'relevant'} level
- Response Length: ${personality.conversationApproach?.responseLength || 'thorough'}
- Greeting Variations: ${personality.greetingStyles?.join(' / ') || 'Hello / Welcome'}

Blend productivity + growth seamlessly for ${userName}. Give actionable, soulful advice using your distinctive personality. Close with integration invitations using ${userName}'s name naturally.`;
  }

  updateBlueprint(updates: Partial<LayeredBlueprint>) {
    console.log("🔄 Personality Engine: Updating blueprint and regenerating persona");
    this.blueprint = { ...this.blueprint, ...updates };
    this.extractUserFirstName(); // Re-extract name when blueprint updates
    this.detectCommunicationStyle();
    this.compilePersona(); // Regenerate persona when blueprint updates
  }

  setUserId(userId: string) {
    console.log("👤 Personality Engine: Setting user ID:", userId);
    this.userId = userId;
    if (this.compiledPersona) {
      this.compiledPersona.userId = userId;
    }
  }

  /**
   * Get user's first name
   */
  getUserFirstName(): string {
    return this.userFirstName || 'friend';
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
    try {
      if (!this.compiledPersona && Object.keys(this.blueprint).length > 0) {
        this.compiledPersona = {
          userId: this.userId || 'anonymous',
          systemPrompt: '', // Will be generated for specific mode
          voiceTokens: this.blueprint.voiceTokens || VoiceTokenGenerator.generateVoiceTokens(this.blueprint),
          humorProfile: this.blueprint.humorProfile || HumorPaletteDetector.detectHumorProfile(this.blueprint),
          functionPermissions: ['general_conversation', 'goal_setting', 'emotional_support'],
          generatedAt: new Date(),
          blueprintVersion: '1.0.0'
        };
      }
      return this.compiledPersona;
    } catch (error) {
      console.error("❌ Personality Engine: Error getting compiled persona:", error);
      return null;
    }
  }

  /**
   * Validate persona distinctiveness
   */
  validatePersonaDistinctiveness(otherPersona: CompiledPersona): number {
    const thisPersona = this.getCompiledPersona();
    if (!thisPersona) return 0;

    let distinctivenessScore = 0;
    let totalComparisons = 0;

    try {
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
    } catch (error) {
      console.error("❌ Personality Engine: Error validating distinctiveness:", error);
      return 0;
    }
  }
}
