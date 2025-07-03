
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  BarChart3,
  AlertTriangle,
  Zap,
  TestTube,
  Activity,
  Shield,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { automatedTestSuite, TestSuiteResult } from '@/services/automated-test-suite';
import { enhancedAutomatedTestSuite, TestSuiteResult as EnhancedTestSuiteResult, EnhancedTestResult } from '@/services/enhanced-automated-test-suite';
import { streamingAuthTestSuite, StreamingTestSuiteResult } from '@/services/streaming-auth-test-suite';

export const DiagnosticDashboard = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestSuiteResult[]>([]);
  const [enhancedResults, setEnhancedResults] = useState<EnhancedTestSuiteResult[]>([]);
  const [streamingResults, setStreamingResults] = useState<StreamingTestSuiteResult | null>(null);
  const [report, setReport] = useState<string>('');
  const [enhancedReport, setEnhancedReport] = useState<string>('');
  const [activeTest, setActiveTest] = useState<string>('');

  const runPhaseImplementationDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    setReport('');
    setActiveTest('Phase Implementation Diagnostics');

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
      setActiveTest('');
    }
  };

  const runEnhancedDiagnostics = async () => {
    setIsRunning(true);
    setEnhancedResults([]);
    setEnhancedReport('');
    setActiveTest('Enhanced Authentication-Aware Diagnostics');

    try {
      console.log('🔍 Starting Enhanced Phase 1-3 diagnostics with authentication...');
      const suiteResults = await enhancedAutomatedTestSuite.runCompleteTestSuite();
      const diagnosticReport = enhancedAutomatedTestSuite.generateDiagnosticReport(suiteResults);
      
      setEnhancedResults(suiteResults);
      setEnhancedReport(diagnosticReport);
      console.log(diagnosticReport);
    } catch (error) {
      console.error('Enhanced diagnostic test suite failed:', error);
      setEnhancedReport(`❌ Enhanced diagnostic test suite failed: ${error}`);
    } finally {
      setIsRunning(false);
      setActiveTest('');
    }
  };

  const runStreamingAuthDiagnostics = async () => {
    setIsRunning(true);
    setStreamingResults(null);
    setActiveTest('Streaming Authentication Diagnostics');

    try {
      console.log('🧪 Starting streaming authentication diagnostics...');
      const result = await streamingAuthTestSuite.runFullTestSuite();
      setStreamingResults(result);
      console.log('Streaming auth diagnostics completed:', result);
    } catch (error) {
      console.error('Streaming auth test suite failed:', error);
    } finally {
      setIsRunning(false);
      setActiveTest('');
    }
  };

  const runAllDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    setEnhancedResults([]);
    setStreamingResults(null);
    setReport('');
    setEnhancedReport('');
    setActiveTest('All Diagnostics');

    try {
      console.log('🚀 Starting comprehensive diagnostic suite...');
      
      // Run enhanced tests first
      const enhancedSuiteResults = await enhancedAutomatedTestSuite.runCompleteTestSuite();
      const enhancedDiagnosticReport = enhancedAutomatedTestSuite.generateDiagnosticReport(enhancedSuiteResults);
      setEnhancedResults(enhancedSuiteResults);
      setEnhancedReport(enhancedDiagnosticReport);
      
      // Run original tests for comparison
      const suiteResults = await automatedTestSuite.runCompleteTestSuite();
      const diagnosticReport = automatedTestSuite.generateDiagnosticReport(suiteResults);
      setResults(suiteResults);
      setReport(diagnosticReport);
      
      // Run streaming auth tests
      const streamingResult = await streamingAuthTestSuite.runFullTestSuite();
      setStreamingResults(streamingResult);
      
      console.log('All diagnostics completed successfully');
    } catch (error) {
      console.error('Comprehensive diagnostic suite failed:', error);
      setEnhancedReport(`❌ Comprehensive diagnostic suite failed: ${error}`);
    } finally {
      setIsRunning(false);
      setActiveTest('');
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

  const getAuthStatusBadge = (status: 'healthy' | 'degraded' | 'failed') => {
    const colors = {
      healthy: 'bg-green-100 text-green-800',
      degraded: 'bg-yellow-100 text-yellow-800', 
      failed: 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={colors[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold gradient-text">
          SoulSync Implementation Diagnostics
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive test suite to verify real-time functionality across all system phases with enhanced authentication support
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <Button 
            onClick={runEnhancedDiagnostics} 
            disabled={isRunning}
            size="lg"
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90"
          >
            {isRunning && activeTest === 'Enhanced Authentication-Aware Diagnostics' ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Running Enhanced Tests...
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Enhanced Diagnostics (Recommended)
              </>
            )}
          </Button>

          <Button 
            onClick={runPhaseImplementationDiagnostics} 
            disabled={isRunning}
            variant="outline"
            className="bg-gradient-to-r from-soul-purple to-soul-teal hover:opacity-90"
          >
            {isRunning && activeTest === 'Phase Implementation Diagnostics' ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Running Legacy Tests...
              </>
            ) : (
              <>
                <TestTube className="mr-2 h-4 w-4" />
                Legacy Phase Tests
              </>
            )}
          </Button>

          <Button 
            onClick={runStreamingAuthDiagnostics} 
            disabled={isRunning}
            variant="outline"
          >
            {isRunning && activeTest === 'Streaming Authentication Diagnostics' ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Running Auth Tests...
              </>
            ) : (
              <>
                <Activity className="mr-2 h-4 w-4" />
                Streaming Auth Tests
              </>
            )}
          </Button>

          <Button 
            onClick={runAllDiagnostics} 
            disabled={isRunning}
            size="lg"
            className="bg-gradient-to-r from-soul-purple to-soul-teal hover:opacity-90"
          >
            {isRunning && activeTest === 'All Diagnostics' ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Running All Diagnostics...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Complete Suite
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="enhanced" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="enhanced">Enhanced Results</TabsTrigger>
          <TabsTrigger value="results">Legacy Results</TabsTrigger>
          <TabsTrigger value="streaming">Auth & Streaming</TabsTrigger>
          <TabsTrigger value="report">Diagnostic Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="enhanced" className="space-y-6">
          {enhancedResults.length > 0 && (
            <>
              {/* Enhanced Overall Summary */}
              <CosmicCard className="p-6 border-2 border-emerald-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <ShieldCheck className="mr-2 h-5 w-5 text-emerald-600" />
                    Enhanced Phase Implementation Summary
                  </h2>
                  <Badge variant={enhancedResults.every(r => r.failed === 0 && r.skipped < r.totalTests/2) ? "default" : "destructive"}>
                    {enhancedResults.every(r => r.failed === 0 && r.skipped < r.totalTests/2) ? "Enhanced Success" : "Issues Detected"}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {enhancedResults.map((suite, index) => {
                    const successRate = getSuccessRate(suite.passed, suite.totalTests);
                    const isAuthenticated = suite.suiteName.includes('authenticated');
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium flex items-center">
                            {isAuthenticated ? <Shield className="mr-1 h-3 w-3 text-emerald-500" /> : null}
                            {suite.suiteName.split(':')[0]}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {suite.passed}/{suite.totalTests}
                            {suite.skipped > 0 && <span className="text-yellow-600"> ({suite.skipped} skipped)</span>}
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

              {/* Enhanced Detailed Results */}
              {enhancedResults.map((suite, suiteIndex) => (
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
                      {suite.skipped > 0 && (
                        <Badge variant="outline" className="text-yellow-600">
                          <Clock className="mr-1 h-3 w-3" />
                          {suite.skipped}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-muted-foreground">
                        {suite.duration}ms
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {suite.results.map((test: EnhancedTestResult, testIndex) => (
                      <div 
                        key={testIndex} 
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          test.status === 'failed' ? 'bg-red-50 border-red-200' : 
                          test.status === 'skipped' ? 'bg-yellow-50 border-yellow-200' :
                          'bg-green-50 border-green-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(test.status)}
                          <span className="font-medium">{test.testName}</span>
                          {test.authenticationStatus && (
                            <Badge variant="outline" className="text-xs">
                              {test.authenticationStatus}
                            </Badge>
                          )}
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

                        {test.error && (
                          <div className="mt-2 text-sm text-red-600">
                            {test.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CosmicCard>
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {results.length > 0 && (
            <>
              {/* Overall Summary */}
              <CosmicCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Legacy Phase Implementation Summary
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
            </>
          )}
        </TabsContent>

        <TabsContent value="streaming" className="space-y-6">
          {streamingResults && (
            <CosmicCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Streaming Authentication Status
                </h2>
                {getAuthStatusBadge(streamingResults.overallAuthStatus)}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{streamingResults.passed}</div>
                  <div className="text-sm text-muted-foreground">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{streamingResults.failed}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{streamingResults.skipped}</div>
                  <div className="text-sm text-muted-foreground">Skipped</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{streamingResults.duration}ms</div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                </div>
              </div>

              <div className="space-y-2">
                {streamingResults.results.map((test, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      test.status === 'failed' ? 'bg-red-50 border-red-200' : 
                      test.status === 'skipped' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(test.status)}
                      <span className="font-medium">{test.testName}</span>
                      {test.authenticationStatus && (
                        <Badge variant="outline" className="text-xs">
                          {test.authenticationStatus}
                        </Badge>
                      )}
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

                    {test.error && (
                      <div className="mt-2 text-sm text-red-600">
                        {test.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CosmicCard>
          )}
        </TabsContent>

        <TabsContent value="report">
          <div className="space-y-6">
            {enhancedReport && (
              <CosmicCard className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <ShieldCheck className="mr-2 h-5 w-5 text-emerald-600" />
                  Enhanced Comprehensive Diagnostic Report
                </h3>
                <pre className="text-sm bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto font-mono">
                  {enhancedReport}
                </pre>
              </CosmicCard>
            )}
            
            {report && (
              <CosmicCard className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Zap className="mr-2 h-5 w-5" />
                  Legacy Diagnostic Report
                </h3>
                <pre className="text-sm bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto font-mono">
                  {report}
                </pre>
              </CosmicCard>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
