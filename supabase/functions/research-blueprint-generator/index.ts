
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Edge function to generate soul blueprints using a research-based approach with GPT-4o
 * This replaces the previous calculation-based approach with a more accurate research-based system
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { birthData } = await req.json();
    const { date, time, location, timezone, name } = birthData;

    console.log(`Processing blueprint for: ${name}, born on ${date} at ${time} in ${location}`);

    if (!OPENAI_API_KEY) {
      throw new Error("Missing OpenAI API key");
    }

    // Generate the blueprint using OpenAI
    const blueprint = await generateResearchBasedBlueprint(birthData);
    
    // Return the generated blueprint
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: blueprint 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
    
  } catch (error) {
    console.error("Error generating research-based blueprint:", error);
    
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
 * Generate a research-based blueprint using OpenAI's GPT-4o
 * @param birthData The user's birth information
 * @returns A complete blueprint object with detailed spiritual and personality insights
 */
async function generateResearchBasedBlueprint(birthData) {
  const { date, time, location, timezone, name } = birthData;
  
  // Get the base prompt for blueprint generation
  const prompt = getBlueprintPrompt(birthData);
  
  // Call OpenAI with structured prompt
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert astrologist, numerologist, and spiritual advisor tasked with creating accurate Soul Blueprints. Your responses must be factually accurate based on established spiritual systems and MUST be returned in valid JSON format. Always include all required fields in the expected structure. Be comprehensive and detailed with all values.' 
        },
        { 
          role: 'user', 
          content: prompt 
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const generatedContent = data.choices[0].message.content;
  
  console.log("Received raw content from OpenAI:", generatedContent.substring(0, 200) + "...");
  
  // Parse the generated content into structured blueprint data
  const parsedBlueprint = parseGeneratedContent(generatedContent);
  
  // Initialize empty sections if they don't exist to avoid validation errors
  const completeBlueprint = ensureBlueprintStructure(parsedBlueprint);
  
  // Apply mechanical validation to ensure factual accuracy
  const validatedBlueprint = validateBlueprintData(completeBlueprint, birthData);
  
  // Add metadata for internal use (not displayed to user but available for AI Coach)
  validatedBlueprint._meta = {
    generation_method: "research-based",
    model_version: "gpt-4o",
    generation_date: new Date().toISOString(),
    birth_data: birthData,
  };
  
  return validatedBlueprint;
}

/**
 * Ensures all required structure exists in the blueprint to prevent validation errors
 */
function ensureBlueprintStructure(blueprint) {
  // Create a complete blueprint structure with default values
  const completeBlueprint = {
    user_meta: blueprint.user_meta || {},
    cognition_mbti: {
      type: "INFJ",
      core_keywords: ["Insightful", "Reserved", "Analytical"],
      dominant_function: "Introverted Intuition (Ni)",
      auxiliary_function: "Extraverted Feeling (Fe)",
      ...(blueprint.cognition_mbti || {})
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
        unconscious_design: ["34.3", "10.1"],
        conscious_personality: ["20.5", "57.2"]
      },
      ...(blueprint.energy_strategy_human_design || {})
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
      },
      ...(blueprint.bashar_suite || {})
    },
    values_life_path: {
      life_path_number: 7,
      life_path_keyword: "Seeker of Truth",
      life_path_description: "Focused on analysis, research, and spiritual understanding.",
      birth_day_number: 1,
      birth_day_meaning: "Independent and innovative",
      personal_year: new Date().getFullYear() % 9 || 9,
      expression_number: 9,
      expression_keyword: "Humanitarian",
      soul_urge_number: 5,
      soul_urge_keyword: "Freedom Seeker",
      personality_number: 4,
      ...(blueprint.values_life_path || {})
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
      aspects: blueprint.archetype_western?.aspects || [
        { planet: "Sun", aspect: "Conjunction", planet2: "Mercury", orb: "3°" },
        { planet: "Moon", aspect: "Trine", planet2: "Venus", orb: "4°" }
      ],
      houses: blueprint.archetype_western?.houses || {},
      ...(blueprint.archetype_western || {})
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
      },
      ...(blueprint.archetype_chinese || {})
    },
    timing_overlays: {
      current_transits: [],
      notes: "Generated using research-based approach",
      ...(blueprint.timing_overlays || {})
    },
    goal_stack: blueprint.goal_stack || [],
    task_graph: blueprint.task_graph || {},
    belief_logs: blueprint.belief_logs || [],
    excitement_scores: blueprint.excitement_scores || [],
    vibration_check_ins: blueprint.vibration_check_ins || []
  };

  return completeBlueprint;
}

/**
 * Creates a structured prompt for the AI to generate a complete blueprint
 */
