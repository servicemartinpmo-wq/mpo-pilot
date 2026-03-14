import { Router, Request, Response } from "express";
import { getPool } from "./db";
import { initMemberTables, TIER_MEMBER_LIMITS } from "./memberSchema";

const router = Router();

let tablesReady = false;
async function ensureTables() {
  if (!tablesReady) {
    try { await initMemberTables(); tablesReady = true; }
    catch (e) { console.error("[Members] Table init error:", e); }
  }
}

function getOwnerId(req: Request): string | null {
  const user = (req as any).user as Record<string, unknown> & { claims?: Record<string, unknown> } | undefined;
  return (user?.claims?.sub as string) || (req.headers["x-owner-id"] as string) || null;
}

// GET /api/members — list all members for the workspace
router.get("/api/members", async (req: Request, res: Response) => {
  try {
    await ensureTables();
    const ownerId = getOwnerId(req) || (req.query.owner_id as string);
    if (!ownerId) return res.status(400).json({ error: "owner_id required" });

    const { rows } = await getPool().query(
      `SELECT * FROM workspace_members WHERE owner_id = $1 AND status != 'removed' ORDER BY
        CASE role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 WHEN 'manager' THEN 2 WHEN 'member' THEN 3 ELSE 4 END,
        invited_at ASC`,
      [ownerId]
    );
    res.json(rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// POST /api/members/invite — invite a new member
router.post("/api/members/invite", async (req: Request, res: Response) => {
  try {
    await ensureTables();
    const ownerId = getOwnerId(req) || req.body.owner_id;
    if (!ownerId) return res.status(401).json({ error: "Not authenticated" });

    const { email, name, role = "member", tier = "free" } = req.body;
    if (!email) return res.status(400).json({ error: "email is required" });

    // Enforce tier limits
    const limit = TIER_MEMBER_LIMITS[tier] ?? 1;
    const { rows: existing } = await getPool().query(
      `SELECT COUNT(*) as cnt FROM workspace_members WHERE owner_id = $1 AND status != 'removed'`,
      [ownerId]
    );
    const currentCount = parseInt(existing[0]?.cnt ?? "0", 10);
    if (currentCount >= limit) {
      return res.status(403).json({
        error: `Your ${tier} plan allows up to ${limit} member${limit === 1 ? "" : "s"}. Upgrade to add more.`,
        limitReached: true,
        limit,
        current: currentCount,
      });
    }

    const { rows } = await getPool().query(
      `INSERT INTO workspace_members (owner_id, email, name, role, status)
       VALUES ($1, $2, $3, $4, 'pending')
       ON CONFLICT (owner_id, email) DO UPDATE SET
         role = EXCLUDED.role, name = COALESCE(EXCLUDED.name, workspace_members.name),
         status = CASE WHEN workspace_members.status = 'removed' THEN 'pending' ELSE workspace_members.status END,
         updated_at = now()
       RETURNING *`,
      [ownerId, email.toLowerCase().trim(), name || null, role]
    );
    res.json(rows[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// PUT /api/members/:id — update role or status
router.put("/api/members/:id", async (req: Request, res: Response) => {
  try {
    await ensureTables();
    const ownerId = getOwnerId(req) || req.body.owner_id;
    if (!ownerId) return res.status(401).json({ error: "Not authenticated" });

    const { role, name, status } = req.body;
    const fields: string[] = [];
    const vals: unknown[] = [req.params.id, ownerId];
    let i = 3;
    if (role)   { fields.push(`role = $${i++}`);   vals.push(role); }
    if (name)   { fields.push(`name = $${i++}`);   vals.push(name); }
    if (status) { fields.push(`status = $${i++}`); vals.push(status); }
    if (!fields.length) return res.status(400).json({ error: "Nothing to update" });
    fields.push(`updated_at = now()`);

    const { rows } = await getPool().query(
      `UPDATE workspace_members SET ${fields.join(", ")} WHERE id = $1 AND owner_id = $2 AND role != 'owner' RETURNING *`,
      vals
    );
    rows.length ? res.json(rows[0]) : res.status(404).json({ error: "Member not found or cannot edit owner" });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/members/:id — soft-remove a member
router.delete("/api/members/:id", async (req: Request, res: Response) => {
  try {
    await ensureTables();
    const ownerId = getOwnerId(req) || (req.query.owner_id as string);
    if (!ownerId) return res.status(401).json({ error: "Not authenticated" });

    const { rows } = await getPool().query(
      `UPDATE workspace_members SET status = 'removed', updated_at = now()
       WHERE id = $1 AND owner_id = $2 AND role != 'owner' RETURNING id`,
      [req.params.id, ownerId]
    );
    rows.length ? res.json({ ok: true }) : res.status(404).json({ error: "Member not found or cannot remove owner" });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
