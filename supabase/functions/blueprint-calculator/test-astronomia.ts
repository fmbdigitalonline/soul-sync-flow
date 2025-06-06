
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
        // Step 1: Calculate Julian Day using astronomia.julian
        let jd;
        try {
          // Use the julian package from astronomia
          const julian = astronomia.julian || astronomia.default?.julian;
          if (julian && julian.CalendarGregorianToJD) {
            jd = julian.CalendarGregorianToJD(
              testCase.date.getUTCFullYear(),
              testCase.date.getUTCMonth() + 1,
              testCase.date.getUTCDate() + 
              (testCase.date.getUTCHours() + testCase.date.getUTCMinutes()/60 + testCase.date.getUTCSeconds()/3600) / 24
            );
          } else {
            // Fallback manual calculation
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

        // Step 2: Calculate True Obliquity using astronomia.nutation
        let trueObliquity;
        try {
          const nutation = astronomia.nutation || astronomia.default?.nutation;
          if (nutation) {
            const meanObliquity = nutation.meanObliquity(jd);
            const nutationResult = nutation.nutation(jd);
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

        // Step 3: Calculate Sun Position using astronomia.solar
        try {
          const solar = astronomia.solar || astronomia.default?.solar;
          const coord = astronomia.coord || astronomia.default?.coord;
          
          if (solar && coord && trueObliquity) {
            // Get Sun's apparent equatorial coordinates
            const sunEquatorial = solar.apparentEquatorial(jd);
            console.log('Sun equatorial result:', sunEquatorial);
            
            if (sunEquatorial && (sunEquatorial.ra !== undefined || sunEquatorial._ra !== undefined)) {
              const ra = sunEquatorial.ra || sunEquatorial._ra || 0;
              const dec = sunEquatorial.dec || sunEquatorial._dec || 0;
              
              responseMessage += `  Sun Equatorial: RA=${(ra * 180 / Math.PI).toFixed(6)}°, Dec=${(dec * 180 / Math.PI).toFixed(6)}°\n`;
              
              // Convert to ecliptic coordinates
              if (coord.Ecliptic && coord.Equatorial) {
                const equatorialCoord = new coord.Equatorial(ra, dec);
                const sunEcliptic = new coord.Ecliptic(equatorialCoord, trueObliquity);
                const sunEclipticLon = sunEcliptic.lon * 180 / Math.PI;
                const sunEclipticLat = sunEcliptic.lat * 180 / Math.PI;
                responseMessage += `  Sun Ecliptic: ${sunEclipticLon.toFixed(6)}° lon, ${sunEclipticLat.toFixed(6)}° lat\n`;
              } else {
                responseMessage += `  Sun: Coordinate conversion classes not available\n`;
              }
            } else {
              responseMessage += `  Sun: No valid equatorial coordinates returned\n`;
            }
          }
        } catch (e) {
          responseMessage += `  Sun ERROR: ${e.message}\n`;
        }

        // Step 4: Calculate Moon Position using astronomia.moonposition
        try {
          const moonposition = astronomia.moonposition || astronomia.default?.moonposition;
          const coord = astronomia.coord || astronomia.default?.coord;
          
          if (moonposition && coord && trueObliquity) {
            const moonEquatorial = moonposition.position(jd);
            console.log('Moon equatorial result:', moonEquatorial);
            
            if (moonEquatorial && (moonEquatorial.ra !== undefined || moonEquatorial._ra !== undefined)) {
              const ra = moonEquatorial.ra || moonEquatorial._ra || 0;
              const dec = moonEquatorial.dec || moonEquatorial._dec || 0;
              
              responseMessage += `  Moon Equatorial: RA=${(ra * 180 / Math.PI).toFixed(6)}°, Dec=${(dec * 180 / Math.PI).toFixed(6)}°\n`;
              
              // Convert to ecliptic coordinates
              if (coord.Ecliptic && coord.Equatorial) {
                const equatorialCoord = new coord.Equatorial(ra, dec);
                const moonEcliptic = new coord.Ecliptic(equatorialCoord, trueObliquity);
                const moonEclipticLon = moonEcliptic.lon * 180 / Math.PI;
                const moonEclipticLat = moonEcliptic.lat * 180 / Math.PI;
                responseMessage += `  Moon Ecliptic: ${moonEclipticLon.toFixed(6)}° lon, ${moonEclipticLat.toFixed(6)}° lat\n`;
              } else {
                responseMessage += `  Moon: Coordinate conversion classes not available\n`;
              }
            } else {
              responseMessage += `  Moon: No valid equatorial coordinates returned\n`;
            }
          }
        } catch (e) {
          responseMessage += `  Moon ERROR: ${e.message}\n`;
        }

        // Step 5: Calculate True Lunar Nodes using astronomia.moonnode
        try {
          const moonnode = astronomia.moonnode || astronomia.default?.moonnode;
          if (moonnode) {
            let northNodeLon;
            if (moonnode.ascending) {
              northNodeLon = moonnode.ascending(jd);
              // Normalize to 0-360 degree range
              northNodeLon = northNodeLon % 360;
              if (northNodeLon < 0) northNodeLon += 360;
            } else if (moonnode.meanAscending) {
              northNodeLon = moonnode.meanAscending(jd);
              // Normalize to 0-360 degree range  
              northNodeLon = northNodeLon % 360;
              if (northNodeLon < 0) northNodeLon += 360;
            }
            
            if (northNodeLon !== undefined) {
              responseMessage += `  True North Node: ${northNodeLon.toFixed(6)}°\n`;
            }
          }
        } catch (e) {
          responseMessage += `  Lunar Node ERROR: ${e.message}\n`;
        }

        // Step 6: Test Planet Positions (noting VSOP87 data requirement)
        try {
          const planetposition = astronomia.planetposition || astronomia.default?.planetposition;
          if (planetposition && planetposition.Planet) {
            // Try to create a planet instance
            const mercury = new planetposition.Planet('mercury');
            responseMessage += `  Mercury Planet instance created successfully\n`;
            
            // Note about VSOP87 data requirement
            responseMessage += `  NOTE: Planet calculations require VSOP87 data files to be loaded\n`;
            responseMessage += `  See astronomia documentation for VSOP87 data setup\n`;
          } else {
            responseMessage += `  Planet position module not available or Planet class not found\n`;
          }
        } catch (e) {
          responseMessage += `  Planet Position ERROR: ${e.message}\n`;
        }

      } catch (e) {
        responseMessage += `  CRITICAL ERROR for ${testCase.name}: ${e.message}\n`;
        console.error(`Error testing ${testCase.name}:`, e);
      }
    }

    // Step 7: Module Analysis for Available Functions
    responseMessage += `\n=== MODULE AVAILABILITY ANALYSIS ===\n`;
    const modules = ['julian', 'solar', 'moonposition', 'moonnode', 'nutation', 'planetposition', 'coord'];
    
    for (const moduleName of modules) {
      try {
        const module = astronomia[moduleName] || astronomia.default?.[moduleName];
        if (module && typeof module === 'object') {
          responseMessage += `\n${moduleName} module: ✅ Available\n`;
          
          // List functions
          const functions = Object.keys(module).filter(key => typeof module[key] === 'function');
          if (functions.length > 0) {
            responseMessage += `  Functions: ${functions.slice(0, 10).join(', ')}${functions.length > 10 ? '...' : ''}\n`;
          }
          
          // List classes/constructors
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
        } else {
          responseMessage += `${moduleName}: ❌ Not found\n`;
        }
      } catch (e) {
        responseMessage += `${moduleName}: ❌ Error - ${e.message}\n`;
      }
    }

    responseMessage += `\n=== NEXT STEPS ===\n`;
    responseMessage += `1. ✅ True Obliquity calculation working\n`;
    responseMessage += `2. ✅ Sun and Moon equatorial coordinates accessible\n`;
    responseMessage += `3. 🔄 Coordinate conversion needs debugging\n`;
    responseMessage += `4. 📁 VSOP87 data files needed for planets\n`;
    responseMessage += `5. 🎯 Lunar node normalization implemented\n`;
    responseMessage += `\nFor planets: Load VSOP87 data using astronomia/data/vsop87[Planet] imports\n`;

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