function getBlueprintPrompt(birthData) {
  const { date, time, location, timezone, name } = birthData;
  const preferredName = name.split(' ')[0] || name;
  
  return `Generate a complete Soul Blueprint for ${name} (preferred name: ${preferredName}) born on ${date} at ${time} in ${location}, timezone ${timezone}.

Your task is to create a comprehensive spiritual profile following these specific sections:

1. User Meta Information:
   - Full name: ${name}
   - Preferred name: ${preferredName}
   - Birth date: ${date}
   - Birth time: ${time}
   - Birth location: ${location}
   - Timezone: ${timezone}

2. MBTI Personality:
   - Based on the birth data, determine the most likely MBTI type
   - Include core keywords, dominant function, and auxiliary function
   - Provide an explanation for this determination based on astrological influences

3. Human Design:
   - Calculate the exact Human Design type (Generator, Projector, Manifestor, etc.)
   - Determine profile (e.g., "4/6 (Opportunist/Role Model)")
   - Include authority, strategy, definition, not-self theme, and life purpose
   - Generate realistic gate activations in the format number.line (e.g., "16.5")
   - Ensure centers data is properly calculated

4. Numerology:
   - Calculate the life path number based on the full birth date
   - Determine expression number, soul urge number, and personality number
   - Include detailed descriptions and keywords for each number
   - Calculate current personal year number

5. Western Astrology:
   - Determine Sun sign with exact degree and minutes
   - Calculate Moon sign with exact degree and minutes
   - Find Rising sign/Ascendant based on birth time and location
   - Generate realistic aspects between planets
   - Calculate house placements

6. Chinese Zodiac:
   - Determine Chinese zodiac sign (animal)
   - Include element, yin/yang balance
   - Provide relevant keywords and characteristics
   - Include compatibility information

Format your response as valid JSON that can be directly parsed. Include all fields and provide detailed, meaningful values for each section. Do not return empty values - generate plausible data when necessary.`;
}

/**
 * Parse the AI-generated text into a structured blueprint object
 */
function parseGeneratedContent(content) {
  try {
    // First try to parse directly as JSON
    try {
      console.log("Attempting direct JSON parsing...");
      return JSON.parse(content);
    } catch (e) {
      console.log("Direct JSON parsing failed, trying to extract JSON from text");
      
      // If direct parsing fails, try to extract JSON from markdown blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        console.log("Found JSON in code block, attempting to parse...");
        try {
          return JSON.parse(jsonMatch[1]);
        } catch (e) {
          console.log("Code block JSON parsing failed:", e);
        }
      }
      
      // If no JSON format is found, use structured approach to parse the content
      console.log("No valid JSON found, falling back to structured parsing");
      return structuredParsing(content);
    }
  } catch (error) {
    console.error("Error parsing AI response:", error);
    // Return a minimal but valid structure to avoid errors
    console.log("Returning minimal blueprint due to parsing failure");
    return createMinimalBlueprint();
  }
}

/**
 * Creates a minimal but valid blueprint structure when parsing fails
 */
function createMinimalBlueprint() {
  return {
    cognition_mbti: {
      type: "INFJ",
      core_keywords: ["Insightful", "Intuitive", "Reserved"],
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
      life_purpose: "Finding satisfaction through response",
      gates: {
        unconscious_design: ["34.3", "10.1"],
        conscious_personality: ["20.5", "57.2"]
      }
    },
    values_life_path: {
      life_path_number: 7,
      life_path_keyword: "Seeker of Truth",
      expression_number: 9,
      expression_keyword: "Humanitarian",
      soul_urge_number: 5,
      soul_urge_keyword: "Freedom Seeker",
      personality_number: 4
    },
    archetype_western: {
      sun_sign: "Aquarius ♒︎",
      sun_keyword: "Innovative Thinker",
      moon_sign: "Pisces ♓︎",
      moon_keyword: "Intuitive Empath",
      rising_sign: "Virgo ♍︎"
    },
    archetype_chinese: {
      animal: "Horse",
      element: "Fire",
      yin_yang: "Yang",
      keyword: "Free-spirited Explorer"
    }
  };
}

/**
 * Fallback parsing method for when the AI response isn't properly formatted as JSON
 */
