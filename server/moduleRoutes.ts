import { Router, Request, Response } from "express";
import { initModuleTables } from "./moduleSchema";
import { getPool } from "./db";

const router = Router();

let tablesInit = false;
async function ensureTables() {
  if (!tablesInit) {
    try { await initModuleTables(); tablesInit = true; } catch (e) { console.error("[Modules] Init error:", e); }
  }
}

function crud(table: string, orderBy = "created_at DESC") {
  return {
    async getAll(_req: Request, res: Response) {
      try {
        await ensureTables();
        const { rows } = await getPool().query(`SELECT * FROM ${table} ORDER BY ${orderBy}`);
        res.json(rows);
      } catch (e: any) { res.status(500).json({ error: e.message }); }
    },
    async getOne(req: Request, res: Response) {
      try {
        await ensureTables();
        const { rows } = await getPool().query(`SELECT * FROM ${table} WHERE id = $1`, [req.params.id]);
        rows.length ? res.json(rows[0]) : res.status(404).json({ error: "Not found" });
      } catch (e: any) { res.status(500).json({ error: e.message }); }
    },
    async upsert(req: Request, res: Response) {
      try {
        await ensureTables();
        const data = req.body;
        const id = data.id || undefined;
        delete data.created_at;
        data.updated_at = new Date().toISOString();

        const keys = Object.keys(data).filter(k => k !== "id");
        const vals = keys.map(k => {
          const v = data[k];
          return typeof v === "object" && v !== null ? JSON.stringify(v) : v;
        });

        if (id) {
          const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
          const { rows } = await getPool().query(
            `UPDATE ${table} SET ${sets} WHERE id = $1 RETURNING *`,
            [id, ...vals]
          );
          if (rows.length) return res.json(rows[0]);
        }

        const cols = keys.join(", ");
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
        const { rows } = await getPool().query(
          `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) RETURNING *`,
          vals
        );
        res.json(rows[0]);
      } catch (e: any) { res.status(500).json({ error: e.message }); }
    },
    async remove(req: Request, res: Response) {
      try {
        await ensureTables();
        await getPool().query(`DELETE FROM ${table} WHERE id = $1`, [req.params.id]);
        res.json({ success: true });
      } catch (e: any) { res.status(500).json({ error: e.message }); }
    },
  };
}

const campaigns = crud("marketing_campaigns", "mega_score DESC");
router.get("/api/marketing/campaigns", campaigns.getAll);
router.get("/api/marketing/campaigns/:id", campaigns.getOne);
router.post("/api/marketing/campaigns", campaigns.upsert);
router.put("/api/marketing/campaigns/:id", (req, res) => { req.body.id = req.params.id; campaigns.upsert(req, res); });
router.delete("/api/marketing/campaigns/:id", campaigns.remove);

const stories = crud("agile_stories", "priority DESC, created_at DESC");
router.get("/api/agile/stories", stories.getAll);
router.post("/api/agile/stories", stories.upsert);
router.put("/api/agile/stories/:id", (req, res) => { req.body.id = req.params.id; stories.upsert(req, res); });
router.delete("/api/agile/stories/:id", stories.remove);

const epics = crud("agile_epics", "created_at DESC");
router.get("/api/agile/epics", epics.getAll);
router.post("/api/agile/epics", epics.upsert);
router.put("/api/agile/epics/:id", (req, res) => { req.body.id = req.params.id; epics.upsert(req, res); });
router.delete("/api/agile/epics/:id", epics.remove);

const sprints = crud("agile_sprints", "created_at DESC");
router.get("/api/agile/sprints", sprints.getAll);
router.post("/api/agile/sprints", sprints.upsert);
router.delete("/api/agile/sprints/:id", sprints.remove);

const bugs = crud("agile_bugs", "severity DESC, created_at DESC");
router.get("/api/agile/bugs", bugs.getAll);
router.post("/api/agile/bugs", bugs.upsert);
router.put("/api/agile/bugs/:id", (req, res) => { req.body.id = req.params.id; bugs.upsert(req, res); });
router.delete("/api/agile/bugs/:id", bugs.remove);

const complianceItems = crud("compliance_items", "due_date ASC");
router.get("/api/compliance/items", complianceItems.getAll);
router.post("/api/compliance/items", complianceItems.upsert);
router.put("/api/compliance/items/:id", (req, res) => { req.body.id = req.params.id; complianceItems.upsert(req, res); });
router.delete("/api/compliance/items/:id", complianceItems.remove);

const complianceReminders = crud("compliance_reminders", "sent_at DESC");
router.get("/api/compliance/reminders", complianceReminders.getAll);

