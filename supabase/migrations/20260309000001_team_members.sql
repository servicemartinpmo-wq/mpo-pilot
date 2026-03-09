CREATE TABLE IF NOT EXISTS public.team_members (
  id                TEXT PRIMARY KEY,
  profile_id        UUID NOT NULL,
  name              TEXT NOT NULL,
  role              TEXT NOT NULL,
  department        TEXT,
  email             TEXT,
  avatar_url        TEXT,
  load_pct          INTEGER DEFAULT 0,
  delegated         INTEGER DEFAULT 0,
  blocked           INTEGER DEFAULT 0,
  mocha_assignments JSONB DEFAULT '[]',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own team members" ON public.team_members;
CREATE POLICY "Users manage own team members" ON public.team_members
  FOR ALL USING (profile_id = auth.uid());
