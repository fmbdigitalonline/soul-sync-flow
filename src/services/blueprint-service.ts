
import { supabase } from "@/integrations/supabase/client";

export type BlueprintData = {
  _meta: {
    generation_method: string;
    model_version: string;
    generation_date: string;
    birth_data: any;
    schema_version: string;
    raw_response?: string; // Add raw response field to metadata
  };
  user_meta: {
    full_name: string;
    preferred_name: string;
    birth_date: string;
    birth_time_local: string;
    birth_location: string;
    timezone: string;
  };
  cognition_mbti: {
    type: string;
    core_keywords: string[];
    dominant_function: string;
    auxiliary_function: string;
  };
  energy_strategy_human_design: {
    type: string;
    profile: string;
    authority: string;
    strategy: string;
    definition: string;
    not_self_theme: string;
    life_purpose: string;
    centers: {
      root: boolean;
      sacral: boolean;
      spleen: boolean;
      solar_plexus: boolean;
      heart: boolean;
      throat: boolean;
      ajna: boolean;
      head: boolean;
      g: boolean;
    };
    gates: {
      unconscious_design: string[];
      conscious_personality: string[];
    };
  };
  values_life_path: {
    life_path_number: number;
    life_path_keyword: string;
    life_path_description: string;
    birth_day_number: number;
    birth_day_meaning: string;
    personal_year: number;
    expression_number: number;
    expression_keyword: string;
    soul_urge_number: number;
    soul_urge_keyword: string;
    personality_number: number;
  };
  archetype_western: {
    sun_sign: string;
    sun_keyword: string;
    sun_dates: string;
    sun_element: string;
    sun_qualities: string;
    moon_sign: string;
    moon_keyword: string;
    moon_element: string;
    rising_sign: string;
    aspects: {
      planet: string;
      aspect: string;
      planet2: string;
      orb: string;
    }[];
    houses: {
      [house: string]: {
        sign: string;
        house: string;
      };
    };
  };
  archetype_chinese: {
    animal: string;
    element: string;
    yin_yang: string;
    keyword: string;
    element_characteristic: string;
    personality_profile: string;
    compatibility: {
      best: string[];
      worst: string[];
    };
  };
  bashar_suite: {
    belief_interface: {
      principle: string;
      reframe_prompt: string;
    };
    excitement_compass: {
      principle: string;
    };
    frequency_alignment: {
      quick_ritual: string;
    };
  };
  timing_overlays: any;
  goal_stack: any[];
  task_graph: any;
  belief_logs: any[];
  excitement_scores: any[];
  vibration_check_ins: any[];
};

export const defaultBlueprintData: BlueprintData = {
  _meta: {
    generation_method: "default",
    model_version: "N/A",
    generation_date: new Date().toISOString(),
    birth_data: {},
    schema_version: "1.0",
  },
  user_meta: {
    full_name: "Default User",
    preferred_name: "User",
    birth_date: "1990-01-01",
    birth_time_local: "12:00",
    birth_location: "New York, NY",
    timezone: "America/New_York",
  },
  cognition_mbti: {
    type: "INFJ",
    core_keywords: ["Insightful", "Intuitive", "Compassionate"],
    dominant_function: "Introverted Intuition (Ni)",
    auxiliary_function: "Extraverted Feeling (Fe)",
  },
  energy_strategy_human_design: {
    type: "Generator",
    profile: "3/5 (Martyr/Heretic)",
    authority: "Sacral",
    strategy: "To Respond",
    definition: "Single Definition",
    not_self_theme: "Frustration",
    life_purpose: "Finding satisfaction through response",
    centers: {
      root: false,
      sacral: true,
      spleen: false,
      solar_plexus: false,
      heart: false,
      throat: false,
      ajna: false,
      head: false,
      g: false,
    },
    gates: {
      unconscious_design: ["34.3", "10.1", "57.4", "44.2"],
      conscious_personality: ["20.5", "57.2", "51.6", "27.4"],
    },
  },
  values_life_path: {
    life_path_number: 7,
    life_path_keyword: "Seeker",
    life_path_description: "Focused on analysis, research, and spiritual understanding.",
    birth_day_number: 1,
    birth_day_meaning: "Independent and innovative",
    personal_year: 2024,
    expression_number: 9,
    expression_keyword: "Humanitarian",
    soul_urge_number: 5,
    soul_urge_keyword: "Freedom Seeker",
    personality_number: 4,
  },
  archetype_western: {
    sun_sign: "Capricorn ♑︎",
    sun_keyword: "Disciplined",
    sun_dates: "December 22 - January 19",
    sun_element: "Earth",
    sun_qualities: "Cardinal, Practical, Grounded",
    moon_sign: "Virgo ♍︎",
    moon_keyword: "Analytical",
    moon_element: "Earth",
    rising_sign: "Taurus ♉︎",
    aspects: [
      { planet: "Sun", aspect: "Conjunction", planet2: "Mercury", orb: "3°" },
      { planet: "Moon", aspect: "Trine", planet2: "Venus", orb: "4°" },
    ],
    houses: {
      "1": { sign: "Taurus", house: "1st House" },
      "2": { sign: "Gemini", house: "2nd House" },
    },
  },
  archetype_chinese: {
    animal: "Dragon",
    element: "Earth",
    yin_yang: "Yang",
    keyword: "Charismatic",
    element_characteristic: "Stable, nurturing, and reliable",
    personality_profile: "Confident, enthusiastic, and natural leaders",
    compatibility: {
      best: ["Rat", "Monkey", "Rooster"],
      worst: ["Dog", "Rabbit", "Ox"],
    },
  },
  bashar_suite: {
    belief_interface: {
      principle: "What you believe is what you experience as reality",
      reframe_prompt: "What would I have to believe to experience this?",
    },
    excitement_compass: {
      principle: "Follow your highest excitement in the moment to the best of your ability",
    },
    frequency_alignment: {
      quick_ritual: "Visualize feeling the way you want to feel for 17 seconds",
    },
  },
  timing_overlays: {
    current_transits: [],
    notes: "Generated using default data",
  },
  goal_stack: [],
  task_graph: {},
  belief_logs: [],
  excitement_scores: [],
  vibration_check_ins: [],
};

