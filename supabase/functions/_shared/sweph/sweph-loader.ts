
import * as path from "https://deno.land/std@0.168.0/path/mod.ts";
import initializeWasm from "./astro.js";  // Default import is now the init function

// Cache for the initialized WASM module
let wasmModuleCache: any = null;

// Define a constant for the CDN URL to ensure consistency
// Using the correct tag (without 'v' prefix) and js/ folder path to get the Emscripten build (~632KB)
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
    
    let wasmModule;
    const loadStartTime = performance.now();
    
    // Skip trying to load from local filesystem and directly use the CDN URL
    // This ensures we always get the correct Emscripten build (~632KB) and not the WASI build (~1MB+)
    console.log(`Loading WASM from CDN: ${CDN_URL}`);
    
    try {
      wasmModule = await initializeWasm(CDN_URL);
      console.log(`Successfully loaded WASM module from CDN`);
    } catch (error) {
      console.error(`Failed to load WASM from CDN: ${error.message}`);
      // We're removing the unpkg fallback as it can never work
      throw error;
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
