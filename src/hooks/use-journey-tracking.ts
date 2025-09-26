/**
 * Journey Tracking Hook - Compatibility Layer
 * 
 * SoulSync Principle #1: Never Break - Preserves existing interface for productivity/growth journeys
 * This maintains the original journey tracking system while our new onboarding tracking coexists
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Existing interface types that components expect
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
  // Existing state that components expect
  productivityJourney: ProductivityJourney | null;
  growthJourney: GrowthJourney | null;
  loading: boolean;
  
  // Existing actions that components expect
  updateProductivityJourney: (updates: Partial<ProductivityJourney>) => Promise<{ success: boolean; error?: string }>;
  updateGrowthJourney: (updates: Partial<GrowthJourney>) => Promise<{ success: boolean; error?: string }>;
  addReflectionEntry: (entry: any) => Promise<{ success: boolean; error?: string }>;
  addInsightEntry: (entry: any) => Promise<{ success: boolean; error?: string }>;
  addMoodEntry: (entry: any) => Promise<{ success: boolean; error?: string }>;
  refetch: () => Promise<void>;
  
  // Additional methods some components might expect
  [key: string]: any;
}

export const useJourneyTracking = (): UseJourneyTrackingReturn => {
  const { user } = useAuth();
  const [productivityJourney, setProductivityJourney] = useState<ProductivityJourney | null>(null);
  const [growthJourney, setGrowthJourney] = useState<GrowthJourney | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize default data structure
  const initializeDefaultData = useCallback(() => {
    const defaultProductivity: ProductivityJourney = {
      current_goals: [],
      completed_goals: [],
      active_tasks: [],
      completed_tasks: [],
      weekly_focus: '',
      productivity_score: 0,
      last_updated: new Date().toISOString()
    };

    const defaultGrowth: GrowthJourney = {
      current_focus_area: '',
      reflection_entries: [],
      insight_entries: [],
      mood_entries: [],
      spiritual_practices: [],
      growth_milestones: [],
      last_updated: new Date().toISOString()
    };

    setProductivityJourney(defaultProductivity);
    setGrowthJourney(defaultGrowth);
  }, []);

  // Fetch journey data from database
  const fetchJourneyData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch from user_activities or other relevant tables
      const { data: activities, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user.id)
        .in('activity_type', ['productivity_update', 'growth_update', 'reflection_entry', 'insight_entry', 'mood_entry'])
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching journey data:', error);
        initializeDefaultData(); // Fallback to defaults
        return;
      }

      // Process activities into journey structures with safe data access
      const productivityActivities = activities?.filter(a => 
        a.activity_type === 'productivity_update' || 
        a.activity_type === 'task_completed'
      ) || [];

      const growthActivities = activities?.filter(a => 
        a.activity_type === 'growth_update' ||
        a.activity_type === 'reflection_entry' ||
        a.activity_type === 'insight_entry' ||
        a.activity_type === 'mood_entry'
      ) || [];

      // Safely extract data from activities with proper type checking
      const safeGetActivityData = (activity: any, key: string) => {
        try {
          if (activity?.activity_data && typeof activity.activity_data === 'object') {
            return (activity.activity_data as any)[key] || [];
          }
          return [];
        } catch {
          return [];
        }
      };

      // Build productivity journey from activities  
      const productivity: ProductivityJourney = {
        current_goals: productivityActivities.flatMap(a => safeGetActivityData(a, 'goals')),
        completed_goals: productivityActivities.flatMap(a => safeGetActivityData(a, 'completed_goals')),
        active_tasks: productivityActivities.flatMap(a => safeGetActivityData(a, 'tasks')).filter((t: any) => !t?.completed),
        completed_tasks: productivityActivities.flatMap(a => safeGetActivityData(a, 'tasks')).filter((t: any) => t?.completed),
        weekly_focus: safeGetActivityData(productivityActivities[0], 'weekly_focus') || '',
        productivity_score: safeGetActivityData(productivityActivities[0], 'productivity_score') || 0,
        last_updated: productivityActivities[0]?.created_at || new Date().toISOString()
      };

      // Build growth journey from activities
      const growth: GrowthJourney = {
        current_focus_area: safeGetActivityData(growthActivities[0], 'focus_area') || '',
        reflection_entries: growthActivities.filter(a => a.activity_type === 'reflection_entry').map(a => a.activity_data),
        insight_entries: growthActivities.filter(a => a.activity_type === 'insight_entry').map(a => a.activity_data),
        mood_entries: growthActivities.filter(a => a.activity_type === 'mood_entry').map(a => a.activity_data),
        spiritual_practices: growthActivities.flatMap(a => safeGetActivityData(a, 'spiritual_practices')),
        growth_milestones: growthActivities.flatMap(a => safeGetActivityData(a, 'milestones')),
        last_updated: growthActivities[0]?.created_at || new Date().toISOString()
      };

      setProductivityJourney(productivity);
      setGrowthJourney(growth);

    } catch (error) {
      console.error('Error in fetchJourneyData:', error);
      initializeDefaultData(); // Fallback to defaults
    } finally {
      setLoading(false);
    }
  }, [user, initializeDefaultData]);

  // Update productivity journey
  const updateProductivityJourney = useCallback(async (updates: Partial<ProductivityJourney>) => {
    if (!user) return { success: false, error: 'No authenticated user' };

    try {
      const updatedJourney = { ...productivityJourney, ...updates, last_updated: new Date().toISOString() };
      
      // Store in database
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: 'productivity_update',
          activity_data: updates
        });

      if (error) throw error;

      setProductivityJourney(updatedJourney as ProductivityJourney);
      return { success: true };
    } catch (error) {
      console.error('Error updating productivity journey:', error);
      return { success: false, error: String(error) };
    }
  }, [user, productivityJourney]);

  // Update growth journey
  const updateGrowthJourney = useCallback(async (updates: Partial<GrowthJourney>) => {
    if (!user) return { success: false, error: 'No authenticated user' };

    try {
      const updatedJourney = { ...growthJourney, ...updates, last_updated: new Date().toISOString() };
      
      // Store in database
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: 'growth_update',
          activity_data: updates
        });

      if (error) throw error;

      setGrowthJourney(updatedJourney as GrowthJourney);
      return { success: true };
    } catch (error) {
      console.error('Error updating growth journey:', error);
      return { success: false, error: String(error) };
    }
  }, [user, growthJourney]);

  // Add reflection entry
  const addReflectionEntry = useCallback(async (entry: any) => {
    if (!user) return { success: false, error: 'No authenticated user' };

    try {
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: 'reflection_entry',
          activity_data: entry
        });

      if (error) throw error;

      // Update local state
      setGrowthJourney(prev => prev ? {
        ...prev,
        reflection_entries: [entry, ...prev.reflection_entries],
        last_updated: new Date().toISOString()
      } : null);

      return { success: true };
    } catch (error) {
      console.error('Error adding reflection entry:', error);
      return { success: false, error: String(error) };
    }
  }, [user]);

  // Add insight entry
  const addInsightEntry = useCallback(async (entry: any) => {
    if (!user) return { success: false, error: 'No authenticated user' };

    try {
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: 'insight_entry',
          activity_data: entry
        });

      if (error) throw error;

      // Update local state
      setGrowthJourney(prev => prev ? {
        ...prev,
        insight_entries: [entry, ...prev.insight_entries],
        last_updated: new Date().toISOString()
      } : null);

      return { success: true };
    } catch (error) {
      console.error('Error adding insight entry:', error);
      return { success: false, error: String(error) };
    }
  }, [user]);

  // Add mood entry
  const addMoodEntry = useCallback(async (entry: any) => {
    if (!user) return { success: false, error: 'No authenticated user' };

    try {
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: 'mood_entry',
          activity_data: entry
        });

      if (error) throw error;

      // Update local state
      setGrowthJourney(prev => prev ? {
        ...prev,
        mood_entries: [entry, ...prev.mood_entries],
        last_updated: new Date().toISOString()
      } : null);

      return { success: true };
    } catch (error) {
      console.error('Error adding mood entry:', error);
      return { success: false, error: String(error) };
    }
  }, [user]);

  // Refetch data
  const refetch = useCallback(async () => {
    await fetchJourneyData();
  }, [fetchJourneyData]);

  // Initialize data on mount
  useEffect(() => {
    if (user) {
      fetchJourneyData();
    } else {
      initializeDefaultData();
    }
  }, [user, fetchJourneyData, initializeDefaultData]);

  return {
    // State
    productivityJourney,
    growthJourney,
    loading,
    
    // Actions
    updateProductivityJourney,
    updateGrowthJourney,
    addReflectionEntry,
    addInsightEntry,
    addMoodEntry,
    refetch
  };
};
