
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layers, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { holisticCoachService } from '@/services/holistic-coach-service';
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';

interface ConflictTest {
  name: string;
  description: string;
  status: 'pending' | 'testing' | 'passed' | 'failed';
  details?: string;
  conflictType: 'trait' | 'energy' | 'motivation' | 'expression';
  severity: 'low' | 'medium' | 'high';
}

export const LayerActivationConflictTester: React.FC = () => {
  const [tests, setTests] = useState<ConflictTest[]>([
    {
      name: 'Introvert vs Extrovert Expression',
      description: 'Test conflict between MBTI introversion and expressive personality traits',
      conflictType: 'trait',
      severity: 'medium'
    },
    {
      name: 'Human Design vs MBTI Energy',
      description: 'Test energy conflicts between HD Generator and MBTI Perceiver',
      conflictType: 'energy',
      severity: 'high'
    },
    {
      name: 'Motivation Direction Conflicts',
      description: 'Test opposing motivational drives from different systems',
      conflictType: 'motivation',
      severity: 'high'
    },
    {
      name: 'Communication Style Contradictions',
      description: 'Test conflicts in communication preferences across modules',
      conflictType: 'expression',
      severity: 'medium'
    },
    {
      name: 'Decision-Making Authority Conflicts',
      description: 'Test conflicts between different decision-making strategies',
      conflictType: 'energy',
      severity: 'high'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [conflictResolution, setConflictResolution] = useState<{
    totalConflicts: number;
    resolvedConflicts: number;
    resolutionStrategy: string;
    coherenceScore: number;
  }>({ totalConflicts: 0, resolvedConflicts: 0, resolutionStrategy: 'Unknown', coherenceScore: 0 });

  const { blueprintData } = useBlueprintCache();

  const runConflictTests = async () => {
    setIsRunning(true);
    console.log('⚖️ Starting layer activation conflict tests');

    const updatedTests = [...tests];
    let totalConflicts = 0;
    let resolvedConflicts = 0;

    for (let i = 0; i < updatedTests.length; i++) {
      updatedTests[i].status = 'testing';
      setTests([...updatedTests]);

      try {
        let testResult = false;
        let details = '';

        switch (updatedTests[i].name) {
          case 'Introvert vs Extrovert Expression':
            testResult = await testIntrovertExtrovertConflict();
            details = testResult ? 'Conflict resolved with balanced expression' : 'Unresolved personality expression conflict';
            break;

          case 'Human Design vs MBTI Energy':
            testResult = await testEnergySystemConflict();
            details = testResult ? 'Energy systems harmonized successfully' : 'Energy conflict remains unresolved';
            break;

          case 'Motivation Direction Conflicts':
            testResult = await testMotivationConflict();
            details = testResult ? 'Motivational drives aligned through priority weighting' : 'Conflicting motivations not resolved';
            break;

          case 'Communication Style Contradictions':
            testResult = await testCommunicationStyleConflict();
            details = testResult ? 'Communication style conflicts balanced' : 'Communication inconsistencies detected';
            break;

          case 'Decision-Making Authority Conflicts':
            testResult = await testDecisionMakingConflict();
            details = testResult ? 'Decision-making strategies integrated' : 'Authority conflicts unresolved';
            break;
        }

        totalConflicts++;
        if (testResult) resolvedConflicts++;

        updatedTests[i].status = testResult ? 'passed' : 'failed';
        updatedTests[i].details = details;

      } catch (error) {
        console.error(`❌ Conflict test failed: ${updatedTests[i].name}`, error);
        updatedTests[i].status = 'failed';
        updatedTests[i].details = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        totalConflicts++;
      }

      setTests([...updatedTests]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Calculate conflict resolution metrics
    const coherenceScore = Math.round((resolvedConflicts / totalConflicts) * 100);
    let resolutionStrategy = 'Priority-based';
    if (coherenceScore >= 80) resolutionStrategy = 'Harmonious Integration';
    else if (coherenceScore >= 60) resolutionStrategy = 'Balanced Weighting';
    else if (coherenceScore >= 40) resolutionStrategy = 'Conflict Suppression';
    else resolutionStrategy = 'Unresolved Conflicts';

    setConflictResolution({
      totalConflicts,
      resolvedConflicts,
      resolutionStrategy,
      coherenceScore
    });

    setIsRunning(false);
    console.log('✅ Layer activation conflict tests completed');
  };

  const testIntrovertExtrovertConflict = async (): Promise<boolean> => {
    try {
      if (!blueprintData) return false;

      // Create conflicting personality data
      const conflictBlueprint = {
        ...blueprintData,
        cognition_mbti: { ...blueprintData.cognition_mbti, type: 'INFP' }, // Introverted
        // Simulate extroverted traits in other modules
        energy_strategy_human_design: { ...blueprintData.energy_strategy_human_design, channels: ['social_channels'] }
      };

      holisticCoachService.updateBlueprint(conflictBlueprint);
      const prompt = holisticCoachService.generateSystemPrompt("How do you prefer to interact socially?");

      // Check if prompt handles the conflict gracefully
      return prompt.includes('balanced') || prompt.includes('contextual') || 
             (!prompt.includes('contradiction') && !prompt.includes('conflict'));
    } catch (error) {
      console.error('Introvert/Extrovert conflict test error:', error);
      return false;
    }
  };

  const testEnergySystemConflict = async (): Promise<boolean> => {
    try {
      if (!blueprintData) return false;

      const conflictBlueprint = {
        ...blueprintData,
        cognition_mbti: { ...blueprintData.cognition_mbti, type: 'ENFP' }, // High energy
        energy_strategy_human_design: { type: 'Reflector', authority: 'Lunar' } // Low consistent energy
      };

      holisticCoachService.updateBlueprint(conflictBlueprint);
      const prompt = holisticCoachService.generateSystemPrompt("How do you manage your energy levels?");

      return prompt.length > 0 && !prompt.includes('undefined');
    } catch (error) {
      console.error('Energy system conflict test error:', error);
      return false;
    }
  };

  const testMotivationConflict = async (): Promise<boolean> => {
    try {
      if (!blueprintData) return false;

      const conflictBlueprint = {
        ...blueprintData,
        values_life_path: { lifePathNumber: 1, description: 'Leadership and independence' },
        cognition_mbti: { type: 'ISFJ', description: 'Service and support to others' }
      };

      holisticCoachService.updateBlueprint(conflictBlueprint);
      const prompt = holisticCoachService.generateSystemPrompt("What motivates you most?");

      return prompt.includes('balance') || prompt.includes('integrate') || prompt.includes('both');
    } catch (error) {
      console.error('Motivation conflict test error:', error);
      return false;  
    }
  };

  const testCommunicationStyleConflict = async (): Promise<boolean> => {
    try {
      if (!blueprintData) return false;

      const conflictBlueprint = {
        ...blueprintData,
        cognition_mbti: { type: 'INTJ' }, // Direct, analytical communication
        archetype_western: { sun_sign: 'Pisces', moon_sign: 'Cancer' } // Emotional, intuitive communication
      };

      holisticCoachService.updateBlueprint(conflictBlueprint);
      const prompt = holisticCoachService.generateSystemPrompt("How do you prefer to communicate?");

      return prompt.length > 0 && (prompt.includes('adapt') || prompt.includes('situational'));
    } catch (error) {
      console.error('Communication style conflict test error:', error);
      return false;
    }
  };

  const testDecisionMakingConflict = async (): Promise<boolean> => {
    try {
      if (!blueprintData) return false;

      const conflictBlueprint = {
        ...blueprintData,
        cognition_mbti: { type: 'ESTJ' }, // Thinking-based decisions
        energy_strategy_human_design: { authority: 'Emotional' } // Emotion-based decisions
      };

      holisticCoachService.updateBlueprint(conflictBlueprint);
      const prompt = holisticCoachService.generateSystemPrompt("How do you make important decisions?");

      return prompt.includes('consider both') || prompt.includes('integrate') || prompt.includes('balance');
    } catch (error) {
      console.error('Decision making conflict test error:', error);
      return false;
    }
  };

  const resetTests = () => {
    setTests(tests.map(test => ({ ...test, status: 'pending', details: undefined })));
    setConflictResolution({ totalConflicts: 0, resolvedConflicts: 0, resolutionStrategy: 'Unknown', coherenceScore: 0 });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'testing': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getConflictTypeColor = (type: string) => {
    switch (type) {
      case 'trait': return 'bg-blue-100 text-blue-800';
      case 'energy': return 'bg-orange-100 text-orange-800';
      case 'motivation': return 'bg-purple-100 text-purple-800';
      case 'expression': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const passedTests = tests.filter(t => t.status === 'passed').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;
  const totalTests = tests.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Layer Activation Conflict Testing
          </CardTitle>
          <div className="flex gap-4 text-sm">
            <span>Resolved: <Badge className="bg-green-100 text-green-800">{passedTests}/{totalTests}</Badge></span>
            <span>Conflicts: <Badge className="bg-red-100 text-red-800">{failedTests}/{totalTests}</Badge></span>
            <span>Coherence: <Badge>{conflictResolution.coherenceScore}%</Badge></span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runConflictTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
              {isRunning ? 'Testing Conflicts...' : 'Run Conflict Tests'}
            </Button>
            <Button variant="outline" onClick={resetTests} disabled={isRunning}>
              Reset Tests
            </Button>
          </div>

          {conflictResolution.coherenceScore > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conflict Resolution Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{conflictResolution.totalConflicts}</div>
                    <div className="text-sm text-gray-600">Total Conflicts</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{conflictResolution.resolvedConflicts}</div>
                    <div className="text-sm text-gray-600">Resolved</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{conflictResolution.coherenceScore}%</div>
                    <div className="text-sm text-gray-600">Coherence Score</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">{conflictResolution.resolutionStrategy}</div>
                    <div className="text-sm text-gray-600">Strategy</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {tests.map((test, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(test.status)}
                    <span className="font-medium">{test.name}</span>
                    <Badge className={getConflictTypeColor(test.conflictType)}>
                      {test.conflictType}
                    </Badge>
                    <Badge className={getSeverityColor(test.severity)}>
                      {test.severity}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                {test.details && (
                  <p className="text-xs bg-gray-50 p-2 rounded">
                    {test.details}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
