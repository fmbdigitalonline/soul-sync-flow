
import * as path from "https://deno.land/std@0.168.0/path/mod.ts";
import initializeWasm from "./astro.js";  // Default import is now the init function

// Cache for the initialized WASM module
let wasmModuleCache: any = null;

// Define a constant for the CDN URL to ensure consistency
const CDN_URL =
  "https://raw.githubusercontent.com/u-blusky/sweph-wasm/v0.11.3/js/astro.wasm";

// (optional) keep jsDelivr as a second fallback:
const CDN_FALLBACK =
  "https://cdn.jsdelivr.net/gh/u-blusky/sweph-wasm@0.11.3/js/astro.wasm";

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
    console.log(`Loading WASM from primary CDN: ${CDN_URL}`);
    
    try {
      // Add more detailed logging to track the download
      const response = await fetch(CDN_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch WASM from primary CDN: ${response.status} ${response.statusText}`);
      }
      
      const wasmBinary = await response.arrayBuffer();
      const fileSizeKB = Math.round(wasmBinary.byteLength / 1024);
      console.log(`Downloaded WASM binary: ${fileSizeKB} KB from primary CDN`);
      
      // Verify file size is roughly what we expect (between 600KB-650KB for Emscripten build)
      if (fileSizeKB < 600 || fileSizeKB > 650) {
        console.warn(`WARNING: WASM file size (${fileSizeKB} KB) is outside expected range for Emscripten build (600-650 KB)`);
      }
      
      wasmModule = await initializeWasm(wasmBinary);
      console.log("Successfully initialized WASM from primary CDN");
    } catch (primaryError) {
      console.warn(`Primary CDN failed: ${primaryError.message}, trying fallback...`);
      
      try {
        // Try the jsDelivr fallback
        const fallbackResponse = await fetch(CDN_FALLBACK);
        if (!fallbackResponse.ok) {
          throw new Error(`Failed to fetch WASM from fallback CDN: ${fallbackResponse.status} ${fallbackResponse.statusText}`);
        }
        
        const fallbackBinary = await fallbackResponse.arrayBuffer();
        const fallbackSizeKB = Math.round(fallbackBinary.byteLength / 1024);
        console.log(`Downloaded WASM binary: ${fallbackSizeKB} KB from fallback CDN`);
        
        // Verify file size is roughly what we expect
        if (fallbackSizeKB < 600 || fallbackSizeKB > 650) {
          console.warn(`WARNING: Fallback WASM file size (${fallbackSizeKB} KB) is outside expected range`);
        }
        
        wasmModule = await initializeWasm(fallbackBinary);
        console.log("Successfully initialized WASM from fallback CDN");
      } catch (fallbackError) {
        console.error("All CDN sources failed:", fallbackError);
        throw new Error(`Failed to load WASM from any source: ${primaryError.message}, fallback: ${fallbackError.message}`);
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
