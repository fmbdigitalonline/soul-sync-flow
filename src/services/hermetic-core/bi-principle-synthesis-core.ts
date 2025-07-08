// Bi-Principle Synthesis Core (BPSC) - Dual Paradigm Integration
// Implements Hermetic Principle of Gender/Duality ("Dual principles unite to create")

export interface CognitiveInput {
  id: string;
  type: 'rational' | 'intuitive';
  content: any;
  confidence: number;   // 0-1
  source: string;       // Which module provided this
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface SynthesisResult {
  id: string;
  synthesizedOutput: any;
  confidence: number;
  synthesis_method: string;
  rational_input: CognitiveInput;
  intuitive_input: CognitiveInput;
  conflict_resolution?: string;
  timestamp: Date;
}

export interface ConflictResolution {
  type: 'weighted_average' | 'contextual_preference' | 'consensus_seeking' | 'fallback_rational' | 'creative_fusion';
  reason: string;
  weight_rational?: number;
  weight_intuitive?: number;
}

class BiPrincipleSynthesisCore {
  private pendingRationalInputs: Map<string, CognitiveInput> = new Map();
  private pendingIntuitiveInputs: Map<string, CognitiveInput> = new Map();
  private synthesisHistory: SynthesisResult[] = [];
  private synthesisListeners: ((result: SynthesisResult) => void)[] = [];
  private isActive: boolean = false;
  private contextualPreferences: Map<string, 'rational' | 'intuitive' | 'balanced'> = new Map();

  constructor() {
    this.initializeContextualPreferences();
  }

  // Initialize contextual preferences for different domains/situations
  private initializeContextualPreferences(): void {
    this.contextualPreferences.set('safety_critical', 'rational');
    this.contextualPreferences.set('creative_task', 'intuitive');
    this.contextualPreferences.set('data_analysis', 'rational');
    this.contextualPreferences.set('user_interaction', 'balanced');
    this.contextualPreferences.set('problem_solving', 'balanced');
    this.contextualPreferences.set('planning', 'rational');
    this.contextualPreferences.set('inspiration', 'intuitive');
    
    console.log('🔄 BPSC: Initialized contextual synthesis preferences');
  }

  // Start synthesis processing
  start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('🔄 BPSC: Starting bi-principle synthesis');
  }

  // Submit rational input (from logical/analytical processes)
  submitRationalInput(
    sessionId: string,
    content: any,
    confidence: number,
    source: string,
    metadata?: Record<string, any>
  ): void {
    const input: CognitiveInput = {
      id: `rational_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: 'rational',
      content,
      confidence,
      source,
      timestamp: new Date(),
      metadata
    };

    this.pendingRationalInputs.set(sessionId, input);
    console.log(`🔄 BPSC: Received rational input from ${source} (confidence: ${confidence.toFixed(2)})`);
    
    // Check if we can synthesize
    this.attemptSynthesis(sessionId);
  }

  // Submit intuitive input (from pattern recognition/creative processes)
  submitIntuitiveInput(
    sessionId: string,
    content: any,
    confidence: number,
    source: string,
    metadata?: Record<string, any>
  ): void {
    const input: CognitiveInput = {
      id: `intuitive_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: 'intuitive',
      content,
      confidence,
      source,
      timestamp: new Date(),
      metadata
    };

    this.pendingIntuitiveInputs.set(sessionId, input);
    console.log(`🔄 BPSC: Received intuitive input from ${source} (confidence: ${confidence.toFixed(2)})`);
    
    // Check if we can synthesize
    this.attemptSynthesis(sessionId);
  }

