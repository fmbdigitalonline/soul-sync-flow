
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import * as path from "https://deno.land/std@0.168.0/path/mod.ts";

// Cache for the initialized WASM module
let wasmModuleCache: any = null;

/**
 * Initialize the Swiss Ephemeris WASM module
 */
async function initializeSwephModule() {
  try {
    if (wasmModuleCache) {
      console.log("Using cached WASM module");
      return wasmModuleCache;
    }

    console.log("Initializing Swiss Ephemeris WASM module");
    
    // Load astro.js module
    const astroModule = await import('../_shared/sweph/astro.js');
    
    // Use proper path resolution for Deno
    // First try to load from local filesystem using relative path
    const wasmPath = path.join(path.dirname(path.fromFileUrl(import.meta.url)), "../_shared/sweph/astro.wasm");
    console.log(`Attempting to load WASM from path: ${wasmPath}`);
    
    let wasmModule;
    const loadStartTime = performance.now();
    
    try {
      // Try to load the WASM file directly using Deno's filesystem API
      const wasmBytes = await Deno.readFile(wasmPath);
      console.log(`Successfully read ${wasmBytes.byteLength} bytes from WASM file`);
      wasmModule = await astroModule.initializeWasmFromBytes(wasmBytes);
    } catch (fsError) {
      console.warn(`Failed to load WASM from local filesystem: ${fsError.message}`);
      
      // Fallback to using the CDN version if local file is not accessible
      const cdnUrl = "https://cdn.jsdelivr.net/gh/u-blusky/sweph-wasm@0.11.3/js/astro.wasm";
      console.log(`Falling back to CDN URL: ${cdnUrl}`);
      wasmModule = await astroModule.initializeWasm(cdnUrl);
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
    // We'll throw the error instead of silently falling back
    throw error;
  }
}

/**
 * Calculate planetary positions using Swiss Ephemeris
 */
export async function calculatePlanetaryPositionsWithSweph(date, time, location, timezone) {
  try {
    console.log(`SwEph: Calculating positions for ${date} ${time} at ${location} in timezone ${timezone}`);
    
    // Initialize the WASM module
    const sweph = await initializeSwephModule();
    
    // Parse the date
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    
    // We need to get accurate coordinates for the location
    const coords = await getLocationCoordinates(location);
    console.log(`SwEph: Location coordinates: lat ${coords.latitude}, long ${coords.longitude}`);
    
    // Calculate JD (Julian Date)
    const jd = sweph.swe_julday(year, month, day, hour + minute/60, sweph.SE_GREG_CAL);
    console.log(`SwEph: Julian date calculated: ${jd}`);
    
    // Calculate positions for major planets and points
    const celestialBodies = {
      'sun': sweph.SE_SUN,
      'moon': sweph.SE_MOON,
      'mercury': sweph.SE_MERCURY,
      'venus': sweph.SE_VENUS,
      'mars': sweph.SE_MARS,
      'jupiter': sweph.SE_JUPITER,
      'saturn': sweph.SE_SATURN,
      'uranus': sweph.SE_URANUS,
      'neptune': sweph.SE_NEPTUNE,
      'pluto': sweph.SE_PLUTO,
      'north_node': sweph.SE_TRUE_NODE,
      'chiron': sweph.SE_CHIRON,
    };
    
    const positions = {};
    
    for (const [body, id] of Object.entries(celestialBodies)) {
      const result = new Float64Array(6);
      const flags = sweph.SEFLG_SPEED;
      
      const ret = sweph.swe_calc_ut(jd, id, flags, result);
      
      if (ret < 0) {
        console.warn(`Error calculating position for ${body}`);
        continue;
      }
      
      positions[body] = {
        longitude: result[0],
        latitude: result[1],
        distance: result[2],
        longitudeSpeed: result[3],
        latitudeSpeed: result[4],
        distanceSpeed: result[5],
      };
      
      console.log(`SwEph: ${body} position: lon ${result[0].toFixed(6)}, lat ${result[1].toFixed(6)}`);
    }
    
    // Calculate Ascendant and MC
    const houses = new Float64Array(13);
    const ascmc = new Float64Array(10);
    
    sweph.swe_houses(jd, coords.latitude, coords.longitude, 'P', houses, ascmc);
    
    positions['ascendant'] = {
      longitude: ascmc[sweph.SE_ASC],
      latitude: 0,
      house: 1
    };
    
    positions['mc'] = {
      longitude: ascmc[sweph.SE_MC],
      latitude: 0,
      house: 10
    };
    
    console.log(`SwEph: Ascendant: ${positions['ascendant'].longitude.toFixed(6)}`);
    console.log(`SwEph: MC: ${positions['mc'].longitude.toFixed(6)}`);
    
    // Add house cusps
    positions['houses'] = Array.from(houses.slice(1, 13)).map((cusp, index) => ({
      cusp: index + 1,
      longitude: cusp
    }));
    
    // Add timestamp for reference
    positions['timestamp'] = Date.parse(`${date}T${time}`);
    positions['source'] = 'swiss_ephemeris';
    
    return positions;
  } catch (error) {
    console.error("SwEph: Error calculating positions:", error);
    // We no longer silently fall back - throw the error up so we can diagnose issues
    throw error;
  }
}

// Helper function to get location coordinates
async function getLocationCoordinates(location: string): Promise<{ latitude: number; longitude: number }> {
  try {
    // Use a geocoding service to get coordinates
    // If GOOGLE_MAPS_API_KEY is available, use the Google Maps Geocoding API
    const googleApiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    
    if (googleApiKey) {
      const encodedLocation = encodeURIComponent(location);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${googleApiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const { lat, lng } = result.geometry.location;
        console.log(`Geocoded location "${location}" to: ${lat}, ${lng}`);
        return { latitude: lat, longitude: lng };
      } else {
        throw new Error(`No results found for location: ${location}`);
      }
    } else {
      // Fallback to OpenStreetMap/Nominatim if no Google API key
      const encodedLocation = encodeURIComponent(location);
      const url = `https://nominatim.openstreetmap.org/search?q=${encodedLocation}&format=json`;
      
      const response = await fetch(url, {
        headers: {
          "User-Agent": "SoulSync Blueprint Calculator/1.0"
        }
      });
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        console.log(`Geocoded location "${location}" to: ${result.lat}, ${result.lon}`);
        return { latitude: parseFloat(result.lat), longitude: parseFloat(result.lon) };
      }
      
      // If we still can't get coordinates, use a default
      console.warn(`Failed to geocode location: ${location}, using default coordinates`);
      return { latitude: 40.7128, longitude: -74.0060 }; // New York City as default
    }
  } catch (error) {
    console.error(`Error geocoding location "${location}":`, error);
    // Return default values in case of error
    return { latitude: 40.7128, longitude: -74.0060 }; // New York City as default
  }
}
