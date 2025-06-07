
// File: api/ephemeris.js

import Astronomy from 'astronomy-engine';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Calculate planetary positions using Astronomy Engine
function calculatePlanetaryPositions(datetime, coordinates) {
  const [lat, lon] = coordinates.split(',').map(Number);
  
  if (isNaN(lat) || isNaN(lon)) {
    throw new Error('Invalid coordinates format. Expected "lat,lon"');
  }

  const date = new Date(datetime);
  
  if (isNaN(date.getTime())) {
    throw new Error('Invalid datetime format');
  }

  console.log(`Calculating positions for ${datetime} at coordinates ${lat}, ${lon}`);

  // Create observer location
  const observer = new Astronomy.Observer(lat, lon, 0);

  // Calculate positions for major celestial bodies
  const bodies = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  const ephemerisData = {};

  bodies.forEach(bodyName => {
    try {
      const equatorial = Astronomy.Equator(bodyName, date, observer, true, true);
      const ecliptic = Astronomy.Ecliptic(equatorial);
      
      ephemerisData[bodyName.toLowerCase()] = {
        longitude: ecliptic.elon,
        latitude: ecliptic.elat,
        distance: equatorial.dist,
        speed: 0, // Astronomy Engine doesn't directly provide speed, would need to calculate
        right_ascension: equatorial.ra,
        declination: equatorial.dec
      };
      
      console.log(`${bodyName}: longitude ${ecliptic.elon.toFixed(6)}°, latitude ${ecliptic.elat.toFixed(6)}°`);
    } catch (error) {
      console.warn(`Error calculating position for ${bodyName}:`, error.message);
      ephemerisData[bodyName.toLowerCase()] = { error: error.message };
    }
  });

  return ephemerisData;
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

    console.log(`Processing request for datetime: ${datetime}, coordinates: ${coordinates}`);
    
    // Calculate ephemeris data using Astronomy Engine
    const ephemerisData = calculatePlanetaryPositions(datetime, coordinates);

    console.log('Ephemeris calculation completed successfully');

    // Send the successful JSON response
    res.status(200).json({ 
      success: true, 
      data: ephemerisData,
      metadata: {
        calculated_at: new Date().toISOString(),
        coordinates: coordinates,
        engine: 'astronomy-engine',
        debug_info: {
          engine_version: 'astronomy-engine v2.x',
          runtime: 'vercel-serverless',
          bodies_calculated: Object.keys(ephemerisData)
        }
      }
    });

  } catch (error) {
    console.error('Ephemeris calculation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error during ephemeris calculation',
      engine: 'astronomy-engine'
    });
  }
}
