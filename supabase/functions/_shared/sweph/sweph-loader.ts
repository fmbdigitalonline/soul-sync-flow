
import * as path from "https://deno.land/std@0.168.0/path/mod.ts";
import initializeWasm from "./astro.js";  // Default import is now the init function

// Cache for the initialized WASM module (as a promise to prevent parallel compilation)
let wasmPromiseCache: Promise<any> | null = null;

// Define constants for the different sources of the WASM file
const WASM_SOURCE = Deno.env.get("WASM_SOURCE") || "full_fallback_chain";
const SUPABASE_PROJECT = Deno.env.get("SUPABASE_PROJECT") || "qxaajirrqrcnmvtowjbg";
const WASM_BUCKET = Deno.env.get("WASM_BUCKET") || "wasm";
const WASM_OBJECT_PATH = Deno.env.get("WASM_OBJECT_PATH") || "astro.wasm";

// Define the storage bucket URL
const STORAGE_URL = `https://${SUPABASE_PROJECT}.supabase.co/storage/v1/object/public/${WASM_BUCKET}/${WASM_OBJECT_PATH}`;

// Define fallback CDN URLs for reliability
const GITHUB_CDN_URL = "https://raw.githubusercontent.com/u-blusky/sweph-wasm/v0.11.3/js/astro.wasm";
const JSDELIVR_CDN_URL = "https://cdn.jsdelivr.net/gh/u-blusky/sweph-wasm@0.11.3/js/astro.wasm";

/**
 * Initialize the Swiss Ephemeris WASM module
 */
