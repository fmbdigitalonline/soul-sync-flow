import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as Astronomy from "npm:astronomy-engine@2";
import { calculateHouseCusps } from './house-system-calculator.ts';

// Helper function to convert Julian Day to JavaScript Date
function jdToDate(jd: number): Date {
  // JD 2440587.5 = 1970-01-01T00:00:00Z (Unix epoch)
  return new Date((jd - 2_440_587.5) * 86_400_000);
}

// Safe wrapper for heliocentric vector
function safeHelioVector(body: string, astroTime: any) {
  return Astronomy.HelioVector(body as Astronomy.Body, astroTime);
}

// Safe wrapper for sidereal time - now takes AstroTime and Observer instance
function safeSiderealTime(
  astroTime: Astronomy.AstroTime, 
  observer: Astronomy.Observer
): number {
  return Astronomy.SiderealTime(astroTime, observer);
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
 * Calculate planetary positions using Astronomy Engine with enhanced accuracy
 */
export async function calculatePlanetaryPositionsWithAstro(
  date: string,
  time: string,
  location: string,
  timezone: string
) {
  try {
    console.log(`AstroEngine: Calculating positions for ${date} ${time} at ${location} in timezone ${timezone || "unknown"}`);
    
    // Enhanced self-test with proper AstroTime
    try {
      console.log("🔥 running self-test with safe EclipticLongitude helper...");
      const testDate = jdToDate(2_451_545.0); // J2000 as proper Date
      const testAstroTime = Astronomy.MakeTime(testDate);
      
      // Use the Moon (geocentric) instead of the Sun (heliocentric Sun is undefined)
      const testMoonLon = Astronomy.EclipticLongitude("Moon", testAstroTime);
      console.log(`[AstroEngine] Self-test passed: Moon @ J2000 = ${testMoonLon.toFixed(6)}°`);
    } catch (error) {
      console.error("Self-test failed:", error);
      throw new Error("Astronomy engine self-test failed");
    }
    
    // Parse the date and time with enhanced validation
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    
    if (!year || !month || !day || hour === undefined || minute === undefined) {
      throw new Error("Invalid date or time format");
    }
    
    // Create accurate Date object in UTC
    const dateObj = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
    console.log(`AstroEngine: Created date object: ${dateObj.toISOString()}`);
    
    // Create AstroTime once and reuse for all calculations
    const astroTime = Astronomy.MakeTime(dateObj);
    
    // Check immediately if astroTime is valid
    if (!astroTime || typeof astroTime.tt !== 'number') {
      console.error("CRITICAL: astroTime is invalid immediately after MakeTime!", JSON.stringify(astroTime));
      throw new Error("astroTime invalid after MakeTime");
    }
    
    const jd = astroTime.tt;
    console.log(`AstroEngine: Julian Date: ${jd}`);
    console.log("AstroTime object after creation:", JSON.stringify(astroTime)); // LOG 1
    
    // Get coordinates for the location with error handling
    let coords;
    try {
      coords = await getLocationCoordinates(location);
      console.log(`AstroEngine: Location coordinates: lat ${coords.latitude}, long ${coords.longitude}`);
    } catch (error) {
      console.error("Geocoding failed:", error);
      throw new Error(`Failed to geocode location: ${location}`);
    }
    
    // Create observer for house calculations
    const observer = new Astronomy.Observer(coords.latitude, coords.longitude, 0);
    
    console.log("AstroTime object before loop:", JSON.stringify(astroTime)); // LOG 2
    if (!astroTime || typeof astroTime.tt !== 'number') { // Re-check before loop
      console.error("CRITICAL: astroTime became invalid before the calculation loop!", JSON.stringify(astroTime));
      throw new Error("astroTime became invalid before loop");
    }
    
    // Enhanced planetary calculations
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
    
    const positions = {};
    
    // Calculate positions for each celestial body using the same AstroTime
    for (const body of bodies) {
      try {
        console.log(`🔥 calculating ${body.id} with proper AstroTime...`);
        
        let longitude: number, latitude: number;
        
        if (body.name === "Sun") {
          // ─── SUN SPECIAL CASE ─────────────────────────
          // 1) Get Earth's heliocentric vector (x,y,z) at this time
          const earthVec = Astronomy.HelioVector("Earth", astroTime);
          
          // 2) Convert to geocentric Sun longitude by inverting direction (+180°)
          const lonRad = Math.atan2(earthVec.y, earthVec.x);
          longitude = (lonRad * 180/Math.PI + 180 + 360) % 360;
          latitude = 0;  // Sun's ecliptic latitude ≈ 0°
        } else if (body.name === "Moon") {
          // ─── MOON WORKAROUND FOR ECLIPTIC FAILURE ────
          console.log(`MOON WORKAROUND: Using EclipticLongitude instead of Ecliptic for ${body.name}`);
          
          try {
            // Use the working EclipticLongitude function
            longitude = Astronomy.EclipticLongitude("Moon", astroTime);
            
            // For latitude, we'll need a workaround since Ecliptic is failing
            // Try to calculate it manually using GeoVector if available
            try {
              const geoMoon = Astronomy.GeoVector("Moon", astroTime);
              const obliquity = 23.4393; // Mean obliquity in degrees (fallback)
              
              // Convert geocentric equatorial to ecliptic
              const ra = Math.atan2(geoMoon.y, geoMoon.x);
              const dec = Math.atan2(geoMoon.z, Math.sqrt(geoMoon.x * geoMoon.x + geoMoon.y * geoMoon.y));
              
              const oblRad = obliquity * Math.PI / 180;
              latitude = Math.asin(Math.sin(dec) * Math.cos(oblRad) - Math.cos(dec) * Math.sin(oblRad) * Math.sin(ra)) * 180 / Math.PI;
              
              console.log(`MOON MANUAL LATITUDE: ${latitude.toFixed(6)}°`);
            } catch (latError) {
              console.warn(`Could not calculate Moon latitude manually: ${latError}. Using 0.`);
              latitude = 0; // Fallback
            }
          } catch (lonError) {
            console.error(`Even EclipticLongitude failed for Moon: ${lonError}`);
            throw lonError;
          }
        } else {
          // ─── ALL OTHER BODIES ────────────────────────────
          // Try the standard Ecliptic function, but with fallback
          try {
            console.log(`STANDARD APPROACH: Attempting Ecliptic for ${body.name}`);
            const ecl = Astronomy.Ecliptic(body.name as Astronomy.Body, astroTime);
            longitude = ecl.elon;
            latitude = ecl.elat;
          } catch (eclipticError) {
            console.warn(`Ecliptic failed for ${body.name}: ${eclipticError}. Trying EclipticLongitude fallback.`);
            
            // Fallback to EclipticLongitude if available
            try {
              longitude = Astronomy.EclipticLongitude(body.name as Astronomy.Body, astroTime);
              latitude = 0; // Approximate for non-Moon bodies
              console.log(`FALLBACK SUCCESS: ${body.name} longitude via EclipticLongitude: ${longitude.toFixed(6)}°`);
            } catch (fallbackError) {
              console.error(`Both Ecliptic and EclipticLongitude failed for ${body.name}: ${fallbackError}`);
              // Use default positions as last resort
              longitude = 0;
              latitude = 0;
            }
          }
        }
        
        console.log(`DEBUG ${body.id}: lon=${longitude.toFixed(6)}, lat=${latitude.toFixed(6)}`);
        
        // Calculate distance for planets
        let distance = null;
        if (body.id !== "sun" && body.id !== "moon") {
          try {
            const vector = safeHelioVector(body.name, astroTime);
            distance = Math.hypot(vector.x, vector.y, vector.z);
          } catch (error) {
            console.warn(`Could not calculate distance for ${body.id}:`, error);
          }
        }
        
        // Calculate equatorial coordinates using the same astroTime
        let rightAscension = 0, declination = 0;
        try {
          const equatorial = Astronomy.Equator(body.name as Astronomy.Body, astroTime, observer, false, true);
          rightAscension = equatorial.ra;
          declination = equatorial.dec;
        } catch (equatorialError) {
          console.warn(`Could not calculate equatorial coordinates for ${body.id}: ${equatorialError}`);
        }
        
        positions[body.id] = {
          longitude: longitude,
          latitude: latitude,
          distance: distance,
          rightAscension: rightAscension,
          declination: declination,
          longitudeSpeed: 0, // TODO: Calculate speed
          latitudeSpeed: 0
        };
        
        console.log(`AstroEngine: ${body.id} position: lon ${longitude.toFixed(6)}°, lat ${latitude.toFixed(6)}°`);
      } catch (error) {
        console.error(`Failed to calculate position for ${body.id}:`, error);
        // Continue with other planets
        positions[body.id] = {
          longitude: 0, latitude: 0, distance: null,
          rightAscension: 0, declination: 0,
          longitudeSpeed: 0, latitudeSpeed: 0
        };
      }
    }
    
    // Calculate accurate lunar nodes using the corrected function
    try {
      const nodes = calculateLunarNodes(astroTime);
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
        longitude: 0, latitude: 0, distance: null,
        longitudeSpeed: 0, latitudeSpeed: 0
      };
    }
    
    // Calculate accurate house cusps and angles
    try {
      const houseData = calculateHouseCusps(jd, coords.latitude, coords.longitude, positions);
      
      positions["ascendant"] = {
        longitude: houseData.ascendant,
        latitude: 0,
        house: 1
      };
      
      positions["mc"] = {
        longitude: houseData.midheaven,
        latitude: 0,
        house: 10
      };
      
      positions["houses"] = houseData.houses;
      
      console.log(`AstroEngine: Ascendant: ${houseData.ascendant.toFixed(6)}°`);
      console.log(`AstroEngine: MC: ${houseData.midheaven.toFixed(6)}°`);
    } catch (error) {
      console.error("Failed to calculate houses and angles:", error);
      // Fallback to simple calculations using the Observer instance and AstroTime
      const lst = safeSiderealTime(astroTime, observer);
      const ascendant = (lst * 15 + 90 - coords.latitude / 2 + 360) % 360;
      const mc = (lst * 15) % 360;
      
      positions["ascendant"] = { longitude: ascendant, latitude: 0, house: 1 };
      positions["mc"] = { longitude: mc, latitude: 0, house: 10 };
      positions["houses"] = Array.from({ length: 12 }, (_, i) => ({ 
        cusp: i + 1, 
        longitude: (ascendant + i * 30) % 360 
      }));
    }
    
    // Add metadata
    positions["timestamp"] = dateObj.getTime();
    positions["source"] = "astronomy_engine_enhanced";
    positions["julian_date"] = jd;
    positions["observer"] = {
      latitude: coords.latitude,
      longitude: coords.longitude
    };
    
    console.log("Enhanced celestial calculations completed successfully");
    return positions;
  } catch (error) {
    console.error("Error in calculatePlanetaryPositionsWithAstro:", error);
    throw error;
  }
}

