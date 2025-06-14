// Fixed Human Design calculation using correct gate wheel mapping and conversion

export async function calculateHumanDesign(
  birthDate: string,
  birthTime: string,
  location: string,
  timezone: string,
  celestialData: any // We'll use our own ephemeris data instead
) {
  try {
    console.log("[HD] Starting Human Design calculation with corrected gate mapping...");

    // Step 1: Geocode the location to get coordinates
    const coordinates = await geocodeLocation(location);

    if (!coordinates) {
      throw new Error(`Could not geocode location: ${location}`);
    }

    // Step 2: Use our corrected HDKit implementation
    const humanDesignResult = await calculateChartLocal({
      birthDate,
      birthTime,
      coordinates
    });

    return humanDesignResult;

  } catch (error) {
    console.error("[HD] Error in Human Design calculation:", error);

    // Return error info instead of fallback
    return {
      type: "ERROR",
      notice: "Human Design calculation failed",
      error: error instanceof Error ? error.message : error,
      method: "CORRECTED_HD_IMPLEMENTATION"
    };
  }
}

// CORRECTED Human Design gate wheel - This is the accurate I-Ching hexagram to gate mapping
// Starting from 0° Aries and going clockwise around the wheel
const CORRECT_GATES = [
  41, 19, 13, 49, 30, 55, 37, 63,  // Aries section
  22, 36, 25, 17, 21, 51, 42, 3,   // Taurus section  
  27, 24, 2, 23, 8, 20, 16, 35,    // Gemini section
  45, 12, 15, 52, 39, 53, 62, 56,  // Cancer section
  31, 33, 7, 4, 29, 59, 40, 64,    // Leo section
  47, 6, 46, 18, 48, 57, 32, 50,   // Virgo section  
  28, 44, 1, 43, 14, 34, 9, 5,     // Libra section
  26, 11, 10, 58, 38, 54, 61, 60   // Scorpio/Sagittarius/Capricorn/Aquarius/Pisces section
];

const GATE_TO_CENTER_MAP = {
  // Head Center
  64:"Head", 61:"Head", 63:"Head",
  
  // Ajna Center  
  47:"Ajna", 24:"Ajna", 4:"Ajna", 17:"Ajna", 43:"Ajna", 11:"Ajna",
  
  // Throat Center
  62:"Throat", 23:"Throat", 56:"Throat", 35:"Throat", 12:"Throat", 45:"Throat", 
  33:"Throat", 8:"Throat", 31:"Throat", 7:"Throat", 1:"Throat", 13:"Throat", 
  10:"Throat", 20:"Throat", 16:"Throat",
  
  // G Center
  25:"G", 46:"G", 22:"G", 36:"G", 2:"G", 15:"G", 5:"G", 14:"G",
  
  // Heart/Ego Center
  21:"Heart", 40:"Heart", 26:"Heart", 51:"Heart",
  
  // Solar Plexus Center
  6:"Solar Plexus", 37:"Solar Plexus", 30:"Solar Plexus", 55:"Solar Plexus",
  49:"Solar Plexus", 19:"Solar Plexus", 39:"Solar Plexus", 41:"Solar Plexus",
  
  // Sacral Center
  34:"Sacral", 5:"Sacral", 14:"Sacral", 29:"Sacral", 59:"Sacral",
  9:"Sacral", 3:"Sacral", 42:"Sacral", 27:"Sacral",
  
  // Spleen Center
  48:"Spleen", 57:"Spleen", 44:"Spleen", 50:"Spleen", 32:"Spleen", 28:"Spleen", 18:"Spleen",
  
  // Root Center
  53:"Root", 60:"Root", 52:"Root", 19:"Root", 39:"Root", 41:"Root", 58:"Root", 38:"Root", 54:"Root"
};

const CHANNELS = [
  [64, 47],[61,24],[63,4],[17,62],[43,23],[11,56],[35,36],[12,22],[8,1],[31,7],[33,13],[10,20],[16,48],
  [25,51],[46,29],[2,14],[15,5],[21,45],[26,44],[40,37],[51,25],[6,59],[37,40],[30,41],[55,39],[49,19],[22,12],[36,35],
  [34,57],[34,10],[34,20],[5,15],[14,2],[29,46],[59,6],[27,50],[3,60],[42,53],[9,52],
  [48,16],[57,34],[57,10],[57,20],[44,26],[50,27],[32,54],[28,38],[18,58],
  [53,42],[60,3],[52,9],[19,49],[39,55],[41,30],[58,18],[38,28],[54,32]
];

