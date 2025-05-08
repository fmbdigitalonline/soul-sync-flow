
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// Swiss Ephemeris wrapper for Deno
import { calculatePlanetaryPositions } from './ephemeris.ts';

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
    
    // Calculate planetary positions using Swiss Ephemeris
    const celestialData = await calculatePlanetaryPositions(date, time, location, timezone);

    // Calculate Western astrological profile
    const westernProfile = calculateWesternProfile(celestialData);
    
    // Calculate Chinese zodiac
    const chineseZodiac = calculateChineseZodiac(date);
    
    // Calculate numerological values
    const numerology = calculateNumerology(date);

    // Return the complete astrological profile
    return new Response(
      JSON.stringify({
        celestialData,
        westernProfile,
        chineseZodiac,
        numerology
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

function calculateWesternProfile(celestialData) {
  // Extract sun, moon and ascendant positions
  const { sun, moon, ascendant } = celestialData;
  
  // Map positions to zodiac signs (0-30 Aries, 30-60 Taurus, etc.)
  const sunSign = getZodiacSign(sun.longitude);
  const moonSign = getZodiacSign(moon.longitude);
  const risingSign = getZodiacSign(ascendant.longitude);
  
  // Get personality keywords based on sign positions
  return {
    sun_sign: `${sunSign.name} ${sunSign.symbol}`,
    sun_keyword: getSignKeyword(sunSign.name, 'sun'),
    moon_sign: `${moonSign.name} ${moonSign.symbol}`,
    moon_keyword: getSignKeyword(moonSign.name, 'moon'),
    rising_sign: `${risingSign.name} ${risingSign.symbol}`
  };
}

function getZodiacSign(longitude) {
  const signs = [
    { name: 'Aries', symbol: '♈︎' },
    { name: 'Taurus', symbol: '♉︎' },
    { name: 'Gemini', symbol: '♊︎' },
    { name: 'Cancer', symbol: '♋︎' },
    { name: 'Leo', symbol: '♌︎' },
    { name: 'Virgo', symbol: '♍︎' },
    { name: 'Libra', symbol: '♎︎' },
    { name: 'Scorpio', symbol: '♏︎' },
    { name: 'Sagittarius', symbol: '♐︎' },
    { name: 'Capricorn', symbol: '♑︎' },
    { name: 'Aquarius', symbol: '♒︎' },
    { name: 'Pisces', symbol: '♓︎' }
  ];
  
  // Each sign is 30 degrees
  const signIndex = Math.floor(longitude / 30) % 12;
  return signs[signIndex];
}

function getSignKeyword(sign, planet) {
  const keywords = {
    'Aries': {
      'sun': 'Pioneer',
      'moon': 'Passionate'
    },
    'Taurus': {
      'sun': 'Grounded Provider',
      'moon': 'Security Seeker'
    },
    'Gemini': {
      'sun': 'Communicator',
      'moon': 'Mentally Active'
    },
    'Cancer': {
      'sun': 'Nurturer',
      'moon': 'Emotional Sensitive'
    },
    'Leo': {
      'sun': 'Creative Leader',
      'moon': 'Dramatic Expressive'
    },
    'Virgo': {
      'sun': 'Analytical Perfectionist',
      'moon': 'Detail-Oriented'
    },
    'Libra': {
      'sun': 'Harmonizer',
      'moon': 'Partnership-Focused'
    },
    'Scorpio': {
      'sun': 'Intense Transformer',
      'moon': 'Emotional Depth'
    },
    'Sagittarius': {
      'sun': 'Adventurous Seeker',
      'moon': 'Freedom Lover'
    },
    'Capricorn': {
      'sun': 'Ambitious Achiever',
      'moon': 'Emotionally Reserved'
    },
    'Aquarius': {
      'sun': 'Revolutionary Visionary',
      'moon': 'Emotionally Detached'
    },
    'Pisces': {
      'sun': 'Compassionate Dreamer',
      'moon': 'Intuitive Empath'
    }
  };
  
  return keywords[sign]?.[planet] || `${sign} ${planet}`;
}

function calculateChineseZodiac(birthDate) {
  const date = new Date(birthDate);
  const year = date.getFullYear();
  
  // Chinese zodiac operates on a 12-year cycle
  const animals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
  const elements = ['Metal', 'Metal', 'Water', 'Water', 'Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth'];
  
  // Calculate animal and element based on year
  const animalIndex = (year - 4) % 12;
  const elementIndex = Math.floor((year % 10) / 2);
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
  
  return {
    animal: animals[animalIndex],
    element: elements[elementIndex],
    yin_yang: yinYang,
    keyword: keywords[animals[animalIndex]]
  };
}

function calculateNumerology(birthDate) {
  const date = new Date(birthDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  // Calculate Life Path Number by summing date digits
  const lifePathNumber = calculateLifePathNumber(day, month, year);
  
  // Define keywords for life path numbers
  const lifePathKeywords = {
    1: "Independent Leader",
    2: "Cooperative Peacemaker",
    3: "Creative Communicator",
    4: "Practical Builder",
    5: "Freedom Seeker",
    6: "Responsible Nurturer",
    7: "Seeker of Truth",
    8: "Abundant Manifester",
    9: "Humanitarian",
    11: "Intuitive Channel",
    22: "Master Builder",
    33: "Master Teacher"
  };
  
  // For demo purposes, let's generate some other numerology numbers
  const expressionNumber = (lifePathNumber + 2) % 9 || 9; // Simulated calculation
  const soulUrgeNumber = (lifePathNumber + 4) % 9 || 9; // Simulated calculation
  const personalityNumber = (lifePathNumber + 6) % 9 || 9; // Simulated calculation
  
  return {
    life_path_number: lifePathNumber,
    life_path_keyword: lifePathKeywords[lifePathNumber] || "Seeker",
    expression_number: expressionNumber,
    expression_keyword: lifePathKeywords[expressionNumber] || "Creator",
    soul_urge_number: soulUrgeNumber,
    soul_urge_keyword: lifePathKeywords[soulUrgeNumber] || "Intuitive",
    personality_number: personalityNumber
  };
}

function calculateLifePathNumber(day, month, year) {
  // Sum the digits of the birth date
  const sumDigits = (num) => {
    let sum = 0;
    while (num > 0) {
      sum += num % 10;
      num = Math.floor(num / 10);
    }
    return sum;
  };
  
  // Calculate sum of day, month, and year individually
  let daySum = sumDigits(day);
  let monthSum = sumDigits(month);
  let yearSum = sumDigits(year);
  
  // Calculate total sum
  let totalSum = daySum + monthSum + yearSum;
  
  // Reduce to a single digit or master number
  while (totalSum > 9 && totalSum !== 11 && totalSum !== 22 && totalSum !== 33) {
    totalSum = sumDigits(totalSum);
  }
  
  return totalSum;
}
