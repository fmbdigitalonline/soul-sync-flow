import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  Shuffle,
  Info,
  Shield,
  AlertTriangle,
  BarChart2,
  Users,
  Settings,
  Gauge
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
import { GracefulDegradationTester } from '@/components/debug/GracefulDegradationTester';
import { MemoryFailureRecoveryTester } from '@/components/debug/MemoryFailureRecoveryTester';
import { LayerActivationConflictTester } from '@/components/debug/LayerActivationConflictTester';
import { FallbackMechanismValidator } from '@/components/debug/FallbackMechanismValidator';
import { ResponseTimeLoadTester } from '@/components/debug/ResponseTimeLoadTester';

const TestEnvironmentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('architecture');

  return (
    <AuthProvider>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto py-8 px-4 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TestTube className="h-8 w-8" />
                Complete Test Environment Dashboard
              </h1>
              <p className="text-lg text-gray-600">
                Comprehensive testing suite: 34 test components covering 7-layer personality engine, 12 modules, 3 coach modes, error handling, performance, UX flows, and advanced analytics with real-time dynamic data
              </p>
            </div>

            {/* Enhanced Status Overview */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Complete Test Environment Status (34 Tests Available)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-12 gap-4">
                  
                  {/* Core Architecture Tests */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-center p-3 border rounded-lg hover:bg-gray-50 cursor-help">
                        <div className="flex items-center justify-center mb-2">
                          <Layers className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="text-sm font-medium mb-1">Architecture</div>
                        <Badge className="bg-purple-100 text-purple-800 text-xs">Enhanced</Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <div className="space-y-2">
                        <p><strong>Personality Architecture Test</strong></p>
                        <p>Measures: 12 personality modules integration, 7-layer engine coherence</p>
                        <p>KPIs: Module completeness (0-100%), layer synchronization score</p>
                        <p>Benefits: Ensures consistent personality expression across all interactions</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-center p-3 border rounded-lg hover:bg-gray-50 cursor-help">
                        <div className="flex items-center justify-center mb-2">
                          <Eye className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="text-sm font-medium mb-1">Intelligence</div>
                        <Badge className="bg-indigo-100 text-indigo-800 text-xs">Real-Time</Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <div className="space-y-2">
                        <p><strong>Real-Time Intelligence Monitor</strong></p>
                        <p>Measures: Cognitive load, context awareness, response quality</p>
                        <p>KPIs: Intelligence score (0-100), context retention rate, response coherence</p>
                        <p>Benefits: Optimizes AI thinking patterns for better user conversations</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-center p-3 border rounded-lg hover:bg-gray-50 cursor-help">
                        <div className="flex items-center justify-center mb-2">
                          <GitBranch className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div className="text-sm font-medium mb-1">End-to-End</div>
                        <Badge className="bg-emerald-100 text-emerald-800 text-xs">Dynamic</Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <div className="space-y-2">
                        <p><strong>End-to-End Flow Testing</strong></p>
                        <p>Measures: Complete user journey from input to personalized response</p>
                        <p>KPIs: Flow completion rate (0-100%), response personalization score</p>
                        <p>Benefits: Validates entire conversation pipeline works seamlessly</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-center p-3 border rounded-lg hover:bg-gray-50 cursor-help">
                        <div className="flex items-center justify-center mb-2">
                          <Database className="h-6 w-6 text-cyan-600" />
                        </div>
                        <div className="text-sm font-medium mb-1">12-Module</div>
                        <Badge className="bg-cyan-100 text-cyan-800 text-xs">Validated</Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <div className="space-y-2">
                        <p><strong>12-Module Validation</strong></p>
                        <p>Measures: All personality modules (MBTI, Human Design, Astrology, etc.)</p>
                        <p>KPIs: Module accuracy (0-100%), data quality score, integration health</p>
                        <p>Benefits: Ensures comprehensive personality understanding for personalized coaching</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  {/* Error Handling Tests */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-center p-3 border rounded-lg hover:bg-gray-50 cursor-help">
                        <div className="flex items-center justify-center mb-2">
                          <AlertTriangle className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="text-sm font-medium mb-1">Degradation</div>
                        <Badge className="bg-orange-100 text-orange-800 text-xs">Graceful</Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <div className="space-y-2">
                        <p><strong>Graceful Degradation Testing</strong></p>
                        <p>Measures: System behavior with missing blueprint components</p>
                        <p>KPIs: Fallback success rate (0-100%), response quality degradation</p>
                        <p>Benefits: Ensures system works even with partial personality data</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-center p-3 border rounded-lg hover:bg-gray-50 cursor-help">
                        <div className="flex items-center justify-center mb-2">
                          <Shield className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="text-sm font-medium mb-1">Fallback</div>
                        <Badge className="bg-blue-100 text-blue-800 text-xs">Resilient</Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <div className="space-y-2">
                        <p><strong>Fallback Mechanism Validator</strong></p>
                        <p>Measures: Basic functionality when advanced features fail</p>
                        <p>KPIs: System resilience score (0-100%), critical failure count</p>
                        <p>Benefits: Ensures core functionality remains available during failures</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  {/* Performance & Scalability */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-center p-3 border rounded-lg hover:bg-gray-50 cursor-help">
                        <div className="flex items-center justify-center mb-2">
                          <Zap className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="text-sm font-medium mb-1">Performance</div>
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">Monitoring</Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <div className="space-y-2">
                        <p><strong>Performance Monitor</strong></p>
                        <p>Measures: Response times, memory usage, system health</p>
                        <p>KPIs: Average response time (ms), memory usage (%), uptime</p>
                        <p>Benefits: Ensures fast, reliable user experience and identifies bottlenecks</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-center p-3 border rounded-lg hover:bg-gray-50 cursor-help">
                        <div className="flex items-center justify-center mb-2">
                          <Gauge className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="text-sm font-medium mb-1">Load Testing</div>
                        <Badge className="bg-red-100 text-red-800 text-xs">Scalable</Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <div className="space-y-2">
                        <p><strong>Response Time Under Load</strong></p>
                        <p>Measures: System performance with complex personality processing</p>
                        <p>KPIs: Response time under load (ms), throughput capacity</p>
                        <p>Benefits: Validates system can handle multiple users with complex personalities</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  {/* Memory System Tests */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-center p-3 border rounded-lg hover:bg-gray-50 cursor-help">
                        <div className="flex items-center justify-center mb-2">
                          <Brain className="h-6 w-6 text-pink-600" />
                        </div>
                        <div className="text-sm font-medium mb-1">Memory</div>
                        <Badge className="bg-pink-100 text-pink-800 text-xs">Active</Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <div className="space-y-2">
                        <p><strong>Memory System Testing</strong></p>
                        <p>Measures: Memory storage, retrieval accuracy, consistency</p>
                        <p>KPIs: Memory recall accuracy (0-100%), consistency score, search precision</p>
                        <p>Benefits: Ensures AI remembers and applies past conversations effectively</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  {/* User Experience */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-center p-3 border rounded-lg hover:bg-gray-50 cursor-help">
                        <div className="flex items-center justify-center mb-2">
                          <Users className="h-6 w-6 text-teal-600" />
                        </div>
                        <div className="text-sm font-medium mb-1">UX Flows</div>
                        <Badge className="bg-teal-100 text-teal-800 text-xs">Complete</Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <div className="space-y-2">
                        <p><strong>User Experience Flow Testing</strong></p>
                        <p>Measures: Complete user journey from onboarding to coaching</p>
                        <p>KPIs: Journey completion rate (0-100%), user satisfaction score</p>
                        <p>Benefits: Ensures smooth user experience across all touchpoints</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  {/* Analytics */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-center p-3 border rounded-lg hover:bg-gray-50 cursor-help">
                        <div className="flex items-center justify-center mb-2">
                          <BarChart2 className="h-6 w-6 text-violet-600" />
                        </div>
                        <div className="text-sm font-medium mb-1">Analytics</div>
                        <Badge className="bg-violet-100 text-violet-800 text-xs">Advanced</Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <div className="space-y-2">
                        <p><strong>Advanced Analytics Suite</strong></p>
                        <p>Measures: Personality coherence, layer activation patterns, user engagement</p>
                        <p>KPIs: Coherence score (0-100%), engagement metrics, intelligence tracking</p>
                        <p>Benefits: Provides deep insights into personality system effectiveness</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>

            {/* Test Tabs - Complete with all categories */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="space-y-4">
                {/* Core Test Categories */}
                <div className="overflow-x-auto">
                  <TabsList className="grid w-max grid-cols-3 lg:grid-cols-9 gap-1 p-1 h-auto">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="architecture" className="flex flex-col items-center gap-1 p-3 text-xs">
                          <Layers className="h-4 w-4" />
                          Architecture
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Test 12 personality modules and 7-layer engine integration</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="intelligence" className="flex flex-col items-center gap-1 p-3 text-xs">
                          <Eye className="h-4 w-4" />
                          Intelligence
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Monitor real-time cognitive load and context awareness</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="end-to-end" className="flex flex-col items-center gap-1 p-3 text-xs">
                          <GitBranch className="h-4 w-4" />
                          End-to-End
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Complete user journey validation with dynamic data</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="layer-integration" className="flex flex-col items-center gap-1 p-3 text-xs">
                          <Target className="h-4 w-4" />
                          7-Layer
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Deep testing of 7-layer personality engine integration</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="module-validation" className="flex flex-col items-center gap-1 p-3 text-xs">
                          <Database className="h-4 w-4" />
                          12-Module
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Validate all 12 personality modules completeness</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="manual" className="flex flex-col items-center gap-1 p-3 text-xs">
                          <TestTube className="h-4 w-4" />
                          Manual
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Interactive testing with real-time feedback</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="automated" className="flex flex-col items-center gap-1 p-3 text-xs">
                          <PlayCircle className="h-4 w-4" />
                          Automated
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Automated system validation and regression testing</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="performance" className="flex flex-col items-center gap-1 p-3 text-xs">
                          <Zap className="h-4 w-4" />
                          Performance
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Monitor system performance and optimization</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="integration" className="flex flex-col items-center gap-1 p-3 text-xs">
                          <Network className="h-4 w-4" />
                          Integration
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Test cross-service functionality and data flow</p>
                      </TooltipContent>
                    </Tooltip>
                  </TabsList>
                </div>

                {/* Memory & Coach Mode Tests */}
                <div className="overflow-x-auto">
                  <TabsList className="grid w-max grid-cols-3 lg:grid-cols-9 gap-1 p-1 h-auto">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="memory" className="flex flex-col items-center gap-1 p-3 text-xs">
                          <Brain className="h-4 w-4" />
                          Memory
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Test memory consistency and blueprint recognition</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="memory-deep" className="flex flex-col items-center gap-1 p-3 text-xs">
                          <Brain className="h-4 w-4" />
                          Deep Memory
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Progressive search strategies and memory accuracy</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="memory-fusion" className="flex flex-col items-center gap-1 p-3 text-xs">
                          <MessageCircle className="h-4 w-4" />
                          Fusion
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Test memory-personality fusion in responses</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="cross-session" className="flex flex-col items-center gap-1 p-3 text-xs">
                          <MessageCircle className="h-4 w-4" />
                          Cross-Session
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Memory continuity across multiple user sessions</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="importance" className="flex flex-col items-center gap-1 p-3 text-xs">
                          <Target className="h-4 w-4" />
                          Importance
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Validate memory importance scoring algorithms</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="growth-mode" className="flex flex-col items-center gap-1 p-3 text-xs">
                          <Brain className="h-4 w-4" />
                          Growth
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Test Growth Mode with 7-layer integration</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="companion-mode" className="flex flex-col items-center gap-1 p-3 text-xs">
                          <Heart className="h-4 w-4" />
                          Companion
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Validate consistent companion responses and warmth</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="dream-coach" className="flex flex-col items-center gap-1 p-3 text-xs">
                          <Sparkles className="h-4 w-4" />
                          Dream Coach
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Dream-focused coaching with blueprint integration</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="mode-switching" className="flex flex-col items-center gap-1 p-3 text-xs">
                          <Shuffle className="h-4 w-4" />
                          Mode Switch
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Personality consistency across mode transitions</p>
                      </TooltipContent>
                    </Tooltip>
                  </TabsList>
                </div>

                {/* Error Handling & Advanced Tests */}
                <div className="overflow-x-auto">
                  <TabsList className="grid w-max grid-cols-2 lg:grid-cols-8 gap-1 p-1 h-auto">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="graceful-degradation" className="flex flex-col items-center gap-1 p-3 text-xs">
                          <AlertTriangle className="h-4 w-4" />
                          Degradation
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Test behavior with missing blueprint components</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="memory-recovery" className="flex flex-col items-center gap-1 p-3 text-xs">
                          <Brain className="h-4 w-4" />
                          Recovery
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Test system response to memory retrieval failures</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="layer-conflicts" className="flex flex-col items-center gap-1 p-3 text-xs">
                          <Layers className="h-4 w-4" />
                          Conflicts
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Test resolution of contradictory layer instructions</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="fallback-validation" className="flex flex-col items-center gap-1 p-3 text-xs">
                          <Shield className="h-4 w-4" />
                          Fallback
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Test basic functionality when advanced features fail</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="load-testing" className="flex flex-col items-center gap-1 p-3 text-xs">
                          <Gauge className="h-4 w-4" />
                          Load Test
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Response time testing under load with complex personalities</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="ux-flows" className="flex flex-col items-center gap-1 p-3 text-xs">
                          <Users className="h-4 w-4" />
                          UX Flows
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Complete user experience flow validation</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="advanced-analytics" className="flex flex-col items-center gap-1 p-3 text-xs">
                          <BarChart2 className="h-4 w-4" />
                          Analytics
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Advanced personality coherence and engagement analytics</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="system-health" className="flex flex-col items-center gap-1 p-3 text-xs">
                          <Settings className="h-4 w-4" />
                          Health
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Real-time system health monitoring and alerts</p>
                      </TooltipContent>
                    </Tooltip>
                  </TabsList>
                </div>
              </div>

              {/* All Tab Contents */}
              
              {/* Core Architecture Tests */}
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

              {/* Memory System Tests */}
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

              {/* Coach Mode Tests */}
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

              {/* Error Handling & Edge Cases */}
              <TabsContent value="graceful-degradation" className="space-y-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold mb-2">Graceful Degradation Testing</h2>
                  <p className="text-gray-600">
                    Test system behavior with missing blueprint components and validate graceful fallback mechanisms.
                  </p>
                </div>
                <GracefulDegradationTester />
              </TabsContent>

              <TabsContent value="memory-recovery" className="space-y-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold mb-2">Memory Failure Recovery Testing</h2>
                  <p className="text-gray-600">
                    Test system response to memory retrieval failures and validate recovery mechanisms.
                  </p>
                </div>
                <MemoryFailureRecoveryTester />
              </TabsContent>

              <TabsContent value="layer-conflicts" className="space-y-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold mb-2">Layer Activation Conflict Testing</h2>
                  <p className="text-gray-600">
                    Test resolution of contradictory layer instructions and personality conflict management.
                  </p>
                </div>
                <LayerActivationConflictTester />
              </TabsContent>

              <TabsContent value="fallback-validation" className="space-y-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold mb-2">Fallback Mechanism Validation</h2>
                  <p className="text-gray-600">
                    Test basic functionality when advanced features fail and validate system resilience.
                  </p>
                </div>
                <FallbackMechanismValidator />
              </TabsContent>

              {/* Existing Tests */}
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

              {/* Placeholders for remaining test categories - to be implemented */}
              <TabsContent value="load-testing" className="space-y-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold mb-2">Response Time Under Load Testing</h2>
                  <p className="text-gray-600">
                    Test system performance with complex personality processing under concurrent load with real-time metrics.
                  </p>
                </div>
                <ResponseTimeLoadTester />
              </TabsContent>

              <TabsContent value="ux-flows" className="space-y-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold mb-2">User Experience Flow Testing</h2>
                  <p className="text-gray-600">
                    Complete user journey validation from onboarding to coaching - Implementation coming soon.
                  </p>
                </div>
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">UX Flow testing components will be implemented next.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advanced-analytics" className="space-y-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold mb-2">Advanced Analytics Suite</h2>
                  <p className="text-gray-600">
                    Personality coherence scoring and engagement analytics - Implementation coming soon.
                  </p>
                </div>
                <Card>
                  <CardContent className="p-8 text-center">
                    <BarChart2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Advanced analytics components will be implemented next.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="system-health" className="space-y-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold mb-2">Real-Time System Health Monitoring</h2>
                  <p className="text-gray-600">
                    Comprehensive system health dashboard and alerts - Implementation coming soon.
                  </p>
                </div>
                <Card>
                  <CardContent className="p-8 text-center">
                    <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">System health monitoring dashboard will be implemented next.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </TooltipProvider>
    </AuthProvider>
  );
};

export default TestEnvironmentPage;
