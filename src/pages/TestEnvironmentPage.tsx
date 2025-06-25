import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge';
import PersonalityTestRunner from '@/components/debug/PersonalityTestRunner';
import BlueprintValidator from '@/components/debug/BlueprintValidator';
import LayerSynchronizationTester from '@/components/debug/LayerSynchronizationTester';
import PersonalityConsistencyTester from '@/components/debug/PersonalityConsistencyTester';
import MemorySystemTester from '@/components/debug/MemorySystemTester';
import ConversationContextTester from '@/components/debug/ConversationContextTester';
import { GracefulDegradationTester } from '@/components/debug/GracefulDegradationTester';
import { MemoryFailureRecoveryTester } from '@/components/debug/MemoryFailureRecoveryTester';
import { LayerActivationConflictTester } from '@/components/debug/LayerActivationConflictTester';
import { FallbackMechanismValidator } from '@/components/debug/FallbackMechanismValidator';
import PerformanceMonitor from '@/components/debug/PerformanceMonitor';
import { CrossServiceIntegrationTester } from '@/components/debug/CrossServiceIntegrationTester';
import { DatabaseHealthTester } from '@/components/debug/DatabaseHealthTester';
import { APIEndpointTester } from '@/components/debug/APIEndpointTester';

const TestEnvironmentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('personality-tests');

  const testCategories = [
    {
      id: 'personality-tests',
      name: 'Personality Tests',
      count: '16 tests',
      description: 'Core personality system validation'
    },
    {
      id: 'memory-tests', 
      name: 'Memory Tests',
      count: '8 tests',
      description: 'Memory system functionality'
    },
    {
      id: 'integration-tests',
      name: 'System Integration',
      count: '14 tests', 
      description: 'Cross-service integrations'
    },
    {
      id: 'error-handling',
      name: 'Error Handling',
      count: '19 tests',
      description: 'Edge cases and failure recovery'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personality-tests':
        return (
          <div className="space-y-8">
            <PersonalityTestRunner />
            <BlueprintValidator />
            <LayerSynchronizationTester />
            <PersonalityConsistencyTester />
          </div>
        );

      case 'memory-tests':
        return (
          <div className="space-y-8">
            <MemorySystemTester />
            <ConversationContextTester />
            <PerformanceMonitor />
          </div>
        );

      case 'integration-tests':
        return (
          <div className="space-y-8">
            <CrossServiceIntegrationTester />
            <DatabaseHealthTester />
            <APIEndpointTester />
          </div>
        );

      case 'error-handling':
        return (
          <div className="space-y-8">
            <GracefulDegradationTester />
            <MemoryFailureRecoveryTester />
            <LayerActivationConflictTester />
            <FallbackMechanismValidator />
          </div>
        );

      default:
        return <div>Select a test category</div>;
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Test Environment</CardTitle>
          <p className="text-gray-500">Run various tests to validate system functionality</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="personality-tests" className="space-y-4">
            <TabsList>
              {testCategories.map(category => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  onClick={() => setActiveTab(category.id)}
                  className="data-[state=active]:bg-muted data-[state=active]:text-foreground"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {testCategories.map(category => (
              <TabsContent key={category.id} value={category.id}>
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </div>
                    <Badge variant="secondary">{category.count}</Badge>
                  </div>
                  {renderTabContent()}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestEnvironmentPage;
