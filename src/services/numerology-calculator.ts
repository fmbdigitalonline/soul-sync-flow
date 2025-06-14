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

  static calculateNumerology(fullName: string, birthDate: string): NumerologyResult {
    console.log('🔢 NUMEROLOGY DEBUG: Starting calculation for:', { fullName, birthDate });
    
    const lifePathNumber = this.calculateLifePath(birthDate);
    const expressionNumber = this.calculateExpression(fullName);
    const soulUrgeNumber = this.calculateSoulUrge(fullName);
    const personalityNumber = this.calculatePersonality(fullName);
    const birthdayNumber = this.calculateBirthday(birthDate);

    console.log('🔢 NUMEROLOGY RESULTS:', {
      lifePathNumber,
      expressionNumber,
      soulUrgeNumber,
      personalityNumber,
      birthdayNumber
    });

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
  }

  private static calculateLifePath(birthDate: string): number {
    console.log('🔢 Life Path calculation for:', birthDate);
    
    // Parse date properly (YYYY-MM-DD format)
    const [year, month, day] = birthDate.split('-').map(num => parseInt(num, 10));
    
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
    
    return result;
  }

  private static calculateExpression(fullName: string): number {
    console.log('🔢 Expression calculation for:', fullName);
    
    const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, '');
    console.log('🔢 Clean name:', cleanName);
    
    let total = 0;
    const letterBreakdown: string[] = [];

    for (const letter of cleanName) {
      const value = this.letterValues[letter] || 0;
      total += value;
      letterBreakdown.push(`${letter}=${value}`);
    }

    console.log('🔢 Expression letter breakdown:', letterBreakdown.join(', '));
    console.log('🔢 Expression total before reduction:', total);
    
    const result = this.reduceToSingleDigitWithMasters(total);
    console.log('🔢 Expression result:', result);
    
    return result;
  }

  private static calculateSoulUrge(fullName: string): number {
    console.log('🔢 Soul Urge calculation for:', fullName);
    
    const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, '');
    let total = 0;
    const vowelBreakdown: string[] = [];

    for (const letter of cleanName) {
      if (this.vowels.includes(letter)) {
        const value = this.letterValues[letter] || 0;
        total += value;
        vowelBreakdown.push(`${letter}=${value}`);
      }
    }

    console.log('🔢 Soul Urge vowel breakdown:', vowelBreakdown.join(', '));
    console.log('🔢 Soul Urge total before reduction:', total);
    
    const result = this.reduceToSingleDigitWithMasters(total);
    console.log('🔢 Soul Urge result:', result);
    
    return result;
  }

  private static calculatePersonality(fullName: string): number {
    console.log('🔢 Personality calculation for:', fullName);
    
    const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, '');
    let total = 0;
    const consonantBreakdown: string[] = [];

    for (const letter of cleanName) {
      if (!this.vowels.includes(letter)) {
        const value = this.letterValues[letter] || 0;
        total += value;
        consonantBreakdown.push(`${letter}=${value}`);
      }
    }

    console.log('🔢 Personality consonant breakdown:', consonantBreakdown.join(', '));
    console.log('🔢 Personality total before reduction:', total);
    
    const result = this.reduceToSingleDigitWithMasters(total);
    console.log('🔢 Personality result:', result);
    
    return result;
  }

  private static calculateBirthday(birthDate: string): number {
    const [, , day] = birthDate.split('-').map(num => parseInt(num, 10));
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
