
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { calculatePlanetaryPositionsWithAstro } from "./ephemeris-astroengine.ts";

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
    console.log("Starting Astronomy Engine test");
    
    // Track time for performance measurement
    const startTime = performance.now();
    
    // Test parameters
    const testDate = "2000-01-01";
    const testTime = "12:00";
    const testLocation = "New York, NY";
    const testTimezone = "America/New_York";
    
    console.log(`Testing calculation for ${testDate} ${testTime} at ${testLocation}`);
    
    // Calculate positions using Astronomy Engine
    const positions = await calculatePlanetaryPositionsWithAstro(
      testDate, testTime, testLocation, testTimezone
    );
    
    // Extract sun sign and moon sign
    const sunLongitude = positions.sun.longitude;
    const moonLongitude = positions.moon.longitude;
    const sunSign = Math.floor(sunLongitude / 30);
    const moonSign = Math.floor(moonLongitude / 30);
    
    const zodiacSigns = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 
      'Leo', 'Virgo', 'Libra', 'Scorpio',
      'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    
    const readableSunSign = zodiacSigns[sunSign];
    const readableMoonSign = zodiacSigns[moonSign];
    
    console.log(`Sun position: ${sunLongitude.toFixed(6)}° (${readableSunSign})`);
    console.log(`Moon position: ${moonLongitude.toFixed(6)}° (${readableMoonSign})`);
    
    // Calculate time spent
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Astronomy Engine test completed successfully",
        test_results: {
          date: testDate,
          time: testTime,
          location: testLocation,
          sun_position: {
            longitude: sunLongitude,
            sign: readableSunSign,
            sign_index: sunSign
          },
          moon_position: {
            longitude: moonLongitude,
            sign: readableMoonSign,
            sign_index: moonSign
          },
          ascendant: {
            longitude: positions.ascendant.longitude,
            sign: zodiacSigns[Math.floor(positions.ascendant.longitude / 30)]
          },
          processing_time_ms: duration,
          engine: "astronomy_engine"
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
    console.error("Astronomy Engine test failed:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack,
        message: "Failed to test the Astronomy Engine implementation"
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});
