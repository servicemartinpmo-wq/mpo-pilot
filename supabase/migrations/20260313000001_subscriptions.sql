-- ═══════════════════════════════════════════════════════
-- SUBSCRIPTIONS MODULE — Software/tool cost tracking
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  vendor text NOT NULL,
  category text NOT NULL DEFAULT 'Technology',
  monthly_cost numeric NOT NULL DEFAULT 0,
  billing_cycle text NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly','quarterly','annual')),
  renewal_date date,
  owner_id uuid REFERENCES public.users(id),
  owner_name text,
  roi_score integer DEFAULT 50 CHECK (roi_score BETWEEN 0 AND 100),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','at-risk','redundant','cancelled')),
  last_used timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

SELECT public._create_policy_if_not_exists(
  'subscriptions',
  'Users manage org subscriptions',
  'ALL',
  'organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())'
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON public.subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_subscriptions_timestamps') THEN
    CREATE TRIGGER trg_subscriptions_timestamps BEFORE INSERT OR UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();
  END IF;
END $$;

-- ── Seed common tool subscriptions (no org scope — demo data) ────────────────

INSERT INTO public.subscriptions (name, vendor, category, monthly_cost, billing_cycle, renewal_date, owner_name, roi_score, status, last_used, notes)
VALUES
  ('AWS', 'Amazon Web Services', 'Technology', 12400, 'monthly', '2027-01-05', 'Alex M.', 92, 'active', '2026-03-12T10:00:00Z', NULL),
  ('Slack', 'Salesforce', 'Technology', 1250, 'monthly', '2026-09-01', 'Jordan K.', 88, 'active', '2026-03-13T09:00:00Z', NULL),
  ('Figma', 'Figma Inc.', 'Technology', 450, 'annual', '2026-06-15', 'Sam P.', 75, 'active', '2026-03-10T15:00:00Z', NULL),
  ('HubSpot Marketing', 'HubSpot', 'Marketing', 3200, 'monthly', '2026-12-01', 'Sam P.', 62, 'at-risk', '2026-02-20T10:00:00Z', 'Usage dropped 40% since Q4. Consider downgrade to Starter tier.'),
  ('Jira', 'Atlassian', 'Technology', 890, 'monthly', '2026-08-01', 'Alex M.', 45, 'at-risk', '2026-01-15T10:00:00Z', 'Team migrated most work to Linear. Only legacy projects remain.'),
  ('Adobe Creative Cloud', 'Adobe', 'Marketing', 1800, 'annual', '2026-04-20', 'Sam P.', 30, 'redundant', '2025-11-10T10:00:00Z', 'Only 2 of 15 licenses used. Team shifted to Figma and Canva.'),
  ('Zoom Business', 'Zoom', 'Operations', 600, 'monthly', '2026-07-15', 'Jordan K.', 82, 'active', '2026-03-13T08:00:00Z', NULL),
  ('Salesforce CRM', 'Salesforce', 'Technology', 4500, 'monthly', '2026-11-01', 'Chris T.', 70, 'active', '2026-03-11T14:00:00Z', NULL),
  ('Notion', 'Notion Labs', 'Technology', 320, 'monthly', '2026-05-01', 'Jordan K.', 25, 'redundant', '2025-09-22T10:00:00Z', 'Replaced by Confluence. No active users in 6 months.'),
  ('GitHub Enterprise', 'Microsoft', 'Technology', 2100, 'monthly', '2026-10-01', 'Alex M.', 95, 'active', '2026-03-13T11:00:00Z', NULL)
ON CONFLICT DO NOTHING;

-- ── Receipt storage ──────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users view own receipts' AND tablename = 'objects') THEN
    CREATE POLICY "Users view own receipts" ON storage.objects FOR SELECT USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users upload receipts' AND tablename = 'objects') THEN
    CREATE POLICY "Users upload receipts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users delete own receipts' AND tablename = 'objects') THEN
    CREATE POLICY "Users delete own receipts" ON storage.objects FOR DELETE USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

-- Add receipt_url column to expenses table (if it exists) to store file URLs
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'expenses') THEN
    ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS receipt_url text;
  END IF;
END $$;