  // Attempt to synthesize if both inputs are available
  private attemptSynthesis(sessionId: string): void {
    const rationalInput = this.pendingRationalInputs.get(sessionId);
    const intuitiveInput = this.pendingIntuitiveInputs.get(sessionId);

    if (!rationalInput || !intuitiveInput) {
      return; // Need both inputs to synthesize
    }

    // Clear pending inputs
    this.pendingRationalInputs.delete(sessionId);
    this.pendingIntuitiveInputs.delete(sessionId);

    // Perform synthesis
    const result = this.performSynthesis(rationalInput, intuitiveInput, sessionId);
    
    // Store result
    this.synthesisHistory.push(result);
    if (this.synthesisHistory.length > 100) {
      this.synthesisHistory = this.synthesisHistory.slice(-50);
    }

    console.log(`🔄 BPSC: Synthesized result using ${result.synthesis_method} (confidence: ${result.confidence.toFixed(2)})`);
    
    // Notify listeners
    this.synthesisListeners.forEach(listener => listener(result));
  }

  // Core synthesis logic
  private performSynthesis(
    rationalInput: CognitiveInput,
    intuitiveInput: CognitiveInput,
    sessionId: string
  ): SynthesisResult {
    // Determine synthesis method based on context and input characteristics
    const synthesisMethod = this.determineSynthesisMethod(rationalInput, intuitiveInput, sessionId);
    
    let synthesizedOutput: any;
    let confidence: number;
    let conflictResolution: string | undefined;

    switch (synthesisMethod.type) {
      case 'weighted_average':
        ({ output: synthesizedOutput, confidence } = this.weightedAverageSynthesis(
          rationalInput, 
          intuitiveInput, 
          synthesisMethod.weight_rational || 0.5,
          synthesisMethod.weight_intuitive || 0.5
        ));
        break;

      case 'contextual_preference':
        ({ output: synthesizedOutput, confidence } = this.contextualPreferenceSynthesis(
          rationalInput, 
          intuitiveInput, 
          sessionId
        ));
        break;

      case 'consensus_seeking':
        ({ output: synthesizedOutput, confidence, conflictResolution } = this.consensusSeekingSynthesis(
          rationalInput, 
          intuitiveInput
        ));
        break;

      case 'creative_fusion':
        ({ output: synthesizedOutput, confidence } = this.creativeFusionSynthesis(
          rationalInput, 
          intuitiveInput
        ));
        break;

      case 'fallback_rational':
      default:
        synthesizedOutput = rationalInput.content;
        confidence = rationalInput.confidence * 0.8; // Slight penalty for single-mode
        conflictResolution = 'defaulted_to_rational_due_to_conflict';
        break;
    }

    return {
      id: `synthesis_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      synthesizedOutput,
      confidence,
      synthesis_method: synthesisMethod.type,
      rational_input: rationalInput,
      intuitive_input: intuitiveInput,
      conflict_resolution: conflictResolution,
      timestamp: new Date()
    };
  }

  // Determine best synthesis method
  private determineSynthesisMethod(
    rationalInput: CognitiveInput,
    intuitiveInput: CognitiveInput,
    sessionId: string
  ): ConflictResolution {
    const confidenceDiff = Math.abs(rationalInput.confidence - intuitiveInput.confidence);
    const avgConfidence = (rationalInput.confidence + intuitiveInput.confidence) / 2;
    
    // Check for strong conflict
    if (this.detectStrongConflict(rationalInput, intuitiveInput)) {
      if (confidenceDiff > 0.3) {
        // High confidence difference - prefer more confident input
        return {
          type: 'weighted_average',
          reason: 'high_confidence_difference',
          weight_rational: rationalInput.confidence > intuitiveInput.confidence ? 0.8 : 0.2,
          weight_intuitive: intuitiveInput.confidence > rationalInput.confidence ? 0.8 : 0.2
        };
      } else {
        // Similar confidence but conflicting - seek consensus
        return {
          type: 'consensus_seeking',
          reason: 'conflicting_inputs_similar_confidence'
        };
      }
    }

    // Check contextual preferences
    const contextHint = this.inferContext(rationalInput, intuitiveInput, sessionId);
    const preference = this.contextualPreferences.get(contextHint);
    
    if (preference && preference !== 'balanced') {
      return {
        type: 'contextual_preference',
        reason: `context_suggests_${preference}`
      };
    }

    // High average confidence - try creative fusion
    if (avgConfidence > 0.7) {
      return {
        type: 'creative_fusion',
        reason: 'high_confidence_both_inputs'
      };
    }

    // Default to weighted average
    return {
      type: 'weighted_average',
      reason: 'standard_balanced_synthesis',
      weight_rational: 0.5,
      weight_intuitive: 0.5
    };
  }

  // Detect strong conflict between inputs
  private detectStrongConflict(rational: CognitiveInput, intuitive: CognitiveInput): boolean {
    // Simple heuristic: if both are high confidence but very different content types
    if (rational.confidence > 0.7 && intuitive.confidence > 0.7) {
      // Check content similarity (simplified)
      const rationalStr = JSON.stringify(rational.content).toLowerCase();
      const intuitiveStr = JSON.stringify(intuitive.content).toLowerCase();
      
      // Look for opposing keywords
      const opposingPairs = [
        ['yes', 'no'], ['true', 'false'], ['safe', 'risky'], 
        ['fast', 'slow'], ['simple', 'complex'], ['positive', 'negative']
      ];
      
      return opposingPairs.some(([word1, word2]) => 
        (rationalStr.includes(word1) && intuitiveStr.includes(word2)) ||
        (rationalStr.includes(word2) && intuitiveStr.includes(word1))
      );
    }
    
    return false;
  }

  // Infer context from inputs
  private inferContext(rational: CognitiveInput, intuitive: CognitiveInput, sessionId: string): string {
    // Analyze content and metadata for context clues
    const allContent = JSON.stringify([rational.content, intuitive.content]).toLowerCase();
    
    if (allContent.includes('safety') || allContent.includes('critical') || allContent.includes('error')) {
      return 'safety_critical';
    }
    if (allContent.includes('creative') || allContent.includes('design') || allContent.includes('art')) {
      return 'creative_task';
    }
    if (allContent.includes('data') || allContent.includes('analysis') || allContent.includes('metric')) {
      return 'data_analysis';
    }
    if (allContent.includes('user') || allContent.includes('interaction') || allContent.includes('conversation')) {
      return 'user_interaction';
    }
    if (allContent.includes('plan') || allContent.includes('strategy') || allContent.includes('goal')) {
      return 'planning';
    }
    
    return 'problem_solving'; // Default context
  }

  // Synthesis methods
  private weightedAverageSynthesis(
    rational: CognitiveInput,
    intuitive: CognitiveInput,
    rationalWeight: number,
    intuitiveWeight: number
  ): { output: any; confidence: number } {
    // Simple weighted combination
    if (typeof rational.content === 'string' && typeof intuitive.content === 'string') {
      const output = rationalWeight > intuitiveWeight ? 
        `${rational.content} (with consideration: ${intuitive.content})` :
        `${intuitive.content} (validated by: ${rational.content})`;
      
      const confidence = rational.confidence * rationalWeight + intuitive.confidence * intuitiveWeight;
      return { output, confidence };
    }
    
    // For objects, prefer the higher weighted one but include metadata from both
    const primaryInput = rationalWeight > intuitiveWeight ? rational : intuitive;
    const secondaryInput = rationalWeight > intuitiveWeight ? intuitive : rational;
    
    const output = {
      ...primaryInput.content,
      _synthesis_metadata: {
        primary_source: primaryInput.source,
        secondary_source: secondaryInput.source,
        synthesis_confidence: rational.confidence * rationalWeight + intuitive.confidence * intuitiveWeight
      }
    };
    
    return { 
      output, 
      confidence: rational.confidence * rationalWeight + intuitive.confidence * intuitiveWeight 
    };
  }

  private contextualPreferenceSynthesis(
    rational: CognitiveInput,
    intuitive: CognitiveInput,
    sessionId: string
  ): { output: any; confidence: number } {
    const context = this.inferContext(rational, intuitive, sessionId);
    const preference = this.contextualPreferences.get(context);
    
    if (preference === 'rational') {
      return { 
        output: rational.content, 
        confidence: rational.confidence * 0.95 // Slight boost for contextual match
      };
    } else if (preference === 'intuitive') {
      return { 
        output: intuitive.content, 
        confidence: intuitive.confidence * 0.95
      };
    }
    
    // Balanced - return weighted average
    return this.weightedAverageSynthesis(rational, intuitive, 0.5, 0.5);
  }

  private consensusSeekingSynthesis(
    rational: CognitiveInput,
    intuitive: CognitiveInput
  ): { output: any; confidence: number; conflictResolution: string } {
    // Try to find middle ground or compromise
    if (typeof rational.content === 'string' && typeof intuitive.content === 'string') {
      const output = `Considering both perspectives: ${rational.content} and ${intuitive.content}, a balanced approach suggests finding middle ground.`;
      const confidence = Math.min(rational.confidence, intuitive.confidence) * 0.8; // Conservative confidence
      
      return { 
        output, 
        confidence, 
        conflictResolution: 'synthesized_compromise_solution' 
      };
    }
    
    // For objects, create a merged version
    const output = {
      rational_perspective: rational.content,
      intuitive_perspective: intuitive.content,
      synthesis_note: 'Both perspectives have merit and should be considered together'
    };
    
    return {
      output,
      confidence: (rational.confidence + intuitive.confidence) / 2 * 0.8,
      conflictResolution: 'dual_perspective_preservation'
    };
  }

  private creativeFusionSynthesis(
    rational: CognitiveInput,
    intuitive: CognitiveInput
  ): { output: any; confidence: number } {
    // Combine insights creatively when both are high confidence
    const fusedOutput = {
      core_logic: rational.content,
      creative_enhancement: intuitive.content,
      fusion_insight: 'This solution combines logical structure with intuitive enhancement for optimal results',
      synthesis_type: 'creative_fusion'
    };
    
    // Boost confidence for successful fusion
    const confidence = Math.min(1.0, (rational.confidence + intuitive.confidence) / 2 * 1.1);
    
    return { output: fusedOutput, confidence };
  }

  // Get synthesis for session (blocking until both inputs received or timeout)
  async getSynthesis(sessionId: string, timeoutMs: number = 5000): Promise<SynthesisResult | null> {
    return new Promise((resolve) => {
      // Check if already have both inputs
      if (this.pendingRationalInputs.has(sessionId) && this.pendingIntuitiveInputs.has(sessionId)) {
        this.attemptSynthesis(sessionId);
      }

      // Listen for synthesis result
      const listener = (result: SynthesisResult) => {
        if (result.rational_input.metadata?.sessionId === sessionId || 
            result.intuitive_input.metadata?.sessionId === sessionId) {
          resolve(result);
        }
      };

      this.synthesisListeners.push(listener);

      // Timeout
      setTimeout(() => {
        const index = this.synthesisListeners.indexOf(listener);
        if (index > -1) this.synthesisListeners.splice(index, 1);
        resolve(null);
      }, timeoutMs);
    });
  }

  // Subscribe to synthesis results
  onSynthesis(listener: (result: SynthesisResult) => void): () => void {
    this.synthesisListeners.push(listener);
    return () => {
      const index = this.synthesisListeners.indexOf(listener);
      if (index > -1) this.synthesisListeners.splice(index, 1);
    };
  }

  // Get synthesis statistics
  getSynthesisStats() {
    const recentResults = this.synthesisHistory.slice(-10);
    const avgConfidence = recentResults.reduce((sum, r) => sum + r.confidence, 0) / recentResults.length || 0;
    
    const methodCounts = recentResults.reduce((counts, r) => {
      counts[r.synthesis_method] = (counts[r.synthesis_method] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return {
      totalSyntheses: this.synthesisHistory.length,
      recentAvgConfidence: avgConfidence,
      pendingRational: this.pendingRationalInputs.size,
      pendingIntuitive: this.pendingIntuitiveInputs.size,
      methodDistribution: methodCounts,
      isActive: this.isActive
    };
  }
}

export const biPrincipleSynthesisCore = new BiPrincipleSynthesisCore();