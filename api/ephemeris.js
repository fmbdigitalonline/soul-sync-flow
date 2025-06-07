
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

  // Calculate lunar nodes
  const lunarNodes = calculateLunarNodes(jd);
  ephemerisData.north_node = {
    longitude: lunarNodes.northNode,
    latitude: 0,
    distance: 0,
    speed: -0.053,
    right_ascension: lunarNodes.northNode,
    declination: 0
  };
  ephemerisData.south_node = {
    longitude: lunarNodes.southNode,
    latitude: 0,
    distance: 0,
    speed: -0.053,
    right_ascension: lunarNodes.southNode,
    declination: 0
  };

  // Calculate aspects between planets
  const aspects = calculateAspects(ephemerisData);

  // Calculate astrological houses
  const houses = calculateHouses(jd, lat, lon, ephemerisData);

  return {
    planets: ephemerisData,
    aspects: aspects,
    houses: houses
  };
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

// Calculate lunar nodes
function calculateLunarNodes(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  
  // Mean longitude of ascending node in degrees
  let meanAscendingNode = 125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + T * T * T / 467441.0 - T * T * T * T / 60616000.0;
  
  // Normalize to 0-360 degrees
  meanAscendingNode = meanAscendingNode % 360;
  if (meanAscendingNode < 0) meanAscendingNode += 360;
  
  const northNode = meanAscendingNode;
  const southNode = (northNode + 180) % 360;
  
  console.log(`Calculated North Node: ${northNode.toFixed(6)}°, South Node: ${southNode.toFixed(6)}°`);
  
  return {
    northNode: northNode,
    southNode: southNode
  };
}

// Calculate aspects between planets
function calculateAspects(ephemerisData) {
  const aspects = [];
  const aspectOrbs = {
    conjunction: { degrees: 0, orb: 8 },
    opposition: { degrees: 180, orb: 8 },
    trine: { degrees: 120, orb: 8 },
    square: { degrees: 90, orb: 8 },
    sextile: { degrees: 60, orb: 6 },
    quincunx: { degrees: 150, orb: 3 },
    semisextile: { degrees: 30, orb: 3 }
  };

  const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'north_node'];
  
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i];
      const planet2 = planets[j];
      
      const pos1 = ephemerisData[planet1];
      const pos2 = ephemerisData[planet2];
      
      if (pos1 && pos2 && pos1.longitude !== undefined && pos2.longitude !== undefined) {
        let angleDiff = Math.abs(pos1.longitude - pos2.longitude);
        if (angleDiff > 180) angleDiff = 360 - angleDiff;
        
        for (const [aspectName, aspectData] of Object.entries(aspectOrbs)) {
          const targetAngle = aspectData.degrees;
          const orb = aspectData.orb;
          
          if (Math.abs(angleDiff - targetAngle) <= orb) {
            const exactness = Math.abs(angleDiff - targetAngle);
            const strength = ((orb - exactness) / orb) * 100;
            
            aspects.push({
              planet1: planet1,
              planet2: planet2,
              aspect: aspectName,
              angle: angleDiff,
              exactness: exactness,
              strength: Math.round(strength * 100) / 100,
              applying: pos1.speed > pos2.speed
            });
            break;
          }
        }
      }
    }
  }
  
  console.log(`Calculated ${aspects.length} aspects`);
  return aspects;
}

// Calculate astrological houses using Placidus system
function calculateHouses(jd, latitude, longitude, ephemerisData) {
  try {
    // Calculate Local Sidereal Time
    const lst = calculateLocalSiderealTime(jd, longitude);
    
    // Calculate RAMC (Right Ascension of Medium Coeli)
    const ramc = (lst * 15) % 360;
    
    // Calculate Ascendant
    const ascendant = calculateAscendant(ramc, latitude);
    
    // Medium Coeli (Midheaven) is the RAMC
    const midheaven = ramc;
    
    // Calculate house cusps using simplified Placidus system
    const houses = calculatePlacidusHouses(ascendant, midheaven);
    
    // Add planets to houses
    const housesWithPlanets = assignPlanetsToHouses(houses, ephemerisData);
    
    console.log(`Calculated houses - ASC: ${ascendant.toFixed(2)}°, MC: ${midheaven.toFixed(2)}°`);
    
    return {
      houses: housesWithPlanets,
      ascendant: ascendant,
      midheaven: midheaven,
      descendant: (ascendant + 180) % 360,
      ic: (midheaven + 180) % 360
    };
  } catch (error) {
    console.error("Error calculating houses:", error);
    return { error: error.message };
  }
}

function calculateLocalSiderealTime(jd, longitude) {
  const T = (jd - 2451545.0) / 36525.0;
  
  // Mean sidereal time at Greenwich (in hours)
  let gst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000.0;
  
  // Normalize to 0-360 degrees
  gst = gst % 360;
  if (gst < 0) gst += 360;
  
  // Convert to hours and add longitude correction
  const gstHours = gst / 15.0;
  const longitudeHours = longitude / 15.0;
  
  let lst = gstHours + longitudeHours;
  
  // Normalize to 0-24 hours
  lst = lst % 24;
  if (lst < 0) lst += 24;
  
  return lst;
}

