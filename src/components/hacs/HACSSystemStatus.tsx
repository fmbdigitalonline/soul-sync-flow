
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, MessageSquare, TrendingUp } from 'lucide-react';
import { useHacsIntelligence } from '@/hooks/use-hacs-intelligence';
import { useLanguage } from '@/contexts/LanguageContext';

export const HACSSystemStatus: React.FC = () => {
  const { intelligence } = useHacsIntelligence();
  const { t } = useLanguage();

  return (
    <Card>
      <CardContent className="p-4">
        <h4 className="font-medium mb-3 flex items-center">
          <Brain className="h-4 w-4 mr-2" />
          {t('system.pureSoulIntelligence')}
        </h4>
        
        <div className="space-y-3">
          {/* Intelligence Level */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Intelligence Level</span>
            <Badge variant="default" className="bg-blue-500">
              {intelligence?.intelligence_level || 0}%
            </Badge>
          </div>
          
          {/* Interaction Count */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Interactions</span>
            <Badge variant="outline">
              {intelligence?.interaction_count || 0}
            </Badge>
          </div>
          
          {/* Module Scores */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Module Scores</span>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">PIE</div>
                <Badge variant="secondary" className="text-xs">
                  {intelligence?.pie_score || 0}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">VFP</div>
                <Badge variant="secondary" className="text-xs">
                  {intelligence?.vfp_score || 0}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">TMG</div>
                <Badge variant="secondary" className="text-xs">
                  {intelligence?.tmg_score || 0}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* System Status */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-600 flex items-center">
                <Zap className="h-3 w-3 mr-1" />
                {t('system.soulActive')}
              </span>
              <span className="text-green-600">No Fallbacks</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
