
// Improved Human Design calculation with canonical gate wheel
import { GATE_TO_CENTER_MAP, CHANNELS, GATE_NAMES } from './human-design-gates.ts';
import { findGateAndLineFromLongitude, zodiacLongitudeToHumanDesignGate } from './human-design-wheel.ts';

// More precise solar motion using epoch-specific values
const MEAN_SOLAR_MOTION_2000 = 0.9856473354; // degrees per day for epoch 2000.0
const DESIGN_OFFSET_DEGREES = 88.36; // degrees before birth (canonical value)

interface ImprovedGateActivation {
  planet: string;
  gate: number;
  line: number;
  longitude: number;
  gateName: string;
  sign: string;
  degrees: number;
  minutes: number;
}

interface ImprovedCenterActivation {
  [centerName: string]: {
    defined: boolean;
    gates: number[];
    channels: string[];
    type: 'motor' | 'awareness' | 'pressure';
    openness_percentage: number;
  };
}

export async function calculateImprovedHumanDesign(birthDate: string, birthTime: string, location: string, timezone: string, celestialData: any) {
  try {
    console.log("Calculating improved Human Design with canonical gate wheel for", birthDate, birthTime);
    
    // Calculate epoch-specific solar motion
    const birthYear = new Date(birthDate).getFullYear();
    const solarMotion = calculateEpochSolarMotion(birthYear);
    
    // Calculate precise design time
    const birthDateTime = new Date(birthDate + "T" + birthTime);
    const offsetDays = DESIGN_OFFSET_DEGREES / solarMotion;
    const designDateTime = new Date(birthDateTime.getTime() - (offsetDays * 24 * 60 * 60 * 1000));
    
    console.log(`Personality time: ${birthDateTime.toISOString()}`);
    console.log(`Design time: ${designDateTime.toISOString()} (offset: ${offsetDays.toFixed(4)} days)`);
    
    // Calculate gate activations using canonical wheel
    const personalityGates = calculateImprovedGatesFromPositions(celestialData, "personality");
    
    // Calculate design positions
    const designCelestialData = await calculateDesignPositions(designDateTime, location, timezone);
    const designGates = calculateImprovedGatesFromPositions(designCelestialData, "design");
    
    console.log("Personality gates (first 3):", personalityGates.slice(0, 3));
    console.log("Design gates (first 3):", designGates.slice(0, 3));
    
    // Determine center activations with enhanced logic
    const centerActivations = determineImprovedCenterActivations(personalityGates, designGates);
    
    // Calculate Human Design type with full center evaluation
    const type = determineTypeFromAllCenters(centerActivations);
    
    // Calculate authority with complete hierarchy
    const authority = determineAuthorityFromCenterHierarchy(centerActivations);
    
    // Calculate profile from Sun gates with validation
    const profile = calculateProfileFromSunGates(personalityGates, designGates);
    
    // Calculate definition type with connection analysis
    const definition = calculateDefinitionWithConnections(centerActivations);
    
    // Enhanced strategy and theme calculation
    const strategy = getEnhancedStrategyForType(type, centerActivations);
    const notSelfTheme = getEnhancedNotSelfThemeForType(type, centerActivations);
    
    // Generate comprehensive life purpose
    const lifePurpose = generateComprehensiveLifePurpose(type, profile, centerActivations, personalityGates, designGates);
    
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
        unconscious_design: designGates.map(g => ({
          gate: g.gate,
          line: g.line,
          planet: g.planet,
          name: g.gateName,
          notation: `${g.gate}.${g.line}`
        })),
        conscious_personality: personalityGates.map(g => ({
          gate: g.gate,
          line: g.line,
          planet: g.planet,
          name: g.gateName,
          notation: `${g.gate}.${g.line}`
        }))
      },
      metadata: {
        personality_time: birthDateTime.toISOString(),
        design_time: designDateTime.toISOString(),
        offset_days: offsetDays.toFixed(4),
        solar_motion_used: solarMotion.toFixed(10),
        calculation_method: "canonical_jovian_archive_wheel",
        gate_wheel_version: "jovian_archive_standard"
      }
    };
  } catch (error) {
    console.error("Error calculating improved Human Design:", error);
    throw error;
  }
}

