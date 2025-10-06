export interface JSONExtractionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  originalResponse?: string;
  extractedJson?: string;
}

export const extractAndParseJSON = <T = any>(
  aiResponse: string,
  context: string = 'AI Response'
): JSONExtractionResult<T> => {
  console.log(`🔍 JSON EXTRACTION START - ${context}:`, {
    responseLength: aiResponse.length,
    preview: aiResponse.substring(0, 200)
  });

  try {
    // Strategy 1: Remove markdown code blocks
    let cleaned = aiResponse
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    // Strategy 2: Find JSON object boundaries
    const strategies = [
      // Try to find complete JSON object
      () => cleaned.match(/\{[\s\S]*\}/),
      // Try to find JSON array
      () => cleaned.match(/\[[\s\S]*\]/),
      // Try from first { to last }
      () => {
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          return [cleaned.substring(firstBrace, lastBrace + 1)];
        }
        return null;
      }
    ];

    let jsonMatch: RegExpMatchArray | string[] | null = null;
    
    for (const strategy of strategies) {
      jsonMatch = strategy();
      if (jsonMatch) {
        console.log(`✅ JSON EXTRACTION: Strategy succeeded`);
        break;
      }
    }

    if (!jsonMatch) {
      console.error(`❌ JSON EXTRACTION FAILED - ${context}:`, {
        responsePreview: aiResponse.substring(0, 500),
        hasOpenBrace: aiResponse.includes('{'),
        hasCloseBrace: aiResponse.includes('}')
      });
      
      return {
        success: false,
        error: 'No JSON structure found in AI response',
        originalResponse: aiResponse
      };
    }

    // Attempt to parse
    const extractedJson = jsonMatch[0];
    console.log(`🔍 ATTEMPTING JSON PARSE - ${context}:`, {
      extractedLength: extractedJson.length,
      preview: extractedJson.substring(0, 200)
    });

    const parsed = JSON.parse(extractedJson);
    
    console.log(`✅ JSON PARSE SUCCESS - ${context}:`, {
      type: Array.isArray(parsed) ? 'array' : 'object',
      keys: Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length
    });

    return {
      success: true,
      data: parsed as T,
      extractedJson
    };

  } catch (parseError) {
    console.error(`❌ JSON PARSE ERROR - ${context}:`, {
      error: parseError instanceof Error ? parseError.message : String(parseError),
      responsePreview: aiResponse.substring(0, 500)
    });

    return {
      success: false,
      error: parseError instanceof Error ? parseError.message : 'JSON parse failed',
      originalResponse: aiResponse
    };
  }
};
