
// File: api/ephemeris.js

import sweph from 'sweph';
import path from 'path';

// This tells sweph where to find the data files you will upload in Step 5.
// Vercel makes these files available in the `/var/task/ephemeris` directory.
const ephe_path = path.join(process.cwd(), 'ephemeris');
sweph.set_ephe_path(ephe_path);

// This is the main serverless function handler.
export default function handler(req, res) {
  // Set CORS headers to allow your Supabase app to call this API
  res.setHeader('Access-Control-Allow-Origin', '*'); // For development. Be more specific in production.
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight CORS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Method Not Allowed' });
  }

  try {
    const { datetime, coordinates } = req.body;
    const [lat, lon] = coordinates.split(',').map(Number);
    const date = new Date(datetime);

    // 1. Convert input date to Julian Day UT
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = date.getUTCHours() + (date.getUTCMinutes() / 60) + (date.getUTCSeconds() / 3600);

    const julianDayUT = sweph.swe_julday(year, month, day, hour, sweph.SE_GREG_CAL);
    const jd = julianDayUT.jd;

    // 2. Define which celestial bodies you need
    const bodies = {
        sun: sweph.SE_SUN,
        moon: sweph.SE_MOON,
        mercury: sweph.SE_MERCURY,
        venus: sweph.SE_VENUS,
        mars: sweph.SE_MARS,
        jupiter: sweph.SE_JUPITER,
        saturn: sweph.SE_SATURN,
        uranus: sweph.SE_URANUS,
        neptune: sweph.SE_NEPTUNE,
        pluto: sweph.SE_PLUTO,
        north_node: sweph.SE_TRUE_NODE, // This gets you the True North Node
    };

    const flags = sweph.SEFLG_SPEED | sweph.SEFLG_SWIEPH; // Standard flags
    const ephemerisData = {};

    // 3. Calculate the position for each body
    for (const [name, id] of Object.entries(bodies)) {
        const result = sweph.swe_calc_ut(jd, id, flags);
        if (result.error) {
            ephemerisData[name] = { error: result.error };
        } else {
            ephemerisData[name] = {
                longitude: result.longitude,
                latitude: result.latitude,
                speed: result.longitude_speed,
            };
        }
    }

    // Add South Node (always 180 degrees opposite the North Node)
    if (ephemerisData.north_node && !ephemerisData.north_node.error) {
        ephemerisData.south_node = {
            longitude: (ephemerisData.north_node.longitude + 180) % 360,
            latitude: 0,
            speed: ephemerisData.north_node.speed
        };
    }

    // 4. Send the successful JSON response
    res.status(200).json({ success: true, data: ephemerisData });

  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}
