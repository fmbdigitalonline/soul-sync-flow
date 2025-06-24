
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Clock,
  User,
  MessageSquare,
  Zap,
  TestTube,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';
import { useEnhancedAICoach } from '@/hooks/use-enhanced-ai-coach';
import { useSoulSync } from '@/hooks/use-soul-sync';
import { memoryService } from '@/services/memory-service';
import { enhancedAICoachService } from '@/services/enhanced-ai-coach-service';
import { enhancedMemoryService, MemoryConsistencyReport } from '@/services/enhanced-memory-service';
import { blueprintAIIntegrationService, BlueprintIntegrationReport } from '@/services/blueprint-ai-integration-service';

interface ConsistencyCheck {
  id: string;
  name: string;
  status: 'pending' | 'passed' | 'failed' | 'warning';
  message: string;
  timestamp: Date;
  details?: any;
}

interface ComprehensiveTestResults {
  memoryFlow: any;
  blueprintIntegration: any;
  systemConsistency: any;
  overallScore: number;
  recommendations: string[];
}

export const MemoryConsistencyMonitor: React.FC = () => {
  const { user } = useAuth();
  const { blueprintData, hasBlueprint, loading: blueprintLoading } = useBlueprintCache();
  const { personaReady, authInitialized, blueprintStatus } = useEnhancedAICoach();
  const { isSoulSyncReady, soulSyncError, blueprintValidation } = useSoulSync();
  
  const [isRunning, setIsRunning] = useState(false);
  const [checks, setChecks] = useState<ConsistencyCheck[]>([]);
  const [memoryReport, setMemoryReport] = useState<MemoryConsistencyReport | null>(null);
  const [blueprintReport, setBlueprintReport] = useState<BlueprintIntegrationReport | null>(null);
  const [comprehensiveResults, setComprehensiveResults] = useState<ComprehensiveTestResults | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Auto-refresh logic
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(async () => {
        await generateReports();
      }, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const generateReports = async () => {
    if (!user) return;
    
    try {
      const [memoryReportData, blueprintReportData] = await Promise.all([
        enhancedMemoryService.generateConsistencyReport(),
        blueprintAIIntegrationService.generateIntegrationReport()
      ]);
      
      setMemoryReport(memoryReportData);
      setBlueprintReport(blueprintReportData);
    } catch (error) {
      console.error('Error generating reports:', error);
    }
  };

  useEffect(() => {
    generateReports();
  }, [user]);

  const runConsistencyChecks = async () => {
    setIsRunning(true);
    setChecks([]);
    
    const newChecks: ConsistencyCheck[] = [];
    
    // Check 1: User Authentication
    newChecks.push({
      id: 'auth',
      name: 'User Authentication',
      status: user ? 'passed' : 'failed',
      message: user ? `Authenticated as ${user.email}` : 'No authenticated user',
      timestamp: new Date(),
      details: { userId: user?.id, email: user?.email }
    });

    // Check 2: Memory System Health
    if (user) {
      try {
        const memoryReport = await enhancedMemoryService.generateConsistencyReport();
        const memoryStatus = memoryReport.consistencyScore > 70 ? 'passed' : 
                           memoryReport.consistencyScore > 40 ? 'warning' : 'failed';
        
        newChecks.push({
          id: 'memory-system',
          name: 'Memory System Health',
          status: memoryStatus,
          message: `Memory consistency score: ${memoryReport.consistencyScore}% (${memoryReport.totalMemories} memories)`,
          timestamp: new Date(),
          details: memoryReport
        });
      } catch (error) {
        newChecks.push({
          id: 'memory-system',
          name: 'Memory System Health',
          status: 'failed',
          message: `Memory system error: ${error}`,
          timestamp: new Date(),
          details: { error: String(error) }
        });
      }
    }

    // Check 3: Blueprint Integration
    if (user) {
      try {
        const blueprintReport = await blueprintAIIntegrationService.generateIntegrationReport();
        const blueprintStatus = blueprintReport.integrationScore > 80 ? 'passed' : 
                              blueprintReport.integrationScore > 50 ? 'warning' : 'failed';
        
        newChecks.push({
          id: 'blueprint-integration',
          name: 'Blueprint-AI Integration',
          status: blueprintStatus,
          message: `Integration score: ${blueprintReport.integrationScore}% (${blueprintReport.completionPercentage}% complete)`,
          timestamp: new Date(),
          details: blueprintReport
        });
      } catch (error) {
        newChecks.push({
          id: 'blueprint-integration',
          name: 'Blueprint-AI Integration',
          status: 'failed',
          message: `Blueprint integration error: ${error}`,
          timestamp: new Date(),
          details: { error: String(error) }
        });
      }
    }

    // Check 4: SoulSync Status
    const soulSyncStatus = isSoulSyncReady ? 'passed' : (soulSyncError ? 'failed' : 'warning');
    newChecks.push({
      id: 'soulsync',
      name: 'SoulSync Integration',
      status: soulSyncStatus,
      message: isSoulSyncReady 
        ? 'SoulSync active and ready' 
        : soulSyncError || 'SoulSync not fully ready',
      timestamp: new Date(),
      details: { isSoulSyncReady, soulSyncError }
    });

    // Check 5: AI Service Readiness
    newChecks.push({
      id: 'ai-service',
      name: 'AI Service Readiness',
      status: authInitialized && personaReady ? 'passed' : 'warning',
      message: authInitialized && personaReady 
        ? 'AI service fully operational' 
        : 'AI service partially ready',
      timestamp: new Date(),
      details: { authInitialized, personaReady, blueprintStatus }
    });

    setChecks(newChecks);
    await generateReports();
    setIsRunning(false);
  };

  const runComprehensiveTests = async () => {
    setIsRunning(true);
    
    try {
      console.log('🧪 Starting comprehensive test suite');
      
      const [memoryFlowTest, blueprintIntegrationTest] = await Promise.all([
        enhancedMemoryService.testMemoryFlow(),
        blueprintAIIntegrationService.testBlueprintIntegration()
      ]);

      // Calculate overall score
      const memoryScore = Object.values(memoryFlowTest).filter(v => v === true).length * 25;
      const blueprintScore = Object.values(blueprintIntegrationTest).filter(v => v === true).length * 25;
      const overallScore = Math.floor((memoryScore + blueprintScore) / 2);

      // Generate recommendations
      const recommendations: string[] = [];
      
      if (!memoryFlowTest.creationTest) {
        recommendations.push('Memory creation is failing - check authentication and database permissions');
      }
      if (!memoryFlowTest.retrievalTest) {
        recommendations.push('Memory retrieval is failing - check database queries and user ID consistency');
      }
      if (!memoryFlowTest.searchTest) {
        recommendations.push('Memory search is not working - check search implementation and indexing');
      }
      if (!blueprintIntegrationTest.blueprintLoadTest) {
        recommendations.push('Blueprint loading is failing - check blueprint service and database');
      }
      if (!blueprintIntegrationTest.aiSyncTest) {
        recommendations.push('AI sync is failing - check enhanced AI coach service integration');
      }

      if (recommendations.length === 0) {
        recommendations.push('All systems are functioning correctly!');
      }

      setComprehensiveResults({
        memoryFlow: memoryFlowTest,
        blueprintIntegration: blueprintIntegrationTest,
        systemConsistency: { overallScore },
        overallScore,
        recommendations
      });
    } catch (error) {
      console.error('Comprehensive test error:', error);
      setComprehensiveResults({
        memoryFlow: { error: String(error) },
        blueprintIntegration: { error: String(error) },
        systemConsistency: { error: String(error) },
        overallScore: 0,
        recommendations: ['System testing failed - check console for errors']
      });
    }
    
    setIsRunning(false);
  };

  const forceBlueprintSync = async () => {
    setIsRunning(true);
    try {
      const result = await blueprintAIIntegrationService.forceBlueprintSync();
      if (result.success) {
        await generateReports();
        console.log('✅ Forced blueprint sync completed');
      } else {
        console.error('❌ Forced blueprint sync failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Force sync error:', error);
    }
    setIsRunning(false);
  };

  const getStatusIcon = (status: ConsistencyCheck['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ConsistencyCheck['status']) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Enhanced Memory & Blueprint Monitor
          </h2>
          <p className="text-gray-600 mt-1">
            Real-time testing and monitoring of memory persistence and blueprint integration
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Button 
            onClick={runConsistencyChecks}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRunning ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
            Run Checks
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="checks">Consistency Checks</TabsTrigger>
          <TabsTrigger value="comprehensive">Comprehensive Tests</TabsTrigger>
          <TabsTrigger value="reports">Detailed Reports</TabsTrigger>
          <TabsTrigger value="tools">Diagnostic Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">User Status</span>
                    <Badge className={user ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {user ? 'Authenticated' : 'Not Authenticated'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">AI Service</span>
                    <Badge className={authInitialized ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {authInitialized ? 'Ready' : 'Not Ready'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Memory System
                </CardTitle>
              </CardHeader>
              <CardContent>
                {memoryReport ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Memories</span>
                      <span className="font-mono text-sm">{memoryReport.totalMemories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Consistency Score</span>
                      <span className="font-mono text-sm">{memoryReport.consistencyScore}%</span>
                    </div>
                    <Progress value={memoryReport.consistencyScore} className="h-2" />
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Loading...</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Blueprint Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                {blueprintReport ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Integration Score</span>
                      <span className="font-mono text-sm">{blueprintReport.integrationScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Completion</span>
                      <span className="font-mono text-sm">{blueprintReport.completionPercentage}%</span>
                    </div>
                    <Progress value={blueprintReport.integrationScore} className="h-2" />
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Loading...</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="checks" className="space-y-4">
          <div className="space-y-3">
            {checks.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No consistency checks run yet. Click "Run Checks" to start.</p>
                </CardContent>
              </Card>
            ) : (
              checks.map((check) => (
                <Card key={check.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(check.status)}
                        <div>
                          <h3 className="font-medium">{check.name}</h3>
                          <p className="text-sm text-gray-600">{check.message}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(check.status)}>
                          {check.status.toUpperCase()}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {check.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    {check.details && (
                      <details className="mt-3">
                        <summary className="text-sm text-blue-600 cursor-pointer">View Details</summary>
                        <pre className="text-xs bg-gray-50 p-2 rounded mt-2 overflow-auto max-h-32">
                          {JSON.stringify(check.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="comprehensive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Comprehensive System Tests
              </CardTitle>
              <p className="text-sm text-gray-600">
                End-to-end testing of memory flow and blueprint integration
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={runComprehensiveTests}
                  disabled={isRunning || !user}
                  className="w-full"
                >
                  {isRunning ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  Run Comprehensive Tests
                </Button>
                
                {comprehensiveResults && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Memory Flow Tests</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            {Object.entries(comprehensiveResults.memoryFlow).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                                <Badge className={value === true ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                  {value === true ? 'PASS' : 'FAIL'}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Blueprint Integration Tests</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            {Object.entries(comprehensiveResults.blueprintIntegration).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                                <Badge className={value === true ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                  {value === true ? 'PASS' : 'FAIL'}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Overall Score & Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Overall System Health:</span>
                            <Badge className={comprehensiveResults.overallScore > 75 ? 'bg-green-100 text-green-800' : 
                                           comprehensiveResults.overallScore > 50 ? 'bg-yellow-100 text-yellow-800' : 
                                           'bg-red-100 text-red-800'}>
                              {comprehensiveResults.overallScore}%
                            </Badge>
                          </div>
                          <Progress value={comprehensiveResults.overallScore} className="h-2" />
                          <div className="space-y-2">
                            <div className="text-sm font-medium">Recommendations:</div>
                            {comprehensiveResults.recommendations.map((rec, index) => (
                              <div key={index} className="text-xs bg-blue-50 p-2 rounded border-l-2 border-blue-400">
                                {rec}
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Memory Consistency Report</CardTitle>
              </CardHeader>
              <CardContent>
                {memoryReport ? (
                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-64">
                    {JSON.stringify(memoryReport, null, 2)}
                  </pre>
                ) : (
                  <div className="text-sm text-gray-500">No report available</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Blueprint Integration Report</CardTitle>
              </CardHeader>
              <CardContent>
                {blueprintReport ? (
                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-64">
                    {JSON.stringify(blueprintReport, null, 2)}
                  </pre>
                ) : (
                  <div className="text-sm text-gray-500">No report available</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Diagnostic Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={forceBlueprintSync}
                    disabled={isRunning}
                    className="w-full"
                  >
                    {isRunning ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    Force Blueprint Sync
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={generateReports}
                    disabled={isRunning}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Reports
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">System Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>User ID:</span>
                    <span className="font-mono">{user?.id?.slice(0, 8) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Blueprint Loading:</span>
                    <span>{blueprintLoading ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Persona Ready:</span>
                    <span>{personaReady ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SoulSync Ready:</span>
                    <span>{isSoulSyncReady ? 'Yes' : 'No'}</span>
                  </div>
                  {memoryReport && (
                    <>
                      <div className="flex justify-between">
                        <span>Memory Latency:</span>
                        <span>{memoryReport.retrievalLatency}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Memory:</span>
                        <span>{memoryReport.lastMemoryDate ? new Date(memoryReport.lastMemoryDate).toLocaleDateString() : 'None'}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
