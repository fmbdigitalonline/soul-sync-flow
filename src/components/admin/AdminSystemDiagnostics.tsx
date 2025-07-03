import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PlayCircle, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Zap,
  Database,
  Settings,
  Activity,
  Shield,
  ShieldCheck,
  TestTube,
  BarChart3
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { streamingAuthTestSuite, StreamingTestSuiteResult } from '@/services/streaming-auth-test-suite';
import { vfpGraphPatentTestSuite, PatentValidationReport } from '@/services/vfp-graph-patent-test-suite';
import { growthProgramTestSuite, GrowthProgramTestSuiteResult } from '@/services/growth-program-test-suite';
import { automatedTestSuite, TestSuiteResult } from '@/services/automated-test-suite';
import { enhancedAutomatedTestSuite, TestSuiteResult as EnhancedTestSuiteResult, EnhancedTestResult } from '@/services/enhanced-automated-test-suite';
import { useToast } from '@/hooks/use-toast';

interface DiagnosticTest {
  id: string;
  name: string;
  description: string;
  category: 'authentication' | 'vfp' | 'growth' | 'system' | 'phase-implementation';
  icon: React.ComponentType<any>;
  runner: () => Promise<any>;
}

interface AggregatedTestResults {
  total: number;
  passed: number;
  failed: number;
  duration: number;
  suiteCount?: number;
}

