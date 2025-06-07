
// Complete Human Design gate and center mappings with all 64 gates
export const GATE_TO_CENTER_MAP = {
  // Head Center (Crown) - Inspiration and Mental Pressure
  64: "Head", 61: "Head", 63: "Head",
  
  // Ajna Center - Mental Awareness and Conceptualization
  47: "Ajna", 24: "Ajna", 4: "Ajna", 11: "Ajna", 17: "Ajna", 43: "Ajna",
  
  // Throat Center - Manifestation and Communication
  62: "Throat", 23: "Throat", 56: "Throat", 35: "Throat", 12: "Throat", 
  45: "Throat", 33: "Throat", 8: "Throat", 31: "Throat", 20: "Throat", 16: "Throat",
  
  // G Center (Identity) - Love, Direction, and Identity
  25: "G", 46: "G", 22: "G", 36: "G", 25: "G", 15: "G", 10: "G", 7: "G", 1: "G", 13: "G",
  
  // Heart/Ego Center - Willpower and Material World
  26: "Heart", 51: "Heart", 21: "Heart", 40: "Heart",
  
  // Solar Plexus Center - Emotions and Awareness
  49: "Solar Plexus", 19: "Solar Plexus", 39: "Solar Plexus", 41: "Solar Plexus",
  30: "Solar Plexus", 55: "Solar Plexus", 37: "Solar Plexus", 6: "Solar Plexus", 22: "Solar Plexus",
  
  // Sacral Center - Life Force and Sexuality
  34: "Sacral", 5: "Sacral", 14: "Sacral", 29: "Sacral", 59: "Sacral", 
  9: "Sacral", 3: "Sacral", 42: "Sacral", 27: "Sacral",
  
  // Spleen Center - Intuition, Health, and Survival
  57: "Spleen", 32: "Spleen", 28: "Spleen", 44: "Spleen", 50: "Spleen", 18: "Spleen", 48: "Spleen",
  
  // Root Center - Pressure and Drive
  60: "Root", 52: "Root", 19: "Root", 39: "Root", 41: "Root", 53: "Root", 38: "Root", 54: "Root", 58: "Root"
};

// Complete 36-channel definitions connecting gates to determine defined centers
export const CHANNELS: Record<string, { name: string; centers: [string, string] }> = {
  "1-8": { name: "Inspiration", centers: ["G", "Throat"] },
  "2-14": { name: "The Beat", centers: ["G", "Sacral"] },
  "3-60": { name: "Mutation", centers: ["Root", "Sacral"] },
  "4-63": { name: "Logic", centers: ["Ajna", "Head"] },
  "5-15": { name: "Rhythm", centers: ["Sacral", "G"] },
  "6-59": { name: "Intimacy", centers: ["Solar Plexus", "Sacral"] },
  "7-31": { name: "The Alpha", centers: ["G", "Throat"] },
  "9-52": { name: "Concentration", centers: ["Root", "Sacral"] },
  "10-20": { name: "Awakening", centers: ["G", "Throat"] },
  "10-34": { name: "Exploration", centers: ["G", "Sacral"] },
  "11-56": { name: "Curiosity", centers: ["Ajna", "Throat"] },
  "12-22": { name: "Openness", centers: ["Throat", "Solar Plexus"] },
  "13-33": { name: "The Prodigal", centers: ["G", "Throat"] },
  "16-48": { name: "Waves of Talent", centers: ["Throat", "Spleen"] },
  "17-62": { name: "Acceptance", centers: ["Ajna", "Throat"] },
  "18-58": { name: "Judgement", centers: ["Spleen", "Root"] },
  "19-49": { name: "Synthesis", centers: ["Root", "Solar Plexus"] },
  "20-34": { name: "Charisma", centers: ["Throat", "Sacral"] },
  "20-57": { name: "Brain-Wave", centers: ["Throat", "Spleen"] },
  "21-45": { name: "Money", centers: ["Heart", "Throat"] },
  "23-43": { name: "Structuring", centers: ["Ajna", "Throat"] },
  "24-61": { name: "Awareness", centers: ["Ajna", "Head"] },
  "25-51": { name: "Initiation", centers: ["G", "Heart"] },
  "26-44": { name: "Surrender", centers: ["Heart", "Spleen"] },
  "27-50": { name: "Preservation", centers: ["Sacral", "Spleen"] },
  "28-38": { name: "Struggle", centers: ["Spleen", "Root"] },
  "29-46": { name: "Discovery", centers: ["Sacral", "G"] },
  "30-41": { name: "Recognition", centers: ["Solar Plexus", "Root"] },
  "32-54": { name: "Transformation", centers: ["Spleen", "Root"] },
  "34-57": { name: "Power", centers: ["Sacral", "Spleen"] },
  "35-36": { name: "Transitoriness", centers: ["Throat", "Solar Plexus"] },
  "37-40": { name: "Community", centers: ["Solar Plexus", "Heart"] },
  "39-55": { name: "Emoting", centers: ["Root", "Solar Plexus"] },
  "42-53": { name: "Maturation", centers: ["Root", "Sacral"] },
  "47-64": { name: "Abstraction", centers: ["Ajna", "Head"] },
  "57-10": { name: "Perfected Form", centers: ["Spleen", "G"] }
};

export const GATE_NAMES = {
  1: "Gate of Self-Expression",
  2: "Gate of the Direction of the Self",
  3: "Gate of Ordering",
  4: "Gate of Formulization",
  5: "Gate of Fixed Rhythms",
  6: "Gate of Friction",
  7: "Gate of the Role of the Self",
  8: "Gate of Contribution",
  9: "Gate of Focus",
  10: "Gate of Behavior of the Self",
  11: "Gate of Ideas",
  12: "Gate of Caution",
  13: "Gate of the Listener",
  14: "Gate of Power Skills",
  15: "Gate of Extremes",
  16: "Gate of Skills",
  17: "Gate of Opinions",
  18: "Gate of Correction",
  19: "Gate of Wanting",
  20: "Gate of the Now",
  21: "Gate of the Hunter",
  22: "Gate of Grace",
  23: "Gate of Assimilation",
  24: "Gate of Return",
  25: "Gate of the Spirit of the Self",
  26: "Gate of the Egoist",
  27: "Gate of Caring",
  28: "Gate of the Game Player",
  29: "Gate of Saying Yes",
  30: "Gate of Recognition",
  31: "Gate of Influence",
  32: "Gate of Duration",
  33: "Gate of Privacy",
  34: "Gate of Power",
  35: "Gate of Change",
  36: "Gate of Crisis",
  37: "Gate of Friendship",
  38: "Gate of Opposition",
  39: "Gate of Provocation",
  40: "Gate of Aloneness",
  41: "Gate of Contraction",
  42: "Gate of Growth",
  43: "Gate of Insight",
  44: "Gate of Coming to Meet",
  45: "Gate of the Gatherer",
  46: "Gate of the Determination of the Self",
  47: "Gate of Realization",
  48: "Gate of Depth",
  49: "Gate of Revolution",
  50: "Gate of Values",
  51: "Gate of Shock",
  52: "Gate of Inaction",
  53: "Gate of Beginnings",
  54: "Gate of Drive",
  55: "Gate of Spirit",
  56: "Gate of Stimulation",
  57: "Gate of Intuitive Clarity",
  58: "Gate of Vitality",
  59: "Gate of Sexuality",
  60: "Gate of Acceptance",
  61: "Gate of Mystery",
  62: "Gate of Details",
  63: "Gate of Doubt",
  64: "Gate of Confusion"
};
