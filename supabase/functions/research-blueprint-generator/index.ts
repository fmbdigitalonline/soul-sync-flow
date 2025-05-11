import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Edge function to generate soul blueprints using a research-based approach with GPT-4.1
 */
serve(async (req) => {
  // Handle CORS preflight requests - CRITICAL for proper functioning
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    const { birthData, debugMode } = await req.json();
    const { date, time, location, timezone, name } = birthData;

    console.log(`Processing blueprint for: ${name}, born on ${date} at ${time} in ${location}`);

    if (!OPENAI_API_KEY) {
      throw new Error("Missing OpenAI API key");
    }

    // Generate the blueprint using OpenAI
    const { blueprint, rawResponse } = await generateResearchBasedBlueprint(birthData, debugMode);
    
    // Return the generated blueprint
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: blueprint,
        rawResponse: rawResponse // Include raw response for all requests
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
 * Generate a research-based blueprint using OpenAI's GPT-4.1
 * @param birthData The user's birth information
 * @param debugMode Whether to include raw API response
 * @returns A complete blueprint object with detailed spiritual and personality insights
 */
async function generateResearchBasedBlueprint(birthData, debugMode = false) {
  const { date, time, location, timezone, name } = birthData;
  
  try {
    console.log("Calling OpenAI with enhanced structured prompt...");

    // Generate a comprehensive system message with schema definition
    const systemMessage = getEnhancedSystemMessage();
    
    // Get the improved prompt for blueprint generation
    const userPrompt = getEnhancedBlueprintPrompt(birthData);
    
    // Call OpenAI with structured request format
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14', // Updated to GPT-4.1
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" }, // Enforce JSON response
        top_p: 0.95,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    console.log("Received structured JSON from OpenAI");
    
    // Parse and validate the generated content
    const parsedBlueprint = JSON.parse(generatedContent);
    
    // Initialize empty sections if they don't exist to avoid validation errors
    const completeBlueprint = ensureBlueprintStructure(parsedBlueprint);
    
    // Apply mechanical validation to ensure factual accuracy
    const validatedBlueprint = validateBlueprintData(completeBlueprint, birthData);
    
    // Add metadata for internal use and store the raw response
    validatedBlueprint._meta = {
      generation_method: "enhanced-research-based-gpt4.1",
      model_version: "gpt-4.1-2025-04-14",
      generation_date: new Date().toISOString(),
      birth_data: birthData,
      schema_version: "2.0",
      raw_response: generatedContent // Store raw response in the blueprint metadata
    };
    
    return { 
      blueprint: validatedBlueprint,
      rawResponse: data // Include raw OpenAI response
    };
  } catch (error) {
    console.error("Error during blueprint generation:", error);
    
    // Create a minimal fallback blueprint with debug info
    const fallbackBlueprint = createMinimalBlueprint();
    
    // Add error details to the debugging metadata
    fallbackBlueprint._meta = {
      generation_method: "fallback",
      error: error.message,
      error_time: new Date().toISOString(),
      birth_data: birthData,
    };
    
    console.log("Using fallback blueprint due to error");
    return { blueprint: fallbackBlueprint, rawResponse: null };
  }
}

/**
 * Create an enhanced system message with detailed schema instructions
 */
function getEnhancedSystemMessage() {
  return `You are a professional spiritual analyst, trained in Western astrology, Chinese metaphysics, numerology, and Human Design.

Do not rely only on your pre-trained knowledge. Use live web search to fetch accurate, verifiable data such as:
- Planetary positions, houses, sun, moon, rising signs based on birth time and location
- Chinese Zodiac animal, element, and yin/yang based on the exact birth year and lunar calendar rules
- Numerology calculations, especially life path numbers, derived from full birth date
- Verified Human Design profile, including type, strategy, authority, profile, defined centers, gates, and incarnation cross, based on reliable Human Design sources

Only after completing these lookups, synthesize all findings into a single, deeply integrated personality and soul blueprint.

Your task is to generate a comprehensive spiritual profile in JSON format based on the birth details provided. Follow these critical instructions:

1. ONLY output valid, properly formatted JSON without any explanations, markdown or text outside the JSON object
2. Include ALL required fields in the structure defined in the user's prompt
3. Never leave any field blank or null - provide sensible defaults based on the birth information
4. When calculating aspects of the blueprint like:
   - Human Design: Provide accurate type, profile, authority, strategy, definition, gates
   - Numerology: Calculate accurate life path numbers, expression numbers, etc.
   - Astrology: Provide accurate sun sign, moon sign, rising sign based on birth time and location
   - Chinese Zodiac: Calculate the correct animal and element

Ensure the result cross-validates all systems for consistency.

IMPORTANT: Pay special attention to the human_design and numerology sections - these MUST be complete with ALL required fields.

Your response must be a complete, well-structured JSON object with no trailing comments or explanations.`;
}

/**
 * Creates an enhanced, structured prompt for the AI to generate a complete blueprint
 */
function getEnhancedBlueprintPrompt(birthData) {
  const { date, time, location, timezone, name } = birthData;
  const preferredName = name.split(' ')[0] || name;
  
  return `Generate a complete Soul Blueprint for ${name} (preferred name: ${preferredName}) born on ${date} at ${time} in ${location}, timezone ${timezone}.

Your response MUST be a JSON object with EXACTLY this structure (with all fields completed):

{
  "user_meta": {
    "full_name": "${name}",
    "preferred_name": "${preferredName}",
    "birth_date": "${date}",
    "birth_time_local": "${time}",
    "birth_location": "${location}",
    "timezone": "${timezone}"
  },
  "cognition_mbti": {
    "type": "XXXX",
    "core_keywords": ["Keyword1", "Keyword2", "Keyword3"],
    "dominant_function": "Function description",
    "auxiliary_function": "Function description"
  },
  "energy_strategy_human_design": {
    "type": "Type name",
    "profile": "X/X (Name/Name)",
    "authority": "Authority name",
    "strategy": "Strategy description",
    "definition": "Definition type",
    "not_self_theme": "Theme description",
    "life_purpose": "Purpose description",
    "centers": {
      "root": true/false,
      "sacral": true/false,
      "spleen": true/false,
      "solar_plexus": true/false,
      "heart": true/false,
      "throat": false,
      "ajna": false,
      "head": false,
      "g": true/false
    },
    "gates": {
      "unconscious_design": ["XX.X", "XX.X", "XX.X", "XX.X"],
      "conscious_personality": ["XX.X", "XX.X", "XX.X", "XX.X"]
    }
  },
  "values_life_path": {
    "life_path_number": X,
    "life_path_keyword": "Keyword",
    "life_path_description": "Detailed description of life path purpose",
    "birth_day_number": XX,
    "birth_day_meaning": "Meaning for the birth day number",
    "personal_year": XXXX,
    "expression_number": X,
    "expression_keyword": "Keyword",
    "soul_urge_number": X,
    "soul_urge_keyword": "Keyword",
    "personality_number": X
  },
  "archetype_western": {
    "sun_sign": "Sign ♈︎",
    "sun_keyword": "Keyword",
    "sun_dates": "Month Day - Month Day",
    "sun_element": "Element",
    "sun_qualities": "Quality1, Quality2",
    "moon_sign": "Sign ♈︎",
    "moon_keyword": "Keyword",
    "moon_element": "Element",
    "rising_sign": "Sign ♈︎",
    "aspects": [
      {
        "planet": "Planet1",
        "aspect": "Aspect type",
        "planet2": "Planet2",
        "orb": "X°"
      }
    ],
    "houses": {
      "1": {"sign": "Sign", "house": "1st House"},
      "2": {"sign": "Sign", "house": "2nd House"}
    }
  },
  "archetype_chinese": {
    "animal": "Animal",
    "element": "Element",
    "yin_yang": "Yin/Yang",
    "keyword": "Keyword",
    "element_characteristic": "Characteristic description",
    "personality_profile": "Detailed personality profile",
    "compatibility": {
      "best": ["Animal1", "Animal2", "Animal3"],
      "worst": ["Animal1", "Animal2", "Animal3"]
    }
  },
  "bashar_suite": {
    "belief_interface": {
      "principle": "What you believe is what you experience as reality",
      "reframe_prompt": "What would I have to believe to experience this?"
    },
    "excitement_compass": {
      "principle": "Follow your highest excitement in the moment to the best of your ability"
    },
    "frequency_alignment": {
      "quick_ritual": "Visualize feeling the way you want to feel for 17 seconds"
    }
  }
}

NOTE: Your response MUST be properly formatted, valid JSON with all fields included. Pay special attention to:
1. The Human Design section must have properly formatted gates (e.g., "32.1", "27.4")
2. The numerology section must have accurate calculations based on the birth date
3. All astrological signs must include their proper unicode symbols
4. No fields should be null or missing`;
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
        g: false,
        ...(blueprint.energy_strategy_human_design?.centers || {})
      },
      gates: {
        unconscious_design: ["34.3", "10.1", "57.4", "44.2"],
        conscious_personality: ["20.5", "57.2", "51.6", "27.4"],
        ...(blueprint.energy_strategy_human_design?.gates || {})
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
      life_path_description: "Focused on spiritual growth and inner wisdom",
      birth_day_number: 15,
      birth_day_meaning: "Adaptable and versatile energy",
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
      houses: blueprint.archetype_western?.houses || {
        "1": {"sign": "Virgo", "house": "1st House"},
        "2": {"sign": "Libra", "house": "2nd House"}
      },
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
      notes: "Generated using enhanced research-based approach",
      ...(blueprint.timing_overlays || {})
    },
    goal_stack: blueprint.goal_stack || [],
    task_graph: blueprint.task_graph || {},
    belief_logs: blueprint.belief_logs || [],
    excitement_scores: blueprint.excitement_scores || [],
    vibration_check_ins: blueprint.vibration_check_ins || []
  };

  // Ensure key human design properties exist
  if (!completeBlueprint.energy_strategy_human_design.centers) {
    completeBlueprint.energy_strategy_human_design.centers = {
      root: false,
      sacral: true,
      spleen: false,
      solar_plexus: true,
      heart: false,
      throat: false,
      ajna: false,
      head: false,
      g: false
    };
  }

  if (!completeBlueprint.energy_strategy_human_design.gates || 
      !completeBlueprint.energy_strategy_human_design.gates.unconscious_design || 
      !completeBlueprint.energy_strategy_human_design.gates.conscious_personality) {
    completeBlueprint.energy_strategy_human_design.gates = {
      unconscious_design: ["34.3", "10.1", "57.4", "44.2"],
      conscious_personality: ["20.5", "57.2", "51.6", "27.4"]
    };
  }

  return completeBlueprint;
}

