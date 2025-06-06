
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

// Try comprehensive Western astrology endpoints based on the API documentation
async function tryWesternAstrologyEndpoints(
  accessToken: string,
  coordinates: string,
  isoDateTime: string
): Promise<any> {
  const endpoints = [
    {
      name: 'daily-horoscope-advanced',
      url: `https://api.prokerala.com/v2/astrology/daily-horoscope-advanced?coordinates=${coordinates}&datetime=${encodeURIComponent(isoDateTime)}`
    },
    {
      name: 'daily-prediction',
      url: `https://api.prokerala.com/v2/astrology/daily-prediction?coordinates=${coordinates}&datetime=${encodeURIComponent(isoDateTime)}`
    },
    {
      name: 'western-chart',
      url: `https://api.prokerala.com/v2/astrology/western-chart?coordinates=${coordinates}&datetime=${encodeURIComponent(isoDateTime)}`
    },
    {
      name: 'planet-positions',
      url: `https://api.prokerala.com/v2/astrology/planet-positions?coordinates=${coordinates}&datetime=${encodeURIComponent(isoDateTime)}`
    },
    {
      name: 'birth-chart-western',
      url: `https://api.prokerala.com/v2/astrology/birth-chart-western?coordinates=${coordinates}&datetime=${encodeURIComponent(isoDateTime)}`
    },
    {
      name: 'horoscope',
      url: `https://api.prokerala.com/v2/astrology/horoscope?coordinates=${coordinates}&datetime=${encodeURIComponent(isoDateTime)}`
    }
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      console.log(`Trying Western endpoint: ${endpoint.name} - ${endpoint.url}`);
      
      const response = await fetch(endpoint.url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ SUCCESS: ${endpoint.name} endpoint returned data`);
        console.log(`${endpoint.name} response structure:`, JSON.stringify(data, null, 2));
        
        results.push({
          endpoint: endpoint.name,
          url: endpoint.url,
          status: 'success',
          data: data
        });
      } else {
        const errorText = await response.text();
        console.log(`❌ FAILED: ${endpoint.name} endpoint failed: ${response.status} ${errorText}`);
        
        results.push({
          endpoint: endpoint.name,
          url: endpoint.url,
          status: 'failed',
          error: `${response.status} ${errorText}`
        });
      }
    } catch (error) {
      console.log(`❌ ERROR: ${endpoint.name} endpoint error:`, error.message);
      
      results.push({
        endpoint: endpoint.name,
        url: endpoint.url,
        status: 'error',
        error: error.message
      });
    }
  }

  return results;
}

export async function calculatePlanetaryPositionsWithProkerala(
  birthDate: string,
  birthTime: string,
  birthLocation: string,
  timezone?: string
): Promise<any> {
  try {
    console.log('Starting Prokerala Western Astrology API exploration...');
    
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
    
    // Apply timezone offset if provided
    let isoDateTime: string;
    if (timezone) {
      // For simplicity, using the datetime as-is. In production, you'd want proper timezone handling
      isoDateTime = dateTime.toISOString();
    } else {
      isoDateTime = dateTime.toISOString();
    }
    
    console.log('Testing Western astrology endpoints with:', {
      coordinates,
      datetime: isoDateTime,
      note: 'Exploring comprehensive Western astrology endpoints'
    });

    // Try Western astrology endpoints
    const endpointResults = await tryWesternAstrologyEndpoints(accessToken, coordinates, isoDateTime);
    
    // Find any successful endpoint with usable data
    let bestResult = null;
    let planetaryData = null;

    for (const result of endpointResults) {
      if (result.status === 'success' && result.data && result.data.data) {
        console.log(`🎯 Found successful endpoint: ${result.endpoint}`);
        bestResult = result;
        planetaryData = result.data.data;
        break;
      }
    }

    if (!bestResult || !planetaryData) {
      console.log('No Western astrology endpoints returned usable data');
      
      // Try a fallback approach using any successful response
      const anySuccessfulResult = endpointResults.find(r => r.status === 'success');
      if (anySuccessfulResult) {
        console.log(`Using fallback endpoint: ${anySuccessfulResult.endpoint}`);
        bestResult = anySuccessfulResult;
        planetaryData = anySuccessfulResult.data;
      } else {
        throw new Error('No Western astrology endpoints returned any usable data');
      }
    }

    console.log(`Using ${bestResult.endpoint} endpoint for Western planetary data`);
    console.log('Available data structure:', Object.keys(planetaryData));
    
    // Extract what we can from the response
    const transformedData = {
      sun: extractBasicPlanetaryInfo(planetaryData, 'sun'),
      moon: extractBasicPlanetaryInfo(planetaryData, 'moon'),
      mercury: extractBasicPlanetaryInfo(planetaryData, 'mercury'),
      venus: extractBasicPlanetaryInfo(planetaryData, 'venus'),
      mars: extractBasicPlanetaryInfo(planetaryData, 'mars'),
      jupiter: extractBasicPlanetaryInfo(planetaryData, 'jupiter'),
      saturn: extractBasicPlanetaryInfo(planetaryData, 'saturn'),
      uranus: extractBasicPlanetaryInfo(planetaryData, 'uranus'),
      neptune: extractBasicPlanetaryInfo(planetaryData, 'neptune'),
      pluto: extractBasicPlanetaryInfo(planetaryData, 'pluto'),
      north_node: extractBasicPlanetaryInfo(planetaryData, 'north_node'),
      south_node: extractBasicPlanetaryInfo(planetaryData, 'south_node'),
      ascendant: extractBasicPlanetaryInfo(planetaryData, 'ascendant'),
      houses: extractHousesFromResponse(planetaryData),
      calculation_timestamp: new Date().toISOString(),
      source: `prokerala_western_${bestResult.endpoint}`,
      raw_response: bestResult.data,
      endpoint_exploration: endpointResults,
    };

    return {
      success: true,
      data: transformedData,
      raw_response: bestResult.data,
    };

  } catch (error) {
    console.error('Error in Prokerala Western astrology exploration:', error);
    throw error;
  }
}

function extractBasicPlanetaryInfo(data: any, planetName: string) {
  console.log(`Looking for ${planetName} in data structure...`);
  
  // Try different possible locations in the response
  const searchPaths = [
    data[planetName],
    data.planets?.[planetName],
    data.daily_predictions?.[0]?.[planetName],
    data.signs?.[planetName],
    data.chart?.[planetName],
    data.positions?.[planetName]
  ];
  
  for (const planetData of searchPaths) {
    if (planetData) {
      console.log(`Found ${planetName} data:`, planetData);
      return {
        longitude: planetData.longitude || planetData.degree || 0,
        latitude: planetData.latitude || 0,
        speed: planetData.speed || planetData.daily_motion || 0,
        sign: planetData.sign?.name || planetData.zodiac?.name || 'Unknown',
        sign_degree: planetData.sign_degree || ((planetData.longitude || 0) % 30),
        house: planetData.house || 0,
        is_retrograde: planetData.is_retrograde || false,
        raw_planet_data: planetData,
      };
    }
  }
  
  console.warn(`Planet "${planetName}" not found in response`);
  return null;
}

function extractHousesFromResponse(data: any) {
  if (data.houses && Array.isArray(data.houses)) {
    return data.houses.map((house: any) => ({
      house_number: house.id || house.number || 1,
      longitude: house.longitude || house.degree || 0,
      sign: house.sign?.name || 'Unknown',
    }));
  }
  
  if (data.chart?.houses) {
    return Object.entries(data.chart.houses).map(([key, house]: [string, any]) => ({
      house_number: parseInt(key) || 1,
      longitude: house.longitude || house.degree || 0,
      sign: house.sign?.name || 'Unknown',
    }));
  }
  
  return [];
}

// Test endpoint for direct testing
export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Prokerala Western Astrology API exploration endpoint called');
    
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

    console.log('Exploring Western astrology endpoints with data:', { birthDate, birthTime, birthLocation, timezone });

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
    console.error("Error in Prokerala Western Astrology API exploration:", error);
    
    return new Response(
      JSON.stringify({
        error: "Prokerala Western Astrology API exploration failed",
        details: error.message,
        code: "PROKERALA_WESTERN_API_ERROR"
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
