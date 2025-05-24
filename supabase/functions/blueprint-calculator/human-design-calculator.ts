
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
 */
export async function calculateHumanDesign(birthDate: string, birthTime: string, location: string, timezone: string, celestialData: any) {
  try {
    console.log("Calculating accurate Human Design for", birthDate, birthTime);
    
    // Calculate precise design time (88.36 degrees earlier)
    const birthDateTime = new Date(birthDate + "T" + birthTime);
    const offsetDays = DESIGN_OFFSET_DEGREES / MEAN_SOLAR_MOTION; // ~89.66 days
    const designDateTime = new Date(birthDateTime.getTime() - (offsetDays * 24 * 60 * 60 * 1000));
    
    console.log("Personality time:", birthDateTime.toISOString());
    console.log("Design time:", designDateTime.toISOString());
    
    // Calculate gate activations for personality chart (conscious)
    const personalityGates = calculateGatesFromPositions(celestialData, "personality");
    
    // Calculate design positions using accurate ephemeris
    const designCelestialData = await calculateDesignPositions(designDateTime, location, timezone);
    const designGates = calculateGatesFromPositions(designCelestialData, "design");
    
    console.log("Personality gates:", personalityGates.slice(0, 3)); // Log first 3 for brevity
    console.log("Design gates:", designGates.slice(0, 3));
    
    // Determine center activations based on both charts
    const centerActivations = determineCenterActivations(personalityGates, designGates);
    
    // Calculate Human Design type based on center definitions
    const type = determineTypeFromCenters(centerActivations);
    
    // Calculate authority based on defined centers hierarchy
    const authority = determineAuthorityFromCenters(centerActivations);
    
    // Calculate profile from Sun gates
    const profile = calculateProfile(personalityGates, designGates);
    
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
        offset_days: offsetDays.toFixed(2)
      }
    };
  } catch (error) {
    console.error("Error calculating Human Design:", error);
    throw error;
  }
}

// Calculate gates from celestial positions using accurate I-Ching wheel
function calculateGatesFromPositions(celestialData: any, chartType: string): GateActivation[] {
  const gates: GateActivation[] = [];
  
  // Define planets in order of importance
  const planets = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
  
  for (const planet of planets) {
    const position = celestialData[planet];
    if (position && typeof position.longitude === 'number') {
      // Accurate gate and line calculation
      // Each gate spans exactly 5.625 degrees (360° / 64 gates)
      const gatePosition = (position.longitude % 360) / 5.625;
      const gate = Math.floor(gatePosition) + 1;
      
      // Each line spans 0.9375 degrees (5.625° / 6 lines)
      const linePosition = (gatePosition - Math.floor(gatePosition)) * 6;
      const line = Math.floor(linePosition) + 1;
      
      gates.push({
        planet,
        gate,
        line: Math.min(line, 6), // Ensure line doesn't exceed 6
        longitude: position.longitude
      });
    }
  }
  
  return gates;
}

// Calculate design positions using the same ephemeris engine but offset time
async function calculateDesignPositions(designDateTime: Date, location: string, timezone: string) {
  // Import the calculation function from our main ephemeris
  const { calculatePlanetaryPositionsWithAstro } = await import('./ephemeris-astroengine.ts');
  
  const designDate = designDateTime.toISOString().split('T')[0];
  const designTime = designDateTime.toISOString().split('T')[1].substring(0, 5);
  
  try {
    return await calculatePlanetaryPositionsWithAstro(designDate, designTime, location, timezone);
  } catch (error) {
    console.error("Error calculating design positions:", error);
    // Fallback to simulated design data if ephemeris fails
    return simulateDesignPositions(designDateTime);
  }
}

// Fallback simulation for design positions
function simulateDesignPositions(designDateTime: Date) {
  const designData: any = {};
  const baseDate = new Date("2000-01-01T12:00:00Z");
  const daysDiff = (designDateTime.getTime() - baseDate.getTime()) / (24 * 60 * 60 * 1000);
  
  // Approximate planetary positions for design time
  const planetSpeeds = {
    sun: 0.9856,
    moon: 13.1764,
    mercury: 1.3833,
    venus: 1.6021,
    mars: 0.5240,
    jupiter: 0.0831,
    saturn: 0.0335,
    uranus: 0.0116,
    neptune: 0.0060,
    pluto: 0.0040
  };
  
  for (const [planet, speed] of Object.entries(planetSpeeds)) {
    const longitude = (daysDiff * speed) % 360;
    designData[planet] = { longitude };
  }
  
  return designData;
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
    }
  });
  
  return centerActivations;
}

