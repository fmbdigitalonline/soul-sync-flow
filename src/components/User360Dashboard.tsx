
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Brain, Target, TrendingUp, MessageSquare, Activity, Zap, Heart } from 'lucide-react';
import { useUser360 } from '@/hooks/use-user-360';
import { DataAvailability } from '@/services/user-360-service';

interface DataAvailabilityIndicatorProps {
  availability: DataAvailability;
  completenessScore: number;
}

const DataAvailabilityIndicator: React.FC<DataAvailabilityIndicatorProps> = ({
  availability,
  completenessScore
}) => {
  const sections = [
    { key: 'blueprint', label: 'Soul Blueprint', icon: Heart, color: 'bg-purple-500' },
    { key: 'intelligence', label: 'HACS Intelligence', icon: Brain, color: 'bg-blue-500' },
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
          Data Availability
        </CardTitle>
        <CardDescription className="font-inter">
          Real-time status of your soul data across all systems
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-cormorant text-lg">Overall Completeness</span>
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
                    {isAvailable ? 'Available' : 'No Data'}
                  </Badge>
                  
                  {/* Show specific metrics when available */}
                  {isAvailable && key === 'blueprint' && sectionData.completionPercentage && (
                    <p className="text-xs text-muted-foreground font-inter">
                      {sectionData.completionPercentage}% complete
                    </p>
                  )}
                  {isAvailable && key === 'intelligence' && sectionData.totalScore && (
                    <p className="text-xs text-muted-foreground font-inter">
                      Level {Math.round(sectionData.totalScore)}
                    </p>
                  )}
                  {isAvailable && key === 'memory' && (
                    <p className="text-xs text-muted-foreground font-inter">
                      {sectionData.nodeCount} nodes, {sectionData.edgeCount} edges
                    </p>
                  )}
                  {isAvailable && key === 'patterns' && (
                    <p className="text-xs text-muted-foreground font-inter">
                      {sectionData.patternCount} patterns
                      {sectionData.confidence && ` (${Math.round(sectionData.confidence * 100)}%)`}
                    </p>
                  )}
                  {isAvailable && key === 'growth' && (
                    <p className="text-xs text-muted-foreground font-inter">
                      {sectionData.entriesCount} entries
                    </p>
                  )}
                  {isAvailable && key === 'activities' && (
                    <p className="text-xs text-muted-foreground font-inter">
                      {sectionData.totalActivities} activities, {sectionData.totalPoints} points
                    </p>
                  )}
                  {isAvailable && key === 'goals' && (
                    <p className="text-xs text-muted-foreground font-inter">
                      {sectionData.activeGoals} active, {sectionData.completedGoals} completed
                    </p>
                  )}
                  {isAvailable && key === 'conversations' && (
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
    dataAvailability,
    dataSources,
    hasProfile 
  } = useUser360();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="font-cormorant text-xl mb-2">Loading Your Soul Profile</h2>
            <p className="font-inter text-sm text-muted-foreground">
              Aggregating data from all systems...
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
              Profile Loading Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-inter text-sm text-muted-foreground">
              Unable to load your 360° profile:
            </p>
            <p className="font-inter text-sm bg-destructive/10 p-3 rounded border">
              {error}
            </p>
            <Button onClick={refreshProfile} className="w-full font-cormorant">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
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
              No Profile Data Available
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-inter text-sm text-muted-foreground">
              Your 360° soul profile hasn't been generated yet. This usually happens when:
            </p>
            <ul className="font-inter text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>You're a new user</li>
              <li>No data has been collected yet</li>
              <li>Blueprint creation is still in progress</li>
            </ul>
            <Button onClick={refreshProfile} className="w-full font-cormorant">
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Again
            </Button>
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
              360° Soul Profile
            </h1>
            <p className="font-inter text-muted-foreground mt-1">
              Unified view of your complete soul data ecosystem
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {lastRefresh && (
              <p className="font-inter text-xs text-muted-foreground">
                Updated {lastRefresh.toLocaleTimeString()}
              </p>
            )}
            <Button 
              onClick={refreshProfile} 
              variant="outline" 
              size="sm"
              className="font-cormorant"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Data Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="font-cormorant text-lg">Active Data Sources</CardTitle>
              <CardDescription className="font-inter">
                Systems contributing to your profile
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
                    No active data sources
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Version */}
          <Card>
            <CardHeader>
              <CardTitle className="font-cormorant text-lg">Profile Version</CardTitle>
              <CardDescription className="font-inter">
                Current profile iteration
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
                    'Never updated'
                  }
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Completeness Score */}
          <Card>
            <CardHeader>
              <CardTitle className="font-cormorant text-lg">Data Completeness</CardTitle>
              <CardDescription className="font-inter">
                Overall profile completeness
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
                    {completenessScore > 70 ? 'Complete' : completenessScore > 40 ? 'Partial' : 'Incomplete'}
                  </Badge>
                </div>
                <Progress value={completenessScore} className="w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Profile Data - Only show when data is actually available */}
        {profile?.profileData && (
          <Card>
            <CardHeader>
              <CardTitle className="font-cormorant text-xl">Profile Data Summary</CardTitle>
              <CardDescription className="font-inter">
                Raw data aggregated from all systems (for debugging and transparency)
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
                      <div className="bg-muted/50 p-3 rounded font-mono text-xs overflow-auto">
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
