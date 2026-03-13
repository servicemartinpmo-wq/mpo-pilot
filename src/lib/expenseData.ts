/**
 * Expense Management — Data Layer
 * All tier levels. localStorage-persisted.
 */

export type ExpenseCategory =
  | "Operations"
  | "Marketing"
  | "People & HR"
  | "Technology"
  | "Travel"
  | "Professional Services"
  | "Infrastructure"
  | "Other";

export type ExpenseStatus = "approved" | "pending" | "rejected" | "draft";
export type RecurrenceType = "one-time" | "monthly" | "quarterly" | "annual";

// ── Allocation line (subcoding) ───────────────────────────────────────────────
export interface AllocationLine {
  id: string;
  category: ExpenseCategory;
  glCode: string;       // General Ledger code e.g. "6200"
  costCenter: string;   // e.g. "CC-002 · Marketing"
  amount: number;
  note: string;         // per-line note, shared among team
}

// ── Shared team note / activity ───────────────────────────────────────────────
export interface ExpenseNote {
  id: string;
  author: string;
  content: string;
  timestamp: string;    // ISO
  type: "comment" | "approval" | "rejection" | "submitted" | "info";
}

// ── Receipt ───────────────────────────────────────────────────────────────────
export interface Receipt {
  filename: string;
  size?: string;
  uploadedAt: string;
  uploadedBy: string;
  mimeType?: string;
  dataUrl?: string;
  storageUrl?: string;
  storagePath?: string;
}

// ── Subscription ─────────────────────────────────────────────────────────────
export type SubscriptionStatus = "active" | "at-risk" | "redundant" | "cancelled";
export type BillingCycle = "monthly" | "quarterly" | "annual";

