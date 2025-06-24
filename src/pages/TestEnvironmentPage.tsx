
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
  Database,
  Heart,
  Sparkles,
  Shuffle
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
import { MemorySearchAccuracyTester } from '@/components/debug/MemorySearchAccuracyTester';
import { MemoryPersonalityFusionTester } from '@/components/debug/MemoryPersonalityFusionTester';
import { CrossSessionMemoryContinuityTester } from '@/components/debug/CrossSessionMemoryContinuityTester';
import { MemoryImportanceScoringTester } from '@/components/debug/MemoryImportanceScoringTester';
import { GrowthMode7LayerTester } from '@/components/debug/GrowthMode7LayerTester';
import { CompanionModeConsistencyTester } from '@/components/debug/CompanionModeConsistencyTester';
import { DreamCoachBlueprintTester } from '@/components/debug/DreamCoachBlueprintTester';
import { ModeSwitchingCoherenceTester } from '@/components/debug/ModeSwitchingCoherenceTester';

const TestEnvironmentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('architecture');

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
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
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                <div className="text-center p-3">
                  <div className="flex items-center justify-center mb-2">
                    <Layers className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-sm font-medium mb-1">Architecture</div>
                  <Badge className="bg-purple-100 text-purple-800 text-xs">Enhanced</Badge>
                </div>
                
                <div className="text-center p-3">
                  <div className="flex items-center justify-center mb-2">
                    <Eye className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="text-sm font-medium mb-1">Intelligence</div>
                  <Badge className="bg-indigo-100 text-indigo-800 text-xs">Real-Time</Badge>
                </div>
                
                <div className="text-center p-3">
                  <div className="flex items-center justify-center mb-2">
                    <GitBranch className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="text-sm font-medium mb-1">End-to-End</div>
                  <Badge className="bg-emerald-100 text-emerald-800 text-xs">Dynamic</Badge>
                </div>
                
                <div className="text-center p-3">
                  <div className="flex items-center justify-center mb-2">
                    <Database className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div className="text-sm font-medium mb-1">12-Module</div>
                  <Badge className="bg-cyan-100 text-cyan-800 text-xs">Validated</Badge>
                </div>
                
                <div className="text-center p-3">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-sm font-medium mb-1">Manual Tests</div>
                  <Badge className="bg-green-100 text-green-800 text-xs">Ready</Badge>
                </div>
                
                <div className="text-center p-3">
                  <div className="flex items-center justify-center mb-2">
                    <PlayCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-sm font-medium mb-1">Automated</div>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">Available</Badge>
                </div>
                
                <div className="text-center p-3">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="text-sm font-medium mb-1">Performance</div>
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">Monitoring</Badge>
                </div>
                
                <div className="text-center p-3">
                  <div className="flex items-center justify-center mb-2">
                    <Network className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="text-sm font-medium mb-1">Integration</div>
                  <Badge className="bg-orange-100 text-orange-800 text-xs">Active</Badge>
                </div>

                <div className="text-center p-3">
                  <div className="flex items-center justify-center mb-2">
                    <Brain className="h-6 w-6 text-pink-600" />
                  </div>
                  <div className="text-sm font-medium mb-1">Memory</div>
                  <Badge className="bg-pink-100 text-pink-800 text-xs">Active</Badge>
                </div>

                <div className="text-center p-3">
                  <div className="flex items-center justify-center mb-2">
                    <MessageCircle className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="text-sm font-medium mb-1">Cross-Session</div>
                  <Badge className="bg-indigo-100 text-indigo-800 text-xs">Testing</Badge>
                </div>

                <div className="text-center p-3">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-sm font-medium mb-1">Importance</div>
                  <Badge className="bg-purple-100 text-purple-800 text-xs">Scoring</Badge>
                </div>

                <div className="text-center p-3">
                  <div className="flex items-center justify-center mb-2">
                    <Brain className="h-6 w-6 text-violet-600" />
                  </div>
                  <div className="text-sm font-medium mb-1">Growth Mode</div>
                  <Badge className="bg-violet-100 text-violet-800 text-xs">7-Layer</Badge>
                </div>

                <div className="text-center p-3">
                  <div className="flex items-center justify-center mb-2">
                    <Heart className="h-6 w-6 text-rose-600" />
                  </div>
                  <div className="text-sm font-medium mb-1">Companion</div>
                  <Badge className="bg-rose-100 text-rose-800 text-xs">Consistent</Badge>
                </div>

                <div className="text-center p-3">
                  <div className="flex items-center justify-center mb-2">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-sm font-medium mb-1">Dream Coach</div>
                  <Badge className="bg-purple-100 text-purple-800 text-xs">Blueprint</Badge>
                </div>

                <div className="text-center p-3">
                  <div className="flex items-center justify-center mb-2">
                    <Shuffle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-sm font-medium mb-1">Mode Switch</div>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">Coherent</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Tabs - Reorganized for better layout */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="overflow-x-auto">
              <TabsList className="grid w-max grid-cols-6 lg:grid-cols-9 gap-1 p-1 h-auto">
                <TabsTrigger value="architecture" className="flex flex-col items-center gap-1 p-3 text-xs">
                  <Layers className="h-4 w-4" />
                  Architecture
                </TabsTrigger>
                <TabsTrigger value="intelligence" className="flex flex-col items-center gap-1 p-3 text-xs">
                  <Eye className="h-4 w-4" />
                  Intelligence
                </TabsTrigger>
                <TabsTrigger value="end-to-end" className="flex flex-col items-center gap-1 p-3 text-xs">
                  <GitBranch className="h-4 w-4" />
                  End-to-End
                </TabsTrigger>
                <TabsTrigger value="layer-integration" className="flex flex-col items-center gap-1 p-3 text-xs">
                  <Target className="h-4 w-4" />
                  7-Layer
                </TabsTrigger>
                <TabsTrigger value="module-validation" className="flex flex-col items-center gap-1 p-3 text-xs">
                  <Database className="h-4 w-4" />
                  12-Module
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex flex-col items-center gap-1 p-3 text-xs">
                  <TestTube className="h-4 w-4" />
                  Manual
                </TabsTrigger>
                <TabsTrigger value="automated" className="flex flex-col items-center gap-1 p-3 text-xs">
                  <PlayCircle className="h-4 w-4" />
                  Automated
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex flex-col items-center gap-1 p-3 text-xs">
                  <Zap className="h-4 w-4" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="integration" className="flex flex-col items-center gap-1 p-3 text-xs">
                  <Network className="h-4 w-4" />
                  Integration
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Secondary Tab Row for Memory & Coach Mode Tests */}
            <div className="overflow-x-auto">
              <TabsList className="grid w-max grid-cols-3 lg:grid-cols-9 gap-1 p-1 h-auto">
                <TabsTrigger value="memory" className="flex flex-col items-center gap-1 p-3 text-xs">
                  <Brain className="h-4 w-4" />
                  Memory
                </TabsTrigger>
                <TabsTrigger value="memory-deep" className="flex flex-col items-center gap-1 p-3 text-xs">
                  <Brain className="h-4 w-4" />
                  Deep Memory
                </TabsTrigger>
                <TabsTrigger value="memory-fusion" className="flex flex-col items-center gap-1 p-3 text-xs">
                  <MessageCircle className="h-4 w-4" />
                  Fusion
                </TabsTrigger>
                <TabsTrigger value="cross-session" className="flex flex-col items-center gap-1 p-3 text-xs">
                  <MessageCircle className="h-4 w-4" />
                  Cross-Session
                </TabsTrigger>
                <TabsTrigger value="importance" className="flex flex-col items-center gap-1 p-3 text-xs">
                  <Target className="h-4 w-4" />
                  Importance
                </TabsTrigger>
                <TabsTrigger value="growth-mode" className="flex flex-col items-center gap-1 p-3 text-xs">
                  <Brain className="h-4 w-4" />
                  Growth
                </TabsTrigger>
                <TabsTrigger value="companion-mode" className="flex flex-col items-center gap-1 p-3 text-xs">
                  <Heart className="h-4 w-4" />
                  Companion
                </TabsTrigger>
                <TabsTrigger value="dream-coach" className="flex flex-col items-center gap-1 p-3 text-xs">
                  <Sparkles className="h-4 w-4" />
                  Dream Coach
                </TabsTrigger>
                <TabsTrigger value="mode-switching" className="flex flex-col items-center gap-1 p-3 text-xs">
                  <Shuffle className="h-4 w-4" />
                  Mode Switch
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Contents */}
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
                <h2 className="text-2xl font-semibold mb-2">12-Module Validation & Completeness</h2>
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

            <TabsContent value="memory-deep" className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold mb-2">Memory System Deep Testing</h2>
                <p className="text-gray-600">
                  Progressive search strategies, memory accuracy validation, and importance scoring with real conversation data.
                </p>
              </div>
              <MemorySearchAccuracyTester />
            </TabsContent>

            <TabsContent value="memory-fusion" className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold mb-2">Memory-Personality Fusion Testing</h2>
                <p className="text-gray-600">
                  Test how retrieved memories enhance personality-driven responses with real conversation flows.
                </p>
              </div>
              <MemoryPersonalityFusionTester />
            </TabsContent>

            <TabsContent value="cross-session" className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold mb-2">Cross-Session Memory Continuity Testing</h2>
                <p className="text-gray-600">
                  Test memory application across multiple user sessions with actual conversation history and context preservation.
                </p>
              </div>
              <CrossSessionMemoryContinuityTester />
            </TabsContent>

            <TabsContent value="importance" className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold mb-2">Memory Importance Scoring Validation</h2>
                <p className="text-gray-600">
                  Validate automatic importance calculation using actual conversation patterns and emotional content analysis.
                </p>
              </div>
              <MemoryImportanceScoringTester />
            </TabsContent>

            <TabsContent value="growth-mode" className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold mb-2">Growth Mode 7-Layer Integration Testing</h2>
                <p className="text-gray-600">
                  Test advanced holistic prompt generation with real blueprint data and dynamic layer integration.
                </p>
              </div>
              <GrowthMode7LayerTester />
            </TabsContent>

            <TabsContent value="companion-mode" className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold mb-2">Companion Mode Consistency Testing</h2>
                <p className="text-gray-600">
                  Validate basic personality engine functionality with consistent companion responses and warmth levels.
                </p>
              </div>
              <CompanionModeConsistencyTester />
            </TabsContent>

            <TabsContent value="dream-coach" className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold mb-2">Dream Coach Blueprint Integration Testing</h2>
                <p className="text-gray-600">
                  Test dream-focused coaching with personality blueprint integration and visionary guidance elements.
                </p>
              </div>
              <DreamCoachBlueprintTester />
            </TabsContent>

            <TabsContent value="mode-switching" className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold mb-2">Mode Switching Coherence Testing</h2>
                <p className="text-gray-600">
                  Test personality consistency and context preservation across coach mode transitions.
                </p>
              </div>
              <ModeSwitchingCoherenceTester />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthProvider>
  );
};

export default TestEnvironmentPage;
