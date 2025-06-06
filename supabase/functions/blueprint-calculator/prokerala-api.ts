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

// Try multiple endpoints to find complete planetary data
async function tryProkeralaEndpoints(
  accessToken: string,
  coordinates: string,
  isoDateTime: string
): Promise<any> {
  const endpoints = [
    {
      name: 'chart',
      url: `https://api.prokerala.com/v2/astrology/chart?ayanamsa=1&coordinates=${coordinates}&datetime=${encodeURIComponent(isoDateTime)}&chart_type=rasi`
    },
    {
      name: 'planet-position',
      url: `https://api.prokerala.com/v2/astrology/planet-position?ayanamsa=1&coordinates=${coordinates}&datetime=${encodeURIComponent(isoDateTime)}`
    },
    {
      name: 'birth-chart',
      url: `https://api.prokerala.com/v2/astrology/birth-chart?ayanamsa=1&coordinates=${coordinates}&datetime=${encodeURIComponent(isoDateTime)}`
    },
    {
      name: 'horoscope',
      url: `https://api.prokerala.com/v2/astrology/horoscope?ayanamsa=1&coordinates=${coordinates}&datetime=${encodeURIComponent(isoDateTime)}`
    },
    {
      name: 'kundli',
      url: `https://api.prokerala.com/v2/astrology/kundli?ayanamsa=1&coordinates=${coordinates}&datetime=${encodeURIComponent(isoDateTime)}`
    }
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      console.log(`Trying endpoint: ${endpoint.name} - ${endpoint.url}`);
      
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
    console.log('Starting Prokerala API exploration...');
    
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
    
    console.log('Testing multiple Prokerala endpoints with:', {
      coordinates,
      datetime: isoDateTime,
    });

    // Try all available endpoints
    const endpointResults = await tryProkeralaEndpoints(accessToken, coordinates, isoDateTime);
    
    // Find the best endpoint that has planetary data
    let bestResult = null;
    let planetaryData = null;

    for (const result of endpointResults) {
      if (result.status === 'success' && result.data && result.data.data) {
        // Check if this endpoint has planetary positions
        const data = result.data.data;
        
        if (data.planets && Array.isArray(data.planets)) {
          console.log(`🎯 Found planetary data in ${result.endpoint} endpoint!`);
          bestResult = result;
          planetaryData = data.planets;
          break;
        } else if (data.planet_positions && Array.isArray(data.planet_positions)) {
          console.log(`🎯 Found planet positions in ${result.endpoint} endpoint!`);
          bestResult = result;
          planetaryData = data.planet_positions;
          break;
        } else if (data.chart && data.chart.planets) {
          console.log(`🎯 Found chart planets in ${result.endpoint} endpoint!`);
          bestResult = result;
          planetaryData = data.chart.planets;
          break;
        }
      }
    }

    if (!bestResult || !planetaryData) {
      console.log('No endpoints returned planetary data, falling back to kundli endpoint for basic info');
      
      // Fallback to kundli for what we can get
      const kundliResult = endpointResults.find(r => r.endpoint === 'kundli' && r.status === 'success');
      if (kundliResult && kundliResult.data) {
        const transformedData = extractDataFromKundli(kundliResult.data.data);
        return {
          success: true,
          data: {
            ...transformedData,
            endpoint_exploration: endpointResults,
            note: "Used fallback kundli endpoint - limited planetary data available"
          },
          raw_response: kundliResult.data,
        };
      }
    } else {
      console.log(`Using ${bestResult.endpoint} endpoint for complete planetary data`);
      
      // Transform planetary data from the best endpoint
      const transformedData = {
        sun: extractPlanetFromArray(planetaryData, 'Sun'),
        moon: extractPlanetFromArray(planetaryData, 'Moon'),
        mercury: extractPlanetFromArray(planetaryData, 'Mercury'),
        venus: extractPlanetFromArray(planetaryData, 'Venus'),
        mars: extractPlanetFromArray(planetaryData, 'Mars'),
        jupiter: extractPlanetFromArray(planetaryData, 'Jupiter'),
        saturn: extractPlanetFromArray(planetaryData, 'Saturn'),
        uranus: extractPlanetFromArray(planetaryData, 'Uranus'),
        neptune: extractPlanetFromArray(planetaryData, 'Neptune'),
        pluto: extractPlanetFromArray(planetaryData, 'Pluto'),
        north_node: extractPlanetFromArray(planetaryData, 'Rahu') || extractPlanetFromArray(planetaryData, 'North Node'),
        south_node: extractPlanetFromArray(planetaryData, 'Ketu') || extractPlanetFromArray(planetaryData, 'South Node'),
        houses: extractHousesFromBestResult(bestResult.data.data),
        ayanamsa: bestResult.data.data.ayanamsa || null,
        calculation_timestamp: new Date().toISOString(),
        source: `prokerala_api_${bestResult.endpoint}`,
        raw_response: bestResult.data,
        endpoint_exploration: endpointResults,
      };

      return {
        success: true,
        data: transformedData,
        raw_response: bestResult.data,
      };
    }

    // If we get here, no endpoints worked
    throw new Error('No Prokerala endpoints returned usable data');

  } catch (error) {
    console.error('Error in Prokerala exploration:', error);
    throw error;
  }
}

