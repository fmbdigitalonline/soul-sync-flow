
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

export interface NumerologyOptions {
  method: 'component' | 'full_digit';
}

// Letter to number mapping (Pythagorean system)
const LETTER_VALUES: { [key: string]: number } = {
  'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
  'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
  'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
};

// Vowels for Soul Urge calculation
const VOWELS = new Set(['A', 'E', 'I', 'O', 'U', 'Y']);

export function calculateNumerology(
  birthDate: string, 
  fullName: string, 
  options: NumerologyOptions = { method: 'component' }
): NumerologyProfile {
  console.log(`Calculating numerology for ${fullName}, born ${birthDate} using ${options.method} method`);
  
  // Parse date using UTC to avoid timezone shifting
  const [year, month, day] = birthDate.split('-').map(Number);
  const dateObj = new Date(Date.UTC(year, month - 1, day));
  
  // Life Path Number - with method selection
  const lifePathNumber = calculateLifePathNumber(year, month, day, options.method);
  
  // Expression Number (full name)
  const expressionNumber = calculateExpressionNumber(fullName);
  
  // Soul Urge Number (vowels only)
  const soulUrgeNumber = calculateSoulUrgeNumber(fullName);
  
  // Personality Number (consonants only)
  const personalityNumber = calculatePersonalityNumber(fullName);
  
  // Birthday Number (day of birth)
  const birthdayNumber = reduceToNumber(day);
  
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
    calculation_method: `${options.method}_pythagorean_with_master_numbers`
  };
}

// Normalize names to handle international characters
function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Strip diacritics
    .toUpperCase()
    .replace(/[^A-Z\s]/g, ''); // Keep letters and spaces for word splitting
}

// Life Path calculation with method selection
function calculateLifePathNumber(year: number, month: number, day: number, method: 'component' | 'full_digit'): number | string {
  console.log(`Calculating Life Path for ${month}/${day}/${year} using ${method} method`);
  
  if (method === 'full_digit') {
    // Full digit method: add all digits in the date
    const dateString = `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`;
    const digitSum = [...dateString].map(Number).reduce((a, b) => a + b, 0);
    console.log(`Full digit sum: ${digitSum}`);
    return reduceNumber(digitSum);
  }
  
  // Component method: reduce each component separately
  const reducedMonth = reduceToNumber(month);
  const reducedDay = reduceToNumber(day);
  const reducedYear = reduceYear(year);
  
  console.log(`Reduced components: month=${reducedMonth}, day=${reducedDay}, year=${reducedYear}`);
  
  // Add the reduced components
  const sum = reducedMonth + (typeof reducedYear === 'string' ? parseInt(reducedYear) : reducedYear);
  console.log(`Sum of reduced components: ${sum}`);
  
  return reduceNumber(sum);
}

// Expression Number calculation (full name)
function calculateExpressionNumber(fullName: string): number | string {
  const normalizedName = normalizeName(fullName);
  
  if (!normalizedName.trim()) {
    console.warn('Empty name after normalization');
    return 1; // Default fallback
  }
  
  let sum = 0;
  for (const letter of normalizedName.replace(/\s/g, '')) {
    if (LETTER_VALUES[letter]) {
      sum += LETTER_VALUES[letter];
    }
  }
  
  return reduceNumber(sum);
}

// Soul Urge Number calculation (vowels only)
function calculateSoulUrgeNumber(fullName: string): number | string {
  const normalizedName = normalizeName(fullName);
  let sum = 0;
  let hasVowels = false;
  
  for (const letter of normalizedName.replace(/\s/g, '')) {
    if (VOWELS.has(letter) && LETTER_VALUES[letter]) {
      sum += LETTER_VALUES[letter];
      hasVowels = true;
    }
  }
  
  if (!hasVowels) {
    console.warn('No vowels found in name');
    return 1; // Default fallback
  }
  
  return reduceNumber(sum);
}

// Personality Number calculation (consonants only)
function calculatePersonalityNumber(fullName: string): number | string {
  const normalizedName = normalizeName(fullName);
  let sum = 0;
  let hasConsonants = false;
  
  for (const letter of normalizedName.replace(/\s/g, '')) {
    if (!VOWELS.has(letter) && LETTER_VALUES[letter]) {
      sum += LETTER_VALUES[letter];
      hasConsonants = true;
    }
  }
  
  if (!hasConsonants) {
    console.warn('No consonants found in name');
    return 1; // Default fallback
  }
  
  return reduceNumber(sum);
}

// Improved reduction that preserves master numbers but returns consistent types
function reduceNumber(num: number): number | string {
  if (num <= 9) return num;
  
  // Check for master numbers first
  if (num === 11 || num === 22 || num === 33) {
    return num.toString();
  }
  
  // Reduce by adding digits
  let current = num;
  while (current > 9 && ![11, 22, 33].includes(current)) {
    const digits = current.toString().split('').map(Number);
    current = digits.reduce((a, b) => a + b, 0);
  }
  
  // Check if final result is a master number
  if (current === 11 || current === 22 || current === 33) {
    return current.toString();
  }
  
  return current;
}

// Helper for non-master-number reductions (always returns number)
function reduceToNumber(num: number): number {
  while (num > 9) {
    const digits = num.toString().split('').map(Number);
    num = digits.reduce((a, b) => a + b, 0);
  }
  return num;
}

// Special year reduction that preserves master numbers
function reduceYear(year: number): number | string {
  let current = year;
  
  // Reduce until we get to a manageable range
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

// Helper to get numeric value from number|string for calculations
function getNumericValue(value: number | string): number {
  return typeof value === 'string' ? parseInt(value) : value;
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
