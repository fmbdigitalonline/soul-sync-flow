
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as Astronomy from "npm:astronomy-engine@2";

/**
 * Convert anything the blueprint passes (JD | Date | AstroTime) → AstroTime
 * This is the bulletproof helper that prevents all "tt" crashes
 */
function toAstroTime(x: number | Date | Astronomy.AstroTime): Astronomy.AstroTime {
  if (x instanceof Astronomy.AstroTime) return x;

  if (typeof x === "number") {
    /* x is a Julian Day *in TT*. Library wants Δdays since J2000. */
    return new Astronomy.AstroTime(x - 2_451_545.0);
  }

  if (x instanceof Date) {
    return Astronomy.MakeTime(x);           // UTC date → proper AstroTime
  }

  throw new Error(`Unsupported time value (${typeof x}): ${x}`);
}

/**
 * Ecliptic longitude 0–360° for any body
 * This wrapper ensures we always pass valid AstroTime objects
 */
export function eclLon(body: Astronomy.Body, when: number | Date | Astronomy.AstroTime): number {
  return Astronomy.Ecliptic(body, toAstroTime(when)).elon;
}

/**
 * Safe wrapper for Astronomy.Ecliptic
 */
function safeEcliptic(body: Astronomy.Body, when: number | Date | Astronomy.AstroTime) {
  return Astronomy.Ecliptic(body, toAstroTime(when));
}

/**
 * Safe wrapper for Astronomy.HelioVector
 */
function safeHelioVector(body: Astronomy.Body, when: number | Date | Astronomy.AstroTime) {
  return Astronomy.HelioVector(body, toAstroTime(when));
}

/**
 * Safe wrapper for Astronomy.Equator
 */
function safeEquator(body: Astronomy.Body, when: number | Date | Astronomy.AstroTime, equinox?: boolean, true_equinox?: boolean) {
  return Astronomy.Equator(body, toAstroTime(when), equinox, true_equinox);
}

/**
 * Safe wrapper for Astronomy.SiderealTime
 */
function safeSiderealTime(when: number | Date | Astronomy.AstroTime) {
  return Astronomy.SiderealTime(toAstroTime(when));
}

/**
 * Calculate planetary positions using Astronomy Engine
 * This is a pure JavaScript implementation with no WASM/external data dependencies
 */
export async function calculatePlanetaryPositionsWithAstro(date, time, location, timezone) {
  console.log(`AstroEngine: Calculating positions for ${date} ${time} at ${location} in timezone ${timezone}`);
  
  // Parse the date and time
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  
  // Create a proper Date object
  // Note: Astronomy Engine expects UTC date objects
  const dateObj = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  console.log(`AstroEngine: Created date object: ${dateObj.toISOString()}`);
  
  // Convert to AstroTime for highest precision using our bulletproof helper
  const astroTime = toAstroTime(dateObj);
  console.log(`AstroEngine: Converted to AstroTime: ${astroTime.toString()}`);
  
  // Get coordinates for the location
  const coords = await getLocationCoordinates(location);
  console.log(`AstroEngine: Location coordinates: lat ${coords.latitude}, long ${coords.longitude}`);
  
  // Create an observer object for the specified location
  const observer = new Astronomy.Observer(
    coords.latitude,
    coords.longitude, 
    0 // elevation (assuming sea level)
  );
  
  // Define the bodies we want to calculate positions for
  const bodies = [
    { id: "sun", name: "Sun" },
    { id: "moon", name: "Moon" },
    { id: "mercury", name: "Mercury" },
    { id: "venus", name: "Venus" },
    { id: "mars", name: "Mars" },
    { id: "jupiter", name: "Jupiter" },
    { id: "saturn", name: "Saturn" },
    { id: "uranus", name: "Uranus" },
    { id: "neptune", name: "Neptune" },
    { id: "pluto", name: "Pluto" }
  ];
  
  // Calculate positions for each body
  const positions = {};
  
  for (const body of bodies) {
    // Calculate ecliptic coordinates (longitude and latitude) using our safe helper
    const eclipticLongitude = eclLon(body.name, astroTime);
    
    // Calculate the full ecliptic coordinates properly using safe wrapper
    const ecliptic = safeEcliptic(body.name, astroTime);
    
    // Calculate distance (for planets only, not Sun or Moon)
    let distance = null;
    if (body.id !== "sun" && body.id !== "moon") {
      const vector = safeHelioVector(body.name, astroTime);
      distance = Math.sqrt(vector.x*vector.x + vector.y*vector.y + vector.z*vector.z);
    }
    
    // Calculate body position in equatorial coordinates using safe wrapper
    const equatorial = safeEquator(body.name, astroTime, false, true);
    
    // Store the position data
    positions[body.id] = {
      longitude: eclipticLongitude,
      latitude: ecliptic.elat,
      distance: distance,
      rightAscension: equatorial.ra,
      declination: equatorial.dec,
      longitudeSpeed: 0, // Speed calculation would require additional work
      latitudeSpeed: 0
    };
    
    console.log(`AstroEngine: ${body.id} position: lon ${eclipticLongitude.toFixed(6)}°, lat ${ecliptic.elat.toFixed(6)}°`);
  }
  
  // Calculate lunar nodes using safe wrapper
  const nodes = calculateLunarNodes(astroTime);
  positions["north_node"] = {
    longitude: nodes.northNode,
    latitude: 0,
    distance: null,
    longitudeSpeed: 0,
    latitudeSpeed: 0
  };
  console.log(`AstroEngine: North node position: lon ${nodes.northNode.toFixed(6)}°`);
  
  // Calculate house cusps and angles (Ascendant and MC) using safe wrapper
  const houseData = calculateHousesAndAngles(astroTime, coords, observer);
  positions["ascendant"] = {
    longitude: houseData.ascendant,
    latitude: 0,
    house: 1
  };
  
  positions["mc"] = {
    longitude: houseData.mc,
    latitude: 0,
    house: 10
  };
  
  console.log(`AstroEngine: Ascendant: ${positions['ascendant'].longitude.toFixed(6)}°`);
  console.log(`AstroEngine: MC: ${positions['mc'].longitude.toFixed(6)}°`);
  
  // Add house cusps
  positions["houses"] = houseData.houses;
  
  // Add timestamp for reference
  positions["timestamp"] = dateObj.getTime();
  positions["source"] = "astronomy_engine";
  
  return positions;
}

