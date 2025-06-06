
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
    console.log('Starting Prokerala Ephemeris API call...');
    
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
    
    // Combine date and time into ISO format
    const dateTimeString = `${birthDate}T${birthTime}`;
    const dateTime = new Date(dateTimeString);
    const isoDateTime = dateTime.toISOString();
    
    console.log('Calling ephemeris endpoint with:', {
      coordinates,
      datetime: isoDateTime,
      ayanamsa: 0, // Critical: 0 = Tropical/Western astrology
    });

    // Build the API URL for ephemeris endpoint
    const apiUrl = new URL('https://api.prokerala.com/v2/astrology/ephemeris');
    apiUrl.searchParams.set('datetime', isoDateTime);
    apiUrl.searchParams.set('coordinates', coordinates);
    apiUrl.searchParams.set('ayanamsa', '0'); // 0 = Tropical zodiac (Western astrology)
    
    console.log('Full ephemeris API URL:', apiUrl.toString());

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Prokerala ephemeris API call failed: ${response.status} ${errorText}`);
      throw new Error(`Prokerala ephemeris API failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ SUCCESS: Ephemeris endpoint returned data');
    console.log('Response structure:', JSON.stringify(data, null, 2));
    
    // Extract ephemeris data from the response
    if (!data.data || !Array.isArray(data.data)) {
      console.error('Unexpected ephemeris response structure:', data);
      throw new Error('Invalid response structure from ephemeris endpoint');
    }

    const ephemerisData = data.data;
    console.log('Ephemeris data array length:', ephemerisData.length);
    
    // Transform the ephemeris data to our expected format
    const transformedData = {
      sun: extractEphemerisData(ephemerisData, 'Sun', 0),
      moon: extractEphemerisData(ephemerisData, 'Moon', 1),
      mercury: extractEphemerisData(ephemerisData, 'Mercury', 2),
      venus: extractEphemerisData(ephemerisData, 'Venus', 3),
      mars: extractEphemerisData(ephemerisData, 'Mars', 4),
      jupiter: extractEphemerisData(ephemerisData, 'Jupiter', 5),
      saturn: extractEphemerisData(ephemerisData, 'Saturn', 6),
      uranus: extractEphemerisData(ephemerisData, 'Uranus', 7),
      neptune: extractEphemerisData(ephemerisData, 'Neptune', 8),
      pluto: extractEphemerisData(ephemerisData, 'Pluto', 9),
      north_node: extractEphemerisData(ephemerisData, 'True North Node', 103),
      south_node: extractEphemerisData(ephemerisData, 'True South Node', 104),
      calculation_timestamp: new Date().toISOString(),
      source: 'prokerala_ephemeris',
      raw_response: data,
    };

    console.log('Transformed ephemeris data preview:', {
      sun: transformedData.sun,
      moon: transformedData.moon,
      north_node: transformedData.north_node
    });

    return {
      success: true,
      data: transformedData,
      raw_response: data,
    };

  } catch (error) {
    console.error('Error in Prokerala ephemeris API call:', error);
    throw error;
  }
}

function extractEphemerisData(ephemerisArray: any[], planetName: string, planetId?: number) {
  console.log(`Looking for planet: ${planetName} (ID: ${planetId})`);
  
  // Find planet by name or ID
  const planet = ephemerisArray.find(p => {
    const nameMatch = p.name && p.name.toLowerCase().includes(planetName.toLowerCase());
    const idMatch = planetId !== undefined && p.id === planetId;
    return nameMatch || idMatch;
  });
  
  if (!planet) {
    console.warn(`Planet "${planetName}" not found in ephemeris data`);
    return null;
  }
  
  console.log(`Found ${planetName}:`, planet);
  
  return {
    longitude: planet.longitude || 0,
    latitude: planet.latitude || 0, // This should now be available from ephemeris!
    speed: planet.speed || 0,
    distance: planet.distance || 0,
    sign: convertLongitudeToSign(planet.longitude || 0),
    sign_degree: (planet.longitude || 0) % 30,
    is_retrograde: planet.is_retrograde || false,
    raw_ephemeris_data: planet,
  };
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
    console.log('Prokerala ephemeris API test endpoint called');
    
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

    console.log('Testing ephemeris with data:', { birthDate, birthTime, birthLocation, timezone });

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
    console.error("Error in Prokerala ephemeris API test:", error);
    
    return new Response(
      JSON.stringify({
        error: "Prokerala ephemeris API test failed",
        details: error.message,
        code: "PROKERALA_EPHEMERIS_API_ERROR"
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
