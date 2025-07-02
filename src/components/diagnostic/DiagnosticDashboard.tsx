
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  BarChart3,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { automatedTestSuite, TestSuiteResult } from '@/services/automated-test-suite';

export const DiagnosticDashboard = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestSuiteResult[]>([]);
  const [report, setReport] = useState<string>('');

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    setReport('');

    try {
      console.log('🔍 Starting Phase 1-3 implementation diagnostics...');
      const suiteResults = await automatedTestSuite.runCompleteTestSuite();
      const diagnosticReport = automatedTestSuite.generateDiagnosticReport(suiteResults);
      
      setResults(suiteResults);
      setReport(diagnosticReport);
      console.log(diagnosticReport);
    } catch (error) {
      console.error('Diagnostic test suite failed:', error);
      setReport(`❌ Diagnostic test suite failed: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: 'passed' | 'failed' | 'skipped') => {
    switch (status) {
      case 'passed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'skipped': return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSuccessRate = (passed: number, total: number) => {
    return total > 0 ? Math.round((passed / total) * 100) : 0;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold gradient-text">
          Phase 1-3 Implementation Diagnostics
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive test suite to verify that all implementations use real, dynamic functionality 
          without hardcoded or simulated data.
        </p>
        
        <Button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          size="lg"
          className="bg-gradient-to-r from-soul-purple to-soul-teal hover:opacity-90"
        >
          {isRunning ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Running Diagnostics...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run Complete Diagnostic
            </>
          )}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-6">
          {/* Overall Summary */}
          <CosmicCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Overall Test Summary
              </h2>
              <Badge variant={results.every(r => r.failed === 0) ? "default" : "destructive"}>
                {results.every(r => r.failed === 0) ? "All Passed" : "Issues Found"}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {results.map((suite, index) => {
                const successRate = getSuccessRate(suite.passed, suite.totalTests);
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{suite.suiteName.split(':')[0]}</span>
                      <span className="text-sm text-muted-foreground">
                        {suite.passed}/{suite.totalTests}
                      </span>
                    </div>
                    <Progress value={successRate} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {successRate}% success rate
                    </div>
                  </div>
                );
              })}
            </div>
          </CosmicCard>

          {/* Detailed Results */}
          {results.map((suite, suiteIndex) => (
            <CosmicCard key={suiteIndex} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{suite.suiteName}</h3>
                <div className="flex space-x-2">
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    {suite.passed}
                  </Badge>
                  {suite.failed > 0 && (
                    <Badge variant="outline" className="text-red-600">
                      <XCircle className="mr-1 h-3 w-3" />
                      {suite.failed}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-muted-foreground">
                    {suite.duration}ms
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                {suite.results.map((test, testIndex) => (
                  <div 
                    key={testIndex} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      test.status === 'failed' ? 'bg-red-50 border-red-200' : 
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(test.status)}
                      <span className="font-medium">{test.testName}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {test.details && (
                        <Badge variant="outline" className="text-xs">
                          {JSON.stringify(test.details)}
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {test.duration}ms
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Show errors for failed tests */}
              {suite.results.some(r => r.status === 'failed') && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2 flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Failed Tests Details
                  </h4>
                  <div className="space-y-1">
                    {suite.results
                      .filter(r => r.status === 'failed')
                      .map((test, index) => (
                        <div key={index} className="text-sm text-red-700">
                          <strong>{test.testName}:</strong> {test.error}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CosmicCard>
          ))}

          {/* Report Output */}
          {report && (
            <CosmicCard className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Zap className="mr-2 h-5 w-5" />
                Diagnostic Report
              </h3>
              <pre className="text-sm bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto font-mono">
                {report}
              </pre>
            </CosmicCard>
          )}
        </div>
      )}
    </div>
  );
};
