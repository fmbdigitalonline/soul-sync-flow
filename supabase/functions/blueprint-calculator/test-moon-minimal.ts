
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as Astronomy from "npm:astronomy-engine@2";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function testMoonMinimal(req) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use the specific date from the error logs that was causing issues
    const year = 2024, month = 11, day = 15, hour = 6, minute = 23; // User's birth date
    const dateObj = new Date(Date.UTC(year, month - 1, day, hour, minute, 0)); // JS Date: month is 0-indexed
    
    let responseMessage = `Enhanced Moon Test for: ${dateObj.toISOString()}\n`;
    let status = 200;

    try {
      console.log("Enhanced Test: Creating AstroTime...");
      
      // Step 1: Check TrueObliquity function availability
      responseMessage += `TrueObliquity function type: ${typeof Astronomy.TrueObliquity}\n`;
      console.log(`TrueObliquity function type: ${typeof Astronomy.TrueObliquity}`);
      
      // Step 2: Create AstroTime using MakeTime
      const astroTime = Astronomy.MakeTime(dateObj);
      
      if (!astroTime || typeof astroTime.tt !== 'number' || isNaN(astroTime.tt)) {
        responseMessage += `Enhanced Test - ERROR: astroTime is invalid after MakeTime. TT: ${astroTime ? astroTime.tt : 'astroTime_undefined'}, Object: ${JSON.stringify(astroTime)}\n`;
        console.error(responseMessage);
        status = 500;
      } else {
        responseMessage += `Enhanced Test - INFO: astroTime created successfully. TT: ${astroTime.tt}\n`;
        responseMessage += `Enhanced Test - DEBUG: Full astroTime object: ${JSON.stringify(astroTime)}\n`;
        console.log(responseMessage);

        // Step 3: Try alternative AstroTime creation using Julian Day
        try {
          console.log("Enhanced Test - INFO: Attempting alternative AstroTime creation via Julian Day...");
          const jd_ut = Astronomy.DateToJulian ? Astronomy.DateToJulian(dateObj) : null;
          if (jd_ut && Astronomy.AstroTime) {
            const testAstroTimeFromJD = new Astronomy.AstroTime(jd_ut);
            responseMessage += `Enhanced Test - INFO: AstroTime from JD_UT: TT = ${testAstroTimeFromJD.tt}, Object: ${JSON.stringify(testAstroTimeFromJD)}\n`;
            console.log(`AstroTime from JD_UT: TT = ${testAstroTimeFromJD.tt}`);
          } else {
            responseMessage += `Enhanced Test - WARNING: DateToJulian or AstroTime constructor not available\n`;
          }
        } catch (e) {
          responseMessage += `Enhanced Test - WARNING: Alternative AstroTime creation failed: ${e.toString()}\n`;
        }

        // Test 1: Try EclipticLongitude first (this worked in previous tests)
        try {
          console.log("Enhanced Test - INFO: Attempting Astronomy.EclipticLongitude('Moon', astroTime)...");
          const moonLon = Astronomy.EclipticLongitude("Moon", astroTime);
          responseMessage += `Enhanced Test - SUCCESS: EclipticLongitude for Moon SUCCEEDED. Longitude: ${moonLon}\n`;
          console.log(`EclipticLongitude for Moon: ${moonLon}`);
        } catch (e) {
          responseMessage += `Enhanced Test - FAILURE: EclipticLongitude for Moon FAILED. Error: ${e.toString()}\n`;
          console.error(`EclipticLongitude error: ${e.toString()}`);
        }

        // Test 2: Try the problematic Ecliptic call with detailed error logging
        try {
          console.log("Enhanced Test - INFO: Attempting Astronomy.Ecliptic('Moon', astroTime)...");
          console.log(`Pre-Ecliptic astroTime validation: tt=${astroTime.tt}, type=${typeof astroTime.tt}, isNaN=${isNaN(astroTime.tt)}`);
          const ecl = Astronomy.Ecliptic("Moon", astroTime);
          responseMessage += `Enhanced Test - SUCCESS: Ecliptic call for Moon SUCCEEDED. Longitude: ${ecl.elon}, Latitude: ${ecl.elat}\n`;
          console.log(`Ecliptic for Moon: lon=${ecl.elon}, lat=${ecl.elat}`);
        } catch (e) {
          responseMessage += `Enhanced Test - CRITICAL FAILURE: Ecliptic call for Moon FAILED. Error: ${e.toString()}\nStack: ${e.stack}\n`;
          console.error(`Ecliptic error: ${e.toString()}`);
          console.error(`Stack: ${e.stack}`);
          status = 500;
        }

        // Test 3: Try GeoVector for Moon with enhanced error reporting
        try {
          console.log("Enhanced Test - INFO: Attempting Astronomy.GeoVector('Moon', astroTime)...");
          console.log(`Pre-GeoVector astroTime validation: tt=${astroTime.tt}, object keys: ${Object.keys(astroTime)}`);
          const geoMoon = Astronomy.GeoVector("Moon", astroTime);
          responseMessage += `Enhanced Test - SUCCESS: GeoVector for Moon SUCCEEDED. X: ${geoMoon.x}, Y: ${geoMoon.y}, Z: ${geoMoon.z}\n`;
          console.log(`GeoVector for Moon: x=${geoMoon.x}, y=${geoMoon.y}, z=${geoMoon.z}`);
        } catch (e) {
          responseMessage += `Enhanced Test - FAILURE: GeoVector for Moon FAILED. Error: ${e.toString()}\nStack: ${e.stack}\n`;
          console.error(`GeoVector error: ${e.toString()}`);
          console.error(`Stack: ${e.stack}`);
        }

        // Test 4: Try TrueObliquity if function is available
        if (typeof Astronomy.TrueObliquity === 'function') {
          try {
            console.log("Enhanced Test - INFO: Attempting Astronomy.TrueObliquity(astroTime)...");
            const obliquity = Astronomy.TrueObliquity(astroTime);
            responseMessage += `Enhanced Test - SUCCESS: TrueObliquity SUCCEEDED. Obliquity: ${obliquity}°\n`;
            console.log(`TrueObliquity: ${obliquity}°`);
          } catch (e) {
            responseMessage += `Enhanced Test - FAILURE: TrueObliquity FAILED. Error: ${e.toString()}\nStack: ${e.stack}\n`;
            console.error(`TrueObliquity error: ${e.toString()}`);
            console.error(`Stack: ${e.stack}`);
          }
        } else {
          responseMessage += `Enhanced Test - WARNING: TrueObliquity function not available (type: ${typeof Astronomy.TrueObliquity})\n`;
        }

        // Test 5: Try other planets for comparison to see if the issue is widespread
        const testBodies = ["Mercury", "Venus", "Mars"];
        for (const body of testBodies) {
          try {
            console.log(`Enhanced Test - INFO: Testing Ecliptic for ${body}...`);
            const ecl = Astronomy.Ecliptic(body, astroTime);
            responseMessage += `${body}: lon=${ecl.elon.toFixed(6)}°, lat=${ecl.elat.toFixed(6)}° - SUCCESS\n`;
          } catch (e) {
            responseMessage += `${body} FAILED: ${e.toString()}\n`;
            console.error(`${body} failed: ${e.toString()}`);
          }
        }

        // Test 6: Sun using HelioVector approach
        try {
          const earthVec = Astronomy.HelioVector("Earth", astroTime);
          const lonRad = Math.atan2(earthVec.y, earthVec.x);
          const longitude = (lonRad * 180/Math.PI + 180 + 360) % 360;
          responseMessage += `Sun (via HelioVector): ${longitude.toFixed(6)}° - SUCCESS\n`;
        } catch (e) {
          responseMessage += `Sun FAILED: ${e.toString()}\n`;
        }

        // Test 7: Library version and environment info
        responseMessage += `\n=== ENVIRONMENT INFO ===\n`;
        responseMessage += `Deno version: ${Deno.version.deno}\n`;
        responseMessage += `Available Astronomy functions: ${Object.keys(Astronomy).slice(0, 10).join(', ')}...\n`;
        responseMessage += `Total Astronomy exports: ${Object.keys(Astronomy).length}\n`;
      }
    } catch (e) {
      responseMessage += `Enhanced Test - CRITICAL FAILURE: General error. Error: ${e.toString()}\nStack: ${e.stack}\n`;
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
    console.error("Unexpected error in enhanced Moon test:", error);
    
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
}

// Export for direct serving and for import by main router
export default testMoonMinimal;

// Also support direct serving if this file is run independently
if (import.meta.main) {
  serve(testMoonMinimal);
}
