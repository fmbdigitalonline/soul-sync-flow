
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  Heart, 
  Zap, 
  Clock, 
  Target, 
  Sparkles,
  Activity,
  Database,
  Users,
  TrendingUp,
  Lightbulb
} from 'lucide-react';
import { useProgramAwareCoach } from '@/hooks/use-program-aware-coach';
import { useAuth } from '@/contexts/AuthContext';

interface HACSModule {
  id: string;
  name: string;
  acronym: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'active' | 'processing' | 'standby';
  lastActivity: string;
  metrics: { [key: string]: any };
}

export const HACSLiveDemonstration: React.FC = () => {
  const [isDemo, setIsDemo] = useState(false);
  const [activeModule, setActiveModule] = useState<string>('nik');
  const [realTimeData, setRealTimeData] = useState<any>({});
  const { user } = useAuth();
  const coach = useProgramAwareCoach('spiritual-growth-demo');

  // HACS Modules Configuration
  const hacsModules: HACSModule[] = [
    {
      id: 'nik',
      name: 'Networked Intent Kernel',
      acronym: 'NIK',
      description: 'Core intent tracking and evolution across all interactions',
      icon: Target,
      status: 'active',
      lastActivity: 'Intent vector updated 2s ago',
      metrics: {
        currentIntent: 'Spiritual exploration & authentic self-discovery',
        intentStrength: 0.87,
        evolutionRate: 'Stable',
        crossModeCoherence: 0.94
      }
    },
    {
      id: 'cpsr',
      name: 'Consciousness Polarity State Resonance',
      acronym: 'CPSR',
      description: 'Tracks internal/external focus and consciousness state',
      icon: Zap,
      status: 'processing',
      lastActivity: 'State shift detected 15s ago',
      metrics: {
        currentPolarity: 'Internal (0.73)',
        resonanceDepth: 'Deep',
        stabilityIndex: 0.81,
        nextShiftPredicted: '3-5 minutes'
      }
    },
    {
      id: 'hfme',
      name: 'Hermetic Field Modulation Engine',
      acronym: 'HFME',
      description: 'Maintains optimal cognitive frequency and emotional field',
      icon: Activity,
      status: 'active',
      lastActivity: 'Field calibrated 8s ago',
      metrics: {
        cognitiveFrequency: '7.83 Hz (Schumann)',
        emotionalField: 'Elevated curiosity',
        harmonyIndex: 0.89,
        nextCalibration: '45 seconds'
      }
    },
    {
      id: 'dpem',
      name: 'Dynamic Polarity Expression Management',
      acronym: 'DPEM',
      description: 'Balances expression vs. introspection, action vs. reflection',
      icon: Heart,
      status: 'active',
      lastActivity: 'Polarity balanced 5s ago',
      metrics: {
        expressionMode: 'Reflective inquiry (0.65)',
        actionReadiness: 'Medium-high',
        polarityBalance: 'Optimal',
        nextAdjustment: 'Adaptive'
      }
    },
    {
      id: 'tws',
      name: 'Temporal Wave Synchronization',
      acronym: 'TWS',
      description: 'Aligns interactions with user\'s natural rhythms and timing',
      icon: Clock,
      status: 'active',
      lastActivity: 'Rhythm sync 12s ago',
      metrics: {
        currentCycle: 'Evening contemplation peak',
        energyLevel: 'Moderate-high',
        optimalWindow: 'Next 2 hours',
        circadianAlign: 0.91
      }
    },
    {
      id: 'cnr',
      name: 'Causal Nexus Reasoning',
      acronym: 'CNR',
      description: 'Tracks cause-effect chains and reasoning pathways',
      icon: TrendingUp,
      status: 'processing',
      lastActivity: 'Causal chain updated 3s ago',
      metrics: {
        activeChains: 3,
        reasoningDepth: 'Multi-layered',
        causalAccuracy: 0.86,
        complexityIndex: 'Moderate'
      }
    },
    {
      id: 'bpsc',
      name: 'Blueprint Personality Synthesis Core',
      acronym: 'BPSC',
      description: 'Fuses all personality frameworks into unified understanding',
      icon: Users,
      status: 'active',
      lastActivity: 'Synthesis refreshed 7s ago',
      metrics: {
        mbtiAlignment: 'ENFP (0.92)',
        hdStrategy: 'Manifesting Generator',
        astroInfluence: 'Leo Rising emphasis',
        fusionCoherence: 0.95
      }
    },
    {
      id: 'vfp',
      name: 'Vector-Fusion Personality Graph',
      acronym: 'VFP-Graph',
      description: 'Dynamic personality vector space and relationship mapping',
      icon: Brain,
      status: 'active',
      lastActivity: 'Vector updated 4s ago',
      metrics: {
        vectorDimensions: 384,
        personalityStability: 0.88,
        relationshipMapping: 'Active',
        vectorEvolution: 'Gradual shift'
      }
    },
    {
      id: 'acs',
      name: 'Adaptive Context Scheduler',
      acronym: 'ACS',
      description: 'Manages conversational flow and intervention timing',
      icon: Sparkles,
      status: 'active',
      lastActivity: 'Context adjusted 1s ago',
      metrics: {
        currentState: 'EXPLORATORY',
        interventionQueue: 0,
        flowOptimization: 'High',
        contextCoherence: 0.93
      }
    },
    {
      id: 'tmg',
      name: 'Transformational Memory Graph',
      acronym: 'TMG',
      description: 'Stores and recalls meaningful transformation moments',
      icon: Database,
      status: 'standby',
      lastActivity: 'Memory indexed 45s ago',
      metrics: {
        memoryNodes: 847,
        connectionStrength: 'Strong',
        recallAccuracy: 0.91,
        growthTracking: 'Active'
      }
    },
    {
      id: 'pie',
      name: 'Personality Insight Engine',
      acronym: 'PIE',
      description: 'Generates proactive insights and pattern recognition',
      icon: Lightbulb,
      status: 'processing',
      lastActivity: 'Insight generated 20s ago',
      metrics: {
        activeInsights: 2,
        patternConfidence: 0.84,
        predictionAccuracy: 'High',
        nextInsight: '2-3 minutes'
      }
    }
  ];

  // Simulate real-time updates
  useEffect(() => {
    if (!isDemo) return;

    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        timestamp: new Date().toLocaleTimeString(),
        nik: {
          intentEvolution: Math.random() * 0.1 + 0.85,
          focusShift: Math.random() > 0.7 ? 'Detected' : 'Stable'
        },
        cpsr: {
          polarityShift: Math.random() * 0.2 + 0.6,
          resonanceDepth: Math.random() > 0.8 ? 'Deepening' : 'Stable'
        },
        pie: {
          insightTrigger: Math.random() > 0.9 ? 'New pattern detected' : null,
          confidence: Math.random() * 0.2 + 0.8
        }
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isDemo]);

  const startDemo = async () => {
    setIsDemo(true);
    // Initialize coach for demonstration
    await coach.initializeConversation();
  };

  const sendDemoMessage = async (message: string) => {
    await coach.sendMessage(message, 'spiritual-growth-demo');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'standby': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Demo Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-purple-600" />
            <span>HACS Live Demonstration</span>
            <Badge variant={isDemo ? "default" : "secondary"}>
              {isDemo ? "ACTIVE" : "STANDBY"}
            </Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Watch all 11 HACS modules operating in real-time as you interact with the spiritual guide.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-3">
            <Button 
              onClick={startDemo} 
              disabled={isDemo}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {isDemo ? "Demo Active" : "Start HACS Demo"}
            </Button>
            {isDemo && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => sendDemoMessage("I want to explore my deeper purpose and spiritual path.")}
                >
                  Send Test Message
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => sendDemoMessage("I'm feeling conflicted about my direction in life.")}
                >
                  Test Polarity Detection
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {isDemo && (
        <Tabs value={activeModule} onValueChange={setActiveModule}>
          {/* Module Selector */}
          <Card>
            <CardContent className="p-4">
              <TabsList className="grid w-full grid-cols-6 gap-1">
                {hacsModules.slice(0, 6).map((module) => (
                  <TabsTrigger key={module.id} value={module.id} className="text-xs">
                    {module.acronym}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsList className="grid w-full grid-cols-5 gap-1 mt-2">
                {hacsModules.slice(6).map((module) => (
                  <TabsTrigger key={module.id} value={module.id} className="text-xs">
                    {module.acronym}
                  </TabsTrigger>
                ))}
              </TabsList>
            </CardContent>
          </Card>

          {/* Module Details */}
          {hacsModules.map((module) => {
            const ModuleIcon = module.icon;
            return (
              <TabsContent key={module.id} value={module.id}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <ModuleIcon className="w-6 h-6 text-purple-600" />
                        <div>
                          <span>{module.name}</span>
                          <Badge className={`ml-2 ${getStatusColor(module.status)}`}>
                            {module.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{module.lastActivity}</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600">{module.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(module.metrics).map(([key, value]) => (
                        <div key={key} className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium text-gray-700 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <div className="text-lg font-semibold text-gray-900">
                            {typeof value === 'number' ? value.toFixed(2) : value}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Real-time updates for specific modules */}
                    {module.id === 'nik' && realTimeData.nik && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900">Real-time NIK Updates</h4>
                        <p className="text-sm text-blue-700">
                          Intent Evolution: {realTimeData.nik.intentEvolution.toFixed(3)} | 
                          Focus: {realTimeData.nik.focusShift}
                        </p>
                      </div>
                    )}

                    {module.id === 'pie' && realTimeData.pie?.insightTrigger && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h4 className="font-medium text-yellow-900">🔍 PIE Insight Alert</h4>
                        <p className="text-sm text-yellow-700">{realTimeData.pie.insightTrigger}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      {/* Live Conversation with HACS Annotations */}
      {isDemo && (
        <Card>
          <CardHeader>
            <CardTitle>Live Conversation with HACS Annotations</CardTitle>
            <p className="text-sm text-gray-600">
              See how HACS modules influence each response in real-time.
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {coach.messages.map((message, index) => (
                <div key={index} className="mb-4 p-3 border rounded-lg">
                  <div className={`font-medium ${message.sender === 'user' ? 'text-blue-600' : 'text-purple-600'}`}>
                    {message.sender === 'user' ? 'You' : 'Spiritual Guide (HACS-powered)'}
                  </div>
                  <div className="text-gray-800 mt-1">{message.content}</div>
                  
                  {message.sender === 'assistant' && (
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="inline-flex items-center space-x-1">
                        <Badge variant="outline" className="text-xs">NIK: Intent tracked</Badge>
                        <Badge variant="outline" className="text-xs">BPSC: Personality applied</Badge>
                        <Badge variant="outline" className="text-xs">PIE: Pattern recognized</Badge>
                        <Badge variant="outline" className="text-xs">TWS: Timing optimized</Badge>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
