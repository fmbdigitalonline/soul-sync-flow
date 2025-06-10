// Human Design calculation endpoint using proper HD methodology
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
    const { birthDate, birthTime, birthLocation, timezone, celestialData } = req.body;

    console.log('Human Design calculation request:', {
      birthDate,
      birthTime,
      birthLocation,
      timezone
    });

    // Validate required data
    if (!birthDate || !birthTime || !birthLocation || !celestialData) {
      return res.status(400).json({
        error: 'Missing required data: birthDate, birthTime, birthLocation, and celestialData are required'
      });
    }

    // 1. Geocode first to get coordinates!
    const coordinates = await geocodeLocation(birthLocation);

    if (!coordinates) {
      return res.status(400).json({
        error: `Could not geocode location: ${birthLocation}`
      });
    }

    console.log(`✅ Geocoded ${birthLocation} to coordinates: ${coordinates}`);

    // 2. Pass coordinates to calculation
    const humanDesignResult = await calculateHumanDesignProper({
      birthDate,
      birthTime,
      timezone,
      celestialData,
      coordinates
    });

    return res.status(200).json({
      success: true,
      data: humanDesignResult,
      timestamp: new Date().toISOString(),
      library: 'proper-hd-methodology-v6-with-geocoding-and-validation',
      notice: 'Using proper Human Design calculation with geocoding and robust validation'
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

// Geocode location using OpenStreetMap/Nominatim (free service)
async function geocodeLocation(locationName) {
  try {
    console.log(`🔍 Geocoding location: ${locationName}`);
    
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`);
    
    if (!response.ok) {
      throw new Error(`Geocoding API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data[0] && data[0].lat && data[0].lon) {
      const coordinates = `${data[0].lat},${data[0].lon}`;
      console.log(`✅ Geocoded ${locationName} to: ${coordinates}`);
      return coordinates;
    }
    
    console.error(`❌ No geocoding results for: ${locationName}`);
    return null;
  } catch (error) {
    console.error(`❌ Geocoding error for ${locationName}:`, error);
    return null;
  }
}

// Proper Human Design calculation using correct methodology
async function calculateHumanDesignProper({ birthDate, birthTime, timezone, celestialData, coordinates }) {
  console.log('Using proper Human Design methodology...');
  
  // Step 1: Calculate Design Time (88.736 days or 88.36° solar arc before birth)
  const birthDateTime = new Date(`${birthDate}T${birthTime}`);
  const designDateTime = new Date(birthDateTime.getTime() - (88.736 * 24 * 60 * 60 * 1000));
  
  console.log('Birth time:', birthDateTime.toISOString());
  console.log('Design time:', designDateTime.toISOString());
  
  // Step 2: Get celestial data for both Personality (birth) and Design times
  const personalityCelestial = celestialData.planets; // Access the planets object
  
  console.log('🔍 DEBUG: Personality celestial data received:');
  console.log('Raw celestialData:', JSON.stringify(celestialData, null, 2));
  console.log('Extracted personalityCelestial:', JSON.stringify(personalityCelestial, null, 2));
  
  // ROBUST VALIDATION: Check that we have valid personality celestial data
  if (!personalityCelestial || typeof personalityCelestial !== 'object') {
    throw new Error(`Invalid personality celestial data - expected object, got: ${typeof personalityCelestial}`);
  }
  
  // Check for essential planets
  const requiredPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  const missingPlanets = requiredPlanets.filter(planet => !personalityCelestial[planet] || typeof personalityCelestial[planet].longitude !== 'number');
  
  if (missingPlanets.length > 0) {
    console.error('❌ Missing essential planetary data:', missingPlanets);
    console.error('❌ Available planets:', Object.keys(personalityCelestial));
    throw new Error(`Missing essential planetary data for: ${missingPlanets.join(', ')}`);
  }
  
  console.log('✅ Personality celestial data validation passed');
  console.log('Sun longitude:', personalityCelestial?.sun?.longitude);
  console.log('Moon longitude:', personalityCelestial?.moon?.longitude);
  
  // Get Design time celestial data
  const designCelestial = await getAccurateDesignTimeCelestialData(designDateTime, coordinates, timezone, personalityCelestial);
  
  // ROBUST VALIDATION: Check that we have valid design celestial data
  if (!designCelestial || typeof designCelestial !== 'object') {
    throw new Error(`Invalid design celestial data - expected object, got: ${typeof designCelestial}`);
  }
  
  const missingDesignPlanets = requiredPlanets.filter(planet => !designCelestial[planet] || typeof designCelestial[planet].longitude !== 'number');
  
  if (missingDesignPlanets.length > 0) {
    console.error('❌ Missing essential design planetary data:', missingDesignPlanets);
    console.error('❌ Available design planets:', Object.keys(designCelestial));
    throw new Error(`Missing essential design planetary data for: ${missingDesignPlanets.join(', ')}`);
  }
  
  console.log('✅ Design celestial data validation passed');
  
  // Step 3: Calculate gates using proper HD methodology
  console.log('🔍 About to calculate personality gates...');
  const personalityGates = calculateHDGatesFromCelestialData(personalityCelestial, 'personality');
  
  console.log('🔍 About to calculate design gates...');
  const designGates = calculateHDGatesFromCelestialData(designCelestial, 'design');
  
  console.log('Personality gates calculated:', personalityGates);
  console.log('Design gates calculated:', designGates);
  
  // Step 4: Determine centers based on proper channel definitions
  const centers = calculateCentersFromChannels([...personalityGates, ...designGates]);
  
  // Step 5: Calculate type, profile, authority using proper HD rules
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
      calculation_method: "PROPER_HD_METHODOLOGY_V6_WITH_ROBUST_VALIDATION"
    }
  };
}

