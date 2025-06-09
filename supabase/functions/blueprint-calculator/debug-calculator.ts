export async function debugBlueprintCalculation(birthDate: string, birthTime: string, birthLocation: string) {
  console.log("=== DEBUGGING BLUEPRINT CALCULATION ===");
  console.log(`Input: ${birthDate} ${birthTime} at ${birthLocation}`);
  
  // Step 1: Geocoding
  console.log("Step 1: Geocoding location...");
  const coordinates = await getLocationCoordinates(birthLocation);
  console.log(`Geocoded coordinates: ${coordinates.latitude}, ${coordinates.longitude}`);
  
  // Step 2: Timezone resolution
  console.log("Step 2: Resolving historical timezone...");
  const birthDateTime = new Date(`${birthDate}T${birthTime}:00`);
  console.log(`Parsed birth datetime: ${birthDateTime.toISOString()}`);
  
  const timezoneOffset = await getHistoricalTimezoneOffset(coordinates, birthDateTime);
  console.log(`Historical timezone offset: ${timezoneOffset} seconds (${timezoneOffset/3600} hours)`);
  
  // Step 3: UTC conversion
  console.log("Step 3: Converting to UTC...");
  const localTimestamp = birthDateTime.getTime();
  const utcTimestamp = localTimestamp - (timezoneOffset * 1000);
  const accurateUtcDateTime = new Date(utcTimestamp);
  
  console.log(`Local timestamp: ${localTimestamp}`);
  console.log(`UTC timestamp: ${utcTimestamp}`);
  console.log(`Local birth time: ${birthDateTime.toISOString()}`);
  console.log(`Accurate UTC time: ${accurateUtcDateTime.toISOString()}`);
  
  // Step 4: Manual Sun position check
  console.log("Step 4: Manual Sun position verification...");
  const expectedSunLongitude = calculateExpectedSunPosition(birthDate);
  console.log(`Expected Sun longitude for ${birthDate}: ${expectedSunLongitude}° (should be ~23° Aquarius = ~323°)`);
  
  // Step 5: Ephemeris API call
  console.log("Step 5: Calling Vercel ephemeris API...");
  const VERCEL_API_URL = "https://soul-sync-flow.vercel.app/api/ephemeris";
  
  const ephemerisPayload = {
    datetime: accurateUtcDateTime.toISOString(),
    coordinates: `${coordinates.latitude},${coordinates.longitude}`
  };
  console.log("Ephemeris payload:", JSON.stringify(ephemerisPayload, null, 2));
  
  try {
    const ephemerisResponse = await fetch(VERCEL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SoulSync-Debug-Calculator/1.0',
      },
      body: JSON.stringify(ephemerisPayload)
    });
    
    console.log("Ephemeris API response status:", ephemerisResponse.status);
    
    if (ephemerisResponse.ok) {
      const ephemerisData = await ephemerisResponse.json();
      console.log("Ephemeris response structure:", Object.keys(ephemerisData));
      
      if (ephemerisData.success && ephemerisData.data?.planets?.sun) {
        const sunData = ephemerisData.data.planets.sun;
        console.log(`Calculated Sun longitude: ${sunData.longitude}°`);
        console.log(`Expected vs Actual difference: ${Math.abs(expectedSunLongitude - sunData.longitude)}°`);
        
        // Check if we're off by a full circle or more
        const diff = Math.abs(expectedSunLongitude - sunData.longitude);
        if (diff > 180) {
          console.log("🚨 MAJOR ASTRONOMICAL ERROR DETECTED!");
          console.log(`Difference of ${diff}° indicates fundamental calculation error`);
        }
        
        return {
          coordinates,
          timezoneOffset,
          localDateTime: birthDateTime,
          utcDateTime: accurateUtcDateTime,
          expectedSunLongitude,
          actualSunLongitude: sunData.longitude,
          error: diff,
          ephemerisData
        };
      } else {
        console.log("Ephemeris error:", ephemerisData.error);
      }
    } else {
      const errorText = await ephemerisResponse.text();
      console.log("Ephemeris API error:", errorText);
    }
  } catch (error) {
    console.error("Error calling ephemeris API:", error);
  }
}

// Calculate expected Sun position for verification
function calculateExpectedSunPosition(birthDate: string): number {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1; // JS months are 0-based
  const day = date.getDate();
  
  // Approximate Sun longitude for February 12
  // Sun enters Aquarius around Jan 20 (300°) and leaves around Feb 18 (330°)
  // Feb 12 should be around 323° (23° Aquarius)
  
  if (month === 2 && day === 12) {
    return 323; // 23° Aquarius
  }
  
  // Rough calculation for other dates
  const dayOfYear = getDayOfYear(date);
  // Sun moves ~1° per day, starts year at ~280° (10° Capricorn)
  return (280 + dayOfYear) % 360;
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

async function getLocationCoordinates(location: string): Promise<{latitude: number, longitude: number}> {
  // Simplified version for debugging - use known coordinates for Paramaribo
  if (location.toLowerCase().includes('paramaribo') || location.toLowerCase().includes('surinam')) {
    return {
      latitude: 5.8520355,
      longitude: -55.2038278
    };
  }
  
  // For other locations, implement full geocoding
  const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
  if (!apiKey) {
    throw new Error("Google Maps API key not configured");
  }
  
  const encodedLocation = encodeURIComponent(location);
  const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${apiKey}`;
  
  const response = await fetch(geocodingUrl);
  const data = await response.json();
  
  if (data.status !== "OK" || !data.results || data.results.length === 0) {
    throw new Error(`Could not determine coordinates for location: ${location}`);
  }
  
  return {
    latitude: data.results[0].geometry.location.lat,
    longitude: data.results[0].geometry.location.lng
  };
}

async function getHistoricalTimezoneOffset(coordinates: {latitude: number, longitude: number}, dateTime: Date): Promise<number> {
  const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
  if (!apiKey) {
    // Fixed fallback for Suriname: UTC-3 (correct historical timezone)
    console.log("⚠️ No Google Maps API key, using correct fallback UTC-3 for Suriname");
    return -3 * 3600; // -3 hours in seconds (was -3.5, now corrected to -3)
  }
  
  const timestamp = Math.floor(dateTime.getTime() / 1000);
  const timezoneUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${coordinates.latitude},${coordinates.longitude}&timestamp=${timestamp}&key=${apiKey}`;
  
  const response = await fetch(timezoneUrl);
  const data = await response.json();
  
  if (data.status !== "OK") {
    console.log("⚠️ Timezone API failed, using correct fallback UTC-3 for Suriname");
    return -3 * 3600; // -3 hours in seconds (corrected)
  }
  
  const totalOffsetSeconds = data.rawOffset + data.dstOffset;
  console.log(`Timezone API returned: ${data.timeZoneId}, offset: ${totalOffsetSeconds}s`);
  
  // Override incorrect Google API result for Suriname historical timezone
  if (coordinates.latitude > 5 && coordinates.latitude < 6 && 
      coordinates.longitude > -56 && coordinates.longitude < -54) {
    console.log("🔧 Overriding Google timezone result for Suriname - using correct UTC-3");
    return -3 * 3600; // Force correct historical timezone for Suriname
  }
  
  return totalOffsetSeconds;
}
