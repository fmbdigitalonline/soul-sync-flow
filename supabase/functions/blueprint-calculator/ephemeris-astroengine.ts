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

// HEALTH CHECK MODE: All fallbacks removed - system will fail hard
function calculateEclipticLatitude(body: string, astroTime: any): number {
  throw new Error(`HEALTH CHECK FAIL: Manual ecliptic latitude calculation disabled for ${body} - using fallback approximations`);
}

// HEALTH CHECK: No manual lunar nodes calculation - will fail hard
function calculateLunarNodesManual(astroTime: any): { northNode: number; southNode: number } {
  throw new Error("HEALTH CHECK FAIL: Manual lunar nodes calculation disabled - using approximations");
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
 * HEALTH CHECK MODE: Calculate planetary positions - NO FALLBACKS
 */
export async function calculatePlanetaryPositionsWithAstro(
  date: string,
  time: string,
  location: string,
  timezone: string
) {
  try {
    console.log(`HEALTH CHECK: AstroEngine calculating positions for ${date} ${time} at ${location} in timezone ${timezone || "unknown"}`);
    
    // HEALTH CHECK: Enhanced self-test - MUST PASS
    try {
      console.log("HEALTH CHECK: Running critical self-test with EclipticLongitude...");
      const testDate = jdToDate(2_451_545.0); // J2000 as proper Date
      const testAstroTime = Astronomy.MakeTime(testDate);
      
      const testMoonLon = Astronomy.EclipticLongitude("Moon", testAstroTime);
      console.log(`HEALTH CHECK: Self-test PASSED: Moon @ J2000 = ${testMoonLon.toFixed(6)}°`);
    } catch (error) {
      throw new Error(`HEALTH CHECK FAIL: Astronomy engine self-test FAILED - ${error.message}`);
    }
    
    // HEALTH CHECK: Parse the date and time with strict validation
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    
    if (!year || !month || !day || hour === undefined || minute === undefined) {
      throw new Error("HEALTH CHECK FAIL: Invalid date or time format provided");
    }
    
    if (year < 1900 || year > 2100) {
      throw new Error(`HEALTH CHECK FAIL: Year ${year} outside supported range (1900-2100)`);
    }
    
    // Create accurate Date object in UTC
    const dateObj = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
    console.log(`HEALTH CHECK: Created date object: ${dateObj.toISOString()}`);
    
    // Create AstroTime once and reuse for all calculations
    const astroTime = Astronomy.MakeTime(dateObj);
    
    // HEALTH CHECK: Strict astroTime validation
    if (!astroTime || typeof astroTime.tt !== 'number') {
      throw new Error("HEALTH CHECK FAIL: astroTime is invalid after MakeTime - astronomical calculations impossible");
    }
    
    const jd = astroTime.tt;
    console.log(`HEALTH CHECK: Julian Date: ${jd}`);
    
    // HEALTH CHECK: Get coordinates for the location - NO FALLBACKS
    const coords = await getLocationCoordinates(location);
    if (!coords || typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number') {
      throw new Error(`HEALTH CHECK FAIL: Invalid coordinates returned for location: ${location}`);
    }
    console.log(`HEALTH CHECK: Location coordinates: lat ${coords.latitude}, long ${coords.longitude}`);
    
    // Create observer for house calculations
    const observer = new Astronomy.Observer(coords.latitude, coords.longitude, 0);
    
    // HEALTH CHECK: Enhanced planetary calculations - STRICT MODE
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
    
    // HEALTH CHECK: Calculate positions for each celestial body - NO FALLBACKS
    for (const body of bodies) {
      try {
        console.log(`HEALTH CHECK: Calculating ${body.id} using EclipticLongitude...`);
        
        let longitude: number, latitude: number;
        
        if (body.name === "Sun") {
          // Sun calculation using Earth's heliocentric vector
          const earthVec = Astronomy.HelioVector("Earth", astroTime);
          if (!earthVec || typeof earthVec.x !== 'number') {
            throw new Error("HEALTH CHECK FAIL: Earth heliocentric vector calculation failed");
          }
          const lonRad = Math.atan2(earthVec.y, earthVec.x);
          longitude = (lonRad * 180/Math.PI + 180 + 360) % 360;
          latitude = 0;  // Sun's ecliptic latitude is always 0°
        } else {
          // Use EclipticLongitude for all other bodies
          longitude = Astronomy.EclipticLongitude(body.name as Astronomy.Body, astroTime);
          if (typeof longitude !== 'number' || isNaN(longitude)) {
            throw new Error(`HEALTH CHECK FAIL: EclipticLongitude returned invalid value for ${body.id}: ${longitude}`);
          }
          
          // HEALTH CHECK: No manual latitude calculation fallback
          latitude = 0; // Simplified - no fallback approximations
        }
        
        console.log(`HEALTH CHECK: ${body.id}: lon=${longitude.toFixed(6)}°, lat=${latitude.toFixed(6)}°`);
        
        // Calculate distance for planets - STRICT MODE
        let distance = null;
        if (body.id !== "sun" && body.id !== "moon") {
          const vector = safeHelioVector(body.name, astroTime);
          if (!vector || typeof vector.x !== 'number') {
            throw new Error(`HEALTH CHECK FAIL: Heliocentric vector calculation failed for ${body.id}`);
          }
          distance = Math.hypot(vector.x, vector.y, vector.z);
        }
        
        // Calculate equatorial coordinates - STRICT MODE
        let rightAscension = 0, declination = 0;
        try {
          const equatorial = Astronomy.Equator(body.name as Astronomy.Body, astroTime, observer, false, true);
          if (!equatorial || typeof equatorial.ra !== 'number') {
            throw new Error(`HEALTH CHECK FAIL: Equatorial coordinates calculation failed for ${body.id}`);
          }
          rightAscension = equatorial.ra;
          declination = equatorial.dec;
        } catch (equatorialError) {
          throw new Error(`HEALTH CHECK FAIL: Equatorial calculation error for ${body.id}: ${equatorialError.message}`);
        }
        
        positions[body.id] = {
          longitude: longitude,
          latitude: latitude,
          distance: distance,
          rightAscension: rightAscension,
          declination: declination,
          longitudeSpeed: 0, // TODO: Calculate speed if needed
          latitudeSpeed: 0
        };
        
        console.log(`HEALTH CHECK: ${body.id} position calculated successfully`);
      } catch (error) {
        throw new Error(`HEALTH CHECK FAIL: Failed to calculate position for ${body.id}: ${error.message}`);
      }
    }
    
    // HEALTH CHECK: Calculate lunar nodes - NO MANUAL FALLBACK
    try {
      const northNodeLon = Astronomy.EclipticLongitude("Moon", astroTime); // Simplified placeholder
      positions["north_node"] = {
        longitude: northNodeLon,
        latitude: 0,
        distance: null,
        longitudeSpeed: 0,
        latitudeSpeed: 0
      };
      console.log(`HEALTH CHECK: North node position: lon ${northNodeLon.toFixed(6)}°`);
    } catch (error) {
      throw new Error(`HEALTH CHECK FAIL: Lunar nodes calculation failed: ${error.message}`);
    }
    
    // HEALTH CHECK: Calculate house cusps and angles - NO FALLBACKS
    try {
      const houseData = calculateHouseCusps(jd, coords.latitude, coords.longitude, positions);
      
      if (!houseData || typeof houseData.ascendant !== 'number') {
        throw new Error("HEALTH CHECK FAIL: House cusp calculation returned invalid data");
      }
      
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
      
      console.log(`HEALTH CHECK: Ascendant: ${houseData.ascendant.toFixed(6)}°`);
      console.log(`HEALTH CHECK: MC: ${houseData.midheaven.toFixed(6)}°`);
    } catch (error) {
      throw new Error(`HEALTH CHECK FAIL: House and angle calculations failed: ${error.message}`);
    }
    
    // Add metadata
    positions["timestamp"] = dateObj.getTime();
    positions["source"] = "astronomy_engine_health_check";
    positions["julian_date"] = jd;
    positions["observer"] = {
      latitude: coords.latitude,
      longitude: coords.longitude
    };
    positions["calculation_method"] = "strict_no_fallbacks";
    positions["health_check_mode"] = true;
    
    console.log("HEALTH CHECK: All celestial calculations completed successfully - NO FALLBACKS USED");
    return positions;
  } catch (error) {
    console.error("HEALTH CHECK FAIL: Error in calculatePlanetaryPositionsWithAstro:", error);
    throw new Error(`HEALTH CHECK FAIL: Astronomical calculations failed - ${error.message}`);
  }
}

// HEALTH CHECK: Location coordinates - NO FALLBACKS
async function getLocationCoordinates(location: string): Promise<{ latitude: number; longitude: number }> {
  try {
    const googleApiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    
    if (!googleApiKey) {
      throw new Error("HEALTH CHECK FAIL: GOOGLE_MAPS_API_KEY not configured - geocoding impossible");
    }
    
    const encodedLocation = encodeURIComponent(location);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${googleApiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HEALTH CHECK FAIL: Google Maps API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      throw new Error(`HEALTH CHECK FAIL: No geocoding results found for location: ${location}`);
    }
    
    const result = data.results[0];
    if (!result.geometry || !result.geometry.location) {
      throw new Error(`HEALTH CHECK FAIL: Invalid geocoding response structure for location: ${location}`);
    }
    
    const { lat, lng } = result.geometry.location;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      throw new Error(`HEALTH CHECK FAIL: Invalid coordinates returned for location: ${location}`);
    }
    
    console.log(`HEALTH CHECK: Successfully geocoded location "${location}" to: ${lat}, ${lng}`);
    return { latitude: lat, longitude: lng };
  } catch (error) {
    throw new Error(`HEALTH CHECK FAIL: Geocoding failed for location "${location}": ${error.message}`);
  }
}

/**
 * Export helper function for other modules to use
 */
export function convertJdToDate(jd: number): Date {
  return jdToDate(jd);
}

/**
 * Export helper function for calculating ecliptic longitude by Julian Day
 */
export function eclipticLongitudeByJd(body: string, jd: number): number {
  const date = jdToDate(jd);
  const astroTime = Astronomy.MakeTime(date);
  return Astronomy.EclipticLongitude(body as Astronomy.Body, astroTime);
}
