
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// Change to import the new Astronomy Engine implementation
import { calculatePlanetaryPositionsWithAstro } from "./ephemeris-astroengine.ts";
import { calculateHumanDesign } from './human-design.ts';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Structure for error responses
interface ErrorResponse {
  error: string;
  details?: any;
  code: string;
}

// Structure for calculation results
interface CalculationResults {
  celestialData: any;
  westernProfile: any;
  chineseZodiac: any;
  numerology: any;
  humanDesign: any;
  calculation_metadata?: {
    success: boolean;
    partial: boolean;
    errors?: Record<string, string>;
    calculated_at: string;
    input: any;
    engine?: string;
    debug?: any; // For debugging info
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    let birthData;
    try {
      const body = await req.json();
      birthData = body.birthData;
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return errorResponse({
        error: "Invalid request format", 
        details: parseError.message,
        code: "INVALID_REQUEST_FORMAT"
      }, 400);
    }

    // Validate the required parameters
    if (!birthData) {
      return errorResponse({
        error: "Missing birth data",
        code: "MISSING_BIRTH_DATA"
      }, 400);
    }

    const { date, time, location, timezone, fullName } = birthData;
    
    if (!date || !time || !location) {
      return errorResponse({
        error: "Missing required birth data parameters",
        details: { 
          date: date ? "✓" : "✗", 
          time: time ? "✓" : "✗", 
          location: location ? "✓" : "✗" 
        },
        code: "MISSING_REQUIRED_PARAMETERS"
      }, 400);
    }

    console.log(`Processing blueprint calculation for ${date} ${time} at ${location} in timezone ${timezone || "unknown"}`);
    
    // Set up result placeholders for partial success tracking
    let results: Partial<CalculationResults> = {};
    let errors: Record<string, string> = {};
    let debugInfo: Record<string, any> = {};
    
    // Capture start time for performance logging
    const calculationStartTime = performance.now();
    
    // Force parameter to override engine for testing
    const forceEngine = new URL(req.url).searchParams.get("engine");
    
    // Log which engine we're using
    console.log(`Using Astronomy Engine for calculations`);
    
    // Attempt to calculate planetary positions using the Astronomy Engine
    try {
      const engineStartTime = performance.now();
      console.log(`Starting celestial calculations using Astronomy Engine...`);
      
      const celestialData = await calculatePlanetaryPositionsWithAstro(date, time, location, timezone || "UTC");
      debugInfo.engine = "astronomy_engine";
      debugInfo.engineDuration = Math.round(performance.now() - engineStartTime);
      
      results.celestialData = celestialData;
      console.log("Celestial calculations completed successfully");
    } catch (celestialError) {
      console.error("Error in celestial calculations:", celestialError);
      errors.celestial = celestialError.message;
      debugInfo.astro = `Critical failure: ${celestialError.message}`;
      // Return a friendly error
      return errorResponse({
        error: "Failed to calculate celestial positions",
        details: celestialError.message,
        code: "CELESTIAL_CALCULATION_ERROR"
      }, 500);
    }

    // Calculate Western astrological profile if celestial data is available
    if (results.celestialData) {
      try {
        results.westernProfile = calculateWesternProfile(results.celestialData);
      } catch (westernError) {
        console.error("Error calculating Western profile:", westernError);
        errors.western = westernError.message;
        return errorResponse({
          error: "Western profile calculation failed",
          details: westernError.message,
          code: "WESTERN_CALCULATION_ERROR"
        }, 500);
      }
    } else {
      errors.western = "Unable to calculate Western profile: celestial data not available";
      return errorResponse({
        error: "Western profile calculation failed: missing celestial data",
        code: "MISSING_CELESTIAL_DATA"
      }, 500);
    }
    
    // Calculate Chinese zodiac
    try {
      results.chineseZodiac = calculateChineseZodiac(date);
    } catch (chineseError) {
      console.error("Error calculating Chinese zodiac:", chineseError);
      errors.chinese = chineseError.message;
      return errorResponse({
        error: "Chinese zodiac calculation failed",
        details: chineseError.message,
        code: "CHINESE_CALCULATION_ERROR"
      }, 500);
    }
    
    // Calculate numerology
    try {
      // Extract name from birth data if available, otherwise use fallback calculations
      results.numerology = calculateNumerology(date, fullName || "");
    } catch (numerologyError) {
      console.error("Error calculating numerology:", numerologyError);
      errors.numerology = numerologyError.message;
      return errorResponse({
        error: "Numerology calculation failed",
        details: numerologyError.message,
        code: "NUMEROLOGY_CALCULATION_ERROR"
      }, 500);
    }
    
    // Calculate Human Design profile
    try {
      if (results.celestialData) {
        results.humanDesign = await calculateHumanDesign(date, time, location, timezone, results.celestialData);
      } else {
        errors.humanDesign = "Unable to calculate Human Design: celestial data not available";
        return errorResponse({
          error: "Human Design calculation failed: missing celestial data",
          code: "MISSING_CELESTIAL_DATA_HD"
        }, 500);
      }
    } catch (hdError) {
      console.error("Error calculating Human Design:", hdError);
      errors.humanDesign = hdError.message;
      return errorResponse({
        error: "Human Design calculation failed",
        details: hdError.message,
        code: "HUMAN_DESIGN_CALCULATION_ERROR"
      }, 500);
    }
    
    // Calculate total processing time
    const totalProcessingTime = Math.round(performance.now() - calculationStartTime);
    debugInfo.totalProcessingTime = totalProcessingTime;
    
    // Return results with debug info included
    return new Response(
      JSON.stringify({
        ...results,
        calculation_metadata: {
          success: Object.keys(errors).length === 0,
          partial: Object.keys(errors).length > 0,
          errors: Object.keys(errors).length > 0 ? errors : undefined,
          calculated_at: new Date().toISOString(),
          input: { date, time, location, timezone: timezone || "UTC" },
          engine: debugInfo.engine || "astronomy_engine",
          processing_time_ms: totalProcessingTime,
          debug: debugInfo
        }
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  } catch (error) {
    console.error('Unexpected error in blueprint calculator:', error);
    
    return errorResponse({
      error: 'Failed to calculate astrological blueprint',
      details: error.message,
      code: "UNEXPECTED_ERROR"
    }, 500);
  }
});

// Helper function to create consistent error responses
function errorResponse(error: ErrorResponse, status = 400) {
  return new Response(
    JSON.stringify(error),
    { 
      status, 
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      } 
    }
  );
}

function calculateWesternProfile(celestialData) {
  // Extract sun, moon and ascendant positions
  const { sun, moon, ascendant } = celestialData;
  
  // Map positions to zodiac signs (0-30 Aries, 30-60 Taurus, etc.)
  const sunSign = getZodiacSign(sun.longitude);
  const moonSign = getZodiacSign(moon.longitude);
  const risingSign = getZodiacSign(ascendant.longitude);
  
  // Get personality keywords based on sign positions
  return {
    sun_sign: `${sunSign.name} ${sunSign.symbol}`,
    sun_keyword: getSignKeyword(sunSign.name, 'sun'),
    moon_sign: `${moonSign.name} ${moonSign.symbol}`,
    moon_keyword: getSignKeyword(moonSign.name, 'moon'),
    rising_sign: `${risingSign.name} ${risingSign.symbol}`,
    aspects: calculateAspects(celestialData), // Calculate major aspects
    houses: calculateHouses(celestialData),   // Calculate house placements
    source: "calculated"  // Flag to indicate this is calculated data
  };
}

function calculateAspects(celestialData) {
  const aspects = [];
  const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  const aspectTypes = {
    conjunction: { angle: 0, orb: 8 },
    sextile: { angle: 60, orb: 6 },
    square: { angle: 90, orb: 7 },
    trine: { angle: 120, orb: 8 },
    opposition: { angle: 180, orb: 8 }
  };
  
  // Calculate aspects between planets
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = celestialData[planets[i]];
      const planet2 = celestialData[planets[j]];
      
      if (!planet1 || !planet2) continue;
      
      // Calculate angular difference
      let diff = Math.abs(planet1.longitude - planet2.longitude);
      if (diff > 180) diff = 360 - diff;
      
      // Check for aspects
      for (const [type, { angle, orb }] of Object.entries(aspectTypes)) {
        if (Math.abs(diff - angle) <= orb) {
          aspects.push({
            planet1: planets[i],
            planet2: planets[j],
            type,
            orb: Math.abs(diff - angle).toFixed(2)
          });
          break;
        }
      }
    }
  }
  
  return aspects;
}