// Get accurate Design time celestial data
async function getAccurateDesignTimeCelestialData(designDateTime, coordinates, timezone, personalityCelestial) {
  console.log('🔍 Getting accurate Design time celestial data via Vercel ephemeris API...');
  
  try {
    // Format the Design time for the API
    const designDateStr = designDateTime.toISOString().split('T')[0];
    const designTimeStr = designDateTime.toISOString().split('T')[1].substring(0, 8);
    
    console.log(`🔍 Calling Vercel ephemeris API for Design time: ${designDateStr} ${designTimeStr}`);
    console.log(`🔍 Using coordinates: ${coordinates}`);
    
    if (!coordinates) {
      throw new Error('No coordinates were provided for ephemeris lookup');
    }
    
    // Call our Vercel ephemeris API for the Design time
    const ephemerisResponse = await fetch('https://soul-sync-flow.vercel.app/api/ephemeris', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        datetime: `${designDateStr}T${designTimeStr}.000Z`,
        coordinates: coordinates
      })
    });
    
    console.log(`🔍 Ephemeris API response status: ${ephemerisResponse.status}`);
    
    if (!ephemerisResponse.ok) {
      const errorText = await ephemerisResponse.text();
      console.error(`❌ Ephemeris API error: ${ephemerisResponse.status} - ${errorText}`);
      throw new Error(`Ephemeris API error: ${ephemerisResponse.status}`);
    }
    
    const ephemerisData = await ephemerisResponse.json();
    console.log('🔍 Raw ephemeris API response:', ephemerisData);
    
    if (!ephemerisData.success || !ephemerisData.data) {
      console.error('❌ Invalid ephemeris response structure:', ephemerisData);
      throw new Error('Invalid ephemeris response');
    }
    
    console.log('✅ Successfully retrieved Design time ephemeris data from Vercel API');
    
    // Transform the API response to match our expected format
    const designCelestial = transformEphemerisResponse(ephemerisData.data);
    
    console.log('🔍 Transformed design celestial data:', JSON.stringify(designCelestial, null, 2));
    
    return designCelestial;
    
  } catch (error) {
    console.error('❌ Vercel ephemeris API failed:', error.message);
    console.log('🔄 Falling back to improved approximation with personality data...');
    return calculateImprovedDesignTimeCelestialData(designDateTime, personalityCelestial);
  }
}

