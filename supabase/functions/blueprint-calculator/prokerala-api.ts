
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProkeralaTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Cache for access tokens to avoid generating new ones for every request
let cachedToken: { token: string; expires: number } | null = null;

export async function getProkeralaAccessToken(): Promise<string> {
  const clientId = Deno.env.get('PROKERALA_CLIENT_ID');
  const clientSecret = Deno.env.get('PROKERALA_CLIENT_SECRET');
  
  if (!clientId || !clientSecret) {
    throw new Error('Missing Prokerala API credentials. Please set PROKERALA_CLIENT_ID and PROKERALA_CLIENT_SECRET.');
  }

  // Check if we have a valid cached token
  if (cachedToken && Date.now() < cachedToken.expires) {
    return cachedToken.token;
  }

  console.log('Generating new Prokerala access token...');
  
  const tokenResponse = await fetch('https://api.prokerala.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    throw new Error(`Failed to get Prokerala access token: ${tokenResponse.status} ${errorText}`);
  }

  const tokenData: ProkeralaTokenResponse = await tokenResponse.json();
  
  // Cache the token (expires in 1 hour, cache for 55 minutes to be safe)
  cachedToken = {
    token: tokenData.access_token,
    expires: Date.now() + (55 * 60 * 1000), // 55 minutes from now
  };

  return tokenData.access_token;
}

export async function calculatePlanetaryPositionsWithProkerala(
  birthDate: string,
  birthTime: string,
  birthLocation: string,
  timezone?: string
): Promise<any> {
  try {
    console.log('Starting Prokerala Western Astrology API call using natal-planet-position endpoint...');
    
    // Get access token
    const accessToken = await getProkeralaAccessToken();
    
    // Parse location - assuming format like "New York, NY, USA" or coordinates "lat,lon"
    let coordinates: string;
    if (birthLocation.includes(',') && birthLocation.split(',').length === 2) {
      // Assume it's already in lat,lon format
      coordinates = birthLocation.trim();
    } else {
      // For now, use a default coordinate. In production, you'd want to geocode the location
      console.warn(`Location "${birthLocation}" needs to be converted to coordinates. Using default NYC coordinates.`);
      coordinates = "40.7128,-74.0060"; // Default to NYC
    }
    
    // Combine date and time into ISO format with timezone
    const dateTimeString = `${birthDate}T${birthTime}`;
    const dateTime = new Date(dateTimeString);
    
    // Format datetime for API - use ISO format with timezone offset
    let isoDateTime: string;
    if (timezone) {
      // For simplicity, using the datetime as-is. In production, you'd want proper timezone handling
      isoDateTime = dateTime.toISOString();
    } else {
      isoDateTime = dateTime.toISOString();
    }
    
    console.log('Calling natal-planet-position endpoint with:', {
      coordinates,
      datetime: isoDateTime,
      ayanamsa: 0, // Critical: 0 = Tropical/Western astrology
      house_system: 'placidus'
    });

    // Build the API URL with proper query parameters
    const apiUrl = new URL('https://api.prokerala.com/v2/astrology/natal-planet-position');
    apiUrl.searchParams.set('profile[datetime]', isoDateTime);
    apiUrl.searchParams.set('profile[coordinates]', coordinates);
    apiUrl.searchParams.set('ayanamsa', '0'); // 0 = Tropical zodiac (Western astrology)
    apiUrl.searchParams.set('house_system', 'placidus'); // Standard house system
    
    console.log('Full API URL:', apiUrl.toString());

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Prokerala API call failed: ${response.status} ${errorText}`);
      throw new Error(`Prokerala natal-planet-position API failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ SUCCESS: natal-planet-position endpoint returned data');
    console.log('Response structure:', JSON.stringify(data, null, 2));
    
    // Extract planetary data from the response
    if (!data.data || !data.data.planet_positions) {
      console.error('Unexpected response structure:', data);
      throw new Error('Invalid response structure from natal-planet-position endpoint');
    }

    const planetPositions = data.data.planet_positions;
    console.log('Planet positions array length:', planetPositions.length);
    
    // Transform the planetary data to our expected format
    const transformedData = {
      sun: extractPlanetData(planetPositions, 'Sun', 0),
      moon: extractPlanetData(planetPositions, 'Moon', 1),
      mercury: extractPlanetData(planetPositions, 'Mercury', 2),
      venus: extractPlanetData(planetPositions, 'Venus', 3),
      mars: extractPlanetData(planetPositions, 'Mars', 4),
      jupiter: extractPlanetData(planetPositions, 'Jupiter', 5),
      saturn: extractPlanetData(planetPositions, 'Saturn', 6),
      uranus: extractPlanetData(planetPositions, 'Uranus', 7),
      neptune: extractPlanetData(planetPositions, 'Neptune', 8),
      pluto: extractPlanetData(planetPositions, 'Pluto', 9),
      north_node: extractPlanetData(planetPositions, 'True North Node', 103),
      south_node: extractPlanetData(planetPositions, 'True South Node', 104),
      ascendant: extractHouseCuspData(data.data.house_cusps, 1), // 1st house cusp = Ascendant
      houses: extractAllHouseCusps(data.data.house_cusps),
      calculation_timestamp: new Date().toISOString(),
      source: 'prokerala_natal_planet_position',
      raw_response: data,
    };

    console.log('Transformed data preview:', {
      sun: transformedData.sun,
      moon: transformedData.moon,
      north_node: transformedData.north_node,
      ascendant: transformedData.ascendant
    });

    return {
      success: true,
      data: transformedData,
      raw_response: data,
    };

  } catch (error) {
    console.error('Error in Prokerala natal-planet-position API call:', error);
    throw error;
  }
}

