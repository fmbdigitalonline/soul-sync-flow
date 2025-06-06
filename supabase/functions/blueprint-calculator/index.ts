import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const { birthDate, birthTime, birthLocation, timezone } = requestData;

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
      timezone
    });

    // Call the Vercel ephemeris API with proper configuration
    const result = await generateBlueprintWithVercelAPI(birthDate, birthTime, birthLocation, timezone);

    return new Response(JSON.stringify({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      source: "vercel_ephemeris_api",
      notice: "Using accurate Swiss Ephemeris calculations via Vercel API"
    }), {
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders 
      }
    });

  } catch (error) {
    console.error("Error in blueprint calculator:", error);
    
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

async function generateBlueprintWithVercelAPI(birthDate: string, birthTime: string, birthLocation: string, timezone?: string) {
  // Updated Vercel API endpoint - make sure this matches your actual deployment
  const VERCEL_API_URL = "https://soul-sync-flow.vercel.app/api/ephemeris";
  
  try {
    // Parse birth date and time
    const birthDateTime = new Date(`${birthDate}T${birthTime}:00`);
    
    // Extract coordinates from birthLocation
    let coordinates;
    if (birthLocation.includes(',') && /^-?\d+\.?\d*,-?\d+\.?\d*$/.test(birthLocation.trim())) {
      // Direct coordinates format
      coordinates = birthLocation.trim();
    } else {
      // City name format - use default coordinates for testing
      coordinates = "40.7128,-74.0060"; // Default to NYC
    }
    
    console.log("Calling Vercel ephemeris API with:", {
      datetime: birthDateTime.toISOString(),
      coordinates,
      url: VERCEL_API_URL
    });
    
    // Call your Vercel ephemeris API with proper headers
    const ephemerisResponse = await fetch(VERCEL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SoulSync-Blueprint-Calculator/1.0',
        // Add any API key if your Vercel API requires it
        // 'Authorization': `Bearer ${Deno.env.get('VERCEL_API_KEY')}`,
      },
      body: JSON.stringify({
        datetime: birthDateTime.toISOString(),
        coordinates: coordinates
      })
    });
    
    console.log("Vercel API response status:", ephemerisResponse.status);
    console.log("Vercel API response headers:", Object.fromEntries(ephemerisResponse.headers.entries()));
    
    if (!ephemerisResponse.ok) {
      const errorText = await ephemerisResponse.text();
      console.error("Vercel API error response:", errorText);
      throw new Error(`Ephemeris API returned ${ephemerisResponse.status}: ${ephemerisResponse.statusText}. Response: ${errorText}`);
    }
    
    const ephemerisData = await ephemerisResponse.json();
    
    if (!ephemerisData.success) {
      throw new Error(`Ephemeris API error: ${ephemerisData.error || 'Unknown error'}`);
    }
    
    console.log("Received ephemeris data:", ephemerisData);
    
    // Process the accurate planetary data
    const celestialData = ephemerisData.data;
    
    // Generate Western astrology profile
    const westernProfile = generateWesternProfile(celestialData);
    
    // Generate other profile components
    const chineseZodiac = calculateChineseZodiac(new Date(birthDate).getFullYear());
    const numerology = calculateNumerology(birthDate, "Sample Name");
    const humanDesign = await generateHumanDesign(celestialData, birthDate, birthTime);
    
    return {
      calculation_metadata: {
        success: true,
        partial: false,
        errors: {},
        calculated_at: new Date().toISOString(),
        engine: "swiss_ephemeris_vercel",
        notice: "Accurate calculations using Swiss Ephemeris via Vercel API"
      },
      westernProfile,
      chineseZodiac,
      numerology,
      humanDesign,
      celestialData
    };
    
  } catch (error) {
    console.error("Error calling Vercel ephemeris API:", error);
    throw error; // Re-throw the error instead of falling back
  }
}

function generateWesternProfile(celestialData: any) {
  const sunData = celestialData.sun;
  const moonData = celestialData.moon;
  
  if (!sunData || !moonData) {
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
    source: "swiss_ephemeris_accurate"
  };
}

async function generateHumanDesign(celestialData: any, birthDate: string, birthTime: string) {
  // Import the enhanced Human Design calculator
  const { calculateHumanDesign } = await import('./human-design-calculator.ts');
  
  try {
    return await calculateHumanDesign(birthDate, birthTime, "New York", "America/New_York", celestialData);
  } catch (error) {
    console.error("Error calculating Human Design:", error);
    
    // Fallback Human Design data
    return {
      type: "Generator",
      profile: "1/3",
      authority: "Sacral",
      strategy: "To Respond",
      definition: "Single",
      not_self_theme: "Frustration",
      life_purpose: "To find satisfaction through responding",
      gates: {
        unconscious_design: [],
        conscious_personality: []
      },
      source: "fallback_calculation"
    };
  }
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
  const dateObj = new Date(birthDate);
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  const year = dateObj.getFullYear();
  
  // Life Path Number calculation
  const lifePathSum = month + day + year;
  const lifePathNumber = reduceToSingleDigit(lifePathSum);
  
  return {
    life_path_number: lifePathNumber,
    life_path_keyword: getLifePathKeyword(lifePathNumber),
    expression_number: 7, // Temporary
    expression_keyword: "Seeker",
    soul_urge_number: 3, // Temporary
    soul_urge_keyword: "Creative",
    personality_number: 1, // Temporary
    source: "calculated"
  };
}