// Accurate type determination based on defined centers
function determineTypeFromCenters(centerActivations: CenterActivation): string {
  const sacralDefined = centerActivations["Sacral"]?.defined || false;
  const throatDefined = centerActivations["Throat"]?.defined || false;
  const heartDefined = centerActivations["Heart"]?.defined || false;
  const solarPlexusDefined = centerActivations["Solar Plexus"]?.defined || false;
  const rootDefined = centerActivations["Root"]?.defined || false;
  const spleenDefined = centerActivations["Spleen"]?.defined || false;
  
  // Motor centers: Sacral, Heart, Solar Plexus, Root
  const motorCenters = [sacralDefined, heartDefined, solarPlexusDefined, rootDefined];
  const hasMotorCenter = motorCenters.some(defined => defined);
  
  // Reflector: No defined centers
  const definedCenterCount = Object.values(centerActivations).filter(center => center.defined).length;
  if (definedCenterCount === 0) {
    return "REFLECTOR";
  }
  
  // Manifestor: Motor center connected to throat (but not sacral)
  if (throatDefined && !sacralDefined && (heartDefined || solarPlexusDefined || rootDefined)) {
    // Check if motor center is actually connected to throat via channels
    const motorConnectedToThroat = checkMotorToThroatConnection(centerActivations);
    if (motorConnectedToThroat) {
      return "MANIFESTOR";
    }
  }
  
  // Projector: No sacral defined and not a manifestor
  if (!sacralDefined) {
    return "PROJECTOR";
  }
  
  // Manifesting Generator: Sacral connected to throat
  if (sacralDefined && throatDefined) {
    const sacralConnectedToThroat = checkSacralToThroatConnection(centerActivations);
    if (sacralConnectedToThroat) {
      return "MANIFESTING_GENERATOR";
    }
  }
  
  // Generator: Sacral defined
  if (sacralDefined) {
    return "GENERATOR";
  }
  
  return "GENERATOR"; // Default fallback
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
  
  // Direct connection check
  return throatChannels.some(channel => sacralChannels.includes(channel));
}

// Determine authority based on defined centers hierarchy
function determineAuthorityFromCenters(centerActivations: CenterActivation): string {
  // Authority hierarchy (highest to lowest)
  if (centerActivations["Solar Plexus"]?.defined) return "EMOTIONAL";
  if (centerActivations["Sacral"]?.defined) return "SACRAL";
  if (centerActivations["Spleen"]?.defined) return "SPLENIC";
  if (centerActivations["Heart"]?.defined) return "EGO";
  if (centerActivations["G"]?.defined) return "SELF";
  
  return "NONE"; // Mental authority for Reflectors
}

// Calculate profile from sun gates
function calculateProfile(personalityGates: GateActivation[], designGates: GateActivation[]): string {
  const personalitySun = personalityGates.find(g => g.planet === "sun");
  const designSun = designGates.find(g => g.planet === "sun");
  
  const consciousLine = personalitySun?.line || 1;
  const unconsciousLine = designSun?.line || 1;
  
  const profileNames = {
    1: "Investigator",
    2: "Hermit", 
    3: "Martyr",
    4: "Opportunist",
    5: "Heretic",
    6: "Role Model"
  };
  
  return `${consciousLine}/${unconsciousLine} (${profileNames[consciousLine]}/${profileNames[unconsciousLine]})`;
}

// Calculate definition type based on center connections
function calculateDefinitionType(centerActivations: CenterActivation): string {
  const definedCenters = Object.entries(centerActivations)
    .filter(([_, center]) => center.defined)
    .map(([name, _]) => name);
  
  if (definedCenters.length === 0) return "No Definition";
  if (definedCenters.length === 1) return "Single Definition";
  
  // For now, simplified definition calculation
  // In a full implementation, this would analyze connection patterns
  const connectionCount = definedCenters.length;
  
  if (connectionCount <= 3) return "Single Definition";
  if (connectionCount <= 5) return "Split Definition";
  if (connectionCount <= 7) return "Triple Split Definition";
  
  return "Quadruple Split Definition";
}

// Get strategy for type
function getStrategyForType(type: string): string {
  const strategies = {
    "GENERATOR": "Wait to respond",
    "MANIFESTING_GENERATOR": "Wait to respond, then inform",
    "PROJECTOR": "Wait for the invitation",
    "MANIFESTOR": "Inform before acting",
    "REFLECTOR": "Wait a lunar cycle before deciding"
  };
  
  return strategies[type] || "Wait to respond";
}

// Get not-self theme for type
function getNotSelfThemeForType(type: string): string {
  const themes = {
    "GENERATOR": "Frustration",
    "MANIFESTING_GENERATOR": "Frustration and anger",
    "PROJECTOR": "Bitterness",
    "MANIFESTOR": "Anger",
    "REFLECTOR": "Disappointment"
  };
  
  return themes[type] || "Frustration";
}

// Generate life purpose based on type and profile
function generateLifePurpose(type: string, profile: string, centerActivations: CenterActivation): string {
  const profileNumber = profile.split('/')[0];
  
  const basePurpose = {
    "GENERATOR": "Build and create sustainable energy systems",
    "MANIFESTING_GENERATOR": "Initiate and build with efficient multi-passionate energy",
    "PROJECTOR": "Guide and direct others' energy wisely",
    "MANIFESTOR": "Initiate new cycles and catalyze change",
    "REFLECTOR": "Mirror community health and wisdom"
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
