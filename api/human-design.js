// Human Design calculation endpoint using proper HD methodology with dual ephemeris calls
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { birthDate, birthTime, birthLocation, timezone, celestialData, coordinates } = req.body;

    console.log('Human Design calculation request:', {
      birthDate,
      birthTime,
      birthLocation,
      timezone,
      coordinates
    });

    // Validate required data
    if (!birthDate || !birthTime || !birthLocation || !coordinates) {
      return res.status(400).json({
        error: 'Missing required data: birthDate, birthTime, birthLocation, and coordinates are required'
      });
    }

    console.log(`✅ Using provided coordinates: ${coordinates}`);

    // Calculate Human Design using proper dual ephemeris approach
    const humanDesignResult = await calculateHumanDesignProper({
      birthDate,
      birthTime,
      birthLocation,
      timezone,
      coordinates
    });

    return res.status(200).json({
      success: true,
      data: humanDesignResult,
      timestamp: new Date().toISOString(),
      library: 'proper-hd-methodology-v10-dual-ephemeris',
      notice: 'Using proper Human Design calculation with dual ephemeris calls'
    });

  } catch (error) {
    console.error('Human Design calculation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Human Design calculation failed',
      timestamp: new Date().toISOString()
    });
  }
}

// CORRECTED: Proper Human Design calculation using TWO ephemeris calls
async function calculateHumanDesignProper({ birthDate, birthTime, birthLocation, timezone, coordinates }) {
  console.log('Using proper Human Design methodology with dual ephemeris calls...');
  
  // Step 1: Calculate Design Time (88.736 days before birth)
  const birthDateTime = new Date(`${birthDate}T${birthTime}`);
  const designDateTime = new Date(birthDateTime.getTime() - (88.736 * 24 * 60 * 60 * 1000));
  
  console.log('Birth time:', birthDateTime.toISOString());
  console.log('Design time:', designDateTime.toISOString());
  
  // Step 2: Make TWO separate ephemeris calls
  console.log('🔍 Making ephemeris call for PERSONALITY (birth) time...');
  const personalityCelestial = await getEphemerisData(
    birthDateTime,
    birthLocation,
    timezone,
    coordinates,
    'personality'
  );
  
  console.log('🔍 Making ephemeris call for DESIGN time...');
  const designCelestial = await getEphemerisData(
    designDateTime,
    birthLocation,
    timezone,
    coordinates,
    'design'
  );
  
  // CRITICAL DEBUG: Check what we actually got
  console.log('[DEBUG] personalityCelestial keys:', Object.keys(personalityCelestial || {}));
  console.log('[DEBUG] personalityCelestial.sun:', personalityCelestial?.sun);
  console.log('[DEBUG] designCelestial keys:', Object.keys(designCelestial || {}));
  console.log('[DEBUG] designCelestial.sun:', designCelestial?.sun);
  
  // Step 3: Validate both celestial data sets
  validateCelestialData(personalityCelestial, 'personality');
  validateCelestialData(designCelestial, 'design');
  
  // Step 4: Calculate gates using proper HD methodology
  console.log('🔍 Calculating personality gates from actual ephemeris data...');
  console.log('[DEBUG] Passing personalityCelestial to gates:', personalityCelestial);
  const personalityGates = calculateHDGatesFromCelestialData(personalityCelestial, 'personality');
  
  console.log('🔍 Calculating design gates from actual ephemeris data...');
  console.log('[DEBUG] Passing designCelestial to gates:', designCelestial);
  const designGates = calculateHDGatesFromCelestialData(designCelestial, 'design');
  
  console.log('Personality gates calculated:', personalityGates);
  console.log('Design gates calculated:', designGates);
  
  // Step 5: Determine centers based on proper channel definitions
  const centers = calculateCentersFromChannels([...personalityGates, ...designGates]);
  
  // Step 6: Calculate type, profile, authority using proper HD rules
  const type = determineHDType(centers);
  const profile = calculateHDProfile(personalityGates[0], personalityGates[1]); // Sun and Earth
  const authority = determineHDAuthority(centers);
  
  return {
    type,
    profile,
    authority,
    strategy: getStrategyForType(type),
    definition: calculateDefinition(centers),
    not_self_theme: getNotSelfThemeForType(type),
    life_purpose: generateLifePurpose(type, profile, authority),
    centers,
    gates: {
      unconscious_design: designGates.map(g => `${g.gate}.${g.line}`),
      conscious_personality: personalityGates.map(g => `${g.gate}.${g.line}`)
    },
    metadata: {
      personality_time: birthDateTime.toISOString(),
      design_time: designDateTime.toISOString(),
      offset_days: "88.736",
      calculation_method: "PROPER_HD_METHODOLOGY_V10_DUAL_EPHEMERIS"
    }
  };
}

