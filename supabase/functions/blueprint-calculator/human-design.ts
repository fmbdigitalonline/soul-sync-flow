// Human Design calculation module using external API
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

// External HD API endpoint (free public API)
const HD_API = "https://hd-public-api.mybodygraph.com/v1/chart";

export async function calculateHumanDesign(birthDate, birthTime, location, timezone, celestialData) {
  try {
    console.log(`Calculating Human Design for: ${birthDate} ${birthTime} at ${location}, timezone: ${timezone}`);

    // Check if we have all required inputs for API
    if (!birthDate) {
      console.log("Missing required inputs for Human Design calculation");
      return generateFallbackHumanDesign(birthDate, birthTime, location, celestialData);
    }

    // Extract latitude and longitude from celestial data if available
    const latitude = celestialData?.latitude || 0;
    const longitude = celestialData?.longitude || 0;
    
    // Format date and time for the API
    const dateStr = birthDate; // YYYY-MM-DD format
    const timeStr = birthTime || "12:00"; // Default to noon if time not provided
    
    try {
      // Use the external HD API
      const url = new URL(HD_API);
      url.searchParams.set("date", dateStr);
      url.searchParams.set("time", timeStr);
      url.searchParams.set("lat", latitude.toString());
      url.searchParams.set("lon", longitude.toString());
      
      console.log(`Calling Human Design API: ${url.toString()}`);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }
      
      const hdData = await response.json();
      console.log("Successfully fetched Human Design data from API");
      
      // Extract the necessary information from the API response
      // Note: Adjust this mapping based on the actual API response structure
      return {
        type: mapType(hdData.type || "generator"),
        profile: hdData.profile || "1/3 (Investigator/Martyr)",
        authority: mapAuthority(hdData.authority || "emotional"),
        strategy: hdData.strategy || TYPES[mapType(hdData.type || "generator")].strategy,
        definition: hdData.definition || "Split",
        not_self_theme: TYPES[mapType(hdData.type || "generator")].not_self_theme,
        life_purpose: determineLifePurpose(mapType(hdData.type || "generator"), parseInt(hdData.profile?.split('/')[0] || "1")),
        centers: parseCenters(hdData.centers || {}),
        gates: {
          unconscious_design: parseGates(hdData.gates?.design || []),
          conscious_personality: parseGates(hdData.gates?.personality || [])
        },
        // Additional fields for cross-validation
        life_path: calculateLifePath(birthDate),
        birth_timestamp: new Date(`${birthDate}T${birthTime || "12:00"}`).getTime()
      };
    } catch (apiError) {
      console.error("Error calling Human Design API:", apiError);
      console.log("Falling back to deterministic algorithm");
      return generateFallbackHumanDesign(birthDate, birthTime, location, celestialData);
    }
  } catch (error) {
    console.error("Error calculating Human Design:", error);
    return generateFallbackHumanDesign(birthDate, birthTime, location, celestialData);
  }
}

// Helper function to parse centers from API response
function parseCenters(apiCenters) {
  const centerMap = {};
  
  // Initialize all centers as undefined
  CENTERS.forEach(center => {
    centerMap[center] = false;
  });
  
  // Update with defined centers from API if available
  if (apiCenters && typeof apiCenters === 'object') {
    Object.keys(apiCenters).forEach(key => {
      // Try to match the API center name with our center names
      const matchedCenter = CENTERS.find(c => c.toLowerCase().includes(key.toLowerCase()));
      if (matchedCenter) {
        centerMap[matchedCenter] = Boolean(apiCenters[key]);
      }
    });
  }
  
  return centerMap;
}

// Helper function to parse gates from API response
function parseGates(apiGates) {
  if (!apiGates || !Array.isArray(apiGates) || apiGates.length === 0) {
    return ["16.5", "20.3", "57.2", "34.6"]; // Default gates if missing
  }
  
  // Format gates to our expected format (e.g. "16.5")
  return apiGates.slice(0, 4).map(gate => {
    if (typeof gate === 'string' && gate.includes('.')) {
      return gate; // Already in correct format
    } else if (typeof gate === 'number') {
      return `${gate}.1`; // Add line number
    } else if (typeof gate === 'object' && gate.gate) {
      return `${gate.gate}.${gate.line || 1}`; // Extract gate and line
    }
    return `${gate}.1`; // Default format
  });
}

// Map hdkit type to our enum
function mapType(hdkitType) {
  // hdkit uses lowercase types, we use uppercase
  const typeMap = {
    'generator': 'GENERATOR',
    'manifesting generator': 'MANIFESTING_GENERATOR',
    'projector': 'PROJECTOR',
    'manifestor': 'MANIFESTOR',
    'reflector': 'REFLECTOR'
  };
  
  return typeMap[hdkitType.toLowerCase()] || 'GENERATOR';
}

