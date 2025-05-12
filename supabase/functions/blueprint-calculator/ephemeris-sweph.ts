import { SwissEph, JulDay, Bodies, Houses, HouseSystems, Flags } from "npm:sweph-wasm@0.11.3";
import { DateTime } from "npm:luxon@3.4.4";

// Interfaces reused from ephemeris.ts
interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

interface PlanetPosition {
  longitude: number;
  latitude: number;
  distance: number;
  speed: number;
  sign: number;
  house: number;
}

interface CelestialData {
  sun: PlanetPosition;
  moon: PlanetPosition;
  mercury: PlanetPosition;
  venus: PlanetPosition;
  mars: PlanetPosition;
  jupiter: PlanetPosition;
  saturn: PlanetPosition;
  uranus: PlanetPosition;
  neptune: PlanetPosition;
  pluto: PlanetPosition;
  ascendant: PlanetPosition;
  mc: PlanetPosition;
}

// Global instance of SwissEph (initialize once, use many times)
let sweph: SwissEph | null = null;
let swephInitializing = false;
let swephInitPromise: Promise<SwissEph> | null = null;

/**
 * Initialize the Swiss Ephemeris library
 * This should be called before any calculations
 */
async function initializeSweph(): Promise<SwissEph> {
  if (sweph) {
    return sweph;
  }
  
  if (swephInitPromise) {
    return swephInitPromise;
  }
  
  console.log("Initializing Swiss Ephemeris...");
  swephInitializing = true;
  
  swephInitPromise = SwissEph.create()
    .then(instance => {
      console.log("Swiss Ephemeris initialized successfully");
      sweph = instance;
      swephInitializing = false;
      return instance;
    })
    .catch(error => {
      console.error("Error initializing Swiss Ephemeris:", error);
      swephInitializing = false;
      throw error;
    });
  
  return swephInitPromise;
}

/**
 * Calculate Julian Day directly from Luxon DateTime
 */
function calculateJulianDayFromDateTime(dt: DateTime): number {
  // Use JulDay.fromDate for more accurate Julian Day calculation
  return JulDay.fromDate(
    dt.year,
    dt.month,
    dt.day,
    dt.hour + dt.minute / 60 + dt.second / 3600
  );
}

/**
 * Main function to calculate planetary positions using Swiss Ephemeris
 */
export async function calculatePlanetaryPositionsWithSweph(
  birthDate: string,
  birthTime: string,
  birthLocation: string,
  userTimezone: string
): Promise<CelestialData> {
  console.log(`[SwEph] Calculating positions for: ${birthDate} ${birthTime} at ${birthLocation} in timezone ${userTimezone}`);
  
  try {
    // Get geographic coordinates for the birth location (reuse existing function)
    const coordinates = await getGeoCoordinates(birthLocation);
    
    // Parse the birth date and time using Luxon with the timezone
    const tzId = await getIanaTimezoneId(
      coordinates, 
      new Date(`${birthDate}T${birthTime || '12:00'}`).getTime() / 1000
    ) || userTimezone;
    
    let localDateTime: DateTime;
    
    if (birthTime) {
      localDateTime = DateTime.fromISO(`${birthDate}T${birthTime}`, { zone: tzId });
      if (!localDateTime.isValid) {
        localDateTime = DateTime.fromISO(`${birthDate}T12:00`, { zone: tzId });
      }
    } else {
      localDateTime = DateTime.fromISO(`${birthDate}T12:00`, { zone: tzId });
    }
    
    // Convert local time to UTC
    const utcDateTime = localDateTime.toUTC();
    console.log(`[SwEph] Converted local time ${localDateTime.toString()} to UTC ${utcDateTime.toString()}`);
    
    // Calculate Julian day from UTC datetime
    const jd = calculateJulianDayFromDateTime(utcDateTime);
    console.log(`[SwEph] Calculated Julian day: ${jd}`);
    
    // Initialize Swiss Ephemeris
    const sweph = await initializeSweph();
    
    // Calculate houses first (we need them for planet positions)
    const houses = sweph.houses(
      jd,
      coordinates.latitude,
      coordinates.longitude,
      HouseSystems.PLACIDUS
    );
    
    // Map house cusps for later use
    const houseCusps = houses.cusps;
    
    // Calculate celestial positions
    const celestialData: CelestialData = {
      sun: await calculateBodyPosition(sweph, jd, Bodies.SUN, houseCusps, coordinates),
      moon: await calculateBodyPosition(sweph, jd, Bodies.MOON, houseCusps, coordinates),
      mercury: await calculateBodyPosition(sweph, jd, Bodies.MERCURY, houseCusps, coordinates),
      venus: await calculateBodyPosition(sweph, jd, Bodies.VENUS, houseCusps, coordinates),
      mars: await calculateBodyPosition(sweph, jd, Bodies.MARS, houseCusps, coordinates),
      jupiter: await calculateBodyPosition(sweph, jd, Bodies.JUPITER, houseCusps, coordinates),
      saturn: await calculateBodyPosition(sweph, jd, Bodies.SATURN, houseCusps, coordinates),
      uranus: await calculateBodyPosition(sweph, jd, Bodies.URANUS, houseCusps, coordinates),
      neptune: await calculateBodyPosition(sweph, jd, Bodies.NEPTUNE, houseCusps, coordinates),
      pluto: await calculateBodyPosition(sweph, jd, Bodies.PLUTO, houseCusps, coordinates),
      ascendant: {
        longitude: houses.ascendant,
        latitude: 0,
        distance: 0,
        speed: 0,
        sign: Math.floor(houses.ascendant / 30) % 12,
        house: 1
      },
      mc: {
        longitude: houses.mc,
        latitude: 0,
        distance: 0,
        speed: 0,
        sign: Math.floor(houses.mc / 30) % 12,
        house: 10
      }
    };
    
    console.log("[SwEph] Calculation completed successfully");
    
    return celestialData;
  } catch (error) {
    console.error('[SwEph] Error calculating planetary positions:', error);
    throw new Error(`[SwEph] Failed to calculate planetary positions: ${error.message}`);
  }
}

