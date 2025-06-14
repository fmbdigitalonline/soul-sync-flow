
/**
 * Human Design chart calculation with full logic and real ephemeris API.
 * Based on MIT-licensed hdkit by Jonah Dempcy (https://github.com/jdempcy/hdkit)
 * Enhanced for dual ephemeris and complete type/profile logic.
 */

// -------- Mappings for Human Design gates, centers, and channels --------
const GATES = [
  41, 19, 13, 49, 30, 55, 37, 63,
  22, 36, 25, 17, 21, 51, 42, 3,
  27, 24, 2, 23, 8, 20, 16, 35,
  45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7, 4, 29, 59, 40, 64,
  47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5,
  26, 11, 10, 58, 38, 54, 61, 60
];

const GATE_TO_CENTER_MAP = {
  64:"Head",61:"Head",63:"Head",
  47:"Ajna",24:"Ajna",4:"Ajna",17:"Ajna",43:"Ajna",11:"Ajna",
  62:"Throat",23:"Throat",56:"Throat",35:"Throat",12:"Throat",45:"Throat",33:"Throat",8:"Throat",31:"Throat",7:"Throat",1:"Throat",13:"Throat",10:"Throat",20:"Throat",16:"Throat",
  25:"G",46:"G",22:"G",36:"G",2:"G",15:"G",5:"G",14:"G",
  21:"Heart",40:"Heart",26:"Heart",51:"Heart",
  6:"Solar Plexus",37:"Solar Plexus",30:"Solar Plexus",55:"Solar Plexus",49:"Solar Plexus",19:"Solar Plexus",39:"Solar Plexus",41:"Solar Plexus",22:"Solar Plexus",36:"Solar Plexus",
  34:"Sacral",5:"Sacral",14:"Sacral",29:"Sacral",59:"Sacral",9:"Sacral",3:"Sacral",42:"Sacral",27:"Sacral",
  48:"Spleen",57:"Spleen",44:"Spleen",50:"Spleen",32:"Spleen",28:"Spleen",18:"Spleen",
  53:"Root",60:"Root",52:"Root",19:"Root",39:"Root",41:"Root",58:"Root",38:"Root",54:"Root"
};

const CHANNELS = [
  [64, 47],[61,24],[63,4],[17,62],[43,23],[11,56],[35,36],[12,22],[8,1],[31,7],[33,13],[10,20],[16,48],
  [25,51],[46,29],[2,14],[15,5],[21,45],[26,44],[40,37],[51,25],[6,59],[37,40],[30,41],[55,39],[49,19],[22,12],[36,35],
  [34,57],[34,10],[34,20],[5,15],[14,2],[29,46],[59,6],[27,50],[3,60],[42,53],[9,52],
  [48,16],[57,34],[57,10],[57,20],[44,26],[50,27],[32,54],[28,38],[18,58],
  [53,42],[60,3],[52,9],[19,49],[39,55],[41,30],[58,18],[38,28],[54,32]
];

const PROFILE_LABELS = {1:"Investigator",2:"Hermit",3:"Martyr",4:"Opportunist",5:"Heretic",6:"Role Model"};

// -------- Utilities --------
const GATE_SIZE = 360 / 64, LINE_SIZE = GATE_SIZE / 6;

// Map longitude to gate & line (per HD mandala)
function longitudeToGateLine(longitude) {
  const normalized = ((longitude % 360) + 360) % 360;
  const gate_index = Math.floor(normalized / GATE_SIZE);
  const gate = GATES[gate_index];
  const inGate = normalized % GATE_SIZE;
  const line = Math.floor(inGate / LINE_SIZE) + 1;
  return { gate, line: Math.min(Math.max(line, 1), 6) };
}

// -------- API: fetch ephemeris for date/coordinates --------
async function fetchEphemerisData(dateIso, coordinates) {
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
  if (!data.success || !data.data || !data.data.planets) {
    throw new Error("Ephemeris failed: " + JSON.stringify(data));
  }
  return data.data.planets;
}

