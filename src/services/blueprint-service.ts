
import { supabase } from "@/integrations/supabase/client";

// Blueprint template type definition
export type BlueprintData = {
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
    gates: {
      unconscious_design: string[];
      conscious_personality: string[];
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
  values_life_path: {
    life_path_number: number;
    life_path_keyword: string;
    expression_number: number;
    expression_keyword: string;
    soul_urge_number: number;
    soul_urge_keyword: string;
    personality_number: number;
  };
  archetype_western: {
    sun_sign: string;
    sun_keyword: string;
    moon_sign: string;
    moon_keyword: string;
    rising_sign: string;
  };
  archetype_chinese: {
    animal: string;
    element: string;
    yin_yang: string;
    keyword: string;
  };
  timing_overlays: {
    current_transits: any[];
    notes: string;
  };
  goal_stack: any[];
  task_graph: Record<string, any>;
  belief_logs: any[];
  excitement_scores: any[];
  vibration_check_ins: any[];
};

// Default blueprint data as example
export const defaultBlueprintData: BlueprintData = {
  user_meta: {
    full_name: "Sarah Johnson",
    preferred_name: "Sarah",
    birth_date: "1990-05-15",
    birth_time_local: "14:30",
    birth_location: "San Francisco, USA",
    timezone: "America/Los_Angeles"
  },
  cognition_mbti: {
    type: "INFJ",
    core_keywords: ["Insightful", "Counselor", "Advocate"],
    dominant_function: "Introverted Intuition (Ni)",
    auxiliary_function: "Extraverted Feeling (Fe)"
  },
  energy_strategy_human_design: {
    type: "Projector",
    profile: "4/6 (Opportunist/Role Model)",
    authority: "Emotional",
    strategy: "Wait for the invitation",
    definition: "Split",
    not_self_theme: "Frustration",
    life_purpose: "Guide others with emotional wisdom",
    gates: {
      unconscious_design: ["16.5", "20.3", "57.2", "34.6"],
      conscious_personality: ["11.4", "48.3", "39.5", "41.1"]
    }
  },
  bashar_suite: {
    belief_interface: {
      principle: "What you believe is what you experience as reality",
      reframe_prompt: "What would I have to believe to experience this?"
    },
    excitement_compass: {
      principle: "Follow your highest excitement in the moment to the best of your ability"
    },
    frequency_alignment: {
      quick_ritual: "Visualize feeling the way you want to feel for 17 seconds"
    }
  },
  values_life_path: {
    life_path_number: 7,
    life_path_keyword: "Seeker of Truth",
    expression_number: 9,
    expression_keyword: "Humanitarian",
    soul_urge_number: 5,
    soul_urge_keyword: "Freedom Seeker",
    personality_number: 4
  },
  archetype_western: {
    sun_sign: "Taurus ♉︎",
    sun_keyword: "Grounded Provider",
    moon_sign: "Pisces ♓︎",
    moon_keyword: "Intuitive Empath",
    rising_sign: "Virgo ♍︎"
  },
  archetype_chinese: {
    animal: "Horse",
    element: "Metal",
    yin_yang: "Yang",
    keyword: "Free-spirited Explorer"
  },
  timing_overlays: {
    current_transits: [],
    notes: "To be populated dynamically"
  },
  goal_stack: [],
  task_graph: {},
  belief_logs: [],
  excitement_scores: [],
  vibration_check_ins: []
};

export const blueprintService = {
  /**
   * Generate a blueprint from birth data
   */
  async generateBlueprintFromBirthData(userData: BlueprintData['user_meta']): Promise<{ data: BlueprintData | null; error?: string }> {
    try {
      console.log('Generating blueprint from birth data:', userData);
      
      // Call the Edge Function to calculate the astrological data
      const { data: calcData, error: calcError } = await supabase.functions.invoke('blueprint-calculator', {
        body: {
          birthData: {
            date: userData.birth_date,
            time: userData.birth_time_local,
            location: userData.birth_location,
            timezone: userData.timezone
          }
        }
      });
      
      if (calcError) {
        console.error('Error calling blueprint calculator:', calcError);
        return { data: null, error: `Calculation service error: ${calcError.message}` };
      }
      
      console.log('Received calculation data:', calcData);
      
      // Create the blueprint using the calculation results
      const blueprint: BlueprintData = {
        user_meta: userData,
        cognition_mbti: {
          // For now, use default MBTI data or an API could be added later
          type: "INFJ",
          core_keywords: ["Insightful", "Counselor", "Advocate"],
          dominant_function: "Introverted Intuition (Ni)",
          auxiliary_function: "Extraverted Feeling (Fe)"
        },
        energy_strategy_human_design: {
          // This would come from a Human Design calculation API
          type: "Projector",
          profile: "4/6 (Opportunist/Role Model)",
          authority: "Emotional",
          strategy: "Wait for the invitation",
          definition: "Split",
          not_self_theme: "Frustration",
          life_purpose: "Guide others with emotional wisdom",
          gates: {
            unconscious_design: ["16.5", "20.3", "57.2", "34.6"],
            conscious_personality: ["11.4", "48.3", "39.5", "41.1"]
          }
        },
        bashar_suite: {
          // Static data for now
          belief_interface: {
            principle: "What you believe is what you experience as reality",
            reframe_prompt: "What would I have to believe to experience this?"
          },
          excitement_compass: {
            principle: "Follow your highest excitement in the moment to the best of your ability"
          },
          frequency_alignment: {
            quick_ritual: "Visualize feeling the way you want to feel for 17 seconds"
          }
        },
        // Use the calculated numerology data
        values_life_path: calcData.numerology,
        // Use the calculated Western astrology data
        archetype_western: calcData.westernProfile,
        // Use the calculated Chinese zodiac data
        archetype_chinese: calcData.chineseZodiac,
        timing_overlays: {
          current_transits: [],
          notes: "Generated using real astronomical calculations"
        },
        goal_stack: [],
        task_graph: {},
        belief_logs: [],
        excitement_scores: [],
        vibration_check_ins: []
      };
      
      return { data: blueprint };
    } catch (err) {
      console.error("Error generating blueprint:", err);
      return { data: null, error: err instanceof Error ? err.message : String(err) };
    }
  },
  
  /**
   * Save a blueprint to Supabase for the current user
   */
  async saveBlueprintData(blueprint: BlueprintData): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user || !user.user) {
        return { success: false, error: "User not authenticated" };
      }
      
      // First set all existing blueprints to inactive
      await supabase
        .from('user_blueprints')
        .update({ is_active: false })
        .eq('user_id', user.user.id);
        
      // Then insert the new active blueprint
      const { error } = await supabase
        .from('user_blueprints')
        .insert({
          user_id: user.user.id,
          blueprint: blueprint,
          is_active: true
        });
        
      if (error) {
        console.error("Error saving blueprint:", error);
        return { success: false, error: error.message };
      }
      
      console.log("Blueprint saved successfully");
      return { success: true };
    } catch (err) {
      console.error("Error saving blueprint:", err);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  },
  
  /**
   * Get the active blueprint for the current user
   */
  async getActiveBlueprintData(): Promise<{ data: BlueprintData | null; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user || !user.user) {
        return { data: null, error: "User not authenticated" };
      }
      
      const { data, error } = await supabase
        .from('user_blueprints')
        .select('blueprint')
        .eq('user_id', user.user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') { // No rows returned error
          return { data: null };
        }
        return { data: null, error: error.message };
      }
      
      return { data: data.blueprint as BlueprintData };
    } catch (err) {
      console.error("Error getting blueprint:", err);
      return { data: null, error: err instanceof Error ? err.message : String(err) };
    }
  },
  
  /**
   * Update an existing blueprint
   */
  async updateBlueprintData(id: string, blueprint: Partial<BlueprintData>): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user || !user.user) {
        return { success: false, error: "User not authenticated" };
      }
      
      const { error } = await supabase
        .from('user_blueprints')
        .update({
          blueprint: blueprint,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.user.id);
        
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (err) {
      console.error("Error updating blueprint:", err);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }
};
