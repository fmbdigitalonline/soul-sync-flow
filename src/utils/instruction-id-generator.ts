/**
 * Instruction ID Generator
 * 
 * Generates deterministic IDs for working instructions based on content.
 * Same content = same ID, preventing duplicates across different parse routes.
 * 
 * Protocol Compliance:
 * - Principle #1: Correctness - deterministic hash prevents duplicates
 * - Principle #2: No hardcoded data - IDs derived from real content
 */

/**
 * Generate a deterministic instruction ID based on title and description
 * Uses a simple hash function to ensure same content always produces same ID
 */
export function generateInstructionId(title: string, description: string): string {
  const content = `${title.toLowerCase().trim()}_${description.toLowerCase().trim()}`;
  
  // Simple but effective hash function (DJB2)
  let hash = 5381;
  for (let i = 0; i < content.length; i++) {
    hash = ((hash << 5) + hash) + content.charCodeAt(i); // hash * 33 + c
  }
  
  // Convert to positive base36 string for readability
  const hashStr = Math.abs(hash).toString(36);
  
  return `instruction-${hashStr}`;
}

/**
 * Validate if an instruction ID follows the expected format
 */
export function isValidInstructionId(id: string): boolean {
  return /^instruction-[a-z0-9]+$/.test(id);
}