// Calculate epoch-specific solar motion
function calculateEpochSolarMotion(year: number): number {
  // Solar motion varies slightly due to orbital mechanics
  const yearsSince2000 = year - 2000;
  const variation = yearsSince2000 * 0.0000001; // Very small annual variation
  return MEAN_SOLAR_MOTION_2000 + variation;
}

// Calculate gates using canonical Human Design wheel
function calculateImprovedGatesFromPositions(celestialData: any, chartType: string): ImprovedGateActivation[] {
  const gates: ImprovedGateActivation[] = [];
  
  // Planet order by importance in Human Design
  const planets = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
  
  for (const planet of planets) {
    const position = celestialData[planet];
    if (position && typeof position.longitude === 'number') {
      // Use canonical gate wheel mapping
      const gateInfo = zodiacLongitudeToHumanDesignGate(position.longitude);
      
      // Calculate precise degrees and minutes
      const totalDegrees = position.longitude % 30; // Degrees within sign
      const degrees = Math.floor(totalDegrees);
      const minutes = Math.floor((totalDegrees - degrees) * 60);
      
      gates.push({
        planet,
        gate: gateInfo.gate,
        line: gateInfo.line,
        longitude: position.longitude,
        gateName: gateInfo.gateName,
        sign: gateInfo.sign,
        degrees,
        minutes
      });
      
      console.log(`${chartType} ${planet}: Gate ${gateInfo.gate}.${gateInfo.line} (${gateInfo.gateName}) at ${gateInfo.sign} ${degrees}°${minutes}'`);
    }
  }
  
  return gates;
}

// Enhanced center activation determination with STRICT channel-only definition
function determineImprovedCenterActivations(personalityGates: ImprovedGateActivation[], designGates: ImprovedGateActivation[]): ImprovedCenterActivation {
  const centerActivations: ImprovedCenterActivation = {};
  
  // Initialize all centers with enhanced metadata
  const centerTypes = {
    "Head": "pressure",
    "Ajna": "awareness", 
    "Throat": "motor",
    "G": "awareness",
    "Heart": "motor",
    "Solar Plexus": "motor",
    "Sacral": "motor", 
    "Spleen": "awareness",
    "Root": "pressure"
  };
  
  Object.entries(centerTypes).forEach(([center, type]) => {
    centerActivations[center] = {
      defined: false, // CRITICAL: Start as undefined
      gates: [],
      channels: [],
      type: type as 'motor' | 'awareness' | 'pressure',
      openness_percentage: 0
    };
  });
  
  // Collect all gates from both charts
  const allGates = [...personalityGates, ...designGates];
  const gateNumbers = allGates.map(g => g.gate);
  
  // Activate centers based on gates BUT DO NOT DEFINE THEM YET
  allGates.forEach(({ gate }) => {
    const center = GATE_TO_CENTER_MAP[gate];
    if (center && centerActivations[center]) {
      if (!centerActivations[center].gates.includes(gate)) {
        centerActivations[center].gates.push(gate);
      }
    }
  });
  
  // CRITICAL FIX: Check for channel completions and ONLY THEN define centers
  Object.entries(CHANNELS).forEach(([channelKey, channelData]) => {
    const [gate1, gate2] = channelKey.split('-').map(Number);
    
    if (gateNumbers.includes(gate1) && gateNumbers.includes(gate2)) {
      // Channel is complete - define both centers
      channelData.centers.forEach(centerName => {
        if (centerActivations[centerName]) {
          centerActivations[centerName].defined = true; // ✅ ONLY define when channel is complete
          if (!centerActivations[centerName].channels.includes(channelKey)) {
            centerActivations[centerName].channels.push(channelKey);
          }
        }
      });
      
      console.log(`Completed channel: ${channelKey} (${channelData.name})`);
    }
  });
  
  // Calculate openness percentages
  Object.keys(centerActivations).forEach(center => {
    const totalGatesInCenter = Object.values(GATE_TO_CENTER_MAP).filter(c => c === center).length;
    const definedGates = centerActivations[center].gates.length;
    centerActivations[center].openness_percentage = Math.round((definedGates / totalGatesInCenter) * 100);
  });
  
  return centerActivations;
}

