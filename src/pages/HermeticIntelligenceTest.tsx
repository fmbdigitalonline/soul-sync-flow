import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Brain, Database, Search, Activity, Settings, Zap } from 'lucide-react';

import { ExtractionControlPanel } from '@/components/hermetic-test/ExtractionControlPanel';
import { IntelligenceBrowser } from '@/components/hermetic-test/IntelligenceBrowser';
import { ServiceTester } from '@/components/hermetic-test/ServiceTester';
import { ValidationDashboard } from '@/components/hermetic-test/ValidationDashboard';

const HermeticIntelligenceTest: React.FC = () => {
  const [activeTab, setActiveTab] = useState('extraction');

  const testCategories = [
    {
      id: 'extraction',
      title: 'Extraction Control',
      description: 'Trigger and monitor hermetic intelligence extraction processes',
      icon: Zap,
      status: 'ready',
      component: ExtractionControlPanel
    },
    {
      id: 'intelligence',
      title: 'Intelligence Browser',
      description: 'Browse and explore extracted 12-dimension intelligence data',
      icon: Brain,
      status: 'ready',
      component: IntelligenceBrowser
    },
    {
      id: 'service',
      title: 'Service Testing',
      description: 'Test all hermetic intelligence service methods directly',
      icon: Settings,
      status: 'ready',
      component: ServiceTester
    },
    {
      id: 'validation',
      title: 'Data Validation',
      description: 'Validate extraction quality and view metadata',
      icon: Activity,
      status: 'ready',
      component: ValidationDashboard
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'testing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-primary" />
            <span>Hermetic Intelligence Extraction Test Suite</span>
            <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
              12-Dimension Psychological Intelligence
            </Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            <strong>Comprehensive testing environment</strong> for the Hermetic Intelligence Extraction Engine. 
            Test extraction processes, browse 12-dimensional intelligence data, validate service methods, 
            and monitor extraction quality in real-time.
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
                    activeTab === category.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setActiveTab(category.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <IconComponent className="w-5 h-5 text-primary" />
                      <Badge className={getStatusColor(category.status)} variant="outline">
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold text-primary">12</p>
                <p className="text-sm text-primary/80">Core Dimensions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-secondary/20 bg-secondary/5">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-secondary" />
              <div>
                <p className="text-2xl font-bold text-secondary">AI</p>
                <p className="text-sm text-secondary/80">Extraction Engine</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-accent/20 bg-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-accent" />
              <div>
                <p className="text-2xl font-bold text-accent">100+</p>
                <p className="text-sm text-accent/80">Test Methods</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">Live</p>
                <p className="text-sm text-muted-foreground">Real-time Data</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Execution Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary" />
            <span>Hermetic Intelligence Test Environment</span>
            <Badge variant="secondary" className="bg-primary/10 text-primary">Real-Time Testing</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              {testCategories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id} 
                  className="text-xs"
                >
                  <div className="flex items-center space-x-1">
                    <span>{category.title.split(' ')[0]}</span>
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
                        </h2>
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

export default HermeticIntelligenceTest;