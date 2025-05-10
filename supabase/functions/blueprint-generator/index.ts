
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Edge function to handle blueprint generation requests
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const requestData = await req.json();
    console.log("Received data:", JSON.stringify(requestData));

    // Check if we have the userMeta field, which is what our frontend is sending
    const userMeta = requestData.userMeta;
    
    if (!userMeta) {
      throw new Error("Missing user metadata in request");
    }

    // For development/debugging, log the data we received
    console.log(`Processing blueprint for: ${userMeta.full_name}, born on ${userMeta.birth_date}`);

    // Generate the blueprint using sample data from the research-blueprint-generator
    // This is a simplified response for testing
    const blueprint = {
      _meta: {
        generation_method: "edge-function",
        model_version: "1.0",
        generation_date: new Date().toISOString(),
        birth_data: userMeta,
        schema_version: "1.0",
      },
      user_meta: {
        ...userMeta
      },
      cognition_mbti: {
        type: "INFJ",
        core_keywords: ["Insightful", "Visionary", "Determined"],
        dominant_function: "Introverted Intuition (Ni)",
        auxiliary_function: "Extraverted Feeling (Fe)"
      },
      energy_strategy_human_design: {
        type: "Generator",
        profile: "3/5 (Martyr/Heretic)",
        authority: "Emotional",
        strategy: "Wait to respond",
        definition: "Split",
        not_self_theme: "Frustration",
        life_purpose: "Finding satisfaction through response",
        centers: {
          root: false,
          sacral: true,
          spleen: false,
          solar_plexus: true,
          heart: false,
          throat: false,
          ajna: false,
          head: false,
          g: false
        },
        gates: {
          unconscious_design: ["34.3", "10.1", "57.4", "44.2"],
          conscious_personality: ["20.5", "57.2", "51.6", "27.4"]
        }
      },
      values_life_path: {
        life_path_number: 7,
        life_path_keyword: "Seeker of Truth",
        life_path_description: "Your life path is focused on spiritual growth and inner wisdom",
        birth_day_number: 15,
        birth_day_meaning: "You have adaptable and versatile energy",
        personal_year: 5,
        expression_number: 9,
        expression_keyword: "Humanitarian",
        soul_urge_number: 5,
        soul_urge_keyword: "Freedom Seeker",
        personality_number: 4
      },
      archetype_western: {
        sun_sign: "Aquarius ♒︎",
        sun_keyword: "Innovative Thinker",
        sun_dates: "January 20 - February 18",
        sun_element: "Air",
        sun_qualities: "Fixed, Intelligent, Humanitarian",
        moon_sign: "Pisces ♓︎",
        moon_keyword: "Intuitive Empath",
        moon_element: "Water",
        rising_sign: "Virgo ♍︎",
        aspects: [
          { planet: "Sun", aspect: "Conjunction", planet2: "Mercury", orb: "3°" }
        ],
        houses: {
          "1": {"sign": "Virgo", "house": "1st House"},
          "2": {"sign": "Libra", "house": "2nd House"}
        }
      },
      archetype_chinese: {
        animal: "Horse",
        element: "Fire",
        yin_yang: "Yang",
        keyword: "Free-spirited Explorer",
        element_characteristic: "Dynamic, passionate, and energetic",
        personality_profile: "Adventurous, independent, and charming with boundless energy",
        compatibility: {
          best: ["Tiger", "Goat", "Dog"],
          worst: ["Rat", "Ox", "Rabbit"]
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
      }
    };

    // Return success response with the blueprint
    return new Response(
      JSON.stringify({ 
        success: true, 
        blueprint
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
    
  } catch (error) {
    console.error("Error generating blueprint:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to generate blueprint" 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
