
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar, ExternalLink, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CalendarIntegration {
  id: string;
  name: string;
  provider: 'google' | 'outlook' | 'apple';
  connected: boolean;
  syncEnabled: boolean;
  lastSync?: Date;
}

export const CalendarSync: React.FC = () => {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([
    {
      id: '1',
      name: 'Google Calendar',
      provider: 'google',
      connected: false,
      syncEnabled: false
    },
    {
      id: '2',
      name: 'Outlook Calendar',
      provider: 'outlook',
      connected: false,
      syncEnabled: false
    },
    {
      id: '3',
      name: 'Apple Calendar',
      provider: 'apple',
      connected: false,
      syncEnabled: false
    }
  ]);
  
  const [isSyncing, setIsSyncing] = useState(false);
  
  const handleConnect = async (integrationId: string) => {
    setIsSyncing(true);
    
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { 
            ...integration, 
            connected: true, 
            lastSync: new Date(),
            syncEnabled: true 
          }
        : integration
    ));
    
    setIsSyncing(false);
    
    toast({
      title: "Calendar Connected",
      description: "Your calendar has been successfully connected and is now syncing.",
    });
  };
  
  const handleDisconnect = async (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { 
            ...integration, 
            connected: false, 
            syncEnabled: false,
            lastSync: undefined 
          }
        : integration
    ));
    
    toast({
      title: "Calendar Disconnected",
      description: "Calendar integration has been removed.",
    });
  };
  
  const handleToggleSync = (integrationId: string, enabled: boolean) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, syncEnabled: enabled }
        : integration
    ));
    
    toast({
      title: enabled ? "Sync Enabled" : "Sync Disabled",
      description: enabled 
        ? "Tasks will now sync to your calendar automatically."
        : "Automatic sync has been disabled.",
    });
  };
  
  const handleManualSync = async () => {
    setIsSyncing(true);
    
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIntegrations(prev => prev.map(integration => 
      integration.connected 
        ? { ...integration, lastSync: new Date() }
        : integration
    ));
    
    setIsSyncing(false);
    
    toast({
      title: "Sync Complete",
      description: "All connected calendars have been synchronized.",
    });
  };
  
  const getProviderIcon = (provider: string) => {
    // In a real app, these would be actual provider icons
    return <Calendar className="h-5 w-5" />;
  };
  
  const connectedCount = integrations.filter(i => i.connected).length;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendar Integration
        </CardTitle>
        <CardDescription>
          Sync your tasks and focus sessions with your calendar apps
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="font-medium">Sync Status</p>
            <p className="text-sm text-muted-foreground">
              {connectedCount} of {integrations.length} calendars connected
            </p>
          </div>
          <div className="flex items-center gap-2">
            {connectedCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleManualSync}
                disabled={isSyncing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            )}
          </div>
        </div>
        
        {/* Integration List */}
        <div className="space-y-4">
          {integrations.map(integration => (
            <div key={integration.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getProviderIcon(integration.provider)}
                  <div>
                    <h4 className="font-medium">{integration.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {integration.connected 
                        ? `Last sync: ${integration.lastSync ? integration.lastSync.toLocaleTimeString() : 'Never'}`
                        : 'Not connected'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {integration.connected ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Disconnected
                    </Badge>
                  )}
                </div>
              </div>
              
              {integration.connected && (
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Auto-sync tasks</span>
                  <Switch
                    checked={integration.syncEnabled}
                    onCheckedChange={(checked) => handleToggleSync(integration.id, checked)}
                  />
                </div>
              )}
              
              <div className="flex gap-2">
                {integration.connected ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDisconnect(integration.id)}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={() => handleConnect(integration.id)}
                    disabled={isSyncing}
                    className="bg-soul-purple hover:bg-soul-purple/90"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Connect
                  </Button>
                )}
                
                {integration.connected && (
                  <Button variant="outline" size="sm">
                    Settings
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Sync Settings */}
        {connectedCount > 0 && (
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-medium">Sync Preferences</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Create calendar events for scheduled tasks</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Block focus time in calendar</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Import existing events as tasks</span>
                <Switch />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
