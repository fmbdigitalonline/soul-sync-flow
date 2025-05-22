
import * as path from "https://deno.land/std@0.168.0/path/mod.ts";
import initializeWasm from "./astro.js";  // Default import is now the init function

// Cache for the initialized WASM module (as a promise to prevent parallel compilation)
let wasmPromiseCache: Promise<any> | null = null;

// Define constants for the different sources of the WASM file
const WASM_SOURCE = Deno.env.get("WASM_SOURCE") || "full_fallback_chain";
const SUPABASE_PROJECT = Deno.env.get("SUPABASE_PROJECT") || "qxaajirrqrcnmvtowjbg";
const WASM_BUCKET = Deno.env.get("WASM_BUCKET") || "astro-wasm";  // Updated to match your bucket name
const WASM_OBJECT_PATH = Deno.env.get("WASM_OBJECT_PATH") || "/astro.wasm";  // Added leading slash

// Define the storage bucket URL
const STORAGE_URL = `https://${SUPABASE_PROJECT}.supabase.co/storage/v1/object/public/${WASM_BUCKET}${WASM_OBJECT_PATH}`;

// Add the specific URL provided by the user
const CUSTOM_STORAGE_URL = "https://qxaajirrqrcnmvtowjbg.supabase.co/storage/v1/object/public/astro-wasm//astro.wasm";

// Updated CDN URLs to use the latest builds from the SwissEph project
const GITHUB_CDN_URL = "https://cdn.jsdelivr.net/npm/@swisseph/swisseph-wasm@3.0.1/dist/swisseph.wasm";
const JSDELIVR_CDN_URL = "https://unpkg.com/@swisseph/swisseph-wasm@3.0.1/dist/swisseph.wasm";

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
      let wasmBinary: ArrayBuffer | Uint8Array;
      let source: string;
      
      // Always use the full fallback chain for maximum reliability
      // Try all sources in sequence until one works
      let error;

      // 0. First try the custom URL specifically provided by the user
      try {
        console.log(`Loading WASM from custom Storage URL: ${CUSTOM_STORAGE_URL}`);
        const response = await fetch(CUSTOM_STORAGE_URL);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch WASM from Custom URL: HTTP ${response.status} ${response.statusText}`);
        }
        
        wasmBinary = await response.arrayBuffer();
        const fileSizeKB = Math.round(wasmBinary.byteLength / 1024);
        
        // UPDATED: Relaxed size validation to accept larger files with embedded ephemeris data
        // Previous check was rejecting files > 650KB, now accepting up to 1.5MB
        // This allows newer builds (~1.1MB) with embedded ephemeris data to work
        if (fileSizeKB < 630 || fileSizeKB > 1500) {
          console.warn(`WARNING: WASM file size (${fileSizeKB} KB) is outside expected range for Emscripten build (630-1500 KB). May be wrong build.`);
        }
        
        console.log(`Successfully downloaded WASM binary: ${fileSizeKB} KB from Custom URL`);
        source = "custom_storage_url";
        
        // Convert to Uint8Array if it's an ArrayBuffer
        const wasmBytes = wasmBinary instanceof ArrayBuffer ? new Uint8Array(wasmBinary) : wasmBinary;
        
        // If we get here, we've successfully loaded the WASM file
        const loadEndTime = performance.now();
        const loadDuration = loadEndTime - loadStartTime;
        console.log(`[SwissEph] loaded WASM in ${Math.round(loadDuration)} ms from Custom URL`);
        
        // Initialize and return the WASM module
        const wasmModule = await initializeWasm(wasmBytes);
        return wasmModule;
      } catch (customUrlError) {
        console.warn(`❌ Custom URL failed: ${customUrlError.message}, trying next source...`);
        error = customUrlError;
      }
      
      // 1. Then try default storage bucket
      try {
        console.log(`Loading WASM from Supabase Storage: ${STORAGE_URL}`);
        const response = await fetch(STORAGE_URL);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch WASM from Storage: HTTP ${response.status} ${response.statusText}`);
        }
        
        wasmBinary = await response.arrayBuffer();
        const fileSizeKB = Math.round(wasmBinary.byteLength / 1024);
        
        // UPDATED: Relaxed size validation to accept larger files with embedded ephemeris data
        if (fileSizeKB < 630 || fileSizeKB > 1500) {
          console.warn(`WARNING: WASM file size (${fileSizeKB} KB) is outside expected range for Emscripten build (630-1500 KB). May be wrong build.`);
        }
        
        console.log(`Successfully downloaded WASM binary: ${fileSizeKB} KB from Storage`);
        source = "storage_bucket";
        
        // Convert to Uint8Array if it's an ArrayBuffer
        const wasmBytes = wasmBinary instanceof ArrayBuffer ? new Uint8Array(wasmBinary) : wasmBinary;
        
        const loadEndTime = performance.now();
        const loadDuration = loadEndTime - loadStartTime;
        console.log(`[SwissEph] loaded WASM in ${Math.round(loadDuration)} ms from Storage`);
        
        const wasmModule = await initializeWasm(wasmBytes);
        return wasmModule;
      } catch (storageError) {
        console.warn(`❌ Storage bucket failed: ${storageError.message}, trying next source...`);
        error = storageError;
      }
      
      // 2. Try local file (for development environments)
      try {
        console.log("Loading WASM from local file");
        // Use path methods to fix directory detection issues
        const localWasmPath = path.join(Deno.cwd(), "sweph", "astro.wasm");
        console.log(`Attempting to load from: ${localWasmPath}`);
        wasmBinary = await Deno.readFile(localWasmPath);
        const fileSizeKB = Math.round(wasmBinary.byteLength / 1024);
        console.log(`Successfully loaded local WASM binary: ${fileSizeKB} KB`);
        source = "local";
        
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
        const sharedWasmPath = path.join(Deno.cwd(), "_shared", "sweph", "astro.wasm");
        console.log(`Attempting to load from: ${sharedWasmPath}`);
        wasmBinary = await Deno.readFile(sharedWasmPath);
        const fileSizeKB = Math.round(wasmBinary.byteLength / 1024);
        console.log(`Successfully loaded shared WASM binary: ${fileSizeKB} KB`);
        source = "shared";
        
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
        
        // Convert to Uint8Array if it's an ArrayBuffer
        const wasmBytes = wasmBinary instanceof ArrayBuffer ? new Uint8Array(wasmBinary) : wasmBinary;
        
        const loadEndTime = performance.now();
        const loadDuration = loadEndTime - loadStartTime;
        console.log(`[SwissEph] loaded WASM in ${Math.round(loadDuration)} ms from GitHub CDN`);
        
        const wasmModule = await initializeWasm(wasmBytes);
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
        
        // Convert to Uint8Array if it's an ArrayBuffer
        const wasmBytes = wasmBinary instanceof ArrayBuffer ? new Uint8Array(wasmBinary) : wasmBinary;
        
        const loadEndTime = performance.now();
        const loadDuration = loadEndTime - loadStartTime;
        console.log(`[SwissEph] loaded WASM in ${Math.round(loadDuration)} ms from jsDelivr CDN`);
        
        const wasmModule = await initializeWasm(wasmBytes);
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
