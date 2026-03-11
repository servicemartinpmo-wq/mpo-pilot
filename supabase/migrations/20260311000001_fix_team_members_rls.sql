-- Fix team_members: ensure profile_id column exists and RLS policy is applied

ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own team members" ON public.team_members;
CREATE POLICY "Users manage own team members" ON public.team_members
  FOR ALL USING (profile_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_team_members_profile_id ON public.team_members(profile_id);
