
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { sampleBlueprints } from './blueprint-examples';
import { Json } from '@/integrations/supabase/types';

// Blueprint data structure
export interface UserMetaData {
  full_name: string;
  preferred_name?: string;
  birth_date: string;
  birth_time_local?: string;
  birth_location?: string;
  timezone?: string;
  mbti?: string;
}

export interface BlueprintMeta {
  generation_method: string;
  model_version: string;
  generation_date: string;
  birth_data: Record<string, any>;
  schema_version: string;
  raw_response?: any;
  error?: string | null;
  tool_calls?: Array<any>;
}

// Define complete BlueprintData interface based on structure
export interface BlueprintData {
  _meta: BlueprintMeta;
  user_meta: UserMetaData;
  cognition_mbti: {
    type: string;
    core_keywords: string[];
    dominant_function: string;
    auxiliary_function: string;
    [key: string]: any;
  };
  energy_strategy_human_design: {
    type: string;
    profile: string;
    authority: string;
    strategy: string;
    definition: string;
    not_self_theme: string;
    life_purpose: string;
    centers: Record<string, boolean | { defined: boolean; description: string }>;
    gates: {
      unconscious_design: string[];
      conscious_personality: string[];
      [key: string]: any;
    };
    [key: string]: any;
  };
  bashar_suite?: {
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
    [key: string]: any;
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
    [key: string]: any;
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
    aspects: Array<{
      planet: string;
      aspect: string;
      planet2: string;
      orb: string;
      [key: string]: any;
    }>;
    houses: Record<string, { sign: string; house: string; [key: string]: any }>;
    [key: string]: any;
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
      [key: string]: any;
    };
    [key: string]: any;
  };
  timing_overlays?: {
    current_transits: any[];
    notes: string;
    [key: string]: any;
  };
  goal_stack?: any[];
  task_graph?: Record<string, any>;
  belief_logs?: any[];
  excitement_scores?: any[];
  vibration_check_ins?: any[];
  [key: string]: any;
}

