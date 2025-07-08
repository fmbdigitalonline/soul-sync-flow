// HACS Monitor Service - Safety Infrastructure for HACS Integration
// Monitors health, performance, and errors across all HACS modules

import { neuroIntentKernel } from "./hermetic-core/neuro-intent-kernel";
import { crossPlaneStateReflector } from "./hermetic-core/cross-plane-state-reflector";
import { temporalWaveSynchronizer } from "./hermetic-core/temporal-wave-synchronizer";
import { harmonicFrequencyModulationEngine } from "./hermetic-core/harmonic-frequency-modulation-engine";
import { dualPoleEquilibratorModule } from "./hermetic-core/dual-pole-equilibrator-module";

export interface HACSModuleHealth {
  moduleId: string;
  status: 'healthy' | 'degraded' | 'failed';
  lastCheck: Date;
  errorCount: number;
  responseTime: number;
  memoryUsage: number;
}

export interface HACSSystemHealth {
  overall: 'healthy' | 'degraded' | 'failed';
  modules: HACSModuleHealth[];
  integrationStatus: 'active' | 'fallback' | 'disabled';
  lastFullCheck: Date;
  recommendations: string[];
}

export interface HACSConfig {
  enabled: boolean;
  fallbackMode: boolean;
  monitoringInterval: number;
  healthThresholds: {
    errorRate: number;
    responseTime: number;
    memoryLimit: number;
  };
  moduleToggle: {
    nik: boolean;
    cpsr: boolean;
    tws: boolean;
    hfme: boolean;
    dpem: boolean;
  };
}

class HACSMonitorService {
  private config: HACSConfig = {
    enabled: true,
    fallbackMode: false,
    monitoringInterval: 30000, // 30 seconds
    healthThresholds: {
      errorRate: 0.1, // 10% error rate threshold
      responseTime: 1000, // 1 second response time threshold
      memoryLimit: 100 // 100MB memory limit
    },
    moduleToggle: {
      nik: true,
      cpsr: true,
      tws: true,
      hfme: true,
      dpem: true
    }
  };

  private moduleHealth: Map<string, HACSModuleHealth> = new Map();
  private monitoringActive: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private errorLog: Array<{ timestamp: Date; module: string; error: string }> = [];

  // Initialize monitoring system
  initialize(): void {
    console.log('🔍 HACS Monitor: Initializing safety infrastructure');
    
    this.setupModuleHealth();
    this.startMonitoring();
    
    console.log('✅ HACS Monitor: Safety infrastructure ready');
  }

  // Setup initial health tracking for all modules
  private setupModuleHealth(): void {
    const modules = ['nik', 'cpsr', 'tws', 'hfme', 'dpem'];
    
    modules.forEach(moduleId => {
      this.moduleHealth.set(moduleId, {
        moduleId,
        status: 'healthy',
        lastCheck: new Date(),
        errorCount: 0,
        responseTime: 0,
        memoryUsage: 0
      });
    });
  }

  // Start continuous monitoring
  private startMonitoring(): void {
    if (this.monitoringActive) return;
    
    this.monitoringActive = true;
    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.monitoringInterval);
    
    console.log('🔍 HACS Monitor: Health monitoring started');
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (!this.monitoringActive) return;
    
