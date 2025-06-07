
// Canonical Human Design Gate Wheel Mapping
// Gate 1 starts at 15° Aries, not 0° as per Jovian Archive standards

export interface GatePosition {
  gate: number;
  startDegree: number;
  endDegree: number;
  sign: string;
  decanate: number;
}

// Canonical 64-gate wheel mapping (Jovian Archive standard)
export const HUMAN_DESIGN_GATE_WHEEL: GatePosition[] = [
  // Starting at 15° Aries for Gate 1
  { gate: 1, startDegree: 15.0, endDegree: 20.625, sign: "Aries", decanate: 2 },
  { gate: 43, startDegree: 20.625, endDegree: 26.25, sign: "Aries", decanate: 3 },
  { gate: 14, startDegree: 26.25, endDegree: 30.0, sign: "Aries", decanate: 3 },
  { gate: 14, startDegree: 0.0, endDegree: 1.875, sign: "Taurus", decanate: 1 },
  { gate: 34, startDegree: 1.875, endDegree: 7.5, sign: "Taurus", decanate: 1 },
  { gate: 9, startDegree: 7.5, endDegree: 13.125, sign: "Taurus", decanate: 1 },
  { gate: 5, startDegree: 13.125, endDegree: 18.75, sign: "Taurus", decanate: 2 },
  { gate: 26, startDegree: 18.75, endDegree: 24.375, sign: "Taurus", decanate: 2 },
  { gate: 11, startDegree: 24.375, endDegree: 30.0, sign: "Taurus", decanate: 3 },
  
  { gate: 10, startDegree: 0.0, endDegree: 5.625, sign: "Gemini", decanate: 1 },
  { gate: 58, startDegree: 5.625, endDegree: 11.25, sign: "Gemini", decanate: 1 },
  { gate: 38, startDegree: 11.25, endDegree: 16.875, sign: "Gemini", decanate: 2 },
  { gate: 54, startDegree: 16.875, endDegree: 22.5, sign: "Gemini", decanate: 2 },
  { gate: 61, startDegree: 22.5, endDegree: 28.125, sign: "Gemini", decanate: 3 },
  { gate: 60, startDegree: 28.125, endDegree: 30.0, sign: "Gemini", decanate: 3 },
  
  { gate: 60, startDegree: 0.0, endDegree: 3.75, sign: "Cancer", decanate: 1 },
  { gate: 41, startDegree: 3.75, endDegree: 9.375, sign: "Cancer", decanate: 1 },
  { gate: 19, startDegree: 9.375, endDegree: 15.0, sign: "Cancer", decanate: 1 },
  { gate: 13, startDegree: 15.0, endDegree: 20.625, sign: "Cancer", decanate: 2 },
  { gate: 49, startDegree: 20.625, endDegree: 26.25, sign: "Cancer", decanate: 2 },
  { gate: 30, startDegree: 26.25, endDegree: 30.0, sign: "Cancer", decanate: 3 },
  
  { gate: 55, startDegree: 0.0, endDegree: 5.625, sign: "Leo", decanate: 1 },
  { gate: 37, startDegree: 5.625, endDegree: 11.25, sign: "Leo", decanate: 1 },
  { gate: 63, startDegree: 11.25, endDegree: 16.875, sign: "Leo", decanate: 2 },
  { gate: 22, startDegree: 16.875, endDegree: 22.5, sign: "Leo", decanate: 2 },
  { gate: 36, startDegree: 22.5, endDegree: 28.125, sign: "Leo", decanate: 3 },
  { gate: 25, startDegree: 28.125, endDegree: 30.0, sign: "Leo", decanate: 3 },
  
  { gate: 25, startDegree: 0.0, endDegree: 3.75, sign: "Virgo", decanate: 1 },
  { gate: 17, startDegree: 3.75, endDegree: 9.375, sign: "Virgo", decanate: 1 },
  { gate: 21, startDegree: 9.375, endDegree: 15.0, sign: "Virgo", decanate: 1 },
  { gate: 51, startDegree: 15.0, endDegree: 20.625, sign: "Virgo", decanate: 2 },
  { gate: 42, startDegree: 20.625, endDegree: 26.25, sign: "Virgo", decanate: 2 },
  { gate: 3, startDegree: 26.25, endDegree: 30.0, sign: "Virgo", decanate: 3 },
  
  { gate: 27, startDegree: 0.0, endDegree: 5.625, sign: "Libra", decanate: 1 },
  { gate: 24, startDegree: 5.625, endDegree: 11.25, sign: "Libra", decanate: 1 },
  { gate: 2, startDegree: 11.25, endDegree: 16.875, sign: "Libra", decanate: 2 },
  { gate: 23, startDegree: 16.875, endDegree: 22.5, sign: "Libra", decanate: 2 },
  { gate: 8, startDegree: 22.5, endDegree: 28.125, sign: "Libra", decanate: 3 },
  { gate: 20, startDegree: 28.125, endDegree: 30.0, sign: "Libra", decanate: 3 },
  
  { gate: 20, startDegree: 0.0, endDegree: 3.75, sign: "Scorpio", decanate: 1 },
  { gate: 16, startDegree: 3.75, endDegree: 9.375, sign: "Scorpio", decanate: 1 },
  { gate: 35, startDegree: 9.375, endDegree: 15.0, sign: "Scorpio", decanate: 1 },
  { gate: 45, startDegree: 15.0, endDegree: 20.625, sign: "Scorpio", decanate: 2 },
  { gate: 12, startDegree: 20.625, endDegree: 26.25, sign: "Scorpio", decanate: 2 },
  { gate: 15, startDegree: 26.25, endDegree: 30.0, sign: "Scorpio", decanate: 3 },
  
  { gate: 52, startDegree: 0.0, endDegree: 5.625, sign: "Sagittarius", decanate: 1 },
  { gate: 39, startDegree: 5.625, endDegree: 11.25, sign: "Sagittarius", decanate: 1 },
  { gate: 53, startDegree: 11.25, endDegree: 16.875, sign: "Sagittarius", decanate: 2 },
  { gate: 62, startDegree: 16.875, endDegree: 22.5, sign: "Sagittarius", decanate: 2 },
  { gate: 56, startDegree: 22.5, endDegree: 28.125, sign: "Sagittarius", decanate: 3 },
  { gate: 31, startDegree: 28.125, endDegree: 30.0, sign: "Sagittarius", decanate: 3 },
  
  { gate: 31, startDegree: 0.0, endDegree: 3.75, sign: "Capricorn", decanate: 1 },
  { gate: 33, startDegree: 3.75, endDegree: 9.375, sign: "Capricorn", decanate: 1 },
  { gate: 7, startDegree: 9.375, endDegree: 15.0, sign: "Capricorn", decanate: 1 },
  { gate: 4, startDegree: 15.0, endDegree: 20.625, sign: "Capricorn", decanate: 2 },
  { gate: 29, startDegree: 20.625, endDegree: 26.25, sign: "Capricorn", decanate: 2 },
  { gate: 59, startDegree: 26.25, endDegree: 30.0, sign: "Capricorn", decanate: 3 },
  
  { gate: 40, startDegree: 0.0, endDegree: 5.625, sign: "Aquarius", decanate: 1 },
  { gate: 64, startDegree: 5.625, endDegree: 11.25, sign: "Aquarius", decanate: 1 },
  { gate: 47, startDegree: 11.25, endDegree: 16.875, sign: "Aquarius", decanate: 2 },
  { gate: 6, startDegree: 16.875, endDegree: 22.5, sign: "Aquarius", decanate: 2 },
  { gate: 46, startDegree: 22.5, endDegree: 28.125, sign: "Aquarius", decanate: 3 },
  { gate: 18, startDegree: 28.125, endDegree: 30.0, sign: "Aquarius", decanate: 3 },
  
  { gate: 18, startDegree: 0.0, endDegree: 3.75, sign: "Pisces", decanate: 1 },
  { gate: 48, startDegree: 3.75, endDegree: 9.375, sign: "Pisces", decanate: 1 },
  { gate: 57, startDegree: 9.375, endDegree: 15.0, sign: "Pisces", decanate: 1 },
  { gate: 32, startDegree: 15.0, endDegree: 20.625, sign: "Pisces", decanate: 2 },
  { gate: 50, startDegree: 20.625, endDegree: 26.25, sign: "Pisces", decanate: 2 },
  { gate: 28, startDegree: 26.25, endDegree: 30.0, sign: "Pisces", decanate: 3 },
  
  { gate: 28, startDegree: 0.0, endDegree: 1.875, sign: "Aries", decanate: 1 },
  { gate: 44, startDegree: 1.875, endDegree: 7.5, sign: "Aries", decanate: 1 },
  { gate: 1, startDegree: 7.5, endDegree: 13.125, sign: "Aries", decanate: 1 },
  { gate: 43, startDegree: 13.125, endDegree: 15.0, sign: "Aries", decanate: 2 }
];

