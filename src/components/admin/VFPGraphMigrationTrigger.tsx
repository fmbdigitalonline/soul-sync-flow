
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, Loader2, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import { VFPGraphMigration } from '@/services/vfp-graph-migration';
import { toast } from 'sonner';

interface MigrationStatus {
  totalUsers: number;
  migratedUsers: number;
  pendingMigration: number;
  migrationComplete: boolean;
}

interface MigrationProgress {
  migrated: number;
  skipped: number;
  errors: number;
  total: number;
  isRunning: boolean;
  completed: boolean;
}

export const VFPGraphMigrationTrigger: React.FC = () => {
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null);
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress>({
    migrated: 0,
    skipped: 0,
    errors: 0,
    total: 0,
    isRunning: false,
    completed: false
  });
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  const loadMigrationStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const status = await VFPGraphMigration.getMigrationStatus();
      setMigrationStatus(status);
      console.log("📊 VFP-Graph migration status:", status);
    } catch (error) {
      console.error("❌ Error loading migration status:", error);
      toast.error("Failed to load migration status");
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const runMigration = async () => {
    if (!migrationStatus) {
      toast.error("Please load migration status first");
      return;
    }

    setMigrationProgress({
      migrated: 0,
      skipped: 0,
      errors: 0,
      total: migrationStatus.pendingMigration,
      isRunning: true,
      completed: false
    });

    try {
      console.log("🚀 Starting VFP-Graph migration for existing users...");
      toast.info("Starting VFP-Graph migration...");

      const result = await VFPGraphMigration.migrateExistingUsers();
      
      setMigrationProgress({
        migrated: result.migrated,
        skipped: result.skipped,
        errors: result.errors,
        total: result.migrated + result.skipped + result.errors,
        isRunning: false,
        completed: true
      });

      if (result.errors === 0) {
        toast.success(`🎉 Migration completed! ${result.migrated} users migrated to VFP-Graph`);
      } else {
        toast.warning(`Migration completed with ${result.errors} errors. ${result.migrated} users successfully migrated.`);
      }

      // Refresh status
      await loadMigrationStatus();

    } catch (error) {
      console.error("❌ Migration failed:", error);
      toast.error("Migration failed. Please check the logs.");
      setMigrationProgress(prev => ({ ...prev, isRunning: false }));
    }
  };

  React.useEffect(() => {
    loadMigrationStatus();
  }, []);

  const progressPercentage = migrationProgress.total > 0 
    ? Math.round(((migrationProgress.migrated + migrationProgress.skipped + migrationProgress.errors) / migrationProgress.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Migration Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-soul-purple" />
            VFP-Graph Migration Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingStatus ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading migration status...</span>
            </div>
          ) : migrationStatus ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-blue-600">{migrationStatus.totalUsers}</div>
                <div className="text-sm text-blue-700">Total Users</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-green-600">{migrationStatus.migratedUsers}</div>
                <div className="text-sm text-green-700">Migrated</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-orange-600">{migrationStatus.pendingMigration}</div>
                <div className="text-sm text-orange-700">Pending</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Brain className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((migrationStatus.migratedUsers / migrationStatus.totalUsers) * 100)}%
                </div>
                <div className="text-sm text-purple-700">Complete</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">Failed to load status</div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={loadMigrationStatus} 
              variant="outline" 
              disabled={isLoadingStatus}
            >
              {isLoadingStatus ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Refresh Status
            </Button>
            <Button 
              onClick={runMigration}
              disabled={!migrationStatus || migrationStatus.pendingMigration === 0 || migrationProgress.isRunning}
              className="bg-soul-purple hover:bg-soul-purple/90"
            >
              {migrationProgress.isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Migrating...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Start Migration
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Migration Progress */}
      {(migrationProgress.isRunning || migrationProgress.completed) && (
        <Card>
          <CardHeader>
            <CardTitle>Migration Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="w-full" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">{migrationProgress.migrated}</div>
                <div className="text-sm text-green-700">Migrated</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="text-xl font-bold text-yellow-600">{migrationProgress.skipped}</div>
                <div className="text-sm text-yellow-700">Skipped</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-xl font-bold text-red-600">{migrationProgress.errors}</div>
                <div className="text-sm text-red-700">Errors</div>
              </div>
            </div>

            {migrationProgress.completed && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Migration Completed!</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Successfully migrated {migrationProgress.migrated} users to VFP-Graph intelligence.
                  {migrationProgress.errors > 0 && ` ${migrationProgress.errors} users encountered errors and may need manual attention.`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Migration Info */}
      <Card>
        <CardHeader>
          <CardTitle>About VFP-Graph Migration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            This migration process generates 128-dimensional personality vectors for existing users who have completed blueprints.
          </p>
          <p>
            <strong>What happens during migration:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>MBTI data is encoded into a 32-dimensional vector</li>
            <li>Human Design gates are mapped to a 64-dimensional vector</li>
            <li>Astrology data is converted to 32-dimensional Fourier embeddings</li>
            <li>All vectors are fused into a single 128D personality representation</li>
            <li>Adaptive weight matrices are initialized for continuous learning</li>
          </ul>
          <p>
            <strong>Safety:</strong> The migration runs in batches and includes error handling. Users without sufficient blueprint data will be skipped safely.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
