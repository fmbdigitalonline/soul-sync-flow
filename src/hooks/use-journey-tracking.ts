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
      // Fetch directly from productivity_journey and growth_journey tables
      const [productivityResult, growthResult] = await Promise.all([
        supabase
          .from('productivity_journey')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('growth_journey')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()
      ]);

      if (productivityResult.error) {
        console.error('Error fetching productivity journey:', productivityResult.error);
      }

      if (growthResult.error) {
        console.error('Error fetching growth journey:', growthResult.error);
      }

      // Build productivity journey from direct table data
      const productivityData = productivityResult.data;
      const productivity: ProductivityJourney = {
        current_goals: Array.isArray(productivityData?.current_goals) ? productivityData.current_goals : [],
        completed_goals: Array.isArray(productivityData?.completed_goals) ? productivityData.completed_goals : [],
        active_tasks: Array.isArray(productivityData?.current_tasks) ? productivityData.current_tasks : [],
        completed_tasks: Array.isArray(productivityData?.completed_tasks) ? productivityData.completed_tasks : [],
        weekly_focus: String(productivityData?.current_position || ''),
        productivity_score: 0,
        last_updated: productivityData?.updated_at || new Date().toISOString()
      };

      // Build growth journey from direct table data
      const growthData = growthResult.data;
      const growth: GrowthJourney = {
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
      
      // Store in productivity_journey table
      const { error } = await supabase
        .from('productivity_journey')
        .upsert({
          user_id: user.id,
          current_goals: updatedJourney.current_goals,
          completed_goals: updatedJourney.completed_goals,
          current_tasks: updatedJourney.active_tasks,
          completed_tasks: updatedJourney.completed_tasks,
          updated_at: updatedJourney.last_updated
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
      
      // Store in growth_journey table
      const { error } = await supabase
        .from('growth_journey')
        .upsert({
          user_id: user.id,
          current_focus_areas: updatedJourney.current_focus_area ? [updatedJourney.current_focus_area] : [],
          reflection_entries: updatedJourney.reflection_entries,
          insight_entries: updatedJourney.insight_entries,
          mood_entries: updatedJourney.mood_entries,
          spiritual_practices: updatedJourney.spiritual_practices,
          growth_milestones: updatedJourney.growth_milestones,
          updated_at: updatedJourney.last_updated
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

  // Refetch data with loading state
  const refetch = useCallback(async () => {
    console.log('🔄 useJourneyTracking: Refetching journey data');
    setLoading(true);
    try {
      await fetchJourneyData();
      console.log('✅ useJourneyTracking: Data refetched successfully');
    } catch (error) {
      console.error('❌ useJourneyTracking: Refetch failed', error);
    } finally {
      setLoading(false);
    }
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