// Blueprint service for calculating and managing blueprints
const blueprintService = {
  // Create an empty blueprint with default structure
  createEmptyBlueprint: (name: string = 'New User'): BlueprintData => {
    return {
      _meta: {
        generation_method: 'empty',
        model_version: '1.0',
        generation_date: new Date().toISOString(),
        birth_data: {},
        schema_version: '1.0',
      },
      user_meta: {
        full_name: name,
        birth_date: '',
      },
      cognition_mbti: {
        type: '',
        core_keywords: [],
        dominant_function: '',
        auxiliary_function: '',
      },
      energy_strategy_human_design: {
        type: '',
        profile: '',
        authority: '',
        strategy: '',
        definition: '',
        not_self_theme: '',
        life_purpose: '',
        centers: {},
        gates: {
          unconscious_design: [],
          conscious_personality: [],
        },
      },
      values_life_path: {
        life_path_number: 0,
        life_path_keyword: '',
        life_path_description: '',
        birth_day_number: 0,
        birth_day_meaning: '',
        personal_year: 0,
        expression_number: 0,
        expression_keyword: '',
        soul_urge_number: 0,
        soul_urge_keyword: '',
        personality_number: 0,
      },
      archetype_western: {
        sun_sign: '',
        sun_keyword: '',
        sun_dates: '',
        sun_element: '',
        sun_qualities: '',
        moon_sign: '',
        moon_keyword: '',
        moon_element: '',
        rising_sign: '',
        aspects: [],
        houses: {},
      },
      archetype_chinese: {
        animal: '',
        element: '',
        yin_yang: '',
        keyword: '',
        element_characteristic: '',
        personality_profile: '',
        compatibility: {
          best: [],
          worst: [],
        },
      },
      timing_overlays: {
        current_transits: [],
        notes: '',
      },
      goal_stack: [],
      task_graph: {},
      belief_logs: [],
      excitement_scores: [],
      vibration_check_ins: [],
    };
  },

  // Calculate a blueprint based on user data
  calculateBlueprint: async (userMeta: UserMetaData): Promise<BlueprintData> => {
    try {
      console.log('Calculating blueprint for:', userMeta);
      
      // For now, return a sample blueprint but modify it with the user's data
      // In a real implementation, we would call out to more complex calculation logic
      const blueprint = structuredClone(sampleBlueprints[0]) as BlueprintData;
      
      // Update user meta information
      blueprint.user_meta = {
        ...blueprint.user_meta,
        ...userMeta,
      };
      
      // Update meta information
      blueprint._meta = {
        ...blueprint._meta,
        generation_date: new Date().toISOString(),
        generation_method: 'sample_data',
      };
      
      return blueprint;
    } catch (error) {
      console.error('Error calculating blueprint:', error);
      throw error;
    }
  },

  // Generate a blueprint using the GPT-4o search preview edge function
  // STRICTLY ONE REQUEST - no retries, no queue system
  generateBlueprintFromBirthData: async (userMeta: UserMetaData): Promise<{ 
    success: boolean; 
    blueprint?: BlueprintData; 
    error?: string;
    rawResponse?: any;
  }> => {
    try {
      console.log('Calling blueprint-generator with user meta:', userMeta);
      
      // Make a single API call to the edge function - NO RETRIES
      const { data, error } = await supabase.functions.invoke('blueprint-generator', {
        body: { userMeta }
      });
      
      // Handle errors from the API call
      if (error) {
        console.error('Error from Supabase function:', error);
        throw error;
      }
      
      // Process successful response
      if (data && data.blueprint) {
        console.log('Blueprint generated via Supabase function');
        
        return { 
          success: true, 
          blueprint: data.blueprint as BlueprintData,
          rawResponse: data.rawResponse
        };
      } else if (data && data.error) {
        console.error('Error from blueprint generator:', data.error);
        return { 
          success: false, 
          error: data.error,
          rawResponse: data.rawResponse
        };
      }
      
      throw new Error('No blueprint or error returned from generator function');
    } catch (error) {
      console.error('Error generating blueprint:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error generating blueprint';
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  },

  // Save a blueprint to the database
  saveBlueprintToDatabase: async (blueprint: BlueprintData): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Saving blueprint to database:', blueprint);
      
      // Get the current user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Create a blueprint record
      const blueprintId = uuidv4();
      const timestamp = new Date().toISOString();
      
      // Blueprint needs to be typed as Json for Supabase compatibility
      const blueprintJson = blueprint as unknown as Json;
      
      // Insert the blueprint record into the database
      const { data, error } = await supabase
        .from('user_blueprints')
        .insert({
          id: blueprintId,
          user_id: user.id,
          blueprint: blueprintJson,
          is_active: true,
          created_at: timestamp,
          updated_at: timestamp,
        });
      
      if (error) {
        console.error('Error saving blueprint:', error);
        throw error;
      }
      
      console.log('Blueprint saved successfully:', data);
      return { success: true };
    } catch (error) {
      console.error('Error in saveBlueprintToDatabase:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error saving blueprint' 
      };
    }
  },

  // Fetch all blueprints for the current user
  fetchUserBlueprints: async (): Promise<BlueprintData[]> => {
    try {
      // Get the current user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Fetch blueprints for this user
      const { data, error } = await supabase
        .from('user_blueprints')
        .select('blueprint')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Convert and return the blueprints
      return data?.map(item => item.blueprint as unknown as BlueprintData) || [];
    } catch (error) {
      console.error('Error fetching user blueprints:', error);
      return [];
    }
  },

  // Get the default (latest) blueprint for a user
  getDefaultBlueprint: async (): Promise<BlueprintData | null> => {
    try {
      // First try to get from database
      const blueprints = await blueprintService.fetchUserBlueprints();
      
      if (blueprints && blueprints.length > 0) {
        return blueprints[0] as BlueprintData;
      }
      
      // If no blueprints in database, return a sample one
      console.warn('No blueprints found in database, returning sample');
      return sampleBlueprints[0] as BlueprintData;
    } catch (error) {
      console.error('Error getting default blueprint:', error);
      return null;
    }
  }
};

export default blueprintService;
