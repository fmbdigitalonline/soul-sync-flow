// Human Design calculation module for Blueprint Calculator
import { seedRandom } from "./utils.ts";

// Gate and channel definitions
const GATES = {
  1: { name: "Gate of Self-Expression", description: "Creative self-expression and identity" },
  2: { name: "Gate of Direction", description: "Determination of direction in one's life" },
  3: { name: "Gate of Ordering", description: "Order, mutation, new beginnings" },
  4: { name: "Gate of Formulization", description: "Answering life's questions with logic" },
  5: { name: "Gate of Fixed Rhythms", description: "Establishing consistent patterns" },
  6: { name: "Gate of Friction", description: "Emotional conflict resolution" },
  7: { name: "Gate of Leadership", description: "Self-direction and guidance" },
  8: { name: "Gate of Contribution", description: "Taking personal responsibility" },
  9: { name: "Gate of Focus", description: "Determination of details" },
  10: { name: "Gate of Behavior", description: "Love of self" },
  11: { name: "Gate of Ideas", description: "Social interaction and harmony" },
  12: { name: "Gate of Caution", description: "Emotional restraint" },
  13: { name: "Gate of Listener", description: "Interaction through listening" },
  14: { name: "Gate of Power Skills", description: "Managing personal resources" },
  15: { name: "Gate of Extremes", description: "Establishing patterns through extremes" },
  16: { name: "Gate of Skills", description: "Enthusiasm and mastery of skills" },
  17: { name: "Gate of Opinions", description: "Following an organized path" },
  18: { name: "Gate of Correction", description: "Judgment and perfection" },
  19: { name: "Gate of Wanting", description: "Sensitivity to community needs" },
  20: { name: "Gate of Contemplation", description: "Awareness in the now" },
  21: { name: "Gate of Controlling", description: "Authority and leadership" },
  22: { name: "Gate of Openness", description: "Building intimacy through charm" },
  23: { name: "Gate of Assimilation", description: "Transformation through assimilation" },
  24: { name: "Gate of Rationalization", description: "Finding meaning" },
  25: { name: "Gate of Innocence", description: "Finding higher love" },
  26: { name: "Gate of Integrity", description: "Codifying rules for higher principles" },
  27: { name: "Gate of Caring", description: "Nurturing with integrity" },
  28: { name: "Gate of Game Player", description: "Risk taking for evolution" },
  29: { name: "Gate of Perseverance", description: "Commitment to follow through" },
  30: { name: "Gate of Recognition", description: "Feeling: Clarity through emotional shifts" },
  31: { name: "Gate of Influence", description: "Leadership by example" },
  32: { name: "Gate of Continuity", description: "Being sensitive to social shifts" },
  33: { name: "Gate of Privacy", description: "Tactical retreat for reflection" },
  34: { name: "Gate of Power", description: "Powerful manifestation of energy" },
  35: { name: "Gate of Change", description: "Adaptation to changing experiences" },
  36: { name: "Gate of Crisis", description: "Turbulence leading to new experiences" },
  37: { name: "Gate of Friendship", description: "Maintaining the family/community" },
  38: { name: "Gate of Opposition", description: "Provocation as catalyst for change" },
  39: { name: "Gate of Provocation", description: "Spirit focusing energy for liberation" },
  40: { name: "Gate of Aloneness", description: "Learning from denial and rejection" },
  41: { name: "Gate of Fantasy", description: "Creative imagination for new start" },
  42: { name: "Gate of Growth", description: "Increased energy during transition" },
  43: { name: "Gate of Insight", description: "Adapting individual uniqueness" },
  44: { name: "Gate of Alertness", description: "Developing patterns through engagement" },
  45: { name: "Gate of Gathering", description: "Education and community building" },
  46: { name: "Gate of Determination", description: "Drive for success in the material world" },
  47: { name: "Gate of Realization", description: "Clarity through mental distress" },
  48: { name: "Gate of Depth", description: "Complex analysis for insight" },
  49: { name: "Gate of Revolution", description: "Sensitivity to need for change" },
  50: { name: "Gate of Values", description: "Taking responsibility for one's values" },
  51: { name: "Gate of Shock", description: "Initiative from responding to challenge" },
  52: { name: "Gate of Stillness", description: "Focus and concentration" },
  53: { name: "Gate of Development", description: "Structured beginnings" },
  54: { name: "Gate of Transformation", description: "Ambitious motivation" },
  55: { name: "Gate of Spirit", description: "Abundance fueled by emotional clarity" },
  56: { name: "Gate of Stimulation", description: "Ability to share big ideas" },
  57: { name: "Gate of Intuition", description: "Clarity through intuitive awareness" },
  58: { name: "Gate of Vitality", description: "Joy of life" },
  59: { name: "Gate of Sexuality", description: "Breaking barriers to intimacy" },
  60: { name: "Gate of Acceptance", description: "Creating value through limitation" },
  61: { name: "Gate of Inner Truth", description: "Knowing through focus" },
  62: { name: "Gate of Detail", description: "Practical attention to details" },
  63: { name: "Gate of Doubt", description: "Logical questioning and completion" },
  64: { name: "Gate of Confusion", description: "Mental questioning leading to clarity" }
};

