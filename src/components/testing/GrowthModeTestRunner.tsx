
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  Brain, 
  Zap, 
  Database,
  MessageSquare,
  TrendingUp,
  Monitor,
  Activity,
  Target
} from 'lucide-react';
import { growthModeComprehensiveTestSuite } from '@/services/growth-mode-comprehensive-test-suite';
import type { GrowthModeTestSuiteResult, GrowthModeTestResult } from '@/services/growth-mode-comprehensive-test-suite';

export const GrowthModeTestRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<GrowthModeTestSuiteResult | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const runComprehensiveTests = async () => {
    setIsRunning(true);
    setTestResults(null);

    try {
      console.log('🧪 Starting Growth Mode comprehensive test suite...');
      const results = await growthModeComprehensiveTestSuite.runFullTestSuite();
      setTestResults(results);
      console.log('✅ Growth Mode test suite completed');
    } catch (error) {
      console.error('❌ Growth Mode test execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: GrowthModeTestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'skipped':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'program':
        return <TrendingUp className="h-4 w-4" />;
      case 'coach':
        return <Brain className="h-4 w-4" />;
      case 'memory':
        return <Database className="h-4 w-4" />;
      case 'conversation':
        return <MessageSquare className="h-4 w-4" />;
      case 'integration':
        return <Zap className="h-4 w-4" />;
      case 'ui':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: GrowthModeTestResult['status']) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'skipped':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredResults = testResults?.results.filter(
    result => activeCategory === 'all' || result.category === activeCategory
  ) || [];

  const categoryTabs = [
    { id: 'all', label: 'All Tests', icon: Target },
    { id: 'program', label: 'Program', icon: TrendingUp },
    { id: 'coach', label: 'Coach', icon: Brain },
    { id: 'memory', label: 'Memory', icon: Database },
    { id: 'conversation', label: 'Conversation', icon: MessageSquare },
    { id: 'integration', label: 'Integration', icon: Zap },
    { id: 'ui', label: 'UI', icon: Monitor }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-soul-purple" />
              Growth Mode Comprehensive Test Suite
            </CardTitle>
            <p className="text-muted-foreground">
              Complete monitoring and measurement of all growth mode components
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {testResults && (
              <div className="text-right">
                <div className="text-sm font-medium">
                  {testResults.passed}/{testResults.totalTests} Passed
                </div>
                <Badge 
                  variant={testResults.integrationStatus === 'healthy' ? 'default' : 'destructive'}
                  className="mt-1"
                >
                  {testResults.integrationStatus}
                </Badge>
              </div>
            )}
            
            <Button
              onClick={runComprehensiveTests}
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
                  Run All Growth Tests
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isRunning && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 animate-spin" />
              <span className="text-sm">Running comprehensive growth mode tests...</span>
            </div>
            <Progress value={50} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Testing program lifecycle, coach intelligence, memory systems, conversations, and integrations...
            </p>
          </div>
        )}

        {testResults && (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{testResults.passed}</div>
                <div className="text-sm text-green-700">Passed</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{testResults.failed}</div>
                <div className="text-sm text-red-700">Failed</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{testResults.totalTests}</div>
                <div className="text-sm text-blue-700">Total</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{Math.round(testResults.duration)}ms</div>
                <div className="text-sm text-purple-700">Duration</div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Category Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(testResults.categoryBreakdown).map(([category, stats]) => (
                  <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category)}
                      <span className="capitalize font-medium">{category}</span>
                    </div>
                    <Badge variant={stats.passed === stats.total ? 'default' : 'secondary'}>
                      {stats.passed}/{stats.total}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Results by Category */}
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
                {categoryTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1">
                      <Icon className="h-3 w-3" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent value={activeCategory} className="mt-4">
                <div className="space-y-3">
                  {filteredResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result.status)}
                          <div>
                            <h4 className="font-medium">{result.testName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              {getCategoryIcon(result.category)}
                              <span className="text-xs text-muted-foreground capitalize">
                                {result.category}
                              </span>
                              {result.dataValidation && (
                                <Badge variant="outline" className="text-xs">
                                  {result.dataValidation.isLiveData ? 'Live Data' : 'Mock Data'}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <Badge className={getStatusColor(result.status)}>
                            {result.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {result.duration}ms
                          </p>
                        </div>
                      </div>
                      
                      {result.error && (
                        <p className="text-sm text-red-600 mb-2">{result.error}</p>
                      )}
                      
                      {result.performanceMetrics && (
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Response: {result.performanceMetrics.responseTime}ms</span>
                          <span>API Calls: {result.performanceMetrics.apiCalls}</span>
                        </div>
                      )}
                      
                      {result.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-blue-600 cursor-pointer">
                            View Test Details
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {!isRunning && !testResults && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Click "Run All Growth Tests" to start comprehensive testing</p>
            <p className="text-sm mt-2">
              Tests all growth mode components: programs, coach, memory, conversations, and integrations
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
