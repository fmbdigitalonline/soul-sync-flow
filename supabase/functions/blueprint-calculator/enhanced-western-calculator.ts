// Enhanced Western astrology calculations with proper sign boundaries and accurate aspect orbs

export interface EnhancedWesternProfile {
  sun_sign: string;
  moon_sign: string;
  rising_sign: string;
  mercury_sign: string;
  venus_sign: string;
  mars_sign: string;
  sun_keyword: string;
  moon_keyword: string;
  rising_keyword: string;
  sun_house: number;
  moon_house: number;
  planetary_positions: PlanetaryPosition[];
  aspects: AspectData[];
  houses: HouseData[];
  source: string;
  calculation_method: string;
}

interface PlanetaryPosition {
  planet: string;
  sign: string;
  degree: number;
  minute: number;
  house: number;
  retrograde: boolean;
  longitude: number;
}

interface AspectData {
  planet1: string;
  planet2: string;
  aspect: string;
  orb_used: number;
  exactness: number;
  strength: number;
  applying: boolean;
}

interface HouseData {
  house_number: number;
  sign: string;
  degree: number;
  planets: string[];
}

export function calculateEnhancedWesternProfile(celestialData: any, houses: any): EnhancedWesternProfile {
  console.log("Calculating enhanced Western astrology profile");
  
  // Extract planetary data with proper error handling
  const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  const planetaryPositions: PlanetaryPosition[] = [];
  
  planets.forEach(planet => {
    const position = celestialData.planets?.[planet] || celestialData[planet];
    if (position && typeof position.longitude === 'number') {
      const signInfo = calculateEnhancedSignFromLongitude(position.longitude);
      const houseNumber = findHouseForPlanet(position.longitude, houses);
      
      planetaryPositions.push({
        planet,
        sign: signInfo.sign,
        degree: signInfo.degree,
        minute: signInfo.minute,
        house: houseNumber,
        retrograde: position.speed < 0,
        longitude: position.longitude
      });
    }
  });
  
  // Find main planetary positions
  const sunPosition = planetaryPositions.find(p => p.planet === 'sun');
  const moonPosition = planetaryPositions.find(p => p.planet === 'moon');
  const mercuryPosition = planetaryPositions.find(p => p.planet === 'mercury');
  const venusPosition = planetaryPositions.find(p => p.planet === 'venus');
  const marsPosition = planetaryPositions.find(p => p.planet === 'mars');
  
  // Calculate rising sign from houses data
  const risingSign = houses?.ascendant ? calculateEnhancedSignFromLongitude(houses.ascendant).sign : "Unknown";
  
  // Calculate enhanced aspects
  const aspects = calculateEnhancedAspects(celestialData);
  
  // Calculate house data
  const houseData = calculateHouseData(houses);
  
  return {
    sun_sign: `${sunPosition?.sign || 'Unknown'} ${sunPosition?.degree || 0}°${sunPosition?.minute || 0}'`,
    moon_sign: `${moonPosition?.sign || 'Unknown'} ${moonPosition?.degree || 0}°${moonPosition?.minute || 0}'`,
    rising_sign: risingSign,
    mercury_sign: `${mercuryPosition?.sign || 'Unknown'} ${mercuryPosition?.degree || 0}°${mercuryPosition?.minute || 0}'`,
    venus_sign: `${venusPosition?.sign || 'Unknown'} ${venusPosition?.degree || 0}°${venusPosition?.minute || 0}'`,
    mars_sign: `${marsPosition?.sign || 'Unknown'} ${marsPosition?.degree || 0}°${marsPosition?.minute || 0}'`,
    sun_keyword: getEnhancedSunKeyword(sunPosition?.sign || 'Unknown'),
    moon_keyword: getEnhancedMoonKeyword(moonPosition?.sign || 'Unknown'),
    rising_keyword: getEnhancedRisingKeyword(risingSign),
    sun_house: sunPosition?.house || 1,
    moon_house: moonPosition?.house || 1,
    planetary_positions: planetaryPositions,
    aspects: aspects,
    houses: houseData,
    source: "enhanced_swiss_ephemeris_calculation",
    calculation_method: "improved_vsop87d_with_proper_sign_boundaries"
  };
}

