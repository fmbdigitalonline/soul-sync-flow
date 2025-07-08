// Harmonic Frequency Modulation Engine (HFME) - Process Harmony Management
// Implements Hermetic Principle of Vibration ("Nothing rests; everything moves")

export interface ProcessMetrics {
  moduleId: string;
  frequency: number;      // Current operation frequency (Hz)
  amplitude: number;      // Processing intensity (0-1)
  phase: number;         // Phase offset (0-2π)
  load: number;          // CPU/resource usage (0-1)
  latency: number;       // Response time (ms)
  throughput: number;    // Operations per second
  timestamp: Date;
}

export interface HarmonicAdjustment {
  moduleId: string;
  targetFrequency?: number;
  targetAmplitude?: number;
  phaseShift?: number;
  reason: string;
}

class HarmonicFrequencyModulationEngine {
  private processMetrics: Map<string, ProcessMetrics> = new Map();
  private harmonyTarget: number = 1.0; // Target harmony score (0-1)
  private isActive: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private adjustmentListeners: ((adjustment: HarmonicAdjustment) => void)[] = [];

  // Start harmonic monitoring and tuning
  start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('🎵 HFME: Starting harmonic frequency modulation');
    
    // Monitor every 500ms for smooth tuning
    this.monitoringInterval = setInterval(() => {
      this.analyzeHarmony();
      this.applyHarmonicAdjustments();
    }, 500);
  }

  // Stop harmonic tuning
  stop(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    console.log('🎵 HFME: Stopped harmonic frequency modulation');
  }

  // Register a module for harmonic monitoring
  registerModule(moduleId: string, initialMetrics: Partial<ProcessMetrics>): void {
    const metrics: ProcessMetrics = {
      moduleId,
      frequency: initialMetrics.frequency || 1.0,
      amplitude: initialMetrics.amplitude || 0.5,
      phase: initialMetrics.phase || 0,
      load: initialMetrics.load || 0.1,
      latency: initialMetrics.latency || 100,
      throughput: initialMetrics.throughput || 1.0,
      timestamp: new Date()
    };

    this.processMetrics.set(moduleId, metrics);
    console.log(`🎵 HFME: Registered ${moduleId} for harmonic monitoring`);
  }

  // Update module metrics
  updateMetrics(moduleId: string, updates: Partial<ProcessMetrics>): void {
    const current = this.processMetrics.get(moduleId);
    if (!current) return;

    const updated: ProcessMetrics = {
      ...current,
      ...updates,
      timestamp: new Date()
    };

    this.processMetrics.set(moduleId, updated);
  }

  // Analyze overall system harmony
  private analyzeHarmony(): number {
    const modules = Array.from(this.processMetrics.values());
    if (modules.length === 0) return 1.0;

    // Calculate frequency distribution harmony
    const frequencies = modules.map(m => m.frequency);
    const avgFreq = frequencies.reduce((sum, f) => sum + f, 0) / frequencies.length;
    const freqVariance = frequencies.reduce((sum, f) => sum + Math.pow(f - avgFreq, 2), 0) / frequencies.length;
    const freqHarmony = Math.max(0, 1 - (freqVariance / (avgFreq * avgFreq)));

    // Calculate load balance harmony
    const loads = modules.map(m => m.load);
    const maxLoad = Math.max(...loads);
    const minLoad = Math.min(...loads);
    const loadBalance = maxLoad > 0 ? 1 - ((maxLoad - minLoad) / maxLoad) : 1.0;

    // Calculate phase alignment harmony
    const phases = modules.map(m => m.phase);
    const phaseSpread = Math.max(...phases) - Math.min(...phases);
    const phaseHarmony = Math.max(0, 1 - (phaseSpread / (2 * Math.PI)));

    // Overall harmony score
    const harmonyScore = (freqHarmony * 0.4 + loadBalance * 0.4 + phaseHarmony * 0.2);
    
    if (harmonyScore < 0.7) {
      console.log(`🎵 HFME: Low harmony detected: ${harmonyScore.toFixed(3)}`);
    }

    return harmonyScore;
  }

  // Apply harmonic adjustments to improve system harmony
  private applyHarmonicAdjustments(): void {
    const harmonyScore = this.analyzeHarmony();
    
    // Check for cognitive interference first
    const interferenceDetected = this.preventCognitiveInterference();
    
    if (harmonyScore >= this.harmonyTarget && !interferenceDetected) return;

    const modules = Array.from(this.processMetrics.values());
    const adjustments: HarmonicAdjustment[] = [];

    // Frequency matching adjustments
    const avgFreq = modules.reduce((sum, m) => sum + m.frequency, 0) / modules.length;
    modules.forEach(module => {
      const freqDiff = Math.abs(module.frequency - avgFreq);
      if (freqDiff > avgFreq * 0.3) { // More than 30% deviation
        const targetFreq = module.frequency > avgFreq 
          ? avgFreq * 1.2  // Slightly above average
          : avgFreq * 0.8; // Slightly below average

        adjustments.push({
          moduleId: module.moduleId,
          targetFrequency: targetFreq,
          reason: 'frequency_alignment'
        });
      }
    });

    // Load balancing adjustments
    const maxLoad = Math.max(...modules.map(m => m.load));
    const avgLoad = modules.reduce((sum, m) => sum + m.load, 0) / modules.length;
    
    modules.forEach(module => {
      if (module.load > 0.8 && module.load > avgLoad * 1.5) {
        // High load module - reduce amplitude
        adjustments.push({
          moduleId: module.moduleId,
          targetAmplitude: Math.max(0.3, module.amplitude * 0.8),
          reason: 'load_reduction'
        });
      } else if (module.load < 0.2 && avgLoad > 0.5) {
        // Low load module when system is busy - increase amplitude
        adjustments.push({
          moduleId: module.moduleId,
          targetAmplitude: Math.min(1.0, module.amplitude * 1.2),
          reason: 'load_balancing'
        });
      }
    });

    // Phase alignment adjustments
    const targetPhase = modules.reduce((sum, m) => sum + m.phase, 0) / modules.length;
    modules.forEach(module => {
      const phaseDiff = Math.abs(module.phase - targetPhase);
      if (phaseDiff > Math.PI / 2) { // More than 90 degrees out of phase
        adjustments.push({
          moduleId: module.moduleId,
          phaseShift: targetPhase - module.phase,
          reason: 'phase_alignment'
        });
      }
    });

    // Apply adjustments
    adjustments.forEach(adjustment => {
      this.applyAdjustment(adjustment);
    });
  }

  // Apply a specific harmonic adjustment
  private applyAdjustment(adjustment: HarmonicAdjustment): void {
    const metrics = this.processMetrics.get(adjustment.moduleId);
    if (!metrics) return;

    const updates: Partial<ProcessMetrics> = {};

    if (adjustment.targetFrequency !== undefined) {
      updates.frequency = this.smoothTransition(metrics.frequency, adjustment.targetFrequency, 0.2);
    }

    if (adjustment.targetAmplitude !== undefined) {
      updates.amplitude = this.smoothTransition(metrics.amplitude, adjustment.targetAmplitude, 0.3);
    }

    if (adjustment.phaseShift !== undefined) {
      updates.phase = (metrics.phase + adjustment.phaseShift) % (2 * Math.PI);
    }

    if (Object.keys(updates).length > 0) {
      this.updateMetrics(adjustment.moduleId, updates);
      console.log(`🎵 HFME: Applied ${adjustment.reason} to ${adjustment.moduleId}`);
      
      // Notify listeners
      this.adjustmentListeners.forEach(listener => listener(adjustment));
    }
  }

  // Smooth transition between values to prevent sudden changes
  private smoothTransition(current: number, target: number, factor: number): number {
    return current + (target - current) * factor;
  }

  // Detect and prevent destructive interference
  detectDestructiveInterference(): string[] {
    const modules = Array.from(this.processMetrics.values());
    const conflicts: string[] = [];

    for (let i = 0; i < modules.length; i++) {
      for (let j = i + 1; j < modules.length; j++) {
        const mod1 = modules[i];
        const mod2 = modules[j];

        // Check for frequency conflicts (near same frequency, opposite phase)
        const freqDiff = Math.abs(mod1.frequency - mod2.frequency);
        const phaseDiff = Math.abs(mod1.phase - mod2.phase);

        if (freqDiff < 0.1 && Math.abs(phaseDiff - Math.PI) < 0.1) {
          conflicts.push(`${mod1.moduleId} vs ${mod2.moduleId}: destructive_phase`);
        }

        // Check for resource contention
        if (mod1.load > 0.7 && mod2.load > 0.7 && mod1.latency > 200 && mod2.latency > 200) {
          conflicts.push(`${mod1.moduleId} vs ${mod2.moduleId}: resource_contention`);
        }
      }
    }

    if (conflicts.length > 0) {
      console.warn(`🎵 HFME: Detected destructive interference:`, conflicts);
    }

    return conflicts;
  }

  // Prevent cognitive interference between modes
  preventCognitiveInterference(): boolean {
    const modules = Array.from(this.processMetrics.values());
    let interferenceDetected = false;
    
    // Define frequency isolation channels for different modes
    const modeFrequencies: Record<string, number> = {
      'dream': 3.0,     // 2-4Hz range
      'companion': 6.0, // 5-7Hz range
      'growth': 10.0,   // 8-12Hz range
      'coach': 8.0,     // 7-9Hz range
      'guide': 4.0      // 3-5Hz range
    };
    
    modules.forEach(module => {
      const modeType = this.extractModeFromModuleId(module.moduleId);
      const targetFreq = modeFrequencies[modeType];
      
      if (targetFreq && Math.abs(module.frequency - targetFreq) > 1.5) {
        // Apply frequency separation
        this.updateMetrics(module.moduleId, {
          frequency: this.smoothTransition(module.frequency, targetFreq, 0.4),
          phase: this.calculateOptimalPhase(targetFreq)
        });
        
        interferenceDetected = true;
        console.log(`🎵 HFME: Separated ${module.moduleId} to ${targetFreq}Hz`);
      }
    });
    
    return interferenceDetected;
  }
  
  // Extract mode type from module ID
  private extractModeFromModuleId(moduleId: string): string {
    if (moduleId.includes('dream')) return 'dream';
    if (moduleId.includes('companion')) return 'companion';
    if (moduleId.includes('growth')) return 'growth';
    if (moduleId.includes('coach')) return 'coach';
    if (moduleId.includes('guide')) return 'guide';
    return 'general';
  }
  
  // Calculate optimal phase for frequency
  private calculateOptimalPhase(frequency: number): number {
    // Phase offset based on frequency to prevent destructive interference
    return (frequency * Math.PI / 12) % (2 * Math.PI);
  }

  // Force harmonic convergence (emergency tuning)
  forceHarmonicConvergence(): void {
    console.log('🎵 HFME: Forcing harmonic convergence');
    
    const modules = Array.from(this.processMetrics.values());
    const targetFreq = 2.0; // Standard 2Hz cognitive rhythm
    const targetPhase = 0;
    const targetAmplitude = 0.7;

    modules.forEach(module => {
      this.updateMetrics(module.moduleId, {
        frequency: targetFreq,
        phase: targetPhase,
        amplitude: targetAmplitude
      });
    });
  }

  // Get current harmony status
  getHarmonyStatus() {
    const harmonyScore = this.analyzeHarmony();
    const conflicts = this.detectDestructiveInterference();
    
    return {
      harmonyScore,
      conflicts,
      moduleCount: this.processMetrics.size,
      avgFrequency: Array.from(this.processMetrics.values())
        .reduce((sum, m) => sum + m.frequency, 0) / this.processMetrics.size,
      isActive: this.isActive
    };
  }

  // Subscribe to harmonic adjustments
  onAdjustment(listener: (adjustment: HarmonicAdjustment) => void): () => void {
    this.adjustmentListeners.push(listener);
    return () => {
      const index = this.adjustmentListeners.indexOf(listener);
      if (index > -1) this.adjustmentListeners.splice(index, 1);
    };
  }
}

export const harmonicFrequencyModulationEngine = new HarmonicFrequencyModulationEngine();