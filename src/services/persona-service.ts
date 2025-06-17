
import { supabase } from "@/integrations/supabase/client";

export interface UserPersona {
  id: string;
  user_id: string;
  system_prompt: string;
  voice_tokens: Record<string, any>;
  humor_profile: Record<string, any>;
  function_permissions: string[];
  generated_at: string;
  blueprint_version: string;
  created_at: string;
  updated_at: string;
}

export class PersonaService {
  static async getUserPersona(userId: string): Promise<UserPersona | null> {
    try {
      console.log("🔧 Testing personas table access - attempting to fetch persona for user:", userId);
      
      const { data, error } = await supabase
        .from('personas')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("❌ Personas table access error:", error);
        console.error("❌ Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return null;
      }
      
      if (data) {
        console.log("✅ Personas table access working - found persona for user");
        return data as UserPersona;
      } else {
        console.log("ℹ️ No persona found for user (this is normal for first-time users)");
        return null;
      }
    } catch (error) {
      console.error("❌ PersonaService.getUserPersona error:", error);
      return null;
    }
  }

  static async saveUserPersona(persona: Partial<UserPersona>): Promise<boolean> {
    try {
      console.log("🔧 Testing personas table access - attempting to save persona for user:", persona.user_id);
      
      const { data, error } = await supabase
        .from('personas')
        .upsert({
          user_id: persona.user_id,
          system_prompt: persona.system_prompt,
          voice_tokens: persona.voice_tokens || {},
          humor_profile: persona.humor_profile || {},
          function_permissions: persona.function_permissions || [],
          generated_at: new Date().toISOString(),
          blueprint_version: persona.blueprint_version || '1.0.0'
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();
      
      if (error) {
        console.error("❌ Personas table save error:", error);
        console.error("❌ Save error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return false;
      }
      
      console.log("✅ Personas table save working - persona saved successfully");
      return true;
    } catch (error) {
      console.error("❌ PersonaService.saveUserPersona error:", error);
      return false;
    }
  }

  static async deleteUserPersona(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('personas')
        .delete()
        .eq('user_id', userId);
      
      if (error) {
        console.error("❌ Personas table delete error:", error);
        return false;
      }
      
      console.log("✅ Personas table delete working - persona deleted successfully");
      return true;
    } catch (error) {
      console.error("❌ PersonaService.deleteUserPersona error:", error);
      return false;
    }
  }
}
