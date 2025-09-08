
import { useState, useEffect, useCallback, useRef } from 'react';
import { user360Service, User360Profile, DataAvailability } from '@/services/user-360-service';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUser360Sync } from './use-user-360-sync';

export const useUser360 = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { syncActive, lastSyncTime, triggerSync } = useUser360Sync();
  
  const [profile, setProfile] = useState<User360Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  
  // Error frequency limiting to prevent toast spam
  const lastErrorTimeRef = useRef<number>(0);
  const lastErrorMessageRef = useRef<string>('');
  const ERROR_THROTTLE_MS = 10000; // Only show same error once per 10 seconds

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching 360° profile for user:', user.id);
      
      const userProfile = await user360Service.getUserProfile(user.id);
      setProfile(userProfile);
      setLastRefresh(new Date());
      
      if (userProfile) {
        console.log('✅ 360° Profile loaded successfully', {
          dataSources: userProfile.dataSources.length,
          version: userProfile.version
        });
      } else {
        console.log('⚠️ No 360° profile data available - this is normal for new users');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ Error fetching 360° profile:', errorMessage);
      setError(errorMessage);
      
      // Error frequency limiting - only show toast if enough time has passed or it's a different error
      const now = Date.now();
      const shouldShowToast = (now - lastErrorTimeRef.current > ERROR_THROTTLE_MS) || 
                             (lastErrorMessageRef.current !== errorMessage);
      
      if (shouldShowToast) {
        lastErrorTimeRef.current = now;
        lastErrorMessageRef.current = errorMessage;
        
        toast({
          title: "Profile Loading Error",
          description: `Unable to load complete profile: ${errorMessage}`,
          variant: "destructive"
        });
      } else {
        console.log('🔇 Error toast throttled - same error shown recently');
      }
    } finally {
      setLoading(false);
    }
  }, [user, toast]); // Removed syncActive dependency to break the loop

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('🔄 Manually refreshing 360° profile');
      const userProfile = await user360Service.refreshUserProfile(user.id);
      setProfile(userProfile);
      setLastRefresh(new Date());
      
      toast({
        title: "Profile Refreshed",
        description: "Your 360° profile has been updated with the latest data",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Refresh failed';
      console.error('❌ Error refreshing profile:', errorMessage);
      setError(errorMessage);
    }
  }, [user, toast]);

  // Enhanced refresh that also triggers sync
  const forceRefreshWithSync = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('🔄 Force refreshing with sync trigger');
      
      // Trigger sync first to ensure fresh data
      await triggerSync();
      
      // Wait a moment for sync to process
      setTimeout(async () => {
        await refreshProfile();
      }, 1000);
      
    } catch (err) {
      console.error('❌ Error in force refresh with sync:', err);
    }
  }, [user, triggerSync, refreshProfile]);

  // Initial load
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Auto-refresh when sync updates occur
  useEffect(() => {
    if (lastSyncTime && profile) {
      // If sync happened after our last refresh, automatically refresh
      if (lastRefresh && lastSyncTime > lastRefresh) {
        console.log('🔄 Auto-refreshing profile due to sync update');
        fetchProfile();
      }
    }
  }, [lastSyncTime, lastRefresh, profile, fetchProfile]);

  // Calculate data completeness score
  const completenessScore = profile?.dataAvailability ? 
    Object.values(profile.dataAvailability).filter(section => section.available).length / 
    Object.keys(profile.dataAvailability).length * 100 : 0;

  return {
    profile,
    loading,
    error,
    lastRefresh,
    completenessScore: Math.round(completenessScore),
    refreshProfile,
    forceRefreshWithSync,
    // Transparent availability info
    dataAvailability: profile?.dataAvailability || null,
    dataSources: profile?.dataSources || [],
    hasProfile: profile !== null,
    isDataAvailable: (section: keyof DataAvailability) => 
      profile?.dataAvailability?.[section]?.available || false,
    // Sync status
    syncActive,
    lastSyncTime
  };
};