const PROFILE_LABELS = {1:"Investigator",2:"Hermit",3:"Martyr",4:"Opportunist",5:"Heretic",6:"Role Model"};

// CORRECTED longitude to gate/line conversion using proper Human Design wheel
function correctLongitudeToGateLine(longitude: number) {
  // Human Design wheel: 64 gates, each covering 5.625 degrees (360/64)
  // Lines: 6 lines per gate, each covering 0.9375 degrees (5.625/6)
  
  // Normalize longitude to 0-360 range
  const normalized = ((longitude % 360) + 360) % 360;
  
  // Calculate gate index (0-63)
  const gateIndex = Math.floor(normalized / 5.625);
  const gate = CORRECT_GATES[gateIndex];
  
  // Calculate line within the gate (1-6)
  const positionInGate = normalized % 5.625;
  const line = Math.floor(positionInGate / 0.9375) + 1;
  
  return { 
    gate, 
    line: Math.min(Math.max(line, 1), 6) // Ensure line is between 1-6
  };
}

// Fetch ephemeris data using our working API
async function fetchEphemerisData(dateIso: string, coordinates: string) {
  console.log(`[HD] Fetching ephemeris for ${dateIso} at ${coordinates}`);
  
  const apiUrl = "https://soul-sync-flow.vercel.app/api/ephemeris";
  const resp = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ datetime: dateIso, coordinates }),
  });
  
  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`Ephemeris API error: ${resp.status} ${errorText}`);
  }
  
  const data = await resp.json();
  console.log(`[HD] Ephemeris API response:`, data.success ? "SUCCESS" : "FAILED");
  
  if (!data.success || !data.data || !data.data.planets) {
    throw new Error("Ephemeris failed: " + JSON.stringify(data));
  }
  
  return data.data.planets;
}

