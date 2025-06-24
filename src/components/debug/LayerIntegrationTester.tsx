
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Layers,
  Brain,
  Zap,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { holisticCoachService } from '@/services/holistic-coach-service';
import { enhancedAICoachService } from '@/services/enhanced-ai-coach-service';

interface LayerData {
  id: string;
  name: string;
  isActive: boolean;
  data: any;
  completeness: number;
  lastActivated?: string;
}

interface LayerIntegrationTest {
  id: string;
  name: string;
  description: string;
  score: number;
  status: 'pending' | 'running' | 'success' | 'warning' | 'error';
  details: string[];
  contradictions: string[];
}

interface CrossLayerAnalysis {
  coherence: number;
  contradictions: number;
  synergies: number;
  activationPattern: string[];
}

export const LayerIntegrationTester: React.FC = () => {
  const [layers, setLayers] = useState<LayerData[]>([]);
  const [integrationTests, setIntegrationTests] = useState<LayerIntegrationTest[]>([]);
  const [crossLayerAnalysis, setCrossLayerAnalysis] = useState<CrossLayerAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testMessage, setTestMessage] = useState('I need guidance on balancing my creative energy with my practical goals');
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    initializeLayerTesting();
  }, []);

  const initializeLayerTesting = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await enhancedAICoachService.setCurrentUser(user.id);
        await loadLayerData();
        console.log('✅ Layer Integration Tester initialized');
      }
    } catch (error) {
      console.error('❌ Error initializing layer tests:', error);
    }
  };

  const loadLayerData = async () => {
    try {
      // Get user blueprint
      const { data: blueprint } = await supabase
        .from('user_blueprints')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!blueprint?.blueprint) {
        console.log('⚠️ No blueprint data available');
        return;
      }

      const blueprintData = blueprint.blueprint as any;

      // Map to 7-layer structure
      const layerData: LayerData[] = [
        {
          id: 'physio-neural',
          name: 'Physio-Neural Hardware',
          isActive: !!(blueprintData.energy_strategy_human_design?.type),
          data: blueprintData.energy_strategy_human_design || {},
          completeness: calculateCompleteness(blueprintData.energy_strategy_human_design)
        },
        {
          id: 'trait-os',
          name: 'Trait Operating System',
          isActive: !!(blueprintData.cognition_mbti?.type),
          data: blueprintData.cognition_mbti || {},
          completeness: calculateCompleteness(blueprintData.cognition_mbti)
        },
        {
          id: 'motivation-engine',
          name: 'Motivation Engine',
          isActive: !!(blueprintData.values_life_path),
          data: blueprintData.values_life_path || {},
          completeness: calculateCompleteness(blueprintData.values_life_path)
        },
        {
          id: 'energy-strategy',
          name: 'Energy & Decision Strategy',
          isActive: !!(blueprintData.energy_strategy_human_design?.authority),
          data: { authority: blueprintData.energy_strategy_human_design?.authority },
          completeness: blueprintData.energy_strategy_human_design?.authority ? 100 : 0
        },
        {
          id: 'archetypal-skin',
          name: 'Archetypal Skin',
          isActive: !!(blueprintData.archetype_western?.sun_sign),
          data: blueprintData.archetype_western || {},
          completeness: calculateCompleteness(blueprintData.archetype_western)
        },
        {
          id: 'shadow-gift',
          name: 'Shadow-Gift Alchemy',
          isActive: !!(blueprintData.timing_overlays),
          data: blueprintData.timing_overlays || {},
          completeness: calculateCompleteness(blueprintData.timing_overlays)
        },
        {
          id: 'expression-layer',
          name: 'Expression Layer',
          isActive: !!(blueprintData.user_meta?.preferred_name),
          data: blueprintData.user_meta || {},
          completeness: calculateCompleteness(blueprintData.user_meta)
        }
      ];

      setLayers(layerData);
      await runIntegrationTests(layerData, blueprintData);
    } catch (error) {
      console.error('❌ Error loading layer data:', error);
    }
  };

  const calculateCompleteness = (data: any): number => {
    if (!data || typeof data !== 'object') return 0;
    
    const keys = Object.keys(data);
    const filledKeys = keys.filter(key => {
      const value = data[key];
      return value !== null && value !== undefined && value !== '';
    });
    
    return keys.length > 0 ? Math.round((filledKeys.length / keys.length) * 100) : 0;
  };

  const runIntegrationTests = async (layerData: LayerData[], blueprintData: any) => {
    const tests: LayerIntegrationTest[] = [
      await test7LayerCoherence(layerData, blueprintData),
      await testCrossLayerConsistency(layerData, blueprintData),
      await testDynamicLayerActivation(layerData),
      await testPersonalityContradictions(layerData, blueprintData)
    ];

    setIntegrationTests(tests);
    
    // Calculate cross-layer analysis
    const analysis = await analyzeCrossLayerSynergy(layerData, blueprintData);
    setCrossLayerAnalysis(analysis);
  };

  const test7LayerCoherence = async (layerData: LayerData[], blueprintData: any): Promise<LayerIntegrationTest> => {
    const activeLayers = layerData.filter(layer => layer.isActive);
    const averageCompleteness = layerData.reduce((sum, layer) => sum + layer.completeness, 0) / layerData.length;
    
    const details = [];
    let contradictions = [];
    
    // Test MBTI vs Human Design alignment
    const mbti = blueprintData.cognition_mbti?.type;
    const hdType = blueprintData.energy_strategy_human_design?.type;
    
    if (mbti && hdType) {
      const isAligned = checkMBTIHDAlignment(mbti, hdType);
      details.push(`MBTI (${mbti}) and HD (${hdType}) alignment: ${isAligned ? 'Good' : 'Potential conflict'}`);
      if (!isAligned) {
        contradictions.push(`${mbti} traits may conflict with ${hdType} energy patterns`);
      }
    }

    // Test astrology vs personality alignment
    const sunSign = blueprintData.archetype_western?.sun_sign;
    if (sunSign && mbti) {
      const astrologyAlignment = checkAstrologyPersonalityAlignment(sunSign, mbti);
      details.push(`Astrology (${sunSign}) and MBTI alignment: ${astrologyAlignment ? 'Synergistic' : 'Some tension'}`);
    }

    const score = Math.max(0, averageCompleteness - (contradictions.length * 15));
    
    return {
      id: 'coherence',
      name: '7-Layer Coherence',
      description: 'Tests integration chain PhysioNeural → TraitOS → MotivationEngine',
      score,
      status: score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error',
      details,
      contradictions
    };
  };

  const testCrossLayerConsistency = async (layerData: LayerData[], blueprintData: any): Promise<LayerIntegrationTest> => {
    const details = [];
    const contradictions = [];
    
    // Check MBTI-HD consistency
    const mbti = blueprintData.cognition_mbti?.type;
    const hdType = blueprintData.energy_strategy_human_design?.type;
    const hdAuthority = blueprintData.energy_strategy_human_design?.authority;
    
    if (mbti && hdType) {
      const consistency = analyzeMBTIHDConsistency(mbti, hdType, hdAuthority);
      details.push(`Cognitive style consistency: ${consistency.score}%`);
      contradictions.push(...consistency.contradictions);
    }

    // Check values alignment
    const lifePath = blueprintData.values_life_path?.lifePathNumber;
    const sunSign = blueprintData.archetype_western?.sun_sign;
    
    if (lifePath && sunSign) {
      const valuesAlignment = checkValuesAlignment(lifePath, sunSign, mbti);
      details.push(`Values alignment score: ${valuesAlignment}%`);
    }

    const score = Math.max(20, 100 - (contradictions.length * 10));
    
    return {
      id: 'consistency',
      name: 'Cross-Layer Consistency',
      description: 'Ensures MBTI aligns with Energy Strategy and Expression layers',
      score,
      status: score >= 75 ? 'success' : score >= 50 ? 'warning' : 'error',
      details,
      contradictions
    };
  };

  const testDynamicLayerActivation = async (layerData: LayerData[]): Promise<LayerIntegrationTest> => {
    // Simulate layer activation with test message
    const sessionId = `layer_test_${Date.now()}`;
    
    try {
      // Generate response to see which layers activate
      const response = await enhancedAICoachService.sendMessage(
        testMessage,
        sessionId,
        true,
        'guide',
        'en'
      );

      const details = [];
      const activatedLayers = layerData.filter(layer => layer.isActive);
      
      details.push(`Active layers: ${activatedLayers.length}/7`);
      details.push(`Response incorporates: ${analyzeLayers(response.response, layerData)}`);
      
      const score = (activatedLayers.length / 7) * 100;
      
      return {
        id: 'activation',
        name: 'Dynamic Layer Activation',
        description: 'Real-time monitoring of layer activation based on conversation context',
        score,
        status: score >= 70 ? 'success' : score >= 50 ? 'warning' : 'error',
        details,
        contradictions: []
      };
    } catch (error) {
      return {
        id: 'activation',
        name: 'Dynamic Layer Activation',
        description: 'Real-time monitoring of layer activation based on conversation context',
        score: 0,
        status: 'error',
        details: ['Failed to test layer activation'],
        contradictions: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  };

  const testPersonalityContradictions = async (layerData: LayerData[], blueprintData: any): Promise<LayerIntegrationTest> => {
    const contradictions = [];
    const details = [];
    
    const mbti = blueprintData.cognition_mbti?.type;
    const hdType = blueprintData.energy_strategy_human_design?.type;
    const sunSign = blueprintData.archetype_western?.sun_sign;
    
    // Test for major contradictions
    if (mbti?.includes('E') && hdType === 'Projector') {
      contradictions.push('Extraverted MBTI with Projector HD may create energy conflicts');
    }
    
    if (mbti?.includes('J') && sunSign === 'Sagittarius') {
      contradictions.push('Judging preference with Sagittarius may create rigidity vs freedom tension');
    }
    
    if (mbti?.includes('T') && blueprintData.energy_strategy_human_design?.authority === 'Emotional') {
      contradictions.push('Thinking preference with Emotional authority creates decision-making conflicts');
    }

    details.push(`Contradiction scan completed`);
    details.push(`Major conflicts found: ${contradictions.length}`);
    
    const score = Math.max(30, 100 - (contradictions.length * 20));
    
    return {
      id: 'contradictions',
      name: 'Personality Contradiction Detection',
      description: 'Identifies conflicts between layers using real blueprint data',
      score,
      status: contradictions.length === 0 ? 'success' : contradictions.length <= 2 ? 'warning' : 'error',
      details,
      contradictions
    };
  };

  const analyzeCrossLayerSynergy = async (layerData: LayerData[], blueprintData: any): Promise<CrossLayerAnalysis> => {
    const activeLayers = layerData.filter(layer => layer.isActive);
    const synergyScore = calculateSynergyScore(blueprintData);
    
    return {
      coherence: Math.round(activeLayers.reduce((sum, layer) => sum + layer.completeness, 0) / activeLayers.length),
      contradictions: integrationTests.reduce((sum, test) => sum + test.contradictions.length, 0),
      synergies: synergyScore,
      activationPattern: activeLayers.map(layer => layer.name)
    };
  };

  // Helper functions for analysis
  const checkMBTIHDAlignment = (mbti: string, hdType: string): boolean => {
    const alignments: { [key: string]: string[] } = {
      'Generator': ['ESFP', 'ESTP', 'ISFP', 'ISTP'],
      'Projector': ['INFJ', 'INFP', 'ENFJ', 'ENFP'],
      'Manifestor': ['ENTJ', 'INTJ', 'ESTJ', 'ISTJ'],
      'Reflector': ['INTP', 'ENTP', 'ISFJ', 'ESFJ']
    };
    
    return alignments[hdType]?.includes(mbti) || false;
  };

  const checkAstrologyPersonalityAlignment = (sunSign: string, mbti: string): boolean => {
    // Simplified alignment check
    const fireSignTypes = ['ENFP', 'ESFP', 'ENTP', 'ESTP'];
    const earthSignTypes = ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'];
    
    const fireSigns = ['Aries', 'Leo', 'Sagittarius'];
    const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
    
    return (fireSigns.includes(sunSign) && fireSignTypes.includes(mbti)) ||
           (earthSigns.includes(sunSign) && earthSignTypes.includes(mbti));
  };

  const analyzeMBTIHDConsistency = (mbti: string, hdType: string, authority?: string): { score: number; contradictions: string[] } => {
    const contradictions = [];
    let score = 100;
    
    // Check thinking vs emotional authority
    if (mbti.includes('T') && authority === 'Emotional') {
      contradictions.push('Thinking preference conflicts with Emotional authority');
      score -= 20;
    }
    
    // Check introversion vs manifestor
    if (mbti.includes('I') && hdType === 'Manifestor') {
      contradictions.push('Introverted MBTI with Manifestor HD may reduce impact');
      score -= 15;
    }
    
    return { score: Math.max(0, score), contradictions };
  };

  const checkValuesAlignment = (lifePath: number, sunSign: string, mbti: string): number => {
    // Simplified alignment scoring
    let score = 70; // base score
    
    // Life path 1 with leadership types
    if (lifePath === 1 && ['ENTJ', 'ESTJ', 'ENFJ'].includes(mbti)) score += 20;
    
    // Life path 2 with cooperative types
    if (lifePath === 2 && ['ISFJ', 'ESFJ', 'INFJ'].includes(mbti)) score += 20;
    
    return Math.min(100, score);
  };

  const analyzeLayers = (response: string, layerData: LayerData[]): string => {
    const mentions = [];
    const lowerResponse = response.toLowerCase();
    
    if (lowerResponse.includes('energy') || lowerResponse.includes('respond')) mentions.push('Energy Strategy');
    if (lowerResponse.includes('creative') || lowerResponse.includes('think')) mentions.push('Trait OS');
    if (lowerResponse.includes('value') || lowerResponse.includes('purpose')) mentions.push('Motivation Engine');
    
    return mentions.length > 0 ? mentions.join(', ') : 'General guidance';
  };

  const calculateSynergyScore = (blueprintData: any): number => {
    // Calculate how well different systems work together
    let synergyCount = 0;
    
    const mbti = blueprintData.cognition_mbti?.type;
    const hdType = blueprintData.energy_strategy_human_design?.type;
    const sunSign = blueprintData.archetype_western?.sun_sign;
    
    if (mbti && hdType && checkMBTIHDAlignment(mbti, hdType)) synergyCount++;
    if (mbti && sunSign && checkAstrologyPersonalityAlignment(sunSign, mbti)) synergyCount++;
    
    return synergyCount;
  };

  const runLayerTest = async () => {
    setIsLoading(true);
    try {
      await loadLayerData();
      console.log('✅ Layer integration test completed');
    } catch (error) {
      console.error('❌ Layer integration test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Layer Integration Deep Testing
          </CardTitle>
          <p className="text-sm text-gray-600">
            Comprehensive testing of 7-layer personality system integration and coherence
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Input
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Test message for layer activation analysis..."
              className="flex-1"
            />
            <Button 
              onClick={runLayerTest}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
              Run Test
            </Button>
          </div>

          {/* Layer Status Overview */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">7-Layer System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {layers.map((layer) => (
                  <div key={layer.id} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{layer.name}</span>
                      <Badge variant={layer.isActive ? 'default' : 'outline'}>
                        {layer.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <Progress value={layer.completeness} className="h-2 mb-2" />
                    <p className="text-xs text-gray-600">{layer.completeness}% complete</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Integration Tests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {integrationTests.map((test) => (
              <Card key={test.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getStatusIcon(test.status)}
                      {test.name}
                    </CardTitle>
                    <Badge className={`${getStatusColor(test.status)} bg-transparent border-0 p-0`}>
                      {test.score}%
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{test.description}</p>
                </CardHeader>
                <CardContent>
                  <Progress value={test.score} className="mb-4" />
                  
                  {test.details.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-2">Details:</p>
                      <ul className="text-xs space-y-1">
                        {test.details.map((detail, index) => (
                          <li key={index} className="text-gray-600">• {detail}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {test.contradictions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2 text-red-600">Contradictions:</p>
                      <ul className="text-xs space-y-1">
                        {test.contradictions.map((contradiction, index) => (
                          <li key={index} className="text-red-600">⚠ {contradiction}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cross-Layer Analysis */}
          {crossLayerAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Cross-Layer Analysis Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{crossLayerAnalysis.coherence}%</div>
                    <div className="text-sm text-gray-600">Coherence Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{crossLayerAnalysis.contradictions}</div>
                    <div className="text-sm text-gray-600">Contradictions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{crossLayerAnalysis.synergies}</div>
                    <div className="text-sm text-gray-600">Synergies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{crossLayerAnalysis.activationPattern.length}</div>
                    <div className="text-sm text-gray-600">Active Layers</div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Active Layer Pattern:</p>
                  <div className="flex flex-wrap gap-2">
                    {crossLayerAnalysis.activationPattern.map((layer, index) => (
                      <Badge key={index} variant="outline">{layer}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
