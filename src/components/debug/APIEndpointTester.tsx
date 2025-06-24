
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface APITest {
  name: string;
  description: string;
  status: 'pending' | 'testing' | 'passed' | 'failed';
  details?: string;
  responseTime?: number;
  endpoint: string;
  method: string;
}

export const APIEndpointTester: React.FC = () => {
  const [tests, setTests] = useState<APITest[]>([
    {
      name: 'AI Coach Edge Function',
      description: 'Test AI conversation endpoint functionality',
      status: 'pending',
      endpoint: 'ai-coach',
      method: 'POST'
    },
    {
      name: 'Blueprint Calculator Function',
      description: 'Test blueprint generation endpoint',
      status: 'pending',
      endpoint: 'blueprint-calculator',
      method: 'POST'
    },
    {
      name: 'Supabase Auth API',
      description: 'Test authentication service endpoints',
      status: 'pending',
      endpoint: 'auth',
      method: 'GET'
    },
    {
      name: 'Supabase Database API',
      description: 'Test database REST API endpoints',
      status: 'pending',
      endpoint: 'database',
      method: 'GET'
    },
    {
      name: 'Real-time WebSocket Connection',
      description: 'Test real-time subscription capabilities',
      status: 'pending',
      endpoint: 'realtime',
      method: 'WS'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [apiHealth, setApiHealth] = useState<{
    overallHealth: number;
    workingEndpoints: number;
    failingEndpoints: number;
    averageResponseTime: number;
    criticalIssues: number;
  }>({ 
    overallHealth: 0, 
    workingEndpoints: 0, 
    failingEndpoints: 0, 
    averageResponseTime: 0,
    criticalIssues: 0
  });

  const { user } = useAuth();

  const runAPITests = async () => {
    if (!user) {
      console.log('❌ No authenticated user for API testing');
      return;
    }

    setIsRunning(true);
    console.log('🌐 Starting API endpoint tests');

    const updatedTests = [...tests];
    const responseTimes: number[] = [];
    let workingEndpoints = 0;
    let failingEndpoints = 0;
    let criticalIssues = 0;

    for (let i = 0; i < updatedTests.length; i++) {
      updatedTests[i].status = 'testing';
      setTests([...updatedTests]);

      try {
        const startTime = Date.now();
        let testResult = false;
        let details = '';

        switch (updatedTests[i].endpoint) {
          case 'ai-coach':
            testResult = await testAICoachEndpoint();
            details = testResult ? 'AI Coach endpoint responding correctly' : 'AI Coach endpoint issues detected';
            break;

          case 'blueprint-calculator':
            testResult = await testBlueprintCalculatorEndpoint();
            details = testResult ? 'Blueprint calculator endpoint working' : 'Blueprint calculator endpoint failed';
            break;

          case 'auth':
            testResult = await testAuthAPI();
            details = testResult ? 'Authentication API functioning correctly' : 'Authentication API has issues';
            break;

          case 'database':
            testResult = await testDatabaseAPI();
            details = testResult ? 'Database API endpoints working' : 'Database API endpoints failing';
            break;

          case 'realtime':
            testResult = await testRealtimeConnection();
            details = testResult ? 'Real-time connection established successfully' : 'Real-time connection failed';
            break;
        }

        const responseTime = Date.now() - startTime;
        responseTimes.push(responseTime);
        
        updatedTests[i].status = testResult ? 'passed' : 'failed';
        updatedTests[i].details = details;
        updatedTests[i].responseTime = responseTime;

        if (testResult) workingEndpoints++;
        else {
          failingEndpoints++;
          if (['ai-coach', 'auth', 'database'].includes(updatedTests[i].endpoint)) {
            criticalIssues++;
          }
        }

      } catch (error) {
        console.error(`❌ API test failed: ${updatedTests[i].name}`, error);
        updatedTests[i].status = 'failed';
        updatedTests[i].details = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        updatedTests[i].responseTime = Date.now();
        failingEndpoints++;
        criticalIssues++;
      }

      setTests([...updatedTests]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Calculate API health metrics
    const totalTests = updatedTests.length;
    const overallHealth = Math.round((workingEndpoints / totalTests) * 100);
    const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

    setApiHealth({
      overallHealth,
      workingEndpoints,
      failingEndpoints,
      averageResponseTime: Math.round(averageResponseTime),
      criticalIssues
    });

    setIsRunning(false);
    console.log('✅ API endpoint tests completed');
  };

  const testAICoachEndpoint = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          message: 'Test API endpoint connectivity',
          sessionId: `api-test-${Date.now()}`,
          usePersona: false,
          agentType: 'guide',
          language: 'en'
        }
      });

      if (error) {
        console.error('AI Coach endpoint test error:', error);
        return false;
      }

      return data && typeof data === 'object';
    } catch (error) {
      console.error('AI Coach endpoint test error:', error);
      return false;
    }
  };

  const testBlueprintCalculatorEndpoint = async (): Promise<boolean> => {
    try {
      // Test blueprint calculator with minimal data
      const testProfile = {
        full_name: "API Test User",
        birth_date: "1990-01-01",
        birth_time_local: "12:00",
        birth_location: "New York, NY",
        timezone: "America/New_York"
      };

      const { data, error } = await supabase.functions.invoke('blueprint-calculator', {
        body: {
          userProfile: testProfile,
          skipValidation: true // For testing purposes
        }
      });

      if (error) {
        console.error('Blueprint calculator endpoint test error:', error);
        return false;
      }

      return data && typeof data === 'object';
    } catch (error) {
      console.error('Blueprint calculator endpoint test error:', error);
      return false;
    }
  };

  const testAuthAPI = async (): Promise<boolean> => {
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Auth API test error:', error);
        return false;
      }

      // Test session validity
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      return !sessionError && authUser && session;
    } catch (error) {
      console.error('Auth API test error:', error);
      return false;
    }
  };

  const testDatabaseAPI = async (): Promise<boolean> => {
    try {
      // Test basic database connectivity
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user!.id)
        .limit(1);

      if (error) {
        console.error('Database API test error:', error);
        return false;
      }

      // Test another table to ensure general connectivity
      const { error: blueprintError } = await supabase
        .from('user_blueprints')
        .select('id')
        .eq('user_id', user!.id)
        .limit(1);

      return !blueprintError;
    } catch (error) {
      console.error('Database API test error:', error);
      return false;
    }
  };

  const testRealtimeConnection = async (): Promise<boolean> => {
    try {
      return new Promise((resolve) => {
        const channel = supabase.channel(`api-test-${Date.now()}`);
        
        const timeout = setTimeout(() => {
          supabase.removeChannel(channel);
          resolve(false);
        }, 5000);

        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            clearTimeout(timeout);
            supabase.removeChannel(channel);
            resolve(true);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            clearTimeout(timeout);
            supabase.removeChannel(channel);
            resolve(false);
          }
        });
      });
    } catch (error) {
      console.error('Realtime connection test error:', error);
      return false;
    }
  };

  const resetTests = () => {
    setTests(tests.map(test => ({ 
      ...test, 
      status: 'pending', 
      details: undefined, 
      responseTime: undefined 
    })));
    setApiHealth({ 
      overallHealth: 0, 
      workingEndpoints: 0, 
      failingEndpoints: 0, 
      averageResponseTime: 0,
      criticalIssues: 0
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

  const getMethodBadgeColor = (method: string) => {
    switch (method) {
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'GET': return 'bg-green-100 text-green-800';
      case 'WS': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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
            <Globe className="h-5 w-5" />
            API Endpoint Testing
          </CardTitle>
          <div className="flex gap-4 text-sm">
            <span>Working: <Badge className="bg-green-100 text-green-800">{passedTests}/{totalTests}</Badge></span>
            <span>Failing: <Badge className="bg-red-100 text-red-800">{failedTests}/{totalTests}</Badge></span>
            <span>API Health: <Badge>{apiHealth.overallHealth}%</Badge></span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runAPITests} 
              disabled={isRunning || !user}
              className="flex items-center gap-2"
            >
              {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
              {isRunning ? 'Testing APIs...' : 'Run API Tests'}
            </Button>
            <Button variant="outline" onClick={resetTests} disabled={isRunning}>
              Reset Tests
            </Button>
          </div>

          {apiHealth.overallHealth > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">API Health Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{apiHealth.overallHealth}%</div>
                    <div className="text-sm text-gray-600">Overall Health</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{apiHealth.workingEndpoints}</div>
                    <div className="text-sm text-gray-600">Working</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{apiHealth.failingEndpoints}</div>
                    <div className="text-sm text-gray-600">Failing</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{apiHealth.criticalIssues}</div>
                    <div className="text-sm text-gray-600">Critical Issues</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{apiHealth.averageResponseTime}ms</div>
                    <div className="text-sm text-gray-600">Avg Response</div>
                  </div>
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
                    <Badge className={getMethodBadgeColor(test.method)}>
                      {test.method}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{test.endpoint}</Badge>
                    {test.responseTime && (
                      <Badge variant="outline">{test.responseTime}ms</Badge>
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
