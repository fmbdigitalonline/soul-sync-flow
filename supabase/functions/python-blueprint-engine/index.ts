
// Supabase Edge Function - Blueprint Engine (TypeScript implementation)
// This is a TypeScript implementation that replaces the Python version

import { serve } from "std/http/server.ts";
import { DateTime } from "npm:luxon@3.4.4";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

// Debug mode for detailed logging
const DEBUG_MODE = true;

function log(message: string, data?: any): void {
  if (DEBUG_MODE) {
    console.log(`[Python-Blueprint-Engine] ${message}`, data ? JSON.stringify(data) : '');
  }
}

// Basic numerology utility functions
function reduceSingleDigit(num: number): number {
  // Keep master numbers (11, 22, 33)
  if (num === 11 || num === 22 || num === 33) {
    return num;
  }
  
  // Convert to string to handle multi-digit numbers
  let numStr = num.toString();
  
  // Continue summing digits until we reach a single digit
  while (numStr.length > 1) {
    // Sum the digits
    let sum = 0;
    for (let i = 0; i < numStr.length; i++) {
      sum += parseInt(numStr[i]);
    }
    
    // Check if we've hit a master number
    if (sum === 11 || sum === 22 || sum === 33) {
      return sum;
    }
    
    numStr = sum.toString();
  }
  
  return parseInt(numStr);
}

// Calculate life path number using the proper numerology methodology
function calculateLifePath(birthDate: string): number {
  try {
    log(`Calculating Life Path for date: ${birthDate}`);
    
    // Split the date into components
    const [year, month, day] = birthDate.split('-').map(part => parseInt(part, 10));
    
    // Validate date parts
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      throw new Error(`Invalid date components: ${year}, ${month}, ${day}`);
    }
    
    log(`Date components: Year=${year}, Month=${month}, Day=${day}`);
    
    // Sum each component separately
    const daySum = reduceSingleDigit(day);
    const monthSum = reduceSingleDigit(month);
    const yearSum = reduceSingleDigit(year.toString().split('').reduce((a, b) => a + parseInt(b), 0));
    
    log(`Component sums - Day: ${daySum}, Month: ${monthSum}, Year: ${yearSum}`);
    
    // Sum the individual component sums
    let totalSum = daySum + monthSum + yearSum;
    
    log(`Total sum before final reduction: ${totalSum}`);
    
    // Check if the sum is a master number before final reduction
    if (totalSum === 11 || totalSum === 22 || totalSum === 33) {
      log(`Master number ${totalSum} found, not reducing further`);
      return totalSum;
    }
    
    // Otherwise reduce to a single digit
    const finalDigit = reduceSingleDigit(totalSum);
    log(`Final Life Path number: ${finalDigit}`);
    
    return finalDigit;
  } catch (error) {
    console.error("Error calculating Life Path number:", error);
    return 0; // Return 0 in case of error to make debugging obvious
  }
}

// Get sign from date
function getZodiacSignFromDate(month: number, day: number): { name: string; symbol: string; start_date: string; end_date: string } {
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return { name: 'Aquarius', symbol: '♒︎', start_date: "Jan 20", end_date: "Feb 18" };
  } else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) {
    return { name: 'Pisces', symbol: '♓︎', start_date: "Feb 19", end_date: "Mar 20" };
  } else if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return { name: 'Aries', symbol: '♈︎', start_date: "Mar 21", end_date: "Apr 19" };
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return { name: 'Taurus', symbol: '♉︎', start_date: "Apr 20", end_date: "May 20" };
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return { name: 'Gemini', symbol: '♊︎', start_date: "May 21", end_date: "Jun 20" };
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return { name: 'Cancer', symbol: '♋︎', start_date: "Jun 21", end_date: "Jul 22" };
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return { name: 'Leo', symbol: '♌︎', start_date: "Jul 23", end_date: "Aug 22" };
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return { name: 'Virgo', symbol: '♍︎', start_date: "Aug 23", end_date: "Sep 22" };
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return { name: 'Libra', symbol: '♎︎', start_date: "Sep 23", end_date: "Oct 22" };
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return { name: 'Scorpio', symbol: '♏︎', start_date: "Oct 23", end_date: "Nov 21" };
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return { name: 'Sagittarius', symbol: '♐︎', start_date: "Nov 22", end_date: "Dec 21" };
  } else {
    return { name: 'Capricorn', symbol: '♑︎', start_date: "Dec 22", end_date: "Jan 19" };
  }
}

