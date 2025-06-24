
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';
import { sevenLayerPersonalityEngine } from '@/services/seven-layer-personality-engine';
import { personalityEngine } from '@/services/personality-engine';

interface PersonalityTest {
  name: string;
  description: string;
  status: 'pending' | 'testing' | 'passed' | 'failed';
  details?: string;
  executionTime?: number;
}

const PersonalityTestRunner: React.FC = () => {
  const [tests, setTests] = useState<PersonalityTest[]>([
    {
      name: 'Seven Layer Personality Engine',
      description: 'Test the seven layer personality system integration',
      status: 'pending'
    },
    {
      name: 'Personality Engine Core',
      description: 'Test core personality engine functionality',
      status: 'pending'
    },
    {
      name: 'Blueprint-Personality Alignment',
      description: 'Test alignment between blueprint data and personality traits',
      status: 'pending'
    },
    {
      name: 'Dynamic Personality Adaptation',
      description: 'Test personality adaptation based on user interactions',
      status: 'pending'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuth();
  const { blueprintData, hasBlueprint } = useBlueprintCache();

  const runPersonalityTests = async () => {
    if (!user) {
      console.log('❌ No authenticated user for personality testing');
      return;
    }

    setIsRunning(true);
    console.log('🧠 Starting personality system tests');

    const updatedTests = [...tests];

    for (let i = 0; i < updatedTests.length; i++) {
      updatedTests[i].status = 'testing';
      setTests([...updatedTests]);

      try {
        const startTime = Date.now();
        let testResult = false;
        let details = '';

        switch (updatedTests[i].name) {
          case 'Seven Layer Personality Engine':
            testResult = await testSevenLayerEngine();
            details = testResult ? 'Seven layer engine functioning correctly' : 'Seven layer engine has issues';
            break;
          case 'Personality Engine Core':
            testResult = await testPersonalityEngineCore();
            details = testResult ? 'Core personality engine working' : 'Core personality engine failed';
            break;
          case 'Blueprint-Personality Alignment':
            testResult = await testBlueprintAlignment();
            details = testResult ? 'Blueprint alignment successful' : 'Blueprint alignment failed';
            break;
          case 'Dynamic Personality Adaptation':
            testResult = await testDynamicAdaptation();
            details = testResult ? 'Dynamic adaptation working' : 'Dynamic adaptation failed';
            break;
        }

        const executionTime = Date.now() - startTime;
        updatedTests[i].status = testResult ? 'passed' : 'failed';
        updatedTests[i].details = details;
        updatedTests[i].executionTime = executionTime;

      } catch (error) {
        console.error(`❌ Personality test failed: ${updatedTests[i].name}`, error);
        updatedTests[i].status = 'failed';
        updatedTests[i].details = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }

      setTests([...updatedTests]);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
    console.log('✅ Personality system tests completed');
  };

  const testSevenLayerEngine = async (): Promise<boolean> => {
    try {
      if (!blueprintData) return false;
      
      const personalityLayers = await sevenLayerPersonalityEngine.generatePersonalityLayers(
        blueprintData,
        user!.id
      );
      
      return personalityLayers && personalityLayers.length > 0;
    } catch (error) {
      console.error('Seven layer engine test error:', error);
      return false;
    }
  };

  const testPersonalityEngineCore = async (): Promise<boolean> => {
    try {
      if (!blueprintData) return false;
      
      const personalityProfile = await personalityEngine.generatePersonalityProfile(
        blueprintData,
        user!.id
      );
      
      return personalityProfile && personalityProfile.traits && personalityProfile.traits.length > 0;
    } catch (error) {
      console.error('Personality engine core test error:', error);
      return false;
    }
  };

  const testBlueprintAlignment = async (): Promise<boolean> => {
    try {
      if (!hasBlueprint || !blueprintData) return false;
      
      const alignment = await personalityEngine.validateBlueprintAlignment(
        blueprintData,
        user!.id
      );
      
      return alignment.isValid;
    } catch (error) {
      console.error('Blueprint alignment test error:', error);
      return false;
    }
  };

  const testDynamicAdaptation = async (): Promise<boolean> => {
    try {
      if (!blueprintData) return false;
      
      const adaptedProfile = await personalityEngine.adaptPersonalityToContext(
        blueprintData,
        'test_context',
        user!.id
      );
      
      return adaptedProfile && adaptedProfile.adaptations && adaptedProfile.adaptations.length > 0;
    } catch (error) {
      console.error('Dynamic adaptation test error:', error);
      return false;
    }
  };

  const resetTests = () => {
    setTests(tests.map(test => ({ 
      ...test, 
      status: 'pending', 
      details: undefined, 
      executionTime: undefined 
    })));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'testing': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const passedTests = tests.filter(t => t.status === 'passed').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;
  const totalTests = tests.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Personality System Tests
        </CardTitle>
        <div className="flex gap-4 text-sm">
          <span>Passed: <Badge className="bg-green-100 text-green-800">{passedTests}/{totalTests}</Badge></span>
          <span>Failed: <Badge className="bg-red-100 text-red-800">{failedTests}/{totalTests}</Badge></span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runPersonalityTests} 
            disabled={isRunning || !user}
            className="flex items-center gap-2"
          >
            {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
            {isRunning ? 'Testing...' : 'Run Personality Tests'}
          </Button>
          <Button variant="outline" onClick={resetTests} disabled={isRunning}>
            Reset
          </Button>
        </div>

        <div className="space-y-3">
          {tests.map((test, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(test.status)}
                  <span className="font-medium">{test.name}</span>
                  {test.executionTime && (
                    <Badge variant="outline">{test.executionTime}ms</Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{test.description}</p>
              {test.details && (
                <p className="text-xs bg-gray-50 p-2 rounded">
                  {test.details}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalityTestRunner;
