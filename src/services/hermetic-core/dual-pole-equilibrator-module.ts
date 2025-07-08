// Dual-Pole Equilibrator Module (DPEM) - Polarity Balance Management
// Implements Hermetic Principle of Polarity ("Everything is dual; opposites can be reconciled")

export interface PolarDimension {
  id: string;
  name: string;
  leftPole: string;   // e.g., "cautious", "logical", "formal"
  rightPole: string;  // e.g., "bold", "intuitive", "casual"
  currentBalance: number; // -1 (left) to +1 (right), 0 is perfect balance
  targetBalance: number;  // Desired balance point
  sensitivity: number;    // How quickly to adjust (0-1)
  importance: number;     // Weight in overall system (0-1)
}

export interface BalanceAdjustment {
  dimensionId: string;
  oldBalance: number;
  newBalance: number;
  adjustment: number;
  reason: string;
  timestamp: Date;
}

export interface PolarityContext {
  mode: string;
  domain: string;
  urgency: number;
  userPreference?: number;
  situationalBias?: number;
}

class DualPoleEquilibratorModule {
  private dimensions: Map<string, PolarDimension> = new Map();
  private adjustmentHistory: BalanceAdjustment[] = [];
  private isActive: boolean = false;
  private balanceListeners: ((adjustment: BalanceAdjustment) => void)[] = [];
  private equilibriumTarget: number = 0.1; // Acceptable deviation from perfect balance

  constructor() {
    this.initializeCoreDimensions();
  }

  // Initialize core polarity dimensions
  private initializeCoreDimensions(): void {
    const coreDimensions: Omit<PolarDimension, 'currentBalance' | 'targetBalance'>[] = [
      {
        id: 'risk_assessment',
        name: 'Risk Assessment',
        leftPole: 'cautious',
        rightPole: 'bold',
        sensitivity: 0.3,
        importance: 0.9
      },
      {
        id: 'reasoning_style',
        name: 'Reasoning Style',
        leftPole: 'logical',
        rightPole: 'intuitive',
        sensitivity: 0.4,
        importance: 0.8
      },
      {
        id: 'communication_tone',
        name: 'Communication Tone',
        leftPole: 'formal',
        rightPole: 'casual',
        sensitivity: 0.5,
        importance: 0.7
      },
      {
        id: 'exploration_focus',
        name: 'Exploration vs Exploitation',
        leftPole: 'exploit',
        rightPole: 'explore',
        sensitivity: 0.3,
        importance: 0.8
      },
      {
        id: 'detail_level',
        name: 'Detail Level',
        leftPole: 'detailed',
        rightPole: 'overview',
        sensitivity: 0.4,
        importance: 0.6
      },
      {
        id: 'response_timing',
        name: 'Response Timing',
        leftPole: 'immediate',
        rightPole: 'deliberate',
        sensitivity: 0.6,
        importance: 0.7
      },
      {
        id: 'creativity_logic',
        name: 'Creativity vs Logic',
        leftPole: 'creative',
        rightPole: 'logical',
        sensitivity: 0.4,
        importance: 0.8
      }
    ];

    coreDimensions.forEach(dim => {
      this.dimensions.set(dim.id, {
        ...dim,
        currentBalance: 0, // Start at perfect balance
        targetBalance: 0
      });
    });

    console.log(`⚖️ DPEM: Initialized ${coreDimensions.length} core polarity dimensions`);
  }