function calculateHouses(celestialData) {
  // For more accurate house calculations, we would use a proper astrological house system
  // This is a simplified placeholder that returns planets in houses based on the Placidus system
  const houses = {};
  const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  
  planets.forEach(planet => {
    if (celestialData[planet]) {
      // Use the house information from celestialData if available
      const house = celestialData[planet].house || Math.floor((celestialData[planet].longitude / 30) + 1) % 12 || 12;
      
      if (!houses[house]) houses[house] = [];
      houses[house].push({
        planet,
        sign: getZodiacSign(celestialData[planet].longitude).name
      });
    }
  });
  
  return houses;
}

function getZodiacSign(longitude) {
  const signs = [
    { name: 'Aries', symbol: '♈︎' },
    { name: 'Taurus', symbol: '♉︎' },
    { name: 'Gemini', symbol: '♊︎' },
    { name: 'Cancer', symbol: '♋︎' },
    { name: 'Leo', symbol: '♌︎' },
    { name: 'Virgo', symbol: '♍︎' },
    { name: 'Libra', symbol: '♎︎' },
    { name: 'Scorpio', symbol: '♏︎' },
    { name: 'Sagittarius', symbol: '♐︎' },
    { name: 'Capricorn', symbol: '♑︎' },
    { name: 'Aquarius', symbol: '♒︎' },
    { name: 'Pisces', symbol: '♓︎' }
  ];
  
  // Each sign is 30 degrees
  const signIndex = Math.floor(longitude / 30) % 12;
  return signs[signIndex];
}

