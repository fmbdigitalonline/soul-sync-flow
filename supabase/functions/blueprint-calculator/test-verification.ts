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
    const wasmPath = path.join(path.dirname(path.fromFileUrl(import.meta.url)), "../_shared/sweph/astro.wasm");
    const stat = await Deno.stat(wasmPath);
    return {
      exists: true,
      size: stat.size,
      path: wasmPath
    };
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
      date: "1978-02-12",
      time: "22:00",
      location: "Paramaribo, Surinam",
      timezone: "America/Paramaribo",
      fullName: "Nikola Tesla"
    },
    expected: {
      humanDesign: {
        type: "Generator",
        profile: "5/1"
      },
      chineseZodiac: {
        animal: "Horse"
      },
      numerology: {
        lifePath: 33
      }
    }
  },
  {
    input: {
      date: "1956-01-03",
      time: "06:15",
      location: "Seattle, WA",
      timezone: "America/Los_Angeles",
      fullName: "Marie Johnson"
    },
    expected: {
      humanDesign: {
        type: "Projector",
        profile: "1/3"
      },
      chineseZodiac: {
        animal: "Goat"
      },
      numerology: {
        lifePath: 6
      }
    }
  },
  {
    input: {
      date: "1987-11-22",
      time: "13:45",
      location: "London, UK",
      timezone: "Europe/London",
      fullName: "Alexander Smith"
    },
    expected: {
      humanDesign: {
        type: "Manifestor",
        profile: "4/6"
      },
      chineseZodiac: {
        animal: "Rabbit"
      },
      numerology: {
        lifePath: 11
      }
    }
  },
  {
    input: {
      date: "1990-05-09",
      time: "10:30",
      location: "Tokyo, Japan",
      timezone: "Asia/Tokyo",
      fullName: "Yuki Tanaka"
    },
    expected: {
      humanDesign: {
        type: "Manifesting Generator",
        profile: "3/5"
      },
      chineseZodiac: {
        animal: "Horse"
      },
      numerology: {
        lifePath: 6
      }
    }
  },
  {
    input: {
      date: "1982-12-25",
      time: "00:01",
      location: "Sydney, Australia",
      timezone: "Australia/Sydney",
      fullName: "Emma Williams"
    },
    expected: {
      humanDesign: {
        type: "Reflector",
        profile: "2/4"
      },
      chineseZodiac: {
        animal: "Dog"
      },
      numerology: {
        lifePath: 2
      }
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

        // Extract actual values to compare with expected
        // (This is a simplified example, you'd need to implement the real extraction)
        const actual = {
          humanDesign: {
            type: extractHumanDesignType(celestialData),
            profile: extractHumanDesignProfile(celestialData)
          },
          chineseZodiac: {
            animal: extractChineseZodiac(testCase.input.date)
          },
          numerology: {
            lifePath: extractLifePathNumber(testCase.input.date, testCase.input.fullName)
          }
        };

        testResult.actual = actual;
        
        // Check if values match expected
        const hdTypePassed = actual.humanDesign.type === testCase.expected.humanDesign.type;
        const hdProfilePassed = actual.humanDesign.profile === testCase.expected.humanDesign.profile;
        const chinesePassed = actual.chineseZodiac.animal === testCase.expected.chineseZodiac.animal;
        const numerologyPassed = actual.numerology.lifePath === testCase.expected.numerology.lifePath;
        
        testResult.passed = hdTypePassed && hdProfilePassed && chinesePassed && numerologyPassed;
        
        if (!testResult.passed) {
          if (!hdTypePassed) testResult.errors.push("Human Design Type mismatch");
          if (!hdProfilePassed) testResult.errors.push("Human Design Profile mismatch");
          if (!chinesePassed) testResult.errors.push("Chinese Zodiac mismatch");
          if (!numerologyPassed) testResult.errors.push("Numerology Life Path mismatch");
          allPassed = false;
        }
        
        testResult.duration = Date.now() - testStart;
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
          cwd: Deno.cwd(),
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

// Helper functions for extracting values from calculation results
function extractHumanDesignType(celestialData) {
  // In a real implementation, this would extract the Human Design type from celestialData
  // This is a placeholder that would need real implementation based on your calculation methods
  return "Generator"; // Placeholder - replace with actual extraction logic
}

function extractHumanDesignProfile(celestialData) {
  // In a real implementation, this would extract the Human Design profile from celestialData
  // This is a placeholder that would need real implementation based on your calculation methods
  return "5/1"; // Placeholder - replace with actual extraction logic
}

function extractChineseZodiac(birthDate) {
  // In a real implementation, this would calculate the Chinese zodiac animal from birthDate
  // This is a placeholder that would need real implementation based on your calculation methods
  const date = new Date(birthDate);
  const year = date.getFullYear();
  
  // Simple Chinese zodiac calculation based on year
  const animals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
  const idx = (year - 4) % 12;
  return animals[idx];
}

function extractLifePathNumber(birthDate, fullName) {
  // In a real implementation, this would calculate the life path number from birthDate and fullName
  // This is a placeholder that would need real implementation based on your calculation methods
  const date = new Date(birthDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  // Simple placeholder calculation 
  return reduceToSingleDigit(day + month + year);
}

function reduceToSingleDigit(num) {
  // Keep master numbers 11, 22, 33
  if (num === 11 || num === 22 || num === 33) {
    return num;
  }
  
  // Reduce to single digit
  while (num > 9) {
    num = [...String(num)].reduce((sum, digit) => sum + parseInt(digit), 0);
    if (num === 11 || num === 22 || num === 33) {
      return num;
    }
  }
  
  return num;
}
