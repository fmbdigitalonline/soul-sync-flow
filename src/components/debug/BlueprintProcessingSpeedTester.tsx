
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Cpu, 
  Timer, 
  Activity, 
  Zap,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { holisticCoachService } from '@/services/holistic-coach-service';
import { PersonalityEngine } from '@/services/personality-engine';
import { SevenLayerPersonalityEngine } from '@/services/seven-layer-personality-engine';
import { LayeredBlueprint } from '@/types/personality-modules';

interface ProcessingSpeedMetrics {
  operation: string;
  startTime: number;
  endTime: number;
  processingTime: number;
  dataSize: number;
  throughput: number;
  success: boolean;
  error?: string;
}

interface BlueprintProcessingResult {
  testName: string;
  totalProcessingTime: number;
  averageProcessingTime: number;
  successfulOperations: number;
  failedOperations: number;
  overallThroughput: number;
  metrics: ProcessingSpeedMetrics[];
  performanceScore: number;
  status: 'running' | 'completed' | 'failed';
}

export const BlueprintProcessingSpeedTester: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<BlueprintProcessingResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [realTimeMetrics, setRealTimeMetrics] = useState<ProcessingSpeedMetrics[]>([]);

  // Generate realistic test blueprint data with complete LayeredBlueprint structure
  const generateTestBlueprint = (complexity: 'simple' | 'medium' | 'complex'): Partial<LayeredBlueprint> => {
    const baseBlueprint: Partial<LayeredBlueprint> = {
      user_meta: {
        user_id: `test-user-${Date.now()}`,
        full_name: 'Test User',
        preferred_name: 'Test'
      },
      cognitiveTemperamental: {
        mbtiType: 'ENFP',
        functions: ['Ne', 'Fi', 'Te', 'Si'],
        dominantFunction: 'Ne (Extraverted Intuition)',
        auxiliaryFunction: 'Fi (Introverted Feeling)',
        cognitiveStack: ['Ne-dominant', 'Fi-auxiliary', 'Te-tertiary', 'Si-inferior'],
        taskApproach: 'exploratory',
        communicationStyle: 'enthusiastic',
        decisionMaking: 'values-based',
        informationProcessing: 'big-picture'
      },
      energyDecisionStrategy: {
        humanDesignType: 'Projector',
        authority: 'Splenic',
        decisionStyle: 'intuitive',
        pacing: 'steady',
        energyType: 'focused',
        strategy: 'Wait for Invitation',
        profile: '2/4',
        centers: ['Spleen', 'Heart'],
        gates: ['1', '13', '55'],
        channels: ['Channel 1-8']
      }
    };

    if (complexity === 'medium' || complexity === 'complex') {
      baseBlueprint.motivationBeliefEngine = {
        mindset: 'growth',
        motivation: ['Learning', 'Connection'],
        stateManagement: 'adaptive',
        coreBeliefs: ['Growth', 'Authenticity', 'Connection'],
        drivingForces: ['Curiosity', 'Impact'],
        excitementCompass: 'high',
        frequencyAlignment: 'aligned',
        beliefInterface: ['Empowering', 'Supportive'],
        resistancePatterns: ['Perfectionism', 'Overwhelm']
      };
      
      baseBlueprint.coreValuesNarrative = {
        lifePath: 3,
        lifePathKeyword: 'Expression',
        soulUrgeNumber: 7,
        soulUrgeKeyword: 'Seeker',
        meaningfulAreas: ['creativity', 'relationships'],
        anchoringVision: 'inspiring authentic expression',
        lifeThemes: ['growth', 'connection'],
        valueSystem: 'authentic',
        northStar: 'creative fulfillment',
        missionStatement: 'To inspire authentic creative expression',
        purposeAlignment: 'high'
      };
    }

    if (complexity === 'complex') {
      baseBlueprint.publicArchetype = {
        sunSign: 'Aquarius',
        moonSign: 'Cancer',
        risingSign: 'Leo',
        socialStyle: 'innovative',
        publicVibe: 'inspiring',
        publicPersona: 'visionary',
        leadershipStyle: 'collaborative',
        socialMask: 'confident',
        externalExpression: 'creative'
      };
      
      baseBlueprint.generationalCode = {
        chineseZodiac: 'Horse',
        element: 'Metal',
        cohortTint: 'millennial',
        generationalThemes: ['technology', 'change'],
        collectiveInfluence: 'transformative'
      };
      
      baseBlueprint.voiceTokens = {
        pacing: {
          sentenceLength: 'flowing',
          pauseFrequency: 'thoughtful',
          rhythmPattern: 'varied'
        },
        expressiveness: {
          emojiFrequency: 'occasional',
          emphasisStyle: 'italic',
          exclamationTendency: 'balanced'
        },
        vocabulary: {
          formalityLevel: 'conversational',
          metaphorUsage: 'frequent',
          technicalDepth: 'balanced'
        },
        conversationStyle: {
          questionAsking: 'exploratory',
          responseLength: 'thorough',
          personalSharing: 'warm'
        },
        signaturePhrases: ['That resonates with me', 'I\'m curious about'],
        greetingStyles: ['Hey there!', 'How are you feeling today?'],
        transitionWords: ['Speaking of which', 'On that note']
      };

      baseBlueprint.humorProfile = {
        primaryStyle: 'playful-storyteller',
        intensity: 'moderate',
        appropriatenessLevel: 'balanced',
        contextualAdaptation: {
          coaching: 'gentle-empath',
          guidance: 'philosophical-sage',
          casual: 'spontaneous-entertainer'
        },
        avoidancePatterns: ['sarcasm', 'dark humor'],
        signatureElements: ['wordplay', 'observations']
      };
    }

    return baseBlueprint;
  };

  const measureOperation = async <T,>(
    operation: string,
    asyncFunction: () => Promise<T>,
    dataSize: number = 1
  ): Promise<ProcessingSpeedMetrics> => {
    const startTime = Date.now();
    
    try {
      await asyncFunction();
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      const throughput = dataSize > 0 ? (dataSize / processingTime) * 1000 : 0;
      
      const metric: ProcessingSpeedMetrics = {
        operation,
        startTime,
        endTime,
        processingTime,
        dataSize,
        throughput,
        success: true
      };
      
      console.log(`✅ ${operation} completed in ${processingTime}ms`);
      return metric;
    } catch (error) {
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      const metric: ProcessingSpeedMetrics = {
        operation,
        startTime,
        endTime,
        processingTime,
        dataSize,
        throughput: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      console.error(`❌ ${operation} failed after ${processingTime}ms:`, error);
      return metric;
    }
  };

  const runBlueprintProcessingTest = async () => {
    setIsRunning(true);
    setProgress(0);
    setRealTimeMetrics([]);
    setCurrentTest(null);

    console.log('🚀 BlueprintProcessingSpeedTester: Starting comprehensive processing speed test');

    try {
      const testMetrics: ProcessingSpeedMetrics[] = [];
      let totalProcessingTime = 0;
      let successfulOperations = 0;
      let failedOperations = 0;

      // Test 1: Simple Blueprint Processing
      setProgress(10);
      const simpleBlueprint = generateTestBlueprint('simple');
      const personalityEngine = new PersonalityEngine();
      
      const simpleProcessingMetric = await measureOperation(
        'Simple Blueprint Processing',
        async () => {
          personalityEngine.updateBlueprint(simpleBlueprint);
          return personalityEngine.generateSystemPrompt('guide', 'Test message for simple blueprint');
        },
        Object.keys(simpleBlueprint).length
      );
      
      testMetrics.push(simpleProcessingMetric);
      setRealTimeMetrics(prev => [...prev, simpleProcessingMetric]);
      
      if (simpleProcessingMetric.success) successfulOperations++;
      else failedOperations++;
      totalProcessingTime += simpleProcessingMetric.processingTime;

      // Test 2: Medium Complexity Blueprint Processing
      setProgress(25);
      const mediumBlueprint = generateTestBlueprint('medium');
      
      const mediumProcessingMetric = await measureOperation(
        'Medium Blueprint Processing',
        async () => {
          personalityEngine.updateBlueprint(mediumBlueprint);
          return personalityEngine.generateSystemPrompt('coach', 'Test message for medium blueprint');
        },
        Object.keys(mediumBlueprint).length
      );
      
      testMetrics.push(mediumProcessingMetric);
      setRealTimeMetrics(prev => [...prev, mediumProcessingMetric]);
      
      if (mediumProcessingMetric.success) successfulOperations++;
      else failedOperations++;
      totalProcessingTime += mediumProcessingMetric.processingTime;

      // Test 3: Complex Blueprint Processing
      setProgress(40);
      const complexBlueprint = generateTestBlueprint('complex');
      
      const complexProcessingMetric = await measureOperation(
        'Complex Blueprint Processing',
        async () => {
          personalityEngine.updateBlueprint(complexBlueprint);
          return personalityEngine.generateSystemPrompt('blend', 'Test message for complex blueprint');
        },
        Object.keys(complexBlueprint).length
      );
      
      testMetrics.push(complexProcessingMetric);
      setRealTimeMetrics(prev => [...prev, complexProcessingMetric]);
      
      if (complexProcessingMetric.success) successfulOperations++;
      else failedOperations++;
      totalProcessingTime += complexProcessingMetric.processingTime;

      // Test 4: Seven-Layer Personality Engine Processing
      setProgress(60);
      const sevenLayerEngine = new SevenLayerPersonalityEngine();
      
      const sevenLayerMetric = await measureOperation(
        'Seven-Layer Engine Processing',
        async () => {
          sevenLayerEngine.updateBlueprint(complexBlueprint);
          sevenLayerEngine.updateContext({
            currentMood: 'high',
            energyLevel: 'vibrant',
            contextType: 'creative',
            excitementLevel: 8
          });
          return sevenLayerEngine.generateHolisticSystemPrompt();
        },
        Object.keys(complexBlueprint).length
      );
      
      testMetrics.push(sevenLayerMetric);
      setRealTimeMetrics(prev => [...prev, sevenLayerMetric]);
      
      if (sevenLayerMetric.success) successfulOperations++;
      else failedOperations++;
      totalProcessingTime += sevenLayerMetric.processingTime;

      // Test 5: Holistic Coach Service Integration
      setProgress(80);
      const holisticCoachMetric = await measureOperation(
        'Holistic Coach Integration',
        async () => {
          holisticCoachService.updateBlueprint(complexBlueprint);
          holisticCoachService.updateContext({
            currentMood: 'medium',
            energyLevel: 'stable',
            contextType: 'analytical',
            excitementLevel: 6
          });
          holisticCoachService.setMode('growth');
          return holisticCoachService.generateSystemPrompt('Complex integration test message');
        },
        Object.keys(complexBlueprint).length
      );
      
      testMetrics.push(holisticCoachMetric);
      setRealTimeMetrics(prev => [...prev, holisticCoachMetric]);
      
      if (holisticCoachMetric.success) successfulOperations++;
      else failedOperations++;
      totalProcessingTime += holisticCoachMetric.processingTime;

      // Test 6: Batch Processing Performance
      setProgress(90);
      const batchProcessingMetric = await measureOperation(
        'Batch Blueprint Processing',
        async () => {
          const promises = Array.from({ length: 5 }, (_, index) => {
            const testEngine = new PersonalityEngine();
            const testBlueprint = generateTestBlueprint(index % 2 === 0 ? 'simple' : 'medium');
            testEngine.updateBlueprint(testBlueprint);
            return testEngine.generateSystemPrompt('guide', `Batch test message ${index}`);
          });
          
          await Promise.all(promises);
        },
        5
      );
      
      testMetrics.push(batchProcessingMetric);
      setRealTimeMetrics(prev => [...prev, batchProcessingMetric]);
      
      if (batchProcessingMetric.success) successfulOperations++;
      else failedOperations++;
      totalProcessingTime += batchProcessingMetric.processingTime;

      setProgress(100);

      // Calculate final metrics
      const totalOperations = successfulOperations + failedOperations;
      const averageProcessingTime = totalOperations > 0 ? totalProcessingTime / totalOperations : 0;
      const overallThroughput = totalProcessingTime > 0 ? (totalOperations / totalProcessingTime) * 1000 : 0;
      const performanceScore = totalOperations > 0 ? (successfulOperations / totalOperations) * 100 : 0;

      const result: BlueprintProcessingResult = {
        testName: 'Blueprint Processing Speed Analysis',
        totalProcessingTime,
        averageProcessingTime: Math.round(averageProcessingTime),
        successfulOperations,
        failedOperations,
        overallThroughput: Math.round(overallThroughput * 100) / 100,
        metrics: testMetrics,
        performanceScore: Math.round(performanceScore * 100) / 100,
        status: 'completed'
      };

      setCurrentTest(result);
      console.log('✅ Blueprint processing speed test completed:', result);

    } catch (error) {
      const failedResult: BlueprintProcessingResult = {
        testName: 'Blueprint Processing Speed Analysis',
        totalProcessingTime: 0,
        averageProcessingTime: 0,
        successfulOperations: 0,
        failedOperations: 1,
        overallThroughput: 0,
        metrics: [],
        performanceScore: 0,
        status: 'failed'
      };

      setCurrentTest(failedResult);
      console.error('❌ Blueprint processing speed test failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge variant="destructive">Needs Optimization</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-6 w-6" />
            Blueprint Processing Speed Tester
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={runBlueprintProcessingTest}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Run Blueprint Processing Test
            </Button>
            
            {isRunning && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Test Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
                <div className="text-sm text-gray-600">
                  Testing blueprint conversion and personality engine processing speeds...
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Processing Metrics */}
      {realTimeMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Real-time Processing Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {realTimeMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    {metric.success ? 
                      <CheckCircle className="h-5 w-5 text-green-500" /> : 
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    }
                    <div>
                      <div className="font-medium">{metric.operation}</div>
                      <div className="text-sm text-gray-600">
                        Data size: {metric.dataSize} components
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium">{metric.processingTime}ms</div>
                      <div className="text-gray-600">Time</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{metric.throughput.toFixed(2)}</div>
                      <div className="text-gray-600">ops/sec</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {currentTest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Processing Speed Results
              </div>
              {currentTest.status === 'completed' && 
                getPerformanceBadge(currentTest.performanceScore)
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentTest.status === 'failed' ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
                <strong>Test Failed:</strong> Unable to complete blueprint processing speed test
              </div>
            ) : (
              <div className="space-y-6">
                {/* Overall Performance */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {currentTest.averageProcessingTime}ms
                    </div>
                    <div className="text-sm text-gray-600">Avg Processing</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {currentTest.successfulOperations}/{currentTest.successfulOperations + currentTest.failedOperations}
                    </div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {currentTest.overallThroughput}
                    </div>
                    <div className="text-sm text-gray-600">ops/sec</div>
                  </div>
                  
                  <div className={`text-center`}>
                    <div className={`text-2xl font-bold ${getPerformanceColor(currentTest.performanceScore)}`}>
                      {currentTest.performanceScore}%
                    </div>
                    <div className="text-sm text-gray-600">Performance</div>
                  </div>
                </div>

                {/* Performance Insights */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                  <h4 className="font-semibold text-blue-800 mb-2">Processing Insights:</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div>• Simple blueprints processed in ~{currentTest.metrics.find(m => m.operation.includes('Simple'))?.processingTime || 0}ms</div>
                    <div>• Complex blueprints required ~{currentTest.metrics.find(m => m.operation.includes('Complex'))?.processingTime || 0}ms</div>
                    <div>• Seven-layer engine processing: ~{currentTest.metrics.find(m => m.operation.includes('Seven-Layer'))?.processingTime || 0}ms</div>
                    <div>• Batch processing throughput: {currentTest.metrics.find(m => m.operation.includes('Batch'))?.throughput.toFixed(2) || 0} ops/sec</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BlueprintProcessingSpeedTester;
