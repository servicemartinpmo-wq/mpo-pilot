import { insights, frameworks, initiatives, departments, actionItems, governanceLogs } from "@/lib/pmoData";
import { ScoreBadge, SignalDot } from "@/components/ScoreBadge";
import { cn } from "@/lib/utils";
import {
  Activity, AlertCircle, GitBranch, Layers, Target, Shield, Clock,
  CheckCircle, Eye, Zap, ChevronDown, ChevronUp, X, Users,
  ChevronRight, ArrowRightCircle, Database, Brain, Network, TrendingUp,
  FlaskConical, AlertTriangle, BarChart3, Cpu, ClipboardList, Building2, Search
} from "lucide-react";
import { useState, useMemo } from "react";
import type { InsightType } from "@/lib/pmoData";
import { getEngineState } from "@/lib/engine";
import type { DetectedSignal } from "@/lib/engine/signals";
import type { DiagnosisResult } from "@/lib/engine/diagnosis";
import { getFrameworksRunBy } from "@/lib/frameworkData";

// ── 4-Stage Pipeline ──
const pipeline = [
  { stage: "Signal Detection", icon: Activity, color: "text-electric-blue", bg: "bg-electric-blue/10", border: "border-electric-blue/30", count: insights.length, desc: "Capacity, delays, conflicts, dependency bottlenecks, misalignment, risk escalation" },
  { stage: "Diagnosis", icon: Layers, color: "text-teal", bg: "bg-teal/10", border: "border-teal/30", count: insights.filter(i => i.executivePriorityScore > 60).length, desc: "Root cause analysis via 7 embedded management analysis modules" },
  { stage: "Guidance", icon: Target, color: "text-signal-green", bg: "bg-signal-green/10", border: "border-signal-green/30", count: insights.filter(i => i.executivePriorityScore > 70).length, desc: "Actionable recommendations with owner assignment and resolution timeline" },
  { stage: "Structural Remedies", icon: GitBranch, color: "text-signal-yellow", bg: "bg-signal-yellow/10", border: "border-signal-yellow/30", count: insights.filter(i => i.executivePriorityScore > 80).length, desc: "Long-term improvement proposals: governance, process architecture, capability building" },
];

const clarityChecks = [
  { label: "Defined Outcome", status: "pass", note: "All 10 initiatives have defined KPIs", detail: "Across the portfolio, every initiative has at least 3 measurable KPIs tied to strategic pillars. Last audited 2025-03-01." },
  { label: "OKR Alignment", status: "warn", note: "Marketing Q2 OKRs misaligned with pipeline targets", detail: "Marketing's brand awareness allocation (68%) conflicts with the OKR demand-gen target. Historical pattern: this gap has been flagged in Q1 and Q3 of the prior year." },
  { label: "Scope Defined", status: "pass", note: "9/10 initiatives have scoped deliverables", detail: "INI-007 still lacks a formal scope document. All others have approved scope with change control." },
  { label: "Priority Coherence", status: "warn", note: "INI-007 priority conflicts with delivery capacity", detail: "Program Delivery is at 94% capacity. Adding INI-007 without deferral creates WIP accumulation." },
  { label: "Strategic Pillar Coverage", status: "pass", note: "5 strategic pillars covered across portfolio", detail: "Revenue Acceleration (3), Operational Excellence (2), Customer Experience (2), Technology Modernization (2), Talent & Culture (1). Balanced distribution confirmed." },
];

const integrityChecks = [
  { label: "Single Accountable Owner", status: "pass", note: "All 10 initiatives have a designated owner", detail: "Accountability ownership is confirmed for all active initiatives." },
  { label: "Approval Authority Defined", status: "warn", note: "3 initiatives lack board-level approval thresholds", detail: "INI-002, INI-005, INI-009 have no documented board approval threshold." },
  { label: "Risk Register Active", status: "pass", note: "7/10 initiatives have documented risk registers", detail: "INI-001, INI-002, INI-003 have comprehensive risk registers updated weekly." },
  { label: "Accountability Assigned", status: "pass", note: "All active initiatives have accountability matrices defined", detail: "Full accountability clarity across the portfolio since Q4 rollout." },
  { label: "Escalation Path Defined", status: "warn", note: "2 initiatives lack documented escalation triggers", detail: "INI-006 and INI-009 have no defined escalation thresholds. Un-escalated blockers average 11 extra days to resolve." },
];

