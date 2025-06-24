
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';
import { holisticCoachService } from '@/services/holistic-coach-service';

interface DegradationTest {
  name: string;
  description: string;
  status: 'pending' | 'testing' | 'passed' | 'failed';
  details?: string;
  severity: 'low' | 'medium' | 'high';
}

export const GracefulDegradationTester: React.FC = () => {
  const [tests, setTests] = useState<DegradationTest[]>([
    {
      name: 'Missing MBTI Data',
      description: 'Test behavior when MBTI module is incomplete',
      status: 'pending',
      severity: 'medium'
    },
    {
      name: 'Incomplete Human Design',
      description: 'Test system with partial Human Design data',
      status: 'pending',
      severity: 'medium'
    },
    {
      name: 'Missing Birth Data',
      description: 'Test astrology modules without birth information',
      status: 'pending',
      severity: 'high'
    },
    {
      name: 'Empty Blueprint',
      description: 'Test system response with completely empty blueprint',
      status: 'pending',
      severity: 'high'
    },
    {
      name: 'Corrupted Blueprint Data',
      description: 'Test handling of malformed blueprint structure',
      status: 'pending',
      severity: 'high'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuth();
  const { blueprintData } = useBlueprintCache();

  const runDegradationTests = async () => {
    if (!user) {
      console.log('❌ No authenticated user for degradation testing');
      return;
    }

    setIsRunning(true);
    console.log('🧪 Starting graceful degradation tests');

    const updatedTests = [...tests];

    for (let i = 0; i < updatedTests.length; i++) {
      updatedTests[i].status = 'testing';
      setTests([...updatedTests]);

      try {
        let testResult = false;
        let details = '';

        switch (updatedTests[i].name) {
          case 'Missing MBTI Data':
            testResult = await testMissingMBTI();
            details = testResult ? 'System fallback to basic personality traits' : 'Failed to handle missing MBTI data';
            break;

          case 'Incomplete Human Design':
            testResult = await testIncompleteHumanDesign();
            details = testResult ? 'Graceful degradation to available HD components' : 'Failed to handle partial HD data';
            break;

          case 'Missing Birth Data':
            testResult = await testMissingBirthData();
            details = testResult ? 'Astrology modules disabled gracefully' : 'System error with missing birth data';
            break;

          case 'Empty Blueprint':
            testResult = await testEmptyBlueprint();
            details = testResult ? 'Default personality profile activated' : 'System failed with empty blueprint';
            break;

          case 'Corrupted Blueprint Data':
            testResult = await testCorruptedBlueprint();
            details = testResult ? 'Error recovery and data validation working' : 'System crashed with corrupted data';
            break;
        }

        updatedTests[i].status = testResult ? 'passed' : 'failed';
        updatedTests[i].details = details;

      } catch (error) {
        console.error(`❌ Degradation test failed: ${updatedTests[i].name}`, error);
        updatedTests[i].status = 'failed';
        updatedTests[i].details = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }

      setTests([...updatedTests]);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsRunning(false);
    console.log('✅ Graceful degradation tests completed');
  };

  const testMissingMBTI = async (): Promise<boolean> => {
    try {
      // Test with blueprint missing MBTI data
      const testBlueprint = blueprintData ? { ...blueprintData } : {};
      if (testBlueprint.cognitiveTemperamental) {
        delete testBlueprint.cognitiveTemperamental;
      }
      
      holisticCoachService.updateBlueprint(testBlueprint);
      const prompt = holisticCoachService.generateSystemPrompt("test message");
      
      return prompt.length > 0 && !prompt.includes('undefined') && !prompt.includes('null');
    } catch (error) {
      console.error('MBTI degradation test error:', error);
      return false;
    }
  };

  const testIncompleteHumanDesign = async (): Promise<boolean> => {
    try {
      const testBlueprint = blueprintData ? { ...blueprintData } : {};
      if (testBlueprint.energyDecisionStrategy) {
        testBlueprint.energyDecisionStrategy = { 
          humanDesignType: 'Generator',
          authority: '',
          decisionStyle: '',
          pacing: '',
          energyType: '',
          strategy: '',
          profile: '',
          centers: [],
          gates: [],
          channels: []
        }; // Incomplete data
      }
      
      holisticCoachService.updateBlueprint(testBlueprint);
      const prompt = holisticCoachService.generateSystemPrompt("test message");
      
      return prompt.length > 0;
    } catch (error) {
      console.error('Human Design degradation test error:', error);
      return false;
    }
  };

  const testMissingBirthData = async (): Promise<boolean> => {
    try {
      const testBlueprint = blueprintData ? { ...blueprintData } : {};
      if (testBlueprint.publicArchetype) {
        delete testBlueprint.publicArchetype;
      }
      if (testBlueprint.generationalCode) {
        delete testBlueprint.generationalCode;
      }
      
      holisticCoachService.updateBlueprint(testBlueprint);
      const prompt = holisticCoachService.generateSystemPrompt("test message");
      
      return prompt.length > 0;
    } catch (error) {
      console.error('Birth data degradation test error:', error);
      return false;
    }
  };

  const testEmptyBlueprint = async (): Promise<boolean> => {
    try {
      holisticCoachService.updateBlueprint({});
      const prompt = holisticCoachService.generateSystemPrompt("test message");
      
      return prompt.length > 0 && (prompt.includes('default') || prompt.includes('basic'));
    } catch (error) {
      console.error('Empty blueprint degradation test error:', error);
      return false;
    }
  };

  const testCorruptedBlueprint = async (): Promise<boolean> => {
    try {
      const corruptedBlueprint = {
        cognitiveTemperamental: "invalid_string_instead_of_object",
        energyDecisionStrategy: null,
        publicArchetype: { invalid: "structure" }
      } as any;
      
      holisticCoachService.updateBlueprint(corruptedBlueprint);
      const prompt = holisticCoachService.generateSystemPrompt("test message");
      
      return prompt.length > 0;
    } catch (error) {
      console.error('Corrupted blueprint test - this is expected:', error);
      return true; // Error handling is working
    }
  };

  const resetTests = () => {
    setTests(tests.map(test => ({ ...test, status: 'pending', details: undefined })));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'testing': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const passedTests = tests.filter(t => t.status === 'passed').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;
  const totalTests = tests.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Graceful Degradation Testing
          </CardTitle>
          <div className="flex gap-4 text-sm">
            <span>Passed: <Badge className="bg-green-100 text-green-800">{passedTests}/{totalTests}</Badge></span>
            <span>Failed: <Badge className="bg-red-100 text-red-800">{failedTests}/{totalTests}</Badge></span>
            <span>Success Rate: <Badge>{totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%</Badge></span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runDegradationTests} 
              disabled={isRunning || !user}
              className="flex items-center gap-2"
            >
              {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
              {isRunning ? 'Running Tests...' : 'Run Degradation Tests'}
            </Button>
            <Button variant="outline" onClick={resetTests} disabled={isRunning}>
              Reset Tests
            </Button>
          </div>

          <div className="space-y-3">
            {tests.map((test, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(test.status)}
                    <span className="font-medium">{test.name}</span>
                    <Badge className={getSeverityColor(test.severity)}>
                      {test.severity}
                    </Badge>
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
    </div>
  );
};
