// Enhanced Human Design calculation module
import { GATE_TO_CENTER_MAP, CHANNELS, GATE_NAMES } from './human-design-gates.ts';

// Accurate solar motion constant in degrees per day
const MEAN_SOLAR_MOTION = 0.9856076686; // degrees per day
const DESIGN_OFFSET_DEGREES = 88.36; // degrees before birth

// Type definitions for clarity
interface GateActivation {
  planet: string;
  gate: number;
  line: number;
  longitude: number;
}

interface CenterActivation {
  [centerName: string]: {
    defined: boolean;
    gates: number[];
    channels: string[];
  };
}

/**
 * Calculate accurate Human Design profile based on birth data and celestial positions
 * HEALTH CHECK MODE: NO FALLBACKS - Will fail hard if data is incomplete
 */
export async function calculateHumanDesign(birthDate: string, birthTime: string, location: string, timezone: string, celestialData: any) {
  // HEALTH CHECK: Strict validation - no fallbacks
  if (!celestialData) {
    throw new Error("HEALTH CHECK FAIL: No celestial data provided - astronomical calculations failed");
  }
  
  if (!birthDate || !birthTime || !location || !timezone) {
    throw new Error("HEALTH CHECK FAIL: Missing required birth data parameters");
  }

  try {
    console.log("HEALTH CHECK: Calculating Human Design for", birthDate, birthTime, "at", location);
    
    // Calculate precise design time (88.36 degrees earlier)
    const birthDateTime = new Date(birthDate + "T" + birthTime);
    const offsetDays = DESIGN_OFFSET_DEGREES / MEAN_SOLAR_MOTION; // ~89.66 days
    const designDateTime = new Date(birthDateTime.getTime() - (offsetDays * 24 * 60 * 60 * 1000));
    
    console.log("HEALTH CHECK: Personality time:", birthDateTime.toISOString());
    console.log("HEALTH CHECK: Design time:", designDateTime.toISOString());
    
    // Calculate gate activations for personality chart - STRICT MODE
    const personalityGates = calculateGatesFromPositions(celestialData, "personality");
    if (personalityGates.length === 0) {
      throw new Error("HEALTH CHECK FAIL: No personality gates calculated - celestial data insufficient");
    }
    
    // Calculate design positions using accurate ephemeris - NO FALLBACKS
    const designCelestialData = await calculateDesignPositions(designDateTime, location, timezone);
    if (!designCelestialData) {
      throw new Error("HEALTH CHECK FAIL: Design positions calculation failed - no fallback available");
    }
    
    const designGates = calculateGatesFromPositions(designCelestialData, "design");
    if (designGates.length === 0) {
      throw new Error("HEALTH CHECK FAIL: No design gates calculated - design celestial data insufficient");
    }
    
    console.log("HEALTH CHECK: Personality gates:", personalityGates.map(g => `${g.gate}.${g.line}`));
    console.log("HEALTH CHECK: Design gates:", designGates.map(g => `${g.gate}.${g.line}`));
    
    // Determine center activations based on both charts
    const centerActivations = determineCenterActivations(personalityGates, designGates);
    
    // Calculate Human Design type based on center definitions - NO DEFAULTS
    const type = determineTypeFromCenters(centerActivations);
    if (!type) {
      throw new Error("HEALTH CHECK FAIL: Could not determine Human Design type from center activations");
    }
    
    // Calculate authority based on defined centers hierarchy
    const authority = determineAuthorityFromCenters(centerActivations);
    if (!authority) {
      throw new Error("HEALTH CHECK FAIL: Could not determine authority from center activations");
    }
    
    // Calculate profile from Sun gates - STRICT VALIDATION
    const profile = calculateProfile(personalityGates, designGates);
    if (!profile) {
      throw new Error("HEALTH CHECK FAIL: Could not calculate profile from Sun positions");
    }
    
    // Calculate definition type
    const definition = calculateDefinitionType(centerActivations);
    
    // Calculate strategy and not-self theme
    const strategy = getStrategyForType(type);
    const notSelfTheme = getNotSelfThemeForType(type);
    
    // Generate life purpose
    const lifePurpose = generateLifePurpose(type, profile, centerActivations);
    
    return {
      type,
      profile,
      authority,
      strategy,
      definition,
      not_self_theme: notSelfTheme,
      life_purpose: lifePurpose,
      centers: centerActivations,
      gates: {
        unconscious_design: designGates.map(g => `${g.gate}.${g.line}`),
        conscious_personality: personalityGates.map(g => `${g.gate}.${g.line}`)
      },
      metadata: {
        personality_time: birthDateTime.toISOString(),
        design_time: designDateTime.toISOString(),
        offset_days: offsetDays.toFixed(2),
        health_check_mode: true
      }
    };
  } catch (error) {
    console.error("HEALTH CHECK FAIL: Human Design calculation error:", error);
    throw new Error(`HEALTH CHECK FAIL: Human Design calculation failed - ${error.message}`);
  }
}

