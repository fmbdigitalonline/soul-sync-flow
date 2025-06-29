
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  TestTube2, 
  Zap, 
  Brain, 
  FileText,
  Activity,
  Settings,
  Shield,
  CheckCircle
} from 'lucide-react';

// Import existing test components
import { GrowthModeTestRunner } from './GrowthModeTestRunner';
import { GrowthProgramTestRunner } from './GrowthProgramTestRunner';
import { VFPGraphTester } from '../personality/VFPGraphTester';
import { VFPGraphPatentTester } from './VFPGraphPatentTester';

export const TestingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('vfp-patent');

  const testCategories = [
    {
      id: 'vfp-patent',
      title: 'VFP-Graph Patent Validation',
      description: 'US Provisional Patent validation with real-time evidence collection (6 claims)',
      icon: Shield,
      status: 'production',
      priority: 'critical',
      testCount: 6,
      component: VFPGraphPatentTester
    },
    {
      id: 'vfp-graph',
      title: 'VFP-Graph Core Testing',
      description: 'Vector-Fusion Personality Graph component and integration testing',
      icon: Brain,
      status: 'production',
      priority: 'high',
      testCount: 12,
      component: VFPGraphTester
    },
    {
      id: 'growth-mode',
      title: 'Growth Mode Testing',
      description: 'Comprehensive growth program and coaching validation suite',
      icon: Activity,
      status: 'stable',
      priority: 'high',
      testCount: 15,
      component: GrowthModeTestRunner
    },
    {
      id: 'growth-program',
      title: 'Growth Programs',
      description: 'Program generation, execution, and lifecycle testing',
      icon: Zap,
      status: 'stable',
      priority: 'medium',
      testCount: 8,
      component: GrowthProgramTestRunner
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'production': return 'bg-green-100 text-green-800 border-green-200';
      case 'stable': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'beta': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalTests = testCategories.reduce((sum, cat) => sum + cat.testCount, 0);

  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube2 className="w-6 h-6" />
            <span>Complete Test Environment Dashboard</span>
            <Badge variant="outline" className="ml-2">
              {totalTests} Tests Available
            </Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Comprehensive testing, validation, and monitoring of all SoulSync components, 
            including patent-ready evidence collection for VFP-Graph technology.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {testCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card 
                  key={category.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    activeTab === category.id ? 'ring-2 ring-blue-500' : ''
                  } ${category.priority === 'critical' ? 'border-red-200' : ''}`}
                  onClick={() => setActiveTab(category.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <IconComponent className="w-5 h-5" />
                        {category.priority === 'critical' && (
                          <CheckCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <Badge className={getStatusColor(category.status)} variant="outline">
                        {category.status}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-sm mb-1">{category.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge className={getPriorityColor(category.priority)} variant="outline">
                        {category.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {category.testCount} tests
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">6</p>
                <p className="text-sm text-muted-foreground">Patent Claims</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Vector Tests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">15</p>
                <p className="text-sm text-muted-foreground">Growth Tests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{totalTests}</p>
                <p className="text-sm text-muted-foreground">Total Tests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Execution Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Test Execution Environment</span>
            <Badge variant="secondary">Real-Time Dynamic Data</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              {testCategories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id} 
                  className={`text-xs ${category.priority === 'critical' ? 'data-[state=active]:bg-red-100' : ''}`}
                >
                  <div className="flex items-center space-x-1">
                    <span>{category.title.split(' ')[0]}</span>
                    {category.priority === 'critical' && (
                      <Shield className="w-3 h-3" />
                    )}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {testCategories.map((category) => {
              const TestComponent = category.component;
              return (
                <TabsContent key={category.id} value={category.id} className="mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold flex items-center space-x-2">
                          <span>{category.title}</span>
                          {category.priority === 'critical' && (
                            <Shield className="w-5 h-5 text-red-500" />
                          )}
                        </h2>
                        <p className="text-muted-foreground text-sm">{category.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(category.priority)}>
                          {category.priority}
                        </Badge>
                        <Badge className={getStatusColor(category.status)}>
                          {category.status}
                        </Badge>
                        <Badge variant="outline">
                          {category.testCount} tests
                        </Badge>
                      </div>
                    </div>
                    <TestComponent />
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
