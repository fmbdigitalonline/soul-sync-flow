
import { supabase } from '@/integrations/supabase/client';
import { CompiledPersona, VoiceTokens, HumorProfile } from '@/types/personality-modules';

export class PersonaService {
  
  /**
   * Get user's compiled persona from database
   */
  static async getUserPersona(userId: string): Promise<CompiledPersona | null> {
    try {
      const { data, error } = await supabase
        .from('personas')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user persona:', error);
        return null;
      }

      if (!data) {
        console.log('No persona found for user:', userId);
        return null;
      }

      // Type-safe parsing of JSON fields
      const voiceTokens = this.parseVoiceTokens(data.voice_tokens);
      const humorProfile = this.parseHumorProfile(data.humor_profile);
      const functionPermissions = this.parseFunctionPermissions(data.function_permissions);

      return {
        userId: data.user_id,
        systemPrompt: data.system_prompt,
        voiceTokens,
        humorProfile,
        functionPermissions,
        generatedAt: new Date(data.generated_at),
        blueprintVersion: data.blueprint_version
      };
    } catch (error) {
      console.error('Error in getUserPersona:', error);
      return null;
    }
  }

  /**
   * Save compiled persona to database
   */
  static async saveUserPersona(persona: CompiledPersona): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('personas')
        .upsert({
          user_id: persona.userId,
          system_prompt: persona.systemPrompt,
          voice_tokens: persona.voiceTokens as any,
          humor_profile: persona.humorProfile as any,
          function_permissions: persona.functionPermissions as any,
          generated_at: persona.generatedAt.toISOString(),
          blueprint_version: persona.blueprintVersion,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving user persona:', error);
        return false;
      }

      console.log('✅ Persona saved successfully for user:', persona.userId);
      return true;
    } catch (error) {
      console.error('Error in saveUserPersona:', error);
      return false;
    }
  }

  /**
   * Delete user's persona (triggers regeneration)
   */
  static async deleteUserPersona(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('personas')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting user persona:', error);
        return false;
      }

      console.log('✅ Persona deleted for user:', userId);
      return true;
    } catch (error) {
      console.error('Error in deleteUserPersona:', error);
      return false;
    }
  }

  /**
   * Check if user's persona needs regeneration
   */
  static async needsRegeneration(userId: string, currentBlueprintVersion: string): Promise<boolean> {
    try {
      const persona = await this.getUserPersona(userId);
      
      if (!persona) {
        return true; // No persona exists, needs generation
      }

      // Check if blueprint version has changed
      if (persona.blueprintVersion !== currentBlueprintVersion) {
        console.log('Persona needs regeneration due to version mismatch:', {
          stored: persona.blueprintVersion,
          current: currentBlueprintVersion
        });
        return true;
      }

      // Check if persona is older than 7 days (optional refresh)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      if (persona.generatedAt < sevenDaysAgo) {
        console.log('Persona needs regeneration due to age');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking persona regeneration need:', error);
      return true; // Default to regeneration on error
    }
  }

  /**
   * Parse voice tokens from database JSON
   */
  private static parseVoiceTokens(data: any): VoiceTokens {
    if (!data || typeof data !== 'object') {
      return this.getDefaultVoiceTokens();
    }

    try {
      return {
        pacing: data.pacing || this.getDefaultVoiceTokens().pacing,
        expressiveness: data.expressiveness || this.getDefaultVoiceTokens().expressiveness,
        vocabulary: data.vocabulary || this.getDefaultVoiceTokens().vocabulary,
        conversationStyle: data.conversationStyle || this.getDefaultVoiceTokens().conversationStyle,
        signaturePhrases: Array.isArray(data.signaturePhrases) ? data.signaturePhrases : [],
        greetingStyles: Array.isArray(data.greetingStyles) ? data.greetingStyles : [],
        transitionWords: Array.isArray(data.transitionWords) ? data.transitionWords : []
      };
    } catch (error) {
      console.error('Error parsing voice tokens:', error);
      return this.getDefaultVoiceTokens();
    }
  }

  /**
   * Parse humor profile from database JSON
   */
  private static parseHumorProfile(data: any): HumorProfile {
    if (!data || typeof data !== 'object') {
      return this.getDefaultHumorProfile();
    }

    try {
      return {
        primaryStyle: data.primaryStyle || 'warm-nurturer',
        secondaryStyle: data.secondaryStyle,
        intensity: data.intensity || 'moderate',
        appropriatenessLevel: data.appropriatenessLevel || 'balanced',
        contextualAdaptation: data.contextualAdaptation || {
          coaching: 'warm-nurturer',
          guidance: 'philosophical-sage',
          casual: 'playful-storyteller'
        },
        avoidancePatterns: Array.isArray(data.avoidancePatterns) ? data.avoidancePatterns : [],
        signatureElements: Array.isArray(data.signatureElements) ? data.signatureElements : []
      };
    } catch (error) {
      console.error('Error parsing humor profile:', error);
      return this.getDefaultHumorProfile();
    }
  }

  /**
   * Parse function permissions from database JSON
   */
  private static parseFunctionPermissions(data: any): string[] {
    if (Array.isArray(data)) {
      return data.filter(item => typeof item === 'string');
    }
    return [];
  }

  /**
   * Get default voice tokens
   */
  private static getDefaultVoiceTokens(): VoiceTokens {
    return {
      pacing: {
        sentenceLength: 'medium',
        pauseFrequency: 'thoughtful',
        rhythmPattern: 'steady'
      },
      expressiveness: {
        emojiFrequency: 'occasional',
        emphasisStyle: 'subtle',
        exclamationTendency: 'balanced'
      },
      vocabulary: {
        formalityLevel: 'conversational',
        metaphorUsage: 'occasional',
        technicalDepth: 'balanced'
      },
      conversationStyle: {
        questionAsking: 'exploratory',
        responseLength: 'thorough',
        personalSharing: 'relevant'
      },
      signaturePhrases: [],
      greetingStyles: [],
      transitionWords: []
    };
  }

  /**
   * Get default humor profile
   */
  private static getDefaultHumorProfile(): HumorProfile {
    return {
      primaryStyle: 'warm-nurturer',
      intensity: 'moderate',
      appropriatenessLevel: 'balanced',
      contextualAdaptation: {
        coaching: 'warm-nurturer',
        guidance: 'philosophical-sage',
        casual: 'playful-storyteller'
      },
      avoidancePatterns: [],
      signatureElements: []
    };
  }
}
