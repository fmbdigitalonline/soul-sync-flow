// Causal Nexus Router (CNR) - Causal Reasoning and Decision Routing
// Implements Hermetic Principle of Cause and Effect ("Every effect has a cause")

export interface CausalLink {
  id: string;
  cause: string;
  effect: string;
  probability: number;    // 0-1, likelihood of effect given cause
  confidence: number;     // 0-1, confidence in this causal relationship
  evidence: string[];     // Supporting evidence or sources
  context: string[];      // Contextual conditions for this link
  weight: number;         // Importance weight in decision making
  lastUsed: Date;
  useCount: number;
}

export interface CausalChain {
  id: string;
  steps: CausalLink[];
  confidence: number;     // Overall chain confidence
  goal: string;          // Target effect/outcome
  cost: number;          // Estimated resource cost
  timeEstimate: number;  // Estimated time to complete
}

export interface DecisionRoute {
  action: string;
  expectedOutcome: string;
  causalJustification: CausalChain[];
  confidence: number;
  risks: string[];
  alternatives: string[];
}

class CausalNexusRouter {
  private causalModel: Map<string, CausalLink[]> = new Map(); // cause -> effects
  private reverseModel: Map<string, CausalLink[]> = new Map(); // effect -> causes
  private routingHistory: DecisionRoute[] = [];
  private isActive: boolean = false;

  constructor() {
    this.initializeBaseCausalModel();
  }

  // Initialize base causal relationships
  private initializeBaseCausalModel(): void {
    const baseCausalLinks: Omit<CausalLink, 'id' | 'lastUsed' | 'useCount'>[] = [
      // Intent and action relationships
      {
        cause: 'user_question',
        effect: 'information_retrieval_needed',
        probability: 0.9,
        confidence: 0.95,
        evidence: ['standard_qa_pattern'],
        context: ['conversational_mode'],
        weight: 0.8
      },
      {
        cause: 'unclear_user_input',
        effect: 'clarification_request_needed',
        probability: 0.8,
        confidence: 0.85,
        evidence: ['conversation_best_practices'],
        context: ['interactive_mode'],
        weight: 0.7
      },
      {
        cause: 'complex_task_request',
        effect: 'task_decomposition_needed',
        probability: 0.85,
        confidence: 0.8,
        evidence: ['task_management_principles'],
        context: ['planning_mode'],
        weight: 0.9
      },
      // Memory and context relationships
      {
        cause: 'context_switch',
        effect: 'memory_consolidation_needed',
        probability: 0.7,
        confidence: 0.75,
        evidence: ['cognitive_architecture_patterns'],
        context: ['multi_domain_operation'],
        weight: 0.6
      },
      {
        cause: 'repeated_pattern',
        effect: 'learning_opportunity',
        probability: 0.6,
        confidence: 0.7,
        evidence: ['pattern_recognition_theory'],
        context: ['continuous_operation'],
        weight: 0.5
      },
      // System performance relationships
      {
        cause: 'high_system_load',
        effect: 'response_degradation',
        probability: 0.9,
        confidence: 0.95,
        evidence: ['system_performance_metrics'],
        context: ['resource_constrained'],
        weight: 0.8
      },
      {
        cause: 'low_confidence_response',
        effect: 'verification_needed',
        probability: 0.7,
        confidence: 0.8,
        evidence: ['quality_assurance_principles'],
        context: ['high_stakes_decision'],
        weight: 0.7
      }
    ];

    baseCausalLinks.forEach((link, index) => {
      this.addCausalLink({
        ...link,
        id: `base_${index}`,
        lastUsed: new Date(),
        useCount: 0
      });
    });

    console.log(`🔗 CNR: Initialized ${baseCausalLinks.length} base causal relationships`);
  }

  // Add new causal relationship
  addCausalLink(link: CausalLink): void {
    // Add to forward model (cause -> effects)
    if (!this.causalModel.has(link.cause)) {
      this.causalModel.set(link.cause, []);
    }
    this.causalModel.get(link.cause)!.push(link);

    // Add to reverse model (effect -> causes)
    if (!this.reverseModel.has(link.effect)) {
      this.reverseModel.set(link.effect, []);
    }
    this.reverseModel.get(link.effect)!.push(link);

    console.log(`🔗 CNR: Added causal link: ${link.cause} -> ${link.effect} (p=${link.probability})`);
  }

