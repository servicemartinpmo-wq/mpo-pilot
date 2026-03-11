-- ═══════════════════════════════════════════════════════
-- NEW MODULES: Agile, CRM, Automation, Campaign Insights
-- ═══════════════════════════════════════════════════════

-- ── AGILE WORK MANAGEMENT ─────────────────────────────

CREATE TABLE IF NOT EXISTS public.epics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','on_hold','cancelled')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical','high','medium','low')),
  start_date date,
  end_date date,
  progress_pct integer DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  owner_id uuid REFERENCES public.users(id),
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  epic_id uuid REFERENCES public.epics(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  acceptance_criteria text,
  status text NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog','todo','in_progress','review','done')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical','high','medium','low')),
  story_points integer DEFAULT 0,
  assignee_id uuid REFERENCES public.users(id),
  sprint_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  goal text,
  status text NOT NULL DEFAULT 'planning' CHECK (status IN ('planning','active','completed','cancelled')),
  start_date date,
  end_date date,
  velocity integer DEFAULT 0,
  total_points integer DEFAULT 0,
  completed_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add sprint_id FK now that sprints table exists
ALTER TABLE public.stories ADD CONSTRAINT stories_sprint_id_fkey
  FOREIGN KEY (sprint_id) REFERENCES public.sprints(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.bugs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical','high','medium','low')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed','wont_fix')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical','high','medium','low')),
  assignee_id uuid REFERENCES public.users(id),
  reporter_id uuid REFERENCES public.users(id),
  related_story_id uuid REFERENCES public.stories(id) ON DELETE SET NULL,
  steps_to_reproduce text,
  expected_behavior text,
  actual_behavior text,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('action_item','story','bug','project','epic')),
  entity_id uuid NOT NULL,
  author_id uuid REFERENCES public.users(id),
  content text NOT NULL,
  is_edited boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ── CRM MODULE ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.crm_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  industry text,
  website text,
  phone text,
  email text,
  employee_count text,
  estimated_revenue text,
  city text,
  state text,
  country text,
  status text NOT NULL DEFAULT 'prospect' CHECK (status IN ('prospect','active','inactive','churned')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.crm_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  email_type text DEFAULT 'work',
  phone text,
  alt_phone text,
  title text,
  industry text,
  sector text,
  linkedin text,
  twitter text,
  relevance_score integer DEFAULT 0 CHECK (relevance_score BETWEEN 0 AND 100),
  interest_score integer DEFAULT 0 CHECK (interest_score BETWEEN 0 AND 100),
  engagement_rank integer DEFAULT 0 CHECK (engagement_rank BETWEEN 0 AND 100),
  combined_score integer DEFAULT 0 CHECK (combined_score BETWEEN 0 AND 100),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.crm_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  name text NOT NULL,
  stage text NOT NULL DEFAULT 'lead' CHECK (stage IN ('lead','qualified','proposal','negotiation','closed_won','closed_lost')),
  value numeric DEFAULT 0,
  probability integer DEFAULT 0 CHECK (probability BETWEEN 0 AND 100),
  expected_close_date date,
  owner_id uuid REFERENCES public.users(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ── AUTOMATION ENGINE ─────────────────────────────────

CREATE TABLE IF NOT EXISTS public.automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  trigger_event text NOT NULL CHECK (trigger_event IN ('task_overdue','kpi_drop','project_delay','deadline_approaching','team_overload','signal_critical','manual')),
  is_enabled boolean DEFAULT true,
  run_count integer DEFAULT 0,
  last_run_at timestamptz,
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.automation_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  field text NOT NULL,
  operator text NOT NULL CHECK (operator IN ('equals','not_equals','greater_than','less_than','contains','is_empty','is_not_empty')),
  value text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.automation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  action_type text NOT NULL CHECK (action_type IN ('send_notification','create_action_item','escalate','update_status','assign_to','send_email','log_event')),
  config jsonb DEFAULT '{}',
  sequence_order integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.automation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  trigger_data jsonb DEFAULT '{}',
  actions_taken jsonb DEFAULT '[]',
  status text NOT NULL DEFAULT 'success' CHECK (status IN ('success','failed','skipped')),
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- ── CAMPAIGN AI INSIGHTS (Marketing Intelligence) ─────
-- Table may already exist from earlier migration — safely add missing columns

ALTER TABLE public.campaign_ai_insights ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.campaign_ai_insights ADD COLUMN IF NOT EXISTS campaign_name text;
ALTER TABLE public.campaign_ai_insights ADD COLUMN IF NOT EXISTS engagement_score numeric DEFAULT 0;
ALTER TABLE public.campaign_ai_insights ADD COLUMN IF NOT EXISTS relevance_score numeric DEFAULT 0;
ALTER TABLE public.campaign_ai_insights ADD COLUMN IF NOT EXISTS conversion_score numeric DEFAULT 0;
ALTER TABLE public.campaign_ai_insights ADD COLUMN IF NOT EXISTS authority_score numeric DEFAULT 0;
ALTER TABLE public.campaign_ai_insights ADD COLUMN IF NOT EXISTS freshness_score numeric DEFAULT 0;
ALTER TABLE public.campaign_ai_insights ADD COLUMN IF NOT EXISTS network_score numeric DEFAULT 0;
ALTER TABLE public.campaign_ai_insights ADD COLUMN IF NOT EXISTS efficiency_score numeric DEFAULT 0;
ALTER TABLE public.campaign_ai_insights ADD COLUMN IF NOT EXISTS platform text;
ALTER TABLE public.campaign_ai_insights ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- ── USER MODES & PREFERENCES ──────────────────────────

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  user_mode text DEFAULT 'executive' CHECK (user_mode IN ('founder','executive','startup','creative','freelance')),
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free','professional','workflow','command','enterprise')),
  theme_preference text DEFAULT 'dark',
  dashboard_layout jsonb DEFAULT '{}',
  dismissed_banners text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ── TIMESTAMPS ────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_epics_timestamps') THEN
    CREATE TRIGGER trg_epics_timestamps BEFORE INSERT OR UPDATE ON public.epics FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_stories_timestamps') THEN
    CREATE TRIGGER trg_stories_timestamps BEFORE INSERT OR UPDATE ON public.stories FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_sprints_timestamps') THEN
    CREATE TRIGGER trg_sprints_timestamps BEFORE INSERT OR UPDATE ON public.sprints FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_bugs_timestamps') THEN
    CREATE TRIGGER trg_bugs_timestamps BEFORE INSERT OR UPDATE ON public.bugs FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_crm_companies_timestamps') THEN
    CREATE TRIGGER trg_crm_companies_timestamps BEFORE INSERT OR UPDATE ON public.crm_companies FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_crm_contacts_timestamps') THEN
    CREATE TRIGGER trg_crm_contacts_timestamps BEFORE INSERT OR UPDATE ON public.crm_contacts FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_crm_opportunities_timestamps') THEN
    CREATE TRIGGER trg_crm_opportunities_timestamps BEFORE INSERT OR UPDATE ON public.crm_opportunities FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_automation_rules_timestamps') THEN
    CREATE TRIGGER trg_automation_rules_timestamps BEFORE INSERT OR UPDATE ON public.automation_rules FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_campaign_ai_insights_timestamps') THEN
    CREATE TRIGGER trg_campaign_ai_insights_timestamps BEFORE INSERT OR UPDATE ON public.campaign_ai_insights FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();
  END IF;
END $$;

-- ── RLS (basic enable) ─────────────────────────────────

ALTER TABLE public.epics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- ── INDEXES ───────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_epics_org ON public.epics(organization_id);
CREATE INDEX IF NOT EXISTS idx_stories_epic ON public.stories(epic_id);
CREATE INDEX IF NOT EXISTS idx_stories_sprint ON public.stories(sprint_id);
CREATE INDEX IF NOT EXISTS idx_bugs_org ON public.bugs(organization_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_entity ON public.task_comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_crm_companies_org ON public.crm_companies(organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_company ON public.crm_contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_org ON public.crm_opportunities(organization_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_org ON public.automation_rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_rule ON public.automation_logs(rule_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_ai_insights_org ON public.campaign_ai_insights(organization_id);
