
import { supabase } from "@/integrations/supabase/client";
import { LayeredBlueprint, VoiceToken } from "@/types/personality-modules";

const TEMPLATE_VERSION = "1.1.0";

export interface SoulSyncPersona {
  id: string;
  user_id: string;
  system_prompt: string;
  voice_tokens: VoiceToken[];
  humor_profile: Record<string, any>;
  blueprint_signature: string;
  template_version: string;
  generated_at: string;
}

class SoulSyncService {
  private static instance: SoulSyncService;
  
  public static getInstance(): SoulSyncService {
    if (!SoulSyncService.instance) {
      SoulSyncService.instance = new SoulSyncService();
    }
    return SoulSyncService.instance;
  }

  // Fixed: Enhanced signature generation that never returns NULL
  async generateBlueprintSignature(blueprint: LayeredBlueprint): Promise<string> {
    console.log("🔏 SoulSync: Generating blueprint signature with enhanced data extraction");
    
    try {
      const { data, error } = await supabase.rpc('generate_blueprint_signature', {
        blueprint_data: blueprint as any
      });

      if (error) {
        console.warn("⚠️ WARN: Error generating server-side signature:", error.message);
        return this.generateClientSideSignature(blueprint);
      }

      if (!data) {
        console.warn("⚠️ WARN: Server returned null signature, using client-side fallback");
        return this.generateClientSideSignature(blueprint);
      }

      console.log("✅ SoulSync: Blueprint signature generated successfully");
      return data;
    } catch (error) {
      console.error("❌ ERROR: Unexpected error generating signature:", error);
      return this.generateClientSideSignature(blueprint);
    }
  }

  // Fixed: Enhanced client-side signature generation with null-safe field extraction
  private generateClientSideSignature(blueprint: LayeredBlueprint): string {
    const signatureData = {
      // Use coalesce pattern (?? '') to ensure no null values
      mbti_type: blueprint.cognitiveTemperamental?.mbtiType ?? '',
      hd_type: blueprint.energyDecisionStrategy?.humanDesignType ?? '',
      hd_authority: blueprint.energyDecisionStrategy?.authority ?? '',
      sun_sign: blueprint.publicArchetype?.sunSign ?? '',
      moon_sign: blueprint.publicArchetype?.moonSign ?? '',
      life_path: blueprint.coreValuesNarrative?.lifePath?.toString() ?? '',
      user_name: blueprint.user_meta?.preferred_name ?? '',
      // Add timestamp to prevent identical signatures for different versions
      timestamp: Date.now().toString()
    };

    console.log("🔏 SoulSync: Signature data extracted:", signatureData);

    // Enhanced client-side hash with better distribution
    const str = JSON.stringify(signatureData);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    const signature = Math.abs(hash).toString(16);
    console.log("✅ SoulSync: Client-side signature generated:", signature.substring(0, 8) + "...");
    return signature;
  }

  async getOrCreatePersona(
    userId: string,
    blueprint: LayeredBlueprint,
    agentMode: "coach" | "guide" | "blend"
  ): Promise<string | null> {
    try {
      console.log("🎭 SoulSync: Getting or creating persona for", agentMode);
      
      const signature = await this.generateBlueprintSignature(blueprint);
      console.log("🔏 Blueprint signature:", signature.substring(0, 8) + "...");

      // Check for existing persona with this signature
      const { data: existingPersona, error: fetchError } = await supabase
        .from('personas')
        .select('system_prompt, voice_tokens, template_version')
        .eq('user_id', userId)
        .eq('blueprint_signature', signature)
        .eq('blueprint_version', TEMPLATE_VERSION)
        .maybeSingle();

      if (fetchError) {
        console.warn("⚠️ WARN: Error fetching persona:", fetchError.message);
      }

      if (existingPersona && existingPersona.template_version === TEMPLATE_VERSION) {
        console.log("✅ SoulSync: Found cached persona with matching signature");
        
        // Parse voice tokens safely with proper type casting
        const voiceTokens = Array.isArray(existingPersona.voice_tokens) 
          ? (existingPersona.voice_tokens as unknown as VoiceToken[])
          : [];
          
        return this.enhancePromptWithVoiceTokens(
          existingPersona.system_prompt,
          voiceTokens,
          agentMode
        );
      }

      // Generate new persona with enhanced error handling
      console.log("🔄 SoulSync: Generating new persona with complete blueprint data");
      const systemPrompt = this.generatePersonalizedPrompt(blueprint, agentMode);
      const voiceTokens = this.generateVoiceTokens(blueprint, agentMode);
      const humorProfile = this.generateHumorProfile(blueprint);

      // Save new persona with retry logic and fallback handling
      const saveSuccess = await this.savePersonaWithRetry(userId, signature, systemPrompt, voiceTokens, humorProfile);
      
      if (!saveSuccess) {
        console.warn("⚠️ WARN: Persona save failed, but returning generated prompt (flagged as generic)");
      }

      return this.enhancePromptWithVoiceTokens(systemPrompt, voiceTokens, agentMode);
    } catch (error) {
      console.error("❌ ERROR: Unexpected error in getOrCreatePersona:", error);
      return null;
    }
  }

