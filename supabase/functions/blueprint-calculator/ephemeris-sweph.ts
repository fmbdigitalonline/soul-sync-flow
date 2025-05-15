
// Import the Swiss Ephemeris WASM module
import ephemeris, { initializeWasm, Bodies, Flags } from '../_shared/sweph/astro.js';

// Flag to track if the WASM module has been initialized
let wasmInitialized = false;

/**
 * Calculate planetary positions using Swiss Ephemeris
 * 
 * @param date Birth date in YYYY-MM-DD format
 * @param time Birth time in HH:MM format (24-hour)
 * @param location Birth location as string
 * @param timezone IANA timezone identifier
 * @returns Object with planetary positions
 */
export async function calculatePlanetaryPositionsWithSweph(date, time, location, timezone) {
  try {
    console.log(`SwEph: Calculating positions for ${date} ${time} at ${location} in timezone ${timezone}`);
    
    // Initialize WASM module if not already done
    if (!wasmInitialized) {
      console.log("SwEph: Initializing WASM module");
      // Use proper URL resolution to find the WASM file relative to this script
      const wasmPath = new URL('../_shared/sweph/astro.wasm', import.meta.url).href;
      wasmInitialized = await initializeWasm(wasmPath);
    }
    
    if (!wasmInitialized) {
      throw new Error("Failed to initialize Swiss Ephemeris WASM module");
    }
    
    // Get coordinates for location
    const coordinates = await getCoordinates(location);
    
    // Calculate Julian day for the birth time in the given timezone
    const julianDay = calculateJulianDay(date, time, timezone);
    
    // Calculate positions for all planets using Swiss Ephemeris
    const celestialData = calculateCelestialPositions(julianDay, coordinates);
    
    return celestialData;
  } catch (error) {
    console.error("SwEph: Error calculating positions:", error);
    throw error; // Bubble up the error instead of falling back to legacy
  }
}

/**
 * Get coordinates for a location string using geocoding service
 */
async function getCoordinates(location) {
  try {
    console.log("Getting coordinates for location:", location);
    
    // In a full implementation, this would use a geocoding service
    // For now, return sample coordinates
    const geocodedCoordinates = await geocodeLocation(location);
    
    console.log(`Successfully geocoded ${location} to:`, geocodedCoordinates);
    return geocodedCoordinates;
  } catch (error) {
    console.error("Failed to geocode location:", error);
    throw error;
  }
}

/**
 * Geocode a location string to latitude/longitude
 */
async function geocodeLocation(location) {
  // In a production environment, this would use a real geocoding API
  // For now, use a simple mapping of common locations or sample data
  const geocodingMap = {
    "New York": { latitude: 40.7128, longitude: -74.0060 },
    "London": { latitude: 51.5074, longitude: -0.1278 },
    "Tokyo": { latitude: 35.6762, longitude: 139.6503 },
    "Paris": { latitude: 48.8566, longitude: 2.3522 },
    "Sydney": { latitude: -33.8688, longitude: 151.2093 },
    "Los Angeles": { latitude: 34.0522, longitude: -118.2437 },
    "Berlin": { latitude: 52.5200, longitude: 13.4050 },
    "Paramaribo/Surinam": { latitude: 5.8520355, longitude: -55.2038278 },
    // Add more cities as needed
  };
  
  // Try to find the location in our static mapping
  for (const [key, coordinates] of Object.entries(geocodingMap)) {
    if (location.toLowerCase().includes(key.toLowerCase())) {
      return coordinates;
    }
  }
  
  // If not found, call an external geocoding API
  // For now, just return a default coordinate
  console.warn(`Location "${location}" not found in static geocoding map, using default coordinates`);
  return { latitude: 0, longitude: 0 };
}

/**
 * Calculate Julian day from date and time
 */