function getSignKeyword(sign, planet) {
  const keywords = {
    'Aries': {
      'sun': 'Pioneer',
      'moon': 'Passionate'
    },
    'Taurus': {
      'sun': 'Grounded Provider',
      'moon': 'Security Seeker'
    },
    'Gemini': {
      'sun': 'Communicator',
      'moon': 'Mentally Active'
    },
    'Cancer': {
      'sun': 'Nurturer',
      'moon': 'Emotional Sensitive'
    },
    'Leo': {
      'sun': 'Creative Leader',
      'moon': 'Dramatic Expressive'
    },
    'Virgo': {
      'sun': 'Analytical Perfectionist',
      'moon': 'Detail-Oriented'
    },
    'Libra': {
      'sun': 'Harmonizer',
      'moon': 'Partnership-Focused'
    },
    'Scorpio': {
      'sun': 'Intense Transformer',
      'moon': 'Emotional Depth'
    },
    'Sagittarius': {
      'sun': 'Adventurous Seeker',
      'moon': 'Freedom Lover'
    },
    'Capricorn': {
      'sun': 'Ambitious Achiever',
      'moon': 'Emotionally Reserved'
    },
    'Aquarius': {
      'sun': 'Revolutionary Visionary',
      'moon': 'Emotionally Detached'
    },
    'Pisces': {
      'sun': 'Compassionate Dreamer',
      'moon': 'Intuitive Empath'
    }
  };
  
  return keywords[sign]?.[planet] || `${sign} ${planet}`;
}