// Function to find gate and line from longitude using canonical wheel
export function findGateAndLineFromLongitude(longitude: number): { gate: number; line: number; gateName: string } {
  // Normalize longitude to 0-360 range
  const normalizedLongitude = ((longitude % 360) + 360) % 360;
  
  // Find the gate position
  let gatePosition: GatePosition | null = null;
  
  for (const position of HUMAN_DESIGN_GATE_WHEEL) {
    // Handle positions that cross sign boundaries
    if (position.startDegree > position.endDegree) {
      // Position crosses 0° (e.g., from 28° to 2° of next sign)
      if (normalizedLongitude >= position.startDegree || normalizedLongitude < position.endDegree) {
        gatePosition = position;
        break;
      }
    } else {
      // Normal position within a sign
      if (normalizedLongitude >= position.startDegree && normalizedLongitude < position.endDegree) {
        gatePosition = position;
        break;
      }
    }
  }
  
  if (!gatePosition) {
    // Fallback to old method if canonical lookup fails
    console.warn(`Could not find gate for longitude ${longitude}°, using fallback`);
    const gatePosition = ((normalizedLongitude + 15) % 360) / 5.625; // Adjust for 15° Aries start
    const gate = Math.floor(gatePosition) + 1;
    const linePosition = (gatePosition - Math.floor(gatePosition)) * 6;
    const line = Math.floor(linePosition) + 1;
    
    return {
      gate: gate > 64 ? gate - 64 : gate,
      line: Math.min(Math.max(line, 1), 6),
      gateName: `Gate ${gate > 64 ? gate - 64 : gate} (Fallback)`
    };
  }
  
  // Calculate line within the gate (each gate has 6 lines)
  const gateSpan = gatePosition.endDegree - gatePosition.startDegree;
  if (gateSpan < 0) {
    // Handle cross-boundary gates
    const adjustedLongitude = normalizedLongitude >= gatePosition.startDegree ? 
      normalizedLongitude - gatePosition.startDegree : 
      (360 - gatePosition.startDegree) + normalizedLongitude;
    const adjustedSpan = (360 - gatePosition.startDegree) + gatePosition.endDegree;
    const linePosition = (adjustedLongitude / adjustedSpan) * 6;
    const line = Math.floor(linePosition) + 1;
    
    return {
      gate: gatePosition.gate,
      line: Math.min(Math.max(line, 1), 6),
      gateName: getGateName(gatePosition.gate)
    };
  } else {
    const positionInGate = normalizedLongitude - gatePosition.startDegree;
    const linePosition = (positionInGate / gateSpan) * 6;
    const line = Math.floor(linePosition) + 1;
    
    return {
      gate: gatePosition.gate,
      line: Math.min(Math.max(line, 1), 6),
      gateName: getGateName(gatePosition.gate)
    };
  }
}

