// Phase 3 Flow Orchestration Testing Component
// Tests all Phase 3 modules: HFME, DPEM, CNR, and BPSC integration

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { unifiedBrainService } from '@/services/unified-brain-service';
import { harmonicFrequencyModulationEngine } from '@/services/hermetic-core/harmonic-frequency-modulation-engine';
import { dualPoleEquilibratorModule } from '@/services/hermetic-core/dual-pole-equilibrator-module';
import { causalNexusRouter } from '@/services/hermetic-core/causal-nexus-router';
import { biPrincipleSynthesisCore } from '@/services/hermetic-core/bi-principle-synthesis-core';

export const Phase3FlowOrchestrationTester: React.FC = () => {
  // Overall Phase 3 status
  const [phase3Health, setPhase3Health] = useState<any>(null);
  const [testMessage, setTestMessage] = useState('Help me plan my day with some creative ideas');
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Individual module status
  const [hfmeStatus, setHfmeStatus] = useState<any>(null);
  const [dpemStatus, setDpemStatus] = useState<any>(null);
  const [cnrStatus, setCnrStatus] = useState<any>(null);
  const [bpscStatus, setBpscStatus] = useState<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      updateAllModuleStatus();
    }, 2000);

    // Initial load
    updateAllModuleStatus();

    return () => clearInterval(interval);
  }, []);

  const updateAllModuleStatus = () => {
    try {
      // Get overall brain health which includes Phase 3 status
      const brainHealth = unifiedBrainService.getBrainHealth();
      setPhase3Health(brainHealth.phase3Status || null);

      // Get individual module status
      setHfmeStatus(harmonicFrequencyModulationEngine.getHarmonyStatus());
      setDpemStatus(dualPoleEquilibratorModule.getStatus());
      setCnrStatus(causalNexusRouter.getRoutingStats());
      setBpscStatus(biPrincipleSynthesisCore.getSynthesisStats());
    } catch (error) {
      console.error('Error updating Phase 3 status:', error);
    }
  };

  const runFullFlowTest = async () => {
    setIsProcessing(true);
    setTestResults([]);

    try {
      setTestResults(prev => [...prev, '🔄 Starting Phase 3 Flow Orchestration test...']);

      // Test message processing through unified brain
      const sessionId = `test_${Date.now()}`;
      const agentMode = 'guide';

      setTestResults(prev => [...prev, `📝 Processing test message: "${testMessage}"`]);
      setTestResults(prev => [...prev, `🎯 Agent Mode: ${agentMode}, Session: ${sessionId}`]);

      const startTime = performance.now();
      
      const result = await unifiedBrainService.processMessage(
        testMessage,
        sessionId,
        agentMode,
        'NORMAL'
      );

      const processingTime = performance.now() - startTime;

      setTestResults(prev => [...prev, `✅ Processing completed in ${processingTime.toFixed(1)}ms`]);
      setTestResults(prev => [...prev, `🧠 Response: ${result.response.substring(0, 100)}...`]);
      setTestResults(prev => [...prev, `📊 Memory stored: ${result.memoryStored}`]);
      setTestResults(prev => [...prev, `🎭 Personality applied: ${result.personalityApplied}`]);
      setTestResults(prev => [...prev, `🔗 Continuity maintained: ${result.continuityMaintained}`]);

      // Test individual modules
      await testIndividualModules(sessionId);

    } catch (error) {
      setTestResults(prev => [...prev, `❌ Flow test failed: ${error}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  const testIndividualModules = async (sessionId: string) => {
    // Test HFME
    try {
      harmonicFrequencyModulationEngine.registerModule('test_module', {
        frequency: 3.0,
        amplitude: 0.8,
        phase: Math.PI / 3,
        load: 0.4,
        latency: 150,
        throughput: 2.0
      });
      setTestResults(prev => [...prev, '🎵 HFME: Test module registered successfully']);
    } catch (error) {
      setTestResults(prev => [...prev, `🎵 HFME: Error - ${error}`]);
    }

    // Test DPEM
    try {
      dualPoleEquilibratorModule.monitorDimension('risk_assessment', 0.6, {
        mode: 'guide',
        domain: 'testing',
        urgency: 0.5
      });
      setTestResults(prev => [...prev, '⚖️ DPEM: Polarity monitoring test completed']);
    } catch (error) {
      setTestResults(prev => [...prev, `⚖️ DPEM: Error - ${error}`]);
    }

    // Test CNR
    try {
      const route = causalNexusRouter.routeDecision(
        { sessionId, userId: 'test_user', timestamp: Date.now() },
        'provide_assistance',
        ['guide', 'conversational_mode']
      );
      if (route) {
        setTestResults(prev => [...prev, `🔗 CNR: Routed to action "${route.action}" with confidence ${route.confidence.toFixed(2)}`]);
      } else {
        setTestResults(prev => [...prev, '🔗 CNR: No route found for test outcome']);
      }
    } catch (error) {
      setTestResults(prev => [...prev, `🔗 CNR: Error - ${error}`]);
    }

    // Test BPSC
    try {
      biPrincipleSynthesisCore.submitRationalInput(
        sessionId,
        'Logical analysis suggests we should prioritize tasks by urgency',
        0.8,
        'test_rational',
        { test: true }
      );

      biPrincipleSynthesisCore.submitIntuitiveInput(
        sessionId,
        'Creative intuition says we should also consider energy levels and mood',
        0.7,
        'test_intuitive',
        { test: true }
      );

      setTestResults(prev => [...prev, '🔄 BPSC: Synthesis inputs submitted, waiting for result...']);

      // Wait a moment for synthesis
      setTimeout(() => {
        const stats = biPrincipleSynthesisCore.getSynthesisStats();
        setTestResults(prev => [...prev, `🔄 BPSC: Total syntheses: ${stats.totalSyntheses}, Recent confidence: ${stats.recentAvgConfidence.toFixed(2)}`]);
      }, 1000);

    } catch (error) {
      setTestResults(prev => [...prev, `🔄 BPSC: Error - ${error}`]);
    }
  };

  const testHarmonicConvergence = () => {
    try {
      harmonicFrequencyModulationEngine.forceHarmonicConvergence();
      setTestResults(prev => [...prev, '🎵 HFME: Forced harmonic convergence triggered']);
    } catch (error) {
      setTestResults(prev => [...prev, `🎵 HFME: Convergence error - ${error}`]);
    }
  };

  const testPolarityAutoCorrect = () => {
    try {
      dualPoleEquilibratorModule.autoCorrectImbalances();
      setTestResults(prev => [...prev, '⚖️ DPEM: Auto-correction triggered']);
    } catch (error) {
      setTestResults(prev => [...prev, `⚖️ DPEM: Auto-correction error - ${error}`]);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getModuleHealthColor = (isActive: boolean, health?: number) => {
    if (!isActive) return 'bg-red-500';
    if (health !== undefined) {
      if (health > 0.8) return 'bg-green-500';
      if (health > 0.6) return 'bg-yellow-500';
      return 'bg-orange-500';
    }
    return 'bg-blue-500';
  };

  return (
    <div className="space-y-4">
      {/* Phase 3 Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Phase 3: Flow Orchestration Status
            <Badge className={phase3Health ? 'bg-green-500' : 'bg-gray-500'}>
              {phase3Health ? 'ACTIVE' : 'INACTIVE'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {phase3Health ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={getModuleHealthColor(hfmeStatus?.isActive, hfmeStatus?.harmonyScore)}>
                    HFME
                  </Badge>
                  <span className="text-sm">
                    Harmony: {hfmeStatus?.harmonyScore?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getModuleHealthColor(dpemStatus?.isActive, dpemStatus?.overallBalance)}>
                    DPEM
                  </Badge>
                  <span className="text-sm">
                    Balance: {dpemStatus?.overallBalance?.toFixed(2) || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={getModuleHealthColor(true, cnrStatus?.avgConfidence)}>
                    CNR
                  </Badge>
                  <span className="text-sm">
                    Routes: {cnrStatus?.totalCausalLinks || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getModuleHealthColor(bpscStatus?.isActive, bpscStatus?.recentAvgConfidence)}>
                    BPSC
                  </Badge>
                  <span className="text-sm">
                    Syntheses: {bpscStatus?.totalSyntheses || 0}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Phase 3 modules not initialized</div>
          )}
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Flow Orchestration Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Test Message</label>
            <Textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Enter a test message to process through Phase 3..."
              rows={2}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={runFullFlowTest} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Run Full Flow Test'}
            </Button>
            <Button onClick={testHarmonicConvergence} variant="outline">
              Test HFME Convergence
            </Button>
            <Button onClick={testPolarityAutoCorrect} variant="outline">
              Test DPEM Auto-Correct
            </Button>
            <Button onClick={clearResults} variant="outline">
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Module Details */}
      <Card>
        <CardHeader>
          <CardTitle>Module Status Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="hfme">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="hfme">HFME</TabsTrigger>
              <TabsTrigger value="dpem">DPEM</TabsTrigger>
              <TabsTrigger value="cnr">CNR</TabsTrigger>
              <TabsTrigger value="bpsc">BPSC</TabsTrigger>
            </TabsList>

            <TabsContent value="hfme" className="space-y-2">
              {hfmeStatus ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Harmony Score: {hfmeStatus.harmonyScore?.toFixed(3)}</div>
                    <div>Module Count: {hfmeStatus.moduleCount}</div>
                    <div>Avg Frequency: {hfmeStatus.avgFrequency?.toFixed(1)}Hz</div>
                    <div>Active: {hfmeStatus.isActive ? 'Yes' : 'No'}</div>
                  </div>
                  {hfmeStatus.conflicts?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-red-600">Conflicts:</p>
                      <ul className="text-xs text-red-500">
                        {hfmeStatus.conflicts.map((conflict: string, i: number) => (
                          <li key={i}>• {conflict}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">HFME status not available</div>
              )}
            </TabsContent>

            <TabsContent value="dpem" className="space-y-2">
              {dpemStatus ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Overall Balance: {dpemStatus.overallBalance?.toFixed(3)}</div>
                    <div>Dimensions: {dpemStatus.dimensionCount}</div>
                    <div>Active Imbalances: {dpemStatus.activeImbalances}</div>
                    <div>Active: {dpemStatus.isActive ? 'Yes' : 'No'}</div>
                  </div>
                  {dpemStatus.recentAdjustments?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium">Recent Adjustments:</p>
                      <div className="text-xs space-y-1">
                        {dpemStatus.recentAdjustments.slice(0, 3).map((adj: any, i: number) => (
                          <div key={i}>• {adj.dimensionId}: {adj.reason}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">DPEM status not available</div>
              )}
            </TabsContent>

            <TabsContent value="cnr" className="space-y-2">
              {cnrStatus ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Causal Links: {cnrStatus.totalCausalLinks}</div>
                    <div>Avg Confidence: {cnrStatus.avgConfidence?.toFixed(3)}</div>
                    <div>Routing History: {cnrStatus.routingHistory}</div>
                  </div>
                  {cnrStatus.recentDecisions?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium">Recent Decisions:</p>
                      <div className="text-xs space-y-1">
                        {cnrStatus.recentDecisions.map((decision: any, i: number) => (
                          <div key={i}>• {decision.action} → {decision.outcome} ({decision.confidence.toFixed(2)})</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">CNR status not available</div>
              )}
            </TabsContent>

            <TabsContent value="bpsc" className="space-y-2">
              {bpscStatus ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Total Syntheses: {bpscStatus.totalSyntheses}</div>
                    <div>Recent Confidence: {bpscStatus.recentAvgConfidence?.toFixed(3)}</div>
                    <div>Pending Rational: {bpscStatus.pendingRational}</div>
                    <div>Pending Intuitive: {bpscStatus.pendingIntuitive}</div>
                  </div>
                  {bpscStatus.methodDistribution && Object.keys(bpscStatus.methodDistribution).length > 0 && (
                    <div>
                      <p className="text-sm font-medium">Method Distribution:</p>
                      <div className="text-xs space-y-1">
                        {Object.entries(bpscStatus.methodDistribution).map(([method, count]) => (
                          <div key={method}>• {method}: {String(count)}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">BPSC status not available</div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Test Results
            <Button onClick={clearResults} variant="outline" size="sm">
              Clear
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <div className="text-gray-500">No test results yet</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <Alert key={index}>
                  <AlertDescription className="text-sm font-mono">{result}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};