function calculateChineseZodiac(birthDate) {
  const date = new Date(birthDate);
  const birthYear = date.getFullYear();
  const birthMonth = date.getMonth() + 1;
  const birthDay = date.getDate();
  
  // Determine Chinese New Year for the birth year (approximately February 4th)
  // Using Li Chun (beginning of spring) as the pivot point for Chinese zodiac
  // This is more accurate than using the lunar new year which can vary widely
  const liChunDay = 4;  // February 4th is approximate Li Chun
  const liChunMonth = 2; // February
  
  // Determine if the birth date is before Li Chun
  const isBeforeLiChun = (birthMonth < liChunMonth) || 
                         (birthMonth === liChunMonth && birthDay < liChunDay);
  
  // Adjust year for Chinese zodiac calculation if before Li Chun
  const zodiacYear = isBeforeLiChun ? birthYear - 1 : birthYear;
  
  // Chinese zodiac operates on a 12-year cycle
  const animals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
  const elements = ['Metal', 'Water', 'Wood', 'Fire', 'Earth'];
  
  // Calculate animal and element based on year
  const animalIndex = (zodiacYear - 4) % 12;
  const elementIndex = Math.floor(((zodiacYear - 4) % 10) / 2);
  const yinYang = zodiacYear % 2 === 0 ? 'Yang' : 'Yin';
  
  // Define keywords for each animal
  const keywords = {
    'Rat': 'Clever Resourceful',
    'Ox': 'Diligent Reliable',
    'Tiger': 'Brave Confident',
    'Rabbit': 'Gentle Elegant',
    'Dragon': 'Powerful Energetic',
    'Snake': 'Wise Intuitive',
    'Horse': 'Free-spirited Explorer',
    'Goat': 'Artistic Creative',
    'Monkey': 'Intelligent Versatile',
    'Rooster': 'Observant Practical',
    'Dog': 'Loyal Honest',
    'Pig': 'Compassionate Generous'
  };
  
  // Define characteristics for each element
  const elementCharacteristics = {
    'Metal': 'Determined, self-reliant, and precise',
    'Water': 'Flexible, empathetic, and perceptive',
    'Wood': 'Creative, idealistic, and cooperative',
    'Fire': 'Passionate, adventurous, and dynamic',
    'Earth': 'Practical, stable, and nurturing'
  };
  
  return {
    animal: animals[animalIndex],
    element: elements[elementIndex],
    yin_yang: yinYang,
    keyword: keywords[animals[animalIndex]],
    element_characteristic: elementCharacteristics[elements[elementIndex]],
    compatibility: getChineseCompatibility(animals[animalIndex]),
    year: zodiacYear, // Include the calculated zodiac year
    source: "calculated"
  };
}

function getChineseCompatibility(animal) {
  // Define compatibility for each animal
  const compatibility = {
    'Rat': { best: ['Dragon', 'Monkey'], worst: ['Horse', 'Rabbit'] },
    'Ox': { best: ['Snake', 'Rooster'], worst: ['Goat', 'Horse'] },
    'Tiger': { best: ['Horse', 'Dog'], worst: ['Monkey', 'Snake'] },
    'Rabbit': { best: ['Goat', 'Pig'], worst: ['Rat', 'Rooster'] },
    'Dragon': { best: ['Rat', 'Monkey'], worst: ['Dog', 'Rabbit'] },
    'Snake': { best: ['Ox', 'Rooster'], worst: ['Tiger', 'Pig'] },
    'Horse': { best: ['Tiger', 'Horse'], worst: ['Dragon', 'Rooster'] },
    'Goat': { best: ['Rabbit', 'Pig'], worst: ['Ox', 'Dog'] },
    'Monkey': { best: ['Rat', 'Dragon'], worst: ['Tiger', 'Pig'] },
    'Rooster': { best: ['Ox', 'Snake'], worst: ['Rabbit', 'Dog'] },
    'Dog': { best: ['Tiger', 'Horse'], worst: ['Dragon', 'Rooster'] },
    'Pig': { best: ['Rabbit', 'Goat'], worst: ['Snake', 'Monkey'] }
  };
  
  return compatibility[animal] || { best: [], worst: [] };
}