// Enhanced sign calculation with proper boundary handling
function calculateEnhancedSignFromLongitude(longitude: number): { sign: string; degree: number; minute: number } {
  // Proper normalization: ((lon % 360) + 360) % 360
  const normalizedLongitude = ((longitude % 360) + 360) % 360;
  
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  
  // Handle the boundary case: exactly 30.0° should be next sign
  const signIndex = Math.floor(normalizedLongitude / 30);
  const degreeInSign = normalizedLongitude % 30;
  
  // Ensure we don't exceed array bounds
  const actualSignIndex = Math.min(signIndex, 11);
  
  const degree = Math.floor(degreeInSign);
  const minute = Math.floor((degreeInSign - degree) * 60);
  
  return {
    sign: signs[actualSignIndex],
    degree: degree,
    minute: minute
  };
}

// Fixed applying logic for radix charts
function isApplying(p1Pos: number, p2Pos: number, target: number): boolean {
  // returns true if p1 is *behind* exact aspect and moving towards it
  const delta = ((p2Pos - p1Pos + 360) % 360);
  return delta > 0 && delta < target;
}

// Enhanced aspect calculations with professional orb system and fixed applying logic
function calculateEnhancedAspects(celestialData: any): AspectData[] {
  const aspects: AspectData[] = [];
  
  // Professional orb system with tightened semi-sextile orbs
  const orbSystem = {
    sun: { conjunction: 10, opposition: 10, trine: 8, square: 8, sextile: 6, quincunx: 3, semisextile: 2 },
    moon: { conjunction: 10, opposition: 10, trine: 8, square: 8, sextile: 6, quincunx: 3, semisextile: 2 },
    mercury: { conjunction: 7, opposition: 7, trine: 6, square: 6, sextile: 4, quincunx: 2, semisextile: 1 },
    venus: { conjunction: 7, opposition: 7, trine: 6, square: 6, sextile: 4, quincunx: 2, semisextile: 1 },
    mars: { conjunction: 8, opposition: 8, trine: 6, square: 6, sextile: 4, quincunx: 2, semisextile: 1 },
    jupiter: { conjunction: 9, opposition: 9, trine: 7, square: 7, sextile: 5, quincunx: 3, semisextile: 2 },
    saturn: { conjunction: 9, opposition: 9, trine: 7, square: 7, sextile: 5, quincunx: 3, semisextile: 2 },
    uranus: { conjunction: 6, opposition: 6, trine: 5, square: 5, sextile: 3, quincunx: 2, semisextile: 1 },
    neptune: { conjunction: 6, opposition: 6, trine: 5, square: 5, sextile: 3, quincunx: 2, semisextile: 1 },
    pluto: { conjunction: 6, opposition: 6, trine: 5, square: 5, sextile: 3, quincunx: 2, semisextile: 1 }
  };

  const aspectAngles = {
    conjunction: 0,
    opposition: 180,
    trine: 120,
    square: 90,
    sextile: 60,
    quincunx: 150,
    semisextile: 30
  };

  const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i];
      const planet2 = planets[j];
      
      const pos1 = celestialData.planets?.[planet1] || celestialData[planet1];
      const pos2 = celestialData.planets?.[planet2] || celestialData[planet2];
      
      if (pos1 && pos2 && typeof pos1.longitude === 'number' && typeof pos2.longitude === 'number') {
        let angleDiff = Math.abs(pos1.longitude - pos2.longitude);
        if (angleDiff > 180) angleDiff = 360 - angleDiff;
        
        for (const [aspectName, targetAngle] of Object.entries(aspectAngles)) {
          const orb1 = orbSystem[planet1][aspectName] || 5;
          const orb2 = orbSystem[planet2][aspectName] || 5;
          const averageOrb = (orb1 + orb2) / 2;
          
          const exactness = Math.abs(angleDiff - targetAngle);
          
          if (exactness <= averageOrb) {
            const strength = ((averageOrb - exactness) / averageOrb) * 100;
            
            // Fixed applying logic for radix charts using zodiac order
            const applying = isApplying(pos1.longitude, pos2.longitude, targetAngle);
            
            aspects.push({
              planet1,
              planet2,
              aspect: aspectName,
              orb_used: averageOrb,
              exactness,
              strength: Math.round(strength * 100) / 100,
              applying
            });
            break;
          }
        }
      }
    }
  }
  
  // Sort by strength (tightest aspects first)
  aspects.sort((a, b) => a.exactness - b.exactness);
  
  return aspects;
}

