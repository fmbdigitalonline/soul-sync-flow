export function sanitizeCoachContent(content: string): string {
  if (!content) {
    return '';
  }

  let sanitized = content
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .replace(/<system>[\s\S]*?<\/system>/gi, '')
    .replace(/<instructions>[\s\S]*?<\/instructions>/gi, '')
    .replace(/<prompt>[\s\S]*?<\/prompt>/gi, '')
    .replace(/<internal>[\s\S]*?<\/internal>/gi, '')
    .replace(/\[SYSTEM\][\s\S]*?\[\/SYSTEM\]/gi, '')
    .replace(/\[INTERNAL\][\s\S]*?\[\/INTERNAL\]/gi, '')
    .replace(/\[PROMPT\][\s\S]*?\[\/PROMPT\]/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  sanitized = sanitized
    .replace(/(?:\n\s*)?Provide detailed[\s\S]*$/i, '')
    .replace(/(?:\n\s*)?Give me [\s\S]*$/i, '')
    .replace(/(?:\n\s*)?Format requirements:[\s\S]*$/i, '')
    .trim();

  return sanitized;
}
