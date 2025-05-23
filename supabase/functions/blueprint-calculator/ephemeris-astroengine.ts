
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as Astronomy from "npm:astronomy-engine@2";

// CRITICAL: Multi-fallback approach for creating AstroTime objects in Supabase/Deno
function createSafeAstroTime(input: number | Date): Astronomy.AstroTime {
  try {
    let astroTime: Astronomy.AstroTime;
    
    if (typeof input === "number") {
      // Input is Julian Day - convert to UT (days since J2000.0)
      const utDays = input - 2451545.0;
      astroTime = new Astronomy.AstroTime(utDays);
    } else if (input instanceof Date) {
      // Try official Astronomy.MakeTime first
      try {
        astroTime = Astronomy.MakeTime(input);
        // Validate the result has proper structure
        if (!astroTime || typeof astroTime.tt !== 'number') {
          throw new Error("MakeTime returned invalid AstroTime object");
        }
      } catch (makeTimeError) {
        console.warn("MakeTime failed, using manual UT conversion:", makeTimeError);
        // Fallback: manual UT calculation from Date
        const utDays = dateToUTDays(input);
        astroTime = new Astronomy.AstroTime(utDays);
      }
    } else {
      throw new Error(`Invalid time input type: ${typeof input}`);
    }
    
    // Validate the AstroTime object
    if (!astroTime || typeof astroTime.tt !== 'number') {
      throw new Error("Created AstroTime object is invalid - missing .tt property");
    }
    
    return astroTime;
    
  } catch (error) {
    console.error(`Failed to create AstroTime from ${input}:`, error);
    throw error;
  }
}

// Convert Date to UT days since J2000.0 (proper astronomical method)
function dateToUTDays(date: Date): number {
  // Get UTC time in milliseconds since Unix epoch
  const utcMillis = date.getTime();
  
  // Convert to Julian Day
  // Unix epoch (1970-01-01 00:00:00 UTC) = JD 2440587.5
  const unixEpochJD = 2440587.5;
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const julianDay = unixEpochJD + (utcMillis / millisecondsPerDay);
  
  // Convert Julian Day to UT days since J2000.0 (JD 2451545.0)
  const utDays = julianDay - 2451545.0;
  
  return utDays;
}

// Safe wrapper for ecliptic longitude
export function eclLon(body: string, when: number | Date): number {
  try {
    const safeTime = createSafeAstroTime(when);
    const ecliptic = Astronomy.Ecliptic(body as Astronomy.Body, safeTime);
    return ecliptic.elon;
  } catch (error) {
    console.error(`eclLon failed for ${body} at ${when}:`, error);
    throw error;
  }
}

// Safe wrapper for heliocentric vector
function safeHelioVector(body: string, when: number | Date) {
  const safeTime = createSafeAstroTime(when);
  return Astronomy.HelioVector(body as Astronomy.Body, safeTime);
}

// Safe wrapper for equatorial coordinates
function safeEquator(body: string, when: number | Date) {
  const safeTime = createSafeAstroTime(when);
  return Astronomy.Equator(body as Astronomy.Body, safeTime, false, true);
}

// Safe wrapper for sidereal time
function safeSiderealTime(when: number | Date) {
  const safeTime = createSafeAstroTime(when);
  return Astronomy.SiderealTime(safeTime);
}

export interface PlanetaryPosition {
  name: string;
  longitude: number;
  latitude: number;
  distance: number;
  rightAscension: number;
  declination: number;
}

export interface HousesAndAngles {
  ascendant: number;
  midheaven: number;
  houses: number[];
}

/**
 * Calculate planetary positions using Astronomy Engine
 * This is a pure JavaScript implementation with no WASM/external data dependencies
 */
