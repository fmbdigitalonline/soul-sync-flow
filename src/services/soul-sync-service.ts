import { supabase } from "@/integrations/supabase/client";
import { LayeredBlueprint, VoiceToken } from "@/types/personality-modules";

const TEMPLATE_VERSION = "1.0.0";

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

  // Enhanced prompt generation with natural conversation focus
  private generatePersonalizedPrompt(blueprint: LayeredBlueprint, mode: "coach" | "guide" | "blend"): string {
    const userName = blueprint.user_meta?.preferred_name || 
                     blueprint.user_meta?.full_name?.split(' ')[0] || 
                     'friend';

    const mbtiType = blueprint.cognitiveTemperamental?.mbtiType || 'Unknown';
    const hdType = blueprint.energyDecisionStrategy?.humanDesignType || 'Unknown';
    const sunSign = blueprint.publicArchetype?.sunSign || 'Unknown';
    const lifePath = blueprint.coreValuesNarrative?.lifePath || 'Unknown';

    console.log(`🎯 SoulSync: Generating natural ${mode} prompt for ${userName} (${mbtiType}, ${hdType}, ${sunSign}, LP:${lifePath})`);

    const personalityContext = this.buildPersonalityContext(blueprint);
    const conversationGuidelines = this.getConversationGuidelines(mode, userName);
    const clarificationRule = this.getClarificationRule(userName);

    return `You are ${userName}'s AI companion, deeply attuned to who they are at their core. You know ${userName} as someone who is ${mbtiType}, ${hdType}, ${sunSign}, with a Life Path ${lifePath}.

PERSONALITY CONTEXT:
${personalityContext}

${conversationGuidelines}

CONVERSATION APPROACH:
- Respond naturally and conversationally to whatever ${userName} shares with you
- Listen first, understand their current situation, then offer insights
- Reference their personality traits only when it adds genuine value to the conversation
- Ask thoughtful follow-up questions when you need clarification
- Be their reflective companion who helps them align with their authentic self

${clarificationRule}

IMPORTANT: Your goal is to be genuinely helpful and personally relevant, not to demonstrate knowledge about their blueprint. Use their personality information to understand and support them better, not to lecture about it.

Remember: Every response should feel like it comes from someone who truly knows and cares about ${userName}.`;
  }

  private buildPersonalityContext(blueprint: LayeredBlueprint): string {
    const context = [];

    // MBTI Context
    if (blueprint.cognitiveTemperamental?.mbtiType) {
      const mbti = blueprint.cognitiveTemperamental.mbtiType;
      context.push(`🧠 ${mbti}: ${this.getMBTIContext(mbti)}`);
    }

    // Human Design Context
    if (blueprint.energyDecisionStrategy?.humanDesignType) {
      const hd = blueprint.energyDecisionStrategy.humanDesignType;
      context.push(`⚡ ${hd}: ${this.getHumanDesignContext(hd)}`);
    }

    // Astrological Context
    if (blueprint.publicArchetype?.sunSign) {
      const sun = blueprint.publicArchetype.sunSign;
      context.push(`☀️ ${sun}: ${this.getAstrologyContext(sun)}`);
    }

    // Life Path Context
    if (blueprint.coreValuesNarrative?.lifePath) {
      const path = blueprint.coreValuesNarrative.lifePath;
      // Fixed: Ensure path is converted to number
      const pathNumber = typeof path === 'string' ? parseInt(path, 10) : path;
      context.push(`🎯 Life Path ${pathNumber}: ${this.getLifePathContext(pathNumber)}`);
    }

    return context.join('\n');
  }

  private getConversationGuidelines(mode: "coach" | "guide" | "blend", userName: string): string {
    switch (mode) {
      case 'coach':
        return `ROLE: Productivity Coach
You help ${userName} achieve their goals through practical action steps and accountability. Focus on what they want to accomplish and how their natural traits can support their productivity. When they're stuck, help them break through with personalized strategies.`;

      case 'guide':
        return `ROLE: Personal Growth Guide
You help ${userName} navigate life's deeper questions and challenges. Focus on self-understanding, relationships, and life meaning. Use their blueprint to offer insights about patterns and growth opportunities.`;

      case 'blend':
        return `ROLE: Integrated Companion
You're ${userName}'s versatile companion who adapts to what they need most. Whether they want practical productivity help or deeper life guidance, you meet them where they are and support their whole journey.`;

      default:
        return '';
    }
  }

  private getClarificationRule(userName: string): string {
    return `CLARIFICATION RULE:
When ${userName} asks vague questions like "help me" or "what should I do", don't immediately ask what they mean. Instead:
1. Acknowledge their request warmly
2. Offer 2-3 specific areas you could help with based on their situation
3. Let them choose or clarify what resonates

Example: "I'm here to support you! Are you looking for help with productivity and getting things done, or are you navigating something more personal like relationships or life direction? Or maybe something else entirely?"`;
  }

  // Simplified context methods
  private getMBTIContext(type: string): string {
    const contexts = {
      'INFP': 'Values authenticity, needs meaning in their work, processes internally',
      'ENFP': 'Thrives on possibilities, energized by people, needs variety',
      'INFJ': 'Seeks purpose, intuitive about others, needs alone time to recharge',
      'ENFJ': 'Natural helper, reads people well, motivated by growth'
    };
    return contexts[type as keyof typeof contexts] || 'Unique cognitive approach to life';
  }

  private getHumanDesignContext(type: string): string {
    const contexts = {
      'Generator': 'Sustainable energy when following excitement, designed to respond',
      'Projector': 'Natural guide, needs invitation and recognition, masters of systems',
      'Manifestor': 'Independent initiator, designed to inform before acting',
      'Reflector': 'Wise observer, needs time for clarity, samples energy around them'
    };
    return contexts[type as keyof typeof contexts] || 'Unique energy signature';
  }

  private getAstrologyContext(sign: string): string {
    const contexts = {
      'Cancer': 'Nurturing, emotionally intuitive, values home and security',
      'Leo': 'Creative, generous, needs appreciation and self-expression',
      'Virgo': 'Detail-oriented, service-minded, seeks improvement and efficiency'
    };
    return contexts[sign as keyof typeof contexts] || 'Unique solar expression';
  }

  private getLifePathContext(path: number): string {
    const contexts = {
      1: 'Natural leader, pioneering spirit, learns independence',
      2: 'Cooperative nature, diplomatic, learns partnership',
      3: 'Creative expression, communication gifts, learns authentic self-expression',
      4: 'Builder of foundations, systematic approach, learns stability',
      5: 'Freedom seeker, adventurous, learns constructive use of freedom'
    };
    return contexts[path as keyof typeof contexts] || 'Unique life purpose';
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

  // Personality description methods
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

  private getHumanDesignDescription(type: string): string {
    const descriptions: { [key: string]: string } = {
      'Generator': 'Sustainable life force responding to what lights you up',
      'Projector': 'Natural guide waiting for recognition and invitation',
      'Manifestor': 'Powerful initiator informing before taking action',
      'Reflector': 'Wise mirror sampling life and waiting for clarity'
    };
    return descriptions[type] || 'Unique energy signature';
  }

  private getSunSignDescription(sign: string): string {
    const descriptions: { [key: string]: string } = {
      'Aries': 'Bold pioneer blazing new trails',
      'Taurus': 'Steady builder creating lasting beauty',
      'Gemini': 'Curious communicator connecting ideas',
      'Cancer': 'Nurturing protector honoring emotional depths'
    };
    return descriptions[sign] || 'Unique solar essence';
  }

  private getLifePathDescription(path: number | string): string {
    const descriptions: { [key: string]: string } = {
      '1': 'Independent leader pioneering new paths',
      '2': 'Diplomatic collaborator building bridges',
      '3': 'Creative expresser sharing joy and inspiration',
      '4': 'Systematic builder creating stable foundations',
      '5': 'Freedom-loving adventurer exploring possibilities'
    };
    return descriptions[path.toString()] || 'Unique life purpose';
  }

  private getMBTICommunicationStyle(type: string): string {
    if (type.includes('E')) return 'Energetic and expressive communication';
    if (type.includes('I')) return 'Thoughtful and reflective dialogue';
    return 'Balanced communication approach';
  }

  private getHumanDesignCommunicationStrategy(type: string): string {
    const strategies: { [key: string]: string } = {
      'Generator': 'Respond from gut feeling and authentic excitement',
      'Projector': 'Share wisdom when recognized and invited',
      'Manifestor': 'Inform others before initiating communication',
      'Reflector': 'Reflect the energy of the conversation environment'
    };
    return strategies[type] || 'Natural communication flow';
  }

  private getAstrologicalCommunicationStyle(sign: string): string {
    const styles: { [key: string]: string } = {
      'Cancer': 'Emotionally attuned and nurturing language',
      'Leo': 'Warm, generous, and confident expression',
      'Virgo': 'Precise, helpful, and detail-oriented communication'
    };
    return styles[sign] || 'Authentic astrological expression';
  }
}

export const soulSyncService = SoulSyncService.getInstance();
