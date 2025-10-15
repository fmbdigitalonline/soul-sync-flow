export interface ParsedSubTask {
  id: string;
  title: string;
  description?: string;
  estimatedTime?: string;
  energyLevel?: 'low' | 'medium' | 'high';
  completed: boolean;
}

export interface WorkingInstruction {
  id: string;
  title: string;
  description: string;
  timeEstimate?: string;
  toolsNeeded?: string[];
  completed: boolean;
}

export interface ParsedCoachMessage {
  type: 'breakdown' | 'guidance' | 'progress' | 'working_instructions' | 'general';
  originalText: string;
  subTasks?: ParsedSubTask[];
  actionItems?: string[];
  workingInstructions?: WorkingInstruction[];
  progressUpdate?: {
    percentage?: number;
    status?: string;
  };
}

export class CoachMessageParser {
  private static parsedCache = new Map<string, ParsedCoachMessage>();
  
  static parseMessage(content: string): ParsedCoachMessage {
    // Check cache first to prevent re-parsing
    const cacheKey = content.substring(0, 100);
    if (this.parsedCache.has(cacheKey)) {
      return this.parsedCache.get(cacheKey)!;
    }

    // Filter out system prompts and internal messages
    if (this.isSystemPrompt(content)) {
      const result = {
        type: 'general' as const,
        originalText: content
      };
      this.parsedCache.set(cacheKey, result);
      return result;
    }
    
    const lowerContent = content.toLowerCase();
    let result: ParsedCoachMessage;
    
    // PHASE 1 & 2: Enhanced working instructions detection with higher priority
    if (this.isWorkingInstructions(content)) {
      console.log('🔍 Detected working instructions format');
      result = {
        type: 'working_instructions',
        originalText: content,
        workingInstructions: this.extractWorkingInstructions(content)
      };
    }
    // Enhanced detection for task breakdown with stricter validation
    else if (this.isValidTaskBreakdown(content)) {
      result = {
        type: 'breakdown',
        originalText: content,
        subTasks: this.extractValidSubTasks(content)
      };
    } 
    // Detect progress update
    else if (this.isProgressUpdate(content)) {
      result = {
        type: 'progress',
        originalText: content,
        progressUpdate: this.extractProgressInfo(content)
      };
    }
    // Detect guidance with action items
    else if (this.hasActionItems(content)) {
      result = {
        type: 'guidance',
        originalText: content,
        actionItems: this.extractActionItems(content)
      };
    }
    else {
      result = {
        type: 'general',
        originalText: content
      };
    }
    
    // Cache the result
    this.parsedCache.set(cacheKey, result);
    return result;
  }
  
  // PHASE 1: Fixed and enhanced working instructions detection
  private static isWorkingInstructions(content: string): boolean {
    console.log('🔍 Checking for working instructions in content:', content.substring(0, 200));
    
    // PHASE 3: Context-aware detection - check if this is a response to instruction request
    const instructionRequestKeywords = [
      'detailed work instructions',
      'step-by-step instructions',
      'provide detailed',
      'guide you through',
      'structured approach',
      'here\'s how to',
      'break.*down.*steps',
      'manageable steps',
      'here are.*steps',
      'follow these steps',
      'let\'s break'
    ];
    
    const hasInstructionContext = instructionRequestKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );
    
    // PHASE 1: Enhanced pattern matching for various instruction formats
    const instructionPatterns = [
      // Format: "1. **Title:**" or "1. **Title**:"
      /^\d+\.\s*\*\*[^*]+\*\*\s*:/gm,
      // Format: "### Step 1:" or "## Step 1:"
      /^#{2,3}\s*Step\s*\d+\s*:/gim,
      // Format: numbered lists with bold titles
      /^\d+\.\s*\*\*[^*]+\*\*/gm,
      // Format: "Step 1:" or "1:"
      /^(Step\s*\d+|1\.|2\.|3\.|4\.|5\.)[\s:]/gm,
      // Format: "1. Define criteria for selecting..." (more lenient)
      /^\d+\.\s+[A-Z][^.\n]{10,}/gm
    ];
    
    // Check for instruction patterns
    const hasInstructionPatterns = instructionPatterns.some(pattern => {
      const matches = content.match(pattern);
      console.log('🔍 Pattern check:', pattern.toString(), 'matches:', matches?.length || 0);
      return matches && matches.length >= 2; // At least 2 steps for instructions
    });
    
    // PHASE 3: Enhanced format recognition
    const instructionIndicators = [
      /step-by-step instructions/i,
      /structured approach/i,
      /here's how to/i,
      /guide you through/i,
      /follow these steps/i,
      /working instructions/i,
      /execution:/i,
      /tips for execution/i
    ];
    
