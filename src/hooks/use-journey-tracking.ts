/**
 * Journey Tracking Hook powered by React Query.
 * Provides resilient data fetching that refreshes on reconnect and focus.
 */

import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface ProductivityJourney {
  current_goals: any[];
  completed_goals: any[];
  active_tasks: any[];
  completed_tasks: any[];
  weekly_focus: string;
  productivity_score: number;
  last_updated: string;
}

export interface GrowthJourney {
  current_focus_area: string;
  reflection_entries: any[];
  insight_entries: any[];
  mood_entries: any[];
  spiritual_practices: any[];
  growth_milestones: any[];
  last_updated: string;
}

interface UseJourneyTrackingReturn {
  productivityJourney: ProductivityJourney;
  growthJourney: GrowthJourney;
  loading: boolean;
  updateProductivityJourney: (updates: Partial<ProductivityJourney>) => Promise<{ success: boolean; error?: string }>;
  updateGrowthJourney: (updates: Partial<GrowthJourney>) => Promise<{ success: boolean; error?: string }>;
  addReflectionEntry: (entry: any) => Promise<{ success: boolean; error?: string }>;
  addInsightEntry: (entry: any) => Promise<{ success: boolean; error?: string }>;
  addMoodEntry: (entry: any) => Promise<{ success: boolean; error?: string }>;
  refetch: () => Promise<void>;
  [key: string]: any;
}

type JourneyData = {
  productivityJourney: ProductivityJourney;
  growthJourney: GrowthJourney;
};

const buildDefaultProductivityJourney = (): ProductivityJourney => ({
  current_goals: [],
  completed_goals: [],
  active_tasks: [],
  completed_tasks: [],
  weekly_focus: '',
  productivity_score: 0,
  last_updated: new Date().toISOString()
});

const buildDefaultGrowthJourney = (): GrowthJourney => ({
  current_focus_area: '',
  reflection_entries: [],
  insight_entries: [],
  mood_entries: [],
  spiritual_practices: [],
  growth_milestones: [],
  last_updated: new Date().toISOString()
});

const JOURNEY_QUERY_KEY = (userId: string | null) => ['journey', userId] as const;

