
import { useState, useCallback } from 'react';
import { productionACSService } from '@/services/production-acs-service';
import { DialogueState, ACSConfig } from '@/types/acs-types';
import { toast } from 'sonner';

interface ACSStatus {
  isEnabled: boolean;
  currentState: DialogueState;
  interventionsCount: number;
  fallbacksUsed: number;
  lastInterventionTime?: number;
  deploymentMode: 'full' | 'shadow';
  trafficPercentage: number;
}

interface UseProductionACSResult {
  status: ACSStatus;
  processMessage: (message: string, sessionId: string) => Promise<{
    response: string;
    interventionApplied: boolean;
    fallbackUsed: boolean;
  }>;
  toggleACS: () => void;
  updateConfig: (config: Partial<ACSConfig>) => void;
  runIntegrationTests: () => Promise<void>;
  enableFullDeployment: () => void;
}

export const useProductionACS = (initialConfig?: Partial<ACSConfig>): UseProductionACSResult => {
  const [status, setStatus] = useState<ACSStatus>({
    isEnabled: true,
    currentState: 'NORMAL',
    interventionsCount: 0,
    fallbacksUsed: 0,
    deploymentMode: 'full', // Default to full deployment
    trafficPercentage: 100   // 100% traffic from start
  });

  const [config, setConfig] = useState<ACSConfig>({
    enableRL: false,
    personalityScaling: true,
    frustrationThreshold: 0.3,
    sentimentSlopeNeg: -0.2,
    velocityFloor: 0.1,
    maxSilentMs: 180000,
    clarificationThreshold: 0.4,
    ...initialConfig
  });

  const processMessage = useCallback(async (message: string, sessionId: string) => {
    if (!status.isEnabled) {
      // Fallback to regular AI coach without ACS
      throw new Error("ACS is disabled");
    }

    try {
      const result = await productionACSService.processMessage(
        message,
        sessionId,
        config,
        status.currentState
      );

      // Update status
      setStatus(prev => ({
        ...prev,
        currentState: result.newState,
        interventionsCount: prev.interventionsCount + (result.interventionApplied ? 1 : 0),
        fallbacksUsed: prev.fallbacksUsed + (result.fallbackUsed ? 1 : 0),
        lastInterventionTime: result.interventionApplied ? Date.now() : prev.lastInterventionTime
      }));

      // Show user-friendly notifications
      if (result.interventionApplied) {
        toast.info(`💡 Adapted to ${result.newState.toLowerCase().replace('_', ' ')} mode`);
      }

      if (result.fallbackUsed) {
        toast.warning("⚠️ Using backup system - some features may be limited");
      }

      return {
        response: result.response,
        interventionApplied: result.interventionApplied,
        fallbackUsed: result.fallbackUsed
      };

    } catch (error) {
      console.error("ACS processing failed:", error);
      setStatus(prev => ({ ...prev, fallbacksUsed: prev.fallbacksUsed + 1 }));
      throw error;
    }
  }, [status.isEnabled, status.currentState, config]);

  const toggleACS = useCallback(() => {
    setStatus(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
    toast.success(status.isEnabled ? "ACS disabled" : "ACS enabled");
  }, [status.isEnabled]);

  const updateConfig = useCallback((newConfig: Partial<ACSConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    toast.success("ACS configuration updated");
  }, []);

  const enableFullDeployment = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      deploymentMode: 'full',
      trafficPercentage: 100,
      isEnabled: true
    }));
    toast.success("🚀 ACS enabled for 100% of traffic - Full deployment active!");
  }, []);

  const runIntegrationTests = useCallback(async () => {
    toast.info("Running ACS integration tests...");
    
    try {
      const testSessionId = `integration_test_${Date.now()}`;
      
      // Test 1: Stuck to clarify
      const test1 = await productionACSService.testStuckToClarify(testSessionId + "_1");
      
      // Test 2: Idle prompt
      const test2 = await productionACSService.testIdlePrompt(testSessionId + "_2");
      
      // Test 3: Latency P95
      const test3 = await productionACSService.testLatencyP95();
      
      const results = {
        stuck_to_clarify: test1,
        idle_prompt: test2,
        latency_p95: test3.passed,
        p95_latency_ms: test3.latency
      };

      console.log("🧪 Integration test results:", results);
      
      const allPassed = test1 && test2 && test3.passed;
      
      if (allPassed) {
        toast.success(`✅ All integration tests passed! P95 latency: ${test3.latency.toFixed(0)}ms - Ready for full deployment`);
        enableFullDeployment();
      } else {
        toast.error(`❌ Some tests failed. Check console for details.`);
      }

    } catch (error) {
      console.error("Integration tests failed:", error);
      toast.error("Integration tests encountered errors");
    }
  }, [enableFullDeployment]);

  return {
    status,
    processMessage,
    toggleACS,
    updateConfig,
    runIntegrationTests,
    enableFullDeployment
  };
};
