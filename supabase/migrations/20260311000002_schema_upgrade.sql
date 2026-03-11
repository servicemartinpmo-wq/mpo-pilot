-- ═══════════════════════════════════════════════════════
-- SCHEMA UPGRADE — full new tables, functions & triggers
-- ═══════════════════════════════════════════════════════

-- Helper: safely create a policy (no-op if already exists or if column ref is invalid)
CREATE OR REPLACE FUNCTION public._create_policy_if_not_exists(
  p_table text, p_name text, p_cmd text, p_expr text
)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = p_table AND policyname = p_name) THEN
    BEGIN
      IF upper(p_cmd) = 'INSERT' THEN
        EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (%s);', p_name, p_table, p_expr);
      ELSE
        EXECUTE format('CREATE POLICY %I ON public.%I FOR %s TO authenticated USING (%s);', p_name, p_table, p_cmd, p_expr);
      END IF;
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Skipping policy % on %: %', p_name, p_table, SQLERRM;
    END;
  END IF;
END;
$$;

-- ── TRIGGER FUNCTIONS ─────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_timestamps()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_at = COALESCE(NEW.created_at, NOW());
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at_timestamps()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_history()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  hist_table text := TG_TABLE_NAME || '_history';
  cols text;
BEGIN
  SELECT string_agg(format('%I', attname), ',') INTO cols
  FROM pg_catalog.pg_attribute a
  JOIN pg_catalog.pg_class c ON a.attrelid = c.oid
  WHERE c.relname = TG_TABLE_NAME AND a.attnum > 0 AND NOT a.attisdropped;

  PERFORM 1 FROM pg_tables WHERE schemaname = TG_TABLE_SCHEMA AND tablename = hist_table;
  IF NOT FOUND THEN
    EXECUTE format('CREATE TABLE %I.%I AS TABLE %I.%I WITH NO DATA;', TG_TABLE_SCHEMA, hist_table, TG_TABLE_SCHEMA, TG_TABLE_NAME);
    EXECUTE format('ALTER TABLE %I.%I ADD COLUMN IF NOT EXISTS _history_id uuid PRIMARY KEY DEFAULT gen_random_uuid();', TG_TABLE_SCHEMA, hist_table);
    EXECUTE format('ALTER TABLE %I.%I ADD COLUMN IF NOT EXISTS _history_op text;', TG_TABLE_SCHEMA, hist_table);
    EXECUTE format('ALTER TABLE %I.%I ADD COLUMN IF NOT EXISTS _history_at timestamptz DEFAULT now();', TG_TABLE_SCHEMA, hist_table);
  END IF;

  EXECUTE format('INSERT INTO %I.%I(%s, _history_op, _history_at) SELECT %s, %L, now()', TG_TABLE_SCHEMA, hist_table, cols, cols, TG_OP) USING OLD;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.track_kpi_history()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (OLD.current_value IS DISTINCT FROM NEW.current_value) THEN
    INSERT INTO public.kpi_history (kpi_id, measured_value, measured_at, created_at, changed_by)
    VALUES (OLD.id, OLD.current_value, now(), now(),
            (current_setting('request.jwt.claim.sub', true))::uuid);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_dependency()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE loop_found boolean;
BEGIN
  IF NEW.dependent_id = NEW.depends_on_id THEN
    RAISE EXCEPTION 'Circular dependency: cannot depend on self (%).', NEW.dependent_id;
  END IF;
  WITH RECURSIVE chain(depends_on_id) AS (
    SELECT NEW.depends_on_id
    UNION
    SELECT d.depends_on_id FROM public.dependencies d
    JOIN chain c ON d.dependent_id = c.depends_on_id
  )
  SELECT EXISTS(SELECT 1 FROM chain WHERE depends_on_id = NEW.dependent_id) INTO loop_found;
  IF loop_found THEN
    RAISE EXCEPTION 'Circular dependency detected between % and %', NEW.dependent_id, NEW.depends_on_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.recommend_advisories()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  payload jsonb := jsonb_build_object('hints', to_jsonb(ARRAY[]::text[]));