function structuredParsing(content) {
  console.log("Starting structured parsing of content");
  
  // Initialize blueprint with default structure
  const blueprint = {
    user_meta: {},
    cognition_mbti: {
      type: "INFJ",
      core_keywords: ["Insightful", "Reserved", "Analytical"],
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
      life_purpose: "Finding satisfaction through response",
      gates: {
        unconscious_design: ["34.3", "10.1"],
        conscious_personality: ["20.5", "57.2"]
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
      life_path_keyword: "Seeker of Truth",
      expression_number: 9,
      expression_keyword: "Humanitarian",
      soul_urge_number: 5,
      soul_urge_keyword: "Freedom Seeker",
      personality_number: 4
    },
    archetype_western: {
      sun_sign: "Aquarius",
      sun_keyword: "Innovative Thinker",
      moon_sign: "Pisces",
      moon_keyword: "Intuitive Empath",
      rising_sign: "Virgo",
      aspects: [],
      houses: {}
    },
    archetype_chinese: {
      animal: "Horse",
      element: "Fire",
      yin_yang: "Yang",
      keyword: "Free-spirited Explorer",
      compatibility: {
        best: ["Tiger", "Goat", "Dog"],
        worst: ["Rat", "Ox", "Rabbit"]
      }
    },
    timing_overlays: {
      current_transits: [],
      notes: "Generated using text parsing"
    },
    goal_stack: [],
    task_graph: {},
    belief_logs: [],
    excitement_scores: [],
    vibration_check_ins: []
  };
  
  // Extract user meta information
  const userMetaMatch = content.match(/User Meta Information[:\n\r]+([\s\S]*?)(?=\n\s*\d+\.|\n\s*MBTI|\n\s*Human Design|\n\s*Numerology|\Z)/i);
  if (userMetaMatch) {
    const userMetaText = userMetaMatch[1];
    
    const fullNameMatch = userMetaText.match(/Full name:?\s*([^\n]+)/i);
    if (fullNameMatch) blueprint.user_meta.full_name = fullNameMatch[1].trim();
    
    const preferredNameMatch = userMetaText.match(/Preferred name:?\s*([^\n]+)/i);
    if (preferredNameMatch) blueprint.user_meta.preferred_name = preferredNameMatch[1].trim();
    
    const birthDateMatch = userMetaText.match(/Birth date:?\s*([^\n]+)/i);
    if (birthDateMatch) blueprint.user_meta.birth_date = birthDateMatch[1].trim();
    
    const birthTimeMatch = userMetaText.match(/Birth time:?\s*([^\n]+)/i);
    if (birthTimeMatch) blueprint.user_meta.birth_time_local = birthTimeMatch[1].trim();
    
    const birthLocationMatch = userMetaText.match(/Birth location:?\s*([^\n]+)/i);
    if (birthLocationMatch) blueprint.user_meta.birth_location = birthLocationMatch[1].trim();
    
    const timezoneMatch = userMetaText.match(/Timezone:?\s*([^\n]+)/i);
    if (timezoneMatch) blueprint.user_meta.timezone = timezoneMatch[1].trim();
  }
  
  // Extract sections based on common patterns
  const mbtiSection = extractSection(content, 'MBTI Personality', 'Human Design');
  const humanDesignSection = extractSection(content, 'Human Design', 'Numerology');
  const numerologySection = extractSection(content, 'Numerology', 'Western Astrology');
  const westernAstrologySection = extractSection(content, 'Western Astrology', 'Chinese Zodiac');
  const chineseZodiacSection = extractSection(content, 'Chinese Zodiac', null);
  
  // Process each section to extract relevant data
  if (mbtiSection) extractMBTIData(mbtiSection, blueprint);
  if (humanDesignSection) extractHumanDesignData(humanDesignSection, blueprint);
  if (numerologySection) extractNumerologyData(numerologySection, blueprint);
  if (westernAstrologySection) extractWesternAstrologyData(westernAstrologySection, blueprint);
  if (chineseZodiacSection) extractChineseZodiacData(chineseZodiacSection, blueprint);
  
  return blueprint;
}

/**
 * Extract a section from the content between two headers
 */
function extractSection(content, sectionStart, sectionEnd) {
  const pattern = sectionEnd 
    ? new RegExp(`(?:${sectionStart}|\\d+\\.\\s*${sectionStart})[:\\s]+(.*?)(?:${sectionEnd}|\\d+\\.\\s*${sectionEnd}|$)`, 'is')
    : new RegExp(`(?:${sectionStart}|\\d+\\.\\s*${sectionStart})[:\\s]+(.*?)$`, 'is');
  
  const match = content.match(pattern);
  return match ? match[1].trim() : '';
}

/**
 * Helper functions to extract data from different sections
 */
function extractMBTIData(text, blueprint) {
  // Extract MBTI type
  const typeMatch = text.match(/type:?\s*([A-Z]{4})/i) || 
                   text.match(/MBTI:?\s*([A-Z]{4})/i) ||
                   text.match(/personality type:?\s*([A-Z]{4})/i);
  if (typeMatch) blueprint.cognition_mbti.type = typeMatch[1].toUpperCase();
  
  // Extract keywords
  const keywordsMatch = text.match(/keywords?:?\s*([^\n]+)/i) || 
                       text.match(/core[\s-]keywords?:?\s*([^\n]+)/i);
  if (keywordsMatch) {
    const keywords = keywordsMatch[1]
      .split(/[,;]/)
      .map(k => k.trim())
      .filter(k => k.length > 0);
    if (keywords.length > 0) {
      blueprint.cognition_mbti.core_keywords = keywords;
    }
  }
  
  // Extract dominant function
  const domFuncMatch = text.match(/dominant\s+function:?\s*([^\n]+)/i);
  if (domFuncMatch) {
    blueprint.cognition_mbti.dominant_function = domFuncMatch[1].trim();
  }
  
  // Extract auxiliary function
  const auxFuncMatch = text.match(/auxiliary\s+function:?\s*([^\n]+)/i);
  if (auxFuncMatch) {
    blueprint.cognition_mbti.auxiliary_function = auxFuncMatch[1].trim();
  }
}

function extractHumanDesignData(text, blueprint) {
  // Extract Human Design type
  const typeMatch = text.match(/type:?\s*(\w+)/i) || 
                   text.match(/human design type:?\s*(\w+)/i);
  if (typeMatch) blueprint.energy_strategy_human_design.type = capitalizeFirstLetter(typeMatch[1].trim());
  
  // Extract profile
  const profileMatch = text.match(/profile:?\s*([^\n]+)/i);
  if (profileMatch) {
    blueprint.energy_strategy_human_design.profile = profileMatch[1].trim();
  }
  
  // Extract authority
  const authorityMatch = text.match(/authority:?\s*([^\n]+)/i);
  if (authorityMatch) {
    blueprint.energy_strategy_human_design.authority = capitalizeFirstLetter(authorityMatch[1].trim());
  }
  
  // Extract strategy
  const strategyMatch = text.match(/strategy:?\s*([^\n]+)/i);
  if (strategyMatch) {
    blueprint.energy_strategy_human_design.strategy = strategyMatch[1].trim();
  }
  
  // Extract definition
  const defMatch = text.match(/definition:?\s*([^\n]+)/i);
  if (defMatch) {
    blueprint.energy_strategy_human_design.definition = capitalizeFirstLetter(defMatch[1].trim());
  }
  
  // Extract not-self theme
  const notSelfMatch = text.match(/not.?self\s+theme:?\s*([^\n]+)/i);
  if (notSelfMatch) {
    blueprint.energy_strategy_human_design.not_self_theme = capitalizeFirstLetter(notSelfMatch[1].trim());
  }
  
  // Extract life purpose
  const purposeMatch = text.match(/life\s+purpose:?\s*([^\n]+)/i);
  if (purposeMatch) {
    blueprint.energy_strategy_human_design.life_purpose = purposeMatch[1].trim();
  }
  
  // Extract gates
  const gatesSection = text.match(/gates:?\s*([\s\S]*?)(?=\n\s*\w+:|$)/i);
  if (gatesSection) {
    // Try to extract unconscious design gates
    const unconsciousMatch = gatesSection[1].match(/unconscious[\s\w]*:?\s*([^\n]+)/i);
    if (unconsciousMatch) {
      const gates = unconsciousMatch[1].match(/\d+\.\d+/g);
      if (gates && gates.length > 0) {
        blueprint.energy_strategy_human_design.gates.unconscious_design = gates;
      }
    }
    
    // Try to extract conscious personality gates
    const consciousMatch = gatesSection[1].match(/conscious[\s\w]*:?\s*([^\n]+)/i);
    if (consciousMatch) {
      const gates = consciousMatch[1].match(/\d+\.\d+/g);
      if (gates && gates.length > 0) {
        blueprint.energy_strategy_human_design.gates.conscious_personality = gates;
      }
    }
    
    // Fallback: if we can't find specifically labeled gates, just take any gate numbers we find
    if (!unconsciousMatch && !consciousMatch) {
      const allGates = gatesSection[1].match(/\d+\.\d+/g);
      if (allGates && allGates.length > 0) {
        const halfIndex = Math.ceil(allGates.length / 2);
        blueprint.energy_strategy_human_design.gates.unconscious_design = allGates.slice(0, halfIndex);
        blueprint.energy_strategy_human_design.gates.conscious_personality = allGates.slice(halfIndex);
      }
    }
  }
  
  // Extract centers data
  const centersMatch = text.match(/centers:?\s*([\s\S]*?)(?=\n\s*\w+:|$)/i);
  if (centersMatch) {
    const centersText = centersMatch[1];
    
    // Check for defined centers
    blueprint.energy_strategy_human_design.centers = {
      root: centersText.match(/root[\s-]*center:?\s*defined/i) !== null,
      sacral: centersText.match(/sacral[\s-]*center:?\s*defined/i) !== null,
      spleen: centersText.match(/spleen[\s-]*center:?\s*defined/i) !== null,
      solar_plexus: centersText.match(/solar[\s-]*plexus[\s-]*center:?\s*defined/i) !== null,
      heart: centersText.match(/heart[\s-]*center:?\s*defined/i) !== null || 
             centersText.match(/ego[\s-]*center:?\s*defined/i) !== null,
      throat: centersText.match(/throat[\s-]*center:?\s*defined/i) !== null,
      ajna: centersText.match(/ajna[\s-]*center:?\s*defined/i) !== null,
      head: centersText.match(/head[\s-]*center:?\s*defined/i) !== null || 
            centersText.match(/crown[\s-]*center:?\s*defined/i) !== null,
      g: centersText.match(/g[\s-]*center:?\s*defined/i) !== null
    };
  }
}

function extractNumerologyData(text, blueprint) {
  // Extract Life Path Number
  const lifePathMatch = text.match(/life\s*path\s*number:?\s*(\d+)/i);
  if (lifePathMatch) blueprint.values_life_path.life_path_number = parseInt(lifePathMatch[1]);
  
  // Extract life path keyword
  const lifePathKwMatch = text.match(/life\s*path\s*keyword:?\s*([^\n]+)/i);
  if (lifePathKwMatch) {
    blueprint.values_life_path.life_path_keyword = lifePathKwMatch[1].trim();
  }
  
  // Extract life path description
  const lifePathDescMatch = text.match(/life\s*path\s*description:?\s*([^\n]+)/i);
  if (lifePathDescMatch) {
    blueprint.values_life_path.life_path_description = lifePathDescMatch[1].trim();
  }
  
  // Extract birth day number
  const birthDayMatch = text.match(/birth\s*day\s*number:?\s*(\d+)/i);
  if (birthDayMatch) {
    blueprint.values_life_path.birth_day_number = parseInt(birthDayMatch[1]);
  }
  
  // Extract birth day meaning
  const birthDayMeaningMatch = text.match(/birth\s*day\s*meaning:?\s*([^\n]+)/i);
  if (birthDayMeaningMatch) {
    blueprint.values_life_path.birth_day_meaning = birthDayMeaningMatch[1].trim();
  }
  
  // Extract personal year
  const personalYearMatch = text.match(/personal\s*year:?\s*(\d+)/i);
  if (personalYearMatch) {
    blueprint.values_life_path.personal_year = parseInt(personalYearMatch[1]);
  }
  
  // Extract expression number
  const expressionMatch = text.match(/expression\s*number:?\s*(\d+)/i);
  if (expressionMatch) {
    blueprint.values_life_path.expression_number = parseInt(expressionMatch[1]);
  }
  
  // Extract expression keyword
  const expressionKwMatch = text.match(/expression\s*keyword:?\s*([^\n]+)/i);
  if (expressionKwMatch) {
    blueprint.values_life_path.expression_keyword = expressionKwMatch[1].trim();
  }
  
  // Extract soul urge number
  const soulMatch = text.match(/soul\s*urge\s*number:?\s*(\d+)/i);
  if (soulMatch) {
    blueprint.values_life_path.soul_urge_number = parseInt(soulMatch[1]);
  }
  
  // Extract soul urge keyword
  const soulKwMatch = text.match(/soul\s*urge\s*keyword:?\s*([^\n]+)/i);
  if (soulKwMatch) {
    blueprint.values_life_path.soul_urge_keyword = soulKwMatch[1].trim();
  }
  
  // Extract personality number
  const personalityMatch = text.match(/personality\s*number:?\s*(\d+)/i);
  if (personalityMatch) {
    blueprint.values_life_path.personality_number = parseInt(personalityMatch[1]);
  }
}

function extractWesternAstrologyData(text, blueprint) {
  // Extract Sun Sign
  const sunSignMatch = text.match(/sun\s*sign:?\s*([\w\s♈♉♊♋♌♍♎♏♐♑♒♓]+)/i);
  if (sunSignMatch) {
    let sunSign = sunSignMatch[1].trim();
    // Add zodiac symbol if missing
    if (!sunSign.match(/[♈♉♊♋♌♍♎♏♐♑♒♓]/)) {
      const zodiacSymbols = {
        "aries": "♈︎",
        "taurus": "♉︎",
        "gemini": "♊︎",
        "cancer": "♋︎",
        "leo": "♌︎",
        "virgo": "♍︎",
        "libra": "♎︎",
        "scorpio": "♏︎",
        "sagittarius": "♐︎",
        "capricorn": "♑︎",
        "aquarius": "♒︎",
        "pisces": "♓︎"
      };
      
      for (const sign in zodiacSymbols) {
        if (sunSign.toLowerCase().includes(sign)) {
          sunSign = capitalizeFirstLetter(sign) + " " + zodiacSymbols[sign];
          break;
        }
      }
    }
    blueprint.archetype_western.sun_sign = sunSign;
  }
  
  // Extract sun keyword
  const sunKwMatch = text.match(/sun\s*keyword:?\s*([^\n]+)/i);
  if (sunKwMatch) {
    blueprint.archetype_western.sun_keyword = sunKwMatch[1].trim();
  }
  
  // Extract sun element
  const sunElementMatch = text.match(/sun\s*element:?\s*([^\n]+)/i);
  if (sunElementMatch) {
    blueprint.archetype_western.sun_element = sunElementMatch[1].trim();
  }
  
  // Extract moon sign
  const moonSignMatch = text.match(/moon\s*sign:?\s*([\w\s♈♉♊♋♌♍♎♏♐♑♒♓]+)/i);
  if (moonSignMatch) {
    let moonSign = moonSignMatch[1].trim();
    // Add zodiac symbol if missing
    if (!moonSign.match(/[♈♉♊♋♌♍♎♏♐♑♒♓]/)) {
      const zodiacSymbols = {
        "aries": "♈︎",
        "taurus": "♉︎",
        "gemini": "♊︎",
        "cancer": "♋︎",
        "leo": "♌︎",
        "virgo": "♍︎",
        "libra": "♎︎",
        "scorpio": "♏︎",
        "sagittarius": "♐︎",
        "capricorn": "♑︎",
        "aquarius": "♒︎",
        "pisces": "♓︎"
      };
      
      for (const sign in zodiacSymbols) {
        if (moonSign.toLowerCase().includes(sign)) {
          moonSign = capitalizeFirstLetter(sign) + " " + zodiacSymbols[sign];
          break;
        }
      }
    }
    blueprint.archetype_western.moon_sign = moonSign;
  }
  
  // Extract moon keyword
  const moonKwMatch = text.match(/moon\s*keyword:?\s*([^\n]+)/i);
  if (moonKwMatch) {
    blueprint.archetype_western.moon_keyword = moonKwMatch[1].trim();
  }
  
  // Extract moon element
  const moonElementMatch = text.match(/moon\s*element:?\s*([^\n]+)/i);
  if (moonElementMatch) {
    blueprint.archetype_western.moon_element = moonElementMatch[1].trim();
  }
  
  // Extract rising sign
  const risingMatch = text.match(/rising\s*sign:?\s*([\w\s♈♉♊♋♌♍♎♏♐♑♒♓]+)/i) ||
                     text.match(/ascendant:?\s*([\w\s♈♉♊♋♌♍♎♏♐♑♒♓]+)/i);
  if (risingMatch) {
    let risingSign = risingMatch[1].trim();
    // Add zodiac symbol if missing
    if (!risingSign.match(/[♈♉♊♋♌♍♎♏♐♑♒♓]/)) {
      const zodiacSymbols = {
        "aries": "♈︎",
        "taurus": "♉︎",
        "gemini": "♊︎",
        "cancer": "♋︎",
        "leo": "♌︎",
        "virgo": "♍︎",
        "libra": "♎︎",
        "scorpio": "♏︎",
        "sagittarius": "♐︎",
        "capricorn": "♑︎",
        "aquarius": "♒︎",
        "pisces": "♓︎"
      };
      
      for (const sign in zodiacSymbols) {
        if (risingSign.toLowerCase().includes(sign)) {
          risingSign = capitalizeFirstLetter(sign) + " " + zodiacSymbols[sign];
          break;
        }
      }
    }
    blueprint.archetype_western.rising_sign = risingSign;
  }
  
  // Extract aspects
  const aspectsSection = text.match(/aspects:?\s*([\s\S]*?)(?=\n\s*\w+:|$)/i);
  if (aspectsSection) {
    const aspectLines = aspectsSection[1].split('\n').filter(line => line.trim().length > 0);
    const aspects = [];
    
    for (const line of aspectLines) {
      // Try to match different aspect formats
      const aspectMatch = line.match(/([A-Za-z]+)\s+((?:conjunction|opposition|trine|square|sextile|quincunx|semisextile))\s+([A-Za-z]+)/i);
      
      if (aspectMatch) {
        aspects.push({
          planet: capitalizeFirstLetter(aspectMatch[1].trim()),
          aspect: capitalizeFirstLetter(aspectMatch[2].trim()),
          planet2: capitalizeFirstLetter(aspectMatch[3].trim()),
          orb: "3°" // Default orb
        });
      }
    }
    
    if (aspects.length > 0) {
      blueprint.archetype_western.aspects = aspects;
    }
  }
  
  // Extract houses
  const housesSection = text.match(/houses:?\s*([\s\S]*?)(?=\n\s*\w+:|$)/i);
  if (housesSection) {
    const houseLines = housesSection[1].split('\n').filter(line => line.trim().length > 0);
    const houses = {};
    
    for (const line of houseLines) {
      const houseMatch = line.match(/(\d+)(?:st|nd|rd|th)\s+House:?\s*([\w\s]+)/i) || 
                        line.match(/House\s+(\d+):?\s*([\w\s]+)/i);
      
      if (houseMatch) {
        const houseNum = houseMatch[1].trim();
        const houseSign = houseMatch[2].trim();
        houses[houseNum] = { sign: houseSign, house: `${houseNum}${getOrdinalSuffix(parseInt(houseNum))} House` };
      }
    }
    
    if (Object.keys(houses).length > 0) {
      blueprint.archetype_western.houses = houses;
    }
  }
}

function extractChineseZodiacData(text, blueprint) {
  // Extract animal
  const animalMatch = text.match(/animal:?\s*(\w+)/i) || 
                     text.match(/chinese\s*zodiac\s*sign:?\s*(\w+)/i);
  if (animalMatch) blueprint.archetype_chinese.animal = capitalizeFirstLetter(animalMatch[1]);
  
  // Extract element
  const elementMatch = text.match(/element:?\s*(\w+)/i);
  if (elementMatch) {
    blueprint.archetype_chinese.element = capitalizeFirstLetter(elementMatch[1]);
  }
  
  // Extract yin/yang
  const yinYangMatch = text.match(/yin.?yang:?\s*(\w+)/i);
  if (yinYangMatch) {
    blueprint.archetype_chinese.yin_yang = capitalizeFirstLetter(yinYangMatch[1]);
  }
  
  // Extract keyword
  const keywordMatch = text.match(/keyword:?\s*([^\n]+)/i);
  if (keywordMatch) {
    blueprint.archetype_chinese.keyword = keywordMatch[1].trim();
  }
  
  // Extract element characteristic
  const elementCharMatch = text.match(/element\s*characteristic:?\s*([^\n]+)/i);
  if (elementCharMatch) {
    blueprint.archetype_chinese.element_characteristic = elementCharMatch[1].trim();
  }
  
  // Extract personality profile
  const personalityProfileMatch = text.match(/personality\s*profile:?\s*([^\n]+)/i);
  if (personalityProfileMatch) {
    blueprint.archetype_chinese.personality_profile = personalityProfileMatch[1].trim();
  }
  
  // Extract compatibility
  const compatibilitySection = text.match(/compatibility:?\s*([\s\S]*?)(?=\n\s*\w+:|$)/i);
  if (compatibilitySection) {
    const bestCompMatch = compatibilitySection[1].match(/best:?\s*([^\n]+)/i) || 
                        compatibilitySection[1].match(/most\s*compatible:?\s*([^\n]+)/i);
    if (bestCompMatch) {
      const animals = bestCompMatch[1]
        .split(/[,;]/)
        .map(a => capitalizeFirstLetter(a.trim()))
        .filter(a => a.length > 0);
      
      if (animals.length > 0) {
        blueprint.archetype_chinese.compatibility.best = animals;
      }
    }
    
    const worstCompMatch = compatibilitySection[1].match(/worst:?\s*([^\n]+)/i) || 
                         compatibilitySection[1].match(/least\s*compatible:?\s*([^\n]+)/i);
    if (worstCompMatch) {
      const animals = worstCompMatch[1]
        .split(/[,;]/)
        .map(a => capitalizeFirstLetter(a.trim()))
        .filter(a => a.length > 0);
      
      if (animals.length > 0) {
        blueprint.archetype_chinese.compatibility.worst = animals;
      }
    }
  }
}

/**
 * Helper function to capitalize first letter
 */
function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

/**
 * Helper function to get ordinal suffix
 */
function getOrdinalSuffix(i) {
  const j = i % 10,
        k = i % 100;
  if (j === 1 && k !== 11) {
    return "st";
  }
  if (j === 2 && k !== 12) {
    return "nd";
  }
  if (j === 3 && k !== 13) {
    return "rd";
  }
  return "th";
}

/**
 * Validate the generated blueprint data to ensure factual accuracy
 */
function validateBlueprintData(blueprint, birthData) {
  const { date } = birthData;
  
  // Validate Western Astrology
  validateWesternAstrology(blueprint, date);
  
  // Validate Chinese Zodiac
  validateChineseZodiac(blueprint, date);
  
  // Validate Numerology
  validateNumerology(blueprint, birthData);
  
  return blueprint;
}

/**
 * Validate Western Astrology data against birth date
 */
function validateWesternAstrology(blueprint, birthDate) {
  // Skip validation if western astrology data is missing or incomplete
  if (!blueprint.archetype_western || !birthDate) {
    console.log("Western astrology data is incomplete, skipping validation");
    return;
  }
  
  // Parse birth date
  const [year, month, day] = birthDate.split('-').map(Number);
  const birthMonth = month - 1; // JavaScript months are 0-based
  const birthDay = day;
  
  // Simplified sun sign determination
  const sunSigns = [
    { name: "Capricorn", symbol: "♑︎", startMonth: 11, startDay: 22, endMonth: 0, endDay: 19 },
    { name: "Aquarius", symbol: "♒︎", startMonth: 0, startDay: 20, endMonth: 1, endDay: 18 },
    { name: "Pisces", symbol: "♓︎", startMonth: 1, startDay: 19, endMonth: 2, endDay: 20 },
    { name: "Aries", symbol: "♈︎", startMonth: 2, startDay: 21, endMonth: 3, endDay: 19 },
    { name: "Taurus", symbol: "♉︎", startMonth: 3, startDay: 20, endMonth: 4, endDay: 20 },
    { name: "Gemini", symbol: "♊︎", startMonth: 4, startDay: 21, endMonth: 5, endDay: 20 },
    { name: "Cancer", symbol: "♋︎", startMonth: 5, startDay: 21, endMonth: 6, endDay: 22 },
    { name: "Leo", symbol: "♌︎", startMonth: 6, startDay: 23, endMonth: 7, endDay: 22 },
    { name: "Virgo", symbol: "♍︎", startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
    { name: "Libra", symbol: "♎︎", startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
    { name: "Scorpio", symbol: "♏︎", startMonth: 9, startDay: 23, endMonth: 10, endDay: 21 },
    { name: "Sagittarius", symbol: "♐︎", startMonth: 10, startDay: 22, endMonth: 11, endDay: 21 }
  ];
  
  // Determine correct sun sign
  let correctSunSign = null;
  
  for (const sign of sunSigns) {
    if (
      (birthMonth === sign.startMonth && birthDay >= sign.startDay) ||
      (birthMonth === sign.endMonth && birthDay <= sign.endDay)
    ) {
      correctSunSign = sign;
      break;
    }
  }
  
  if (correctSunSign) {
    // Validate and correct sun sign if needed
    if (!blueprint.archetype_western.sun_sign.includes(correctSunSign.name)) {
      console.log(`Correcting sun sign from ${blueprint.archetype_western.sun_sign} to ${correctSunSign.name} ${correctSunSign.symbol}`);
      blueprint.archetype_western.sun_sign = `${correctSunSign.name} ${correctSunSign.symbol}`;
      // Set a validation flag
      if (!blueprint._validation) blueprint._validation = {};
      blueprint._validation.sun_sign_corrected = true;
    }
    
    // Add sun sign date range if missing
    if (!blueprint.archetype_western.sun_dates) {
      const startMonth = correctSunSign.startMonth;
      const endMonth = correctSunSign.endMonth;
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      
      blueprint.archetype_western.sun_dates = `${monthNames[startMonth]} ${correctSunSign.startDay} - ${monthNames[endMonth]} ${correctSunSign.endDay}`;
    }
  }
}

/**
 * Validate Chinese Zodiac data against birth year
 */
function validateChineseZodiac(blueprint, birthDate) {
  // Skip validation if Chinese zodiac data is missing
  if (!blueprint.archetype_chinese || !birthDate) {
    console.log("Chinese zodiac data is missing, skipping validation");
    return;
  }
  
  const birthYear = parseInt(birthDate.split('-')[0]);
  
  // Chinese zodiac animals in order
  const animals = [
    "Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", 
    "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"
  ];
  
  // Chinese five elements in order (each element repeats for 2 years)
  const elements = ["Wood", "Fire", "Earth", "Metal", "Water"];
  
  // Calculate correct animal and element
  const animalIndex = (birthYear - 4) % 12; // 4 = 1900 was a Rat year
  const elementIndex = Math.floor((birthYear - 4) % 10 / 2); // Each element rules 2 years
  
  const correctAnimal = animals[animalIndex];
  const correctElement = elements[elementIndex];
  
  // Validate and correct animal if needed
  if (!blueprint.archetype_chinese.animal || blueprint.archetype_chinese.animal !== correctAnimal) {
    console.log(`Setting or correcting Chinese zodiac animal to: ${correctAnimal}`);
    blueprint.archetype_chinese.animal = correctAnimal;
    // Set a validation flag
    if (!blueprint._validation) blueprint._validation = {};
    blueprint._validation.chinese_animal_corrected = true;
  }
  
  // Validate and correct element if needed
  if (!blueprint.archetype_chinese.element || blueprint.archetype_chinese.element !== correctElement) {
    console.log(`Setting or correcting Chinese zodiac element to: ${correctElement}`);
    blueprint.archetype_chinese.element = correctElement;
    // Set a validation flag
    if (!blueprint._validation) blueprint._validation = {};
    blueprint._validation.chinese_element_corrected = true;
  }
}

/**
 * Validate Numerology data against birth date and name
 */
function validateNumerology(blueprint, birthData) {
  // Skip validation if numerology data is missing
  if (!blueprint.values_life_path || !birthData.date) {
    console.log("Numerology data is missing, skipping validation");
    return;
  }
  
  const { date, name } = birthData;
  
  const [year, month, day] = date.split('-').map(Number);
  
  // Calculate life path number
  const digitSum = (num) => {
    let sum = 0;
    while (num > 0 || sum > 9) {
      if (num === 0) {
        num = sum;
        sum = 0;
      }
      sum += num % 10;
      num = Math.floor(num / 10);
    }
    return sum;
  };
  
  // Simple life path calculation
  let lifePathNumber = digitSum(year) + digitSum(month) + digitSum(day);
  
  // Reduce to single digit unless master number
  if (lifePathNumber !== 11 && lifePathNumber !== 22 && lifePathNumber !== 33) {
    lifePathNumber = digitSum(lifePathNumber);
  }
  
  // Validate and correct life path number if needed
  if (!blueprint.values_life_path.life_path_number || blueprint.values_life_path.life_path_number !== lifePathNumber) {
    console.log(`Setting or correcting life path number to: ${lifePathNumber}`);
    blueprint.values_life_path.life_path_number = lifePathNumber;
    // Set a validation flag
    if (!blueprint._validation) blueprint._validation = {};
    blueprint._validation.life_path_number_corrected = true;
    
    // Update life path keyword if needed
    const lifePathKeywords = {
      1: "The Leader",
      2: "The Mediator",
      3: "The Creative Communicator",
      4: "The Builder",
      5: "The Freedom Seeker",
      6: "The Nurturer",
      7: "The Seeker of Truth",
      8: "The Powerhouse",
      9: "The Humanitarian",
      11: "The Intuitive",
      22: "The Master Builder",
      33: "The Master Teacher"
    };
    
    if (lifePathKeywords[lifePathNumber]) {
      blueprint.values_life_path.life_path_keyword = lifePathKeywords[lifePathNumber];
    }
  }
  
  // Calculate and set birth day number if missing
  if (!blueprint.values_life_path.birth_day_number) {
    blueprint.values_life_path.birth_day_number = day;
  }
  
  // Calculate current personal year number if missing
  if (!blueprint.values_life_path.personal_year) {
    const currentYear = new Date().getFullYear();
    let personalYear = month + day + currentYear;
    
    // Reduce to single digit unless master number
    while (personalYear > 9 && personalYear !== 11 && personalYear !== 22 && personalYear !== 33) {
      personalYear = digitSum(personalYear);
    }
    
    blueprint.values_life_path.personal_year = personalYear;
  }
}

