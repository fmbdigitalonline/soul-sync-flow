
/**
 * Ephemeris calculation module for Blueprint Calculator
 * Handles planetary position calculations with proper timezone support
 */

// Timezone mapping for locations that might not be readily available in standard libraries
const TIMEZONE_MAPPING: Record<string, string> = {
  "Paramaribo/Surinam": "America/Paramaribo", // UTC-3
  "Paramaribo/Suriname": "America/Paramaribo", // Alternative spelling
  "Surinam": "America/Paramaribo",
  "Suriname": "America/Paramaribo",
  // Add more mappings as needed
};

// Offset mapping for locations when specific timezone info is not available
// Values are in hours from UTC
const TIMEZONE_OFFSETS: Record<string, number> = {
  "Paramaribo/Surinam": -3,
  "Paramaribo/Suriname": -3,
  "Surinam": -3,
  "Suriname": -3,
  // Add more as needed, especially for locations with half-hour offsets
  "India": 5.5,
  "Sri Lanka": 5.5,
  "Nepal": 5.75,
  "Iran": 3.5,
  "Afghanistan": 4.5,
  "Myanmar": 6.5,
  "Australia/Adelaide": 9.5,
  "Australia/Darwin": 9.5,
};

/**
 * Calculate planetary positions for a given date, time and location
 * @param date Birth date in YYYY-MM-DD format
 * @param time Birth time in HH:MM format
 * @param location Birth location as City/Country
 * @param timezone Timezone of birth location
 * @returns Object containing planetary positions
 */
export async function calculatePlanetaryPositions(date: string, time: string, location: string, timezone: string) {
  console.log(`Calculating planetary positions for ${date} ${time} at ${location} in timezone ${timezone}`);
  
  try {
    // Parse the date and time
    const birthDate = new Date(`${date}T${time}`);
    
    // Adjust for timezone based on location - essential for accurate calculations
    const adjustedDate = applyTimezoneOffset(birthDate, location, timezone);
    console.log(`Birth time adjusted for timezone: ${adjustedDate.toISOString()}`);
    
    // Placeholder for Swiss Ephemeris calculations
    // In a real implementation, this would use a Swiss Ephemeris library
    // For now, we'll generate deterministic but realistic results
    
    // Generate celestial body positions
    const sun = calculateSunPosition(adjustedDate);
    const moon = calculateMoonPosition(adjustedDate);
    const mercury = calculatePlanetPosition(adjustedDate, "Mercury");
    const venus = calculatePlanetPosition(adjustedDate, "Venus");
    const mars = calculatePlanetPosition(adjustedDate, "Mars");
    const jupiter = calculatePlanetPosition(adjustedDate, "Jupiter");
    const saturn = calculatePlanetPosition(adjustedDate, "Saturn");
    const uranus = calculatePlanetPosition(adjustedDate, "Uranus");
    const neptune = calculatePlanetPosition(adjustedDate, "Neptune");
    const pluto = calculatePlanetPosition(adjustedDate, "Pluto");
    
    // Calculate ascendant and houses
    const { ascendant, houses } = calculateAscendantAndHouses(adjustedDate, location);
    
    return {
      sun,
      moon,
      mercury,
      venus,
      mars,
      jupiter,
      saturn,
      uranus,
      neptune,
      pluto,
      ascendant,
      houses
    };
  } catch (error) {
    console.error("Error calculating planetary positions:", error);
    throw error; // Rethrow to see what's going wrong
  }
}

/**
 * Apply timezone offset to a date based on location
 * @param date Date object to adjust
 * @param location Location string (City/Country)
 * @param timezone Timezone string
 * @returns Adjusted Date object
 */
function applyTimezoneOffset(date: Date, location: string, timezone: string): Date {
  // Create a copy of the date to avoid modifying the original
  const adjustedDate = new Date(date.getTime());
  
  try {
    // Check if we have a specific mapping for this location
    const mappedTimezone = TIMEZONE_MAPPING[location];
    if (mappedTimezone) {
      console.log(`Found timezone mapping for ${location}: ${mappedTimezone}`);
      
      // If we had Intl.DateTimeFormat with timeZone support in Deno, we would use:
      // const formatter = new Intl.DateTimeFormat('en-US', { timeZone: mappedTimezone });
      // But since we're limited, we'll use our offset mapping
      
      const offset = TIMEZONE_OFFSETS[location];
      if (offset !== undefined) {
        // Calculate offset in milliseconds
        const offsetMs = offset * 60 * 60 * 1000;
        
        // Adjust the date by the offset
        const utcMs = date.getTime() + date.getTimezoneOffset() * 60 * 1000;
        adjustedDate.setTime(utcMs + offsetMs);
        
        console.log(`Applied timezone offset of ${offset} hours for ${location}`);
      }
    } else if (timezone) {
      // If timezone is provided directly, try to use it
      console.log(`Using provided timezone: ${timezone}`);
      
      // Parse the timezone offset if it's in +/-XX:XX format
      const timezoneMatch = timezone.match(/([+-])(\d{1,2}):?(\d{2})?/);
      if (timezoneMatch) {
        const sign = timezoneMatch[1] === '+' ? 1 : -1;
        const hours = parseInt(timezoneMatch[2], 10);
        const minutes = timezoneMatch[3] ? parseInt(timezoneMatch[3], 10) : 0;
        const offset = sign * (hours + minutes / 60);
        
        // Calculate offset in milliseconds
        const offsetMs = offset * 60 * 60 * 1000;
        
        // Adjust the date by the offset
        const utcMs = date.getTime() + date.getTimezoneOffset() * 60 * 1000;
        adjustedDate.setTime(utcMs + offsetMs);
        
        console.log(`Applied parsed timezone offset of ${offset} hours from '${timezone}'`);
      }
    }
    
    return adjustedDate;
  } catch (error) {
    console.error(`Error applying timezone offset for ${location}:`, error);
    return date; // Return the original date if there's an error
  }
}

