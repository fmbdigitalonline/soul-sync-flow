
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
          content: 'You are an expert astrologist, numerologist, and spiritual advisor tasked with creating accurate Soul Blueprints. Your responses must be factually accurate based on established spiritual systems.' 
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
  
  // Parse the generated content into structured blueprint data
  const parsedBlueprint = parseGeneratedContent(generatedContent);
  
  // Apply mechanical validation to ensure factual accuracy
  const validatedBlueprint = validateBlueprintData(parsedBlueprint, birthData);
  
  // Add metadata for internal use (not displayed to user but available for AI Coach)
  validatedBlueprint._meta = {
    generation_method: "research-based",
    model_version: "gpt-4o",
    generation_date: new Date().toISOString(),
    birth_data: birthData,
    raw_content: generatedContent
  };
  
  return validatedBlueprint;
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

Format your response as valid JSON that can be directly parsed. Ensure all calculations are performed according to established astrological, numerological, and Human Design systems.`;
}

/**
 * Parse the AI-generated text into a structured blueprint object
 */
function parseGeneratedContent(content) {
  try {
    // First try to parse directly as JSON
    try {
      return JSON.parse(content);
    } catch (e) {
      console.log("Direct JSON parsing failed, trying to extract JSON from text");
      
      // If direct parsing fails, try to extract JSON from markdown blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // If no JSON format is found, use structured approach to parse the content
      return structuredParsing(content);
    }
  } catch (error) {
    console.error("Error parsing AI response:", error);
    throw new Error("Failed to parse AI-generated content");
  }
}

/**
 * Fallback parsing method for when the AI response isn't properly formatted as JSON
 */
function structuredParsing(content) {
  // Initialize blueprint with default structure
  const blueprint = {
    user_meta: {},
    cognition_mbti: {
      core_keywords: []
    },
    energy_strategy_human_design: {
      gates: {
        unconscious_design: [],
        conscious_personality: []
      }
    },
    bashar_suite: {
      belief_interface: {},
      excitement_compass: {},
      frequency_alignment: {}
    },
    values_life_path: {},
    archetype_western: {
      aspects: [],
      houses: {}
    },
    archetype_chinese: {
      compatibility: {
        best: [],
        worst: []
      }
    },
    timing_overlays: {
      current_transits: [],
      notes: ""
    },
    goal_stack: [],
    task_graph: {},
    belief_logs: [],
    excitement_scores: [],
    vibration_check_ins: []
  };
  
  // Extract sections based on common patterns
  const sections = content.split(/\n#{1,3}\s+/);
  
  // Process each section to extract relevant data
  for (const section of sections) {
    if (section.toLowerCase().includes('mbti') || section.toLowerCase().includes('personality type')) {
      extractMBTIData(section, blueprint);
    } else if (section.toLowerCase().includes('human design')) {
      extractHumanDesignData(section, blueprint);
    } else if (section.toLowerCase().includes('numerology') || section.toLowerCase().includes('life path')) {
      extractNumerologyData(section, blueprint);
    } else if (section.toLowerCase().includes('western astrology') || section.toLowerCase().includes('sun sign')) {
      extractWesternAstrologyData(section, blueprint);
    } else if (section.toLowerCase().includes('chinese zodiac')) {
      extractChineseZodiacData(section, blueprint);
    }
  }
  
  return blueprint;
}

/**
 * Helper functions to extract data from different sections
 * These would parse text into structured data for each blueprint section
 */
function extractMBTIData(text, blueprint) {
  // Implementation for extracting MBTI data
  const typeMatch = text.match(/type:?\s*([A-Z]{4})/i);
  if (typeMatch) blueprint.cognition_mbti.type = typeMatch[1].toUpperCase();
  
  // Extract keywords, dominant function, etc.
  // ... implementation details
}

function extractHumanDesignData(text, blueprint) {
  // Implementation for extracting Human Design data
  const typeMatch = text.match(/type:?\s*(\w+)/i);
  if (typeMatch) blueprint.energy_strategy_human_design.type = typeMatch[1];
  
  // Extract profile, authority, etc.
  // ... implementation details
}

function extractNumerologyData(text, blueprint) {
  // Implementation for extracting Numerology data
  const lifePathMatch = text.match(/life\s*path\s*number:?\s*(\d+)/i);
  if (lifePathMatch) blueprint.values_life_path.life_path_number = parseInt(lifePathMatch[1]);
  
  // Extract expression number, soul urge number, etc.
  // ... implementation details
}

function extractWesternAstrologyData(text, blueprint) {
  // Implementation for extracting Western Astrology data
  const sunSignMatch = text.match(/sun\s*sign:?\s*([\w\s♈♉♊♋♌♍♎♏♐♑♒♓]+)/i);
  if (sunSignMatch) blueprint.archetype_western.sun_sign = sunSignMatch[1].trim();
  
  // Extract moon sign, rising sign, etc.
  // ... implementation details
}

function extractChineseZodiacData(text, blueprint) {
  // Implementation for extracting Chinese Zodiac data
  const animalMatch = text.match(/animal:?\s*(\w+)/i);
  if (animalMatch) blueprint.archetype_chinese.animal = animalMatch[1];
  
  // Extract element, yin/yang, etc.
  // ... implementation details
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
    if (!blueprint.archetype_western.sun_sign || 
        !blueprint.archetype_western.sun_sign.includes(correctSunSign.name)) {
      blueprint.archetype_western.sun_sign = `${correctSunSign.name} ${correctSunSign.symbol}`;
      // Set a validation flag
      if (!blueprint._validation) blueprint._validation = {};
      blueprint._validation.sun_sign_corrected = true;
    }
  }
}

/**
 * Validate Chinese Zodiac data against birth year
 */
function validateChineseZodiac(blueprint, birthDate) {
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
  if (blueprint.archetype_chinese.animal !== correctAnimal) {
    blueprint.archetype_chinese.animal = correctAnimal;
    // Set a validation flag
    if (!blueprint._validation) blueprint._validation = {};
    blueprint._validation.chinese_animal_corrected = true;
  }
  
  // Validate and correct element if needed
  if (blueprint.archetype_chinese.element !== correctElement) {
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
  if (blueprint.values_life_path.life_path_number !== lifePathNumber) {
    blueprint.values_life_path.life_path_number = lifePathNumber;
    // Set a validation flag
    if (!blueprint._validation) blueprint._validation = {};
    blueprint._validation.life_path_number_corrected = true;
  }
}
