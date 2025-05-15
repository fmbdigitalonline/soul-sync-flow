import * as path from "https://deno.land/std@0.168.0/path/mod.ts";
import initializeWasm from "./astro.js";  // Default import is now the init function

// Cache for the initialized WASM module
let wasmModuleCache: any = null;

// Define a constant for the CDN URL to ensure consistency
const CDN_URL =
  "https://raw.githubusercontent.com/u-blusky/sweph-wasm/v0.11.3/js/astro.wasm";

// (optional) keep jsDelivr as a second fallback:
const CDN_FALLBACK =
  "https://cdn.jsdelivr.net/gh/u-blusky/sweph-wasm/js/astro.wasm";

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
    } catch (_) {
      console.warn("raw GH failed, trying jsDelivr");
      wasmModule = await initializeWasm(CDN_FALLBACK);
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
