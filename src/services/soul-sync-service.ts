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

  private generateClientSideSignature(blueprint: LayeredBlueprint): string {
    const signatureData = {
      mbti_type: blueprint.cognitiveTemperamental?.mbtiType ?? '',
      hd_type: blueprint.energyDecisionStrategy?.humanDesignType ?? '',
      hd_authority: blueprint.energyDecisionStrategy?.authority ?? '',
      sun_sign: blueprint.publicArchetype?.sunSign ?? '',
      moon_sign: blueprint.publicArchetype?.moonSign ?? '',
      life_path: blueprint.coreValuesNarrative?.lifePath?.toString() ?? '',
      user_name: blueprint.user_meta?.preferred_name ?? '',
      timestamp: Date.now().toString()
    };

    console.log("🔏 SoulSync: Signature data extracted:", signatureData);

    const str = JSON.stringify(signatureData);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
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
        
        const voiceTokens = Array.isArray(existingPersona.voice_tokens) 
          ? (existingPersona.voice_tokens as unknown as VoiceToken[])
          : [];
          
        return this.enhancePromptWithVoiceTokens(
          existingPersona.system_prompt,
          voiceTokens,
          agentMode
        );
      }

      console.log("🔄 SoulSync: Generating new persona with complete blueprint data");
      const systemPrompt = this.generatePersonalizedPrompt(blueprint, agentMode);
      const voiceTokens = this.generateVoiceTokens(blueprint, agentMode);
      const humorProfile = this.generateHumorProfile(blueprint);

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
        
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt - 1)));
      }
    }
    return false;
  }

  private generatePersonalizedPrompt(blueprint: LayeredBlueprint, mode: "coach" | "guide" | "blend"): string {
    const userName = blueprint.user_meta?.preferred_name || 
                     blueprint.user_meta?.full_name?.split(' ')[0] || 
                     'friend';

    console.log(`🎯 SoulSync: Generating comprehensive SoulSync Companion prompt for ${userName} (${mode})`);

    const blueprintSnapshot = this.buildComprehensiveBlueprintSnapshot(blueprint);
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

## FOLLOW-UP RULES FOR COMPREHENSIVE RESPONSES

- **If the user asks "Is there more?" or expresses doubt about missing information, always validate their feeling first:** "You're right, there should be more detail here. Let me check what I have for you..."
- **When showing numerology, list ALL available numbers and their brief meanings:**
  - Life Path Number (if available)
  - Expression Number (if available)  
  - Soul Urge Number (if available)
  - Personality Number (if available)
  - Birthday Number (if available)
- **If some numbers or traits are missing, clearly state which and invite the user to update their profile:** "I have your Life Path and Expression numbers, but your Soul Urge and Personality numbers seem to be missing. Would you like help calculating those?"
- **Always validate the user's expectation:** If they expect more data than what's shown, acknowledge this and explain what's present vs. missing.
- **Be honest if a section is incomplete or "unknown"—never make up data.**
- **For any blueprint element mentioned, always offer practical daily-life examples:** "Your Generator energy means you'll feel most alive when..."

${modeSpecificGuidance}

---

## SAFETY & LIMITS

- No medical, legal, or financial advice.
- Never invent data; if unsure or field is missing, state this clearly and invite the user to update their profile.
- Humor must never target protected groups.
- Keep responses under 1200 tokens.

---

## BLUEPRINT DATA HANDLING

When ${userName} asks about their "blueprint", "full blueprint", or specific personality information, provide ALL their actual available data with clear explanations:

**THEIR COMPLETE AVAILABLE BLUEPRINT DATA:**
${this.getCompleteDataSummary(blueprint)}

When they ask for their full blueprint, list all available details clearly and ask if they want deeper insights into any particular aspect. Always explain what each element means in practical terms. Don't give vague spiritual language - give them their actual personality data with real-world applications.

Remember: Every response should feel like it comes from someone who truly knows and cares about ${userName}, while being completely honest about what information is available vs. missing.`;
  }

  private buildComprehensiveBlueprintSnapshot(blueprint: LayeredBlueprint): string {
    console.log("🔍 Building comprehensive blueprint snapshot. Available data:", {
      coreValuesNarrative: !!blueprint.coreValuesNarrative,
      lifePath: blueprint.coreValuesNarrative?.lifePath,
      expressionNumber: blueprint.coreValuesNarrative?.expressionNumber,
      userMeta: !!blueprint.user_meta,
      valuesLifePath: !!blueprint.user_meta?.values_life_path,
      valuesLifePathData: blueprint.user_meta?.values_life_path
    });

    const sections = [];
    
    // Check if blueprint has meaningful data
    const hasMainData = blueprint.cognitiveTemperamental?.mbtiType !== 'Unknown' || 
                       blueprint.energyDecisionStrategy?.humanDesignType !== 'Unknown' ||
                       blueprint.publicArchetype?.sunSign !== 'Unknown' ||
                       (blueprint.coreValuesNarrative?.lifePath && ((typeof blueprint.coreValuesNarrative.lifePath === 'number' && blueprint.coreValuesNarrative.lifePath > 0) || (typeof blueprint.coreValuesNarrative.lifePath === 'string' && parseInt(blueprint.coreValuesNarrative.lifePath, 10) > 0)));

    if (!hasMainData) {
      return "Your blueprint is incomplete—please finish setup to unlock full insight!";
    }

    // MBTI Section with Big Five if available
    if (blueprint.cognitiveTemperamental?.mbtiType && blueprint.cognitiveTemperamental.mbtiType !== 'Unknown') {
      let mbtiSection = `**MBTI:**
- Type: ${blueprint.cognitiveTemperamental.mbtiType}`;

      // Get description from user_meta if available
      const personalityData = blueprint.user_meta?.personality;
      if (personalityData?.description) {
        mbtiSection += `\n  (${personalityData.description})`;
      }

      if (personalityData?.mbtiProbabilities && Object.keys(personalityData.mbtiProbabilities).length > 0) {
        const topTypes = Object.entries(personalityData.mbtiProbabilities)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 3)
          .map(([type, prob]) => `${type} (${Math.round((prob as number) * 100)}%)`)
          .join(', ');
        mbtiSection += `\n- Alternative possibilities: ${topTypes}`;
      }

      if (personalityData?.bigFive && Object.keys(personalityData.bigFive).length > 0) {
        const bigFive = personalityData.bigFive;
        mbtiSection += `\n- Big Five: Openness ${Math.round((bigFive.openness || 0) * 100)}, Conscientiousness ${Math.round((bigFive.conscientiousness || 0) * 100)}, Extraversion ${Math.round((bigFive.extraversion || 0) * 100)}, Agreeableness ${Math.round((bigFive.agreeableness || 0) * 100)}, Neuroticism ${Math.round((bigFive.neuroticism || 0) * 100)}`;
      }

      sections.push(mbtiSection);
    }

    // Enhanced Human Design Section
    if (blueprint.energyDecisionStrategy?.humanDesignType && blueprint.energyDecisionStrategy.humanDesignType !== 'Unknown') {
      const hdType = blueprint.energyDecisionStrategy.humanDesignType;
      const authority = blueprint.energyDecisionStrategy.authority || 'Unknown';
      const strategy = blueprint.energyDecisionStrategy.strategy || this.getHumanDesignStrategy(hdType);
      const profile = blueprint.energyDecisionStrategy.profile || 'Unknown';
      
      // Get additional data from user_meta
      const hdData = blueprint.user_meta?.energy_strategy_human_design;
      const definition = hdData?.definition || 'Unknown';
      const notSelfTheme = hdData?.not_self_theme || 'Unknown';
      
      let hdSection = `**Human Design:**
- Type: ${hdType}
- Authority: ${authority}
- Strategy: ${strategy}`;

      if (profile !== 'Unknown') {
        hdSection += `\n- Profile: ${profile}`;
      }
      if (definition !== 'Unknown') {
        hdSection += `\n- Definition: ${definition}`;
      }
      if (notSelfTheme !== 'Unknown') {
        hdSection += `\n- Not-self theme: ${notSelfTheme}`;
      }

      if (blueprint.energyDecisionStrategy.gates && blueprint.energyDecisionStrategy.gates.length > 0) {
        hdSection += `\n- Active Gates: ${blueprint.energyDecisionStrategy.gates.slice(0, 5).join(', ')}${blueprint.energyDecisionStrategy.gates.length > 5 ? '...' : ''}`;
      }

      if (blueprint.energyDecisionStrategy.channels && blueprint.energyDecisionStrategy.channels.length > 0) {
        hdSection += `\n- Active Channels: ${blueprint.energyDecisionStrategy.channels.slice(0, 3).join(', ')}${blueprint.energyDecisionStrategy.channels.length > 3 ? '...' : ''}`;
      }

      sections.push(hdSection);
    }

    // FIXED: Comprehensive Numerology Section with proper fallbacks
    const numerologySection = this.buildNumerologySection(blueprint);
    if (numerologySection) {
      sections.push(numerologySection);
    }

    // Enhanced Astrology (Western) Section
    if (blueprint.publicArchetype?.sunSign && blueprint.publicArchetype.sunSign !== 'Unknown') {
      let astroSection = "**Astrology (Western):**";
      
      const sunKeyword = this.getSunSignKeyword(blueprint.publicArchetype.sunSign);
      astroSection += `\n- Sun: ${blueprint.publicArchetype.sunSign} ("${sunKeyword}")`;
      
      if (blueprint.publicArchetype.moonSign && blueprint.publicArchetype.moonSign !== 'Unknown') {
        const moonKeyword = this.getMoonSignKeyword(blueprint.publicArchetype.moonSign);
        astroSection += `\n- Moon: ${blueprint.publicArchetype.moonSign} ("${moonKeyword}")`;
      }

      if (blueprint.publicArchetype.risingSign && blueprint.publicArchetype.risingSign !== 'Unknown') {
        astroSection += `\n- Rising: ${blueprint.publicArchetype.risingSign}`;
      }
      
      sections.push(astroSection);
    }

    // Chinese Astrology Section
    if (blueprint.generationalCode?.chineseZodiac && blueprint.generationalCode.chineseZodiac !== 'Unknown') {
      let chineseSection = `**Astrology (Chinese):**
- Animal: ${blueprint.generationalCode.chineseZodiac}`;

      // Get keyword from user_meta
      const chineseData = blueprint.user_meta?.archetype_chinese;
      if (chineseData?.keyword) {
        chineseSection += ` ("${chineseData.keyword}")`;
      }

      if (blueprint.generationalCode.element && blueprint.generationalCode.element !== 'Unknown') {
        chineseSection += `\n- Element: ${blueprint.generationalCode.element}`;
      }

      // Get yin/yang from user_meta
      if (chineseData?.yin_yang && chineseData.yin_yang !== 'Unknown') {
        chineseSection += `\n- Yin/Yang: ${chineseData.yin_yang}`;
      }

      sections.push(chineseSection);
    }

    // Goal Stack Section
    const goalData = blueprint.user_meta?.goal_stack;
    if (goalData?.primary_goal) {
      let goalSection = `**Goal Stack:**
- Main Goal: ${goalData.primary_goal}`;

      if (goalData.time_horizon) {
        goalSection += `\n- Horizon: ${goalData.time_horizon}`;
      }

      if (goalData.support_style) {
        goalSection += `\n- Support Style: ${goalData.support_style}`;
      }

      sections.push(goalSection);
    }

    // Bashar Suite Section
    const basharData = blueprint.user_meta?.bashar_suite;
    if (basharData?.belief_interface || basharData?.excitement_compass || basharData?.frequency_alignment) {
      let basharSection = "**Bashar Suite:**";

      if (basharData.belief_interface?.principle) {
        basharSection += `\n- Belief Principle: "${basharData.belief_interface.principle}"`;
      }

      if (basharData.belief_interface?.reframe_prompt) {
        basharSection += `\n- Reframe Prompt: "${basharData.belief_interface.reframe_prompt}"`;
      }

      if (basharData.excitement_compass?.principle) {
        basharSection += `\n- Excitement Principle: "${basharData.excitement_compass.principle}"`;
      }

      if (basharData.frequency_alignment?.quick_ritual) {
        basharSection += `\n- Quick Ritual: "${basharData.frequency_alignment.quick_ritual}"`;
      }

      sections.push(basharSection);
    }

    return sections.join('\n\n');
  }

  // NEW: Separate method for building numerology section with proper fallbacks
  private buildNumerologySection(blueprint: LayeredBlueprint): string | null {
    console.log("🔢 Building numerology section. Checking data sources...");
    
    // Try to get numerology from multiple sources with fallbacks
    const numerologyNumbers = [];
    
    // Primary source: coreValuesNarrative
    let lifePath = blueprint.coreValuesNarrative?.lifePath;
    let expressionNumber = blueprint.coreValuesNarrative?.expressionNumber;
    let soulUrgeNumber = blueprint.coreValuesNarrative?.soulUrgeNumber;
    let personalityNumber = blueprint.coreValuesNarrative?.personalityNumber;
    let birthdayNumber = blueprint.coreValuesNarrative?.birthdayNumber;
    
    // Fallback source: user_meta.values_life_path
    const valuesData = blueprint.user_meta?.values_life_path;
    if (!lifePath && valuesData?.life_path_number) {
      lifePath = valuesData.life_path_number;
    }
    if (!expressionNumber && valuesData?.expression_number) {
      expressionNumber = valuesData.expression_number;
    }
    if (!soulUrgeNumber && valuesData?.soul_urge_number) {
      soulUrgeNumber = valuesData.soul_urge_number;
    }
    if (!personalityNumber && valuesData?.personality_number) {
      personalityNumber = valuesData.personality_number;
    }
    if (!birthdayNumber && valuesData?.birthday_number) {
      birthdayNumber = valuesData.birthday_number;
    }

    console.log("🔢 Numerology data found:", {
      lifePath, expressionNumber, soulUrgeNumber, personalityNumber, birthdayNumber
    });

    // Build numerology entries
    if (lifePath && ((typeof lifePath === 'number' && lifePath > 0) || (typeof lifePath === 'string' && parseInt(lifePath, 10) > 0))) {
      const lifePathNum = typeof lifePath === 'string' ? parseInt(lifePath, 10) : lifePath;
      const keyword = this.getLifePathKeyword(lifePathNum);
      numerologyNumbers.push(`Life Path: ${lifePathNum} ("${keyword}")`);
    }

    if (expressionNumber && expressionNumber > 0) {
      const keyword = this.getExpressionKeyword(expressionNumber);
      numerologyNumbers.push(`Expression: ${expressionNumber} ("${keyword}")`);
    }

    if (soulUrgeNumber && soulUrgeNumber > 0) {
      const keyword = this.getSoulUrgeKeyword(soulUrgeNumber);
      numerologyNumbers.push(`Soul Urge: ${soulUrgeNumber} ("${keyword}")`);
    }

    if (personalityNumber && personalityNumber > 0) {
      const keyword = this.getPersonalityKeyword(personalityNumber);
      numerologyNumbers.push(`Personality: ${personalityNumber} ("${keyword}")`);
    }

    if (birthdayNumber && birthdayNumber > 0) {
      const keyword = this.getBirthdayKeyword(birthdayNumber);
      numerologyNumbers.push(`Birthday: ${birthdayNumber} ("${keyword}")`);
    }

    if (numerologyNumbers.length > 0) {
      return `**Numerology:**\n- ${numerologyNumbers.join('\n- ')}`;
    }

    console.log("⚠️ No valid numerology numbers found");
    return null;
  }

  private getCompleteDataSummary(blueprint: LayeredBlueprint): string {
    const summary = [];

    if (blueprint.cognitiveTemperamental?.mbtiType && blueprint.cognitiveTemperamental.mbtiType !== 'Unknown') {
      summary.push(`- MBTI Type: ${blueprint.cognitiveTemperamental.mbtiType}`);
    }

    if (blueprint.energyDecisionStrategy?.humanDesignType && blueprint.energyDecisionStrategy.humanDesignType !== 'Unknown') {
      summary.push(`- Human Design: ${blueprint.energyDecisionStrategy.humanDesignType} with ${blueprint.energyDecisionStrategy.authority || 'Unknown'} Authority`);
    }

    if (blueprint.publicArchetype?.sunSign && blueprint.publicArchetype.sunSign !== 'Unknown') {
      summary.push(`- Sun Sign: ${blueprint.publicArchetype.sunSign}`);
    }

    if (blueprint.publicArchetype?.moonSign && blueprint.publicArchetype.moonSign !== 'Unknown') {
      summary.push(`- Moon Sign: ${blueprint.publicArchetype.moonSign}`);
    }

    const lifePath = blueprint.coreValuesNarrative?.lifePath;
    if (lifePath && ((typeof lifePath === 'number' && lifePath > 0) || (typeof lifePath === 'string' && parseInt(lifePath, 10) > 0))) {
      summary.push(`- Life Path: ${lifePath}`);
    }

    return summary.join('\n');
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

  private getExpressionKeyword(num: number): string {
    const keywords = {
      1: 'Pioneer', 2: 'Diplomat', 3: 'Communicator', 4: 'Organizer', 5: 'Adventurer',
      6: 'Caregiver', 7: 'Analyst', 8: 'Executive', 9: 'Humanitarian'
    };
    return keywords[num as keyof typeof keywords] || 'Unique Expression';
  }

  private getSoulUrgeKeyword(num: number): string {
    const keywords = {
      1: 'Independence', 2: 'Harmony', 3: 'Creativity', 4: 'Stability', 5: 'Freedom',
      6: 'Service', 7: 'Knowledge', 8: 'Achievement', 9: 'Compassion'
    };
    return keywords[num as keyof typeof keywords] || 'Unique Desire';
  }

  private getPersonalityKeyword(num: number): string {
    const keywords = {
      1: 'Strong-willed', 2: 'Gentle', 3: 'Charming', 4: 'Practical', 5: 'Dynamic',
      6: 'Responsible', 7: 'Mysterious', 8: 'Powerful', 9: 'Generous'
    };
    return keywords[num as keyof typeof keywords] || 'Unique Personality';
  }

  private getBirthdayKeyword(num: number): string {
    const keywords = {
      1: 'Independent', 2: 'Cooperative', 3: 'Creative', 4: 'Methodical', 5: 'Versatile',
      6: 'Nurturing', 7: 'Introspective', 8: 'Ambitious', 9: 'Compassionate'
    };
    return keywords[num as keyof typeof keywords] || 'Unique Gift';
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
