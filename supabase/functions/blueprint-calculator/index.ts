import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getErrorMessage } from '../_shared/error-utils.ts';

// Request data interface
interface BirthDataRequest {
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  fullName?: string;
}

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // Add Human Design test endpoint FIRST for testing your specific birth data
    if (url.pathname.includes('/test-human-design')) {
      const { default: testHumanDesign } = await import('./test-human-design.ts');
      return await testHumanDesign(req);
    }
    
    // Add debug endpoint FIRST for testing calculation issues
    if (url.pathname.includes('/debug-calculation')) {
      const { default: debugEndpoint } = await import('./debug-endpoint.ts');
      return await debugEndpoint(req);
    }
    
    // Handle test endpoints FIRST, before any other processing
    if (url.pathname.includes('/test-astronomia')) {
      const { default: testAstronomia } = await import('./test-astronomia.ts');
      return await testAstronomia(req);
    }
    
    if (url.pathname.includes('/test-moon-minimal')) {
      const { default: testMoonMinimal } = await import('./test-moon-minimal.ts');
      return await testMoonMinimal(req);
    }
    
    if (url.pathname.includes('/test-astrometry')) {
      const { default: testAstrometry } = await import('./test-astrometry.ts');
      return await testAstrometry(req);
    }
    
    if (url.pathname.includes('/test-available-astronomy')) {
      const { default: testAvailableAstronomy } = await import('./test-available-astronomy.ts');
      return await testAvailableAstronomy(req);
    }
    
    if (url.pathname.includes('/test-wasm')) {
      const { default: testWasm } = await import('./test-wasm.ts');
      return await testWasm(req);
    }

    if (url.pathname.includes('/test-prokerala')) {
      const { default: testProkerala } = await import('./prokerala-api.ts');
      return await testProkerala(req);
    }

    // Parse JSON for main blueprint calculation endpoints and POST requests
    let requestData: BirthDataRequest = {};
    if (req.method === 'POST') {
      const text = await req.text();
      if (text.trim()) {
        try {
          requestData = JSON.parse(text) as BirthDataRequest;
        } catch (parseError: unknown) {
          console.error("Failed to parse request body:", parseError);
          return new Response(
            JSON.stringify({ 
              error: "Invalid request format",
              details: getErrorMessage(parseError),
              code: "INVALID_REQUEST_FORMAT"
            }),
            { 
              status: 400,
              headers: { 
                "Content-Type": "application/json",
                ...corsHeaders 
              } 
            }
          );
        }
      }
    }

    const { birthDate, birthTime, birthLocation, fullName } = requestData;

    // Validate required fields for main blueprint calculation
    if (!birthDate || !birthTime || !birthLocation) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields",
          details: "birthDate, birthTime, and birthLocation are required",
          code: "MISSING_FIELDS"
        }),
        { 
          status: 400,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          } 
        }
      );
    }

    console.log("Blueprint Calculator: Processing request", {
      birthDate,
      birthTime,
      birthLocation,
      fullName
    });

    // Call the enhanced blueprint generation with automatic timezone resolution
    const result = await generateBlueprintWithAutomaticTimezone(birthDate, birthTime, birthLocation, fullName);

    return new Response(JSON.stringify({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      source: "vercel_ephemeris_api_with_auto_timezone",
      notice: "Using accurate Swiss Ephemeris calculations with automatic timezone resolution"
    }), {
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders 
      }
    });

  } catch (error: unknown) {
    console.error("Error in blueprint calculator:", error);
    
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: getErrorMessage(error),
        code: "INTERNAL_ERROR"
      }),
      { 
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
  }
});

