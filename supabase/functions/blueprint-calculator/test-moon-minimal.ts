
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
    console.log('=== COMPLETE EXPORT ANALYSIS ===');
    
    // Get ALL exports from the Astronomy module
    const allExports = Object.keys(Astronomy).sort();
    console.log(`Total exports found: ${allExports.length}`);
    console.log('All exports:', allExports);
    
    // Check specific functions mentioned in your analysis
    const criticalFunctions = [
      'TrueObliquity',
      'DateToJulian', 
      'AstroTime',
      'MakeTime',
      'Ecliptic',
      'EclipticLongitude',
      'GeoVector',
      'HelioVector',
      'Equator',
      'SiderealTime',
      'TrueLunarNodes'
    ];
    
    let responseMessage = `=== COMPLETE EXPORT ANALYSIS ===\n`;
    responseMessage += `Total exports found: ${allExports.length}\n`;
    responseMessage += `All exports: ${allExports.join(', ')}\n\n`;
    
    responseMessage += `=== CRITICAL FUNCTION AVAILABILITY ===\n`;
    criticalFunctions.forEach(funcName => {
      const funcType = typeof Astronomy[funcName];
      responseMessage += `${funcName}: ${funcType}\n`;
      console.log(`${funcName}: ${funcType}`);
    });
    responseMessage += `\n`;
    
    // Look for functions that might be TrueObliquity under different names
    const obliquityFunctions = allExports.filter(name => 
      name.toLowerCase().includes('obliquity') || 
      name.toLowerCase().includes('tilt') ||
      name.toLowerCase().includes('epsilon')
    );
    responseMessage += `Functions containing 'obliquity', 'tilt', or 'epsilon': ${obliquityFunctions.join(', ')}\n`;
    
    // Look for functions that might be DateToJulian under different names
    const julianFunctions = allExports.filter(name => 
      name.toLowerCase().includes('julian') || 
      name.toLowerCase().includes('jd') ||
      name.toLowerCase().includes('date')
    );
    responseMessage += `Functions containing 'julian', 'jd', or 'date': ${julianFunctions.join(', ')}\n\n`;
    
    // Use the specific date from the error logs that was causing issues
    const year = 2024, month = 11, day = 15, hour = 6, minute = 23;
    const dateObj = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
    
    responseMessage += `=== ASTROTIME CREATION TEST ===\n`;
    responseMessage += `Test date: ${dateObj.toISOString()}\n`;
    
    let status = 200;

    try {
      console.log("Creating AstroTime using MakeTime...");
      const astroTime = Astronomy.MakeTime(dateObj);
      
      if (!astroTime || typeof astroTime.tt !== 'number' || isNaN(astroTime.tt)) {
        responseMessage += `ERROR: astroTime is invalid. TT: ${astroTime ? astroTime.tt : 'undefined'}\n`;
        responseMessage += `Full object: ${JSON.stringify(astroTime)}\n`;
        status = 500;
      } else {
        responseMessage += `SUCCESS: astroTime created. TT: ${astroTime.tt}\n`;
        responseMessage += `Full object: ${JSON.stringify(astroTime)}\n`;
        
        // Test alternative AstroTime creation if constructor exists
        if (typeof Astronomy.AstroTime === 'function') {
          try {
            // Try to create from TT directly
            const altAstroTime = new Astronomy.AstroTime(astroTime.tt);
            responseMessage += `Alternative AstroTime from TT: ${JSON.stringify(altAstroTime)}\n`;
          } catch (e) {
            responseMessage += `Alternative AstroTime creation failed: ${e.toString()}\n`;
          }
        }
        
        // Test the functions that work
        responseMessage += `\n=== FUNCTION TESTING ===\n`;
        
        // Test EclipticLongitude (this works)
        if (typeof Astronomy.EclipticLongitude === 'function') {
          try {
            const moonLon = Astronomy.EclipticLongitude("Moon", astroTime);
            responseMessage += `✅ EclipticLongitude("Moon"): ${moonLon}°\n`;
          } catch (e) {
            responseMessage += `❌ EclipticLongitude("Moon") failed: ${e.toString()}\n`;
          }
        }
        
        // Test Ecliptic (this fails)
        if (typeof Astronomy.Ecliptic === 'function') {
          try {
            const ecl = Astronomy.Ecliptic("Moon", astroTime);
            responseMessage += `✅ Ecliptic("Moon"): lon=${ecl.elon}°, lat=${ecl.elat}°\n`;
          } catch (e) {
            responseMessage += `❌ Ecliptic("Moon") failed: ${e.toString()}\n`;
          }
        }
        
        // Test GeoVector (this fails)
        if (typeof Astronomy.GeoVector === 'function') {
          try {
            const geoMoon = Astronomy.GeoVector("Moon", astroTime);
            responseMessage += `✅ GeoVector("Moon"): x=${geoMoon.x}, y=${geoMoon.y}, z=${geoMoon.z}\n`;
          } catch (e) {
            responseMessage += `❌ GeoVector("Moon") failed: ${e.toString()}\n`;
          }
        }
        
        // Test HelioVector (for Sun calculation)
        if (typeof Astronomy.HelioVector === 'function') {
          try {
            const earthVec = Astronomy.HelioVector("Earth", astroTime);
            const lonRad = Math.atan2(earthVec.y, earthVec.x);
            const longitude = (lonRad * 180/Math.PI + 180 + 360) % 360;
            responseMessage += `✅ HelioVector("Earth") -> Sun longitude: ${longitude.toFixed(6)}°\n`;
          } catch (e) {
            responseMessage += `❌ HelioVector("Earth") failed: ${e.toString()}\n`;
          }
        }
        
        // Test other planets with Ecliptic
        const testPlanets = ["Mercury", "Venus", "Mars"];
        testPlanets.forEach(planet => {
          if (typeof Astronomy.Ecliptic === 'function') {
            try {
              const ecl = Astronomy.Ecliptic(planet, astroTime);
              responseMessage += `✅ Ecliptic("${planet}"): lon=${ecl.elon.toFixed(6)}°, lat=${ecl.elat.toFixed(6)}°\n`;
            } catch (e) {
              responseMessage += `❌ Ecliptic("${planet}") failed: ${e.toString()}\n`;
            }
          }
        });
        
        // Test EclipticLongitude for other planets as fallback
        testPlanets.forEach(planet => {
          if (typeof Astronomy.EclipticLongitude === 'function') {
            try {
              const lon = Astronomy.EclipticLongitude(planet, astroTime);
              responseMessage += `✅ EclipticLongitude("${planet}"): ${lon.toFixed(6)}°\n`;
            } catch (e) {
              responseMessage += `❌ EclipticLongitude("${planet}") failed: ${e.toString()}\n`;
            }
          }
        });
      }
    } catch (e) {
      responseMessage += `CRITICAL ERROR during AstroTime creation/testing: ${e.toString()}\n`;
      responseMessage += `Stack: ${e.stack}\n`;
      status = 500;
    }
    
    // Environment information
    responseMessage += `\n=== ENVIRONMENT INFO ===\n`;
    responseMessage += `Deno version: ${Deno.version.deno}\n`;
    responseMessage += `V8 version: ${Deno.version.v8}\n`;
    responseMessage += `TypeScript version: ${Deno.version.typescript}\n`;
    
    return new Response(responseMessage, { 
      status: status, 
      headers: { 
        "Content-Type": "text/plain; charset=utf-8",
        ...corsHeaders 
      } 
    });
  } catch (error) {
    console.error("Unexpected error in export analysis:", error);
    
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