// Gate names mapping
function getGateName(gateNumber: number): string {
  const gateNames: { [key: number]: string } = {
    1: "The Creative", 2: "The Receptive", 3: "Difficulty at the Beginning", 4: "Youthful Folly",
    5: "Waiting", 6: "Conflict", 7: "The Army", 8: "Holding Together", 9: "Small Taming Power",
    10: "Treading", 11: "Peace", 12: "Standstill", 13: "Fellowship", 14: "Great Possessing",
    15: "Modesty", 16: "Enthusiasm", 17: "Following", 18: "Work on the Decayed", 19: "Approach",
    20: "Contemplation", 21: "Biting Through", 22: "Grace", 23: "Splitting Apart", 24: "Return",
    25: "Innocence", 26: "Great Taming Power", 27: "Nourishment", 28: "Great Preponderance",
    29: "The Abysmal", 30: "The Clinging Fire", 31: "Influence", 32: "Duration", 33: "Retreat",
    34: "Great Power", 35: "Progress", 36: "Darkening of the Light", 37: "The Family", 38: "Opposition",
    39: "Obstruction", 40: "Deliverance", 41: "Decrease", 42: "Increase", 43: "Breakthrough",
    44: "Coming to Meet", 45: "Gathering Together", 46: "Pushing Upward", 47: "Oppression",
    48: "The Well", 49: "Revolution", 50: "The Caldron", 51: "The Arousing", 52: "Keeping Still",
    53: "Development", 54: "The Marrying Maiden", 55: "Abundance", 56: "The Wanderer", 57: "The Gentle",
    58: "The Joyous", 59: "Dispersion", 60: "Limitation", 61: "Inner Truth", 62: "Small Preponderance",
    63: "After Completion", 64: "Before Completion"
  };
  
  return gateNames[gateNumber] || `Gate ${gateNumber}`;
}

// Convert absolute zodiacal longitude to Human Design gate/line
export function zodiacLongitudeToHumanDesignGate(longitude: number): { gate: number; line: number; sign: string; gateName: string } {
  const result = findGateAndLineFromLongitude(longitude);
  
  // Determine zodiac sign
  const normalizedLongitude = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedLongitude / 30);
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  
  return {
    gate: result.gate,
    line: result.line,
    sign: signs[signIndex],
    gateName: result.gateName
  };
}
