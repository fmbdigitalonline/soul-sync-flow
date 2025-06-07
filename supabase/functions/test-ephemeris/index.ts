
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting Swiss Ephemeris test via Node.js sweph library");
    
    // Track time for performance measurement
    const startTime = performance.now();
    
    // Test the Vercel API endpoint directly
    const testData = {
      datetime: "2025-01-01T12:00:00.000Z",
      coordinates: "40.7128,-74.0060"
    };
    
    console.log("Testing Vercel ephemeris API with data:", testData);
    
    const vercelResponse = await fetch("https://soul-sync-flow.vercel.app/api/ephemeris", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log("Vercel API response status:", vercelResponse.status);
    
    const responseText = await vercelResponse.text();
    console.log("Vercel API response body:", responseText);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError);
      responseData = { raw_response: responseText, parse_error: parseError.message };
    }
    
    // Calculate time spent
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    // Determine if the test was successful
    const isSuccess = vercelResponse.status === 200 && responseData.success;
    
    return new Response(
      JSON.stringify({
        success: isSuccess,
        message: isSuccess ? "Swiss Ephemeris API test successful" : "Swiss Ephemeris API test failed",
        test_results: {
          vercel_api_status: vercelResponse.status,
          vercel_api_response: responseData,
          processing_time_ms: duration,
          test_data_sent: testData,
          timestamp: new Date().toISOString()
        },
        debug_info: {
          response_headers: Object.fromEntries(vercelResponse.headers.entries()),
          content_type: vercelResponse.headers.get('content-type'),
          response_size: responseText.length
        }
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  } catch (error) {
    console.error("Ephemeris test failed:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack,
        message: "Failed to test the Swiss Ephemeris API",
        timestamp: new Date().toISOString()
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
