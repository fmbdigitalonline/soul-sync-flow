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
    sun_dates?: string; // Add this property
    sun_element?: string; // Add this property
    sun_qualities?: string; // Add this property
    moon_sign: string;
    moon_keyword: string;
    moon_element?: string; // Add this property
    rising_sign: string;
    aspects?: any[]; // New: planetary aspects
    houses?: Record<string, any>; // New: house placements
  };
  archetype_chinese: {
    animal: string;
    element: string;
    yin_yang: string;
    keyword: string;
    element_characteristic?: string; // New: element characteristics
    personality_profile?: string; // Add this property
    compatibility?: {best: string[], worst: string[]}; // New: compatibility info
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
  _meta?: Record<string, any>; // Added metadata field for debugging
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
    sun_dates: "2023-01-01",
    sun_element: "Earth",
    sun_qualities: "Stable, Reliable",
    moon_sign: "Pisces ♓︎",
    moon_keyword: "Intuitive Empath",
    moon_element: "Water",
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
    personality_profile: "A strong and confident individual with a sense of purpose.",
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
  async generateBlueprintFromBirthData(userData: BlueprintData['user_meta']): Promise<{ data: BlueprintData | null; error?: string }> {
    try {
      console.log('Generating blueprint from birth data:', userData);
      
      // Call the research-based Blueprint Generator Edge Function
      const { data: researchData, error: researchError } = await supabase.functions.invoke('research-blueprint-generator', {
        body: {
          birthData: {
            date: userData.birth_date,
            time: userData.birth_time_local,
            location: userData.birth_location,
            timezone: userData.timezone,
            name: userData.full_name
          }
        }
      });
      
      if (researchError) {
        console.error('Error calling research-based blueprint generator:', researchError);
        
        // Fall back to the calculation-based approach if research-based fails
        console.log('Falling back to calculation-based blueprint generator');
        return await this.fallbackToCalculationBasedGenerator(userData);
      }
      
      if (!researchData || !researchData.data) {
        console.error('No data received from research-based blueprint generator');
        console.log('Using default blueprint with user data');
        
        // Create a default blueprint with the user's data
        const defaultBlueprint = {
          ...defaultBlueprintData,
          user_meta: userData
        };
        
        return { data: defaultBlueprint };
      }
      
      console.log('Received research-based blueprint data');
      
      // Use the research-generated blueprint
      const blueprint = researchData.data;
      
      // Ensure the user_meta data is correctly set
      blueprint.user_meta = userData;
      
      // Validate and ensure all required sections exist with reasonable values
      this.validateBlueprintCompleteness(blueprint);
      
      return { data: blueprint };
    } catch (err) {
      console.error("Error generating blueprint:", err);
      
      // Create a default blueprint with the user's data
      const defaultBlueprint = {
        ...defaultBlueprintData,
        user_meta: userData
      };
      
      return { 
        data: defaultBlueprint, 
        error: `Error generating blueprint: ${err instanceof Error ? err.message : String(err)}. Using default data instead.` 
      };
    }
  },
  
  /**
   * Validate and ensure all required sections of the blueprint are present
   */
  validateBlueprintCompleteness(blueprint: any) {
    if (!blueprint) return;
    
    // Check and ensure MBTI data is present
    if (!blueprint.cognition_mbti || typeof blueprint.cognition_mbti !== 'object') {
      blueprint.cognition_mbti = defaultBlueprintData.cognition_mbti;
    } else {
      // Ensure required MBTI fields
      if (!blueprint.cognition_mbti.type) blueprint.cognition_mbti.type = defaultBlueprintData.cognition_mbti.type;
      if (!Array.isArray(blueprint.cognition_mbti.core_keywords)) {
        blueprint.cognition_mbti.core_keywords = defaultBlueprintData.cognition_mbti.core_keywords;
      }
      if (!blueprint.cognition_mbti.dominant_function) {
        blueprint.cognition_mbti.dominant_function = defaultBlueprintData.cognition_mbti.dominant_function;
      }
      if (!blueprint.cognition_mbti.auxiliary_function) {
        blueprint.cognition_mbti.auxiliary_function = defaultBlueprintData.cognition_mbti.auxiliary_function;
      }
    }
    
    // Check and ensure Human Design data is present
    if (!blueprint.energy_strategy_human_design || typeof blueprint.energy_strategy_human_design !== 'object') {
      blueprint.energy_strategy_human_design = defaultBlueprintData.energy_strategy_human_design;
    } else {
      // Ensure gates are arrays
      if (!blueprint.energy_strategy_human_design.gates || typeof blueprint.energy_strategy_human_design.gates !== 'object') {
        blueprint.energy_strategy_human_design.gates = defaultBlueprintData.energy_strategy_human_design.gates;
      } else {
        if (!Array.isArray(blueprint.energy_strategy_human_design.gates.unconscious_design)) {
          blueprint.energy_strategy_human_design.gates.unconscious_design = 
            defaultBlueprintData.energy_strategy_human_design.gates.unconscious_design;
        }
        if (!Array.isArray(blueprint.energy_strategy_human_design.gates.conscious_personality)) {
          blueprint.energy_strategy_human_design.gates.conscious_personality = 
            defaultBlueprintData.energy_strategy_human_design.gates.conscious_personality;
        }
      }
    }
    
    // Ensure other sections exist
    if (!blueprint.bashar_suite || typeof blueprint.bashar_suite !== 'object') {
      blueprint.bashar_suite = defaultBlueprintData.bashar_suite;
    }
    
    if (!blueprint.values_life_path || typeof blueprint.values_life_path !== 'object') {
      blueprint.values_life_path = defaultBlueprintData.values_life_path;
    }
    
    if (!blueprint.archetype_western || typeof blueprint.archetype_western !== 'object') {
      blueprint.archetype_western = defaultBlueprintData.archetype_western;
    }
    
    if (!blueprint.archetype_chinese || typeof blueprint.archetype_chinese !== 'object') {
      blueprint.archetype_chinese = defaultBlueprintData.archetype_chinese;
    }
    
    // Ensure arrays and objects for tracking data
    blueprint.goal_stack = blueprint.goal_stack || [];
    blueprint.task_graph = blueprint.task_graph || {};
    blueprint.belief_logs = blueprint.belief_logs || [];
    blueprint.excitement_scores = blueprint.excitement_scores || [];
    blueprint.vibration_check_ins = blueprint.vibration_check_ins || [];
  },
  
  /**
   * Fallback to the original calculation-based generator if research-based fails
   */
  async fallbackToCalculationBasedGenerator(userData) {
    try {
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
          notes: "Generated using astronomical calculations"
        },
        goal_stack: [],
        task_graph: {},
        belief_logs: [],
        excitement_scores: [],
        vibration_check_ins: []
      };
      
      return { data: blueprint };
    } catch (err) {
      console.error("Error in fallback blueprint generation:", err);
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