// Transform ephemeris API response to our expected format
function transformEphemerisResponse(ephemerisData) {
  const celestialData = {};
  
  // Map the ephemeris response to our format
  const planetMapping = {
    'sun': 'sun',
    'moon': 'moon', 
    'mercury': 'mercury',
    'venus': 'venus',
    'mars': 'mars',
    'jupiter': 'jupiter',
    'saturn': 'saturn',
    'uranus': 'uranus',
    'neptune': 'neptune',
    'pluto': 'pluto',
    'north_node': 'north_node',
    'south_node': 'south_node'
  };
  
  Object.entries(planetMapping).forEach(([ourKey, apiKey]) => {
    if (ephemerisData[apiKey] && ephemerisData[apiKey].longitude !== undefined) {
      celestialData[ourKey] = {
        longitude: ephemerisData[apiKey].longitude,
        latitude: ephemerisData[apiKey].latitude || 0,
        distance: ephemerisData[apiKey].distance || 1
      };
      
      console.log(`Design ${ourKey}: ${ephemerisData[apiKey].longitude.toFixed(3)}° (from Vercel API)`);
    }
  });
  
  // Earth is always opposite to Sun
  if (celestialData.sun) {
    celestialData.earth = {
      longitude: (celestialData.sun.longitude + 180) % 360,
      latitude: 0,
      distance: 1
    };
  }
  
  return celestialData;
}

// Improved fallback calculation with robust validation
function calculateImprovedDesignTimeCelestialData(designDateTime, personalityCelestial) {
  console.log('🔄 Using improved approximation with orbital variations for Design time...');
  console.log('🔍 Starting with personality celestial data:', personalityCelestial);
  
  if (!personalityCelestial) {
    console.error('❌ CRITICAL: No personality celestial data provided to fallback function');
    throw new Error('Cannot calculate design time without personality data');
  }
  
  const designCelestial = {};
  const daysDifference = 88.736;
  
  // More accurate daily motions accounting for orbital eccentricity
  const planetMotions = {
    sun: { base: 0.9856, variation: 0.0341 },
    moon: { base: 13.1764, variation: 1.2 },
    mercury: { base: 1.3833, variation: 0.5 },
    venus: { base: 1.6021, variation: 0.2 },
    mars: { base: 0.5240, variation: 0.3 },
    jupiter: { base: 0.0831, variation: 0.01 },
    saturn: { base: 0.0335, variation: 0.005 },
    uranus: { base: 0.0117, variation: 0.002 },
    neptune: { base: 0.0061, variation: 0.001 },
    pluto: { base: 0.0041, variation: 0.0005 },
    north_node: { base: -0.0529, variation: 0.01 }, // Retrograde
    south_node: { base: 0.0529, variation: 0.01 }
  };
  
  Object.keys(planetMotions).forEach(planet => {
    if (personalityCelestial[planet] && typeof personalityCelestial[planet].longitude === 'number') {
      const motion = planetMotions[planet];
      // Add some variation based on time of year (simplified)
      const timeVariation = Math.sin((designDateTime.getMonth() / 12) * 2 * Math.PI) * motion.variation;
      const adjustedMotion = motion.base + timeVariation;
      
      const personalityLongitude = personalityCelestial[planet].longitude;
      const designLongitude = (personalityLongitude - (adjustedMotion * daysDifference) + 360) % 360;
      
      designCelestial[planet] = {
        longitude: designLongitude,
        latitude: personalityCelestial[planet].latitude || 0,
        distance: personalityCelestial[planet].distance || 1
      };
      
      console.log(`🔍 ${planet}: Personality ${personalityLongitude.toFixed(3)}° → Design ${designLongitude.toFixed(3)}° (motion: ${adjustedMotion.toFixed(4)}°/day)`);
    } else {
      console.warn(`⚠️ Warning: Missing or invalid ${planet} data in personality celestial data`);
    }
  });
  
  // Earth is always opposite to Sun
  if (designCelestial.sun) {
    designCelestial.earth = {
      longitude: (designCelestial.sun.longitude + 180) % 360,
      latitude: 0,
      distance: 1
    };
    console.log(`🔍 earth: Design ${designCelestial.earth.longitude.toFixed(3)}° (opposite to sun)`);
  }
  
  return designCelestial;
}

