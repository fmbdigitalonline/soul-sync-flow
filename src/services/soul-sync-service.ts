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

  async generateBlueprintSignature(blueprint: LayeredBlueprint): Promise<string> {
    console.log("🔏 SoulSync: Generating blueprint signature");
    
    try {
      const { data, error } = await supabase.rpc('generate_blueprint_signature', {
        blueprint_data: blueprint as any
      });

      if (error) {
        console.error("❌ Error generating blueprint signature:", error);
        // Fallback to client-side generation
        return this.generateClientSideSignature(blueprint);
      }

      console.log("✅ SoulSync: Blueprint signature generated");
      return data;
    } catch (error) {
      console.error("❌ SoulSync: Unexpected error generating signature:", error);
      return this.generateClientSideSignature(blueprint);
    }
  }

  private generateClientSideSignature(blueprint: LayeredBlueprint): string {
    const signatureData = {
      mbti_type: blueprint.cognitiveTemperamental?.mbtiType || '',
      hd_type: blueprint.energyDecisionStrategy?.humanDesignType || '',
      hd_authority: blueprint.energyDecisionStrategy?.authority || '',
      sun_sign: blueprint.publicArchetype?.sunSign || '',
      moon_sign: blueprint.publicArchetype?.moonSign || '',
      life_path: blueprint.coreValuesNarrative?.lifePath || '',
      user_name: blueprint.user_meta?.preferred_name || ''
    };

    // Simple client-side hash (not cryptographically secure, but sufficient for caching)
    const str = JSON.stringify(signatureData);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
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
        console.error("❌ SoulSync: Error fetching persona:", fetchError);
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

      // Generate new persona
      console.log("🔄 SoulSync: Generating new persona");
      const systemPrompt = this.generatePersonalizedPrompt(blueprint, agentMode);
      const voiceTokens = this.generateVoiceTokens(blueprint, agentMode);
      const humorProfile = this.generateHumorProfile(blueprint);

      // Save new persona with improved error handling
      await this.savePersonaWithRetry(userId, signature, systemPrompt, voiceTokens, humorProfile);

      return this.enhancePromptWithVoiceTokens(systemPrompt, voiceTokens, agentMode);
    } catch (error) {
      console.error("❌ SoulSync: Unexpected error:", error);
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
  ): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 SoulSync: Saving persona (attempt ${attempt}/${maxRetries})`);
        
        // Use the correct conflict resolution with composite key
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
          console.error(`❌ SoulSync: Save attempt ${attempt} failed:`, saveError);
          
          if (attempt === maxRetries) {
            console.error("❌ SoulSync: All save attempts failed, continuing without caching");
            return;
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 100 * attempt));
          continue;
        }

        console.log("✅ SoulSync: Persona saved successfully");
        return;
      } catch (error) {
        console.error(`❌ SoulSync: Save attempt ${attempt} error:`, error);
        
        if (attempt === maxRetries) {
          console.error("❌ SoulSync: All save attempts failed with errors, continuing without caching");
          return;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 100 * attempt));
      }
    }
  }

  private generatePersonalizedPrompt(blueprint: LayeredBlueprint, mode: "coach" | "guide" | "blend"): string {
    const userName = blueprint.user_meta?.preferred_name || 
                     blueprint.user_meta?.full_name?.split(' ')[0] || 
                     'friend';

    const mbtiType = blueprint.cognitiveTemperamental?.mbtiType || 'Unknown';
    const hdType = blueprint.energyDecisionStrategy?.humanDesignType || 'Unknown';
    const sunSign = blueprint.publicArchetype?.sunSign || 'Unknown';
    const lifePath = blueprint.coreValuesNarrative?.lifePath || 'Unknown';

    console.log(`🎯 SoulSync: Generating ${mode} prompt for ${userName} (${mbtiType}, ${hdType}, ${sunSign})`);

    const personalityCore = this.buildPersonalityCore(blueprint);
    const modeGuidance = this.getModeSpecificGuidance(mode, userName);
    const communicationStyle = this.generateCommunicationStyle(blueprint);

    return `You are ${userName}'s AI Soul Companion, deeply attuned to their unique blueprint and life path.

