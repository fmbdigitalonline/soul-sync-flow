
import { calculatePlanetaryPositions as legacyCalculate } from "./ephemeris.ts";
import ephemeris, { initializeWasm, Bodies, JulDay } from "../_shared/sweph/astro.js";

// Flag to track if the WASM module is initialized
let wasmInitialized = false;

/**
 * Calculate planetary positions using Swiss Ephemeris WASM
 */
export async function calculatePlanetaryPositionsWithSweph(date: string, time: string, location: string, timezone: string) {
  console.log(`SwEph: Calculating positions for ${date} ${time} at ${location} in timezone ${timezone}`);
  
  try {
    // Initialize the WASM module if not already done
    if (!wasmInitialized) {
      console.log("SwEph: Initializing WASM module");
      try {
        // The path is relative to the edge function
        wasmInitialized = await initializeWasm("../_shared/sweph/astro.wasm");
        console.log(`SwEph: WASM initialization ${wasmInitialized ? 'successful' : 'failed'}`);
        
        if (!wasmInitialized) {
          throw new Error("Failed to initialize WASM module");
        }
      } catch (e) {
        console.error("SwEph: Error initializing WASM:", e);
        throw e;
      }
    }
    
    // Convert date and time to Julian day
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    
    const julDay = JulDay.fromDate(year, month, day, hour, minute, 0);
    console.log(`SwEph: Julian day calculated: ${julDay}`);
    
    // Get coordinates for location (this would be implemented in a real system)
    const coords = await getLocationCoordinates(location);
    
    // Calculate planets
    const planets = calculatePlanets(julDay);
    
    // Calculate houses
    const houses = ephemeris.Houses.calculate(
      julDay, 
      coords.latitude, 
      coords.longitude, 
      ephemeris.HouseSystems.PLACIDUS
    );
    
    // Compile the results
    const results = {
      julianDay: julDay,
      ascendant: {
        longitude: houses.ascendant,
        house: 1
      },
      mc: {
        longitude: houses.mc,
        house: 10
      },
      sun: planets.sun,
      moon: planets.moon,
      mercury: planets.mercury,
      venus: planets.venus,
      mars: planets.mars,
      jupiter: planets.jupiter,
      saturn: planets.saturn,
      uranus: planets.uranus,
      neptune: planets.neptune,
      pluto: planets.pluto,
      chiron: planets.chiron,
      houses: houses.cusps
    };
    
    return results;
  } catch (error) {
    console.error("SwEph: Error in calculation:", error);
    throw error; // Propagate error instead of falling back
  }
}

// Helper function to calculate planetary positions
function calculatePlanets(julDay: number) {
  return {
    sun: {
      longitude: ephemeris.calculate(julDay, Bodies.SUN).longitude,
      latitude: ephemeris.calculate(julDay, Bodies.SUN).latitude,
      house: assignHouse(ephemeris.calculate(julDay, Bodies.SUN).longitude)
    },
    moon: {
      longitude: ephemeris.calculate(julDay, Bodies.MOON).longitude,
      latitude: ephemeris.calculate(julDay, Bodies.MOON).latitude,
      house: assignHouse(ephemeris.calculate(julDay, Bodies.MOON).longitude)
    },
    mercury: {
      longitude: ephemeris.calculate(julDay, Bodies.MERCURY).longitude,
      latitude: ephemeris.calculate(julDay, Bodies.MERCURY).latitude,
      house: assignHouse(ephemeris.calculate(julDay, Bodies.MERCURY).longitude)
    },
    venus: {
      longitude: ephemeris.calculate(julDay, Bodies.VENUS).longitude,
      latitude: ephemeris.calculate(julDay, Bodies.VENUS).latitude,
      house: assignHouse(ephemeris.calculate(julDay, Bodies.VENUS).longitude)
    },
    mars: {
      longitude: ephemeris.calculate(julDay, Bodies.MARS).longitude,
      latitude: ephemeris.calculate(julDay, Bodies.MARS).latitude,
      house: assignHouse(ephemeris.calculate(julDay, Bodies.MARS).longitude)
    },
    jupiter: {
      longitude: ephemeris.calculate(julDay, Bodies.JUPITER).longitude,
      latitude: ephemeris.calculate(julDay, Bodies.JUPITER).latitude,
      house: assignHouse(ephemeris.calculate(julDay, Bodies.JUPITER).longitude)
    },
    saturn: {
      longitude: ephemeris.calculate(julDay, Bodies.SATURN).longitude,
      latitude: ephemeris.calculate(julDay, Bodies.SATURN).latitude,
      house: assignHouse(ephemeris.calculate(julDay, Bodies.SATURN).longitude)
    },
    uranus: {
      longitude: ephemeris.calculate(julDay, Bodies.URANUS).longitude,
      latitude: ephemeris.calculate(julDay, Bodies.URANUS).latitude,
      house: assignHouse(ephemeris.calculate(julDay, Bodies.URANUS).longitude)
    },
    neptune: {
      longitude: ephemeris.calculate(julDay, Bodies.NEPTUNE).longitude,
      latitude: ephemeris.calculate(julDay, Bodies.NEPTUNE).latitude,
      house: assignHouse(ephemeris.calculate(julDay, Bodies.NEPTUNE).longitude)
    },
    pluto: {
      longitude: ephemeris.calculate(julDay, Bodies.PLUTO).longitude,
      latitude: ephemeris.calculate(julDay, Bodies.PLUTO).latitude,
      house: assignHouse(ephemeris.calculate(julDay, Bodies.PLUTO).longitude)
    },
    chiron: {
      longitude: ephemeris.calculate(julDay, Bodies.CHIRON).longitude,
      latitude: ephemeris.calculate(julDay, Bodies.CHIRON).latitude,
      house: assignHouse(ephemeris.calculate(julDay, Bodies.CHIRON).longitude)
    }
  };
}

// Simple helper to assign houses based on longitude
function assignHouse(longitude: number): number {
  return Math.floor(longitude / 30) + 1;
}

// Helper function to get location coordinates
async function getLocationCoordinates(location: string): Promise<{ latitude: number; longitude: number }> {
  // In a real implementation, we would call a geocoding service here
  // For now, return default coordinates for testing
  return {
    latitude: 40.7128,
    longitude: -74.0060
  };
}