const workflowItems = crud("workflow_items", "created_at DESC");
router.get("/api/workflows", workflowItems.getAll);
router.post("/api/workflows", workflowItems.upsert);
router.put("/api/workflows/:id", (req, res) => { req.body.id = req.params.id; workflowItems.upsert(req, res); });
router.delete("/api/workflows/:id", workflowItems.remove);

const meetingItems = crud("meeting_items", "date ASC");
router.get("/api/meetings", meetingItems.getAll);
router.post("/api/meetings", meetingItems.upsert);
router.put("/api/meetings/:id", (req, res) => { req.body.id = req.params.id; meetingItems.upsert(req, res); });
router.delete("/api/meetings/:id", meetingItems.remove);

const expenses = crud("expense_items", "date DESC");
router.get("/api/expenses", expenses.getAll);
router.post("/api/expenses", expenses.upsert);
router.put("/api/expenses/:id", (req, res) => { req.body.id = req.params.id; expenses.upsert(req, res); });
router.delete("/api/expenses/:id", expenses.remove);

const subscriptions = crud("expense_subscriptions", "monthly_cost DESC");
router.get("/api/subscriptions", subscriptions.getAll);
router.post("/api/subscriptions", subscriptions.upsert);
router.put("/api/subscriptions/:id", (req, res) => { req.body.id = req.params.id; subscriptions.upsert(req, res); });
router.delete("/api/subscriptions/:id", subscriptions.remove);

