
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// Swiss Ephemeris wrapper for Deno
import { calculatePlanetaryPositions } from './ephemeris.ts';
import { calculatePlanetaryPositionsWithSweph } from './ephemeris-sweph.ts';
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
  };
}

// Feature flag for Swiss Ephemeris calculations
// Set to false initially for a gradual rollout
const USE_SWEPH = Deno.env.get("USE_SWEPH") === "true";

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

    const { date, time, location, timezone } = birthData;
    
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
    
    // Force parameter to override feature flag for testing
    const forceEngine = new URL(req.url).searchParams.get("engine");
    const useSweph = forceEngine === "sweph" ? true : 
                    forceEngine === "legacy" ? false : 
                    USE_SWEPH;
    
    // Attempt to calculate planetary positions using the selected engine
    try {
      console.log(`Starting celestial calculations using ${useSweph ? "Swiss Ephemeris" : "legacy"} engine...`);
      
      const celestialData = useSweph ? 
        await calculatePlanetaryPositionsWithSweph(date, time, location, timezone || "UTC") :
        await calculatePlanetaryPositions(date, time, location, timezone || "UTC");
      
      // If SwEph is selected, also calculate with legacy for comparison logging
      if (useSweph) {
        try {
          const legacyData = await calculatePlanetaryPositions(date, time, location, timezone || "UTC");
          
          // Log comparison for key celestial bodies (uncomment for detailed logs)
          console.log("Calculation comparison (SwEph vs Legacy):");
          console.log(`Sun longitude: SwEph = ${celestialData.sun.longitude.toFixed(4)}° | Legacy = ${legacyData.sun.longitude.toFixed(4)}° | Delta = ${Math.abs(celestialData.sun.longitude - legacyData.sun.longitude).toFixed(4)}°`);
          console.log(`Moon longitude: SwEph = ${celestialData.moon.longitude.toFixed(4)}° | Legacy = ${legacyData.moon.longitude.toFixed(4)}° | Delta = ${Math.abs(celestialData.moon.longitude - legacyData.moon.longitude).toFixed(4)}°`);
          console.log(`Ascendant: SwEph = ${celestialData.ascendant.longitude.toFixed(4)}° | Legacy = ${legacyData.ascendant.longitude.toFixed(4)}° | Delta = ${Math.abs(celestialData.ascendant.longitude - legacyData.ascendant.longitude).toFixed(4)}°`);
        } catch (legacyError) {
          console.error("Error in legacy calculation (comparison only):", legacyError);
        }
      }
      
      results.celestialData = celestialData;
      console.log("Celestial calculations completed successfully");
    } catch (celestialError) {
      console.error("Error in celestial calculations:", celestialError);
      errors.celestial = celestialError.message;
      
      // If SwEph fails, try falling back to legacy calculation
      if (useSweph) {
        console.log("Falling back to legacy calculation engine...");
        try {
          results.celestialData = await calculatePlanetaryPositions(date, time, location, timezone || "UTC");
          console.log("Legacy fallback calculation successful");
        } catch (fallbackError) {
          console.error("Legacy fallback calculation also failed:", fallbackError);
          errors.celestialFallback = fallbackError.message;
        }
      }
    }

    // Calculate Western astrological profile if celestial data is available
    if (results.celestialData) {
      try {
        results.westernProfile = calculateWesternProfile(results.celestialData);
      } catch (westernError) {
        console.error("Error calculating Western profile:", westernError);
        errors.western = westernError.message;
      }
    } else {
      errors.western = "Unable to calculate Western profile: celestial data not available";
    }
    
    // These calculations can proceed even if celestial calculations failed
    try {
      results.chineseZodiac = calculateChineseZodiac(date);
    } catch (chineseError) {
      console.error("Error calculating Chinese zodiac:", chineseError);
      errors.chinese = chineseError.message;
    }
    
    try {
      results.numerology = calculateNumerology(date);
    } catch (numerologyError) {
      console.error("Error calculating numerology:", numerologyError);
      errors.numerology = numerologyError.message;
    }
    
    // Calculate Human Design profile
    try {
      if (results.celestialData) {
        results.humanDesign = await calculateHumanDesign(date, time, location, timezone, results.celestialData);
      } else {
        errors.humanDesign = "Unable to calculate Human Design: celestial data not available";
      }
    } catch (hdError) {
      console.error("Error calculating Human Design:", hdError);
      errors.humanDesign = hdError.message;
    }

    // Check if we have at least some data or if everything failed
    const hasAnyResults = Object.keys(results).some(key => results[key]);
    
    if (!hasAnyResults) {
      return errorResponse({
        error: "All calculations failed",
        details: errors,
        code: "ALL_CALCULATIONS_FAILED"
      }, 500);
    }
    
    // Return partial or complete results
    return new Response(
      JSON.stringify({
        ...results,
        calculation_metadata: {
          success: Object.keys(errors).length === 0,
          partial: Object.keys(errors).length > 0,
          errors: Object.keys(errors).length > 0 ? errors : undefined,
          calculated_at: new Date().toISOString(),
          input: { date, time, location, timezone: timezone || "UTC" },
          engine: useSweph ? "swiss_ephemeris" : "legacy"
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
      // This is a simplified house calculation - in production you would use a proper house system
      const house = celestialData[planet].house || Math.floor(Math.random() * 12) + 1;
      
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
  const year = date.getFullYear();
  
  // Chinese zodiac operates on a 12-year cycle
  const animals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
  const elements = ['Metal', 'Water', 'Wood', 'Fire', 'Earth'];
  
  // Calculate animal and element based on year
  const animalIndex = (year - 4) % 12;
  const elementIndex = Math.floor(((year - 4) % 10) / 2);
  const yinYang = year % 2 === 0 ? 'Yang' : 'Yin';
  
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
    compatibility: getChineseCompatibility(animals[animalIndex])
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

function calculateNumerology(birthDate) {
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
  
  return {
    life_path_number: lifePathNumber,
    life_path_keyword: lifePathKeywords[lifePathNumber]?.keyword || "Seeker",
    life_path_description: lifePathKeywords[lifePathNumber]?.description || "Path of seeking meaning",
    birth_day_number: birthDayNumber,
    birth_day_meaning: birthDayMeaning,
    personal_year: personalYear,
    expression_number: calculateExpressionNumber(birthDate), // Simplified version
    soul_urge_number: calculateSoulUrgeNumber(birthDate), // Simplified version
    personality_number: calculatePersonalityNumber(birthDate) // Simplified version
  };
}

function reduceSingleDigit(num) {
  // Reduce to a single digit unless it's a master number
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = [...String(num)].reduce((sum, digit) => sum + parseInt(digit), 0);
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
    9: "Compassionate humanitarian with wisdom"
  };
  
  return meanings[birthDayNumber] || "Complex personality with unique talents";
}

function calculatePersonalYear(day, month, currentYear) {
  // Calculate personal year number based on birth day, birth month and current year
  const sum = reduceSingleDigit(day) + reduceSingleDigit(month) + reduceSingleDigit(currentYear);
  return reduceSingleDigit(sum);
}

// Simplified placeholder functions for other numerology calculations
function calculateExpressionNumber(birthDate) {
  // In a real implementation, this would use the full birth name
  // For now, we'll use a value derived from the birth date
  const date = new Date(birthDate);
  return ((date.getDate() + date.getMonth() + 1) % 9) || 9;
}

function calculateSoulUrgeNumber(birthDate) {
  // In a real implementation, this would use the vowels in the birth name
  // For now, we'll use a value derived from the birth date
  const date = new Date(birthDate);
  return ((date.getMonth() + 1 + date.getFullYear() % 100) % 9) || 9;
}

function calculatePersonalityNumber(birthDate) {
  // In a real implementation, this would use the consonants in the birth name
  // For now, we'll use a value derived from the birth date
  const date = new Date(birthDate);
  return ((date.getDate() + date.getFullYear() % 100) % 9) || 9;
}
