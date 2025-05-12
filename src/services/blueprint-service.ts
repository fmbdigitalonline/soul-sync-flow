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
    centers?: Record<string, boolean>; // New: defined centers
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
    life_path_description?: string; // New: more detailed description
    birth_day_number?: number; // New: day number meaning
    birth_day_meaning?: string; // New: meaning of birth day
    personal_year?: number; // New: personal year calculation
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
    aspects?: any[]; // New: planetary aspects
    houses?: Record<string, any>; // New: house placements
    source?: string; // New: source flag to track if data is calculated or default
  };
  archetype_chinese: {
    animal: string;
    element: string;
    yin_yang: string;
    keyword: string;
    element_characteristic?: string; // New: element characteristics
    compatibility?: {best: string[], worst: string[]}; // New: compatibility info
    source?: string; // New: source flag
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
  metadata?: {
    calculation_success: boolean;
    partial_calculation: boolean;
    calculation_errors?: Record<string, string>;
    calculation_date?: string;
    data_sources?: Record<string, string>;
  };
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
    life_path_description: "A seeker of truth and wisdom, always seeking to understand the world around them.",
    birth_day_number: 15,
    birth_day_meaning: "The number 15 represents balance, harmony, and the ability to see the big picture.",
    personal_year: 2023,
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
    rising_sign: "Virgo ♍︎",
    aspects: [
      { planet: "Mercury", sign: "Taurus", aspect: "Conjunction" },
      { planet: "Venus", sign: "Pisces", aspect: "Trine" },
      { planet: "Mars", sign: "Virgo", aspect: "Square" }
    ],
    houses: {
      1: { sign: "Taurus", house: "1st House" },
      2: { sign: "Gemini", house: "2nd House" },
      3: { sign: "Cancer", house: "3rd House" },
      4: { sign: "Leo", house: "4th House" },
      5: { sign: "Virgo", house: "5th House" },
      6: { sign: "Libra", house: "6th House" },
      7: { sign: "Scorpio", house: "7th House" },
      8: { sign: "Sagittarius", house: "8th House" },
      9: { sign: "Capricorn", house: "9th House" },
      10: { sign: "Aquarius", house: "10th House" },
      11: { sign: "Pisces", house: "11th House" },
      12: { sign: "Aries", house: "12th House" }
    }
  },
  archetype_chinese: {
    animal: "Horse",
    element: "Metal",
    yin_yang: "Yang",
    keyword: "Free-spirited Explorer",
    element_characteristic: "Metal is associated with strength, stability, and the ability to withstand challenges.",
    compatibility: {
      best: ["Dragon", "Horse", "Snake"],
      worst: ["Monkey", "Rooster", "Dog"]
    }
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
  async generateBlueprintFromBirthData(userData: BlueprintData['user_meta']): Promise<{ data: BlueprintData | null; error?: string; isPartial?: boolean }> {
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
      
      if (!calcData) {
        console.error('No data returned from calculation service');
        return { data: null, error: 'No data returned from calculation service' };
      }
      
      console.log('Received calculation data:', calcData);
      
      // Check if we got actual calculation results or just the metadata
      const hasRealData = calcData.calculation_metadata?.success || calcData.calculation_metadata?.partial;
      const hasAnyCalculatedData = calcData.westernProfile || calcData.humanDesign || calcData.numerology || calcData.chineseZodiac;
      
      if (!hasAnyCalculatedData) {
        console.error('No calculation results returned, only metadata');
        return { data: null, error: 'Calculation service did not return any usable data' };
      }
      
      // Create the blueprint using the calculation results
      const blueprint: BlueprintData = {
        user_meta: userData,
        cognition_mbti: {
          // For now, use default MBTI data or an API could be added later
          type: "INFJ", // Fixed: removed userData.personality reference
          core_keywords: ["Insightful", "Counselor", "Advocate"],
          dominant_function: "Introverted Intuition (Ni)",
          auxiliary_function: "Extraverted Feeling (Fe)"
        },
        // Use calculated Human Design data if available, otherwise use template
        energy_strategy_human_design: calcData.humanDesign || {
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
          },
          source: "default"
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
        values_life_path: calcData.numerology || {
          life_path_number: 7,
          life_path_keyword: "Seeker of Truth",
          life_path_description: "A seeker of truth and wisdom, always seeking to understand the world around them.",
          birth_day_number: 15,
          birth_day_meaning: "The number 15 represents balance, harmony, and the ability to see the big picture.",
          personal_year: 2023,
          expression_number: 9,
          expression_keyword: "Humanitarian",
          soul_urge_number: 5,
          soul_urge_keyword: "Freedom Seeker",
          personality_number: 4,
          source: "default"
        },
        // Use the calculated Western astrology data
        archetype_western: calcData.westernProfile || {
          sun_sign: "Taurus ♉︎",
          sun_keyword: "Grounded Provider",
          moon_sign: "Pisces ♓︎",
          moon_keyword: "Intuitive Empath",
          rising_sign: "Virgo ♍︎",
          aspects: [
            { planet: "Mercury", sign: "Taurus", aspect: "Conjunction" },
            { planet: "Venus", sign: "Pisces", aspect: "Trine" },
            { planet: "Mars", sign: "Virgo", aspect: "Square" }
          ],
          houses: {
            1: { sign: "Taurus", house: "1st House" },
            2: { sign: "Gemini", house: "2nd House" },
            3: { sign: "Cancer", house: "3rd House" },
            4: { sign: "Leo", house: "4th House" },
            5: { sign: "Virgo", house: "5th House" },
            6: { sign: "Libra", house: "6th House" },
            7: { sign: "Scorpio", house: "7th House" },
            8: { sign: "Sagittarius", house: "8th House" },
            9: { sign: "Capricorn", house: "9th House" },
            10: { sign: "Aquarius", house: "10th House" },
            11: { sign: "Pisces", house: "11th House" },
            12: { sign: "Aries", house: "12th House" }
          },
          source: "default"
        },
        // Use the calculated Chinese zodiac data
        archetype_chinese: calcData.chineseZodiac || {
          animal: "Horse",
          element: "Metal",
          yin_yang: "Yang",
          keyword: "Free-spirited Explorer",
          element_characteristic: "Metal is associated with strength, stability, and the ability to withstand challenges.",
          compatibility: {
            best: ["Dragon", "Horse", "Snake"],
            worst: ["Monkey", "Rooster", "Dog"]
          },
          source: "default"
        },
        timing_overlays: {
          current_transits: [],
          notes: calcData.calculation_metadata?.success ? 
                "Generated using real astronomical calculations" : 
                "Generated using partial calculations and defaults"
        },
        goal_stack: [],
        task_graph: {},
        belief_logs: [],
        excitement_scores: [],
        vibration_check_ins: [],
        // Add metadata to track calculation quality
        metadata: {
          calculation_success: calcData.calculation_metadata?.success || false,
          partial_calculation: calcData.calculation_metadata?.partial || false,
          calculation_errors: calcData.calculation_metadata?.errors,
          calculation_date: calcData.calculation_metadata?.calculated_at || new Date().toISOString(),
          data_sources: {
            western: calcData.westernProfile ? "calculated" : "default",
            chinese: calcData.chineseZodiac ? "calculated" : "default",
            numerology: calcData.numerology ? "calculated" : "default",
            humanDesign: calcData.humanDesign ? "calculated" : "default"
          }
        }
      };
      
      return { 
        data: blueprint, 
        isPartial: calcData.calculation_metadata?.partial || false
      };
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
