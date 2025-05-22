
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
    console.log("Checking WASM configuration...");
    
    // Gather environment info
    const wasmSource = Deno.env.get("WASM_SOURCE") || "storage_bucket";
    const supabaseProject = Deno.env.get("SUPABASE_PROJECT") || "qxaajirrqrcnmvtowjbg";
    const wasmBucket = Deno.env.get("WASM_BUCKET") || "wasm";
    const wasmPath = Deno.env.get("WASM_OBJECT_PATH") || "astro.wasm";
    
    // Define the storage URL
    const storageUrl = `https://${supabaseProject}.supabase.co/storage/v1/object/public/${wasmBucket}/${wasmPath}`;
    
    console.log(`Testing WASM URL: ${storageUrl}`);
    
    // Try to fetch the WASM file
    let wasmStatus = "unknown";
    let contentType = "unknown";
    let contentLength = 0;
    let errorDetails = null;
    
    try {
      // Use HEAD request to check if file exists without downloading it
      const response = await fetch(storageUrl, { method: 'HEAD' });
      
      wasmStatus = response.ok ? "accessible" : "not_accessible";
      contentType = response.headers.get('content-type') || "not provided";
      const lengthHeader = response.headers.get('content-length');
      contentLength = lengthHeader ? parseInt(lengthHeader) : 0;
      
      if (response.ok) {
        console.log(`✅ WASM file accessible! Size: ${Math.round(contentLength/1024)} KB`);
      } else {
        console.error(`❌ WASM file not accessible. Status: ${response.status} ${response.statusText}`);
        errorDetails = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (fetchError) {
      console.error("Error fetching WASM file:", fetchError);
      wasmStatus = "fetch_error";
      errorDetails = fetchError.message;
    }
    
    // Also check local paths for completeness
    let localPaths = [];
    
    try {
      const paths = [
        "./sweph/astro.wasm",
        "../_shared/sweph/astro.wasm"
      ];
      
      for (const path of paths) {
        try {
          const stat = await Deno.stat(path);
          localPaths.push({
            path,
            exists: true,
            size: stat.size,
            size_kb: Math.round(stat.size/1024)
          });
          console.log(`✅ Local WASM found: ${path} (${Math.round(stat.size/1024)} KB)`);
        } catch {
          localPaths.push({
            path,
            exists: false
          });
          console.log(`❌ Local WASM not found: ${path}`);
        }
      }
    } catch (localError) {
      console.error("Error checking local paths:", localError);
    }
    
    // Determine if we're using the newer or older build
    const isNewerBuild = contentLength > 900000;
    
    // Return the diagnostic information
    return new Response(
      JSON.stringify({
        environment: {
          wasm_source: wasmSource,
          supabase_project: supabaseProject,
          wasm_bucket: wasmBucket,
          wasm_path: wasmPath
        },
        storage: {
          url: storageUrl,
          status: wasmStatus,
          content_type: contentType,
          size_bytes: contentLength,
          size_kb: Math.round(contentLength/1024),
          error: errorDetails,
          expected_size_kb: isNewerBuild ? "~1.1 MB (with embedded ephemeris)" : "~632 KB (without embedded ephemeris)"
        },
        local_files: localPaths,
        recommendations: [
          wasmStatus !== "accessible" ? 
            "Create a public bucket named 'wasm' in Supabase Storage" : 
            "Storage URL is accessible",
          contentLength < 630000 && wasmStatus === "accessible" ? 
            "File seems too small. Ensure it's the correct Emscripten build (should be ~632 KB or ~1.1 MB)" : 
            null,
          "Set Cache-Control: public, max-age=31536000, immutable on the WASM file"
        ].filter(Boolean)
      }, null, 2),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error("Error checking WASM configuration:", error);
    
    return new Response(
      JSON.stringify({
        error: 'WASM check failed',
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
