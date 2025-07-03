
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Database,
  Brain,
  Zap,
  TrendingUp
} from 'lucide-react';
import { automatedTestSuite } from '@/services/automated-test-suite';
import { enhancedAutomatedTestSuite } from '@/services/enhanced-automated-test-suite';
import { vfpGraphPatentTestSuite } from '@/services/vfp-graph-patent-test-suite';
import { streamingAuthTestSuite } from '@/services/streaming-auth-test-suite';
import { growthProgramTestSuite } from '@/services/growth-program-test-suite';

interface TestResult {
  id: string;
  name: string;
  category: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  results: string;
  duration: number;
  timestamp: string;
  rawResult?: any;
}

const AdminSystemDiagnostics: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const getTestResults = (): TestResult[] => {
    const results: TestResult[] = [];
    const now = new Date().toLocaleString();

    // Helper function to safely extract test counts and duration
    const extractTestMetrics = (result: any) => {
      let total = 0;
      let passed = 0;
      let duration = 0;

      try {
        // Handle different result formats
        if (result && typeof result === 'object') {
          // Check for nested rawResult first
          const dataSource = result.rawResult || result;
          
          // Extract total count - try multiple field names
          total = dataSource.totalClaims || 
                  dataSource.totalTests || 
                  dataSource.total || 
                  (Array.isArray(dataSource.results) ? dataSource.results.length : 0) ||
                  (Array.isArray(dataSource) ? dataSource.length : 0);

          // Extract passed count - try multiple field names
          passed = dataSource.passedClaims || 
                   dataSource.passed || 
                   (Array.isArray(dataSource.results) ? 
                     dataSource.results.filter((r: any) => r.status === 'passed').length : 0) ||
                   (Array.isArray(dataSource) ? 
                     dataSource.filter((r: any) => r.status === 'passed').length : 0);

          // Extract duration - try multiple sources
          duration = dataSource.duration || 
                     dataSource.executionSummary?.totalTimeMs || 
                     dataSource.totalDuration || 
                     0;
        }

        // Ensure we have valid numbers
        total = isNaN(total) ? 0 : Math.max(0, total);
        passed = isNaN(passed) ? 0 : Math.max(0, Math.min(passed, total));
        duration = isNaN(duration) ? 0 : Math.max(0, duration);

      } catch (error) {
        console.error('Error extracting test metrics:', error);
        // Return safe defaults
        total = 0;
        passed = 0;
        duration = 0;
      }

      return { total, passed, duration };
    };

    // VFP-Graph Patent Test Suite
    try {
      const vfpResult = (window as any).lastVFPGraphResult;
      const { total, passed, duration } = extractTestMetrics(vfpResult);
      
      results.push({
        id: 'vfp-patent',
        name: 'VFP-Graph Patent Validation',
        category: 'vfp',
        status: vfpResult ? (passed === total && total > 0 ? 'passed' : 'failed') : 'pending',
        results: total > 0 ? `${passed}/${total} passed` : 'No results',
        duration,
        timestamp: now,
        rawResult: vfpResult
      });
    } catch (error) {
      console.error('Error processing VFP-Graph results:', error);
      results.push({
        id: 'vfp-patent',
        name: 'VFP-Graph Patent Validation',
        category: 'vfp',
        status: 'failed',
        results: 'Error processing results',
        duration: 0,
        timestamp: now
      });
    }

    // Streaming Authentication Test Suite
    try {
      const streamingResult = (window as any).lastStreamingAuthResult;
      const { total, passed, duration } = extractTestMetrics(streamingResult);
      
      results.push({
        id: 'streaming-auth',
        name: 'Streaming Authentication Suite',
        category: 'authentication',
        status: streamingResult ? (passed === total && total > 0 ? 'passed' : 'failed') : 'pending',
        results: total > 0 ? `${passed}/${total} passed` : 'No results',
        duration,
        timestamp: now,
        rawResult: streamingResult
      });
    } catch (error) {
      console.error('Error processing Streaming Auth results:', error);
      results.push({
        id: 'streaming-auth',
        name: 'Streaming Authentication Suite',
        category: 'authentication',
        status: 'failed',
        results: 'Error processing results',
        duration: 0,
        timestamp: now
      });
    }

    // Growth Program Test Suite
    try {
      const growthResult = (window as any).lastGrowthProgramResult;
      const { total, passed, duration } = extractTestMetrics(growthResult);
      
      results.push({
        id: 'growth-program',
        name: 'Growth Program Integration',
        category: 'growth',
        status: growthResult ? (passed === total && total > 0 ? 'passed' : 'failed') : 'pending',
        results: total > 0 ? `${passed}/${total} passed` : 'No results',
        duration,
        timestamp: now,
        rawResult: growthResult
      });
    } catch (error) {
      console.error('Error processing Growth Program results:', error);
      results.push({
        id: 'growth-program',
        name: 'Growth Program Integration',
        category: 'growth',
        status: 'failed',
        results: 'Error processing results',
        duration: 0,
        timestamp: now
      });
    }

    // Phase Implementation Tests (Legacy)
    try {
      const legacyResult = (window as any).lastLegacyPhaseResult;
      if (legacyResult && Array.isArray(legacyResult)) {
        const totalTests = legacyResult.reduce((sum: number, suite: any) => sum + (suite.totalTests || 0), 0);
        const passedTests = legacyResult.reduce((sum: number, suite: any) => sum + (suite.passed || 0), 0);
        const totalDuration = legacyResult.reduce((sum: number, suite: any) => sum + (suite.duration || 0), 0);
        
        results.push({
          id: 'legacy-phase',
          name: 'Phase Implementation (Legacy)',
          category: 'phase-implementation',
          status: passedTests === totalTests && totalTests > 0 ? 'passed' : 'failed',
          results: `${passedTests}/${totalTests} passed (${legacyResult.length} suites)`,
          duration: totalDuration,
          timestamp: now,
          rawResult: legacyResult
        });
      }
    } catch (error) {
      console.error('Error processing Legacy Phase results:', error);
    }

    // Phase Implementation Tests (Enhanced)
    try {
      const enhancedResult = (window as any).lastEnhancedPhaseResult;
      if (enhancedResult && Array.isArray(enhancedResult)) {
        const totalTests = enhancedResult.reduce((sum: number, suite: any) => sum + (suite.totalTests || 0), 0);
        const passedTests = enhancedResult.reduce((sum: number, suite: any) => sum + (suite.passed || 0), 0);
        const totalDuration = enhancedResult.reduce((sum: number, suite: any) => sum + (suite.duration || 0), 0);
        
        results.push({
          id: 'enhanced-phase',
          name: 'Phase Implementation (Enhanced)',
          category: 'phase-implementation',
          status: passedTests === totalTests && totalTests > 0 ? 'passed' : 'failed',
          results: `${passedTests}/${totalTests} passed (${enhancedResult.length} suites)`,
          duration: totalDuration,
          timestamp: now,
          rawResult: enhancedResult
        });
      }
    } catch (error) {
      console.error('Error processing Enhanced Phase results:', error);
    }

    return results;
  };

  const runTestSuite = async (testId: string) => {
    setIsRunning(true);
    
    try {
      switch (testId) {
        case 'vfp-patent':
          const vfpResult = await vfpGraphPatentTestSuite.runCompleteTestSuite();
          (window as any).lastVFPGraphResult = vfpResult;
          break;
          
        case 'streaming-auth':
          const streamingResult = await streamingAuthTestSuite.runFullTestSuite();
          (window as any).lastStreamingAuthResult = streamingResult;
          break;
          
        case 'growth-program':
          const growthResult = await growthProgramTestSuite.runCompleteTestSuite();
          (window as any).lastGrowthProgramResult = growthResult;
          break;
          
        case 'legacy-phase':
          const legacyResult = await automatedTestSuite.runCompleteTestSuite();
          (window as any).lastLegacyPhaseResult = legacyResult;
          break;
          
        case 'enhanced-phase':
          const enhancedResult = await enhancedAutomatedTestSuite.runCompleteTestSuite();
          (window as any).lastEnhancedPhaseResult = enhancedResult;
          break;
      }
      
      // Update results after test completion
      setTestResults(getTestResults());
      
    } catch (error) {
      console.error(`Error running ${testId} test suite:`, error);
    } finally {
      setIsRunning(false);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    try {
      // Run all test suites in parallel for better performance
      const [vfpResult, streamingResult, growthResult, legacyResult, enhancedResult] = await Promise.allSettled([
        vfpGraphPatentTestSuite.runCompleteTestSuite(),
        streamingAuthTestSuite.runFullTestSuite(),
        growthProgramTestSuite.runCompleteTestSuite(),
        automatedTestSuite.runCompleteTestSuite(),
        enhancedAutomatedTestSuite.runCompleteTestSuite()
      ]);

      // Store results
      if (vfpResult.status === 'fulfilled') (window as any).lastVFPGraphResult = vfpResult.value;
      if (streamingResult.status === 'fulfilled') (window as any).lastStreamingAuthResult = streamingResult.value;
      if (growthResult.status === 'fulfilled') (window as any).lastGrowthProgramResult = growthResult.value;
      if (legacyResult.status === 'fulfilled') (window as any).lastLegacyPhaseResult = legacyResult.value;
      if (enhancedResult.status === 'fulfilled') (window as any).lastEnhancedPhaseResult = enhancedResult.value;

      // Update results
      setTestResults(getTestResults());
      
    } catch (error) {
      console.error('Error running all test suites:', error);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    // Load initial results from any stored data
    setTestResults(getTestResults());
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'running': return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredResults = selectedCategory === 'all' 
    ? testResults 
    : testResults.filter(result => result.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(testResults.map(r => r.category)))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Diagnostics</h2>
          <p className="text-gray-600">Run comprehensive system tests and validate implementations</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run All Tests
          </Button>
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6">
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category === 'all' ? 'All Tests' : category.replace('-', ' ')}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Detailed Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Test Name</th>
                      <th className="text-left p-3 font-semibold">Category</th>
                      <th className="text-left p-3 font-semibold">Status</th>
                      <th className="text-left p-3 font-semibold">Results</th>
                      <th className="text-left p-3 font-semibold">Duration</th>
                      <th className="text-left p-3 font-semibold">Timestamp</th>
                      <th className="text-left p-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((result) => (
                      <tr key={result.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{result.name}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="capitalize">
                            {result.category.replace('-', ' ')}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge className={getStatusColor(result.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(result.status)}
                              <span className="capitalize">{result.status}</span>
                            </div>
                          </Badge>
                        </td>
                        <td className="p-3 font-mono text-sm">{result.results}</td>
                        <td className="p-3 font-mono text-sm">{result.duration}ms</td>
                        <td className="p-3 text-sm text-gray-600">{result.timestamp}</td>
                        <td className="p-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => runTestSuite(result.id)}
                            disabled={isRunning}
                            className="flex items-center gap-1"
                          >
                            {isRunning ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                            Run
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredResults.length === 0 && (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No test results available. Run tests to see results.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Tests</p>
                    <p className="text-2xl font-bold">{filteredResults.length}</p>
                  </div>
                  <Database className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Passed</p>
                    <p className="text-2xl font-bold text-green-600">
                      {filteredResults.filter(r => r.status === 'passed').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-red-600">
                      {filteredResults.filter(r => r.status === 'failed').length}
                    </p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSystemDiagnostics;
