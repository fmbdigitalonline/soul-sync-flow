
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

interface ProkeralaPlanetaryResponse {
  data: {
    planets: Array<{
      id: number;
      name: string;
      longitude: number;
      latitude: number;
      speed: number;
      sign: {
        id: number;
        name: string;
        longitude: number;
      };
      house: {
        id: number;
        name: string;
      };
    }>;
    houses: Array<{
      id: number;
      longitude: number;
      sign: {
        id: number;
        name: string;
      };
    }>;
    ayanamsa: {
      id: number;
      name: string;
      value: number;
    };
  };
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
      // This is a placeholder - you might want to integrate with a geocoding service
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
    
    console.log('Making request to Prokerala Planets API with:', {
      coordinates,
      datetime: isoDateTime,
    });

    // Make the API request to get planetary positions
    // Using the planets endpoint instead of kundli
    const planetsResponse = await fetch(
      `https://api.prokerala.com/v2/astrology/planets?ayanamsa=1&coordinates=${coordinates}&datetime=${encodeURIComponent(isoDateTime)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!planetsResponse.ok) {
      const errorText = await planetsResponse.text();
      console.error(`Prokerala Planets API request failed: ${planetsResponse.status} ${errorText}`);
      throw new Error(`Prokerala Planets API request failed: ${planetsResponse.status} ${errorText}`);
    }

    const planetsData: any = await planetsResponse.json();
    
    console.log('Successfully received Prokerala planets data');
    console.log('Raw Planets API response structure:', JSON.stringify(planetsData, null, 2));
    
    // Check if the response has the expected structure
    if (!planetsData || !planetsData.data) {
      throw new Error('Invalid Planets API response structure: missing data property');
    }
    
    if (!planetsData.data.planets || !Array.isArray(planetsData.data.planets)) {
      console.log('No planets array found, trying alternative structure...');
      
      // If planets endpoint doesn't work, try to extract what we can from available data
      if (planetsData.data && typeof planetsData.data === 'object') {
        // Create a fallback response with whatever planetary data we can extract
        const transformedData = {
          sun: extractPlanetFromAnyData(planetsData.data, 'Sun'),
          moon: extractPlanetFromAnyData(planetsData.data, 'Moon'),
          mercury: extractPlanetFromAnyData(planetsData.data, 'Mercury'),
          venus: extractPlanetFromAnyData(planetsData.data, 'Venus'),
          mars: extractPlanetFromAnyData(planetsData.data, 'Mars'),
          jupiter: extractPlanetFromAnyData(planetsData.data, 'Jupiter'),
          saturn: extractPlanetFromAnyData(planetsData.data, 'Saturn'),
          uranus: null, // Vedic astrology typically doesn't include outer planets
          neptune: null,
          pluto: null,
          north_node: extractPlanetFromAnyData(planetsData.data, 'Rahu'),
          south_node: extractPlanetFromAnyData(planetsData.data, 'Ketu'),
          houses: [],
          ayanamsa: planetsData.data.ayanamsa || null,
          calculation_timestamp: new Date().toISOString(),
          source: 'prokerala_api_fallback',
          raw_response: planetsData,
        };

        return {
          success: true,
          data: transformedData,
          raw_response: planetsData,
          isPartial: true,
        };
      }
      
      throw new Error('Invalid Planets API response structure: missing or invalid planets array');
    }
    
    // Transform the Prokerala response to match our expected format
    const transformedData = {
      sun: findPlanetData(planetsData.data.planets, 'Sun'),
      moon: findPlanetData(planetsData.data.planets, 'Moon'),
      mercury: findPlanetData(planetsData.data.planets, 'Mercury'),
      venus: findPlanetData(planetsData.data.planets, 'Venus'),
      mars: findPlanetData(planetsData.data.planets, 'Mars'),
      jupiter: findPlanetData(planetsData.data.planets, 'Jupiter'),
      saturn: findPlanetData(planetsData.data.planets, 'Saturn'),
      uranus: findPlanetData(planetsData.data.planets, 'Uranus'),
      neptune: findPlanetData(planetsData.data.planets, 'Neptune'),
      pluto: findPlanetData(planetsData.data.planets, 'Pluto'),
      north_node: findPlanetData(planetsData.data.planets, 'Rahu') || findPlanetData(planetsData.data.planets, 'North Node'),
      south_node: findPlanetData(planetsData.data.planets, 'Ketu') || findPlanetData(planetsData.data.planets, 'South Node'),
      houses: planetsData.data.houses ? planetsData.data.houses.map((house: any) => ({
        house_number: house.id,
        longitude: house.longitude,
        sign: house.sign ? house.sign.name : 'Unknown',
      })) : [],
      ayanamsa: planetsData.data.ayanamsa || null,
      calculation_timestamp: new Date().toISOString(),
      source: 'prokerala_api',
    };

    return {
      success: true,
      data: transformedData,
      raw_response: planetsData,
    };

  } catch (error) {
    console.error('Error in Prokerala calculation:', error);
    throw error;
  }
}

function findPlanetData(planets: any[], planetName: string) {
  // Add safety check to ensure planets is an array
  if (!planets || !Array.isArray(planets)) {
    console.error('Planets data is not an array:', planets);
    return null;
  }
  
  const planet = planets.find(p => 
    p && p.name && (
      p.name.toLowerCase() === planetName.toLowerCase() ||
      p.name.toLowerCase().includes(planetName.toLowerCase())
    )
  );
  
  if (!planet) {
    console.warn(`Planet "${planetName}" not found in Prokerala response. Available planets:`, planets.map(p => p?.name).filter(Boolean));
    return null;
  }
  
  return {
    longitude: planet.longitude || 0,
    latitude: planet.latitude || 0,
    speed: planet.speed || 0,
    sign: planet.sign ? planet.sign.name : 'Unknown',
    house: planet.house ? planet.house.id : 0,
    raw_planet_data: planet,
  };
}

function extractPlanetFromAnyData(data: any, planetName: string) {
  // Try to extract planetary information from any available data structure
  // This is a fallback when the API doesn't return the expected format
  
  // Check if there's nakshatra_details and if it contains relevant info
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
  
  return null;
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
