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
    try {
      // Validate input
      if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
        console.warn('🔢 NUMEROLOGY: Invalid or empty name provided, using fallback');
        return 1; // Fallback value
      }

      // Split into parts (first/middle/last)
      const nameParts = fullName.toUpperCase().split(/\s+/).filter(Boolean);
      
      if (nameParts.length === 0) {
        console.warn('🔢 NUMEROLOGY: No valid name parts found, using fallback');
        return 1; // Fallback value
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
    } catch (error) {
      console.error('🔢 NUMEROLOGY: Error in reduceNameParts:', error);
      return 1; // Fallback value
    }
  }

  static calculateNumerology(fullName: string, birthDate: string): NumerologyResult {
    console.log('🔢 NUMEROLOGY: Starting calculation with inputs:', { fullName, birthDate });
    
    try {
      // Provide fallbacks for missing inputs
      const safeName = fullName || 'Unknown Name';
      const safeBirthDate = birthDate || '1990-01-01';
      
      console.log('🔢 NUMEROLOGY: Using safe inputs:', { safeName, safeBirthDate });

      const lifePathNumber = this.calculateLifePath(safeBirthDate);
      const expressionNumber = this.calculateExpression(safeName);
      const soulUrgeNumber = this.calculateSoulUrge(safeName);
      const personalityNumber = this.calculatePersonality(safeName);
      const birthdayNumber = this.calculateBirthday(safeBirthDate);

      // Validate all calculations succeeded
      const numbers = [lifePathNumber, expressionNumber, soulUrgeNumber, personalityNumber, birthdayNumber];
      for (const num of numbers) {
        if (typeof num !== 'number' || isNaN(num) || num < 1) {
          console.warn('🔢 NUMEROLOGY: Invalid calculation result, using fallback:', num);
        }
      }

      const result = {
        lifePathNumber: lifePathNumber || 1,
        expressionNumber: expressionNumber || 1,
        soulUrgeNumber: soulUrgeNumber || 1,
        personalityNumber: personalityNumber || 1,
        birthdayNumber: birthdayNumber || 1,
        lifePathKeyword: this.getLifePathKeyword(lifePathNumber || 1),
        expressionKeyword: this.getExpressionKeyword(expressionNumber || 1),
        soulUrgeKeyword: this.getSoulUrgeKeyword(soulUrgeNumber || 1),
        personalityKeyword: this.getPersonalityKeyword(personalityNumber || 1),
        birthdayKeyword: this.getBirthdayKeyword(birthdayNumber || 1)
      };

      console.log('🔢 NUMEROLOGY RESULTS:', result);
      return result;
    } catch (error) {
      console.error('❌ Numerology calculation failed:', error);
      
      // Return safe fallback values
      return {
        lifePathNumber: 1,
        expressionNumber: 1,
        soulUrgeNumber: 1,
        personalityNumber: 1,
        birthdayNumber: 1,
        lifePathKeyword: this.getLifePathKeyword(1),
        expressionKeyword: this.getExpressionKeyword(1),
        soulUrgeKeyword: this.getSoulUrgeKeyword(1),
        personalityKeyword: this.getPersonalityKeyword(1),
        birthdayKeyword: this.getBirthdayKeyword(1)
      };
    }
  }

  private static calculateLifePath(birthDate: string): number {
    try {
      console.log('🔢 Life Path calculation for:', birthDate);
      
      // Handle different date formats and validate
      let year: number, month: number, day: number;
      
      if (birthDate.includes('-')) {
        const [yearStr, monthStr, dayStr] = birthDate.split('-');
        year = parseInt(yearStr, 10);
        month = parseInt(monthStr, 10);
        day = parseInt(dayStr, 10);
      } else {
        // Fallback for other formats
        const date = new Date(birthDate);
        year = date.getFullYear();
        month = date.getMonth() + 1;
        day = date.getDate();
      }
      
      if (isNaN(year) || isNaN(month) || isNaN(day) || year < 1900 || year > 2100) {
        console.warn('🔢 NUMEROLOGY: Invalid date components, using fallback');
        return 1;
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
      
      return result || 1;
    } catch (error) {
      console.error('🔢 NUMEROLOGY: Error in calculateLifePath:', error);
      return 1;
    }
  }

  // --- UPDATED TO STANDARD NAME-BY-NAME REDUCTION ---
  private static calculateExpression(fullName: string): number {
    try {
      // expression uses ALL letters
      return this.reduceNameParts(fullName, (ch) => /[A-Z]/.test(ch));
    } catch (error) {
      console.error('🔢 NUMEROLOGY: Error in calculateExpression:', error);
      return 1;
    }
  }

  private static calculateSoulUrge(fullName: string): number {
    try {
      // soul urge: ONLY vowels (A E I O U, maybe Y, but we skip Y for classic mode)
      return this.reduceNameParts(fullName, (ch) => ['A', 'E', 'I', 'O', 'U'].includes(ch));
    } catch (error) {
      console.error('🔢 NUMEROLOGY: Error in calculateSoulUrge:', error);
      return 1;
    }
  }

  private static calculatePersonality(fullName: string): number {
    try {
      // personality: ONLY consonants (all A-Z minus vowels)
      return this.reduceNameParts(fullName, (ch) => /[A-Z]/.test(ch) && !['A', 'E', 'I', 'O', 'U'].includes(ch));
    } catch (error) {
      console.error('🔢 NUMEROLOGY: Error in calculatePersonality:', error);
      return 1;
    }
  }

  private static calculateBirthday(birthDate: string): number {
    try {
      let day: number;
      
      if (birthDate.includes('-')) {
        const parts = birthDate.split('-');
        day = parseInt(parts[2], 10);
      } else {
        const date = new Date(birthDate);
        day = date.getDate();
      }
      
      if (isNaN(day) || day < 1 || day > 31) {
        console.warn('🔢 NUMEROLOGY: Invalid day in birth date, using fallback');
        return 1;
      }
      
      console.log('🔢 Birthday calculation for day:', day);
      
      const result = this.reduceToSingleDigitWithMasters(day);
      console.log('🔢 Birthday result:', result);
      
      return result || 1;
    } catch (error) {
      console.error('🔢 NUMEROLOGY: Error in calculateBirthday:', error);
      return 1;
    }
  }

  private static addDigits(num: number): number {
    return num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }

  private static reduceToSingleDigitWithMasters(num: number): number {
    try {
      console.log('🔢 Reducing:', num);
      
      if (isNaN(num) || num < 0) {
        console.warn('🔢 NUMEROLOGY: Invalid number for reduction, using fallback:', num);
        return 1;
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
      return num || 1;
    } catch (error) {
      console.error('🔢 NUMEROLOGY: Error in reduceToSingleDigitWithMasters:', error);
      return 1;
    }
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
