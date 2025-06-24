
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileCheck, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';
import { blueprintValidationService } from '@/services/blueprint-validation-service';

interface ValidationTest {
  name: string;
  description: string;
  status: 'pending' | 'testing' | 'passed' | 'failed';
  details?: string;
  validationScore?: number;
}

const BlueprintValidator: React.FC = () => {
  const [tests, setTests] = useState<ValidationTest[]>([
    {
      name: 'Blueprint Data Integrity',
      description: 'Validate blueprint data structure and completeness',
      status: 'pending'
    },
    {
      name: 'Astrological Calculations',
      description: 'Verify accuracy of astrological computations',
      status: 'pending'
    },
    {
      name: 'Human Design Validation',
      description: 'Validate Human Design calculations and mapping',
      status: 'pending'
    },
    {
      name: 'Personality Integration',
      description: 'Test integration between different personality systems',
      status: 'pending'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuth();
  const { blueprintData, hasBlueprint } = useBlueprintCache();

  const runValidationTests = async () => {
    if (!user) {
      console.log('❌ No authenticated user for blueprint validation');
      return;
    }

    if (!hasBlueprint || !blueprintData) {
      console.log('❌ No blueprint data available for validation');
      return;
    }

    setIsRunning(true);
    console.log('📋 Starting blueprint validation tests');

    const updatedTests = [...tests];

    for (let i = 0; i < updatedTests.length; i++) {
      updatedTests[i].status = 'testing';
      setTests([...updatedTests]);

      try {
        let testResult = false;
        let details = '';
        let validationScore = 0;

        switch (updatedTests[i].name) {
          case 'Blueprint Data Integrity':
            const integrityResult = await blueprintValidationService.validateBlueprintIntegrity(blueprintData);
            testResult = integrityResult.isValid;
            details = integrityResult.message;
            validationScore = integrityResult.score;
            break;
          case 'Astrological Calculations':
            const astroResult = await blueprintValidationService.validateAstrologicalData(blueprintData);
            testResult = astroResult.isValid;
            details = astroResult.message;
            validationScore = astroResult.score;
            break;
          case 'Human Design Validation':
            const hdResult = await blueprintValidationService.validateHumanDesignData(blueprintData);
            testResult = hdResult.isValid;
            details = hdResult.message;
            validationScore = hdResult.score;
            break;
          case 'Personality Integration':
            const integrationResult = await blueprintValidationService.validatePersonalityIntegration(blueprintData);
            testResult = integrationResult.isValid;
            details = integrationResult.message;
            validationScore = integrationResult.score;
            break;
        }

        updatedTests[i].status = testResult ? 'passed' : 'failed';
        updatedTests[i].details = details;
        updatedTests[i].validationScore = validationScore;

      } catch (error) {
        console.error(`❌ Validation test failed: ${updatedTests[i].name}`, error);
        updatedTests[i].status = 'failed';
        updatedTests[i].details = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }

      setTests([...updatedTests]);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
    console.log('✅ Blueprint validation tests completed');
  };

  const resetTests = () => {
    setTests(tests.map(test => ({ 
      ...test, 
      status: 'pending', 
      details: undefined, 
      validationScore: undefined 
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
    .filter(t => t.validationScore !== undefined)
    .reduce((sum, t) => sum + (t.validationScore || 0), 0) / tests.filter(t => t.validationScore !== undefined).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          Blueprint Validation
        </CardTitle>
        <div className="flex gap-4 text-sm">
          <span>Passed: <Badge className="bg-green-100 text-green-800">{passedTests}/{totalTests}</Badge></span>
          <span>Failed: <Badge className="bg-red-100 text-red-800">{failedTests}/{totalTests}</Badge></span>
          {averageScore > 0 && (
            <span>Avg Score: <Badge>{Math.round(averageScore)}%</Badge></span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runValidationTests} 
            disabled={isRunning || !user || !hasBlueprint}
            className="flex items-center gap-2"
          >
            {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
            {isRunning ? 'Validating...' : 'Run Validation'}
          </Button>
          <Button variant="outline" onClick={resetTests} disabled={isRunning}>
            Reset
          </Button>
        </div>

        {!hasBlueprint && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              No blueprint data available for validation. Please generate a blueprint first.
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
                  {test.validationScore !== undefined && (
                    <Badge variant="outline">{test.validationScore}%</Badge>
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

export default BlueprintValidator;