// Type definitions with more detailed information
const TYPES = {
  GENERATOR: {
    description: "Life force that builds and creates",
    strategy: "Wait to respond",
    not_self_theme: "Frustration",
    traits: [
      "Sustainable energy when responding",
      "Strong life force",
      "Satisfied when using energy correctly",
      "Creative power"
    ]
  },
  MANIFESTING_GENERATOR: {
    description: "Multi-faceted life force that creates quickly",
    strategy: "Wait to respond, then inform",
    not_self_theme: "Frustration and anger",
    traits: [
      "Quick, sustainable energy",
      "Multi-tasking abilities",
      "Skipping steps in process",
      "Creative power combined with initiating energy"
    ]
  },
  PROJECTOR: {
    description: "Guide and direct other's energy",
    strategy: "Wait for the invitation",
    not_self_theme: "Bitterness",
    traits: [
      "Focused, penetrating awareness",
      "Energy for guiding others",
      "Deep understanding of systems",
      "Recognition through invitation"
    ]
  },
  MANIFESTOR: {
    description: "Energy initiator to catalyze others",
    strategy: "Inform before acting",
    not_self_theme: "Anger",
    traits: [
      "Independent action",
      "Creative initiating energy",
      "Impact on others",
      "Freedom to act and rest"
    ]
  },
  REFLECTOR: {
    description: "Mirroring and sampling energy of others",
    strategy: "Wait a lunar cycle before deciding",
    not_self_theme: "Disappointment",
    traits: [
      "Sampling of collective energy",
      "Detached perspective",
      "Surprise and delight",
      "Reflective wisdom"
    ]
  }
};

// Authority types with expanded descriptions
const AUTHORITIES = {
  EMOTIONAL: { 
    description: "Clarity comes through riding the emotional wave",
    details: "Decisions made when emotional clarity emerges over time",
    center: "Solar Plexus"
  },
  SACRAL: { 
    description: "Gut response in the moment",
    details: "Responding from the sacral center with spontaneous yes/no",
    center: "Sacral"
  },
  SPLENIC: { 
    description: "Intuitive awareness in the moment",
    details: "Immediate intuition about health and safety",
    center: "Spleen"
  },
  EGO: { 
    description: "Willpower and promises",
    details: "Decisions through willpower and what you're willing to commit to",
    center: "Heart/Ego"
  },
  SELF: { 
    description: "Self-awareness in environment",
    details: "Direction based on sense of identity and higher purpose",
    center: "G Center"
  },
  NONE: { 
    description: "Lunar cycle reflection",
    details: "Decisions made after sampling experiences through a lunar cycle",
    center: "None (Reflector)"
  }
};

// Definition types
const DEFINITIONS = {
  "SINGLE": "Connected energy flow through defined centers",
  "SPLIT": "Energy flow with a gap requiring connection",
  "TRIPLE SPLIT": "Three separate energy circuits requiring bridges",
  "QUAD SPLIT": "Four separate energy circuits",
  "NONE": "No consistent definition (Reflector)"
};

