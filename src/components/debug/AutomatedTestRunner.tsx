
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Activity,
  Zap,
  RefreshCw
} from 'lucide-react';
import { automatedTestSuite, TestSuiteResult, TestResult } from '@/services/automated-test-suite';
import { toast } from 'sonner';

export const AutomatedTestRunner: React.FC = () => {
  const [testResults, setTestResults] = useState<TestSuiteResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const runAutomatedTests = async () => {
    setIsRunning(true);
    setProgress(0);
    toast.info('Running automated test suite...');

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 200);

      const results = await automatedTestSuite.runFullTestSuite();
      
      clearInterval(progressInterval);
      setProgress(100);
      setTestResults(results);

      if (results.failed === 0) {
        toast.success(`All ${results.passed} tests passed! 🎉`);
      } else {
        toast.error(`${results.failed} tests failed out of ${results.totalTests}`);
      }
    } catch (error) {
      console.error('Test execution error:', error);
      toast.error('Failed to run automated tests');
    } finally {
      setIsRunning(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'skipped': return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      case 'skipped': return <Badge variant="outline">Skipped</Badge>;
    }
  };

  const getSuccessRate = () => {
    if (!testResults || testResults.totalTests === 0) return 0;
    return Math.round((testResults.passed / testResults.totalTests) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Test Runner Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Automated Test Suite Runner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={runAutomatedTests} 
                disabled={isRunning}
                className="flex-1"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
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

            {isRunning && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Test Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Results Overview */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Test Results Overview</span>
              <Badge variant={testResults.failed === 0 ? "default" : "destructive"}>
                {getSuccessRate()}% Success Rate
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{testResults.passed}</div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{testResults.failed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{testResults.skipped}</div>
                <div className="text-sm text-gray-600">Skipped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{testResults.duration}ms</div>
                <div className="text-sm text-gray-600">Duration</div>
              </div>
            </div>

            <Progress value={getSuccessRate()} className="w-full mb-4" />
            
            <div className="text-sm text-gray-600">
              Test Suite: {testResults.suiteName}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Test Results */}
      {testResults && testResults.results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Detailed Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testResults.results.map((result, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded border ${
                    result.status === 'passed' ? 'bg-green-50 border-green-200' :
                    result.status === 'failed' ? 'bg-red-50 border-red-200' :
                    'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.testName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(result.status)}
                      <span className="text-xs text-gray-500">{result.duration}ms</span>
                    </div>
                  </div>
                  
                  {result.error && (
                    <div className="text-sm text-red-600 mb-2">
                      Error: {result.error}
                    </div>
                  )}
                  
                  {result.details && (
                    <div className="text-xs text-gray-600">
                      Details: {JSON.stringify(result.details)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AutomatedTestRunner;
