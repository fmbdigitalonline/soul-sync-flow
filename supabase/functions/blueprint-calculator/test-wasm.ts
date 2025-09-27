
import { initializeSwephModule } from '../_shared/sweph/sweph-loader.ts';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export default async function testWasm(req: Request): Promise<Response> {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting WebAssembly test for Swiss Ephemeris");
    
    // Track time for performance measurement
    const startTime = performance.now();
    
    // Check if WASI is supported in this Deno environment
    const wasiSupported = typeof Deno.Wasi === 'function';
    console.log(`WASI support detected: ${wasiSupported ? 'Yes' : 'No'}`);
    
    // Try to initialize the WASM module
    console.log("Attempting to initialize Swiss Ephemeris WASM module...");
    const sweph = await initializeSwephModule();
    console.log("WASM module initialized successfully!");
    
    // Test a simple calculation to prove it works
    const testYear = 2000;
    const testMonth = 1;
    const testDay = 1;
    const testHour = 12;
    
    console.log(`Testing calculation for ${testYear}-${testMonth}-${testDay} ${testHour}:00`);
    const jd = sweph.swe_julday(testYear, testMonth, testDay, testHour, sweph.SE_GREG_CAL);
    console.log(`Julian day calculated: ${jd}`);
    
    // Calculate Sun position as a test
    const result = new Float64Array(6);
    const flags = sweph.SEFLG_SPEED;
    const sunId = sweph.SE_SUN;
    
    const ret = sweph.swe_calc_ut(jd, sunId, flags, result);
    console.log(`Sun position calculated: lon ${result[0].toFixed(6)}, lat ${result[1].toFixed(6)}`);
    
    // Calculate time spent
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Swiss Ephemeris WASM module initialized and tested successfully",
        test_results: {
          julian_day: jd,
          sun_position: {
            longitude: result[0],
            latitude: result[1],
            distance: result[2]
          },
          wasi_support: wasiSupported,
          deno_version: Deno.version,
          processing_time_ms: duration
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
    console.error("WASM test failed:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack,
        wasi_support: typeof Deno.Wasi === 'function',
        deno_version: Deno.version,
        message: "Failed to initialize or test the Swiss Ephemeris WASM module"
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
}
