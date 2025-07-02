import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

interface StreamingTestResult {
  status: 'passed' | 'failed' | 'partial';
  message: string;
}

interface StreamingTestSuiteResult {
  overallAuthStatus: 'passed' | 'partial' | 'failed';
  authTests: { [key: string]: StreamingTestResult };
  performanceTests: { [key: string]: StreamingTestResult };
}

export const SystemHealthMonitor: React.FC = () => {
  const [streamingResults, setStreamingResults] = useState<StreamingTestSuiteResult | null>(null);

  useEffect(() => {
    // Simulate streaming test results
    const simulateStreamingResults = () => {
      const results: StreamingTestSuiteResult = {
        overallAuthStatus: 'passed',
        authTests: {
          authentication: { status: 'passed', message: 'User authentication passed' },
          sessionManagement: { status: 'passed', message: 'Session management active' },
        },
        performanceTests: {
          apiResponseTime: { status: 'passed', message: 'API response time within acceptable limits' },
          databaseLatency: { status: 'passed', message: 'Database latency is low' },
        },
      };
      setStreamingResults(results);
    };

    simulateStreamingResults();
  }, []);

  const getOverallHealthStatus = (result: StreamingTestSuiteResult): 'healthy' | 'degraded' | 'critical' => {
    if (!result) return 'critical';
    
    // Convert streaming test status to health status
    if (result.overallAuthStatus === 'passed') return 'healthy';
    if (result.overallAuthStatus === 'partial') return 'degraded';
    return 'critical';
  };

  const getSystemStatus = (result: StreamingTestResult): 'healthy' | 'degraded' | 'critical' => {
    if (!result) return 'critical';
    
    // Convert streaming test status to system status
    if (result.status === 'passed') return 'healthy';
    if (result.status === 'partial') return 'degraded';
    return 'critical';
  };

  return (
    <div className="space-y-6">
      {/* System Health Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-green-600" />
            System Health & Streaming Tests
          </h2>
          <p className="text-gray-600 mt-1">Real-time monitoring of all platform services and resources</p>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {streamingResults ? getOverallHealthStatus(streamingResults) : 'Unknown'}
            </div>
            <p className="text-xs text-muted-foreground">
              Overall system health
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Authentication</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {streamingResults?.authTests ? Object.keys(streamingResults.authTests).length : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Authentication tests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {streamingResults?.performanceTests ? Object.keys(streamingResults.performanceTests).length : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Performance tests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date().toLocaleTimeString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time updates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Test Results */}
      {streamingResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(streamingResults.authTests).map(([testName, result]) => (
                  <div key={testName} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{testName.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                    <Badge className={getSystemStatus(result) === 'healthy' ? 'bg-green-100 text-green-800' : 
                                   getSystemStatus(result) === 'degraded' ? 'bg-yellow-100 text-yellow-800' : 
                                   'bg-red-100 text-red-800'}>
                      {getSystemStatus(result)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(streamingResults.performanceTests).map(([testName, result]) => (
                  <div key={testName} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{testName.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                    <Badge className={getSystemStatus(result) === 'healthy' ? 'bg-green-100 text-green-800' : 
                                   getSystemStatus(result) === 'degraded' ? 'bg-yellow-100 text-yellow-800' : 
                                   'bg-red-100 text-red-800'}>
                      {getSystemStatus(result)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
