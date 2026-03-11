import { useState } from "react";
import {
  BookOpen, FileText, Lightbulb, Upload, Download,
  Search, Filter, ChevronRight, CheckCircle, Star,
  Building2, Target, Users, DollarSign, Shield, Cpu, BarChart3,
  Rocket, BookMarked, Plus, Lock, Save, X, Edit3, FolderOpen,
  ThumbsUp, AlertTriangle, Sparkles, Layers, Database
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────
type TemplateCategory = "RACI" | "SOP" | "Charter" | "OKR" | "Review" | "MOCHA" | "Risk";
type Dept = "All" | "Executive" | "Finance" | "HR" | "Product" | "Operations" | "Sales" | "IT" | "Legal" | "Strategy";
type HubTab = "templates" | "documents" | "sops" | "lessons" | "frameworks";

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
  { id: "s1", title: "Quarterly Business Review Process", dept: "Executive", framework: "BSC", version: "v2.1", lastUpdated: "2025-01-15", status: "active", pages: 8 },
  { id: "s2", title: "Procurement & Vendor Approval", dept: "Operations", framework: "Lean", version: "v1.4", lastUpdated: "2024-12-03", status: "active", pages: 5 },
  { id: "s3", title: "Incident Response Playbook", dept: "IT", framework: "ITIL", version: "v3.0", lastUpdated: "2025-02-20", status: "active", pages: 12 },
  { id: "s4", title: "Performance Review Cycle", dept: "HR", framework: "PMO Standard", version: "v1.2", lastUpdated: "2024-11-08", status: "needs-review", pages: 6 },
  { id: "s5", title: "Customer Escalation Playbook", dept: "Sales", framework: "MEDDIC", version: "v2.0", lastUpdated: "2025-01-22", status: "active", pages: 4 },
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

  const DEPTS: Dept[] = ["All", "Executive", "Finance", "HR", "Product", "Operations", "Sales", "IT", "Legal", "Strategy"];
  const TABS = [
    { key: "templates" as HubTab, label: "Templates", icon: FileText, count: TEMPLATES.length },
    { key: "documents" as HubTab, label: "Documents", icon: FolderOpen, count: savedDocuments.length },
    { key: "sops" as HubTab, label: "SOP Library", icon: BookMarked, count: SOPS.length },
    { key: "lessons" as HubTab, label: "Lessons Learned", icon: Lightbulb, count: LESSONS.length },
    { key: "frameworks" as HubTab, label: "Frameworks", icon: Database, count: PMO_FRAMEWORKS.length },
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
                    <div className="flex items-center gap-2">
                      <button className="text-[10px] px-2 py-1 rounded-md border font-medium"
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
            <span className="text-xs text-muted-foreground font-mono">{filteredSOPs.length} SOPs · max 200 pages per upload</span>
            <button className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border font-semibold transition-all"
              style={{ borderColor: "hsl(var(--electric-blue) / 0.3)", color: "hsl(var(--electric-blue))", background: "hsl(var(--electric-blue) / 0.07)" }}>
              <Upload className="w-3.5 h-3.5" /> Upload SOP
            </button>
          </div>
          <div className="space-y-3">
            {filteredSOPs.map(sop => (
              <div key={sop.id}
                className="bg-card rounded-xl border-2 border-border p-4 flex items-center justify-between gap-4 hover:shadow-card transition-all">
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
                  <button className="p-1.5 rounded-lg border hover:bg-muted transition-colors"
                    style={{ borderColor: "hsl(var(--border))" }}>
                    <Download className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── LESSONS LEARNED TAB ── */}
      {tab === "lessons" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-muted-foreground font-mono">{LESSONS.length} lessons captured</span>
            <button className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border font-semibold"
              style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
              <Plus className="w-3.5 h-3.5" /> Add Lesson
            </button>
          </div>
          <div className="space-y-3">
            {LESSONS.map(lesson => (
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

          {/* Framework Table by Category */}
          {Array.from(new Set(PMO_FRAMEWORKS.map(f => f.category))).map(category => (
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
    </div>
  );
}
