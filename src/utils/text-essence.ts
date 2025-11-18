export function extractDreamEssence(input: string, maxLength = 220): string {
  if (!input) return '';

  const normalized = input.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;

  // Prefer ending at a natural sentence boundary if it appears early enough
  const sentenceBoundary = normalized.slice(0, maxLength + 50).search(/([.!?])\s/);
  if (sentenceBoundary !== -1 && sentenceBoundary < maxLength) {
    return normalized.slice(0, sentenceBoundary + 1).trim();
  }

  // Fall back to trimming at a word boundary near the limit
  const lastSpace = normalized.lastIndexOf(' ', maxLength);
  const cutoff = lastSpace > maxLength * 0.6 ? lastSpace : maxLength;

  return `${normalized.slice(0, cutoff).trim()}…`;
}
