
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
    console.log('Starting Prokerala API calculation...');
    
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
    
    console.log('Making request to Prokerala Kundli API with:', {
      coordinates,
      datetime: isoDateTime,
    });

    // Use the kundli endpoint instead of planets (which doesn't exist)
    // Based on the API documentation pattern
    const kundliResponse = await fetch(
      `https://api.prokerala.com/v2/astrology/kundli?ayanamsa=1&coordinates=${coordinates}&datetime=${encodeURIComponent(isoDateTime)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!kundliResponse.ok) {
      const errorText = await kundliResponse.text();
      console.error(`Prokerala Kundli API request failed: ${kundliResponse.status} ${errorText}`);
      throw new Error(`Prokerala Kundli API request failed: ${kundliResponse.status} ${errorText}`);
    }

    const kundliData: any = await kundliResponse.json();
    
    console.log('Successfully received Prokerala kundli data');
    console.log('Raw Kundli API response structure:', JSON.stringify(kundliData, null, 2));
    
    // Check if the response has the expected structure
    if (!kundliData || !kundliData.data) {
      throw new Error('Invalid Kundli API response structure: missing data property');
    }
    
    // Try to extract planetary information from the kundli response
    // The structure might be different, so we'll adapt based on what we receive
    const transformedData = {
      sun: extractPlanetFromKundli(kundliData.data, 'Sun'),
      moon: extractPlanetFromKundli(kundliData.data, 'Moon'),
      mercury: extractPlanetFromKundli(kundliData.data, 'Mercury'),
      venus: extractPlanetFromKundli(kundliData.data, 'Venus'),
      mars: extractPlanetFromKundli(kundliData.data, 'Mars'),
      jupiter: extractPlanetFromKundli(kundliData.data, 'Jupiter'),
      saturn: extractPlanetFromKundli(kundliData.data, 'Saturn'),
      uranus: null, // Vedic astrology typically doesn't include outer planets
      neptune: null,
      pluto: null,
      north_node: extractPlanetFromKundli(kundliData.data, 'Rahu'),
      south_node: extractPlanetFromKundli(kundliData.data, 'Ketu'),
      houses: extractHousesFromKundli(kundliData.data),
      ayanamsa: kundliData.data.ayanamsa || null,
      calculation_timestamp: new Date().toISOString(),
      source: 'prokerala_api_kundli',
      raw_response: kundliData,
    };

    return {
      success: true,
      data: transformedData,
      raw_response: kundliData,
    };

  } catch (error) {
    console.error('Error in Prokerala calculation:', error);
    throw error;
  }
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
    console.log('Prokerala API test endpoint called');
    
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

    console.log('Testing with data:', { birthDate, birthTime, birthLocation, timezone });

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
    console.error("Error in Prokerala API test:", error);
    
    return new Response(
      JSON.stringify({
        error: "Prokerala API test failed",
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