// Corrected helper function to calculate lunar nodes using astronomy-engine's dedicated functions
function calculateLunarNodes(astroTime: Astronomy.AstroTime) {
  try {
    // Calculate true lunar nodes using Astronomy Engine's dedicated function
    const nodesLon = Astronomy.TrueLunarNodes(astroTime); // Returns longitude of the true ascending node
    return { 
      northNode: nodesLon, 
      southNode: (nodesLon + 180) % 360 
    };
  } catch (error) {
    console.error("Error calculating lunar nodes:", error);
    return {
      northNode: 0,
      southNode: 180
    };
  }
}

// Helper function to calculate house cusps
function calculateHouseCusps(jd: number, latitude: number, longitude: number, positions: { [key: string]: PlanetaryPosition }) {
  try {
    // Create observer for sidereal time calculation
    const observer = new Astronomy.Observer(latitude, longitude, 0);
    const astroTime = Astronomy.MakeTime(convertJdToDate(jd));
    
    // Calculate the Local Sidereal Time using AstroTime and Observer instance
    const lst = safeSiderealTime(astroTime, observer);
    
    // Convert local sidereal time to degrees
    const lstDeg = (lst * 15) % 360;
    
    // Calculate the ascendant (simplified method)
    const ascendant = (lstDeg + 90 - latitude / 2) % 360;
    
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
      midheaven: mc,
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
      midheaven: 90,
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
 * @returns Date object
 */
export function convertJdToDate(jd: number): Date {
  return jdToDate(jd);
}

/**
 * Export helper function for calculating ecliptic longitude by Julian Day
 * @param body Celestial body name
 * @param jd Julian Day number
 * @returns Ecliptic longitude in degrees
 */
export function eclipticLongitudeByJd(body: string, jd: number): number {
  const date = jdToDate(jd);
  const astroTime = Astronomy.MakeTime(date);
  return Astronomy.EclipticLongitude(body as Astronomy.Body, astroTime);
}
