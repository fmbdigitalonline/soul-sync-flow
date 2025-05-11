
import { supabaseClient } from "@/integrations/supabase/client";
import { BlueprintData, UserData } from "./blueprint-service";

/**
 * Service to interact with the Python-based Blueprint Engine
 */
export const pythonBlueprintService = {
  /**
   * Generate a blueprint using the Python-based engine
   */
  async generateBlueprint(userData: UserData): Promise<{
    success: boolean;
    blueprint?: BlueprintData;
    error?: string;
    rawResponse?: any;
  }> {
    try {
      console.log("Generating blueprint with Python engine...", userData);
      
      // Call the Supabase Edge Function that wraps our Python code
      const { data, error } = await supabaseClient.functions.invoke("python-blueprint-engine", {
        body: userData
      });
      
      if (error) {
        console.error("Error calling Python blueprint engine:", error);
        return {
          success: false,
          error: error.message,
          rawResponse: error
        };
      }
      
      if (!data || data.error) {
        console.error("Python blueprint engine returned an error:", data?.error);
        return {
          success: false,
          error: data?.error || "Unknown error",
          rawResponse: data
        };
      }
      
      // Transform the Python engine output to match our blueprint structure
      const blueprint: BlueprintData = {
        user_meta: {
          full_name: userData.full_name,
          preferred_name: userData.preferred_name || userData.full_name.split(" ")[0],
          birth_date: userData.birth_date,
          birth_time_local: userData.birth_time_local,
          birth_location: userData.birth_location
        },
        // Map the Python facts to our blueprint structure
        cognition_mbti: {
          type: data.facts.mbti || "Unknown",
          description: ""
        },
        energy_strategy_human_design: {
          type: data.facts.human_design.type,
          strategy: data.facts.human_design.strategy,
          authority: data.facts.human_design.authority,
          profile: data.facts.human_design.profile,
          definition: data.facts.human_design.definition,
          incarnation_cross: data.facts.human_design.incarnation_cross,
        },
        archetype_western: {
          sun_sign: data.facts.western.sun_sign,
          moon_sign: data.facts.western.moon_sign,
          rising_sign: data.facts.western.ascendant_sign,
          description: ""
        },
        archetype_chinese: {
          animal: data.facts.chinese.animal,
          element: data.facts.chinese.element,
          yin_yang: data.facts.chinese.yin_yang,
          description: ""
        },
        values_life_path: {
          life_path_number: data.facts.numerology.life_path,
          description: ""
        },
        // Add the narrative from GPT
        raw_content: data.narrative,
        needs_parsing: true,
        // Store metadata
        _meta: {
          generation_method: "python-engine",
          generation_date: new Date().toISOString(),
          raw_response: data,
          error: data.error || null
        }
      };
      
      return {
        success: true,
        blueprint,
        rawResponse: data
      };
    } catch (error) {
      console.error("Exception in Python blueprint service:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        rawResponse: error
      };
    }
  },
};
