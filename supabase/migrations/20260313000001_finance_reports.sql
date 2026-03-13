-- ═══════════════════════════════════════════════════════
-- FINANCE REPORT TEMPLATES & GENERATED REPORTS
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'custom' CHECK (type IN ('custom','builtin')),
  source_format text NOT NULL DEFAULT 'csv' CHECK (source_format IN ('csv','xlsx')),
  column_mapping jsonb NOT NULL DEFAULT '{}',
  original_headers text[] DEFAULT '{}',
  created_by uuid REFERENCES public.users(id),
  is_builtin boolean DEFAULT false,
  builtin_key text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.generated_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.report_templates(id) ON DELETE SET NULL,
  template_name text NOT NULL,
  generated_at timestamptz DEFAULT now(),
  row_count integer DEFAULT 0,
  file_format text NOT NULL DEFAULT 'csv' CHECK (file_format IN ('csv','xlsx')),
  file_data text,
  download_url text,
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own report templates" ON public.report_templates FOR ALL USING (profile_id = auth.uid());
CREATE POLICY "Users manage own generated reports" ON public.generated_reports FOR ALL USING (profile_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_report_templates_profile ON public.report_templates(profile_id);
CREATE INDEX IF NOT EXISTS idx_report_templates_org ON public.report_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_profile ON public.generated_reports(profile_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_org ON public.generated_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_template ON public.generated_reports(template_id);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_report_templates_timestamps') THEN
    CREATE TRIGGER trg_report_templates_timestamps BEFORE INSERT OR UPDATE ON public.report_templates FOR EACH ROW EXECUTE FUNCTION public.set_timestamps();
  END IF;
END $$;
