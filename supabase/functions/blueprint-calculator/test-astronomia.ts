
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
    console.log('=== ASTRONOMIA CORRECTED API TEST ===');
    
    let responseMessage = `=== ASTRONOMIA CORRECTED API TEST ===\n`;

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
        // Step 1: Calculate Julian Day using correct API
        let jd;
        try {
          if (astronomia.julian && astronomia.julian.CalendarGregorianToJD) {
            jd = astronomia.julian.CalendarGregorianToJD(
              testCase.date.getUTCFullYear(),
              testCase.date.getUTCMonth() + 1,
              testCase.date.getUTCDate() + 
              (testCase.date.getUTCHours() + testCase.date.getUTCMinutes()/60 + testCase.date.getUTCSeconds()/3600) / 24
            );
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
          responseMessage += `  Julian Day ERROR: ${e.message}\n`;
          continue;
        }

        // Step 2: Calculate True Obliquity (essential for coordinate conversion)
        let trueObliquity;
        try {
          if (astronomia.nutation) {
            const meanObliquity = astronomia.nutation.meanObliquity(jd);
            const nutationResult = astronomia.nutation.nutation(jd);
            const deltaEpsilon = Array.isArray(nutationResult) ? nutationResult[1] : nutationResult.deltaEpsilon || 0;
            trueObliquity = meanObliquity + deltaEpsilon;
            responseMessage += `  True Obliquity: ${(trueObliquity * 180 / Math.PI).toFixed(6)}°\n`;
          } else {
            throw new Error("nutation module not available");
          }
        } catch (e) {
          responseMessage += `  True Obliquity ERROR: ${e.message}\n`;
          continue;
        }

        // Step 3: Calculate Sun Position in Ecliptic Coordinates
        try {
          if (astronomia.solar && astronomia.coord && trueObliquity) {
            let sunEclipticLon, sunEclipticLat;
            
            // Try different solar position methods
            if (astronomia.solar.apparentEquatorial) {
              const sunEquatorial = astronomia.solar.apparentEquatorial(jd);
              const ra = sunEquatorial.ra || sunEquatorial._ra || 0;
              const dec = sunEquatorial.dec || sunEquatorial._dec || 0;
              
              if (astronomia.coord.Ecliptic && astronomia.coord.Equatorial) {
                const equatorialCoord = new astronomia.coord.Equatorial(ra, dec);
                const sunEcliptic = new astronomia.coord.Ecliptic(equatorialCoord, trueObliquity);
                sunEclipticLon = sunEcliptic.lon * 180 / Math.PI;
                sunEclipticLat = sunEcliptic.lat * 180 / Math.PI;
              }
            } else if (astronomia.solar.apparentLongitude) {
              sunEclipticLon = astronomia.solar.apparentLongitude(jd) * 180 / Math.PI;
              sunEclipticLat = 0; // Sun is on ecliptic
            }
            
            if (sunEclipticLon !== undefined) {
              responseMessage += `  Sun Ecliptic: ${sunEclipticLon.toFixed(6)}° lon, ${sunEclipticLat.toFixed(6)}° lat\n`;
            } else {
              responseMessage += `  Sun: No valid calculation method found\n`;
            }
          }
        } catch (e) {
          responseMessage += `  Sun ERROR: ${e.message}\n`;
        }

        // Step 4: Calculate Moon Position in Ecliptic Coordinates
        try {
          if (astronomia.moonposition && astronomia.coord && trueObliquity) {
            const moonEquatorial = astronomia.moonposition.position(jd);
            const ra = moonEquatorial.ra || moonEquatorial._ra || 0;
            const dec = moonEquatorial.dec || moonEquatorial._dec || 0;
            
            if (astronomia.coord.Ecliptic && astronomia.coord.Equatorial) {
              const equatorialCoord = new astronomia.coord.Equatorial(ra, dec);
              const moonEcliptic = new astronomia.coord.Ecliptic(equatorialCoord, trueObliquity);
              const moonEclipticLon = moonEcliptic.lon * 180 / Math.PI;
              const moonEclipticLat = moonEcliptic.lat * 180 / Math.PI;
              responseMessage += `  Moon Ecliptic: ${moonEclipticLon.toFixed(6)}° lon, ${moonEclipticLat.toFixed(6)}° lat\n`;
            }
          }
        } catch (e) {
          responseMessage += `  Moon ERROR: ${e.message}\n`;
        }

        // Step 5: Calculate True Lunar Nodes
        try {
          if (astronomia.moonnode) {
            let northNodeLon;
            if (astronomia.moonnode.ascending) {
              northNodeLon = astronomia.moonnode.ascending(jd) * 180 / Math.PI;
            } else if (astronomia.moonnode.meanAscending) {
              northNodeLon = astronomia.moonnode.meanAscending(jd) * 180 / Math.PI;
            }
            
            if (northNodeLon !== undefined) {
              responseMessage += `  True North Node: ${northNodeLon.toFixed(6)}°\n`;
            }
          }
        } catch (e) {
          responseMessage += `  Lunar Node ERROR: ${e.message}\n`;
        }

        // Step 6: Calculate Planet Positions
        const planets = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
        for (const planet of planets) {
          try {
            if (astronomia.planetposition && astronomia.coord && trueObliquity) {
              const planetObj = new astronomia.planetposition.Planet(planet);
              
              let planetEquatorial;
              // Try different methods to get planet position
              if (planetObj.position) {
                planetEquatorial = planetObj.position(jd);
              } else if (planetObj.equatorial) {
                planetEquatorial = planetObj.equatorial(jd);
              } else if (planetObj.positionEquatorial) {
                planetEquatorial = planetObj.positionEquatorial(jd);
              }
              
              if (planetEquatorial) {
                const ra = planetEquatorial.ra || planetEquatorial._ra || 0;
                const dec = planetEquatorial.dec || planetEquatorial._dec || 0;
                
                if (astronomia.coord.Ecliptic && astronomia.coord.Equatorial) {
                  const equatorialCoord = new astronomia.coord.Equatorial(ra, dec);
                  const planetEcliptic = new astronomia.coord.Ecliptic(equatorialCoord, trueObliquity);
                  const planetEclipticLon = planetEcliptic.lon * 180 / Math.PI;
                  const planetEclipticLat = planetEcliptic.lat * 180 / Math.PI;
                  responseMessage += `  ${planet} Ecliptic: ${planetEclipticLon.toFixed(6)}° lon, ${planetEclipticLat.toFixed(6)}° lat\n`;
                }
              }
            }
          } catch (e) {
            responseMessage += `  ${planet} ERROR: ${e.message}\n`;
          }
        }

      } catch (e) {
        responseMessage += `  CRITICAL ERROR for ${testCase.name}: ${e.message}\n`;
        console.error(`Error testing ${testCase.name}:`, e);
      }
    }

    // Step 7: Detailed Module Analysis for API Discovery
    responseMessage += `\n=== DETAILED MODULE ANALYSIS ===\n`;
    const modules = ['julian', 'solar', 'moonposition', 'moonnode', 'nutation', 'planetposition', 'coord'];
    
    for (const moduleName of modules) {
      try {
        const module = astronomia[moduleName];
        if (module && typeof module === 'object') {
          responseMessage += `\n${moduleName} module:\n`;
          
          // List all functions
          const functions = Object.keys(module).filter(key => typeof module[key] === 'function');
          if (functions.length > 0) {
            responseMessage += `  Functions: ${functions.join(', ')}\n`;
          }
          
          // List all constructors/classes
          const constructors = Object.keys(module).filter(key => {
            try {
              return typeof module[key] === 'function' && module[key].prototype && module[key].prototype.constructor === module[key];
            } catch {
              return false;
            }
          });
          if (constructors.length > 0) {
            responseMessage += `  Classes: ${constructors.join(', ')}\n`;
          }
          
          // List other properties
          const others = Object.keys(module).filter(key => 
            typeof module[key] !== 'function' && typeof module[key] !== 'undefined'
          );
          if (others.length > 0) {
            responseMessage += `  Properties: ${others.join(', ')}\n`;
          }
        } else {
          responseMessage += `${moduleName}: Not found or not an object\n`;
        }
      } catch (e) {
        responseMessage += `${moduleName}: Error analyzing - ${e.message}\n`;
      }
    }

    responseMessage += `\n=== TEST COMPLETED ===\n`;
    responseMessage += `Completed at: ${new Date().toISOString()}\n`;
    responseMessage += `\nNext Steps:\n`;
    responseMessage += `1. Check if ecliptic coordinates are now calculated correctly\n`;
    responseMessage += `2. Compare results with JPL Horizons for accuracy validation\n`;
    responseMessage += `3. If successful, implement full ephemeris calculator\n`;

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
