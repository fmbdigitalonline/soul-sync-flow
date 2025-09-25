
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { calculatePlanetaryPositionsWithAstro, eclipticLongitudeByJd } from "./ephemeris-astroengine.ts";
// Fixed: Use namespace import
import * as Astronomy from "npm:astronomy-engine@2";

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
    console.log("Starting Astronomy Engine test with safe implementation");
    
    // Track time for performance measurement
    const startTime = performance.now();
    
    // Test parameters
    const testDate = "2000-01-01";
    const testTime = "12:00";
    const testLocation = "New York, NY";
    const testTimezone = "America/New_York";
    
    console.log(`Testing calculation for ${testDate} ${testTime} at ${testLocation}`);
    
    // Test Julian Day conversion function with a known value
    try {
      const testJd = 2460000; // ~2023-01-21
      const sunLonByJd = eclipticLongitudeByJd("Sun", testJd);
      const moonLonByJd = eclipticLongitudeByJd("Moon", testJd);
      console.log(`Sanity test with Julian Day (${testJd}): Sun lon: ${sunLonByJd}°, Moon lon: ${moonLonByJd}°`);
      
      // Additional sanity check with different Julian Day
      const testJd2 = 2460080.5; // 2025-05-22 noon TT
      console.log(`Additional JD test (${testJd2}): Sun: ${eclipticLongitudeByJd("Sun", testJd2)}°, Moon: ${eclipticLongitudeByJd("Moon", testJd2)}°`);
    } catch (error) {
      console.error("Julian day test failed:", error);
      // Continue with the rest of the tests
    }
    
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
        message: "Astronomy Engine test completed successfully with safe implementation",
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
          jd_test: {
            jd: testJd,
            sun_longitude: sunLonByJd,
            moon_longitude: moonLonByJd,
            sun_sign: zodiacSigns[Math.floor(sunLonByJd / 30)]
          },
          jd_test_2: {
            jd: testJd2,
            sun_longitude: eclipticLongitudeByJd("Sun", testJd2),
            moon_longitude: eclipticLongitudeByJd("Moon", testJd2)
          },
          processing_time_ms: duration,
          engine: "astronomy_engine",
          fix_applied: "safe_time_conversion"
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
