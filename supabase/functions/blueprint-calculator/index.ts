
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { calculateNumerology } from './numerology-calculator.ts';
import { calculateImprovedHumanDesign } from './improved-human-design-calculator.ts';
import { calculateEnhancedWesternProfile } from './enhanced-western-calculator.ts';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
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
    let requestData = {};
    if (req.method === 'POST') {
      const text = await req.text();
      if (text.trim()) {
        try {
          requestData = JSON.parse(text);
        } catch (parseError) {
          console.error("Failed to parse request body:", parseError);
          return new Response(
            JSON.stringify({ 
              error: "Invalid request format",
              details: parseError.message,
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

    // Extract required fields including fullName
    const { birthDate, birthTime, birthLocation, fullName = 'Unknown' } = requestData;

    // Validate required fields for main blueprint calculation
    if (!birthDate || !birthTime || !birthLocation) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields",
          details: "birthDate, birthTime, and birthLocation are required. fullName is recommended for accurate numerology.",
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

    console.log("Enhanced Blueprint Calculator: Processing request", {
      birthDate,
      birthTime,
      birthLocation,
      fullName
    });

    // Call the enhanced blueprint generation with improved calculations
    const result = await generateEnhancedBlueprintWithAccurateCalculations(birthDate, birthTime, birthLocation, fullName);

    return new Response(JSON.stringify({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      source: "enhanced_ephemeris_api_with_improved_calculations",
      notice: "Using production-grade calculations with canonical Human Design wheel, proper numerology, and enhanced Western astrology"
    }), {
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders 
      }
    });

  } catch (error) {
    console.error("Error in enhanced blueprint calculator:", error);
    
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
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

async function generateEnhancedBlueprintWithAccurateCalculations(birthDate: string, birthTime: string, birthLocation: string, fullName: string) {
  // Use the improved Vercel API endpoint
  const IMPROVED_VERCEL_API_URL = "https://soul-sync-flow.vercel.app/api/ephemeris-improved";
  
  try {
    console.log("Step 1: Getting coordinates and timezone...");
    
    const coordinates = await getLocationCoordinates(birthLocation);
    console.log(`Geocoded location "${birthLocation}" to: ${coordinates.latitude}, ${coordinates.longitude}`);
    
    // Preserve seconds if supplied in birthTime
    const birthDateTime = new Date(`${birthDate}T${birthTime.length <= 5 ? birthTime + ':00' : birthTime}`);
    const timezoneOffset = await getHistoricalTimezoneOffset(coordinates, birthDateTime);
    console.log(`Historical timezone offset: ${timezoneOffset} seconds (${timezoneOffset/3600} hours)`);
    
    const localTimestamp = birthDateTime.getTime();
    const utcTimestamp = localTimestamp - (timezoneOffset * 1000);
    const accurateUtcDateTime = new Date(utcTimestamp);
    
    console.log(`Local birth time: ${birthDateTime.toISOString()}`);
    console.log(`Accurate UTC time: ${accurateUtcDateTime.toISOString()}`);
    
    console.log("Step 2: Calling improved Vercel ephemeris API...");
    
    const ephemerisResponse = await fetch(IMPROVED_VERCEL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SoulSync-Enhanced-Blueprint-Calculator/2.0',
      },
      body: JSON.stringify({
        datetime: accurateUtcDateTime.toISOString(),
        coordinates: `${coordinates.latitude},${coordinates.longitude}`
      })
    });
    
    console.log("Improved Vercel API response status:", ephemerisResponse.status);
    
    if (!ephemerisResponse.ok) {
      const errorText = await ephemerisResponse.text();
      console.error("Improved Vercel API error response:", errorText);
      throw new Error(`Enhanced Ephemeris API returned ${ephemerisResponse.status}: ${ephemerisResponse.statusText}. Response: ${errorText}`);
    }
    
    const ephemerisData = await ephemerisResponse.json();
    
    if (!ephemerisData.success) {
      throw new Error(`Enhanced Ephemeris API error: ${ephemerisData.error || 'Unknown error'}`);
    }
    
    console.log("Step 3: Processing enhanced ephemeris data...");
    
    const celestialData = ephemerisData.data;
    
    // Generate enhanced Western astrology profile with safe house data access
    const westernProfile = calculateEnhancedWesternProfile(celestialData, celestialData.houses ?? {});
    
    // Generate improved numerology with actual fullName
    const numerology = calculateNumerology(birthDate, fullName);
    
    // Generate enhanced Chinese zodiac
    const chineseZodiac = calculateChineseZodiac(new Date(birthDate).getFullYear());
    
    // Generate improved Human Design with canonical wheel
    const humanDesign = await calculateImprovedHumanDesign(birthDate, birthTime, birthLocation, "AUTO_RESOLVED", celestialData);
    
    return {
      calculation_metadata: {
        success: true,
        partial: false,
        errors: {},
        calculated_at: new Date().toISOString(),
        engine: "enhanced_swiss_ephemeris_with_production_grade_calculations",
        timezone_info: {
          location: birthLocation,
          coordinates: `${coordinates.latitude},${coordinates.longitude}`,
          historical_offset_seconds: timezoneOffset,
          historical_offset_hours: timezoneOffset / 3600,
          local_birth_time: birthDateTime.toISOString(),
          utc_birth_time: accurateUtcDateTime.toISOString()
        },
        improvements: [
          "VSOP87D planetary positions with ΔT correction",
          "Professional orb system for aspects",
          "Canonical Jovian Archive Human Design wheel",
          "Classical Pythagorean numerology with master numbers",
          "Proper sign boundary handling",
          "Enhanced house system calculations",
          "Accurate fullName-based numerology calculations"
        ],
        notice: "Production-grade accuracy with professional calculation standards"
      },
      westernProfile,
      chineseZodiac,
      numerology,
      humanDesign,
      celestialData: {
        ...celestialData,
        calculation_notes: "Enhanced calculations with professional-grade accuracy"
      }
    };
    
  } catch (error) {
    console.error("Error in enhanced blueprint generation:", error);
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
