
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  TestTube, 
  Brain, 
  Database, 
  MessageSquare, 
  Activity,
  TrendingUp,
  Zap
} from 'lucide-react';
import { GrowthProgramTestRunner } from './GrowthProgramTestRunner';
import { GrowthModeTestRunner } from './GrowthModeTestRunner';
import { MemoryInformedConversationTest } from '@/components/debug/MemoryInformedConversationTest';

export const TestingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('growth-mode');

  const testSuites = [
    {
      id: 'growth-mode',
      title: 'Growth Mode Comprehensive',
      icon: Brain,
      description: 'Complete testing of all growth mode components',
      component: <GrowthModeTestRunner />
    },
    {
      id: 'growth-program',
      title: 'Growth Program Suite',
      icon: TrendingUp,
      description: 'End-to-end growth program testing',
      component: <GrowthProgramTestRunner />
    },
    {
      id: 'memory-conversation',
      title: 'Memory & Conversation',
      icon: MessageSquare,
      description: 'Memory-informed conversation testing',
      component: <MemoryInformedConversationTest />
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-soul-purple" />
            SoulSync Testing Dashboard
          </CardTitle>
          <p className="text-muted-foreground">
            Comprehensive testing environment for all growth mode components and integrations
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {testSuites.map((suite) => {
              const Icon = suite.icon;
              return (
                <div
                  key={suite.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    activeTab === suite.id
                      ? 'border-soul-purple bg-soul-purple/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab(suite.id)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`h-5 w-5 ${
                      activeTab === suite.id ? 'text-soul-purple' : 'text-gray-600'
                    }`} />
                    <h3 className="font-medium">{suite.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{suite.description}</p>
                  {activeTab === suite.id && (
                    <Badge className="mt-2 bg-soul-purple">Active</Badge>
                  )}
                </div>
              );
            })}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="hidden">
              {testSuites.map((suite) => (
                <TabsTrigger key={suite.id} value={suite.id}>
                  {suite.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {testSuites.map((suite) => (
              <TabsContent key={suite.id} value={suite.id}>
                {suite.component}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
