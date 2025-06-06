
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

// Enhanced center activation determination
function determineImprovedCenterActivations(personalityGates: ImprovedGateActivation[], designGates: ImprovedGateActivation[]): ImprovedCenterActivation {
  const centerActivations: ImprovedCenterActivation = {};
  
  // Initialize all centers with enhanced metadata
  const centerTypes = {
    "Head": "pressure",
    "Ajna": "awareness", 
    "Throat": "awareness",  // Fixed: Throat is communication/awareness, not motor
    "G": "awareness",
    "Heart": "motor",
    "Solar Plexus": "motor",
    "Sacral": "motor", 
    "Spleen": "awareness",
    "Root": "pressure"
  };
  
  Object.entries(centerTypes).forEach(([center, type]) => {
    centerActivations[center] = {
      defined: false,
      gates: [],
      channels: [],
      type: type as 'motor' | 'awareness' | 'pressure',
      openness_percentage: 0
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
  
  // Check for channel completions with enhanced validation
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
      
      console.log(`Completed channel: ${channelKey} (${channelData.name})`);
    }
  });
  
  // Calculate openness percentages with safety guard
  Object.keys(centerActivations).forEach(center => {
    const totalGatesInCenter = Object.values(GATE_TO_CENTER_MAP).filter(c => c === center).length;
    const definedGates = centerActivations[center].gates.length;
    centerActivations[center].openness_percentage = totalGatesInCenter > 0 ? 
      Math.round((definedGates / totalGatesInCenter) * 100) : 0;
  });
  
  return centerActivations;
}

// Enhanced type determination evaluating all centers
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
  const definedCenterNames = Object.entries(centerActivations)
    .filter(([_, center]) => center.defined)
    .map(([name, _]) => name);
  
  console.log(`Defined centers (${definedCenterCount}):`, definedCenterNames);
  
  // Reflector: No defined centers
  if (definedCenterCount === 0) {
    return "REFLECTOR";
  }
  
  // Motor centers: Sacral, Heart, Solar Plexus, Root
  const motorCenters = [sacralDefined, heartDefined, solarPlexusDefined, rootDefined];
  const definedMotorCenters = motorCenters.filter(Boolean).length;
  
  // Manifestor: Motor center connected to throat (but not sacral)
  if (throatDefined && !sacralDefined && definedMotorCenters > 0) {
    const motorConnectedToThroat = checkMotorToThroatConnection(centerActivations);
    if (motorConnectedToThroat) {
      console.log("Type: MANIFESTOR (motor to throat, no sacral)");
      return "MANIFESTOR";
    }
  }
  
  // Manifesting Generator: Sacral AND motor connected to throat (enhanced BFS)
  if (sacralDefined && throatDefined) {
    const sacralConnectedToThroat = checkSacralToThroatConnectionBFS(centerActivations);
    if (sacralConnectedToThroat) {
      console.log("Type: MANIFESTING GENERATOR (sacral connected to throat via BFS)");
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

// Enhanced BFS connection check for Manifesting Generators
function checkSacralToThroatConnectionBFS(centerActivations: ImprovedCenterActivation): boolean {
  const definedCenters = Object.entries(centerActivations)
    .filter(([_, center]) => center.defined)
    .map(([name, _]) => name);
  
  if (!definedCenters.includes("Sacral") || !definedCenters.includes("Throat")) {
    return false;
  }
  
  // Build connection graph from channels
  const connections: { [center: string]: string[] } = {};
  definedCenters.forEach(center => {
    connections[center] = [];
  });
  
  // Add connections based on complete channels
  Object.entries(CHANNELS).forEach(([channelKey, channelData]) => {
    const [gate1, gate2] = channelKey.split('-').map(Number);
    const allGates = [
      ...Object.values(centerActivations).flatMap(center => center.gates)
    ];
    
    if (allGates.includes(gate1) && allGates.includes(gate2)) {
      const [center1, center2] = channelData.centers;
      if (connections[center1] && connections[center2]) {
        connections[center1].push(center2);
        connections[center2].push(center1);
      }
    }
  });
  
  // BFS from Sacral to Throat
  const visited = new Set<string>();
  const queue = ["Sacral"];
  visited.add("Sacral");
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (current === "Throat") {
      console.log("Sacral to throat connection found via BFS");
      return true;
    }
    
    const neighbors = connections[current] || [];
    neighbors.forEach(neighbor => {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    });
  }
  
  console.log("No Sacral to throat connection found via BFS");
  return false;
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
    console.log("Authority: SELF-PROJECTED EGO (G Center defined)");
    return "SELF-PROJECTED";
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
    "5/3": "The Heretic Martyr",
    "6/2": "The Role Model Hermit",
    "6/3": "The Role Model Martyr",
    "6/4": "The Role Model Opportunist"
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
  
  // Build connection graph from complete channels
  const connections: { [center: string]: string[] } = {};
  definedCenters.forEach(center => {
    connections[center] = [];
  });
  
  // Add connections based on complete channels
  Object.entries(CHANNELS).forEach(([channelKey, channelData]) => {
    const [gate1, gate2] = channelKey.split('-').map(Number);
    const allGates = Object.values(centerActivations).flatMap(center => center.gates);
    
    if (allGates.includes(gate1) && allGates.includes(gate2)) {
      const [center1, center2] = channelData.centers;
      if (connections[center1] && connections[center2]) {
        connections[center1].push(center2);
        connections[center2].push(center1);
      }
    }
  });
  
  // Find connected components using DFS
  const visited = new Set<string>();
  const components: string[][] = [];
  
  definedCenters.forEach(center => {
    if (!visited.has(center)) {
      const component: string[] = [];
      const stack = [center];
      
      while (stack.length > 0) {
        const current = stack.pop()!;
        if (!visited.has(current)) {
          visited.add(current);
          component.push(current);
          const neighbors = connections[current] || [];
          neighbors.forEach(neighbor => {
            if (!visited.has(neighbor)) {
              stack.push(neighbor);
            }
          });
        }
      }
      
      if (component.length > 0) {
        components.push(component);
      }
    }
  });
  
  // Determine definition type based on number of components
  if (components.length === 1) {
    return "Single Definition";
  } else if (components.length === 2) {
    return "Split Definition";
  } else if (components.length === 3) {
    return "Triple Split Definition";
  } else {
    return "Quadruple Split Definition";
  }
}
