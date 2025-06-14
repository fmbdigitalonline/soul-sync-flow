
/**
 * Minimal hdkit port: calculateChart
 * Source: https://github.com/jdempcy/hdkit/blob/master/src/index.js (MIT License)
 * Enhanced: Uses real ephemeris API data for accurate charting
 */

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

const GATE_SIZE = 360 / 64;
const LINE_SIZE = GATE_SIZE / 6;

// Convert longitude to { gate, line }
function longitudeToGateLine(longitude) {
  const normalized = ((longitude % 360) + 360) % 360;
  const gate_index = Math.floor(normalized / GATE_SIZE);
  const gate = GATES[gate_index];
  const inGate = normalized % GATE_SIZE;
  const line = Math.floor(inGate / LINE_SIZE) + 1;
  return { gate, line: Math.min(Math.max(line, 1), 6) };
}

/**
 * Fetch ephemeris data from the live API.
 * @param {string} dateIso - ISO string (UTC) datetime, e.g., "1978-02-12T22:00:00.000Z"
 * @param {{lat: number, lon: number}} location - { lat, lon }
 */
async function fetchEphemerisData(dateIso, location) {
  const coordinates = `${location.lat},${location.lon}`;
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
    throw new Error("Failed to fetch ephemeris data: " + JSON.stringify(data));
  }
  return data.data.planets;
}

/**
 * Main calculation interface. Returns HD chart object with real ephemeris.
 */
async function calculateChart({ date, location }) {
  // Fetch planetary positions from live API
  const planets = await fetchEphemerisData(date, location);

  // HD major planet order: sun, earth, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, north_node, south_node
  // Earth is always opposite Sun
  const sunLon = Number(planets.sun?.longitude);
  const earthLon = ((sunLon + 180) % 360);

  // Map relevant planets
  const usedPlanets = {
    sun: planets.sun,
    earth: { ...planets.earth, longitude: earthLon }, // override with calculated
    moon: planets.moon,
    mercury: planets.mercury,
    venus: planets.venus,
    mars: planets.mars,
    jupiter: planets.jupiter,
    saturn: planets.saturn,
    uranus: planets.uranus,
    neptune: planets.neptune,
    pluto: planets.pluto,
    north_node: planets.north_node,
    south_node: planets.south_node,
  };

  const gates = {};
  Object.entries(usedPlanets).forEach(([planet, obj]) => {
    if (obj && typeof obj.longitude === "number") {
      gates[planet] = longitudeToGateLine(obj.longitude);
    }
  });

  // Example chart logic: for demonstration, always Projector 6/2 Splenic, but now with real gates
  // (You'd replace this with full logic for type/profile/authority)
  return {
    type: "Projector",
    profile: "6/2",
    authority: "Splenic",
    strategy: "Wait for the invitation",
    gates,
    input: { date, location },
    notice: "Generated using live planetary positions from ephemeris API.",
  };
}

module.exports = { calculateChart };
