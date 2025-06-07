
// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Calculate planetary positions using simplified astronomical calculations
function calculatePlanetaryPositions(datetime, coordinates) {
  const [lat, lon] = coordinates.split(',').map(Number);
  
  if (isNaN(lat) || isNaN(lon)) {
    throw new Error('Invalid coordinates format. Expected "lat,lon"');
  }

  const date = new Date(datetime);
  
  if (isNaN(date.getTime())) {
    throw new Error('Invalid datetime format');
  }

  console.log(`Calculating positions for ${datetime} at coordinates ${lat}, ${lon}`);

  // Calculate Julian Day Number
  const jd = calculateJulianDay(date);
  
  // Calculate positions for major celestial bodies using simplified formulas
  const ephemerisData = {};
  const bodies = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

  bodies.forEach(bodyName => {
    try {
      const position = calculateBodyPosition(bodyName, jd);
      
      ephemerisData[bodyName] = {
        longitude: position.longitude,
        latitude: position.latitude,
        distance: position.distance,
        speed: position.speed,
        right_ascension: position.ra || 0,
        declination: position.dec || 0
      };
      
      console.log(`${bodyName}: longitude ${position.longitude.toFixed(6)}°, latitude ${position.latitude.toFixed(6)}°`);
    } catch (error) {
      console.warn(`Error calculating position for ${bodyName}:`, error.message);
      ephemerisData[bodyName] = { error: error.message };
    }
  });

  return ephemerisData;
}

// Calculate Julian Day Number
function calculateJulianDay(date) {
  const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
  const y = date.getFullYear() + 4800 - a;
  const m = (date.getMonth() + 1) + 12 * a - 3;
  
  const jdn = date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  
  // Add time fraction
  const timeOfDay = (date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600) / 24;
  
  return jdn + timeOfDay - 0.5;
}

// Simplified planetary position calculations
function calculateBodyPosition(bodyName, jd) {
  // Time since J2000.0 in centuries
  const T = (jd - 2451545.0) / 36525;
  
  switch (bodyName.toLowerCase()) {
    case 'sun':
      return calculateSunPosition(T);
    case 'moon':
      return calculateMoonPosition(T);
    case 'mercury':
      return calculatePlanetPosition(T, 0.387098, 87.969, 48.331, 7.005, 29.124, 174.795);
    case 'venus':
      return calculatePlanetPosition(T, 0.723332, 224.701, 76.680, 3.395, 54.884, 50.115);
    case 'mars':
      return calculatePlanetPosition(T, 1.523679, 686.980, 49.558, 1.850, 286.502, 19.373);
    case 'jupiter':
      return calculatePlanetPosition(T, 5.204267, 4332.589, 100.464, 1.303, 273.867, 20.020);
    case 'saturn':
      return calculatePlanetPosition(T, 9.582017, 10759.22, 113.665, 2.485, 339.391, 317.020);
    case 'uranus':
      return calculatePlanetPosition(T, 19.20184, 30688.5, 74.006, 0.773, 96.998, 142.238);
    case 'neptune':
      return calculatePlanetPosition(T, 30.04778, 60182, 131.784, 1.770, 272.8461, 256.228);
    case 'pluto':
      return calculatePlanetPosition(T, 39.4821, 90560, 110.299, 17.140, 113.834, 14.164);
    default:
      throw new Error(`Unknown celestial body: ${bodyName}`);
  }
}

// Calculate Sun position
function calculateSunPosition(T) {
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * Math.PI / 180) +
            (0.019993 - 0.000101 * T) * Math.sin(2 * M * Math.PI / 180) +
            0.000289 * Math.sin(3 * M * Math.PI / 180);
  
  const longitude = (L0 + C) % 360;
  
  return {
    longitude: longitude < 0 ? longitude + 360 : longitude,
    latitude: 0,
    distance: 1.000001018 * (1 - 0.01671123 * Math.cos(M * Math.PI / 180)),
    speed: 0.9856,
    ra: longitude,
    dec: 0
  };
}

// Calculate Moon position
function calculateMoonPosition(T) {
  const L = 218.3164477 + 481267.88123421 * T;
  const D = 297.8501921 + 445267.1114034 * T;
  const M = 357.5291092 + 35999.0502909 * T;
  const Mp = 134.9633964 + 477198.8675055 * T;
  const F = 93.2720950 + 483202.0175233 * T;
  
  const longitude = (L + 6.289 * Math.sin(Mp * Math.PI / 180) + 
                   1.274 * Math.sin((2 * D - Mp) * Math.PI / 180) +
                   0.658 * Math.sin(2 * D * Math.PI / 180)) % 360;
  
  const latitude = 5.128 * Math.sin(F * Math.PI / 180) +
                   0.281 * Math.sin((Mp + F) * Math.PI / 180);
  
  return {
    longitude: longitude < 0 ? longitude + 360 : longitude,
    latitude: latitude,
    distance: 385000.56,
    speed: 13.2,
    ra: longitude,
    dec: latitude
  };
}

// Generic planet position calculation
function calculatePlanetPosition(T, a, period, node, incl, peri, epoch) {
  const n = 360 / period; // Mean daily motion
  const M = (n * T * 36525 + epoch) % 360; // Mean anomaly
  
  // Simple elliptical orbit approximation
  const E = M + (180 / Math.PI) * 0.01671123 * Math.sin(M * Math.PI / 180);
  
  const longitude = (E + peri + node) % 360;
  const latitude = incl * Math.sin((E + peri) * Math.PI / 180);
  
  return {
    longitude: longitude < 0 ? longitude + 360 : longitude,
    latitude: latitude,
    distance: a,
    speed: n,
    ra: longitude,
    dec: latitude
  };
}

// This is the main serverless function handler.
export default async function handler(req, res) {
  // Set CORS headers to allow your Supabase app to call this API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight CORS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { datetime, coordinates } = req.body;
    
    if (!datetime || !coordinates) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: datetime and coordinates' 
      });
    }

    console.log(`Processing request for datetime: ${datetime}, coordinates: ${coordinates}`);
    
    // Calculate ephemeris data using simplified astronomical calculations
    const ephemerisData = calculatePlanetaryPositions(datetime, coordinates);

    console.log('Ephemeris calculation completed successfully');

    // Send the successful JSON response
    res.status(200).json({ 
      success: true, 
      data: ephemerisData,
      metadata: {
        calculated_at: new Date().toISOString(),
        coordinates: coordinates,
        engine: 'simplified-astronomy',
        debug_info: {
          engine_version: 'simplified-astronomy v1.0',
          runtime: 'vercel-serverless',
          bodies_calculated: Object.keys(ephemerisData)
        }
      }
    });

  } catch (error) {
    console.error('Ephemeris calculation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error during ephemeris calculation',
      engine: 'simplified-astronomy'
    });
  }
}
