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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      __debug_test_table__: {
        Row: {
          id: string
        }
        Insert: {
          id?: string
        }
        Update: {
          id?: string
        }
        Relationships: []
      }
      action_items: {
        Row: {
          actual_work_minutes: number | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          initiative_id: string | null
          kpi_id: string | null
          milestone_id: string | null
          organization_id: string | null
          owner_id: string | null
          predicted_duration_minutes: number | null
          priority: string | null
          priority_score: number | null
          project_id: string | null
          status: string | null
          tags: string[] | null
          task_time_estimate_minutes: number | null
          task_type: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          actual_work_minutes?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          initiative_id?: string | null
          kpi_id?: string | null
          milestone_id?: string | null
          organization_id?: string | null
          owner_id?: string | null
          predicted_duration_minutes?: number | null
          priority?: string | null
          priority_score?: number | null
          project_id?: string | null
          status?: string | null
          tags?: string[] | null
          task_time_estimate_minutes?: number | null
          task_type?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          actual_work_minutes?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          initiative_id?: string | null
          kpi_id?: string | null
          milestone_id?: string | null
          organization_id?: string | null
          owner_id?: string | null
          predicted_duration_minutes?: number | null
          priority?: string | null
          priority_score?: number | null
          project_id?: string | null
          status?: string | null
          tags?: string[] | null
          task_time_estimate_minutes?: number | null
          task_type?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_items_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_feed: {
        Row: {
          action_type: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          action_type?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          action_type?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      advisories: {
        Row: {
          actions: Json | null
          created_at: string | null
          description: string | null
          diagnostic_id: string | null
          id: string
          organization_id: string | null
          owner_id: string | null
          priority: string | null
          recommendation: string | null
          related_initiative_id: string | null
          severity: Json | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actions?: Json | null
          created_at?: string | null
          description?: string | null
          diagnostic_id?: string | null
          id?: string
          organization_id?: string | null
          owner_id?: string | null
          priority?: string | null
          recommendation?: string | null
          related_initiative_id?: string | null
          severity?: Json | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actions?: Json | null
          created_at?: string | null
          description?: string | null
          diagnostic_id?: string | null
          id?: string
          organization_id?: string | null
          owner_id?: string | null
          priority?: string | null
          recommendation?: string | null
          related_initiative_id?: string | null
          severity?: Json | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advisories_diagnostic_id_fkey"
            columns: ["diagnostic_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisories_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      advisory_modules: {
        Row: {
          advisory_id: string | null
          created_at: string | null
          description: string | null
          domain: string | null
          id: number
          name: string | null
          updated_at: string | null
        }
        Insert: {
          advisory_id?: string | null
          created_at?: string | null
          description?: string | null
          domain?: string | null
          id: number
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          advisory_id?: string | null
          created_at?: string | null
          description?: string | null
          domain?: string | null
          id?: number
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      advisory_recommendations: {
        Row: {
          created_at: string | null
          id: string
          recommendation: Json | null
          task_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          recommendation?: Json | null
          task_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          recommendation?: Json | null
          task_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_call_logs: {
        Row: {
          cost: number | null
          created_at: string | null
          id: string
          model: string | null
          organization_id: string | null
          prompt: Json | null
          response: Json | null
          user_id: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          id?: string
          model?: string | null
          organization_id?: string | null
          prompt?: Json | null
          response?: Json | null
          user_id?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          id?: string
          model?: string | null
          organization_id?: string | null
          prompt?: Json | null
          response?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          organization_id: string
          total_calls: number | null
          total_cost: number | null
          updated_at: string | null
        }
        Insert: {
          organization_id: string
          total_calls?: number | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          organization_id?: string
          total_calls?: number | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      alerts: {
        Row: {
          action_item_id: string | null
          created_at: string
          description: string | null
          id: number
          initiative_id: string | null
          project_id: string | null
          severity: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          action_item_id?: string | null
          created_at?: string
          description?: string | null
          id?: number
          initiative_id?: string | null
          project_id?: string | null
          severity?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          action_item_id?: string | null
          created_at?: string
          description?: string | null
          id?: number
          initiative_id?: string | null
          project_id?: string | null
          severity?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      algorithm_scores: {
        Row: {
          authority_score: number | null
          calculated_at: string | null
          campaign_id: string | null
          conversion_score: number | null
          efficiency_score: number | null
          engagement_score: number | null
          freshness_score: number | null
          id: string
          mega_algorithm_score: number | null
          network_score: number | null
          relevance_score: number | null
        }
        Insert: {
          authority_score?: number | null
          calculated_at?: string | null
          campaign_id?: string | null
          conversion_score?: number | null
          efficiency_score?: number | null
          engagement_score?: number | null
          freshness_score?: number | null
          id?: string
          mega_algorithm_score?: number | null
          network_score?: number | null
          relevance_score?: number | null
        }
        Update: {
          authority_score?: number | null
          calculated_at?: string | null
          campaign_id?: string | null
          conversion_score?: number | null
          efficiency_score?: number | null
          engagement_score?: number | null
          freshness_score?: number | null
          id?: string
          mega_algorithm_score?: number | null
          network_score?: number | null
          relevance_score?: number | null
        }
        Relationships: []
      }
      algorithm_signals: {
        Row: {
          campaign_id: string | null
          id: string
          metric_name: string | null
          metric_value: number | null
          organization_id: string | null
          platform: string | null
          recorded_at: string | null
          signal_type: string | null
        }
        Insert: {
          campaign_id?: string | null
          id?: string
          metric_name?: string | null
          metric_value?: number | null
          organization_id?: string | null
          platform?: string | null
          recorded_at?: string | null
          signal_type?: string | null
        }
        Update: {
          campaign_id?: string | null
          id?: string
          metric_name?: string | null
          metric_value?: number | null
          organization_id?: string | null
          platform?: string | null
          recorded_at?: string | null
          signal_type?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          key: string
          name: string | null
          organization_id: string
          owner_id: string | null
          revoked: boolean | null
          role: string | null
          status: string | null
          status_enum:
            | Database["public"]["Enums"]["status_enum_api_keys"]
            | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key: string
          name?: string | null
          organization_id: string
          owner_id?: string | null
          revoked?: boolean | null
          role?: string | null
          status?: string | null
          status_enum?:
            | Database["public"]["Enums"]["status_enum_api_keys"]
            | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key?: string
          name?: string | null
          organization_id?: string
          owner_id?: string | null
          revoked?: boolean | null
          role?: string | null
          status?: string | null
          status_enum?:
            | Database["public"]["Enums"]["status_enum_api_keys"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      app_settings_audit: {
        Row: {
          app_setting_id: string | null
          changed_at: string | null
          changed_by: string | null
          id: string
          key: string | null
          new_value: Json | null
          old_value: Json | null
          operation: string | null
        }
        Insert: {
          app_setting_id?: string | null
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          key?: string | null
          new_value?: Json | null
          old_value?: Json | null
          operation?: string | null
        }
        Update: {
          app_setting_id?: string | null
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          key?: string | null
          new_value?: Json | null
          old_value?: Json | null
          operation?: string | null
        }
        Relationships: []
      }
      attachments: {
        Row: {
          action_item_id: string | null
          created_at: string
          id: number
          initiative_id: string | null
          meeting_id: string | null
          name: string | null
          uploaded_by: string | null
          url: string | null
        }
        Insert: {
          action_item_id?: string | null
          created_at?: string
          id?: number
          initiative_id?: string | null
          meeting_id?: string | null
          name?: string | null
          uploaded_by?: string | null
          url?: string | null
        }
        Update: {
          action_item_id?: string | null
          created_at?: string
          id?: number
          initiative_id?: string | null
          meeting_id?: string | null
          name?: string | null
          uploaded_by?: string | null
          url?: string | null
        }
        Relationships: []
      }
      automation_actions: {
        Row: {
          action_type: string
          config: Json | null
          created_at: string | null
          id: string
          rule_id: string | null
          sequence_order: number | null
        }
        Insert: {
          action_type: string
          config?: Json | null
          created_at?: string | null
          id?: string
          rule_id?: string | null
          sequence_order?: number | null
        }
        Update: {
          action_type?: string
          config?: Json | null
          created_at?: string | null
          id?: string
          rule_id?: string | null
          sequence_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_actions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_conditions: {
        Row: {
          created_at: string | null
          field: string
          id: string
          operator: string
          rule_id: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          field: string
          id?: string
          operator: string
          rule_id?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          field?: string
          id?: string
          operator?: string
          rule_id?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_conditions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_logs: {
        Row: {
          actions_taken: Json | null
          created_at: string | null
          error_message: string | null
          id: string
          organization_id: string | null
          rule_id: string | null
          status: string
          trigger_data: Json | null
        }
        Insert: {
          actions_taken?: Json | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          organization_id?: string | null
          rule_id?: string | null
          status?: string
          trigger_data?: Json | null
        }
        Update: {
          actions_taken?: Json | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          organization_id?: string | null
          rule_id?: string | null
          status?: string
          trigger_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_logs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_enabled: boolean | null
          last_run_at: string | null
          name: string
          organization_id: string | null
          run_count: number | null
          trigger_event: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          last_run_at?: string | null
          name: string
          organization_id?: string | null
          run_count?: number | null
          trigger_event: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          last_run_at?: string | null
          name?: string
          organization_id?: string | null
          run_count?: number | null
          trigger_event?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      behavioral_metrics: {
        Row: {
          avg_cycle_seconds: number | null
          avg_owner_count: number | null
          communication_events: number | null
          dependency_count_avg: number | null
          id: string
          measured_at: string | null
          metadata: Json | null
          org_id: string
          overdue_count: number | null
          tasks_completed: number | null
          tasks_created: number | null
          team_id: string | null
          window_interval: string
          workload_capacity: number | null
        }
        Insert: {
          avg_cycle_seconds?: number | null
          avg_owner_count?: number | null
          communication_events?: number | null
          dependency_count_avg?: number | null
          id?: string
          measured_at?: string | null
          metadata?: Json | null
          org_id: string
          overdue_count?: number | null
          tasks_completed?: number | null
          tasks_created?: number | null
          team_id?: string | null
          window_interval?: string
          workload_capacity?: number | null
        }
        Update: {
          avg_cycle_seconds?: number | null
          avg_owner_count?: number | null
          communication_events?: number | null
          dependency_count_avg?: number | null
          id?: string
          measured_at?: string | null
          metadata?: Json | null
          org_id?: string
          overdue_count?: number | null
          tasks_completed?: number | null
          tasks_created?: number | null
          team_id?: string | null
          window_interval?: string
          workload_capacity?: number | null
        }
        Relationships: []
      }
      bugs: {
        Row: {
          actual_behavior: string | null
          assignee_id: string | null
          created_at: string | null
          description: string | null
          expected_behavior: string | null
          id: string
          organization_id: string | null
          priority: string
          related_story_id: string | null
          reporter_id: string | null
          resolved_at: string | null
          severity: string
          status: string
          steps_to_reproduce: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_behavior?: string | null
          assignee_id?: string | null
          created_at?: string | null
          description?: string | null
          expected_behavior?: string | null
          id?: string
          organization_id?: string | null
          priority?: string
          related_story_id?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          steps_to_reproduce?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_behavior?: string | null
          assignee_id?: string | null
          created_at?: string | null
          description?: string | null
          expected_behavior?: string | null
          id?: string
          organization_id?: string | null
          priority?: string
          related_story_id?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          steps_to_reproduce?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bugs_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bugs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bugs_related_story_id_fkey"
            columns: ["related_story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bugs_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_ai_insights: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          diagnosis: string | null
          id: string
          mega_score: number | null
          predicted_lead_change: number | null
          predicted_revenue_change: number | null
          recommendation: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          diagnosis?: string | null
          id?: string
          mega_score?: number | null
          predicted_lead_change?: number | null
          predicted_revenue_change?: number | null
          recommendation?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          diagnosis?: string | null
          id?: string
          mega_score?: number | null
          predicted_lead_change?: number | null
          predicted_revenue_change?: number | null
          recommendation?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          action_item_id: string | null
          content: string | null
          created_at: string
          id: number
          initiative_id: string | null
          meeting_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          action_item_id?: string | null
          content?: string | null
          created_at?: string
          id?: number
          initiative_id?: string | null
          meeting_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          action_item_id?: string | null
          content?: string | null
          created_at?: string
          id?: number
          initiative_id?: string | null
          meeting_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      crm_companies: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          email: string | null
          employee_count: string | null
          estimated_revenue: string | null
          id: string
          industry: string | null
          name: string
          notes: string | null
          organization_id: string | null
          phone: string | null
          state: string | null
          status: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          employee_count?: string | null
          estimated_revenue?: string | null
          id?: string
          industry?: string | null
          name: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          state?: string | null
          status?: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          employee_count?: string | null
          estimated_revenue?: string | null
          id?: string
          industry?: string | null
          name?: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          state?: string | null
          status?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_companies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contacts: {
        Row: {
          alt_phone: string | null
          combined_score: number | null
          company_id: string | null
          created_at: string | null
          email: string | null
          email_type: string | null
          engagement_rank: number | null
          first_name: string
          id: string
          industry: string | null
          interest_score: number | null
          last_name: string
          linkedin: string | null
          notes: string | null
          organization_id: string | null
          phone: string | null
          relevance_score: number | null
          sector: string | null
          title: string | null
          twitter: string | null
          updated_at: string | null
        }
        Insert: {
          alt_phone?: string | null
          combined_score?: number | null
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          email_type?: string | null
          engagement_rank?: number | null
          first_name: string
          id?: string
          industry?: string | null
          interest_score?: number | null
          last_name: string
          linkedin?: string | null
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          relevance_score?: number | null
          sector?: string | null
          title?: string | null
          twitter?: string | null
          updated_at?: string | null
        }
        Update: {
          alt_phone?: string | null
          combined_score?: number | null
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          email_type?: string | null
          engagement_rank?: number | null
          first_name?: string
          id?: string
          industry?: string | null
          interest_score?: number | null
          last_name?: string
          linkedin?: string | null
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          relevance_score?: number | null
          sector?: string | null
          title?: string | null
          twitter?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_opportunities: {
        Row: {
          company_id: string | null
          contact_id: string | null
          created_at: string | null
          expected_close_date: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string | null
          owner_id: string | null
          probability: number | null
          stage: string
          updated_at: string | null
          value: number | null
        }
        Insert: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          expected_close_date?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id?: string | null
          owner_id?: string | null
          probability?: number | null
          stage?: string
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          expected_close_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string | null
          owner_id?: string | null
          probability?: number | null
          stage?: string
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_opportunities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_opportunities_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      decision_weights: {
        Row: {
          created_at: string | null
          diagnostic_dimension_id: number
          id: string
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          diagnostic_dimension_id: number
          id?: string
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          diagnostic_dimension_id?: number
          id?: string
          weight?: number | null
        }
        Relationships: []
      }
      department_membership: {
        Row: {
          created_at: string | null
          id: string
          role: string | null
          team_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string | null
          team_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string | null
          team_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      dependencies: {
        Row: {
          created_at: string
          dependent_id: string | null
          dependent_type: string | null
          depends_on_id: string | null
          depends_on_type: string | null
          id: number
        }
        Insert: {
          created_at?: string
          dependent_id?: string | null
          dependent_type?: string | null
          depends_on_id?: string | null
          depends_on_type?: string | null
          id?: number
        }
        Update: {
          created_at?: string
          dependent_id?: string | null
          dependent_type?: string | null
          depends_on_id?: string | null
          depends_on_type?: string | null
          id?: number
        }
        Relationships: []
      }
      diagnostic_dimensions: {
        Row: {
          description: string | null
          diagnostic_id: string | null
          id: number
          name: string | null
          weight: number | null
        }
        Insert: {
          description?: string | null
          diagnostic_id?: string | null
          id?: number
          name?: string | null
          weight?: number | null
        }
        Update: {
          description?: string | null
          diagnostic_id?: string | null
          id?: number
          name?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      diagnostic_runs: {
        Row: {
          algorithm: string | null
          created_at: string | null
          diagnostic_id: string | null
          finished_at: string | null
          id: string
          initiative_id: string | null
          input: Json | null
          organization_id: string | null
          result: Json | null
          run_at: string | null
          signal_id: string | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          algorithm?: string | null
          created_at?: string | null
          diagnostic_id?: string | null
          finished_at?: string | null
          id?: string
          initiative_id?: string | null
          input?: Json | null
          organization_id?: string | null
          result?: Json | null
          run_at?: string | null
          signal_id?: string | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          algorithm?: string | null
          created_at?: string | null
          diagnostic_id?: string | null
          finished_at?: string | null
          id?: string
          initiative_id?: string | null
          input?: Json | null
          organization_id?: string | null
          result?: Json | null
          run_at?: string | null
          signal_id?: string | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnostic_runs_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signal_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostics: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string | null
          report: Json | null
          signal_id: string | null
          status: string | null
          status_enum:
            | Database["public"]["Enums"]["status_enum_diagnostics"]
            | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string | null
          report?: Json | null
          signal_id?: string | null
          status?: string | null
          status_enum?:
            | Database["public"]["Enums"]["status_enum_diagnostics"]
            | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string | null
          report?: Json | null
          signal_id?: string | null
          status?: string | null
          status_enum?:
            | Database["public"]["Enums"]["status_enum_diagnostics"]
            | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnostics_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals"
            referencedColumns: ["id"]
          },
        ]
      }
      epics: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          organization_id: string | null
          owner_id: string | null
          priority: string
          progress_pct: number | null
          project_id: string | null
          start_date: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          organization_id?: string | null
          owner_id?: string | null
          priority?: string
          progress_pct?: number | null
          project_id?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          owner_id?: string | null
          priority?: string
          progress_pct?: number | null
          project_id?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "epics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "epics_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "epics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flag_events: {
        Row: {
          feature_key: string
          id: number
          occurred_at: string | null
          user_id: string | null
        }
        Insert: {
          feature_key: string
          id?: number
          occurred_at?: string | null
          user_id?: string | null
        }
        Update: {
          feature_key?: string
          id?: number
          occurred_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          usage_count: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          usage_count?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      framework_dimension_map: {
        Row: {
          created_at: string | null
          dimension_id: number | null
          framework_id: number
          id: string
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          dimension_id?: number | null
          framework_id: number
          id?: string
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          dimension_id?: number | null
          framework_id?: number
          id?: string
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      framework_knowledge_link: {
        Row: {
          created_at: string | null
          framework_id: number
          id: number
          knowledge_base_id: number
          knowledge_item_id: string | null
          link_type: string | null
          notes: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          framework_id: number
          id?: number
          knowledge_base_id: number
          knowledge_item_id?: string | null
          link_type?: string | null
          notes?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          framework_id?: number
          id?: number
          knowledge_base_id?: number
          knowledge_item_id?: string | null
          link_type?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_framework_knowledge_link_knowledge_item"
            columns: ["knowledge_item_id"]
            isOneToOne: false
            referencedRelation: "knowledge_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "framework_knowledge_link_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "frameworks_old_backup"
            referencedColumns: ["id"]
          },
        ]
      }
      frameworks: {
        Row: {
          created_at: string
          dependencies: Json
          dependencies_links: string | null
          description: string | null
          id: number
          name: string
          notes: string | null
          notes_historical_context: string | null
          primary_module: string | null
          primary_module_id: number | null
          status_relevance: string | null
          temporal_context: string | null
          updated_at: string
          version: string | null
        }
        Insert: {
          created_at?: string
          dependencies?: Json
          dependencies_links?: string | null
          description?: string | null
          id?: number
          name: string
          notes?: string | null
          notes_historical_context?: string | null
          primary_module?: string | null
          primary_module_id?: number | null
          status_relevance?: string | null
          temporal_context?: string | null
          updated_at?: string
          version?: string | null
        }
        Update: {
          created_at?: string
          dependencies?: Json
          dependencies_links?: string | null
          description?: string | null
          id?: number
          name?: string
          notes?: string | null
          notes_historical_context?: string | null
          primary_module?: string | null
          primary_module_id?: number | null
          status_relevance?: string | null
          temporal_context?: string | null
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "frameworks_new_primary_module_id_fkey"
            columns: ["primary_module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      frameworks_old_backup: {
        Row: {
          created_at: string
          dependencies_links: Json
          id: number
          name: string
          notes: string | null
          notes_historical_context: string | null
          primary_module_id: number | null
          status_relevance: string | null
          temporal_context: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dependencies_links?: Json
          id?: number
          name: string
          notes?: string | null
          notes_historical_context?: string | null
          primary_module_id?: number | null
          status_relevance?: string | null
          temporal_context?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dependencies_links?: Json
          id?: number
          name?: string
          notes?: string | null
          notes_historical_context?: string | null
          primary_module_id?: number | null
          status_relevance?: string | null
          temporal_context?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "frameworks_primary_module_id_fkey"
            columns: ["primary_module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      initiatives: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          organization_id: string | null
          owner_id: string | null
          project_id: string | null
          start_date: string | null
          status: string | null
          status_enum:
            | Database["public"]["Enums"]["status_enum_initiatives"]
            | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          organization_id?: string | null
          owner_id?: string | null
          project_id?: string | null
          start_date?: string | null
          status?: string | null
          status_enum?:
            | Database["public"]["Enums"]["status_enum_initiatives"]
            | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          owner_id?: string | null
          project_id?: string | null
          start_date?: string | null
          status?: string | null
          status_enum?:
            | Database["public"]["Enums"]["status_enum_initiatives"]
            | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "initiatives_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiatives_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string | null
          email: string
          id: string
          invited_by: string | null
          organization_id: string
          role: string | null
          status: string | null
          team_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          invited_by?: string | null
          organization_id: string
          role?: string | null
          status?: string | null
          team_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          invited_by?: string | null
          organization_id?: string
          role?: string | null
          status?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      kg_nodes: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string | null
          metadata: Json | null
          node_type: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string | null
          metadata?: Json | null
          node_type: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string | null
          metadata?: Json | null
          node_type?: string
          title?: string
        }
        Relationships: []
      }
      kg_relationships: {
        Row: {
          created_at: string | null
          from_node: string
          id: string
          metadata: Json | null
          relationship_type: string
          to_node: string
        }
        Insert: {
          created_at?: string | null
          from_node: string
          id?: string
          metadata?: Json | null
          relationship_type: string
          to_node: string
        }
        Update: {
          created_at?: string | null
          from_node?: string
          id?: string
          metadata?: Json | null
          relationship_type?: string
          to_node?: string
        }
        Relationships: [
          {
            foreignKeyName: "kg_relationships_from_node_fkey"
            columns: ["from_node"]
            isOneToOne: false
            referencedRelation: "kg_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_relationships_from_node_fkey"
            columns: ["from_node"]
            isOneToOne: false
            referencedRelation: "kg_frameworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_relationships_from_node_fkey"
            columns: ["from_node"]
            isOneToOne: false
            referencedRelation: "kg_kpis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_relationships_from_node_fkey"
            columns: ["from_node"]
            isOneToOne: false
            referencedRelation: "kg_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_relationships_from_node_fkey"
            columns: ["from_node"]
            isOneToOne: false
            referencedRelation: "kg_problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_relationships_from_node_fkey"
            columns: ["from_node"]
            isOneToOne: false
            referencedRelation: "kg_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_relationships_to_node_fkey"
            columns: ["to_node"]
            isOneToOne: false
            referencedRelation: "kg_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_relationships_to_node_fkey"
            columns: ["to_node"]
            isOneToOne: false
            referencedRelation: "kg_frameworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_relationships_to_node_fkey"
            columns: ["to_node"]
            isOneToOne: false
            referencedRelation: "kg_kpis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_relationships_to_node_fkey"
            columns: ["to_node"]
            isOneToOne: false
            referencedRelation: "kg_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_relationships_to_node_fkey"
            columns: ["to_node"]
            isOneToOne: false
            referencedRelation: "kg_problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_relationships_to_node_fkey"
            columns: ["to_node"]
            isOneToOne: false
            referencedRelation: "kg_recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_bases: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          source: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          source?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          source?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_bodies: {
        Row: {
          content: string | null
          created_at: string | null
          description: string | null
          format: string | null
          id: string
          knowledge_item_id: string | null
          metadata: Json | null
          name: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          format?: string | null
          id?: string
          knowledge_item_id?: string | null
          metadata?: Json | null
          name: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          format?: string | null
          id?: string
          knowledge_item_id?: string | null
          metadata?: Json | null
          name?: string
        }
        Relationships: []
      }
      knowledge_items: {
        Row: {
          content: string | null
          created_at: string
          id: string
          knowledge_base_id: string | null
          metadata: Json | null
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          knowledge_base_id?: string | null
          metadata?: Json | null
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          knowledge_base_id?: string | null
          metadata?: Json | null
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      kpi_history: {
        Row: {
          created_at: string | null
          id: string
          kpi_id: string
          measured_at: string
          measured_value: number
          metadata: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          kpi_id: string
          measured_at?: string
          measured_value: number
          metadata?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          kpi_id?: string
          measured_at?: string
          measured_value?: number
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "kpi_history_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "kpis"
            referencedColumns: ["id"]
          },
        ]
      }
      kpis: {
        Row: {
          created_at: string | null
          current_value: number | null
          description: string | null
          direction: string | null
          id: string
          metadata: Json | null
          name: string
          organization_id: string
          owner_id: string | null
          target_value: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          direction?: string | null
          id?: string
          metadata?: Json | null
          name: string
          organization_id: string
          owner_id?: string | null
          target_value?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          direction?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          organization_id?: string
          owner_id?: string | null
          target_value?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kpis_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpis_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_preparedness: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          meeting_id: string | null
          notes: string | null
          owner_id: string | null
          prepared: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          meeting_id?: string | null
          notes?: string | null
          owner_id?: string | null
          prepared?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          meeting_id?: string | null
          notes?: string | null
          owner_id?: string | null
          prepared?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_preparedness_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_preparedness_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          agenda: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          initiative_id: string | null
          location: string | null
          organization_id: string | null
          project_id: string | null
          scheduled_at: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          agenda?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          initiative_id?: string | null
          location?: string | null
          organization_id?: string | null
          project_id?: string | null
          scheduled_at?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          agenda?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          initiative_id?: string | null
          location?: string | null
          organization_id?: string | null
          project_id?: string | null
          scheduled_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meetings_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          initiative_id: string | null
          name: string | null
          project_id: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          initiative_id?: string | null
          name?: string | null
          project_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          initiative_id?: string | null
          name?: string | null
          project_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          updated_at: string
          version: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      next_best_actions: {
        Row: {
          action_item_id: string | null
          generated_at: string | null
          generated_by: string | null
          id: string
          priority_score: number | null
          rank: number | null
          reason: string | null
          recommendation_reason: string | null
          score: number | null
          score_components: Json | null
          source_template_id: string | null
          user_feedback: Json | null
          user_id: string | null
        }
        Insert: {
          action_item_id?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          priority_score?: number | null
          rank?: number | null
          reason?: string | null
          recommendation_reason?: string | null
          score?: number | null
          score_components?: Json | null
          source_template_id?: string | null
          user_feedback?: Json | null
          user_id?: string | null
        }
        Update: {
          action_item_id?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          priority_score?: number | null
          rank?: number | null
          reason?: string | null
          recommendation_reason?: string | null
          score?: number | null
          score_components?: Json | null
          source_template_id?: string | null
          user_feedback?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "next_best_actions_source_template_id_fkey"
            columns: ["source_template_id"]
            isOneToOne: false
            referencedRelation: "recommendation_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_attempts: {
        Row: {
          attempt_at: string | null
          error_text: string | null
          id: string
          notification_id: string | null
          success: boolean | null
        }
        Insert: {
          attempt_at?: string | null
          error_text?: string | null
          id?: string
          notification_id?: string | null
          success?: boolean | null
        }
        Update: {
          attempt_at?: string | null
          error_text?: string | null
          id?: string
          notification_id?: string | null
          success?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_attempts_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          id: string
          user_id: string
          title: string
          raw_transcript: string
          ai_summary: string | null
          action_items: Json | null
          tags: string[] | null
          is_ai_generated: boolean | null
          tier_at_creation: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          raw_transcript?: string
          ai_summary?: string | null
          action_items?: Json | null
          tags?: string[] | null
          is_ai_generated?: boolean | null
          tier_at_creation?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          raw_transcript?: string
          ai_summary?: string | null
          action_items?: Json | null
          tags?: string[] | null
          is_ai_generated?: boolean | null
          tier_at_creation?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          delivered: boolean | null
          entity_id: string | null
          entity_type: string | null
          event_table: string
          event_type: string
          id: string
          is_read: boolean | null
          message: string | null
          notification_type: string | null
          payload: Json | null
          recipient_user_id: string | null
          record_id: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          delivered?: boolean | null
          entity_id?: string | null
          entity_type?: string | null
          event_table: string
          event_type: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          notification_type?: string | null
          payload?: Json | null
          recipient_user_id?: string | null
          record_id?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          delivered?: boolean | null
          entity_id?: string | null
          entity_type?: string | null
          event_table?: string
          event_type?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          notification_type?: string | null
          payload?: Json | null
          recipient_user_id?: string | null
          record_id?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      nudges_log: {
        Row: {
          action: string | null
          clicked: boolean | null
          feature: string
          id: string
          metadata: Json | null
          rec_id: string | null
          rec_key: string | null
          result: Json | null
          shown_at: string | null
          user_id: string | null
          variant: string | null
        }
        Insert: {
          action?: string | null
          clicked?: boolean | null
          feature: string
          id?: string
          metadata?: Json | null
          rec_id?: string | null
          rec_key?: string | null
          result?: Json | null
          shown_at?: string | null
          user_id?: string | null
          variant?: string | null
        }
        Update: {
          action?: string | null
          clicked?: boolean | null
          feature?: string
          id?: string
          metadata?: Json | null
          rec_id?: string | null
          rec_key?: string | null
          result?: Json | null
          shown_at?: string | null
          user_id?: string | null
          variant?: string | null
        }
        Relationships: []
      }
      okrs: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          key_results: Json | null
          metadata: Json | null
          objective: string | null
          organization_id: string
          owner_id: string | null
          period: string | null
          start_date: string | null
          status: string | null
          strategic_goal_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          key_results?: Json | null
          metadata?: Json | null
          objective?: string | null
          organization_id: string
          owner_id?: string | null
          period?: string | null
          start_date?: string | null
          status?: string | null
          strategic_goal_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          key_results?: Json | null
          metadata?: Json | null
          objective?: string | null
          organization_id?: string
          owner_id?: string | null
          period?: string | null
          start_date?: string | null
          status?: string | null
          strategic_goal_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "okrs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okrs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      org_health_metrics: {
        Row: {
          avg_cycle_time_seconds: number | null
          dependency_block_rate: number | null
          id: string
          measured_at: string
          metadata: Json | null
          org_id: string
          overdue_rate: number | null
          task_active_count: number
          task_blocked_count: number
          task_completed_count: number
          task_completion_rate: number | null
          task_created_count: number
          task_overdue_count: number
          team_focus_score: number | null
          window_end: string
          window_start: string
        }
        Insert: {
          avg_cycle_time_seconds?: number | null
          dependency_block_rate?: number | null
          id?: string
          measured_at?: string
          metadata?: Json | null
          org_id: string
          overdue_rate?: number | null
          task_active_count?: number
          task_blocked_count?: number
          task_completed_count?: number
          task_completion_rate?: number | null
          task_created_count?: number
          task_overdue_count?: number
          team_focus_score?: number | null
          window_end: string
          window_start: string
        }
        Update: {
          avg_cycle_time_seconds?: number | null
          dependency_block_rate?: number | null
          id?: string
          measured_at?: string
          metadata?: Json | null
          org_id?: string
          overdue_rate?: number | null
          task_active_count?: number
          task_blocked_count?: number
          task_completed_count?: number
          task_completion_rate?: number | null
          task_created_count?: number
          task_overdue_count?: number
          team_focus_score?: number | null
          window_end?: string
          window_start?: string
        }
        Relationships: []
      }
      org_health_metrics_config: {
        Row: {
          completed_statuses: string[] | null
          created_at: string | null
          id: string
          org_id: string
          top_teams: number | null
          window_interval: string | null
        }
        Insert: {
          completed_statuses?: string[] | null
          created_at?: string | null
          id?: string
          org_id: string
          top_teams?: number | null
          window_interval?: string | null
        }
        Update: {
          completed_statuses?: string[] | null
          created_at?: string | null
          id?: string
          org_id?: string
          top_teams?: number | null
          window_interval?: string | null
        }
        Relationships: []
      }
      org_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: number
          job_type: string
          org_id: string
          payload: Json | null
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: number
          job_type?: string
          org_id: string
          payload?: Json | null
          started_at?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: number
          job_type?: string
          org_id?: string
          payload?: Json | null
          started_at?: string | null
          status?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          organization_id: string
          role: string
          status: string
          status_enum:
            | Database["public"]["Enums"]["status_enum_organization_members"]
            | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          organization_id: string
          role?: string
          status?: string
          status_enum?:
            | Database["public"]["Enums"]["status_enum_organization_members"]
            | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string
          role?: string
          status?: string
          status_enum?:
            | Database["public"]["Enums"]["status_enum_organization_members"]
            | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      playbook_run: {
        Row: {
          finished_at: string | null
          id: string
          initiated_by: string | null
          playbook_id: string
          started_at: string | null
          status: string
        }
        Insert: {
          finished_at?: string | null
          id?: string
          initiated_by?: string | null
          playbook_id: string
          started_at?: string | null
          status?: string
        }
        Update: {
          finished_at?: string | null
          id?: string
          initiated_by?: string | null
          playbook_id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "playbook_run_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      playbook_run_results: {
        Row: {
          finding: string | null
          id: string
          payload: Json | null
          ran_at: string | null
          run_id: string
          status: string
          step_id: string
        }
        Insert: {
          finding?: string | null
          id?: string
          payload?: Json | null
          ran_at?: string | null
          run_id: string
          status: string
          step_id: string
        }
        Update: {
          finding?: string | null
          id?: string
          payload?: Json | null
          ran_at?: string | null
          run_id?: string
          status?: string
          step_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playbook_run_results_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "playbook_run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playbook_run_results_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "playbook_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      playbook_steps: {
        Row: {
          check_key: string
          created_at: string | null
          description: string | null
          id: string
          node_id: string | null
          playbook_id: string
          step_order: number
          title: string
        }
        Insert: {
          check_key: string
          created_at?: string | null
          description?: string | null
          id?: string
          node_id?: string | null
          playbook_id: string
          step_order: number
          title: string
        }
        Update: {
          check_key?: string
          created_at?: string | null
          description?: string | null
          id?: string
          node_id?: string | null
          playbook_id?: string
          step_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "playbook_steps_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "kg_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playbook_steps_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "kg_frameworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playbook_steps_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "kg_kpis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playbook_steps_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "kg_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playbook_steps_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "kg_problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playbook_steps_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "kg_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playbook_steps_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      playbooks: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          title?: string
        }
        Relationships: []
      }
      priority_rules: {
        Row: {
          condition_field: string | null
          created_at: string | null
          criteria: Json | null
          description: string | null
          id: number
          name: string | null
          operator: string | null
          recommendation: string | null
          updated_at: string | null
          value: number | null
        }
        Insert: {
          condition_field?: string | null
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          id: number
          name?: string | null
          operator?: string | null
          recommendation?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          condition_field?: string | null
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          id?: number
          name?: string | null
          operator?: string | null
          recommendation?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          metadata: Json | null
          name: string
          organization_id: string
          slug: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          metadata?: Json | null
          name: string
          organization_id: string
          slug?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          organization_id?: string
          slug?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_templates: {
        Row: {
          action_suggestion: string
          category: string
          created_at: string | null
          description: string
          id: string
          key: string
          priority_base: number
          score_expression: string | null
          severity: number
          title: string
        }
        Insert: {
          action_suggestion: string
          category: string
          created_at?: string | null
          description: string
          id?: string
          key: string
          priority_base?: number
          score_expression?: string | null
          severity?: number
          title: string
        }
        Update: {
          action_suggestion?: string
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          key?: string
          priority_base?: number
          score_expression?: string | null
          severity?: number
          title?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          advisory_id: string | null
          created_at: string | null
          description: string | null
          dismissed: boolean | null
          id: string
          owner_id: string | null
          payload: Json | null
          reason_score: number | null
          rec_key: string | null
          recommendation_text: string | null
          related_action_item_id: string | null
          related_initiative_id: string | null
          severity: string | null
          shown_at: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          advisory_id?: string | null
          created_at?: string | null
          description?: string | null
          dismissed?: boolean | null
          id?: string
          owner_id?: string | null
          payload?: Json | null
          reason_score?: number | null
          rec_key?: string | null
          recommendation_text?: string | null
          related_action_item_id?: string | null
          related_initiative_id?: string | null
          severity?: string | null
          shown_at?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          advisory_id?: string | null
          created_at?: string | null
          description?: string | null
          dismissed?: boolean | null
          id?: string
          owner_id?: string | null
          payload?: Json | null
          reason_score?: number | null
          rec_key?: string | null
          recommendation_text?: string | null
          related_action_item_id?: string | null
          related_initiative_id?: string | null
          severity?: string | null
          shown_at?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          action_item_id: string | null
          action_item_link: string | null
          created_at: string | null
          id: string
          reminder_time: string | null
          reminder_type: string | null
          sent: boolean | null
          user_id: string | null
        }
        Insert: {
          action_item_id?: string | null
          action_item_link?: string | null
          created_at?: string | null
          id?: string
          reminder_time?: string | null
          reminder_type?: string | null
          sent?: boolean | null
          user_id?: string | null
        }
        Update: {
          action_item_id?: string | null
          action_item_link?: string | null
          created_at?: string | null
          id?: string
          reminder_time?: string | null
          reminder_type?: string | null
          sent?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminders_action_item_id_fkey"
            columns: ["action_item_id"]
            isOneToOne: false
            referencedRelation: "action_items"
            referencedColumns: ["id"]
          },
        ]
      }
      report_templates: {
        Row: {
          id: string
          profile_id: string
          organization_id: string | null
          name: string
          type: string
          source_format: string
          column_mapping: Json
          original_headers: string[] | null
          created_by: string | null
          is_builtin: boolean | null
          builtin_key: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          organization_id?: string | null
          name: string
          type?: string
          source_format?: string
          column_mapping?: Json
          original_headers?: string[] | null
          created_by?: string | null
          is_builtin?: boolean | null
          builtin_key?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          organization_id?: string | null
          name?: string
          type?: string
          source_format?: string
          column_mapping?: Json
          original_headers?: string[] | null
          created_by?: string | null
          is_builtin?: boolean | null
          builtin_key?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_templates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_reports: {
        Row: {
          id: string
          profile_id: string
          organization_id: string | null
          template_id: string | null
          template_name: string
          generated_at: string | null
          row_count: number | null
          file_format: string
          file_data: string | null
          download_url: string | null
          created_by: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          organization_id?: string | null
          template_id?: string | null
          template_name: string
          generated_at?: string | null
          row_count?: number | null
          file_format?: string
          file_data?: string | null
          download_url?: string | null
          created_by?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          organization_id?: string | null
          template_id?: string | null
          template_name?: string
          generated_at?: string | null
          row_count?: number | null
          file_format?: string
          file_data?: string | null
          download_url?: string | null
          created_by?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_reports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      risks: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          impact: string | null
          initiative_id: string | null
          mitigations: Json | null
          organization_id: string | null
          probability: number | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          impact?: string | null
          initiative_id?: string | null
          mitigations?: Json | null
          organization_id?: string | null
          probability?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          impact?: string | null
          initiative_id?: string | null
          mitigations?: Json | null
          organization_id?: string | null
          probability?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      security_reports: {
        Row: {
          created_at: string | null
          id: number
          report: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          report?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: number
          report?: Json | null
        }
        Relationships: []
      }
      signal_definitions: {
        Row: {
          created_at: string | null
          data_type: string | null
          description: string | null
          detection_interval: string | null
          detection_query: string
          enabled: boolean | null
          id: string
          importance: number | null
          metadata: Json | null
          name: string
          organization_id: string | null
          severity: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_type?: string | null
          description?: string | null
          detection_interval?: string | null
          detection_query: string
          enabled?: boolean | null
          id?: string
          importance?: number | null
          metadata?: Json | null
          name: string
          organization_id?: string | null
          severity?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_type?: string | null
          description?: string | null
          detection_interval?: string | null
          detection_query?: string
          enabled?: boolean | null
          id?: string
          importance?: number | null
          metadata?: Json | null
          name?: string
          organization_id?: string | null
          severity?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signal_definitions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      signal_processor_jobs: {
        Row: {
          attempts: number | null
          created_at: string | null
          id: string
          last_error: string | null
          signal_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          id?: string
          last_error?: string | null
          signal_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          id?: string
          last_error?: string | null
          signal_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signal_processor_jobs_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals"
            referencedColumns: ["id"]
          },
        ]
      }
      signals: {
        Row: {
          captured_at: string | null
          id: string
          organization_id: string | null
          payload: Json | null
          severity: string | null
          signal_definition_id: string | null
          source: string | null
          value: Json | null
        }
        Insert: {
          captured_at?: string | null
          id?: string
          organization_id?: string | null
          payload?: Json | null
          severity?: string | null
          signal_definition_id?: string | null
          source?: string | null
          value?: Json | null
        }
        Update: {
          captured_at?: string | null
          id?: string
          organization_id?: string | null
          payload?: Json | null
          severity?: string | null
          signal_definition_id?: string | null
          source?: string | null
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "signals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sprints: {
        Row: {
          completed_points: number | null
          created_at: string | null
          end_date: string | null
          goal: string | null
          id: string
          name: string
          organization_id: string | null
          start_date: string | null
          status: string
          total_points: number | null
          updated_at: string | null
          velocity: number | null
        }
        Insert: {
          completed_points?: number | null
          created_at?: string | null
          end_date?: string | null
          goal?: string | null
          id?: string
          name: string
          organization_id?: string | null
          start_date?: string | null
          status?: string
          total_points?: number | null
          updated_at?: string | null
          velocity?: number | null
        }
        Update: {
          completed_points?: number | null
          created_at?: string | null
          end_date?: string | null
          goal?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          start_date?: string | null
          status?: string
          total_points?: number | null
          updated_at?: string | null
          velocity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sprints_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          acceptance_criteria: string | null
          assignee_id: string | null
          created_at: string | null
          description: string | null
          epic_id: string | null
          id: string
          organization_id: string | null
          priority: string
          sprint_id: string | null
          status: string
          story_points: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          acceptance_criteria?: string | null
          assignee_id?: string | null
          created_at?: string | null
          description?: string | null
          epic_id?: string | null
          id?: string
          organization_id?: string | null
          priority?: string
          sprint_id?: string | null
          status?: string
          story_points?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          acceptance_criteria?: string | null
          assignee_id?: string | null
          created_at?: string | null
          description?: string | null
          epic_id?: string | null
          id?: string
          organization_id?: string | null
          priority?: string
          sprint_id?: string | null
          status?: string
          story_points?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_epic_id_fkey"
            columns: ["epic_id"]
            isOneToOne: false
            referencedRelation: "epics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      strategic_goals: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          organization_id: string
          owner_id: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          organization_id: string
          owner_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          owner_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strategic_goals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategic_goals_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          is_edited: boolean | null
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          is_edited?: boolean | null
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          is_edited?: boolean | null
          organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      task_dependencies: {
        Row: {
          action_item_id: string | null
          depends_on_action_item_id: string | null
          depends_on_task_id: string | null
          id: string
          task_id: string | null
        }
        Insert: {
          action_item_id?: string | null
          depends_on_action_item_id?: string | null
          depends_on_task_id?: string | null
          id?: string
          task_id?: string | null
        }
        Update: {
          action_item_id?: string | null
          depends_on_action_item_id?: string | null
          depends_on_task_id?: string | null
          id?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_dependencies_depends_on_task_id_fkey"
            columns: ["depends_on_task_id"]
            isOneToOne: false
            referencedRelation: "action_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "action_items"
            referencedColumns: ["id"]
          },
        ]
      }
      task_reminders: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          remind_at: string
          sent: boolean | null
          task_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          remind_at: string
          sent?: boolean | null
          task_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          remind_at?: string
          sent?: boolean | null
          task_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          action_item_id: string | null
          assignee_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          initiative_id: string | null
          owner_id: string | null
          priority: number | null
          project_id: string | null
          status: string | null
          status_enum: Database["public"]["Enums"]["status_enum_tasks"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          action_item_id?: string | null
          assignee_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          initiative_id?: string | null
          owner_id?: string | null
          priority?: number | null
          project_id?: string | null
          status?: string | null
          status_enum?: Database["public"]["Enums"]["status_enum_tasks"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          action_item_id?: string | null
          assignee_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          initiative_id?: string | null
          owner_id?: string | null
          priority?: number | null
          project_id?: string | null
          status?: string | null
          status_enum?: Database["public"]["Enums"]["status_enum_tasks"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          id: number
          profile_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          profile_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          profile_id?: string | null
        }
        Relationships: []
      }
      team_metrics: {
        Row: {
          collected_at: string | null
          computed_at: string | null
          delta: number | null
          id: string
          metric_key: string | null
          metric_value: number | null
          score: number
          team_id: string
        }
        Insert: {
          collected_at?: string | null
          computed_at?: string | null
          delta?: number | null
          id?: string
          metric_key?: string | null
          metric_value?: number | null
          score: number
          team_id: string
        }
        Update: {
          collected_at?: string | null
          computed_at?: string | null
          delta?: number | null
          id?: string
          metric_key?: string | null
          metric_value?: number | null
          score?: number
          team_id?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          name: string
          organization_id: string
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name: string
          organization_id: string
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          organization_id?: string
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_behavior_events: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          event_type: string | null
          id: string
          metadata: Json | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          dashboard_layout: Json | null
          dismissed_banners: string[] | null
          id: string
          subscription_tier: string | null
          theme_preference: string | null
          updated_at: string | null
          user_id: string | null
          user_mode: string | null
        }
        Insert: {
          created_at?: string | null
          dashboard_layout?: Json | null
          dismissed_banners?: string[] | null
          id?: string
          subscription_tier?: string | null
          theme_preference?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_mode?: string | null
        }
        Update: {
          created_at?: string | null
          dashboard_layout?: Json | null
          dismissed_banners?: string[] | null
          id?: string
          subscription_tier?: string | null
          theme_preference?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_mode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_snoozes: {
        Row: {
          created_at: string | null
          id: string
          snooze_date: string
          source: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          snooze_date: string
          source?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          snooze_date?: string
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          last_completed_at: string | null
          points: number | null
          streak_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          last_completed_at?: string | null
          points?: number | null
          streak_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          last_completed_at?: string | null
          points?: number | null
          streak_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_work_capacity: {
        Row: {
          created_at: string | null
          productive_hours_per_day: number
          user_id: string
          weekday_mask: number | null
          working_days_per_week: number
        }
        Insert: {
          created_at?: string | null
          productive_hours_per_day?: number
          user_id: string
          weekday_mask?: number | null
          working_days_per_week?: number
        }
        Update: {
          created_at?: string | null
          productive_hours_per_day?: number
          user_id?: string
          weekday_mask?: number | null
          working_days_per_week?: number
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          role: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          role?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_runs: {
        Row: {
          created_at: string | null
          current_step: number | null
          finished_at: string | null
          id: string
          organization_id: string | null
          result: Json | null
          started_at: string | null
          state: string | null
          status: string | null
          trigger_event: Json | null
          workflow_template_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_step?: number | null
          finished_at?: string | null
          id?: string
          organization_id?: string | null
          result?: Json | null
          started_at?: string | null
          state?: string | null
          status?: string | null
          trigger_event?: Json | null
          workflow_template_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_step?: number | null
          finished_at?: string | null
          id?: string
          organization_id?: string | null
          result?: Json | null
          started_at?: string | null
          state?: string | null
          status?: string | null
          trigger_event?: Json | null
          workflow_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_runs_template_id_fkey"
            columns: ["workflow_template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          metadata: Json | null
          name: string
          organization_id: string | null
          steps: Json
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          organization_id?: string | null
          steps: Json
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          organization_id?: string | null
          steps?: Json
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string | null
          id: string
          name: string
          owner_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          owner_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      kg_actions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          key: string | null
          metadata: Json | null
          node_type: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          key?: string | null
          metadata?: Json | null
          node_type?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          key?: string | null
          metadata?: Json | null
          node_type?: string | null
          title?: string | null
        }
        Relationships: []
      }
      kg_frameworks: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          key: string | null
          metadata: Json | null
          node_type: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          key?: string | null
          metadata?: Json | null
          node_type?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          key?: string | null
          metadata?: Json | null
          node_type?: string | null
          title?: string | null
        }
        Relationships: []
      }
      kg_kpis: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          key: string | null
          metadata: Json | null
          node_type: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          key?: string | null
          metadata?: Json | null
          node_type?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          key?: string | null
          metadata?: Json | null
          node_type?: string | null
          title?: string | null
        }
        Relationships: []
      }
      kg_problems: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          key: string | null
          metadata: Json | null
          node_type: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          key?: string | null
          metadata?: Json | null
          node_type?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          key?: string | null
          metadata?: Json | null
          node_type?: string | null
          title?: string | null
        }
        Relationships: []
      }
      kg_recommendations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          key: string | null
          metadata: Json | null
          node_type: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          key?: string | null
          metadata?: Json | null
          node_type?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          key?: string | null
          metadata?: Json | null
          node_type?: string | null
          title?: string | null
        }
        Relationships: []
      }
      org_health_metrics_latest: {
        Row: {
          avg_cycle_time_seconds: number | null
          dependency_block_rate: number | null
          id: string | null
          measured_at: string | null
          metadata: Json | null
          org_id: string | null
          overdue_rate: number | null
          task_active_count: number | null
          task_blocked_count: number | null
          task_completed_count: number | null
          task_completion_rate: number | null
          task_created_count: number | null
          task_overdue_count: number | null
          team_focus_score: number | null
          window_end: string | null
          window_start: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _count_workdays_in_range: {
        Args: { p_end: string; p_start: string; p_user: string }
        Returns: number
      }
      _create_policy_if_not_exists: {
        Args: { p_cmd: string; p_expr: string; p_name: string; p_table: string }
        Returns: undefined
      }
      _is_workday_for_user: {
        Args: { p_date: string; p_user: string }
        Returns: boolean
      }
      _user_task_stats: {
        Args: { p_user: string }
        Returns: {
          avg_completion_hours: number
          avg_hours_estimate: number
          weekly_throughput: number
        }[]
      }
      aggregate_feature_flag_events: {
        Args: { p_window?: string }
        Returns: undefined
      }
      calculate_algorithm_score: {
        Args: { campaign: string }
        Returns: undefined
      }
      can_delete_initiative: {
        Args: { p_initiative_id: string; p_user_id: string }
        Returns: boolean
      }
      can_update_action_item: {
        Args: { p_action_item_id: string; p_user_id: string }
        Returns: boolean
      }
      check_overdue_tasks: { Args: never; Returns: undefined }
      cleanup_old_notifications: {
        Args: { p_retention_days: number }
        Returns: number
      }
      compute_and_store_org_health_metrics:
        | { Args: { p_org_id: string }; Returns: undefined }
        | {
            Args: {
              p_completed_statuses?: string[]
              p_org_id: string
              p_top_teams?: number
              p_window_end?: string
              p_window_interval?: string
              p_window_start?: string
            }
            Returns: undefined
          }
        | {
            Args: {
              p_org_id: string
              p_top_teams?: number
              p_window_end: string
              p_window_start: string
            }
            Returns: undefined
          }
      compute_next_best_for_user: {
        Args: { p_top_n?: number; p_user: string }
        Returns: {
          action_item_id: string
          generated_at: string
          priority_score: number
          rank: number
          recommendation_reason: string
        }[]
      }
      compute_org_health_metrics_for_all_orgs: {
        Args: never
        Returns: undefined
      }
      compute_predicted_duration: {
        Args: { p_action_item: string }
        Returns: number
      }
      current_user_id: { Args: never; Returns: string }
      generate_daily_plan: { Args: { p_user_id: string }; Returns: Json }
      generate_recommendations_for_org: {
        Args: { p_org_id: string }
        Returns: undefined
      }
      generate_task_reminders: { Args: never; Returns: undefined }
      get_has_role: {
        Args: { p_role: string; p_user: string }
        Returns: boolean
      }
      get_initiative_details: {
        Args: { p_initiative_id: string }
        Returns: Json
      }
      get_initiative_progress: {
        Args: { p_initiative_id: string }
        Returns: number
      }
      get_initiative_signals: {
        Args: { p_initiative_id: string }
        Returns: Json
      }
      get_is_admin: { Args: never; Returns: boolean }
      get_milestone_progress: {
        Args: { p_milestone_id: string }
        Returns: number
      }
      get_notification_recipients: {
        Args: { record_row: Json; table_name: string }
        Returns: string[]
      }
      get_project_kpi_summary:
        | { Args: { p_project_id: string }; Returns: Json }
        | {
            Args: {
              p_below_target?: boolean
              p_last_updated_after?: string
              p_max_value?: number
              p_min_value?: number
              p_name?: string
              p_project_id: string
            }
            Returns: Json
          }
      get_project_milestones:
        | { Args: { p_project_id: string }; Returns: Json }
        | {
            Args: {
              p_completed?: boolean
              p_due_after?: string
              p_due_before?: string
              p_priority?: number
              p_project_id: string
              p_status?: string
            }
            Returns: Json
          }
      get_project_progress:
        | { Args: { p_project_id: string }; Returns: number }
        | {
            Args: { p_completed_status?: string; p_project_id: string }
            Returns: number
          }
      get_signal_summary: { Args: { p_initiative_id: string }; Returns: Json }
      get_tenant_id: { Args: never; Returns: string }
      get_user_action_items: { Args: { p_user_id: string }; Returns: Json }
      get_user_organization: { Args: never; Returns: string }
      is_org_member: { Args: { org_id: string }; Returns: boolean }
      is_workspace_admin: { Args: { p_workspace_id: string }; Returns: boolean }
      kg_recommendations_for_kpi: {
        Args: { p_kpi_uuid: string }
        Returns: {
          action_id: string
          action_title: string
          recommendation_id: string
          recommendation_title: string
        }[]
      }
      kg_traverse: {
        Args: { max_depth?: number; start_uuid: string }
        Returns: {
          path: string[]
          types: string[]
        }[]
      }
      mark_notification_read: {
        Args: { p_notification_id: string }
        Returns: {
          body: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          is_read: boolean
          title: string
          user_id: string
        }[]
      }
      notifications_is_owner: {
        Args: { p_notification_id: string }
        Returns: boolean
      }
      predict_user_overload: {
        Args: { p_user: string }
        Returns: {
          advisory: string
          details: Json
          overload_score: number
        }[]
      }
      process_due_reminders: {
        Args: { p_limit?: number; p_now?: string }
        Returns: {
          processed_count: number
        }[]
      }
      process_due_reminders_v2: {
        Args: { p_limit?: number; p_now?: string }
        Returns: {
          processed_count: number
        }[]
      }
      run_signal_detectors: { Args: never; Returns: undefined }
      suggest_snoozes: {
        Args: { p_user: string }
        Returns: {
          reason: string
          suggested_date: string
        }[]
      }
      upsert_next_best_for_user: {
        Args: { p_top_n?: number; p_user: string }
        Returns: undefined
      }
    }
    Enums: {
      status_enum_api_keys: "active"
      status_enum_diagnostics: "open"
      status_enum_initiatives: "active"
      status_enum_organization_members: "active"
      status_enum_risks: "'open'"
      status_enum_tasks: "open"
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
    Enums: {
      status_enum_api_keys: ["active"],
      status_enum_diagnostics: ["open"],
      status_enum_initiatives: ["active"],
      status_enum_organization_members: ["active"],
      status_enum_risks: ["'open'"],
      status_enum_tasks: ["open"],
    },
  },
} as const
