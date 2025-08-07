import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Clock, CheckCircle, AlertCircle, Code } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { hermeticIntelligenceService } from '@/services/hermetic-intelligence-service';

interface TestResult {
  method: string;
  duration: number;
  success: boolean;
  result: any;
  error?: string;
}

const SERVICE_METHODS = [
  {
    key: 'getStructuredIntelligence',
    label: 'Get Structured Intelligence',
    description: 'Retrieve complete intelligence data for a user',
    parameters: ['userId']
  },
  {
    key: 'hasStructuredIntelligence',
    label: 'Has Structured Intelligence',
    description: 'Check if intelligence data exists for a user',
    parameters: ['userId']
  },
  {
    key: 'getDimension',
    label: 'Get Single Dimension',
    description: 'Retrieve a specific psychological dimension',
    parameters: ['userId', 'dimension']
  },
  {
    key: 'getMultipleDimensions',
    label: 'Get Multiple Dimensions',
    description: 'Retrieve multiple dimensions efficiently',
    parameters: ['userId', 'dimensions']
  },
  {
    key: 'searchPatterns',
    label: 'Search Patterns',
    description: 'Search for patterns across dimensions',
    parameters: ['userId', 'searchQuery']
  },
  {
    key: 'getExtractionMetadata',
    label: 'Get Extraction Metadata',
    description: 'Retrieve extraction metadata and confidence scores',
    parameters: ['userId']
  },
  {
    key: 'triggerExtraction',
    label: 'Trigger Extraction',
    description: 'Start the intelligence extraction process',
    parameters: ['userId', 'forceReprocess']
  }
];

const DIMENSION_OPTIONS = [
  'identity_constructs', 'behavioral_triggers', 'execution_bias', 'internal_conflicts',
  'spiritual_dimension', 'adaptive_feedback', 'temporal_biology', 'metacognitive_biases',
  'attachment_style', 'goal_archetypes', 'crisis_handling', 'identity_flexibility',
  'linguistic_fingerprint'
];

export const ServiceTester: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [parameters, setParameters] = useState<Record<string, any>>({
    userId: user?.id || '',
    dimension: '',
    dimensions: [],
    searchQuery: '',
    forceReprocess: false
  });
  const [isExecuting, setIsExecuting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const executeMethod = async () => {
    if (!selectedMethod) return;

    const method = SERVICE_METHODS.find(m => m.key === selectedMethod);
    if (!method) return;

    setIsExecuting(true);
    const startTime = Date.now();

    try {
      let result;
      const service = hermeticIntelligenceService;

      switch (selectedMethod) {
        case 'getStructuredIntelligence':
          result = await service.getStructuredIntelligence(parameters.userId);
          break;
        case 'hasStructuredIntelligence':
          result = await service.hasStructuredIntelligence(parameters.userId);
          break;
        case 'getDimension':
          result = await service.getDimension(parameters.userId, parameters.dimension);
          break;
        case 'getMultipleDimensions':
          result = await service.getMultipleDimensions(parameters.userId, parameters.dimensions);
          break;
        case 'searchPatterns':
          result = await service.searchPatterns(parameters.userId, parameters.searchQuery);
          break;
        case 'getExtractionMetadata':
          result = await service.getExtractionMetadata(parameters.userId);
          break;
        case 'triggerExtraction':
          result = await service.triggerExtraction(parameters.userId, parameters.forceReprocess);
          break;
        default:
          throw new Error(`Unknown method: ${selectedMethod}`);
      }

      const duration = Date.now() - startTime;
      const testResult: TestResult = {
        method: selectedMethod,
        duration,
        success: true,
        result
      };

      setTestResults(prev => [testResult, ...prev.slice(0, 9)]); // Keep last 10 results
      
      toast({
        title: "Test Complete",
        description: `${method.label} executed in ${duration}ms`,
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      const testResult: TestResult = {
        method: selectedMethod,
        duration,
        success: false,
        result: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      setTestResults(prev => [testResult, ...prev.slice(0, 9)]);
      
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const selectedMethodData = SERVICE_METHODS.find(m => m.key === selectedMethod);

  const renderParameterInput = (paramName: string) => {
    switch (paramName) {
      case 'userId':
        return (
          <Input
            value={parameters.userId}
            onChange={(e) => setParameters(prev => ({ ...prev, userId: e.target.value }))}
            placeholder="Enter user ID"
          />
        );
      
      case 'dimension':
        return (
          <Select
            value={parameters.dimension}
            onValueChange={(value) => setParameters(prev => ({ ...prev, dimension: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select dimension" />
            </SelectTrigger>
            <SelectContent>
              {DIMENSION_OPTIONS.map(dim => (
                <SelectItem key={dim} value={dim}>
                  {dim.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'dimensions':
        return (
          <div className="space-y-2">
            <Input
              value={parameters.dimensions.join(', ')}
              onChange={(e) => setParameters(prev => ({ 
                ...prev, 
                dimensions: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              }))}
              placeholder="Enter dimensions separated by commas"
            />
            <p className="text-xs text-muted-foreground">
              Available: {DIMENSION_OPTIONS.join(', ')}
            </p>
          </div>
        );
      
      case 'searchQuery':
        return (
          <Input
            value={parameters.searchQuery}
            onChange={(e) => setParameters(prev => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="Enter search query"
          />
        );
      
      case 'forceReprocess':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={parameters.forceReprocess}
              onChange={(e) => setParameters(prev => ({ ...prev, forceReprocess: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm">Force reprocess existing data</span>
          </div>
        );
      
      default:
        return (
          <Input
            value={parameters[paramName] || ''}
            onChange={(e) => setParameters(prev => ({ ...prev, [paramName]: e.target.value }))}
            placeholder={`Enter ${paramName}`}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code className="w-5 h-5" />
            <span>Service Method Testing</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Method</Label>
            <Select value={selectedMethod} onValueChange={setSelectedMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a service method to test" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_METHODS.map(method => (
                  <SelectItem key={method.key} value={method.key}>
                    <div>
                      <div className="font-medium">{method.label}</div>
                      <div className="text-xs text-muted-foreground">{method.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMethodData && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <h4 className="font-medium mb-2">Parameters</h4>
                <div className="space-y-3">
                  {selectedMethodData.parameters.map(param => (
                    <div key={param} className="space-y-1">
                      <Label className="text-sm">{param.replace(/([A-Z])/g, ' $1').toLowerCase()}</Label>
                      {renderParameterInput(param)}
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={executeMethod}
                disabled={isExecuting}
                className="w-full"
              >
                {isExecuting ? (
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {isExecuting ? 'Executing...' : 'Execute Method'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>Test Results</span>
            {testResults.length > 0 && (
              <Badge variant="outline">{testResults.length} results</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No test results yet. Execute a method to see results here.
            </p>
          ) : (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="font-medium">{result.method}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? 'Success' : 'Failed'}
                      </Badge>
                      <Badge variant="outline">
                        {result.duration}ms
                      </Badge>
                    </div>
                  </div>

                  {result.error && (
                    <div className="bg-red-50 border border-red-200 rounded p-2 mb-2">
                      <p className="text-red-700 text-sm">{result.error}</p>
                    </div>
                  )}

                  {result.result && (
                    <div className="bg-muted/30 rounded p-3">
                      <Textarea
                        value={JSON.stringify(result.result, null, 2)}
                        readOnly
                        className="font-mono text-xs"
                        rows={Math.min(10, JSON.stringify(result.result, null, 2).split('\n').length)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};