  // Route decision based on causal analysis
  routeDecision(
    currentState: Record<string, any>,
    desiredOutcome: string,
    context: string[] = []
  ): DecisionRoute | null {
    console.log(`🔗 CNR: Routing decision for outcome: ${desiredOutcome}`);

    // Find causal chains that lead to desired outcome
    const causalChains = this.findCausalChains(desiredOutcome, context);
    
    if (causalChains.length === 0) {
      console.log(`🔗 CNR: No causal path found for ${desiredOutcome}`);
      return null;
    }

    // Select best chain based on confidence and cost
    const bestChain = this.selectBestChain(causalChains, currentState);
    
    if (!bestChain) return null;

    // Generate decision route
    const route: DecisionRoute = {
      action: this.deriveActionFromChain(bestChain),
      expectedOutcome: desiredOutcome,
      causalJustification: [bestChain],
      confidence: bestChain.confidence,
      risks: this.identifyRisks(bestChain, currentState),
      alternatives: this.findAlternativeActions(causalChains, bestChain)
    };

    // Record decision for learning
    this.routingHistory.push(route);
    this.updateCausalLinkUsage(bestChain);

    console.log(`🔗 CNR: Routed to action: ${route.action} (confidence: ${route.confidence.toFixed(2)})`);
    return route;
  }

