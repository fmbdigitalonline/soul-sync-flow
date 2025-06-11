import { supabase } from "@/integrations/supabase/client";
import { PersonalityFusionService } from "./personality-fusion-service";
import { PersonalityProfile } from "@/types/personality-fusion";

export interface UserProfile {
  full_name: string;
  preferred_name: string;
  birth_date: string;
  birth_time_local: string;
  birth_location: string;
  timezone: string;
  personality?: string;
  user_id?: string;
}

export interface BlueprintData {
  id?: string;
  user_meta: UserProfile;
  astrology: any;
  human_design: any;
  numerology: any;
  mbti: any;
  goal_stack: any;
  metadata: any;
  personality?: any;
}

export interface BlueprintDataResult {
  data: BlueprintData | null;
  error: string | null;
}

class BlueprintService {
  async getActiveBlueprintData(): Promise<BlueprintDataResult> {
    try {
      const { data, error } = await supabase
        .from('user_blueprints')
        .select('*')
        .eq('user_id', supabase.auth.currentUser?.id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error("Error fetching active blueprint:", error);
        return { data: null, error: error.message };
      }

      if (!data) {
        console.log("No active blueprint found for user.");
        return { data: null, error: "No active blueprint found." };
      }

      console.log("Active blueprint data:", data);
      return { data: data.blueprint as BlueprintData, error: null };
    } catch (error) {
      console.error("Unexpected error fetching active blueprint:", error);
      return { data: null, error: "Unexpected error occurred." };
    }
  }

  async updateBlueprintRuntimePreferences(preferences: {
    primary_goal: string;
    support_style: number;
    time_horizon: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: blueprintData, error: blueprintError } = await this.getActiveBlueprintData();

      if (blueprintError || !blueprintData) {
        console.error("Error fetching active blueprint:", blueprintError);
        return { success: false, error: blueprintError || "No active blueprint found." };
      }

      // Update the goal_stack with the new preferences
      blueprintData.goal_stack = {
        primary_goal: preferences.primary_goal,
        support_style: preferences.support_style,
        time_horizon: preferences.time_horizon
      };

      // Save the updated blueprint data
      const saveResult = await this.saveBlueprintData(blueprintData);

      if (!saveResult.success) {
        console.error("Error saving updated blueprint:", saveResult.error);
        return { success: false, error: saveResult.error };
      }

      return { success: true };
    } catch (error) {
      console.error("Unexpected error updating blueprint preferences:", error);
      return { success: false, error: "Unexpected error occurred." };
    }
  }

  async saveBlueprintData(blueprintData: BlueprintData): Promise<{ success: boolean; error?: string }> {
    try {
      if (!blueprintData.user_meta?.user_id) {
        return { success: false, error: "User ID is required" };
      }

      console.log("Saving blueprint data:", blueprintData);

      const { data, error } = await supabase
        .from('user_blueprints')
        .upsert({
          user_id: blueprintData.user_meta.user_id,
          blueprint: blueprintData,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase error saving blueprint:", error);
        return { success: false, error: error.message };
      }

      // Save personality profile if it exists
      if (blueprintData.personality && typeof blueprintData.personality === 'object' && 'bigFive' in blueprintData.personality) {
        const personalityResult = await PersonalityFusionService.savePersonalityProfile(
          data.id,
          blueprintData.personality as PersonalityProfile
        );
        
        if (!personalityResult.success) {
          console.warn("Failed to save personality profile:", personalityResult.error);
          // Don't fail the whole operation
        }
      }

      console.log("Blueprint saved successfully:", data);
      return { success: true };

    } catch (error) {
      console.error("Unexpected error saving blueprint:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      };
    }
  }

  async deleteBlueprintData(blueprintId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_blueprints')
        .delete()
        .eq('id', blueprintId);

      if (error) {
        console.error("Error deleting blueprint:", error);
        return { success: false, error: error.message };
      }

      console.log(`Blueprint with ID ${blueprintId} deleted successfully.`);
      return { success: true };
    } catch (error) {
      console.error("Unexpected error deleting blueprint:", error);
      return { success: false, error: "Unexpected error occurred." };
    }
  }
}

export const blueprintService = new BlueprintService();
