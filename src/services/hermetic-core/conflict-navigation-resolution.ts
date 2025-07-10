// CNR - Conflict Navigation & Resolution Module
// Resolves personality conflicts and maintains coherence across frameworks

export interface PersonalityConflict {
  id: string;
  type: 'framework_mismatch' | 'trait_contradiction' | 'goal_conflict' | 'temporal_inconsistency';
  frameworks: string[];
  conflictingData: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  resolvedAt?: Date;
  resolution?: ConflictResolution;
  context: {
    sessionId: string;
    userInput?: string;
    currentMode: string;
  };
}

export interface ConflictResolution {
  method: 'prioritize' | 'synthesize' | 'context_switch' | 'user_clarification';
  outcome: Record<string, any>;
  confidence: number;
  reasoning: string;
  fallbackPlan?: string;
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  context: string;
  expectedAnswerType: 'choice' | 'scale' | 'text' | 'priority';
  options?: string[];
  conflictId: string;
}

class ConflictNavigationResolution {
  private activeConflicts: Map<string, PersonalityConflict> = new Map();
  private resolutionHistory: PersonalityConflict[] = [];
  private clarificationQueue: ClarifyingQuestion[] = [];
  private listeners: ((conflict: PersonalityConflict) => void)[] = [];
  private resolutionStrategies: Map<string, (conflict: PersonalityConflict) => ConflictResolution> = new Map();

  constructor() {
    this.initializeResolutionStrategies();
  }

  // Initialize conflict resolution strategies
  private initializeResolutionStrategies(): void {
    // Framework mismatch resolution
    this.resolutionStrategies.set('framework_mismatch', (conflict) => {
      const frameworks = conflict.frameworks;
      const conflictData = conflict.conflictingData;
      
      // Find common ground between frameworks
      const commonTraits = this.findCommonTraits(conflictData);
      
      if (commonTraits.length > 0) {
        return {
          method: 'synthesize',
          outcome: { synthesizedTraits: commonTraits },
          confidence: 0.8,
          reasoning: `Found ${commonTraits.length} compatible traits across ${frameworks.join(', ')}`,
          fallbackPlan: 'Use primary framework as baseline'
        };
      }
      
      // Default to prioritization by framework hierarchy
      return {
        method: 'prioritize',
        outcome: { primaryFramework: frameworks[0] },
        confidence: 0.6,
        reasoning: `No synthesis possible, prioritizing ${frameworks[0]}`,
        fallbackPlan: 'Request user preference'
      };
    });

    // Trait contradiction resolution
    this.resolutionStrategies.set('trait_contradiction', (conflict) => {
      const contradictingTraits = conflict.conflictingData;
      
      // Look for contextual explanations
      const contextualResolution = this.resolveByContext(contradictingTraits, conflict.context);
      
      if (contextualResolution) {
        return {
          method: 'context_switch',
          outcome: contextualResolution,
          confidence: 0.7,
          reasoning: 'Resolved through contextual interpretation',
          fallbackPlan: 'Average conflicting values'
        };
      }
      
      return {
        method: 'user_clarification',
        outcome: { requiresClarification: true },
        confidence: 0.3,
        reasoning: 'Unable to resolve automatically - user input needed'
      };
    });

    // Goal conflict resolution  
    this.resolutionStrategies.set('goal_conflict', (conflict) => {
      const conflictingGoals = conflict.conflictingData.goals || [];
      
      // Prioritize by urgency and importance
      const prioritizedGoals = this.prioritizeGoals(conflictingGoals);
      
      return {
        method: 'prioritize',
        outcome: { prioritizedGoals },
        confidence: 0.75,
        reasoning: 'Goals prioritized by urgency and alignment',
        fallbackPlan: 'Present goal conflicts to user'
      };
    });

    // Temporal inconsistency resolution
    this.resolutionStrategies.set('temporal_inconsistency', (conflict) => {
      const timeData = conflict.conflictingData;
      
      // Use recency bias with confidence weighting
      const recentData = this.weightByRecency(timeData);
      
      return {
        method: 'synthesize',
        outcome: { weightedData: recentData },
        confidence: 0.8,
        reasoning: 'Applied recency weighting to resolve temporal conflicts',
        fallbackPlan: 'Use latest data only'
      };
    });
  }

