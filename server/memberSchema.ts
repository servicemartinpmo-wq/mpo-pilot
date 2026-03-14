import { getPool } from "./db";

export async function initMemberTables() {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS workspace_members (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id    TEXT NOT NULL,
      email       TEXT NOT NULL,
      name        TEXT,
      role        TEXT NOT NULL DEFAULT 'member',
      status      TEXT NOT NULL DEFAULT 'pending',
      invited_at  TIMESTAMPTZ DEFAULT now(),
      joined_at   TIMESTAMPTZ,
      updated_at  TIMESTAMPTZ DEFAULT now(),
      UNIQUE(owner_id, email)
    );
    CREATE INDEX IF NOT EXISTS idx_workspace_members_owner ON workspace_members(owner_id);
  `);
}

export const TIER_MEMBER_LIMITS: Record<string, number> = {
  free:       1,
  solo:       5,
  growth:     15,
  command:    50,
  enterprise: 9999,
};