    this.monitoringActive = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    console.log('🔍 HACS Monitor: Health monitoring stopped');
  }

  // Perform comprehensive health check
  private async performHealthCheck(): Promise<void> {
    try {
      // Check NIK (Neuro-Intent Kernel)
      await this.checkModuleHealth('nik', () => {
        const state = neuroIntentKernel.getIntentState();
        return {
          responseTime: Date.now() - (state.lastUpdate?.getTime() || Date.now()),
          hasErrors: false
        };
      });

      // Check CPSR (Cross-Plane State Reflector)
      await this.checkModuleHealth('cpsr', () => {
        const state = crossPlaneStateReflector.getUnifiedState();
        return {
          responseTime: 50, // Assume fast state access
          hasErrors: false
        };
      });

      // Check TWS (Temporal Wave Synchronizer)
      await this.checkModuleHealth('tws', () => {
        const info = temporalWaveSynchronizer.getCycleInfo();
        return {
          responseTime: 30,
          hasErrors: !info.isRunning
        };
      });

      // Check HFME (Harmonic Frequency Modulation Engine)
      await this.checkModuleHealth('hfme', () => {
        const status = harmonicFrequencyModulationEngine.getHarmonyStatus();
        return {
          responseTime: 40,
          hasErrors: status.conflicts.length > 3
        };
      });

      // Check DPEM (Dual-Pole Equilibrator Module)
      await this.checkModuleHealth('dpem', () => {
        const status = dualPoleEquilibratorModule.getStatus();
        return {
          responseTime: 35,
          hasErrors: !status.isActive
        };
      });

    } catch (error) {
      console.error('🔍 HACS Monitor: Health check failed:', error);
      this.logError('system', `Health check failed: ${error}`);
    }
  }

  // Check individual module health
  private async checkModuleHealth(
    moduleId: string, 
    checkFunction: () => { responseTime: number; hasErrors: boolean }
  ): Promise<void> {
    if (!this.config.moduleToggle[moduleId as keyof typeof this.config.moduleToggle]) {
      return; // Skip disabled modules
    }

    const startTime = Date.now();
    
    try {
      const result = checkFunction();
      const endTime = Date.now();
      
      const health = this.moduleHealth.get(moduleId);
      if (health) {
        health.lastCheck = new Date();
        health.responseTime = endTime - startTime;
        
        if (result.hasErrors) {
          health.errorCount++;
          health.status = 'degraded';
          this.logError(moduleId, 'Module reported errors during health check');
        } else {
          health.status = 'healthy';
        }

        // Check thresholds
        if (health.responseTime > this.config.healthThresholds.responseTime) {
          health.status = 'degraded';
          this.logError(moduleId, `Slow response time: ${health.responseTime}ms`);
        }
      }

    } catch (error) {
      const health = this.moduleHealth.get(moduleId);
      if (health) {
        health.status = 'failed';
        health.errorCount++;
        health.lastCheck = new Date();
      }
      
      this.logError(moduleId, `Health check error: ${error}`);
    }
  }

  // Log errors with rotation
  private logError(module: string, error: string): void {
    this.errorLog.push({
      timestamp: new Date(),
      module,
      error
    });

    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-50);
    }
  }

  // Get comprehensive system health
  getSystemHealth(): HACSSystemHealth {
    const modules = Array.from(this.moduleHealth.values());
    const failedModules = modules.filter(m => m.status === 'failed').length;
    const degradedModules = modules.filter(m => m.status === 'degraded').length;

    let overall: 'healthy' | 'degraded' | 'failed' = 'healthy';
    if (failedModules > 0) {
      overall = 'failed';
    } else if (degradedModules > 0) {
      overall = 'degraded';
    }

    const integrationStatus = this.config.fallbackMode ? 'fallback' : 
                             this.config.enabled ? 'active' : 'disabled';

    const recommendations: string[] = [];
    if (failedModules > 0) {
      recommendations.push(`${failedModules} module(s) failed - consider fallback mode`);
    }
    if (degradedModules > 0) {
      recommendations.push(`${degradedModules} module(s) degraded - monitor closely`);
    }
    if (this.errorLog.length > 20) {
      recommendations.push('High error rate detected - review logs');
    }

    return {
      overall,
      modules,
      integrationStatus,
      lastFullCheck: new Date(),
      recommendations
    };
  }

  // Enable/disable HACS system
  toggleHACS(enabled: boolean): void {
    this.config.enabled = enabled;
    console.log(`🔍 HACS Monitor: System ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Enable/disable fallback mode
  setFallbackMode(fallback: boolean): void {
    this.config.fallbackMode = fallback;
    console.log(`🔍 HACS Monitor: Fallback mode ${fallback ? 'enabled' : 'disabled'}`);
  }

  // Toggle individual modules
  toggleModule(moduleId: keyof typeof this.config.moduleToggle, enabled: boolean): void {
    this.config.moduleToggle[moduleId] = enabled;
    console.log(`🔍 HACS Monitor: Module ${moduleId} ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Check if system should use fallback
  shouldUseFallback(): boolean {
    if (this.config.fallbackMode) return true;
    if (!this.config.enabled) return true;
    
    const health = this.getSystemHealth();
    return health.overall === 'failed';
  }

  // Get error logs for debugging
  getErrorLogs(moduleId?: string): Array<{ timestamp: Date; module: string; error: string }> {
    if (moduleId) {
      return this.errorLog.filter(log => log.module === moduleId);
    }
    return [...this.errorLog];
  }

  // Get current configuration
  getConfig(): HACSConfig {
    return { ...this.config };
  }

  // Update configuration
  updateConfig(updates: Partial<HACSConfig>): void {
    this.config = { ...this.config, ...updates };
    console.log('🔍 HACS Monitor: Configuration updated');
  }
}

export const hacsMonitorService = new HACSMonitorService();