function calculateNumerology(birthDate, fullName = "") {
  const date = new Date(birthDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  // Calculate Life Path Number by summing date digits
  const lifePathNumber = calculateLifePathNumber(day, month, year);
  
  // Define keywords for life path numbers with more detailed descriptions
  const lifePathKeywords = {
    1: { keyword: "Independent Leader", description: "Born to lead and pioneer new paths" },
    2: { keyword: "Cooperative Peacemaker", description: "Natural diplomat and relationship-builder" },
    3: { keyword: "Creative Communicator", description: "Expressive, optimistic, and socially engaging" },
    4: { keyword: "Practical Builder", description: "Solid, reliable foundation creator" },
    5: { keyword: "Freedom Seeker", description: "Adventurous and versatile agent of change" },
    6: { keyword: "Responsible Nurturer", description: "Compassionate healer and caregiver" },
    7: { keyword: "Seeker of Truth", description: "Analytical, spiritual truth-seeker" },
    8: { keyword: "Abundant Manifester", description: "Natural executive with material focus" },
    9: { keyword: "Humanitarian", description: "Compassionate global citizen and completion energy" },
    11: { keyword: "Intuitive Channel", description: "Highly intuitive spiritual messenger" },
    22: { keyword: "Master Builder", description: "Manifests grand visions into reality" },
    33: { keyword: "Master Teacher", description: "Selfless nurturer with profound wisdom" }
  };
  
  // Calculate birth day number and meaning
  const birthDayNumber = reduceSingleDigit(day);
  const birthDayMeaning = getBirthDayMeaning(birthDayNumber);
  
  // Calculate personal year
  const currentYear = new Date().getFullYear();
  const personalYear = calculatePersonalYear(day, month, currentYear);
  
  // Calculate name-based numbers if name is provided
  let expressionNumber = 0;
  let soulUrgeNumber = 0;
  let personalityNumber = 0;
  
  if (fullName && fullName.trim() !== "") {
    expressionNumber = calculateExpressionNumber(fullName);
    soulUrgeNumber = calculateSoulUrgeNumber(fullName);
    personalityNumber = calculatePersonalityNumber(fullName);
  } else {
    // Use fallback calculations if no name provided - but clearly mark as estimates
    expressionNumber = ((day + month) % 9) || 9;
    soulUrgeNumber = ((month + year % 100) % 9) || 9;
    personalityNumber = ((day + year % 100) % 9) || 9;
  }
  
  return {
    life_path_number: lifePathNumber,
    life_path_keyword: lifePathKeywords[lifePathNumber]?.keyword || "Seeker",
    life_path_description: lifePathKeywords[lifePathNumber]?.description || "Path of seeking meaning",
    birth_day_number: birthDayNumber,
    birth_day_meaning: birthDayMeaning,
    personal_year: personalYear,
    expression_number: expressionNumber,
    expression_keyword: getNumerologyKeyword(expressionNumber),
    soul_urge_number: soulUrgeNumber,
    soul_urge_keyword: getNumerologyKeyword(soulUrgeNumber),
    personality_number: personalityNumber,
    source: fullName ? "calculated" : "estimated"
  };
}

function reduceSingleDigit(num) {
  // Preserve master numbers 11, 22, 33
  if (num === 11 || num === 22 || num === 33) {
    return num;
  }
  
  // Reduce to a single digit
  while (num > 9) {
    num = [...String(num)].reduce((sum, digit) => sum + parseInt(digit), 0);
    
    // Check for master numbers after reduction
    if (num === 11 || num === 22 || num === 33) {
      return num;
    }
  }
  
  return num;
}

function calculateLifePathNumber(day, month, year) {
  // Sum the digits of the birth date with better reduction
  // Reduce each component individually first
  const daySum = reduceSingleDigit(day);
  const monthSum = reduceSingleDigit(month);
  const yearSum = reduceSingleDigit(year);
  
  // Then combine and reduce again
  let totalSum = daySum + monthSum + yearSum;
  
  // Check for master numbers before final reduction
  if (totalSum === 11 || totalSum === 22 || totalSum === 33) {
    return totalSum;
  }
  
  return reduceSingleDigit(totalSum);
}

function getBirthDayMeaning(birthDayNumber) {
  const meanings = {
    1: "Natural leader with strong willpower",
    2: "Cooperative partner with diplomatic skills",
    3: "Creative expressionist with social charm",
    4: "Methodical worker with practical approach",
    5: "Freedom lover seeking variety and change",
    6: "Responsible nurturer with artistic talents",
    7: "Analytical thinker with spiritual interests",
    8: "Ambitious achiever with executive skills",
    9: "Compassionate humanitarian with wisdom",
    11: "Inspirational visionary with heightened intuition",
    22: "Practical visionary with extraordinary potential"
  };
  
  return meanings[birthDayNumber] || "Complex personality with unique talents";
}

function calculatePersonalYear(day, month, currentYear) {
  // Calculate personal year number based on birth day, birth month and current year
  const sum = reduceSingleDigit(day) + reduceSingleDigit(month) + reduceSingleDigit(currentYear);
  return reduceSingleDigit(sum);
}

// Numerology letter-number mapping (Pythagorean system)
const PYTHAGOREAN_NUMEROLOGY = {
  'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8, 'i': 9,
  'j': 1, 'k': 2, 'l': 3, 'm': 4, 'n': 5, 'o': 6, 'p': 7, 'q': 8, 'r': 9,
  's': 1, 't': 2, 'u': 3, 'v': 4, 'w': 5, 'x': 6, 'y': 7, 'z': 8,
  '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '0': 0
};

// Helper to normalize name (remove accents and special characters)
function normalizeName(name) {
  return name.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]/g, "");      // Remove non-alphanumeric
}

