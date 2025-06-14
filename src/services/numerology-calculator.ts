import { BlueprintHealthChecker } from './blueprint-health-checker';

export interface NumerologyResult {
  lifePathNumber: number;
  expressionNumber: number;
  soulUrgeNumber: number;
  birthdayNumber: number;
  personalityNumber: number;
  lifePathKeyword: string;
  expressionKeyword: string;
  soulUrgeKeyword: string;
  birthdayKeyword: string;
  personalityKeyword: string;
}

export class NumerologyCalculator {
  // Traditional Pythagorean numerology letter values
  private static letterValues: Record<string, number> = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
    'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
  };

  private static vowels = ['A', 'E', 'I', 'O', 'U', 'Y']; // Include Y as vowel

  // Utility for name-by-name reduction (standard numerology)
  private static reduceNameParts(
    fullName: string,
    filterFn: (letter: string) => boolean
  ): number {
    // Validate input
    if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
      BlueprintHealthChecker.failIfHealthCheck('Numerology', 'Invalid or empty name provided');
    }

    // Split into parts (first/middle/last)
    const nameParts = fullName.toUpperCase().split(/\s+/).filter(Boolean);
    
    if (nameParts.length === 0) {
      BlueprintHealthChecker.failIfHealthCheck('Numerology', 'No valid name parts found');
    }

    const reducedParts: number[] = [];

    for (const part of nameParts) {
      // Get only relevant letters in this part
      const letters = part.replace(/[^A-Z]/g, '').split('').filter(filterFn);
      // Sum their values
      const sum = letters.reduce(
        (acc, ch) => acc + (this.letterValues[ch] || 0),
        0
      );
      // Reduce sum to 1 digit or master number
      const reduced = this.reduceToSingleDigitWithMasters(sum);
      reducedParts.push(reduced);
    }
    // Now sum the reduced values of all parts
    const total = reducedParts.reduce((a, b) => a + b, 0);
    return this.reduceToSingleDigitWithMasters(total);
  }

  static calculateNumerology(fullName: string, birthDate: string): NumerologyResult {
    console.log('🔢 NUMEROLOGY: Starting calculation with NO FALLBACKS');
    BlueprintHealthChecker.logValidation('Numerology', `Calculating for: ${fullName}, ${birthDate}`);
    
    // Validate inputs
    if (!fullName || !birthDate) {
      BlueprintHealthChecker.failIfHealthCheck('Numerology', 'Missing required inputs: fullName or birthDate');
    }

    // Validate birth date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      BlueprintHealthChecker.failIfHealthCheck('Numerology', 'Invalid birth date format. Expected YYYY-MM-DD');
    }

    try {
      const lifePathNumber = this.calculateLifePath(birthDate);
      const expressionNumber = this.calculateExpression(fullName);
      const soulUrgeNumber = this.calculateSoulUrge(fullName);
      const personalityNumber = this.calculatePersonality(fullName);
      const birthdayNumber = this.calculateBirthday(birthDate);

      // Validate all calculations succeeded
      const numbers = [lifePathNumber, expressionNumber, soulUrgeNumber, personalityNumber, birthdayNumber];
      for (const num of numbers) {
        if (typeof num !== 'number' || isNaN(num) || num < 1) {
          BlueprintHealthChecker.failIfHealthCheck('Numerology', `Invalid calculation result: ${num}`);
        }
      }

      console.log('🔢 NUMEROLOGY RESULTS:', {
        lifePathNumber,
        expressionNumber,
        soulUrgeNumber,
        personalityNumber,
        birthdayNumber
      });

      BlueprintHealthChecker.logValidation('Numerology', 'All calculations completed successfully');

      return {
        lifePathNumber,
        expressionNumber,
        soulUrgeNumber,
        personalityNumber,
        birthdayNumber,
        lifePathKeyword: this.getLifePathKeyword(lifePathNumber),
        expressionKeyword: this.getExpressionKeyword(expressionNumber),
        soulUrgeKeyword: this.getSoulUrgeKeyword(soulUrgeNumber),
        personalityKeyword: this.getPersonalityKeyword(personalityNumber),
        birthdayKeyword: this.getBirthdayKeyword(birthdayNumber)
      };
    } catch (error) {
      console.error('❌ Numerology calculation failed:', error);
      BlueprintHealthChecker.failIfHealthCheck('Numerology', `Calculation failed: ${error.message}`);
      throw error;
    }
  }

  private static calculateLifePath(birthDate: string): number {
    console.log('🔢 Life Path calculation for:', birthDate);
    
    // Parse date properly (YYYY-MM-DD format)
    const [year, month, day] = birthDate.split('-').map(num => parseInt(num, 10));
    
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      BlueprintHealthChecker.failIfHealthCheck('Numerology', 'Invalid date components in birth date');
    }
    
    console.log('🔢 Parsed date:', { year, month, day });
    
    // Traditional method: reduce each component separately first, then add
    const reducedMonth = this.reduceToSingleDigitWithMasters(month);
    const reducedDay = this.reduceToSingleDigitWithMasters(day);
    const reducedYear = this.reduceToSingleDigitWithMasters(year);
    
    console.log('🔢 Reduced components:', { reducedMonth, reducedDay, reducedYear });
    
    // Add the reduced components
    const total = reducedMonth + reducedDay + reducedYear;
    console.log('🔢 Total before final reduction:', total);
    
    const result = this.reduceToSingleDigitWithMasters(total);
    console.log('🔢 Life Path result:', result);
    
    if (result < 1 || result > 33) {
      BlueprintHealthChecker.failIfHealthCheck('Numerology', `Invalid Life Path result: ${result}`);
    }
    
    return result;
  }

  // --- UPDATED TO STANDARD NAME-BY-NAME REDUCTION ---
  private static calculateExpression(fullName: string): number {
    // expression uses ALL letters
    return this.reduceNameParts(fullName, (ch) => /[A-Z]/.test(ch));
  }

  private static calculateSoulUrge(fullName: string): number {
    // soul urge: ONLY vowels (A E I O U, maybe Y, but we skip Y for classic mode)
    return this.reduceNameParts(fullName, (ch) => ['A', 'E', 'I', 'O', 'U'].includes(ch));
  }

  private static calculatePersonality(fullName: string): number {
    // personality: ONLY consonants (all A-Z minus vowels)
    return this.reduceNameParts(fullName, (ch) => /[A-Z]/.test(ch) && !['A', 'E', 'I', 'O', 'U'].includes(ch));
  }

  private static calculateBirthday(birthDate: string): number {
    const [, , day] = birthDate.split('-').map(num => parseInt(num, 10));
    
    if (isNaN(day) || day < 1 || day > 31) {
      BlueprintHealthChecker.failIfHealthCheck('Numerology', `Invalid day in birth date: ${day}`);
    }
    
    console.log('🔢 Birthday calculation for day:', day);
    
    const result = this.reduceToSingleDigitWithMasters(day);
    console.log('🔢 Birthday result:', result);
    
    return result;
  }

  private static addDigits(num: number): number {
    return num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }

  private static reduceToSingleDigitWithMasters(num: number): number {
    console.log('🔢 Reducing:', num);
    
    if (isNaN(num) || num < 0) {
      BlueprintHealthChecker.failIfHealthCheck('Numerology', `Invalid number for reduction: ${num}`);
    }
    
    while (num > 9) {
      // Check if current number is a master number before reducing
      if (num === 11 || num === 22 || num === 33) {
        console.log('🔢 Master number found:', num);
        return num;
      }
      
      // Reduce by adding digits
      num = this.addDigits(num);
      console.log('🔢 After digit addition:', num);
      
      // Check again if the result is a master number
      if (num === 11 || num === 22 || num === 33) {
        console.log('🔢 Master number found after reduction:', num);
        return num;
      }
    }
    
    console.log('🔢 Final reduced number:', num);
    return num;
  }

  private static getLifePathKeyword(number: number): string {
    const keywords: Record<number, string> = {
      1: 'Independent Leader', 2: 'Cooperative Diplomat', 3: 'Creative Communicator', 
      4: 'Practical Builder', 5: 'Freedom Seeker', 6: 'Nurturing Caregiver',
      7: 'Spiritual Seeker', 8: 'Material Achiever', 9: 'Universal Humanitarian',
      11: 'Illuminating Visionary', 22: 'Master Builder', 33: 'Master Teacher'
    };
    return keywords[number] || 'Seeker';
  }

  private static getExpressionKeyword(number: number): string {
    const keywords: Record<number, string> = {
      1: 'Pioneering Leader', 2: 'Diplomatic Peacemaker', 3: 'Creative Communicator', 
      4: 'Practical Organizer', 5: 'Dynamic Adventurer', 6: 'Compassionate Helper',
      7: 'Analytical Thinker', 8: 'Executive Achiever', 9: 'Humanitarian Visionary',
      11: 'Inspirational Visionary (Master)', 22: 'Master Manifestor', 33: 'Universal Healer'
    };
    return keywords[number] || 'Seeker';
  }

  private static getSoulUrgeKeyword(number: number): string {
    const keywords: Record<number, string> = {
      1: 'Independent Pioneer', 2: 'Harmonious Peacemaker', 3: 'Creative Self-Expression', 
      4: 'Stable Security', 5: 'Adventure Freedom', 6: 'Nurturing Service',
      7: 'Spiritual Understanding', 8: 'Ambitious Manifestor', 9: 'Universal Love',
      11: 'Spiritual Insight', 22: 'Global Vision', 33: 'Universal Compassion'
    };
    return keywords[number] || 'Understanding';
  }

  private static getPersonalityKeyword(number: number): string {
    const keywords: Record<number, string> = {
      1: 'Original', 2: 'Sensitive', 3: 'Expressive', 4: 'Practical', 5: 'Versatile',
      6: 'Responsible', 7: 'Analytical', 8: 'Executive', 9: 'Generous',
      11: 'Intuitive', 22: 'Master Builder', 33: 'Master Teacher'
    };
    return keywords[number] || 'Unique';
  }

  private static getBirthdayKeyword(number: number): string {
    const keywords: Record<number, string> = {
      1: 'Original', 2: 'Sensitive', 3: 'Expressive', 4: 'Practical', 5: 'Versatile',
      6: 'Responsible', 7: 'Analytical', 8: 'Executive', 9: 'Generous',
      11: 'Intuitive', 22: 'Master Builder', 33: 'Master Teacher'
    };
    return keywords[number] || 'Unique';
  }
}
