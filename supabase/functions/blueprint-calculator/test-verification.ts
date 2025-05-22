
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { calculatePlanetaryPositionsWithSweph } from "./ephemeris-sweph.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Check WASM storage and environment setup
async function checkEnvironmentSetup() {
  const results = {
    wasm_source: Deno.env.get("WASM_SOURCE") || "undefined",
    project_id: Deno.env.get("SUPABASE_PROJECT") || "undefined",
    wasm_bucket: Deno.env.get("WASM_BUCKET") || "undefined",
    wasm_object_path: Deno.env.get("WASM_OBJECT_PATH") || "undefined",
    storage_url: `https://${Deno.env.get("SUPABASE_PROJECT") || "qxaajirrqrcnmvtowjbg"}.supabase.co/storage/v1/object/public/${Deno.env.get("WASM_BUCKET") || "wasm"}/${Deno.env.get("WASM_OBJECT_PATH") || "astro.wasm"}`,
  };

  // Test WASM URL accessibility
  try {
    const wasmUrl = results.storage_url;
    console.log(`Testing WASM URL: ${wasmUrl}`);
    
    const response = await fetch(wasmUrl, { method: 'HEAD' });
    
    results["storage_url_accessible"] = response.ok;
    results["storage_url_status"] = response.status;
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      const cacheControl = response.headers.get('cache-control');
      
      results["content_type"] = contentType;
      results["file_size_bytes"] = contentLength ? parseInt(contentLength) : 0;
      results["file_size_kb"] = contentLength ? Math.round(parseInt(contentLength) / 1024) : 0;
      results["cache_control"] = cacheControl || 'not set';
      
      // Check if file size is in the expected range for Emscripten build
      if (contentLength) {
        const sizeKB = Math.round(parseInt(contentLength) / 1024);
        results["correct_build"] = sizeKB >= 630 && sizeKB <= 650;
      }
    }
    
    return results;
  } catch (error) {
    results["error"] = error.message;
    return results;
  }
}

// Known test cases with their expected outputs
const testCases = [
  {
    input: {
      date: "1987-05-17",
      time: "14:20",
      location: "New York, NY",
      timezone: "America/New_York",
      fullName: "John Smith"
    },
    expected: {
      sunSign: "Taurus",
      moonSign: "Libra"
    }
  },
  {
    input: {
      date: "1990-03-21",
      time: "12:00",
      location: "London, UK",
      timezone: "Europe/London",
      fullName: "Emma Watson"
    },
    expected: {
      sunSign: "Aries",
      moonSign: "Cancer"
    }
  },
  {
    input: {
      date: "2000-01-01",
      time: "00:01",
      location: "Tokyo, Japan",
      timezone: "Asia/Tokyo",
      fullName: "Tester User"
    },
    expected: {
      sunSign: "Capricorn"
    }
  }
];

// Swiss Ephemeris initialization status
let wasmInitialized = false;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Running Swiss Ephemeris verification tests");
    
    // Check environment setup and WASM accessibility first
    const envStatus = await checkEnvironmentSetup();
    console.log("Environment status:", envStatus);
    
    const startTime = Date.now();
    let results = [];
    let allPassed = true;
    let wasWarmBootUsed = false;
    let engineUsed = 'unknown';

    // Run each test case
    for (const testCase of testCases) {
      const testStart = Date.now();
      let testResult = {
        input: testCase.input,
        expected: testCase.expected,
        actual: {},
        passed: false,
        errors: []
      };

      try {
        // Calculate planetary positions with Swiss Ephemeris
        const celestialData = await calculatePlanetaryPositionsWithSweph(
          testCase.input.date,
          testCase.input.time,
          testCase.input.location,
          testCase.input.timezone
        );
        
        engineUsed = celestialData.source || 'swiss_ephemeris';

        // The second time we reuse the warm instance
        if (wasmInitialized) {
          wasWarmBootUsed = true;
        } else {
          wasmInitialized = true;
        }

        // Extract sun and moon signs
        const sunLongitude = celestialData.sun?.longitude || 0;
        const moonLongitude = celestialData.moon?.longitude || 0;
        
        // Calculate zodiac signs
        const sunSign = getZodiacSign(sunLongitude);
        const moonSign = getZodiacSign(moonLongitude);
        
        const actual = {
          sunSign,
          moonSign,
          ascendant: getZodiacSign(celestialData.ascendant?.longitude || 0),
          calculationTime: Date.now() - testStart,
          source: celestialData.source
        };

        testResult.actual = actual;
        
        // Check if sun sign matches expected
        let sunSignPassed = true;
        let moonSignPassed = true;
        
        if (testCase.expected.sunSign) {
          sunSignPassed = actual.sunSign === testCase.expected.sunSign;
        }
        
        if (testCase.expected.moonSign) {
          moonSignPassed = actual.moonSign === testCase.expected.moonSign;
        }
        
        testResult.passed = sunSignPassed && moonSignPassed;
        
        if (!testResult.passed) {
          if (!sunSignPassed) testResult.errors.push("Sun sign mismatch");
          if (!moonSignPassed) testResult.errors.push("Moon sign mismatch");
          allPassed = false;
        }
      } catch (error) {
        testResult.errors.push(`Test execution error: ${error.message}`);
        testResult.passed = false;
        allPassed = false;
      }
      
      results.push(testResult);
    }

    // Return test summary with enhanced diagnostic info
    return new Response(
      JSON.stringify({
        system_info: {
          deno_version: Deno.version,
          runtime: Deno.build,
          env_config: envStatus,
          memory_usage: {
            rss: Deno.memoryUsage().rss,
            heapTotal: Deno.memoryUsage().heapTotal,
            heapUsed: Deno.memoryUsage().heapUsed,
          }
        },
        test_summary: {
          all_passed: allPassed,
          total_tests: testCases.length,
          passed_tests: results.filter(r => r.passed).length,
          failed_tests: results.filter(r => !r.passed).length,
          total_duration_ms: Date.now() - startTime,
          warm_boot_used: wasWarmBootUsed,
          wasm_initialized: wasmInitialized,
          engine_used: engineUsed
        },
        test_results: results
      }, null, 2),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Test execution failed',
        details: error.message,
        stack: error.stack
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

// Helper function to get zodiac sign based on longitude
function getZodiacSign(longitude) {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 
    'Leo', 'Virgo', 'Libra', 'Scorpio', 
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  const signIndex = Math.floor(longitude / 30) % 12;
  return signs[signIndex];
}