router.post("/api/marketing/campaigns/seed", async (_req: Request, res: Response) => {
  try {
    await ensureTables();
    const pool = getPool();
    const { rows } = await pool.query("SELECT count(*) as c FROM marketing_campaigns");
    if (parseInt(rows[0].c) > 0) return res.json({ seeded: false, message: "Already has data" });

    const campaigns = [
      { name: "SaaS Executive Launch", platform: "LinkedIn", mega_score: 82, engagement: 88, relevance: 76, conversion: 71, authority: 80, freshness: 92, network: 75, efficiency: 79, diagnosis: "Strong engagement and freshness scores indicate high-quality targeting and creative.", recommendation: "Optimize landing page CTA hierarchy and reduce form fields.", trend: "up", trend_delta: 4.2 },
      { name: "Healthcare Operations Outreach", platform: "Google Ads", mega_score: 67, engagement: 62, relevance: 78, conversion: 55, authority: 70, freshness: 64, network: 68, efficiency: 72, diagnosis: "Relevance (78) outperforms engagement (62) — indicates right audience, wrong creative.", recommendation: "Refresh ad creatives with case study data. Test video formats.", trend: "down", trend_delta: -2.1 },
      { name: "SMB Onboarding Drip", platform: "Email", mega_score: 74, engagement: 80, relevance: 72, conversion: 68, authority: 65, freshness: 78, network: 82, efficiency: 70, diagnosis: "Network score (82) indicates strong referral and sharing behavior.", recommendation: "Add referral incentive to email sequence. Segment by company size.", trend: "up", trend_delta: 1.8 },
      { name: "Construction Tech Content", platform: "YouTube", mega_score: 58, engagement: 52, relevance: 82, conversion: 42, authority: 55, freshness: 60, network: 48, efficiency: 65, diagnosis: "High relevance (82) but low engagement (52) suggests content length or format mismatch.", recommendation: "Create shorter-form video content. Add clear CTAs within first 30 seconds.", trend: "flat", trend_delta: 0.3 },
    ];

    for (const c of campaigns) {
      await pool.query(
        `INSERT INTO marketing_campaigns (name, platform, mega_score, engagement, relevance, conversion, authority, freshness, network, efficiency, diagnosis, recommendation, trend, trend_delta)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [c.name, c.platform, c.mega_score, c.engagement, c.relevance, c.conversion, c.authority, c.freshness, c.network, c.efficiency, c.diagnosis, c.recommendation, c.trend, c.trend_delta]
      );
    }
    res.json({ seeded: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post("/api/agile/seed", async (_req: Request, res: Response) => {
  try {
    await ensureTables();
    const pool = getPool();
    const { rows } = await pool.query("SELECT count(*) as c FROM agile_stories");
    if (parseInt(rows[0].c) > 0) return res.json({ seeded: false });

    const stories = [
      { title: "User authentication flow", epic_name: "Platform Core", status: "done", priority: "critical", story_points: 5, assignee: "Sarah K." },
      { title: "Dashboard KPI widgets", epic_name: "Platform Core", status: "done", priority: "high", story_points: 8, assignee: "Marcus R." },
      { title: "Report export to PDF", epic_name: "Reporting", status: "in_progress", priority: "high", story_points: 5, assignee: "Sarah K." },
      { title: "Email notification system", epic_name: "Notifications", status: "in_progress", priority: "medium", story_points: 3, assignee: "James H." },
      { title: "Role-based access control", epic_name: "Platform Core", status: "todo", priority: "critical", story_points: 8, assignee: "Marcus R." },
      { title: "API rate limiting", epic_name: "Platform Core", status: "todo", priority: "high", story_points: 3, assignee: "Sarah K." },
      { title: "Custom dashboard builder", epic_name: "Reporting", status: "backlog", priority: "medium", story_points: 13, assignee: "" },
      { title: "Mobile responsive layouts", epic_name: "Platform Core", status: "review", priority: "high", story_points: 5, assignee: "James H." },
    ];

    for (const s of stories) {
      await pool.query(
        `INSERT INTO agile_stories (title, epic_name, status, priority, story_points, assignee) VALUES ($1,$2,$3,$4,$5,$6)`,
        [s.title, s.epic_name, s.status, s.priority, s.story_points, s.assignee]
      );
    }

    const epics = [
      { name: "Platform Core", status: "active", progress: 60, story_count: 5, owner: "Marcus R." },
      { name: "Reporting", status: "active", progress: 30, story_count: 2, owner: "Sarah K." },
      { name: "Notifications", status: "active", progress: 40, story_count: 1, owner: "James H." },
    ];
    for (const e of epics) {
      await pool.query(`INSERT INTO agile_epics (name, status, progress, story_count, owner) VALUES ($1,$2,$3,$4,$5)`, [e.name, e.status, e.progress, e.story_count, e.owner]);
    }

    const sprints = [
      { name: "Sprint 12", status: "active", start_date: "2026-03-10", end_date: "2026-03-24", total_points: 24, completed_points: 13, velocity: 22, stories: 6 },
      { name: "Sprint 11", status: "completed", start_date: "2026-02-24", end_date: "2026-03-09", total_points: 22, completed_points: 22, velocity: 22, stories: 5 },
    ];
    for (const sp of sprints) {
      await pool.query(`INSERT INTO agile_sprints (name, status, start_date, end_date, total_points, completed_points, velocity, stories) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [sp.name, sp.status, sp.start_date, sp.end_date, sp.total_points, sp.completed_points, sp.velocity, sp.stories]);
    }

    res.json({ seeded: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post("/api/compliance/seed", async (_req: Request, res: Response) => {
  try {
    await ensureTables();
    const pool = getPool();
    const { rows } = await pool.query("SELECT count(*) as c FROM compliance_items");
    if (parseInt(rows[0].c) > 0) return res.json({ seeded: false });

    const items = [
      { title: "Annual Financial Audit", description: "Complete annual financial audit with external auditor", category: "financial", status: "compliant", owner: "CFO", due_date: "2026-06-30", priority: "Critical", reminder_frequency: "weekly", authority: "SEC / IRS" },
      { title: "Employee Handbook Update", description: "Review and update employee handbook with current policies", category: "hr", status: "at_risk", owner: "HR Director", due_date: "2026-04-15", priority: "High", reminder_frequency: "biweekly", authority: "Department of Labor" },
      { title: "Data Privacy Policy (CCPA)", description: "Ensure CCPA compliance for customer data handling", category: "regulatory", status: "compliant", owner: "Legal Counsel", due_date: "2026-12-31", priority: "Critical", reminder_frequency: "weekly", authority: "California AG" },
      { title: "Vendor Security Assessment", description: "Conduct security assessments for all Tier 1 vendors", category: "vendor", status: "overdue", owner: "CISO", due_date: "2026-03-01", priority: "High", reminder_frequency: "daily", authority: "Internal Policy" },
      { title: "SOC 2 Type II Renewal", description: "Prepare for SOC 2 Type II audit renewal", category: "security", status: "at_risk", owner: "VP Engineering", due_date: "2026-05-15", priority: "Critical", reminder_frequency: "weekly", authority: "AICPA" },
      { title: "Quarterly Tax Filing", description: "File quarterly estimated tax payments", category: "financial", status: "compliant", owner: "Controller", due_date: "2026-04-15", priority: "High", reminder_frequency: "biweekly", authority: "IRS" },
      { title: "Anti-Harassment Training", description: "Annual anti-harassment training for all employees", category: "hr", status: "missing", owner: "HR Director", due_date: "2026-03-31", priority: "Medium", reminder_frequency: "weekly", authority: "EEOC" },
    ];

    for (const it of items) {
      await pool.query(
        `INSERT INTO compliance_items (title, description, category, status, owner, due_date, priority, reminder_frequency, authority) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [it.title, it.description, it.category, it.status, it.owner, it.due_date, it.priority, it.reminder_frequency, it.authority]
      );
    }
    res.json({ seeded: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
