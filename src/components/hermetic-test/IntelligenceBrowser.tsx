import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Search, Brain, Eye, Filter, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { hermeticIntelligenceService } from '@/services/hermetic-intelligence-service';
import { HermeticStructuredIntelligence } from '@/types/hermetic-intelligence';

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

export const IntelligenceBrowser: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [intelligence, setIntelligence] = useState<HermeticStructuredIntelligence | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadIntelligence();
    }
  }, [user?.id]);

  const loadIntelligence = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const result = await hermeticIntelligenceService.getStructuredIntelligence(user.id);
      
      if (result.success && result.intelligence) {
        setIntelligence(result.intelligence);
        toast({
          title: "Intelligence Loaded",
          description: `Found intelligence data with ${result.intelligence.extraction_confidence}% confidence`,
        });
      } else {
        toast({
          title: "No Intelligence Found",
          description: "No hermetic intelligence data found for this user. Try running extraction first.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to load intelligence:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load intelligence data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const performSearch = async () => {
    if (!user?.id || !searchQuery.trim()) return;

    try {
      const result = await hermeticIntelligenceService.searchPatterns(user.id, searchQuery);
      
      if (result.success && result.matches) {
        setSearchResults(result.matches);
        toast({
          title: "Search Complete",
          description: `Found ${result.matches.length} matches`,
        });
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: "Search Failed",
        description: "Failed to search intelligence patterns",
        variant: "destructive"
      });
    }
  };

  const exportIntelligence = () => {
    if (!intelligence) return;

    const exportData = {
      user_id: intelligence.user_id,
      extraction_metadata: {
        confidence: intelligence.extraction_confidence,
        version: intelligence.extraction_version,
        created_at: intelligence.created_at
      },
      dimensions: Object.fromEntries(
        Object.entries(DIMENSION_LABELS).map(([key]) => [
          key,
          intelligence[key as keyof HermeticStructuredIntelligence]
        ])
      )
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hermetic-intelligence-${intelligence.user_id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Intelligence data exported successfully",
    });
  };

  const renderDimensionContent = (dimension: string, data: any) => {
    if (!data || typeof data !== 'object') {
      return <p className="text-muted-foreground text-sm">No data available</p>;
    }

    return (
      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="border-l-2 border-primary/20 pl-3">
            <h4 className="font-medium text-sm capitalize">{key.replace(/_/g, ' ')}</h4>
            <div className="text-sm text-muted-foreground">
              {Array.isArray(value) ? (
                <ul className="list-disc list-inside space-y-1">
                  {value.map((item, index) => (
                    <li key={index}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                  ))}
                </ul>
              ) : typeof value === 'object' ? (
                <pre className="text-xs bg-muted/30 p-2 rounded overflow-x-auto">
                  {JSON.stringify(value, null, 2)}
                </pre>
              ) : (
                <p>{String(value)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Brain className="w-8 h-8 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading intelligence data...</p>
          <Progress value={undefined} className="w-48" />
        </div>
      </div>
    );
  }

  if (!intelligence) {
    return (
      <div className="text-center py-12 space-y-4">
        <Brain className="w-12 h-12 text-muted-foreground mx-auto" />
        <div>
          <h3 className="text-lg font-semibold mb-2">No Intelligence Data Found</h3>
          <p className="text-muted-foreground mb-4">
            No hermetic intelligence has been extracted for this user yet.
          </p>
          <Button onClick={loadIntelligence} variant="outline">
            <Search className="w-4 h-4 mr-2" />
            Check Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Intelligence Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>Intelligence Overview</span>
            <Badge variant="outline" className="bg-primary/10 text-primary">
              {intelligence.extraction_confidence}% Confidence
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{intelligence.extraction_confidence}%</p>
              <p className="text-sm text-muted-foreground">Extraction Confidence</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{intelligence.extraction_version}</p>
              <p className="text-sm text-muted-foreground">Version</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">12</p>
              <p className="text-sm text-muted-foreground">Dimensions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {new Date(intelligence.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground">Extracted</p>
            </div>
          </div>

          <div className="flex space-x-2 mt-4">
            <Button onClick={loadIntelligence} variant="outline" size="sm">
              <Search className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportIntelligence} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Pattern Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all dimensions..."
              onKeyPress={(e) => e.key === 'Enter' && performSearch()}
            />
            <Button onClick={performSearch} disabled={!searchQuery.trim()}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Search Results ({searchResults.length})</h4>
              {searchResults.map((result, index) => (
                <div key={index} className="bg-muted/30 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline">{DIMENSION_LABELS[result.dimension as keyof typeof DIMENSION_LABELS] || result.dimension}</Badge>
                    <Badge variant="secondary">
                      {Math.round(result.relevance * 100)}% match
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>{result.field}:</strong> {result.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 12 Dimensions Browser */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>12-Dimension Intelligence Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {Object.entries(DIMENSION_LABELS).map(([key, label]) => {
              const dimensionData = intelligence[key as keyof HermeticStructuredIntelligence];
              const hasData = dimensionData && typeof dimensionData === 'object';
              
              return (
                <AccordionItem key={key} value={key}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="font-medium">{label}</span>
                      <div className="flex items-center space-x-2">
                        {hasData ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Data Available
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-600">
                            No Data
                          </Badge>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {renderDimensionContent(key, dimensionData)}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};