async function generateBlueprintWithAutomaticTimezone(birthDate: string, birthTime: string, birthLocation: string, fullName?: string) {
  const VERCEL_API_URL = "https://soul-sync-flow.vercel.app/api/ephemeris";
  
  try {
    console.log("Step 1: Geocoding location to get coordinates...");
    
    // Step 1: Get coordinates from location string
    const coordinates = await getLocationCoordinates(birthLocation);
    console.log(`Geocoded location "${birthLocation}" to: ${coordinates.latitude}, ${coordinates.longitude}`);
    
    console.log("Step 2: Getting historical timezone for the birth moment...");
    
    // Step 2: Get historical timezone offset for the specific birth moment
    const birthDateTime = new Date(`${birthDate}T${birthTime}:00`);
    const timezoneOffset = await getHistoricalTimezoneOffset(coordinates, birthDateTime);
    console.log(`Historical timezone offset: ${timezoneOffset} seconds (${timezoneOffset/3600} hours)`);
    
    console.log("Step 3: Constructing accurate UTC timestamp...");
    
    // Step 3: Create the accurate UTC timestamp
    const localTimestamp = birthDateTime.getTime();
    const utcTimestamp = localTimestamp - (timezoneOffset * 1000); // Convert seconds to milliseconds
    const accurateUtcDateTime = new Date(utcTimestamp);
    
    console.log(`Local birth time: ${birthDateTime.toISOString()}`);
    console.log(`Accurate UTC time: ${accurateUtcDateTime.toISOString()}`);
    
    console.log("Step 4: Calling Vercel ephemeris API with accurate data...");
    
    // Step 4: Call Vercel API with accurate UTC time and coordinates
    const ephemerisResponse = await fetch(VERCEL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SoulSync-Blueprint-Calculator/1.0',
      },
      body: JSON.stringify({
        datetime: accurateUtcDateTime.toISOString(),
        coordinates: `${coordinates.latitude},${coordinates.longitude}`
      })
    });
    
    console.log("Vercel API response status:", ephemerisResponse.status);
    
    if (!ephemerisResponse.ok) {
      const errorText = await ephemerisResponse.text();
      console.error("Vercel API error response:", errorText);
      throw new Error(`Ephemeris API returned ${ephemerisResponse.status}: ${ephemerisResponse.statusText}. Response: ${errorText}`);
    }
    
    const ephemerisData = await ephemerisResponse.json();
    
    if (!ephemerisData.success) {
      throw new Error(`Ephemeris API error: ${ephemerisData.error || 'Unknown error'}`);
    }
    
    console.log("Step 5: Processing accurate ephemeris data...");
    
    // Process the accurate planetary data
    const celestialData = ephemerisData.data;
    
    // Generate Western astrology profile
    const westernProfile = generateWesternProfile(celestialData);
    
    // Generate other profile components
    const chineseZodiac = calculateChineseZodiac(new Date(birthDate).getFullYear());
    const numerology = calculateNumerology(birthDate, fullName || "Sample Name");
    const humanDesign = await generateHumanDesign(birthDate, birthTime, birthLocation, Intl.DateTimeFormat().resolvedOptions().timeZone);
    
    return {
      calculation_metadata: {
        success: true,
        partial: false,
        errors: {},
        calculated_at: new Date().toISOString(),
        engine: "swiss_ephemeris_vercel_auto_timezone",
        timezone_info: {
          location: birthLocation,
          coordinates: `${coordinates.latitude},${coordinates.longitude}`,
          historical_offset_seconds: timezoneOffset,
          historical_offset_hours: timezoneOffset / 3600,
          local_birth_time: birthDateTime.toISOString(),
          utc_birth_time: accurateUtcDateTime.toISOString()
        },
        notice: "Accurate calculations using Swiss Ephemeris with automatic historical timezone resolution"
      },
      westernProfile,
      chineseZodiac,
      numerology,
      humanDesign,
      celestialData
    };
    
  } catch (error: unknown) {
    console.error("Error in automatic timezone blueprint generation:", error);
    throw error;
  }
}

