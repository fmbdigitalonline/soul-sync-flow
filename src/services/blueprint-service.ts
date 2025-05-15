import { supabase } from "@/integrations/supabase/client";

// Blueprint template type definition
export type BlueprintData = {
  user_meta: {
    full_name: string;
    preferred_name?: string; // Make preferred_name optional here
    birth_date: string;
    birth_time_local: string;
    birth_location: string;
    timezone: string;
    personality?: string; // Add personality as optional field
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
    engine?: string;
    data_sources?: Record<string, string>;
  };
};

// Define MBTI keyword mappings
const MBTI_DATA: Record<string, {
  core_keywords: string[];
  dominant_function: string;
  auxiliary_function: string;
}> = {
  'INTJ': {
    core_keywords: ["Strategic", "Innovative", "Independent"],
    dominant_function: "Introverted Intuition (Ni)",
    auxiliary_function: "Extraverted Thinking (Te)"
  },
  'INTP': {
    core_keywords: ["Logical", "Conceptual", "Analytical"],
    dominant_function: "Introverted Thinking (Ti)",
    auxiliary_function: "Extraverted Intuition (Ne)"
  },
  'ENTJ': {
    core_keywords: ["Decisive", "Strategic", "Efficient"],
    dominant_function: "Extraverted Thinking (Te)",
    auxiliary_function: "Introverted Intuition (Ni)"
  },
  'ENTP': {
    core_keywords: ["Innovative", "Adaptable", "Debater"],
    dominant_function: "Extraverted Intuition (Ne)",
    auxiliary_function: "Introverted Thinking (Ti)"
  },
  'INFJ': {
    core_keywords: ["Insightful", "Counselor", "Advocate"],
    dominant_function: "Introverted Intuition (Ni)",
    auxiliary_function: "Extraverted Feeling (Fe)"
  },
  'INFP': {
    core_keywords: ["Idealistic", "Empathetic", "Authentic"],
    dominant_function: "Introverted Feeling (Fi)",
    auxiliary_function: "Extraverted Intuition (Ne)"
  },
  'ENFJ': {
    core_keywords: ["Charismatic", "Empathetic", "Inspiring"],
    dominant_function: "Extraverted Feeling (Fe)",
    auxiliary_function: "Introverted Intuition (Ni)"
  },
  'ENFP': {
    core_keywords: ["Enthusiastic", "Creative", "People-oriented"],
    dominant_function: "Extraverted Intuition (Ne)",
    auxiliary_function: "Introverted Feeling (Fi)"
  },
  'ISTJ': {
    core_keywords: ["Organized", "Practical", "Detail-oriented"],
    dominant_function: "Introverted Sensing (Si)",
    auxiliary_function: "Extraverted Thinking (Te)"
  },
  'ISFJ': {
    core_keywords: ["Nurturing", "Reliable", "Traditional"],
    dominant_function: "Introverted Sensing (Si)",
    auxiliary_function: "Extraverted Feeling (Fe)"
  },
  'ESTJ': {
    core_keywords: ["Efficient", "Structured", "Logical"],
    dominant_function: "Extraverted Thinking (Te)",
    auxiliary_function: "Introverted Sensing (Si)"
  },
  'ESFJ': {
    core_keywords: ["Caring", "Social", "Harmonious"],
    dominant_function: "Extraverted Feeling (Fe)",
    auxiliary_function: "Introverted Sensing (Si)"
  },
  'ISTP': {
    core_keywords: ["Practical", "Adaptable", "Analytical"],
    dominant_function: "Introverted Thinking (Ti)",
    auxiliary_function: "Extraverted Sensing (Se)"
  },
  'ISFP': {
    core_keywords: ["Artistic", "Sensitive", "Spontaneous"],
    dominant_function: "Introverted Feeling (Fi)",
    auxiliary_function: "Extraverted Sensing (Se)"
  },
  'ESTP': {
    core_keywords: ["Energetic", "Action-oriented", "Pragmatic"],
    dominant_function: "Extraverted Sensing (Se)",
    auxiliary_function: "Introverted Thinking (Ti)"
  },
  'ESFP': {
    core_keywords: ["Enthusiastic", "Fun-loving", "Spontaneous"],
    dominant_function: "Extraverted Sensing (Se)",
    auxiliary_function: "Introverted Feeling (Fi)"
  }
};