// HEALTH CHECK: Calculate gates from celestial positions - NO FALLBACKS
function calculateGatesFromPositions(celestialData: any, chartType: string): GateActivation[] {
  const gates: GateActivation[] = [];
  
  console.log(`HEALTH CHECK: Calculating ${chartType} gates from celestial data:`, Object.keys(celestialData || {}));
  
  if (!celestialData || Object.keys(celestialData).length === 0) {
    throw new Error(`HEALTH CHECK FAIL: No celestial data provided for ${chartType} chart`);
  }
  
  // Define planets in order of importance for Human Design
  const planets = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto", "north_node"];
  
  planets.forEach(planet => {
    const position = celestialData[planet];
    if (!position || typeof position.longitude !== 'number') {
      throw new Error(`HEALTH CHECK FAIL: Missing or invalid ${planet} position data for ${chartType} chart`);
    }
    
    // Calculate gate and line from actual longitude using the I Ching wheel
    const adjustedLongitude = (position.longitude + 360) % 360; // Ensure positive
    
    // The I Ching wheel starts at 0° Aries (gate 25) and moves clockwise
    // Each gate spans 5.625 degrees (360/64 gates)
    const gateIndex = Math.floor(adjustedLongitude / 5.625);
    
    // Gate mapping according to I Ching wheel (starting from 0° Aries)
    const gateWheel = [
      25, 51, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39,
      53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48,
      57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38,
      54, 61, 60, 41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21
    ];
    
    const gate = gateWheel[gateIndex];
    if (!gate) {
      throw new Error(`HEALTH CHECK FAIL: Invalid gate calculation for ${planet} at ${adjustedLongitude}°`);
    }
    
    // Each line spans 0.9375 degrees (5.625/6 lines)
    const linePosition = (adjustedLongitude % 5.625) / 0.9375;
    const line = Math.floor(linePosition) + 1;
    
    if (line < 1 || line > 6) {
      throw new Error(`HEALTH CHECK FAIL: Invalid line calculation for ${planet}: ${line}`);
    }
    
    gates.push({
      planet,
      gate,
      line,
      longitude: position.longitude
    });
    
    console.log(`HEALTH CHECK: ${chartType} ${planet}: ${position.longitude.toFixed(2)}° -> Gate ${gate}.${line}`);
  });
  
  console.log(`HEALTH CHECK: Total ${chartType} gates calculated:`, gates.length);
  return gates;
}

// HEALTH CHECK: Calculate design positions - NO SIMULATION FALLBACK
async function calculateDesignPositions(designDateTime: Date, location: string, timezone: string) {
  try {
    // Import the calculation function from our main ephemeris
    const { calculatePlanetaryPositionsWithAstro } = await import('./ephemeris-astroengine.ts');
    
    const designDate = designDateTime.toISOString().split('T')[0];
    const designTime = designDateTime.toISOString().split('T')[1].substring(0, 5);
    
    const result = await calculatePlanetaryPositionsWithAstro(designDate, designTime, location, timezone);
    
    if (!result || Object.keys(result).length === 0) {
      throw new Error("HEALTH CHECK FAIL: Ephemeris returned empty data for design positions");
    }
    
    return result;
  } catch (error) {
    throw new Error(`HEALTH CHECK FAIL: Design positions calculation failed - ${error.message}`);
  }
}

