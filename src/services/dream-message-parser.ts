
export interface DreamChoice {
  id: string;
  text: string;
  emoji?: string;
}

export interface ParsedDreamMessage {
  type: 'question' | 'choices' | 'reflection' | 'conversation';
  content: string;
  question?: string;
  choices?: DreamChoice[];
  reflectionPrompt?: string;
}

export class DreamMessageParser {
  static parseMessage(content: string): ParsedDreamMessage {
    console.log('🌟 DreamMessageParser: Parsing message for dream discovery');
    
    // Detect multiple choice patterns
    const choicePatterns = [
      /\[Choice\s+([A-Z]):\s*([^\]]+)\]/gi,
      /\[([A-Z])\]\s*([^\[]+?)(?=\[|$)/gi,
      /([A-Z])\)\s*([^\n]+)/gi,
      /\*\*([A-Z])\)\*\*\s*([^\n]+)/gi
    ];
    
    let choices: DreamChoice[] = [];
    let cleanContent = content;
    
    // Try to extract choices using different patterns
    for (const pattern of choicePatterns) {
      const matches = Array.from(content.matchAll(pattern));
      if (matches.length > 0) {
        choices = matches.map((match, index) => ({
          id: match[1] || String.fromCharCode(65 + index),
          text: match[2].trim(),
          emoji: this.getRelevantEmoji(match[2])
        }));
        
        // Clean the content by removing choice patterns
        cleanContent = content.replace(pattern, '').trim();
        break;
      }
    }
    
    // Detect question patterns
    const questionPatterns = [
      /^(.*?)(?:\?[\s\n]*)/m,
      /(What|How|When|Where|Why|Which|Tell me|Describe|Imagine).*?\?/i
    ];
    
    let question = '';
    for (const pattern of questionPatterns) {
      const match = cleanContent.match(pattern);
      if (match) {
        question = match[0].trim();
        break;
      }
    }
    
    // Detect reflection prompts
    const reflectionPatterns = [
      /Take a moment to (think about|consider|reflect on|imagine)/i,
      /(Pause and|Let's explore|I invite you to)/i
    ];
    
    const isReflection = reflectionPatterns.some(pattern => pattern.test(content));
    
    // Determine message type
    let type: ParsedDreamMessage['type'] = 'conversation';
    
    if (choices.length > 0) {
      type = 'choices';
    } else if (question) {
      type = 'question';
    } else if (isReflection) {
      type = 'reflection';
    }
    
    console.log('🌟 DreamMessageParser: Parsed message type:', type, 'Choices:', choices.length);
    
    return {
      type,
      content: cleanContent,
      question: question || undefined,
      choices: choices.length > 0 ? choices : undefined,
      reflectionPrompt: isReflection ? cleanContent : undefined
    };
  }
  
  private static getRelevantEmoji(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('excit') || lowerText.includes('energy')) return '⚡';
    if (lowerText.includes('peace') || lowerText.includes('calm')) return '🕊️';
    if (lowerText.includes('challeng') || lowerText.includes('growth')) return '🌱';
    if (lowerText.includes('creativ') || lowerText.includes('art')) return '🎨';
    if (lowerText.includes('relationship') || lowerText.includes('love')) return '💝';
    if (lowerText.includes('career') || lowerText.includes('work')) return '🎯';
    if (lowerText.includes('adventure') || lowerText.includes('travel')) return '🌍';
    if (lowerText.includes('help') || lowerText.includes('serve')) return '🤝';
    if (lowerText.includes('money') || lowerText.includes('financial')) return '💰';
    if (lowerText.includes('health') || lowerText.includes('fitness')) return '💪';
    if (lowerText.includes('spiritual') || lowerText.includes('soul')) return '✨';
    if (lowerText.includes('family') || lowerText.includes('home')) return '🏠';
    
    return '💭';
  }
}
