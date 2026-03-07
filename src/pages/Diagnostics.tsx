import { insights, frameworks, initiatives, departments, actionItems, governanceLogs } from "@/lib/pmoData";
import { ScoreBadge, SignalDot } from "@/components/ScoreBadge";
import { cn } from "@/lib/utils";
import {
  Activity, AlertCircle, GitBranch, Layers, Target, Shield, Clock,
  CheckCircle, Eye, Zap, ChevronDown, ChevronUp, X, User, Users,
  ChevronRight, Flag, RefreshCw, Info, ArrowRightCircle
} from "lucide-react";
import { useState } from "react";
import type { InsightType } from "@/lib/pmoData";

// ── Status flag system ──
type DiagnosticStatus = "Flag for Review" | "Action Item" | "Reassigned" | "FYI" | "Ongoing";

const statusConfig: Record<DiagnosticStatus, { color: string; bg: string; border: string; icon: React.ElementType }> = {
  "Flag for Review": { color: "text-signal-orange", bg: "bg-signal-orange/10", border: "border-signal-orange/40", icon: Flag },
  "Action Item":     { color: "text-electric-blue", bg: "bg-electric-blue/10", border: "border-electric-blue/40", icon: ArrowRightCircle },
  "Reassigned":      { color: "text-signal-purple", bg: "bg-signal-purple/10", border: "border-signal-purple/40", icon: RefreshCw },
  "FYI":             { color: "text-muted-foreground", bg: "bg-secondary", border: "border-border", icon: Info },
  "Ongoing":         { color: "text-signal-yellow", bg: "bg-signal-yellow/10", border: "border-signal-yellow/40", icon: Clock },
};

// ── MOCHA role definitions ──
const mochaRoles = [
  { key: "M", label: "Manager", desc: "Supports and holds owner accountable. Reviews progress, asks probing questions, intervenes if off-track." },
  { key: "O", label: "Owner", desc: "Overall responsibility for driving the project. Ensures all work gets done. One owner only." },
  { key: "C", label: "Consulted", desc: "Provides input and perspective. May share resources or referrals." },
  { key: "H", label: "Helper", desc: "Implements aspects of the work. Actively contributes. May own a significant area (cascading MOCHA)." },
  { key: "A", label: "Approver", desc: "Signs off on the final product or key decisions." },
];

const pipeline = [
  {
    stage: "Signal Detection",
    icon: Activity,
    color: "text-electric-blue",
    bg: "bg-electric-blue/10",
    border: "border-electric-blue/30",
    count: insights.length,
    desc: "Capacity, delays, conflicts, dependency bottlenecks, misalignment, risk escalation",
  },
  {
    stage: "Diagnosis",
    icon: Layers,
    color: "text-teal",
    bg: "bg-teal/10",
    border: "border-teal/30",
    count: insights.filter((i) => i.executivePriorityScore > 60).length,
    desc: "Root cause analysis via 7 embedded management analysis modules",
  },
  {
    stage: "Advisory Guidance",
    icon: Target,
    color: "text-signal-green",
    bg: "bg-signal-green/10",
    border: "border-signal-green/30",
    count: insights.filter((i) => i.executivePriorityScore > 70).length,
    desc: "Actionable recommendations with owner assignment and resolution timeline",
  },
  {
    stage: "Structural Remedies",
    icon: GitBranch,
    color: "text-signal-yellow",
    bg: "bg-signal-yellow/10",
    border: "border-signal-yellow/30",
    count: insights.filter((i) => i.executivePriorityScore > 80).length,
    desc: "Long-term improvement proposals: governance, process architecture, capability building",
  },
];

