
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

    // TEMPORARY: Return a structured response while transitioning to helper API
    // This provides a functioning blueprint system while the proper ephemeris API is being built
    const result = await generateTemporaryBlueprint(birthDate, birthTime, birthLocation, timezone);

    return new Response(JSON.stringify({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      source: "temporary_fallback",
      notice: "Using temporary data while setting up dedicated ephemeris API"
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

async function generateTemporaryBlueprint(birthDate: string, birthTime: string, birthLocation: string, timezone?: string) {
  // Parse the birth date to extract information for temporary calculations
  const birthDateObj = new Date(birthDate);
  const birthYear = birthDateObj.getFullYear();
  const birthMonth = birthDateObj.getMonth() + 1;
  const birthDay = birthDateObj.getDate();
  
  // Simple sun sign calculation based on birth date (tropical zodiac)
  const sunSign = calculateSunSign(birthMonth, birthDay);
  
  // Mock planetary positions - these would come from your helper API
  const mockPlanetaryData = {
    sun: {
      longitude: ((birthMonth - 1) * 30 + birthDay) % 360, // Simplified sun position
      latitude: 0,
      speed: 0.98,
      distance: 1.0,
      sign: sunSign,
      sign_degree: birthDay,
      is_retrograde: false
    },
    moon: {
      longitude: (((birthMonth - 1) * 30 + birthDay) + 90) % 360, // Mock moon position
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
      notice: "This is temporary data. Setting up dedicated ephemeris API for accurate calculations."
    },
    westernProfile: {
      sun_sign: `${sunSign} ${mockPlanetaryData.sun.sign_degree.toFixed(1)}°`,
      sun_keyword: getSunKeyword(sunSign),
      moon_sign: `${mockPlanetaryData.moon.sign} ${mockPlanetaryData.moon.sign_degree.toFixed(1)}°`,
      moon_keyword: getMoonKeyword(mockPlanetaryData.moon.sign),
      rising_sign: "Aries 0°", // Temporary
      source: "temporary_calculation"
    },
    chineseZodiac: calculateChineseZodiac(birthYear),
    numerology: calculateNumerology(birthDate, "Sample Name"),
    humanDesign: {
      type: "Generator", // Temporary
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
  // Simplified sun sign calculation (tropical zodiac dates)
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