  // Detect conflicts between personality frameworks
  detectConflicts(
    personalityData: Record<string, any>,
    frameworks: string[],
    context: { sessionId: string; currentMode: string; userInput?: string }
  ): PersonalityConflict[] {
    const conflicts: PersonalityConflict[] = [];

    // Check for framework mismatches
    const frameworkConflicts = this.detectFrameworkMismatches(personalityData, frameworks);
    conflicts.push(...frameworkConflicts.map(fc => this.createConflict('framework_mismatch', fc, context)));

    // Check for trait contradictions
    const traitConflicts = this.detectTraitContradictions(personalityData);
    conflicts.push(...traitConflicts.map(tc => this.createConflict('trait_contradiction', tc, context)));

    // Check for goal conflicts
    const goalConflicts = this.detectGoalConflicts(personalityData);
    conflicts.push(...goalConflicts.map(gc => this.createConflict('goal_conflict', gc, context)));

    // Check for temporal inconsistencies
    const temporalConflicts = this.detectTemporalInconsistencies(personalityData);
    conflicts.push(...temporalConflicts.map(tc => this.createConflict('temporal_inconsistency', tc, context)));

    // Store active conflicts
    conflicts.forEach(conflict => {
      this.activeConflicts.set(conflict.id, conflict);
      this.notifyListeners(conflict);
    });

    console.log(`🔄 CNR: Detected ${conflicts.length} personality conflicts`);
    return conflicts;
  }

  // Create conflict object
  private createConflict(
    type: PersonalityConflict['type'],
    conflictData: { frameworks: string[]; data: Record<string, any> },
    context: PersonalityConflict['context']
  ): PersonalityConflict {
    return {
      id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      frameworks: conflictData.frameworks,
      conflictingData: conflictData.data,
      severity: this.assessSeverity(type, conflictData.data),
      detectedAt: new Date(),
      context
    };
  }

  // Resolve detected conflicts
  async resolveConflicts(conflicts: PersonalityConflict[]): Promise<Map<string, ConflictResolution>> {
    const resolutions = new Map<string, ConflictResolution>();

    for (const conflict of conflicts) {
      const strategy = this.resolutionStrategies.get(conflict.type);
      
      if (strategy) {
        try {
          const resolution = strategy(conflict);
          resolutions.set(conflict.id, resolution);
          
          // Mark conflict as resolved
          conflict.resolvedAt = new Date();
          conflict.resolution = resolution;
          
          // Move to history
          this.resolutionHistory.push(conflict);
          this.activeConflicts.delete(conflict.id);
          
          console.log(`🔄 CNR: Resolved ${conflict.type} conflict with ${resolution.method} (confidence: ${resolution.confidence})`);
        } catch (error) {
          console.error(`🔄 CNR: Failed to resolve conflict ${conflict.id}:`, error);
        }
      } else {
        console.warn(`🔄 CNR: No strategy found for conflict type: ${conflict.type}`);
      }
    }

    return resolutions;
  }

  // Generate clarifying questions for unresolvable conflicts
  generateClarifyingQuestions(conflict: PersonalityConflict): ClarifyingQuestion[] {
    const questions: ClarifyingQuestion[] = [];

    switch (conflict.type) {
      case 'framework_mismatch':
        questions.push({
          id: `q_${conflict.id}_framework`,
          question: `Your ${conflict.frameworks.join(' and ')} profiles suggest different preferences. Which feels more accurate to you?`,
          context: `Conflict between ${conflict.frameworks.join(' vs ')}`,
          expectedAnswerType: 'choice',
          options: conflict.frameworks,
          conflictId: conflict.id
        });
        break;

      case 'trait_contradiction':
        const traits = Object.keys(conflict.conflictingData);
        questions.push({
          id: `q_${conflict.id}_trait`,
          question: `We're seeing conflicting information about your ${traits.join(' and ')} traits. How would you describe yourself in this area?`,
          context: `Trait contradiction in ${traits.join(', ')}`,
          expectedAnswerType: 'scale',
          conflictId: conflict.id
        });
        break;

      case 'goal_conflict':
        questions.push({
          id: `q_${conflict.id}_priority`,
          question: 'You have multiple goals that may conflict. How would you prioritize them?',
          context: 'Goal prioritization needed',
          expectedAnswerType: 'priority',
          options: conflict.conflictingData.goals || [],
          conflictId: conflict.id
        });
        break;

      case 'temporal_inconsistency':
        questions.push({
          id: `q_${conflict.id}_temporal`,
          question: 'Your preferences seem to have changed over time. Which better represents how you feel now?',
          context: 'Temporal preference change',
          expectedAnswerType: 'choice',
          options: ['Recent preferences', 'Earlier preferences', 'A mix of both'],
          conflictId: conflict.id
        });
        break;
    }

    this.clarificationQueue.push(...questions);
    return questions;
  }

