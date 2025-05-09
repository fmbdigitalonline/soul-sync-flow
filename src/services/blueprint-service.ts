
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Sample blueprint data for initial testing and development
import { sampleBlueprints } from './blueprint-examples';

// Interfaces for Blueprint data structure
export interface UserMetaData {
  preferred_name: string;
  full_name?: string;
  birth_date?: string;
  birth_time_local?: string;
  birth_location?: string;
  profile_image_url?: string;
  timezone?: string;
}

export interface CognitionMBTI {
  type?: string;
  description?: string;
  strengths?: string[];
  challenges?: string[];
  career_suggestions?: string[];
  compatibility?: {
    great_match?: string[];
    good_match?: string[];
    challenges?: string[];
  };
  core_keywords?: string[];
  dominant_function?: string;
  auxiliary_function?: string;
}

export interface HumanDesignData {
  type?: string;
  authority?: string;
  profile?: string;
  centers?: {
    head?: { defined: boolean; description: string };
    ajna?: { defined: boolean; description: string };
    throat?: { defined: boolean; description: string };
    g?: { defined: boolean; description: string };
    heart?: { defined: boolean; description: string };
    spleen?: { defined: boolean; description: string };
    solar_plexus?: { defined: boolean; description: string };
    sacral?: { defined: boolean; description: string };
    root?: { defined: boolean; description: string };
  };
  channels?: { from: string; to: string; name: string; description: string }[];
  gates?: {
    unconscious_design?: string[];
    conscious_personality?: string[];
  };
  strategy?: string;
  not_self_theme?: string;
  signature?: string;
  definition?: string;
  life_purpose?: string;
}

export interface WesternAstrology {
  sun_sign?: string;
  moon_sign?: string;
  rising_sign?: string;
  dominant_planets?: string[];
  chart_patterns?: string[];
  houses?: { [key: string]: { sign: string; house: string } };
  aspects?: { planet: string; aspect: string; planet2: string; orb: string }[];
  summary?: string;
  sun_keyword?: string;
  sun_dates?: string;
  sun_element?: string;
  sun_qualities?: string;
  moon_keyword?: string;
  moon_element?: string;
}

export interface ChineseAstrology {
  animal_sign?: string;
  element?: string;
  yin_yang?: string;
  lucky?: {
    colors?: string[];
    numbers?: string[];
    directions?: string[];
  };
  personality_traits?: string[];
  description?: string;
  animal?: string;
  keyword?: string;
  element_characteristic?: string;
  personality_profile?: string;
  compatibility?: {
    best?: string[];
    worst?: string[];
  };
}

export interface LifePathNumerology {
  life_path_number?: string | number;
  life_path_keyword?: string;
  life_path_description?: string;
  meaning?: string;
  strengths?: string[];
  challenges?: string[];
  career_suggestions?: string[];
  compatibility?: {
    great_match?: number[];
    good_match?: number[];
    challenges?: number[];
  };
  birth_day_number?: number;
  birth_day_meaning?: string;
  personal_year?: number;
  expression_number?: number;
  expression_keyword?: string;
  soul_urge_number?: number;
  soul_urge_keyword?: string;
  personality_number?: number;
}

export interface BlueprintData {
  _meta?: {
    version?: string;
    created_at?: string;
    id?: string;
    user_id?: string;
    raw_response?: string;  // Field to store raw API response
    generation_method?: string;
    model_version?: string;
    generation_date?: string;
    birth_data?: any;
    schema_version?: string;
  };
  user_meta: UserMetaData;
  cognition_mbti: CognitionMBTI;
  energy_strategy_human_design: HumanDesignData;
  archetype_western: WesternAstrology;
  archetype_chinese: ChineseAstrology;
  values_life_path: LifePathNumerology;
  bashar_suite?: any;
  timing_overlays?: any;
  goal_stack?: any[];
  task_graph?: any;
  belief_logs?: any[];
  excitement_scores?: any[];
  vibration_check_ins?: any[];
}

// Helper function to create an empty blueprint
export const createEmptyBlueprint = (name?: string): BlueprintData => {
  return {
    _meta: {
      version: "1.0",
      created_at: new Date().toISOString(),
      id: uuidv4(),
    },
    user_meta: {
      preferred_name: name || "Anonymous",
      full_name: name || "Anonymous",
    },
    cognition_mbti: {},
    energy_strategy_human_design: {},
    archetype_western: {},
    archetype_chinese: {},
    values_life_path: {},
  };
};

// Main function to calculate a blueprint using the new search-based approach
export const calculateBlueprint = async (userMeta: UserMetaData): Promise<BlueprintData> => {
  try {
    // Format the birth data for the API call
    const birthData = {
      name: userMeta.full_name || userMeta.preferred_name,
      date: userMeta.birth_date || '',
      time: userMeta.birth_time_local || '',
      location: userMeta.birth_location || '',
    };

    // Call the new blueprint-generator function that uses GPT-4o-search-preview
    const { data, error } = await supabase.functions.invoke('blueprint-generator', {
      body: { birthData },
    });

    if (error) {
      console.error("Error calling blueprint-generator function:", error);
      throw new Error(`Failed to calculate blueprint: ${error.message}`);
    }

    if (!data || !data.data) {
      console.error("No data returned from blueprint-generator:", data);
      throw new Error("Blueprint generation failed to return valid data");
    }

    // Return the processed blueprint data
    return data.data as BlueprintData;
  } catch (error) {
    console.error("Error in calculateBlueprint:", error);
    throw new Error("Failed to calculate blueprint");
  }
};

