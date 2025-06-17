import { LayeredBlueprint, AgentMode } from "@/types/personality-modules";

export interface GeneratedPersona {
  systemPrompt: string;
  voiceTokens: Record<string, any>;
  humorProfile: Record<string, any>;
  functionPermissions: string[];
}

// Define the structure for cognitive temperamental data
interface CognitiveTemperamental {
  mbtiType: string;
  functions: string[];
  dominantFunction: string;
  auxiliaryFunction: string;
  cognitiveStack: string[];
  taskApproach: string;
  communicationStyle: string;
  decisionMaking: string;
  informationProcessing: string;
}

// Define the structure for energy decision strategy data
interface EnergyDecisionStrategy {
  humanDesignType: string;
  authority: string;
  decisionStyle: string;
  pacing: string;
  energyType: string;
  strategy: string;
  profile: string;
  centers: string[];
  gates: string[];
  channels: string[];
}

// Define the structure for motivation belief engine data
interface MotivationBeliefEngine {
  mindset: string;
  motivation: string[];
  stateManagement: string;
  coreBeliefs: string[];
  drivingForces: string[];
  excitementCompass: string;
  frequencyAlignment: string;
  beliefInterface: string[];
  resistancePatterns: string[];
}

// Define the structure for core values narrative data
interface CoreValuesNarrative {
  lifePath: number;
  meaningfulAreas: string[];
  anchoringVision: string;
  lifeThemes: string[];
  valueSystem: string;
  northStar: string;
  missionStatement: string;
  purposeAlignment: string;
}

// Define the structure for public archetype data
interface PublicArchetype {
  sunSign: string;
  socialStyle: string;
  publicVibe: string;
  publicPersona: string;
  leadershipStyle: string;
  socialMask: string;
  externalExpression: string;
}

// Define the structure for generational code data
interface GenerationalCode {
  chineseZodiac: string;
  element: string;
  cohortTint: string;
  generationalThemes: string[];
  collectiveInfluence: string;
}

// Define the structure for timing overlays data
interface TimingOverlays {
  currentTransits: string[];
  seasonalInfluences: string[];
  cyclicalPatterns: string[];
  optimalTimings: string[];
  energyWeather: string;
}

// Define the structure for user meta data
interface UserMeta {
  preferred_name: string;
  full_name: string;
  birth_date: string;
  birth_location: string;
  birth_time_local: string;
  timezone: string;
  personality: any;
}

export class PersonalityEngine {
  private blueprint: Partial<LayeredBlueprint> = {};
  private userId: string | null = null;

  setUserId(userId: string) {
    console.log("👤 Personality Engine: Setting user ID:", userId);
    this.userId = userId;
  }

  updateBlueprint(newBlueprint: Partial<LayeredBlueprint>) {
    console.log("🔄 Personality Engine: Updating blueprint and regenerating persona");
    this.blueprint = { ...this.blueprint, ...newBlueprint };
  }

  getUserFirstName(): string | null {
    if (this.blueprint.user_meta && this.blueprint.user_meta.preferred_name) {
      console.log("✅ Personality Engine: Extracted user first name:", this.blueprint.user_meta.preferred_name);
      return this.blueprint.user_meta.preferred_name;
    }
    if (this.blueprint.user_meta && this.blueprint.user_meta.full_name) {
      const nameParts = this.blueprint.user_meta.full_name.split(' ');
      if (nameParts.length > 0) {
        console.log("✅ Personality Engine: Extracted user first name from full name:", nameParts[0]);
        return nameParts[0];
      }
    }
    console.warn("⚠️ Personality Engine: Could not extract user first name from blueprint");
    return null;
  }