  // Process user responses to clarifying questions
  processUserClarification(questionId: string, response: any): ConflictResolution | null {
    const question = this.clarificationQueue.find(q => q.id === questionId);
    if (!question) return null;

    const conflict = this.activeConflicts.get(question.conflictId);
    if (!conflict) return null;

    const resolution: ConflictResolution = {
      method: 'user_clarification',
      outcome: { userResponse: response, questionId },
      confidence: 0.9, // High confidence in user-provided resolutions
      reasoning: `User clarification: ${response}`
    };

    // Apply the resolution
    conflict.resolvedAt = new Date();
    conflict.resolution = resolution;
    
    // Remove from active conflicts and queue
    this.activeConflicts.delete(conflict.id);
    this.clarificationQueue = this.clarificationQueue.filter(q => q.id !== questionId);
    this.resolutionHistory.push(conflict);

    console.log(`🔄 CNR: User resolved conflict ${conflict.id} via clarification`);
    return resolution;
  }

  // Utility methods for conflict detection
  private detectFrameworkMismatches(data: Record<string, any>, frameworks: string[]) {
    const conflicts = [];
    
    // Compare MBTI vs Big5
    if (frameworks.includes('mbti') && frameworks.includes('big5')) {
      const mbtiData = data.mbti || {};
      const big5Data = data.big5 || {};
      
      // Check for introversion/extraversion conflicts
      const mbtiE = mbtiData.extraversion || 0;
      const big5E = big5Data.extraversion || 0;
      
      if (Math.abs(mbtiE - big5E) > 0.5) {
        conflicts.push({
          frameworks: ['mbti', 'big5'],
          data: { extraversion: { mbti: mbtiE, big5: big5E } }
        });
      }
    }

    return conflicts;
  }

  private detectTraitContradictions(data: Record<string, any>) {
    const conflicts = [];
    
    // Look for contradictory trait values within the same framework
    Object.entries(data).forEach(([framework, traits]) => {
      if (typeof traits === 'object' && traits !== null) {
        const traitValues = Object.values(traits).filter(v => typeof v === 'number');
        const variance = this.calculateVariance(traitValues as number[]);
        
        if (variance > 0.8) { // High variance indicates potential contradictions
          conflicts.push({
            frameworks: [framework],
            data: { variance, traits }
          });
        }
      }
    });

    return conflicts;
  }

  private detectGoalConflicts(data: Record<string, any>) {
    const conflicts = [];
    const goals = data.goals || [];
    
    // Simple goal conflict detection - opposing goals
    for (let i = 0; i < goals.length; i++) {
      for (let j = i + 1; j < goals.length; j++) {
        if (this.areGoalsConflicting(goals[i], goals[j])) {
          conflicts.push({
            frameworks: ['goals'],
            data: { conflictingGoals: [goals[i], goals[j]] }
          });
        }
      }
    }

    return conflicts;
  }

  private detectTemporalInconsistencies(data: Record<string, any>) {
    const conflicts = [];
    
    // Check for changes in personality data over time
    if (data.history && Array.isArray(data.history)) {
      const recent = data.history.slice(-3); // Last 3 entries
      const older = data.history.slice(0, -3);
      
      if (recent.length > 0 && older.length > 0) {
        const recentAvg = this.averageTraits(recent);
        const olderAvg = this.averageTraits(older);
        
        const change = this.calculateTraitChange(recentAvg, olderAvg);
        if (change > 0.3) { // Significant change threshold
          conflicts.push({
            frameworks: ['temporal'],
            data: { recentAvg, olderAvg, change }
          });
        }
      }
    }

    return conflicts;
  }

  // Helper methods
  private findCommonTraits(conflictData: Record<string, any>): string[] {
    // Simplified common trait finder
    return Object.keys(conflictData).filter(trait => 
      typeof conflictData[trait] === 'object' && 
      Object.keys(conflictData[trait]).length > 1
    );
  }

