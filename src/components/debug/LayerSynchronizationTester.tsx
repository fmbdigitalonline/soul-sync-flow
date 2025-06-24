import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layers, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';
import { sevenLayerPersonalityEngine } from '@/services/seven-layer-personality-engine';

interface SyncTest {
  name: string;
  description: string;
  status: 'pending' | 'testing' | 'passed' | 'failed';
  details?: string;
  syncScore?: number;
}

const LayerSynchronizationTester: React.FC = () => {
  const [tests, setTests] = useState<SyncTest[]>([
    {
      name: 'Layer Cross-Reference Validation',
      description: 'Test synchronization between personality layers',
      status: 'pending'
    },
    {
      name: 'Trait Consistency Check',
      description: 'Validate trait consistency across all layers',
      status: 'pending'
    },
    {
      name: 'Dynamic Layer Activation',
      description: 'Test dynamic activation and deactivation of layers',
      status: 'pending'
    },
    {
      name: 'Layer Conflict Resolution',
      description: 'Test resolution of conflicts between layers',
      status: 'pending'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuth();
  const { blueprintData, hasBlueprint } = useBlueprintCache();

  const runSyncTests = async () => {
    if (!user) {
      console.log('❌ No authenticated user for layer synchronization testing');
      return;
    }

    if (!hasBlueprint || !blueprintData) {
      console.log('❌ No blueprint data available for synchronization testing');
      return;
    }

    setIsRunning(true);
    console.log('🔄 Starting layer synchronization tests');

    const updatedTests = [...tests];

    for (let i = 0; i < updatedTests.length; i++) {
      updatedTests[i].status = 'testing';
      setTests([...updatedTests]);

      try {
        let testResult = false;
        let details = '';
        let syncScore = 0;

        switch (updatedTests[i].name) {
          case 'Layer Cross-Reference Validation':
            const crossRefResult = await testLayerCrossReference();
            testResult = crossRefResult.success;
            details = crossRefResult.details;
            syncScore = crossRefResult.score;
            break;
          case 'Trait Consistency Check':
            const consistencyResult = await testTraitConsistency();
            testResult = consistencyResult.success;
            details = consistencyResult.details;
            syncScore = consistencyResult.score;
            break;
          case 'Dynamic Layer Activation':
            const activationResult = await testDynamicActivation();
            testResult = activationResult.success;
            details = activationResult.details;
            syncScore = activationResult.score;
            break;
          case 'Layer Conflict Resolution':
            const conflictResult = await testConflictResolution();
            testResult = conflictResult.success;
            details = conflictResult.details;
            syncScore = conflictResult.score;
            break;
        }

        updatedTests[i].status = testResult ? 'passed' : 'failed';
        updatedTests[i].details = details;
        updatedTests[i].syncScore = syncScore;

      } catch (error) {
        console.error(`❌ Sync test failed: ${updatedTests[i].name}`, error);
        updatedTests[i].status = 'failed';
        updatedTests[i].details = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }

      setTests([...updatedTests]);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
    console.log('✅ Layer synchronization tests completed');
  };

  const testLayerCrossReference = async () => {
    try {
      const layers = await sevenLayerPersonalityEngine.generatePersonalityLayers(
        blueprintData!,
        user!.id
      );

      const crossRefValidation = await sevenLayerPersonalityEngine.validateLayerCrossReferences(layers);
      
      return {
        success: crossRefValidation.isValid,
        details: crossRefValidation.message,
        score: crossRefValidation.score
      };
    } catch (error) {
      return {
        success: false,
        details: `Cross-reference validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        score: 0
      };
    }
  };

  const testTraitConsistency = async () => {
    try {
      const layers = await sevenLayerPersonalityEngine.generatePersonalityLayers(
        blueprintData!,
        user!.id
      );

      const consistencyCheck = await sevenLayerPersonalityEngine.validateTraitConsistency(layers);
      
      return {
        success: consistencyCheck.isConsistent,
        details: consistencyCheck.message,
        score: consistencyCheck.consistencyScore
      };
    } catch (error) {
      return {
        success: false,
        details: `Trait consistency test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        score: 0
      };
    }
  };

  const testDynamicActivation = async () => {
    try {
      const layers = await sevenLayerPersonalityEngine.generatePersonalityLayers(
        blueprintData!,
        user!.id
      );

      const activationTest = await sevenLayerPersonalityEngine.testDynamicLayerActivation(layers);
      
      return {
        success: activationTest.successful,
        details: activationTest.message,
        score: activationTest.activationScore
      };
    } catch (error) {
      return {
        success: false,
        details: `Dynamic activation test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        score: 0
      };
    }
  };

  const testConflictResolution = async () => {
    try {
      const layers = await sevenLayerPersonalityEngine.generatePersonalityLayers(
        blueprintData!,
        user!.id
      );

      const conflictTest = await sevenLayerPersonalityEngine.testConflictResolution(layers);
      
      return {
        success: conflictTest.resolved,
        details: conflictTest.message,
        score: conflictTest.resolutionScore
      };
    } catch (error) {
      return {
        success: false,
        details: `Conflict resolution test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        score: 0
      };
    }
  };

  const resetTests = () => {
    setTests(tests.map(test => ({ 
      ...test, 
      status: 'pending', 
      details: undefined, 
      syncScore: undefined 
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
  const averageScore = tests
    .filter(t => t.syncScore !== undefined)
    .reduce((sum, t) => sum + (t.syncScore || 0), 0) / tests.filter(t => t.syncScore !== undefined).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Layer Synchronization Testing
        </CardTitle>
        <div className="flex gap-4 text-sm">
          <span>Passed: <Badge className="bg-green-100 text-green-800">{passedTests}/{totalTests}</Badge></span>
          <span>Failed: <Badge className="bg-red-100 text-red-800">{failedTests}/{totalTests}</Badge></span>
          {averageScore > 0 && (
            <span>Sync Score: <Badge>{Math.round(averageScore)}%</Badge></span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runSyncTests} 
            disabled={isRunning || !user || !hasBlueprint}
            className="flex items-center gap-2"
          >
            {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
            {isRunning ? 'Testing Sync...' : 'Run Sync Tests'}
          </Button>
          <Button variant="outline" onClick={resetTests} disabled={isRunning}>
            Reset
          </Button>
        </div>

        {!hasBlueprint && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              No blueprint data available for layer synchronization testing. Please generate a blueprint first.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {tests.map((test, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(test.status)}
                  <span className="font-medium">{test.name}</span>
                  {test.syncScore !== undefined && (
                    <Badge variant="outline">{test.syncScore}%</Badge>
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

export default LayerSynchronizationTester;
