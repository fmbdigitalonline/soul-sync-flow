import { SupabaseClient } from '@supabase/supabase-js';
import { NumerologyCalculator } from './numerology-calculator';

export interface BlueprintData {
  id: string;
  user_id: string;
  user_meta: {
    full_name: string;
    preferred_name?: string;
    birth_date: string;
    birth_time_local: string;
    birth_location: string;
    timezone: string;
    personality?: string;
  };
  metadata: {
    engine: string;
    data_sources: {
      western: string;
      chinese: string;
      numerology: string;
      humanDesign: string;
    };
    calculation_date: string;
    calculation_success: boolean;
    partial_calculation: boolean;
  };
  archetype_western: {
    sun_sign: string;
    moon_sign: string;
    rising_sign: string;
    sun_keyword: string;
    moon_keyword: string;
    source: string;
    houses: Record<string, any>;
    aspects: any[];
  };
  archetype_chinese: {
    animal: string;
    element: string;
    yin_yang: string;
    keyword: string;
    year: number;
  };
  values_life_path: {
    lifePathNumber: number;
    expressionNumber: number;
    soulUrgeNumber: number;
    birthdayNumber: number;
    birthDay: number;
    birthMonth: number;
    birthYear: number;
    lifePathKeyword?: string;
    expressionKeyword?: string;
    soulUrgeKeyword?: string;
    birthdayKeyword?: string;
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
      unconscious_design: any[];
      conscious_personality: any[];
    };
    centers: Record<string, any>;
    metadata: Record<string, any>;
  };
  cognition_mbti: {
    type: string;
    core_keywords: string[];
    dominant_function: string;
    auxiliary_function: string;
  };
  bashar_suite: {
    excitement_compass: {
      principle: string;
    };
    belief_interface: {
      principle: string;
      reframe_prompt: string;
    };
    frequency_alignment: {
      quick_ritual: string;
    };
  };
  timing_overlays: {
    current_transits: any[];
    notes: string;
  };
  goal_stack: any[];
  task_graph: Record<string, any>;
  excitement_scores: any[];
  vibration_check_ins: any[];
  belief_logs: any[];
  runtime_preferences?: {
    primary_goal: string;
    support_style: number;
    time_horizon: string;
  };
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface BlueprintServiceParams {
  supabase: SupabaseClient;
}

class BlueprintService {
  private supabase: SupabaseClient;

  constructor(params: BlueprintServiceParams) {
    this.supabase = params.supabase;
  }

  async getActiveBlueprintData(): Promise<{ data: BlueprintData | null; error: string | null }> {
    try {
      // Get current user first
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await this.supabase
        .from('blueprints')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .maybeSingle();

      if (error) {
        console.error('Error fetching active blueprint:', error);
        return { data: null, error: `Error fetching active blueprint: ${error.message}` };
      }

      return { data: data as BlueprintData, error: null };
    } catch (error) {
      console.error('Unexpected error fetching active blueprint:', error);
      return { data: null, error: 'Unexpected error fetching active blueprint.' };
    }
  }

