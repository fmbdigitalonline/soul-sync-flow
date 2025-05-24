import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { calculatePlanetaryPositionsWithAstro } from "./ephemeris-astroengine.ts";
import { calculateHumanDesign } from './human-design-calculator.ts';

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

// Chinese Zodiac calculation function
function calculateChineseZodiac(date: string) {
  const year = parseInt(date.split('-')[0]);
  const animals = [
    'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
    'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'
  ];
  
  // Chinese zodiac cycle starts in 4 AD for the Rat
  const animalIndex = (year - 4) % 12;
  const animal = animals[animalIndex];
  
  return {
    animal: animal,
    year: year,
    element: getChineseElement(year),
    description: `${year} is the year of the ${animal}`
  };
}

// Helper function to get Chinese element
function getChineseElement(year: number): string {
  const elements = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
  const elementIndex = Math.floor(((year - 4) % 10) / 2);
  return elements[elementIndex];
}

// Numerology calculation function
function calculateNumerology(date: string, fullName: string) {
  const [year, month, day] = date.split('-').map(Number);
  
  // Life Path Number calculation
  const lifePathSum = year + month + day;
  const lifePathNumber = reduceToSingleDigit(lifePathSum);
  
  // Expression Number from name (if provided)
  let expressionNumber = null;
  if (fullName) {
    const nameValue = fullName.toUpperCase().replace(/[^A-Z]/g, '').split('').reduce((sum, char) => {
      return sum + (char.charCodeAt(0) - 64);
    }, 0);
    expressionNumber = reduceToSingleDigit(nameValue);
  }
  
  return {
    lifePathNumber,
    expressionNumber,
    birthDay: day,
    birthMonth: month,
    birthYear: year
  };
}

// Helper function to reduce numbers to single digits (except master numbers)
function reduceToSingleDigit(num: number): number {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = num.toString().split('').map(Number).reduce((a, b) => a + b, 0);
  }
  return num;
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
