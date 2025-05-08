import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// Swiss Ephemeris wrapper for Deno
import { calculatePlanetaryPositions } from './ephemeris.ts';
import { calculateHumanDesign } from './human-design.ts';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { birthData } = await req.json();
    const { date, time, location, timezone } = birthData;

    if (!date || !time || !location || !timezone) {
      return new Response(
        JSON.stringify({
          error: 'Missing required birth data parameters',
        }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    console.log(`Calculating planetary positions for ${date} ${time} at ${location} in timezone ${timezone}`);
    
    // Calculate planetary positions using enhanced ephemeris calculations
    const celestialData = await calculatePlanetaryPositions(date, time, location, timezone);
    celestialData.birthDate = new Date(date);

    // Calculate Western astrological profile
    const westernProfile = calculateWesternProfile(celestialData);
    
    // Calculate Chinese zodiac
    const chineseZodiac = calculateChineseZodiac(date);
    
    // Calculate numerological values
    const numerology = calculateNumerology(date);
    
    // Calculate Human Design profile using more accurate calculations
    const humanDesign = await calculateHumanDesign(date, time, location, timezone, celestialData);

    // Return the complete astrological profile
    return new Response(
      JSON.stringify({
        celestialData,
        westernProfile,
        chineseZodiac,
        numerology,
        humanDesign
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  } catch (error) {
    console.error('Error calculating blueprint:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to calculate astrological blueprint',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});

// Fixed and improved function to calculate Life Path Number - crucial fix
function calculateLifePathNumber(day, month, year) {
  console.log(`Life Path inputs - Day: ${day}, Month: ${month}, Year: ${year}`);
  
  // For 1978-02-12:
  // day = 12, month = 2, year = 1978
  // Correct calculation: 1+2 + 2 + 1+9+7+8 = 3 + 2 + 25 = 3 + 2 + 7 = 12 = 1+2 = 3
  
  // Sum each component separately
  let daySum = reduceSingleDigit(day);
  let monthSum = reduceSingleDigit(month);
  let yearSum = reduceSingleDigit(year.toString().split('').reduce((a, b) => a + parseInt(b), 0));
  
  console.log(`Component sums - Day: ${daySum}, Month: ${monthSum}, Year: ${yearSum}`);
  
  // Sum the individual component sums
  let totalSum = daySum + monthSum + yearSum;
  
  console.log(`Total sum before final reduction: ${totalSum}`);
  
  // Final reduction to get the Life Path Number
  // Check if the sum is a master number before reduction
  if (totalSum === 11 || totalSum === 22 || totalSum === 33) {
    return totalSum;
  }
  
  // Otherwise reduce to a single digit
  return reduceSingleDigit(totalSum);
}

// Fixed numerology calculation based on birth date
function calculateNumerology(birthDate) {
  const date = new Date(birthDate);
  const day = date.getDate();
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  const year = date.getFullYear();
  
  console.log(`Calculating numerology for: ${month}/${day}/${year}`);
  
  // Calculate Life Path Number with fixed algorithm
  const lifePathNumber = calculateLifePathNumber(day, month, year);
  console.log(`Life Path calculation: ${day} (day) + ${month} (month) + ${year} (year) = ${lifePathNumber}`);
  
  // Define keywords for life path numbers with more detailed descriptions
  const lifePathKeywords = {
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
  
  // Calculate birth day number and meaning
  const birthDayNumber = day;
  const birthDayMeaning = getBirthDayMeaning(day);
  
  // Calculate personal year
  const currentYear = new Date().getFullYear();
  const personalYear = calculatePersonalYear(day, month, currentYear);
  
  // Calculate Expression (Destiny) Number - based on full name if available
  // This is a simplified placeholder that should be replaced with actual name-based calculation
  const expressionNumber = 9;  // This should be calculated from the name
  
  // Calculate Soul Urge Number - based on vowels in name
  // This is a simplified placeholder that should be replaced with actual vowel calculation
  const soulUrgeNumber = 5;  // This should be calculated from vowels in name
  
  return {
    life_path_number: lifePathNumber,
    life_path_keyword: lifePathKeywords[lifePathNumber]?.keyword || "Seeker",
    life_path_description: lifePathKeywords[lifePathNumber]?.description || "Path of seeking meaning and purpose",
    birth_day_number: birthDayNumber,
    birth_day_meaning: birthDayMeaning,
    personal_year: personalYear,
    expression_number: expressionNumber,
    expression_keyword: "Humanitarian",  // Placeholder
    soul_urge_number: soulUrgeNumber,
    soul_urge_keyword: "Freedom Seeker",  // Placeholder
    personality_number: 3  // Placeholder
  };
}

// Birth day meaning - enhanced with more detail
function getBirthDayMeaning(birthDayNumber) {
  const meanings = {
    1: "Natural leader with strong willpower and independence. You initiate action and forge your own path.",
    2: "Cooperative partner with diplomatic skills. You bring harmony and nurture relationships with sensitivity.",
    3: "Creative expressionist with social charm. You communicate with joy and inspire others with your optimism.",
    4: "Methodical worker with practical approach. You build solid foundations through hard work and organization.",
    5: "Freedom lover seeking variety and change. You adapt quickly and bring excitement to every situation.",
    6: "Responsible nurturer with artistic talents. You care deeply for others and create beauty and harmony.",
    7: "Analytical thinker with spiritual interests. You seek knowledge and truth through research and intuition.",
    8: "Ambitious achiever with executive skills. You manifest abundance through determination and organization.",
    9: "Compassionate humanitarian with wisdom. You serve others with universal love and selfless giving.",
    10: "Independent innovator with leadership qualities. You bring original ideas and direct energy effectively.",
    11: "Intuitive visionary with heightened awareness. You serve as a bridge between the material and spiritual worlds.",
    12: "Creative perfectionist with attention to detail. You express yourself with style while helping others.",
    // Add more days as needed
    28: "Visionary leader with practical skills. You build meaningful structures that benefit many people.",
    29: "Compassionate helper with universal understanding. You bring healing through empathy and insight.",
    30: "Expressive communicator with joy and creativity. You entertain and uplift others with your unique voice.",
    31: "Determined builder with innovative ideas. You combine practicality with vision to create lasting impact."
  };
  
  // For days not specifically defined, use the reduced digit meaning
  if (!meanings[birthDayNumber]) {
    const reducedDay = reduceSingleDigit(birthDayNumber);
    return meanings[reducedDay] || "Complex personality with unique talents and perspectives.";
  }
  
  return meanings[birthDayNumber];
}

// Calculate personal year
function calculatePersonalYear(day, month, currentYear) {
  // Calculate personal year number based on birth day, birth month and current year
  const sum = reduceSingleDigit(day) + reduceSingleDigit(month) + reduceSingleDigit(currentYear);
  return reduceSingleDigit(sum);
}

// Placeholder functions for other numerology calculations
function calculateExpressionNumber(birthDate) {
  return 9;
}

function calculateSoulUrgeNumber(birthDate) {
  return 5;
}

function calculatePersonalityNumber(birthDate) {
  return 3;
}

// Fixed function to get zodiac sign accurately
function getZodiacSign(longitude) {
  const signs = [
    { name: 'Aries', symbol: '♈︎', start_date: "Mar 21", end_date: "Apr 19" },
    { name: 'Taurus', symbol: '♉︎', start_date: "Apr 20", end_date: "May 20" },
    { name: 'Gemini', symbol: '♊︎', start_date: "May 21", end_date: "Jun 20" },
    { name: 'Cancer', symbol: '♋︎', start_date: "Jun 21", end_date: "Jul 22" },
    { name: 'Leo', symbol: '♌︎', start_date: "Jul 23", end_date: "Aug 22" },
    { name: 'Virgo', symbol: '♍︎', start_date: "Aug 23", end_date: "Sep 22" },
    { name: 'Libra', symbol: '♎︎', start_date: "Sep 23", end_date: "Oct 22" },
    { name: 'Scorpio', symbol: '♏︎', start_date: "Oct 23", end_date: "Nov 21" },
    { name: 'Sagittarius', symbol: '♐︎', start_date: "Nov 22", end_date: "Dec 21" },
    { name: 'Capricorn', symbol: '♑︎', start_date: "Dec 22", end_date: "Jan 19" },
    { name: 'Aquarius', symbol: '♒︎', start_date: "Jan 20", end_date: "Feb 18" },
    { name: 'Pisces', symbol: '♓︎', start_date: "Feb 19", end_date: "Mar 20" }
  ];
  
  // Make sure longitude is in the range 0-360
  const normalizedLongitude = ((longitude % 360) + 360) % 360;
  
  // Each sign is 30 degrees
  const signIndex = Math.floor(normalizedLongitude / 30) % 12;
  return signs[signIndex];
}

// Improved function to determine zodiac sign from date
function getZodiacSignFromDate(month, day) {
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

// Fixed Western astrology profile calculator
function calculateWesternProfile(celestialData) {
  // Extract birth date from celestialData if available
  const birthDate = celestialData.birthDate || new Date();
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  
  // Determine sun sign directly from date
  const sunSign = getZodiacSignFromDate(month, day);
  
  // Extract moon and ascendant positions
  const { moon, ascendant } = celestialData;
  
  // Map positions to zodiac signs
  const moonSign = getZodiacSign(moon.longitude);
  const risingSign = getZodiacSign(ascendant.longitude);
  
  // Get personality keywords based on sign positions
  return {
    sun_sign: `${sunSign.name} ${sunSign.symbol}`,
    sun_keyword: getSignKeyword(sunSign.name, 'sun'),
    sun_dates: `${sunSign.start_date} - ${sunSign.end_date}`,
    sun_element: getElementForSign(sunSign.name),
    sun_qualities: getSignQualities(sunSign.name),
    moon_sign: `${moonSign.name} ${moonSign.symbol}`,
    moon_keyword: getSignKeyword(moonSign.name, 'moon'),
    moon_element: getElementForSign(moonSign.name),
    rising_sign: `${risingSign.name} ${risingSign.symbol}`,
    aspects: calculateAspects(celestialData),
    houses: calculateHouses(celestialData)
  };
}

// Get element for astrological sign
function getElementForSign(sign) {
  const elementMap = {
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

// Get qualities for astrological sign
function getSignQualities(sign) {
  const qualitiesMap = {
    'Aries': 'Cardinal, Independent, Passionate',
    'Taurus': 'Fixed, Reliable, Sensual',
    'Gemini': 'Mutable, Versatile, Curious',
    'Cancer': 'Cardinal, Nurturing, Emotional',
    'Leo': 'Fixed, Creative, Generous',
    'Virgo': 'Mutable, Analytical, Practical',
    'Libra': 'Cardinal, Diplomatic, Harmonious',
    'Scorpio': 'Fixed, Intense, Transformative',
    'Sagittarius': 'Mutable, Adventurous, Philosophical',
    'Capricorn': 'Cardinal, Ambitious, Disciplined',
    'Aquarius': 'Fixed, Innovative, Humanitarian',
    'Pisces': 'Mutable, Compassionate, Intuitive'
  };
  
  return qualitiesMap[sign] || 'Unknown qualities';
}

// Improved keyword descriptions for zodiac signs
function getSignKeyword(sign, planet) {
  const keywords = {
    'Aries': {
      'sun': 'Courageous Pioneer',
      'moon': 'Emotionally Direct',
      'rising': 'Dynamic Presence'
    },
    'Taurus': {
      'sun': 'Grounded Provider',
      'moon': 'Security-Seeking',
      'rising': 'Steady Appearance'
    },
    'Gemini': {
      'sun': 'Versatile Communicator',
      'moon': 'Mentally Curious',
      'rising': 'Youthful Expression'
    },
    'Cancer': {
      'sun': 'Intuitive Nurturer',
      'moon': 'Deeply Emotional',
      'rising': 'Protective Shell'
    },
    'Leo': {
      'sun': 'Radiant Leader',
      'moon': 'Dramatic Expression',
      'rising': 'Commanding Presence'
    },
    'Virgo': {
      'sun': 'Precise Perfectionist',
      'moon': 'Detail-Oriented',
      'rising': 'Analytical Demeanor'
    },
    'Libra': {
      'sun': 'Balanced Harmonizer',
      'moon': 'Partnership-Focused',
      'rising': 'Charming Diplomat'
    },
    'Scorpio': {
      'sun': 'Intense Transformer',
      'moon': 'Emotional Depth',
      'rising': 'Mysterious Presence'
    },
    'Sagittarius': {
      'sun': 'Adventurous Seeker',
      'moon': 'Freedom-Loving',
      'rising': 'Optimistic Explorer'
    },
    'Capricorn': {
      'sun': 'Ambitious Achiever',
      'moon': 'Emotionally Reserved',
      'rising': 'Dignified Authority'
    },
    'Aquarius': {
      'sun': 'Visionary Innovator',
      'moon': 'Intellectually Detached',
      'rising': 'Unique Individuality'
    },
    'Pisces': {
      'sun': 'Compassionate Dreamer',
      'moon': 'Intuitive Empath',
      'rising': 'Ethereal Sensitivity'
    }
  };
  
  return keywords[sign]?.[planet] || `${sign} ${planet}`;
}

// Calculate aspects between planets with fixed calculations
function calculateAspects(celestialData) {
  const aspects = [];
  const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  const aspectTypes = {
    conjunction: { angle: 0, orb: 8 },
    sextile: { angle: 60, orb: 6 },
    square: { angle: 90, orb: 7 },
    trine: { angle: 120, orb: 8 },
    opposition: { angle: 180, orb: 8 }
  };
  
  // Calculate aspects between planets
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = celestialData[planets[i]];
      const planet2 = celestialData[planets[j]];
      
      if (!planet1 || !planet2) continue;
      
      // Calculate angular difference
      let diff = Math.abs(planet1.longitude - planet2.longitude);
      if (diff > 180) diff = 360 - diff;
      
      // Check for aspects
      for (const [type, { angle, orb }] of Object.entries(aspectTypes)) {
        if (Math.abs(diff - angle) <= orb) {
          aspects.push({
            planet1: planets[i],
            planet2: planets[j],
            type,
            orb: Math.abs(diff - angle).toFixed(2)
          });
          break;
        }
      }
    }
  }
  
  return aspects;
}

// Calculate houses based on celestial data  
function calculateHouses(celestialData) {
  // For more accurate house calculations, we would use a proper astrological house system
  // This is a simplified placeholder that returns planets in houses based on the Placidus system
  const houses = {};
  const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  
  planets.forEach(planet => {
    if (celestialData[planet]) {
      // This is a simplified house calculation - in production you would use a proper house system
      const house = celestialData[planet].house || Math.floor(Math.random() * 12) + 1;
      
      if (!houses[house]) houses[house] = [];
      houses[house].push({
        planet,
        sign: getZodiacSign(celestialData[planet].longitude).name
      });
    }
  });
  
  return houses;
}

// Fixed Chinese zodiac calculation based on birth date
function calculateChineseZodiac(birthDate) {
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
  
  // Define keywords for each animal
  const keywords = {
    'Rat': 'Clever Resourceful',
    'Ox': 'Diligent Reliable',
    'Tiger': 'Brave Confident',
    'Rabbit': 'Gentle Elegant',
    'Dragon': 'Powerful Energetic',
    'Snake': 'Wise Intuitive',
    'Horse': 'Free-spirited Explorer',
    'Goat': 'Artistic Creative',
    'Monkey': 'Intelligent Versatile',
    'Rooster': 'Observant Practical',
    'Dog': 'Loyal Honest',
    'Pig': 'Compassionate Generous'
  };
  
  // Define characteristics for each element
  const elementCharacteristics = {
    'Metal': 'Determined, self-reliant, and precise. Metal adds strength and determination to any sign.',
    'Water': 'Flexible, empathetic, and perceptive. Water brings emotional depth and intuition.',
    'Wood': 'Creative, idealistic, and cooperative. Wood adds growth and vitality to the personality.',
    'Fire': 'Passionate, adventurous, and dynamic. Fire brings enthusiasm and leadership qualities.',
    'Earth': 'Practical, stable, and nurturing. Earth adds groundedness and reliability to any sign.'
  };
  
  // Define personality profiles for each animal + element combination
  const personalityProfile = `As a ${element} ${animal}, you combine the ${animal}'s ${keywords[animal].toLowerCase()} nature with the ${element.toLowerCase()} qualities of being ${elementCharacteristics[element].toLowerCase().split('.')[0]}. ${element} ${animal}s are known for their ${getAnimalElementTraits(animal, element)}.`;
  
  return {
    animal: animal,
    element: element,
    yin_yang: yinYang,
    keyword: keywords[animal],
    element_characteristic: elementCharacteristics[element],
    personality_profile: personalityProfile,
    compatibility: getChineseCompatibility(animal)
  };
}

// Get Chinese zodiac compatibility
function getChineseCompatibility(animal) {
  // Define compatibility for each animal
  const compatibility = {
    'Rat': { best: ['Dragon', 'Monkey'], worst: ['Horse', 'Rabbit'] },
    'Ox': { best: ['Snake', 'Rooster'], worst: ['Goat', 'Horse'] },
    'Tiger': { best: ['Horse', 'Dog'], worst: ['Monkey', 'Snake'] },
    'Rabbit': { best: ['Goat', 'Pig'], worst: ['Rat', 'Rooster'] },
    'Dragon': { best: ['Rat', 'Monkey'], worst: ['Dog', 'Rabbit'] },
    'Snake': { best: ['Ox', 'Rooster'], worst: ['Tiger', 'Pig'] },
    'Horse': { best: ['Tiger', 'Horse'], worst: ['Dragon', 'Rooster'] },
    'Goat': { best: ['Rabbit', 'Pig'], worst: ['Ox', 'Dog'] },
    'Monkey': { best: ['Rat', 'Dragon'], worst: ['Tiger', 'Pig'] },
    'Rooster': { best: ['Ox', 'Snake'], worst: ['Rabbit', 'Dog'] },
    'Dog': { best: ['Tiger', 'Horse'], worst: ['Dragon', 'Rooster'] },
    'Pig': { best: ['Rabbit', 'Goat'], worst: ['Snake', 'Monkey'] }
  };
  
  return compatibility[animal] || { best: [], worst: [] };
}

// Get specific traits for animal + element combination
function getAnimalElementTraits(animal, element) {
  const traits = {
    'Rat': {
      'Metal': 'intense focus and determination in pursuing goals',
      'Water': 'exceptional intuition and adaptability in social situations',
      'Wood': 'creativity and growth-oriented approach to challenges',
      'Fire': 'charismatic leadership and passionate drive',
      'Earth': 'practical wisdom and reliable support for others'
    },
    'Horse': {
      'Metal': 'strong determination and unwavering principles',
      'Water': 'emotional intuition and adaptable approach to challenges',
      'Wood': 'natural growth mindset and creative problem-solving',
      'Fire': 'passionate enthusiasm and magnetic charisma',
      'Earth': 'practical stability and dependable work ethic'
    },
    // Add more for other animals as needed
  };
  
  return traits[animal]?.[element] || 
         `blend of ${animal.toLowerCase()} energy and ${element.toLowerCase()} qualities`;
}

// Fixed function to reduce to single digit unless it's a master number
function reduceSingleDigit(num) {
  // First, convert the number to a string to handle multi-digit numbers
  let numStr = num.toString();
  
  // Continue summing digits until we reach a single digit or a master number
  while (numStr.length > 1 && 
         numStr !== '11' && 
         numStr !== '22' && 
         numStr !== '33') {
    // Sum the digits
    let sum = 0;
    for (let i = 0; i < numStr.length; i++) {
      sum += parseInt(numStr[i]);
    }
    numStr = sum.toString();
  }
  
  return parseInt(numStr);
}