export async function calculatePlanetaryPositionsWithAstro(
  date: string,
  time: string,
  location: string,
  timezone: string
) {
  try {
    console.log(`AstroEngine: Calculating positions for ${date} ${time} at ${location} in timezone ${timezone}`);
    
    // Run self-tests first (moved inside function to prevent module init failures)
    try {
      console.log("Running Astronomy Engine self-tests...");
      
      // Test 1: J2000.0 epoch
      const testJD = 2451545.0;
      const testTime = createSafeAstroTime(testJD);
      const testSunPos = Astronomy.Ecliptic("Sun", testTime);
      console.log(`[AstroEngine] Self-test PASSED: Sun @ J2000 = ${testSunPos.elon.toFixed(3)}°`);
      
      // Test 2: The problematic date from the error
      const problemDate = new Date("1978-02-12T22:00:00Z");
      const problemTime = createSafeAstroTime(problemDate);
      const problemSunPos = Astronomy.Ecliptic("Sun", problemTime);
      console.log(`[AstroEngine] Problem date test PASSED: Sun in 1978 = ${problemSunPos.elon.toFixed(3)}°`);
      
    } catch (testError) {
      console.error("[AstroEngine] Self-test FAILED:", testError);
      throw new Error("Astronomy Engine self-test failed");
    }
    
    // Parse the date and time
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    
    // Create a proper Date object
    const dateObj = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
    console.log(`AstroEngine: Created date object: ${dateObj.toISOString()}`);
    
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
      try {
        // Calculate ecliptic coordinates (longitude and latitude) using our safe helper
        const eclipticLongitude = eclLon(body.name, dateObj);
        
        // Calculate the full ecliptic coordinates properly
        const safeTime = createSafeAstroTime(dateObj);
        const ecliptic = Astronomy.Ecliptic(body.name, safeTime);
        
        // Calculate distance (for planets only, not Sun or Moon)
        let distance = null;
        if (body.id !== "sun" && body.id !== "moon") {
          const vector = safeHelioVector(body.name, dateObj);
          distance = Math.sqrt(vector.x*vector.x + vector.y*vector.y + vector.z*vector.z);
        }
        
        // Calculate body position in equatorial coordinates
        const equatorial = safeEquator(body.name, dateObj);
        
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
      } catch (error) {
        console.error(`Failed to calculate position for ${body.id}:`, error);
        // Continue with other planets instead of failing completely
        positions[body.id] = {
          longitude: 0,
          latitude: 0,
          distance: null,
          rightAscension: 0,
          declination: 0,
          longitudeSpeed: 0,
          latitudeSpeed: 0
        };
      }
    }
    
    // Calculate lunar nodes
    try {
      const nodes = calculateLunarNodes(dateObj);
      positions["north_node"] = {
        longitude: nodes.northNode,
        latitude: 0,
        distance: null,
        longitudeSpeed: 0,
        latitudeSpeed: 0
      };
      console.log(`AstroEngine: North node position: lon ${nodes.northNode.toFixed(6)}°`);
    } catch (error) {
      console.error("Failed to calculate lunar nodes:", error);
      positions["north_node"] = {
        longitude: 0,
        latitude: 0,
        distance: null,
        longitudeSpeed: 0,
        latitudeSpeed: 0
      };
    }
    
    // Calculate house cusps and angles (Ascendant and MC)
    try {
      const houseData = calculateHousesAndAngles(dateObj, coords, observer);
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
    } catch (error) {
      console.error("Failed to calculate houses and angles:", error);
      positions["ascendant"] = { longitude: 0, latitude: 0, house: 1 };
      positions["mc"] = { longitude: 90, latitude: 0, house: 10 };
      positions["houses"] = Array.from({ length: 12 }, (_, i) => ({ 
        cusp: i + 1, 
        longitude: i * 30 
      }));
    }
    
    // Add timestamp for reference
    positions["timestamp"] = dateObj.getTime();
    positions["source"] = "astronomy_engine";
    
    return positions;
  } catch (error) {
    console.error("Error in calculatePlanetaryPositionsWithAstro:", error);
    throw error;
  }
}

// Helper function to calculate lunar nodes
function calculateLunarNodes(time: Date) {
  try {
    // Calculate lunar nodes using orbital elements
    const safeTime = createSafeAstroTime(time);
    const e = safeHelioVector("Moon", time);
    const ascending = (Math.atan2(e.y, e.x) * 180/Math.PI + 360) % 360;
    return { 
      northNode: ascending, 
      southNode: (ascending + 180) % 360 
    };
  } catch (error) {
    console.error("Error calculating lunar nodes:", error);
    return {
      northNode: 0,
      southNode: 180
    };
  }
}

// Helper function to calculate houses and angles
function calculateHousesAndAngles(time: Date, coords: { latitude: number; longitude: number }, observer: Astronomy.Observer) {
  try {
    // Calculate the Local Sidereal Time
    const lst = safeSiderealTime(time);
    
    // Convert local sidereal time to degrees
    const lstDeg = (lst * 15) % 360;
    
    // Calculate the ascendant (simplified method)
    const ascendant = (lstDeg + 90 - coords.latitude / 2) % 360;
    
    // The MC (Medium Coeli) is the point on the ecliptic that is highest in the sky
    const mc = lstDeg;
    
    // Generate house cusps using a simple equal house system
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
  } catch (error) {
    console.error("Error calculating houses and angles:", error);
    // Return safe defaults
    const houses = [];
    for (let i = 1; i <= 12; i++) {
      houses.push({
        cusp: i,
        longitude: (i - 1) * 30
      });
    }
    
    return {
      ascendant: 0,
      mc: 90,
      houses
    };
  }
}

// Helper function to get location coordinates
async function getLocationCoordinates(location: string): Promise<{ latitude: number; longitude: number }> {
  try {
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
  } catch (error) {
    console.error(`Error geocoding location "${location}":`, error);
    throw error;
  }
}

/**
 * Export helper function for other modules to use
 * @param jd Julian Day number
 * @returns AstroTime object
 */
export function convertJdToAstroTime(jd: number): Astronomy.AstroTime {
  return createSafeAstroTime(jd);
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
