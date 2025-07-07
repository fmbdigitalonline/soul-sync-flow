
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
    
    // Enhanced detection for task breakdown
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
      /sub[\s-]*task/i,
      /break.*down/i,
      /\d+\.\s/g,
      /first.*step/i,
      /next.*step/i,
      /micro[\s-]*task/i,
      /action.*step/i,
      /(here's|here are).*steps/i,
      /to.*complete.*this.*task/i
    ];
    
    // Check if multiple patterns match (stronger indication)
    const matchCount = breakdownPatterns.filter(pattern => pattern.test(content)).length;
    
    // Also check for multiple numbered items
    const numberedItems = content.match(/\d+\.\s/g);
    const hasMultipleSteps = numberedItems && numberedItems.length >= 2;
    
    return matchCount >= 2 || hasMultipleSteps;
  }
  
  private static isProgressUpdate(content: string): boolean {
    const progressPatterns = [
      /progress/i,
      /completed?/i,
      /\d+%/,
      /finished/i,
      /done/i,
      /update.*status/i
    ];
    
    return progressPatterns.some(pattern => pattern.test(content));
  }
  
  private static hasActionItems(content: string): boolean {
    const actionPatterns = [
      /should.*do/i,
      /recommend/i,
      /suggest/i,
      /try.*this/i,
      /next.*action/i,
      /consider/i,
      /focus.*on/i
    ];
    
    return actionPatterns.some(pattern => pattern.test(content));
  }
  
  private static extractSubTasks(content: string): ParsedSubTask[] {
    const subTasks: ParsedSubTask[] = [];
    
    // Enhanced extraction for numbered lists and steps
    const patterns = [
      // Step 1:, Step 2:, etc.
      /step\s*(\d+)\s*:\s*([^\n.]+)(?:[.\n]([^\n]*(?:time|duration|energy|min|hour)[^\n.]*))?/gi,
      // 1., 2., 3., etc.
      /(\d+)\.\s*([^\n.]+)(?:[.\n]([^\n]*(?:time|duration|energy|min|hour)[^\n.]*))?/gi,
      // - Bullet points
      /[-•*]\s*([^\n]+)(?:\n([^\n]*(?:time|duration|energy|min|hour)[^\n]*))?/gi
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const stepNumber = match[1] || String(subTasks.length + 1);
        const title = match[2].trim();
        const details = match[3]?.trim();
        
        if (title && title.length > 5) { // Filter out very short titles
          subTasks.push({
            id: `subtask-${Date.now()}-${stepNumber}`,
            title: title,
            description: details || this.extractDescription(match[0]),
            estimatedTime: this.extractTime(match[0]),
            energyLevel: this.extractEnergyLevel(match[0]),
            completed: false
          });
        }
      }
    });
    
    // Deduplicate based on similar titles
    const uniqueSubTasks = subTasks.filter((task, index, arr) => 
      arr.findIndex(t => this.similarTitles(t.title, task.title)) === index
    );
    
    return uniqueSubTasks.slice(0, 10); // Limit to reasonable number
  }
  
  private static similarTitles(title1: string, title2: string): boolean {
    const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const norm1 = normalize(title1);
    const norm2 = normalize(title2);
    
    // Check if one is a substring of the other or if they're very similar
    return norm1 === norm2 || 
           norm1.includes(norm2) || 
           norm2.includes(norm1) ||
           this.levenshteinDistance(norm1, norm2) < 3;
  }
  
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + substitutionCost
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
  
  private static extractDescription(text: string): string | undefined {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length > 1) {
      return lines[1].trim();
    }
    return undefined;
  }
  
  private static extractTime(text: string): string | undefined {
    const timePatterns = [
      /(\d+)\s*(min|minute)s?/i,
      /(\d+)\s*(hr|hour)s?/i,
      /(\d+)\s*(day)s?/i,
      /(\d+)-(\d+)\s*(min|minute|hr|hour)s?/i
    ];
    
    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        if (match[5]) { // Range match
          return `${match[1]}-${match[2]} ${match[3]}`;
        }
        return `${match[1]} ${match[2]}`;
      }
    }
    return undefined;
  }
  
  private static extractEnergyLevel(text: string): 'low' | 'medium' | 'high' | undefined {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('low energy') || lowerText.includes('easy') || lowerText.includes('simple')) return 'low';
    if (lowerText.includes('high energy') || lowerText.includes('demanding') || lowerText.includes('complex')) return 'high';
    if (lowerText.includes('medium energy') || lowerText.includes('moderate') || lowerText.includes('normal')) return 'medium';
    return undefined;
  }
  
  private static extractActionItems(content: string): string[] {
    const actionItems: string[] = [];
    
    // Look for bullet points or action phrases
    const bulletMatches = content.match(/[-•*]\s*([^\n]+)/g);
    if (bulletMatches) {
      bulletMatches.forEach(match => {
        const item = match.replace(/^[-•*]\s*/, '').trim();
        if (item && item.length > 10) actionItems.push(item);
      });
    }
    
    // Look for recommendation patterns
    const recPatterns = [
      /(?:i recommend|suggest|advise|consider)[\s:]([^.!?]+)/gi,
      /(?:you should|try to|focus on)[\s:]([^.!?]+)/gi
    ];
    
    recPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const item = match[1].trim();
        if (item && item.length > 10) actionItems.push(item);
      }
    });
    
    return actionItems.slice(0, 5); // Limit to reasonable number
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
