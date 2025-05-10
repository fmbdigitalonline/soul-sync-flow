
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

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
    
    // Generate the blueprint using GPT-4o-search-preview
    const blueprint = await generateBlueprintWithAI(userMeta);

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

/**
 * Generate a complete blueprint using OpenAI's GPT-4o-search-preview model
 * @param {Object} userMeta - User metadata including birth information
 * @returns {Object} Complete blueprint object
 */
async function generateBlueprintWithAI(userMeta) {
  try {
    if (!OPENAI_API_KEY) {
      console.error("Missing OpenAI API key");
      // Fall back to the sample data if no API key is available
      return generateFallbackBlueprint(userMeta);
    }

    console.log("Calling OpenAI to generate blueprint");

    // Create a detailed system prompt that explains what we need
    const systemPrompt = `You are an expert astrologer, numerologist, and spiritual advisor. 
Generate a complete Soul Blueprint based on the following birth details.
Your response should be a well-structured JSON object containing these components:
- Western astrology (sun sign, moon sign, rising sign, aspects, etc.)
- Human Design (type, profile, authority, strategy, centers, gates)
- Numerology (life path number, expression number, etc.)
- Chinese zodiac analysis
- MBTI-style cognitive profile
- Bashar's belief interface principles

Format all calculations accurately and return ONLY valid JSON with detailed sections.`;

    // Create a detailed user prompt with the birth information
    const userPrompt = `Generate a complete Soul Blueprint for this person:
Full name: ${userMeta.full_name}
Birth date: ${userMeta.birth_date}
Birth time: ${userMeta.birth_time_local || "Unknown"}
Birth location: ${userMeta.birth_location || "Unknown"}
MBTI (if known): ${userMeta.mbti || "Unknown"}

Search for astrological and spiritual information to create an accurate blueprint. 
For missing data, make reasonable assumptions based on available information.
Return ONLY a valid JSON object with no additional text.`;

    // Call OpenAI API to generate the blueprint
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    console.log("Received blueprint from OpenAI");
    
    // Parse the generated content and ensure it has the structure we need
    const parsedBlueprint = JSON.parse(generatedContent);
    
    // Create a complete blueprint object with the required structure
    const completeBlueprint = {
      _meta: {
        generation_method: "gpt-4o",
        model_version: "gpt-4o",
        generation_date: new Date().toISOString(),
        birth_data: userMeta,
        schema_version: "1.0",
      },
      user_meta: {
        ...userMeta
      },
      // Map the AI-generated content to our expected structure
      // Use the AI data if available, otherwise provide fallback values
      cognition_mbti: parsedBlueprint.cognition_mbti || {
        type: userMeta.mbti || "INFJ",
        core_keywords: ["Insightful", "Visionary", "Determined"],
        dominant_function: "Introverted Intuition (Ni)",
        auxiliary_function: "Extraverted Feeling (Fe)"
      },
      energy_strategy_human_design: parsedBlueprint.energy_strategy_human_design || {
        type: "Generator",
        profile: "3/5 (Martyr/Heretic)",
        authority: "Emotional",
        strategy: "Wait to respond",
        definition: "Split",
        not_self_theme: "Frustration",
        life_purpose: "Finding satisfaction through response",
        centers: parsedBlueprint.energy_strategy_human_design?.centers || {
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
        gates: parsedBlueprint.energy_strategy_human_design?.gates || {
          unconscious_design: ["34.3", "10.1", "57.4", "44.2"],
          conscious_personality: ["20.5", "57.2", "51.6", "27.4"]
        }
      },
      values_life_path: parsedBlueprint.values_life_path || {
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
      archetype_western: parsedBlueprint.archetype_western || {
        sun_sign: "Aquarius ♒︎",
        sun_keyword: "Innovative Thinker",
        sun_dates: "January 20 - February 18",
        sun_element: "Air",
        sun_qualities: "Fixed, Intelligent, Humanitarian",
        moon_sign: "Pisces ♓︎",
        moon_keyword: "Intuitive Empath",
        moon_element: "Water",
        rising_sign: "Virgo ♍︎",
        aspects: parsedBlueprint.archetype_western?.aspects || [
          { planet: "Sun", aspect: "Conjunction", planet2: "Mercury", orb: "3°" }
        ],
        houses: parsedBlueprint.archetype_western?.houses || {
          "1": {"sign": "Virgo", "house": "1st House"},
          "2": {"sign": "Libra", "house": "2nd House"}
        }
      },
      archetype_chinese: parsedBlueprint.archetype_chinese || {
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
      bashar_suite: parsedBlueprint.bashar_suite || {
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

    return completeBlueprint;
  } catch (error) {
    console.error("Error in generateBlueprintWithAI:", error);
    // If AI generation fails, fall back to sample data
    return generateFallbackBlueprint(userMeta);
  }
}

/**
 * Generate a fallback blueprint using sample data if AI generation fails
 * @param {Object} userMeta - User metadata
 * @returns {Object} Fallback blueprint with the user's data
 */
function generateFallbackBlueprint(userMeta) {
  console.log("Using fallback blueprint generation");
  return {
    _meta: {
      generation_method: "fallback",
      model_version: "1.0",
      generation_date: new Date().toISOString(),
      birth_data: userMeta,
      schema_version: "1.0",
    },
    user_meta: {
      ...userMeta
    },
    cognition_mbti: {
      type: userMeta.mbti || "INFJ",
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
}
