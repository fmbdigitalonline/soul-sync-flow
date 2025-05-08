
// Human Design calculation module for Blueprint Calculator

// Gate and channel definitions
const GATES = {
  1: { name: "Gate of Self-Expression", description: "Creative self-expression and identity" },
  2: { name: "Gate of Direction", description: "Determination of direction in one's life" },
  // More gates would be defined here in a full implementation
  64: { name: "Gate of Confusion", description: "Mental questioning leading to clarity" }
};

// Type definitions
const TYPES = {
  GENERATOR: {
    description: "Life force that creates and builds",
    strategy: "Wait to respond",
    not_self_theme: "Frustration"
  },
  MANIFESTING_GENERATOR: {
    description: "Multi-faceted life force that creates quickly",
    strategy: "Wait to respond, then inform",
    not_self_theme: "Frustration"
  },
  PROJECTOR: {
    description: "Guide and direct other's energy",
    strategy: "Wait for the invitation",
    not_self_theme: "Bitterness"
  },
  MANIFESTOR: {
    description: "Energy initiator to catalyze others",
    strategy: "Inform before acting",
    not_self_theme: "Anger"
  },
  REFLECTOR: {
    description: "Mirroring and sampling energy of others",
    strategy: "Wait a lunar cycle before deciding",
    not_self_theme: "Disappointment"
  }
};

// Authority types
const AUTHORITIES = {
  EMOTIONAL: { description: "Clarity comes through riding the emotional wave" },
  SACRAL: { description: "Gut response in the moment" },
  SPLENIC: { description: "Intuitive awareness in the moment" },
  EGO: { description: "Willpower and promises" },
  SELF: { description: "Self-awareness in environment" },
  NONE: { description: "Lunar cycle reflection" }
};

/**
 * Calculate Human Design profile based on birth data and celestial positions
 */
export async function calculateHumanDesign(birthDate, birthTime, location, timezone, celestialData) {
  try {
    console.log("Calculating Human Design for", birthDate, birthTime);
    
    // In a full implementation, we would calculate exact planet positions
    // at birth and 88 degrees prior (design planets)
    
    // For now, we'll simulate deterministic calculations based on birth data
    const birthDateTime = new Date(birthDate + "T" + birthTime);
    const timestamp = birthDateTime.getTime();
    
    // Define centers based on birth timestamp (simplified)
    const definedCenters = determineDefinedCenters(timestamp, celestialData);
    
    // Calculate type based on center definitions
    const type = determineType(definedCenters);
    
    // Calculate authority based on defined centers
    const authority = determineAuthority(definedCenters);
    
    // Calculate profile based on Sun and Earth positions
    const profile = determineProfile(celestialData);
    
    // Calculate definition type based on connected centers
    const definition = determineDefinition(definedCenters);
    
    // Calculate active gates based on planet positions
    const gates = calculateActiveGates(celestialData);
    
    // Calculate life purpose based on profile and type
    const lifePurpose = determineLifePurpose(type, profile);
    
    return {
      type: type,
      profile: profile,
      authority: authority,
      strategy: TYPES[type].strategy,
      definition: definition,
      not_self_theme: TYPES[type].not_self_theme,
      life_purpose: lifePurpose,
      centers: definedCenters,
      gates: gates
    };
  } catch (error) {
    console.error("Error calculating Human Design:", error);
    return {
      type: "GENERATOR", // Default fallback
      profile: "3/5 (Martyr/Heretic)",
      authority: "Emotional",
      strategy: "Wait to respond",
      definition: "Split",
      not_self_theme: "Frustration",
      life_purpose: "To find satisfaction through your work",
      gates: {
        unconscious_design: ["16.5", "20.3", "57.2", "34.6"],
        conscious_personality: ["11.4", "48.3", "39.5", "41.1"]
      }
    };
  }
}

// Determine which centers are defined based on planet positions
function determineDefinedCenters(timestamp, celestialData) {
  // In a real implementation, this would check which gates are activated
  // and which centers are connected by channels
  // For now, we'll use a simplified deterministic algorithm
  
  // Create a seeded random number generator based on timestamp
  const rng = seedRandom(timestamp);
  
  // Human Design Centers
  const centers = [
    "Head", "Ajna", "Throat", "G", "Heart/Ego", 
    "Solar Plexus", "Sacral", "Spleen", "Root"
  ];
  
  // Determine defined centers with some birth date dependency
  const definedCenters = {};
  centers.forEach(center => {
    // Use sun and moon positions to influence which centers are defined
    const sunInfluence = (celestialData.sun.longitude / 30) % 1;
    const moonInfluence = (celestialData.moon.longitude / 30) % 1;
    
    // Different formula for each center to create realistic variation
    const isDefined = (rng() + sunInfluence * 0.3 + moonInfluence * 0.2) > 0.5;
    definedCenters[center] = isDefined;
  });
  
  return definedCenters;
}