  detectCommunicationStyle(blueprint: Partial<LayeredBlueprint>): { style: string; confidence: number } {
    console.log("Detecting communication style for blueprint:", blueprint);
    
    let style = 'balanced';
    let factors = 0;
    
    if (blueprint.cognitiveTemperamental) {
      factors++;
      if (blueprint.cognitiveTemperamental.communicationStyle === 'clear') {
        style = 'direct';
      } else if (blueprint.cognitiveTemperamental.communicationStyle === 'empathetic') {
        style = 'warm';
      }
    }
    
    if (blueprint.publicArchetype) {
      factors++;
      if (blueprint.publicArchetype.socialStyle === 'expressive') {
        style = 'engaging';
      } else if (blueprint.publicArchetype.socialStyle === 'reserved') {
        style = 'thoughtful';
      }
    }
    
    if (blueprint.coreValuesNarrative) {
      factors++;
      if (blueprint.coreValuesNarrative.valueSystem === 'compassion') {
        style = 'caring';
      } else if (blueprint.coreValuesNarrative.valueSystem === 'achievement') {
        style = 'driven';
      }
    }

    const confidence = factors > 0 ? Math.round((factors / 7) * 100) : 0;
    
    console.log("Detected communication style:", { style, confidence });
    console.log("Adaptation confidence:", `${confidence} % based on ${factors} blueprint factors`);
    
    return { style, confidence };
  }

  detectHumorProfile(blueprint: Partial<LayeredBlueprint>): { style: string; timing: string } {
    console.log("Detecting humor profile for:", blueprint);
    
    let style = 'observational-analyst';
    let timing = 'situational';
    
    if (blueprint.cognitiveTemperamental) {
      if (blueprint.cognitiveTemperamental.taskApproach === 'spontaneous') {
        timing = 'improvisational';
      } else if (blueprint.cognitiveTemperamental.decisionMaking === 'logical') {
        style = 'witty';
      }
    }
    
    if (blueprint.publicArchetype) {
      if (blueprint.publicArchetype.socialMask === 'playful') {
        style = 'whimsical';
      } else if (blueprint.publicArchetype.externalExpression === 'reserved') {
        timing = 'intentional';
      }
    }
    
    return { style, timing };
  }

  generatePersona(mode: AgentMode): GeneratedPersona {
    const userName = this.getUserFirstName() || "friend";
    const communicationStyle = this.detectCommunicationStyle(this.blueprint);
    const humorProfile = this.detectHumorProfile(this.blueprint);

    console.log("✅ Personality Engine: Generated components:", {
      userName,
      communicationStyle,
      humorProfile
    });

    const systemPrompt = `You are the Soul Companion for ${userName}, integrating all life aspects with a balanced and adaptive personality.

USER CONTEXT:
• User's Name: ${userName} (ALWAYS use their name naturally throughout conversations)
• MBTI: ${this.blueprint.cognitiveTemperamental?.mbtiType || "Unknown"}
• Human Design Type: ${this.blueprint.energyDecisionStrategy?.humanDesignType || "Unknown"}
• Sun Sign: ${this.blueprint.publicArchetype?.sunSign || "Unknown"}
• Life Path Number: ${this.blueprint.coreValuesNarrative?.lifePath || "Unknown"}

CORE PERSONALITY:
• Communication Style: ${communicationStyle.style}, natural, and adaptive
• Humor Approach: ${humorProfile.style} with ${humorProfile.timing} awareness
• Voice Pattern: Steady rhythm with balanced enthusiasm
• Signature Phrases: "Trust the process, ${userName}", "Let's explore together, ${userName}", "Moving forward, ${userName}"

RESPONSE GUIDELINES:
• Always acknowledge ${userName} by name in responses
• Provide balanced guidance covering both productivity and inner growth
• Use encouraging language that builds confidence
• Ask thoughtful follow-up questions to deepen engagement
• Reference both practical action steps and personal insights
• Maintain a supportive but not overly familiar tone

Remember: You are ${userName}'s integrated life companion, helping them navigate both external achievements and internal development with wisdom and care.`;

    return {
      systemPrompt,
      voiceTokens: { rhythm: "steady", enthusiasm: "balanced" },
      humorProfile,
      functionPermissions: ["general_guidance", "goal_setting", "reflection"]
    };
  }