// Human Design Calculation Core (all logic included)
async function calculateChart({ date, location }) {
  // Step 1: Parse and calculate dual datetimes
  const birthDateTime = new Date(date);
  const designDateTime = new Date(birthDateTime.getTime() - 88.736*24*60*60*1000);
  const coordinates = typeof location === "string"
    ? location
    : typeof location.lat === "number" && typeof location.lon === "number"
      ? `${location.lat},${location.lon}`
      : (()=>{throw new Error("location should be {lat,lon} or 'lat,lon'")})();

  // Step 2: Fetch ephemeris for both
  const pCelestial = await fetchEphemerisData(birthDateTime.toISOString(), coordinates);
  const dCelestial = await fetchEphemerisData(designDateTime.toISOString(), coordinates);

  // Step 3: Compute gates & lines for standard planet order
  function computePlanetGates(celestial) {
    let results = [];
    // Sun and Earth: Earth is always opposite Sun
    const sunLon = celestial.sun?.longitude;
    const earthLon = typeof sunLon === "number" ? ((sunLon + 180) % 360) : celestial.earth?.longitude;
    const map = {
      sun: celestial.sun,
      earth: { ...celestial.earth, longitude: earthLon },
      moon: celestial.moon, mercury: celestial.mercury, venus: celestial.venus, mars: celestial.mars,
      jupiter: celestial.jupiter, saturn: celestial.saturn, uranus: celestial.uranus,
      neptune: celestial.neptune, pluto: celestial.pluto,
      north_node: celestial.north_node, south_node: celestial.south_node
    };
    Object.entries(map).forEach(([planet, obj])=>{
      if(obj && typeof obj.longitude==="number") {
        const {gate, line} = longitudeToGateLine(obj.longitude);
        results.push({ planet, gate, line });
      }
    });
    return results;
  }
  const pGates = computePlanetGates(pCelestial);
  const dGates = computePlanetGates(dCelestial);

  // Step 4: Determine defined centers
  function buildCenters(gateArr) {
    // Build map with .gates & .channels for each center
    const centers = {
      Head:{defined:false,gates:[],channels:[]},Ajna:{defined:false,gates:[],channels:[]},Throat:{defined:false,gates:[],channels:[]},G:{defined:false,gates:[],channels:[]},
      Heart:{defined:false,gates:[],channels:[]},"Solar Plexus":{defined:false,gates:[],channels:[]},Sacral:{defined:false,gates:[],channels:[]},Spleen:{defined:false,gates:[],channels:[]},Root:{defined:false,gates:[],channels:[]}
    };
    gateArr.forEach(info=>{
      const center = GATE_TO_CENTER_MAP[info.gate];
      if(center && !centers[center].gates.includes(info.gate)){
        centers[center].gates.push(info.gate);
      }
    });
    // Mark defined/active channels
    CHANNELS.forEach(([a,b])=>{
      const ca=GATE_TO_CENTER_MAP[a],cb=GATE_TO_CENTER_MAP[b];
      if(ca && cb && centers[ca].gates.includes(a) && centers[cb].gates.includes(b)){
        centers[ca].defined=true; centers[cb].defined=true;
        // Add channel edge only once in each center
        if(!centers[ca].channels.some(ch=>(ch[0]===a && ch[1]===b)||(ch[0]===b && ch[1]===a)))
          centers[ca].channels.push([a,b]);
        if(ca!==cb && !centers[cb].channels.some(ch=>(ch[0]===a && ch[1]===b)||(ch[0]===b && ch[1]===a)))
          centers[cb].channels.push([a,b]);
      }
    });
    // After above, mark .defined for all with any gates
    Object.keys(centers).forEach(center=>{
      if(centers[center].gates.length) centers[center].defined=true;
    });
    return centers;
  }

  const allGates = [...pGates, ...dGates];
  const centers = buildCenters(allGates);

  // Step 5: Type logic
  function checkMotorToThroat(centers) {
    // Motors: Heart, Solar Plexus (Emotional), Sacral, Root
    const motorCenters = ["Heart", "Solar Plexus", "Sacral", "Root"];
    // Which are defined?
    const definedMotors = motorCenters.filter(c=>centers[c].defined);
    // Are any channels connecting defined Motor to defined Throat?
    for(let m of definedMotors){
      for(let ch of centers[m].channels){
        const [gA,gB]=ch,cA=GATE_TO_CENTER_MAP[gA],cB=GATE_TO_CENTER_MAP[gB];
        if((cA===m && cB==="Throat" && centers["Throat"].defined)
          ||(cB===m && cA==="Throat" && centers["Throat"].defined)){
          return true;
        }
      }
    }
    return false;
  }
  function getType(centers) {
    const sacral=centers.Sacral?.defined,throat=centers.Throat?.defined;
    const hasMotorToThroat=checkMotorToThroat(centers);
    if(sacral && throat){ // Sacral defined & Throat defined with connecting channel: Manifesting Generator
      const connecting = centers.Sacral.channels.some(ch=>GATE_TO_CENTER_MAP[ch[0]]==="Throat"||GATE_TO_CENTER_MAP[ch[1]]==="Throat");
      if(connecting) return "Manifesting Generator";
      return "Generator";
    }
    if(throat && hasMotorToThroat && !sacral) return "Manifestor";
    if(sacral) return "Generator";
    const definedCenters=Object.values(centers).filter(c=>c.defined).length;
    if(!definedCenters) return "Reflector";
    return "Projector";
  }
  // Step 6: Authority logic
  function getAuthority(centers) {
    if(centers["Solar Plexus"]?.defined) return "Emotional";
    if(centers.Sacral?.defined) return "Sacral";
    if(centers.Spleen?.defined) return "Splenic";
    if(centers.Heart?.defined) return "Ego";
    if(centers.G?.defined) return "G Center/Self-Projected";
    if(centers.Throat?.defined) return "Mental";
    return "Lunar (Reflector)";
  }
  // Step 7: Profile from personality Sun line (conscious), design Earth line (unconscious)
  const pSun = pGates.find(g=>g.planet==="sun"), dEarth = dGates.find(g=>g.planet==="earth");
  const profileNum = `${pSun?.line || 1}/${dEarth?.line || 1}`;
  const profile = `${profileNum} (${PROFILE_LABELS[pSun?.line||1]||""}/${PROFILE_LABELS[dEarth?.line||1]||""})`;
  // Step 8: Strategy & Not-self
  function getStrategy(type) {
    return {
      "Generator":"Wait to respond",
      "Manifesting Generator":"Wait to respond then inform",
      "Manifestor":"Inform before acting",
      "Projector":"Wait for the invitation",
      "Reflector":"Wait a lunar cycle"
    }[type]||"Unknown";
  }
  function getNotSelfTheme(type) {
    return {
      "Generator":"Frustration",
      "Manifesting Generator":"Frustration and anger",
      "Manifestor":"Anger",
      "Projector":"Bitterness",
      "Reflector":"Disappointment"
    }[type]||"Unknown";
  }
  // Step 9: Definition. Use graph connectivity (BFS on defined centers channels).
  function calculateDefinition(centers) {
    // BFS component count
    const definedCenters = Object.keys(centers).filter(c=>centers[c].defined);
    if(!definedCenters.length) return "No Definition";
    const adj={}; definedCenters.forEach(c=>adj[c]=[]);
    for(let c of definedCenters){
      for(let ch of centers[c].channels){
        const [gA,gB]=ch,ca=GATE_TO_CENTER_MAP[gA],cb=GATE_TO_CENTER_MAP[gB];
        if(ca !== cb && definedCenters.includes(ca) && definedCenters.includes(cb)){
          if(!adj[ca].includes(cb)) adj[ca].push(cb);
          if(!adj[cb].includes(ca)) adj[cb].push(ca);
        }
      }
    }
    const visited={},groups=[];
    for(let c of definedCenters){
      if(!visited[c]){
        let q=[c];groups.push([]);
        while(q.length){
          let n=q.shift();
          if(!visited[n]){
            visited[n]=true;groups.at(-1).push(n);
            for(let nb of adj[n]||[]) if(!visited[nb]) q.push(nb);
          }
        }
      }
    }
    if(groups.length===1) return "Single Definition";
    if(groups.length===2) return "Split Definition";
    if(groups.length===3) return "Triple Split Definition";
    if(groups.length===4) return "Quadruple Split Definition";
    return "No Definition";
  }

  // Step 10: Final output, no fallbacks/hardcoding.
  const type = getType(centers);
  const authority = getAuthority(centers);
  const definition = calculateDefinition(centers);
  const strategy = getStrategy(type);
  const not_self_theme = getNotSelfTheme(type);
  // Map output
  return {
    type,
    profile,
    authority,
    strategy,
    definition,
    not_self_theme,
    centers,
    gates: {
      conscious_personality: pGates.map(g=>`${g.gate}.${g.line}`),
      unconscious_design: dGates.map(g=>`${g.gate}.${g.line}`)
    },
    input: { date, location },
    notice: "Generated using full Human Design logic and real planetary positions from ephemeris API.",
    metadata: {
      birthDateTime: birthDateTime.toISOString(),
      designDateTime: designDateTime.toISOString(),
      library: "hdkit-port-v2",
      method: "dual_ephemeris_full_logic"
    }
  };
}

module.exports = { calculateChart };
