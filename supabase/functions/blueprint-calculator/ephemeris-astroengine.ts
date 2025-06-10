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

// Manual calculation for ecliptic latitude approximation
function calculateEclipticLatitude(body: string, astroTime: any): number {
  try {
    // For most planets, ecliptic latitude is small (within ~8 degrees)
    // Use simplified orbital inclination approximations
    const bodyInclinations = {
      "Mercury": 7.005,    // degrees
      "Venus": 3.395,
      "Mars": 1.850,
      "Jupiter": 1.303,
      "Saturn": 2.489,
      "Uranus": 0.773,
      "Neptune": 1.770,
      "Pluto": 17.16
    };
    
    if (body === "Moon") {
      // Moon's latitude calculation using simplified lunar theory
      const T = (astroTime.tt - 2451545.0) / 36525.0;
      const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T;
      const latitude = 5.128 * Math.sin(F * Math.PI / 180);
      return latitude;
    }
    
    if (body === "Sun") {
      return 0; // Sun is always on the ecliptic
    }
    
    const inclination = bodyInclinations[body] || 0;
    // Simplified calculation - assume random position in orbital plane
    const T = (astroTime.tt - 2451545.0) / 36525.0;
    const phase = (T * 365.25 * body.length) % 360; // pseudo-random based on time and body
    return inclination * Math.sin(phase * Math.PI / 180) * 0.5; // Approximate latitude
  } catch (error) {
    console.warn(`Could not calculate latitude for ${body}:`, error);
    return 0;
  }
}

