
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as Astronomy from 'https://esm.sh/astronomy-engine@2.1.19';

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
    console.log('=== ESM.SH IMPORT TEST - COMPLETE EXPORT ANALYSIS ===');
    
    // Get ALL exports from the Astronomy module using esm.sh
    const allExports = Object.keys(Astronomy).sort();
    console.log(`Total exports found with esm.sh: ${allExports.length}`);
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
    
    let responseMessage = `=== ESM.SH IMPORT TEST - COMPLETE EXPORT ANALYSIS ===\n`;
    responseMessage += `Total exports found with esm.sh: ${allExports.length}\n`;
    responseMessage += `All exports: ${allExports.join(', ')}\n\n`;
    
    responseMessage += `=== CRITICAL FUNCTION AVAILABILITY (ESM.SH) ===\n`;
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
    responseMessage += `Functions containing 'julian', 'jd', or 'date': ${julianFunctions.join(', ')}\n`;
    
    // Look for lunar node functions
    const lunarNodeFunctions = allExports.filter(name => 
      name.toLowerCase().includes('node') || 
      name.toLowerCase().includes('lunar')
    );
    responseMessage += `Functions containing 'node' or 'lunar': ${lunarNodeFunctions.join(', ')}\n\n`;
    
    // Use the specific date from the error logs that was causing issues
    const year = 2024, month = 11, day = 15, hour = 6, minute = 23;
    const dateObj = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
    
    responseMessage += `=== ASTROTIME CREATION TEST (ESM.SH) ===\n`;
    responseMessage += `Test date: ${dateObj.toISOString()}\n`;
    
    let status = 200;

    try {
      console.log("Creating AstroTime using MakeTime with esm.sh...");
      const astroTime = Astronomy.MakeTime(dateObj);
      
      if (!astroTime || typeof astroTime.tt !== 'number' || isNaN(astroTime.tt)) {
        responseMessage += `ERROR: astroTime is invalid. TT: ${astroTime ? astroTime.tt : 'undefined'}\n`;
        responseMessage += `Full object: ${JSON.stringify(astroTime)}\n`;
        status = 500;
      } else {
        responseMessage += `SUCCESS: astroTime created with esm.sh. TT: ${astroTime.tt}\n`;
        responseMessage += `Full object: ${JSON.stringify(astroTime)}\n`;
        
        responseMessage += `\n=== FUNCTION TESTING WITH ESM.SH ===\n`;
        
        // Test TrueObliquity (this was undefined with npm:)
        if (typeof Astronomy.TrueObliquity === 'function') {
          try {
            const obliquity = Astronomy.TrueObliquity(astroTime);
            responseMessage += `✅ TrueObliquity: ${obliquity}°\n`;
          } catch (e) {
            responseMessage += `❌ TrueObliquity failed: ${e.toString()}\n`;
          }
        } else {
          responseMessage += `❌ TrueObliquity: still undefined with esm.sh\n`;
        }
        
        // Test DateToJulian (this was undefined with npm:)
        if (typeof Astronomy.DateToJulian === 'function') {
          try {
            const jd = Astronomy.DateToJulian(dateObj);
            responseMessage += `✅ DateToJulian: ${jd}\n`;
          } catch (e) {
            responseMessage += `❌ DateToJulian failed: ${e.toString()}\n`;
          }
        } else {
          responseMessage += `❌ DateToJulian: still undefined with esm.sh\n`;
        }
        
        // Test TrueLunarNodes (this was undefined with npm:)
        if (typeof Astronomy.TrueLunarNodes === 'function') {
          try {
            const nodes = Astronomy.TrueLunarNodes(astroTime);
            responseMessage += `✅ TrueLunarNodes: ascending=${nodes.ascending_node}°, descending=${nodes.descending_node}°\n`;
          } catch (e) {
            responseMessage += `❌ TrueLunarNodes failed: ${e.toString()}\n`;
          }
        } else {
          responseMessage += `❌ TrueLunarNodes: still undefined with esm.sh\n`;
        }
        
        // Test EclipticLongitude (this worked with npm:)
        if (typeof Astronomy.EclipticLongitude === 'function') {
          try {
            const moonLon = Astronomy.EclipticLongitude("Moon", astroTime);
            responseMessage += `✅ EclipticLongitude("Moon"): ${moonLon}°\n`;
          } catch (e) {
            responseMessage += `❌ EclipticLongitude("Moon") failed: ${e.toString()}\n`;
          }
        }
        
        // Test Ecliptic (this failed with npm:)
        if (typeof Astronomy.Ecliptic === 'function') {
          try {
            const ecl = Astronomy.Ecliptic("Moon", astroTime);
            responseMessage += `✅ Ecliptic("Moon"): lon=${ecl.elon}°, lat=${ecl.elat}°\n`;
          } catch (e) {
            responseMessage += `❌ Ecliptic("Moon") still fails with esm.sh: ${e.toString()}\n`;
          }
        }
        
        // Test GeoVector (this failed with npm:)
        if (typeof Astronomy.GeoVector === 'function') {
          try {
            const geoMoon = Astronomy.GeoVector("Moon", astroTime);
            responseMessage += `✅ GeoVector("Moon"): x=${geoMoon.x}, y=${geoMoon.y}, z=${geoMoon.z}\n`;
          } catch (e) {
            responseMessage += `❌ GeoVector("Moon") still fails with esm.sh: ${e.toString()}\n`;
          }
        }
        
        // Test HelioVector (this worked with npm:)
        if (typeof Astronomy.HelioVector === 'function') {
          try {
            const earthVec = Astronomy.HelioVector("Earth", astroTime);
            const lonRad = Math.atan2(earthVec.y, earthVec.x);
            const longitude = (lonRad * 180/Math.PI + 180 + 360) % 360;
            responseMessage += `✅ HelioVector("Earth") -> Sun longitude: ${longitude.toFixed(6)}°\n`;
          } catch (e) {
            responseMessage += `❌ HelioVector("Earth") failed with esm.sh: ${e.toString()}\n`;
          }
        }
        
        // Test other planets with both Ecliptic and EclipticLongitude
        const testPlanets = ["Mercury", "Venus", "Mars"];
        testPlanets.forEach(planet => {
          // Test Ecliptic
          if (typeof Astronomy.Ecliptic === 'function') {
            try {
              const ecl = Astronomy.Ecliptic(planet, astroTime);
              responseMessage += `✅ Ecliptic("${planet}"): lon=${ecl.elon.toFixed(6)}°, lat=${ecl.elat.toFixed(6)}°\n`;
            } catch (e) {
              responseMessage += `❌ Ecliptic("${planet}") still fails with esm.sh: ${e.toString()}\n`;
            }
          }
          
          // Test EclipticLongitude as fallback
          if (typeof Astronomy.EclipticLongitude === 'function') {
            try {
              const lon = Astronomy.EclipticLongitude(planet, astroTime);
              responseMessage += `✅ EclipticLongitude("${planet}"): ${lon.toFixed(6)}°\n`;
            } catch (e) {
              responseMessage += `❌ EclipticLongitude("${planet}") failed with esm.sh: ${e.toString()}\n`;
            }
          }
        });
      }
    } catch (e) {
      responseMessage += `CRITICAL ERROR during AstroTime creation/testing with esm.sh: ${e.toString()}\n`;
      responseMessage += `Stack: ${e.stack}\n`;
      status = 500;
    }
    
    // Environment information
    responseMessage += `\n=== ENVIRONMENT INFO ===\n`;
    responseMessage += `Import method: esm.sh (https://esm.sh/astronomy-engine@2.1.19)\n`;
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
    console.error("Unexpected error in esm.sh import test:", error);
    
    return new Response(
      `Unexpected error with esm.sh import: ${error.message}\nStack: ${error.stack}`,
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
