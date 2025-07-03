
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Activity
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { streamingAuthTestSuite, StreamingTestSuiteResult } from '@/services/streaming-auth-test-suite';
import { vfpGraphPatentTestSuite, PatentValidationReport } from '@/services/vfp-graph-patent-test-suite';
import { growthProgramTestSuite, GrowthProgramTestSuiteResult } from '@/services/growth-program-test-suite';
import { useToast } from '@/hooks/use-toast';

interface DiagnosticTest {
  id: string;
  name: string;
  description: string;
  category: 'authentication' | 'vfp' | 'growth' | 'system';
  icon: React.ComponentType<any>;
  runner: () => Promise<any>;
}

export const AdminSystemDiagnostics: React.FC = () => {
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const { toast } = useToast();

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
    }
  ];

  const runSingleTest = async (test: DiagnosticTest) => {
    console.log(`🧪 Starting diagnostic test: ${test.name}`);
    
    setRunningTests(prev => new Set([...prev, test.id]));
    
    try {
      const result = await test.runner();
      
      setTestResults(prev => ({
        ...prev,
        [test.id]: {
          ...result,
          status: 'completed',
          timestamp: new Date().toISOString()
        }
      }));

      toast({
        title: "Test Completed",
        description: `${test.name} finished successfully`,
      });

      console.log(`✅ Test completed: ${test.name}`, result);
    } catch (error) {
      console.error(`❌ Test failed: ${test.name}`, error);
      
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

  const runAllTests = async () => {
    console.log('🚀 Starting full diagnostic test suite...');
    setOverallStatus('running');
    
    for (const test of diagnosticTests) {
      await runSingleTest(test);
    }
    
    setOverallStatus('completed');
    console.log('🏁 All diagnostic tests completed');
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
    
    if (result.overallSuccess !== undefined) {
      return result.overallSuccess ? 
        <Badge variant="default" className="bg-green-600">Passed</Badge> : 
        <Badge variant="destructive">Failed</Badge>;
    }
    
    return <Badge variant="default" className="bg-green-600">Passed</Badge>;
  };

  const getTestResults = (testId: string) => {
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

    return {
      total: result.totalTests || result.totalClaims || 0,
      passed: result.passed || result.passedClaims || 0,
      failed: result.failed || (result.totalClaims - result.passedClaims) || 0,
      duration: result.duration || result.executionSummary?.totalTimeMs || 0
    };
  };

  const clearResults = () => {
    setTestResults({});
    setOverallStatus('idle');
    toast({
      title: "Results Cleared",
      description: "All test results have been cleared",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            SoulSync System Diagnostics
          </h2>
          <p className="text-gray-600 mt-1">Comprehensive testing suite for all Soul Guide innovations</p>
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
                Math.round((Object.values(testResults).filter((r: any) => r.overallSuccess !== false).length / Object.keys(testResults).length) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Test Cards */}
      <div className="grid grid-cols-1 gap-6">
        {diagnosticTests.map((test) => {
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
      </div>

      {/* Detailed Results Table */}
      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
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
                      <TableCell>{getTestStatusBadge(test.id)}</TableCell>
                      <TableCell>
                        {results && (
                          <span className="text-sm">
                            {results.passed}/{results.total} passed
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
    </div>
  );
};
