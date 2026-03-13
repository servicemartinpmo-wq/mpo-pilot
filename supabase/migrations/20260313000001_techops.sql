-- ═══════════════════════════════════════════════════════
-- TECH-OPS: Auto-Backup, File Manager & Reorganization
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.integration_backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  integration_id text NOT NULL,
  integration_name text NOT NULL,
  record_type text NOT NULL,
  record_id text NOT NULL,
  record_name text NOT NULL,
  record_data jsonb DEFAULT '{}',
  parent_record_id text,
  source_hierarchy text[],
  synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, integration_id, record_type, record_id)
);

CREATE TABLE IF NOT EXISTS public.integration_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  integration_id text NOT NULL,
  integration_name text NOT NULL,
  status text NOT NULL DEFAULT 'success' CHECK (status IN ('success','partial','failed','running')),
  records_added integer DEFAULT 0,
  records_updated integer DEFAULT 0,
  records_removed integer DEFAULT 0,
  error_message text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.techops_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  name text NOT NULL,
  parent_id uuid REFERENCES public.techops_folders(id) ON DELETE CASCADE,
  icon text DEFAULT 'folder',
  color text DEFAULT '#3b82f6',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.techops_folder_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  folder_id uuid REFERENCES public.techops_folders(id) ON DELETE CASCADE,
  backup_id uuid REFERENCES public.integration_backups(id) ON DELETE CASCADE,
  custom_name text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(folder_id, backup_id)
);

-- RLS is not enabled on these tables.
-- Writes go through authenticated server-side API routes (POST /api/techops/sync*)
-- which extract profile_id from the session (req.user.claims.sub).
-- Reads via the Supabase client filter by profile_id at the query layer.
-- This matches the existing codebase pattern (no other tables use RLS).

CREATE INDEX IF NOT EXISTS idx_integration_backups_profile ON public.integration_backups(profile_id);
CREATE INDEX IF NOT EXISTS idx_integration_backups_integration ON public.integration_backups(profile_id, integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_sync_log_profile ON public.integration_sync_log(profile_id);
CREATE INDEX IF NOT EXISTS idx_techops_folders_profile ON public.techops_folders(profile_id);
CREATE INDEX IF NOT EXISTS idx_techops_folders_parent ON public.techops_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_techops_folder_items_folder ON public.techops_folder_items(folder_id);
CREATE INDEX IF NOT EXISTS idx_techops_folder_items_backup ON public.techops_folder_items(backup_id);
