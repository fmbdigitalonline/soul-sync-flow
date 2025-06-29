export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ab_test_assignments: {
        Row: {
          created_at: string
          id: string
          session_id: string
          variant: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_id: string
          variant: string
        }
        Update: {
          created_at?: string
          id?: string
          session_id?: string
          variant?: string
        }
        Relationships: []
      }
      ab_test_config: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean
          start_date: string
          test_id: string
          traffic_split: number
          updated_at: string
          winner_variant: string | null
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          start_date?: string
          test_id: string
          traffic_split?: number
          updated_at?: string
          winner_variant?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          start_date?: string
          test_id?: string
          traffic_split?: number
          updated_at?: string
          winner_variant?: string | null
        }
        Relationships: []
      }
      ab_test_conversions: {
        Row: {
          created_at: string
          event_data: Json | null
          event_name: string
          id: string
          session_id: string
          variant: string
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_name: string
          id?: string
          session_id: string
          variant: string
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_name?: string
          id?: string
          session_id?: string
          variant?: string
        }
        Relationships: []
      }
      ab_test_page_views: {
        Row: {
          created_at: string
          id: string
          page_url: string
          referrer: string | null
          session_id: string
          variant: string
        }
        Insert: {
          created_at?: string
          id?: string
          page_url: string
          referrer?: string | null
          session_id: string
          variant: string
        }
        Update: {
          created_at?: string
          id?: string
          page_url?: string
          referrer?: string | null
          session_id?: string
          variant?: string
        }
        Relationships: []
      }
      ab_test_scroll_depth: {
        Row: {
          created_at: string
          id: string
          scroll_depth: number
          session_id: string
          variant: string
        }
        Insert: {
          created_at?: string
          id?: string
          scroll_depth: number
          session_id: string
          variant: string
        }
        Update: {
          created_at?: string
          id?: string
          scroll_depth?: number
          session_id?: string
          variant?: string
        }
        Relationships: []
      }
      ab_test_time_on_page: {
        Row: {
          created_at: string
          id: string
          session_id: string
          time_on_page_seconds: number
          variant: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_id: string
          time_on_page_seconds: number
          variant: string
        }
        Update: {
          created_at?: string
          id?: string
          session_id?: string
          time_on_page_seconds?: number
          variant?: string
        }
        Relationships: []
      }
      acs_config: {
        Row: {
          config: Json
          created_at: string
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      acs_metrics: {
        Row: {
          confidence: number
          conversation_velocity: number
          delta_latency: number
          id: string
          sentiment_trend: number
          state_transition: string
          timestamp: string
          trigger: string
          user_id: string
          user_repair_rate: number
        }
        Insert: {
          confidence?: number
          conversation_velocity?: number
          delta_latency?: number
          id?: string
          sentiment_trend?: number
          state_transition: string
          timestamp?: string
          trigger: string
          user_id: string
          user_repair_rate?: number
        }
        Update: {
          confidence?: number
          conversation_velocity?: number
          delta_latency?: number
          id?: string
          sentiment_trend?: number
          state_transition?: string
          timestamp?: string
          trigger?: string
          user_id?: string
          user_repair_rate?: number
        }
        Relationships: []
      }
      adaptive_weight_matrices: {
        Row: {
          created_at: string
          id: string
          l2_norm: number
          last_rlhf_update: string | null
          negative_feedback_count: number
          positive_feedback_count: number
          update_count: number
          updated_at: string
          user_id: string
          weights: Json
        }
        Insert: {
          created_at?: string
          id?: string
          l2_norm?: number
          last_rlhf_update?: string | null
          negative_feedback_count?: number
          positive_feedback_count?: number
          update_count?: number
          updated_at?: string
          user_id: string
          weights?: Json
        }
        Update: {
          created_at?: string
          id?: string
          l2_norm?: number
          last_rlhf_update?: string | null
          negative_feedback_count?: number
          positive_feedback_count?: number
          update_count?: number
          updated_at?: string
          user_id?: string
          weights?: Json
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      blueprints: {
        Row: {
          archetype_chinese: Json
          archetype_western: Json
          bashar_suite: Json
          belief_logs: Json
          cognition_mbti: Json
          created_at: string
          energy_strategy_human_design: Json
          excitement_scores: Json
          goal_stack: Json
          id: string
          is_active: boolean
          metadata: Json
          task_graph: Json
          timing_overlays: Json
          updated_at: string
          user_id: string
          user_meta: Json
          values_life_path: Json
          vibration_check_ins: Json
        }
        Insert: {
          archetype_chinese: Json
          archetype_western: Json
          bashar_suite: Json
          belief_logs?: Json
          cognition_mbti: Json
          created_at?: string
          energy_strategy_human_design: Json
          excitement_scores?: Json
          goal_stack?: Json
          id?: string
          is_active?: boolean
          metadata: Json
          task_graph?: Json
          timing_overlays: Json
          updated_at?: string
          user_id: string
          user_meta: Json
          values_life_path: Json
          vibration_check_ins?: Json
        }
        Update: {
          archetype_chinese?: Json
          archetype_western?: Json
          bashar_suite?: Json
          belief_logs?: Json
          cognition_mbti?: Json
          created_at?: string
          energy_strategy_human_design?: Json
          excitement_scores?: Json
          goal_stack?: Json
          id?: string
          is_active?: boolean
          metadata?: Json
          task_graph?: Json
          timing_overlays?: Json
          updated_at?: string
          user_id?: string
          user_meta?: Json
          values_life_path?: Json
          vibration_check_ins?: Json
        }
        Relationships: []
      }
      coach_action_logs: {
        Row: {
          action_payload: Json
          action_type: string
          correlation_id: string | null
          duplicate_detection: Json | null
          execution_result: Json
          execution_time_ms: number | null
          id: string
          session_id: string
          timestamp: string
          triggered_by: string | null
          user_id: string
        }
        Insert: {
          action_payload?: Json
          action_type: string
          correlation_id?: string | null
          duplicate_detection?: Json | null
          execution_result?: Json
          execution_time_ms?: number | null
          id?: string
          session_id: string
          timestamp?: string
          triggered_by?: string | null
          user_id: string
        }
        Update: {
          action_payload?: Json
          action_type?: string
          correlation_id?: string | null
          duplicate_detection?: Json | null
          execution_result?: Json
          execution_time_ms?: number | null
          id?: string
          session_id?: string
          timestamp?: string
          triggered_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      conflict_resolution_contexts: {
        Row: {
          clarifying_questions: string[]
          conflict_scores: number[]
          conflicting_dimensions: number[]
          created_at: string
          framework_conflicts: Json
          id: string
          resolved: boolean
          session_id: string
          updated_at: string
          user_id: string
          user_resolution: Json | null
        }
        Insert: {
          clarifying_questions?: string[]
          conflict_scores: number[]
          conflicting_dimensions: number[]
          created_at?: string
          framework_conflicts?: Json
          id?: string
          resolved?: boolean
          session_id: string
          updated_at?: string
          user_id: string
          user_resolution?: Json | null
        }
        Update: {
          clarifying_questions?: string[]
          conflict_scores?: number[]
          conflicting_dimensions?: number[]
          created_at?: string
          framework_conflicts?: Json
          id?: string
          resolved?: boolean
          session_id?: string
          updated_at?: string
          user_id?: string
          user_resolution?: Json | null
        }
        Relationships: []
      }
      conversation_memory: {
        Row: {
          conversation_stage: string | null
          created_at: string | null
          domain: string | null
          id: string
          last_activity: string | null
          messages: Json
          mode: string | null
          recovery_context: Json | null
          session_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          conversation_stage?: string | null
          created_at?: string | null
          domain?: string | null
          id?: string
          last_activity?: string | null
          messages?: Json
          mode?: string | null
          recovery_context?: Json | null
          session_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          conversation_stage?: string | null
          created_at?: string | null
          domain?: string | null
          id?: string
          last_activity?: string | null
          messages?: Json
          mode?: string | null
          recovery_context?: Json | null
          session_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      dream_activity_logs: {
        Row: {
          activity_data: Json
          activity_type: string
          correlation_id: string | null
          error_info: Json | null
          id: string
          page_url: string | null
          session_id: string
          timestamp: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_data?: Json
          activity_type: string
          correlation_id?: string | null
          error_info?: Json | null
          id?: string
          page_url?: string | null
          session_id: string
          timestamp?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_data?: Json
          activity_type?: string
          correlation_id?: string | null
          error_info?: Json | null
          id?: string
          page_url?: string | null
          session_id?: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      encoder_versions: {
        Row: {
          calibration_params: Json
          checksum: string
          created_at: string
          encoder_weights: Json
          framework_name: string
          id: string
          is_active: boolean
          version: string
        }
        Insert: {
          calibration_params?: Json
          checksum: string
          created_at?: string
          encoder_weights: Json
          framework_name: string
          id?: string
          is_active?: boolean
          version: string
        }
        Update: {
          calibration_params?: Json
          checksum?: string
          created_at?: string
          encoder_weights?: Json
          framework_name?: string
          id?: string
          is_active?: boolean
          version?: string
        }
        Relationships: []
      }
      growth_journey: {
        Row: {
          created_at: string | null
          current_focus_areas: Json | null
          current_position: string | null
          growth_milestones: Json | null
          id: string
          insight_entries: Json | null
          last_reflection_date: string | null
          mood_entries: Json | null
          reflection_entries: Json | null
          spiritual_practices: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_focus_areas?: Json | null
          current_position?: string | null
          growth_milestones?: Json | null
          id?: string
          insight_entries?: Json | null
          last_reflection_date?: string | null
          mood_entries?: Json | null
          reflection_entries?: Json | null
          spiritual_practices?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_focus_areas?: Json | null
          current_position?: string | null
          growth_milestones?: Json | null
          id?: string
          insight_entries?: Json | null
          last_reflection_date?: string | null
          mood_entries?: Json | null
          reflection_entries?: Json | null
          spiritual_practices?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      growth_programs: {
        Row: {
          actual_completion: string | null
          blueprint_params: Json
          created_at: string
          current_week: number
          domain: string
          expected_completion: string
          id: string
          program_type: string
          progress_metrics: Json
          session_schedule: Json
          started_at: string
          status: string
          total_weeks: number
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_completion?: string | null
          blueprint_params?: Json
          created_at?: string
          current_week?: number
          domain: string
          expected_completion: string
          id?: string
          program_type: string
          progress_metrics?: Json
          session_schedule?: Json
          started_at?: string
          status?: string
          total_weeks: number
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_completion?: string | null
          blueprint_params?: Json
          created_at?: string
          current_week?: number
          domain?: string
          expected_completion?: string
          id?: string
          program_type?: string
          progress_metrics?: Json
          session_schedule?: Json
          started_at?: string
          status?: string
          total_weeks?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      growth_sessions: {
        Row: {
          completed_at: string | null
          id: string
          outcomes: Json
          program_id: string
          session_data: Json
          session_number: number
          session_type: string
          started_at: string
          week_number: number
        }
        Insert: {
          completed_at?: string | null
          id?: string
          outcomes?: Json
          program_id: string
          session_data?: Json
          session_number: number
          session_type: string
          started_at?: string
          week_number: number
        }
        Update: {
          completed_at?: string | null
          id?: string
          outcomes?: Json
          program_id?: string
          session_data?: Json
          session_number?: number
          session_type?: string
          started_at?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "growth_sessions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "growth_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      micro_action_reminders: {
        Row: {
          action_description: string | null
          action_title: string
          completion_notes: string | null
          created_at: string
          id: string
          reminder_type: string
          scheduled_for: string
          session_id: string
          snooze_until: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_description?: string | null
          action_title: string
          completion_notes?: string | null
          created_at?: string
          id?: string
          reminder_type?: string
          scheduled_for: string
          session_id: string
          snooze_until?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_description?: string | null
          action_title?: string
          completion_notes?: string | null
          created_at?: string
          id?: string
          reminder_type?: string
          scheduled_for?: string
          session_id?: string
          snooze_until?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      personality_answers: {
        Row: {
          answer: string
          blueprint_id: string
          created_at: string
          id: string
          item_code: string
        }
        Insert: {
          answer: string
          blueprint_id: string
          created_at?: string
          id?: string
          item_code: string
        }
        Update: {
          answer?: string
          blueprint_id?: string
          created_at?: string
          id?: string
          item_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "personality_answers_blueprint_id_fkey"
            columns: ["blueprint_id"]
            isOneToOne: false
            referencedRelation: "user_blueprints"
            referencedColumns: ["id"]
          },
        ]
      }
      personality_fusion_vectors: {
        Row: {
          astro_vector: number[] | null
          calibration_params: Json
          created_at: string
          encoder_checksums: Json
          fused_vector: number[] | null
          fusion_metadata: Json
          hd_vector: number[] | null
          id: string
          mbti_vector: number[] | null
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          astro_vector?: number[] | null
          calibration_params?: Json
          created_at?: string
          encoder_checksums?: Json
          fused_vector?: number[] | null
          fusion_metadata?: Json
          hd_vector?: number[] | null
          id?: string
          mbti_vector?: number[] | null
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          astro_vector?: number[] | null
          calibration_params?: Json
          created_at?: string
          encoder_checksums?: Json
          fused_vector?: number[] | null
          fusion_metadata?: Json
          hd_vector?: number[] | null
          id?: string
          mbti_vector?: number[] | null
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      personality_scores: {
        Row: {
          big5: Json
          big5_confidence: Json
          blueprint_id: string
          enneagram_probabilities: Json | null
          last_updated: string
          mbti_probabilities: Json
        }
        Insert: {
          big5?: Json
          big5_confidence?: Json
          blueprint_id: string
          enneagram_probabilities?: Json | null
          last_updated?: string
          mbti_probabilities?: Json
        }
        Update: {
          big5?: Json
          big5_confidence?: Json
          blueprint_id?: string
          enneagram_probabilities?: Json | null
          last_updated?: string
          mbti_probabilities?: Json
        }
        Relationships: [
          {
            foreignKeyName: "personality_scores_blueprint_id_fkey"
            columns: ["blueprint_id"]
            isOneToOne: true
            referencedRelation: "user_blueprints"
            referencedColumns: ["id"]
          },
        ]
      }
      personas: {
        Row: {
          blueprint_signature: string | null
          blueprint_version: string
          created_at: string
          function_permissions: Json
          generated_at: string
          humor_profile: Json
          id: string
          system_prompt: string
          template_version: string | null
          updated_at: string
          user_id: string
          voice_tokens: Json
        }
        Insert: {
          blueprint_signature?: string | null
          blueprint_version?: string
          created_at?: string
          function_permissions?: Json
          generated_at?: string
          humor_profile?: Json
          id?: string
          system_prompt: string
          template_version?: string | null
          updated_at?: string
          user_id: string
          voice_tokens?: Json
        }
        Update: {
          blueprint_signature?: string | null
          blueprint_version?: string
          created_at?: string
          function_permissions?: Json
          generated_at?: string
          humor_profile?: Json
          id?: string
          system_prompt?: string
          template_version?: string | null
          updated_at?: string
          user_id?: string
          voice_tokens?: Json
        }
        Relationships: []
      }
      productivity_journey: {
        Row: {
          completed_goals: Json | null
          completed_tasks: Json | null
          created_at: string | null
          current_goals: Json | null
          current_position: string | null
          current_tasks: Json | null
          focus_sessions: Json | null
          id: string
          journey_milestones: Json | null
          last_activity_date: string | null
          productivity_metrics: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_goals?: Json | null
          completed_tasks?: Json | null
          created_at?: string | null
          current_goals?: Json | null
          current_position?: string | null
          current_tasks?: Json | null
          focus_sessions?: Json | null
          id?: string
          journey_milestones?: Json | null
          last_activity_date?: string | null
          productivity_metrics?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_goals?: Json | null
          completed_tasks?: Json | null
          created_at?: string | null
          current_goals?: Json | null
          current_position?: string | null
          current_tasks?: Json | null
          focus_sessions?: Json | null
          id?: string
          journey_milestones?: Json | null
          last_activity_date?: string | null
          productivity_metrics?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      session_feedback: {
        Row: {
          created_at: string
          feedback_text: string | null
          id: string
          improvement_suggestions: Json | null
          rating: number
          session_id: string
          session_summary: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          improvement_suggestions?: Json | null
          rating: number
          session_id: string
          session_summary?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          improvement_suggestions?: Json | null
          rating?: number
          session_id?: string
          session_summary?: string | null
          user_id?: string
        }
        Relationships: []
      }
      task_coach_session_logs: {
        Row: {
          actions_executed: number | null
          id: string
          messages_count: number | null
          performance_metrics: Json | null
          session_data: Json
          session_end: string | null
          session_id: string
          session_start: string
          task_id: string
          task_title: string
          user_id: string
        }
        Insert: {
          actions_executed?: number | null
          id?: string
          messages_count?: number | null
          performance_metrics?: Json | null
          session_data?: Json
          session_end?: string | null
          session_id: string
          session_start?: string
          task_id: string
          task_title: string
          user_id: string
        }
        Update: {
          actions_executed?: number | null
          id?: string
          messages_count?: number | null
          performance_metrics?: Json | null
          session_data?: Json
          session_end?: string | null
          session_id?: string
          session_start?: string
          task_id?: string
          task_title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          activity_data: Json
          activity_type: string
          created_at: string
          id: string
          points_earned: number | null
          user_id: string
        }
        Insert: {
          activity_data?: Json
          activity_type: string
          created_at?: string
          id?: string
          points_earned?: number | null
          user_id: string
        }
        Update: {
          activity_data?: Json
          activity_type?: string
          created_at?: string
          id?: string
          points_earned?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_blueprints: {
        Row: {
          blueprint: Json
          created_at: string
          id: string
          is_active: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          blueprint: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          blueprint?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          aligned_traits: Json | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          milestones: Json | null
          progress: number | null
          status: string | null
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          aligned_traits?: Json | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          milestones?: Json | null
          progress?: number | null
          status?: string | null
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          aligned_traits?: Json | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          milestones?: Json | null
          progress?: number | null
          status?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_life_context: {
        Row: {
          celebration_moments: Json | null
          context_category: string
          created_at: string
          current_focus: string | null
          id: string
          last_updated: string
          next_steps: Json | null
          ongoing_challenges: Json | null
          recent_progress: Json | null
          user_id: string
        }
        Insert: {
          celebration_moments?: Json | null
          context_category: string
          created_at?: string
          current_focus?: string | null
          id?: string
          last_updated?: string
          next_steps?: Json | null
          ongoing_challenges?: Json | null
          recent_progress?: Json | null
          user_id: string
        }
        Update: {
          celebration_moments?: Json | null
          context_category?: string
          created_at?: string
          current_focus?: string | null
          id?: string
          last_updated?: string
          next_steps?: Json | null
          ongoing_challenges?: Json | null
          recent_progress?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_session_memory: {
        Row: {
          context_summary: string | null
          created_at: string
          id: string
          importance_score: number | null
          last_referenced: string | null
          memory_data: Json
          memory_type: string
          session_id: string
          user_id: string
        }
        Insert: {
          context_summary?: string | null
          created_at?: string
          id?: string
          importance_score?: number | null
          last_referenced?: string | null
          memory_data?: Json
          memory_type: string
          session_id: string
          user_id: string
        }
        Update: {
          context_summary?: string | null
          created_at?: string
          id?: string
          importance_score?: number | null
          last_referenced?: string | null
          memory_data?: Json
          memory_type?: string
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_statistics: {
        Row: {
          coach_conversations: number | null
          current_streak: number | null
          focus_sessions_completed: number | null
          id: string
          longest_streak: number | null
          most_productive_day: string | null
          preferred_focus_time: string | null
          tasks_completed: number | null
          total_points: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          coach_conversations?: number | null
          current_streak?: number | null
          focus_sessions_completed?: number | null
          id?: string
          longest_streak?: number | null
          most_productive_day?: string | null
          preferred_focus_time?: string | null
          tasks_completed?: number | null
          total_points?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          coach_conversations?: number | null
          current_streak?: number | null
          focus_sessions_completed?: number | null
          id?: string
          longest_streak?: number | null
          most_productive_day?: string | null
          preferred_focus_time?: string | null
          tasks_completed?: number | null
          total_points?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      waitlist_entries: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          source: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          source: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          source?: string
        }
        Relationships: []
      }
      waitlist_spots: {
        Row: {
          created_at: string | null
          id: string
          recent_joins: number
          taken_spots: number
          total_spots: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          recent_joins?: number
          taken_spots?: number
          total_spots?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          recent_joins?: number
          taken_spots?: number
          total_spots?: number
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_admin_status: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      cleanup_old_memories: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_blueprint_signature: {
        Args: { blueprint_data: Json }
        Returns: string
      }
      get_active_user_blueprint: {
        Args: { user_uuid: string }
        Returns: Json
      }
      handle_admin_check: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