  async getOrGeneratePersona(mode: AgentMode): Promise<GeneratedPersona | null> {
    if (!this.userId) {
      console.warn("⚠️ Personality Engine: No user ID available for persona generation");
      return null;
    }

    console.log("🎭 Personality Engine: Getting/generating persona for user:", this.userId, "mode:", mode);

    try {
      // Import PersonaService here to avoid circular dependency
      const { PersonaService } = await import('./persona-service');
      
      // Try to get existing persona first
      const existingPersona = await PersonaService.getUserPersona(this.userId);
      
      if (existingPersona) {
        console.log("✅ Personality Engine: Found existing persona, using it");
        return {
          systemPrompt: existingPersona.system_prompt,
          voiceTokens: existingPersona.voice_tokens,
          humorProfile: existingPersona.humor_profile,
          functionPermissions: existingPersona.function_permissions
        };
      }

      // Generate new persona
      console.log("🔧 Personality Engine: No existing persona found, generating new one");
      const persona = this.generatePersona(mode);
      
      // Try to save it
      console.log("💾 Personality Engine: Attempting to save generated persona to database");
      const saved = await PersonaService.saveUserPersona({
        user_id: this.userId,
        system_prompt: persona.systemPrompt,
        voice_tokens: persona.voiceTokens,
        humor_profile: persona.humorProfile,
        function_permissions: persona.functionPermissions,
        blueprint_version: '1.0.0'
      });
      
      if (saved) {
        console.log("✅ Personality Engine: Persona saved successfully to database");
      } else {
        console.warn("⚠️ Personality Engine: Failed to save persona to database, but continuing with generated persona");
      }
      
      return persona;
    } catch (error) {
      console.error("❌ Personality Engine: Error in getOrGeneratePersona:", error);
      console.log("⚠️ Personality Engine: Persona generation failed, using fallback");
      return this.generateFallbackPersona(mode);
    }
  }

  generateFallbackPersona(mode: AgentMode): GeneratedPersona {
    console.log("🔧 Personality Engine: Creating fallback persona for mode:", mode);
    
    const userName = this.getUserFirstName() || "friend";
    console.log("🔧 Personality System: Using fallback persona for", mode, "with name:", userName);
    
    const systemPrompt = `You are the Soul Companion for ${userName}, integrating all life aspects with a balanced and adaptive personality.

USER CONTEXT:
• User's Name: ${userName} (ALWAYS use their name naturally throughout conversations)

CORE PERSONALITY:
• Communication Style: Warm, natural, and adaptive
• Humor Approach: Observational-analyst with situational awareness
• Voice Pattern: Steady rhythm with balanced enthusiasm
• Signature Phrases: "Trust the process, ${userName}", "Let's explore together, ${userName}", "Moving forward, ${userName}"

RESPONSE GUIDELINES:
• Always acknowledge ${userName} by name in responses
• Provide balanced guidance covering both productivity and inner growth
• Use encouraging language that builds confidence
• Ask thoughtful follow-up questions to deepen engagement
• Reference both practical action steps and personal insights
• Maintain a supportive but not overly familiar tone

Remember: You are ${userName}'s integrated life companion, helping them navigate both external achievements and internal development with wisdom and care.`;

    return {
      systemPrompt,
      voiceTokens: { rhythm: "steady", enthusiasm: "balanced" },
      humorProfile: { style: "observational-analyst", timing: "situational" },
      functionPermissions: ["general_guidance", "goal_setting", "reflection"]
    };
  }

  generateSystemPrompt(mode: AgentMode): string | null {
    if (!this.userId) {
      console.warn("⚠️ Personality Engine: No user ID available for system prompt generation");
      return null;
    }

    try {
      const persona = this.generatePersona(mode);
      return persona.systemPrompt;
    } catch (error) {
      console.error("❌ Personality Engine: Error generating system prompt:", error);
      return null;
    }
  }
}