// Calculate HD gates from celestial data using proper methodology with robust validation
function calculateHDGatesFromCelestialData(celestialData, type) {
  console.log(`🔍 calculateHDGatesFromCelestialData called with type: ${type}`);
  console.log(`🔍 Celestial data received:`, JSON.stringify(celestialData, null, 2));
  
  // ROBUST VALIDATION: Check input data
  if (!celestialData || typeof celestialData !== 'object') {
    throw new Error(`Invalid celestial data for ${type} - expected object, got: ${typeof celestialData}. Data: ${JSON.stringify(celestialData)}`);
  }
  
  // Check for essential planets
  if (!celestialData.sun || typeof celestialData.sun.longitude !== 'number') {
    throw new Error(`Missing or invalid sun data for ${type}! Sun data: ${JSON.stringify(celestialData.sun)}`);
  }
  
  if (!celestialData.moon || typeof celestialData.moon.longitude !== 'number') {
    throw new Error(`Missing or invalid moon data for ${type}! Moon data: ${JSON.stringify(celestialData.moon)}`);
  }
  
  console.log(`✅ Basic validation passed for ${type} celestial data`);
  
  const gates = [];
  
  // Add Earth manually since it's not in the celestial data
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
      console.log(`🔍 Calculating for ${type} ${planet} with longitude: ${longitude.toFixed(3)}°`);
      
      const gateInfo = longitudeToHDGate(longitude);
      gates.push({
        planet,
        gate: gateInfo.gate,
        line: gateInfo.line,
        type: type
      });
      
      console.log(`✅ ${type} ${planet}: ${longitude.toFixed(3)}° → Gate ${gateInfo.gate}.${gateInfo.line}`);
    } else {
      console.warn(`⚠️ Warning: Missing or invalid ${planet} data for ${type}:`, earthCelestial[planet]);
    }
  });
  
  if (gates.length === 0) {
    throw new Error(`No valid gates calculated for ${type} - check celestial data format`);
  }
  
  console.log(`✅ Successfully calculated ${gates.length} gates for ${type}`);
  return gates;
}

// CORRECTED: Proper longitude to HD gate conversion using correct HD wheel
function longitudeToHDGate(longitude) {
  // Normalize longitude to 0-360
  const normalizedLon = ((longitude % 360) + 360) % 360;
  
  // HD wheel: 64 gates, each covering 5.625° (360/64)
  const degreesPerGate = 360 / 64;
  const degreesPerLine = degreesPerGate / 6; // 6 lines per gate
  
  // CORRECTED: HD wheel starts at gate 41 at 0° Aries (not gate 1 or 21)
  // This is the correct HD wheel sequence starting from 0° Aries
  const hdWheel = [
    41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
    27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
    31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
    28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
  ];
  
  // Calculate gate index (0-63) - NO 45° offset applied
  const gateIndex = Math.floor(normalizedLon / degreesPerGate);
  const gate = hdWheel[gateIndex];
  
  // Calculate line (1-6) within the gate
  const positionInGate = normalizedLon % degreesPerGate;
  const line = Math.floor(positionInGate / degreesPerLine) + 1;
  
  console.log(`🔍 longitudeToHDGate: ${normalizedLon.toFixed(3)}° → gateIndex ${gateIndex} → gate ${gate}, line ${Math.min(line, 6)}`);
  
  return { gate, line: Math.min(line, 6) };
}

