// CPSR Integration Testing Component
// Tests Cross-Plane State Reflector functionality and state synchronization

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { crossPlaneStateReflector } from '@/services/hermetic-core/cross-plane-state-reflector';
import { unifiedBrainService } from '@/services/unified-brain-service';
import type { PlaneState, StateChange } from '@/services/hermetic-core/cross-plane-state-reflector';

export const CPSRIntegrationTester: React.FC = () => {
  const [currentState, setCurrentState] = useState<PlaneState | null>(null);
  const [stateChanges, setStateChanges] = useState<StateChange[]>([]);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [sessionId] = useState(`test_session_${Date.now()}`);

  // Test inputs
  const [externalKey, setExternalKey] = useState('user_input');
  const [externalValue, setExternalValue] = useState('');
  const [internalKey, setInternalKey] = useState('current_intent');
  const [internalValue, setInternalValue] = useState('');
  const [metaKey, setMetaKey] = useState('message_length');
  const [metaValue, setMetaValue] = useState('');

  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = crossPlaneStateReflector.onStateChange((change: StateChange) => {
      setStateChanges(prev => [change, ...prev.slice(0, 9)]); // Keep last 10 changes
    });

    // Update state every 2 seconds
    const interval = setInterval(() => {
      const unified = crossPlaneStateReflector.getUnifiedState();
      setCurrentState(unified);
    }, 2000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const updateExternalState = () => {
    if (!externalKey.trim() || !externalValue.trim()) return;

    try {
      crossPlaneStateReflector.updateExternalState(externalKey, externalValue, 'cpsr_tester');
      setTestResults(prev => [...prev, `✅ Updated external.${externalKey} = ${externalValue}`]);
      setExternalValue('');
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Error updating external state: ${error}`]);
    }
  };

  const updateInternalState = () => {
    if (!internalKey.trim() || !internalValue.trim()) return;

    try {
      crossPlaneStateReflector.updateInternalState(internalKey, internalValue, 'cpsr_tester');
      setTestResults(prev => [...prev, `✅ Updated internal.${internalKey} = ${internalValue}`]);
      setInternalValue('');
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Error updating internal state: ${error}`]);
    }
  };

  const updateMetaState = () => {
    if (!metaKey.trim() || !metaValue.trim()) return;

    try {
      const value = isNaN(Number(metaValue)) ? metaValue : Number(metaValue);
      crossPlaneStateReflector.updateMetaState(metaKey, value, 'cpsr_tester');
      setTestResults(prev => [...prev, `✅ Updated meta.${metaKey} = ${value}`]);
      setMetaValue('');
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Error updating meta state: ${error}`]);
    }
  };

  const testStateReflection = () => {
    try {
      // Test reflection rules by setting specific external state
      crossPlaneStateReflector.updateExternalState('user_input', 'test reflection message', 'cpsr_tester');
      
      setTimeout(() => {
        const state = crossPlaneStateReflector.getUnifiedState();
        const hasReflection = state.internal.current_context !== undefined;
        
        if (hasReflection) {
          setTestResults(prev => [...prev, '✅ State reflection working - external change reflected to internal']);
        } else {
          setTestResults(prev => [...prev, '❌ State reflection failed - no internal reflection detected']);
        }
      }, 100);
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Error testing state reflection: ${error}`]);
    }
  };

  const testCorrespondenceRules = () => {
    try {
      // Test correspondence rules
      crossPlaneStateReflector.updateExternalState('system_mode', 'ENHANCED', 'cpsr_tester');
      
      setTimeout(() => {
        const state = crossPlaneStateReflector.getUnifiedState();
        const hasCorrespondence = state.internal.processing_mode === 'ENHANCED';
        
        if (hasCorrespondence) {
          setTestResults(prev => [...prev, '✅ Correspondence rules working - macro change reflected to micro']);
        } else {
          setTestResults(prev => [...prev, '❌ Correspondence rules failed - no micro reflection detected']);
        }
      }, 100);
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Error testing correspondence rules: ${error}`]);
    }
  };

  const forceSynchronization = () => {
    try {
      crossPlaneStateReflector.synchronizePlanes();
      setTestResults(prev => [...prev, '✅ Forced plane synchronization completed']);
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Error forcing synchronization: ${error}`]);
    }
  };

  const testUnifiedBrainIntegration = async () => {
    try {
      const cpserState = unifiedBrainService.getCPSRState();
      
      if (cpserState.unifiedState) {
        setTestResults(prev => [...prev, `✅ Unified Brain CPSR integration working - ${cpserState.sessionStates.length} session states`]);
      } else {
        setTestResults(prev => [...prev, '❌ Unified Brain CPSR integration failed - no state available']);
      }
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Error testing Unified Brain integration: ${error}`]);
    }
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  const renderStateValue = (value: any) => {
    if (typeof value === 'object') {
      return JSON.stringify(value).substring(0, 50) + (JSON.stringify(value).length > 50 ? '...' : '');
    }
    return String(value);
  };

  return (
    <div className="space-y-4">
      {/* Current State Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Cross-Plane State Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {currentState ? (
            <Tabs defaultValue="external">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="external">External ({Object.keys(currentState.external).length})</TabsTrigger>
                <TabsTrigger value="internal">Internal ({Object.keys(currentState.internal).length})</TabsTrigger>
                <TabsTrigger value="meta">Meta ({Object.keys(currentState.meta).length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="external" className="space-y-2">
                {Object.entries(currentState.external).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 text-sm p-2 bg-blue-50 rounded">
                    <Badge variant="outline">{key}</Badge>
                    <span>{renderStateValue(value)}</span>
                  </div>
                ))}
                {Object.keys(currentState.external).length === 0 && (
                  <div className="text-gray-500">No external state</div>
                )}
              </TabsContent>
              
              <TabsContent value="internal" className="space-y-2">
                {Object.entries(currentState.internal).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 text-sm p-2 bg-green-50 rounded">
                    <Badge variant="outline">{key}</Badge>
                    <span>{renderStateValue(value)}</span>
                  </div>
                ))}
                {Object.keys(currentState.internal).length === 0 && (
                  <div className="text-gray-500">No internal state</div>
                )}
              </TabsContent>
              
              <TabsContent value="meta" className="space-y-2">
                {Object.entries(currentState.meta).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 text-sm p-2 bg-purple-50 rounded">
                    <Badge variant="outline">{key}</Badge>
                    <span>{renderStateValue(value)}</span>
                  </div>
                ))}
                {Object.keys(currentState.meta).length === 0 && (
                  <div className="text-gray-500">No meta state</div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-gray-500">Loading state...</div>
          )}
        </CardContent>
      </Card>

      {/* State Update Controls */}
      <Card>
        <CardHeader>
          <CardTitle>State Update Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* External State */}
          <div className="space-y-2">
            <label className="text-sm font-medium">External State</label>
            <div className="flex gap-2">
              <Select value={externalKey} onValueChange={setExternalKey}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user_input">user_input</SelectItem>
                  <SelectItem value="session_id">session_id</SelectItem>
                  <SelectItem value="domain_context">domain_context</SelectItem>
                  <SelectItem value="system_mode">system_mode</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Value..."
                value={externalValue}
                onChange={(e) => setExternalValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && updateExternalState()}
              />
              <Button onClick={updateExternalState}>Update External</Button>
            </div>
          </div>

          {/* Internal State */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Internal State</label>
            <div className="flex gap-2">
              <Select value={internalKey} onValueChange={setInternalKey}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_intent">current_intent</SelectItem>
                  <SelectItem value="intent_priority">intent_priority</SelectItem>
                  <SelectItem value="active_domain">active_domain</SelectItem>
                  <SelectItem value="processing_mode">processing_mode</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Value..."
                value={internalValue}
                onChange={(e) => setInternalValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && updateInternalState()}
              />
              <Button onClick={updateInternalState}>Update Internal</Button>
            </div>
          </div>

          {/* Meta State */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Meta State</label>
            <div className="flex gap-2">
              <Select value={metaKey} onValueChange={setMetaKey}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="message_length">message_length</SelectItem>
                  <SelectItem value="session_active">session_active</SelectItem>
                  <SelectItem value="last_interaction">last_interaction</SelectItem>
                  <SelectItem value="module_health">module_health</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Value..."
                value={metaValue}
                onChange={(e) => setMetaValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && updateMetaState()}
              />
              <Button onClick={updateMetaState}>Update Meta</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing Controls */}
      <Card>
        <CardHeader>
          <CardTitle>CPSR Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={testStateReflection} variant="outline">
              Test State Reflection
            </Button>
            <Button onClick={testCorrespondenceRules} variant="outline">
              Test Correspondence Rules
            </Button>
            <Button onClick={forceSynchronization} variant="outline">
              Force Sync
            </Button>
            <Button onClick={testUnifiedBrainIntegration} variant="outline">
              Test UB Integration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent State Changes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent State Changes</CardTitle>
        </CardHeader>
        <CardContent>
          {stateChanges.length === 0 ? (
            <div className="text-gray-500">No state changes yet</div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {stateChanges.map((change, index) => (
                <div key={index} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                  <Badge className={
                    change.plane === 'external' ? 'bg-blue-500' :
                    change.plane === 'internal' ? 'bg-green-500' : 'bg-purple-500'
                  }>
                    {change.plane}
                  </Badge>
                  <span>{change.key}</span>
                  <span>=</span>
                  <span>{renderStateValue(change.value)}</span>
                  <span className="text-gray-400 text-xs">{change.source}</span>
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