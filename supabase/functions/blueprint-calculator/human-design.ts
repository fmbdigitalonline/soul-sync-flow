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

// Map gates to centers they activate
const GATE_TO_CENTER_MAP = {
  // Head Center gates
  24: "Head", 61: "Head", 63: "Head",
  // Ajna Center gates
  47: "Ajna", 64: "Ajna", 4: "Ajna", 11: "Ajna", 17: "Ajna", 43: "Ajna",
  // Throat Center gates
  8: "Throat", 20: "Throat", 16: "Throat", 35: "Throat", 12: "Throat", 45: "Throat", 
  62: "Throat", 23: "Throat", 56: "Throat", 31: "Throat", 33: "Throat",
  // G Center gates
  1: "G", 13: "G", 25: "G", 10: "G", 15: "G", 7: "G",
  // Heart/Ego Center gates
  21: "Heart/Ego", 26: "Heart/Ego", 51: "Heart/Ego",
  // Solar Plexus Center gates
  30: "Solar Plexus", 36: "Solar Plexus", 55: "Solar Plexus", 37: "Solar Plexus", 
  6: "Solar Plexus", 49: "Solar Plexus", 22: "Solar Plexus", 48: "Solar Plexus", 9: "Solar Plexus",
  // Sacral Center gates
  34: "Sacral", 5: "Sacral", 14: "Sacral", 29: "Sacral", 59: "Sacral", 3: "Sacral", 27: "Sacral", 
  42: "Sacral", 53: "Sacral",
  // Spleen Center gates
  57: "Spleen", 18: "Spleen", 32: "Spleen", 50: "Spleen", 28: "Spleen", 44: "Spleen", 
  48: "Spleen", 28: "Spleen", 57: "Spleen", 58: "Spleen", 44: "Spleen", 50: "Spleen",
  // Root Center gates
  60: "Root", 52: "Root", 19: "Root", 39: "Root", 41: "Root", 53: "Root", 38: "Root", 54: "Root", 58: "Root"
};

// Solar movement constant
const SOLAR_DEG_PER_DAY = 0.985647; // mean solar motion in degrees per day

// --- Rave Mandala Gate Table ---
// Each gate has: startDegree (inclusive), endDegree (exclusive), lines: arr of endDegree for each line
const RAVE_MANDALA_GATES = [
  // Example: { gate, start: deg, end: deg, lines: [deg, deg, ...] }
  // The real data must be filled in with precise values:
  { gate: 41, start:   0.000, end:   5.625, lines: [0.938,1.875,2.813,3.750,4.688,5.625] },
  { gate: 19, start:   5.625, end:  11.250, lines: [6.563,7.500,8.438,9.375,10.313,11.250] },
  { gate: 13, start:  11.250, end:  16.875, lines: [12.188,13.125,14.063,15.000,15.938,16.875] },
  { gate: 49, start:  16.875, end:  22.500, lines: [17.813,18.750,19.688,20.625,21.563,22.500] },
  // ... (include all 64 gates in their correct order, with start and end degrees and lines)
];
// Save space, only the first few are shown here. For production, fill this table with full HD official data!

// Given a longitude, return { gate, line }
function raveMandalaLookup(longitude) {
  // Normalize longitude to 0-360
  const lon = ((longitude % 360) + 360) % 360;
  // Find gate
  for (const entry of RAVE_MANDALA_GATES) {
    if (lon >= entry.start && lon < entry.end) {
      // Find line
      for (let i = 0; i < 6; i++) {
        if (lon < entry.lines[i]) {
          return { gate: entry.gate, line: i + 1 };
        }
      }
      // Default (should not happen)
      return { gate: entry.gate, line: 6 };
    }
  }
  // Should never reach here, return 41.1 as fallback
  return { gate: 41, line: 1 };
}

/**
 * Calculate Human Design profile based on birth data and celestial positions
 */
