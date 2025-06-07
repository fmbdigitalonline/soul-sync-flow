
// Improved numerology calculations following classical Pythagorean method

export interface NumerologyProfile {
  life_path_number: number | string;
  expression_number: number | string;
  soul_urge_number: number | string;
  personality_number: number | string;
  birthday_number: number;
  life_path_keyword: string;
  expression_keyword: string;
  soul_urge_keyword: string;
  personality_keyword: string;
  calculation_method: string;
}

// Letter to number mapping (Pythagorean system)
const LETTER_VALUES: { [key: string]: number } = {
  'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
  'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
  'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
};

// Vowels for Soul Urge calculation
const VOWELS = new Set(['A', 'E', 'I', 'O', 'U', 'Y']);

export function calculateNumerology(birthDate: string, fullName: string): NumerologyProfile {
  console.log(`Calculating numerology for ${fullName}, born ${birthDate}`);
  
  const dateObj = new Date(birthDate);
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  const year = dateObj.getFullYear();
  
  // Life Path Number - proper digit-by-digit reduction
  const lifePathNumber = calculateLifePathNumber(month, day, year);
  
  // Expression Number (full name)
  const expressionNumber = calculateExpressionNumber(fullName);
  
  // Soul Urge Number (vowels only)
  const soulUrgeNumber = calculateSoulUrgeNumber(fullName);
  
  // Personality Number (consonants only)
  const personalityNumber = calculatePersonalityNumber(fullName);
  
  // Birthday Number (day of birth)
  const birthdayNumber = reduceNumber(day);
  
  return {
    life_path_number: lifePathNumber,
    expression_number: expressionNumber,
    soul_urge_number: soulUrgeNumber,
    personality_number: personalityNumber,
    birthday_number: birthdayNumber,
    life_path_keyword: getLifePathKeyword(lifePathNumber),
    expression_keyword: getExpressionKeyword(expressionNumber),
    soul_urge_keyword: getSoulUrgeKeyword(soulUrgeNumber),
    personality_keyword: getPersonalityKeyword(personalityNumber),
    calculation_method: "classical_pythagorean_with_master_numbers"
  };
}

// Proper Life Path calculation with master number preservation
function calculateLifePathNumber(month: number, day: number, year: number): number | string {
  console.log(`Calculating Life Path for ${month}/${day}/${year}`);
  
  // Reduce each component separately, preserving master numbers
  const reducedMonth = reduceNumber(month);
  const reducedDay = reduceNumber(day);
  const reducedYear = reduceToSingleDigitPreservingMasters(year);
  
  console.log(`Reduced components: month=${reducedMonth}, day=${reducedDay}, year=${reducedYear}`);
  
  // Add the reduced components
  const sum = Number(reducedMonth) + Number(reducedDay) + Number(reducedYear);
  console.log(`Sum of reduced components: ${sum}`);
  
  // Final reduction, preserving master numbers
  return reduceNumber(sum);
}

// Expression Number calculation (full name)
function calculateExpressionNumber(fullName: string): number | string {
  const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, '');
  let sum = 0;
  
  for (const letter of cleanName) {
    if (LETTER_VALUES[letter]) {
      sum += LETTER_VALUES[letter];
    }
  }
  
  return reduceNumber(sum);
}

// Soul Urge Number calculation (vowels only)
function calculateSoulUrgeNumber(fullName: string): number | string {
  const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, '');
  let sum = 0;
  
  for (const letter of cleanName) {
    if (VOWELS.has(letter) && LETTER_VALUES[letter]) {
      sum += LETTER_VALUES[letter];
    }
  }
  
  return reduceNumber(sum);
}

// Personality Number calculation (consonants only)
function calculatePersonalityNumber(fullName: string): number | string {
  const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, '');
  let sum = 0;
  
  for (const letter of cleanName) {
    if (!VOWELS.has(letter) && LETTER_VALUES[letter]) {
      sum += LETTER_VALUES[letter];
    }
  }
  
  return reduceNumber(sum);
}

