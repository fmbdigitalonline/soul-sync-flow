
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Brain, Target, TrendingUp, MessageSquare, Activity, Zap, Heart, Wifi, WifiOff } from 'lucide-react';
import { useUser360 } from '@/hooks/use-user-360';
import { DataAvailability } from '@/services/user-360-service';
import { useLanguage } from '@/contexts/LanguageContext';
import { safeInterpolateTranslation } from '@/utils/translation-utils';

interface DataAvailabilityIndicatorProps {
  availability: DataAvailability;
  completenessScore: number;
}

const DataAvailabilityIndicator: React.FC<DataAvailabilityIndicatorProps> = ({
  availability,
  completenessScore
}) => {
  const { t } = useLanguage();
  const sections = [
    { key: 'blueprint', label: 'Soul Blueprint', icon: Heart, color: 'bg-purple-500' },
    { key: 'intelligence', label: t('system.soulIntelligence'), icon: Brain, color: 'bg-blue-500' },
    { key: 'memory', label: 'Memory Graph', icon: Zap, color: 'bg-yellow-500' },
    { key: 'patterns', label: 'Behavioral Patterns', icon: TrendingUp, color: 'bg-green-500' },
    { key: 'growth', label: 'Growth Journey', icon: Target, color: 'bg-indigo-500' },
    { key: 'activities', label: 'Activities', icon: Activity, color: 'bg-orange-500' },
    { key: 'goals', label: 'Goals', icon: Target, color: 'bg-red-500' },
    { key: 'conversations', label: 'Conversations', icon: MessageSquare, color: 'bg-cyan-500' }
  ] as const;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-cormorant text-xl flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {t('user360.availability.title')}
        </CardTitle>
        <CardDescription className="font-inter">
          {t('user360.availability.desc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-cormorant text-lg">{t('user360.availability.overall')}</span>
          <Badge variant={completenessScore > 70 ? 'default' : completenessScore > 40 ? 'secondary' : 'outline'}>
            {completenessScore}%
          </Badge>
        </div>
        <Progress value={completenessScore} className="w-full" />
        
        <Separator />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sections.map(({ key, label, icon: Icon, color }) => {
            const sectionData = availability[key];
            const isAvailable = sectionData?.available || false;
            
            return (
              <div
                key={key}
                className={`p-3 rounded-lg border transition-colors ${
                  isAvailable 
                    ? 'bg-background border-primary/20' 
                    : 'bg-muted/50 border-muted'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1 rounded ${isAvailable ? color : 'bg-muted'}`}>
                    <Icon className={`h-3 w-3 ${isAvailable ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <span className="font-inter text-sm font-medium">{label}</span>
                </div>
                
                <div className="space-y-1">
                  <Badge 
                    variant={isAvailable ? 'default' : 'outline'} 
                    className="text-xs"
                  >
                    {isAvailable ? t('user360.availability.available') : t('user360.availability.noData')}
                  </Badge>
                  
                  {/* Show specific metrics when available */}
                  {isAvailable && key === 'blueprint' && sectionData && 'completionPercentage' in sectionData && sectionData.completionPercentage && (
                    <p className="text-xs text-muted-foreground font-inter">
                      {sectionData.completionPercentage}% complete
                    </p>
                  )}
                  {isAvailable && key === 'intelligence' && sectionData && 'totalScore' in sectionData && sectionData.totalScore && (
                    <p className="text-xs text-muted-foreground font-inter">
                      Level {Math.round(sectionData.totalScore)}
                    </p>
                  )}
                  {isAvailable && key === 'memory' && sectionData && 'nodeCount' in sectionData && 'edgeCount' in sectionData && (
                    <p className="text-xs text-muted-foreground font-inter">
                      {sectionData.nodeCount} nodes, {sectionData.edgeCount} edges
                    </p>
                  )}
                  {isAvailable && key === 'patterns' && sectionData && 'patternCount' in sectionData && (
                    <p className="text-xs text-muted-foreground font-inter">
                      {sectionData.patternCount} patterns
                      {'confidence' in sectionData && sectionData.confidence && ` (${Math.round(sectionData.confidence * 100)}%)`}
                    </p>
                  )}
                  {isAvailable && key === 'growth' && sectionData && 'entriesCount' in sectionData && (
                    <p className="text-xs text-muted-foreground font-inter">
                      {sectionData.entriesCount} entries
                    </p>
                  )}
                  {isAvailable && key === 'activities' && sectionData && 'totalActivities' in sectionData && 'totalPoints' in sectionData && (
                    <p className="text-xs text-muted-foreground font-inter">
                      {sectionData.totalActivities} activities, {sectionData.totalPoints} points
                    </p>
                  )}
                  {isAvailable && key === 'goals' && sectionData && 'activeGoals' in sectionData && 'completedGoals' in sectionData && (
                    <p className="text-xs text-muted-foreground font-inter">
                      {sectionData.activeGoals} active, {sectionData.completedGoals} completed
                    </p>
                  )}
                  {isAvailable && key === 'conversations' && sectionData && 'totalConversations' in sectionData && (
                    <p className="text-xs text-muted-foreground font-inter">
                      {sectionData.totalConversations} conversations
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const User360Dashboard: React.FC = () => {
  const { 
    profile, 
    loading, 
    error, 
    lastRefresh, 
    completenessScore, 
    refreshProfile,
    forceRefreshWithSync,
    dataAvailability,
    dataSources,
    hasProfile,
    syncActive,
    lastSyncTime
  } = useUser360();

  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="font-cormorant text-xl mb-2">{t('user360.loadingTitle')}</h2>
            <p className="font-inter text-sm text-muted-foreground">
              {t('user360.loadingDesc')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="font-cormorant text-xl text-destructive">
              {t('user360.errorTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-inter text-sm text-muted-foreground">
              {t('user360.errorLead')}
            </p>
            <p className="font-inter text-sm bg-destructive/10 p-3 rounded border">
              {error}
            </p>
            <div className="flex gap-2">
              <Button onClick={refreshProfile} className="flex-1 font-cormorant">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('user360.tryAgain')}
              </Button>
              <Button onClick={forceRefreshWithSync} variant="outline" className="flex-1 font-cormorant">
                <Wifi className="h-4 w-4 mr-2" />
                {t('user360.forceSync')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="font-cormorant text-xl">
              {t('user360.noProfileTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-inter text-sm text-muted-foreground">
              {t('user360.noProfileLead')}
            </p>
            <ul className="font-inter text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>{t('user360.bulletNewUser')}</li>
              <li>{t('user360.bulletNoData')}</li>
              <li>{t('user360.bulletBlueprintProgress')}</li>
            </ul>
            <div className="flex gap-2">
              <Button onClick={refreshProfile} className="flex-1 font-cormorant">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('user360.checkAgain')}
              </Button>
              <Button onClick={forceRefreshWithSync} variant="outline" className="flex-1 font-cormorant">
                <Wifi className="h-4 w-4 mr-2" />
                {t('user360.forceSync')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-cormorant text-3xl lg:text-4xl font-bold">
              {t('nav.profile360')}
            </h1>
            <p className="font-inter text-muted-foreground mt-1">
              {t('user360.subtitle')}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Sync Status Indicator */}
            <div className="flex items-center gap-2">
              {syncActive ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Wifi className="h-4 w-4" />
                  <span className="font-inter text-xs">{t('user360.sync.live')}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <WifiOff className="h-4 w-4" />
                  <span className="font-inter text-xs">{t('user360.sync.offline')}</span>
                </div>
              )}
            </div>
            
            {lastRefresh && (
              <p className="font-inter text-xs text-muted-foreground">
                {safeInterpolateTranslation(t('user360.updatedAt'), { time: lastRefresh.toLocaleTimeString() })}
              </p>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={refreshProfile} 
                variant="outline" 
                size="sm"
                className="font-cormorant"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('user360.refresh')}
              </Button>
              
              <Button 
                onClick={forceRefreshWithSync} 
                variant="default" 
                size="sm"
                className="font-cormorant"
              >
                <Wifi className="h-4 w-4 mr-2" />
                {t('user360.forceSync')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Data Availability Overview */}
        {dataAvailability && (
          <DataAvailabilityIndicator 
            availability={dataAvailability}
            completenessScore={completenessScore}
          />
        )}

        {/* Profile Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Data Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="font-cormorant text-lg">{t('user360.cards.sources.title')}</CardTitle>
              <CardDescription className="font-inter">
                {t('user360.cards.sources.desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dataSources.length > 0 ? (
                  dataSources.map(source => (
                    <Badge key={source} variant="secondary" className="font-inter text-xs">
                      {source.replace('_', ' ')}
                    </Badge>
                  ))
                ) : (
                  <p className="font-inter text-sm text-muted-foreground">
                    {t('user360.cards.sources.none')}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Version */}
          <Card>
            <CardHeader>
              <CardTitle className="font-cormorant text-lg">{t('user360.cards.version.title')}</CardTitle>
              <CardDescription className="font-inter">
                {t('user360.cards.version.desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="font-cormorant text-2xl font-bold">
                  v{profile?.version || 1}
                </span>
                <Badge variant="outline" className="font-inter">
                  {profile?.lastUpdated ? 
                    new Date(profile.lastUpdated).toLocaleDateString() : 
                    t('user360.cards.version.never')
                  }
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Completeness Score */}
          <Card>
            <CardHeader>
              <CardTitle className="font-cormorant text-lg">{t('user360.cards.completeness.title')}</CardTitle>
              <CardDescription className="font-inter">
                {t('user360.cards.completeness.desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-cormorant text-2xl font-bold">
                    {completenessScore}%
                  </span>
                  <Badge 
                    variant={completenessScore > 70 ? 'default' : completenessScore > 40 ? 'secondary' : 'outline'}
                    className="font-inter"
                  >
                    {completenessScore > 70 ? t('user360.cards.completeness.complete') : completenessScore > 40 ? t('user360.cards.completeness.partial') : t('user360.cards.completeness.incomplete')}
                  </Badge>
                </div>
                <Progress value={completenessScore} className="w-full" />
              </div>
            </CardContent>
          </Card>

          {/* Sync Status */}
          <Card>
            <CardHeader>
              <CardTitle className="font-cormorant text-lg">{t('user360.cards.sync.title')}</CardTitle>
              <CardDescription className="font-inter">
                {t('user360.cards.sync.desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {syncActive ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <Wifi className="h-5 w-5" />
                      <span className="font-cormorant text-lg font-bold">{t('user360.cards.sync.active')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <WifiOff className="h-5 w-5" />
                      <span className="font-cormorant text-lg font-bold">{t('user360.cards.sync.offline')}</span>
                    </div>
                  )}
                </div>
                {lastSyncTime && (
                  <p className="font-inter text-xs text-muted-foreground">
                    {lastSyncTime && safeInterpolateTranslation(t('user360.cards.sync.last'), { time: lastSyncTime.toLocaleTimeString() })}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Profile Data - Only show when data is actually available */}
        {profile?.profileData && (
          <Card>
            <CardHeader>
              <CardTitle className="font-cormorant text-xl">{t('user360.cards.summary.title')}</CardTitle>
              <CardDescription className="font-inter">
                {t('user360.cards.summary.desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(profile.profileData).map(([key, value]) => {
                  if (!value) return null;
                  
                  return (
                    <div key={key} className="border rounded-lg p-4">
                      <h3 className="font-cormorant text-lg font-semibold mb-2 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <div className="bg-muted/50 p-3 rounded font-mono text-xs overflow-auto max-h-48">
                        <pre>{JSON.stringify(value, null, 2)}</pre>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default User360Dashboard;
