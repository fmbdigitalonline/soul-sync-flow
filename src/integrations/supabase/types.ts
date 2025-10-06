export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      acs_error_logs: {
        Row: {
          acs_version: string | null
          context_data: Json | null
          created_at: string | null
          error_message: string
          error_type: string
          fallback_used: boolean | null
          id: string
          session_id: string
          stack_trace: string | null
          user_id: string | null
        }
        Insert: {
          acs_version?: string | null
          context_data?: Json | null
          created_at?: string | null
          error_message: string
          error_type: string
          fallback_used?: boolean | null
          id?: string
          session_id: string
          stack_trace?: string | null
          user_id?: string | null
        }
        Update: {
          acs_version?: string | null
          context_data?: Json | null
          created_at?: string | null
          error_message?: string
          error_type?: string
          fallback_used?: boolean | null
          id?: string
          session_id?: string
          stack_trace?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      acs_intervention_logs: {
        Row: {
          created_at: string | null
          error_details: string | null
          from_state: string
          id: string
          intervention_data: Json | null
          intervention_type: string
          session_id: string
          success: boolean | null
          suppressed_until_turn: number | null
          to_state: string
          trigger_reason: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_details?: string | null
          from_state: string
          id?: string
          intervention_data?: Json | null
          intervention_type: string
          session_id: string
          success?: boolean | null
          suppressed_until_turn?: number | null
          to_state: string
          trigger_reason: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_details?: string | null
          from_state?: string
          id?: string
          intervention_data?: Json | null
          intervention_type?: string
          session_id?: string
          success?: boolean | null
          suppressed_until_turn?: number | null
          to_state?: string
          trigger_reason?: string
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
      admin_action_logs: {
        Row: {
          action_details: Json | null
          action_type: string
          admin_user_id: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          target_resource: string | null
          user_agent: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          admin_user_id: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          target_resource?: string | null
          user_agent?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          admin_user_id?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          target_resource?: string | null
          user_agent?: string | null
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
      blueprint_facts: {
        Row: {
          confidence: number | null
          created_at: string
          facet: string
          id: string
          key: string
          source_spans: Json | null
          updated_at: string
          user_id: string
          value_json: Json
          version: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          facet: string
          id?: string
          key: string
          source_spans?: Json | null
          updated_at?: string
          user_id: string
          value_json: Json
          version?: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          facet?: string
          id?: string
          key?: string
          source_spans?: Json | null
          updated_at?: string
          user_id?: string
          value_json?: Json
          version?: string
        }
        Relationships: []
      }
      blueprint_text_embeddings: {
        Row: {
          chunk_content: string
          chunk_hash: string
          chunk_index: number
          created_at: string
          embedding: string
          facet: string | null
          heading: string | null
          id: string
          paragraph_index: number | null
          source_report_id: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chunk_content: string
          chunk_hash: string
          chunk_index: number
          created_at?: string
          embedding: string
          facet?: string | null
          heading?: string | null
          id?: string
          paragraph_index?: number | null
          source_report_id?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chunk_content?: string
          chunk_hash?: string
          chunk_index?: number
          created_at?: string
          embedding?: string
          facet?: string | null
          heading?: string | null
          id?: string
          paragraph_index?: number | null
          source_report_id?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blueprint_text_embeddings_source_report_id_fkey"
            columns: ["source_report_id"]
            isOneToOne: false
            referencedRelation: "personality_reports"
            referencedColumns: ["id"]
          },
        ]
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
          steward_introduction_completed: boolean | null
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
          steward_introduction_completed?: boolean | null
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
          steward_introduction_completed?: boolean | null
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
      conversation_messages: {
        Row: {
          client_msg_id: string
          content: string
          conversation_id: string
          correlation_id: string | null
          created_at: string | null
          id: string
          pipeline_id: string | null
          role: string
          session_id: string
          status: string | null
          step_seq: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_msg_id: string
          content: string
          conversation_id: string
          correlation_id?: string | null
          created_at?: string | null
          id?: string
          pipeline_id?: string | null
          role: string
          session_id: string
          status?: string | null
          step_seq?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_msg_id?: string
          content?: string
          conversation_id?: string
          correlation_id?: string | null
          created_at?: string | null
          id?: string
          pipeline_id?: string | null
          role?: string
          session_id?: string
          status?: string | null
          step_seq?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      conversation_summaries: {
        Row: {
          compression_ratio: number | null
          created_at: string
          emotional_arc: string | null
          id: string
          key_insights: string[] | null
          message_range_end: string
          message_range_start: string
          summary_content: string
          summary_embedding: string | null
          summary_level: number
          summary_type: string | null
          thread_id: string
          topic_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          compression_ratio?: number | null
          created_at?: string
          emotional_arc?: string | null
          id?: string
          key_insights?: string[] | null
          message_range_end: string
          message_range_start: string
          summary_content: string
          summary_embedding?: string | null
          summary_level: number
          summary_type?: string | null
          thread_id: string
          topic_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          compression_ratio?: number | null
          created_at?: string
          emotional_arc?: string | null
          id?: string
          key_insights?: string[] | null
          message_range_end?: string
          message_range_start?: string
          summary_content?: string
          summary_embedding?: string | null
          summary_level?: number
          summary_type?: string | null
          thread_id?: string
          topic_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_summaries_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "conversation_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_threads: {
        Row: {
          context_fingerprint: string | null
          created_at: string
          id: string
          last_activity: string
          mode: string
          status: string
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          context_fingerprint?: string | null
          created_at?: string
          id?: string
          last_activity?: string
          mode: string
          status?: string
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          context_fingerprint?: string | null
          created_at?: string
          id?: string
          last_activity?: string
          mode?: string
          status?: string
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      conversation_topics: {
        Row: {
          confidence_score: number | null
          created_at: string
          end_message_id: string | null
          id: string
          is_active: boolean | null
          message_count: number | null
          start_message_id: string
          thread_id: string
          topic_description: string | null
          topic_embedding: string | null
          topic_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          end_message_id?: string | null
          id?: string
          is_active?: boolean | null
          message_count?: number | null
          start_message_id: string
          thread_id: string
          topic_description?: string | null
          topic_embedding?: string | null
          topic_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          end_message_id?: string | null
          id?: string
          is_active?: boolean | null
          message_count?: number | null
          start_message_id?: string
          thread_id?: string
          topic_description?: string | null
          topic_embedding?: string | null
          topic_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      domain_interdependencies: {
        Row: {
          created_at: string
          from_domain: string
          id: string
          relationship_type: string
          strength: number
          to_domain: string
        }
        Insert: {
          created_at?: string
          from_domain: string
          id?: string
          relationship_type: string
          strength?: number
          to_domain: string
        }
        Update: {
          created_at?: string
          from_domain?: string
          id?: string
          relationship_type?: string
          strength?: number
          to_domain?: string
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
      generation_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          expires_at: string
          id: string
          job_data: Json
          job_type: string
          progress: Json
          result: Json | null
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          expires_at?: string
          id?: string
          job_data?: Json
          job_type: string
          progress?: Json
          result?: Json | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          expires_at?: string
          id?: string
          job_data?: Json
          job_type?: string
          progress?: Json
          result?: Json | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
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
          adaptation_history: Json
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
          adaptation_history?: Json
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
          adaptation_history?: Json
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
      hacs_blend_conversations: {
        Row: {
          context_summary: string | null
          conversation_data: Json
          created_at: string
          id: string
          intelligence_level_end: number | null
          intelligence_level_start: number | null
          last_activity: string
          session_id: string
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          context_summary?: string | null
          conversation_data?: Json
          created_at?: string
          id?: string
          intelligence_level_end?: number | null
          intelligence_level_start?: number | null
          last_activity?: string
          session_id: string
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          context_summary?: string | null
          conversation_data?: Json
          created_at?: string
          id?: string
          intelligence_level_end?: number | null
          intelligence_level_start?: number | null
          last_activity?: string
          session_id?: string
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hacs_blend_intelligence: {
        Row: {
          created_at: string | null
          id: string
          intelligence_level: number | null
          interaction_count: number | null
          last_update: string | null
          module_scores: Json | null
          pie_score: number | null
          tmg_score: number | null
          updated_at: string | null
          user_id: string
          vfp_score: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          intelligence_level?: number | null
          interaction_count?: number | null
          last_update?: string | null
          module_scores?: Json | null
          pie_score?: number | null
          tmg_score?: number | null
          updated_at?: string | null
          user_id: string
          vfp_score?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          intelligence_level?: number | null
          interaction_count?: number | null
          last_update?: string | null
          module_scores?: Json | null
          pie_score?: number | null
          tmg_score?: number | null
          updated_at?: string | null
          user_id?: string
          vfp_score?: number | null
        }
        Relationships: []
      }
      hacs_blend_questions: {
        Row: {
          answered_at: string | null
          asked_at: string
          conversation_id: string | null
          created_at: string
          generated_context: Json
          hacs_module: string
          id: string
          intelligence_level_when_asked: number
          learning_value: number | null
          question_text: string
          question_type: string
          response_quality_score: number | null
          user_id: string
          user_response: string | null
        }
        Insert: {
          answered_at?: string | null
          asked_at?: string
          conversation_id?: string | null
          created_at?: string
          generated_context?: Json
          hacs_module: string
          id?: string
          intelligence_level_when_asked: number
          learning_value?: number | null
          question_text: string
          question_type: string
          response_quality_score?: number | null
          user_id: string
          user_response?: string | null
        }
        Update: {
          answered_at?: string | null
          asked_at?: string
          conversation_id?: string | null
          created_at?: string
          generated_context?: Json
          hacs_module?: string
          id?: string
          intelligence_level_when_asked?: number
          learning_value?: number | null
          question_text?: string
          question_type?: string
          response_quality_score?: number | null
          user_id?: string
          user_response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hacs_blend_questions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "hacs_blend_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      hacs_coach_conversations: {
        Row: {
          context_summary: string | null
          conversation_data: Json
          created_at: string
          id: string
          intelligence_level_end: number | null
          intelligence_level_start: number | null
          last_activity: string
          session_id: string
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          context_summary?: string | null
          conversation_data?: Json
          created_at?: string
          id?: string
          intelligence_level_end?: number | null
          intelligence_level_start?: number | null
          last_activity?: string
          session_id: string
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          context_summary?: string | null
          conversation_data?: Json
          created_at?: string
          id?: string
          intelligence_level_end?: number | null
          intelligence_level_start?: number | null
          last_activity?: string
          session_id?: string
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hacs_coach_intelligence: {
        Row: {
          created_at: string | null
          id: string
          intelligence_level: number | null
          interaction_count: number | null
          last_update: string | null
          module_scores: Json | null
          pie_score: number | null
          tmg_score: number | null
          updated_at: string | null
          user_id: string
          vfp_score: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          intelligence_level?: number | null
          interaction_count?: number | null
          last_update?: string | null
          module_scores?: Json | null
          pie_score?: number | null
          tmg_score?: number | null
          updated_at?: string | null
          user_id: string
          vfp_score?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          intelligence_level?: number | null
          interaction_count?: number | null
          last_update?: string | null
          module_scores?: Json | null
          pie_score?: number | null
          tmg_score?: number | null
          updated_at?: string | null
          user_id?: string
          vfp_score?: number | null
        }
        Relationships: []
      }
      hacs_coach_questions: {
        Row: {
          answered_at: string | null
          asked_at: string
          conversation_id: string | null
          created_at: string
          generated_context: Json
          hacs_module: string
          id: string
          intelligence_level_when_asked: number
          learning_value: number | null
          question_text: string
          question_type: string
          response_quality_score: number | null
          user_id: string
          user_response: string | null
        }
        Insert: {
          answered_at?: string | null
          asked_at?: string
          conversation_id?: string | null
          created_at?: string
          generated_context?: Json
          hacs_module: string
          id?: string
          intelligence_level_when_asked: number
          learning_value?: number | null
          question_text: string
          question_type: string
          response_quality_score?: number | null
          user_id: string
          user_response?: string | null
        }
        Update: {
          answered_at?: string | null
          asked_at?: string
          conversation_id?: string | null
          created_at?: string
          generated_context?: Json
          hacs_module?: string
          id?: string
          intelligence_level_when_asked?: number
          learning_value?: number | null
          question_text?: string
          question_type?: string
          response_quality_score?: number | null
          user_id?: string
          user_response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hacs_coach_questions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "hacs_coach_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      hacs_conversations: {
        Row: {
          context_summary: string | null
          conversation_data: Json
          created_at: string
          id: string
          intelligence_level_end: number | null
          intelligence_level_start: number | null
          last_activity: string
          session_id: string
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          context_summary?: string | null
          conversation_data?: Json
          created_at?: string
          id?: string
          intelligence_level_end?: number | null
          intelligence_level_start?: number | null
          last_activity?: string
          session_id: string
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          context_summary?: string | null
          conversation_data?: Json
          created_at?: string
          id?: string
          intelligence_level_end?: number | null
          intelligence_level_start?: number | null
          last_activity?: string
          session_id?: string
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hacs_dream_conversations: {
        Row: {
          context_summary: string | null
          conversation_data: Json
          created_at: string
          id: string
          intelligence_level_end: number | null
          intelligence_level_start: number | null
          last_activity: string
          session_id: string
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          context_summary?: string | null
          conversation_data?: Json
          created_at?: string
          id?: string
          intelligence_level_end?: number | null
          intelligence_level_start?: number | null
          last_activity?: string
          session_id: string
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          context_summary?: string | null
          conversation_data?: Json
          created_at?: string
          id?: string
          intelligence_level_end?: number | null
          intelligence_level_start?: number | null
          last_activity?: string
          session_id?: string
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hacs_dream_intelligence: {
        Row: {
          created_at: string | null
          id: string
          intelligence_level: number | null
          interaction_count: number | null
          last_update: string | null
          module_scores: Json | null
          pie_score: number | null
          tmg_score: number | null
          updated_at: string | null
          user_id: string
          vfp_score: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          intelligence_level?: number | null
          interaction_count?: number | null
          last_update?: string | null
          module_scores?: Json | null
          pie_score?: number | null
          tmg_score?: number | null
          updated_at?: string | null
          user_id: string
          vfp_score?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          intelligence_level?: number | null
          interaction_count?: number | null
          last_update?: string | null
          module_scores?: Json | null
          pie_score?: number | null
          tmg_score?: number | null
          updated_at?: string | null
          user_id?: string
          vfp_score?: number | null
        }
        Relationships: []
      }
      hacs_dream_questions: {
        Row: {
          answered_at: string | null
          asked_at: string
          conversation_id: string | null
          created_at: string
          generated_context: Json
          hacs_module: string
          id: string
          intelligence_level_when_asked: number
          learning_value: number | null
          question_text: string
          question_type: string
          response_quality_score: number | null
          user_id: string
          user_response: string | null
        }
        Insert: {
          answered_at?: string | null
          asked_at?: string
          conversation_id?: string | null
          created_at?: string
          generated_context?: Json
          hacs_module: string
          id?: string
          intelligence_level_when_asked: number
          learning_value?: number | null
          question_text: string
          question_type: string
          response_quality_score?: number | null
          user_id: string
          user_response?: string | null
        }
        Update: {
          answered_at?: string | null
          asked_at?: string
          conversation_id?: string | null
          created_at?: string
          generated_context?: Json
          hacs_module?: string
          id?: string
          intelligence_level_when_asked?: number
          learning_value?: number | null
          question_text?: string
          question_type?: string
          response_quality_score?: number | null
          user_id?: string
          user_response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hacs_dream_questions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "hacs_dream_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      hacs_growth_conversations: {
        Row: {
          context_summary: string | null
          conversation_data: Json
          created_at: string
          id: string
          intelligence_level_end: number | null
          intelligence_level_start: number | null
          last_activity: string
          session_id: string
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          context_summary?: string | null
          conversation_data?: Json
          created_at?: string
          id?: string
          intelligence_level_end?: number | null
          intelligence_level_start?: number | null
          last_activity?: string
          session_id: string
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          context_summary?: string | null
          conversation_data?: Json
          created_at?: string
          id?: string
          intelligence_level_end?: number | null
          intelligence_level_start?: number | null
          last_activity?: string
          session_id?: string
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hacs_growth_intelligence: {
        Row: {
          created_at: string | null
          id: string
          intelligence_level: number | null
          interaction_count: number | null
          last_update: string | null
          module_scores: Json | null
          pie_score: number | null
          tmg_score: number | null
          updated_at: string | null
          user_id: string
          vfp_score: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          intelligence_level?: number | null
          interaction_count?: number | null
          last_update?: string | null
          module_scores?: Json | null
          pie_score?: number | null
          tmg_score?: number | null
          updated_at?: string | null
          user_id: string
          vfp_score?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          intelligence_level?: number | null
          interaction_count?: number | null
          last_update?: string | null
          module_scores?: Json | null
          pie_score?: number | null
          tmg_score?: number | null
          updated_at?: string | null
          user_id?: string
          vfp_score?: number | null
        }
        Relationships: []
      }
      hacs_growth_questions: {
        Row: {
          answered_at: string | null
          asked_at: string
          conversation_id: string | null
          created_at: string
          generated_context: Json
          hacs_module: string
          id: string
          intelligence_level_when_asked: number
          learning_value: number | null
          question_text: string
          question_type: string
          response_quality_score: number | null
          user_id: string
          user_response: string | null
        }
        Insert: {
          answered_at?: string | null
          asked_at?: string
          conversation_id?: string | null
          created_at?: string
          generated_context?: Json
          hacs_module: string
          id?: string
          intelligence_level_when_asked: number
          learning_value?: number | null
          question_text: string
          question_type: string
          response_quality_score?: number | null
          user_id: string
          user_response?: string | null
        }
        Update: {
          answered_at?: string | null
          asked_at?: string
          conversation_id?: string | null
          created_at?: string
          generated_context?: Json
          hacs_module?: string
          id?: string
          intelligence_level_when_asked?: number
          learning_value?: number | null
          question_text?: string
          question_type?: string
          response_quality_score?: number | null
          user_id?: string
          user_response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hacs_growth_questions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "hacs_growth_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      hacs_intelligence: {
        Row: {
          created_at: string | null
          id: string
          intelligence_level: number | null
          interaction_count: number | null
          last_update: string | null
          module_scores: Json | null
          pie_score: number | null
          tmg_score: number | null
          updated_at: string | null
          user_id: string | null
          vfp_score: number | null
        }
        Insert: {
          created_at?: string | null
          id: string
          intelligence_level?: number | null
          interaction_count?: number | null
          last_update?: string | null
          module_scores?: Json | null
          pie_score?: number | null
          tmg_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          vfp_score?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          intelligence_level?: number | null
          interaction_count?: number | null
          last_update?: string | null
          module_scores?: Json | null
          pie_score?: number | null
          tmg_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          vfp_score?: number | null
        }
        Relationships: []
      }
      hacs_intelligence_backup: {
        Row: {
          created_at: string | null
          id: string | null
          intelligence_level: number | null
          interaction_count: number | null
          last_update: string | null
          module_scores: Json | null
          pie_score: number | null
          tmg_score: number | null
          updated_at: string | null
          user_id: string | null
          vfp_score: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          intelligence_level?: number | null
          interaction_count?: number | null
          last_update?: string | null
          module_scores?: Json | null
          pie_score?: number | null
          tmg_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          vfp_score?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          intelligence_level?: number | null
          interaction_count?: number | null
          last_update?: string | null
          module_scores?: Json | null
          pie_score?: number | null
          tmg_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          vfp_score?: number | null
        }
        Relationships: []
      }
      hacs_intelligence_corrupted: {
        Row: {
          created_at: string
          id: string
          intelligence_level: number
          interaction_count: number
          last_update: string
          module_scores: Json
          pie_score: number | null
          tmg_score: number | null
          updated_at: string
          user_id: string
          vfp_score: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          intelligence_level?: number
          interaction_count?: number
          last_update?: string
          module_scores?: Json
          pie_score?: number | null
          tmg_score?: number | null
          updated_at?: string
          user_id: string
          vfp_score?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          intelligence_level?: number
          interaction_count?: number
          last_update?: string
          module_scores?: Json
          pie_score?: number | null
          tmg_score?: number | null
          updated_at?: string
          user_id?: string
          vfp_score?: number | null
        }
        Relationships: []
      }
      hacs_interaction_patterns: {
        Row: {
          created_at: string
          id: string
          last_updated: string
          pattern_data: Json
          pattern_type: string
          sample_size: number | null
          success_rate: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_updated?: string
          pattern_data?: Json
          pattern_type: string
          sample_size?: number | null
          success_rate?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_updated?: string
          pattern_data?: Json
          pattern_type?: string
          sample_size?: number | null
          success_rate?: number | null
          user_id?: string
        }
        Relationships: []
      }
      hacs_learning_feedback: {
        Row: {
          conversation_id: string | null
          created_at: string
          feedback_text: string | null
          feedback_type: string
          feedback_value: Json
          id: string
          intelligence_impact: number | null
          message_id: string | null
          module_affected: string | null
          question_id: string | null
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          feedback_text?: string | null
          feedback_type: string
          feedback_value?: Json
          id?: string
          intelligence_impact?: number | null
          message_id?: string | null
          module_affected?: string | null
          question_id?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          feedback_text?: string | null
          feedback_type?: string
          feedback_value?: Json
          id?: string
          intelligence_impact?: number | null
          message_id?: string | null
          module_affected?: string | null
          question_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hacs_learning_feedback_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "hacs_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hacs_learning_feedback_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "hacs_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      hacs_module_insights: {
        Row: {
          confidence_score: number | null
          created_at: string
          hacs_module: string
          id: string
          insight_data: Json
          insight_type: string
          last_validated: string | null
          updated_at: string
          user_id: string
          validation_count: number | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          hacs_module: string
          id?: string
          insight_data?: Json
          insight_type: string
          last_validated?: string | null
          updated_at?: string
          user_id: string
          validation_count?: number | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          hacs_module?: string
          id?: string
          insight_data?: Json
          insight_type?: string
          last_validated?: string | null
          updated_at?: string
          user_id?: string
          validation_count?: number | null
        }
        Relationships: []
      }
      hacs_questions: {
        Row: {
          answered_at: string | null
          asked_at: string
          conversation_id: string | null
          created_at: string
          generated_context: Json
          hacs_module: string
          id: string
          intelligence_level_when_asked: number
          learning_value: number | null
          question_text: string
          question_type: string
          response_quality_score: number | null
          user_id: string
          user_response: string | null
        }
        Insert: {
          answered_at?: string | null
          asked_at?: string
          conversation_id?: string | null
          created_at?: string
          generated_context?: Json
          hacs_module: string
          id?: string
          intelligence_level_when_asked: number
          learning_value?: number | null
          question_text: string
          question_type: string
          response_quality_score?: number | null
          user_id: string
          user_response?: string | null
        }
        Update: {
          answered_at?: string | null
          asked_at?: string
          conversation_id?: string | null
          created_at?: string
          generated_context?: Json
          hacs_module?: string
          id?: string
          intelligence_level_when_asked?: number
          learning_value?: number | null
          question_text?: string
          question_type?: string
          response_quality_score?: number | null
          user_id?: string
          user_response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hacs_questions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "hacs_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      hermetic_processing_jobs: {
        Row: {
          blueprint_data: Json | null
          completed_at: string | null
          completed_steps: Json
          created_at: string
          current_phase: number
          current_stage: string | null
          current_step: string | null
          current_step_index: number | null
          error_message: string | null
          id: string
          job_type: string
          language: string
          last_heartbeat: string | null
          memory_usage_mb: number | null
          progress_data: Json | null
          progress_percentage: number
          result_data: Json | null
          started_at: string | null
          status: string
          status_message: string | null
          total_phases: number
          updated_at: string
          user_id: string
        }
        Insert: {
          blueprint_data?: Json | null
          completed_at?: string | null
          completed_steps?: Json
          created_at?: string
          current_phase?: number
          current_stage?: string | null
          current_step?: string | null
          current_step_index?: number | null
          error_message?: string | null
          id?: string
          job_type?: string
          language?: string
          last_heartbeat?: string | null
          memory_usage_mb?: number | null
          progress_data?: Json | null
          progress_percentage?: number
          result_data?: Json | null
          started_at?: string | null
          status?: string
          status_message?: string | null
          total_phases?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          blueprint_data?: Json | null
          completed_at?: string | null
          completed_steps?: Json
          created_at?: string
          current_phase?: number
          current_stage?: string | null
          current_step?: string | null
          current_step_index?: number | null
          error_message?: string | null
          id?: string
          job_type?: string
          language?: string
          last_heartbeat?: string | null
          memory_usage_mb?: number | null
          progress_data?: Json | null
          progress_percentage?: number
          result_data?: Json | null
          started_at?: string | null
          status?: string
          status_message?: string | null
          total_phases?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hermetic_structured_intelligence: {
        Row: {
          adaptive_feedback: Json
          attachment_style: Json
          behavioral_triggers: Json
          career_vocational: Json
          cognitive_functions: Json
          compatibility: Json
          created_at: string
          crisis_handling: Json
          execution_bias: Json
          extraction_confidence: number
          extraction_version: string
          financial_archetype: Json
          goal_archetypes: Json
          health_wellness: Json
          id: string
          identity_constructs: Json
          identity_flexibility: Json
          internal_conflicts: Json
          karmic_patterns: Json
          linguistic_fingerprint: Json
          metacognitive_biases: Json
          personality_report_id: string | null
          processing_notes: Json | null
          spiritual_dimension: Json
          temporal_biology: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          adaptive_feedback?: Json
          attachment_style?: Json
          behavioral_triggers?: Json
          career_vocational?: Json
          cognitive_functions?: Json
          compatibility?: Json
          created_at?: string
          crisis_handling?: Json
          execution_bias?: Json
          extraction_confidence?: number
          extraction_version?: string
          financial_archetype?: Json
          goal_archetypes?: Json
          health_wellness?: Json
          id?: string
          identity_constructs?: Json
          identity_flexibility?: Json
          internal_conflicts?: Json
          karmic_patterns?: Json
          linguistic_fingerprint?: Json
          metacognitive_biases?: Json
          personality_report_id?: string | null
          processing_notes?: Json | null
          spiritual_dimension?: Json
          temporal_biology?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          adaptive_feedback?: Json
          attachment_style?: Json
          behavioral_triggers?: Json
          career_vocational?: Json
          cognitive_functions?: Json
          compatibility?: Json
          created_at?: string
          crisis_handling?: Json
          execution_bias?: Json
          extraction_confidence?: number
          extraction_version?: string
          financial_archetype?: Json
          goal_archetypes?: Json
          health_wellness?: Json
          id?: string
          identity_constructs?: Json
          identity_flexibility?: Json
          internal_conflicts?: Json
          karmic_patterns?: Json
          linguistic_fingerprint?: Json
          metacognitive_biases?: Json
          personality_report_id?: string | null
          processing_notes?: Json | null
          spiritual_dimension?: Json
          temporal_biology?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hermetic_structured_intelligence_personality_report_id_fkey"
            columns: ["personality_report_id"]
            isOneToOne: false
            referencedRelation: "personality_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      hermetic_sub_jobs: {
        Row: {
          agent_name: string
          completed_at: string | null
          content: string | null
          created_at: string | null
          error_message: string | null
          id: string
          job_id: string
          stage: string
          started_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          word_count: number | null
        }
        Insert: {
          agent_name: string
          completed_at?: string | null
          content?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_id: string
          stage: string
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          word_count?: number | null
        }
        Update: {
          agent_name?: string
          completed_at?: string | null
          content?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_id?: string
          stage?: string
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          word_count?: number | null
        }
        Relationships: []
      }
      hot_memory_cache: {
        Row: {
          access_count: number
          cache_key: string
          content_hash: string
          created_at: string
          expires_at: string
          id: string
          importance_score: number
          last_accessed: string
          raw_content: Json
          session_id: string
          user_id: string
        }
        Insert: {
          access_count?: number
          cache_key: string
          content_hash: string
          created_at?: string
          expires_at?: string
          id?: string
          importance_score?: number
          last_accessed?: string
          raw_content?: Json
          session_id: string
          user_id: string
        }
        Update: {
          access_count?: number
          cache_key?: string
          content_hash?: string
          created_at?: string
          expires_at?: string
          id?: string
          importance_score?: number
          last_accessed?: string
          raw_content?: Json
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      intelligence_reports: {
        Row: {
          created_at: string
          generated_at: string
          id: string
          report_content: Json
          report_version: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          generated_at?: string
          id?: string
          report_content?: Json
          report_version?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          generated_at?: string
          id?: string
          report_content?: Json
          report_version?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      life_wheel_assessments: {
        Row: {
          assessment_version: number
          created_at: string
          current_score: number
          desired_score: number
          domain: string
          gap_size: number | null
          id: string
          importance_rating: number
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_version?: number
          created_at?: string
          current_score: number
          desired_score: number
          domain: string
          gap_size?: number | null
          id?: string
          importance_rating?: number
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_version?: number
          created_at?: string
          current_score?: number
          desired_score?: number
          domain?: string
          gap_size?: number | null
          id?: string
          importance_rating?: number
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      memory_deltas: {
        Row: {
          created_at: string
          delta_data: Json
          delta_hash: string
          delta_type: string
          id: string
          importance_score: number
          previous_hash: string | null
          schema_version: number
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delta_data?: Json
          delta_hash: string
          delta_type: string
          id?: string
          importance_score?: number
          previous_hash?: string | null
          schema_version?: number
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          delta_data?: Json
          delta_hash?: string
          delta_type?: string
          id?: string
          importance_score?: number
          previous_hash?: string | null
          schema_version?: number
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      memory_graph_edges: {
        Row: {
          created_at: string
          from_node_id: string
          id: string
          properties: Json
          relationship_type: string
          schema_version: number
          to_node_id: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          from_node_id: string
          id?: string
          properties?: Json
          relationship_type: string
          schema_version?: number
          to_node_id: string
          user_id: string
          weight?: number
        }
        Update: {
          created_at?: string
          from_node_id?: string
          id?: string
          properties?: Json
          relationship_type?: string
          schema_version?: number
          to_node_id?: string
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "memory_graph_edges_from_node_id_fkey"
            columns: ["from_node_id"]
            isOneToOne: false
            referencedRelation: "memory_graph_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_graph_edges_to_node_id_fkey"
            columns: ["to_node_id"]
            isOneToOne: false
            referencedRelation: "memory_graph_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_graph_nodes: {
        Row: {
          created_at: string
          id: string
          importance_score: number
          label: string
          node_type: string
          properties: Json
          schema_version: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          importance_score?: number
          label: string
          node_type: string
          properties?: Json
          schema_version?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          importance_score?: number
          label?: string
          node_type?: string
          properties?: Json
          schema_version?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      memory_metrics: {
        Row: {
          access_type: string
          created_at: string
          id: string
          latency_ms: number | null
          memory_tier: string
          session_id: string | null
          user_id: string
        }
        Insert: {
          access_type: string
          created_at?: string
          id?: string
          latency_ms?: number | null
          memory_tier: string
          session_id?: string | null
          user_id: string
        }
        Update: {
          access_type?: string
          created_at?: string
          id?: string
          latency_ms?: number | null
          memory_tier?: string
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      memory_writeback_queue: {
        Row: {
          cache_id: string
          error_message: string | null
          id: string
          operation_type: string
          processed_at: string | null
          queued_at: string
          status: string
        }
        Insert: {
          cache_id: string
          error_message?: string | null
          id?: string
          operation_type: string
          processed_at?: string | null
          queued_at?: string
          status?: string
        }
        Update: {
          cache_id?: string
          error_message?: string | null
          id?: string
          operation_type?: string
          processed_at?: string | null
          queued_at?: string
          status?: string
        }
        Relationships: []
      }
      message_embeddings: {
        Row: {
          agent_mode: string | null
          content: string
          created_at: string
          embedding: string | null
          id: string
          message_id: string
          message_role: string
          session_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_mode?: string | null
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          message_id: string
          message_role: string
          session_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_mode?: string | null
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          message_id?: string
          message_role?: string
          session_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      personality_quotes: {
        Row: {
          attribution: string | null
          category: string
          created_at: string
          id: string
          is_favorite: boolean
          last_shown: string | null
          personality_alignment: Json
          personality_report_id: string | null
          quote_text: string
          usage_count: number
          user_id: string
        }
        Insert: {
          attribution?: string | null
          category?: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          last_shown?: string | null
          personality_alignment?: Json
          personality_report_id?: string | null
          quote_text: string
          usage_count?: number
          user_id: string
        }
        Update: {
          attribution?: string | null
          category?: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          last_shown?: string | null
          personality_alignment?: Json
          personality_report_id?: string | null
          quote_text?: string
          usage_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_personality_quotes_report"
            columns: ["personality_report_id"]
            isOneToOne: false
            referencedRelation: "personality_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      personality_reports: {
        Row: {
          blueprint_id: string | null
          blueprint_version: string
          created_at: string
          generated_at: string
          id: string
          report_content: Json
          structured_intelligence: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          blueprint_id?: string | null
          blueprint_version?: string
          created_at?: string
          generated_at?: string
          id?: string
          report_content?: Json
          structured_intelligence?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          blueprint_id?: string | null
          blueprint_version?: string
          created_at?: string
          generated_at?: string
          id?: string
          report_content?: Json
          structured_intelligence?: Json | null
          updated_at?: string
          user_id?: string
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
      pie_astrological_events: {
        Row: {
          category: string
          created_at: string
          description: string
          end_time: string | null
          event_type: string
          id: string
          intensity: number
          personal_relevance: number
          start_time: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          end_time?: string | null
          event_type: string
          id?: string
          intensity: number
          personal_relevance: number
          start_time: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          end_time?: string | null
          event_type?: string
          id?: string
          intensity?: number
          personal_relevance?: number
          start_time?: string
        }
        Relationships: []
      }
      pie_configurations: {
        Row: {
          communication_style: string
          created_at: string
          data_types: Json
          delivery_methods: Json
          delivery_timing: string
          enabled: boolean
          id: string
          include_astrology: boolean
          include_statistics: boolean
          minimum_confidence: number
          pattern_sensitivity: string
          quiet_hours: Json
          retention_period: number
          updated_at: string
          user_id: string
        }
        Insert: {
          communication_style?: string
          created_at?: string
          data_types?: Json
          delivery_methods?: Json
          delivery_timing?: string
          enabled?: boolean
          id?: string
          include_astrology?: boolean
          include_statistics?: boolean
          minimum_confidence?: number
          pattern_sensitivity?: string
          quiet_hours?: Json
          retention_period?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          communication_style?: string
          created_at?: string
          data_types?: Json
          delivery_methods?: Json
          delivery_timing?: string
          enabled?: boolean
          id?: string
          include_astrology?: boolean
          include_statistics?: boolean
          minimum_confidence?: number
          pattern_sensitivity?: string
          quiet_hours?: Json
          retention_period?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pie_insights: {
        Row: {
          acknowledged: boolean
          communication_style: string
          confidence: number
          created_at: string
          delivered: boolean
          delivered_at: string | null
          delivery_time: string
          expiration_time: string
          id: string
          insight_type: string
          message: string
          pattern_id: string
          personalized_for_blueprint: boolean
          predictive_rule_id: string
          priority: string
          title: string
          trigger_event: string
          trigger_time: string
          user_feedback: string | null
          user_id: string
        }
        Insert: {
          acknowledged?: boolean
          communication_style: string
          confidence: number
          created_at?: string
          delivered?: boolean
          delivered_at?: string | null
          delivery_time: string
          expiration_time: string
          id?: string
          insight_type: string
          message: string
          pattern_id: string
          personalized_for_blueprint?: boolean
          predictive_rule_id: string
          priority: string
          title: string
          trigger_event: string
          trigger_time: string
          user_feedback?: string | null
          user_id: string
        }
        Update: {
          acknowledged?: boolean
          communication_style?: string
          confidence?: number
          created_at?: string
          delivered?: boolean
          delivered_at?: string | null
          delivery_time?: string
          expiration_time?: string
          id?: string
          insight_type?: string
          message?: string
          pattern_id?: string
          personalized_for_blueprint?: boolean
          predictive_rule_id?: string
          priority?: string
          title?: string
          trigger_event?: string
          trigger_time?: string
          user_feedback?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pie_patterns: {
        Row: {
          confidence: number
          correlation_strength: number
          created_at: string
          cycle_period: number | null
          data_type: string
          detected_at: string
          event_trigger: string | null
          id: string
          last_updated: string
          pattern_type: string
          sample_size: number
          significance: number
          user_id: string
          valid_until: string | null
        }
        Insert: {
          confidence: number
          correlation_strength: number
          created_at?: string
          cycle_period?: number | null
          data_type: string
          detected_at?: string
          event_trigger?: string | null
          id?: string
          last_updated?: string
          pattern_type: string
          sample_size: number
          significance: number
          user_id: string
          valid_until?: string | null
        }
        Update: {
          confidence?: number
          correlation_strength?: number
          created_at?: string
          cycle_period?: number | null
          data_type?: string
          detected_at?: string
          event_trigger?: string | null
          id?: string
          last_updated?: string
          pattern_type?: string
          sample_size?: number
          significance?: number
          user_id?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      pie_predictive_rules: {
        Row: {
          confidence: number
          created_at: string
          creation_date: string
          direction: string
          event_type: string
          id: string
          last_validated: string
          magnitude: number
          minimum_occurrences: number
          statistical_significance: number
          user_data_types: Json
          user_id: string
          window_hours: number
        }
        Insert: {
          confidence: number
          created_at?: string
          creation_date?: string
          direction: string
          event_type: string
          id?: string
          last_validated?: string
          magnitude: number
          minimum_occurrences: number
          statistical_significance: number
          user_data_types?: Json
          user_id: string
          window_hours: number
        }
        Update: {
          confidence?: number
          created_at?: string
          creation_date?: string
          direction?: string
          event_type?: string
          id?: string
          last_validated?: string
          magnitude?: number
          minimum_occurrences?: number
          statistical_significance?: number
          user_data_types?: Json
          user_id?: string
          window_hours?: number
        }
        Relationships: []
      }
      pie_suppressed_events: {
        Row: {
          event_id: string
          event_type: string
          id: string
          rule_confidence: number
          rule_id: string
          suppressed_at: string
          suppression_reason: string
          threshold_used: number
          user_id: string
        }
        Insert: {
          event_id: string
          event_type: string
          id?: string
          rule_confidence: number
          rule_id: string
          suppressed_at?: string
          suppression_reason: string
          threshold_used: number
          user_id: string
        }
        Update: {
          event_id?: string
          event_type?: string
          id?: string
          rule_confidence?: number
          rule_id?: string
          suppressed_at?: string
          suppression_reason?: string
          threshold_used?: number
          user_id?: string
        }
        Relationships: []
      }
      pie_user_data: {
        Row: {
          confidence: number
          created_at: string
          data_type: string
          id: string
          metadata: Json | null
          raw_value: Json | null
          source: string
          timestamp: string
          user_id: string
          value: number
        }
        Insert: {
          confidence?: number
          created_at?: string
          data_type: string
          id?: string
          metadata?: Json | null
          raw_value?: Json | null
          source: string
          timestamp: string
          user_id: string
          value: number
        }
        Update: {
          confidence?: number
          created_at?: string
          data_type?: string
          id?: string
          metadata?: Json | null
          raw_value?: Json | null
          source?: string
          timestamp?: string
          user_id?: string
          value?: number
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
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string
          language_preference: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          language_preference?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          language_preference?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      retrieval_config: {
        Row: {
          ann_thresholds: number[] | null
          created_at: string
          facts_priority: boolean | null
          hybrid_retrieval_enabled: boolean | null
          id: string
          sidecar_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ann_thresholds?: number[] | null
          created_at?: string
          facts_priority?: boolean | null
          hybrid_retrieval_enabled?: boolean | null
          id?: string
          sidecar_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ann_thresholds?: number[] | null
          created_at?: string
          facts_priority?: boolean | null
          hybrid_retrieval_enabled?: boolean | null
          id?: string
          sidecar_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          error_message: string | null
          id: string
          ip_address: unknown | null
          resource: string
          success: boolean
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          resource: string
          success?: boolean
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          resource?: string
          success?: boolean
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
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
      user_360_profiles: {
        Row: {
          created_at: string
          data_availability: Json
          data_sources: string[]
          id: string
          last_updated: string
          profile_data: Json
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          created_at?: string
          data_availability?: Json
          data_sources?: string[]
          id?: string
          last_updated?: string
          profile_data?: Json
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          created_at?: string
          data_availability?: Json
          data_sources?: string[]
          id?: string
          last_updated?: string
          profile_data?: Json
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      user_360_profiles_archive: {
        Row: {
          created_at: string | null
          data_availability: Json | null
          data_sources: string[] | null
          id: string | null
          last_updated: string | null
          profile_data: Json | null
          updated_at: string | null
          user_id: string | null
          version: number | null
        }
        Insert: {
          created_at?: string | null
          data_availability?: Json | null
          data_sources?: string[] | null
          id?: string | null
          last_updated?: string | null
          profile_data?: Json | null
          updated_at?: string | null
          user_id?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string | null
          data_availability?: Json | null
          data_sources?: string[] | null
          id?: string | null
          last_updated?: string | null
          profile_data?: Json | null
          updated_at?: string | null
          user_id?: string | null
          version?: number | null
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
      user_dreams: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          importance_level: string | null
          status: string
          timeframe: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          importance_level?: string | null
          status?: string
          timeframe?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          importance_level?: string | null
          status?: string
          timeframe?: string | null
          title?: string
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
          acs_version: string | null
          context_summary: string | null
          created_at: string
          id: string
          importance_score: number | null
          last_referenced: string | null
          memory_data: Json
          memory_type: string
          session_id: string
          user_id: string
          vector_version: string | null
        }
        Insert: {
          acs_version?: string | null
          context_summary?: string | null
          created_at?: string
          id?: string
          importance_score?: number | null
          last_referenced?: string | null
          memory_data?: Json
          memory_type: string
          session_id: string
          user_id: string
          vector_version?: string | null
        }
        Update: {
          acs_version?: string | null
          context_summary?: string | null
          created_at?: string
          id?: string
          importance_score?: number | null
          last_referenced?: string | null
          memory_data?: Json
          memory_type?: string
          session_id?: string
          user_id?: string
          vector_version?: string | null
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
      user_xp_events: {
        Row: {
          blocked_gate: string | null
          delta_xp: number
          dims: Json
          id: number
          kinds: string[]
          note: string | null
          occurred_at: string
          quality: number
          user_id: string
          xp_total_after: number
        }
        Insert: {
          blocked_gate?: string | null
          delta_xp: number
          dims: Json
          id?: number
          kinds: string[]
          note?: string | null
          occurred_at?: string
          quality: number
          user_id: string
          xp_total_after: number
        }
        Update: {
          blocked_gate?: string | null
          delta_xp?: number
          dims?: Json
          id?: number
          kinds?: string[]
          note?: string | null
          occurred_at?: string
          quality?: number
          user_id?: string
          xp_total_after?: number
        }
        Relationships: []
      }
      user_xp_progress: {
        Row: {
          created_at: string
          daily_xp: number
          dim_scores_ewma: Json
          last_adp_at: string | null
          last_milestone_hit: number
          last_reset_day: string
          last_reset_week: number
          repeats_today: Json
          session_xp: number
          updated_at: string
          user_id: string
          weekly_xp: number
          xp_total: number
        }
        Insert: {
          created_at?: string
          daily_xp?: number
          dim_scores_ewma?: Json
          last_adp_at?: string | null
          last_milestone_hit?: number
          last_reset_day?: string
          last_reset_week?: number
          repeats_today?: Json
          session_xp?: number
          updated_at?: string
          user_id: string
          weekly_xp?: number
          xp_total?: number
        }
        Update: {
          created_at?: string
          daily_xp?: number
          dim_scores_ewma?: Json
          last_adp_at?: string | null
          last_milestone_hit?: number
          last_reset_day?: string
          last_reset_week?: number
          repeats_today?: Json
          session_xp?: number
          updated_at?: string
          user_id?: string
          weekly_xp?: number
          xp_total?: number
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
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      check_admin_status: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      cleanup_expired_generation_jobs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_hot_memory: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_memories: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_stuck_hermetic_jobs: {
        Args: Record<PropertyKey, never> | { p_user_id?: string }
        Returns: number
      }
      create_generation_job: {
        Args: {
          p_job_data?: Json
          p_job_type: string
          p_timeout_hours?: number
          p_user_id: string
        }
        Returns: string
      }
      detect_zombie_hermetic_jobs: {
        Args: { p_user_id?: string }
        Returns: {
          created_at: string
          current_step: string
          is_zombie: boolean
          job_id: string
          last_heartbeat: string
          progress_percentage: number
          status: string
          user_id: string
        }[]
      }
      emergency_cleanup_stuck_jobs: {
        Args: { p_user_id?: string }
        Returns: number
      }
      generate_blueprint_signature: {
        Args: { blueprint_data: Json }
        Returns: string
      }
      get_active_user_blueprint: {
        Args: { user_uuid: string }
        Returns: Json
      }
      get_hermetic_job_status: {
        Args: { job_id: string }
        Returns: Json
      }
      get_or_create_conversation_thread: {
        Args: { p_mode?: string; p_user_id: string }
        Returns: Json
      }
      get_steward_introduction_diagnostic: {
        Args: { p_user_id?: string }
        Returns: Json
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      handle_admin_check: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      has_any_admin_users: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      log_admin_access: {
        Args: {
          p_action: string
          p_error_message?: string
          p_resource: string
          p_success?: boolean
          p_user_id?: string
        }
        Returns: undefined
      }
      match_blueprint_chunks: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
          query_user_id: string
        }
        Returns: {
          chunk_content: string
          id: string
          similarity: number
        }[]
      }
      migrate_intelligence_to_xp: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      restart_hermetic_job: {
        Args: { job_id_param: string }
        Returns: boolean
      }
      search_similar_messages: {
        Args: {
          max_results?: number
          query_embedding: string
          similarity_threshold?: number
          user_id_param: string
        }
        Returns: {
          agent_mode: string
          content: string
          created_at: string
          message_role: string
          session_id: string
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      update_job_heartbeat: {
        Args: { job_id_param: string }
        Returns: boolean
      }
      update_job_status: {
        Args: {
          p_error_message?: string
          p_job_id: string
          p_progress?: Json
          p_status: string
        }
        Returns: boolean
      }
      validate_job_heartbeat_with_content: {
        Args: Record<PropertyKey, never>
        Returns: {
          is_zombie: boolean
          job_id: string
          last_heartbeat: string
          status: string
          sub_job_count: number
          total_content_length: number
        }[]
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
