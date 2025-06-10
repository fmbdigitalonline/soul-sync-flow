
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { calculateHumanDesign } from './human-design-calculator.ts';
import { calculatePlanetaryPositionsWithAstro } from './ephemeris-astroengine.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export default async function testHumanDesign(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== TESTING HUMAN DESIGN WITH YOUR BIRTH DATA ===");
    
    // Your specific birth data
    const birthDate = "1978-02-12";
    const birthTime = "22:00";
    const birthLocation = "Paramaribo, Suriname";
    const timezone = "America/Paramaribo";
    
    console.log("🔧 Testing with:", { birthDate, birthTime, birthLocation, timezone });
    
    // Step 1: Get celestial data for personality time
    console.log("🔧 Step 1: Starting personality celestial calculations...");
    
    let personalityCelestialData;
    try {
      personalityCelestialData = await calculatePlanetaryPositionsWithAstro(
        birthDate, 
        birthTime, 
        birthLocation, 
        timezone
      );
      console.log("✅ Personality celestial data calculated successfully");
      console.log("🔧 Sun position:", personalityCelestialData?.sun?.longitude);
      console.log("🔧 Moon position:", personalityCelestialData?.moon?.longitude);
      console.log("🔧 Total celestial objects:", Object.keys(personalityCelestialData || {}).length);
    } catch (celestialError) {
      console.error("❌ CRITICAL: Celestial calculation failed:", celestialError);
      console.error("❌ Error name:", celestialError.name);
      console.error("❌ Error message:", celestialError.message);
      console.error("❌ Error stack:", celestialError.stack);
      
      return new Response(JSON.stringify({
        success: false,
        error: {
          step: "celestial_calculation",
          name: celestialError.name,
          message: celestialError.message,
          stack: celestialError.stack,
          details: "Failed to calculate planetary positions"
        },
        test_failed: true,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        }
      });
    }
    
    if (!personalityCelestialData) {
      console.error("❌ CRITICAL: No celestial data returned");
      return new Response(JSON.stringify({
        success: false,
        error: {
          step: "celestial_data_validation",
          message: "No celestial data returned from calculation",
          details: "calculatePlanetaryPositionsWithAstro returned null/undefined"
        },
        test_failed: true
      }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        }
      });
    }
    
    console.log("🔧 Celestial data keys:", Object.keys(personalityCelestialData));
    
    // Validate essential celestial data
    if (!personalityCelestialData.sun || !personalityCelestialData.moon) {
      console.error("❌ CRITICAL: Missing essential celestial data");
      console.error("❌ Sun data:", personalityCelestialData.sun);
      console.error("❌ Moon data:", personalityCelestialData.moon);
      
      return new Response(JSON.stringify({
        success: false,
        error: {
          step: "essential_data_validation",
          message: "Missing essential sun or moon data",
          sun_available: !!personalityCelestialData.sun,
          moon_available: !!personalityCelestialData.moon,
          available_keys: Object.keys(personalityCelestialData)
        },
        test_failed: true
      }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        }
      });
    }
    
    // Step 2: Calculate Human Design
    console.log("🔧 Step 2: Starting Human Design calculation...");
    
    let humanDesignResult;
    try {
      humanDesignResult = await calculateHumanDesign(
        birthDate,
        birthTime, 
        birthLocation,
        timezone,
        personalityCelestialData
      );
      console.log("✅ Human Design calculation complete!");
    } catch (humanDesignError) {
      console.error("❌ CRITICAL: Human Design calculation failed:", humanDesignError);
      console.error("❌ HD Error name:", humanDesignError.name);
      console.error("❌ HD Error message:", humanDesignError.message);
      console.error("❌ HD Error stack:", humanDesignError.stack);
      
      return new Response(JSON.stringify({
        success: false,
        error: {
          step: "human_design_calculation",
          name: humanDesignError.name,
          message: humanDesignError.message,
          stack: humanDesignError.stack,
          details: "Failed to calculate Human Design",
          celestial_data_available: !!personalityCelestialData
        },
        test_failed: true
      }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        }
      });
    }
    
    if (!humanDesignResult) {
      console.error("❌ CRITICAL: No Human Design result returned");
      return new Response(JSON.stringify({
        success: false,
        error: {
          step: "human_design_validation",
          message: "No Human Design result returned",
          details: "calculateHumanDesign returned null/undefined"
        },
        test_failed: true
      }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        }
      });
    }
    
    // Step 3: Compare with expected results
    const expectedData = {
      type: "Projector",
      profile: "6/2 (Role Model/Hermit)",
      authority: "Splenic",
      strategy: "Wait for the invitation",
      definition: "Split",
      expectedGates: {
        unconscious_design: ["14.2","8.2","55.3","48.6","21.6","20.2","44.3","33.1","52.2","29.6","44.6","5.5","57.1"],
        conscious_personality: ["49.6","4.6","27.2","18.4","17.4","13.1","30.6","62.4","12.4","29.4","1.4","26.2","57.2"]
      }
    };
    
    // Analyze results
    const analysis = {
      type_match: humanDesignResult.type === expectedData.type,
      authority_match: humanDesignResult.authority === expectedData.authority,
      gate_count_personality: humanDesignResult.gates?.conscious_personality?.length || 0,
      gate_count_design: humanDesignResult.gates?.unconscious_design?.length || 0,
      expected_gate_count_personality: expectedData.expectedGates.conscious_personality.length,
      expected_gate_count_design: expectedData.expectedGates.unconscious_design.length,
      calculated_gates: humanDesignResult.gates,
      centers_defined: Object.entries(humanDesignResult.centers || {})
        .filter(([_, center]: [string, any]) => center.defined)
        .map(([name, _]: [string, any]) => name)
    };
    
    console.log("✅ Analysis complete - sending results");
    
    return new Response(JSON.stringify({
      success: true,
      test_data: {
        birthDate,
        birthTime,
        birthLocation,
        timezone
      },
      calculated_result: humanDesignResult,
      expected_result: expectedData,
      analysis: analysis,
      verdict: {
        overall_success: analysis.type_match && analysis.authority_match,
        type_correct: analysis.type_match,
        authority_correct: analysis.authority_match,
        gate_calculation_working: analysis.gate_count_personality > 0 && analysis.gate_count_design > 0,
        issues: [
          ...(analysis.type_match ? [] : ["Type mismatch"]),
          ...(analysis.authority_match ? [] : ["Authority mismatch"]),
          ...(analysis.gate_count_personality === 0 ? ["No personality gates calculated"] : []),
          ...(analysis.gate_count_design === 0 ? ["No design gates calculated"] : [])
        ]
      },
      debug_info: {
        personality_celestial_data_available: !!personalityCelestialData,
        sun_longitude: personalityCelestialData?.sun?.longitude,
        moon_longitude: personalityCelestialData?.moon?.longitude,
        total_planets_available: Object.keys(personalityCelestialData || {}).length,
        julian_date: personalityCelestialData?.julian_date,
        calculation_source: personalityCelestialData?.source
      }
    }, null, 2), {
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders 
      }
    });

  } catch (topLevelError) {
    // Catch-all for any unhandled errors
    console.error("❌ TOP-LEVEL ERROR:", topLevelError);
    console.error("❌ Top Error name:", topLevelError.name);
    console.error("❌ Top Error message:", topLevelError.message);
    console.error("❌ Top Error stack:", topLevelError.stack);
    
    return new Response(JSON.stringify({
      success: false,
      error: {
        step: "top_level_handler",
        name: topLevelError.name,
        message: topLevelError.message,
        stack: topLevelError.stack,
        details: "Unhandled error in test function"
      },
      test_failed: true,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders 
      }
    });
  }
}
