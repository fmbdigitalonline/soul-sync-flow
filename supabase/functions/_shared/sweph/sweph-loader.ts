
import * as path from "https://deno.land/std@0.168.0/path/mod.ts";
import initializeWasm from "./astro.js";  // Default import is now the init function

// Cache for the initialized WASM module
let wasmModuleCache: any = null;

// Define a constant for the CDN URL to ensure consistency
const CDN_URL = "https://cdn.jsdelivr.net/gh/u-blusky/sweph-wasm@0.11.3/js/astro.wasm";

/**
 * Initialize the Swiss Ephemeris WASM module
 */
export async function initializeSwephModule() {
  try {
    if (wasmModuleCache) {
      console.log("Using cached WASM module");
      return wasmModuleCache;
    }

    console.log("Initializing Swiss Ephemeris WASM module");
    
    // Build URL exactly once - the base is this file's location
    const wasmUrl = new URL('./astro.wasm', import.meta.url);
    console.log(`Loading WASM from URL: ${wasmUrl}`);
    
    let wasmModule;
    const loadStartTime = performance.now();
    
    try {
      // Deno.readFile accepts a URL object directly - no pathname, no "file://"
      const wasmBytes = await Deno.readFile(wasmUrl);
      console.log(`Successfully read ${wasmBytes.byteLength} bytes from WASM file`);
      
      // Initialize from bytes directly
      wasmModule = await initializeWasm(wasmBytes);
      console.log(`[SwissEph] loaded ${wasmUrl.pathname} (${Math.round(wasmBytes.byteLength / 1024)} kB)`);
    } catch (fsError) {
      console.warn(`Failed to load WASM from local filesystem: ${fsError.message}`);
      
      // Try to fetch from Supabase Storage with the exact URL
      const supabaseStorageUrl = "https://qxaajirrqrcnmvtowjbg.supabase.co/storage/v1/object/public/astro-wasm//astro.wasm";
      console.log(`Falling back to Supabase Storage URL: ${supabaseStorageUrl}`);
      
      try {
        wasmModule = await initializeWasm(supabaseStorageUrl);
      } catch (storageError) {
        console.warn(`Failed to load WASM from Supabase Storage: ${storageError.message}`);
        
        // Final fallback to GitHub CDN (using the Emscripten build path)
        console.log(`Falling back to GitHub URL: ${CDN_URL}`);
        wasmModule = await initializeWasm(CDN_URL);
      }
    }
    
    const loadEndTime = performance.now();
    const loadDuration = loadEndTime - loadStartTime;
    
    if (!wasmModule) {
      throw new Error("Swiss Ephemeris WASM module failed to initialize");
    }
    
    console.log(`[SwissEph] loaded WASM in ${Math.round(loadDuration)} ms`);
    
    // Store in cache for reuse
    wasmModuleCache = wasmModule;
    
    return wasmModule;
  } catch (error) {
    console.error("Failed to initialize Swiss Ephemeris WASM module:", error);
    throw error;
  }
}
