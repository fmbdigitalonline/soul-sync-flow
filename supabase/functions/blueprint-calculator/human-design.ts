// Human Design calculation module for Blueprint Calculator (refactored using dual ephemeris approach)

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { GATE_TO_CENTER_MAP, CHANNELS, HD_PLANETS, PROFILE_LABELS } from "./human-design-gates.ts";

export async function calculateHumanDesign(
  birthDate: string,
  birthTime: string,
  location: string,
  timezone: string,
  celestialData: any // <- this argument is kept for function compatibility, but not used, as we do our own ephemeris calls now
) {
  try {
    console.log("🎯 [HD] Starting Human Design calculation (proper dual ephemeris)...");

    // Step 1: Geocode location to get coordinates
    const coordinates = await geocodeLocation(location);

    if (!coordinates) {
      throw new Error(`Could not geocode location: ${location}`);
    }
    console.log(`🌍 [HD] Geocoded "${location}" -> ${coordinates}`);

    // Step 2: Calculate Personality and Design datetimes
    const birthDateTime = new Date(`${birthDate}T${birthTime}`);
    const designDateTime = new Date(birthDateTime.getTime() - (88.736 * 24 * 60 * 60 * 1000));
    console.log(`[HD] Personality time: ${birthDateTime.toISOString()}`);
    console.log(`[HD] Design time: ${designDateTime.toISOString()}`);

    // Step 3: Fetch ephemeris data for both Personality and Design times
    const personalityCelestial = await fetchEphemerisData(
      birthDateTime,
      location,
      timezone,
      coordinates,
      "personality"
    );
    const designCelestial = await fetchEphemerisData(
      designDateTime,
      location,
      timezone,
      coordinates,
      "design"
    );

    // Canonical HD order
    const HD_PLANETS = [
      "sun", "earth", "north_node", "south_node", "moon", "mercury", "venus", "mars",
      "jupiter", "saturn", "uranus", "neptune", "pluto"
    ];

    // ---- PATCH: HD GATE EXPANSION AND ORDERING ----
    function canonicalOrder(gatesArray: any[]) {
      // Return only one (first, latest) gate/line per planet, sorted in canonical Human Design order
      return HD_PLANETS.map(planet => {
        const found = gatesArray.find((g: any) => g.planet === planet && g.gate && g.line);
        return found ? { ...found } : null;
      }).filter(Boolean);
    }

    const personalityGatesRaw = calculateHDGatesFromCelestialData(personalityCelestial, "personality");
    const designGatesRaw = calculateHDGatesFromCelestialData(designCelestial, "design");

    const personalityGatesOrdered = canonicalOrder(personalityGatesRaw);
    const designGatesOrdered = canonicalOrder(designGatesRaw);

    // Step 5: Determine centers and channels using both gate sets
    const centers = calculateCentersFromChannels([...personalityGatesOrdered, ...designGatesOrdered]);

    // Step 6: Type, authority, profile
    const type = determineHDType(centers);
    const authority = determineHDAuthority(centers);

    // ----- FIX PROFILE: Personality Sun line, Design Earth line -----
    function getGateByPlanet(gatesArr: any[], planet: string) {
      return gatesArr.find((g: any) => g.planet === planet);
    }
    const profileLabels = {
      1: "Investigator", 2: "Hermit", 3: "Martyr", 4: "Opportunist", 5: "Heretic", 6: "Role Model"
    };

    const sunPersonality = getGateByPlanet(personalityGatesOrdered, "sun");
    const earthDesign = getGateByPlanet(designGatesOrdered, "earth");
    const conscious = sunPersonality?.line || 1;
    const unconscious = earthDesign?.line || 1;
    const profile = `${conscious}/${unconscious} (${getProfileLabel(conscious) || ""}/${getProfileLabel(unconscious) || ""})`;

    // ---- PATCH: Robust channel graph definition evaluation ----
    function calculateHDDefinition(centers) {
      // Construct graph: nodes = defined centers, edges = channels connecting them
      const definedCenters = Object.keys(centers).filter(cn => centers[cn].defined);
      const adj = {};
      definedCenters.forEach(center => adj[center] = []);
      // Build adjacency list
      for (const center of definedCenters) {
        for (const ch of centers[center].channels || []) {
          // For each channel, get the other connected center (if both defined)
          const [a, b] = ch;
          const ca = getCenterOfGate(a);
          const cb = getCenterOfGate(b);
          if (ca !== cb && definedCenters.includes(ca) && definedCenters.includes(cb)) {
            if (!adj[ca].includes(cb)) adj[ca].push(cb);
            if (!adj[cb].includes(ca)) adj[cb].push(ca);
          }
        }
      }
      // Count connected components via BFS
      const visited = {};
      let groupCount = 0;
      for (const center of definedCenters) {
        if (!visited[center]) {
          groupCount++;
          const queue = [center];
          while (queue.length) {
            const node = queue.shift();
            if (!visited[node]) {
              visited[node] = true;
              (adj[node] || []).forEach(nbr => {
                if (!visited[nbr]) queue.push(nbr);
              });
            }
          }
        }
      }
      // Map to labels
      if (groupCount === 0) return "No Definition";
      if (groupCount === 1) return "Single Definition";
      if (groupCount === 2) return "Split Definition";
      if (groupCount === 3) return "Triple Split Definition";
      return "Quadruple Split Definition";
    }
    function getCenterOfGate(gateNum) {
      return GATE_TO_CENTER_MAP[gateNum];
    }

    const definition = calculateHDDefinition(centers);

    // Format output as HD expects (no duplicates, canonical planet order)
    return {
      type,
      profile,
      authority,
      strategy: getStrategyForType(type),
      definition,
      not_self_theme: getNotSelfThemeForType(type),
      life_purpose: generateLifePurpose(type, profile, authority),
      centers,
      gates: {
        unconscious_design: designGatesOrdered.map(g => `${g.gate}.${g.line}`),
        conscious_personality: personalityGatesOrdered.map(g => `${g.gate}.${g.line}`)
      },
      metadata: {
        personality_time: birthDateTime.toISOString(),
        design_time: designDateTime.toISOString(),
        offset_days: "88.736",
        calculation_method: "PROPER_HD_METHODOLOGY_V11_DUAL_EPHEMERIS_FIXED"
      }
    };
  } catch (error) {
    console.error("[HD] ERROR in calculation:", error);
    throw error;
  }
}

