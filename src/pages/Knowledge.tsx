import { useState } from "react";
import {
  BookOpen, FileText, Workflow, Lightbulb, Upload, Download,
  Search, Filter, ChevronRight, CheckCircle, Clock, Star,
  Building2, Target, Users, DollarSign, Shield, Cpu, BarChart3,
  Rocket, GitBranch, BookMarked, Plus, Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────
type TemplateCategory = "RACI" | "SOP" | "Charter" | "OKR" | "Review" | "MOCHA" | "Risk";
type Dept = "All" | "Executive" | "Finance" | "HR" | "Product" | "Operations" | "Sales" | "IT" | "Legal" | "Strategy";
type KnowledgeTab = "templates" | "workflows" | "uploads" | "lessons";

// ── Template data ──────────────────────────────────────────────────────
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
}

const TEMPLATES: Template[] = [
  { id: "t1", title: "RACI Matrix — Initiative Ownership", category: "RACI", dept: ["All"], description: "Define Responsible, Accountable, Consulted, and Informed roles across all initiative stakeholders.", pages: 2, framework: "PMO Standard", tier: "free" },
  { id: "t2", title: "MOCHA Assignment Sheet", category: "MOCHA", dept: ["All"], description: "Assign Manager, Owner, Consulted, Helper, and Approver for any project or decision.", pages: 1, framework: "MOCHA", tier: "free" },
  { id: "t3", title: "Project Charter Template", category: "Charter", dept: ["All"], description: "Formal project kick-off document covering scope, objectives, budget, and stakeholders.", pages: 4, framework: "PMO Standard", tier: "free" },
  { id: "t4", title: "Quarterly OKR Planning Sheet", category: "OKR", dept: ["All"], description: "Set Objectives and Key Results with owner assignments and scoring rubrics.", pages: 3, framework: "OKR", tier: "free" },
  { id: "t5", title: "Financial Close SOP", category: "SOP", dept: ["Finance"], description: "Step-by-step close process: journal entries, reconciliations, variance reporting, and sign-offs.", pages: 6, framework: "Lean", tier: "t1" },
  { id: "t6", title: "Risk Register & Escalation Matrix", category: "Risk", dept: ["All"], description: "Structured risk log with probability/impact scoring, owners, and escalation thresholds.", pages: 3, framework: "Six Sigma", tier: "free" },
  { id: "t7", title: "New Employee Onboarding SOP", category: "SOP", dept: ["HR"], description: "Full onboarding checklist from offer acceptance through 90-day milestone review.", pages: 5, framework: "PMO Standard", tier: "t1" },
  { id: "t8", title: "Weekly Executive Dashboard Template", category: "Review", dept: ["Executive"], description: "Pre-formatted weekly status report for executives: KPIs, risks, decisions needed.", pages: 2, framework: "BSC", tier: "t1" },
  { id: "t9", title: "Product Launch Checklist", category: "Charter", dept: ["Product"], description: "Go-to-market readiness checklist covering dev, QA, marketing, sales enablement, and support.", pages: 4, framework: "PMO Standard", tier: "t1" },
  { id: "t10", title: "Strategic Initiative Prioritization Matrix", category: "OKR", dept: ["Strategy", "Executive"], description: "Rank initiatives by impact, effort, risk, and strategic alignment to surface top priorities.", pages: 2, framework: "Rumelt", tier: "free" },
  { id: "t11", title: "Vendor Evaluation Scorecard", category: "Review", dept: ["Operations", "IT"], description: "Score vendors on capability, cost, risk, and strategic fit to support procurement decisions.", pages: 3, framework: "BSC", tier: "t1" },
  { id: "t12", title: "Sales Pipeline Review Template", category: "Review", dept: ["Sales"], description: "Structured pipeline review covering stage distribution, velocity, win rate, and next actions.", pages: 2, framework: "MEDDIC", tier: "t2" },
  { id: "t13", title: "IT Change Management SOP", category: "SOP", dept: ["IT"], description: "Change request, impact assessment, approval gate, rollout, and rollback procedures.", pages: 5, framework: "ITIL", tier: "t2" },
  { id: "t14", title: "Legal & Compliance Review Checklist", category: "SOP", dept: ["Legal"], description: "Pre-launch compliance checklist: privacy, contracts, regulatory, and risk sign-off.", pages: 4, framework: "PMO Standard", tier: "t2" },
];

