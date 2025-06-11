
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProductivityJourney {
  id: string;
  user_id: string;
  current_goals: any[];
  completed_goals: any[];
  current_tasks: any[];
  completed_tasks: any[];
  focus_sessions: any[];
  productivity_metrics: any;
  journey_milestones: any[];
  current_position: string;
  last_activity_date: string;
  created_at: string;
  updated_at: string;
}

export interface GrowthJourney {
  id: string;
  user_id: string;
  mood_entries: any[];
  reflection_entries: any[];
  insight_entries: any[];
  spiritual_practices: any[];
  growth_milestones: any[];
  current_focus_areas: any[];
  current_position: string;
  last_reflection_date: string;
  created_at: string;
  updated_at: string;
}

export const useJourneyTracking = () => {
  const [productivityJourney, setProductivityJourney] = useState<ProductivityJourney | null>(null);
  const [growthJourney, setGrowthJourney] = useState<GrowthJourney | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchJourneys = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch productivity journey
      const { data: productivityData, error: productivityError } = await supabase
        .from('productivity_journey')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (productivityError && productivityError.code !== 'PGRST116') {
        console.error('Error fetching productivity journey:', productivityError);
      } else {
        setProductivityJourney(productivityData);
      }

      // Fetch growth journey
      const { data: growthData, error: growthError } = await supabase
        .from('growth_journey')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (growthError && growthError.code !== 'PGRST116') {
        console.error('Error fetching growth journey:', growthError);
      } else {
        setGrowthJourney(growthData);
      }

    } catch (error) {
      console.error('Error in fetchJourneys:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProductivityJourney = async (updates: Partial<ProductivityJourney>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('productivity_journey')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating productivity journey:', error);
        return;
      }

      await fetchJourneys();
    } catch (error) {
      console.error('Error in updateProductivityJourney:', error);
    }
  };

  const updateGrowthJourney = async (updates: Partial<GrowthJourney>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('growth_journey')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating growth journey:', error);
        return;
      }

      await fetchJourneys();
    } catch (error) {
      console.error('Error in updateGrowthJourney:', error);
    }
  };

  const addMoodEntry = async (mood: string, energy: string) => {
    if (!growthJourney) return;

    const newEntry = {
      mood,
      energy,
      timestamp: new Date().toISOString()
    };

    const updatedMoodEntries = [...(growthJourney.mood_entries || []), newEntry];
    
    await updateGrowthJourney({
      mood_entries: updatedMoodEntries,
      last_reflection_date: new Date().toISOString()
    });
  };

  const addReflectionEntry = async (prompt: string, response: string) => {
    if (!growthJourney) return;

    const newEntry = {
      prompt,
      response,
      timestamp: new Date().toISOString()
    };

    const updatedReflectionEntries = [...(growthJourney.reflection_entries || []), newEntry];
    
    await updateGrowthJourney({
      reflection_entries: updatedReflectionEntries,
      last_reflection_date: new Date().toISOString()
    });
  };

  const addInsightEntry = async (insight: string, tags: string[]) => {
    if (!growthJourney) return;

    const newEntry = {
      insight,
      tags,
      timestamp: new Date().toISOString()
    };

    const updatedInsightEntries = [...(growthJourney.insight_entries || []), newEntry];
    
    await updateGrowthJourney({
      insight_entries: updatedInsightEntries,
      last_reflection_date: new Date().toISOString()
    });
  };

  const addProductivityTask = async (task: any) => {
    if (!productivityJourney) return;

    const updatedTasks = [...(productivityJourney.current_tasks || []), task];
    
    await updateProductivityJourney({
      current_tasks: updatedTasks,
      last_activity_date: new Date().toISOString()
    });
  };

  const completeProductivityTask = async (taskId: string) => {
    if (!productivityJourney) return;

    const taskToComplete = productivityJourney.current_tasks?.find(t => t.id === taskId);
    if (!taskToComplete) return;

    const updatedCurrentTasks = productivityJourney.current_tasks?.filter(t => t.id !== taskId) || [];
    const updatedCompletedTasks = [...(productivityJourney.completed_tasks || []), {
      ...taskToComplete,
      completed_at: new Date().toISOString()
    }];
    
    await updateProductivityJourney({
      current_tasks: updatedCurrentTasks,
      completed_tasks: updatedCompletedTasks,
      last_activity_date: new Date().toISOString()
    });
  };

  useEffect(() => {
    fetchJourneys();
  }, []);

  return {
    productivityJourney,
    growthJourney,
    loading,
    updateProductivityJourney,
    updateGrowthJourney,
    addMoodEntry,
    addReflectionEntry,
    addInsightEntry,
    addProductivityTask,
    completeProductivityTask,
    refetch: fetchJourneys
  };
};