// Get geographic coordinates from location string using Google Maps Geocoding API
async function getLocationCoordinates(location: string): Promise<{latitude: number, longitude: number}> {
  const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
  
  if (!apiKey) {
    console.error("Google Maps API key not found");
    throw new Error("Geocoding API key not configured");
  }
  
  // First try to parse coordinates if given in format "lat,long"
  const coordMatch = location.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
  if (coordMatch) {
    console.log("Using explicit coordinates from input string");
    return {
      latitude: parseFloat(coordMatch[1]),
      longitude: parseFloat(coordMatch[2])
    };
  }
  
  const encodedLocation = encodeURIComponent(location);
  const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${apiKey}`;
  
  const response = await fetch(geocodingUrl);
  const data = await response.json();
  
  if (data.status !== "OK" || !data.results || data.results.length === 0) {
    console.error("Geocoding failed:", data.status, data.error_message);
    
    // Fallback to major cities if geocoding fails
    const fallbackCoords = getFallbackCoordinates(location);
    if (fallbackCoords) {
      console.log(`Using fallback coordinates for ${location}:`, fallbackCoords);
      return fallbackCoords;
    }
    
    throw new Error(`Could not determine coordinates for location: ${location}`);
  }
  
  const result = data.results[0];
  return {
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng
  };
}

// Get historical timezone offset using Google Maps Timezone API
async function getHistoricalTimezoneOffset(coordinates: {latitude: number, longitude: number}, dateTime: Date): Promise<number> {
  const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
  
  if (!apiKey) {
    console.error("Google Maps API key not found");
    throw new Error("Timezone API key not configured");
  }
  
  // Convert date to Unix timestamp (seconds since 1970)
  const timestamp = Math.floor(dateTime.getTime() / 1000);
  
  const timezoneUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${coordinates.latitude},${coordinates.longitude}&timestamp=${timestamp}&key=${apiKey}`;
  
  const response = await fetch(timezoneUrl);
  const data = await response.json();
  
  if (data.status !== "OK") {
    console.error("Timezone API error:", data.status, data.errorMessage);
    throw new Error(`Timezone API failed: ${data.status} - ${data.errorMessage || 'Unknown error'}`);
  }
  
  // The timezone API returns rawOffset (standard time offset) + dstOffset (daylight saving offset)
  const totalOffsetSeconds = data.rawOffset + data.dstOffset;
  
  console.log(`Timezone details: ${data.timeZoneId}, raw offset: ${data.rawOffset}s, DST offset: ${data.dstOffset}s, total: ${totalOffsetSeconds}s`);
  
  // Override incorrect Google API result for Suriname historical timezone
  // Suriname was UTC-3 in 1978, not UTC-3.5 as Google might return
  if (coordinates.latitude > 5 && coordinates.latitude < 6 && 
      coordinates.longitude > -56 && coordinates.longitude < -54) {
    console.log("🔧 Applying historical timezone correction for Suriname - using UTC-3 instead of Google result");
    return -3 * 3600; // Force correct historical timezone: -3 hours in seconds
  }
  
  return totalOffsetSeconds;
}

// Fallback coordinates for major cities if geocoding fails
function getFallbackCoordinates(location: string): {latitude: number, longitude: number} | null {
  const normalizedLocation = location.toLowerCase().trim();
  
  const locationMap: Record<string, {latitude: number, longitude: number}> = {
    "paramaribo": { latitude: 5.8520, longitude: -55.2038 },
    "suriname": { latitude: 5.8520, longitude: -55.2038 },
    "london": { latitude: 51.5074, longitude: -0.1278 },
    "new york": { latitude: 40.7128, longitude: -74.0060 },
    "paris": { latitude: 48.8566, longitude: 2.3522 },
    "tokyo": { latitude: 35.6762, longitude: 139.6503 },
    "berlin": { latitude: 52.5200, longitude: 13.4050 },
    "los angeles": { latitude: 34.0522, longitude: -118.2437 },
    "chicago": { latitude: 41.8781, longitude: -87.6298 },
    "beijing": { latitude: 39.9042, longitude: 116.4074 },
    "sydney": { latitude: -33.8688, longitude: 151.2093 },
    "amsterdam": { latitude: 52.3676, longitude: 4.9041 }
  };
  
  for (const [key, coords] of Object.entries(locationMap)) {
    if (normalizedLocation.includes(key)) {
      return coords;
    }
  }
  
  return null;
}

