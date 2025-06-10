// Modified Human Design calculation module - now handles geocoding and calls Vercel API
export async function calculateHumanDesign(birthDate: string, birthTime: string, location: string, timezone: string, celestialData: any) {
  try {
    console.log("Starting Human Design calculation with geocoding...");
    console.log("Birth data:", { birthDate, birthTime, location, timezone });
    
    // Step 1: Geocode the location using Google Maps API (available in Supabase)
    const coordinates = await geocodeLocation(location);
    
    if (!coordinates) {
      throw new Error(`Could not geocode location: ${location}`);
    }
    
    console.log(`✅ Geocoded ${location} to coordinates: ${coordinates}`);
    
    // Step 2: Call the Vercel API endpoint for Human Design calculations with coordinates
    const vercelResponse = await fetch("https://soul-sync-flow.vercel.app/api/human-design", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        birthDate,
        birthTime,
        birthLocation: location,
        timezone,
        celestialData,
        coordinates // Pass the geocoded coordinates
      })
    });
    
    console.log("Vercel Human Design API response status:", vercelResponse.status);
    
    if (!vercelResponse.ok) {
      const errorText = await vercelResponse.text();
      console.error("Vercel Human Design API error:", errorText);
      throw new Error(`Human Design API failed: ${vercelResponse.status} ${errorText}`);
    }
    
    const apiResponse = await vercelResponse.json();
    console.log("Vercel Human Design API response:", apiResponse);
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.error || 'Human Design calculation failed');
    }
    
    return apiResponse.data;
    
  } catch (error) {
    console.error("Error in Human Design calculation:", error);
    
    // Fallback to local calculation if API fails
    console.log("Falling back to local Human Design calculation...");
    return generateFallbackHumanDesign(birthDate, birthTime, location, timezone, celestialData);
  }
}

// Geocoding function using Google Maps API (available in Supabase edge function)
async function geocodeLocation(locationName: string): Promise<string | null> {
  console.log(`🔍 Starting Google geocoding for: ${locationName}`);
  
  // Get Google API key from Supabase secrets
  const googleApiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
  
  if (!googleApiKey) {
    console.warn('⚠️ No Google Maps API key found, falling back to Nominatim');
    return await tryNominatimGeocoding(locationName);
  }
  
  try {
    const encodedLocation = encodeURIComponent(locationName);
    const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${googleApiKey}`;
    
    console.log(`🔍 Calling Google Geocoding API for: ${locationName}`);
    
    const response = await fetch(googleUrl);
    
    if (!response.ok) {
      throw new Error(`Google API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`🔍 Google API response status: ${data.status}`);
    
    if (data.status === 'OK' && data.results && data.results[0]) {
      const result = data.results[0];
      const { lat, lng } = result.geometry.location;
      const coordinates = `${lat},${lng}`;
      
      console.log(`✅ Google geocoded "${locationName}" to: ${coordinates}`);
      console.log(`📍 Formatted address: ${result.formatted_address}`);
      
      return coordinates;
    } else if (data.status === 'ZERO_RESULTS') {
      console.warn(`⚠️ Google found no results for: ${locationName}`);
      return null;
    } else {
      console.error(`❌ Google geocoding failed with status: ${data.status}`);
      if (data.error_message) {
        console.error(`❌ Error message: ${data.error_message}`);
      }
      return null;
    }
    
  } catch (error) {
    console.error(`❌ Google geocoding error for ${locationName}:`, error.message);
    
    // Fallback to Nominatim if Google fails
    console.log('🔄 Falling back to OpenStreetMap Nominatim...');
    return await tryNominatimGeocoding(locationName);
  }
}

// Fallback geocoding using OpenStreetMap Nominatim
async function tryNominatimGeocoding(locationName: string): Promise<string | null> {
  try {
    console.log(`🔍 Trying Nominatim geocoding for: ${locationName}`);
    
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`);
    
    if (!response.ok) {
      throw new Error(`Nominatim API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data[0] && data[0].lat && data[0].lon) {
      const coordinates = `${data[0].lat},${data[0].lon}`;
      console.log(`✅ Nominatim geocoded ${locationName} to: ${coordinates}`);
      return coordinates;
    }
    
    console.error(`❌ No Nominatim results for: ${locationName}`);
    return null;
  } catch (error) {
    console.error(`❌ Nominatim geocoding error for ${locationName}:`, error);
    return null;
  }
}

// Fallback function for when we need a temporary solution
function generateFallbackHumanDesign(birthDate: string, birthTime: string, location: string, timezone: string, celestialData: any) {
  console.log("🔄 Using fallback Human Design calculation (temporary until proper library is integrated)");
  
  // Return a clearly marked fallback result
  return {
    type: "Generator", // Fallback - needs proper calculation
    profile: "1/3 (Investigator/Martyr)", // Fallback - needs proper calculation
    authority: "Sacral", // Fallback - needs proper calculation
    strategy: "Wait to respond",
    definition: "Single Definition",
    not_self_theme: "Frustration",
    life_purpose: "Fallback calculation - proper Human Design library needed",
    centers: {
      "Sacral": { defined: true, gates: [], channels: [] },
      "Throat": { defined: false, gates: [], channels: [] },
      "Head": { defined: false, gates: [], channels: [] },
      "Ajna": { defined: false, gates: [], channels: [] },
      "G": { defined: false, gates: [], channels: [] },
      "Heart": { defined: false, gates: [], channels: [] },
      "Solar Plexus": { defined: false, gates: [], channels: [] },
      "Spleen": { defined: false, gates: [], channels: [] },
      "Root": { defined: false, gates: [], channels: [] }
    },
    gates: {
      unconscious_design: [],
      conscious_personality: []
    },
    metadata: {
      personality_time: new Date(birthDate + "T" + birthTime).toISOString(),
      design_time: new Date(Date.now() - (89.66 * 24 * 60 * 60 * 1000)).toISOString(),
      offset_days: "89.66",
      calculation_method: "FALLBACK_NEEDS_PROPER_LIBRARY",
      notice: "This is a fallback calculation. A proper Human Design library needs to be integrated into the Vercel API."
    }
  };
}
