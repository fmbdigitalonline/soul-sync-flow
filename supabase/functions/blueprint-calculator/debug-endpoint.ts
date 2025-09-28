
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { debugBlueprintCalculation } from './debug-calculator.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export default async function debugEndpoint(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== DEBUG ENDPOINT CALLED ===");
    
    // Use your specific birth data for debugging
    const debugResult = await debugBlueprintCalculation(
      "1978-02-12", 
      "22:00", 
      "Paramaribo/Surinam"
    );

    return new Response(JSON.stringify({
      success: true,
      debug_result: debugResult,
      analysis: {
        timezone_issue: debugResult?.timezoneOffset !== -10800 ? "Timezone offset should be -10800 seconds (UTC-3), not " + debugResult?.timezoneOffset : "Timezone OK",
        sun_position_issue: (debugResult?.error ?? 0) > 10 ? `Sun position error of ${debugResult?.error}° indicates major calculation problem` : "Sun position within acceptable range",
        recommendations: [
          "Check ephemeris API datetime format",
          "Verify coordinate system (tropical vs sidereal)",
          "Validate timezone conversion logic",
          "Test with known astronomical events"
        ]
      }
    }), {
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders 
      }
    });

  } catch (error: unknown) {
    console.error("Debug endpoint error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    return new Response(JSON.stringify({
      error: msg,
      stack: stack
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders 
      }
    });
  }
}
