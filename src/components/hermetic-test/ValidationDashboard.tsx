import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertTriangle, Info, RefreshCw, Activity, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { hermeticIntelligenceService } from '@/services/hermetic-intelligence-service';
import { HermeticStructuredIntelligence } from '@/types/hermetic-intelligence';

interface ValidationResult {
  dimension: string;
  label: string;
  hasData: boolean;
  dataQuality: 'high' | 'medium' | 'low' | 'missing';
  itemCount: number;
  confidence?: number;
  issues: string[];
}

const DIMENSION_LABELS = {
  identity_constructs: 'Identity Constructs',
  behavioral_triggers: 'Behavioral Triggers',
  execution_bias: 'Execution Bias',
  internal_conflicts: 'Internal Conflicts',
  spiritual_dimension: 'Spiritual Dimension',
  adaptive_feedback: 'Adaptive Feedback',
  temporal_biology: 'Temporal Biology',
  metacognitive_biases: 'Metacognitive Biases',
  attachment_style: 'Attachment Style',
  goal_archetypes: 'Goal Archetypes',
  crisis_handling: 'Crisis Handling',
  identity_flexibility: 'Identity Flexibility',
  linguistic_fingerprint: 'Linguistic Fingerprint'
};

export const ValidationDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [intelligence, setIntelligence] = useState<HermeticStructuredIntelligence | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    if (user?.id) {
      loadValidationData();
    }
  }, [user?.id]);

  const loadValidationData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Load intelligence data
      const intelligenceResult = await hermeticIntelligenceService.getStructuredIntelligence(user.id);
      
      if (intelligenceResult.success && intelligenceResult.intelligence) {
        setIntelligence(intelligenceResult.intelligence);
        
        // Load metadata
        const metadataResult = await hermeticIntelligenceService.getExtractionMetadata(user.id);
        if (metadataResult.success && metadataResult.metadata) {
          setMetadata(metadataResult.metadata);
        }
        
        // Perform validation
        validateIntelligence(intelligenceResult.intelligence);
        
        toast({
          title: "Validation Complete",
          description: "Intelligence data loaded and validated",
        });
      } else {
        toast({
          title: "No Data Found",
          description: "No intelligence data available for validation",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Validation failed:', error);
      toast({
        title: "Validation Failed",
        description: "Failed to load data for validation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateIntelligence = (intel: HermeticStructuredIntelligence) => {
    const results: ValidationResult[] = [];
    let totalScore = 0;
    
    Object.entries(DIMENSION_LABELS).forEach(([key, label]) => {
      const data = intel[key as keyof HermeticStructuredIntelligence];
      const result = validateDimension(key, label, data);
      results.push(result);
      
      // Calculate score contribution
      if (result.hasData) {
        totalScore += result.dataQuality === 'high' ? 10 : 
                     result.dataQuality === 'medium' ? 6 : 
                     result.dataQuality === 'low' ? 3 : 0;
      }
    });
    
    setValidationResults(results);
    setOverallScore(Math.round((totalScore / (results.length * 10)) * 100));
  };

  const validateDimension = (dimension: string, label: string, data: any): ValidationResult => {
    const issues: string[] = [];
    
    if (!data || typeof data !== 'object') {
      return {
        dimension,
        label,
        hasData: false,
        dataQuality: 'missing',
        itemCount: 0,
        issues: ['No data available']
      };
    }

    // Count items in the dimension
    let itemCount = 0;
    Object.values(data).forEach(value => {
      if (Array.isArray(value)) {
        itemCount += value.length;
      } else if (value && typeof value === 'string' && value.trim()) {
        itemCount += 1;
      } else if (value && typeof value === 'object') {
        itemCount += Object.keys(value).length;
      }
    });

    // Determine data quality
    let dataQuality: 'high' | 'medium' | 'low' | 'missing' = 'high';
    
    if (itemCount === 0) {
      dataQuality = 'missing';
      issues.push('No extracted items found');
    } else if (itemCount < 3) {
      dataQuality = 'low';
      issues.push('Very few extracted items');
    } else if (itemCount < 8) {
      dataQuality = 'medium';
      issues.push('Moderate number of extracted items');
    }

    // Check for empty arrays
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length === 0) {
        issues.push(`Empty array: ${key}`);
      } else if (typeof value === 'string' && !value.trim()) {
        issues.push(`Empty string: ${key}`);
      }
    });

    return {
      dimension,
      label,
      hasData: true,
      dataQuality,
      itemCount,
      issues: issues.length > 0 ? issues : ['Data looks good']
    };
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'missing': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'high': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'medium': return <Info className="w-4 h-4 text-yellow-500" />;
      case 'low': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'missing': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Activity className="w-8 h-8 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground">Running validation checks...</p>
          <Progress value={undefined} className="w-48" />
        </div>
      </div>
    );
  }

  if (!intelligence) {
    return (
      <div className="text-center py-12 space-y-4">
        <Database className="w-12 h-12 text-muted-foreground mx-auto" />
        <div>
          <h3 className="text-lg font-semibold mb-2">No Data to Validate</h3>
          <p className="text-muted-foreground mb-4">
            No intelligence data available for validation.
          </p>
          <Button onClick={loadValidationData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Validation
          </Button>
        </div>
      </div>
    );
  }

  const highQualityCount = validationResults.filter(r => r.dataQuality === 'high').length;
  const mediumQualityCount = validationResults.filter(r => r.dataQuality === 'medium').length;
  const lowQualityCount = validationResults.filter(r => r.dataQuality === 'low').length;
  const missingCount = validationResults.filter(r => r.dataQuality === 'missing').length;

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Data Quality Score</span>
            <Badge 
              variant="outline" 
              className={overallScore >= 80 ? getQualityColor('high') : 
                         overallScore >= 60 ? getQualityColor('medium') : 
                         overallScore >= 40 ? getQualityColor('low') : getQualityColor('missing')}
            >
              {overallScore}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={overallScore} className="w-full h-3" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{highQualityCount}</p>
                <p className="text-sm text-muted-foreground">High Quality</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{mediumQualityCount}</p>
                <p className="text-sm text-muted-foreground">Medium Quality</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{lowQualityCount}</p>
                <p className="text-sm text-muted-foreground">Low Quality</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{missingCount}</p>
                <p className="text-sm text-muted-foreground">Missing Data</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="dimensions">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dimensions">Dimension Validation</TabsTrigger>
          <TabsTrigger value="metadata">Extraction Metadata</TabsTrigger>
        </TabsList>

        <TabsContent value="dimensions" className="space-y-4">
          {/* Dimension Validation Results */}
          <Card>
            <CardHeader>
              <CardTitle>12-Dimension Validation Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {validationResults.map((result) => (
                  <div key={result.dimension} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getQualityIcon(result.dataQuality)}
                        <h4 className="font-medium">{result.label}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getQualityColor(result.dataQuality)} variant="outline">
                          {result.dataQuality}
                        </Badge>
                        <Badge variant="outline">
                          {result.itemCount} items
                        </Badge>
                      </div>
                    </div>
                    
                    {result.issues.length > 0 && (
                      <div className="space-y-1">
                        {result.issues.map((issue, index) => (
                          <p key={index} className="text-sm text-muted-foreground">
                            • {issue}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-4">
          {/* Extraction Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Extraction Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              {metadata ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Extraction Confidence</Label>
                    <div className="flex items-center space-x-2">
                      <Progress value={metadata.extraction_confidence} className="flex-1" />
                      <span className="text-sm font-medium">{metadata.extraction_confidence}%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Extraction Version</Label>
                    <p className="text-sm text-muted-foreground">{metadata.extraction_version}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Created At</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(metadata.created_at).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Last Updated</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(metadata.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No metadata available</p>
              )}
              
              {intelligence?.processing_notes && (
                <div className="mt-4 space-y-2">
                  <Label className="text-sm font-medium">Processing Notes</Label>
                  <div className="bg-muted/30 rounded p-3">
                    <pre className="text-xs">
                      {JSON.stringify(intelligence.processing_notes, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center">
        <Button onClick={loadValidationData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Validation
        </Button>
      </div>
    </div>
  );
};