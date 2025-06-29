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
  CheckCircle,
  MessageSquare
} from 'lucide-react';

// Import existing test components
import { GrowthModeTestRunner } from './GrowthModeTestRunner';
import { GrowthProgramTestRunner } from './GrowthProgramTestRunner';
import { VFPGraphTester } from '../personality/VFPGraphTester';
import { VFPGraphPatentTester } from './VFPGraphPatentTester';
import { ACSPatentTestSuite } from './ACSPatentTestSuite';

export const TestingDashboard: React.FC = () => {
  // Set ACS Patent as the default active tab (highest priority)
  const [activeTab, setActiveTab] = useState('acs-patent');

  const testCategories = [
    {
      id: 'acs-patent',
      title: 'ACS Patent Validation',
      description: 'Live conversation testing for Adaptive Context Scheduler patent claims with real-time evidence',
      icon: MessageSquare,
      status: 'production',
      priority: 'critical',
      testCount: 9,
      component: ACSPatentTestSuite
    },
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
      {/* Patent Validation Status Header */}
      <Card className="border-red-200 bg-red-50/30">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-red-500" />
            <span>Patent Validation Status + Complete Test Environment (37 Tests Available)</span>
            <Badge variant="outline" className="ml-2 bg-red-100 text-red-800 border-red-200">
              US Provisional Patent
            </Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            <strong>Patent Claims:</strong> 6 Claims | <strong>Growth Program:</strong> Live Data | 
            <strong>Architecture:</strong> Enhanced | <strong>Intelligence:</strong> Real-Time | 
            <strong>End-to-End:</strong> Dynamic | <strong>12-Module:</strong> Validated | 
            <strong>Degradation:</strong> Graceful | <strong>Fallback:</strong> Resilient
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-4">
            {[
              { label: 'Patent Claims', value: '6 Claims', status: 'critical' },
              { label: 'Growth Program', value: 'Live Data', status: 'production' },
              { label: 'Architecture', value: 'Enhanced', status: 'production' },
              { label: 'Intelligence', value: 'Real-Time', status: 'production' },
              { label: 'End-to-End', value: 'Dynamic', status: 'production' },
              { label: '12-Module', value: 'Validated', status: 'production' },
              { label: 'Degradation', value: 'Graceful', status: 'stable' },
              { label: 'Fallback', value: 'Resilient', status: 'stable' }
            ].map((item, index) => (
              <Card key={index} className={`${item.status === 'critical' ? 'border-red-200 bg-red-50/30' : 'border-green-200 bg-green-50/30'}`}>
                <CardContent className="p-2 text-center">
                  <div className="text-xs font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Overview Section - Now focused on ACS + Patent Validation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-6 h-6 text-blue-500" />
            <span>Live Patent Validation Test Suite</span>
            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
              ACS + VFP-Graph Patent Testing Active
            </Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            <strong>Comprehensive patent evidence collection</strong> with live conversation testing for ACS technology claims 
            and VFP-Graph patent validation. Real-time data generation with automatic evidence package creation 
            for US Provisional Patent Applications.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {testCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card 
                  key={category.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    activeTab === category.id ? 'ring-2 ring-blue-500' : ''
                  } ${category.priority === 'critical' ? 'border-red-200 bg-red-50/30' : ''}`}
                  onClick={() => setActiveTab(category.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <IconComponent className="w-5 h-5" />
                        {category.priority === 'critical' && (
                          <Shield className="w-4 h-4 text-red-500" />
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-700">9</p>
                <p className="text-sm text-blue-600">ACS Claims</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-700">6</p>
                <p className="text-sm text-red-600">VFP Claims</p>
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
              <CheckCircle className="w-5 h-5 text-indigo-500" />
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
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <span>Live Patent Test Environment</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">Real-Time Evidence Collection</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              {testCategories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id} 
                  className={`text-xs ${category.priority === 'critical' ? 'data-[state=active]:bg-red-100 data-[state=active]:text-red-800' : ''}`}
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