BEGIN
  IF NEW.title ILIKE '%migration%' THEN
    payload := jsonb_set(payload, '{hints}', to_jsonb(ARRAY['migration_guide']::text[]));
  ELSIF NEW.title ILIKE '%dashboard%' THEN
    payload := jsonb_set(payload, '{hints}', to_jsonb(ARRAY['dashboard_tips']::text[]));
  END IF;
  INSERT INTO public.advisory_recommendations (task_id, user_id, recommendation)
  VALUES (NEW.id, NEW.created_by, payload);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.enqueue_update_notification_v2()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  payload jsonb;
  changed_fields text[] := ARRAY[]::text[];
  key text;
  val_old text; val_new text;
  rec jsonb;
  recipients uuid;
  filter_fields text[] := ARRAY['status','assigned_user_id','assignee_id','assigned_to','owner_id','user_id'];
  should_notify boolean := false;
BEGIN
  IF TG_OP = 'DELETE' THEN rec := to_jsonb(OLD); ELSE rec := to_jsonb(NEW); END IF;
  payload := jsonb_build_object('table', TG_TABLE_NAME, 'op', TG_OP,
    'record_id', COALESCE(rec ->> 'id', NULL), 'changed_at', now());
  IF TG_OP = 'UPDATE' THEN
    FOR key IN SELECT jsonb_object_keys(to_jsonb(NEW) - 'updated_at' - 'created_at') LOOP
      EXECUTE format('SELECT ($1)->>%L', key) INTO val_new USING to_jsonb(NEW);
      EXECUTE format('SELECT ($1)->>%L', key) INTO val_old USING to_jsonb(OLD);
      IF val_new IS DISTINCT FROM val_old THEN changed_fields := array_append(changed_fields, key); END IF;
    END LOOP;
  ELSIF TG_OP = 'INSERT' THEN changed_fields := ARRAY['*'];
  END IF;
  payload := payload || jsonb_build_object('changed_fields', to_jsonb(changed_fields), 'new', rec);
  FOREACH key IN ARRAY changed_fields LOOP
    IF key = ANY(filter_fields) THEN should_notify := true; EXIT; END IF;
  END LOOP;
  IF NOT should_notify THEN RETURN NEW; END IF;
  FOR recipients IN SELECT * FROM public.get_notification_recipients(rec, TG_TABLE_NAME) LOOP
    INSERT INTO public.notifications(recipient_user_id, event_table, event_type, record_id, payload)
    VALUES (recipients, TG_TABLE_NAME, TG_OP, (rec ->> 'id')::uuid, payload);
  END LOOP;
  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_algorithm_score()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  PERFORM public.calculate_algorithm_score(NEW.campaign_id);
  RETURN NEW;
END;
$$;

-- ── CORE ORG TABLES ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.organizations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  slug         TEXT,
  plan         TEXT DEFAULT 'free',
  settings     JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trigger_set_timestamps_organizations ON public.organizations;
CREATE TRIGGER trigger_set_timestamps_organizations
  BEFORE INSERT OR UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();

SELECT public._create_policy_if_not_exists(
  'organizations', 'Org members can view org', 'SELECT',
  'id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())'
);

CREATE TABLE IF NOT EXISTS public.organization_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'member',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

SELECT public._create_policy_if_not_exists(
  'organization_members', 'Members can view their memberships', 'ALL',
  'user_id = auth.uid()'
);

