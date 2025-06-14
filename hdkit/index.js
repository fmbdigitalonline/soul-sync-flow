
/**
 * Minimal hdkit port: calculateChart
 * Source: https://github.com/jdempcy/hdkit/blob/master/src/index.js (MIT License)
 */

const GATES = [
  // 41, 19, ... full gate order (total: 64)
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
  27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
];

// Each gate is 360/64 = 5.625 deg. Each line is 5.625 / 6
const GATE_SIZE = 360 / 64;
const LINE_SIZE = GATE_SIZE / 6;

/**
 * Returns { gate, line } from ecliptic longitude
 */
function longitudeToGateLine(longitude) {
  const normalized = ((longitude % 360) + 360) % 360;
  const gate_index = Math.floor(normalized / GATE_SIZE);
  const gate = GATES[gate_index];
  // Compute the line (1-6)
  const inGate = normalized % GATE_SIZE;
  const line = Math.floor(inGate / LINE_SIZE) + 1;
  return { gate, line: Math.min(Math.max(line, 1), 6) };
}

/**
 * Dummy planet positions (mock). **Replace with real ephemeris data in production.**
 */
function getPlanetPositions({ date, location }) {
  // TODO: Use Swiss Ephemeris or another service/API to get planetary longitudes!
  // Here we return canned values for demonstration.
  // Sun at 320°, Moon at 74°, etc.
  return {
    sun: { longitude: 320 },
    earth: { longitude: (320 + 180) % 360 },
    moon: { longitude: 74 },
    mercury: { longitude: 301.2 },
    venus: { longitude: 49 },
    mars: { longitude: 196 },
    jupiter: { longitude: 240.5 },
    saturn: { longitude: 123.7 },
    uranus: { longitude: 295.1 },
    neptune: { longitude: 143.3 },
    pluto: { longitude: 152.8 },
    north_node: { longitude: 298.1 },
    south_node: { longitude: 118.1 }
  };
}

/**
 * Main calculation interface. Returns HD chart object.
 */
async function calculateChart({ date, location }) {
  // 1. Get planet positions (replace with real ephemeris for production)
  const planets = getPlanetPositions({ date, location });

  // 2. Map planets to HD gates
  const gates = {};
  Object.entries(planets).forEach(([planet, { longitude }]) => {
    gates[planet] = longitudeToGateLine(longitude);
  });

  // 3. Simple (stub) chart type logic
  return {
    type: "Projector",
    profile: "6/2",
    authority: "Splenic",
    strategy: "Wait for the invitation",
    gates,
    input: { date, location },
    notice: "This is a stub; planetary logic must be replaced with real ephemeris results."
  };
}

module.exports = { calculateChart };

