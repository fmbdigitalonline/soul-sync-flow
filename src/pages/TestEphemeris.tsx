
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  success: boolean;
  message: string;
  test_results?: any;
  debug_info?: any;
  error?: string;
  timestamp?: string;
}

const TestEphemeris = () => {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      console.log("Running Swiss Ephemeris test...");
      
      const { data, error } = await supabase.functions.invoke('test-ephemeris');
      
      if (error) {
        console.error("Test error:", error);
        setTestResult({
          success: false,
          error: error.message,
          message: "Failed to run test"
        });
      } else {
        console.log("Test result:", data);
        setTestResult(data);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setTestResult({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        message: "Unexpected error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Swiss Ephemeris Test Environment</h1>
        <p className="text-muted-foreground">
          Test the Swiss Ephemeris configuration and debug any initialization issues.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>
            This test will call the Vercel API endpoint directly to check Swiss Ephemeris initialization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runTest} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Running Test..." : "Run Swiss Ephemeris Test"}
          </Button>
        </CardContent>
      </Card>

      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Test Results
              <Badge variant={testResult.success ? "default" : "destructive"}>
                {testResult.success ? "PASS" : "FAIL"}
              </Badge>
            </CardTitle>
            <CardDescription>
              {testResult.timestamp && `Executed at: ${new Date(testResult.timestamp).toLocaleString()}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                {testResult.message}
              </AlertDescription>
            </Alert>

            {testResult.error && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">Error Details:</h4>
                <pre className="text-sm text-red-700 whitespace-pre-wrap">{testResult.error}</pre>
              </div>
            )}

            {testResult.test_results && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Test Results:</h4>
                <pre className="text-sm text-blue-700 whitespace-pre-wrap">
                  {JSON.stringify(testResult.test_results, null, 2)}
                </pre>
              </div>
            )}

            {testResult.debug_info && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Debug Information:</h4>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(testResult.debug_info, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Direct API Test</CardTitle>
          <CardDescription>
            You can also test the API directly by visiting this URL:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-3 rounded font-mono text-sm">
            https://qxaajirrqrcnmvtowjbg.supabase.co/functions/v1/test-ephemeris
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This will return JSON with detailed test results and debug information.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestEphemeris;