// Determine center activations from both personality and design gates
function determineCenterActivations(personalityGates: GateActivation[], designGates: GateActivation[]): CenterActivation {
  const centerActivations: CenterActivation = {};
  
  // Initialize all centers
  const centers = ["Head", "Ajna", "Throat", "G", "Heart", "Solar Plexus", "Sacral", "Spleen", "Root"];
  centers.forEach(center => {
    centerActivations[center] = {
      defined: false,
      gates: [],
      channels: []
    };
  });
  
  // Collect all gates from both charts
  const allGates = [...personalityGates, ...designGates];
  const gateNumbers = allGates.map(g => g.gate);
  
  console.log("All active gates:", gateNumbers.sort((a, b) => a - b));
  
  // Activate centers based on gates
  allGates.forEach(({ gate }) => {
    const center = GATE_TO_CENTER_MAP[gate];
    if (center && centerActivations[center]) {
      if (!centerActivations[center].gates.includes(gate)) {
        centerActivations[center].gates.push(gate);
      }
    }
  });
  
  // Check for channel completions (both gates present)
  Object.entries(CHANNELS).forEach(([channelKey, channelData]) => {
    const [gate1, gate2] = channelKey.split('-').map(Number);
    
    if (gateNumbers.includes(gate1) && gateNumbers.includes(gate2)) {
      // Channel is complete - define both centers
      channelData.centers.forEach(centerName => {
        if (centerActivations[centerName]) {
          centerActivations[centerName].defined = true;
          if (!centerActivations[centerName].channels.includes(channelKey)) {
            centerActivations[centerName].channels.push(channelKey);
          }
        }
      });
      console.log(`HEALTH CHECK: Channel ${channelKey} (${channelData.name}) complete - defining:`, channelData.centers);
    }
  });
  
  // Log final center definitions
  const definedCenters = Object.entries(centerActivations)
    .filter(([_, center]) => center.defined)
    .map(([name, _]) => name);
  console.log("HEALTH CHECK: Defined centers:", definedCenters);
  
  return centerActivations;
}

// HEALTH CHECK: Determine type - NO FALLBACKS
function determineTypeFromCenters(centerActivations: CenterActivation): string {
  if (!centerActivations || Object.keys(centerActivations).length === 0) {
    throw new Error("HEALTH CHECK FAIL: No center activations data provided");
  }

  const sacralDefined = centerActivations["Sacral"]?.defined || false;
  const throatDefined = centerActivations["Throat"]?.defined || false;
  const heartDefined = centerActivations["Heart"]?.defined || false;
  const solarPlexusDefined = centerActivations["Solar Plexus"]?.defined || false;
  const rootDefined = centerActivations["Root"]?.defined || false;
  
  // Check for any defined centers
  const definedCenterCount = Object.values(centerActivations).filter(center => center.defined).length;
  
  // Reflector: No defined centers
  if (definedCenterCount === 0) {
    return "Reflector";
  }
  
  // Manifestor: Motor center connected to throat (but not sacral)
  if (throatDefined && !sacralDefined && (heartDefined || solarPlexusDefined || rootDefined)) {
    const motorConnectedToThroat = checkMotorToThroatConnection(centerActivations);
    if (motorConnectedToThroat) {
      return "Manifestor";
    }
  }
  
  // Manifesting Generator: Sacral AND throat both defined with connection
  if (sacralDefined && throatDefined) {
    const sacralConnectedToThroat = checkSacralToThroatConnection(centerActivations);
    if (sacralConnectedToThroat) {
      return "Manifesting Generator";
    }
  }
  
  // Generator: Sacral defined
  if (sacralDefined) {
    return "Generator";
  }
  
  // Projector: No sacral defined (and not a manifestor or reflector)
  return "Projector";
}

// Check if motor centers are connected to throat
function checkMotorToThroatConnection(centerActivations: CenterActivation): boolean {
  const throatChannels = centerActivations["Throat"]?.channels || [];
  const motorCenters = ["Heart", "Solar Plexus", "Root"];
  
  return throatChannels.some(channel => {
    const channelData = CHANNELS[channel];
    return channelData && motorCenters.some(motor => 
      channelData.centers.includes(motor) && channelData.centers.includes("Throat")
    );
  });
}

// Check if sacral is connected to throat
function checkSacralToThroatConnection(centerActivations: CenterActivation): boolean {
  const throatChannels = centerActivations["Throat"]?.channels || [];
  const sacralChannels = centerActivations["Sacral"]?.channels || [];
  
  // Check for channels that connect Sacral to Throat
  const connectingChannels = throatChannels.filter(channel => {
    const channelData = CHANNELS[channel];
    return channelData && 
           channelData.centers.includes("Sacral") && 
           channelData.centers.includes("Throat");
  });
  
  return connectingChannels.length > 0;
}

// HEALTH CHECK: Authority determination - NO FALLBACKS
function determineAuthorityFromCenters(centerActivations: CenterActivation): string {
  if (!centerActivations) {
    throw new Error("HEALTH CHECK FAIL: No center activations for authority determination");
  }

  // Authority hierarchy (highest to lowest)
  if (centerActivations["Solar Plexus"]?.defined) return "Emotional";
  if (centerActivations["Sacral"]?.defined) return "Sacral";
  if (centerActivations["Spleen"]?.defined) return "Splenic";
  if (centerActivations["Heart"]?.defined) return "Ego";
  if (centerActivations["G"]?.defined) return "Self";
  
  // Mental authority for Reflectors
  const definedCenterCount = Object.values(centerActivations).filter(center => center.defined).length;
  if (definedCenterCount === 0) {
    return "Mental";
  }
  
  throw new Error("HEALTH CHECK FAIL: Could not determine authority from center configuration");
}

