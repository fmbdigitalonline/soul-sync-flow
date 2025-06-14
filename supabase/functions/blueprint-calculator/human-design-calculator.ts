// HDKit-based Human Design calculation: dispatches all logic to Vercel API, expects pre-geocoded coordinates

export async function calculateHumanDesign(
  birthDate: string,
  birthTime: string,
  location: string,
  timezone: string,
  celestialData: any // ignored in HDKit flow
) {
  try {
    console.log("[HDKit] Starting Human Design calculation (HDKit Vercel API)...");

    // Step 1: Geocode the location to get coordinates
    const coordinates = await geocodeLocation(location);

    if (!coordinates) {
      throw new Error(`Could not geocode location: ${location}`);
    }

    // Split coordinates for HDKit input
    const [latString, lonString] = coordinates.split(",");
    const lat = Number(latString?.trim());
    const lon = Number(lonString?.trim());

    if (isNaN(lat) || isNaN(lon)) {
      throw new Error(`Invalid coordinates for HDKit: ${coordinates}`);
    }

    // Step 2: Call the HDKit Vercel API endpoint
    const hdkitEndpoint = "https://your-vercel-project.vercel.app/api/humandesign"; // <-- CHANGE ME to your deployed endpoint!

    const response = await fetch(hdkitEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        birthDate,
        birthTime,
        coordinates: { lat, lon }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`[HDKit] Vercel API failed: ${response.status} ${errorText}`);
    }

    const apiResponse = await response.json();
    if (!apiResponse.success) {
      throw new Error(apiResponse.error || "[HDKit] Human Design calculation failed via Vercel HDKit");
    }

    // Return the calculated chart as-is
    return apiResponse.chart;

  } catch (error) {
    console.error("[HDKit] Error in Human Design calculation:", error);

    // In case of error, return a clearly marked fallback so the frontend can handle gracefully
    return {
      type: "ERROR",
      notice: "HDKit calculation failed",
      error: error instanceof Error ? error.message : error,
      method: "HDKIT_VERCEL_API"
    };
  }
}

// Geocoding remains unchanged
async function geocodeLocation(locationName: string): Promise<string | null> {
  console.log(`[HDKit] Geocoding: ${locationName}`);

  const googleApiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
  if (!googleApiKey) return await tryNominatimGeocoding(locationName);

  try {
    const encodedLocation = encodeURIComponent(locationName);
    const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${googleApiKey}`;
    const response = await fetch(googleUrl);
    if (!response.ok) throw new Error(`Google API returned ${response.status}: ${response.statusText}`);
    const data = await response.json();
    if (data.status === "OK" && data.results && data.results[0]) {
      const { lat, lng } = data.results[0].geometry.location;
      return `${lat},${lng}`;
    }
    return null;
  } catch (error) {
    console.warn("[HDKit] Google geocoding failed:", error.message);
    return await tryNominatimGeocoding(locationName);
  }
}

async function tryNominatimGeocoding(locationName: string): Promise<string | null> {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`);
    if (!response.ok) throw new Error(`Nominatim API returned ${response.status}`);
    const data = await response.json();
    if (data && data[0] && data[0].lat && data[0].lon) {
      return `${data[0].lat},${data[0].lon}`;
    }
    return null;
  } catch (error) {
    console.error(`[HDKit] Nominatim geocoding error for ${locationName}:`, error);
    return null;
  }
}
