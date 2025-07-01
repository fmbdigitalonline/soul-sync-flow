
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
  Database,
  TrendingUp,
  Shield,
  Brain,
  Calendar,
  Bell
} from 'lucide-react';
import { piePatentTestRunner, PIEPatentTestResult, PIEPatentValidationReport } from '@/services/pie-patent-test-runner';

export const PIEPatentTestSuite: React.FC = () => {
  const [testResults, setTestResults] = useState<PIEPatentValidationReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState('');

  const runPIEPatentTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setCurrentTest('Initializing PIE Patent Test Suite...');
    
    try {
      // Run the complete PIE patent validation with real-time progress
      const results = await piePatentTestRunner.runFullPatentValidation((progressUpdate) => {
        setProgress(progressUpdate.progress);
        setCurrentTest(progressUpdate.currentTest);
      });
      
      setTestResults(results);
      setProgress(100);
      setCurrentTest('Patent validation complete!');
    } catch (error) {
      console.error('PIE Patent test execution error:', error);
      setCurrentTest('Test execution failed');
    } finally {
      setIsRunning(false);
      setTimeout(() => {
        setProgress(0);
        setCurrentTest('');
      }, 3000);
    }
  };

  const getClaimIcon = (claimNumber: number) => {
    const iconMap = {
      1: Database,
      2: TrendingUp,
      3: Brain,
      4: Shield,
      5: Activity,
      6: Calendar,
      7: Bell
      // REMOVED: Claim 8 icon mapping
    };
    return iconMap[claimNumber] || CheckCircle;
  };

  const getClaimTitle = (claimNumber: number) => {
    const titleMap = {
      1: 'Personalized Proactive Insights Pipeline',
      2: 'Advanced Correlation Methods',
      3: 'VFP-Graph Personality Integration',
      4: 'Hard Suppression Gate',
      5: 'Adaptive Text Styling',
      6: 'System Architecture Validation',
      7: 'Astrology Correlation Focus'
      // REMOVED: Claim 8 title mapping
    };
    return titleMap[claimNumber] || `Claim ${claimNumber}`;
  };

  const getStatusColor = (result: PIEPatentTestResult) => {
    if (result.passed) return 'text-green-600 bg-green-50 border-green-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getOverallStatus = () => {
    if (!testResults) return null;
    
    const passedCount = testResults.claimResults.filter(r => r.passed).length;
    const totalCount = testResults.claimResults.length;
    
    if (passedCount === totalCount) {
      return { status: 'success', text: 'All Claims Validated', color: 'text-green-700' };
    } else if (passedCount > totalCount / 2) {
      return { status: 'partial', text: 'Partial Validation', color: 'text-yellow-700' };
    } else {
      return { status: 'failed', text: 'Validation Failed', color: 'text-red-700' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Runner Control */}
      <Card className="border-purple-200 bg-purple-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-purple-600" />
            PIE (Proactive Insight Engine) Patent Validation Suite
            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
              7 Patent Claims
            </Badge>
          </CardTitle>
          <p className="text-sm text-purple-600">
            Comprehensive real-time validation of core PIE patent claims using dynamic functionality data
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={runPIEPatentTests} 
              disabled={isRunning}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isRunning ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  Running Patent Validation...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run PIE Patent Test Suite
                </>
              )}
            </Button>

            {isRunning && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-purple-700 font-medium">{currentTest}</span>
                  <span className="text-purple-600">{progress}%</span>
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
              <span>PIE Patent Validation Results</span>
              <div className="flex items-center gap-2">
                {getOverallStatus() && (
                  <Badge className={getOverallStatus()!.color}>
                    {getOverallStatus()!.text}
                  </Badge>
                )}
                <Badge variant="outline">
                  {testResults.passedClaims}/{testResults.totalClaims} Claims Passed
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{testResults.passedClaims}</div>
                <div className="text-sm text-gray-600">Claims Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{testResults.totalClaims - testResults.passedClaims}</div>
                <div className="text-sm text-gray-600">Claims Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{Math.round(testResults.executionSummary.totalTimeMs)}ms</div>
                <div className="text-sm text-gray-600">Total Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{testResults.evidence.realTimeDataPoints}</div>
                <div className="text-sm text-gray-600">Data Points</div>
              </div>
            </div>

            <Progress 
              value={(testResults.passedClaims / testResults.totalClaims) * 100} 
              className="w-full mb-4" 
            />
            
            <div className="text-sm text-gray-600">
              Test Run ID: {testResults.testRunId} • {new Date(testResults.timestamp).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Claim Results */}
      {testResults && testResults.claimResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Patent Claim Validation Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {testResults.claimResults.map((result, index) => {
                const IconComponent = getClaimIcon(result.claimNumber);
                return (
                  <div 
                    key={index} 
                    className={`p-4 rounded border ${getStatusColor(result)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {result.passed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <IconComponent className="h-4 w-4" />
                        <span className="font-medium">
                          Claim {result.claimNumber}: {getClaimTitle(result.claimNumber)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={result.passed ? "default" : "destructive"}>
                          {result.passed ? 'PASSED' : 'FAILED'}
                        </Badge>
                        <span className="text-xs text-gray-500">{result.executionTimeMs}ms</span>
                      </div>
                    </div>
                    
                    {result.evidence && (
                      <div className="text-sm mb-2">
                        <strong>Evidence:</strong>
                        <div className="bg-gray-50 p-2 rounded mt-1 text-xs font-mono">
                          {JSON.stringify(result.evidence, null, 2).slice(0, 200)}...
                        </div>
                      </div>
                    )}
                    
                    {result.error && (
                      <div className="text-sm text-red-600 mb-2">
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-600">
                      Executed: {new Date(result.timestamp).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-Time Evidence Summary */}
      {testResults && testResults.evidence && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Real-Time Evidence Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{testResults.evidence.patternDetections}</div>
                <div className="text-sm text-gray-600">Pattern Detections</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{testResults.evidence.correlationAnalyses}</div>
                <div className="text-sm text-gray-600">Correlation Analyses</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{testResults.evidence.predictiveRules}</div>
                <div className="text-sm text-gray-600">Predictive Rules</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">{testResults.evidence.notificationDeliveries}</div>
                <div className="text-sm text-gray-600">Notifications</div>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-gray-600">
              All evidence collected using real-time dynamic data - no hardcoded or simulated values
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PIEPatentTestSuite;
