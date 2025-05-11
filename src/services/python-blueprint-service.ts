
import { supabase } from "@/integrations/supabase/client";
import { BlueprintData, UserMetaData } from "./blueprint-service";

/**
 * Service to interact with the Python-based Blueprint Engine
 */
export const pythonBlueprintService = {
  /**
   * Generate a blueprint using the Python-based engine
   */
  async generateBlueprint(userData: UserMetaData): Promise<{
    success: boolean;
    blueprint?: BlueprintData;
    error?: string;
    rawResponse?: any;
  }> {
    try {
      console.log("Generating blueprint with Python engine...", userData);
      
      // Add detailed diagnostic info
      console.log("Blueprint engine URL:", `https://qxaajirrqrcnmvtowjbg.supabase.co/functions/v1/python-blueprint-engine`);
      console.log("Request payload:", JSON.stringify(userData, null, 2));
      
      // Try the research blueprint generator first as it may be more reliable
      try {
        console.log("Trying research blueprint generator first...");
        const researchResult = await supabase.functions.invoke("research-blueprint-generator", {
          body: {
            birthData: {
              name: userData.full_name,
              date: userData.birth_date,
              time: userData.birth_time_local || "00:00",
              location: userData.birth_location || "",
              timezone: "local", // Default to local timezone if not provided
            },
            debugMode: true
          }
        });
        
        console.log("Research blueprint generator response:", researchResult);
        
        if (researchResult.data && !researchResult.error) {
          console.log("Research blueprint generation succeeded, processing result");
          
          // Transform research engine output to match our blueprint structure
          const blueprint: BlueprintData = {
            user_meta: {
              full_name: userData.full_name,
              preferred_name: userData.preferred_name || userData.full_name.split(" ")[0],
              birth_date: userData.birth_date,
              birth_time_local: userData.birth_time_local,
              birth_location: userData.birth_location
            },
            // Map the research blueprint data to our blueprint structure
            cognition_mbti: researchResult.data.data.cognition_mbti || {
              type: userData.mbti || "Unknown",
              description: "",
              core_keywords: [],
              dominant_function: "",
              auxiliary_function: ""
            },
            energy_strategy_human_design: researchResult.data.data.energy_strategy_human_design || {
              type: "Generator",
              strategy: "Wait to respond",
              authority: "Emotional",
              profile: "3/5",
              definition: "Split",
              incarnation_cross: "Cross of Planning",
              not_self_theme: "",
              life_purpose: "",
              centers: {},
              gates: {
                unconscious_design: [],
                conscious_personality: []
              }
            },
            archetype_western: researchResult.data.data.archetype_western || {
              sun_sign: "Aquarius ♒︎",
              moon_sign: "Pisces ♓︎",
              rising_sign: "Virgo ♍︎",
              sun_keyword: "",
              sun_dates: "",
              sun_element: "",
              sun_qualities: "",
              moon_keyword: "",
              moon_element: "",
              aspects: [],
              houses: {}
            },
            archetype_chinese: researchResult.data.data.archetype_chinese || {
              animal: "Horse",
              element: "Earth",
              yin_yang: "Yang",
              keyword: "",
              element_characteristic: "",
              personality_profile: "",
              compatibility: {
                best: [],
                worst: []
              }
            },
            values_life_path: researchResult.data.data.values_life_path || {
              life_path_number: 7,
              life_path_keyword: "",
              life_path_description: "",
              birth_day_number: 0,
              birth_day_meaning: "",
              personal_year: 0,
              expression_number: 0,
              expression_keyword: "",
              soul_urge_number: 0,
              soul_urge_keyword: "",
              personality_number: 0
            },
            // Add the narrative from GPT
            raw_content: researchResult.data.data._meta?.raw_response || "",
            needs_parsing: true,
            // Store metadata
            _meta: {
              generation_method: "research-engine",
              generation_date: new Date().toISOString(),
              model_version: "2.0",
              birth_data: {},
              schema_version: "2.0",
              raw_response: researchResult.data,
              error: null
            }
          };
          
          return {
            success: true,
            blueprint,
            rawResponse: researchResult.data
          };
        }
      } catch (researchError) {
        console.warn("Research blueprint generator failed, trying Python engine:", researchError);
        // Fall through to try the Python engine
      }
      
      // Call the Supabase Edge Function that wraps our Python code
      console.log("Calling Supabase function: python-blueprint-engine");
      const { data, error } = await supabase.functions.invoke("python-blueprint-engine", {
        body: userData,
      });
      
      console.log("Supabase function response:", { data, error });
      
      if (error) {
        console.error("Error calling Python blueprint engine:", error);
        return {
          success: false,
          error: error.message,
          rawResponse: error
        };
      }
      
      if (!data || data.error) {
        console.error("Python blueprint engine returned an error:", data?.error);
        return {
          success: false,
          error: data?.error || "Unknown error",
          rawResponse: data
        };
      }
      
      // Transform the Python engine output to match our blueprint structure
      const blueprint: BlueprintData = {
        user_meta: {
          full_name: userData.full_name,
          preferred_name: userData.preferred_name || userData.full_name.split(" ")[0],
          birth_date: userData.birth_date,
          birth_time_local: userData.birth_time_local,
          birth_location: userData.birth_location
        },
        // Map the Python facts to our blueprint structure
        cognition_mbti: {
          type: data.facts.mbti || "Unknown",
          description: "",
          core_keywords: [],
          dominant_function: "",
          auxiliary_function: ""
        },
        energy_strategy_human_design: {
          type: data.facts.human_design.type,
          strategy: data.facts.human_design.strategy,
          authority: data.facts.human_design.authority,
          profile: data.facts.human_design.profile,
          definition: data.facts.human_design.definition,
          incarnation_cross: data.facts.human_design.incarnation_cross,
          not_self_theme: "",
          life_purpose: "",
          centers: {},
          gates: {
            unconscious_design: [],
            conscious_personality: []
          }
        },
        archetype_western: {
          sun_sign: data.facts.western.sun_sign,
          moon_sign: data.facts.western.moon_sign,
          rising_sign: data.facts.western.ascendant_sign,
          sun_keyword: "",
          sun_dates: "",
          sun_element: "",
          sun_qualities: "",
          moon_keyword: "",
          moon_element: "",
          aspects: [],
          houses: {}
        },
        archetype_chinese: {
          animal: data.facts.chinese.animal,
          element: data.facts.chinese.element,
          yin_yang: data.facts.chinese.yin_yang,
          keyword: "",
          element_characteristic: "",
          personality_profile: "",
          compatibility: {
            best: [],
            worst: []
          }
        },
        values_life_path: {
          life_path_number: data.facts.numerology.life_path,
          life_path_keyword: "",
          life_path_description: "",
          birth_day_number: 0,
          birth_day_meaning: "",
          personal_year: 0,
          expression_number: 0,
          expression_keyword: "",
          soul_urge_number: 0,
          soul_urge_keyword: "",
          personality_number: 0
        },
        // Add the narrative from GPT
        raw_content: data.narrative,
        needs_parsing: true,
        // Store metadata
        _meta: {
          generation_method: "python-engine",
          generation_date: new Date().toISOString(),
          model_version: "1.0",
          birth_data: {},
          schema_version: "1.0",
          raw_response: data,
          error: data.error || null
        }
      };
      
      return {
        success: true,
        blueprint,
        rawResponse: data
      };
    } catch (error) {
      console.error("Exception in Python blueprint service:", error);
      // Include detailed error info for debugging
      const errorDetails = {
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : "Unknown",
        stack: error instanceof Error ? error.stack : undefined,
        originalError: error
      };
      console.error("Detailed error:", errorDetails);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        rawResponse: errorDetails
      };
    }
  },
};