// Calculate Expression Number (all letters)
function calculateExpressionNumber(fullName) {
  const normalizedName = normalizeName(fullName);
  
  // Sum all letters
  let sum = 0;
  for (const char of normalizedName) {
    sum += PYTHAGOREAN_NUMEROLOGY[char] || 0;
  }
  
  // Preserve master numbers
  return reduceSingleDigit(sum);
}

// Calculate Soul Urge Number (vowels only)
function calculateSoulUrgeNumber(fullName) {
  const normalizedName = normalizeName(fullName);
  const vowels = "aeiou";
  
  // Sum vowels only
  let sum = 0;
  for (const char of normalizedName) {
    if (vowels.includes(char)) {
      sum += PYTHAGOREAN_NUMEROLOGY[char] || 0;
    }
  }
  
  // Preserve master numbers
  return reduceSingleDigit(sum);
}

// Calculate Personality Number (consonants only)
function calculatePersonalityNumber(fullName) {
  const normalizedName = normalizeName(fullName);
  const vowels = "aeiou";
  
  // Sum consonants only
  let sum = 0;
  for (const char of normalizedName) {
    if (!vowels.includes(char) && PYTHAGOREAN_NUMEROLOGY[char]) {
      sum += PYTHAGOREAN_NUMEROLOGY[char];
    }
  }
  
  // Preserve master numbers
  return reduceSingleDigit(sum);
}

// Get keyword for a numerology number
function getNumerologyKeyword(number) {
  const keywords = {
    1: "Independent Leader",
    2: "Cooperative Mediator",
    3: "Creative Communicator",
    4: "Practical Builder",
    5: "Freedom Seeker",
    6: "Responsible Nurturer",
    7: "Analytical Seeker",
    8: "Abundant Manifester",
    9: "Humanitarian",
    11: "Intuitive Channel",
    22: "Master Builder",
    33: "Master Teacher"
  };
  
  return keywords[number] || "Unknown";
}