export const useJourneyTracking = (): UseJourneyTrackingReturn => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id ?? null;

  const defaultJourneyData = useMemo<JourneyData>(() => ({
    productivityJourney: buildDefaultProductivityJourney(),
    growthJourney: buildDefaultGrowthJourney()
  }), []);

  const fetchJourneyData = useCallback(async (): Promise<JourneyData> => {
    if (!userId) {
      return {
        productivityJourney: buildDefaultProductivityJourney(),
        growthJourney: buildDefaultGrowthJourney()
      };
    }

    const [productivityResult, growthResult] = await Promise.all([
      supabase
        .from('productivity_journey')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('growth_journey')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
    ]);

    if (productivityResult.error) {
      console.error('Error fetching productivity journey:', productivityResult.error);
    }

    if (growthResult.error) {
      console.error('Error fetching growth journey:', growthResult.error);
    }

    const productivityData = productivityResult.data;
    const productivityJourney: ProductivityJourney = {
      current_goals: Array.isArray(productivityData?.current_goals) ? productivityData.current_goals : [],
      completed_goals: Array.isArray(productivityData?.completed_goals) ? productivityData.completed_goals : [],
      active_tasks: Array.isArray(productivityData?.current_tasks) ? productivityData.current_tasks : [],
      completed_tasks: Array.isArray(productivityData?.completed_tasks) ? productivityData.completed_tasks : [],
      weekly_focus: String(productivityData?.current_position || ''),
      productivity_score: 0,
      last_updated: productivityData?.updated_at || new Date().toISOString()
    };

    const growthData = growthResult.data;
    const growthJourney: GrowthJourney = {
      current_focus_area: (() => {
        const focusAreas = growthData?.current_focus_areas;
        if (Array.isArray(focusAreas) && focusAreas.length > 0) {
          return String(focusAreas[0]);
        }
        return '';
      })(),
      reflection_entries: Array.isArray(growthData?.reflection_entries) ? growthData.reflection_entries : [],
      insight_entries: Array.isArray(growthData?.insight_entries) ? growthData.insight_entries : [],
      mood_entries: Array.isArray(growthData?.mood_entries) ? growthData.mood_entries : [],
      spiritual_practices: Array.isArray(growthData?.spiritual_practices) ? growthData.spiritual_practices : [],
      growth_milestones: Array.isArray(growthData?.growth_milestones) ? growthData.growth_milestones : [],
      last_updated: growthData?.updated_at || new Date().toISOString()
    };

    return { productivityJourney, growthJourney };
  }, [userId]);

  const {
    data,
    isLoading,
    isFetching,
    refetch: queryRefetch
  } = useQuery<JourneyData>({
    queryKey: JOURNEY_QUERY_KEY(userId),
    queryFn: fetchJourneyData,
    enabled: !!userId,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  });

  const journeyData = data ?? defaultJourneyData;
  const productivityJourney = journeyData.productivityJourney;
  const growthJourney = journeyData.growthJourney;
  const loading = !!userId && (isLoading || isFetching);

  const updateProductivityJourney = useCallback(async (updates: Partial<ProductivityJourney>) => {
    if (!userId) return { success: false, error: 'No authenticated user' };

    try {
      const current = queryClient.getQueryData<JourneyData>(JOURNEY_QUERY_KEY(userId)) ?? {
        productivityJourney: buildDefaultProductivityJourney(),
        growthJourney: buildDefaultGrowthJourney()
      };

      const updatedJourney: ProductivityJourney = {
        ...current.productivityJourney,
        ...updates,
        last_updated: new Date().toISOString()
      };

      const { error } = await supabase
        .from('productivity_journey')
        .upsert({
          user_id: userId,
          current_goals: updatedJourney.current_goals,
          completed_goals: updatedJourney.completed_goals,
          current_tasks: updatedJourney.active_tasks,
          completed_tasks: updatedJourney.completed_tasks,
          updated_at: updatedJourney.last_updated
        });

      if (error) throw error;

      queryClient.setQueryData<JourneyData>(JOURNEY_QUERY_KEY(userId), {
        productivityJourney: updatedJourney,
        growthJourney: current.growthJourney
      });

      await queryClient.invalidateQueries({ queryKey: JOURNEY_QUERY_KEY(userId) });
      return { success: true };
    } catch (error) {
      console.error('Error updating productivity journey:', error);
      return { success: false, error: String(error) };
    }
  }, [userId, queryClient]);

  const updateGrowthJourney = useCallback(async (updates: Partial<GrowthJourney>) => {
    if (!userId) return { success: false, error: 'No authenticated user' };

    try {
      const current = queryClient.getQueryData<JourneyData>(JOURNEY_QUERY_KEY(userId)) ?? {
        productivityJourney: buildDefaultProductivityJourney(),
        growthJourney: buildDefaultGrowthJourney()
      };

      const updatedJourney: GrowthJourney = {
        ...current.growthJourney,
        ...updates,
        last_updated: new Date().toISOString()
      };

      const { error } = await supabase
        .from('growth_journey')
        .upsert({
          user_id: userId,
          current_focus_areas: updatedJourney.current_focus_area ? [updatedJourney.current_focus_area] : [],
          reflection_entries: updatedJourney.reflection_entries,
          insight_entries: updatedJourney.insight_entries,
          mood_entries: updatedJourney.mood_entries,
          spiritual_practices: updatedJourney.spiritual_practices,
          growth_milestones: updatedJourney.growth_milestones,
          updated_at: updatedJourney.last_updated
        });

      if (error) throw error;

      queryClient.setQueryData<JourneyData>(JOURNEY_QUERY_KEY(userId), {
        productivityJourney: current.productivityJourney,
        growthJourney: updatedJourney
      });

      await queryClient.invalidateQueries({ queryKey: JOURNEY_QUERY_KEY(userId) });
      return { success: true };
    } catch (error) {
      console.error('Error updating growth journey:', error);
      return { success: false, error: String(error) };
    }
  }, [userId, queryClient]);

  const addReflectionEntry = useCallback(async (entry: any) => {
    if (!userId) return { success: false, error: 'No authenticated user' };

    try {
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: 'reflection_entry',
          activity_data: entry
        });

      if (error) throw error;

      queryClient.setQueryData<JourneyData>(JOURNEY_QUERY_KEY(userId), (current) => {
        const base = current ?? {
          productivityJourney: buildDefaultProductivityJourney(),
          growthJourney: buildDefaultGrowthJourney()
        };

        const updatedGrowth: GrowthJourney = {
          ...base.growthJourney,
          reflection_entries: [entry, ...(base.growthJourney.reflection_entries || [])],
          last_updated: new Date().toISOString()
        };

        return {
          productivityJourney: base.productivityJourney,
          growthJourney: updatedGrowth
        };
      });

      return { success: true };
    } catch (error) {
      console.error('Error adding reflection entry:', error);
      return { success: false, error: String(error) };
    }
  }, [userId, queryClient]);

  const addInsightEntry = useCallback(async (entry: any) => {
    if (!userId) return { success: false, error: 'No authenticated user' };

    try {
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: 'insight_entry',
          activity_data: entry
        });

      if (error) throw error;

      queryClient.setQueryData<JourneyData>(JOURNEY_QUERY_KEY(userId), (current) => {
        const base = current ?? {
          productivityJourney: buildDefaultProductivityJourney(),
          growthJourney: buildDefaultGrowthJourney()
        };

        const updatedGrowth: GrowthJourney = {
          ...base.growthJourney,
          insight_entries: [entry, ...(base.growthJourney.insight_entries || [])],
          last_updated: new Date().toISOString()
        };

        return {
          productivityJourney: base.productivityJourney,
          growthJourney: updatedGrowth
        };
      });

      return { success: true };
    } catch (error) {
      console.error('Error adding insight entry:', error);
      return { success: false, error: String(error) };
    }
  }, [userId, queryClient]);

  const addMoodEntry = useCallback(async (entry: any) => {
    if (!userId) return { success: false, error: 'No authenticated user' };

    try {
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: 'mood_entry',
          activity_data: entry
        });

      if (error) throw error;

      queryClient.setQueryData<JourneyData>(JOURNEY_QUERY_KEY(userId), (current) => {
        const base = current ?? {
          productivityJourney: buildDefaultProductivityJourney(),
          growthJourney: buildDefaultGrowthJourney()
        };

        const updatedGrowth: GrowthJourney = {
          ...base.growthJourney,
          mood_entries: [entry, ...(base.growthJourney.mood_entries || [])],
          last_updated: new Date().toISOString()
        };

        return {
          productivityJourney: base.productivityJourney,
          growthJourney: updatedGrowth
        };
      });

      return { success: true };
    } catch (error) {
      console.error('Error adding mood entry:', error);
      return { success: false, error: String(error) };
    }
  }, [userId, queryClient]);

  const refetch = useCallback(async () => {
    if (!userId) return;
    await queryClient.invalidateQueries({ queryKey: JOURNEY_QUERY_KEY(userId) });
    await queryRefetch();
  }, [userId, queryClient, queryRefetch]);

  return {
    productivityJourney,
    growthJourney,
    loading,
    updateProductivityJourney,
    updateGrowthJourney,
    addReflectionEntry,
    addInsightEntry,
    addMoodEntry,
    refetch
  };
};
