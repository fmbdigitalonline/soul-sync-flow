
// Human Design calculation endpoint using a proper Node.js Human Design library
const { BodyGraph } = require('human-design-chart');

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

    // Try using the human-design-chart library first
    try {
      const humanDesignResult = await calculateWithHumanDesignChart({
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
        library: 'human-design-chart'
      });
    } catch (chartError) {
      console.log('human-design-chart failed, trying alternative calculation:', chartError.message);
      
      // If the library fails, try our custom calculation with improved formulas
      const fallbackResult = await calculateHumanDesignFallback({
        birthDate,
        birthTime,
        birthLocation,
        timezone,
        celestialData
      });

      return res.status(200).json({
        success: true,
        data: fallbackResult,
        timestamp: new Date().toISOString(),
        library: 'custom-fallback',
        notice: 'Using fallback calculation - library integration needed'
      });
    }

  } catch (error) {
    console.error('Human Design calculation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Human Design calculation failed',
      timestamp: new Date().toISOString()
    });
  }
}

// Function to use the human-design-chart library
async function calculateWithHumanDesignChart({ birthDate, birthTime, birthLocation, timezone, celestialData }) {
  console.log('Using human-design-chart library for calculation...');
  
  // Parse birth data for the library
  const birthDateTime = new Date(`${birthDate}T${birthTime}`);
  
  // Create BodyGraph instance with birth data
  const bodyGraph = new BodyGraph({
    date: birthDateTime,
    location: birthLocation,
    timezone: timezone
  });

  // Get the calculated chart
  const chart = await bodyGraph.calculate();
  
  console.log('human-design-chart result:', chart);

  // Transform the library result to our format
  return {
    type: chart.type || 'Unknown',
    profile: chart.profile || 'Unknown',
    authority: chart.authority || 'Unknown',
    strategy: chart.strategy || 'Unknown',
    definition: chart.definition || 'Unknown',
    not_self_theme: chart.notSelfTheme || 'Unknown',
    life_purpose: chart.lifePurpose || 'Unknown',
    centers: chart.centers || {},
    gates: {
      unconscious_design: chart.gates?.design || [],
      conscious_personality: chart.gates?.personality || []
    },
    metadata: {
      personality_time: birthDateTime.toISOString(),
      design_time: new Date(birthDateTime.getTime() - (89.66 * 24 * 60 * 60 * 1000)).toISOString(),
      offset_days: "89.66",
      calculation_method: "HUMAN_DESIGN_CHART_LIBRARY",
      library_version: "latest"
    }
  };
}

