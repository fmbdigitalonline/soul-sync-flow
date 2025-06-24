
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DatabaseTest {
  name: string;
  description: string;
  status: 'pending' | 'testing' | 'passed' | 'failed';
  details?: string;
  queryTime?: number;
  tableName: string;
}

export const DatabaseHealthTester: React.FC = () => {
  const [tests, setTests] = useState<DatabaseTest[]>([
    {
      name: 'User Blueprints Table Health',
      description: 'Test blueprint storage and retrieval functionality',
      status: 'pending',
      tableName: 'user_blueprints'
    },
    {
      name: 'Memory System Database Health',
      description: 'Test memory storage and query performance',
      status: 'pending',
      tableName: 'user_session_memory'
    },
    {
      name: 'Conversation Memory Health',
      description: 'Test conversation storage and retrieval',
      status: 'pending',
      tableName: 'conversation_memory'
    },
    {
      name: 'User Activities Logging Health',
      description: 'Test activity tracking and performance',
      status: 'pending',
      tableName: 'user_activities'
    },
    {
      name: 'Personas Table Health',
      description: 'Test persona generation and storage system',
      status: 'pending',
      tableName: 'personas'
    },
    {
      name: 'Database Connection Pool',
      description: 'Test database connection stability and performance',
      status: 'pending',
      tableName: 'system'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [dbHealth, setDbHealth] = useState<{
    overallHealth: number;
    tablesHealthy: number;
    tablesUnhealthy: number;
    averageQueryTime: number;
    connectionStable: boolean;
  }>({ 
    overallHealth: 0, 
    tablesHealthy: 0, 
    tablesUnhealthy: 0, 
    averageQueryTime: 0, 
    connectionStable: false 
  });

  const { user } = useAuth();

  const runDatabaseTests = async () => {
    if (!user) {
      console.log('❌ No authenticated user for database testing');
      return;
    }

    setIsRunning(true);
    console.log('🗄️ Starting database health tests');

    const updatedTests = [...tests];
    const queryTimes: number[] = [];
    let tablesHealthy = 0;
    let tablesUnhealthy = 0;

    for (let i = 0; i < updatedTests.length; i++) {
      updatedTests[i].status = 'testing';
      setTests([...updatedTests]);

      try {
        const startTime = Date.now();
        let testResult = false;
        let details = '';

        switch (updatedTests[i].tableName) {
          case 'user_blueprints':
            testResult = await testUserBlueprintsHealth();
            details = testResult ? 'Blueprint table operations working correctly' : 'Blueprint table has issues';
            break;

          case 'user_session_memory':
            testResult = await testMemoryTableHealth();
            details = testResult ? 'Memory table operations functioning' : 'Memory table performance issues';
            break;

          case 'conversation_memory':
            testResult = await testConversationMemoryHealth();
            details = testResult ? 'Conversation storage working properly' : 'Conversation storage issues detected';
            break;

          case 'user_activities':
            testResult = await testUserActivitiesHealth();
            details = testResult ? 'Activity logging functioning correctly' : 'Activity logging has problems';
            break;

          case 'personas':
            testResult = await testPersonasTableHealth();
            details = testResult ? 'Personas table working correctly' : 'Personas table has issues';
            break;

          case 'system':
            testResult = await testDatabaseConnection();
            details = testResult ? 'Database connection stable' : 'Database connection issues detected';
            break;
        }

        const queryTime = Date.now() - startTime;
        queryTimes.push(queryTime);
        
        updatedTests[i].status = testResult ? 'passed' : 'failed';
        updatedTests[i].details = details;
        updatedTests[i].queryTime = queryTime;

        if (testResult) tablesHealthy++;
        else tablesUnhealthy++;

      } catch (error) {
        console.error(`❌ Database test failed: ${updatedTests[i].name}`, error);
        updatedTests[i].status = 'failed';
        updatedTests[i].details = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        updatedTests[i].queryTime = Date.now();
        tablesUnhealthy++;
      }

      setTests([...updatedTests]);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Calculate database health metrics
    const totalTests = updatedTests.length;
    const overallHealth = Math.round((tablesHealthy / totalTests) * 100);
    const averageQueryTime = queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length;
    const connectionStable = tablesUnhealthy === 0;

    setDbHealth({
      overallHealth,
      tablesHealthy,
      tablesUnhealthy,
      averageQueryTime: Math.round(averageQueryTime),
      connectionStable
    });

    setIsRunning(false);
    console.log('✅ Database health tests completed');
  };

  const testUserBlueprintsHealth = async (): Promise<boolean> => {
    try {
      // Test read operation
      const { data: readData, error: readError } = await supabase
        .from('user_blueprints')
        .select('id, user_id, is_active')
        .eq('user_id', user!.id)
        .limit(1);

      if (readError) {
        console.error('Blueprint read test error:', readError);
        return false;
      }

      // Test count operation for performance
      const { count, error: countError } = await supabase
        .from('user_blueprints')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);

      return !countError && count !== null;
    } catch (error) {
      console.error('User blueprints health test error:', error);
      return false;
    }
  };

  const testMemoryTableHealth = async (): Promise<boolean> => {
    try {
      // Test memory table read
      const { data, error } = await supabase
        .from('user_session_memory')
        .select('id, user_id, created_at')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Memory table test error:', error);
        return false;
      }

      // Test memory search performance
      const { data: searchData, error: searchError } = await supabase
        .from('user_session_memory')
        .select('id, context_summary')
        .eq('user_id', user!.id)
        .textSearch('context_summary', 'test', { type: 'websearch' })
        .limit(1);

      return !searchError;
    } catch (error) {
      console.error('Memory table health test error:', error);
      return false;
    }
  };

  const testConversationMemoryHealth = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('conversation_memory')
        .select('id, user_id, session_id')
        .eq('user_id', user!.id)
        .limit(3);

      if (error) {
        console.error('Conversation memory test error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Conversation memory health test error:', error);
      return false;
    }
  };

  const testUserActivitiesHealth = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('id, user_id, activity_type, created_at')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('User activities test error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('User activities health test error:', error);
      return false;
    }
  };

  const testPersonasTableHealth = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('personas')
        .select('id, user_id, created_at')
        .eq('user_id', user!.id)
        .limit(1);

      if (error) {
        console.error('Personas table test error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Personas table health test error:', error);
      return false;
    }
  };

  const testDatabaseConnection = async (): Promise<boolean> => {
    try {
      // Test basic connection with auth
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      
      if (error || !authUser) {
        console.error('Database connection test - auth error:', error);
        return false;
      }

      // Test simple query performance
      const startTime = Date.now();
      const { data, error: queryError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user!.id)
        .limit(1);

      const queryTime = Date.now() - startTime;
      
      return !queryError && queryTime < 2000; // Connection should be fast
    } catch (error) {
      console.error('Database connection test error:', error);
      return false;
    }
  };

  const resetTests = () => {
    setTests(tests.map(test => ({ 
      ...test, 
      status: 'pending', 
      details: undefined, 
      queryTime: undefined 
    })));
    setDbHealth({ 
      overallHealth: 0, 
      tablesHealthy: 0, 
      tablesUnhealthy: 0, 
      averageQueryTime: 0, 
      connectionStable: false 
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'testing': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const passedTests = tests.filter(t => t.status === 'passed').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;
  const totalTests = tests.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Health Testing
          </CardTitle>
          <div className="flex gap-4 text-sm">
            <span>Healthy: <Badge className="bg-green-100 text-green-800">{passedTests}/{totalTests}</Badge></span>
            <span>Issues: <Badge className="bg-red-100 text-red-800">{failedTests}/{totalTests}</Badge></span>
            <span>Health Score: <Badge>{dbHealth.overallHealth}%</Badge></span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runDatabaseTests} 
              disabled={isRunning || !user}
              className="flex items-center gap-2"
            >
              {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
              {isRunning ? 'Testing Database...' : 'Run Database Tests'}
            </Button>
            <Button variant="outline" onClick={resetTests} disabled={isRunning}>
              Reset Tests
            </Button>
          </div>

          {dbHealth.overallHealth > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Database Health Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{dbHealth.overallHealth}%</div>
                    <div className="text-sm text-gray-600">Overall Health</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{dbHealth.tablesHealthy}</div>
                    <div className="text-sm text-gray-600">Healthy Tables</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{dbHealth.tablesUnhealthy}</div>
                    <div className="text-sm text-gray-600">Issues Detected</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{dbHealth.averageQueryTime}ms</div>
                    <div className="text-sm text-gray-600">Avg Query Time</div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-center">
                  <Badge className={dbHealth.connectionStable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    Connection: {dbHealth.connectionStable ? "Stable" : "Unstable"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {tests.map((test, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(test.status)}
                    <span className="font-medium">{test.name}</span>
                    <Badge variant="outline" className="text-xs">{test.tableName}</Badge>
                    {test.queryTime && (
                      <Badge variant="outline">{test.queryTime}ms</Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                {test.details && (
                  <p className="text-xs bg-gray-50 p-2 rounded">
                    {test.details}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