function extractPlanetFromArray(planets: any[], planetName: string) {
  if (!planets || !Array.isArray(planets)) return null;
  
  const planet = planets.find((p: any) => 
    p && p.name && (
      p.name.toLowerCase() === planetName.toLowerCase() ||
      p.name.toLowerCase().includes(planetName.toLowerCase()) ||
      (p.planet && p.planet.toLowerCase() === planetName.toLowerCase())
    )
  );
  
  if (planet) {
    return {
      longitude: planet.longitude || planet.degree || 0,
      latitude: planet.latitude || 0,
      speed: planet.speed || planet.daily_motion || 0,
      sign: planet.sign ? (planet.sign.name || planet.sign) : planet.rasi?.name || 'Unknown',
      house: planet.house ? (planet.house.id || planet.house) : 0,
      raw_planet_data: planet,
    };
  }
  
  return null;
}

function extractHousesFromBestResult(data: any) {
  if (data.houses && Array.isArray(data.houses)) {
    return data.houses.map((house: any) => ({
      house_number: house.id || house.number,
      longitude: house.longitude || house.degree,
      sign: house.sign ? (house.sign.name || house.sign) : 'Unknown',
    }));
  }
  
  if (data.chart && data.chart.houses) {
    return data.chart.houses.map((house: any) => ({
      house_number: house.id || house.number,
      longitude: house.longitude || house.degree,
      sign: house.sign ? (house.sign.name || house.sign) : 'Unknown',
    }));
  }
  
  return [];
}

function extractDataFromKundli(data: any) {
  return {
    sun: extractPlanetFromKundli(data, 'Sun'),
    moon: extractPlanetFromKundli(data, 'Moon'),
    mercury: extractPlanetFromKundli(data, 'Mercury'),
    venus: extractPlanetFromKundli(data, 'Venus'),
    mars: extractPlanetFromKundli(data, 'Mars'),
    jupiter: extractPlanetFromKundli(data, 'Jupiter'),
    saturn: extractPlanetFromKundli(data, 'Saturn'),
    uranus: null,
    neptune: null,
    pluto: null,
    north_node: extractPlanetFromKundli(data, 'Rahu'),
    south_node: extractPlanetFromKundli(data, 'Ketu'),
    houses: extractHousesFromKundli(data),
    ayanamsa: data.ayanamsa || null,
    calculation_timestamp: new Date().toISOString(),
    source: 'prokerala_api_kundli_fallback',
  };
}

function extractPlanetFromKundli(data: any, planetName: string) {
  // Try to extract planetary information from kundli data structure
  // The exact structure will depend on what the API returns
  
  // Check if there are planets array
  if (data.planets && Array.isArray(data.planets)) {
    const planet = data.planets.find((p: any) => 
      p && p.name && (
        p.name.toLowerCase() === planetName.toLowerCase() ||
        p.name.toLowerCase().includes(planetName.toLowerCase())
      )
    );
    
    if (planet) {
      return {
        longitude: planet.longitude || 0,
        latitude: planet.latitude || 0,
        speed: planet.speed || 0,
        sign: planet.sign ? planet.sign.name : 'Unknown',
        house: planet.house ? planet.house.id : 0,
        raw_planet_data: planet,
      };
    }
  }
  
  // Check if there's nakshatra_details and relevant info
  if (data.nakshatra_details) {
    const nakshatra = data.nakshatra_details;
    
    // For Moon-related calculations from nakshatra
    if (planetName.toLowerCase() === 'moon' && nakshatra.chandra_rasi) {
      return {
        longitude: 0, // We don't have exact longitude
        latitude: 0,
        speed: 0,
        sign: nakshatra.chandra_rasi.name || 'Unknown',
        house: 0,
        raw_planet_data: nakshatra.chandra_rasi,
      };
    }
    
    // For Sun-related calculations from nakshatra
    if (planetName.toLowerCase() === 'sun' && nakshatra.soorya_rasi) {
      return {
        longitude: 0, // We don't have exact longitude
        latitude: 0,
        speed: 0,
        sign: nakshatra.soorya_rasi.name || 'Unknown',
        house: 0,
        raw_planet_data: nakshatra.soorya_rasi,
      };
    }
  }
  
  console.warn(`Planet "${planetName}" not found in Prokerala kundli response`);
  return null;
}

function extractHousesFromKundli(data: any) {
  // Try to extract house information from kundli data
  if (data.houses && Array.isArray(data.houses)) {
    return data.houses.map((house: any) => ({
      house_number: house.id,
      longitude: house.longitude,
      sign: house.sign ? house.sign.name : 'Unknown',
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
    console.log('Prokerala API exploration endpoint called');
    
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

    console.log('Exploring Prokerala endpoints with data:', { birthDate, birthTime, birthLocation, timezone });

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
    console.error("Error in Prokerala API exploration:", error);
    
    return new Response(
      JSON.stringify({
        error: "Prokerala API exploration failed",
        details: error.message,
        code: "PROKERALA_API_ERROR"
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