// --- Helper functions ported from your API logic ---

async function geocodeLocation(locationName) {
  console.log(`[HD] Geocoding: ${locationName}`);
  const googleApiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
  // Try Google first, fallback to Nominatim if missing
  if (!googleApiKey) return await tryNominatimGeocoding(locationName);
  try {
    const encodedLocation = encodeURIComponent(locationName);
    const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${googleApiKey}`;
    const response = await fetch(googleUrl);
    if (!response.ok) throw new Error(`Google API returned ${response.status}: ${response.statusText}`);
    const data = await response.json();
    if (data.status === 'OK' && data.results && data.results[0]) {
      const { lat, lng } = data.results[0].geometry.location;
      return `${lat},${lng}`; // format for API downstream
    }
    return null;
  } catch (error) {
    console.warn('[HD] Google geocoding failed:', error.message);
    // fallback to Nominatim
    return await tryNominatimGeocoding(locationName);
  }
}

async function tryNominatimGeocoding(locationName) {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`);
  if (!response.ok) throw new Error(`Nominatim failed`);
  const data = await response.json();
  if (data && data[0] && data[0].lat && data[0].lon) {
    return `${data[0].lat},${data[0].lon}`;
  }
  return null;
}

async function fetchEphemerisData(dateTime, location, timezone, coordinates, label) {
  const year = dateTime.getFullYear();
  const month = String(dateTime.getMonth() + 1).padStart(2, '0');
  const day = String(dateTime.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  const hours = String(dateTime.getHours()).padStart(2, '0');
  const minutes = String(dateTime.getMinutes()).padStart(2, '0');
  const formattedTime = `${hours}:${minutes}`;
  // Always fetch for specific time in UTC
  const ephemerisUrl = 'https://soul-sync-flow.vercel.app/api/ephemeris';
  const body = {
    datetime: `${formattedDate}T${formattedTime}:00.000Z`,
    coordinates
  };
  const response = await fetch(ephemerisUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`[HD] Ephemeris API error: ${label}: ${response.status} ${errorText}`);
  }
  const result = await response.json();
  if (!result.success) throw new Error(`[HD] Ephemeris call failed: ${label} - ${result.error}`);
  // Support both result.data.planets and result.data as the planetary data object
  if (result.data && result.data.planets) return result.data.planets;
  return result.data;
}

