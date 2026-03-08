
-- ═══════════════════════════════════════════
-- TIMESTAMP HELPER FUNCTION
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ═══════════════════════════════════════════
-- PROFILES (extends auth.users)
-- ═══════════════════════════════════════════
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT,
  user_name     TEXT,
  org_name      TEXT,
  org_type      TEXT,
  industry      TEXT,
  team_size     TEXT,
  revenue_range TEXT,
  current_state TEXT,
  future_state  TEXT,
  departments   TEXT[] DEFAULT '{}',
  has_sops      BOOLEAN DEFAULT false,
  accent_hue    INTEGER DEFAULT 210,
  font          TEXT DEFAULT 'inter',
  density       TEXT DEFAULT 'comfortable',
  onboarding_complete BOOLEAN DEFAULT false,
  avatar_url    TEXT,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════
-- DEPARTMENTS
-- ═══════════════════════════════════════════
CREATE TABLE public.departments (
  id                  TEXT PRIMARY KEY,
  profile_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  head                TEXT,
  headcount           INTEGER DEFAULT 0,
  capacity_used       INTEGER DEFAULT 0,
  risk_score          INTEGER DEFAULT 0,
  execution_health    INTEGER DEFAULT 0,
  maturity_score      INTEGER DEFAULT 0,
  maturity_tier       TEXT DEFAULT 'Foundational',
  active_initiatives  INTEGER DEFAULT 0,
  blocked_tasks       INTEGER DEFAULT 0,
  signal              TEXT DEFAULT 'blue',
  authority_level     TEXT DEFAULT 'Manager',
  sop_adherence       INTEGER DEFAULT 0,
  core_responsibilities TEXT[] DEFAULT '{}',
  key_functions       TEXT[] DEFAULT '{}',
  decision_rights     TEXT[] DEFAULT '{}',
  frameworks          TEXT[] DEFAULT '{}',
  key_kpis            JSONB DEFAULT '[]',
  created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own departments" ON public.departments FOR ALL USING (profile_id = auth.uid());
CREATE TRIGGER departments_updated_at BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════
-- INITIATIVES
-- ═══════════════════════════════════════════
CREATE TABLE public.initiatives (
  id                  TEXT PRIMARY KEY,
  profile_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  department          TEXT,
  category            TEXT DEFAULT 'Directive',
  owner               TEXT,
  executive_owner     TEXT,
  strategic_pillar    TEXT,
  status              TEXT DEFAULT 'On Track',
  health_status       TEXT DEFAULT 'Green',
  priority_score      INTEGER DEFAULT 50,
  strategic_alignment INTEGER DEFAULT 50,
  dependency_risk     INTEGER DEFAULT 0,
  estimated_impact    TEXT DEFAULT 'Medium',
  budget              NUMERIC DEFAULT 0,
  budget_used         NUMERIC DEFAULT 0,
  start_date          DATE,
  target_date         DATE,
  completion_pct      INTEGER DEFAULT 0,
  signal              TEXT DEFAULT 'blue',
  frameworks          TEXT[] DEFAULT '{}',
  dependencies        TEXT[] DEFAULT '{}',
  description         TEXT,
  kpis                TEXT[] DEFAULT '{}',
  risks               JSONB DEFAULT '[]',
  raci                JSONB DEFAULT '[]',
  created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.initiatives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own initiatives" ON public.initiatives FOR ALL USING (profile_id = auth.uid());
CREATE TRIGGER initiatives_updated_at BEFORE UPDATE ON public.initiatives
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════
-- ACTION ITEMS
-- ═══════════════════════════════════════════
CREATE TABLE public.action_items (
  id              TEXT PRIMARY KEY,
  profile_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  initiative_id   TEXT,
  assigned_to     TEXT,
  due_date        DATE,
  status          TEXT DEFAULT 'Not Started',
  priority        TEXT DEFAULT 'Medium',
  description     TEXT,
  dependency      TEXT,
  completed_date  DATE,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own action items" ON public.action_items FOR ALL USING (profile_id = auth.uid());
CREATE TRIGGER action_items_updated_at BEFORE UPDATE ON public.action_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════
-- INSIGHTS
-- ═══════════════════════════════════════════
CREATE TABLE public.insights (
  id                        TEXT PRIMARY KEY,
  profile_id                UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type                      TEXT NOT NULL,
  department                TEXT,
  situation                 TEXT,
  diagnosis                 TEXT,
  recommendation            TEXT,
  system_remedy             TEXT,
  executive_priority_score  INTEGER DEFAULT 50,
  strategic_impact          INTEGER DEFAULT 50,
  urgency                   INTEGER DEFAULT 50,
  operational_risk          INTEGER DEFAULT 50,
  leverage                  INTEGER DEFAULT 50,
  framework                 TEXT DEFAULT 'BSC',
  signal                    TEXT DEFAULT 'yellow',
  created_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own insights" ON public.insights FOR ALL USING (profile_id = auth.uid());
CREATE TRIGGER insights_updated_at BEFORE UPDATE ON public.insights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════
-- GOVERNANCE LOGS
-- ═══════════════════════════════════════════
CREATE TABLE public.governance_logs (
  id              TEXT PRIMARY KEY,
  profile_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  initiative_id   TEXT,
  type            TEXT DEFAULT 'Risk',
  title           TEXT NOT NULL,
  severity        INTEGER DEFAULT 5,
  owner           TEXT,
  status          TEXT DEFAULT 'Open',
  notes           TEXT,
  created_date    DATE DEFAULT CURRENT_DATE,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.governance_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own governance logs" ON public.governance_logs FOR ALL USING (profile_id = auth.uid());
CREATE TRIGGER governance_logs_updated_at BEFORE UPDATE ON public.governance_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════
-- SOP RECORDS
-- ═══════════════════════════════════════════
CREATE TABLE public.sop_records (
  id              TEXT PRIMARY KEY,
  profile_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  department      TEXT,
  version         TEXT DEFAULT '1.0',
  status          TEXT DEFAULT 'Active',
  last_reviewed   DATE,
  adherence_rate  INTEGER DEFAULT 0,
  owner           TEXT,
  document_url    TEXT,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sop_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sop records" ON public.sop_records FOR ALL USING (profile_id = auth.uid());
CREATE TRIGGER sop_records_updated_at BEFORE UPDATE ON public.sop_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════
-- AUTHORITY MATRIX
-- ═══════════════════════════════════════════
CREATE TABLE public.authority_matrix (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role                TEXT NOT NULL,
  department          TEXT,
  person              TEXT,
  budget_authority    TEXT,
  hiring_authority    TEXT,
  initiative_approval TEXT,
  risk_approval       TEXT,
  level               TEXT DEFAULT 'L3',
  created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.authority_matrix ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own authority matrix" ON public.authority_matrix FOR ALL USING (profile_id = auth.uid());

-- ═══════════════════════════════════════════
-- ORG METRICS (single row per user — upsert)
-- ═══════════════════════════════════════════
CREATE TABLE public.org_metrics (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id                UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  overall_maturity_score    INTEGER DEFAULT 0,
  avg_execution_health      INTEGER DEFAULT 0,
  avg_strategic_alignment   INTEGER DEFAULT 0,
  avg_sop_adherence         INTEGER DEFAULT 0,
  active_initiatives        INTEGER DEFAULT 0,
  blocked_tasks             INTEGER DEFAULT 0,
  governance_open_items     INTEGER DEFAULT 0,
  sop_coverage              INTEGER DEFAULT 0,
  decision_deadlines        INTEGER DEFAULT 0,
  total_headcount           INTEGER DEFAULT 0,
  total_budget_allocated    NUMERIC DEFAULT 0,
  total_budget_used         NUMERIC DEFAULT 0,
  updated_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.org_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own org metrics" ON public.org_metrics FOR ALL USING (profile_id = auth.uid());

-- ═══════════════════════════════════════════
-- INTEGRATION CONNECTIONS
-- ═══════════════════════════════════════════
CREATE TABLE public.integration_connections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  integration_id  TEXT NOT NULL,
  status          TEXT DEFAULT 'connected',
  config          JSONB DEFAULT '{}',
  connected_at    TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(profile_id, integration_id)
);

ALTER TABLE public.integration_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own integrations" ON public.integration_connections FOR ALL USING (profile_id = auth.uid());

-- ═══════════════════════════════════════════
-- CREATOR LAB PROMPTS LOG
-- ═══════════════════════════════════════════
CREATE TABLE public.creator_prompts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  category    TEXT,
  applied     BOOLEAN DEFAULT false,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.creator_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Creator only access" ON public.creator_prompts FOR ALL USING (profile_id = auth.uid());

-- ═══════════════════════════════════════════
-- STORAGE BUCKETS
-- ═══════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('sop-files', 'sop-files', false);

CREATE POLICY "Avatars publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users view own documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own documents" ON storage.objects FOR DELETE USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users view own sop files" ON storage.objects FOR SELECT USING (bucket_id = 'sop-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own sop files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'sop-files' AND auth.uid()::text = (storage.foldername(name))[1]);
