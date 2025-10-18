import { useState, useEffect } from 'react';
import { JourneyAgenticTools } from '@/services/journey-agentic-tools';
import { hermeticIntelligenceService } from '@/services/hermetic-intelligence-service';
import { supabase } from '@/integrations/supabase/client';
import { enhancedTaskCoachIntegrationService } from '@/services/enhanced-task-coach-integration-service';

interface TaskAssistantData {
  checklistSteps: string[];
  anticipatedBlockers: string[];
  motivationalFraming: string;
  timeOptimization: string;
}

interface UseTaskAssistantResult {
  assistantData: TaskAssistantData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook that generates personalized task breakdowns using hermetic data
 * and persists subtasks to the database for cross-session persistence
 */
export function useTaskAssistant(task: any): UseTaskAssistantResult {
  const [assistantData, setAssistantData] = useState<TaskAssistantData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If task already has sub_tasks in database, skip generation
    if (task.sub_tasks && task.sub_tasks.length > 0) {
      console.log('📦 TaskAssistant: Using cached subtasks from database');
      return;
    }

    let isMounted = true;

    async function generateAndPersistAssistant() {
      if (!isMounted) return;
      
      setLoading(true);
      setError(null);

      try {
        // Get user authentication
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        console.log('🎯 TaskAssistant: Generating personalized breakdown for:', task.title);

        // Fetch hermetic intelligence data
        const hermeticResult = await hermeticIntelligenceService.getStructuredIntelligence(user.id);
        const hermeticData = hermeticResult.success ? hermeticResult.intelligence : null;

        // Fetch blueprint data
        const { data: blueprintData } = await supabase
          .from('blueprints')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        // Generate task assistant data
        const result = await JourneyAgenticTools.generateTaskAssistant(
          task,
          hermeticData,
          blueprintData
        );

        if (!isMounted) return;

        console.log('✨ TaskAssistant: Generated breakdown with', result.checklistSteps.length, 'steps');

        // Set the current task in the integration service
        enhancedTaskCoachIntegrationService.setCurrentTask({
          ...task,
          progress: 0,
          sub_tasks: []
        });

        // Persist each checklist step as a subtask to the database
        for (let i = 0; i < result.checklistSteps.length; i++) {
          const step = result.checklistSteps[i];
          
          await enhancedTaskCoachIntegrationService.executeTaskAction({
            type: 'add_subtask',
            payload: {
              id: `subtask_ai_${Date.now()}_${i}`,
              title: step,
              metadata: {
                source: 'ai_assistant',
                motivationalFraming: result.motivationalFraming,
                timeOptimization: result.timeOptimization,
                estimatedTime: task.estimated_duration,
                energyRequired: task.energy_level_required
              }
            }
          }, 'auto_execution');

          // Small delay to prevent race conditions
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        console.log('💾 TaskAssistant: Persisted', result.checklistSteps.length, 'subtasks to database');

        if (!isMounted) return;

        setAssistantData(result);
        setLoading(false);

      } catch (err) {
        console.error('❌ TaskAssistant: Generation failed:', err);
        if (!isMounted) return;
        
        setError(err instanceof Error ? err.message : 'Failed to generate task breakdown');
        setLoading(false);
      }
    }

    generateAndPersistAssistant();

    return () => {
      isMounted = false;
    };
  }, [task.id]); // Only re-run when task ID changes

  return { assistantData, loading, error };
}