// Main Human Design calculation function with corrected algorithms
async function calculateChartLocal({ birthDate, birthTime, coordinates }: {
  birthDate: string;
  birthTime: string; 
  coordinates: string;
}) {
  console.log(`[HD] Starting corrected chart calculation for ${birthDate} ${birthTime}`);
  
  // Step 1: Parse and calculate dual datetimes (88.736 days = 88 days, 17 hours, 39 minutes, 36 seconds)
  const birthDateTime = new Date(`${birthDate}T${birthTime}`);
  const designDateTime = new Date(birthDateTime.getTime() - (88.736 * 24 * 60 * 60 * 1000));
  
  console.log(`[HD] Birth time: ${birthDateTime.toISOString()}`);
  console.log(`[HD] Design time: ${designDateTime.toISOString()}`);
  
  // Step 2: Fetch ephemeris for both times
  const pCelestial = await fetchEphemerisData(birthDateTime.toISOString(), coordinates);
  const dCelestial = await fetchEphemerisData(designDateTime.toISOString(), coordinates);
  
  console.log(`[HD] Personality Sun: ${pCelestial.sun?.longitude}°`);
  console.log(`[HD] Design Sun: ${dCelestial.sun?.longitude}°`);

  // Step 3: Compute gates & lines for standard planet order using CORRECTED conversion
  function computePlanetGates(celestial: any) {
    let results: any[] = [];
    
    // Calculate Earth as opposite of Sun (Sun + 180°)
    const sunLon = celestial.sun?.longitude;
    const earthLon = typeof sunLon === "number" ? ((sunLon + 180) % 360) : celestial.earth?.longitude;
    
    const planetMap = {
      sun: celestial.sun,
      earth: { ...celestial.earth, longitude: earthLon },
      moon: celestial.moon, 
      mercury: celestial.mercury, 
      venus: celestial.venus, 
      mars: celestial.mars,
      jupiter: celestial.jupiter, 
      saturn: celestial.saturn, 
      uranus: celestial.uranus,
      neptune: celestial.neptune, 
      pluto: celestial.pluto,
      north_node: celestial.north_node, 
      south_node: celestial.south_node
    };
    
    Object.entries(planetMap).forEach(([planet, obj]: [string, any]) => {
      if(obj && typeof obj.longitude === "number") {
        const {gate, line} = correctLongitudeToGateLine(obj.longitude);
        results.push({ planet, gate, line });
        console.log(`[HD] ${planet}: ${obj.longitude}° → Gate ${gate}.${line}`);
      }
    });
    
    return results;
  }
  
  const pGates = computePlanetGates(pCelestial);
  const dGates = computePlanetGates(dCelestial);
  
  console.log(`[HD] Personality gates count: ${pGates.length}`);
  console.log(`[HD] Design gates count: ${dGates.length}`);

  // Step 4: Determine defined centers using corrected channel logic
  function buildCenters(gateArr: any[]) {
    const centers: any = {
      Head:{defined:false,gates:[],channels:[]},
      Ajna:{defined:false,gates:[],channels:[]},
      Throat:{defined:false,gates:[],channels:[]},
      G:{defined:false,gates:[],channels:[]},
      Heart:{defined:false,gates:[],channels:[]},
      "Solar Plexus":{defined:false,gates:[],channels:[]},
      Sacral:{defined:false,gates:[],channels:[]},
      Spleen:{defined:false,gates:[],channels:[]},
      Root:{defined:false,gates:[],channels:[]}
    };
    
    // Add gates to their centers
    gateArr.forEach(info => {
      const center = GATE_TO_CENTER_MAP[info.gate];
      if(center && !centers[center].gates.includes(info.gate)){
        centers[center].gates.push(info.gate);
      }
    });
    
    // Mark defined channels - a channel exists when both gates are present
    CHANNELS.forEach(([a, b]) => {
      const centerA = GATE_TO_CENTER_MAP[a];
      const centerB = GATE_TO_CENTER_MAP[b];
      
      if(centerA && centerB && 
         centers[centerA].gates.includes(a) && 
         centers[centerB].gates.includes(b)) {
        
        centers[centerA].defined = true; 
        centers[centerB].defined = true;
        
        // Add channel to both centers
        if(!centers[centerA].channels.some((ch: number[]) => (ch[0]===a && ch[1]===b)||(ch[0]===b && ch[1]===a)))
          centers[centerA].channels.push([a,b]);
        if(centerA !== centerB && !centers[centerB].channels.some((ch: number[]) => (ch[0]===a && ch[1]===b)||(ch[0]===b && ch[1]===a)))
          centers[centerB].channels.push([a,b]);
      }
    });
    
    return centers;
  }

  const allGates = [...pGates, ...dGates];
  const centers = buildCenters(allGates);
  
  console.log(`[HD] Defined centers:`, Object.keys(centers).filter(c => centers[c].defined));

  // Step 5: Type logic (unchanged)
  function getType(centers: any) {
    const sacral = centers.Sacral?.defined;
    const throat = centers.Throat?.defined;
    
    if(sacral && throat){ 
      // Check for direct sacral-throat connection for ManGen
      const connecting = centers.Sacral.channels.some((ch: number[]) =>
        GATE_TO_CENTER_MAP[ch[0]]==="Throat"||GATE_TO_CENTER_MAP[ch[1]]==="Throat"
      );
      if(connecting) return "Manifesting Generator";
      return "Generator";
    }
    
    // Check motor-to-throat for Manifestor
    if(throat) {
      const motorCenters = ["Heart", "Solar Plexus", "Sacral", "Root"];
      const definedMotors = motorCenters.filter(c => centers[c].defined);
      
      for(let m of definedMotors){
        for(let ch of centers[m].channels){
          const [gA, gB] = ch;
          const cA = GATE_TO_CENTER_MAP[gA];
          const cB = GATE_TO_CENTER_MAP[gB];
          if((cA===m && cB==="Throat")||(cB===m && cA==="Throat")){
            if(!sacral) return "Manifestor"; // Only if sacral not defined
          }
        }
      }
    }
    
    if(sacral) return "Generator";
    
    const definedCenters = Object.values(centers).filter((c: any) => c.defined).length;
    if(!definedCenters) return "Reflector";
    return "Projector";
  }

  // Step 6: Authority logic (unchanged)
  function getAuthority(centers: any) {
    if(centers["Solar Plexus"]?.defined) return "Emotional";
    if(centers.Sacral?.defined) return "Sacral";
    if(centers.Spleen?.defined) return "Splenic";
    if(centers.Heart?.defined) return "Ego";
    if(centers.G?.defined) return "G Center/Self-Projected";
    if(centers.Throat?.defined) return "Mental";
    return "Lunar (Reflector)";
  }

  // Step 7: CORRECTED Profile from personality Sun line (conscious), design Earth line (unconscious)
  const pSun = pGates.find(g => g.planet === "sun");
  const dEarth = dGates.find(g => g.planet === "earth");
  const profileNum = `${pSun?.line || 1}/${dEarth?.line || 1}`;
  const profile = `${profileNum} (${PROFILE_LABELS[pSun?.line||1]||""}/${PROFILE_LABELS[dEarth?.line||1]||""})`;

  // Step 8: Strategy & Not-self
  function getStrategy(type: string) {
    return {
      "Generator":"Wait to respond",
      "Manifesting Generator":"Wait to respond then inform",
      "Manifestor":"Inform before acting",
      "Projector":"Wait for the invitation",
      "Reflector":"Wait a lunar cycle"
    }[type]||"Unknown";
  }
  
  function getNotSelfTheme(type: string) {
    return {
      "Generator":"Frustration",
      "Manifesting Generator":"Frustration and anger",
      "Manifestor":"Anger",
      "Projector":"Bitterness",
      "Reflector":"Disappointment"
    }[type]||"Unknown";
  }

  // Step 9: Definition calculation
  function calculateDefinition(centers: any) {
    const definedCenters = Object.keys(centers).filter(c => centers[c].defined);
    if(!definedCenters.length) return "No Definition";
    
    // Build adjacency list for defined centers
    const adj: any = {};
    definedCenters.forEach(c => adj[c] = []);
    
    for(let c of definedCenters){
      for(let ch of centers[c].channels){
        const [gA, gB] = ch;
        const ca = GATE_TO_CENTER_MAP[gA];
        const cb = GATE_TO_CENTER_MAP[gB];
        if(ca !== cb && definedCenters.includes(ca) && definedCenters.includes(cb)){
          if(!adj[ca].includes(cb)) adj[ca].push(cb);
          if(!adj[cb].includes(ca)) adj[cb].push(ca);
        }
      }
    }
    
    // Find connected components
    const visited: any = {};
    const groups = [];
    for(let c of definedCenters){
      if(!visited[c]){
        let q = [c];
        groups.push([]);
        while(q.length){
          let n = q.shift();
          if(!visited[n]){
            visited[n] = true;
            groups.at(-1).push(n);
            for(let nb of adj[n]||[]) if(!visited[nb]) q.push(nb);
          }
        }
      }
    }
    
    if(groups.length === 1) return "Single Definition";
    if(groups.length === 2) return "Split Definition";
    if(groups.length === 3) return "Triple Split Definition";
    if(groups.length === 4) return "Quadruple Split Definition";
    return "No Definition";
  }

  // Step 10: Final output
  const type = getType(centers);
  const authority = getAuthority(centers);
  const definition = calculateDefinition(centers);
  const strategy = getStrategy(type);
  const not_self_theme = getNotSelfTheme(type);
  
  console.log(`[HD] Calculated type: ${type}`);
  console.log(`[HD] Calculated authority: ${authority}`);
  console.log(`[HD] Calculated profile: ${profile}`);

  return {
    type,
    profile,
    authority,
    strategy,
    definition,
    not_self_theme,
    centers,
    gates: {
      conscious_personality: pGates.map(g => `${g.gate}.${g.line}`),
      unconscious_design: dGates.map(g => `${g.gate}.${g.line}`)
    },
    metadata: {
      birthDateTime: birthDateTime.toISOString(),
      designDateTime: designDateTime.toISOString(),
      library: "corrected-hdkit-v4",
      method: "corrected_dual_ephemeris_calculation"
    }
  };
}

