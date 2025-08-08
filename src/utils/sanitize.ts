/**
 * Security utilities for input sanitization and XSS prevention
 * Following security best practices and the SoulSync Security Protocol
 */

/**
 * Safely interpolates variables into translation strings
 * Prevents XSS by escaping HTML entities in user-provided content
 */
export function safeInterpolateTranslation(
  template: string, 
  variables: Record<string, string | null | undefined>
): string {
  // Escape HTML entities to prevent XSS
  const escapeHtml = (text: string): string => {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML || '';
  };

  // Handle null or undefined template
  if (!template) return '';

  // Replace variables in template with escaped versions
  return Object.entries(variables).reduce((result, [key, value]) => {
    const placeholder = `{${key}}`;
    const safeValue = value ? escapeHtml(String(value)) : '';
    return result.replace(new RegExp(placeholder, 'g'), safeValue);
  }, template);
}

/**
 * Sanitizes user input for safe storage and display
 * Removes potential XSS vectors while preserving basic formatting
 */
export function sanitizeUserInput(input: string): string {
  if (!input) return '';
  
  // Remove script tags and event handlers
  const cleaned = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '');
    
  return cleaned.trim();
}

/**
 * Validates JSONB content to prevent injection attacks
 * Ensures only safe JSON structures are stored
 */
export function validateJsonbContent(content: any): boolean {
  try {
    // Ensure it's valid JSON
    const jsonString = JSON.stringify(content);
    const parsed = JSON.parse(jsonString);
    
    // Check for dangerous patterns
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:.*base64/i,
      /vbscript:/i
    ];
    
    const stringifiedContent = JSON.stringify(parsed);
    return !dangerousPatterns.some(pattern => pattern.test(stringifiedContent));
  } catch {
    return false;
  }
}

/**
 * Creates a safe HTML string for chart styles
 * Alternative to dangerouslySetInnerHTML for dynamic CSS
 */
export function createSafeStyleString(
  chartId: string, 
  colorConfig: Array<[string, any]>, 
  themes: Record<string, string>
): string {
  // Validate chart ID to prevent CSS injection
  const safeChartId = chartId.replace(/[^a-zA-Z0-9_-]/g, '');
  
  return Object.entries(themes)
    .map(([theme, prefix]) => {
      const validPrefix = prefix.replace(/[^a-zA-Z0-9\s\-_:.[\]]/g, '');
      const rules = colorConfig
        .map(([key, itemConfig]) => {
          const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '');
          const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color;
          const safeColor = color?.replace(/[^a-zA-Z0-9#%(),.\s-]/g, '') || '';
          return `  --color-${safeKey}: ${safeColor};`;
        })
        .join('\n');
      
      return `${validPrefix} [data-chart=${safeChartId}] {\n${rules}\n}`;
    })
    .join('\n');
}