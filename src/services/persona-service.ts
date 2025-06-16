
import { supabase } from '@/integrations/supabase/client';
import { CompiledPersona } from '@/types/personality-modules';

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

      return {
        userId: data.user_id,
        systemPrompt: data.system_prompt,
        voiceTokens: data.voice_tokens,
        humorProfile: data.humor_profile,
        functionPermissions: data.function_permissions,
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
          voice_tokens: persona.voiceTokens,
          humor_profile: persona.humorProfile,
          function_permissions: persona.functionPermissions,
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
}
