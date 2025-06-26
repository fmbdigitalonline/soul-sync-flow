
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, Play, Database, Zap } from 'lucide-react';
import { growthProgramTestSuite } from '@/services/growth-program-test-suite';
import { streamingAuthTestSuite } from '@/services/streaming-auth-test-suite';
import { automatedTestSuite } from '@/services/automated-test-suite';
import type { GrowthProgramTestSuiteResult, GrowthProgramTestResult } from '@/services/growth-program-test-suite';
import type { StreamingTestSuiteResult } from '@/services/streaming-auth-test-suite';
import type { TestSuiteResult } from '@/services/automated-test-suite';

export const GrowthProgramTestRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<{
    growthProgram?: GrowthProgramTestSuiteResult;
    streaming?: StreamingTestSuiteResult;
    memory?: TestSuiteResult;
  }>({});

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults({});

    try {
      console.log('🧪 Starting comprehensive test suite...');

      // Run tests in parallel for faster execution
      const [growthResults, streamingResults, memoryResults] = await Promise.all([
        growthProgramTestSuite.runFullTestSuite(),
        streamingAuthTestSuite.runFullTestSuite(),
        automatedTestSuite.runMemoryPersistenceTests().then(results => ({
          suiteName: 'Memory System Tests',
          totalTests: results.length,
          passed: results.filter(r => r.status === 'passed').length,
          failed: results.filter(r => r.status === 'failed').length,
          skipped: results.filter(r => r.status === 'skipped').length,
          duration: results.reduce((sum, r) => sum + r.duration, 0),
          results
        }))
      ]);

      setTestResults({
        growthProgram: growthResults,
        streaming: streamingResults,
        memory: memoryResults
      });

      console.log('✅ All test suites completed');
    } catch (error) {
      console.error('❌ Test execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getOverallStatus = () => {
    const { growthProgram, streaming, memory } = testResults;
    if (!growthProgram && !streaming && !memory) return 'pending';
    
    const allSuites = [growthProgram, streaming, memory].filter(Boolean);
    const failedSuites = allSuites.filter(suite => 
      'integrationStatus' in suite ? suite.integrationStatus === 'failed' : suite.failed > 0
    );
    
    if (failedSuites.length === 0) return 'healthy';
    if (failedSuites.length < allSuites.length) return 'degraded';
    return 'failed';
  };

  const getTotalStats = () => {
    const { growthProgram, streaming, memory } = testResults;
    const suites = [growthProgram, streaming, memory].filter(Boolean);
    
    return suites.reduce((acc, suite) => ({
      total: acc.total + suite.totalTests,
      passed: acc.passed + suite.passed,
      failed: acc.failed + suite.failed
    }), { total: 0, passed: 0, failed: 0 });
  };

  const renderTestResult = (result: GrowthProgramTestResult, index: number) => (
    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        {result.status === 'passed' ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : result.status === 'failed' ? (
          <XCircle className="h-5 w-5 text-red-600" />
        ) : (
          <Clock className="h-5 w-5 text-yellow-600" />
        )}
        
        <div>
          <h4 className="font-medium">{result.testName}</h4>
          {result.error && (
            <p className="text-sm text-red-600">{result.error}</p>
          )}
          {result.dataValidation && (
            <div className="flex items-center gap-2 mt-1">
              <Database className="h-3 w-3 text-blue-600" />
              <span className="text-xs text-blue-600">
                {result.dataValidation.isLiveData ? 'Live Data' : 'Mock Data'} • {result.dataValidation.dataSource}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-right">
        <Badge variant={result.status === 'passed' ? 'default' : 'destructive'}>
          {result.status}
        </Badge>
        <p className="text-xs text-muted-foreground mt-1">{result.duration}ms</p>
      </div>
    </div>
  );

  const overallStatus = getOverallStatus();
  const stats = getTotalStats();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-soul-purple" />
              Growth Program Test Suite
            </CardTitle>
            <p className="text-muted-foreground">
              Comprehensive end-to-end testing with live data
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {stats.total > 0 && (
              <div className="text-right">
                <div className="text-sm font-medium">
                  {stats.passed}/{stats.total} Passed
                </div>
                <Badge 
                  variant={overallStatus === 'healthy' ? 'default' : 'destructive'}
                  className="mt-1"
                >
                  {overallStatus}
                </Badge>
              </div>
            )}
            
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className="bg-soul-purple hover:bg-soul-purple/90"
            >
              {isRunning ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Full Test Suite
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isRunning && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 animate-spin" />
              <span className="text-sm">Running comprehensive tests...</span>
            </div>
            <Progress value={33} className="h-2" />
          </div>
        )}

        {Object.keys(testResults).length > 0 && (
          <div className="space-y-6">
            {/* Growth Program Tests */}
            {testResults.growthProgram && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Growth Program Tests ({testResults.growthProgram.passed}/{testResults.growthProgram.totalTests} passed)
                </h3>
                <div className="space-y-2">
                  {testResults.growthProgram.results.map((result, idx) => 
                    renderTestResult(result, idx)
                  )}
                </div>
              </div>
            )}

            {/* Streaming Tests */}
            {testResults.streaming && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Streaming & Auth Tests ({testResults.streaming.passed}/{testResults.streaming.totalTests} passed)
                </h3>
                <div className="space-y-2">
                  {testResults.streaming.results.map((result, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {result.status === 'passed' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <h4 className="font-medium">{result.testName}</h4>
                          {result.error && <p className="text-sm text-red-600">{result.error}</p>}
                        </div>
                      </div>
                      <Badge variant={result.status === 'passed' ? 'default' : 'destructive'}>
                        {result.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Memory Tests */}
            {testResults.memory && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Memory System Tests ({testResults.memory.passed}/{testResults.memory.totalTests} passed)
                </h3>
                <div className="space-y-2">
                  {testResults.memory.results.map((result, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {result.status === 'passed' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <h4 className="font-medium">{result.testName}</h4>
                          {result.error && <p className="text-sm text-red-600">{result.error}</p>}
                        </div>
                      </div>
                      <Badge variant={result.status === 'passed' ? 'default' : 'destructive'}>
                        {result.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!isRunning && Object.keys(testResults).length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Click "Run Full Test Suite" to start comprehensive testing</p>
            <p className="text-sm mt-2">Tests use live data and real system interactions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
