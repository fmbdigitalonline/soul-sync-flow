
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { calculatePlanetaryPositionsWithSweph } from "./ephemeris-sweph.ts";
import * as path from "https://deno.land/std@0.168.0/path/mod.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Check if WASM file is accessible
async function checkWasmFile() {
  try {
    const wasmUrl = new URL("../_shared/sweph/astro.wasm", import.meta.url);
    console.log(`Checking WASM file at: ${wasmUrl}`);
    
    try {
      const stat = await Deno.stat(wasmUrl);
      return {
        exists: true,
        size: stat.size,
        path: wasmUrl.pathname
      };
    } catch (error) {
      console.warn(`Error accessing WASM file: ${error.message}`);
      // Try fallback to CDN
      const response = await fetch("https://cdn.jsdelivr.net/gh/u-blusky/sweph-wasm@0.11.3/js/astro.wasm", { method: 'HEAD' });
      return {
        exists: response.ok,
        size: response.headers.get('content-length') ? parseInt(response.headers.get('content-length')!) : 0,
        path: 'CDN fallback',
        cdn_fallback: true
      };
    }
  } catch (error) {
    return {
      exists: false,
      error: error.message
    };
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
    
    // Check WASM file availability first
    const wasmStatus = await checkWasmFile();
    console.log("WASM file status:", wasmStatus);
    
    const startTime = Date.now();
    let results = [];
    let allPassed = true;
    let wasWarmBootUsed = false;

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
          calculationTime: Date.now() - testStart
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
          wasm_status: wasmStatus,
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
          wasm_initialized: wasmInitialized
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