// Proper reduction with master number preservation
function reduceNumber(num: number): number | string {
  if (num <= 9) return num;
  
  // Check for master numbers first
  if (num === 11 || num === 22 || num === 33) {
    return num.toString();
  }
  
  // Reduce by adding digits
  const digits = num.toString().split('').map(Number);
  const sum = digits.reduce((a, b) => a + b, 0);
  
  // Check if the sum is a master number
  if (sum === 11 || sum === 22 || sum === 33) {
    return sum.toString();
  }
  
  // Continue reducing if still greater than 9
  return sum > 9 ? reduceNumber(sum) : sum;
}

// Special reduction for years that preserves master numbers
function reduceToSingleDigitPreservingMasters(num: number): number | string {
  let current = num;
  
  while (current > 33) {
    const digits = current.toString().split('').map(Number);
    current = digits.reduce((a, b) => a + b, 0);
  }
  
  // Check for master numbers
  if (current === 11 || current === 22 || current === 33) {
    return current.toString();
  }
  
  // Final reduction to single digit
  while (current > 9) {
    const digits = current.toString().split('').map(Number);
    current = digits.reduce((a, b) => a + b, 0);
  }
  
  return current;
}

// Enhanced keyword mappings
function getLifePathKeyword(number: number | string): string {
  const keywords: { [key: string]: string } = {
    '1': 'The Leader - Independence and Innovation',
    '2': 'The Peacemaker - Cooperation and Harmony',
    '3': 'The Creative - Expression and Joy',
    '4': 'The Builder - Stability and Hard Work',
    '5': 'The Freedom Seeker - Adventure and Change',
    '6': 'The Nurturer - Responsibility and Care',
    '7': 'The Seeker - Spirituality and Analysis',
    '8': 'The Achiever - Material Success and Power',
    '9': 'The Humanitarian - Service and Compassion',
    '11': 'The Illuminator - Intuition and Inspiration (Master Number)',
    '22': 'The Master Builder - Vision and Manifestation (Master Number)',
    '33': 'The Master Teacher - Love and Healing (Master Number)'
  };
  return keywords[number.toString()] || 'Unknown Path';
}

function getExpressionKeyword(number: number | string): string {
  const keywords: { [key: string]: string } = {
    '1': 'Natural Leader',
    '2': 'Diplomatic Collaborator',
    '3': 'Creative Communicator',
    '4': 'Methodical Organizer',
    '5': 'Dynamic Explorer',
    '6': 'Caring Provider',
    '7': 'Analytical Thinker',
    '8': 'Ambitious Executive',
    '9': 'Compassionate Healer',
    '11': 'Intuitive Visionary',
    '22': 'Practical Idealist',
    '33': 'Spiritual Teacher'
  };
  return keywords[number.toString()] || 'Undefined Expression';
}

function getSoulUrgeKeyword(number: number | string): string {
  const keywords: { [key: string]: string } = {
    '1': 'Desires Independence',
    '2': 'Seeks Harmony',
    '3': 'Craves Creative Expression',
    '4': 'Wants Security',
    '5': 'Yearns for Freedom',
    '6': 'Needs to Nurture',
    '7': 'Seeks Understanding',
    '8': 'Desires Achievement',
    '9': 'Wants to Serve',
    '11': 'Seeks Spiritual Inspiration',
    '22': 'Desires to Build Legacy',
    '33': 'Wants to Heal and Teach'
  };
  return keywords[number.toString()] || 'Undefined Desire';
}

function getPersonalityKeyword(number: number | string): string {
  const keywords: { [key: string]: string } = {
    '1': 'Appears Confident',
    '2': 'Seems Gentle',
    '3': 'Appears Charming',
    '4': 'Seems Reliable',
    '5': 'Appears Dynamic',
    '6': 'Seems Caring',
    '7': 'Appears Mysterious',
    '8': 'Seems Authoritative',
    '9': 'Appears Generous',
    '11': 'Seems Inspiring',
    '22': 'Appears Capable',
    '33': 'Seems Wise'
  };
  return keywords[number.toString()] || 'Undefined Appearance';
}
