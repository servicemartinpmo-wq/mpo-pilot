-- ═══════════════════════════════════════════
-- TEAM MEMBERS
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.team_members (
  id                  TEXT PRIMARY KEY,
  profile_id          UUID NOT NULL,
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

DROP POLICY IF EXISTS "Users manage own team members" ON public.team_members;
CREATE POLICY "Users manage own team members" ON public.team_members FOR ALL USING (profile_id = auth.uid());

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'team_members_updated_at'
      AND tgrelid = 'public.team_members'::regclass
  ) THEN
    CREATE TRIGGER team_members_updated_at BEFORE UPDATE ON public.team_members
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Enable realtime (safe: skips if already added)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.departments;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.initiatives;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.action_items;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.insights;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.governance_logs;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sop_records;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.org_metrics;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;
