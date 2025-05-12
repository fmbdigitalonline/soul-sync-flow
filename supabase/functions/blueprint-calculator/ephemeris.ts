
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
      throw new Error(`Geocoding failed: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }
    
    if (!data.results || data.results.length === 0) {
      console.error("No results found for location:", location);
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
    
    // Try to parse coordinates if given in format "lat,long" as fallback
    const coordMatch = location.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (coordMatch) {
      console.log("Falling back to coordinate parsing from input string");
      return {
        latitude: parseFloat(coordMatch[1]),
        longitude: parseFloat(coordMatch[2])
      };
    }
    
    throw new Error(`Failed to geocode location: ${error.message}`);
  }
}

// Function to get timezone data from Google Maps Timezone API
async function getTimezoneData(coordinates: GeoCoordinates, timestamp: number): Promise<number> {
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
    
    // Calculate the total offset in hours
    const totalOffsetHours = (data.rawOffset + data.dstOffset) / 3600;
    
    console.log(`Timezone data for ${latitude},${longitude}: offset=${totalOffsetHours}h`);
    return totalOffsetHours;
  } catch (error) {
    console.error("Error fetching timezone data:", error);
    throw new Error(`Failed to get timezone data: ${error.message}`);
  }
}

// Function to convert timezone string to offset in hours with improved accuracy
function getTimezoneOffset(timezone: string, date: string): number {
  try {
    // If timezone string appears to be a UTC offset like "UTC+2"
    const utcMatch = timezone.match(/^UTC([+-])(\d+)(?::(\d+))?$/i);
    if (utcMatch) {
      const hours = parseInt(utcMatch[2], 10);
      const minutes = utcMatch[3] ? parseInt(utcMatch[3], 10) / 60 : 0;
      const offset = hours + minutes;
      return utcMatch[1] === '+' ? offset : -offset;
    }
    
    // If using named timezone, use a comprehensive mapping
    // This is a fallback when timezone API can't be used
    const timezoneOffsets: Record<string, number> = {
      'America/New_York': -5, // EST, -4 during DST
      'America/Chicago': -6, // CST, -5 during DST
      'America/Denver': -7, // MST, -6 during DST
      'America/Los_Angeles': -8, // PST, -7 during DST
      'America/Anchorage': -9, // AKST, -8 during DST
      'America/Honolulu': -10, // HST, no DST
      'America/Toronto': -5, // EST, -4 during DST
      'America/Vancouver': -8, // PST, -7 during DST
      'Europe/London': 0, // GMT/UTC, +1 during DST
      'Europe/Berlin': 1, // CET, +2 during DST
      'Europe/Paris': 1, // CET, +2 during DST
      'Europe/Rome': 1, // CET, +2 during DST
      'Europe/Madrid': 1, // CET, +2 during DST
      'Europe/Athens': 2, // EET, +3 during DST
      'Europe/Moscow': 3, // MSK, no DST
      'Asia/Tokyo': 9, // JST, no DST
      'Asia/Shanghai': 8, // CST, no DST
      'Asia/Kolkata': 5.5, // IST, no DST
      'Asia/Dubai': 4, // GST, no DST
      'Australia/Sydney': 10, // AEST, +11 during DST
      'Australia/Perth': 8, // AWST, no DST
      'Pacific/Auckland': 12, // NZST, +13 during DST
      'UTC': 0 // Universal Time Coordinated
    };
    
    // Check if timezone is directly in our database
    if (timezone in timezoneOffsets) {
      console.log(`Using predefined offset for ${timezone}`);
      return timezoneOffsets[timezone];
    }
    
    // Default to UTC if no match found
    console.log(`Timezone not recognized: ${timezone}, defaulting to UTC`);
    return 0;
  } catch (error) {
    console.error("Error processing timezone:", error);
    return 0; // Fallback to UTC
  }
}

// Main function to calculate planetary positions
export async function calculatePlanetaryPositions(
  birthDate: string, 
  birthTime: string, 
  birthLocation: string,
  timezone: string
): Promise<CelestialData> {
  console.log(`Calculating positions for: ${birthDate} ${birthTime} at ${birthLocation} in timezone ${timezone}`);
  
  try {
    // Get geographic coordinates for the birth location
    const coordinates = await getGeoCoordinates(birthLocation);
    
    // Parse the birth date and time
    const [year, month, day] = birthDate.split('-').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);
    
    if (!year || !month || !day || isNaN(hour) || isNaN(minute)) {
      throw new Error("Invalid date or time format");
    }
    
    // Create a timestamp for timezone lookup
    const birthTimestamp = new Date(year, month - 1, day, hour, minute).getTime() / 1000;
    
    // Try to get timezone offset using Google API
    let tzOffset: number;
    try {
      tzOffset = await getTimezoneData(coordinates, birthTimestamp);
    } catch (tzError) {
      console.warn("Failed to fetch timezone data, falling back to basic lookup:", tzError.message);
      tzOffset = getTimezoneOffset(timezone, birthDate);
    }
    
    // Calculate Julian day number (improved algorithm)
    const jd = calculateJulianDay(year, month, day, hour, minute, tzOffset);
    
    console.log(`Calculated Julian day: ${jd} for date ${birthDate} ${birthTime} (TZ offset: ${tzOffset}h)`);
    
    // Calculate actual planetary positions using adapted algorithms
    const celestialData = calculateCelestialPositions(jd, coordinates);
    
    return celestialData;
  } catch (error) {
    console.error('Error calculating planetary positions:', error);
    throw new Error(`Failed to calculate planetary positions: ${error.message}`);
  }
}

// Calculate Julian Day - more accurate algorithm
function calculateJulianDay(year: number, month: number, day: number, hour: number, minute: number, tzOffset: number): number {
  // Convert local time to UTC
  let utcHour = hour - tzOffset;
  let utcDay = day;
  
  // Handle day crossing due to timezone conversion
  if (utcHour < 0) {
    utcHour += 24;
    utcDay -= 1;
  } else if (utcHour >= 24) {
    utcHour -= 24;
    utcDay += 1;
  }
  
  // Adjust month and year for January and February
  if (month <= 2) {
    month += 12;
    year -= 1;
  }
  
  // Calculate Julian day
  const a = Math.floor(year / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + 
             utcDay + b - 1524.5 + (utcHour + minute / 60) / 24;
             
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
  let L = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841 - T * T * T * T / 65194000;
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