  // Start polarity monitoring and balancing
  start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('⚖️ DPEM: Starting polarity equilibration');
  }

  // Monitor and adjust a specific polarity dimension
  monitorDimension(dimensionId: string, currentValue: number, context?: PolarityContext): void {
    const dimension = this.dimensions.get(dimensionId);
    if (!dimension) return;

    const oldBalance = dimension.currentBalance;
    
    // Update current balance based on observed behavior
    dimension.currentBalance = this.normalizeBalance(currentValue);

    // Calculate adjustment needed
    const imbalance = Math.abs(dimension.currentBalance - dimension.targetBalance);
    
    if (imbalance > this.equilibriumTarget) {
      this.applyBalanceAdjustment(dimension, context);
    }
  }

  // Apply balance adjustment to bring dimension toward equilibrium
  private applyBalanceAdjustment(dimension: PolarDimension, context?: PolarityContext): void {
    const imbalance = dimension.currentBalance - dimension.targetBalance;
    const adjustmentMagnitude = imbalance * dimension.sensitivity;
    
    // Consider contextual factors
    let contextualAdjustment = adjustmentMagnitude;
    
    if (context) {
      // Urgency might require faster/more extreme responses
      if (context.urgency > 0.8) {
        contextualAdjustment *= 1.5; // Move more toward action-oriented poles
      }
      
      // User preference should influence balance
      if (context.userPreference !== undefined) {
        const preferenceInfluence = (context.userPreference - dimension.currentBalance) * 0.2;
        contextualAdjustment += preferenceInfluence;
      }
      
      // Situational bias
      if (context.situationalBias !== undefined) {
        contextualAdjustment += context.situationalBias * 0.3;
      }
    }

    // Apply adjustment with bounds checking
    const oldBalance = dimension.currentBalance;
    const proposedBalance = dimension.currentBalance - contextualAdjustment;
    dimension.currentBalance = Math.max(-1, Math.min(1, proposedBalance));

    // Record adjustment
    const adjustment: BalanceAdjustment = {
      dimensionId: dimension.id,
      oldBalance,
      newBalance: dimension.currentBalance,
      adjustment: dimension.currentBalance - oldBalance,
      reason: this.determineAdjustmentReason(dimension, context),
      timestamp: new Date()
    };

    this.adjustmentHistory.push(adjustment);
    
    // Keep history manageable
    if (this.adjustmentHistory.length > 100) {
      this.adjustmentHistory = this.adjustmentHistory.slice(-50);
    }

    console.log(`⚖️ DPEM: Balanced ${dimension.name} from ${oldBalance.toFixed(2)} to ${dimension.currentBalance.toFixed(2)}`);
    
    // Notify listeners
    this.balanceListeners.forEach(listener => listener(adjustment));
  }

  // Determine reason for adjustment
  private determineAdjustmentReason(dimension: PolarDimension, context?: PolarityContext): string {
    const imbalance = Math.abs(dimension.currentBalance - dimension.targetBalance);
    
    if (imbalance > 0.7) return 'extreme_imbalance';
    if (context?.urgency && context.urgency > 0.8) return 'urgency_response';
    if (context?.userPreference !== undefined) return 'user_preference';
    if (context?.situationalBias !== undefined) return 'situational_adaptation';
    
    return 'equilibrium_maintenance';
  }

  // Normalize input value to -1 to +1 scale
  private normalizeBalance(value: number): number {
    return Math.max(-1, Math.min(1, value));
  }

  // Set target balance for a dimension
  setTargetBalance(dimensionId: string, target: number): void {
    const dimension = this.dimensions.get(dimensionId);
    if (!dimension) return;
    
    dimension.targetBalance = this.normalizeBalance(target);
    console.log(`⚖️ DPEM: Set target balance for ${dimension.name}: ${dimension.targetBalance.toFixed(2)}`);
  }

  // Get current balance state for a dimension
  getBalance(dimensionId: string): number | null {
    const dimension = this.dimensions.get(dimensionId);
    return dimension ? dimension.currentBalance : null;
  }

  // Get balance interpretation (which pole is active)
  getBalanceInterpretation(dimensionId: string): string | null {
    const dimension = this.dimensions.get(dimensionId);
    if (!dimension) return null;
    
    const balance = dimension.currentBalance;
    const magnitude = Math.abs(balance);
    
    if (magnitude < 0.1) return 'balanced';
    
    const intensity = magnitude < 0.3 ? 'slightly' : 
                     magnitude < 0.6 ? 'moderately' : 'strongly';
    
    const pole = balance < 0 ? dimension.leftPole : dimension.rightPole;
    
    return `${intensity} ${pole}`;
  }

  // Check for overall system balance
  checkSystemBalance(): { score: number; imbalances: string[] } {
    const dimensions = Array.from(this.dimensions.values());
    const imbalances: string[] = [];
    let totalImbalance = 0;

    dimensions.forEach(dimension => {
      const imbalance = Math.abs(dimension.currentBalance - dimension.targetBalance);
      const weightedImbalance = imbalance * dimension.importance;
      totalImbalance += weightedImbalance;

      if (imbalance > this.equilibriumTarget) {
        imbalances.push(`${dimension.name}: ${this.getBalanceInterpretation(dimension.id)}`);
      }
    });

    const avgImbalance = totalImbalance / dimensions.length;
    const balanceScore = Math.max(0, 1 - avgImbalance);

    return { score: balanceScore, imbalances };
  }

  // Apply active equilibration for emotional/analytical extremes
  applyActiveEquilibration(emotionalState: number, analyticalState: number, context?: any): void {
    // Map emotional/analytical states to relevant polarity dimensions
    const emotionalAnalyticalBalance = (emotionalState - analyticalState) / 2;
    
    // Update reasoning style dimension
    this.monitorDimension('reasoning_style', emotionalAnalyticalBalance, {
      mode: context?.mode || 'general',
      domain: context?.domain || 'general',
      urgency: context?.urgency || 0.5
    });
    
    // Apply counterbalancing to prevent extremes
    if (Math.abs(emotionalAnalyticalBalance) > 0.7) {
      const counterbalance = -emotionalAnalyticalBalance * 0.3;
      
      // Update communication tone to balance extreme states
      this.monitorDimension('communication_tone', counterbalance, {
        mode: context?.mode || 'general',
        domain: context?.domain || 'general',
        urgency: context?.urgency || 0.5,
        situationalBias: counterbalance
      });
      
      console.log(`⚖️ DPEM: Applied counterbalancing for extreme ${emotionalState > analyticalState ? 'emotional' : 'analytical'} state`);
    }
  }

  // Auto-correct extreme imbalances
  autoCorrectImbalances(): void {
    const { imbalances } = this.checkSystemBalance();
    
    if (imbalances.length === 0) return;
    
    console.log('⚖️ DPEM: Auto-correcting system imbalances');
    
    this.dimensions.forEach(dimension => {
      const imbalance = Math.abs(dimension.currentBalance - dimension.targetBalance);
      
      if (imbalance > 0.7) {
        // Force toward center for extreme imbalances
        const correction = (dimension.targetBalance - dimension.currentBalance) * 0.5;
        dimension.currentBalance += correction;
        
        console.log(`⚖️ DPEM: Auto-corrected ${dimension.name} by ${correction.toFixed(2)}`);
      }
    });
  }

  // Get recommendations for manual balance adjustments
  getBalanceRecommendations(): string[] {
    const recommendations: string[] = [];
    const { imbalances } = this.checkSystemBalance();
    
    this.dimensions.forEach(dimension => {
      const imbalance = dimension.currentBalance - dimension.targetBalance;
      
      if (Math.abs(imbalance) > this.equilibriumTarget) {
        const direction = imbalance > 0 ? dimension.leftPole : dimension.rightPole;
        const magnitude = Math.abs(imbalance);
        
        recommendations.push(
          `Consider being more ${direction} in ${dimension.name.toLowerCase()} (current imbalance: ${magnitude.toFixed(2)})`
        );
      }
    });
    
    return recommendations;
  }

  // Add custom polarity dimension
  addDimension(dimension: Omit<PolarDimension, 'currentBalance' | 'targetBalance'>): void {
    this.dimensions.set(dimension.id, {
      ...dimension,
      currentBalance: 0,
      targetBalance: 0
    });
    
    console.log(`⚖️ DPEM: Added custom dimension: ${dimension.name}`);
  }

  // Subscribe to balance adjustments
  onBalanceAdjustment(listener: (adjustment: BalanceAdjustment) => void): () => void {
    this.balanceListeners.push(listener);
    return () => {
      const index = this.balanceListeners.indexOf(listener);
      if (index > -1) this.balanceListeners.splice(index, 1);
    };
  }


  // Get current status
  getStatus() {
    const balance = this.checkSystemBalance();
    return {
      isActive: this.isActive,
      dimensionCount: this.dimensions.size,
      overallBalance: balance.score,
      activeImbalances: balance.imbalances.length,
      recentAdjustments: this.adjustmentHistory.slice(-5)
    };
  }
}

export const dualPoleEquilibratorModule = new DualPoleEquilibratorModule();
