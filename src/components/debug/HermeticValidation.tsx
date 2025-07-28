import React, { useState, useEffect } from 'react';
import { useHACSConversationAdapter } from '@/hooks/use-hacs-conversation-adapter';
import { hermeticConversationContextService } from '@/services/hermetic-conversation-context';
import { supabase } from '@/integrations/supabase/client';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ValidationResult {
  step: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  data?: any;
}

export const HermeticValidation: React.FC = () => {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { hermeticDepth } = useHACSConversationAdapter("guide", "validation");

  const addResult = (result: ValidationResult) => {
    setValidationResults(prev => [...prev, { ...result, timestamp: Date.now() }]);
  };

  const validateHermeticIntegration = async () => {
    setIsRunning(true);
    setValidationResults([]);

    try {
      // Step 1: Check user authentication
      addResult({ step: "Authentication", status: "pending", message: "Checking user authentication..." });
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        addResult({ step: "Authentication", status: "error", message: "User not authenticated" });
        return;
      }
      addResult({ step: "Authentication", status: "success", message: `Authenticated as user: ${authData.session.user.id}` });

      // Step 2: Check Hermetic Context Service
      addResult({ step: "Hermetic Context", status: "pending", message: "Building Hermetic conversation context..." });
      const hermeticContext = await hermeticConversationContextService.buildConversationContext(authData.session.user.id);
      addResult({ 
        step: "Hermetic Context", 
        status: "success", 
        message: `Context built with depth: ${hermeticContext.depth}`, 
        data: hermeticContext 
      });

      // Step 3: Check UI Integration
      addResult({ step: "UI Integration", status: "pending", message: "Checking UI hermetic depth display..." });
      addResult({ 
        step: "UI Integration", 
        status: hermeticDepth ? "success" : "warning", 
        message: `Current UI depth: ${hermeticDepth || "not available"}` 
      });

      // Step 4: Validate Blueprint Data
      addResult({ step: "Blueprint Data", status: "pending", message: "Checking user blueprint availability..." });
      const { data: blueprintData, error: blueprintError } = await supabase
        .from('user_blueprints')
        .select('*')
        .eq('user_id', authData.session.user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (blueprintError) {
        addResult({ step: "Blueprint Data", status: "error", message: `Blueprint query error: ${blueprintError.message}` });
      } else if (blueprintData && blueprintData.length > 0) {
        addResult({ 
          step: "Blueprint Data", 
          status: "success", 
          message: `Blueprint found: ${blueprintData[0].id}`,
          data: { blueprintId: blueprintData[0].id, createdAt: blueprintData[0].created_at }
        });
      } else {
        addResult({ step: "Blueprint Data", status: "warning", message: "No blueprint found - this will limit Hermetic depth" });
      }

      // Step 5: Check 360 Profile Data
      addResult({ step: "360 Profile", status: "pending", message: "Checking user 360 profile..." });
      const { data: profileData, error: profileError } = await supabase
        .from('user_360_profiles')
        .select('*')
        .eq('user_id', authData.session.user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (profileError) {
        addResult({ step: "360 Profile", status: "error", message: `Profile query error: ${profileError.message}` });
      } else if (profileData && profileData.length > 0) {
        addResult({ 
          step: "360 Profile", 
          status: "success", 
          message: `360 Profile found: ${profileData[0].id}` 
        });
      } else {
        addResult({ step: "360 Profile", status: "warning", message: "No 360 profile found" });
      }

      // Step 6: Test Edge Function Access
      addResult({ step: "Edge Function", status: "pending", message: "Testing edge function connectivity..." });
      try {
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke('hacs-intelligent-conversation', {
          body: { 
            message: "Test Hermetic validation", 
            conversationHistory: [], 
            userId: authData.session.user.id,
            pageContext: "validation"
          }
        });

        if (edgeError) {
          addResult({ step: "Edge Function", status: "error", message: `Edge function error: ${edgeError.message}` });
        } else {
          addResult({ 
            step: "Edge Function", 
            status: "success", 
            message: "Edge function responding correctly",
            data: { responseType: typeof edgeData, hasContent: !!edgeData }
          });
        }
      } catch (error) {
        addResult({ 
          step: "Edge Function", 
          status: "error", 
          message: `Edge function connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
        });
      }

    } catch (error) {
      addResult({ 
        step: "Validation Error", 
        status: "error", 
        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'pending': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: ValidationResult['status']) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <CosmicCard className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Hermetic Integration Validation</h3>
        <Button 
          onClick={validateHermeticIntegration} 
          disabled={isRunning}
          size="sm"
        >
          {isRunning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          {isRunning ? 'Validating...' : 'Run Validation'}
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Current Hermetic Depth:</span>
          <Badge variant="outline">{hermeticDepth || "Unknown"}</Badge>
        </div>
      </div>

      {validationResults.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Validation Results:</h4>
          {validationResults.map((result, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              {getStatusIcon(result.status)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{result.step}</span>
                  <Badge className={getStatusColor(result.status)} variant="secondary">
                    {result.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{result.message}</p>
                {result.data && (
                  <details className="mt-2">
                    <summary className="text-xs text-muted-foreground cursor-pointer">View Data</summary>
                    <pre className="text-xs mt-1 p-2 bg-background rounded overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isRunning && validationResults.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Click "Run Validation" to test the Hermetic integration end-to-end</p>
        </div>
      )}
    </CosmicCard>
  );
};