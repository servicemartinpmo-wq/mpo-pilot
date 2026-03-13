import { getPool } from "./db";

export async function initCRMTables(): Promise<void> {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS crm_discovery_runs (
      id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      query_text    TEXT,
      query_industry TEXT,
      query_location TEXT,
      query_size_min INTEGER,
      query_size_max INTEGER,
      sources_used  JSONB DEFAULT '[]',
      result_count  INTEGER DEFAULT 0,
      status        TEXT DEFAULT 'pending',
      started_at    TIMESTAMPTZ DEFAULT now(),
      completed_at  TIMESTAMPTZ,
      created_by    TEXT
    );

    CREATE TABLE IF NOT EXISTS crm_companies (
      id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name            TEXT NOT NULL,
      industry        TEXT,
      website         TEXT,
      employee_count  TEXT,
      estimated_revenue TEXT,
      city            TEXT,
      state           TEXT,
      address         TEXT,
      phone           TEXT,
      general_email   TEXT,
      linkedin        TEXT,
      bbb_rating      TEXT,
      chamber_member  BOOLEAN DEFAULT false,
      founded         TEXT,
      status          TEXT DEFAULT 'prospect',
      source_channel  TEXT,
      confidence      TEXT DEFAULT 'medium',
      field_sources   JSONB DEFAULT '{}',
      technographics  JSONB DEFAULT '[]',
      buying_signals  JSONB DEFAULT '[]',
      lead_score      INTEGER DEFAULT 0,
      score_breakdown JSONB DEFAULT '{}',
      last_verified_at TIMESTAMPTZ,
      discovery_run_id TEXT REFERENCES crm_discovery_runs(id) ON DELETE SET NULL,
      approved        BOOLEAN DEFAULT false,
      created_at      TIMESTAMPTZ DEFAULT now(),
      updated_at      TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS crm_contacts (
      id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      company_id      TEXT REFERENCES crm_companies(id) ON DELETE CASCADE,
      first_name      TEXT NOT NULL,
      last_name       TEXT NOT NULL,
      title           TEXT,
      department      TEXT,
      seniority_rank  INTEGER DEFAULT 50,
      direct_email    TEXT,
      general_email   TEXT,
      email_pattern   TEXT,
      email_verified  BOOLEAN DEFAULT false,
      email_verified_at TIMESTAMPTZ,
      phone           TEXT,
      linkedin        TEXT,
      twitter         TEXT,
      photo           TEXT,
      source_channel  TEXT,
      confidence      TEXT DEFAULT 'medium',
      field_sources   JSONB DEFAULT '{}',
      source_url      TEXT,
      approved        BOOLEAN DEFAULT false,
      created_at      TIMESTAMPTZ DEFAULT now(),
      updated_at      TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS crm_signals (
      id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      company_id      TEXT REFERENCES crm_companies(id) ON DELETE CASCADE,
      signal_type     TEXT NOT NULL,
      title           TEXT NOT NULL,
      description     TEXT,
      source_url      TEXT,
      detected_at     TIMESTAMPTZ DEFAULT now(),
      signal_data     JSONB DEFAULT '{}',
      created_at      TIMESTAMPTZ DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_crm_companies_industry ON crm_companies(industry);
    CREATE INDEX IF NOT EXISTS idx_crm_companies_city ON crm_companies(city);
    CREATE INDEX IF NOT EXISTS idx_crm_companies_status ON crm_companies(status);
    CREATE INDEX IF NOT EXISTS idx_crm_companies_approved ON crm_companies(approved);
    CREATE INDEX IF NOT EXISTS idx_crm_contacts_company ON crm_contacts(company_id);
    CREATE INDEX IF NOT EXISTS idx_crm_signals_company ON crm_signals(company_id);
  `);

  console.log("[CRM] Database tables initialized");
}
