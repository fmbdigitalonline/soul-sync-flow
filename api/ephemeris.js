
// File: api/ephemeris.js

import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// This is the main serverless function handler.
export default async function handler(req, res) {
  // Set CORS headers to allow your Supabase app to call this API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight CORS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { datetime, coordinates } = req.body;
    
    if (!datetime || !coordinates) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: datetime and coordinates' 
      });
    }

    const [lat, lon] = coordinates.split(',').map(Number);
    
    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid coordinates format. Expected "lat,lon"' 
      });
    }

    const date = new Date(datetime);
    
    if (isNaN(date.getTime())) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid datetime format' 
      });
    }

    // Try to import sweph dynamically
    let sweph;
    try {
      sweph = require('sweph');
    } catch (importError) {
      console.error('Failed to import sweph:', importError);
      return res.status(500).json({ 
        success: false, 
        error: 'Swiss Ephemeris library not available. Please ensure sweph is installed.' 
      });
    }

    // Check if sweph is properly initialized
    if (!sweph || typeof sweph.swe_julday !== 'function') {
      console.error('sweph module loaded but functions not available:', Object.keys(sweph || {}));
      return res.status(500).json({ 
        success: false, 
        error: 'Swiss Ephemeris library not properly initialized' 
      });
    }

    // Set ephemeris path if needed
    try {
      const ephe_path = path.join(process.cwd(), 'ephemeris');
      if (typeof sweph.set_ephe_path === 'function') {
        sweph.set_ephe_path(ephe_path);
      }
    } catch (pathError) {
      console.warn('Could not set ephemeris path:', pathError);
    }

    // Convert input date to Julian Day UT
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = date.getUTCHours() + (date.getUTCMinutes() / 60) + (date.getUTCSeconds() / 3600);

    const julianDayResult = sweph.swe_julday(year, month, day, hour, sweph.SE_GREG_CAL);
    const jd = julianDayResult.jd || julianDayResult; // Handle different return formats

    // Define which celestial bodies to calculate
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
        north_node: sweph.SE_TRUE_NODE,
    };

    const flags = sweph.SEFLG_SPEED | sweph.SEFLG_SWIEPH;
    const ephemerisData = {};

    // Calculate the position for each body
    for (const [name, id] of Object.entries(bodies)) {
        try {
            const result = sweph.swe_calc_ut(jd, id, flags);
            if (result.error) {
                console.warn(`Error calculating ${name}:`, result.error);
                ephemerisData[name] = { error: result.error };
            } else {
                ephemerisData[name] = {
                    longitude: result.longitude,
                    latitude: result.latitude,
                    speed: result.longitude_speed,
                };
            }
        } catch (calcError) {
            console.warn(`Exception calculating ${name}:`, calcError);
            ephemerisData[name] = { error: calcError.message };
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

    // Send the successful JSON response
    res.status(200).json({ 
      success: true, 
      data: ephemerisData,
      metadata: {
        julian_day: jd,
        calculated_at: new Date().toISOString(),
        coordinates: { latitude: lat, longitude: lon }
      }
    });

  } catch (error) {
    console.error('Ephemeris calculation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error during ephemeris calculation'
    });
  }
}
