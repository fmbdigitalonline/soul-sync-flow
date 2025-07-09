
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Sparkles, User, Heart, Brain, Compass, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { aiPersonalityReportService, PersonalityReport } from '@/services/ai-personality-report-service';
import { useToast } from '@/hooks/use-toast';
import { CosmicCard } from '@/components/ui/cosmic-card';

interface PersonalityReportViewerProps {
  className?: string;
}

export const PersonalityReportViewer: React.FC<PersonalityReportViewerProps> = ({ className }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [report, setReport] = useState<PersonalityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReport();
  }, [user]);

  const loadReport = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await aiPersonalityReportService.getStoredReport(user.id);
      if (result.success && result.report) {
        setReport(result.report);
      } else if (result.error) {
        setError(result.error);
      } else {
        setError('No personality report found. Generate your blueprint first.');
      }
    } catch (err) {
      setError('Failed to load personality report');
      console.error('Error loading personality report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadReport();
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-soul-purple mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading your personality report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className={`p-4 ${className}`}>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">{error || 'No personality report available'}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sectionIcons = {
    core_personality_pattern: User,
    decision_making_style: Brain,
    relationship_style: Heart,
    life_path_purpose: Compass,
    current_energy_timing: Zap,
    integrated_summary: Sparkles
  };

  const sectionTitles = {
    core_personality_pattern: 'Core Personality Pattern',
    decision_making_style: 'Decision Making Style',
    relationship_style: 'Relationship Style',
    life_path_purpose: 'Life Path & Purpose',
    current_energy_timing: 'Current Energy & Timing',
    integrated_summary: 'Integrated Summary'
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold font-display">Your Personality Report</h3>
          <p className="text-sm text-muted-foreground">
            Generated on {new Date(report.generated_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-soul-purple/10 text-soul-purple border-soul-purple/20">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Generated
          </Badge>
          <Button onClick={handleRefresh} variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[600px] w-full">
        <div className="space-y-6 pr-4">
          {Object.entries(report.report_content).map(([key, content]) => {
            const IconComponent = sectionIcons[key as keyof typeof sectionIcons];
            const title = sectionTitles[key as keyof typeof sectionTitles];
            
            if (!content || content === 'Content unavailable') return null;
            
            return (
              <CosmicCard key={key}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {IconComponent && <IconComponent className="h-5 w-5 text-soul-purple" />}
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {content}
                    </p>
                  </div>
                </CardContent>
              </CosmicCard>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PersonalityReportViewer;