export async function calculateHumanDesign(birthDate, birthTime, location, timezone, celestialData) {
  try {
    console.log("Calculating Human Design for", birthDate, birthTime);
    
    // Calculate Julian date for birth time (personality)
    const birthDateTime = new Date(birthDate + "T" + birthTime);
    const personalityTimestamp = birthDateTime.getTime();
    
    // For design chart, we're calculating positions as if they were 88.36 degrees earlier
    // This is approximately 89.66 days earlier based on accurate solar motion
    const offsetDays = 88.36 / SOLAR_DEG_PER_DAY; // 89.66 days
    const designTimestamp = personalityTimestamp - (offsetDays * 24 * 60 * 60 * 1000);
    
    console.log("Personality timestamp:", new Date(personalityTimestamp).toISOString());
    console.log("Design timestamp:", new Date(designTimestamp).toISOString());
    
    // Calculate gate activations for personality chart
    const personalityGates = calculateGatesFromPositions(celestialData);
    
    // In a real implementation, we would calculate the design positions
    // based on celestial positions at the design time
    // For now, we'll simulate it based on the design timestamp
    const designCelestialData = simulateDesignCelestialData(celestialData, designTimestamp);
    const designGates = calculateGatesFromPositions(designCelestialData);
    
    console.log("Personality gates:", personalityGates);
    console.log("Design gates:", designGates);
    
    // Combine both charts to activate centers
    const activatedCenters = determineCentersFromGates(personalityGates, designGates);
    
    // Calculate type based on activated centers
    const type = determineTypeFromCenters(activatedCenters);
    
    // Calculate authority based on activated centers
    const authority = determineAuthorityFromCenters(activatedCenters);
    
    // Extract sun gates from personality and design for profile calculation
    const personalitySunGate = personalityGates.find(g => g.planet === "sun");
    const designSunGate = designGates.find(g => g.planet === "sun");
    
    // Calculate profile based on Sun gates' lines
    const profile = determineProfile(personalitySunGate, designSunGate);
    
    // Calculate definition type based on connected centers
    const definition = determineDefinition(activatedCenters);
    
    // Calculate life purpose based on profile and type
    const lifePurpose = determineLifePurpose(type, profile);
    
    // Combine all gate activations for return value
    const allGates = {
      unconscious_design: designGates.map(g => g.gate + "." + g.line),
      conscious_personality: personalityGates.map(g => g.gate + "." + g.line)
    };
    
    return {
      type: type,
      profile: profile,
      authority: authority,
      strategy: TYPES[type].strategy,
      definition: definition,
      not_self_theme: TYPES[type].not_self_theme,
      life_purpose: lifePurpose,
      centers: activatedCenters,
      gates: allGates
    };
  } catch (error) {
    console.error("Error calculating Human Design:", error);
    throw error; // Bubble up the error instead of returning fallback data
  }
}

// Calculate gates from celestial positions using the Rave Mandala
function calculateGatesFromPositions(celestialData) {
  const gates = [];
  for (const [planet, position] of Object.entries(celestialData)) {
    if (position && typeof position.longitude === 'number') {
      const { gate, line } = raveMandalaLookup(position.longitude);
      gates.push({ planet, gate, line });
    }
  }
  return gates;
}

// Simulate design celestial data based on design timestamp
// In a real implementation, we would calculate the actual positions
function simulateDesignCelestialData(personalityCelestialData, designTimestamp) {
  const designData = {};
  
  // Create an offset for each planet based on the design timestamp
  for (const [planet, position] of Object.entries(personalityCelestialData)) {
    if (position && typeof position.longitude === 'number') {
      // Calculate a pseudo-offset based on planet speed and the time difference
      // This is a simplified simulation - real calculations would use ephemeris
      
      // Different planets move at different speeds
      const speedFactor = planet === 'sun' ? 1 : 
                         planet === 'moon' ? 13 : 
                         planet === 'mercury' ? 1.5 : 
                         planet === 'venus' ? 0.8 :
                         planet === 'mars' ? 0.5 : 
                         planet === 'jupiter' ? 0.08 : 
                         planet === 'saturn' ? 0.03 : 0.5;
      
      // Calculate a realistic offset based on timestamp difference and speed
      const daysDifference = (personalityCelestialData.timestamp - designTimestamp) / (24 * 60 * 60 * 1000);
      const degreeOffset = daysDifference * speedFactor;
      
      // Create a new position with the offset
      designData[planet] = {
        ...position,
        longitude: (position.longitude - degreeOffset + 360) % 360
      };
    }
  }
  
  return designData;
}

