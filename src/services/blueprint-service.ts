
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Sample blueprint data for initial testing and development
import { sampleBlueprints } from './blueprint-examples';

// Interfaces for Blueprint data structure
export interface UserMetaData {
  preferred_name: string;
  birth_date?: string;
  birth_time?: string;
  birth_location?: string;
  profile_image_url?: string;
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
  gates?: { number: number; name: string; description: string }[];
  strategy?: string;
  not_self?: string;
  signature?: string;
}

export interface WesternAstrology {
  sun_sign?: string;
  moon_sign?: string;
  rising_sign?: string;
  dominant_planets?: string[];
  chart_patterns?: string[];
  houses?: { house: string; sign: string; description: string }[];
  aspects?: { planet: string; aspect: string; planet2: string; orb: string }[];
  summary?: string;
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
}

export interface LifePathNumerology {
  life_path_number?: string;
  meaning?: string;
  strengths?: string[];
  challenges?: string[];
  career_suggestions?: string[];
  compatibility?: {
    great_match?: number[];
    good_match?: number[];
    challenges?: number[];
  };
}

export interface BlueprintData {
  _meta?: {
    version: string;
    created_at: string;
    id: string;
    user_id?: string;
    raw_response?: string;  // Field to store raw API response
  };
  user_meta: UserMetaData;
  cognition_mbti: CognitionMBTI;
  energy_strategy_human_design: HumanDesignData;
  archetype_western: WesternAstrology;
  archetype_chinese: ChineseAstrology;
  values_life_path: LifePathNumerology;
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
    },
    cognition_mbti: {},
    energy_strategy_human_design: {},
    archetype_western: {},
    archetype_chinese: {},
    values_life_path: {},
  };
};

// Helper function to process an OpenAI API response into a blueprint structure
export const processOpenAIResponse = (data: any, userMeta: UserMetaData, rawResponse?: string): BlueprintData => {
  try {
    // Create the blueprint structure
    const blueprint: BlueprintData = {
      _meta: {
        version: "1.0",
        created_at: new Date().toISOString(),
        id: uuidv4(),
        raw_response: rawResponse || JSON.stringify(data), // Store the raw response
      },
      user_meta: userMeta,
      cognition_mbti: data.cognition_mbti || {},
      energy_strategy_human_design: data.energy_strategy_human_design || {},
      archetype_western: data.archetype_western || {},
      archetype_chinese: data.archetype_chinese || {},
      values_life_path: data.values_life_path || {},
    };

    return blueprint;
  } catch (error) {
    console.error("Error processing OpenAI response:", error);
    throw new Error("Failed to process response data");
  }
};

export const calculateBlueprint = async (userMeta: UserMetaData): Promise<BlueprintData> => {
  try {
    // Make request to the serverless function
    const { data, error } = await supabase.functions.invoke('blueprint-calculator', {
      body: { user_meta: userMeta },
    });

    if (error) {
      console.error("Error calling blueprint-calculator function:", error);
      throw new Error(`Failed to calculate blueprint: ${error.message}`);
    }

    // Process the response and return a blueprint
    return processOpenAIResponse(data, userMeta, JSON.stringify(data));
  } catch (error) {
    console.error("Error in calculateBlueprint:", error);
    throw new Error("Failed to calculate blueprint");
  }
};

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
      .from('blueprints')
      .insert([
        {
          id: blueprint._meta?.id,
          user_id: blueprint._meta?.user_id,
          blueprint_data: blueprint,
          created_at: new Date().toISOString(),
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
      .from('blueprints')
      .select('blueprint_data')
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
    return data.map(item => item.blueprint_data as BlueprintData);
  } catch (error) {
    console.error("Error getting user blueprints:", error);
    return sampleBlueprints; // Fall back to sample data
  }
};

export const getLatestBlueprint = async (): Promise<BlueprintData> => {
  try {
    const blueprints = await getUserBlueprints();
    return blueprints[0]; // Return the first (most recent) blueprint
  } catch (error) {
    console.error("Error getting latest blueprint:", error);
    return sampleBlueprints[0]; // Fall back to sample data
  }
};

export const getBlueprintById = async (id: string): Promise<BlueprintData | null> => {
  try {
    // Fetch specific blueprint by ID
    const { data, error } = await supabase
      .from('blueprints')
      .select('blueprint_data')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching blueprint by ID:", error);
      throw new Error(`Failed to fetch blueprint: ${error.message}`);
    }

    // Safely check for raw_response in _meta
    const blueprintData = data?.blueprint_data as BlueprintData;
    
    // Add safe type check before accessing _meta.raw_response
    if (blueprintData && typeof blueprintData === 'object' && blueprintData._meta && 'raw_response' in blueprintData._meta) {
      return blueprintData;
    }
    
    return blueprintData || null;
  } catch (error) {
    console.error("Error getting blueprint by ID:", error);
    return null;
  }
};
