
import { supabase } from '@/integrations/supabase/client';

interface GenerateBlueprintParams {
  full_name: string;
  birth_date: string;
  birth_time_local?: string;
  birth_location?: string;
  mbti?: string;
  preferred_name?: string;
}

interface BlueprintResult {
  success: boolean;
  blueprint?: any;
  error?: string;
  rawResponse?: any;
}

/**
 * Python Blueprint Service
 * 
 * A service that connects to a Supabase Edge Function running Python code
 * for more accurate astrological calculations and blueprint generation.
 */
export const pythonBlueprintService = {
  /**
   * Generate a blueprint using the Python edge function
   * @param userData User birth data for blueprint generation
   * @returns Generated blueprint and success status
   */
  async generateBlueprint(userData: GenerateBlueprintParams): Promise<BlueprintResult> {
    try {
      console.log('[PYTHON SERVICE] Calling Python Blueprint Engine with data:', userData);

      const requestData = {
        userData: {
          full_name: userData.full_name,
          birth_date: userData.birth_date,
          birth_time_local: userData.birth_time_local || "00:00", // Keep original parameter name for backward compatibility
          birth_location: userData.birth_location || "Unknown",
          mbti: userData.mbti || "",
          preferred_name: userData.preferred_name || userData.full_name.split(' ')[0]
        }
      };

      // Call the Edge Function with proper headers and error handling
      const response = await supabase.functions.invoke('python-blueprint-engine', {
        method: 'POST',
        body: requestData,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Check for Supabase function errors
      if (response.error) {
        console.error('[PYTHON SERVICE] Error calling Python blueprint engine:', response.error);
        return {
          success: false,
          error: response.error.message || 'Failed to communicate with Python blueprint engine',
          rawResponse: response.error
        };
      }

      // Check if we have valid data from the Python engine
      if (!response.data) {
        return {
          success: false,
          error: 'Python engine returned no data',
          rawResponse: response
        };
      }

      // Log detailed information about the response for debugging
      console.log('[PYTHON SERVICE] Python blueprint engine response received');
      console.log('[PYTHON SERVICE] Response data type:', typeof response.data);
      console.log('[PYTHON SERVICE] Response data keys:', Object.keys(response.data).join(', '));
      
      // Check if there's an error in the response data
      if (response.data.error) {
        return {
          success: false,
          error: response.data.error || 'Python engine returned an error',
          rawResponse: response.data
        };
      }
      
      // Log critical calculation values for validation
      if (response.data.values_life_path) {
        console.log('[PYTHON SERVICE] Life Path Number:', response.data.values_life_path.life_path_number);
        console.log('[PYTHON SERVICE] Birth Date Components:', userData.birth_date.split('-').join(', '));
      }
      
      if (response.data.energy_strategy_human_design) {
        console.log('[PYTHON SERVICE] Human Design Type:', response.data.energy_strategy_human_design.type);
      }

      // Successfully received blueprint data
      return {
        success: true,
        blueprint: response.data,
        rawResponse: response.data
      };
    } catch (error) {
      console.error('[PYTHON SERVICE] Exception in Python blueprint service:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in Python blueprint service',
        rawResponse: error
      };
    }
  }
};
