
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function testAstronomia(req) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== ASTRONOMIA PROPER API TEST ===');
    
    let responseMessage = `=== ASTRONOMIA PROPER API TEST ===\n`;

    // Import astronomia
    const astronomia = await import('npm:astronomia@4.1.1');
    console.log('Astronomia imported successfully');
    
    responseMessage += `✅ Astronomia loaded successfully\n\n`;

    // Test dates - your problematic ones plus standard ones
    const testDates = [
      { name: 'Problematic Date 1', date: new Date('2024-11-15T06:23:00.000Z') },
      { name: 'Problematic Date 2', date: new Date('1977-11-15T06:23:00.000Z') },
      { name: 'Standard Date 1', date: new Date('1990-06-15T12:00:00.000Z') },
      { name: 'Standard Date 2', date: new Date('2000-01-01T00:00:00.000Z') }
    ];

    for (const testCase of testDates) {
      responseMessage += `\n--- ${testCase.name}: ${testCase.date.toISOString()} ---\n`;
      
      try {
        // Calculate Julian Day using astronomia's julian module
        let jd;
        try {
          if (astronomia.julian && astronomia.julian.CalendarGregorianToJD) {
            jd = astronomia.julian.CalendarGregorianToJD(
              testCase.date.getUTCFullYear(),
              testCase.date.getUTCMonth() + 1,
              testCase.date.getUTCDate() + 
              (testCase.date.getUTCHours() + testCase.date.getUTCMinutes()/60 + testCase.date.getUTCSeconds()/3600) / 24
            );
            responseMessage += `  Julian Day: ${jd}\n`;
          } else {
            throw new Error("Julian conversion function not found");
          }
        } catch (e) {
          responseMessage += `  Julian Day calculation: ERROR - ${e.message}\n`;
          continue;
        }

        // Test Sun position using solar module
        try {
          if (astronomia.solar && astronomia.solar.apparentEquatorialVSOP87) {
            const sunPos = astronomia.solar.apparentEquatorialVSOP87(jd);
            responseMessage += `  Sun Position: RA=${sunPos.ra}°, Dec=${sunPos.dec}°\n`;
          } else if (astronomia.solar && astronomia.solar.apparentLongitude) {
            const sunLon = astronomia.solar.apparentLongitude(jd);
            responseMessage += `  Sun Longitude: ${sunLon}°\n`;
          } else {
            responseMessage += `  Sun: No usable function found in solar module\n`;
          }
        } catch (e) {
          responseMessage += `  Sun: ERROR - ${e.message}\n`;
        }

        // Test Moon position using moonposition module  
        try {
          if (astronomia.moonposition && astronomia.moonposition.position) {
            const moonPos = astronomia.moonposition.position(jd);
            responseMessage += `  Moon Position: ${JSON.stringify(moonPos).slice(0, 80)}...\n`;
          } else {
            responseMessage += `  Moon: No position function found in moonposition module\n`;
          }
        } catch (e) {
          responseMessage += `  Moon: ERROR - ${e.message}\n`;
        }

        // Test True Lunar Node using moonnode module
        try {
          if (astronomia.moonnode && astronomia.moonnode.node) {
            const node = astronomia.moonnode.node(jd);
            responseMessage += `  Lunar Node: ${JSON.stringify(node).slice(0, 60)}...\n`;
          } else if (astronomia.moonnode && astronomia.moonnode.meanNode) {
            const meanNode = astronomia.moonnode.meanNode(jd);
            responseMessage += `  Mean Lunar Node: ${meanNode}°\n`;
          } else {
            responseMessage += `  Lunar Node: No node function found in moonnode module\n`;
          }
        } catch (e) {
          responseMessage += `  Lunar Node: ERROR - ${e.message}\n`;
        }

        // Test planets using planetposition module
        const planets = ['mercury', 'venus', 'mars', 'jupiter', 'saturn'];
        for (const planet of planets) {
          try {
            if (astronomia.planetposition && astronomia.planetposition[planet]) {
              const planetPos = astronomia.planetposition[planet](jd);
              responseMessage += `  ${planet}: ${JSON.stringify(planetPos).slice(0, 60)}...\n`;
            } else {
              responseMessage += `  ${planet}: No function found in planetposition module\n`;
            }
          } catch (e) {
            responseMessage += `  ${planet}: ERROR - ${e.message}\n`;
          }
        }

        // Test obliquity using nutation module
        try {
          if (astronomia.nutation && astronomia.nutation.meanObliquity) {
            const meanObl = astronomia.nutation.meanObliquity(jd);
            responseMessage += `  Mean Obliquity: ${meanObl}°\n`;
            
            if (astronomia.nutation.nutation) {
              const nutValues = astronomia.nutation.nutation(jd);
              responseMessage += `  Nutation: ${JSON.stringify(nutValues).slice(0, 60)}...\n`;
            }
          } else {
            responseMessage += `  Obliquity: No meanObliquity function found in nutation module\n`;
          }
        } catch (e) {
          responseMessage += `  Obliquity: ERROR - ${e.message}\n`;
        }

      } catch (e) {
        responseMessage += `  CRITICAL ERROR for ${testCase.name}: ${e.message}\n`;
        console.error(`Error testing ${testCase.name}:`, e);
      }
    }

    // Explore module structure for debugging
    responseMessage += `\n=== MODULE STRUCTURE ANALYSIS ===\n`;
    const moduleNames = ['julian', 'solar', 'moonposition', 'moonnode', 'nutation', 'planetposition'];
    
    for (const moduleName of moduleNames) {
      try {
        const module = astronomia[moduleName];
        if (module && typeof module === 'object') {
          const functions = Object.keys(module).filter(key => typeof module[key] === 'function');
          responseMessage += `${moduleName}: ${functions.join(', ')}\n`;
        } else {
          responseMessage += `${moduleName}: Not found or not an object\n`;
        }
      } catch (e) {
        responseMessage += `${moduleName}: Error accessing - ${e.message}\n`;
      }
    }

    responseMessage += `\n=== TEST COMPLETED ===\n`;
    responseMessage += `Test completed at: ${new Date().toISOString()}\n`;

    return new Response(responseMessage, { 
      status: 200, 
      headers: { 
        "Content-Type": "text/plain; charset=utf-8",
        ...corsHeaders 
      } 
    });
    
  } catch (error) {
    console.error("Critical error in astronomia test:", error);
    
    return new Response(
      `CRITICAL ERROR: ${error.message}\nStack: ${error.stack}`,
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

export default testAstronomia;

if (import.meta.main) {
  serve(testAstronomia);
}