function extractPlanetData(planetPositions: any[], planetName: string, planetId?: number) {
  console.log(`Looking for planet: ${planetName} (ID: ${planetId})`);
  
  // Find planet by name or ID
  const planet = planetPositions.find(p => {
    const nameMatch = p.name && p.name.toLowerCase().includes(planetName.toLowerCase());
    const idMatch = planetId !== undefined && p.id === planetId;
    return nameMatch || idMatch;
  });
  
  if (!planet) {
    console.warn(`Planet "${planetName}" not found in response`);
    return null;
  }
  
  console.log(`Found ${planetName}:`, planet);
  
  return {
    longitude: planet.longitude || 0,
    latitude: planet.latitude || 0,
    speed: planet.speed || 0,
    sign: convertLongitudeToSign(planet.longitude || 0),
    sign_degree: (planet.longitude || 0) % 30,
    house: planet.house || 0,
    is_retrograde: planet.is_retrograde || false,
    raw_planet_data: planet,
  };
}

function extractHouseCuspData(houseCusps: any[], houseNumber: number) {
  if (!houseCusps) return null;
  
  const cusp = houseCusps.find(h => h.house === houseNumber);
  if (!cusp) return null;
  
  return {
    longitude: cusp.longitude || 0,
    latitude: 0, // House cusps typically don't have latitude
    speed: 0,
    sign: convertLongitudeToSign(cusp.longitude || 0),
    sign_degree: (cusp.longitude || 0) % 30,
    house: houseNumber,
    is_retrograde: false,
    raw_data: cusp,
  };
}

function extractAllHouseCusps(houseCusps: any[]) {
  if (!houseCusps) return [];
  
  return houseCusps.map(cusp => ({
    house_number: cusp.house || 1,
    longitude: cusp.longitude || 0,
    sign: convertLongitudeToSign(cusp.longitude || 0),
    sign_degree: (cusp.longitude || 0) % 30,
  }));
}

function convertLongitudeToSign(longitude: number): string {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  const signIndex = Math.floor((longitude % 360) / 30);
  return signs[signIndex] || 'Unknown';
}

// Test endpoint for direct testing
export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Prokerala natal-planet-position API test endpoint called');
    
    // Use default test data if no body is provided
    let birthDate = "1990-03-21";
    let birthTime = "12:00";
    let birthLocation = "40.7128,-74.0060";
    let timezone = "America/New_York";

    // Try to parse JSON body if it exists and has content
    if (req.method === 'POST') {
      const text = await req.text();
      if (text && text.trim()) {
        try {
          const data = JSON.parse(text);
          birthDate = data.birthDate || birthDate;
          birthTime = data.birthTime || birthTime;
          birthLocation = data.birthLocation || birthLocation;
          timezone = data.timezone || timezone;
        } catch (parseError) {
          console.warn('Could not parse request body, using defaults:', parseError);
        }
      }
    }

    console.log('Testing natal-planet-position with data:', { birthDate, birthTime, birthLocation, timezone });

    const result = await calculatePlanetaryPositionsWithProkerala(
      birthDate,
      birthTime,
      birthLocation,
      timezone
    );

    return new Response(JSON.stringify(result), {
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders 
      }
    });

  } catch (error) {
    console.error("Error in Prokerala natal-planet-position API test:", error);
    
    return new Response(
      JSON.stringify({
        error: "Prokerala natal-planet-position API test failed",
        details: error.message,
        code: "PROKERALA_NATAL_API_ERROR"
      }),
      { 
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
  }
}
