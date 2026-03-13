import { getPool } from "./db";
import { randomUUID } from "crypto";

interface SyncResult {
  recordsAdded: number;
  recordsUpdated: number;
  recordsRemoved: number;
  error?: string;
}

interface SampleRecord {
  record_id: string;
  record_type: string;
  record_name: string;
  record_data: Record<string, unknown>;
}

const SAMPLE_DATA: Record<string, SampleRecord[]> = {
  slack: [
    { record_id: "ch-general", record_type: "channel", record_name: "#general", record_data: { members: 42, purpose: "Company-wide announcements" } },
    { record_id: "ch-engineering", record_type: "channel", record_name: "#engineering", record_data: { members: 18, purpose: "Engineering discussions" } },
    { record_id: "ch-product", record_type: "channel", record_name: "#product", record_data: { members: 12, purpose: "Product updates" } },
    { record_id: "msg-001", record_type: "message", record_name: "Sprint planning notes", record_data: { channel: "#engineering", date: "2026-03-10" } },
    { record_id: "msg-002", record_type: "message", record_name: "Q1 OKR review", record_data: { channel: "#product", date: "2026-03-08" } },
  ],
  asana: [
    { record_id: "proj-website", record_type: "project", record_name: "Website Redesign", record_data: { status: "on_track", tasks_completed: 45 } },
    { record_id: "proj-mobile", record_type: "project", record_name: "Mobile App v2", record_data: { status: "at_risk", tasks_completed: 22 } },
    { record_id: "task-001", record_type: "task", record_name: "Update landing page copy", record_data: { project: "Website Redesign", assignee: "Jane D." } },
    { record_id: "task-002", record_type: "task", record_name: "Fix checkout flow", record_data: { project: "Mobile App v2", assignee: "John S." } },
  ],
  jira: [
    { record_id: "issue-101", record_type: "issue", record_name: "PROJ-101: Auth bug", record_data: { status: "In Progress", priority: "High" } },
    { record_id: "issue-102", record_type: "issue", record_name: "PROJ-102: Dashboard perf", record_data: { status: "Open", priority: "Medium" } },
    { record_id: "sprint-24", record_type: "sprint", record_name: "Sprint 24", record_data: { start: "2026-03-01", end: "2026-03-14" } },
  ],
  quickbooks: [
    { record_id: "inv-001", record_type: "invoice", record_name: "INV-2024-001", record_data: { amount: 5000, status: "paid", customer: "Acme Corp" } },
    { record_id: "inv-002", record_type: "invoice", record_name: "INV-2024-002", record_data: { amount: 12000, status: "pending", customer: "TechStart Inc" } },
    { record_id: "exp-001", record_type: "expense", record_name: "Office supplies", record_data: { amount: 340, category: "Operations" } },
  ],
  notion: [
    { record_id: "page-roadmap", record_type: "page", record_name: "Product Roadmap Q1", record_data: { last_edited: "2026-03-09" } },
    { record_id: "page-directory", record_type: "page", record_name: "Team Directory", record_data: { last_edited: "2026-03-05" } },
    { record_id: "db-features", record_type: "database", record_name: "Feature Requests", record_data: { entries: 34 } },
  ],
  gdrive: [
    { record_id: "doc-strategy", record_type: "document", record_name: "Q1 Strategy Doc", record_data: { owner: "CEO", shared_with: 5 } },
    { record_id: "sheet-budget", record_type: "spreadsheet", record_name: "Budget 2026", record_data: { owner: "CFO", sheets: 4 } },
    { record_id: "pres-board", record_type: "presentation", record_name: "Board Deck", record_data: { owner: "CEO", slides: 22 } },
  ],
};