// ── Workflow data ──────────────────────────────────────────────────────
interface Workflow {
  id: string;
  title: string;
  dept: Dept;
  steps: { label: string; owner: string; duration: string; gated: boolean }[];
  framework: string;
  tier: "free" | "t1" | "t2";
  description: string;
}

const WORKFLOWS: Workflow[] = [
  {
    id: "wf1", title: "New Initiative Intake & Approval",
    dept: "All", framework: "PMO Standard", tier: "free",
    description: "Structured intake process from idea submission to executive approval and resource allocation.",
    steps: [
      { label: "Submit initiative brief", owner: "Initiative Owner", duration: "1 day", gated: false },
      { label: "PMO review & scoring", owner: "PMO Lead", duration: "2 days", gated: true },
      { label: "Capacity check", owner: "Resource Manager", duration: "1 day", gated: false },
      { label: "Executive sign-off", owner: "Exec Sponsor", duration: "2 days", gated: true },
      { label: "Register & assign RACI", owner: "PMO Lead", duration: "1 day", gated: false },
    ],
  },
  {
    id: "wf2", title: "Monthly Financial Close Process",
    dept: "Finance", framework: "Lean", tier: "t1",
    description: "End-to-end close workflow with tiered approval authority and automated variance flags.",
    steps: [
      { label: "Sub-ledger closes (AP/AR)", owner: "Finance Manager", duration: "Day 1–2", gated: false },
      { label: "Journal entries & accruals", owner: "Accountant", duration: "Day 3", gated: false },
      { label: "Reconciliations", owner: "Finance Manager", duration: "Day 4–5", gated: true },
      { label: "Variance analysis", owner: "CFO", duration: "Day 6", gated: false },
      { label: "Board package & sign-off", owner: "CFO / CEO", duration: "Day 7", gated: true },
    ],
  },
  {
    id: "wf3", title: "Employee Onboarding (Day 1 → 90)",
    dept: "HR", framework: "PMO Standard", tier: "t1",
    description: "Structured 90-day onboarding journey with milestones, check-ins, and performance gates.",
    steps: [
      { label: "Pre-boarding: systems & access setup", owner: "IT + HR", duration: "Week -1", gated: false },
      { label: "Day 1 orientation", owner: "HR", duration: "Day 1", gated: false },
      { label: "30-day check-in & goal setting", owner: "Manager", duration: "Day 30", gated: true },
      { label: "60-day performance review", owner: "Manager + HR", duration: "Day 60", gated: true },
      { label: "90-day confirmation & OKR alignment", owner: "Exec + HR", duration: "Day 90", gated: true },
    ],
  },
  {
    id: "wf4", title: "Risk Escalation & Resolution",
    dept: "All", framework: "Six Sigma", tier: "free",
    description: "Standardized risk detection, severity scoring, escalation routing, and resolution tracking.",
    steps: [
      { label: "Risk identified & logged", owner: "Any team member", duration: "Same day", gated: false },
      { label: "Severity assessment", owner: "Dept Head", duration: "24 hrs", gated: false },
      { label: "Escalation routing (L1/L2/L3)", owner: "PMO / Exec", duration: "24 hrs", gated: true },
      { label: "Resolution plan assigned", owner: "Owner + PMO", duration: "48 hrs", gated: true },
      { label: "Closure & lessons captured", owner: "PMO Lead", duration: "Post-close", gated: false },
    ],
  },
  {
    id: "wf5", title: "Product Feature Launch",
    dept: "Product", framework: "PMO Standard", tier: "t1",
    description: "Cross-functional launch workflow from scoping through go-live and post-launch review.",
    steps: [
      { label: "Feature brief & business case", owner: "Product Manager", duration: "1 week", gated: true },
      { label: "Design + eng scoping", owner: "Design / Eng Lead", duration: "1 week", gated: false },
      { label: "Build & QA", owner: "Engineering", duration: "Sprint cycle", gated: false },
      { label: "GTM readiness gate", owner: "PMO + Marketing", duration: "1 week", gated: true },
      { label: "Launch & post-launch review", owner: "Product + CX", duration: "Week 1 post", gated: false },
    ],
  },
  {
    id: "wf6", title: "Strategic Planning Cycle (Annual)",
    dept: "Strategy", framework: "BSC / OKR", tier: "t2",
    description: "Full annual strategy cycle from environmental scan through OKR cascading and budget alignment.",
    steps: [
      { label: "Environmental scan & competitive analysis", owner: "Strategy", duration: "Month 1", gated: false },
      { label: "Strategic priorities workshop", owner: "Exec Team", duration: "Month 2", gated: true },
      { label: "Departmental OKR cascade", owner: "All Dept Heads", duration: "Month 3", gated: true },
      { label: "Budget alignment & resource allocation", owner: "CFO + PMO", duration: "Month 3–4", gated: true },
      { label: "Board presentation & approval", owner: "CEO / Board", duration: "Month 4", gated: true },
    ],
  },
];

