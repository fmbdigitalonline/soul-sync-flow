
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Briefcase, Activity, TrendingUp, Palette } from 'lucide-react';
import { memoryService } from '@/services/memory-service';

interface LifeContext {
  context_category: 'career' | 'relationships' | 'health' | 'growth' | 'creative';
  current_focus?: string;
  recent_progress: string[];
  ongoing_challenges: string[];
  celebration_moments: string[];
}

export const LifeContextPanel: React.FC = () => {
  const [lifeContext, setLifeContext] = useState<LifeContext[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLifeContext();
  }, []);

  const loadLifeContext = async () => {
    try {
      const context = await memoryService.getLifeContext();
      setLifeContext(context);
    } catch (error) {
      console.error('Error loading life context:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'career': return <Briefcase className="h-4 w-4" />;
      case 'relationships': return <Heart className="h-4 w-4" />;
      case 'health': return <Activity className="h-4 w-4" />;
      case 'growth': return <TrendingUp className="h-4 w-4" />;
      case 'creative': return <Palette className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'career': return 'text-blue-600 bg-blue-50';
      case 'relationships': return 'text-pink-600 bg-pink-50';
      case 'health': return 'text-green-600 bg-green-50';
      case 'growth': return 'text-purple-600 bg-purple-50';
      case 'creative': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-sm">Life Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (lifeContext.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-sm">Life Context</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-500 text-center py-4">
            Your life context will appear here as you share more about yourself
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm">Life Context</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {lifeContext.slice(0, 3).map((context) => (
          <div key={context.context_category} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded ${getCategoryColor(context.context_category)}`}>
                {getCategoryIcon(context.context_category)}
              </div>
              <span className="text-sm font-medium capitalize">
                {context.context_category}
              </span>
            </div>
            
            {context.current_focus && (
              <div className="pl-7">
                <p className="text-xs text-gray-600">
                  <strong>Focus:</strong> {context.current_focus}
                </p>
              </div>
            )}
            
            {context.recent_progress.length > 0 && (
              <div className="pl-7">
                <p className="text-xs text-green-600 mb-1">
                  <strong>Recent Progress:</strong>
                </p>
                <div className="space-y-1">
                  {context.recent_progress.slice(0, 2).map((progress, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs mr-1 mb-1">
                      {progress}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {context.celebration_moments.length > 0 && (
              <div className="pl-7">
                <p className="text-xs text-purple-600">
                  <strong>Latest Win:</strong> {context.celebration_moments[0]}
                </p>
              </div>
            )}
          </div>
        ))}
        
        {lifeContext.length > 3 && (
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              +{lifeContext.length - 3} more life areas tracked
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