  private resolveByContext(traits: Record<string, any>, context: PersonalityConflict['context']) {
    // Context-based resolution logic
    if (context.currentMode === 'professional') {
      return { contextualTraits: 'professional_oriented' };
    }
    return null;
  }

  private prioritizeGoals(goals: any[]): any[] {
    return goals.sort((a, b) => (b.importance || 0) - (a.importance || 0));
  }

  private weightByRecency(timeData: Record<string, any>) {
    // Apply recency bias to temporal data
    return Object.entries(timeData).reduce((acc, [key, value]) => {
      if (typeof value === 'object' && value.timestamp) {
        const age = Date.now() - new Date(value.timestamp).getTime();
        const weight = Math.exp(-age / (30 * 24 * 60 * 60 * 1000)); // 30-day decay
        acc[key] = { ...value, weight };
      }
      return acc;
    }, {} as Record<string, any>);
  }

  private assessSeverity(type: string, data: Record<string, any>): PersonalityConflict['severity'] {
    // Assess conflict severity based on type and data
    switch (type) {
      case 'framework_mismatch':
        return Object.keys(data).length > 3 ? 'high' : 'medium';
      case 'trait_contradiction':
        return data.variance > 0.9 ? 'critical' : 'high';
      case 'goal_conflict':
        return data.conflictingGoals?.length > 2 ? 'high' : 'medium';
      case 'temporal_inconsistency':
        return data.change > 0.5 ? 'high' : 'low';
      default:
        return 'medium';
    }
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private areGoalsConflicting(goal1: any, goal2: any): boolean {
    // Simplified goal conflict detection
    const opposites = [
      ['save', 'spend'], ['work', 'relax'], ['social', 'solitude']
    ];
    
    const g1 = goal1.description?.toLowerCase() || '';
    const g2 = goal2.description?.toLowerCase() || '';
    
    return opposites.some(([a, b]) => 
      (g1.includes(a) && g2.includes(b)) || 
      (g1.includes(b) && g2.includes(a))
    );
  }

  private averageTraits(entries: any[]): Record<string, number> {
    const traits: Record<string, number[]> = {};
    
    entries.forEach(entry => {
      Object.entries(entry.traits || {}).forEach(([trait, value]) => {
        if (typeof value === 'number') {
          if (!traits[trait]) traits[trait] = [];
          traits[trait].push(value);
        }
      });
    });
    
    const averages: Record<string, number> = {};
    Object.entries(traits).forEach(([trait, values]) => {
      averages[trait] = values.reduce((a, b) => a + b, 0) / values.length;
    });
    
    return averages;
  }

  private calculateTraitChange(recent: Record<string, number>, older: Record<string, number>): number {
    const commonTraits = Object.keys(recent).filter(t => t in older);
    if (commonTraits.length === 0) return 0;
    
    const changes = commonTraits.map(trait => Math.abs(recent[trait] - older[trait]));
    return changes.reduce((a, b) => a + b, 0) / changes.length;
  }

  // Public interface methods
  registerListener(listener: (conflict: PersonalityConflict) => void): void {
    this.listeners.push(listener);
  }

  private notifyListeners(conflict: PersonalityConflict): void {
    this.listeners.forEach(listener => {
      try {
        listener(conflict);
      } catch (error) {
        console.error('🔄 CNR: Listener error:', error);
      }
    });
  }

  getActiveConflicts(): PersonalityConflict[] {
    return Array.from(this.activeConflicts.values());
  }

  getResolutionHistory(): PersonalityConflict[] {
    return [...this.resolutionHistory];
  }

  getPendingQuestions(): ClarifyingQuestion[] {
    return [...this.clarificationQueue];
  }

  clearResolvedConflicts(): void {
    this.resolutionHistory = [];
    console.log('🔄 CNR: Cleared resolution history');
  }

  getStatus() {
    return {
      activeConflicts: this.activeConflicts.size,
      resolvedConflicts: this.resolutionHistory.length,
      pendingQuestions: this.clarificationQueue.length,
      resolutionStrategies: this.resolutionStrategies.size,
      isActive: true
    };
  }
}

export const conflictNavigationResolution = new ConflictNavigationResolution();