export async function initializeSwephModule() {
  try {
    // Return cached promise if we already started initialization
    if (wasmPromiseCache) {
      console.log("Using cached WASM module initialization promise");
      return await wasmPromiseCache;
    }

    console.log("Initializing Swiss Ephemeris WASM module");
    
    // Create a promise for the initialization and store it in the cache
    wasmPromiseCache = (async () => {
      const loadStartTime = performance.now();
      let wasmBinary: ArrayBuffer;
      let source: string;
      
      // Always use the full fallback chain for maximum reliability
      // Try all sources in sequence until one works
      let error;
      
      // 1. First try storage bucket (most reliable when configured correctly)
      try {
        console.log(`Loading WASM from Supabase Storage: ${STORAGE_URL}`);
        const response = await fetch(STORAGE_URL);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch WASM from Storage: HTTP ${response.status} ${response.statusText}`);
        }
        
        // Check content length to ensure we got the right file
        const contentLength = response.headers.get('content-length');
        if (contentLength && parseInt(contentLength) < 630000) {
          console.warn(`WARNING: WASM file size (${Math.round(parseInt(contentLength)/1024)} KB) is smaller than expected for Emscripten build (≈632 KB)`);
        }
        
        wasmBinary = await response.arrayBuffer();
        const fileSizeKB = Math.round(wasmBinary.byteLength / 1024);
        
        // Verify file size is roughly what we expect (guard rail)
        if (fileSizeKB < 630 || fileSizeKB > 650) {
          console.warn(`WARNING: WASM file size (${fileSizeKB} KB) is outside expected range for Emscripten build (630-650 KB). May be wrong build.`);
        }
        
        console.log(`Successfully downloaded WASM binary: ${fileSizeKB} KB from Storage`);
        source = "storage_bucket";
        
        // If we get here, we've successfully loaded the WASM file
        const loadEndTime = performance.now();
        const loadDuration = loadEndTime - loadStartTime;
        console.log(`[SwissEph] loaded WASM in ${Math.round(loadDuration)} ms from Storage`);
        
        // Initialize and return the WASM module
        const wasmModule = await initializeWasm(wasmBinary);
        return wasmModule;
      } catch (storageError) {
        console.warn(`❌ Storage bucket failed: ${storageError.message}, trying next source...`);
        error = storageError;
      }
      
      // 2. Try local file (for development environments)
      try {
        console.log("Loading WASM from local file");
        const localWasmPath = new URL('./sweph/astro.wasm', import.meta.url);
        wasmBinary = await Deno.readFile(localWasmPath);
        const fileSizeKB = Math.round(wasmBinary.byteLength / 1024);
        console.log(`Successfully loaded local WASM binary: ${fileSizeKB} KB`);
        source = "local";
        
        // Initialize and return the WASM module
        const loadEndTime = performance.now();
        const loadDuration = loadEndTime - loadStartTime;
        console.log(`[SwissEph] loaded WASM in ${Math.round(loadDuration)} ms from local file`);
        
        const wasmModule = await initializeWasm(wasmBinary);
        return wasmModule;
      } catch (localError) {
        console.warn(`❌ Local WASM failed: ${localError.message}, trying next source...`);
        error = localError;
      }
      
      // 3. Try shared folder
      try {
        console.log("Loading WASM from shared folder");
        const sharedWasmPath = new URL('../_shared/sweph/astro.wasm', import.meta.url);
        wasmBinary = await Deno.readFile(sharedWasmPath);
        const fileSizeKB = Math.round(wasmBinary.byteLength / 1024);
        console.log(`Successfully loaded shared WASM binary: ${fileSizeKB} KB`);
        source = "shared";
        
        // Initialize and return the WASM module
        const loadEndTime = performance.now();
        const loadDuration = loadEndTime - loadStartTime;
        console.log(`[SwissEph] loaded WASM in ${Math.round(loadDuration)} ms from shared file`);
        
        const wasmModule = await initializeWasm(wasmBinary);
        return wasmModule;
      } catch (sharedError) {
        console.warn(`❌ Shared WASM failed: ${sharedError.message}, trying next source...`);
        error = sharedError;
      }
      
      // 4. Try GitHub CDN
      try {
        console.log(`Loading WASM from GitHub CDN: ${GITHUB_CDN_URL}`);
        const response = await fetch(GITHUB_CDN_URL);
        if (!response.ok) {
          throw new Error(`GitHub CDN returned ${response.status} ${response.statusText}`);
        }
        wasmBinary = await response.arrayBuffer();
        const fileSizeKB = Math.round(wasmBinary.byteLength / 1024);
        console.log(`Successfully downloaded WASM binary: ${fileSizeKB} KB from GitHub CDN`);
        source = "github_cdn";
        
        // Initialize and return the WASM module
        const loadEndTime = performance.now();
        const loadDuration = loadEndTime - loadStartTime;
        console.log(`[SwissEph] loaded WASM in ${Math.round(loadDuration)} ms from GitHub CDN`);
        
        const wasmModule = await initializeWasm(wasmBinary);
        return wasmModule;
      } catch (githubError) {
        console.warn(`❌ GitHub CDN failed: ${githubError.message}, trying last resort...`);
        error = githubError;
      }
      
      // 5. Try jsDelivr CDN as last resort
      try {
        console.log(`Loading WASM from jsDelivr CDN: ${JSDELIVR_CDN_URL}`);
        const response = await fetch(JSDELIVR_CDN_URL);
        if (!response.ok) {
          throw new Error(`jsDelivr CDN returned ${response.status} ${response.statusText}`);
        }
        wasmBinary = await response.arrayBuffer();
        const fileSizeKB = Math.round(wasmBinary.byteLength / 1024);
        console.log(`Successfully downloaded WASM binary: ${fileSizeKB} KB from jsDelivr CDN`);
        source = "jsdelivr_cdn";
        
        // Initialize and return the WASM module
        const loadEndTime = performance.now();
        const loadDuration = loadEndTime - loadStartTime;
        console.log(`[SwissEph] loaded WASM in ${Math.round(loadDuration)} ms from jsDelivr CDN`);
        
        const wasmModule = await initializeWasm(wasmBinary);
        return wasmModule;
      } catch (jsdelivrError) {
        console.error(`❌ All WASM sources failed. Last error: ${jsdelivrError.message}`);
        error = new Error(`Failed to load WASM from any source. Last error: ${jsdelivrError.message}`);
        throw error;
      }
    })();
    
    // Return the promise that will resolve to the WASM module
    return await wasmPromiseCache;
  } catch (error) {
    // Clear the cache on error so it can try again on next call
    wasmPromiseCache = null;
    console.error("Failed to initialize Swiss Ephemeris WASM module:", error);
    throw error;
  }
}
