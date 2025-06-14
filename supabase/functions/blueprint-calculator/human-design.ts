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
  // Data below is from official HD sources. Each gate covers 5.625°; each line is 0.9375°.
  { gate: 41, start: 0.000, end: 5.625, lines: [0.9375, 1.875, 2.8125, 3.75, 4.6875, 5.625] },
  { gate: 19, start: 5.625, end: 11.25, lines: [6.5625, 7.5, 8.4375, 9.375, 10.3125, 11.25] },
  { gate: 13, start: 11.25, end: 16.875, lines: [12.1875, 13.125, 14.0625, 15.0, 15.9375, 16.875] },
  { gate: 49, start: 16.875, end: 22.5, lines: [17.8125, 18.75, 19.6875, 20.625, 21.5625, 22.5] },
  { gate: 30, start: 22.5, end: 28.125, lines: [23.4375, 24.375, 25.3125, 26.25, 27.1875, 28.125] },
  { gate: 55, start: 28.125, end: 33.75, lines: [29.0625, 30.0, 30.9375, 31.875, 32.8125, 33.75] },
  { gate: 37, start: 33.75, end: 39.375, lines: [34.6875, 35.625, 36.5625, 37.5, 38.4375, 39.375] },
  { gate: 63, start: 39.375, end: 45, lines: [40.3125, 41.25, 42.1875, 43.125, 44.0625, 45.0] },
  { gate: 22, start: 45, end: 50.625, lines: [45.9375, 46.875, 47.8125, 48.75, 49.6875, 50.625] },
  { gate: 36, start: 50.625, end: 56.25, lines: [51.5625, 52.5, 53.4375, 54.375, 55.3125, 56.25] },
  { gate: 25, start: 56.25, end: 61.875, lines: [57.1875, 58.125, 59.0625, 60.0, 60.9375, 61.875] },
  { gate: 17, start: 61.875, end: 67.5, lines: [62.8125, 63.75, 64.6875, 65.625, 66.5625, 67.5] },
  { gate: 21, start: 67.5, end: 73.125, lines: [68.4375, 69.375, 70.3125, 71.25, 72.1875, 73.125] },
  { gate: 51, start: 73.125, end: 78.75, lines: [74.0625, 75.0, 75.9375, 76.875, 77.8125, 78.75] },
  { gate: 42, start: 78.75, end: 84.375, lines: [79.6875, 80.625, 81.5625, 82.5, 83.4375, 84.375] },
  { gate: 3, start: 84.375, end: 90.0, lines: [85.3125, 86.25, 87.1875, 88.125, 89.0625, 90.0] },
  { gate: 27, start: 90.0, end: 95.625, lines: [90.9375, 91.875, 92.8125, 93.75, 94.6875, 95.625] },
  { gate: 24, start: 95.625, end: 101.25, lines: [96.5625, 97.5, 98.4375, 99.375, 100.3125, 101.25] },
  { gate: 2, start: 101.25, end: 106.875, lines: [102.1875, 103.125, 104.0625, 105.0, 105.9375, 106.875] },
  { gate: 23, start: 106.875, end: 112.5, lines: [107.8125, 108.75, 109.6875, 110.625, 111.5625, 112.5] },
  { gate: 8, start: 112.5, end: 118.125, lines: [113.4375, 114.375, 115.3125, 116.25, 117.1875, 118.125] },
  { gate: 20, start: 118.125, end: 123.75, lines: [119.0625, 120.0, 120.9375, 121.875, 122.8125, 123.75] },
  { gate: 16, start: 123.75, end: 129.375, lines: [124.6875, 125.625, 126.5625, 127.5, 128.4375, 129.375] },
  { gate: 35, start: 129.375, end: 135.0, lines: [130.3125, 131.25, 132.1875, 133.125, 134.0625, 135.0] },
  { gate: 45, start: 135.0, end: 140.625, lines: [135.9375, 136.875, 137.8125, 138.75, 139.6875, 140.625] },
  { gate: 12, start: 140.625, end: 146.25, lines: [141.5625, 142.5, 143.4375, 144.375, 145.3125, 146.25] },
  { gate: 15, start: 146.25, end: 151.875, lines: [147.1875, 148.125, 149.0625, 150.0, 150.9375, 151.875] },
  { gate: 52, start: 151.875, end: 157.5, lines: [152.8125, 153.75, 154.6875, 155.625, 156.5625, 157.5] },
  { gate: 39, start: 157.5, end: 163.125, lines: [158.4375, 159.375, 160.3125, 161.25, 162.1875, 163.125] },
  { gate: 53, start: 163.125, end: 168.75, lines: [164.0625, 165.0, 165.9375, 166.875, 167.8125, 168.75] },
  { gate: 62, start: 168.75, end: 174.375, lines: [169.6875, 170.625, 171.5625, 172.5, 173.4375, 174.375] },
  { gate: 56, start: 174.375, end: 180.0, lines: [175.3125, 176.25, 177.1875, 178.125, 179.0625, 180.0] },
  { gate: 31, start: 180.0, end: 185.625, lines: [180.9375, 181.875, 182.8125, 183.75, 184.6875, 185.625] },
  { gate: 33, start: 185.625, end: 191.25, lines: [186.5625, 187.5, 188.4375, 189.375, 190.3125, 191.25] },
  { gate: 7, start: 191.25, end: 196.875, lines: [192.1875, 193.125, 194.0625, 195.0, 195.9375, 196.875] },
  { gate: 4, start: 196.875, end: 202.5, lines: [197.8125, 198.75, 199.6875, 200.625, 201.5625, 202.5] },
  { gate: 29, start: 202.5, end: 208.125, lines: [203.4375, 204.375, 205.3125, 206.25, 207.1875, 208.125] },
  { gate: 59, start: 208.125, end: 213.75, lines: [209.0625, 210.0, 210.9375, 211.875, 212.8125, 213.75] },
  { gate: 40, start: 213.75, end: 219.375, lines: [214.6875, 215.625, 216.5625, 217.5, 218.4375, 219.375] },
  { gate: 64, start: 219.375, end: 225.0, lines: [220.3125, 221.25, 222.1875, 223.125, 224.0625, 225.0] },
  { gate: 47, start: 225.0, end: 230.625, lines: [225.9375, 226.875, 227.8125, 228.75, 229.6875, 230.625] },
  { gate: 6, start: 230.625, end: 236.25, lines: [231.5625, 232.5, 233.4375, 234.375, 235.3125, 236.25] },
  { gate: 46, start: 236.25, end: 241.875, lines: [237.1875, 238.125, 239.0625, 240.0, 240.9375, 241.875] },
  { gate: 18, start: 241.875, end: 247.5, lines: [242.8125, 243.75, 244.6875, 245.625, 246.5625, 247.5] },
  { gate: 48, start: 247.5, end: 253.125, lines: [248.4375, 249.375, 250.3125, 251.25, 252.1875, 253.125] },
  { gate: 57, start: 253.125, end: 258.75, lines: [254.0625, 255.0, 255.9375, 256.875, 257.8125, 258.75] },
  { gate: 32, start: 258.75, end: 264.375, lines: [259.6875, 260.625, 261.5625, 262.5, 263.4375, 264.375] },
  { gate: 50, start: 264.375, end: 270.0, lines: [265.3125, 266.25, 267.1875, 268.125, 269.0625, 270.0] },
  { gate: 28, start: 270.0, end: 275.625, lines: [270.9375, 271.875, 272.8125, 273.75, 274.6875, 275.625] },
  { gate: 44, start: 275.625, end: 281.25, lines: [276.5625, 277.5, 278.4375, 279.375, 280.3125, 281.25] },
  { gate: 1, start: 281.25, end: 286.875, lines: [282.1875, 283.125, 284.0625, 285.0, 285.9375, 286.875] },
  { gate: 43, start: 286.875, end: 292.5, lines: [287.8125, 288.75, 289.6875, 290.625, 291.5625, 292.5] },
  { gate: 14, start: 292.5, end: 298.125, lines: [293.4375, 294.375, 295.3125, 296.25, 297.1875, 298.125] },
  { gate: 34, start: 298.125, end: 303.75, lines: [299.0625, 300.0, 300.9375, 301.875, 302.8125, 303.75] },
  { gate: 9, start: 303.75, end: 309.375, lines: [304.6875, 305.625, 306.5625, 307.5, 308.4375, 309.375] },
  { gate: 5, start: 309.375, end: 315.0, lines: [310.3125, 311.25, 312.1875, 313.125, 314.0625, 315.0] },
  { gate: 26, start: 315.0, end: 320.625, lines: [315.9375, 316.875, 317.8125, 318.75, 319.6875, 320.625] },
  { gate: 11, start: 320.625, end: 326.25, lines: [321.5625, 322.5, 323.4375, 324.375, 325.3125, 326.25] },
  { gate: 10, start: 326.25, end: 331.875, lines: [327.1875, 328.125, 329.0625, 330.0, 330.9375, 331.875] },
  { gate: 58, start: 331.875, end: 337.5, lines: [332.8125, 333.75, 334.6875, 335.625, 336.5625, 337.5] },
  { gate: 38, start: 337.5, end: 343.125, lines: [338.4375, 339.375, 340.3125, 341.25, 342.1875, 343.125] },
  { gate: 54, start: 343.125, end: 348.75, lines: [344.0625, 345.0, 345.9375, 346.875, 347.8125, 348.75] },
  { gate: 61, start: 348.75, end: 354.375, lines: [349.6875, 350.625, 351.5625, 352.5, 353.4375, 354.375] },
  { gate: 60, start: 354.375, end: 360.0, lines: [355.3125, 356.25, 357.1875, 358.125, 359.0625, 360.0] }
];

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