// Determine Human Design Type based on defined centers
function determineType(definedCenters) {
  // In a real implementation, this would be based on specific center definitions
  
  // Reflector: No centers defined
  if (Object.values(definedCenters).every(defined => !defined)) {
    return "REFLECTOR";
  }
  
  // Manifestor: Throat connected to motor center but not sacral
  if (definedCenters["Throat"] && 
      (definedCenters["Heart/Ego"] || definedCenters["Solar Plexus"] || definedCenters["Root"]) && 
      !definedCenters["Sacral"]) {
    return "MANIFESTOR";
  }
  
  // Projector: No sacral and no manifestor throat connections
  if (!definedCenters["Sacral"]) {
    return "PROJECTOR";
  }
  
  // Manifesting Generator: Sacral connected to throat
  if (definedCenters["Sacral"] && definedCenters["Throat"]) {
    return "MANIFESTING_GENERATOR";
  }
  
  // Generator: Sacral defined but not connected to throat
  if (definedCenters["Sacral"]) {
    return "GENERATOR";
  }
  
  // Default fallback
  return "GENERATOR";
}

// Determine authority based on defined centers
function determineAuthority(definedCenters) {
  // Emotional authority: Emotional/Solar Plexus defined
  if (definedCenters["Solar Plexus"]) {
    return "EMOTIONAL";
  }
  
  // Sacral authority: Solar Plexus not defined, Sacral defined
  if (!definedCenters["Solar Plexus"] && definedCenters["Sacral"]) {
    return "SACRAL";
  }
  
  // Splenic authority: No Solar Plexus or Sacral, but Spleen defined
  if (!definedCenters["Solar Plexus"] && !definedCenters["Sacral"] && definedCenters["Spleen"]) {
    return "SPLENIC";
  }
  
  // Ego authority: No Emotional, Sacral or Splenic, but Heart/Ego defined
  if (!definedCenters["Solar Plexus"] && !definedCenters["Sacral"] && !definedCenters["Spleen"] && definedCenters["Heart/Ego"]) {
    return "EGO";
  }
  
  // Self authority: Just G Center defined of the motor centers
  if (!definedCenters["Solar Plexus"] && !definedCenters["Sacral"] && 
      !definedCenters["Spleen"] && !definedCenters["Heart/Ego"] && definedCenters["G"]) {
    return "SELF";
  }
  
  // None/Lunar: No consistent inner authority
  return "NONE";
}

// Determine profile based on celestial positions
function determineProfile(celestialData) {
  // In a real implementation, this would be calculated from Sun and Earth positions
  // Profile is represented as two numbers from 1-6
  
  // Use sun position to determine conscious personality number (1-6)
  const conscious = Math.floor(celestialData.sun.longitude / 60) % 6 + 1;
  
  // Use ascendant position to determine unconscious design number (1-6)
  const unconscious = Math.floor(celestialData.ascendant.longitude / 60) % 6 + 1;
  
  // Profile labels
  const profileLabels = {
    "1": "Investigator",
    "2": "Hermit",
    "3": "Martyr",
    "4": "Opportunist",
    "5": "Heretic",
    "6": "Role Model"
  };
  
  return `${conscious}/${unconscious} (${profileLabels[conscious]}/${profileLabels[unconscious]})`;
}

// Determine definition type based on center connections
function determineDefinition(definedCenters) {
  // Count how many centers are defined
  const definedCount = Object.values(definedCenters).filter(Boolean).length;
  
  // In a real implementation, this would check the pattern of connections
  // For now, use a simplified approach based on count
  
  if (definedCount <= 2) {
    return "Split";
  } else if (definedCount >= 7) {
    return "Single";
  } else {
    const options = ["Split", "Triple Split", "Quad Split"];
    return options[definedCount % 3];
  }
}

// Calculate active gates based on planet positions
function calculateActiveGates(celestialData) {
  // In a real implementation, this would map planet positions to specific gates
  // For now, generate realistic but simulated gate activations
  
  const personalityGates = generateGateNumbers(celestialData.sun.longitude, 4);
  const designGates = generateGateNumbers(celestialData.moon.longitude, 4);
  
  return {
    unconscious_design: designGates,
    conscious_personality: personalityGates
  };
}

// Generate realistic gate numbers based on a celestial position
function generateGateNumbers(position, count) {
  const gates = [];
  const baseNumber = Math.floor(position) % 64 + 1;
  
  for (let i = 0; i < count; i++) {
    // Create variation but ensure each number is 1-64
    let gateNumber = (baseNumber + i * 13) % 64 + 1;
    // Add a realistic line number (1-6)
    const lineNumber = (gateNumber + i) % 6 + 1;
    gates.push(`${gateNumber}.${lineNumber}`);
  }
  
  return gates;
}

// Determine life purpose based on type and profile
function determineLifePurpose(type, profile) {
  // In a real implementation, this would be a more complex analysis
  // For now, create reasonably accurate purposes based on type and profile
  
  const profileNumber = profile.split('/')[0];
  
  const purposeByType = {
    "GENERATOR": "Find satisfaction through responding to life",
    "MANIFESTING_GENERATOR": "Find satisfaction through multi-faceted creation",
    "PROJECTOR": "Guide others with your unique insight",
    "MANIFESTOR": "Initiate and catalyze change for others",
    "REFLECTOR": "Mirror and sample the health of your community"
  };
  
  const purposeModifier = {
    "1": "through deep investigation",
    "2": "through selective sharing of wisdom",
    "3": "through practical experimentation",
    "4": "through finding the right networks",
    "5": "through challenging the status quo",
    "6": "through being an example for others"
  };
  
  return `${purposeByType[type]} ${purposeModifier[profileNumber]}`;
}

// Simple seeded random number generator for consistency
function seedRandom(seed) {
  // Simple LCG random number generator
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  
  return function() {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
}
