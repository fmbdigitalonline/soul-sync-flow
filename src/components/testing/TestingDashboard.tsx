
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
  Settings
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
      description: 'Patent claim validation with real-time evidence collection',
      icon: FileText,
      status: 'production',
      component: VFPGraphPatentTester
    },
    {
      id: 'vfp-graph',
      title: 'VFP-Graph Testing',
      description: 'Vector-Fusion Personality Graph component testing',
      icon: Brain,
      status: 'production',
      component: VFPGraphTester
    },
    {
      id: 'growth-mode',
      title: 'Growth Mode',
      description: 'Comprehensive growth program and coaching validation',
      icon: Activity,
      status: 'stable',
      component: GrowthModeTestRunner
    },
    {
      id: 'growth-program',
      title: 'Growth Programs',
      description: 'Program generation and execution testing',
      icon: Zap,
      status: 'stable',
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

  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube2 className="w-6 h-6" />
            <span>Complete Test Environment Dashboard</span>
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
                  }`}
                  onClick={() => setActiveTab(category.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <IconComponent className="w-5 h-5" />
                      <Badge className={getStatusColor(category.status)}>
                        {category.status}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-sm mb-1">{category.title}</h3>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Test Execution Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Test Execution Environment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              {testCategories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs">
                  {category.title}
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
                        <h2 className="text-xl font-semibold">{category.title}</h2>
                        <p className="text-muted-foreground text-sm">{category.description}</p>
                      </div>
                      <Badge className={getStatusColor(category.status)}>
                        {category.status}
                      </Badge>
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
