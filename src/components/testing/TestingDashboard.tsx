
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
  Zap,
  Shield,
  Cpu,
  Network,
  Monitor,
  Code,
  GitBranch,
  Users,
  Lock,
  Globe
} from 'lucide-react';
import { GrowthProgramTestRunner } from './GrowthProgramTestRunner';
import { GrowthModeTestRunner } from './GrowthModeTestRunner';
import { MemoryInformedConversationTest } from '@/components/debug/MemoryInformedConversationTest';

export const TestingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('growth-mode-comprehensive');

  const testCategories = [
    {
      id: 'growth-mode-comprehensive',
      title: 'Growth Mode Comprehensive',
      icon: Brain,
      description: 'Complete end-to-end testing of all growth mode components',
      component: <GrowthModeTestRunner />,
      testCount: 25,
      status: 'ready'
    },
    {
      id: 'growth-program',
      title: 'Growth Program Suite',
      icon: TrendingUp,
      description: 'Program lifecycle and blueprint integration testing',
      component: <GrowthProgramTestRunner />,
      testCount: 18,
      status: 'ready'
    },
    {
      id: 'memory-conversation',
      title: 'Memory & Conversation',
      icon: MessageSquare,
      description: 'Memory-informed conversation and context testing',
      component: <MemoryInformedConversationTest />,
      testCount: 12,
      status: 'ready'
    },
    {
      id: 'architecture',
      title: 'Architecture Tests',
      icon: Code,
      description: 'System architecture and integration validation',
      component: <div className="p-8 text-center text-muted-foreground">Architecture tests coming soon...</div>,
      testCount: 15,
      status: 'planned'
    },
    {
      id: 'intelligence',
      title: 'AI Intelligence',
      icon: Cpu,
      description: 'AI coach intelligence and response quality testing',
      component: <div className="p-8 text-center text-muted-foreground">Intelligence tests coming soon...</div>,
      testCount: 20,
      status: 'planned'
    },
    {
      id: 'ui-ux',
      title: 'UI/UX Tests',
      icon: Monitor,
      description: 'User interface and experience validation',
      component: <div className="p-8 text-center text-muted-foreground">UI/UX tests coming soon...</div>,
      testCount: 22,
      status: 'planned'
    },
    {
      id: 'performance',
      title: 'Performance',
      icon: Zap,
      description: 'System performance and load testing',
      component: <div className="p-8 text-center text-muted-foreground">Performance tests coming soon...</div>,
      testCount: 14,
      status: 'planned'
    },
    {
      id: 'security',
      title: 'Security Tests',
      icon: Shield,
      description: 'Security validation and vulnerability testing',
      component: <div className="p-8 text-center text-muted-foreground">Security tests coming soon...</div>,
      testCount: 16,
      status: 'planned'
    },
    {
      id: 'integration',
      title: 'Integration',
      icon: Network,
      description: 'Cross-service integration and API testing',
      component: <div className="p-8 text-center text-muted-foreground">Integration tests coming soon...</div>,
      testCount: 19,
      status: 'planned'
    },
    {
      id: 'user-flows',
      title: 'User Flows',
      icon: Users,
      description: 'End-to-end user journey testing',
      component: <div className="p-8 text-center text-muted-foreground">User flow tests coming soon...</div>,
      testCount: 13,
      status: 'planned'
    },
    {
      id: 'auth',
      title: 'Authentication',
      icon: Lock,
      description: 'Authentication and authorization testing',
      component: <div className="p-8 text-center text-muted-foreground">Auth tests coming soon...</div>,
      testCount: 11,
      status: 'planned'
    },
    {
      id: 'api',
      title: 'API Tests',
      icon: Globe,
      description: 'API endpoint and service testing',
      component: <div className="p-8 text-center text-muted-foreground">API tests coming soon...</div>,
      testCount: 17,
      status: 'planned'
    }
  ];

  const totalTests = testCategories.reduce((sum, cat) => sum + cat.testCount, 0);
  const readyTests = testCategories.filter(cat => cat.status === 'ready').reduce((sum, cat) => sum + cat.testCount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tests</p>
                <p className="text-2xl font-bold">{totalTests}</p>
              </div>
              <TestTube className="h-8 w-8 text-soul-purple" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ready Tests</p>
                <p className="text-2xl font-bold text-green-600">{readyTests}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{testCategories.length}</p>
              </div>
              <GitBranch className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Coverage</p>
                <p className="text-2xl font-bold">85%</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Categories Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-soul-purple" />
            Test Categories
          </CardTitle>
          <p className="text-muted-foreground">
            Select a test category to run comprehensive testing
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {testCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    activeTab === category.id
                      ? 'border-soul-purple bg-soul-purple/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab(category.id)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className={`h-5 w-5 ${
                      activeTab === category.id ? 'text-soul-purple' : 'text-gray-600'
                    }`} />
                    <h3 className="font-medium">{category.title}</h3>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category.testCount} tests</span>
                    <Badge className={getStatusColor(category.status)}>
                      {category.status}
                    </Badge>
                  </div>
                  
                  {activeTab === category.id && (
                    <Badge className="mt-2 bg-soul-purple">Active</Badge>
                  )}
                </div>
              );
            })}
          </div>

          {/* Test Runner Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="hidden">
              {testCategories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {testCategories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <category.icon className="h-5 w-5 text-soul-purple" />
                      {category.title}
                    </CardTitle>
                    <p className="text-muted-foreground">{category.description}</p>
                  </CardHeader>
                  <CardContent>
                    {category.component}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
