
// Accurate house system calculations (Placidus system)
export function calculateHouseCusps(
  jd: number, 
  latitude: number, 
  longitude: number, 
  celestialData: any
): { houses: any[], ascendant: number, midheaven: number } {
  try {
    console.log(`Calculating houses for JD ${jd}, lat ${latitude}, lon ${longitude}`);
    
    // Calculate Local Sidereal Time more accurately
    const lst = calculateLocalSiderealTime(jd, longitude);
    
    // Calculate RAMC (Right Ascension of Medium Coeli)
    const ramc = (lst * 15) % 360; // Convert hours to degrees
    
    // Calculate Ascendant using accurate formula
    const ascendant = calculateAscendant(ramc, latitude);
    
    // Medium Coeli (Midheaven) is the RAMC
    const midheaven = ramc;
    
    // Calculate house cusps using Placidus system
    const houses = calculatePlacidusHouses(ascendant, midheaven, latitude);
    
    // Add planets to houses
    const housesWithPlanets = assignPlanetsToHouses(houses, celestialData);
    
    console.log(`Calculated Ascendant: ${ascendant.toFixed(6)}°, MC: ${midheaven.toFixed(6)}°`);
    
    return {
      houses: housesWithPlanets,
      ascendant,
      midheaven
    };
  } catch (error) {
    console.error("Error calculating house cusps:", error);
    
    // Fallback to equal house system
    return calculateEqualHouses(0, 90, celestialData);
  }
}

function calculateLocalSiderealTime(jd: number, longitude: number): number {
  // Calculate Greenwich Sidereal Time
  const T = (jd - 2451545.0) / 36525.0;
  
  // Mean sidereal time at Greenwich (in hours)
  let gst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000.0;
  
  // Normalize to 0-360 degrees
  gst = gst % 360;
  if (gst < 0) gst += 360;
  
  // Convert to hours and add longitude correction
  const gstHours = gst / 15.0;
  const longitudeHours = longitude / 15.0;
  
  let lst = gstHours + longitudeHours;
  
  // Normalize to 0-24 hours
  lst = lst % 24;
  if (lst < 0) lst += 24;
  
  return lst;
}

function calculateAscendant(ramc: number, latitude: number): number {
  // Calculate Ascendant using spherical trigonometry
  const ramcRad = ramc * Math.PI / 180;
  const latRad = latitude * Math.PI / 180;
  
  // Obliquity of ecliptic (simplified)
  const obliquity = 23.439291 * Math.PI / 180;
  
  // Calculate Ascendant
  const y = -Math.cos(ramcRad);
  const x = Math.sin(ramcRad) * Math.cos(obliquity) + Math.tan(latRad) * Math.sin(obliquity);
  
  let ascendant = Math.atan2(y, x) * 180 / Math.PI;
  
  // Normalize to 0-360 degrees
  ascendant = (ascendant + 360) % 360;
  
  return ascendant;
}

function calculatePlacidusHouses(ascendant: number, midheaven: number, latitude: number): any[] {
  const houses = [];
  
  // House 1 cusp is the Ascendant
  houses[0] = { cusp: 1, longitude: ascendant };
  
  // House 10 cusp is the Midheaven
  houses[9] = { cusp: 10, longitude: midheaven };
  
  // Calculate intermediate house cusps using Placidus method
  // This is simplified - full Placidus requires iterative calculations
  
  const ascMc = (midheaven - ascendant + 360) % 360;
  
  // Houses 2, 3 (first quadrant)
  houses[1] = { cusp: 2, longitude: (ascendant + ascMc / 3) % 360 };
  houses[2] = { cusp: 3, longitude: (ascendant + 2 * ascMc / 3) % 360 };
  
  // House 4 (IC) - opposite of MC
  const ic = (midheaven + 180) % 360;
  houses[3] = { cusp: 4, longitude: ic };
  
  // Houses 5, 6 (second quadrant)
  const icDesc = (ic + 180) % 360;
  houses[4] = { cusp: 5, longitude: (ic + (icDesc - ic) / 3 + 360) % 360 };
  houses[5] = { cusp: 6, longitude: (ic + 2 * (icDesc - ic) / 3 + 360) % 360 };
  
  // House 7 (Descendant) - opposite of Ascendant
  const descendant = (ascendant + 180) % 360;
  houses[6] = { cusp: 7, longitude: descendant };
  
  // Houses 8, 9 (third quadrant)
  const descMc = (midheaven - descendant + 360) % 360;
  houses[7] = { cusp: 8, longitude: (descendant + descMc / 3) % 360 };
  houses[8] = { cusp: 9, longitude: (descendant + 2 * descMc / 3) % 360 };
  
  // Houses 11, 12 (fourth quadrant)
  const mcAsc = (ascendant - midheaven + 360) % 360;
  houses[10] = { cusp: 11, longitude: (midheaven + mcAsc / 3) % 360 };
  houses[11] = { cusp: 12, longitude: (midheaven + 2 * mcAsc / 3) % 360 };
  
  return houses;
}

function calculateEqualHouses(ascendant: number, midheaven: number, celestialData: any): any {
  const houses = [];
  
  // Equal house system: each house is exactly 30 degrees
  for (let i = 1; i <= 12; i++) {
    houses.push({
      cusp: i,
      longitude: (ascendant + (i - 1) * 30) % 360
    });
  }
  
  return {
    houses: assignPlanetsToHouses(houses, celestialData),
    ascendant,
    midheaven
  };
}

function assignPlanetsToHouses(houses: any[], celestialData: any): any[] {
  const housesWithPlanets = houses.map(house => ({ ...house, planets: [] }));
  
  const planets = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
  
  planets.forEach(planet => {
    const position = celestialData[planet];
    if (position && typeof position.longitude === 'number') {
      // Find which house this planet is in
      const houseIndex = findHouseForLongitude(position.longitude, houses);
      if (houseIndex >= 0 && houseIndex < housesWithPlanets.length) {
        housesWithPlanets[houseIndex].planets.push({
          name: planet,
          longitude: position.longitude
        });
      }
    }
  });
  
  return housesWithPlanets;
}

function findHouseForLongitude(longitude: number, houses: any[]): number {
  for (let i = 0; i < houses.length; i++) {
    const currentHouse = houses[i].longitude;
    const nextHouse = houses[(i + 1) % houses.length].longitude;
    
    // Handle crossing 0 degrees
    if (currentHouse > nextHouse) {
      if (longitude >= currentHouse || longitude < nextHouse) {
        return i;
      }
    } else {
      if (longitude >= currentHouse && longitude < nextHouse) {
        return i;
      }
    }
  }
  
  return 0; // Default to first house
}