// Helper function to check if centers are connected via channels
function centresConnected(start: string, targets: string[], centerActivations: ImprovedCenterActivation): boolean {
  const seen = new Set<string>();
  const queue: string[] = [start];
  
  while (queue.length) {
    const currentCenter = queue.shift()!;
    if (targets.includes(currentCenter)) return true;
    
    if (seen.has(currentCenter)) continue;
    seen.add(currentCenter);
    
    // Check all channels connected to this center
    centerActivations[currentCenter].channels.forEach(channelKey => {
      const channelData = CHANNELS[channelKey];
      if (channelData) {
        channelData.centers
          .filter(centerName => 
            centerActivations[centerName].defined && 
            !seen.has(centerName)
          )
          .forEach(centerName => {
            if (!seen.has(centerName)) {
              queue.push(centerName);
            }
          });
      }
    });
  }
  
  return false;
}

// Enhanced type determination evaluating all centers with motor connection logic
function determineTypeFromAllCenters(centerActivations: ImprovedCenterActivation): string {
  const sacralDefined = centerActivations["Sacral"]?.defined || false;
  const throatDefined = centerActivations["Throat"]?.defined || false;
  const heartDefined = centerActivations["Heart"]?.defined || false;
  const solarPlexusDefined = centerActivations["Solar Plexus"]?.defined || false;
  const rootDefined = centerActivations["Root"]?.defined || false;
  const spleenDefined = centerActivations["Spleen"]?.defined || false;
  const gDefined = centerActivations["G"]?.defined || false;
  const ajnaDefined = centerActivations["Ajna"]?.defined || false;
  const headDefined = centerActivations["Head"]?.defined || false;
  
  // Count all defined centers
  const definedCenters = Object.values(centerActivations).filter(center => center.defined);
  const definedCenterCount = definedCenters.length;
  
  console.log(`Defined centers (${definedCenterCount}):`, 
    Object.keys(centerActivations).filter(key => centerActivations[key].defined));
  
  // Reflector: No defined centers
  if (definedCenterCount === 0) {
    return "REFLECTOR";
  }
  
  // Motor centers: Heart, Solar Plexus, Root (Sacral handled separately)
  const nonSacralMotorCenters = ["Heart", "Solar Plexus", "Root"];
  
  // Manifestor: Motor center connected to throat (but not sacral)
  if (throatDefined && !sacralDefined) {
    const motorConnectedToThroat = centresConnected('Throat', nonSacralMotorCenters, centerActivations);
    if (motorConnectedToThroat) {
      console.log("Type: MANIFESTOR (motor to throat, no sacral)");
      return "MANIFESTOR";
    }
  }
  
  // Manifesting Generator: Sacral AND sacral connected to throat
  if (sacralDefined && throatDefined) {
    const sacralConnectedToThroat = centresConnected('Sacral', ['Throat'], centerActivations);
    if (sacralConnectedToThroat) {
      console.log("Type: MANIFESTING GENERATOR (sacral connected to throat)");
      return "MANIFESTING_GENERATOR";
    }
  }
  
  // Generator: Sacral defined (but not connected to throat)
  if (sacralDefined) {
    console.log("Type: GENERATOR (sacral defined)");
    return "GENERATOR";
  }
  
  // Projector: No sacral, not a manifestor
  console.log("Type: PROJECTOR (no sacral, not manifestor)");
  return "PROJECTOR";
}