type FilterType = InsightType | "All";

// Signal severity color helpers
const severityColor = (s: DetectedSignal["severity"]) =>
  s === "Critical" ? "text-signal-red bg-signal-red/10 border-signal-red/30" :
  s === "High" ? "text-signal-yellow bg-signal-yellow/10 border-signal-yellow/30" :
  s === "Medium" ? "text-electric-blue bg-electric-blue/10 border-electric-blue/30" :
  "text-signal-green bg-signal-green/10 border-signal-green/30";

const severityDot = (s: DetectedSignal["severity"]) =>
  s === "Critical" ? "bg-signal-red" :
  s === "High" ? "bg-signal-yellow" :
  s === "Medium" ? "bg-electric-blue" : "bg-signal-green";

type AuditType = "internal" | "external";
type AuditStatus = "idle" | "selecting" | "running" | "complete";

interface AuditFinding {
  area: string;
  status: "pass" | "warn" | "fail";
  finding: string;
  recommendation: string;
  source: string;
}

const EXTERNAL_AUDIT_AREAS: AuditFinding[] = [
  { area: "Financial Controls", status: "warn", finding: "Budget approval thresholds exceed single-signatory limits on 3 initiatives", recommendation: "Implement dual-control approval for expenditures >$50K", source: "SOX Section 302/404" },
  { area: "Risk Register Compliance", status: "pass", finding: "7/10 initiatives have documented, active risk registers", recommendation: "Extend to all initiatives — INI-001, INI-002, INI-003 remain undocumented", source: "ISO 31000:2018" },
  { area: "Governance Documentation", status: "warn", finding: "3 initiatives lack board-level approval thresholds", recommendation: "Define escalation thresholds for all capital commitments", source: "COSO ERM Framework" },
  { area: "Policy Adherence", status: "pass", finding: "Operational policies reviewed and current across 8/9 departments", recommendation: "Refresh Technology policy — last reviewed 14 months ago", source: "ISO 9001:2015" },
  { area: "Audit Trail Integrity", status: "pass", finding: "Governance log entries present for all major decisions", recommendation: "Introduce automated timestamping for decision log entries", source: "SOX Audit Trail Requirements" },
  { area: "Segregation of Duties", status: "fail", finding: "2 departments lack segregation between approver and executor roles", recommendation: "Immediate role separation required for Program Delivery and Finance", source: "COSO Internal Control Framework" },
  { area: "Regulatory Alignment", status: "warn", finding: "GDPR data handling review overdue by 60 days", recommendation: "Schedule immediate data privacy audit with DPO", source: "GDPR Article 35" },
  { area: "Compliance Reporting", status: "pass", finding: "Board reports issued quarterly with no missed cycles", recommendation: "Add risk register summary to board pack for completeness", source: "OECD Corporate Governance Principles" },
];

