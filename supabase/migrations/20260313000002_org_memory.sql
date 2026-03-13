-- Lifelong persistent memory for the context engine
-- Stores events, decisions, patterns, signals, predictions, and observations

CREATE TABLE IF NOT EXISTS public.org_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL CHECK (entry_type IN (
    'event', 'decision', 'pattern', 'prediction', 'signal',
    'insight', 'observation', 'ai_change', 'milestone'
  )),
  category TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  importance SMALLINT NOT NULL DEFAULT 3 CHECK (importance BETWEEN 1 AND 5),
  tags TEXT[] NOT NULL DEFAULT '{}',
  source TEXT DEFAULT NULL,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_memory_profile ON public.org_memory(profile_id);
CREATE INDEX IF NOT EXISTS idx_org_memory_category ON public.org_memory(category);
CREATE INDEX IF NOT EXISTS idx_org_memory_type ON public.org_memory(entry_type);
CREATE INDEX IF NOT EXISTS idx_org_memory_created ON public.org_memory(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_org_memory_importance ON public.org_memory(importance DESC);
CREATE INDEX IF NOT EXISTS idx_org_memory_tags ON public.org_memory USING GIN(tags);

ALTER TABLE public.org_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own memory" ON public.org_memory
  FOR ALL USING (profile_id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_org_memory_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_org_memory_updated_at
  BEFORE UPDATE ON public.org_memory
  FOR EACH ROW EXECUTE FUNCTION public.handle_org_memory_updated_at();