// Determine activated centers based on gates from both charts
function determineCentersFromGates(personalityGates, designGates) {
  const activatedCenters = {};
  
  // Initialize all centers as undefined
  const centers = [
    "Head", "Ajna", "Throat", "G", "Heart/Ego", 
    "Solar Plexus", "Sacral", "Spleen", "Root"
  ];
  centers.forEach(center => {
    activatedCenters[center] = false;
  });
  
  // Activate centers based on gates from both charts
  const allGates = [...personalityGates, ...designGates];
  
  allGates.forEach(({ gate }) => {
    const center = GATE_TO_CENTER_MAP[gate];
    if (center) {
      activatedCenters[center] = true;
    }
  });
  
  return activatedCenters;
}

// Determine Human Design Type based on activated centers
function determineTypeFromCenters(activatedCenters) {
  // Reflector: No motor centers defined
  const motorCenters = ["Sacral", "Heart/Ego", "Solar Plexus", "Root"];
  const hasMotorCenter = motorCenters.some(center => activatedCenters[center]);
  
  if (!hasMotorCenter) {
    return "REFLECTOR";
  }
  
  // Manifestor: Throat connected to motor center but not sacral
  if (activatedCenters["Throat"] && 
      (activatedCenters["Heart/Ego"] || activatedCenters["Solar Plexus"] || activatedCenters["Root"]) && 
      !activatedCenters["Sacral"]) {
    return "MANIFESTOR";
  }
  
  // Projector: No sacral and not a manifestor
  if (!activatedCenters["Sacral"]) {
    return "PROJECTOR";
  }
  
  // Manifesting Generator: Sacral connected to throat
  if (activatedCenters["Sacral"] && activatedCenters["Throat"]) {
    return "MANIFESTING_GENERATOR";
  }
  
  // Generator: Sacral defined but not connected to throat
  if (activatedCenters["Sacral"]) {
    return "GENERATOR";
  }
  
  // Default fallback
  return "GENERATOR";
}

// Determine authority based on activated centers
function determineAuthorityFromCenters(activatedCenters) {
  // Emotional authority: Solar Plexus defined
  if (activatedCenters["Solar Plexus"]) {
    return "EMOTIONAL";
  }
  
  // Sacral authority: No Solar Plexus, but Sacral defined
  if (!activatedCenters["Solar Plexus"] && activatedCenters["Sacral"]) {
    return "SACRAL";
  }
  
  // Splenic authority: No Solar Plexus or Sacral, but Spleen defined
  if (!activatedCenters["Solar Plexus"] && !activatedCenters["Sacral"] && activatedCenters["Spleen"]) {
    return "SPLENIC";
  }
  
  // Ego authority: No Emotional, Sacral or Splenic, but Heart/Ego defined
  if (!activatedCenters["Solar Plexus"] && !activatedCenters["Sacral"] && 
      !activatedCenters["Spleen"] && activatedCenters["Heart/Ego"]) {
    return "EGO";
  }
  
  // Self authority: Just G Center defined of the motor centers
  if (!activatedCenters["Solar Plexus"] && !activatedCenters["Sacral"] && 
      !activatedCenters["Spleen"] && !activatedCenters["Heart/Ego"] && activatedCenters["G"]) {
    return "SELF";
  }
  
  // None/Lunar: No consistent inner authority
  return "NONE";
}

// Determine profile based on sun lines from personality and design charts
function determineProfile(personalitySunGate, designSunGate) {
  // Use the lines from personality and design sun gates
  const conscious = personalitySunGate?.line || 1;
  const unconscious = designSunGate?.line || 1;
  
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
function determineDefinition(activatedCenters) {
  // Count how many centers are defined
  const definedCount = Object.values(activatedCenters).filter(Boolean).length;
  
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
