-- ═══════════════════════════════════════════
-- TEAM MEMBERS
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.team_members (
  id                  TEXT PRIMARY KEY,
  profile_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  role                TEXT NOT NULL,
  department          TEXT,
  email               TEXT,
  avatar_url          TEXT,
  load_pct            INTEGER DEFAULT 0,
  delegated           INTEGER DEFAULT 0,
  blocked             INTEGER DEFAULT 0,
  mocha_assignments   JSONB DEFAULT '[]',
  created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own team members" ON public.team_members FOR ALL USING (profile_id = auth.uid());

CREATE TRIGGER team_members_updated_at BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for all key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.departments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.initiatives;
ALTER PUBLICATION supabase_realtime ADD TABLE public.action_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.insights;
ALTER PUBLICATION supabase_realtime ADD TABLE public.governance_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sop_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.org_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;