export const blueprintService = {
  async getActiveBlueprintData(): Promise<{ data: BlueprintData | null; error: string | null; rawResponse?: any }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        return { data: null, error: "No authenticated user" };
      }

      const { data, error } = await supabase
        .from("user_blueprints")
        .select("*")
        .eq("user_id", userData.user.id)
        .eq("is_active", true)
        .single();

      if (error) {
        console.error("Error fetching active blueprint:", error);
        return { data: null, error: error.message };
      }

      if (!data) {
        return { data: null, error: "No active blueprint found" };
      }

      return { 
        data: data.blueprint as BlueprintData, 
        error: null,
        rawResponse: data.blueprint._meta?.raw_response || null  // Return raw response if available
      };
    } catch (error) {
      console.error("Error in getActiveBlueprintData:", error);
      return { data: null, error: error instanceof Error ? error.message : String(error) };
    }
  },

  async saveBlueprintData(blueprintData: BlueprintData): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        return { success: false, error: "No authenticated user" };
      }

      // Check if a blueprint already exists for this user
      const { data: existingBlueprint, error: selectError } = await supabase
        .from("user_blueprints")
        .select("*")
        .eq("user_id", userData.user.id)
        .eq("is_active", true)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error("Error checking existing blueprint:", selectError);
        return { success: false, error: "Failed to check existing blueprint" };
      }

      if (existingBlueprint) {
        // Update existing blueprint
        const { error: updateError } = await supabase
          .from("user_blueprints")
          .update({ 
            blueprint: blueprintData, 
            updated_at: new Date().toISOString() 
          })
          .eq("user_id", userData.user.id)
          .eq("is_active", true);

        if (updateError) {
          console.error("Error updating blueprint:", updateError);
          return { success: false, error: "Failed to update blueprint" };
        }
      } else {
        // Create new blueprint
        const { error: insertError } = await supabase
          .from("user_blueprints")
          .insert([{
            user_id: userData.user.id,
            is_active: true,
            blueprint: blueprintData
          }]);

        if (insertError) {
          console.error("Error creating blueprint:", insertError);
          return { success: false, error: "Failed to create blueprint" };
        }
      }

      return { success: true };
    } catch (error) {
      console.error("Error saving blueprint:", error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  },

  /**
   * Generate a blueprint from birth data using the research-based edge function
   * @param birthData User birth information
   * @param debugMode Enable to get raw responses
   */
  async generateBlueprintFromBirthData(
    birthData: Partial<BlueprintData['user_meta']>,
    debugMode = false
  ): Promise<{ data: BlueprintData | null; error: string | null; rawResponse?: any }> {
    try {
      console.log("Generating blueprint using research-based approach");
      console.log("Birth data:", birthData);

      // Call the research-based generator edge function
      const { data, error } = await supabase.functions.invoke(
        "research-blueprint-generator",
        {
          body: { 
            birthData,
            debugMode: true  // Always request raw response
          }
        }
      );

      if (error) {
        console.error("Error in research blueprint generator:", error);
        return { 
          data: null, 
          error: `Generation error: ${error.message || error}`,
          rawResponse: data?.rawResponse 
        };
      }

      if (!data?.success || !data?.data) {
        console.error("Invalid response from generator:", data);
        return { 
          data: null, 
          error: data?.error || "Invalid response from generator",
          rawResponse: data?.rawResponse
        };
      }

      // Ensure the raw response is stored in the blueprint's metadata
      if (data.rawResponse && data.data) {
        // Fix: Check if data.data is an object and then check/create _meta property
        if (typeof data.data === 'object' && data.data !== null) {
          if (!data.data._meta) {
            data.data._meta = {};
          }
          data.data._meta.raw_response = data.rawResponse;
        }
      }

      console.log("Blueprint successfully generated");
      return { 
        data: data.data as BlueprintData, 
        error: null,
        rawResponse: data.rawResponse 
      };
    } catch (error) {
      console.error("Error generating blueprint:", error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : String(error),
        rawResponse: undefined
      };
    }
  },
};
