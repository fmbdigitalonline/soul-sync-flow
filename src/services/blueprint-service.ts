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

      // First, clean up any duplicate active blueprints for this user
      await this.cleanupDuplicateBlueprints(user.id);

      // Now fetch the active blueprint (should be only one)
      const { data, error } = await this.supabase
        .from('blueprints')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
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

  private async cleanupDuplicateBlueprints(userId: string): Promise<void> {
    try {
      // Get all active blueprints for this user, ordered by creation date (newest first)
      const { data: activeBlueprints, error } = await this.supabase
        .from('blueprints')
        .select('id, created_at')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching active blueprints for cleanup:', error);
        return;
      }

      // If there are multiple active blueprints, deactivate all but the newest
      if (activeBlueprints && activeBlueprints.length > 1) {
        console.log(`Found ${activeBlueprints.length} active blueprints for user ${userId}, cleaning up duplicates`);
        
        // Keep the first (newest) one, deactivate the rest
        const blueprintsToDeactivate = activeBlueprints.slice(1).map(bp => bp.id);
        
        const { error: updateError } = await this.supabase
          .from('blueprints')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .in('id', blueprintsToDeactivate);

        if (updateError) {
          console.error('Error deactivating duplicate blueprints:', updateError);
        } else {
          console.log(`Successfully deactivated ${blueprintsToDeactivate.length} duplicate blueprints`);
        }
      }
    } catch (error) {
      console.error('Error in cleanupDuplicateBlueprints:', error);
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

      // Use a transaction-like approach to prevent race conditions
      // First, deactivate any existing active blueprints for this user
      const { error: deactivateError } = await this.supabase
        .from('blueprints')
        .update({ 
          is_active: false, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (deactivateError) {
        console.error('Error deactivating existing blueprints:', deactivateError);
        return { success: false, error: `Error deactivating existing blueprints: ${deactivateError.message}` };
      }

      // Now create the new blueprint as the only active one
      const { data, error } = await this.supabase
        .from('blueprints')
        .insert([{
          ...blueprintData,
          user_id: user.id,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select('*')
        .single();

      if (error) {
        console.error('Error saving blueprint data:', error);
        return { success: false, error: `Error saving blueprint data: ${error.message}` };
      }

      console.log('Successfully saved new blueprint with ID:', data.id);
      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error saving blueprint data:', error);
      return { success: false, error: 'Unexpected error saving blueprint data.' };
    }
  }

  async updateBlueprintRuntimePreferences(preferences: {
    primary_goal: string;
    support_style: number;
    time_horizon: string;
  }): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      console.log('Updating blueprint preferences for user:', user.id);

      // Clean up any duplicates first
      await this.cleanupDuplicateBlueprints(user.id);

      // Get the current active blueprint
      const { data: currentBlueprint, error: fetchError } = await this.supabase
        .from('blueprints')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (fetchError) {
        console.error('Error fetching current blueprint:', fetchError);
        return { success: false, error: `Error fetching current blueprint: ${fetchError.message}` };
      }

      if (!currentBlueprint) {
        return { success: false, error: 'No active blueprint found. Please regenerate your blueprint.' };
      }

      // Create the preferences object to add to goal_stack
      const goalPreference = {
        id: `coaching_preferences_${Date.now()}`,
        type: 'coaching_preferences',
        primary_goal: preferences.primary_goal,
        support_style: preferences.support_style,
        time_horizon: preferences.time_horizon,
        created_at: new Date().toISOString(),
        status: 'active'
      };

      // Update the goal_stack with the coaching preferences
      const updatedGoalStack = [...(currentBlueprint.goal_stack || []), goalPreference];

      // Update the blueprint with the new goal_stack
      const { error } = await this.supabase
        .from('blueprints')
        .update({
          goal_stack: updatedGoalStack,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error('Error updating blueprint with preferences:', error);
        return { success: false, error: `Error updating blueprint preferences: ${error.message}` };
      }

      console.log('Successfully updated blueprint with coaching preferences');
      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error updating runtime preferences:', error);
      return { success: false, error: 'Unexpected error updating runtime preferences.' };
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
