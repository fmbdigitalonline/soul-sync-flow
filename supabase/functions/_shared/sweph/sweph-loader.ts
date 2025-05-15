
import * as path from "https://deno.land/std@0.168.0/path/mod.ts";
import initializeWasm from "./astro.js";  // Default import is now the init function

// Cache for the initialized WASM module
let wasmModuleCache: any = null;

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
      console.log(`[SwissEph] loaded ${wasmUrl.pathname}`);
    } catch (fsError) {
      console.warn(`Failed to load WASM from local filesystem: ${fsError.message}`);
      
      // Fallback to using the correct GitHub URL if local file is not accessible
      const cdnUrl = "https://raw.githubusercontent.com/u-blusky/sweph-wasm/main/js/astro.wasm";
      console.log(`Falling back to GitHub URL: ${cdnUrl}`);
      wasmModule = await initializeWasm(cdnUrl);
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