// Calculate house data
function calculateHouseData(houses: any): HouseData[] {
  if (!houses?.houses) return [];
  
  return houses.houses.map((house: any, index: number) => {
    const signInfo = calculateEnhancedSignFromLongitude(house.longitude || 0);
    
    return {
      house_number: index + 1,
      sign: signInfo.sign,
      degree: signInfo.degree,
      planets: house.planets?.map((p: any) => p.name) || []
    };
  });
}

// Find which house a planet is in
function findHouseForPlanet(longitude: number, houses: any): number {
  if (!houses?.houses) return 1;
  
  const normalizedLongitude = ((longitude % 360) + 360) % 360;
  
  for (let i = 0; i < houses.houses.length; i++) {
    const currentHouse = houses.houses[i].longitude || 0;
    const nextHouse = houses.houses[(i + 1) % houses.houses.length].longitude || 0;
    
    // Handle crossing 0 degrees
    if (currentHouse > nextHouse) {
      if (normalizedLongitude >= currentHouse || normalizedLongitude < nextHouse) {
        return i + 1;
      }
    } else {
      if (normalizedLongitude >= currentHouse && normalizedLongitude < nextHouse) {
        return i + 1;
      }
    }
  }
  
  return 1; // Default to first house
}

// Enhanced keyword systems
function getEnhancedSunKeyword(sign: string): string {
  const keywords: Record<string, string> = {
    'Aries': 'Pioneer • Initiator • Leader',
    'Taurus': 'Builder • Stabilizer • Preserver',
    'Gemini': 'Communicator • Messenger • Connector',
    'Cancer': 'Nurturer • Protector • Emotional Guardian',
    'Leo': 'Creator • Performer • Heart-Centered Leader',
    'Virgo': 'Analyst • Healer • Perfectionist',
    'Libra': 'Harmonizer • Diplomat • Beauty Seeker',
    'Scorpio': 'Transformer • Investigator • Phoenix',
    'Sagittarius': 'Explorer • Philosopher • Truth Seeker',
    'Capricorn': 'Achiever • Master Builder • Authority',
    'Aquarius': 'Innovator • Humanitarian • Visionary',
    'Pisces': 'Dreamer • Mystic • Universal Lover'
  };
  return keywords[sign.split(' ')[0]] || 'Cosmic Explorer';
}

function getEnhancedMoonKeyword(sign: string): string {
  const keywords: Record<string, string> = {
    'Aries': 'Instinctive • Quick Emotional Responses',
    'Taurus': 'Stable • Comfort-Seeking • Sensual',
    'Gemini': 'Curious • Mentally Stimulated • Communicative',
    'Cancer': 'Protective • Deeply Feeling • Intuitive',
    'Leo': 'Expressive • Dramatic • Warm-Hearted',
    'Virgo': 'Caring • Analytical • Service-Oriented',
    'Libra': 'Peaceful • Relationship-Focused • Harmonious',
    'Scorpio': 'Intense • Transformative • Psychic',
    'Sagittarius': 'Free • Optimistic • Adventure-Seeking',
    'Capricorn': 'Responsible • Ambitious • Disciplined',
    'Aquarius': 'Independent • Detached • Group-Conscious',
    'Pisces': 'Intuitive • Compassionate • Dreamy'
  };
  return keywords[sign.split(' ')[0]] || 'Emotionally Complex';
}

function getEnhancedRisingKeyword(sign: string): string {
  const keywords: Record<string, string> = {
    'Aries': 'Dynamic First Impression • Action-Oriented Approach',
    'Taurus': 'Steady Presence • Reliable Approach',
    'Gemini': 'Curious Demeanor • Communicative Style',
    'Cancer': 'Nurturing Presence • Protective Approach',
    'Leo': 'Radiant Charisma • Confident Style',
    'Virgo': 'Helpful Demeanor • Analytical Approach',
    'Libra': 'Charming Presence • Diplomatic Style',
    'Scorpio': 'Magnetic Intensity • Transformative Approach',
    'Sagittarius': 'Adventurous Spirit • Philosophical Style',
    'Capricorn': 'Authoritative Presence • Structured Approach',
    'Aquarius': 'Unique Demeanor • Innovative Style',
    'Pisces': 'Compassionate Presence • Intuitive Approach'
  };
  return keywords[sign.split(' ')[0]] || 'Unique Life Approach';
}