const INTERNAL_AUDIT_AREAS: AuditFinding[] = [
  { area: "Strategic Alignment", status: "warn", finding: "Marketing Q2 OKRs misaligned with pipeline targets (68% brand vs 45% demand-gen)", recommendation: "Realign Marketing OKRs in next sprint planning cycle", source: "Balanced Scorecard (Kaplan & Norton)" },
  { area: "Initiative Health", status: "warn", finding: "INI-007 at 94% capacity load with no deferral plan in place", recommendation: "Pause or rescope INI-007 until Program Delivery capacity drops below 80%", source: "PMBOK Resource Management" },
  { area: "Execution Discipline", status: "fail", finding: "Average action item close rate: 61% — target is 80%", recommendation: "Introduce weekly action item review cadence with department leads", source: "Lean Execution (Womack & Jones)" },
  { area: "Capacity Utilization", status: "warn", finding: "Program Delivery at 94%, Technology at 87% — above sustainable threshold", recommendation: "Reallocate 2 FTEs from underutilized Customer Success (62%) to delivery", source: "Lean Workload Analysis" },
  { area: "Dependency Mapping", status: "pass", finding: "Critical dependencies mapped for 8/10 active initiatives", recommendation: "Complete dependency mapping for INI-004 and INI-009", source: "Critical Chain (Goldratt)" },
  { area: "Process Adherence", status: "pass", finding: "Core operational processes documented and followed in 7/9 departments", recommendation: "Update Sales process SOPs to reflect new CRM workflow", source: "PDCA Cycle (Deming)" },
  { area: "Leadership Bandwidth", status: "warn", finding: "COO approval required for 14 items currently pending — creating bottleneck", recommendation: "Delegate Tier 3 decisions to department heads via updated authority matrix", source: "Span of Control Analysis (Galbraith)" },
  { area: "Knowledge Capture", status: "fail", finding: "No lessons-learned documentation in last 2 completed initiatives", recommendation: "Implement post-project retrospective template — mandatory for all closures", source: "Agile Retrospectives (Derby & Larsen)" },
  { area: "Communication Flows", status: "pass", finding: "Weekly status reports issued for all active Tier 1 initiatives", recommendation: "Extend to Tier 2 — currently only 40% have standing updates", source: "PMBOK Communications Management" },
  { area: "Maturity Progression", status: "warn", finding: "2 departments stuck at CMMI Level 2 for 3+ consecutive quarters", recommendation: "Assign improvement sponsor and 90-day maturity improvement plan", source: "CMMI Maturity Model" },
];

