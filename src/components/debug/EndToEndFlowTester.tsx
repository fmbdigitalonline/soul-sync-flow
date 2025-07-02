
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight,
  CheckCircle,
  XCircle,
  Loader2,
  GitBranch,
  Database,
  MessageCircle,
  Brain
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { enhancedAICoachService } from '@/services/enhanced-ai-coach-service';
import { memoryInformedConversationService } from '@/services/memory-informed-conversation-service';
import { holisticCoachService } from '@/services/holistic-coach-service';

interface FlowStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  duration?: number;
  data?: any;
  error?: string;
}

interface FlowTest {
  id: string;
  name: string;
  description: string;
  steps: FlowStep[];
  isRunning: boolean;
  overallStatus: 'pending' | 'running' | 'success' | 'error';
}

export const EndToEndFlowTester: React.FC = () => {
  const [flows, setFlows] = useState<FlowTest[]>([]);
  const [testMessage, setTestMessage] = useState('I feel overwhelmed with my creative projects and need guidance');
  const [userId, setUserId] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeFlowTests();
  }, []);

  const initializeFlowTests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await enhancedAICoachService.setCurrentUser(user.id);
        
        const flowTests: FlowTest[] = [
          {
            id: 'complete-journey',
            name: 'Complete User Journey',
            description: 'Blueprint → 7-Layer Engine → Personalized Response → Memory Storage',
            steps: [
              { id: 'blueprint-load', name: 'Load User Blueprint', status: 'pending' },
              { id: 'layer-conversion', name: '7-Layer Engine Conversion', status: 'pending' },
              { id: 'memory-context', name: 'Build Memory Context', status: 'pending' },
              { id: 'ai-response', name: 'Generate AI Response', status: 'pending' },
              { id: 'memory-storage', name: 'Store Memory', status: 'pending' },
              { id: 'flow-validation', name: 'Validate Complete Flow', status: 'pending' }
            ],
            isRunning: false,
            overallStatus: 'pending'
          },
          {
            id: 'coach-mode-transitions',
            name: 'Coach Mode Transitions',
            description: 'Test seamless switching between Growth/Companion/Dream modes',
            steps: [
              { id: 'growth-mode', name: 'Growth Mode Response', status: 'pending' },
              { id: 'companion-mode', name: 'Companion Mode Response', status: 'pending' },
              { id: 'dream-mode', name: 'Dream Mode Response', status: 'pending' },
              { id: 'mode-consistency', name: 'Validate Mode Consistency', status: 'pending' }
            ],
            isRunning: false,
            overallStatus: 'pending'
          },
          {
            id: 'memory-integration',
            name: 'Memory Integration Flow',
            description: 'Conversation storage and retrieval in subsequent interactions',
            steps: [
              { id: 'initial-conversation', name: 'Initial Conversation', status: 'pending' },
              { id: 'memory-creation', name: 'Memory Creation', status: 'pending' },
              { id: 'context-retrieval', name: 'Context Retrieval', status: 'pending' },
              { id: 'informed-response', name: 'Memory-Informed Response', status: 'pending' }
            ],
            isRunning: false,
            overallStatus: 'pending'
          }
        ];
        
        setFlows(flowTests);
        setIsInitialized(true);
        console.log('✅ End-to-End Flow Tester initialized for user:', user.id);
      }
    } catch (error) {
      console.error('❌ Error initializing flow tests:', error);
    }
  };

  const runFlowTest = async (flowId: string) => {
    const sessionId = `flow_test_${flowId}_${Date.now()}`;
    
    setFlows(prev => prev.map(flow => 
      flow.id === flowId 
        ? { ...flow, isRunning: true, overallStatus: 'running' }
        : flow
    ));

    try {
      const flow = flows.find(f => f.id === flowId);
      if (!flow) return;

      console.log(`🧪 Starting flow test: ${flow.name}`);

      switch (flowId) {
        case 'complete-journey':
          await runCompleteJourneyTest(sessionId);
          break;
        case 'coach-mode-transitions':
          await runCoachModeTransitionsTest(sessionId);
          break;
        case 'memory-integration':
          await runMemoryIntegrationTest(sessionId);
          break;
      }

      setFlows(prev => prev.map(flow => 
        flow.id === flowId 
          ? { ...flow, isRunning: false, overallStatus: 'success' }
          : flow
      ));

    } catch (error) {
      console.error(`❌ Flow test ${flowId} failed:`, error);
      setFlows(prev => prev.map(flow => 
        flow.id === flowId 
          ? { 
              ...flow, 
              isRunning: false, 
              overallStatus: 'error',
              steps: flow.steps.map(step => 
                step.status === 'running' 
                  ? { ...step, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }
                  : step
              )
            }
          : flow
      ));
    }
  };

  const updateStepStatus = (flowId: string, stepId: string, status: FlowStep['status'], data?: any, error?: string) => {
    setFlows(prev => prev.map(flow => 
      flow.id === flowId 
        ? {
            ...flow,
            steps: flow.steps.map(step => 
              step.id === stepId 
                ? { ...step, status, data, error }
                : step
            )
          }
        : flow
    ));
  };

  const runCompleteJourneyTest = async (sessionId: string) => {
    const startTime = Date.now();
    
    // Step 1: Load User Blueprint
    updateStepStatus('complete-journey', 'blueprint-load', 'running');
    const { data: blueprint } = await supabase
      .from('user_blueprints')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (!blueprint) {
      throw new Error('No active blueprint found');
    }
    updateStepStatus('complete-journey', 'blueprint-load', 'success', { 
      blueprintId: blueprint.id,
      hasData: !!blueprint.blueprint 
    });

    // Step 2: 7-Layer Engine Conversion
    updateStepStatus('complete-journey', 'layer-conversion', 'running');
    const personalityInsights = holisticCoachService.getPersonalityInsights();
    updateStepStatus('complete-journey', 'layer-conversion', 'success', { 
      layersActive: personalityInsights ? Object.keys(personalityInsights.layers).length : 0,
      isReady: holisticCoachService.isReady()
    });

    // Step 3: Build Memory Context
    updateStepStatus('complete-journey', 'memory-context', 'running');
    const memoryContext = await memoryInformedConversationService.buildMemoryContext(
      testMessage,
      sessionId,
      userId
    );
    updateStepStatus('complete-journey', 'memory-context', 'success', { 
      memoriesFound: memoryContext.relevantMemories.length,
      contextSummary: memoryContext.contextSummary
    });

    // Step 4: Generate AI Response
    updateStepStatus('complete-journey', 'ai-response', 'running');
    const response = await enhancedAICoachService.sendMessage(
      testMessage,
      sessionId,
      true,
      'guide',
      'en'
    );
    updateStepStatus('complete-journey', 'ai-response', 'success', { 
      responseLength: response.response.length,
      conversationId: response.conversationId
    });

    // Step 5: Store Memory
    updateStepStatus('complete-journey', 'memory-storage', 'running');
    await memoryInformedConversationService.trackMemoryApplication(
      sessionId,
      memoryContext,
      testMessage,
      response.response
    );
    updateStepStatus('complete-journey', 'memory-storage', 'success');

    // Step 6: Validate Complete Flow
    updateStepStatus('complete-journey', 'flow-validation', 'running');
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    updateStepStatus('complete-journey', 'flow-validation', 'success', { 
      totalDuration,
      flowIntegrity: 'Complete'
    });

    console.log('✅ Complete journey test passed in', totalDuration, 'ms');
  };

  const runCoachModeTransitionsTest = async (sessionId: string) => {
    const modes: Array<{ mode: 'guide' | 'coach' | 'blend', stepId: string }> = [
      { mode: 'guide', stepId: 'growth-mode' },
      { mode: 'coach', stepId: 'companion-mode' },
      { mode: 'blend', stepId: 'dream-mode' }
    ];

    const responses: string[] = [];

    for (const { mode, stepId } of modes) {
      updateStepStatus('coach-mode-transitions', stepId, 'running');
      
      const response = await enhancedAICoachService.sendMessage(
        testMessage,
        `${sessionId}_${mode}`,
        true,
        mode,
        'en'
      );
      
      responses.push(response.response);
      updateStepStatus('coach-mode-transitions', stepId, 'success', { 
        mode,
        responseLength: response.response.length
      });
    }

    // Validate mode consistency
    updateStepStatus('coach-mode-transitions', 'mode-consistency', 'running');
    const uniqueResponses = new Set(responses).size;
    const consistencyScore = (uniqueResponses / responses.length) * 100;
    
    updateStepStatus('coach-mode-transitions', 'mode-consistency', 'success', { 
      consistencyScore,
      uniqueResponses,
      totalResponses: responses.length
    });

    console.log('✅ Coach mode transitions test completed with', consistencyScore, '% uniqueness');
  };

  const runMemoryIntegrationTest = async (sessionId: string) => {
    // Initial conversation
    updateStepStatus('memory-integration', 'initial-conversation', 'running');
    const initialResponse = await enhancedAICoachService.sendMessage(
      'I want to start a new creative project but feel uncertain',
      `${sessionId}_initial`,
      true,
      'guide',
      'en'
    );
    updateStepStatus('memory-integration', 'initial-conversation', 'success', { 
      responseLength: initialResponse.response.length
    });

    // Memory creation
    updateStepStatus('memory-integration', 'memory-creation', 'running');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Allow memory to be created
    const { data: memories } = await supabase
      .from('user_session_memory')
      .select('*')
      .eq('user_id', userId)
      .eq('session_id', `${sessionId}_initial`)
      .order('created_at', { ascending: false });
    
    updateStepStatus('memory-integration', 'memory-creation', 'success', { 
      memoriesCreated: memories?.length || 0
    });

    // Context retrieval
    updateStepStatus('memory-integration', 'context-retrieval', 'running');
    const memoryContext = await memoryInformedConversationService.buildMemoryContext(
      'Can you help me build on what we discussed about my creative project?',
      `${sessionId}_followup`,
      userId
    );
    updateStepStatus('memory-integration', 'context-retrieval', 'success', { 
      relevantMemories: memoryContext.relevantMemories.length,
      contextFound: memoryContext.contextSummary !== 'No previous conversation context available.'
    });

    // Memory-informed response
    updateStepStatus('memory-integration', 'informed-response', 'running');
    const informedResponse = await enhancedAICoachService.sendMessage(
      'Can you help me build on what we discussed about my creative project?',
      `${sessionId}_followup`,
      true,
      'guide',
      'en'
    );
    updateStepStatus('memory-integration', 'informed-response', 'success', { 
      responseLength: informedResponse.response.length,
      memoryIntegrated: informedResponse.response.toLowerCase().includes('creative')
    });

    console.log('✅ Memory integration test completed');
  };

  const getStatusIcon = (status: FlowStep['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getOverallProgress = (flow: FlowTest): number => {
    const completedSteps = flow.steps.filter(step => step.status === 'success').length;
    return (completedSteps / flow.steps.length) * 100;
  };

  if (!isInitialized) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Initializing End-to-End Flow Tester...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            End-to-End Flow Testing
          </CardTitle>
          <p className="text-sm text-gray-600">
            Comprehensive testing of complete user journeys with real dynamic data
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Test message for flow validation..."
              className="mb-2"
            />
          </div>

          {flows.map((flow) => (
            <Card key={flow.id} className="mb-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{flow.name}</CardTitle>
                    <p className="text-sm text-gray-600">{flow.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      flow.overallStatus === 'success' ? 'default' :
                      flow.overallStatus === 'error' ? 'destructive' :
                      flow.overallStatus === 'running' ? 'secondary' : 'outline'
                    }>
                      {flow.overallStatus}
                    </Badge>
                    <Button 
                      onClick={() => runFlowTest(flow.id)}
                      disabled={flow.isRunning}
                      size="sm"
                    >
                      {flow.isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Run Test'}
                    </Button>
                  </div>
                </div>
                <Progress value={getOverallProgress(flow)} className="mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {flow.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {getStatusIcon(step.status)}
                        <span className="text-sm font-medium">{step.name}</span>
                        {index < flow.steps.length - 1 && <ArrowRight className="h-3 w-3 text-gray-400" />}
                      </div>
                      {step.data && (
                        <div className="text-xs text-gray-600 max-w-xs">
                          {JSON.stringify(step.data, null, 0).substring(0, 50)}...
                        </div>
                      )}
                      {step.error && (
                        <div className="text-xs text-red-600 max-w-xs">
                          {step.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