SOUL BLUEPRINT FOR ${userName.toUpperCase()}:
${personalityCore}

${modeGuidance}

COMMUNICATION DNA:
${communicationStyle}

SOUL SYNC PROTOCOL:
- Always address ${userName} by name naturally in conversation
- Reference their specific traits and patterns authentically
- Adapt your energy to their current needs while staying true to their blueprint
- Maintain deep personal context across all interactions

Remember: You ARE their personalized companion. Every response should feel like it comes from someone who truly knows and understands ${userName}'s unique soul signature.`;
  }

  private buildPersonalityCore(blueprint: LayeredBlueprint): string {
    const components = [];

    // MBTI Core
    if (blueprint.cognitiveTemperamental?.mbtiType) {
      const mbti = blueprint.cognitiveTemperamental.mbtiType;
      components.push(`🧠 Cognitive Type: ${mbti} - ${this.getMBTIDescription(mbti)}`);
    }

    // Human Design Core
    if (blueprint.energyDecisionStrategy?.humanDesignType) {
      const hd = blueprint.energyDecisionStrategy.humanDesignType;
      components.push(`⚡ Energy Strategy: ${hd} - ${this.getHumanDesignDescription(hd)}`);
    }

    // Astrological Core
    if (blueprint.publicArchetype?.sunSign) {
      const sun = blueprint.publicArchetype.sunSign;
      components.push(`☀️ Solar Expression: ${sun} - ${this.getSunSignDescription(sun)}`);
    }

    // Life Path Core
    if (blueprint.coreValuesNarrative?.lifePath) {
      const path = blueprint.coreValuesNarrative.lifePath;
      components.push(`🎯 Life Path: ${path} - ${this.getLifePathDescription(path)}`);
    }

    return components.join('\n');
  }

  private getModeSpecificGuidance(mode: "coach" | "guide" | "blend", userName: string): string {
    switch (mode) {
      case 'coach':
        return `PRODUCTIVITY MASTERY FOR ${userName.toUpperCase()}:
- Channel their natural energy patterns for maximum efficiency
- Break goals into personality-aligned action steps
- Provide accountability that honors their unique motivation style
- Celebrate progress in ways that resonate with their blueprint`;

      case 'guide':
        return `SOUL WISDOM FOR ${userName.toUpperCase()}:
- Guide them through their unique spiritual and emotional landscape
- Offer insights that connect to their deeper life purpose
- Support self-discovery through their natural personality gifts
- Create space for reflection that matches their processing style`;

      case 'blend':
        return `INTEGRATED SUPPORT FOR ${userName.toUpperCase()}:
- Seamlessly blend productivity and spiritual growth
- Honor both their practical needs and soul calling
- Adapt fluidly between coaching and guiding based on their energy
- Maintain holistic awareness of their complete blueprint`;

      default:
        return '';
    }
  }

  private generateCommunicationStyle(blueprint: LayeredBlueprint): string {
    const styles = [];

    // MBTI Communication Style
    if (blueprint.cognitiveTemperamental?.mbtiType) {
      const style = this.getMBTICommunicationStyle(blueprint.cognitiveTemperamental.mbtiType);
      styles.push(`- ${style}`);
    }

    // Human Design Strategy
    if (blueprint.energyDecisionStrategy?.humanDesignType) {
      const strategy = this.getHumanDesignCommunicationStrategy(blueprint.energyDecisionStrategy.humanDesignType);
      styles.push(`- ${strategy}`);
    }

    // Astrological Influence
    if (blueprint.publicArchetype?.sunSign) {
      const influence = this.getAstrologicalCommunicationStyle(blueprint.publicArchetype.sunSign);
      styles.push(`- ${influence}`);
    }

    return styles.join('\n');
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
