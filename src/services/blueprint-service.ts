
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
    engine?: string;
    data_sources?: Record<string, string>;
  };
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
            timezone: userData.timezone,
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
      
      // Create fallback data in case calculations partially fail
      const fallbackData = this.createFallbackBlueprintData(userData);
      
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
        energy_strategy_human_design: calcData.humanDesign || fallbackData.energy_strategy_human_design,
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
        values_life_path: calcData.numerology || fallbackData.values_life_path,
        // Use the calculated Western astrology data
        archetype_western: calcData.westernProfile || fallbackData.archetype_western,
        // Use the calculated Chinese zodiac data
        archetype_chinese: calcData.chineseZodiac || fallbackData.archetype_chinese,
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
      // Create default data so the UI can still work
      const fallbackData = this.createFallbackBlueprintData(userData);
      return { 
        data: fallbackData, 
        error: err instanceof Error ? err.message : String(err),
        isPartial: true
      };
    }
  },
  
  /**
   * Create fallback blueprint data when calculations fail
   */
  createFallbackBlueprintData(userData: BlueprintData['user_meta']): BlueprintData {
    const birthDate = new Date(userData.birth_date);
    const month = birthDate.getMonth() + 1; // JavaScript months are 0-indexed
    const day = birthDate.getDate();
    
    // Simple sun sign calculation based on dates
    const sunSign = this.getSimpleSunSign(month, day);
    
    return {
      user_meta: userData,
      cognition_mbti: {
        type: "INFJ", // Default
        core_keywords: ["Insightful", "Counselor", "Advocate"],
        dominant_function: "Introverted Intuition (Ni)",
        auxiliary_function: "Extraverted Feeling (Fe)"
      },
      energy_strategy_human_design: {
        type: "Generator",
        profile: "3/5",
        authority: "Emotional",
        strategy: "Wait to respond",
        definition: "Split",
        not_self_theme: "Frustration",
        life_purpose: "Find satisfaction through responding to life",
        gates: {
          unconscious_design: [],
          conscious_personality: []
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
        life_path_keyword: "Seeker",
        expression_number: 7,
        expression_keyword: "Analytical Mind",
        soul_urge_number: 7,
        soul_urge_keyword: "Inner Wisdom",
        personality_number: 7
      },
      archetype_western: {
        sun_sign: sunSign.name,
        sun_keyword: sunSign.keyword,
        moon_sign: "Unknown",
        moon_keyword: "Unknown",
        rising_sign: "Unknown",
        aspects: [],
        houses: {},
        source: "default"
      },
      archetype_chinese: {
        animal: "Unknown",
        element: "Unknown",
        yin_yang: "Unknown",
        keyword: "Unknown"
      },
      timing_overlays: {
        current_transits: [],
        notes: "Generated using fallback data"
      },
      goal_stack: [],
      task_graph: {},
      belief_logs: [],
      excitement_scores: [],
      vibration_check_ins: [],
      metadata: {
        calculation_success: false,
        partial_calculation: true,
        calculation_errors: {
          general: "Used fallback data due to calculation error"
        },
        calculation_date: new Date().toISOString(),
        engine: "fallback",
        data_sources: {
          western: "default",
          chinese: "default",
          numerology: "default",
          humanDesign: "default"
        }
      }
    };
  },
  
  /**
   * Get a simplified sun sign based on month and day
   */
  getSimpleSunSign(month: number, day: number) {
    const signs = [
      { name: "Capricorn", dates: [[1, 1], [1, 19]], keyword: "Ambitious Achiever" },
      { name: "Aquarius", dates: [[1, 20], [2, 18]], keyword: "Revolutionary Visionary" },
      { name: "Pisces", dates: [[2, 19], [3, 20]], keyword: "Compassionate Dreamer" },
      { name: "Aries", dates: [[3, 21], [4, 19]], keyword: "Pioneer" },
      { name: "Taurus", dates: [[4, 20], [5, 20]], keyword: "Grounded Provider" },
      { name: "Gemini", dates: [[5, 21], [6, 20]], keyword: "Communicator" },
      { name: "Cancer", dates: [[6, 21], [7, 22]], keyword: "Nurturer" },
      { name: "Leo", dates: [[7, 23], [8, 22]], keyword: "Creative Leader" },
      { name: "Virgo", dates: [[8, 23], [9, 22]], keyword: "Analytical Perfectionist" },
      { name: "Libra", dates: [[9, 23], [10, 22]], keyword: "Harmonizer" },
      { name: "Scorpio", dates: [[10, 23], [11, 21]], keyword: "Intense Transformer" },
      { name: "Sagittarius", dates: [[11, 22], [12, 21]], keyword: "Adventurous Seeker" },
      { name: "Capricorn", dates: [[12, 22], [12, 31]], keyword: "Ambitious Achiever" }
    ];
    
    for (const sign of signs) {
      const [[startMonth, startDay], [endMonth, endDay]] = sign.dates;
      if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
        return sign;
      }
    }
    
    return { name: "Unknown", keyword: "Unknown" };
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
