import { useState } from "react";
import {
  BookOpen, FileText, Lightbulb, Upload, Download,
  Search, Filter, ChevronRight, CheckCircle, Star,
  Building2, Target, Users, DollarSign, Shield, Cpu, BarChart3,
  Rocket, BookMarked, Plus, Lock, Save, X, Edit3, FolderOpen,
  ThumbsUp, AlertTriangle, Sparkles, Layers, Database,
  FlaskConical, TrendingUp, Hash, Activity, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────
type TemplateCategory = "RACI" | "SOP" | "Charter" | "OKR" | "Review" | "MOCHA" | "Risk";
type Dept = "All" | "Executive" | "Finance" | "HR" | "Product" | "Operations" | "Sales" | "IT" | "Legal" | "Strategy";
type HubTab = "templates" | "documents" | "sops" | "lessons" | "frameworks" | "formulas";

interface Template {
  id: string;
  title: string;
  category: TemplateCategory;
  dept: Dept[];
  description: string;
  pages: number;
  framework: string;
  tier: "free" | "t1" | "t2";
  starred?: boolean;
  fields: { id: string; label: string; placeholder: string; multiline?: boolean }[];
  diagnosticTag?: string; // recommended after a diagnostic
}

interface SavedDocument {
  id: string;
  templateId: string;
  templateTitle: string;
  savedAt: string;
  data: Record<string, string>;
}

const TEMPLATES: Template[] = [
  {
    id: "t1", title: "RACI Matrix — Initiative Ownership", category: "RACI",
    dept: ["All"], description: "Define Responsible, Accountable, Consulted, and Informed roles across all initiative stakeholders.",
    pages: 2, framework: "PMO Standard", tier: "free", diagnosticTag: "governance",
    fields: [
      { id: "initiative", label: "Initiative Name", placeholder: "e.g. Customer Portal v2" },
      { id: "responsible", label: "Responsible (does the work)", placeholder: "Name / Role" },
      { id: "accountable", label: "Accountable (owns the outcome)", placeholder: "Name / Role" },
      { id: "consulted", label: "Consulted (provides input)", placeholder: "Names / Roles" },
      { id: "informed", label: "Informed (kept up to date)", placeholder: "Names / Roles" },
      { id: "notes", label: "Notes / Context", placeholder: "Any key decisions or constraints…", multiline: true },
    ],
  },
  {
    id: "t2", title: "MOCHA Assignment Sheet", category: "MOCHA",
    dept: ["All"], description: "Assign Manager, Owner, Consulted, Helper, and Approver for any project or decision.",
    pages: 1, framework: "MOCHA", tier: "free",
    fields: [
      { id: "project", label: "Project / Decision", placeholder: "e.g. Q3 Hiring Plan" },
      { id: "manager", label: "Manager (sets direction)", placeholder: "Name" },
      { id: "owner", label: "Owner (day-to-day delivery)", placeholder: "Name" },
      { id: "consulted", label: "Consulted", placeholder: "Names" },
      { id: "helper", label: "Helper", placeholder: "Names" },
      { id: "approver", label: "Approver (final sign-off)", placeholder: "Name" },
      { id: "deadline", label: "Target Completion", placeholder: "MM-DD-YYYY" },
    ],
  },
  {
    id: "t3", title: "Project Charter Template", category: "Charter",
    dept: ["All"], description: "Formal project kick-off document covering scope, objectives, budget, and stakeholders.",
    pages: 4, framework: "PMO Standard", tier: "free",
    fields: [
      { id: "name", label: "Project Name", placeholder: "Project name" },
      { id: "sponsor", label: "Executive Sponsor", placeholder: "Name / Title" },
      { id: "objective", label: "Objective", placeholder: "What problem does this solve?", multiline: true },
      { id: "scope", label: "In Scope", placeholder: "What is included?", multiline: true },
      { id: "out_of_scope", label: "Out of Scope", placeholder: "What is excluded?" },
      { id: "budget", label: "Budget", placeholder: "e.g. $50,000" },
      { id: "timeline", label: "Timeline", placeholder: "Start → End dates" },
      { id: "risks", label: "Key Risks", placeholder: "Top 3 risks", multiline: true },
    ],
  },
  {
    id: "t4", title: "Quarterly OKR Planning Sheet", category: "OKR",
    dept: ["All"], description: "Set Objectives and Key Results with owner assignments and scoring rubrics.",
    pages: 3, framework: "OKR", tier: "free", diagnosticTag: "strategy",
    fields: [
      { id: "quarter", label: "Quarter", placeholder: "e.g. Q3 2025" },
      { id: "objective1", label: "Objective 1", placeholder: "Aspirational goal…" },
      { id: "kr1_1", label: "Key Result 1.1", placeholder: "Measurable outcome…" },
      { id: "kr1_2", label: "Key Result 1.2", placeholder: "Measurable outcome…" },
      { id: "objective2", label: "Objective 2", placeholder: "Aspirational goal…" },
      { id: "kr2_1", label: "Key Result 2.1", placeholder: "Measurable outcome…" },
      { id: "owner", label: "Owner", placeholder: "Team / Name" },
    ],
  },
  {
    id: "t5", title: "Financial Close SOP", category: "SOP",
    dept: ["Finance"], description: "Step-by-step close process: journal entries, reconciliations, variance reporting, and sign-offs.",
    pages: 6, framework: "Lean", tier: "t1",
    fields: [
      { id: "period", label: "Closing Period", placeholder: "e.g. June 2025" },
      { id: "owner", label: "Close Owner", placeholder: "Name" },
      { id: "ap_close", label: "AP Close Date", placeholder: "MM-DD" },
      { id: "ar_close", label: "AR Close Date", placeholder: "MM-DD" },
      { id: "variance_threshold", label: "Variance Alert Threshold", placeholder: "e.g. >5% or >$10K" },
      { id: "sign_off", label: "Sign-off Authority", placeholder: "CFO / Controller" },
      { id: "notes", label: "Notes", placeholder: "Any exceptions or one-time items…", multiline: true },
    ],
  },
  {
    id: "t6", title: "Risk Register & Escalation Matrix", category: "Risk",
    dept: ["All"], description: "Structured risk log with probability/impact scoring, owners, and escalation thresholds.",
    pages: 3, framework: "Six Sigma", tier: "free", diagnosticTag: "risk",
    fields: [
      { id: "risk_title", label: "Risk Title", placeholder: "e.g. Key person dependency — CTO" },
      { id: "probability", label: "Probability (1–5)", placeholder: "1 = low, 5 = high" },
      { id: "impact", label: "Impact (1–5)", placeholder: "1 = low, 5 = critical" },
      { id: "owner", label: "Risk Owner", placeholder: "Name / Role" },
      { id: "mitigation", label: "Mitigation Plan", placeholder: "Steps to reduce likelihood or impact…", multiline: true },
      { id: "escalation", label: "Escalation Threshold", placeholder: "When to escalate and to whom" },
    ],
  },
  {
    id: "t7", title: "New Employee Onboarding SOP", category: "SOP",
    dept: ["HR"], description: "Full onboarding checklist from offer acceptance through 90-day milestone review.",
    pages: 5, framework: "PMO Standard", tier: "t1",
    fields: [
      { id: "employee", label: "Employee Name", placeholder: "Full name" },
      { id: "role", label: "Role / Title", placeholder: "e.g. Senior Product Manager" },
      { id: "start_date", label: "Start Date", placeholder: "MM-DD-YYYY" },
      { id: "manager", label: "Hiring Manager", placeholder: "Name" },
      { id: "it_access", label: "Systems / Access Needed", placeholder: "List tools and permissions…", multiline: true },
      { id: "day30_goals", label: "30-Day Goals", placeholder: "Key objectives for the first 30 days…", multiline: true },
    ],
  },
  {
    id: "t8", title: "Weekly Executive Dashboard Template", category: "Review",
    dept: ["Executive"], description: "Pre-formatted weekly status report for executives: KPIs, risks, decisions needed.",
    pages: 2, framework: "BSC", tier: "t1",
    fields: [
      { id: "week", label: "Week of", placeholder: "e.g. March 3–7, 2025" },
      { id: "kpis", label: "Top KPI Updates", placeholder: "Revenue, headcount, delivery…", multiline: true },
      { id: "wins", label: "Key Wins", placeholder: "What went well this week?" },
      { id: "risks", label: "Active Risks / Issues", placeholder: "What needs attention?", multiline: true },
      { id: "decisions", label: "Decisions Needed", placeholder: "What requires exec sign-off?" },
    ],
  },
  {
    id: "t9", title: "Strategic Initiative Prioritization Matrix", category: "OKR",
    dept: ["Strategy", "Executive"], description: "Rank initiatives by impact, effort, risk, and strategic alignment.",
    pages: 2, framework: "Rumelt", tier: "free", diagnosticTag: "strategy",
    fields: [
      { id: "initiative", label: "Initiative", placeholder: "Initiative name" },
      { id: "impact", label: "Impact Score (1–10)", placeholder: "Strategic value" },
      { id: "effort", label: "Effort Score (1–10)", placeholder: "Resource / complexity" },
      { id: "risk", label: "Risk Score (1–10)", placeholder: "Delivery risk" },
      { id: "alignment", label: "Strategic Alignment", placeholder: "Which goal does this serve?" },
      { id: "recommendation", label: "Recommendation", placeholder: "Proceed / Defer / Kill" },
    ],
  },
  {
    id: "t10", title: "IT Change Management SOP", category: "SOP",
    dept: ["IT"], description: "Change request, impact assessment, approval gate, rollout, and rollback procedures.",
    pages: 5, framework: "ITIL", tier: "t2",
    fields: [
      { id: "change", label: "Change Description", placeholder: "What is being changed?" },
      { id: "requestor", label: "Requestor", placeholder: "Name / Dept" },
      { id: "impact", label: "Impact Assessment", placeholder: "Systems, users, dependencies affected…", multiline: true },
      { id: "rollout", label: "Rollout Plan", placeholder: "Steps and timeline…", multiline: true },
      { id: "rollback", label: "Rollback Plan", placeholder: "How to revert if needed…" },
      { id: "approver", label: "Change Approver", placeholder: "CTO / IT Director" },
    ],
  },
];

const LESSONS = [
  { id: "l1", title: "Initiative Scope Creep Prevention", dept: "All", outcome: "positive", impact: "High", date: "2025-02", summary: "Adding explicit scope-freeze gates to the intake workflow reduced mid-initiative scope changes by 60%.", tags: ["PMO", "Scope", "Governance"] },
  { id: "l2", title: "Sales & Marketing OKR Misalignment", dept: "Sales", outcome: "negative", impact: "High", date: "2025-01", summary: "Siloed Q1 planning led to misaligned pipeline targets. Fix: joint OKR ownership between CMO and VP Sales.", tags: ["OKRs", "Alignment", "Sales"] },
  { id: "l3", title: "Financial Close 3-Day Reduction", dept: "Finance", outcome: "positive", impact: "Medium", date: "2024-12", summary: "Tiered approval authority ($50K / $200K / Board) removed 4 unnecessary handoff points, cutting close time by 3 days.", tags: ["Process", "Finance", "Lean"] },
  { id: "l4", title: "IT Provisioning Backlog Cleared", dept: "IT", outcome: "positive", impact: "Medium", date: "2024-11", summary: "Shifting to 60% planned / 40% reactive maintenance model resolved a 23-ticket backlog within 2 weeks.", tags: ["Capacity", "IT", "Lean"] },
  { id: "l5", title: "Talent Pipeline Failure (Q2)", dept: "HR", outcome: "negative", impact: "High", date: "2024-10", summary: "Over-reliance on a single job board channel left 4 critical roles unfilled for 67+ days. Fix: multi-channel sourcing strategy.", tags: ["Talent", "HR", "Risk"] },
];

const SOPS = [
  {
    id: "s1", title: "Quarterly Business Review Process", dept: "Executive", framework: "BSC", version: "v2.1", lastUpdated: "2025-01-15", status: "active", pages: 8,
    steps: [
      { n: 1, title: "Data Gathering (T-10 days)", detail: "Finance pulls P&L, actuals vs budget. Dept heads submit KPI scorecards and initiative status updates." },
      { n: 2, title: "Scorecard Compilation (T-7 days)", detail: "PMO consolidates Balanced Scorecard across 4 perspectives: Financial, Customer, Internal Process, Learning & Growth." },
      { n: 3, title: "Pre-read Distribution (T-3 days)", detail: "QBR deck distributed to all attendees. Red items (below 60%) flagged for discussion. Owners notified." },
      { n: 4, title: "QBR Session (T-0)", detail: "90-minute structured session: 15 min financial review, 30 min KPI deep-dive, 30 min initiative health, 15 min priorities for next quarter." },
      { n: 5, title: "Action Register Update (T+1 day)", detail: "All decisions and action items logged with owner, due date, and priority. Distributed within 24 hours." },
      { n: 6, title: "Follow-up Tracking (T+30 days)", detail: "Mid-quarter check-in on action items. Escalation path for items at risk of missing deadline." },
    ],
  },
  {
    id: "s2", title: "Procurement & Vendor Approval", dept: "Operations", framework: "Lean", version: "v1.4", lastUpdated: "2024-12-03", status: "active", pages: 5,
    steps: [
      { n: 1, title: "Request Submission", detail: "Requestor submits Purchase Request (PR) with business justification, budget code, and at least 2 vendor quotes for purchases >$5,000." },
      { n: 2, title: "Budget Verification", detail: "Finance confirms available budget. If unbudgeted, requires CFO approval before advancing." },
      { n: 3, title: "Tiered Approval Gate", detail: "<$10K: Department Head. $10K–$50K: Finance + Dept Head. $50K–$200K: CFO. >$200K: Board ratification required." },
      { n: 4, title: "Vendor Due Diligence", detail: "Legal reviews contracts >$25K. IT security review for any software/SaaS vendors. Insurance verification for services vendors." },
      { n: 5, title: "PO Issuance & Onboarding", detail: "Approved PR converted to PO. Vendor added to approved vendor register. Payment terms confirmed (Net 30 standard)." },
    ],
  },
  {
    id: "s3", title: "Incident Response Playbook", dept: "IT", framework: "ITIL", version: "v3.0", lastUpdated: "2025-02-20", status: "active", pages: 12,
    steps: [
      { n: 1, title: "Detection & Logging (P1: <5 min)", detail: "Incident detected via monitoring alert or user report. Logged in ITSM with severity: P1 (Critical), P2 (Major), P3 (Minor), P4 (Low)." },
      { n: 2, title: "Initial Triage", detail: "On-call engineer assesses scope and impact. P1/P2: escalate to Incident Commander immediately. Bridge call opened within 10 minutes." },
      { n: 3, title: "Containment", detail: "Immediate actions to limit blast radius: isolate affected systems, roll back recent deploys, activate DR if needed." },
      { n: 4, title: "Root Cause Analysis", detail: "5 Whys or Fishbone analysis. Document contributing factors. Timeline reconstructed from logs." },
      { n: 5, title: "Resolution & Recovery", detail: "Fix deployed. Systems verified healthy. Users notified of resolution with summary. P1 SLA: resolve <4 hours." },
      { n: 6, title: "Post-Incident Review (PIR)", detail: "Blameless PIR within 48 hours for P1/P2. Document: what happened, impact, root cause, preventive actions, owner, due date." },
    ],
  },
  {
    id: "s4", title: "Performance Review Cycle", dept: "HR", framework: "PMO Standard", version: "v1.2", lastUpdated: "2024-11-08", status: "needs-review", pages: 6,
    steps: [
      { n: 1, title: "Goal Setting (Start of Period)", detail: "Employee and manager co-create 3–5 SMART goals aligned to department OKRs. Goals signed off and logged in HRIS." },
      { n: 2, title: "Mid-Year Check-in (Month 6)", detail: "30-minute 1:1 to review progress. Goals adjusted if org priorities shifted. Informal feedback documented." },
      { n: 3, title: "Self-Assessment", detail: "Employee completes self-assessment against goals (1–5 scale) with supporting evidence. Due T-14 days before review." },
      { n: 4, title: "Manager Assessment", detail: "Manager scores performance independently before reading self-assessment. Calibration session with peer managers for consistency." },
      { n: 5, title: "Review Conversation", detail: "Structured 60-minute conversation: results vs goals, strengths, development areas, career aspirations. No surprises policy enforced." },
      { n: 6, title: "Outcome & Compensation", detail: "Final rating (1–5) drives compensation adjustment, promotion consideration, and PIP initiation if required. Communicated within 2 weeks." },
    ],
  },
  {
    id: "s5", title: "Customer Escalation Playbook", dept: "Sales", framework: "MEDDIC", version: "v2.0", lastUpdated: "2025-01-22", status: "active", pages: 4,
    steps: [
      { n: 1, title: "Escalation Trigger", detail: "Customer flags critical issue via email/call. CSM acknowledges within 1 hour. Severity assessed (Account risk vs Product defect vs Process failure)." },
      { n: 2, title: "Internal Notification", detail: "CSM notifies Account Exec and VP of Success. If ARR >$100K, CRO notified. Slack #escalations channel updated." },
      { n: 3, title: "24-Hour Response Plan", detail: "Executive sponsor assigned. Customer call scheduled within 24 hours. Initial remediation options prepared." },
      { n: 4, title: "Resolution Sprint", detail: "Cross-functional team (CS, Product, Engineering if needed) owns resolution. Daily updates to customer until resolved." },
      { n: 5, title: "Root Cause & Prevention", detail: "Post-resolution: document root cause, customer impact, fix applied, and process change to prevent recurrence. Update health score in CRM." },
    ],
  },
];

// ── Formula Data ────────────────────────────────────────────────────────
interface FormulaCard {
  id: string;
  category: string;
  name: string;
  notation: string;
  description: string;
  variables?: { symbol: string; meaning: string }[];
  example?: string;
  result?: string;
}

const FORMULA_CATEGORIES = [
  {
    id: "health",
    label: "Org Health Scoring",
    icon: Activity,
    color: "hsl(var(--electric-blue))",
    formulas: [
      {
        id: "f-health", name: "Org Health Score", notation: "H = Σ(wᵢ × sᵢ)",
        description: "Weighted sum of six maturity dimensions, each scored 0–100. Produces the overall health score shown on the Dashboard.",
        variables: [
          { symbol: "wᵢ", meaning: "Dimension weight (see below)" },
          { symbol: "sᵢ", meaning: "Dimension score (0–100)" },
          { symbol: "H", meaning: "Overall health score (0–100)" },
        ],
        example: "Strategic Alignment (20%) = 72, Execution Discipline (20%) = 68, Risk Management (15%) = 80, Financial Health (15%) = 61, Team Capacity (15%) = 75, Governance (15%) = 70",
        result: "H = 0.20×72 + 0.20×68 + 0.15×80 + 0.15×61 + 0.15×75 + 0.15×70 = 71.15",
      } as FormulaCard,
      {
        id: "f-maturity", name: "Maturity Level Classification", notation: "Level = floor(H / 20) + 1",
        description: "Maps the continuous health score (0–100) to one of five CMMI-aligned maturity levels.",
        variables: [
          { symbol: "H", meaning: "Org Health Score" },
          { symbol: "Level 1", meaning: "Foundational (0–20)" },
          { symbol: "Level 2", meaning: "Developing (21–40)" },
          { symbol: "Level 3", meaning: "Defined (41–60)" },
          { symbol: "Level 4", meaning: "Managed (61–80)" },
          { symbol: "Level 5", meaning: "Optimized (81–100)" },
        ],
        example: "H = 71.15",
        result: "Level 4 — Managed",
      } as FormulaCard,
    ],
  },
  {
    id: "evm",
    label: "Earned Value Management (EVM)",
    icon: TrendingUp,
    color: "hsl(var(--teal))",
    formulas: [
      {
        id: "f-ev", name: "Earned Value", notation: "EV = BAC × % Complete",
        description: "The budgeted value of work actually completed to date.",
        variables: [
          { symbol: "BAC", meaning: "Budget at Completion" },
          { symbol: "% Complete", meaning: "Percentage of work done (0–1)" },
        ],
        example: "BAC = $500K, % Complete = 40%",
        result: "EV = $500K × 0.40 = $200K",
      } as FormulaCard,
      {
        id: "f-sv", name: "Schedule Variance", notation: "SV = EV − PV",
        description: "Positive SV = ahead of schedule. Negative SV = behind schedule.",
        variables: [
          { symbol: "EV", meaning: "Earned Value" },
          { symbol: "PV", meaning: "Planned Value (budgeted work scheduled by now)" },
        ],
        example: "EV = $200K, PV = $220K",
        result: "SV = −$20K (behind schedule)",
      } as FormulaCard,
      {
        id: "f-cv", name: "Cost Variance", notation: "CV = EV − AC",
        description: "Positive CV = under budget. Negative CV = over budget.",
        variables: [
          { symbol: "EV", meaning: "Earned Value" },
          { symbol: "AC", meaning: "Actual Cost (money spent to date)" },
        ],
        example: "EV = $200K, AC = $215K",
        result: "CV = −$15K (over budget)",
      } as FormulaCard,
      {
        id: "f-spi", name: "Schedule Performance Index", notation: "SPI = EV / PV",
        description: "SPI > 1 = efficient. SPI < 1 = inefficient. Measures schedule efficiency.",
        variables: [],
        example: "EV = $200K, PV = $220K",
        result: "SPI = 0.91 — delivering 91 cents of scheduled value per dollar planned",
      } as FormulaCard,
      {
        id: "f-cpi", name: "Cost Performance Index", notation: "CPI = EV / AC",
        description: "CPI > 1 = under budget. CPI < 1 = over budget. Key predictor of final cost.",
        variables: [],
        example: "EV = $200K, AC = $215K",
        result: "CPI = 0.93 — spending $1.07 for every $1 of value delivered",
      } as FormulaCard,
      {
        id: "f-eac", name: "Estimate at Completion", notation: "EAC = BAC / CPI",
        description: "Projected total cost assuming current cost performance continues to the end.",
        variables: [
          { symbol: "BAC", meaning: "Budget at Completion" },
          { symbol: "CPI", meaning: "Cost Performance Index" },
        ],
        example: "BAC = $500K, CPI = 0.93",
        result: "EAC = $537.6K (projected overrun of $37.6K)",
      } as FormulaCard,
    ],
  },
  {
    id: "finance",
    label: "Financial & Investment Formulas",
    icon: DollarSign,
    color: "hsl(var(--signal-green))",
    formulas: [
      {
        id: "f-roi", name: "Return on Investment", notation: "ROI = (Benefit − Cost) / Cost × 100",
        description: "Percentage return relative to the investment. Used to rank initiatives by financial return.",
        variables: [
          { symbol: "Benefit", meaning: "Total projected financial benefit" },
          { symbol: "Cost", meaning: "Total cost of the initiative" },
        ],
        example: "Benefit = $300K, Cost = $120K",
        result: "ROI = (300K − 120K) / 120K × 100 = 150%",
      } as FormulaCard,
      {
        id: "f-npv", name: "Net Present Value", notation: "NPV = Σ(CFₜ / (1+r)ᵗ) − I₀",
        description: "Present value of all future cash flows minus the initial investment. NPV > 0 means the initiative creates value.",
        variables: [
          { symbol: "CFₜ", meaning: "Cash flow in period t" },
          { symbol: "r", meaning: "Discount rate (hurdle rate)" },
          { symbol: "I₀", meaning: "Initial investment" },
        ],
        example: "CF₁=$80K, CF₂=$90K, CF₃=$100K, r=10%, I₀=$200K",
        result: "NPV = 72.7K + 74.4K + 75.1K − 200K = $22.2K (positive — proceed)",
      } as FormulaCard,
      {
        id: "f-payback", name: "Payback Period", notation: "Payback = I₀ / Annual CF",
        description: "Time to recover the initial investment. Shorter payback = lower risk.",
        variables: [
          { symbol: "I₀", meaning: "Initial investment" },
          { symbol: "Annual CF", meaning: "Average annual cash flow" },
        ],
        example: "I₀ = $200K, Annual CF = $90K",
        result: "Payback = 2.22 years",
      } as FormulaCard,
      {
        id: "f-dcf", name: "Discounted Cash Flow", notation: "PV = CFₜ / (1 + r)ᵗ",
        description: "Present value of a single future cash flow. Used to compare initiatives across different time horizons.",
        variables: [
          { symbol: "CFₜ", meaning: "Future cash flow at time t" },
          { symbol: "r", meaning: "Annual discount rate" },
          { symbol: "t", meaning: "Number of periods (years)" },
        ],
        example: "$120K in year 3 at 10% discount rate",
        result: "PV = 120K / (1.10)³ = $90.2K today",
      } as FormulaCard,
    ],
  },
  {
    id: "risk",
    label: "Risk & Priority Scoring",
    icon: Shield,
    color: "hsl(var(--signal-red))",
    formulas: [
      {
        id: "f-risk", name: "Risk Rating", notation: "R = P × I",
        description: "Probability (1–5) × Impact (1–5) produces a risk score 1–25. Used to populate the risk register and colour-code items.",
        variables: [
          { symbol: "P", meaning: "Probability score: 1=Rare, 2=Unlikely, 3=Possible, 4=Likely, 5=Almost Certain" },
          { symbol: "I", meaning: "Impact score: 1=Negligible, 2=Minor, 3=Moderate, 4=Major, 5=Catastrophic" },
          { symbol: "1–4", meaning: "Low Risk" },
          { symbol: "5–12", meaning: "Medium Risk" },
          { symbol: "13–25", meaning: "High Risk" },
        ],
        example: "P = 3 (Possible), I = 4 (Major)",
        result: "R = 12 — Medium Risk (review required)",
      } as FormulaCard,
      {
        id: "f-priority", name: "Initiative Priority Score", notation: "P = 0.4·V + 0.3·U + 0.3·(1−E)",
        description: "Composite score (0–100) used to rank initiatives in the queue. Higher score = higher priority.",
        variables: [
          { symbol: "V", meaning: "Strategic Value (0–100): alignment to org objectives" },
          { symbol: "U", meaning: "Urgency (0–100): deadline proximity and stakeholder pressure" },
          { symbol: "E", meaning: "Effort (0–100): estimated resources and time required" },
          { symbol: "(1−E)", meaning: "Inverted effort — low effort boosts priority" },
        ],
        example: "V = 85, U = 70, E = 40",
        result: "P = 0.4×85 + 0.3×70 + 0.3×60 = 34 + 21 + 18 = 73",
      } as FormulaCard,
    ],
  },
  {
    id: "spc",
    label: "Statistical Process Control (SPC)",
    icon: BarChart3,
    color: "hsl(var(--signal-purple))",
    formulas: [
      {
        id: "f-ucl", name: "Upper Control Limit", notation: "UCL = X̄ + 3σ",
        description: "Any data point above the UCL is a signal of special-cause variation — investigate immediately.",
        variables: [
          { symbol: "X̄", meaning: "Process mean (average)" },
          { symbol: "σ", meaning: "Standard deviation of the process" },
        ],
        example: "X̄ = 48 units/day, σ = 4",
        result: "UCL = 48 + 12 = 60 units/day",
      } as FormulaCard,
      {
        id: "f-lcl", name: "Lower Control Limit", notation: "LCL = X̄ − 3σ",
        description: "Data points below the LCL may indicate a process improvement or data integrity issue.",
        variables: [],
        example: "X̄ = 48, σ = 4",
        result: "LCL = 48 − 12 = 36 units/day",
      } as FormulaCard,
      {
        id: "f-cpk", name: "Process Capability Index (Cpk)", notation: "Cpk = min((USL−X̄)/3σ, (X̄−LSL)/3σ)",
        description: "Measures how well the process fits within specification limits. Cpk ≥ 1.33 is generally acceptable.",
        variables: [
          { symbol: "USL", meaning: "Upper Specification Limit (from customer or standard)" },
          { symbol: "LSL", meaning: "Lower Specification Limit" },
          { symbol: "X̄", meaning: "Process mean" },
          { symbol: "σ", meaning: "Standard deviation" },
        ],
        example: "USL=60, LSL=36, X̄=48, σ=4",
        result: "Cpk = min((60−48)/12, (48−36)/12) = min(1.0, 1.0) = 1.0 (marginal — improve process)",
      } as FormulaCard,
    ],
  },
  {
    id: "marketing",
    label: "Marketing Algorithm",
    icon: Hash,
    color: "hsl(var(--amber))",
    formulas: [
      {
        id: "f-mkt", name: "Marketing Mega-Algorithm Score", notation: "Score = Σ(wᵢ × fᵢ) / 100",
        description: "Weighted composite of 7 marketing performance factors producing a 0–100 campaign effectiveness score.",
        variables: [
          { symbol: "Reach (15%)", meaning: "Audience size and expansion rate" },
          { symbol: "Engagement (20%)", meaning: "Clicks, shares, comments, watch time" },
          { symbol: "Conversion (25%)", meaning: "Lead-to-customer rate" },
          { symbol: "Retention (15%)", meaning: "Customer return and repeat-purchase rate" },
          { symbol: "ROI (10%)", meaning: "Revenue generated vs marketing spend" },
          { symbol: "Brand (10%)", meaning: "Sentiment score and share of voice" },
          { symbol: "Pipeline (5%)", meaning: "Marketing-attributed pipeline value" },
        ],
        example: "Reach=80, Engagement=72, Conversion=65, Retention=78, ROI=85, Brand=70, Pipeline=60",
        result: "Score = 0.15×80 + 0.20×72 + 0.25×65 + 0.15×78 + 0.10×85 + 0.10×70 + 0.05×60 = 73.2",
      } as FormulaCard,
    ],
  },
];

interface PmoFramework {
  name: string;
  category: string;
  executionModule: string;
  outputsTo: string;
  statusRelevance: string;
  temporalContext: string;
  dependencies: string;
  notes: string;
}

const PMO_FRAMEWORKS: PmoFramework[] = [
  { name: "Balanced Scorecard", category: "Strategy & Org Alignment", executionModule: "Diagnostics, Reports", outputsTo: "Dashboard KPIs, Departments", statusRelevance: "Strategic Alignment", temporalContext: "Quarterly", dependencies: "OKR, KPI Tree", notes: "4 perspectives: Financial, Customer, Internal, Learning" },
  { name: "OKRs", category: "Strategy & Org Alignment", executionModule: "Initiatives, Departments", outputsTo: "Dashboard, Reports, Action Items", statusRelevance: "On Track / At Risk", temporalContext: "Quarterly", dependencies: "BSC, KPI Tree", notes: "Objectives + measurable Key Results" },
  { name: "PMBOK", category: "Initiative & Project Mgmt", executionModule: "Initiatives, Projects", outputsTo: "Action Items, Risk Register", statusRelevance: "All statuses", temporalContext: "Project lifecycle", dependencies: "RACI, MOCHA", notes: "PMI standard — 5 process groups" },
  { name: "PRINCE2", category: "Initiative & Project Mgmt", executionModule: "Initiatives", outputsTo: "Governance Log, Reports", statusRelevance: "On Track / Delayed", temporalContext: "Stages", dependencies: "RACI", notes: "Stage-gated governance framework" },
  { name: "RACI Matrix", category: "Initiative & Project Mgmt", executionModule: "Team, Departments", outputsTo: "Action Items, Governance", statusRelevance: "Accountability gaps", temporalContext: "Ongoing", dependencies: "MOCHA, Authority Matrix", notes: "Responsible / Accountable / Consulted / Informed" },
  { name: "MOCHA", category: "Initiative & Project Mgmt", executionModule: "Team", outputsTo: "Action Items", statusRelevance: "Ownership clarity", temporalContext: "Per initiative", dependencies: "RACI", notes: "Manager / Owner / Consulted / Helper / Approver" },
  { name: "Lean / Value Stream Mapping", category: "Operations & Process", executionModule: "Workflows, Diagnostics", outputsTo: "Departments, Action Items", statusRelevance: "Bottlenecks", temporalContext: "Continuous", dependencies: "ToC, Six Sigma", notes: "Identifies waste in value streams" },
  { name: "Six Sigma (DMAIC)", category: "Operations & Process", executionModule: "Diagnostics", outputsTo: "Action Items, Reports", statusRelevance: "Needs Attention", temporalContext: "Project-based", dependencies: "Lean, SPC", notes: "Define-Measure-Analyze-Improve-Control" },
  { name: "Theory of Constraints", category: "Operations & Process", executionModule: "Diagnostics", outputsTo: "Initiatives, Action Items", statusRelevance: "Blocked / At Risk", temporalContext: "Ongoing", dependencies: "Critical Chain", notes: "Identifies and exploits system bottlenecks" },
  { name: "KPI Tree", category: "Performance & Metrics", executionModule: "Dashboard, Reports", outputsTo: "Diagnostics, Departments", statusRelevance: "All statuses", temporalContext: "Monthly", dependencies: "BSC, OKR", notes: "Hierarchical KPI decomposition" },
  { name: "Control Charts (SPC)", category: "Performance & Metrics", executionModule: "Reports", outputsTo: "Diagnostics", statusRelevance: "Variance", temporalContext: "Real-time / Monthly", dependencies: "Six Sigma", notes: "Statistical process control — detect special vs common cause" },
  { name: "CMMI Maturity Model", category: "Performance & Metrics", executionModule: "Departments, Diagnostics", outputsTo: "Dashboard, Reports", statusRelevance: "Maturity tier", temporalContext: "Quarterly", dependencies: "PDCA", notes: "5-level capability maturity: Foundational → Optimized" },
  { name: "Risk Register (ISO 31000)", category: "Risk & Decision Science", executionModule: "Initiatives, Diagnostics", outputsTo: "Governance Log", statusRelevance: "Delayed / At Risk", temporalContext: "Ongoing", dependencies: "COSO ERM", notes: "Probability × Impact scoring" },
  { name: "COSO ERM", category: "Risk & Decision Science", executionModule: "Diagnostics, Admin", outputsTo: "Governance Log, Reports", statusRelevance: "All risk statuses", temporalContext: "Annual + ongoing", dependencies: "ISO 31000", notes: "Enterprise risk management framework" },
  { name: "Critical Chain (Goldratt)", category: "Risk & Decision Science", executionModule: "Initiatives", outputsTo: "Action Items, Diagnostics", statusRelevance: "Blocked", temporalContext: "Project lifecycle", dependencies: "PMBOK, ToC", notes: "Manages dependencies and buffers" },
  { name: "DCF / Financial Modeling", category: "Finance & Investment", executionModule: "Reports", outputsTo: "Dashboard", statusRelevance: "Budget performance", temporalContext: "Quarterly", dependencies: "BSC", notes: "Discounted Cash Flow for initiative valuation" },
  { name: "Porter's Five Forces", category: "Strategy & Org Alignment", executionModule: "Advisory", outputsTo: "Initiatives, Reports", statusRelevance: "Strategic context", temporalContext: "Annual", dependencies: "SWOT, BSC", notes: "Competitive positioning analysis" },
  { name: "Agile (Scrum/Kanban)", category: "Initiative & Project Mgmt", executionModule: "Agile (Work Mgmt)", outputsTo: "Action Items, Sprints", statusRelevance: "Sprint velocity", temporalContext: "Sprint (2 weeks)", dependencies: "PMBOK, Lean", notes: "Iterative delivery — backlog, sprints, retrospectives" },
  { name: "PDCA (Deming)", category: "Continuous Improvement", executionModule: "Diagnostics, Workflows", outputsTo: "Action Items", statusRelevance: "Improvement cycle", temporalContext: "Ongoing", dependencies: "Lean, Kaizen", notes: "Plan-Do-Check-Act cycle" },
  { name: "Kaizen", category: "Continuous Improvement", executionModule: "Workflows, Departments", outputsTo: "Action Items", statusRelevance: "Incremental gains", temporalContext: "Ongoing", dependencies: "Lean, PDCA", notes: "Continuous small improvement culture" },
  { name: "NPS / CSAT System", category: "Product/Customer/Marketing", executionModule: "Marketing, Reports", outputsTo: "Dashboard, Departments", statusRelevance: "Customer health", temporalContext: "Monthly", dependencies: "CX frameworks", notes: "Net Promoter Score + Customer Satisfaction" },
  { name: "MEDDIC", category: "Product/Customer/Marketing", executionModule: "CRM", outputsTo: "Pipeline, Reports", statusRelevance: "Deal velocity", temporalContext: "Per deal cycle", dependencies: "CRM, Forecasting", notes: "Enterprise sales qualification framework" },
  { name: "System Thinking (Senge)", category: "Systems Thinking", executionModule: "Diagnostics", outputsTo: "Diagnostics, Reports", statusRelevance: "Root cause", temporalContext: "Strategic cycles", dependencies: "Causal Loop Diagrams", notes: "Feedback loops, archetypes, leverage points" },
  { name: "ITIL v4", category: "IT & Governance", executionModule: "Admin, Workflows", outputsTo: "Governance Log", statusRelevance: "Compliance", temporalContext: "Continuous", dependencies: "COBIT", notes: "IT service management best practices" },
];

// ── Helpers ─────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  RACI: "hsl(var(--electric-blue))", SOP: "hsl(var(--teal))", Charter: "hsl(var(--signal-green))",
  OKR: "hsl(var(--signal-yellow))", Review: "hsl(var(--signal-purple))", MOCHA: "hsl(var(--electric-blue))", Risk: "hsl(var(--signal-red))",
};
const TIER_LABEL: Record<string, string> = { free: "Free", t1: "Tier 1", t2: "Tier 2" };
const TIER_COLOR: Record<string, string> = {
  free: "hsl(var(--muted-foreground))", t1: "hsl(var(--electric-blue))", t2: "hsl(var(--teal))",
};
const DEPT_ICONS: Record<string, React.ElementType> = {
  All: Building2, Executive: Star, Finance: DollarSign, HR: Users, Product: Rocket,
  Operations: Cpu, Sales: BarChart3, IT: Cpu, Legal: Shield, Strategy: Target,
};

