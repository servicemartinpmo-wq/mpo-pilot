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
      action_items: {
        Row: {
          assigned_to: string | null
          completed_date: string | null
          created_at: string
          dependency: string | null
          description: string | null
          due_date: string | null
          id: string
          initiative_id: string | null
          priority: string | null
          profile_id: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string
          dependency?: string | null
          description?: string | null
          due_date?: string | null
          id: string
          initiative_id?: string | null
          priority?: string | null
          profile_id: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string
          dependency?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          initiative_id?: string | null
          priority?: string | null
          profile_id?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_items_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      authority_matrix: {
        Row: {
          budget_authority: string | null
          created_at: string
          department: string | null
          hiring_authority: string | null
          id: string
          initiative_approval: string | null
          level: string | null
          person: string | null
          profile_id: string
          risk_approval: string | null
          role: string
          updated_at: string
        }
        Insert: {
          budget_authority?: string | null
          created_at?: string
          department?: string | null
          hiring_authority?: string | null
          id?: string
          initiative_approval?: string | null
          level?: string | null
          person?: string | null
          profile_id: string
          risk_approval?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          budget_authority?: string | null
          created_at?: string
          department?: string | null
          hiring_authority?: string | null
          id?: string
          initiative_approval?: string | null
          level?: string | null
          person?: string | null
          profile_id?: string
          risk_approval?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "authority_matrix_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_prompts: {
        Row: {
          applied: boolean | null
          category: string | null
          created_at: string
          id: string
          profile_id: string
          prompt_text: string
        }
        Insert: {
          applied?: boolean | null
          category?: string | null
          created_at?: string
          id?: string
          profile_id: string
          prompt_text: string
        }
        Update: {
          applied?: boolean | null
          category?: string | null
          created_at?: string
          id?: string
          profile_id?: string
          prompt_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_prompts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          active_initiatives: number | null
          authority_level: string | null
          blocked_tasks: number | null
          capacity_used: number | null
          core_responsibilities: string[] | null
          created_at: string
          decision_rights: string[] | null
          execution_health: number | null
          frameworks: string[] | null
          head: string | null
          headcount: number | null
          id: string
          key_functions: string[] | null
          key_kpis: Json | null
          maturity_score: number | null
          maturity_tier: string | null
          name: string
          profile_id: string
          risk_score: number | null
          signal: string | null
          sop_adherence: number | null
          updated_at: string
        }
        Insert: {
          active_initiatives?: number | null
          authority_level?: string | null
          blocked_tasks?: number | null
          capacity_used?: number | null
          core_responsibilities?: string[] | null
          created_at?: string
          decision_rights?: string[] | null
          execution_health?: number | null
          frameworks?: string[] | null
          head?: string | null
          headcount?: number | null
          id: string
          key_functions?: string[] | null
          key_kpis?: Json | null
          maturity_score?: number | null
          maturity_tier?: string | null
          name: string
          profile_id: string
          risk_score?: number | null
          signal?: string | null
          sop_adherence?: number | null
          updated_at?: string
        }
        Update: {
          active_initiatives?: number | null
          authority_level?: string | null
          blocked_tasks?: number | null
          capacity_used?: number | null
          core_responsibilities?: string[] | null
          created_at?: string
          decision_rights?: string[] | null
          execution_health?: number | null
          frameworks?: string[] | null
          head?: string | null
          headcount?: number | null
          id?: string
          key_functions?: string[] | null
          key_kpis?: Json | null
          maturity_score?: number | null
          maturity_tier?: string | null
          name?: string
          profile_id?: string
          risk_score?: number | null
          signal?: string | null
          sop_adherence?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_logs: {
        Row: {
          created_at: string
          created_date: string | null
          id: string
          initiative_id: string | null
          notes: string | null
          owner: string | null
          profile_id: string
          severity: number | null
          status: string | null
          title: string
          type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_date?: string | null
          id: string
          initiative_id?: string | null
          notes?: string | null
          owner?: string | null
          profile_id: string
          severity?: number | null
          status?: string | null
          title: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_date?: string | null
          id?: string
          initiative_id?: string | null
          notes?: string | null
          owner?: string | null
          profile_id?: string
          severity?: number | null
          status?: string | null
          title?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "governance_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      initiatives: {
        Row: {
          budget: number | null
          budget_used: number | null
          category: string | null
          completion_pct: number | null
          created_at: string
          department: string | null
          dependencies: string[] | null
          dependency_risk: number | null
          description: string | null
          estimated_impact: string | null
          executive_owner: string | null
          frameworks: string[] | null
          health_status: string | null
          id: string
          kpis: string[] | null
          name: string
          owner: string | null
          priority_score: number | null
          profile_id: string
          raci: Json | null
          risks: Json | null
          signal: string | null
          start_date: string | null
          status: string | null
          strategic_alignment: number | null
          strategic_pillar: string | null
          target_date: string | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          budget_used?: number | null
          category?: string | null
          completion_pct?: number | null
          created_at?: string
          department?: string | null
          dependencies?: string[] | null
          dependency_risk?: number | null
          description?: string | null
          estimated_impact?: string | null
          executive_owner?: string | null
          frameworks?: string[] | null
          health_status?: string | null
          id: string
          kpis?: string[] | null
          name: string
          owner?: string | null
          priority_score?: number | null
          profile_id: string
          raci?: Json | null
          risks?: Json | null
          signal?: string | null
          start_date?: string | null
          status?: string | null
          strategic_alignment?: number | null
          strategic_pillar?: string | null
          target_date?: string | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          budget_used?: number | null
          category?: string | null
          completion_pct?: number | null
          created_at?: string
          department?: string | null
          dependencies?: string[] | null
          dependency_risk?: number | null
          description?: string | null
          estimated_impact?: string | null
          executive_owner?: string | null
          frameworks?: string[] | null
          health_status?: string | null
          id?: string
          kpis?: string[] | null
          name?: string
          owner?: string | null
          priority_score?: number | null
          profile_id?: string
          raci?: Json | null
          risks?: Json | null
          signal?: string | null
          start_date?: string | null
          status?: string | null
          strategic_alignment?: number | null
          strategic_pillar?: string | null
          target_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "initiatives_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      insights: {
        Row: {
          created_at: string
          department: string | null
          diagnosis: string | null
          executive_priority_score: number | null
          framework: string | null
          id: string
          leverage: number | null
          operational_risk: number | null
          profile_id: string
          recommendation: string | null
          signal: string | null
          situation: string | null
          strategic_impact: number | null
          system_remedy: string | null
          type: string
          updated_at: string
          urgency: number | null
        }
        Insert: {
          created_at?: string
          department?: string | null
          diagnosis?: string | null
          executive_priority_score?: number | null
          framework?: string | null
          id: string
          leverage?: number | null
          operational_risk?: number | null
          profile_id: string
          recommendation?: string | null
          signal?: string | null
          situation?: string | null
          strategic_impact?: number | null
          system_remedy?: string | null
          type: string
          updated_at?: string
          urgency?: number | null
        }
        Update: {
          created_at?: string
          department?: string | null
          diagnosis?: string | null
          executive_priority_score?: number | null
          framework?: string | null
          id?: string
          leverage?: number | null
          operational_risk?: number | null
          profile_id?: string
          recommendation?: string | null
          signal?: string | null
          situation?: string | null
          strategic_impact?: number | null
          system_remedy?: string | null
          type?: string
          updated_at?: string
          urgency?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "insights_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_connections: {
        Row: {
          config: Json | null
          connected_at: string | null
          id: string
          integration_id: string
          profile_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          config?: Json | null
          connected_at?: string | null
          id?: string
          integration_id: string
          profile_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          config?: Json | null
          connected_at?: string | null
          id?: string
          integration_id?: string
          profile_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_connections_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      org_metrics: {
        Row: {
          active_initiatives: number | null
          avg_execution_health: number | null
          avg_sop_adherence: number | null
          avg_strategic_alignment: number | null
          blocked_tasks: number | null
          decision_deadlines: number | null
          governance_open_items: number | null
          id: string
          overall_maturity_score: number | null
          profile_id: string
          sop_coverage: number | null
          total_budget_allocated: number | null
          total_budget_used: number | null
          total_headcount: number | null
          updated_at: string
        }
        Insert: {
          active_initiatives?: number | null
          avg_execution_health?: number | null
          avg_sop_adherence?: number | null
          avg_strategic_alignment?: number | null
          blocked_tasks?: number | null
          decision_deadlines?: number | null
          governance_open_items?: number | null
          id?: string
          overall_maturity_score?: number | null
          profile_id: string
          sop_coverage?: number | null
          total_budget_allocated?: number | null
          total_budget_used?: number | null
          total_headcount?: number | null
          updated_at?: string
        }
        Update: {
          active_initiatives?: number | null
          avg_execution_health?: number | null
          avg_sop_adherence?: number | null
          avg_strategic_alignment?: number | null
          blocked_tasks?: number | null
          decision_deadlines?: number | null
          governance_open_items?: number | null
          id?: string
          overall_maturity_score?: number | null
          profile_id?: string
          sop_coverage?: number | null
          total_budget_allocated?: number | null
          total_budget_used?: number | null
          total_headcount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_metrics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accent_hue: number | null
          avatar_url: string | null
          created_at: string
          current_state: string | null
          density: string | null
          departments: string[] | null
          email: string | null
          font: string | null
          future_state: string | null
          has_sops: boolean | null
          id: string
          industry: string | null
          onboarding_complete: boolean | null
          org_name: string | null
          org_type: string | null
          revenue_range: string | null
          team_size: string | null
          updated_at: string
          user_name: string | null
        }
        Insert: {
          accent_hue?: number | null
          avatar_url?: string | null
          created_at?: string
          current_state?: string | null
          density?: string | null
          departments?: string[] | null
          email?: string | null
          font?: string | null
          future_state?: string | null
          has_sops?: boolean | null
          id: string
          industry?: string | null
          onboarding_complete?: boolean | null
          org_name?: string | null
          org_type?: string | null
          revenue_range?: string | null
          team_size?: string | null
          updated_at?: string
          user_name?: string | null
        }
        Update: {
          accent_hue?: number | null
          avatar_url?: string | null
          created_at?: string
          current_state?: string | null
          density?: string | null
          departments?: string[] | null
          email?: string | null
          font?: string | null
          future_state?: string | null
          has_sops?: boolean | null
          id?: string
          industry?: string | null
          onboarding_complete?: boolean | null
          org_name?: string | null
          org_type?: string | null
          revenue_range?: string | null
          team_size?: string | null
          updated_at?: string
          user_name?: string | null
        }
        Relationships: []
      }
      sop_records: {
        Row: {
          adherence_rate: number | null
          created_at: string
          department: string | null
          document_url: string | null
          id: string
          last_reviewed: string | null
          owner: string | null
          profile_id: string
          status: string | null
          title: string
          updated_at: string
          version: string | null
        }
        Insert: {
          adherence_rate?: number | null
          created_at?: string
          department?: string | null
          document_url?: string | null
          id: string
          last_reviewed?: string | null
          owner?: string | null
          profile_id: string
          status?: string | null
          title: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          adherence_rate?: number | null
          created_at?: string
          department?: string | null
          document_url?: string | null
          id?: string
          last_reviewed?: string | null
          owner?: string | null
          profile_id?: string
          status?: string | null
          title?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sop_records_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          avatar_url: string | null
          blocked: number | null
          created_at: string
          delegated: number | null
          department: string | null
          email: string | null
          id: string
          load_pct: number | null
          mocha_assignments: Json | null
          name: string
          profile_id: string
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          blocked?: number | null
          created_at?: string
          delegated?: number | null
          department?: string | null
          email?: string | null
          id: string
          load_pct?: number | null
          mocha_assignments?: Json | null
          name: string
          profile_id: string
          role: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          blocked?: number | null
          created_at?: string
          delegated?: number | null
          department?: string | null
          email?: string | null
          id?: string
          load_pct?: number | null
          mocha_assignments?: Json | null
          name?: string
          profile_id?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
