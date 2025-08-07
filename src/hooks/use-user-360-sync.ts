
import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { user360SyncService } from '@/services/user-360-sync-service';
import { user360EmergencyService } from '@/services/user-360-emergency-mode';

export const useUser360Sync = () => {
  const { user } = useAuth();
  const [syncActive, setSyncActive] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Start sync when user is available
  useEffect(() => {
    if (!user?.id) {
      setSyncActive(false);
      return;
    }

    const startSync = async () => {
      try {
        // EMERGENCY I/O PROTECTION: Check system health before starting sync
        const emergencyStatus = await user360EmergencyService.checkSystemHealth();
        setEmergencyMode(emergencyStatus.isEmergencyMode);
        
        if (emergencyStatus.isEmergencyMode) {
          console.log('🚨 Emergency Mode: Sync disabled due to high I/O:', emergencyStatus.reason);
          setSyncActive(false);
          return;
        }

        await user360SyncService.startSync(user.id);
        setSyncActive(true);
        setLastSyncTime(new Date());
        console.log('✅ 360° sync started for user:', user.id);
      } catch (error) {
        console.error('❌ Failed to start 360° sync:', error);
        setSyncActive(false);
      }
    };

    startSync();

    // Cleanup on unmount or user change
    return () => {
      if (user?.id) {
        user360SyncService.stopSync(user.id);
        setSyncActive(false);
      }
    };
  }, [user?.id]);

  // Manual sync trigger
  const triggerSync = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Stop and restart sync to refresh all connections
      await user360SyncService.stopSync(user.id);
      await user360SyncService.startSync(user.id);
      setLastSyncTime(new Date());
      console.log('🔄 Manual 360° sync triggered for user:', user.id);
    } catch (error) {
      console.error('❌ Failed to trigger manual sync:', error);
    }
  }, [user?.id]);

  // Get current sync status
  const getSyncStatus = useCallback(() => {
    if (!user?.id) return null;
    return user360SyncService.getSyncStatus(user.id);
  }, [user?.id]);

  return {
    syncActive,
    lastSyncTime,
    triggerSync,
    getSyncStatus,
    isUserLoggedIn: !!user?.id,
    emergencyMode // Expose emergency mode status
  };
};