// Get element for astrological sign
function getElementForSign(sign: string): string {
  const elementMap: Record<string, string> = {
    'Aries': 'Fire',
    'Leo': 'Fire',
    'Sagittarius': 'Fire',
    'Taurus': 'Earth',
    'Virgo': 'Earth',
    'Capricorn': 'Earth',
    'Gemini': 'Air',
    'Libra': 'Air',
    'Aquarius': 'Air',
    'Cancer': 'Water',
    'Scorpio': 'Water',
    'Pisces': 'Water'
  };
  
  return elementMap[sign] || 'Unknown';
}

// Get Chinese zodiac
function calculateChineseZodiac(birthDate: string): any {
  const date = new Date(birthDate);
  const year = date.getFullYear();
  
  // Chinese zodiac operates on a 12-year cycle
  const animals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
  const elements = ['Metal', 'Water', 'Wood', 'Fire', 'Earth'];
  
  // Calculate animal - Fixed calculation for Chinese zodiac
  // For Chinese zodiac, the animal is determined by the year mod 12
  const animalIndex = (year - 4) % 12;
  const animal = animals[animalIndex];
  
  // Element is determined by the year mod 10 divided by 2
  const elementIndex = Math.floor(((year - 4) % 10) / 2);
  const element = elements[elementIndex];
  
  // Yin/Yang is determined by the year - odd years are yang, even years are yin
  const yinYang = year % 2 === 0 ? 'Yang' : 'Yin';
  
  return {
    animal,
    element,
    yin_yang: yinYang,
    keyword: `${animal} ${element}`,
    element_characteristic: `${element} brings ${element === 'Fire' ? 'passion and creativity' : 
                             element === 'Earth' ? 'stability and practicality' : 
                             element === 'Metal' ? 'precision and discipline' : 
                             element === 'Water' ? 'intuition and adaptability' : 
                             'growth and vitality'} to your personality.`,
    personality_profile: `As a ${element} ${animal}, you combine adaptability with determination, approaching life with a unique blend of practicality and vision.`
  };
}

// Simple Human Design calculation based on birth data
function calculateHumanDesign(birthDate: string): any {
  const date = new Date(birthDate);
  const month = date.getMonth();
  const day = date.getDate();
  const year = date.getFullYear();
  
  // Simplified deterministic HD type assignment based on birth date components 
  const typeIndex = (month + day + year) % 5;
  const types = ["Generator", "Manifesting Generator", "Projector", "Manifestor", "Reflector"];
  const type = types[typeIndex];
  
  // Determine profile
  const line1 = ((month + 1) % 6) + 1;
  const line2 = ((day) % 6) + 1;
  const profile = `${line1}/${line2}`;
  
  // Determine authority
  const authorities = ["Emotional", "Sacral", "Splenic", "Ego", "Self-Projected", "Mental", "None"];
  const authorityIndex = (month + day) % authorities.length;
  const authority = authorities[authorityIndex];
  
  // Get strategy based on type
  let strategy;
  switch(type) {
    case "Generator":
    case "Manifesting Generator": 
      strategy = "Wait to respond";
      break;
    case "Projector": 
      strategy = "Wait for invitation";
      break;
    case "Manifestor": 
      strategy = "Inform before action";
      break;
    case "Reflector": 
      strategy = "Wait a lunar cycle";
      break;
    default: 
      strategy = "Follow your strategy";
  }
  
  // Get not-self theme based on type
  let notSelfTheme;
  switch(type) {
    case "Generator":
    case "Manifesting Generator": 
      notSelfTheme = "Frustration";
      break;
    case "Projector": 
      notSelfTheme = "Bitterness";
      break;
    case "Manifestor": 
      notSelfTheme = "Anger";
      break;
    case "Reflector": 
      notSelfTheme = "Disappointment";
      break;
    default: 
      notSelfTheme = "Resistance";
  }
  
  // Generate deterministic centers based on birth date components
  const centers = {
    root: (month % 2) === 0,
    sacral: type === "Generator" || type === "Manifesting Generator",
    spleen: ((month + day) % 3) === 0,
    solar_plexus: ((month + day) % 2) === 0,
    heart: ((month + 1) % 3) === 0,
    throat: ((day) % 3) === 0,
    ajna: ((day + year) % 4) === 0,
    head: ((month + year) % 4) === 0,
    g: ((day + month + year) % 5) === 0
  };
  
  return {
    type,
    profile,
    authority,
    strategy,
    definition: Object.values(centers).filter(Boolean).length >= 4 ? "Multiple" : "Split",
    not_self_theme: notSelfTheme,
    centers,
    gates: {
      conscious_personality: ["Gate 1", "Gate 8", "Gate 13", "Gate 20"],
      unconscious_design: ["Gate 7", "Gate 15", "Gate 25", "Gate 43"]
    },
    life_purpose: `To find fulfillment through your ${type.toLowerCase()} energy`
  };
}

