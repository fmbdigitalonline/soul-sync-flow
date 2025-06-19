
export interface ParsedSubTask {
  id: string;
  title: string;
  description?: string;
  estimatedTime?: string;
  energyLevel?: 'low' | 'medium' | 'high';
  completed: boolean;
}

export interface ParsedCoachMessage {
  type: 'breakdown' | 'guidance' | 'progress' | 'general';
  originalText: string;
  subTasks?: ParsedSubTask[];
  actionItems?: string[];
  progressUpdate?: {
    percentage?: number;
    status?: string;
  };
}

export class CoachMessageParser {
  static parseMessage(content: string): ParsedCoachMessage {
    const lowerContent = content.toLowerCase();
    
    // Detect sub-task breakdown
    if (this.isTaskBreakdown(content)) {
      return {
        type: 'breakdown',
        originalText: content,
        subTasks: this.extractSubTasks(content)
      };
    }
    
    // Detect progress update
    if (this.isProgressUpdate(content)) {
      return {
        type: 'progress',
        originalText: content,
        progressUpdate: this.extractProgressInfo(content)
      };
    }
    
    // Detect guidance with action items
    if (this.hasActionItems(content)) {
      return {
        type: 'guidance',
        originalText: content,
        actionItems: this.extractActionItems(content)
      };
    }
    
    return {
      type: 'general',
      originalText: content
    };
  }
  
  private static isTaskBreakdown(content: string): boolean {
    const breakdownPatterns = [
      /step\s*\d+/i,
      /sub-task/i,
      /break.*down/i,
      /\d+\.\s/g,
      /first.*step/i,
      /next.*step/i
    ];
    
    return breakdownPatterns.some(pattern => pattern.test(content));
  }
  
  private static isProgressUpdate(content: string): boolean {
    const progressPatterns = [
      /progress/i,
      /completed?/i,
      /\d+%/,
      /finished/i,
      /done/i
    ];
    
    return progressPatterns.some(pattern => pattern.test(content));
  }
  
  private static hasActionItems(content: string): boolean {
    const actionPatterns = [
      /should.*do/i,
      /recommend/i,
      /suggest/i,
      /try.*this/i,
      /next.*action/i
    ];
    
    return actionPatterns.some(pattern => pattern.test(content));
  }
  
  private static extractSubTasks(content: string): ParsedSubTask[] {
    const subTasks: ParsedSubTask[] = [];
    
    // Match numbered lists (1. 2. 3.)
    const numberedMatches = content.match(/\d+\.\s*([^\n]+)(?:\n([^\n]*(?:time|duration|energy)[^\n]*))?/gi);
    if (numberedMatches) {
      numberedMatches.forEach((match, index) => {
        const titleMatch = match.match(/\d+\.\s*([^\n]+)/);
        if (titleMatch) {
          subTasks.push({
            id: `subtask-${Date.now()}-${index}`,
            title: titleMatch[1].trim(),
            description: this.extractDescription(match),
            estimatedTime: this.extractTime(match),
            energyLevel: this.extractEnergyLevel(match),
            completed: false
          });
        }
      });
    }
    
    // Match step patterns (Step 1:, Step 2:)
    const stepMatches = content.match(/step\s*\d+\s*:\s*([^\n]+)(?:\n([^\n]*(?:time|duration|energy)[^\n]*))?/gi);
    if (stepMatches && subTasks.length === 0) {
      stepMatches.forEach((match, index) => {
        const titleMatch = match.match(/step\s*\d+\s*:\s*([^\n]+)/i);
        if (titleMatch) {
          subTasks.push({
            id: `step-${Date.now()}-${index}`,
            title: titleMatch[1].trim(),
            description: this.extractDescription(match),
            estimatedTime: this.extractTime(match),
            energyLevel: this.extractEnergyLevel(match),
            completed: false
          });
        }
      });
    }
    
    return subTasks;
  }
  
  private static extractDescription(text: string): string | undefined {
    const lines = text.split('\n');
    if (lines.length > 1) {
      return lines[1].trim();
    }
    return undefined;
  }
  
  private static extractTime(text: string): string | undefined {
    const timeMatch = text.match(/(\d+)\s*(min|hour|hr|day)s?/i);
    if (timeMatch) {
      return `${timeMatch[1]} ${timeMatch[2]}`;
    }
    return undefined;
  }
  
  private static extractEnergyLevel(text: string): 'low' | 'medium' | 'high' | undefined {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('low energy') || lowerText.includes('easy')) return 'low';
    if (lowerText.includes('high energy') || lowerText.includes('demanding')) return 'high';
    if (lowerText.includes('medium energy') || lowerText.includes('moderate')) return 'medium';
    return undefined;
  }
  
  private static extractActionItems(content: string): string[] {
    const actionItems: string[] = [];
    
    // Look for bullet points or action phrases
    const bulletMatches = content.match(/[-•*]\s*([^\n]+)/g);
    if (bulletMatches) {
      bulletMatches.forEach(match => {
        const item = match.replace(/^[-•*]\s*/, '').trim();
        if (item) actionItems.push(item);
      });
    }
    
    return actionItems;
  }
  
  private static extractProgressInfo(content: string): { percentage?: number; status?: string } {
    const percentageMatch = content.match(/(\d+)%/);
    const percentage = percentageMatch ? parseInt(percentageMatch[1]) : undefined;
    
    let status = 'in_progress';
    if (content.toLowerCase().includes('completed') || content.toLowerCase().includes('finished')) {
      status = 'completed';
    } else if (content.toLowerCase().includes('stuck') || content.toLowerCase().includes('blocked')) {
      status = 'stuck';
    }
    
    return { percentage, status };
  }
}
