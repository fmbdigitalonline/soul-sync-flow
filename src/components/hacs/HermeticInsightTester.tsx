// Hermetic Insight Tester - Development component to verify hermetic insights work
// SoulSync Protocol: Testing component for validation

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { hermeticInsightExtractor } from '@/services/hermetic-insight-extractor';
import { useHermeticReportStatus } from '@/hooks/use-hermetic-report-status';
import { HACSInsight } from '@/hooks/use-hacs-insights';

export const HermeticInsightTester: React.FC = () => {
  const { user } = useAuth();
  const { hasReport, loading: reportLoading } = useHermeticReportStatus();
  const [insights, setInsights] = useState<HACSInsight[]>([]);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testHermeticInsights = async () => {
    if (!user) return;
    
    setTesting(true);
    setError(null);
    
    try {
      console.log('🧪 Testing hermetic insight extraction...');
      const extractedInsights = await hermeticInsightExtractor.generateHermeticReportInsights(user.id);
      
      console.log('✅ Test results:', {
        insightsFound: extractedInsights.length,
        types: extractedInsights.map(i => i.type),
        modules: extractedInsights.map(i => i.module)
      });
      
      setInsights(extractedInsights);
    } catch (err) {
      console.error('❌ Test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setTesting(false);
    }
  };

  if (!user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Hermetic Insight Tester</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please log in to test hermetic insights.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Hermetic Insight Tester</CardTitle>
        <p className="text-sm text-muted-foreground">
          Test extraction of insights from your completed 50,000+ word Hermetic report
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Report Status */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium mb-2">Report Status</h3>
          {reportLoading ? (
            <p>Checking hermetic report status...</p>
          ) : (
            <div className="space-y-2">
              <p>Has Hermetic Report: <span className={hasReport ? 'text-green-600' : 'text-red-600'}>{hasReport ? 'Yes' : 'No'}</span></p>
              {!hasReport && (
                <p className="text-sm text-muted-foreground">
                  Complete your blueprint assessment to generate your hermetic report first.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Test Button */}
        <Button 
          onClick={testHermeticInsights} 
          disabled={!hasReport || testing || reportLoading}
          className="w-full"
        >
          {testing ? 'Testing Hermetic Insights...' : 'Test Hermetic Insight Extraction'}
        </Button>

        {/* Error Display */}
        {error && (
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <h4 className="font-medium text-red-800 mb-2">Test Error</h4>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Results Display */}
        {insights.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Test Results ({insights.length} insights found)</h3>
            {insights.map((insight, index) => (
              <div key={insight.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Insight #{index + 1}</h4>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {insight.type}
                  </span>
                </div>
                <p className="text-sm">{insight.text}</p>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Module: {insight.module}</span>
                  <span>Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
                  <span>Priority: {insight.priority || 'medium'}</span>
                </div>
                {insight.evidence.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Evidence: {insight.evidence.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {insights.length === 0 && !testing && !error && (
          <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
            <p className="text-sm text-yellow-800">
              No insights extracted yet. Click the test button to try extracting insights from your hermetic report.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};