export const blueprintService = {
  /**
   * Generate a blueprint from birth data
   */
  async generateBlueprintFromBirthData(userData: BlueprintData['user_meta'] & { personality?: string }): Promise<{ data: BlueprintData | null; error?: string; isPartial?: boolean }> {
    try {
      console.log('Generating blueprint from birth data:', userData);
      
      // Call the Edge Function to calculate the astrological data
      const { data: calcData, error: calcError } = await supabase.functions.invoke('blueprint-calculator', {
        body: {
          birthData: {
            date: userData.birth_date,
            time: userData.birth_time_local,
            location: userData.birth_location,
            timezone: userData.timezone || "UTC",
            fullName: userData.full_name // Pass the name for numerology calculations
          }
        }
      });
      
      if (calcError) {
        console.error('Error calling blueprint calculator:', calcError);
        throw new Error(`Calculation service error: ${calcError.message}`);
      }
      
      if (!calcData) {
        console.error('No data returned from calculation service');
        throw new Error('No data returned from calculation service');
      }
      
      console.log('Received calculation data:', calcData);
      
      // Get the MBTI data based on the user's selection or fallback to INFJ
      const mbtiType = userData.personality || "INFJ";
      const mbtiData = MBTI_DATA[mbtiType] || MBTI_DATA.INFJ;
      
      // Create the blueprint using the calculation results
      const blueprint: BlueprintData = {
        user_meta: {
          full_name: userData.full_name,
          preferred_name: userData.preferred_name,
          birth_date: userData.birth_date,
          birth_time_local: userData.birth_time_local,
          birth_location: userData.birth_location,
          timezone: userData.timezone || "UTC",
        },
        cognition_mbti: {
          type: mbtiType,
          core_keywords: mbtiData.core_keywords,
          dominant_function: mbtiData.dominant_function,
          auxiliary_function: mbtiData.auxiliary_function
        },
        energy_strategy_human_design: calcData.humanDesign || {
          type: "Unknown",
          profile: "Unknown",
          authority: "Unknown",
          strategy: "Unknown",
          definition: "Unknown",
          not_self_theme: "Unknown",
          life_purpose: "Unknown",
          gates: {
            unconscious_design: [],
            conscious_personality: []
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
        values_life_path: calcData.numerology || {
          life_path_number: 0,
          life_path_keyword: "Unknown",
          expression_number: 0,
          expression_keyword: "Unknown",
          soul_urge_number: 0,
          soul_urge_keyword: "Unknown",
          personality_number: 0
        },
        // Use the calculated Western astrology data
        archetype_western: calcData.westernProfile || {
          sun_sign: "Unknown",
          sun_keyword: "Unknown",
          moon_sign: "Unknown",
          moon_keyword: "Unknown",
          rising_sign: "Unknown"
        },
        // Use the calculated Chinese zodiac data
        archetype_chinese: calcData.chineseZodiac || {
          animal: "Unknown",
          element: "Unknown",
          yin_yang: "Unknown",
          keyword: "Unknown"
        },
        timing_overlays: {
          current_transits: [],
          notes: "Generated using real astronomical calculations"
        },
        goal_stack: [],
        task_graph: {},
        belief_logs: [],
        excitement_scores: [],
        vibration_check_ins: [],
        // Add metadata to track calculation quality and engine used
        metadata: {
          calculation_success: calcData.calculation_metadata?.success || false,
          partial_calculation: calcData.calculation_metadata?.partial || false,
          calculation_errors: calcData.calculation_metadata?.errors,
          calculation_date: calcData.calculation_metadata?.calculated_at || new Date().toISOString(),
          engine: calcData.calculation_metadata?.engine || "unknown",
          data_sources: {
            western: calcData.westernProfile ? "calculated" : "unknown",
            chinese: calcData.chineseZodiac ? "calculated" : "unknown",
            numerology: calcData.numerology ? "calculated" : "unknown",
            humanDesign: calcData.humanDesign ? "calculated" : "unknown"
          }
        }
      };
      
      return { 
        data: blueprint, 
        isPartial: calcData.calculation_metadata?.partial || false
      };
    } catch (err) {
      console.error("Error generating blueprint:", err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : String(err)
      };
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