// Helper function to calculate lunar nodes using safe wrapper
function calculateLunarNodes(time) {
  // Calculate lunar nodes using orbital elements with safe wrapper
  // This is a simplified calculation of the mean lunar nodes
  const e = safeHelioVector("Moon", time);
  const ascending = (Math.atan2(e.y, e.x) * 180/Math.PI + 360) % 360;
  return { 
    northNode: ascending, 
    southNode: (ascending + 180) % 360 
  };
}

// Helper function to calculate houses and angles using safe wrapper
function calculateHousesAndAngles(time, coords, observer) {
  // Calculate the Local Sidereal Time using safe wrapper
  const lst = safeSiderealTime(time);
  
  // Convert local sidereal time to degrees
  const lstDeg = (lst * 15) % 360;
  
  // Use Astronomy.Horizon to calculate the ascendant more accurately
  // The ascendant is the point on the ecliptic that is rising on the eastern horizon
  // We need to find where the ecliptic intersects with the eastern horizon
  // This is a simplification - for more accuracy, Astronomy.SearchRiseSet would be used
  const ascendant = (lstDeg + 90 - coords.latitude / 2) % 360;
  
  // The MC (Medium Coeli) is the point on the ecliptic that is highest in the sky
  const mc = lstDeg;
  
  // Generate house cusps using a simple equal house system
  // Each house is 30 degrees, starting from the ascendant
  const houses = [];
  for (let i = 1; i <= 12; i++) {
    houses.push({
      cusp: i,
      longitude: (ascendant + (i - 1) * 30) % 360
    });
  }
  
  return {
    ascendant,
    mc,
    houses
  };
}

// Helper function to get location coordinates
async function getLocationCoordinates(location: string): Promise<{ latitude: number; longitude: number }> {
  // Use a geocoding service to get coordinates
  // If GOOGLE_MAPS_API_KEY is available, use the Google Maps Geocoding API
  const googleApiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
  
  if (googleApiKey) {
    const encodedLocation = encodeURIComponent(location);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${googleApiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const { lat, lng } = result.geometry.location;
      console.log(`Geocoded location "${location}" to: ${lat}, ${lng}`);
      return { latitude: lat, longitude: lng };
    } else {
      throw new Error(`No results found for location: ${location}`);
    }
  } else {
    // Fallback to OpenStreetMap/Nominatim if no Google API key
    const encodedLocation = encodeURIComponent(location);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedLocation}&format=json`;
    
    // Add proper User-Agent for rate-limiting compliance
    const response = await fetch(url, {
      headers: {
        "User-Agent": "SoulSync/1.0 (contact@soulsync.com)"
      }
    });
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      console.log(`Geocoded location "${location}" to: ${result.lat}, ${result.lon}`);
      return { latitude: parseFloat(result.lat), longitude: parseFloat(result.lon) };
    }
    
    throw new Error(`Failed to geocode location: ${location}`);
  }
}

/**
 * Export helper function for other modules to use
 * @param jd Julian Day number
 * @returns AstroTime object
 */
export function convertJdToAstroTime(jd: number): Astronomy.AstroTime {
  return toAstroTime(jd);
}

/**
 * Export helper function for calculating ecliptic longitude by Julian Day
 * @param body Celestial body name
 * @param jd Julian Day number
 * @returns Ecliptic longitude in degrees
 */
export function eclipticLongitudeByJd(body: string, jd: number): number {
  return eclLon(body, jd);
}