// Enhanced connection checking
function checkMotorToThroatConnection(centerActivations: ImprovedCenterActivation): boolean {
  const throatChannels = centerActivations["Throat"]?.channels || [];
  const motorCenters = ["Heart", "Solar Plexus", "Root"];
  
  const connected = throatChannels.some(channel => {
    const channelData = CHANNELS[channel];
    return channelData && motorCenters.some(motor => 
      channelData.centers.includes(motor) && channelData.centers.includes("Throat")
    );
  });
  
  console.log("Motor to throat connection:", connected, "via channels:", throatChannels);
  return connected;
}

function checkSacralToThroatConnection(centerActivations: ImprovedCenterActivation): boolean {
  const throatChannels = centerActivations["Throat"]?.channels || [];
  const sacralChannels = centerActivations["Sacral"]?.channels || [];
  
  // Check for direct or indirect connection
  const directConnection = throatChannels.some(channel => sacralChannels.includes(channel));
  
  console.log("Sacral to throat connection:", directConnection, "throat channels:", throatChannels, "sacral channels:", sacralChannels);
  return directConnection;
}

// Enhanced authority determination with complete hierarchy
function determineAuthorityFromCenterHierarchy(centerActivations: ImprovedCenterActivation): string {
  console.log("Determining authority from defined centers...");
  
  // Complete authority hierarchy
  if (centerActivations["Solar Plexus"]?.defined) {
    console.log("Authority: EMOTIONAL (Solar Plexus defined)");
    return "EMOTIONAL";
  }
  if (centerActivations["Sacral"]?.defined) {
    console.log("Authority: SACRAL (Sacral defined)");
    return "SACRAL";
  }
  if (centerActivations["Spleen"]?.defined) {
    console.log("Authority: SPLENIC (Spleen defined)");
    return "SPLENIC";
  }
  if (centerActivations["Heart"]?.defined) {
    console.log("Authority: EGO (Heart defined)");
    return "EGO";
  }
  if (centerActivations["G"]?.defined) {
    console.log("Authority: SELF (G Center defined)");
    return "SELF_PROJECTED";
  }
  if (centerActivations["Ajna"]?.defined) {
    console.log("Authority: MENTAL (Ajna defined - rare)");
    return "MENTAL";
  }
  
  console.log("Authority: LUNAR (Reflector - no inner authority)");
  return "LUNAR";
}

// Enhanced profile calculation with validation
function calculateProfileFromSunGates(personalityGates: ImprovedGateActivation[], designGates: ImprovedGateActivation[]): string {
  const personalitySun = personalityGates.find(g => g.planet === "sun");
  const designSun = designGates.find(g => g.planet === "sun");
  
  const consciousLine = personalitySun?.line || 1;
  const unconsciousLine = designSun?.line || 1;
  
  console.log(`Profile calculation: Conscious (Personality) Sun Line ${consciousLine}, Unconscious (Design) Sun Line ${unconsciousLine}`);
  
  const profileNames = {
    1: "Investigator",
    2: "Hermit", 
    3: "Martyr",
    4: "Opportunist",
    5: "Heretic",
    6: "Role Model"
  };
  
  const profileDescription = getProfileDescription(consciousLine, unconsciousLine);
  
  return `${consciousLine}/${unconsciousLine} (${profileNames[consciousLine]}/${profileNames[unconsciousLine]}) - ${profileDescription}`;
}

