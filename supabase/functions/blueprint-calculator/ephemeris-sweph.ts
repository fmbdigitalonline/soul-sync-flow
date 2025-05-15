
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

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
    
    // Initialize WASM with proper path resolution
    // The WASM file should be located in the same directory as the JS file
    const wasmModule = await astroModule.default();
    
    // Store in cache for reuse
    wasmModuleCache = wasmModule;
    console.log("WASM module initialized successfully");
    
    return wasmModule;
  } catch (error) {
    console.error("Failed to initialize Swiss Ephemeris WASM module:", error);
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
    
    if (!sweph) {
      throw new Error("Swiss Ephemeris module failed to initialize");
    }
    
    // Parse the date
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    
    // Set the location coordinates (simplified for now)
    // In a production system, you'd use a geocoding API to get the precise location
    const latitude = 0; // Default to Equator
    const longitude = 0; // Default to Greenwich Meridian
    
    // Calculate JD (Julian Date)
    const jd = sweph.swe_julday(year, month, day, hour + minute/60, sweph.SE_GREG_CAL);
    
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
      };
    }
    
    // Calculate Ascendant and MC (simplified house system)
    const houses = new Float64Array(13);
    const ascmc = new Float64Array(10);
    
    sweph.swe_houses(jd, latitude, longitude, 'P', houses, ascmc);
    
    positions['ascendant'] = {
      longitude: ascmc[sweph.SE_ASC],
    };
    
    positions['mc'] = {
      longitude: ascmc[sweph.SE_MC],
    };
    
    // Add timestamp for reference
    positions['timestamp'] = Date.parse(`${date}T${time}`);
    
    return positions;
  } catch (error) {
    console.error("SwEph: Error calculating positions:", error);
    throw error;
  }
}
