// TWS Integration Testing Component
// Tests Temporal Wave Synchronizer functionality and cognitive rhythm cycles

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { temporalWaveSynchronizer } from '@/services/hermetic-core/temporal-wave-synchronizer';
import { unifiedBrainService } from '@/services/unified-brain-service';
import type { CognitivePhase, CycleEvent } from '@/services/hermetic-core/temporal-wave-synchronizer';

export const TWSIntegrationTester: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<CognitivePhase | null>(null);
  const [cycleInfo, setCycleInfo] = useState<any>(null);
  const [recentEvents, setRecentEvents] = useState<CycleEvent[]>([]);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [registeredModules, setRegisteredModules] = useState<string[]>(['unified_brain']);

  // Test module registration
  const [moduleId, setModuleId] = useState('test_module');
  const [moduleFreq, setModuleFreq] = useState('1.0');

  useEffect(() => {
    // Subscribe to TWS events
    const unsubscribePhaseStart = temporalWaveSynchronizer.onEvent('phase_start', (event) => {
      setRecentEvents(prev => [event, ...prev.slice(0, 9)]);
    });

    const unsubscribePhaseEnd = temporalWaveSynchronizer.onEvent('phase_end', (event) => {
      setRecentEvents(prev => [event, ...prev.slice(0, 9)]);
    });

    const unsubscribeCycleComplete = temporalWaveSynchronizer.onEvent('cycle_complete', (event) => {
      setRecentEvents(prev => [event, ...prev.slice(0, 9)]);
    });

    // Update timing info every second
    const interval = setInterval(() => {
      try {
        const info = temporalWaveSynchronizer.getCycleInfo();
        const phase = temporalWaveSynchronizer.getCurrentPhase();
        
        setCycleInfo(info);
        setCurrentPhase(phase);
        setIsRunning(info.isRunning);
      } catch (error) {
        console.error('Error getting TWS info:', error);
      }
    }, 1000);

    return () => {
      unsubscribePhaseStart();
      unsubscribePhaseEnd();
      unsubscribeCycleComplete();
      clearInterval(interval);
    };
  }, []);

  const startTWS = () => {
    try {
      temporalWaveSynchronizer.start();
      setTestResults(prev => [...prev, '✅ TWS started successfully']);
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Error starting TWS: ${error}`]);
    }
  };

  const stopTWS = () => {
    try {
      temporalWaveSynchronizer.stop();
      setTestResults(prev => [...prev, '✅ TWS stopped successfully']);
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Error stopping TWS: ${error}`]);
    }
  };

  const registerTestModule = () => {
    if (!moduleId.trim() || !moduleFreq.trim()) return;

    try {
      const frequency = parseFloat(moduleFreq);
      let callCount = 0;
      
      temporalWaveSynchronizer.registerModule(moduleId, frequency, () => {
        callCount++;
        console.log(`Test module ${moduleId} executed ${callCount} times`);
      });

      setRegisteredModules(prev => [...prev, moduleId]);
      setTestResults(prev => [...prev, `✅ Registered module "${moduleId}" at ${frequency}Hz`]);
      setModuleId('');
      setModuleFreq('1.0');
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Error registering module: ${error}`]);
    }
  };

  const unregisterModule = (moduleToRemove: string) => {
    try {
      temporalWaveSynchronizer.unregisterModule(moduleToRemove);
      setRegisteredModules(prev => prev.filter(m => m !== moduleToRemove));
      setTestResults(prev => [...prev, `✅ Unregistered module "${moduleToRemove}"`]);
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Error unregistering module: ${error}`]);
    }
  };

  const adjustPhaseTiming = (phaseName: string) => {
    try {
      const currentDuration = currentPhase?.duration || 200;
      const newDuration = currentDuration * 1.5; // Increase by 50%
      
      temporalWaveSynchronizer.adjustPhaseTiming(phaseName, newDuration);
      setTestResults(prev => [...prev, `✅ Adjusted ${phaseName} phase to ${newDuration}ms`]);
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Error adjusting phase timing: ${error}`]);
    }
  };

  const testRhythmPattern = (pattern: 'focus-rest' | 'scan-focus' | 'learn-act') => {
    try {
      temporalWaveSynchronizer.enforceRhythmPattern(pattern);
      setTestResults(prev => [...prev, `✅ Applied rhythm pattern: ${pattern}`]);
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Error applying rhythm pattern: ${error}`]);
    }
  };

  const testUnifiedBrainIntegration = () => {
    try {
      const twsInfo = unifiedBrainService.getTWSInfo();
      
      if (twsInfo.isActive) {
        setTestResults(prev => [...prev, `✅ Unified Brain TWS integration working - Active: ${twsInfo.isActive}`]);
      } else {
        setTestResults(prev => [...prev, '❌ Unified Brain TWS integration failed - Not active']);
      }
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Error testing Unified Brain integration: ${error}`]);
    }
  };

  const testExternalClockSync = () => {
    try {
      const externalTimestamp = Date.now() + 500; // 500ms in the future
      temporalWaveSynchronizer.syncToExternalClock(externalTimestamp);
      setTestResults(prev => [...prev, '✅ External clock sync test completed']);
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Error testing external clock sync: ${error}`]);
    }
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'perception': return 'bg-blue-500';
      case 'analysis': return 'bg-green-500';
      case 'decision': return 'bg-yellow-500';
      case 'action': return 'bg-red-500';
      case 'reflection': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const calculatePhaseProgress = () => {
    if (!cycleInfo || !currentPhase) return 0;
    
    const totalCycleDuration = cycleInfo.totalDuration;
    const currentPhaseIndex = cycleInfo.currentPhase?.name === currentPhase.name ? 0 : 0;
    const baseProgress = (currentPhaseIndex / 5) * 100; // 5 phases total
    
    return Math.min(100, baseProgress + (100 / 5)); // Rough approximation
  };

  return (
    <div className="space-y-4">
      {/* TWS Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Temporal Wave Synchronizer Status
            <Badge className={isRunning ? 'bg-green-500' : 'bg-red-500'}>
              {isRunning ? 'RUNNING' : 'STOPPED'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cycleInfo && currentPhase ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Current Phase</label>
                  <div className="flex items-center gap-2">
                    <Badge className={getPhaseColor(currentPhase.name)}>
                      {currentPhase.name.toUpperCase()}
                    </Badge>
                    <span className="text-sm">{currentPhase.duration}ms @ {currentPhase.frequency}Hz</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Cycle Count</label>
                  <div className="text-lg font-bold">{cycleInfo.cycleCount}</div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Cycle Progress</label>
                <Progress value={calculatePhaseProgress()} className="mt-1" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Total Duration: {cycleInfo.totalDuration}ms</div>
                <div>Uptime: {Math.round(cycleInfo.uptime / 1000)}s</div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">TWS not running or no data available</div>
          )}
        </CardContent>
      </Card>

      {/* TWS Controls */}
      <Card>
        <CardHeader>
          <CardTitle>TWS Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={startTWS} disabled={isRunning}>
              Start TWS
            </Button>
            <Button onClick={stopTWS} disabled={!isRunning} variant="outline">
              Stop TWS
            </Button>
            <Button onClick={testUnifiedBrainIntegration} variant="outline">
              Test UB Integration
            </Button>
          </div>

          {/* Module Registration */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Register Test Module</label>
            <div className="flex gap-2">
              <input
                className="flex-1 px-3 py-2 border rounded"
                placeholder="Module ID..."
                value={moduleId}
                onChange={(e) => setModuleId(e.target.value)}
              />
              <input
                className="w-20 px-3 py-2 border rounded"
                placeholder="Hz"
                value={moduleFreq}
                onChange={(e) => setModuleFreq(e.target.value)}
              />
              <Button onClick={registerTestModule}>Register</Button>
            </div>
          </div>

          {/* Registered Modules */}
          {registeredModules.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Registered Modules</label>
              <div className="flex gap-2 flex-wrap">
                {registeredModules.map((module) => (
                  <div key={module} className="flex items-center gap-1 p-2 bg-gray-100 rounded">
                    <span className="text-sm">{module}</span>
                    {module !== 'unified_brain' && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => unregisterModule(module)}
                        className="h-4 w-4 p-0"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phase Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Phase & Rhythm Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="phases">
            <TabsList>
              <TabsTrigger value="phases">Phase Timing</TabsTrigger>
              <TabsTrigger value="rhythms">Rhythm Patterns</TabsTrigger>
              <TabsTrigger value="sync">Clock Sync</TabsTrigger>
            </TabsList>
            
            <TabsContent value="phases" className="space-y-2">
              {['perception', 'analysis', 'decision', 'action', 'reflection'].map((phase) => (
                <Button 
                  key={phase} 
                  onClick={() => adjustPhaseTiming(phase)}
                  variant="outline"
                  className="mr-2"
                >
                  Extend {phase}
                </Button>
              ))}
            </TabsContent>
            
            <TabsContent value="rhythms" className="space-y-2">
              {['focus-rest', 'scan-focus', 'learn-act'].map((pattern) => (
                <Button 
                  key={pattern} 
                  onClick={() => testRhythmPattern(pattern as any)}
                  variant="outline"
                  className="mr-2"
                >
                  {pattern}
                </Button>
              ))}
            </TabsContent>
            
            <TabsContent value="sync">
              <Button onClick={testExternalClockSync} variant="outline">
                Test External Clock Sync
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent TWS Events</CardTitle>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <div className="text-gray-500">No events yet</div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {recentEvents.map((event, index) => (
                <div key={index} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                  <Badge variant="outline">{event.type}</Badge>
                  {event.phase && <span>{event.phase.name}</span>}
                  <span className="text-gray-400 text-xs">
                    {event.timestamp.toLocaleTimeString()}
                  </span>
                  {event.data && (
                    <span className="text-gray-600">
                      {JSON.stringify(event.data).substring(0, 30)}...
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Test Results
            <Button onClick={clearTestResults} variant="outline" size="sm">
              Clear
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <div className="text-gray-500">No test results yet</div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {testResults.map((result, index) => (
                <Alert key={index}>
                  <AlertDescription className="text-sm">{result}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};