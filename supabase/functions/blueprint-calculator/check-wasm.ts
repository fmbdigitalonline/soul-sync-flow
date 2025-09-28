
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
    
    // Check if WASI is supported in this Deno environment
    const wasiSupported = typeof Deno.Wasi === 'function';
    console.log(`WASI support detected: ${wasiSupported ? 'Yes' : 'No'}`);
    
    // Gather environment info
    const wasmSource = Deno.env.get("WASM_SOURCE") || "storage_bucket";
    const supabaseProject = Deno.env.get("SUPABASE_PROJECT") || "qxaajirrqrcnmvtowjbg";
    const wasmBucket = Deno.env.get("WASM_BUCKET") || "astro-wasm";
    const wasmPath = Deno.env.get("WASM_OBJECT_PATH") || "/astro.wasm";
    
    // Define the storage URL
    const storageUrl = `https://${supabaseProject}.supabase.co/storage/v1/object/public/${wasmBucket}${wasmPath}`;
    
    // Add custom URL check too
    const customUrl = "https://qxaajirrqrcnmvtowjbg.supabase.co/storage/v1/object/public/astro-wasm//astro.wasm";
    
    console.log(`Testing WASM URL: ${storageUrl}`);
    console.log(`Also testing custom WASM URL: ${customUrl}`);
    
    // Try to fetch the WASM file
    let wasmStatus = "unknown";
    let contentType = "unknown";
    let contentLength = 0;
    let errorDetails = null;
    let wasmType = "unknown";
    
    // Also check custom URL
    let customUrlStatus = "unknown";
    let customContentType = "unknown";
    let customContentLength = 0;
    let customErrorDetails = null;
    let customWasmType = "unknown";
    
    try {
      // Use HEAD request to check if file exists without downloading it
      const response = await fetch(storageUrl, { method: 'HEAD' });
      
      wasmStatus = response.ok ? "accessible" : "not_accessible";
      contentType = response.headers.get('content-type') || "not provided";
      const lengthHeader = response.headers.get('content-length');
      contentLength = lengthHeader ? parseInt(lengthHeader) : 0;
      
      if (response.ok) {
        console.log(`✅ WASM file accessible! Size: ${Math.round(contentLength/1024)} KB`);
        
        // Get a small part of the WASM file to check for WASI headers
        try {
          const checkResponse = await fetch(storageUrl, {
            headers: { Range: 'bytes=0-1000' }
          });
          
          if (checkResponse.ok) {
            const sampleData = await checkResponse.arrayBuffer();
            const textDecoder = new TextDecoder();
            const sampleText = textDecoder.decode(new Uint8Array(sampleData));
            
            wasmType = sampleText.includes("wasi_snapshot_preview1") ? "WASI" : "Emscripten";
            console.log(`Detected WASM type from storage URL: ${wasmType}`);
          }
        } catch (err) {
          console.warn("Failed to check WASM type:", err);
        }
      } else {
        console.error(`❌ WASM file not accessible. Status: ${response.status} ${response.statusText}`);
        errorDetails = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (fetchError) {
      console.error("Error fetching WASM file:", fetchError);
      wasmStatus = "fetch_error";
      errorDetails = fetchError.message;
    }
    
    // Check custom URL too
    try {
      const customResponse = await fetch(customUrl, { method: 'HEAD' });
      
      customUrlStatus = customResponse.ok ? "accessible" : "not_accessible";
      customContentType = customResponse.headers.get('content-type') || "not provided";
      const customLengthHeader = customResponse.headers.get('content-length');
      customContentLength = customLengthHeader ? parseInt(customLengthHeader) : 0;
      
      if (customResponse.ok) {
        console.log(`✅ Custom WASM URL accessible! Size: ${Math.round(customContentLength/1024)} KB`);
        
        // Get a small part of the WASM file to check for WASI headers
        try {
          const checkResponse = await fetch(customUrl, {
            headers: { Range: 'bytes=0-1000' }
          });
          
          if (checkResponse.ok) {
            const sampleData = await checkResponse.arrayBuffer();
            const textDecoder = new TextDecoder();
            const sampleText = textDecoder.decode(new Uint8Array(sampleData));
            
            customWasmType = sampleText.includes("wasi_snapshot_preview1") ? "WASI" : "Emscripten";
            console.log(`Detected WASM type from custom URL: ${customWasmType}`);
          }
        } catch (err) {
          console.warn("Failed to check custom WASM type:", err);
        }
      } else {
        console.error(`❌ Custom WASM URL not accessible. Status: ${customResponse.status} ${customResponse.statusText}`);
        customErrorDetails = `HTTP ${customResponse.status}: ${customResponse.statusText}`;
      }
    } catch (fetchError) {
      console.error("Error fetching custom WASM URL:", fetchError);
      customUrlStatus = "fetch_error";
      customErrorDetails = fetchError.message;
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
    const isNewerBuild = contentLength > 900000 || customContentLength > 900000;
    
    // Return the diagnostic information
    return new Response(
      JSON.stringify({
        environment: {
          wasm_source: wasmSource,
          supabase_project: supabaseProject,
          wasm_bucket: wasmBucket,
          wasm_path: wasmPath,
          wasi_supported: wasiSupported,
          deno_version: Deno.version
        },
        storage: {
          url: storageUrl,
          status: wasmStatus,
          content_type: contentType,
          size_bytes: contentLength,
          size_kb: Math.round(contentLength/1024),
          wasm_type: wasmType,
          error: errorDetails,
          expected_size_kb: isNewerBuild ? "~1.1 MB (with embedded ephemeris)" : "~632 KB (without embedded ephemeris)"
        },
        custom_storage: {
          url: customUrl,
          status: customUrlStatus,
          content_type: customContentType,
          size_bytes: customContentLength,
          size_kb: Math.round(customContentLength/1024),
          wasm_type: customWasmType,
          error: customErrorDetails
        },
        local_files: localPaths,
        recommendations: [
          wasmStatus !== "accessible" && customUrlStatus !== "accessible" ? 
            "Create a public bucket named 'astro-wasm' in Supabase Storage" : 
            "One of the storage URLs is accessible",
          contentLength < 630000 && customContentLength < 630000 && wasmStatus === "accessible" && customUrlStatus === "accessible" ? 
            "File seems too small. Ensure it's the correct Emscripten build (should be ~632 KB or ~1.1 MB)" : 
            null,
          !wasiSupported && (wasmType === "WASI" || customWasmType === "WASI") ?
            "Your WASM file appears to be a WASI build but this Deno environment doesn't support WASI. Try an Emscripten build instead." :
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
        stack: error.stack,
        wasi_supported: typeof Deno.Wasi === 'function',
        deno_version: Deno.version
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