export async function runServerSync(
  profileId: string,
  integrationId: string,
  integrationName: string
): Promise<SyncResult> {
  const pool = getPool();

  const logId = randomUUID();
  const now = new Date().toISOString();

  await pool.query(
    `INSERT INTO integration_sync_log (id, profile_id, integration_id, integration_name, status, records_added, records_updated, records_removed, started_at, created_at)
     VALUES ($1, $2, $3, $4, 'running', 0, 0, 0, $5, $5)`,
    [logId, profileId, integrationId, integrationName, now]
  );

  try {
    const records = SAMPLE_DATA[integrationId] ?? SAMPLE_DATA.slack;
    let recordsAdded = 0;
    let recordsUpdated = 0;

    for (const record of records) {
      const existingResult = await pool.query(
        `SELECT id FROM integration_backups
         WHERE profile_id = $1 AND integration_id = $2 AND record_type = $3 AND record_id = $4`,
        [profileId, integrationId, record.record_type, record.record_id]
      );

      if (existingResult.rows.length > 0) {
        await pool.query(
          `UPDATE integration_backups SET record_data = $1, record_name = $2, synced_at = $3 WHERE id = $4`,
          [JSON.stringify(record.record_data), record.record_name, now, existingResult.rows[0].id]
        );
        recordsUpdated++;
      } else {
        const id = randomUUID();
        await pool.query(
          `INSERT INTO integration_backups (id, profile_id, integration_id, integration_name, record_type, record_id, record_name, record_data, synced_at, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)`,
          [id, profileId, integrationId, integrationName, record.record_type, record.record_id, record.record_name, JSON.stringify(record.record_data), now]
        );
        recordsAdded++;
      }
    }

    const completedAt = new Date().toISOString();
    await pool.query(
      `UPDATE integration_sync_log SET status = 'success', records_added = $1, records_updated = $2, completed_at = $3 WHERE id = $4`,
      [recordsAdded, recordsUpdated, completedAt, logId]
    );

    return { recordsAdded, recordsUpdated, recordsRemoved: 0 };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const completedAt = new Date().toISOString();
    await pool.query(
      `UPDATE integration_sync_log SET status = 'failed', error_message = $1, completed_at = $2 WHERE id = $3`,
      [errorMsg, completedAt, logId]
    ).catch(() => {});

    return { recordsAdded: 0, recordsUpdated: 0, recordsRemoved: 0, error: errorMsg };
  }
}

export async function runSyncForAllConnected(profileId: string): Promise<void> {
  const pool = getPool();
  try {
    const result = await pool.query(
      `SELECT integration_id FROM integration_connections WHERE profile_id = $1 AND status = 'connected'`,
      [profileId]
    );

    for (const row of result.rows) {
      const name = row.integration_id.charAt(0).toUpperCase() + row.integration_id.slice(1);
      await runServerSync(profileId, row.integration_id, name);
    }
  } catch (err) {
    console.error("[TechOps Sync] Error syncing all connected integrations:", err);
  }
}

let scheduledSyncInterval: ReturnType<typeof setInterval> | null = null;

export function startScheduledSync(intervalMs: number = 15 * 60 * 1000) {
  if (scheduledSyncInterval) return;
  console.log(`[TechOps] Starting scheduled sync every ${intervalMs / 60000} minutes`);

  scheduledSyncInterval = setInterval(async () => {
    const pool = getPool();
    try {
      const profilesResult = await pool.query(
        `SELECT DISTINCT profile_id FROM integration_connections WHERE status = 'connected'`
      );
      for (const row of profilesResult.rows) {
        await runSyncForAllConnected(row.profile_id);
      }
      console.log(`[TechOps] Scheduled sync completed for ${profilesResult.rows.length} profile(s)`);
    } catch (err) {
      console.error("[TechOps] Scheduled sync error:", err);
    }
  }, intervalMs);
}

export function stopScheduledSync() {
  if (scheduledSyncInterval) {
    clearInterval(scheduledSyncInterval);
    scheduledSyncInterval = null;
    console.log("[TechOps] Scheduled sync stopped");
  }
}
