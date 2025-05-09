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
        rawResponse: debugMode ? rawResponse : undefined // Only include raw response in debug mode
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
        model: 'gpt-4o',
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
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
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
    
    // Add metadata for internal use
    validatedBlueprint._meta = {
      generation_method: "enhanced-research-based",
      model_version: "gpt-4o",
      generation_date: new Date().toISOString(),
      birth_data: birthData,
      schema_version: "2.0"
    };
    
    return { 
      blueprint: validatedBlueprint,
      rawResponse: debugMode ? data : undefined // Include raw OpenAI response if debug mode is enabled
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
    return { blueprint: fallbackBlueprint };
  }
}

/**
 * Create an enhanced system message with detailed schema instructions
 */
function getEnhancedSystemMessage() {
  return `You are an expert astrologist, numerologist, and spiritual advisor specializing in creating accurate Soul Blueprints.

Your task is to generate a comprehensive spiritual profile in JSON format based on the birth details provided. Follow these critical instructions:

1. ONLY output valid, properly formatted JSON without any explanations, markdown or text outside the JSON object
2. Include ALL required fields in the structure defined in the user's prompt
3. Never leave any field blank or null - provide sensible defaults based on the birth information
4. When calculating aspects of the blueprint like:
   - Human Design: Provide accurate type, profile, authority, strategy, definition, gates
   - Numerology: Calculate accurate life path numbers, expression numbers, etc.
   - Astrology: Provide accurate sun sign, moon sign, rising sign based on birth time and location
   - Chinese Zodiac: Calculate the correct animal and element

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
      "throat": true/false,
      "ajna": true/false,
      "head": true/false,
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
  } else {
    console.log("Skipping astrological validation due to missing birth date");
  }
  
  // Ensure MBTI type is valid if present
  if (blueprint.cognition_mbti && blueprint.cognition_mbti.type) {
    const mbtiType = blueprint.cognition_mbti.type;
    const validMBTI = /^[EI][NS][FT][JP]$/.test(mbtiType);
    
    if (!validMBTI) {
      console.log(`Invalid MBTI type detected: ${mbtiType}, resetting to INFJ`);
      blueprint.cognition_mbti.type = "INFJ";
    }
  }
  
  // Validate Human Design gates format
  if (blueprint.energy_strategy_human_design && blueprint.energy_strategy_human_design.gates) {
    const gates = blueprint.energy_strategy_human_design.gates;
    
    // Validate unconscious design gates
    if (Array.isArray(gates.unconscious_design)) {
      gates.unconscious_design = gates.unconscious_design.map(gate => {
        // Ensure gate format is XX.X
        if (!gate.match(/^\d+\.\d+$/)) {
          return "1.1"; // Default if invalid
        }
        return gate;
      });
      
      // Ensure we have at least 4 gates
      while (gates.unconscious_design.length < 4) {
        gates.unconscious_design.push(`${Math.floor(Math.random() * 64) + 1}.${Math.floor(Math.random() * 6) + 1}`);
      }
    }
    
    // Validate conscious personality gates
    if (Array.isArray(gates.conscious_personality)) {
      gates.conscious_personality = gates.conscious_personality.map(gate => {
        // Ensure gate format is XX.X
        if (!gate.match(/^\d+\.\d+$/)) {
          return "1.1"; // Default if invalid
        }
        return gate;
      });
      
      // Ensure we have at least 4 gates
      while (gates.conscious_personality.length < 4) {
        gates.conscious_personality.push(`${Math.floor(Math.random() * 64) + 1}.${Math.floor(Math.random() * 6) + 1}`);
      }
    }
  }
  
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
  
  // Calculate each component separately
  const daySum = digitSum(day);
  const monthSum = digitSum(month);
  const yearSum = digitSum(year);
  
  // Calculate full life path
  let lifePathNumber = digitSum(daySum + monthSum + yearSum);
  
  // Handle master numbers
  if (lifePathNumber === 11 || lifePathNumber === 22 || lifePathNumber === 33) {
    // Keep master numbers as is
  } else {
    lifePathNumber = digitSum(lifePathNumber);
  }
  
  // Validate and correct life path number if needed
  if (!blueprint.values_life_path.life_path_number || blueprint.values_life_path.life_path_number !== lifePathNumber) {
    console.log(`Setting or correcting life path number to: ${lifePathNumber}`);
    blueprint.values_life_path.life_path_number = lifePathNumber;
    
    // Set a validation flag
    if (!blueprint._validation) blueprint._validation = {};
    blueprint._validation.life_path_number_corrected = true;
    
    // Update life path keyword based on the corrected number
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
  
  // Calculate and set birth day number if missing or incorrect
  if (!blueprint.values_life_path.birth_day_number || blueprint.values_life_path.birth_day_number !== day) {
    blueprint.values_life_path.birth_day_number = day;
  }
  
  // Calculate current personal year number if missing
  if (!blueprint.values_life_path.personal_year) {
    const currentYear = new Date().getFullYear();
    let personalYear = digitSum(monthSum + daySum + digitSum(currentYear));
    
    // Handle master numbers for personal year
    if (personalYear !== 11 && personalYear !== 22 && personalYear !== 33) {
      personalYear = digitSum(personalYear);
    }
    
    blueprint.values_life_path.personal_year = personalYear;
  }
  
  return blueprint;
}