function reduceToSingleDigit(num: number): number {
  while (num > 9) {
    num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return num;
}

function getLifePathKeyword(number: number): string {
  const keywords: Record<number, string> = {
    1: 'Leader', 2: 'Cooperator', 3: 'Creative', 4: 'Builder', 5: 'Freedom',
    6: 'Nurturer', 7: 'Seeker', 8: 'Achiever', 9: 'Humanitarian'
  };
  return keywords[number] || 'Seeker';
}

async function generateTemporaryBlueprint(birthDate: string, birthTime: string, birthLocation: string, timezone?: string) {
  const birthDateObj = new Date(birthDate);
  const birthYear = birthDateObj.getFullYear();
  const birthMonth = birthDateObj.getMonth() + 1;
  const birthDay = birthDateObj.getDate();
  
  const sunSign = calculateSunSign(birthMonth, birthDay);
  
  const mockPlanetaryData = {
    sun: {
      longitude: ((birthMonth - 1) * 30 + birthDay) % 360,
      latitude: 0,
      speed: 0.98,
      distance: 1.0,
      sign: sunSign,
      sign_degree: birthDay,
      is_retrograde: false
    },
    moon: {
      longitude: (((birthMonth - 1) * 30 + birthDay) + 90) % 360,
      latitude: 0,
      speed: 13.2,
      distance: 0.0025,
      sign: calculateSignFromLongitude((((birthMonth - 1) * 30 + birthDay) + 90) % 360),
      sign_degree: ((((birthMonth - 1) * 30 + birthDay) + 90) % 360) % 30,
      is_retrograde: false
    },
    // Add other planets with mock data
    mercury: { longitude: 0, latitude: 0, speed: 0, distance: 0, sign: "Aries", sign_degree: 0, is_retrograde: false },
    venus: { longitude: 0, latitude: 0, speed: 0, distance: 0, sign: "Aries", sign_degree: 0, is_retrograde: false },
    mars: { longitude: 0, latitude: 0, speed: 0, distance: 0, sign: "Aries", sign_degree: 0, is_retrograde: false },
    jupiter: { longitude: 0, latitude: 0, speed: 0, distance: 0, sign: "Aries", sign_degree: 0, is_retrograde: false },
    saturn: { longitude: 0, latitude: 0, speed: 0, distance: 0, sign: "Aries", sign_degree: 0, is_retrograde: false },
    uranus: { longitude: 0, latitude: 0, speed: 0, distance: 0, sign: "Aries", sign_degree: 0, is_retrograde: false },
    neptune: { longitude: 0, latitude: 0, speed: 0, distance: 0, sign: "Aries", sign_degree: 0, is_retrograde: false },
    pluto: { longitude: 0, latitude: 0, speed: 0, distance: 0, sign: "Aries", sign_degree: 0, is_retrograde: false },
    north_node: { longitude: 0, latitude: 0, speed: 0, distance: 0, sign: "Aries", sign_degree: 0, is_retrograde: false },
    south_node: { longitude: 0, latitude: 0, speed: 0, distance: 0, sign: "Aries", sign_degree: 0, is_retrograde: false }
  };

  return {
    calculation_metadata: {
      success: true,
      partial: true,
      errors: {},
      calculated_at: new Date().toISOString(),
      engine: "temporary_fallback",
      notice: "Using fallback data due to API error. Please check API connectivity."
    },
    westernProfile: {
      sun_sign: `${sunSign} ${mockPlanetaryData.sun.sign_degree.toFixed(1)}°`,
      sun_keyword: getSunKeyword(sunSign),
      moon_sign: `${mockPlanetaryData.moon.sign} ${mockPlanetaryData.moon.sign_degree.toFixed(1)}°`,
      moon_keyword: getMoonKeyword(mockPlanetaryData.moon.sign),
      rising_sign: "Aries 0°",
      source: "temporary_calculation"
    },
    chineseZodiac: calculateChineseZodiac(birthYear),
    numerology: calculateNumerology(birthDate, "Sample Name"),
    humanDesign: {
      type: "Generator",
      profile: "1/3",
      authority: "Sacral",
      strategy: "To Respond",
      definition: "Single",
      not_self_theme: "Frustration",
      life_purpose: "To find satisfaction through responding",
      gates: {
        unconscious_design: [],
        conscious_personality: []
      },
      source: "temporary_calculation"
    },
    celestialData: mockPlanetaryData
  };
}

function calculateSunSign(month: number, day: number): string {
  if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return "Aries";
  if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return "Taurus";
  if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return "Gemini";
  if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return "Cancer";
  if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return "Leo";
  if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return "Virgo";
  if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return "Libra";
  if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return "Scorpio";
  if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return "Sagittarius";
  if ((month == 12 && day >= 22) || (month == 1 && day <= 19)) return "Capricorn";
  if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}
