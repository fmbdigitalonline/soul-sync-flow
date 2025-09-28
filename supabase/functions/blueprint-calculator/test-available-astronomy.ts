
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function testAvailableAstronomy(req) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== COMPREHENSIVE ASTRONOMY LIBRARY AVAILABILITY TEST ===');
    
    let responseMessage = `=== COMPREHENSIVE ASTRONOMY LIBRARY AVAILABILITY TEST ===\n`;
    let status = 200;

    // Test 1: Try different CDN sources for astronomy libraries
    const cdnSources = [
      // ESM.sh alternatives
      { name: 'astronomy-engine via skypack', url: 'https://cdn.skypack.dev/astronomy-engine@2' },
      { name: 'astronomy-engine via jsdelivr', url: 'https://cdn.jsdelivr.net/npm/astronomy-engine@2/+esm' },
      { name: 'astronomy-engine via unpkg', url: 'https://unpkg.com/astronomy-engine@2/astronomy.js' },
      
      // Direct Deno libraries
      { name: 'sun-calc from deno.land', url: 'https://deno.land/x/sun_calc@v1.0.0/mod.ts' },
      { name: 'astro-calc from deno.land', url: 'https://deno.land/x/astro_calc@v1.0.0/mod.ts' },
      
      // Alternative astronomy packages
      { name: 'astronomia via skypack', url: 'https://cdn.skypack.dev/astronomia@4' },
      { name: 'meeus via skypack', url: 'https://cdn.skypack.dev/meeus@1' },
      { name: 'vsop87 via skypack', url: 'https://cdn.skypack.dev/vsop87@1' },
      
      // Simple astronomy utilities
      { name: 'julian-date via skypack', url: 'https://cdn.skypack.dev/julian-date@1' },
      { name: 'sun-position via skypack', url: 'https://cdn.skypack.dev/sun-position@1' },
    ];

    responseMessage += `=== TESTING CDN SOURCES ===\n`;
    const workingLibraries = [];

    for (const source of cdnSources) {
      try {
        console.log(`Testing ${source.name}...`);
        const lib = await import(source.url);
        const exports = Object.keys(lib).sort();
        responseMessage += `✅ ${source.name}: SUCCESS (${exports.length} exports)\n`;
        responseMessage += `   Exports: ${exports.slice(0, 10).join(', ')}${exports.length > 10 ? '...' : ''}\n`;
        
        workingLibraries.push({
          name: source.name,
          url: source.url,
          exports: exports,
          lib: lib
        });
        
        console.log(`${source.name} exports:`, exports.slice(0, 5));
      } catch (e) {
        responseMessage += `❌ ${source.name}: FAILED - ${e.message}\n`;
        console.log(`${source.name} failed:`, e.message);
      }
    }

    // Test 2: Try importing Luxon (which we know works) for date handling
    responseMessage += `\n=== TESTING KNOWN WORKING LIBRARIES ===\n`;
    try {
      const luxon = await import('luxon');
      responseMessage += `✅ Luxon: Available for date/time handling\n`;
      
      // Test basic date functionality
      const testDate = luxon.DateTime.fromISO('2024-11-15T06:23:00.000Z');
      responseMessage += `   Julian Day conversion: ${testDate.toJulianDay()}\n`;
      
    } catch (e) {
      responseMessage += `❌ Luxon test failed: ${e.message}\n`;
    }

    // Test 3: Test any working astronomy libraries with basic functionality
    if (workingLibraries.length > 0) {
      responseMessage += `\n=== FUNCTIONAL TESTING OF WORKING LIBRARIES ===\n`;
      
      const testDate = new Date('2024-11-15T06:23:00.000Z');
      
      for (const workingLib of workingLibraries) {
        try {
          responseMessage += `\nTesting ${workingLib.name} functionality:\n`;
          
          // Check for common astronomy functions
          const commonFunctions = [
            'julianDay', 'julianDate', 'jd', 'julian',
            'sunPosition', 'moonPosition', 'planetPosition',
            'eclipticLongitude', 'longitude', 'lat', 'lng',
            'calculate', 'compute', 'getPosition'
          ];
          
          const availableFunctions = commonFunctions.filter(func => 
            typeof workingLib.lib[func] === 'function'
          );
          
          if (availableFunctions.length > 0) {
            responseMessage += `   Available functions: ${availableFunctions.join(', ')}\n`;
            
            // Try to call a basic function if available
            for (const func of availableFunctions.slice(0, 2)) {
              try {
                const result = workingLib.lib[func](testDate);
                responseMessage += `   ${func}(testDate): ${JSON.stringify(result).slice(0, 100)}\n`;
              } catch (e) {
                responseMessage += `   ${func}(testDate): Error - ${e.message}\n`;
              }
            }
          } else {
            responseMessage += `   No recognizable astronomy functions found\n`;
          }
          
        } catch (e) {
          responseMessage += `   Functional test failed: ${e.message}\n`;
        }
      }
    }

    // Test 4: Check what's available from our import_map.json
    responseMessage += `\n=== TESTING IMPORT MAP LIBRARIES ===\n`;
    const importMapLibs = ['astronomia', 'astronomy-engine', 'luxon'];
    
    for (const libName of importMapLibs) {
      try {
        console.log(`Testing import map library: ${libName}`);
        let lib;
        
        if (libName === 'astronomia') {
          lib = await import('astronomia');
        } else if (libName === 'astronomy-engine') {
          lib = await import('astronomy-engine');
        } else if (libName === 'luxon') {
          lib = await import('luxon');
        }
        
        const exports = Object.keys(lib).sort();
        responseMessage += `✅ ${libName} (npm): Available (${exports.length} exports)\n`;
        responseMessage += `   Key exports: ${exports.slice(0, 15).join(', ')}\n`;
        
      } catch (e) {
        responseMessage += `❌ ${libName} (npm): ${e.message}\n`;
      }
    }

    // Summary and recommendations
    responseMessage += `\n=== SUMMARY & RECOMMENDATIONS ===\n`;
    if (workingLibraries.length > 0) {
      responseMessage += `Found ${workingLibraries.length} working astronomy libraries:\n`;
      workingLibraries.forEach(lib => {
        responseMessage += `- ${lib.name} (${lib.exports.length} exports)\n`;
      });
      responseMessage += `\nNext steps: Test the most promising library for your specific requirements\n`;
    } else {
      responseMessage += `No external astronomy libraries found working via CDN.\n`;
      responseMessage += `Recommendation: Consider using a minimal manual implementation or astronomia npm package.\n`;
    }
    
    responseMessage += `\nEnvironment: Deno ${Deno.version.deno}\n`;
    responseMessage += `Test completed at: ${new Date().toISOString()}\n`;
    
    return new Response(responseMessage, { 
      status: status, 
      headers: { 
        "Content-Type": "text/plain; charset=utf-8",
        ...corsHeaders 
      } 
    });
    
  } catch (error) {
    console.error("Unexpected error in astronomy availability test:", error);
    
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
export default testAvailableAstronomy;

// Also support direct serving if this file is run independently
if (import.meta.main) {
  serve(testAvailableAstronomy);
}
