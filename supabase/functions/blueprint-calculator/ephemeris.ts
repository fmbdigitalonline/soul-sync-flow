
import { DateTime } from "luxon";

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

// Function to convert location string to geographic coordinates using Google Maps Geocoding API
async function getGeoCoordinates(location: string): Promise<GeoCoordinates> {
  try {
    console.log(`Getting coordinates for location: ${location}`);
    
    // First try to parse coordinates if given in format "lat,long" as fallback
    const coordMatch = location.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (coordMatch) {
      console.log("Using explicit coordinates from input string");
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
      
      // If we failed, see if the location can be handled by our internal database
      const coordinates = getDefaultCoordinates(location);
      if (coordinates) {
        console.log(`Using default coordinates for ${location}:`, coordinates);
        return coordinates;
      }
      
      throw new Error(`Geocoding failed: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }
    
    if (!data.results || data.results.length === 0) {
      console.error("No results found for location:", location);
      
      // Try our fallback database again
      const coordinates = getDefaultCoordinates(location);
      if (coordinates) {
        console.log(`Using default coordinates for ${location}:`, coordinates);
        return coordinates;
      }
      
      throw new Error("No results found for the provided location");
    }
    
    const result = data.results[0];
    const coordinates: GeoCoordinates = {
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng
    };
    
    console.log(`Successfully geocoded ${location} to:`, coordinates);
    return coordinates;
  } catch (error) {
    console.error('Error geocoding location:', error);
    
    // Final attempt with our internal database
    const coordinates = getDefaultCoordinates(location);
    if (coordinates) {
      console.log(`Fallback: Using default coordinates for ${location}:`, coordinates);
      return coordinates;
    }
    
    // If everything fails, return a default location (UTC/Greenwich)
    console.warn("Could not determine location, using Greenwich as default");
    return {
      latitude: 51.4769,
      longitude: 0
    };
  }
}

// Internal database of common locations for fallback
function getDefaultCoordinates(location: string): GeoCoordinates | null {
  // Normalize location string
  const normalizedLocation = location.toLowerCase().trim();
  
  // Basic mapping of common locations
  const locationMap: Record<string, GeoCoordinates> = {
    "london": { latitude: 51.5074, longitude: -0.1278 },
    "new york": { latitude: 40.7128, longitude: -74.0060 },
    "paris": { latitude: 48.8566, longitude: 2.3522 },
    "tokyo": { latitude: 35.6762, longitude: 139.6503 },
    "berlin": { latitude: 52.5200, longitude: 13.4050 },
    "los angeles": { latitude: 34.0522, longitude: -118.2437 },
    "chicago": { latitude: 41.8781, longitude: -87.6298 },
    "beijing": { latitude: 39.9042, longitude: 116.4074 },
    "sydney": { latitude: -33.8688, longitude: 151.2093 },
    "delhi": { latitude: 28.6139, longitude: 77.2090 },
    "mexico city": { latitude: 19.4326, longitude: -99.1332 },
    "cairo": { latitude: 30.0444, longitude: 31.2357 },
    "moscow": { latitude: 55.7558, longitude: 37.6173 },
    "istanbul": { latitude: 41.0082, longitude: 28.9784 },
    "dubai": { latitude: 25.2048, longitude: 55.2708 },
    "buenos aires": { latitude: -34.6037, longitude: -58.3816 },
    "bangkok": { latitude: 13.7563, longitude: 100.5018 },
    "singapore": { latitude: 1.3521, longitude: 103.8198 },
    "johannesburg": { latitude: -26.2041, longitude: 28.0473 },
    "toronto": { latitude: 43.6532, longitude: -79.3832 },
  };
  
  // Check for direct matches
  for (const [key, coords] of Object.entries(locationMap)) {
    if (normalizedLocation.includes(key)) {
      return coords;
    }
  }
  
  // Check for country matches and assign a default major city
  const countryMap: Record<string, GeoCoordinates> = {
    "usa": { latitude: 38.8977, longitude: -77.0365 }, // Washington DC
    "united states": { latitude: 38.8977, longitude: -77.0365 },
    "uk": { latitude: 51.5074, longitude: -0.1278 }, // London
    "united kingdom": { latitude: 51.5074, longitude: -0.1278 },
    "france": { latitude: 48.8566, longitude: 2.3522 }, // Paris
    "germany": { latitude: 52.5200, longitude: 13.4050 }, // Berlin
    "japan": { latitude: 35.6762, longitude: 139.6503 }, // Tokyo
    "china": { latitude: 39.9042, longitude: 116.4074 }, // Beijing
    "india": { latitude: 28.6139, longitude: 77.2090 }, // Delhi
    "australia": { latitude: -33.8688, longitude: 151.2093 }, // Sydney
    "canada": { latitude: 43.6532, longitude: -79.3832 }, // Toronto
    "spain": { latitude: 40.4168, longitude: -3.7038 }, // Madrid
  };
  
  for (const [key, coords] of Object.entries(countryMap)) {
    if (normalizedLocation.includes(key)) {
      return coords;
    }
  }
  
  return null;
}

// Get IANA timezone ID from coordinates using Google Maps Timezone API
async function getIanaTimezoneId(coordinates: GeoCoordinates, timestamp: number): Promise<string | null> {
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
      console.error("Timezone API error:", data.status, data.errorMessage);
      throw new Error(`Timezone API failed: ${data.status}`);
    }
    
    // Extract the timeZoneId which is an IANA timezone identifier
    console.log(`Retrieved IANA timezone: ${data.timeZoneId} for ${latitude},${longitude}`);
    return data.timeZoneId; // e.g., "America/New_York"
  } catch (error) {
    console.error("Error fetching timezone data:", error);
    return null;
  }
}

// Main function to calculate planetary positions with improved timezone handling
export async function calculatePlanetaryPositions(
  birthDate: string, 
  birthTime: string, 
  birthLocation: string,
  userTimezone: string
): Promise<CelestialData> {
  console.log(`Calculating positions for: ${birthDate} ${birthTime} at ${birthLocation} in timezone ${userTimezone}`);
  
  try {
    // Create a timestamp for timezone lookup
    let localTimestamp: number;
    try {
      localTimestamp = new Date(`${birthDate}T${birthTime || '12:00'}`).getTime() / 1000;
    } catch (e) {
      console.error("Error creating timestamp, using current time:", e);
      localTimestamp = Math.floor(Date.now() / 1000);
    }
    
    // Get geographic coordinates for the birth location
    const coordinates = await getGeoCoordinates(birthLocation);
    
    // Get the IANA timezone from coordinates
    let tzId = await getIanaTimezoneId(coordinates, localTimestamp);
    
    // If we couldn't get the IANA timezone from coordinates, try using the user-provided timezone
    if (!tzId) {
      console.log(`Could not determine timezone from coordinates, using user-provided timezone: ${userTimezone}`);
      tzId = userTimezone;
    }
    
    console.log(`Using IANA timezone: ${tzId}`);
    
    // Parse the birth date and time using Luxon with the timezone
    let localDateTime: DateTime;
    
    if (birthTime) {
      // If birth time is provided, use the full datetime
      localDateTime = DateTime.fromISO(`${birthDate}T${birthTime}`, { zone: tzId });
      if (!localDateTime.isValid) {
        console.error(`Invalid datetime: ${localDateTime.invalidReason}, ${localDateTime.invalidExplanation}`);
        // Fallback to noon if time parsing fails
        localDateTime = DateTime.fromISO(`${birthDate}T12:00`, { zone: tzId });
      }
    } else {
      // If no birth time, default to noon in the timezone
      localDateTime = DateTime.fromISO(`${birthDate}T12:00`, { zone: tzId });
    }
    
    // Convert local time to UTC
    const utcDateTime = localDateTime.toUTC();
    console.log(`Converted local time ${localDateTime.toString()} to UTC ${utcDateTime.toString()}`);
    
    // Calculate Julian day from UTC datetime
    const jd = calculateJulianDayFromDateTime(utcDateTime);
    console.log(`Calculated Julian day: ${jd}`);
    
    // Calculate celestial positions
    const celestialData = calculateCelestialPositions(jd, coordinates);
    
    return celestialData;
  } catch (error) {
    console.error('Error calculating planetary positions:', error);
    throw new Error(`Failed to calculate planetary positions: ${error.message}`);
  }
}

// Calculate Julian Day directly from Luxon DateTime
function calculateJulianDayFromDateTime(dt: DateTime): number {
  // Extract date components from Luxon DateTime
  const y = dt.year;
  const m = dt.month;
  const d = dt.day;
  const hour = dt.hour;
  const minute = dt.minute;
  const second = dt.second;
  
  // Calculate decimal day with time
  const decimalDay = d + (hour + minute/60 + second/3600) / 24;
  
  // Calculate Julian day using the improved algorithm
  let jd: number;
  
  if (m <= 2) {
    // If month is January or February, adjust year and month
    const y1 = y - 1;
    const m1 = m + 12;
    jd = Math.floor(365.25 * y1) + Math.floor(30.6001 * (m1 + 1)) + decimalDay + 1720981.5;
  } else {
    jd = Math.floor(365.25 * y) + Math.floor(30.6001 * (m + 1)) + decimalDay + 1720981.5;
  }
  
  // Gregorian calendar correction
  if (jd >= 2299160.5) {
    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);
    jd += b;
  }
  
  return jd;
}

// Calculate all celestial positions based on Julian Day
function calculateCelestialPositions(jd: number, coordinates: GeoCoordinates): CelestialData {
  const celestialData: CelestialData = {
    sun: calculateSunPosition(jd),
    moon: calculateMoonPosition(jd),
    mercury: simulatePlanetPosition(jd, 2),
    venus: simulatePlanetPosition(jd, 3),
    mars: simulatePlanetPosition(jd, 4),
    jupiter: simulatePlanetPosition(jd, 5),
    saturn: simulatePlanetPosition(jd, 6),
    uranus: simulatePlanetPosition(jd, 7),
    neptune: simulatePlanetPosition(jd, 8),
    pluto: simulatePlanetPosition(jd, 9),
    ascendant: calculateAscendant(jd, coordinates),
    mc: calculateMidheaven(jd, coordinates)
  };
  
  return celestialData;
}

// Calculate sun position using a simplified VSOP87 algorithm
function calculateSunPosition(jd: number): PlanetPosition {
  // Time in Julian centuries since J2000.0
  const T = (jd - 2451545.0) / 36525;
  
  // Mean longitude of the Sun
  let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  L0 = L0 % 360;
  if (L0 < 0) L0 += 360;
  
  // Mean anomaly of the Sun
  let M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  M = M % 360;
  if (M < 0) M += 360;
  
  // Convert to radians for trigonometric calculations
  const Mrad = M * Math.PI / 180;
  
  // Equation of center
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
            (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
            0.000289 * Math.sin(3 * Mrad);
  
  // True longitude of the Sun
  const sunLong = (L0 + C) % 360;
  
  // Calculate sign
  const sign = Math.floor(sunLong / 30) % 12;
  
  return {
    longitude: sunLong,
    latitude: 0, // The Sun is always on the ecliptic, so latitude is 0
    distance: 1, // Normalized to 1 AU
    speed: 1, // Average speed in degrees per day
    sign,
    house: calculateHouse(sunLong, 0) // placeholder for house calculation
  };
}

// Calculate Moon position using simplified ELP2000 algorithm
function calculateMoonPosition(jd: number): PlanetPosition {
  // Time in Julian centuries since J2000.0
  const T = (jd - 2451545.0) / 36525;
  
  // Mean longitude of the Moon
  let L = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841 - T * T * T * T / 14712000;
  L = L % 360;
  if (L < 0) L += 360;
  
  // Mean anomaly of the Moon
  let M = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699 - T * T * T * T / 14712000;
  M = M % 360;
  if (M < 0) M += 360;
  
  // Mean anomaly of the Sun
  let Ms = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T * T * T / 24490000;
  Ms = Ms % 360;
  if (Ms < 0) Ms += 360;
  
  // Moon's mean elongation from the Sun
  let D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T * T * T / 545868 - T * T * T * T / 113065000;
  D = D % 360;
  if (D < 0) D += 360;
  
  // Mean distance of the Moon from its ascending node
  let F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - T * T * T / 3526000 + T * T * T * T / 863310000;
  F = F % 360;
  if (F < 0) F += 360;
  
  // Convert to radians for trigonometric calculations
  const Mrad = M * Math.PI / 180;
  const Msrad = Ms * Math.PI / 180;
  const Drad = D * Math.PI / 180;
  const Frad = F * Math.PI / 180;
  
  // Simplified perturbations (ELP2000)
  let moonLong = L + 6.289 * Math.sin(Mrad) + 1.274 * Math.sin(2 * Drad - Mrad) +
                 0.658 * Math.sin(2 * Drad) + 0.213 * Math.sin(2 * Mrad) -
                 0.185 * Math.sin(Msrad) - 0.114 * Math.sin(2 * Frad);
                 
  let moonLat = 5.128 * Math.sin(Frad) + 0.281 * Math.sin(Mrad + Frad) +
                0.277 * Math.sin(Mrad - Frad) + 0.173 * Math.sin(2 * Drad - Frad) +
                0.055 * Math.sin(2 * Drad - Mrad + Frad) - 0.046 * Math.sin(2 * Drad - Mrad - Frad);
  
  // Ensure values are within range
  moonLong = moonLong % 360;
  if (moonLong < 0) moonLong += 360;
  
  // Calculate sign
  const sign = Math.floor(moonLong / 30) % 12;
  
  return {
    longitude: moonLong,
    latitude: moonLat,
    distance: 1, // Simplified distance
    speed: 13, // Average moon speed in degrees per day
    sign,
    house: calculateHouse(moonLong, moonLat) // placeholder house calculation
  };
}

// Simplified house calculation (placeholder)
function calculateHouse(longitude: number, latitude: number): number {
  // In a real implementation, we'd use the birth time and location
  // For now, we'll just use a simple calculation based on longitude
  return Math.floor(longitude / 30) + 1;
}

// Calculate Ascendant using birth time and location
function calculateAscendant(jd: number, coordinates: GeoCoordinates): PlanetPosition {
  // Time in Julian centuries since J2000.0
  const T = (jd - 2451545.0) / 36525;
  
  // Mean sidereal time at Greenwich
  let theta0 = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000;
  theta0 = theta0 % 360;
  if (theta0 < 0) theta0 += 360;
  
  // Local sidereal time
  let theta = theta0 + coordinates.longitude;
  theta = theta % 360;
  if (theta < 0) theta += 360;
  
  // Obliquity of the ecliptic
  const epsilon = 23.43929111 - 0.01300416667 * T - 0.00000016389 * T * T + 0.00000050361 * T * T * T;
  
  // Convert to radians
  const thetaRad = theta * Math.PI / 180;
  const epsilonRad = epsilon * Math.PI / 180;
  const latRad = coordinates.latitude * Math.PI / 180;
  
  // Calculate ascendant
  let ascendant = Math.atan2(Math.cos(thetaRad), Math.sin(thetaRad) * Math.cos(epsilonRad) + Math.tan(latRad) * Math.sin(epsilonRad));
  ascendant = ascendant * 180 / Math.PI;
  if (ascendant < 0) ascendant += 360;
  
  // Calculate sign
  const sign = Math.floor(ascendant / 30) % 12;
  
  return {
    longitude: ascendant,
    latitude: 0,
    distance: 1,
    speed: 0,
    sign,
    house: 1 // Ascendant is always the cusp of house 1
  };
}

// Calculate Midheaven (MC)
function calculateMidheaven(jd: number, coordinates: GeoCoordinates): PlanetPosition {
  // Time in Julian centuries since J2000.0
  const T = (jd - 2451545.0) / 36525;
  
  // Mean sidereal time at Greenwich
  let theta0 = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000;
  theta0 = theta0 % 360;
  if (theta0 < 0) theta0 += 360;
  
  // Local sidereal time
  let theta = theta0 + coordinates.longitude;
  theta = theta % 360;
  if (theta < 0) theta += 360;
  
  // Obliquity of the ecliptic
  const epsilon = 23.43929111 - 0.01300416667 * T - 0.00000016389 * T * T + 0.00000050361 * T * T * T;
  
  // Convert to radians
  const thetaRad = theta * Math.PI / 180;
  const epsilonRad = epsilon * Math.PI / 180;
  
  // Calculate midheaven
  let mc = Math.atan2(Math.sin(thetaRad), Math.cos(thetaRad) * Math.cos(epsilonRad));
  mc = mc * 180 / Math.PI;
  if (mc < 0) mc += 360;
  
  // Calculate sign
  const sign = Math.floor(mc / 30) % 12;
  
  return {
    longitude: mc,
    latitude: 0,
    distance: 1,
    speed: 0,
    sign,
    house: 10 // MC is always the cusp of house 10
  };
}

// Simulate other planetary positions
// In a full implementation, each planet would have its own calculation function
function simulatePlanetPosition(jd: number, planetIndex: number): PlanetPosition {
  // Generate a reproducible "random" value based on the JD and planetIndex
  const seed = (jd % 100) + planetIndex;
  
  // Generate a longitude in degrees (0-360)
  const longitude = (((seed * 9301 + 49297) % 233280) / 233280) * 360;
  
  // Generate a latitude in degrees (-8 to +8 for most planets)
  const latitude = (((seed * 7901 + 19273) % 233280) / 233280) * 16 - 8;
  
  // Calculate sign based on longitude
  const sign = Math.floor(longitude / 30) % 12;
  
  // Calculate house (simplified)
  const house = Math.floor(longitude / 30) % 12 + 1;
  
  return {
    longitude,
    latitude,
    distance: 1 + (seed % 5),
    speed: (((seed * 5701 + 12345) % 233280) / 233280) * 2 - 1, // between -1 and 1
    sign,
    house
  };
}