/**
 * Calculate sun position for a given date
 * @param date Date to calculate for
 * @returns Sun position object
 */
function calculateSunPosition(date: Date) {
  // In a real implementation, this would use Swiss Ephemeris
  // For now, create a deterministic but realistic position based on the date
  
  // The sun moves approximately 1 degree per day through the zodiac
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (24 * 60 * 60 * 1000));
  
  // Calculate the sun's position (approximate)
  const longitude = (dayOfYear * 0.98561) % 360;
  
  return {
    longitude,
    latitude: 0, // The sun's path is close to the ecliptic
    house: Math.floor(longitude / 30) + 1,
    sign: Math.floor(longitude / 30) % 12,
    retrograde: false // The sun is never retrograde from Earth's perspective
  };
}

/**
 * Calculate moon position for a given date
 * @param date Date to calculate for
 * @returns Moon position object
 */
function calculateMoonPosition(date: Date) {
  // The moon moves approximately 13 degrees per day
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (24 * 60 * 60 * 1000));
  const hourOfDay = date.getHours() + date.getMinutes() / 60;
  
  // Calculate the moon's position (approximate)
  const longitude = (dayOfYear * 13.1763 + hourOfDay * 0.55) % 360;
  
  return {
    longitude,
    latitude: Math.sin(longitude * 0.0174533) * 5, // Moon's path can deviate from the ecliptic
    house: Math.floor(longitude / 30) + 1,
    sign: Math.floor(longitude / 30) % 12,
    retrograde: false // For simplicity, we're not calculating retrogrades accurately
  };
}

/**
 * Calculate position for other planets
 * @param date Date to calculate for
 * @param planet Planet name
 * @returns Planet position object
 */
function calculatePlanetPosition(date: Date, planet: string) {
  // Different base speeds for different planets
  const speeds: Record<string, number> = {
    "Mercury": 4.09,
    "Venus": 1.60,
    "Mars": 0.52,
    "Jupiter": 0.08,
    "Saturn": 0.03,
    "Uranus": 0.01,
    "Neptune": 0.006,
    "Pluto": 0.004
  };
  
  const baseSpeed = speeds[planet] || 1;
  
  // Create a deterministic but realistic position based on the date
  const daysSinceEpoch = Math.floor(date.getTime() / (24 * 60 * 60 * 1000));
  
  // Each planet gets a different starting point to avoid them all being in the same place
  const planetIndex = ["Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"].indexOf(planet);
  const startingOffset = planetIndex * 45; // Each planet starts 45° apart
  
  // Calculate position
  const longitude = (startingOffset + daysSinceEpoch * baseSpeed) % 360;
  
  // Mercury and Venus can be retrograde about 20% of the time
  // Outer planets are retrograde based on their distance from the sun
  const retrogradeLikelihood: Record<string, number> = {
    "Mercury": 0.2,
    "Venus": 0.2,
    "Mars": 0.15,
    "Jupiter": 0.3,
    "Saturn": 0.35,
    "Uranus": 0.4,
    "Neptune": 0.4,
    "Pluto": 0.45
  };
  
  // Deterministic retrograde calculation
  const retrogradeHash = (daysSinceEpoch + planetIndex) % 100;
  const retrograde = retrogradeHash < (retrogradeLikelihood[planet] || 0) * 100;
  
  return {
    longitude,
    latitude: Math.sin(longitude * 0.0174533 + planetIndex) * 2, // Small deviation from ecliptic
    house: Math.floor(longitude / 30) + 1,
    sign: Math.floor(longitude / 30) % 12,
    retrograde
  };
}

/**
 * Calculate ascendant and houses for a given date and location
 * @param date Date to calculate for
 * @param location Location string
 * @returns Object containing ascendant and houses
 */
function calculateAscendantAndHouses(date: Date, location: string) {
  // In a real implementation, this would use proper astronomical formulas
  // For now, create a deterministic but realistic result
  
  // The ascendant moves through all 12 signs in 24 hours (15 degrees per hour)
  const hourOfDay = date.getHours() + date.getMinutes() / 60;
  
  // Calculate approximate ascendant (simplistic - real calculation needs latitude)
  const longitude = (hourOfDay * 15) % 360;
  
  // Create a basic house system (equal houses for simplicity)
  const houses = Array.from({ length: 12 }, (_, i) => ({
    cusp: (longitude + i * 30) % 360,
    sign: Math.floor((longitude + i * 30) / 30) % 12
  }));
  
  return {
    ascendant: {
      longitude,
      sign: Math.floor(longitude / 30) % 12
    },
    houses
  };
}