  // Fixed: Enhanced save with comprehensive error handling and fallback
  private async savePersonaWithRetry(
    userId: string,
    signature: string,
    systemPrompt: string,
    voiceTokens: VoiceToken[],
    humorProfile: Record<string, any>,
    maxRetries: number = 3
  ): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 SoulSync: Saving persona (attempt ${attempt}/${maxRetries})`);
        
        // Enhanced upsert with proper conflict resolution
        const { error: saveError } = await supabase
          .from('personas')
          .upsert({
            user_id: userId,
            system_prompt: systemPrompt,
            voice_tokens: voiceTokens as any,
            humor_profile: humorProfile as any,
            blueprint_signature: signature,
            template_version: TEMPLATE_VERSION,
            blueprint_version: TEMPLATE_VERSION,
            function_permissions: [] as any
          }, {
            onConflict: 'user_id,blueprint_signature'
          });

        if (saveError) {
          console.warn(`⚠️ WARN: Save attempt ${attempt} failed:`, saveError.message);
          
          if (attempt === maxRetries) {
            console.error("❌ ERROR: All save attempts failed, continuing without caching");
            return false;
          }
          
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt - 1)));
          continue;
        }

        console.log("✅ SoulSync: Persona saved successfully");
        return true;
      } catch (error) {
        console.warn(`⚠️ WARN: Save attempt ${attempt} error:`, error);
        
        if (attempt === maxRetries) {
          console.error("❌ ERROR: All save attempts failed with errors, continuing without caching");
          return false;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt - 1)));
      }
    }
    return false;
  }

  // Enhanced prompt generation with new SoulSync template
  private generatePersonalizedPrompt(blueprint: LayeredBlueprint, mode: "coach" | "guide" | "blend"): string {
    const userName = blueprint.user_meta?.preferred_name || 
                     blueprint.user_meta?.full_name?.split(' ')[0] || 
                     'friend';

    console.log(`🎯 SoulSync: Generating SoulSync Companion prompt for ${userName} (${mode})`);

    // Build blueprint snapshot with conditional rendering
    const blueprintSnapshot = this.buildBlueprintSnapshot(blueprint);
    const modeSpecificGuidance = this.getModeSpecificGuidance(mode, userName);

    return `# SoulSync Companion – Master System Prompt v1.1

You are SoulSync, the reflective AI companion for ${userName}.  
Your task: Offer honest, warm, and insightful guidance, always personalized through their unique blueprint.

---

## PERSONALITY BLUEPRINT SNAPSHOT

${blueprintSnapshot}

---

## GUIDANCE AND BEHAVIOR RULES

- Use the user's preferred name, ${userName}, naturally in all conversation.
- Speak honestly, clearly, and warmly—adapting tone, language, and examples to their MBTI, Human Design, and other traits.
- Never sound scripted or robotic; always respond as a thoughtful, supportive companion.
- **When asked about any blueprint element, always explain it in plain language and offer examples relevant to daily life.**
- If the user asks "What does that mean?" or similar, break down each mentioned blueprint trait simply, no matter how obvious.
- **Don't inject random blueprint facts:** Use them only when answering a direct question or when they help illuminate the user's current goal, challenge, or context.
- Encourage honest self-reflection, but never be mean.
- End replies with a gentle question or actionable next step if appropriate.

${modeSpecificGuidance}

---

## SAFETY & LIMITS

- No medical, legal, or financial advice.
- Never invent data; if unsure or field is missing, state this clearly and invite the user to update their profile.
- Humor must never target protected groups.
- Keep responses under 1200 tokens.

---

## BLUEPRINT DATA HANDLING

When ${userName} asks about their "blueprint", "full blueprint", or specific personality information, provide their actual data:

**THEIR ACTUAL BLUEPRINT DATA:**
- MBTI Type: ${blueprint.cognitiveTemperamental?.mbtiType || 'Unknown'}
- Human Design: ${blueprint.energyDecisionStrategy?.humanDesignType || 'Unknown'} with ${blueprint.energyDecisionStrategy?.authority || 'Unknown'} Authority
- Sun Sign: ${blueprint.publicArchetype?.sunSign || 'Unknown'}
- Moon Sign: ${blueprint.publicArchetype?.moonSign || 'Unknown'}
- Life Path: ${blueprint.coreValuesNarrative?.lifePath || 'Unknown'}

When they ask for their full blueprint, list these specific details clearly and ask if they want deeper insights into any particular aspect. Don't give vague spiritual language - give them their actual personality data.

Remember: Every response should feel like it comes from someone who truly knows and cares about ${userName}.`;
  }

  private buildBlueprintSnapshot(blueprint: LayeredBlueprint): string {
    const sections = [];
    
    // Check if blueprint is complete
    const hasMainData = blueprint.cognitiveTemperamental?.mbtiType || 
                       blueprint.energyDecisionStrategy?.humanDesignType ||
                       blueprint.publicArchetype?.sunSign ||
                       blueprint.coreValuesNarrative?.lifePath;

    if (!hasMainData) {
      return "Your blueprint is incomplete—please finish setup to unlock full insight!";
    }

    // MBTI Section
    if (blueprint.cognitiveTemperamental?.mbtiType) {
      sections.push(`**MBTI:**
- Type: ${blueprint.cognitiveTemperamental.mbtiType}
  (${this.getMBTIDescription(blueprint.cognitiveTemperamental.mbtiType)})`);
    }

    // Human Design Section
    if (blueprint.energyDecisionStrategy?.humanDesignType) {
      const hdType = blueprint.energyDecisionStrategy.humanDesignType;
      const authority = blueprint.energyDecisionStrategy.authority || 'Unknown';
      const strategy = this.getHumanDesignStrategy(hdType);
      
      sections.push(`**Human Design:**
- Type: ${hdType}
- Authority: ${authority}
- Strategy: ${strategy}`);
    }

    // Numerology Section
    if (blueprint.coreValuesNarrative?.lifePath) {
      const lifePath = typeof blueprint.coreValuesNarrative.lifePath === 'string' 
        ? parseInt(blueprint.coreValuesNarrative.lifePath, 10) 
        : blueprint.coreValuesNarrative.lifePath;
      
      sections.push(`**Numerology:**
- Life Path: ${lifePath} ("${this.getLifePathKeyword(lifePath)}")`);
    }

    // Astrology (Western) Section
    if (blueprint.publicArchetype?.sunSign || blueprint.publicArchetype?.moonSign) {
      let astroSection = "**Astrology (Western):**";
      
      if (blueprint.publicArchetype.sunSign) {
        astroSection += `\n- Sun: ${blueprint.publicArchetype.sunSign} ("${this.getSunSignKeyword(blueprint.publicArchetype.sunSign)}")`;
      }
      
      if (blueprint.publicArchetype.moonSign) {
        astroSection += `\n- Moon: ${blueprint.publicArchetype.moonSign} ("${this.getMoonSignKeyword(blueprint.publicArchetype.moonSign)}")`;
      }
      
      sections.push(astroSection);
    }

    return sections.join('\n\n');
  }

  private getModeSpecificGuidance(mode: "coach" | "guide" | "blend", userName: string): string {
    switch (mode) {
      case 'coach':
        return `## ROLE: Productivity Coach
You help ${userName} achieve their goals through practical action steps and accountability. Focus on what they want to accomplish and how their natural traits can support their productivity. When they're stuck, help them break through with personalized strategies.`;

