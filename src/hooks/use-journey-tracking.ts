
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
      } else if (productivityData) {
        setProductivityJourney({
          ...productivityData,
          current_goals: Array.isArray(productivityData.current_goals) ? productivityData.current_goals : [],
          completed_goals: Array.isArray(productivityData.completed_goals) ? productivityData.completed_goals : [],
          current_tasks: Array.isArray(productivityData.current_tasks) ? productivityData.current_tasks : [],
          completed_tasks: Array.isArray(productivityData.completed_tasks) ? productivityData.completed_tasks : [],
          focus_sessions: Array.isArray(productivityData.focus_sessions) ? productivityData.focus_sessions : [],
          journey_milestones: Array.isArray(productivityData.journey_milestones) ? productivityData.journey_milestones : [],
          productivity_metrics: productivityData.productivity_metrics || {}
        });
      }

      // Fetch growth journey
      const { data: growthData, error: growthError } = await supabase
        .from('growth_journey')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (growthError && growthError.code !== 'PGRST116') {
        console.error('Error fetching growth journey:', growthError);
      } else if (growthData) {
        setGrowthJourney({
          ...growthData,
          mood_entries: Array.isArray(growthData.mood_entries) ? growthData.mood_entries : [],
          reflection_entries: Array.isArray(growthData.reflection_entries) ? growthData.reflection_entries : [],
          insight_entries: Array.isArray(growthData.insight_entries) ? growthData.insight_entries : [],
          spiritual_practices: Array.isArray(growthData.spiritual_practices) ? growthData.spiritual_practices : [],
          growth_milestones: Array.isArray(growthData.growth_milestones) ? growthData.growth_milestones : [],
          current_focus_areas: Array.isArray(growthData.current_focus_areas) ? growthData.current_focus_areas : []
        });
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

  const addGoal = async (goal: any) => {
    if (!productivityJourney) return;

    const updatedGoals = [...(productivityJourney.current_goals || []), goal];
    
    await updateProductivityJourney({
      current_goals: updatedGoals,
      last_activity_date: new Date().toISOString()
    });
  };

  const updateGoal = async (goalId: string, updates: any) => {
    if (!productivityJourney) return;

    const updatedGoals = productivityJourney.current_goals?.map(goal => 
      goal.id === goalId ? { ...goal, ...updates } : goal
    ) || [];
    
    await updateProductivityJourney({
      current_goals: updatedGoals,
      last_activity_date: new Date().toISOString()
    });
  };

  const completeGoal = async (goalId: string) => {
    if (!productivityJourney) return;

    const goalToComplete = productivityJourney.current_goals?.find(g => g.id === goalId);
    if (!goalToComplete) return;

    const updatedCurrentGoals = productivityJourney.current_goals?.filter(g => g.id !== goalId) || [];
    const updatedCompletedGoals = [...(productivityJourney.completed_goals || []), {
      ...goalToComplete,
      completed_at: new Date().toISOString()
    }];
    
    await updateProductivityJourney({
      current_goals: updatedCurrentGoals,
      completed_goals: updatedCompletedGoals,
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
    addGoal,
    updateGoal,
    completeGoal,
    refetch: fetchJourneys
  };
};