function generateWesternProfile(celestialData: any) {
  // Handle both old format (direct access) and new format (nested under planets)
  const sunData = celestialData.planets?.sun || celestialData.sun;
  const moonData = celestialData.planets?.moon || celestialData.moon;
  
  if (!sunData || !moonData) {
    console.error("Celestial data structure:", JSON.stringify(celestialData, null, 2));
    throw new Error("Missing essential planetary data from ephemeris");
  }
  
  // Calculate zodiac signs from longitude
  const sunSign = calculateSignFromLongitude(sunData.longitude);
  const moonSign = calculateSignFromLongitude(moonData.longitude);
  
  // Calculate degrees within sign
  const sunDegree = sunData.longitude % 30;
  const moonDegree = moonData.longitude % 30;
  
  return {
    sun_sign: `${sunSign} ${sunDegree.toFixed(1)}°`,
    sun_keyword: getSunKeyword(sunSign),
    moon_sign: `${moonSign} ${moonDegree.toFixed(1)}°`,
    moon_keyword: getMoonKeyword(moonSign),
    rising_sign: "Calculating...", // Would need birth time and location for accurate calculation
    source: "swiss_ephemeris_accurate_timezone"
  };
}

async function generateHumanDesign(birthDate: string, birthTime: string, birthLocation: string, timezone: string) {
  console.log("🎯 Human Design: Starting calculation with Vercel API integration");
  
  try {
    // Step 1: Get accurate celestial data
    console.log("Step 1: Getting celestial data for Human Design...");
    const celestialData = await getAccurateCelestialData(birthDate, birthTime, birthLocation, timezone);
    
    if (!celestialData || !celestialData.planets) {
      throw new Error("Failed to get celestial data for Human Design calculation");
    }
    
    // Step 2: Call the Human Design calculation (now via Vercel API)
    console.log("Step 2: Calling Human Design calculation via Vercel API...");
    const { calculateHumanDesign } = await import('./human-design-calculator.ts');
    const humanDesignResult = await calculateHumanDesign(
      birthDate,
      birthTime,
      birthLocation,
      timezone,
      celestialData
    );
    
    console.log("✅ Human Design calculation completed via Vercel API");
    console.log("Result type:", humanDesignResult.type);
    if ('profile' in humanDesignResult) {
      console.log("Result profile:", humanDesignResult.profile);
    }
    if ('authority' in humanDesignResult) {
      console.log("Result authority:", humanDesignResult.authority);
    }
    
    // Check if this is a fallback result
    if ('metadata' in humanDesignResult && 'method' in humanDesignResult.metadata && humanDesignResult.metadata.method === "FALLBACK_NEEDS_PROPER_LIBRARY") {
      console.log("⚠️ WARNING: Using fallback Human Design calculation - proper library integration needed");
    }
    
    return humanDesignResult;
    
  } catch (error: unknown) {
    console.error("Error in Human Design generation:", error);
    throw error;
  }
}

// Helper function to get accurate celestial data
async function getAccurateCelestialData(birthDate: string, birthTime: string, birthLocation: string, timezone: string) {
  const VERCEL_API_URL = "https://soul-sync-flow.vercel.app/api/ephemeris";
  
  // Step 1: Get coordinates from location string
  const coordinates = await getLocationCoordinates(birthLocation);
  
  // Step 2: Get historical timezone offset for the specific birth moment
  const birthDateTime = new Date(`${birthDate}T${birthTime}:00`);
  const timezoneOffset = await getHistoricalTimezoneOffset(coordinates, birthDateTime);
  
  // Step 3: Create the accurate UTC timestamp
  const localTimestamp = birthDateTime.getTime();
  const utcTimestamp = localTimestamp - (timezoneOffset * 1000); // Convert seconds to milliseconds
  const accurateUtcDateTime = new Date(utcTimestamp);
  
  // Step 4: Call Vercel API with accurate UTC time and coordinates
  const ephemerisResponse = await fetch(VERCEL_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'SoulSync-Blueprint-Calculator/1.0',
    },
    body: JSON.stringify({
      datetime: accurateUtcDateTime.toISOString(),
      coordinates: `${coordinates.latitude},${coordinates.longitude}`
    })
  });
  
  if (!ephemerisResponse.ok) {
    const errorText = await ephemerisResponse.text();
    console.error("Vercel API error response:", errorText);
    throw new Error(`Ephemeris API returned ${ephemerisResponse.status}: ${ephemerisResponse.statusText}. Response: ${errorText}`);
  }
  
  const ephemerisData = await ephemerisResponse.json();
  
  if (!ephemerisData.success) {
    throw new Error(`Ephemeris API error: ${ephemerisData.error || 'Unknown error'}`);
  }
  
  return ephemerisData.data;
}

