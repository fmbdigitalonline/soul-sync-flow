import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  Loader2,
  Target,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { enhancedAICoachService } from '@/services/enhanced-ai-coach-service';

interface PersonalityModule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  completeness: number;
  dataQuality: number;
  lastUpdated?: string;
  data: any;
  requiredFields: string[];
  missingFields: string[];
}

interface ModuleSynergy {
  modules: string[];
  score: number;
  description: string;
  status: 'excellent' | 'good' | 'fair' | 'poor';
}

interface ModuleActivation {
  moduleId: string;
  activationCount: number;
  influenceScore: number;
  lastActivation?: string;
}

export const ModuleCompletenessValidator: React.FC = () => {
  const [modules, setModules] = useState<PersonalityModule[]>([]);
  const [synergies, setSynergies] = useState<ModuleSynergy[]>([]);
  const [activations, setActivations] = useState<ModuleActivation[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [testResults, setTestResults] = useState<{
    totalModules: number;
    activeModules: number;
    averageCompleteness: number;
    dataQualityScore: number;
  } | null>(null);

  useEffect(() => {
    initializeModuleValidation();
  }, []);

  const initializeModuleValidation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await enhancedAICoachService.setCurrentUser(user.id);
        await loadModuleData();
        console.log('✅ Module Completeness Validator initialized');
      }
    } catch (error) {
      console.error('❌ Error initializing module validation:', error);
    }
  };

  const loadModuleData = async () => {
    setIsLoading(true);
    try {
      // Get user blueprint
      const { data: blueprintRecord } = await supabase
        .from('user_blueprints')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!blueprintRecord?.blueprint) {
        console.log('⚠️ No blueprint data available');
        setIsLoading(false);
        return;
      }

      const blueprintData = blueprintRecord.blueprint as any;
      const moduleData = await analyzeModules(blueprintData, blueprintRecord);
      
      setModules(moduleData);
      
      // Calculate synergies
      const synergyData = calculateModuleSynergies(moduleData);
      setSynergies(synergyData);
      
      // Test module activations
      const activationData = await testModuleActivations(moduleData);
      setActivations(activationData);
      
      // Calculate overall scores
      const results = calculateOverallScores(moduleData);
      setTestResults(results);
      setOverallScore(results.averageCompleteness);
      
      console.log('✅ Module analysis completed');
    } catch (error) {
      console.error('❌ Error loading module data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeModules = async (blueprintData: any, blueprintRecord: any): Promise<PersonalityModule[]> => {
    const moduleDefinitions = [
      {
        id: 'cognitive-temperamental',
        name: 'Cognitive Temperamental',
        description: 'MBTI personality type and cognitive functions',
        dataPath: 'cognition_mbti',
        requiredFields: ['type', 'functions']
      },
      {
        id: 'energy-decision-strategy',
        name: 'Energy Decision Strategy',
        description: 'Human Design type and authority',
        dataPath: 'energy_strategy_human_design',
        requiredFields: ['type', 'authority', 'profile']
      },
      {
        id: 'motivation-belief-engine',
        name: 'Motivation Belief Engine',
        description: 'Life path number and core values',
        dataPath: 'values_life_path',
        requiredFields: ['lifePathNumber', 'coreValues']
      },
      {
        id: 'core-values-narrative',
        name: 'Core Values Narrative',
        description: 'Personal mission and value system',
        dataPath: 'values_life_path',
        requiredFields: ['missionStatement', 'coreValues']
      },
      {
        id: 'public-archetype',
        name: 'Public Archetype',
        description: 'Western astrology sun sign',
        dataPath: 'archetype_western',
        requiredFields: ['sun_sign', 'sun_house']
      },
      {
        id: 'shadow-archetype',
        name: 'Shadow Archetype',
        description: 'Moon sign and shadow aspects',
        dataPath: 'archetype_western',
        requiredFields: ['moon_sign', 'moon_house']
      },
      {
        id: 'generational-code',
        name: 'Generational Code',
        description: 'Chinese astrology and generational patterns',
        dataPath: 'archetype_chinese',
        requiredFields: ['year_animal', 'element']
      },
      {
        id: 'timing-overlays',
        name: 'Timing Overlays',
        description: 'Astrological timing and transits',
        dataPath: 'timing_overlays',
        requiredFields: ['current_transits', 'planetary_returns']
      },
      {
        id: 'user-meta',
        name: 'User Meta Information',
        description: 'Personal information and preferences',
        dataPath: 'user_meta',
        requiredFields: ['full_name', 'birth_date', 'birth_location']
      },
      {
        id: 'goal-stack',
        name: 'Goal Stack',
        description: 'Current goals and aspirations',
        dataPath: 'goal_stack',
        requiredFields: []
      },
      {
        id: 'excitement-scores',
        name: 'Excitement Tracking',
        description: 'Bashar excitement methodology scores',
        dataPath: 'excitement_scores',
        requiredFields: []
      },
      {
        id: 'vibration-checkins',
        name: 'Vibration Check-ins',
        description: 'Energy and vibration tracking',
        dataPath: 'vibration_check_ins',
        requiredFields: []
      }
    ];

    return moduleDefinitions.map(moduleDef => {
      const moduleData = getNestedValue(blueprintData, moduleDef.dataPath);
      const missingFields = moduleDef.requiredFields.filter(field => 
        !moduleData || !moduleData[field] || moduleData[field] === ''
      );
      
      const completeness = moduleDef.requiredFields.length > 0
        ? Math.round(((moduleDef.requiredFields.length - missingFields.length) / moduleDef.requiredFields.length) * 100)
        : moduleData ? 100 : 0;
      
      const dataQuality = calculateDataQuality(moduleData, moduleDef.requiredFields);
      
      return {
        id: moduleDef.id,
        name: moduleDef.name,
        description: moduleDef.description,
        isActive: !!moduleData && Object.keys(moduleData).length > 0,
        completeness,
        dataQuality,
        lastUpdated: blueprintRecord?.updated_at,
        data: moduleData || {},
        requiredFields: moduleDef.requiredFields,
        missingFields
      };
    });
  };

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const calculateDataQuality = (data: any, requiredFields: string[]): number => {
    if (!data || typeof data !== 'object') return 0;
    
    let qualityScore = 0;
    const totalFields = Object.keys(data).length;
    
    if (totalFields === 0) return 0;
    
    // Check for non-empty values
    const filledFields = Object.values(data).filter(value => 
      value !== null && value !== undefined && value !== ''
    ).length;
    
    qualityScore = (filledFields / totalFields) * 100;
    
    // Bonus for having all required fields
    if (requiredFields.length > 0) {
      const hasAllRequired = requiredFields.every(field => 
        data[field] && data[field] !== ''
      );
      if (hasAllRequired) qualityScore += 10;
    }
    
    return Math.min(100, Math.round(qualityScore));
  };

  const calculateModuleSynergies = (modules: PersonalityModule[]): ModuleSynergy[] => {
    const synergies: ModuleSynergy[] = [];
    
    // MBTI + Human Design synergy
    const mbti = modules.find(m => m.id === 'cognitive-temperamental');
    const hd = modules.find(m => m.id === 'energy-decision-strategy');
    if (mbti && hd && mbti.isActive && hd.isActive) {
      const synergyScore = calculateMBTIHDSynergy(mbti.data, hd.data);
      synergies.push({
        modules: ['MBTI', 'Human Design'],
        score: synergyScore,
        description: 'Cognitive style and energy strategy alignment',
        status: synergyScore >= 80 ? 'excellent' : synergyScore >= 60 ? 'good' : synergyScore >= 40 ? 'fair' : 'poor'
      });
    }
    
    // Astrology + Life Path synergy
    const astrology = modules.find(m => m.id === 'public-archetype');
    const lifePath = modules.find(m => m.id === 'motivation-belief-engine');
    if (astrology && lifePath && astrology.isActive && lifePath.isActive) {
      const synergyScore = calculateAstrologyLifePathSynergy(astrology.data, lifePath.data);
      synergies.push({
        modules: ['Astrology', 'Life Path'],
        score: synergyScore,
        description: 'Archetypal patterns and life purpose alignment',
        status: synergyScore >= 80 ? 'excellent' : synergyScore >= 60 ? 'good' : synergyScore >= 40 ? 'fair' : 'poor'
      });
    }
    
    // Values + Goals synergy
    const values = modules.find(m => m.id === 'core-values-narrative');
    const goals = modules.find(m => m.id === 'goal-stack');
    if (values && goals && values.isActive && goals.isActive) {
      const synergyScore = calculateValuesGoalsSynergy(values.data, goals.data);
      synergies.push({
        modules: ['Values', 'Goals'],
        score: synergyScore,
        description: 'Core values and goal alignment',
        status: synergyScore >= 80 ? 'excellent' : synergyScore >= 60 ? 'good' : synergyScore >= 40 ? 'fair' : 'poor'
      });
    }
    
    return synergies;
  };

  const calculateMBTIHDSynergy = (mbtiData: any, hdData: any): number => {
    let score = 50; // base score
    
    const mbtiType = mbtiData?.type;
    const hdType = hdData?.type;
    const hdAuthority = hdData?.authority;
    
    // Favorable combinations
    if (mbtiType?.includes('E') && hdType === 'Manifestor') score += 20;
    if (mbtiType?.includes('I') && hdType === 'Projector') score += 20;
    if (mbtiType?.includes('S') && hdType === 'Generator') score += 15;
    if (mbtiType?.includes('N') && hdType === 'Projector') score += 15;
    
    // Authority alignment
    if (mbtiType?.includes('F') && hdAuthority === 'Emotional') score += 15;
    if (mbtiType?.includes('T') && hdAuthority === 'Splenic') score += 15;
    
    return Math.min(100, score);
  };

  const calculateAstrologyLifePathSynergy = (astrologyData: any, lifePathData: any): number => {
    let score = 60; // base score
    
    const sunSign = astrologyData?.sun_sign;
    const lifePath = lifePathData?.lifePathNumber;
    
    // Leadership signs with leadership life paths
    if (['Aries', 'Leo', 'Capricorn'].includes(sunSign) && [1, 8].includes(lifePath)) {
      score += 25;
    }
    
    // Creative signs with creative life paths
    if (['Gemini', 'Libra', 'Pisces'].includes(sunSign) && [3, 6].includes(lifePath)) {
      score += 20;
    }
    
    // Service signs with service life paths
    if (['Virgo', 'Cancer'].includes(sunSign) && [2, 6, 9].includes(lifePath)) {
      score += 20;
    }
    
    return Math.min(100, score);
  };

  const calculateValuesGoalsSynergy = (valuesData: any, goalsData: any): number => {
    let score = 40; // base score
    
    if (valuesData?.missionStatement && Array.isArray(goalsData) && goalsData.length > 0) {
      score += 30; // Has mission and goals
    }
    
    if (valuesData?.coreValues && Array.isArray(valuesData.coreValues)) {
      score += 20; // Has defined values
    }
    
    return Math.min(100, score);
  };

  const testModuleActivations = async (modules: PersonalityModule[]): Promise<ModuleActivation[]> => {
    // Simulate module activation testing
    const activations: ModuleActivation[] = [];
    
    try {
      // Test with a sample message to see which modules activate
      const testMessage = 'I need guidance on making a big life decision that aligns with my values';
      const sessionId = `module_test_${Date.now()}`;
      
      const response = await enhancedAICoachService.sendMessage(
        testMessage,
        sessionId,
        true,
        'guide',
        'en'
      );
      
      // Analyze response for module influences
      const responseText = response.response.toLowerCase();
      
      modules.forEach(module => {
        let activationCount = 0;
        let influenceScore = 0;
        
        // Check for module-specific keywords in response
        switch (module.id) {
          case 'cognitive-temperamental':
            if (responseText.includes('think') || responseText.includes('personality') || responseText.includes('type')) {
              activationCount++;
              influenceScore += 20;
            }
            break;
          case 'energy-decision-strategy':
            if (responseText.includes('energy') || responseText.includes('respond') || responseText.includes('authority')) {
              activationCount++;
              influenceScore += 25;
            }
            break;
          case 'motivation-belief-engine':
            if (responseText.includes('value') || responseText.includes('purpose') || responseText.includes('belief')) {
              activationCount++;
              influenceScore += 30;
            }
            break;
          case 'public-archetype':
            if (responseText.includes('nature') || responseText.includes('natural')) {
              activationCount++;
              influenceScore += 15;
            }
            break;
        }
        
        // Bonus for active modules
        if (module.isActive) {
          influenceScore += 10;
        }
        
        activations.push({
          moduleId: module.id,
          activationCount,
          influenceScore: Math.min(100, influenceScore),
          lastActivation: new Date().toISOString()
        });
      });
      
    } catch (error) {
      console.error('❌ Error testing module activations:', error);
    }
    
    return activations;
  };

  const calculateOverallScores = (modules: PersonalityModule[]) => {
    const activeModules = modules.filter(m => m.isActive).length;
    const averageCompleteness = modules.reduce((sum, m) => sum + m.completeness, 0) / modules.length;
    const averageDataQuality = modules.reduce((sum, m) => sum + m.dataQuality, 0) / modules.length;
    
    return {
      totalModules: modules.length,
      activeModules,
      averageCompleteness: Math.round(averageCompleteness),
      dataQualityScore: Math.round(averageDataQuality)
    };
  };

  const getModuleStatusIcon = (completeness: number, isActive: boolean) => {
    if (!isActive) return <XCircle className="h-4 w-4 text-gray-400" />;
    if (completeness >= 80) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (completeness >= 50) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getSynergyStatusColor = (status: string): string => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Analyzing 12 personality modules...</span>
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
            <Database className="h-5 w-5" />
            12-Module Validation & Completeness
          </CardTitle>
          <p className="text-sm text-gray-600">
            Real-time validation of all personality modules with data quality assessment
          </p>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={loadModuleData}
            disabled={isLoading}
            className="mb-6 flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
            Refresh Analysis
          </Button>

          {/* Overall Scores */}
          {testResults && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Overall Module Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{testResults.activeModules}/{testResults.totalModules}</div>
                    <div className="text-sm text-gray-600">Active Modules</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{testResults.averageCompleteness}%</div>
                    <div className="text-sm text-gray-600">Avg Completeness</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{testResults.dataQualityScore}%</div>
                    <div className="text-sm text-gray-600">Data Quality</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{synergies.length}</div>
                    <div className="text-sm text-gray-600">Synergies Found</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Module Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {modules.map((module) => (
              <Card key={module.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getModuleStatusIcon(module.completeness, module.isActive)}
                      <CardTitle className="text-sm">{module.name}</CardTitle>
                    </div>
                    <Badge variant={module.isActive ? 'default' : 'outline'}>
                      {module.completeness}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-600 mb-3">{module.description}</p>
                  
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Completeness</span>
                        <span>{module.completeness}%</span>
                      </div>
                      <Progress value={module.completeness} className="h-1" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Data Quality</span>
                        <span>{module.dataQuality}%</span>
                      </div>
                      <Progress value={module.dataQuality} className="h-1" />
                    </div>
                  </div>
                  
                  {module.missingFields.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-red-600 mb-1">Missing Fields:</p>
                      <div className="flex flex-wrap gap-1">
                        {module.missingFields.slice(0, 3).map((field, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                        {module.missingFields.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{module.missingFields.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Module Synergies */}
          {synergies.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Module Synergies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {synergies.map((synergy, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{synergy.modules.join(' + ')}</span>
                          <Badge className={`${getSynergyStatusColor(synergy.status)} bg-transparent border-0 p-0`}>
                            {synergy.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{synergy.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{synergy.score}%</div>
                        <Progress value={synergy.score} className="w-20 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Module Activations */}
          {activations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Module Influence in AI Responses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activations
                    .filter(activation => activation.influenceScore > 0)
                    .sort((a, b) => b.influenceScore - a.influenceScore)
                    .map((activation) => {
                      const module = modules.find(m => m.id === activation.moduleId);
                      return (
                        <div key={activation.moduleId} className="p-3 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{module?.name}</span>
                            <Badge variant="outline">{activation.influenceScore}%</Badge>
                          </div>
                          <Progress value={activation.influenceScore} className="h-2" />
                          <p className="text-xs text-gray-600 mt-1">
                            Influence in personalized responses
                          </p>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