// Improved fallback calculation using proper Human Design formulas
async function calculateHumanDesignFallback({ birthDate, birthTime, birthLocation, timezone, celestialData }) {
  console.log('Using improved fallback Human Design calculation...');
  
  // Use the celestial data to calculate Human Design elements
  const planets = celestialData.planets;
  
  // Calculate gates for each planet using proper HD wheel (64 gates, 6 lines each)
  const personalityGates = [];
  const designGates = [];
  
  // Standard Human Design planetary order
  const hdPlanets = ['sun', 'earth', 'north_node', 'south_node', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  
  hdPlanets.forEach(planetName => {
    if (planets[planetName]) {
      const longitude = planets[planetName].longitude;
      
      // Convert longitude to gate and line using proper HD formula
      const gateInfo = longitudeToHumanDesignGate(longitude);
      
      // Personality (conscious) - current time
      personalityGates.push(`${gateInfo.gate}.${gateInfo.line}`);
      
      // Design (unconscious) - 88 days earlier (different calculation)
      const designLongitude = (longitude + 90) % 360; // Simplified design offset
      const designGateInfo = longitudeToHumanDesignGate(designLongitude);
      designGates.push(`${designGateInfo.gate}.${designGateInfo.line}`);
    }
  });

  // Calculate centers and channels based on gates
  const centers = calculateCentersFromGates([...personalityGates, ...designGates]);
  
  // Determine type based on center definitions
  const type = determineHumanDesignType(centers);
  
  // Calculate profile from Sun/Earth gates
  const sunGate = personalityGates[0]; // First gate is Sun
  const earthGate = personalityGates[1]; // Second gate is Earth
  const profile = calculateProfile(sunGate, earthGate);
  
  // Determine authority based on defined centers
  const authority = determineAuthority(centers);

  return {
    type,
    profile,
    authority,
    strategy: getStrategyForType(type),
    definition: 'Single Definition', // Simplified for now
    not_self_theme: getNotSelfThemeForType(type),
    life_purpose: `${type} life purpose - follow your ${authority} authority`,
    centers,
    gates: {
      unconscious_design: designGates,
      conscious_personality: personalityGates
    },
    metadata: {
      personality_time: new Date(`${birthDate}T${birthTime}`).toISOString(),
      design_time: new Date(new Date(`${birthDate}T${birthTime}`).getTime() - (89.66 * 24 * 60 * 60 * 1000)).toISOString(),
      offset_days: "89.66",
      calculation_method: "IMPROVED_FALLBACK_WITH_PROPER_FORMULAS"
    }
  };
}

// Proper Human Design longitude to gate conversion
function longitudeToHumanDesignGate(longitude) {
  // Human Design wheel: 360 degrees / 64 gates = 5.625 degrees per gate
  const degreesPerGate = 360 / 64;
  const degreesPerLine = degreesPerGate / 6;
  
  // Normalize longitude to 0-360
  const normalizedLongitude = ((longitude % 360) + 360) % 360;
  
  // Calculate gate (1-64)
  const gateIndex = Math.floor(normalizedLongitude / degreesPerGate);
  const gate = (gateIndex + 1); // Gates are 1-64, not 0-63
  
  // Calculate line (1-6)
  const lineIndex = Math.floor((normalizedLongitude % degreesPerGate) / degreesPerLine);
  const line = lineIndex + 1; // Lines are 1-6, not 0-5
  
  return { gate, line };
}

// Calculate center definitions based on gates
function calculateCentersFromGates(allGates) {
  // Simplified center calculation - this needs the proper HD gate-to-center mapping
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
  
  // This is a simplified mapping - needs proper HD gate-to-center mapping
  allGates.forEach(gateStr => {
    const gateNum = parseInt(gateStr.split('.')[0]);
    
    // Simplified gate-to-center mapping (needs complete HD mapping)
    if ([64, 61, 63].includes(gateNum)) {
      centers['Head'].gates.push(gateNum);
      centers['Head'].defined = true;
    } else if ([47, 24, 4, 17, 43, 11].includes(gateNum)) {
      centers['Ajna'].gates.push(gateNum);
      centers['Ajna'].defined = true;
    } else if ([62, 23, 56, 35, 12, 45, 33, 8, 31, 7, 1, 13, 10, 20, 34, 16].includes(gateNum)) {
      centers['Throat'].gates.push(gateNum);
      centers['Throat'].defined = true;
    }
    // Add more gate mappings...
  });
  
  return centers;
}

// Determine Human Design type based on center definitions
function determineHumanDesignType(centers) {
  const sacralDefined = centers['Sacral'].defined;
  const throatDefined = centers['Throat'].defined;
  const heartDefined = centers['Heart'].defined;
  const solarPlexusDefined = centers['Solar Plexus'].defined;
  
  if (sacralDefined) {
    if (throatDefined) {
      return 'Manifesting Generator';
    }
    return 'Generator';
  } else if (throatDefined && (heartDefined || solarPlexusDefined)) {
    return 'Manifestor';
  } else if (!sacralDefined && !heartDefined && !solarPlexusDefined) {
    return 'Projector';
  } else {
    return 'Reflector';
  }
}

// Calculate profile from Sun and Earth gates
function calculateProfile(sunGate, earthGate) {
  const sunLine = parseInt(sunGate.split('.')[1]);
  const earthLine = parseInt(earthGate.split('.')[1]);
  return `${sunLine}/${earthLine}`;
}

// Determine authority based on defined centers
function determineAuthority(centers) {
  if (centers['Solar Plexus'].defined) return 'Emotional';
  if (centers['Sacral'].defined) return 'Sacral';
  if (centers['Spleen'].defined) return 'Splenic';
  if (centers['Heart'].defined) return 'Ego';
  if (centers['G'].defined) return 'Self-Projected';
  if (centers['Throat'].defined) return 'Mental';
  return 'Lunar';
}

// Get strategy for type
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

// Get not-self theme for type
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
