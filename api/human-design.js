// Human Design calculation endpoint using custom implementation
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

    // Use our corrected calculation with proper HD formulas
    const humanDesignResult = await calculateHumanDesignCorrected({
      birthDate,
      birthTime,
      birthLocation,
      timezone,
      celestialData
    });

    return res.status(200).json({
      success: true,
      data: humanDesignResult,
      timestamp: new Date().toISOString(),
      library: 'corrected-custom-v3',
      notice: 'Using corrected custom calculation with proper HD formulas v3 - fixed gate wheel rotation, solar arc scope, and channel-based center definition'
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

// Corrected Human Design calculation using verified formulas
async function calculateHumanDesignCorrected({ birthDate, birthTime, birthLocation, timezone, celestialData }) {
  console.log('Using corrected Human Design calculation v4 with fixed planet mapping...');
  
  // Use the actual celestial data from our Swiss Ephemeris calculations
  const planets = celestialData.planets;
  
  // Calculate gates for each planet using CORRECTED Human Design wheel
  const personalityGates = [];
  const designGates = [];
  
  // FIXED: Human Design planetary order (13 activations) - exact order matters!
  const hdPlanets = [
    { name: 'sun', hd_name: 'Sun' },
    { name: 'earth', hd_name: 'Earth' },
    { name: 'north_node', hd_name: 'North Node' },
    { name: 'south_node', hd_name: 'South Node' },
    { name: 'moon', hd_name: 'Moon' },
    { name: 'mercury', hd_name: 'Mercury' },
    { name: 'venus', hd_name: 'Venus' },
    { name: 'mars', hd_name: 'Mars' },
    { name: 'jupiter', hd_name: 'Jupiter' },
    { name: 'saturn', hd_name: 'Saturn' },
    { name: 'uranus', hd_name: 'Uranus' },
    { name: 'neptune', hd_name: 'Neptune' },
    { name: 'pluto', hd_name: 'Pluto' }
  ];
  
  // FIXED: Process each planet in the exact HD order with correct data mapping
  hdPlanets.forEach((planet, index) => {
    let longitude;
    
    // FIXED: Correct planet data access
    if (planet.name === 'earth') {
      // Earth is always opposite to Sun (180 degrees)
      if (!planets.sun) {
        console.error('Sun data missing for Earth calculation');
        return;
      }
      longitude = (planets.sun.longitude + 180) % 360;
      console.log(`Earth longitude calculated: ${longitude}° (Sun: ${planets.sun.longitude}° + 180°)`);
    } else if (planets[planet.name]) {
      longitude = planets[planet.name].longitude;
      console.log(`${planet.hd_name} longitude: ${longitude}°`);
    } else {
      console.error(`Planet data missing for ${planet.name}`);
      return; // Skip if planet data not available
    }
    
    // Convert longitude to Human Design gate and line using CORRECTED formula
    const gateInfo = longitudeToHumanDesignGateCorrected(longitude);
    console.log(`${planet.hd_name}: ${longitude}° → Gate ${gateInfo.gate}.${gateInfo.line}`);
    
    // Personality (conscious) - current time
    personalityGates.push(`${gateInfo.gate}.${gateInfo.line}`);
    
    // Design (unconscious) - using solar arc method ONLY for Sun/Earth/nodes
    const designLongitude = calculateDesignLongitudeCorrected(longitude, planet.name);
    const designGateInfo = longitudeToHumanDesignGateCorrected(designLongitude);
    console.log(`${planet.hd_name} design: ${designLongitude}° → Gate ${designGateInfo.gate}.${designGateInfo.line}`);
    designGates.push(`${designGateInfo.gate}.${designGateInfo.line}`);
  });

  console.log('Calculated personality gates:', personalityGates);
  console.log('Calculated design gates:', designGates);

  // Calculate centers and channels based on gates using CORRECTED HD mappings with channel-based definition
  const centers = calculateCentersFromGatesCorrected([...personalityGates, ...designGates]);
  
  // Determine type based on center definitions and actual channels
  const type = determineHumanDesignTypeCorrected(centers);
  
  // FIXED: Calculate profile from Sun/Earth gates (first two gates in HD order)
  const sunGate = personalityGates[0]; // Sun (index 0)
  const earthGate = personalityGates[1]; // Earth (index 1)
  console.log(`Profile calculation: Sun gate ${sunGate}, Earth gate ${earthGate}`);
  const profile = calculateProfileCorrected(sunGate, earthGate);
  
  // Determine authority based on defined centers using CORRECTED hierarchy
  const authority = determineAuthorityCorrected(centers);

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
      unconscious_design: designGates,
      conscious_personality: personalityGates
    },
    metadata: {
      personality_time: new Date(`${birthDate}T${birthTime}`).toISOString(),
      design_time: new Date(new Date(`${birthDate}T${birthTime}`).getTime() - (88.736 * 24 * 60 * 60 * 1000)).toISOString(),
      offset_days: "88.736",
      calculation_method: "CORRECTED_CUSTOM_V4_FIXED_PLANET_MAPPING"
    }
  };
}