function calculateAscendant(ramc, latitude) {
  const ramcRad = ramc * Math.PI / 180;
  const latRad = latitude * Math.PI / 180;
  
  // Obliquity of ecliptic
  const obliquity = 23.439291 * Math.PI / 180;
  
  // Calculate Ascendant
  const y = -Math.cos(ramcRad);
  const x = Math.sin(ramcRad) * Math.cos(obliquity) + Math.tan(latRad) * Math.sin(obliquity);
  
  let ascendant = Math.atan2(y, x) * 180 / Math.PI;
  
  // Normalize to 0-360 degrees
  ascendant = (ascendant + 360) % 360;
  
  return ascendant;
}

function calculatePlacidusHouses(ascendant, midheaven) {
  const houses = [];
  
  // Calculate house cusps (simplified Placidus)
  houses[0] = { cusp: 1, longitude: ascendant };
  houses[9] = { cusp: 10, longitude: midheaven };
  
  const ic = (midheaven + 180) % 360;
  const descendant = (ascendant + 180) % 360;
  
  houses[3] = { cusp: 4, longitude: ic };
  houses[6] = { cusp: 7, longitude: descendant };
  
  // Calculate intermediate house cusps
  const firstQuadrant = (midheaven - ascendant + 360) % 360;
  houses[1] = { cusp: 2, longitude: (ascendant + firstQuadrant / 3) % 360 };
  houses[2] = { cusp: 3, longitude: (ascendant + 2 * firstQuadrant / 3) % 360 };
  
  const secondQuadrant = (descendant - ic + 360) % 360;
  houses[4] = { cusp: 5, longitude: (ic + secondQuadrant / 3) % 360 };
  houses[5] = { cusp: 6, longitude: (ic + 2 * secondQuadrant / 3) % 360 };
  
  const thirdQuadrant = (ic - descendant + 360) % 360;
  houses[7] = { cusp: 8, longitude: (descendant + thirdQuadrant / 3) % 360 };
  houses[8] = { cusp: 9, longitude: (descendant + 2 * thirdQuadrant / 3) % 360 };
  
  const fourthQuadrant = (ascendant - midheaven + 360) % 360;
  houses[10] = { cusp: 11, longitude: (midheaven + fourthQuadrant / 3) % 360 };
  houses[11] = { cusp: 12, longitude: (midheaven + 2 * fourthQuadrant / 3) % 360 };
  
  return houses;
}

function assignPlanetsToHouses(houses, ephemerisData) {
  const housesWithPlanets = houses.map(house => ({ ...house, planets: [] }));
  
  const planets = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto", "north_node", "south_node"];
  
  planets.forEach(planet => {
    const position = ephemerisData[planet];
    if (position && typeof position.longitude === 'number') {
      const houseIndex = findHouseForLongitude(position.longitude, houses);
      if (houseIndex >= 0 && houseIndex < housesWithPlanets.length) {
        housesWithPlanets[houseIndex].planets.push({
          name: planet,
          longitude: position.longitude
        });
      }
    }
  });
  
  return housesWithPlanets;
}

function findHouseForLongitude(longitude, houses) {
  for (let i = 0; i < houses.length; i++) {
    const currentHouse = houses[i].longitude;
    const nextHouse = houses[(i + 1) % houses.length].longitude;
    
    // Handle crossing 0 degrees
    if (currentHouse > nextHouse) {
      if (longitude >= currentHouse || longitude < nextHouse) {
        return i;
      }
    } else {
      if (longitude >= currentHouse && longitude < nextHouse) {
        return i;
      }
    }
  }
  
  return 0; // Default to first house
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
    
    // Calculate complete ephemeris data including lunar nodes, aspects, and houses
    const ephemerisData = calculatePlanetaryPositions(datetime, coordinates);

    console.log('Complete ephemeris calculation completed successfully');

    // Send the successful JSON response
    res.status(200).json({ 
      success: true, 
      data: ephemerisData,
      metadata: {
        calculated_at: new Date().toISOString(),
        coordinates: coordinates,
        engine: 'complete-astrology-engine',
        features: ['planetary_positions', 'lunar_nodes', 'aspects', 'houses'],
        debug_info: {
          engine_version: 'complete-astrology-engine v1.0',
          runtime: 'vercel-serverless',
          planets_calculated: Object.keys(ephemerisData.planets || {}),
          aspects_found: ephemerisData.aspects?.length || 0,
          houses_calculated: ephemerisData.houses?.houses?.length || 0
        }
      }
    });

  } catch (error) {
    console.error('Ephemeris calculation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error during ephemeris calculation',
      engine: 'complete-astrology-engine'
    });
  }
}