// HEALTH CHECK: Profile calculation - NO FALLBACKS
function calculateProfile(personalityGates: GateActivation[], designGates: GateActivation[]): string {
  const personalitySun = personalityGates.find(g => g.planet === "sun");
  const designSun = designGates.find(g => g.planet === "sun");
  
  if (!personalitySun) {
    throw new Error("HEALTH CHECK FAIL: No personality Sun position found");
  }
  
  if (!designSun) {
    throw new Error("HEALTH CHECK FAIL: No design Sun position found");
  }
  
  // Use actual calculated lines from sun positions
  const consciousLine = personalitySun.line;
  const unconsciousLine = designSun.line;
  
  const profileNames = {
    1: "Investigator",
    2: "Hermit", 
    3: "Martyr",
    4: "Opportunist",
    5: "Heretic",
    6: "Role Model"
  };
  
  const consciousName = profileNames[consciousLine];
  const unconsciousName = profileNames[unconsciousLine];
  
  if (!consciousName || !unconsciousName) {
    throw new Error(`HEALTH CHECK FAIL: Invalid profile lines - conscious: ${consciousLine}, unconscious: ${unconsciousLine}`);
  }
  
  return `${consciousLine}/${unconsciousLine} (${consciousName}/${unconsciousName})`;
}

// Calculate definition type based on center connections
function calculateDefinitionType(centerActivations: CenterActivation): string {
  const definedCenters = Object.entries(centerActivations)
    .filter(([_, center]) => center.defined)
    .map(([name, _]) => name);
  
  if (definedCenters.length === 0) return "No Definition";
  if (definedCenters.length === 1) return "Single Definition";
  
  // Simplified definition calculation based on connected groups
  const connectionGroups = analyzeCenterConnections(centerActivations);
  
  if (connectionGroups === 1) return "Single Definition";
  if (connectionGroups === 2) return "Split Definition";
  if (connectionGroups === 3) return "Triple Split Definition";
  
  return "Quadruple Split Definition";
}

// Analyze how many separate connection groups exist
function analyzeCenterConnections(centerActivations: CenterActivation): number {
  const definedCenters = Object.entries(centerActivations)
    .filter(([_, center]) => center.defined)
    .map(([name, _]) => name);
  
  if (definedCenters.length <= 1) return definedCenters.length;
  
  // For simplicity, assume single definition unless we detect clear splits
  // A proper implementation would trace actual channel connections
  const hasChannels = Object.values(centerActivations)
    .some(center => center.channels.length > 0);
  
  return hasChannels ? 1 : Math.min(2, definedCenters.length);
}

// Get strategy for type
function getStrategyForType(type: string): string {
  const strategies = {
    "Generator": "Wait to respond",
    "Manifesting Generator": "Wait to respond, then inform",
    "Projector": "Wait for the invitation",
    "Manifestor": "Inform before acting",
    "Reflector": "Wait a lunar cycle before deciding"
  };
  
  return strategies[type] || "Wait to respond";
}

// Get not-self theme for type
function getNotSelfThemeForType(type: string): string {
  const themes = {
    "Generator": "Frustration",
    "Manifesting Generator": "Frustration and anger",
    "Projector": "Bitterness", 
    "Manifestor": "Anger",
    "Reflector": "Disappointment"
  };
  
  return themes[type] || "Frustration";
}

// Generate life purpose based on type and profile
function generateLifePurpose(type: string, profile: string, centerActivations: CenterActivation): string {
  const profileNumber = profile.split('/')[0];
  
  const basePurpose = {
    "Generator": "Build and create sustainable energy systems",
    "Manifesting Generator": "Initiate and build with efficient multi-passionate energy", 
    "Projector": "Guide and direct others' energy wisely",
    "Manifestor": "Initiate new cycles and catalyze change",
    "Reflector": "Mirror community health and wisdom"
  };
  
  const profileModifiers = {
    "1": "through deep research and investigation",
    "2": "through natural talents and selective sharing",
    "3": "through experimentation and learning from mistakes",
    "4": "through relationships and networking", 
    "5": "through providing practical solutions",
    "6": "through being a role model and example"
  };
  
  return `${basePurpose[type]} ${profileModifiers[profileNumber]}`;
}