/**
 * Creates a minimal but valid blueprint structure when parsing fails
 */
function createMinimalBlueprint() {
  return {
    user_meta: {
      full_name: "User",
      preferred_name: "User",
      birth_date: "",
      birth_time_local: "",
      birth_location: "",
      timezone: ""
    },
    cognition_mbti: {
      type: "INFJ",
      core_keywords: ["Insightful", "Intuitive", "Reserved"],
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
      life_path_description: "Focused on spiritual growth and inner wisdom",
      birth_day_number: 15,
      birth_day_meaning: "Adaptable and versatile energy",
      personal_year: new Date().getFullYear() % 9 || 9,
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
        { planet: "Sun", aspect: "Conjunction", planet2: "Mercury", orb: "3°" },
        { planet: "Moon", aspect: "Trine", planet2: "Venus", orb: "4°" }
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

/**
 * Validate the generated blueprint data to ensure factual accuracy
 */
function validateBlueprintData(blueprint, birthData) {
  const { date } = birthData;
  
  // If date is valid, validate western and chinese astrology 
  if (date) {
    validateWesternAstrology(blueprint, date);
    validateChineseZodiac(blueprint, date);
    validateNumerology(blueprint, birthData);
    validateHumanDesign(blueprint, birthData);
  } else {
    console.log("Skipping astrological validation due to missing birth date");
  }
  
  return blueprint;
}

/**
 * Validate and potentially correct western astrology data
 */
function validateWesternAstrology(blueprint, birthDate) {
  // Basic validation of sun sign based on birth month and day
  const date = new Date(birthDate);
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  const day = date.getDate();

  // Only perform basic check if western astrology data exists
  if (blueprint.archetype_western) {
    const correctSign = getZodiacSignFromDate(month, day);
    
    // If sun sign is wrong, correct it
    if (blueprint.archetype_western.sun_sign && 
        !blueprint.archetype_western.sun_sign.includes(correctSign.name)) {
      console.log(`Correcting sun sign from ${blueprint.archetype_western.sun_sign} to ${correctSign.name} ${correctSign.symbol}`);
      blueprint.archetype_western.sun_sign = `${correctSign.name} ${correctSign.symbol}`;
      blueprint.archetype_western.sun_dates = `${correctSign.start_date} - ${correctSign.end_date}`;
    }
  }
  
  return blueprint;
}

/**
 * Validate and potentially correct Chinese zodiac calculations
 */
function validateChineseZodiac(blueprint, birthDate) {
  const date = new Date(birthDate);
  const year = date.getFullYear();
  
  // Chinese zodiac operates on a 12-year cycle
  const animals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
  
  // Calculate animal - Fixed calculation for Chinese zodiac
  // For Chinese zodiac, the animal is determined by the year mod 12
  const animalIndex = (year - 4) % 12;
  const correctAnimal = animals[animalIndex];
  
  // Only correct if chinese zodiac data exists and is wrong
  if (blueprint.archetype_chinese && 
      blueprint.archetype_chinese.animal !== correctAnimal) {
    console.log(`Correcting Chinese zodiac from ${blueprint.archetype_chinese.animal} to ${correctAnimal}`);
    blueprint.archetype_chinese.animal = correctAnimal;
  }
  
  return blueprint;
}

/**
 * Validate and correct numerology calculations based on birth date
 */
function validateNumerology(blueprint, birthData) {
  if (!blueprint.values_life_path) return blueprint;
  
  const date = new Date(birthData.date);
  const day = date.getDate();
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  const year = date.getFullYear();
  
  // Calculate correct life path number
  const correctLifePathNumber = calculateLifePathNumber(day, month, year);
  
  // Update if different
  if (blueprint.values_life_path.life_path_number !== correctLifePathNumber) {
    console.log(`Correcting life path number from ${blueprint.values_life_path.life_path_number} to ${correctLifePathNumber}`);
    blueprint.values_life_path.life_path_number = correctLifePathNumber;
    
    // Update keyword based on the corrected number
    const keywords = {
      1: "Independent Leader",
      2: "Cooperative Peacemaker",
      3: "Creative Communicator",
      4: "Practical Builder",
      5: "Freedom Seeker",
      6: "Responsible Nurturer",
      7: "Seeker of Truth",
      8: "Abundant Manifester",
      9: "Humanitarian",
      11: "Intuitive Channel",
      22: "Master Builder",
      33: "Master Teacher"
    };
    
    blueprint.values_life_path.life_path_keyword = keywords[correctLifePathNumber] || "Seeker";
  }
  
  // Ensure birth day number is accurate
  if (blueprint.values_life_path.birth_day_number !== day) {
    blueprint.values_life_path.birth_day_number = day;
  }
  
  return blueprint;
}

/**
 * Calculate the life path number using the accurate algorithm
 */
function calculateLifePathNumber(day, month, year) {
  console.log(`Life Path inputs - Day: ${day}, Month: ${month}, Year: ${year}`);
  
  // Sum each component separately
  let daySum = reduceSingleDigit(day);
  let monthSum = reduceSingleDigit(month);
  let yearSum = reduceSingleDigit(year.toString().split('').reduce((a, b) => a + parseInt(b), 0));
  
  console.log(`Component sums - Day: ${daySum}, Month: ${monthSum}, Year: ${yearSum}`);
  
  // Sum the individual component sums
  let totalSum = daySum + monthSum + yearSum;
  
  console.log(`Total sum before final reduction: ${totalSum}`);
  
  // Final reduction to get the Life Path Number
  // Check if the sum is a master number before reduction
  if (totalSum === 11 || totalSum === 22 || totalSum === 33) {
    return totalSum;
  }
  
  // Otherwise reduce to a single digit
  return reduceSingleDigit(totalSum);
}

/**
 * Reduce a number to a single digit unless it's a master number
 */
function reduceSingleDigit(num) {
  // First, convert the number to a string to handle multi-digit numbers
  let numStr = num.toString();
  
  // Continue summing digits until we reach a single digit or a master number
  while (numStr.length > 1 && 
         numStr !== '11' && 
         numStr !== '22' && 
         numStr !== '33') {
    // Sum the digits
    let sum = 0;
    for (let i = 0; i < numStr.length; i++) {
      sum += parseInt(numStr[i]);
    }
    numStr = sum.toString();
  }
  
  return parseInt(numStr);
}

/**
 * Validate and enhance Human Design data
 */
function validateHumanDesign(blueprint, birthData) {
  const { date, time, location } = birthData;
  
  // Only proceed if we have human design data
  if (!blueprint.energy_strategy_human_design) return blueprint;
  
  // Calculate basic deterministic Human Design properties based on birth date
  // This is a simplified approach but more accurate than random assignment
  
  // Create a deterministic but unique seed from the birth data
  const birthTimestamp = new Date(date + (time ? ` ${time}` : '')).getTime();
  const seed = birthTimestamp % 1000000;
  
  // Determine type based on birth date hash
  const types = ["Generator", "Manifesting Generator", "Manifestor", "Projector", "Reflector"];
  const typeIndex = seed % 5;
  
  // Only override if the current value seems incorrect
  const currentType = blueprint.energy_strategy_human_design.type;
  if (!types.includes(currentType)) {
    console.log(`Correcting Human Design type from ${currentType} to ${types[typeIndex]}`);
    blueprint.energy_strategy_human_design.type = types[typeIndex];
  }
  
  // Validate profile format (should be X/X format)
  const profile = blueprint.energy_strategy_human_design.profile;
  const profilePattern = /^\d\/\d/;
  if (!profilePattern.test(profile)) {
    // Assign a valid profile based on birthDate hash
    const lines = [1, 2, 3, 4, 5, 6];
    const line1 = lines[seed % 6];
    const line2 = lines[(seed + 3) % 6]; // Offset to get a different number
    console.log(`Correcting Human Design profile from ${profile} to ${line1}/${line2}`);
    blueprint.energy_strategy_human_design.profile = `${line1}/${line2}`;
  }
  
  // Ensure strategy is aligned with type
  const currentStrategy = blueprint.energy_strategy_human_design.strategy;
  if (blueprint.energy_strategy_human_design.type === "Generator" && 
      !currentStrategy.toLowerCase().includes("wait") && 
      !currentStrategy.toLowerCase().includes("respond")) {
    blueprint.energy_strategy_human_design.strategy = "Wait to respond";
  }
  
  return blueprint;
}

/**
 * Helper function to get the zodiac sign from date
 */
function getZodiacSignFromDate(month, day) {
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return { name: 'Aquarius', symbol: '♒︎', start_date: "Jan 20", end_date: "Feb 18" };
  } else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) {
    return { name: 'Pisces', symbol: '♓︎', start_date: "Feb 19", end_date: "Mar 20" };
  } else if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return { name: 'Aries', symbol: '♈︎', start_date: "Mar 21", end_date: "Apr 19" };
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return { name: 'Taurus', symbol: '♉︎', start_date: "Apr 20", end_date: "May 20" };
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return { name: 'Gemini', symbol: '♊︎', start_date: "May 21", end_date: "Jun 20" };
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return { name: 'Cancer', symbol: '♋︎', start_date: "Jun 21", end_date: "Jul 22" };
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return { name: 'Leo', symbol: '♌︎', start_date: "Jul 23", end_date: "Aug 22" };
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return { name: 'Virgo', symbol: '♍︎', start_date: "Aug 23", end_date: "Sep 22" };
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return { name: 'Libra', symbol: '♎︎', start_date: "Sep 23", end_date: "Oct 22" };
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return { name: 'Scorpio', symbol: '♏︎', start_date: "Oct 23", end_date: "Nov 21" };
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return { name: 'Sagittarius', symbol: '♐︎', start_date: "Nov 22", end_date: "Dec 21" };
  } else {
    return { name: 'Capricorn', symbol: '♑︎', start_date: "Dec 22", end_date: "Jan 19" };
  }
}
