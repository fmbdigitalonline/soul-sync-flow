
export interface CareerStatus {
  status: 'no_career' | 'unemployed' | 'between_jobs' | 'career_transition' | 'job_searching' | 'employed_struggling' | 'employed_satisfied' | 'career_change';
  confidence: number;
  context: string;
  indicators: string[];
}

export interface CareerClassificationResult {
  primaryStatus: CareerStatus;
  secondaryStatuses: CareerStatus[];
  needsConfirmation: boolean;
  suggestedResponse: string;
}

class CareerStatusClassifier {
  private careerlessPatterns = [
    /no\s+(career|job|work)/i,
    /don't\s+have\s+(a\s+)?(career|job)/i,
    /unemployed/i,
    /between\s+(jobs|gigs|positions)/i,
    /looking\s+for\s+(work|job)/i,
    /job\s+hunting/i,
    /haven't\s+worked/i,
    /not\s+working/i,
    /out\s+of\s+work/i
  ];

  private strugglingPatterns = [
    /hate\s+(my\s+)?(job|career|work)/i,
    /stuck\s+in\s+(my\s+)?(job|career)/i,
    /(burnt?\s?out|burnout)/i,
    /terrible\s+(job|boss|workplace)/i,
    /want\s+to\s+quit/i,
    /looking\s+for\s+(new|different)\s+(job|career)/i,
    /career\s+change/i,
    /transition/i
  ];

  private satisfiedPatterns = [
    /love\s+(my\s+)?(job|career|work)/i,
    /happy\s+(at\s+work|with\s+career)/i,
    /doing\s+well/i,
    /successful/i,
    /promoted/i,
    /career\s+growth/i
  ];

  classifyCareerStatus(message: string): CareerClassificationResult {
    const lowerMessage = message.toLowerCase();
    const statuses: CareerStatus[] = [];

    // Check for careerless indicators
    const careerlessMatches = this.careerlessPatterns.filter(pattern => pattern.test(message));
    if (careerlessMatches.length > 0) {
      statuses.push({
        status: this.determineCareerlessType(message),
        confidence: this.calculateConfidence(careerlessMatches.length, message.length),
        context: message,
        indicators: careerlessMatches.map(p => p.source)
      });
    }

    // Check for struggling indicators
    const strugglingMatches = this.strugglingPatterns.filter(pattern => pattern.test(message));
    if (strugglingMatches.length > 0) {
      statuses.push({
        status: 'employed_struggling',
        confidence: this.calculateConfidence(strugglingMatches.length, message.length),
        context: message,
        indicators: strugglingMatches.map(p => p.source)
      });
    }

    // Check for satisfied indicators
    const satisfiedMatches = this.satisfiedPatterns.filter(pattern => pattern.test(message));
    if (satisfiedMatches.length > 0) {
      statuses.push({
        status: 'employed_satisfied',
        confidence: this.calculateConfidence(satisfiedMatches.length, message.length),
        context: message,
        indicators: satisfiedMatches.map(p => p.source)
      });
    }

    // Sort by confidence
    statuses.sort((a, b) => b.confidence - a.confidence);

    const primaryStatus = statuses[0] || {
      status: 'employed_struggling', // Default assumption for career domain
      confidence: 0.3,
      context: message,
      indicators: []
    };

    return {
      primaryStatus,
      secondaryStatuses: statuses.slice(1),
      needsConfirmation: primaryStatus.confidence < 0.7,
      suggestedResponse: this.generateSuggestedResponse(primaryStatus, message)
    };
  }

  private determineCareerlessType(message: string): CareerStatus['status'] {
    if (/unemployed|lost\s+(my\s+)?job|laid\s+off|fired/i.test(message)) {
      return 'unemployed';
    }
    if (/between|looking\s+for|job\s+hunt/i.test(message)) {
      return 'job_searching';
    }
    if (/transition|changing|switch/i.test(message)) {
      return 'career_transition';
    }
    return 'no_career';
  }

  private calculateConfidence(matchCount: number, messageLength: number): number {
    const baseConfidence = Math.min(matchCount * 0.3, 0.9);
    const lengthBonus = messageLength > 50 ? 0.1 : 0;
    return Math.min(baseConfidence + lengthBonus, 1.0);
  }

  private generateSuggestedResponse(status: CareerStatus, message: string): string {
    switch (status.status) {
      case 'no_career':
        return "I hear that you don't currently have a career. That's actually a unique opportunity - we can explore what truly excites you without the constraints of an existing job. What draws your curiosity when you think about work or contribution?";
      
      case 'unemployed':
        return "I understand you're currently unemployed. That can bring both stress and possibility. How long has it been, and what's been the hardest part about this transition?";
      
      case 'job_searching':
        return "I see you're in the job search process. That takes courage and energy. What kind of work are you looking for, and how is the search going for you?";
      
      case 'career_transition':
        return "It sounds like you're in a career transition. These pivotal moments can be both exciting and uncertain. What's driving this change for you?";
      
      case 'employed_struggling':
        return "I hear that your current work situation is challenging. What specifically is making it difficult right now?";
      
      case 'employed_satisfied':
        return "It sounds like your career is going well. What aspects are working best for you, and what would make it even better?";
      
      default:
        return "Tell me more about what's happening with your career and work life right now.";
    }
  }
}

export const careerStatusClassifier = new CareerStatusClassifier();
