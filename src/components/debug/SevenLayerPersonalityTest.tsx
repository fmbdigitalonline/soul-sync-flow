
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { holisticCoachService } from '@/services/holistic-coach-service';
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';

export const SevenLayerPersonalityTest: React.FC = () => {
  const { blueprintData, loading } = useBlueprintCache();
  const [testResults, setTestResults] = useState<any>(null);
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [rawBlueprintSample, setRawBlueprintSample] = useState<any>(null);

  const runEndToEndTest = () => {
    console.log('🧪 Starting Seven Layer Personality E2E Test');
    setError(null);
    
    try {
      if (!blueprintData) {
        throw new Error('No blueprint data available for testing');
      }

      console.log('📊 Step 1: Blueprint data loaded');
      console.log('Blueprint keys:', Object.keys(blueprintData));
      
      // Capture raw blueprint sample to prove we're using real data
      const rawSample = {
        userName: blueprintData.user_meta?.preferred_name || blueprintData.user_meta?.full_name,
        mbtiType: blueprintData.cognitiveTemperamental?.mbtiType,
        hdType: blueprintData.energyDecisionStrategy?.humanDesignType,
        sunSign: blueprintData.publicArchetype?.sunSign,
        lifePath: blueprintData.coreValuesNarrative?.lifePath,
        chineseZodiac: blueprintData.generationalCode?.chineseZodiac,
        hasRealData: true,
        blueprintKeys: Object.keys(blueprintData),
        totalDataPoints: Object.keys(blueprintData).length
      };
      setRawBlueprintSample(rawSample);

      // Step 2: Update the holistic coach with blueprint data
      console.log('🔄 Step 2: Updating holistic coach service');
      holisticCoachService.updateBlueprint(blueprintData);

      // Step 3: Check if service is ready
      console.log('✅ Step 3: Checking service readiness');
      const isReady = holisticCoachService.isReady();
      console.log('Service ready:', isReady);

      if (!isReady) {
        throw new Error('Holistic coach service is not ready after blueprint update');
      }

      // Step 4: Generate system prompt
      console.log('📝 Step 4: Generating system prompt');
      const prompt = holisticCoachService.generateSystemPrompt();
      setSystemPrompt(prompt);

      // Step 5: Get personality insights
      console.log('🔍 Step 5: Getting personality insights');
      const insights = holisticCoachService.getPersonalityInsights();

      // Step 6: Validate the 7-layer structure
      console.log('🏗️ Step 6: Validating 7-layer structure');
      const validation = validateSevenLayerStructure(insights);

      // Step 7: Validate data authenticity (not hardcoded)
      console.log('🔍 Step 7: Validating data authenticity');
      const authenticityCheck = validateDataAuthenticity(insights, blueprintData);

      setTestResults({
        step1_blueprintLoaded: !!blueprintData,
        step2_serviceUpdated: true,
        step3_serviceReady: isReady,
        step4_promptGenerated: prompt.length > 100,
        step5_insightsGenerated: !!insights,
        step6_structureValid: validation.isValid,
        step7_dataAuthentic: authenticityCheck.isAuthentic,
        validation: validation,
        authenticityCheck: authenticityCheck,
        insights: insights,
        rawBlueprintSample: rawSample,
        timestamp: new Date().toISOString()
      });

      console.log('✅ E2E Test completed successfully');

    } catch (err) {
      console.error('❌ E2E Test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const validateSevenLayerStructure = (insights: any) => {
    console.log('🔬 Validating seven layer structure:', insights);
    
    if (!insights || !insights.layers) {
      return { isValid: false, missing: ['entire layers structure'] };
    }

    const expectedLayers = [
      'neural', 'traits', 'motivation', 'energy', 
      'archetypal', 'shadow', 'expression'
    ];
    
    const missing = expectedLayers.filter(layer => !insights.layers[layer]);
    const present = expectedLayers.filter(layer => !!insights.layers[layer]);

    return {
      isValid: missing.length === 0,
      missing,
      present,
      layerDetails: {
        neural: insights.layers.neural ? Object.keys(insights.layers.neural) : [],
        traits: insights.layers.traits ? Object.keys(insights.layers.traits) : [],
        motivation: insights.layers.motivation ? Object.keys(insights.layers.motivation) : [],
        energy: insights.layers.energy ? Object.keys(insights.layers.energy) : [],
        archetypal: insights.layers.archetypal ? Object.keys(insights.layers.archetypal) : [],
        shadow: insights.layers.shadow ? Object.keys(insights.layers.shadow) : [],
        expression: insights.layers.expression ? Object.keys(insights.layers.expression) : []
      }
    };
  };

  const validateDataAuthenticity = (insights: any, blueprintData: any) => {
    console.log('🔍 Validating data authenticity against raw blueprint');
    
    if (!insights || !blueprintData) {
      return { isAuthentic: false, reason: 'Missing data for comparison' };
    }

    const checks = [];
    
    // Check if MBTI matches
    const mbtiMatch = insights.layers?.traits?.mbtiType === blueprintData.cognitiveTemperamental?.mbtiType;
    checks.push({ test: 'MBTI Type Match', passed: mbtiMatch, expected: blueprintData.cognitiveTemperamental?.mbtiType, actual: insights.layers?.traits?.mbtiType });

    // Check if HD type matches
    const hdMatch = insights.layers?.energy?.humanDesignType === blueprintData.energyDecisionStrategy?.humanDesignType;
    checks.push({ test: 'Human Design Type Match', passed: hdMatch, expected: blueprintData.energyDecisionStrategy?.humanDesignType, actual: insights.layers?.energy?.humanDesignType });

    // Check if life path matches
    const lifePathMatch = insights.layers?.motivation?.lifePath === blueprintData.coreValuesNarrative?.lifePath;
    checks.push({ test: 'Life Path Match', passed: lifePathMatch, expected: blueprintData.coreValuesNarrative?.lifePath, actual: insights.layers?.motivation?.lifePath });

    // Check if sun sign matches
    const sunSignMatch = insights.layers?.archetypal?.sunSign === blueprintData.publicArchetype?.sunSign;
    checks.push({ test: 'Sun Sign Match', passed: sunSignMatch, expected: blueprintData.publicArchetype?.sunSign, actual: insights.layers?.archetypal?.sunSign });

    const passedChecks = checks.filter(check => check.passed).length;
    const totalChecks = checks.length;

    return {
      isAuthentic: passedChecks >= Math.ceil(totalChecks * 0.75), // At least 75% of checks must pass
      passedChecks,
      totalChecks,
      checks,
      reason: passedChecks < Math.ceil(totalChecks * 0.75) ? 'Too many data mismatches detected' : 'Data authenticity verified'
    };
  };

  const getStatusBadge = (success: boolean) => {
    return success ? 
      <Badge className="bg-green-100 text-green-800">✅ PASS</Badge> : 
      <Badge className="bg-red-100 text-red-800">❌ FAIL</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Seven Layer Personality - End to End Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button 
                onClick={runEndToEndTest} 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Loading Blueprint...' : 'Run E2E Test'}
              </Button>
              {blueprintData && (
                <Badge className="bg-blue-100 text-blue-800">
                  Blueprint Available: {blueprintData.user_meta?.preferred_name || 'User'}
                </Badge>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">❌ Test Failed</h4>
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {testResults && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-4">🧪 Test Results</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <span>Blueprint Loaded</span>
                      {getStatusBadge(testResults.step1_blueprintLoaded)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Service Updated</span>
                      {getStatusBadge(testResults.step2_serviceUpdated)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Service Ready</span>
                      {getStatusBadge(testResults.step3_serviceReady)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Prompt Generated</span>
                      {getStatusBadge(testResults.step4_promptGenerated)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Insights Generated</span>
                      {getStatusBadge(testResults.step5_insightsGenerated)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>7-Layer Structure Valid</span>
                      {getStatusBadge(testResults.step6_structureValid)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Data Authenticity</span>
                      {getStatusBadge(testResults.step7_dataAuthentic)}
                    </div>
                  </div>
                </div>

                {rawBlueprintSample && (
                  <Card>
                    <CardHeader>
                      <CardTitle>📊 Raw Blueprint Data Proof</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div><strong>User Name:</strong> {rawBlueprintSample.userName}</div>
                        <div><strong>MBTI Type:</strong> {rawBlueprintSample.mbtiType}</div>
                        <div><strong>HD Type:</strong> {rawBlueprintSample.hdType}</div>
                        <div><strong>Sun Sign:</strong> {rawBlueprintSample.sunSign}</div>
                        <div><strong>Life Path:</strong> {rawBlueprintSample.lifePath}</div>
                        <div><strong>Chinese Zodiac:</strong> {rawBlueprintSample.chineseZodiac}</div>
                        <div><strong>Total Data Points:</strong> {rawBlueprintSample.totalDataPoints}</div>
                        <div><strong>Blueprint Keys:</strong> {rawBlueprintSample.blueprintKeys?.join(', ')}</div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {testResults.authenticityCheck && (
                  <Card>
                    <CardHeader>
                      <CardTitle>🔍 Data Authenticity Check</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Authenticity Score:</span>
                          <Badge className={testResults.authenticityCheck.isAuthentic ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {testResults.authenticityCheck.passedChecks}/{testResults.authenticityCheck.totalChecks} checks passed
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          {testResults.authenticityCheck.checks?.map((check: any, index: number) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span>{check.test}</span>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(check.passed)}
                                <span className="text-xs text-gray-500">
                                  {check.expected} → {check.actual}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {testResults.validation && (
                  <Card>
                    <CardHeader>
                      <CardTitle>🏗️ Seven Layer Structure Validation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <span className="font-semibold">Present Layers:</span> 
                          <div className="flex flex-wrap gap-2 mt-1">
                            {testResults.validation.present.map((layer: string) => (
                              <Badge key={layer} className="bg-green-100 text-green-800">
                                {layer}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {testResults.validation.missing.length > 0 && (
                          <div>
                            <span className="font-semibold">Missing Layers:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {testResults.validation.missing.map((layer: string) => (
                                <Badge key={layer} className="bg-red-100 text-red-800">
                                  {layer}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-4">
                          <span className="font-semibold">Layer Details:</span>
                          <div className="mt-2 space-y-2 text-sm">
                            {Object.entries(testResults.validation.layerDetails).map(([layer, details]) => (
                              <div key={layer} className="flex justify-between">
                                <span className="capitalize">{layer}:</span>
                                <span className="text-gray-600">
                                  {Array.isArray(details) ? `${details.length} properties` : 'No data'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {systemPrompt && (
                  <Card>
                    <CardHeader>
                      <CardTitle>📝 Generated System Prompt</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap">{systemPrompt}</pre>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        Length: {systemPrompt.length} characters
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SevenLayerPersonalityTest;
