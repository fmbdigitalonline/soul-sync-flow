// NIK Integration Testing Component
// Tests enhanced Neuro-Intent Kernel with TMG persistence and module broadcasting

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { unifiedBrainService } from '@/services/unified-brain-service';
import { neuroIntentKernel } from '@/services/hermetic-core/neuro-intent-kernel';

export const NIKIntegrationTester: React.FC = () => {
  // NIK Status
  const [nikStatus, setNikStatus] = useState<any>(null);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Test inputs
  const [testIntent, setTestIntent] = useState('Help me plan my day and achieve my goals');
  const [sessionId, setSessionId] = useState(`test_${Date.now()}`);
  const [agentMode, setAgentMode] = useState<'guide' | 'coach'>('guide');

  // Current intent display
  const [currentIntent, setCurrentIntent] = useState<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      updateNIKStatus();
    }, 2000);

    updateNIKStatus();
    return () => clearInterval(interval);
  }, []);

  const updateNIKStatus = () => {
    try {
      const status = unifiedBrainService.getNIKStatus();
      setNikStatus(status);
      setCurrentIntent(status.currentIntent);
    } catch (error) {
      console.error('Error updating NIK status:', error);
    }
  };

  const testIntentSetting = async () => {
    setIsProcessing(true);
    setTestResults([]);

    try {
      setTestResults(prev => [...prev, '🧠 Testing intent setting with enhanced NIK...']);

      const context = {
        sessionId,
        agentMode,
        timestamp: Date.now(),
        messageLength: testIntent.length,
        userId: 'test_user'
      };

      const intent = neuroIntentKernel.setIntent(testIntent, context, sessionId, agentMode);
      
      setTestResults(prev => [...prev, `✅ Intent set successfully: "${intent.primary}"`]);
      setTestResults(prev => [...prev, `🔍 Intent ID: ${intent.id}`]);
      setTestResults(prev => [...prev, `📊 Priority: ${intent.priority}`]);
      setTestResults(prev => [...prev, `🎯 Coherence Score: ${intent.coherenceScore?.toFixed(2)}`]);
      
      if (intent.subIntents && intent.subIntents.length > 0) {
        setTestResults(prev => [...prev, `📋 Sub-intents: ${intent.subIntents.join(', ')}`]);
      }
      
      if (intent.constraints && intent.constraints.length > 0) {
        setTestResults(prev => [...prev, `⚠️ Constraints: ${intent.constraints.join(', ')}`]);
      }

      if (intent.decomposition) {
        setTestResults(prev => [...prev, `🔄 Decomposed steps: ${intent.decomposition.steps.length}`]);
        setTestResults(prev => [...prev, `⏱️ Estimated duration: ${intent.decomposition.estimatedDuration}s`]);
      }

    } catch (error) {
      setTestResults(prev => [...prev, `❌ Error setting intent: ${error}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  const testTMGPersistence = async () => {
    setIsProcessing(true);
    
    try {
      setTestResults(prev => [...prev, '💾 Testing TMG persistence...']);

      // First, persist current intent
      const persistResult = neuroIntentKernel.persistIntent();
      if (persistResult) {
        setTestResults(prev => [...prev, '✅ Intent persisted to TMG successfully']);
      }

      // Then try to restore
      setTimeout(async () => {
        try {
          const restored = await neuroIntentKernel.restoreFromTMG(sessionId);
          if (restored) {
            setTestResults(prev => [...prev, `✅ Intent restored from TMG: "${restored.primary}"`]);
          } else {
            setTestResults(prev => [...prev, '⚠️ No intent found in TMG for restoration']);
          }
        } catch (error) {
          setTestResults(prev => [...prev, `❌ TMG restoration error: ${error}`]);
        }
      }, 1000);

    } catch (error) {
      setTestResults(prev => [...prev, `❌ TMG persistence error: ${error}`]);
    } finally {
      setTimeout(() => setIsProcessing(false), 1500);
    }
  };

  const testInternalGeneration = async () => {
    setIsProcessing(true);
    
    try {
      setTestResults(prev => [...prev, '🤖 Testing internal intent generation...']);

      const observations = {
        sessionId,
        agentMode,
        contextChange: true,
        userId: 'test_user',
        inactivityTime: 300000 // 5 minutes
      };

      const internalIntent = neuroIntentKernel.generateInternalIntent(observations);
      
      if (internalIntent) {
        setTestResults(prev => [...prev, `✅ Internal intent generated: "${internalIntent.primary}"`]);
        setTestResults(prev => [...prev, `🔮 Source: ${internalIntent.context.source}`]);
        setTestResults(prev => [...prev, `📊 Priority: ${internalIntent.priority} (internal)`]);
      } else {
        setTestResults(prev => [...prev, '⚠️ No internal intent generated (conditions not met)']);
      }

    } catch (error) {
      setTestResults(prev => [...prev, `❌ Internal generation error: ${error}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  const testModuleBroadcasting = async () => {
    setIsProcessing(true);
    
    try {
      setTestResults(prev => [...prev, '📡 Testing module broadcasting...']);

      // Set a new intent to trigger broadcasts
      const broadcastContext = {
        sessionId,
        agentMode,
        timestamp: Date.now(),
        userId: 'test_user'
      };

      const intent = neuroIntentKernel.setIntent(
        'Test broadcasting to all HACS modules', 
        broadcastContext, 
        sessionId, 
        agentMode
      );

      setTestResults(prev => [...prev, '✅ Intent set - broadcasts should have been sent to:']);
      setTestResults(prev => [...prev, '  📊 ACS (Adaptive Context Scheduler) for prioritization']);
      setTestResults(prev => [...prev, '  🔗 CNR (Causal Nexus Router) for evaluation']);
      setTestResults(prev => [...prev, '  💡 PIE (Proactive Insight Engine) for suggestions']);
      setTestResults(prev => [...prev, '  🧠 TMG (Tiered Memory Graph) for monitoring']);
      
      setTestResults(prev => [...prev, `📈 Check console logs for detailed broadcast messages`]);

    } catch (error) {
      setTestResults(prev => [...prev, `❌ Broadcasting error: ${error}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  const testFullWorkflow = async () => {
    setIsProcessing(true);
    setTestResults([]);
    
    try {
      setTestResults(prev => [...prev, '🚀 Running full NIK workflow test...']);

      // Step 1: Set intent
      await testIntentSetting();
      
      // Step 2: Test persistence
      setTimeout(async () => {
        await testTMGPersistence();
        
        // Step 3: Test broadcasting
        setTimeout(async () => {
          await testModuleBroadcasting();
          
          // Step 4: Test internal generation
          setTimeout(async () => {
            await testInternalGeneration();
            setTestResults(prev => [...prev, '🎉 Full NIK workflow test completed!']);
          }, 2000);
        }, 2000);
      }, 2000);

    } catch (error) {
      setTestResults(prev => [...prev, `❌ Full workflow error: ${error}`]);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500' : 'bg-gray-500';
  };

  return (
    <div className="space-y-4">
      {/* NIK Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Neuro-Intent Kernel (NIK) Status
            <Badge className={getStatusColor(!!currentIntent)}>
              {currentIntent ? 'ACTIVE' : 'INACTIVE'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentIntent ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Intent:</strong> {currentIntent.primary}</div>
                <div><strong>Priority:</strong> {currentIntent.priority}</div>
                <div><strong>Domain:</strong> {currentIntent.domain}</div>
                <div><strong>Session:</strong> {currentIntent.sessionId}</div>
                <div><strong>Coherence:</strong> {currentIntent.coherenceScore?.toFixed(2)}</div>
                <div><strong>Created:</strong> {new Date(currentIntent.timestamp).toLocaleTimeString()}</div>
              </div>
              {currentIntent.subIntents?.length > 0 && (
                <div>
                  <strong>Sub-intents:</strong> {currentIntent.subIntents.join(', ')}
                </div>
              )}
              {currentIntent.constraints?.length > 0 && (
                <div>
                  <strong>Constraints:</strong> {currentIntent.constraints.join(', ')}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">No active intent</div>
          )}
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>NIK Enhancement Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Test Intent</label>
              <Textarea
                value={testIntent}
                onChange={(e) => setTestIntent(e.target.value)}
                placeholder="Enter intent to test..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Session ID</label>
                <Input
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  placeholder="Session ID"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Agent Mode</label>
                <select 
                  value={agentMode} 
                  onChange={(e) => setAgentMode(e.target.value as 'guide' | 'coach')}
                  className="w-full p-2 border rounded"
                >
                  <option value="guide">Guide</option>
                  <option value="coach">Coach</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={testIntentSetting} disabled={isProcessing}>
              Test Intent Setting
            </Button>
            <Button onClick={testTMGPersistence} disabled={isProcessing} variant="outline">
              Test TMG Persistence
            </Button>
            <Button onClick={testInternalGeneration} disabled={isProcessing} variant="outline">
              Test Internal Generation
            </Button>
            <Button onClick={testModuleBroadcasting} disabled={isProcessing} variant="outline">
              Test Broadcasting
            </Button>
            <Button onClick={testFullWorkflow} disabled={isProcessing} variant="secondary">
              Run Full Workflow
            </Button>
            <Button onClick={clearResults} variant="outline" size="sm">
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle>NIK Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="modules">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="modules">Module Integration</TabsTrigger>
              <TabsTrigger value="tmg">TMG Integration</TabsTrigger>
              <TabsTrigger value="history">Intent History</TabsTrigger>
            </TabsList>

            <TabsContent value="modules" className="space-y-2">
              {nikStatus?.registeredModules ? (
                <div className="grid grid-cols-2 gap-2">
                  {nikStatus.registeredModules.map((module: string) => (
                    <div key={module} className="flex items-center gap-2">
                      <Badge className="bg-blue-500">{module.toUpperCase()}</Badge>
                      <span className="text-sm">Registered</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">No module registrations found</div>
              )}
            </TabsContent>

            <TabsContent value="tmg" className="space-y-2">
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(nikStatus?.tmgIntegration)}>
                    TMG
                  </Badge>
                  <span>{nikStatus?.tmgIntegration ? 'Connected' : 'Disconnected'}</span>
                </div>
                <div>
                  <strong>Intent State:</strong> {nikStatus?.intentState?.hasActiveIntent ? 'Active' : 'Inactive'}
                </div>
                <div>
                  <strong>Intent Count:</strong> {nikStatus?.intentState?.intentCount || 0}
                </div>
                <div>
                  <strong>Last Update:</strong> {nikStatus?.intentState?.lastUpdate ? 
                    new Date(nikStatus.intentState.lastUpdate).toLocaleString() : 'Never'}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-2">
              <div className="text-sm">
                <div>Intent tracking and history functionality is active.</div>
                <div>Historical intents are maintained for session continuity.</div>
                <div>Cross-session persistence through TMG integration.</div>
              </div>
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