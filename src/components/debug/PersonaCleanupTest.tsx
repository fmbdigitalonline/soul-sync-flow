
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PersonaCleanupService } from '@/services/persona-cleanup-service';
import { useSoulSync } from '@/hooks/use-soul-sync';
import { useAuth } from '@/contexts/AuthContext';

export const PersonaCleanupTest: React.FC = () => {
  const { user } = useAuth();
  const { isSoulSyncReady, soulSyncError, hasBlueprint, blueprintData } = useSoulSync();
  const [cleanupResult, setCleanupResult] = useState<{ deletedCount: number; success: boolean } | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runCleanup = async () => {
    setIsLoading(true);
    console.log("🧹 Starting persona cleanup...");
    
    try {
      const result = await PersonaCleanupService.cleanupNullSignaturePersonas();
      setCleanupResult(result);
      console.log("✅ Cleanup completed:", result);
    } catch (error) {
      console.error("❌ Cleanup failed:", error);
      setCleanupResult({ deletedCount: 0, success: false });
    } finally {
      setIsLoading(false);
    }
  };

  const getStats = async () => {
    setIsLoading(true);
    try {
      const result = await PersonaCleanupService.getPersonaStats();
      setStats(result);
      console.log("📊 Persona stats:", result);
    } catch (error) {
      console.error("❌ Failed to get stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const forceRegenerate = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const result = await PersonaCleanupService.forceRegenerateUserPersonas(user.id);
      console.log("🔄 Force regeneration result:", result);
      // Trigger a page refresh to test new persona generation
      window.location.reload();
    } catch (error) {
      console.error("❌ Force regeneration failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to safely extract personality data
  const getPersonalityData = () => {
    if (!blueprintData?.user_meta?.personality) return null;
    
    // Handle case where personality might be a string or object
    const personality = blueprintData.user_meta.personality;
    if (typeof personality === 'string') {
      return { type: personality };
    }
    if (typeof personality === 'object' && personality !== null) {
      // Safely handle both likelyType and type properties
      const personalityObj = personality as any;
      return {
        type: personalityObj.likelyType || personalityObj.type || 'Unknown',
        description: personalityObj.description || '',
        userConfidence: personalityObj.userConfidence || 0
      };
    }
    return null;
  };

  const personalityData = getPersonalityData();

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Persona Cleanup & Testing Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={runCleanup} 
              disabled={isLoading}
              variant="destructive"
            >
              {isLoading ? "Running..." : "Cleanup NULL Signatures"}
            </Button>
            
            <Button 
              onClick={getStats} 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? "Loading..." : "Get Stats"}
            </Button>
            
            <Button 
              onClick={forceRegenerate} 
              disabled={isLoading || !user}
              variant="secondary"
            >
              {isLoading ? "Regenerating..." : "Force Regenerate"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cleanup Results */}
      {cleanupResult && (
        <Card>
          <CardHeader>
            <CardTitle>Cleanup Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={cleanupResult.success ? "default" : "destructive"}>
                  {cleanupResult.success ? "Success" : "Failed"}
                </Badge>
                <span>Deleted {cleanupResult.deletedCount} stale personas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Display */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Persona Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Personas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.withNullSignature}</div>
                <div className="text-sm text-muted-foreground">NULL Signatures</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.withValidSignature}</div>
                <div className="text-sm text-muted-foreground">Valid Signatures</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{Object.keys(stats.byTemplateVersion).length}</div>
                <div className="text-sm text-muted-foreground">Template Versions</div>
              </div>
            </div>
            
            {Object.keys(stats.byTemplateVersion).length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">By Template Version:</h4>
                <div className="space-y-1">
                  {Object.entries(stats.byTemplateVersion).map(([version, count]) => (
                    <div key={version} className="flex justify-between text-sm">
                      <span>{version}</span>
                      <Badge variant="outline">{count as number}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SoulSync Status */}
      <Card>
        <CardHeader>
          <CardTitle>SoulSync Status Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={hasBlueprint ? "default" : "destructive"}>
                  {hasBlueprint ? "Has Blueprint" : "No Blueprint"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={isSoulSyncReady ? "default" : "destructive"}>
                  {isSoulSyncReady ? "SoulSync Ready" : "SoulSync Not Ready"}
                </Badge>
              </div>
              
              {soulSyncError && (
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Error</Badge>
                  <span className="text-sm text-red-600">{soulSyncError}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              {blueprintData && (
                <div className="text-sm space-y-1">
                  <div><strong>User:</strong> {blueprintData.user_meta?.preferred_name || 'Unknown'}</div>
                  <div><strong>MBTI:</strong> {personalityData?.type || 'Unknown'}</div>
                  <div><strong>HD Type:</strong> {blueprintData.energy_strategy_human_design?.type || 'Unknown'}</div>
                  <div><strong>Sun Sign:</strong> {blueprintData.archetype_western?.sun_sign || 'Unknown'}</div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