export default function Diagnostics() {
  const [typeFilter, setTypeFilter] = useState<FilterType>("All");
  const [govTab, setGovTab] = useState<"all" | "Risk" | "Decision" | "Change">("all");
  const [showSummary, setShowSummary] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<{ label: string; detail: string; status: string } | null>(null);
  const [engineTab, setEngineTab] = useState<"signals" | "diagnosis" | "frameworks" | "chains">("signals");
  const [expandedDiag, setExpandedDiag] = useState<string | null>(null);
  const [auditStatus, setAuditStatus] = useState<AuditStatus>("idle");
  const [auditType, setAuditType] = useState<AuditType | null>(null);
  const [auditProgress, setAuditProgress] = useState(0);
  const [auditFindings, setAuditFindings] = useState<AuditFinding[]>([]);

  // Run engine once (memoized)
  const engine = useMemo(() => getEngineState(), []);

  function startAudit(type: AuditType) {
    setAuditType(type);
    setAuditStatus("running");
    setAuditProgress(0);
    setAuditFindings([]);
    const findings = type === "external" ? EXTERNAL_AUDIT_AREAS : INTERNAL_AUDIT_AREAS;
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 8;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setAuditFindings(findings);
        setAuditStatus("complete");
      }
      setAuditProgress(Math.min(progress, 100));
    }, 220);
  }

  const auditPass = auditFindings.filter(f => f.status === "pass").length;
  const auditWarn = auditFindings.filter(f => f.status === "warn").length;
  const auditFail = auditFindings.filter(f => f.status === "fail").length;

  const insightTypes = [...new Set(insights.map(i => i.type))];
  const filtered = [...insights]
    .filter(i => typeFilter === "All" || i.type === typeFilter)
    .sort((a, b) => b.executivePriorityScore - a.executivePriorityScore);

  const filteredGovLogs = governanceLogs.filter(g => govTab === "all" || g.type === govTab);
  const openGovCount = governanceLogs.filter(g => g.status !== "Resolved").length;
  const goodSignals = insights.filter(i => i.signal === "green" || i.signal === "blue").length;
  const criticalSignals = insights.filter(i => i.signal === "red").length;
  const pendingActions = actionItems.filter(a => a.status !== "Completed").length;

  const diagnosticsFrameworks = getFrameworksRunBy("Diagnostics");

  return (
    <div className="p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground mb-0.5">Diagnostics</h1>
          <p className="text-sm text-muted-foreground">Signal detection · Root cause · Governance oversight · Framework engine</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowSummary(v => !v)}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border-2 border-electric-blue/40 text-electric-blue font-semibold hover:bg-electric-blue/8 transition-colors">
            <Zap className="w-3.5 h-3.5" />
            {showSummary ? "Hide" : "Show"} Summary
            {showSummary ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => setAuditStatus("selecting")}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border-2 border-teal/40 text-teal font-semibold hover:bg-teal/8 transition-colors">
            <ClipboardList className="w-3.5 h-3.5" />
            Full Org Audit
          </button>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-0.5">Open Items</div>
            <div className={cn("text-2xl font-bold font-mono", openGovCount > 4 ? "text-signal-red" : "text-signal-yellow")}>{openGovCount}</div>
          </div>
        </div>
      </div>

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

      {/* ── ENGINE INTELLIGENCE PANEL ── */}
      <div className="bg-card rounded-lg border-2 border-border shadow-card">
        <div className="px-4 py-3 border-b-2 border-border bg-secondary/60 rounded-t-lg flex flex-wrap items-center gap-2">
          <Brain className="w-4 h-4 text-electric-blue" />
          <h2 className="text-sm font-semibold text-foreground">Apphia Engine — Live Intelligence</h2>
          <div className="flex items-center gap-1.5 ml-2">
            <span className="w-2 h-2 rounded-full bg-signal-green animate-pulse" />
            <span className="text-xs text-signal-green font-medium">Running</span>
          </div>
          <div className="ml-auto flex gap-1">
            {([
              { key: "signals", label: "Signals", icon: Activity },
              { key: "diagnosis", label: "Diagnosis", icon: FlaskConical },
              { key: "frameworks", label: "Frameworks", icon: Database },
              { key: "chains", label: "System Chains", icon: Network },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setEngineTab(key)}
                className={cn("text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1",
                  engineTab === key
                    ? "bg-electric-blue/10 text-electric-blue border-electric-blue/40 font-medium"
                    : "bg-card text-muted-foreground border-border"
                )}>
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Signals Tab ── */}
        {engineTab === "signals" && (
          <div>
            {/* Stats row */}
            <div className="grid grid-cols-4 divide-x border-b border-border">
              {[
                { label: "Total Signals", value: engine.signals.length, color: "text-foreground" },
                { label: "Critical", value: engine.signals.filter(s => s.severity === "Critical").length, color: "text-signal-red" },
                { label: "High", value: engine.signals.filter(s => s.severity === "High").length, color: "text-signal-yellow" },
                { label: "Active Chains", value: engine.activeChains.length, color: "text-electric-blue" },
              ].map(stat => (
                <div key={stat.label} className="px-4 py-3 text-center">
                  <div className={cn("text-xl font-bold font-mono", stat.color)}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="divide-y max-h-80 overflow-y-auto">
              {engine.signals.map(sig => (
                <div key={sig.id} className="px-4 py-3 flex items-start gap-3 hover:bg-secondary/20 transition-colors">
                  <span className={cn("w-2 h-2 rounded-full flex-shrink-0 mt-1.5", severityDot(sig.severity))} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded border", severityColor(sig.severity))}>
                        {sig.severity}
                      </span>
                      <span className="text-xs font-medium text-foreground">{sig.title}</span>
                      <span className="text-xs text-muted-foreground">{sig.source}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{sig.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {sig.recommendedFrameworks.slice(0, 3).map(fw => (
                        <span key={fw} className="text-xs px-1.5 py-0.5 bg-electric-blue/8 text-electric-blue rounded border border-electric-blue/20">
                          {fw}
                        </span>
                      ))}
                      {sig.recommendedFrameworks.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{sig.recommendedFrameworks.length - 3} more</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={cn("text-lg font-bold font-mono",
                      sig.score >= 85 ? "text-signal-red" : sig.score >= 70 ? "text-signal-yellow" : "text-signal-green"
                    )}>{sig.score}</div>
                    <div className="text-xs text-muted-foreground">score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Diagnosis Tab ── */}
        {engineTab === "diagnosis" && (
          <div className="divide-y max-h-[480px] overflow-y-auto">
            {engine.diagnoses.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">No diagnoses generated yet.</div>
            )}
            {engine.diagnoses.map(diag => (
              <div key={diag.signalId} className="hover:bg-secondary/20 transition-colors">
                <button
                  className="w-full px-4 py-3 flex items-start gap-3 text-left"
                  onClick={() => setExpandedDiag(expandedDiag === diag.signalId ? null : diag.signalId)}
                >
                  <FlaskConical className="w-4 h-4 text-teal mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-foreground">{diag.rootCause}</span>
                      <span className="text-xs px-1.5 py-0.5 bg-teal/10 text-teal border border-teal/30 rounded">
                        {diag.signalCategory}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {diag.firedFrameworks.length} frameworks fired
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{diag.rootCauseDescription}</p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-electric-blue">{diag.confidence}%</div>
                      <div className="text-xs text-muted-foreground">confidence</div>
                    </div>
                    <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform",
                      expandedDiag === diag.signalId && "rotate-90")} />
                  </div>
                </button>

                {expandedDiag === diag.signalId && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border/50 bg-secondary/10">
                    <div className="pt-3">
                      <div className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Framework Findings</div>
                      <div className="space-y-2">
                        {diag.frameworkFindings.map(ff => (
                          <div key={ff.frameworkId} className="bg-card rounded-lg p-3 border border-border">
                            <div className="flex items-center gap-2 mb-1">
                              <Database className="w-3.5 h-3.5 text-electric-blue" />
                              <span className="text-xs font-semibold text-foreground">{ff.frameworkName}</span>
                              <span className={cn("text-xs px-1.5 py-0.5 rounded border ml-auto",
                                ff.severity === "Critical" ? "text-signal-red bg-signal-red/10 border-signal-red/30" :
                                ff.severity === "High" ? "text-signal-yellow bg-signal-yellow/10 border-signal-yellow/30" :
                                "text-electric-blue bg-electric-blue/10 border-electric-blue/30"
                              )}>{ff.severity}</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{ff.finding}</p>
                            <div className="flex gap-1 mt-1.5">
                              {ff.outputsTo.map(m => (
                                <span key={m} className="text-xs px-1 py-0.5 bg-secondary rounded text-muted-foreground">→ {m}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-card rounded-lg p-3 border border-border">
                        <div className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                          <ArrowRightCircle className="w-3.5 h-3.5 text-signal-green" />
                          Advisory Triggers
                        </div>
                        {diag.advisoryTriggers.map(t => (
                          <div key={t} className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                            <span className="w-1 h-1 rounded-full bg-signal-green" />
                            {t}
                          </div>
                        ))}
                      </div>
                      <div className="bg-card rounded-lg p-3 border border-border">
                        <div className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-signal-yellow" />
                          Structural Flags
                        </div>
                        {diag.structuralFlags.map(f => (
                          <div key={f} className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                            <span className="w-1 h-1 rounded-full bg-signal-yellow" />
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Frameworks Tab ── */}
        {engineTab === "frameworks" && (
          <div>
            <div className="px-4 py-2.5 border-b border-border bg-secondary/30">
              <p className="text-xs text-muted-foreground">
                {diagnosticsFrameworks.length} frameworks assigned to Diagnostics module ·
                Fires on signal detection · Outputs to Dashboard, Reports, Initiatives
              </p>
            </div>
            <div className="divide-y max-h-80 overflow-y-auto">
              {diagnosticsFrameworks.map(fw => (
                <div key={fw.id} className="px-4 py-3 hover:bg-secondary/20 transition-colors">
                  <div className="flex items-start gap-3">
                    <Database className="w-3.5 h-3.5 text-electric-blue mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-foreground">{fw.name}</span>
                        <span className="text-xs px-1.5 py-0.5 bg-secondary rounded text-muted-foreground">{fw.domain}</span>
                        <span className="text-xs px-1.5 py-0.5 bg-electric-blue/8 text-electric-blue rounded border border-electric-blue/20">{fw.temporalContext}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{fw.statusRelevance}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {fw.outputsTo.map(m => (
                          <span key={m} className="text-xs px-1 py-0.5 bg-secondary rounded text-muted-foreground border border-border">→ {m}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── System Chains Tab ── */}
        {engineTab === "chains" && (
          <div>
            <div className="px-4 py-2.5 border-b border-border bg-secondary/30">
              <p className="text-xs text-muted-foreground">
                {engine.activeChains.length} chains active · Last full engine run: {new Date(engine.orgHealth.updatedAt).toLocaleTimeString()}
              </p>
            </div>
            <div className="divide-y max-h-80 overflow-y-auto">
              {engine.activeChains.map(chainId => {
                const def = { "strategic-alignment": "Strategic Alignment System", "initiative-portfolio": "Initiative Portfolio Management", "project-delivery": "Project Delivery System", "operational-bottleneck": "Operational Bottleneck Detection", "operational-performance": "Operational Performance System", "org-structure": "Org Structure System", "risk-management": "Risk Management System", "resource-capacity": "Resource & Capacity System", "process-improvement": "Process Improvement System", "org-health-monitoring": "Org Health Monitoring System" }[chainId] || chainId;
                const chainSignals = engine.signals.filter(s => s.id.includes(chainId.split("-")[0]));
                const hasCritical = engine.signals.some(s => s.severity === "Critical");
                const status = hasCritical ? "Triggered" : "Active";
                return (
                  <div key={chainId} className="px-4 py-3 flex items-center gap-3 hover:bg-secondary/20 transition-colors">
                    <Cpu className="w-4 h-4 text-electric-blue flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-foreground">{def}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Monitoring {engine.signals.length} signals · {engine.recommendations.length} recommendations generated
                      </div>
                    </div>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium border",
                      status === "Triggered"
                        ? "text-signal-red bg-signal-red/10 border-signal-red/30"
                        : "text-signal-green bg-signal-green/10 border-signal-green/30"
                    )}>{status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Strategic Clarity + Structural Integrity ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border-2 border-border shadow-card">
          <div className="flex items-center gap-2 px-4 py-3 border-b-2 border-border bg-secondary/60 rounded-t-lg">
            <Target className="w-4 h-4 text-electric-blue" />
            <h2 className="text-sm font-semibold text-foreground">Strategic Clarity Check</h2>
            <span className="ml-auto text-xs text-muted-foreground">{clarityChecks.filter(c => c.status === "warn").length} items flagged</span>
          </div>
          <div className="divide-y max-h-72 overflow-y-auto">
            {clarityChecks.map(item => (
              <div key={item.label} className="px-4 py-3 hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => setSelectedCheck(item)}>
                <div className="flex items-start gap-3">
                  {item.status === "pass"
                    ? <CheckCircle className="w-3.5 h-3.5 text-signal-green mt-0.5 flex-shrink-0" />
                    : <AlertCircle className="w-3.5 h-3.5 text-signal-yellow mt-0.5 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground">{item.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.note}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg border-2 border-border shadow-card">
          <div className="flex items-center gap-2 px-4 py-3 border-b-2 border-border bg-secondary/60 rounded-t-lg">
            <Shield className="w-4 h-4 text-teal" />
            <h2 className="text-sm font-semibold text-foreground">Structural Integrity Check</h2>
            <span className="ml-auto text-xs text-muted-foreground">{integrityChecks.filter(c => c.status === "warn").length} items flagged</span>
          </div>
          <div className="divide-y max-h-72 overflow-y-auto">
            {integrityChecks.map(item => (
              <div key={item.label} className="px-4 py-3 hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => setSelectedCheck(item)}>
                <div className="flex items-start gap-3">
                  {item.status === "pass"
                    ? <CheckCircle className="w-3.5 h-3.5 text-signal-green mt-0.5 flex-shrink-0" />
                    : <AlertCircle className="w-3.5 h-3.5 text-signal-yellow mt-0.5 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground">{item.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.note}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Insight Signal Stream ── */}
      <div className="bg-card rounded-lg border-2 border-border shadow-card">
        <div className="px-4 py-3 border-b-2 border-border bg-secondary/60 rounded-t-lg flex flex-wrap items-center gap-2">
          <Activity className="w-4 h-4 text-electric-blue" />
          <h2 className="text-sm font-semibold text-foreground">Signal Stream</h2>
          <div className="ml-auto flex flex-wrap gap-1.5">
            <button onClick={() => setTypeFilter("All")}
              className={cn("text-xs px-2.5 py-1 rounded-full border transition-all",
                typeFilter === "All" ? "bg-electric-blue/10 text-electric-blue border-electric-blue/40 font-medium" : "bg-card text-muted-foreground border-border"
              )}>All</button>
            {insightTypes.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={cn("text-xs px-2.5 py-1 rounded-full border transition-all",
                  typeFilter === t ? "bg-electric-blue/10 text-electric-blue border-electric-blue/40 font-medium" : "bg-card text-muted-foreground border-border"
                )}>{t}</button>
            ))}
          </div>
        </div>
        <div className="divide-y">
          {filtered.map(ins => (
            <div key={ins.id} className="px-4 py-3 flex items-start gap-3 hover:bg-secondary/20 transition-colors">
              <SignalDot signal={ins.signal} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded border",
                    ins.signal === "red" ? "text-signal-red bg-signal-red/10 border-signal-red/30" :
                    ins.signal === "yellow" ? "text-signal-yellow bg-signal-yellow/10 border-signal-yellow/30" :
                    ins.signal === "green" ? "text-signal-green bg-signal-green/10 border-signal-green/30" :
                    "text-electric-blue bg-electric-blue/10 border-electric-blue/30"
                  )}>{ins.type}</span>
                  <span className="text-xs text-muted-foreground">{ins.department}</span>
                  <span className="text-xs text-muted-foreground">{ins.framework}</span>
                </div>
                <p className="text-sm text-foreground/80 leading-snug line-clamp-2">{ins.situation}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{ins.recommendation}</p>
              </div>
              <ScoreBadge score={ins.executivePriorityScore} signal={ins.signal} size="sm" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Advisory Recommendations from Engine ── */}
      {engine.recommendations.length > 0 && (
        <div className="bg-card rounded-lg border-2 border-border shadow-card">
          <div className="px-4 py-3 border-b-2 border-border bg-secondary/60 rounded-t-lg flex items-center gap-2">
            <Brain className="w-4 h-4 text-signal-green" />
            <h2 className="text-sm font-semibold text-foreground">Engine-Generated Recommendations</h2>
            <span className="ml-auto text-xs text-muted-foreground">{engine.recommendations.length} recommendations · {engine.generatedActions.length} actions created</span>
          </div>
          <div className="divide-y max-h-72 overflow-y-auto">
            {engine.recommendations.slice(0, 6).map(rec => (
              <div key={rec.id} className="px-4 py-3 hover:bg-secondary/20 transition-colors">
                <div className="flex items-start gap-3">
                  <ArrowRightCircle className={cn("w-4 h-4 flex-shrink-0 mt-0.5",
                    rec.priority === "Immediate" ? "text-signal-red" :
                    rec.priority === "This Week" ? "text-signal-yellow" : "text-signal-green"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded border",
                        rec.priority === "Immediate" ? "text-signal-red bg-signal-red/10 border-signal-red/30" :
                        rec.priority === "This Week" ? "text-signal-yellow bg-signal-yellow/10 border-signal-yellow/30" :
                        "text-signal-green bg-signal-green/10 border-signal-green/30"
                      )}>{rec.priority}</span>
                      <span className="text-xs font-semibold text-foreground">{rec.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{rec.action}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>Owner: {rec.owner}</span>
                      <span>→ {rec.timeToImpact}</span>
                      <span className="text-electric-blue">{rec.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Governance Log ── */}
      <div className="bg-card rounded-lg border-2 border-border shadow-card">
        <div className="px-4 py-3 border-b-2 border-border bg-secondary/60 flex flex-wrap items-center gap-2">
          <Shield className="w-4 h-4 text-signal-yellow" />
          <h2 className="text-sm font-semibold text-foreground">Governance & Risk Log</h2>
          <span className="ml-auto flex gap-1">
            {(["all", "Risk", "Decision", "Change"] as const).map(t => (
              <button key={t} onClick={() => setGovTab(t)}
                className={cn("text-xs px-2.5 py-1 rounded-full border transition-all",
                  govTab === t ? "bg-electric-blue/10 text-electric-blue border-electric-blue/40 font-medium" : "bg-card text-muted-foreground border-border"
                )}>{t === "all" ? "All" : t}</button>
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

      {/* ── Check detail drawer ── */}
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
            <div className="bg-secondary rounded-lg p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedCheck.detail}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