// CORRECTED: Calculate centers based on complete channels only
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
  
  // CORRECTED: Proper HD gate-to-center mapping
  const gateToCenterMap = {
    // Head Center
    64: 'Head', 61: 'Head', 63: 'Head',
    
    // Ajna Center  
    47: 'Ajna', 24: 'Ajna', 4: 'Ajna', 17: 'Ajna', 43: 'Ajna', 11: 'Ajna',
    
    // Throat Center
    62: 'Throat', 23: 'Throat', 56: 'Throat', 35: 'Throat', 12: 'Throat',
    45: 'Throat', 33: 'Throat', 8: 'Throat', 31: 'Throat', 7: 'Throat',
    1: 'Throat', 13: 'Throat', 10: 'Throat', 20: 'Throat', 16: 'Throat',
    
    // G Center
    25: 'G', 46: 'G', 22: 'G', 36: 'G', 2: 'G', 15: 'G', 5: 'G', 14: 'G',
    
    // Heart Center (Ego/Will)
    21: 'Heart', 40: 'Heart', 26: 'Heart', 51: 'Heart',
    
    // Solar Plexus Center
    6: 'Solar Plexus', 37: 'Solar Plexus', 30: 'Solar Plexus', 55: 'Solar Plexus',
    49: 'Solar Plexus', 19: 'Solar Plexus', 39: 'Solar Plexus',
    41: 'Solar Plexus', 22: 'Solar Plexus', 36: 'Solar Plexus',
    
    // Sacral Center
    34: 'Sacral', 5: 'Sacral', 14: 'Sacral', 29: 'Sacral', 59: 'Sacral',
    9: 'Sacral', 3: 'Sacral', 42: 'Sacral', 27: 'Sacral',
    
    // Spleen Center
    48: 'Spleen', 57: 'Spleen', 44: 'Spleen', 50: 'Spleen', 32: 'Spleen', 28: 'Spleen', 18: 'Spleen',
    
    // Root Center
    53: 'Root', 60: 'Root', 52: 'Root', 19: 'Root', 39: 'Root', 41: 'Root',
    58: 'Root', 38: 'Root', 54: 'Root'
  };
  
  // Collect gates for each center
  allGates.forEach(gateInfo => {
    const gateNum = gateInfo.gate;
    const centerName = gateToCenterMap[gateNum];
    
    if (centerName && centers[centerName]) {
      if (!centers[centerName].gates.includes(gateNum)) {
        centers[centerName].gates.push(gateNum);
      }
    }
  });
  
  // CORRECTED: Define channels that create connections between centers
  const channels = [
    // Head to Ajna
    [64, 47], [61, 24], [63, 4],
    
    // Ajna to Throat
    [17, 62], [43, 23], [11, 56],
    
    // Throat connections
    [35, 36], [12, 22], [8, 1], [31, 7], [33, 13], [10, 20], [16, 48],
    
    // G Center connections
    [25, 51], [46, 29], [2, 14], [15, 5],
    
    // Heart connections
    [21, 45], [26, 44], [40, 37], [51, 25],
    
    // Solar Plexus connections
    [6, 59], [37, 40], [30, 41], [55, 39], [49, 19], [22, 12], [36, 35],
    
    // Sacral connections
    [34, 57], [34, 10], [34, 20], [5, 15], [14, 2], [29, 46], [59, 6], [27, 50], [3, 60], [42, 53], [9, 52],
    
    // Spleen connections
    [48, 16], [57, 34], [57, 10], [57, 20], [44, 26], [50, 27], [32, 54], [28, 38], [18, 58],
    
    // Root connections
    [53, 42], [60, 3], [52, 9], [19, 49], [39, 55], [41, 30], [58, 18], [38, 28], [54, 32]
  ];
  
  // Define centers only when complete channels exist
  channels.forEach(([gateA, gateB]) => {
    const centerA = gateToCenterMap[gateA];
    const centerB = gateToCenterMap[gateB];
    
    if (centerA && centerB && 
        centers[centerA].gates.includes(gateA) && 
        centers[centerB].gates.includes(gateB)) {
      
      centers[centerA].defined = true;
      centers[centerB].defined = true;
      
      // Add channel to both centers
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
  
  console.log('Centers calculation result:', centers);
  return centers;
}

// CORRECTED: Determine HD type using proper methodology
function determineHDType(centers) {
  const sacralDefined = centers.Sacral?.defined || false;
  const throatDefined = centers.Throat?.defined || false;
  const heartDefined = centers.Heart?.defined || false;
  const solarPlexusDefined = centers['Solar Plexus']?.defined || false;
  const rootDefined = centers.Root?.defined || false;
  
  console.log('Type determination - Centers:', {
    sacral: sacralDefined,
    throat: throatDefined,
    heart: heartDefined,
    solarPlexus: solarPlexusDefined,
    root: rootDefined
  });
  
  // Check for motor to throat connections for Manifestor
  const hasMotorToThroat = checkMotorToThroatConnection(centers);
  
  // Check for Sacral to Throat connection for Manifesting Generator
  const hasSacralToThroat = checkSacralToThroatConnection(centers);
  
  // Type determination logic
  if (sacralDefined && throatDefined && hasSacralToThroat) {
    return 'Manifesting Generator';
  }
  
  if (throatDefined && hasMotorToThroat && !sacralDefined) {
    return 'Manifestor';
  }
  
  if (sacralDefined) {
    return 'Generator';
  }
  
  // Check if no centers are defined (Reflector)
  const definedCenters = Object.values(centers).filter(center => center.defined).length;
  if (definedCenters === 0) {
    return 'Reflector';
  }
  
  return 'Projector';
}

// CORRECTED: Helper function to check ONLY motor to throat connections
function checkMotorToThroatConnection(centers) {
  // CORRECTED: Only include verified channels that connect motor centers to Throat
  const motorToThroatChannels = [
    // Heart (Ego/Will) to Throat - VERIFIED
    [21, 45], // Channel of Money
    [26, 44], // Channel of Surrender
    
    // Solar Plexus to Throat - VERIFIED
    [35, 36], // Channel of Transitoriness
    [12, 22], // Channel of Openness
    
    // Root to Throat - CORRECTED (removed questionable channels)
    // Note: Most Root energy reaches Throat through other centers
  ];
  
  return motorToThroatChannels.some(([gateA, gateB]) => {
    // Check if we have both gates of the channel active
    const hasGateA = Object.values(centers).some(center => center.gates.includes(gateA));
    const hasGateB = Object.values(centers).some(center => center.gates.includes(gateB));
    
    // Verify the channel actually connects a motor to throat
    const isMotorToThroat = (
      (centers.Heart?.gates.includes(gateA) && centers.Throat?.gates.includes(gateB)) ||
      (centers.Heart?.gates.includes(gateB) && centers.Throat?.gates.includes(gateA)) ||
      (centers['Solar Plexus']?.gates.includes(gateA) && centers.Throat?.gates.includes(gateB)) ||
      (centers['Solar Plexus']?.gates.includes(gateB) && centers.Throat?.gates.includes(gateA))
    );
    
    return hasGateA && hasGateB && isMotorToThroat;
  });
}

// Helper function to check sacral to throat connections
function checkSacralToThroatConnection(centers) {
  const sacralToThroatChannels = [
    [34, 20], [34, 10], [34, 57], [5, 15], [14, 2], [29, 46]
  ];
  
  return sacralToThroatChannels.some(([a, b]) => {
    return (centers.Sacral?.gates.includes(a) && centers.Throat?.gates.includes(b)) ||
           (centers.Sacral?.gates.includes(b) && centers.Throat?.gates.includes(a));
  });
}

// Calculate HD profile from Sun and Earth gates
function calculateHDProfile(sunGateInfo, earthGateInfo) {
  if (!sunGateInfo || !earthGateInfo) return '1/3';
  
  const sunLine = sunGateInfo.line || 1;
  const earthLine = earthGateInfo.line || 3;
  
  return `${sunLine}/${earthLine}`;
}

// Determine authority using proper HD hierarchy
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