export interface Subscription {
  id: string;
  name: string;
  vendor: string;
  category: ExpenseCategory;
  monthlyCost: number;
  billingCycle: BillingCycle;
  renewalDate: string;
  owner: string;
  roiScore: number;
  status: SubscriptionStatus;
  lastUsed?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionStore {
  subscriptions: Subscription[];
}

// ── Expense ───────────────────────────────────────────────────────────────────
export interface Expense {
  id: string;
  title: string;
  totalAmount: number;
  date: string;
  vendor: string;
  status: ExpenseStatus;
  submittedBy: string;
  recurrence: RecurrenceType;
  allocations: AllocationLine[];
  notes: ExpenseNote[];
  receipt?: Receipt;
  initiativeRef?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Budget allocation ─────────────────────────────────────────────────────────
export interface BudgetLine {
  category: ExpenseCategory;
  glCode: string;
  allocated: number;
}

export interface ExpenseStore {
  expenses: Expense[];
  budgets: BudgetLine[];
  totalBudget: number;
  fiscalYear: number;
}

// ── Chart of accounts (GL codes) ──────────────────────────────────────────────
export const GL_CODES: { code: string; label: string; category: ExpenseCategory }[] = [
  { code: "6100", label: "6100 · Operations & Facilities",         category: "Operations"            },
  { code: "6200", label: "6200 · Marketing & Advertising",         category: "Marketing"             },
  { code: "6300", label: "6300 · Salaries & Benefits",             category: "People & HR"           },
  { code: "6400", label: "6400 · Software & Technology",           category: "Technology"            },
  { code: "6500", label: "6500 · Travel & Entertainment",          category: "Travel"                },
  { code: "6600", label: "6600 · Consulting & Professional Svcs",  category: "Professional Services" },
  { code: "6700", label: "6700 · Infrastructure & Equipment",      category: "Infrastructure"        },
  { code: "6800", label: "6800 · Miscellaneous",                   category: "Other"                 },
];

export const COST_CENTERS = [
  "CC-001 · Executive",
  "CC-002 · Operations",
  "CC-003 · Marketing",
  "CC-004 · People & HR",
  "CC-005 · Engineering",
  "CC-006 · Finance",
  "CC-007 · Sales",
  "CC-008 · Product",
  "CC-009 · Legal",
];

export const ALL_CATEGORIES: ExpenseCategory[] = [
  "Operations", "Marketing", "People & HR", "Technology",
  "Travel", "Professional Services", "Infrastructure", "Other",
];

export const CATEGORY_META: Record<ExpenseCategory, { color: string; bg: string; icon: string; glCode: string }> = {
  "Operations":             { color: "hsl(222 88% 65%)",  bg: "hsl(222 88% 65% / 0.10)", icon: "⚙️",  glCode: "6100" },
  "Marketing":              { color: "hsl(290 72% 62%)",  bg: "hsl(290 72% 62% / 0.10)", icon: "📣",  glCode: "6200" },
  "People & HR":            { color: "hsl(174 68% 44%)",  bg: "hsl(174 68% 44% / 0.10)", icon: "👥",  glCode: "6300" },
  "Technology":             { color: "hsl(200 72% 52%)",  bg: "hsl(200 72% 52% / 0.10)", icon: "💻",  glCode: "6400" },
  "Travel":                 { color: "hsl(38 92% 52%)",   bg: "hsl(38 92% 52% / 0.10)",  icon: "✈️",  glCode: "6500" },
  "Professional Services":  { color: "hsl(258 68% 64%)",  bg: "hsl(258 68% 64% / 0.10)", icon: "🤝",  glCode: "6600" },
  "Infrastructure":         { color: "hsl(160 56% 46%)",  bg: "hsl(160 56% 46% / 0.10)", icon: "🏗️",  glCode: "6700" },
  "Other":                  { color: "hsl(220 10% 52%)",  bg: "hsl(220 10% 52% / 0.10)", icon: "📦",  glCode: "6800" },
};

// ── Seed data ─────────────────────────────────────────────────────────────────

const SEED: Expense[] = [
  {
    id: "exp-001", title: "AWS Cloud Infrastructure", totalAmount: 12400,
    date: "2026-01-05", vendor: "Amazon Web Services", status: "approved",
    submittedBy: "Alex M.", recurrence: "monthly", initiativeRef: "INI-002",
    createdAt: "2026-01-05T10:00:00Z", updatedAt: "2026-01-06T09:00:00Z",
    receipt: { filename: "aws-invoice-jan-2026.pdf", size: "142 KB", uploadedAt: "2026-01-05T10:30:00Z", uploadedBy: "Alex M.", mimeType: "application/pdf" },
    allocations: [
      { id: "al-001a", category: "Technology", glCode: "6400", costCenter: "CC-005 · Engineering", amount: 8400, note: "Prod environment EC2 + RDS" },
      { id: "al-001b", category: "Infrastructure", glCode: "6700", costCenter: "CC-002 · Operations", amount: 4000, note: "S3 storage + CloudFront CDN" },
    ],
    notes: [
      { id: "n-001a", author: "Alex M.", content: "Submitted for Q1 tech spend review.", timestamp: "2026-01-05T10:00:00Z", type: "submitted" },
      { id: "n-001b", author: "Jordan K.", content: "Approved — within Q1 budget envelope.", timestamp: "2026-01-06T09:00:00Z", type: "approval" },
    ],
  },
  {
    id: "exp-002", title: "Google Ads — Digital Campaign", totalAmount: 8200,
    date: "2026-01-10", vendor: "Google LLC", status: "approved",
    submittedBy: "Sam P.", recurrence: "monthly", initiativeRef: "INI-004",
    createdAt: "2026-01-10T09:00:00Z", updatedAt: "2026-01-11T08:00:00Z",
    receipt: { filename: "google-ads-jan.pdf", size: "89 KB", uploadedAt: "2026-01-10T09:15:00Z", uploadedBy: "Sam P.", mimeType: "application/pdf" },
    allocations: [
      { id: "al-002a", category: "Marketing", glCode: "6200", costCenter: "CC-003 · Marketing", amount: 8200, note: "Search + display — Pipeline Gen campaign" },
    ],
    notes: [
      { id: "n-002a", author: "Sam P.", content: "Monthly Google Ads budget — Jan campaign.", timestamp: "2026-01-10T09:00:00Z", type: "submitted" },
      { id: "n-002b", author: "Alex M.", content: "Approved. Please tag INI-004 for Q1 marketing rollup.", timestamp: "2026-01-11T08:00:00Z", type: "approval" },
    ],
  },
  {
    id: "exp-003", title: "Office Lease — January", totalAmount: 6500,
    date: "2026-01-01", vendor: "Meridian Real Estate", status: "approved",
    submittedBy: "Alex M.", recurrence: "monthly",
    createdAt: "2026-01-01T08:00:00Z", updatedAt: "2026-01-01T08:30:00Z",
    allocations: [
      { id: "al-003a", category: "Operations", glCode: "6100", costCenter: "CC-002 · Operations", amount: 6500, note: "Floor 4 lease — 12 desks, 2 conference rooms" },
    ],
    notes: [
      { id: "n-003a", author: "Alex M.", content: "Standard monthly lease payment.", timestamp: "2026-01-01T08:00:00Z", type: "submitted" },
      { id: "n-003b", author: "Jordan K.", content: "Auto-approved per standing PO agreement.", timestamp: "2026-01-01T08:30:00Z", type: "approval" },
    ],
  },
  {
    id: "exp-004", title: "Q1 Executive Off-Site", totalAmount: 4800,
    date: "2026-01-22", vendor: "Marriott Hotels", status: "approved",
    submittedBy: "Chris T.", recurrence: "one-time",
    createdAt: "2026-01-22T14:00:00Z", updatedAt: "2026-01-23T10:00:00Z",
    receipt: { filename: "marriott-receipt-jan22.jpg", size: "210 KB", uploadedAt: "2026-01-22T18:00:00Z", uploadedBy: "Chris T.", mimeType: "image/jpeg" },
    allocations: [
      { id: "al-004a", category: "Travel", glCode: "6500", costCenter: "CC-001 · Executive", amount: 3200, note: "Hotel — 2 nights × 6 rooms" },
      { id: "al-004b", category: "Operations", glCode: "6100", costCenter: "CC-001 · Executive", amount: 1600, note: "Catering & A/V for strategy sessions" },
    ],
    notes: [
      { id: "n-004a", author: "Chris T.", content: "Annual Q1 strategy off-site. 6 attendees.", timestamp: "2026-01-22T14:00:00Z", type: "submitted" },
      { id: "n-004b", author: "Alex M.", content: "Approved — within the exec T&E policy limit.", timestamp: "2026-01-23T10:00:00Z", type: "approval" },
    ],
  },
  {
    id: "exp-005", title: "Senior Engineer Recruitment (2 hires)", totalAmount: 18000,
    date: "2026-02-03", vendor: "Hire Point Recruiting", status: "approved",
    submittedBy: "Jordan K.", recurrence: "one-time", initiativeRef: "INI-001",
    createdAt: "2026-02-03T09:00:00Z", updatedAt: "2026-02-04T08:00:00Z",
    allocations: [
      { id: "al-005a", category: "People & HR", glCode: "6300", costCenter: "CC-004 · People & HR", amount: 18000, note: "18% placement fee × 2 hires at $50K avg salary" },
    ],
    notes: [
      { id: "n-005a", author: "Jordan K.", content: "Placement fees for 2 senior engineers per INI-001 headcount plan.", timestamp: "2026-02-03T09:00:00Z", type: "submitted" },
      { id: "n-005b", author: "Alex M.", content: "Approved. Verify SOW is on file with Legal.", timestamp: "2026-02-04T08:00:00Z", type: "approval" },
    ],
  },
  {
    id: "exp-006", title: "PR Agency Retainer — Q1", totalAmount: 12000,
    date: "2026-03-15", vendor: "Signal PR Group", status: "pending",
    submittedBy: "Sam P.", recurrence: "quarterly", initiativeRef: "INI-004",
    createdAt: "2026-03-15T11:00:00Z", updatedAt: "2026-03-15T11:00:00Z",
    receipt: { filename: "signal-pr-q1-invoice.pdf", size: "98 KB", uploadedAt: "2026-03-15T11:10:00Z", uploadedBy: "Sam P.", mimeType: "application/pdf" },
    allocations: [
      { id: "al-006a", category: "Marketing", glCode: "6200", costCenter: "CC-003 · Marketing", amount: 8000, note: "Media outreach + press release distribution" },
      { id: "al-006b", category: "Professional Services", glCode: "6600", costCenter: "CC-003 · Marketing", amount: 4000, note: "Crisis comms retainer — standby hours" },
    ],
    notes: [
      { id: "n-006a", author: "Sam P.", content: "Q1 PR retainer. Awaiting CFO sign-off (>$10K threshold).", timestamp: "2026-03-15T11:00:00Z", type: "submitted" },
    ],
  },
  {
    id: "exp-007", title: "Cyber Security Audit", totalAmount: 9500,
    date: "2026-03-20", vendor: "ShieldSec Partners", status: "pending",
    submittedBy: "Alex M.", recurrence: "one-time",
    createdAt: "2026-03-20T10:00:00Z", updatedAt: "2026-03-20T10:00:00Z",
    allocations: [
      { id: "al-007a", category: "Professional Services", glCode: "6600", costCenter: "CC-005 · Engineering", amount: 6500, note: "Penetration testing + vulnerability report" },
      { id: "al-007b", category: "Technology", glCode: "6400", costCenter: "CC-005 · Engineering", amount: 3000, note: "Security tooling setup for audit period" },
    ],
    notes: [
      { id: "n-007a", author: "Alex M.", content: "Annual compliance requirement. SOC 2 prep.", timestamp: "2026-03-20T10:00:00Z", type: "submitted" },
    ],
  },
  {
    id: "exp-008", title: "Customer Launch Event", totalAmount: 15200,
    date: "2026-03-28", vendor: "Venue & Events Co.", status: "pending",
    submittedBy: "Sam P.", recurrence: "one-time", initiativeRef: "INI-003",
    createdAt: "2026-03-28T12:00:00Z", updatedAt: "2026-03-28T12:00:00Z",
    receipt: { filename: "venue-deposit-receipt.pdf", size: "56 KB", uploadedAt: "2026-03-28T12:20:00Z", uploadedBy: "Sam P.", mimeType: "application/pdf" },
    allocations: [
      { id: "al-008a", category: "Marketing", glCode: "6200", costCenter: "CC-003 · Marketing", amount: 9200, note: "Venue hire + A/V + catering for 80 guests" },
      { id: "al-008b", category: "Travel", glCode: "6500", costCenter: "CC-003 · Marketing", amount: 3500, note: "Speaker travel + accommodation" },
      { id: "al-008c", category: "Operations", glCode: "6100", costCenter: "CC-002 · Operations", amount: 2500, note: "Event staffing + logistics coordination" },
    ],
    notes: [
      { id: "n-008a", author: "Sam P.", content: "Product launch event for INI-003. Pending CFO approval — over $10K threshold.", timestamp: "2026-03-28T12:00:00Z", type: "submitted" },
    ],
  },
];

const SEED_BUDGETS: BudgetLine[] = [
  { category: "Operations",            glCode: "6100", allocated: 90000  },
  { category: "Marketing",             glCode: "6200", allocated: 120000 },
  { category: "People & HR",           glCode: "6300", allocated: 150000 },
  { category: "Technology",            glCode: "6400", allocated: 180000 },
  { category: "Travel",                glCode: "6500", allocated: 40000  },
  { category: "Professional Services", glCode: "6600", allocated: 80000  },
  { category: "Infrastructure",        glCode: "6700", allocated: 60000  },
  { category: "Other",                 glCode: "6800", allocated: 20000  },
];

// ── Storage ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = "martin_expenses_v2";

export function loadExpenseStore(): ExpenseStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    expenses: SEED,
    budgets: SEED_BUDGETS,
    totalBudget: SEED_BUDGETS.reduce((s, b) => s + b.allocated, 0),
    fiscalYear: new Date().getFullYear(),
  };
}