  async saveBlueprintData(blueprintData: BlueprintData): Promise<{ success: boolean; error: string | null }> {
    try {
      // Get current user
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        console.error('User not authenticated when trying to save blueprint');
        return { success: false, error: 'User not authenticated. Please sign in to save your blueprint.' };
      }

      // Check if user already has an active blueprint
      const { data: existingBlueprint, error: existingError } = await this.supabase
        .from('blueprints')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (existingError) {
        console.error('Error checking for existing blueprint:', existingError);
        return { success: false, error: `Error checking for existing blueprint: ${existingError.message}` };
      }

      if (existingBlueprint) {
        console.log('User already has an active blueprint, updating existing one');
        
        // Update the existing blueprint
        const { error: updateError } = await this.supabase
          .from('blueprints')
          .update({
            ...blueprintData,
            user_id: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingBlueprint.id);

        if (updateError) {
          console.error('Error updating blueprint:', updateError);
          return { success: false, error: `Error updating blueprint: ${updateError.message}` };
        }

        return { success: true, error: null };
      }

      // Create new blueprint
      const { data, error } = await this.supabase
        .from('blueprints')
        .insert([{
          ...blueprintData,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select('*');

      if (error) {
        console.error('Error saving blueprint data:', error);
        return { success: false, error: `Error saving blueprint data: ${error.message}` };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error saving blueprint data:', error);
      return { success: false, error: 'Unexpected error saving blueprint data.' };
    }
  }

  async generateBlueprintFromBirthData(userData: {
    full_name: string;
    preferred_name?: string;
    birth_date: string;
    birth_time_local: string;
    birth_location: string;
    timezone: string;
    personality?: string;
  }): Promise<{ data: BlueprintData | null; error: string | null; isPartial: boolean }> {
    try {
      console.log('Calling blueprint calculator with user data:', userData);

      // Call the Supabase function with the correct field names (direct fields, not wrapped)
      const { data, error } = await this.supabase.functions.invoke('blueprint-calculator', {
        body: {
          birthDate: userData.birth_date,
          birthTime: userData.birth_time_local,
          birthLocation: userData.birth_location,
          timezone: userData.timezone
        }
      });

      if (error) {
        console.error('Error from blueprint calculator function:', error);
        return { 
          data: null, 
          error: `Blueprint calculation failed: ${error.message || 'Unknown error'}`,
          isPartial: false
        };
      }

      if (!data?.success) {
        console.error('Blueprint calculator returned unsuccessful result:', data);
        return { 
          data: null, 
          error: data?.error || 'Blueprint calculation was not successful',
          isPartial: false
        };
      }

      console.log('Blueprint calculator returned data:', data);

      // Calculate numerology using the proper calculator
      const numerologyResult = NumerologyCalculator.calculateNumerology(userData.full_name, userData.birth_date);

      // Transform the response into our BlueprintData format
      const blueprint: BlueprintData = {
        id: crypto.randomUUID(),
        user_id: '', // Will be set when saving
        user_meta: {
          full_name: userData.full_name,
          preferred_name: userData.preferred_name || userData.full_name.split(' ')[0],
          birth_date: userData.birth_date,
          birth_time_local: userData.birth_time_local,
          birth_location: userData.birth_location,
          timezone: userData.timezone,
          personality: userData.personality
        },
        metadata: data.data?.calculation_metadata || {
          engine: data.source || 'unknown',
          data_sources: {
            western: 'calculated',
            chinese: 'calculated',
            numerology: 'calculated',
            humanDesign: 'calculated'
          },
          calculation_date: new Date().toISOString(),
          calculation_success: true,
          partial_calculation: data.data?.calculation_metadata?.partial || false
        },
        archetype_western: data.data?.westernProfile ? {
          sun_sign: data.data.westernProfile.sun_sign || 'Unknown',
          moon_sign: data.data.westernProfile.moon_sign || 'Unknown', 
          rising_sign: data.data.westernProfile.rising_sign || 'Unknown',
          sun_keyword: data.data.westernProfile.sun_keyword || 'Unknown',
          moon_keyword: data.data.westernProfile.moon_keyword || 'Unknown',
          source: data.data.westernProfile.source || 'calculated',
          houses: {},
          aspects: []
        } : {
          sun_sign: 'Unknown',
          moon_sign: 'Unknown',
          rising_sign: 'Unknown',
          sun_keyword: 'Unknown',
          moon_keyword: 'Unknown',
          source: 'fallback',
          houses: {},
          aspects: []
        },
        archetype_chinese: data.data?.chineseZodiac || {
          animal: 'Unknown',
          element: 'Unknown',
          yin_yang: 'Unknown',
          keyword: 'Unknown',
          year: new Date(userData.birth_date).getFullYear()
        },
        values_life_path: {
          lifePathNumber: numerologyResult.lifePathNumber,
          expressionNumber: numerologyResult.expressionNumber,
          soulUrgeNumber: numerologyResult.soulUrgeNumber,
          birthdayNumber: numerologyResult.birthdayNumber,
          birthDay: new Date(userData.birth_date).getDate(),
          birthMonth: new Date(userData.birth_date).getMonth() + 1,
          birthYear: new Date(userData.birth_date).getFullYear(),
          lifePathKeyword: numerologyResult.lifePathKeyword,
          expressionKeyword: numerologyResult.expressionKeyword,
          soulUrgeKeyword: numerologyResult.soulUrgeKeyword,
          birthdayKeyword: numerologyResult.birthdayKeyword
        },
        energy_strategy_human_design: data.data?.humanDesign || {
          type: 'Generator',
          profile: '1/3',
          authority: 'Sacral',
          strategy: 'To Respond',
          definition: 'Single',
          not_self_theme: 'Frustration',
          life_purpose: 'To find satisfaction through responding',
          gates: {
            unconscious_design: [],
            conscious_personality: []
          },
          centers: {},
          metadata: {}
        },
        cognition_mbti: {
          type: userData.personality || 'INFJ',
          core_keywords: this.getMBTIKeywords(userData.personality || 'INFJ'),
          dominant_function: this.getDominantFunction(userData.personality || 'INFJ'),
          auxiliary_function: this.getAuxiliaryFunction(userData.personality || 'INFJ')
        },
        bashar_suite: {
          excitement_compass: {
            principle: "Follow your highest excitement in the moment to the best of your ability"
          },
          belief_interface: {
            principle: "What you believe is what you experience as reality",
            reframe_prompt: "What would I have to believe to experience this?"
          },
          frequency_alignment: {
            quick_ritual: "Visualize feeling the way you want to feel for 17 seconds"
          }
        },
        timing_overlays: {
          current_transits: [],
          notes: data.notice || "Generated using available calculation methods"
        },
        goal_stack: [],
        task_graph: {},
        excitement_scores: [],
        vibration_check_ins: [],
        belief_logs: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      };

      const isPartial = data.data?.calculation_metadata?.partial || false;
      
      return { 
        data: blueprint, 
        error: null,
        isPartial
      };

    } catch (error) {
      console.error('Error in generateBlueprintFromBirthData:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        isPartial: false
      };
    }
  }

  private getMBTIKeywords(type: string): string[] {
    const keywords: { [key: string]: string[] } = {
      INFJ: ['Insightful', 'Idealistic', 'Compassionate'],
      ENFP: ['Enthusiastic', 'Imaginative', 'Charismatic'],
      // Add keywords for other MBTI types as needed
    };
    return keywords[type] || ['Generic', 'Placeholder'];
  }

  private getDominantFunction(type: string): string {
    const functions: { [key: string]: string } = {
      INFJ: 'Introverted Intuition (Ni)',
      ENFP: 'Extroverted Intuition (Ne)',
      // Add dominant functions for other MBTI types
    };
    return functions[type] || 'Undefined';
  }

  private getAuxiliaryFunction(type: string): string {
    const functions: { [key: string]: string } = {
      INFJ: 'Extroverted Feeling (Fe)',
      ENFP: 'Introverted Feeling (Fi)',
      // Add auxiliary functions for other MBTI types
    };
    return functions[type] || 'Undefined';
  }
}

// Create and export a singleton instance
import { supabase } from '@/integrations/supabase/client';
export const blueprintService = new BlueprintService({ supabase });
export default BlueprintService;