// Calculate HD gates from celestial data using HD standard
function calculateHDGatesFromCelestialData(celestialData, type) {
  // Standard HD order: ['sun', 'earth', 'north_node',...]
  const gates = [];
  function longitudeToHDGate(longitude) {
    // Official mapping: 64 gates, each 5.625°, line = each 0.9375°
    const hdMandala = [
      41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
      27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
      31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
      28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
    ];
    const d = ((longitude % 360) + 360) % 360;
    const gateIdx = Math.floor(d / 5.625);
    const gate = hdMandala[gateIdx];
    const line = Math.floor((d % 5.625) / 0.9375) + 1;
    return { gate, line: Math.min(line, 6) };
  }
  // Calculate Earth as direct opposite of Sun
  const planetaryOrder = [
    "sun", "earth", "north_node", "south_node", "moon", "mercury", "venus", "mars",
    "jupiter", "saturn", "uranus", "neptune", "pluto"
  ];
  const earthLongitude = celestialData.sun
    ? (celestialData.sun.longitude + 180) % 360
    : null;
  for (const planet of planetaryOrder) {
    let pos = celestialData[planet];
    if (planet === "earth" && celestialData.sun) {
      pos = { longitude: earthLongitude };
    }
    if (pos && typeof pos.longitude === "number") {
      const result = longitudeToHDGate(pos.longitude);
      gates.push({
        planet,
        gate: result.gate,
        line: result.line,
        type
      });
    } else {
      gates.push({
        planet,
        gate: null,
        line: null,
        type
      });
    }
  }
  return gates;
}

