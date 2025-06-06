
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function testAstronomia(req) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== ASTRONOMIA PROPER API TEST ===');
    
    let responseMessage = `=== ASTRONOMIA PROPER API TEST ===\n`;

    // Import astronomia
    const astronomia = await import('npm:astronomia@4.1.1');
    console.log('Astronomia imported successfully');
    
    responseMessage += `✅ Astronomia loaded successfully\n\n`;

    // Test dates - your problematic ones plus standard ones
    const testDates = [
      { name: 'Problematic Date 1', date: new Date('2024-11-15T06:23:00.000Z') },
      { name: 'Problematic Date 2', date: new Date('1977-11-15T06:23:00.000Z') },
      { name: 'Standard Date 1', date: new Date('1990-06-15T12:00:00.000Z') },
      { name: 'Standard Date 2', date: new Date('2000-01-01T00:00:00.000Z') }
    ];

    for (const testCase of testDates) {
      responseMessage += `\n--- ${testCase.name}: ${testCase.date.toISOString()} ---\n`;
      
      try {
        // Calculate Julian Day using astronomia's julian module
        let jd;
        try {
          // Try different julian conversion methods
          if (astronomia.julian && astronomia.julian.CalendarGregorianToJD) {
            jd = astronomia.julian.CalendarGregorianToJD(
              testCase.date.getUTCFullYear(),
              testCase.date.getUTCMonth() + 1,
              testCase.date.getUTCDate() + 
              (testCase.date.getUTCHours() + testCase.date.getUTCMinutes()/60 + testCase.date.getUTCSeconds()/3600) / 24
            );
          } else if (astronomia.julian && astronomia.julian.dateToJD) {
            jd = astronomia.julian.dateToJD(testCase.date);
          } else if (astronomia.julian && astronomia.julian.DateToJD) {
            jd = astronomia.julian.DateToJD(testCase.date);
          } else {
            // Manual JD calculation as fallback
            const a = Math.floor((14 - testCase.date.getUTCMonth() - 1) / 12);
            const y = testCase.date.getUTCFullYear() + 4800 - a;
            const m = testCase.date.getUTCMonth() + 1 + 12 * a - 3;
            jd = testCase.date.getUTCDate() + Math.floor((153 * m + 2) / 5) + 365 * y + 
                 Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045 +
                 (testCase.date.getUTCHours() + testCase.date.getUTCMinutes()/60 + testCase.date.getUTCSeconds()/3600) / 24;
          }
          responseMessage += `  Julian Day: ${jd}\n`;
        } catch (e) {
          responseMessage += `  Julian Day calculation: ERROR - ${e.message}\n`;
          continue;
        }

        // Calculate True Obliquity (essential for coordinate conversion)
        let trueObliquity, trueObliquityDeg;
        try {
          if (astronomia.nutation) {
            const meanObliquity = astronomia.nutation.meanObliquity(jd); // in radians
            const nutationValues = astronomia.nutation.nutation(jd); // [deltaPsi, deltaEpsilon] in radians
            const deltaEpsilon = Array.isArray(nutationValues) ? nutationValues[1] : nutationValues.deltaEpsilon || 0;
            trueObliquity = meanObliquity + deltaEpsilon;
            trueObliquityDeg = trueObliquity * 180 / Math.PI;
            responseMessage += `  True Obliquity: ${trueObliquityDeg.toFixed(6)}°\n`;
          } else {
            responseMessage += `  True Obliquity: nutation module not found\n`;
          }
        } catch (e) {
          responseMessage += `  True Obliquity: ERROR - ${e.message}\n`;
        }

        // Test Sun position using solar module
        try {
          if (astronomia.solar && trueObliquity) {
            let sunEcliptic;
            
            // Try different solar position methods
            if (astronomia.solar.apparentEquatorial) {
              const sunEquatorial = astronomia.solar.apparentEquatorial(jd);
              // Convert equatorial to ecliptic using coord module
              if (astronomia.coord && astronomia.coord.Ecliptic && astronomia.coord.Equatorial) {
                const equatorialCoord = new astronomia.coord.Equatorial(sunEquatorial.ra || sunEquatorial._ra, sunEquatorial.dec || sunEquatorial._dec);
                sunEcliptic = new astronomia.coord.Ecliptic(equatorialCoord, trueObliquity);
                responseMessage += `  Sun Longitude: ${(sunEcliptic.lon * 180 / Math.PI).toFixed(6)}°\n`;
                responseMessage += `  Sun Latitude: ${(sunEcliptic.lat * 180 / Math.PI).toFixed(6)}°\n`;
              } else {
                responseMessage += `  Sun: Coord conversion not available\n`;
              }
            } else if (astronomia.solar.apparentLongitude) {
              const sunLon = astronomia.solar.apparentLongitude(jd);
              responseMessage += `  Sun Longitude: ${(sunLon * 180 / Math.PI).toFixed(6)}°\n`;
            } else {
              responseMessage += `  Sun: No usable function found in solar module\n`;
            }
          } else {
            responseMessage += `  Sun: Missing solar module or obliquity\n`;
          }
        } catch (e) {
          responseMessage += `  Sun: ERROR - ${e.message}\n`;
        }

        // Test Moon position using moonposition module  
        try {
          if (astronomia.moonposition && astronomia.moonposition.position && trueObliquity) {
            const moonEquatorial = astronomia.moonposition.position(jd);
            
            // Convert to ecliptic coordinates
            if (astronomia.coord && astronomia.coord.Ecliptic && astronomia.coord.Equatorial) {
              const equatorialCoord = new astronomia.coord.Equatorial(moonEquatorial._ra, moonEquatorial._dec);
              const moonEcliptic = new astronomia.coord.Ecliptic(equatorialCoord, trueObliquity);
              responseMessage += `  Moon Longitude: ${(moonEcliptic.lon * 180 / Math.PI).toFixed(6)}°\n`;
              responseMessage += `  Moon Latitude: ${(moonEcliptic.lat * 180 / Math.PI).toFixed(6)}°\n`;
            } else {
              responseMessage += `  Moon: Coord conversion not available\n`;
            }
          } else {
            responseMessage += `  Moon: Missing moonposition module or obliquity\n`;
          }
        } catch (e) {
          responseMessage += `  Moon: ERROR - ${e.message}\n`;
        }

        // Test True Lunar Nodes using moonnode module
        try {
          if (astronomia.moonnode) {
            if (astronomia.moonnode.ascending) {
              const northNode = astronomia.moonnode.ascending(jd);
              responseMessage += `  True North Node: ${(northNode * 180 / Math.PI).toFixed(6)}°\n`;
            } else if (astronomia.moonnode.meanAscending) {
              const meanNorthNode = astronomia.moonnode.meanAscending(jd);
              responseMessage += `  Mean North Node: ${(meanNorthNode * 180 / Math.PI).toFixed(6)}°\n`;
            } else {
              responseMessage += `  Lunar Node: No node function found\n`;
            }
          } else {
            responseMessage += `  Lunar Node: moonnode module not found\n`;
          }
        } catch (e) {
          responseMessage += `  Lunar Node: ERROR - ${e.message}\n`;
        }

        // Test planets using planetposition module
        const planets = ['mercury', 'venus', 'mars', 'jupiter', 'saturn'];
        for (const planet of planets) {
          try {
            if (astronomia.planetposition && astronomia.planetposition.Planet && trueObliquity) {
              const planetObj = new astronomia.planetposition.Planet(planet);
              
              // Try different methods to get planet position
              let planetEquatorial;
              if (planetObj.position) {
                planetEquatorial = planetObj.position(jd);
              } else if (planetObj.equatorial) {
                planetEquatorial = planetObj.equatorial(jd);
              } else if (planetObj.positionEquatorial) {
                planetEquatorial = planetObj.positionEquatorial(jd);
              }
              
              if (planetEquatorial && astronomia.coord) {
                const equatorialCoord = new astronomia.coord.Equatorial(
                  planetEquatorial.ra || planetEquatorial._ra, 
                  planetEquatorial.dec || planetEquatorial._dec
                );
                const planetEcliptic = new astronomia.coord.Ecliptic(equatorialCoord, trueObliquity);
                responseMessage += `  ${planet} Longitude: ${(planetEcliptic.lon * 180 / Math.PI).toFixed(6)}°\n`;
              } else {
                responseMessage += `  ${planet}: Could not get position\n`;
              }
            } else {
              responseMessage += `  ${planet}: planetposition.Planet not available\n`;
            }
          } catch (e) {
            responseMessage += `  ${planet}: ERROR - ${e.message}\n`;
          }
        }

      } catch (e) {
        responseMessage += `  CRITICAL ERROR for ${testCase.name}: ${e.message}\n`;
        console.error(`Error testing ${testCase.name}:`, e);
      }
    }

    // Explore module structure for debugging (condensed)
    responseMessage += `\n=== MODULE STRUCTURE SUMMARY ===\n`;
    const moduleNames = ['julian', 'solar', 'moonposition', 'moonnode', 'nutation', 'planetposition', 'coord'];
    
    for (const moduleName of moduleNames) {
      try {
        const module = astronomia[moduleName];
        if (module && typeof module === 'object') {
          const functions = Object.keys(module).filter(key => typeof module[key] === 'function').slice(0, 5);
          responseMessage += `${moduleName}: ${functions.join(', ')}${functions.length === 5 ? '...' : ''}\n`;
        } else {
          responseMessage += `${moduleName}: Not found\n`;
        }
      } catch (e) {
        responseMessage += `${moduleName}: Error - ${e.message}\n`;
      }
    }

    responseMessage += `\n=== TEST COMPLETED ===\n`;
    responseMessage += `Test completed at: ${new Date().toISOString()}\n`;

    return new Response(responseMessage, { 
      status: 200, 
      headers: { 
        "Content-Type": "text/plain; charset=utf-8",
        ...corsHeaders 
      } 
    });
    
  } catch (error) {
    console.error("Critical error in astronomia test:", error);
    
    return new Response(
      `CRITICAL ERROR: ${error.message}\nStack: ${error.stack}`,
      { 
        status: 500,
        headers: { 
          "Content-Type": "text/plain; charset=utf-8",
          ...corsHeaders 
        } 
      }
    );
  }
}

export default testAstronomia;

if (import.meta.main) {
  serve(testAstronomia);
}
