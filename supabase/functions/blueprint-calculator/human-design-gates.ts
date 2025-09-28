
// Mappings for Human Design gates, centers, and channels

// Map each gate to its center
export const GATE_TO_CENTER_MAP: {[key: number]: string} = {
  // Head
  64: "Head", 61: "Head", 63: "Head",
  // Ajna
  47: "Ajna", 24: "Ajna", 4: "Ajna", 17: "Ajna", 43: "Ajna", 11: "Ajna",
  // Throat
  62: "Throat", 23: "Throat", 56: "Throat", 35: "Throat", 12: "Throat",
  45: "Throat", 33: "Throat", 8: "Throat", 31: "Throat", 7: "Throat",
  1: "Throat", 13: "Throat", 10: "Throat", 20: "Throat", 16: "Throat",
  // G Center (Identity) - Primary assignments
  25: "G", 46: "G", 2: "G", 15: "G",
  // Heart/Ego
  21: "Heart", 40: "Heart", 26: "Heart", 51: "Heart",
  // Solar Plexus - Primary assignments
  6: "Solar Plexus", 37: "Solar Plexus", 30: "Solar Plexus", 55: "Solar Plexus",
  49: "Solar Plexus", 19: "Solar Plexus", 39: "Solar Plexus", 41: "Solar Plexus",
  22: "Solar Plexus", 36: "Solar Plexus",
  // Sacral - Primary assignments
  34: "Sacral", 29: "Sacral", 59: "Sacral", 9: "Sacral", 3: "Sacral", 42: "Sacral", 27: "Sacral",
  5: "Sacral", 14: "Sacral",
  // Spleen
  48: "Spleen", 57: "Spleen", 44: "Spleen", 50: "Spleen", 32: "Spleen", 28: "Spleen", 18: "Spleen",
  // Root
  53: "Root", 60: "Root", 52: "Root", 58: "Root", 38: "Root", 54: "Root"
};

// List of all channel pairs (for definition logic)
export const CHANNELS = [
  [64, 47], [61, 24], [63, 4], [17, 62], [43, 23], [11, 56], [35, 36], [12, 22], [8, 1], [31, 7], [33, 13], [10, 20], [16, 48],
  [25, 51], [46, 29], [2, 14], [15, 5], [21, 45], [26, 44], [40, 37], [51, 25], [6, 59], [37, 40], [30, 41], [55, 39],
  [49, 19], [22, 12], [36, 35], [34, 57], [34, 10], [34, 20], [5, 15], [14, 2], [29, 46], [59, 6], [27, 50], [3, 60],
  [42, 53], [9, 52], [48, 16], [57, 34], [57, 10], [57, 20], [44, 26], [50, 27], [32, 54], [28, 38], [18, 58],
  [53, 42], [60, 3], [52, 9], [19, 49], [39, 55], [41, 30], [58, 18], [38, 28], [54, 32]
];

export const HD_PLANETS = [
  "sun", "earth", "north_node", "south_node", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto"
];

export const PROFILE_LABELS = {
  1: "Investigator",
  2: "Hermit",
  3: "Martyr",
  4: "Opportunist",
  5: "Heretic",
  6: "Role Model"
};
