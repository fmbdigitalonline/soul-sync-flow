/**
 * Numerology calculation module for Blueprint Calculator
 * Implementing deterministic calculations for Life Path and other numbers
 */

/**
 * Calculate Life Path number from birth date
 * This is a deterministic implementation that correctly handles master numbers
 * @param dateStr Date string in format YYYY-MM-DD 
 * @returns Life Path number (single digit or master number 11, 22, 33)
 */
export function calculateLifePath(dateStr: string): number {
  try {
    console.log(`Calculating Life Path for date: ${dateStr}`);
    
    if (!dateStr || dateStr.length !== 10) {
      throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD`);
    }
    
    // Split the date into components
    const [year, month, day] = dateStr.split('-').map(part => parseInt(part, 10));
    
    // Validate date parts
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      throw new Error(`Invalid date components: ${year}, ${month}, ${day}`);
    }
    
    console.log(`Date components: Year=${year}, Month=${month}, Day=${day}`);
    
    // Calculate sum for each component separately
    const daySum = reduceSingleDigit(day);
    const monthSum = reduceSingleDigit(month);
    const yearSum = reduceSingleDigit(year.toString().split('').reduce((sum, digit) => sum + parseInt(digit, 10), 0));
    
    console.log(`Component sums - Day: ${daySum}, Month: ${monthSum}, Year: ${yearSum}`);
    
    // Sum the individual component sums
    let totalSum = daySum + monthSum + yearSum;
    
    console.log(`Total sum before final reduction: ${totalSum}`);
    
    // Check if the sum is a master number before final reduction
    if (totalSum === 11 || totalSum === 22 || totalSum === 33) {
      console.log(`Master number ${totalSum} found, not reducing further`);
      return totalSum;
    }
    
    // Otherwise, reduce to a single digit
    const finalDigit = reduceSingleDigit(totalSum);
    console.log(`Final Life Path number: ${finalDigit}`);
    
    return finalDigit;
  } catch (error) {
    console.error("Error calculating Life Path number:", error);
    return 0; // Return 0 in case of error to make debugging obvious
  }
}

/**
 * Calculate Expression number from name
 * @param name Full name
 * @returns Expression number
 */
export function calculateExpression(name: string): number {
  try {
    // Simple letter-to-number mapping for demonstration
    const letterValues: Record<string, number> = {
      'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8, 'i': 9,
      'j': 1, 'k': 2, 'l': 3, 'm': 4, 'n': 5, 'o': 6, 'p': 7, 'q': 8, 'r': 9,
      's': 1, 't': 2, 'u': 3, 'v': 4, 'w': 5, 'x': 6, 'y': 7, 'z': 8
    };
    
    console.log(`Calculating Expression for name: ${name}`);
    
    // Convert name to lowercase and remove non-alphabetic characters
    const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
    
    // Sum the values of all letters
    let total = 0;
    for (const char of cleanName) {
      if (letterValues[char]) {
        total += letterValues[char];
      }
    }
    
    console.log(`Initial Expression sum: ${total}`);
    
    // Reduce to single digit or master number
    while (total > 9 && total !== 11 && total !== 22 && total !== 33) {
      total = String(total).split('').map(d => parseInt(d, 10)).reduce((sum, digit) => sum + digit, 0);
      console.log(`Reduced Expression to: ${total}`);
    }
    
    return total;
  } catch (error) {
    console.error("Error calculating Expression number:", error);
    return 0;
  }
}

/**
 * Calculate Soul Urge number from name (vowels only)
 * @param name Full name
 * @returns Soul Urge number
 */
export function calculateSoulUrge(name: string): number {
  try {
    // Vowel values
    const vowelValues: Record<string, number> = {
      'a': 1, 'e': 5, 'i': 9, 'o': 6, 'u': 3, 'y': 7
    };
    
    console.log(`Calculating Soul Urge for name: ${name}`);
    
    // Convert name to lowercase
    const cleanName = name.toLowerCase();
    
    // Sum the values of all vowels
    let total = 0;
    for (const char of cleanName) {
      if (vowelValues[char]) {
        total += vowelValues[char];
      }
    }
    
    console.log(`Initial Soul Urge sum: ${total}`);
    
    // Reduce to single digit or master number
    while (total > 9 && total !== 11 && total !== 22 && total !== 33) {
      total = String(total).split('').map(d => parseInt(d, 10)).reduce((sum, digit) => sum + digit, 0);
      console.log(`Reduced Soul Urge to: ${total}`);
    }
    
    return total;
  } catch (error) {
    console.error("Error calculating Soul Urge number:", error);
    return 0;
  }
}

/**
 * Calculate Personality number from name (consonants only)
 * @param name Full name
 * @returns Personality number
 */
export function calculatePersonality(name: string): number {
  try {
    // Consonant values
    const consonantValues: Record<string, number> = {
      'b': 2, 'c': 3, 'd': 4, 'f': 6, 'g': 7, 'h': 8, 'j': 1, 'k': 2, 'l': 3,
      'm': 4, 'n': 5, 'p': 7, 'q': 8, 'r': 9, 's': 1, 't': 2, 'v': 4, 'w': 5,
      'x': 6, 'z': 8
    };
    
    console.log(`Calculating Personality for name: ${name}`);
    
    // Convert name to lowercase
    const cleanName = name.toLowerCase();
    
    // Sum the values of all consonants
    let total = 0;
    for (const char of cleanName) {
      if (consonantValues[char]) {
        total += consonantValues[char];
      }
    }
    
    console.log(`Initial Personality sum: ${total}`);
    
    // Reduce to single digit or master number
    while (total > 9 && total !== 11 && total !== 22 && total !== 33) {
      total = String(total).split('').map(d => parseInt(d, 10)).reduce((sum, digit) => sum + digit, 0);
      console.log(`Reduced Personality to: ${total}`);
    }
    
    return total;
  } catch (error) {
    console.error("Error calculating Personality number:", error);
    return 0;
  }
}

/**
 * Calculate Birth Day number (just the day of birth)
 * @param dateStr Date string in format YYYY-MM-DD
 * @returns Birth Day number
 */
export function calculateBirthDay(dateStr: string): number {
  try {
    // Extract the day part from the date
    const dayPart = dateStr.split('-')[2]; // Get the day portion (DD)
    
    if (!dayPart) {
      throw new Error(`Invalid date format: ${dateStr}`);
    }
    
    // Convert to number
    const day = parseInt(dayPart, 10);
    
    // If day is greater than 9, reduce to a single digit (except master numbers)
    let birthDay = day;
    if (day > 9 && day !== 11 && day !== 22) {
      birthDay = String(day).split('').map(d => parseInt(d, 10)).reduce((sum, digit) => sum + digit, 0);
    }
    
    console.log(`Birth Day calculated: ${birthDay} from day ${day}`);
    return birthDay;
  } catch (error) {
    console.error("Error calculating Birth Day number:", error);
    return 0;
  }
}

/**
 * Helper function to reduce a number to a single digit
 * unless it's a master number (11, 22, 33)
 * @param num Number to reduce
 * @returns Single digit or master number
 */
function reduceSingleDigit(num: number): number {
  let result = num;
  
  // Continue reducing until we reach a single digit, unless it's a master number
  while (result > 9 && result !== 11 && result !== 22 && result !== 33) {
    // Convert to string and sum the digits
    result = String(result).split('').reduce((sum, digit) => sum + parseInt(digit, 10), 0);
  }
  
  return result;
}
