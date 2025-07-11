import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Loader2, Play, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FunctionTest {
  name: string;
  functionName: string;
  testData: any;
  description: string;
  expectedFields?: string[];
}

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  response?: any;
  error?: string;
  duration?: number;
}

export const FunctionTester: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const { toast } = useToast();

  const functionTests: FunctionTest[] = [
    {
      name: 'AI Coach',
      functionName: 'ai-coach',
      description: 'Tests the main AI coaching function',
      testData: {
        message: 'Hello, this is a test message',
        mode: 'guide',
        context: {}
      },
      expectedFields: ['response']
    },
    {
      name: 'AI Coach Stream',
      functionName: 'ai-coach-stream',
      description: 'Tests the streaming AI coach function',
      testData: {
        message: 'Test streaming response',
        mode: 'guide'
      }
    },
    {
      name: 'Blueprint Calculator',
      functionName: 'blueprint-calculator',
      description: 'Tests blueprint calculation functionality',
      testData: {
        birthData: {
          date: '1990-01-15',
          time: '14:30',
          location: { lat: 40.7128, lng: -74.0060 }
        }
      },
      expectedFields: ['blueprint']
    },
    {
      name: 'Personality Report',
      functionName: 'generate-personality-report',
      description: 'Tests personality report generation',
      testData: {
        blueprintData: {
          cognition_mbti: { type: 'ENFP' },
          energy_strategy_human_design: { type: 'Generator' }
        }
      },
      expectedFields: ['report']
    },
    {
      name: 'HACS Authentic Insights',
      functionName: 'hacs-authentic-insights',
      description: 'Tests HACS authentic insights generation',
      testData: {
        userId: 'test-user-id',
        context: 'productivity'
      },
      expectedFields: ['insights']
    },
    {
      name: 'HACS Autonomous Text',
      functionName: 'hacs-autonomous-text',
      description: 'Tests HACS autonomous text generation',
      testData: {
        prompt: 'Generate autonomous response',
        context: {}
      },
      expectedFields: ['text']
    },
    {
      name: 'HACS Intelligent Conversation',
      functionName: 'hacs-intelligent-conversation',
      description: 'Tests HACS intelligent conversation system',
      testData: {
        message: 'Test conversation message',
        conversationHistory: []
      },
      expectedFields: ['response']
    },
    {
      name: 'HACS Response Analysis',
      functionName: 'hacs-response-analysis',
      description: 'Tests HACS response analysis',
      testData: {
        userResponse: 'I feel great today',
        context: 'mood_check'
      },
      expectedFields: ['analysis']
    },
    {
      name: 'OpenAI Agent',
      functionName: 'openai-agent',
      description: 'Tests OpenAI agent functionality',
      testData: {
        prompt: 'Test OpenAI integration',
        model: 'gpt-4o-mini'
      },
      expectedFields: ['response']
    },
    {
      name: 'OpenAI Embeddings',
      functionName: 'openai-embeddings',
      description: 'Tests OpenAI embeddings generation',
      testData: {
        text: 'This is a test text for embeddings'
      },
      expectedFields: ['embeddings']
    },
    {
      name: 'Test Ephemeris',
      functionName: 'test-ephemeris',
      description: 'Tests astrological ephemeris calculations',
      testData: {
        date: '2024-01-15',
        latitude: 40.7128,
        longitude: -74.0060
      },
      expectedFields: ['ephemeris']
    }
  ];

  const runSingleTest = async (test: FunctionTest): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      console.log(`🧪 Testing ${test.name}...`);
      
      const { data, error } = await supabase.functions.invoke(test.functionName, {
        body: test.testData
      });

      const duration = Date.now() - startTime;

      if (error) {
        return {
          name: test.name,
          status: 'error',
          error: error.message || 'Unknown error',
          duration
        };
      }

      // Check if expected fields are present
      if (test.expectedFields) {
        const missingFields = test.expectedFields.filter(field => !(field in (data || {})));
        if (missingFields.length > 0) {
          return {
            name: test.name,
            status: 'error',
            error: `Missing expected fields: ${missingFields.join(', ')}`,
            response: data,
            duration
          };
        }
      }

      return {
        name: test.name,
        status: 'success',
        response: data,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        name: test.name,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    // Initialize all tests as pending
    const initialResults = functionTests.map(test => ({
      name: test.name,
      status: 'pending' as const
    }));
    setTestResults(initialResults);

    let successCount = 0;
    const results: TestResult[] = [];

    for (const test of functionTests) {
      setCurrentTest(test.name);
      
      // Update test status to running
      setTestResults(prev => prev.map(result => 
        result.name === test.name 
          ? { ...result, status: 'running' as const }
          : result
      ));

      const result = await runSingleTest(test);
      results.push(result);

      if (result.status === 'success') {
        successCount++;
      }

      // Update test result
      setTestResults(prev => prev.map(r => 
        r.name === test.name ? result : r
      ));

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setCurrentTest(null);
    setIsRunning(false);

    // Show summary toast
    toast({
      title: "Function Tests Complete",
      description: `${successCount}/${functionTests.length} functions passed tests`,
    });
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
      case 'running':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      pending: 'secondary',
      running: 'default',
      success: 'default',
      error: 'destructive'
    } as const;

    const colors = {
      pending: 'bg-gray-100 text-gray-600',
      running: 'bg-blue-100 text-blue-600',
      success: 'bg-green-100 text-green-600',
      error: 'bg-red-100 text-red-600'
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const successCount = testResults.filter(r => r.status === 'success').length;
  const errorCount = testResults.filter(r => r.status === 'error').length;
  const progress = testResults.length > 0 ? ((successCount + errorCount) / testResults.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Edge Function Test Suite</CardTitle>
              <p className="text-muted-foreground mt-2">
                Automatically test all Supabase Edge Functions to verify they're working correctly
              </p>
            </div>
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="bg-soul-purple hover:bg-soul-purple/90"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run All Tests
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {testResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Progress: {successCount + errorCount}/{functionTests.length} tests completed</span>
                <span className="text-green-600">{successCount} passed</span>
                <span className="text-red-600">{errorCount} failed</span>
              </div>
              <Progress value={progress} className="h-2" />
              {currentTest && (
                <p className="text-sm text-muted-foreground">
                  Currently testing: <span className="font-medium">{currentTest}</span>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      <div className="grid gap-4">
        {testResults.length > 0 ? (
          testResults.map((result, index) => {
            const test = functionTests[index];
            return (
              <Card key={result.name}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <CardTitle className="text-lg">{result.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{test.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.duration && (
                        <span className="text-sm text-muted-foreground">
                          {result.duration}ms
                        </span>
                      )}
                      {getStatusBadge(result.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="font-medium">Function:</span> <code className="bg-gray-100 px-1 rounded">{test.functionName}</code>
                    </div>
                    
                    {result.error && (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <span className="font-medium text-red-700">Error:</span>
                        <p className="text-red-600 mt-1">{result.error}</p>
                      </div>
                    )}
                    
                    {result.response && (
                      <details className="bg-gray-50 border rounded p-3">
                        <summary className="font-medium cursor-pointer">Response Data</summary>
                        <pre className="text-xs mt-2 overflow-auto max-h-32">
                          {JSON.stringify(result.response, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <RefreshCw className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No tests run yet. Click "Run All Tests" to start testing your Edge Functions.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};