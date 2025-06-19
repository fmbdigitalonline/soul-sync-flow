
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { dreamActivityLogger } from '@/services/dream-activity-logger';
import { enhancedTaskCoachIntegrationService } from '@/services/enhanced-task-coach-integration-service';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Download, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

interface ActivityLog {
  id: string;
  activity_type: string;
  activity_data: any;
  timestamp: string;
  page_url: string;
  correlation_id: string;
}

export const DreamActivityDebugger: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [actionStats, setActionStats] = useState<any>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('dream_activity_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActionStats = () => {
    const stats = enhancedTaskCoachIntegrationService.getActionStats();
    setActionStats(stats);
  };

  useEffect(() => {
    fetchLogs();
    fetchActionStats();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchLogs();
        fetchActionStats();
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `dream-activity-logs-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const testLogging = async () => {
    await dreamActivityLogger.logActivity('debug_test', {
      test_timestamp: new Date().toISOString(),
      test_data: { message: 'This is a test log entry' }
    });
    
    setTimeout(fetchLogs, 500);
  };

  const resetRateLimits = () => {
    enhancedTaskCoachIntegrationService.resetRateLimits();
    fetchActionStats();
  };

  const filteredLogs = logs.filter(log => 
    !filter || 
    log.activity_type.toLowerCase().includes(filter.toLowerCase()) ||
    JSON.stringify(log.activity_data).toLowerCase().includes(filter.toLowerCase())
  );

  const getActivityTypeColor = (type: string) => {
    if (type.includes('error')) return 'bg-red-100 text-red-700 border-red-200';
    if (type.includes('success') || type.includes('completed')) return 'bg-green-100 text-green-700 border-green-200';
    if (type.includes('action')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (type.includes('message')) return 'bg-purple-100 text-purple-700 border-purple-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dream Activity Debugger</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={testLogging}>
            Test Logging
          </Button>
          <Button variant="outline" size="sm" onClick={resetRateLimits}>
            Reset Rate Limits
          </Button>
          <Button variant="outline" size="sm" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Logs</div>
          <div className="text-2xl font-bold">{logs.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Current Session</div>
          <div className="text-lg font-mono">{dreamActivityLogger.getCurrentSessionId().substring(0, 8)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Actions</div>
          <div className="text-2xl font-bold">{actionStats?.total_actions || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Unique Actions</div>
          <div className="text-2xl font-bold">{actionStats?.unique_actions || 0}</div>
        </Card>
      </div>

      {/* Action Stats */}
      {actionStats && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3">Action Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(actionStats.actions_by_type || {}).map(([action, count]) => (
              <div key={action} className="text-sm">
                <div className="font-medium">{action}</div>
                <div className="text-gray-600">{count} times</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filter */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Filter logs by activity type or content..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
        />
        <Button onClick={fetchLogs} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Logs Display */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredLogs.map((log) => (
          <Card key={log.id} className="p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getActivityTypeColor(log.activity_type)}`}
                >
                  {log.activity_type}
                </Badge>
                <span className="text-xs text-gray-500">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-xs text-gray-400 font-mono">
                {log.correlation_id?.substring(0, 8)}
              </div>
            </div>
            
            {log.page_url && (
              <div className="text-xs text-gray-500 mb-2">
                📍 {log.page_url}
              </div>
            )}
            
            <div className="bg-gray-50 rounded p-2 text-xs font-mono overflow-x-auto">
              <pre>{JSON.stringify(log.activity_data, null, 2)}</pre>
            </div>
          </Card>
        ))}
        
        {filteredLogs.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            No logs found matching your filter.
          </div>
        )}
      </div>
    </div>
  );
};