export const AdminSystemDiagnostics: React.FC = () => {
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [phaseResults, setPhaseResults] = useState<TestSuiteResult[]>([]);
  const [enhancedPhaseResults, setEnhancedPhaseResults] = useState<EnhancedTestSuiteResult[]>([]);
  const [phaseReport, setPhaseReport] = useState<string>('');
  const [enhancedPhaseReport, setEnhancedPhaseReport] = useState<string>('');
  const [executionLogs, setExecutionLogs] = useState<Record<string, string[]>>({});
  const { toast } = useToast();

  const addExecutionLog = (testId: string, message: string) => {
    setExecutionLogs(prev => ({
      ...prev,
      [testId]: [...(prev[testId] || []), `${new Date().toLocaleTimeString()}: ${message}`]
    }));
  };

  const diagnosticTests: DiagnosticTest[] = [
    {
      id: 'streaming-auth',
      name: 'Streaming Authentication Suite',
      description: 'Tests streaming endpoints, auth flow, and real-time functionality',
      category: 'authentication',
      icon: Activity,
      runner: async () => await streamingAuthTestSuite.runFullTestSuite()
    },
    {
      id: 'vfp-patent',
      name: 'VFP-Graph Patent Validation',
      description: 'Validates all patent claims with real-time data and system integration',
      category: 'vfp',
      icon: Zap,
      runner: async () => await vfpGraphPatentTestSuite.runPatentValidationSuite()
    },
    {
      id: 'growth-program',
      name: 'Growth Program Integration',
      description: 'End-to-end testing of growth program functionality and data flow',
      category: 'growth',
      icon: Database,
      runner: async () => await growthProgramTestSuite.runFullTestSuite()
    },
    {
      id: 'phase-implementation-legacy',
      name: 'Phase Implementation (Legacy)',
      description: 'Original phase 1-3 implementation diagnostics',
      category: 'phase-implementation',
      icon: TestTube,
      runner: async () => await automatedTestSuite.runCompleteTestSuite()
    },
    {
      id: 'phase-implementation-enhanced',
      name: 'Phase Implementation (Enhanced)',
      description: 'Enhanced phase 1-3 diagnostics with authentication awareness',
      category: 'phase-implementation',
      icon: ShieldCheck,
      runner: async () => await enhancedAutomatedTestSuite.runCompleteTestSuite()
    }
  ];

  const runSingleTest = async (test: DiagnosticTest) => {
    console.log(`🧪 Starting diagnostic test: ${test.name}`);
    addExecutionLog(test.id, `Starting ${test.name}`);
    
    setRunningTests(prev => new Set([...prev, test.id]));
    
    try {
      addExecutionLog(test.id, 'Executing test runner...');
      const result = await test.runner();
      
      addExecutionLog(test.id, `Test completed. Processing results...`);
      
      // Handle different result formats with proper aggregation
      if (test.category === 'phase-implementation') {
        if (test.id === 'phase-implementation-legacy') {
          const suiteResults = Array.isArray(result) ? result : [result];
          setPhaseResults(suiteResults);
          setPhaseReport(automatedTestSuite.generateDiagnosticReport(suiteResults));
          addExecutionLog(test.id, `Legacy results: ${suiteResults.length} test suites processed`);
        } else if (test.id === 'phase-implementation-enhanced') {
          const suiteResults = Array.isArray(result) ? result : [result];
          setEnhancedPhaseResults(suiteResults);
          setEnhancedPhaseReport(enhancedAutomatedTestSuite.generateDiagnosticReport(suiteResults));
          addExecutionLog(test.id, `Enhanced results: ${suiteResults.length} test suites processed`);
        }
      }
      
      setTestResults(prev => ({
        ...prev,
        [test.id]: {
          rawResult: result,
          status: 'completed',
          timestamp: new Date().toISOString(),
          aggregated: test.category === 'phase-implementation' ? aggregatePhaseResults(result) : result
        }
      }));

      addExecutionLog(test.id, 'Results processed and stored successfully');

      toast({
        title: "Test Completed",
        description: `${test.name} finished successfully`,
      });

      console.log(`✅ Test completed: ${test.name}`, result);
    } catch (error) {
      console.error(`❌ Test failed: ${test.name}`, error);
      addExecutionLog(test.id, `Error: ${error.message}`);
      
      setTestResults(prev => ({
        ...prev,
        [test.id]: {
          status: 'failed',
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }));

      toast({
        title: "Test Failed",
        description: `${test.name} encountered an error: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(test.id);
        return newSet;
      });
    }
  };

  const aggregatePhaseResults = (result: any): AggregatedTestResults => {
    if (!result) {
      return { total: 0, passed: 0, failed: 0, duration: 0 };
    }

    // Handle array of TestSuiteResult
    if (Array.isArray(result)) {
      const totals = result.reduce((acc, suite) => ({
        total: acc.total + (suite.totalTests || 0),
        passed: acc.passed + (suite.passed || 0),
        failed: acc.failed + (suite.failed || 0),
        duration: acc.duration + (suite.duration || 0)
      }), { total: 0, passed: 0, failed: 0, duration: 0 });

      return {
        ...totals,
        suiteCount: result.length
      };
    }

    // Handle single TestSuiteResult
    if (result.totalTests !== undefined) {
      return {
        total: result.totalTests || 0,
        passed: result.passed || 0,
        failed: result.failed || 0,
        duration: result.duration || 0,
        suiteCount: 1
      };
    }

    // Fallback for other formats
    return {
      total: result.length || 0,
      passed: result.filter?.((r: any) => r.status === 'passed')?.length || 0,
      failed: result.filter?.((r: any) => r.status === 'failed')?.length || 0,
      duration: result.duration || 0
    };
  };

  const runAllTests = async () => {
    console.log('🚀 Starting comprehensive diagnostic test suite...');
    setOverallStatus('running');
    
    for (const test of diagnosticTests) {
      await runSingleTest(test);
    }
    
    setOverallStatus('completed');
    console.log('🏁 All diagnostic tests completed');
  };

  const runCategoryTests = async (category: string) => {
    console.log(`🚀 Starting ${category} diagnostic tests...`);
    setOverallStatus('running');
    
    const categoryTests = diagnosticTests.filter(test => test.category === category);
    for (const test of categoryTests) {
      await runSingleTest(test);
    }
    
    setOverallStatus('completed');
    console.log(`🏁 ${category} diagnostic tests completed`);
  };

  const getTestStatusIcon = (testId: string) => {
    if (runningTests.has(testId)) {
      return <Clock className="w-4 h-4 text-yellow-600 animate-pulse" />;
    }
    
    const result = testResults[testId];
    if (!result) {
      return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
    
    if (result.status === 'failed') {
      return <XCircle className="w-4 h-4 text-red-600" />;
    }
    
    // Check aggregated results for phase implementation tests
    if (result.aggregated) {
      const aggregated = result.aggregated;
      return aggregated.failed === 0 && aggregated.total > 0 ? 
        <CheckCircle className="w-4 h-4 text-green-600" /> : 
        <XCircle className="w-4 h-4 text-red-600" />;
    }
    
    if (result.overallSuccess !== undefined) {
      return result.overallSuccess ? 
        <CheckCircle className="w-4 h-4 text-green-600" /> : 
        <XCircle className="w-4 h-4 text-red-600" />;
    }
    
    return <CheckCircle className="w-4 h-4 text-green-600" />;
  };

  const getTestStatusBadge = (testId: string) => {
    if (runningTests.has(testId)) {
      return <Badge variant="secondary">Running...</Badge>;
    }
    
    const result = testResults[testId];
    if (!result) {
      return <Badge variant="outline">Not Run</Badge>;
    }
    
    if (result.status === 'failed') {
      return <Badge variant="destructive">Failed</Badge>;
    }
    
    // Check aggregated results for phase implementation tests
    if (result.aggregated) {
      const aggregated = result.aggregated;
      return aggregated.failed === 0 && aggregated.total > 0 ? 
        <Badge variant="default" className="bg-green-600">Passed</Badge> : 
        <Badge variant="destructive">Failed</Badge>;
    }
    
    if (result.overallSuccess !== undefined) {
      return result.overallSuccess ? 
        <Badge variant="default" className="bg-green-600">Passed</Badge> : 
        <Badge variant="destructive">Failed</Badge>;
    }
    
    return <Badge variant="default" className="bg-green-600">Passed</Badge>;
  };

  const getTestResults = (testId: string): AggregatedTestResults | null => {
    const result = testResults[testId];
    if (!result || runningTests.has(testId)) return null;

    if (result.status === 'failed') {
      return {
        total: 0,
        passed: 0,
        failed: 1,
        duration: 0
      };
    }

    // Use aggregated results for phase implementation tests
    if (result.aggregated) {
      return result.aggregated;
    }

    // Handle other result formats
    return {
      total: result.totalTests || result.totalClaims || result.length || 0,
      passed: result.passed || result.passedClaims || 0,
      failed: result.failed || (result.totalClaims - result.passedClaims) || 0,
      duration: result.duration || result.executionSummary?.totalTimeMs || 0
    };
  };

  const clearResults = () => {
    setTestResults({});
    setPhaseResults([]);
    setEnhancedPhaseResults([]);
    setPhaseReport('');
    setEnhancedPhaseReport('');
    setExecutionLogs({});
    setOverallStatus('idle');
    toast({
      title: "Results Cleared",
      description: "All test results and logs have been cleared",
    });
  };

  const getSuccessRate = (passed: number, total: number) => {
    return total > 0 ? Math.round((passed / total) * 100) : 0;
  };

  const getStatusColor = (status: 'passed' | 'failed' | 'skipped') => {
    switch (status) {
      case 'passed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'skipped': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: 'passed' | 'failed' | 'skipped') => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'skipped': return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            Comprehensive System Diagnostics
          </h2>
          <p className="text-gray-600 mt-1">Unified testing suite for all Soul Guide innovations and system phases</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={runAllTests} 
            disabled={overallStatus === 'running'}
            className="flex items-center gap-2"
          >
            {overallStatus === 'running' ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <PlayCircle className="w-4 h-4" />
            )}
            Run All Tests
          </Button>
          <Button onClick={clearResults} variant="outline">
            Clear Results
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authentication">Auth & Streaming</TabsTrigger>
          <TabsTrigger value="innovations">Innovations</TabsTrigger>
          <TabsTrigger value="phase-tests">Phase Tests</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="results">Detailed Results</TabsTrigger>
          <TabsTrigger value="logs">Execution Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Test Status Overview */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{diagnosticTests.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {Object.keys(testResults).filter(id => !runningTests.has(id)).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Running</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {runningTests.size}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {Object.keys(testResults).length > 0 ? 
                    Math.round((Object.values(testResults).filter((r: any) => {
                      if (r.aggregated) return r.aggregated.failed === 0 && r.aggregated.total > 0;
                      return r.overallSuccess !== false && r.status !== 'failed';
                    }).length / Object.keys(testResults).length) * 100) : 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Authentication & Streaming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => runCategoryTests('authentication')} 
                  disabled={overallStatus === 'running'}
                  className="w-full"
                >
                  Test Auth & Streaming
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Innovation Patents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => runCategoryTests('vfp')} 
                  disabled={overallStatus === 'running'}
                  className="w-full"
                  variant="outline"
                >
                  Test VFP & Growth
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="authentication" className="space-y-6">
          {diagnosticTests
            .filter(test => test.category === 'authentication')
            .map((test) => {
              const TestIcon = test.icon;
              const results = getTestResults(test.id);
              
              return (
                <Card key={test.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TestIcon className="w-5 h-5 text-gray-600" />
                        <div>
                          <CardTitle className="text-lg">{test.name}</CardTitle>
                          <p className="text-sm text-gray-600">{test.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getTestStatusIcon(test.id)}
                        {getTestStatusBadge(test.id)}
                        <Button
                          onClick={() => runSingleTest(test)}
                          disabled={runningTests.has(test.id)}
                          size="sm"
                          variant="outline"
                        >
                          {runningTests.has(test.id) ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <PlayCircle className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {results && (
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{results.total}</div>
                          <div className="text-sm text-gray-600">Total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{results.passed}</div>
                          <div className="text-sm text-gray-600">Passed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{results.failed}</div>
                          <div className="text-sm text-gray-600">Failed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{Math.round(results.duration)}ms</div>
                          <div className="text-sm text-gray-600">Duration</div>
                        </div>
                      </div>
                      
                      {results.total > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Success Rate</span>
                            <span>{Math.round((results.passed / results.total) * 100)}%</span>
                          </div>
                          <Progress value={(results.passed / results.total) * 100} className="h-2" />
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
        </TabsContent>

        <TabsContent value="innovations" className="space-y-6">
          {diagnosticTests
            .filter(test => ['vfp', 'growth'].includes(test.category))
            .map((test) => {
              const TestIcon = test.icon;
              const results = getTestResults(test.id);
              
              return (
                <Card key={test.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TestIcon className="w-5 h-5 text-gray-600" />
                        <div>
                          <CardTitle className="text-lg">{test.name}</CardTitle>
                          <p className="text-sm text-gray-600">{test.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getTestStatusIcon(test.id)}
                        {getTestStatusBadge(test.id)}
                        <Button
                          onClick={() => runSingleTest(test)}
                          disabled={runningTests.has(test.id)}
                          size="sm"
                          variant="outline"
                        >
                          {runningTests.has(test.id) ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <PlayCircle className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {results && (
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{results.total}</div>
                          <div className="text-sm text-gray-600">Total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{results.passed}</div>
                          <div className="text-sm text-gray-600">Passed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{results.failed}</div>
                          <div className="text-sm text-gray-600">Failed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{Math.round(results.duration)}ms</div>
                          <div className="text-sm text-gray-600">Duration</div>
                        </div>
                      </div>
                      
                      {results.total > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Success Rate</span>
                            <span>{Math.round((results.passed / results.total) * 100)}%</span>
                          </div>
                          <Progress value={(results.passed / results.total) * 100} className="h-2" />
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
        </TabsContent>

        <TabsContent value="phase-tests" className="space-y-6">
          {/* Phase Implementation Tests */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Phase Implementation Tests</h3>
              <Button 
                onClick={() => runCategoryTests('phase-implementation')} 
                disabled={overallStatus === 'running'}
                variant="outline"
              >
                Run Phase Tests
              </Button>
            </div>

            {diagnosticTests
              .filter(test => test.category === 'phase-implementation')
              .map((test) => {
                const TestIcon = test.icon;
                const results = getTestResults(test.id);
                
                return (
                  <Card key={test.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <TestIcon className="w-5 h-5 text-gray-600" />
                          <div>
                            <CardTitle className="text-lg">{test.name}</CardTitle>
                            <p className="text-sm text-gray-600">{test.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getTestStatusIcon(test.id)}
                          {getTestStatusBadge(test.id)}
                          <Button
                            onClick={() => runSingleTest(test)}
                            disabled={runningTests.has(test.id)}
                            size="sm"
                            variant="outline"
                          >
                            {runningTests.has(test.id) ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <PlayCircle className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {results && (
                      <CardContent>
                        <div className="grid grid-cols-5 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{results.total}</div>
                            <div className="text-sm text-gray-600">Total</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{results.passed}</div>
                            <div className="text-sm text-gray-600">Passed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{results.failed}</div>
                            <div className="text-sm text-gray-600">Failed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{Math.round(results.duration)}ms</div>
                            <div className="text-sm text-gray-600">Duration</div>
                          </div>
                          {results.suiteCount && (
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{results.suiteCount}</div>
                              <div className="text-sm text-gray-600">Suites</div>
                            </div>
                          )}
                        </div>
                        
                        {results.total > 0 && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Success Rate</span>
                              <span>{Math.round((results.passed / results.total) * 100)}%</span>
                            </div>
                            <Progress value={(results.passed / results.total) * 100} className="h-2" />
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
          </div>

          {/* Phase Results Summary */}
          {(phaseResults.length > 0 || enhancedPhaseResults.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Phase Implementation Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enhancedPhaseResults.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Enhanced Phase Tests</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {enhancedPhaseResults.map((suite, index) => {
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
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {phaseResults.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Legacy Phase Tests</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {phaseResults.map((suite, index) => {
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
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {enhancedPhaseReport && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Enhanced Phase Implementation Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto font-mono">
                  {enhancedPhaseReport}
                </pre>
              </CardContent>
            </Card>
          )}
          
          {phaseReport && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="w-5 h-5" />
                  Legacy Phase Implementation Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto font-mono">
                  {phaseReport}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {/* Detailed Results Table */}
          {Object.keys(testResults).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Detailed Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Results</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {diagnosticTests.map((test) => {
                      const result = testResults[test.id];
                      if (!result) return null;
                      
                      const results = getTestResults(test.id);
                      
                      return (
                        <TableRow key={test.id}>
                          <TableCell className="font-medium">{test.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{test.category}</Badge>
                          </TableCell>
                          <TableCell>{getTestStatusBadge(test.id)}</TableCell>
                          <TableCell>
                            {results && (
                              <span className="text-sm">
                                {results.passed}/{results.total} passed
                                {results.suiteCount && ` (${results.suiteCount} suites)`}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{results ? `${Math.round(results.duration)}ms` : 'N/A'}</TableCell>
                          <TableCell className="text-gray-500">
                            {result.timestamp ? new Date(result.timestamp).toLocaleString() : 'N/A'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          {Object.keys(executionLogs).length > 0 ? (
            Object.entries(executionLogs).map(([testId, logs]) => {
              const test = diagnosticTests.find(t => t.id === testId);
              return (
                <Card key={testId}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      {test?.name || testId} - Execution Log
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
                      {logs.map((log, index) => (
                        <div key={index}>{log}</div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-gray-500">
                No execution logs available. Run some tests to see detailed execution information.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
