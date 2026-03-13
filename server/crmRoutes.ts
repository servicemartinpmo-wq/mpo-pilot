import { Router, Request, Response } from "express";
import { initCRMTables } from "./crmSchema";
import {
  runDiscovery, saveDiscoveredCompany, getSavedCompanies, getSavedContacts,
  getCompanySignals, getDiscoveryRuns, deleteCompany, updateCompanyStatus,
  type DiscoveryQuery, type DiscoveredCompany,
} from "./crmDiscoveryService";
import { verifyEmail, detectEmailPatterns, predictEmails } from "./crmEmailService";
import { detectSignals } from "./crmSignalService";
import { scanTechnographics } from "./crmTechScanner";
import { crawlCompanyWebsite, getDomainFromUrl } from "./crmWebCrawler";
import { scoreCompany } from "./crmScoringService";
import { getPool } from "./db";

const router = Router();

let tablesInitialized = false;

async function ensureTables() {
  if (!tablesInitialized) {
    try {
      await initCRMTables();
      tablesInitialized = true;
    } catch (err) {
      console.error("[CRM] Table init error:", err);
    }
  }
}

router.post("/api/crm/discover", async (req: Request, res: Response) => {
  try {
    await ensureTables();
    const { text, industry, location, sizeMin, sizeMax } = req.body as DiscoveryQuery;

    if (!text && !industry && !location) {
      return res.status(400).json({ error: "At least one search criterion is required (text, industry, or location)" });
    }

    const results = await runDiscovery({ text, industry, location, sizeMin, sizeMax });
    res.json({ companies: results, count: results.length });
  } catch (err) {
    console.error("[CRM] Discovery error:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Discovery failed" });
  }
});

router.post("/api/crm/discover/stream", async (req: Request, res: Response) => {
  try {
    await ensureTables();
    const query = req.body as DiscoveryQuery;

    if (!query.text && !query.industry && !query.location) {
      return res.status(400).json({ error: "At least one search criterion is required" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const results = await runDiscovery(query, (progress) => {
      res.write(`data: ${JSON.stringify({ type: "progress", ...progress })}\n\n`);
    });

    res.write(`data: ${JSON.stringify({ type: "results", companies: results, count: results.length })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  } catch (err) {
    console.error("[CRM] Stream discovery error:", err);
    res.write(`data: ${JSON.stringify({ type: "error", message: err instanceof Error ? err.message : "Discovery failed" })}\n\n`);
    res.end();
  }
});

router.post("/api/crm/companies/save", async (req: Request, res: Response) => {
  try {
    await ensureTables();
    const company = req.body as DiscoveredCompany;
    const result = await saveDiscoveredCompany(company);
    res.json(result);
  } catch (err) {
    console.error("[CRM] Save error:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Save failed" });
  }
});

router.get("/api/crm/companies", async (_req: Request, res: Response) => {
  try {
    await ensureTables();
    const companies = await getSavedCompanies();
    res.json(companies);
  } catch (err) {
    console.error("[CRM] Get companies error:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Failed to load companies" });
  }
});

router.get("/api/crm/contacts", async (req: Request, res: Response) => {
  try {
    await ensureTables();
    const companyId = req.query.companyId as string | undefined;
    const contacts = await getSavedContacts(companyId);
    res.json(contacts);
  } catch (err) {
    console.error("[CRM] Get contacts error:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Failed to load contacts" });
  }
});

router.get("/api/crm/companies/:id/signals", async (req: Request, res: Response) => {
  try {
    await ensureTables();
    const signals = await getCompanySignals(req.params.id);
    res.json(signals);
  } catch (err) {
    res.status(500).json({ error: "Failed to load signals" });
  }
});

router.post("/api/crm/signals", async (req: Request, res: Response) => {
  try {
    const { companyName, domain } = req.body;
    if (!companyName && !domain) {
      return res.status(400).json({ error: "companyName or domain required" });
    }
    const signals = await detectSignals(companyName || domain, domain || "");
    res.json(signals);
  } catch (err) {
    res.status(500).json({ error: "Signal detection failed" });
  }
});

router.post("/api/crm/email-predict", async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, domain, knownEmails } = req.body;
    if (!firstName || !lastName || !domain) {
      return res.status(400).json({ error: "firstName, lastName, and domain are required" });
    }
    const patterns = detectEmailPatterns(knownEmails || [], domain);
    const predictions = predictEmails(firstName, lastName, domain, patterns);
    res.json({ patterns, predictions });
  } catch (err) {
    res.status(500).json({ error: "Email prediction failed" });
  }
});

router.post("/api/crm/email-verify", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }
    const result = await verifyEmail(email);

    if (result.valid) {
      const pool = getPool();
      await pool.query(
        `UPDATE crm_contacts SET email_verified = true, email_verified_at = now() WHERE direct_email = $1`,
        [email]
      );
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Email verification failed" });
  }
});

router.delete("/api/crm/companies/:id", async (req: Request, res: Response) => {
  try {
    await ensureTables();
    await deleteCompany(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

router.patch("/api/crm/companies/:id/status", async (req: Request, res: Response) => {
  try {
    await ensureTables();
    const { status } = req.body;
    await updateCompanyStatus(req.params.id, status);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Status update failed" });
  }
});

router.get("/api/crm/discovery-runs", async (_req: Request, res: Response) => {
  try {
    await ensureTables();
    const runs = await getDiscoveryRuns();
    res.json(runs);
  } catch (err) {
    res.status(500).json({ error: "Failed to load runs" });
  }
});

router.post("/api/crm/tech-scan", async (req: Request, res: Response) => {
  try {
    const { domain } = req.body;
    if (!domain) return res.status(400).json({ error: "domain required" });
    const webData = await crawlCompanyWebsite(domain);
    const allTech: any[] = [];
    for (const page of webData.pages) {
      allTech.push(...scanTechnographics(page.html));
    }
    const seen = new Set<string>();
    const unique = allTech.filter(t => { if (seen.has(t.name)) return false; seen.add(t.name); return true; });
    res.json(unique);
  } catch (err) {
    res.status(500).json({ error: "Tech scan failed" });
  }
});

export default router;
