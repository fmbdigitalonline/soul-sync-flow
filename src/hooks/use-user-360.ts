
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { user360Service, type User360Profile, type DataAvailability } from '@/services/user-360-service';

export interface UseUser360Return {
  profile: User360Profile | null;
  loading: boolean;
  error: string | null;
  lastRefresh: Date | null;
  completenessScore: number;
  refreshProfile: () => Promise<void>;
  forceRefreshWithSync: () => Promise<void>;
  dataAvailability: DataAvailability | null;
  dataSources: string[];
  hasProfile: boolean;
  syncActive: boolean;
  lastSyncTime: Date | null;
}

export const useUser360 = (): UseUser360Return => {
  const [profile, setProfile] = useState<User360Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [syncActive, setSyncActive] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { toast } = useToast();

  const calculateCompleteness = useCallback((profile: User360Profile | null): number => {
    if (!profile?.dataAvailability) return 0;
    
    const availability = profile.dataAvailability;
    const sections = [
      availability.blueprint.available,
      availability.intelligence.available,
      availability.memory.available,
      availability.patterns.available,
      availability.growth.available,
      availability.activities.available,
      availability.goals.available,
      availability.conversations.available
    ];
    
    const availableCount = sections.filter(Boolean).length;
    return Math.round((availableCount / sections.length) * 100);
  }, []);

  const fetchProfile = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return;
      }

      console.log('🔄 360° Hook: Fetching user profile for:', user.id);
      
      if (forceRefresh) {
        setSyncActive(true);
        setLastSyncTime(new Date());
      }

      const profile360 = await user360Service.getUserProfile(user.id);
      
      if (profile360) {
        setProfile(profile360);
        setLastRefresh(new Date());
        console.log('✅ 360° Hook: Profile loaded successfully');
      } else {
        console.log('⚠️ 360° Hook: No profile data available');
        setProfile(null);
      }
      
    } catch (err) {
      console.error('❌ 360° Hook: Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      
      toast({
        title: "Profile Load Error",
        description: "Failed to load your 360° profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setSyncActive(false);
    }
  }, [toast]);

  const refreshProfile = useCallback(async () => {
    await fetchProfile(false);
  }, [fetchProfile]);

  const forceRefreshWithSync = useCallback(async () => {
    await fetchProfile(true);
  }, [fetchProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const completenessScore = calculateCompleteness(profile);
  const dataAvailability = profile?.dataAvailability || null;
  const dataSources = profile?.dataSources || [];
  const hasProfile = profile !== null;

  return {
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
  };
};
