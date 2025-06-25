import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity } from 'lucide-react';
import { PerformanceMonitor } from '@/components/debug/PerformanceMonitor';
import MemoryTestComponent from '@/components/debug/MemoryTestComponent';
import PersonalityTestComponent from '@/components/debug/PersonalityTestComponent';
import IntegrationTestComponent from '@/components/debug/IntegrationTestComponent';
import ErrorBoundaryTest from '@/components/debug/ErrorBoundaryTest';
import ArchitectureTestComponent from '@/components/debug/ArchitectureTestComponent';

import ResponseTimeLoadTester from '@/components/debug/ResponseTimeLoadTester';
import MemorySearchOptimizationTester from '@/components/debug/MemorySearchOptimizationTester';
import BlueprintProcessingSpeedTester from '@/components/debug/BlueprintProcessingSpeedTester';
import RealTimeMonitoringDashboard from '@/components/debug/RealTimeMonitoringDashboard';

interface TestComponentProps {
  name: string;
  component: React.FC;
  description: string;
  category: string;
  tooltip: string;
}

const TestEnvironmentPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('Architecture');

  const architectureTests = [
    {
      id: 'architecture-test',
      name: 'Architecture Tests',
      component: ArchitectureTestComponent,
      description: 'Validates core architectural components and data flow',
      category: 'Architecture',
      tooltip: 'Tests the integration and communication between key system components'
    },
    {
      id: 'error-boundary-test',
      name: 'Error Boundary Test',
      component: ErrorBoundaryTest,
      description: 'Tests the error handling capabilities of the system',
      category: 'Architecture',
      tooltip: 'Simulates errors to ensure the system gracefully handles unexpected issues'
    }
  ];

  const errorHandlingTests = [
    {
      id: 'error-boundary-test',
      name: 'Error Boundary Test',
      component: ErrorBoundaryTest,
      description: 'Tests the error handling capabilities of the system',
      category: 'Error Handling',
      tooltip: 'Simulates errors to ensure the system gracefully handles unexpected issues'
    }
  ];

  const performanceTests = [
    {
      id: 'response-time-load',
      name: 'Response Time Load Tester',
      component: ResponseTimeLoadTester,
      description: 'Tests system performance under various load conditions with real concurrent users',
      category: 'Performance & Scalability',
      tooltip: 'Simulates concurrent users performing real operations to measure response times, throughput, and system stability under load'
    },
    {
      id: 'memory-search-optimization',
      name: 'Memory Search Optimization',
      component: MemorySearchOptimizationTester,
      description: 'Validates memory retrieval performance and search strategy optimization',
      category: 'Performance & Scalability',
      tooltip: 'Tests progressive search strategies, index efficiency, and query optimization to ensure fast memory retrieval'
    },
    {
      id: 'blueprint-processing-speed',
      name: 'Blueprint Processing Speed',
      component: BlueprintProcessingSpeedTester,
      description: 'Measures blueprint conversion efficiency and personality engine processing speeds',
      category: 'Performance & Scalability',
      tooltip: 'Benchmarks personality blueprint processing, seven-layer conversion, and system prompt generation performance'
    },
    {
      id: 'realtime-monitoring-dashboard',
      name: 'Real-Time Monitoring Dashboard',
      component: RealTimeMonitoringDashboard,
      description: 'Centralized performance monitoring with real-time metrics and alerts',
      category: 'Performance & Scalability',
      tooltip: 'Provides comprehensive system health monitoring with real-time metrics, alerts, and performance insights'
    }
  ];

  const memoryTests = [
    {
      id: 'memory-test',
      name: 'Memory Tests',
      component: MemoryTestComponent,
      description: 'Tests memory persistence and retrieval',
      category: 'Memory',
      tooltip: 'Tests the saving, retrieval, and searching of user memories'
    },
    {
      id: 'performance-monitor',
      name: 'Performance Monitor',
      component: PerformanceMonitor,
      description: 'Monitors system performance metrics',
      category: 'Memory',
      tooltip: 'Displays real-time performance metrics for memory operations'
    }
  ];

  const personalityTests = [
    {
      id: 'personality-test',
      name: 'Personality Tests',
      component: PersonalityTestComponent,
      description: 'Tests personality blueprint processing',
      category: 'Personality',
      tooltip: 'Tests the processing and application of personality blueprints'
    }
  ];

  const integrationTests = [
    {
      id: 'integration-test',
      name: 'Integration Tests',
      component: IntegrationTestComponent,
      description: 'Tests integration between memory and personality services',
      category: 'Integration',
      tooltip: 'Tests the interaction between memory and personality services'
    }
  ];

  const allTests = [
    ...architectureTests,
    ...errorHandlingTests,
    ...performanceTests,
    ...memoryTests,
    ...personalityTests,
    ...integrationTests
  ];

  const testCategories = [...new Set(allTests.map((test) => test.category))];

  const filteredTests = allTests.filter((test) => test.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Test Environment</h1>
        <p className="text-gray-600">
          Select a category to run tests and monitor system performance.
        </p>
      </div>

      {/* Test Categories Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Test Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {testCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="text-xs h-8"
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.map((test) => (
          <Card key={test.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{test.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">{test.description}</p>
              <test.component />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TestEnvironmentPage;