function calculateCentersFromChannels(allGates) {
  const centers = {
    Head: { defined: false, gates: [], channels: [] },
    Ajna: { defined: false, gates: [], channels: [] },
    Throat: { defined: false, gates: [], channels: [] },
    G: { defined: false, gates: [], channels: [] },
    Heart: { defined: false, gates: [], channels: [] },
    "Solar Plexus": { defined: false, gates: [], channels: [] },
    Sacral: { defined: false, gates: [], channels: [] },
    Spleen: { defined: false, gates: [], channels: [] },
    Root: { defined: false, gates: [], channels: [] }
  };
  
  const gateToCenterMap = {
    64: 'Head', 61: 'Head', 63: 'Head',
    47: 'Ajna', 24: 'Ajna', 4: 'Ajna', 17: 'Ajna', 43: 'Ajna', 11: 'Ajna',
    62: 'Throat', 23: 'Throat', 56: 'Throat', 35: 'Throat', 12: 'Throat',
    45: 'Throat', 33: 'Throat', 8: 'Throat', 31: 'Throat', 7: 'Throat',
    1: 'Throat', 13: 'Throat', 10: 'Throat', 20: 'Throat', 16: 'Throat',
    25: 'G', 46: 'G', 22: 'G', 36: 'G', 2: 'G', 15: 'G', 5: 'G', 14: 'G',
    21: 'Heart', 40: 'Heart', 26: 'Heart', 51: 'Heart',
    6: 'Solar Plexus', 37: 'Solar Plexus', 30: 'Solar Plexus', 55: 'Solar Plexus',
    49: 'Solar Plexus', 19: 'Solar Plexus', 39: 'Solar Plexus',
    41: 'Solar Plexus', 22: 'Solar Plexus', 36: 'Solar Plexus',
    34: 'Sacral', 5: 'Sacral', 14: 'Sacral', 29: 'Sacral', 59: 'Sacral',
    9: 'Sacral', 3: 'Sacral', 42: 'Sacral', 27: 'Sacral',
    48: 'Spleen', 57: 'Spleen', 44: 'Spleen', 50: 'Spleen', 32: 'Spleen', 28: 'Spleen', 18: 'Spleen',
    53: 'Root', 60: 'Root', 52: 'Root', 19: 'Root', 39: 'Root', 41: 'Root',
    58: 'Root', 38: 'Root', 54: 'Root'
  };
  
  allGates.forEach(gateInfo => {
    const gateNum = gateInfo.gate;
    const centerName = gateToCenterMap[gateNum];
    if (centerName && centers[centerName] && !centers[centerName].gates.includes(gateNum)) {
      centers[centerName].gates.push(gateNum);
      centers[centerName].defined = true;
    }
  });
  
  const channels = [
    [64, 47], [61, 24], [63, 4],
    [17, 62], [43, 23], [11, 56],
    [35, 36], [12, 22], [8, 1], [31, 7], [33, 13], [10, 20], [16, 48],
    [25, 51], [46, 29], [2, 14], [15, 5],
    [21, 45], [26, 44], [40, 37], [51, 25],
    [6, 59], [37, 40], [30, 41], [55, 39], [49, 19], [22, 12], [36, 35],
    [34, 57], [34, 10], [34, 20], [5, 15], [14, 2], [29, 46], [59, 6], [27, 50], [3, 60], [42, 53], [9, 52],
    [48, 16], [57, 34], [57, 10], [57, 20], [44, 26], [50, 27], [32, 54], [28, 38], [18, 58],
    [53, 42], [60, 3], [52, 9], [19, 49], [39, 55], [41, 30], [58, 18], [38, 28], [54, 32]
  ];
  
  channels.forEach(([gateA, gateB]) => {
    const centerA = gateToCenterMap[gateA];
    const centerB = gateToCenterMap[gateB];
    
    if (centerA && centerB && 
        centers[centerA].gates.includes(gateA) && 
        centers[centerB].gates.includes(gateB)) {
      
      centers[centerA].defined = true;
      centers[centerB].defined = true;
      
      const channel = [gateA, gateB];
      if (!centers[centerA].channels.some(ch => 
          (ch[0] === channel[0] && ch[1] === channel[1]) || 
          (ch[0] === channel[1] && ch[1] === channel[0]))) {
        centers[centerA].channels.push(channel);
      }
      
      if (centerA !== centerB && !centers[centerB].channels.some(ch => 
          (ch[0] === channel[0] && ch[1] === channel[1]) || 
          (ch[0] === channel[1] && ch[1] === channel[0]))) {
        centers[centerB].channels.push(channel);
      }
    }
  });
  
  return centers;
}

function determineHDType(centers) {
  const sacralDefined = centers.Sacral?.defined || false;
  const throatDefined = centers.Throat?.defined || false;
  const heartDefined = centers.Heart?.defined || false;
  const solarPlexusDefined = centers['Solar Plexus']?.defined || false;
  const rootDefined = centers.Root?.defined || false;
  
  const hasMotorToThroat = checkMotorToThroatConnection(centers);
  const hasSacralToThroat = checkSacralToThroatConnection(centers);
  
  if (sacralDefined && throatDefined && hasSacralToThroat) {
    return 'Manifesting Generator';
  }
  
  if (throatDefined && hasMotorToThroat && !sacralDefined) {
    return 'Manifestor';
  }
  
  if (sacralDefined) {
    return 'Generator';
  }
  
  const definedCenters = Object.values(centers).filter(center => center.defined).length;
  if (definedCenters === 0) {
    return 'Reflector';
  }
  
  return 'Projector';
}

function checkMotorToThroatConnection(centers) {
  const motorToThroatChannels = [
    [21, 45], [26, 44], 
    [35, 36], [12, 22]
  ];
  
  return motorToThroatChannels.some(([gateA, gateB]) => {
    const hasGateA = Object.values(centers).some(center => center.gates.includes(gateA));
    const hasGateB = Object.values(centers).some(center => center.gates.includes(gateB));
    
    const isMotorToThroat = (
      (centers.Heart?.gates.includes(gateA) && centers.Throat?.gates.includes(gateB)) ||
      (centers.Heart?.gates.includes(gateB) && centers.Throat?.gates.includes(gateA)) ||
      (centers['Solar Plexus']?.gates.includes(gateA) && centers.Throat?.gates.includes(gateB)) ||
      (centers['Solar Plexus']?.gates.includes(gateB) && centers.Throat?.gates.includes(gateA))
    );
    
    return hasGateA && hasGateB && isMotorToThroat;
  });
}

