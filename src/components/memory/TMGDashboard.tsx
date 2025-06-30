
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Database, 
  Archive, 
  Activity, 
  Clock, 
  TrendingUp,
  RefreshCw,
  Network
} from 'lucide-react';
import { useTieredMemory } from '@/hooks/use-tiered-memory';

interface TMGDashboardProps {
  userId: string;
  sessionId: string;
  compact?: boolean;
}

export const TMGDashboard: React.FC<TMGDashboardProps> = ({
  userId,
  sessionId,
  compact = false
}) => {
  const {
    hotMemory,
    graphContext,
    metrics,
    isLoading,
    loadHotMemory,
    loadMetrics,
    integrateWithExistingMemory
  } = useTieredMemory(userId, sessionId);

  const [isIntegrating, setIsIntegrating] = useState(false);

  const handleIntegrateMemory = async () => {
    setIsIntegrating(true);
    try {
      await integrateWithExistingMemory();
      await loadHotMemory();
      await loadMetrics();
    } finally {
      setIsIntegrating(false);
    }
  };

  const totalHits = metrics.hotHits + metrics.warmHits + metrics.coldHits;
  const hotHitRate = totalHits > 0 ? (metrics.hotHits / totalHits) * 100 : 0;
  const warmHitRate = totalHits > 0 ? (metrics.warmHits / totalHits) * 100 : 0;

  if (compact) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium">TMG Status</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={loadMetrics}
            disabled={isLoading}
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Hot: {hotMemory.length}
            </Badge>
          </div>
          <div className="text-center">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Graph: {graphContext.nodes.length}
            </Badge>
          </div>
          <div className="text-center">
            <Badge variant="outline" className="bg-orange-50 text-orange-700">
              {hotHitRate.toFixed(0)}% Hot Hit
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="w-6 h-6 text-purple-600" />
          <div>
            <h2 className="text-xl font-semibold">Tiered Memory Graph</h2>
            <p className="text-sm text-gray-600">
              Intelligent context management across hot, warm, and cold memory layers
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleIntegrateMemory}
            disabled={isIntegrating}
          >
            {isIntegrating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Database className="w-4 h-4" />
            )}
            Integrate Memory
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadHotMemory();
              loadMetrics();
            }}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Memory Layer Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Hot Memory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {hotMemory.length}
            </div>
            <p className="text-xs text-gray-600 mb-2">Recent conversation turns</p>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              Avg: {metrics.avgLatency.hot?.toFixed(0) || 0}ms
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Warm Memory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {graphContext.nodes.length}
            </div>
            <p className="text-xs text-gray-600 mb-2">Knowledge graph nodes</p>
            <div className="flex items-center text-xs text-gray-500">
              <Network className="w-3 h-3 mr-1" />
              {graphContext.edges.length} connections
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              Cold Archive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 mb-1">
              Δ
            </div>
            <p className="text-xs text-gray-600 mb-2">Delta compressed</p>
            <div className="flex items-center text-xs text-gray-500">
              <Archive className="w-3 h-3 mr-1" />
              Merkle chain
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Performance Heat Map
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metrics.hotHits}
              </div>
              <div className="text-sm text-gray-600">Hot Hits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {metrics.warmHits}
              </div>
              <div className="text-sm text-gray-600">Warm Hits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {metrics.coldHits}
              </div>
              <div className="text-sm text-gray-600">Cold Hits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {hotHitRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Hot Hit Rate</div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Hot Memory Efficiency</span>
                <span>{hotHitRate.toFixed(1)}%</span>
              </div>
              <Progress value={hotHitRate} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Warm Memory Usage</span>
                <span>{warmHitRate.toFixed(1)}%</span>
              </div>
              <Progress value={warmHitRate} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Hot Memory */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Context (Hot Memory)</CardTitle>
        </CardHeader>
        <CardContent>
          {hotMemory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hot memory entries yet</p>
              <p className="text-sm">Start a conversation to populate memory</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {hotMemory.slice(0, 10).map((entry) => (
                <div key={entry.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <Badge 
                      variant="outline" 
                      className={`text-xs font-mono ${
                        entry.importance_score > 7 ? 'bg-red-50 text-red-700' :
                        entry.importance_score > 5 ? 'bg-yellow-50 text-yellow-700' :
                        'bg-green-50 text-green-700'
                      }`}
                    >
                      {entry.importance_score.toFixed(1)}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">
                      {typeof entry.raw_content === 'string' 
                        ? entry.raw_content.substring(0, 100) + '...'
                        : JSON.stringify(entry.raw_content).substring(0, 100) + '...'
                      }
                    </div>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                      <span>Accessed {entry.access_count} times</span>
                      <span>•</span>
                      <span>{new Date(entry.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs font-mono">
              <div>Session ID: {sessionId}</div>
              <div>Hot Memory Entries: {hotMemory.length}</div>
              <div>Graph Nodes: {graphContext.nodes.length}</div>
              <div>Graph Edges: {graphContext.edges.length}</div>
              <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