// ── Lessons data ──────────────────────────────────────────────────────
const LESSONS = [
  { id: "l1", title: "Initiative Scope Creep Prevention", dept: "All", outcome: "positive", impact: "High", date: "2025-02", summary: "Adding explicit scope-freeze gates to the intake workflow reduced mid-initiative scope changes by 60%.", tags: ["PMO", "Scope", "Governance"] },
  { id: "l2", title: "Sales & Marketing OKR Misalignment", dept: "Sales", outcome: "negative", impact: "High", date: "2025-01", summary: "Siloed Q1 planning led to misaligned pipeline targets. Fix: joint OKR ownership between CMO and VP Sales.", tags: ["OKRs", "Alignment", "Sales"] },
  { id: "l3", title: "Financial Close 3-Day Reduction", dept: "Finance", outcome: "positive", impact: "Medium", date: "2024-12", summary: "Tiered approval authority ($50K / $200K / Board) removed 4 unnecessary handoff points, cutting close time by 3 days.", tags: ["Process", "Finance", "Lean"] },
  { id: "l4", title: "IT Provisioning Backlog Cleared", dept: "IT", outcome: "positive", impact: "Medium", date: "2024-11", summary: "Shifting to 60% planned / 40% reactive maintenance model resolved a 23-ticket backlog within 2 weeks.", tags: ["Capacity", "IT", "Lean"] },
  { id: "l5", title: "Talent Pipeline Failure (Q2)", dept: "HR", outcome: "negative", impact: "High", date: "2024-10", summary: "Over-reliance on a single job board channel left 4 critical roles unfilled for 67+ days. Fix: multi-channel sourcing strategy.", tags: ["Talent", "HR", "Risk"] },
];

// ── Helpers ──────────────────────────────────────────────────────────
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
    <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded font-semibold"
      style={{ color: TIER_COLOR[tier], background: `${TIER_COLOR[tier]}18`, border: `1px solid ${TIER_COLOR[tier]}35` }}>
      {locked && <Lock className="w-2.5 h-2.5" />}
      {TIER_LABEL[tier]}
    </span>
  );
}

