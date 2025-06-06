
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

// Try Western astrology endpoints with proper ayanamsa settings
async function tryWesternAstrologyEndpoints(
  accessToken: string,
  coordinates: string,
  isoDateTime: string
): Promise<any> {
  const endpoints = [
    {
      name: 'planet-position-tropical',
      url: `https://api.prokerala.com/v2/astrology/planet-position?ayanamsa=0&coordinates=${coordinates}&datetime=${encodeURIComponent(isoDateTime)}`
    },
    {
      name: 'western-horoscope',
      url: `https://api.prokerala.com/v2/astrology/western-horoscope?coordinates=${coordinates}&datetime=${encodeURIComponent(isoDateTime)}`
    },
    {
      name: 'planets-tropical',
      url: `https://api.prokerala.com/v2/astrology/planets?ayanamsa=0&coordinates=${coordinates}&datetime=${encodeURIComponent(isoDateTime)}`
    },
    {
      name: 'chart-tropical',
      url: `https://api.prokerala.com/v2/astrology/chart?ayanamsa=0&coordinates=${coordinates}&datetime=${encodeURIComponent(isoDateTime)}&chart_type=rasi&chart_style=north-indian`
    },
    {
      name: 'birth-chart-tropical',
      url: `https://api.prokerala.com/v2/astrology/birth-chart?ayanamsa=0&coordinates=${coordinates}&datetime=${encodeURIComponent(isoDateTime)}`
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
      note: 'Using ayanamsa=0 for Tropical/Western calculations'
    });

    // Try Western astrology endpoints with proper ayanamsa settings
    const endpointResults = await tryWesternAstrologyEndpoints(accessToken, coordinates, isoDateTime);
    
    // Find the best endpoint that has complete planetary data
    let bestResult = null;
    let planetaryData = null;

    for (const result of endpointResults) {
      if (result.status === 'success' && result.data && result.data.data) {
        const data = result.data.data;
        
        // Look for planet_position array (most likely for Western astrology)
        if (data.planet_position && Array.isArray(data.planet_position)) {
          console.log(`🎯 Found planet_position array in ${result.endpoint} endpoint!`);
          console.log(`Planet count: ${data.planet_position.length}`);
          bestResult = result;
          planetaryData = data.planet_position;
          break;
        }
        // Look for planets array
        else if (data.planets && Array.isArray(data.planets)) {
          console.log(`🎯 Found planets array in ${result.endpoint} endpoint!`);
          console.log(`Planet count: ${data.planets.length}`);
          bestResult = result;
          planetaryData = data.planets;
          break;
        }
        // Look for chart.planets
        else if (data.chart && data.chart.planets) {
          console.log(`🎯 Found chart.planets in ${result.endpoint} endpoint!`);
          bestResult = result;
          planetaryData = data.chart.planets;
          break;
        }
      }
    }

    if (!bestResult || !planetaryData) {
      console.log('No Western astrology endpoints returned complete planetary data');
      throw new Error('No Western astrology endpoints returned usable planetary data');
    }

    console.log(`Using ${bestResult.endpoint} endpoint for Western planetary positions`);
    console.log('Raw planetary data:', JSON.stringify(planetaryData, null, 2));
    
    // Transform planetary data from the best endpoint
    const transformedData = {
      sun: extractPlanetFromWesternData(planetaryData, 'Sun'),
      moon: extractPlanetFromWesternData(planetaryData, 'Moon'),
      mercury: extractPlanetFromWesternData(planetaryData, 'Mercury'),
      venus: extractPlanetFromWesternData(planetaryData, 'Venus'),
      mars: extractPlanetFromWesternData(planetaryData, 'Mars'),
      jupiter: extractPlanetFromWesternData(planetaryData, 'Jupiter'),
      saturn: extractPlanetFromWesternData(planetaryData, 'Saturn'),
      uranus: extractPlanetFromWesternData(planetaryData, 'Uranus'),
      neptune: extractPlanetFromWesternData(planetaryData, 'Neptune'),
      pluto: extractPlanetFromWesternData(planetaryData, 'Pluto'),
      north_node: extractPlanetFromWesternData(planetaryData, 'Rahu') || extractPlanetFromWesternData(planetaryData, 'North Node'),
      south_node: extractPlanetFromWesternData(planetaryData, 'Ketu') || extractPlanetFromWesternData(planetaryData, 'South Node'),
      ascendant: extractPlanetFromWesternData(planetaryData, 'Ascendant'),
      houses: extractHousesFromWesternResult(bestResult.data.data),
      ayanamsa: 0, // We specifically requested Tropical (ayanamsa=0)
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

function extractPlanetFromWesternData(planets: any[], planetName: string) {
  if (!planets || !Array.isArray(planets)) return null;
  
  const planet = planets.find((p: any) => 
    p && p.name && (
      p.name.toLowerCase() === planetName.toLowerCase() ||
      p.name.toLowerCase().includes(planetName.toLowerCase()) ||
      (p.planet && p.planet.toLowerCase() === planetName.toLowerCase())
    )
  );
  
  if (planet) {
    console.log(`Found ${planetName}:`, JSON.stringify(planet, null, 2));
    
    return {
      longitude: planet.longitude || planet.degree || 0,
      latitude: planet.latitude || 0,
      speed: planet.speed || planet.daily_motion || 0,
      sign: getWesternSignName(planet.longitude || planet.degree || 0),
      sign_degree: (planet.longitude || planet.degree || 0) % 30,
      house: planet.house ? (planet.house.id || planet.house) : 0,
      is_retrograde: planet.is_retrograde || false,
      raw_planet_data: planet,
    };
  }
  
  console.warn(`Planet "${planetName}" not found in Western astrology response`);
  return null;
}

function getWesternSignName(longitude: number): string {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 
    'Leo', 'Virgo', 'Libra', 'Scorpio', 
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  const signIndex = Math.floor(longitude / 30);
  return signs[signIndex] || 'Unknown';
}

function extractHousesFromWesternResult(data: any) {
  if (data.houses && Array.isArray(data.houses)) {
    return data.houses.map((house: any) => ({
      house_number: house.id || house.number,
      longitude: house.longitude || house.degree,
      sign: getWesternSignName(house.longitude || house.degree || 0),
    }));
  }
  
  if (data.chart && data.chart.houses) {
    return data.chart.houses.map((house: any) => ({
      house_number: house.id || house.number,
      longitude: house.longitude || house.degree,
      sign: getWesternSignName(house.longitude || house.degree || 0),
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