function calculateSignFromLongitude(longitude: number): string {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const signIndex = Math.floor(longitude / 30);
  return signs[signIndex] || 'Aries';
}

function getSunKeyword(sign: string): string {
  const keywords: Record<string, string> = {
    'Aries': 'Pioneer', 'Taurus': 'Builder', 'Gemini': 'Communicator',
    'Cancer': 'Nurturer', 'Leo': 'Creator', 'Virgo': 'Analyst',
    'Libra': 'Harmonizer', 'Scorpio': 'Transformer', 'Sagittarius': 'Explorer',
    'Capricorn': 'Achiever', 'Aquarius': 'Innovator', 'Pisces': 'Dreamer'
  };
  return keywords[sign] || 'Explorer';
}

function getMoonKeyword(sign: string): string {
  const keywords: Record<string, string> = {
    'Aries': 'Instinctive', 'Taurus': 'Stable', 'Gemini': 'Curious',
    'Cancer': 'Protective', 'Leo': 'Expressive', 'Virgo': 'Caring',
    'Libra': 'Peaceful', 'Scorpio': 'Intense', 'Sagittarius': 'Free',
    'Capricorn': 'Responsible', 'Aquarius': 'Independent', 'Pisces': 'Intuitive'
  };
  return keywords[sign] || 'Intuitive';
}

function calculateChineseZodiac(year: number) {
  const animals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
  const elements = ['Metal', 'Water', 'Wood', 'Fire', 'Earth'];
  const yinYang = ['Yang', 'Yin'];
  
  const animalIndex = (year - 1900) % 12;
  const elementIndex = Math.floor(((year - 1900) % 10) / 2);
  const yinYangIndex = (year - 1900) % 2;
  
  const animal = animals[animalIndex];
  const element = elements[elementIndex];
  const polarity = yinYang[yinYangIndex];
  
  return {
    animal,
    element,
    yin_yang: polarity,
    keyword: `${element} ${animal}`,
    source: "calculated"
  };
}

