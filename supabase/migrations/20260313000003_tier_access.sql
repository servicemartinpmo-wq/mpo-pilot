-- ── Tier Definitions (creator-editable feature lists per tier) ────────────────
CREATE TABLE IF NOT EXISTS public.tier_definitions (
  id           TEXT PRIMARY KEY,
  display_name TEXT    NOT NULL,
  price_label  TEXT    NOT NULL DEFAULT 'Free',
  price_monthly DECIMAL DEFAULT 0,
  sort_order   INTEGER DEFAULT 0,
  color        TEXT    DEFAULT 'hsl(220 70% 65%)',
  features     JSONB   NOT NULL DEFAULT '[]'::JSONB,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.tier_definitions (id, display_name, price_label, price_monthly, sort_order, color, features)
VALUES
  ('free',       'Free',       'Free',      0,    0, 'hsl(220 70% 65%)',
   '["Limited insights & recommendations","10–20 frameworks","Basic KPI dashboards","Single workspace","In-app advertising"]'::JSONB),
  ('solo',       'Solo',       '$30/mo',    30,   1, 'hsl(174 72% 50%)',
   '["Insights and recommendations","50–100 frameworks","Project-level KPI dashboards","OKR templates & goal tracking","Workspace up to 5 users","Basic reporting"]'::JSONB),
  ('growth',     'Growth',     '$75/mo',    75,   2, 'hsl(38 92% 55%)',
   '["200–300 frameworks","Business dashboards (Sales, Marketing, Finance)","Scenario modeling","Financial templates (P&L, cash flow)","Industry benchmarking","Workspace up to 15 users"]'::JSONB),
  ('command',    'Command',    '$250/mo',   250,  3, 'hsl(268 68% 65%)',
   '["Full analysis engine","Cross-department dashboards","Scenario simulations & stress testing","Integrations — CRM, ERP, Accounting, HR","Multi-user collaboration (up to 50 users)","Tier 4–5 maturity roadmap"]'::JSONB),
  ('enterprise', 'Enterprise', 'Custom',    -1,   4, 'hsl(38 92% 52%)',
   '["Unlimited users","Custom integrations","White-label options","Dedicated support & SLA","Advanced security & compliance","Custom AI training","Quarterly business reviews"]'::JSONB)
ON CONFLICT (id) DO NOTHING;

-- ── User Tier Grants (manual overrides by creator) ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_tier_grants (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email   TEXT NOT NULL UNIQUE,
  granted_tier TEXT NOT NULL,
  granted_by   TEXT NOT NULL DEFAULT 'creator',
  is_temp      BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at   TIMESTAMPTZ,
  note         TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_tier_grants ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_tier_grants'
      AND policyname = 'Service role manages tier grants'
  ) THEN
    CREATE POLICY "Service role manages tier grants"
      ON public.user_tier_grants
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_tier_grants_email ON public.user_tier_grants(user_email);
CREATE INDEX IF NOT EXISTS idx_user_tier_grants_tier  ON public.user_tier_grants(granted_tier);
