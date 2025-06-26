
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AutomatedTestRunner } from '@/components/debug/AutomatedTestRunner';
import SystemHealthMonitor from '@/components/debug/SystemHealthMonitor';
import { PerformanceMonitor } from '@/components/debug/PerformanceMonitor';
import { GrowthProgramTestRunner } from '@/components/testing/GrowthProgramTestRunner';
import { TestTube, Activity, Gauge, Sprout, Database, Zap } from 'lucide-react';

const TestEnvironmentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('growth-program');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
          <TestTube className="h-8 w-8 text-soul-purple" />
          SoulSync Test Environment
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive testing suite for all SoulSync features and integrations. 
          Run end-to-end tests with live data to validate system functionality.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="growth-program" className="flex items-center gap-2">
            <Sprout className="h-4 w-4" />
            Growth Program
          </TabsTrigger>
          <TabsTrigger value="automated" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Automated Tests
          </TabsTrigger>
          <TabsTrigger value="system-health" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            System Health
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="growth-program" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sprout className="h-5 w-5 text-soul-purple" />
                    Growth Program End-to-End Testing
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Comprehensive testing of the Growth Program feature including blueprint integration, 
                    program creation, AI coach interactions, and progress tracking with live data.
                  </p>
                </div>
                <Badge variant="outline" className="text-soul-purple">
                  Live Data Tests
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <GrowthProgramTestRunner />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automated" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                Automated Test Suite
              </CardTitle>
              <p className="text-muted-foreground">
                Core system functionality tests including memory persistence, 
                data integrity, and service integrations.
              </p>
            </CardHeader>
            <CardContent>
              <AutomatedTestRunner />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system-health" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                System Health Monitor
              </CardTitle>
              <p className="text-muted-foreground">
                Real-time monitoring of system components, database connections, 
                and service availability.
              </p>
            </CardHeader>
            <CardContent>
              <SystemHealthMonitor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-orange-600" />
                Performance Monitor
              </CardTitle>
              <p className="text-muted-foreground">
                Performance metrics, response times, and system resource utilization monitoring.
              </p>
            </CardHeader>
            <CardContent>
              <PerformanceMonitor />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-soul-purple" />
            Test Environment Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Sprout className="h-4 w-4 text-soul-purple" />
                Live Data Testing
              </h3>
              <p className="text-sm text-muted-foreground">
                Tests run against real user data and live database connections
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-600" />
                Service Integration
              </h3>
              <p className="text-sm text-muted-foreground">
                Validates all service integrations and data flow
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600" />
                Real-time Monitoring
              </h3>
              <p className="text-sm text-muted-foreground">
                Continuous health checks and performance tracking
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Gauge className="h-4 w-4 text-orange-600" />
                Performance Metrics
              </h3>
              <p className="text-sm text-muted-foreground">
                Detailed performance analysis and optimization insights
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestEnvironmentPage;