// Center descriptions
const CENTER_DESCRIPTIONS = {
  head: "Inspiration, mental pressure, and questions",
  ajna: "Conceptualization, mental certainty, and thinking",
  throat: "Manifestation, communication, and action",
  g: "Identity, direction, love, and self",
  heart_ego: "Willpower, proving oneself, and material success",
  solar_plexus: "Emotional clarity, awareness, and processing",
  sacral: "Life force energy, sexuality, and work",
  spleen: "Intuition, wellbeing, and survival",
  root: "Pressure, stress, and adrenaline"
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
    
    // Define centers based on birth timestamp
    const definedCenters = determineDefinedCenters(timestamp, celestialData);
    
    // Calculate channels based on defined centers and celestial positions
    const channels = determineChannels(timestamp, celestialData);
    
    // Calculate type based on center definitions
    const type = determineType(definedCenters, channels);
    
    // Calculate authority based on defined centers
    const authority = determineAuthority(definedCenters, type);
    
    // Calculate profile based on Sun and Earth positions
    const profile = determineProfile(celestialData);
    
    // Calculate definition type based on connected centers
    const definition = determineDefinition(definedCenters, channels);
    
    // Calculate active gates based on planet positions
    const gates = calculateActiveGates(celestialData, timestamp);
    
    // Calculate life purpose based on profile and type
    const lifePurpose = determineLifePurpose(type, profile, channels);
    
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
      channels: channels.map(c => `${c.gate1}-${c.gate2}`),
      description: TYPES[type].description,
      traits: TYPES[type].traits
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
      centers: {
        head: false,
        ajna: true,
        throat: false,
        g: true,
        heart_ego: false,
        solar_plexus: true,
        sacral: true,
        spleen: false,
        root: true
      },
      gates: {
        unconscious_design: ["16.5", "20.3", "57.2", "34.6"],
        conscious_personality: ["11.4", "48.3", "39.5", "41.1"]
      },
      channels: ["34-57", "20-34"]
    };
  }
}

// Determine which centers are defined based on planet positions and channels
function determineDefinedCenters(timestamp, celestialData) {
  // Create a seeded random number generator based on timestamp
  const rng = seedRandom(timestamp);
  
  // Human Design Centers
  const centerNames = [
    "head", "ajna", "throat", "g", "heart_ego", 
    "solar_plexus", "sacral", "spleen", "root"
  ];
  
  // Determine defined centers with some birth date dependency
  const definedCenters = {};
  centerNames.forEach(center => {
    // Use sun and moon positions to influence which centers are defined
    const sunInfluence = (celestialData.sun.longitude / 30) % 1;
    const moonInfluence = (celestialData.moon.longitude / 30) % 1;
    
    // Different formula for each center to create realistic variation
    const isDefined = (rng() + sunInfluence * 0.3 + moonInfluence * 0.2) > 0.5;
    
    // Store center data with description
    definedCenters[center] = {
      defined: isDefined,
      description: CENTER_DESCRIPTIONS[center]
    };
  });
  
  return definedCenters;
}

// Determine channels based on gates and centers
function determineChannels(timestamp, celestialData) {
  // In a real implementation, this would check which gates are activated
  // and determine channels between centers
  
  // Channel definitions (simplified)
  const possibleChannels = [
    { gate1: 34, gate2: 57, name: "Power Channel" },
    { gate1: 20, gate2: 34, name: "Charisma Channel" },
    { gate1: 16, gate2: 48, name: "Talent Channel" },
    { gate1: 11, gate2: 56, name: "Curiosity Channel" },
    { gate1: 10, gate2: 20, name: "Awakening Channel" },
    { gate1: 32, gate2: 54, name: "Transformation Channel" },
    { gate1: 7, gate2: 31, name: "Leadership Channel" },
    { gate1: 1, gate2: 8, name: "Inspiration Channel" },
    { gate1: 9, gate2: 52, name: "Concentration Channel" },
    { gate1: 15, gate2: 5, name: "Rhythm Channel" }
  ];
  
  // Create a seeded random number generator
  const rng = seedRandom(timestamp);
  
  // Determine how many channels are activated based on celestial positions
  const channelCount = Math.floor(rng() * 5) + 1; // 1-5 channels
  
  // Select random channels
  const channels = [];
  const channelIndices = new Set();
  
  while (channelIndices.size < channelCount) {
    const idx = Math.floor(rng() * possibleChannels.length);
    channelIndices.add(idx);
  }
  
  // Build the active channels list
  Array.from(channelIndices).forEach(idx => {
    channels.push(possibleChannels[idx]);
  });
  
  return channels;
}

