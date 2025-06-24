
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
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';
import { useEnhancedAICoach } from '@/hooks/use-enhanced-ai-coach';
import { useSoulSync } from '@/hooks/use-soul-sync';
import { memoryService } from '@/services/memory-service';
import { enhancedAICoachService } from '@/services/enhanced-ai-coach-service';

interface ConsistencyCheck {
  id: string;
  name: string;
  status: 'pending' | 'passed' | 'failed' | 'warning';
  message: string;
  timestamp: Date;
  details?: any;
}

interface MemoryState {
  blueprintLoaded: boolean;
  blueprintCompleteness: number;
  recentMemoriesCount: number;
  aiServiceInitialized: boolean;
  soulSyncReady: boolean;
  conversationHistory: number;
}

export const MemoryConsistencyMonitor: React.FC = () => {
  const { user } = useAuth();
  const { blueprintData, hasBlueprint, loading: blueprintLoading } = useBlueprintCache();
  const { personaReady, authInitialized, blueprintStatus } = useEnhancedAICoach();
  const { isSoulSyncReady, soulSyncError, blueprintValidation } = useSoulSync();
  
  const [isRunning, setIsRunning] = useState(false);
  const [checks, setChecks] = useState<ConsistencyCheck[]>([]);
  const [memoryState, setMemoryState] = useState<MemoryState | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Real-time state monitoring
  useEffect(() => {
    const updateMemoryState = () => {
      setMemoryState({
        blueprintLoaded: !!blueprintData,
        blueprintCompleteness: blueprintValidation?.completionPercentage || 0,
        recentMemoriesCount: 0, // Will be updated by async call
        aiServiceInitialized: authInitialized,
        soulSyncReady: isSoulSyncReady,
        conversationHistory: 0 // Will be updated by async call
      });
    };

    updateMemoryState();
    
    if (autoRefresh) {
      const interval = setInterval(updateMemoryState, 5000);
      return () => clearInterval(interval);
    }
  }, [blueprintData, blueprintValidation, authInitialized, isSoulSyncReady, autoRefresh]);

  // Update memory counts asynchronously
  useEffect(() => {
    const updateAsyncCounts = async () => {
      if (!user) return;
      
      try {
        const [memories, conversationHistory] = await Promise.all([
          memoryService.getRecentMemories(10),
          enhancedAICoachService.loadConversationHistory('blend')
        ]);
        
        setMemoryState(prev => prev ? {
          ...prev,
          recentMemoriesCount: memories.length,
          conversationHistory: conversationHistory.length
        } : null);
      } catch (error) {
        console.error('Error updating async counts:', error);
      }
    };

    updateAsyncCounts();
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

    // Check 2: Blueprint Availability
    const blueprintCheck: ConsistencyCheck = {
      id: 'blueprint',
      name: 'Blueprint Data Availability',
      status: hasBlueprint ? 'passed' : 'failed',
      message: hasBlueprint 
        ? `Blueprint loaded (${blueprintValidation?.completionPercentage || 0}% complete)` 
        : 'No blueprint data available',
      timestamp: new Date(),
      details: {
        hasBlueprint,
        completeness: blueprintValidation?.completionPercentage,
        missingFields: blueprintValidation?.missingFields
      }
    };
    newChecks.push(blueprintCheck);

    // Check 3: AI Service Initialization
    newChecks.push({
      id: 'ai-service',
      name: 'AI Service Initialization',
      status: authInitialized ? 'passed' : 'failed',
      message: authInitialized 
        ? 'AI service properly initialized' 
        : 'AI service not initialized',
      timestamp: new Date(),
      details: { authInitialized, personaReady }
    });

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

    // Check 5: Memory Service
    if (user) {
      try {
        const recentMemories = await memoryService.getRecentMemories(5);
        newChecks.push({
          id: 'memory-service',
          name: 'Memory Service Access',
          status: 'passed',
          message: `Found ${recentMemories.length} recent memories`,
          timestamp: new Date(),
          details: { memoriesCount: recentMemories.length }
        });
      } catch (error) {
        newChecks.push({
          id: 'memory-service',
          name: 'Memory Service Access',
          status: 'failed',
          message: `Memory service error: ${error}`,
          timestamp: new Date(),
          details: { error: String(error) }
        });
      }
    }

    // Check 6: Conversation History
    if (user) {
      try {
        const history = await enhancedAICoachService.loadConversationHistory('blend');
        newChecks.push({
          id: 'conversation-history',
          name: 'Conversation History',
          status: history.length > 0 ? 'passed' : 'warning',
          message: `${history.length} messages in conversation history`,
          timestamp: new Date(),
          details: { historyLength: history.length }
        });
      } catch (error) {
        newChecks.push({
          id: 'conversation-history',
          name: 'Conversation History',
          status: 'failed',
          message: `History access error: ${error}`,
          timestamp: new Date(),
          details: { error: String(error) }
        });
      }
    }

    setChecks(newChecks);
    setIsRunning(false);
  };

  const runInteractiveTest = async () => {
    setIsRunning(true);
    
    try {
      // Test memory creation and retrieval
      const testMemory = await memoryService.saveMemory({
        user_id: user?.id || '',
        session_id: `consistency-test-${Date.now()}`,
        memory_type: 'interaction',
        memory_data: {
          test_type: 'consistency_check',
          timestamp: new Date().toISOString(),
          test_content: 'Testing memory consistency and AI recall'
        },
        context_summary: 'Consistency test memory',
        importance_score: 8
      });

      // Wait a moment then try to retrieve
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const retrievedMemories = await memoryService.searchMemories('consistency_check', 3);
      
      setTestResults({
        memoryTest: {
          created: !!testMemory,
          retrieved: retrievedMemories.length > 0,
          memoryId: testMemory?.id,
          retrievedCount: retrievedMemories.length
        },
        timestamp: new Date()
      });
    } catch (error) {
      setTestResults({
        error: String(error),
        timestamp: new Date()
      });
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
            Memory & Blueprint Consistency Monitor
          </h2>
          <p className="text-gray-600 mt-1">
            Track AI memory, blueprint recognition, and system consistency in real-time
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="checks">Consistency Checks</TabsTrigger>
          <TabsTrigger value="interactive">Interactive Tests</TabsTrigger>
          <TabsTrigger value="debug">Debug Dashboard</TabsTrigger>
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
                  <Database className="h-4 w-4" />
                  Blueprint Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Loaded</span>
                    <Badge className={hasBlueprint ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {hasBlueprint ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Completeness</span>
                      <span>{blueprintValidation?.completionPercentage || 0}%</span>
                    </div>
                    <Progress value={blueprintValidation?.completionPercentage || 0} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  SoulSync Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Active</span>
                    <Badge className={isSoulSyncReady ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {isSoulSyncReady ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  {soulSyncError && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      {soulSyncError}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {memoryState && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Memory State Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{memoryState.recentMemoriesCount}</div>
                    <div className="text-sm text-gray-600">Recent Memories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{memoryState.conversationHistory}</div>
                    <div className="text-sm text-gray-600">Conversation History</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{memoryState.blueprintCompleteness}%</div>
                    <div className="text-sm text-gray-600">Blueprint Complete</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${memoryState.soulSyncReady ? 'text-green-600' : 'text-red-600'}`}>
                      {memoryState.soulSyncReady ? '✓' : '✗'}
                    </div>
                    <div className="text-sm text-gray-600">SoulSync Ready</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="checks" className="space-y-4">
          <div className="space-y-3">
            {checks.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
                        <pre className="text-xs bg-gray-50 p-2 rounded mt-2 overflow-auto">
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

        <TabsContent value="interactive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Memory Test</CardTitle>
              <p className="text-sm text-gray-600">
                Test memory creation, storage, and retrieval to verify consistency
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={runInteractiveTest}
                  disabled={isRunning || !user}
                  className="w-full"
                >
                  {isRunning ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Run Interactive Memory Test
                </Button>
                
                {testResults && (
                  <div className="bg-gray-50 p-4 rounded">
                    <h4 className="font-medium mb-2">Test Results</h4>
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(testResults, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debug" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">System State</CardTitle>
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
                    <span>Blueprint Status:</span>
                    <span>{blueprintStatus.summary}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Blueprint Validation</CardTitle>
              </CardHeader>
              <CardContent>
                {blueprintValidation?.missingFields && (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-600">Missing Fields:</div>
                    <div className="space-y-1">
                      {blueprintValidation.missingFields.map((field, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
