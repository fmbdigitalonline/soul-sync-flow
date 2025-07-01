
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Brain, Settings, Shield, Clock } from 'lucide-react';
import { pieService } from '@/services/pie-service';
import { PIEConfiguration } from '@/types/pie-types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const PIESettingsPanel: React.FC = () => {
  const [config, setConfig] = useState<PIEConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadConfiguration();
  }, [user]);

  const loadConfiguration = async () => {
    if (!user?.id) return;

    try {
      await pieService.initialize(user.id);
      // The configuration would be loaded during initialization
      // For now, we'll create a default config display
      const defaultConfig: PIEConfiguration = {
        userId: user.id,
        enabled: true,
        minimumConfidence: 0.7,
        patternSensitivity: 'moderate',
        deliveryMethods: ['conversation'],
        deliveryTiming: 'immediate',
        quietHours: { start: '22:00', end: '08:00' },
        includeAstrology: true,
        includeStatistics: false,
        communicationStyle: 'balanced',
        dataTypes: ['mood', 'productivity', 'sentiment'],
        retentionPeriod: 90
      };
      
      setConfig(defaultConfig);
    } catch (error) {
      console.error('Error loading PIE configuration:', error);
      toast.error('Failed to load PIE settings');
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguration = async (updates: Partial<PIEConfiguration>) => {
    if (!config || !user?.id) return;

    try {
      const newConfig = { ...config, ...updates };
      await pieService.updateConfiguration(updates);
      setConfig(newConfig);
      toast.success('PIE settings updated');
    } catch (error) {
      console.error('Error updating PIE configuration:', error);
      toast.error('Failed to update PIE settings');
    }
  };

  if (loading || !config) {
    return (
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 animate-pulse" />
          <span>Loading PIE settings...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Brain className="w-6 h-6 text-purple-600" />
        <h2 className="text-xl font-semibold">PIE Settings</h2>
        <Badge variant={config.enabled ? "default" : "secondary"}>
          {config.enabled ? "Active" : "Disabled"}
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Enable/Disable PIE */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Enable PIE System</h3>
            <p className="text-sm text-gray-600">Turn on AI-powered proactive insights</p>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(checked) => updateConfiguration({ enabled: checked })}
          />
        </div>

        {/* Confidence Threshold */}
        <div className="space-y-3">
          <div>
            <h3 className="font-medium">Insight Confidence Threshold</h3>
            <p className="text-sm text-gray-600">Minimum confidence required for insights</p>
          </div>
          <div className="space-y-2">
            <Slider
              value={[config.minimumConfidence * 100]}
              onValueChange={([value]) => updateConfiguration({ minimumConfidence: value / 100 })}
              max={100}
              min={50}
              step={5}
              className="w-full"
            />
            <div className="text-sm text-gray-500">
              Current: {Math.round(config.minimumConfidence * 100)}%
            </div>
          </div>
        </div>

        {/* Pattern Sensitivity */}
        <div className="space-y-3">
          <div>
            <h3 className="font-medium">Pattern Detection Sensitivity</h3>
            <p className="text-sm text-gray-600">How sensitive pattern detection should be</p>
          </div>
          <div className="flex space-x-2">
            {(['low', 'moderate', 'high'] as const).map((level) => (
              <Button
                key={level}
                variant={config.patternSensitivity === level ? "default" : "outline"}
                size="sm"
                onClick={() => updateConfiguration({ patternSensitivity: level })}
                className="capitalize"
              >
                {level}
              </Button>
            ))}
          </div>
        </div>

        {/* Data Types */}
        <div className="space-y-3">
          <div>
            <h3 className="font-medium">Tracked Data Types</h3>
            <p className="text-sm text-gray-600">Types of data to analyze for patterns</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['mood', 'productivity', 'sentiment', 'activity', 'sleep'].map((dataType) => (
              <Badge
                key={dataType}
                variant={config.dataTypes.includes(dataType) ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => {
                  const newDataTypes = config.dataTypes.includes(dataType)
                    ? config.dataTypes.filter(t => t !== dataType)
                    : [...config.dataTypes, dataType];
                  updateConfiguration({ dataTypes: newDataTypes });
                }}
              >
                {dataType}
              </Badge>
            ))}
          </div>
        </div>

        {/* Privacy & Data */}
        <div className="pt-4 border-t">
          <div className="flex items-center space-x-2 mb-3">
            <Shield className="w-5 h-5 text-green-600" />
            <h3 className="font-medium">Privacy & Data Control</h3>
          </div>
          
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Include astrological correlations</span>
              <Switch
                checked={config.includeAstrology}
                onCheckedChange={(checked) => updateConfiguration({ includeAstrology: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span>Data retention period</span>
              <span className="font-medium">{config.retentionPeriod} days</span>
            </div>

            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Quiet hours: {config.quietHours.start} - {config.quietHours.end}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