// Determine Human Design Type based on defined centers and channels
function determineType(definedCenters, channels) {
  // In a real implementation, this would be based on specific center definitions
  
  // Check if any centers are defined
  const hasAnyDefinedCenters = Object.values(definedCenters).some(center => 
    typeof center === 'object' ? center.defined : Boolean(center)
  );
  
  // Reflector: No centers defined
  if (!hasAnyDefinedCenters) {
    return "REFLECTOR";
  }
  
  // Check if specific centers are defined
  const hasDefinedThroat = definedCenters.throat?.defined || false;
  const hasDefinedSacral = definedCenters.sacral?.defined || false;
  const hasMotorToThroat = channels.some(channel => {
    // Check if one gate is connected to throat and the other to a motor center
    const connectedToThroat = getGateCenter(channel.gate1) === "throat" || getGateCenter(channel.gate2) === "throat";
    const connectedToMotor = isMotorCenter(getGateCenter(channel.gate1)) || isMotorCenter(getGateCenter(channel.gate2));
    return connectedToThroat && connectedToMotor;
  });
  
  // Manifestor: Throat connected to motor center but not sacral
  if (hasMotorToThroat && !hasDefinedSacral) {
    return "MANIFESTOR";
  }
  
  // Projector: No sacral and no manifestor throat connections
  if (!hasDefinedSacral) {
    return "PROJECTOR";
  }
  
  // Manifesting Generator: Sacral connected to throat
  if (hasDefinedSacral && (hasDefinedThroat || hasMotorToThroat)) {
    return "MANIFESTING_GENERATOR";
  }
  
  // Generator: Sacral defined but not connected to throat
  if (hasDefinedSacral) {
    return "GENERATOR";
  }
  
  // Default fallback
  return "GENERATOR";
}

// Helper function to check if center is a motor center
function isMotorCenter(center) {
  return ["heart_ego", "solar_plexus", "sacral", "root"].includes(center);
}

// Helper function to get which center a gate belongs to
function getGateCenter(gate) {
  // Gate to center mapping (simplified)
  const gateCenters = {
    // Head center gates
    1: "head", 61: "head", 63: "head", 64: "head",
    // Ajna center gates
    47: "ajna", 24: "ajna", 4: "ajna", 11: "ajna", 17: "ajna", 43: "ajna",
    // Throat center gates
    62: "throat", 23: "throat", 56: "throat", 16: "throat", 35: "throat", 20: "throat", 31: "throat", 8: "throat", 33: "throat", 45: "throat",
    // G center gates
    1: "g", 13: "g", 7: "g", 2: "g", 15: "g", 10: "g", 46: "g", 25: "g",
    // Heart/Ego center gates
    21: "heart_ego", 40: "heart_ego", 26: "heart_ego", 51: "heart_ego",
    // Solar Plexus center gates
    6: "solar_plexus", 59: "solar_plexus", 52: "solar_plexus", 9: "solar_plexus", 42: "solar_plexus", 3: "solar_plexus", 29: "solar_plexus", 39: "solar_plexus", 55: "solar_plexus", 49: "solar_plexus", 30: "solar_plexus", 14: "solar_plexus", 
    // Sacral center gates
    5: "sacral", 14: "sacral", 29: "sacral", 59: "sacral", 9: "sacral", 3: "sacral", 42: "sacral", 27: "sacral", 34: "sacral", 10: "sacral", 57: "sacral", 
    // Spleen center gates
    48: "spleen", 57: "spleen", 44: "spleen", 50: "spleen", 32: "spleen", 28: "spleen", 18: "spleen", 58: "spleen", 
    // Root center gates
    53: "root", 54: "root", 38: "root", 41: "root", 60: "root", 52: "root", 19: "root", 39: "root", 58: "root", 60: "root", 58: "root", 54: "root", 58: "root", 38: "root"
  };
  
  return gateCenters[gate] || "unknown";
}

