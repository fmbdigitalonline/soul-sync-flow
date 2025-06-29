import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  MessageSquare, 
  Play, 
  Square, 
  RotateCcw, 
  Eye, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  Zap,
  FileText,
  Activity
} from 'lucide-react';
import { ACSConfig, DialogueState, DialogueHealthMetrics } from '@/types/acs-types';
import { acsRealAIIntegrationService } from '@/services/acs-real-ai-integration';
import { acsEnhancedStateDetection } from '@/services/acs-enhanced-state-detection';
import { acsEvidenceCollection, PatentClaimEvidence } from '@/services/acs-evidence-collection';

const ACSPatentTestSuite: React.FC = () => {
  // Test state management
  const [isRunning, setIsRunning] = useState(false);
  const [currentState, setCurrentState] = useState<DialogueState>('NORMAL');
  const [testMessage, setTestMessage] = useState('');
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [patentClaims, setPatentClaims] = useState<PatentClaimEvidence[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<DialogueHealthMetrics | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<number>(1);
  const [testResults, setTestResults] = useState<any>(null);
  const [idleCountdown, setIdleCountdown] = useState<number>(0);
  
  // Test configuration
  const [config] = useState<ACSConfig>({
    velocityFloor: 0.5,
    sentimentSlopeNeg: -0.2,
    maxSilentMs: 45000, // 45 seconds for idle detection
    frustrationThreshold: 0.25, // LOWERED from 0.4 to 0.25 for better detection
    clarificationThreshold: 0.6,
    enableRL: true,
    personalityScaling: true
  });

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize evidence collection
    acsEvidenceCollection.initializeEvidenceCollection();
    loadPatentClaims();
  }, []);

  useEffect(() => {
    if (isRunning) {
      startIdleMonitoring();
    } else {
      stopIdleMonitoring();
    }
    
    return () => stopIdleMonitoring();
  }, [isRunning]);

  const loadPatentClaims = () => {
    const claims = acsEvidenceCollection.getAllClaimsEvidence();
    setPatentClaims(claims);
  };

  const startIdleMonitoring = () => {
    stopIdleMonitoring();
    setIdleCountdown(config.maxSilentMs / 1000);
    
    // Start countdown
    countdownRef.current = setInterval(() => {
      setIdleCountdown(prev => {
        if (prev <= 1) {
          handleIdleStateDetected();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopIdleMonitoring = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setIdleCountdown(0);
  };

  const resetIdleTimer = () => {
    if (isRunning) {
      startIdleMonitoring();
    }
  };

  const handleIdleStateDetected = () => {
    console.log("⏰ Idle state detected - triggering check-in");
    
    const idleMetrics: DialogueHealthMetrics = {
      conversationVelocity: 0,
      sentimentSlope: 0,
      silentDuration: config.maxSilentMs,
      frustrationScore: 0,
      helpSignals: [],
      timestamp: Date.now()
    };
    
    // Record idle state transition
    acsEnhancedStateDetection.recordStateTransition(
      currentState,
      'IDLE',
      'Idle timeout reached',
      0.95
    );
    
    setCurrentState('IDLE');
    setCurrentMetrics(idleMetrics);
    
    // Collect evidence for Claim 5 (Idle State Check-in)
    acsEvidenceCollection.collectStateTransitionEvidence(
      currentState,
      'IDLE',
      'Idle timeout reached after 45 seconds',
      0.95,
      idleMetrics
    );
    
    // Add automated check-in message
    const checkInMessage = {
      type: 'system',
      content: "I notice you've been quiet for a while. Is there anything specific I can help you with?",
      timestamp: new Date().toISOString(),
      state: 'IDLE'
    };
    
    setConversationHistory(prev => [...prev, checkInMessage]);
    loadPatentClaims();
    
    stopIdleMonitoring();
  };

  const sendTestMessage = async () => {
    if (!testMessage.trim() || !isRunning) return;

    resetIdleTimer();
    
    const userMessage = {
      type: 'user',
      content: testMessage,
      timestamp: new Date().toISOString(),
      state: currentState
    };
    
    setConversationHistory(prev => [...prev, userMessage]);
    setTestMessage('');

    try {
      console.log("🧪 ACS Real AI Integration Test - Sending message:", testMessage);
      console.log("⚙️ Using enhanced config with frustration threshold:", config.frustrationThreshold);
      
      // Use real AI integration service
      const response = await acsRealAIIntegrationService.sendMessage(
        testMessage,
        config,
        currentState
      );
      
      // Update state and metrics
      setCurrentState(response.newState);
      setCurrentMetrics(response.metrics);
      
      // Record conversation evidence
      acsEvidenceCollection.collectConversationEvidence(
        testMessage,
        response.response,
        response.newState,
        response.metrics,
        response.promptModifications
      );
      
      // Record state transition if changed
      if (response.newState !== currentState) {
        acsEvidenceCollection.collectStateTransitionEvidence(
          currentState,
          response.newState,
          'AI response triggered state change',
          0.85,
          response.metrics
        );
      }
      
      // Add AI response to conversation
      const aiMessage = {
        type: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
        state: response.newState,
        evidence: response.evidence
      };
      
      setConversationHistory(prev => [...prev, aiMessage]);
      
      // Refresh patent claims with new evidence
      loadPatentClaims();
      
      console.log("✅ ACS Real AI Test completed with state:", response.newState);
      
    } catch (error) {
      console.error("❌ ACS Real AI Test error:", error);
      
      const errorMessage = {
        type: 'error',
        content: `Error: ${error.message}`,
        timestamp: new Date().toISOString(),
        state: currentState
      };
      
      setConversationHistory(prev => [...prev, errorMessage]);
    }
  };

  const startTesting = () => {
    console.log("🚀 Starting ACS Patent Test Suite with Real AI Integration");
    setIsRunning(true);
    setCurrentState('NORMAL');
    setConversationHistory([{
      type: 'system',
      content: 'ACS Patent Test Suite started. Real AI integration active with state monitoring.',
      timestamp: new Date().toISOString(),
      state: 'NORMAL'
    }]);
    acsEvidenceCollection.initializeEvidenceCollection();
  };

  const stopTesting = () => {
    console.log("⏹️ Stopping ACS Patent Test Suite");
    setIsRunning(false);
    stopIdleMonitoring();
  };

  const resetTesting = () => {
    console.log("🔄 Resetting ACS Patent Test Suite");
    setIsRunning(false);
    setCurrentState('NORMAL');
    setConversationHistory([]);
    setCurrentMetrics(null);
    setIdleCountdown(0);
    stopIdleMonitoring();
    acsEvidenceCollection.initializeEvidenceCollection();
    loadPatentClaims();
  };

  const generatePatentReport = async () => {
    try {
      const report = await acsEvidenceCollection.generatePatentComplianceReport();
      setTestResults(report);
      console.log("📋 Patent compliance report generated:", report);
    } catch (error) {
      console.error("❌ Error generating patent report:", error);
    }
  };

  const getStateColor = (state: DialogueState): string => {
    switch (state) {
      case 'NORMAL': return 'bg-green-100 text-green-800';
      case 'CLARIFICATION_NEEDED': return 'bg-yellow-100 text-yellow-800';
      case 'FRUSTRATION_DETECTED': return 'bg-red-100 text-red-800';
      case 'IDLE': return 'bg-blue-100 text-blue-800';
      case 'HIGH_ENGAGEMENT': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClaimStatus = (claim: PatentClaimEvidence): 'passed' | 'warning' | 'failed' => {
    if (claim.evidenceItems.length === 0) return 'failed';
    if (claim.complianceScore >= 0.8) return 'passed';
    return 'warning';
  };

  return (
    <div className="w-full space-y-6">
      {/* Header with Real-Time Status */}
      <Card className="border-red-200 bg-red-50/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-red-600" />
                ACS Patent Validation Suite - Real AI Integration
                <Badge variant="destructive">US Provisional Patent</Badge>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Live conversation testing with real AI responses, state transitions, and patent evidence collection
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStateColor(currentState)}>
                {currentState}
              </Badge>
              {isRunning && idleCountdown > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {idleCountdown}s
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={startTesting}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Start Testing
            </Button>
            <Button
              onClick={stopTesting}
              disabled={!isRunning}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Stop Testing
            </Button>
            <Button
              onClick={resetTesting}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              onClick={generatePatentReport}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Generate Patent Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="conversation" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="conversation">Live Conversation</TabsTrigger>
          <TabsTrigger value="claims">Patent Claims ({patentClaims.length})</TabsTrigger>
          <TabsTrigger value="metrics">Real-Time Metrics</TabsTrigger>
          <TabsTrigger value="evidence">Evidence Package</TabsTrigger>
        </TabsList>

        {/* Live Conversation Tab */}
        <TabsContent value="conversation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Real AI Conversation Testing
                {isRunning && (
                  <Badge className="ml-2 bg-green-100 text-green-800">
                    <Activity className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Conversation History */}
              <div className="h-64 overflow-y-auto border rounded p-4 space-y-2 bg-gray-50">
                {conversationHistory.map((message, index) => (
                  <div key={index} className={`p-2 rounded ${
                    message.type === 'user' ? 'bg-blue-100 ml-8' :
                    message.type === 'assistant' ? 'bg-white mr-8' :
                    message.type === 'system' ? 'bg-yellow-100' :
                    'bg-red-100'
                  }`}>
                    <div className="text-xs text-gray-500 mb-1">
                      {message.timestamp} | {message.state}
                    </div>
                    <div className="text-sm">{message.content}</div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Input
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Type your test message here..."
                  disabled={!isRunning}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendTestMessage();
                    }
                  }}
                />
                <Button 
                  onClick={sendTestMessage}
                  disabled={!isRunning || !testMessage.trim()}
                >
                  Send
                </Button>
              </div>

              {/* Test Suggestions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTestMessage("This is stupid, you're not helping me")}
                  disabled={!isRunning}
                >
                  Test Frustration Detection
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTestMessage("What do you mean by that? I don't understand")}
                  disabled={!isRunning}
                >
                  Test Clarification Needed
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patent Claims Tab */}
        <TabsContent value="claims" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patentClaims.map((claim) => {
              const status = getClaimStatus(claim);
              return (
                <Card key={claim.claimNumber} className={`cursor-pointer transition-all ${
                  selectedClaim === claim.claimNumber ? 'ring-2 ring-blue-500' : ''
                } ${
                  status === 'passed' ? 'border-green-200' :
                  status === 'warning' ? 'border-yellow-200' :
                  'border-red-200'
                }`}
                onClick={() => setSelectedClaim(claim.claimNumber)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Claim {claim.claimNumber}</span>
                      {status === 'passed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                      {status === 'failed' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                    </div>
                    <h4 className="text-sm font-semibold">{claim.claimTitle}</h4>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {Object.entries(claim.kpiMetrics).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="text-gray-600">{key}</span>
                          <span className="font-mono">{typeof value === 'number' ? value.toFixed(3) : value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Evidence Count: {claim.evidenceItems.length}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Last Updated: {new Date(claim.lastUpdated).toLocaleString()}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(`Viewing evidence for Claim ${claim.claimNumber}:`, claim.evidenceItems);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Latest Evidence
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Real-Time Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Real-Time ACS Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentMetrics ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Conversation Velocity</label>
                    <div className="text-2xl font-mono">{currentMetrics.conversationVelocity.toFixed(3)}</div>
                    <Progress value={Math.min(currentMetrics.conversationVelocity * 20, 100)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sentiment Slope</label>
                    <div className="text-2xl font-mono">{currentMetrics.sentimentSlope.toFixed(3)}</div>
                    <Progress value={Math.max(0, (currentMetrics.sentimentSlope + 1) * 50)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Frustration Score</label>
                    <div className="text-2xl font-mono">{currentMetrics.frustrationScore.toFixed(3)}</div>
                    <Progress value={currentMetrics.frustrationScore * 100} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Help Signals</label>
                    <div className="text-2xl font-mono">{currentMetrics.helpSignals.length}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Silent Duration</label>
                    <div className="text-2xl font-mono">{Math.round(currentMetrics.silentDuration / 1000)}s</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current State</label>
                    <Badge className={getStateColor(currentState)}>
                      {currentState}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No metrics available. Start testing to see real-time data.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evidence Package Tab */}
        <TabsContent value="evidence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Patent Evidence Package
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testResults ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{testResults.patentReadiness}%</div>
                      <div className="text-sm text-gray-600">Patent Readiness</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{testResults.summary.stateTransitions}</div>
                      <div className="text-sm text-gray-600">State Transitions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{Math.round(testResults.summary.averageLatency)}ms</div>
                      <div className="text-sm text-gray-600">Avg Response Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{Math.round(testResults.summary.successRate * 100)}%</div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                    </div>
                  </div>
                  
                  {testResults.recommendations.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Recommendations:</h4>
                      <ul className="space-y-1">
                        {testResults.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Generate a patent compliance report to view evidence package.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ACSPatentTestSuite;