    const hasInstructionIndicators = instructionIndicators.some(pattern => pattern.test(content));
    
    // Must have substantial content
    const hasSubstantialContent = content.length > 300;
    
    // Should not be a system prompt
    const isNotSystemPrompt = !this.isSystemPrompt(content);
    
    const isWorkingInstructions = (hasInstructionPatterns || hasInstructionContext) && 
                                  (hasInstructionIndicators || content.length > 800) && 
                                  hasSubstantialContent && 
                                  isNotSystemPrompt;
    
    console.log('🔍 Working instructions detection:', {
      hasInstructionPatterns,
      hasInstructionContext,
      hasInstructionIndicators,
      hasSubstantialContent,
      isNotSystemPrompt,
      result: isWorkingInstructions,
      // NEW: Show which patterns matched
      matchedPatterns: instructionPatterns.map((p, i) => ({
        pattern: i,
        matches: content.match(p)?.length || 0
      })),
      matchedKeywords: instructionRequestKeywords.filter(k => 
        content.toLowerCase().includes(k) || new RegExp(k, 'i').test(content)
      )
    });
    
    return isWorkingInstructions;
  }
  
  private static isSystemPrompt(content: string): boolean {
    const systemIndicators = [
      /CURRENT TASK CONTEXT:/i,
      /As my productivity coach with access to/i,
      /As my productivity coach with task management capabilities/i,
      /ACTION: (complete_subtask|complete_task|update_progress)/i,
      /ACTION COMPLETED:/i,
      /ACTION FAILED:/i,
      /I need you to:/i,
      /Please structure your response so I can see clickable/i,
      /cognitive strengths and current energy conditions/i,
      /Starting your dream journey is an exciting endeavor/i,
      /core motivations of growth and authenticity/i,
      /### Smart Task Breakdown/i,
      /AI-generated action plan/i,
      /Format your response using numbered steps/i,
      /Use your task management functions/i
    ];
    
    return systemIndicators.some(pattern => pattern.test(content));
  }
  
  private static isValidTaskBreakdown(content: string): boolean {
    // Must have multiple numbered steps or clear step indicators
    const numberedSteps = content.match(/^(\d+\.|Step\s*\d+:|###\s*Step\s*\d+:)/gm);
    if (!numberedSteps || numberedSteps.length < 2) {
      return false;
    }
    
    // Must have meaningful task-related content OR step format
    const taskKeywords = [
      /break.*down.*task/i,
      /action.*plan/i,
      /steps.*complete/i,
      /(first|next|final).*step/i,
      /micro.*task/i,
      /sub.*task/i,
      /manageable.*steps/i
    ];
    
    // Check for conversational tone OR structured step format
    const conversationalIndicators = [
      /let's/i,
      /here's/i,
      /i'll help/i,
      /great!/i,
      /sure/i,
      /of course/i
    ];
    
    const hasTaskKeywords = taskKeywords.some(pattern => pattern.test(content));
    const hasConversationalTone = conversationalIndicators.some(pattern => pattern.test(content));
    const hasStepFormat = /###\s*Step\s*\d+:/i.test(content);
    
    // Must not be a system prompt
    const isNotSystemPrompt = !this.isSystemPrompt(content);
    
    // Content should be substantial (not just bullet points)
    const hasSubstantialContent = content.length > 100;
    
    // Don't classify as task breakdown if it's clearly working instructions
    const isNotWorkingInstructions = !this.isWorkingInstructions(content);
    
    return (hasTaskKeywords || hasStepFormat) && (hasConversationalTone || hasStepFormat) && 
           isNotSystemPrompt && hasSubstantialContent && numberedSteps.length >= 2 && isNotWorkingInstructions;
  }
  
  private static isProgressUpdate(content: string): boolean {
    const progressPatterns = [
      /progress.*update/i,
      /completed.*task/i,
      /\d+%.*complete/i,
      /finished.*step/i,
      /status.*update/i
    ];
    
    return progressPatterns.some(pattern => pattern.test(content)) && 
           !this.isSystemPrompt(content);
  }
  
  private static hasActionItems(content: string): boolean {
    const actionPatterns = [
      /recommend.*you/i,
      /suggest.*that/i,
      /consider.*doing/i,
      /try.*to/i,
      /focus.*on/i,
      /next.*action/i
    ];
    
    return actionPatterns.some(pattern => pattern.test(content)) && 
           !this.isSystemPrompt(content);
  }
  
  private static extractValidSubTasks(content: string): ParsedSubTask[] {
    const subTasks: ParsedSubTask[] = [];
    const seenTitles = new Set<string>();
    
    // More restrictive patterns for genuine task steps
    const patterns = [
      // ### Step 1:, ### Step 2:, etc. - capture full step content blocks
      /###\s*Step\s*(\d+)\s*:\s*([^\n]+)(?:\n((?:(?!###\s*Step\s*\d+)[\s\S])*?))?(?=###\s*Step\s*\d+|$)/gi,
      // Step 1:, Step 2:, etc. - must have substantial content after
      /Step\s*(\d+)\s*:\s*([^\n.]{10,}?)(?:\n([^\n]{10,}?))?(?=\n|$)/gi,
      // 1., 2., 3., etc. - must have substantial content after
      /^(\d+)\.\s*([^\n.]{10,}?)(?:\n([^\n]{10,}?))?(?=\n|$)/gm
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null && subTasks.length < 8) {
        const stepNumber = match[1] || String(subTasks.length + 1);
        let title = match[2]?.trim();
        let details = match[3]?.trim();
        
        // Special handling for ### Step format with Sub-task bullets
        if (pattern.toString().includes('###')) {
          // Look for Sub-task bullet point in the full step content
          const fullStepContent = match[0];
          const subTaskMatch = fullStepContent.match(/[•\-\*]\s*\*\*Sub-task\*\*:\s*([^\n.]+)/i);
          if (subTaskMatch) {
            title = subTaskMatch[1].trim();
            // Extract the remaining content as description
            const contentAfterSubTask = fullStepContent.substring(fullStepContent.indexOf('**Sub-task**:') + subTaskMatch[0].length);
            details = contentAfterSubTask.replace(/^\s*[•\-\*]\s*/, '').trim();
          } else {
            // Use the step title if no sub-task is found
            title = match[2]?.trim();
            details = match[3]?.trim();
          }
        }
        
        // Validate the title thoroughly
        if (this.isValidTaskTitle(title) && !seenTitles.has(title.toLowerCase())) {
          seenTitles.add(title.toLowerCase());
          
          subTasks.push({
            id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: title,
            description: details || this.extractDescription(match[0]),
            estimatedTime: this.extractTime(match[0]),
            energyLevel: this.extractEnergyLevel(match[0]),
            completed: false
          });
        }
      }
    });
    
    return subTasks;
  }
  
  private static isValidTaskTitle(title: string | undefined): boolean {
    if (!title || title.length < 8) return false;
    
    // Filter out common non-task patterns
    const invalidPatterns = [
      /^(What|Why|How|Where|When)\s/i, // Questions
      /\*\*(.*?)\*\*/g, // Markdown bold
      /cognitive strengths/i,
      /energy conditions/i,
      /dream journey/i,
      /core motivations/i,
      /feelings or values/i,
      /specific area of your life/i
    ];
    
    return !invalidPatterns.some(pattern => pattern.test(title));
  }
  
  private static extractDescription(text: string): string | undefined {
    if (!text) return undefined;
    const lines = text.split('\n').filter(line => line.trim() && line.length > 5);
    if (lines.length > 1) {
      return lines[1].trim();
    }
    return undefined;
  }
  
  private static extractTime(text: string): string | undefined {
    if (!text) return undefined;
    
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
    if (!text) return undefined;
    
    const lowerText = text.toLowerCase();
    if (lowerText.includes('low energy') || lowerText.includes('easy') || lowerText.includes('simple')) return 'low';
    if (lowerText.includes('high energy') || lowerText.includes('demanding') || lowerText.includes('complex')) return 'high';
    if (lowerText.includes('medium energy') || lowerText.includes('moderate') || lowerText.includes('normal')) return 'medium';
    return undefined;
  }
  
  private static extractActionItems(content: string): string[] {
    const actionItems: string[] = [];
    
    // Look for bullet points or action phrases
    const bulletMatches = content.match(/[-•*]\s*([^\n]{15,})/g);
    if (bulletMatches) {
      bulletMatches.forEach(match => {
        const item = match.replace(/^[-•*]\s*/, '').trim();
        if (item && item.length > 15 && !this.isSystemPrompt(item)) {
          actionItems.push(item);
        }
      });
    }
    
    // Look for recommendation patterns
    const recPatterns = [
      /(?:i recommend|suggest|advise|consider)[\s:]([^.!?]{15,})/gi,
      /(?:you should|try to|focus on)[\s:]([^.!?]{15,})/gi
    ];
    
    recPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const item = match[1]?.trim();
        if (item && item.length > 15 && !this.isSystemPrompt(item)) {
          actionItems.push(item);
        }
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
  
  // Clear cache when needed
  static clearCache(): void {
    this.parsedCache.clear();
  }
  
  // PHASE 1: Enhanced working instructions extraction with better pattern matching
  private static extractWorkingInstructions(content: string): WorkingInstruction[] {
    const instructions: WorkingInstruction[] = [];
    const seenTitles = new Set<string>();
    
    console.log('🔍 Extracting working instructions from content length:', content.length);
    
    // PHASE 1: Enhanced patterns to match various instruction formats
    const instructionPatterns = [
      // Format: "1. **Title:**" or "1. **Title**:"
      /^\d+\.\s*\*\*([^*]+)\*\*\s*:?\s*([\s\S]*?)(?=^\d+\.\s*\*\*|$)/gm,
      // Format: "### Step 1:" or "## Step 1:"
      /^#{2,3}\s*Step\s*\d+\s*:\s*([^\n]+)\n([\s\S]*?)(?=^#{2,3}\s*Step\s*\d+|$)/gm,
      // Format: numbered steps with descriptions
      /^(\d+)\.\s*([^:\n]{8,}?):\s*\n?([\s\S]*?)(?=^\d+\.\s*[^:\n]{8,}:|$)/gm
    ];
    
    let foundInstructions = false;
    
    instructionPatterns.forEach((pattern, patternIndex) => {
      console.log('🔍 Trying pattern', patternIndex + 1);
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      
      while ((match = regex.exec(content)) !== null && instructions.length < 15) {
        let title, description;
        
        if (patternIndex === 0) {
          // Pattern 1: 1. **Title**: description
          title = match[1]?.trim();
          description = match[2]?.trim();
        } else if (patternIndex === 1) {
          // Pattern 2: ### Step 1: title\ndescription
          title = match[1]?.trim();
          description = match[2]?.trim();
        } else {
          // Pattern 3: 1. title: description
          title = match[2]?.trim();
          description = match[3]?.trim();
        }
        
        console.log('🔍 Found potential instruction:', { title, description: description?.substring(0, 50) });
        
        if (title && description && title.length > 3 && description.length > 10 && !seenTitles.has(title.toLowerCase())) {
          seenTitles.add(title.toLowerCase());
          foundInstructions = true;
          
          // Extract time estimate from description
          const timeEstimate = this.extractTimeFromDescription(description);
          
          // Extract tools from description
          const toolsNeeded = this.extractToolsFromDescription(description);
          
          instructions.push({
            id: `instruction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: title,
            description: this.cleanDescription(description),
            timeEstimate,
            toolsNeeded,
            completed: false
          });
        }
      }
    });
    
    // PHASE 3: Fallback for simple numbered lists if no formal patterns found
    if (!foundInstructions && instructions.length === 0) {
      console.log('🔍 Trying fallback pattern for simple numbered lists');
      const fallbackPattern = /^(\d+)\.\s*([^\n]{10,})/gm;
      let match;
      
      while ((match = fallbackPattern.exec(content)) !== null && instructions.length < 10) {
        const title = match[2]?.trim();
        if (title && !seenTitles.has(title.toLowerCase())) {
          seenTitles.add(title.toLowerCase());
          
          instructions.push({
            id: `instruction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: title,
            description: title, // Use title as description for simple format
            timeEstimate: undefined,
            toolsNeeded: undefined,
            completed: false
          });
        }
      }
    }
    
    console.log('🔍 Extracted', instructions.length, 'working instructions');
    return instructions;
  }
  
  private static extractTimeFromDescription(description: string): string | undefined {
    const timePatterns = [
      /(\d+(?:-\d+)?)\s*(min|minute|hour|hr)s?/i,
      /spend\s+(\d+(?:-\d+)?)\s*(min|minute|hour|hr)s?/i,
      /take\s+(\d+(?:-\d+)?)\s*(min|minute|hour|hr)s?/i
    ];
    
    for (const pattern of timePatterns) {
      const match = description.match(pattern);
      if (match) {
        return `${match[1]} ${match[2]}`;
      }
    }
    return undefined;
  }
  
  private static extractToolsFromDescription(description: string): string[] | undefined {
    const tools: string[] = [];
    const toolPatterns = [
      /notebook|document|paper/i,
      /pen|pencil|keyboard/i,
      /timer|clock/i,
      /computer|laptop|phone/i,
      /app|software|tool/i
    ];
    
    toolPatterns.forEach(pattern => {
      const matches = description.match(pattern);
      if (matches) {
        tools.push(matches[0].toLowerCase());
      }
    });
    
    return tools.length > 0 ? [...new Set(tools)] : undefined;
  }
  
  private static cleanDescription(description: string): string {
    // Remove bullet points and extra whitespace, keep important formatting
    return description
      .replace(/^[\s-•*]+/gm, '')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  // Force refresh parsing by clearing cache
  static refreshParsing(): void {
    this.clearCache();
  }
}