export function saveExpenseStore(store: ExpenseStore): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch {}
}

// ── Subscription storage ─────────────────────────────────────────────────────

const SUB_STORAGE_KEY = "martin_subscriptions_v1";

const SEED_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "sub-001", name: "AWS", vendor: "Amazon Web Services", category: "Technology",
    monthlyCost: 12400, billingCycle: "monthly", renewalDate: "2027-01-05",
    owner: "Alex M.", roiScore: 92, status: "active", lastUsed: "2026-03-12",
    createdAt: "2025-01-05T10:00:00Z", updatedAt: "2026-03-12T10:00:00Z",
  },
  {
    id: "sub-002", name: "Slack", vendor: "Salesforce", category: "Technology",
    monthlyCost: 1250, billingCycle: "monthly", renewalDate: "2026-09-01",
    owner: "Jordan K.", roiScore: 88, status: "active", lastUsed: "2026-03-13",
    createdAt: "2024-09-01T10:00:00Z", updatedAt: "2026-03-13T09:00:00Z",
  },
  {
    id: "sub-003", name: "Figma", vendor: "Figma Inc.", category: "Technology",
    monthlyCost: 450, billingCycle: "annual", renewalDate: "2026-06-15",
    owner: "Sam P.", roiScore: 75, status: "active", lastUsed: "2026-03-10",
    createdAt: "2025-06-15T10:00:00Z", updatedAt: "2026-03-10T15:00:00Z",
  },
  {
    id: "sub-004", name: "HubSpot Marketing", vendor: "HubSpot", category: "Marketing",
    monthlyCost: 3200, billingCycle: "monthly", renewalDate: "2026-12-01",
    owner: "Sam P.", roiScore: 62, status: "at-risk", lastUsed: "2026-02-20",
    notes: "Usage dropped 40% since Q4. Consider downgrade to Starter tier.",
    createdAt: "2024-12-01T10:00:00Z", updatedAt: "2026-02-20T10:00:00Z",
  },
  {
    id: "sub-005", name: "Jira", vendor: "Atlassian", category: "Technology",
    monthlyCost: 890, billingCycle: "monthly", renewalDate: "2026-08-01",
    owner: "Alex M.", roiScore: 45, status: "at-risk", lastUsed: "2026-01-15",
    notes: "Team migrated most work to Linear. Only legacy projects remain.",
    createdAt: "2023-08-01T10:00:00Z", updatedAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "sub-006", name: "Adobe Creative Cloud", vendor: "Adobe", category: "Marketing",
    monthlyCost: 1800, billingCycle: "annual", renewalDate: "2026-04-20",
    owner: "Sam P.", roiScore: 30, status: "redundant", lastUsed: "2025-11-10",
    notes: "Only 2 of 15 licenses used. Team shifted to Figma and Canva.",
    createdAt: "2024-04-20T10:00:00Z", updatedAt: "2025-11-10T10:00:00Z",
  },
  {
    id: "sub-007", name: "Zoom Business", vendor: "Zoom", category: "Operations",
    monthlyCost: 600, billingCycle: "monthly", renewalDate: "2026-07-15",
    owner: "Jordan K.", roiScore: 82, status: "active", lastUsed: "2026-03-13",
    createdAt: "2024-07-15T10:00:00Z", updatedAt: "2026-03-13T08:00:00Z",
  },
  {
    id: "sub-008", name: "Salesforce CRM", vendor: "Salesforce", category: "Technology",
    monthlyCost: 4500, billingCycle: "monthly", renewalDate: "2026-11-01",
    owner: "Chris T.", roiScore: 70, status: "active", lastUsed: "2026-03-11",
    createdAt: "2024-11-01T10:00:00Z", updatedAt: "2026-03-11T14:00:00Z",
  },
  {
    id: "sub-009", name: "Notion", vendor: "Notion Labs", category: "Technology",
    monthlyCost: 320, billingCycle: "monthly", renewalDate: "2026-05-01",
    owner: "Jordan K.", roiScore: 25, status: "redundant", lastUsed: "2025-09-22",
    notes: "Replaced by Confluence. No active users in 6 months.",
    createdAt: "2024-05-01T10:00:00Z", updatedAt: "2025-09-22T10:00:00Z",
  },
  {
    id: "sub-010", name: "GitHub Enterprise", vendor: "Microsoft", category: "Technology",
    monthlyCost: 2100, billingCycle: "monthly", renewalDate: "2026-10-01",
    owner: "Alex M.", roiScore: 95, status: "active", lastUsed: "2026-03-13",
    createdAt: "2024-10-01T10:00:00Z", updatedAt: "2026-03-13T11:00:00Z",
  },
];

