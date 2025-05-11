
/**
 * Blueprint calculator utility functions
 */

/**
 * Create a seeded random number generator for deterministic results
 */
export function seedRandom(seed: number): () => number {
  // Simple LCG random number generator
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  
  return function() {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
}

/**
 * Calculate Julian day number for a given date
 * Used in astronomical calculations
 */
export function calculateJulianDay(year: number, month: number, day: number): number {
  // Adjust month and year for the algorithm
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  
  const a = Math.floor(year / 100);
  const b = 2 - a + Math.floor(a / 4);
  
  return Math.floor(365.25 * (year + 4716)) + 
         Math.floor(30.6001 * (month + 1)) + 
         day + b - 1524.5;
}

/**
 * Convert degrees to radians
 */
export function degreesToRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

/**
 * Convert radians to degrees
 */
export function radiansToDegrees(radians: number): number {
  return radians * 180 / Math.PI;
}

/**
 * Normalize angle to 0-360 degrees
 */
export function normalizeAngle(angle: number): number {
  return angle - 360 * Math.floor(angle / 360);
}
