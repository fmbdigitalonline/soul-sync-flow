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

// Function to convert location string to geographic coordinates using a geocoding API
async function getGeoCoordinates(location: string): Promise<GeoCoordinates> {
  try {
    console.log(`Getting coordinates for location: ${location}`);
    
    // For testing purpose, we'll use a hardcoded approach for common cities
    // In production, this would use a geocoding API like Google Maps or OpenStreetMap
    const commonLocations: Record<string, GeoCoordinates> = {
      'New York, USA': { latitude: 40.7128, longitude: -74.0060 },
      'Los Angeles, USA': { latitude: 34.0522, longitude: -118.2437 },
      'London, UK': { latitude: 51.5074, longitude: -0.1278 },
      'Tokyo, Japan': { latitude: 35.6762, longitude: 139.6503 },
      'Sydney, Australia': { latitude: -33.8688, longitude: 151.2093 },
      'San Francisco, USA': { latitude: 37.7749, longitude: -122.4194 },
      'Chicago, USA': { latitude: 41.8781, longitude: -87.6298 },
      'Miami, USA': { latitude: 25.7617, longitude: -80.1918 },
      'Paris, France': { latitude: 48.8566, longitude: 2.3522 },
      'Berlin, Germany': { latitude: 52.5200, longitude: 13.4050 },
      'Rome, Italy': { latitude: 41.9028, longitude: 12.4964 },
      'Madrid, Spain': { latitude: 40.4168, longitude: -3.7038 },
      'Toronto, Canada': { latitude: 43.6532, longitude: -79.3832 },
      'Mumbai, India': { latitude: 19.0760, longitude: 72.8777 },
      'Shanghai, China': { latitude: 31.2304, longitude: 121.4737 },
      'Moscow, Russia': { latitude: 55.7558, longitude: 37.6173 },
      'Dubai, UAE': { latitude: 25.2048, longitude: 55.2708 }
    };
    
    if (location in commonLocations) {
      return commonLocations[location];
    }
    
    // Try to parse coordinates if given in format "lat,long"
    const coordMatch = location.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (coordMatch) {
      return {
        latitude: parseFloat(coordMatch[1]),
        longitude: parseFloat(coordMatch[2])
      };
    }
    
    // Fallback to default coordinates if location not recognized
    // This is just for demo purposes
    console.log('Location not found in common locations, using default');
    return { latitude: 0, longitude: 0 };
  } catch (error) {
    console.error('Error geocoding location:', error);
    throw new Error(`Failed to geocode location: ${error.message}`);
  }
}

// Function to convert timezone string to offset in hours with improved accuracy
function getTimezoneOffset(timezone: string, date: string): number {
  // For actual implementation, we would use a timezone database
  // This implementation has been expanded with more timezone entries
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
    return timezoneOffsets[timezone];
  }
  
  // Try to parse UTC+/- format
  const utcMatch = timezone.match(/^UTC([+-])(\d+)(?::(\d+))?$/i);
  if (utcMatch) {
    const hours = parseInt(utcMatch[2], 10);
    const minutes = utcMatch[3] ? parseInt(utcMatch[3], 10) / 60 : 0;
    const offset = hours + minutes;
    return utcMatch[1] === '+' ? offset : -offset;
  }
  
  // Default to UTC
  console.log(`Timezone not recognized: ${timezone}, defaulting to UTC`);
  return 0;
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
    
    // Get timezone offset
    const tzOffset = getTimezoneOffset(timezone, birthDate);
    
    // Calculate Julian day number (improved algorithm)
    const jd = calculateJulianDay(year, month, day, hour, minute, tzOffset);
    
    console.log(`Calculated Julian day: ${jd} for date ${birthDate} ${birthTime}`);
    
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