export function loadSubscriptionStore(): SubscriptionStore {
  try {
    const raw = localStorage.getItem(SUB_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { subscriptions: SEED_SUBSCRIPTIONS };
}

export function saveSubscriptionStore(store: SubscriptionStore): void {
  try { localStorage.setItem(SUB_STORAGE_KEY, JSON.stringify(store)); } catch {}
}

export function calcWasteMetrics(subs: Subscription[]) {
  const active = subs.filter(s => s.status !== "cancelled");
  const totalMonthly = active.reduce((s, sub) => s + sub.monthlyCost, 0);
  const atRisk = active.filter(s => s.status === "at-risk");
  const redundant = active.filter(s => s.status === "redundant");
  const flagged = [...atRisk, ...redundant];
  const wasteMonthly = flagged.reduce((s, sub) => s + sub.monthlyCost, 0);
  const wasteAnnual = wasteMonthly * 12;
  const prevMonthTotal = totalMonthly * 0.97;
  const momChange = totalMonthly - prevMonthTotal;
  const momPct = prevMonthTotal > 0 ? ((momChange / prevMonthTotal) * 100) : 0;
  return { totalMonthly, totalAnnual: totalMonthly * 12, wasteMonthly, wasteAnnual, flaggedCount: flagged.length, atRiskCount: atRisk.length, redundantCount: redundant.length, momChange, momPct };
}

export function deriveSubscriptionStatus(sub: Subscription): SubscriptionStatus {
  if (sub.status === "cancelled") return "cancelled";
  if (sub.roiScore < 40) return "redundant";
  if (sub.roiScore < 70) return "at-risk";
  return "active";
}

// ── Receipt upload to Supabase Storage ───────────────────────────────────────

export async function uploadReceiptToStorage(file: File, expenseId: string): Promise<{ storageUrl: string; storagePath: string } | { error: string }> {
  try {
    const { supabase } = await import("@/integrations/supabase/client");

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? "anonymous";
    const ext = file.name.split(".").pop() || "bin";
    const path = `${userId}/${expenseId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(path, file, { contentType: file.type, upsert: true });

    if (uploadError) {
      console.error("[Receipt Upload] Supabase upload failed:", uploadError.message);
      return { error: uploadError.message };
    }

    const { data: signedData, error: signError } = await supabase.storage
      .from("receipts")
      .createSignedUrl(path, 60 * 60 * 24 * 7);

    if (signError || !signedData?.signedUrl) {
      console.error("[Receipt Upload] Signed URL failed:", signError?.message);
      return { error: signError?.message ?? "Failed to create signed URL" };
    }

    return { storageUrl: signedData.signedUrl, storagePath: path };
  } catch (err) {
    console.error("[Receipt Upload] Unexpected error:", err);
    return { error: String(err) };
  }
}

export async function getReceiptSignedUrl(storagePath: string): Promise<string | null> {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data, error } = await supabase.storage
      .from("receipts")
      .createSignedUrl(storagePath, 60 * 60);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function spentByCategory(expenses: Expense[]): Record<string, number> {
  const r: Record<string, number> = {};
  for (const cat of ALL_CATEGORIES) r[cat] = 0;
  for (const e of expenses.filter(x => x.status !== "rejected" && x.status !== "draft")) {
    for (const a of e.allocations) r[a.category] = (r[a.category] ?? 0) + a.amount;
  }
  return r;
}

export function spentByMonth(expenses: Expense[]): { month: string; amount: number }[] {
  const map: Record<string, number> = {};
  for (const e of expenses.filter(x => x.status !== "rejected" && x.status !== "draft")) {
    const m = e.date.slice(0, 7);
    map[m] = (map[m] ?? 0) + e.totalAmount;
  }
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({ month: month.replace("-", "/"), amount }));
}

export function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

export function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// ── Document templates ────────────────────────────────────────────────────────

export type DocCategory = "rfp" | "contract" | "grant" | "budget";

export interface DocTemplate {
  id: string;
  title: string;
  category: DocCategory;
  subtitle: string;
  description: string;
  icon: string;
  billingFramework?: string;
  sections: string[];
  fields: { id: string; label: string; placeholder: string; multiline?: boolean; required?: boolean }[];
}

export const DOC_TEMPLATES: DocTemplate[] = [
  // ── RFPs ──────────────────────────────────────────────────────────────────
  {
    id: "rfp-standard", title: "Standard RFP", category: "rfp",
    icon: "📋", subtitle: "Request for Proposal",
    description: "General-purpose RFP for services, technology, or vendor partnerships.",
    sections: ["Project Overview", "Scope of Work", "Evaluation Criteria", "Submission Requirements", "Timeline", "Budget Range"],
    fields: [
      { id: "org", label: "Issuing Organisation", placeholder: "e.g. Apex Operations Group", required: true },
      { id: "project", label: "Project / Engagement Name", placeholder: "e.g. CRM Platform Replacement", required: true },
      { id: "scope", label: "Scope of Work", placeholder: "Describe what the vendor must deliver…", multiline: true, required: true },
      { id: "budget", label: "Budget Range", placeholder: "e.g. $50,000 – $150,000" },
      { id: "deadline", label: "Proposal Deadline", placeholder: "e.g. April 30, 2026", required: true },
      { id: "criteria", label: "Evaluation Criteria", placeholder: "Price 30%, Experience 30%, Technical 40%…", multiline: true },
      { id: "contact", label: "Primary Contact", placeholder: "Name, title, email" },
    ],
  },
  {
    id: "rfp-it", title: "IT / Technology RFP", category: "rfp",
    icon: "💻", subtitle: "Technology Procurement",
    description: "Technology-specific RFP including security, integration, and SLA requirements.",
    sections: ["Technical Requirements", "Security Standards", "Integration Points", "SLA Expectations", "Support Model", "Pricing Structure"],
    fields: [
      { id: "org", label: "Issuing Organisation", placeholder: "Organisation name", required: true },
      { id: "solution", label: "Solution Being Procured", placeholder: "e.g. Cloud ERP, SIEM, Data Warehouse", required: true },
      { id: "techReqs", label: "Technical Requirements", placeholder: "APIs, uptime SLA, data residency…", multiline: true, required: true },
      { id: "security", label: "Security & Compliance Requirements", placeholder: "SOC 2, ISO 27001, GDPR…", multiline: true },
      { id: "integrations", label: "Required Integrations", placeholder: "Existing systems that must connect", multiline: true },
      { id: "budget", label: "Budget Envelope", placeholder: "Annual spend range" },
      { id: "timeline", label: "Go-Live Target", placeholder: "e.g. Q3 2026" },
    ],
  },

  // ── Contracts ─────────────────────────────────────────────────────────────
  {
    id: "contract-msa", title: "Master Service Agreement", category: "contract",
    icon: "📝", subtitle: "MSA Template",
    description: "Framework agreement governing all future SOWs with a vendor or partner.",
    sections: ["Parties", "Services & Deliverables", "Payment Terms", "Confidentiality", "IP Ownership", "Termination", "Governing Law"],
    fields: [
      { id: "client", label: "Client / Buyer", placeholder: "Full legal entity name", required: true },
      { id: "vendor", label: "Vendor / Service Provider", placeholder: "Full legal entity name", required: true },
      { id: "services", label: "General Services Description", placeholder: "High-level description of services…", multiline: true, required: true },
      { id: "payment", label: "Payment Terms", placeholder: "e.g. Net 30, milestone-based…" },
      { id: "term", label: "Initial Term", placeholder: "e.g. 12 months from effective date" },
      { id: "governing", label: "Governing Law / Jurisdiction", placeholder: "e.g. State of Texas, USA" },
      { id: "contact", label: "Point of Contact (each party)", placeholder: "Names, titles, emails" },
    ],
  },
  {
    id: "contract-sow", title: "Statement of Work (SOW)", category: "contract",
    icon: "📄", subtitle: "Project SOW",
    description: "Project-level contract defining deliverables, milestones, and acceptance criteria.",
    sections: ["Objective", "Deliverables", "Milestones", "Acceptance Criteria", "Out of Scope", "Fees", "Change Control"],
    fields: [
      { id: "project", label: "Project Name", placeholder: "e.g. Website Redesign Phase 2", required: true },
      { id: "objective", label: "Project Objective", placeholder: "What success looks like…", multiline: true, required: true },
      { id: "deliverables", label: "Key Deliverables", placeholder: "List each deliverable…", multiline: true, required: true },
      { id: "milestones", label: "Milestones & Dates", placeholder: "Milestone 1: Design approval — April 15…", multiline: true },
      { id: "outOfScope", label: "Out of Scope", placeholder: "Explicitly excluded items…", multiline: true },
      { id: "fees", label: "Total Fees & Payment Schedule", placeholder: "e.g. $45,000 total — 40% on start, 40% mid, 20% delivery" },
    ],
  },
  {
    id: "contract-vendor", title: "Vendor / Supplier Agreement", category: "contract",
    icon: "🤝", subtitle: "Vendor Contract",
    description: "Standard vendor contract covering supply, pricing, and quality terms.",
    sections: ["Parties", "Products / Services", "Pricing & Invoicing", "Quality Standards", "Warranties", "Liability Cap", "Termination"],
    fields: [
      { id: "buyer", label: "Buyer Organisation", placeholder: "Your org name", required: true },
      { id: "vendor", label: "Vendor Name", placeholder: "Vendor legal name", required: true },
      { id: "products", label: "Products / Services Supplied", placeholder: "Describe what is being supplied…", multiline: true, required: true },
      { id: "pricing", label: "Pricing & Payment Terms", placeholder: "Unit price, discounts, Net 30…" },
      { id: "quality", label: "Quality / SLA Standards", placeholder: "Defect rates, delivery timelines…", multiline: true },
      { id: "liability", label: "Liability Cap", placeholder: "e.g. Capped at 12 months of fees paid" },
    ],
  },

  // ── Grant Applications ─────────────────────────────────────────────────────
  {
    id: "grant-doe", title: "DOE Grant Application", category: "grant",
    icon: "⚡", subtitle: "Dept. of Energy — Billing Framework",
    billingFramework: "U.S. Department of Energy (DOE) — EERE / Office of Science",
    description: "Application framework for DOE energy research, clean energy, or workforce development grants. Follows federal SF-424 & 424A billing structures.",
    sections: ["Project Summary", "Statement of Need", "Program Narrative", "Budget Justification (SF-424A)", "Key Personnel", "Evaluation Plan", "Sustainability Plan"],
    fields: [
      { id: "org", label: "Applicant Organisation (Legal Name)", placeholder: "Full legal entity", required: true },
      { id: "program", label: "DOE Program / Funding Opportunity (FOA)", placeholder: "e.g. DE-FOA-0003456", required: true },
      { id: "projectTitle", label: "Project Title", placeholder: "Official project name", required: true },
      { id: "need", label: "Statement of Need", placeholder: "Problem statement aligned to DOE priorities…", multiline: true, required: true },
      { id: "objectives", label: "Project Objectives & Outcomes", placeholder: "Measurable goals tied to DOE mission…", multiline: true, required: true },
      { id: "budget", label: "Total Budget Requested", placeholder: "e.g. $2,400,000 over 3 years", required: true },
      { id: "budgetJustification", label: "Budget Justification (Personnel, Fringe, Travel, Equipment, Indirect)", placeholder: "Line-item breakdown per SF-424A categories…", multiline: true },
      { id: "personnel", label: "Key Personnel (PI, Co-PI)", placeholder: "Name, title, % effort, qualifications" },
      { id: "sustainability", label: "Sustainability / Continuation Plan", placeholder: "How the project continues after DOE funding…", multiline: true },
    ],
  },
  {
    id: "grant-city", title: "City / Municipal Grant Application", category: "grant",
    icon: "🏛️", subtitle: "City Council / Municipal — Billing Framework",
    billingFramework: "Municipal / City Council — Community Development & CDBG Frameworks",
    description: "Grant application for city or county funding programs, including CDBG, community development, workforce, or infrastructure projects.",
    sections: ["Executive Summary", "Community Need", "Project Description", "Budget Narrative", "Organisational Capacity", "Measurable Outcomes", "Compliance Certifications"],
    fields: [
      { id: "org", label: "Applicant Organisation", placeholder: "Full legal name + EIN", required: true },
      { id: "program", label: "Grant Program / Fund Name", placeholder: "e.g. City of Austin CDBG FY26", required: true },
      { id: "amount", label: "Amount Requested", placeholder: "e.g. $85,000", required: true },
      { id: "execSummary", label: "Executive Summary (250 words max)", placeholder: "What you will do, who benefits, expected outcomes…", multiline: true, required: true },
      { id: "communityNeed", label: "Community Need / Problem Statement", placeholder: "Data-backed description of the need…", multiline: true, required: true },
      { id: "activities", label: "Project Activities & Timeline", placeholder: "Month-by-month activity plan…", multiline: true },
      { id: "budget", label: "Budget Narrative (Personnel / Supplies / Indirect)", placeholder: "Itemised budget with justification per line…", multiline: true, required: true },
      { id: "outcomes", label: "Measurable Outcomes & Indicators", placeholder: "# served, % improvement, milestones…", multiline: true },
      { id: "matchFunding", label: "Match / Leveraged Funding (if required)", placeholder: "Source, amount, and confirmation letter reference" },
    ],
  },
  {
    id: "grant-federal", title: "Federal Grant Application (General)", category: "grant",
    icon: "🏦", subtitle: "Federal — Grants.gov / SF-424 Framework",
    billingFramework: "Federal Uniform Guidance (2 CFR Part 200) — SF-424 Series",
    description: "General federal grant application following SF-424 / SF-424A / SF-424B requirements under 2 CFR Part 200 Uniform Guidance.",
    sections: ["SF-424 Cover Page", "Project Abstract", "Project Narrative", "Budget (SF-424A)", "Budget Justification", "Indirect Cost Rate", "Certifications"],
    fields: [
      { id: "org", label: "Applicant Organisation (SAM.gov registered)", placeholder: "Legal name + DUNS/UEI", required: true },
      { id: "cfda", label: "CFDA / Assistance Listing Number", placeholder: "e.g. 84.048A", required: true },
      { id: "projectTitle", label: "Project Title", placeholder: "As it will appear on award", required: true },
      { id: "abstract", label: "Project Abstract (< 400 words)", placeholder: "Plain-language summary…", multiline: true, required: true },
      { id: "narrative", label: "Project Narrative", placeholder: "Goals, activities, evaluation plan, timeline…", multiline: true, required: true },
      { id: "budget", label: "Budget Request (SF-424A Lines a–o)", placeholder: "Personnel, Fringe, Travel, Equipment, Supplies, Contractual, Construction, Other, Direct Costs, Indirect Costs…", multiline: true, required: true },
      { id: "indirectRate", label: "Indirect Cost Rate Agreement", placeholder: "Rate, base, agreement date, cognizant agency" },
      { id: "personnel", label: "Key Personnel", placeholder: "Name, role, % time, credentials" },
    ],
  },

  // ── Budget Requests ────────────────────────────────────────────────────────
  {
    id: "budget-annual", title: "Annual Budget Request", category: "budget",
    icon: "📊", subtitle: "Fiscal Year Budget Proposal",
    description: "Comprehensive annual budget request for a department, project, or initiative.",
    sections: ["Executive Summary", "Prior Year Actuals", "Current Year Forecast", "Budget Request by Category", "Strategic Rationale", "Risk & Contingency"],
    fields: [
      { id: "dept", label: "Department / Function", placeholder: "e.g. Marketing, Engineering", required: true },
      { id: "fy", label: "Fiscal Year", placeholder: "e.g. FY2027", required: true },
      { id: "priorActuals", label: "Prior Year Actuals Summary", placeholder: "Total spend, key variances vs. budget…", multiline: true },
      { id: "requestTotal", label: "Total Amount Requested", placeholder: "e.g. $1,200,000", required: true },
      { id: "breakdown", label: "Budget Breakdown by Category", placeholder: "Personnel: $600K\nTechnology: $250K\nMarketing: $200K\nOperations: $150K…", multiline: true, required: true },
      { id: "rationale", label: "Strategic Rationale", placeholder: "How this budget supports company goals and OKRs…", multiline: true, required: true },
      { id: "contingency", label: "Contingency / Reserve", placeholder: "Amount and criteria for release" },
    ],
  },
  {
    id: "budget-capex", title: "Capital Expenditure Request", category: "budget",
    icon: "🏗️", subtitle: "CapEx Approval",
    description: "Capital expenditure approval request for equipment, infrastructure, or significant one-time investments.",
    sections: ["Asset Description", "Business Justification", "Cost-Benefit Analysis", "Financing Options", "Implementation Plan", "Approval Matrix"],
    fields: [
      { id: "asset", label: "Asset / Investment Description", placeholder: "What is being purchased or built", required: true },
      { id: "amount", label: "Total Estimated Cost", placeholder: "e.g. $380,000", required: true },
      { id: "justification", label: "Business Justification", placeholder: "Why this is needed and what problem it solves…", multiline: true, required: true },
      { id: "roi", label: "ROI / Cost-Benefit Analysis", placeholder: "Payback period, NPV, cost savings or revenue…", multiline: true },
      { id: "alternatives", label: "Alternatives Considered", placeholder: "Other options evaluated and why this was chosen…", multiline: true },
      { id: "timeline", label: "Implementation Timeline", placeholder: "Key dates from PO to operational use" },
      { id: "approver", label: "Approval Authority Required", placeholder: "e.g. CFO + Board approval (>$250K)" },
    ],
  },
  {
    id: "budget-dept", title: "Department Budget Proposal", category: "budget",
    icon: "📋", subtitle: "Dept. Budget Request",
    description: "Mid-year or supplemental department budget proposal including headcount and project requests.",
    sections: ["Department Overview", "Headcount Plan", "Project Spend", "Operational Costs", "Justification", "Requested Approval"],
    fields: [
      { id: "dept", label: "Department", placeholder: "e.g. Product Engineering", required: true },
      { id: "submitter", label: "Submitted By (Name + Title)", placeholder: "Department head or VP", required: true },
      { id: "period", label: "Budget Period", placeholder: "e.g. Q3–Q4 2026" },
      { id: "headcount", label: "Headcount Plan (Additions / Changes)", placeholder: "Role, FTE/PT, start date, cost…", multiline: true },
      { id: "projects", label: "Key Project Spend", placeholder: "Project name, amount, strategic link…", multiline: true },
      { id: "opex", label: "Operational / Recurring Costs", placeholder: "Software, subscriptions, contractors…", multiline: true },
      { id: "total", label: "Total Request", placeholder: "e.g. $340,000 additional to current allocation", required: true },
      { id: "rationale", label: "Strategic Rationale", placeholder: "How this supports Q-plan / OKRs…", multiline: true, required: true },
    ],
  },
];

export const DOC_CATEGORY_META: Record<DocCategory, { label: string; icon: string; color: string; description: string }> = {
  rfp:      { label: "RFPs & Proposals",           icon: "📋", color: "hsl(222 88% 65%)",  description: "Request for proposal templates for vendor procurement" },
  contract: { label: "Contracts & Agreements",     icon: "📝", color: "hsl(174 68% 44%)",  description: "MSAs, SOWs, and vendor agreements" },
  grant:    { label: "Grant Applications",          icon: "🏛️", color: "hsl(258 68% 64%)",  description: "DOE, municipal, and federal grant frameworks" },
  budget:   { label: "Budget Requests",             icon: "📊", color: "hsl(38 92% 52%)",   description: "Annual, CapEx, and departmental budget proposals" },
};