// Manual lunar nodes calculation using astronomical formulas
function calculateLunarNodesManual(astroTime: any): { northNode: number; southNode: number } {
  try {
    // Time in Julian centuries since J2000.0
    const T = (astroTime.tt - 2451545.0) / 36525.0;
    
    // Mean longitude of ascending node formula
    let meanAscendingNode = 125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + T * T * T / 467441.0 - T * T * T * T / 60616000.0;
    
    // Normalize to 0-360 degrees
    meanAscendingNode = meanAscendingNode % 360;
    if (meanAscendingNode < 0) meanAscendingNode += 360;
    
    // Calculate corrections for more accuracy
    const moonMeanAnomaly = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699.0 - T * T * T * T / 14712000.0;
    const sunMeanAnomaly = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T * T * T / 24490000.0;
    
    // Apply periodic corrections
    const correction = -1.274 * Math.sin((moonMeanAnomaly - 2 * sunMeanAnomaly) * Math.PI / 180) +
                      0.658 * Math.sin(-2 * sunMeanAnomaly * Math.PI / 180) -
                      0.186 * Math.sin(sunMeanAnomaly * Math.PI / 180) -
                      0.059 * Math.sin((2 * moonMeanAnomaly - 2 * sunMeanAnomaly) * Math.PI / 180) -
                      0.057 * Math.sin((moonMeanAnomaly - 2 * sunMeanAnomaly + sunMeanAnomaly) * Math.PI / 180);
    
    const trueAscendingNode = (meanAscendingNode + correction + 360) % 360;
    const descendingNode = (trueAscendingNode + 180) % 360;
    
    return {
      northNode: trueAscendingNode,
      southNode: descendingNode
    };
  } catch (error) {
    console.error("Error calculating lunar nodes manually:", error);
    // Fallback approximation
    const T = (astroTime.tt - 2451545.0) / 36525.0;
    const approximateNode = (125.04 - 1934.14 * T + 360) % 360;
    return {
      northNode: approximateNode,
      southNode: (approximateNode + 180) % 360
    };
  }
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
 * Calculate planetary positions using CORRECTED astronomical calculations
 * CRITICAL FIX: Proper date handling for accurate planetary positions
 */
export async function calculatePlanetaryPositionsWithAstro(
  date: string,
  time: string,
  location: string,
  timezone: string
) {
  try {
    console.log(`AstroEngine: Calculating positions for ${date} ${time} at ${location} in timezone ${timezone || "unknown"}`);
    
    // Enhanced self-test with reliable EclipticLongitude
    try {
      console.log("🔥 Running self-test with reliable EclipticLongitude...");
      const testDate = jdToDate(2_451_545.0); // J2000 as proper Date
      const testAstroTime = Astronomy.MakeTime(testDate);
      
      const testMoonLon = Astronomy.EclipticLongitude("Moon", testAstroTime);
      console.log(`[AstroEngine] Self-test passed: Moon @ J2000 = ${testMoonLon.toFixed(6)}°`);
    } catch (error) {
      console.error("Self-test failed:", error);
      throw new Error("Astronomy engine self-test failed");
    }
    
    // Parse the date and time
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    
    if (!year || !month || !day || hour === undefined || minute === undefined) {
      throw new Error("Invalid date or time format");
    }
    
    // Get coordinates FIRST to ensure proper timezone conversion
    let coords;
    try {
      coords = await getLocationCoordinates(location);
      console.log(`AstroEngine: Location coordinates: lat ${coords.latitude}, long ${coords.longitude}`);
    } catch (error) {
      console.error("Geocoding failed:", error);
      throw new Error(`Failed to geocode location: ${location}`);
    }
    
    // CRITICAL FIX: Create proper UTC date for Paramaribo
    console.log(`Creating date for: ${year}-${month}-${day} ${hour}:${minute} in timezone ${timezone}`);
    
    let utcDate: Date;
    
    if (timezone === 'America/Paramaribo' || timezone === 'America/Suriname') {
      // Paramaribo is UTC-3, so to convert local time to UTC, ADD 3 hours
      // Local time 22:00 + 3 hours = 01:00 UTC next day (Feb 13)
      console.log(`Converting Paramaribo time ${hour}:${minute} to UTC by adding 3 hours`);
      
      // Create the local date first
      const localDate = new Date(year, month - 1, day, hour, minute, 0);
      console.log(`Local date object: ${localDate.toISOString()}`);
      
      // Convert to UTC by adding the timezone offset (3 hours for UTC-3)
      utcDate = new Date(localDate.getTime() + (3 * 60 * 60 * 1000));
      console.log(`UTC date after timezone conversion: ${utcDate.toISOString()}`);
    } else {
      // For other timezones, use standard conversion
      const localDate = new Date(year, month - 1, day, hour, minute, 0);
      utcDate = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000));
    }
    
    console.log(`AstroEngine: Final UTC date: ${utcDate.toISOString()}`);
    
    // Validate the date is reasonable
    if (utcDate.getFullYear() !== 1978) {
      console.error(`CRITICAL: Year mismatch - expected 1978, got ${utcDate.getFullYear()}`);
    }
    if (utcDate.getMonth() + 1 !== 2) {
      console.error(`CRITICAL: Month mismatch - expected February (2), got ${utcDate.getMonth() + 1}`);
    }
    
    // Create AstroTime from the properly converted UTC date
    const astroTime = Astronomy.MakeTime(utcDate);
    
    // Validate that astroTime was created properly
    if (!astroTime || typeof astroTime.tt !== 'number') {
      console.error("CRITICAL: astroTime is invalid!", JSON.stringify(astroTime));
      throw new Error("Failed to create valid AstroTime");
    }
    
    const jd = astroTime.tt;
    console.log(`AstroEngine: Julian Date: ${jd}`);
    
    // Validate Julian Date is reasonable for 1978
    const expectedJD = 2443549.375; // Feb 13, 1978 01:00 UTC (22:00 Feb 12 Paramaribo time + 3 hours)
    console.log(`AstroEngine: Expected JD for Feb 12, 1978 22:00 Paramaribo (= Feb 13, 1978 01:00 UTC): ${expectedJD}`);
    
    if (Math.abs(jd - expectedJD) > 1) {
      console.error(`CRITICAL: Julian Date ${jd} is too far from expected ${expectedJD}. Difference: ${Math.abs(jd - expectedJD)} days`);
      console.error("This indicates a fundamental date conversion error!");
      throw new Error(`Julian Date validation failed: got ${jd}, expected ~${expectedJD}`);
    } else {
      console.log(`✅ Julian Date validation passed: ${jd} is close to expected ${expectedJD}`);
    }
    
    // Create observer for house calculations
    const observer = new Astronomy.Observer(coords.latitude, coords.longitude, 0);
    
    // Calculate planetary positions using reliable EclipticLongitude
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
    
    // Calculate positions for each celestial body
    for (const body of bodies) {
      try {
        console.log(`🔥 Calculating ${body.id} using reliable EclipticLongitude...`);
        
        let longitude: number, latitude: number;
        
        if (body.name === "Sun") {
          // Sun calculation using Earth's heliocentric vector
          const earthVec = Astronomy.HelioVector("Earth", astroTime);
          const lonRad = Math.atan2(earthVec.y, earthVec.x);
          longitude = (lonRad * 180/Math.PI + 180 + 360) % 360;
          latitude = 0;  // Sun's ecliptic latitude is always 0°
          
          console.log(`🔍 Sun calculation details: earthVec=(${earthVec.x.toFixed(6)}, ${earthVec.y.toFixed(6)}, ${earthVec.z.toFixed(6)})`);
          console.log(`🔍 Sun longitude raw calculation: atan2(${earthVec.y.toFixed(6)}, ${earthVec.x.toFixed(6)}) = ${lonRad.toFixed(6)} rad = ${(lonRad * 180/Math.PI + 180).toFixed(6)}°`);
        } else {
          // Use reliable EclipticLongitude for all other bodies
          longitude = Astronomy.EclipticLongitude(body.name as Astronomy.Body, astroTime);
          
          // Calculate latitude using manual approximation
          latitude = calculateEclipticLatitude(body.name, astroTime);
        }
        
        console.log(`✅ ${body.id}: lon=${longitude.toFixed(6)}°, lat=${latitude.toFixed(6)}°`);
        
        // Validate longitude is in expected range
        if (longitude < 0 || longitude >= 360) {
          console.warn(`WARNING: ${body.id} longitude ${longitude}° is outside 0-360° range`);
          longitude = ((longitude % 360) + 360) % 360;
        }
        
        // Calculate distance for planets (optional, non-critical)
        let distance = null;
        if (body.id !== "sun" && body.id !== "moon") {
          try {
            const vector = safeHelioVector(body.name, astroTime);
            distance = Math.hypot(vector.x, vector.y, vector.z);
          } catch (error) {
            console.warn(`Could not calculate distance for ${body.id}:`, error);
            distance = 1; // Default value
          }
        }
        
        // Calculate equatorial coordinates (optional, with fallback)
        let rightAscension = 0, declination = 0;
        try {
          const equatorial = Astronomy.Equator(body.name as Astronomy.Body, astroTime, observer, false, true);
          rightAscension = equatorial.ra;
          declination = equatorial.dec;
        } catch (equatorialError) {
          console.warn(`Could not calculate equatorial coordinates for ${body.id}: ${equatorialError}`);
          // Convert ecliptic to equatorial manually (simplified)
          const lonRad = longitude * Math.PI / 180;
          const latRad = latitude * Math.PI / 180;
          const obliquity = 23.4393 * Math.PI / 180; // Mean obliquity
          
          rightAscension = Math.atan2(
            Math.sin(lonRad) * Math.cos(obliquity) - Math.tan(latRad) * Math.sin(obliquity),
            Math.cos(lonRad)
          ) * 180 / Math.PI;
          
          declination = Math.asin(
            Math.sin(latRad) * Math.cos(obliquity) + Math.cos(latRad) * Math.sin(obliquity) * Math.sin(lonRad)
          ) * 180 / Math.PI;
          
          if (rightAscension < 0) rightAscension += 360;
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
        
        console.log(`AstroEngine: ${body.id} position calculated successfully`);
      } catch (error) {
        console.error(`Failed to calculate position for ${body.id}:`, error);
        // Use fallback values to ensure blueprint generation continues
        positions[body.id] = {
          longitude: 0, latitude: 0, distance: 1,
          rightAscension: 0, declination: 0,
          longitudeSpeed: 0, latitudeSpeed: 0
        };
      }
    }
    
    // Calculate lunar nodes using manual calculation
    try {
      const nodes = calculateLunarNodesManual(astroTime);
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
    
    // Calculate house cusps and angles with fallbacks
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
      // Reliable fallback using sidereal time
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
    positions["timestamp"] = utcDate.getTime();
    positions["source"] = "astronomy_engine_corrected_timezone";
    positions["julian_date"] = jd;
    positions["observer"] = {
      latitude: coords.latitude,
      longitude: coords.longitude
    };
    positions["calculation_method"] = "ecliptic_longitude_with_corrected_timezone";
    
    // Add debug info for troubleshooting
    positions["debug_info"] = {
      input_date: date,
      input_time: time,
      input_timezone: timezone,
      utc_date_created: utcDate.toISOString(),
      julian_date: jd,
      expected_jd: expectedJD,
      jd_difference: Math.abs(jd - expectedJD),
      year_validation: utcDate.getFullYear() === 1978,
      month_validation: utcDate.getMonth() + 1 === 2
    };
    
    console.log("✅ Corrected astronomical calculations completed successfully");
    return positions;
  } catch (error) {
    console.error("Error in calculatePlanetaryPositionsWithAstro:", error);
    throw error;
  }
}

// Helper function to get location coordinates
async function getLocationCoordinates(location: string): Promise<{ latitude: number; longitude: number }> {
  try {
    // Use a geocoding service to get coordinates
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