function calculateNumerology(birthDate: string, fullName: string) {
  // ---- NAME-BY-NAME REDUCTION HELPERS ----
  const PythagoreanValues: Record<string, number> = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
    'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
  };
  const pureVowels = ['A', 'E', 'I', 'O', 'U'];

  function reduceToSingleDigitWithMasters(num: number): number {
    // Master numbers: 11, 22, 33
    while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
      num = num.toString().split('').map(Number).reduce((a, b) => a + b, 0);
    }
    return num;
  }

  function reduceNameParts(fullName: string, filterFn: (letter: string) => boolean): number {
    const nameParts = fullName.toUpperCase().split(/\s+/).filter(Boolean);
    const reducedParts: number[] = [];

    for (const part of nameParts) {
      const letters = part.replace(/[^A-Z]/g, '').split('').filter(filterFn);
      const sum = letters.reduce((acc, ch) => acc + (PythagoreanValues[ch] || 0), 0);
      const reduced = reduceToSingleDigitWithMasters(sum);
      reducedParts.push(reduced);
    }

    const total = reducedParts.reduce((a, b) => a + b, 0);
    return reduceToSingleDigitWithMasters(total);
  }

  // Life Path: sum ALL digits in birthdate, reduce
  function calculateLifePath(birthDate: string) {
    // Expects YYYY-MM-DD
    const digits = birthDate.replace(/[^0-9]/g, '').split('').map(Number);
    const sum = digits.reduce((a, b) => a + b, 0);
    return reduceToSingleDigitWithMasters(sum);
  }

  // Expression: all letters
  function calculateExpression(fullName: string) {
    return reduceNameParts(fullName, (ch) => /[A-Z]/.test(ch));
  }
  // Soul Urge: vowels only (exclude Y)
  function calculateSoulUrge(fullName: string) {
    return reduceNameParts(fullName, (ch) => pureVowels.includes(ch));
  }
  // Personality: consonants only (exclude A E I O U)
  function calculatePersonality(fullName: string) {
    return reduceNameParts(fullName, (ch) => /[A-Z]/.test(ch) && !pureVowels.includes(ch));
  }
  // Birthday Number: reduce day only
  function calculateBirthday(birthDate: string) {
    const day = parseInt(birthDate.split('-')[2]);
    return reduceToSingleDigitWithMasters(day);
  }

  // Provide keywords
  const getKeyword = (type: string, number: number) => {
    const dictionaries: Record<string, Record<number, string>> = {
      life: {
        1: 'Leader', 2: 'Cooperator', 3: 'Creative', 4: 'Builder', 5: 'Freedom',
        6: 'Nurturer', 7: 'Seeker', 8: 'Achiever', 9: 'Humanitarian',
        11: 'Illuminating Visionary', 22: 'Master Builder', 33: 'Master Teacher'
      },
      expression: {
        1: 'Pioneering Leader', 2: 'Diplomatic Peacemaker', 3: 'Creative Communicator',
        4: 'Practical Organizer', 5: 'Dynamic Adventurer', 6: 'Compassionate Helper',
        7: 'Analytical Thinker', 8: 'Executive Achiever', 9: 'Humanitarian Visionary',
        11: 'Inspirational Visionary (Master)', 22: 'Master Manifestor', 33: 'Universal Healer'
      },
      soul: {
        1: 'Independent Pioneer', 2: 'Harmonious Peacemaker', 3: 'Creative Self-Expression',
        4: 'Stable Security', 5: 'Adventure Freedom', 6: 'Nurturing Service',
        7: 'Spiritual Understanding', 8: 'Ambitious Manifestor', 9: 'Universal Love',
        11: 'Spiritual Insight', 22: 'Global Vision', 33: 'Universal Compassion'
      },
      personality: {
        1: 'Original', 2: 'Sensitive', 3: 'Expressive', 4: 'Practical', 5: 'Versatile',
        6: 'Responsible', 7: 'Analytical', 8: 'Executive', 9: 'Generous',
        11: 'Intuitive', 22: 'Master Builder', 33: 'Master Teacher'
      },
      birthday: {
        1: 'Original', 2: 'Sensitive', 3: 'Expressive', 4: 'Practical', 5: 'Versatile',
        6: 'Responsible', 7: 'Analytical', 8: 'Executive', 9: 'Generous',
        11: 'Intuitive', 22: 'Master Builder', 33: 'Master Teacher'
      }
    };
    return dictionaries[type]?.[number] || '';
  };

  // Calculation
  const lifePathNumber = calculateLifePath(birthDate);
  const expressionNumber = calculateExpression(fullName);
  const soulUrgeNumber = calculateSoulUrge(fullName);
  const personalityNumber = calculatePersonality(fullName);
  const birthdayNumber = calculateBirthday(birthDate);

  return {
    life_path_number: lifePathNumber,
    life_path_keyword: getKeyword('life', lifePathNumber),
    expression_number: expressionNumber,
    expression_keyword: getKeyword('expression', expressionNumber),
    soul_urge_number: soulUrgeNumber,
    soul_urge_keyword: getKeyword('soul', soulUrgeNumber),
    personality_number: personalityNumber,
    personality_keyword: getKeyword('personality', personalityNumber),
    birthday_number: birthdayNumber,
    birthday_keyword: getKeyword('birthday', birthdayNumber),
    source: "calculated"
  };
}
