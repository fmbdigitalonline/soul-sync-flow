import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TestTube, 
  Activity, 
  Network, 
  Zap, 
  CheckCircle,
  PlayCircle,
  Brain,
  MessageCircle,
  Eye,
  Layers,
  Target,
  GitBranch,
  Database
} from 'lucide-react';
import { AuthProvider } from '@/contexts/AuthContext';
import { Phase3MemoryTest } from '@/components/debug/Phase3MemoryTest';
import { AutomatedTestRunner } from '@/components/debug/AutomatedTestRunner';
import { PerformanceMonitor } from '@/components/debug/PerformanceMonitor';
import { IntegrationTestPanel } from '@/components/debug/IntegrationTestPanel';
import { MemoryConsistencyMonitor } from '@/components/debug/MemoryConsistencyMonitor';
import { MemoryInformedConversationTest } from '@/components/debug/MemoryInformedConversationTest';
import { PersonalityArchitectureTest } from '@/components/debug/PersonalityArchitectureTest';
import { RealTimeIntelligenceMonitor } from '@/components/debug/RealTimeIntelligenceMonitor';
import { EndToEndFlowTester } from '@/components/debug/EndToEndFlowTester';
import { LayerIntegrationTester } from '@/components/debug/LayerIntegrationTester';
import { ModuleCompletenessValidator } from '@/components/debug/ModuleCompletenessValidator';

const TestEnvironmentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('architecture');

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TestTube className="h-8 w-8" />
              Enhanced Test Environment Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Comprehensive brain scan for testing 12 modules, 7 layers, and 3 coach modes with real-time dynamic data
            </p>
          </div>

          {/* Quick Status Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Enhanced Test Environment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-10 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Layers className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-sm font-medium">Architecture</div>
                  <Badge className="bg-purple-100 text-purple-800">Enhanced</Badge>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Eye className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="text-sm font-medium">Intelligence</div>
                  <Badge className="bg-indigo-100 text-indigo-800">Real-Time</Badge>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <GitBranch className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="text-sm font-medium">End-to-End</div>
                  <Badge className="bg-emerald-100 text-emerald-800">Dynamic</Badge>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Database className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div className="text-sm font-medium">12-Module</div>
                  <Badge className="bg-cyan-100 text-cyan-800">Validated</Badge>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-sm font-medium">Manual Tests</div>
                  <Badge className="bg-green-100 text-green-800">Ready</Badge>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <PlayCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-sm font-medium">Automated Tests</div>
                  <Badge className="bg-blue-100 text-blue-800">Available</Badge>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="text-sm font-medium">Performance</div>
                  <Badge className="bg-yellow-100 text-yellow-800">Monitoring</Badge>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Network className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="text-sm font-medium">Integration</div>
                  <Badge className="bg-orange-100 text-orange-800">Active</Badge>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Brain className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="text-sm font-medium">Memory Monitor</div>
                  <Badge className="bg-red-100 text-red-800">Enhanced</Badge>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <MessageCircle className="h-6 w-6 text-teal-600" />
                  </div>
                  <div className="text-sm font-medium">Conversation Test</div>
                  <Badge className="bg-teal-100 text-teal-800">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-10">
              <TabsTrigger value="architecture" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Architecture
              </TabsTrigger>
              <TabsTrigger value="intelligence" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Intelligence
              </TabsTrigger>
              <TabsTrigger value="end-to-end" className="flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                End-to-End
              </TabsTrigger>
              <TabsTrigger value="layer-integration" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                7-Layer
              </TabsTrigger>
              <TabsTrigger value="module-validation" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                12-Module
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                Manual
              </TabsTrigger>
              <TabsTrigger value="automated" className="flex items-center gap-2">
                <PlayCircle className="h-4 w-4" />
                Automated
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="integration" className="flex items-center gap-2">
                <Network className="h-4 w-4" />
                Integration
              </TabsTrigger>
              <TabsTrigger value="memory" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Memory
              </TabsTrigger>
            </TabsList>

            <TabsContent value="end-to-end" className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold mb-2">End-to-End Flow Testing</h2>
                <p className="text-gray-600">
                  Complete user journey validation: Blueprint → 7-Layer Engine → Personalized Response → Memory Storage with real dynamic data.
                </p>
              </div>
              <EndToEndFlowTester />
            </TabsContent>

            <TabsContent value="layer-integration" className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold mb-2">7-Layer Integration Deep Testing</h2>
                <p className="text-gray-600">
                  Comprehensive testing of PhysioNeural → TraitOS → MotivationEngine integration chain with real-time coherence validation.
                </p>
              </div>
              <LayerIntegrationTester />
            </TabsContent>

            <TabsContent value="module-validation" className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibred mb-2">12-Module Validation & Completeness</h2>
                <p className="text-gray-600">
                  Real-time validation of all 12 personality modules with data quality assessment and synergy analysis.
                </p>
              </div>
              <ModuleCompletenessValidator />
            </TabsContent>

            <TabsContent value="architecture" className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold mb-2">Personality Architecture Brain Scan</h2>
                <p className="text-gray-600">
                  Comprehensive testing of 12 personality modules, 7 layers, and 3 coach modes with real-time dynamic data validation.
                </p>
              </div>
              <PersonalityArchitectureTest />
            </TabsContent>

            <TabsContent value="intelligence" className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold mb-2">Real-Time Intelligence Monitor</h2>
                <p className="text-gray-600">
                  Monitor cognitive load, context awareness, excitement tracking, and response quality in real-time.
                </p>
              </div>
              <RealTimeIntelligenceMonitor />
            </TabsContent>

            <TabsContent value="manual" className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold mb-2">Manual Testing Suite</h2>
                <p className="text-gray-600">
                  Interactive testing interface for Phase 3 memory system with real-time feedback and data visualization.
                </p>
              </div>
              <Phase3MemoryTest />
            </TabsContent>

            <TabsContent value="automated" className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold mb-2">Automated Testing Suite</h2>
                <p className="text-gray-600">
                  Automated test runner for comprehensive system validation and regression testing.
                </p>
              </div>
              <AutomatedTestRunner />
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold mb-2">Performance Monitoring</h2>
                <p className="text-gray-600">
                  Real-time performance metrics, system health monitoring, and optimization insights.
                </p>
              </div>
              <PerformanceMonitor />
            </TabsContent>

            <TabsContent value="integration" className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold mb-2">Integration Testing</h2>
                <p className="text-gray-600">
                  Test cross-service functionality, data flow integrity, and system integration points.
                </p>
              </div>
              <IntegrationTestPanel />
            </TabsContent>

            <TabsContent value="memory" className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold mb-2">Memory & Blueprint Consistency Monitor</h2>
                <p className="text-gray-600">
                  Monitor AI memory consistency, blueprint recognition, and identify root causes of inconsistent behavior.
                </p>
              </div>
              <MemoryConsistencyMonitor />
              <MemoryInformedConversationTest />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthProvider>
  );
};

export default TestEnvironmentPage;