/**
 * Calculate the position of a celestial body
 */
async function calculateBodyPosition(
  sweph: SwissEph, 
  jd: number, 
  body: Bodies,
  houseCusps: number[],
  coordinates: GeoCoordinates
): Promise<PlanetPosition> {
  try {
    // Calculate the body's position with Swiss Ephemeris
    const result = sweph.calc(jd, body, Flags.SPEED);
    
    // Extract relevant data
    const longitude = result.longitude;
    const latitude = result.latitude;
    const distance = result.distance;
    const speed = result.longitudeSpeed;
    
    // Calculate zodiac sign (0-11)
    const sign = Math.floor(longitude / 30) % 12;
    
    // Determine the house (simplified calculation)
    const house = findHousePosition(longitude, houseCusps);
    
    return {
      longitude,
      latitude,
      distance,
      speed,
      sign,
      house
    };
  } catch (error) {
    console.error(`[SwEph] Error calculating position for body ${body}:`, error);
    
    // Return fallback data
    return {
      longitude: 0,
      latitude: 0,
      distance: 0,
      speed: 0,
      sign: 0,
      house: 1
    };
  }
}

/**
 * Find the house that contains a given longitude
 */
function findHousePosition(longitude: number, houseCusps: number[]): number {
  for (let i = 1; i < houseCusps.length; i++) {
    const nextIdx = i === houseCusps.length - 1 ? 1 : i + 1;
    
    let start = houseCusps[i];
    let end = houseCusps[nextIdx];
    
    // Handle house crossing 0°
    if (end < start) {
      if (longitude >= start || longitude < end) {
        return i;
      }
    } else {
      if (longitude >= start && longitude < end) {
        return i;
      }
    }
  }
  
  // Default to house 1
  return 1;
}

// Reuse these functions from the original ephemeris.ts
// They deal with geocoding and timezone conversion
async function getGeoCoordinates(location: string): Promise<GeoCoordinates> {
  // Import from the original ephemeris.ts to avoid duplication
  const { calculatePlanetaryPositions } = await import('./ephemeris.ts');
  const mod = calculatePlanetaryPositions as any;
  
  // Try to access the internal function using reflection
  if (mod.getGeoCoordinates) {
    return mod.getGeoCoordinates(location);
  }
  
  // Fallback implementation if we can't access the original
  try {
    console.log(`Getting coordinates for location: ${location}`);
    
    // First try to parse coordinates if given in format "lat,long"
    const coordMatch = location.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (coordMatch) {
      return {
        latitude: parseFloat(coordMatch[1]),
        longitude: parseFloat(coordMatch[2])
      };
    }
    
    // Get Google Maps API key from environment
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    
    if (!apiKey) {
      console.error("Google Maps API key not found in environment variables");
      throw new Error("Geocoding API key not configured");
    }
    
    // URL encode the location
    const encodedLocation = encodeURIComponent(location);
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${apiKey}`;
    
    // Make the API call
    const response = await fetch(geocodingUrl);
    const data = await response.json();
    
    // Check if the API call was successful
    if (data.status !== "OK") {
      console.error("Geocoding error:", data.status, data.error_message);
      
      // If everything fails, return a default location (UTC/Greenwich)
      return {
        latitude: 51.4769,
        longitude: 0
      };
    }
    
    const result = data.results[0];
    return {
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng
    };
  } catch (error) {
    console.error('Error geocoding location:', error);
    
    // If everything fails, return a default location (UTC/Greenwich)
    return {
      latitude: 51.4769,
      longitude: 0
    };
  }
}

async function getIanaTimezoneId(coordinates: GeoCoordinates, timestamp: number): Promise<string | null> {
  // Import from the original ephemeris.ts to avoid duplication
  const { calculatePlanetaryPositions } = await import('./ephemeris.ts');
  const mod = calculatePlanetaryPositions as any;
  
  // Try to access the internal function using reflection
  if (mod.getIanaTimezoneId) {
    return mod.getIanaTimezoneId(coordinates, timestamp);
  }
  
  // Fallback implementation
  try {
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    
    if (!apiKey) {
      console.error("Google Maps API key not found in environment variables");
      throw new Error("Timezone API key not configured");
    }
    
    const { latitude, longitude } = coordinates;
    const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude},${longitude}&timestamp=${timestamp}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== "OK") {
      return null;
    }
    
    return data.timeZoneId;
  } catch (error) {
    console.error("Error fetching timezone data:", error);
    return null;
  }
}