// Calculate the full blueprint
function calculateBlueprint(userData: any): any {
  log("Generating blueprint for:", userData);
  
  try {
    const birthDate = userData.birth_date;
    const birthTime = userData.birth_time_local || "00:00";
    const birthLocation = userData.birth_location || "Unknown";
    const fullName = userData.full_name;
    const preferredName = userData.preferred_name || fullName.split(' ')[0];
    const mbti = userData.mbti || "";
    
    // Extract birth date components
    const date = new Date(birthDate);
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed
    const day = date.getDate();
    const year = date.getFullYear();
    
    log(`Processing birth date: ${month}/${day}/${year}`);
    
    // Calculate life path number
    const lifePathNumber = calculateLifePath(birthDate);
    log(`Life Path Number: ${lifePathNumber}`);
    
    // Get Western astrology sun sign
    const sunSign = getZodiacSignFromDate(month, day);
    log(`Sun Sign: ${sunSign.name}`);
    
    // Get Chinese zodiac
    const chineseZodiac = calculateChineseZodiac(birthDate);
    log(`Chinese Zodiac: ${chineseZodiac.animal} ${chineseZodiac.element}`);
    
    // Calculate Human Design
    const humanDesign = calculateHumanDesign(birthDate);
    log(`Human Design Type: ${humanDesign.type}`);
    
    // Define life path keywords
    const lifePathKeywords: Record<number, { keyword: string, description: string }> = {
      1: { keyword: "Independent Leader", description: "Born to lead and pioneer new paths. You are self-reliant, ambitious, and determined." },
      2: { keyword: "Cooperative Peacemaker", description: "Natural diplomat with intuitive understanding of others. You thrive in partnerships and create harmony." },
      3: { keyword: "Creative Communicator", description: "Expressive, optimistic, and socially engaging. Your creativity and joy inspire others around you." },
      4: { keyword: "Practical Builder", description: "Solid, reliable foundation creator. Your methodical approach and hard work create lasting results." },
      5: { keyword: "Freedom Seeker", description: "Adventurous and versatile agent of change. You crave variety and experiences that expand your horizons." },
      6: { keyword: "Responsible Nurturer", description: "Compassionate healer and caregiver. You have a natural talent for supporting and teaching others." },
      7: { keyword: "Seeker of Truth", description: "Analytical, spiritual truth-seeker. You have a deep need to understand the mysteries of life." },
      8: { keyword: "Abundant Manifester", description: "Natural executive with material focus. You have the ability to achieve great success and prosperity." },
      9: { keyword: "Humanitarian", description: "Compassionate global citizen and completion energy. You serve humanity with wisdom and universal love." },
      11: { keyword: "Intuitive Channel", description: "Highly intuitive spiritual messenger with a mission to illuminate and inspire." },
      22: { keyword: "Master Builder", description: "Manifests grand visions into reality through practical application of spiritual wisdom." },
      33: { keyword: "Master Teacher", description: "Selfless nurturer with profound wisdom and an ability to uplift humanity." }
    };
    
    // MBTI profile
    let mbtiProfile = {
      type: mbti || "INFJ", // Default if not provided
      core_keywords: ["Insightful", "Visionary", "Determined"],
      dominant_function: "Introverted Intuition",
      auxiliary_function: "Extraverted Feeling"
    };
    
    // Custom MBTI data if provided
    if (mbti) {
      // Build MBTI profile based on their provided type
      const firstLetter = mbti.charAt(0);
      const secondLetter = mbti.charAt(1);
      const thirdLetter = mbti.charAt(2);
      const fourthLetter = mbti.charAt(3);
      
      // Adjust keywords based on type
      const keywords = [];
      
      if (firstLetter === 'E') keywords.push('Outgoing');
      if (firstLetter === 'I') keywords.push('Reflective');
      if (secondLetter === 'N') keywords.push('Intuitive');
      if (secondLetter === 'S') keywords.push('Practical');
      if (thirdLetter === 'T') keywords.push('Logical');
      if (thirdLetter === 'F') keywords.push('Empathetic');
      if (fourthLetter === 'J') keywords.push('Organized');
      if (fourthLetter === 'P') keywords.push('Adaptable');
      
      mbtiProfile.core_keywords = keywords;
      
      // Simplified function assignments
      if (secondLetter === 'N' && fourthLetter === 'J') {
        mbtiProfile.dominant_function = firstLetter === 'I' ? "Introverted Intuition" : "Extraverted Intuition";
        mbtiProfile.auxiliary_function = thirdLetter === 'T' ? "Extraverted Thinking" : "Extraverted Feeling";
      } else {
        mbtiProfile.dominant_function = firstLetter === 'I' ? "Introverted Sensing" : "Extraverted Sensing";
        mbtiProfile.auxiliary_function = thirdLetter === 'T' ? "Extraverted Thinking" : "Extraverted Feeling";
      }
    }
    
    // Assemble the complete blueprint
    const blueprint = {
      _meta: {
        generation_method: "typescript_edge_function",
        model_version: "1.0",
        generation_date: new Date().toISOString(),
        birth_data: {
          date: birthDate,
          time: birthTime,
          location: birthLocation
        },
        schema_version: "1.0"
      },
      user_meta: {
        full_name: fullName,
        preferred_name: preferredName,
        birth_date: birthDate,
        birth_time_local: birthTime,
        birth_location: birthLocation,
        mbti: mbti
      },
      cognition_mbti: mbtiProfile,
      energy_strategy_human_design: humanDesign,
      values_life_path: {
        life_path_number: lifePathNumber,
        life_path_keyword: lifePathKeywords[lifePathNumber]?.keyword || "Seeker",
        life_path_description: lifePathKeywords[lifePathNumber]?.description || "Path of seeking meaning and purpose",
        birth_day_number: day,
        birth_day_meaning: `Your birth day number ${day} gives you ${day % 2 === 0 ? 'balanced and harmonious' : 'independent and pioneering'} qualities`,
        personal_year: ((day + month) % 9) || 9, // Simple calculation for personal year
        expression_number: 8, // Placeholder - would calculate from name
        expression_keyword: "Executive", // Placeholder
        soul_urge_number: 5, // Placeholder
        soul_urge_keyword: "Freedom", // Placeholder
        personality_number: 3 // Placeholder
      },
      archetype_western: {
        sun_sign: `${sunSign.name} ${sunSign.symbol}`,
        sun_keyword: sunSign.name === "Leo" ? "Radiant Leader" : 
                     sunSign.name === "Aries" ? "Courageous Pioneer" : 
                     sunSign.name === "Cancer" ? "Intuitive Nurturer" : "Cosmic Explorer",
        sun_dates: `${sunSign.start_date} - ${sunSign.end_date}`,
        sun_element: getElementForSign(sunSign.name),
        sun_qualities: sunSign.name === "Leo" ? "Fixed, Creative, Generous" : 
                       sunSign.name === "Aries" ? "Cardinal, Independent, Passionate" : 
                       sunSign.name === "Cancer" ? "Cardinal, Nurturing, Emotional" : "Elemental Harmony",
        moon_sign: "Libra ♎︎", // Placeholder - would calculate from birth time and location
        moon_keyword: "Balanced Expression",
        moon_element: "Air",
        rising_sign: "Virgo ♍︎", // Placeholder - would calculate from birth time and location
        aspects: [
          {
            planet: "Sun",
            aspect: "Trine",
            planet2: "Moon",
            orb: "3°"
          },
          {
            planet: "Mercury",
            aspect: "Conjunction",
            planet2: "Venus",
            orb: "2°"
          }
        ],
        houses: {
          "1": { sign: "Virgo", house: "1st House" },
          "10": { sign: "Gemini", house: "10th House" }
        }
      },
      archetype_chinese: chineseZodiac
    };
    
    log("Blueprint generation complete");
    return blueprint;
  } catch (error) {
    console.error("Error generating blueprint:", error);
    throw error;
  }
}

// Main handler function for the Supabase Edge Function
serve(async (req) => {
  console.log(`Received ${req.method} request to ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders
    });
  }
  
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Parse the request body
    const requestData = await req.json();
    console.log("Request data received:", requestData);
    
    // Extract user data from request
    const userData = requestData.userData;
    
    if (!userData || !userData.full_name || !userData.birth_date) {
      return new Response(JSON.stringify({ 
        error: 'Missing required user data. Need full_name and birth_date at minimum.'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Generate the blueprint
    console.log("Generating blueprint...");
    const blueprint = calculateBlueprint(userData);
    
    // Return the blueprint
    return new Response(JSON.stringify(blueprint), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error("Error:", error);
    
    return new Response(JSON.stringify({
      error: `Blueprint generation failed: ${error.message || 'Unknown error'}`
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