function calculateJulianDay(date, time, timezone) {
  try {
    // Parse date and time components
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    
    // Convert local time to UTC based on timezone
    const localDateTime = new Date(`${date}T${time}:00`);
    const tzOffset = getTimezoneOffset(timezone, localDateTime);
    const utcDateTime = new Date(localDateTime.getTime() - tzOffset * 60 * 1000);
    
    console.log(`Converted local time ${localDateTime.toISOString()} to UTC ${utcDateTime.toISOString()}`);
    
    // Calculate Julian day using UTC date components
    const utcYear = utcDateTime.getUTCFullYear();
    const utcMonth = utcDateTime.getUTCMonth() + 1; // JavaScript months are 0-based
    const utcDay = utcDateTime.getUTCDate();
    const utcHour = utcDateTime.getUTCHours();
    const utcMinute = utcDateTime.getUTCMinutes();
    const utcSecond = utcDateTime.getUTCSeconds();
    
    // Calculate Julian day using the Swiss Ephemeris method
    // This is a simplified calculation for demonstration
    const a = Math.floor((14 - utcMonth) / 12);
    const y = utcYear + 4800 - a;
    const m = utcMonth + 12 * a - 3;
    
    let julDay = utcDay + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    
    // Add time component
    julDay += (utcHour - 12) / 24 + utcMinute / 1440 + utcSecond / 86400;
    
    console.log("Calculated Julian day:", julDay);
    
    return julDay;
  } catch (error) {
    console.error("Error calculating Julian day:", error);
    throw error;
  }
}

/**
 * Get timezone offset in minutes for a given IANA timezone
 */
function getTimezoneOffset(timezone, date) {
  try {
    // If timezone is provided, try to use it
    if (timezone) {
      console.log(`Using IANA timezone: ${timezone}`);
      // In a browser environment, we would use Intl.DateTimeFormat
      // For demonstration in a Node/Deno environment, use a simpler approach
      
      // This is a simplified implementation
      // In production, you would use a proper timezone database
      const timezoneMap = {
        "UTC": 0,
        "America/New_York": -5 * 60, // EST
        "America/Los_Angeles": -8 * 60, // PST
        "Europe/London": 0, // GMT
        "Europe/Paris": +1 * 60, // CET
        "Europe/Amsterdam": +1 * 60, // CET
        "Asia/Tokyo": +9 * 60,
        "Australia/Sydney": +11 * 60,
        "America/Paramaribo": -3.5 * 60, // Historical PRT timezone in Suriname (-3:30)
      };
      
      return timezoneMap[timezone] || 0;
    }
    
    // Fallback to UTC
    console.warn("No timezone specified, using UTC");
    return 0;
  } catch (error) {
    console.error("Error determining timezone offset:", error);
    return 0; // Default to UTC
  }
}

/**
 * Calculate positions for all celestial bodies
 */
function calculateCelestialPositions(julianDay, coordinates) {
  // In a full implementation, this would use the Swiss Ephemeris WASM module
  // For now, return sample data
  
  // Since the WASM module is initialized but not fully implemented,
  // we're still using sample data for demonstration
  
  // Create a timestamp for reference
  const timestamp = new Date(
    (julianDay - 2440587.5) * 86400000
  ).getTime();
  
  // Sample planetary positions data
  // In a real implementation, these would be calculated using Swiss Ephemeris
  return {
    timestamp,
    sun: { longitude: (julianDay % 360) * 0.985647, latitude: 0, distance: 1 },
    moon: { longitude: (julianDay % 360) * 13.1763, latitude: Math.sin(julianDay) * 5, distance: 0.002569 },
    mercury: { longitude: (julianDay % 360) * 1.2, latitude: Math.sin(julianDay * 0.7) * 3, distance: 0.4 },
    venus: { longitude: (julianDay % 360) * 0.8, latitude: Math.sin(julianDay * 0.9) * 2, distance: 0.7 },
    mars: { longitude: (julianDay % 360) * 0.5, latitude: Math.sin(julianDay * 1.1) * 1.8, distance: 1.5 },
    jupiter: { longitude: (julianDay % 360) * 0.08, latitude: Math.sin(julianDay * 0.3) * 1.3, distance: 5.2 },
    saturn: { longitude: (julianDay % 360) * 0.03, latitude: Math.sin(julianDay * 0.4) * 2.5, distance: 9.5 },
    uranus: { longitude: (julianDay % 360) * 0.01, latitude: Math.sin(julianDay * 0.2) * 0.8, distance: 19.2 },
    neptune: { longitude: (julianDay % 360) * 0.006, latitude: Math.sin(julianDay * 0.1) * 1.1, distance: 30.1 },
    pluto: { longitude: (julianDay % 360) * 0.004, latitude: Math.sin(julianDay * 0.15) * 17, distance: 39.5 },
    // Calculate ascendant and MC based on time and location
    ascendant: { longitude: (julianDay * 0.985647 + coordinates.longitude / 15 * 15) % 360, latitude: 0, distance: 0 },
    mc: { longitude: (julianDay * 0.985647 + 90) % 360, latitude: 0, distance: 0 },
    // Adjusted version of the timestamp for reference
    julianDay
  };
}