// FIXED: Get ephemeris data for a specific date/time using external API
async function getEphemerisData(dateTime, location, timezone, coordinates, calculationType) {
  console.log(`🔍 Getting ${calculationType} ephemeris data for:`, dateTime.toISOString());
  
  // Format date and time for the API call
  const year = dateTime.getFullYear();
  const month = String(dateTime.getMonth() + 1).padStart(2, '0');
  const day = String(dateTime.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  
  const hours = String(dateTime.getHours()).padStart(2, '0');
  const minutes = String(dateTime.getMinutes()).padStart(2, '0');
  const formattedTime = `${hours}:${minutes}`;
  
  console.log(`📅 ${calculationType} API call: ${formattedDate} ${formattedTime}`);
  
  try {
    // Call the same ephemeris API endpoint but with the specific date/time
    const ephemerisUrl = 'https://soul-sync-flow.vercel.app/api/ephemeris';
    
    const response = await fetch(ephemerisUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        datetime: `${formattedDate}T${formattedTime}:00.000Z`,
        coordinates: coordinates
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ ${calculationType} ephemeris API error:`, response.status, errorText);
      throw new Error(`Ephemeris API failed for ${calculationType}: ${response.status} ${errorText}`);
    }
    
    const ephemerisResult = await response.json();
    console.log(`✅ ${calculationType} ephemeris API response received`);
    
    if (!ephemerisResult.success) {
      throw new Error(`Ephemeris calculation failed for ${calculationType}: ${ephemerisResult.error}`);
    }
    
    // CRITICAL FIX: Handle different API response structures
    let celestialData;
    
    if (ephemerisResult.data && ephemerisResult.data.planets) {
      celestialData = ephemerisResult.data.planets;
      console.log(`[DEBUG] Using ephemerisResult.data.planets for ${calculationType}`);
    } else if (ephemerisResult.data && typeof ephemerisResult.data.sun === 'object') {
      celestialData = ephemerisResult.data;
      console.log(`[DEBUG] Using ephemerisResult.data directly for ${calculationType}`);
    } else {
      console.error(`[DEBUG] Raw ephemeris response for ${calculationType}:`, JSON.stringify(ephemerisResult, null, 2));
      throw new Error(`No valid planetary data in ephemeris response for ${calculationType}!`);
    }
    
    // CRITICAL DEBUG: Log what we extracted
    console.log(`[DEBUG] ${calculationType} celestialData keys:`, Object.keys(celestialData || {}));
    console.log(`[DEBUG] ${calculationType} celestialData.sun:`, celestialData?.sun);
    console.log(`[DEBUG] ${calculationType} celestialData.moon:`, celestialData?.moon);
    
    if (!celestialData) {
      throw new Error(`No celestial data returned for ${calculationType}`);
    }
    
    // Validate we have the essential data
    if (!celestialData.sun || typeof celestialData.sun.longitude !== 'number') {
      throw new Error(`Invalid sun data for ${calculationType}: ${JSON.stringify(celestialData.sun)}`);
    }
    
    if (!celestialData.moon || typeof celestialData.moon.longitude !== 'number') {
      throw new Error(`Invalid moon data for ${calculationType}: ${JSON.stringify(celestialData.moon)}`);
    }
    
    console.log(`✅ ${calculationType} celestial data extracted successfully`);
    console.log(`🌟 ${calculationType} Sun longitude:`, celestialData.sun?.longitude);
    console.log(`🌙 ${calculationType} Moon longitude:`, celestialData.moon?.longitude);
    
    return celestialData;
    
  } catch (error) {
    console.error(`❌ Error getting ${calculationType} ephemeris data:`, error);
    throw new Error(`Failed to get ${calculationType} ephemeris data: ${error.message}`);
  }
}

// ENHANCED: Validate celestial data with comprehensive checks
function validateCelestialData(celestialData, type) {
  console.log(`🔍 Validating ${type} celestial data...`);
  
  if (!celestialData || typeof celestialData !== 'object') {
    throw new Error(`Invalid ${type} celestial data - expected object, got: ${typeof celestialData}`);
  }
  
  // Check for essential planets
  const requiredPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  const missingPlanets = [];
  const invalidPlanets = [];
  
  requiredPlanets.forEach(planet => {
    if (!celestialData[planet]) {
      missingPlanets.push(planet);
    } else if (typeof celestialData[planet] !== 'object' || typeof celestialData[planet].longitude !== 'number') {
      invalidPlanets.push(`${planet}: ${JSON.stringify(celestialData[planet])}`);
    }
  });
  
  if (missingPlanets.length > 0) {
    console.error(`❌ Missing essential ${type} planetary data:`, missingPlanets);
    console.error(`❌ Available ${type} planets:`, Object.keys(celestialData));
    throw new Error(`Missing essential ${type} planetary data for: ${missingPlanets.join(', ')}`);
  }
  
  if (invalidPlanets.length > 0) {
    console.error(`❌ Invalid ${type} planetary data format:`, invalidPlanets);
    throw new Error(`Invalid ${type} planetary data format for: ${invalidPlanets.join(', ')}`);
  }
  
  console.log(`✅ ${type} celestial data validation passed`);
}

// Calculate HD gates from celestial data using proper methodology
function calculateHDGatesFromCelestialData(celestialData, type) {
  console.log(`🔍 Calculating ${type} gates from celestial data...`);
  console.log(`[DEBUG] celestialData in calculateHDGatesFromCelestialData:`, celestialData);
  
  // CRITICAL: Validate input immediately
  if (!celestialData.sun || typeof celestialData.sun.longitude !== 'number') {
    throw new Error(`Celestial data missing or invalid: sun.longitude is not a number for ${type}. Got: ${JSON.stringify(celestialData.sun)}`);
  }
  
  if (!celestialData.moon || typeof celestialData.moon.longitude !== 'number') {
    throw new Error(`Celestial data missing or invalid: moon.longitude is not a number for ${type}. Got: ${JSON.stringify(celestialData.moon)}`);
  }
  
  const gates = [];
  
  // Add Earth manually (opposite to Sun)
  const earthCelestial = {
    ...celestialData,
    earth: {
      longitude: (celestialData.sun.longitude + 180) % 360,
      latitude: 0,
      distance: 1
    }
  };
  
  // Standard HD order: Sun, Earth, North Node, South Node, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto
  const hdOrder = [
    'sun', 'earth', 'north_node', 'south_node', 'moon', 
    'mercury', 'venus', 'mars', 'jupiter', 'saturn', 
    'uranus', 'neptune', 'pluto'
  ];
  
  hdOrder.forEach(planet => {
    if (earthCelestial[planet] && typeof earthCelestial[planet].longitude === 'number') {
      const longitude = earthCelestial[planet].longitude;
      console.log(`🔍 ${type} ${planet}: ${longitude.toFixed(3)}°`);
      
      const gateInfo = longitudeToHDGate(longitude);
      gates.push({
        planet,
        gate: gateInfo.gate,
        line: gateInfo.line,
        type: type
      });
      
      console.log(`✅ ${type} ${planet}: Gate ${gateInfo.gate}.${gateInfo.line}`);
    } else {
      console.warn(`⚠️ Missing ${planet} data for ${type}:`, earthCelestial[planet]);
    }
  });
  
  if (gates.length === 0) {
    throw new Error(`No valid gates calculated for ${type} - check celestial data format`);
  }
  
  console.log(`✅ Successfully calculated ${gates.length} gates for ${type}`);
  return gates;
}

function longitudeToHDGate(longitude) {
  // Normalize longitude to 0-360
  const normalizedLon = ((longitude % 360) + 360) % 360;
  
  // HD wheel: 64 gates, each covering 5.625° (360/64)
  const degreesPerGate = 360 / 64;
  const degreesPerLine = degreesPerGate / 6; // 6 lines per gate
  
  // HD wheel starts at gate 41 at 0° Aries
  const hdWheel = [
    41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
    27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
    31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
    28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
  ];
  
  // Calculate gate index (0-63)
  const gateIndex = Math.floor(normalizedLon / degreesPerGate);
  const gate = hdWheel[gateIndex];
  
  // Calculate line (1-6) within the gate
  const positionInGate = normalizedLon % degreesPerGate;
  const line = Math.floor(positionInGate / degreesPerLine) + 1;
  
  return { gate, line: Math.min(line, 6) };
}

function calculateCentersFromChannels(allGates) {
  const centers = {
    'Head': { defined: false, gates: [], channels: [] },
    'Ajna': { defined: false, gates: [], channels: [] },
    'Throat': { defined: false, gates: [], channels: [] },
    'G': { defined: false, gates: [], channels: [] },
    'Heart': { defined: false, gates: [], channels: [] },
    'Solar Plexus': { defined: false, gates: [], channels: [] },
    'Sacral': { defined: false, gates: [], channels: [] },
    'Spleen': { defined: false, gates: [], channels: [] },
    'Root': { defined: false, gates: [], channels: [] }
  };
  
  const gateToCenterMap = {
    64: 'Head', 61: 'Head', 63: 'Head',
    47: 'Ajna', 24: 'Ajna', 4: 'Ajna', 17: 'Ajna', 43: 'Ajna', 11: 'Ajna',
    62: 'Throat', 23: 'Throat', 56: 'Throat', 35: 'Throat', 12: 'Throat',
    45: 'Throat', 33: 'Throat', 8: 'Throat', 31: 'Throat', 7: 'Throat',
    1: 'Throat', 13: 'Throat', 10: 'Throat', 20: 'Throat', 16: 'Throat',
    25: 'G', 46: 'G', 22: 'G', 36: 'G', 2: 'G', 15: 'G', 5: 'G', 14: 'G',
    21: 'Heart', 40: 'Heart', 26: 'Heart', 51: 'Heart',
    6: 'Solar Plexus', 37: 'Solar Plexus', 30: 'Solar Plexus', 55: 'Solar Plexus',
    49: 'Solar Plexus', 19: 'Solar Plexus', 39: 'Solar Plexus',
    41: 'Solar Plexus', 22: 'Solar Plexus', 36: 'Solar Plexus',
    34: 'Sacral', 5: 'Sacral', 14: 'Sacral', 29: 'Sacral', 59: 'Sacral',
    9: 'Sacral', 3: 'Sacral', 42: 'Sacral', 27: 'Sacral',
    48: 'Spleen', 57: 'Spleen', 44: 'Spleen', 50: 'Spleen', 32: 'Spleen', 28: 'Spleen', 18: 'Spleen',
    53: 'Root', 60: 'Root', 52: 'Root', 19: 'Root', 39: 'Root', 41: 'Root',
    58: 'Root', 38: 'Root', 54: 'Root'
  };
  
  allGates.forEach(gateInfo => {
    const gateNum = gateInfo.gate;
    const centerName = gateToCenterMap[gateNum];
    
    if (centerName && centers[centerName]) {
      if (!centers[centerName].gates.includes(gateNum)) {
        centers[centerName].gates.push(gateNum);
      }
    }
  });
  
  const channels = [
    [64, 47], [61, 24], [63, 4],
    [17, 62], [43, 23], [11, 56],
    [35, 36], [12, 22], [8, 1], [31, 7], [33, 13], [10, 20], [16, 48],
    [25, 51], [46, 29], [2, 14], [15, 5],
    [21, 45], [26, 44], [40, 37], [51, 25],
    [6, 59], [37, 40], [30, 41], [55, 39], [49, 19], [22, 12], [36, 35],
    [34, 57], [34, 10], [34, 20], [5, 15], [14, 2], [29, 46], [59, 6], [27, 50], [3, 60], [42, 53], [9, 52],
    [48, 16], [57, 34], [57, 10], [57, 20], [44, 26], [50, 27], [32, 54], [28, 38], [18, 58],
    [53, 42], [60, 3], [52, 9], [19, 49], [39, 55], [41, 30], [58, 18], [38, 28], [54, 32]
  ];
  
  channels.forEach(([gateA, gateB]) => {
    const centerA = gateToCenterMap[gateA];
    const centerB = gateToCenterMap[gateB];
    
    if (centerA && centerB && 
        centers[centerA].gates.includes(gateA) && 
        centers[centerB].gates.includes(gateB)) {
      
      centers[centerA].defined = true;
      centers[centerB].defined = true;
      
      const channel = [gateA, gateB];
      if (!centers[centerA].channels.some(ch => 
          (ch[0] === channel[0] && ch[1] === channel[1]) || 
          (ch[0] === channel[1] && ch[1] === channel[0]))) {
        centers[centerA].channels.push(channel);
      }
      
      if (centerA !== centerB && !centers[centerB].channels.some(ch => 
          (ch[0] === channel[0] && ch[1] === channel[1]) || 
          (ch[0] === channel[1] && ch[1] === channel[0]))) {
        centers[centerB].channels.push(channel);
      }
    }
  });
  
  return centers;
}

function determineHDType(centers) {
  const sacralDefined = centers.Sacral?.defined || false;
  const throatDefined = centers.Throat?.defined || false;
  const heartDefined = centers.Heart?.defined || false;
  const solarPlexusDefined = centers['Solar Plexus']?.defined || false;
  const rootDefined = centers.Root?.defined || false;
  
  const hasMotorToThroat = checkMotorToThroatConnection(centers);
  const hasSacralToThroat = checkSacralToThroatConnection(centers);
  
  if (sacralDefined && throatDefined && hasSacralToThroat) {
    return 'Manifesting Generator';
  }
  
  if (throatDefined && hasMotorToThroat && !sacralDefined) {
    return 'Manifestor';
  }
  
  if (sacralDefined) {
    return 'Generator';
  }
  
  const definedCenters = Object.values(centers).filter(center => center.defined).length;
  if (definedCenters === 0) {
    return 'Reflector';
  }
  
  return 'Projector';
}

function checkMotorToThroatConnection(centers) {
  const motorToThroatChannels = [
    [21, 45], [26, 44], 
    [35, 36], [12, 22]
  ];
  
  return motorToThroatChannels.some(([gateA, gateB]) => {
    const hasGateA = Object.values(centers).some(center => center.gates.includes(gateA));
    const hasGateB = Object.values(centers).some(center => center.gates.includes(gateB));
    
    const isMotorToThroat = (
      (centers.Heart?.gates.includes(gateA) && centers.Throat?.gates.includes(gateB)) ||
      (centers.Heart?.gates.includes(gateB) && centers.Throat?.gates.includes(gateA)) ||
      (centers['Solar Plexus']?.gates.includes(gateA) && centers.Throat?.gates.includes(gateB)) ||
      (centers['Solar Plexus']?.gates.includes(gateB) && centers.Throat?.gates.includes(gateA))
    );
    
    return hasGateA && hasGateB && isMotorToThroat;
  });
}

function checkSacralToThroatConnection(centers) {
  const sacralToThroatChannels = [
    [34, 20], [34, 10], [34, 57], [5, 15], [14, 2], [29, 46]
  ];
  
  return sacralToThroatChannels.some(([a, b]) => {
    return (centers.Sacral?.gates.includes(a) && centers.Throat?.gates.includes(b)) ||
           (centers.Sacral?.gates.includes(b) && centers.Throat?.gates.includes(a));
  });
}

function calculateHDProfile(sunGateInfo, earthGateInfo) {
  if (!sunGateInfo || !earthGateInfo) return '1/3';
  
  const sunLine = sunGateInfo.line || 1;
  const earthLine = earthGateInfo.line || 3;
  
  return `${sunLine}/${earthLine}`;
}

function determineHDAuthority(centers) {
  if (centers['Solar Plexus']?.defined) return 'Emotional';
  if (centers.Sacral?.defined) return 'Sacral';
  if (centers.Spleen?.defined) return 'Splenic';
  if (centers.Heart?.defined) return 'Ego';
  if (centers.G?.defined) return 'G Center/Self-Projected';
  if (centers.Throat?.defined) return 'Mental';
  return 'Lunar (Reflector)';
}

function calculateDefinition(centers) {
  const definedCenters = Object.values(centers).filter(center => center.defined).length;
  
  if (definedCenters === 0) return 'No Definition';
  if (definedCenters <= 3) return 'Single Definition';
  if (definedCenters <= 6) return 'Split Definition';
  return 'Triple Split Definition';
}

function generateLifePurpose(type, profile, authority) {
  const purposes = {
    'Manifestor': `As a Manifestor with ${profile} profile, your purpose is to initiate and inform, creating impact through your ${authority} authority.`,
    'Generator': `As a Generator with ${profile} profile, your purpose is to respond and build, using your ${authority} authority to guide sustainable creation.`,
    'Manifesting Generator': `As a Manifesting Generator with ${profile} profile, your purpose is to respond, initiate, and multi-task, following your ${authority} authority.`,
    'Projector': `As a Projector with ${profile} profile, your purpose is to guide and direct others, waiting for invitations and using your ${authority} authority.`,
    'Reflector': `As a Reflector with ${profile} profile, your purpose is to reflect the health of your community, using lunar cycles for major decisions.`
  };
  
  return purposes[type] || `Your purpose is to follow your ${authority} authority as a ${type}.`;
}

function getStrategyForType(type) {
  const strategies = {
    'Generator': 'Wait to respond',
    'Manifesting Generator': 'Wait to respond then inform',
    'Manifestor': 'Inform before acting',
    'Projector': 'Wait for the invitation',
    'Reflector': 'Wait a lunar cycle'
  };
  return strategies[type] || 'Unknown';
}

function getNotSelfThemeForType(type) {
  const themes = {
    'Generator': 'Frustration',
    'Manifesting Generator': 'Frustration and anger',
    'Manifestor': 'Anger',
    'Projector': 'Bitterness',
    'Reflector': 'Disappointment'
  };
  return themes[type] || 'Unknown';
}

async function geocodeLocation(locationName) {
  console.log(`🔍 Starting Google geocoding for: ${locationName}`);
  
  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!googleApiKey) {
    console.warn('⚠️ No Google Maps API key found, falling back to Nominatim');
    return await tryNominatimGeocoding(locationName);
  }
  
  try {
    const encodedLocation = encodeURIComponent(locationName);
    const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${googleApiKey}`;
    
    const response = await fetch(googleUrl);
    
    if (!response.ok) {
      throw new Error(`Google API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results[0]) {
      const result = data.results[0];
      const { lat, lng } = result.geometry.location;
      const coordinates = `${lat},${lng}`;
      
      console.log(`✅ Google geocoded "${locationName}" to: ${coordinates}`);
      return coordinates;
    } else if (data.status === 'ZERO_RESULTS') {
      console.warn(`⚠️ Google found no results for: ${locationName}`);
      return null;
    } else {
      console.error(`❌ Google geocoding failed with status: ${data.status}`);
      return null;
    }
    
  } catch (error) {
    console.error(`❌ Google geocoding error for ${locationName}:`, error.message);
    console.log('🔄 Falling back to OpenStreetMap Nominatim...');
    return await tryNominatimGeocoding(locationName);
  }
}

async function tryNominatimGeocoding(locationName) {
  try {
    console.log(`🔍 Trying Nominatim geocoding for: ${locationName}`);
    
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`);
    
    if (!response.ok) {
      throw new Error(`Nominatim API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data[0] && data[0].lat && data[0].lon) {
      const coordinates = `${data[0].lat},${data[0].lon}`;
      console.log(`✅ Nominatim geocoded ${locationName} to: ${coordinates}`);
      return coordinates;
    }
    
    console.error(`❌ No Nominatim results for: ${locationName}`);
    return null;
  } catch (error) {
    console.error(`❌ Nominatim geocoding error for ${locationName}:`, error);
    return null;
  }
}
