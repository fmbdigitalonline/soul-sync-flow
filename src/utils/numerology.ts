/**
 * Numerology utility functions for accurate calculation of life path numbers
 * and other numerology values based on birth data
 */

/**
 * Calculate life path number using the proper numerology methodology
 * @param birthDate Date string in YYYY-MM-DD format
 */
export function calculateLifePath(birthDate: string): number {
  const [year, month, day] = birthDate.split('-').map(Number);
  return calculateLifePathNumber(day, month, year);
}

/**
 * Calculate the life path number using the accurate algorithm
 * Sum the digits of each component (day, month, year) to a single digit first,
 * then sum those results and reduce to single digit unless it's a master number
 */
export function calculateLifePathNumber(day: number, month: number, year: number): number {
  // Sum each component separately
  const daySum = reduceSingleDigit(day);
  const monthSum = reduceSingleDigit(month);
  const yearSum = reduceSingleDigit(year.toString().split('').reduce((a, b) => a + parseInt(b), 0));
  
  // Sum the individual component sums
  const totalSum = daySum + monthSum + yearSum;
  
  // Final reduction to get the Life Path Number
  // Check if the sum is a master number before reduction
  if (totalSum === 11 || totalSum === 22 || totalSum === 33) {
    return totalSum;
  }
  
  // Otherwise reduce to a single digit
  return reduceSingleDigit(totalSum);
}

/**
 * Reduces a number to a single digit unless it's a master number (11, 22, 33)
 */
export function reduceSingleDigit(num: number): number {
  // Convert the number to a string to handle multi-digit numbers
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

/**
 * Get the description for a life path number
 */
export function getLifePathDescription(num: number): string {
  const descriptions = {
    1: "Independent Leader - Born to lead and pioneer new paths. You are self-reliant, ambitious, and determined.",
    2: "Cooperative Peacemaker - Natural diplomat with intuitive understanding of others. You thrive in partnerships and create harmony.",
    3: "Creative Communicator - Expressive, optimistic, and socially engaging. Your creativity and joy inspire others around you.",
    4: "Practical Builder - Solid, reliable foundation creator. Your methodical approach and hard work create lasting results.",
    5: "Freedom Seeker - Adventurous and versatile agent of change. You crave variety and experiences that expand your horizons.",
    6: "Responsible Nurturer - Compassionate healer and caregiver. You have a natural talent for supporting and teaching others.",
    7: "Seeker of Truth - Analytical, spiritual truth-seeker. You have a deep need to understand the mysteries of life.",
    8: "Abundant Manifester - Natural executive with material focus. You have the ability to achieve great success and prosperity.",
    9: "Humanitarian - Compassionate global citizen and completion energy. You serve humanity with wisdom and universal love.",
    11: "Intuitive Channel - Highly intuitive spiritual messenger with a mission to illuminate and inspire.",
    22: "Master Builder - Manifests grand visions into reality through practical application of spiritual wisdom.",
    33: "Master Teacher - Selfless nurturer with profound wisdom and an ability to uplift humanity."
  };

  return descriptions[num] || "Your life path leads you to seek meaning and purpose in unique ways.";
}