// FIX 1: CORRECTED Gate wheel starting with Gate 21 at index 0 (rotated 16 positions)
function longitudeToHumanDesignGateCorrected(longitude) {
  // Human Design wheel starts at 15° Taurus 56' (45° offset from 0° Aries)
  const GATE_OFFSET_DEG = 45; // 15° Taurus 56'
  
  // CORRECTED gate wheel order starting with Gate 21 at 0° Aries (after 45° offset)
  const gateWheel = [
    21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52,
    39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18,
    48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58,
    38, 54, 61, 60, 41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17
  ];
  
  // Each gate covers 5.625° (360/64)
  const degreesPerGate = 360 / 64;
  
  // Normalize longitude to 0-360
  const normalizedLongitude = ((longitude % 360) + 360) % 360;
  
  // Apply the 45-degree offset before gate lookup
  const wheelPos = (normalizedLongitude - GATE_OFFSET_DEG + 360) % 360;
  
  // Calculate gate index
  const gateIndex = Math.floor(wheelPos / degreesPerGate);
  const gate = gateWheel[gateIndex] || 21;
  
  // Calculate line (1-6) within the gate
  const degreesPerLine = degreesPerGate / 6;
  const lineIndex = Math.floor((wheelPos % degreesPerGate) / degreesPerLine);
  const line = Math.min(lineIndex + 1, 6);
  
  return { gate, line };
}

// FIX 2: Calculate design longitude using solar arc method ONLY for Sun/Earth/nodes
function calculateDesignLongitudeCorrected(personalityLongitude, planetName) {
  // Sun moves 57.86° in ~88.736 days (solar arc method)
  const SOLAR_ARC = 57.86;
  
  // FIXED: Apply solar arc offset only for Sun/Earth/nodes - all other planets stay at natal position
  if (['sun', 'earth', 'north_node', 'south_node'].includes(planetName)) {
    const designLon = (personalityLongitude - SOLAR_ARC + 360) % 360;
    console.log(`${planetName} design offset: ${personalityLongitude}° - ${SOLAR_ARC}° = ${designLon}°`);
    return designLon;
  } else {
    console.log(`${planetName} design: no offset (${personalityLongitude}°)`);
    return personalityLongitude; // Moon and planets unchanged
  }
}

// FIX 3: CORRECTED center calculation with channel-based definition (not individual gates)
function calculateCentersFromGatesCorrected(allGates) {
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
  
  // CORRECTED Human Design gate-to-center mapping
  const gateToCenterMap = {
    // Head Center (Crown)
    64: 'Head', 61: 'Head', 63: 'Head',
    
    // Ajna Center (Mind)
    47: 'Ajna', 24: 'Ajna', 4: 'Ajna', 17: 'Ajna', 43: 'Ajna', 11: 'Ajna',
    
    // Throat Center
    62: 'Throat', 23: 'Throat', 56: 'Throat', 35: 'Throat', 12: 'Throat', 
    45: 'Throat', 33: 'Throat', 8: 'Throat', 31: 'Throat', 7: 'Throat', 
    1: 'Throat', 13: 'Throat', 10: 'Throat', 20: 'Throat', 34: 'Throat', 16: 'Throat',
    
    // G Center (Identity/Self)
    25: 'G', 46: 'G', 22: 'G', 36: 'G', 2: 'G', 15: 'G', 5: 'G', 14: 'G',
    
    // Heart Center (Will/Ego)
    21: 'Heart', 40: 'Heart', 26: 'Heart', 51: 'Heart',
    
    // Solar Plexus Center (Emotional)
    6: 'Solar Plexus', 37: 'Solar Plexus', 22: 'Solar Plexus', 36: 'Solar Plexus', 
    30: 'Solar Plexus', 55: 'Solar Plexus', 49: 'Solar Plexus', 19: 'Solar Plexus', 
    13: 'Solar Plexus', 39: 'Solar Plexus', 41: 'Solar Plexus',
    
    // Sacral Center
    34: 'Sacral', 5: 'Sacral', 14: 'Sacral', 29: 'Sacral', 59: 'Sacral', 
    9: 'Sacral', 3: 'Sacral', 42: 'Sacral', 27: 'Sacral',
    
    // Spleen Center (Intuitive)
    48: 'Spleen', 57: 'Spleen', 44: 'Spleen', 50: 'Spleen', 32: 'Spleen', 28: 'Spleen', 18: 'Spleen',
    
    // Root Center
    53: 'Root', 60: 'Root', 52: 'Root', 19: 'Root', 39: 'Root', 41: 'Root', 
    58: 'Root', 38: 'Root', 54: 'Root', 61: 'Root'
  };
  
  // First collect all gates in each center
  allGates.forEach(gateStr => {
    const gateNum = parseInt(gateStr.split('.')[0]);
    const centerName = gateToCenterMap[gateNum];
    
    if (centerName) {
      centers[centerName].gates.push(gateNum);
    }
  });
  
  // Human Design channels (gate pairs that define centers when BOTH gates are present)
  const channels = [
    [34, 20], [34, 10], [34, 57], [59, 6], [5, 15], [3, 60], [29, 46], [42, 53],
    [27, 50], [59, 6], [6, 37], [22, 12], [35, 36], [16, 48], [40, 37], [26, 44],
    [21, 45], [25, 51], [2, 14], [46, 29], [47, 64], [24, 61], [4, 63], [17, 62],
    [43, 23], [11, 56], [31, 7], [33, 13], [1, 8], [7, 31], [13, 33], [10, 20],
    [57, 34], [48, 16], [18, 58], [38, 28], [54, 32], [44, 26], [50, 27], [32, 54],
    [28, 38], [18, 58], [48, 16], [57, 10], [20, 34], [34, 10], [10, 57], [57, 20],
    [6, 59], [37, 40], [22, 12], [36, 35], [30, 41], [55, 39], [49, 19], [13, 33]
  ];
  
  // Define centers only when complete channels exist (both gates present)
  channels.forEach(([gateA, gateB]) => {
    const centerA = gateToCenterMap[gateA];
    const centerB = gateToCenterMap[gateB];
    
    if (centerA && centerB && 
        centers[centerA].gates.includes(gateA) && 
        centers[centerB].gates.includes(gateB)) {
      
      centers[centerA].defined = true;
      centers[centerB].defined = true;
      centers[centerA].channels.push([gateA, gateB]);
      centers[centerB].channels.push([gateA, gateB]);
    }
  });
  
  return centers;
}