function checkSacralToThroatConnection(centers) {
  const sacralToThroatChannels = [
    [34, 20], [34, 10], [34, 57], [5, 15], [14, 2], [29, 46]
  ];
  
  return sacralToThroatChannels.some(([a, b]) => {
    return (centers.Sacral?.gates.includes(a) && centers.Throat?.gates.includes(b)) ||
           (centers.Sacral?.gates.includes(b) && centers.Throat?.gates.includes(a));
  });
}

function determineHDAuthority(centers) {
  if (centers['Solar Plexus']?.defined) return "Emotional";
  if (centers.Sacral?.defined) return "Sacral";
  if (centers.Spleen?.defined) return "Splenic";
  if (centers.Heart?.defined) return "Ego";
  if (centers.G?.defined) return "G Center/Self-Projected";
  if (centers.Throat?.defined) return "Mental";
  return "Lunar (Reflector)";
}

function calculateHDProfile(sunGateInfo, designSunGateInfo) {
  if (!sunGateInfo || !designSunGateInfo) return "1/3 (Investigator/Martyr)";
  const profileLabels = {
    "1": "Investigator",
    "2": "Hermit",
    "3": "Martyr",
    "4": "Opportunist",
    "5": "Heretic",
    "6": "Role Model"
  };
  const conscious = sunGateInfo.line || 1;
  const unconscious = designSunGateInfo.line || 1;
  return `${conscious}/${unconscious} (${getProfileLabel(conscious) || ''}/${getProfileLabel(unconscious) || ''})`;
}

// REPLACE calculateDefinition with an HD-correct channel graph method:
function calculateHDDefinition(centers) {
  // Construct graph: nodes = defined centers, edges = channels connecting them
  const definedCenters = Object.keys(centers).filter(cn => centers[cn].defined);
  const adj = {};
  definedCenters.forEach(center => adj[center] = []);
  // Build adjacency list
  for (const center of definedCenters) {
    for (const ch of centers[center].channels || []) {
      // For each channel, get the other connected center (if both defined)
      const [a, b] = ch;
      const ca = getCenterOfGate(a);
      const cb = getCenterOfGate(b);
      if (ca !== cb && definedCenters.includes(ca) && definedCenters.includes(cb)) {
        if (!adj[ca].includes(cb)) adj[ca].push(cb);
        if (!adj[cb].includes(ca)) adj[cb].push(ca);
      }
    }
  }
  // Count connected components via BFS
  const visited = {};
  let groupCount = 0;
  for (const center of definedCenters) {
    if (!visited[center]) {
      groupCount++;
      const queue = [center];
      while (queue.length) {
        const node = queue.shift();
        if (!visited[node]) {
          visited[node] = true;
          (adj[node] || []).forEach(nbr => {
            if (!visited[nbr]) queue.push(nbr);
          });
        }
      }
    }
  }
  // Map to labels
  if (groupCount === 0) return "No Definition";
  if (groupCount === 1) return "Single Definition";
  if (groupCount === 2) return "Split Definition";
  if (groupCount === 3) return "Triple Split Definition";
  return "Quadruple Split Definition";
}

function getStrategyForType(type) {
  const strategies = {
    'Generator': 'Wait to respond',
    'Manifesting Generator': 'Wait to respond then inform',
    'Manifestor': 'Inform before acting',
    'Projector': 'Wait for the invitation',
    'Reflector': 'Wait a lunar cycle'
  };
  return strategies[type] || 'Unknown';
}

function getNotSelfThemeForType(type) {
  const themes = {
    'Generator': 'Frustration',
    'Manifesting Generator': 'Frustration and anger',
    'Manifestor': 'Anger',
    'Projector': 'Bitterness',
    'Reflector': 'Disappointment'
  };
  return themes[type] || 'Unknown';
}

function getProfileLabel(lineNum) {
  return PROFILE_LABELS[lineNum] || "";
}