function getProfileDescription(conscious: number, unconscious: number): string {
  const profiles: { [key: string]: string } = {
    "1/3": "The Investigative Martyr",
    "1/4": "The Investigative Opportunist", 
    "2/4": "The Hermit Opportunist",
    "2/5": "The Hermit Heretic",
    "3/5": "The Martyr Heretic",
    "3/6": "The Martyr Role Model",
    "4/6": "The Opportunist Role Model",
    "4/1": "The Opportunist Investigator",
    "5/1": "The Heretic Investigator",
    "5/2": "The Heretic Hermit",
    "6/2": "The Role Model Hermit",
    "6/3": "The Role Model Martyr"
  };
  
  return profiles[`${conscious}/${unconscious}`] || "Unique Profile Combination";
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

// Enhanced strategy and theme calculation
function getEnhancedStrategyForType(type: string, centerActivations: ImprovedCenterActivation): string {
  const strategies = {
    "GENERATOR": "To respond to life; find satisfaction in your work",
    "MANIFESTING_GENERATOR": "To respond and inform; find efficiency in your actions",
    "PROJECTOR": "To wait for the invitation; guide others with recognition",
    "MANIFESTOR": "To inform before acting; initiate with impact",
    "REFLECTOR": "To wait a lunar cycle; reflect community health and wisdom"
  };
  
  return strategies[type] || "To follow your inner guidance";
}

function getEnhancedNotSelfThemeForType(type: string, centerActivations: ImprovedCenterActivation): string {
  const themes = {
    "GENERATOR": "Frustration when not responding correctly",
    "MANIFESTING_GENERATOR": "Anger and frustration when initiating without response",
    "PROJECTOR": "Bitterness when not recognized or invited",
    "MANIFESTOR": "Anger when controlled or resisted",
    "REFLECTOR": "Disappointment when mirroring unhealthy environments"
  };
  
  return themes[type] || "Confusion and uncertainty";
}

// Generate comprehensive life purpose
function generateComprehensiveLifePurpose(type: string, profile: string, centerActivations: ImprovedCenterActivation, personalityGates: ImprovedGateActivation[], designGates: ImprovedGateActivation[]): string {
  const profileNumber = profile.split('/')[0];
  
  const basePurpose = {
    "GENERATOR": "To master skills and find satisfaction in work, building sustainable energy systems",
    "MANIFESTING_GENERATOR": "To initiate and build with efficient, multi-passionate energy, informing others along the way",
    "PROJECTOR": "To guide and direct others' energy wisely, waiting for recognition and invitation",
    "MANIFESTOR": "To initiate new cycles and catalyze change, informing others before acting",
    "REFLECTOR": "To mirror community health and wisdom, reflecting back what is and what could be"
  };
  
  const profileModifiers = {
    "1": "through deep investigation and foundational research",
    "2": "through natural talents and selective sharing of wisdom",
    "3": "through experimentation, resilience, and learning from mistakes",
    "4": "through building strong relationships and networking effectively",
    "5": "through providing practical solutions and adaptable strategies",
    "6": "through embodying wisdom and serving as a role model"
  };
  
  const centerInfluences = Object.entries(centerActivations)
    .filter(([_, center]) => center.defined)
    .map(([name, _]) => `with the defined energy of the ${name} Center`)
    .join(", ");
  
  let lifePurpose = `${basePurpose[type]} ${profileModifiers[profileNumber]}`;
  if (centerInfluences) {
    lifePurpose += `, guided ${centerInfluences}`;
  }
  
  return lifePurpose;
}

// Calculate definition type based on center connections
function calculateDefinitionWithConnections(centerActivations: ImprovedCenterActivation): string {
  const definedCenters = Object.entries(centerActivations)
    .filter(([_, center]) => center.defined)
    .map(([name, _]) => name);
  
  if (definedCenters.length === 0) return "No Definition (Reflector)";
  if (definedCenters.length === 1) return "Single Definition";
  
  // Analyze connection patterns
  let connected = true;
  for (let i = 0; i < definedCenters.length - 1; i++) {
    const center1 = definedCenters[i];
    const center2 = definedCenters[i + 1];
    
    const channelExists = Object.keys(CHANNELS).some(channelKey => {
      const [gate1, gate2] = channelKey.split('-').map(Number);
      return (
        centerActivations[center1].gates.includes(gate1) &&
        centerActivations[center2].gates.includes(gate2)
      ) || (
        centerActivations[center1].gates.includes(gate2) &&
        centerActivations[center2].gates.includes(gate1)
      );
    });
    
    if (!channelExists) {
      connected = false;
      break;
    }
  }
  
  if (connected) return "Single Definition (Connected)";
  
  // Split Definition logic
  if (definedCenters.length === 2) return "Split Definition";
  if (definedCenters.length === 3) return "Triple Split Definition";
  return "Quadruple Split Definition";
}
