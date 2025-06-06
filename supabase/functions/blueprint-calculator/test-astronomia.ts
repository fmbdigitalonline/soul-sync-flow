
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
    console.log('=== ASTRONOMIA LIBRARY TEST ===');
    
    let responseMessage = `=== ASTRONOMIA LIBRARY TEST ===\n`;

    // Import astronomia
    const astronomia = await import('npm:astronomia@4.1.1');
    console.log('Astronomia imported successfully');
    
    const exports = Object.keys(astronomia).sort();
    responseMessage += `✅ Astronomia loaded: ${exports.length} exports available\n`;
    responseMessage += `Available modules: ${exports.join(', ')}\n\n`;

    // Test dates - your problematic ones
    const testDates = [
      { name: 'Problematic Date 1', date: new Date('2024-11-15T06:23:00.000Z') },
      { name: 'Problematic Date 2', date: new Date('1977-11-15T06:23:00.000Z') },
      { name: 'Standard Date 1', date: new Date('1990-06-15T12:00:00.000Z') },
      { name: 'Standard Date 2', date: new Date('2000-01-01T00:00:00.000Z') }
    ];

    responseMessage += `=== TESTING CORE ASTRONOMICAL FUNCTIONS ===\n`;

    for (const testCase of testDates) {
      responseMessage += `\n--- ${testCase.name}: ${testCase.date.toISOString()} ---\n`;
      
      try {
        // Test Julian Day calculation
        if (astronomia.julian && typeof astronomia.julian.CalendarGregorianToJD === 'function') {
          const jd = astronomia.julian.CalendarGregorianToJD(
            testCase.date.getUTCFullYear(),
            testCase.date.getUTCMonth() + 1,
            testCase.date.getUTCDate() + 
            (testCase.date.getUTCHours() + testCase.date.getUTCMinutes()/60 + testCase.date.getUTCSeconds()/3600) / 24
          );
          responseMessage += `  Julian Day: ${jd}\n`;
        } else {
          responseMessage += `  Julian Day: Function not available\n`;
        }

        // Test planetary positions
        const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
        
        for (const planet of planets) {
          try {
            // Try different ways astronomia might calculate planetary positions
            if (astronomia.planetposition && astronomia.planetposition[planet]) {
              const pos = astronomia.planetposition[planet](jd);
              responseMessage += `  ${planet}: ${JSON.stringify(pos).slice(0, 80)}...\n`;
            } else if (astronomia[planet]) {
              const pos = astronomia[planet](jd);
              responseMessage += `  ${planet}: ${JSON.stringify(pos).slice(0, 80)}...\n`;
            } else {
              responseMessage += `  ${planet}: No calculation function found\n`;
            }
          } catch (e) {
            responseMessage += `  ${planet}: ERROR - ${e.message}\n`;
          }
        }

        // Test lunar nodes if available
        try {
          if (astronomia.moonnode) {
            const nodes = astronomia.moonnode(jd);
            responseMessage += `  Lunar Nodes: ${JSON.stringify(nodes).slice(0, 80)}...\n`;
          } else {
            responseMessage += `  Lunar Nodes: Function not available\n`;
          }
        } catch (e) {
          responseMessage += `  Lunar Nodes: ERROR - ${e.message}\n`;
        }

        // Test obliquity if available
        try {
          if (astronomia.nutation && astronomia.nutation.meanObliquity) {
            const obliquity = astronomia.nutation.meanObliquity(jd);
            responseMessage += `  Obliquity: ${obliquity}\n`;
          } else {
            responseMessage += `  Obliquity: Function not available\n`;
          }
        } catch (e) {
          responseMessage += `  Obliquity: ERROR - ${e.message}\n`;
        }

      } catch (e) {
        responseMessage += `  CRITICAL ERROR for ${testCase.name}: ${e.message}\n`;
        console.error(`Error testing ${testCase.name}:`, e);
      }
    }

    // List available sub-modules for reference
    responseMessage += `\n=== AVAILABLE ASTRONOMIA MODULES ===\n`;
    for (const exportName of exports.slice(0, 20)) {
      try {
        const module = astronomia[exportName];
        if (typeof module === 'object' && module !== null) {
          const subExports = Object.keys(module);
          responseMessage += `${exportName}: ${subExports.slice(0, 5).join(', ')}${subExports.length > 5 ? '...' : ''}\n`;
        } else {
          responseMessage += `${exportName}: ${typeof module}\n`;
        }
      } catch (e) {
        responseMessage += `${exportName}: Error accessing - ${e.message}\n`;
      }
    }

    responseMessage += `\n=== TEST COMPLETED ===\n`;
    responseMessage += `Environment: Deno ${Deno.version.deno}\n`;
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

// Export for direct serving and for import by main router
export default testAstronomia;

// Also support direct serving if this file is run independently
if (import.meta.main) {
  serve(testAstronomia);
}