// Save a blueprint to the database
export const saveBlueprintToDatabase = async (blueprint: BlueprintData): Promise<BlueprintData> => {
  try {
    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // If user is authenticated, associate the blueprint with their ID
      blueprint._meta = {
        ...blueprint._meta,
        user_id: user.id,
      };
    }

    // Insert into blueprints table
    const { data, error } = await supabase
      .from('user_blueprints')
      .insert([
        {
          id: blueprint._meta?.id || uuidv4(),
          user_id: blueprint._meta?.user_id,
          blueprint: blueprint,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Database insertion error:", error);
      throw new Error(`Failed to save blueprint: ${error.message}`);
    }

    return blueprint;
  } catch (error) {
    console.error("Error saving blueprint:", error);
    throw new Error("Failed to save blueprint");
  }
};

// Get all blueprints for the current user
export const getUserBlueprints = async (): Promise<BlueprintData[]> => {
  try {
    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn("No authenticated user found, returning sample blueprints");
      return sampleBlueprints;
    }

    // Fetch user's blueprints
    const { data, error } = await supabase
      .from('user_blueprints')
      .select('blueprint')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching user blueprints:", error);
      throw new Error(`Failed to fetch blueprints: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.warn("No blueprints found for user, returning sample blueprint");
      return [sampleBlueprints[0]]; // Return just one sample blueprint
    }

    // Extract and return the blueprint data
    return data.map(item => item.blueprint as BlueprintData);
  } catch (error) {
    console.error("Error getting user blueprints:", error);
    return sampleBlueprints; // Fall back to sample data
  }
};

// Get the latest blueprint for the current user
export const getLatestBlueprint = async (): Promise<BlueprintData> => {
  try {
    const blueprints = await getUserBlueprints();
    return blueprints[0]; // Return the first (most recent) blueprint
  } catch (error) {
    console.error("Error getting latest blueprint:", error);
    return sampleBlueprints[0]; // Fall back to sample data
  }
};

// Get a specific blueprint by ID
export const getBlueprintById = async (id: string): Promise<BlueprintData | null> => {
  try {
    // Fetch specific blueprint by ID
    const { data, error } = await supabase
      .from('user_blueprints')
      .select('blueprint')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching blueprint by ID:", error);
      throw new Error(`Failed to fetch blueprint: ${error.message}`);
    }

    // Safely check and return the blueprint data
    if (data && data.blueprint) {
      return data.blueprint as BlueprintData;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting blueprint by ID:", error);
    return null;
  }
};

// Get the active blueprint for the current user
export const getActiveBlueprintData = async (): Promise<{
  data: BlueprintData | null;
  error: string | null;
  rawResponse?: any;
}> => {
  try {
    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { 
        data: null, 
        error: "No authenticated user found" 
      };
    }

    // Fetch active blueprint
    const { data, error } = await supabase
      .from('user_blueprints')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No active blueprint found
        return { data: null, error: null };
      }
      console.error("Error fetching active blueprint:", error);
      return { 
        data: null, 
        error: `Failed to fetch active blueprint: ${error.message}` 
      };
    }

    if (!data) {
      return { data: null, error: null };
    }
    
    // Extract raw response if available
    let rawResponse = null;
    const blueprint = data.blueprint;
    if (blueprint && typeof blueprint === 'object' && '_meta' in blueprint) {
      const meta = blueprint._meta;
      if (meta && meta.raw_response) {
        try {
          rawResponse = typeof meta.raw_response === 'string' ? 
            JSON.parse(meta.raw_response) : meta.raw_response;
        } catch (e) {
          rawResponse = meta.raw_response; // Keep as string if parsing fails
        }
      }
    }

    return { 
      data: blueprint as BlueprintData, 
      error: null,
      rawResponse
    };
  } catch (error) {
    console.error("Error getting active blueprint:", error);
    return { 
      data: null, 
      error: `Failed to get active blueprint: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

// Save or update a blueprint
export const saveBlueprintData = async (blueprint: BlueprintData): Promise<{
  success: boolean;
  error: string | null;
}> => {
  try {
    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { 
        success: false, 
        error: "No authenticated user found" 
      };
    }

    // Ensure blueprint has necessary metadata
    if (!blueprint._meta) {
      blueprint._meta = {
        created_at: new Date().toISOString(),
        id: uuidv4()
      };
    }
    
    blueprint._meta.user_id = user.id;
    blueprint._meta.version = blueprint._meta.version || "1.0";
    
    // Insert/update blueprint
    const { error } = await supabase
      .from('user_blueprints')
      .upsert({
        id: blueprint._meta.id,
        user_id: user.id,
        blueprint: blueprint,
        is_active: true,
        created_at: blueprint._meta.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error("Error saving blueprint:", error);
      return { 
        success: false, 
        error: `Failed to save blueprint: ${error.message}` 
      };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Error saving blueprint data:", error);
    return { 
      success: false, 
      error: `Failed to save blueprint: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

// Export the blueprint service object with all functions
export const blueprintService = {
  calculateBlueprint,
  createEmptyBlueprint,
  getActiveBlueprintData,
  getBlueprintById,
  getLatestBlueprint,
  getUserBlueprints,
  saveBlueprintData,
  saveBlueprintToDatabase
};
