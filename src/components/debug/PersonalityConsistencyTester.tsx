import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';
import { personalityEngine } from '@/services/personality-engine';
import { enhancedMemoryService } from '@/services/enhanced-memory-service';

interface ConsistencyTest {
  name: string;
  description: string;
  status: 'pending' | 'testing' | 'passed' | 'failed';
  details?: string;
  consistencyScore?: number;
}

const PersonalityConsistencyTester: React.FC = () => {
  const [tests, setTests] = useState<ConsistencyTest[]>([
    {
      name: 'Cross-Session Personality Consistency',
      description: 'Test personality consistency across different sessions',
      status: 'pending'
    },
    {
      name: 'Memory-Personality Alignment',
      description: 'Validate alignment between memory and personality systems',
      status: 'pending'
    },
    {
      name: 'Adaptive Personality Stability',
      description: 'Test stability of personality during adaptive changes',
      status: 'pending'
    },
    {
      name: 'Blueprint-Personality Coherence',
      description: 'Validate coherence between blueprint and personality traits',
      status: 'pending'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuth();
  const { blueprintData, hasBlueprint } = useBlueprintCache();

  const runConsistencyTests = async () => {
    if (!user) {
      console.log('❌ No authenticated user for personality consistency testing');
      return;
    }

    setIsRunning(true);
    console.log('👤 Starting personality consistency tests');

    const updatedTests = [...tests];

    for (let i = 0; i < updatedTests.length; i++) {
      updatedTests[i].status = 'testing';
      setTests([...updatedTests]);

      try {
        let testResult = false;
        let details = '';
        let consistencyScore = 0;

        switch (updatedTests[i].name) {
          case 'Cross-Session Personality Consistency':
            const sessionResult = await testCrossSessionConsistency();
            testResult = sessionResult.success;
            details = sessionResult.details;
            consistencyScore = sessionResult.score;
            break;
          case 'Memory-Personality Alignment':
            const alignmentResult = await testMemoryPersonalityAlignment();
            testResult = alignmentResult.success;
            details = alignmentResult.details;
            consistencyScore = alignmentResult.score;
            break;
          case 'Adaptive Personality Stability':
            const stabilityResult = await testAdaptiveStability();
            testResult = stabilityResult.success;
            details = stabilityResult.details;
            consistencyScore = stabilityResult.score;
            break;
          case 'Blueprint-Personality Coherence':
            const coherenceResult = await testBlueprintCoherence();
            testResult = coherenceResult.success;
            details = coherenceResult.details;
            consistencyScore = coherenceResult.score;
            break;
        }

        updatedTests[i].status = testResult ? 'passed' : 'failed';
        updatedTests[i].details = details;
        updatedTests[i].consistencyScore = consistencyScore;

      } catch (error) {
        console.error(`❌ Consistency test failed: ${updatedTests[i].name}`, error);
        updatedTests[i].status = 'failed';
        updatedTests[i].details = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }

      setTests([...updatedTests]);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
    console.log('✅ Personality consistency tests completed');
  };

  const testCrossSessionConsistency = async () => {
    try {
      const consistencyReport = await personalityEngine.generateConsistencyReport(user!.id);
      
      return {
        success: consistencyReport.consistencyScore >= 80,
        details: consistencyReport.summary,
        score: consistencyReport.consistencyScore
      };
    } catch (error) {
      return {
        success: false,
        details: `Cross-session consistency test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        score: 0
      };
    }
  };

  const testMemoryPersonalityAlignment = async () => {
    try {
      const memoryReport = await enhancedMemoryService.generateConsistencyReport();
      const personalityReport = await personalityEngine.generateConsistencyReport(user!.id);
      
      const alignmentScore = Math.min(memoryReport.consistencyScore, personalityReport.consistencyScore);
      
      return {
        success: alignmentScore >= 75,
        details: `Memory-Personality alignment score: ${alignmentScore}%`,
        score: alignmentScore
      };
    } catch (error) {
      return {
        success: false,
        details: `Memory-personality alignment test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        score: 0
      };
    }
  };

  const testAdaptiveStability = async () => {
    try {
      if (!blueprintData) {
        return {
          success: false,
          details: 'No blueprint data available for adaptive stability testing',
          score: 0
        };
      }

      const stabilityTest = await personalityEngine.testAdaptiveStability(blueprintData, user!.id);
      
      return {
        success: stabilityTest.isStable,
        details: stabilityTest.message,
        score: stabilityTest.stabilityScore
      };
    } catch (error) {
      return {
        success: false,
        details: `Adaptive stability test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        score: 0
      };
    }
  };

  const testBlueprintCoherence = async () => {
    try {
      if (!hasBlueprint || !blueprintData) {
        return {
          success: false,
          details: 'No blueprint data available for coherence testing',
          score: 0
        };
      }

      const coherenceTest = await personalityEngine.validateBlueprintCoherence(blueprintData, user!.id);
      
      return {
        success: coherenceTest.isCoherent,
        details: coherenceTest.message,
        score: coherenceTest.coherenceScore
      };
    } catch (error) {
      return {
        success: false,
        details: `Blueprint coherence test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        score: 0
      };
    }
  };

  const resetTests = () => {
    setTests(tests.map(test => ({ 
      ...test, 
      status: 'pending', 
      details: undefined, 
      consistencyScore: undefined 
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
    .filter(t => t.consistencyScore !== undefined)
    .reduce((sum, t) => sum + (t.consistencyScore || 0), 0) / tests.filter(t => t.consistencyScore !== undefined).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Personality Consistency Testing
        </CardTitle>
        <div className="flex gap-4 text-sm">
          <span>Passed: <Badge className="bg-green-100 text-green-800">{passedTests}/{totalTests}</Badge></span>
          <span>Failed: <Badge className="bg-red-100 text-red-800">{failedTests}/{totalTests}</Badge></span>
          {averageScore > 0 && (
            <span>Consistency: <Badge>{Math.round(averageScore)}%</Badge></span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runConsistencyTests} 
            disabled={isRunning || !user}
            className="flex items-center gap-2"
          >
            {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
            {isRunning ? 'Testing Consistency...' : 'Run Consistency Tests'}
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
                  {test.consistencyScore !== undefined && (
                    <Badge variant="outline">{test.consistencyScore}%</Badge>
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

export default PersonalityConsistencyTester;
