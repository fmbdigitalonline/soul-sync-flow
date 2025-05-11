
// Human Design calculation module using hdkit
import { calculateLifePath } from "./numerology.ts";

// Type definitions for Human Design types
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

// Human Design centers
const CENTERS = [
  "Head", "Ajna", "Throat", "G", "Heart/Ego", 
  "Solar Plexus", "Sacral", "Spleen", "Root"
];

// Using a deterministic algorithm for development/debug - will replace with hdkit
export async function calculateHumanDesign(birthDate, birthTime, location, timezone, celestialData) {
  try {
    console.log(`Calculating Human Design for: ${birthDate} ${birthTime} at ${location}, timezone: ${timezone}`);

    /* In a full implementation with hdkit, you would use:
    
    // First, install hdkit via:
    // npm install github:jdempcy/hdkit#main
    
    import { Chart, getBodygraph } from "hdkit";
    
    // Create a Human Design chart
    const chart = new Chart({
      date: birthDate, // YYYY-MM-DD
      time: birthTime, // HH:MM
      location: location, // City/Country
      timezone: timezone // Timezone offset or name
    });
    
    // Get the bodygraph
    const bodygraph = getBodygraph(chart);
    
    return {
      type: bodygraph.type,
      profile: `${bodygraph.profile.conscious}/${bodygraph.profile.unconscious}`,
      authority: bodygraph.authority,
      strategy: bodygraph.strategy,
      definition: bodygraph.definition,
      // etc.
    };
    
    */
    
    // For now, let's create a deterministic but realistic result based on the inputs
    const birthDateTime = new Date(birthDate + "T" + birthTime);
    const timestamp = birthDateTime.getTime();
    
    // Calculate a deterministic but realistic human design profile based on the birth date and time
    // This will be replaced with actual hdkit calculations in the final version
    const definedCenters = determineDefinedCenters(timestamp, celestialData);
    const type = determineType(definedCenters);
    const authority = determineAuthority(definedCenters);
    const profile = determineProfile(celestialData);
    const definition = determineDefinition(definedCenters);
    const gates = calculateActiveGates(celestialData);
    const lifePurpose = determineLifePurpose(type, profile);
    
    // Calculate Life Path number for cross-validation
    const lifePath = calculateLifePath(birthDate);
    console.log(`Life Path number calculated: ${lifePath}`);
    
    return {
      type: type,
      profile: profile,
      authority: authority,
      strategy: TYPES[type].strategy,
      definition: definition,
      not_self_theme: TYPES[type].not_self_theme,
      life_purpose: lifePurpose,
      centers: definedCenters,
      gates: gates,
      // Additional fields for cross-validation
      life_path: lifePath,
      birth_timestamp: timestamp
    };
  } catch (error) {
    console.error("Error calculating Human Design:", error);
    throw error; // No fallback to see what's going wrong
  }
}

// Determine which centers are defined
function determineDefinedCenters(timestamp, celestialData) {
  console.log(`Determining defined centers with timestamp: ${timestamp}`);
  
  // Create a seeded random number generator based on timestamp
  const rng = seedRandom(timestamp);
  
  // Determine defined centers with birth date dependency
  const definedCenters = {};
  CENTERS.forEach(center => {
    // Use sun and moon positions to influence which centers are defined
    const sunInfluence = celestialData?.sun?.longitude ? (celestialData.sun.longitude / 30) % 1 : 0.5;
    const moonInfluence = celestialData?.moon?.longitude ? (celestialData.moon.longitude / 30) % 1 : 0.3;
    
    // Different formula for each center to create realistic variation
    const isDefined = (rng() + sunInfluence * 0.3 + moonInfluence * 0.2) > 0.5;
    definedCenters[center] = isDefined;
    console.log(`Center ${center}: ${isDefined ? 'Defined' : 'Undefined'}`);
  });
  
  return definedCenters;
}

// Determine Human Design Type based on defined centers
function determineType(definedCenters) {
  console.log(`Determining Human Design Type`);
  
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
  console.log(`Determining Authority`);
  
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
  console.log(`Determining Profile`);
  
  // Use sun position to determine conscious personality number (1-6)
  const conscious = celestialData?.sun?.longitude 
    ? Math.floor(celestialData.sun.longitude / 60) % 6 + 1 
    : Math.floor(Math.random() * 6) + 1;
  
  // Use ascendant position to determine unconscious design number (1-6)
  const unconscious = celestialData?.ascendant?.longitude 
    ? Math.floor(celestialData.ascendant.longitude / 60) % 6 + 1
    : Math.floor(Math.random() * 6) + 1;
  
  // Profile labels
  const profileLabels = {
    "1": "Investigator",
    "2": "Hermit",
    "3": "Martyr",
    "4": "Opportunist",
    "5": "Heretic",
    "6": "Role Model"
  };
  
  const profileStr = `${conscious}/${unconscious} (${profileLabels[conscious]}/${profileLabels[unconscious]})`;
  console.log(`Profile determined: ${profileStr}`);
  return profileStr;
}

// Determine definition type based on center connections
function determineDefinition(definedCenters) {
  // Count how many centers are defined
  const definedCount = Object.values(definedCenters).filter(Boolean).length;
  console.log(`Definition: ${definedCount} centers are defined`);
  
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
  console.log(`Calculating active gates`);
  
  // Generate realistic gate numbers based on celestial positions
  const personalityGates = celestialData?.sun?.longitude 
    ? generateGateNumbers(celestialData.sun.longitude, 4) 
    : ["16.5", "20.3", "57.2", "34.6"];
    
  const designGates = celestialData?.moon?.longitude 
    ? generateGateNumbers(celestialData.moon.longitude, 4)
    : ["11.4", "48.3", "39.5", "41.1"];
  
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
  console.log(`Determining life purpose for ${type} with profile ${profile}`);
  
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