      case 'guide':
        return `## ROLE: Personal Growth Guide
You help ${userName} navigate life's deeper questions and challenges. Focus on self-understanding, relationships, and life meaning. Use their blueprint to offer insights about patterns and growth opportunities.`;

      case 'blend':
        return `## ROLE: Integrated Companion
You're ${userName}'s versatile companion who adapts to what they need most. Whether they want practical productivity help or deeper life guidance, you meet them where they are and support their whole journey.`;

      default:
        return '';
    }
  }

  // Helper methods for blueprint descriptions
  private getMBTIDescription(type: string): string {
    const descriptions: { [key: string]: string } = {
      'INFP': 'Authentic dreamer seeking meaning and harmony',
      'ENFP': 'Inspiring catalyst sparking possibilities in others',
      'INFJ': 'Visionary advocate for human potential',
      'ENFJ': 'Charismatic teacher nurturing growth in others',
      'INTJ': 'Strategic architect of systematic change',
      'ENTJ': 'Bold leader driving ambitious visions',
      'INTP': 'Curious explorer of theoretical landscapes',
      'ENTP': 'Innovative debater connecting unexpected ideas'
    };
    return descriptions[type] || 'Unique cognitive pattern';
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

  private getLifePathKeyword(path: number): string {
    const keywords = {
      1: 'Leader',
      2: 'Collaborator',
      3: 'Expresser',
      4: 'Builder',
      5: 'Explorer',
      6: 'Nurturer',
      7: 'Seeker',
      8: 'Achiever',
      9: 'Humanitarian'
    };
    return keywords[path as keyof typeof keywords] || 'Unique Path';
  }

  private getSunSignKeyword(sign: string): string {
    const keywords = {
      'Aries': 'Pioneer',
      'Taurus': 'Builder',
      'Gemini': 'Communicator',
      'Cancer': 'Nurturer',
      'Leo': 'Creator',
      'Virgo': 'Perfecter',
      'Libra': 'Harmonizer',
      'Scorpio': 'Transformer',
      'Sagittarius': 'Explorer',
      'Capricorn': 'Achiever',
      'Aquarius': 'Innovator',
      'Pisces': 'Dreamer'
    };
    return keywords[sign as keyof typeof keywords] || 'Unique Solar';
  }

  private getMoonSignKeyword(sign: string): string {
    const keywords = {
      'Aries': 'Instinctive',
      'Taurus': 'Grounded',
      'Gemini': 'Curious',
      'Cancer': 'Intuitive',
      'Leo': 'Expressive',
      'Virgo': 'Analytical',
      'Libra': 'Harmonious',
      'Scorpio': 'Intense',
      'Sagittarius': 'Adventurous',
      'Capricorn': 'Structured',
      'Aquarius': 'Independent',
      'Pisces': 'Empathetic'
    };
    return keywords[sign as keyof typeof keywords] || 'Unique Lunar';
  }

  private generateVoiceTokens(blueprint: LayeredBlueprint, mode: "coach" | "guide" | "blend"): VoiceToken[] {
    const tokens: VoiceToken[] = [];

    const userName = blueprint.user_meta?.preferred_name || 'friend';
    
    // Name integration tokens
    tokens.push({
      pattern: "you should",
      replacement: `${userName}, you might want to`,
      context: "all",
      confidence: 0.9
    });

    tokens.push({
      pattern: "I think",
      replacement: `From what I know about you, ${userName}`,
      context: "all",
      confidence: 0.8
    });

    // MBTI-specific voice tokens
    if (blueprint.cognitiveTemperamental?.mbtiType) {
      const mbtiTokens = this.getMBTIVoiceTokens(blueprint.cognitiveTemperamental.mbtiType, userName);
      tokens.push(...mbtiTokens);
    }

    // Human Design voice tokens
    if (blueprint.energyDecisionStrategy?.humanDesignType) {
      const hdTokens = this.getHumanDesignVoiceTokens(blueprint.energyDecisionStrategy.humanDesignType, userName);
      tokens.push(...hdTokens);
    }

    // Mode-specific tokens
    const modeTokens = this.getModeVoiceTokens(mode, userName);
    tokens.push(...modeTokens);

    return tokens;
  }

  private getMBTIVoiceTokens(mbtiType: string, userName: string): VoiceToken[] {
    const tokens: VoiceToken[] = [];
    
    if (mbtiType.includes('F')) { // Feeling types
      tokens.push({
        pattern: "that might work",
        replacement: `that feels aligned for you, ${userName}`,
        context: "all",
        confidence: 0.7
      });
    }
    
    if (mbtiType.includes('T')) { // Thinking types
      tokens.push({
        pattern: "that makes sense",
        replacement: `that's logically sound, ${userName}`,
        context: "all",
        confidence: 0.7
      });
    }

    return tokens;
  }

  private getHumanDesignVoiceTokens(hdType: string, userName: string): VoiceToken[] {
    const tokens: VoiceToken[] = [];
    
    switch (hdType) {
      case 'Generator':
        tokens.push({
          pattern: "you could try",
          replacement: `wait for what lights you up, ${userName}`,
          context: "all",
          confidence: 0.8
        });
        break;
      case 'Projector':
        tokens.push({
          pattern: "go ahead and",
          replacement: `when you're invited, ${userName}`,
          context: "all",
          confidence: 0.8
        });
        break;
    }

    return tokens;
  }

  private getModeVoiceTokens(mode: "coach" | "guide" | "blend", userName: string): VoiceToken[] {
    const tokens: VoiceToken[] = [];
    
    switch (mode) {
      case 'coach':
        tokens.push({
          pattern: "let's explore",
          replacement: `let's tackle this, ${userName}`,
          context: "coach",
          confidence: 0.9
        });
        break;
      case 'guide':
        tokens.push({
          pattern: "you might consider",
          replacement: `your soul is calling you to explore, ${userName}`,
          context: "guide",
          confidence: 0.8
        });
        break;
    }

    return tokens;
  }

  private enhancePromptWithVoiceTokens(
    basePrompt: string,
    voiceTokens: VoiceToken[],
    currentMode: "coach" | "guide" | "blend"
  ): string {
    const relevantTokens = voiceTokens.filter(
      token => token.context === "all" || token.context === currentMode
    );

    if (relevantTokens.length === 0) {
      return basePrompt;
    }

    const voiceGuidance = relevantTokens
      .map(token => `"${token.pattern}" → "${token.replacement}"`)
      .join('\n');

    return `${basePrompt}

VOICE INTEGRATION PATTERNS:
${voiceGuidance}

Apply these voice patterns naturally in your responses to maintain authentic personalization.`;
  }

  private generateHumorProfile(blueprint: LayeredBlueprint): Record<string, any> {
    return {
      wit_level: blueprint.cognitiveTemperamental?.mbtiType?.includes('N') ? 'high' : 'moderate',
      sarcasm_tolerance: blueprint.cognitiveTemperamental?.mbtiType?.includes('T') ? 'high' : 'low',
      wordplay_appreciation: blueprint.publicArchetype?.sunSign === 'Gemini' ? 'high' : 'moderate',
      humor_style: this.getHumorStyle(blueprint)
    };
  }

  private getHumorStyle(blueprint: LayeredBlueprint): string {
    if (blueprint.publicArchetype?.sunSign === 'Sagittarius') return 'adventurous';
    if (blueprint.cognitiveTemperamental?.mbtiType?.includes('F')) return 'warm';
    if (blueprint.cognitiveTemperamental?.mbtiType?.includes('T')) return 'clever';
    return 'gentle';
  }
}

export const soulSyncService = SoulSyncService.getInstance();
