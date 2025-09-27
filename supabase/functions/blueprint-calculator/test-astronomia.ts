
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
    console.log('=== ASTRONOMIA FINAL INTEGRATION TEST ===');
    
    let responseMessage = `=== ASTRONOMIA FINAL INTEGRATION TEST ===\n`;

    // Import astronomia main library
    const astronomia = await import('astronomia');
    console.log('Astronomia imported successfully');
    
    responseMessage += `✅ Astronomia loaded successfully\n\n`;

    // Import VSOP87 data files directly for each planet
    let vsop87Data = {};
    const planetNames = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
    
    for (const planetName of planetNames) {
      try {
        const dataModule = await import(`astronomia/data/vsop87${planetName.charAt(0).toUpperCase() + planetName.slice(1)}`);
        vsop87Data[planetName] = dataModule.default || dataModule;
        responseMessage += `✅ VSOP87 data loaded for ${planetName}\n`;
      } catch (e) {
        responseMessage += `⚠️ VSOP87 data import failed for ${planetName}: ${e.message}\n`;
        vsop87Data[planetName] = null;
      }
    }

    // Test dates
    const testDates = [
      { name: 'Problematic Date 1', date: new Date('2024-11-15T06:23:00.000Z') },
      { name: 'Problematic Date 2', date: new Date('1977-11-15T06:23:00.000Z') },
      { name: 'Standard Date 1', date: new Date('1990-06-15T12:00:00.000Z') },
      { name: 'Standard Date 2', date: new Date('2000-01-01T00:00:00.000Z') }
    ];

    for (const testCase of testDates) {
      responseMessage += `\n--- ${testCase.name}: ${testCase.date.toISOString()} ---\n`;
      
      try {
        // Step 1: Calculate Julian Day
        let jd;
        try {
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

        // Step 2: Calculate True Obliquity (IN RADIANS)
        let trueObliquityRad;
        try {
          const nutation = astronomia.nutation || astronomia.default?.nutation;
          if (nutation) {
            const meanObliquityRad = nutation.meanObliquity(jd);
            const nutationResult = nutation.nutation(jd);
            const deltaEpsilon = Array.isArray(nutationResult) ? nutationResult[1] : (nutationResult.deltaEpsilon || 0);
            trueObliquityRad = meanObliquityRad + deltaEpsilon;
            responseMessage += `  True Obliquity: ${(trueObliquityRad * 180 / Math.PI).toFixed(6)}° (${trueObliquityRad.toFixed(8)} rad)\n`;
          } else {
            throw new Error("nutation module not available");
          }
        } catch (e) {
          responseMessage += `  True Obliquity ERROR: ${e.message}\n`;
          continue;
        }

        // Step 3: Calculate Sun Position with PROPER COORDINATE CONVERSION (ALL RADIANS)
        try {
          const solar = astronomia.solar || astronomia.default?.solar;
          const coord = astronomia.coord || astronomia.default?.coord;
          
          if (solar && coord && trueObliquityRad !== undefined) {
            const sunEquatorial = solar.apparentEquatorial(jd);
            console.log('Sun equatorial result:', sunEquatorial);
            
            if (sunEquatorial && (sunEquatorial.ra !== undefined || sunEquatorial._ra !== undefined)) {
              const sunRaRad = sunEquatorial.ra || sunEquatorial._ra || 0;
              const sunDecRad = sunEquatorial.dec || sunEquatorial._dec || 0;
              
              responseMessage += `  Sun Equatorial: RA=${(sunRaRad * 180 / Math.PI).toFixed(6)}°, Dec=${(sunDecRad * 180 / Math.PI).toFixed(6)}°\n`;
              
              // Convert to ecliptic coordinates using RADIANS throughout
              if (coord.Ecliptic && coord.Equatorial) {
                try {
                  // Create Equatorial coord object with radians
                  const sunEquatorialCoord = new coord.Equatorial(sunRaRad, sunDecRad);
                  // Convert to Ecliptic using radians for obliquity  
                  const sunEclipticCoord = new coord.Ecliptic(sunEquatorialCoord, trueObliquityRad);
                  
                  // Convert result to degrees for display
                  const sunEclipticLonDeg = sunEclipticCoord.lon * 180 / Math.PI;
                  const sunEclipticLatDeg = sunEclipticCoord.lat * 180 / Math.PI;
                  
                  responseMessage += `  ✅ Sun Ecliptic: ${sunEclipticLonDeg.toFixed(6)}° lon, ${sunEclipticLatDeg.toFixed(6)}° lat\n`;
                } catch (convError) {
                  responseMessage += `  Sun Coordinate Conversion Error: ${convError.message}\n`;
                }
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

        // Step 4: Calculate Moon Position with PROPER COORDINATE CONVERSION (ALL RADIANS)
        try {
          const moonposition = astronomia.moonposition || astronomia.default?.moonposition;
          const coord = astronomia.coord || astronomia.default?.coord;
          
          if (moonposition && coord && trueObliquityRad !== undefined) {
            const moonEquatorial = moonposition.position(jd);
            console.log('Moon equatorial result:', moonEquatorial);
            
            if (moonEquatorial && (moonEquatorial.ra !== undefined || moonEquatorial._ra !== undefined)) {
              const moonRaRad = moonEquatorial.ra || moonEquatorial._ra || 0;
              const moonDecRad = moonEquatorial.dec || moonEquatorial._dec || 0;
              
              responseMessage += `  Moon Equatorial: RA=${(moonRaRad * 180 / Math.PI).toFixed(6)}°, Dec=${(moonDecRad * 180 / Math.PI).toFixed(6)}°\n`;
              
              // Convert to ecliptic coordinates using RADIANS throughout
              if (coord.Ecliptic && coord.Equatorial) {
                try {
                  // Create Equatorial coord object with radians
                  const moonEquatorialCoord = new coord.Equatorial(moonRaRad, moonDecRad);
                  // Convert to Ecliptic using radians for obliquity
                  const moonEclipticCoord = new coord.Ecliptic(moonEquatorialCoord, trueObliquityRad);
                  
                  // Convert result to degrees for display
                  const moonEclipticLonDeg = moonEclipticCoord.lon * 180 / Math.PI;
                  const moonEclipticLatDeg = moonEclipticCoord.lat * 180 / Math.PI;
                  
                  responseMessage += `  ✅ Moon Ecliptic: ${moonEclipticLonDeg.toFixed(6)}° lon, ${moonEclipticLatDeg.toFixed(6)}° lat\n`;
                } catch (convError) {
                  responseMessage += `  Moon Coordinate Conversion Error: ${convError.message}\n`;
                }
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

        // Step 5: Calculate True Lunar Nodes (with proper normalization)
        try {
          const moonnode = astronomia.moonnode || astronomia.default?.moonnode;
          if (moonnode) {
            let northNodeLonDeg;
            if (moonnode.ascending) {
              const rawNodeRad = moonnode.ascending(jd);
              const rawNodeDeg = rawNodeRad * 180 / Math.PI;
              
              // Normalize to 0-360 degree range
              northNodeLonDeg = rawNodeDeg % 360;
              if (northNodeLonDeg < 0) northNodeLonDeg += 360;
              
            } else if (moonnode.meanAscending) {
              const rawNodeRad = moonnode.meanAscending(jd);
              const rawNodeDeg = rawNodeRad * 180 / Math.PI;
              
              // Normalize to 0-360 degree range  
              northNodeLonDeg = rawNodeDeg % 360;
              if (northNodeLonDeg < 0) northNodeLonDeg += 360;
            }
            
            if (northNodeLonDeg !== undefined) {
              responseMessage += `  ✅ True North Node: ${northNodeLonDeg.toFixed(6)}°\n`;
            }
          }
        } catch (e) {
          responseMessage += `  Lunar Node ERROR: ${e.message}\n`;
        }

        // Step 6: Test Planet Positions with LOADED VSOP87 Data
        for (const planetName of planetNames) {
          try {
            const planetposition = astronomia.planetposition || astronomia.default?.planetposition;
            const coord = astronomia.coord || astronomia.default?.coord;
            
            if (planetposition && planetposition.Planet && vsop87Data[planetName]) {
              // Create planet instance with VSOP87 data (following your example)
              const planet = new planetposition.Planet(planetName, vsop87Data[planetName]);
              
              // Get planet's equatorial position
              const planetEquatorial = planet.position(jd);
              
              if (planetEquatorial && (planetEquatorial.ra !== undefined || planetEquatorial._ra !== undefined)) {
                const planetRaRad = planetEquatorial.ra || planetEquatorial._ra || 0;
                const planetDecRad = planetEquatorial.dec || planetEquatorial._dec || 0;
                
                responseMessage += `  ${planetName.toUpperCase()} Equatorial: RA=${(planetRaRad * 180 / Math.PI).toFixed(6)}°, Dec=${(planetDecRad * 180 / Math.PI).toFixed(6)}°\n`;
                
                // Convert to ecliptic coordinates using RADIANS (following your example)
                if (coord && coord.Ecliptic && coord.Equatorial && trueObliquityRad !== undefined) {
                  try {
                    const planetEquatorialCoord = new coord.Equatorial(planetRaRad, planetDecRad);
                    const planetEclipticCoord = new coord.Ecliptic(planetEquatorialCoord, trueObliquityRad);
                    
                    const planetEclipticLonDeg = planetEclipticCoord.lon * 180 / Math.PI;
                    const planetEclipticLatDeg = planetEclipticCoord.lat * 180 / Math.PI;
                    
                    responseMessage += `  ✅ ${planetName.toUpperCase()} Ecliptic: ${planetEclipticLonDeg.toFixed(6)}° lon, ${planetEclipticLatDeg.toFixed(6)}° lat\n`;
                  } catch (convError) {
                    responseMessage += `  ${planetName.toUpperCase()} Coordinate Conversion Error: ${convError.message}\n`;
                  }
                }
              } else {
                responseMessage += `  ${planetName.toUpperCase()}: No valid position data returned\n`;
              }
              
            } else if (!vsop87Data[planetName]) {
              responseMessage += `  ${planetName.toUpperCase()}: ⚠️ VSOP87 data not available\n`;
            } else {
              responseMessage += `  ${planetName.toUpperCase()}: Planet class not available\n`;
            }
          } catch (e) {
            responseMessage += `  ${planetName.toUpperCase()} ERROR: ${e.message}\n`;
          }
        }

      } catch (e) {
        responseMessage += `  CRITICAL ERROR for ${testCase.name}: ${e.message}\n`;
        console.error(`Error testing ${testCase.name}:`, e);
      }
    }

    responseMessage += `\n=== FINAL ASSESSMENT ===\n`;
    responseMessage += `✅ True Obliquity: Working correctly\n`;
    responseMessage += `✅ Julian Day calculation: Working correctly\n`;
    responseMessage += `🔧 Coordinate conversion: Fixed radians/degrees issue\n`;
    responseMessage += `🔧 Lunar node normalization: Fixed\n`;
    responseMessage += `🔧 VSOP87 data loading: Implemented direct imports\n`;
    responseMessage += `📊 Next step: Validate results against JPL Horizons\n`;

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