// ── Main Component ───────────────────────────────────────────────────
export default function Knowledge() {
  const [tab, setTab] = useState<KnowledgeTab>("templates");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<Dept>("All");
  const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>("wf1");

  const DEPTS: Dept[] = ["All", "Executive", "Finance", "HR", "Product", "Operations", "Sales", "IT", "Legal", "Strategy"];
  const TABS = [
    { key: "templates" as KnowledgeTab, label: "Templates", icon: FileText },
    { key: "workflows" as KnowledgeTab, label: "Workflows", icon: Workflow },
    { key: "uploads" as KnowledgeTab, label: "SOP Library", icon: Upload },
    { key: "lessons" as KnowledgeTab, label: "Lessons Learned", icon: Lightbulb },
  ];

  const filteredTemplates = TEMPLATES.filter(t =>
    (deptFilter === "All" || t.dept.includes(deptFilter) || t.dept.includes("All")) &&
    (t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()))
  );
  const filteredWorkflows = WORKFLOWS.filter(w =>
    (deptFilter === "All" || w.dept === deptFilter || w.dept === "All") &&
    (w.title.toLowerCase().includes(search.toLowerCase()) || w.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-5 max-w-none">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold text-foreground">Knowledge Repository</h1>
            <span className="text-xs px-2 py-0.5 rounded font-semibold"
              style={{ background: "hsl(var(--teal) / 0.12)", color: "hsl(var(--teal))", border: "1px solid hsl(var(--teal) / 0.3)" }}>
              PMO-OPS
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Pre-built templates, operational workflows, SOP library, and institutional lessons — organized by department and framework.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border-2 font-semibold transition-all hover:opacity-90"
            style={{ borderColor: "hsl(var(--electric-blue) / 0.3)", color: "hsl(var(--electric-blue))", background: "hsl(var(--electric-blue) / 0.07)" }}>
            <Plus className="w-3.5 h-3.5" /> Add SOP
          </button>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border-2 bg-card text-foreground focus:outline-none transition-all"
            style={{ borderColor: "hsl(var(--border))" }}
            placeholder="Search templates, workflows, or SOPs..."
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
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn("flex items-center gap-2 text-sm px-4 py-2.5 font-medium transition-all border-b-2 -mb-0.5",
              tab === key ? "border-electric-blue text-electric-blue" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* ── TEMPLATES TAB ── */}
      {tab === "templates" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-muted-foreground font-mono">{filteredTemplates.length} templates</span>
            <span className="text-xs text-muted-foreground">Free templates available — Tier 1+ unlocks all</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTemplates.map(tmpl => {
              const locked = tmpl.tier !== "free";
              return (
                <div key={tmpl.id}
                  className="bg-card rounded-xl border-2 border-border shadow-card p-4 flex flex-col gap-3 relative group transition-all hover:shadow-elevated"
                  style={{ opacity: locked ? 0.75 : 1 }}>
                  {locked && (
                    <div className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      style={{ background: "hsl(var(--card) / 0.92)" }}>
                      <div className="text-center px-4">
                        <Lock className="w-5 h-5 mx-auto mb-1" style={{ color: TIER_COLOR[tmpl.tier] }} />
                        <p className="text-xs font-semibold text-foreground">Requires {TIER_LABEL[tmpl.tier]}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Upgrade to unlock all templates</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{ background: `${CATEGORY_COLORS[tmpl.category]}18`, color: CATEGORY_COLORS[tmpl.category], border: `1px solid ${CATEGORY_COLORS[tmpl.category]}35` }}>
                      {tmpl.category}
                    </span>
                    <TierBadge tier={tmpl.tier} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground mb-1 leading-snug">{tmpl.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{tmpl.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{tmpl.pages}p</span>
                      <span className="opacity-40">·</span>
                      <span>{tmpl.framework}</span>
                    </div>
                    <button
                      disabled={locked}
                      className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
                      style={{
                        background: locked ? "transparent" : "hsl(var(--electric-blue) / 0.1)",
                        color: locked ? "hsl(var(--muted-foreground))" : "hsl(var(--electric-blue))",
                        border: `1px solid ${locked ? "hsl(var(--border))" : "hsl(var(--electric-blue) / 0.3)"}`,
                        cursor: locked ? "not-allowed" : "pointer",
                      }}>
                      <Download className="w-3 h-3" />
                      {locked ? "Locked" : "Download"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── WORKFLOWS TAB ── */}
      {tab === "workflows" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-mono">{filteredWorkflows.length} workflows</span>
          </div>
          {filteredWorkflows.map(wf => {
            const locked = wf.tier !== "free";
            const isOpen = expandedWorkflow === wf.id;
            return (
              <div key={wf.id} className="bg-card rounded-xl border-2 border-border shadow-card overflow-hidden"
                style={{ opacity: locked ? 0.75 : 1 }}>
                <button className="w-full px-5 py-4 flex items-start gap-4 text-left hover:bg-secondary/30 transition-colors"
                  onClick={() => setExpandedWorkflow(isOpen ? null : wf.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{wf.title}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded text-muted-foreground bg-secondary border border-border">{wf.dept}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded border"
                        style={{ color: "hsl(var(--electric-blue))", background: "hsl(var(--electric-blue) / 0.08)", borderColor: "hsl(var(--electric-blue) / 0.25)" }}>
                        {wf.framework}
                      </span>
                      <TierBadge tier={wf.tier} />
                      {locked && <Lock className="w-3 h-3 text-muted-foreground" />}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{wf.description}</p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">{wf.steps.length} steps</span>
                    <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", isOpen && "rotate-90")} />
                  </div>
                </button>
                {isOpen && !locked && (
                  <div className="px-5 pb-5">
                    <div className="relative pl-5">
                      {/* Vertical rail */}
                      <div className="absolute left-2 top-2 bottom-2 w-0.5 rounded-full"
                        style={{ background: "hsl(var(--electric-blue) / 0.2)" }} />
                      {wf.steps.map((step, i) => (
                        <div key={i} className="relative flex items-start gap-4 mb-4 last:mb-0">
                          <div className="absolute -left-5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 z-10 text-white text-xs font-bold"
                            style={{ background: step.gated ? "hsl(var(--signal-yellow))" : "hsl(var(--electric-blue))" }}>
                            {i + 1}
                          </div>
                          <div className="bg-secondary rounded-lg px-3 py-2.5 flex-1 border border-border">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-sm font-medium text-foreground">{step.label}</span>
                              {step.gated && (
                                <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0 font-semibold"
                                  style={{ background: "hsl(var(--signal-yellow) / 0.12)", color: "hsl(var(--signal-yellow))", border: "1px solid hsl(var(--signal-yellow) / 0.3)" }}>
                                  Gate
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{step.owner}</span>
                              <span className="opacity-40">·</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{step.duration}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
                      <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all border"
                        style={{ color: "hsl(var(--electric-blue))", borderColor: "hsl(var(--electric-blue) / 0.3)", background: "hsl(var(--electric-blue) / 0.08)" }}>
                        <Download className="w-3 h-3" /> Export as PDF
                      </button>
                      <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all border border-border text-muted-foreground hover:text-foreground hover:bg-secondary">
                        <BookMarked className="w-3 h-3" /> Save to SOP Library
                      </button>
                    </div>
                  </div>
                )}
                {isOpen && locked && (
                  <div className="px-5 pb-5">
                    <div className="rounded-xl border-2 p-5 text-center"
                      style={{ borderColor: TIER_COLOR[wf.tier] + "40", background: `${TIER_COLOR[wf.tier]}08` }}>
                      <Lock className="w-5 h-5 mx-auto mb-2" style={{ color: TIER_COLOR[wf.tier] }} />
                      <p className="text-sm font-semibold text-foreground mb-1">This workflow requires {TIER_LABEL[wf.tier]}</p>
                      <p className="text-xs text-muted-foreground">Upgrade to unlock step-by-step workflow guides with owner assignments, gates, and export options.</p>
                      <button className="mt-3 text-xs font-semibold px-4 py-2 rounded-lg border-2 transition-all"
                        style={{ borderColor: TIER_COLOR[wf.tier], color: TIER_COLOR[wf.tier], background: `${TIER_COLOR[wf.tier]}10` }}>
                        {wf.tier === "t2" ? "Start 7-Day Free Trial" : `Upgrade to ${TIER_LABEL[wf.tier]} — $${wf.tier === "t1" ? "29.99" : "49.99"}/mo`}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── SOP UPLOADS TAB ── */}
      {tab === "uploads" && (
        <div className="space-y-5">
          {/* Upload zone */}
          <div className="rounded-2xl border-2 border-dashed p-8 text-center transition-all hover:border-electric-blue/50 cursor-pointer"
            style={{ borderColor: "hsl(var(--electric-blue) / 0.3)", background: "hsl(var(--electric-blue) / 0.03)" }}>
            <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: "hsl(var(--electric-blue) / 0.5)" }} />
            <p className="text-sm font-semibold text-foreground mb-1">Upload SOPs, Templates, or Reference Docs</p>
            <p className="text-xs text-muted-foreground mb-3">PDF, DOCX, XLSX — max 20MB per file</p>
            <button className="text-xs font-semibold px-4 py-2 rounded-lg border-2 transition-all"
              style={{ borderColor: "hsl(var(--electric-blue) / 0.4)", color: "hsl(var(--electric-blue))", background: "hsl(var(--electric-blue) / 0.08)" }}>
              Choose Files
            </button>
            <p className="text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> File storage requires Lovable Cloud — connect backend to enable uploads
            </p>
          </div>
          {/* Placeholder SOP entries */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Existing SOP Records (from Admin)</div>
            {[
              { title: "Executive Leadership Charter", dept: "Executive", version: "v2.1", status: "Active", adherence: 91 },
              { title: "Q2 Financial Close Process", dept: "Finance", version: "v3.0", status: "Active", adherence: 88 },
              { title: "IT Change Management Protocol", dept: "IT", version: "v1.4", status: "Under Review", adherence: 76 },
              { title: "Sales Pipeline Qualification SOP", dept: "Sales", version: "v2.2", status: "Active", adherence: 69 },
              { title: "HR Onboarding Standard", dept: "HR", version: "v1.8", status: "Outdated", adherence: 54 },
            ].map(sop => (
              <div key={sop.title} className="bg-card rounded-xl border-2 border-border p-4 flex items-center gap-4">
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground">{sop.title}</span>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span>{sop.dept}</span><span className="opacity-30">·</span><span>{sop.version}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium",
                    sop.status === "Active" ? "text-signal-green bg-signal-green/10" :
                    sop.status === "Under Review" ? "text-signal-yellow bg-signal-yellow/10" :
                    "text-signal-red bg-signal-red/10"
                  )}>{sop.status}</span>
                  <span className={cn("text-xs font-mono font-bold",
                    sop.adherence >= 80 ? "text-signal-green" : sop.adherence >= 60 ? "text-signal-yellow" : "text-signal-red"
                  )}>{sop.adherence}%</span>
                  <button className="text-xs text-electric-blue hover:underline flex items-center gap-1">
                    <Download className="w-3 h-3" /> Export
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── LESSONS LEARNED TAB ── */}
      {tab === "lessons" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-mono">{LESSONS.length} lessons captured</span>
            <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border-2 transition-all"
              style={{ borderColor: "hsl(var(--teal) / 0.3)", color: "hsl(var(--teal))", background: "hsl(var(--teal) / 0.07)" }}>
              <Plus className="w-3 h-3" /> Log New Lesson
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LESSONS.map(l => (
              <div key={l.id} className="bg-card rounded-xl border-2 border-border shadow-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {l.outcome === "positive"
                      ? <CheckCircle className="w-4 h-4 text-signal-green flex-shrink-0" />
                      : <AlertIcon className="w-4 h-4 text-signal-red flex-shrink-0" />
                    }
                    <span className="text-sm font-semibold text-foreground leading-snug">{l.title}</span>
                  </div>
                  <span className={cn("text-xs px-1.5 py-0.5 rounded font-semibold flex-shrink-0",
                    l.impact === "High" ? "text-signal-red bg-signal-red/10" :
                    l.impact === "Medium" ? "text-signal-yellow bg-signal-yellow/10" :
                    "text-signal-green bg-signal-green/10"
                  )}>{l.impact}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{l.summary}</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {l.tags.map(tag => (
                      <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border">{tag}</span>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono flex-shrink-0 ml-2">{l.date}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border-2 border-dashed p-6 text-center"
            style={{ borderColor: "hsl(var(--teal) / 0.25)", background: "hsl(var(--teal) / 0.03)" }}>
            <Lightbulb className="w-6 h-6 mx-auto mb-2" style={{ color: "hsl(var(--teal) / 0.5)" }} />
            <p className="text-sm font-semibold text-foreground mb-1">Persistent Lessons Log</p>
            <p className="text-xs text-muted-foreground">Connect Lovable Cloud to save lessons with initiative linkage, full searchability, and contributor tracking.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// small helper component to avoid import issues
function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
