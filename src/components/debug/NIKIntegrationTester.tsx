// NIK Integration Testing Component
// Tests Neuro-Intent Kernel functionality and persistence

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { neuroIntentKernel } from '@/services/hermetic-core/neuro-intent-kernel';
import type { Intent } from '@/services/hermetic-core/neuro-intent-kernel';

export const NIKIntegrationTester: React.FC = () => {
  const [currentIntent, setCurrentIntent] = useState<Intent | null>(null);
  const [intentHistory, setIntentHistory] = useState<Intent[]>([]);
  const [testMessage, setTestMessage] = useState('');
  const [testMode, setTestMode] = useState<'guide' | 'coach'>('guide');
  const [testResults, setTestResults] = useState<string[]>([]);
  const [sessionId] = useState(`test_session_${Date.now()}`);

  useEffect(() => {
    // Update intent state every 2 seconds
    const interval = setInterval(() => {
      const intent = neuroIntentKernel.getCurrentIntent();
      setCurrentIntent(intent);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const testIntentDetection = () => {
    if (!testMessage.trim()) return;

    const testContext = {
      sessionId,
      agentMode: testMode,
      timestamp: Date.now(),
      messageLength: testMessage.length,
      userId: 'test_user'
    };

    try {
      // Simulate the intent detection logic from UnifiedBrainService
      const detectedIntent = analyzeMessageIntent(testMessage, testMode);
      
      if (detectedIntent) {
        const intent = neuroIntentKernel.setIntent(detectedIntent, testContext, sessionId, testMode);
        setTestResults(prev => [...prev, `✅ Intent detected: "${detectedIntent}" for message: "${testMessage}"`]);
        setIntentHistory(prev => [...prev, intent]);
      } else {
        setTestResults(prev => [...prev, `❌ No intent detected for message: "${testMessage}"`]);
      }
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Error: ${error}`]);
    }

    setTestMessage('');
  };

  const testIntentPersistence = () => {
    // Test persistence by simulating page refresh
    const persistedData = neuroIntentKernel.persistIntent();
    if (persistedData) {
      setTestResults(prev => [...prev, '✅ Intent persisted successfully']);
      
      // Test restoration
      setTimeout(() => {
        const restored = neuroIntentKernel.restoreIntent(persistedData);
        if (restored) {
          setTestResults(prev => [...prev, '✅ Intent restored successfully']);
        } else {
          setTestResults(prev => [...prev, '❌ Intent restoration failed']);
        }
      }, 1000);
    } else {
      setTestResults(prev => [...prev, '❌ No intent to persist']);
    }
  };

  const testIntentUpdate = () => {
    if (!currentIntent) {
      setTestResults(prev => [...prev, '❌ No active intent to update']);
      return;
    }

    neuroIntentKernel.updateIntent({
      type: 'modify',
      intent: { priority: Math.random() },
      reason: 'Test modification'
    });

    setTestResults(prev => [...prev, '✅ Intent updated successfully']);
  };

  const testIntentCompletion = () => {
    if (!currentIntent) {
      setTestResults(prev => [...prev, '❌ No active intent to complete']);
      return;
    }

    neuroIntentKernel.updateIntent({
      type: 'complete',
      intent: {},
      reason: 'Test completion'
    });

    setTestResults(prev => [...prev, '✅ Intent completed successfully']);
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  // Simplified intent analysis (matches UnifiedBrainService logic)
  const analyzeMessageIntent = (message: string, agentMode: string): string | null => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('goal') || lowerMessage.includes('achieve') || lowerMessage.includes('want to')) {
      return 'goal_setting';
    }
    if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('stuck')) {
      return 'problem_solving';
    }
    if (lowerMessage.includes('learn') || lowerMessage.includes('understand') || lowerMessage.includes('explain')) {
      return 'learning';
    }
    if (lowerMessage.includes('plan') || lowerMessage.includes('strategy') || lowerMessage.includes('next steps')) {
      return 'planning';
    }
    if (lowerMessage.includes('feel') || lowerMessage.includes('think') || lowerMessage.includes('reflection')) {
      return 'reflection';
    }
    if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('guidance')) {
      return 'support_seeking';
    }
    
    if (agentMode === 'coach') {
      if (lowerMessage.includes('task') || lowerMessage.includes('work') || lowerMessage.includes('project')) {
        return 'task_management';
      }
    }
    
    if (agentMode === 'guide') {
      if (lowerMessage.includes('growth') || lowerMessage.includes('improve') || lowerMessage.includes('better')) {
        return 'personal_growth';
      }
    }
    
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Current Intent Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Intent Status</CardTitle>
        </CardHeader>
        <CardContent>
          {currentIntent ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="default">{currentIntent.primary}</Badge>
                <span className="text-sm text-gray-600">Priority: {currentIntent.priority}</span>
              </div>
              <div className="text-sm">
                <div>Session: {currentIntent.sessionId}</div>
                <div>Domain: {currentIntent.domain}</div>
                <div>Created: {new Date(currentIntent.timestamp).toLocaleTimeString()}</div>
                {currentIntent.subIntents.length > 0 && (
                  <div>Sub-intents: {currentIntent.subIntents.join(', ')}</div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No active intent</div>
          )}
        </CardContent>
      </Card>

      {/* Intent Detection Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Intent Detection Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter test message..."
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && testIntentDetection()}
            />
            <Select value={testMode} onValueChange={(value: 'guide' | 'coach') => setTestMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="guide">Guide</SelectItem>
                <SelectItem value="coach">Coach</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={testIntentDetection}>Test Intent</Button>
          </div>
          
          <div className="text-sm text-gray-600">
            Try messages like: "I want to achieve my goals", "I need help with a problem", "Let me learn something new"
          </div>
        </CardContent>
      </Card>

      {/* Intent Management Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Intent Management Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={testIntentPersistence} variant="outline">
              Test Persistence
            </Button>
            <Button onClick={testIntentUpdate} variant="outline">
              Update Intent
            </Button>
            <Button onClick={testIntentCompletion} variant="outline">
              Complete Intent
            </Button>
          </div>
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

      {/* Intent History */}
      <Card>
        <CardHeader>
          <CardTitle>Intent History</CardTitle>
        </CardHeader>
        <CardContent>
          {intentHistory.length === 0 ? (
            <div className="text-gray-500">No intents in history</div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {intentHistory.slice(-5).map((intent, index) => (
                <div key={index} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                  <Badge variant="outline">{intent.primary}</Badge>
                  <span>{intent.domain}</span>
                  <span className="text-gray-500">{new Date(intent.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};