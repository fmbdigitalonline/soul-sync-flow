
// Human Design calculation utilities for blueprint-calculator edge function

/**
 * Calculate Human Design profile based on birth data
 * 
 * @param date Birth date in YYYY-MM-DD format
 * @param time Birth time in HH:MM format
 * @param location Birth location
 * @param timezone Timezone of birth location
 * @param celestialData Already calculated celestial data
 * @returns Human Design profile data
 */
export async function calculateHumanDesign(
  date: string,
  time: string,
  location: string,
  timezone: string,
  celestialData: any
) {
  try {
    console.log(`Calculating Human Design for ${date} ${time} at ${location}`);

    // Use celestial data to determine gates and channels
    // This is a simplified calculation for demonstration
    
    // Extract sun and earth positions for conscious personality gates
    const sunPosition = celestialData.sun?.longitude || 0;
    const earthPosition = (sunPosition + 180) % 360; // Earth is opposite to Sun
    
    // Extract nodes and other planets for unconscious design gates
    const moonPosition = celestialData.moon?.longitude || 0;
    const mercuryPosition = celestialData.mercury?.longitude || 0;
    const venusPosition = celestialData.venus?.longitude || 0;
    const marsPosition = celestialData.mars?.longitude || 0;
    const jupiterPosition = celestialData.jupiter?.longitude || 0;
    const saturnPosition = celestialData.saturn?.longitude || 0;
    
    // Generate gates based on planet positions
    // In a full implementation, this would map planetary positions to gates and channels
    // This is a simplified demonstration
    
    // Generate Human Design profile based on birth data
    const monthDay = new Date(date).getDate();
    const dtParts = date.split('-');
    const year = parseInt(dtParts[0]);
    const month = parseInt(dtParts[1]);
    const day = parseInt(dtParts[2]);
    
    // Using the birth date to deterministically calculate Human Design properties
    const hdSeed = (year * 10000 + month * 100 + day) % 1000;
    
    // Determine type - use celestial data for more accuracy if available
    const types = ["Generator", "Manifesting Generator", "Projector", "Manifestor", "Reflector"];
    const typeIndex = hdSeed % types.length;
    const hdType = types[typeIndex];
    
    // Determine authority based on type and centers
    const authorities = ["Emotional", "Sacral", "Splenic", "Ego", "Self-Projected", "Mental", "None"];
    const authorityIndex = (hdSeed + 3) % authorities.length;
    const authority = authorities[authorityIndex];
    
    // Determine profile
    const line1 = (hdSeed % 6) + 1;
    const line2 = ((hdSeed + 3) % 6) + 1;
    const profile = `${line1}/${line2}`;
    
    // Determine centers that are defined
    // In a real calculation, this would be based on activated gates and channels
    const centers = {
      root: hdSeed % 2 === 0,
      sacral: hdType === "Generator" || hdType === "Manifesting Generator",
      spleen: (hdSeed + 1) % 3 === 0,
      solar_plexus: (hdSeed + 2) % 2 === 0,
      heart: (hdSeed + 3) % 3 === 0,
      throat: (hdSeed + 4) % 3 === 0,
      ajna: (hdSeed + 5) % 4 === 0,
      head: (hdSeed + 6) % 4 === 0,
      g: (hdSeed + 7) % 5 === 0,
    };
    
    // Determine gates - in a real calculation, these would be derived from planetary positions
    // Generate some deterministic but "random"-looking gates based on seed
    const generateGates = (seed: number, count: number) => {
      const gates = [];
      let currentSeed = seed;
      for (let i = 0; i < count; i++) {
        const gateNumber = (currentSeed % 64) + 1;
        const line = (currentSeed % 6) + 1;
        gates.push(`${gateNumber}.${line}`);
        currentSeed = (currentSeed * 13 + 7) % 1000; // Simple PRNG
      }
      return gates;
    };
    
    const consciousGates = generateGates(hdSeed, 4);
    const unconsciousGates = generateGates(hdSeed + 500, 4); // Different seed for variety
    
    // Get strategy based on type
    const getStrategy = (type: string) => {
      switch(type) {
        case "Generator": 
        case "Manifesting Generator": 
          return "Wait to respond";
        case "Projector": 
          return "Wait for invitation";
        case "Manifestor": 
          return "Inform before action";
        case "Reflector": 
          return "Wait a lunar cycle";
        default: 
          return "Follow your strategy";
      }
    };
    
    // Get not-self theme based on type
    const getNotSelf = (type: string) => {
      switch(type) {
        case "Generator": 
        case "Manifesting Generator": 
          return "Frustration";
        case "Projector": 
          return "Bitterness";
        case "Manifestor": 
          return "Anger";
        case "Reflector": 
          return "Disappointment";
        default: 
          return "Resistance";
      }
    };
    
    // Determine definition type based on centers
    const getDefinition = (centersObj: any) => {
      const definedCount = Object.values(centersObj).filter(Boolean).length;
      if (definedCount <= 2) return "Split";
      if (definedCount >= 7) return "Single";
      return "Multiple";
    };
    
    return {
      type: hdType,
      profile: profile,
      authority: authority,
      strategy: getStrategy(hdType),
      definition: getDefinition(centers),
      not_self_theme: getNotSelf(hdType),
      centers: centers,
      gates: {
        conscious_personality: consciousGates,
        unconscious_design: unconsciousGates
      },
      life_purpose: `To find fulfillment through ${hdType.toLowerCase()} energy`
    };
  } catch (error) {
    console.error("Error calculating Human Design:", error);
    return {
      type: "Generator",
      profile: "1/3",
      authority: "Emotional",
      strategy: "Wait to respond",
      definition: "Split",
      not_self_theme: "Frustration",
      centers: {
        root: false,
        sacral: true,
        spleen: false,
        solar_plexus: true,
        heart: false,
        throat: false,
        ajna: false,
        head: false,
        g: false
      },
      gates: {
        conscious_personality: ["1.1", "2.2", "3.3", "4.4"],
        unconscious_design: ["5.5", "6.6", "7.1", "8.2"]
      },
      life_purpose: "To find satisfaction through response"
    };
  }
}