// CORRECTED Human Design type determination with actual channel checking
function determineHumanDesignTypeCorrected(centers) {
  const sacralDefined = centers['Sacral']?.defined || false;
  const throatDefined = centers['Throat']?.defined || false;
  const heartDefined = centers['Heart']?.defined || false;
  const solarPlexusDefined = centers['Solar Plexus']?.defined || false;
  const rootDefined = centers['Root']?.defined || false;
  
  // Count total defined centers
  const definedCenters = Object.values(centers).filter(center => center.defined).length;
  
  // Reflector: No centers defined
  if (definedCenters === 0) {
    return 'Reflector';
  }
  
  // Check for actual Sacral-Throat channels for Manifesting Generator
  const sacralToThroatChannels = [
    [34, 57], [34, 20], [34, 10], [5, 15], [3, 60], [42, 53], [29, 46], [59, 6]
  ];
  
  const hasSacralThroatChannel = sacralToThroatChannels.some(([a, b]) =>
    centers.Sacral.gates.includes(a) && centers.Throat.gates.includes(b) ||
    centers.Sacral.gates.includes(b) && centers.Throat.gates.includes(a)
  );
  
  // Manifesting Generator: Sacral + Throat defined WITH actual channel connection
  if (sacralDefined && throatDefined && hasSacralThroatChannel) {
    return 'Manifesting Generator';
  }
  
  // Manifestor: Throat connected to motor center (Heart, Root, Solar Plexus) BUT not Sacral
  if (throatDefined && (heartDefined || rootDefined || solarPlexusDefined) && !sacralDefined) {
    return 'Manifestor';
  }
  
  // Generator: Sacral defined
  if (sacralDefined) {
    return 'Generator';
  }
  
  // Projector: Everything else (no Sacral, not Manifestor)
  return 'Projector';
}

// CORRECTED profile calculation
function calculateProfileCorrected(sunGate, earthGate) {
  if (!sunGate || !earthGate) return '1/3';
  
  const sunLine = parseInt(sunGate.split('.')[1]) || 1;
  const earthLine = parseInt(earthGate.split('.')[1]) || 3;
  
  return `${sunLine}/${earthLine}`;
}

// CORRECTED authority determination with proper hierarchy
function determineAuthorityCorrected(centers) {
  // Human Design authority hierarchy (in correct order of precedence)
  if (centers['Solar Plexus']?.defined) return 'Emotional';
  if (centers['Sacral']?.defined) return 'Sacral';
  if (centers['Spleen']?.defined) return 'Splenic';
  if (centers['Heart']?.defined) return 'Ego';
  if (centers['G']?.defined) return 'G Center/Self-Projected';
  if (centers['Throat']?.defined) return 'Mental';
  return 'Lunar (Reflector)';
}

// Calculate definition type
function calculateDefinition(centers) {
  const definedCenters = Object.values(centers).filter(center => center.defined).length;
  
  if (definedCenters === 0) return 'No Definition';
  if (definedCenters <= 3) return 'Single Definition';
  if (definedCenters <= 6) return 'Split Definition';
  return 'Triple Split Definition';
}

// Generate life purpose based on type, profile, and authority
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
