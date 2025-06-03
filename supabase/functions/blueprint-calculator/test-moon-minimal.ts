
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    // Use the specific date from the error logs that was causing issues
    const year = 1978, month = 2, day = 12, hour = 22, minute = 0; // User's birth date
    const dateObj = new Date(Date.UTC(year, month - 1, day, hour, minute, 0)); // JS Date: month is 0-indexed
    
    let responseMessage = `Minimal Moon Test for: ${dateObj.toISOString()}\n`;
    let status = 200;

    try {
      console.log("Minimal Test: Creating AstroTime...");
      const astroTime = Astronomy.MakeTime(dateObj);

      if (!astroTime || typeof astroTime.tt !== 'number' || isNaN(astroTime.tt)) {
        responseMessage += `Minimal Test - ERROR: astroTime is invalid after MakeTime. TT: ${astroTime ? astroTime.tt : 'astroTime_undefined'}, Object: ${JSON.stringify(astroTime)}\n`;
        console.error(responseMessage);
        status = 500;
      } else {
        responseMessage += `Minimal Test - INFO: astroTime created successfully. TT: ${astroTime.tt}\n`;
        console.log(responseMessage);

        // Test 1: Try EclipticLongitude first (this worked in self-test)
        try {
          console.log("Minimal Test - INFO: Attempting Astronomy.EclipticLongitude('Moon', astroTime)...");
          const moonLon = Astronomy.EclipticLongitude("Moon", astroTime);
          responseMessage += `Minimal Test - SUCCESS: EclipticLongitude for Moon SUCCEEDED. Longitude: ${moonLon}\n`;
          console.log(`EclipticLongitude for Moon: ${moonLon}`);
        } catch (e) {
          responseMessage += `Minimal Test - FAILURE: EclipticLongitude for Moon FAILED. Error: ${e.toString()}\n`;
          console.error(`EclipticLongitude error: ${e.toString()}`);
        }

        // Test 2: Try the problematic Ecliptic call
        try {
          console.log("Minimal Test - INFO: Attempting Astronomy.Ecliptic('Moon', astroTime)...");
          const ecl = Astronomy.Ecliptic("Moon", astroTime);
          responseMessage += `Minimal Test - SUCCESS: Ecliptic call for Moon SUCCEEDED. Longitude: ${ecl.elon}, Latitude: ${ecl.elat}\n`;
          console.log(`Ecliptic for Moon: lon=${ecl.elon}, lat=${ecl.elat}`);
        } catch (e) {
          responseMessage += `Minimal Test - CRITICAL FAILURE: Ecliptic call for Moon FAILED. Error: ${e.toString()}\nStack: ${e.stack}\n`;
          console.error(`Ecliptic error: ${e.toString()}`);
          console.error(`Stack: ${e.stack}`);
          status = 500;
        }

        // Test 3: Try other planets for comparison
        const testBodies = ["Sun", "Mercury", "Venus", "Mars"];
        for (const body of testBodies) {
          try {
            if (body === "Sun") {
              // Use HelioVector for Sun (as in main code)
              const earthVec = Astronomy.HelioVector("Earth", astroTime);
              const lonRad = Math.atan2(earthVec.y, earthVec.x);
              const longitude = (lonRad * 180/Math.PI + 180 + 360) % 360;
              responseMessage += `${body} (via HelioVector): ${longitude.toFixed(6)}°\n`;
            } else {
              const ecl = Astronomy.Ecliptic(body, astroTime);
              responseMessage += `${body}: lon=${ecl.elon.toFixed(6)}°, lat=${ecl.elat.toFixed(6)}°\n`;
            }
          } catch (e) {
            responseMessage += `${body} FAILED: ${e.toString()}\n`;
          }
        }
      }
    } catch (e) {
      responseMessage += `Minimal Test - CRITICAL FAILURE: General error. Error: ${e.toString()}\nStack: ${e.stack}\n`;
      console.error(responseMessage);
      status = 500;
    }

    return new Response(responseMessage, { 
      status: status, 
      headers: { 
        "Content-Type": "text/plain; charset=utf-8",
        ...corsHeaders 
      } 
    });
  } catch (error) {
    console.error("Unexpected error in minimal Moon test:", error);
    
    return new Response(
      `Unexpected error: ${error.message}\nStack: ${error.stack}`,
      { 
        status: 500,
        headers: { 
          "Content-Type": "text/plain; charset=utf-8",
          ...corsHeaders 
        } 
      }
    );
  }
});
