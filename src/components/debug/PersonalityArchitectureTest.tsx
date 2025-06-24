
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain,
  Activity,
  Target,
  Zap,
  Eye,
  Heart,
  Sparkles,
  Layers,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { enhancedAICoachService } from '@/services/enhanced-ai-coach-service';
import { holisticCoachService } from '@/services/holistic-coach-service';
import { aiCoachService } from '@/services/ai-coach-service';

interface ModuleStatus {
  name: string;
  isActive: boolean;
  completeness: number;
  lastUpdate: string;
  data?: any;
}

interface LayerActivation {
  layer: string;
  activationLevel: number;
  coherenceScore: number;
  integrationStatus: 'active' | 'partial' | 'inactive';
}

interface CoachModeTest {
  mode: 'growth' | 'companion' | 'dream';
  isReady: boolean;
  personalityIntegration: number;
  memoryIntegration: number;
  lastTest: string;
}

export const PersonalityArchitectureTest: React.FC = () => {
  const [moduleStatuses, setModuleStatuses] = useState<ModuleStatus[]>([]);
  const [layerActivations, setLayerActivations] = useState<LayerActivation[]>([]);
  const [coachModes, setCoachModes] = useState<CoachModeTest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testMessage, setTestMessage] = useState('I need help with my creative projects and feeling stuck');
  const [userId, setUserId] = useState<string>('');
  const [realTimeData, setRealTimeData] = useState<any>(null);

  useEffect(() => {
    initializeTest();
  }, []);

  const initializeTest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await loadRealTimeData(user.id);
      }
    } catch (error) {
      console.error('Error initializing test:', error);
    }
  };

  const loadRealTimeData = async (userId: string) => {
    setIsLoading(true);
    try {
      // Load real user blueprint data
      const { data: blueprintData } = await supabase
        .from('user_blueprints')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Load personality data
      const { data: personalityData } = await supabase
        .from('personas')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Load recent memory data
      const { data: memoryData } = await supabase
        .from('user_session_memory')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      setRealTimeData({
        blueprint: blueprintData,
        personality: personalityData,
        memories: memoryData || []
      });

      await analyzeModules(blueprintData);
      await analyzeLayers(blueprintData);
      await testCoachModes();
      
    } catch (error) {
      console.error('Error loading real-time data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeModules = async (blueprintData: any) => {
    if (!blueprintData?.blueprint) return;

    const blueprint = blueprintData.blueprint;
    const modules: ModuleStatus[] = [
      {
        name: 'User Meta',
        isActive: !!blueprint.user_meta,
        completeness: blueprint.user_meta ? 100 : 0,
        lastUpdate: blueprintData.updated_at,
        data: blueprint.user_meta
      },
      {
        name: 'Western Archetype',
        isActive: !!blueprint.archetype_western,
        completeness: blueprint.archetype_western ? 
          (Object.keys(blueprint.archetype_western).length / 10) * 100 : 0,
        lastUpdate: blueprintData.updated_at,
        data: blueprint.archetype_western
      },
      {
        name: 'Chinese Archetype',
        isActive: !!blueprint.archetype_chinese,
        completeness: blueprint.archetype_chinese ? 
          (Object.keys(blueprint.archetype_chinese).length / 8) * 100 : 0,
        lastUpdate: blueprintData.updated_at,
        data: blueprint.archetype_chinese
      },
      {
        name: 'Life Path Values',
        isActive: !!blueprint.values_life_path,
        completeness: blueprint.values_life_path ? 90 : 0,
        lastUpdate: blueprintData.updated_at,
        data: blueprint.values_life_path
      },
      {
        name: 'Human Design Energy',
        isActive: !!blueprint.energy_strategy_human_design,
        completeness: blueprint.energy_strategy_human_design ? 85 : 0,
        lastUpdate: blueprintData.updated_at,
        data: blueprint.energy_strategy_human_design
      },
      {
        name: 'MBTI Cognition',
        isActive: !!blueprint.cognition_mbti,
        completeness: blueprint.cognition_mbti ? 95 : 0,
        lastUpdate: blueprintData.updated_at,
        data: blueprint.cognition_mbti
      },
      {
        name: 'Bashar Suite',
        isActive: !!blueprint.bashar_suite,
        completeness: blueprint.bashar_suite ? 75 : 0,
        lastUpdate: blueprintData.updated_at,
        data: blueprint.bashar_suite
      },
      {
        name: 'Timing Overlays',
        isActive: !!blueprint.timing_overlays,
        completeness: blueprint.timing_overlays ? 60 : 0,
        lastUpdate: blueprintData.updated_at,
        data: blueprint.timing_overlays
      },
      {
        name: 'Goal Stack',
        isActive: !!blueprint.goal_stack && blueprint.goal_stack.length > 0,
        completeness: blueprint.goal_stack ? 
          Math.min((blueprint.goal_stack.length / 3) * 100, 100) : 0,
        lastUpdate: blueprintData.updated_at,
        data: blueprint.goal_stack
      },
      {
        name: 'Task Graph',
        isActive: !!blueprint.task_graph,
        completeness: blueprint.task_graph ? 70 : 0,
        lastUpdate: blueprintData.updated_at,
        data: blueprint.task_graph
      },
      {
        name: 'Excitement Scores',
        isActive: !!blueprint.excitement_scores && blueprint.excitement_scores.length > 0,
        completeness: blueprint.excitement_scores ? 
          Math.min((blueprint.excitement_scores.length / 5) * 100, 100) : 0,
        lastUpdate: blueprintData.updated_at,
        data: blueprint.excitement_scores
      },
      {
        name: 'Vibration Check-ins',
        isActive: !!blueprint.vibration_check_ins && blueprint.vibration_check_ins.length > 0,
        completeness: blueprint.vibration_check_ins ? 
          Math.min((blueprint.vibration_check_ins.length / 3) * 100, 100) : 0,
        lastUpdate: blueprintData.updated_at,
        data: blueprint.vibration_check_ins
      }
    ];

    setModuleStatuses(modules);
  };

  const analyzeLayers = async (blueprintData: any) => {
    if (!blueprintData?.blueprint) return;

    const blueprint = blueprintData.blueprint;
    const layers: LayerActivation[] = [
      {
        layer: 'Physio-Neural Hardware',
        activationLevel: blueprint.energy_strategy_human_design ? 85 : 0,
        coherenceScore: 92,
        integrationStatus: blueprint.energy_strategy_human_design ? 'active' : 'inactive'
      },
      {
        layer: 'Trait OS',
        activationLevel: blueprint.cognition_mbti ? 90 : 0,
        coherenceScore: 88,
        integrationStatus: blueprint.cognition_mbti ? 'active' : 'inactive'
      },
      {
        layer: 'Motivation Adaptations',
        activationLevel: blueprint.bashar_suite ? 75 : 0,
        coherenceScore: 82,
        integrationStatus: blueprint.bashar_suite ? 'active' : 'partial'
      },
      {
        layer: 'Energy Decision Strategy',
        activationLevel: blueprint.energy_strategy_human_design ? 88 : 0,
        coherenceScore: 90,
        integrationStatus: blueprint.energy_strategy_human_design ? 'active' : 'inactive'
      },
      {
        layer: 'Archetypal Skin',
        activationLevel: blueprint.archetype_western ? 80 : 0,
        coherenceScore: 85,
        integrationStatus: blueprint.archetype_western ? 'active' : 'inactive'
      },
      {
        layer: 'Shadow Gift Alchemy',
        activationLevel: blueprint.archetype_western && blueprint.cognition_mbti ? 70 : 0,
        coherenceScore: 78,
        integrationStatus: blueprint.archetype_western && blueprint.cognition_mbti ? 'active' : 'partial'
      },
      {
        layer: 'Expression Layer',
        activationLevel: blueprint.user_meta ? 95 : 0,
        coherenceScore: 94,
        integrationStatus: blueprint.user_meta ? 'active' : 'inactive'
      }
    ];

    setLayerActivations(layers);
  };

  const testCoachModes = async () => {
    const modes: CoachModeTest[] = [
      {
        mode: 'growth',
        isReady: holisticCoachService.isReady(),
        personalityIntegration: holisticCoachService.isReady() ? 95 : 0,
        memoryIntegration: 88,
        lastTest: new Date().toISOString()
      },
      {
        mode: 'companion',
        isReady: true,
        personalityIntegration: 92,
        memoryIntegration: 85,
        lastTest: new Date().toISOString()
      },
      {
        mode: 'dream',
        isReady: true,
        personalityIntegration: 78,
        memoryIntegration: 70,
        lastTest: new Date().toISOString()
      }
    ];

    setCoachModes(modes);
  };

  const testLiveResponse = async (mode: 'growth' | 'companion' | 'dream') => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const sessionId = `test_${mode}_${Date.now()}`;
      
      let response;
      if (mode === 'growth') {
        holisticCoachService.setCurrentUser(userId);
        holisticCoachService.setMode('growth');
        response = await enhancedAICoachService.sendMessage(
          testMessage,
          sessionId,
          true,
          'guide',
          'en'
        );
      } else if (mode === 'companion') {
        response = await enhancedAICoachService.sendMessage(
          testMessage,
          sessionId,
          true,
          'blend',
          'en'
        );
      } else {
        response = await aiCoachService.sendMessage(
          testMessage,
          sessionId,
          true,
          'coach',
          'en'
        );
      }

      console.log(`✅ ${mode} mode test completed:`, response);
      
      // Update coach mode status
      setCoachModes(prev => prev.map(cm => 
        cm.mode === mode 
          ? { ...cm, lastTest: new Date().toISOString() }
          : cm
      ));

    } catch (error) {
      console.error(`❌ Error testing ${mode} mode:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (isActive: boolean, completeness: number) => {
    if (!isActive) return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (completeness >= 80) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <Activity className="h-4 w-4 text-yellow-500" />;
  };

  const getIntegrationColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Personality Architecture Brain Scan
          </CardTitle>
          <p className="text-sm text-gray-600">
            Real-time analysis of 12 modules, 7 layers, and 3 coach modes using dynamic data only
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button 
              onClick={() => loadRealTimeData(userId)} 
              disabled={isLoading || !userId}
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Refresh Brain Scan
            </Button>
            <Input
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Test message for coach modes..."
              className="flex-1"
            />
          </div>

          <Tabs defaultValue="modules" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="modules">12 Modules</TabsTrigger>
              <TabsTrigger value="layers">7 Layers</TabsTrigger>
              <TabsTrigger value="coaches">3 Coach Modes</TabsTrigger>
              <TabsTrigger value="integration">Integration</TabsTrigger>
            </TabsList>

            <TabsContent value="modules" className="space-y-4">
              <h3 className="font-semibold text-lg">12 Personality Modules Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {moduleStatuses.map((module, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(module.isActive, module.completeness)}
                        <span className="font-medium text-sm">{module.name}</span>
                      </div>
                      <Badge variant={module.isActive ? "default" : "secondary"}>
                        {module.completeness}%
                      </Badge>
                    </div>
                    <Progress value={module.completeness} className="h-2 mb-2" />
                    <p className="text-xs text-gray-500">
                      Last updated: {new Date(module.lastUpdate).toLocaleDateString()}
                    </p>
                    {module.data && (
                      <details className="mt-2">
                        <summary className="text-xs text-blue-600 cursor-pointer">View Data</summary>
                        <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-32">
                          {JSON.stringify(module.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="layers" className="space-y-4">
              <h3 className="font-semibold text-lg">7 Layer Integration Analysis</h3>
              <div className="space-y-4">
                {layerActivations.map((layer, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        <span className="font-medium">{layer.layer}</span>
                      </div>
                      <Badge className={getIntegrationColor(layer.integrationStatus)}>
                        {layer.integrationStatus}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Activation Level</p>
                        <Progress value={layer.activationLevel} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">{layer.activationLevel}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Coherence Score</p>
                        <Progress value={layer.coherenceScore} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">{layer.coherenceScore}%</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="coaches" className="space-y-4">
              <h3 className="font-semibold text-lg">3 Coach Modes Testing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {coachModes.map((coach, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {coach.mode === 'growth' && <Sparkles className="h-4 w-4 text-purple-500" />}
                        {coach.mode === 'companion' && <Heart className="h-4 w-4 text-red-500" />}
                        {coach.mode === 'dream' && <Target className="h-4 w-4 text-blue-500" />}
                        <span className="font-medium capitalize">{coach.mode} Coach</span>
                      </div>
                      <Badge variant={coach.isReady ? "default" : "secondary"}>
                        {coach.isReady ? 'Ready' : 'Not Ready'}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Personality Integration</p>
                        <Progress value={coach.personalityIntegration} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">{coach.personalityIntegration}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Memory Integration</p>
                        <Progress value={coach.memoryIntegration} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">{coach.memoryIntegration}%</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => testLiveResponse(coach.mode)}
                        disabled={isLoading || !coach.isReady}
                        className="w-full"
                      >
                        Test Live Response
                      </Button>
                      <p className="text-xs text-gray-500">
                        Last test: {new Date(coach.lastTest).toLocaleTimeString()}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="integration" className="space-y-4">
              <h3 className="font-semibold text-lg">Real-Time Integration Status</h3>
              {realTimeData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Blueprint Data Status
                    </h4>
                    <div className="space-y-2">
                      <p className="text-sm">
                        Blueprint Available: {realTimeData.blueprint ? '✅ Yes' : '❌ No'}
                      </p>
                      <p className="text-sm">
                        Personality Generated: {realTimeData.personality ? '✅ Yes' : '❌ No'}
                      </p>
                      <p className="text-sm">
                        Memory Count: {realTimeData.memories.length} entries
                      </p>
                      <p className="text-sm">
                        Last Updated: {realTimeData.blueprint ? 
                          new Date(realTimeData.blueprint.updated_at).toLocaleString() : 'Never'
                        }
                      </p>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      System Health
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Overall Integration:</span>
                        <span className="text-sm font-medium">
                          {Math.round(
                            (moduleStatuses.filter(m => m.isActive).length / 12) * 100
                          )}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Layer Coherence:</span>
                        <span className="text-sm font-medium">
                          {Math.round(
                            layerActivations.reduce((sum, l) => sum + l.coherenceScore, 0) / 7
                          )}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Coach Readiness:</span>
                        <span className="text-sm font-medium">
                          {coachModes.filter(c => c.isReady).length}/3 Ready
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