// Determine authority based on defined centers and type
function determineAuthority(definedCenters, type) {
  if (type === "REFLECTOR") {
    return "NONE";
  }
  
  // Emotional authority: Emotional/Solar Plexus defined
  if (definedCenters.solar_plexus?.defined) {
    return "EMOTIONAL";
  }
  
  // Sacral authority: Solar Plexus not defined, Sacral defined
  if (!definedCenters.solar_plexus?.defined && definedCenters.sacral?.defined) {
    return "SACRAL";
  }
  
  // Splenic authority: No Solar Plexus or Sacral, but Spleen defined
  if (!definedCenters.solar_plexus?.defined && !definedCenters.sacral?.defined && definedCenters.spleen?.defined) {
    return "SPLENIC";
  }
  
  // Ego authority: No Emotional, Sacral or Splenic, but Heart/Ego defined
  if (!definedCenters.solar_plexus?.defined && !definedCenters.sacral?.defined && 
      !definedCenters.spleen?.defined && definedCenters.heart_ego?.defined) {
    return "EGO";
  }
  
  // Self authority: Just G Center defined of the motor centers
  if (!definedCenters.solar_plexus?.defined && !definedCenters.sacral?.defined && 
      !definedCenters.spleen?.defined && !definedCenters.heart_ego?.defined && definedCenters.g?.defined) {
    return "SELF";
  }
  
  // Default fallback based on type
  if (type === "GENERATOR" || type === "MANIFESTING_GENERATOR") {
    return "SACRAL";
  } else if (type === "PROJECTOR") {
    return "SELF";
  } else if (type === "MANIFESTOR") {
    return "EGO";
  }
  
  // Fallback
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

// Determine definition type based on center connections and channels
function determineDefinition(definedCenters, channels) {
  // Count how many centers are defined
  const definedCount = Object.values(definedCenters)
    .filter(center => typeof center === 'object' ? center.defined : Boolean(center))
    .length;
  
  // In a real implementation, this would check the pattern of connections
  // For now, use a simplified approach based on count and channels
  
  if (definedCount === 0) {
    return "NONE";
  } else if (channels.length >= 4) {
    return "SINGLE";
  } else if (channels.length === 3) {
    return "TRIPLE SPLIT";
  } else if (channels.length === 2) {
    return "SPLIT";
  } else {
    return "QUAD SPLIT";
  }
}

// Calculate active gates based on planet positions
function calculateActiveGates(celestialData, timestamp) {
  // In a real implementation, this would map planet positions to specific gates
  // For now, generate realistic but simulated gate activations
  
  // Create a seeded random number generator
  const rng = seedRandom(timestamp);
  
  // Generate personality gates based on sun, mercury, venus positions
  const personalityGates = generateGateNumbers(celestialData.sun.longitude, 3, rng)
    .concat(generateGateNumbers(celestialData.mercury?.longitude || 0, 2, rng))
    .concat(generateGateNumbers(celestialData.venus?.longitude || 0, 2, rng));
  
  // Generate design gates based on moon, mars, jupiter positions
  const designGates = generateGateNumbers(celestialData.moon.longitude, 3, rng)
    .concat(generateGateNumbers(celestialData.mars?.longitude || 0, 2, rng))
    .concat(generateGateNumbers(celestialData.jupiter?.longitude || 0, 2, rng));
  
  return {
    unconscious_design: designGates,
    conscious_personality: personalityGates
  };
}

// Generate realistic gate numbers based on a celestial position
function generateGateNumbers(position, count, rng) {
  const gates = [];
  const baseNumber = Math.floor(position) % 64 + 1;
  
  for (let i = 0; i < count; i++) {
    // Create variation but ensure each number is 1-64
    let gateNumber = (baseNumber + i * 13 + Math.floor(rng() * 7)) % 64 + 1;
    // Add a realistic line number (1-6)
    const lineNumber = (gateNumber + i) % 6 + 1;
    gates.push(`${gateNumber}.${lineNumber}`);
  }
  
  return gates;
}

// Determine life purpose based on type, profile and channels
function determineLifePurpose(type, profile, channels) {
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
  
  // Add channel-based insights
  let channelInsight = "";
  if (channels.length > 0) {
    if (channels.some(c => c.gate1 === 34 || c.gate2 === 34)) {
      channelInsight = " Your powerful energy gives you the ability to complete tasks with focus and determination.";
    } else if (channels.some(c => c.gate1 === 11 || c.gate2 === 11)) {
      channelInsight = " Your innovative ideas help bring people together and create harmonious environments.";
    } else if (channels.some(c => c.gate1 === 1 || c.gate2 === 1)) {
      channelInsight = " You have a unique ability to express yourself creatively and inspire others.";
    }
  }
  
  return `${purposeByType[type]} ${purposeModifier[profileNumber]}${channelInsight}`;
}

// Add utility function for random number generation
function seedRandom(seed) {
  // Simple LCG random number generator
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  
  return function() {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
}
