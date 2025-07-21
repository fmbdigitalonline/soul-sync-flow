
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  TestTube, 
  Shield,
  Zap,
  Database,
  Brain,
  AlertTriangle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const AdminConfigurationHub: React.FC = () => {
  const [configs, setConfigs] = useState({
    pie: {
      enabled: true,
      confidenceThreshold: 0.7,
      deliveryMethods: ['conversation', 'notification'],
      patternSensitivity: 'moderate',
      retentionDays: 90
    },
    vfpGraph: {
      enabled: true,
      vectorDimensions: 128,
      coherenceThreshold: 0.8,
      encoderVersion: '1.0.0',
      adaptiveWeights: true
    },
    tmg: {
      enabled: true,
      hotMemoryLimit: 1000,
      warmMemoryLimit: 5000,
      compressionRatio: 4.2,
      cleanupInterval: 24
    },
    acs: {
      enabled: true,
      frustrationThreshold: 0.3,
      clarificationThreshold: 0.4,
      maxSilentTime: 180,
      personalityScaling: true
    },
    global: {
      maintenanceMode: false,
      debugLogging: true,
      rateLimiting: true,
      analyticsEnabled: true
    }
  });

  const [abTests, setAbTests] = useState([
    { id: 1, name: 'PIE Delivery Timing', status: 'active', traffic: 50, variant: 'immediate_vs_delayed' },
    { id: 2, name: 'VFP Vector Dimensions', status: 'draft', traffic: 0, variant: '96d_vs_128d' },
    { id: 3, name: 'ACS Threshold Sensitivity', status: 'completed', traffic: 100, variant: 'low_vs_high' }
  ]);

  const handleConfigChange = (section: string, key: string, value: any) => {
    setConfigs(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const handleSaveConfig = (section: string) => {
    console.log(`Saving ${section} configuration:`, configs[section as keyof typeof configs]);
  };

  const handleResetConfig = (section: string) => {
    console.log(`Resetting ${section} configuration to defaults`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success';
      case 'draft': return 'bg-warning/10 text-warning';
      case 'completed': return 'bg-secondary/10 text-secondary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 font-cormorant text-foreground">
            <Settings className="w-6 h-6 text-muted-foreground" />
            Configuration Management Hub
          </h2>
          <p className="text-muted-foreground mt-1 font-inter">Centralized configuration for all platform innovations and features</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-secondary font-inter">
            Live Configuration
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="pie" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="pie" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            PIE
          </TabsTrigger>
          <TabsTrigger value="vfp" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            VFP-Graph
          </TabsTrigger>
          <TabsTrigger value="tmg" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            TMG
          </TabsTrigger>
          <TabsTrigger value="acs" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            ACS
          </TabsTrigger>
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Global
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            A/B Tests
          </TabsTrigger>
        </TabsList>

        {/* PIE Configuration */}
        <TabsContent value="pie">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-cormorant">
                <Brain className="w-5 h-5 text-primary" />
                PIE (Proactive Insight Engine) Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pie-enabled">Enable PIE System</Label>
                    <Switch
                      id="pie-enabled"
                      checked={configs.pie.enabled}
                      onCheckedChange={(value) => handleConfigChange('pie', 'enabled', value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Confidence Threshold: {configs.pie.confidenceThreshold}</Label>
                    <Slider
                      value={[configs.pie.confidenceThreshold]}
                      onValueChange={(value) => handleConfigChange('pie', 'confidenceThreshold', value[0])}
                      min={0.1}
                      max={1.0}
                      step={0.1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pie-sensitivity">Pattern Sensitivity</Label>
                    <select
                      id="pie-sensitivity"
                      value={configs.pie.patternSensitivity}
                      onChange={(e) => handleConfigChange('pie', 'patternSensitivity', e.target.value)}
                      className="w-full p-2 border rounded-md bg-background text-foreground font-inter"
                    >
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pie-retention">Data Retention (days)</Label>
                    <Input
                      id="pie-retention"
                      type="number"
                      value={configs.pie.retentionDays}
                      onChange={(e) => handleConfigChange('pie', 'retentionDays', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Delivery Methods</Label>
                    <div className="space-y-2">
                      {['conversation', 'notification', 'email'].map((method) => (
                        <div key={method} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`pie-${method}`}
                            checked={configs.pie.deliveryMethods.includes(method)}
                            onChange={(e) => {
                              const methods = e.target.checked
                                ? [...configs.pie.deliveryMethods, method]
                                : configs.pie.deliveryMethods.filter(m => m !== method);
                              handleConfigChange('pie', 'deliveryMethods', methods);
                            }}
                          />
                          <Label htmlFor={`pie-${method}`} className="capitalize">{method}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleResetConfig('pie')}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={() => handleSaveConfig('pie')}>
                  <Save className="w-4 h-4 mr-2" />
                  Save PIE Config
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* VFP-Graph Configuration */}
        <TabsContent value="vfp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-cormorant">
                <Zap className="w-5 h-5 text-warning" />
                VFP-Graph Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="vfp-enabled">Enable VFP-Graph</Label>
                    <Switch
                      id="vfp-enabled"
                      checked={configs.vfpGraph.enabled}
                      onCheckedChange={(value) => handleConfigChange('vfpGraph', 'enabled', value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vfp-dimensions">Vector Dimensions</Label>
                    <select
                      id="vfp-dimensions"
                      value={configs.vfpGraph.vectorDimensions}
                      onChange={(e) => handleConfigChange('vfpGraph', 'vectorDimensions', parseInt(e.target.value))}
                      className="w-full p-2 border rounded-md bg-background text-foreground font-inter"
                    >
                      <option value={64}>64 Dimensions</option>
                      <option value={96}>96 Dimensions</option>
                      <option value={128}>128 Dimensions</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Coherence Threshold: {configs.vfpGraph.coherenceThreshold}</Label>
                    <Slider
                      value={[configs.vfpGraph.coherenceThreshold]}
                      onValueChange={(value) => handleConfigChange('vfpGraph', 'coherenceThreshold', value[0])}
                      min={0.1}
                      max={1.0}
                      step={0.1}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vfp-version">Encoder Version</Label>
                    <Input
                      id="vfp-version"
                      value={configs.vfpGraph.encoderVersion}
                      onChange={(e) => handleConfigChange('vfpGraph', 'encoderVersion', e.target.value)}
                      readOnly
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="vfp-adaptive">Adaptive Weights</Label>
                    <Switch
                      id="vfp-adaptive"
                      checked={configs.vfpGraph.adaptiveWeights}
                      onCheckedChange={(value) => handleConfigChange('vfpGraph', 'adaptiveWeights', value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleResetConfig('vfpGraph')}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={() => handleSaveConfig('vfpGraph')}>
                  <Save className="w-4 h-4 mr-2" />
                  Save VFP Config
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TMG Configuration */}
        <TabsContent value="tmg">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-cormorant">
                <Database className="w-5 h-5 text-success" />
                TMG (Tiered Memory Graph) Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tmg-enabled">Enable TMG System</Label>
                    <Switch
                      id="tmg-enabled"
                      checked={configs.tmg.enabled}
                      onCheckedChange={(value) => handleConfigChange('tmg', 'enabled', value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tmg-hot">Hot Memory Limit</Label>
                    <Input
                      id="tmg-hot"
                      type="number"
                      value={configs.tmg.hotMemoryLimit}
                      onChange={(e) => handleConfigChange('tmg', 'hotMemoryLimit', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tmg-warm">Warm Memory Limit</Label>
                    <Input
                      id="tmg-warm"
                      type="number"
                      value={configs.tmg.warmMemoryLimit}
                      onChange={(e) => handleConfigChange('tmg', 'warmMemoryLimit', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tmg-compression">Compression Ratio</Label>
                    <Input
                      id="tmg-compression"
                      type="number"
                      step="0.1"
                      value={configs.tmg.compressionRatio}
                      onChange={(e) => handleConfigChange('tmg', 'compressionRatio', parseFloat(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tmg-cleanup">Cleanup Interval (hours)</Label>
                    <Input
                      id="tmg-cleanup"
                      type="number"
                      value={configs.tmg.cleanupInterval}
                      onChange={(e) => handleConfigChange('tmg', 'cleanupInterval', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleResetConfig('tmg')}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={() => handleSaveConfig('tmg')}>
                  <Save className="w-4 h-4 mr-2" />
                  Save TMG Config
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACS Configuration */}
        <TabsContent value="acs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-cormorant">
                <Settings className="w-5 h-5 text-primary" />
                ACS (Adaptive Context Scheduler) Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="acs-enabled">Enable ACS System</Label>
                    <Switch
                      id="acs-enabled"
                      checked={configs.acs.enabled}
                      onCheckedChange={(value) => handleConfigChange('acs', 'enabled', value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Frustration Threshold: {configs.acs.frustrationThreshold}</Label>
                    <Slider
                      value={[configs.acs.frustrationThreshold]}
                      onValueChange={(value) => handleConfigChange('acs', 'frustrationThreshold', value[0])}
                      min={0.1}
                      max={1.0}
                      step={0.1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Clarification Threshold: {configs.acs.clarificationThreshold}</Label>
                    <Slider
                      value={[configs.acs.clarificationThreshold]}
                      onValueChange={(value) => handleConfigChange('acs', 'clarificationThreshold', value[0])}
                      min={0.1}
                      max={1.0}
                      step={0.1}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="acs-silent">Max Silent Time (seconds)</Label>
                    <Input
                      id="acs-silent"
                      type="number"
                      value={configs.acs.maxSilentTime}
                      onChange={(e) => handleConfigChange('acs', 'maxSilentTime', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="acs-personality">Personality Scaling</Label>
                    <Switch
                      id="acs-personality"
                      checked={configs.acs.personalityScaling}
                      onCheckedChange={(value) => handleConfigChange('acs', 'personalityScaling', value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleResetConfig('acs')}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={() => handleSaveConfig('acs')}>
                  <Save className="w-4 h-4 mr-2" />
                  Save ACS Config
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Global Configuration */}
        <TabsContent value="global">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-600" />
                Global System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="global-maintenance">Maintenance Mode</Label>
                    <div className="flex items-center gap-2">
                      {configs.global.maintenanceMode && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                      <Switch
                        id="global-maintenance"
                        checked={configs.global.maintenanceMode}
                        onCheckedChange={(value) => handleConfigChange('global', 'maintenanceMode', value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="global-debug">Debug Logging</Label>
                    <Switch
                      id="global-debug"
                      checked={configs.global.debugLogging}
                      onCheckedChange={(value) => handleConfigChange('global', 'debugLogging', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="global-rate">Rate Limiting</Label>
                    <Switch
                      id="global-rate"
                      checked={configs.global.rateLimiting}
                      onCheckedChange={(value) => handleConfigChange('global', 'rateLimiting', value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="global-analytics">Analytics Enabled</Label>
                    <Switch
                      id="global-analytics"
                      checked={configs.global.analyticsEnabled}
                      onCheckedChange={(value) => handleConfigChange('global', 'analyticsEnabled', value)}
                    />
                  </div>

                  {configs.global.maintenanceMode && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">Maintenance Mode Active</span>
                      </div>
                      <p className="text-sm text-red-600 mt-1">
                        The platform is currently in maintenance mode. Users will see a maintenance page.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleResetConfig('global')}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={() => handleSaveConfig('global')}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Global Config
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* A/B Testing */}
        <TabsContent value="testing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5 text-blue-600" />
                A/B Testing & Experimentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {abTests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{test.name}</h4>
                        <Badge className={getStatusColor(test.status)}>
                          {test.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Variant: {test.variant} • Traffic: {test.traffic}%
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        View Results
                      </Button>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button>
                  <TestTube className="w-4 h-4 mr-2" />
                  Create New Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
