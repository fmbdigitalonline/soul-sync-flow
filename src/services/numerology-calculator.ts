
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
  private static letterValues: Record<string, number> = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
    'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
  };

  private static vowels = ['A', 'E', 'I', 'O', 'U'];

  static calculateNumerology(fullName: string, birthDate: string): NumerologyResult {
    const lifePathNumber = this.calculateLifePath(birthDate);
    const expressionNumber = this.calculateExpression(fullName);
    const soulUrgeNumber = this.calculateSoulUrge(fullName);
    const personalityNumber = this.calculatePersonality(fullName);
    const birthdayNumber = this.calculateBirthday(birthDate);

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
    // Parse date (YYYY-MM-DD format)
    const date = new Date(birthDate);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();

    // Add all digits together without reducing components first
    const total = this.addDigits(month) + this.addDigits(day) + this.addDigits(year);
    return this.reduceToSingleDigitWithMasters(total);
  }

  private static calculateExpression(fullName: string): number {
    const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, '');
    let total = 0;

    for (const letter of cleanName) {
      total += this.letterValues[letter] || 0;
    }

    return this.reduceToSingleDigitWithMasters(total);
  }

  private static calculateSoulUrge(fullName: string): number {
    const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, '');
    let total = 0;

    for (const letter of cleanName) {
      if (this.vowels.includes(letter)) {
        total += this.letterValues[letter] || 0;
      }
    }

    return this.reduceToSingleDigitWithMasters(total);
  }

  private static calculatePersonality(fullName: string): number {
    const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, '');
    let total = 0;

    for (const letter of cleanName) {
      if (!this.vowels.includes(letter)) {
        total += this.letterValues[letter] || 0;
      }
    }

    return this.reduceToSingleDigitWithMasters(total);
  }

  private static calculateBirthday(birthDate: string): number {
    const date = new Date(birthDate);
    const day = date.getDate();
    return this.reduceToSingleDigitWithMasters(day);
  }

  private static addDigits(num: number): number {
    return num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }

  private static reduceToSingleDigitWithMasters(num: number): number {
    while (num > 9) {
      // Check if current number is a master number before reducing
      if (num === 11 || num === 22 || num === 33) {
        return num;
      }
      
      // Reduce by adding digits
      num = this.addDigits(num);
      
      // Check again if the result is a master number
      if (num === 11 || num === 22 || num === 33) {
        return num;
      }
    }
    
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