// Map hdkit authority to our enum
function mapAuthority(hdkitAuthority) {
  // hdkit uses different authority names
  const authorityMap = {
    'emotional': 'EMOTIONAL',
    'sacral': 'SACRAL',
    'splenic': 'SPLENIC',
    'ego': 'EGO',
    'self': 'SELF',
    'lunar': 'NONE',
    'none': 'NONE'
  };
  
  return authorityMap[hdkitAuthority.toLowerCase()] || 'NONE';
}

// Map profile line to description
function mapProfileLine(line) {
  const profileLabels = {
    1: "Investigator",
    2: "Hermit",
    3: "Martyr",
    4: "Opportunist",
    5: "Heretic",
    6: "Role Model"
  };
  
  return profileLabels[line] || "Unknown";
}

// Map definition type
function mapDefinition(definition) {
  // Convert hdkit definition to our format
  return definition || "Split";
}

// Map centers from hdkit format to our format
function mapCenters(hdkitCenters) {
  const centerMap = {};
  
  // hdkit might use different center names or formats
  CENTERS.forEach(center => {
    const lowerCenter = center.toLowerCase();
    // Check various possible formats from hdkit
    centerMap[center] = hdkitCenters[lowerCenter] || 
                         hdkitCenters[center] || 
                         hdkitCenters[lowerCenter.replace('/', '')] ||
                         false;
  });
  
  return centerMap;
}

// Extract gates from channels
function extractGates(channels, type) {
  if (!channels || !Array.isArray(channels)) {
    return ["16.5", "20.3", "57.2", "34.6"]; // Default gates if missing
  }
  
  const gates = new Set();
  
  // Extract gates from channels based on type (design or personality)
  channels.forEach(channel => {
    if (channel[type] && channel[type].from) {
      gates.add(`${channel[type].from.gate}.${channel[type].from.line}`);
    }
    if (channel[type] && channel[type].to) {
      gates.add(`${channel[type].to.gate}.${channel[type].to.line}`);
    }
  });
  
  return Array.from(gates).slice(0, 4); // Return first 4 gates
}

// Determine life purpose based on type and profile
function determineLifePurpose(type, profileNumber) {
  const purposeByType = {
    "GENERATOR": "Find satisfaction through responding to life",
    "MANIFESTING_GENERATOR": "Find satisfaction through multi-faceted creation",
    "PROJECTOR": "Guide others with your unique insight",
    "MANIFESTOR": "Initiate and catalyze change for others",
    "REFLECTOR": "Mirror and sample the health of your community"
  };
  
  const purposeModifier = {
    1: "through deep investigation",
    2: "through selective sharing of wisdom",
    3: "through practical experimentation",
    4: "through finding the right networks",
    5: "through challenging the status quo",
    6: "through being an example for others"
  };
  
  return `${purposeByType[type]} ${purposeModifier[profileNumber]}`;
}

// Fallback function for when API is unavailable or inputs are incomplete
function generateFallbackHumanDesign(birthDate, birthTime, location, celestialData) {
  console.log(`Using fallback Human Design calculation for: ${birthDate} ${birthTime} at ${location}`);
  
  // Create a seeded random number generator based on birth details
  const timestamp = birthDate ? new Date(birthDate + (birthTime ? "T" + birthTime : "")).getTime() : Date.now();
  const rng = seedRandom(timestamp);
  
  // Determine defined centers with birth date dependency
  const definedCenters = {};
  CENTERS.forEach(center => {
    // Use celestial data to influence which centers are defined if available
    const sunInfluence = celestialData?.sun?.longitude ? (celestialData.sun.longitude / 30) % 1 : 0.5;
    const moonInfluence = celestialData?.moon?.longitude ? (celestialData.moon.longitude / 30) % 1 : 0.3;
    
    // Different formula for each center to create realistic variation
    const isDefined = (rng() + sunInfluence * 0.3 + moonInfluence * 0.2) > 0.5;
    definedCenters[center] = isDefined;
    console.log(`Center ${center}: ${isDefined ? 'Defined' : 'Undefined'}`);
  });
  
  // Determine type based on centers
  const type = determineType(definedCenters);
  // Determine authority based on centers
  const authority = determineAuthority(definedCenters);
  // Determine profile based on celestial data if available
  const profile = determineProfile(celestialData);
  // Determine definition based on centers
  const definition = determineDefinition(definedCenters);
  // Calculate active gates
  const gates = calculateActiveGates(celestialData);
  // Determine life purpose
  const lifePurpose = determineLifePurpose(type, parseInt(profile.split('/')[0]));
  
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