function TierBadge({ tier }: { tier: "free" | "t1" | "t2" }) {
  const locked = tier !== "free";
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-semibold"
      style={{ color: TIER_COLOR[tier], background: `${TIER_COLOR[tier]}18`, border: `1px solid ${TIER_COLOR[tier]}35` }}>
      {locked && <Lock className="w-2.5 h-2.5" />}
      {TIER_LABEL[tier]}
    </span>
  );
}

// ── Template Fill Modal ──────────────────────────────────────────────
function TemplateFillModal({ template, onClose, onSave }: {
  template: Template;
  onClose: () => void;
  onSave: (doc: SavedDocument) => void;
}) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const doc: SavedDocument = {
      id: `doc-${Date.now()}`,
      templateId: template.id,
      templateTitle: template.title,
      savedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      data: formData,
    };
    onSave(doc);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  }

  const filled = Object.values(formData).filter(Boolean).length;
  const total = template.fields.length;
  const pct = Math.round((filled / total) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "hsl(var(--background) / 0.85)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-2xl rounded-2xl border-2 shadow-elevated overflow-hidden flex flex-col"
        style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card))", maxHeight: "90vh" }}>

        {/* Header */}
        <div className="px-6 py-4 border-b flex items-start justify-between"
          style={{ borderColor: "hsl(var(--border))" }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded"
                style={{ background: `${CATEGORY_COLORS[template.category]}18`, color: CATEGORY_COLORS[template.category] }}>
                {template.category}
              </span>
              <TierBadge tier={template.tier} />
            </div>
            <h2 className="text-base font-bold text-foreground">{template.title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 pt-3 pb-1">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
            <span>{filled} of {total} fields filled</span>
            <span className="font-mono font-bold" style={{ color: "hsl(var(--electric-blue))" }}>{pct}%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "hsl(var(--border))" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: "hsl(var(--electric-blue))" }} />
          </div>
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {template.fields.map(field => (
            <div key={field.id}>
              <label className="block text-xs font-semibold text-foreground mb-1.5">{field.label}</label>
              {field.multiline ? (
                <textarea
                  className="w-full rounded-lg border px-3 py-2 text-sm bg-background text-foreground resize-none focus:outline-none focus:ring-1 transition-all"
                  style={{ borderColor: formData[field.id] ? "hsl(var(--electric-blue) / 0.5)" : "hsl(var(--border))", minHeight: 72 }}
                  placeholder={field.placeholder}
                  value={formData[field.id] || ""}
                  onChange={e => setFormData(d => ({ ...d, [field.id]: e.target.value }))}
                />
              ) : (
                <input
                  className="w-full rounded-lg border px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-1 transition-all"
                  style={{ borderColor: formData[field.id] ? "hsl(var(--electric-blue) / 0.5)" : "hsl(var(--border))" }}
                  placeholder={field.placeholder}
                  value={formData[field.id] || ""}
                  onChange={e => setFormData(d => ({ ...d, [field.id]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between gap-3"
          style={{ borderColor: "hsl(var(--border))" }}>
          <button onClick={onClose}
            className="text-sm px-4 py-2 rounded-lg border font-medium text-muted-foreground hover:text-foreground transition-colors"
            style={{ borderColor: "hsl(var(--border))" }}>
            Cancel
          </button>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border font-semibold transition-all"
              style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            <button onClick={handleSave}
              className="flex items-center gap-2 text-sm px-5 py-2 rounded-lg font-semibold transition-all"
              style={{ background: saved ? "hsl(var(--signal-green))" : "hsl(var(--electric-blue))", color: "white" }}>
              {saved ? <><CheckCircle className="w-3.5 h-3.5" /> Saved!</> : <><Save className="w-3.5 h-3.5" /> Save to Documents</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────
export default function Knowledge() {
  const [tab, setTab] = useState<HubTab>("templates");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<Dept>("All");
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [savedDocuments, setSavedDocuments] = useState<SavedDocument[]>([]);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [expandedSop, setExpandedSop] = useState<string | null>(null);
  const [userLessons, setUserLessons] = useState<typeof LESSONS>([]);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [newLesson, setNewLesson] = useState({ title: "", dept: "All" as Dept, outcome: "positive" as "positive" | "negative", impact: "Medium" as "High" | "Medium", summary: "", tags: "" });
  const [expandedFormula, setExpandedFormula] = useState<string | null>(null);
  const [fwCategoryFilter, setFwCategoryFilter] = useState<string>("All");

  function downloadDocument(doc: SavedDocument) {
    const lines = [
      `Document: ${doc.templateTitle}`,
      `Saved: ${doc.savedAt}`,
      "",
      ...Object.entries(doc.data).filter(([, v]) => v).map(([k, v]) => `${k.replace(/_/g, " ").toUpperCase()}\n${v}\n`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.templateTitle.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleAddLesson() {
    if (!newLesson.title.trim() || !newLesson.summary.trim()) return;
    const lesson = {
      id: `ul-${Date.now()}`,
      title: newLesson.title,
      dept: newLesson.dept,
      outcome: newLesson.outcome,
      impact: newLesson.impact,
      date: new Date().toISOString().slice(0, 7),
      summary: newLesson.summary,
      tags: newLesson.tags.split(",").map(t => t.trim()).filter(Boolean),
    };
    setUserLessons(prev => [lesson, ...prev]);
    setNewLesson({ title: "", dept: "All", outcome: "positive", impact: "Medium", summary: "", tags: "" });
    setShowAddLesson(false);
  }

  const DEPTS: Dept[] = ["All", "Executive", "Finance", "HR", "Product", "Operations", "Sales", "IT", "Legal", "Strategy"];
  const TABS = [
    { key: "templates" as HubTab, label: "Templates", icon: FileText, count: TEMPLATES.length },
    { key: "documents" as HubTab, label: "Documents", icon: FolderOpen, count: savedDocuments.length },
    { key: "sops" as HubTab, label: "SOP Library", icon: BookMarked, count: SOPS.length },
    { key: "lessons" as HubTab, label: "Lessons Learned", icon: Lightbulb, count: userLessons.length + LESSONS.length },
    { key: "frameworks" as HubTab, label: "Frameworks", icon: Database, count: PMO_FRAMEWORKS.length },
    { key: "formulas" as HubTab, label: "Formulas", icon: FlaskConical, count: FORMULA_CATEGORIES.reduce((a, c) => a + c.formulas.length, 0) },
  ];

  const filteredTemplates = TEMPLATES.filter(t =>
    (deptFilter === "All" || t.dept.includes(deptFilter) || t.dept.includes("All")) &&
    (t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredSOPs = SOPS.filter(s =>
    (deptFilter === "All" || s.dept === deptFilter) &&
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  function handleSaveDocument(doc: SavedDocument) {
    setSavedDocuments(d => [doc, ...d]);
  }

  return (
    <div className="p-6 space-y-5 max-w-none">
      {activeTemplate && (
        <TemplateFillModal
          template={activeTemplate}
          onClose={() => setActiveTemplate(null)}
          onSave={(doc) => { handleSaveDocument(doc); setActiveTemplate(null); setTimeout(() => setTab("documents"), 400); }}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold text-foreground">Resource Hub</h1>
            <span className="text-[10px] px-2 py-0.5 rounded font-semibold"
              style={{ background: "hsl(var(--teal) / 0.12)", color: "hsl(var(--teal))", border: "1px solid hsl(var(--teal) / 0.3)" }}>
              LIVING
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Templates, SOPs, saved documents, and lessons — dynamically surfaced based on diagnostics and active challenges.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border-2 font-semibold transition-all hover:opacity-90"
            style={{ borderColor: "hsl(var(--electric-blue) / 0.3)", color: "hsl(var(--electric-blue))", background: "hsl(var(--electric-blue) / 0.07)" }}>
            <Upload className="w-3.5 h-3.5" /> Upload SOP
          </button>
        </div>
      </div>

      {/* Diagnostic Recommendations Banner */}
      <div className="rounded-xl border-2 p-4 flex items-start gap-3"
        style={{ borderColor: "hsl(var(--signal-yellow) / 0.4)", background: "hsl(var(--signal-yellow) / 0.05)" }}>
        <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "hsl(var(--signal-yellow))" }} />
        <div>
          <p className="text-xs font-bold text-foreground mb-0.5">Recommended from last diagnostic session</p>
          <p className="text-xs text-muted-foreground mb-2">
            Based on active gaps in governance and strategic alignment, these resources are surfaced for you:
          </p>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.filter(t => t.diagnosticTag).map(t => (
              <button key={t.id} onClick={() => setActiveTemplate(t)}
                className="text-xs px-2.5 py-1 rounded-lg border font-medium transition-all hover:opacity-90"
                style={{ borderColor: "hsl(var(--signal-yellow) / 0.5)", color: "hsl(var(--signal-yellow))", background: "hsl(var(--signal-yellow) / 0.08)" }}>
                {t.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border-2 bg-card text-foreground focus:outline-none transition-all"
            style={{ borderColor: "hsl(var(--border))" }}
            placeholder="Search templates, SOPs, or lessons…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          {DEPTS.map(d => {
            const Icon = DEPT_ICONS[d] || Building2;
            return (
              <button key={d} onClick={() => setDeptFilter(d)}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border font-medium whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  borderColor: deptFilter === d ? "hsl(var(--electric-blue))" : "hsl(var(--border))",
                  background: deptFilter === d ? "hsl(var(--electric-blue) / 0.1)" : "transparent",
                  color: deptFilter === d ? "hsl(var(--electric-blue))" : "hsl(var(--muted-foreground))",
                }}>
                <Icon className="w-3 h-3" />{d}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 border-b-2 border-border">
        {TABS.map(({ key, label, icon: Icon, count }) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn("flex items-center gap-2 text-sm px-4 py-2.5 font-medium transition-all border-b-2 -mb-0.5",
              tab === key ? "border-electric-blue text-electric-blue" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
            <Icon className="w-3.5 h-3.5" />{label}
            {count > 0 && (
              <span className="text-[10px] font-mono px-1 rounded"
                style={{ background: tab === key ? "hsl(var(--electric-blue) / 0.12)" : "hsl(var(--muted))", color: "inherit" }}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TEMPLATES TAB ── */}
      {tab === "templates" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-muted-foreground font-mono">{filteredTemplates.length} templates · click to populate</span>
            <span className="text-xs text-muted-foreground">Free templates available — Tier 1+ unlocks all</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTemplates.map(tmpl => {
              const locked = tmpl.tier !== "free";
              return (
                <div key={tmpl.id}
                  className={cn("bg-card rounded-xl border-2 border-border shadow-card p-4 flex flex-col gap-3 relative group transition-all",
                    locked ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:shadow-elevated hover:border-electric-blue/30"
                  )}
                  onClick={() => !locked && setActiveTemplate(tmpl)}>
                  {locked && (
                    <div className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      style={{ background: "hsl(var(--card) / 0.92)" }}>
                      <div className="text-center px-4">
                        <Lock className="w-6 h-6 mx-auto mb-2" style={{ color: "hsl(var(--teal))" }} />
                        <p className="text-xs font-semibold text-foreground">Requires {TIER_LABEL[tmpl.tier]}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                      style={{ background: `${CATEGORY_COLORS[tmpl.category]}18`, color: CATEGORY_COLORS[tmpl.category] }}>
                      {tmpl.category}
                    </span>
                    <TierBadge tier={tmpl.tier} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-snug mb-1">{tmpl.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{tmpl.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-2"
                    style={{ borderTop: "1px solid hsl(var(--border))" }}>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <BookOpen className="w-3 h-3" />{tmpl.pages}p
                      <span className="opacity-40">·</span>{tmpl.framework}
                    </div>
                    {!locked && (
                      <div className="flex items-center gap-1 text-[10px] font-semibold transition-all"
                        style={{ color: "hsl(var(--electric-blue))" }}>
                        <Edit3 className="w-3 h-3" /> Open & Fill
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── DOCUMENTS TAB ── */}
      {tab === "documents" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-muted-foreground font-mono">{savedDocuments.length} saved document{savedDocuments.length !== 1 ? "s" : ""}</span>
            <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all"
              style={{ borderColor: "hsl(var(--electric-blue) / 0.3)", color: "hsl(var(--electric-blue))", background: "hsl(var(--electric-blue) / 0.07)" }}
              onClick={() => setTab("templates")}>
              <Plus className="w-3 h-3" /> New from Template
            </button>
          </div>

          {savedDocuments.length === 0 ? (
            <div className="py-16 text-center">
              <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-20 text-muted-foreground" />
              <p className="text-sm font-semibold text-muted-foreground mb-1">No saved documents yet</p>
              <p className="text-xs text-muted-foreground mb-4">Open a template, fill it in, and save it here.</p>
              <button onClick={() => setTab("templates")}
                className="text-xs px-4 py-2 rounded-lg font-semibold"
                style={{ background: "hsl(var(--electric-blue))", color: "white" }}>
                Browse Templates
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedDocuments.map(doc => (
                <div key={doc.id}
                  className="bg-card rounded-xl border-2 border-border overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}>
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(var(--electric-blue))" }} />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{doc.templateTitle}</p>
                        <p className="text-[10px] text-muted-foreground">Saved {doc.savedAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => downloadDocument(doc)}
                        title="Download as .txt"
                        className="text-[10px] px-2 py-1 rounded-md border font-medium flex items-center gap-1 transition-colors hover:bg-muted"
                        style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                        <Download className="w-3 h-3" />
                      </button>
                      <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", expandedDoc === doc.id && "rotate-90")} />
                    </div>
                  </button>
                  {expandedDoc === doc.id && (
                    <div className="px-5 pb-4 border-t" style={{ borderColor: "hsl(var(--border))" }}>
                      <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(doc.data).filter(([, v]) => v).map(([k, v]) => (
                          <div key={k}>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">{k.replace(/_/g, " ")}</p>
                            <p className="text-xs text-foreground">{v}</p>
                          </div>
                        ))}
                        {Object.values(doc.data).filter(Boolean).length === 0 && (
                          <p className="text-xs text-muted-foreground col-span-2">No fields were filled in.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SOP LIBRARY TAB ── */}
      {tab === "sops" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-muted-foreground font-mono">{filteredSOPs.length} SOPs · click to view steps</span>
            <button className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border font-semibold transition-all"
              style={{ borderColor: "hsl(var(--electric-blue) / 0.3)", color: "hsl(var(--electric-blue))", background: "hsl(var(--electric-blue) / 0.07)" }}>
              <Upload className="w-3.5 h-3.5" /> Upload SOP
            </button>
          </div>
          <div className="space-y-3">
            {filteredSOPs.map(sop => (
              <div key={sop.id} className="bg-card rounded-xl border-2 border-border overflow-hidden transition-all">
                <button
                  className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-muted/20 transition-colors"
                  onClick={() => setExpandedSop(expandedSop === sop.id ? null : sop.id)}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "hsl(var(--teal) / 0.12)" }}>
                      <BookMarked className="w-4 h-4" style={{ color: "hsl(var(--teal))" }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{sop.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <span>{sop.dept}</span>
                        <span className="opacity-40">·</span>
                        <span>{sop.framework}</span>
                        <span className="opacity-40">·</span>
                        <span>{sop.pages}p</span>
                        <span className="opacity-40">·</span>
                        <span>{sop.version}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                      style={{
                        background: sop.status === "active" ? "hsl(var(--signal-green) / 0.12)" : "hsl(var(--signal-yellow) / 0.12)",
                        color: sop.status === "active" ? "hsl(var(--signal-green))" : "hsl(var(--signal-yellow))",
                      }}>
                      {sop.status === "active" ? "Active" : "Needs Review"}
                    </span>
                    <span className="text-[10px] text-muted-foreground hidden sm:block">{sop.lastUpdated}</span>
                    <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", expandedSop === sop.id && "rotate-180")} />
                  </div>
                </button>
                {expandedSop === sop.id && (
                  <div className="border-t" style={{ borderColor: "hsl(var(--border))" }}>
                    <div className="px-5 py-4 space-y-0">
                      {sop.steps.map((step, i) => (
                        <div key={step.n} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                              style={{ background: "hsl(var(--teal) / 0.15)", color: "hsl(var(--teal))", border: "1.5px solid hsl(var(--teal) / 0.3)" }}>
                              {step.n}
                            </div>
                            {i < sop.steps.length - 1 && (
                              <div className="w-px flex-1 my-1.5" style={{ background: "hsl(var(--border))" }} />
                            )}
                          </div>
                          <div className="pb-4 flex-1">
                            <p className="text-xs font-bold text-foreground mb-0.5">{step.title}</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">{step.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── LESSONS LEARNED TAB ── */}
      {tab === "lessons" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-muted-foreground font-mono">{userLessons.length + LESSONS.length} lessons captured</span>
            <button
              onClick={() => setShowAddLesson(v => !v)}
              className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border font-semibold transition-all"
              style={{ borderColor: "hsl(var(--electric-blue) / 0.3)", color: "hsl(var(--electric-blue))", background: "hsl(var(--electric-blue) / 0.07)" }}>
              <Plus className="w-3.5 h-3.5" /> Add Lesson
            </button>
          </div>

          {showAddLesson && (
            <div className="mb-4 rounded-xl border-2 p-4 space-y-3"
              style={{ borderColor: "hsl(var(--electric-blue) / 0.4)", background: "hsl(var(--electric-blue) / 0.04)" }}>
              <p className="text-xs font-bold text-foreground">Log a New Lesson</p>
              <input
                className="w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground focus:outline-none"
                style={{ borderColor: "hsl(var(--border))" }}
                placeholder="Lesson title…"
                value={newLesson.title}
                onChange={e => setNewLesson(p => ({ ...p, title: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <select className="px-3 py-2 text-sm rounded-lg border bg-background text-foreground focus:outline-none"
                  style={{ borderColor: "hsl(var(--border))" }}
                  value={newLesson.outcome}
                  onChange={e => setNewLesson(p => ({ ...p, outcome: e.target.value as "positive" | "negative" }))}>
                  <option value="positive">Positive outcome</option>
                  <option value="negative">Negative outcome</option>
                </select>
                <select className="px-3 py-2 text-sm rounded-lg border bg-background text-foreground focus:outline-none"
                  style={{ borderColor: "hsl(var(--border))" }}
                  value={newLesson.impact}
                  onChange={e => setNewLesson(p => ({ ...p, impact: e.target.value as "High" | "Medium" }))}>
                  <option value="High">High impact</option>
                  <option value="Medium">Medium impact</option>
                </select>
              </div>
              <textarea
                className="w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground focus:outline-none resize-none"
                style={{ borderColor: "hsl(var(--border))" }}
                rows={3}
                placeholder="Summary — what happened and what was the fix or learning?"
                value={newLesson.summary}
                onChange={e => setNewLesson(p => ({ ...p, summary: e.target.value }))} />
              <input
                className="w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground focus:outline-none"
                style={{ borderColor: "hsl(var(--border))" }}
                placeholder="Tags (comma-separated): PMO, Risk, Finance…"
                value={newLesson.tags}
                onChange={e => setNewLesson(p => ({ ...p, tags: e.target.value }))} />
              <div className="flex gap-2">
                <button onClick={() => setShowAddLesson(false)}
                  className="text-xs px-3 py-2 rounded-lg border font-semibold text-muted-foreground"
                  style={{ borderColor: "hsl(var(--border))" }}>Cancel</button>
                <button onClick={handleAddLesson}
                  disabled={!newLesson.title.trim() || !newLesson.summary.trim()}
                  className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg font-semibold disabled:opacity-40"
                  style={{ background: "hsl(var(--electric-blue))", color: "white" }}>
                  <Save className="w-3 h-3" /> Save Lesson
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {[...userLessons, ...LESSONS].map(lesson => (
              <div key={lesson.id}
                className="bg-card rounded-xl border-2 border-border p-4 flex gap-4 hover:shadow-card transition-all">
                <div className="mt-0.5 flex-shrink-0">
                  {lesson.outcome === "positive"
                    ? <ThumbsUp className="w-4 h-4" style={{ color: "hsl(var(--signal-green))" }} />
                    : <AlertTriangle className="w-4 h-4" style={{ color: "hsl(var(--signal-red))" }} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground leading-snug">{lesson.title}</p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                        style={{
                          background: lesson.impact === "High" ? "hsl(var(--signal-red) / 0.12)" : "hsl(var(--signal-yellow) / 0.12)",
                          color: lesson.impact === "High" ? "hsl(var(--signal-red))" : "hsl(var(--signal-yellow))",
                        }}>
                        {lesson.impact} impact
                      </span>
                      <span className="text-[10px] text-muted-foreground">{lesson.date}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">{lesson.summary}</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {lesson.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                        style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FRAMEWORKS TAB ── */}
      {tab === "frameworks" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">
                Structured mapping of all frameworks embedded in the Command Center — their execution modules, outputs, temporal cadence, and inter-dependencies.
              </p>
            </div>
            <span className="text-xs font-mono text-muted-foreground">{PMO_FRAMEWORKS.length} frameworks indexed</span>
          </div>

          {/* System Chains Panel */}
          <div className="rounded-xl border-2 p-4 space-y-3"
            style={{ borderColor: "hsl(var(--electric-blue) / 0.3)", background: "hsl(var(--electric-blue) / 0.04)" }}>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4" style={{ color: "hsl(var(--electric-blue))" }} />
              <span className="text-xs font-bold text-foreground">System Chains — Bundled Framework Pipelines</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Frameworks that activate together to address a specific organizational challenge.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: "Operational Bottleneck Detection", chain: ["KPI Tree", "Control Charts (SPC)", "Theory of Constraints"], output: "Prioritized constraint fix list + KPI impact projection" },
                { name: "Strategic Alignment System", chain: ["Balanced Scorecard", "OKRs", "RACI Matrix"], output: "Cascaded objectives from exec → department → individual" },
                { name: "Execution Governance Engine", chain: ["PMBOK", "PRINCE2", "MOCHA"], output: "Stage-gated initiative control with clear accountability" },
                { name: "Continuous Improvement Loop", chain: ["Lean / Value Stream Mapping", "Six Sigma (DMAIC)", "PDCA (Deming)"], output: "Process waste eliminated + quality metrics improved" },
                { name: "Enterprise Risk Radar", chain: ["Risk Register (ISO 31000)", "COSO ERM", "Critical Chain (Goldratt)"], output: "Risk-weighted initiative prioritization + buffer plans" },
                { name: "Growth Intelligence Stack", chain: ["NPS / CSAT System", "MEDDIC", "Porter's Five Forces"], output: "Pipeline velocity + competitive moat analysis" },
              ].map(chain => (
                <div key={chain.name} className="rounded-lg border p-3 bg-card"
                  style={{ borderColor: "hsl(var(--border))" }}>
                  <div className="text-xs font-bold text-foreground mb-1.5">{chain.name}</div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {chain.chain.map((fw, i) => (
                      <span key={fw} className="inline-flex items-center gap-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                          style={{ background: "hsl(var(--electric-blue) / 0.12)", color: "hsl(var(--electric-blue))" }}>
                          {fw}
                        </span>
                        {i < chain.chain.length - 1 && <span className="text-muted-foreground text-[10px]">→</span>}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{chain.output}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Category filter */}
          {(() => {
            const cats = ["All", ...Array.from(new Set(PMO_FRAMEWORKS.map(f => f.category)))];
            return (
              <div className="flex flex-wrap gap-1.5">
                {cats.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFwCategoryFilter(cat)}
                    className="text-[11px] px-3 py-1.5 rounded-full font-semibold border transition-all"
                    style={fwCategoryFilter === cat ? {
                      background: "hsl(var(--electric-blue))", color: "white", borderColor: "hsl(var(--electric-blue))"
                    } : {
                      background: "transparent", color: "hsl(var(--muted-foreground))", borderColor: "hsl(var(--border))"
                    }}>
                    {cat}
                  </button>
                ))}
              </div>
            );
          })()}

          {/* Framework Table by Category */}
          {Array.from(new Set(PMO_FRAMEWORKS.map(f => f.category)))
            .filter(cat => fwCategoryFilter === "All" || cat === fwCategoryFilter)
            .map(category => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1" style={{ background: "hsl(var(--border))" }} />
                <span className="text-[11px] font-bold px-3 py-1 rounded-full"
                  style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>
                  {category}
                </span>
                <div className="h-px flex-1" style={{ background: "hsl(var(--border))" }} />
              </div>
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: "hsl(var(--muted))" }}>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground w-40">Framework</th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Execution Module</th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Outputs To</th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Status Relevance</th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Temporal Context</th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Dependencies</th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PMO_FRAMEWORKS.filter(f => f.category === category).map((fw, i) => (
                      <tr key={fw.name}
                        style={{ background: i % 2 === 0 ? "hsl(var(--card))" : "hsl(var(--muted) / 0.3)" }}>
                        <td className="px-3 py-2.5">
                          <span className="font-bold text-foreground">{fw.name}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {fw.executionModule.split(", ").map(m => (
                              <span key={m} className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                                style={{ background: "hsl(var(--electric-blue) / 0.1)", color: "hsl(var(--electric-blue))" }}>
                                {m}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">{fw.outputsTo}</td>
                        <td className="px-3 py-2.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                            style={{ background: "hsl(var(--teal) / 0.1)", color: "hsl(var(--teal))" }}>
                            {fw.statusRelevance}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground font-mono text-[10px]">{fw.temporalContext}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">{fw.dependencies}</td>
                        <td className="px-3 py-2.5 text-muted-foreground leading-relaxed">{fw.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── FORMULAS TAB ── */}
      {tab === "formulas" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Every calculation behind your Command Center — from org health scoring to financial modelling.
            </p>
            <span className="text-xs font-mono text-muted-foreground">
              {FORMULA_CATEGORIES.reduce((a, c) => a + c.formulas.length, 0)} formulas
            </span>
          </div>

          {FORMULA_CATEGORIES.map(cat => {
            const CatIcon = cat.icon;
            return (
              <div key={cat.id}>
                {/* Category header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${cat.color}18`, border: `1px solid ${cat.color}30` }}>
                    <CatIcon className="w-3.5 h-3.5" style={{ color: cat.color }} />
                  </div>
                  <span className="text-sm font-bold text-foreground">{cat.label}</span>
                  <div className="h-px flex-1" style={{ background: "hsl(var(--border))" }} />
                  <span className="text-[10px] font-mono text-muted-foreground">{cat.formulas.length} formula{cat.formulas.length !== 1 ? "s" : ""}</span>
                </div>

                {/* Formula cards */}
                <div className="space-y-2">
                  {cat.formulas.map(f => {
                    const isOpen = expandedFormula === f.id;
                    return (
                      <div key={f.id}
                        className="rounded-xl border-2 overflow-hidden transition-all"
                        style={{ borderColor: isOpen ? `${cat.color}40` : "hsl(var(--border))", background: "hsl(var(--card))" }}>
                        <button
                          className="w-full flex items-start justify-between gap-4 px-4 py-3 text-left hover:bg-muted/20 transition-colors"
                          onClick={() => setExpandedFormula(isOpen ? null : f.id)}>
                          <div className="flex items-start gap-3 min-w-0">
                            <code className="mt-0.5 text-xs font-mono font-bold px-2 py-0.5 rounded flex-shrink-0 whitespace-nowrap"
                              style={{ background: `${cat.color}12`, color: cat.color, border: `1px solid ${cat.color}25` }}>
                              {f.notation}
                            </code>
                            <div>
                              <p className="text-sm font-semibold text-foreground leading-snug">{f.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{f.description}</p>
                            </div>
                          </div>
                          <ChevronDown className={cn("w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5 transition-transform", isOpen && "rotate-180")} />
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 border-t space-y-3" style={{ borderColor: "hsl(var(--border))" }}>
                            <p className="text-xs text-muted-foreground leading-relaxed pt-3">{f.description}</p>

                            {f.variables && f.variables.length > 0 && (
                              <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Variables</p>
                                <div className="space-y-1">
                                  {f.variables.map(v => (
                                    <div key={v.symbol} className="flex items-start gap-3">
                                      <code className="text-xs font-mono font-bold flex-shrink-0 w-20"
                                        style={{ color: cat.color }}>
                                        {v.symbol}
                                      </code>
                                      <span className="text-xs text-muted-foreground">{v.meaning}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {f.example && (
                              <div className="rounded-lg p-3 space-y-1.5"
                                style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Example</p>
                                <p className="text-xs text-foreground font-mono">{f.example}</p>
                                {f.result && (
                                  <div className="flex items-center gap-2 pt-1" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                                    <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: cat.color }}>Result</span>
                                    <span className="text-xs font-mono font-bold text-foreground">{f.result}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
