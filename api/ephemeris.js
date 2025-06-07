
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

// Cache for initialized sweph module
let swephModule = null;
let isInitialized = false;

// Initialize Swiss Ephemeris once
async function initializeSweph() {
  if (isInitialized && swephModule) {
    return swephModule;
  }

  try {
    console.log('Initializing Swiss Ephemeris...');
    swephModule = require('sweph');
    
    if (!swephModule || typeof swephModule.swe_set_ephe_path !== 'function') {
      throw new Error('Swiss Ephemeris module not properly loaded');
    }

    // CRITICAL: Initialize Swiss Ephemeris before any calculations
    // This is required even when using built-in Moshier ephemeris
    console.log('Setting ephemeris path for initialization...');
    swephModule.swe_set_ephe_path(null); // Use built-in Moshier ephemeris
    
    // Verify that core functions are available after initialization
    if (typeof swephModule.swe_julday !== 'function') {
      throw new Error('swe_julday function not available after initialization');
    }
    if (typeof swephModule.swe_calc_ut !== 'function') {
      throw new Error('swe_calc_ut function not available after initialization');
    }

    isInitialized = true;
    console.log('Swiss Ephemeris initialized successfully!');
    return swephModule;
  } catch (error) {
    console.error('Failed to initialize Swiss Ephemeris:', error);
    swephModule = null;
    isInitialized = false;
    throw error;
  }
}

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

    // Initialize Swiss Ephemeris
    const sweph = await initializeSweph();

    // Convert input date to Julian Day UT
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = date.getUTCHours() + (date.getUTCMinutes() / 60) + (date.getUTCSeconds() / 3600);

    console.log(`Calculating Julian Day for: ${year}-${month}-${day} ${hour}:00 UTC`);
    const jd = sweph.swe_julday(year, month, day, hour, sweph.SE_GREG_CAL);
    console.log(`Julian Day calculated: ${jd}`);

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
            console.log(`Calculating position for ${name} (ID: ${id})`);
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
                console.log(`${name}: longitude ${result.longitude.toFixed(6)}°`);
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

    console.log('Ephemeris calculation completed successfully');

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