// ── Column check items ──
const clarityChecks = [
  { label: "Defined Outcome", status: "pass", note: "All 10 initiatives have defined KPIs", detail: "Across the portfolio, every initiative has at least 3 measurable KPIs tied to strategic pillars. Last audited 2025-03-01. Pattern: consistent for 3 consecutive quarters." },
  { label: "OKR Alignment", status: "warn", note: "Marketing Q2 OKRs misaligned with pipeline targets", detail: "Marketing's brand awareness allocation (68%) conflicts with the OKR demand-gen target. Historical pattern: this gap has been flagged in Q1 and Q3 of the prior year." },
  { label: "Scope Defined", status: "pass", note: "9/10 initiatives have scoped deliverables", detail: "INI-007 still lacks a formal scope document. All others have approved scope with change control. Recommendation: resolve INI-007 scope by March 15." },
  { label: "Priority Coherence", status: "warn", note: "INI-007 priority conflicts with delivery capacity", detail: "Program Delivery is at 94% capacity. Adding INI-007 without deferral creates WIP accumulation. Context: this conflict emerged 3 weeks ago after Q1 sprint planning." },
  { label: "Strategic Pillar Coverage", status: "pass", note: "5 strategic pillars covered across portfolio", detail: "Revenue Acceleration (3), Operational Excellence (2), Customer Experience (2), Technology Modernization (2), Talent & Culture (1). Balanced distribution confirmed." },
];

const integrityChecks = [
  { label: "Single Accountable Owner", status: "pass", note: "All 10 initiatives have a designated owner", detail: "MOCHA ownership is confirmed for all active initiatives. Pattern: since implementing MOCHA in Q4, owner clarity improved from 60% to 100%." },
  { label: "Approval Authority Defined", status: "warn", note: "3 initiatives lack board-level approval thresholds", detail: "INI-002, INI-005, INI-009 have no documented board approval threshold. Risk: decisions may be made below required authority level." },
  { label: "Risk Register Active", status: "pass", note: "7/10 initiatives have documented risk registers", detail: "INI-001, INI-002, INI-003 have comprehensive risk registers updated weekly. 3 lower-priority initiatives are pending first review." },
  { label: "MOCHA Assigned", status: "pass", note: "All active initiatives have MOCHA matrices defined", detail: "Full MOCHA clarity across the portfolio since Q4 rollout. Average of 4.2 roles assigned per initiative." },
  { label: "Escalation Path Defined", status: "warn", note: "2 initiatives lack documented escalation triggers", detail: "INI-006 and INI-009 have no defined escalation thresholds. Historical data: un-escalated blockers average 11 extra days to resolve." },
];

type FilterType = InsightType | "All";

