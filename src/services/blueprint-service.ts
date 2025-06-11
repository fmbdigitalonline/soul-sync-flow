
import { supabase } from "@/integrations/supabase/client";
import { PersonalityFusionService } from "./personality-fusion-service";
import { PersonalityProfile } from "@/types/personality-fusion";

export interface UserProfile {
  full_name: string;
  preferred_name?: string; // Make this optional
  birth_date: string;
  birth_time_local: string;
  birth_location: string;
  timezone: string;
  personality?: string;
  user_id?: string;
}

export interface BlueprintData {
  id?: string;
  user_id?: string; // Add user_id property
  user_meta: UserProfile;
  astrology: any;
  human_design: any;
  numerology: any;
  mbti: any;
  goal_stack: any;
  metadata: any;
  personality?: any;
  // Legacy property names for backward compatibility
  archetype_western?: any;
  archetype_chinese?: any;
  values_life_path?: any;
  energy_strategy_human_design?: any;
  cognition_mbti?: any;
  bashar_suite?: any;
  timing_overlays?: any;
}

export interface BlueprintDataResult {
  data: BlueprintData | null;
  error: string | null;
  isPartial?: boolean;
}

class BlueprintService {
  async getActiveBlueprintData(): Promise<BlueprintDataResult> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return { data: null, error: "User not authenticated" };
      }

      // First, deactivate all blueprints for this user except the most recent one
      await this.ensureSingleActiveBlueprint(user.id);

      // Now fetch the single active blueprint
      const { data, error } = await supabase
        .from('user_blueprints')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // Use maybeSingle instead of single to handle no results gracefully

      if (error) {
        console.error("Error fetching active blueprint:", error);
        return { data: null, error: error.message };
      }

      if (!data) {
        console.log("No active blueprint found for user.");
        return { data: null, error: "No active blueprint found." };
      }

      console.log("Active blueprint data:", data);
      return { data: data.blueprint as unknown as BlueprintData, error: null };
    } catch (error) {
      console.error("Unexpected error fetching active blueprint:", error);
      return { data: null, error: "Unexpected error occurred." };
    }
  }

  private async ensureSingleActiveBlueprint(userId: string): Promise<void> {
    try {
      // Get all active blueprints for this user, ordered by most recent first
      const { data: activeBlueprints, error } = await supabase
        .from('user_blueprints')
        .select('id, updated_at')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error || !activeBlueprints || activeBlueprints.length <= 1) {
        // No error needed if there's 0 or 1 active blueprint
        return;
      }

      // If there are multiple active blueprints, deactivate all except the most recent one
      const blueprintsToDeactivate = activeBlueprints.slice(1); // Keep the first (most recent), deactivate the rest
      
      if (blueprintsToDeactivate.length > 0) {
        const idsToDeactivate = blueprintsToDeactivate.map(bp => bp.id);
        
        const { error: updateError } = await supabase
          .from('user_blueprints')
          .update({ is_active: false })
          .in('id', idsToDeactivate);

        if (updateError) {
          console.error("Error deactivating duplicate blueprints:", updateError);
        } else {
          console.log(`Deactivated ${blueprintsToDeactivate.length} duplicate active blueprints`);
        }
      }
    } catch (error) {
      console.error("Error ensuring single active blueprint:", error);
    }
  }

  async generateBlueprintFromBirthData(userProfile: UserProfile): Promise<BlueprintDataResult> {
    try {
      console.log("Generating blueprint from birth data:", userProfile);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return { data: null, error: "User not authenticated" };
      }

      // Ensure preferred_name has a fallback
      const profileWithDefaults = {
        ...userProfile,
        preferred_name: userProfile.preferred_name || userProfile.full_name.split(' ')[0],
        user_id: user.id
      };

      // For now, return a mock blueprint structure with the expected properties
      const mockBlueprint: BlueprintData = {
        user_meta: profileWithDefaults,
        astrology: {},
        human_design: {},
        numerology: {},
        mbti: {},
        goal_stack: {},
        metadata: {
          calculation_success: false,
          partial_calculation: true,
          calculation_date: new Date().toISOString(),
          engine: "mock_generator",
          data_sources: { western: "template" }
        },
        // Legacy property names for backward compatibility
        archetype_western: {
          sun_sign: "Gemini",
          sun_keyword: "Communication",
          moon_sign: "Cancer",
          moon_keyword: "Nurturing",
          rising_sign: "Leo",
          source: "template"
        },
        archetype_chinese: {
          animal: "Dragon",
          element: "Wood",
          yin_yang: "Yang",
          keyword: "Powerful"
        },
        values_life_path: {
          lifePathNumber: 7,
          lifePathKeyword: "Seeker",
          expressionNumber: 5,
          expressionKeyword: "Freedom",
          soulUrgeNumber: 3,
          soulUrgeKeyword: "Creative",
          birthdayNumber: 15,
          birthdayKeyword: "Healer"
        },
        energy_strategy_human_design: {
          type: "Generator",
          profile: "2/4",
          authority: "Sacral",
          strategy: "Respond",
          definition: "Single",
          not_self_theme: "Frustration",
          life_purpose: "To find satisfaction through right work",
          gates: {
            conscious_personality: [],
            unconscious_design: []
          },
          centers: {}
        },
        cognition_mbti: {
          type: "ENFP",
          core_keywords: ["Enthusiastic", "Creative", "Inspiring"],
          dominant_function: "Extraverted Intuition",
          auxiliary_function: "Introverted Feeling"
        },
        bashar_suite: {
          excitement_compass: {
            principle: "Follow your highest excitement with no expectation of the outcome"
          },
          belief_interface: {
            principle: "Beliefs create reality",
            reframe_prompt: "What would I rather believe?"
          },
          frequency_alignment: {
            quick_ritual: "Take 3 deep breaths and feel gratitude"
          }
        },
        timing_overlays: {}
      };

      return {
        data: mockBlueprint,
        error: null,
        isPartial: true
      };
    } catch (error) {
      console.error("Error generating blueprint:", error);
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        isPartial: false
      };
    }
  }

  async updateBlueprintRuntimePreferences(preferences: {
    primary_goal: string;
    support_style: number;
    time_horizon: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return { success: false, error: "User not authenticated" };
      }

      // Get the most recent blueprint for this user (whether active or not)
      const { data: blueprint, error: fetchError } = await supabase
        .from('user_blueprints')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching blueprint for preferences update:", fetchError);
        return { success: false, error: fetchError.message };
      }

      if (!blueprint || !blueprint.blueprint) {
        console.error("No blueprint found for user when updating preferences");
        return { success: false, error: "No blueprint found for this user" };
      }

      // Update the blueprint data with new preferences - safely cast the JSON to BlueprintData
      const currentBlueprintData = (blueprint.blueprint as unknown) as BlueprintData;
      const updatedBlueprintData = {
        ...currentBlueprintData,
        goal_stack: {
          primary_goal: preferences.primary_goal,
          support_style: preferences.support_style,
          time_horizon: preferences.time_horizon
        }
      };

      // Update the existing blueprint record - cast back to JSON for storage
      const { error: updateError } = await supabase
        .from('user_blueprints')
        .update({
          blueprint: updatedBlueprintData as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', blueprint.id);

      if (updateError) {
        console.error("Error updating blueprint with preferences:", updateError);
        return { success: false, error: updateError.message };
      }

      console.log("Blueprint preferences updated successfully");
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

      // First deactivate any existing active blueprints for this user
      await this.ensureSingleActiveBlueprint(blueprintData.user_meta.user_id);

      // Now insert the new blueprint
      const { data, error } = await supabase
        .from('user_blueprints')
        .insert({
          user_id: blueprintData.user_meta.user_id,
          blueprint: blueprintData as any, // Cast to any for JSON compatibility
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