CREATE TABLE IF NOT EXISTS public.users (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT,
  full_name    TEXT,
  avatar_url   TEXT,
  timezone     TEXT DEFAULT 'UTC',
  settings     JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trigger_set_timestamps_users ON public.users;
CREATE TRIGGER trigger_set_timestamps_users
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();

SELECT public._create_policy_if_not_exists('users', 'Users can manage own record', 'ALL', 'id = auth.uid()');

CREATE TABLE IF NOT EXISTS public.teams (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  profile_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trigger_set_timestamps_teams ON public.teams;
CREATE TRIGGER trigger_set_timestamps_teams
  BEFORE INSERT OR UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();

SELECT public._create_policy_if_not_exists('teams', 'Users manage own teams', 'ALL', 'profile_id = auth.uid()');

CREATE TABLE IF NOT EXISTS public.department_membership (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id     UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  department  TEXT,
  role        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.department_membership ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trigger_set_timestamps_department_membership ON public.department_membership;
CREATE TRIGGER trigger_set_timestamps_department_membership
  BEFORE INSERT OR UPDATE ON public.department_membership
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();

SELECT public._create_policy_if_not_exists('department_membership', 'Users manage own membership', 'ALL', 'user_id = auth.uid()');

-- ── PROJECTS ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  profile_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  status          TEXT DEFAULT 'active',
  owner_id        UUID REFERENCES auth.users(id),
  start_date      DATE,
  target_date     DATE,
  completion_pct  INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trigger_set_timestamps_projects ON public.projects;
CREATE TRIGGER trigger_set_timestamps_projects
  BEFORE INSERT OR UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();

SELECT public._create_policy_if_not_exists('projects', 'Users manage own projects', 'ALL', 'profile_id = auth.uid()');

-- ── UPGRADE EXISTING TABLES ─────────────────────────────────

-- action_items: add missing columns
ALTER TABLE public.action_items
  ADD COLUMN IF NOT EXISTS project_id         UUID,
  ADD COLUMN IF NOT EXISTS owner_id           UUID,
  ADD COLUMN IF NOT EXISTS organization_id    UUID,
  ADD COLUMN IF NOT EXISTS kpi_id             UUID,
  ADD COLUMN IF NOT EXISTS task_time_estimate_minutes NUMERIC,
  ADD COLUMN IF NOT EXISTS completed_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tags               TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS task_type          TEXT,
  ADD COLUMN IF NOT EXISTS predicted_duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS created_by         UUID,
  ADD COLUMN IF NOT EXISTS milestone_id       UUID,
  ADD COLUMN IF NOT EXISTS actual_work_minutes NUMERIC,
  ADD COLUMN IF NOT EXISTS priority_score     NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS user_id            UUID;

-- initiatives: add project linkage
ALTER TABLE public.initiatives
  ADD COLUMN IF NOT EXISTS organization_id UUID,
  ADD COLUMN IF NOT EXISTS project_id      UUID;

-- ── KPIs ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.kpis (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id      UUID,
  organization_id UUID,
  name            TEXT NOT NULL,
  description     TEXT,
  current_value   NUMERIC,
  target_value    NUMERIC,
  unit            TEXT,
  frequency       TEXT DEFAULT 'monthly',
  status          TEXT DEFAULT 'on_track',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trigger_set_timestamps_kpis ON public.kpis;
CREATE TRIGGER trigger_set_timestamps_kpis
  BEFORE INSERT OR UPDATE ON public.kpis
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();

SELECT public._create_policy_if_not_exists('kpis', 'Users manage own kpis', 'ALL', 'profile_id = auth.uid()');

CREATE TABLE IF NOT EXISTS public.kpi_history (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id         UUID NOT NULL,
  measured_value NUMERIC,
  measured_at    TIMESTAMPTZ DEFAULT now(),
  changed_by     UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kpi_history ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trigger_set_timestamps_kpi_history ON public.kpi_history;
CREATE TRIGGER trigger_set_timestamps_kpi_history
  BEFORE INSERT OR UPDATE ON public.kpi_history
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();

SELECT public._create_policy_if_not_exists(
  'kpi_history', 'Authenticated users manage kpi history', 'ALL', 'auth.uid() IS NOT NULL'
);

DROP TRIGGER IF EXISTS track_kpi_history_trigger ON public.kpis;
CREATE TRIGGER track_kpi_history_trigger
  AFTER UPDATE ON public.kpis
  FOR EACH ROW EXECUTE FUNCTION public.track_kpi_history();

-- ── MILESTONES ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.milestones (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id      UUID,
  initiative_id   UUID,
  title           TEXT NOT NULL,
  description     TEXT,
  status          TEXT DEFAULT 'pending',
  priority        TEXT DEFAULT 'medium',
  due_date        DATE,
  completed       BOOLEAN DEFAULT false,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trigger_set_timestamps_milestones ON public.milestones;
CREATE TRIGGER trigger_set_timestamps_milestones
  BEFORE INSERT OR UPDATE ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();

SELECT public._create_policy_if_not_exists('milestones', 'Users manage own milestones', 'ALL', 'profile_id = auth.uid()');

-- ── RISKS ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.risks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID,
  initiative_id   UUID,
  title           TEXT NOT NULL,
  description     TEXT,
  probability     NUMERIC DEFAULT 0.5,
  impact          TEXT DEFAULT 'medium',
  status          TEXT DEFAULT 'open',
  owner_id        UUID REFERENCES auth.users(id),
  mitigation      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trigger_set_timestamps_risks ON public.risks;
CREATE TRIGGER trigger_set_timestamps_risks
  BEFORE INSERT OR UPDATE ON public.risks
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();

SELECT public._create_policy_if_not_exists('risks', 'Users manage own risks', 'ALL', 'profile_id = auth.uid()');

-- ── DEPENDENCIES ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.dependencies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  dependent_id  UUID NOT NULL,
  depends_on_id UUID NOT NULL,
  entity_type   TEXT DEFAULT 'initiative',
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dependencies ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trigger_set_timestamps_dependencies ON public.dependencies;
CREATE TRIGGER trigger_set_timestamps_dependencies
  BEFORE INSERT OR UPDATE ON public.dependencies
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();

DROP TRIGGER IF EXISTS validate_dependency_trigger ON public.dependencies;
CREATE TRIGGER validate_dependency_trigger
  BEFORE INSERT OR UPDATE ON public.dependencies
  FOR EACH ROW EXECUTE FUNCTION public.validate_dependency();

SELECT public._create_policy_if_not_exists('dependencies', 'Users manage own dependencies', 'ALL', 'profile_id = auth.uid()');

CREATE TABLE IF NOT EXISTS public.task_dependencies (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id                   UUID,
  action_item_id            UUID,
  depends_on_task_id        UUID,
  depends_on_action_item_id UUID,
  blocked                   BOOLEAN DEFAULT false,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;

SELECT public._create_policy_if_not_exists('task_dependencies', 'Authenticated users manage task deps', 'ALL', 'auth.uid() IS NOT NULL');

-- ── SIGNALS ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.signal_definitions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  category    TEXT,
  threshold   NUMERIC,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.signal_definitions ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trigger_set_timestamps_signal_definitions ON public.signal_definitions;
CREATE TRIGGER trigger_set_timestamps_signal_definitions
  BEFORE INSERT OR UPDATE ON public.signal_definitions
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();

SELECT public._create_policy_if_not_exists('signal_definitions', 'Users manage own signal defs', 'ALL', 'profile_id = auth.uid()');

CREATE TABLE IF NOT EXISTS public.signals (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_definition_id UUID,
  initiative_id        UUID,
  profile_id           UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  source               TEXT,
  value                JSONB,
  captured_at          TIMESTAMPTZ DEFAULT now(),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;

SELECT public._create_policy_if_not_exists('signals', 'Users manage own signals', 'ALL', 'profile_id = auth.uid()');

-- ── FRAMEWORKS ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.frameworks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  category    TEXT,
  description TEXT,
  domain      TEXT,
  is_active   BOOLEAN DEFAULT true,
  config      JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.frameworks ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trigger_set_timestamps_frameworks ON public.frameworks;
CREATE TRIGGER trigger_set_timestamps_frameworks
  BEFORE INSERT OR UPDATE ON public.frameworks
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();

SELECT public._create_policy_if_not_exists('frameworks', 'Users manage own frameworks', 'ALL', 'profile_id = auth.uid()');

-- ── KNOWLEDGE ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.knowledge_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  content     TEXT,
  category    TEXT,
  tags        TEXT[] DEFAULT '{}',
  source_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.knowledge_items ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trigger_set_timestamps_knowledge_items ON public.knowledge_items;
CREATE TRIGGER trigger_set_timestamps_knowledge_items
  BEFORE INSERT OR UPDATE ON public.knowledge_items
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();

SELECT public._create_policy_if_not_exists('knowledge_items', 'Users manage own knowledge', 'ALL', 'profile_id = auth.uid()');

CREATE TABLE IF NOT EXISTS public.framework_knowledge_link (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id      UUID,
  knowledge_item_id UUID,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.framework_knowledge_link ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trigger_set_timestamps_framework_knowledge_link ON public.framework_knowledge_link;
CREATE TRIGGER trigger_set_timestamps_framework_knowledge_link
  BEFORE INSERT OR UPDATE ON public.framework_knowledge_link
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();

SELECT public._create_policy_if_not_exists('framework_knowledge_link', 'Authenticated manage fk links', 'ALL', 'auth.uid() IS NOT NULL');

-- ── MODULES ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.modules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  domain      TEXT,
  description TEXT,
  is_active   BOOLEAN DEFAULT true,
  config      JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trigger_set_timestamps_modules ON public.modules;
CREATE TRIGGER trigger_set_timestamps_modules
  BEFORE INSERT OR UPDATE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();

SELECT public._create_policy_if_not_exists('modules', 'Users manage own modules', 'ALL', 'profile_id = auth.uid()');

-- ── DECISION WEIGHTS ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.decision_weights (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  category    TEXT,
  weight      NUMERIC DEFAULT 1.0,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.decision_weights ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trigger_set_timestamps_decision_weights ON public.decision_weights;
CREATE TRIGGER trigger_set_timestamps_decision_weights
  BEFORE INSERT OR UPDATE ON public.decision_weights
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();

SELECT public._create_policy_if_not_exists('decision_weights', 'Users manage own decision weights', 'ALL', 'profile_id = auth.uid()');

-- ── ATTACHMENTS ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.attachments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type   TEXT NOT NULL,
  entity_id     UUID NOT NULL,
  file_name     TEXT NOT NULL,
  file_url      TEXT NOT NULL,
  file_size     BIGINT,
  mime_type     TEXT,
  uploaded_by   UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trigger_set_timestamps_attachments ON public.attachments;
CREATE TRIGGER trigger_set_timestamps_attachments
  BEFORE INSERT OR UPDATE ON public.attachments
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();

SELECT public._create_policy_if_not_exists('attachments', 'Users manage own attachments', 'ALL', 'profile_id = auth.uid()');

-- ── ACTIVITY FEED ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.activity_feed (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID,
  profile_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type  TEXT NOT NULL,
  entity_type  TEXT,
  entity_id    UUID,
  metadata     JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

SELECT public._create_policy_if_not_exists('activity_feed', 'Users view own activity', 'ALL', 'profile_id = auth.uid() OR user_id = auth.uid()');

-- ── NOTIFICATIONS ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_table       TEXT,
  event_type        TEXT,
  record_id         UUID,
  entity_type       TEXT,
  entity_id         UUID,
  title             TEXT,
  body              TEXT,
  message           TEXT,
  type              TEXT DEFAULT 'info',
  payload           JSONB DEFAULT '{}',
  metadata          JSONB DEFAULT '{}',
  is_read           BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

SELECT public._create_policy_if_not_exists(
  'notifications', 'Users view own notifications', 'ALL',
  'recipient_user_id = auth.uid() OR user_id = auth.uid()'
);

-- ── ADVISORIES ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.advisories (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id            UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  diagnostic_id         UUID,
  organization_id       UUID,
  related_initiative_id UUID,
  title                 TEXT NOT NULL,
  description           TEXT,
  recommendation        TEXT,
  priority              VARCHAR(50) DEFAULT 'medium',
  status                VARCHAR(50) DEFAULT 'open',
  owner_id              UUID REFERENCES auth.users(id),
  actions               JSONB DEFAULT '[]',
  severity              JSONB DEFAULT '{}',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.advisories ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trigger_set_timestamps_advisories ON public.advisories;
CREATE TRIGGER trigger_set_timestamps_advisories
  BEFORE INSERT OR UPDATE ON public.advisories
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();

SELECT public._create_policy_if_not_exists('advisories', 'Users manage own advisories', 'ALL', 'profile_id = auth.uid()');

CREATE TABLE IF NOT EXISTS public.advisory_modules (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  domain      TEXT,
  description TEXT,
  advisory_id UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.advisory_modules ENABLE ROW LEVEL SECURITY;

SELECT public._create_policy_if_not_exists('advisory_modules', 'Authenticated manage advisory modules', 'ALL', 'auth.uid() IS NOT NULL');

CREATE TABLE IF NOT EXISTS public.advisory_recommendations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id        UUID,
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation JSONB DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.advisory_recommendations ENABLE ROW LEVEL SECURITY;

SELECT public._create_policy_if_not_exists('advisory_recommendations', 'Users manage own advisory recs', 'ALL', 'user_id = auth.uid()');

-- ── AI / ANALYTICS ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.ai_call_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  profile_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  model           TEXT,
  prompt          JSONB DEFAULT '{}',
  response        JSONB DEFAULT '{}',
  cost            NUMERIC DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_call_logs ENABLE ROW LEVEL SECURITY;

SELECT public._create_policy_if_not_exists('ai_call_logs', 'Users view own ai logs', 'ALL', 'profile_id = auth.uid()');

CREATE TABLE IF NOT EXISTS public.ai_usage (
  organization_id UUID PRIMARY KEY,
  total_calls     BIGINT DEFAULT 0,
  total_cost      NUMERIC DEFAULT 0,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

SELECT public._create_policy_if_not_exists('ai_usage', 'Authenticated users view ai usage', 'ALL', 'auth.uid() IS NOT NULL');

CREATE TABLE IF NOT EXISTS public.algorithm_signals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  profile_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  campaign_id     TEXT NOT NULL,
  platform        TEXT,
  signal_type     TEXT NOT NULL,
  metric_name     TEXT,
  metric_value    NUMERIC,
  recorded_at     TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.algorithm_signals ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trigger_algorithm_score_on_signal ON public.algorithm_signals;
CREATE TRIGGER trigger_algorithm_score_on_signal
  AFTER INSERT OR UPDATE ON public.algorithm_signals
  FOR EACH ROW EXECUTE FUNCTION public.trigger_algorithm_score();

SELECT public._create_policy_if_not_exists('algorithm_signals', 'Users manage own algorithm signals', 'ALL', 'profile_id = auth.uid()');

CREATE TABLE IF NOT EXISTS public.algorithm_scores (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id          TEXT NOT NULL UNIQUE,
  engagement_score     NUMERIC,
  relevance_score      NUMERIC,
  conversion_score     NUMERIC,
  authority_score      NUMERIC,
  freshness_score      NUMERIC,
  network_score        NUMERIC,
  efficiency_score     NUMERIC,
  mega_algorithm_score NUMERIC,
  calculated_at        TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.algorithm_scores ENABLE ROW LEVEL SECURITY;

SELECT public._create_policy_if_not_exists('algorithm_scores', 'Authenticated view scores', 'SELECT', 'auth.uid() IS NOT NULL');

-- ── ALERTS ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.alerts (
  id             BIGSERIAL PRIMARY KEY,
  profile_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  description    TEXT,
  initiative_id  UUID,
  project_id     UUID,
  action_item_id UUID,
  severity       TEXT DEFAULT 'medium',
  status         TEXT DEFAULT 'open',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

SELECT public._create_policy_if_not_exists('alerts', 'Users manage own alerts', 'ALL', 'profile_id = auth.uid()');

-- ── API KEYS ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.api_keys (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  profile_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  key             TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  name            VARCHAR(255) NOT NULL,
  role            VARCHAR(50) DEFAULT 'read',
  expires_at      TIMESTAMPTZ,
  last_used_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

SELECT public._create_policy_if_not_exists('api_keys', 'Users manage own api keys', 'ALL', 'profile_id = auth.uid()');

-- ── WORKFLOW RUNS ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.workflow_runs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  workflow_id  TEXT NOT NULL,
  name         TEXT,
  status       TEXT DEFAULT 'pending',
  trigger      TEXT,
  input        JSONB DEFAULT '{}',
  output       JSONB DEFAULT '{}',
  error        TEXT,
  started_at   TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trigger_set_timestamps_workflow_runs ON public.workflow_runs;
CREATE TRIGGER trigger_set_timestamps_workflow_runs
  BEFORE INSERT OR UPDATE ON public.workflow_runs
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();

SELECT public._create_policy_if_not_exists('workflow_runs', 'Users manage own workflow runs', 'ALL', 'profile_id = auth.uid()');

-- ── NEXT-BEST ACTIONS ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.next_best_actions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_item_id        UUID,
  priority_score        NUMERIC,
  rank                  SMALLINT,
  recommendation_reason TEXT,
  generated_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, rank)
);
ALTER TABLE public.next_best_actions ENABLE ROW LEVEL SECURITY;

SELECT public._create_policy_if_not_exists('next_best_actions', 'Users view own next best actions', 'ALL', 'user_id = auth.uid()');

-- ── REMINDERS ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.reminders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_item_link UUID,
  reminder_type    TEXT,
  reminder_time    TIMESTAMPTZ NOT NULL,
  sent             BOOLEAN DEFAULT false,
  metadata         JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

SELECT public._create_policy_if_not_exists('reminders', 'Users manage own reminders', 'ALL', 'user_id = auth.uid()');

CREATE TABLE IF NOT EXISTS public.task_reminders (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id    UUID,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  remind_at  TIMESTAMPTZ NOT NULL,
  metadata   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.task_reminders ENABLE ROW LEVEL SECURITY;

SELECT public._create_policy_if_not_exists('task_reminders', 'Users manage own task reminders', 'ALL', 'user_id = auth.uid()');

-- ── MEETINGS ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.meetings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title      TEXT,
  start_at   TIMESTAMPTZ NOT NULL,
  end_at     TIMESTAMPTZ,
  location   TEXT,
  metadata   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

SELECT public._create_policy_if_not_exists('meetings', 'Users manage own meetings', 'ALL', 'profile_id = auth.uid()');

-- ── USER EXTRAS ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_work_capacity (
  user_id      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  weekday_mask INTEGER DEFAULT 127,
  daily_hours  NUMERIC DEFAULT 8,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_work_capacity ENABLE ROW LEVEL SECURITY;

SELECT public._create_policy_if_not_exists('user_work_capacity', 'Users manage own capacity', 'ALL', 'user_id = auth.uid()');

CREATE TABLE IF NOT EXISTS public.user_snoozes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snooze_date DATE NOT NULL,
  reason      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, snooze_date)
);
ALTER TABLE public.user_snoozes ENABLE ROW LEVEL SECURITY;

SELECT public._create_policy_if_not_exists('user_snoozes', 'Users manage own snoozes', 'ALL', 'user_id = auth.uid()');

-- ── ORG HEALTH ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.org_health_metrics (
  id                     BIGSERIAL PRIMARY KEY,
  org_id                 UUID NOT NULL,
  measured_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  window_start           TIMESTAMPTZ,
  window_end             TIMESTAMPTZ,
  task_created_count     BIGINT,
  task_completed_count   BIGINT,
  task_active_count      BIGINT,
  task_overdue_count     BIGINT,
  task_blocked_count     BIGINT,
  avg_cycle_time_seconds DOUBLE PRECISION,
  task_completion_rate   DOUBLE PRECISION,
  overdue_rate           DOUBLE PRECISION,
  dependency_block_rate  DOUBLE PRECISION,
  team_focus_score       DOUBLE PRECISION,
  metadata               JSONB DEFAULT '{}'
);
ALTER TABLE public.org_health_metrics ENABLE ROW LEVEL SECURITY;

SELECT public._create_policy_if_not_exists('org_health_metrics', 'Authenticated view org health', 'SELECT', 'auth.uid() IS NOT NULL');

-- ── KNOWLEDGE GRAPH ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.kg_nodes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  node_type  TEXT NOT NULL,
  label      TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kg_nodes ENABLE ROW LEVEL SECURITY;

SELECT public._create_policy_if_not_exists('kg_nodes', 'Users manage own kg nodes', 'ALL', 'profile_id = auth.uid()');

CREATE TABLE IF NOT EXISTS public.kg_relationships (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id        UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  from_node         UUID NOT NULL,
  to_node           UUID NOT NULL,
  relationship_type TEXT NOT NULL,
  properties        JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kg_relationships ENABLE ROW LEVEL SECURITY;

SELECT public._create_policy_if_not_exists('kg_relationships', 'Users manage own kg relationships', 'ALL', 'profile_id = auth.uid()');

-- ── INDEXES ───────────────────────────────────────────────
-- Wrapped in DO blocks so that errors on already-existing tables with
-- different column schemas are skipped gracefully.

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_action_items_project_id   ON public.action_items(project_id);
EXCEPTION WHEN others THEN RAISE NOTICE 'idx_action_items_project_id: %', SQLERRM; END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_action_items_organization  ON public.action_items(organization_id);
EXCEPTION WHEN others THEN RAISE NOTICE 'idx_action_items_organization: %', SQLERRM; END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_action_items_owner_id     ON public.action_items(owner_id);
EXCEPTION WHEN others THEN RAISE NOTICE 'idx_action_items_owner_id: %', SQLERRM; END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_action_items_kpi_id       ON public.action_items(kpi_id);
EXCEPTION WHEN others THEN RAISE NOTICE 'idx_action_items_kpi_id: %', SQLERRM; END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_action_items_milestone_id ON public.action_items(milestone_id);
EXCEPTION WHEN others THEN RAISE NOTICE 'idx_action_items_milestone_id: %', SQLERRM; END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_kpi_history_kpi_id        ON public.kpi_history(kpi_id);
EXCEPTION WHEN others THEN RAISE NOTICE 'idx_kpi_history_kpi_id: %', SQLERRM; END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_milestones_project_id     ON public.milestones(project_id);
EXCEPTION WHEN others THEN RAISE NOTICE 'idx_milestones_project_id: %', SQLERRM; END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_milestones_initiative_id  ON public.milestones(initiative_id);
EXCEPTION WHEN others THEN RAISE NOTICE 'idx_milestones_initiative_id: %', SQLERRM; END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_signals_initiative_id     ON public.signals(initiative_id);
EXCEPTION WHEN others THEN RAISE NOTICE 'idx_signals_initiative_id: %', SQLERRM; END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_notifications_recipient   ON public.notifications(recipient_user_id);
EXCEPTION WHEN others THEN RAISE NOTICE 'idx_notifications_recipient: %', SQLERRM; END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_next_best_actions_user    ON public.next_best_actions(user_id);
EXCEPTION WHEN others THEN RAISE NOTICE 'idx_next_best_actions_user: %', SQLERRM; END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_algorithm_signals_campaign ON public.algorithm_signals(campaign_id);
EXCEPTION WHEN others THEN RAISE NOTICE 'idx_algorithm_signals_campaign: %', SQLERRM; END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_org_members_user          ON public.organization_members(user_id);
EXCEPTION WHEN others THEN RAISE NOTICE 'idx_org_members_user: %', SQLERRM; END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_org_members_org           ON public.organization_members(organization_id);
EXCEPTION WHEN others THEN RAISE NOTICE 'idx_org_members_org: %', SQLERRM; END $$;