export default function Diagnostics() {
  const [typeFilter, setTypeFilter] = useState<FilterType>("All");
  const [govTab, setGovTab] = useState<"all" | "Risk" | "Decision" | "Change">("all");
  const [showSummary, setShowSummary] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<{ label: string; detail: string; status: string } | null>(null);
  const [itemStatuses, setItemStatuses] = useState<Record<string, DiagnosticStatus>>({});
  const [showMocha, setShowMocha] = useState(false);

  const insightTypes = [...new Set(insights.map((i) => i.type))];
  const filtered = [...insights]
    .filter((i) => typeFilter === "All" || i.type === typeFilter)
    .sort((a, b) => b.executivePriorityScore - a.executivePriorityScore);

  const filteredGovLogs = governanceLogs.filter(g => govTab === "all" || g.type === govTab);
  const openGovCount = governanceLogs.filter(g => g.status !== "Resolved").length;
  const goodSignals = insights.filter(i => i.signal === "green" || i.signal === "blue").length;
  const criticalSignals = insights.filter(i => i.signal === "red").length;
  const pendingActions = actionItems.filter(a => a.status !== "Completed").length;

  function setStatus(key: string, status: DiagnosticStatus) {
    setItemStatuses(prev => ({ ...prev, [key]: status }));
  }

  return (
    <div className="p-6 space-y-6">
      {/* ── Header row ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground mb-0.5">Diagnostics</h1>
          <p className="text-sm text-muted-foreground">Signal detection · Root cause · Governance oversight</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMocha(v => !v)}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border-2 border-teal/40 text-teal font-semibold hover:bg-teal/8 transition-colors"
          >
            <Users className="w-3.5 h-3.5" /> MOCHA
          </button>
          <button
            onClick={() => setShowSummary(v => !v)}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border-2 border-electric-blue/40 text-electric-blue font-semibold hover:bg-electric-blue/8 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            {showSummary ? "Hide" : "Summarize"} Status
            {showSummary ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-0.5">Open Items</div>
            <div className={cn("text-2xl font-bold font-mono", openGovCount > 4 ? "text-signal-red" : "text-signal-yellow")}>{openGovCount}</div>
          </div>
        </div>
      </div>

      {/* ── MOCHA Reference Panel ── */}
      {showMocha && (
        <div className="bg-card border-2 border-teal/30 rounded-xl p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-teal" />
            <h2 className="text-sm font-bold text-foreground">MOCHA Accountability Framework</h2>
            <button onClick={() => setShowMocha(false)} className="ml-auto p-1 rounded hover:bg-secondary transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {mochaRoles.map(r => (
              <div key={r.key} className="bg-secondary rounded-lg p-3">
                <div className="w-8 h-8 rounded-lg bg-teal/15 border border-teal/30 flex items-center justify-center text-sm font-bold text-teal mb-2">{r.key}</div>
                <div className="text-xs font-bold text-foreground mb-1">{r.label}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Summary Panel ── */}
      {showSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          <div className="bg-signal-green/8 border-2 border-signal-green/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-signal-green" />
              <span className="text-xs font-bold text-signal-green uppercase tracking-wide">What's Going Right</span>
            </div>
            <ul className="space-y-2">
              {[
                `${goodSignals} positive signals across all departments`,
                `${initiatives.filter(i => i.status === "On Track").length} initiatives currently on track`,
                `${actionItems.filter(a => a.status === "Completed").length} action items resolved`,
                `${departments.filter(d => d.maturityScore >= 70).length} departments at Managed or Optimized tier`,
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-signal-green mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-signal-red/8 border-2 border-signal-red/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-signal-red" />
              <span className="text-xs font-bold text-signal-red uppercase tracking-wide">What Needs Fixing</span>
            </div>
            <ul className="space-y-2">
              {[
                `${criticalSignals} critical alerts require immediate action`,
                `${initiatives.filter(i => i.status === "Blocked").length} initiatives need attention`,
                `${pendingActions} pending action items`,
                `${governanceLogs.filter(g => g.status === "Escalated").length} governance items escalated`,
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-signal-red mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── 4-Stage Pipeline ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {pipeline.map(({ stage, icon: Icon, color, bg, border, count, desc }) => (
          <div key={stage} className={cn("rounded-lg border p-4 shadow-card", bg, border)}>
            <div className={cn("flex items-center gap-2 mb-2", color)}>
              <Icon className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">{stage}</span>
            </div>
            <div className={cn("text-3xl font-bold font-mono mb-1", color)}>{count}</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* ── Side-by-side columns with scroll ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Strategic Clarity */}
        <div className="bg-card rounded-lg border-2 border-border shadow-card">
          <div className="flex items-center gap-2 px-4 py-3 border-b-2 border-border bg-secondary/60 rounded-t-lg">
            <Target className="w-4 h-4 text-electric-blue" />
            <h2 className="text-sm font-semibold text-foreground">Strategic Clarity Check</h2>
            <span className="ml-auto text-xs text-muted-foreground">{clarityChecks.filter(c => c.status === "warn").length} items flagged</span>
          </div>
          <div className="divide-y max-h-72 overflow-y-auto">
            {clarityChecks.map(item => {
              const statusFlag = itemStatuses[`clarity-${item.label}`];
              const SFIcon = statusFlag ? statusConfig[statusFlag].icon : null;
              return (
                <div
                  key={item.label}
                  className="px-4 py-3 hover:bg-secondary/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedCheck(item)}
                >
                  <div className="flex items-start gap-3">
                    {item.status === "pass"
                      ? <CheckCircle className="w-3.5 h-3.5 text-signal-green mt-0.5 flex-shrink-0" />
                      : <AlertCircle className="w-3.5 h-3.5 text-signal-yellow mt-0.5 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-foreground">{item.label}</span>
                        {statusFlag && (
                          <span className={cn("text-xs px-1.5 py-0.5 rounded border flex items-center gap-1", statusConfig[statusFlag].color, statusConfig[statusFlag].bg, statusConfig[statusFlag].border)}>
                            {SFIcon && <SFIcon className="w-3 h-3" />}{statusFlag}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{item.note}</div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                      <select
                        className="text-xs bg-secondary border border-border rounded px-1 py-0.5 text-muted-foreground"
                        value={statusFlag || ""}
                        onChange={e => setStatus(`clarity-${item.label}`, e.target.value as DiagnosticStatus)}
                        title="Set status flag"
                      >
                        <option value="">Flag</option>
                        {(Object.keys(statusConfig) as DiagnosticStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Structural Integrity */}
        <div className="bg-card rounded-lg border-2 border-border shadow-card">
          <div className="flex items-center gap-2 px-4 py-3 border-b-2 border-border bg-secondary/60 rounded-t-lg">
            <Shield className="w-4 h-4 text-teal" />
            <h2 className="text-sm font-semibold text-foreground">Structural Integrity Check</h2>
            <span className="ml-auto text-xs text-muted-foreground">{integrityChecks.filter(c => c.status === "warn").length} items flagged</span>
          </div>
          <div className="divide-y max-h-72 overflow-y-auto">
            {integrityChecks.map(item => {
              const statusFlag = itemStatuses[`integrity-${item.label}`];
              const SFIcon = statusFlag ? statusConfig[statusFlag].icon : null;
              return (
                <div
                  key={item.label}
                  className="px-4 py-3 hover:bg-secondary/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedCheck(item)}
                >
                  <div className="flex items-start gap-3">
                    {item.status === "pass"
                      ? <CheckCircle className="w-3.5 h-3.5 text-signal-green mt-0.5 flex-shrink-0" />
                      : <AlertCircle className="w-3.5 h-3.5 text-signal-yellow mt-0.5 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-foreground">{item.label}</span>
                        {statusFlag && (
                          <span className={cn("text-xs px-1.5 py-0.5 rounded border flex items-center gap-1", statusConfig[statusFlag].color, statusConfig[statusFlag].bg, statusConfig[statusFlag].border)}>
                            {SFIcon && <SFIcon className="w-3 h-3" />}{statusFlag}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{item.note}</div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                      <select
                        className="text-xs bg-secondary border border-border rounded px-1 py-0.5 text-muted-foreground"
                        value={statusFlag || ""}
                        onChange={e => setStatus(`integrity-${item.label}`, e.target.value as DiagnosticStatus)}
                        title="Set status flag"
                      >
                        <option value="">Flag</option>
                        {(Object.keys(statusConfig) as DiagnosticStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Status Color Key ── */}
      <div className="bg-card border-2 border-border rounded-xl p-4">
        <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-electric-blue" /> Status Flag Key
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(statusConfig) as [DiagnosticStatus, typeof statusConfig[DiagnosticStatus]][]).map(([label, cfg]) => {
            const Icon = cfg.icon;
            return (
              <div key={label} className={cn("flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border", cfg.color, cfg.bg, cfg.border)}>
                <Icon className="w-3 h-3" />
                <span className="font-medium">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Insight detail drawer ── */}
      {selectedCheck && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setSelectedCheck(null)} />
          <div className="relative w-full max-w-lg bg-card border-2 border-border rounded-2xl shadow-elevated p-6 m-4 animate-fade-in">
            <div className="flex items-start gap-3 mb-4">
              {selectedCheck.status === "pass"
                ? <CheckCircle className="w-5 h-5 text-signal-green mt-0.5 flex-shrink-0" />
                : <AlertCircle className="w-5 h-5 text-signal-yellow mt-0.5 flex-shrink-0" />}
              <div className="flex-1">
                <h3 className="text-sm font-bold text-foreground">{selectedCheck.label}</h3>
                <div className={cn("text-xs font-medium mt-0.5", selectedCheck.status === "pass" ? "text-signal-green" : "text-signal-yellow")}>
                  {selectedCheck.status === "pass" ? "Passing" : "Needs Attention"}
                </div>
              </div>
              <button onClick={() => setSelectedCheck(null)} className="p-1 rounded hover:bg-secondary">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="bg-secondary rounded-lg p-4 mb-4">
              <div className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-electric-blue" /> Contextual Intelligence
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedCheck.detail}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="text-xs font-semibold text-foreground mb-2 w-full">Assign Status Flag:</div>
              {(Object.keys(statusConfig) as DiagnosticStatus[]).map(s => {
                const Icon = statusConfig[s].icon;
                return (
                  <button
                    key={s}
                    onClick={() => { setStatus(`detail-${selectedCheck.label}`, s); setSelectedCheck(null); }}
                    className={cn("flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all hover:scale-105", statusConfig[s].color, statusConfig[s].bg, statusConfig[s].border)}
                  >
                    <Icon className="w-3 h-3" />{s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Analysis Module Summary ── */}
      <div className="bg-card rounded-lg border-2 border-border shadow-card">
        <div className="px-4 py-3 border-b-2 border-border flex items-center gap-2 bg-secondary/60">
          <Activity className="w-4 h-4 text-electric-blue" />
          <h2 className="text-sm font-semibold text-foreground">Analysis Module Summary</h2>
        </div>
        <div className="divide-y">
          {frameworks.map((fw) => (
            <div key={fw.id} className="px-4 py-3 flex items-start gap-4 hover:bg-secondary/20 transition-colors">
              <div className="w-44 flex-shrink-0">
                <div className="text-xs font-semibold text-foreground">{fw.name}</div>
                <div className="text-xs text-muted-foreground">{fw.expertDomain}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{fw.lastTriggered}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {fw.coverage.map((c) => (
                    <span key={c} className="text-xs bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">{c}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {fw.diagnosticFocus.map((f) => (
                    <span key={f} className="text-xs text-electric-blue/70 bg-electric-blue/5 border border-electric-blue/15 px-1.5 py-0.5 rounded">{f}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded",
                  fw.status === "Alerting" ? "text-signal-red bg-signal-red/10" :
                  fw.status === "Monitoring" ? "text-signal-yellow bg-signal-yellow/10" :
                  "text-signal-green bg-signal-green/10"
                )}>
                  {fw.status}
                </span>
                <span className="text-xs font-mono text-muted-foreground">{fw.activeInsights} insights</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Governance Log ── */}
      <div className="bg-card rounded-lg border-2 border-border shadow-card">
        <div className="px-4 py-3 border-b-2 border-border bg-secondary/60 flex flex-wrap items-center gap-2">
          <Shield className="w-4 h-4 text-signal-yellow" />
          <h2 className="text-sm font-semibold text-foreground">Governance & Risk Log</h2>
          <span className="ml-auto flex gap-1">
            {(["all", "Risk", "Decision", "Change"] as const).map(t => (
              <button key={t} onClick={() => setGovTab(t)}
                className={cn("text-xs px-2.5 py-1 rounded-full border transition-all",
                  govTab === t ? "bg-electric-blue/10 text-electric-blue border-electric-blue/40 font-medium" :
                  "bg-card text-muted-foreground border-border"
                )}>
                {t === "all" ? "All" : t}
              </button>
            ))}
          </span>
        </div>
        <div className="divide-y">
          {filteredGovLogs.map(log => {
            const relatedIni = initiatives.find(i => i.id === log.initiativeId);
            return (
              <div key={log.id} className="px-4 py-3 flex items-start gap-3 hover:bg-secondary/30 transition-colors">
                <div className="flex-shrink-0 mt-0.5">
                  {log.status === "Escalated" ? <AlertCircle className="w-4 h-4 text-signal-red" /> :
                   log.status === "Open" ? <Clock className="w-4 h-4 text-signal-yellow" /> :
                   log.status === "Resolved" ? <CheckCircle className="w-4 h-4 text-signal-green" /> :
                   <Activity className="w-4 h-4 text-electric-blue" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded border",
                      log.type === "Risk" ? "text-signal-red bg-signal-red/10 border-signal-red/30" :
                      log.type === "Decision" ? "text-electric-blue bg-electric-blue/10 border-electric-blue/30" :
                      "text-signal-yellow bg-signal-yellow/10 border-signal-yellow/30"
                    )}>{log.type}</span>
                    <span className="text-xs font-semibold text-foreground">{log.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">{log.notes}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    {relatedIni && <span className="text-electric-blue">{relatedIni.name}</span>}
                    <span>Owner: {log.owner}</span>
                    <span>{log.createdDate}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className={cn("text-xs font-mono font-bold",
                    log.severity >= 8 ? "text-signal-red" : log.severity >= 6 ? "text-signal-yellow" : "text-signal-green"
                  )}>{log.severity}/10</div>
                  <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium",
                    log.status === "Escalated" ? "text-signal-red bg-signal-red/10" :
                    log.status === "Open" ? "text-signal-yellow bg-signal-yellow/10" :
                    log.status === "In Review" ? "text-electric-blue bg-electric-blue/10" :
                    "text-signal-green bg-signal-green/10"
                  )}>{log.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
