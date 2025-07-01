
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Bell, Clock, Zap, Save } from 'lucide-react';
import { pieService } from '@/services/pie-service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PIEPreferencesData {
  insightFrequency: 'low' | 'medium' | 'high';
  notificationEnabled: boolean;
  contextualDelivery: boolean;
  confidenceThreshold: number;
  insightTypes: string[];
  quietHours: { start: string; end: string };
  personalizedStyle: 'minimal' | 'balanced' | 'detailed';
}

export const PIEPreferencesPanel: React.FC = () => {
  const [preferences, setPreferences] = useState<PIEPreferencesData>({
    insightFrequency: 'medium',
    notificationEnabled: true,
    contextualDelivery: true,
    confidenceThreshold: 70,
    insightTypes: ['opportunity', 'warning', 'preparation'],
    quietHours: { start: '22:00', end: '08:00' },
    personalizedStyle: 'balanced'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user?.id) return;

    try {
      // In a real implementation, this would load from the service
      // For now, we'll use default preferences
      setLoading(false);
    } catch (error) {
      console.error('Error loading PIE preferences:', error);
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      // Here we would save to the PIE service
      console.log('🔮 Saving PIE preferences:', preferences);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('PIE preferences saved successfully!');
    } catch (error) {
      console.error('Error saving PIE preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const toggleInsightType = (type: string) => {
    setPreferences(prev => ({
      ...prev,
      insightTypes: prev.insightTypes.includes(type)
        ? prev.insightTypes.filter(t => t !== type)
        : [...prev.insightTypes, type]
    }));
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 animate-pulse" />
          <span>Loading preferences...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold">PIE Preferences</h2>
        </div>
        <Button onClick={savePreferences} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Insight Frequency */}
        <div className="space-y-3">
          <div>
            <h3 className="font-medium flex items-center space-x-2">
              <Zap className="w-5 h-5 text-blue-500" />
              <span>Insight Frequency</span>
            </h3>
            <p className="text-sm text-gray-600">How often you want to receive insights</p>
          </div>
          <Select
            value={preferences.insightFrequency}
            onValueChange={(value: 'low' | 'medium' | 'high') => 
              setPreferences(prev => ({ ...prev, insightFrequency: value }))
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low (1-2 per day)</SelectItem>
              <SelectItem value="medium">Medium (3-5 per day)</SelectItem>
              <SelectItem value="high">High (5+ per day)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-green-500" />
            <div>
              <h3 className="font-medium">Push Notifications</h3>
              <p className="text-sm text-gray-600">Get notified about important insights</p>
            </div>
          </div>
          <Switch
            checked={preferences.notificationEnabled}
            onCheckedChange={(checked) => 
              setPreferences(prev => ({ ...prev, notificationEnabled: checked }))
            }
          />
        </div>

        {/* Contextual Delivery */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Smart Contextual Delivery</h3>
            <p className="text-sm text-gray-600">Show insights based on your current activity</p>
          </div>
          <Switch
            checked={preferences.contextualDelivery}
            onCheckedChange={(checked) => 
              setPreferences(prev => ({ ...prev, contextualDelivery: checked }))
            }
          />
        </div>

        {/* Confidence Threshold */}
        <div className="space-y-3">
          <div>
            <h3 className="font-medium">Confidence Threshold</h3>
            <p className="text-sm text-gray-600">Minimum confidence level for insights</p>
          </div>
          <div className="space-y-2">
            <Slider
              value={[preferences.confidenceThreshold]}
              onValueChange={([value]) => 
                setPreferences(prev => ({ ...prev, confidenceThreshold: value }))
              }
              max={100}
              min={50}
              step={5}
              className="w-full"
            />
            <div className="text-sm text-gray-500">
              Current: {preferences.confidenceThreshold}%
            </div>
          </div>
        </div>

        {/* Insight Types */}
        <div className="space-y-3">
          <div>
            <h3 className="font-medium">Preferred Insight Types</h3>
            <p className="text-sm text-gray-600">Choose which types of insights you want to receive</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['opportunity', 'warning', 'preparation', 'awareness', 'pattern'].map((type) => (
              <Badge
                key={type}
                variant={preferences.insightTypes.includes(type) ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => toggleInsightType(type)}
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>

        {/* Communication Style */}
        <div className="space-y-3">
          <div>
            <h3 className="font-medium">Communication Style</h3>
            <p className="text-sm text-gray-600">How detailed should insights be</p>
          </div>
          <Select
            value={preferences.personalizedStyle}
            onValueChange={(value: 'minimal' | 'balanced' | 'detailed') => 
              setPreferences(prev => ({ ...prev, personalizedStyle: value }))
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minimal">Minimal</SelectItem>
              <SelectItem value="balanced">Balanced</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quiet Hours */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-orange-500" />
            <div>
              <h3 className="font-medium">Quiet Hours</h3>
              <p className="text-sm text-gray-600">No notifications during these hours</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>{preferences.quietHours.start} - {preferences.quietHours.end}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
