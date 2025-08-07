import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Play, RefreshCw, User, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { hermeticIntelligenceService } from '@/services/hermetic-intelligence-service';
import { supabase } from '@/integrations/supabase/client';

export const ExtractionControlPanel: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [targetUserId, setTargetUserId] = useState(user?.id || '');
  const [forceReprocess, setForceReprocess] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [extractionResult, setExtractionResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const triggerExtraction = async () => {
    if (!targetUserId) {
      toast({
        title: "User ID Required",
        description: "Please enter a valid user ID to trigger extraction.",
        variant: "destructive"
      });
      return;
    }

    setIsExtracting(true);
    setExtractionStatus('running');
    setLogs([]);
    
    addLog(`Starting hermetic intelligence extraction for user: ${targetUserId}`);
    addLog(`Force reprocess: ${forceReprocess ? 'enabled' : 'disabled'}`);

    try {
      // Trigger the extraction via edge function
      const { data, error } = await supabase.functions.invoke('extract-hermetic-intelligence', {
        body: { 
          userId: targetUserId,
          forceReprocess 
        }
      });

      if (error) {
        throw error;
      }

      addLog('Extraction completed successfully');
      addLog(`Processed reports: ${data.processedReports || 0}`);
      addLog(`Total intelligence records: ${data.totalIntelligence || 0}`);
      
      setExtractionResult(data);
      setExtractionStatus('success');
      
      toast({
        title: "Extraction Complete",
        description: `Successfully processed ${data.processedReports || 0} reports`,
      });

    } catch (error) {
      console.error('Extraction failed:', error);
      addLog(`Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setExtractionStatus('error');
      
      toast({
        title: "Extraction Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const checkExistingIntelligence = async () => {
    if (!targetUserId) return;

    addLog(`Checking existing intelligence for user: ${targetUserId}`);
    
    try {
      const hasIntelligence = await hermeticIntelligenceService.hasStructuredIntelligence(targetUserId);
      addLog(`Existing intelligence found: ${hasIntelligence ? 'Yes' : 'No'}`);
      
      if (hasIntelligence) {
        const result = await hermeticIntelligenceService.getStructuredIntelligence(targetUserId);
        if (result.success && result.intelligence) {
          addLog(`Intelligence record created: ${result.intelligence.created_at}`);
          addLog(`Extraction confidence: ${result.intelligence.extraction_confidence}`);
          addLog(`Extraction version: ${result.intelligence.extraction_version}`);
        }
      }
    } catch (error) {
      addLog(`Error checking intelligence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStatusIcon = () => {
    switch (extractionStatus) {
      case 'running': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Play className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (extractionStatus) {
      case 'running': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Extraction Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="w-5 h-5" />
            <span>Extraction Controls</span>
            <Badge className={getStatusColor()} variant="outline">
              {extractionStatus}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="userId">Target User ID</Label>
              <div className="flex space-x-2">
                <Input
                  id="userId"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  placeholder="Enter user ID"
                  disabled={isExtracting}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTargetUserId(user?.id || '')}
                  disabled={isExtracting}
                >
                  <User className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="forceReprocess"
                  checked={forceReprocess}
                  onCheckedChange={setForceReprocess}
                  disabled={isExtracting}
                />
                <Label htmlFor="forceReprocess">Force Reprocess</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Overwrite existing intelligence data
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={triggerExtraction}
              disabled={isExtracting || !targetUserId}
              className="flex-1"
            >
              {isExtracting ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              {isExtracting ? 'Extracting...' : 'Start Extraction'}
            </Button>
            
            <Button
              variant="outline"
              onClick={checkExistingIntelligence}
              disabled={isExtracting || !targetUserId}
            >
              Check Existing
            </Button>
          </div>

          {isExtracting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Processing...</span>
                {getStatusIcon()}
              </div>
              <Progress value={undefined} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extraction Results */}
      {extractionResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Extraction Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{extractionResult.processedReports || 0}</p>
                <p className="text-sm text-muted-foreground">Reports Processed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{extractionResult.totalIntelligence || 0}</p>
                <p className="text-sm text-muted-foreground">Intelligence Records</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{extractionResult.errors?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Errors</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">12</p>
                <p className="text-sm text-muted-foreground">Dimensions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extraction Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>Extraction Logs</span>
            {logs.length > 0 && (
              <Badge variant="outline">{logs.length} entries</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-4 max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-muted-foreground text-sm">No logs yet. Start an extraction to see activity.</p>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-xs font-mono text-muted-foreground">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};