// Geocoding remains unchanged
async function geocodeLocation(locationName: string): Promise<string | null> {
  console.log(`[HD] Geocoding: ${locationName}`);

  const googleApiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
  if (!googleApiKey) return await tryNominatimGeocoding(locationName);

  try {
    const encodedLocation = encodeURIComponent(locationName);
    const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${googleApiKey}`;
    const response = await fetch(googleUrl);
    if (!response.ok) throw new Error(`Google API returned ${response.status}: ${response.statusText}`);
    const data = await response.json();
    if (data.status === "OK" && data.results && data.results[0]) {
      const { lat, lng } = data.results[0].geometry.location;
      return `${lat},${lng}`;
    }
    return null;
  } catch (error) {
    console.warn("[HD] Google geocoding failed:", error.message);
    return await tryNominatimGeocoding(locationName);
  }
}

async function tryNominatimGeocoding(locationName: string): Promise<string | null> {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`);
    if (!response.ok) throw new Error(`Nominatim API returned ${response.status}`);
    const data = await response.json();
    if (data && data[0] && data[0].lat && data[0].lon) {
      return `${data[0].lat},${data[0].lon}`;
    }
    return null;
  } catch (error) {
    console.error(`[HD] Nominatim geocoding error for ${locationName}:`, error);
    return null;
  }
}
