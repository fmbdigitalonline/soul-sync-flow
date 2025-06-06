
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { calculatePlanetaryPositionsWithAstro } from './ephemeris-astroengine.ts';

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
    if (url.pathname.includes('/test-moon-minimal')) {
      // Import and execute the Moon test
      const { default: testMoonMinimal } = await import('./test-moon-minimal.ts');
      return await testMoonMinimal(req);
    }
    
    if (url.pathname.includes('/test-astrometry')) {
      // Import and execute the Astrometry test
      const { default: testAstrometry } = await import('./test-astrometry.ts');
      return await testAstrometry(req);
    }
    
    if (url.pathname.includes('/test-available-astronomy')) {
      // Import and execute the comprehensive astronomy availability test
      const { default: testAvailableAstronomy } = await import('./test-available-astronomy.ts');
      return await testAvailableAstronomy(req);
    }
    
    if (url.pathname.includes('/test-wasm')) {
      // Import and execute the WASM test
      const { default: testWasm } = await import('./test-wasm.ts');
      return await testWasm(req);
    }

    // Only parse JSON for main blueprint calculation endpoints and POST requests
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

    // Calculate planetary positions using Astronomy Engine
    const positions = await calculatePlanetaryPositionsWithAstro(
      birthDate,
      birthTime,
      birthLocation,
      timezone
    );

    return new Response(JSON.stringify({
      success: true,
      data: positions,
      timestamp: new Date().toISOString(),
      source: "astronomy_engine"
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
