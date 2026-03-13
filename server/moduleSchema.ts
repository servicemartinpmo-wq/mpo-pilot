import { getPool } from "./db";

export async function initModuleTables(): Promise<void> {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS marketing_campaigns (
      id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name            TEXT NOT NULL,
      platform        TEXT,
      status          TEXT DEFAULT 'active',
      mega_score      INTEGER DEFAULT 0,
      engagement      INTEGER DEFAULT 0,
      relevance       INTEGER DEFAULT 0,
      conversion      INTEGER DEFAULT 0,
      authority       INTEGER DEFAULT 0,
      freshness       INTEGER DEFAULT 0,
      network         INTEGER DEFAULT 0,
      efficiency      INTEGER DEFAULT 0,
      diagnosis       TEXT,
      recommendation  TEXT,
      trend           TEXT DEFAULT 'flat',
      trend_delta     REAL DEFAULT 0,
      budget          REAL DEFAULT 0,
      spent           REAL DEFAULT 0,
      created_at      TIMESTAMPTZ DEFAULT now(),
      updated_at      TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS agile_stories (
      id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      title           TEXT NOT NULL,
      description     TEXT,
      epic_name       TEXT,
      status          TEXT DEFAULT 'backlog',
      priority        TEXT DEFAULT 'medium',
      story_points    INTEGER DEFAULT 1,
      assignee        TEXT,
      sprint_id       TEXT,
      comments        INTEGER DEFAULT 0,
      created_at      TIMESTAMPTZ DEFAULT now(),
      updated_at      TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS agile_epics (
      id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name            TEXT NOT NULL,
      status          TEXT DEFAULT 'active',
      progress        INTEGER DEFAULT 0,
      story_count     INTEGER DEFAULT 0,
      owner           TEXT,
      created_at      TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS agile_sprints (
      id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name            TEXT NOT NULL,
      status          TEXT DEFAULT 'planning',
      start_date      TEXT,
      end_date        TEXT,
      total_points    INTEGER DEFAULT 0,
      completed_points INTEGER DEFAULT 0,
      velocity        INTEGER DEFAULT 0,
      stories         INTEGER DEFAULT 0,
      created_at      TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS agile_bugs (
      id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      title           TEXT NOT NULL,
      severity        TEXT DEFAULT 'medium',
      status          TEXT DEFAULT 'open',
      assignee        TEXT,
      reported_by     TEXT,
      reported_date   TEXT,
      component       TEXT,
      created_at      TIMESTAMPTZ DEFAULT now(),
      updated_at      TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS compliance_items (
      id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      title           TEXT NOT NULL,
      description     TEXT,
      category        TEXT DEFAULT 'internal',
      status          TEXT DEFAULT 'compliant',
      owner           TEXT,
      due_date        TEXT,
      last_reviewed   TEXT,
      reminder_frequency TEXT DEFAULT 'weekly',
      next_reminder_date TEXT,
      authority       TEXT,
      notes           TEXT,
      linked_documents JSONB DEFAULT '[]',
      tags            JSONB DEFAULT '[]',
      priority        TEXT DEFAULT 'Medium',
      reminders_sent  INTEGER DEFAULT 0,
      created_at      TIMESTAMPTZ DEFAULT now(),
      updated_at      TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS compliance_reminders (
      id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      item_id         TEXT REFERENCES compliance_items(id) ON DELETE CASCADE,
      sent_at         TEXT,
      channel         TEXT DEFAULT 'in-app',
      recipient       TEXT,
      status          TEXT DEFAULT 'sent',
      created_at      TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS workflow_items (
      id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      title           TEXT NOT NULL,
      description     TEXT,
      category        TEXT DEFAULT 'general',
      status          TEXT DEFAULT 'idle',
      trigger_type    TEXT,
      trigger_value   TEXT,
      steps           JSONB DEFAULT '[]',
      last_run        TIMESTAMPTZ,
      run_count       INTEGER DEFAULT 0,
      enabled         BOOLEAN DEFAULT true,
      created_at      TIMESTAMPTZ DEFAULT now(),
      updated_at      TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS meeting_items (
      id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      title           TEXT NOT NULL,
      description     TEXT,
      meeting_type    TEXT DEFAULT 'meeting',
      status          TEXT DEFAULT 'scheduled',
      date            TEXT,
      time            TEXT,
      duration        INTEGER DEFAULT 30,
      attendees       JSONB DEFAULT '[]',
      agenda          JSONB DEFAULT '[]',
      notes           TEXT,
      action_items    JSONB DEFAULT '[]',
      location        TEXT,
      link            TEXT,
      created_at      TIMESTAMPTZ DEFAULT now(),
      updated_at      TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS expense_items (
      id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      title           TEXT NOT NULL,
      description     TEXT,
      category        TEXT DEFAULT 'Operations',
      status          TEXT DEFAULT 'draft',
      amount          REAL DEFAULT 0,
      currency        TEXT DEFAULT 'USD',
      date            TEXT,
      vendor          TEXT,
      department      TEXT,
      cost_center     TEXT,
      gl_code         TEXT,
      recurrence      TEXT DEFAULT 'one-time',
      receipt_url     TEXT,
      allocation_lines JSONB DEFAULT '[]',
      notes           JSONB DEFAULT '[]',
      tags            JSONB DEFAULT '[]',
      submitted_by    TEXT,
      approved_by     TEXT,
      created_at      TIMESTAMPTZ DEFAULT now(),
      updated_at      TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS expense_subscriptions (
      id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name            TEXT NOT NULL,
      vendor          TEXT,
      category        TEXT DEFAULT 'Technology',
      monthly_cost    REAL DEFAULT 0,
      billing_cycle   TEXT DEFAULT 'monthly',
      status          TEXT DEFAULT 'active',
      renewal_date    TEXT,
      owner           TEXT,
      roi_score       INTEGER DEFAULT 50,
      waste_flag      BOOLEAN DEFAULT false,
      notes           TEXT,
      created_at      TIMESTAMPTZ DEFAULT now(),
      updated_at      TIMESTAMPTZ DEFAULT now()
    );
  `);

  console.log("[Modules] Database tables initialized");
}
