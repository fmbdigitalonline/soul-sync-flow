
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Key, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { isAdminUser } from '@/utils/isAdminUser';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export const OpenAIKeyConfiguration: React.FC = () => {
  const [keyConfigured, setKeyConfigured] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    checkKeyStatus();
  }, []);

  const checkKeyStatus = async () => {
    try {
      // Check if key is configured by making a test call
      const response = await fetch('/api/test-openai-key', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      setKeyConfigured(response.ok);
    } catch (error) {
      setKeyConfigured(false);
    }
  };

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      const response = await fetch('/api/test-openai-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: t('toast.success.connectionSuccessful'),
          description: "OpenAI API is working correctly",
        });
        setKeyConfigured(true);
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      toast({
        title: t('toast.error.connectionFailed'),
        description: "Please check your OpenAI API key configuration",
        variant: "destructive",
      });
    } finally {
      setTestingConnection(false);
    }
  };

  if (!user || !isAdminUser(user)) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          OpenAI API Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>API Key Status:</span>
          <Badge variant={keyConfigured ? "default" : "destructive"}>
            {keyConfigured ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Configured
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3 mr-1" />
                Not Configured
              </>
            )}
          </Badge>
        </div>

        {!keyConfigured && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              To enable the agent-driven growth system, please configure your OpenAI API key in Supabase Edge Function Secrets.
            </p>
            <p className="text-sm font-medium">
              Secret name: <code>OPENAI_API_KEY</code>
            </p>
          </div>
        )}

        <Button 
          onClick={testConnection} 
          disabled={testingConnection}
          variant={keyConfigured ? "outline" : "default"}
        >
          {testingConnection ? "Testing..." : "Test Connection"}
        </Button>

        {keyConfigured && (
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">
              ✅ Agent-driven growth system is ready to use
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