  // Find causal chains leading to desired outcome
  private findCausalChains(
    desiredOutcome: string,
    context: string[],
    maxDepth: number = 3,
    currentDepth: number = 0
  ): CausalChain[] {
    if (currentDepth >= maxDepth) return [];

    const chains: CausalChain[] = [];
    const causesForOutcome = this.reverseModel.get(desiredOutcome) || [];

    // Direct causal links
    causesForOutcome.forEach(link => {
      if (this.isContextuallyApplicable(link, context)) {
        const chain: CausalChain = {
          id: `chain_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          steps: [link],
          confidence: link.confidence,
          goal: desiredOutcome,
          cost: 1,
          timeEstimate: 1
        };
        chains.push(chain);
      }
    });

    // Multi-step chains (recursive)
    if (currentDepth < maxDepth - 1) {
      causesForOutcome.forEach(link => {
        if (this.isContextuallyApplicable(link, context)) {
          const subChains = this.findCausalChains(link.cause, context, maxDepth, currentDepth + 1);
          
          subChains.forEach(subChain => {
            const extendedChain: CausalChain = {
              id: `chain_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
              steps: [...subChain.steps, link],
              confidence: subChain.confidence * link.confidence,
              goal: desiredOutcome,
              cost: subChain.cost + 1,
              timeEstimate: subChain.timeEstimate + 1
            };
            chains.push(extendedChain);
          });
        }
      });
    }

    return chains;
  }

  // Check if causal link applies in current context
  private isContextuallyApplicable(link: CausalLink, context: string[]): boolean {
    if (link.context.length === 0) return true;
    return link.context.some(linkContext => context.includes(linkContext));
  }

  // Select best causal chain based on multiple criteria
  private selectBestChain(chains: CausalChain[], currentState: Record<string, any>): CausalChain | null {
    if (chains.length === 0) return null;

    // Score chains based on confidence, cost, and applicability
    const scoredChains = chains.map(chain => {
      let score = chain.confidence * 0.4; // Base confidence weight
      
      // Prefer shorter chains (lower cost)
      score += (1 / (chain.cost + 1)) * 0.3;
      
      // Prefer chains with recently used links
      const avgRecency = chain.steps.reduce((sum, step) => {
        const hoursSinceUse = (Date.now() - step.lastUsed.getTime()) / (1000 * 60 * 60);
        return sum + Math.max(0, 1 - hoursSinceUse / 24); // Decay over 24 hours
      }, 0) / chain.steps.length;
      score += avgRecency * 0.2;

      // Prefer chains with higher weight steps
      const avgWeight = chain.steps.reduce((sum, step) => sum + step.weight, 0) / chain.steps.length;
      score += avgWeight * 0.1;

      return { chain, score };
    });

    // Return highest scoring chain
    scoredChains.sort((a, b) => b.score - a.score);
    return scoredChains[0].chain;
  }

  // Derive concrete action from causal chain
  private deriveActionFromChain(chain: CausalChain): string {
    const firstStep = chain.steps[0];
    
    // Map causes to actionable steps
    const actionMap: Record<string, string> = {
      'user_question': 'retrieve_information',
      'unclear_user_input': 'request_clarification',
      'complex_task_request': 'decompose_task',
      'context_switch': 'consolidate_memory',
      'repeated_pattern': 'initiate_learning',
      'high_system_load': 'optimize_performance',
      'low_confidence_response': 'verify_response'
    };

    return actionMap[firstStep.cause] || `trigger_${firstStep.cause}`;
  }

  // Identify risks in chosen causal chain
  private identifyRisks(chain: CausalChain, currentState: Record<string, any>): string[] {
    const risks: string[] = [];

    // Low confidence risk
    if (chain.confidence < 0.6) {
      risks.push('low_confidence_prediction');
    }

    // Long chain risk
    if (chain.cost > 2) {
      risks.push('complex_multi_step_process');
    }

    // Check for conflicting conditions
    chain.steps.forEach(step => {
      if (step.probability < 0.7) {
        risks.push(`uncertain_outcome_${step.effect}`);
      }
    });

    return risks;
  }

  // Find alternative actions from other chains
  private findAlternativeActions(allChains: CausalChain[], chosenChain: CausalChain): string[] {
    return allChains
      .filter(chain => chain.id !== chosenChain.id)
      .slice(0, 3) // Top 3 alternatives
      .map(chain => this.deriveActionFromChain(chain));
  }

  // Update usage statistics for causal links
  private updateCausalLinkUsage(chain: CausalChain): void {
    chain.steps.forEach(step => {
      step.useCount++;
      step.lastUsed = new Date();
    });
  }

  // Learn new causal relationships from outcomes
  learnFromOutcome(
    action: string,
    expectedOutcome: string,
    actualOutcome: string,
    success: boolean
  ): void {
    if (success && action && expectedOutcome === actualOutcome) {
      // Strengthen existing relationship or create new one
      const existingLinks = this.causalModel.get(action) || [];
      const existingLink = existingLinks.find(link => link.effect === expectedOutcome);

      if (existingLink) {
        // Strengthen existing link
        existingLink.confidence = Math.min(1, existingLink.confidence + 0.05);
        existingLink.probability = Math.min(1, existingLink.probability + 0.02);
        console.log(`🔗 CNR: Strengthened ${action} -> ${expectedOutcome}`);
      } else {
        // Create new causal link
        const newLink: CausalLink = {
          id: `learned_${Date.now()}`,
          cause: action,
          effect: expectedOutcome,
          probability: 0.6,
          confidence: 0.5,
          evidence: ['observed_outcome'],
          context: ['learned_relationship'],
          weight: 0.5,
          lastUsed: new Date(),
          useCount: 1
        };
        this.addCausalLink(newLink);
      }
    } else if (!success) {
      // Weaken confidence in failed predictions
      const actionLinks = this.causalModel.get(action) || [];
      actionLinks.forEach(link => {
        if (link.effect === expectedOutcome) {
          link.confidence = Math.max(0.1, link.confidence - 0.1);
          link.probability = Math.max(0.1, link.probability - 0.05);
          console.log(`🔗 CNR: Weakened ${action} -> ${expectedOutcome} due to failure`);
        }
      });
    }
  }

  // Query causal model for planning
  queryCausalModel(query: {
    cause?: string;
    effect?: string;
    minConfidence?: number;
    context?: string[];
  }): CausalLink[] {
    let results: CausalLink[] = [];

    if (query.cause) {
      results = this.causalModel.get(query.cause) || [];
    } else if (query.effect) {
      results = this.reverseModel.get(query.effect) || [];
    } else {
      // Return all links
      this.causalModel.forEach(links => results.push(...links));
    }

    // Apply filters
    if (query.minConfidence) {
      results = results.filter(link => link.confidence >= query.minConfidence);
    }

    if (query.context) {
      results = results.filter(link => this.isContextuallyApplicable(link, query.context!));
    }

    return results;
  }

  // Get routing statistics
  getRoutingStats() {
    const totalLinks = Array.from(this.causalModel.values()).reduce((sum, links) => sum + links.length, 0);
    const avgConfidence = Array.from(this.causalModel.values())
      .flat()
      .reduce((sum, link) => sum + link.confidence, 0) / totalLinks;

    return {
      totalCausalLinks: totalLinks,
      avgConfidence: avgConfidence || 0,
      routingHistory: this.routingHistory.length,
      recentDecisions: this.routingHistory.slice(-5).map(r => ({
        action: r.action,
        outcome: r.expectedOutcome,
        confidence: r.confidence
      }))
    };
  }
}

export const causalNexusRouter = new CausalNexusRouter();